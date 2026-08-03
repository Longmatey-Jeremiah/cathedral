import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, UserRole } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

const actor = (over: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  id: 'u',
  email: 'e',
  role: UserRole.ADMIN,
  churchId: 'church-1',
  ...over,
});

const session = (over: Record<string, unknown> = {}) => ({
  id: 's',
  churchId: 'church-1',
  status: AttendanceStatus.DRAFT,
  recordedById: 'taker',
  ...over,
});

function make() {
  const repo = {
    findSessionById: jest.fn(),
    countMembersInChurch: jest.fn(),
    replaceRecords: jest.fn().mockResolvedValue(undefined),
    updateSession: jest.fn().mockResolvedValue(undefined),
    createSession: jest.fn().mockResolvedValue(undefined),
    findServiceTypeById: jest.fn(),
  };
  return { service: new AttendanceService(repo as never), repo };
}

describe('AttendanceService.mark', () => {
  it('hides sessions from other churches (404, not 403)', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(session({ churchId: 'other' }));
    await expect(
      service.mark('s', { memberIds: [] }, actor()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.replaceRecords).not.toHaveBeenCalled();
  });

  it('rejects members that are not in the session church', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(session());
    repo.countMembersInChurch.mockResolvedValue(1); // only 1 of 2 valid
    await expect(
      service.mark('s', { memberIds: ['a', 'b'] }, actor()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.replaceRecords).not.toHaveBeenCalled();
  });

  it('replaces the present-set for a valid request', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(session());
    repo.countMembersInChurch.mockResolvedValue(2);
    const res = await service.mark('s', { memberIds: ['a', 'b'] }, actor());
    expect(res).toEqual({ success: true, presentCount: 2 });
    expect(repo.replaceRecords).toHaveBeenCalledWith('s', ['a', 'b']);
  });

  it('refuses to edit a reviewed roll', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(
      session({ status: AttendanceStatus.REVIEWED }),
    );
    await expect(
      service.mark('s', { memberIds: [] }, actor()),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.replaceRecords).not.toHaveBeenCalled();
  });
});

describe('AttendanceService.review', () => {
  it('rejects reviewing anything not SUBMITTED', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(session()); // DRAFT
    await expect(service.review('s', actor())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('allows self-review (recorder reviewing their own roll)', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(
      session({ status: AttendanceStatus.SUBMITTED, recordedById: 'u' }),
    );
    await service.review('s', actor({ id: 'u' }));
    expect(repo.updateSession).toHaveBeenCalledWith(
      's',
      expect.objectContaining({
        status: AttendanceStatus.REVIEWED,
        reviewedBy: { connect: { id: 'u' } },
      }),
    );
  });

  it('stamps reviewer + REVIEWED status on a valid review', async () => {
    const { service, repo } = make();
    repo.findSessionById.mockResolvedValue(
      session({ status: AttendanceStatus.SUBMITTED, recordedById: 'taker' }),
    );
    await service.review('s', actor({ id: 'reviewer' }));
    expect(repo.updateSession).toHaveBeenCalledWith(
      's',
      expect.objectContaining({
        status: AttendanceStatus.REVIEWED,
        reviewedBy: { connect: { id: 'reviewer' } },
      }),
    );
  });
});

describe('AttendanceService.createSession service types', () => {
  const serviceType = (over: Record<string, unknown> = {}) => ({
    id: 'st-1',
    churchId: 'church-1',
    name: 'Sunday Service',
    isActive: true,
    ...over,
  });

  const dto = { title: 'Sunday', date: new Date(), serviceTypeId: 'st-1' };

  it('rejects a service type belonging to another church', async () => {
    const { service, repo } = make();
    repo.findServiceTypeById.mockResolvedValue(
      serviceType({ churchId: 'other' }),
    );
    await expect(service.createSession(dto, actor())).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.createSession).not.toHaveBeenCalled();
  });

  it('rejects a retired service type', async () => {
    const { service, repo } = make();
    repo.findServiceTypeById.mockResolvedValue(serviceType({ isActive: false }));
    await expect(service.createSession(dto, actor())).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.createSession).not.toHaveBeenCalled();
  });

  it('connects an active in-church service type', async () => {
    const { service, repo } = make();
    repo.findServiceTypeById.mockResolvedValue(serviceType());
    await service.createSession(dto, actor());
    expect(repo.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ serviceType: { connect: { id: 'st-1' } } }),
    );
  });

  it('leaves the session unlinked when no type is given', async () => {
    const { service, repo } = make();
    await service.createSession({ title: 'One-off', date: new Date() }, actor());
    expect(repo.findServiceTypeById).not.toHaveBeenCalled();
    expect(repo.createSession).toHaveBeenCalledWith(
      expect.not.objectContaining({ serviceType: expect.anything() }),
    );
  });
});
