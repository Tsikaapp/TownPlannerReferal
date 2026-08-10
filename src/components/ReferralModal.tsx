import { useState, useEffect } from 'react';
import { X, Trash2, Save, Loader2 } from 'lucide-react';
import { Referral, Referrer, ReferralStatus, CommissionStatus, STATUS_LABELS, COMMISSION_LABELS, ALL_STATUSES, PROJECT_TYPES } from '../types';

export type ReferralFormData = Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>;

interface Props {
  referral: Referral | null;
  referrers: Referrer[];
  onSave: (data: ReferralFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const COMMISSION_STATUSES: CommissionStatus[] = ['none', 'pending', 'paid'];

export default function ReferralModal({ referral, referrers, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState<ReferralFormData>(() =>
    referral
      ? {
          referrerId: referral.referrerId,
          clientName: referral.clientName,
          clientEmail: referral.clientEmail,
          clientPhone: referral.clientPhone,
          projectAddress: referral.projectAddress,
          projectType: referral.projectType,
          projectDescription: referral.projectDescription,
          status: referral.status,
          commissionAmount: referral.commissionAmount,
          commissionStatus: referral.commissionStatus,
          referralDate: referral.referralDate,
          projectDate: referral.projectDate,
          notes: referral.notes,
        }
      : {
          referrerId: null,
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          projectAddress: '',
          projectType: '',
          projectDescription: '',
          status: 'new',
          commissionAmount: 0,
          commissionStatus: 'none',
          referralDate: new Date().toISOString().slice(0, 10),
          projectDate: null,
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
    if (!form.clientName.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof ReferralFormData>(key: K, value: ReferralFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedReferrer = referrers.find((r) => r.id === form.referrerId);
  const inputClass = 'w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-stone-50/50 focus:bg-white';
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl my-0 sm:my-8 max-h-screen sm:max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-stone-800">
            {referral ? 'Edit Referral' : 'New Referral'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Client</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Client name *</label>
                <input type="text" required value={form.clientName} onChange={(e) => update('clientName', e.target.value)} className={inputClass} placeholder="John Smith" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={form.clientPhone} onChange={(e) => update('clientPhone', e.target.value)} className={inputClass} placeholder="0412 345 678" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Email</label>
                <input type="email" value={form.clientEmail} onChange={(e) => update('clientEmail', e.target.value)} className={inputClass} placeholder="client@email.com" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Referrer</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Referred by</label>
                <select value={form.referrerId || ''} onChange={(e) => update('referrerId', e.target.value || null)} className={inputClass}>
                  <option value="">— No referrer recorded —</option>
                  {referrers.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}{r.company ? ` (${r.company})` : ''}</option>
                  ))}
                </select>
                {selectedReferrer && selectedReferrer.commissionRate > 0 && (
                  <p className="text-xs text-teal-600 mt-1.5 bg-teal-50 rounded-lg px-3 py-1.5">
                    {selectedReferrer.name} has a default commission rate of {selectedReferrer.commissionRate}%
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Referral date</label>
                <input type="date" value={form.referralDate} onChange={(e) => update('referralDate', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Project</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Project type</label>
                <select value={form.projectType} onChange={(e) => update('projectType', e.target.value)} className={inputClass}>
                  <option value="">— Select —</option>
                  {PROJECT_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Project start date</label>
                <input type="date" value={form.projectDate || ''} onChange={(e) => update('projectDate', e.target.value || null)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Project address</label>
                <input type="text" value={form.projectAddress} onChange={(e) => update('projectAddress', e.target.value)} className={inputClass} placeholder="123 Main St, Springfield" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Project description</label>
                <textarea value={form.projectDescription} onChange={(e) => update('projectDescription', e.target.value)} rows={3} className={inputClass} placeholder="Two-lot subdivision with new dwelling at rear..." />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Status & Commission</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Project status</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value as ReferralStatus)} className={inputClass}>
                  {ALL_STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Commission status</label>
                <select value={form.commissionStatus} onChange={(e) => update('commissionStatus', e.target.value as CommissionStatus)} className={inputClass}>
                  {COMMISSION_STATUSES.map((s) => (<option key={s} value={s}>{COMMISSION_LABELS[s]}</option>))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Commission amount ($)</label>
                <input type="number" min="0" step="0.01" value={form.commissionAmount || ''} onChange={(e) => update('commissionAmount', parseFloat(e.target.value) || 0)} className={inputClass} placeholder="0" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className={inputClass} placeholder="Any additional notes about this referral..." />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div>
              {referral && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-600">Delete this referral?</span>
                    <button type="button" onClick={() => onDelete(referral.id)} className="text-sm font-medium text-red-600 hover:text-red-700">Yes, delete</button>
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
                {referral ? 'Save Changes' : 'Create Referral'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
