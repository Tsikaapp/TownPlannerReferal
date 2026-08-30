import { supabase } from '@/lib/supabaseClient';
import type { Enquiry, EnquiryStatus, EnquirySubmission } from '@/lib/types';

type Row = Record<string, unknown>;

function mapEnquiry(row: Row): Enquiry {
  return {
    id: row.id as string,
    reference: (row.reference as string) ?? '',
    professionalId: row.professional_id as string,
    clientId: (row.client_id as string | null) ?? null,
    clientName: (row.client_name as string) ?? '',
    clientEmail: (row.client_email as string) ?? '',
    clientPhone: (row.client_phone as string) ?? '',
    projectAddress: (row.project_address as string) ?? '',
    projectType: (row.project_type as string) ?? '',
    message: (row.message as string) ?? '',
    timeline: (row.timeline as string) ?? '',
    status: (row.status as EnquiryStatus) ?? 'new',
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/** Contact form on a directory profile. Open to logged-out visitors. */
export async function submitEnquiry(input: EnquirySubmission): Promise<string> {
  const { data, error } = await supabase.rpc('submit_enquiry', {
    p_professional_id: input.professionalId,
    p_client_name: input.clientName,
    p_client_email: input.clientEmail,
    p_client_phone: input.clientPhone,
    p_project_address: input.projectAddress,
    p_project_type: input.projectType,
    p_message: input.message,
    p_timeline: input.timeline,
  });
  if (error) throw error;
  return data as string;
}

/** Enquiries sent to this professional. */
export async function fetchReceivedEnquiries(userId: string): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('professional_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapEnquiry);
}

/** Enquiries this account sent, for a client login. */
export async function fetchSentEnquiries(userId: string): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapEnquiry);
}

export async function fetchAllEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapEnquiry);
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
  const { data, error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapEnquiry(data as Row);
}
