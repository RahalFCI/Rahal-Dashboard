import { zodResolver } from '@hookform/resolvers/zod';
import { Archive, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { ApiError } from '@/shared/api/errors';
import { register } from '../api/authApi';
import { registerSchema, type RegisterFormValues } from '../schemas';

export function RegisterPage() {
  const [registered, setRegistered] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await register({
        name: values.displayName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        confirmPassword: values.confirmPassword,
        userRole: 'Vendor',
      });
      setRegistered(values.email);
    } catch (err) {
      if (err instanceof ApiError) {
        form.setError('root', { message: err.message });
      }
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-surface text-on-surface lg:grid-cols-[1.1fr_0.9fr]">
      {/* ── Left: editorial hero ── */}
      <section className="relative flex flex-col justify-between overflow-hidden px-8 py-10 lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent" />

        {/* Brand mark */}
        <div className="relative flex items-center gap-3">
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

        {/* Hero copy */}
        <div className="relative py-16 lg:py-0">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Vendor partnership</p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-on-surface sm:text-5xl lg:text-[52px]">
            List your spaces and reach thousands of explorers.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-on-surface-variant">
            Create your vendor account, verify your email, and our team will review and activate your profile
            before you go live.
          </p>
        </div>

        <p className="relative text-xs text-on-surface-variant/50">
          Vendor accounts are reviewed by the Rahal admin team before activation.
        </p>
      </section>

      {/* ── Right: form or success ── */}
      <section className="flex items-center justify-center bg-surface-low px-6 py-12 lg:px-12">
        {registered ? (
          <div className="w-full max-w-sm">
            <span className="grid size-12 place-items-center rounded-xl bg-primary-container text-primary">
              <CheckCircle2 size={22} />
            </span>
            <h2 className="mt-6 text-2xl font-semibold text-on-surface">Check your inbox</h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              We sent a 6-digit verification code to{' '}
              <span className="font-medium text-on-surface">{registered}</span>. Enter it on the next step to
              confirm your address.
            </p>
            <Button asChild className="mt-8 w-full">
              <Link to={`/verify-email?email=${encodeURIComponent(registered)}`}>Verify email →</Link>
            </Button>
            <div className="mt-5 text-center text-sm text-on-surface-variant">
              <Link className="transition-colors hover:text-primary" to="/login">
                Sign in instead
              </Link>
            </div>
          </div>
        ) : (
          <form className="w-full max-w-sm" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-on-surface">Create your account</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Vendor access — reviewed and activated by admin.</p>
            </div>

            <div className="space-y-7">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Full name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your business or display name"
                  {...form.register('displayName')}
                />
                <FieldError message={form.formState.errors.displayName?.message} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                />
                <FieldError message={form.formState.errors.email?.message} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Phone number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+201234567890"
                  {...form.register('phoneNumber')}
                />
                <FieldError message={form.formState.errors.phoneNumber?.message} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...form.register('password')}
                />
                <FieldError message={form.formState.errors.password?.message} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...form.register('confirmPassword')}
                />
                <FieldError message={form.formState.errors.confirmPassword?.message} />
              </div>
            </div>

            {form.formState.errors.root?.message ? (
              <p className="mt-5 text-sm text-error">{form.formState.errors.root.message}</p>
            ) : null}

            <Button className="mt-9 w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating account…' : 'Create vendor account'}
            </Button>

            <div className="mt-5 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link className="font-medium text-primary transition-colors hover:text-[#624900]" to="/login">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
