import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(3, 'Enter the user\'s full name (at least 3 characters).').max(100, 'Name is too long.'),
    email: z.string().email('Use a valid email address.'),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Enter a valid phone number in international format (e.g. +201234567890).'),
    userRole: z.enum(['Explorer', 'Vendor']),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password needs an uppercase letter.')
      .regex(/[a-z]/, 'Password needs a lowercase letter.')
      .regex(/[0-9]/, 'Password needs a number.')
      .regex(/[!@#$%^&*()_+\-=[\]{};':",.<>?/\\|`~]/, 'Password needs a special character.'),
    confirmPassword: z.string().min(1, 'Confirm the password.'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;

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
