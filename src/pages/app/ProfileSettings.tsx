import { ExternalLink, Eye, EyeOff, Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { updateProfile } from '@/db/profiles';
import { PROFESSIONS, PROVINCES, SERVICES } from '@/lib/constants';
import { readableError } from '@/lib/supabaseClient';

export default function ProfileSettings() {
  const { profile, setProfile } = useAuth();
  const isProfessional = profile?.accountType !== 'client';

  const [form, setForm] = useState({
    fullName: '', company: '', profession: '', email: '', phone: '', website: '',
    city: '', province: '', bio: '', registrationNo: '', yearsExperience: '',
  });
  const [services, setServices] = useState<string[]>([]);
  const [isListed, setIsListed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName,
      company: profile.company,
      profession: profile.profession,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      city: profile.city,
      province: profile.province,
      bio: profile.bio,
      registrationNo: profile.registrationNo,
      yearsExperience: profile.yearsExperience?.toString() ?? '',
    });
    setServices(profile.services);
    setIsListed(profile.isListed);
  }, [profile]);

  if (!profile) return <Spinner label="Loading your profile…" />;

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => { setForm((f) => ({ ...f, [key]: e.target.value })); setSaved(false); };

  const toggleService = (s: string) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    setSaved(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const years = form.yearsExperience.trim();
      const updated = await updateProfile(profile.id, {
        ...form,
        yearsExperience: years === '' ? null : Number(years),
        services,
        isListed,
      });
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(readableError(err, 'We could not save your profile.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isProfessional ? 'My profile' : 'My account'}
        description={
          isProfessional
            ? 'This is what clients see in the directory. Your email and phone are only shown to signed-in members.'
            : 'Your account details.'
        }
        action={
          isProfessional && profile.isListed ? (
            <Link to={`/directory/${profile.id}`} className={buttonStyles('outline', 'md')}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View public profile
            </Link>
          ) : undefined
        }
      />

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        {saved && <Alert tone="success">Your profile has been saved.</Alert>}

        <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={form.fullName || 'You'} seed={profile.id} size="lg" />
            <div>
              <p className="font-semibold text-forest-900">{form.fullName || 'Your name'}</p>
              <p className="text-sm text-stone-500">
                {isProfessional ? form.profession || 'Professional' : 'Client account'}
                {profile.isAdmin && ' · Administrator'}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Full name" required value={form.fullName} onChange={set('fullName')} />
            {isProfessional && (
              <SelectField label="Profession" options={PROFESSIONS} value={form.profession} onChange={set('profession')} placeholder="Choose your discipline" />
            )}
            {isProfessional && (
              <TextField label="Practice or company" value={form.company} onChange={set('company')} />
            )}
            <TextField label="Email address" type="email" value={form.email} onChange={set('email')} hint="Shown to signed-in members only." />
            <TextField label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
            {isProfessional && (
              <TextField label="Website" value={form.website} onChange={set('website')} placeholder="www.yourpractice.co.za" />
            )}
            <TextField label="City or town" value={form.city} onChange={set('city')} />
            <SelectField label="Province" options={PROVINCES} value={form.province} onChange={set('province')} placeholder="Choose a province" />
          </div>
        </section>

        {isProfessional && (
          <>
            <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
              <h2 className="text-lg font-semibold text-forest-900">Your practice</h2>
              <div className="mt-5 space-y-5">
                <TextAreaField
                  label="About you"
                  rows={5}
                  value={form.bio}
                  onChange={set('bio')}
                  hint="A short description of your practice and the work you take on. This is the first thing a client reads."
                  placeholder="I have practised in the Tshwane and Johannesburg municipal areas since 2011, focusing on township establishment and rezoning applications for mid-sized residential developments…"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Registration number"
                    value={form.registrationNo}
                    onChange={set('registrationNo')}
                    placeholder="SACPLAN A/1234/2011"
                    hint="Optional. Shown as a badge on your profile."
                  />
                  <TextField
                    label="Years of experience"
                    type="number"
                    min={0}
                    max={70}
                    value={form.yearsExperience}
                    onChange={set('yearsExperience')}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
              <h2 className="text-lg font-semibold text-forest-900">Services you offer</h2>
              <p className="mt-1.5 text-sm text-stone-500">
                Pick everything that applies. These show as a checklist on your profile.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {SERVICES.map((s) => {
                  const on = services.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      aria-pressed={on}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        on
                          ? 'border-forest-600 bg-forest-700 text-white'
                          : 'border-stone-300 bg-white text-stone-600 hover:border-forest-400 hover:text-forest-800'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-card">
              <h2 className="text-lg font-semibold text-forest-900">Directory listing</h2>
              <button
                type="button"
                onClick={() => { setIsListed((v) => !v); setSaved(false); }}
                aria-pressed={isListed}
                className={`mt-4 flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-all ${
                  isListed ? 'border-forest-300 bg-forest-50' : 'border-stone-300 bg-stone-50'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isListed ? 'bg-forest-700 text-white' : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {isListed ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-forest-900">
                    {isListed ? 'Listed in the directory' : 'Hidden from the directory'}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-600">
                    {isListed
                      ? 'Clients can find you and send enquiries and referrals.'
                      : 'Nobody can find or contact you. Existing referrals are unaffected.'}
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    isListed ? 'bg-forest-700' : 'bg-stone-300'
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      isListed ? 'left-[1.375rem]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </section>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={busy} icon={<Save className="h-4 w-4" />}>
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
