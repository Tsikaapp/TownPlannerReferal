import { Search, SlidersHorizontal, UserSearch, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProfessionalCard from '@/components/ProfessionalCard';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { buttonStyles } from '@/components/ui/styles';
import { useAuth } from '@/auth/useAuth';
import { fetchDirectory } from '@/db/profiles';
import { PROFESSIONS, PROVINCES } from '@/lib/constants';
import { readableError } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/types';

export default function Directory() {
  const { session } = useAuth();
  const [params, setParams] = useSearchParams();

  const search = params.get('q') ?? '';
  const profession = params.get('profession') ?? '';
  const province = params.get('province') ?? '';

  const [draft, setDraft] = useState(search);
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  useEffect(() => { setDraft(search); }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDirectory({ search, profession, province }, Boolean(session))
      .then((rows) => { if (!cancelled) setResults(rows); })
      .catch((err) => { if (!cancelled) setError(readableError(err, 'We could not load the directory.')); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [search, profession, province, session]);

  const activeFilters = useMemo(
    () => [profession, province].filter(Boolean).length,
    [profession, province]
  );

  return (
    <>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-forest-900 sm:text-4xl">Find a professional</h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-600">
            Browse town planners and the specialists who work alongside them.
            Contact anyone directly — no account required.
          </p>

          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => { e.preventDefault(); setParam('q', draft.trim()); }}
            role="search"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search by name, practice or town"
                aria-label="Search the directory"
                className="field-input h-13 pl-12 text-base"
              />
            </div>
            <button type="submit" className={buttonStyles('primary', 'lg')}>Search</button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm text-stone-500">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filter
            </span>

            <select
              value={profession}
              onChange={(e) => setParam('profession', e.target.value)}
              aria-label="Filter by profession"
              className="field-input h-10 w-auto cursor-pointer py-0 text-sm"
            >
              <option value="">All disciplines</option>
              {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={province}
              onChange={(e) => setParam('province', e.target.value)}
              aria-label="Filter by province"
              className="field-input h-10 w-auto cursor-pointer py-0 text-sm"
            >
              <option value="">All provinces</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            {(activeFilters > 0 || search) && (
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-forest-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <Spinner label="Loading the directory…" />
        ) : error ? (
          <Alert tone="error" title="Could not load the directory">{error}</Alert>
        ) : results.length === 0 ? (
          <EmptyState
            icon={UserSearch}
            title="No professionals matched"
            description="Try a different discipline or province, or clear the filters to see everyone listed."
            action={
              <Link to="/join" className={buttonStyles('primary', 'md')}>
                List your practice
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-stone-500">
              {results.length} {results.length === 1 ? 'professional' : 'professionals'} listed
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((pro) => <ProfessionalCard key={pro.id} pro={pro} />)}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
