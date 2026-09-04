-- ============================================================
-- DENLY — Full Database Setup Script
-- Run top-to-bottom in Supabase SQL Editor (safe to re-run)
-- ============================================================

-- ---------- 0. Extensions ----------
create extension if not exists pgcrypto;   -- password hashing for demo users

-- ---------- 1. Enums ----------
do $$ begin
  create type user_role as enum ('adopter', 'partner', 'admin');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type partner_type as enum ('shelter', 'vet', 'ngo');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type pet_status as enum ('available', 'pending', 'adopted');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type application_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type appointment_type as enum ('vaccination', 'sterilization', 'checkup');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'done');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type resource_category as enum ('adoption', 'vaccination', 'sterilization', 'care');
exception when duplicate_object then null;
end $$;

-- ---------- 2. Tables ----------

-- Profiles: one row per auth user
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        user_role not null default 'adopter',
  created_at  timestamptz not null default now()
);

-- Partner organizations (shelters / vets / NGOs), owned by a partner account
create table if not exists public.partners (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references public.profiles (id) on delete set null,
  name        text not null,
  type        partner_type not null,
  address     text,
  city        text,
  phone       text,
  email       text,
  about       text,
  logo_url    text,
  created_at  timestamptz not null default now()
);

-- Adoptable pets, listed by partners
create table if not exists public.pets (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid not null references public.partners (id) on delete cascade,
  name           text not null,
  species        text not null,              -- dog / cat / rabbit / bird ...
  breed          text,
  age_months     int,
  gender         text check (gender in ('male', 'female', 'unknown')) default 'unknown',
  size           text check (size in ('small', 'medium', 'large')) default 'medium',
  is_vaccinated  boolean not null default false,
  is_sterilized  boolean not null default false,
  description    text,
  image_url      text,
  status         pet_status not null default 'available',
  created_at     timestamptz not null default now()
);

-- Adoption applications from adopters
create table if not exists public.adoption_applications (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid not null references public.pets (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  message     text,
  phone       text,
  status      application_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (pet_id, user_id)                  -- no duplicate applications
);

-- Vaccination / sterilization / checkup appointments
create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid not null references public.partners (id) on delete cascade,
  user_id        uuid references public.profiles (id) on delete set null,  -- nullable: public bookings
  full_name      text not null,
  phone          text not null,
  type           appointment_type not null,
  preferred_date date not null,
  notes          text,
  status         appointment_status not null default 'pending',
  created_at     timestamptz not null default now()
);

-- Care resource articles (markdown)
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  category    resource_category not null,
  body        text,                          -- markdown
  cover_url   text,
  created_at  timestamptz not null default now()
);

-- ---------- 3. Indexes ----------
create index if not exists idx_pets_partner        on public.pets (partner_id);
create index if not exists idx_pets_status_species on public.pets (status, species);
create index if not exists idx_partners_type_city  on public.partners (type, city);
create index if not exists idx_apps_user           on public.adoption_applications (user_id);
create index if not exists idx_apps_pet            on public.adoption_applications (pet_id);
create index if not exists idx_appts_partner       on public.appointments (partner_id);
create index if not exists idx_resources_category  on public.resources (category);

-- ---------- 4. Triggers ----------

-- 4a. Auto-create a profile row on signup.
--     Frontend passes `role` and `full_name` in supabase.auth.signUp({ options: { data: {...} } })
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case new.raw_user_meta_data ->> 'role'
      when 'admin' then 'admin'::public.user_role
      when 'partner' then 'partner'::public.user_role
      else 'adopter'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4b. updated_at helper (add column to tables if you want it; kept minimal for hackathon)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- 5. Row Level Security ----------
-- Lock every table down for the anon key. Your Express server uses the
-- service_role key, which BYPASSES RLS — so the API layer stays your single
-- entry point while randoms can't hit the DB directly with the anon key.
alter table public.profiles              enable row level security;
alter table public.partners              enable row level security;
alter table public.pets                  enable row level security;
alter table public.adoption_applications enable row level security;
alter table public.appointments          enable row level security;
alter table public.resources             enable row level security;

-- (No policies = no anon access. Add policies later if you ever query from the client.)

-- ---------- 6. Storage bucket ----------
-- Public read bucket for pet images. Uploads still go through your API or
-- an authenticated client; public = anyone can VIEW the images by URL.
insert into storage.buckets (id, name, public)
values ('pet-images', 'pet-images', true)
on conflict (id) do nothing;

-- Allow the public to view images in the bucket
drop policy if exists "Public read access to pet images" on storage.objects;
create policy "Public read access to pet images"
  on storage.objects for select
  using (bucket_id = 'pet-images');

