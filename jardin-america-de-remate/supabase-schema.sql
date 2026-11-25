-- Ejecutar en Supabase SQL Editor
-- Modelo: prestador crea ofertas -> admin aprueba -> web publica muestra aprobadas

create extension if not exists "pgcrypto";

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null check (char_length(titulo) >= 4),
  descripcion text not null,
  rubro text not null check (rubro in ('comercio', 'alojamiento', 'gastronomico', 'artesano')),
  beneficio text not null,
  imagen_url text,
  fecha_inicio date not null,
  fecha_fin date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada', 'pausada')),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fecha_validas check (fecha_fin >= fecha_inicio)
);

alter table public.offers add column if not exists comercio_nombre text;
alter table public.offers add column if not exists comercio_ubicacion text;
alter table public.offers add column if not exists comercio_telefono text;
alter table public.offers add column if not exists imagen_urls jsonb;
alter table public.offers add column if not exists precio_regular text;
alter table public.offers add column if not exists precio_promocional text;
alter table public.offers add column if not exists comercio_whatsapp text;

create index if not exists offers_owner_idx on public.offers(owner_id);
create index if not exists offers_estado_idx on public.offers(estado);
create index if not exists offers_vigencia_idx on public.offers(fecha_inicio, fecha_fin);
create index if not exists offers_public_feed_idx on public.offers(estado, created_at desc);

alter table public.offers
drop constraint if exists offers_mayo_22_25_validas;

alter table public.offers
add constraint offers_mayo_22_25_validas
check (
  extract(month from fecha_inicio) = 5
  and extract(month from fecha_fin) = 5
  and extract(day from fecha_inicio) >= 22
  and extract(day from fecha_fin) <= 25
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

alter table public.offers enable row level security;

-- Lectura publica: solo ofertas aprobadas
drop policy if exists "public_can_read_approved_offers" on public.offers;
create policy "public_can_read_approved_offers"
on public.offers
for select
to anon, authenticated
using (estado = 'aprobada');

-- Prestador autenticado: puede crear ofertas propias
drop policy if exists "owner_can_insert_offers" on public.offers;
create policy "owner_can_insert_offers"
on public.offers
for insert
to authenticated
with check (auth.uid() = owner_id and estado = 'pendiente');

-- Prestador autenticado: puede ver sus ofertas
drop policy if exists "owner_can_select_own_offers" on public.offers;
create policy "owner_can_select_own_offers"
on public.offers
for select
to authenticated
using (owner_id = auth.uid() or estado = 'aprobada');

-- Prestador: puede editar cualquiera de sus ofertas (incluidas aprobadas/publicadas)
drop policy if exists "owner_can_update_non_approved_offers" on public.offers;
drop policy if exists "owner_can_update_own_offers" on public.offers;
create policy "owner_can_update_own_offers"
on public.offers
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Admin: control total por claim app_metadata.role = 'admin'
drop policy if exists "admin_full_access_offers" on public.offers;
create policy "admin_full_access_offers"
on public.offers
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Storage para imagenes de ofertas (URLs publicas en offer-images/{owner_id}/...)
insert into storage.buckets (id, name, public)
values ('offer-images', 'offer-images', true)
on conflict (id) do nothing;

drop policy if exists "public_can_read_offer_images" on storage.objects;
create policy "public_can_read_offer_images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'offer-images');

drop policy if exists "authenticated_can_upload_own_offer_images" on storage.objects;
create policy "authenticated_can_upload_own_offer_images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'offer-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "authenticated_can_update_own_offer_images" on storage.objects;
create policy "authenticated_can_update_own_offer_images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'offer-images'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'offer-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "authenticated_can_delete_own_offer_images" on storage.objects;
create policy "authenticated_can_delete_own_offer_images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'offer-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) >= 4),
  descripcion text not null,
  categoria text not null,
  ubicacion text not null,
  inicia_en timestamptz not null,
  finaliza_en timestamptz not null,
  imagen_url text,
  estado text not null default 'borrador' check (estado in ('borrador', 'publicado', 'cancelado')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_fechas_validas check (finaliza_en >= inicia_en)
);

create index if not exists events_estado_idx on public.events(estado);
create index if not exists events_fechas_idx on public.events(inicia_en, finaliza_en);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

drop policy if exists "public_can_read_published_events" on public.events;
create policy "public_can_read_published_events"
on public.events
for select
to anon, authenticated
using (estado = 'publicado');

drop policy if exists "admin_full_access_events" on public.events;
create policy "admin_full_access_events"
on public.events
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.circuit_signups (
  id uuid primary key default gen_random_uuid(),
  circuito text not null check (circuito in ('circuito_natural', 'circuito_cultural')),
  dia_actividad text not null check (dia_actividad in ('sabado_23_mayo', 'domingo_24_mayo')),
  nombre_completo text not null,
  dni text not null,
  fecha_nacimiento date not null,
  contacto text not null,
  procedencia text not null,
  created_at timestamptz not null default now()
);

create index if not exists circuit_signups_created_at_idx on public.circuit_signups(created_at desc);
create index if not exists circuit_signups_circuito_dia_idx on public.circuit_signups(circuito, dia_actividad);

alter table public.circuit_signups enable row level security;

drop policy if exists "public_can_insert_circuit_signups" on public.circuit_signups;
create policy "public_can_insert_circuit_signups"
on public.circuit_signups
for insert
to anon, authenticated
with check (true);

drop policy if exists "admin_can_read_circuit_signups" on public.circuit_signups;
create policy "admin_can_read_circuit_signups"
on public.circuit_signups
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Informes de posible incumplimiento por parte de prestadores (sitio público -> panel admin)
create table if not exists public.provider_reports (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers(id) on delete set null,
  comercio_indicado text not null,
  titulo_promocion text,
  nombre_informante text not null,
  contacto_informante text not null,
  detalle text not null,
  acepto_terminos boolean not null,
  estado text not null default 'nueva' check (estado in ('nueva', 'vista', 'archivada')),
  created_at timestamptz not null default now(),
  constraint provider_reports_detalle_len check (char_length(trim(detalle)) between 20 and 8000),
  constraint provider_reports_comercio_len check (char_length(trim(comercio_indicado)) >= 2),
  constraint provider_reports_informante_len check (char_length(trim(nombre_informante)) >= 2),
  constraint provider_reports_contacto_len check (char_length(trim(contacto_informante)) >= 3)
);

create index if not exists provider_reports_created_idx on public.provider_reports(created_at desc);
create index if not exists provider_reports_estado_idx on public.provider_reports(estado);

alter table public.provider_reports enable row level security;

drop policy if exists "public_can_insert_provider_reports" on public.provider_reports;
create policy "public_can_insert_provider_reports"
on public.provider_reports
for insert
to anon, authenticated
with check (
  acepto_terminos is true
  and char_length(trim(detalle)) >= 20
  and char_length(trim(comercio_indicado)) >= 2
  and char_length(trim(nombre_informante)) >= 2
  and char_length(trim(contacto_informante)) >= 3
);

drop policy if exists "admin_can_select_provider_reports" on public.provider_reports;
create policy "admin_can_select_provider_reports"
on public.provider_reports
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_can_update_provider_reports" on public.provider_reports;
create policy "admin_can_update_provider_reports"
on public.provider_reports
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
