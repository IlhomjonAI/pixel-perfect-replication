# Bekobod tuman ixtisoslashtirilgan maktabi — veb-sayt

Frontend-only school website (TanStack Start/Router, React, TypeScript, Tailwind v4, lucide-react).

## Local development
```
bun install
bun run dev      # http://localhost:8080
bun run build    # production build
bunx vitest run  # tests
```

## Structure
- `src/data/types.ts` — typed models (Post, Achievement, Teacher, SchoolLifeItem)
- `src/data/mock/*` — sample ("Namuna") content; replace freely
- `src/lib/api.ts` — data-access layer; the only place pages read data from
- `src/components/site/*` — header, footer, cards, placeholders, modal, empty/loading states
- `src/routes/*` — pages

## Future backend
Swap the bodies of functions in `src/lib/api.ts` for `fetch` calls to a Cloudflare Workers API (D1 database).
Image fields (`coverImage`, `photo`, `certificateImage`) accept URLs (e.g. Cloudinary); `null` renders a labelled placeholder.
The contact form (`/aloqa`) only validates locally and never sends or stores data. No secrets live in frontend code.
