import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getCheckInsByPlace } from '../api/checkInApi';

interface PlaceCheckInsDialogProps {
  placeId: string | null;
  placeName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadgeClass: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export function PlaceCheckInsDialog({ placeId, placeName, open, onOpenChange }: PlaceCheckInsDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a different place is opened, without an effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? placeId : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const checkInsQuery = useQuery({
    queryKey: ['check-ins', 'by-place', placeId, page],
    queryFn: () => getCheckInsByPlace(placeId!, page, 10),
    enabled: open && Boolean(placeId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={placeName ? `Check-ins at ${placeName}` : 'Check-ins at this place'}>
      {checkInsQuery.isLoading ? <LoadingState /> : null}
      {checkInsQuery.isError ? <ErrorState onRetry={() => void checkInsQuery.refetch()} /> : null}
      {checkInsQuery.data && checkInsQuery.data.items.length === 0 ? (
        <EmptyState title="No check-ins" description="No explorer has checked in at this place yet." />
      ) : null}
      {checkInsQuery.data && checkInsQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Explorer</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {checkInsQuery.data.items.map((checkIn) => (
                <tr key={checkIn.explorerId} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant" title={checkIn.explorerId}>
                    {checkIn.explorerId.slice(0, 8)}…
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
