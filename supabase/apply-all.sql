-- PlanLink — full schema for a fresh Supabase project.
-- Paste into the Supabase dashboard SQL editor and run once.
-- Concatenation of supabase/migrations/, in order. Generated 2026-08-30T20:34Z.

-- ============================================================
-- 20260810093357_create_referral_tracking_schema.sql
-- ============================================================
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


-- ============================================================
-- 20260830120000_planlink_network_schema.sql
-- ============================================================
/*
# PlanLink — professional referral network schema

Replaces the single-tenant, anon-CRUD prototype with an authenticated,
multi-tenant network. Commission tracking is deliberately REMOVED.

## Actors
- `professional` — town planner / architect / surveyor / engineer etc. Opts in to
  the public directory, sends and receives referrals.
- `client` — member of the public. Browses the directory and sends enquiries.
- `admin` — `profiles.is_admin`. Sees and triages everything.

## Tables
1. `profiles`   — one row per auth user (id = auth.users.id).
2. `referrals`  — professional refers a client on to another professional.
                  Submittable while logged out; claimed on sign-up by email.
3. `enquiries`  — a client contacts a professional from their directory profile.

## Security
- RLS on every table.
- Anonymous visitors may INSERT referrals/enquiries but may never SELECT them —
  reading requires a login, per the product requirement.
- Anonymous directory browsing is restricted to non-contact columns via
  column-level GRANTs; email/phone are visible to signed-in users only.
- `is_admin` is excluded from the UPDATE grant AND guarded by a trigger, so a
  member cannot escalate their own privileges.
*/

-- ---------------------------------------------------------------------------
-- 0. Retire the prototype
-- ---------------------------------------------------------------------------

-- The old `referrers` table held plain contact rows, not auth users, so it
-- cannot become `profiles`. Park it rather than destroy it, and cut off API
-- access. Drop it manually once you've confirmed there is nothing to keep.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'referrers') THEN
    ALTER TABLE referrers RENAME TO referrers_legacy;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'referrers_legacy') THEN
    EXECUTE 'REVOKE ALL ON referrers_legacy FROM anon, authenticated';
    EXECUTE 'DROP POLICY IF EXISTS "anon_select_referrers" ON referrers_legacy';
    EXECUTE 'DROP POLICY IF EXISTS "anon_insert_referrers" ON referrers_legacy';
    EXECUTE 'DROP POLICY IF EXISTS "anon_update_referrers" ON referrers_legacy';
    EXECUTE 'DROP POLICY IF EXISTS "anon_delete_referrers" ON referrers_legacy';
  END IF;
END $$;

-- The prototype gave anon full CRUD over referrals. Remove all of it.
DROP POLICY IF EXISTS "anon_select_referrals" ON referrals;
DROP POLICY IF EXISTS "anon_insert_referrals" ON referrals;
DROP POLICY IF EXISTS "anon_update_referrals" ON referrals;
DROP POLICY IF EXISTS "anon_delete_referrals" ON referrals;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type     text NOT NULL DEFAULT 'professional'
                     CHECK (account_type IN ('professional', 'client')),
  full_name        text NOT NULL DEFAULT '',
  company          text NOT NULL DEFAULT '',
  profession       text NOT NULL DEFAULT '',
  email            text NOT NULL DEFAULT '',
  phone            text NOT NULL DEFAULT '',
  website          text NOT NULL DEFAULT '',
  city             text NOT NULL DEFAULT '',
  province         text NOT NULL DEFAULT '',
  bio              text NOT NULL DEFAULT '',
  services         text[] NOT NULL DEFAULT '{}',
  years_experience integer,
  registration_no  text NOT NULL DEFAULT '',
  is_listed        boolean NOT NULL DEFAULT true,
  is_admin         boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_directory_idx
  ON profiles (account_type, is_listed);
