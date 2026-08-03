import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { MutationResultDto } from '../../common/dto/mutation-result.dto';
import { InvitesService } from '../invites/invites.service';
import { AcceptInviteDto } from '../invites/dto/accept-invite.dto';
import { UserDto } from '../users/dto/user.response.dto';
import { AuthService, type RequestContext } from './auth.service';
import type { GoogleProfile } from './strategies/google.strategy';
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
    private readonly config: ConfigService,
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

  /** Kicks off the Google consent screen; the guard does the redirecting. */
  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  @ApiExcludeEndpoint()
  googleAuth() {
    // Intentionally empty.
  }

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiExcludeEndpoint()
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { email } = req.user as GoogleProfile;
    try {
      const result = await this.auth.loginWithGoogle(email, context(req));
      res.redirect(this.frontendRedirect({ session: result }));
    } catch {
      // The only expected failure is "no active account for this address" —
      // don't echo it back verbatim, it would confirm which emails exist.
      res.redirect(this.frontendRedirect({ error: 'no_account' }));
    }
  }

  /**
   * Hands the session to the web app in the URL fragment: fragments are never
   * sent to a server, so the tokens stay out of proxy and access logs. The
   * client strips it from history as soon as it has read it.
   */
  private frontendRedirect(payload: unknown): string {
    const origin = this.config
      .getOrThrow<string>('APP_URL')
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${origin}/login/google#${encoded}`;
  }
}
