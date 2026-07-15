-- ===========================================================================
-- Tenis Fresonas · Tabla products + RLS + trigger updated_at
-- Pega esto completo en el SQL Editor de Supabase y ejecútalo.
-- Idempotente: puedes correrlo varias veces sin romper nada.
-- ===========================================================================

-- 1) Tabla
create table if not exists public.products (
  id                uuid          primary key default gen_random_uuid(),
  name              text          not null,
  type              text          not null,
  brand             text          not null,
  price             numeric(12,2) not null check (price >= 0),
  image_url         text          not null,
  image_file_id     text          not null,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

-- 2) Índices útiles para listar
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_brand_idx      on public.products (brand);
create index if not exists products_type_idx       on public.products (type);

-- 3) Trigger para mantener updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 4) RLS
alter table public.products enable row level security;

-- Solo usuarios autenticados (los admins) pueden leer/escribir.
-- Como el login está restringido al admin, esta política cubre el caso.
drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "products_insert_authenticated" on public.products;
create policy "products_insert_authenticated"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "products_update_authenticated" on public.products;
create policy "products_update_authenticated"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "products_delete_authenticated" on public.products;
create policy "products_delete_authenticated"
  on public.products for delete
  to authenticated
  using (true);