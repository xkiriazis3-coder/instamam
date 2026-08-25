-- =============================================================================
-- Insta.mam Meze Bar — initial schema
--
-- Design rules applied throughout:
--   * RLS is enabled on EVERY table, with policies written explicitly.
--     A Supabase table without RLS is world-readable and world-writable
--     through the anon key that ships in the frontend.
--   * The public role can INSERT reservations and can never SELECT them.
--     Booking rows contain a name and a phone number; anon read access would
--     hand the entire customer list to anyone who opens devtools. This is the
--     single most common Supabase data leak and the most important line here.
--   * Menu and hours are publicly readable but only staff-writable.
--   * Validation lives in CHECK constraints, not only in the browser, because
--     the REST endpoint is reachable directly.
-- =============================================================================

-- ---------------------------------------------------------------- extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- helper
-- Single source of truth for "is this request from signed-in staff?".
-- Kept in its own schema so it is not exposed over the REST API.
create schema if not exists private;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.role() = 'authenticated';
$$;

comment on function private.is_staff is
  'True for any signed-in user. This site has exactly one class of user (the
   owner), so authentication and authorisation are the same check. If staff
   accounts with different powers are ever added, change this function and
   every policy inherits it.';

-- =============================================================================
-- MENU
-- =============================================================================
create table public.menu_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
              check (slug ~ '^[a-z0-9][a-z0-9-]{0,40}$'),
  name_el     text not null check (length(trim(name_el)) between 1 and 60),
  name_en     text not null check (length(trim(name_en)) between 1 and 60),
  position    integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.menu_categories(id) on delete cascade,
  name_el      text not null check (length(trim(name_el)) between 1 and 80),
  name_en      text not null check (length(trim(name_en)) between 1 and 80),
  desc_el      text check (length(desc_el) <= 200),
  desc_en      text check (length(desc_en) <= 200),
  -- numeric, not text: prices must be sortable and arithmetic-safe.
  -- null means "no price shown", which the design renders as a dash.
  price        numeric(6,2) check (price is null or (price >= 0 and price < 10000)),
  position     integer not null default 0,
  visible      boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index menu_items_category_idx on public.menu_items (category_id, position);
create index menu_categories_pos_idx  on public.menu_categories (position) where visible;

-- =============================================================================
-- OPENING HOURS
-- day_of_week follows JS getDay(): 0 = Sunday .. 6 = Saturday.
-- closes_at earlier than opens_at means the session runs past midnight.
-- =============================================================================
create table public.opening_hours (
  day_of_week  smallint primary key check (day_of_week between 0 and 6),
  opens_at     time,
  closes_at    time,
  is_closed    boolean not null default false,
  updated_at   timestamptz not null default now(),
  -- either the day is closed, or it has both times. Never half-specified.
  constraint hours_complete check (
    (is_closed and opens_at is null and closes_at is null)
    or (not is_closed and opens_at is not null and closes_at is not null)
  )
);

-- =============================================================================
-- RESERVATIONS
-- =============================================================================
create type public.reservation_status as enum ('pending', 'confirmed', 'cancelled');

create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 2 and 80),
  phone       text not null check (phone ~ '^[0-9 +()\-]{10,20}$'),
  booking_date date not null,
  booking_time time not null,
  people      smallint not null check (people between 1 and 60),
  note        text check (length(note) <= 500),
  status      public.reservation_status not null default 'pending',
  created_at  timestamptz not null default now(),
  -- Cannot book the past. Enforced server-side because the REST endpoint is
  -- reachable without the browser, so the min= attribute proves nothing.
  constraint booking_not_in_past check (booking_date >= (now() at time zone 'Europe/Athens')::date)
);

create index reservations_date_idx   on public.reservations (booking_date, booking_time);
create index reservations_status_idx on public.reservations (status, created_at desc);

-- Cheap abuse brake: no more than 5 pending requests from one phone number
-- for the same day. Not a substitute for a real rate limiter, but it stops
-- the obvious script that submits the form in a loop.
create or replace function public.check_reservation_flood()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.reservations
      where phone = new.phone
        and booking_date = new.booking_date
        and status = 'pending') >= 5 then
    raise exception 'Too many pending requests for this number on this date';
  end if;
  return new;
end;
$$;

create trigger reservations_flood_brake
  before insert on public.reservations
  for each row execute function public.check_reservation_flood();

-- =============================================================================
-- updated_at maintenance
-- =============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger menu_categories_touch before update on public.menu_categories
  for each row execute function public.touch_updated_at();
create trigger menu_items_touch before update on public.menu_items
  for each row execute function public.touch_updated_at();
create trigger opening_hours_touch before update on public.opening_hours
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.opening_hours   enable row level security;
alter table public.reservations    enable row level security;

-- Force RLS even for the table owner, so a mistake in a definer function
-- cannot quietly bypass these policies.
alter table public.reservations force row level security;

-- ---- MENU: world-readable when visible, staff-writable ----------------------
create policy menu_categories_public_read on public.menu_categories
  for select to anon, authenticated using (visible);

create policy menu_categories_staff_write on public.menu_categories
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

create policy menu_items_public_read on public.menu_items
  for select to anon, authenticated
  using (
    visible
    and exists (select 1 from public.menu_categories c
                where c.id = menu_items.category_id and c.visible)
  );

create policy menu_items_staff_write on public.menu_items
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

-- ---- HOURS: world-readable, staff-writable ----------------------------------
create policy opening_hours_public_read on public.opening_hours
  for select to anon, authenticated using (true);

create policy opening_hours_staff_write on public.opening_hours
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

-- ---- RESERVATIONS: the important one ----------------------------------------
-- Anonymous visitors may create a booking request and nothing else.
-- There is deliberately NO select policy for anon: without one, RLS denies
-- reads by default, so the customer list cannot be enumerated through the
-- public API key.
create policy reservations_public_insert on public.reservations
  for insert to anon, authenticated
  with check (
    status = 'pending'                      -- nobody self-confirms a booking
    and booking_date >= (now() at time zone 'Europe/Athens')::date
    and booking_date <= ((now() at time zone 'Europe/Athens')::date + interval '1 year')
  );

create policy reservations_staff_read on public.reservations
  for select to authenticated using (private.is_staff());

create policy reservations_staff_update on public.reservations
  for update to authenticated using (private.is_staff()) with check (private.is_staff());

create policy reservations_staff_delete on public.reservations
  for delete to authenticated using (private.is_staff());

-- =============================================================================
-- API SURFACE
-- Revoke the blanket grants PostgREST relies on, then grant back exactly what
-- each role needs. Least privilege at the SQL level as well as the RLS level:
-- two independent locks rather than one.
-- =============================================================================
revoke all on all tables in schema public from anon, authenticated;

grant select on public.menu_categories, public.menu_items, public.opening_hours to anon, authenticated;
grant insert on public.reservations to anon, authenticated;
grant select, insert, update, delete
  on public.menu_categories, public.menu_items, public.opening_hours, public.reservations
  to authenticated;

-- anon must never reach the private schema
revoke all on schema private from anon, authenticated;
grant usage on schema private to authenticated;
