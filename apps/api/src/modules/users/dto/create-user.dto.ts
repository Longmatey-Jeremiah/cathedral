import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsUUID()
  churchId?: string;
}
