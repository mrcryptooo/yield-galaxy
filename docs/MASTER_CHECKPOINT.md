# Project

**Name:**
Yield Galaxy

**Repository:**
github.com/mrcryptooo/yield-galaxy

**Production:**
https://yield-galaxy.vercel.app

**Working Directory:**
C:\Users\M\Desktop\sols

**Canonical status:** This is the ONLY project directory under active development. Other copies found on this machine (`C:\Users\M\Desktop\Yield Galaxy\yield-galaxy`, `C:\Users\M\Desktop\sols1`, `C:\Users\M\Desktop\solscout-tmp`, `C:\Users\M\Desktop\PrediXI\yield-galaxy`) are archived/obsolete and must not be edited. See `docs/PROJECT_CHECKPOINT.md` and the audit performed 2026-07-01 for full history.

---

# Current Status

**Current Phase:**
Final UX + Visual Polish (complete)

**Project Health:** Stable. Working tree clean, no uncommitted changes.

**Current Git Commit:**
`189803f6c1c242914e6f73c813b65b3f3048df0a` — "Final immersion pass: hover story, focus mode darkening, deeper Captain dialogue, unified motion language"

**Current Branch:**
`main` (up to date with `origin/main`)

**Current Deployment URL:**
https://yield-galaxy.vercel.app (Vercel project `yield-galaxy`, org `team_bFeeyU5eZ1ysljaYy8sdGB9S`)

⚠️ **Unresolved security note:** the git remote for this repo embeds a GitHub PAT in plaintext (`https://ghp_...@github.com/mrcryptooo/yield-galaxy.git`), and the Vercel deploy token used previously should be rotated. Not yet remediated as of this checkpoint.

---

# Completed Roadmap

- Phase 1 — World Foundation ✅
- Phase 2 — Interactive Galaxy ✅
- Phase 3 — Captain Companion ✅
- Phase 4 — Journey System ✅
- Phase 5 — Real Data Layer ✅
- Phase 6 — Route Engine ✅
- Phase 7 — Cinematic Journey ✅
- Phase 8 — Dynamic Optimizer ✅
- Phase 9 — Captain Intelligence ✅
- Phase 10 — Execution Engine ✅
- Phase 11 — Production Polish ✅

(Note: commit history groups these under slightly different labels — `Milestone 4/5`, `Phase 6`, `Phase 7/7B`, `Phase 8`, `Phase 9`, `Phase 10`, `Phase 11` — but the delivered scope matches the list above 1:1.)

---

# Current Architecture

**Galaxy** (`src/components/galaxy/`)
Full-viewport R3F `Canvas` scene: `galaxy-scene.tsx` composes `star-field`, `nebula-background`, `orbital-rings`, `solstice-sun`, `hero-planets`, `stations`, `moons`, `atmosphere`, `world-events`, `world-life`, `route-trails`, and `planet-experience` (focused-planet info layer + protocol orbits + holographic data plates). Hand-crafted, locked positions in `positions.ts`. Bloom post-processing via `EffectComposer`.

**Camera** (`galaxy-camera.tsx`)
Single owner of all camera motion. State machine: `opening → idle → flying → journey-orbit`. Smootherstep easing, incommensurate-frequency idle drift, layered ESC navigation (journey → protocol → planet → galaxy). No UI element is allowed to move the camera directly.

**HUD** (`src/components/hud/`)
Unified CSS Grid app shell (`app-shell.tsx`): persistent Top Bar (logo/wordmark/Galaxy-List switch + reserved space for future Wallet/Portfolio/Settings/Notifications), Left Panel (`planet-info-panel.tsx`, `station-info-panel.tsx`, `captain-presence.tsx`), Center (galaxy/list, no chrome), Right Panel (`comms-console.tsx`, `route-selector.tsx`, `telemetry-strip.tsx`), Bottom Panel (`mission-panel.tsx`). Every panel shares one `.shell-panel` glass class — no floating windows, no independently `position:fixed` HUD elements.

