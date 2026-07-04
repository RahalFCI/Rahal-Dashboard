import { z } from 'zod';

export const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  description: z.string().min(4, 'Description is required.'),
  badgeId: z.string(),
  xpReward: z.coerce.number().int().min(0),
  criteriaTypeId: z.string().min(1, 'Choose a criteria type.'),
  criteriaThreshold: z.coerce.number().int().min(1),
});

export type AchievementFormValues = z.infer<typeof achievementSchema>;

export const criteriaTypeSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  description: z.string().min(4, 'Description is required.'),
});

export type CriteriaTypeFormValues = z.infer<typeof criteriaTypeSchema>;
