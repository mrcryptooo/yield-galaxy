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
Phase 11 — Production Polish

**Project Health:** Stable. Working tree clean, no uncommitted changes.

**Current Git Commit:**
`d30884d09864cd8b6e5aeeacf2dc52919dd8abb6` — "Phase 11: Production Polish"

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
Diegetic, camera-attached overlay: `visor-layer` (micro drift wrapper), `nav-bar`, `captain-presence`, `comms-console`, `telemetry-strip`, `route-selector`, `journey-hud`, `branding`.

**Captain** (`src/lib/captain/` + `hud/captain-presence.tsx`)
Pure-function intelligence pipeline: `analysis.ts → insights.ts → risk.ts → recommendations.ts → speech.ts → summary.ts` (orchestrated by `buildBriefing()`). Rendered via 5 state images (idle/thinking/talking/success/alert) driven by `journey-store` + `execution-store` + `captain-store`.

**Journey** (`src/components/galaxy/journey-player.tsx`, `src/lib/route-templates.ts`, `src/lib/route-engine.ts`)
Auto-play cinematic playback of a route: fly → dwell → next-step timer loop, drives `journey-store` and camera `journey-orbit` phase, with per-step Captain narration lines.

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

- [ ] Typography readability — many HUD text elements are too small / low contrast against the galaxy
- [ ] Glass cards behind text — not every floating text element has a glass backing yet
- [ ] Better Galaxy/List switch — transition and affordance need polish
- [ ] Better branding visibility — logo/wordmark opacity and contrast too weak
- [ ] Sun artwork improvements — logo texture can disappear depending on viewing angle; needs wrap/duplication, more dynamic surface treatment
- [ ] Station artwork improvements — still read as flat sprites rather than volumetric destinations
- [ ] Captain animation — mostly static aside from breathing drift; no idle dialogue timer, limited reactivity
- [ ] Background scaling — nebula/starfield depth and parallax could be richer
- [ ] Mobile optimization — not yet audited/built
- [ ] Wallet integration — real wallet connection not implemented (execution engine currently uses `MockWalletAdapter`)
- [ ] Transaction execution — real on-chain execution not implemented (simulation-only today)
- [ ] Final UX polish — global consistency pass (fonts, spacing, contrast, hierarchy) not yet done

---

# Next Milestone

**Final UX + Visual Polish**

Everything from now on must be an extension of the existing architecture. Nothing should be rebuilt from scratch unless explicitly requested.
