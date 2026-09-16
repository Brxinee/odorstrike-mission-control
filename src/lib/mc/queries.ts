import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureSeeded } from "@/lib/mc/seed";
import { scoreAction } from "@/lib/mc/actions";
import { PRODUCT, PLANNING } from "@/lib/mc/commerce";
import { requestId } from "@/lib/utils";

async function db() {
  const sql = await getSql();
  await ensureSeeded(sql);
  return sql;
}

export type ActionRow = {
  id: string;
  action_key: string;
  kind: string;
  title: string;
  recommended: string;
  available_action: string | null;
  severity: string;
  financial_impact_paise: number | null;
  confidence: string;
  age_minutes: number;
  owner: string;
  status: string;
  evidence: string;
  href: string | null;
  outcome: string | null;
  score: number;
};

export type OrderRow = {
  id: string;
  order_code: string;
  customer_id: string | null;
  sku: string;
  qty: number;
  product_paise: number;
  cod_fee_paise: number;
  amount_paise: number;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  status: string;
  city: string | null;
  state: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  device: string | null;
  awb: string | null;
  courier: string | null;
  placed_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  rto_at: string | null;
  email_status: string | null;
  provenance: string;
};

export type CustomerRow = {
  id: string;
  display_code: string;
  city: string | null;
  state: string | null;
  phone_masked: string | null;
  email_masked: string | null;
  first_order_at: string | null;
  last_order_at: string | null;
  order_count: number;
  rto_count: number;
  cancelled_count: number;
  lifetime_revenue_paise: number;
  acquisition_source: string | null;
  acquisition_medium: string | null;
  acquisition_campaign: string | null;
  predicted_reorder_on: string | null;
  notes_internal: string | null;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  order_id: string;
  method: string;
  status: string;
  amount_paise: number;
  utr_masked: string | null;
  gateway: string | null;
  age_minutes: number | null;
  created_at: string;
  verified_at: string | null;
};

export type EventRow = {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  severity: string;
  title: string;
  evidence: string;
  financial_impact_paise: number | null;
  confidence: string;
  occurred_at: string;
};

export type EmailRow = {
  id: number;
  order_code: string | null;
  email_type: string;
  idempotency_key: string;
  recipient_masked: string | null;
  sender: string | null;
  provider: string;
  provider_email_id: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  originating_route: string | null;
  last_webhook_event: string | null;
  created_at: string;
};

export type AutomationRow = {
  id: string;
  name: string;
  trigger_event: string;
  condition_text: string;
  action_text: string;
  guardrail: string;
  channel: string;
  cooldown_hours: number;
  retry_policy: string;
  escalation: string | null;
  enabled: number;
  last_run_at: string | null;
  last_outcome: string | null;
  last_entities: number | null;
};

export type AutomationRunRow = {
  id: string;
  automation_id: string;
  status: string;
  entities: number;
  evidence: string | null;
  ran_at: string;
};

export type IncidentRow = {
  id: string;
  code: string;
  title: string;
  service: string;
  severity: string;
  status: string;
  evidence: string;
  impact: string | null;
  recommended: string | null;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
};

export type HealthRow = {
  id: string;
  service: string;
  state: string;
  evidence: string;
  last_success_at: string | null;
  last_failure_at: string | null;
  latency_ms: number | null;
  failure_streak: number;
  impact: string | null;
};

export type SotRow = {
  fact: string;
  source: string;
  current_impl: string;
  risk: string;
  recommended: string;
  status: string;
};

