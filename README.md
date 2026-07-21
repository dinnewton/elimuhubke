# Tusome

A learning platform connecting Kenyan and international students with
teachers for live, hourly tutoring — CBC, 8-4-4, IGCSE, American and IB
curricula, plus Swahili lessons for international visitors — with a
marketplace for teacher-made notes and past papers. Payments and weekly
teacher payouts run through M-Pesa.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **PostgreSQL** via **Prisma 7** (`@prisma/adapter-pg` driver adapter)
- Custom cookie-session auth (`jose` JWT + scrypt password hashing), plus a
  token-based password reset flow — see `src/lib/auth.ts`,
  `src/lib/session.ts`, `src/lib/actions/auth-actions.ts`
- **M-Pesa Daraja** (STK Push for payments, B2C for teacher payouts) —
  `src/lib/mpesa.ts`, with a **sandbox mock mode** that activates automatically
  when no Daraja credentials are configured
- **File storage** via Cloudflare R2 (S3-compatible) — `src/lib/storage.ts`,
  with a **local-disk fallback** under `/uploads` when no R2 credentials are
  configured (local dev needs no cloud account)
- **Transactional email** via Resend — `src/lib/email.ts`, with a
  **console-log fallback** when no `RESEND_API_KEY` is configured
- Live sessions embed **Jitsi Meet** (no API key required) — Jitsi's
  built-in collaborative whiteboard is available from the in-call toolbar
  ("more options" if not shown directly), so teachers can draw and
  demonstrate live with no extra integration needed
- Teachers can send exercises (title, instructions, optional file) tied to a
  booking; students respond with their own file + note. Reachable from the
  booking detail pages (`/student/bookings/[id]`, `/teacher/bookings/[id]`)
  and from a slide-over panel inside the live session itself

Three external services follow the same pattern throughout this codebase:
**if the relevant env vars are unset, the feature runs in a safe local mock
mode instead of failing.** M-Pesa, file storage, and email all work this way
— see `mpesaMockMode`, `remoteStorageEnabled`, and `emailMockMode`. This is
what lets local dev run with zero cloud accounts, and is also why deploying
to production is mostly a matter of setting environment variables.

## Getting started

```bash
npm install
npx prisma migrate dev   # applies the schema to DATABASE_URL from .env
npx prisma db seed       # optional: demo data + logins (see below)
npm run dev
```

Open http://localhost:3000.

### Environment

Copy the values in `.env` (already configured for the local Postgres role
created during setup: `tusome` / `tusome_dev_pw` on `localhost:5433`,
database `tusome_dev`). Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Signs session JWTs — replace before deploying |
| `NEXT_PUBLIC_APP_URL` | Base URL used to build links in emails (password reset, etc.) |
| `PLATFORM_COMMISSION_PERCENT` | Default commission %, seeded into `PlatformSettings` |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja API credentials. **Leave blank for sandbox mock mode.** |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | STK Push (Lipa Na M-Pesa Online) shortcode + passkey |
| `MPESA_INITIATOR_NAME` / `MPESA_INITIATOR_PASSWORD` / `MPESA_B2C_SHORTCODE` | B2C payout credentials |
| `PAYOUT_JOB_SECRET` | Reserved for a scheduled/cron trigger of the payout job |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 credentials. **Leave blank for local-disk storage.** |
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend email credentials. **Leave blank to log emails to the console.** |

**Sandbox mock mode:** with `MPESA_CONSUMER_KEY` unset, `src/lib/mpesa.ts`
fakes STK Push and B2C responses instantly instead of calling Safaricom. The
payment status page shows "Simulate success / failure" buttons so the whole
booking → pay → confirm flow (and the weekly payout run) can be exercised
without real Daraja credentials. Drop in real sandbox or production keys and
mock mode turns off automatically.

### Demo data

`npx prisma db seed` creates:

