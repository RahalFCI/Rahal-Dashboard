export interface GetAchievementDto {
  id: string;
  title: string;
  description: string;
  badgeId: string | null;
  badgeName: string;
  xpReward: number;
  criteriaTypeId: string;
  criteriaCode: string;
  criteriaThreshold: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface GetAchievementCriteriaTypeDto {
  id: string;
  name: string;
  description: string;
}
