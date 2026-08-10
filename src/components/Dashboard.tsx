import { useMemo } from 'react';
import { FolderInput, TrendingUp, DollarSign, Clock, ArrowRight, Users, AlertCircle } from 'lucide-react';
import { Referral, Referrer, STATUS_LABELS, STATUS_COLORS } from '../types';
import { formatCurrency, formatDate, formatRelativeDate } from '../format';

interface Props {
  referrals: Referral[];
  referrers: Referrer[];
  onNavigate: (page: 'dashboard' | 'referrals' | 'referrers') => void;
  onSelectReferral: (referral: Referral) => void;
}

export default function Dashboard({ referrals, referrers, onNavigate, onSelectReferral }: Props) {
  const stats = useMemo(() => {
    const active = referrals.filter((r) => r.status === 'active' || r.status === 'consultation').length;
    const newCount = referrals.filter((r) => r.status === 'new').length;
    const commissionOwed = referrals.filter((r) => r.commissionStatus === 'pending').reduce((sum, r) => sum + r.commissionAmount, 0);
    const commissionPaid = referrals.filter((r) => r.commissionStatus === 'paid').reduce((sum, r) => sum + r.commissionAmount, 0);
    return { active, newCount, commissionOwed, commissionPaid };
  }, [referrals]);

  const recentReferrals = useMemo(() => [...referrals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), [referrals]);

  const referralMap = useMemo(() => { const m = new Map<string, Referrer>(); referrers.forEach((r) => m.set(r.id, r)); return m; }, [referrers]);

  const referrerStats = useMemo(() => {
    const map = new Map<string, { referrer: Referrer; count: number }>();
    referrers.forEach((r) => map.set(r.id, { referrer: r, count: 0 }));
    referrals.forEach((ref) => { if (ref.referrerId && map.has(ref.referrerId)) map.get(ref.referrerId)!.count++; });
    return [...map.values()].filter((s) => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [referrals, referrers]);

  const followUps = useMemo(() => referrals.filter((r) => r.status === 'on_hold' || r.status === 'not_proceeding').slice(0, 5), [referrals]);

  const statCards = [
    { label: 'Total Referrals', value: referrals.length.toString(), sub: stats.newCount > 0 ? `${stats.newCount} new` : undefined, icon: FolderInput, bg: 'from-teal-500 to-teal-600', iconBg: 'bg-teal-100 text-teal-600' },
    { label: 'Active Projects', value: stats.active.toString(), sub: 'In progress', icon: TrendingUp, bg: 'from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-100 text-emerald-600' },
    { label: 'Commission Owed', value: formatCurrency(stats.commissionOwed), sub: 'Outstanding', icon: Clock, bg: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-100 text-amber-600' },
    { label: 'Commission Paid', value: formatCurrency(stats.commissionPaid), sub: 'Settled', icon: DollarSign, bg: 'from-green-500 to-green-600', iconBg: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-stone-800 tracking-tight">Dashboard</h2>
        <p className="text-stone-500 mt-1.5">Track every client referral and commission in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-stone-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-stone-800 mt-2 truncate">{stat.value}</p>
                  {stat.sub && <p className="text-xs text-stone-400 mt-0.5">{stat.sub}</p>}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent referrals */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h3 className="font-semibold text-stone-800">Recent Referrals</h3>
            <button onClick={() => onNavigate('referrals')} className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentReferrals.length === 0 ? (
            <div className="p-14 text-center">
              <FolderInput className="w-12 h-12 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">No referrals yet. Click "New Referral" to add one.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentReferrals.map((ref) => {
                const referrer = ref.referrerId ? referralMap.get(ref.referrerId) : null;
                return (
                  <button key={ref.id} onClick={() => onSelectReferral(ref)} className="w-full flex items-center gap-4 p-4 hover:bg-stone-50/80 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                      {ref.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{ref.clientName}</p>
                      <p className="text-sm text-stone-500 truncate">{referrer ? referrer.name : 'No referrer recorded'}{ref.projectType && ` · ${ref.projectType}`}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[ref.status]}`}>{STATUS_LABELS[ref.status]}</span>
                      <span className="text-xs text-stone-400">{formatRelativeDate(ref.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Top referrers */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h3 className="font-semibold text-stone-800">Top Referrers</h3>
            <button onClick={() => onNavigate('referrers')} className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 transition-colors">
              All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {referrerStats.length === 0 ? (
            <div className="p-14 text-center">
              <Users className="w-12 h-12 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">No referrers yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {referrerStats.map(({ referrer, count }, i) => (
                <div key={referrer.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {referrer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 truncate">{referrer.name}</p>
                    <p className="text-xs text-stone-400 truncate">{referrer.company || 'No company'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {i === 0 && <span className="text-xs text-amber-500 font-bold">#1</span>}
                    <span className="text-sm font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Follow-up reminders */}
      {followUps.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 animate-slide-up">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Follow-up Reminders
          </h3>
          <p className="text-sm text-amber-700/80 mt-1 mb-3">These clients were referred but aren't actively proceeding. Check in to see if anything has changed.</p>
          <div className="space-y-2">
            {followUps.map((ref) => {
              const referrer = ref.referrerId ? referralMap.get(ref.referrerId) : null;
              return (
                <button key={ref.id} onClick={() => onSelectReferral(ref)} className="w-full flex items-center justify-between bg-white/80 rounded-xl px-4 py-2.5 border border-amber-200/50 hover:border-amber-300 hover:bg-white transition-all text-left">
                  <div className="min-w-0">
                    <span className="font-medium text-stone-800 text-sm">{ref.clientName}</span>
                    <span className="text-stone-400 text-sm ml-2 hidden sm:inline">· {referrer?.name || 'No referrer'} · Referred {formatDate(ref.referralDate)}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_COLORS[ref.status]}`}>{STATUS_LABELS[ref.status]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
