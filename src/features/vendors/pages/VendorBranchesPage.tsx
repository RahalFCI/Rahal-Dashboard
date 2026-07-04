import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { createVendorBranch, deleteVendorBranch, listVendorBranches, updateVendorBranch } from '../api/vendorBranchApi';
import { VendorBranchDialog } from '../components/VendorBranchDialog';
import type { UpsertVendorBranchDto, VendorBranchDto } from '../types';

export function VendorBranchesPage() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<VendorBranchDto | null>(null);

  const branchesQuery = useQuery({
    queryKey: ['vendor-branches', user?.id, page],
    queryFn: () => listVendorBranches(user?.id ?? '', page, 10),
    enabled: Boolean(user?.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vendor-branches', user?.id] });

  const upsertMutation = useMutation({
    mutationFn: (values: UpsertVendorBranchDto) => {
      if (selectedBranch) return updateVendorBranch(selectedBranch.id, values);
      return createVendorBranch({ ...values, vendorId: user?.id ?? '' });
    },
    onSuccess: () => {
      setDialogOpen(false);
      setSelectedBranch(null);
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (branch: VendorBranchDto) => deleteVendorBranch(branch.id),
    onSuccess: () => void invalidate(),
  });

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title="Branches"
        description="Manage the physical branches connected to your vendor profile."
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelectedBranch(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={17} />
            New branch
          </Button>
        }
      />

      {branchesQuery.isLoading ? <LoadingState label="Loading branches..." /> : null}
      {branchesQuery.isError ? <ErrorState onRetry={() => void branchesQuery.refetch()} /> : null}
      {branchesQuery.data?.items.length === 0 ? (
        <EmptyState title="No branches" description="Create a branch so customers can find and redeem offers at your location." />
      ) : null}

      {branchesQuery.data && branchesQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Branch</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Geofence</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {branchesQuery.data.items.map((branch) => (
                  <tr key={branch.id} className="border-t border-outline/40">
                    <td className="px-4 py-3 align-middle">
                      <p className="font-medium text-on-surface">{branch.branchName}</p>
                      <p className="text-xs text-on-surface-variant">{branch.phoneNumber}</p>
                      {branch.notes ? <p className="mt-1 max-w-xs truncate text-xs text-on-surface-variant">{branch.notes}</p> : null}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p>{branch.address?.addressLine || branch.placeName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {[branch.address?.city, branch.address?.government, branch.address?.country].filter(Boolean).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-on-surface-variant">
                      <p>
                        {branch.latitude.toFixed(5)}, {branch.longitude.toFixed(5)}
                      </p>
                      <p>{branch.geoFenceRange}m range</p>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Badge className={branch.isActive ? 'bg-green-100 text-green-700' : ''}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Edit branch"
                          onClick={() => {
                            setSelectedBranch(branch);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete branch"
                          onClick={() => void deleteMutation.mutate(branch)}
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
          <PaginationBar page={page} result={branchesQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}

      <VendorBranchDialog
        branch={selectedBranch}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedBranch(null);
        }}
        onSubmit={(values) => upsertMutation.mutateAsync(values)}
      />
    </>
  );
}
