-- ============================================================
-- DENLY — App Stats Query
-- Powers the landing-page impact counters and admin dashboard
-- (backs the GET /api/stats endpoint from ROADMAP Phase 4)
--
-- Option A: run the big query directly in Supabase SQL editor.
-- Option B (recommended): create the view below once, then your
-- Express endpoint is simply:  select * from public.app_stats
-- ============================================================

create or replace view public.app_stats as
select
  -- Adoption
  count(*) filter (where status = 'available')            as pets_available,
  count(*) filter (where status = 'adopted')              as pets_adopted,
  count(*) filter (where status = 'pending')              as pets_pending,

  -- Welfare pillars on pets
  count(*) filter (where is_vaccinated)                   as pets_vaccinated,
  count(*) filter (where is_sterilized)                   as pets_sterilized,

  -- Community
  (select count(*) from partners)                         as total_partners,
  (select count(*) from partners where type = 'shelter')  as shelters,
  (select count(*) from partners where type = 'vet')      as vets,
  (select count(*) from partners where type = 'ngo')      as ngos,

  -- Applications
  (select count(*) from adoption_applications)            as total_applications,
  (select count(*) from adoption_applications
     where status = 'approved')                           as successful_adoptions,

  -- Appointments (vaccination pillar)
  (select count(*) from appointments
     where type = 'vaccination')                          as vaccinations_booked,
  (select count(*) from appointments
     where type = 'sterilization')                        as sterilizations_booked,

  -- Care hub
  (select count(*) from resources)                        as care_articles
from pets;

-- ---------- Quick test ----------
-- Run this to see the numbers with the seeded data:
--   select * from public.app_stats;
--
-- Expected with the seed data (before any app usage):
--   pets_available: 11   pets_adopted: 1   pets_pending: 1
--   pets_vaccinated: 9   pets_sterilized: 8
--   total_partners: 6    (2 shelters, 2 vets, 2 NGOs)
--   total_applications: 1   successful_adoptions: 0
--   vaccinations_booked: 1   sterilizations_booked: 0
--   care_articles: 8

-- ---------- Express usage ----------
-- router.get('/stats', async (_req, res) => {
--   const { data, error } = await supabase.from('app_stats').select('*');
--   if (error) return res.status(500).json({ error: error.message });
--   res.json(data[0]);
-- });
