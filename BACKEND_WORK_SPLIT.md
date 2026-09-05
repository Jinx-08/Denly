# Denly — Backend Work Split (Two Developers)

**Repo:** `Jinx-08/Denly` · **Branch:** `main`
**Scope:** every remaining backend endpoint (roadmap Phases 2, 3, 4A/4B/4C server-side). Auth is already done.

**Person 1** gets the core engine — the larger, more complex share (~60%): the adoption transaction, ownership checks, image upload, search/pagination.
**Person 2** gets the network & platform modules (~40%) and builds **first** (Person 1's pet CRUD depends on a partner org existing).

---

## 0. Current state (already done — don't rebuild)

| Exists | Where |
|---|---|
| Register / login / profile / logout | `backend/controllers/authControllers.js`, `backend/routes/authRoutes.js` |
| `requireAuth` (attaches `req.user = { userId, email, role }`), `requireRole(role)` | `backend/middleware/authMiddleware.js` |
| Service-role Supabase client (bypasses RLS) | `backend/supabase/client.js` — `require` this everywhere for DB access |
| CORS allowlist, `/api/health` | `backend/app.js` |
| Full schema + seed data + demo accounts | `denly-schema.sql` (run it in Supabase SQL Editor if not yet) |

**Demo logins** (password `denly123`): `denlyadmin@denly.app` (site admin) · `happytails@denly.app` (owns Happy Tails Shelter, 5 pets) · `riya@denly.app` (Riya, has 1 pending app + 1 appointment).
> These were created via `POST /api/auth/register` (the old `admin@/partner@/adopter@denly.app` emails are permanently blocked in this project's auth by soft-deleted phantom rows — use the new ones).

## 1. Shared conventions (follow exactly)

- **Pattern:** route file (`backend/routes/<x>Routes.js`) does validation + middleware, controller (`backend/controllers/<x>Controllers.js`) does logic. See `authRoutes.js` for the reference style.
- **CommonJS** (`require` / `module.exports`), no TypeScript.
- **Validation:** `express-validator` `body(...)` chains inline in the route file; controller starts with the `validationResult` check → 400 with `{ errors: [...] }`.
- **DB access:** always the service-role client — `const supabase = require('../supabase/client');`
- **Error shape:** `{ error: 'message' }` with proper status codes (400 validation, 401 auth, 403 role/ownership, 404 not found, 409 conflict, 500 unexpected).
- **Each module exports `exports.<camelCaseFn> = async (req, res) => {...}`** with try/catch → 500.
- **Every route file is mounted by its owner** — see §5 for the one shared-file rule.

## 2. Build order & dependency

```
Person 2:  partners ──► resources ──► admin ──► stats ──► mailer
                │
                └── partners must exist first ──┐
Person 1:                                     ├──► pets ──► applications ──► appointments
                                              ┘
```

**Only real dependency:** Person 1's `POST /api/pets` requires the logged-in partner to have a `partners` row, and creating that row is Person 2's `POST /api/partners`. Person 2 ships partners first (it's the simplest module — a warm-up). Everything after that is fully parallel; you never touch each other's files.

> Person 1 can start immediately anyway: all **read** endpoints (`GET /api/pets`, filters, search, pagination) and the applications/appointments modules work against the **already-seeded** partners from `denly-schema.sql`. Only pet *create/update* testing needs Person 2's endpoint — or the seeded `partner@denly.app` org, which already exists.

---

## 3. Person 1 — Core Engine (heavier share)

### 3a. Pets — `backend/routes/petRoutes.js` + `backend/controllers/petControllers.js`

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/pets` | public | **The main listing endpoint.** Joins partner info: `partner_id(id, name, city, type)`. Query params: `species`, `city`, `vaccinated` (`true`/`false`), `sterilized`, `status` (default `available`), `q` — search: `.or('name.ilike.%q%,breed.ilike.%q%,description.ilike.%q%')`, `page` (default 1), `limit` (default 12, max 50). Response: `{ pets, total, page, totalPages }` — needs a `count` query (with `.select('*', { count: 'exact', head: true })` + same filters) plus a `.range()` query. |
| `GET /api/pets/:id` | public | Full pet + owning partner details (`partner_id(*)`). 404 if missing. |
| `POST /api/pets` | `requireRole('partner')` | Look up the caller's `partners` row by `owner_id = req.user.userId` (404 "Create your organization first" if none). Set `partner_id` from it — never trust a client-supplied `partner_id`. Validate: `name`, `species` required; `gender` in male/female/unknown; `size` in small/medium/large. |
| `PATCH /api/pets/:id` | `requireRole('partner')` | **Ownership check:** fetch pet → fetch its partner's `owner_id` → must equal `req.user.userId`, else 403. Whitelist updatable fields (`name, species, breed, age_months, gender, size, is_vaccinated, is_sterilized, description, image_url, status`). |
| `DELETE /api/pets/:id` | `requireRole('partner')` | Same ownership check (admin may also be allowed to delete anything — your call, document it). |
| `POST /api/pets/:id/image` | `requireRole('partner')` | **Image upload.** `multer` memory storage, accept only `image/*` mimetypes, 5MB limit (400 on violation). Ownership check as above. Upload: `supabase.storage.from('pet-images').upload(path, buffer, { contentType })` with a unique path (`${petId}-${Date.now()}.${ext}`) → `.getPublicUrl()` → update pet's `image_url`. Return `{ image_url }`. |

### 3b. Adoption applications — `backend/routes/applicationRoutes.js` + `backend/controllers/applicationControllers.js`

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/applications` | `requireAuth` | Body: `pet_id`, `message`, `phone`. **Guards:** pet must exist (404) and be `status = 'available'` (409 "Pet is not available for adoption"); duplicate check — the DB has `unique (pet_id, user_id)`, so catch the constraint error (code `23505`) and return 409. Insert as `pending`. |
| `GET /api/applications/mine` | `requireAuth` | Caller's applications, each joined with `pet_id(id, name, species, breed, image_url, status)`. |
| `GET /api/applications/partner` | `requireRole('partner')` | All applications for pets owned by the caller's org: fetch caller's `partners.id` first, then query apps where `pet_id.partner_id = <that id>`, joined with pet + applicant profile (`user_id(full_name, phone)`). |
| `PATCH /api/applications/:id` | `requireRole('partner')` | Body: `status` = `approved` \| `rejected`. **The core transaction — implement carefully:** (1) fetch app + its pet → 404s; (2) ownership check via pet → partner → owner_id; (3) app must currently be `pending` (409 otherwise); (4) on **approve**: update app to `approved`, set the pet's status to `adopted`, and **update all other pending applications for that pet to `rejected`** (one `.in('status', ...)` / `.eq('pet_id', ...)` `.neq('id', ...)` update); (5) on **reject**: app → `rejected`, pet stays `available`; (6) call the mailer (§4e) for the adopter email — see §6 for why the call is wrapped in try/catch. |

### 3c. Appointments — `backend/routes/appointmentRoutes.js` + `backend/controllers/appointmentControllers.js`

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/appointments` | **public** (logged-out bookings allowed) | Body: `partner_id`, `full_name`, `phone`, `type` (vaccination/sterilization/checkup), `preferred_date`, `notes`. Validate `preferred_date` is today-or-later (400 on past date). Partner must exist (404). **If** an `Authorization: Bearer` header is present, verify it via `supabase.auth.getUser(token)` and link `user_id` — but a bad/expired token must NOT block a public booking; just book anonymously. |
| `GET /api/appointments/mine` | `requireAuth` | Caller's appointments (by `user_id`), joined with partner name/city. |
| `GET /api/appointments/partner` | `requireRole('partner')` | Booking inbox for the caller's org. |
| `PATCH /api/appointments/:id` | `requireRole('partner')` | Status transitions only: `pending → confirmed → done` (skip-ahead and backwards → 409). Ownership check: appointment's `partner_id` must be the caller's org. Call mailer on confirm. |

---

## 4. Person 2 — Network & Platform

### 4a. Partners — **build this first**

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/partners` | public | Filters: `type` (shelter/vet/ngo), `city`. Include per-partner available-pet count via embedded resource: `.select('*, pets(count)').eq('pets.status', 'available')` — count arrives as `pets[0].count`. |
| `GET /api/partners/:id` | public | Partner detail + its available pets (`pets(*)` filtered). 404 if missing. |
| `POST /api/partners` | `requireRole('partner')` | Body: `name`, `type`, `address`, `city`, `phone`, `email`, `about`, `logo_url`. **One org per owner:** check `owner_id = req.user.userId` first → 409 "You already have an organization" if a row exists. Set `owner_id` from the token, never from the body. |
| `PATCH /api/partners/:id` | `requireRole('partner')` | Owner-only edit (fetch → compare `owner_id` → 403). |

### 4b. Resources (care articles)

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/resources` | public | Optional `category` filter (adoption/vaccination/sterilization/care). |
| `GET /api/resources/:slug` | public | Single article by slug, 404 if missing. |
| `POST /api/resources` | `requireRole('admin')` | `title`, `category` required. **Slug auto-generated from title** when absent (lowercase, non-alphanumerics → `-`, trim dashes). |
| `PATCH /api/resources/:id` | `requireRole('admin')` | Regenerate slug only if title changes and no explicit slug given. |
| `DELETE /api/resources/:id` | `requireRole('admin')` | — |

### 4c. Admin module

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/admin/stats` | `requireRole('admin')` | Counts grouped: pets by status, applications by status, appointments by type, partners by type + grand totals. (Group-by: either one fetch-all + `reduce`, or per-status count queries with `{ count: 'exact', head: true }` — either is fine at this scale.) |
| `GET /api/admin/pets` | `requireRole('admin')` | All pets + partner name. |
| `GET /api/admin/applications` | `requireRole('admin')` | All applications + pet name + applicant name. |
| `GET /api/admin/partners` | `requireRole('admin')` | All partners + owner name. |
| `DELETE /api/admin/pets/:id` | `requireRole('admin')` | Admin delete (cascades applications via FK). |
| `DELETE /api/admin/applications/:id` | `requireRole('admin')` | — |
| `PATCH /api/admin/partners/:id` | `requireRole('admin')` | Edit partner (deactivate = clear `owner_id` or similar — document your choice). |

### 4d. Public stats — `backend/routes/statsRoutes.js` + `backend/controllers/statsControllers.js`

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/stats` | public | Landing-page impact counters: total pets, pets adopted, pets available, partner count, appointment count, approved-application count. Plain counts, `{ count: 'exact', head: true }` queries. |

### 4e. Mailer — `backend/services/mailer.js` (new `services/` dir)

```js
sendEmail(to, subject, html)                       // core sender
applicationReceivedEmail(to, { petName, applicantName })
applicationDecisionEmail(to, { petName, approved })
appointmentConfirmedEmail(to, { partnerName, date, type })
```

- If `process.env.RESEND_API_KEY` is set → POST to `https://api.resend.com/emails` via `fetch` (`from` = `Denly <onboarding@resend.dev>` is fine on free tier). **No SDK** — plain fetch, no new dependency.
- Otherwise → `console.log('[mailer:fallback]', { to, subject })` — the roadmap's documented fallback.
- One clean HTML template function reused by all three helpers (accent color, title, body, footer).
- **Ship the function signatures above before Person 1 needs them** (even a stub returning early) so 3b/3c can wire calls immediately.
- Person 1 calls these wrapped in their own try/catch so an email failure never fails the API request.

---

## 5. Shared integration step (whoever finishes second)

The **only** shared file is `backend/app.js`. Rules to avoid conflicts:

- Each person adds their own `app.use('/api/<x>', require('./routes/<x>Routes'))` lines in a **separate small commit**, pulling before pushing.
- Whoever finishes second also:
  - adds a JSON 404 handler (`app.use((req, res) => res.status(404).json({ error: 'Not found' }))`) and a global error handler (500 JSON) after all routes
  - removes the dead `createUserScopedClient` from `backend/supabase/authclient.js`
  - runs `npm i multer` (Person 1's dependency)

---

## 6. Test checklist — run against the live Supabase DB before calling your part done

Login helper (do it once, save the token):
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"partner@denly.app","password":"denly123"}'
# → copy session.access_token
```

### Person 1
- [ ] `GET /api/pets?species=dog&vaccinated=true` → only vaccinated dogs, each with partner info
- [ ] `GET /api/pets?q=lab` → finds Bruno (Labrador)
- [ ] `GET /api/pets?limit=5&page=2` → correct slice + `total`/`totalPages`
- [ ] As adopter: apply for an available pet → 201; apply again → **409 duplicate**
- [ ] As adopter: apply for Nala (`pending`) → **409 not available**; apply for Max (`adopted`) → 409
- [ ] As partner (Happy Tails): `GET /api/applications/partner` shows the app → `PATCH` approve → pet status is now `adopted` (verify `GET /api/pets/:id`) and any other pending apps for that pet are `rejected`
- [ ] As partner: `PATCH /api/pets/<pet-owned-by-FurEver>` → **403**
- [ ] `POST /api/pets` as partner → 201 (pet linked to Happy Tails automatically); as adopter → **403**
- [ ] `POST /api/pets/:id/image` with a PNG → 200 + public `image_url` that loads in a browser; with a `.txt` or >5MB → **400**
- [ ] `POST /api/appointments` with **no token** → 201; with a past date → **400**; with a valid token → `user_id` linked
- [ ] As partner: appointment `pending → confirmed → done` works; `done → confirmed` → **409**

### Person 2
- [ ] `GET /api/partners?type=vet` → 2 vets; each partner includes an available-pet count (Happy Tails = 5)
- [ ] `GET /api/partners/<happy-tails-id>` → partner + its available pets
- [ ] As partner: `POST /api/partners` → **409 already have an org**; as adopter → **403**
- [ ] `GET /api/resources?category=vaccination` → 2 articles; `GET /api/resources/why-vaccinate` → full markdown body
- [ ] As admin: `POST /api/resources` with a title but no slug → slug auto-generated; as non-admin → **403**
- [ ] As admin: `GET /api/admin/stats` → counts match the seed (13 pets: 11 available, 1 pending, 1 adopted; 6 partners: 2 shelter, 2 vet, 2 ngo; 1 application pending; 1 appointment vaccination). As adopter → **403**
- [ ] `GET /api/stats` (no auth) → landing counters match seed
- [ ] With `RESEND_API_KEY` unset: triggering `sendEmail` logs `[mailer:fallback] ...` and the request still succeeds
- [ ] With `RESEND_API_KEY` set (test key): email arrives

## 7. Git workflow

- Work on `main`, small commits (`feat(pets): list endpoint with filters/search/pagination`), **pull before push**.
- Push to `https://github.com/Jinx-08/Denly.git`.
- The only merge-conflict surface is `app.js` — keep your mount-line commits tiny (§5).
- Never commit `.env` (already gitignored).

## 8. Done = both checklists green + one final sweep

Run the whole app (`node backend/server.js`), execute **both** checklists end-to-end, confirm every endpoint responds with the documented shape, then final commit + push.
