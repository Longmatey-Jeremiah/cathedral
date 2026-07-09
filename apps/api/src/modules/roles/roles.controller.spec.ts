import { UserRole } from '@prisma/client';
import { RolesController } from './roles.controller';

/** Every enum value is returned exactly once with a non-empty label. */
describe('RolesController.findAll', () => {
  it('returns all UserRole values with labels', () => {
    const result = new RolesController().findAll();

    expect(result.map((r) => r.value).sort()).toEqual(
      Object.values(UserRole).sort(),
    );
    expect(result.every((r) => r.label.length > 0)).toBe(true);
  });
});
