import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { SessionListQueryDto } from './dto/session-list.query.dto';
import {
  AttendanceSessionDto,
  MarkResultDto,
  SessionDetailDto,
  SessionListItemDto,
} from './dto/attendance.response.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiCreatedResponse({ type: AttendanceSessionDto })
  create(
    @Body() dto: CreateSessionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.createSession(dto, actor);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER)
  @ApiPaginatedResponse(SessionListItemDto)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: SessionListQueryDto,
  ) {
    return this.attendance.findAll(actor, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER)
  @ApiOkResponse({ type: SessionDetailDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.findById(id, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiOkResponse({ type: AttendanceSessionDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.update(id, dto, actor);
  }

  @Put(':id/records')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiOkResponse({ type: MarkResultDto })
  mark(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.mark(id, dto, actor);
  }

  @Post(':id/submit')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiOkResponse({ type: AttendanceSessionDto })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.submit(id, actor);
  }

  @Post(':id/review')
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiOkResponse({ type: AttendanceSessionDto })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.review(id, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: MutationResultDto })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.remove(id, actor);
  }
}