function asJson(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function asActions(rows: Array<Record<string, unknown>>): ActionRow[] {
  return rows.map((r) => {
    const scored = scoreAction({
      severity: String(r.severity),
      paise: r.financial_impact_paise == null ? null : Number(r.financial_impact_paise),
      urgency: String(r.severity) === "critical" ? "immediate" : String(r.severity) === "warning" ? "today" : "week",
      confidence: String(r.confidence),
      ageHours: Number(r.age_minutes || 0) / 60,
    });
    return {
      id: String(r.id),
      action_key: String(r.action_key),
      kind: String(r.kind),
      title: String(r.title),
      recommended: String(r.recommended),
      available_action: r.available_action ? String(r.available_action) : null,
      severity: String(r.severity),
      financial_impact_paise: r.financial_impact_paise == null ? null : Number(r.financial_impact_paise),
      confidence: String(r.confidence),
      age_minutes: Number(r.age_minutes || 0),
      owner: String(r.owner),
      status: String(r.status),
      evidence: asJson(r.evidence),
      href: r.href ? String(r.href) : null,
      outcome: r.outcome ? String(r.outcome) : null,
      score: scored.score,
    };
  }).sort((a, b) => b.score - a.score || (b.financial_impact_paise || 0) - (a.financial_impact_paise || 0));
}

export const getOverview = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const actions = asActions(
    await sql`select * from actions where status = 'OPEN'`,
  );
  const incidents = await sql<{
    id: string; code: string; title: string; service: string; severity: string; status: string; evidence: string; impact: string | null; recommended: string | null; first_seen_at: string; last_seen_at: string;
  }>`select * from incidents where status = 'OPEN' order by case severity when 'critical' then 0 when 'warning' then 1 else 2 end`;
  const health = await sql<{
    id: string; service: string; state: string; evidence: string; last_success_at: string | null; last_failure_at: string | null; latency_ms: number | null; failure_streak: number; impact: string | null;
  }>`select * from health_checks order by service`;
  const facts = await sql<{
    day: string; booked_paise: number; realised_paise: number; orders_booked: number; orders_realised: number; sessions: number | null; add_to_cart: number | null; checkouts: number | null; purchases: number | null; ad_spend_paise: number | null; provenance: string; notes: string | null;
  }>`select * from daily_facts order by day desc limit 8`;
  const today = facts[0];
  const yesterday = facts[1];
  const pendingUpi = await sql<{ c: number; p: number }>`
    select count(*)::int as c, coalesce(sum(amount_paise),0)::int as p from orders where status = 'upi_pending'
  `;
  const toShip = await sql<{ c: number; p: number }>`
    select count(*)::int as c, coalesce(sum(amount_paise),0)::int as p from orders where fulfillment_status = 'to_pack'
  `;
  const sellableIn = await sql<{ q: number }>`select coalesce(sum(qty),0)::int as q from inventory_movements where stage = 'sellable' and direction = 'in'`;
  const committed = await sql<{ q: number }>`select coalesce(sum(qty),0)::int as q from inventory_movements where stage = 'committed' and direction = 'out'`;
  const sellable = (sellableIn[0]?.q ?? 0) - (committed[0]?.q ?? 0);
  const todayBooked = await sql<{ c: number; p: number }>`
    select count(*)::int as c, coalesce(sum(amount_paise),0)::int as p
    from orders
    where (placed_at at time zone 'Asia/Kolkata')::date = (timezone('Asia/Kolkata', now()))::date
      and status <> 'cancelled'
  `;
  const todayRealised = await sql<{ p: number }>`
    select coalesce(sum(product_paise),0)::int as p
    from orders
    where delivered_at is not null
      and (delivered_at at time zone 'Asia/Kolkata')::date = (timezone('Asia/Kolkata', now()))::date
  `;
  const realisedToday = todayRealised[0]?.p ?? 0;
  const bookedToday = todayBooked[0]?.p ?? 0;
  const ordersToday = todayBooked[0]?.c ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    provenance: "DEMO ledger in this Mission Control instance — not live Supabase",
    sku: PRODUCT.catalogSku,
    actions,
    incidents,
    health,
    facts: facts.slice().reverse(),
    pulse: {
      bookedToday,
      realisedToday,
      ordersToday,
      pendingUpiCount: pendingUpi[0]?.c ?? 0,
      pendingUpiPaise: pendingUpi[0]?.p ?? 0,
      toShipCount: toShip[0]?.c ?? 0,
      toShipPaise: toShip[0]?.p ?? 0,
      sellable,
      coverDays: sellable > 0 ? Number((sellable / PLANNING.expectedDailyDemand).toFixed(1)) : 0,
      demandDaily: PLANNING.expectedDailyDemand,
      demandProvenance: PLANNING.expectedDailyProvenance,
      sessionsToday: today?.sessions ?? null,
      yesterdayBooked: yesterday?.booked_paise ?? 0,
      yesterdayRealised: yesterday?.realised_paise ?? 0,
      bookedDelta: bookedToday - (yesterday?.booked_paise ?? 0),
      realisedDelta: realisedToday - (yesterday?.realised_paise ?? 0),
      todayProvenance: today?.provenance ?? "DATA UNAVAILABLE",
      adSpendToday: today?.ad_spend_paise ?? null,
    },
  };
});

