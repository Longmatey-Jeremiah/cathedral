import { CareType } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

/** Follow-up state, derived from followUpAt/resolvedAt rather than stored. */
export type FollowUpFilter = 'overdue' | 'open' | 'resolved';

export class CareNoteListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsEnum(CareType)
  type?: CareType;

  @IsOptional()
  @IsIn(['overdue', 'open', 'resolved'])
  followUp?: FollowUpFilter;

  @IsOptional()
  @IsIn(['createdAt', 'followUpAt'])
  sortBy?: 'createdAt' | 'followUpAt' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc' = 'desc';
}
