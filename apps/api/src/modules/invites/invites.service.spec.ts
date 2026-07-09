import { ConflictException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { InvitesService } from './invites.service';

/**
 * Focused regression coverage for the account-takeover fix:
 *  - accept() must refuse a (stale) token aimed at an already-ACTIVE account
 *  - invite() must retire prior live invites so only one token stays valid
 */
describe('InvitesService — invite/accept safety', () => {
  const invite = {
    id: 'invite-1',
    email: 'alice@x.test',
    role: UserRole.VIEWER,
    churchId: 'church-1',
  };

  function build() {
    const invites = {
      findActiveByTokenHash: jest.fn().mockResolvedValue(invite),
      claim: jest.fn().mockResolvedValue(true),
      create: jest.fn().mockResolvedValue(invite),
      supersedeForEmail: jest.fn().mockResolvedValue(undefined),
      list: jest.fn().mockResolvedValue([]),
    };
    const users = {
      findByEmail: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    const churchScope = {
      resolveTargetChurch: jest.fn().mockResolvedValue('church-1'),
    };
    const notifications = { sendInvite: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue('http://app.test') };

    const service = new InvitesService(
      invites as never,
      users as never,
      churchScope as never,
      notifications as never,
      config as never,
    );
    return { service, invites, users };
  }

  it('rejects accept when the account is already ACTIVE, without burning the token', async () => {
    const { service, invites, users } = build();
    users.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: invite.email,
      status: UserStatus.ACTIVE,
    });

    await expect(
      service.accept({
        token: 'raw-token',
        password: 'a-strong-password',
        firstName: 'A',
        lastName: 'B',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(invites.claim).not.toHaveBeenCalled();
    expect(users.update).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
  });

  it('onboards a brand-new account and burns the token', async () => {
    const { service, invites, users } = build();
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({
      id: 'user-2',
      email: invite.email,
      password: 'hash',
      status: UserStatus.ACTIVE,
    });

    const result = await service.accept({
      token: 'raw-token',
      password: 'a-strong-password',
      firstName: 'A',
      lastName: 'B',
    });

    expect(invites.claim).toHaveBeenCalledWith(invite.id);
    expect(users.create).toHaveBeenCalled();
    expect(result).not.toHaveProperty('password');
  });

  it('supersedes prior live invites before issuing a new one', async () => {
    const { service, invites, users } = build();
    users.findByEmail.mockResolvedValue(null);

    await service.invite(
      { email: invite.email, role: UserRole.VIEWER, churchId: 'church-1' },
      { id: 'actor', email: 'admin@x.test', role: UserRole.ADMIN, churchId: 'church-1' },
    );

    expect(invites.supersedeForEmail).toHaveBeenCalledWith(invite.email);
    // supersede must happen before the new invite is written
    const supersedeOrder = invites.supersedeForEmail.mock.invocationCallOrder[0];
    const createOrder = invites.create.mock.invocationCallOrder[0];
    expect(supersedeOrder).toBeLessThan(createOrder);
  });

  it('scopes list to the admin church; super admin sees all', () => {
    const { service, invites } = build();

    service.list({ id: 'a', email: 'admin@x.test', role: UserRole.ADMIN, churchId: 'church-1' } as never);
    expect(invites.list).toHaveBeenCalledWith({ churchId: 'church-1' });

    service.list({ id: 's', email: 'root@x.test', role: UserRole.SUPER_ADMIN, churchId: null } as never);
    expect(invites.list).toHaveBeenCalledWith({});
  });
});
