import { z } from 'zod';

export const planTierSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(80, 'Max 80 characters.'),
  description: z.string().max(500, 'Max 500 characters.'),
  weeklyPrice: z.coerce.number().min(0, 'Must be ≥ 0.'),
  weeklyXpCost: z.coerce.number().int().min(0, 'Must be ≥ 0.'),
  xpMultiplier: z.coerce.number().positive('Must be > 0.'),
  maxTravelPlans: z.coerce.number().int().min(0, 'Must be ≥ 0.'),
  isActive: z.boolean(),
});

export type PlanTierFormValues = z.infer<typeof planTierSchema>;
