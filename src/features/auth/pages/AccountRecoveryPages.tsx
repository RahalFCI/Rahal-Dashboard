import { zodResolver } from '@hookform/resolvers/zod';
import { Archive, KeyRound, MailCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { ApiError } from '@/shared/api/errors';
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
      {/* Soft ambient warm gradient */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent" />

      <section className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-10 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-white">
            <Archive size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none text-on-surface">Rahal</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              Relic Modernism
            </p>
          </div>
        </div>

        {/* Panel header */}
        <div className="mb-9 flex items-start gap-4">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-primary-container text-primary">
            {icon}
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface">{title}</h1>
            <p className="mt-1.5 text-sm leading-6 text-on-surface-variant">{description}</p>
          </div>
        </div>

        {children}

        <div className="mt-6 border-t border-outline-variant/40 pt-5">
          <Button asChild variant="ghost" className="w-full text-on-surface-variant hover:text-on-surface">
            <Link to="/login">← Back to sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await forgotPassword(values);
      form.reset(values);
      form.setError('root', { type: 'success', message: 'If the account exists, a reset code has been sent.' });
    } catch (err) {
      if (err instanceof ApiError && err.tier === 'screen') {
        form.setError('root', { type: 'error', message: err.message });
      }
    }
  }

  return (
    <AuthPanel
      icon={<KeyRound size={19} />}
      title="Reset password"
      description="Request a reset code for the account email."
    >
      <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup label="Email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </FieldGroup>

        {form.formState.errors.root?.message ? (
          <p className={`rounded-lg px-3 py-2.5 text-sm ${form.formState.errors.root.type === 'error' ? 'bg-error-container text-error' : 'bg-[#e8f5e9] text-[#2e7d32]'}`}>
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-3">
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Sending…' : 'Send reset code'}
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/reset-password">Already have a code</Link>
          </Button>
        </div>
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
    try {
      await resetPassword(values);
      form.reset({ email: values.email, otp: '', newPassword: '', confirmPassword: '' });
      form.setError('root', { type: 'success', message: 'Password reset successfully. You can sign in now.' });
    } catch (err) {
      if (err instanceof ApiError && err.tier === 'screen') {
        form.setError('root', { type: 'error', message: err.message });
      }
    }
  }

  return (
    <AuthPanel
      icon={<KeyRound size={19} />}
      title="Set new password"
      description="Use the reset code sent to your email."
    >
      <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup label="Email">
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </FieldGroup>

        <FieldGroup label="Reset code">
          <Input id="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" {...form.register('otp')} />
          <FieldError message={form.formState.errors.otp?.message} />
        </FieldGroup>

        <FieldGroup label="New password">
          <Input id="newPassword" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register('newPassword')} />
          <FieldError message={form.formState.errors.newPassword?.message} />
        </FieldGroup>

        <FieldGroup label="Confirm password">
          <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register('confirmPassword')} />
          <FieldError message={form.formState.errors.confirmPassword?.message} />
        </FieldGroup>

        {form.formState.errors.root?.message ? (
          <p className={`rounded-lg px-3 py-2.5 text-sm ${form.formState.errors.root.type === 'error' ? 'bg-error-container text-error' : 'bg-[#e8f5e9] text-[#2e7d32]'}`}>
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: searchParams.get('email') ?? '', otp: '' },
  });

  async function onSubmit(values: OtpFormValues) {
    try {
      await verifyEmail(values);
      form.setError('root', {
        type: 'success',
        message: 'Email verified. Redirecting you to sign in…',
      });
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      if (err instanceof ApiError && err.tier === 'screen') {
        form.setError('root', { type: 'error', message: err.message });
      }
    }
  }

  async function handleResend() {
    const email = form.getValues('email');
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      form.setError('email', { message: 'Use a valid email address.' });
      return;
    }
    try {
      await resendVerification({ email });
      form.setError('root', { type: 'success', message: 'A new verification code has been sent.' });
    } catch (err) {
      if (err instanceof ApiError && err.tier === 'screen') {
        form.setError('root', { type: 'error', message: err.message });
      }
    }
  }

  return (
    <AuthPanel
      icon={<MailCheck size={19} />}
      title="Verify email"
      description="Confirm the account email with the 6-digit code."
    >
      <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup label="Email">
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </FieldGroup>

        <FieldGroup label="Verification code">
          <Input id="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" {...form.register('otp')} />
          <FieldError message={form.formState.errors.otp?.message} />
        </FieldGroup>

        {form.formState.errors.root?.message ? (
          <p className={`rounded-lg px-3 py-2.5 text-sm ${form.formState.errors.root.type === 'error' ? 'bg-error-container text-error' : 'bg-[#e8f5e9] text-[#2e7d32]'}`}>
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-3">
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Verifying…' : 'Verify email'}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => void handleResend()}>
            Resend code
          </Button>
        </div>
      </form>
    </AuthPanel>
  );
}