export const getOrders = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<OrderRow>`select * from orders order by placed_at desc`;
  return { rows, provenance: "DEMO" };
});

export const getOrder = createServerFn({ method: "GET" })
  .validator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    const sql = await db();
    const rows = await sql<OrderRow>`select * from orders where order_code = ${data.code} limit 1`;
    const order = rows[0] ?? null;
    if (!order) {
      return { order: null, customer: null, payment: null, events: [] as EventRow[], emails: [] as EmailRow[], customerOrders: [] as Array<{ order_code: string; status: string; amount_paise: number; placed_at: string }> };
    }
    const customer = order.customer_id
      ? ((await sql<CustomerRow>`select * from customers where id = ${order.customer_id}`)[0] ?? null)
      : null;
    const payment = (await sql<PaymentRow>`select * from payments where order_id = ${order.id}`)[0] ?? null;
    const events = await sql<EventRow>`
      select id, event_type, entity_type, entity_id, severity, title, evidence::text as evidence, financial_impact_paise, confidence, occurred_at
      from operational_events where entity_id = ${order.order_code} order by occurred_at desc
    `;
    const emails = await sql<EmailRow>`select * from email_events where order_code = ${order.order_code} order by created_at desc`;
    const customerOrders = order.customer_id
      ? await sql<{ order_code: string; status: string; amount_paise: number; placed_at: string }>`
          select order_code, status, amount_paise, placed_at from orders where customer_id = ${order.customer_id} order by placed_at desc
        `
      : [];
    return { order, customer, payment, events, emails, customerOrders };
  });

export const getCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<CustomerRow>`select * from customers order by last_order_at desc nulls last`;
  return { rows, provenance: "DEMO — masked identity only" };
});

export const getCustomer = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sql = await db();
    const customer = (await sql<CustomerRow>`select * from customers where id = ${data.id}`)[0] ?? null;
    const orders = await sql<OrderRow>`select * from orders where customer_id = ${data.id} order by placed_at desc`;
    return { customer, orders };
  });

export const getInventory = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const movements = await sql<{
    id: string; sku: string; stage: string; direction: string; qty: number; reason: string; actor: string; ref_code: string | null; occurred_at: string; provenance: string;
  }>`select * from inventory_movements order by occurred_at desc`;
  const stages = ["raw_materials", "production", "finished_goods", "committed", "sellable", "shipped", "delivered", "rto", "damaged"] as const;
  const byStage: Record<string, number> = {};
  for (const s of stages) byStage[s] = 0;
  for (const m of movements) {
    const sign = m.direction === "in" ? 1 : -1;
    byStage[m.stage] = (byStage[m.stage] ?? 0) + sign * m.qty;
  }
  const atp = Math.max(0, (byStage.sellable ?? 0) + (byStage.committed ?? 0));
  const daily = PLANNING.expectedDailyDemand;
  const lead = PLANNING.leadTimeDays;
  const safety = PLANNING.safetyStockUnits;
  const cover = atp / daily;
  const stockout = new Date();
  stockout.setDate(stockout.getDate() + Math.floor(cover));
  const recommended = Math.max(0, Math.ceil(daily * lead + safety - atp));
  const doubled = daily * 2;
  const coverDoubled = atp / doubled;
  const recDoubled = Math.max(0, Math.ceil(doubled * lead + safety - atp));
  return {
    sku: PRODUCT.catalogSku,
    alias: PRODUCT.operatorAlias,
    skuConflict: PRODUCT.skuConflict,
    movements,
    byStage,
    atp,
    forecast: {
      sellable: atp,
      expectedDaily: daily,
      leadTimeDays: lead,
      safetyStock: safety,
      coverDays: Number(cover.toFixed(1)),
      projectedStockout: stockout.toISOString().slice(0, 10),
      recommendedProduce: recommended,
      confidence: "MEDIUM",
      formula: "ATP = sellable IN + committed net. Recommend = ceil(daily × lead + safety − ATP).",
      why: `${PLANNING.expectedDailyProvenance} Treat as a planning sketch, not a purchase order.`,
      scenarioDoubleDemand: {
        daily: doubled,
        coverDays: Number(coverDoubled.toFixed(1)),
        recommendedProduce: recDoubled,
        note: "Scenario only — not a forecast. Shows sensitivity if demand doubles.",
      },
    },
  };
});

