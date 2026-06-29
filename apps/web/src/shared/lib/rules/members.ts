import { z } from 'zod';

export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(120),
  lastName: z.string().min(1, 'Last name is required').max(120),
  phone: z.string().max(32).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'VISITOR']),
});

export type CreateMemberFormInput = z.infer<typeof createMemberSchema>;
