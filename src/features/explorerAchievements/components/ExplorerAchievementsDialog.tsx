import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getExplorerAchievementsByExplorerId } from '../api/explorerAchievementApi';

interface ExplorerAchievementsDialogProps {
  explorerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExplorerAchievementsDialog({ explorerId, open, onOpenChange }: ExplorerAchievementsDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a new explorer is opened, without an effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? explorerId : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const achievementsQuery = useQuery({
    queryKey: ['explorer-achievements', 'by-explorer', explorerId, page],
    queryFn: () => getExplorerAchievementsByExplorerId(explorerId!, page, 10),
    enabled: open && Boolean(explorerId),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Achievements for this explorer"
      description={explorerId ?? undefined}
    >
      {achievementsQuery.isLoading ? <LoadingState /> : null}
      {achievementsQuery.isError ? <ErrorState onRetry={() => void achievementsQuery.refetch()} /> : null}
      {achievementsQuery.data && achievementsQuery.data.items.length === 0 ? (
        <EmptyState title="No achievements" description="This explorer hasn't earned any achievements yet." />
      ) : null}
      {achievementsQuery.data && achievementsQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Achievement</th>
                <th className="px-4 py-3">Earned at</th>
                <th className="px-4 py-3">Notified</th>
              </tr>
            </thead>
            <tbody>
              {achievementsQuery.data.items.map((earned) => (
                <tr key={earned.id} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-medium">{earned.achievementTitle}</td>
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
          <PaginationBar page={page} result={achievementsQuery.data} onPageChange={setPage} />
        </div>
      ) : null}
    </Dialog>
  );
}
