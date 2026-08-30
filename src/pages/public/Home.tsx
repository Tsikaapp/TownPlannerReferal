import {
  ArrowRight, Building2, ClipboardList, Compass, Handshake, Search, ShieldCheck, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoMark from '@/components/brand/LogoMark';
import { buttonStyles } from '@/components/ui/styles';
import { PROFESSIONS } from '@/lib/constants';

const STEPS = [
  {
    label: 'Connect',
    icon: Compass,
    title: 'Find the right specialist',
    body:
      'Search the directory by discipline, province and town. Every listing shows what the practice does and the work it takes on.',
  },
  {
    label: 'Refer',
    icon: Handshake,
    title: 'Pass the work on',
    body:
      'Send a referral in under a minute. You do not need an account to refer someone — sign in later with the same email and it will be waiting in your history.',
  },
  {
    label: 'Build',
    icon: ClipboardList,
    title: 'Keep track of it all',
    body:
      'Every referral you send and receive stays in one place, with its status, its reference number and the client detail you captured.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-900">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-900 to-forest-950"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-40 -top-20 opacity-[0.08] lg:-right-24" aria-hidden="true">
          <LogoMark size={680} tone="onDark" halo="#062A1C" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-800/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400 ring-1 ring-inset ring-gold-500/25">
              Connect · Refer · Build
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              The referral network for{' '}
              <span className="text-gold-400">town planners</span> and the
              development industry.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-forest-100">
              Find the specialist a project actually needs, pass the work on in a
              minute, and keep every referral in one place. Refer without an
              account — sign in when you want the detail.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/directory" className={buttonStyles('gold', 'lg')}>
                <Search className="h-4.5 w-4.5" aria-hidden="true" />
                Find a professional
              </Link>
              <Link
                to="/refer"
                className={buttonStyles('onDark', 'lg')}
              >
                Refer a client
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-forest-800">
          <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-forest-800 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
            {[
              { icon: Users, term: 'Every discipline', desc: 'Planners, architects, surveyors, engineers and more' },
              { icon: ShieldCheck, term: 'Private by default', desc: 'Referral detail is only ever visible once you sign in' },
              { icon: Building2, term: 'Built for the work', desc: 'Rezonings, township establishment, subdivisions, consent use' },
            ].map(({ icon: Icon, term, desc }) => (
              <div key={term} className="flex gap-4 px-2 py-7 sm:px-8">
                <Icon className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
                <div>
                  <dt className="font-display text-sm font-semibold text-white">{term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-forest-300">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-forest-900 sm:text-4xl">How PlanLink works</h2>
          <p className="mt-4 text-lg text-stone-600">
            Three steps, and the middle one takes about a minute.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 lg:grid-cols-3">
          {STEPS.map(({ label, icon: Icon, title, body }, i) => (
            <li key={label} className="relative rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
              <span className="absolute right-8 top-8 font-display text-5xl font-bold text-stone-100" aria-hidden="true">
                {i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-forest-700">
                <Icon className="h-5.5 w-5.5 text-gold-400" aria-hidden="true" />
              </span>
              <p className="relative mt-6 font-display text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                {label}
              </p>
              <h3 className="relative mt-2 text-xl font-semibold text-forest-900">{title}</h3>
              <p className="relative mt-3 leading-relaxed text-stone-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Disciplines */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-forest-900">Browse by discipline</h2>
          <p className="mt-3 text-stone-600">Jump straight to the specialists you need.</p>

          <ul className="mt-10 flex flex-wrap gap-3">
            {PROFESSIONS.filter((p) => p !== 'Other').map((p) => (
              <li key={p}>
                <Link
                  to={`/directory?profession=${encodeURIComponent(p)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-forest-800 transition-all hover:border-forest-600 hover:bg-forest-50"
                >
                  {p}
                  <ArrowRight className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Two audiences */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 ring-1 ring-inset ring-forest-100">
            <Handshake className="h-5.5 w-5.5 text-forest-700" aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-2xl font-bold text-forest-900">For professionals</h2>
          <p className="mt-3 leading-relaxed text-stone-600">
            List your practice, get found by clients searching your discipline, and
            trade referrals with the people you already work alongside. Your
            referral history, sent and received, lives in one dashboard.
          </p>
          <Link to="/join" className={buttonStyles('primary', 'md', 'mt-8')}>
            List your practice
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 ring-1 ring-inset ring-gold-100">
            <Search className="h-5.5 w-5.5 text-gold-600" aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-2xl font-bold text-forest-900">For clients</h2>
          <p className="mt-3 leading-relaxed text-stone-600">
            Have a development, a rezoning or a subdivision in mind? Browse the
            directory, read what each practice does, and contact them straight from
            their profile. No account needed to get in touch.
          </p>
          <Link to="/directory" className={buttonStyles('outline', 'md', 'mt-8')}>
            Browse the directory
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-forest-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Got someone to refer right now?
            </h2>
            <p className="mt-2 text-forest-200">
              You do not need an account. It takes about a minute.
            </p>
          </div>
          <Link to="/refer" className={buttonStyles('gold', 'lg', 'shrink-0')}>
            Refer a client
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
