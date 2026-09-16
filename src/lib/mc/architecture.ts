/** Phase 0 maps. Production facts from git audit; this preview is a DEMO OS. */

export const kill = [
  "Dual-write catalog SKU. Storefront truth is OS-001-50ML; ODS-50 is an alias only.",
  "LLM as source of truth for money, stock, or incidents.",
  "Replacing inventory_movements with stored counters.",
  "New Vercel Hobby functions past the 12-function cap.",
  "Publishing formula percentages.",
  "Inventing DKIM CNAME values.",
  "Silent price / SKU / tax / COD / shipping edits.",
  "Treating configured credentials as operational proof.",
  "Calling email reliable while public.email_events is missing (PGRST205).",
  "Cart / review mail while the send ledger cannot persist.",
  "CAC or ad ROAS from DEMO daily_facts.ad_spend_paise.",
  "LTV as AOV × a multiplier.",
];

export const keep = [
  "Money as integer paise. IST everywhere.",
  "Inventory as an append-only ledger; ATP is derived.",
  "₹229 prepaid / ₹60 COD / collectable ₹289 — server-enforced.",
  "Claim: up to 8 hours on fabric; clothing only; no shoes/helmets.",
  "Action score = severity × financialImpact × urgency × confidence. No LLM.",
  "Fail closed. Missing data renders DATA UNAVAILABLE.",
  "Production Admin: HttpOnly cookie + CSRF + TOTP + RBAC.",
  "Atomic Shiprocket fulfillment claim; Razorpay payment.captured as prepaid source.",
  "persistEmailEvent pattern — harden classification, do not invent a second table.",
];

export const evolve = [
  "Mission Control as attention-first OS (this app) — not a 466KB dashboard clone.",
  "Apply 20260915_email_events.sql + NOTIFY pgrst in production (owner SQL editor).",
  "Classify PGRST205 as SCHEMA_MISMATCH, still fail visible, still do not block send.",
  "Object pages (order, customer, SKU, payment) instead of filter dumps.",
  "Command palette + evidence-grounded operator.",
  "Automations with trigger / condition / action / guardrail / cooldown / kill switch.",
  "Contribution only with window, formula, and ESTIMATE/UNAVAILABLE labels.",
  "Function-budget freeze: fold routes, never add a 13th.",
];

