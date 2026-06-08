import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { createPlace, deletePlace, listCategories, listPlaces, updatePlace } from '@/features/places/api/placesApi';
import { PlaceDialog } from '@/features/places/components/PlaceDialog';
import { PlaceTable } from '@/features/places/components/PlaceTable';
import type { PlaceFormValues } from '@/features/places/schemas';
import type { GetPlaceDto } from '@/features/places/types';

export function VendorPlacesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GetPlaceDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const placesQuery = useQuery({ queryKey: ['vendor-places', page], queryFn: () => listPlaces(page, 10) });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: listCategories });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vendor-places'] });
  const upsertMutation = useMutation({
    mutationFn: (values: PlaceFormValues) => (selected ? updatePlace(selected.id, values) : createPlace(values)),
    onSuccess: () => {
      setDialogOpen(false);
      setSelected(null);
      void invalidate();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (place: GetPlaceDto) => deletePlace(place.id), onSuccess: () => void invalidate() });

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title="Places"
        description="Vendor-accessible place management using the current backend place endpoints."
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
      {placesQuery.data?.items.length === 0 ? <EmptyState title="No places" description="Create a place record to begin." /> : null}
      {placesQuery.data && placesQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <PlaceTable
            places={placesQuery.data.items}
            onEdit={(place) => {
              setSelected(place);
              setDialogOpen(true);
            }}
            onDelete={(place) => void deleteMutation.mutate(place)}
            onPhotos={(place) => navigate(`/vendor/places/${place.id}`)}
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
