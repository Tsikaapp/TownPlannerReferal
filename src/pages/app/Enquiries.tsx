import { Building2, Mail, MapPin, MessageSquare, Phone, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import Alert from '@/components/ui/Alert';
import { EnquiryStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SelectField } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import {
  fetchReceivedEnquiries, fetchSentEnquiries, updateEnquiryStatus,
} from '@/db/enquiries';
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, formatRelative } from '@/lib/format';
import { readableError } from '@/lib/supabaseClient';
import type { Enquiry, EnquiryStatus } from '@/lib/types';

export default function Enquiries() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const isProfessional = profile?.accountType !== 'client';

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [status, setStatus] = useState<EnquiryStatus>('new');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = isProfessional ? fetchReceivedEnquiries : fetchSentEnquiries;
    load(userId)
      .then((rows) => { if (!cancelled) setEnquiries(rows); })
      .catch((err) => { if (!cancelled) setError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, isProfessional]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enquiries;
    return enquiries.filter((e) =>
      [e.clientName, e.reference, e.projectType, e.projectAddress, e.message]
        .join(' ').toLowerCase().includes(q)
    );
  }, [enquiries, query]);

  const open = (e: Enquiry) => { setSelected(e); setStatus(e.status); };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateEnquiryStatus(selected.id, status);
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelected(null);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isProfessional ? 'Client enquiries' : 'My enquiries'}
        description={
          isProfessional
            ? 'People who contacted you directly from your directory profile.'
            : 'Professionals you have contacted through the directory.'
        }
        action={
          !isProfessional && (
            <Link to="/directory" className={buttonStyles('primary', 'md')}>Find a professional</Link>
          )
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert tone="error" title="Could not load enquiries">{error}</Alert>
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={isProfessional ? 'No enquiries yet' : 'You have not contacted anyone yet'}
          description={
            isProfessional
              ? 'When a client contacts you from your profile, their message lands here.'
              : 'Browse the directory and message a professional about your project.'
          }
          action={
            <Link to={isProfessional ? '/app/profile' : '/directory'} className={buttonStyles('primary', 'md')}>
              {isProfessional ? 'Check my profile' : 'Browse the directory'}
            </Link>
          }
        />
      ) : (
        <>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search enquiries"
              aria-label="Search enquiries"
              className="field-input pl-10"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 py-14 text-center text-sm text-stone-500">
              Nothing matches that search.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {filtered.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => open(e)}
                    className="flex h-full w-full flex-col rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-card transition-all hover:border-forest-300 hover:shadow-lift"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-forest-900">{e.clientName}</p>
                        <p className="font-mono text-xs text-stone-400">{e.reference}</p>
                      </div>
                      <EnquiryStatusBadge status={e.status} />
                    </div>
                    {e.projectType && <p className="mt-3 text-sm text-stone-600">{e.projectType}</p>}
                    {e.message && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">{e.message}</p>
                    )}
                    <p className="mt-auto pt-4 text-xs text-stone-400">{formatRelative(e.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.clientName}
          subtitle={`Reference ${selected.reference} · ${formatDateTime(selected.createdAt)}`}
          footer={
            isProfessional ? (
              <>
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button onClick={save} loading={saving} disabled={status === selected.status}>
                  Save status
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            )
          }
        >
          <div className="space-y-6">
            <EnquiryStatusBadge status={selected.status} />

            <dl className="grid gap-5 sm:grid-cols-2">
              {[
                { icon: User, label: 'Name', value: selected.clientName },
                { icon: Mail, label: 'Email', value: selected.clientEmail, href: `mailto:${selected.clientEmail}` },
                { icon: Phone, label: 'Phone', value: selected.clientPhone, href: `tel:${selected.clientPhone}` },
                { icon: MapPin, label: 'Site address', value: selected.projectAddress },
                { icon: Building2, label: 'Type of work', value: selected.projectType },
                { icon: MessageSquare, label: 'Timing', value: selected.timeline },
              ].map(({ icon: Icon, label, value, href }) =>
                value ? (
                  <div key={label}>
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
                ) : null
              )}
            </dl>

            {selected.message && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Message</p>
                <p className="mt-2 whitespace-pre-line rounded-xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                  {selected.message}
                </p>
              </div>
            )}

            {isProfessional && (
              <div className="border-t border-stone-200 pt-6">
                <SelectField
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
                  placeholder="Choose a status"
                  options={ENQUIRY_STATUSES.map((s) => ({ value: s, label: ENQUIRY_STATUS_LABELS[s] }))}
                  hint="Replying happens over email or phone — this just tracks where the enquiry stands."
                />
                <a href={`mailto:${selected.clientEmail}`} className={buttonStyles('outline', 'md', 'mt-4 w-full')}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Reply by email
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
