import {
  Archive,
  Award,
  Bell,
  Building2,
  CheckSquare,
  CreditCard,
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
  // Set to true to hide this item from the sidebar without removing its route/page/code.
  hidden?: boolean;
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
  { to: '/admin/check-in-challenges', label: 'Check-in challenges', icon: <FlagTriangleRight size={17} />, roles: ['Admin'], hidden: true },
  { to: '/admin/challenges', label: 'Challenges', icon: <Swords size={17} />, roles: ['Admin'] },
  { to: '/admin/coupons', label: 'Coupons', icon: <Ticket size={17} />, roles: ['Admin'] },
  { to: '/admin/user-coupon-lookup', label: 'Coupon lookup', icon: <ScanLine size={17} />, roles: ['Admin'] },
  { to: '/admin/content-moderation', label: 'Content moderation', icon: <ShieldAlert size={17} />, roles: ['Admin'] },
  { to: '/admin/payments', label: 'Payments', icon: <CreditCard size={17} />, roles: ['Admin'] },
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
    <div className="flex h-full flex-col p-3">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 py-4">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
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
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-lowest/60 hover:text-on-surface',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Divider segmenting the footer from the nav list */}
      <div className="mx-3 my-2 border-t border-outline-variant/30" />

      {/* Bottom: user + logout */}
      <div className="px-2 pb-1 pt-2 space-y-1">
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
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-lowest/60 hover:text-on-surface"
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
  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role) && !item.hidden);

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
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-sidebar overflow-hidden rounded-[28px] border border-surface-lowest/60 bg-surface-low/60 shadow-ambient backdrop-blur-xl lg:block">
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
          'fixed inset-y-3 left-3 z-50 w-72 overflow-hidden rounded-[28px] border border-surface-lowest/60 bg-surface-low/70 shadow-ambient backdrop-blur-xl transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-[120%]',
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
      <div className="lg:pl-[264px]">
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
