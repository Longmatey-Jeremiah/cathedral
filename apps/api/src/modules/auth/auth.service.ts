import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import { User, UserStatus } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { UsersRepository } from '../users/users.repository';
import { SessionsRepository } from './sessions.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

interface RefreshPayload {
  sub: string;
  type: 'refresh';
  sid: string;
}

/** Where a login/refresh came from — captured for the sessions list. */
export interface RequestContext {
  ip?: string;
  userAgent?: string;
}

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly sessions: SessionsRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, ctx: RequestContext = {}) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const valid = await verifyPassword(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create the session first so its id can be embedded in the tokens, then
    // record the hash of the issued refresh token against it.
    const session = await this.sessions.create({
      user: { connect: { id: user.id } },
      refreshTokenHash: '',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    const tokens = this.signTokens(user, session.id);
    await this.sessions.update(session.id, {
      refreshTokenHash: hashToken(tokens.refreshToken),
    });

    return {
      ...tokens,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        churchId: user.churchId,
      },
    };
  }

  async refresh(refreshToken: string, ctx: RequestContext = {}) {
    let payload: RefreshPayload;
    try {
      payload = this.jwt.verify<RefreshPayload>(refreshToken, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // The session must exist, be active, and hold this exact refresh token —
    // a revoked session or a rotated-out token is rejected.
    const session = await this.sessions.findById(payload.sid);
    if (
      !session ||
      session.revokedAt ||
      session.refreshTokenHash !== hashToken(refreshToken)
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.users.findById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Rotate: new tokens, same session; record the new hash and last-seen.
    const tokens = this.signTokens(user, session.id);
    await this.sessions.update(session.id, {
      refreshTokenHash: hashToken(tokens.refreshToken),
      lastSeenAt: new Date(),
      ...(ctx.ip ? { ip: ctx.ip } : {}),
      ...(ctx.userAgent ? { userAgent: ctx.userAgent } : {}),
    });
    return tokens;
  }

  /** Active sessions for a user, flagging the one making the request. */
  async listSessions(user: AuthenticatedUser) {
    const rows = await this.sessions.listActive(user.id);
    return rows.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ip: s.ip,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      current: s.id === user.sessionId,
    }));
  }

  /** Revoke (sign out) one of the caller's own sessions. */
  async revokeSession(
    user: AuthenticatedUser,
    id: string,
  ): Promise<{ success: true }> {
    const session = await this.sessions.findById(id);
    if (!session || session.userId !== user.id) {
      throw new NotFoundException('Session not found');
    }
    if (!session.revokedAt) {
      await this.sessions.update(id, { revokedAt: new Date() });
    }
    return { success: true };
  }

  async changePassword(currentUser: AuthenticatedUser, dto: ChangePasswordDto) {
    const user = await this.users.findById(currentUser.id);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await verifyPassword(dto.currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.users.update(user.id, {
      password: passwordHash,
      mustChangePassword: false,
    });

    return { success: true };
  }

  // Falls back to JWT_SECRET so refresh works out of the box; set a distinct
  // JWT_REFRESH_SECRET in prod so a leaked access secret can't mint refreshes.
  private refreshSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      this.config.getOrThrow<string>('JWT_SECRET')
    );
  }

  private signTokens(
    user: User,
    sessionId: string,
  ): { accessToken: string; refreshToken: string } {
    const accessExpiresIn = (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ??
      '15m') as SignOptions['expiresIn'];
    const refreshExpiresIn = (this.config.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) ?? '2d') as SignOptions['expiresIn'];

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        churchId: user.churchId,
        sid: sessionId,
      },
      { expiresIn: accessExpiresIn },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh', sid: sessionId },
      { secret: this.refreshSecret(), expiresIn: refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}
