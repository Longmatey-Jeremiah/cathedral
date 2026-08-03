import { GivingMethod, UserRole } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GivingService } from './giving.service';
import { DonationListQueryDto } from './dto/donation-list.query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

const query = (
  over: Partial<DonationListQueryDto> = {},
): DonationListQueryDto => ({
  page: 1,
  pageSize: 25,
  sortBy: 'givenAt',
  sortDir: 'desc',
  ...over,
});

const actor = (over: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  id: 'u1',
  email: 'finance@church.test',
  role: UserRole.FINANCE,
  churchId: 'church-1',
  ...over,
});

const donation = (over = {}) => ({
  fundId: 'f1',
  amountMinor: 500_00,
  method: GivingMethod.CASH,
  givenAt: new Date('2026-07-05'),
  ...over,
});

function repoStub() {
  return {
    findFunds: jest.fn().mockResolvedValue([]),
    findFundById: jest
      .fn()
      .mockResolvedValue({ id: 'f1', churchId: 'church-1', isActive: true }),
    createFund: jest.fn(),
    updateFund: jest.fn(),
    findDonationById: jest.fn(),
    findReversalOf: jest.fn().mockResolvedValue(null),
    findDonationPage: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    createDonation: jest.fn().mockResolvedValue({ id: 'd2' }),
    totalsByFund: jest.fn().mockResolvedValue([]),
    fundNames: jest.fn().mockResolvedValue([]),
    memberExistsInChurch: jest.fn().mockResolvedValue(1),
    churchCurrency: jest.fn().mockResolvedValue('NGN'),
  };
}

function make() {
  const repo = repoStub();
  return { service: new GivingService(repo as never), repo };
}

