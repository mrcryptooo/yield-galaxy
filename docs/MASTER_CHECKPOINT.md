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
Phase 13 — Wallet Integration (real Solana wallet connection: Phantom/Backpack/Solflare, live balances, Captain/Mission Control/Galaxy wallet-awareness)

**Project Health:** Stable. Working tree clean, no uncommitted changes.

**Current Git Commit:**
`37c5ab9` — "Phase 13: real Solana wallet integration (Phantom, Backpack, Solflare)"

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
- Phase 12 — Mission Control Intelligence ✅ (live command center, continuous discovery, discovery mode, narrative missions)
- Phase 13 — Wallet Integration ✅ (real Phantom/Backpack/Solflare connection, live balances, no transactions yet)

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

**Journey** (`src/components/galaxy/journey-player.tsx`, `src/lib/route-templates.ts`, `src/lib/route-engine.ts`, `galaxy/mission-focus-sync.tsx`, `lib/mission-narration.ts`, `hud/mission-panel.tsx`)
Auto-play cinematic playback of a route: fly → dwell → next-step timer loop (slowed for cinematic pacing: 3.4s fly / 7.5s dwell), drives `journey-store` and camera `journey-orbit` phase. The galaxy itself draws NOTHING mission-related (route-trails.tsx was deleted) — `mission-focus-sync.tsx` instead syncs the current step to `galaxy-store`'s focused/focusedStation, so the camera's destination is highlighted via the same Focus Mode a manual click triggers (dim + darken + Left Panel update).

The Mission Panel (Bottom Panel, always present) is a live command center, not a checklist, in three states:
- **Active mission:** status pill (IN PROGRESS/SCANNING/MISSION COMPLETE), animated progress bar, a dominant "current objective" card (52px glowing icon, narrative headline from `getNarrativeLabel()`, Captain line, estimate+reason from `getStepMeta()`) with a compact "next objective" preview beside it, shrunk completed/upcoming dot trails, and a header stats cluster (EST. APY / RISK / SCORE / REWARD) sourced from the route template's `_meta` (set by the optimizer at launch — `RouteTemplate._meta = { apy, risk, score }`, `route-engine.ts`).
- **Continuous Discovery:** completing a mission never ends it — after the Explorer Badge lights, the panel shows a "scanning" state (spinning icon, Captain: "Excellent work. Scanning the ecosystem for another opportunity...") and then automatically re-runs the optimizer and launches the next-best route (skipping the last few just completed, tracked in a ref), so Mission Control stays alive indefinitely.
- **Discovery Mode (idle):** when no mission is active, instead of an empty panel it shows a live dashboard — STATUS/SCANNING (pulsing dot), a Captain briefing naming the current best route, and Protocols Scanned / Pools Analyzed / Candidate Routes / Best Yield / Last Scan, recomputed on a timer so it visibly ticks even with unchanged data.

Objective headlines (`getNarrativeLabel()` in `mission-narration.ts`) are a presentation-only adventure framing (Acquire Fuel / Convert Fuel / Enter Solstice / Reach `<station>` / Collect Rewards, with the last node always "Collect Rewards") — the real protocol/asset stays visible in the Captain line directly beneath. `getStepMeta()` also gained a generic action-keyed fallback table, since `MISSION_STEP_META` was keyed by the (unused) static template ids and virtually never matched a real optimizer-generated mission — dynamic missions were silently showing a placeholder estimate/reason before this fix.

