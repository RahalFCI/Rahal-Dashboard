import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, MailCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { forgotPassword, resendVerification, resetPassword, verifyEmail } from '../api/authApi';
import {
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type OtpFormValues,
  type ResetPasswordFormValues,
} from '../schemas';

function AuthPanel({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 py-10 text-on-surface">
      <section className="w-full max-w-md rounded-xl bg-surface-lowest p-6 shadow-ambient">
        <div className="mb-7 flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-container text-primary">
            {icon}
          </span>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{description}</p>
          </div>
        </div>
        {children}
        <Button asChild variant="ghost" className="mt-5 w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </section>
    </main>
  );
}

export function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    await forgotPassword(values);
    form.reset(values);
    form.setError('root', { message: 'If the account exists, a reset code has been sent.' });
  }

  return (
    <AuthPanel
      icon={<KeyRound size={21} />}
      title="Reset password"
      description="Request a reset code for the account email."
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        {form.formState.errors.root?.message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Sending...' : 'Send reset code'}
        </Button>
        <Button asChild variant="secondary">
          <Link to="/reset-password">Enter reset code</Link>
        </Button>
      </form>
    </AuthPanel>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    await resetPassword(values);
    form.reset({ email: values.email, otp: '', newPassword: '', confirmPassword: '' });
    form.setError('root', { message: 'Password reset successfully. You can sign in now.' });
  }

  return (
    <AuthPanel
      icon={<KeyRound size={21} />}
      title="Set new password"
      description="Use the reset code sent to your email."
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="otp">Reset code</Label>
          <Input id="otp" inputMode="numeric" autoComplete="one-time-code" {...form.register('otp')} />
          <FieldError message={form.formState.errors.otp?.message} />
        </div>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" autoComplete="new-password" {...form.register('newPassword')} />
          <FieldError message={form.formState.errors.newPassword?.message} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
          <FieldError message={form.formState.errors.confirmPassword?.message} />
        </div>
        {form.formState.errors.root?.message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: searchParams.get('email') ?? '', otp: '' },
  });

  async function onSubmit(values: OtpFormValues) {
    await verifyEmail(values);
    form.setError('root', { message: 'Email verified successfully.' });
  }

  async function handleResend() {
    const email = form.getValues('email');
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      form.setError('email', { message: 'Use a valid email address.' });
      return;
    }
    await resendVerification({ email });
    form.setError('root', { message: 'A new verification code has been sent.' });
  }

  return (
    <AuthPanel
      icon={<MailCheck size={21} />}
      title="Verify email"
      description="Confirm the account email with the 6 digit code."
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="otp">Verification code</Label>
          <Input id="otp" inputMode="numeric" autoComplete="one-time-code" {...form.register('otp')} />
          <FieldError message={form.formState.errors.otp?.message} />
        </div>
        {form.formState.errors.root?.message ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Verifying...' : 'Verify email'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void handleResend()}>
          Resend code
        </Button>
      </form>
    </AuthPanel>
  );
}
