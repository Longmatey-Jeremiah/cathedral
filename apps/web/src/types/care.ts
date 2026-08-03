export const CareType = {
  VISIT: 'VISIT',
  CALL: 'CALL',
  PRAYER: 'PRAYER',
  COUNSEL: 'COUNSEL',
  FOLLOW_UP: 'FOLLOW_UP',
} as const;
export type CareType = (typeof CareType)[keyof typeof CareType];

export const careTypeLabel: Record<CareType, string> = {
  VISIT: 'Visit',
  CALL: 'Call',
  PRAYER: 'Prayer',
  COUNSEL: 'Counselling',
  FOLLOW_UP: 'Follow-up',
};

/** Follow-up state, derived server-side from followUpAt/resolvedAt. */
export type FollowUpFilter = 'overdue' | 'open' | 'resolved';

/** Slim row the care table renders — body trimmed to one line. */
export interface CareNoteListItem {
  id: string;
  memberId: string;
  memberName: string;
  authorName: string;
  type: CareType;
  excerpt: string;
  confidential: boolean;
  followUpAt: string | null;
  resolvedAt: string | null;
  overdue: boolean;
  createdAt: string;
}

export interface CareNote {
  id: string;
  churchId: string;
  memberId: string;
  authorId: string;
  type: CareType;
  body: string;
  confidential: boolean;
  followUpAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  member: { id: string; name: string };
  author: { id: string; name: string };
}

export interface CareSummary {
  overdue: number;
  openFollowUps: number;
  notesThisMonth: number;
}
