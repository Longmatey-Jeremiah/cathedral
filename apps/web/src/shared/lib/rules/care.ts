import { z } from 'zod';

export const createCareNoteSchema = z.object({
  memberId: z.string().uuid('Choose a member'),
  type: z.enum(['VISIT', 'CALL', 'PRAYER', 'COUNSEL', 'FOLLOW_UP']),
  body: z.string().min(1, 'Write what happened').max(5000),
  confidential: z.boolean(),
  // Native <input type="date"> emits '' when empty — treat that as "no follow-up".
  followUpAt: z.string().optional().or(z.literal('')),
});

export type CreateCareNoteFormInput = z.infer<typeof createCareNoteSchema>;
