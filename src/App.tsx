import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, FolderInput, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Referrer, Referral } from './types';
import {
  fetchReferrers,
  fetchReferrals,
  createReferral as dbCreateReferral,
  updateReferral as dbUpdateReferral,
  deleteReferral as dbDeleteReferral,
  createReferrer as dbCreateReferrer,
  updateReferrer as dbUpdateReferrer,
  deleteReferrer as dbDeleteReferrer,
} from './db';
import Dashboard from './components/Dashboard';
import ReferralsView from './components/ReferralsView';
import ReferrersView from './components/ReferrersView';
import ReferralModal from './components/ReferralModal';
import ReferrerModal from './components/ReferrerModal';

type Page = 'dashboard' | 'referrals' | 'referrers';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referrerModalOpen, setReferrerModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [editingReferrer, setEditingReferrer] = useState<Referrer | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [refData, referrerData] = await Promise.all([
          fetchReferrals(),
          fetchReferrers(),
        ]);
        if (cancelled) return;
        setReferrals(refData);
        setReferrers(referrerData);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNewReferral = () => {
    setEditingReferral(null);
    setReferralModalOpen(true);
  };
  const openEditReferral = (referral: Referral) => {
    setEditingReferral(referral);
    setReferralModalOpen(true);
  };
  const openNewReferrer = () => {
    setEditingReferrer(null);
    setReferrerModalOpen(true);
  };
  const openEditReferrer = (referrer: Referrer) => {
    setEditingReferrer(referrer);
    setReferrerModalOpen(true);
  };

  const handleSaveReferral = useCallback(
    async (data: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        if (editingReferral) {
          const updated = await dbUpdateReferral(editingReferral.id, data);
          setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } else {
          const created = await dbCreateReferral(data);
          setReferrals((prev) => [created, ...prev]);
        }
        setReferralModalOpen(false);
        setEditingReferral(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save referral');
      }
    },
    [editingReferral]
  );

  const handleDeleteReferral = useCallback(async (id: string) => {
    try {
      await dbDeleteReferral(id);
      setReferrals((prev) => prev.filter((r) => r.id !== id));
      setReferralModalOpen(false);
      setEditingReferral(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete referral');
    }
  }, []);

  const handleSaveReferrer = useCallback(
    async (data: Omit<Referrer, 'id' | 'createdAt'>) => {
      try {
        if (editingReferrer) {
          const updated = await dbUpdateReferrer(editingReferrer.id, data);
          setReferrers((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } else {
          const created = await dbCreateReferrer(data);
          setReferrers((prev) => [...prev, created]);
        }
        setReferrerModalOpen(false);
        setEditingReferrer(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save referrer');
      }
    },
    [editingReferrer]
  );

  const handleDeleteReferrer = useCallback(async (id: string) => {
    try {
      await dbDeleteReferrer(id);
      setReferrers((prev) => prev.filter((r) => r.id !== id));
      setReferrerModalOpen(false);
      setEditingReferrer(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete referrer');
    }
  }, []);

  const navItems: { key: Page; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'referrals', label: 'Referrals', icon: FolderInput },
    { key: 'referrers', label: 'Referrers', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-teal-600 mx-auto mb-3 animate-spin" />
          <p className="text-stone-500 text-sm">Loading your referrals...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-stone-800 font-semibold">Something went wrong</p>
          <p className="text-stone-500 text-sm mt-1">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/20">
                <FolderInput className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-800 leading-tight tracking-tight">
                  ReferralTrack
                </h1>
                <p className="text-xs text-stone-400 leading-tight hidden sm:block">
                  Client referral & commission tracking
                </p>
              </div>
            </div>
            <button
              onClick={openNewReferral}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all shadow-md shadow-teal-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Referral</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
          <nav className="flex gap-1 -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    active
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div key={page} className="animate-fade-in">
          {page === 'dashboard' && (
            <Dashboard
              referrals={referrals}
              referrers={referrers}
              onNavigate={setPage}
              onSelectReferral={openEditReferral}
            />
          )}
          {page === 'referrals' && (
            <ReferralsView
              referrals={referrals}
              referrers={referrers}
              onSelect={openEditReferral}
              onNew={openNewReferral}
            />
          )}
          {page === 'referrers' && (
            <ReferrersView
              referrers={referrers}
              referrals={referrals}
              onSelect={openEditReferrer}
              onNew={openNewReferrer}
            />
          )}
        </div>
      </main>

      {referralModalOpen && (
        <ReferralModal
          referral={editingReferral}
          referrers={referrers}
          onSave={handleSaveReferral}
          onDelete={handleDeleteReferral}
          onClose={() => {
            setReferralModalOpen(false);
            setEditingReferral(null);
          }}
        />
      )}
      {referrerModalOpen && (
        <ReferrerModal
          referrer={editingReferrer}
          onSave={handleSaveReferrer}
          onDelete={handleDeleteReferrer}
          onClose={() => {
            setReferrerModalOpen(false);
            setEditingReferrer(null);
          }}
        />
      )}
    </div>
  );
}
