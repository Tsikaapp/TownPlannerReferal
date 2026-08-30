import {
  ArrowRight, Building2, Inbox, MessageSquare, Send, ShieldAlert, TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import { EnquiryStatusBadge, ReferralStatusBadge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { fetchReceivedEnquiries, fetchSentEnquiries } from '@/db/enquiries';
import { fetchReceivedReferrals, fetchSentReferrals } from '@/db/referrals';
import { formatRelative } from '@/lib/format';
import { readableError } from '@/lib/supabaseClient';
import type { Enquiry, Referral } from '@/lib/types';

function Stat({ icon: Icon, label, value, to, tone = 'forest' }: {
  icon: LucideIcon; label: string; value: number; to: string; tone?: 'forest' | 'gold';
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-card transition-all hover:border-forest-300 hover:shadow-lift"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          tone === 'gold' ? 'bg-gold-50 ring-gold-100' : 'bg-forest-50 ring-forest-100'
        } ring-1 ring-inset`}
      >
        <Icon className={`h-5 w-5 ${tone === 'gold' ? 'text-gold-600' : 'text-forest-700'}`} aria-hidden="true" />
      </span>
      <p className="mt-5 font-display text-3xl font-bold text-forest-900">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
        {label}
        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </p>
    </Link>
  );
}

export default function Dashboard() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const isProfessional = profile?.accountType !== 'client';

  const [received, setReceived] = useState<Referral[]>([]);
  const [sent, setSent] = useState<Referral[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.all([
      isProfessional ? fetchReceivedReferrals(userId) : Promise.resolve([] as Referral[]),
      fetchSentReferrals(userId),
      isProfessional ? fetchReceivedEnquiries(userId) : fetchSentEnquiries(userId),
    ])
      .then(([r, s, e]) => {
        if (cancelled) return;
        setReceived(r);
        setSent(s);
        setEnquiries(e);
      })
      .catch((err) => { if (!cancelled) setError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId, isProfessional]);

  if (loading) return <Spinner label="Loading your dashboard…" />;

  const firstName = (profile?.fullName || '').split(' ')[0];
  const newReceived = received.filter((r) => r.status === 'new').length;
  const active = received.filter((r) => r.status === 'accepted' || r.status === 'in_progress').length;
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;

  // A thin directory listing gets no traffic, so nudge for the parts that matter.
  const gaps = isProfessional
    ? ([
        [!profile?.profession, 'your discipline'],
        [!profile?.bio, 'a short biography'],
        [!profile?.city, 'your town'],
        [!profile?.services?.length, 'the services you offer'],
      ].filter(([missing]) => missing).map(([, label]) => label as string))
    : [];

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-forest-900 sm:text-3xl">
          {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        </h1>
        <p className="mt-2 text-stone-600">
          {isProfessional
            ? 'Here is where your referrals and enquiries stand.'
            : 'Here is where your enquiries stand.'}
        </p>
      </header>

      {error && <Alert tone="error" className="mb-6">{error}</Alert>}

      {isProfessional && !profile?.isListed && (
        <Alert tone="info" title="Your profile is not listed" className="mb-6">
          Clients cannot find you in the directory while your listing is switched off.{' '}
          <Link to="/app/profile" className="font-medium underline underline-offset-4">Turn it back on</Link>.
        </Alert>
      )}

      {gaps.length > 0 && profile?.isListed && (
        <Alert tone="info" title="Finish your directory profile" className="mb-6">
          Your listing is still missing {gaps.join(', ')}.{' '}
          <Link to="/app/profile" className="font-medium underline underline-offset-4">Complete it</Link> so
          clients know what you do.
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isProfessional && (
          <>
            <Stat icon={Inbox} label="New referrals" value={newReceived} to="/app/received" tone="gold" />
            <Stat icon={TrendingUp} label="Active referrals" value={active} to="/app/received" />
          </>
        )}
        <Stat icon={Send} label="Referrals sent" value={sent.length} to="/app/sent" />
        <Stat
          icon={MessageSquare}
          label={isProfessional ? 'New enquiries' : 'My enquiries'}
          value={isProfessional ? newEnquiries : enquiries.length}
          to="/app/enquiries"
          tone={isProfessional ? 'gold' : 'forest'}
        />
        {!isProfessional && (
          <Link
            to="/directory"
            className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-forest-900 p-6 text-white shadow-card transition-all hover:shadow-lift"
          >
            <Building2 className="h-5 w-5 text-gold-400" aria-hidden="true" />
            <span className="mt-5 block font-display text-lg font-semibold">Find a professional</span>
            <span className="mt-1 block text-sm text-forest-200">Browse the directory</span>
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {isProfessional && (
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-forest-900">Latest referrals</h2>
              <Link to="/app/received" className="text-sm font-medium text-forest-700 hover:text-forest-800">View all</Link>
            </div>
            {received.length === 0 ? (
              <p className="py-10 text-center text-sm text-stone-500">Nothing yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-100">
                {received.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-forest-900">{r.clientName}</p>
                      <p className="truncate text-xs text-stone-500">
                        {r.referrerName} · {formatRelative(r.createdAt)}
                      </p>
                    </div>
                    <ReferralStatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-forest-900">
              {isProfessional ? 'Latest enquiries' : 'Your enquiries'}
            </h2>
            <Link to="/app/enquiries" className="text-sm font-medium text-forest-700 hover:text-forest-800">View all</Link>
          </div>
          {enquiries.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">Nothing yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {enquiries.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-forest-900">{e.clientName}</p>
                    <p className="truncate text-xs text-stone-500">
                      {[e.projectType, formatRelative(e.createdAt)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <EnquiryStatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-stone-200 bg-forest-900 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">Got someone to refer?</h2>
          <p className="mt-1.5 text-forest-200">
            Send a client to a specialist in about a minute.
          </p>
        </div>
        <Link to="/refer" className={buttonStyles('gold', 'md', 'shrink-0')}>
          Refer a client
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {profile?.isAdmin && (
        <section className="mt-6 flex items-start gap-4 rounded-2xl border border-gold-200 bg-gold-50 p-6">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-gold-900">You are an administrator</h2>
            <p className="mt-1 text-sm text-gold-900/80">
              Open referrals that nobody has been assigned to need routing.
            </p>
            <Link to="/app/admin/referrals" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold-800 underline underline-offset-4">
              Review all referrals
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
