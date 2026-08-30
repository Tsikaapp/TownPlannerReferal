import { Inbox } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ReferralDetail from '@/components/ReferralDetail';
import ReferralList from '@/components/ReferralList';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { fetchReceivedReferrals, updateReferral } from '@/db/referrals';
import { readableError } from '@/lib/supabaseClient';
import type { Referral, ReferralStatus } from '@/lib/types';

export default function ReferralsReceived() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Referral | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchReceivedReferrals(userId)
      .then((rows) => { if (!cancelled) setReferrals(rows); })
      .catch((err) => { if (!cancelled) setError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const save = useCallback(
    async (id: string, patch: { status: ReferralStatus; notes: string }) => {
      const updated = await updateReferral(id, patch);
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    },
    []
  );

  return (
    <>
      <PageHeader
        title="Referrals received"
        description="Clients other professionals have sent your way. Open one to see the full brief and move it along."
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert tone="error" title="Could not load your referrals">{error}</Alert>
      ) : referrals.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No referrals yet"
          description="When someone refers a client to you, it will appear here. Make sure your directory profile is listed so people can find you."
          action={<Link to="/app/profile" className={buttonStyles('primary', 'md')}>Check my profile</Link>}
        />
      ) : (
        <ReferralList
          referrals={referrals}
          onSelect={setSelected}
          personColumn="Referred by"
          personOf={(r) => [r.referrerName, r.referrerCompany].filter(Boolean).join(' · ')}
        />
      )}

      {selected && (
        <ReferralDetail
          referral={selected}
          open
          onClose={() => setSelected(null)}
          canEdit
          onSave={(patch) => save(selected.id, patch)}
        />
      )}
    </>
  );
}
