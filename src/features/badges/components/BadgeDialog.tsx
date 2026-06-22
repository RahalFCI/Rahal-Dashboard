import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { badgeSchema, type BadgeFormValues } from '../schemas';
import type { GetBadgeDto } from '../types';

interface BadgeDialogProps {
  open: boolean;
  badge?: GetBadgeDto | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BadgeFormValues) => Promise<unknown>;
  error?: string | null;
}

const defaultValues: BadgeFormValues = { name: '', description: '' };

export function BadgeDialog({ open, badge, onOpenChange, onSubmit, error }: BadgeDialogProps) {
  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(badge ? { name: badge.name, description: badge.description } : defaultValues);
  }, [form, open, badge]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={badge ? 'Edit badge' : 'Create badge'}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>{badge ? 'Save badge' : 'Create badge'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