export const maps = {
  A: {
    title: "Current architecture",
    body: [
      "Buyer → smelloff.in (Brxinee/Smelloff @ c1a4e21, Vercel Hobby, 12 serverless functions). Checkout totals are verified server-side (price × qty + COD). Prepaid confirmation is Razorpay webhook payment.captured. Manual UPI is a second Admin path.",
      "Data plane → shared Supabase project tnuqjydmoxczdjnsgpci. Storefront writes orders/payments; Admin writes inventory ledger + operator actions. PostgREST schema cache currently missing public.email_events (PGRST205) despite git migration 20260915_email_events.sql.",
      "Side effects → Resend (From: orders@smelloff.in), Shiprocket, Meta CAPI drain cron 03:00 UTC, Shiprocket sync 10:00 UTC. WhatsApp is wa.me links only.",
      "Operator → admin.smelloff.in (Brxinee/Admin @ 17fd2d6, private). HttpOnly session, CSRF, TOTP, RBAC. Vanilla HTML SPA (~466KB index, ~320KB api/admin.js). Action engine is deterministic (lib/overview-actions.mjs).",
      "This preview → Smelloff Mission Control. Auth OFF, Database ON (PGLite in preview, Neon when deployed). DEMO ledger, masked identity. Not a production Admin replacement and not connected to live Supabase.",
    ],
  },
  B: {
    title: "Source of truth",
    body: [
      "Commercial spec lives in Smelloff config/product.json. This app mirrors it in src/lib/mc/commerce.ts and refuses to invent prices, SKUs, or claims.",
      "Conflicts are named: operator brief SKU ODS-50 vs catalog OS-001-50ML. Alias in search; do not rename the bottle.",
      "Live matrix is on this page (table below) from source_of_truth rows — status P0 / WATCH / OK.",
    ],
  },
  C: {
    title: "UX architecture",
    body: [
      "Attention home is the product. Ranked actions, then pulse, then change, then health. Not 12 equal dashboard cards.",
      "Object-centric: order, customer, payment, SKU. Tables are indexes into objects.",
      "Command palette (⌘K) is Linear-shaped search across orders, customers, incidents, destinations.",
      "Operator (⌘J) is Shopify Sidekick-shaped but evidence-bound: deterministic facts first, optional grok-4.5 polish, never a new number.",
      "Automations are Shopify Flow-shaped: trigger → condition → action → guardrail → cooldown → retry → escalation.",
      "Numbers obey Triple Whale: same definition on every screen; contribution ≠ booked revenue; LTV withheld.",
      "Storefront loop (not rebuilt here): Baymard — shipping cost on PDP, delivery dates not speeds, no hidden ₹60 at pay.",
    ],
  },
  D: {
    title: "Data architecture",
    body: [
      "Events append-only (operational_events, inventory_movements, audit_log, email_events, email_webhook_events).",
      "Actions are derived work items with score, owner, evidence, outcome. Mutations write action_outcomes + audit_log.",
      "Money is integer paise. Inventory ATP = sellable IN + committed net (one-sided DEMO transfers — not a WMS double-entry).",
      "daily_facts.ad_spend_paise is a DEMO placeholder and is never shown as spend. Sessions today is DATA UNAVAILABLE until the analytics day closes.",
      "Production email_events: git has the table; runtime schema cache does not. This preview has the table so the object model can be operated.",
    ],
  },
  E: {
    title: "Automation architecture",
    body: [
      "Five seeded automations: UPI escalation, review request, cart recovery, cover watch, outbound kill switch.",
      "Cart recovery and review request are blocked while the production email ledger is missing. Kill switch is ON.",
      "No automation auto-marks paid, auto-purchases inventory, or retries a hard bounce.",
      "Enable/disable is audited. Preview toggles the DEMO row only.",
    ],
  },
  F: {
    title: "Security architecture",
    body: [
      "Production Admin already has login, TOTP, RBAC, HttpOnly cookies, CSRF (2026-09-16). Do not copy tokens to localStorage.",
      "This preview is Auth OFF by App Builder contract (single-founder DEMO, unowned rows). Deployed it is world-writable DEMO data — no real PII is stored.",
      "No .env. No service-role keys. No invented DKIM. Credentials ≠ operational.",
      "Side effects that send email/SMS/money stay in production repos. This OS records intent and DEMO ledger mutations only.",
    ],
  },
  G: {
    title: "Research → Smelloff",
    body: [
      "Shopify admin 2026: search + notifications in the rail; Sidekick is a floating chat, not a page. Pulse is a feed of what changed. We copied the shape: Attention + ⌘K + Operator FAB.",
      "Linear: ⌘K is the operating system. Every object is addressable by code (SMF-…, C-…, P0-…).",
      "Triple Whale: one number, one definition. Booked vs realised are separate. Contribution requires COGS + window. Ad spend disconnected → CAC is DATA UNAVAILABLE.",
      "Baymard: hidden costs drive ~39% checkout abandonment; shipping belongs on the PDP; promise dates not ‘3–5 days’ speeds. Storefront already has prepaid free / COD ₹60 — do not hide the fee. Delivery-date copy is a storefront evolve, not a price change.",
      "Gorgias / Klaviyo / Loop / Recharge: ticket and lifecycle tools are not the OS. Smelloff volume does not justify a second inbox. Email is transactional + one review request, kill-switched until the ledger exists.",
      "Stripe-grade money: integer minor units, idempotent verify, no lookup-then-write on payments.",
    ],
  },
};

export const roadmap = [
  { when: "This week", item: "P0: apply 20260915_email_events.sql in production SQL editor, NOTIFY pgrst, prove a test send writes a row. Do not mark email Verified from git existence.", owner: "founder / Smelloff repo" },
  { when: "Week 1", item: "Harden persistEmailEvent: classify PGRST205 as SCHEMA_MISMATCH; keep send; make failure visible in Admin/MC. Do not add a 13th function.", owner: "Smelloff" },
  { when: "Week 2", item: "Resend domain Verified from the owner dashboard. Do not invent DKIM. Keep From orders@smelloff.in. SPF/DMARC watch stays open until evidence.", owner: "founder DNS" },
  { when: "Week 3", item: "Wire production probes into Mission Control health (this OS already has the object model). Keep Vercel cap.", owner: "Admin + MC" },
  { when: "Week 4", item: "Order + customer 360 in production Admin or graduate this OS. Phone remains identity; email is comms.", owner: "Admin" },
  { when: "Week 5", item: "Inventory ATP + forecast with a fitted daily demand once ≥30 realised days exist. Until then keep INFERRED.", owner: "Admin ledger" },
  { when: "Week 6", item: "Turn on review-request automation only after email_events insert + webhook update are proven. Cart recovery last.", owner: "Smelloff crons" },
  { when: "Week 7", item: "Contribution with real COGS (not ₹23.70 ESTIMATE) and still no ad-spend fiction.", owner: "Finance" },
  { when: "Week 8", item: "Connect ad platforms or keep CAC as DATA UNAVAILABLE. Never use DEMO daily_facts.ad_spend.", owner: "Marketing" },
  { when: "Week 9", item: "Storefront Baymard pass: delivery dates on PDP, COD fee visible before pay. No commercial-rule edits.", owner: "Smelloff storefront" },
  { when: "Week 10", item: "Function-budget audit. Fold diagnostics. Refuse new routes that break Hobby.", owner: "both repos" },
  { when: "Week 11–12", item: "Incident reviews, live health, freeze commercial rules, retrospect P0. Kill anything that bypasses the ledger.", owner: "founder" },
];
