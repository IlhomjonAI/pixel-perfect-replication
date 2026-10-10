# Backend milestone 1 — D1 and public reads

The existing TanStack Start application serves the website and the API from the
same Cloudflare Worker. No separate backend, paid service or account token is
needed for local checks. Frontend pages still deliberately use mock data.

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
remote database. The normal website continues showing its existing demo data.

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
This milestone has no admin login or publishing UI yet.

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

Next milestone: server-side administrator authentication, then protected
content editing, request handling and Cloudinary uploads.

## Backend milestone 2 — single-administrator login

The `/admin` page now supports login, session checks and logout. Content editing
is still the next milestone. There is no public administrator registration.

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
