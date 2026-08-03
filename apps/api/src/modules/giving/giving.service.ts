import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Donation, Fund, GivingMethod, Prisma } from '@prisma/client';
import {
  AuthenticatedUser,
  isSuperAdmin,
} from '../../common/types/authenticated-user';
import { Paginated } from '../../common/dto/pagination.query.dto';
import { GivingRepository } from './giving.repository';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import {
  DonationListQueryDto,
  GivingSummaryQueryDto,
} from './dto/donation-list.query.dto';

// Used only when no single church is in scope (super-admin totals) or the
// church row has gone missing. Per-church, Church.defaultCurrency wins.
const FALLBACK_CURRENCY = 'NGN';

export interface DonationListItem {
  id: string;
  donor: string | null;
  fund: string;
  amountMinor: number;
  currency: string;
  method: GivingMethod;
  reference: string | null;
  givenAt: Date;
  isReversal: boolean;
  reversed: boolean;
}

export interface GivingSummary {
  from: Date;
  to: Date;
  currency: string;
  totalMinor: number;
  donationCount: number;
  byFund: { fundId: string; name: string; amountMinor: number; share: number }[];
}

@Injectable()
export class GivingService {
  constructor(private readonly giving: GivingRepository) {}

  // ---- Funds ----------------------------------------------------------

  async listFunds(
    actor: AuthenticatedUser,
    includeInactive = false,
  ): Promise<Fund[]> {
    if (!actor.churchId) return [];
    return this.giving.findFunds(actor.churchId, includeInactive);
  }

