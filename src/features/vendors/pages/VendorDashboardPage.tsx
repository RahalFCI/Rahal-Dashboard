import { useQuery } from '@tanstack/react-query';
import { Clock, Mail, MailCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/authStore';
import { resendVerification } from '@/features/auth/api/authApi';
import { getVendorProfile } from '../api/vendorProfileApi';

// ── Email not verified ────────────────────────────────────────────────────────

function VerifyEmailGate({ email }: { email: string }) {
  async function handleResend() {
    await resendVerification({ email }).catch(() => undefined);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-xl bg-primary-container text-primary">
          <Mail size={24} />
        </span>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Step 1 of 2</p>
        <h1 className="mt-3 text-2xl font-semibold text-on-surface">Verify your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-on-surface">{email}</span>. Enter it to confirm your address and
          unlock the next step.
        </p>

        <div className="mt-8 space-y-3">
          <Button asChild className="w-full">
            <a href={`/verify-email?email=${encodeURIComponent(email)}`}>Enter verification code</a>
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => void handleResend()}>
            Resend code
          </Button>
        </div>

        <p className="mt-6 text-xs text-on-surface-variant/60">
          Check your spam folder if you don't see it within a few minutes.
        </p>
      </div>
    </div>
  );
}

// ── Email verified, waiting for admin approval ────────────────────────────────

const ADMIN_EMAIL = 'admin@rahal.com';

function PendingApprovalGate({ email }: { email: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-xl bg-secondary-container text-secondary">
          <Clock size={24} />
        </span>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Step 2 of 2</p>
        <h1 className="mt-3 text-2xl font-semibold text-on-surface">Awaiting admin approval</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          Your email is confirmed. Our team will review your account and activate it — usually within one
          business day. We'll notify you at{' '}
          <span className="font-medium text-on-surface">{email}</span> once you're approved.
        </p>

        <div className="mt-8 space-y-3">
          <Button asChild variant="secondary" className="w-full">
            <a href={`mailto:${ADMIN_EMAIL}?subject=Vendor account inquiry&body=Hi, I recently registered as a vendor on Rahal and would like to check on my account approval status. My email is: ${encodeURIComponent(email)}`}>
              <MailCheck size={16} />
              Contact admin
            </a>
          </Button>
        </div>

        <p className="mt-6 text-xs text-on-surface-variant/60">
          Need help? Reach the team directly at{' '}
          <a href={`mailto:${ADMIN_EMAIL}`} className="text-primary underline-offset-2 hover:underline">
            {ADMIN_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Main status page ──────────────────────────────────────────────────────────

export function VendorDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const profileQuery = useQuery({
    queryKey: ['vendor-profile', user?.id],
    queryFn: () => getVendorProfile(user?.id ?? ''),
    enabled: Boolean(user?.id),
    retry: (_, error) => !(error instanceof ApiError && error.code === 'NOT_FOUND'),
  });

  const isApproved = profileQuery.data?.isApproved === true;

  // emailConfirmed comes from JWT if the backend includes the claim.
  // undefined means the backend doesn't send it — skip that gate and rely on isApproved.
  const emailConfirmed = user?.emailConfirmed;
  const emailGateActive = emailConfirmed === false;

  useEffect(() => {
    if (isApproved && !emailGateActive) {
      navigate('/vendor/profile', { replace: true });
    }
  }, [isApproved, emailGateActive, navigate]);

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-on-surface-variant">Loading your account status…</p>
      </div>
    );
  }

  const email = user?.email ?? '';

  if (emailGateActive) {
    return <VerifyEmailGate email={email} />;
  }

  // Not approved (profile missing or isApproved === false)
  if (!isApproved) {
    return <PendingApprovalGate email={email} />;
  }

  // Redirecting — show nothing while navigate() takes effect
  return null;
}
