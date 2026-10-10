# Backend milestone 1 — D1 and public reads

The existing TanStack Start application serves the website and the API from the
same Cloudflare Worker. No separate backend, paid service or account token is
needed for local checks. News and achievements use D1; teachers and school-life still use demo data.

## Local setup

Use Node.js 22.12+ (or a newer supported Node LTS).

```sh
npm ci
npm run db:migrate:local
npm run build
npm run worker:local
```

The last command prints the local URL, normally http://localhost:8787.
Open `/api/health` there: expected response is
`{"data":{"status":"ok","database":"ready"}}`.
`/api/posts`, `/api/teachers` and `/api/achievements` return empty lists until
published records are added. This is expected; no demo seed is applied to your
remote database. News is empty until published posts are added. Teachers and school-life retain demo data.

Local migrations and Worker preview use the same `.wrangler/state` directory.
Migration commands explicitly select tracked `wrangler.toml`, not the generated
deployment config. The placeholder database ID works for local development;
never attempt a remote migration with it.

## Read-only API

| Endpoint                | Response                                    |
| ----------------------- | ------------------------------------------- |
| GET /api/health         | Checks binding and posts table availability |
| GET /api/posts          | Published posts                             |
| GET /api/posts/:slug    | Published post or 404                       |
| GET /api/teachers       | Published teachers                          |
| GET /api/teachers/:slug | Published teacher or 404                    |
| GET /api/achievements   | Published achievements                      |

List requests accept `limit` (1–50, default 20) and `offset` (0–100000,
default 0). Responses use `{data, pagination}`; detail responses use `{data}`.
Errors use `{error:{code,message}}`. Unsupported writes receive 405.
Contact messages have no public read or write endpoint.

All existing rows default to draft after migration 0002. Queries filter
publication status, bind parameters and select public fields explicitly.
Later milestones below add admin login and post publishing.

## Verification

```sh
npm run typecheck
npm test
npm run build
```

API tests apply both migrations to isolated real local D1 via Miniflare. They
check draft/archive exclusion, published detail, stable pagination, invalid
pagination, bound SQL parameters, safe errors and blocked message reads/writes.
These fixtures are test-only and are never uploaded to Cloudflare.

Nitro reads the tracked `wrangler.toml` during production build and emits
`.output/server/wrangler.json`. Confirm its `d1_databases` contains binding DB.
Do not edit generated `.output` files.

## Remote setup — later, after review

Copy the actual database UUID from Cloudflare D1 settings into the tracked
`wrangler.toml`. Database name: `bekobod-maktab-db`. The UUID is configuration,
not an account token. Keep secrets out of source control.

When this milestone has been reviewed, migrations can be applied separately:

```sh
npx wrangler login
npx wrangler d1 migrations apply bekobod-maktab-db --remote --config wrangler.toml
```

This modifies the remote schema. It is not part of the local setup above.
No remote migration or deployment has been performed in this milestone.
After replacing the UUID, rebuild before any future deployment. Existing
frontend and API share the generated Worker build.

Remaining milestones: teacher management, request handling
and image uploads.

## Backend milestone 2 — single-administrator login

The `/admin` page now supports login, session checks and logout. Post editing is available in milestone 3 below. There is no public administrator registration.

Stop the running preview with Ctrl+C, apply the auth patch, then run:

```sh
npm run db:migrate:local
npm run check
npm run admin:setup
npm run worker:local
```

`admin:setup` generates a random 32-character password and saves only its salted
PBKDF2-SHA256 hash to ignored `.dev.vars`. Save the printed password privately;
do not send it to anyone or include it in screenshots. The script refuses to
overwrite an existing `.dev.vars`. It does not create or alter a remote admin.
The pre-preview script copies local secrets beside the generated Wrangler
configuration; both files are ignored by Git. Rebuild normally: the next preview
copies the secrets again. Open the printed preview URL followed by `/admin`.

Sessions expire after eight hours. Only SHA-256 token hashes are stored in D1;
HTTP cookies are HttpOnly, SameSite=Strict and Secure on HTTPS. Changing the
configured password hash invalidates existing sessions. Logout deletes the
session. POST requests require a matching Origin. Login input is bounded to
2048 bytes. Atomic D1 counters allow five attempts per IP per 15 minutes and
50 total attempts per 15 minutes; this also bounds work for the single admin.
Unexpected failures and absent configuration deny access.

