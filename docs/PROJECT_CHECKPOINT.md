# PROJECT CHECKPOINT — SolScout

**Date:** 2026-06-25
**Commit:** c4f9acf
**Source files:** 25
**Total lines:** 2,281
**Assets:** 22 WebP files (8.6 MB)

---

## Current Phase

**Phase 2 — Interactive Galaxy**
**Milestone 5 — Planet Experience**
**Completion: 100%** (all 5 milestones delivered)

The project is at the boundary between "world building" and "product building." Everything built so far is the STAGE. No real data flows through it yet.

---

## Roadmap Progress

```
Phase 1 — World Foundation
✅ Complete (LOCKED)
  ✅ Full-screen galaxy canvas
  ✅ Cinematic camera with opening sequence
  ✅ Solstice Sun (turbulent, multi-halo, solar flares)
  ✅ Nebula panorama (equirectangular, intensity-controlled)
  ✅ Star field (5 layers, 3200+ particles, shooting stars)
  ✅ Orbital rings (4, asymmetric tilts)
  ✅ Atmosphere (sun haze, depth dust, lens particles, foreground wisps)
  ✅ World events (comets, dust waves)
  ✅ World life (macro breathing, deep pulse, nebula shift)

Phase 2 — Galaxy Objects
✅ Complete (LOCKED)
  ✅ 4 hero planets (USX, eUSX, SLX, stSLX) with unique identity
  ✅ 5 stations (Kamino, Orca, Raydium, Loopscale, Exponent)
  ✅ 4 PT moons (orbiting parents)
  ✅ Hand-crafted positions (viewport-derived)
  ✅ Cinematic composition (foreground/midground/background)

Phase 3 — HUD Foundation
✅ Complete (LOCKED)
  ✅ Diegetic HUD (no rectangles, no dashboard)
  ✅ Navigation bar (floating, minimal)
  ✅ Captain presence (full-body, floating, breathing)
  ✅ COMMS console (right edge, text-only signals)
  ✅ Telemetry strip (bottom edge, monospace)
  ✅ Visor layer (microscopic camera-attached drift)

Phase 4 — Interactive Galaxy
✅ Complete (LOCKED)
  ✅ Planet hover (108% scale, glow increase, spring motion)
  ✅ Hover label (name + "Explore →")
  ✅ Planet click → Focus Mode
  ✅ Cinematic camera fly-to (1.8s smootherstep)
  ✅ 4 handcrafted camera positions
  ✅ World reaction (focused brightens, others dim)
  ✅ Captain contextual speech (4 planet lines)
  ✅ ESC / click-empty exit with animation

Phase 5 — Planet Experience
✅ Complete
  ✅ Floating info layer beside focused planet
  ✅ Protocol orbits (glowing spheres, slow orbit)
  ✅ Protocol selection (click to highlight)
  ✅ Holographic data plate (deposit APY, borrow, TVL, risk, sparkline)
  ✅ Captain protocol-specific speech (8 lines)
  ✅ Layered ESC navigation (protocol → planet → galaxy)

Phase 6 — Real Data
⚪ Not Started
  - DefiLlama ingestion pipeline
  - Supabase persistence
  - API routes
  - TanStack Query integration
  - Replace static planet-data.ts with live data

Phase 7 — List View
⚪ Not Started
  - Table view of opportunities
  - Galaxy ↔ List toggle
  - Sorting, filtering
  - Responsive table

Phase 8 — Detail Panel
⚪ Not Started
  - Full opportunity inspection
  - APY history chart
  - Share functionality

Phase 9 — Motion Polish
⚪ Not Started
  - Entry sequence refinement
  - View transitions
  - Staggered reveals
  - Loading skeletons

Phase 10 — Responsive
⚪ Not Started
  - Tablet layout
  - Mobile layout
  - Bottom sheet
  - Touch gestures

Phase 11 — Deploy
⚪ Not Started
  - Supabase production
  - Vercel deployment
  - Cron configuration
  - SEO / OG images

Phase 12 — Post-Launch
⚪ Not Started
  - Wallet connection
  - Portfolio tracking
  - AI copilot
  - Push notifications
```

---

## What Has Been Built

### World (14 files, LOCKED)
- Solstice Sun with turbulent gradient surface, 7 halo layers, 4 point lights, solar flares, counter-rotating turbulence
- 5-layer star field (3200+ particles) with shooting stars
- Nebula panorama as equirectangular background at 45% intensity
- 4 orbital rings with asymmetric tilts
- Atmospheric layers: sun haze, depth dust, lens particles, foreground wisps
- World events: comets (30-90s), dust waves (45-105s)
- World life: macro breathing (77-112s cycles), deep pulse (120-300s)
- Cinematic camera: opening approach from (0,45,55), smootherstep, idle drift

