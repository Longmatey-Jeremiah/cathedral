import { Injectable } from '@nestjs/common';
import { Prisma, UserInvite } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserInviteCreateInput): Promise<UserInvite> {
    return this.prisma.userInvite.create({ data });
  }

  findActiveByTokenHash(tokenHash: string): Promise<UserInvite | null> {
    return this.prisma.userInvite.findFirst({
      where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
    });
  }

  markUsed(id: string): Promise<UserInvite> {
    return this.prisma.userInvite.update({
      where: { id },
      data: { used: true },
    });
  }
}
