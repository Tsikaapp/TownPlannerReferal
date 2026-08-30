export type AccountType = 'professional' | 'client';

export type ReferralStatus =
  | 'new' | 'contacted' | 'accepted' | 'in_progress' | 'completed' | 'declined';

export type EnquiryStatus = 'new' | 'replied' | 'closed';

/** A member's account. `id` is the auth user id. */
export interface Profile {
  id: string;
  accountType: AccountType;
  fullName: string;
  company: string;
  profession: string;
  /** Empty string when read anonymously — contact detail needs a login. */
  email: string;
  phone: string;
  website: string;
  city: string;
  province: string;
  bio: string;
  services: string[];
  yearsExperience: number | null;
  registrationNo: string;
  isListed: boolean;
  isAdmin: boolean;
  createdAt: string;
}

/** The subset of a profile that a logged-out visitor is allowed to read. */
export type DirectoryProfile = Omit<Profile, 'email' | 'phone' | 'isAdmin'> & {
  email?: string;
  phone?: string;
};

/** One professional passing a client on to another professional. */
export interface Referral {
  id: string;
  reference: string;
  referrerId: string | null;
  recipientId: string | null;
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  referrerCompany: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  projectType: string;
  projectDescription: string;
  timeline: string;
  status: ReferralStatus;
  referralDate: string | null;
  projectDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** A member of the public contacting a professional from their profile. */
export interface Enquiry {
  id: string;
  reference: string;
  professionalId: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  projectType: string;
  message: string;
  timeline: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralSubmission {
  recipientId: string | null;
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  referrerCompany: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  projectType: string;
  projectDescription: string;
  timeline: string;
}

export interface EnquirySubmission {
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  projectType: string;
  message: string;
  timeline: string;
}

export interface DirectoryFilters {
  search: string;
  profession: string;
  province: string;
}
