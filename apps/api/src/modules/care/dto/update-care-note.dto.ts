import { CareType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCareNoteDto {
  @IsOptional()
  @IsEnum(CareType)
  type?: CareType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body?: string;

  @IsOptional()
  @IsBoolean()
  confidential?: boolean;

  /** `null` clears the follow-up, removing the note from the queue. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  followUpAt?: Date | null;
}
