begin;

-- Existing products keep an unknown price; do not invent prices for them.
alter table public.products add column price integer
  constraint products_price_nonnegative check (price >= 0);
-- Preserve the existing booth ownership RLS and add only the new column grants.
grant insert (price), update (price) on public.products to authenticated;

commit;
