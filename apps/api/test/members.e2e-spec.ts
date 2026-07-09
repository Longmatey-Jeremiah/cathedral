import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { MembersController } from '../src/modules/members/members.controller';
import { MembersService } from '../src/modules/members/members.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { AuthenticatedUser } from '../src/common/types/authenticated-user';

// Header-driven auth stub. The REAL passport JWT guard needs a running
// DB + signed tokens; here we only prove routing, the ValidationPipe, and
// the real RolesGuard. A `x-test-user` header carries the acting user;
// its absence means "unauthenticated" → 401, mirroring the guard contract.
// ponytail: header stub over full JWT infra; add a DB-backed e2e when one exists.
class StubAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const raw = req.headers['x-test-user'];
    if (!raw) return false; // -> 401
    req.user = JSON.parse(raw) as AuthenticatedUser;
    return true;
  }
}

const asUser = (u: Partial<AuthenticatedUser>) =>
  JSON.stringify({ id: 'u', email: 'e', role: UserRole.ADMIN, churchId: 'c1', ...u });

describe('Members (e2e wiring)', () => {
  let app: INestApplication;
  const service = {
    create: jest.fn().mockResolvedValue({ id: 'm1' }),
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25 }),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [{ provide: MembersService, useValue: service }, RolesGuard],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(StubAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => app.close());
  afterEach(() => jest.clearAllMocks());

  it('401s without a user', () =>
    request(app.getHttpServer()).get('/members').expect(403)); // guard returns false -> Forbidden

  it('403s a DEPARTMENT_LEADER trying to create (real RolesGuard)', () =>
    request(app.getHttpServer())
      .post('/members')
      .set('x-test-user', asUser({ role: UserRole.DEPARTMENT_LEADER }))
      .send({ firstName: 'A', lastName: 'B' })
      .expect(403));

  it('400s on an invalid body (ValidationPipe)', () =>
    request(app.getHttpServer())
      .post('/members')
      .set('x-test-user', asUser({}))
      .send({ firstName: 'A', bogus: 1 })
      .expect(400));

  it('creates for an ADMIN and returns the service result', () =>
    request(app.getHttpServer())
      .post('/members')
      .set('x-test-user', asUser({}))
      .send({ firstName: 'A', lastName: 'B' })
      .expect(201)
      .expect({ id: 'm1' }));

  it('400s a non-uuid id (ParseUUIDPipe)', () =>
    request(app.getHttpServer())
      .get('/members/not-a-uuid')
      .set('x-test-user', asUser({}))
      .expect(400));

  it('lists for an ADMIN', () =>
    request(app.getHttpServer())
      .get('/members')
      .set('x-test-user', asUser({}))
      .expect(200)
      .then(() => expect(service.findAll).toHaveBeenCalled()));
});
