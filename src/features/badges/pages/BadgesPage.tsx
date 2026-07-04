import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit, Info, Medal, Plus, Trash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { matchesQuery, paginateClientSide } from '@/features/search/lib/clientSearch';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useToastStore } from '@/shared/stores/toastStore';
import { createBadge, deleteBadge, listBadges, permanentDeleteBadge, restoreBadge, updateBadge } from '../api/badgesApi';
import { BadgeDetailDialog } from '../components/BadgeDetailDialog';
import { BadgeDialog } from '../components/BadgeDialog';
import type { GetBadgeDto } from '../types';

const PAGE_SIZE = 10;
const FETCH_ALL_PAGE_SIZE = 500;

export function BadgesPage() {
  const [page, setPage] = useState(1);
  const [selectedBadge, setSelectedBadge] = useState<GetBadgeDto | null>(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [viewBadgeId, setViewBadgeId] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [confirmPermanentDeleteId, setConfirmPermanentDeleteId] = useState<string | null>(null);

  // GET /Badge/name/{name} (exposed as getBadgeByName) only does an exact,
  // case-sensitive match, so it can't power a type-as-you-go, case-insensitive
  // search. While a filter is active, fetch everything in one batch and
  // filter + re-paginate client-side instead - same pattern ChallengesPage
  // and SearchPage use for the same reason.
  const badgesQuery = useQuery({
    queryKey: ['badges', page],
    queryFn: () => listBadges(page, PAGE_SIZE),
    enabled: nameFilter.length === 0,
  });

  const allBadgesQuery = useQuery({
    queryKey: ['badges', 'all-for-filter'],
    queryFn: () => listBadges(1, FETCH_ALL_PAGE_SIZE),
    enabled: nameFilter.length > 0,
  });

  const activeBadgesQuery = nameFilter ? allBadgesQuery : badgesQuery;
  const badgesResult = nameFilter
    ? paginateClientSide((allBadgesQuery.data?.items ?? []).filter((b) => matchesQuery(b, nameFilter)), page, PAGE_SIZE)
    : badgesQuery.data;

  function changeNameFilter(value: string) {
    setNameFilter(value);
    setPage(1);
  }

  const upsertBadgeMutation = useMutation({
    mutationFn: async (values: { name: string; description: string }) => {
      if (selectedBadge) await updateBadge(selectedBadge.id, values);
      else await createBadge(values);
    },
    onSuccess: () => {
      setBadgeDialogOpen(false);
      setSelectedBadge(null);
      void queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });

  const invalidateBadges = () => void queryClient.invalidateQueries({ queryKey: ['badges'] });

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const restoreBadgeMutation = useMutation({
    mutationFn: (id: string) => restoreBadge(id),
    onSuccess: invalidateBadges,
    onError: toastOnError,
  });

  const permanentDeleteBadgeMutation = useMutation({
    mutationFn: (id: string) => permanentDeleteBadge(id),
    onSuccess: () => {
      setConfirmPermanentDeleteId(null);
      invalidateBadges();
      useToastStore.getState().add({ message: 'Badge permanently deleted.', variant: 'success' });
    },
    onError: (error) => {
      setConfirmPermanentDeleteId(null);
      toastOnError(error);
    },
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: (id: string) => deleteBadge(id),
    onSuccess: (_data, id) => {
      invalidateBadges();
      useToastStore.getState().add({
        message: 'Badge deleted.',
        variant: 'success',
        action: { label: 'Undo', onClick: () => restoreBadgeMutation.mutate(id) },
      });
    },
    onError: toastOnError,
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Badges"
        description="Gamification badges explorers can earn across the platform."
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelectedBadge(null);
              setBadgeDialogOpen(true);
            }}
          >
            <Plus size={17} />
            New badge
          </Button>
        }
      />

      <Panel className="mb-4 p-4">
        <Label htmlFor="badge-name-filter">Filter badges by name</Label>
        <Input
          id="badge-name-filter"
          placeholder="Type to filter, e.g. explorer"
          value={nameFilter}
          onChange={(event) => changeNameFilter(event.target.value)}
        />
      </Panel>

      {activeBadgesQuery.isLoading ? <LoadingState /> : null}
      {activeBadgesQuery.isError ? <ErrorState onRetry={() => void activeBadgesQuery.refetch()} /> : null}
      {badgesResult?.items.length === 0 ? (
        <EmptyState
          title={nameFilter ? 'No matches' : 'No badges yet'}
          description={nameFilter ? `No badge name matches "${nameFilter}".` : 'Badges appear here once they are created.'}
        />
      ) : null}
      {badgesResult && badgesResult.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {badgesResult.items.map((badge) => (
                  <tr key={badge.id} className="border-t border-outline/40">
                    <td className="px-4 py-3">
                      {badge.imageUrl ? (
                        <img
                          src={badge.imageUrl}
                          alt=""
                          className="size-9 rounded-full bg-surface-low object-cover"
                        />
                      ) : (
                        <span className="grid size-9 place-items-center rounded-full bg-surface-low text-on-surface-variant">
                          <Medal size={16} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{badge.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{badge.description}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(badge.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {badge.updatedAt ? new Date(badge.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View badge details"
                          onClick={() => setViewBadgeId(badge.id)}
                        >
                          <Info size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Edit badge"
                          onClick={() => {
                            setSelectedBadge(badge);
                            setBadgeDialogOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete badge"
                          onClick={() => void deleteBadgeMutation.mutate(badge.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Permanently delete badge"
                          className="text-error hover:text-error"
                          onClick={() => setConfirmPermanentDeleteId(badge.id)}
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
          <PaginationBar page={page} result={badgesResult} onPageChange={setPage} />
        </Panel>
      ) : null}

      <BadgeDialog
        open={badgeDialogOpen}
        badge={selectedBadge}
        onOpenChange={(open) => {
          setBadgeDialogOpen(open);
          if (!open) {
            setSelectedBadge(null);
            upsertBadgeMutation.reset();
          }
        }}
        onSubmit={(values) => upsertBadgeMutation.mutateAsync(values)}
        error={upsertBadgeMutation.isError ? upsertBadgeMutation.error.message : null}
      />

      <BadgeDetailDialog
        id={viewBadgeId}
        open={viewBadgeId !== null}
        onOpenChange={(open) => {
          if (!open) setViewBadgeId(null);
        }}
      />

      <Dialog
        open={confirmPermanentDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmPermanentDeleteId(null); }}
        title="Permanently delete badge?"
        description="This cannot be undone. The badge and all associated data will be removed from the database entirely and cannot be restored."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmPermanentDeleteId(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-on-error hover:bg-error/90"
            disabled={permanentDeleteBadgeMutation.isPending}
            onClick={() => confirmPermanentDeleteId && permanentDeleteBadgeMutation.mutate(confirmPermanentDeleteId)}
          >
            Delete permanently
          </Button>
        </div>
      </Dialog>
    </>
  );
}
