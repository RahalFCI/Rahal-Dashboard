import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getAchievementById } from '../api/achievementApi';

interface AchievementDetailDialogProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementDetailDialog({ id, open, onOpenChange }: AchievementDetailDialogProps) {
  const achievementQuery = useQuery({
    queryKey: ['achievement', id],
    queryFn: () => getAchievementById(id!),
    enabled: open && Boolean(id),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Achievement details">
      {achievementQuery.isLoading ? <LoadingState label="Loading achievement..." /> : null}
      {achievementQuery.isError ? <ErrorState onRetry={() => void achievementQuery.refetch()} /> : null}
      {achievementQuery.data ? (
        <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Title</p>
            <p className="mt-1 font-medium text-on-surface">{achievementQuery.data.title}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Description</p>
            <p className="mt-1 text-on-surface">{achievementQuery.data.description}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Badge</p>
            <p className="mt-1 text-on-surface">{achievementQuery.data.badgeName || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">XP reward</p>
            <p className="mt-1 text-on-surface">{achievementQuery.data.xpReward.toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Criteria</p>
            <p className="mt-1 text-on-surface">
              {achievementQuery.data.criteriaCode} ≥ {achievementQuery.data.criteriaThreshold}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Achievement ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={achievementQuery.data.id}>
              {achievementQuery.data.id}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Created</p>
            <p className="mt-1 text-on-surface">{new Date(achievementQuery.data.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Updated</p>
            <p className="mt-1 text-on-surface">
              {achievementQuery.data.updatedAt ? new Date(achievementQuery.data.updatedAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
