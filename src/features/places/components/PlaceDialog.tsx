import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { placeSchema, type PlaceFormValues } from '../schemas';
import type { GetPlaceCategoryDto, GetPlaceDto } from '../types';

interface PlaceDialogProps {
  open: boolean;
  place?: GetPlaceDto | null;
  categories: GetPlaceCategoryDto[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PlaceFormValues, photo: File | null) => Promise<unknown>;
  // Set once a new place has been created but its photo failed to upload -
  // creating the place is not undone in that case (see PlacesPage), so the
  // dialog switches into a small retry-only view instead of losing the record.
  createdPlaceId?: string | null;
  onRetryPhoto?: (photo: File) => Promise<unknown>;
  onSkipPhoto?: () => void;
  photoError?: string | null;
  isSubmittingPhoto?: boolean;
}

const defaultValues: PlaceFormValues = {
  name: '',
  description: '',
  placeCategoryId: '',
  ticketPrice: 0,
  latitude: 30.0444,
  longitude: 31.2357,
  geoFenceRange: 50,
  address: {
    addressLine: '',
    government: '',
    city: '',
    country: 'Egypt',
  },
};

export function PlaceDialog({
  open,
  place,
  categories,
  onOpenChange,
  onSubmit,
  createdPlaceId,
  onRetryPhoto,
  onSkipPhoto,
  photoError,
  isSubmittingPhoto,
}: PlaceDialogProps) {
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema) as Resolver<PlaceFormValues>,
    defaultValues,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [retryPhoto, setRetryPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhoto(null);
    setRetryPhoto(null);
    form.reset(
      place
        ? {
            name: place.name,
            description: place.description,
            placeCategoryId: place.placeCategoryId,
            ticketPrice: place.ticketPrice,
            latitude: place.latitude,
            longitude: place.longitude,
            geoFenceRange: place.geoFenceRange,
            address: place.address ?? defaultValues.address,
          }
        : defaultValues,
    );
  }, [form, open, place]);

  if (createdPlaceId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} title="Add a photo">
        <div className="grid gap-4">
          <p className="text-sm text-on-surface-variant">
            The place was created, but the photo didn&apos;t upload{photoError ? `: ${photoError}` : '.'} Try again,
            or skip for now and add one later.
          </p>
          <div>
            <Label htmlFor="retryPhoto">Photo</Label>
            <Input
              id="retryPhoto"
              type="file"
              accept="image/*"
              onChange={(event) => setRetryPhoto(event.target.files?.[0] ?? null)}
            />
          </div>
          <FieldError message={photoError ?? undefined} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onSkipPhoto}>
              Skip for now
            </Button>
            <Button
              type="button"
              disabled={!retryPhoto || isSubmittingPhoto}
              onClick={() => retryPhoto && onRetryPhoto?.(retryPhoto)}
            >
              Upload photo
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={place ? 'Edit place' : 'Create place'}>
      <form
        className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1"
        onSubmit={form.handleSubmit((values) => onSubmit(values, photo))}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="placeCategoryId">Category</Label>
            <Select id="placeCategoryId" {...form.register('placeCategoryId')}>
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.placeCategoryId?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="ticketPrice">Ticket price</Label>
            <Input id="ticketPrice" type="number" step="0.01" {...form.register('ticketPrice')} />
          </div>
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="0.000001" {...form.register('latitude')} />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="0.000001" {...form.register('longitude')} />
          </div>
        </div>
        <div>
          <Label htmlFor="geoFenceRange">Geofence range</Label>
          <Input id="geoFenceRange" type="number" {...form.register('geoFenceRange')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="addressLine">Address line</Label>
            <Input id="addressLine" {...form.register('address.addressLine')} />
          </div>
          <div>
            <Label htmlFor="government">Government</Label>
            <Input id="government" {...form.register('address.government')} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register('address.city')} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register('address.country')} />
          </div>
        </div>
        {!place ? (
          <div>
            <Label htmlFor="photo">Photo (optional)</Label>
            <Input id="photo" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>{place ? 'Save place' : 'Create place'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
