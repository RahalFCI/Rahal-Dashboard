import { z } from 'zod';

export const createCouponSchema = z.object({
  vendorId: z.string().min(1, 'A vendor must be selected.'),
  title: z.string().min(1, 'Title is required.').max(150, 'Max 150 characters.'),
  description: z.string().max(1000, 'Max 1000 characters.'),
  xpCost: z.coerce.number().int().min(0, 'Must be ≥ 0.'),
  discountType: z.coerce.number().int(),
  discountValue: z.coerce.number().positive('Must be > 0.'),
  maxDiscountValue: z.string(),
  minimumCharge: z.coerce.number().min(0, 'Must be ≥ 0.'),
  maxClaims: z.coerce.number().int().positive('Must be > 0.'),
  expiresAt: z.string().min(1, 'Expiry date is required.'),
  isActive: z.boolean(),
});

export type CreateCouponFormValues = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = z.object({
  description: z.string().max(1000, 'Max 1000 characters.'),
  xpCost: z.coerce.number().int().min(0, 'Must be ≥ 0.'),
  discountType: z.coerce.number().int(),
  discountValue: z.coerce.number().positive('Must be > 0.'),
  maxDiscountValue: z.string(),
  minimumCharge: z.coerce.number().min(0, 'Must be ≥ 0.'),
  maxClaims: z.coerce.number().int().positive('Must be > 0.'),
  expiresAt: z.string().min(1, 'Expiry date is required.'),
  isActive: z.boolean(),
});

export type UpdateCouponFormValues = z.infer<typeof updateCouponSchema>;
