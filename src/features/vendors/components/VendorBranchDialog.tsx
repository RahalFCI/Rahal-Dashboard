import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { vendorBranchSchema, type VendorBranchFormValues } from '../schemas';
import type { UpsertVendorBranchDto, VendorBranchDto } from '../types';

interface VendorBranchDialogProps {
  branch?: VendorBranchDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpsertVendorBranchDto) => Promise<unknown>;
}

const emptyValues: VendorBranchFormValues = {
  branchName: '',
  phoneNumber: '',
  notes: '',
  isActive: true,
  placeName: '',
  description: '',
  latitude: 30.0444,
  longitude: 31.2357,
  geoFenceRange: 50,
  addressLine: '',
  government: '',
  city: '',
  country: 'Egypt',
};

function toFormValues(branch: VendorBranchDto | null | undefined): VendorBranchFormValues {
  if (!branch) return emptyValues;
  return {
    branchName: branch.branchName,
    phoneNumber: branch.phoneNumber,
    notes: branch.notes,
    isActive: branch.isActive,
    placeName: branch.placeName,
    description: branch.description,
    latitude: branch.latitude,
    longitude: branch.longitude,
    geoFenceRange: branch.geoFenceRange,
    addressLine: branch.address?.addressLine ?? '',
    government: branch.address?.government ?? '',
    city: branch.address?.city ?? '',
    country: branch.address?.country ?? 'Egypt',
  };
}

function toPayload(values: VendorBranchFormValues): UpsertVendorBranchDto {
  return {
    branchName: values.branchName,
    phoneNumber: values.phoneNumber,
    notes: values.notes,
    isActive: values.isActive,
    placeName: values.placeName,
    description: values.description,
    latitude: values.latitude,
    longitude: values.longitude,
    geoFenceRange: values.geoFenceRange,
    address: {
      addressLine: values.addressLine,
      government: values.government,
      city: values.city,
      country: values.country,
    },
  };
}

export function VendorBranchDialog({ branch, open, onOpenChange, onSubmit }: VendorBranchDialogProps) {
  const form = useForm<VendorBranchFormValues>({
    resolver: zodResolver(vendorBranchSchema) as Resolver<VendorBranchFormValues>,
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(branch));
  }, [branch, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={branch ? 'Edit branch' : 'Create branch'}>
      <form className="grid max-h-[75vh] gap-4 overflow-y-auto pr-1" onSubmit={form.handleSubmit((values) => onSubmit(toPayload(values)))}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="branchName">Branch name</Label>
            <Input id="branchName" {...form.register('branchName')} />
            <FieldError message={form.formState.errors.branchName?.message} />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input id="phoneNumber" {...form.register('phoneNumber')} />
            <FieldError message={form.formState.errors.phoneNumber?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="placeName">Place name</Label>
          <Input id="placeName" {...form.register('placeName')} />
          <FieldError message={form.formState.errors.placeName?.message} />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...form.register('notes')} />
          <FieldError message={form.formState.errors.notes?.message} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="0.000001" {...form.register('latitude')} />
            <FieldError message={form.formState.errors.latitude?.message} />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="0.000001" {...form.register('longitude')} />
            <FieldError message={form.formState.errors.longitude?.message} />
          </div>
          <div>
            <Label htmlFor="geoFenceRange">Geofence range (m)</Label>
            <Input id="geoFenceRange" type="number" min="1" step="1" {...form.register('geoFenceRange')} />
            <FieldError message={form.formState.errors.geoFenceRange?.message} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="addressLine">Address line</Label>
            <Input id="addressLine" {...form.register('addressLine')} />
            <FieldError message={form.formState.errors.addressLine?.message} />
          </div>
          <div>
            <Label htmlFor="government">Government</Label>
            <Input id="government" {...form.register('government')} />
            <FieldError message={form.formState.errors.government?.message} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register('city')} />
            <FieldError message={form.formState.errors.city?.message} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register('country')} />
            <FieldError message={form.formState.errors.country?.message} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="isActive" type="checkbox" className="size-4 accent-primary" {...form.register('isActive')} />
          <Label htmlFor="isActive" className="cursor-pointer">
            Active
          </Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>{branch ? 'Save branch' : 'Create branch'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
