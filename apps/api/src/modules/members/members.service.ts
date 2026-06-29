import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Member, Prisma } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { Paginated } from '../../common/dto/pagination.query.dto';
import { MembersRepository } from './members.repository';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { DepartmentAssignmentDto } from './dto/department-assignment.dto';
import { MemberListQueryDto } from './dto/member-list.query.dto';

// Optimized list item — what the table renders, nothing more.
export interface MemberListItem {
  id: string;
  name: string;
  phone: string | null;
  status: Member['status'];
  departmentCount: number;
}

@Injectable()
export class MembersService {
  constructor(private readonly members: MembersRepository) {}

  async create(
    dto: CreateMemberDto,
    actor: AuthenticatedUser,
  ): Promise<Member> {
    const churchId = this.requireChurch(actor);
    await this.assertDepartmentsInChurch(churchId, dto.departments);

    const member = await this.members.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      status: dto.status,
      church: { connect: { id: churchId } },
      ...(dto.userId ? { user: { connect: { id: dto.userId } } } : {}),
      ...(dto.departments?.length
        ? {
            departments: {
              create: dto.departments.map((d) => ({
                role: d.role ?? 'MEMBER',
                department: { connect: { id: d.departmentId } },
              })),
            },
          }
        : {}),
    });
    return member;
  }

  async findAll(
    actor: AuthenticatedUser,
    query: MemberListQueryDto,
  ): Promise<Paginated<MemberListItem>> {
    if (!isSuperAdmin(actor) && !actor.churchId) {
      return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
    }

    const where: Prisma.MemberWhereInput = {
      deletedAt: null,
      ...(isSuperAdmin(actor) ? {} : { churchId: actor.churchId! }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.departmentId
        ? { departments: { some: { departmentId: query.departmentId } } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { firstName: { contains: query.q, mode: 'insensitive' } },
              { lastName: { contains: query.q, mode: 'insensitive' } },
              { phone: { contains: query.q } },
            ],
          }
        : {}),
    };

    const { rows, total } = await this.members.findPage(where, query);
    return {
      data: rows.map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        phone: r.phone,
        status: r.status,
        departmentCount: r._count.departments,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async findById(id: string, actor: AuthenticatedUser) {
    await this.getScoped(id, actor); // tenant check
    const detail = await this.members.findDetail(id);
    if (!detail) throw new NotFoundException('Member not found');
    const { departments, ...member } = detail;
    return {
      ...member,
      departments: departments.map((d) => ({
        departmentId: d.department.id,
        name: d.department.name,
        role: d.role,
      })),
    };
  }

  async update(
    id: string,
    dto: UpdateMemberDto,
    actor: AuthenticatedUser,
  ): Promise<Member> {
    const member = await this.getScoped(id, actor);

    if (dto.departments) {
      await this.assertDepartmentsInChurch(member.churchId, dto.departments);
      await this.members.replaceDepartments(id, dto.departments);
    }

    return this.members.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      status: dto.status,
    });
  }

  async remove(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<{ success: true }> {
    await this.getScoped(id, actor);
    await this.members.softDelete(id); // soft delete, keeps history
    return { success: true };
  }

  private async getScoped(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<Member> {
    const member = await this.members.findById(id);
    if (!member) throw new NotFoundException('Member not found');
    if (!isSuperAdmin(actor) && member.churchId !== actor.churchId) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  private async assertDepartmentsInChurch(
    churchId: string,
    assignments?: DepartmentAssignmentDto[],
  ): Promise<void> {
    if (!assignments?.length) return;
    const ids = [...new Set(assignments.map((a) => a.departmentId))];
    const found = await this.members.countDepartmentsInChurch(churchId, ids);
    if (found !== ids.length) {
      throw new BadRequestException(
        'One or more departments do not exist in this church',
      );
    }
  }

  private requireChurch(actor: AuthenticatedUser): string {
    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    return actor.churchId;
  }
}
