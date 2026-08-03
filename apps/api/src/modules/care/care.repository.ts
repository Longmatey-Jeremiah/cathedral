import { Injectable } from '@nestjs/common';
import { CareNote, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CareNoteListQueryDto } from './dto/care-note-list.query.dto';

/** Slim row for list rendering — member/author names, no full bodies. */
export type CareNoteListRow = {
  id: string;
  memberId: string;
  type: CareNote['type'];
  body: string;
  confidential: boolean;
  followUpAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  member: { firstName: string; lastName: string };
  author: { firstName: string | null; lastName: string | null; email: string };
};

const orderFor = (
  q: CareNoteListQueryDto,
): Prisma.CareNoteOrderByWithRelationInput[] => {
  const dir = q.sortDir ?? 'desc';
  if (q.sortBy === 'followUpAt') return [{ followUpAt: dir }];
  return [{ createdAt: dir }];
};

@Injectable()
export class CareRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<CareNote | null> {
    return this.prisma.careNote.findFirst({ where: { id, deletedAt: null } });
  }

  findDetail(id: string) {
    return this.prisma.careNote.findFirst({
      where: { id, deletedAt: null },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findPage(
    where: Prisma.CareNoteWhereInput,
    query: CareNoteListQueryDto,
  ): Promise<{ rows: CareNoteListRow[]; total: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.careNote.findMany({
        where,
        orderBy: orderFor(query),
        skip,
        take: query.pageSize,
        select: {
          id: true,
          memberId: true,
          type: true,
          body: true,
          confidential: true,
          followUpAt: true,
          resolvedAt: true,
          createdAt: true,
          member: { select: { firstName: true, lastName: true } },
          author: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.careNote.count({ where }),
    ]);
    return { rows, total };
  }

  /** Counts for the care dashboard, in one round trip. */
  async summarize(
    visible: Prisma.CareNoteWhereInput,
    monthStart: Date,
  ): Promise<{ overdue: number; openFollowUps: number; notesThisMonth: number }> {
    const now = new Date();
    const [overdue, openFollowUps, notesThisMonth] =
      await this.prisma.$transaction([
        this.prisma.careNote.count({
          where: { ...visible, resolvedAt: null, followUpAt: { lt: now } },
        }),
        this.prisma.careNote.count({
          where: { ...visible, resolvedAt: null, followUpAt: { not: null } },
        }),
        this.prisma.careNote.count({
          where: { ...visible, createdAt: { gte: monthStart } },
        }),
      ]);
    return { overdue, openFollowUps, notesThisMonth };
  }

  create(data: Prisma.CareNoteCreateInput): Promise<CareNote> {
    return this.prisma.careNote.create({ data });
  }

  update(id: string, data: Prisma.CareNoteUpdateInput): Promise<CareNote> {
    return this.prisma.careNote.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<CareNote> {
    return this.prisma.careNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Does this member exist in this church (and is not deleted)? */
  memberExistsInChurch(churchId: string, memberId: string): Promise<number> {
    return this.prisma.member.count({
      where: { id: memberId, churchId, deletedAt: null },
    });
  }
}
