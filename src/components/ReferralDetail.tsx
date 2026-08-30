import { Building2, CalendarDays, Mail, MapPin, Phone, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import { ReferralStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SelectField, TextAreaField } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import { REFERRAL_STATUSES, REFERRAL_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { readableError } from '@/lib/supabaseClient';
import type { Profile, Referral, ReferralStatus } from '@/lib/types';

function Detail({ icon: Icon, label, value, href }: {
  icon: typeof User; label: string; value: string; href?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</dt>
      <dd className="mt-1.5 flex items-start gap-2 text-sm text-forest-900">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
        {href ? (
          <a href={href} className="break-all text-forest-700 underline underline-offset-4">{value}</a>
        ) : (
          <span className="break-words">{value}</span>
        )}
      </dd>
    </div>
  );
}

export default function ReferralDetail({
  referral, open, onClose, canEdit, canReassign = false, canDelete = false,
  professionals = [], onSave, onDelete,
}: {
  referral: Referral;
  open: boolean;
  onClose: () => void;
  /** Recipients and admins can move a referral along; senders can only watch. */
  canEdit: boolean;
  canReassign?: boolean;
  canDelete?: boolean;
  professionals?: Profile[];
  onSave: (patch: { status: ReferralStatus; notes: string; recipientId?: string | null }) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [status, setStatus] = useState<ReferralStatus>(referral.status);
  const [notes, setNotes] = useState(referral.notes);
  const [recipientId, setRecipientId] = useState(referral.recipientId ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty =
    status !== referral.status ||
    notes !== referral.notes ||
    (canReassign && (recipientId || null) !== referral.recipientId);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave({
        status,
        notes,
        ...(canReassign ? { recipientId: recipientId || null } : {}),
      });
      onClose();
    } catch (err) {
      setError(readableError(err, 'We could not save those changes.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(readableError(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={referral.clientName}
      subtitle={`Reference ${referral.reference} · sent ${formatDate(referral.createdAt)}`}
      footer={
        canEdit ? (
          <>
            {canDelete && onDelete && (
              <Button
                variant="danger"
                onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}
                icon={<Trash2 className="h-4 w-4" />}
                className="mr-auto"
              >
                {confirmDelete ? 'Confirm delete' : 'Delete'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} loading={busy} disabled={!dirty}>Save changes</Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )
      }
    >
      <div className="space-y-7">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-wrap items-center gap-3">
          <ReferralStatusBadge status={referral.status} />
          {referral.projectType && (
            <span className="text-sm text-stone-500">{referral.projectType}</span>
          )}
        </div>

        <section>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            The client
          </h3>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            <Detail icon={User} label="Name" value={referral.clientName} />
            <Detail icon={Mail} label="Email" value={referral.clientEmail} href={`mailto:${referral.clientEmail}`} />
            <Detail icon={Phone} label="Phone" value={referral.clientPhone} href={`tel:${referral.clientPhone}`} />
            <Detail icon={MapPin} label="Site address" value={referral.projectAddress} />
            <Detail icon={CalendarDays} label="Timing" value={referral.timeline} />
            <Detail icon={CalendarDays} label="Referred on" value={formatDate(referral.referralDate)} />
          </dl>
          {referral.projectDescription && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">What they need</p>
              <p className="mt-2 whitespace-pre-line rounded-xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                {referral.projectDescription}
              </p>
            </div>
          )}
        </section>

        <section className="border-t border-stone-200 pt-6">
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Who referred them
          </h3>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            <Detail icon={User} label="Name" value={referral.referrerName} />
            <Detail icon={Building2} label="Practice" value={referral.referrerCompany} />
            <Detail icon={Mail} label="Email" value={referral.referrerEmail} href={`mailto:${referral.referrerEmail}`} />
            <Detail icon={Phone} label="Phone" value={referral.referrerPhone} href={`tel:${referral.referrerPhone}`} />
          </dl>
          {!referral.referrerId && (
            <p className="mt-4 text-xs text-stone-500">
              Submitted without an account. It will link to their history if they sign
              up with the same email address.
            </p>
          )}
        </section>

        {canEdit ? (
          <section className="space-y-5 border-t border-stone-200 pt-6">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Manage
            </h3>
            {canReassign && (
              <SelectField
                label="Assigned to"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Unassigned"
                options={professionals.map((p) => ({
                  value: p.id,
                  label: [p.fullName, p.profession].filter(Boolean).join(' — '),
                }))}
              />
            )}
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ReferralStatus)}
              placeholder="Choose a status"
              options={REFERRAL_STATUSES.map((s) => ({ value: s, label: REFERRAL_STATUS_LABELS[s] }))}
            />
            <TextAreaField
              label="Private notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              hint="Only you and an administrator can read these."
              rows={4}
            />
          </section>
        ) : referral.notes ? (
          <section className="border-t border-stone-200 pt-6">
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Notes</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-700">{referral.notes}</p>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
