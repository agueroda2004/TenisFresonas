-- ===========================================================================
-- Tenis Fresonas · Lectura pública de products (para la landing)
-- Pega esto en el SQL Editor de Supabase. Es idempotente.
-- ===========================================================================

-- La landing es pública: cualquier visitante (rol anon) puede listar productos.
-- Escritura sigue restringida a usuarios autenticados (las políticas existentes).
drop policy if exists "products_select_anon" on public.products;
create policy "products_select_anon"
  on public.products for select
  to anon
  using (true);