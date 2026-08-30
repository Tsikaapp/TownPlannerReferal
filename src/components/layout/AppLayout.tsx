import {
  Building2, Inbox, LayoutDashboard, LogOut, Menu, Send, Settings, ShieldCheck, Users, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/auth/useAuth';
import ConfigNotice from './ConfigNotice';

interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isProfessional = profile?.accountType !== 'client';

  const main: NavItem[] = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    ...(isProfessional
      ? [
          { to: '/app/received', label: 'Referrals received', icon: Inbox },
          { to: '/app/enquiries', label: 'Client enquiries', icon: Building2 },
        ]
      : [{ to: '/app/enquiries', label: 'My enquiries', icon: Building2 }]),
    { to: '/app/sent', label: 'Referrals sent', icon: Send },
    { to: '/app/profile', label: isProfessional ? 'My profile' : 'My account', icon: Settings },
  ];

  const admin: NavItem[] = [
    { to: '/app/admin/referrals', label: 'All referrals', icon: ShieldCheck },
    { to: '/app/admin/members', label: 'Members', icon: Users },
  ];

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-forest-700 text-white shadow-sm'
        : 'text-forest-100 hover:bg-forest-800 hover:text-white'
    }`;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-forest-900">
      <div className="flex h-18 shrink-0 items-center justify-between px-5">
        <Logo size="sm" tone="onDark" halo="#062A1C" to="/" />
        <button
          type="button"
          className="rounded-lg p-1.5 text-forest-200 hover:bg-forest-800 hover:text-white lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        {main.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={itemClass} onClick={() => setOpen(false)}>
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

        {profile?.isAdmin && (
          <>
            <p className="px-3 pb-2 pt-6 font-display text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
              Administration
            </p>
            {admin.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={itemClass} onClick={() => setOpen(false)}>
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="shrink-0 border-t border-forest-800 p-3">
        <Link
          to="/app/profile"
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-forest-800"
          onClick={() => setOpen(false)}
        >
          <Avatar name={profile?.fullName || 'You'} seed={profile?.id} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">
              {profile?.fullName || 'Your account'}
            </span>
            <span className="block truncate text-xs text-forest-300">
              {profile?.isAdmin ? 'Administrator' : profile?.profession || (isProfessional ? 'Professional' : 'Client')}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-200 transition-colors hover:bg-forest-800 hover:text-white"
        >
          <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 lg:flex">
      <aside className="hidden w-64 shrink-0 lg:fixed lg:inset-y-0 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default bg-forest-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw] animate-slide-up shadow-pop">{sidebar}</div>
        </div>
      )}

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <ConfigNotice />
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-forest-800 transition-colors hover:bg-stone-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo size="sm" to="/app" />
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
