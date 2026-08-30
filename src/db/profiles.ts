import { supabase } from '@/lib/supabaseClient';
import type { DirectoryFilters, Profile } from '@/lib/types';

/**
 * Columns a logged-out visitor is granted. Selecting `*` as `anon` fails,
 * because contact detail is withheld with a column-level GRANT rather than a
 * policy — see the migration's grants section.
 */
const PUBLIC_COLUMNS =
  'id, account_type, full_name, company, profession, city, province, bio, ' +
  'services, years_experience, registration_no, website, is_listed, created_at';

type Row = Record<string, unknown>;

export function mapProfile(row: Row): Profile {
  return {
    id: row.id as string,
    accountType: (row.account_type as Profile['accountType']) ?? 'professional',
    fullName: (row.full_name as string) ?? '',
    company: (row.company as string) ?? '',
    profession: (row.profession as string) ?? '',
    email: (row.email as string) ?? '',
    phone: (row.phone as string) ?? '',
    website: (row.website as string) ?? '',
    city: (row.city as string) ?? '',
    province: (row.province as string) ?? '',
    bio: (row.bio as string) ?? '',
    services: (row.services as string[]) ?? [],
    yearsExperience: (row.years_experience as number | null) ?? null,
    registrationNo: (row.registration_no as string) ?? '',
    isListed: Boolean(row.is_listed),
    isAdmin: Boolean(row.is_admin),
    createdAt: (row.created_at as string) ?? '',
  };
}

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as Row) : null;
}

/**
 * The public directory. `signedIn` widens the projection to include contact
 * detail, which anonymous visitors are not granted.
 */
export async function fetchDirectory(
  filters: DirectoryFilters,
  signedIn: boolean
): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select(signedIn ? '*' : PUBLIC_COLUMNS)
    .eq('account_type', 'professional')
    .eq('is_listed', true);

  if (filters.profession) query = query.eq('profession', filters.profession);
  if (filters.province) query = query.eq('province', filters.province);

  const term = filters.search.trim();
  if (term) {
    const safe = term.replace(/[%,()]/g, ' ');
    query = query.or(
      `full_name.ilike.%${safe}%,company.ilike.%${safe}%,city.ilike.%${safe}%,bio.ilike.%${safe}%`
    );
  }

  const { data, error } = await query.order('full_name', { ascending: true }).limit(200);
  if (error) throw error;
  return (data as unknown as Row[]).map(mapProfile);
}

export async function fetchProfessional(id: string, signedIn: boolean): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(signedIn ? '*' : PUBLIC_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as unknown as Row) : null;
}

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'fullName' | 'company' | 'profession' | 'email' | 'phone' | 'website'
    | 'city' | 'province' | 'bio' | 'services' | 'yearsExperience'
    | 'registrationNo' | 'isListed' | 'accountType'
  >
>;

export async function updateProfile(id: string, patch: ProfileUpdate): Promise<Profile> {
  // `is_admin` is deliberately absent: it is in no UPDATE grant, so sending it
  // would be rejected outright.
  const row: Row = {};
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.company !== undefined) row.company = patch.company;
  if (patch.profession !== undefined) row.profession = patch.profession;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.website !== undefined) row.website = patch.website;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.province !== undefined) row.province = patch.province;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.services !== undefined) row.services = patch.services;
  if (patch.yearsExperience !== undefined) row.years_experience = patch.yearsExperience;
  if (patch.registrationNo !== undefined) row.registration_no = patch.registrationNo;
  if (patch.isListed !== undefined) row.is_listed = patch.isListed;
  if (patch.accountType !== undefined) row.account_type = patch.accountType;

  const { data, error } = await supabase.from('profiles').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapProfile(data as Row);
}

/** Admin only — every member, listed or not. */
export async function fetchAllMembers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapProfile);
}
