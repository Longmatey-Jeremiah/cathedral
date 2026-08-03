import { MemberStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { DepartmentAssignmentDto } from './department-assignment.dto';
import { MemberProfileDto } from './member-profile.dto';

export class CreateMemberDto extends MemberProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus = MemberStatus.VISITOR;

  /** Optionally connect this member to an existing auth user. */
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentAssignmentDto)
  departments?: DepartmentAssignmentDto[];
}
