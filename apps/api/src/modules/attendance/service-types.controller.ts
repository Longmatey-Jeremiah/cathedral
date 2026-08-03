import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
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
import { AttendanceService } from './attendance.service';
import {
  CreateServiceTypeDto,
  ServiceTypeDto,
  UpdateServiceTypeDto,
} from './dto/service-type.dto';

/** The church's list of recurring gatherings, picked when recording a roll. */
@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance/service-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceTypesController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER)
  @ApiOkResponse({ type: [ServiceTypeDto] })
  list(
    @CurrentUser() actor: AuthenticatedUser,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    return this.attendance.listServiceTypes(actor, includeInactive ?? false);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER)
  @ApiCreatedResponse({ type: ServiceTypeDto })
  create(
    @Body() dto: CreateServiceTypeDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.createServiceType(dto, actor);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: ServiceTypeDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceTypeDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.updateServiceType(id, dto, actor);
  }
}
