import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import Avatar from '@/components/ui/Avatar';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import ConfigNotice from './ConfigNotice';
import Footer from './Footer';

const LINKS = [
  { to: '/directory', label: 'Find a professional' },
  { to: '/refer', label: 'Refer a client' },
  { to: '/about', label: 'How it works' },
];

export default function PublicLayout() {
  const { session, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-forest-800 bg-forest-50' : 'text-stone-600 hover:text-forest-800 hover:bg-stone-100'
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <ConfigNotice />
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo size="sm" to="/" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {session ? (
              <Link to="/app" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-stone-100">
                <Avatar name={profile?.fullName || 'You'} seed={profile?.id} size="sm" />
                <span className="text-sm font-medium text-forest-800">My dashboard</span>
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className={buttonStyles('ghost', 'sm')}>Sign in</Link>
                <Link to="/join" className={buttonStyles('primary', 'sm')}>Join PlanLink</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-forest-800 transition-colors hover:bg-stone-100 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="animate-fade-in border-t border-stone-200 bg-white px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1" aria-label="Main">
              {LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-stone-200 pt-4">
              {session ? (
                <Link to="/app" className={buttonStyles('primary', 'md')} onClick={() => setMenuOpen(false)}>
                  My dashboard
                </Link>
              ) : (
                <>
                  <Link to="/sign-in" className={buttonStyles('outline', 'md')} onClick={() => setMenuOpen(false)}>Sign in</Link>
                  <Link to="/join" className={buttonStyles('primary', 'md')} onClick={() => setMenuOpen(false)}>Join PlanLink</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
