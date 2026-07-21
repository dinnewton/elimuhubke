# Tusome

A learning platform connecting Kenyan students with teachers for live, hourly
tutoring (CBC and 8-4-4 curricula) plus a marketplace for teacher-made notes
and past papers. Payments and weekly teacher payouts run through M-Pesa.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **PostgreSQL** via **Prisma 7** (`@prisma/adapter-pg` driver adapter)
- Custom cookie-session auth (`jose` JWT + scrypt password hashing) — see
  `src/lib/auth.ts`, `src/lib/session.ts`
- **M-Pesa Daraja** (STK Push for payments, B2C for teacher payouts) —
  `src/lib/mpesa.ts`, with a **sandbox mock mode** that activates automatically
  when no Daraja credentials are configured
- Live sessions embed **Jitsi Meet** (no API key required) — Jitsi's
  built-in collaborative whiteboard is available from the in-call toolbar
  ("more options" if not shown directly), so teachers can draw and
  demonstrate live with no extra integration needed
- Teachers can send exercises (title, instructions, optional file) tied to a
  booking; students respond with their own file + note. Reachable from the
  booking detail pages (`/student/bookings/[id]`, `/teacher/bookings/[id]`)
  and from a slide-over panel inside the live session itself

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
| `PLATFORM_COMMISSION_PERCENT` | Default commission %, seeded into `PlatformSettings` |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja API credentials. **Leave blank for sandbox mock mode.** |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | STK Push (Lipa Na M-Pesa Online) shortcode + passkey |
| `MPESA_INITIATOR_NAME` / `MPESA_INITIATOR_PASSWORD` / `MPESA_B2C_SHORTCODE` | B2C payout credentials |
| `PAYOUT_JOB_SECRET` | Reserved for a scheduled/cron trigger of the payout job |

**Sandbox mock mode:** with `MPESA_CONSUMER_KEY` unset, `src/lib/mpesa.ts`
fakes STK Push and B2C responses instantly instead of calling Safaricom. The
payment status page shows "Simulate success / failure" buttons so the whole
booking → pay → confirm flow (and the weekly payout run) can be exercised
without real Daraja credentials. Drop in real sandbox or production keys and
mock mode turns off automatically.

### Demo data

`npx prisma db seed` creates:

- Admin — `admin@tusome.com` / `Admin1234!`
- Teacher (verified) — `teacher@tusome.com` / `Teacher1234!`
- Student — `student@tusome.com` / `Student1234!`
- A handful of CBC/8-4-4 subjects with rate cards, sample availability, and
  one published document.

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
- **Documents** are stored on local disk under `/uploads` (gitignored) and
  served through an authenticated download route
  (`/api/documents/[id]/download`) that checks ownership or a successful
  purchase.

## Notes on the stack version

This project pins to **Next.js 16**, which changed some conventions from
earlier versions worth knowing before editing:

- `middleware.ts` → `proxy.ts` (`src/proxy.ts`)
- `params`/`searchParams` are `Promise`s in Server Components
- shadcn/ui here is built on **Base UI**, not Radix — composition uses a
  `render` prop instead of `asChild` (see `src/components/ui/button.tsx`)
- Prisma 7 requires an explicit driver adapter (`@prisma/adapter-pg`) rather
  than reading `DATABASE_URL` implicitly at the client — see `src/lib/db.ts`
