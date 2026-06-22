import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getExplorerAchievementById } from '../api/explorerAchievementApi';

interface ExplorerAchievementDetailDialogProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExplorerAchievementDetailDialog({ id, open, onOpenChange }: ExplorerAchievementDetailDialogProps) {
  const earnedQuery = useQuery({
    queryKey: ['explorer-achievement', id],
    queryFn: () => getExplorerAchievementById(id!),
    enabled: open && Boolean(id),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Record details">
      {earnedQuery.isLoading ? <LoadingState label="Loading record..." /> : null}
      {earnedQuery.isError ? <ErrorState onRetry={() => void earnedQuery.refetch()} /> : null}
      {earnedQuery.data ? (
        <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Achievement</p>
            <p className="mt-1 font-medium text-on-surface">{earnedQuery.data.achievementTitle}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Record ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={earnedQuery.data.id}>
              {earnedQuery.data.id}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Achievement ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={earnedQuery.data.achievementId}>
              {earnedQuery.data.achievementId}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Explorer ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={earnedQuery.data.explorerId}>
              {earnedQuery.data.explorerId}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Earned at</p>
            <p className="mt-1 font-medium text-on-surface">{new Date(earnedQuery.data.earnedAt).toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Notified</p>
            <Badge className={earnedQuery.data.isNotified ? 'mt-1 bg-green-100 text-green-700' : 'mt-1'}>
              {earnedQuery.data.isNotified ? 'Notified' : 'Pending'}
            </Badge>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
