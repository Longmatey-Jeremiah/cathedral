import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareNote, CareType, Prisma, UserRole } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { Paginated } from '../../common/dto/pagination.query.dto';
import { CareRepository } from './care.repository';
import { CreateCareNoteDto } from './dto/create-care-note.dto';
import { UpdateCareNoteDto } from './dto/update-care-note.dto';
import { CareNoteListQueryDto } from './dto/care-note-list.query.dto';

type NamedUser = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

function displayName(u: NamedUser): string {
  const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  return full || u.email;
}

/** One line of the body — enough for a table row, not the whole pastoral note. */
function excerpt(body: string): string {
  const firstLine = body.split('\n', 1)[0].trim();
  return firstLine.length > 140 ? `${firstLine.slice(0, 139)}…` : firstLine;
}

export interface CareNoteListItem {
  id: string;
  memberId: string;
  memberName: string;
  authorName: string;
  type: CareType;
  excerpt: string;
  confidential: boolean;
  followUpAt: Date | null;
  resolvedAt: Date | null;
  overdue: boolean;
  createdAt: Date;
}

@Injectable()
export class CareService {
  constructor(private readonly care: CareRepository) {}

  async create(
    dto: CreateCareNoteDto,
    actor: AuthenticatedUser,
  ): Promise<CareNote> {
    const churchId = this.requireChurch(actor);
    const found = await this.care.memberExistsInChurch(churchId, dto.memberId);
    if (found !== 1) {
      throw new BadRequestException('Member does not exist in this church');
    }

    return this.care.create({
      type: dto.type,
      body: dto.body,
      // Counselling is confidential unless explicitly opened up — the safe
      // default is the one that cannot leak by omission.
      confidential: dto.confidential ?? dto.type === CareType.COUNSEL,
      followUpAt: dto.followUpAt ?? null,
      church: { connect: { id: churchId } },
      member: { connect: { id: dto.memberId } },
      author: { connect: { id: actor.id } },
    });
  }

  async findAll(
    actor: AuthenticatedUser,
    query: CareNoteListQueryDto,
  ): Promise<Paginated<CareNoteListItem>> {
    if (!isSuperAdmin(actor) && !actor.churchId) {
      return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
    }

    const now = new Date();
    const where: Prisma.CareNoteWhereInput = {
      ...this.visibleWhere(actor),
      ...(query.memberId ? { memberId: query.memberId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...this.followUpWhere(query.followUp, now),
      ...(query.q ? { body: { contains: query.q, mode: 'insensitive' } } : {}),
    };

    const { rows, total } = await this.care.findPage(where, query);
    return {
      data: rows.map((r) => ({
        id: r.id,
        memberId: r.memberId,
        memberName: `${r.member.firstName} ${r.member.lastName}`,
        authorName: displayName(r.author),
        type: r.type,
        excerpt: excerpt(r.body),
        confidential: r.confidential,
        followUpAt: r.followUpAt,
        resolvedAt: r.resolvedAt,
        overdue: Boolean(
          r.followUpAt && !r.resolvedAt && r.followUpAt.getTime() < now.getTime(),
        ),
        createdAt: r.createdAt,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  /** Care dashboard counters, scoped to what this actor may see. */
  async summary(actor: AuthenticatedUser) {
    if (!isSuperAdmin(actor) && !actor.churchId) {
      return { overdue: 0, openFollowUps: 0, notesThisMonth: 0 };
    }
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.care.summarize(this.visibleWhere(actor), monthStart);
  }

  async findById(id: string, actor: AuthenticatedUser) {
    await this.getScoped(id, actor); // tenant + confidentiality check
    const detail = await this.care.findDetail(id);
    if (!detail) throw new NotFoundException('Care note not found');
    const { member, author, deletedAt: _deletedAt, ...note } = detail;
    return {
      ...note,
      member: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
      },
      author: { id: author.id, name: displayName(author) },
    };
  }

  async update(
    id: string,
    dto: UpdateCareNoteDto,
    actor: AuthenticatedUser,
  ): Promise<CareNote> {
    const note = await this.getScoped(id, actor);
    this.assertCanEdit(note, actor);

    return this.care.update(id, {
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.body !== undefined ? { body: dto.body } : {}),
      ...(dto.confidential !== undefined
        ? { confidential: dto.confidential }
        : {}),
      // Explicit null clears the follow-up; undefined leaves it untouched.
      ...(dto.followUpAt !== undefined ? { followUpAt: dto.followUpAt } : {}),
    });
  }

  /** Close out a follow-up. Idempotent-ish: re-resolving is a conflict. */
  async resolve(id: string, actor: AuthenticatedUser): Promise<CareNote> {
    const note = await this.getScoped(id, actor);
    if (!note.followUpAt) {
      throw new BadRequestException('This note has no follow-up to resolve');
    }
    if (note.resolvedAt) {
      throw new ConflictException('Follow-up is already resolved');
    }
    return this.care.update(id, { resolvedAt: new Date() });
  }

  async remove(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<{ success: true }> {
    const note = await this.getScoped(id, actor);
    this.assertCanEdit(note, actor);
    await this.care.softDelete(id); // soft delete, keeps the pastoral history
    return { success: true };
  }

  /**
   * The confidentiality rule, in one place. A confidential note is readable
   * only by an admin or its author — applied to every read path, including
   * list, summary and detail, so no endpoint can forget it.
   */
  private visibleWhere(actor: AuthenticatedUser): Prisma.CareNoteWhereInput {
    const base: Prisma.CareNoteWhereInput = {
      deletedAt: null,
      ...(isSuperAdmin(actor) ? {} : { churchId: actor.churchId! }),
    };
    if (this.isAdmin(actor)) return base;
    return {
      ...base,
      OR: [{ confidential: false }, { authorId: actor.id }],
    };
  }

  private followUpWhere(
    filter: CareNoteListQueryDto['followUp'],
    now: Date,
  ): Prisma.CareNoteWhereInput {
    if (filter === 'overdue') {
      return { resolvedAt: null, followUpAt: { lt: now } };
    }
    if (filter === 'open') {
      return { resolvedAt: null, followUpAt: { not: null } };
    }
    if (filter === 'resolved') return { resolvedAt: { not: null } };
    return {};
  }

  /** Anyone may log care; only the author or an admin may change a note. */
  private assertCanEdit(note: CareNote, actor: AuthenticatedUser): void {
    if (this.isAdmin(actor) || note.authorId === actor.id) return;
    throw new ForbiddenException('Only the author or an admin can change this note');
  }

  private async getScoped(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<CareNote> {
    const note = await this.care.findById(id);
    if (!note) throw new NotFoundException('Care note not found');
    if (!isSuperAdmin(actor) && note.churchId !== actor.churchId) {
      throw new NotFoundException('Care note not found');
    }
    // A confidential note the actor may not read is reported as missing, not
    // forbidden — "forbidden" would confirm the note exists.
    if (
      note.confidential &&
      !this.isAdmin(actor) &&
      note.authorId !== actor.id
    ) {
      throw new NotFoundException('Care note not found');
    }
    return note;
  }

  private isAdmin(actor: AuthenticatedUser): boolean {
    return actor.role === UserRole.ADMIN || isSuperAdmin(actor);
  }

  private requireChurch(actor: AuthenticatedUser): string {
    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    return actor.churchId;
  }
}
