import { MemberStatus, UserRole } from '@prisma/client';
import { MembersService } from './members.service';
import { MemberListQueryDto } from './dto/member-list.query.dto';

const query = (over: Partial<MemberListQueryDto> = {}): MemberListQueryDto => ({
  page: 1,
  pageSize: 25,
  sortBy: 'name',
  sortDir: 'asc',
  ...over,
});

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