**Wallet** (`src/stores/wallet-store.ts`, `src/lib/wallet/`, `src/components/providers/solana-wallet-provider.tsx`, `hud/wallet-connect.tsx`)
A dedicated store — deliberately not mixed with journey/execution/optimizer state — backed by the official `@solana/wallet-adapter-react` (+ `-base`, `-phantom`, `-solflare`; Backpack auto-registers via the Wallet Standard, which is how modern wallet-adapter recommends supporting it — there's no maintained legacy adapter package for it). `solana-wallet-provider.tsx` wraps `<HomeContent>` in `page.tsx` with `ConnectionProvider`/`WalletProvider` and a `WalletStoreBridge` that mirrors the (hook-based) adapter context into the store and funnels every wallet error (rejected/not installed/wrong network/RPC failure/disconnected) through `onError` into `store.error` instead of an unhandled console error. `store.connect(walletName?)`/`disconnect()`/`refresh()` work from anywhere — Top Bar, Captain, Mission Control — without those callers needing `useWallet()`/`useConnection()` directly. `lib/wallet/portfolio.ts` does real on-chain reads only: SOL via `getBalance`, USDC/USDT via `getParsedTokenAccountsByOwner` against their canonical mainnet mints. USX/eUSX/SLX/stSLX are real Solstice Finance tokens, but their mint addresses couldn't be verified against an authoritative source in this environment (`docs.solstice.finance` blocked automated fetching) — rather than risk hardcoding a wrong stablecoin-shaped address, `lib/wallet/tokens.ts` leaves them `mint: null` and the portfolio service reports them `supported: false` (untracked, not a fabricated zero). Protocol positions (e.g. Kamino obligations) return a real empty list — position detection isn't implemented yet, so `positions` is honestly empty rather than fabricated. Wired into: Top Bar (`wallet-connect.tsx` — connect menu / connected chip with icon+name+short address+stablecoin portfolio figure), Captain (`captain-presence.tsx` — one-off transient reaction on connect/disconnect, same fade-then-resume pattern as the existing view/risk transients), Mission Control (`mission-panel.tsx` — real "Available: X TOKEN" line on acquire/swap/convert/stake steps, via a new optional `assetSymbol` on `RouteNode`/`RouteStepDef` in `route-engine.ts`/`dynamic-route-builder.ts`), and the Galaxy (`hero-planets.tsx`/`stations.tsx` — a real holding/position gives a +0.15 glow boost on top of the existing spring-damped glow, no new geometry). Transactions/swap/deposit/withdraw/stake are explicitly out of scope — the Execution Engine still runs on `MockWalletAdapter`.

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
`galaxy-store`, `journey-store`, `optimizer-store`, `captain-store`, `execution-store`, `view-store`, `wallet-store` — all Zustand, no cross-store coupling beyond what's read in HUD components.

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
- [x] Wallet integration — real Phantom/Backpack/Solflare connection via `@solana/wallet-adapter-react`, live SOL/USDC/USDT balances
- [ ] USX/eUSX/SLX/stSLX on-chain balances — mint addresses not yet verified against an authoritative source (see Wallet architecture note); reported as untracked, not fabricated
- [ ] Protocol position detection (e.g. Kamino obligations) — not implemented; wallet store's `positions` is honestly empty rather than fabricated
- [ ] Transaction execution — real on-chain execution not implemented (simulation-only today, execution engine still uses `MockWalletAdapter`)
- [x] Final UX polish — global consistency pass done (typography, glass, spacing, HUD panel collision fix)

Known pre-existing, out-of-scope condition: `npm run lint` reports 48 errors / 9 warnings, all inherent to idiomatic React Three Fiber code (imperative mutation of Three.js objects inside `useFrame`, `Math.random` in `useMemo`, ref access during render) across locked systems (`atmosphere.tsx`, `star-field.tsx`, `route-trails.tsx`, `world-events.tsx`, `world-life.tsx`, `galaxy-camera.tsx`). Verified byte-identical against commit `d30884d` (before the first polish pass) via `git stash` — introduced zero new lint errors since.

Known unfixable-by-code condition: the visible line crossing the USX planet is a decorative orbital ring with an embedded warning-triangle icon **painted directly into `usx-planet.webp`'s pixels** — confirmed by opening the source file directly. Not a geometry/UV/material/rotation issue; no Three.js code change can remove baked-in pixel content. Fixing it requires either a new/edited source asset, or an explicit decision to add a code-level visual overlay to mask that specific region (not attempted — risks looking worse without image tooling to target it precisely).

Two real duplicate-React-key bugs were found and fixed during these passes (not pre-existing — introduced by upstream data/logic, not by this session's UI edits): (1) `Protocol.id` collisions in `build-planet-data.ts` when two opportunities shared a slug — fixed by appending the real opportunity id. (2) `OptimizedRoute.id` collisions in `optimizer.ts` when the DFS path-finder yielded the same node sequence via parallel edges — fixed by deduping candidates by id before ranking.

---

# Next Milestone

**Phase 14 — Transactions** (not started; explicitly deferred by the Phase 13 brief)

Swap / Deposit / Withdraw / Stake and a real Portfolio page. Will need to replace `MockWalletAdapter` in the (locked) Execution Engine with the real wallet-store's signing capability, and a verified mint address for USX/eUSX/SLX/stSLX before their balances can be tracked on-chain.

Everything from now on must be an extension of the existing architecture. Nothing should be rebuilt from scratch unless explicitly requested.
