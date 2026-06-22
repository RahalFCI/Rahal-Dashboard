export interface GetChallengeDto {
  id: string;
  placeId: string;
  name: string;
  description: string;
  validationPrompt: string;
  type: string;
  difficulty: string;
  minimumLevelRequired: number;
  xpReward: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}