CREATE INDEX IF NOT EXISTS profiles_profession_idx ON profiles (profession);
CREATE INDEX IF NOT EXISTS profiles_province_idx   ON profiles (province);
CREATE INDEX IF NOT EXISTS profiles_email_idx      ON profiles (lower(email));

-- ---------------------------------------------------------------------------
-- 2. referrals  (reshape the prototype table)
-- ---------------------------------------------------------------------------

-- Commission tracking is removed entirely.
ALTER TABLE referrals DROP COLUMN IF EXISTS commission_amount;
ALTER TABLE referrals DROP COLUMN IF EXISTS commission_status;

-- referrer_id used to point at `referrers`; it now points at `profiles`.
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
UPDATE referrals SET referrer_id = NULL WHERE referrer_id IS NOT NULL;

ALTER TABLE referrals
  ADD COLUMN IF NOT EXISTS recipient_id     uuid,
  ADD COLUMN IF NOT EXISTS referrer_name    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS referrer_email   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS referrer_phone   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS referrer_company text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS timeline         text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference        text NOT NULL DEFAULT '';

ALTER TABLE referrals
  ADD CONSTRAINT referrals_referrer_id_fkey
    FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_recipient_id_fkey;
ALTER TABLE referrals
  ADD CONSTRAINT referrals_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE referrals ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_status_check;
ALTER TABLE referrals ADD CONSTRAINT referrals_status_check
  CHECK (status IN ('new','contacted','accepted','in_progress','completed','declined'));

CREATE INDEX IF NOT EXISTS referrals_recipient_idx ON referrals (recipient_id);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx  ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS referrals_ref_email_idx ON referrals (lower(referrer_email));

-- Human-friendly reference, e.g. PL-4F2A9C, generated on insert.
CREATE OR REPLACE FUNCTION set_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'PL-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 6));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS referrals_reference ON referrals;
CREATE TRIGGER referrals_reference BEFORE INSERT ON referrals
  FOR EACH ROW EXECUTE FUNCTION set_reference();

-- ---------------------------------------------------------------------------
-- 3. enquiries  (public -> professional, from a directory profile)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS enquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  client_name     text NOT NULL,
  client_email    text NOT NULL DEFAULT '',
  client_phone    text NOT NULL DEFAULT '',
  project_address text NOT NULL DEFAULT '',
  project_type    text NOT NULL DEFAULT '',
  message         text NOT NULL DEFAULT '',
  timeline        text NOT NULL DEFAULT '',
  status          text NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','replied','closed')),
  reference       text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiries_professional_idx ON enquiries (professional_id);
CREATE INDEX IF NOT EXISTS enquiries_client_idx       ON enquiries (client_id);
CREATE INDEX IF NOT EXISTS enquiries_email_idx        ON enquiries (lower(client_email));

DROP TRIGGER IF EXISTS enquiries_reference ON enquiries;
CREATE TRIGGER enquiries_reference BEFORE INSERT ON enquiries
  FOR EACH ROW EXECUTE FUNCTION set_reference();

-- ---------------------------------------------------------------------------
-- 4. updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS referrals_updated_at ON referrals;
CREATE TRIGGER referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS enquiries_updated_at ON enquiries;
CREATE TRIGGER enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Helpers
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so RLS policies on `profiles` can call it without recursing.
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = uid AND is_admin);
$$;

REVOKE ALL ON FUNCTION is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;

-- Defence in depth: `is_admin` is already absent from the UPDATE grant below,
-- but block escalation at the row level too. auth.uid() is NULL for direct SQL,
-- which is what lets you promote the first admin by hand.
CREATE OR REPLACE FUNCTION protect_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND NOT is_admin(auth.uid()) THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_protect_privileges ON profiles;
CREATE TRIGGER profiles_protect_privileges BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_privileges();

