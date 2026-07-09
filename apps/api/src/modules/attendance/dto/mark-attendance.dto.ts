import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

// Replaces the full present-set for a session. memberIds not in the list are
// unmarked; ids present are marked. Idempotent.
export class MarkAttendanceDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  memberIds!: string[];
}
