import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Church, UserRole } from '@prisma/client';
import { AuthenticatedUser, isSuperAdmin } from '../../common/types/authenticated-user';
import { InvitesService } from '../invites/invites.service';
import { ChurchesRepository } from './churches.repository';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

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
    });

    // Provision the church's first ADMIN and hand back the invite link.
    const { inviteUrl } = await this.invites.invite(
      { email: dto.email, role: UserRole.ADMIN, churchId: church.id },
      actor,
    );

    return { ...church, inviteUrl };
  }

  findAll(): Promise<Church[]> {
    return this.churches.findAll();
  }

  async findById(id: string, user: AuthenticatedUser): Promise<Church> {
    const church = await this.churches.findById(id);
    if (!church) throw new NotFoundException('Church not found');
    if (!isSuperAdmin(user) && user.churchId !== church.id) {
      throw new ForbiddenException('Cannot access this church');
    }
    return church;
  }

  async update(id: string, dto: UpdateChurchDto): Promise<Church> {
    const church = await this.churches.findById(id);
    if (!church) throw new NotFoundException('Church not found');

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