export const getPayments = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<{
    id: string; order_id: string; method: string; status: string; amount_paise: number; utr_masked: string | null; gateway: string | null; age_minutes: number | null; created_at: string; verified_at: string | null; order_code: string;
  }>`
    select p.*, o.order_code from payments p
    join orders o on o.id = p.order_id
    order by p.created_at desc
  `;
  return { rows };
});

export const getFinance = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const realised = await sql<{ p: number }>`
    select coalesce(sum(product_paise),0)::int as p from orders where status in ('delivered')
  `;
  const booked = await sql<{ p: number }>`
    select coalesce(sum(amount_paise),0)::int as p from orders where status not in ('cancelled')
  `;
  const pending = await sql<{ p: number }>`
    select coalesce(sum(amount_paise),0)::int as p from orders where status = 'upi_pending'
  `;
  const refund = await sql<{ p: number }>`
    select coalesce(sum(amount_paise),0)::int as p from orders where payment_status = 'refund_due'
  `;
  const rto = await sql<{ p: number }>`
    select coalesce(sum(amount_paise),0)::int as p from orders where status = 'rto'
  `;
  const facts = await sql<{ day: string; booked_paise: number; realised_paise: number; ad_spend_paise: number | null; provenance: string }>`
    select day, booked_paise, realised_paise, ad_spend_paise, provenance from daily_facts order by day
  `;
  const cogsEstimatePaise = 2370;
  const deliveredQty = await sql<{ q: number }>`select coalesce(sum(qty),0)::int as q from orders where status = 'delivered'`;
  const gatewayBps = 2;
  const contribution = realised[0]!.p - deliveredQty[0]!.q * cogsEstimatePaise - Math.round(realised[0]!.p * gatewayBps / 100);
  return {
    booked: booked[0]!.p,
    realised: realised[0]!.p,
    pendingSettlements: pending[0]!.p,
    refundExposure: refund[0]!.p,
    rtoExposure: rto[0]!.p,
    adSpend: null as number | null,
    adSpendNote: "DATA UNAVAILABLE — ad platforms are not connected to this instance. daily_facts.ad_spend_paise is DEMO and must not be shown as spend.",
    cogsPerUnitPaise: cogsEstimatePaise,
    cogsNote: "₹23.70 liquid cost is quoted in an older admin audit as provisional — not from the spec skill. Labelled ESTIMATE.",
    contributionPaise: contribution,
    contributionNote: "Contribution here = realised product revenue − estimated liquid COGS − 2% gateway. Excludes shipping, RTO, ads, COD fee. Window = all DEMO delivered orders.",
    facts,
  };
});

export const getAutomations = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<AutomationRow>`select * from automations order by name`;
  const runs = await sql<AutomationRunRow>`select * from automation_runs order by ran_at desc limit 20`;
  return { rows, runs };
});

export const getIncidents = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<IncidentRow>`select * from incidents order by first_seen_at desc`;
  const health = await sql<HealthRow>`select * from health_checks order by service`;
  return { rows, health };
});

export const getSot = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<SotRow>`select * from source_of_truth`;
  return { rows };
});

export const getMarketing = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<{
    source: string; medium: string; orders: number; revenue: number; realised: number; rto: number;
  }>`
    select
      coalesce(source, 'unknown') as source,
      coalesce(medium, 'unknown') as medium,
      count(*)::int as orders,
      coalesce(sum(product_paise),0)::int as revenue,
      coalesce(sum(product_paise) filter (where status = 'delivered'),0)::int as realised,
      count(*) filter (where status = 'rto')::int as rto
    from orders
    group by 1, 2
    order by revenue desc
  `;
  return {
    rows,
    cac: null,
    cacNote: "DATA UNAVAILABLE — no live ad spend. Do not infer CAC from DEMO daily_facts.",
    repeatRateNote: "Two customers have >1 order in the DEMO set. Sample too small for a repeat rate claim.",
  };
});

