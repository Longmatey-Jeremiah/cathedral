import { z } from 'zod';

/** Optional free-text field: the form emits '', the API wants it omitted. */
const text = (max: number) => z.string().max(max).optional().or(z.literal(''));

/** Optional yyyy-mm-dd from a native date input. */
const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker')
  .optional()
  .or(z.literal(''));

/** The membership registration form. Only the names and status are required. */
export const memberSchema = z.object({
  // "Surname" and "Other Names" on the paper form.
  lastName: z.string().min(1, 'Surname is required').max(120),
  firstName: z.string().min(1, 'Other names are required').max(120),
  phone: text(32),
  status: z.enum(['ACTIVE', 'INACTIVE', 'VISITOR']),

  sex: z.enum(['MALE', 'FEMALE']).optional().or(z.literal('')),
  dateOfBirth: dateField,
  placeOfBirth: text(120),
  address: text(255),
  placeOfResidence: text(120),
  occupation: text(120),
  placeOfWork: text(120),
  society: text(120),
  nextOfKin: text(160),
  parentsName: text(255),
  hometown: text(120),
  maritalStatus: z
    .enum(['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED'])
    .optional()
    .or(z.literal('')),
  spouseName: text(160),
  spouseOccupation: text(120),
  religiousDenomination: text(120),
  /** One child per line — split into an array on save. */
  childrenNames: text(2000),
  declarationDate: dateField,
});

export type MemberFormInput = z.infer<typeof memberSchema>;

export const createMemberSchema = memberSchema;
export type CreateMemberFormInput = MemberFormInput;
