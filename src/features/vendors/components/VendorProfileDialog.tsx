import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { vendorProfileSchema, type VendorProfileFormValues } from '../schemas';
import type { UpsertVendorProfileDto, VendorCategoryDto, VendorProfileDto, Weekday, WorkingHours } from '../types';

const weekdays: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function createEmptyWorkingHours(): VendorProfileFormValues['workingHours'] {
  return weekdays.reduce(
    (acc, day) => ({
      ...acc,
      [day]: { enabled: false, opens: '09:00', closes: '17:00' },
    }),
    {} as VendorProfileFormValues['workingHours'],
  );
}

function createDefaultValues(userId = ''): VendorProfileFormValues {
  return {
    userId,
    displayName: '',
    profilePictureUrl: '',
    countryCode: 'EG',
    address: '',
    addressUrl: '',
    categoryId: '',
    workingHours: createEmptyWorkingHours(),
  };
}

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
    resolver: zodResolver(vendorProfileSchema) as Resolver<VendorProfileFormValues>,
    defaultValues: createDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;
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
      form.reset(createDefaultValues(userId));
    }
  }, [form, open, profile, userId]);

  async function handleSubmit(values: VendorProfileFormValues) {
    const file = (document.getElementById('vendorProfilePicture') as HTMLInputElement | null)?.files?.[0] ?? null;
    const workingHours = parseWorkingHours(values.workingHours);
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
        <form className="flex max-h-[72vh] flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 overflow-y-auto pr-1">
            <input type="hidden" {...form.register('userId')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" {...form.register('displayName')} />
                <FieldError message={form.formState.errors.displayName?.message} />
              </div>
              <input type="hidden" {...form.register('countryCode')} />
              <div>
                <Label htmlFor="categoryId">Business category</Label>
                <Select id="categoryId" {...form.register('categoryId')}>
                  <option value="">Choose business category</option>
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
            <div className="grid gap-3">
              <div>
                <p className="text-sm font-medium text-on-surface">Working hours</p>
              </div>
              <div className="overflow-hidden rounded-lg border border-outline/40">
                {weekdays.map((day) => {
                  const enabled = form.watch(`workingHours.${day}.enabled`);
                  const dayErrors = form.formState.errors.workingHours?.[day];

                  return (
                    <div key={day} className="grid gap-3 border-t border-outline/30 p-3 first:border-t-0 sm:grid-cols-[130px_1fr_1fr] sm:items-start">
                      <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-on-surface">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          {...form.register(`workingHours.${day}.enabled`)}
                        />
                        {day}
                      </label>
                      <div>
                        <Label htmlFor={`workingHours-${day}-opens`}>Opens</Label>
                        <Input
                          id={`workingHours-${day}-opens`}
                          type="time"
                          disabled={!enabled}
                          {...form.register(`workingHours.${day}.opens`)}
                        />
                        <FieldError message={dayErrors?.opens?.message} />
                      </div>
                      <div>
                        <Label htmlFor={`workingHours-${day}-closes`}>Closes</Label>
                        <Input
                          id={`workingHours-${day}-closes`}
                          type="time"
                          disabled={!enabled}
                          {...form.register(`workingHours.${day}.closes`)}
                        />
                        <FieldError message={dayErrors?.closes?.message} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-outline/30 pt-4">
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

function formatWorkingHours(workingHours: WorkingHours): VendorProfileFormValues['workingHours'] {
  return weekdays.reduce((acc, day) => {
    const value = workingHours[day];
    const range = parseHourRange(value);
    acc[day] = {
      enabled: Boolean(value),
      opens: range.opens,
      closes: range.closes,
    };
    return acc;
  }, createEmptyWorkingHours());
}

function parseHourRange(value: string | undefined) {
  const match = value?.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  return {
    opens: match?.[1] ?? '09:00',
    closes: match?.[2] ?? '17:00',
  };
}

function parseWorkingHours(value: VendorProfileFormValues['workingHours']): WorkingHours {
  return weekdays.reduce<WorkingHours>((acc, day) => {
    const dayValue = value[day];
    if (dayValue.enabled) acc[day] = `${dayValue.opens}-${dayValue.closes}`;
    return acc;
  }, {});
}
