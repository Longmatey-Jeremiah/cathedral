import { MemberStatus, UserRole } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberListQueryDto } from './dto/member-list.query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

const query = (over: Partial<MemberListQueryDto> = {}): MemberListQueryDto => ({
  page: 1,
  pageSize: 25,
  sortBy: 'name',
  sortDir: 'asc',
  ...over,
});

const actor = (over: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
  id: 'u',
  email: 'e',
  role: UserRole.ADMIN,
  churchId: 'church-1',
  ...over,
});

// Full repo double — each test stubs only the methods it exercises.
function repoStub() {
  return {
    findPage: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    findDetail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    replaceDepartments: jest.fn(),
    softDelete: jest.fn(),
    countDepartmentsInChurch: jest.fn(),
  };
}

function make() {
  const repo = repoStub();
  return { service: new MembersService(repo as never), repo };
}

describe('MembersService.findAll', () => {
  function build() {
    const repo = {
      findPage: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    };
    return { service: new MembersService(repo as never), repo };
  }

  it('returns an empty page for a church-scoped actor with no church (no DB hit)', async () => {
    const { service, repo } = build();
    const res = await service.findAll(
      { id: 'u', email: 'e', role: UserRole.DEPARTMENT_LEADER, churchId: null },
      query(),
    );
    expect(res).toEqual({ data: [], total: 0, page: 1, pageSize: 25 });
    expect(repo.findPage).not.toHaveBeenCalled();
  });

  it('scopes to church, filters by status/department, soft-delete aware', async () => {
    const { service, repo } = build();
    await service.findAll(
      { id: 'u', email: 'e', role: UserRole.ADMIN, churchId: 'church-1' },
      query({ status: MemberStatus.ACTIVE, departmentId: 'dept-1', q: 'kofi' }),
    );
    const [where] = repo.findPage.mock.calls[0];
    expect(where.deletedAt).toBeNull();
    expect(where.churchId).toBe('church-1');
    expect(where.status).toBe(MemberStatus.ACTIVE);
    expect(where.departments).toEqual({ some: { departmentId: 'dept-1' } });
    expect(where.OR).toHaveLength(3);
  });

  it('maps rows to the slim list item shape with departmentCount', async () => {
    const { service, repo } = build();
    repo.findPage.mockResolvedValue({
      rows: [
        {
          id: 'm1',
          firstName: 'Kofi',
          lastName: 'Mensah',
          phone: null,
          status: MemberStatus.ACTIVE,
          _count: { departments: 3 },
        },
      ],
      total: 1,
    });
    const res = await service.findAll(
      { id: 'u', email: 'e', role: UserRole.ADMIN, churchId: 'church-1' },
      query(),
    );
    expect(res.data[0]).toEqual({
      id: 'm1',
      name: 'Kofi Mensah',
      phone: null,
      status: MemberStatus.ACTIVE,
      departmentCount: 3,
    });
  });
});

describe('MembersService.create', () => {
  it('rejects an actor with no church', async () => {
    const { service, repo } = make();
    await expect(
      service.create({ firstName: 'A', lastName: 'B' } as never, actor({ churchId: null })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('validates departments belong to the church before creating', async () => {
    const { service, repo } = make();
    repo.countDepartmentsInChurch.mockResolvedValue(0); // none found
    await expect(
      service.create(
        { firstName: 'A', lastName: 'B', departments: [{ departmentId: 'd1' }] } as never,
        actor(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('connects the church and creates department links', async () => {
    const { service, repo } = make();
    repo.countDepartmentsInChurch.mockResolvedValue(1);
    repo.create.mockResolvedValue({ id: 'm1' });
    await service.create(
      { firstName: 'A', lastName: 'B', departments: [{ departmentId: 'd1' }] } as never,
      actor(),
    );
    const [data] = repo.create.mock.calls[0];
    expect(data.church).toEqual({ connect: { id: 'church-1' } });
    expect(data.departments.create[0]).toEqual({
      role: 'MEMBER',
      department: { connect: { id: 'd1' } },
    });
  });
});

describe('MembersService tenant scoping', () => {
  it('findById hides a member from another church (404, not 403)', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ id: 'm1', churchId: 'other' });
    await expect(service.findById('m1', actor())).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repo.findDetail).not.toHaveBeenCalled();
  });

  it('super admin bypasses church scoping', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ id: 'm1', churchId: 'other' });
    repo.findDetail.mockResolvedValue({ id: 'm1', churchId: 'other', departments: [] });
    await expect(
      service.findById('m1', actor({ role: UserRole.SUPER_ADMIN, churchId: null })),
    ).resolves.toMatchObject({ id: 'm1' });
  });

  it('remove soft-deletes after a tenant check', async () => {
    const { service, repo } = make();
    repo.findById.mockResolvedValue({ id: 'm1', churchId: 'church-1' });
    repo.softDelete.mockResolvedValue(undefined);
    await expect(service.remove('m1', actor())).resolves.toEqual({ success: true });
    expect(repo.softDelete).toHaveBeenCalledWith('m1');
  });
});
