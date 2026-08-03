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
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { ChurchDto, ChurchWithInviteDto } from './dto/church.response.dto';

@ApiTags('churches')
@ApiBearerAuth()
@Controller('churches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChurchesController {
  constructor(private readonly churches: ChurchesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ type: ChurchWithInviteDto })
  create(
    @Body() dto: CreateChurchDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.churches.create(dto, actor);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiPaginatedResponse(ChurchDto)
  findAll(@Query() query: PaginationQueryDto) {
    return this.churches.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ChurchDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.churches.findById(id, user);
  }

  /** ADMIN may edit their own branch's settings; the service picks the fields. */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({ type: ChurchDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChurchDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.churches.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOkResponse({ type: MutationResultDto })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.churches.remove(id);
  }
}
