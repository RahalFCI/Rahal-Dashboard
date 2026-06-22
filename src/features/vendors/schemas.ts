import { z } from 'zod';

export const vendorProfileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(2, 'Display name is required.'),
  profilePictureUrl: z.string().optional(),
  countryCode: z.string().min(2, 'Country code is required.'),
  address: z.string().min(2, 'Address is required.'),
  addressUrl: z.string().url('Use a valid URL.').or(z.literal('')),
  categoryId: z.string().uuid('Choose a category.'),
  workingHours: z.string().optional(),
});

export type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

export const vendorCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required.'),
});

export type VendorCategoryFormValues = z.infer<typeof vendorCategorySchema>;
