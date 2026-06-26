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

  findAll(where: Prisma.DepartmentWhereInput): Promise<Department[]> {
    return this.prisma.department.findMany({
      where,
      orderBy: { name: 'asc' },
    });
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
