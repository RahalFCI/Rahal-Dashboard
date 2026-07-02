import { useMutation, useQuery } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { listVendorProfiles } from '@/features/vendors/api/vendorProfileApi';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useToastStore } from '@/shared/stores/toastStore';
import { createCoupon, deleteCoupon, listCoupons, updateCoupon } from '../api/couponApi';
import { CreateCouponDialog } from '../components/CreateCouponDialog';
import { EditCouponDialog } from '../components/EditCouponDialog';
import type { CreateCouponFormValues, UpdateCouponFormValues } from '../schemas';
import type { GetCouponDto } from '../types';

const PAGE_SIZE = 10;

export function CouponsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<GetCouponDto | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  const couponsQuery = useQuery({
    queryKey: ['coupons', page],
    queryFn: () => listCoupons(page, PAGE_SIZE),
  });

  const vendorsQuery = useQuery({
    queryKey: ['vendor-profiles-for-coupon'],
    queryFn: () => listVendorProfiles(1, 200),
  });
  const vendorNameById = new Map((vendorsQuery.data?.items ?? []).map((v) => [v.userId, v.displayName]));

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      setDialogOpen(false);
      setServerError(null);
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
      useToastStore.getState().add({ message: 'Coupon created.', variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) setServerError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCoupon>[1] }) =>
      updateCoupon(id, payload),
    onSuccess: () => {
      setEditingCoupon(null);
      setEditServerError(null);
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
      useToastStore.getState().add({ message: 'Coupon updated.', variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) setEditServerError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
      useToastStore.getState().add({ message: 'Coupon deleted.', variant: 'success' });
    },
    onError: toastOnError,
  });

  function toDiscountTypeString(value: number): 'FixedAmount' | 'Percentage' {
    return value === 1 ? 'Percentage' : 'FixedAmount';
  }

  async function handleUpdate(values: UpdateCouponFormValues) {
    if (!editingCoupon) return;
    setEditServerError(null);
    const maxDiscountValue =
      values.maxDiscountValue !== '' ? parseFloat(values.maxDiscountValue) : null;
    await updateMutation.mutateAsync({
      id: editingCoupon.id,
      payload: {
        title: editingCoupon.title,
        description: values.description,
        xpCost: values.xpCost,
        discountType: toDiscountTypeString(Number(values.discountType)),
        discountValue: values.discountValue,
        maxDiscountValue,
        minimumCharge: values.minimumCharge,
        maxClaims: values.maxClaims,
        expiresAt: new Date(values.expiresAt).toISOString(),
        isActive: values.isActive,
      },
    });
  }

  async function handleCreate(values: CreateCouponFormValues) {
    setServerError(null);
    const maxDiscountValue =
      values.maxDiscountValue !== '' ? parseFloat(values.maxDiscountValue) : null;
    await createMutation.mutateAsync({
      vendorId: values.vendorId,
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

  function formatDiscount(type: string, value: number, maxValue: number | null) {
    if (type === 'Percentage') {
      return maxValue ? `${value}% (cap ${maxValue} EGP)` : `${value}%`;
    }
    return `${value} EGP off`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Coupons"
        description="Vendor coupons explorers can claim with XP and redeem at checkout."
        actions={
          <Button type="button" onClick={() => { setServerError(null); setDialogOpen(true); }}>
            <Plus size={16} />
            New coupon
          </Button>
        }
      />

      {couponsQuery.isLoading ? <LoadingState /> : null}
      {couponsQuery.isError ? <ErrorState onRetry={() => void couponsQuery.refetch()} /> : null}

      {couponsQuery.data?.items.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          description="Create a coupon for a vendor and explorers can claim it with their XP."
        />
      ) : null}

      {couponsQuery.data && couponsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Min charge</th>
                  <th className="px-4 py-3">XP cost</th>
                  <th className="px-4 py-3">Claims</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {couponsQuery.data.items.map((coupon) => (
                  <tr key={coupon.id} className="border-t border-outline/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{coupon.title}</p>
                      {coupon.description ? (
                        <p className="line-clamp-1 text-xs text-on-surface-variant">{coupon.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {vendorNameById.get(coupon.vendorId) ?? 'Unknown vendor'}
                    </td>
                    <td className="px-4 py-3">
                      {formatDiscount(coupon.discountType, coupon.discountValue, coupon.maxDiscountValue)}
                    </td>
                    <td className="px-4 py-3">{coupon.minimumCharge} EGP</td>
                    <td className="px-4 py-3">{coupon.xpCost.toLocaleString()} XP</td>
                    <td className="px-4 py-3">
                      {coupon.currentClaims} / {coupon.maxClaims}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Edit coupon"
                          onClick={() => { setEditServerError(null); setEditingCoupon(coupon); }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete coupon"
                          onClick={() => void deleteMutation.mutate(coupon.id)}
                        >
                          <Trash2 size={16} />
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

      <CreateCouponDialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) { setDialogOpen(false); setServerError(null); } else setDialogOpen(true); }}
        onSubmit={handleCreate}
        serverError={serverError}
      />

      <EditCouponDialog
        coupon={editingCoupon}
        open={editingCoupon !== null}
        onOpenChange={(open) => { if (!open) { setEditingCoupon(null); setEditServerError(null); } }}
        onSubmit={handleUpdate}
        serverError={editServerError}
      />
    </>
  );
}
