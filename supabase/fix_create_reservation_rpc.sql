-- Run this file once in Supabase Dashboard > SQL Editor.
-- It repairs the exact RPC signature used by src/pages/Reserve.jsx.
-- It does not modify tables, reservation data, RLS policies, or admin logic.

drop function if exists public.create_reservation(text, text, date, time, smallint, smallint, text);
drop function if exists public.create_reservation(text, text, date, time, smallint, smallint);

create function public.create_reservation(
  p_customer_name text,
  p_phone text,
  p_booking_date date,
  p_booking_time time,
  p_guests smallint,
  p_table_number smallint
)
returns table (
  reservation_id text,
  booking_date date,
  booking_time time,
  table_number smallint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
  v_row public.reservations%rowtype;
  v_attempts smallint := 0;
begin
  if p_booking_date < current_date then
    raise exception 'Booking date cannot be in the past' using errcode = '22000';
  end if;

  if char_length(trim(p_customer_name)) not between 2 and 80 then
    raise exception 'Enter a valid customer name' using errcode = '22000';
  end if;

  if p_phone !~ '^\+?[0-9 -]{10,15}$' then
    raise exception 'Enter a valid phone number' using errcode = '22000';
  end if;

  if p_guests not between 1 and 20 or p_table_number not between 1 and 20 then
    raise exception 'Invalid party size or table' using errcode = '22000';
  end if;

  if exists (
    select 1
    from public.reservations r
    where r.booking_date = p_booking_date
      and r.booking_time = p_booking_time
      and r.table_number = p_table_number
      and r.status in ('pending', 'confirmed', 'arrived', 'occupied')
  ) then
    raise exception 'This table is already reserved.' using errcode = '23505';
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := 'CB-RES-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

    begin
      insert into public.reservations (
        reservation_id,
        customer_name,
        phone,
        booking_date,
        booking_time,
        guests,
        table_number
      )
      values (
        v_code,
        trim(p_customer_name),
        trim(p_phone),
        p_booking_date,
        p_booking_time,
        p_guests,
        p_table_number
      )
      returning * into v_row;

      exit;
    exception when unique_violation then
      if exists (
        select 1
        from public.reservations r
        where r.booking_date = p_booking_date
          and r.booking_time = p_booking_time
          and r.table_number = p_table_number
          and r.status in ('pending', 'confirmed', 'arrived', 'occupied')
      ) then
        raise exception 'This table is already reserved.' using errcode = '23505';
      end if;

      if v_attempts >= 5 then
        raise exception 'Could not generate a reservation ID. Please try again.';
      end if;
    end;
  end loop;

  return query
  select
    v_row.reservation_id,
    v_row.booking_date,
    v_row.booking_time,
    v_row.table_number;
end;
$$;

revoke all on function public.create_reservation(text, text, date, time, smallint, smallint) from public;
grant execute on function public.create_reservation(text, text, date, time, smallint, smallint)
  to anon, authenticated;

notify pgrst, 'reload schema';
