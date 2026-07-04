import {
  Archive,
  Award,
  Bell,
  Building2,
  CheckSquare,
  FlagTriangleRight,
  FolderKanban,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Medal,
  Menu,
  ScanLine,
  Search,
  ShieldAlert,
  Swords,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  { to: '/admin/users', label: 'Users', icon: <Users size={17} />, roles: ['Admin'] },
  { to: '/admin/vendors', label: 'Vendors', icon: <Building2 size={17} />, roles: ['Admin'] },
  { to: '/admin/places', label: 'Places', icon: <MapPinned size={17} />, roles: ['Admin'] },
  { to: '/admin/search', label: 'User & Explorer Search', icon: <Search size={17} />, roles: ['Admin'] },
  { to: '/admin/user-stats', label: 'User stats', icon: <TrendingUp size={17} />, roles: ['Admin'] },
  { to: '/admin/explorer-achievements', label: 'Earned achievements', icon: <Award size={17} />, roles: ['Admin'] },
  { to: '/admin/achievements', label: 'Achievement catalog', icon: <Trophy size={17} />, roles: ['Admin'] },
  { to: '/admin/badges', label: 'Badges', icon: <Medal size={17} />, roles: ['Admin'] },
  { to: '/admin/check-ins', label: 'Check-ins', icon: <CheckSquare size={17} />, roles: ['Admin'] },
  { to: '/admin/check-in-challenges', label: 'Check-in challenges', icon: <FlagTriangleRight size={17} />, roles: ['Admin'] },
  { to: '/admin/challenges', label: 'Challenges', icon: <Swords size={17} />, roles: ['Admin'] },
  { to: '/admin/coupons', label: 'Coupons', icon: <Ticket size={17} />, roles: ['Admin'] },
  { to: '/admin/user-coupon-lookup', label: 'Coupon lookup', icon: <ScanLine size={17} />, roles: ['Admin'] },
  { to: '/admin/content-moderation', label: 'Content moderation', icon: <ShieldAlert size={17} />, roles: ['Admin'] },
  { to: '/admin/plan-tiers', label: 'Plan tiers', icon: <Layers size={17} />, roles: ['Admin'] },
  { to: '/vendor/profile', label: 'Profile', icon: <LayoutDashboard size={17} />, roles: ['Vendor'] },
  { to: '/vendor/places', label: 'My Places', icon: <FolderKanban size={17} />, roles: ['Vendor'] },
  { to: '/vendor/redeem', label: 'Redeem coupon', icon: <Ticket size={17} />, roles: ['Vendor'] },
];

function SidebarContent({
  items,
  user,
  onLogout,
}: {
  items: NavItem[];
  user: { email: string; role: string } | null;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid size-9 place-items-center rounded-lg bg-primary text-white">
          <Archive size={17} />
        </span>
        <div>
          <p className="text-sm font-semibold leading-none text-on-surface">Rahal</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            Relic Modernism
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-3 flex-1 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 border-l-[3px] py-2.5 pl-[18px] pr-5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-primary bg-surface text-on-surface'
                  : 'border-l-transparent text-on-surface-variant hover:bg-surface/60 hover:text-on-surface',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-outline-variant/40 px-4 py-4 space-y-1">
        {user && (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">
              {user.role} workspace
            </p>
            <p className="mt-0.5 truncate text-sm text-on-surface-variant">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  const avatarInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';

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
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar bg-surface-low lg:block">
        <SidebarContent items={visibleItems} user={user} onLogout={() => void handleLogout()} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-surface-low transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-mid"
        >
          <X size={18} />
        </button>
        <SidebarContent items={visibleItems} user={user} onLogout={() => void handleLogout()} />
      </aside>

      {/* ── Main area ── */}
      <div className="lg:pl-sidebar">
        {/* Sticky top header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-outline-variant/30 bg-surface/90 px-4 backdrop-blur-sm sm:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-mid lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Workspace label (desktop) */}
          <p className="hidden shrink-0 text-sm font-semibold text-on-surface lg:block">
            Rahal <span className="text-on-surface-variant">{user?.role}</span>
          </p>

          {/* Search bar */}
          <div className="relative mx-auto w-full max-w-sm lg:ml-6 lg:mr-auto">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <input
              type="search"
              placeholder="Search across everything..."
              className="h-9 w-full rounded-full bg-surface-mid/70 pl-9 pr-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:bg-surface-mid focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Right controls */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button className="grid size-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-mid hover:text-on-surface">
              <Bell size={17} />
            </button>
            <button className="grid size-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-mid hover:text-on-surface">
              <HelpCircle size={17} />
            </button>
            <button className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
              {avatarInitials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
