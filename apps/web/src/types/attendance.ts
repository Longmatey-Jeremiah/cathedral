export type AttendanceStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

/** A user shown as "who did this". */
export interface Actor {
  id: string;
  name: string;
}

/** A row the sessions list renders. */
export interface SessionListItem {
  id: string;
  title: string;
  date: string;
  status: AttendanceStatus;
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
  recordedBy: Actor;
  reviewedBy: Actor | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  present: PresentMember[];
}
