import { useState, useEffect } from 'react';
import { X, Trash2, Save, Loader2 } from 'lucide-react';
import { Referrer } from '../types';

export type ReferrerFormData = Omit<Referrer, 'id' | 'createdAt'>;

interface Props {
  referrer: Referrer | null;
  onSave: (data: ReferrerFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function ReferrerModal({ referrer, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState<ReferrerFormData>(() =>
    referrer
      ? {
          name: referrer.name,
          company: referrer.company,
          email: referrer.email,
          phone: referrer.phone,
          commissionRate: referrer.commissionRate,
          notes: referrer.notes,
        }
      : {
          name: '',
          company: '',
          email: '',
          phone: '',
          commissionRate: 0,
          notes: '',
        }
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof ReferrerFormData>(key: K, value: ReferrerFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass = 'w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-stone-50/50 focus:bg-white';
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl my-0 sm:my-8 max-h-screen sm:max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-stone-800">{referrer ? 'Edit Referrer' : 'New Referrer'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Name *</label>
            <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="Jane Doe" />
          </div>
          <div>
            <label className={labelClass}>Company / Firm</label>
            <input type="text" value={form.company} onChange={(e) => update('company', e.target.value)} className={inputClass} placeholder="Doe Architecture" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="jane@doearch.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} placeholder="0412 345 678" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Default commission rate (%)</label>
            <input type="number" min="0" max="100" step="0.5" value={form.commissionRate || ''} onChange={(e) => update('commissionRate', parseFloat(e.target.value) || 0)} className={inputClass} placeholder="0" />
            <p className="text-xs text-stone-400 mt-1.5">The standard percentage you agree to pay this referrer per project.</p>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className={inputClass} placeholder="Any notes about this referrer..." />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div>
              {referrer && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-600">Delete this referrer?</span>
                    <button type="button" onClick={() => onDelete(referrer.id)} className="text-sm font-medium text-red-600 hover:text-red-700">Yes, delete</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="text-sm text-stone-500 hover:text-stone-700">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-md shadow-teal-600/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {referrer ? 'Save Changes' : 'Add Referrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
