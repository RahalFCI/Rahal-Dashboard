import { z } from 'zod';

export const placeSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  description: z.string().min(8, 'Description is required.'),
  placeCategoryId: z.string().min(1, 'Choose a category.'),
  ticketPrice: z.coerce.number().min(0),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  geoFenceRange: z.coerce.number().int().min(10),
  address: z.object({
    addressLine: z.string().min(2, 'Address is required.'),
    government: z.string().min(2, 'Government is required.'),
    city: z.string().min(2, 'City is required.'),
    country: z.string().min(2, 'Country is required.'),
  }),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required.'),
  description: z.string().min(4, 'Description is required.'),
});

export type PlaceFormValues = z.infer<typeof placeSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
