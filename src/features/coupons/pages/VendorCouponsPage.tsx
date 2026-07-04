import { useMutation, useQuery } from '@tanstack/react-query';
import { BarChart3, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useToastStore } from '@/shared/stores/toastStore';
import { createCoupon, getCouponStats, listCouponRedemptions, listMyVendorCoupons } from '../api/couponApi';
import { CreateCouponDialog } from '../components/CreateCouponDialog';
import type { CreateCouponFormValues } from '../schemas';
import type { GetCouponDto } from '../types';

const PAGE_SIZE = 10;
const REDEMPTIONS_PAGE_SIZE = 8;

function toDiscountTypeString(value: number): 'FixedAmount' | 'Percentage' {
  return value === 1 ? 'Percentage' : 'FixedAmount';
}

function formatDiscount(type: string, value: number, maxValue: number | null) {
  if (type === 'Percentage') return maxValue ? `${value}% (cap ${maxValue} EGP)` : `${value}%`;
  return `${value} EGP off`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export function VendorCouponsPage() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<GetCouponDto | null>(null);
  const [redemptionsPage, setRedemptionsPage] = useState(1);

  const couponsQuery = useQuery({
    queryKey: ['vendor-coupons', page],
    queryFn: () => listMyVendorCoupons(page, PAGE_SIZE),
  });

  const statsQuery = useQuery({
    queryKey: ['vendor-coupon-stats', selectedCoupon?.id],
    queryFn: () => getCouponStats(selectedCoupon!.id),
    enabled: Boolean(selectedCoupon),
  });

  const redemptionsQuery = useQuery({
    queryKey: ['vendor-coupon-redemptions', selectedCoupon?.id, redemptionsPage],
    queryFn: () => listCouponRedemptions(selectedCoupon!.id, redemptionsPage, REDEMPTIONS_PAGE_SIZE),
    enabled: Boolean(selectedCoupon),
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      setDialogOpen(false);
      setServerError(null);
      void queryClient.invalidateQueries({ queryKey: ['vendor-coupons'] });
      useToastStore.getState().add({ message: 'Coupon created.', variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) setServerError(error.message);
    },
  });

  async function handleCreate(values: CreateCouponFormValues) {
    setServerError(null);
    const maxDiscountValue = values.maxDiscountValue !== '' ? parseFloat(values.maxDiscountValue) : null;
    await createMutation.mutateAsync({
      vendorId: user?.id ?? values.vendorId,
      title: values.title,
      description: values.description,
      xpCost: values.xpCost,
      discountType: toDiscountTypeString(Number(values.discountType)),
      discountValue: values.discountValue,
      maxDiscountValue,
      minimumCharge: values.minimumCharge,
      maxClaims: values.maxClaims,
      expiresAt: new Date(values.expiresAt).toISOString(),
      isActive: values.isActive,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title="Coupons"
        description="Create offers, track claims, and review redeemed customer coupons."
        actions={
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <Plus size={17} />
            New coupon
          </Button>
        }
      />

      {couponsQuery.isLoading ? <LoadingState label="Loading coupons..." /> : null}
      {couponsQuery.isError ? <ErrorState onRetry={() => void couponsQuery.refetch()} /> : null}
      {couponsQuery.data?.items.length === 0 ? (
        <EmptyState title="No coupons yet" description="Create your first coupon so explorers can claim it with XP." />
      ) : null}

      {couponsQuery.data && couponsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Claims</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {couponsQuery.data.items.map((coupon) => (
                  <tr key={coupon.id} className="border-t border-outline/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{coupon.title}</p>
                      {coupon.description ? <p className="line-clamp-1 text-xs text-on-surface-variant">{coupon.description}</p> : null}
                    </td>
                    <td className="px-4 py-3">{formatDiscount(coupon.discountType, coupon.discountValue, coupon.maxDiscountValue)}</td>
                    <td className="px-4 py-3">{coupon.xpCost.toLocaleString()} XP</td>
                    <td className="px-4 py-3">
                      {coupon.currentClaims} / {coupon.maxClaims}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge className={coupon.isActive ? 'bg-green-100 text-green-700' : ''}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View coupon stats"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setRedemptionsPage(1);
                          }}
                        >
                          <BarChart3 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} result={couponsQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      {selectedCoupon ? (
        <Panel className="mt-6 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-on-surface">{selectedCoupon.title}</p>
              <p className="mt-1 text-sm text-on-surface-variant">Redemption activity and claim status.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={statsQuery.isFetching || redemptionsQuery.isFetching}
              onClick={() => {
                void statsQuery.refetch();
                void redemptionsQuery.refetch();
              }}
            >
              <RefreshCw size={16} className={statsQuery.isFetching || redemptionsQuery.isFetching ? 'animate-spin' : undefined} />
              Refresh
            </Button>
          </div>

          {statsQuery.isLoading ? <LoadingState label="Loading stats..." /> : null}
          {statsQuery.data ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-surface-low p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Claims</p>
                <p className="mt-2 text-2xl font-semibold">{statsQuery.data.totalClaims}</p>
              </div>
              <div className="rounded-lg bg-surface-low p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Redeemed</p>
                <p className="mt-2 text-2xl font-semibold">{statsQuery.data.redeemedCount}</p>
              </div>
              <div className="rounded-lg bg-surface-low p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Rate</p>
                <p className="mt-2 text-2xl font-semibold">{Math.round(statsQuery.data.redemptionRate * 100)}%</p>
              </div>
              <div className="rounded-lg bg-surface-low p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Last redeemed</p>
                <p className="mt-2 text-sm font-medium">{formatDateTime(statsQuery.data.lastRedeemedAt)}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-5 overflow-x-auto">
            {redemptionsQuery.isLoading ? <LoadingState label="Loading redemptions..." /> : null}
            {redemptionsQuery.data?.items.length === 0 ? (
              <EmptyState title="No redemptions yet" description="Redeemed customer coupons will appear here." />
            ) : null}
            {redemptionsQuery.data && redemptionsQuery.data.items.length > 0 ? (
              <>
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Explorer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Claimed</th>
                      <th className="px-4 py-3">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptionsQuery.data.items.map((redemption) => (
                      <tr key={redemption.id} className="border-t border-outline/40">
                        <td className="px-4 py-3 font-mono text-xs">{redemption.code}</td>
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{redemption.explorerId}</td>
                        <td className="px-4 py-3">
                          <Badge>{redemption.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{formatDateTime(redemption.claimedAt)}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{formatDateTime(redemption.redeemedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationBar page={redemptionsPage} result={redemptionsQuery.data} onPageChange={setRedemptionsPage} />
              </>
            ) : null}
          </div>
        </Panel>
      ) : null}

      <CreateCouponDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setServerError(null);
        }}
        onSubmit={handleCreate}
        serverError={serverError}
        fixedVendorId={user?.id}
        vendorLabel={user?.email}
      />
    </>
  );
}
