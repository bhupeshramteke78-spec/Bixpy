-- Manual Supabase SQL: Delivery Boy Panel security and role setup.
-- Run manually in Supabase Dashboard > SQL Editor.
-- Existing order statuses are reused:
--   ready -> out_for_delivery (shown as Picked Up) -> delivered
-- No delivery_status column is required.

create table if not exists public.delivery_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.delivery_users enable row level security;

create or replace function public.is_delivery_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.delivery_users d
    where d.user_id = auth.uid() and d.is_active
  );
$$;

revoke all on function public.is_delivery_user() from public, anon;
grant execute on function public.is_delivery_user() to authenticated;

drop policy if exists "Delivery users can read their profile" on public.delivery_users;
create policy "Delivery users can read their profile" on public.delivery_users
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

revoke all on public.delivery_users from anon, authenticated;
grant select on public.delivery_users to authenticated;

drop policy if exists "Delivery users can read active delivery orders" on public.orders;
create policy "Delivery users can read active delivery orders" on public.orders
for select to authenticated
using (
  public.is_delivery_user()
  and order_type = 'delivery'
  and status in ('ready','out_for_delivery')
);

drop policy if exists "Delivery users can read active delivery items" on public.order_items;
create policy "Delivery users can read active delivery items" on public.order_items
for select to authenticated
using (
  public.is_delivery_user()
  and exists (
    select 1 from public.orders o
    where o.id = order_id
      and o.order_type = 'delivery'
      and o.status in ('ready','out_for_delivery')
  )
);

-- Delivery users receive no direct UPDATE policy. This RPC is the only allowed
-- write path and limits transitions to Ready -> Picked Up -> Delivered.
create or replace function public.update_delivery_order_status(
  p_order_id uuid,
  p_next_status text
)
returns table (order_id uuid, order_status text, changed_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current_status text;
  v_order_type text;
begin
  if not public.is_delivery_user() then
    raise exception 'This account is not an active delivery partner.' using errcode = '42501';
  end if;

  select o.status,o.order_type
  into v_current_status,v_order_type
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;
  if v_order_type <> 'delivery' then
    raise exception 'Pickup orders cannot be assigned for delivery.' using errcode = '22000';
  end if;
  if not (
    (v_current_status = 'ready' and p_next_status = 'out_for_delivery')
    or
    (v_current_status = 'out_for_delivery' and p_next_status = 'delivered')
  ) then
    raise exception 'Invalid delivery transition: % to %', v_current_status,p_next_status using errcode = '22000';
  end if;

  return query
  update public.orders o
  set status = p_next_status
  where o.id = p_order_id
  returning o.id,o.status,o.updated_at;
end;
$$;

revoke all on function public.update_delivery_order_status(uuid,text) from public, anon, authenticated;
grant execute on function public.update_delivery_order_status(uuid,text) to authenticated;

notify pgrst, 'reload schema';

-- After creating the delivery partner in Authentication > Users, authorize it:
-- insert into public.delivery_users (user_id,full_name,phone)
-- values ('AUTH-USER-UUID','Delivery Partner Name','9876543210');
