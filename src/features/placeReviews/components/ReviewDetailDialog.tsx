import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getReview } from '../api/placeReviewApi';

interface ReviewKey {
  explorerId: string;
  placeId: string;
  checkInId: string;
}

interface ReviewDetailDialogProps {
  reviewKey: ReviewKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDetailDialog({ reviewKey, open, onOpenChange }: ReviewDetailDialogProps) {
  const reviewQuery = useQuery({
    queryKey: ['place-review', reviewKey?.explorerId, reviewKey?.placeId, reviewKey?.checkInId],
    queryFn: () => getReview(reviewKey!.explorerId, reviewKey!.placeId, reviewKey!.checkInId),
    enabled: open && Boolean(reviewKey),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Review details">
      {reviewQuery.isLoading ? <LoadingState label="Loading review..." /> : null}
      {reviewQuery.isError ? <ErrorState onRetry={() => void reviewQuery.refetch()} /> : null}
      {reviewQuery.data ? (
        <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Place</p>
            <p className="mt-1 font-medium text-on-surface">{reviewQuery.data.placeName || 'Unknown place'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Rating</p>
            <p className="mt-1 flex items-center gap-1 font-medium text-on-surface">
              <Star size={14} className="fill-current text-amber-500" />
              {reviewQuery.data.rating}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Status</p>
            <Badge className={reviewQuery.data.isVerified ? 'mt-1 bg-green-100 text-green-700' : 'mt-1'}>
              {reviewQuery.data.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Comment</p>
            <p className="mt-1 text-on-surface">{reviewQuery.data.comment}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Explorer ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={reviewQuery.data.explorerId}>
              {reviewQuery.data.explorerId}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Check-in ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={reviewQuery.data.checkInId}>
              {reviewQuery.data.checkInId}
            </p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
