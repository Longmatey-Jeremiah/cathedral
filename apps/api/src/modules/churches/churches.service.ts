import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Church, Prisma, UserRole } from '@prisma/client';
import { AuthenticatedUser, isSuperAdmin } from '../../common/types/authenticated-user';
import {
  Paginated,
  PaginationQueryDto,
} from '../../common/dto/pagination.query.dto';
import { InvitesService } from '../invites/invites.service';
import { ChurchesRepository } from './churches.repository';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

/**
 * What a church ADMIN may edit on their own branch. `slug` and `isActive` stay
 * with SUPER_ADMIN: one moves every URL, the other locks the branch out.
 */
const BRANCH_ADMIN_FIELDS = [
  'name',
  'address',
  'phone',
  'email',
  'defaultCurrency',
] as const;
type BranchAdminField = (typeof BRANCH_ADMIN_FIELDS)[number];

@Injectable()
export class ChurchesService {
  constructor(
    private readonly churches: ChurchesRepository,
    @Inject(forwardRef(() => InvitesService))
    private readonly invites: InvitesService,
  ) {}

  async create(dto: CreateChurchDto, actor: AuthenticatedUser): Promise<Church & { inviteUrl: string }> {
    const existing = await this.churches.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException('Slug is already in use');
    }
    const church = await this.churches.create({
      name: dto.name,
      slug: dto.slug,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      isActive: dto.isActive ?? true,
      ...(dto.defaultCurrency ? { defaultCurrency: dto.defaultCurrency } : {}),
    });

    // Provision the church's first ADMIN and hand back the invite link.
    const { inviteUrl } = await this.invites.invite(
      { email: dto.email, role: UserRole.ADMIN, churchId: church.id },
      actor,
    );

    return { ...church, inviteUrl };
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<Church>> {
    const where: Prisma.ChurchWhereInput = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { slug: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.pageSize;
    const { rows, total } = await this.churches.findPage(
      where,
      skip,
      query.pageSize,
    );
    return { data: rows, total, page: query.page, pageSize: query.pageSize };
  }

  async findById(id: string, user: AuthenticatedUser): Promise<Church> {
    const church = await this.churches.findById(id);
    if (!church) throw new NotFoundException('Church not found');
    if (!isSuperAdmin(user) && user.churchId !== church.id) {
      throw new ForbiddenException('Cannot access this church');
    }
    return church;
  }

  async update(
    id: string,
    dto: UpdateChurchDto,
    actor: AuthenticatedUser,
  ): Promise<Church> {
    const church = await this.churches.findById(id);
    if (!church) throw new NotFoundException('Church not found');

    if (!isSuperAdmin(actor)) {
      if (actor.churchId !== church.id) {
        throw new ForbiddenException('Cannot access this church');
      }
      const denied = Object.keys(dto).filter(
        (k) => !BRANCH_ADMIN_FIELDS.includes(k as BranchAdminField),
      );
      if (denied.length > 0) {
        throw new ForbiddenException(
          `Only a super admin can change: ${denied.join(', ')}`,
        );
      }
    }

    if (dto.slug && dto.slug !== church.slug) {
      const slugTaken = await this.churches.findBySlug(dto.slug);
      if (slugTaken) throw new ConflictException('Slug is already in use');
    }

    return this.churches.update(id, dto);
  }

  async remove(id: string): Promise<{ success: true }> {
    const church = await this.churches.findById(id);
    if (!church) throw new NotFoundException('Church not found');
    await this.churches.delete(id);
    return { success: true };
  }
}
