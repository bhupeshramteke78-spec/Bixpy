-- Manual deployment hardening for authenticated table reservations.
-- Run in Supabase Dashboard > SQL Editor after schema.sql.
-- This does not change reservation data or the reservation workflow.

drop policy if exists "Customers can create pending reservations" on public.reservations;
create policy "Authenticated customers can create pending reservations"
on public.reservations
for insert to authenticated
with check (auth.uid() is not null and status = 'pending');

revoke insert on public.reservations from anon;
grant insert on public.reservations to authenticated;

revoke execute on function public.create_reservation(text,text,date,time,smallint,smallint) from anon;
grant execute on function public.create_reservation(text,text,date,time,smallint,smallint) to authenticated;

notify pgrst, 'reload schema';
