import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceSession, AttendanceStatus, Prisma } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { Paginated } from '../../common/dto/pagination.query.dto';
import { AttendanceRepository } from './attendance.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { SessionListQueryDto } from './dto/session-list.query.dto';

type NamedUser = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

function displayName(u: NamedUser): string {
  const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  return full || u.email;
}

export interface SessionListItem {
  id: string;
  title: string;
  date: Date;
  status: AttendanceStatus;
  recordedBy: string;
  presentCount: number;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly attendance: AttendanceRepository) {}

  async createSession(
    dto: CreateSessionDto,
    actor: AuthenticatedUser,
  ): Promise<AttendanceSession> {
    const churchId = this.requireChurch(actor);
    return this.attendance.createSession({
      title: dto.title,
      date: dto.date,
      church: { connect: { id: churchId } },
      recordedBy: { connect: { id: actor.id } },
    });
  }

  async findAll(
    actor: AuthenticatedUser,
    query: SessionListQueryDto,
  ): Promise<Paginated<SessionListItem>> {
    if (!isSuperAdmin(actor) && !actor.churchId) {
      return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
    }

    const where: Prisma.AttendanceSessionWhereInput = {
      ...(isSuperAdmin(actor) ? {} : { churchId: actor.churchId! }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
    };

    const { rows, total } = await this.attendance.findSessionPage(where, query);
    return {
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.date,
        status: r.status,
        recordedBy: displayName(r.recordedBy),
        presentCount: r._count.records,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async findById(id: string, actor: AuthenticatedUser) {
    await this.getScoped(id, actor); // tenant check
    const detail = await this.attendance.findSessionDetail(id);
    if (!detail) throw new NotFoundException('Session not found');
    const { records, recordedBy, reviewedBy, ...session } = detail;
    return {
      ...session,
      recordedBy: { id: recordedBy.id, name: displayName(recordedBy) },
      reviewedBy: reviewedBy
        ? { id: reviewedBy.id, name: displayName(reviewedBy) }
        : null,
      present: records.map((r) => ({
        memberId: r.member.id,
        name: `${r.member.firstName} ${r.member.lastName}`,
        markedAt: r.markedAt,
      })),
    };
  }

  async update(
    id: string,
    dto: UpdateSessionDto,
    actor: AuthenticatedUser,
  ): Promise<AttendanceSession> {
    const session = await this.getScoped(id, actor);
    this.assertEditable(session);
    return this.attendance.updateSession(id, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.date !== undefined ? { date: dto.date } : {}),
    });
  }

  async mark(
    id: string,
    dto: MarkAttendanceDto,
    actor: AuthenticatedUser,
  ): Promise<{ success: true; presentCount: number }> {
    const session = await this.getScoped(id, actor);
    this.assertEditable(session);
    if (dto.memberIds.length) {
      const found = await this.attendance.countMembersInChurch(
        session.churchId,
        dto.memberIds,
      );
      if (found !== dto.memberIds.length) {
        throw new BadRequestException(
          'One or more members do not exist in this church',
        );
      }
    }
    await this.attendance.replaceRecords(id, dto.memberIds);
    return { success: true, presentCount: dto.memberIds.length };
  }

  /** DRAFT → SUBMITTED: hand the roll off for review. */
  async submit(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<AttendanceSession> {
    const session = await this.getScoped(id, actor);
    if (session.status !== AttendanceStatus.DRAFT) {
      throw new ConflictException('Only a draft can be submitted');
    }
    return this.attendance.updateSession(id, {
      status: AttendanceStatus.SUBMITTED,
    });
  }

  /** SUBMITTED → REVIEWED: sign off. Admins and department leaders may
   *  review their own rolls (self-review allowed). */
  async review(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<AttendanceSession> {
    const session = await this.getScoped(id, actor);
    if (session.status !== AttendanceStatus.SUBMITTED) {
      throw new ConflictException('Only a submitted roll can be reviewed');
    }
    return this.attendance.updateSession(id, {
      status: AttendanceStatus.REVIEWED,
      reviewedBy: { connect: { id: actor.id } },
      reviewedAt: new Date(),
    });
  }

  async remove(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<{ success: true }> {
    await this.getScoped(id, actor);
    await this.attendance.deleteSession(id);
    return { success: true };
  }

  /** A reviewed roll is locked — no edits to fields or the present-set. */
  private assertEditable(session: AttendanceSession): void {
    if (session.status === AttendanceStatus.REVIEWED) {
      throw new ConflictException('A reviewed roll is locked');
    }
  }

  private async getScoped(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<AttendanceSession> {
    const session = await this.attendance.findSessionById(id);
    if (!session) throw new NotFoundException('Session not found');
    if (!isSuperAdmin(actor) && session.churchId !== actor.churchId) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  private requireChurch(actor: AuthenticatedUser): string {
    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    return actor.churchId;
  }
}
