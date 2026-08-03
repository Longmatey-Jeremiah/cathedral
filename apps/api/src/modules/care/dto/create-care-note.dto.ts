import { CareType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCareNoteDto {
  @IsUUID()
  memberId!: string;

  @IsEnum(CareType)
  type!: CareType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  /** Restricts the note to ADMIN and its author. Counselling defaults on. */
  @IsOptional()
  @IsBoolean()
  confidential?: boolean;

  /** Set to put this member in the follow-up queue. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  followUpAt?: Date;
}
