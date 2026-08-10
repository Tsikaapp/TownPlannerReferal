/*
# Create referral tracking schema (single-tenant, no auth)

1. New Tables
- `referrers` — professionals who refer clients to the user.
  - id (uuid PK)
  - name (text, not null)
  - company (text)
  - email (text)
  - phone (text)
  - commission_rate (numeric, default 0)
  - notes (text, default '')
  - created_at (timestamptz)

- `referrals` — each client referral, linked to a referrer.
  - id (uuid PK)
  - referrer_id (uuid FK -> referrers.id, ON DELETE SET NULL)
  - client_name (text, not null)
  - client_email (text)
  - client_phone (text)
  - project_address (text)
  - project_type (text)
  - project_description (text, default '')
  - status (text, default 'new')
  - commission_amount (numeric, default 0)
  - commission_status (text, default 'none')
  - referral_date (date)
  - project_date (date)
  - notes (text, default '')
  - created_at (timestamptz)
  - updated_at (timestamptz)

2. Indexes
- referrals_status_idx, referrals_referrer_id_idx, referrals_commission_status_idx, referrals_client_name_idx

3. Security
- RLS enabled on both tables.
- anon + authenticated CRUD (single-tenant, no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS referrers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  commission_rate numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES referrers(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  project_address text DEFAULT '',
  project_type text DEFAULT '',
  project_description text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  commission_amount numeric DEFAULT 0,
  commission_status text NOT NULL DEFAULT 'none',
  referral_date date,
  project_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_referrers" ON referrers;
CREATE POLICY "anon_select_referrers" ON referrers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_referrers" ON referrers;
CREATE POLICY "anon_insert_referrers" ON referrers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_referrers" ON referrers;
CREATE POLICY "anon_update_referrers" ON referrers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_referrers" ON referrers;
CREATE POLICY "anon_delete_referrers" ON referrers FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_referrals" ON referrals;
CREATE POLICY "anon_select_referrals" ON referrals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_referrals" ON referrals;
CREATE POLICY "anon_insert_referrals" ON referrals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_referrals" ON referrals;
CREATE POLICY "anon_update_referrals" ON referrals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_referrals" ON referrals;
CREATE POLICY "anon_delete_referrals" ON referrals FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS referrals_status_idx ON referrals(status);
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_commission_status_idx ON referrals(commission_status);
CREATE INDEX IF NOT EXISTS referrals_client_name_idx ON referrals(client_name);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS referrals_updated_at ON referrals;
CREATE TRIGGER referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
