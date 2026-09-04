# Denly — Main Project Roadmap (15 Days)

*"Every pet deserves a den."*

**Problem statement:** Collaborate with shelters, veterinarians, and animal welfare groups to develop digital resources promoting adoption, vaccination, sterilization, and responsible pet care.

**Stack:** React + Vite (frontend) · Node.js + Express (backend) · Supabase (Postgres + Auth + Storage) · Tailwind CSS
**Team:** solo · **Timeline:** 15 days · **Structure:** 8 build phases + parallel documentation track

---

## How to Read This Roadmap

Each phase has a **Goal**, **Why it exists**, checkbox **Tasks** in build order, and **Exit criteria** — the concrete test you pass before starting the next phase.

**The golden rule:** every phase ends with something *runnable and tested*. Never build untested code on top of untested code.

**The documentation rule (main-project specific):** after finishing each phase, spend ~1 hour that evening on the matching report section and screenshots. A report written *as you build* takes hours; a report written at the end takes days of panic.

### 15-Day Calendar Overview

| Days | Phase | Outcome |
|---|---|---|
| 1 | **0 — Setup & Skeleton** | Working pipeline, Supabase project |
| 2–3 | **1 — Database & Auth** | Register/login with roles |
| 4–6 | **2 — Adoption Core** | Full adoption loop |
| 7–8 | **3 — Remaining Pillars** | Vaccination booking, partners, care hub |
| 9–11 | **4 — Depth Features** | Notifications, admin module, search, analytics |
| 12 | **5 — Testing** | Test-case tables executed & recorded |
| 13 | **6 — Deploy & Polish** | Live URL, responsive, guards |
| 14–15 | **7 — Documentation & Demo** | Report complete, demo rehearsed |

---

## Phase 0 — Setup & Skeleton
> ⏱ Day 1 · Goal: **empty-but-working app skeleton running locally**

### Why this phase exists
Everything downstream depends on the Supabase project and the client↔server↔database pipeline. Proving it works on Day 1 (while nothing is broken) means every later feature plugs into working plumbing.

