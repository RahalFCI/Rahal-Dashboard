import { useQuery } from '@tanstack/react-query';
import { Medal } from 'lucide-react';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getBadgeById } from '../api/badgesApi';

interface BadgeDetailDialogProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BadgeDetailDialog({ id, open, onOpenChange }: BadgeDetailDialogProps) {
  const badgeQuery = useQuery({
    queryKey: ['badge', id],
    queryFn: () => getBadgeById(id!),
    enabled: open && Boolean(id),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Badge details">
      {badgeQuery.isLoading ? <LoadingState label="Loading badge..." /> : null}
      {badgeQuery.isError ? <ErrorState onRetry={() => void badgeQuery.refetch()} /> : null}
      {badgeQuery.data ? (
        <Panel className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="col-span-2 flex items-center gap-3">
            {badgeQuery.data.imageUrl ? (
              <img
                src={badgeQuery.data.imageUrl}
                alt=""
                className="size-12 rounded-full bg-surface-low object-cover"
              />
            ) : (
              <span className="grid size-12 place-items-center rounded-full bg-surface-low text-on-surface-variant">
                <Medal size={20} />
              </span>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Name</p>
              <p className="mt-1 font-medium text-on-surface">{badgeQuery.data.name}</p>
            </div>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Description</p>
            <p className="mt-1 text-on-surface">{badgeQuery.data.description}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Badge ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={badgeQuery.data.id}>
              {badgeQuery.data.id}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Created</p>
            <p className="mt-1 text-on-surface">{new Date(badgeQuery.data.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Updated</p>
            <p className="mt-1 text-on-surface">
              {badgeQuery.data.updatedAt ? new Date(badgeQuery.data.updatedAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
