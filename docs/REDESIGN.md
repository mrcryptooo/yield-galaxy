# Yield Galaxy — Premium UX Redesign

**Date:** 2026-06-23
**Principle:** The Galaxy IS the application. Not a widget. Not a view toggle. The entire screen.

---

## 1. UX Audit of Current Implementation

### What exists today

The current app is a **two-mode toggle** — Galaxy view OR List view. The galaxy occupies the full canvas when selected, with minimal HUD overlays. The list view is a traditional data table. A flat header bar sits at the top with a text logo and toggle buttons. The detail panel is a right-side slide-in drawer.

### What's wrong

| Problem | Impact |
|---------|--------|
| **Galaxy and list are separate modes** | User must choose between spatial context and data density. The mockup shows them coexisting. |
| **Header is a flat bar** | No atmosphere. Looks like a SaaS dashboard nav. The mockup has an integrated top bar with search, wallet state, and character elements. |
| **No Captain Whiskers presence** | The cat doesn't exist in the galaxy view. The mockup shows a persistent avatar with speech bubble and "Chat with Captain" CTA. |
| **No sidebar panels** | The mockup shows left sidebar (Captain + Galaxy Overview + Market Status) and right sidebar (Best Routes + Alerts). Current has none. |
| **Observatory is hidden in list view** | The mockup shows Observatory as a bottom panel visible in galaxy view, always present. |
| **No orbital rings or paths** | Planets float in empty space. The mockup shows concentric orbital rings and orbital paths connecting bodies. |
| **Bodies are flat-colored spheres** | No texture, no atmospheric glow, no rings. The mockup shows textured planets with atmospheric halos, rings on some bodies, and volumetric glow. |
| **Labels are basic text** | White text on transparent background. The mockup shows glass-morphism cards with TVL, APY, and visual hierarchy. |
| **No navigation legend** | Users don't know what colors mean. The mockup shows a bottom legend: Planet=Asset, Moon=PT/YT, Station=Protocol. |
| **No depth layering** | Everything is at the same visual priority. The mockup uses depth: galaxy in center, glass panels on edges, overlays on top. |
| **Background is flat black** | No nebula, no gradient, no atmosphere. The mockup shows deep space with blue/purple nebula clouds and radial gradient. |
| **Colors are cold** | Current uses indigo/zinc (cold tech). The mockup uses warm Solar Orange #F6A04D, Apricot #F7B36C, Soft Peach #EAB0BE. |

---

## 2. Gap Analysis: Current vs Mockup

### Layout Architecture

```
CURRENT:                           MOCKUP:
┌──────────────────────┐           ┌─────────────────────────────────────┐
│ ▸ Header bar         │           │ ▸ Logo + Search + Wallet + Rank     │
├──────────────────────┤           ├────┬───────────────────────────┬────┤
│                      │           │Left│                           │Rght│
│   Galaxy (100%)      │           │Side│    Galaxy Map (60%)       │Side│
│   OR                 │           │bar │    (always visible)       │bar │
│   List (100%)        │           │    │                           │    │
│                      │           │Capt│                           │Best│
│                      │           │Over│                           │Rtes│
│                      │           │Mkt │                           │Alrt│
├──────────────────────┤           ├────┴───────────────────────────┴────┤
│ (empty)              │           │ Observatory + Trend + Captain's Log │
└──────────────────────┘           └─────────────────────────────────────┘
```

### Missing Components

