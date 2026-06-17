import { z } from 'zod';

export const loginSchema = z.object({
  role: z.enum(['Admin', 'Vendor']),
  email: z.string().email('Use a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Use a valid email address.'),
});

export const otpSchema = z.object({
  email: z.string().email('Use a valid email address.'),
  otp: z.string().regex(/^\d{6}$/, 'Use the 6 digit code.'),
});

export const resetPasswordSchema = otpSchema
  .extend({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password needs an uppercase letter.')
      .regex(/[a-z]/, 'Password needs a lowercase letter.')
      .regex(/[0-9]/, 'Password needs a number.')
      .regex(/[!@#$%^&*()_+\-=[\]{};':",.<>?/\\|`~]/, 'Password needs a special character.'),
    confirmPassword: z.string().min(8, 'Confirm the new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const registerSchema = z
  .object({
    displayName: z.string().min(3, 'Enter your full name (at least 3 characters).').max(100, 'Name is too long.'),
    email: z.string().email('Use a valid email address.'),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Enter a valid phone number in international format (e.g. +201234567890).'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password needs an uppercase letter.')
      .regex(/[a-z]/, 'Password needs a lowercase letter.')
      .regex(/[0-9]/, 'Password needs a number.')
      .regex(/[!@#$%^&*()_+\-=[\]{};':",.<>?/\\|`~]/, 'Password needs a special character.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
