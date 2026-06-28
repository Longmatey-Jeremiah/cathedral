import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { User, UserStatus } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { UsersRepository } from '../users/users.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
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

    return {
      ...this.signTokens(user),
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

  // ponytail: stateless refresh — no server-side revocation. If you need
  // logout-everywhere / token blacklisting, back this with a DB token store.
  async refresh(refreshToken: string) {
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

    const user = await this.users.findById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Rotate: issue a fresh refresh token alongside the new access token.
    return this.signTokens(user);
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

  private signTokens(user: User): { accessToken: string; refreshToken: string } {
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
      },
      { expiresIn: accessExpiresIn },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      { secret: this.refreshSecret(), expiresIn: refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}