-- ---------- 7. Demo accounts ----------
-- Passwords: admin@denly.app / partner@denly.app / adopter@denly.app
-- All use the password: denly123  (CHANGE/DELETE BEFORE REAL DEPLOYMENT)
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
   '{"provider":"email","providers":["email"]}', '{"full_name":"Riya Sharma","role":"adopter"}')
on conflict (id) do update set
  email              = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data  = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at         = now();

-- auth.identities rows (required for password login)
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
   'email', now(), now(), now())
on conflict (id) do update set
  user_id         = excluded.user_id,
  provider_id     = excluded.provider_id,
  identity_data   = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at      = excluded.updated_at;

-- Profiles (normally created by the trigger; explicit upsert as a safety net)
insert into public.profiles (id, full_name, phone, role) values
  ('11111111-1111-1111-1111-111111111111', 'Denly Admin',          null,         'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Happy Tails Shelter',  '+91 90000 11111', 'partner'),
  ('33333333-3333-3333-3333-333333333333', 'Riya Sharma',          '+91 90000 22222', 'adopter')
on conflict (id) do update set
  full_name = excluded.full_name,
  phone     = excluded.phone,
  role      = excluded.role;

-- ---------- 8. Seed: partners (2 shelters, 2 vets, 2 NGOs) ----------
insert into public.partners (id, owner_id, name, type, address, city, phone, email, about) values
  ('aaaa0000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'Happy Tails Shelter', 'shelter', '12 MG Road', 'Pune', '+91 90000 11111', 'hello@happytails.org',
   'A no-kill shelter rescuing and rehoming street dogs and cats since 2015.'),
  ('aaaa0000-0000-0000-0000-000000000002', null,
   'Paws & Claws Vet Clinic', 'vet', '45 Lake View Street', 'Pune', '+91 90000 33333', 'care@pawsclawsvet.in',
   'Full-service veterinary clinic with weekly low-cost vaccination and sterilization camps.'),
  ('aaaa0000-0000-0000-0000-000000000003', null,
   'Second Chance Animal Hospital', 'vet', '8 Station Road', 'Mumbai', '+91 90000 44444', 'front@secondchance.in',
   '24/7 emergency care, routine vaccinations, and ABC-AR sterilization programs.'),
  ('aaaa0000-0000-0000-0000-000000000004', null,
   'FurEver Home Rescue', 'shelter', '101 Hill Side Lane', 'Mumbai', '+91 90000 55555', 'adopt@fureverhome.org',
   'Foster-based rescue network specialising in abandoned and injured pets.'),
  ('aaaa0000-0000-0000-0000-000000000005', null,
   'Animal Welfare Trust', 'ngo', '23 Civil Lines', 'Delhi', '+91 90000 66666', 'info@awt.org',
   'NGO running city-wide sterilization drives, adoption fairs, and pet-care awareness camps.'),
  ('aaaa0000-0000-0000-0000-000000000006', null,
   'Stray Care Collective', 'ngo', '5 Riverside Colony', 'Pune', '+91 90000 77777', 'team@straycare.org',
   'Community volunteer group feeding, treating, and rehoming strays across the city.')
on conflict (id) do nothing;