| Component | In Mockup | In Current | Gap |
|-----------|:---------:|:----------:|-----|
| Captain Whiskers avatar + speech | ✅ | ❌ | Need avatar image, speech bubble, "Chat" CTA |
| Galaxy Overview panel (left) | ✅ | ❌ | Need stats card: opps, TVL, avg yield, planets, moons, stations |
| Market Status panel (live chart) | ✅ | ❌ | Need mini sparkline + 24h change |
| Best Routes panel (right) | ✅ | ❌ | Need top 3 route suggestions with yield, risk, ETA |
| Alerts from Captain (right) | ✅ | ❌ | Need alert cards with timestamps |
| Observatory bottom panel | ✅ | Partial | Current has it in list view only. Need it visible below galaxy |
| Fuel Yield Trend chart | ✅ | ❌ | Need 24h trend sparkline with total galaxy yield |
| Captain's Log | ✅ | ❌ | Need timestamped insight feed |
| Left nav sidebar | ✅ | ❌ | Galaxy Map, Opportunities, Missions, Passport, Observatory |
| Orbital rings/paths | ✅ | ❌ | Need concentric ring geometry in 3D scene |
| Planet textures | ✅ | ❌ | Need texture maps or procedural shaders |
| Atmospheric glow halos | ✅ | ❌ | Need sprite-based or shader-based atmospheric rings |
| Nebula background | ✅ | ❌ | Need gradient/cloud layer behind stars |
| Legend bar | ✅ | ❌ | Planet/Moon/Station legend with colored indicators |
| Search bar (top) | ✅ | ❌ | Current search is in list view only |
| Wallet/fuel balance | ✅ | ❌ | Deferred (no wallet integration) — show placeholder |

---

## 3. Color System Redesign

### Current (cold tech)

```
Background:  #050510 (near black)
Primary:     #6366f1 (indigo)
Text:        #f8fafc / #71717a (white / zinc)
Accents:     indigo, purple, emerald, red (Tailwind defaults)
```

### New (warm celestial)

```
Background:   #0A0E1A (deep space navy)
Primary:      #F6A04D (Solar Orange)
Secondary:    #F7B36C (Apricot)
Tertiary:     #EAB0BE (Soft Peach)
Accent:       #D3C7E7 (Lilac Mist)
Surface:      rgba(246, 160, 77, 0.05) (warm glass)
Border:       rgba(246, 160, 77, 0.12) (warm edge)
Text Primary: #F5F0EB (warm white)
Text Muted:   #8B8591 (warm gray)
```

### Planet Colors (updated to warm palette)

```
USX:    #F6A04D (Solar Orange) — the primary asset, gets primary color
eUSX:   #F7B36C (Apricot) — enhanced USX, warmer variant
SLX:    #D3C7E7 (Lilac Mist) — governance token, distinct
stSLX:  #EAB0BE (Soft Peach) — staked variant, softer
PT:     #F7B36C (Apricot, dimmer) — fixed rate, amber family
YT:     #EAB0BE (Soft Peach, brighter) — variable, peach family
Kamino:  #D3C7E7 (Lilac)
Orca:    #F5F0EB (Warm white)
Raydium: #F6A04D (Orange, dimmer)
Loopscale: #D3C7E7 (Lilac, dimmer)
```

---

## 4. Layout Architecture (New)

### Desktop (1280px+)

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo · Search · [Galaxy|List] · Status · Rank placeholder  │
│  Height: 56px · bg: #0A0E1A/90 backdrop-blur · border-bottom warm  │
├──────────┬────────────────────────────────────────┬─────────────────┤
│          │                                        │                 │
│  LEFT    │         GALAXY MAP                     │    RIGHT        │
│  PANEL   │         (main canvas)                  │    PANEL        │
│  240px   │         flex-1                         │    280px        │
│          │                                        │                 │
│  Captain │         Full 3D scene with             │  Best Routes    │
│  Avatar  │         orbital rings,                 │  (3 cards)      │
│  Speech  │         nebula background,             │                 │
│  ---     │         textured planets,              │  ---            │
│  Galaxy  │         glowing moons,                 │  Alerts from    │
│  Overview│         wireframe stations             │  Captain        │
│  ---     │                                        │  (3 cards)      │
│  Market  │         Legend bar at bottom            │                 │
│  Status  │                                        │                 │
│          │                                        │                 │
├──────────┴────────────────────────────────────────┴─────────────────┤
│  BOTTOM BAR: Observatory (4 insight cards) · Trend Chart · Log      │
│  Height: 140px · bg: #0A0E1A/80 · scrollable horizontal on mobile  │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────────┐
│ Header (compact)    │
├─────────────────────┤
│                     │
│   Galaxy Map        │
│   (full screen)     │
│                     │
│                     │
├─────────────────────┤ ← swipe-up bottom sheet
│ Observatory cards   │
│ (horizontal scroll) │
└─────────────────────┘

