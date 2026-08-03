export type AttendanceStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

/** A user shown as "who did this". */
export interface Actor {
  id: string;
  name: string;
}

/** A recurring kind of gathering — Sunday Service, Bible Study, Vigil. */
export interface ServiceType {
  id: string;
  churchId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A row the sessions list renders. */
export interface SessionListItem {
  id: string;
  title: string;
  date: string;
  status: AttendanceStatus;
  /** Null for a one-off gathering with no service type. */
  serviceType: string | null;
  recordedBy: string;
  presentCount: number;
}

/** One present member on a session detail. */
export interface PresentMember {
  memberId: string;
  name: string;
  markedAt: string;
}

/** Full session detail (detail endpoint). */
export interface SessionDetail {
  id: string;
  churchId: string;
  title: string;
  date: string;
  status: AttendanceStatus;
  serviceTypeId: string | null;
  serviceType: { id: string; name: string } | null;
  recordedBy: Actor;
  reviewedBy: Actor | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  present: PresentMember[];
}
