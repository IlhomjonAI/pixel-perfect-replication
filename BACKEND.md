# Backend milestone 1 — D1 and public reads

The existing TanStack Start application serves the website and the API from the
same Cloudflare Worker. No separate backend, paid service or account token is
needed for local checks. News, achievements and teachers use D1; school-life still uses demo data.

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
remote database. News is empty until published posts are added. School-life retains demo data.

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
Contact messages have no public read endpoint. Milestone 6 below adds submission.

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

Remaining milestones: request handling
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

## Backend milestone 5 — teachers

The admin page includes a Teachers section with create, edit, draft, publish and
archive. Fields include name, photo URL, subject, qualification, education,
experience, biography, certificate names and separate certificate image URLs.
Up to 20 certificate names and 20 image URLs are supported per profile. HTTPS
image URLs remain optional; uploading local image files is a later milestone.

Apply migration 0006 locally, run `npm run check`, then `npm run worker:local`.
Keep the existing admin password. Add a draft teacher, confirm it is hidden from
`/oqituvchilar`, publish and open its detail page, then archive and verify it is
hidden again. Certificate images can be opened from the public detail page.

GET/POST `/api/admin/teachers` and GET/PUT `/api/admin/teachers/:slug` validate
admin sessions. Writes require matching Origin, bounded JSON and validated
fields. Version conflicts return 409; there is no permanent delete endpoint.
Admin lists have 20 records per page. Public pages use D1 through server
functions, returning only published profiles. The list initially loads 50
profiles and can load additional pages. Name/subject search and subject filters
apply to loaded profiles. The home page reads a bounded published subset.

Migration 0006 preserves existing certificate names and adds an empty image
array plus version metadata. Teacher types and row mappers preserve backward
compatibility with old rows and demo fixtures. The production profile renders
certificate names as text, biography with line breaks, and certificate images
with full-image links. The public API includes the certificate image array.

Tests verify a 50-profile dataset, publication transitions, certificate mapping,
invalid URLs and fields, authorization, Origin checks, stale writes and bounded
requests. Remote migrations and deployment remain separate; no remote database
has been changed by this milestone.

## Backend milestone 6 — contact requests

The `/aloqa` form now saves real requests to D1 and confirms receipt only after
success. Fields include name, email or phone, request type, message and required
consent. Receipt does not mean a reply has been sent. No email or Telegram
notifications are sent in this milestone.

Apply migration 0007 locally, run `npm run check`, then `npm run worker:local`.
Use the existing local password. Send a sample request through `/aloqa`, open
`/admin` → Requests, read it and change its status to In progress or Resolved.
Filter the list by status and refresh to confirm persistence.

POST `/api/contact` accepts bounded validated JSON, requires matching Origin
and gives a generic receipt with no personal details. GET and other methods are
rejected. Requests have random client UUIDs; a unique index makes retries and
concurrent repeats idempotent. Consent timestamp is recorded. The frontend
retains the UUID when retrying a failed submission, disables inputs while
sending and resets the form only after success.

Atomic D1 counters limit new requests to three per IP per 15 minutes and 100
across the site per hour. IPs are salted with the existing secret hash before
being stored as short-lived quota buckets; raw IPs are not written to D1. Old
quota buckets are cleaned up opportunistically. These limits bound submission
frequency; they are not a substitute for edge protection or CAPTCHA if abuse
occurs. A later deployment can add Turnstile without changing the stored data.

Admin-only GET `/api/admin/messages` lists 20 requests per page with status
filtering and counts. GET `/api/admin/messages/:id` reads a request; PATCH
updates only status and requires Origin, a session and the current version.
Stale updates receive 409. There is no public read or delete endpoint. Message
text is rendered as text, with line breaks preserved. This milestone does not
add permanent deletion or a retention schedule.

Migration 0007 preserves existing messages, adding request IDs and version
metadata plus separate quota storage. Admin credentials must be configured for
submission to work; the existing `.dev.vars` already supplies the required
secret during local preview. Never publish it.

