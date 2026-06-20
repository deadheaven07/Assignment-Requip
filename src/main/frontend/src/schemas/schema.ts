import { z } from 'zod';

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .or(z.literal(''));

const optionalMobile = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Secondary mobile must be a valid 10-digit Indian mobile number')
  .optional()
  .or(z.literal(''));

const baseUserSchema = {
  name: z
    .string()
    .trim()
    .min(2, 'Name must be between 2 and 120 characters')
    .max(120, 'Name must be between 2 and 120 characters'),
  email: z
    .string()
    .trim()
    .email('Email must be well-formed')
    .max(254, 'Email must not exceed 254 characters'),
  primaryMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Primary mobile must be a valid 10-digit Indian mobile number'),
  secondaryMobile: optionalMobile,
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date < new Date();
    }, 'Date of birth must be in the past'),
  placeOfBirth: optionalText(120, 'Place of birth must not exceed 120 characters'),
  currentAddress: optionalText(500, 'Current address must not exceed 500 characters'),
  permanentAddress: optionalText(500, 'Permanent address must not exceed 500 characters'),
};

export const userSchema = z.object({
  ...baseUserSchema,
  pan: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must match the required format'),
  aadhaar: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
});

export const userUpdateSchema = z.object({
  ...baseUserSchema,
  pan: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must match the required format')
    .optional()
    .or(z.literal('')),
  aadhaar: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits')
    .optional()
    .or(z.literal('')),
});

export type UserFormValues = z.infer<typeof userSchema>;
