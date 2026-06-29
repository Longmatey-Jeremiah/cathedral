import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { ChurchesRepository } from './churches.repository';

/**
 * Resolves which church a new user/invite belongs to, enforcing tenant
 * boundaries. Shared by UsersService and InvitesService — same rules either way.
 */
@Injectable()
export class ChurchScopeService {
  constructor(private readonly churches: ChurchesRepository) {}

  async resolveTargetChurch(
    actor: AuthenticatedUser,
    role: UserRole,
    requested?: string,
  ): Promise<string | null> {
    if (role === UserRole.SUPER_ADMIN) {
      return null;
    }

    if (isSuperAdmin(actor)) {
      if (!requested) {
        throw new BadRequestException(
          'churchId is required when a super admin assigns a non-super-admin user',
        );
      }
      const church = await this.churches.findById(requested);
      if (!church) throw new BadRequestException('Church not found');
      return church.id;
    }

    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    if (requested && requested !== actor.churchId) {
      throw new ForbiddenException('Cannot assign users to another church');
    }
    return actor.churchId;
  }
}
