-- Abandoned carts as a first-class object (DEMO). Not a production cart store.
-- Recovery mail is blocked while production email_events schema cache is missing.

create table if not exists carts (
  id text primary key,
  email_masked text,
  email_verified integer not null default 0,
  sku text not null,
  qty integer not null,
  product_paise integer not null,
  last_activity_at timestamptz not null,
  converted_order_code text,
  provenance text not null default 'DEMO',
  created_at timestamptz not null default now()
);

create index if not exists carts_activity_idx on carts (last_activity_at desc);
