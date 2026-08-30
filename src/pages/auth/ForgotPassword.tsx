import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useAuth } from '@/auth/useAuth';
import { readableError } from '@/lib/supabaseClient';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email you a link to choose a new one."
      footer={
        <Link to="/sign-in" className="font-medium text-forest-700 underline underline-offset-4 hover:text-forest-800">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <Alert tone="success" title="Check your inbox">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
          The link expires after an hour.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@practice.co.za"
          />
          <Button type="submit" size="lg" loading={busy} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
