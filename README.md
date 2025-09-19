# MITUGYM Admin Panel

A production-ready staff dashboard for managing the MITUGYM ecosystem. Built with **Next.js 15**, **TypeScript**, **Tailwind (v4)**, **shadcn/ui-inspired components**, and **Supabase** for authentication and data.

## Features

- 🔐 **Secure auth guard** for staff/admin roles using Supabase Auth (`staff_profiles.role_id in ['staff','admin']`).
- 👥 **Members**: create, edit, filter, sort, and export membership data to CSV. Detail view includes recent check-ins.
- 🪪 **Membership plans**: full CRUD workflow with inline editor and CSV export.
- ✅ **Check-ins**: live list with filters plus the "Occupancy now" card powered by a Supabase SQL function.
- 🗞️ **News & announcements**: Tiptap rich text editor with priority, expiry, and audit logging.
- 🗓️ **Weekly schedule** editor with open/close toggles for each weekday.
- 📜 **Audit log**: read-only table recording every mutation performed by staff.
- 📊 **Dashboard**: snapshot metrics, traffic chart (Recharts), latest check-ins, and spotlight announcements.

Every server mutation is implemented with **Next.js Server Actions** using the Supabase service-role client and automatically appends to the `audit_logs` table.

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

- `members`
- `membership_plans`
- `check_ins`
- `news`
- `gym_schedule`
- `audit_logs`
- `staff_profiles`
- SQL function `current_occupancy()` returning `{ total: number, capacity?: number }`

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
    (auth)/login               # Public login route
    (protected)/                # Auth-guarded pages & server actions
  components/                  # UI library, forms, layout, providers
  lib/                         # Supabase clients, auth helper, utilities, data fetchers
  schemas/                     # Zod schemas shared by forms and actions
  types/                       # Shared TypeScript types
```

## Styling & UI

- Tailwind v4 with a bespoke dark theme and 20px rounded surfaces.
- Custom components inspired by shadcn/ui (button, card, input, table, etc.).
- Recharts powers the dashboard traffic visualization.

## Supabase clients

- `lib/supabase-browser.ts` – browser client for auth session handling.
- `lib/supabase-admin.ts` – service-role client for server actions.
- `lib/auth.ts` – `requireStaff()` guard and server-side Supabase helper.

## Notes & next steps

- The mobile QR scanner is expected to call a future `/api/checkin` endpoint that validates members against the schedule and active plan — hooks are annotated in the code.
- Replace sample fallback data in `lib/data.ts` with live Supabase data once credentials are configured.
- Consider enabling real-time subscriptions (Supabase Realtime) for live check-in updates.

## License

MIT © 2025 pateutz1
