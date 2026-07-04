import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getVendorProfile } from '../api/vendorProfileApi';

export function useVendorApproval() {
  const user = useAuthStore((state) => state.user);

  const profileQuery = useQuery({
    queryKey: ['vendor-profile', user?.id],
    queryFn: () => getVendorProfile(user?.id ?? ''),
    enabled: user?.role === 'Vendor' && Boolean(user.id),
    retry: (_, error) => !(error instanceof ApiError && error.code === 'NOT_FOUND'),
  });

  return {
    ...profileQuery,
    isApproved: profileQuery.data?.isApproved === true,
  };
}
