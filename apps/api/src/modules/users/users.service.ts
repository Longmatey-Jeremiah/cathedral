import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import {
  generateTemporaryPassword,
  hashPassword,
} from '../../common/utils/password.util';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { ChurchesRepository } from '../churches/churches.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

export type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UsersRepository,
    private readonly churches: ChurchesRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async create(
    dto: CreateUserDto,
    actor: AuthenticatedUser,
  ): Promise<PublicUser> {
    if (dto.role === UserRole.SUPER_ADMIN && !isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can create super admins');
    }

    const targetChurchId = await this.resolveTargetChurch(actor, dto.role, dto.churchId);

    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await this.users.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      password: passwordHash,
      status: UserStatus.ACTIVE,
      mustChangePassword: true,
      ...(targetChurchId
        ? { church: { connect: { id: targetChurchId } } }
        : {}),
    });

    await this.notifications.sendTemporaryPassword({
      to: user.email,
      firstName: user.firstName,
      temporaryPassword: tempPassword,
    });

    return this.toPublic(user);
  }

  async findAll(actor: AuthenticatedUser): Promise<PublicUser[]> {
    const where: Prisma.UserWhereInput = isSuperAdmin(actor)
      ? {}
      : { churchId: actor.churchId };
    const users = await this.users.findAll(where);
    return users.map((u) => this.toPublic(u));
  }

  async findById(id: string, actor: AuthenticatedUser): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!isSuperAdmin(actor) && user.churchId !== actor.churchId) {
      throw new NotFoundException('User not found');
    }
    return this.toPublic(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor: AuthenticatedUser,
  ): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!isSuperAdmin(actor) && user.churchId !== actor.churchId) {
      throw new NotFoundException('User not found');
    }
    if (dto.role === UserRole.SUPER_ADMIN && !isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can promote to super admin');
    }
    const updated = await this.users.update(id, dto);
    return this.toPublic(updated);
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
        throw new BadRequestException('churchId is required when a super admin creates a non-super-admin user');
      }
      const church = await this.churches.findById(requested);
      if (!church) throw new BadRequestException('Church not found');
      return church.id;
    }

    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    if (requested && requested !== actor.churchId) {
      throw new ForbiddenException('Cannot create users in another church');
    }
    return actor.churchId;
  }

  private toPublic(user: User): PublicUser {
    const { password: _password, ...rest } = user;
    return rest;
  }
}
