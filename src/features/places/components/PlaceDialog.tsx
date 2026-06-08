import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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
  onSubmit: (values: PlaceFormValues) => Promise<unknown>;
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

export function PlaceDialog({ open, place, categories, onOpenChange, onSubmit }: PlaceDialogProps) {
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema) as Resolver<PlaceFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={place ? 'Edit place' : 'Create place'}>
      <form className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1" onSubmit={form.handleSubmit(onSubmit)}>
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
