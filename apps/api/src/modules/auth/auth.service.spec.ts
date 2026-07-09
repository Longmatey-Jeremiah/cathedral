import { createHash } from 'node:crypto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

const hash = (t: string) => createHash('sha256').update(t).digest('hex');

const actor = (over: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  id: 'u',
  email: 'e',
  role: UserRole.VIEWER,
  churchId: null,
  ...over,
});

function make() {
  const sessions = {
    findById: jest.fn(),
    listActive: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const users = { findById: jest.fn() };
  const jwt = { verify: jest.fn() };
  const service = new AuthService(
    users as never,
    sessions as never,
    jwt as never,
    { get: () => undefined, getOrThrow: () => 'secret' } as never,
  );
  return { service, sessions, users, jwt };
}

describe('AuthService.refresh', () => {
  it('rejects a token whose session was revoked', async () => {
    const { service, sessions, jwt } = make();
    jwt.verify.mockReturnValue({ sub: 'u', type: 'refresh', sid: 's' });
    sessions.findById.mockResolvedValue({
      id: 's',
      userId: 'u',
      revokedAt: new Date(),
      refreshTokenHash: hash('tok'),
    });
    await expect(service.refresh('tok')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a rotated-out token (hash mismatch)', async () => {
    const { service, sessions, jwt } = make();
    jwt.verify.mockReturnValue({ sub: 'u', type: 'refresh', sid: 's' });
    sessions.findById.mockResolvedValue({
      id: 's',
      userId: 'u',
      revokedAt: null,
      refreshTokenHash: hash('the-current-token'),
    });
    await expect(service.refresh('an-old-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe('AuthService.revokeSession', () => {
  it("won't revoke a session belonging to another user", async () => {
    const { service, sessions } = make();
    sessions.findById.mockResolvedValue({ id: 's', userId: 'someone-else' });
    await expect(service.revokeSession(actor(), 's')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(sessions.update).not.toHaveBeenCalled();
  });

  it('revokes the caller’s own session', async () => {
    const { service, sessions } = make();
    sessions.findById.mockResolvedValue({
      id: 's',
      userId: 'u',
      revokedAt: null,
    });
    await service.revokeSession(actor(), 's');
    expect(sessions.update).toHaveBeenCalledWith(
      's',
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
  });
});
