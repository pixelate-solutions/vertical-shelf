# Tania's Pizza Wholesale Club

Members-only wholesale ordering for Tania's Pizza. The app uses Clerk for authentication, Supabase for data, Stripe for memberships and invoicing, and Resend for operational emails.

## Stack

- Next.js 16 App Router
- Clerk auth
- Supabase database
- Stripe subscriptions + billing portal
- Resend transactional email

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in the real values.

3. Run the app:

```bash
npm run dev
```

## Required env vars

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_SLICE_CLUB=
STRIPE_PRICE_WHOLESALE_MEMBER=
STRIPE_PRICE_BUSINESS_PARTNER=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
OWNER_EMAIL=
CRON_SECRET=
```

## External setup still required

### Clerk

- Create a Clerk application.
- Copy the publishable key and secret key into `.env.local`.
- Use email/password or whatever auth methods you want enabled in the Clerk dashboard.

### Supabase

- Create a Supabase project.
- Use Supabase's current hosted-platform key pair:
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
- Run the migrations with `supabase db push`, or paste the SQL from `supabase/migrations/` into the SQL editor in order.
- This app now uses Clerk for identity, so the schema no longer depends on Supabase Auth users.

### Stripe

- Create three recurring prices for:
  - Slice Club
  - Wholesale Member
  - Business Partner
- Paste the price IDs into:
  - `STRIPE_PRICE_SLICE_CLUB`
  - `STRIPE_PRICE_WHOLESALE_MEMBER`
  - `STRIPE_PRICE_BUSINESS_PARTNER`
- After deploy, register a webhook endpoint at:
  - `https://your-domain.vercel.app/api/webhooks/stripe`
- Listen for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

### Resend

- Add your API key.
- `RESEND_FROM_EMAIL` must use a verified sending domain.

### Owner access

- Set `OWNER_EMAIL` to the inbox that should receive reorder/custom request alerts.
- After your first sign-up, promote that account in Supabase:

```sql
update profiles
set is_owner = true
where email = 'you@example.com';
```

### Cron

- Generate a secret such as:

```bash
openssl rand -hex 32
```

- Put the same value in `CRON_SECRET` locally and in Vercel.

## Brand assets

Starter assets now live in `public/brand/`:

- `pizza-badge.svg`
- `dough-pattern.svg`

Replace those with final official logo files, product photography, or store imagery if you want the site to use Tania's exact brand system instead of the starter assets included here.

## Validation

```bash
npm run lint
npm run build
```
