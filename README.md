# Corn Bite Family Restro And Café

Production-oriented restaurant reservations and operations dashboard built with React, JavaScript, Tailwind CSS, and Supabase. Supabase is the only backend: Postgres, Auth, RLS, RPC booking transactions, and Realtime.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Add your Supabase project URL and anon key to `.env` (the anon key is designed to be public; never put the service-role key in this app).

## Provision Supabase

1. Create a Supabase project.
2. Open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. In **Authentication → Users**, create the restaurant owner's email/password user.
4. Copy that user's UUID and run:

```sql
insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
```

5. Put the project URL and anon key in `.env`, restart Vite, and open `/admin/login`.

## Security and booking integrity

- Customer booking is handled by a security-definer RPC that returns only confirmation fields.
- A partial unique database index prevents two active reservations for the same table/date/time, including simultaneous requests.
- Anonymous users can insert pending reservations but cannot read guest data.
- Only authenticated users present in `admin_users` can select/update/delete reservations.
- Database triggers enforce the status lifecycle and timestamps.
- Availability uses a PII-safe RPC. Realtime subscriptions respond to inserts and updates; there is no polling.

## Production deployment

Run `npm run build` and deploy `dist` to any static host (Vercel, Netlify, Cloudflare Pages). Configure the two `VITE_SUPABASE_*` environment variables in the hosting dashboard, add the deployed domain to Supabase Auth URL configuration, and enable HTTPS. For an SPA host, rewrite unknown paths to `/index.html`.

Verified address, opening hours, and public contact details were not included in the brief, so the application deliberately does not publish invented business information. Add those details once the restaurant confirms them.
