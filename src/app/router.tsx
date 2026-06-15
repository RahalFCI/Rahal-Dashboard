import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from '@/features/auth/pages/AccountRecoveryPages';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { CategoriesPage } from '@/features/places/pages/CategoriesPage';
import { PlacesPage } from '@/features/places/pages/PlacesPage';
import { VendorDashboardPage } from '@/features/vendors/pages/VendorDashboardPage';
import { VendorPlaceDetailPage } from '@/features/vendors/pages/VendorPlaceDetailPage';
import { VendorPlacesPage } from '@/features/vendors/pages/VendorPlacesPage';
import { VendorProfilePage } from '@/features/vendors/pages/VendorProfilePage';
import { UserManagementPage } from '@/features/users/pages/UserManagementPage';
import { VendorManagementPage } from '@/features/users/pages/VendorManagementPage';
import { AppShell } from '@/shared/layout/AppShell';
import { RequireAuth } from './route-guards';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  {
    path: '/',
    element: (
      <RequireAuth roles={['Admin', 'Vendor']}>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/users" replace /> },
      {
        path: 'admin/users',
        element: (
          <RequireAuth roles={['Admin']}>
            <UserManagementPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/vendors',
        element: (
          <RequireAuth roles={['Admin']}>
            <VendorManagementPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/places',
        element: (
          <RequireAuth roles={['Admin']}>
            <PlacesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/categories',
        element: (
          <RequireAuth roles={['Admin']}>
            <CategoriesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'vendor/dashboard',
        element: (
          <RequireAuth roles={['Vendor']}>
            <VendorDashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'vendor/profile',
        element: (
          <RequireAuth roles={['Vendor']}>
            <VendorProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'vendor/places',
        element: (
          <RequireAuth roles={['Vendor']}>
            <VendorPlacesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'vendor/places/:placeId',
        element: (
          <RequireAuth roles={['Vendor']}>
            <VendorPlaceDetailPage />
          </RequireAuth>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
