# PlanLink

**Connect · Refer · Build**

The referral network for town planners and the development industry. Professionals
list their practice, clients find them, and referrals move between them — with a
record of every one.

## What it does

**Without an account**
- Browse the directory of professionals, filtered by discipline and province
- Read a professional's profile: practice, services, experience, registration
- Contact a professional directly from their profile
- Refer a client to a professional

**With an account**
- See the detail of every referral you have sent and received
- Move a received referral through its statuses and keep private notes on it
- Manage your directory listing, or hide it entirely
- Track the enquiries you have sent or received

**As an administrator**
- See every referral on the platform
- Assign open referrals (submitted with no chosen professional) to someone
- List or unlist any member

Referrals submitted while logged out are claimed automatically when someone signs
up with the same email address, so you can refer first and create an account later.

## Setup

```bash
npm install
cp .env.example .env     # then fill in your Supabase URL and anon key
npm run dev
```

Both env vars come from your Supabase project under **Project Settings → API**.
Until they are set the app runs but shows a banner explaining what is missing.

### Database

Run the migrations in `supabase/migrations/` in order, oldest first, through the
Supabase SQL editor (or `supabase db push` with the CLI).

`20260830120000_planlink_network_schema.sql` is the current schema. It replaces
the original prototype, so note:

- The old `referrers` table is **renamed** to `referrers_legacy` and cut off from
  the API rather than dropped. Check it for anything worth keeping, then drop it.
- The prototype's wide-open anon policies on `referrals` are removed.
- Commission tracking is removed entirely — no amounts, rates or payment status.

### Make yourself an administrator

Sign up through the app first, then run once:

```sql
UPDATE profiles SET is_admin = true WHERE lower(email) = lower('you@example.com');
```

`is_admin` is excluded from every API grant and guarded by a trigger, so it can
only be set from SQL. Nobody can promote their own account.

## Security model

| Who | Can read |
| --- | --- |
| Logged out | Listed professionals' public detail — **not** their email or phone |
| Member | Their own referrals (sent and received), their enquiries, listed profiles in full |
| Admin | Everything |

- Every table has row level security enabled.
- Logged-out visitors have **no** direct table grant on `referrals` or `enquiries`.
  Both public forms go through `SECURITY DEFINER` functions (`submit_referral`,
  `submit_enquiry`) that validate input and return only a reference number. This
  is what enforces "you may refer without an account, but you must sign in to see
  anything".
- The directory's privacy line is drawn with **column-level grants**, because RLS
  cannot filter columns. Selecting `*` as `anon` fails by design — see
  `PUBLIC_COLUMNS` in `src/db/profiles.ts`.

## Layout

```
src/
  auth/          session + profile context (AuthProvider, useAuth)
  db/            one module per table; maps snake_case rows to camelCase types
  lib/           types, constants, formatting, Supabase client
  components/
    brand/       LogoMark, Wordmark, Logo — the mark is vector, not a bitmap
    ui/          Button, Field, Modal, Badge, Alert, Avatar…
    layout/      PublicLayout, AppLayout, AuthLayout, ProtectedRoute
  pages/
    public/      Home, Directory, ProfessionalProfile, ReferClient, About
    auth/        SignIn, Join, ForgotPassword, ResetPassword
    app/         Dashboard, Referrals (sent/received), Enquiries, Profile, Admin
```

## Brand

Forest green `#0B4A2F` and gold `#D9A62A`, available as the `forest` and `gold`
Tailwind scales. Montserrat for display and the wordmark, Inter for body.

The logo is drawn as inline SVG in `src/components/brand/LogoMark.tsx`, so it stays
sharp at any size and can be recoloured for dark headers (`tone="onDark"`). To use
the original artwork instead, drop the files into `public/` and swap the component
out — `public/favicon.svg` holds the same geometry as a standalone file.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on :5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
