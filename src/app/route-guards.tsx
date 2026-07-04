import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { UserRole } from '@/features/auth/types';
import { useVendorApproval } from '@/features/vendors/hooks/useVendorApproval';

export function RequireAuth({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const location = useLocation();
  const { user, hasHydrated, hydrate } = useAuthStore();

  if (!hasHydrated) {
    hydrate();
    return <div className="p-8 text-sm text-on-surface-variant">Restoring session...</div>;
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!roles.includes(user.role)) {
    const fallback = user.role === 'Admin' ? '/admin/users' : '/vendor/profile';
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export function RequireApprovedVendor({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const vendorApproval = useVendorApproval();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Vendor') return <Navigate to="/admin/users" replace />;

  if (vendorApproval.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Checking vendor approval...</div>;
  }

  if (!vendorApproval.isApproved) {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return children;
}
