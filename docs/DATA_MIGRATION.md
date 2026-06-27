# Real Data Architecture Audit & Migration Plan

**Date:** 2026-06-27
**Goal:** Replace static data with live DefiLlama pipeline. Zero visual regressions.
**Source reference:** Proven pipeline from `C:\Users\M\Desktop\Yield Galaxy\yield-galaxy\src\lib\`

---

## Current Mock Data

### Files containing fake/static data

| File | What's fake | Lines affected |
|------|-------------|:--------------:|
| `src/components/galaxy/planet-data.ts` | **ALL of it.** TVL, APY, protocol names, risk grades, descriptions, captain lines. 4 hardcoded planet records, 8 hardcoded protocol records. | 84 (entire file) |
| `src/components/hud/comms-console.tsx` | Route titles ("Dock at USX"), APY values ("1.33%", "4.85%", "405%"), timestamps ("2m"), signal labels. All hardcoded in JSX. | Lines 25-38 |
| `src/components/hud/telemetry-strip.tsx` | "USX · 77 · A", "SLX-SOL · 405%", "PT-USX · FIXED", "6 < 0.5%". All hardcoded. | Lines 18-24 |
| `src/components/hud/captain-presence.tsx` | "16 destinations detected" in default speech string. Hardcoded. | Line 19 |

### Components that consume fake data

```
planet-data.ts (PLANET_DATA, CAPTAIN_PROTOCOL_LINES)
  └── planet-experience.tsx
      ├── InfoLayer (reads: name, description, tvl, avgApy, protocolCount)
      ├── ProtocolOrbits (reads: protocols[])
      └── ProtocolNode (reads: id, name, apy, tvl, risk, type, depositApy, borrowApy, updated)
  └── captain-presence.tsx (reads: CAPTAIN_PROTOCOL_LINES)

comms-console.tsx — self-contained hardcoded values
telemetry-strip.tsx — self-contained hardcoded values
captain-presence.tsx — hardcoded "16 destinations"
```

### What is NOT fake (and stays untouched)

- Planet positions (`positions.ts`) — hand-crafted, LOCKED
- Planet rendering SOUL config (`hero-planets.tsx`) — LOCKED
- Camera positions (`focus-cameras.ts` FOCUS_CAMERAS) — LOCKED
- Captain planet lines (`focus-cameras.ts` CAPTAIN_LINES) — creative content, stays static
- Captain protocol lines (`planet-data.ts` CAPTAIN_PROTOCOL_LINES) — creative content, stays static
- All world rendering, atmosphere, events — LOCKED
- All HUD styling — LOCKED

---

## Real Data Sources

| Data Field | Source | Method | Notes |
|-----------|--------|--------|-------|
| Pool APY (base) | DefiLlama `/pools` | `pool.apyBase` | Hourly refresh |
| Pool APY (reward) | DefiLlama `/pools` | `pool.apyReward` | Hourly refresh |
| Pool APY (total) | DefiLlama `/pools` | `pool.apy` | = base + reward |
| Pool TVL | DefiLlama `/pools` | `pool.tvlUsd` | USD value |
| Pool symbol | DefiLlama `/pools` | `pool.symbol` | e.g. "USX", "SLX-SOL" |
| Protocol name | DefiLlama `/pools` | `pool.project` → `SOURCE_DISPLAY_NAMES` lookup | e.g. "kamino-lend" → "Kamino" |
| APY history (sparkline) | DefiLlama `/chart/{poolId}` | Proxied via `/api/yields/[id]/history` | 30-day history |
| Chain | DefiLlama `/pools` | `pool.chain` | Always "Solana" |
| Risk grade | **Calculated** | `computeRiskGrade(project, tvl, strategy)` | 3-factor: protocol risk + TVL tier + strategy risk |
| Opportunity score | **Calculated** | `computeScores(batch)` | 45% yield percentile + 25% TVL log + 30% risk bonus |
| Celestial mapping | **Calculated** | `mapPool(pool)` | Determines planet/moon/station + strategy + IL risk |
| Strategy type | **Calculated** | From `mapPool()` → `inferSingleStrategy()` or LP detection | lending/lp/staking/vault/pt/yt |
| IL risk | **Calculated** | From `mapPool()` | none/low/medium/high |
| Planet description | Static creative content | `CAPTAIN_LINES` in `focus-cameras.ts` | Never changes |
| Captain protocol speech | Static creative content | `CAPTAIN_PROTOCOL_LINES` in `planet-data.ts` | Never changes |
| Destination count | **Derived** | `opportunities.length` | Computed from API response |
| Updated timestamp | **Derived** | `timeAgo(opportunity.updated_at)` | From ingestion time |

---

## Migration Strategy

### The Interface Contract

The UI reads two TypeScript interfaces from `planet-data.ts`:

```typescript
interface Protocol {
  id: string;
  name: string;       // "Kamino"
  apy: number;        // 1.33
  tvl: string;        // "$12.4M" (pre-formatted)
  risk: string;       // "A"
  type: string;       // "Lending"
  depositApy: number; // 1.33
  borrowApy: number;  // 3.21
  updated: string;    // "2m ago"
}

