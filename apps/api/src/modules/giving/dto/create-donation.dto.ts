import { GivingMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDonationDto {
  @IsUUID()
  fundId!: string;

  /** Omit for anonymous giving — normal for cash in the offering bag. */
  @IsOptional()
  @IsUUID()
  memberId?: string;

  /**
   * Minor units (kobo/cents). Integer only — a float here is a rounding bug
   * waiting to be discovered at year end.
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountMinor!: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be an ISO 4217 code' })
  currency?: string;

  @IsEnum(GivingMethod)
  method!: GivingMethod;

  /** Cheque number, teller number, operator reference. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @Type(() => Date)
  @IsDate()
  givenAt!: Date;
}
