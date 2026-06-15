import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { useState } from 'react';
import { queryClient } from '@/shared/api/queryClient';
import { ApiError } from '@/shared/api/errors';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Panel } from '@/shared/components/ui/panel';
import { ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { useAuthStore } from '@/features/auth/store/authStore';
import { listCategories } from '@/features/places/api/placesApi';
import {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  updateVendorProfilePicture,
} from '../api/vendorProfileApi';
import { VendorProfileDialog } from '../components/VendorProfileDialog';
import type { UpsertVendorProfileDto } from '../types';

export function VendorProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['vendor-profile', user?.id],
    queryFn: () => getVendorProfile(user?.id ?? ''),
    enabled: Boolean(user?.id),
    retry: (_, error) => !(error instanceof ApiError && error.code === 'NOT_FOUND'),
  });

  const categoriesQuery = useQuery({
    queryKey: ['place-categories'],
    queryFn: listCategories,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ values, file }: { values: UpsertVendorProfileDto; file?: File | null }) => {
      await updateVendorProfile(values.userId, values);
      if (file) await updateVendorProfilePicture(values.userId, file);
    },
    onSuccess: () => {
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ values, file }: { values: UpsertVendorProfileDto; file?: File | null }) => {
      await createVendorProfile(values);
      if (file) await updateVendorProfilePicture(values.userId, file);
    },
    onSuccess: () => {
      setSetupOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
    },
  });

  const vendor = profileQuery.data;
  const noProfile = profileQuery.isError && profileQuery.error instanceof ApiError && profileQuery.error.code === 'NOT_FOUND';

  return (
    <>
      <PageHeader
        eyebrow="Vendor"
        title="Vendor profile"
        description="Business identity and approval state used across vendor-managed listings."
        actions={
          vendor ? (
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Edit profile
            </Button>
          ) : null
        }
      />

      {profileQuery.isLoading ? <LoadingState label="Loading profile..." /> : null}
      {profileQuery.isError && !noProfile ? <ErrorState onRetry={() => void profileQuery.refetch()} /> : null}

      {noProfile ? (
        <Panel className="p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-lg bg-primary-container text-primary">
            <Building2 size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-on-surface">Set up your vendor profile</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Complete your business profile to start managing listings. An admin will review and approve it.
          </p>
          <Button className="mt-6" onClick={() => setSetupOpen(true)}>
            Create profile
          </Button>
        </Panel>
      ) : null}

      {vendor ? (
        <Panel className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 place-items-center rounded-lg bg-primary-container text-primary">
                <Building2 size={22} />
              </span>
              <div>
                <h2 className="text-xl font-semibold">{vendor.displayName}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{vendor.addressUrl}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{vendor.countryCode || 'No country'}</Badge>
                  <Badge className={vendor.isApproved ? 'bg-green-100 text-green-700' : ''}>
                    {vendor.isApproved ? 'Approved' : 'Pending approval'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-sm text-on-surface-variant sm:text-right">
              <p>{categoriesQuery.data?.find((category) => category.id === vendor.categoryId)?.name ?? 'Uncategorized'}</p>
              <p className="mt-1">{vendor.address}</p>
            </div>
          </div>
        </Panel>
      ) : null}

      <VendorProfileDialog
        open={dialogOpen}
        profile={profileQuery.data}
        categories={categoriesQuery.data ?? []}
        isLoading={profileQuery.isLoading || categoriesQuery.isLoading}
        onOpenChange={setDialogOpen}
        onSubmit={(values, file) => updateMutation.mutateAsync({ values, file })}
      />

      <VendorProfileDialog
        open={setupOpen}
        userId={user?.id}
        title="Set up vendor profile"
        categories={categoriesQuery.data ?? []}
        isLoading={categoriesQuery.isLoading}
        onOpenChange={setSetupOpen}
        onSubmit={(values, file) => createMutation.mutateAsync({ values, file })}
      />
    </>
  );
}
