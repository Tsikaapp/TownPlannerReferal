import { useState, useMemo } from 'react';
import { Search, FolderInput, Plus, X } from 'lucide-react';
import { Referral, Referrer, STATUS_LABELS, STATUS_COLORS, ALL_STATUSES } from '../types';
import { formatCurrency, formatDate } from '../format';

interface Props {
  referrals: Referral[];
  referrers: Referrer[];
  onSelect: (referral: Referral) => void;
  onNew: () => void;
}

export default function ReferralsView({ referrals, referrers, onSelect, onNew }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [referrerFilter, setReferrerFilter] = useState<string>('all');

  const referralMap = useMemo(() => { const m = new Map<string, Referrer>(); referrers.forEach((r) => m.set(r.id, r)); return m; }, [referrers]);

  const filtered = useMemo(() => {
    return referrals
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (referrerFilter !== 'all') {
          if (referrerFilter === 'none' && r.referrerId) return false;
          if (referrerFilter !== 'none' && r.referrerId !== referrerFilter) return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          const referrer = r.referrerId ? referralMap.get(r.referrerId) : null;
          const haystack = [r.clientName, r.clientEmail, r.projectAddress, r.projectType, r.projectDescription, referrer?.name || '', referrer?.company || ''].join(' ').toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [referrals, search, statusFilter, referrerFilter, referralMap]);

  const hasFilters = search || statusFilter !== 'all' || referrerFilter !== 'all';
  const selectClass = 'text-sm border border-stone-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all cursor-pointer';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 tracking-tight">Referrals</h2>
          <p className="text-stone-500 mt-1.5">{filtered.length} of {referrals.length} referrals</p>
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20">
          <Plus className="w-4 h-4" /> New Referral
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by client name, address, project type, referrer..." className="w-full pl-11 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-stone-50/50 focus:bg-white" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
          </select>
          <select value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)} className={selectClass}>
            <option value="all">All referrers</option>
            <option value="none">No referrer</option>
            {referrers.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); setReferrerFilter('all'); }} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-sm">
          <FolderInput className="w-14 h-14 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 font-medium">{referrals.length === 0 ? 'No referrals yet' : 'No referrals match your filters'}</p>
          <p className="text-stone-400 text-sm mt-1">{referrals.length === 0 ? 'Click "New Referral" to add your first one.' : 'Try adjusting your search or filters.'}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3.5">Client</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3.5">Referred By</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3.5">Project</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3.5">Commission</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3.5">Referred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((ref) => {
                  const referrer = ref.referrerId ? referralMap.get(ref.referrerId) : null;
                  return (
                    <tr key={ref.id} onClick={() => onSelect(ref)} className="hover:bg-stone-50/80 cursor-pointer transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            {ref.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-stone-800">{ref.clientName}</div>
                            <div className="text-xs text-stone-400">{ref.clientPhone || ref.clientEmail || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {referrer ? (<div><div className="text-sm text-stone-700">{referrer.name}</div><div className="text-xs text-stone-400">{referrer.company}</div></div>) : (<span className="text-sm text-stone-300">Not recorded</span>)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-stone-700">{ref.projectType || '—'}</div>
                        <div className="text-xs text-stone-400 max-w-[180px] truncate">{ref.projectAddress}</div>
                      </td>
                      <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[ref.status]}`}>{STATUS_LABELS[ref.status]}</span></td>
                      <td className="px-5 py-3.5">
                        {ref.commissionAmount > 0 ? (
                          <div><div className="text-sm font-medium text-stone-700">{formatCurrency(ref.commissionAmount)}</div><div className={`text-xs ${ref.commissionStatus === 'paid' ? 'text-emerald-600' : ref.commissionStatus === 'pending' ? 'text-amber-600' : 'text-stone-400'}`}>{ref.commissionStatus === 'paid' ? 'Paid' : ref.commissionStatus === 'pending' ? 'Owed' : '—'}</div></div>
                        ) : (<span className="text-sm text-stone-300">—</span>)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-500">{formatDate(ref.referralDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((ref) => {
              const referrer = ref.referrerId ? referralMap.get(ref.referrerId) : null;
              return (
                <button key={ref.id} onClick={() => onSelect(ref)} className="w-full bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center text-sm font-bold flex-shrink-0">{ref.clientName.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-stone-800">{ref.clientName}</p>
                        <p className="text-sm text-stone-500 truncate">{referrer?.name || 'No referrer'}{ref.projectType && ` · ${ref.projectType}`}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_COLORS[ref.status]}`}>{STATUS_LABELS[ref.status]}</span>
                  </div>
                  {ref.projectAddress && <p className="text-xs text-stone-400 mt-2.5 truncate">{ref.projectAddress}</p>}
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-stone-100">
                    <span className="text-xs text-stone-400">{formatDate(ref.referralDate)}</span>
                    {ref.commissionAmount > 0 && <span className={`text-xs font-medium ${ref.commissionStatus === 'paid' ? 'text-emerald-600' : ref.commissionStatus === 'pending' ? 'text-amber-600' : 'text-stone-400'}`}>{formatCurrency(ref.commissionAmount)} {ref.commissionStatus === 'paid' ? '(paid)' : ref.commissionStatus === 'pending' ? '(owed)' : ''}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
