import { CareType, UserRole } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CareService } from './care.service';
import { CareNoteListQueryDto } from './dto/care-note-list.query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

const query = (
  over: Partial<CareNoteListQueryDto> = {},
): CareNoteListQueryDto => ({
  page: 1,
  pageSize: 25,
  sortBy: 'createdAt',
  sortDir: 'desc',
  ...over,
});

const actor = (over: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  id: 'u1',
  email: 'care@church.test',
  role: UserRole.MEMBER_CARE,
  churchId: 'church-1',
  ...over,
});

function repoStub() {
  return {
    findPage: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    findDetail: jest.fn(),
    findById: jest.fn(),
    summarize: jest.fn().mockResolvedValue({
      overdue: 0,
      openFollowUps: 0,
      notesThisMonth: 0,
    }),
    create: jest.fn().mockResolvedValue({ id: 'c1' }),
    update: jest.fn().mockResolvedValue({ id: 'c1' }),
    softDelete: jest.fn(),
    memberExistsInChurch: jest.fn().mockResolvedValue(1),
  };
}

function make() {
  const repo = repoStub();
  return { service: new CareService(repo as never), repo };
}

describe('CareService confidentiality', () => {
  it('hides other authors confidential notes from a non-admin', async () => {
    const { service, repo } = make();
    await service.findAll(actor(), query());
    const [where] = repo.findPage.mock.calls[0];
    expect(where.OR).toEqual([{ confidential: false }, { authorId: 'u1' }]);
  });

  it('applies no confidentiality filter for an admin', async () => {
    const { service, repo } = make();
    await service.findAll(actor({ role: UserRole.ADMIN }), query());
    const [where] = repo.findPage.mock.calls[0];
    expect(where.OR).toBeUndefined();
    expect(where.churchId).toBe('church-1');
  });

  it('applies the same filter to the summary counters', async () => {
    const { service, repo } = make();
    await service.summary(actor());
    const [visible] = repo.summarize.mock.calls[0];
    expect(visible.OR).toEqual([{ confidential: false }, { authorId: 'u1' }]);
  });

  it('reports another authors confidential note as missing, not forbidden', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({
      id: 'c1',
      churchId: 'church-1',
      confidential: true,
      authorId: 'someone-else',
    });
    await expect(service.findById('c1', actor())).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repo.findDetail).not.toHaveBeenCalled();
  });

  it('lets the author read their own confidential note', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({
      id: 'c1',
      churchId: 'church-1',
      confidential: true,
      authorId: 'u1',
    });
    repo.findDetail.mockResolvedValue({
      id: 'c1',
      churchId: 'church-1',
      member: { id: 'm1', firstName: 'Kofi', lastName: 'Mensah' },
      author: { id: 'u1', firstName: null, lastName: null, email: 'care@church.test' },
    });
    await expect(service.findById('c1', actor())).resolves.toMatchObject({
      member: { name: 'Kofi Mensah' },
      author: { name: 'care@church.test' },
    });
  });
});

