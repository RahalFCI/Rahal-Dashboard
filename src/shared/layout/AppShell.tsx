import { Archive, Building2, FolderKanban, LayoutDashboard, LogOut, MapPinned, Tags, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { queryClient } from '@/shared/api/queryClient';
import { logout } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { UserRole } from '@/features/auth/types';
import { cn } from '@/shared/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/admin/users', label: 'Users', icon: <Users size={18} />, roles: ['Admin'] },
  { to: '/admin/vendors', label: 'Vendors', icon: <Building2 size={18} />, roles: ['Admin'] },
  { to: '/admin/places', label: 'Places', icon: <MapPinned size={18} />, roles: ['Admin'] },
  { to: '/admin/categories', label: 'Categories', icon: <Tags size={18} />, roles: ['Admin'] },
  { to: '/vendor/profile', label: 'Profile', icon: <LayoutDashboard size={18} />, roles: ['Vendor'] },
  { to: '/vendor/places', label: 'Places', icon: <FolderKanban size={18} />, roles: ['Vendor'] },
];

export function AppShell() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  async function handleLogout() {
    if (user?.role === 'Admin' || user?.role === 'Vendor') {
      await logout(user.role).catch(() => undefined);
    }
    clearSession();
    queryClient.clear();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-outline/50 bg-surface-lowest px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-white">
            <Archive size={20} />
          </span>
          <div>
            <p className="font-semibold leading-none">Rahal Control</p>
            <p className="mt-1 text-xs text-on-surface-variant">{user?.role} workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-low hover:text-on-surface',
                  isActive && 'bg-surface-mid text-on-surface',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut size={17} />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-outline/50 bg-surface/90 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Rahal Control</span>
            <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant',
                    isActive && 'bg-surface-mid text-on-surface',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