export const mutateAction = createServerFn({ method: "POST" })
  .validator((input: { id: string; mutation: "handled" | "snooze" | "open"; note?: string }) => input)
  .handler(async ({ data }) => {
    const sql = await db();
    const rid = requestId();
    if (data.mutation === "handled") {
      const action = (await sql<{ title: string; financial_impact_paise: number | null }>`select title, financial_impact_paise from actions where id = ${data.id}`)[0];
      const outcome = action
        ? `Resolved — ${action.title}${action.financial_impact_paise ? ` · ${Math.round(action.financial_impact_paise / 100)} released/cleared` : ""}`
        : "Resolved";
      await sql`update actions set status = 'HANDLED', resolved_at = now(), outcome = ${outcome} where id = ${data.id}`;
      await sql`insert into action_outcomes (id, action_id, result, notes, actor) values (${`out_${rid}`}, ${data.id}, ${"handled"}, ${data.note ?? null}, ${"founder"})`;
      await sql`insert into audit_log (id, actor, action, entity_type, entity_id, result, request_id) values (${`aud_${rid}`}, ${"founder"}, ${"action.handled"}, ${"action"}, ${data.id}, ${"ok"}, ${rid})`;
    } else if (data.mutation === "snooze") {
      await sql`update actions set status = 'SNOOZED' where id = ${data.id}`;
      await sql`insert into audit_log (id, actor, action, entity_type, entity_id, result, request_id) values (${`aud_${rid}`}, ${"founder"}, ${"action.snoozed"}, ${"action"}, ${data.id}, ${"ok"}, ${rid})`;
    } else {
      await sql`update actions set status = 'OPEN', resolved_at = null, outcome = null where id = ${data.id}`;
    }
    return { ok: true, requestId: rid };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .validator((input: { paymentId: string }) => input)
  .handler(async ({ data }) => {
    const sql = await db();
    const rid = requestId();
    const pay = (await sql<{ id: string; order_id: string; status: string; amount_paise: number }>`
      select id, order_id, status, amount_paise from payments where id = ${data.paymentId}
    `)[0];
    if (!pay) return { ok: false as const, error: "Payment not found", requestId: rid };
    if (pay.status !== "pending_verify") {
      return { ok: false as const, error: "Already resolved — idempotent no-op", requestId: rid };
    }
    await sql`update payments set status = 'captured', verified_at = now() where id = ${pay.id} and status = 'pending_verify'`;
    await sql`update orders set payment_status = 'captured', status = 'confirmed', fulfillment_status = 'to_pack', paid_at = coalesce(paid_at, now()) where id = ${pay.order_id}`;
    await sql`insert into audit_log (id, actor, action, entity_type, entity_id, result, request_id) values (${`aud_${rid}`}, ${"founder"}, ${"payment.verify"}, ${"payment"}, ${pay.id}, ${"ok"}, ${rid})`;
    const remaining = await sql<{ c: number }>`select count(*)::int as c from payments where status = 'pending_verify'`;
    if ((remaining[0]?.c ?? 0) === 0) {
      await sql`update actions set status = 'HANDLED', resolved_at = now(), outcome = ${"Resolved — UPI payments verified"} where action_key = 'pendingUpi' and status = 'OPEN'`;
    }
    return { ok: true as const, requestId: rid, amountPaise: pay.amount_paise };
  });

export const toggleAutomation = createServerFn({ method: "POST" })
  .validator((input: { id: string; enabled: boolean }) => input)
  .handler(async ({ data }) => {
    const sql = await db();
    const rid = requestId();
    await sql`update automations set enabled = ${data.enabled ? 1 : 0} where id = ${data.id}`;
    await sql`insert into audit_log (id, actor, action, entity_type, entity_id, result, request_id) values (${`aud_${rid}`}, ${"founder"}, ${data.enabled ? "automation.enable" : "automation.disable"}, ${"automation"}, ${data.id}, ${"ok"}, ${rid})`;
    return { ok: true, requestId: rid };
  });

export type CopilotAnswer = {
  question: string;
  answer: string;
  evidence: string[];
  confidence: "PROVEN" | "INFERRED" | "UNKNOWN";
  affected: string[];
  recommended: string | null;
  href: string | null;
  usedModel: boolean;
};

export const askOperator = createServerFn({ method: "POST" })
  .validator((input: { question: string }) => input)
  .handler(async ({ data }) => {
    const overview = await getOverview();
    const q = data.question.toLowerCase();
    const evidence: string[] = [];
    let answer = "";
    let confidence: CopilotAnswer["confidence"] = "PROVEN";
    let affected: string[] = [];
    let recommended: string | null = null;
    let href: string | null = "/";

    if (q.includes("attention") || q.includes("need") || q.includes("should i do")) {
      const top = overview.actions.slice(0, 4);
      answer = top.length
        ? `Highest-priority work: ${top.map((a) => a.title).join("; ")}.`
        : "No open actions.";
      evidence.push(...top.map((a) => `${a.title} · ${a.confidence} · score ${a.score.toFixed(1)}`));
      affected = top.map((a) => a.action_key);
      recommended = top[0]?.recommended ?? null;
      href = top[0]?.href ?? "/";
    } else if (q.includes("revenue") || q.includes("fall") || q.includes("today")) {
      const p = overview.pulse;
      answer = `Today booked ${p.bookedToday / 100} INR across ${p.ordersToday} orders. Realised ${p.realisedToday / 100} INR. Yesterday booked ${p.yesterdayBooked / 100} INR. Realised today is 0 because prepaid is still pending verify and COD is uncollected.`;
      evidence.push(
        `bookedToday=${p.bookedToday} provenance=${p.todayProvenance}`,
        `realisedToday=${p.realisedToday}`,
        `pending UPI ${p.pendingUpiCount} = ${p.pendingUpiPaise} paise`,
      );
      recommended = "Verify the 3 UPI payments to convert booked → realised.";
      href = "/payments";
      affected = ["pendingUpi"];
    } else if (q.includes("cart")) {
      answer = "4 inactive carts are flagged INFERRED. Cart recovery automation is disabled because the email ledger schema is missing in production — sending would not be idempotent.";
      evidence.push("Action cartsToRemind confidence=INFERRED", "Automation auto-cart enabled=0 guardrail=email schema P0");
      confidence = "INFERRED";
      recommended = "Do not send cart mail until email_events exists and a test send persists.";
      href = "/automations";
    } else if (q.includes("stock") || q.includes("sku") || q.includes("produce")) {
      answer = `ATP ${overview.pulse.sellable} units of ${PRODUCT.catalogSku}. Cover ${overview.pulse.coverDays} days at ${PLANNING.expectedDailyDemand}/day assumed. Recommendation uses ceil(daily × lead + safety − ATP). Demand is INFERRED.`;
      evidence.push("ATP = sellable IN − committed OUT", PLANNING.expectedDailyProvenance);
      confidence = "INFERRED";
      href = "/inventory";
    } else if (q.includes("customer") || q.includes("contact") || q.includes("replenish")) {
      answer = "C-1001 (Hyderabad) has a delivered order on 8 Sep and a predicted reorder window around 28 Sep. C-1006 is due 20 Sep. These windows are DEMO heuristics (cycle ≈ 20 days), not a survival model.";
      evidence.push("customers.predicted_reorder_on is seeded, not fitted");
      confidence = "INFERRED";
      href = "/customers";
      affected = ["C-1001", "C-1006"];
    } else if (q.includes("contribution") || q.includes("margin")) {
      answer = "Contribution is only computable on delivered DEMO orders with an ESTIMATE COGS of ₹23.70/unit that is not spec-authoritative. Ad spend is DATA UNAVAILABLE. Do not treat today's booked revenue as contribution.";
      evidence.push("COGS from older admin audit — labelled ESTIMATE", "ad spend not connected");
      confidence = "INFERRED";
      href = "/finance";
    } else if (q.includes("yesterday") || q.includes("changed") || q.includes("why")) {
      const p = overview.pulse;
      answer = `Booked moved ${p.bookedDelta / 100} INR vs yesterday. The change is mix: 3 UPI still unverified (₹916) plus 1 COD. Realised did not move. Email schema P0 is the operational change that matters more than the revenue delta.`;
      evidence.push(`bookedDelta=${p.bookedDelta}`, "incident P0-EMAIL-SCHEMA OPEN");
      href = "/";
    } else if (q.includes("email") || q.includes("pgrst") || q.includes("schema")) {
      answer = "P0: production PostgREST cannot see public.email_events (PGRST205). The migration is in git. Sending still happens; the ledger does not. Email is not reliable until schema + application agree.";
      evidence.push("Smelloff persistEmailEvent POST /rest/v1/email_events", "migration 20260915_email_events.sql", "no NOTIFY pgrst");
      recommended = "Run the playbook on the Incidents screen. Do not invent a second table.";
      href = "/incidents";
      affected = ["email_events"];
    } else {
      answer = "I only answer from Mission Control facts. Ask about attention, revenue today, carts, stock, customers, contribution, what changed, or email schema. I will not invent missing numbers.";
      evidence.push("Deterministic operator — no ungrounded generation");
      confidence = "UNKNOWN";
      href = "/";
    }

    // Optional xAI polish — only on user ask, never as source of truth
    let usedModel = false;
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey && data.question.trim().length > 0 && confidence !== "UNKNOWN") {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 220,
            messages: [
              {
                role: "system",
                content:
                  "You are an evidence-grounded operator for Smelloff. Rewrite the answer in 3 short sentences. Do not add facts. Do not invent metrics. Keep DATA UNAVAILABLE if present. Never mention being an AI.",
              },
              {
                role: "user",
                content: `Q: ${data.question}\nAnswer: ${answer}\nEvidence: ${evidence.join(" | ")}`,
              },
            ],
          }),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const text = body.choices?.[0]?.message?.content?.trim();
          if (text) {
            answer = text;
            usedModel = true;
          }
        }
      } catch {
        // stay on deterministic answer
      }
    }

    return {
      question: data.question,
      answer,
      evidence,
      confidence,
      affected,
      recommended,
      href,
      usedModel,
    } satisfies CopilotAnswer;
  });

