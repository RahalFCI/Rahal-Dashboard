import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getChallengesByPlaceId } from '../api/challengeApi';

interface PlaceChallengesDialogProps {
  placeId: string | null;
  placeName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlaceChallengesDialog({ placeId, placeName, open, onOpenChange }: PlaceChallengesDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a different place is opened, without an effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? placeId : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const challengesQuery = useQuery({
    queryKey: ['challenges', 'by-place', placeId, page],
    queryFn: () => getChallengesByPlaceId(placeId!, page, 10),
    enabled: open && Boolean(placeId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={placeName ? `Challenges at ${placeName}` : 'Challenges at this place'}>
      {challengesQuery.isLoading ? <LoadingState /> : null}
      {challengesQuery.isError ? <ErrorState onRetry={() => void challengesQuery.refetch()} /> : null}
      {challengesQuery.data && challengesQuery.data.items.length === 0 ? (
        <EmptyState title="No challenges" description="This place has no challenges yet." />
      ) : null}
      {challengesQuery.data && challengesQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Challenge</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">XP reward</th>
              </tr>
            </thead>
            <tbody>
              {challengesQuery.data.items.map((challenge) => (
                <tr key={challenge.id} className="border-t border-outline/40">
                  <td className="px-4 py-3 font-medium">{challenge.name}</td>
                  <td className="px-4 py-3">
                    <Badge>{challenge.difficulty}</Badge>
                  </td>
                  <td className="px-4 py-3">{challenge.xpReward.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationBar page={page} result={challengesQuery.data} onPageChange={setPage} />
        </div>
      ) : null}
    </Dialog>
  );
}
