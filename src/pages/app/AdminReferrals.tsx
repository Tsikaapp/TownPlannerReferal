import { ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ReferralDetail from '@/components/ReferralDetail';
import ReferralList from '@/components/ReferralList';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { fetchAllMembers } from '@/db/profiles';
import { deleteReferral, fetchAllReferrals, updateReferral } from '@/db/referrals';
import { readableError } from '@/lib/supabaseClient';
import type { Profile, Referral, ReferralStatus } from '@/lib/types';

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Referral | null>(null);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAllReferrals(), fetchAllMembers()])
      .then(([rows, people]) => {
        if (cancelled) return;
        setReferrals(rows);
        setMembers(people.filter((p) => p.accountType === 'professional'));
      })
      .catch((err) => { if (!cancelled) setError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const unassigned = referrals.filter((r) => !r.recipientId).length;
  const shown = onlyUnassigned ? referrals.filter((r) => !r.recipientId) : referrals;

  const save = async (
    id: string,
    patch: { status: ReferralStatus; notes: string; recipientId?: string | null }
  ) => {
    const updated = await updateReferral(id, patch);
    setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const remove = async (id: string) => {
    await deleteReferral(id);
    setReferrals((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <PageHeader
        title="All referrals"
        description="Every referral on PlanLink, including those nobody has been assigned to yet."
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert tone="error" title="Could not load referrals">{error}</Alert>
      ) : referrals.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No referrals yet" description="Referrals submitted through the site will appear here." />
      ) : (
        <>
          {unassigned > 0 && (
            <Alert tone="info" title={`${unassigned} referral${unassigned === 1 ? '' : 's'} awaiting assignment`} className="mb-5">
              These were submitted without a chosen professional. Open one and assign it
              to route it to someone.{' '}
              <button
                type="button"
                onClick={() => setOnlyUnassigned((v) => !v)}
                className="font-medium underline underline-offset-4"
              >
                {onlyUnassigned ? 'Show all referrals' : 'Show only these'}
              </button>
            </Alert>
          )}

          <ReferralList
            referrals={shown}
            onSelect={setSelected}
            personColumn="Assigned to"
            personOf={(r) => (r.recipientId ? byId.get(r.recipientId)?.fullName ?? 'Unknown' : 'Unassigned')}
          />
        </>
      )}

      {selected && (
        <ReferralDetail
          referral={selected}
          open
          onClose={() => setSelected(null)}
          canEdit
          canReassign
          canDelete
          professionals={members}
          onSave={(patch) => save(selected.id, patch)}
          onDelete={() => remove(selected.id)}
        />
      )}
    </>
  );
}
