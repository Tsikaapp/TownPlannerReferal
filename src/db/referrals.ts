import { supabase } from '@/lib/supabaseClient';
import type { Referral, ReferralStatus, ReferralSubmission } from '@/lib/types';

type Row = Record<string, unknown>;

function mapReferral(row: Row): Referral {
  return {
    id: row.id as string,
    reference: (row.reference as string) ?? '',
    referrerId: (row.referrer_id as string | null) ?? null,
    recipientId: (row.recipient_id as string | null) ?? null,
    referrerName: (row.referrer_name as string) ?? '',
    referrerEmail: (row.referrer_email as string) ?? '',
    referrerPhone: (row.referrer_phone as string) ?? '',
    referrerCompany: (row.referrer_company as string) ?? '',
    clientName: (row.client_name as string) ?? '',
    clientEmail: (row.client_email as string) ?? '',
    clientPhone: (row.client_phone as string) ?? '',
    projectAddress: (row.project_address as string) ?? '',
    projectType: (row.project_type as string) ?? '',
    projectDescription: (row.project_description as string) ?? '',
    timeline: (row.timeline as string) ?? '',
    status: (row.status as ReferralStatus) ?? 'new',
    referralDate: (row.referral_date as string | null) ?? null,
    projectDate: (row.project_date as string | null) ?? null,
    notes: (row.notes as string) ?? '',
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/**
 * The public referral form. Goes through a SECURITY DEFINER function because
 * logged-out visitors have no direct grant on the table at all. Returns the
 * reference number to show the submitter.
 */
export async function submitReferral(input: ReferralSubmission): Promise<string> {
  const { data, error } = await supabase.rpc('submit_referral', {
    p_recipient_id: input.recipientId,
    p_referrer_name: input.referrerName,
    p_referrer_email: input.referrerEmail,
    p_referrer_phone: input.referrerPhone,
    p_referrer_company: input.referrerCompany,
    p_client_name: input.clientName,
    p_client_email: input.clientEmail,
    p_client_phone: input.clientPhone,
    p_project_address: input.projectAddress,
    p_project_type: input.projectType,
    p_project_description: input.projectDescription,
    p_timeline: input.timeline,
  });
  if (error) throw error;
  return data as string;
}

/** Referrals this member sent. */
export async function fetchSentReferrals(userId: string): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapReferral);
}

/** Referrals addressed to this member. */
export async function fetchReceivedReferrals(userId: string): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapReferral);
}

/** Admin only — everything, including referrals nobody has been assigned yet. */
export async function fetchAllReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapReferral);
}

export async function updateReferral(
  id: string,
  patch: { status?: ReferralStatus; notes?: string; recipientId?: string | null }
): Promise<Referral> {
  const row: Row = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.recipientId !== undefined) row.recipient_id = patch.recipientId;

  const { data, error } = await supabase.from('referrals').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapReferral(data as Row);
}

export async function deleteReferral(id: string): Promise<void> {
  const { error } = await supabase.from('referrals').delete().eq('id', id);
  if (error) throw error;
}
