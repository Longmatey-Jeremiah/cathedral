import { MemberStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { DepartmentAssignmentDto } from './department-assignment.dto';
import { MemberProfileDto } from './member-profile.dto';

export class UpdateMemberDto extends MemberProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName?: string;

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
  status?: MemberStatus;

  /**
   * When provided, replaces the member's full department set. Omit to leave
   * memberships untouched.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentAssignmentDto)
  departments?: DepartmentAssignmentDto[];
}
