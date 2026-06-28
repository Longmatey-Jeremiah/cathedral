import { z } from 'zod';

const fields = {
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name is too long'),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .or(z.literal('')),
};

export const createDepartmentSchema = z.object(fields);
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z.object({
  name: fields.name.optional(),
  description: fields.description,
});
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
