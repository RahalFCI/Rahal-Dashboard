import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listPlaces } from '@/features/places/api/placesApi';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getCheckInsByExplorerId } from '../api/checkInApi';

interface ExplorerCheckInsDialogProps {
  explorerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadgeClass: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export function ExplorerCheckInsDialog({ explorerId, open, onOpenChange }: ExplorerCheckInsDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a different explorer is opened, without an
  // effect (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? explorerId : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const checkInsQuery = useQuery({
    queryKey: ['check-ins', 'by-explorer', explorerId, page],
    queryFn: () => getCheckInsByExplorerId(explorerId!, page, 10),
    enabled: open && Boolean(explorerId),
  });

  // This explorer's check-ins can span many different places, so (unlike
  // PlaceCheckInsDialog) a single known name isn't enough - resolve each row's
  // placeName client-side the same way CheckInsPage does, since the list
  // endpoint omits the Place include server-side.
  const placesQuery = useQuery({
    queryKey: ['places-for-checkin-lookup'],
    queryFn: () => listPlaces(1, 500),
    enabled: open,
  });
  const placeNameById = new Map((placesQuery.data?.items ?? []).map((place) => [place.id, place.name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Check-ins by this explorer" description={explorerId ?? undefined}>
      {checkInsQuery.isLoading ? <LoadingState /> : null}
      {checkInsQuery.isError ? <ErrorState onRetry={() => void checkInsQuery.refetch()} /> : null}
      {checkInsQuery.data && checkInsQuery.data.items.length === 0 ? (
        <EmptyState title="No check-ins" description="This explorer hasn't checked in anywhere yet." />
      ) : null}
      {checkInsQuery.data && checkInsQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {checkInsQuery.data.items.map((checkIn) => (
                <tr key={checkIn.placeId} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-medium">
                    {placeNameById.get(checkIn.placeId) || checkIn.placeName || 'Unknown place'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusBadgeClass[checkIn.validationStatusName] ?? ''}>
                      {checkIn.validationStatusName}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationBar page={page} result={checkInsQuery.data} onPageChange={setPage} />
        </div>
      ) : null}
    </Dialog>
  );
}
