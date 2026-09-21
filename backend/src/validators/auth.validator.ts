import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .max(128, 'New password is too long'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long').optional(),
    email: z
      .string()
      .trim()
      .email('A valid email address is required (e.g. name@example.com)')
      .max(191, 'Email is too long')
      .optional(),
    currentPassword: z.string().min(1, 'Current password is required'),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide a name or email to update',
    path: ['name'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
