import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getExplorerAchievementsByAchievementId } from '../api/explorerAchievementApi';

interface AchievementEarnersDialogProps {
  achievementId: string | null;
  achievementTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementEarnersDialog({ achievementId, achievementTitle, open, onOpenChange }: AchievementEarnersDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a different achievement is opened, without an
  // effect (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? achievementId : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const earnersQuery = useQuery({
    queryKey: ['explorer-achievements', 'by-achievement', achievementId, page],
    queryFn: () => getExplorerAchievementsByAchievementId(achievementId!, page, 10),
    enabled: open && Boolean(achievementId),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={achievementTitle ? `Who earned "${achievementTitle}"` : 'Who earned this achievement'}
      description={achievementId ?? undefined}
    >
      {earnersQuery.isLoading ? <LoadingState /> : null}
      {earnersQuery.isError ? <ErrorState onRetry={() => void earnersQuery.refetch()} /> : null}
      {earnersQuery.data && earnersQuery.data.items.length === 0 ? (
        <EmptyState title="Nobody yet" description="No explorer has earned this achievement yet." />
      ) : null}
      {earnersQuery.data && earnersQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Explorer</th>
                <th className="px-4 py-3">Earned at</th>
                <th className="px-4 py-3">Notified</th>
              </tr>
            </thead>
            <tbody>
              {earnersQuery.data.items.map((earned) => (
                <tr key={earned.id} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant" title={earned.explorerId}>
                    {earned.explorerId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{new Date(earned.earnedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge className={earned.isNotified ? 'bg-green-100 text-green-700' : ''}>
                      {earned.isNotified ? 'Notified' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationBar page={page} result={earnersQuery.data} onPageChange={setPage} />
        </div>
      ) : null}
    </Dialog>
  );
}