describe('CareService.create', () => {
  it('rejects an actor with no church', async () => {
    const { service, repo } = make();
    await expect(
      service.create(
        { memberId: 'm1', type: CareType.CALL, body: 'x' },
        actor({ churchId: null }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects a member from another church', async () => {
    const { service, repo } = make();
    repo.memberExistsInChurch.mockResolvedValue(0);
    await expect(
      service.create({ memberId: 'm1', type: CareType.CALL, body: 'x' }, actor()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('defaults counselling notes to confidential', async () => {
    const { service, repo } = make();
    await service.create(
      { memberId: 'm1', type: CareType.COUNSEL, body: 'x' },
      actor(),
    );
    expect(repo.create.mock.calls[0][0].confidential).toBe(true);
  });

  it('leaves other note types open by default', async () => {
    const { service, repo } = make();
    await service.create(
      { memberId: 'm1', type: CareType.VISIT, body: 'x' },
      actor(),
    );
    expect(repo.create.mock.calls[0][0].confidential).toBe(false);
  });

  it('honours an explicit confidential flag over the type default', async () => {
    const { service, repo } = make();
    await service.create(
      { memberId: 'm1', type: CareType.COUNSEL, body: 'x', confidential: false },
      actor(),
    );
    expect(repo.create.mock.calls[0][0].confidential).toBe(false);
  });
});

describe('CareService follow-ups', () => {
  it('filters the overdue queue on unresolved + past due', async () => {
    const { service, repo } = make();
    await service.findAll(actor(), query({ followUp: 'overdue' }));
    const [where] = repo.findPage.mock.calls[0];
    expect(where.resolvedAt).toBeNull();
    expect(where.followUpAt.lt).toBeInstanceOf(Date);
  });

  it('flags overdue rows in the list output', async () => {
    const { service, repo } = make();
    const past = new Date(Date.now() - 86_400_000);
    repo.findPage.mockResolvedValue({
      rows: [
        {
          id: 'c1',
          memberId: 'm1',
          type: CareType.CALL,
          body: 'Called about the hospital visit\nsecond line',
          confidential: false,
          followUpAt: past,
          resolvedAt: null,
          createdAt: past,
          member: { firstName: 'Kofi', lastName: 'Mensah' },
          author: { firstName: 'Ama', lastName: 'Owusu', email: 'a@b.c' },
        },
      ],
      total: 1,
    });
    const res = await service.findAll(actor(), query());
    expect(res.data[0]).toMatchObject({
      memberName: 'Kofi Mensah',
      authorName: 'Ama Owusu',
      excerpt: 'Called about the hospital visit', // first line only
      overdue: true,
    });
  });

  it('rejects resolving a note with no follow-up', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({
      id: 'c1',
      churchId: 'church-1',
      confidential: false,
      authorId: 'u1',
      followUpAt: null,
    });
    await expect(service.resolve('c1', actor())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects resolving twice', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({
      id: 'c1',
      churchId: 'church-1',
      confidential: false,
      authorId: 'u1',
      followUpAt: new Date(),
      resolvedAt: new Date(),
    });
    await expect(service.resolve('c1', actor())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('stamps resolvedAt on a live follow-up', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({
      id: 'c1',
      churchId: 'church-1',
      confidential: false,
      authorId: 'u1',
      followUpAt: new Date(),
      resolvedAt: null,
    });
    await service.resolve('c1', actor());
    expect(repo.update.mock.calls[0][1].resolvedAt).toBeInstanceOf(Date);
  });
});

describe('CareService edit rights', () => {
  const note = {
    id: 'c1',
    churchId: 'church-1',
    confidential: false,
    authorId: 'someone-else',
  };

  it('blocks a non-author non-admin from editing', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue(note);
    await expect(service.update('c1', { body: 'x' }, actor())).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('allows an admin to edit any note in their church', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue(note);
    await service.update('c1', { body: 'x' }, actor({ role: UserRole.ADMIN }));
    expect(repo.update).toHaveBeenCalled();
  });

  it('clears the follow-up when followUpAt is explicitly null', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ ...note, authorId: 'u1' });
    await service.update('c1', { followUpAt: null }, actor());
    expect(repo.update.mock.calls[0][1]).toEqual({ followUpAt: null });
  });

  it('leaves the follow-up untouched when followUpAt is omitted', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ ...note, authorId: 'u1' });
    await service.update('c1', { body: 'x' }, actor());
    expect(repo.update.mock.calls[0][1]).toEqual({ body: 'x' });
  });

  it('hides a note from another church (404, not 403)', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ ...note, churchId: 'other' });
    await expect(service.findById('c1', actor())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('soft-deletes rather than removing pastoral history', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ ...note, authorId: 'u1' });
    await expect(service.remove('c1', actor())).resolves.toEqual({ success: true });
    expect(repo.softDelete).toHaveBeenCalledWith('c1');
  });
});
