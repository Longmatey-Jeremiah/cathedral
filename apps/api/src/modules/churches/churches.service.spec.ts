import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ChurchesService } from './churches.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

const church = { id: 'church-1', slug: 'grace', defaultCurrency: 'NGN' };

const actor = (over: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  id: 'u1',
  email: 'admin@church.test',
  role: UserRole.ADMIN,
  churchId: 'church-1',
  ...over,
});

function make() {
  const repo = {
    findById: jest.fn().mockResolvedValue(church),
    findBySlug: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockImplementation((id, data) => ({ ...church, ...data })),
  };
  return {
    service: new ChurchesService(repo as never, {} as never),
    repo,
  };
}

describe('ChurchesService.update — branch settings', () => {
  it('lets a church admin set their own branch currency', async () => {
    const { service, repo } = make();
    await service.update('church-1', { defaultCurrency: 'GHS' }, actor());
    expect(repo.update).toHaveBeenCalledWith('church-1', {
      defaultCurrency: 'GHS',
    });
  });

  it('refuses a church admin editing another branch', async () => {
    const { service } = make();
    await expect(
      service.update(
        'church-1',
        { defaultCurrency: 'GHS' },
        actor({ churchId: 'church-2' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses a church admin touching slug or isActive', async () => {
    const { service } = make();
    await expect(
      service.update('church-1', { slug: 'stolen' }, actor()),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update('church-1', { isActive: false }, actor()),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('still lets a super admin change everything', async () => {
    const { service, repo } = make();
    await service.update(
      'church-1',
      { slug: 'renamed', isActive: false },
      actor({ role: UserRole.SUPER_ADMIN, churchId: null }),
    );
    expect(repo.update).toHaveBeenCalled();
  });
});
