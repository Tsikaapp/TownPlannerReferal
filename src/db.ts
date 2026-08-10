import { supabase } from './supabaseClient';
import { Referrer, Referral, ReferralStatus, CommissionStatus } from './types';

function mapReferrer(row: Record<string, unknown>): Referrer {
  return {
    id: row.id as string,
    name: row.name as string,
    company: (row.company as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    commissionRate: Number(row.commission_rate) || 0,
    notes: (row.notes as string) || '',
    createdAt: row.created_at as string,
  };
}

function mapReferral(row: Record<string, unknown>): Referral {
  return {
    id: row.id as string,
    referrerId: (row.referrer_id as string) || null,
    clientName: row.client_name as string,
    clientEmail: (row.client_email as string) || '',
    clientPhone: (row.client_phone as string) || '',
    projectAddress: (row.project_address as string) || '',
    projectType: (row.project_type as string) || '',
    projectDescription: (row.project_description as string) || '',
    status: row.status as ReferralStatus,
    commissionAmount: Number(row.commission_amount) || 0,
    commissionStatus: row.commission_status as CommissionStatus,
    referralDate: (row.referral_date as string) || '',
    projectDate: (row.project_date as string) || null,
    notes: (row.notes as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchReferrers(): Promise<Referrer[]> {
  const { data, error } = await supabase
    .from('referrers')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(mapReferrer);
}

export async function fetchReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(mapReferral);
}

export async function createReferrer(referrer: Omit<Referrer, 'id' | 'createdAt'>): Promise<Referrer> {
  const { data, error } = await supabase
    .from('referrers')
    .insert({
      name: referrer.name,
      company: referrer.company,
      email: referrer.email,
      phone: referrer.phone,
      commission_rate: referrer.commissionRate,
      notes: referrer.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return mapReferrer(data as Record<string, unknown>);
}

export async function updateReferrer(id: string, referrer: Omit<Referrer, 'id' | 'createdAt'>): Promise<Referrer> {
  const { data, error } = await supabase
    .from('referrers')
    .update({
      name: referrer.name,
      company: referrer.company,
      email: referrer.email,
      phone: referrer.phone,
      commission_rate: referrer.commissionRate,
      notes: referrer.notes,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapReferrer(data as Record<string, unknown>);
}

export async function deleteReferrer(id: string): Promise<void> {
  const { error } = await supabase.from('referrers').delete().eq('id', id);
  if (error) throw error;
}

export async function createReferral(referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>): Promise<Referral> {
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referral.referrerId,
      client_name: referral.clientName,
      client_email: referral.clientEmail,
      client_phone: referral.clientPhone,
      project_address: referral.projectAddress,
      project_type: referral.projectType,
      project_description: referral.projectDescription,
      status: referral.status,
      commission_amount: referral.commissionAmount,
      commission_status: referral.commissionStatus,
      referral_date: referral.referralDate || null,
      project_date: referral.projectDate || null,
      notes: referral.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return mapReferral(data as Record<string, unknown>);
}

export async function updateReferral(id: string, referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>): Promise<Referral> {
  const { data, error } = await supabase
    .from('referrals')
    .update({
      referrer_id: referral.referrerId,
      client_name: referral.clientName,
      client_email: referral.clientEmail,
      client_phone: referral.clientPhone,
      project_address: referral.projectAddress,
      project_type: referral.projectType,
      project_description: referral.projectDescription,
      status: referral.status,
      commission_amount: referral.commissionAmount,
      commission_status: referral.commissionStatus,
      referral_date: referral.referralDate || null,
      project_date: referral.projectDate || null,
      notes: referral.notes,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapReferral(data as Record<string, unknown>);
}

export async function deleteReferral(id: string): Promise<void> {
  const { error } = await supabase.from('referrals').delete().eq('id', id);
  if (error) throw error;
}
