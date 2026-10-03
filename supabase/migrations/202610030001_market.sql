begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.booths (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 1500),
  category text not null default '기타' check (char_length(category) between 1 and 30),
  booth_number text not null check (char_length(booth_number) between 1 and 20),
  location_text text not null default '계단 위 매대' check (char_length(location_text) <= 200),
  image_path text,
  thumbnail_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booth_image_path check (image_path is null or image_path like id::text || '/%' or image_path = '/sample-images/booth-01.jpg'),
  constraint booth_thumb_path check (thumbnail_path is null or thumbnail_path like id::text || '/%' or thumbnail_path = '/sample-images/booth-01-thumb.jpg')
);
create index booths_public_order on public.booths (sort_order, id) where is_active;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  booth_id uuid not null references public.booths(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  image_path text,
  thumbnail_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_image_path check (image_path is null or image_path like booth_id::text || '/%'),
  constraint product_thumb_path check (thumbnail_path is null or thumbnail_path like booth_id::text || '/%')
);
create index products_booth_order on public.products (booth_id, sort_order, created_at, id);

create table private.vendor_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  booth_id uuid not null unique references public.booths(id) on delete cascade,
  login_id text not null unique check (login_id ~ '^[a-z0-9][a-z0-9_-]{2,31}$'),
  created_at timestamptz not null default now()
);
alter table private.vendor_accounts enable row level security;
revoke all on private.vendor_accounts from public, anon, authenticated;

create function public.my_booth_id() returns uuid
language sql stable security definer set search_path = ''
as $$ select booth_id from private.vendor_accounts where user_id = (select auth.uid()) $$;
revoke all on function public.my_booth_id() from public, anon;
grant execute on function public.my_booth_id() to authenticated;

create function public.assign_vendor_account(vendor_user_id uuid, target_booth_id uuid, vendor_login_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from auth.users where id = vendor_user_id and email = vendor_login_id || '@vendors.yangjae-market.invalid') then
    raise exception 'Vendor account does not match login ID';
  end if;
  insert into private.vendor_accounts(user_id, booth_id, login_id) values (vendor_user_id, target_booth_id, vendor_login_id);
end;
$$;
revoke all on function public.assign_vendor_account(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.assign_vendor_account(uuid, uuid, text) to service_role;

create function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger booths_updated_at before update on public.booths for each row execute function private.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function private.set_updated_at();

alter table public.booths enable row level security;
alter table public.products enable row level security;
revoke all on public.booths, public.products from anon, authenticated;
grant select on public.booths, public.products to anon, authenticated;
grant update(description, image_path, thumbnail_path) on public.booths to authenticated;
grant insert(booth_id, name, description, image_path, thumbnail_path, sort_order) on public.products to authenticated;
grant update(name, description, image_path, thumbnail_path, sort_order) on public.products to authenticated;
grant delete on public.products to authenticated;
grant all on public.booths, public.products to service_role;

create policy booths_public_read on public.booths for select to anon, authenticated using (is_active);
create policy booths_vendor_read on public.booths for select to authenticated using (id = (select public.my_booth_id()));
create policy booths_vendor_update on public.booths for update to authenticated
  using (id = (select public.my_booth_id())) with check (id = (select public.my_booth_id()));
create policy products_public_read on public.products for select to anon, authenticated
  using (exists (select 1 from public.booths where id = booth_id and is_active));
create policy products_vendor_read on public.products for select to authenticated
  using (booth_id = (select public.my_booth_id()));
create policy products_vendor_insert on public.products for insert to authenticated
  with check (booth_id = (select public.my_booth_id()));
create policy products_vendor_update on public.products for update to authenticated
  using (booth_id = (select public.my_booth_id())) with check (booth_id = (select public.my_booth_id()));
create policy products_vendor_delete on public.products for delete to authenticated
  using (booth_id = (select public.my_booth_id()));

create function public.list_booths(search_text text default '', category_filter text default '', page_offset integer default 0, page_size integer default 13)
returns table(id uuid, name text, description text, category text, booth_number text, location_text text, image_path text, thumbnail_path text, sort_order integer, is_active boolean, is_sample boolean, product_names text[])
language sql stable security invoker set search_path = '' as $$
  select b.id, b.name, b.description, b.category, b.booth_number, b.location_text, b.image_path, b.thumbnail_path, b.sort_order, b.is_active, b.is_sample,
    array(select p.name from public.products p where p.booth_id = b.id order by p.sort_order, p.created_at, p.id limit 3)
  from public.booths b
  where b.is_active and (category_filter = '' or b.category = category_filter)
    and (btrim(search_text) = '' or position(lower(left(btrim(search_text), 100)) in lower(b.name || ' ' || b.description || ' ' || b.category || ' ' || b.booth_number)) > 0
      or exists (select 1 from public.products p where p.booth_id = b.id and position(lower(left(btrim(search_text), 100)) in lower(p.name || ' ' || p.description)) > 0))
  order by b.sort_order, b.id
  limit least(greatest(page_size, 1), 25) offset greatest(page_offset, 0);
$$;
revoke all on function public.list_booths(text, text, integer, integer) from public;
grant execute on function public.list_booths(text, text, integer, integer) to anon, authenticated;

create function public.booth_categories() returns setof text
language sql stable security invoker set search_path = '' as $$
  select distinct category from public.booths where is_active order by category;
$$;
revoke all on function public.booth_categories() from public;
grant execute on function public.booth_categories() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('market-images', 'market-images', true, 1048576, array['image/jpeg','image/png','image/webp']);
create policy market_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'market-images' and (storage.foldername(name))[1] = (select public.my_booth_id())::text);
create policy market_owner_read on storage.objects for select to authenticated
  using (bucket_id = 'market-images' and (storage.foldername(name))[1] = (select public.my_booth_id())::text);
create policy market_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'market-images' and (storage.foldername(name))[1] = (select public.my_booth_id())::text);
-- Images use fresh UUID paths: overwrites and path moves are deliberately not granted.

insert into public.booths (id, name, description, category, booth_number, location_text, image_path, thumbnail_path, is_sample)
values ('a6000000-0000-4000-8000-000000000001', '매대 01', '따뜻한 조명 아래 놓인 주방·생활 소품들을 둘러보세요. 제공된 사진으로 구성한 샘플 매대입니다. 실제 업체와 판매상품은 준비되는 대로 등록됩니다.', '주방·생활', '01', '계단 위 · 정확한 매대 위치는 준비 중이에요.', '/sample-images/booth-01.jpg', '/sample-images/booth-01-thumb.jpg', true);

commit;
