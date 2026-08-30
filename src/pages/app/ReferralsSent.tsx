import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import ReferralDetail from '@/components/ReferralDetail';
import ReferralList from '@/components/ReferralList';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { fetchDirectory } from '@/db/profiles';
import { fetchSentReferrals } from '@/db/referrals';
import { readableError } from '@/lib/supabaseClient';
import type { Profile, Referral } from '@/lib/types';

export default function ReferralsSent() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [names, setNames] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Referral | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.all([
      fetchSentReferrals(userId),
      // Resolve recipient ids to names for the list column.
      fetchDirectory({ search: '', profession: '', province: '' }, true).catch(() => [] as Profile[]),
    ])
      .then(([rows, pros]) => {
        if (cancelled) return;
        setReferrals(rows);
        setNames(new Map(pros.map((p) => [p.id, p])));
      })
      .catch((err) => { if (!cancelled) setError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  return (
    <>
      <PageHeader
        title="Referrals sent"
        description="Everything you have passed on, including anything you submitted before you had an account."
        action={<Link to="/refer" className={buttonStyles('primary', 'md')}>Refer a client</Link>}
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert tone="error" title="Could not load your referrals">{error}</Alert>
      ) : referrals.length === 0 ? (
        <EmptyState
          icon={Send}
          title="You have not referred anyone yet"
          description="Send a client to a specialist and it will show up here with its status."
          action={<Link to="/refer" className={buttonStyles('primary', 'md')}>Refer a client</Link>}
        />
      ) : (
        <ReferralList
          referrals={referrals}
          onSelect={setSelected}
          personColumn="Referred to"
          personOf={(r) => (r.recipientId ? names.get(r.recipientId)?.fullName ?? 'A professional' : 'Open referral')}
        />
      )}

      {selected && (
        <ReferralDetail
          referral={selected}
          open
          onClose={() => setSelected(null)}
          /* The sender can watch a referral but not drive it — that is the
             recipient's job. */
          canEdit={false}
          onSave={async () => {}}
        />
      )}
    </>
  );
}
