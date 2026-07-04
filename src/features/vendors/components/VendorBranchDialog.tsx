import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { vendorBranchSchema, type VendorBranchFormValues } from '../schemas';
import type { GetVendorBranchDto } from '../types';

interface VendorBranchDialogProps {
  open: boolean;
  branch?: GetVendorBranchDto | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VendorBranchFormValues) => Promise<unknown>;
}

const defaultValues: VendorBranchFormValues = {
  branchName: '',
  phoneNumber: '',
  notes: '',
  isActive: true,
  placeName: '',
  description: '',
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

export function VendorBranchDialog({ open, branch, onOpenChange, onSubmit }: VendorBranchDialogProps) {
  const form = useForm<VendorBranchFormValues>({
    resolver: zodResolver(vendorBranchSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      branch
        ? {
            branchName: branch.branchName,
            phoneNumber: branch.phoneNumber,
            notes: branch.notes,
            isActive: branch.isActive,
            placeName: branch.placeName,
            description: branch.description,
            latitude: branch.latitude,
            longitude: branch.longitude,
            geoFenceRange: branch.geoFenceRange,
            address: branch.address ?? defaultValues.address,
          }
        : defaultValues,
    );
  }, [form, open, branch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={branch ? 'Edit branch' : 'Add branch'} description="Branch details and the place listing it manages.">
      <form className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div>
            <Label htmlFor="placeName">Place name</Label>
            <Input id="placeName" {...form.register('placeName')} />
            <FieldError message={form.formState.errors.placeName?.message} />
          </div>
          <div>
            <Label htmlFor="geoFenceRange">Geofence range</Label>
            <Input id="geoFenceRange" type="number" {...form.register('geoFenceRange')} />
            <FieldError message={form.formState.errors.geoFenceRange?.message} />
          </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="addressLine">Address line</Label>
            <Input id="addressLine" {...form.register('address.addressLine')} />
            <FieldError message={form.formState.errors.address?.addressLine?.message} />
          </div>
          <div>
            <Label htmlFor="government">Government</Label>
            <Input id="government" {...form.register('address.government')} />
            <FieldError message={form.formState.errors.address?.government?.message} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register('address.city')} />
            <FieldError message={form.formState.errors.address?.city?.message} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register('address.country')} />
            <FieldError message={form.formState.errors.address?.country?.message} />
          </div>
        </div>
        {branch ? (
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" {...form.register('isActive')} />
            Active
          </label>
        ) : null}
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
