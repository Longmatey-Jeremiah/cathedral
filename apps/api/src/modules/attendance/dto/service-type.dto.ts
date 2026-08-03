import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}

export class UpdateServiceTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  /** Retire a type: it stays on past sessions but is no longer offered. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ServiceTypeDto {
  id!: string;
  churchId!: string;
  name!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
