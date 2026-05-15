import { z } from 'zod';

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const baseFields = {
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name is too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug is too long')
    .regex(slugRegex, 'Lowercase letters, numbers, and hyphens only'),
  address: z.string().max(255, 'Address is too long').optional().or(z.literal('')),
  phone: z.string().max(40, 'Phone is too long').optional().or(z.literal('')),
  email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
};

export const createChurchSchema = z.object(baseFields);
export type CreateChurchInput = z.infer<typeof createChurchSchema>;

export const updateChurchSchema = z.object({
  name: baseFields.name.optional(),
  slug: baseFields.slug.optional(),
  address: baseFields.address,
  phone: baseFields.phone,
  email: baseFields.email,
  isActive: baseFields.isActive.optional(),
});
export type UpdateChurchInput = z.infer<typeof updateChurchSchema>;

/** Build a URL-safe slug suggestion from a church name. */
export function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
