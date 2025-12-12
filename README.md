# MITUGYM Admin Panel

A production-ready staff dashboard for managing the MITUGYM ecosystem. Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind v4**, **shadcn/ui-inspired components**, and **Supabase** for authentication, persistence, and server actions.

## Features

- 🔐 **Authentication & security**: Supabase Auth guard for `staff`/`admin` roles, rotating TOTP QR verification for check-ins, and centralized rate limiting + audit/API logs.
- 👥 **Members & plans**: Create, edit, filter, sort, and export member records; manage membership plans with inline editing and CSV export; detail views surface recent check-ins.
- ✅ **Check-ins**: Live activity feed with occupancy badge, denial reasons, and method labels; backed by Supabase `checkins` data and occupancy helper.
- 🗞️ **News & announcements**: Tiptap rich text editor with priority + expiry and spotlight rendering on the dashboard.
- 🗓️ **Weekly schedule**: Per-day open/close editor, toggleable closed days, and timezone-aware rendering alongside charts.
- 📦 **Services & bookings**: Service catalog management, purchased service approvals, and session bookings with per-status metrics.
- ⚙️ **Settings & observability**: Timezone/time-format controls, rate-limit tuning, audit trail, and API log browser.
- 📊 **Dashboard**: Occupancy chart, metrics for members/expiring plans/bookings/services, latest check-ins, and announcement highlights.

Every server mutation is implemented with **Next.js Server Actions** using the Supabase service-role client and automatically appends to the audit tables.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the `.env.example` file and provide your Supabase project credentials:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ Use the **service role key** only on the server (Next.js server actions). Never expose it to the browser.

### 3. Supabase schema expectations

The app expects the following tables/functions (adjust names if your schema differs):

- `profiles` (members, with `totp_secret` column for QR security)
- `membership_plans`
- `checkins`
- `announcements`
- `gym_schedule`
- `audit_logs_enhanced`
- `session_bookings`
- `services`
- `purchased_services`
- `app_settings`
- `api_logs`
- SQL function `current_occupancy()` returning `{ total: number, capacity?: number }`
- SQL function `get_expiring_members_count()` returning a numeric count

Each mutation inserts an audit log row with `actor_id`, `action`, `entity`, and optional `metadata` JSON.

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with a staff/admin user.

### 5. Run tests

```bash
npm run test
```

Vitest runs a basic regression suite covering the member form validation and the reusable DataTable.

## Project structure

```
src/
  app/
    (auth)/login                 # Public login route with email/password form
    (protected)/                 # Auth-guarded pages & server actions
      dashboard                  # Metrics, chart, spotlight announcements, live services
      members                    # Lists, detail modal, CSV export, avatar preview, actions
      plans                      # Plan CRUD, inline price edits, status toggles
      checkins                   # Live feed w/ occupancy badge, denial reasons, filters
      news                       # Announcement composer (Tiptap) + listing
      schedule                   # Weekly hours editor w/ per-day toggles and timezone hints
      bookings                   # Session bookings w/ status metrics and filtering
      services                   # Service catalog, purchased services, and approvals
      settings                   # Timezone/time-format, rate limits, audit/API logs
      system                     # System-level server actions (cleanup/import helpers)
    api/                         # Route handlers for check-in/TOTP and asset delivery
  components/
    ui                           # Button/card/input/table primitives (shadcn-inspired)
    dashboard                    # Metric cards, occupancy chart, quick links, spotlight
    members/news/plans/...       # Feature-specific widgets and tables
    providers                    # Theme, query, and Supabase providers
  lib/                           # Supabase clients, auth guard, rate limits, csv/export,
                                 # timezone helpers, TOTP, and data fetchers
  schemas/                       # Zod schemas shared by forms and actions
  constants/                     # Static option lists, nav config, filters
  types/                         # Shared TypeScript types (members, plans, services, etc.)
  hooks/                         # Custom hooks (e.g., mobile nav)

docs/                            # API references and TOTP/schedule diagrams
supabase/                        # SQL helpers and status migrations
public/                          # Static assets, icons, and splash media
```

### Notable supporting files

- `src/app/(protected)/actions.ts` and `actions-new.ts` centralize server actions used
  across pages (insert/update helpers with audit logging).
- `src/lib/data.ts` supplies SSR data fetchers for dashboard metrics, schedule, and
  booking summaries; replace fallback data with live Supabase queries.
- `src/lib/auth.ts` exposes `requireStaff()` to gate protected routes and return the
  authenticated Supabase session.
- `src/components/data-table` contains the reusable table shell used across members,
  plans, services, and bookings.
- `docs/CHECKIN_API.md`, `docs/GYM_SCHEDULE_API.md`, and `docs/TOTP_QR_SYSTEM.md`
  outline the expected request/response shapes for the primary API surfaces.

## Key routes & workflows

- **Dashboard** (`/dashboard`): Occupancy chart aligned to schedule/timezone, quick metrics, recent check-ins, and announcement spotlight cards.
- **Members** (`/members`): Member list with filters, CSV export, avatar preview, and detail modal showing recent check-ins.
- **Membership Plans** (`/plans`): Plan catalog with inline price edits, status toggles, CSV export, and per-plan membership counts.
- **Services** (`/services`): Service catalog manager plus purchased service approvals and status controls.
- **Bookings** (`/bookings`): Session bookings table with per-status metrics, filters, and detail drawers.
- **Check-ins** (`/checkins`): Live feed with occupancy badge, denied-reason badges, and method labels; powered by Supabase `checkins` data.
- **News** (`/news`): Announcement composer (Tiptap) with expiry/priority and listing views.
- **Schedule** (`/schedule`): Weekly operating hours editor with per-day toggles and timezone hints.
- **Settings** (`/settings`): Timezone/time-format controls, rate-limit thresholds, audit log viewer, and API log browser.

## API surface

- **Check-in verification**: `/api/checkin` and `/api/checkin/verify` accept QR payloads (legacy member IDs or rotating `member_id:totp` codes), validate TOTP when enabled, and return structured errors for denied scans.
- **TOTP setup**: `/api/member/totp-setup/[memberId]` generates and stores a member TOTP secret plus an otpauth URI for provisioning.

## Styling & UI

- Tailwind v4 with a bespoke dark theme and rounded surfaces.
- Custom components inspired by shadcn/ui (button, card, input, table, etc.).
- Recharts powers the dashboard traffic visualization.

## Supabase clients

- `lib/supabase-browser.ts` – browser client for auth session handling.
- `lib/supabase-admin.ts` – service-role client for server actions.
- `lib/auth.ts` – `requireStaff()` guard and server-side Supabase helper.

## Notes & next steps

- Replace sample fallback data in `lib/data.ts` with live Supabase data once credentials are configured.
- Consider enabling real-time subscriptions (Supabase Realtime) for live check-in updates.

## License

MIT © 2025 pateutz1
