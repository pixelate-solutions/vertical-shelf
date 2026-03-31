-- ENUMS
create type membership_tier as enum ('slice_club', 'wholesale_member', 'business_partner');
create type membership_status as enum ('active', 'paused', 'pending', 'past_due', 'canceled');
create type order_status as enum ('draft', 'submitted', 'confirmed', 'ready', 'picked_up', 'canceled');
create type request_status as enum ('open', 'in_review', 'quoted', 'accepted', 'declined');
create type transaction_type as enum (
  'slice_earned', 'slice_redeemed',
  'points_earned', 'points_redeemed',
  'referral_credit'
);

-- PROFILES (mirrors Clerk users 1:1)
create table profiles (
  id            text primary key,
  full_name     text not null,
  business_name text,
  phone         text,
  email         text not null,
  is_owner      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- MEMBERSHIPS
create table memberships (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 text not null unique references profiles(id) on delete cascade,
  tier                    membership_tier not null,
  status                  membership_status not null default 'pending',
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  approved_at             timestamptz,
  approved_by             text references profiles(id),
  net30_enabled           boolean not null default false,
  custom_discount_pct     numeric(5,2),
  referral_code           text unique default substr(md5(random()::text), 1, 8),
  referred_by             uuid references memberships(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index idx_memberships_stripe_customer on memberships(stripe_customer_id);
create index idx_memberships_stripe_sub on memberships(stripe_subscription_id);

-- CATALOG ITEMS
create table catalog_items (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  description         text,
  image_url           text,
  unit_label          text not null,
  base_price          numeric(10,2) not null,
  min_tier            membership_tier not null default 'slice_club',
  is_active           boolean not null default true,
  stock_qty           integer not null default 0,
  low_stock_threshold integer not null default 10,
  supplier_name       text,
  supplier_contact    text,
  supplier_sku        text,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- PICKUP WINDOWS
create table pickup_windows (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  max_orders  integer not null default 20,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ORDERS
create table orders (
  id                       uuid primary key default gen_random_uuid(),
  membership_id            uuid not null references memberships(id),
  status                   order_status not null default 'draft',
  subtotal                 numeric(10,2) not null default 0,
  discount_pct             numeric(5,2) not null default 0,
  discount_amt             numeric(10,2) not null default 0,
  total                    numeric(10,2) not null default 0,
  pickup_window_id         uuid references pickup_windows(id),
  notes                    text,
  stripe_payment_intent_id text,
  stripe_invoice_id        text,
  owner_notes              text,
  submitted_at             timestamptz,
  confirmed_at             timestamptz,
  ready_at                 timestamptz,
  picked_up_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index idx_orders_membership_id on orders(membership_id);
create index idx_orders_status on orders(status);

-- ORDER LINE ITEMS
create table order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  catalog_item_id uuid not null references catalog_items(id),
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  line_total      numeric(10,2) not null,
  created_at      timestamptz not null default now()
);
create index idx_order_items_order_id on order_items(order_id);

-- CUSTOM REQUESTS
create table custom_requests (
  id            uuid primary key default gen_random_uuid(),
  membership_id uuid not null references memberships(id),
  subject       text not null,
  body          text not null,
  status        request_status not null default 'open',
  quoted_price  numeric(10,2),
  owner_notes   text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_custom_requests_membership on custom_requests(membership_id);
create index idx_custom_requests_status on custom_requests(status);

-- WALLET TRANSACTIONS
create table wallet_transactions (
  id            uuid primary key default gen_random_uuid(),
  membership_id uuid not null references memberships(id),
  type          transaction_type not null,
  amount        numeric(10,2) not null,
  description   text,
  order_id      uuid references orders(id),
  created_at    timestamptz not null default now()
);
create index idx_wallet_transactions_membership on wallet_transactions(membership_id);

-- WALLET BALANCES (denormalized for fast reads)
create table wallet_balances (
  membership_id    uuid primary key references memberships(id) on delete cascade,
  slice_balance    numeric(6,2) not null default 0,
  points_balance   integer not null default 0,
  referral_credits numeric(10,2) not null default 0,
  updated_at       timestamptz not null default now()
);

-- AUTO-UPDATE updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_memberships_updated_at
  before update on memberships
  for each row execute function set_updated_at();

create trigger trg_catalog_items_updated_at
  before update on catalog_items
  for each row execute function set_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create trigger trg_custom_requests_updated_at
  before update on custom_requests
  for each row execute function set_updated_at();

create trigger trg_wallet_balances_updated_at
  before update on wallet_balances
  for each row execute function set_updated_at();

-- WALLET BALANCE SYNC TRIGGER
create or replace function sync_wallet_balance()
returns trigger language plpgsql as $$
begin
  insert into wallet_balances (membership_id)
  values (new.membership_id)
  on conflict (membership_id) do nothing;

  update wallet_balances set
    slice_balance = (
      select coalesce(sum(case
        when type = 'slice_earned'    then amount
        when type = 'slice_redeemed'  then -amount
        else 0 end), 0)
      from wallet_transactions where membership_id = new.membership_id
    ),
    points_balance = (
      select coalesce(sum(case
        when type = 'points_earned'   then amount::integer
        when type = 'points_redeemed' then -amount::integer
        else 0 end), 0)
      from wallet_transactions where membership_id = new.membership_id
    ),
    referral_credits = (
      select coalesce(sum(case
        when type = 'referral_credit' then amount
        else 0 end), 0)
      from wallet_transactions where membership_id = new.membership_id
    ),
    updated_at = now()
  where membership_id = new.membership_id;

  return new;
end;
$$;

create trigger trg_wallet_balance_sync
  after insert on wallet_transactions
  for each row execute function sync_wallet_balance();

-- STOCK DECREMENT ON PICKUP
create or replace function decrement_stock_on_pickup()
returns trigger language plpgsql as $$
begin
  if new.status = 'picked_up' and old.status != 'picked_up' then
    update catalog_items ci
    set stock_qty = stock_qty - oi.quantity
    from order_items oi
    where oi.order_id = new.id
      and oi.catalog_item_id = ci.id;
  end if;
  return new;
end;
$$;

create trigger trg_decrement_stock
  after update on orders
  for each row execute function decrement_stock_on_pickup();
