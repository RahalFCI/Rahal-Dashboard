import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { queryClient } from '@/shared/api/queryClient';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createVendorBranch, deleteVendorBranch, listVendorBranches, updateVendorBranch } from '../api/vendorBranchApi';
import { VendorBranchDialog } from '../components/VendorBranchDialog';
import { VendorBranchTable } from '../components/VendorBranchTable';
import type { VendorBranchFormValues } from '../schemas';
import type { GetVendorBranchDto } from '../types';

export function VendorPlacesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const vendorId = user?.id ?? '';
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GetVendorBranchDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const branchesQuery = useQuery({
    queryKey: ['vendor-branches', vendorId, page],
    queryFn: () => listVendorBranches(vendorId, page, 10),
    enabled: Boolean(vendorId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vendor-branches', vendorId] });
  const upsertMutation = useMutation({
    mutationFn: (values: VendorBranchFormValues) =>
      selected ? updateVendorBranch(selected.id, values) : createVendorBranch({ ...values, vendorId }),
    onSuccess: () => {
      setDialogOpen(false);
      setSelected(null);
      void invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (branch: GetVendorBranchDto) => deleteVendorBranch(branch.id),
    onSuccess: () => void invalidate(),
  });

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title="Places"
        description="Branch locations you manage, each backed by its own place listing."
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={17} />
            New branch
          </Button>
        }
      />

      {branchesQuery.isLoading ? <LoadingState /> : null}
      {branchesQuery.isError ? <ErrorState onRetry={() => void branchesQuery.refetch()} /> : null}
      {branchesQuery.data?.items.length === 0 ? (
        <EmptyState title="No branches" description="Create a branch to list a place under your profile." />
      ) : null}
      {branchesQuery.data && branchesQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <VendorBranchTable
            branches={branchesQuery.data.items}
            onEdit={(branch) => {
              setSelected(branch);
              setDialogOpen(true);
            }}
            onDelete={(branch) => void deleteMutation.mutate(branch)}
            onPhotos={(branch) => navigate(`/vendor/places/${branch.placeId}`)}
          />
          <PaginationBar page={page} result={branchesQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <VendorBranchDialog
        open={dialogOpen}
        branch={selected}
        onOpenChange={setDialogOpen}
        onSubmit={(values) => upsertMutation.mutateAsync(values)}
      />
    </>
  );
}
