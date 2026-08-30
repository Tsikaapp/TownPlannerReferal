import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import Logo from '@/components/brand/Logo';
import LogoMark from '@/components/brand/LogoMark';
import ConfigNotice from './ConfigNotice';

/**
 * Split layout for every credential screen: brand panel on the left, form on
 * the right, collapsing to form-only on small screens.
 */
export default function AuthLayout({
  title, subtitle, children, footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="relative hidden overflow-hidden bg-forest-900 lg:flex lg:w-[45%] lg:flex-col lg:justify-between lg:p-12">
        {/* Oversized mark, bled off the corner as a watermark. */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 opacity-[0.07]" aria-hidden="true">
          <LogoMark size={460} tone="onDark" halo="#062A1C" />
        </div>

        <Logo size="md" tone="onDark" halo="#062A1C" tagline to="/" />

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            The referral network for the development industry.
          </h2>
          <p className="mt-4 text-forest-200">
            Town planners, architects, surveyors and engineers — connected in one
            place, so the right specialist is always a referral away.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-forest-100">
            {[
              'Refer a client in under a minute, with or without an account',
              'Track every referral you send and receive',
              'Get found by clients looking for your discipline',
            ].map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-forest-400">
          © {new Date().getFullYear()} PlanLink
        </p>
      </aside>

      <div className="flex flex-1 flex-col">
        <ConfigNotice />
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <Logo size="md" to="/" />
            </div>
            <h1 className="mt-8 text-2xl font-bold text-forest-900 lg:mt-0">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-stone-600">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-stone-600">{footer}</div>}
          </div>
        </div>
        <p className="px-4 pb-8 text-center text-xs text-stone-400 sm:px-8">
          <Link to="/" className="transition-colors hover:text-forest-700">← Back to PlanLink</Link>
        </p>
      </div>
    </div>
  );
}
