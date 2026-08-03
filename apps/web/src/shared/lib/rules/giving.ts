import { z } from 'zod';
import { toMinor } from '@/shared/lib/money';

export const recordDonationSchema = z.object({
  fundId: z.string().uuid('Choose a fund'),
  /** Empty string = anonymous giving, which is a valid entry. */
  memberId: z.string().uuid().optional().or(z.literal('')),
  // Kept as text so the field can show "1,250.50"; converted at submit.
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => toMinor(v) !== null, 'Enter a valid amount, e.g. 1250.50')
    .refine((v) => (toMinor(v) ?? 0) > 0, 'Amount must be more than zero'),
  method: z.enum(['CASH', 'TRANSFER', 'CARD', 'MOBILE_MONEY']),
  reference: z.string().max(120).optional().or(z.literal('')),
  givenAt: z.string().min(1, 'Pick the date it was given'),
});

export type RecordDonationFormInput = z.infer<typeof recordDonationSchema>;

export const createFundSchema = z.object({
  name: z.string().min(1, 'Name the fund').max(120),
});

export type CreateFundFormInput = z.infer<typeof createFundSchema>;
