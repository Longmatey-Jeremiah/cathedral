import {
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
import { ChurchScopeService } from '../churches/church-scope.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Paginated,
  PaginationQueryDto,
} from '../../common/dto/pagination.query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

export type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UsersRepository,
    private readonly churchScope: ChurchScopeService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(
    dto: CreateUserDto,
    actor: AuthenticatedUser,
  ): Promise<PublicUser> {
    if (dto.role === UserRole.SUPER_ADMIN && !isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can create super admins');
    }

    const targetChurchId = await this.churchScope.resolveTargetChurch(actor, dto.role, dto.churchId);

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

  async findAll(
    actor: AuthenticatedUser,
    query: PaginationQueryDto,
  ): Promise<Paginated<PublicUser>> {
    const tenant: Prisma.UserWhereInput = isSuperAdmin(actor)
      ? {}
      : { churchId: actor.churchId };

    // Search is pushed to Postgres (indexed email) instead of shipping every
    // row to the client to filter in JS.
    const search: Prisma.UserWhereInput = query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: 'insensitive' } },
            { firstName: { contains: query.q, mode: 'insensitive' } },
            { lastName: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};

    const where: Prisma.UserWhereInput = { AND: [tenant, search] };
    const skip = (query.page - 1) * query.pageSize;
    const { rows, total } = await this.users.findPage(
      where,
      skip,
      query.pageSize,
    );

    return {
      data: rows.map((u) => this.toPublic(u)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
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

  private toPublic(user: User): PublicUser {
    const { password: _password, ...rest } = user;
    return rest;
  }
}