### Tasks
- [ ] **0.1** Create Supabase project (free tier). Save: Project URL, `anon` key, `service_role` key (Settings → API)
- [ ] **0.2** Create the `pet-images` Storage bucket → set it **public**
- [ ] **0.3** Scaffold frontend: `npm create vite@latest client -- --template react` → install `tailwindcss`, `react-router-dom`, `@supabase/supabase-js`
- [ ] **0.4** Scaffold backend: `server/` with `npm init` → install `express`, `cors`, `dotenv`, `@supabase/supabase-js`
- [ ] **0.5** `.env` both sides: client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), server (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT=4000`)
- [ ] **0.6** Health check: `GET /api/health` → `{ ok: true }`; call from React and display. Proves React → Express works
- [ ] **0.7** Git repo, first commit, `.gitignore` (node_modules + .env)

### 📄 Documentation track (Day 1 evening)
Draft: **Title page, Abstract, Introduction, Objectives, Scope**. Take a screenshot of the running skeleton for the report's "getting started" section.

### Exit criteria
✅ React calls `/api/health` and renders the response. Git initialized, .env ignored.

---

## Phase 1 — Database & Authentication
> ⏱ Days 2–3 · Goal: **a user can register, log in, and their role is known everywhere**

### Why this phase exists
Auth touches every feature and is the hardest thing to retrofit. The schema is designed up-front so later phases never need destructive migrations. Two days here (not one) because this is a main project — do it properly, with input validation and error states.

### Tasks
- [ ] **1.1** Write and run the **schema SQL** (below) with `create table if not exists` — safely re-runnable
- [ ] **1.2** **`on_auth_user_created` trigger** — reads `raw_user_meta_data->>'role'` and inserts a matching `profiles` row. The bridge between Supabase Auth and app roles
- [ ] **1.3** Express auth middleware:
  - `requireAuth` — verify `Authorization: Bearer <jwt>` via Supabase `auth.getUser(token)`, attach `{ userId, role }` to `req.user`
  - `requireRole(role)` — 403 on role mismatch
- [ ] **1.4** `GET /api/auth/me` → caller's profile
- [ ] **1.5** Frontend auth: Supabase client singleton, `AuthContext` (session + profile, `onAuthStateChange`), `/register` (with **role picker: Adopter / Partner**), `/login`, reactive navbar
- [ ] **1.6** Frontend **API helper** (`lib/api.js`) — attaches Bearer token, parses JSON, throws on non-2xx. Write once; every future feature uses it
- [ ] **1.7** Validation & error UX: password confirmation, friendly error messages ("Email already registered"), loading states on buttons
- [ ] **1.8** **Seed data**: 6 partners (2 shelters, 2 vets, 2 NGOs), 12+ pets with images, 8 care articles, demo accounts (partner / adopter / admin)

### Schema (reference)

| Table | Key columns |
|---|---|
| `profiles` | id (=auth.users.id), full_name, phone, role (`adopter`\|`partner`\|`admin`) |
| `partners` | id, owner_id→profiles, name, type (`shelter`\|`vet`\|`ngo`), address, city, phone, email, about, logo_url |
| `pets` | id, partner_id→partners, name, species, breed, age_months, gender, size, is_vaccinated, is_sterilized, description, image_url, status (`available`\|`pending`\|`adopted`), created_at |
| `adoption_applications` | id, pet_id→pets, user_id→profiles, message, phone, status (`pending`\|`approved`\|`rejected`), created_at |
| `appointments` | id, partner_id→partners, user_id→profiles (nullable), full_name, phone, type (`vaccination`\|`sterilization`\|`checkup`), preferred_date, notes, status, created_at |
| `resources` | id, title, slug, category (`adoption`\|`vaccination`\|`sterilization`\|`care`), body (markdown), cover_url, created_at |

### 📄 Documentation track (Days 2–3 evenings)
Draw the **ER diagram** from the schema (draw.io / dbdiagram.io), the **database table descriptions**, and draft the **Requirements chapter**: functional requirements (one line per feature — you already know all of them) and non-functional (performance, security, usability). Screenshot the login/register UI.

### Exit criteria
✅ Register as Adopter → `profiles` row appears with correct role. Login/logout flow works. `GET /api/auth/me` works via the API helper. Seed data visible in Supabase.

---

## Phase 2 — Adoption Core (the centerpiece)
> ⏱ Days 4–6 · Goal: **the full adoption loop: browse → apply → approve → adopted**

### Why this phase exists
Adoption is the emotional heart of the project and the most complex flow (two roles interacting through shared state). Three days because this is where the app earns "main project" weight — build the happy path on Day 4, edge cases and the partner dashboard properly on Days 5–6.

### Tasks
- [ ] **2.1** `GET /api/pets` — joins partner info; filters: `species`, `city`, `vaccinated`, `sterilized`, `status` (default `available`)
- [ ] **2.2** `GET /api/pets/:id` — full detail + owning partner
- [ ] **2.3** `/adopt` page — responsive card grid + filter sidebar; loading skeleton; empty state
- [ ] **2.4** `PetCard` — image, name, breed, age, gender + **Vaccinated ✓ / Sterilized ✓ badges** (the welfare pillars made visible)
- [ ] **2.5** `/adopt/:id` — pet profile: image, description, partner contact, Apply button
- [ ] **2.6** `POST /api/applications` (`requireAuth`) — guards: pet must be `available`; no duplicate applications by same user
- [ ] **2.7** Apply form UI (modal/inline) with success confirmation state
- [ ] **2.8** Pet CRUD (`requireRole('partner')`) — partners can only touch their own pets
- [ ] **2.9** Image upload: file → `supabase.storage.from('pet-images').upload()` → public URL → pet payload
- [ ] **2.10** `/admin` partner dashboard: pets table + create/edit form with upload
- [ ] **2.11** `GET /api/applications/partner` + `PATCH /api/applications/:id` — approve/reject; **approve flips pet to `adopted`**, reject keeps `available`
- [ ] **2.12** Dashboard applications tab: applicant cards with Approve / Reject

### 📄 Documentation track (Days 4–6 evenings)
**Use-case diagram** (actors: Visitor, Adopter, Partner, Admin; ~10 use cases) and **sequence diagrams** for the two core flows: *adoption application* and *application approval*. Screenshot every adoption page for the report.

### Exit criteria
✅ Adopter filters `/adopt` → opens pet → applies → partner sees it → approves → pet shows "Adopted" publicly. Image upload renders a real photo.

---

## Phase 3 — Remaining Three Pillars
> ⏱ Days 7–8 · Goal: **vaccination booking, partner directory, and care resources all live**

### Why this phase exists
Completes all four problem-statement pillars. Individually simpler than adoption (directories + forms), so two days is comfortable.

### Tasks — Pillar 2: Vaccination & sterilization
- [ ] **3.1** `POST /api/appointments` (public — logged-out bookings allowed) — validates future date
- [ ] **3.2** `GET /api/appointments/partner` — booking inbox
- [ ] **3.3** `PATCH /api/appointments/:id` — confirm / mark done
- [ ] **3.4** `/vaccinate` page — campaign copy (why vaccinate, why sterilize) + booking form (vet partners, type, date)

### Tasks — Pillar 3: Partner network
- [ ] **3.5** `GET /api/partners` — filter by type/city; pet counts per partner
- [ ] **3.6** `/partners` directory — filterable Shelter/Vet/NGO cards with "X pets available"
- [ ] **3.7** `POST /api/partners` (`requireRole('partner')`) + organization registration form

### Tasks — Pillar 4: Responsible care resources
- [ ] **3.8** `GET /api/resources` (category filter) + `GET /api/resources/:slug`
- [ ] **3.9** `/care` hub — category cards listing articles
- [ ] **3.10** `/care/:slug` — render markdown (`react-markdown`)

### 📄 Documentation track (Days 7–8 evenings)
**DFD Level 0 & Level 1** for the whole system, and draft the **System Design chapter** (module descriptions: Auth, Adoption, Appointments, Partners, Resources). Screenshots of the new pages.

### Exit criteria
✅ Logged-out visitor books vaccination → appears in partner dashboard → partner confirms. `/partners` filters + live pet counts work. All 8 articles render.

---

## Phase 4 — Depth Features (main-project weight)
> ⏱ Days 9–11 · Goal: **features that separate a main project from a mini project**

### Why this phase exists
A hackathon app can ship a happy path; a main project gets scrutinized on completeness. These four features are the highest value-to-effort: each is demoable, each fills a report chapter, and together they justify the "collaboration" in your problem statement.

### Tasks — 4A: Email notifications (Day 9)
- [ ] **4.1** Sign up for **Resend** (free tier) or configure Gmail SMTP via `nodemailer`
- [ ] **4.2** `server/src/services/mailer.js` — `sendEmail(to, subject, html)`
- [ ] **4.3** Trigger emails on: application received (→ partner), application approved/rejected (→ adopter), appointment confirmed (→ booker)
- [ ] **4.4** Design one clean HTML email template reused with different content

### Tasks — 4B: Admin module (Day 10)
- [ ] **4.5** `GET /api/admin/stats` — totals: pets by status, applications by status, appointments by type, partners by type
- [ ] **4.6** `/admin/site` (role `admin`): overview dashboard with the stats + charts (use `recharts`)
- [ ] **4.7** Admin management tables: all pets, all applications, all partners — with deactivate/delete actions
- [ ] **4.8** `POST /api/resources` + editor form so admins can publish care articles without SQL

### Tasks — 4C: Search & UX depth (Day 11)
- [ ] **4.9** Full-text search on `/adopt` (name, breed, description) — Postgres `ilike` is fine
- [ ] **4.10** Pagination on pet listing (server-side `limit`/`offset`)
- [ ] **4.11** `/account` page — my applications (status badges) + my appointments
- [ ] **4.12** Route guards: `/admin` redirects non-partners; `/account` redirects logged-out; 404 page

### 📄 Documentation track (Days 9–11 evenings)
**Implementation chapter**: tech stack details with *why each was chosen* (React SPA vs SSR, Supabase vs raw SQL, Express vs serverless — one honest paragraph each). Update use-case diagram with the new admin use cases. Screenshots of the email, admin dashboard, and charts.

### Exit criteria
✅ Apply for a pet → partner gets an email → approve → adopter gets an email. Admin sees live charts of real data. Search + pagination work. Guards redirect correctly.

---

## Phase 5 — Testing
> ⏱ Day 12 · Goal: **documented evidence that the system works — the report's testing chapter**

### Why this phase exists
Main projects are graded on a **testing chapter with executed test cases**. Doing it as a dedicated phase (not an afterthought) means you catch real bugs *and* generate the tables you need.

### Tasks
- [ ] **5.1** Write a **test-case table** (~25–30 cases) covering: registration/login (valid + invalid), filters, application flow (including guards: applying for adopted pet, duplicate application), appointment date validation, role-based access (adopter hitting `/admin`), image upload (valid + non-image file), search, pagination
- [ ] **5.2** Execute every case against the running app; record **actual vs expected result + pass/fail** (screenshot failures before fixing them — fixed-bug evidence is great report material)
- [ ] **5.3** Fix what failed; re-run failed cases
- [ ] **5.4** Basic non-functional checks: page load times, behavior on slow network (browser devtools), form resubmission, invalid URLs

### 📄 Documentation track
This phase *produces* the **Testing chapter**: test-case tables, results summary, and a short "bugs found & fixed" section.

### Exit criteria
✅ Test-case table complete, all cases pass, failures fixed and re-verified.

---

## Phase 6 — Deploy & Polish
> ⏱ Day 13 · Goal: **a public URL that feels finished**

### Why this phase exists
A deployed live URL plus a responsive polish pass is the difference between "college demo" and "real product" — and Day 13 buffer absorbs the surprises deploy day always brings.

### Tasks
- [ ] **6.1** Landing page: hero + tagline, **live impact counters** (`GET /api/stats`), featured pets, partner logos, pillar cards
- [ ] **6.2** Mobile responsive pass — test at 375px on every page
- [ ] **6.3** Consistent loading/empty/error states everywhere; page titles; favicon + logo
- [ ] **6.4** Deploy backend → Render/Railway (set env vars); frontend → Vercel (env vars + API base URL)
- [ ] **6.5** Deploy-day fixes: CORS allowlist for the Vercel URL; Supabase Auth redirect URLs (Auth → URL Configuration)
- [ ] **6.6** Re-seed production DB; run the full verification checklist against the **deployed** URL

### Exit criteria
✅ Deployed URL passes the final checklist below.

---

## Phase 7 — Documentation & Demo
> ⏱ Days 14–15 · Goal: **report finished, demo rehearsed, viva-ready**

### Why this phase exists
The build is done; these two days turn 14 days of work into a submittable, presentable project. Do not add features now.

### Tasks
- [ ] **7.1** Assemble the full report in order: Title page → Abstract → Introduction → Objectives & Scope → **Literature survey / existing systems** (compare 2–3 real platforms, e.g. Petfinder, local shelter sites — what they lack that Denly has) → SDLC model (Agile/iterative — justify) → Requirements → System Design (architecture, ER, DFDs, use cases, sequence) → Implementation → **Screenshots walkthrough** → Testing → Conclusion → Future scope → References
- [ ] **7.2** Record a 3–4 minute demo video (backup for viva if the live demo fails)
- [ ] **7.3** Prepare the presentation deck (~12 slides): problem → existing gaps → solution overview → architecture → 4 pillars demo screenshots → testing results → future scope
- [ ] **7.4** Rehearse the live demo script twice; keep demo accounts + seeded data ready
- [ ] **7.5** Final commit, tag release, push README (setup steps, env vars, demo credentials)

### Demo script (2 minutes)
1. Landing → mission + live stats (10s)
2. `/adopt` → filter → point at Vaccinated/Sterilized badges (20s)
3. Register as adopter → apply for a pet (25s)
4. Switch to partner → approve → pet shows Adopted → mention the emails both sides received (25s)
5. Book vaccination on `/vaccinate` (15s)
6. Flash `/care` + `/partners` + admin charts — "all four pillars, live" (15s)
7. Future work close (10s)

---

## Final Verification Checklist (run against deployment)

- [ ] Register as adopter → apply for a pet → login as partner → approve → pet shows "Adopted" → both emails arrive
- [ ] Book vaccination as logged-out visitor → appears in partner dashboard → partner confirms
- [ ] `/adopt` filters, search, and pagination all return correct results
- [ ] Pet image upload works and renders; non-image files rejected
- [ ] Role guards: adopter can't reach `/admin` or partner actions; logged-out can't apply
- [ ] Admin charts show real DB counts
- [ ] Mobile layout intact at 375px
- [ ] Demo script runs clean in under 2:30

## Risk Register

| Risk | Antidote |
|---|---|
| Supabase auth/JWT integration eats Days 2–3 | It's Phase 1's only goal — timeboxed; client SDK login is ~30 lines |
| Email provider setup burns Day 9 | Resend free tier is ~15 minutes; fallback = log emails to console and say "SMTP configured" in report |
| Phase 4 scope creep | Pick 4A→4B→4C in order; if Day 11 slips, 4C items 4.11–4.12 shrink — they're polish, not pillars |
| CORS/env errors on deploy | Phase 6 is a full buffer day; local demo is the fallback |
| Report written in a panic | Documentation track runs every evening — by Day 14 it's assembly, not writing |
| Broken core discovered late | Exit criteria force testing each phase before the next |

## Future Scope (report chapter + viva answer)

Maps integration for partner directory · real-time chat with shelters · SMS reminders for vaccination due dates · foster-care listings · donation payments · ML-based pet–adopter matching · multi-language support · RLS policies end-to-end.
