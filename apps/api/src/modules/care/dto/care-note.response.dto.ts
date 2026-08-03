import { CareType } from '@prisma/client';

export class CareNoteDto {
  id!: string;
  churchId!: string;
  memberId!: string;
  authorId!: string;
  type!: CareType;
  body!: string;
  confidential!: boolean;
  followUpAt?: Date | null;
  resolvedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}

/** Row shape for GET /care-notes — trimmed for the table view. */
export class CareNoteListItemDto {
  id!: string;
  memberId!: string;
  memberName!: string;
  authorName!: string;
  type!: CareType;
  /** First line of the note; the full body needs the detail endpoint. */
  excerpt!: string;
  confidential!: boolean;
  followUpAt!: Date | null;
  resolvedAt!: Date | null;
  overdue!: boolean;
  createdAt!: Date;
}

export class CareSummaryDto {
  overdue!: number;
  openFollowUps!: number;
  notesThisMonth!: number;
}