The only admin endpoints are POST `/api/admin/login`, GET `/api/admin/session`
and POST `/api/admin/logout`. Future content APIs must call `requireAdmin`
server-side and validate Origin for writes; rendering `/admin` is not itself
an authorization check. Never put credentials into VITE_* variables.

Remote setup remains a separate step: apply migration 0003 remotely and set
ADMIN_PASSWORD_HASH with Wrangler secrets against the same Worker configuration.
Do not deploy the placeholder database ID. The local secret file is not deployed.

## Backend milestone 3 — news publishing

The authenticated `/admin` page lists every post, including drafts and archives,
and creates or updates a post. Fields include title, category, date, excerpt,
paragraphs, optional HTTPS cover URL, up to ten gallery URLs, and publication
status. Only published posts appear on the home page, news listing and detail
pages. There is no demo fallback for news, so an empty database produces an
honest empty state. Images are URL-based in this milestone; file upload follows.

Apply migration 0004 locally and verify before preview:

```sh
npm run db:migrate:local
npm run check
npm run worker:local
```

Keep the existing local password and `.dev.vars`; do not run `admin:setup` again.
Create a test draft, save it, confirm that it is absent from `/yangiliklar`,
then change its status to published and save. Open its card and confirm its
paragraphs. Archive the post to hide it without permanently deleting it.

GET `/api/admin/posts` returns 20 posts with offset pagination and hasMore.
POST creates a generated immutable slug; GET and PUT `/api/admin/posts/:slug`
read and update. Every endpoint validates the session server-side, writes also
validate Origin, and JSON bodies have a streamed 32 KB maximum. Zod rejects
unknown fields, invalid calendar dates, unsupported categories and unsafe URLs.
Updates atomically require the current version; stale edits receive 409 and
must reload the post. No destructive delete endpoint is exposed.

Public news uses TanStack server functions, which read the request's D1 binding
for both SSR and browser navigation. Use the Worker preview for database-backed
pages; the plain Vite development server has no D1 binding. The news list starts
with 50 records and supports loading additional pages; search and category
filters apply to loaded records. Admin lists support next/previous navigation.

Automated tests cover authentication, Origin rejection, validation, body limits,
publication transitions, stale edits, missing records and disabled deletes.
A production Worker smoke check also verified draft exclusion and published
post rendering on the home, listing and detail pages. No remote database has
been migrated or seeded by this work.

## Backend milestone 4 — achievements

The admin page has separate News and Achievements controls. Achievement fields
include student name, class at the time, type, title, subject, stage, result,
date, optional teacher and optional HTTPS certificate image. Types include
subject olympiads, STEM, Al-Xorazmiy, IELTS, SAT and national certificates.
IELTS, SAT and national certificates use the Certificate stage; olympiads use
competition stages. Draft, publish and archive work like news, with optimistic
version checks. Switching admin sections preserves unsaved form state.

Apply migration 0005 locally, run `npm run check`, then `npm run worker:local`.
Use the existing admin password. Create a draft in the Achievements section,
publish it, check `/yutuqlar` and the home page, then test filters and archive.
Images continue to use direct HTTPS URLs; uploads have not been added yet.

GET/POST `/api/admin/achievements` and GET/PUT
`/api/admin/achievements/:id` require a valid admin session. Writes also require
matching Origin, a bounded JSON body and validated fields. Admin lists use 20
rows per page. There is no permanent deletion API.

The public achievements page loads 12 results at a time. Year, subject, type
and stage filtering runs in D1 across all published records before pagination;
filters do not depend on which cards are already loaded. The filter options
include only published years and subjects (bounded to 100 unique values each).
Failed or superseded requests cannot overwrite newer filter results. The home
page also reads published achievements directly from D1, with no demo fallback.

Tests exercise a 300-record dataset, filters beyond the first page, parameter
binding, hidden draft metadata, certificate stage validation, publication,
archiving, stale edits and authorization. Fixture records are isolated local
test data; nothing has been added to the school's remote database.
