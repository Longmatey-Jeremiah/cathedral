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
import { CareService } from './care.service';
import { CreateCareNoteDto } from './dto/create-care-note.dto';
import { UpdateCareNoteDto } from './dto/update-care-note.dto';
import { CareNoteListQueryDto } from './dto/care-note-list.query.dto';
import {
  CareNoteDto,
  CareNoteListItemDto,
  CareSummaryDto,
} from './dto/care-note.response.dto';

// Pastoral notes are sensitive: ADMIN and MEMBER_CARE only. Department leaders
// and viewers get no access at all, not even a redacted list.
@ApiTags('care')
@ApiBearerAuth()
@Controller('care-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MEMBER_CARE)
export class CareController {
  constructor(private readonly care: CareService) {}

  @Post()
  @ApiCreatedResponse({ type: CareNoteDto })
  create(@Body() dto: CreateCareNoteDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.care.create(dto, actor);
  }

  @Get()
  @ApiPaginatedResponse(CareNoteListItemDto)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: CareNoteListQueryDto,
  ) {
    return this.care.findAll(actor, query);
  }

  /** Counters for the care dashboard. */
  @Get('summary')
  @ApiOkResponse({ type: CareSummaryDto })
  summary(@CurrentUser() actor: AuthenticatedUser) {
    return this.care.summary(actor);
  }

  @Get(':id')
  @ApiOkResponse({ type: CareNoteDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.care.findById(id, actor);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CareNoteDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCareNoteDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.care.update(id, dto, actor);
  }

  @Patch(':id/resolve')
  @ApiOkResponse({ type: CareNoteDto })
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.care.resolve(id, actor);
  }

  @Delete(':id')
  @ApiOkResponse({ type: MutationResultDto })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.care.remove(id, actor);
  }
}
