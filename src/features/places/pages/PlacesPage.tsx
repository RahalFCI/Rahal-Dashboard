import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { createPlace, deletePlace, listCategories, listPlaces, updatePlace } from '../api/placesApi';
import { PlaceDialog } from '../components/PlaceDialog';
import { PlaceTable } from '../components/PlaceTable';
import type { PlaceFormValues } from '../schemas';
import type { GetPlaceDto } from '../types';

export function PlacesPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GetPlaceDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const placesQuery = useQuery({ queryKey: ['places', page], queryFn: () => listPlaces(page, 10) });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['places'] });

  const upsertMutation = useMutation({
    mutationFn: (values: PlaceFormValues) => (selected ? updatePlace(selected.id, values) : createPlace(values)),
    onSuccess: () => {
      setDialogOpen(false);
      setSelected(null);
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (place: GetPlaceDto) => deletePlace(place.id),
    onSuccess: () => void invalidate(),
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Places"
        description="Create, update, and retire Rahal-curated places. Map-provider-specific tooling can be layered here later."
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={17} />
            New place
          </Button>
        }
      />

      {placesQuery.isLoading ? <LoadingState /> : null}
      {placesQuery.isError ? <ErrorState onRetry={() => void placesQuery.refetch()} /> : null}
      {placesQuery.data?.items.length === 0 ? <EmptyState title="No places yet" description="Create the first dashboard-managed place." /> : null}
      {placesQuery.data && placesQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <PlaceTable
            places={placesQuery.data.items}
            onEdit={(place) => {
              setSelected(place);
              setDialogOpen(true);
            }}
            onDelete={(place) => void deleteMutation.mutate(place)}
          />
          <PaginationBar page={page} result={placesQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <PlaceDialog
        open={dialogOpen}
        place={selected}
        categories={categoriesQuery.data ?? []}
        onOpenChange={setDialogOpen}
        onSubmit={(values) => upsertMutation.mutateAsync(values)}
      />
    </>
  );
}
