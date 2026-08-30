import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

/**
 * A clone has no .env (it is gitignored), so without this the app would just
 * fail every request with no explanation. Renders nothing once configured.
 */
export default function ConfigNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="border-b border-gold-300 bg-gold-100 px-4 py-2.5 text-center text-sm text-gold-900">
      <AlertTriangle className="mr-1.5 -mt-0.5 inline h-4 w-4" aria-hidden="true" />
      Not connected to Supabase. Add <code className="rounded bg-gold-200/70 px-1 font-mono text-xs">VITE_SUPABASE_URL</code> and{' '}
      <code className="rounded bg-gold-200/70 px-1 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> to your <code className="rounded bg-gold-200/70 px-1 font-mono text-xs">.env</code>, then restart the dev server.
    </div>
  );
}
