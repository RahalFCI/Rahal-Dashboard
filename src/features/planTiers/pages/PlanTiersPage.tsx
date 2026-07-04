import { useMutation, useQuery } from '@tanstack/react-query';
import { Pencil, Plus, Trash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/shared/api/errors';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useToastStore } from '@/shared/stores/toastStore';
import {
  createPlanTier,
  deletePlanTier,
  listPlanTiers,
  permanentDeletePlanTier,
  updatePlanTier,
} from '../api/planTierApi';
import { PlanTierDialog } from '../components/PlanTierDialog';
import type { PlanTierFormValues } from '../schemas';
import type { GetPlanTierDto } from '../types';

const PAGE_SIZE = 10;

export function PlanTiersPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<GetPlanTierDto | null>(null);
  const [confirmPermanentDeleteId, setConfirmPermanentDeleteId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  const tiersQuery = useQuery({
    queryKey: ['plan-tiers', page],
    queryFn: () => listPlanTiers(page, PAGE_SIZE),
  });

  function toastOnError(error: unknown) {
    if (error instanceof ApiError) useToastStore.getState().add({ message: error.message, variant: 'error' });
  }

  const createMutation = useMutation({
    mutationFn: createPlanTier,
    onSuccess: () => {
      setCreateOpen(false);
      setServerError(null);
      void queryClient.invalidateQueries({ queryKey: ['plan-tiers'] });
      useToastStore.getState().add({ message: 'Plan tier created.', variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) setServerError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PlanTierFormValues }) =>
      updatePlanTier(id, payload),
    onSuccess: () => {
      setEditingTier(null);
      setEditServerError(null);
      void queryClient.invalidateQueries({ queryKey: ['plan-tiers'] });
      useToastStore.getState().add({ message: 'Plan tier updated.', variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) setEditServerError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlanTier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plan-tiers'] });
      useToastStore.getState().add({ message: 'Plan tier deleted.', variant: 'success' });
    },
    onError: toastOnError,
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => permanentDeletePlanTier(id),
    onSuccess: () => {
      setConfirmPermanentDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ['plan-tiers'] });
      useToastStore.getState().add({ message: 'Plan tier permanently deleted.', variant: 'success' });
    },
    onError: (error) => {
      setConfirmPermanentDeleteId(null);
      toastOnError(error);
    },
  });

  async function handleCreate(values: PlanTierFormValues) {
    setServerError(null);
    await createMutation.mutateAsync(values);
  }

  async function handleUpdate(values: PlanTierFormValues) {
    if (!editingTier) return;
    setEditServerError(null);
    await updateMutation.mutateAsync({ id: editingTier.id, payload: values });
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Plan tiers"
        description="Subscription tiers explorers can choose from. Each tier defines weekly pricing, XP cost, and travel plan limits."
        actions={
          <Button type="button" onClick={() => { setServerError(null); setCreateOpen(true); }}>
            <Plus size={16} />
            New tier
          </Button>
        }
      />

      {tiersQuery.isLoading ? <LoadingState /> : null}
      {tiersQuery.isError ? <ErrorState onRetry={() => void tiersQuery.refetch()} /> : null}

      {tiersQuery.data?.items.length === 0 ? (
        <EmptyState
          title="No plan tiers yet"
          description="Create a plan tier to offer explorers subscription options."
        />
      ) : null}

      {tiersQuery.data && tiersQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Weekly price</th>
                  <th className="px-4 py-3">Weekly XP</th>
                  <th className="px-4 py-3">XP ×</th>
                  <th className="px-4 py-3">Max plans</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tiersQuery.data.items.map((tier) => (
                  <tr key={tier.id} className="border-t border-outline/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{tier.name}</p>
                      {tier.description ? (
                        <p className="line-clamp-1 text-xs text-on-surface-variant">{tier.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{tier.weeklyPrice} EGP</td>
                    <td className="px-4 py-3">{tier.weeklyXpCost.toLocaleString()} XP</td>
                    <td className="px-4 py-3">{tier.xpMultiplier}×</td>
                    <td className="px-4 py-3">{tier.maxTravelPlans}</td>
                    <td className="px-4 py-3">
                      <Badge className={tier.isActive ? 'bg-success/15 text-success' : undefined}>
                        {tier.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Edit tier"
                          onClick={() => { setEditServerError(null); setEditingTier(tier); }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Soft delete tier"
                          onClick={() => void deleteMutation.mutate(tier.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Permanently delete tier"
                          className="text-error hover:text-error"
                          onClick={() => setConfirmPermanentDeleteId(tier.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} result={tiersQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      {/* Create dialog */}
      <PlanTierDialog
        mode="create"
        open={createOpen}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); setServerError(null); } else setCreateOpen(true); }}
        onSubmit={handleCreate}
        serverError={serverError}
      />

      {/* Edit dialog */}
      <PlanTierDialog
        mode="edit"
        tier={editingTier}
        open={editingTier !== null}
        onOpenChange={(open) => { if (!open) { setEditingTier(null); setEditServerError(null); } }}
        onSubmit={handleUpdate}
        serverError={editServerError}
      />

      {/* Permanent delete confirmation */}
      <Dialog
        open={confirmPermanentDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmPermanentDeleteId(null); }}
        title="Permanently delete tier?"
        description="This cannot be undone. The tier will be removed from the database entirely."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmPermanentDeleteId(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-on-error hover:bg-error/90"
            disabled={permanentDeleteMutation.isPending}
            onClick={() => confirmPermanentDeleteId && permanentDeleteMutation.mutate(confirmPermanentDeleteId)}
          >
            Delete permanently
          </Button>
        </div>
      </Dialog>
    </>
  );
}
