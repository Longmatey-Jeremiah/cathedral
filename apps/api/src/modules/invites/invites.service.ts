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
import { ChurchScopeService } from '../churches/church-scope.service';
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
    private readonly churchScope: ChurchScopeService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async invite(dto: InviteUserDto, actor: AuthenticatedUser) {
    if (dto.role === UserRole.SUPER_ADMIN && !isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can invite super admins');
    }

    const targetChurchId = await this.churchScope.resolveTargetChurch(actor, dto.role, dto.churchId);

    const existing = await this.users.findByEmail(dto.email);
    if (existing && existing.status === UserStatus.ACTIVE) {
      throw new ConflictException('User already exists and is active');
    }

    // Kill any prior live invite for this email so a re-invite can't leave an
    // older token (possibly a different role) usable. One live token per email.
    await this.invites.supersedeForEmail(dto.email);

    const token = generateInviteToken();
    const tokenHash = hashToken(token);
    const ttlHours = this.config.get<number>('INVITE_TOKEN_TTL_HOURS') ?? 72;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.invites.create({
      email: dto.email,
      role: dto.role,
      tokenHash,
      token,
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

    // Returned so callers can surface/copy the link directly — useful while
    // email delivery is still a log-only stub (notifications.service send()).
    return { email: dto.email, expiresAt, inviteUrl };
  }

  // Church admins see their own church's invites; a super admin sees all.
  async list(actor: AuthenticatedUser) {
    const where = isSuperAdmin(actor) ? {} : { churchId: actor.churchId };
    const rows = await this.invites.list(where);
    const appUrl = this.config.get<string>('APP_URL') ?? '';
    return rows.map(({ token, ...rest }) => ({
      ...rest,
      inviteUrl: token ? `${appUrl}/invite/accept?token=${token}` : null,
    }));
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

    // An invite onboards a not-yet-active account. It is NOT proof of ownership
    // of an existing one — refuse to overwrite an already-active user's
    // password/role/church via a (possibly stale) token. Checked before the
    // claim so a rejected attempt doesn't burn the token.
    const existing = await this.users.findByEmail(invite.email);
    if (existing && existing.status === UserStatus.ACTIVE) {
      throw new ConflictException('This account has already been set up');
    }

    // Claim the token: closes the race where two concurrent accepts both pass
    // the checks above. The loser gets a clean "already used" error.
    // ponytail: if the user write below fails the invite is burned — admin
    // re-invites. Wrap both in $transaction only if that tradeoff bites.
    const claimed = await this.invites.claim(invite.id);
    if (!claimed) throw new UnauthorizedException('Invalid or expired invite');

    const passwordHash = await hashPassword(dto.password);

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

    const { password: _password, ...rest } = user;
    return rest;
  }

}