interface PlanetInfo {
  name: string;         // "USX"
  description: string;  // Creative text
  tvl: string;          // "$14.2M" (pre-formatted)
  avgApy: string;       // "1.33%" (pre-formatted)
  protocolCount: number; // 3
  protocols: Protocol[];
}
```

These interfaces are the ONLY contract between data and rendering. The adapter must produce `Record<string, PlanetInfo>` from `Opportunity[]`.

### Migration Architecture

```
CURRENT (static):
  planet-data.ts  ──→  PLANET_DATA (hardcoded Record<string, PlanetInfo>)
       │
       ▼
  planet-experience.tsx (imports PLANET_DATA directly)

AFTER (live):
  DefiLlama API  (16K pools)
       │
       ▼
  defillama.ts   (filter → ~16 Solstice pools)
       │
       ▼
  /api/yields    (score + normalize → Opportunity[])
       │
       ▼
  use-yields.ts  (React Query hook, 5min stale time)
       │
       ▼
  build-planet-data.ts  (Opportunity[] → Record<string, PlanetInfo>)
       │
       ▼
  planet-experience.tsx (receives PlanetInfo via props — same interface)
```

The adapter (`build-planet-data.ts`) is the single bridge. It:
1. Groups `Opportunity[]` by `celestial_body` (USX, eUSX, SLX, stSLX)
2. Aggregates: sum TVL, compute weighted avg APY, collect protocols
3. Formats numbers using `formatTvl()` and `formatApy()` to match the string format the UI expects
4. Maps each opportunity to the `Protocol` interface
5. Returns `Record<string, PlanetInfo>` — identical shape to current static data

### Fallback Chain

```
1. Try: Supabase (if configured and populated)
2. Fallback: Live DefiLlama fetch (cached 60s in-memory)
3. Fallback: Static PLANET_DATA from planet-data.ts
```

The UI always has data. There is never a blank state.

---

## Data Flow (Complete Runtime)

```
Page loads
  │
  ├── Galaxy scene renders with default static data (instant)
  │
  ▼
useYields() hook fires (React Query, staleTime: 5min)
  │
  ▼
GET /api/yields
  │
  ├── Try: supabase.from('opportunities').select('*, source:sources(*)').eq('is_active', true)
  │   └── If empty or error ↓
  ├── Fallback: fetchSolsticePools() → filter Solana + SOLSTICE_PROJECTS + isSolsticeRelevant()
  │   └── Returns ~16 DefiLlamaPool[]
  │   └── mapPool() → celestial identity (planet/moon/station, strategy, IL)
  │   └── computeRiskGrade() → A/B/C/D/F
  │   └── computeScores() → 0-100 percentile-based
  │   └── Returns Opportunity[]
  │
  ▼
