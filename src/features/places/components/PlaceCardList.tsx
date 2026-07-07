import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { PlaceCard } from './PlaceCard';
import type { GetPlaceCategoryDto, GetPlaceDto } from '../types';

export type PlaceListLayout = 'list' | 'grid';

interface PlaceCardListProps {
  places: GetPlaceDto[];
  categories?: GetPlaceCategoryDto[];
  layout: PlaceListLayout;
  onEdit?: (place: GetPlaceDto) => void;
  onDelete?: (place: GetPlaceDto) => void;
  onViewCheckIns?: (place: GetPlaceDto) => void;
  onViewChallenges?: (place: GetPlaceDto) => void;
  onViewReviews?: (place: GetPlaceDto) => void;
}

export function PlaceCardList({
  places,
  categories = [],
  layout,
  onEdit,
  onDelete,
  onViewCheckIns,
  onViewChallenges,
  onViewReviews,
}: PlaceCardListProps) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const [pendingDelete, setPendingDelete] = useState<GetPlaceDto | null>(null);

  return (
    <>
      <div className={layout === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-5'}>
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            category={categoryById.get(place.placeCategoryId)}
            layout={layout}
            onEdit={onEdit}
            onDelete={onDelete ? () => setPendingDelete(place) : undefined}
            onViewCheckIns={onViewCheckIns}
            onViewChallenges={onViewChallenges}
            onViewReviews={onViewReviews}
          />
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.name}"?` : 'Delete place?'}
        description="This cannot be undone. The place and all associated data will be permanently removed."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete?.(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