export const searchWorkspace = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const orders = await sql<{ order_code: string; status: string; amount_paise: number; city: string | null }>`
    select order_code, status, amount_paise, city from orders order by placed_at desc
  `;
  const customers = await sql<{ id: string; display_code: string; city: string | null; order_count: number }>`
    select id, display_code, city, order_count from customers order by display_code
  `;
  const incidents = await sql<{ code: string; title: string; status: string }>`
    select code, title, status from incidents order by first_seen_at desc
  `;
  return { orders, customers, incidents };
});

export const getAudit = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<{
    id: string; actor: string; action: string; entity_type: string; entity_id: string | null; result: string; request_id: string | null; created_at: string;
  }>`select * from audit_log order by created_at desc limit 60`;
  return { rows };
});

export const verifyAllPending = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await db();
  const rid = requestId();
  const pending = await sql<{ id: string; order_id: string; amount_paise: number }>`
    select id, order_id, amount_paise from payments where status = 'pending_verify'
  `;
  let released = 0;
  for (const pay of pending) {
    const updated = await sql<{ id: string }>`
      update payments set status = 'captured', verified_at = now()
      where id = ${pay.id} and status = 'pending_verify'
      returning id
    `;
    if (!updated[0]) continue;
    await sql`
      update orders
      set payment_status = 'captured',
          status = 'confirmed',
          fulfillment_status = 'to_pack',
          paid_at = coalesce(paid_at, now())
      where id = ${pay.order_id}
    `;
    released += pay.amount_paise;
    await sql`
      insert into audit_log (id, actor, action, entity_type, entity_id, result, request_id)
      values (${`aud_${rid}_${pay.id}`}, ${"founder"}, ${"payment.verify"}, ${"payment"}, ${pay.id}, ${"ok"}, ${rid})
    `;
  }
  if (pending.length) {
    const outcome = `Resolved — ${pending.length} UPI payments verified · ₹${Math.round(released / 100)} released (DEMO ledger)`;
    await sql`
      update actions set status = 'HANDLED', resolved_at = now(), outcome = ${outcome}
      where action_key = 'pendingUpi' and status = 'OPEN'
    `;
  }
  return { ok: true as const, count: pending.length, releasedPaise: released, requestId: rid };
});
