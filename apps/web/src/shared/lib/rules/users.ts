import { z } from 'zod';
import { NotificationChannel } from '@/shared/lib/types';

export const deliveryPreferencesSchema = z
  .object({
    phone: z.string().max(32).optional().or(z.literal('')),
    notifyVia: z.enum([
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.BOTH,
    ]),
  })
  .refine(
    (v) => v.notifyVia === NotificationChannel.EMAIL || v.phone,
    { message: 'A phone number is required for text delivery', path: ['phone'] },
  );

export type DeliveryPreferencesInput = z.infer<
  typeof deliveryPreferencesSchema
>;
