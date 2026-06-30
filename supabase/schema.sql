-- Corn Bite reservation platform — run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_id text not null unique,
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 80),
  phone text not null check (phone ~ '^\+?[0-9 -]{10,15}$'),
  booking_date date not null,
  booking_time time not null,
  guests smallint not null check (guests between 1 and 20),
  table_number smallint not null check (table_number between 1 and 20),
  status text not null default 'pending' check (status in ('pending','confirmed','arrived','occupied','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_booking_date_idx on public.reservations (booking_date);
create index if not exists reservations_booking_time_idx on public.reservations (booking_time);
create index if not exists reservations_table_number_idx on public.reservations (table_number);
create index if not exists reservations_service_idx on public.reservations (booking_date, booking_time, table_number);

-- This partial unique index is the final concurrency guard. Completed/cancelled slots can be rebooked.
create unique index if not exists reservations_active_slot_unique
  on public.reservations (booking_date, booking_time, table_number)
  where status in ('pending','confirmed','arrived','occupied');

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

create or replace function public.validate_reservation_transition()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = old.status then return new; end if;
  if not (
    (old.status = 'pending' and new.status in ('confirmed','cancelled')) or
    (old.status = 'confirmed' and new.status in ('arrived','occupied','cancelled')) or
    (old.status = 'arrived' and new.status in ('occupied','completed','cancelled')) or
    (old.status = 'occupied' and new.status in ('completed','cancelled'))
  ) then
    raise exception 'Invalid reservation transition: % to %', old.status, new.status using errcode = '22000';
  end if;
  return new;
end;
$$;

drop trigger if exists reservations_validate_transition on public.reservations;
create trigger reservations_validate_transition before update of status on public.reservations
for each row execute function public.validate_reservation_transition();

-- SECURITY DEFINER avoids recursive RLS checks. Only a boolean is exposed.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Customers can create pending reservations" on public.reservations;
create policy "Customers can create pending reservations" on public.reservations
for insert to anon, authenticated with check (status = 'pending');

drop policy if exists "Admins can read reservations" on public.reservations;
create policy "Admins can read reservations" on public.reservations
for select to authenticated using (public.is_admin());

drop policy if exists "Admins can update reservations" on public.reservations;
create policy "Admins can update reservations" on public.reservations
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete reservations" on public.reservations;
create policy "Admins can delete reservations" on public.reservations
for delete to authenticated using (public.is_admin());

revoke all on public.admin_users from anon, authenticated;
revoke all on public.reservations from anon, authenticated;
grant insert on public.reservations to anon, authenticated;
grant select, update, delete on public.reservations to authenticated;

-- Public-safe availability: returns no guest PII.
create or replace function public.get_table_availability(p_date date, p_time time)
returns table (table_number smallint, table_status text)
language sql stable security definer set search_path = public, pg_temp as $$
  select r.table_number,
    case when r.status in ('arrived','occupied') then 'occupied' else 'reserved' end
  from public.reservations r
  where r.booking_date = p_date and r.booking_time = p_time
    and r.status in ('pending','confirmed','arrived','occupied');
$$;

revoke all on function public.get_table_availability(date,time) from public;
grant execute on function public.get_table_availability(date,time) to anon, authenticated;

-- Atomic booking RPC. The unique partial index protects against simultaneous requests.
create or replace function public.create_reservation(
  p_customer_name text, p_phone text, p_booking_date date, p_booking_time time,
  p_guests smallint, p_table_number smallint
)
returns table (reservation_id text, booking_date date, booking_time time, table_number smallint)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_code text;
  v_row public.reservations%rowtype;
  v_attempts smallint := 0;
begin
  if p_booking_date < current_date then raise exception 'Booking date cannot be in the past' using errcode='22000'; end if;
  if char_length(trim(p_customer_name)) not between 2 and 80 then raise exception 'Enter a valid customer name' using errcode='22000'; end if;
  if p_phone !~ '^\+?[0-9 -]{10,15}$' then raise exception 'Enter a valid phone number' using errcode='22000'; end if;
  if p_guests not between 1 and 20 or p_table_number not between 1 and 20 then raise exception 'Invalid party size or table' using errcode='22000'; end if;

  if exists(select 1 from public.reservations r where r.booking_date=p_booking_date and r.booking_time=p_booking_time and r.table_number=p_table_number and r.status in ('pending','confirmed','arrived','occupied')) then
    raise exception 'This table is already reserved.' using errcode='23505';
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := 'CB-RES-' || upper(substr(encode(gen_random_bytes(3),'hex'),1,4));
    begin
      insert into public.reservations (reservation_id,customer_name,phone,booking_date,booking_time,guests,table_number)
      values (v_code,trim(p_customer_name),trim(p_phone),p_booking_date,p_booking_time,p_guests,p_table_number)
      returning * into v_row;
      exit;
    exception when unique_violation then
      if exists(select 1 from public.reservations r where r.booking_date=p_booking_date and r.booking_time=p_booking_time and r.table_number=p_table_number and r.status in ('pending','confirmed','arrived','occupied')) then
        raise exception 'This table is already reserved.' using errcode='23505';
      end if;
      if v_attempts >= 5 then raise exception 'Could not generate a reservation ID. Please try again.'; end if;
    end;
  end loop;
  return query select v_row.reservation_id, v_row.booking_date, v_row.booking_time, v_row.table_number;
end;
$$;

revoke all on function public.create_reservation(text,text,date,time,smallint,smallint) from public;
grant execute on function public.create_reservation(text,text,date,time,smallint,smallint) to anon, authenticated;

-- Supabase Realtime requires the table in the publication. Safe to re-run.
do $$ begin
  alter publication supabase_realtime add table public.reservations;
exception when duplicate_object then null;
end $$;

-- After creating an admin in Authentication > Users, authorize it with:
-- insert into public.admin_users (user_id) values ('AUTH-USER-UUID');
