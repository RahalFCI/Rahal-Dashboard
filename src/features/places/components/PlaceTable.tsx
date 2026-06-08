import { Edit, Image, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { GetPlaceDto } from '../types';

interface PlaceTableProps {
  places: GetPlaceDto[];
  onEdit: (place: GetPlaceDto) => void;
  onDelete: (place: GetPlaceDto) => void;
  onPhotos?: (place: GetPlaceDto) => void;
}

export function PlaceTable({ places, onEdit, onDelete, onPhotos }: PlaceTableProps) {
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
                <p className="font-medium">{place.name}</p>
                <p className="line-clamp-1 text-xs text-on-surface-variant">{place.description}</p>
              </td>
              <td className="px-4 py-3">
                <Badge>{place.categoryName || 'Uncategorized'}</Badge>
              </td>
              <td className="px-4 py-3">{place.ticketPrice.toLocaleString()} EGP</td>
              <td className="px-4 py-3 text-on-surface-variant">
                {place.address?.city || 'Unknown'}, {place.address?.country || 'Unknown'}
              </td>
              <td className="px-4 py-3">{place.geoFenceRange} m</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  {onPhotos ? (
                    <Button type="button" variant="ghost" size="icon" aria-label="Manage photos" onClick={() => onPhotos(place)}>
                      <Image size={16} />
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" size="icon" aria-label="Edit place" onClick={() => onEdit(place)}>
                    <Edit size={16} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Delete place" onClick={() => onDelete(place)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
