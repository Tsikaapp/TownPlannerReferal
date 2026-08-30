import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-forest-800 bg-forest-900 text-forest-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo size="md" tone="onDark" halo="#062A1C" tagline />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-forest-200">
            The referral network for town planners and the development industry.
            Find the right specialist, pass work on with confidence, and keep
            every referral in one place.
          </p>
        </div>

        <nav aria-label="Directory">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Find a professional
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/directory" className="text-forest-200 transition-colors hover:text-white">Browse the directory</Link></li>
            <li><Link to="/refer" className="text-forest-200 transition-colors hover:text-white">Refer a client</Link></li>
            <li><Link to="/join" className="text-forest-200 transition-colors hover:text-white">List your practice</Link></li>
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Your account
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/sign-in" className="text-forest-200 transition-colors hover:text-white">Sign in</Link></li>
            <li><Link to="/join" className="text-forest-200 transition-colors hover:text-white">Create an account</Link></li>
            <li><Link to="/app" className="text-forest-200 transition-colors hover:text-white">Referral history</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-forest-800">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-forest-300 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} PlanLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
