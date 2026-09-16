# Smelloff Mission Control (this directory)

Founder operating system preview — **not** a replacement for production `admin.smelloff.in`.

Production Admin stays the vanilla SPA at the repo root (`index.html`, `api/admin.js`, HttpOnly + TOTP). This folder is the attention-first OS built 2026-09-16: Action Center, object pages, ⌘K, evidence Operator, P0 email playbook.

Commercial rules are unchanged: OS-001-50ML / alias ODS-50, ₹229, ₹60 COD, integer paise, inventory ledger, IST.

Do not point the existing Admin Vercel project’s root at this directory. Deploy it as its own project (`rootDirectory: mission-control`) with `DATABASE_URL` (Neon). Without that env, PGLite is preview-only and production will fail closed.
