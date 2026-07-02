export interface GetUserStatsDto {
  id: string;
  explorerId: string;
  explorerName: string;
  availableXp: number;
  cumulativeXp: number;
  currentStreak: number;
  lastActivityDate: string | null;
  totalCheckIns: number;
  totalChallengesCompleted: number;
  totalAchievementsEarned: number;
  totalBadgesEarned: number;
  longestStreak: number;
}
