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
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response';
import { MutationResultDto } from '../../common/dto/mutation-result.dto';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberListQueryDto } from './dto/member-list.query.dto';
import {
  ImportMembersDto,
  ImportMembersResultDto,
} from './dto/import-members.dto';
import {
  MemberDto,
  MemberDetailDto,
  MemberListItemDto,
} from './dto/member.response.dto';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: MemberDto })
  create(
    @Body() dto: CreateMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.create(dto, actor);
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: ImportMembersResultDto })
  import(
    @Body() dto: ImportMembersDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.importMembers(dto.members, actor);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiPaginatedResponse(MemberListItemDto)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: MemberListQueryDto,
  ) {
    return this.members.findAll(actor, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiOkResponse({ type: MemberDetailDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.findById(id, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: MemberDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: MutationResultDto })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.members.remove(id, actor);
  }
}
