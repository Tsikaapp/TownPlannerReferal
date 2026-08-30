import {
  ArrowLeft, BadgeCheck, Building2, CalendarClock, CheckCircle2, Globe, Lock,
  Mail, MapPin, Phone, Send,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Alert from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { submitEnquiry } from '@/db/enquiries';
import { fetchProfessional } from '@/db/profiles';
import { PROJECT_TYPES, TIMELINES } from '@/lib/constants';
import { readableError } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/types';

export default function ProfessionalProfile() {
  const { id = '' } = useParams();
  const { session, profile: me } = useAuth();

  const [pro, setPro] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    projectAddress: '', projectType: '', message: '', timeline: '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProfessional(id, Boolean(session))
      .then((p) => { if (!cancelled) setPro(p); })
      .catch((err) => { if (!cancelled) setLoadError(readableError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, session]);

  // Prefill the enquiry from the signed-in account.
  useEffect(() => {
    if (!me) return;
    setForm((f) => ({
      ...f,
      clientName: f.clientName || me.fullName,
      clientEmail: f.clientEmail || me.email,
      clientPhone: f.clientPhone || me.phone,
    }));
  }, [me]);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setSending(true);
    try {
      const ref = await submitEnquiry({ professionalId: id, ...form });
      setReference(ref);
    } catch (err) {
      setSendError(readableError(err, 'We could not send your enquiry.'));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-20"><Spinner label="Loading profile…" /></div>;

  if (loadError || !pro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-forest-900">Profile not available</h1>
        <p className="mt-3 text-stone-600">
          {loadError ?? 'This professional is not listed in the directory.'}
        </p>
        <Link to="/directory" className={buttonStyles('primary', 'md', 'mt-8')}>
          Back to the directory
        </Link>
      </div>
    );
  }

  const place = [pro.city, pro.province].filter(Boolean).join(', ');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        to="/directory"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-forest-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All professionals
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Profile */}
        <div>
          <header className="rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar name={pro.fullName} seed={pro.id} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-forest-900 sm:text-3xl">{pro.fullName}</h1>
                {pro.company && (
                  <p className="mt-1 flex items-center gap-2 text-stone-600">
                    <Building2 className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    {pro.company}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {pro.profession && (
                    <Badge className="bg-forest-50 text-forest-700 ring-forest-200">{pro.profession}</Badge>
                  )}
                  {pro.registrationNo && (
                    <Badge className="bg-gold-50 text-gold-800 ring-gold-200">
                      <BadgeCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      {pro.registrationNo}
                    </Badge>
                  )}
                  {pro.yearsExperience ? (
                    <Badge className="bg-stone-100 text-stone-600 ring-stone-200">
                      {pro.yearsExperience} years' experience
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <dl className="mt-8 grid gap-5 border-t border-stone-100 pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Based in</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm text-forest-900">
                  <MapPin className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                  {place || 'Not given'}
                </dd>
              </div>

              {pro.website && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Website</dt>
                  <dd className="mt-1.5 flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    <a
                      href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="truncate text-forest-700 underline underline-offset-4 hover:text-forest-800"
                    >
                      {pro.website.replace(/^https?:\/\//, '')}
                    </a>
                  </dd>
                </div>
              )}

              {/* Contact detail is withheld from logged-out visitors by a
                  column-level grant, so mirror that in the UI. */}
              {session ? (
                <>
                  {pro.email && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Email</dt>
                      <dd className="mt-1.5 flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                        <a href={`mailto:${pro.email}`} className="truncate text-forest-700 underline underline-offset-4">{pro.email}</a>
                      </dd>
                    </div>
                  )}
                  {pro.phone && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">Phone</dt>
                      <dd className="mt-1.5 flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                        <a href={`tel:${pro.phone}`} className="text-forest-700 underline underline-offset-4">{pro.phone}</a>
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                <div className="sm:col-span-2">
                  <div className="flex items-start gap-3 rounded-xl bg-stone-100 px-4 py-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    <p className="text-sm text-stone-600">
                      Direct contact details are visible to signed-in members.{' '}
                      <Link to="/sign-in" className="font-medium text-forest-700 underline underline-offset-4">Sign in</Link>{' '}
                      to see them, or send an enquiry using the form.
                    </p>
                  </div>
                </div>
              )}
            </dl>
          </header>

          {pro.bio && (
            <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
              <h2 className="text-lg font-semibold text-forest-900">About</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-600">{pro.bio}</p>
            </section>
          )}

          {pro.services.length > 0 && (
            <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
              <h2 className="text-lg font-semibold text-forest-900">Services</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {pro.services.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Enquiry */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
            {reference ? (
              <>
                <Alert tone="success" title="Enquiry sent">
                  {pro.fullName} has your details and will be in touch. Your reference is{' '}
                  <strong className="font-mono">{reference}</strong>.
                </Alert>
                <p className="mt-5 text-sm text-stone-600">
                  {session
                    ? 'You can follow this enquiry from your dashboard.'
                    : 'Create an account with the same email address and this enquiry will appear in your history.'}
                </p>
                <Link to={session ? '/app/enquiries' : '/join'} className={buttonStyles('primary', 'md', 'mt-5 w-full')}>
                  {session ? 'View my enquiries' : 'Create an account'}
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-forest-900">Contact {pro.fullName.split(' ')[0]}</h2>
                <p className="mt-1.5 text-sm text-stone-500">
                  Tell them about your project. No account needed.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                  {sendError && <Alert tone="error">{sendError}</Alert>}
                  <TextField label="Your name" required value={form.clientName} onChange={set('clientName')} autoComplete="name" />
                  <TextField label="Email" type="email" required value={form.clientEmail} onChange={set('clientEmail')} autoComplete="email" />
                  <TextField label="Phone" type="tel" value={form.clientPhone} onChange={set('clientPhone')} autoComplete="tel" />
                  <TextField label="Property or site address" value={form.projectAddress} onChange={set('projectAddress')} />
                  <SelectField label="What do you need?" options={PROJECT_TYPES} value={form.projectType} onChange={set('projectType')} placeholder="Choose a type" />
                  <SelectField label="Timing" options={TIMELINES} value={form.timeline} onChange={set('timeline')} placeholder="When would you start?" />
                  <TextAreaField label="Message" rows={4} value={form.message} onChange={set('message')} placeholder="A short description of the project and what you need help with." />
                  <Button type="submit" size="lg" loading={sending} className="w-full" icon={<Send className="h-4 w-4" />}>
                    Send enquiry
                  </Button>
                </form>
              </>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-stone-200 bg-forest-50 p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-forest-900">
              <CalendarClock className="h-4 w-4 text-forest-600" aria-hidden="true" />
              Are you a professional?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-800/80">
              Refer one of your own clients to {pro.fullName.split(' ')[0]} instead.
            </p>
            <Link to={`/refer?to=${pro.id}`} className={buttonStyles('outline', 'sm', 'mt-4 w-full')}>
              Refer a client to them
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
