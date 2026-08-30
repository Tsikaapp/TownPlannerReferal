import { useId, useState, useRef, useEffect } from 'react';
import Avatar from '@/components/ui/Avatar';
import { ChevronDown } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default function ProfessionalSelect({
  label,
  value,
  onSelect,
  professionals,
  placeholder = 'Choose a professional',
  hint,
}: {
  label: string;
  value: string;
  onSelect(id: string | null): void;
  professionals: Profile[];
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const selected = professionals.find((p) => p.id === value) ?? null;
  const filtered = professionals.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [p.fullName, p.profession, p.company, p.city].filter(Boolean).some((s) => s!.toLowerCase().includes(q));
  });

  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div ref={ref} className="relative mt-2">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          id={id}
          onClick={() => setOpen((s) => !s)}
          className="field-input flex items-center justify-between"
        >
          <span className="flex items-center gap-3 min-w-0">
            {selected ? (
              <>
                <Avatar name={selected.fullName} seed={selected.id} size="sm" />
                <span className="truncate text-sm">
                  <span className="font-medium">{selected.fullName}</span>
                  <span className="ml-1 text-stone-500">{[selected.profession, selected.city].filter(Boolean).join(' · ')}</span>
                </span>
              </>
            ) : (
              <span className="truncate text-sm text-stone-500">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-stone-400" />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-stone-200 bg-white shadow-lg">
            <div className="p-3">
              <input
                aria-label="Filter professionals"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm"
                placeholder="Search by name, profession, company or city"
                autoFocus
              />
            </div>
            <ul role="listbox" className="max-h-72 overflow-auto divide-y divide-stone-100">
              {filtered.length === 0 && (
                <li className="p-4 text-sm text-stone-500">No matching professionals</li>
              )}
              {filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(p.id); setOpen(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-stone-50 flex items-start gap-3"
                  >
                    <Avatar name={p.fullName} seed={p.id} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-forest-900">{p.fullName}</span>
                        {p.profession && <span className="text-sm text-stone-500">· {p.profession}</span>}
                      </div>
                      {p.company && <div className="text-sm text-stone-500 truncate">{p.company}</div>}
                      <div className="text-xs text-stone-400">{[p.city, p.province].filter(Boolean).join(', ')}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-3 border-t border-stone-100">
              <button type="button" onClick={() => { onSelect(null); setOpen(false); }} className="text-sm text-stone-600">Clear selection</button>
            </div>
          </div>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
