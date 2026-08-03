import { AttendanceStatus } from '@prisma/client';

export class AttendanceSessionDto {
  id!: string;
  churchId!: string;
  title!: string;
  date!: Date;
  status!: AttendanceStatus;
  serviceTypeId?: string | null;
  recordedById!: string;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}

/** Row shape for GET /attendance/sessions. */
export class SessionListItemDto {
  id!: string;
  title!: string;
  date!: Date;
  status!: AttendanceStatus;
  /** Name of the service type, or null for a one-off gathering. */
  serviceType!: string | null;
  recordedBy!: string;
  presentCount!: number;
}

export class SessionPersonDto {
  id!: string;
  name!: string;
}

export class PresentMemberDto {
  memberId!: string;
  name!: string;
  markedAt!: Date;
}

/** GET /attendance/sessions/:id — session plus recorder, reviewer and roll. */
export class SessionDetailDto extends AttendanceSessionDto {
  serviceType!: { id: string; name: string } | null;
  recordedBy!: SessionPersonDto;
  reviewedBy!: SessionPersonDto | null;
  present!: PresentMemberDto[];
}

/** PUT /attendance/sessions/:id/records. */
export class MarkResultDto {
  success!: boolean;
  presentCount!: number;
}
