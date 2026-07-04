import { CheckSquare, Edit, Image, Star, Swords, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { PlaceThumbnail } from './PlaceThumbnail';
import type { GetPlaceCategoryDto, GetPlaceDto } from '../types';

interface PlaceTableProps {
  places: GetPlaceDto[];
  categories?: GetPlaceCategoryDto[];
  onEdit?: (place: GetPlaceDto) => void;
  onDelete?: (place: GetPlaceDto) => void;
  onPhotos?: (place: GetPlaceDto) => void;
  onViewCheckIns?: (place: GetPlaceDto) => void;
  onViewChallenges?: (place: GetPlaceDto) => void;
  onViewReviews?: (place: GetPlaceDto) => void;
}

export function PlaceTable({
  places,
  categories = [],
  onEdit,
  onDelete,
  onPhotos,
  onViewCheckIns,
  onViewChallenges,
  onViewReviews,
}: PlaceTableProps) {
  const hasActions = Boolean(onEdit || onDelete || onPhotos || onViewCheckIns || onViewChallenges || onViewReviews);
  // The API currently omits the PlaceCategory include, so categoryName comes back
  // empty for every place. Look the name up from the already-fetched category list
  // as a workaround until that's fixed server-side.
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
          <tr>
            <th className="px-4 py-3">Place</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Ticket</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Geofence</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {places.map((place) => (
            <tr key={place.id} className="border-t border-outline/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <PlaceThumbnail placeId={place.id} />
                  <div>
                    <p className="font-medium">{place.name}</p>
                    <p className="line-clamp-1 text-xs text-on-surface-variant">{place.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge>{categoryNameById.get(place.placeCategoryId) || place.categoryName || 'Uncategorized'}</Badge>
              </td>
              <td className="px-4 py-3">{place.ticketPrice.toLocaleString()} EGP</td>
              <td className="px-4 py-3 text-on-surface-variant">
                {place.address?.city || 'Unknown'}, {place.address?.country || 'Unknown'}
              </td>
              <td className="px-4 py-3">{place.geoFenceRange} m</td>
              <td className="px-4 py-3">
                {hasActions ? (
                  <div className="flex justify-end gap-1">
                    {onPhotos ? (
                      <Button type="button" variant="ghost" size="icon" aria-label="Manage photos" onClick={() => onPhotos(place)}>
                        <Image size={16} />
                      </Button>
                    ) : null}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
