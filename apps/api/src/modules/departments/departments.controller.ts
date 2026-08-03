import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PaginationQueryDto } from '../../common/dto/pagination.query.dto';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response';
import { MutationResultDto } from '../../common/dto/mutation-result.dto';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentDto } from './dto/department.response.dto';

@ApiTags('departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: DepartmentDto })
  create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.create(dto, actor);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiPaginatedResponse(DepartmentDto)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.departments.findAll(actor, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiOkResponse({ type: DepartmentDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.findById(id, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: DepartmentDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: MutationResultDto })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.departments.remove(id, actor);
  }
}
