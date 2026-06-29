import { Injectable } from '@nestjs/common';
import { Member, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberListQueryDto } from './dto/member-list.query.dto';

// Slim row shape for list rendering — only the columns the table needs, plus a
// department count. No full department objects (avoids overfetch + N+1).
export type MemberListRow = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: Member['status'];
  _count: { departments: number };
};

const orderFor = (
  q: MemberListQueryDto,
): Prisma.MemberOrderByWithRelationInput[] => {
  const dir = q.sortDir ?? 'asc';
  if (q.sortBy === 'status') return [{ status: dir }];
  if (q.sortBy === 'joinDate') return [{ joinDate: dir }];
  return [{ firstName: dir }, { lastName: dir }];
};

@Injectable()
export class MembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Member | null> {
    return this.prisma.member.findFirst({ where: { id, deletedAt: null } });
  }

  /** Detail in a single round trip — member + joined departments with roles. */
  findDetail(id: string) {
    return this.prisma.member.findFirst({
      where: { id, deletedAt: null },
      include: {
        departments: {
          select: {
            role: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findPage(
    where: Prisma.MemberWhereInput,
    query: MemberListQueryDto,
  ): Promise<{ rows: MemberListRow[]; total: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.member.findMany({
        where,
        orderBy: orderFor(query),
        skip,
        take: query.pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          _count: { select: { departments: true } },
        },
      }),
      this.prisma.member.count({ where }),
    ]);
    return { rows, total };
  }

  create(data: Prisma.MemberCreateInput): Promise<Member> {
    return this.prisma.member.create({ data });
  }

  update(id: string, data: Prisma.MemberUpdateInput): Promise<Member> {
    return this.prisma.member.update({ where: { id }, data });
  }

  /** Replace the full membership set atomically (delete + recreate). */
  replaceDepartments(
    memberId: string,
    assignments: { departmentId: string; role?: Prisma.MemberDepartmentCreateManyInput['role'] }[],
  ): Promise<unknown> {
    return this.prisma.$transaction([
      this.prisma.memberDepartment.deleteMany({ where: { memberId } }),
      this.prisma.memberDepartment.createMany({
        data: assignments.map((a) => ({
          memberId,
          departmentId: a.departmentId,
          role: a.role ?? 'MEMBER',
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  /** How many of these department ids actually belong to the church. */
  countDepartmentsInChurch(churchId: string, ids: string[]): Promise<number> {
    return this.prisma.department.count({
      where: { churchId, id: { in: ids } },
    });
  }

  softDelete(id: string): Promise<Member> {
    return this.prisma.member.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
