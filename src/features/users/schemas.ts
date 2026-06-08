import { z } from 'zod';

export const userEditSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Use a valid email address.'),
  phoneNumber: z.string().min(6, 'Phone number is required.'),
  profilePictureUrl: z.string().optional(),
});

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(8, 'Old password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm the new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type UserEditValues = z.infer<typeof userEditSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
