# SolScout — Architecture Document

**Project:** SolScout — The Solstice Galaxy Explorer
**Date:** 2026-06-24
**Status:** Pre-implementation

---

## 1. Project Overview

SolScout is an immersive DeFi intelligence platform for the Solstice ecosystem. Users explore yield opportunities as celestial bodies in a 3D galaxy. Captain Whiskers (astronaut cat) serves as AI navigator. Every data point comes from real blockchain sources.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | SSR, API routes, routing |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS 4 + shadcn/ui | Component library |
| 3D | Three.js + React Three Fiber + Drei | Galaxy visualization |
| Animation | Framer Motion + GSAP | UI motion, transitions |
| State | Zustand | Client state management |
| Data Fetching | TanStack Query v5 | Server state, caching, refetching |
| Forms | React Hook Form + Zod | Validation |
| Charts | Recharts | Data visualization |
| Icons | Lucide React | Icon system |
| Database | Supabase (PostgreSQL) | Persistence, snapshots, user data |
| Hosting | Vercel | Deploy, CDN, edge, cron |

---

## 3. Folder Structure

```
sols/
├── public/
│   └── assets/           (provided art assets — 22 files)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── yields/route.ts
│   │       ├── yields/[id]/route.ts
│   │       └── cron/ingest/route.ts
│   ├── components/
│   │   ├── galaxy/       (3D scene: sun, planets, stations, moons, stars, nebula, orbits, camera)
│   │   ├── captain/      (mascot: avatar states, speech, narration)
│   │   ├── panels/       (UI panels: detail, observatory, routes, alerts)
│   │   ├── hud/          (heads-up display: navigation, status, search)
│   │   └── shared/       (reusable: badges, charts, cards, buttons)
│   ├── lib/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── format.ts
│   │   ├── defillama.ts
│   │   ├── scoring.ts
│   │   ├── galaxy-objects.ts
│   │   ├── celestial-positions.ts
│   │   ├── missions.ts
│   │   ├── insights.ts
│   │   ├── captain-narration.ts
│   │   └── supabase.ts
│   ├── stores/
│   │   └── app-store.ts
│   └── hooks/
│       ├── use-yields.ts
│       └── use-galaxy.ts
├── supabase/
│   └── migrations/
├── docs/
├── ARCHITECTURE.md
├── TODO.md
├── CHANGELOG.md
├── PROGRESS.md
├── ROADMAP.md
└── package.json
```

---

## 4. Data Flow

```
DefiLlama API (free, no auth)
       │
       ▼
Cron Route (/api/cron/ingest) — every 5 min on Pro, daily on Hobby
       │
       ├── Filter to Solstice tokens (USX, eUSX, SLX, stSLX)
       ├── Score + risk grade
       ├── Upsert to Supabase (opportunities table)
       └── Append snapshots (time series)
       │
       ▼
API Route (/api/yields) — reads from Supabase, falls back to live DefiLlama
       │
       ▼
TanStack Query (client) — caches, refetches every 60s
       │
       ▼
Zustand Store — selectedId, viewMode, filters
       │
       ▼
Galaxy Scene (3D) + UI Panels (2D)
```

---

## 5. Galaxy Architecture (LOCKED)

14 fixed celestial objects. Positions are hand-crafted and permanent.

| Object | Type | Position | Notes |
|--------|------|----------|-------|
| Solstice Sun | Star | (0, 0, 0) | Center, radius 3.5, 5 halos |
| USX | Planet | (-8, 1.2, -5) | Hero, largest |
| eUSX | Planet | (7, 1.8, -7) | Ethereal |
| SLX | Planet | (-6, -0.4, 7) | Energetic |
| stSLX | Planet | (8, -0.1, 6) | Ancient |
| Kamino | Station | (13, 0.6, -1) | Industrial |
| Orca | Station | (-12, 0.2, 4) | Elegant |
| Raydium | Station | (11, -0.4, 9) | Trading |
| Loopscale | Station | (-3, -0.3, -12) | Research |
| Exponent | Station | (1, 0.5, -13) | Observatory |
| PT-USX | Moon | Orbits USX | r=2.0, speed=0.15 |
| PT-eUSX | Moon | Orbits eUSX | r=2.0, speed=0.12 |
| PT-SLX | Moon | Orbits SLX | r=1.8, speed=0.18 |
| PT-stSLX | Moon | Orbits stSLX | r=1.8, speed=0.14 |

Pools are DATA, not rendered objects. Only 4 hero planets exist.

---

## 6. Rendering Strategy

- Galaxy: React Three Fiber with Suspense
- UI: Server Components where possible, Client Components for interactivity
- Assets: WebP, lazy-loaded via next/image
- 3D textures: useTexture from drei
- Bloom: postprocessing EffectComposer
- Stars: 5 instanced particle layers (~3200 total)

---

## 7. Animation Plan

| Element | Animation | Library |
|---------|-----------|---------|
| Sun | Breathing scale | useFrame |
| Planets | Per-identity rotation | useFrame |
| Moons | Orbital motion | useFrame + celestial-positions |
| Stars | Multi-layer rotation | useFrame |
| Camera | Subtle cinematic drift | useFrame |
| Panels | Slide/fade transitions | Framer Motion |
| Detail panel | Slide-in/out with backdrop | Framer Motion |
| Cards | Hover lift | CSS transitions |
| Captain | Idle breathing | CSS keyframes |
| View transitions | Crossfade | Framer Motion |

---

## 8. Performance Strategy

- DPR capped at 1.5
- Lazy load galaxy scene (dynamic import)
- WebP assets (9.2 MB total)
- TanStack Query caching (60s stale time)
- Code splitting per route
- Skeleton loading states
- No unnecessary re-renders (useMemo, useCallback)

---

## 9. Security Notes

- Supabase RLS: anon can SELECT only
- Service role key: server-side only (cron route)
- CRON_SECRET: Bearer token validation
- No user data collected (no auth in v1)
- No wallet connection in v1

---

## 10. Development Roadmap

### Phase 1: Foundation
- Next.js project setup
- Data layer (DefiLlama, scoring, Supabase)
- API routes
- Type system

### Phase 2: Galaxy
- 3D scene (sun, planets, stations, moons)
- Star field, nebula, orbital rings
- Camera, controls, bloom
- Asset integration

### Phase 3: UI Shell
- Layout (galaxy-first, panels secondary)
- Navigation (Galaxy/List toggle)
- Detail panel
- Observatory

### Phase 4: Captain Whiskers
- Avatar states
- Narration engine
- Mission system
- Contextual reactions

### Phase 5: Polish
- Motion system
- Typography
- Color consistency
- Loading states
- Responsive

### Phase 6: Deploy
- Supabase production
- Vercel production
- Cron configuration
- SEO
