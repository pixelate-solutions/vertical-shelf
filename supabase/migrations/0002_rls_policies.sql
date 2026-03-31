-- Clerk owns authentication, and the app now uses server-side Supabase access.
-- Leave row-level security disabled unless you later add Clerk-to-Supabase JWT mapping.

alter table profiles disable row level security;
alter table memberships disable row level security;
alter table catalog_items disable row level security;
alter table pickup_windows disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table custom_requests disable row level security;
alter table wallet_transactions disable row level security;
alter table wallet_balances disable row level security;
