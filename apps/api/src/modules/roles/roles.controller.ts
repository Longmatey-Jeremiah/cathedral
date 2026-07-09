import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// ponytail: roles are a fixed Prisma enum, so this is a static list with
// human labels for pickers. Move to a DB-backed module only if roles become
// church-configurable.
const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.FINANCE]: 'Finance',
  [UserRole.DEPARTMENT_LEADER]: 'Department Leader',
  [UserRole.VIEWER]: 'Viewer',
};

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  @Get()
  findAll() {
    return Object.values(UserRole).map((value) => ({
      value,
      label: ROLE_LABELS[value],
    }));
  }
}
