import { Injectable } from '@nestjs/common';
import {
  AttendanceSession,
  AttendanceStatus,
  Prisma,
  ServiceType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionListQueryDto } from './dto/session-list.query.dto';

// Minimal user shape for "who did this" display.
const userSelect = {
  select: { id: true, firstName: true, lastName: true, email: true },
} as const;

export type SessionListRow = {
  id: string;
  title: string;
  date: Date;
  status: AttendanceStatus;
  serviceType: { name: string } | null;
  recordedBy: { firstName: string | null; lastName: string | null; email: string };
  _count: { records: number };
};

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSession(
    data: Prisma.AttendanceSessionCreateInput,
  ): Promise<AttendanceSession> {
    return this.prisma.attendanceSession.create({ data });
  }

  findSessionById(id: string): Promise<AttendanceSession | null> {
    return this.prisma.attendanceSession.findUnique({ where: { id } });
  }

  /** Session detail: session + who recorded/reviewed + present member rows. */
  findSessionDetail(id: string) {
    return this.prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        serviceType: { select: { id: true, name: true } },
        recordedBy: userSelect,
        reviewedBy: userSelect,
        records: {
          select: {
            markedAt: true,
            member: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findSessionPage(
    where: Prisma.AttendanceSessionWhereInput,
    query: SessionListQueryDto,
  ): Promise<{ rows: SessionListRow[]; total: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.attendanceSession.findMany({
        where,
        orderBy: { date: query.sortDir ?? 'desc' },
        skip,
        take: query.pageSize,
        select: {
          id: true,
          title: true,
          date: true,
          status: true,
          serviceType: { select: { name: true } },
          recordedBy: {
            select: { firstName: true, lastName: true, email: true },
          },
          _count: { select: { records: true } },
        },
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);
    return { rows, total };
  }

  updateSession(
    id: string,
    data: Prisma.AttendanceSessionUpdateInput,
  ): Promise<AttendanceSession> {
    return this.prisma.attendanceSession.update({ where: { id }, data });
  }

  deleteSession(id: string): Promise<AttendanceSession> {
    return this.prisma.attendanceSession.delete({ where: { id } });
  }

  // ---- Service types ---------------------------------------------------

  findServiceTypes(
    churchId: string,
    includeInactive: boolean,
  ): Promise<ServiceType[]> {
    return this.prisma.serviceType.findMany({
      where: { churchId, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: { name: 'asc' },
    });
  }

  findServiceTypeById(id: string): Promise<ServiceType | null> {
    return this.prisma.serviceType.findUnique({ where: { id } });
  }

  createServiceType(
    data: Prisma.ServiceTypeCreateInput,
  ): Promise<ServiceType> {
    return this.prisma.serviceType.create({ data });
  }

  updateServiceType(
    id: string,
    data: Prisma.ServiceTypeUpdateInput,
  ): Promise<ServiceType> {
    return this.prisma.serviceType.update({ where: { id }, data });
  }

  /** How many of these member ids belong to the church (tenant guard). */
  countMembersInChurch(churchId: string, ids: string[]): Promise<number> {
    return this.prisma.member.count({
      where: { churchId, deletedAt: null, id: { in: ids } },
    });
  }

  /** Replace the full present-set for a session atomically. */
  replaceRecords(sessionId: string, memberIds: string[]): Promise<unknown> {
    return this.prisma.$transaction([
      this.prisma.attendance.deleteMany({ where: { sessionId } }),
      this.prisma.attendance.createMany({
        data: memberIds.map((memberId) => ({ sessionId, memberId })),
        skipDuplicates: true,
      }),
    ]);
  }
}
