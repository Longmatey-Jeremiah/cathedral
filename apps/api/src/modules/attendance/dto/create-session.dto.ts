import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  /** Optional — a one-off gathering need not have a service type. */
  @IsOptional()
  @IsUUID()
  serviceTypeId?: string;
}
