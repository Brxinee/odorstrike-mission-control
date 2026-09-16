-- Smelloff Mission Control — operational schema
-- Money is integer paise. Inventory is a ledger. Events are append-only.
-- Rows are unowned (single-founder OS). Seed data is labeled DEMO provenance.

create table if not exists settings (
  key text primary key,
  value text not null,
  provenance text not null default 'CONFIG',
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id text primary key,
  display_code text not null unique,
  city text,
  state text,
  phone_masked text,
  email_masked text,
  first_order_at timestamptz,
  last_order_at timestamptz,
  order_count integer not null default 0,
  rto_count integer not null default 0,
  cancelled_count integer not null default 0,
  lifetime_revenue_paise bigint not null default 0,
  acquisition_source text,
  acquisition_medium text,
  acquisition_campaign text,
  predicted_reorder_on date,
  notes_internal text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  order_code text not null unique,
  customer_id text references customers(id),
  sku text not null,
  qty integer not null,
  product_paise integer not null,
  cod_fee_paise integer not null default 0,
  amount_paise integer not null,
  payment_method text not null check (payment_method in ('upi','cod','card')),
  payment_status text not null,
  fulfillment_status text not null,
  status text not null,
  city text,
  state text,
  source text,
  medium text,
  campaign text,
  landing_page text,
  device text,
  awb text,
  courier text,
  placed_at timestamptz not null,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  rto_at timestamptz,
  email_status text,
  provenance text not null default 'DEMO',
  created_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_placed_at_idx on orders (placed_at desc);
create index if not exists orders_customer_idx on orders (customer_id);

create table if not exists payments (
  id text primary key,
  order_id text not null references orders(id),
  method text not null,
  status text not null,
  amount_paise integer not null,
  utr_masked text,
  gateway text,
  age_minutes integer,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table if not exists inventory_movements (
  id text primary key,
  sku text not null,
  stage text not null,
  direction text not null check (direction in ('in','out')),
  qty integer not null,
  reason text not null,
  actor text not null,
  ref_code text,
  occurred_at timestamptz not null,
  provenance text not null default 'DEMO'
);

create index if not exists inventory_movements_sku_idx on inventory_movements (sku, occurred_at desc);

create table if not exists operational_events (
  id text primary key,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  severity text not null,
  title text not null,
  evidence jsonb not null default '{}'::jsonb,
  financial_impact_paise integer,
  confidence text not null,
  occurred_at timestamptz not null,
  provenance text not null default 'DETECTED'
);

create index if not exists operational_events_type_idx on operational_events (event_type, occurred_at desc);

create table if not exists actions (
  id text primary key,
  event_id text,
  action_key text not null,
  kind text not null,
  title text not null,
  recommended text not null,
  available_action text,
  severity text not null,
  financial_impact_paise integer,
  confidence text not null,
  age_minutes integer not null default 0,
  owner text not null default 'founder',
  status text not null default 'OPEN',
  evidence jsonb not null default '{}'::jsonb,
  href text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  outcome text
);

create index if not exists actions_status_idx on actions (status, created_at desc);

create table if not exists action_outcomes (
  id text primary key,
  action_id text not null references actions(id),
  result text not null,
  notes text,
  actor text not null default 'founder',
  created_at timestamptz not null default now()
);

create table if not exists incidents (
  id text primary key,
  code text not null unique,
  title text not null,
  service text not null,
  severity text not null,
  status text not null,
  evidence text not null,
  impact text,
  recommended text,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  resolved_at timestamptz
);

create table if not exists automations (
  id text primary key,
  name text not null,
  trigger_event text not null,
  condition_text text not null,
  action_text text not null,
  guardrail text not null,
  channel text not null,
  cooldown_hours integer not null default 24,
  retry_policy text not null default '3x exponential',
  escalation text,
  enabled integer not null default 1,
  last_run_at timestamptz,
  last_outcome text,
  last_entities integer
);

create table if not exists automation_runs (
  id text primary key,
  automation_id text not null references automations(id),
  status text not null,
  entities integer not null default 0,
  evidence text,
  ran_at timestamptz not null default now()
);

create table if not exists email_events (
  id integer generated by default as identity primary key,
  order_code text,
  email_type text not null,
  idempotency_key text not null unique,
  recipient_masked text,
  sender text,
  provider text not null default 'resend',
  provider_email_id text,
  status text not null,
  error_code text,
  error_message text,
  originating_route text,
  last_webhook_event text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists email_webhook_events (
  id integer generated by default as identity primary key,
  svix_id text not null unique,
  event_type text not null,
  provider_email_id text,
  created_at timestamptz not null default now()
);

create table if not exists health_checks (
  id text primary key,
  service text not null unique,
  state text not null,
  evidence text not null,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  latency_ms integer,
  failure_streak integer not null default 0,
  impact text
);

create table if not exists audit_log (
  id text primary key,
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  result text not null,
  request_id text,
  created_at timestamptz not null default now()
);

create table if not exists daily_facts (
  day date primary key,
  booked_paise bigint not null default 0,
  realised_paise bigint not null default 0,
  orders_booked integer not null default 0,
  orders_realised integer not null default 0,
  sessions integer,
  add_to_cart integer,
  checkouts integer,
  purchases integer,
  ad_spend_paise bigint,
  provenance text not null default 'DEMO',
  notes text
);

create table if not exists source_of_truth (
  fact text primary key,
  source text not null,
  current_impl text not null,
  risk text not null,
  recommended text not null,
  status text not null default 'WATCH'
);
