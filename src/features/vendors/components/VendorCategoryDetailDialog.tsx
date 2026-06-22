import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { getVendorCategoryById } from '../api/vendorCategoryApi';

interface VendorCategoryDetailDialogProps {
  categoryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorCategoryDetailDialog({ categoryId, open, onOpenChange }: VendorCategoryDetailDialogProps) {
  const categoryQuery = useQuery({
    queryKey: ['vendor-category', categoryId],
    queryFn: () => getVendorCategoryById(categoryId!),
    enabled: open && Boolean(categoryId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Category details">
      {categoryQuery.isLoading ? <LoadingState label="Loading category..." /> : null}
      {categoryQuery.isError ? <ErrorState onRetry={() => void categoryQuery.refetch()} /> : null}
      {categoryQuery.data ? (
        <Panel className="grid gap-3 p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Name</p>
            <p className="mt-1 font-medium text-on-surface">{categoryQuery.data.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">ID</p>
            <p className="mt-1 font-mono text-xs text-on-surface-variant" title={categoryQuery.data.id}>
              {categoryQuery.data.id.slice(0, 8)}…
            </p>
          </div>
        </Panel>
      ) : null}
    </Dialog>
  );
}
