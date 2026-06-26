import { z } from 'zod';

export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  email: z.string().email('Enter a valid email'),
  role: z.enum(['ADMIN', 'FINANCE', 'DEPARTMENT_LEADER', 'VIEWER']),
});

export type CreateMemberFormInput = z.infer<typeof createMemberSchema>;
