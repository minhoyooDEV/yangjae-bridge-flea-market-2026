begin;

-- 2.0.0: the public booth page reads its content from these tables instead of
-- the bundled src/data/market.ts.

-- Market title and brand story (logo, hero, timeline, video, materials, series)
-- shown around the booth. The brand block is display-only JSON.
alter table public.booths
  add column market_name text not null default ''
    check (char_length(market_name) <= 80),
  add column brand jsonb not null default '{}'::jsonb
    check (jsonb_typeof(brand) = 'object');

-- slug keeps the stable product key used by analytics (product_id) since 1.2.0.
alter table public.products
  add column slug text unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,63}$'),
  add column category text not null default '기타'
    check (char_length(category) between 1 and 30),
  add column gallery text[] not null default '{}'
    check (cardinality(gallery) <= 10);

-- Images may also be files shipped with the site under public/brand/.
alter table public.booths drop constraint booth_image_path;
alter table public.booths add constraint booth_image_path check (
  image_path is null
  or image_path like id::text || '/%'
  or image_path like '/brand/%'
  or image_path = '/sample-images/booth-01.jpg'
);
alter table public.products drop constraint product_image_path;
alter table public.products add constraint product_image_path check (
  image_path is null
  or image_path like booth_id::text || '/%'
  or image_path like '/brand/%'
);

grant insert (category, gallery), update (category, gallery) on public.products to authenticated;

commit;
