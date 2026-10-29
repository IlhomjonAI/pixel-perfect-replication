# Localhost frontend + Render API

Render Environment:

```dotenv
PUBLIC_ORIGIN=http://localhost:3000
ALLOW_LOCAL_FRONTEND=true
```

The opt-in permits only localhost or 127.0.0.1 on port 3000 over HTTP. All existing
proxy-secret and exact Origin checks still apply. Use the same hostname in the browser.

Create frontend/.env.local (ignored by Git):

```dotenv
API_INTERNAL_URL=https://YOUR-SERVICE.onrender.com
API_PROXY_SECRET=SAME_SECRET_AS_RENDER
```

From the repository root run `npm run dev:frontend`. This starts only the frontend;
do not use the combined `npm run dev` launcher for this setup. Restart the frontend
after changing its environment. Open http://localhost:3000.

The browser calls its local Next.js /api proxy, which forwards requests to Render.
Render does not connect to the user's localhost. Supabase credentials stay on Render.

When deploying the frontend publicly, replace PUBLIC_ORIGIN with its HTTPS origin,
remove ALLOW_LOCAL_FRONTEND (or set false), then redeploy the backend.

Supabase build validation checks variable formats only; it does not contact Storage.
A created bucket does not fix a missing or malformed SUPABASE_URL or SUPABASE_SECRET_KEY.
Use a public bucket for the public image URLs returned by this application.
