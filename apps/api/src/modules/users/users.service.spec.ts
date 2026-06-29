import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';

/** Covers the pagination math + tenant/search where-merge in findAll. */
describe('UsersService.findAll', () => {
  function build() {
    const users = {
      findPage: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    };
    const service = new UsersService(
      users as never,
      {} as never,
      {} as never,
    );
    return { service, users };
  }

  const admin = {
    id: 'a',
    email: 'admin@x',
    role: UserRole.ADMIN,
    churchId: 'church-1',
  };

  it('scopes to the actor church and computes skip from page/pageSize', async () => {
    const { service, users } = build();
    await service.findAll(admin, { page: 3, pageSize: 25 });

    const [where, skip, take] = users.findPage.mock.calls[0];
    expect(skip).toBe(50); // (3 - 1) * 25
    expect(take).toBe(25);
    expect(where.AND[0]).toEqual({ churchId: 'church-1' });
  });

  it('super admin is not church-scoped', async () => {
    const { service, users } = build();
    await service.findAll(
      { ...admin, role: UserRole.SUPER_ADMIN, churchId: null },
      { page: 1, pageSize: 10 },
    );
    expect(users.findPage.mock.calls[0][0].AND[0]).toEqual({});
  });

  it('pushes search into an OR of email/firstName/lastName', async () => {
    const { service, users } = build();
    await service.findAll(admin, { page: 1, pageSize: 10, q: 'al' });

    const where = users.findPage.mock.calls[0][0];
    expect(where.AND[1].OR).toHaveLength(3);
    expect(where.AND[1].OR[0]).toEqual({
      email: { contains: 'al', mode: 'insensitive' },
    });
  });

  it('returns the paginated envelope', async () => {
    const { service, users } = build();
    users.findPage.mockResolvedValue({
      rows: [{ id: 'u1', password: 'secret', status: UserStatus.ACTIVE }],
      total: 1,
    });
    const res = await service.findAll(admin, { page: 1, pageSize: 10 });

    expect(res).toMatchObject({ total: 1, page: 1, pageSize: 10 });
    expect(res.data[0]).not.toHaveProperty('password');
  });
});