- Admin — `admin@tusome.com` / `Admin1234!`
- Teacher, CBC/8-4-4 (verified) — `teacher@tusome.com` / `Teacher1234!`
- Teacher, Swahili for foreigners (verified) — `swahili@tusome.com` / `Teacher1234!`
- Student, CBC — `student@tusome.com` / `Student1234!`
- Student, international visitor — `visitor@tusome.com` / `Student1234!`
- Subjects with rate cards across all six curricula, sample availability, and
  published documents for both teachers.

## How the business rules map to the code

- **Rates are set by the platform, not teachers** — `RateCard` per `Subject`,
  managed at `/admin/subjects`. Booking totals are computed from the slot
  duration × the subject's rate at booking time.
- **Weekly payouts** — `src/lib/payouts.ts` aggregates `COMPLETED` bookings
  and `SUCCESS` document sales from the prior Mon–Sun week that haven't been
  paid out yet, deducts the platform commission (`PlatformSettings`), and
  triggers an M-Pesa B2C payment per teacher. Triggered manually from
  `/admin/payouts` for now; wire `PAYOUT_JOB_SECRET` + a scheduler (cron /
  Windows Task Scheduler / Vercel Cron) to a protected route to automate it.
- **Documents, exercises, and exercise submissions** are stored via
  `src/lib/storage.ts` (R2 in production, local disk under `/uploads` in dev)
  and served through authenticated download routes that check ownership or a
  successful purchase before returning bytes.

## Production deployment

This app is set up to deploy to **Vercel**, with **Neon** for Postgres and
**Cloudflare R2** for file storage — all have generous free tiers, so you can
get a live production URL without spending anything up front. M-Pesa stays
in sandbox mode until you have real Safaricom Daraja credentials; everything
else is fully live.

### 1. Push the code to GitHub

The repo is already git-initialized locally. Create an empty repository on
GitHub, then:

```bash
git remote add origin https://github.com/<your-username>/tusome.git
git branch -M main
git push -u origin main
```

### 2. Create a Neon Postgres database

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy the **pooled** connection string (the one with `-pooler` in the
   hostname — this routes through PgBouncer, which matters because Vercel
   serverless functions open many short-lived connections). Append
   `?sslmode=require` if it isn't already there.
3. This becomes `DATABASE_URL` in the next step.

### 3. Create a Cloudflare R2 bucket

