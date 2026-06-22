import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getCheckIn } from '../api/checkInApi';

interface CheckInDetailDialogProps {
  explorerId: string | null;
  placeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadgeClass: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export function CheckInDetailDialog({ explorerId, placeId, open, onOpenChange }: CheckInDetailDialogProps) {
  const checkInQuery = useQuery({
    queryKey: ['check-in', explorerId, placeId],
    queryFn: () => getCheckIn(explorerId!, placeId!),
    enabled: open && Boolean(explorerId) && Boolean(placeId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Check-in details">
      {checkInQuery.isLoading ? <LoadingState label="Loading check-in..." /> : null}
      {checkInQuery.isError ? <ErrorState onRetry={() => void checkInQuery.refetch()} /> : null}
      {checkInQuery.data ? (
        <Panel className="grid gap-3 p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Place</p>
            <p className="mt-1 font-medium text-on-surface">{checkInQuery.data.placeName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Explorer ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={checkInQuery.data.explorerId}>
              {checkInQuery.data.explorerId}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Status</p>
            <Badge className={`mt-1 ${statusBadgeClass[checkInQuery.data.validationStatusName] ?? ''}`}>
              {checkInQuery.data.validationStatusName}
            </Badge>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
