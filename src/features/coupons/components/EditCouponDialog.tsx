import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { updateCouponSchema, type UpdateCouponFormValues } from '../schemas';
import type { GetCouponDto } from '../types';

interface Props {
  coupon: GetCouponDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpdateCouponFormValues) => Promise<unknown>;
  serverError?: string | null;
}

function toDatetimeLocal(iso: string) {
  const dt = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function discountTypeToInt(type: string) {
  return type === 'Percentage' ? 1 : 0;
}

export function EditCouponDialog({ coupon, open, onOpenChange, onSubmit, serverError }: Props) {
  const form = useForm<UpdateCouponFormValues>({
    resolver: zodResolver(updateCouponSchema),
    defaultValues: {
      description: '',
      xpCost: 0,
      discountType: 0,
      discountValue: 0,
      maxDiscountValue: '',
      minimumCharge: 0,
      maxClaims: 1,
      expiresAt: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open || !coupon) return;
    form.reset({
      description: coupon.description,
      xpCost: coupon.xpCost,
      discountType: discountTypeToInt(coupon.discountType),
      discountValue: coupon.discountValue,
      maxDiscountValue: coupon.maxDiscountValue != null ? String(coupon.maxDiscountValue) : '',
      minimumCharge: coupon.minimumCharge,
      maxClaims: coupon.maxClaims,
      expiresAt: toDatetimeLocal(coupon.expiresAt),
      isActive: coupon.isActive,
    });
  }, [form, open, coupon]);

  const discountType = Number(form.watch('discountType'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Edit coupon">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Title is read-only — the backend rejects any title change */}
        <div>
          <Label>Title</Label>
          <Panel className="mt-2 px-3 py-2 text-sm text-on-surface-variant">{coupon?.title}</Panel>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="edit-description">Description</Label>
          <Textarea id="edit-description" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>

        {/* Discount type + value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="edit-discountType">Discount type</Label>
            <Select id="edit-discountType" {...form.register('discountType')}>
              <option value={0}>Fixed amount</option>
              <option value={1}>Percentage</option>
            </Select>
            <FieldError message={form.formState.errors.discountType?.message} />
          </div>
          <div>
            <Label htmlFor="edit-discountValue">
              Discount value {discountType === 1 ? '(%)' : '(EGP)'}
            </Label>
            <Input
              id="edit-discountValue"
              type="number"
              min="0.01"
              step="0.01"
              {...form.register('discountValue')}
            />
            <FieldError message={form.formState.errors.discountValue?.message} />
          </div>
        </div>

        {/* Max discount cap — only for percentage */}
        {discountType === 1 && (
          <div>
            <Label htmlFor="edit-maxDiscountValue">Max discount cap (EGP, optional)</Label>
            <Input
              id="edit-maxDiscountValue"
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
            <Label htmlFor="edit-minimumCharge">Minimum charge (EGP)</Label>
            <Input id="edit-minimumCharge" type="number" min="0" step="0.01" {...form.register('minimumCharge')} />
            <FieldError message={form.formState.errors.minimumCharge?.message} />
          </div>
          <div>
            <Label htmlFor="edit-xpCost">XP cost to claim</Label>
            <Input id="edit-xpCost" type="number" min="0" step="1" {...form.register('xpCost')} />
            <FieldError message={form.formState.errors.xpCost?.message} />
          </div>
        </div>

        {/* Max claims + expiry */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="edit-maxClaims">Max claims</Label>
            <Input id="edit-maxClaims" type="number" min="1" step="1" {...form.register('maxClaims')} />
            <FieldError message={form.formState.errors.maxClaims?.message} />
          </div>
          <div>
            <Label htmlFor="edit-expiresAt">Expires at</Label>
            <Input id="edit-expiresAt" type="datetime-local" {...form.register('expiresAt')} />
            <FieldError message={form.formState.errors.expiresAt?.message} />
          </div>
        </div>

        {/* Is active */}
        <div className="flex items-center gap-3">
          <input
            id="edit-isActive"
            type="checkbox"
            className="size-4 accent-primary"
            {...form.register('isActive')}
          />
          <Label htmlFor="edit-isActive" className="cursor-pointer">
            Active (visible to explorers)
          </Label>
        </div>

        <FieldError message={serverError ?? undefined} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>Save changes</Button>
        </div>
      </form>
    </Dialog>
  );
}
