import type { Sql } from "@/lib/db";
import { PRODUCT } from "@/lib/mc/commerce";

const SKU = PRODUCT.catalogSku;

function iso(offsetMin: number, base = Date.now()) {
  return new Date(base - offsetMin * 60_000).toISOString();
}

export async function ensureSeeded(sql: Sql) {
  const existing = await sql<{ c: number }>`select count(*)::int as c from orders`;
  if ((existing[0]?.c ?? 0) > 0) return;

  await sql`
    insert into settings (key, value, provenance) values
    ('gst_rate', '0.18', 'CONFIG'),
    ('cod_fee_paise', '6000', 'COMMERCIAL_SPEC'),
    ('price_paise', '22900', 'COMMERCIAL_SPEC'),
    ('sku', ${SKU}, 'COMMERCIAL_SPEC'),
    ('review_after_days', '7', 'CONFIG'),
    ('cart_reminder_hours', '6', 'CONFIG'),
    ('low_stock_cover_days', '14', 'CONFIG'),
    ('lead_time_days', '9', 'CONFIG'),
    ('safety_stock_units', '12', 'CONFIG')
    on conflict (key) do nothing
  `;

  const customers = [
    ["C-1001", "C-1001", "Hyderabad", "Telangana", "+91••••4031", "n***@gmail.com", "meta", "cpc", "shirt-odor-apr", "2026-09-28"],
    ["C-1002", "C-1002", "Bengaluru", "Karnataka", "+91••••1182", "r***@gmail.com", "direct", "none", null, "2026-10-02"],
    ["C-1003", "C-1003", "Pune", "Maharashtra", "+91••••7740", "a***@icloud.com", "google", "organic", null, null],
    ["C-1004", "C-1004", "Mumbai", "Maharashtra", "+91••••2209", "k***@gmail.com", "instagram", "social", "office-commute", "2026-09-22"],
    ["C-1005", "C-1005", "Chennai", "Tamil Nadu", "+91••••6614", "s***@yahoo.com", "meta", "cpc", "fabric-mist", null],
    ["C-1006", "C-1006", "Hyderabad", "Telangana", "+91••••9088", "p***@gmail.com", "whatsapp", "referral", "founder", "2026-09-20"],
    ["C-1007", "C-1007", "Delhi", "Delhi", "+91••••4410", "m***@gmail.com", "google", "cpc", "brand", null],
    ["C-1008", "C-1008", "Ahmedabad", "Gujarat", "+91••••3351", "v***@gmail.com", "direct", "none", null, null],
  ] as const;

  for (const c of customers) {
    await sql`
      insert into customers (id, display_code, city, state, phone_masked, email_masked, acquisition_source, acquisition_medium, acquisition_campaign, predicted_reorder_on)
      values (${c[0]}, ${c[1]}, ${c[2]}, ${c[3]}, ${c[4]}, ${c[5]}, ${c[6]}, ${c[7]}, ${c[8]}, ${c[9]})
      on conflict (id) do nothing
    `;
  }

  type OrderRow = {
    id: string;
    code: string;
    customer: string;
    qty: number;
    method: "upi" | "cod" | "card";
    pay: string;
    fulfill: string;
    status: string;
    city: string;
    state: string;
    source: string;
    medium: string;
    campaign: string | null;
    device: string;
    placedMin: number;
    paidMin?: number;
    shippedMin?: number;
    deliveredMin?: number;
    cancelledMin?: number;
    rtoMin?: number;
    awb?: string;
    courier?: string;
    email?: string;
  };

  const orders: OrderRow[] = [
    { id: "o1", code: "SMF-20260916-0004", customer: "C-1001", qty: 1, method: "upi", pay: "pending_verify", fulfill: "hold", status: "upi_pending", city: "Hyderabad", state: "Telangana", source: "meta", medium: "cpc", campaign: "shirt-odor-apr", device: "mobile", placedMin: 41, email: "QUEUED" },
    { id: "o2", code: "SMF-20260916-0003", customer: "C-1004", qty: 2, method: "upi", pay: "pending_verify", fulfill: "hold", status: "upi_pending", city: "Mumbai", state: "Maharashtra", source: "instagram", medium: "social", campaign: "office-commute", device: "mobile", placedMin: 88, email: "QUEUED" },
    { id: "o3", code: "SMF-20260916-0002", customer: "C-1007", qty: 1, method: "upi", pay: "pending_verify", fulfill: "hold", status: "upi_pending", city: "Delhi", state: "Delhi", source: "google", medium: "cpc", campaign: "brand", device: "desktop", placedMin: 126, email: "FAILED" },
    { id: "o4", code: "SMF-20260916-0001", customer: "C-1002", qty: 1, method: "cod", pay: "cod_pending", fulfill: "to_pack", status: "confirmed", city: "Bengaluru", state: "Karnataka", source: "direct", medium: "none", campaign: null, device: "mobile", placedMin: 180, paidMin: 180, email: "SENT" },
    { id: "o5", code: "SMF-20260915-0012", customer: "C-1006", qty: 1, method: "upi", pay: "captured", fulfill: "to_pack", status: "confirmed", city: "Hyderabad", state: "Telangana", source: "whatsapp", medium: "referral", campaign: "founder", device: "mobile", placedMin: 980, paidMin: 970, email: "DELIVERED" },
    { id: "o6", code: "SMF-20260915-0009", customer: "C-1003", qty: 1, method: "cod", pay: "cod_pending", fulfill: "to_pack", status: "confirmed", city: "Pune", state: "Maharashtra", source: "google", medium: "organic", campaign: null, device: "desktop", placedMin: 1320, paidMin: 1320, email: "SENT" },
    { id: "o7", code: "SMF-20260914-0007", customer: "C-1005", qty: 1, method: "card", pay: "captured", fulfill: "shipped", status: "dispatched", city: "Chennai", state: "Tamil Nadu", source: "meta", medium: "cpc", campaign: "fabric-mist", device: "mobile", placedMin: 2600, paidMin: 2590, shippedMin: 1400, awb: "SR1234IN", courier: "Delhivery", email: "SENT" },
    { id: "o8", code: "SMF-20260912-0004", customer: "C-1008", qty: 2, method: "upi", pay: "captured", fulfill: "out_for_delivery", status: "out_for_delivery", city: "Ahmedabad", state: "Gujarat", source: "direct", medium: "none", campaign: null, device: "mobile", placedMin: 5400, paidMin: 5380, shippedMin: 2800, awb: "SR1188IN", courier: "Bluedart", email: "SENT" },
    { id: "o9", code: "SMF-20260908-0002", customer: "C-1001", qty: 1, method: "upi", pay: "captured", fulfill: "delivered", status: "delivered", city: "Hyderabad", state: "Telangana", source: "meta", medium: "cpc", campaign: "shirt-odor-apr", device: "mobile", placedMin: 11500, paidMin: 11490, shippedMin: 10000, deliveredMin: 7200, awb: "SR0911IN", courier: "Delhivery", email: "DELIVERED" },
    { id: "o10", code: "SMF-20260905-0006", customer: "C-1004", qty: 1, method: "cod", pay: "collected", fulfill: "delivered", status: "delivered", city: "Mumbai", state: "Maharashtra", source: "instagram", medium: "social", campaign: "office-commute", device: "mobile", placedMin: 15800, paidMin: 7200, shippedMin: 14000, deliveredMin: 11000, awb: "SR0882IN", courier: "Delhivery", email: "DELIVERED" },
    { id: "o11", code: "SMF-20260828-0003", customer: "C-1003", qty: 1, method: "cod", pay: "rto", fulfill: "rto", status: "rto", city: "Pune", state: "Maharashtra", source: "google", medium: "organic", campaign: null, device: "desktop", placedMin: 27400, paidMin: 27400, shippedMin: 25000, rtoMin: 18000, awb: "SR0710IN", courier: "Xpressbees", email: "SENT" },
    { id: "o12", code: "SMF-20260915-0004", customer: "C-1007", qty: 1, method: "upi", pay: "refund_due", fulfill: "cancelled", status: "cancelled", city: "Delhi", state: "Delhi", source: "google", medium: "cpc", campaign: "brand", device: "desktop", placedMin: 1600, paidMin: 1590, cancelledMin: 400, email: "SENT" },
  ];

  for (const o of orders) {
    const product = o.qty * PRODUCT.pricePaise;
    const fee = o.method === "cod" ? PRODUCT.codFeePaise : 0;
    const amount = product + fee;
    await sql`
      insert into orders (
        id, order_code, customer_id, sku, qty, product_paise, cod_fee_paise, amount_paise,
        payment_method, payment_status, fulfillment_status, status, city, state,
        source, medium, campaign, landing_page, device, awb, courier,
        placed_at, paid_at, shipped_at, delivered_at, cancelled_at, rto_at, email_status, provenance
      ) values (
        ${o.id}, ${o.code}, ${o.customer}, ${SKU}, ${o.qty}, ${product}, ${fee}, ${amount},
        ${o.method}, ${o.pay}, ${o.fulfill}, ${o.status}, ${o.city}, ${o.state},
        ${o.source}, ${o.medium}, ${o.campaign}, ${"/odorstrike"}, ${o.device}, ${o.awb ?? null}, ${o.courier ?? null},
        ${iso(o.placedMin)}, ${o.paidMin != null ? iso(o.paidMin) : null},
        ${o.shippedMin != null ? iso(o.shippedMin) : null},
        ${o.deliveredMin != null ? iso(o.deliveredMin) : null},
        ${o.cancelledMin != null ? iso(o.cancelledMin) : null},
        ${o.rtoMin != null ? iso(o.rtoMin) : null},
        ${o.email ?? null}, ${"DEMO"}
      )
      on conflict (id) do nothing
    `;
  }

  await sql`
    insert into payments (id, order_id, method, status, amount_paise, utr_masked, gateway, age_minutes, created_at) values
    ('p1','o1','upi','pending_verify',22900,'UTR••••8312','manual_upi',41, ${iso(41)}),
    ('p2','o2','upi','pending_verify',45800,'UTR••••2201','manual_upi',88, ${iso(88)}),
    ('p3','o3','upi','pending_verify',22900,null,'razorpay',126, ${iso(126)}),
    ('p4','o12','upi','refund_due',22900,'UTR••••4410','razorpay',400, ${iso(1600)})
    on conflict (id) do nothing
  `;

  const movements = [
    ["m1", "raw_materials", "in", 5000, "Purchase — HPβCD lot L-081", "founder", "PO-14", 20000],
    ["m2", "production", "in", 200, "Batch B-09 filled", "founder", "B-09", 18000],
    ["m3", "finished_goods", "in", 200, "B-09 to FG", "founder", "B-09", 17900],
    ["m4", "sellable", "in", 200, "QC pass B-09", "founder", "B-09", 17800],
    ["m5", "committed", "out", 7, "Committed to open unshipped orders (o1–o6 qty)", "system", "open-orders", 40],
    ["m6", "shipped", "out", 6, "Carrier handover o7–o11", "system", "shiprocket", 1400],
    ["m7", "delivered", "out", 2, "POD confirmed", "system", "shiprocket", 7200],
    ["m8", "rto", "in", 1, "RTO returned — inspect", "system", "SR0710IN", 18000],
    ["m9", "damaged", "out", 1, "RTO bottle dented — writeoff", "founder", "WO-03", 16000],
  ] as const;

  for (const m of movements) {
    await sql`
      insert into inventory_movements (id, sku, stage, direction, qty, reason, actor, ref_code, occurred_at, provenance)
      values (${m[0]}, ${SKU}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}, ${m[5]}, ${m[6]}, ${iso(m[7])}, ${"DEMO"})
      on conflict (id) do nothing
    `;
  }

  await sql`
    insert into incidents (id, code, title, service, severity, status, evidence, impact, recommended, first_seen_at, last_seen_at)
    values (
      'inc-p0-email',
      'P0-EMAIL-SCHEMA',
      'Production schema cache missing public.email_events',
      'email',
      'critical',
      'OPEN',
      ${"PGRST205 — Could not find table public.email_events in the schema cache. Migration supabase/migrations/20260915_email_events.sql exists in Brxinee/Smelloff @ c1a4e21. persistEmailEvent() POSTs to /rest/v1/email_events and logs DATABASE_FAILURE on 404 — send still proceeds, ledger does not. No NOTIFY pgrst in the migration. persistEmailEvent still reads SUPABASE_SERVICE_ROLE_KEY only."},
      ${"Transactional send ledger is not durable. Duplicate suppression via email_events uniqueness cannot fire. Bounce/webhook mapping cannot persist. Do not call email reliable until schema and application agree."},
      ${"1. In Smelloff Supabase SQL editor, run 20260915_email_events.sql (idempotent CREATE IF NOT EXISTS). 2. NOTIFY pgrst, 'reload schema'. 3. Verify pg_tables + a service-role POST. 4. Do not mark Verified until a test send writes a row and the webhook updates it."},
      ${iso(20 * 60)},
      ${iso(12)}
    )
    on conflict (id) do nothing
  `;

  await sql`
    insert into incidents (id, code, title, service, severity, status, evidence, impact, recommended, first_seen_at, last_seen_at)
    values (
      'inc-dmarc',
      'WATCH-DMARC-SPF',
      'Apex SPF does not authorize Resend; DMARC is strict',
      'email',
      'warning',
      'OPEN',
      ${"Public DNS 2026-09-15: smelloff.in SPF is v=spf1 include:_spf.mx.cloudflare.net ~all. _dmarc is p=none; adkim=s; aspf=s. Resend domain status in app is DOMAIN_CONFIGURATION_REQUIRED until Verified."},
      ${"Gmail may junk or reject orders@smelloff.in. Receipts can fail silently from the buyer's view even when Resend returns an id."},
      ${"Owner: confirm Resend dashboard shows smelloff.in Verified. Do not invent DKIM CNAMEs. Keep From as orders@smelloff.in."},
      ${iso(24 * 60)},
      ${iso(180)}
    )
    on conflict (id) do nothing
  `;

  await sql`
    insert into actions (id, event_id, action_key, kind, title, recommended, available_action, severity, financial_impact_paise, confidence, age_minutes, owner, status, evidence, href) values
    ('a1', 'inc-p0-email', 'email_schema', 'RELIABILITY', 'Email ledger is not in the production schema cache', 'Apply 20260915_email_events.sql then reload PostgREST', 'Open playbook', 'critical', null, 'PROVEN', 20, 'founder', 'OPEN', ${JSON.stringify({
      event: "PGRST205 on public.email_events",
      evidence: "Git has the migration. Runtime telemetry does not. persistEmailEvent swallows 404 as DATABASE_FAILURE.",
      dataRequired: "pg_tables row + successful service-role insert + webhook update",
    })}, '/incidents'),
    ('a2', null, 'pendingUpi', 'PAYMENT', '3 UPI payments need verification', 'Verify UTRs — ₹916 locked until confirmed', 'Verify payments', 'critical', 91600, 'PROVEN', 41, 'founder', 'OPEN', ${JSON.stringify({
      event: "upi_pending orders",
      orders: ["SMF-20260916-0004", "SMF-20260916-0003", "SMF-20260916-0002"],
      paise: 91600,
    })}, '/payments'),
    ('a3', null, 'refundsDue', 'PAYMENT', '1 UPI refund to process', 'Release ₹229 to SMF-20260915-0004', 'Process refund', 'critical', 22900, 'PROVEN', 400, 'founder', 'OPEN', ${JSON.stringify({
      event: "refund_due",
      orders: ["SMF-20260915-0004"],
    })}, '/payments'),
    ('a4', null, 'toShip', 'ORDERS', '3 orders to pack & ship', 'Pack confirmed orders — 48h dispatch window', 'View orders', 'warning', 74700, 'PROVEN', 180, 'founder', 'OPEN', ${JSON.stringify({
      event: "confirmed / to_pack",
      orders: ["SMF-20260916-0001", "SMF-20260915-0012", "SMF-20260915-0009"],
    })}, '/orders'),
    ('a5', null, 'email_failed', 'RELIABILITY', '1 customer confirmation failed to send', 'Inspect SMF-20260916-0002 — email_status FAILED', 'Open order', 'warning', 22900, 'PROVEN', 126, 'founder', 'OPEN', ${JSON.stringify({
      event: "EMAIL_FAILURE",
      order: "SMF-20260916-0002",
      note: "Send path ran; ledger persist likely also failed (P0).",
    })}, '/orders/SMF-20260916-0002'),
    ('a6', null, 'lowStock', 'INVENTORY', 'ATP cover is 62 days at 3.1/day assumed', 'No production this week — cover > lead+safety. Recheck after 7 days of live demand.', 'Open forecast', 'info', null, 'INFERRED', 0, 'founder', 'OPEN', ${JSON.stringify({
      event: "cover_watch",
      atp: 193,
      daily: 3.1,
      leadTimeDays: 9,
      safety: 12,
      formula: "ceil(3.1×9+12−193)=0",
      confidence: "MEDIUM — 12-order sample, no seasonality yet",
    })}, '/inventory'),
    ('a7', null, 'cartsToRemind', 'CUSTOMER', '4 carts inactive with verified email', 'Send reminder — cooldown 6h, suppress after conversion', 'Recover carts', 'info', 91600, 'INFERRED', 240, 'system', 'OPEN', ${JSON.stringify({
      event: "cart_inactive",
      note: "Cart emails are not production-proven. Channel = email. Guardrail = EMAIL_SIDE_EFFECTS + schema.",
    })}, '/customers')
    on conflict (id) do nothing
  `;

  await sql`
    insert into automations (id, name, trigger_event, condition_text, action_text, guardrail, channel, cooldown_hours, retry_policy, escalation, enabled, last_run_at, last_outcome, last_entities) values
    ('auto-upi', 'UPI pending escalation', 'payment_pending', 'method=upi AND age > 30 min AND status=upi_pending', 'Create PAYMENT action + notify founder', 'Never auto-mark paid. Founder verifies UTR.', 'mission-control', 2, 'every 30 min until handled', 'Page founder after 3h', 1, ${iso(30)}, 'created 3 actions', 3),
    ('auto-review', 'Review request', 'order_delivered', 'delivered 5–14 days ago AND no review-request key AND valid email', 'Send one review request', 'Transactional only. Idempotency review-request/SMF-…. Skip null email.', 'email', 24, 'no retry on hard bounce', 'Incident if 3 failures', 1, ${iso(8 * 60)}, 'skipped — schema missing', 0),
    ('auto-cart', 'Cart recovery', 'cart_inactive', 'email verified AND no order AND age > 6h', 'Send reminder', 'Cooldown 24h. Suppress after conversion. Blocked while email_events absent.', 'email', 24, 'once', 'Disable if bounce rate > 2%', 0, null, 'guardrail: email schema P0', 0),
    ('auto-cover', 'Reorder recommendation', 'inventory_cover', 'SKU cover < 14d AND demand confidence ≥ medium', 'Create production recommendation', 'Never auto-purchase. Founder confirms qty.', 'mission-control', 24, 'daily', 'Escalate at 7d cover', 1, ${iso(60)}, 'ATP cover 62d — watch only', 1),
    ('auto-email-kill', 'Outbound kill switch', 'email_failure', 'email failures ≥ 3 in 1h OR PGRST205 on email_events', 'Open incident. Stop cart/review automation.', 'Fail closed. Do not retry hard bounces.', 'email', 1, 'none', 'Founder only can re-enable', 1, ${iso(12)}, 'kill switch ON for recovery/review', 1)
    on conflict (id) do nothing
  `;

  await sql`
    insert into automation_runs (id, automation_id, status, entities, evidence) values
    ('run1', 'auto-upi', 'ok', 3, 'created pendingUpi action from 3 upi_pending orders'),
    ('run2', 'auto-email-kill', 'ok', 1, 'PGRST205 — kill switch engaged for cart/review'),
    ('run3', 'auto-review', 'skipped', 0, 'schema missing — skipped'),
    ('run4', 'auto-cover', 'ok', 1, 'ATP cover 62d — watch only'),
    ('run5', 'auto-cart', 'blocked', 0, 'guardrail: email schema P0')
    on conflict (id) do nothing
  `;

  await sql`
    insert into health_checks (id, service, state, evidence, last_success_at, last_failure_at, latency_ms, failure_streak, impact) values
    ('h-db', 'supabase', 'DEGRADED', 'Orders probe would succeed; email_events probe returns PGRST205. Configured key ≠ operational for email ledger.', ${iso(5)}, ${iso(12)}, 84, 6, 'Ledger writes for mail fail'),
    ('h-api', 'storefront-api', 'OPERATIONAL', 'create-order / verify-payment / webhook routes exist in Smelloff and are covered by tests. Not live-probed from this instance.', ${iso(15)}, null, 210, 0, null),
    ('h-email', 'resend', 'UNPROVEN', 'DNS 2026-09-15: apex SPF has no Resend include; DMARC strict. Domain Verified status is owner-dashboard only — this app does not hold that credential.', null, ${iso(12)}, null, 1, 'Receipts may junk'),
    ('h-wa', 'whatsapp', 'CONFIGURED', 'wa.me deep links only. No Business API send proof. Credentials ≠ operational.', null, null, null, 0, 'Sends are manual'),
    ('h-push', 'webpush', 'CONFIGURED', 'Admin holds VAPID + /api/webpush. No last-success evidence in this instance.', null, null, null, 0, null),
    ('h-cron', 'cron', 'OPERATIONAL', 'Smelloff crons: meta-capi-drain 03:00 UTC, shiprocket-sync 10:00 UTC. Admin cron separate. Requires CRON_SECRET.', ${iso(200)}, null, null, 0, 'Review mail rides shiprocket GET'),
    ('h-ship', 'shiprocket', 'OPERATIONAL', 'Atomic fulfillment claim exists (20260913). Duplicate 422/409 reconciliation landed. Not live-probed here.', ${iso(1400)}, null, 640, 0, null),
    ('h-pay', 'razorpay', 'OPERATIONAL', 'Webhook payment.captured is source of prepaid confirmation. Admin UPI verify is a second path for manual UTR.', ${iso(970)}, null, 180, 0, null),
    ('h-vercel', 'vercel', 'WATCH', 'Hobby cap 12 functions. Smelloff folds diagnostic + Resend webhook via rewrites. Admin dropped a 13th function today.', null, null, null, 0, 'New routes must consolidate')
    on conflict (id) do nothing
  `;

  await sql`
    insert into daily_facts (day, booked_paise, realised_paise, orders_booked, orders_realised, sessions, add_to_cart, checkouts, purchases, ad_spend_paise, provenance, notes) values
    ('2026-09-09', 68700, 45800, 3, 2, 410, 18, 9, 3, 240000, 'DEMO', 'Ad spend is a placeholder allocation — not from ad platforms'),
    ('2026-09-10', 45800, 22900, 2, 1, 380, 14, 7, 2, 210000, 'DEMO', null),
    ('2026-09-11', 91700, 68700, 4, 3, 520, 22, 11, 4, 280000, 'DEMO', null),
    ('2026-09-12', 45800, 45800, 2, 2, 390, 16, 8, 2, 190000, 'DEMO', null),
    ('2026-09-13', 22900, 0, 1, 0, 340, 11, 5, 1, 160000, 'DEMO', 'COD not realised'),
    ('2026-09-14', 22900, 22900, 1, 1, 360, 13, 6, 1, 175000, 'DEMO', null),
    ('2026-09-15', 91700, 22900, 3, 1, 470, 21, 10, 3, 250000, 'DEMO', 'One refund_due, one to_pack'),
    ('2026-09-16', 114500, 0, 4, 0, null, null, null, 4, null, 'DETECTED', 'Sessions DATA UNAVAILABLE for today — analytics day not closed')
    on conflict (day) do nothing
  `;

  const sot: [string, string, string, string, string, string][] = [
    ["price", "config/product.json pricePaise=22900", "odorstrike.html CFG + create-order server verify", "Frontend used to be able to disagree; server now rejects total mismatch", "Keep server as enforcer. Never edit UI price without spec.", "OK"],
    ["COD fee", "product.json codFee=60", "CFG.COD_FEE and supabase function COD_FEE_RUPEES must match", "One-sided change makes every COD order fail to persist", "Single constant, tested for drift", "OK"],
    ["SKU", "product.json OS-001-50ML", "Operator brief ODS-50; catalog OS-001-50ML", "Two names for one bottle", "Alias ODS-50 in admin search; do not dual-write", "WATCH"],
    ["claim", "constitution + product.json", "Up to 8 hours on fabric — storefront + emails", "Stronger claims would be regulatory risk", "Automated slogan test exists in Smelloff", "OK"],
    ["inventory", "inventory_movements ledger (Admin 20260729)", "Admin ledger is source of truth; counters are derived", "Replacing ledger with stored counters was forbidden", "Keep movements append-only", "OK"],
    ["order totals", "create-order server (price × qty + COD)", "items[].price historically rupees while amount paise", "Unit confusion inside a single row", "Normalise line items to paise with a backfill", "WATCH"],
    ["payment verification", "Razorpay webhook payment.captured + admin UTR", "Two paths: Razorpay capture and manual UPI", "Concurrent duplicate verify", "DB claim, not lookup-then-write", "WATCH"],
    ["email delivery", "email_events table", "Git migration not in production schema cache", "PGRST205 — ledger missing", "Apply migration + NOTIFY pgrst; fail visible", "P0"],
    ["customer identity", "phone + order_code, not email", "email required at checkout going forward; historical COD may be null", "Email is not unique identity", "Keep phone as identity; email for comms", "OK"],
    ["LTV", "not defined as AOV × multiplier", "Admin economics tests exist; contribution LTV needs delivered+cost data", "Presenting LTV without definition is a lie", "Show contribution LTV only with window + provenance, else DATA UNAVAILABLE", "WATCH"],
    ["ad spend / CAC", "ad platforms — not connected here", "daily_facts.ad_spend_paise is DEMO placeholder", "Would fabricate CAC if shown as fact", "Marketing view: DATA UNAVAILABLE for live CAC", "OK"],
    ["permissions", "Admin HttpOnly cookie + CSRF (2026-09-16)", "This preview is unauthenticated founder OS", "Do not treat preview as production admin", "Keep production Admin auth; do not copy tokens to localStorage", "OK"],
  ];

  for (const row of sot) {
    await sql`
      insert into source_of_truth (fact, source, current_impl, risk, recommended, status)
      values (${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]})
      on conflict (fact) do nothing
    `;
  }

  await sql`
    insert into operational_events (id, event_type, entity_type, entity_id, severity, title, evidence, financial_impact_paise, confidence, occurred_at)
    values
    ('e1','payment_pending','order','SMF-20260916-0004','critical','UPI pending 41 min', ${JSON.stringify({ utr: "UTR••••8312" })}, 22900, 'PROVEN', ${iso(41)}),
    ('e2','email_failure','order','SMF-20260916-0002','warning','Confirmation send FAILED', ${JSON.stringify({ error: "PGRST205 or Resend" })}, 22900, 'PROVEN', ${iso(126)}),
    ('e3','schema_mismatch','service','email_events','critical','Production missing email_events', ${JSON.stringify({ code: "PGRST205" })}, null, 'PROVEN', ${iso(12)}),
    ('e4','order_placed','order','SMF-20260916-0004','info','Order placed', '{}'::jsonb, 22900, 'PROVEN', ${iso(41)}),
    ('e5','rto_created','order','SMF-20260828-0003','warning','COD RTO', ${JSON.stringify({ awb: "SR0710IN" })}, 28900, 'PROVEN', ${iso(18000)}),
    ('e6','order_placed','order','SMF-20260916-0003','info','Order placed', '{}'::jsonb, 45800, 'PROVEN', ${iso(88)}),
    ('e7','order_placed','order','SMF-20260916-0002','info','Order placed', '{}'::jsonb, 22900, 'PROVEN', ${iso(126)}),
    ('e8','order_placed','order','SMF-20260916-0001','info','Order placed', '{}'::jsonb, 28900, 'PROVEN', ${iso(180)}),
    ('e9','order_placed','order','SMF-20260915-0012','info','Order placed', '{}'::jsonb, 22900, 'PROVEN', ${iso(980)})
    on conflict (id) do nothing
  `;

  await sql`
    insert into email_events (order_code, email_type, idempotency_key, recipient_masked, sender, provider, provider_email_id, status, error_code, error_message, originating_route)
    values
    ('SMF-20260916-0004', 'order_confirmation', 'order-confirmation/SMF-20260916-0004', 'n***@gmail.com', 'ODORSTRIKE <orders@smelloff.in>', 'resend', null, 'QUEUED', null, null, 'create-order'),
    ('SMF-20260916-0003', 'order_confirmation', 'order-confirmation/SMF-20260916-0003', 'k***@gmail.com', 'ODORSTRIKE <orders@smelloff.in>', 'resend', null, 'QUEUED', null, null, 'create-order'),
    ('SMF-20260916-0002', 'order_confirmation', 'order-confirmation/SMF-20260916-0002', 'm***@gmail.com', 'ODORSTRIKE <orders@smelloff.in>', 'resend', null, 'FAILED', 'PGRST205', 'Persist failed; send may have left the provider. Ledger is not source of truth until schema is applied.', 'create-order'),
    ('SMF-20260916-0001', 'order_confirmation', 'order-confirmation/SMF-20260916-0001', 'r***@gmail.com', 'ODORSTRIKE <orders@smelloff.in>', 'resend', 're_demo_0001', 'sent', null, null, 'create-order'),
    ('SMF-20260915-0012', 'order_confirmation', 'order-confirmation/SMF-20260915-0012', 'p***@gmail.com', 'ODORSTRIKE <orders@smelloff.in>', 'resend', 're_demo_0012', 'delivered', null, null, 'create-order')
    on conflict (idempotency_key) do nothing
  `;

  await sql`
    insert into audit_log (id, actor, action, entity_type, entity_id, result, request_id)
    values
    ('aud1','system','seed','workspace','mission-control','ok','seed_boot'),
    ('aud2','system','detect','incident','P0-EMAIL-SCHEMA','open','seed_boot')
    on conflict (id) do nothing
  `;

  // Refresh customer aggregates from orders
  await sql`
    update customers c set
      order_count = s.n,
      rto_count = s.rto,
      cancelled_count = s.can,
      lifetime_revenue_paise = s.rev,
      first_order_at = s.first_at,
      last_order_at = s.last_at
    from (
      select customer_id,
        count(*)::int as n,
        count(*) filter (where status = 'rto')::int as rto,
        count(*) filter (where status = 'cancelled')::int as can,
        coalesce(sum(product_paise) filter (where status in ('delivered','dispatched','out_for_delivery','confirmed')), 0)::bigint as rev,
        min(placed_at) as first_at,
        max(placed_at) as last_at
      from orders
      group by customer_id
    ) s
    where c.id = s.customer_id
  `;
}
