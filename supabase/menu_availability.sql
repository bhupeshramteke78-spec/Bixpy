-- Manual Supabase SQL: menu availability management.
-- Run this file manually in Supabase Dashboard > SQL Editor.
-- The menu_items.is_available column already exists, so no ALTER TABLE is needed.

alter table public.menu_items enable row level security;

-- Customers need to read unavailable rows so the UI can label them clearly.
drop policy if exists "Anyone can read available menu items" on public.menu_items;
drop policy if exists "Anyone can read menu items" on public.menu_items;
create policy "Anyone can read menu items" on public.menu_items
for select to anon, authenticated using (true);

-- Only users listed in public.admin_users can change menu availability.
drop policy if exists "Admins can update menu availability" on public.menu_items;
create policy "Admins can update menu availability" on public.menu_items
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke update on public.menu_items from anon, authenticated;
grant update (is_available) on public.menu_items to authenticated;

-- Keep customer menus in sync when an admin toggles an item.
do $$ begin
  alter publication supabase_realtime add table public.menu_items;
exception when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
