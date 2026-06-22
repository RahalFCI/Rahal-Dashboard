import { z } from 'zod';

export const badgeSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  description: z.string().min(4, 'Description is required.'),
});

export type BadgeFormValues = z.infer<typeof badgeSchema>;
