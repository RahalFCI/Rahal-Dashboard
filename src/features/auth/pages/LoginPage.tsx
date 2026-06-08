import { zodResolver } from '@hookform/resolvers/zod';
import { Archive, Landmark } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { FieldError } from '@/shared/components/ui/field-error';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { login } from '../api/authApi';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useAuthStore } from '../store/authStore';
import { parseJwtUser } from '../utils/jwt';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuthStore();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'Admin', email: '', password: '' },
  });

  if (user?.role === 'Admin') return <Navigate to="/admin/users" replace />;
  if (user?.role === 'Vendor') return <Navigate to="/vendor/profile" replace />;

  async function onSubmit(values: LoginFormValues) {
    const session = await login(values.role, { email: values.email, password: values.password });
    const sessionUser = parseJwtUser(session.accessToken);
    if (sessionUser.role !== values.role) {
      form.setError('root', { message: `This account does not have ${values.role} dashboard access.` });
      return;
    }
    setSession(session);
    navigate(values.role === 'Admin' ? '/admin/users' : '/vendor/profile', { replace: true });
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-surface text-on-surface lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-white">
            <Landmark size={20} />
          </span>
          Rahal Control
        </div>

        <div className="max-w-2xl py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Operational archive</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Manage places, vendors, and explorer records with a quieter hand.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-on-surface-variant">
            The dashboard keeps Rahal's editorial language, tuned for dense daily operations.
          </p>
        </div>

        <p className="text-sm text-on-surface-variant">Phase 1: users, places, categories, and vendor place workflows.</p>
      </section>

      <section className="flex items-center justify-center bg-surface-low px-6 py-10">
        <form
          className="w-full max-w-md rounded-xl bg-surface-lowest p-6 shadow-ambient"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg bg-primary-container text-primary">
              <Archive size={21} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Sign in</h2>
              <p className="text-sm text-on-surface-variant">Admin and vendor access only.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="role">Workspace</Label>
              <Select id="role" {...form.register('role')}>
                <option value="Admin">Admin</option>
                <option value="Vendor">Vendor</option>
              </Select>
              <FieldError message={form.formState.errors.role?.message} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
              <FieldError message={form.formState.errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
          </div>

          {form.formState.errors.root?.message ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button className="mt-7 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Signing in...' : 'Enter dashboard'}
          </Button>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <Link className="text-primary hover:underline" to="/forgot-password">
              Forgot password
            </Link>
            <Link className="text-primary hover:underline" to="/verify-email">
              Verify email
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