Tests verify validation, required consent, concurrency, idempotent retry,
authorization, Origin checks, quotas, status filtering, stale edits and limits.
All fixtures are isolated local data. No remote migration or real notification
has been performed.

## Backend milestone 7 — computer image uploads with Supabase Storage

News covers and galleries, achievement certificates, teacher photos and teacher
certificate images now have file pickers. Existing HTTPS URL fields still work.
Choose JPG, PNG or WebP files up to 5 MiB each. Uploading fills the corresponding
URL field; save the post, achievement or profile to attach it. Uploading alone
does not publish content. Successful files are retained when a later file fails.

Images are stored in your own Supabase Storage account. The existing Cloudflare
D1 content database and admin authentication remain in use. D1 stores only image
metadata and URLs. The Supabase Free plan currently includes 1 GB file storage
and limited bandwidth; inactive projects can pause. Monitor your account usage.
The application does not change plans or buy additional resources.

### Configure your Supabase project

1. In Storage, create a **public** bucket named `school-images`.
2. Restrict its allowed MIME types to `image/jpeg`, `image/png`, `image/webp` and
   maximum file size to 5 MiB. Do not add public upload, update or delete policies.
3. Copy the Project URL from the Connect dialog. In Settings > API Keys create or
   copy a server **Secret key** starting with `sb_secret_` (not a publishable key).
4. Keep the existing admin configuration and run:

```sh
npm run db:migrate:local
npm run images:setup
npm run check
npm run worker:local
```

The setup script prompts for Project URL, bucket name (default `school-images`)
and the Secret key. Secret input is hidden. It writes to the ignored root
`.dev.vars`, preserves the admin password hash and replaces obsolete Cloudinary
settings. Restart the worker after configuration changes; its start script copies
these secrets into the generated server directory. Never commit `.dev.vars`,
send the key to someone else, or put it in a VITE variable. A future deployment
needs these values configured as server secrets separately; local setup does not
configure or deploy a remote worker. No Supabase SDK dependency is required.

Public buckets make image delivery URLs public, including images attached to
drafts. Upload only images intended for public viewing. Anonymous users can read
public image URLs but cannot upload through this application's protected API.
A public bucket does not by itself allow anonymous writes; keep those policies
absent. The server key provides privileged storage access only after admin auth.

POST `/api/admin/uploads` requires a valid admin session and matching Origin.
It accepts one bounded multipart file, checks MIME type, byte header and image
dimensions, then sends its binary bytes to the Supabase Storage REST API. Secret
keys use the `apikey` header and are never returned to the browser. Uploads have
random paths with real image extensions, refuse overwrite and reject redirects.
The public delivery URL is constructed from the validated project, bucket and
object path. The provider response must confirm that same object path.

Limits are 5 MiB per file, 20,000 pixels per dimension, 100 million pixels total,
30 attempts per minute and 1,000 per day across the admin account. Supabase plan
limits still apply. Header parsing determines metadata; it is not a full image
decoder or image optimization service. Migration 0008 adds metadata and quota
tables without changing existing content. It is unchanged from the earlier
Cloudinary patch, so users who applied it do not need a replacement migration.

This milestone does not automatically delete images. Cancelled edits, replaced
images and uploads whose metadata save fails can leave unused assets. Review
these manually in Supabase Storage before deleting; an asset might be used in
more than one record. Older stored Cloudinary URLs are not rewritten.

Tests use isolated local D1 data and a mocked Supabase upload service. They verify
authentication, Origin checks, type/size validation, image dimension parsing,
server credential headers, restricted project URLs, provider errors, quotas and
asset metadata persistence. A real project upload still needs to be checked
after you configure credentials. No remote database migration, bucket creation
or deployment has been performed by the code changes.

References:

- https://supabase.com/docs/guides/storage/uploads/standard-uploads
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/pricing