Bottom sheet (on swipe):
- Captain Whiskers greeting
- Galaxy overview stats
- Best routes
- Alerts
```

---

## 5. Motion Design Specification

### Entry Sequence (first load)

```
t=0.0s   Black screen
t=0.3s   Stars fade in (opacity 0→0.6, 2 seconds)
t=1.0s   Nebula gradient fades in (opacity 0→0.3)
t=1.5s   Camera slowly dollies back from [0,2,5] to [0,10,22]
t=2.0s   Planets fade in one by one (0.2s interval, scale 0→1 with spring)
t=2.5s   Orbital rings draw themselves (stroke-dashoffset animation)
t=3.0s   Labels fade in (opacity 0→1)
t=3.5s   Side panels slide in from edges (left from -240px, right from +280px)
t=4.0s   Bottom bar slides up from bottom
t=4.5s   Captain Whiskers avatar bounces in with speech bubble
```

### Continuous Animations

| Element | Animation | Speed |
|---------|-----------|-------|
| Planets | Y-axis rotation | 0.08 rad/s |
| Moons | Orbit parent planet (circular path) | 0.3 rad/s |
| Stations | Slow pulse (scale 0.95→1.05) | 4s cycle |
| Stars | Subtle twinkle (random opacity flutter) | Random per star |
| Orbital rings | Very slow rotation | 0.02 rad/s |
| Nebula | Subtle color shift | 20s cycle |
| Labels | Gentle float (y ±2px) | 3s cycle |
| Captain avatar | Idle animation (ear twitch, blink) | Random 5-10s |

### Interaction Animations

| Action | Animation |
|--------|-----------|
| Hover planet | Scale 1→1.15 (spring, 200ms). Glow intensifies. Label expands with extra info. |
| Click planet | Camera fly-to (800ms ease-out). Selected body pulses. Detail panel slides in from right (300ms). Side panels dim to 50% opacity. |
| Deselect | Camera returns (600ms). Panels restore opacity. Detail panel slides out. |
| Hover label | Glass card brightens. Border glow. |
| Panel hover | Subtle lift (translateY -2px). Border brightens. |
| Alert arrives | Card slides in from right with bounce. Orange glow pulse. Captain ear perks. |

### Transitions

| View Change | Animation |
|-------------|-----------|
| Galaxy → List | Galaxy fades (opacity 1→0, 300ms). List fades in (opacity 0→1, 200ms delay). |
| List → Galaxy | List fades out. Galaxy fades in with subtle camera push. |

---

## 6. Component Redesign Specification

### 6.1 Header (redesign)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🐱 Yield Galaxy    [🔍 Search...]    [Galaxy|List]    16 opps  ✦   │
│ EXPLORE·DISCOVER·YIELD                                             │
└─────────────────────────────────────────────────────────────────────┘

- Logo: cat silhouette icon + "Yield Galaxy" in warm white
- Tagline: "EXPLORE · DISCOVER · YIELD" in Solar Orange, letter-spaced
- Search: glass-morphism input, Solar Orange focus ring
- Toggle: warm-toned active state
- Status: warm muted text
```

### 6.2 Left Panel — Captain & Galaxy Overview

```
┌────────────────────────┐
│  [Captain Whiskers      │
│   avatar — 80x80px      │
│   warm glow behind]     │
│                         │
│  "The galaxy is full    │
│   of yield. Where       │
│   shall we explore?"    │
│                         │
│  [Chat with Captain]    │ ← Solar Orange outline button
├─────────────────────────┤
│  GALAXY OVERVIEW        │
│                         │
│  Opportunities    16    │
│  Total TVL     $74.4M   │
│  Avg Fuel Yield  3.28%  │
│  ◉ Planets        12   │
│  ◎ Moons           3   │
│  ▣ Stations        1   │
├─────────────────────────┤
│  MARKET STATUS  ● LIVE  │
│  Solstice Ecosystem     │
│  +2.4% (24h)           │
│  [mini sparkline]       │
└─────────────────────────┘

Glass-morphism cards:
  background: rgba(246, 160, 77, 0.03)
  border: 1px solid rgba(246, 160, 77, 0.1)
  backdrop-filter: blur(12px)
  border-radius: 12px
```

