# Yield Galaxy

Solstice ecosystem yield intelligence platform with 3D galaxy map.

## Stack
- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS 4
- Three.js / React Three Fiber (3D galaxy map)
- Zustand (state)
- Recharts (charts)
- Supabase (PostgreSQL)
- Vercel (hosting, cron)

## Data Source
DefiLlama API (free, no auth). Fetched every 5 minutes via Vercel Cron.
Filtered to Solstice ecosystem: USX, eUSX, SLX, stSLX across Kamino, Orca, Raydium, Loopscale.
Live fallback when Supabase is unavailable (caches 60s in-memory).

## Key Commands
- `npm run dev` — local development
- `npm run build` — production build
- `npx tsc --noEmit` — type check

## Routes
- `/` — Galaxy map (default) or list view
- `/api/yields` — Scored opportunities (sort, filter, search)
- `/api/yields/[id]/history` — APY chart data (proxies DefiLlama)
- `/api/cron/ingest` — Cron: fetch → score → upsert (auth: Bearer CRON_SECRET)
- `/api/og` — Dynamic OG image generation
- `/robots.txt` — SEO
- `/sitemap.xml` — SEO

## Architecture
- `src/lib/` — Data layer: types, constants, DefiLlama fetcher, scoring, celestial mapping, insights engine
- `src/app/api/` — API routes: yields, cron, OG images
- `src/components/galaxy/` — 3D scene: star field, celestial bodies, labels, camera
- `src/components/ui/` — UI: table, filters, detail panel, observatory, share, badges
- `src/stores/` — Zustand store
- `supabase/migrations/` — Database schema

## Database
3 tables: sources, opportunities, snapshots. See supabase/migrations/001_initial_schema.sql.
RLS enabled — anon can SELECT only, writes require service role.

## Environment
Copy .env.example to .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- CRON_SECRET
- NEXT_PUBLIC_SITE_URL (optional, defaults to https://yieldgalaxy.app)

## Scoring
- Risk grade: 3-factor (protocol maturity + TVL + strategy type), grades A-F
- Opportunity score: 45% yield percentile (capped at 100%) + 25% TVL (log-scaled) + 30% risk bonus
- Calibrated for Solstice universe (~16 opportunities)

## Insights Engine (Captain Whiskers Lite)
Rule-based, no LLM. Generates insights from opportunity data:
best opportunity, safest yield, highest APY, PT availability, yield compression, galaxy summary.
