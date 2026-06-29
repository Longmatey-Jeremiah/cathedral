import { DepartmentRole } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class DepartmentAssignmentDto {
  @IsUUID()
  departmentId!: string;

  @IsOptional()
  @IsEnum(DepartmentRole)
  role?: DepartmentRole = DepartmentRole.MEMBER;
}
