import { Injectable } from '@nestjs/common';
import { Donation, Fund, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DonationListQueryDto } from './dto/donation-list.query.dto';

/** Slim row for the ledger table — resolved donor/fund names, no nested objects. */
export type DonationListRow = {
  id: string;
  amountMinor: number;
  currency: string;
  method: Donation['method'];
  reference: string | null;
  givenAt: Date;
  reversesId: string | null;
  member: { firstName: string; lastName: string } | null;
  fund: { name: string };
  reversedBy: { id: string } | null;
};

const orderFor = (
  q: DonationListQueryDto,
): Prisma.DonationOrderByWithRelationInput[] => {
  const dir = q.sortDir ?? 'desc';
  if (q.sortBy === 'amountMinor') return [{ amountMinor: dir }];
  return [{ givenAt: dir }];
};

@Injectable()
export class GivingRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Funds ----------------------------------------------------------

  findFunds(churchId: string, includeInactive: boolean): Promise<Fund[]> {
    return this.prisma.fund.findMany({
      where: { churchId, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: { name: 'asc' },
    });
  }

  findFundById(id: string): Promise<Fund | null> {
    return this.prisma.fund.findUnique({ where: { id } });
  }

  createFund(data: Prisma.FundCreateInput): Promise<Fund> {
    return this.prisma.fund.create({ data });
  }

  updateFund(id: string, data: Prisma.FundUpdateInput): Promise<Fund> {
    return this.prisma.fund.update({ where: { id }, data });
  }

  // ---- Donations ------------------------------------------------------

  findDonationById(id: string): Promise<Donation | null> {
    return this.prisma.donation.findUnique({ where: { id } });
  }

  /** The reversal row pointing at this donation, if one exists. */
  findReversalOf(donationId: string): Promise<Donation | null> {
    return this.prisma.donation.findUnique({
      where: { reversesId: donationId },
    });
  }

  async findDonationPage(
    where: Prisma.DonationWhereInput,
    query: DonationListQueryDto,
  ): Promise<{ rows: DonationListRow[]; total: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.donation.findMany({
        where,
        orderBy: orderFor(query),
        skip,
        take: query.pageSize,
        select: {
          id: true,
          amountMinor: true,
          currency: true,
          method: true,
          reference: true,
          givenAt: true,
          reversesId: true,
          member: { select: { firstName: true, lastName: true } },
          fund: { select: { name: true } },
          reversedBy: { select: { id: true } },
        },
      }),
      this.prisma.donation.count({ where }),
    ]);
    return { rows, total };
  }

  createDonation(data: Prisma.DonationCreateInput): Promise<Donation> {
    return this.prisma.donation.create({ data });
  }

  /**
   * Period totals per fund. Reversals carry negative amounts, so a plain SUM
   * nets them out — no special-casing needed.
   */
  async totalsByFund(
    where: Prisma.DonationWhereInput,
  ): Promise<{ fundId: string; amountMinor: number; count: number }[]> {
    const grouped = await this.prisma.donation.groupBy({
      by: ['fundId'],
      where,
      _sum: { amountMinor: true },
      _count: { _all: true },
    });
    return grouped.map((g) => ({
      fundId: g.fundId,
      amountMinor: g._sum.amountMinor ?? 0,
      count: g._count._all,
    }));
  }

  fundNames(ids: string[]): Promise<{ id: string; name: string }[]> {
    return this.prisma.fund.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
  }

  async churchCurrency(churchId: string): Promise<string | null> {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      select: { defaultCurrency: true },
    });
    return church?.defaultCurrency ?? null;
  }

  memberExistsInChurch(churchId: string, memberId: string): Promise<number> {
    return this.prisma.member.count({
      where: { id: memberId, churchId, deletedAt: null },
    });
  }
}
