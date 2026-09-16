# Smelloff Mission Control (founder OS)

Attention-first operating system for ODORSTRIKE / Smelloff. **This folder is not a replacement for production `admin.smelloff.in`.**

Production Admin stays the vanilla SPA at the repo root (`index.html`, `api/admin.js`, HttpOnly cookies + TOTP + RBAC, 12 Vercel functions). Do not point that Vercel project's root at this directory.

## What this is

A TanStack Start app: Action Center, object pages (orders / customers / payments / inventory), ⌘K command palette, evidence-grounded Operator, automations, incidents, architecture map.

Commercial rules are unchanged:

- SKU `OS-001-50ML` (operator alias `ODS-50`)
- 50ml · ₹229 · ₹60 COD
- Money as integer paise
- Inventory as a ledger
- Timezone IST
- Claims: up to 8 hours on fabric, clothing only
- Formula percentages are never published

Seeded rows are labelled **DEMO**. Every number has formula, window, filters, and provenance. Missing data fails closed (`DATA UNAVAILABLE`), it is never invented.

## Deploy

Ship as its **own** Vercel project:

- Git: `Brxinee/Admin`
- Root Directory: `mission-control`
- Project name: `smelloff-mission-control` (never reuse project `smelloff`)
- Env: `DATABASE_URL` (Neon / Postgres). Without it, serverless PGLite is not production-safe.

Auth is **off** in this preview OS (`VITE_AUTH_ENABLED=false`). Production Admin login stays on `admin.smelloff.in`.

## P0 — `public.email_events`

Git has `supabase/migrations/20260915_email_events.sql` in `Brxinee/Smelloff`. Production PostgREST still 404s `email_events` (`PGRST205`). Persist now classifies that as `SCHEMA_MISMATCH`; Resend send still proceeds. Apply the 20260915 table migration in Supabase if missing, then `NOTIFY pgrst, 'reload schema';` (see Smelloff `20260916_email_events_reload.sql`). Do not treat git presence as proof the schema cache is live.
