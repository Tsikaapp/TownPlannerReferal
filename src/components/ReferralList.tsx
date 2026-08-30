import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ReferralStatusBadge } from '@/components/ui/Badge';
import { REFERRAL_STATUSES, REFERRAL_STATUS_LABELS } from '@/lib/constants';
import { formatRelative } from '@/lib/format';
import type { Referral } from '@/lib/types';

/**
 * Shared list for every referral screen. A table on wide screens, stacked cards
 * on narrow ones, with the same client-side search and status filter.
 */
export default function ReferralList({
  referrals, onSelect, personColumn = 'Referred by', personOf,
}: {
  referrals: Referral[];
  onSelect: (r: Referral) => void;
  /** Header for the column showing the other party. */
  personColumn?: string;
  personOf: (r: Referral) => string;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return referrals.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.clientName, r.reference, r.referrerName, r.projectAddress, r.projectType]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [referrals, query, status]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client, reference or address"
            aria-label="Search referrals"
            className="field-input pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="field-input w-full cursor-pointer sm:w-52"
        >
          <option value="">All statuses</option>
          {REFERRAL_STATUSES.map((s) => (
            <option key={s} value={s}>{REFERRAL_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-14 text-center text-sm text-stone-500">
          Nothing matches that search.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card">
          {/* Desktop */}
          <table className="hidden w-full text-left md:table">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                <th scope="col" className="px-6 py-3.5">Client</th>
                <th scope="col" className="px-6 py-3.5">{personColumn}</th>
                <th scope="col" className="px-6 py-3.5">Work</th>
                <th scope="col" className="px-6 py-3.5">Status</th>
                <th scope="col" className="px-6 py-3.5">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => onSelect(r)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r); } }}
                  className="cursor-pointer transition-colors hover:bg-forest-50/60"
                >
                  <td className="px-6 py-4">
                    <span className="block font-medium text-forest-900">{r.clientName}</span>
                    <span className="block font-mono text-xs text-stone-400">{r.reference}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{personOf(r) || '—'}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{r.projectType || '—'}</td>
                  <td className="px-6 py-4"><ReferralStatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-sm text-stone-500">{formatRelative(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <ul className="divide-y divide-stone-100 md:hidden">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className="w-full px-5 py-4 text-left transition-colors hover:bg-forest-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-forest-900">{r.clientName}</p>
                      <p className="font-mono text-xs text-stone-400">{r.reference}</p>
                    </div>
                    <ReferralStatusBadge status={r.status} />
                  </div>
                  <p className="mt-2 truncate text-sm text-stone-600">
                    {[personOf(r), r.projectType].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">{formatRelative(r.createdAt)}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
