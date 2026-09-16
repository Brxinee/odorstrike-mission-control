/**
 * Live action reconciliation.
 * Seeded action rows are snapshots. This module re-reads the ledger and
 * upserts OPEN work from current payments / orders / incidents / carts.
 * Handle/snooze are respected — we do not resurrect HANDLED or SNOOZED.
 */
import type { Sql } from "@/lib/db";
import { PLANNING, PRODUCT } from "@/lib/mc/commerce";

type Draft = {
  id: string;
  key: string;
  kind: string;
  title: string;
  recommended: string;
  available: string;
  severity: string;
  paise: number | null;
  confidence: string;
  age: number;
  evidence: Record<string, unknown>;
  href: string;
};

async function upsertOpen(sql: Sql, d: Draft) {
  const existing = (
    await sql<{ id: string; status: string }>`
      select id, status from actions where action_key = ${d.key} order by created_at desc limit 1
    `
  )[0];
  if (existing?.status === "SNOOZED" || existing?.status === "HANDLED") return;
  const evidence = JSON.stringify(d.evidence);
  if (existing?.status === "OPEN") {
    await sql`
      update actions set
        title = ${d.title},
        recommended = ${d.recommended},
        available_action = ${d.available},
        severity = ${d.severity},
        financial_impact_paise = ${d.paise},
        confidence = ${d.confidence},
        age_minutes = ${d.age},
        evidence = ${evidence}::jsonb,
        href = ${d.href}
      where id = ${existing.id}
    `;
    return;
  }
  await sql`
    insert into actions (
      id, event_id, action_key, kind, title, recommended, available_action,
      severity, financial_impact_paise, confidence, age_minutes, owner, status, evidence, href
    ) values (
      ${d.id}, null, ${d.key}, ${d.kind}, ${d.title}, ${d.recommended}, ${d.available},
      ${d.severity}, ${d.paise}, ${d.confidence}, ${d.age}, ${"founder"}, ${"OPEN"}, ${evidence}::jsonb, ${d.href}
    )
    on conflict (id) do nothing
  `;
}