1. Sign up at [Cloudflare](https://dash.cloudflare.com) → R2 → **Create bucket**
   (any name, e.g. `tusome-uploads`).
2. R2 → **Manage API tokens** → create a token with **Object Read & Write**
   access scoped to that bucket. Note the **Access Key ID**, **Secret Access
   Key**, and your **Account ID** (shown on the R2 overview page).
3. These become `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`,
   and `R2_BUCKET_NAME`. The bucket can stay private — all downloads go
   through Tusome's own authenticated routes, never directly from R2.

### 4. Create a Resend account

1. Sign up at [resend.com](https://resend.com) and create an API key —
   this becomes `RESEND_API_KEY`.
2. Without a verified domain, Resend only lets you send to your own account
   email from `onboarding@resend.dev` — fine for testing, too restrictive for
   real users. Once you have a domain (see step 6), verify it in Resend and
   set `EMAIL_FROM` to an address on it, e.g. `Tusome <noreply@yourdomain.com>`.

### 5. Deploy to Vercel

1. Sign up at [vercel.com](https://vercel.com) and **Import Project** from
   your GitHub repo. Vercel auto-detects Next.js — no config changes needed.
2. Before the first deploy, add these Environment Variables in the Vercel
   project settings (Production, and Preview if you want preview deploys to
   work too):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled connection string from step 2 |
   | `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://tusome.vercel.app` |
   | `PLATFORM_COMMISSION_PERCENT` | `20` (or your rate) |
   | `PAYOUT_JOB_SECRET` | Another random string from the command above |
   | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | From step 3 |
   | `RESEND_API_KEY`, `EMAIL_FROM` | From step 4 |
   | `MPESA_*` | Leave all blank until you have Daraja credentials (sandbox mock mode stays on) |

3. Deploy. Vercel runs `npm install` (which triggers `postinstall: prisma
   generate`) then `npm run build`.
4. Run the initial migration against the production database — from your
   machine, with `DATABASE_URL` temporarily set to the Neon connection
   string:

   ```bash
   DATABASE_URL="<neon-connection-string>" npx prisma migrate deploy
   ```

   (On Windows PowerShell: `$env:DATABASE_URL="<neon-connection-string>"; npx prisma migrate deploy`.)
   Re-run this after every future migration, before or right after deploying.
5. Optionally seed demo data the same way: `npx prisma db seed` with
   `DATABASE_URL` pointed at production — or skip it and create your first
   real admin account by seeding just the admin user, since there's currently
   no signup flow for the admin role (by design — sign up as a student or
   teacher through the UI, then promote to admin manually via SQL or a
   one-off script if needed).

### 6. Custom domain (whenever you're ready)

Buy a domain from any registrar, then in Vercel: Project Settings → Domains
→ add it, and follow the DNS instructions Vercel shows (usually a single A
or CNAME record). Update `NEXT_PUBLIC_APP_URL` to the new domain and
redeploy — this is also when you should verify the domain in Resend so
`EMAIL_FROM` can send to any recipient, not just your own inbox.

### 7. Going live with real M-Pesa

Safaricom's production Daraja access requires a registered paybill or till
number and a business review, which happens outside of this codebase and
can take some time. Once approved:

1. Fill in `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`,
   `MPESA_PASSKEY`, `MPESA_INITIATOR_NAME`, `MPESA_INITIATOR_PASSWORD`,
   `MPESA_B2C_SHORTCODE` in Vercel with your production values, and set
   `MPESA_ENV=production`.
2. Set the three `MPESA_*_URL` callback variables to your real domain, e.g.
   `https://yourdomain.com/api/mpesa/stk-callback` — Safaricom needs these
   to be publicly reachable HTTPS URLs, which they will be once deployed.
3. Safaricom's application typically asks for a **Privacy Policy URL**
   (`/privacy`) and **Terms of Service URL** (`/terms`) — both already exist
   in this app. Have them reviewed by a lawyer before relying on them; the
   copy here is a reasonable starting point, not legal advice.
4. Redeploy. Sandbox mock mode turns off automatically the moment
   `MPESA_CONSUMER_KEY` is set — test with small real amounts first.

### Production checklist recap

- [ ] Code pushed to GitHub
- [ ] Neon database created, pooled `DATABASE_URL` in Vercel
- [ ] `npx prisma migrate deploy` run against production DB
- [ ] R2 bucket + credentials in Vercel
- [ ] Resend API key in Vercel (domain verified once you have one)
- [ ] Strong random `SESSION_SECRET` and `PAYOUT_JOB_SECRET` in Vercel (not the dev placeholders)
- [ ] First deploy succeeds, demo/admin account created
- [ ] Custom domain connected (optional, whenever ready)
- [ ] Privacy Policy / Terms reviewed by a lawyer before real users sign up
- [ ] M-Pesa production credentials added once Safaricom approves (optional for launch — sandbox mock mode works fine for a soft launch)

## Notes on the stack version

This project pins to **Next.js 16**, which changed some conventions from
earlier versions worth knowing before editing:

- `middleware.ts` → `proxy.ts` (`src/proxy.ts`)
- `params`/`searchParams` are `Promise`s in Server Components
- shadcn/ui here is built on **Base UI**, not Radix — composition uses a
  `render` prop instead of `asChild` (see `src/components/ui/button.tsx`)
- Prisma 7 requires an explicit driver adapter (`@prisma/adapter-pg`) rather
  than reading `DATABASE_URL` implicitly at the client — see `src/lib/db.ts`
