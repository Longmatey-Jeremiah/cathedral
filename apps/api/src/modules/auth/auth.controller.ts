import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { MutationResultDto } from '../../common/dto/mutation-result.dto';
import { InvitesService } from '../invites/invites.service';
import { AcceptInviteDto } from '../invites/dto/accept-invite.dto';
import { UserDto } from '../users/dto/user.response.dto';
import { AuthService, type RequestContext } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  LoginResultDto,
  SessionInfoDto,
  TokenPairDto,
} from './dto/auth.response.dto';

function context(req: Request): RequestContext {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly invites: InvitesService,
  ) {}

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiCreatedResponse({ type: LoginResultDto })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, context(req));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @ApiCreatedResponse({ type: MutationResultDto })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(user, dto);
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiCreatedResponse({ type: TokenPairDto })
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, context(req));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('sessions')
  @ApiOkResponse({ type: SessionInfoDto, isArray: true })
  sessions(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.listSessions(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('sessions/:id')
  @ApiOkResponse({ type: MutationResultDto })
  revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.auth.revokeSession(user, id);
  }

  @Public()
  @Post('accept-invite')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiCreatedResponse({ type: UserDto })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.invites.accept(dto);
  }
}