**Captain** (`src/lib/captain/` + `hud/captain-presence.tsx`)
Pure-function intelligence pipeline: `analysis.ts → insights.ts → risk.ts → recommendations.ts → speech.ts → summary.ts` (orchestrated by `buildBriefing()`). Rendered via 5 state images (idle/thinking/talking/success/alert) driven by `journey-store` + `execution-store` + `captain-store`.

**Journey** (`src/components/galaxy/journey-player.tsx`, `src/lib/route-templates.ts`, `src/lib/route-engine.ts`, `hud/mission-panel.tsx`)
Auto-play cinematic playback of a route: fly → dwell → next-step timer loop, drives `journey-store` and camera `journey-orbit` phase, with per-step Captain narration lines. Presented via the Bottom Panel's Mission Panel (checkmarked completed steps, glowing current step, locked future steps, Explorer Badge on completion) — the panel is always present, showing an idle prompt when no route is active.

**Optimizer** (`src/lib/optimizer/`)
`opportunity-graph.ts` (directed graph) → DFS path search → `constraints.ts` filtering → `scorer.ts` multi-factor scoring → `simulator.ts`. `optimizer.ts` returns top 8 scored routes. Backed by `optimizer-store.ts`.

**Execution** (`src/lib/execution/`)
`wallet-adapter.ts` (interface + `MockWalletAdapter`) → `transaction-builder.ts` → `transaction-queue.ts` → `execution-engine.ts` → `simulation.ts` → `receipt.ts`, with `errors.ts` for typed failures. Driven by `execution-store.ts` (`plan`, `simulation`, `receipt`, `executionSpeech`).

**Real Data** (`src/lib/defillama.ts`, `celestial-map.ts`, `build-planet-data.ts`, `scoring.ts`, `supabase.ts`)
DefiLlama `/pools` + `/chart/{id}` → adapter maps pools to deterministic celestial/protocol slugs → scoring/risk grading → optional Supabase cache (graceful null fallback) → `use-yields.ts` React Query hook (5 min stale time) → `buildPlanetData()` feeds the galaxy.

**List View** (`src/components/list/list-view.tsx`)
Full data-table alternative view, toggled via `view-store.ts` (`mode: 'galaxy' | 'list'`), glass-styled overlay with sortable columns and an EXPLORE action that re-focuses the galaxy.

**Branding** (`src/components/hud/branding.tsx`)
Fixed top-left: logo (`yield-galaxy-logo.png`) + "Yield Galaxy" + "Built on Solstice", low-opacity floating text, no background panel.

**Stores** (`src/stores/`)
`galaxy-store`, `journey-store`, `optimizer-store`, `captain-store`, `execution-store`, `view-store` — all Zustand, no cross-store coupling beyond what's read in HUD components.

**Data Layer** (`src/lib/`)
Types, constants, DefiLlama fetcher, scoring/risk engine, celestial mapping, adapter, format helpers — feeds both the galaxy and the list view from one source of truth (`useYields()`).

**API Layer** (`src/app/api/`)
`/api/yields`, `/api/yields/[id]/history`, `/api/cron/ingest` (daily, Vercel Hobby plan limit — see `26f0b2b`).

**Three.js Scene**
React Three Fiber + Drei (Billboard sprites, `Html` overlay, `useTexture`, `OrbitControls`), `EffectComposer` + `Bloom`, screen-composition-first world positioning (viewport % → world coordinates).

---

# Locked Systems

These must be **extended, not rewritten**, without explicit user sign-off:

- Galaxy rendering / world composition (`galaxy-scene.tsx`, `positions.ts`, all Phase 1–2 world objects)
- Camera ownership model (`galaxy-camera.tsx`) — no UI element may ever move the camera directly
- Journey Engine (`journey-player.tsx`, `route-engine.ts`, `route-templates.ts`)
- Route/Dynamic Optimizer (`src/lib/optimizer/*`)
- Execution Engine (`src/lib/execution/*`)
- Captain Intelligence pipeline (`src/lib/captain/*`)
- Data Adapter / celestial mapping (`celestial-map.ts`, `build-planet-data.ts`) — deterministic slug generation must not change without updating `CAPTAIN_PROTOCOL_LINES` in lockstep
- World Composition / hand-crafted positions (`positions.ts`) — screen-composition-first layout is a deliberate design lock, not an accident

