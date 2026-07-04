import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Search, Ticket, TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ApiError } from '@/shared/api/errors';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { PageHeader } from '@/shared/layout/PageHeader';
import { getCouponByCode, redeemCoupon } from '../api/userCouponApi';
import type { GetUserCouponDto } from '../types';

const statusColors: Record<string, string> = {
  Claimed:  'bg-success/15 text-success',
  Redeemed: 'bg-primary/15 text-primary',
  Pending:  'bg-warning/15 text-warning',
  Expired:  'bg-error/15 text-error',
  Cancelled:'bg-surface-high text-on-surface-variant',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusColors[status] ?? 'bg-surface-high text-on-surface-variant'}>
      {status}
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm border-b border-outline/30 last:border-0">
      <span className="text-on-surface-variant shrink-0">{label}</span>
      <span className="text-on-surface font-medium text-right">{value}</span>
    </div>
  );
}

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export function RedeemCouponPage() {
  const user = useAuthStore((s) => s.user);
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<GetUserCouponDto | null>(null);
  const [result, setResult] = useState<GetUserCouponDto | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const lookupMutation = useMutation({
    mutationFn: (c: string) => getCouponByCode(c),
    onSuccess: (data) => {
      setPreview(data);
      setLookupError(null);
      setRedeemError(null);
    },
    onError: (error) => {
      setPreview(null);
      if (error instanceof ApiError && error.code === 'NOT_FOUND') {
        setLookupError('No coupon found with this code.');
      } else {
        setLookupError(error instanceof ApiError ? error.message : 'Something went wrong.');
      }
    },
  });

  const redeemMutation = useMutation({
    mutationFn: () => redeemCoupon({ code, vendorId: user?.id ?? '' }),
    onSuccess: (data) => {
      setResult(data);
      setPreview(null);
      setRedeemError(null);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === 'NOT_FOUND') {
          setRedeemError("Coupon not found or doesn't belong to your account.");
        } else if (error.code === 'UNKNOWN') {
          setRedeemError('This coupon cannot be redeemed — it may already be used, cancelled, or expired.');
        } else {
          setRedeemError(error.message);
        }
      } else {
        setRedeemError('Something went wrong.');
      }
    },
  });

  function handleLookup() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLookupError(null);
    setRedeemError(null);
    setPreview(null);
    lookupMutation.mutate(trimmed);
  }

  function handleReset() {
    setCode('');
    setPreview(null);
    setResult(null);
    setLookupError(null);
    setRedeemError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const isClaimable = preview?.status === 'Claimed' && !preview.isRedeemed;

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title="Redeem customer coupon"
        description="Enter or scan an explorer's coupon code to mark it as used at checkout."
      />

      <div className="mx-auto max-w-lg space-y-6">
        {/* Success state */}
        {result ? (
          <Panel className="p-6 space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="grid size-14 place-items-center rounded-xl bg-success/15 text-success">
                <CheckCircle2 size={28} />
              </span>
              <div>
                <p className="text-lg font-semibold text-on-surface">Coupon redeemed!</p>
                <p className="mt-1 text-sm text-on-surface-variant">{result.couponTitle}</p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-low px-4 py-1">
              <DetailRow label="Code" value={result.code} />
              <DetailRow label="Status" value={result.status} />
              <DetailRow label="Redeemed at" value={fmt(result.redeemedAt)} />
              <DetailRow label="Expires" value={fmt(result.expiresAt)} />
            </div>

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              Redeem another
            </Button>
          </Panel>
        ) : (
          <>
            {/* Code input */}
            <Panel className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Ticket size={18} className="text-primary" />
                <p className="text-sm font-semibold text-on-surface">Enter coupon code</p>
              </div>
              <div>
                <Label htmlFor="coupon-code">Coupon code</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="coupon-code"
                    ref={inputRef}
                    placeholder="CPN-..."
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setPreview(null);
                      setLookupError(null);
                      setRedeemError(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLookup}
                    disabled={!code.trim() || lookupMutation.isPending}
                  >
                    <Search size={16} />
                    Look up
                  </Button>
                </div>
              </div>

              {lookupError ? (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
                  <TriangleAlert size={15} className="shrink-0" />
                  {lookupError}
                </div>
              ) : null}
            </Panel>

            {/* Preview + redeem */}
            {preview ? (
              <Panel className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-on-surface">{preview.couponTitle}</p>
                  <StatusBadge status={preview.status} />
                </div>

                <div className="rounded-lg bg-surface-low px-4 py-1">
                  <DetailRow label="Code" value={preview.code} />
                  <DetailRow label="Claimed at" value={fmt(preview.claimedAt)} />
                  <DetailRow label="Expires" value={fmt(preview.expiresAt)} />
                </div>

                {!isClaimable ? (
                  <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2.5 text-sm text-warning">
                    <TriangleAlert size={15} className="shrink-0" />
                    {preview.isRedeemed
                      ? 'This coupon has already been redeemed.'
                      : `This coupon has status "${preview.status}" and cannot be redeemed.`}
                  </div>
                ) : null}

                {redeemError ? (
                  <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
                    <TriangleAlert size={15} className="shrink-0" />
                    {redeemError}
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={handleReset}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!isClaimable || redeemMutation.isPending}
                    onClick={() => redeemMutation.mutate()}
                  >
                    {redeemMutation.isPending ? 'Redeeming…' : 'Redeem'}
                  </Button>
                </div>
              </Panel>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
