import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Department } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
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

  findAll(actor: AuthenticatedUser): Promise<Department[]> {
    if (isSuperAdmin(actor)) {
      return this.departments.findAll({});
    }
    // Church-scoped roles without a church see nothing.
    if (!actor.churchId) return Promise.resolve([]);
    return this.departments.findAll({ churchId: actor.churchId });
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
