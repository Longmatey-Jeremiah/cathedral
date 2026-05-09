import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { hashPassword } from '../../common/utils/password.util';
import { generateInviteToken, hashToken } from '../../common/utils/token.util';
import { ChurchesRepository } from '../churches/churches.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/users.repository';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitesRepository } from './invites.repository';

@Injectable()
export class InvitesService {
  constructor(
    private readonly invites: InvitesRepository,
    private readonly users: UsersRepository,
    private readonly churches: ChurchesRepository,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async invite(dto: InviteUserDto, actor: AuthenticatedUser) {
    if (dto.role === UserRole.SUPER_ADMIN && !isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can invite super admins');
    }

    const targetChurchId = await this.resolveTargetChurch(actor, dto.role, dto.churchId);

    const existing = await this.users.findByEmail(dto.email);
    if (existing && existing.status === UserStatus.ACTIVE) {
      throw new ConflictException('User already exists and is active');
    }

    const token = generateInviteToken();
    const tokenHash = hashToken(token);
    const ttlHours = this.config.get<number>('INVITE_TOKEN_TTL_HOURS') ?? 72;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.invites.create({
      email: dto.email,
      role: dto.role,
      tokenHash,
      expiresAt,
      ...(targetChurchId
        ? { church: { connect: { id: targetChurchId } } }
        : {}),
    });

    const appUrl = this.config.get<string>('APP_URL') ?? '';
    const inviteUrl = `${appUrl}/invite/accept?token=${token}`;

    await this.notifications.sendInvite({
      to: dto.email,
      inviteUrl,
      expiresAt,
    });

    return { email: dto.email, expiresAt };
  }

  async validate(token: string) {
    if (!token) throw new BadRequestException('Token is required');
    const invite = await this.invites.findActiveByTokenHash(hashToken(token));
    if (!invite) throw new UnauthorizedException('Invalid or expired invite');
    return { email: invite.email, role: invite.role, churchId: invite.churchId };
  }

  async accept(dto: AcceptInviteDto) {
    const invite = await this.invites.findActiveByTokenHash(hashToken(dto.token));
    if (!invite) throw new UnauthorizedException('Invalid or expired invite');

    const passwordHash = await hashPassword(dto.password);
    const existing = await this.users.findByEmail(invite.email);

    const user = existing
      ? await this.users.update(existing.id, {
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: passwordHash,
          role: invite.role,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          ...(invite.churchId
            ? { church: { connect: { id: invite.churchId } } }
            : {}),
        })
      : await this.users.create({
          email: invite.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: passwordHash,
          role: invite.role,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          ...(invite.churchId
            ? { church: { connect: { id: invite.churchId } } }
            : {}),
        });

    await this.invites.markUsed(invite.id);

    const { password: _password, ...rest } = user;
    return rest;
  }

  private async resolveTargetChurch(
    actor: AuthenticatedUser,
    role: UserRole,
    requested?: string,
  ): Promise<string | null> {
    if (role === UserRole.SUPER_ADMIN) {
      return null;
    }

    if (isSuperAdmin(actor)) {
      if (!requested) {
        throw new BadRequestException('churchId is required when a super admin invites a non-super-admin user');
      }
      const church = await this.churches.findById(requested);
      if (!church) throw new BadRequestException('Church not found');
      return church.id;
    }

    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    if (requested && requested !== actor.churchId) {
      throw new ForbiddenException('Cannot invite users to another church');
    }
    return actor.churchId;
  }
}
