import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { addPlacePhoto, deletePlacePhoto, getPlace, listPlacePhotos } from '@/features/places/api/placesApi';

export function VendorPlaceDetailPage() {
  const { placeId = '' } = useParams();
  const placeQuery = useQuery({ queryKey: ['place', placeId], queryFn: () => getPlace(placeId), enabled: Boolean(placeId) });
  const photosQuery = useQuery({
    queryKey: ['place-photos', placeId],
    queryFn: () => listPlacePhotos(placeId),
    enabled: Boolean(placeId),
  });

  const invalidatePhotos = () => queryClient.invalidateQueries({ queryKey: ['place-photos', placeId] });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => addPlacePhoto(placeId, file),
    onSuccess: () => void invalidatePhotos(),
  });
  const deleteMutation = useMutation({
    mutationFn: (url: string) => deletePlacePhoto(placeId, url),
    onSuccess: () => void invalidatePhotos(),
  });

  function uploadSelectedFile() {
    const file = (document.getElementById('placePhoto') as HTMLInputElement | null)?.files?.[0];
    if (file) void uploadMutation.mutate(file);
  }

  const photos = photosQuery.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title={placeQuery.data?.name ?? 'Place detail'}
        description={placeQuery.data?.description}
        actions={
          <Button asChild type="button" variant="ghost">
            <Link to="/vendor/places">
              <ArrowLeft size={17} />
              Back
            </Link>
          </Button>
        }
      />

      {placeQuery.isLoading ? <LoadingState label="Loading place..." /> : null}
      {placeQuery.isError ? <ErrorState onRetry={() => void placeQuery.refetch()} /> : null}

      <Panel className="mb-5 p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="placePhoto">Add photo</Label>
            <Input id="placePhoto" type="file" accept="image/*" />
          </div>
          <Button type="button" onClick={uploadSelectedFile} disabled={uploadMutation.isPending}>
            <ImagePlus size={17} />
            Upload
          </Button>
        </div>
      </Panel>

      {photosQuery.isLoading ? <LoadingState label="Loading photos..." /> : null}
      {photos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => {
            const url = photo.photoUrl ?? photo.url ?? '';
            return (
              <Panel key={`${url}-${index}`} className="overflow-hidden">
                {url ? <img src={url} alt="" className="aspect-video w-full object-cover" /> : null}
                <div className="flex items-center justify-between p-3">
                  <span className="truncate text-xs text-on-surface-variant">{url}</span>
                  <Button type="button" variant="ghost" size="icon" aria-label="Delete photo" onClick={() => void deleteMutation.mutate(url)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Panel className="p-8 text-sm text-on-surface-variant">No photos have been uploaded for this place.</Panel>
      )}
    </>
  );
}
