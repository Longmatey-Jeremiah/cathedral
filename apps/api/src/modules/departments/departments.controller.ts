import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.create(dto, actor);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  findAll(@CurrentUser() actor: AuthenticatedUser) {
    return this.departments.findAll(actor);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.findById(id, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.remove(id, actor);
  }
}
