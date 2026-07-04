import { z } from 'zod';

const dayScheduleSchema = z
  .object({
    enabled: z.boolean(),
    opens: z.string(),
    closes: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.enabled) return;

    if (!value.opens) {
      ctx.addIssue({
        code: 'custom',
        path: ['opens'],
        message: 'Opening time is required.',
      });
    }

    if (!value.closes) {
      ctx.addIssue({
        code: 'custom',
        path: ['closes'],
        message: 'Closing time is required.',
      });
    }

    if (value.opens && value.closes && value.opens >= value.closes) {
      ctx.addIssue({
        code: 'custom',
        path: ['closes'],
        message: 'Closing time must be after opening time.',
      });
    }
  });

const workingHoursSchema = z.object({
  Sunday: dayScheduleSchema,
  Monday: dayScheduleSchema,
  Tuesday: dayScheduleSchema,
  Wednesday: dayScheduleSchema,
  Thursday: dayScheduleSchema,
  Friday: dayScheduleSchema,
  Saturday: dayScheduleSchema,
});

export const vendorProfileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(2, 'Display name is required.'),
  profilePictureUrl: z.string().optional(),
  countryCode: z.string().default('EG'),
  address: z.string().min(2, 'Address is required.'),
  addressUrl: z.string().url('Use a valid URL.').or(z.literal('')),
  categoryId: z.string().uuid('Choose a category.'),
  workingHours: workingHoursSchema,
});

export type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

export const vendorCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required.'),
});

export type VendorCategoryFormValues = z.infer<typeof vendorCategorySchema>;

export const vendorBranchSchema = z.object({
  branchName: z.string().min(2, 'Branch name is required.').max(120, 'Max 120 characters.'),
  phoneNumber: z.string().min(4, 'Phone number is required.').max(40, 'Max 40 characters.'),
  notes: z.string().max(500, 'Max 500 characters.'),
  isActive: z.boolean(),
  placeName: z.string().min(2, 'Place name is required.').max(160, 'Max 160 characters.'),
  description: z.string().max(1000, 'Max 1000 characters.'),
  latitude: z.coerce.number().min(-90, 'Latitude must be at least -90.').max(90, 'Latitude must be at most 90.'),
  longitude: z.coerce.number().min(-180, 'Longitude must be at least -180.').max(180, 'Longitude must be at most 180.'),
  geoFenceRange: z.coerce.number().int().min(1, 'Geofence range must be positive.'),
  addressLine: z.string().min(2, 'Address line is required.').max(240, 'Max 240 characters.'),
  government: z.string().min(2, 'Government is required.').max(120, 'Max 120 characters.'),
  city: z.string().min(2, 'City is required.').max(120, 'Max 120 characters.'),
  country: z.string().min(2, 'Country is required.').max(120, 'Max 120 characters.'),
});

export type VendorBranchFormValues = z.infer<typeof vendorBranchSchema>;
