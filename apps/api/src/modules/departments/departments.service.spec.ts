import { UserRole } from '@prisma/client';
import { DepartmentsService } from './departments.service';

describe('DepartmentsService.findAll', () => {
  function build() {
    const repo = {
      findPage: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    };
    return { service: new DepartmentsService(repo as never), repo };
  }

  it('returns an empty page for a church-scoped actor with no church (no DB hit)', async () => {
    const { service, repo } = build();
    const res = await service.findAll(
      { id: 'u', email: 'e', role: UserRole.DEPARTMENT_LEADER, churchId: null },
      { page: 1, pageSize: 25 },
    );
    expect(res).toEqual({ data: [], total: 0, page: 1, pageSize: 25 });
    expect(repo.findPage).not.toHaveBeenCalled();
  });

  it('scopes to the actor church and pushes search to the query', async () => {
    const { service, repo } = build();
    await service.findAll(
      { id: 'u', email: 'e', role: UserRole.ADMIN, churchId: 'church-1' },
      { page: 2, pageSize: 10, q: 'choir' },
    );
    const [where, skip] = repo.findPage.mock.calls[0];
    expect(skip).toBe(10);
    expect(where.AND[0]).toEqual({ churchId: 'church-1' });
    expect(where.AND[1].OR).toHaveLength(2);
  });
});
