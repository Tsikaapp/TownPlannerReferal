import { Eye, EyeOff, Search, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { fetchAllMembers, updateProfile } from '@/db/profiles';
import { formatDate } from '@/lib/format';
import { readableError } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/types';

export default function AdminMembers() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllMembers()
      .then((rows) => { if (!cancelled) setMembers(rows); })
      .catch((err) => { if (!cancelled) setError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.fullName, m.company, m.email, m.profession, m.city].join(' ').toLowerCase().includes(q)
    );
  }, [members, query]);

  const toggleListing = async (m: Profile) => {
    setBusyId(m.id);
    setError(null);
    try {
      const updated = await updateProfile(m.id, { isListed: !m.isListed });
      setMembers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setError(readableError(err, 'Could not change that listing.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Members" description="Everyone with a PlanLink account." />

      {loading ? (
        <Spinner />
      ) : error && members.length === 0 ? (
        <Alert tone="error" title="Could not load members">{error}</Alert>
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" />
      ) : (
        <>
          {error && <Alert tone="error" className="mb-5">{error}</Alert>}

          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members"
              aria-label="Search members"
              className="field-input pl-10"
            />
          </div>

          <p className="mb-4 text-sm text-stone-500">{filtered.length} of {members.length} members</p>

          <ul className="space-y-3">
            {filtered.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-card sm:flex-row sm:items-center"
              >
                <Avatar name={m.fullName} seed={m.id} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-forest-900">
                    {m.isListed && m.accountType === 'professional' ? (
                      <Link to={`/directory/${m.id}`} className="hover:underline">{m.fullName || 'Unnamed'}</Link>
                    ) : (
                      m.fullName || 'Unnamed'
                    )}
                    {m.isAdmin && (
                      <Badge className="bg-gold-100 text-gold-800 ring-gold-200">
                        <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                        Admin
                      </Badge>
                    )}
                    {m.accountType === 'client' && (
                      <Badge className="bg-stone-100 text-stone-600 ring-stone-300">Client</Badge>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-stone-500">
                    {[m.profession, m.company, m.email].filter(Boolean).join(' · ') || 'No details given'}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    Joined {formatDate(m.createdAt)}
                    {[m.city, m.province].filter(Boolean).length > 0 &&
                      ` · ${[m.city, m.province].filter(Boolean).join(', ')}`}
                  </p>
                </div>

                {m.accountType === 'professional' && (
                  <button
                    type="button"
                    onClick={() => toggleListing(m)}
                    disabled={busyId === m.id}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                      m.isListed
                        ? 'border-forest-200 bg-forest-50 text-forest-700 hover:bg-forest-100'
                        : 'border-stone-300 bg-white text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {m.isListed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {m.isListed ? 'Listed' : 'Unlisted'}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-xl bg-stone-100 px-4 py-3 text-xs leading-relaxed text-stone-600">
            Administrators are promoted directly in the database, never through this
            screen — the <code className="font-mono">is_admin</code> column is excluded
            from every API grant so nobody can escalate their own account.
          </p>
        </>
      )}
    </>
  );
}