### Interaction (3 files)
- Zustand store: `focused`, `hovered`, `selectedProtocol`
- Planet hover: spring-interpolated scale (108%), glow boost (130%), floating label
- Planet click → focus mode: camera fly-to handcrafted positions, 1.8s smootherstep
- World reaction: focused planet brightens (160%), others dim (50%)
- Protocol orbits: small glowing spheres orbiting focused planet
- Protocol selection: click → enlarge, others fade, holographic data plate
- Layered navigation: ESC protocol → planet → galaxy

### HUD (5 files)
- Diegetic visor layer with microscopic camera drift
- Nav bar (floating, two words)
- Captain (168px full-body, breathing, floating, contextual speech)
- COMMS console (right edge, text signals)
- Telemetry strip (bottom, monospace readings)

### Data (2 files)
- `planet-data.ts`: static data for 4 planets, 8 protocols
- `focus-cameras.ts`: handcrafted camera positions + captain lines

---

## Current Architecture

### Scene Graph
```
Canvas
  ├── ambientLight
  ├── WorldLife (primary sun light, macro breathing)
  ├── NebulaBackground (equirectangular texture)
  ├── StarField (5 layers + shooting stars + debris)
  ├── OrbitalRings (4 torus geometries)
  ├── SolsticeSun (core + turbulence + 7 halos + 3 lights)
  ├── HeroPlanets (4 × Billboard sprite + halos + interaction)
  ├── Stations (5 × Billboard sprite + beacon)
  ├── Moons (4 × orbiting sphere)
  ├── Atmosphere (sun haze + depth dust + lens particles + wisps)
  ├── WorldEvents (comet + dust wave)
  ├── PlanetExperience (info layer + protocol orbits + holograms)
  ├── GalaxyCamera (OrbitControls + fly-to + drift)
  └── EffectComposer → Bloom
```

### State Flow
```
useGalaxyStore
  ├── focused: PlanetName | null
  ├── hovered: PlanetName | null
  └── selectedProtocol: string | null

User hovers planet → setHovered → planet scales up, label appears
User clicks planet → setFocused → camera flies, world dims, info layer appears
User clicks protocol → setSelectedProtocol → hologram appears, captain reacts
User presses ESC → selectedProtocol ? clear protocol : focused ? clear focus
```

### Camera Flow
```
Opening (0-5.5s): (0,45,55) → smootherstep → (2,20,30)
Idle: subtle drift (incommensurate frequencies)
Focus: current position → smootherstep → handcrafted planet camera (1.8s)
Return: current position → smootherstep → default position (1.8s)
```

---

## File Audit

| File | Lines | Role | Finished | Locked |
|------|------:|------|:--------:|:------:|
| `positions.ts` | 126 | Hand-crafted galaxy composition | Yes | **LOCKED** |
| `solstice-sun.tsx` | 148 | Sun rendering + flares | Yes | LOCKED |
| `hero-planets.tsx` | 206 | Planet rendering + hover/click | Yes | — |
| `star-field.tsx` | 173 | Stars + shooting stars + debris | Yes | LOCKED |
| `atmosphere.tsx` | 181 | Atmospheric layers | Yes | LOCKED |
| `world-events.tsx` | 159 | Comets + dust waves | Yes | LOCKED |
| `world-life.tsx` | 86 | Macro breathing + deep pulse | Yes | LOCKED |
| `galaxy-scene.tsx` | 59 | Scene composition | Yes | — |
| `galaxy-camera.tsx` | 136 | Camera control + fly-to | Yes | — |
| `stations.tsx` | 87 | Station rendering + beacons | Yes | LOCKED |
| `moons.tsx` | 62 | Moon orbital motion | Yes | LOCKED |
| `orbital-rings.tsx` | 36 | Decorative orbit lines | Yes | LOCKED |
| `nebula-background.tsx` | 19 | Scene background | Yes | LOCKED |
| `planet-experience.tsx` | 247 | Info layer + protocol orbits + holograms | Yes | — |
| `planet-data.ts` | 84 | Static protocol data | **Temporary** | Replace in Phase 6 |
| `focus-cameras.ts` | 38 | Handcrafted camera positions + captain lines | Yes | LOCKED |
| `captain-presence.tsx` | 82 | Captain character + speech | Yes | — |
| `comms-console.tsx` | 74 | COMMS HUD | Yes | — |
| `nav-bar.tsx` | 39 | Navigation toggle | Yes | — |
| `telemetry-strip.tsx` | 65 | Bottom telemetry | Yes | — |
| `visor-layer.tsx` | 30 | HUD drift wrapper | Yes | LOCKED |
| `galaxy-store.ts` | 17 | Global state | Yes | — |
| `page.tsx` | 44 | Page composition | Yes | — |
| `layout.tsx` | 14 | HTML shell | Yes | — |
| `globals.css` | 57 | Theme + HUD typography | Yes | — |

