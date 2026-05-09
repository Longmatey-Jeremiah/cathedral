import { Injectable } from '@nestjs/common';
import { Church, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChurchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Church | null> {
    return this.prisma.church.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Church | null> {
    return this.prisma.church.findUnique({ where: { slug } });
  }

  findAll(): Promise<Church[]> {
    return this.prisma.church.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: Prisma.ChurchCreateInput): Promise<Church> {
    return this.prisma.church.create({ data });
  }

  update(id: string, data: Prisma.ChurchUpdateInput): Promise<Church> {
    return this.prisma.church.update({ where: { id }, data });
  }

  delete(id: string): Promise<Church> {
    return this.prisma.church.delete({ where: { id } });
  }
}
