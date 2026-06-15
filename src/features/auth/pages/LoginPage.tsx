import { zodResolver } from '@hookform/resolvers/zod';
import { Archive } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { ApiError } from '@/shared/api/errors';
import { login } from '../api/authApi';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useAuthStore } from '../store/authStore';
import { parseJwtUser } from '../utils/jwt';
import { cn } from '@/shared/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuthStore();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'Admin', email: '', password: '' },
  });

  const role = form.watch('role');

  if (user?.role === 'Admin') return <Navigate to="/admin/users" replace />;
  if (user?.role === 'Vendor') return <Navigate to="/vendor/dashboard" replace />;

  async function onSubmit(values: LoginFormValues) {
    try {
      const session = await login(values.role, { email: values.email, password: values.password });
      const sessionUser = parseJwtUser(session.accessToken);
      if (sessionUser.role !== values.role) {
        form.setError('root', { message: `This account does not have ${values.role} dashboard access.` });
        return;
      }
      setSession(session);
      navigate(values.role === 'Admin' ? '/admin/users' : '/vendor/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.tier === 'screen') {
        form.setError('root', { message: err.message });
      }
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-surface text-on-surface lg:grid-cols-[1.1fr_0.9fr]">
      {/* ── Left: editorial hero ── */}
      <section className="relative flex flex-col justify-between overflow-hidden px-8 py-10 lg:px-14 lg:py-12">
        {/* Soft ambient warm gradient */}
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
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Operational archive
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-on-surface sm:text-5xl lg:text-[52px]">
            Manage places, vendors, and explorer records with a quieter hand.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-on-surface-variant">
            The dashboard keeps Rahal's editorial language, tuned for dense daily operations.
          </p>
        </div>

        {/* Footer note */}
        <p className="relative text-xs text-on-surface-variant/50">
          Phase 1 — users, places, categories, and vendor place workflows.
        </p>
      </section>

      {/* ── Right: sign-in form ── */}
      <section className="flex items-center justify-center bg-surface-low px-6 py-12 lg:px-12">
        <form className="w-full max-w-sm" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-on-surface">Sign in</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Admin and vendor access only.</p>
          </div>

          {/* Role toggle */}
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Workspace
            </p>
            <div className="flex rounded-xl bg-surface-mid/60 p-1">
              {(['Admin', 'Vendor'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => form.setValue('role', r)}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                    role === r
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <FieldError message={form.formState.errors.role?.message} />
          </div>

          {/* Fields */}
          <div className="space-y-7">
            <div>
              <label
                htmlFor="email"
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant"
              >
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
              <label
                htmlFor="password"
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register('password')}
              />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
          </div>

          {/* Root error */}
          {form.formState.errors.root?.message ? (
            <p className="mt-5 text-sm text-error">{form.formState.errors.root.message}</p>
          ) : null}

          {/* Submit */}
          <Button className="mt-9 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Signing in…' : 'Enter dashboard'}
          </Button>

          {/* Secondary links */}
          <div className="mt-5 flex justify-center gap-6 text-sm text-on-surface-variant">
            <Link className="transition-colors hover:text-primary" to="/forgot-password">
              Forgot password
            </Link>
            <Link className="transition-colors hover:text-primary" to="/verify-email">
              Verify email
            </Link>
          </div>

          {role === 'Vendor' && (
            <p className="mt-5 text-center text-sm text-on-surface-variant">
              New vendor?{' '}
              <Link className="font-medium text-primary transition-colors hover:text-[#624900]" to="/register">
                Create an account →
              </Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
