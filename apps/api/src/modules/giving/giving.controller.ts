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
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response';
import { GivingService } from './giving.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import {
  DonationListQueryDto,
  GivingSummaryQueryDto,
} from './dto/donation-list.query.dto';
import {
  DonationDto,
  DonationListItemDto,
  FundDto,
  GivingSummaryDto,
} from './dto/giving.response.dto';

@ApiTags('giving')
@ApiBearerAuth()
@Controller('giving')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.FINANCE)
export class GivingController {
  constructor(private readonly giving: GivingService) {}

  @Get('funds')
  @ApiOkResponse({ type: [FundDto] })
  listFunds(
    @CurrentUser() actor: AuthenticatedUser,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    return this.giving.listFunds(actor, includeInactive ?? false);
  }

  @Post('funds')
  @ApiCreatedResponse({ type: FundDto })
  createFund(
    @Body() dto: CreateFundDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.giving.createFund(dto, actor);
  }

  @Patch('funds/:id')
  @ApiOkResponse({ type: FundDto })
  updateFund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFundDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.giving.updateFund(id, dto, actor);
  }

  @Get('summary')
  @ApiOkResponse({ type: GivingSummaryDto })
  summary(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: GivingSummaryQueryDto,
  ) {
    return this.giving.summary(actor, query);
  }

  @Get('donations')
  @ApiPaginatedResponse(DonationListItemDto)
  findAll(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: DonationListQueryDto,
  ) {
    return this.giving.findAll(actor, query);
  }

  @Post('donations')
  @ApiCreatedResponse({ type: DonationDto })
  record(
    @Body() dto: CreateDonationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.giving.record(dto, actor);
  }

  /** Corrections are new negating rows — the ledger is never edited in place. */
  @Post('donations/:id/reverse')
  @ApiCreatedResponse({ type: DonationDto })
  reverse(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.giving.reverse(id, actor);
  }
}