describe('GivingService.record', () => {
  it('rejects an actor with no church', async () => {
    const { service, repo } = make();
    await expect(
      service.record(donation() as never, actor({ churchId: null })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.createDonation).not.toHaveBeenCalled();
  });

  it('rejects a fund from another church', async () => {
    const { service, repo } = make();
    repo.findFundById.mockResolvedValue({
      id: 'f1',
      churchId: 'other',
      isActive: true,
    });
    await expect(
      service.record(donation() as never, actor()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.createDonation).not.toHaveBeenCalled();
  });

  it('rejects a retired fund', async () => {
    const { service, repo } = make();
    repo.findFundById.mockResolvedValue({
      id: 'f1',
      churchId: 'church-1',
      isActive: false,
    });
    await expect(
      service.record(donation() as never, actor()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.createDonation).not.toHaveBeenCalled();
  });

  it('rejects a member from another church', async () => {
    const { service, repo } = make();
    repo.memberExistsInChurch.mockResolvedValue(0);
    await expect(
      service.record(donation({ memberId: 'm1' }) as never, actor()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('records anonymous giving with no member connection', async () => {
    const { service, repo } = make();
    await service.record(donation() as never, actor());
    const [data] = repo.createDonation.mock.calls[0];
    expect(data.member).toBeUndefined();
    expect(data.church).toEqual({ connect: { id: 'church-1' } });
    expect(data.recordedBy).toEqual({ connect: { id: 'u1' } });
    expect(data.currency).toBe('NGN');
  });

  it("falls back to the church's default currency, not a hardcoded one", async () => {
    const { service, repo } = make();
    repo.churchCurrency.mockResolvedValue('GHS');
    await service.record(donation() as never, actor());
    expect(repo.createDonation.mock.calls[0][0].currency).toBe('GHS');
  });

  it('still honours an explicit currency on the donation', async () => {
    const { service, repo } = make();
    repo.churchCurrency.mockResolvedValue('GHS');
    await service.record(donation({ currency: 'USD' }) as never, actor());
    expect(repo.createDonation.mock.calls[0][0].currency).toBe('USD');
  });
});

describe('GivingService.reverse', () => {
  const original = {
    id: 'd1',
    churchId: 'church-1',
    memberId: 'm1',
    fundId: 'f1',
    amountMinor: 500_00,
    currency: 'NGN',
    method: GivingMethod.TRANSFER,
    reference: 'TRF-1',
    reversesId: null,
    givenAt: new Date('2026-07-05'),
  };

  it('writes a negating row rather than editing the original', async () => {
    const { service, repo } = make();
    repo.findDonationById.mockResolvedValue(original);
    await service.reverse('d1', actor());
    const [data] = repo.createDonation.mock.calls[0];
    expect(data.amountMinor).toBe(-500_00);
    expect(data.reverses).toEqual({ connect: { id: 'd1' } });
    // Dated to the original so the polluted period nets out correctly.
    expect(data.givenAt).toEqual(original.givenAt);
    expect(repo.updateFund).not.toHaveBeenCalled();
  });

  it('refuses to reverse a reversal', async () => {
    const { service, repo } = make();
    repo.findDonationById.mockResolvedValue({
      ...original,
      reversesId: 'd0',
    });
    await expect(service.reverse('d1', actor())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repo.createDonation).not.toHaveBeenCalled();
  });

  it('refuses to reverse the same entry twice', async () => {
    const { service, repo } = make();
    repo.findDonationById.mockResolvedValue(original);
    repo.findReversalOf.mockResolvedValue({ id: 'd2' });
    await expect(service.reverse('d1', actor())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repo.createDonation).not.toHaveBeenCalled();
  });

  it('hides a donation from another church (404, not 403)', async () => {
    const { service, repo } = make();
    repo.findDonationById.mockResolvedValue({ ...original, churchId: 'other' });
    await expect(service.reverse('d1', actor())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('GivingService.findAll', () => {
  it('returns an empty page for a church-scoped actor with no church', async () => {
    const { service, repo } = make();
    const res = await service.findAll(actor({ churchId: null }), query());
    expect(res).toEqual({ data: [], total: 0, page: 1, pageSize: 25 });
    expect(repo.findDonationPage).not.toHaveBeenCalled();
  });

  it('scopes to church and applies the date window', async () => {
    const { service, repo } = make();
    await service.findAll(
      actor(),
      query({ from: new Date('2026-07-01'), to: new Date('2026-07-31') }),
    );
    const [where] = repo.findDonationPage.mock.calls[0];
    expect(where.churchId).toBe('church-1');
    expect(where.givenAt.gte).toEqual(new Date('2026-07-01'));
    expect(where.givenAt.lte).toEqual(new Date('2026-07-31'));
  });

  it('labels anonymous rows and flags reversal state', async () => {
    const { service, repo } = make();
    repo.findDonationPage.mockResolvedValue({
      rows: [
        {
          id: 'd1',
          amountMinor: 1000,
          currency: 'NGN',
          method: GivingMethod.CASH,
          reference: null,
          givenAt: new Date('2026-07-05'),
          reversesId: null,
          member: null,
          fund: { name: 'Tithe' },
          reversedBy: { id: 'd2' },
        },
      ],
      total: 1,
    });
    const res = await service.findAll(actor(), query());
    expect(res.data[0]).toMatchObject({
      donor: null, // anonymous
      fund: 'Tithe',
      isReversal: false,
      reversed: true,
    });
  });
});

describe('GivingService.summary', () => {
  it('defaults to the current calendar month', async () => {
    const { service, repo } = make();
    await service.summary(actor(), {});
    const [where] = repo.totalsByFund.mock.calls[0];
    const from = where.givenAt.gte as Date;
    expect(from.getDate()).toBe(1);
    expect(from.getMonth()).toBe(new Date().getMonth());
  });

  it('computes per-fund share and nets reversals out of the total', async () => {
    const { service, repo } = make();
    repo.totalsByFund.mockResolvedValue([
      { fundId: 'f1', amountMinor: 75_000, count: 3 },
      { fundId: 'f2', amountMinor: 25_000, count: 1 },
    ]);
    repo.fundNames.mockResolvedValue([
      { id: 'f1', name: 'Tithe' },
      { id: 'f2', name: 'Building' },
    ]);
    const res = await service.summary(actor(), {});
    expect(res.totalMinor).toBe(100_000);
    expect(res.donationCount).toBe(4);
    expect(res.byFund[0]).toEqual({
      fundId: 'f1',
      name: 'Tithe',
      amountMinor: 75_000,
      share: 75,
    });
  });

  it('does not divide by zero when a period nets to nothing', async () => {
    const { service, repo } = make();
    repo.totalsByFund.mockResolvedValue([
      { fundId: 'f1', amountMinor: 0, count: 2 },
    ]);
    repo.fundNames.mockResolvedValue([{ id: 'f1', name: 'Tithe' }]);
    const res = await service.summary(actor(), {});
    expect(res.totalMinor).toBe(0);
    expect(res.byFund[0].share).toBe(0);
  });
});