### 6.3 Right Panel — Routes & Alerts

```
┌─────────────────────────┐
│  BEST ROUTES    View All │
│                          │
│  1. Loop to PT-USX       │
│     USDC → USX → PT-USX │
│     Fuel Yield    21.4%  │
│     ETA  90 Days         │
│     Risk: Low            │
│  2. Conservative PT-eUSX │
│     ...                  │
│  3. Aggressive YT-SLX   │
│     ...                  │
├──────────────────────────┤
│  ALERTS FROM CAPTAIN     │
│                          │
│  ⚠ YT-USX Fuel Drop     │
│    Fuel yield dropped    │
│    12.3% in 6 hours      │
│    2m ago                │
│                          │
│  🔥 High Opportunity     │
│    PT-stSLX trending up  │
│    15m ago               │
└──────────────────────────┘
```

### 6.4 Bottom Bar — Observatory + Trend

```
┌────────────┬────────────┬─────────────┬────────────┬──────────┬──────────┐
│ 🐱 Top Opp │ 🔥 Highest │ ◎ Fixed Rate│ 📉 Compress│ Trend 24h│ Captain  │
│ USX Kamino │ SLX-SOL    │ PT-USX      │ 7 pools    │ [chart]  │ Log      │
│ Score 74   │ 443% APY   │ 4.85% Fixed │ < 0.5% APY │ 18.2%   │ [feed]   │
│ Risk A     │ $16K TVL   │ $12.7M Liq  │ Watch entry │ +2.4%   │          │
└────────────┴────────────┴─────────────┴────────────┴──────────┴──────────┘
```

### 6.5 Galaxy Scene (3D upgrades)

