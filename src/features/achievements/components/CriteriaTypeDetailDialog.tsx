import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getCriteriaTypeById } from '../api/achievementApi';

interface CriteriaTypeDetailDialogProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CriteriaTypeDetailDialog({ id, open, onOpenChange }: CriteriaTypeDetailDialogProps) {
  const criteriaTypeQuery = useQuery({
    queryKey: ['achievement-criteria-type', id],
    queryFn: () => getCriteriaTypeById(id!),
    enabled: open && Boolean(id),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Criteria type details">
      {criteriaTypeQuery.isLoading ? <LoadingState label="Loading criteria type..." /> : null}
      {criteriaTypeQuery.isError ? <ErrorState onRetry={() => void criteriaTypeQuery.refetch()} /> : null}
      {criteriaTypeQuery.data ? (
        <Panel className="grid gap-4 p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Name</p>
            <p className="mt-1 font-medium text-on-surface">{criteriaTypeQuery.data.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Description</p>
            <p className="mt-1 text-on-surface">{criteriaTypeQuery.data.description}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Criteria type ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={criteriaTypeQuery.data.id}>
              {criteriaTypeQuery.data.id}
            </p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
