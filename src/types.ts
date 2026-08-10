export type ReferralStatus =
  | 'new'
  | 'contacted'
  | 'consultation'
  | 'active'
  | 'completed'
  | 'on_hold'
  | 'not_proceeding';

export type CommissionStatus = 'none' | 'pending' | 'paid';

export interface Referrer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  commissionRate: number;
  notes: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  projectType: string;
  projectDescription: string;
  status: ReferralStatus;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  referralDate: string;
  projectDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  consultation: 'In Consultation',
  active: 'Active Project',
  completed: 'Completed',
  on_hold: 'On Hold',
  not_proceeding: 'Not Proceeding',
};

export const STATUS_COLORS: Record<ReferralStatus, string> = {
  new: 'bg-sky-100 text-sky-700 border-sky-200',
  contacted: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  consultation: 'bg-amber-100 text-amber-700 border-amber-200',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-orange-100 text-orange-700 border-orange-200',
  not_proceeding: 'bg-stone-200 text-stone-600 border-stone-300',
};

export const COMMISSION_LABELS: Record<CommissionStatus, string> = {
  none: 'No Commission',
  pending: 'Owed',
  paid: 'Paid',
};

export const COMMISSION_COLORS: Record<CommissionStatus, string> = {
  none: 'bg-stone-100 text-stone-500 border-stone-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Subdivision',
  'Industrial',
  'Mixed Use',
  'Rural',
  'Other',
] as const;

export const ALL_STATUSES: ReferralStatus[] = [
  'new',
  'contacted',
  'consultation',
  'active',
  'completed',
  'on_hold',
  'not_proceeding',
];
