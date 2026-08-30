import { ArrowRight, CheckCircle2, Info, Send, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import ProfessionalSelect from '@/components/ui/ProfessionalSelect';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { fetchDirectory } from '@/db/profiles';
import { submitReferral } from '@/db/referrals';
import { PROJECT_TYPES, TIMELINES } from '@/lib/constants';
import { readableError } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/types';

const BLANK = {
  referrerName: '', referrerEmail: '', referrerPhone: '', referrerCompany: '',
  clientName: '', clientEmail: '', clientPhone: '',
  projectAddress: '', projectType: '', projectDescription: '', timeline: '',
};

export default function ReferClient() {
  const [params] = useSearchParams();
  const { session, profile } = useAuth();

  const [recipientId, setRecipientId] = useState(params.get('to') ?? '');
  const [professionals, setProfessionals] = useState<Profile[]>([]);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDirectory({ search: '', profession: '', province: '' }, Boolean(session))
      .then((rows) => { if (!cancelled) setProfessionals(rows); })
      .catch(() => { /* The recipient stays optional if the list will not load. */ });
    return () => { cancelled = true; };
  }, [session]);

  // Prefill "your details" for a signed-in member.
  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      referrerName: f.referrerName || profile.fullName,
      referrerEmail: f.referrerEmail || profile.email,
      referrerPhone: f.referrerPhone || profile.phone,
      referrerCompany: f.referrerCompany || profile.company,
    }));
  }, [profile]);

  const recipient = useMemo(
    () => professionals.find((p) => p.id === recipientId) ?? null,
    [professionals, recipientId]
  );

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const ref = await submitReferral({ ...form, recipientId: recipientId || null });
      setReference(ref);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(readableError(err, 'We could not send that referral.'));
    } finally {
      setBusy(false);
    }
  };

  if (reference) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-50 ring-1 ring-inset ring-forest-100">
          <CheckCircle2 className="h-8 w-8 text-forest-600" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-forest-900">Referral sent</h1>
        <p className="mt-4 text-lg text-stone-600">
          Thank you. {recipient ? `${recipient.fullName} has the details` : 'The PlanLink team will match this to the right professional'} and
          will follow up with {form.clientName || 'your client'} directly.
        </p>
        <p className="mt-6 inline-block rounded-xl bg-stone-100 px-5 py-3 text-sm text-stone-600">
          Your reference is <strong className="font-mono text-forest-900">{reference}</strong>
        </p>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-8 text-left shadow-card">
          {session ? (
            <>
              <h2 className="text-lg font-semibold text-forest-900">Track it from your dashboard</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                This referral is already in your history, along with its status.
              </p>
              <Link to="/app/sent" className={buttonStyles('primary', 'md', 'mt-5')}>
                View my referrals
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-forest-900">Want to follow this up?</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Create an account with <strong>{form.referrerEmail}</strong> and this
                referral — plus any other you have sent from that address — will be
                waiting in your history.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/join" className={buttonStyles('primary', 'md')}>
                  Create an account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => { setReference(null); setForm(BLANK); }}
                  className={buttonStyles('outline', 'md')}
                >
                  Refer someone else
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-bold text-forest-900 sm:text-4xl">Refer a client</h1>
      <p className="mt-3 text-lg text-stone-600">
        Pass a client on to the right specialist. You do not need an account —
        sign in later with the same email address to see what happened.
      </p>

      {recipient && (
        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-forest-200 bg-forest-50 p-5">
          <Avatar name={recipient.fullName} seed={recipient.id} size="md" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-600">Referring to</p>
            <p className="truncate font-semibold text-forest-900">{recipient.fullName}</p>
            <p className="truncate text-sm text-forest-800/70">
              {[recipient.profession, recipient.company].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-10 space-y-10" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        <fieldset className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
          <legend className="px-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">
            Who it goes to
          </legend>
          <div className="mt-4">
            <ProfessionalSelect
              label="Professional"
              value={recipientId}
              onSelect={(id) => setRecipientId(id ?? '')}
              professionals={professionals}
              placeholder="Open referral — match me with someone"
              hint="Leave this open and an administrator will route it to a suitable professional."
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
          <legend className="px-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">
            Your details
          </legend>
          {!session && (
            <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
              Use the email address you would sign up with — that is how we link this
              referral to your account later.
            </p>
          )}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <TextField label="Your name" required value={form.referrerName} onChange={set('referrerName')} autoComplete="name" />
            <TextField label="Your practice" value={form.referrerCompany} onChange={set('referrerCompany')} autoComplete="organization" />
            <TextField label="Your email" type="email" required value={form.referrerEmail} onChange={set('referrerEmail')} autoComplete="email" />
            <TextField label="Your phone" type="tel" value={form.referrerPhone} onChange={set('referrerPhone')} autoComplete="tel" />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
          <legend className="px-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">
            The client
          </legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <TextField label="Client name" required value={form.clientName} onChange={set('clientName')} />
            <TextField label="Client phone" type="tel" value={form.clientPhone} onChange={set('clientPhone')} />
            <div className="sm:col-span-2">
              <TextField label="Client email" type="email" value={form.clientEmail} onChange={set('clientEmail')} />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
          <legend className="px-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">
            The project
          </legend>
          <div className="mt-5 space-y-5">
            <TextField label="Site or property address" value={form.projectAddress} onChange={set('projectAddress')} placeholder="Erf 1234, Silver Lakes, Pretoria" />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Type of work" options={PROJECT_TYPES} value={form.projectType} onChange={set('projectType')} placeholder="Choose a type" />
              <SelectField label="Timing" options={TIMELINES} value={form.timeline} onChange={set('timeline')} placeholder="When would it start?" />
            </div>
            <TextAreaField
              label="What does the client need?"
              rows={5}
              value={form.projectDescription}
              onChange={set('projectDescription')}
              placeholder="Background, what has been done so far, and anything the professional should know before making contact."
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <UserCheck className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
            Only the professional you choose can see these details.
          </p>
          <Button type="submit" size="lg" loading={busy} icon={<Send className="h-4 w-4" />}>
            Send referral
          </Button>
        </div>
      </form>
    </div>
  );
}
