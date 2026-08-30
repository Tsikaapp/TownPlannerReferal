import { Briefcase, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { SelectField, TextField } from '@/components/ui/Field';
import { useAuth } from '@/auth/useAuth';
import { PROFESSIONS, PROVINCES } from '@/lib/constants';
import { readableError } from '@/lib/supabaseClient';
import type { AccountType } from '@/lib/types';

const ACCOUNT_TYPES = [
  {
    value: 'professional' as const,
    icon: Briefcase,
    title: 'I am a professional',
    blurb: 'Town planner, architect, surveyor, engineer or similar. Get listed and trade referrals.',
  },
  {
    value: 'client' as const,
    icon: User,
    title: 'I need a professional',
    blurb: 'Browse the directory, contact specialists, and keep track of your enquiries.',
  },
];

export default function Join() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AccountType>('professional');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', company: '', profession: '',
    phone: '', city: '', province: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError('Choose a password of at least 8 characters.');
    if (form.fullName.trim().length < 2) return setError('Please give your full name.');

    setBusy(true);
    try {
      const signedIn = await signUp({ ...form, accountType });
      if (signedIn) navigate('/app', { replace: true });
      else setPendingConfirmation(true);
    } catch (err) {
      setError(readableError(err, 'We could not create that account.'));
    } finally {
      setBusy(false);
    }
  };

  if (pendingConfirmation) {
    return (
      <AuthLayout title="Confirm your email" subtitle="One more step before you can sign in.">
        <Alert tone="success" title="Account created">
          We have sent a confirmation link to <strong>{form.email}</strong>. Open it to
          activate your account, then sign in.
        </Alert>
        <p className="mt-6 text-sm text-stone-600">
          Any referral you have already submitted with this email address will appear
          in your history automatically.
        </p>
        <Link to="/sign-in" className="mt-6 inline-block font-medium text-forest-700 underline underline-offset-4">
          Go to sign in
        </Link>
      </AuthLayout>
    );
  }

  const isPro = accountType === 'professional';

  return (
    <AuthLayout
      title="Join PlanLink"
      subtitle="Create an account to track referrals and be found by the people who need you."
      footer={
        <>
          Already a member?{' '}
          <Link to="/sign-in" className="font-medium text-forest-700 underline underline-offset-4 hover:text-forest-800">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        <fieldset>
          <legend className="field-label">I am joining as</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACCOUNT_TYPES.map(({ value, icon: Icon, title, blurb }) => {
              const active = accountType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAccountType(value)}
                  aria-pressed={active}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active
                      ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600/20'
                      : 'border-stone-300 bg-white hover:border-stone-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-forest-700' : 'text-stone-400'}`} aria-hidden="true" />
                  <span className="mt-2.5 block text-sm font-semibold text-forest-900">{title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-stone-500">{blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <TextField label="Full name" required autoComplete="name" value={form.fullName} onChange={set('fullName')} placeholder="Thandi Mokoena" />

        {isPro && (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Profession" required options={PROFESSIONS} value={form.profession} onChange={set('profession')} placeholder="Choose your discipline" />
            <TextField label="Practice or company" value={form.company} onChange={set('company')} placeholder="Mokoena Town Planning" />
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="City or town" value={form.city} onChange={set('city')} placeholder="Pretoria" />
          <SelectField label="Province" options={PROVINCES} value={form.province} onChange={set('province')} placeholder="Choose a province" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Email address" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@practice.co.za" />
          <TextField label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="082 000 0000" />
        </div>

        <TextField
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          hint="At least 8 characters."
        />

        {isPro && (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-xs leading-relaxed text-stone-600">
            Your profile is listed in the public directory as soon as you join, so
            clients can find you. You can unlist it at any time from your profile
            settings.
          </p>
        )}

        <Button type="submit" size="lg" loading={busy} className="w-full">
          Create my account
        </Button>
      </form>
    </AuthLayout>
  );
}