-- ---------- 9. Seed: pets (13) ----------
-- Image URLs are picsum placeholders — swap for real photos / your Storage URLs later.
insert into public.pets (id, partner_id, name, species, breed, age_months, gender, size,
                         is_vaccinated, is_sterilized, description, image_url, status) values
  ('bbbb0000-0000-0000-0000-000000000001', 'aaaa0000-0000-0000-0000-000000000001',
   'Bruno', 'dog', 'Labrador Retriever', 18, 'male', 'large', true, true,
   'A gentle giant who loves kids and long walks. House-trained and great with other dogs.',
   'https://picsum.photos/seed/bruno/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000002', 'aaaa0000-0000-0000-0000-000000000001',
   'Simba', 'cat', 'Indian Shorthair', 8, 'male', 'small', true, true,
   'Playful, litter-trained, and obsessed with cardboard boxes. Looking for a sunny windowsill.',
   'https://picsum.photos/seed/simba/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000003', 'aaaa0000-0000-0000-0000-000000000001',
   'Luna', 'dog', 'Beagle', 24, 'female', 'medium', true, true,
   'Curious nose, kind heart. Needs a family with time for daily exercise.',
   'https://picsum.photos/seed/luna/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000004', 'aaaa0000-0000-0000-0000-000000000001',
   'Coco', 'cat', 'Persian Mix', 12, 'female', 'small', true, false,
   'A fluffy queen who prefers quiet homes. Vaccinated; sterilization scheduled next month.',
   'https://picsum.photos/seed/coco/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000005', 'aaaa0000-0000-0000-0000-000000000001',
   'Rocky', 'dog', 'Indie (Desi)', 36, 'male', 'medium', false, true,
   'A loyal street-rescued boy. Healthy, sterilized, and awaiting his vaccination round.',
   'https://picsum.photos/seed/rocky/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000006', 'aaaa0000-0000-0000-0000-000000000004',
   'Milo', 'dog', 'Golden Retriever', 10, 'male', 'large', true, false,
   'Surrendered by a moving family. Golden personality, still a growing puppy.',
   'https://picsum.photos/seed/milo/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000007', 'aaaa0000-0000-0000-0000-000000000004',
   'Nala', 'cat', 'Siamese Mix', 6, 'female', 'small', true, false,
   'Talkative and affectionate. Will follow you from room to room.',
   'https://picsum.photos/seed/nala/600/400', 'pending'),
  ('bbbb0000-0000-0000-0000-000000000008', 'aaaa0000-0000-0000-0000-000000000004',
   'Duke', 'dog', 'German Shepherd', 30, 'male', 'large', true, true,
   'Smart and protective. Best with experienced owners; knows basic commands.',
   'https://picsum.photos/seed/duke/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000009', 'aaaa0000-0000-0000-0000-000000000004',
   'Pepper', 'rabbit', 'Dutch', 14, 'female', 'small', true, true,
   'A calm, litter-trainable rabbit who loves leafy greens and quiet evenings.',
   'https://picsum.photos/seed/pepper/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000010', 'aaaa0000-0000-0000-0000-000000000005',
   'Tyson', 'dog', 'Indie (Desi)', 9, 'male', 'medium', false, false,
   'Rescued from a busy market as a pup. Healthy and waiting for first vaccinations.',
   'https://picsum.photos/seed/tyson/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000011', 'aaaa0000-0000-0000-0000-000000000005',
   'Angel', 'cat', 'Indian Shorthair', 4, 'female', 'small', false, false,
   'A tiny rescued kitten, bottle-fed back to health. Vaccination due at 12 weeks.',
   'https://picsum.photos/seed/angel/600/400', 'available'),
  ('bbbb0000-0000-0000-0000-000000000012', 'aaaa0000-0000-0000-0000-000000000006',
   'Max', 'dog', 'Labrador Mix', 48, 'male', 'large', true, true,
   'Senior boy with a mellow temperament. Deserves a retirement home with a soft couch.',
   'https://picsum.photos/seed/max/600/400', 'adopted'),
  ('bbbb0000-0000-0000-0000-000000000013', 'aaaa0000-0000-0000-0000-000000000006',
   'Kiwi', 'bird', 'Cockatiel', 20, 'male', 'small', false, false,
   'Whistle-happy cockatiel looking for a patient human with a big cage and bigger heart.',
   'https://picsum.photos/seed/kiwi/600/400', 'available')
on conflict (id) do nothing;

