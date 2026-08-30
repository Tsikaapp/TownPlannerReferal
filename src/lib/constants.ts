import type { EnquiryStatus, ReferralStatus } from './types';

/**
 * Disciplines that appear in the directory filter and on sign-up.
 * Ordered with the most common first rather than alphabetically.
 */
export const PROFESSIONS = [
  'Town Planner',
  'Urban Designer',
  'Architect',
  'Land Surveyor',
  'Civil Engineer',
  'Traffic Engineer',
  'Environmental Consultant',
  'Heritage Consultant',
  'Landscape Architect',
  'Quantity Surveyor',
  'Property Developer',
  'Conveyancing Attorney',
  'Project Manager',
  'Estate Agent',
  'Other',
] as const;

/** South African provinces. Swap this list if you launch in another market. */
export const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
] as const;

export const PROJECT_TYPES = [
  'Township Establishment',
  'Rezoning',
  'Subdivision',
  'Consent Use',
  'Building Plan Approval',
  'Residential',
  'Commercial',
  'Industrial',
  'Mixed Use',
  'Rural / Agricultural',
  'Environmental Authorisation',
  'Other',
] as const;

export const TIMELINES = [
  'As soon as possible',
  'Within a month',
  '1 to 3 months',
  '3 to 6 months',
  'Just exploring',
] as const;

export const SERVICES = [
  'Rezoning applications',
  'Township establishment',
  'Subdivision & consolidation',
  'Consent use applications',
  'Site development plans',
  'Land use rights research',
  'Development feasibility',
  'Heritage applications',
  'Environmental authorisations',
  'Municipal liaison',
  'Objections & appeals',
  'Expert witness',
] as const;

export const REFERRAL_STATUSES: ReferralStatus[] = [
  'new', 'contacted', 'accepted', 'in_progress', 'completed', 'declined',
];

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  accepted: 'Accepted',
  in_progress: 'In progress',
  completed: 'Completed',
  declined: 'Declined',
};

export const REFERRAL_STATUS_STYLES: Record<ReferralStatus, string> = {
  new: 'bg-gold-100 text-gold-800 ring-gold-200',
  contacted: 'bg-sky-50 text-sky-700 ring-sky-200',
  accepted: 'bg-forest-100 text-forest-700 ring-forest-200',
  in_progress: 'bg-forest-100 text-forest-800 ring-forest-300',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  declined: 'bg-stone-100 text-stone-600 ring-stone-300',
};

export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'replied', 'closed'];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  replied: 'Replied',
  closed: 'Closed',
};

export const ENQUIRY_STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'bg-gold-100 text-gold-800 ring-gold-200',
  replied: 'bg-forest-100 text-forest-700 ring-forest-200',
  closed: 'bg-stone-100 text-stone-600 ring-stone-300',
};