Client receives: { data: Opportunity[], meta: { count, updated_at } }
  │
  ▼
buildPlanetData(opportunities) — THE ADAPTER
  │
  ├── Filter: celestial_type === 'planet'
  ├── Group by: celestial_body (USX, eUSX, SLX, stSLX)
  ├── Per planet:
  │     ├── tvl = formatTvl(sum of all pool TVLs)
  │     ├── avgApy = formatApy(weighted average or best APY)
  │     ├── protocolCount = unique protocols
  │     ├── description = PLANET_DESCRIPTIONS[body] (stays static creative content)
  │     └── protocols = map each pool → Protocol {
  │           id: opportunity.id
  │           name: SOURCE_DISPLAY_NAMES[source_id]
  │           apy: total_apy
  │           tvl: formatTvl(tvl)
  │           risk: risk_grade
  │           type: capitalize(strategy)
  │           depositApy: base_apy
  │           borrowApy: reward_apy (or 0 if not lending)
  │           updated: timeAgo(updated_at)
  │         }
  │
  ▼
Returns: Record<string, PlanetInfo>   ← SAME INTERFACE AS BEFORE
  │
  ├──→ PlanetExperience (via props from page.tsx → galaxy-scene → planet-experience)
  │     └── InfoLayer: reads name, description, tvl, avgApy, protocolCount
  │     └── ProtocolOrbits: reads protocols[]
  │     └── ProtocolNode: reads apy, tvl, risk, depositApy, borrowApy, updated
  │     └── HolographicDataPlate: reads all Protocol fields
  │
  ├──→ CommsConsole (via props): top 3 routes with real APYs
  ├──→ TelemetryStrip (via props): real readings
  ├──→ CaptainPresence: real count in default speech
  └──→ NavBar: stays unchanged (no data dependency after removing "16")

