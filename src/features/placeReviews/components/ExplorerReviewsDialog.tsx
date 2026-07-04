import { useMutation, useQuery } from '@tanstack/react-query';
import { Info, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { deleteReview, getReviewsByExplorerId } from '../api/placeReviewApi';
import { ReviewDetailDialog } from './ReviewDetailDialog';

interface ExplorerReviewsDialogProps {
  explorerId: string | null;
  explorerName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReviewKey {
  explorerId: string;
  placeId: string;
  checkInId: string;
}

export function ExplorerReviewsDialog({ explorerId, explorerName, open, onOpenChange }: ExplorerReviewsDialogProps) {
  const [viewReviewKey, setViewReviewKey] = useState<ReviewKey | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<ReviewKey | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ['place-reviews', 'by-explorer', explorerId],
    queryFn: () => getReviewsByExplorerId(explorerId!),
    enabled: open && Boolean(explorerId),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (key: ReviewKey) => deleteReview(key.explorerId, key.placeId, key.checkInId),
    onSuccess: () => {
      setConfirmDeleteKey(null);
      void queryClient.invalidateQueries({ queryKey: ['place-reviews'] });
    },
    onError: () => setConfirmDeleteKey(null),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Reviews by this explorer" description={explorerName || explorerId || undefined}>
      {reviewsQuery.isLoading ? <LoadingState /> : null}
      {reviewsQuery.isError ? <ErrorState onRetry={() => void reviewsQuery.refetch()} /> : null}
      {reviewsQuery.data && reviewsQuery.data.length === 0 ? (
        <EmptyState title="No reviews" description="This explorer hasn't reviewed any place yet." />
      ) : null}
      {reviewsQuery.data && reviewsQuery.data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reviewsQuery.data.map((review) => (
                <tr key={review.checkInId} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-medium">{review.placeName || 'Unknown place'}</td>
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
        explorerName={explorerName ?? undefined}
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
