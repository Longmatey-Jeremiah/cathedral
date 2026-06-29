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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberListQueryDto } from './dto/member-list.query.dto';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.create(dto, actor);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: MemberListQueryDto,
  ) {
    return this.members.findAll(actor, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.findById(id, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.remove(id, actor);
  }
}
