import { useMutation } from '@tanstack/react-query';
import { ScanLine, TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';
import { ApiError } from '@/shared/api/errors';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { PageHeader } from '@/shared/layout/PageHeader';
import { useExplorerNames } from '@/shared/hooks/useExplorerNames';
import { getCouponByCode } from '../api/userCouponApi';
import type { GetUserCouponDto } from '../types';

const statusStyle: Record<string, string> = {
  Claimed:  'bg-success/15 text-success',
  Redeemed: 'bg-primary/15 text-primary',
  Pending:  'bg-warning/15 text-warning',
  Expired:  'bg-error/15 text-error',
  Cancelled:'bg-surface-high text-on-surface-variant',
};

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 border-b border-outline/30 last:border-0 text-sm">
      <span className="text-on-surface-variant shrink-0">{label}</span>
      <span className="text-on-surface font-medium text-right break-all">{value}</span>
    </div>
  );
}

export function UserCouponLookupPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<GetUserCouponDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const explorerNameById = useExplorerNames(result ? [result.explorerId] : []);

  const lookupMutation = useMutation({
    mutationFn: (c: string) => getCouponByCode(c),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err) => {
      setResult(null);
      if (err instanceof ApiError && err.code === 'NOT_FOUND') {
        setError('No user coupon found with this code.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      }
    },
  });

  function handleLookup() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    setResult(null);
    lookupMutation.mutate(trimmed);
  }

  function handleClear() {
    setCode('');
    setResult(null);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="User coupon lookup"
        description="Look up an explorer's claimed coupon by its unique code to inspect status and redemption details."
      />

      <div className="mx-auto max-w-xl space-y-6">
        {/* Search panel */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-primary" />
            <p className="text-sm font-semibold text-on-surface">Search by code</p>
          </div>

          <div>
            <Label htmlFor="lookup-code">Coupon code</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="lookup-code"
                ref={inputRef}
                placeholder="CPN-..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                  setResult(null);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
                className="font-mono"
              />
              <Button
                type="button"
                onClick={handleLookup}
                disabled={!code.trim() || lookupMutation.isPending}
              >
                {lookupMutation.isPending ? 'Searching…' : 'Look up'}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
              <TriangleAlert size={15} className="shrink-0" />
              {error}
            </div>
          ) : null}
        </Panel>

        {/* Result card */}
        {result ? (
          <Panel className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-on-surface">{result.couponTitle}</p>
                <p className="mt-0.5 font-mono text-xs text-on-surface-variant">{result.code}</p>
              </div>
              <Badge className={statusStyle[result.status] ?? 'bg-surface-high text-on-surface-variant'}>
                {result.status}
              </Badge>
            </div>

            <div className="rounded-lg bg-surface-low px-4 py-1">
              <DetailRow label="Record ID" value={result.id} />
              <DetailRow label="Coupon ID" value={result.couponId} />
              <DetailRow
                label="Explorer"
                value={
                  <span title={result.explorerId}>
                    {explorerNameById.get(result.explorerId) || 'Unknown explorer'}
                  </span>
                }
              />
              <DetailRow
                label="Redeemed"
                value={
                  <Badge className={result.isRedeemed ? 'bg-success/15 text-success' : 'bg-surface-high text-on-surface-variant'}>
                    {result.isRedeemed ? 'Yes' : 'No'}
                  </Badge>
                }
              />
              <DetailRow label="Claimed at" value={fmt(result.claimedAt)} />
              <DetailRow label="Redeemed at" value={fmt(result.redeemedAt)} />
              <DetailRow label="Expires at" value={fmt(result.expiresAt)} />
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </Panel>
        ) : null}
      </div>
    </>
  );
}
