import { useState, useMemo } from 'react';
import { Users, Plus, Mail, Phone, Building2, Pencil } from 'lucide-react';
import { Referrer, Referral } from '../types';
import { formatCurrency } from '../format';

interface Props {
  referrers: Referrer[];
  referrals: Referral[];
  onSelect: (referrer: Referrer) => void;
  onNew: () => void;
}

export default function ReferrersView({ referrers, referrals, onSelect, onNew }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return referrers;
    const q = search.toLowerCase();
    return referrers.filter((r) => [r.name, r.company, r.email, r.phone].join(' ').toLowerCase().includes(q));
  }, [referrers, search]);

  const statsByReferrer = useMemo(() => {
    const map = new Map<string, { count: number; owed: number; paid: number }>();
    referrals.forEach((ref) => {
      if (!ref.referrerId) return;
      const cur = map.get(ref.referrerId) || { count: 0, owed: 0, paid: 0 };
      cur.count++;
      if (ref.commissionStatus === 'pending') cur.owed += ref.commissionAmount;
      if (ref.commissionStatus === 'paid') cur.paid += ref.commissionAmount;
      map.set(ref.referrerId, cur);
    });
    return map;
  }, [referrals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 tracking-tight">Referrers</h2>
          <p className="text-stone-500 mt-1.5">The professionals who send you client referrals.</p>
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20">
          <Plus className="w-4 h-4" /> New Referrer
        </button>
      </div>

      <div className="relative">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search referrers by name, company, email..." className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center shadow-sm">
          <Users className="w-14 h-14 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 font-medium">{referrers.length === 0 ? 'No referrers yet' : 'No referrers match your search'}</p>
          <p className="text-stone-400 text-sm mt-1">{referrers.length === 0 ? 'Add the professionals who refer clients to you.' : 'Try a different search.'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            const stats = statsByReferrer.get(r.id) || { count: 0, owed: 0, paid: 0 };
            return (
              <button key={r.id} onClick={() => onSelect(r)} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm text-left hover:border-teal-300 hover:shadow-lg hover:shadow-teal-600/5 transition-all group animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-stone-800 truncate">{r.name}</h3>
                    {r.company && <p className="text-sm text-stone-500 flex items-center gap-1 truncate"><Building2 className="w-3 h-3 flex-shrink-0" /> {r.company}</p>}
                  </div>
                  <Pencil className="w-4 h-4 text-stone-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                </div>

                <div className="mt-4 space-y-1.5">
                  {r.email && <p className="text-sm text-stone-500 flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" /> {r.email}</p>}
                  {r.phone && <p className="text-sm text-stone-500 flex items-center gap-2 truncate"><Phone className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" /> {r.phone}</p>}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div><p className="text-xs text-stone-400">Referrals</p><p className="text-sm font-semibold text-stone-700">{stats.count}</p></div>
                    {stats.owed > 0 && <div><p className="text-xs text-stone-400">Owed</p><p className="text-sm font-semibold text-amber-600">{formatCurrency(stats.owed)}</p></div>}
                    {stats.paid > 0 && <div><p className="text-xs text-stone-400">Paid</p><p className="text-sm font-semibold text-emerald-600">{formatCurrency(stats.paid)}</p></div>}
                  </div>
                  {r.commissionRate > 0 && <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{r.commissionRate}% rate</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
