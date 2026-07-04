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

export const vendorBranchSchema = z.object({
  branchName: z.string().min(2, 'Branch name is required.'),
  phoneNumber: z.string().max(30, 'Phone number must not exceed 30 characters.').optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters.').optional(),
  isActive: z.boolean(),
  placeName: z.string().min(2, 'Place name is required.'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters.').optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  geoFenceRange: z.coerce.number().int().min(1, 'Geofence range must be greater than zero.'),
  address: z.object({
    addressLine: z.string().min(2, 'Address is required.'),
    government: z.string().min(2, 'Government is required.'),
    city: z.string().min(2, 'City is required.'),
    country: z.string().min(2, 'Country is required.'),
  }),
});

export type VendorBranchFormValues = z.infer<typeof vendorBranchSchema>;