Galaxy rendering, camera, interactions, store ← UNTOUCHED
```

---

## Files To Change

### NEW files to create (port from v1)

| File | Purpose | Source in v1 | Risk | Est. lines |
|------|---------|-------------|------|:----------:|
| `src/lib/types.ts` | Opportunity, Source, DefiLlamaPool, enums | `v1/src/lib/types.ts` (114 lines) | None — pure types | ~80 |
| `src/lib/constants.ts` | Project names, risk tables, display names | `v1/src/lib/constants.ts` (77 lines) | None — pure config | ~50 |
| `src/lib/format.ts` | formatTvl, formatApy, timeAgo | `v1/src/lib/format.ts` (32 lines) | None — pure functions | ~32 |
| `src/lib/defillama.ts` | Fetch + Solstice relevance filter | `v1/src/lib/defillama.ts` (89 lines) | Low — proven, no auth | ~89 |
| `src/lib/celestial-map.ts` | Pool → planet/moon/station mapping | `v1/src/lib/celestial-map.ts` (95 lines) | Low — proven logic | ~95 |
| `src/lib/scoring.ts` | Risk grades + opportunity scores | `v1/src/lib/scoring.ts` (82 lines) | Low — pure math | ~82 |
| `src/lib/supabase.ts` | Supabase client (anon + admin) | `v1/src/lib/supabase.ts` (12 lines) | None | ~12 |
| `src/lib/build-planet-data.ts` | **THE ADAPTER** — Opportunity[] → PlanetInfo records | **NEW** | Medium — must match interface | ~80 |
| `src/app/api/yields/route.ts` | GET: Supabase → live fallback → response | `v1/src/app/api/yields/route.ts` (195 lines) | Low — proven | ~195 |
| `src/app/api/yields/[id]/history/route.ts` | Proxy DefiLlama chart data | `v1/src/app/api/yields/[id]/history/route.ts` (35 lines) | None | ~35 |
| `src/app/api/cron/ingest/route.ts` | POST: fetch → score → upsert → snapshot | `v1/src/app/api/cron/ingest/route.ts` (151 lines) | Low — proven | ~151 |
| `src/hooks/use-yields.ts` | React Query wrapper | **NEW** | Low | ~30 |
| `.env.example` | Credential template | — | None | ~6 |
| `vercel.json` | Cron schedule | — | None | ~8 |

**Subtotal:** 14 new files, ~945 lines

### MODIFIED files (minimal, surgical changes only)

| File | What changes | Lines changed | Risk |
|------|-------------|:-------------:|------|
| `planet-data.ts` | Keep interfaces + CAPTAIN_PROTOCOL_LINES. PLANET_DATA becomes `FALLBACK_PLANET_DATA`. Add `PLANET_DESCRIPTIONS` constant. | ~8 | Very low — rename only |
| `planet-experience.tsx` | Accept `planetData` prop instead of importing `PLANET_DATA`. Change line 8 (import) and line 18 (usage). | ~4 | Very low |
| `galaxy-scene.tsx` | Accept `planetData` prop, pass to `<PlanetExperience>`. | ~4 | Very low |
| `page.tsx` | Add `QueryClientProvider`, `useYields()`, `buildPlanetData()`, pass data down. Add `'use client'` if not present. | ~25 | Low |
| `comms-console.tsx` | Accept `signals` prop with real route data. Replace 3 hardcoded `<Signal>` with mapped data. | ~15 | Low |
| `telemetry-strip.tsx` | Accept `readings` prop. Replace 4 hardcoded `<Reading>` with mapped data. | ~10 | Low |
| `captain-presence.tsx` | Replace `"16 destinations"` with `{count} destinations`. Accept `count` prop or read from hook. | ~3 | Very low |

**Subtotal:** 7 files, ~69 lines changed

### Total: 14 new files (~945 lines) + 7 modified files (~69 lines changed)

---

## Files That MUST NOT Change

**Every rendering and world file is LOCKED. These files will not be opened:**

| File | Lines | Reason |
|------|:-----:|--------|
| `positions.ts` | 126 | Hand-crafted galaxy composition |
| `solstice-sun.tsx` | 148 | Approved sun rendering |
| `star-field.tsx` | 173 | Approved star layers (3200+ particles) |
| `atmosphere.tsx` | 181 | Approved atmospheric layers |
| `world-events.tsx` | 159 | Approved comets/dust waves |
| `world-life.tsx` | 86 | Approved macro breathing/deep pulse |
| `nebula-background.tsx` | 19 | Approved nebula |
| `orbital-rings.tsx` | 36 | Approved orbit rings |
| `moons.tsx` | 62 | Approved moon orbits |
| `stations.tsx` | 87 | Approved station rendering |
| `focus-cameras.ts` | 38 | Handcrafted camera positions + captain lines |
| `visor-layer.tsx` | 30 | HUD drift effect |
| `hero-planets.tsx` | 206 | Planet rendering + interaction |
| `galaxy-camera.tsx` | 136 | Camera behavior |
| `globals.css` | 57 | Theme |
| `galaxy-store.ts` | 17 | Interaction state |
| `layout.tsx` | 14 | HTML shell |

**17 LOCKED files. None will be opened, modified, or touched.**

---

## Final Migration Plan — Small Milestones

### Milestone 6.1 — Pure Data Layer (no UI changes)

**Create:** `src/lib/types.ts`, `src/lib/constants.ts`, `src/lib/format.ts`, `src/lib/celestial-map.ts`, `src/lib/scoring.ts`, `src/lib/defillama.ts`, `src/lib/supabase.ts`

**Port from:** `C:\Users\M\Desktop\Yield Galaxy\yield-galaxy\src\lib\` — proven, battle-tested code.

**Changes to existing files:** None. Zero.

**Verification:**
- `npx tsc --noEmit` passes
- `npx next build` passes
- Galaxy renders identically (none of these files are imported by any component yet)

**What this proves:** The data layer compiles and has no type conflicts with the existing codebase.

---

### Milestone 6.2 — API Routes (no UI changes)

**Create:** `src/app/api/yields/route.ts`, `src/app/api/yields/[id]/history/route.ts`, `src/app/api/cron/ingest/route.ts`, `.env.example`, `vercel.json`

**Port from:** `v1/src/app/api/` — proven routes.

**Changes to existing files:** None.

**Verification:**
- `npx tsc --noEmit` passes
- `npx next build` passes
- `curl http://localhost:3001/api/yields` returns real JSON with ~16 scored Solstice opportunities
- Galaxy renders identically (routes are not called by any component yet)

