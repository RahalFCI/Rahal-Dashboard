import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getPlacesByCategory } from '../api/placesApi';
import { PlaceTable } from './PlaceTable';
import type { GetPlaceCategoryDto } from '../types';

interface CategoryPlacesDialogProps {
  category: GetPlaceCategoryDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryPlacesDialog({ category, open, onOpenChange }: CategoryPlacesDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a new category is opened, without an effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? category?.id ?? null : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const placesQuery = useQuery({
    queryKey: ['places', 'by-category', category?.id, page],
    queryFn: () => getPlacesByCategory(category?.id ?? '', page, 10),
    enabled: open && Boolean(category?.id),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Places in ${category?.name ?? ''}`}
      description="Read-only view scoped to this category."
    >
      {placesQuery.isLoading ? <LoadingState /> : null}
      {placesQuery.isError ? <ErrorState onRetry={() => void placesQuery.refetch()} /> : null}
      {placesQuery.data && placesQuery.data.items.length === 0 ? (
        <EmptyState title="No places" description="This category has no places yet." />
      ) : null}
      {placesQuery.data && placesQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <PlaceTable places={placesQuery.data.items} categories={category ? [category] : []} />
          <PaginationBar page={page} result={placesQuery.data} onPageChange={setPage} />
        </div>
      ) : null}
    </Dialog>
  );
}
