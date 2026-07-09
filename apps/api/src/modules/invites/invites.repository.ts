import { Injectable } from '@nestjs/common';
import { Prisma, UserInvite } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserInviteCreateInput): Promise<UserInvite> {
    return this.prisma.userInvite.create({ data });
  }

  // ponytail: no pagination — invite lists are small; add it if one ever grows.
  // tokenHash is deliberately excluded — it never leaves the server.
  list(where: Prisma.UserInviteWhereInput) {
    return this.prisma.userInvite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        token: true,
        expiresAt: true,
        used: true,
        createdAt: true,
        churchId: true,
      },
    });
  }

  /**
   * Invalidate every still-open invite for an email. Called before issuing a
   * fresh one so only the newest token is ever live — a re-invite (e.g. to fix
   * a role) must not leave the old token usable.
   */
  async supersedeForEmail(email: string): Promise<void> {
    await this.prisma.userInvite.updateMany({
      where: { email, used: false },
      data: { used: true },
    });
  }

  findActiveByTokenHash(tokenHash: string): Promise<UserInvite | null> {
    return this.prisma.userInvite.findFirst({
      where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
    });
  }

  /**
   * Atomically claim an unused invite. Returns true only if this call flipped
   * it from used:false to true — concurrent accepts of the same token race
   * here and exactly one wins. ponytail: optimistic gate, no transaction.
   */
  async claim(id: string): Promise<boolean> {
    const { count } = await this.prisma.userInvite.updateMany({
      where: { id, used: false },
      data: { used: true },
    });
    return count === 1;
  }
}