---

## Technical Debt

### Minor
- `planet-data.ts` uses hardcoded values — must be replaced with real DefiLlama data (Phase 6)
- The `assets/` directory at project root duplicates `public/assets/` — should remove the root copy
- No `.env.example` file for Supabase credentials
- No error boundaries around the 3D scene

### Medium
- `hero-planets.tsx` at 206 lines does too much (rendering + interaction + hover + labels) — could be split into `planet-renderer.tsx` and `planet-interaction.tsx`
- `planet-experience.tsx` at 247 lines handles info layer + protocol orbits + holograms — could be 3 files
- The camera click-exit listener uses `e.target === gl.domElement` which may not reliably distinguish "empty space" clicks from clicks that propagated

### Major
- None. The architecture is clean for its size.

---

## Bugs

### Known
- None confirmed (build passes, all interactions compile correctly)

### Potential
- **Camera fly-to during opening phase:** If user clicks a planet during the 5.5s opening settle, the `phase` ref might conflict between 'opening' and 'flying'
- **Double-click still registered:** The old `dblclick` listener from Milestone 4 was removed from the camera, but `hero-planets.tsx` uses single-click for focus — verify no phantom double-click handlers remain
- **Protocol orbit radius:** Uses `planetSize * 5 + 2` which may vary per planet — some protocols might orbit too close or too far
- **Billboard sprite interaction:** At extreme camera angles, the Billboard plane might not receive raycasts correctly

### Performance Risks
- 3200+ star particles + debris + lens particles + atmospheric layers = significant per-frame computation on mobile
- EffectComposer Bloom runs a full-screen postprocessing pass every frame
- `useFrame` is called by ~15 components simultaneously

---

## Code Quality Review

| Dimension | Score | Rationale |
|-----------|:-----:|-----------|
| **Architecture** | 8/10 | Clean separation: galaxy/, hud/, stores/. Galaxy objects are self-contained. World is locked and cleanly isolated from interaction. |
| **Readability** | 7/10 | Most files are well-commented with clear naming. `hero-planets.tsx` and `planet-experience.tsx` are dense — too much in one file. |
| **Component Separation** | 7/10 | World components are well-separated (sun, stars, atmosphere, events are all independent). Planet interaction mixes rendering with state logic. |
| **State Management** | 9/10 | Zustand store is minimal (3 fields, 3 setters). No unnecessary state. Clear flow. |
| **Performance** | 6/10 | Many `useFrame` hooks running simultaneously. No performance profiling done. Bloom is expensive. No LOD or frustum optimization. |
| **Scalability** | 7/10 | Adding new planets/stations requires only position entries + textures. Adding new features requires new files, not modifying locked ones. The `planet-data.ts` abstraction will cleanly swap for real data. |
| **Maintainability** | 8/10 | Locked files are clearly marked. The positions.ts comments explain every decision. The milestone structure means each feature is atomic. |

---

## Current User Experience

1. **Landing:** Black screen. A point of light appears. Camera sweeps in from high and far over 5.5 seconds. The Solstice Sun materializes. Planets emerge from the glow. Stars appear in layers. The world approaches the viewer.

2. **Exploring:** Camera orbits smoothly around the sun (mouse drag). Zoom in/out (scroll). The camera has weight and momentum (damping 0.015). Idle drift keeps the scene alive. Solar flares pulse. Shooting stars cross. Comets appear every 30-90 seconds. The world breathes at macro scale (77-112 second cycles).

3. **Hovering:** Mouse over a planet → cursor changes to pointer. Planet scales to 108% with spring interpolation. Glow increases to 130%. A floating label appears: planet name + "Explore →". Mouse leaves → everything smoothly returns.

4. **Clicking:** Click a planet → Focus Mode. Camera flies to a handcrafted position over 1.8 seconds (smootherstep). The selected planet brightens (160% glow). Other planets dim (50%). Captain changes speech to a planet-specific sentence. A floating info layer appears beside the planet (name, description, TVL, APY, protocol count).

5. **Protocol orbits:** Small glowing spheres orbit the focused planet. Each shows protocol name + APY. Click one → it enlarges, others dim. A holographic data plate appears (deposit APY, borrow APY, TVL, risk, updated, sparkline).

6. **Captain interaction:** Captain Whiskers stands in the lower-left corner. His speech changes contextually: default → planet-specific → protocol-specific. He switches from full-body to speaking image when a planet is focused.

