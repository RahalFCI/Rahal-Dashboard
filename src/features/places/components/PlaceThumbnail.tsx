import { useQuery } from '@tanstack/react-query';
import { ImageOff } from 'lucide-react';
import { resolveMediaUrl } from '@/shared/lib/utils';
import { listPlacePhotos } from '../api/placesApi';

interface PlaceThumbnailProps {
  placeId: string;
}

export function PlaceThumbnail({ placeId }: PlaceThumbnailProps) {
  const photosQuery = useQuery({
    queryKey: ['place-photos', placeId],
    queryFn: () => listPlacePhotos(placeId),
  });

  const firstPhoto = photosQuery.data?.[0];
  const url = firstPhoto ? (firstPhoto.photoUrl ?? firstPhoto.url ?? '') : '';

  if (!url) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-low text-on-surface-variant">
        <ImageOff size={16} />
      </div>
    );
  }

  return <img src={resolveMediaUrl(url)} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />;
}
