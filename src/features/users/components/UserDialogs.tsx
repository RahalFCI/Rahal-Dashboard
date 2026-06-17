import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { ApiError } from '@/shared/api/errors';
import type { ManageableRole } from '../types';
import {
  createUserSchema,
  passwordSchema,
  userEditSchema,
  type CreateUserValues,
  type PasswordValues,
  type UserEditValues,
} from '../schemas';
import type { UserDto, UserSummaryDto } from '../types';

// Mutations only auto-surface "toast" tier errors (see shared/api/client.ts);
// "screen" tier errors (e.g. ALREADY_EXISTS on duplicate email) are silent
// unless the dialog catches them and renders them itself.
async function submitWithRootError<TValues extends Record<string, unknown>>(
  values: TValues,
  onSubmit: (values: TValues) => Promise<unknown>,
  setError: UseFormSetError<TValues>,
) {
  try {
    await onSubmit(values);
  } catch (err) {
    if (err instanceof ApiError) {
      setError('root' as never, { message: err.message } as never);
      return;
    }
    throw err;
  }
}

const roleOptions: { value: CreateUserValues['userRole']; label: string }[] = [
  { value: 'Explorer', label: 'Explorer' },
  { value: 'Vendor', label: 'Vendor' },
];

interface CreateUserDialogProps {
  open: boolean;
  defaultRole: Exclude<ManageableRole, 'admin'>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateUserValues) => Promise<unknown>;
}

export function CreateUserDialog({ open, defaultRole, onOpenChange, onSubmit }: CreateUserDialogProps) {
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      userRole: manageableRoleToUserRole(defaultRole),
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        email: '',
        phoneNumber: '',
        userRole: manageableRoleToUserRole(defaultRole),
        password: '',
        confirmPassword: '',
      });
    }
  }, [defaultRole, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create account" description="Create an Explorer or Vendor account directly.">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => submitWithRootError(values, onSubmit, form.setError))}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="create-name">Name</Label>
            <Input id="create-name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" type="email" {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="create-phoneNumber">Phone</Label>
            <Input id="create-phoneNumber" placeholder="+201234567890" {...form.register('phoneNumber')} />
            <FieldError message={form.formState.errors.phoneNumber?.message} />
          </div>
          <div>
            <Label htmlFor="create-userRole">Role</Label>
            <Select id="create-userRole" {...form.register('userRole')}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.userRole?.message} />
          </div>
          <div>
            <Label htmlFor="create-password">Password</Label>
            <Input id="create-password" type="password" {...form.register('password')} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="create-confirmPassword">Confirm password</Label>
            <Input id="create-confirmPassword" type="password" {...form.register('confirmPassword')} />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>
        </div>
        {form.formState.errors.root?.message ? (
          <p className="text-sm text-error">{form.formState.errors.root.message}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting}>Create account</Button>
        </div>
      </form>
    </Dialog>
  );
}

function manageableRoleToUserRole(role: Exclude<ManageableRole, 'admin'>): CreateUserValues['userRole'] {
  return role === 'vendor' ? 'Vendor' : 'Explorer';
}

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
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => submitWithRootError(values, onSubmit, form.setError))}
        >
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
          {form.formState.errors.root?.message ? (
            <p className="text-sm text-error">{form.formState.errors.root.message}</p>
          ) : null}
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
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => submitWithRootError(values, onSubmit, form.setError))}
      >
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
        {form.formState.errors.root?.message ? (
          <p className="text-sm text-error">{form.formState.errors.root.message}</p>
        ) : null}
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
