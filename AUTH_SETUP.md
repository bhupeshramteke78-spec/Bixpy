# Customer authentication setup

No reservation table, reservation policy, admin dashboard logic, or environment variable name was changed for customer authentication.

## Manual Supabase steps

1. In **Authentication → Providers → Email**, enable Email/Password authentication.
2. Choose whether email confirmation is required. For production, keeping confirmation enabled is recommended.
3. In **Authentication → URL Configuration**, set the development Site URL to `http://localhost:4173`.
4. Add these Redirect URLs:
   - `http://localhost:4173/account`
   - `http://localhost:4173/auth/reset-password`
   - The equivalent URLs on the production domain before deployment.
5. Keep the existing admin setup: create the admin through Supabase Authentication, then add its UUID to `public.admin_users`. Never place its password in frontend code.

## Required Optional SQL

None. Customer full name and phone are stored in Supabase Auth user metadata. Because `reservations` does not currently contain `user_id`, reservation history is deliberately not queried or associated with a customer account. This preserves existing public booking behavior and security.

Adding customer-linked reservation history later would require a reviewed `user_id` migration and new RLS policies. Do not add only the column without the matching ownership policies, because that can expose customer booking data.

## Test checklist

- Customer signup, confirmation, login, session refresh, and logout
- Duplicate email signup is rejected
- Forgot-password email returns to `/auth/reset-password`
- Normal customers are redirected away from `/admin`
- Admin login and dashboard access still work
- Public reservation booking still works
- Admin confirm, arrived, complete, and cancel actions still work
