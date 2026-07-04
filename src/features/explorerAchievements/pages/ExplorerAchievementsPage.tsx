import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, Info, Trash, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useToastStore } from '@/shared/stores/toastStore';
import { deleteExplorerAchievement, listExplorerAchievements, permanentDeleteExplorerAchievement, restoreExplorerAchievement } from '../api/explorerAchievementApi';
import { AchievementEarnersDialog } from '../components/AchievementEarnersDialog';
import { ExplorerAchievementDetailDialog } from '../components/ExplorerAchievementDetailDialog';
import { ExplorerAchievementsDialog } from '../components/ExplorerAchievementsDialog';

export function ExplorerAchievementsPage() {
  const [page, setPage] = useState(1);
  const [viewExplorerId, setViewExplorerId] = useState<string | null>(null);
  const [viewAchievement, setViewAchievement] = useState<{ id: string; title: string } | null>(null);
  const [viewRecordId, setViewRecordId] = useState<string | null>(null);
  const [confirmPermanentDeleteId, setConfirmPermanentDeleteId] = useState<string | null>(null);

  const achievementsQuery = useQuery({
    queryKey: ['explorer-achievements', page],
    queryFn: () => listExplorerAchievements(page, 10),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['explorer-achievements'] });

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreExplorerAchievement(id),
    onSuccess: invalidate,
    onError: toastOnError,
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => permanentDeleteExplorerAchievement(id),
    onSuccess: () => {
      setConfirmPermanentDeleteId(null);
      invalidate();
      useToastStore.getState().add({ message: 'Achievement permanently deleted.', variant: 'success' });
    },
    onError: (error) => {
      setConfirmPermanentDeleteId(null);
      toastOnError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExplorerAchievement(id),
    onSuccess: (_data, id) => {
      invalidate();
      // No "list deleted" endpoint exists for this resource, so this Undo
      // button is the only way to reach POST /ExplorerAchievement/{id}/restore.
      useToastStore.getState().add({
        message: 'Achievement deleted.',
        variant: 'success',
        action: { label: 'Undo', onClick: () => restoreMutation.mutate(id) },
      });
    },
    onError: toastOnError,
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Explorer achievements"
        description="Every achievement earned by explorers, with notification status."
      />

      {achievementsQuery.isLoading ? <LoadingState /> : null}
      {achievementsQuery.isError ? <ErrorState onRetry={() => void achievementsQuery.refetch()} /> : null}
      {achievementsQuery.data?.items.length === 0 ? (
        <EmptyState title="No earned achievements yet" description="Earned achievements appear here as explorers unlock them." />
      ) : null}
      {achievementsQuery.data && achievementsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Achievement</th>
                  <th className="px-4 py-3">Explorer</th>
                  <th className="px-4 py-3">Earned at</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {achievementsQuery.data.items.map((earned) => (
                  <tr key={earned.id} className="border-t border-outline/40">
                    <td className="px-4 py-3 font-medium">{earned.achievementTitle}</td>
                    <td className="px-4 py-3 font-medium" title={earned.explorerId}>
                      {earned.explorerName || 'Unknown explorer'}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{new Date(earned.earnedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View this record's details"
                          onClick={() => setViewRecordId(earned.id)}
                        >
                          <Info size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View all achievements for this explorer"
                          onClick={() => setViewExplorerId(earned.explorerId)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View everyone who earned this achievement"
                          onClick={() => setViewAchievement({ id: earned.achievementId, title: earned.achievementTitle })}
                        >
                          <Users size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete this earned achievement"
                          onClick={() => void deleteMutation.mutate(earned.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Permanently delete this earned achievement"
                          className="text-error hover:text-error"
                          onClick={() => setConfirmPermanentDeleteId(earned.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} result={achievementsQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <ExplorerAchievementsDialog
        explorerId={viewExplorerId}
        explorerName={achievementsQuery.data?.items.find((e) => e.explorerId === viewExplorerId)?.explorerName}
        open={viewExplorerId !== null}
        onOpenChange={(open) => {
          if (!open) setViewExplorerId(null);
        }}
      />

      <AchievementEarnersDialog
        achievementId={viewAchievement?.id ?? null}
        achievementTitle={viewAchievement?.title}
        open={viewAchievement !== null}
        onOpenChange={(open) => {
          if (!open) setViewAchievement(null);
        }}
      />

      <ExplorerAchievementDetailDialog
        id={viewRecordId}
        open={viewRecordId !== null}
        onOpenChange={(open) => {
          if (!open) setViewRecordId(null);
        }}
      />

      <Dialog
        open={confirmPermanentDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmPermanentDeleteId(null); }}
        title="Permanently delete achievement?"
        description="This cannot be undone. The earned achievement record will be removed from the database entirely and cannot be restored."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmPermanentDeleteId(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-on-error hover:bg-error/90"
            disabled={permanentDeleteMutation.isPending}
            onClick={() => confirmPermanentDeleteId && permanentDeleteMutation.mutate(confirmPermanentDeleteId)}
          >
            Delete permanently
          </Button>
        </div>
      </Dialog>
    </>
  );
}