---

# Assets

All under `C:\Users\M\Desktop\sols\public\assets\`:

- **Branding logo:** `public/assets/branding/yield-galaxy-logo.png`
- **Captain assets:** `public/assets/captain/` — `captain-idle.webp`, `captain-holographic.webp`, `captain-speaking.webp`, `captain-success.webp`, `captain-alert.webp`, `captain-full-body.webp`
- **Sun artwork:** `public/assets/galaxy/solstice-sun.png`
- **Planet assets:** `public/assets/planets/` — `usx-planet.webp`, `eusx-planet.webp`, `slx-planet.webp`, `stslx-planet.webp`
- **Station assets:** `public/assets/stations/` — `kamino-station.webp`, `orca-station.webp`, `raydium-station.png`, `loopscale-station.png`, `exponent-station.png`
- **Background assets:** `public/assets/backgrounds/` — nebula panorama and related atmospheric textures

---

# Current Known Issues

- [x] Typography readability — new CSS scale (`--fs-micro` → `--fs-hero`), larger/heavier text everywhere
- [x] Glass cards behind text — `.glass-panel` / `.glass-panel-strong` / `.glass-card` applied to every floating HUD/galaxy text element
- [x] Better Galaxy/List switch — nav rebuilt as a glass pill, still instant/stateless switch
- [x] Better branding visibility — added "Yield Intelligence" line, higher opacity, glass backing
- [x] Sun artwork improvements — billboard-locked logo plate keeps the mark visible from every angle, added god-ray ring
- [x] Station artwork improvements — 2x scale, deeper volumetric halo, glass-backed labels
- [x] Captain animation — 300px, idle dialogue every 20-40s, hover reaction, blink animation
- [x] Background scaling — two independently-rotating parallax nebula shells added for depth
- [ ] Mobile optimization — still not audited/built (out of scope for this pass)
- [ ] Wallet integration — real wallet connection not implemented (execution engine currently uses `MockWalletAdapter`)
- [ ] Transaction execution — real on-chain execution not implemented (simulation-only today)
- [x] Final UX polish — global consistency pass done (typography, glass, spacing, HUD panel collision fix)

Known pre-existing, out-of-scope condition: `npm run lint` reports 48 errors / 9 warnings, all inherent to idiomatic React Three Fiber code (imperative mutation of Three.js objects inside `useFrame`, `Math.random` in `useMemo`, ref access during render) across locked systems (`atmosphere.tsx`, `star-field.tsx`, `route-trails.tsx`, `world-events.tsx`, `world-life.tsx`, `galaxy-camera.tsx`). Verified byte-identical against commit `d30884d` (before the first polish pass) via `git stash` — introduced zero new lint errors since.

Known unfixable-by-code condition: the visible line crossing the USX planet is a decorative orbital ring with an embedded warning-triangle icon **painted directly into `usx-planet.webp`'s pixels** — confirmed by opening the source file directly. Not a geometry/UV/material/rotation issue; no Three.js code change can remove baked-in pixel content. Fixing it requires either a new/edited source asset, or an explicit decision to add a code-level visual overlay to mask that specific region (not attempted — risks looking worse without image tooling to target it precisely).

Two real duplicate-React-key bugs were found and fixed during these passes (not pre-existing — introduced by upstream data/logic, not by this session's UI edits): (1) `Protocol.id` collisions in `build-planet-data.ts` when two opportunities shared a slug — fixed by appending the real opportunity id. (2) `OptimizedRoute.id` collisions in `optimizer.ts` when the DFS path-finder yielded the same node sequence via parallel edges — fixed by deduping candidates by id before ranking.

---

# Next Milestone

**Final UX + Visual Polish**

Everything from now on must be an extension of the existing architecture. Nothing should be rebuilt from scratch unless explicitly requested.
