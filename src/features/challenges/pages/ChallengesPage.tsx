import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, Plus, Search, Trash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { listPlaces } from '@/features/places/api/placesApi';
import { matchesQuery, paginateClientSide } from '@/features/search/lib/clientSearch';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';
import { useToastStore } from '@/shared/stores/toastStore';
import { createChallenge, deleteChallenge, listChallenges, permanentDeleteChallenge, restoreChallenge } from '../api/challengeApi';
import { ChallengeDetailDialog } from '../components/ChallengeDetailDialog';
import { ChallengeDialog } from '../components/ChallengeDialog';

const PAGE_SIZE = 10;
const FETCH_ALL_PAGE_SIZE = 500;

export function ChallengesPage() {
  const [page, setPage] = useState(1);
  const [viewChallengeId, setViewChallengeId] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [confirmPermanentDeleteId, setConfirmPermanentDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // GET /Challenge/name/{name} (used elsewhere via getChallengeByName) only
  // does an exact, case-sensitive match, so it can't power a type-as-you-go,
  // case-insensitive search. While a filter is active, fetch everything in
  // one batch and filter + re-paginate client-side instead - same pattern
  // SearchPage.tsx uses for the same reason.
  const challengesQuery = useQuery({
    queryKey: ['challenges', page],
    queryFn: () => listChallenges(page, PAGE_SIZE),
    enabled: nameFilter.length === 0,
  });

  const allChallengesQuery = useQuery({
    queryKey: ['challenges', 'all-for-filter'],
    queryFn: () => listChallenges(1, FETCH_ALL_PAGE_SIZE),
    enabled: nameFilter.length > 0,
  });

  const activeQuery = nameFilter ? allChallengesQuery : challengesQuery;
  const result = nameFilter
    ? paginateClientSide((allChallengesQuery.data?.items ?? []).filter((c) => matchesQuery(c, nameFilter)), page, PAGE_SIZE)
    : challengesQuery.data;

  function changeNameFilter(value: string) {
    setNameFilter(value);
    setPage(1);
  }

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['challenges'] });

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const createMutation = useMutation({
    mutationFn: createChallenge,
    onSuccess: () => {
      setCreateDialogOpen(false);
      invalidate();
      useToastStore.getState().add({ message: 'Challenge created.', variant: 'success' });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreChallenge(id),
    onSuccess: invalidate,
    onError: toastOnError,
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => permanentDeleteChallenge(id),
    onSuccess: () => {
      setConfirmPermanentDeleteId(null);
      invalidate();
      useToastStore.getState().add({ message: 'Challenge permanently deleted.', variant: 'success' });
    },
    onError: (error) => {
      setConfirmPermanentDeleteId(null);
      toastOnError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChallenge(id),
    onSuccess: (_data, id) => {
      setConfirmDeleteId(null);
      invalidate();
      // No "list deleted" endpoint exists for this resource, so this Undo
      // button is the only way to reach POST /Challenge/{id}/restore.
      useToastStore.getState().add({
        message: 'Challenge deleted.',
        variant: 'success',
        action: { label: 'Undo', onClick: () => restoreMutation.mutate(id) },
      });
    },
    onError: (error) => {
      setConfirmDeleteId(null);
      toastOnError(error);
    },
  });

  // GetChallengeDto only exposes placeId, not a place name - resolve it
  // client-side from the places list, same workaround used elsewhere in this
  // dashboard for read-only display purposes.
  const placesQuery = useQuery({
    queryKey: ['places-for-checkin-lookup'],
    queryFn: () => listPlaces(1, 500),
  });
  const placeNameById = new Map((placesQuery.data?.items ?? []).map((place) => [place.id, place.name]));

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Challenges"
        description="Place-based challenges explorers can attempt, with difficulty and XP reward."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <input
                id="challenge-name-filter"
                type="text"
                aria-label="Filter challenges by name"
                placeholder="Search..."
                value={nameFilter}
                onChange={(event) => changeNameFilter(event.target.value)}
                className={cn(
                  'w-full rounded-full border-none bg-surface py-3 pl-6 pr-12 text-sm text-on-surface-variant/80 outline-none',
                  'placeholder:text-on-surface-variant/50',
                  'shadow-[6px_6px_12px_#d1c5b2,-6px_-6px_12px_#ffffff] transition-shadow duration-200',
                  'focus:shadow-[inset_3px_3px_6px_#d1c5b2,inset_-3px_-3px_6px_#ffffff]',
                )}
              />
              <Search
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
              />
            </div>
            <Button type="button" onClick={() => setCreateDialogOpen(true)}>
              <Plus size={17} />
              New challenge
            </Button>
          </div>
        }
      />

      {activeQuery.isLoading ? <LoadingState /> : null}
      {activeQuery.isError ? <ErrorState onRetry={() => void activeQuery.refetch()} /> : null}
      {result?.items.length === 0 ? (
        <EmptyState
          title={nameFilter ? 'No matches' : 'No challenges yet'}
          description={nameFilter ? `No challenge name matches "${nameFilter}".` : 'Create challenges for explorers to attempt at a place.'}
        />
      ) : null}
      {result && result.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Min level</th>
                  <th className="px-4 py-3">XP reward</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((challenge) => (
                  <tr key={challenge.id} className="border-t border-outline/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{challenge.name}</p>
                      <p className="line-clamp-1 text-xs text-on-surface-variant">{challenge.description}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {placeNameById.get(challenge.placeId) || 'Unknown place'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{challenge.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{challenge.difficulty}</Badge>
                    </td>
                    <td className="px-4 py-3">{challenge.minimumLevelRequired}</td>
                    <td className="px-4 py-3">{challenge.xpReward.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View challenge details"
                          onClick={() => setViewChallengeId(challenge.id)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete challenge"
                          onClick={() => setConfirmDeleteId(challenge.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Permanently delete challenge"
                          className="text-error hover:text-error"
                          onClick={() => setConfirmPermanentDeleteId(challenge.id)}
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
          <PaginationBar page={page} result={result} onPageChange={setPage} />
        </Panel>
      ) : null}

      <ChallengeDialog
        open={createDialogOpen}
        places={placesQuery.data?.items ?? []}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) createMutation.reset();
        }}
        onSubmit={(values) => createMutation.mutateAsync(values)}
        error={createMutation.isError ? createMutation.error.message : null}
      />

      <ChallengeDetailDialog
        id={viewChallengeId}
        open={viewChallengeId !== null}
        onOpenChange={(open) => {
          if (!open) setViewChallengeId(null);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete challenge?"
        description="You can undo this from the toast that appears right after deleting."
        isConfirming={deleteMutation.isPending}
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <Dialog
        open={confirmPermanentDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmPermanentDeleteId(null); }}
        title="Permanently delete challenge?"
        description="This cannot be undone. The challenge and all associated data will be removed from the database entirely and cannot be restored."
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