**What this proves:** The full fetch → filter → score → format pipeline works end-to-end. Real data exists.

---

### Milestone 6.3 — The Adapter + Hook (no UI changes)

**Create:** `src/lib/build-planet-data.ts`, `src/hooks/use-yields.ts`

**Changes to existing files:** `planet-data.ts` — rename `PLANET_DATA` to `FALLBACK_PLANET_DATA`, export `PLANET_DESCRIPTIONS` constant (the creative descriptions). Keep interfaces and `CAPTAIN_PROTOCOL_LINES` unchanged.

**Verification:**
- `npx tsc --noEmit` passes
- `npx next build` passes
- Galaxy renders identically (the adapter and hook exist but nothing calls them yet)
- The `FALLBACK_PLANET_DATA` rename doesn't break planet-experience.tsx because we update the import at the same time

**What this proves:** The bridge between raw data and UI interface compiles. The interface contract is satisfied.

---

### Milestone 6.4 — The Swap (the only milestone that changes UI behavior)

**Changes to existing files:**
- `page.tsx` — wrap in `QueryClientProvider`, call `useYields()`, run through `buildPlanetData()`, pass as props
- `galaxy-scene.tsx` — accept `planetData` prop, pass to `<PlanetExperience>`
- `planet-experience.tsx` — accept `planetData` prop instead of importing `PLANET_DATA`
- `comms-console.tsx` — accept `signals` prop
- `telemetry-strip.tsx` — accept `readings` prop  
- `captain-presence.tsx` — accept `count` prop for default speech

**Verification:**
- `npx tsc --noEmit` passes
- `npx next build` passes
- Galaxy shows REAL APYs, REAL TVLs, REAL risk grades
- COMMS shows real routes with real yields
- Telemetry shows real readings
- Captain says real destination count
- No visual regressions: same fonts, same colors, same positions, same animations
- ESC navigation still works: protocol → planet → galaxy
- Protocol selection still shows holographic data plate with real data
- Fallback: disconnect internet → galaxy shows static FALLBACK_PLANET_DATA

---

## Can this migration be completed with ZERO visual regressions?

**YES.** Here's why with high confidence:

1. **The interface contract is preserved exactly.** `PlanetInfo` and `Protocol` interfaces don't change. The adapter produces the same shape. The UI receives the same types.

2. **No rendering file is touched.** All 17 LOCKED files remain unopened. Planets, sun, stars, atmosphere, camera, interactions — pixel-identical.

3. **Pre-formatted strings match.** The adapter uses the same `formatTvl()` and `formatApy()` functions from v1, which produce the same "$14.2M" and "1.33%" format the static data currently uses.

4. **Triple fallback guarantees data.** Supabase → live DefiLlama → static fallback. The UI always has a `Record<string, PlanetInfo>` to render. There is never a blank state, a loading spinner in the galaxy, or a missing planet.

5. **Only the NUMBERS change.** "$14.2M" might become "$14.1M". "1.33%" might become "1.35%". The fonts, colors, glow, animations, orbits, camera positions — all identical.

The only perceptible difference: **the numbers are real.**
