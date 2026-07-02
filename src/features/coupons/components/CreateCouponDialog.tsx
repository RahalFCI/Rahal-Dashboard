import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { listVendorProfiles } from '@/features/vendors/api/vendorProfileApi';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { createCouponSchema, type CreateCouponFormValues } from '../schemas';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateCouponFormValues) => Promise<unknown>;
  serverError?: string | null;
}

const defaultValues: CreateCouponFormValues = {
  vendorId: '',
  title: '',
  description: '',
  xpCost: 0,
  discountType: 0,
  discountValue: 0,
  maxDiscountValue: '',
  minimumCharge: 0,
  maxClaims: 1,
  expiresAt: '',
  isActive: true,
};

export function CreateCouponDialog({ open, onOpenChange, onSubmit, serverError }: Props) {
  const vendorsQuery = useQuery({
    queryKey: ['vendor-profiles-for-coupon'],
    queryFn: () => listVendorProfiles(1, 200),
  });

  const form = useForm<CreateCouponFormValues>({
    resolver: zodResolver(createCouponSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
  }, [form, open]);

  const discountType = Number(form.watch('discountType'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create coupon">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Vendor */}
        <div>
          <Label htmlFor="vendorId">Vendor</Label>
          <Select id="vendorId" {...form.register('vendorId')}>
            <option value="">Select vendor…</option>
            {(vendorsQuery.data?.items ?? []).map((v) => (
              <option key={v.userId} value={v.userId}>
                {v.displayName}
              </option>
            ))}
          </Select>
          <FieldError message={form.formState.errors.vendorId?.message} />
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. 20% off your next visit" {...form.register('title')} />
          <FieldError message={form.formState.errors.title?.message} />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Optional details about this coupon" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>

        {/* Discount type + value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="discountType">Discount type</Label>
            <Select id="discountType" {...form.register('discountType')}>
              <option value={0}>Fixed amount</option>
              <option value={1}>Percentage</option>
            </Select>
            <FieldError message={form.formState.errors.discountType?.message} />
          </div>
          <div>
            <Label htmlFor="discountValue">
              Discount value {discountType === 1 ? '(%)' : '(EGP)'}
            </Label>
            <Input
              id="discountValue"
              type="number"
              min="0.01"
              step="0.01"
              {...form.register('discountValue')}
            />
            <FieldError message={form.formState.errors.discountValue?.message} />
          </div>
        </div>

        {/* Max discount value — only useful for percentage discounts */}
        {discountType === 1 && (
          <div>
            <Label htmlFor="maxDiscountValue">Max discount cap (EGP, optional)</Label>
            <Input
              id="maxDiscountValue"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Leave blank for no cap"
              {...form.register('maxDiscountValue')}
            />
            <FieldError message={form.formState.errors.maxDiscountValue?.message} />
          </div>
        )}

        {/* Minimum charge + XP cost */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minimumCharge">Minimum charge (EGP)</Label>
            <Input id="minimumCharge" type="number" min="0" step="0.01" {...form.register('minimumCharge')} />
            <FieldError message={form.formState.errors.minimumCharge?.message} />
          </div>
          <div>
            <Label htmlFor="xpCost">XP cost to claim</Label>
            <Input id="xpCost" type="number" min="0" step="1" {...form.register('xpCost')} />
            <FieldError message={form.formState.errors.xpCost?.message} />
          </div>
        </div>

        {/* Max claims + expiry */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="maxClaims">Max claims</Label>
            <Input id="maxClaims" type="number" min="1" step="1" {...form.register('maxClaims')} />
            <FieldError message={form.formState.errors.maxClaims?.message} />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expires at</Label>
            <Input id="expiresAt" type="datetime-local" {...form.register('expiresAt')} />
            <FieldError message={form.formState.errors.expiresAt?.message} />
          </div>
        </div>

        {/* Is active */}
        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            className="size-4 accent-primary"
            {...form.register('isActive')}
            defaultChecked
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Active (visible to explorers)
          </Label>
        </div>

        <FieldError message={serverError ?? undefined} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>Create coupon</Button>
        </div>
      </form>
    </Dialog>
  );
}
