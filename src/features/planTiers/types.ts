export interface GetPlanTierDto {
  id: string;
  name: string;
  description: string;
  weeklyPrice: number;
  weeklyXpCost: number;
  xpMultiplier: number;
  maxTravelPlans: number;
  isActive: boolean;
}
