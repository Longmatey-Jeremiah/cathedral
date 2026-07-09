import {
  Body,
  Controller,
  Get,
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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitesService } from './invites.service';
import {
  InviteListItemDto,
  InviteResultDto,
  InviteValidationDto,
} from './dto/invite.response.dto';

@ApiTags('invites')
@Controller('users/invite')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: InviteResultDto })
  invite(
    @Body() dto: InviteUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.invites.invite(dto, actor);
  }

  // 'list' (not @Get()) so the path is 3 segments: `users/invite/list`. A plain
  // GET on `users/invite` collides with UsersController's `users/:id` and 400s
  // on ParseUUIDPipe — and reordering can't fix it since InvitesModule imports
  // UsersModule, so users' routes always register first.
  @Get('list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: InviteListItemDto, isArray: true })
  list(@CurrentUser() actor: AuthenticatedUser) {
    return this.invites.list(actor);
  }

  @Get('validate')
  @Public()
  @ApiOkResponse({ type: InviteValidationDto })
  validate(@Query('token') token: string) {
    return this.invites.validate(token);
  }
}
