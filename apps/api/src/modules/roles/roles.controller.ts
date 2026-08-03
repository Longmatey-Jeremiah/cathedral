import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RoleOptionDto } from './dto/role-option.response.dto';

// ponytail: roles are a fixed Prisma enum, so this is a static list with
// human labels for pickers. Move to a DB-backed module only if roles become
// church-configurable.
const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.FINANCE]: 'Finance',
  [UserRole.DEPARTMENT_LEADER]: 'Department Leader',
  [UserRole.MEMBER_CARE]: 'Member Care',
  [UserRole.VIEWER]: 'Viewer',
};

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  @Get()
  @ApiOkResponse({ type: RoleOptionDto, isArray: true })
  findAll() {
    return Object.values(UserRole).map((value) => ({
      value,
      label: ROLE_LABELS[value],
    }));
  }
}
