import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { passwordSchema, userEditSchema, type PasswordValues, type UserEditValues } from '../schemas';
import type { UserDto, UserSummaryDto } from '../types';

interface EditUserDialogProps {
  open: boolean;
  user?: UserDto;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserEditValues) => Promise<unknown>;
}

export function EditUserDialog({ open, user, isLoading, onOpenChange, onSubmit }: EditUserDialogProps) {
  const form = useForm<UserEditValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { id: '', name: '', email: '', phoneNumber: '', profilePictureUrl: '' },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePictureUrl: user.profilePictureUrl,
      });
    }
  }, [form, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Edit user" description="Account identity fields for the selected user.">
      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Loading user record...</p>
      ) : (
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input id="phoneNumber" {...form.register('phoneNumber')} />
              <FieldError message={form.formState.errors.phoneNumber?.message} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting}>Save user</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

interface PasswordDialogProps {
  open: boolean;
  user?: UserSummaryDto;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PasswordValues) => Promise<unknown>;
}

export function PasswordDialog({ open, user, onOpenChange, onSubmit }: PasswordDialogProps) {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (open) form.reset({ oldPassword: '', newPassword: '', confirmPassword: '' });
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Update password" description={user ? `Target account: ${user.email}` : undefined}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="oldPassword">Old password</Label>
          <Input id="oldPassword" type="password" {...form.register('oldPassword')} />
          <FieldError message={form.formState.errors.oldPassword?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" {...form.register('newPassword')} />
            <FieldError message={form.formState.errors.newPassword?.message} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>Update password</Button>
        </div>
      </form>
    </Dialog>
  );
}
