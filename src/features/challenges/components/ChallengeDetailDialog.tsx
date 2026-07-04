import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getChallengeById } from '../api/challengeApi';

interface ChallengeDetailDialogProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChallengeDetailDialog({ id, open, onOpenChange }: ChallengeDetailDialogProps) {
  const challengeQuery = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => getChallengeById(id!),
    enabled: open && Boolean(id),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Challenge details">
      {challengeQuery.isLoading ? <LoadingState label="Loading challenge..." /> : null}
      {challengeQuery.isError ? <ErrorState onRetry={() => void challengeQuery.refetch()} /> : null}
      {challengeQuery.data ? (
        <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Name</p>
            <p className="mt-1 font-medium text-on-surface">{challengeQuery.data.name}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Description</p>
            <p className="mt-1 text-on-surface">{challengeQuery.data.description}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Validation prompt</p>
            <p className="mt-1 text-on-surface">{challengeQuery.data.validationPrompt || 'None set'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Type</p>
            <Badge className="mt-1">{challengeQuery.data.type}</Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Difficulty</p>
            <Badge className="mt-1">{challengeQuery.data.difficulty}</Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Minimum level</p>
            <p className="mt-1 font-medium text-on-surface">{challengeQuery.data.minimumLevelRequired}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">XP reward</p>
            <p className="mt-1 font-medium text-on-surface">{challengeQuery.data.xpReward.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Place ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={challengeQuery.data.placeId}>
              {challengeQuery.data.placeId}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Created</p>
            <p className="mt-1 text-on-surface-variant">{new Date(challengeQuery.data.createdAt).toLocaleString()}</p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
