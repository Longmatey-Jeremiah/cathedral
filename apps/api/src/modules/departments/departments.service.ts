import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import {
  Paginated,
  PaginationQueryDto,
} from '../../common/dto/pagination.query.dto';
import { DepartmentsRepository } from './departments.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly departments: DepartmentsRepository) {}

  async create(
    dto: CreateDepartmentDto,
    actor: AuthenticatedUser,
  ): Promise<Department> {
    const churchId = this.requireChurch(actor);

    const existing = await this.departments.findByName(churchId, dto.name);
    if (existing) {
      throw new ConflictException('A department with this name already exists');
    }

    return this.departments.create({
      name: dto.name,
      description: dto.description,
      church: { connect: { id: churchId } },
    });
  }

  async findAll(
    actor: AuthenticatedUser,
    query: PaginationQueryDto,
  ): Promise<Paginated<Department>> {
    // Church-scoped roles without a church see nothing.
    if (!isSuperAdmin(actor) && !actor.churchId) {
      return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
    }

    // churchId is non-null here for church-scoped roles — the guard above
    // returned early when it was missing.
    const tenant: Prisma.DepartmentWhereInput = isSuperAdmin(actor)
      ? {}
      : { churchId: actor.churchId! };
    const search: Prisma.DepartmentWhereInput = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { description: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};

    const where: Prisma.DepartmentWhereInput = { AND: [tenant, search] };
    const skip = (query.page - 1) * query.pageSize;
    const { rows, total } = await this.departments.findPage(
      where,
      skip,
      query.pageSize,
    );
    return { data: rows, total, page: query.page, pageSize: query.pageSize };
  }

  async findById(id: string, actor: AuthenticatedUser): Promise<Department> {
    return this.getScoped(id, actor);
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
    actor: AuthenticatedUser,
  ): Promise<Department> {
    const department = await this.getScoped(id, actor);

    if (dto.name && dto.name !== department.name) {
      const taken = await this.departments.findByName(
        department.churchId,
        dto.name,
      );
      if (taken) {
        throw new ConflictException(
          'A department with this name already exists',
        );
      }
    }

    return this.departments.update(id, dto);
  }

  async remove(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<{ success: true }> {
    await this.getScoped(id, actor);
    await this.departments.delete(id);
    return { success: true };
  }

  /** Load a department, 404ing if it's outside the actor's church. */
  private async getScoped(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<Department> {
    const department = await this.departments.findById(id);
    if (!department) throw new NotFoundException('Department not found');
    if (!isSuperAdmin(actor) && department.churchId !== actor.churchId) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  private requireChurch(actor: AuthenticatedUser): string {
    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    return actor.churchId;
  }
}
