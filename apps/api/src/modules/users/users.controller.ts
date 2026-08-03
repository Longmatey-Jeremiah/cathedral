import {
  Body,
  Controller,
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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: UserDto })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.create(dto, actor);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.DEPARTMENT_LEADER)
  @ApiPaginatedResponse(UserDto)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.users.findAll(actor, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER)
  @ApiOkResponse({ type: UserDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.findById(id, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: UserDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.update(id, dto, actor);
  }
}
