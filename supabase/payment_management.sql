-- Manual Supabase SQL: COD payment collection for delivery partners.
-- Run manually in Supabase Dashboard > SQL Editor after delivery_panel.sql.
-- Existing orders.payment_method and orders.payment_status columns are reused.
-- No table or column is created by this migration. Values remain lowercase to
-- preserve the existing application convention; the UI displays COD/ONLINE.

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cod','online'));

drop policy if exists "Delivery users can read active delivery orders" on public.orders;
create policy "Delivery users can read active delivery orders" on public.orders
for select to authenticated
using (
  public.is_delivery_user()
  and order_type = 'delivery'
  and (
    status in ('ready','out_for_delivery')
    or (status = 'delivered' and payment_method = 'cod')
  )
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
      and (
        o.status in ('ready','out_for_delivery')
        or (o.status = 'delivered' and o.payment_method = 'cod')
      )
  )
);

-- Delivery users keep no direct UPDATE permission. This security-definer RPC
-- can only collect a pending COD payment after the order is delivered.
create or replace function public.mark_delivery_order_paid(p_order_id uuid)
returns table (order_id uuid, payment_status text, changed_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_delivery_user() then
    raise exception 'This account is not an active delivery partner.' using errcode = '42501';
  end if;

  select o.* into v_order
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;
  if v_order.order_type <> 'delivery' then
    raise exception 'Only delivery orders can be collected here.' using errcode = '22000';
  end if;
  if v_order.status <> 'delivered' then
    raise exception 'The order must be delivered before collecting payment.' using errcode = '22000';
  end if;
  if v_order.payment_method <> 'cod' then
    raise exception 'Online payments cannot be changed by delivery partners.' using errcode = '42501';
  end if;
  if v_order.payment_status <> 'pending' then
    raise exception 'This payment is already %.', v_order.payment_status using errcode = '22000';
  end if;

  return query
  update public.orders o
  set payment_status = 'paid'
  where o.id = p_order_id
  returning o.id,o.payment_status,o.updated_at;
end;
$$;

revoke all on function public.mark_delivery_order_paid(uuid) from public, anon, authenticated;
grant execute on function public.mark_delivery_order_paid(uuid) to authenticated;

notify pgrst, 'reload schema';
