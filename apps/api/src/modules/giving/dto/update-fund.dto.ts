import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFundDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  /** Retiring a fund hides it from new entries; history keeps its rows. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