export async function reconcileLiveActions(sql: Sql) {
  const drafts: Draft[] = [];

  const pending = (
    await sql<{ c: number; p: number; age: number | null; codes: string | null }>`
      select
        count(*)::int as c,
        coalesce(sum(p.amount_paise), 0)::int as p,
        coalesce(min(greatest(0, round(extract(epoch from (now() - p.created_at)) / 60))), 0)::int as age,
        string_agg(o.order_code, ',') as codes
      from payments p
      join orders o on o.id = p.order_id
      where p.status = 'pending_verify'
    `
  )[0];
  if ((pending?.c ?? 0) > 0) {
    drafts.push({
      id: "live-pendingUpi",
      key: "pendingUpi",
      kind: "PAYMENT",
      title: `${pending.c} UPI payment${pending.c === 1 ? "" : "s"} need verification`,
      recommended: `Verify UTRs — ₹${Math.round(pending.p / 100)} locked until confirmed`,
      available: "Verify payments",
      severity: "critical",
      paise: pending.p,
      confidence: "PROVEN",
      age: pending.age ?? 0,
      evidence: {
        event: "upi_pending",
        orders: (pending.codes ?? "").split(",").filter(Boolean),
        paise: pending.p,
        derived: "live ledger",
      },
      href: "/payments",
    });
  }

  const refunds = (
    await sql<{ c: number; p: number; age: number | null; codes: string | null }>`
      select
        count(*)::int as c,
        coalesce(sum(amount_paise), 0)::int as p,
        coalesce(min(greatest(0, round(extract(epoch from (now() - created_at)) / 60))), 0)::int as age,
        string_agg(order_code, ',') as codes
      from orders
      where payment_status = 'refund_due'
    `
  )[0];
  if ((refunds?.c ?? 0) > 0) {
    drafts.push({
      id: "live-refundsDue",
      key: "refundsDue",
      kind: "PAYMENT",
      title: `${refunds.c} UPI refund${refunds.c === 1 ? "" : "s"} to process`,
      recommended: `Release ₹${Math.round(refunds.p / 100)} in production Admin — this DEMO ledger cannot pay out`,
      available: "Open refunds",
      severity: "critical",
      paise: refunds.p,
      confidence: "PROVEN",
      age: refunds.age ?? 0,
      evidence: { event: "refund_due", orders: (refunds.codes ?? "").split(",").filter(Boolean), derived: "live ledger" },
      href: "/payments",
    });
  }

  const pack = (
    await sql<{ c: number; p: number; age: number | null; codes: string | null }>`
      select
        count(*)::int as c,
        coalesce(sum(amount_paise), 0)::int as p,
        coalesce(min(greatest(0, round(extract(epoch from (now() - placed_at)) / 60))), 0)::int as age,
        string_agg(order_code, ',') as codes
      from orders
      where fulfillment_status = 'to_pack'
    `
  )[0];
  if ((pack?.c ?? 0) > 0) {
    drafts.push({
      id: "live-toShip",
      key: "toShip",
      kind: "ORDERS",
      title: `${pack.c} order${pack.c === 1 ? "" : "s"} to pack & ship`,
      recommended: "Pack confirmed orders — 48h dispatch window",
      available: "View orders",
      severity: "warning",
      paise: pack.p,
      confidence: "PROVEN",
      age: pack.age ?? 0,
      evidence: { event: "to_pack", orders: (pack.codes ?? "").split(",").filter(Boolean), derived: "live ledger" },
      href: "/orders",
    });
  }

  const failed = (
    await sql<{ c: number; p: number; age: number | null; codes: string | null }>`
      select
        count(*)::int as c,
        coalesce(sum(amount_paise), 0)::int as p,
        coalesce(min(greatest(0, round(extract(epoch from (now() - placed_at)) / 60))), 0)::int as age,
        string_agg(order_code, ',') as codes
      from orders
      where email_status = 'FAILED'
    `
  )[0];
  if ((failed?.c ?? 0) > 0) {
    const first = (failed.codes ?? "").split(",")[0];
    drafts.push({
      id: "live-email_failed",
      key: "email_failed",
      kind: "RELIABILITY",
      title: `${failed.c} customer confirmation${failed.c === 1 ? "" : "s"} failed to send`,
      recommended: `Inspect ${first || "failed order"} — email_status FAILED`,
      available: "Open order",
      severity: "warning",
      paise: failed.p,
      confidence: "PROVEN",
      age: failed.age ?? 0,
      evidence: { event: "EMAIL_FAILURE", orders: (failed.codes ?? "").split(",").filter(Boolean), derived: "live ledger" },
      href: first ? `/orders/${first}` : "/orders",
    });
  }

  const p0 = (
    await sql<{ code: string; title: string; evidence: string }>`
      select code, title, evidence from incidents where code = 'P0-EMAIL-SCHEMA' and status = 'OPEN' limit 1
    `
  )[0];
  if (p0) {
    drafts.push({
      id: "live-email_schema",
      key: "email_schema",
      kind: "RELIABILITY",
      title: "Email ledger is not in the production schema cache",
      recommended: "Apply 20260915_email_events.sql then reload PostgREST",
      available: "Open playbook",
      severity: "critical",
      paise: null,
      confidence: "PROVEN",
      age: 20,
      evidence: { event: "PGRST205 on public.email_events", code: p0.code, derived: "incident row" },
      href: "/incidents/P0-EMAIL-SCHEMA",
    });
  }

  let cartCount = 0;
  let cartPaise = 0;
  let cartAge = 0;
  try {
    const carts = (
      await sql<{ c: number; p: number; age: number | null }>`
        select
          count(*)::int as c,
          coalesce(sum(product_paise), 0)::int as p,
          coalesce(min(greatest(0, round(extract(epoch from (now() - last_activity_at)) / 60))), 0)::int as age
        from carts
        where converted_order_code is null and email_verified = 1
      `
    )[0];
    cartCount = carts?.c ?? 0;
    cartPaise = carts?.p ?? 0;
    cartAge = carts?.age ?? 0;
  } catch {
    cartCount = 0;
  }
  if (cartCount > 0) {
    drafts.push({
      id: "live-cartsToRemind",
      key: "cartsToRemind",
      kind: "CUSTOMER",
      title: `${cartCount} cart${cartCount === 1 ? "" : "s"} inactive with verified email`,
      recommended: "Do not send recovery mail until email_events persists. Cooldown 6h, suppress after conversion.",
      available: "Open carts",
      severity: "info",
      paise: cartPaise,
      confidence: "INFERRED",
      age: cartAge,
      evidence: {
        event: "cart_inactive",
        count: cartCount,
        note: "DEMO carts. Channel = email. Guardrail = EMAIL_SIDE_EFFECTS + schema P0.",
        derived: "live ledger",
      },
      href: "/carts",
    });
  }

  const sellableIn = (
    await sql<{ q: number }>`select coalesce(sum(qty),0)::int as q from inventory_movements where stage = 'sellable' and direction = 'in'`
  )[0];
  const committed = (
    await sql<{ q: number }>`select coalesce(sum(qty),0)::int as q from inventory_movements where stage = 'committed' and direction = 'out'`
  )[0];
  const atp = (sellableIn?.q ?? 0) - (committed?.q ?? 0);
  const cover = atp / PLANNING.expectedDailyDemand;
  const recommended = Math.max(0, Math.ceil(PLANNING.expectedDailyDemand * PLANNING.leadTimeDays + PLANNING.safetyStockUnits - atp));
  if (cover < 14) {
    drafts.push({
      id: "live-lowStock",
      key: "lowStock",
      kind: "INVENTORY",
      title: `ATP cover ${cover.toFixed(1)}d — below 14d threshold`,
      recommended: recommended > 0 ? `Produce ${recommended} of ${PRODUCT.catalogSku}` : "Recheck demand; formula gave 0",
      available: "Open forecast",
      severity: "warning",
      paise: null,
      confidence: "INFERRED",
      age: 0,
      evidence: {
        event: "cover_below_threshold",
        atp,
        daily: PLANNING.expectedDailyDemand,
        cover,
        formula: "ceil(daily×lead+safety−ATP)",
        derived: "live ledger",
      },
      href: "/inventory",
    });
  }

  const liveKeys = new Set(drafts.map((d) => d.key));
  for (const d of drafts) {
    await upsertOpen(sql, d);
  }

  const autoClear = ["pendingUpi", "refundsDue", "toShip", "email_failed", "cartsToRemind", "lowStock"];
  const open = await sql<{ id: string; action_key: string }>`select id, action_key from actions where status = 'OPEN'`;
  for (const a of open) {
    if (autoClear.includes(a.action_key) && !liveKeys.has(a.action_key)) {
      await sql`
        update actions
        set status = 'HANDLED',
            resolved_at = now(),
            outcome = ${"Auto-cleared — live ledger no longer matches this action"}
        where id = ${a.id}
      `;
    }
  }
}
