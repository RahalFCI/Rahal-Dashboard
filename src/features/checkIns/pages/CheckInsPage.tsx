import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Eye, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { listPlaces } from '@/features/places/api/placesApi';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useExplorerNames } from '@/shared/hooks/useExplorerNames';
import { cn } from '@/shared/lib/utils';
import { useToastStore } from '@/shared/stores/toastStore';
import { deleteCheckIn, getPendingCheckIns, listCheckIns, updateCheckIn, type ValidationStatus } from '../api/checkInApi';
import { CheckInDetailDialog } from '../components/CheckInDetailDialog';

const statusBadgeClass: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

type CheckInsView = 'all' | 'pending';

const views: { value: CheckInsView; label: string }[] = [
  { value: 'all', label: 'All check-ins' },
  { value: 'pending', label: 'Pending' },
];

export function CheckInsPage() {
  const [view, setView] = useState<CheckInsView>('all');
  const [page, setPage] = useState(1);
  const [viewCheckIn, setViewCheckIn] = useState<{ explorerId: string; placeId: string } | null>(null);
  const [confirmDeleteCheckIn, setConfirmDeleteCheckIn] = useState<{ explorerId: string; placeId: string } | null>(null);

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const deleteMutation = useMutation({
    mutationFn: ({ explorerId, placeId }: { explorerId: string; placeId: string }) =>
      deleteCheckIn(explorerId, placeId),
    onSuccess: () => {
      setConfirmDeleteCheckIn(null);
      void queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      useToastStore.getState().add({ message: 'Check-in deleted.', variant: 'success' });
    },
    onError: (error) => {
      setConfirmDeleteCheckIn(null);
      toastOnError(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ explorerId, placeId, validationStatus }: { explorerId: string; placeId: string; validationStatus: ValidationStatus }) =>
      updateCheckIn(explorerId, placeId, { validationStatus }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      void queryClient.invalidateQueries({ queryKey: ['check-in'] });
      useToastStore.getState().add({ message: 'Check-in status updated.', variant: 'success' });
    },
    onError: toastOnError,
  });

  const checkInsQuery = useQuery({
    queryKey: ['check-ins', view, page],
    queryFn: () => (view === 'pending' ? getPendingCheckIns(page, 10) : listCheckIns(page, 10)),
  });

  function changeView(nextView: string) {
    setView(nextView as CheckInsView);
    setPage(1);
  }

  // The API currently omits the Place include on every list endpoint, so
  // placeName comes back empty for every row (same gap as Places'
  // categoryName). Resolve it client-side from the places list, already
  // fetched in bulk elsewhere in this dashboard for the same reason.
  const placesQuery = useQuery({
    queryKey: ['places-for-checkin-lookup'],
    queryFn: () => listPlaces(1, 500),
  });
  const placeNameById = new Map((placesQuery.data?.items ?? []).map((place) => [place.id, place.name]));

  const explorerNameById = useExplorerNames((checkInsQuery.data?.items ?? []).map((checkIn) => checkIn.explorerId));

  return (
    <>
      <PageHeader eyebrow="Admin" title="Check-ins" description="Every place check-in submitted by explorers, with validation status." />

      <Tabs.Root value={view} onValueChange={changeView}>
        <Tabs.List className="mb-4 flex flex-wrap gap-2">
          {views.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                'focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant',
                view === item.value && 'bg-primary text-white',
              )}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {checkInsQuery.isLoading ? <LoadingState /> : null}
      {checkInsQuery.isError ? <ErrorState onRetry={() => void checkInsQuery.refetch()} /> : null}
      {checkInsQuery.data?.items.length === 0 ? (
        <EmptyState
          title={view === 'pending' ? 'No pending check-ins' : 'No check-ins yet'}
          description={
            view === 'pending'
              ? 'Check-ins waiting on validation will appear here.'
              : 'Check-ins appear here as explorers visit places.'
          }
        />
      ) : null}
      {checkInsQuery.data && checkInsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Explorer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {checkInsQuery.data.items.map((checkIn) => (
                  <tr key={`${checkIn.explorerId}-${checkIn.placeId}`} className="border-t border-outline/40">
                    <td className="px-4 py-3 font-medium">
                      {placeNameById.get(checkIn.placeId) || checkIn.placeName || 'Unknown place'}
                    </td>
                    <td className="px-4 py-3 font-medium" title={checkIn.explorerId}>
                      {explorerNameById.get(checkIn.explorerId) || 'Unknown explorer'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadgeClass[checkIn.validationStatusName] ?? ''}>
                        {checkIn.validationStatusName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {checkIn.validationStatusName === 'Pending' ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Verify check-in"
                              className="text-green-600 hover:text-green-600"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ explorerId: checkIn.explorerId, placeId: checkIn.placeId, validationStatus: 'Verified' })}
                            >
                              <CheckCircle size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Fail check-in"
                              className="text-error hover:text-error"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ explorerId: checkIn.explorerId, placeId: checkIn.placeId, validationStatus: 'Failed' })}
                            >
                              <XCircle size={16} />
                            </Button>
                          </>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View check-in details"
                          onClick={() => setViewCheckIn({ explorerId: checkIn.explorerId, placeId: checkIn.placeId })}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete check-in"
                          disabled={deleteMutation.isPending}
                          onClick={() => setConfirmDeleteCheckIn({ explorerId: checkIn.explorerId, placeId: checkIn.placeId })}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} result={checkInsQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <CheckInDetailDialog
        explorerId={viewCheckIn?.explorerId ?? null}
        explorerName={viewCheckIn ? explorerNameById.get(viewCheckIn.explorerId) : undefined}
        placeId={viewCheckIn?.placeId ?? null}
        open={viewCheckIn !== null}
        onOpenChange={(open) => {
          if (!open) setViewCheckIn(null);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteCheckIn !== null}
        title="Delete this check-in?"
        description="This can be undone."
        isConfirming={deleteMutation.isPending}
        onConfirm={() => confirmDeleteCheckIn && deleteMutation.mutate(confirmDeleteCheckIn)}
        onCancel={() => setConfirmDeleteCheckIn(null)}
      />
    </>
  );
}