-- ---------- 10. Seed: care resources (8 articles, 2 per pillar) ----------
insert into public.resources (id, title, slug, category, body, cover_url) values
  ('cccc0000-0000-0000-0000-000000000001',
   'How to Prepare Your Home for a New Pet',
   'prepare-home-new-pet', 'adoption',
   '# Pet-Proofing 101

Before your new companion arrives:

- **Secure loose wires** and remove toxic plants (lilies, pothos, aloe)
- **Set up a quiet corner** with a bed, water bowl, and toys
- **Buy essentials**: food appropriate for age/species, collar with ID tag, litter box for cats
- **Schedule a vet visit** within the first week

## The First 72 Hours
Give them space. Let them explore one room first. Keep interactions calm and short — trust builds slowly.',
   'https://picsum.photos/seed/prepare/600/400'),

  ('cccc0000-0000-0000-0000-000000000002',
   'Adoption Checklist: Are You Ready?',
   'adoption-checklist', 'adoption',
   '# Ask Yourself

1. Can I commit for the next 10–15 years?
2. Can I afford food, vet care, and emergencies?
3. Does my housing allow pets?
4. Do I have time daily for exercise and attention?

## Red Flags to Avoid
- Never adopt on impulse or as a surprise gift
- Never buy from illegal breeders — adoption saves a life

**Adopt, don''t shop.**',
   'https://picsum.photos/seed/checklist/600/400'),

  ('cccc0000-0000-0000-0000-000000000003',
   'Vaccination Schedule for Dogs and Cats',
   'vaccination-schedule', 'vaccination',
   '# Core Vaccines

## Dogs
| Age | Vaccine |
|---|---|
| 6–8 weeks | DHPP (distemper, hepatitis, parvo) |
| 10–12 weeks | DHPP booster |
| 14–16 weeks | DHPP + rabies |
| Annually | Boosters |

## Cats
- **6–8 weeks:** FVRCP
- **12–16 weeks:** FVRCP + rabies
- **Annually:** boosters

> Always consult a veterinarian — schedules vary by region and health status.',
   'https://picsum.photos/seed/vaccine/600/400'),

  ('cccc0000-0000-0000-0000-000000000004',
   'Why Vaccinate? The Herd Immunity Argument',
   'why-vaccinate', 'vaccination',
   '# It''s Not Just About One Pet

Vaccination protects your pet — and every pet around them.

- **Rabies is 100% fatal** once symptoms appear, in animals and humans
- Parvovirus spreads through soil for **months** — unvaccinated puppies are at constant risk
- When >70% of a local pet population is vaccinated, **herd immunity** slows outbreaks dramatically

Low-cost camps listed on this site make it easy. One shot, many lives protected.',
   'https://picsum.photos/seed/herd/600/400'),

  ('cccc0000-0000-0000-0000-000000000005',
   'Sterilization: Myths vs Facts',
   'sterilization-myths-facts', 'sterilization',
   '# Common Myths, Corrected

| Myth | Fact |
|---|---|
| "It changes their personality" | Only reduces roaming & aggression linked to hormones |
| "It''s cruel" | Done under anesthesia; recovery is typically 7–10 days |
| "One litter is healthy" | Every litter adds to the homeless-pet crisis |
| "It''s expensive" | ABC programs and camps offer it free or low-cost |

## Why It Matters
One unsterilized pair of cats and their offspring can produce **hundreds of cats in 5 years**. Sterilization is the single most effective way to reduce stray suffering.',
   'https://picsum.photos/seed/sterilize/600/400'),

  ('cccc0000-0000-0000-0000-000000000006',
   'When Is the Right Time to Sterilize?
', 'sterilization-timing', 'sterilization',
   '# General Guidelines

- **Cats:** 4–6 months (early spay/neuter is safe)
- **Small dogs:** around 6 months
- **Large dogs:** 12–18 months, after growth plates close — discuss with your vet

## Post-Op Care
- Keep the cone on; prevent licking of the incision
- Restrict running/jumping for a week
- Watch for swelling or discharge at the site

Book a sterilization slot with a partner vet right here on Denly.',
   'https://picsum.photos/seed/timing/600/400'),

  ('cccc0000-0000-0000-0000-000000000007',
   'Daily Pet Care Essentials',
   'daily-care-essentials', 'care',
   '# The Non-Negotiables

- **Nutrition:** species- and age-appropriate food; fresh water always
- **Exercise:** dogs need 30–120 min/day by breed; cats need interactive play
- **Grooming:** brushing, nail trims, dental checks
- **Enrichment:** toys, puzzles, and social time prevent behavioral issues

## Watch For
Sudden appetite loss, lethargy, limping, or changes in litter habits → call your vet.',
   'https://picsum.photos/seed/daily/600/400'),

  ('cccc0000-0000-0000-0000-000000000008',
   'Responsible Pet Parenthood Pledge',
   'responsible-pet-pledge', 'care',
   '# The Pledge

1. I will provide food, shelter, and veterinary care for my pet''s lifetime
2. I will **never abandon** my pet — rehome responsibly through shelters if I must
3. I will vaccinate on schedule and sterilize when advised
4. I will keep my pet leashed or safely contained
5. I will clean up after my pet in public spaces
6. I will microchip or ID-tag my pet

Responsible care is a promise for life. Take the pledge.',
   'https://picsum.photos/seed/pledge/600/400')
on conflict (id) do nothing;

-- ---------- 11. Seed: one demo application + one demo appointment ----------
insert into public.adoption_applications (pet_id, user_id, message, phone, status) values
  ('bbbb0000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333',
   'I have a quiet apartment and work from home — Nala would get constant company!',
   '+91 90000 22222', 'pending')
on conflict do nothing;

insert into public.appointments (partner_id, user_id, full_name, phone, type, preferred_date, notes, status) values
  ('aaaa0000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333',
   'Riya Sharma', '+91 90000 22222', 'vaccination', current_date + 7,
   'First rabies shot for my kitten', 'pending')
on conflict do nothing;

-- ============================================================
-- DONE. Demo logins (all password: denly123):
--   admin@denly.app    → site admin
--   partner@denly.app  → owns Happy Tails Shelter (5 pets)
--   adopter@denly.app  → has 1 pending application + 1 appointment
-- ============================================================
