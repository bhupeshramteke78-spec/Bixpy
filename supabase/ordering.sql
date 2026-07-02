-- Corn Bite food ordering and delivery module.
-- Run once in Supabase Dashboard > SQL Editor after the reservation schema.
-- This migration does not alter reservations, authentication, or admin_users.

create table if not exists public.menu_items (
  product_id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price integer not null check (price > 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 80),
  customer_email text not null,
  phone text not null check (phone ~ '^\+?[0-9 -]{10,15}$'),
  order_type text not null check (order_type in ('delivery','pickup')),
  address_line text,
  city text,
  postal_code text,
  notes text check (char_length(notes) <= 500),
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  payment_method text not null default 'cod' check (payment_method in ('cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','refunded','failed')),
  status text not null default 'placed' check (status in ('placed','confirmed','preparing','ready','out_for_delivery','delivered','completed','cancelled','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (order_type = 'pickup' and address_line is null and city is null and postal_code is null)
    or
    (order_type = 'delivery' and nullif(trim(address_line),'') is not null and nullif(trim(city),'') is not null and nullif(trim(postal_code),'') is not null)
  )
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price integer not null check (unit_price > 0),
  quantity smallint not null check (quantity between 1 and 20),
  line_total integer generated always as (unit_price * quantity) stored
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);

insert into public.menu_items (product_id,name,category,description,price,image_url) values
  ('hakka-noodles','Hakka Noodles','Chinese','Wok-tossed noodles, garden vegetables, spring onion.',140,'/images/hakka-noodles.webp'),
  ('veg-fried-rice','Veg Fried Rice','Chinese','Fragrant rice, crisp vegetables and house seasoning.',140,'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80'),
  ('manchurian-rice','Manchurian Rice','Chinese','Vegetable Manchurian with aromatic fried rice.',160,'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80'),
  ('chilli-garlic-noodles','Chilli Garlic Noodles','Chinese','Smoky noodles with roasted chilli and garlic.',160,'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80'),
  ('garden-harvest-pizza','Garden Harvest Pizza','Pizza','Bell pepper, sweet corn, olives and mozzarella.',240,'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80'),
  ('corn-bite-club','Corn Bite Club','Sandwiches','Triple-decker vegetables, cheese and signature spread.',170,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80'),
  ('smoky-paneer-burger','Smoky Paneer Burger','Burgers','Charred paneer patty, slaw and mint aioli.',190,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'),
  ('paneer-lababdar','Paneer Lababdar','Paneer','Cottage cheese in a rich tomato-cashew gravy.',260,'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80'),
  ('cream-of-tomato','Cream of Tomato','Soups','Slow-roasted tomato, basil oil and cream.',120,'https://images.unsplash.com/photo-1547592166-23ac45744acd8?auto=format&fit=crop&w=900&q=80'),
  ('cafe-mocha','Café Mocha','Coffee','Espresso, dark chocolate and steamed milk.',130,'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80'),
  ('green-apple-fizz','Green Apple Fizz','Mocktails','Green apple, lime, mint and sparkling soda.',150,'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'),
  ('belgian-chocolate-shake','Belgian Chocolate Shake','Shakes','Rich chocolate, ice cream and cocoa crumble.',180,'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80')
on conflict (product_id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url;

-- Synchronize the complete order catalog. Products removed from this list stay
-- in historical orders but cannot be added to a new order.
update public.menu_items set is_available = false;

insert into public.menu_items (product_id,name,category,description,price,image_url,is_available)
select x.id,x.name,x.category,'',x.price,null,true
from jsonb_to_recordset($catalog$
[
  {"id":"hakka-noodles","name":"Hakka Noodles","category":"Chinese","price":140},{"id":"veg-fried-rice","name":"Veg Fried Rice","category":"Chinese","price":140},{"id":"manchurian-rice-regular","name":"Manchurian Rice","category":"Chinese","price":160},{"id":"chilli-garlic-noodles","name":"Chilli Garlic Noodles","category":"Chinese","price":140},{"id":"chona-chilli","name":"Chona Chilli","category":"Chinese","price":140},{"id":"corn-roast","name":"Corn Roast","category":"Chinese","price":150},{"id":"corn-chilli-regular","name":"Corn Chilli","category":"Chinese","price":160},{"id":"crispy-corn","name":"Crispy Corn","category":"Chinese","price":160},{"id":"schezwan-noodles","name":"Schezwan Noodles","category":"Chinese","price":160},{"id":"schezwan-fried-rice","name":"Schezwan Fried Rice","category":"Chinese","price":160},{"id":"veg-65","name":"Veg 65","category":"Chinese","price":170},{"id":"lovely-corn","name":"Lovely Corn","category":"Chinese","price":170},{"id":"corn-chilli-special","name":"Corn Chilli","category":"Chinese","price":170},{"id":"manchurian-dry","name":"Manchurian Dry","category":"Chinese","price":160},{"id":"crispy-rice","name":"Crispy Rice","category":"Chinese","price":170},{"id":"paneer-chilli-dry","name":"Paneer Chilli Dry","category":"Chinese","price":180},{"id":"chopper-rice","name":"Chopper Rice","category":"Chinese","price":220},{"id":"manchurian-rice-special","name":"Manchurian Rice","category":"Chinese","price":220},
  {"id":"hot-coffee","name":"Hot Coffee","category":"Beverages","price":30},{"id":"masala-cold-drink","name":"Masala Cold Drink","category":"Beverages","price":60},{"id":"cold-coffee","name":"Cold Coffee","category":"Beverages","price":120},{"id":"virgin-mojito","name":"Virgin Mojito","category":"Beverages","price":120},{"id":"watermelon-mojito","name":"Watermelon Mojito","category":"Beverages","price":130},{"id":"blue-lagoon-mocktail","name":"Blue Lagoon Mocktail","category":"Beverages","price":130},{"id":"kit-kat-shake","name":"Kit Kat Shake","category":"Beverages","price":130},{"id":"oreo-shake","name":"Oreo Shake","category":"Beverages","price":140},{"id":"chocolate-shake","name":"Chocolate Shake","category":"Beverages","price":140},{"id":"cold-coffee-ice-cream","name":"Cold Coffee With Ice Cream","category":"Beverages","price":140},{"id":"kit-kat-shake-ice-cream","name":"Kit Kat Shake With Ice Cream","category":"Beverages","price":160},{"id":"chocolate-shake-ice-cream","name":"Chocolate Shake With Ice Cream","category":"Beverages","price":160},{"id":"oreo-shake-ice-cream","name":"Oreo Shake With Ice Cream","category":"Beverages","price":160},
  {"id":"cheese-corn-pizza","name":"Cheese Corn Pizza","category":"Pizza","price":210},{"id":"mexican-pizza","name":"Mexican Pizza","category":"Pizza","price":210},{"id":"veg-supreme-pizza","name":"Veg Supreme Pizza","category":"Pizza","price":210},{"id":"veg-delight-pizza","name":"Veg Delight Pizza","category":"Pizza","price":210},{"id":"paneer-tikka-pizza","name":"Paneer Tikka Pizza","category":"Pizza","price":280},{"id":"corn-bite-special-pizza","name":"Corn Bite Special Pizza","category":"Pizza","price":280},
  {"id":"plain-dosa","name":"Plain Dosa","category":"Mumbai Special Sigri Dosa","price":50},{"id":"butter-masala-dosa","name":"Butter Masala Dosa","category":"Mumbai Special Sigri Dosa","price":70},{"id":"onion-tomato-uttapam","name":"Onion Tomato Uttapam","category":"Mumbai Special Sigri Dosa","price":110},{"id":"masala-uttapam","name":"Masala Uttapam","category":"Mumbai Special Sigri Dosa","price":110},{"id":"special-masala-dosa","name":"Special Masala Dosa","category":"Mumbai Special Sigri Dosa","price":120},{"id":"pav-bhaji-dosa","name":"Pav Bhaji Dosa","category":"Mumbai Special Sigri Dosa","price":130},{"id":"paneer-chili-dosa","name":"Paneer Chili Dosa","category":"Mumbai Special Sigri Dosa","price":160},{"id":"jini-dosa","name":"Jini Dosa","category":"Mumbai Special Sigri Dosa","price":160},{"id":"golmal-dosa","name":"Golmal Dosa","category":"Mumbai Special Sigri Dosa","price":160},{"id":"pizza-dosa","name":"Pizza Dosa","category":"Mumbai Special Sigri Dosa","price":180},{"id":"corn-bite-special-dosa","name":"Corn Bite Special Dosa","category":"Mumbai Special Sigri Dosa","price":190},{"id":"chef-special-dosa","name":"Chef Special Dosa","category":"Mumbai Special Sigri Dosa","price":230},{"id":"matka-dosa","name":"Matka Dosa","category":"Mumbai Special Sigri Dosa","price":250},
  {"id":"veg-grilled-sandwich","name":"Veg Grilled Sandwich","category":"Sandwich","price":100},{"id":"cheese-corn-sandwich","name":"Cheese Corn Sandwich","category":"Sandwich","price":110},{"id":"mexican-sandwich","name":"Mexican Sandwich","category":"Sandwich","price":110},{"id":"bombay-style-sandwich","name":"Bombay Style Sandwich","category":"Sandwich","price":110},{"id":"veg-cheese-grilled-sandwich","name":"Veg Cheese Grilled Sandwich","category":"Sandwich","price":120},{"id":"chocolate-sandwich","name":"Chocolate Sandwich","category":"Sandwich","price":110},{"id":"paneer-tikka-sandwich","name":"Paneer Tikka Sandwich","category":"Sandwich","price":120},
  {"id":"sweet-corn-butter-salted","name":"Sweet Corn Butter Salted","category":"Sweet Corn Cup","price":70},{"id":"sweet-corn-butter-masala","name":"Sweet Corn Butter Masala","category":"Sweet Corn Cup","price":70},{"id":"sweet-corn-cheese-corn","name":"Sweet Corn Cheese Corn","category":"Sweet Corn Cup","price":90},{"id":"cheesy-sweet-corn","name":"Cheesy Sweet Corn","category":"Sweet Corn Cup","price":90},{"id":"cheese-corn-balls","name":"Cheese Corn Balls","category":"Sweet Corn Cup","price":180},
  {"id":"pav-bhaji","name":"Pav Bhaji","category":"Pav Bhaji","price":110},{"id":"masala-pav-bhaji","name":"Masala Pav Bhaji","category":"Pav Bhaji","price":120},{"id":"cheese-pav-bhaji","name":"Cheese Pav Bhaji","category":"Pav Bhaji","price":130},{"id":"paneer-pav-bhaji","name":"Paneer Pav Bhaji","category":"Pav Bhaji","price":130},{"id":"khada-pav-bhaji","name":"Khada Pav Bhaji","category":"Pav Bhaji","price":120},{"id":"extra-pav","name":"Extra Pav","category":"Pav Bhaji","price":30},{"id":"extra-bhaji","name":"Extra Bhaji","category":"Pav Bhaji","price":70},
  {"id":"plain-fries","name":"Plain Fries","category":"Fries","price":100},{"id":"masala-fries","name":"Masala Fries","category":"Fries","price":120},{"id":"peri-peri-fries","name":"Peri Peri Fries","category":"Fries","price":130},{"id":"mg-cheese-baked-nachos","name":"M/G Cheese Baked Nachos","category":"Fries","price":180},
  {"id":"veg-cheese-burger","name":"Veg Cheese Burger","category":"Burgers","price":120},{"id":"paneer-cheese-burger","name":"Paneer and Cheese Burger","category":"Burgers","price":140},{"id":"corn-cheese-burger","name":"Corn Cheese Burger","category":"Burgers","price":140}
]
$catalog$::jsonb) as x(id text,name text,category text,price integer)
on conflict (product_id) do update set
  name=excluded.name,category=excluded.category,description=excluded.description,
  price=excluded.price,image_url=excluded.image_url,is_available=true;

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.validate_order_transition()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = old.status then return new; end if;
  if not (
    (old.status = 'placed' and new.status in ('confirmed','rejected','cancelled')) or
    (old.status = 'confirmed' and new.status in ('preparing','cancelled')) or
    (old.status = 'preparing' and new.status in ('ready','cancelled')) or
    (old.status = 'ready' and new.status in ('out_for_delivery','completed','cancelled')) or
    (old.status = 'out_for_delivery' and new.status in ('delivered','cancelled')) or
    (old.status = 'delivered' and new.status = 'completed')
  ) then
    raise exception 'Invalid order transition: % to %', old.status, new.status using errcode = '22000';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_validate_transition on public.orders;
create trigger orders_validate_transition before update of status on public.orders
for each row execute function public.validate_order_transition();

alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Anyone can read available menu items" on public.menu_items;
create policy "Anyone can read available menu items" on public.menu_items
for select to anon, authenticated using (is_available);

drop policy if exists "Admins can read all menu items" on public.menu_items;
create policy "Admins can read all menu items" on public.menu_items
for select to authenticated using (public.is_admin());

drop policy if exists "Customers can read their orders" on public.orders;
create policy "Customers can read their orders" on public.orders
for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers can read their order items" on public.order_items;
create policy "Customers can read their order items" on public.order_items
for select to authenticated using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  )
);

revoke all on public.menu_items, public.orders, public.order_items from anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant select on public.orders, public.order_items to authenticated;
grant update on public.orders to authenticated;

create or replace function public.create_food_order(
  p_customer_name text,
  p_phone text,
  p_order_type text,
  p_address_line text,
  p_city text,
  p_postal_code text,
  p_notes text,
  p_payment_method text,
  p_items jsonb
)
returns table (order_number text, status text, total integer, created_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := coalesce(auth.jwt()->>'email','');
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer;
  v_delivery_fee integer;
  v_invalid_count integer;
begin
  if v_user_id is null then raise exception 'Please login to place an order.' using errcode = '42501'; end if;
  if char_length(trim(p_customer_name)) not between 2 and 80 then raise exception 'Enter a valid customer name.' using errcode = '22000'; end if;
  if p_phone !~ '^\+?[0-9 -]{10,15}$' then raise exception 'Enter a valid phone number.' using errcode = '22000'; end if;
  if p_order_type not in ('delivery','pickup') then raise exception 'Choose delivery or pickup.' using errcode = '22000'; end if;
  if p_payment_method <> 'cod' then raise exception 'Unsupported payment method.' using errcode = '22000'; end if;
  if p_order_type = 'delivery' and (nullif(trim(p_address_line),'') is null or nullif(trim(p_city),'') is null or nullif(trim(p_postal_code),'') is null) then
    raise exception 'Complete the delivery address.' using errcode = '22000';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Your cart is empty or invalid.' using errcode = '22000';
  end if;

  select count(*) into v_invalid_count
  from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  left join public.menu_items m on m.product_id = x.product_id and m.is_available
  where m.product_id is null or x.quantity is null or x.quantity not between 1 and 20;
  if v_invalid_count > 0 then raise exception 'One or more cart items are unavailable or invalid.' using errcode = '22000'; end if;

  select sum(m.price * x.quantity)::integer into v_subtotal
  from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  join public.menu_items m on m.product_id = x.product_id and m.is_available;
  if coalesce(v_subtotal,0) < 1 then raise exception 'Could not calculate the order total.' using errcode = '22000'; end if;
  if p_order_type = 'delivery' and v_subtotal < 150 then raise exception 'Minimum delivery order is ₹150.' using errcode = '22000'; end if;

  v_delivery_fee := case when p_order_type = 'delivery' and v_subtotal < 500 then 40 else 0 end;
  v_order_number := 'CB-ORD-' || upper(substr(md5(random()::text || clock_timestamp()::text || v_user_id::text),1,8));

  insert into public.orders (
    order_number,user_id,customer_name,customer_email,phone,order_type,
    address_line,city,postal_code,notes,subtotal,delivery_fee,total,payment_method
  ) values (
    v_order_number,v_user_id,trim(p_customer_name),v_email,trim(p_phone),p_order_type,
    case when p_order_type='delivery' then trim(p_address_line) end,
    case when p_order_type='delivery' then trim(p_city) end,
    case when p_order_type='delivery' then trim(p_postal_code) end,
    nullif(trim(p_notes),''),v_subtotal,v_delivery_fee,v_subtotal+v_delivery_fee,p_payment_method
  ) returning id into v_order_id;

  insert into public.order_items (order_id,product_id,product_name,unit_price,quantity)
  select v_order_id,m.product_id,m.name,m.price,sum(x.quantity)::smallint
  from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  join public.menu_items m on m.product_id=x.product_id and m.is_available
  group by m.product_id,m.name,m.price;

  return query
  select o.order_number,o.status,o.total,o.created_at from public.orders o where o.id=v_order_id;
end;
$$;

revoke all on function public.create_food_order(text,text,text,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.create_food_order(text,text,text,text,text,text,text,text,jsonb) to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