**Nebula background:** Radial gradient from center (#0A0E1A → #141832 → #0A0E1A) with subtle noise texture. Implemented as a full-screen quad behind stars.

**Orbital rings:** Three concentric torus geometries at radii 5, 7.5, 10. Very thin (tube radius 0.005), transparent (opacity 0.08), warm color (#F6A04D). Slow rotation.

**Planet atmospheres:** For each planet, add a slightly larger transparent sphere (scale 1.15) with a custom shader that creates an atmospheric glow falloff at the edges. Color matches planet but brighter.

**Moon orbits:** Moons continuously orbit their parent planet position using `useFrame` with `Math.sin/cos(time * speed)` offset.

**Station design:** Replace octahedron with a more complex wireframe structure — perhaps a torus knot or a custom geometry that looks like a space station. Slower pulse animation.

### 6.6 Detail Panel (redesign)

Current: Plain slide-in with zinc backgrounds.
New: Glass-morphism panel with warm borders, warm accent colors for APY/score, Captain Whiskers comment at the top of each panel.

```
┌─────────────────────────────────┐
│ 🐱 "USX on Kamino — a solid     │
│     low-risk fuel source."      │
├─────────────────────────────────┤
│ ◉ USX Lending — Kamino          │
│                                 │
│ [74] [A] [◉ USX] [Lending]      │
│                                 │
│ Total APY                       │
│ ████████████████ 1.31%          │
│                                 │
│ TVL: $12.5M  ·  IL Risk: None   │
│                                 │
│ [APY Chart with warm gradient]  │
│                                 │
│ [Share on 𝕏] [Copy] [Image]    │
│ [Go to Kamino ↗]               │
└─────────────────────────────────┘
```

---

## 7. Implementation Plan

### Phase 1: Color System + CSS Foundation (2 hours)

1. Update `globals.css` with new CSS custom properties (all warm colors)
2. Update `tailwind.config.ts` to extend theme with custom colors
3. Update `CELESTIAL_COLORS` in `constants.ts` to warm palette
4. Update all badge components (score, risk, strategy, celestial) to use warm colors
5. Update background from `#050510` to `#0A0E1A`

### Phase 2: Layout Architecture (3 hours)

1. Rewrite `page.tsx` with 3-column layout (left panel + galaxy + right panel)
2. Create `LeftPanel.tsx` (Captain avatar, Galaxy overview, Market status)
3. Create `RightPanel.tsx` (Best routes, Alerts)
4. Create `BottomBar.tsx` (Observatory cards + trend + log)
5. Galaxy is always visible — no more full-screen toggle. List view becomes a modal overlay.
6. Mobile: panels collapse into bottom sheet

### Phase 3: Galaxy Scene Upgrades (4 hours)

1. Add `nebula-background.tsx` — radial gradient quad behind stars
2. Add `orbital-rings.tsx` — 3 concentric torus rings with slow rotation
3. Add `atmosphere.tsx` — transparent glow sphere around each planet
4. Update `celestial-body.tsx` — warmer materials, atmospheric glow
5. Update `star-field.tsx` — add twinkle animation (random opacity per star via shader)
6. Add moon orbital motion in `useFrame`
7. Update lighting: warm point light (#F6A04D) instead of purple
8. Increase Bloom intensity, lower threshold for more glow
9. Update background color to `#0A0E1A`

### Phase 4: Captain Whiskers Visual (1 hour)

1. Create `CaptainAvatar.tsx` — SVG cat face with warm glow background ring
2. Create `CaptainSpeech.tsx` — speech bubble with insight from `insights.ts`
3. Integrate into left panel
4. Add idle animation (subtle scale pulse)

### Phase 5: Detail Panel Redesign (2 hours)

1. Glass-morphism background with warm border
2. Captain Whiskers one-liner at top (from `insights.ts` context)
3. Warm accent colors for APY, score, risk
4. Chart gradient from Solar Orange to transparent
5. Share buttons with warm styling

### Phase 6: Motion Polish (2 hours)

1. Framer Motion: panel slide-in/out animations
2. Framer Motion: card hover lift effects
3. Entry sequence: staggered fade-in of stars → planets → panels
4. Camera fly-to easing (spring physics)
5. Label hover expansion animation

### Phase 7: Responsive + Final Polish (2 hours)

1. Mobile bottom sheet for panels
2. Mobile: galaxy fills entire viewport, panels overlay on tap
3. Touch gesture tuning
4. Performance audit: target 60fps with all effects
5. Cross-browser verification

### Total Estimated Effort: ~16 hours (4 sessions)

### What Does NOT Change

- Database schema
- API routes
- Scoring engine
- DefiLlama ingestion
- Data types
- Zustand store logic
- Business logic

The redesign is purely presentational. The data layer is untouched.

---

## 8. Files to Create

| File | Purpose |
|------|---------|
| `src/components/layout/left-panel.tsx` | Captain + Overview + Market |
| `src/components/layout/right-panel.tsx` | Routes + Alerts |
| `src/components/layout/bottom-bar.tsx` | Observatory + Trend + Log |
| `src/components/captain/captain-avatar.tsx` | SVG cat avatar with glow |
| `src/components/captain/captain-speech.tsx` | Speech bubble |
| `src/components/galaxy/nebula-background.tsx` | Radial gradient background |
| `src/components/galaxy/orbital-rings.tsx` | Concentric orbit rings |
| `src/components/galaxy/atmosphere.tsx` | Planet atmospheric glow |

### Files to Rewrite

| File | Changes |
|------|---------|
| `src/app/page.tsx` | 3-column layout, always-visible galaxy |
| `src/app/globals.css` | Warm color system, glass-morphism utilities |
| `src/app/layout.tsx` | Updated fonts, warm theme class |
| `src/components/galaxy/galaxy-scene.tsx` | Add nebula, rings, warm lighting |
| `src/components/galaxy/celestial-body.tsx` | Atmospheres, warm materials, moon orbits |
| `src/components/galaxy/celestial-label.tsx` | Glass-morphism, warm colors |
| `src/components/galaxy/star-field.tsx` | Twinkle effect |
| `src/components/ui/detail-panel.tsx` | Glass-morphism, Captain comment, warm accents |
| `src/components/ui/observatory-lite.tsx` | Bottom bar card layout |
| `src/components/ui/score-badge.tsx` | Warm color variants |
| `src/components/ui/risk-badge.tsx` | Warm color variants |
| `src/lib/constants.ts` | Updated CELESTIAL_COLORS to warm palette |

### Files Unchanged

All `src/lib/` data files (types, scoring, defillama, celestial-map, supabase, format, insights, celestial-positions), all API routes, all store logic, database schema.
