import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { vendorProfileSchema, type VendorProfileFormValues } from '../schemas';
import type { UpsertVendorProfileDto, VendorCategoryDto, VendorProfileDto, Weekday, WorkingHours } from '../types';

const weekdays: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface VendorProfileDialogProps {
  open: boolean;
  profile?: VendorProfileDto;
  userId?: string;
  title?: string;
  categories: VendorCategoryDto[];
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpsertVendorProfileDto, profilePicture?: File | null) => Promise<void>;
}

export function VendorProfileDialog({
  open,
  profile,
  userId,
  title = 'Edit vendor profile',
  categories,
  isLoading,
  onOpenChange,
  onSubmit,
}: VendorProfileDialogProps) {
  const form = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      userId: '',
      displayName: '',
      profilePictureUrl: '',
      countryCode: '',
      address: '',
      addressUrl: '',
      categoryId: '',
      workingHours: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        userId: profile.userId,
        displayName: profile.displayName,
        profilePictureUrl: profile.profilePictureUrl,
        countryCode: profile.countryCode,
        address: profile.address,
        addressUrl: profile.addressUrl,
        categoryId: profile.categoryId,
        workingHours: formatWorkingHours(profile.workingHours),
      });
    } else if (userId) {
      form.setValue('userId', userId);
    }
  }, [form, profile, userId]);

  async function handleSubmit(values: VendorProfileFormValues) {
    const file = (document.getElementById('vendorProfilePicture') as HTMLInputElement | null)?.files?.[0] ?? null;
    const workingHours = parseWorkingHours(values.workingHours ?? '');
    await onSubmit(
      {
        userId: values.userId,
        displayName: values.displayName,
        profilePictureUrl: values.profilePictureUrl,
        countryCode: values.countryCode,
        address: values.address,
        addressUrl: values.addressUrl,
        categoryId: values.categoryId,
        workingHours,
      },
      file,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description="Business profile details and approval metadata.">
      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Loading profile...</p>
      ) : (
        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <input type="hidden" {...form.register('userId')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" {...form.register('displayName')} />
              <FieldError message={form.formState.errors.displayName?.message} />
            </div>
            <div>
              <Label htmlFor="countryCode">Country code</Label>
              <Input id="countryCode" {...form.register('countryCode')} />
              <FieldError message={form.formState.errors.countryCode?.message} />
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select id="categoryId" {...form.register('categoryId')}>
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.categoryId?.message} />
            </div>
            <div>
              <Label htmlFor="vendorProfilePicture">Profile picture</Label>
              <Input id="vendorProfilePicture" type="file" accept="image/*" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register('address')} />
              <FieldError message={form.formState.errors.address?.message} />
            </div>
            <div>
              <Label htmlFor="addressUrl">Address URL</Label>
              <Input id="addressUrl" {...form.register('addressUrl')} />
              <FieldError message={form.formState.errors.addressUrl?.message} />
            </div>
          </div>
          <div>
            <Label htmlFor="workingHours">Working hours</Label>
            <Textarea id="workingHours" rows={5} {...form.register('workingHours')} />
            <FieldError message={form.formState.errors.workingHours?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting}>{profile ? 'Save profile' : 'Create profile'}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function formatWorkingHours(workingHours: WorkingHours) {
  return weekdays
    .filter((day) => workingHours[day])
    .map((day) => `${day}: ${workingHours[day]}`)
    .join('\n');
}

function parseWorkingHours(value: string): WorkingHours {
  return value.split('\n').reduce<WorkingHours>((acc, line) => {
    const [rawDay, ...rest] = line.split(':');
    const day = weekdays.find((item) => item.toLowerCase() === rawDay.trim().toLowerCase());
    const hours = rest.join(':').trim();
    if (day && hours) acc[day] = hours;
    return acc;
  }, {});
}