7. **Returning:** ESC or click empty space. If a protocol is selected, ESC clears the protocol first. ESC again returns to the galaxy. Camera flies back to default position with the same smootherstep animation.

8. **End state:** The user is back at the galaxy overview. The world continues breathing, pulsing, and surprising.

---

## Remaining Work

### Phase 6 — Real Data
**Goal:** Replace static `planet-data.ts` with live DefiLlama data.
**Dependencies:** None — architecture is ready, `planet-data.ts` is a clean abstraction.
**Expected files:** `src/lib/defillama.ts`, `src/lib/scoring.ts`, `src/lib/types.ts`, `src/lib/supabase.ts`, API routes
**Expected components:** None — data flows through existing `planet-data.ts` interface
**Risks:** DefiLlama API changes, Supabase setup delay
**Complexity:** Medium (proven pipeline from Yield Galaxy v1)

### Phase 7 — List View
**Goal:** Table view of all opportunities, Galaxy/List toggle.
**Dependencies:** Phase 6 (needs real data)
**Expected files:** `src/components/list/list-view.tsx`, `src/components/list/opportunity-table.tsx`
**Complexity:** Medium

### Phase 8 — Detail Panel
**Goal:** Full opportunity inspection with charts.
**Dependencies:** Phase 6
**Expected files:** `src/components/panels/detail-panel.tsx`, `src/components/panels/apy-chart.tsx`
**Complexity:** Medium

### Phase 9 — Motion Polish
**Goal:** Refined transitions, entry sequence, skeletons.
**Dependencies:** Phases 6-8 complete
**Complexity:** Low

### Phase 10 — Responsive
**Goal:** Tablet + mobile layouts.
**Dependencies:** All features complete
**Complexity:** Medium-High (3D on mobile is challenging)

### Phase 11 — Deploy
**Goal:** Production deployment.
**Dependencies:** All phases complete
**Complexity:** Low (proven from Yield Galaxy v1)

### Phase 12 — Post-Launch
**Goal:** Wallet, AI copilot, notifications.
**Dependencies:** Deployed product
**Complexity:** High

---

## Recommended Next Milestone

**Phase 6 — Real Data**

**Why it should come next:**
1. Everything built so far shows STATIC data from `planet-data.ts`. The product has zero connection to the blockchain. Until real data flows, this is a demo, not a product.
2. The data abstraction is clean — `PLANET_DATA` and `CAPTAIN_PROTOCOL_LINES` are simple records that can be replaced with computed values from DefiLlama without touching any rendering code.
3. The pipeline was already proven in Yield Galaxy v1 — DefiLlama fetcher, scoring engine, relevance filter, Supabase persistence. This is not new engineering, it's porting validated code.
4. Once real data flows, every subsequent milestone (list view, detail panel, sharing) becomes immediately functional.

**Implementation plan:**
1. Port `src/lib/defillama.ts` from Yield Galaxy v1 (fetcher + Solstice relevance filter)
2. Port `src/lib/scoring.ts` (risk grades + opportunity scores)
3. Port `src/lib/types.ts` (Opportunity, Source types)
4. Port `src/lib/galaxy-objects.ts` (aggregate pools into 4 hero planets)
5. Create API route `/api/yields` with live fallback
6. Create API route `/api/cron/ingest` for Supabase persistence
7. Create `src/hooks/use-yields.ts` (TanStack Query wrapper)
8. Replace `planet-data.ts` imports with computed data from `use-yields`
9. Verify: real APYs, real TVLs, real protocol counts appear in the galaxy

---

## Refactor Decision

**Should we refactor before continuing? NO.**

The architecture is clean:
- 25 files, 2281 lines — manageable size
- Clear separation: galaxy/ (world), hud/ (interface), stores/ (state)
- LOCKED files are clearly marked and untouched since locking
- State management is minimal (3 fields in Zustand)
- The data abstraction (`planet-data.ts`) is designed to be replaced

The only files that are slightly too large (`hero-planets.tsx` at 206 lines, `planet-experience.tsx` at 247 lines) are not blocking. They can be split AFTER Phase 6 if needed, but splitting them now would be premature optimization — the interaction patterns may change when real data flows.

**Continue building. Do not refactor.**

---

## Final Assessment

**PROJECT HEALTH: A**

Clean architecture, locked world, working interaction, clear data abstraction, proven data pipeline ready to port. No blocking issues. No major technical debt. The project is in excellent shape to transition from "demo" to "product."

**READY FOR NEXT MILESTONE: YES**

Phase 6 (Real Data) can begin immediately. The `planet-data.ts` abstraction was designed for exactly this replacement. No architectural changes needed.
