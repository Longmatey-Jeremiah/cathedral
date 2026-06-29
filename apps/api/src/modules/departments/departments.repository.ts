import { Injectable } from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Department | null> {
    return this.prisma.department.findUnique({ where: { id } });
  }

  findByName(churchId: string, name: string): Promise<Department | null> {
    return this.prisma.department.findUnique({
      where: { churchId_name: { churchId, name } },
    });
  }

  async findPage(
    where: Prisma.DepartmentWhereInput,
    skip: number,
    take: number,
  ): Promise<{ rows: Department[]; total: number }> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.department.count({ where }),
    ]);
    return { rows, total };
  }

  create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return this.prisma.department.create({ data });
  }

  update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    return this.prisma.department.update({ where: { id }, data });
  }

  delete(id: string): Promise<Department> {
    return this.prisma.department.delete({ where: { id } });
  }
}
