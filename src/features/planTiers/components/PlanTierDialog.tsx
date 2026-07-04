import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { planTierSchema, type PlanTierFormValues } from '../schemas';
import type { GetPlanTierDto } from '../types';

interface Props {
  mode: 'create' | 'edit';
  tier?: GetPlanTierDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PlanTierFormValues) => Promise<unknown>;
  serverError?: string | null;
}

const defaultValues: PlanTierFormValues = {
  name: '',
  description: '',
  weeklyPrice: 0,
  weeklyXpCost: 0,
  xpMultiplier: 1,
  maxTravelPlans: 0,
  isActive: true,
};

export function PlanTierDialog({ mode, tier, open, onOpenChange, onSubmit, serverError }: Props) {
  const form = useForm<PlanTierFormValues>({
    resolver: zodResolver(planTierSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && tier) {
      form.reset({
        name: tier.name,
        description: tier.description,
        weeklyPrice: tier.weeklyPrice,
        weeklyXpCost: tier.weeklyXpCost,
        xpMultiplier: tier.xpMultiplier,
        maxTravelPlans: tier.maxTravelPlans,
        isActive: tier.isActive,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [form, open, mode, tier]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'New plan tier' : 'Edit plan tier'}
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Name */}
        <div>
          <Label htmlFor="pt-name">Name</Label>
          <Input id="pt-name" placeholder="e.g. Basic, Pro, Premium" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="pt-description">Description</Label>
          <Textarea id="pt-description" placeholder="What does this tier include?" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>

        {/* Weekly price + XP cost */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pt-weeklyPrice">Weekly price (EGP)</Label>
            <Input id="pt-weeklyPrice" type="number" min="0" step="0.01" {...form.register('weeklyPrice')} />
            <FieldError message={form.formState.errors.weeklyPrice?.message} />
          </div>
          <div>
            <Label htmlFor="pt-weeklyXpCost">Weekly XP cost</Label>
            <Input id="pt-weeklyXpCost" type="number" min="0" step="1" {...form.register('weeklyXpCost')} />
            <FieldError message={form.formState.errors.weeklyXpCost?.message} />
          </div>
        </div>

        {/* XP multiplier + max travel plans */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pt-xpMultiplier">XP multiplier</Label>
            <Input id="pt-xpMultiplier" type="number" min="0.01" step="0.01" {...form.register('xpMultiplier')} />
            <FieldError message={form.formState.errors.xpMultiplier?.message} />
          </div>
          <div>
            <Label htmlFor="pt-maxTravelPlans">Max travel plans</Label>
            <Input id="pt-maxTravelPlans" type="number" min="0" step="1" {...form.register('maxTravelPlans')} />
            <FieldError message={form.formState.errors.maxTravelPlans?.message} />
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            id="pt-isActive"
            type="checkbox"
            className="size-4 accent-primary"
            {...form.register('isActive')}
          />
          <Label htmlFor="pt-isActive" className="cursor-pointer">
            Active (visible to explorers)
          </Label>
        </div>

        <FieldError message={serverError ?? undefined} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>
            {mode === 'create' ? 'Create tier' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