-- Create the profile on sign-up, and adopt anything that was submitted from the
-- public forms with this email address before the account existed.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  kind text := CASE WHEN meta->>'account_type' = 'client' THEN 'client' ELSE 'professional' END;
BEGIN
  INSERT INTO profiles (id, email, full_name, account_type, company, profession,
                        phone, city, province, is_listed)
  VALUES (NEW.id,
          NEW.email,
          COALESCE(meta->>'full_name', ''),
          kind,
          COALESCE(meta->>'company', ''),
          COALESCE(meta->>'profession', ''),
          COALESCE(meta->>'phone', ''),
          COALESCE(meta->>'city', ''),
          COALESCE(meta->>'province', ''),
          kind = 'professional')
  ON CONFLICT (id) DO NOTHING;

  UPDATE referrals SET referrer_id = NEW.id
    WHERE referrer_id IS NULL AND lower(referrer_email) = lower(NEW.email);
  UPDATE enquiries SET client_id = NEW.id
    WHERE client_id IS NULL AND lower(client_email) = lower(NEW.email);

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Public submission RPCs
--
-- Logged-out visitors get NO direct table access at all. Both public forms go
-- through these SECURITY DEFINER functions, which validate input and return
-- only the reference number. auth.uid() is NULL for a logged-out submitter, so
-- the row stays unclaimed until they sign up with the same email.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION submit_referral(
  p_recipient_id       uuid,
  p_referrer_name      text,
  p_referrer_email     text,
  p_referrer_phone     text,
  p_referrer_company   text,
  p_client_name        text,
  p_client_email       text,
  p_client_phone       text,
  p_project_address    text,
  p_project_type       text,
  p_project_description text,
  p_timeline           text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ref text;
BEGIN
  IF length(trim(COALESCE(p_referrer_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Please give your name.';
  END IF;
  IF COALESCE(p_referrer_email, '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Please give a valid email address so we can reach you.';
  END IF;
  IF length(trim(COALESCE(p_client_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Please give the name of the person you are referring.';
  END IF;
  IF p_recipient_id IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM profiles
        WHERE id = p_recipient_id AND account_type = 'professional' AND is_listed) THEN
    RAISE EXCEPTION 'That professional is not currently accepting referrals.';
  END IF;

  INSERT INTO referrals (
    referrer_id, recipient_id, referrer_name, referrer_email, referrer_phone,
    referrer_company, client_name, client_email, client_phone, project_address,
    project_type, project_description, timeline, referral_date, status
  ) VALUES (
    auth.uid(), p_recipient_id, trim(p_referrer_name),
    lower(trim(p_referrer_email)), COALESCE(p_referrer_phone, ''),
    COALESCE(p_referrer_company, ''), trim(p_client_name),
    lower(COALESCE(p_client_email, '')), COALESCE(p_client_phone, ''),
    COALESCE(p_project_address, ''), COALESCE(p_project_type, ''),
    COALESCE(p_project_description, ''), COALESCE(p_timeline, ''),
    current_date, 'new'
  ) RETURNING reference INTO v_ref;

  RETURN v_ref;
END $$;

CREATE OR REPLACE FUNCTION submit_enquiry(
  p_professional_id uuid,
  p_client_name     text,
  p_client_email    text,
  p_client_phone    text,
  p_project_address text,
  p_project_type    text,
  p_message         text,
  p_timeline        text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ref text;
BEGIN
  IF length(trim(COALESCE(p_client_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Please give your name.';
  END IF;
  IF COALESCE(p_client_email, '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Please give a valid email address so they can reply.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles
                  WHERE id = p_professional_id
                    AND account_type = 'professional' AND is_listed) THEN
    RAISE EXCEPTION 'That professional is not currently accepting enquiries.';
  END IF;

  INSERT INTO enquiries (
    professional_id, client_id, client_name, client_email, client_phone,
    project_address, project_type, message, timeline, status
  ) VALUES (
    p_professional_id, auth.uid(), trim(p_client_name),
    lower(trim(p_client_email)), COALESCE(p_client_phone, ''),
    COALESCE(p_project_address, ''), COALESCE(p_project_type, ''),
    COALESCE(p_message, ''), COALESCE(p_timeline, ''), 'new'
  ) RETURNING reference INTO v_ref;

  RETURN v_ref;
END $$;

REVOKE ALL ON FUNCTION submit_referral(uuid,text,text,text,text,text,text,text,text,text,text,text) FROM public;
REVOKE ALL ON FUNCTION submit_enquiry(uuid,text,text,text,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION submit_referral(uuid,text,text,text,text,text,text,text,text,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_enquiry(uuid,text,text,text,text,text,text,text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Row level security
-- ---------------------------------------------------------------------------

ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- profiles ------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_directory ON profiles;
CREATE POLICY profiles_select_directory ON profiles FOR SELECT TO anon, authenticated
  USING (is_listed AND account_type = 'professional');

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_select_admin ON profiles;
CREATE POLICY profiles_select_admin ON profiles FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_admin ON profiles;
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- referrals -----------------------------------------------------------------
-- No INSERT policy: writes arrive only through submit_referral().
DROP POLICY IF EXISTS referrals_select_mine ON referrals;
CREATE POLICY referrals_select_mine ON referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR recipient_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS referrals_update_recipient ON referrals;
CREATE POLICY referrals_update_recipient ON referrals FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid() OR is_admin(auth.uid()))
  WITH CHECK (recipient_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS referrals_delete_admin ON referrals;
CREATE POLICY referrals_delete_admin ON referrals FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- enquiries -----------------------------------------------------------------
-- No INSERT policy: writes arrive only through submit_enquiry().
DROP POLICY IF EXISTS enquiries_select_mine ON enquiries;
CREATE POLICY enquiries_select_mine ON enquiries FOR SELECT TO authenticated
  USING (professional_id = auth.uid() OR client_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS enquiries_update_owner ON enquiries;
CREATE POLICY enquiries_update_owner ON enquiries FOR UPDATE TO authenticated
  USING (professional_id = auth.uid() OR is_admin(auth.uid()))
  WITH CHECK (professional_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS enquiries_delete_admin ON enquiries;
CREATE POLICY enquiries_delete_admin ON enquiries FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 8. Grants
--
-- RLS cannot filter by column, so the directory's privacy line is drawn with
-- column-level GRANTs: a logged-out visitor can read a listed professional's
-- public detail but NOT their email or phone. Contact runs through the enquiry
-- form instead. `is_admin` is in no INSERT/UPDATE grant, so the API cannot set
-- it — promote your first admin with the statement at the bottom of this file.
-- ---------------------------------------------------------------------------

REVOKE ALL ON profiles  FROM anon, authenticated;
REVOKE ALL ON referrals FROM anon, authenticated;
REVOKE ALL ON enquiries FROM anon, authenticated;

GRANT SELECT (id, account_type, full_name, company, profession, city, province,
              bio, services, years_experience, registration_no, website,
              is_listed, created_at)
  ON profiles TO anon;

GRANT SELECT ON profiles TO authenticated;
GRANT INSERT (id, account_type, full_name, company, profession, email, phone,
              website, city, province, bio, services, years_experience,
              registration_no, is_listed)
  ON profiles TO authenticated;
GRANT UPDATE (account_type, full_name, company, profession, email, phone,
              website, city, province, bio, services, years_experience,
              registration_no, is_listed)
  ON profiles TO authenticated;

GRANT SELECT ON referrals TO authenticated;
GRANT UPDATE (status, notes, recipient_id) ON referrals TO authenticated;
GRANT DELETE ON referrals TO authenticated;

GRANT SELECT ON enquiries TO authenticated;
GRANT UPDATE (status) ON enquiries TO authenticated;
GRANT DELETE ON enquiries TO authenticated;

-- ---------------------------------------------------------------------------
-- 9. Promote your first admin
--
-- Sign up through the app first, then run this once with your own address:
--
--   UPDATE profiles SET is_admin = true WHERE lower(email) = lower('you@example.com');
--
-- ---------------------------------------------------------------------------


