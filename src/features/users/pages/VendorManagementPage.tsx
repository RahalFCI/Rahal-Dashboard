import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { approveVendorProfile, listDeletedVendorProfiles, listUnapprovedVendorProfiles, listVendorProfiles } from '@/features/vendors/api/vendorProfileApi';
import type { VendorProfileDto } from '@/features/vendors/types';
import { queryClient } from '@/shared/api/queryClient';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { cn } from '@/shared/lib/utils';

type VendorView = 'all' | 'unapproved' | 'deleted';

const views: { value: VendorView; label: string }[] = [
  { value: 'all', label: 'All vendors' },
  { value: 'unapproved', label: 'Pending approval' },
  { value: 'deleted', label: 'Deleted profiles' },
];

export function VendorManagementPage() {
  const [view, setView] = useState<VendorView>('all');
  const [page, setPage] = useState(1);

  const vendorsQuery = useQuery({
    queryKey: ['vendor-profiles', view, page],
    queryFn: () => {
      if (view === 'unapproved') return listUnapprovedVendorProfiles(page, 10);
      if (view === 'deleted') return listDeletedVendorProfiles(page, 10);
      return listVendorProfiles(page, 10);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (vendor: VendorProfileDto) => approveVendorProfile(vendor.userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] }),
  });

  function changeView(nextView: string) {
    setView(nextView as VendorView);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Vendor management"
        description="Vendor profiles, approval state, and deleted profile queues."
      />

      <Tabs.Root value={view} onValueChange={changeView}>
        <Tabs.List className="mb-4 flex flex-wrap gap-2">
          {views.map((item) => (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                'focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant',
                view === item.value && 'bg-primary text-white',
              )}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {vendorsQuery.isLoading ? <LoadingState /> : null}
      {vendorsQuery.isError ? <ErrorState onRetry={() => void vendorsQuery.refetch()} /> : null}
      {vendorsQuery.data && vendorsQuery.data.items.length === 0 ? (
        <EmptyState title="No vendors found" description="There are no vendor profiles in this view." />
      ) : null}
      {vendorsQuery.data && vendorsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {vendorsQuery.data.items.map((vendor) => (
                  <tr key={vendor.userId} className="border-t border-outline/40">
                    <td className="px-4 py-3 align-middle">
                      <p className="font-medium text-on-surface">{vendor.displayName}</p>
                      <p className="text-xs text-on-surface-variant">{vendor.userId}</p>
                    </td>
                    <td className="px-4 py-3 align-middle">{vendor.countryCode}</td>
                    <td className="px-4 py-3 align-middle">{vendor.address}</td>
                    <td className="px-4 py-3 align-middle">
                      <Badge className={vendor.isApproved ? 'bg-green-100 text-green-700' : ''}>
                        {vendor.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-end">
                        {!vendor.isApproved && view !== 'deleted' ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Approve vendor"
                            onClick={() => approveMutation.mutate(vendor)}
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} result={vendorsQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}
    </>
  );
}
