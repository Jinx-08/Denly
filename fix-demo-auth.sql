-- fix-demo-auth.sql — run once in the Supabase SQL Editor
--
-- WHY: the three demo auth users (admin@ / partner@ / adopter@denly.app) are
-- soft-deleted in auth.users (deleted_at IS SET). Soft-deleted rows are
-- invisible to every auth admin API call (listUsers returns nothing,
-- updateUserById/deleteUser return 404) but they still enforce the unique
-- (instance_id, email) constraint — so logins fail AND every re-creation
-- attempt fails with "Database error checking/saving new user".
--
-- The only way out is raw SQL: purge the rows, then re-insert them with the
-- SAME ids (1111…/2222…/3333…) so every existing foreign key
-- (partners.owner_id, adoption_applications.user_id, appointments.user_id,
-- profiles.id) keeps pointing at a live user. No relinking needed.

-- 0. pgcrypto provides crypt() / gen_salt() — required for the inserts below
create extension if not exists pgcrypto;

-- 1. hard-delete the phantom rows (any id, any deleted_at state)
delete from auth.users
 where email in ('admin@denly.app', 'partner@denly.app', 'adopter@denly.app');

-- 2. re-insert with the seeded ids and a working bcrypt password
insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        raw_app_meta_data, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@denly.app',
   crypt('denly123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Denly Admin","role":"admin"}'),
  ('22222222-2222-2222-2222-222222222222', 'partner@denly.app',
   crypt('denly123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Happy Tails Shelter","role":"partner"}'),
  ('33333333-3333-3333-3333-333333333333', 'adopter@denly.app',
   crypt('denly123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Riya Sharma","role":"adopter"}');

-- 3. matching auth.identities rows (required for password login)
insert into auth.identities (id, user_id, provider_id, identity_data, provider,
                             last_sign_in_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'admin@denly.app', '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@denly.app","email_verified":true}',
   'email', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'partner@denly.app', '{"sub":"22222222-2222-2222-2222-222222222222","email":"partner@denly.app","email_verified":true}',
   'email', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'adopter@denly.app', '{"sub":"33333333-3333-3333-3333-333333333333","email":"adopter@denly.app","email_verified":true}',
   'email', now(), now(), now());

-- 4. safety net: make sure the profile rows exist with the right roles
--    (upsert, no-op if the seed already created them)
insert into public.profiles (id, full_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Denly Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Happy Tails Shelter', 'partner'),
  ('33333333-3333-3333-3333-333333333333', 'Riya Sharma', 'adopter')
on conflict (id) do update set
  full_name = excluded.full_name,
  role      = excluded.role;

-- 5. make sure Happy Tails is owned by the partner demo user and Riya's
--    seed application/appointment are linked to the adopter demo user
update public.partners set owner_id = '22222222-2222-2222-2222-222222222222'
 where name = 'Happy Tails Shelter';
update public.adoption_applications set user_id = '33333333-3333-3333-3333-333333333333'
 where user_id is null or user_id not in (select id from auth.users);
update public.appointments set user_id = '33333333-3333-3333-3333-333333333333'
 where user_id is null or user_id not in (select id from auth.users);

-- 6. refresh PostgREST's schema cache so the API sees the new state
notify pgrst, 'reload schema';
