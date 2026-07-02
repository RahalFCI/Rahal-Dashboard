import { z } from 'zod';

export const challengeSchema = z.object({
  placeId: z.string().min(1, 'Choose a place.'),
  name: z.string().min(2, 'Name is required.').max(200, 'Name cannot exceed 200 characters.'),
  description: z.string().min(4, 'Description is required.').max(500, 'Description cannot exceed 500 characters.'),
  validationPrompt: z
    .string()
    .min(4, 'Validation prompt is required.')
    .max(1000, 'Validation prompt cannot exceed 1000 characters.'),
  type: z.string().min(1, 'Choose a type.'),
  difficulty: z.string().min(1, 'Choose a difficulty.'),
  minimumLevelRequired: z.coerce.number().int().min(1, 'Must be greater than 0.'),
  xpReward: z.coerce.number().int().min(1, 'Must be greater than 0.'),
});

export type ChallengeFormValues = z.infer<typeof challengeSchema>;
