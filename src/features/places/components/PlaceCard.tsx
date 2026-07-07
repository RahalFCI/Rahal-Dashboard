import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Edit, MapPin, Star, Swords, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn, resolveMediaUrl } from '@/shared/lib/utils';
import { listPlacePhotos } from '../api/placesApi';
import { getCuratedPlacePhoto } from '../lib/placePhotos';
import type { GetPlaceCategoryDto, GetPlaceDto } from '../types';

interface PlaceCardProps {
  place: GetPlaceDto;
  category?: GetPlaceCategoryDto;
  layout: 'list' | 'grid';
  onEdit?: (place: GetPlaceDto) => void;
  onDelete?: (place: GetPlaceDto) => void;
  onViewCheckIns?: (place: GetPlaceDto) => void;
  onViewChallenges?: (place: GetPlaceDto) => void;
  onViewReviews?: (place: GetPlaceDto) => void;
}

export function PlaceCard({
  place,
  category,
  layout,
  onEdit,
  onDelete,
  onViewCheckIns,
  onViewChallenges,
  onViewReviews,
}: PlaceCardProps) {
  // Same query key PlaceThumbnail/VendorPlaceDetailPage use for this place's
  // photos, so the cache is shared across the app in the same session.
  const photosQuery = useQuery({
    queryKey: ['place-photos', place.id],
    queryFn: () => listPlacePhotos(place.id),
  });

  const [uploadedPhotoFailed, setUploadedPhotoFailed] = useState(false);

  const categoryName = category?.name || place.categoryName || 'Uncategorized';
  const uploadedPhoto = photosQuery.data?.[0];
  const uploadedUrl = uploadedPhoto ? (uploadedPhoto.photoUrl ?? uploadedPhoto.url ?? '') : '';
  const curatedUrl = getCuratedPlacePhoto(place.name, categoryName);
  // Admin-created places rarely have an uploaded photo yet, so fall back to a
  // curated real photo of the actual destination instead of a generic icon.
  // Some seeded records point at a fake, unreachable placeholder domain, so
  // also fall back if the "real" upload fails to actually load.
  const imageUrl = uploadedUrl && !uploadedPhotoFailed ? resolveMediaUrl(uploadedUrl) : curatedUrl;

  const isGrid = layout === 'grid';
  const hasActions = Boolean(onEdit || onDelete || onViewCheckIns || onViewChallenges || onViewReviews);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-surface-lowest shadow-ambient',
        isGrid ? 'flex flex-col' : 'flex flex-col sm:flex-row',
      )}
    >
      {/* Image with category tag overlay */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-surface-high',
          isGrid ? 'aspect-[4/3] w-full' : 'aspect-[4/3] sm:aspect-auto sm:w-72',
        )}
      >
        <img
          src={imageUrl}
          alt={place.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setUploadedPhotoFailed(true)}
        />
        <span className="absolute left-3 top-3 rounded-sm bg-inverse-surface/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-inverse-on-surface backdrop-blur-sm">
          {categoryName}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
        <div>
          <h3 className="text-xl font-semibold leading-tight text-on-surface">{place.name}</h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{place.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              {place.address?.city || 'Unknown'}, {place.address?.country || 'Unknown'}
            </span>
            <span className="font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{categoryName}</span>
          </div>

          {category?.description ? <p className="mt-1 text-xs italic text-on-surface-variant/80">{category.description}</p> : null}
        </div>

        {hasActions ? (
          <div className="flex items-center justify-end gap-1">
            {onViewCheckIns ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="View check-ins at this place"
                onClick={() => onViewCheckIns(place)}
              >
                <CheckSquare size={16} />
              </Button>
            ) : null}
            {onViewChallenges ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="View challenges at this place"
                onClick={() => onViewChallenges(place)}
              >
                <Swords size={16} />
              </Button>
            ) : null}
            {onViewReviews ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="View reviews at this place"
                onClick={() => onViewReviews(place)}
              >
                <Star size={16} />
              </Button>
            ) : null}
            {onEdit ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Edit place" onClick={() => onEdit(place)}>
                <Edit size={16} />
              </Button>
            ) : null}
            {onDelete ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Delete place" onClick={() => onDelete(place)}>
                <Trash2 size={16} />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
