import { useMutation, useQuery } from '@tanstack/react-query';
import { Info, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { useExplorerNames } from '@/shared/hooks/useExplorerNames';
import { deleteReview, getReviewsByPlaceId, getVerifiedReviewsByPlaceId } from '../api/placeReviewApi';
import { ReviewDetailDialog } from './ReviewDetailDialog';

interface PlaceReviewsDialogProps {
  placeId: string | null;
  placeName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReviewsFilter = 'all' | 'verified';

interface ReviewKey {
  explorerId: string;
  placeId: string;
  checkInId: string;
}

export function PlaceReviewsDialog({ placeId, placeName, open, onOpenChange }: PlaceReviewsDialogProps) {
  const [filter, setFilter] = useState<ReviewsFilter>('all');
  const [viewReviewKey, setViewReviewKey] = useState<ReviewKey | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<ReviewKey | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ['place-reviews', placeId, filter],
    queryFn: () => (filter === 'verified' ? getVerifiedReviewsByPlaceId(placeId!) : getReviewsByPlaceId(placeId!)),
    enabled: open && Boolean(placeId),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (key: ReviewKey) => deleteReview(key.explorerId, key.placeId, key.checkInId),
    onSuccess: () => {
      setConfirmDeleteKey(null);
      void queryClient.invalidateQueries({ queryKey: ['place-reviews'] });
    },
    onError: () => setConfirmDeleteKey(null),
  });

  const explorerNameById = useExplorerNames((reviewsQuery.data ?? []).map((review) => review.explorerId), open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={placeName ? `Reviews at ${placeName}` : 'Reviews at this place'}>
      <div className="mb-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={filter === 'all' ? 'primary' : 'ghost'}
          onClick={() => setFilter('all')}
        >
          All reviews
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'verified' ? 'primary' : 'ghost'}
          onClick={() => setFilter('verified')}
        >
          Verified only
        </Button>
      </div>

      {reviewsQuery.isLoading ? <LoadingState /> : null}
      {reviewsQuery.isError ? <ErrorState onRetry={() => void reviewsQuery.refetch()} /> : null}
      {reviewsQuery.data && reviewsQuery.data.length === 0 ? (
        <EmptyState
          title={filter === 'verified' ? 'No verified reviews' : 'No reviews'}
          description={
            filter === 'verified'
              ? 'No review at this place has been marked verified yet.'
              : 'No explorer has reviewed this place yet.'
          }
        />
      ) : null}
      {reviewsQuery.data && reviewsQuery.data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Explorer</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reviewsQuery.data.map((review) => (
                <tr key={`${review.explorerId}-${review.checkInId}`} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-medium" title={review.explorerId}>
                    {explorerNameById.get(review.explorerId) || 'Unknown explorer'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-current text-amber-500" />
                      {review.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{review.comment}</td>
                  <td className="px-4 py-3">
                    <Badge className={review.isVerified ? 'bg-green-100 text-green-700' : ''}>
                      {review.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="View review details"
                        onClick={() =>
                          setViewReviewKey({
                            explorerId: review.explorerId,
                            placeId: review.placeId,
                            checkInId: review.checkInId,
                          })
                        }
                      >
                        <Info size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete review"
                        onClick={() =>
                          setConfirmDeleteKey({
                            explorerId: review.explorerId,
                            placeId: review.placeId,
                            checkInId: review.checkInId,
                          })
                        }
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
      ) : null}

      <ReviewDetailDialog
        reviewKey={viewReviewKey}
        explorerName={viewReviewKey ? explorerNameById.get(viewReviewKey.explorerId) : undefined}
        open={viewReviewKey !== null}
        onOpenChange={(open) => {
          if (!open) setViewReviewKey(null);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteKey !== null}
        title="Delete this review?"
        description="This cannot be undone - there is no restore option for reviews."
        isConfirming={deleteReviewMutation.isPending}
        onConfirm={() => confirmDeleteKey && deleteReviewMutation.mutate(confirmDeleteKey)}
        onCancel={() => setConfirmDeleteKey(null)}
      />
    </Dialog>
  );
}
