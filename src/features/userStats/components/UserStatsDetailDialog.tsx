import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getUserStatsByExplorerId } from '../api/userStatsApi';

interface UserStatsDetailDialogProps {
  explorerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fields: { key: 'availableXp' | 'cumulativeXp' | 'currentStreak' | 'longestStreak' | 'totalCheckIns' | 'totalChallengesCompleted' | 'totalAchievementsEarned' | 'totalBadgesEarned'; label: string }[] = [
  { key: 'availableXp', label: 'Available XP' },
  { key: 'cumulativeXp', label: 'Cumulative XP' },
  { key: 'currentStreak', label: 'Current streak' },
  { key: 'longestStreak', label: 'Longest streak' },
  { key: 'totalCheckIns', label: 'Check-ins' },
  { key: 'totalChallengesCompleted', label: 'Challenges completed' },
  { key: 'totalAchievementsEarned', label: 'Achievements earned' },
  { key: 'totalBadgesEarned', label: 'Badges earned' },
];

export function UserStatsDetailDialog({ explorerId, open, onOpenChange }: UserStatsDetailDialogProps) {
  const statsQuery = useQuery({
    queryKey: ['user-stats-by-explorer', explorerId],
    queryFn: () => getUserStatsByExplorerId(explorerId!),
    enabled: open && Boolean(explorerId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Explorer stats">
      {statsQuery.isLoading ? <LoadingState label="Loading stats..." /> : null}
      {statsQuery.isError ? <ErrorState onRetry={() => void statsQuery.refetch()} /> : null}
      {statsQuery.data ? (
        <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
          {fields.map((field) => (
            <div key={field.key}>
              <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{field.label}</p>
              <p className="mt-1 font-medium text-on-surface">{statsQuery.data[field.key].toLocaleString()}</p>
            </div>
          ))}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Last activity</p>
            <p className="mt-1 font-medium text-on-surface">
              {statsQuery.data.lastActivityDate ? new Date(statsQuery.data.lastActivityDate).toLocaleString() : 'Never'}
            </p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