  async createFund(dto: CreateFundDto, actor: AuthenticatedUser): Promise<Fund> {
    const churchId = this.requireChurch(actor);
    try {
      return await this.giving.createFund({
        name: dto.name,
        isActive: dto.isActive ?? true,
        church: { connect: { id: churchId } },
      });
    } catch (error) {
      // @@unique([churchId, name]) — let the DB be the source of truth rather
      // than racing a read-then-write check.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A fund with that name already exists');
      }
      throw error;
    }
  }

  async updateFund(
    id: string,
    dto: UpdateFundDto,
    actor: AuthenticatedUser,
  ): Promise<Fund> {
    await this.getScopedFund(id, actor);
    try {
      return await this.giving.updateFund(id, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A fund with that name already exists');
      }
      throw error;
    }
  }

  // ---- Donations ------------------------------------------------------

  async record(
    dto: CreateDonationDto,
    actor: AuthenticatedUser,
  ): Promise<Donation> {
    const churchId = this.requireChurch(actor);

    const fund = await this.giving.findFundById(dto.fundId);
    if (!fund || fund.churchId !== churchId) {
      throw new BadRequestException('Fund does not exist in this church');
    }
    if (!fund.isActive) {
      throw new BadRequestException('That fund is retired');
    }

    if (dto.memberId) {
      const found = await this.giving.memberExistsInChurch(
        churchId,
        dto.memberId,
      );
      if (found !== 1) {
        throw new BadRequestException('Member does not exist in this church');
      }
    }

    return this.giving.createDonation({
      amountMinor: dto.amountMinor,
      currency: dto.currency ?? (await this.churchCurrency(churchId)),
      method: dto.method,
      reference: dto.reference ?? null,
      note: dto.note ?? null,
      givenAt: dto.givenAt,
      church: { connect: { id: churchId } },
      fund: { connect: { id: dto.fundId } },
      recordedBy: { connect: { id: actor.id } },
      ...(dto.memberId ? { member: { connect: { id: dto.memberId } } } : {}),
    });
  }

  /**
   * Corrections are new rows, never edits. The reversal negates the original
   * and is dated to the original's `givenAt`, so the period it polluted comes
   * out right; `createdAt` still records when the correction was made.
   */
  async reverse(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<Donation> {
    const original = await this.getScopedDonation(id, actor);

    if (original.reversesId) {
      throw new ConflictException('A reversal cannot itself be reversed');
    }
    const existing = await this.giving.findReversalOf(id);
    if (existing) {
      throw new ConflictException('This entry has already been reversed');
    }

    return this.giving.createDonation({
      amountMinor: -original.amountMinor,
      currency: original.currency,
      method: original.method,
      reference: original.reference,
      note: `Reversal of ${original.id}`,
      givenAt: original.givenAt,
      church: { connect: { id: original.churchId } },
      fund: { connect: { id: original.fundId } },
      recordedBy: { connect: { id: actor.id } },
      reverses: { connect: { id: original.id } },
      ...(original.memberId
        ? { member: { connect: { id: original.memberId } } }
        : {}),
    });
  }

  async findAll(
    actor: AuthenticatedUser,
    query: DonationListQueryDto,
  ): Promise<Paginated<DonationListItem>> {
    if (!isSuperAdmin(actor) && !actor.churchId) {
      return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
    }

    const where: Prisma.DonationWhereInput = {
      ...(isSuperAdmin(actor) ? {} : { churchId: actor.churchId! }),
      ...(query.fundId ? { fundId: query.fundId } : {}),
      ...(query.memberId ? { memberId: query.memberId } : {}),
      ...(query.method ? { method: query.method } : {}),
      ...this.dateWindow(query.from, query.to),
      ...(query.q ? { reference: { contains: query.q, mode: 'insensitive' } } : {}),
    };

    const { rows, total } = await this.giving.findDonationPage(where, query);
    return {
      data: rows.map((r) => ({
        id: r.id,
        donor: r.member ? `${r.member.firstName} ${r.member.lastName}` : null,
        fund: r.fund.name,
        amountMinor: r.amountMinor,
        currency: r.currency,
        method: r.method,
        reference: r.reference,
        givenAt: r.givenAt,
        isReversal: r.reversesId !== null,
        reversed: r.reversedBy !== null,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  /** Totals for a window, defaulting to the current calendar month. */
  async summary(
    actor: AuthenticatedUser,
    query: GivingSummaryQueryDto,
  ): Promise<GivingSummary> {
    const now = new Date();
    const from = query.from ?? new Date(now.getFullYear(), now.getMonth(), 1);
    const to = query.to ?? now;
    // Super admins see every church at once, so no single default applies.
    const currency = actor.churchId
      ? await this.churchCurrency(actor.churchId)
      : FALLBACK_CURRENCY;

    const empty: GivingSummary = {
      from,
      to,
      currency,
      totalMinor: 0,
      donationCount: 0,
      byFund: [],
    };
    if (!isSuperAdmin(actor) && !actor.churchId) return empty;

    const where: Prisma.DonationWhereInput = {
      ...(isSuperAdmin(actor) ? {} : { churchId: actor.churchId! }),
      givenAt: { gte: from, lte: to },
    };

    const totals = await this.giving.totalsByFund(where);
    if (totals.length === 0) return empty;

    const names = new Map(
      (await this.giving.fundNames(totals.map((t) => t.fundId))).map((f) => [
        f.id,
        f.name,
      ]),
    );
    const totalMinor = totals.reduce((sum, t) => sum + t.amountMinor, 0);

    return {
      from,
      to,
      currency,
      totalMinor,
      donationCount: totals.reduce((sum, t) => sum + t.count, 0),
      byFund: totals
        .map((t) => ({
          fundId: t.fundId,
          name: names.get(t.fundId) ?? 'Unknown fund',
          amountMinor: t.amountMinor,
          // Guard the divide: a fully reversed month nets to zero.
          share:
            totalMinor === 0
              ? 0
              : Math.round((t.amountMinor / totalMinor) * 100),
        }))
        .sort((a, b) => b.amountMinor - a.amountMinor),
    };
  }

  private dateWindow(from?: Date, to?: Date): Prisma.DonationWhereInput {
    if (!from && !to) return {};
    return {
      givenAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    };
  }

  private async getScopedFund(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<Fund> {
    const fund = await this.giving.findFundById(id);
    if (!fund) throw new NotFoundException('Fund not found');
    if (!isSuperAdmin(actor) && fund.churchId !== actor.churchId) {
      throw new NotFoundException('Fund not found');
    }
    return fund;
  }

  private async getScopedDonation(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<Donation> {
    const donation = await this.giving.findDonationById(id);
    if (!donation) throw new NotFoundException('Donation not found');
    if (!isSuperAdmin(actor) && donation.churchId !== actor.churchId) {
      throw new NotFoundException('Donation not found');
    }
    return donation;
  }

  private requireChurch(actor: AuthenticatedUser): string {
    if (!actor.churchId) {
      throw new ForbiddenException('Account is not associated with a church');
    }
    return actor.churchId;
  }

  private async churchCurrency(churchId: string): Promise<string> {
    return (await this.giving.churchCurrency(churchId)) ?? FALLBACK_CURRENCY;
  }
}
