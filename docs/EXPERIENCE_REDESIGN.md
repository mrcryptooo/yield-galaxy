# Yield Galaxy — Experience-First Redesign

**Date:** 2026-06-23
**Principle:** No Man's Sky meets Bloomberg Terminal. Not a dashboard with a space skin.

---

## The Shift

The previous redesign added warm colors and side panels to the galaxy view. That made it a *prettier dashboard*. This redesign makes the galaxy the **only interface** — everything else exists inside the galaxy or as floating HUD elements that feel like spacecraft instrumentation.

### What changes

| Dashboard thinking | Exploration thinking |
|-------------------|---------------------|
| Side panels with stats | Stats embedded in celestial labels |
| "Best Routes" as a card list | Routes as glowing particle trails between bodies |
| Captain Whiskers in a sidebar | Captain Whiskers as a floating companion with mission briefings |
| Observatory as a bottom bar | Observatory insights appear as Captain narration |
| Filters as dropdowns | Discovery through navigation — zoom, click, explore |
| Table as primary data view | Galaxy as primary. Table is a reference overlay |

---

## Layout: Galaxy-First

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              THE GALAXY (100% viewport)                 │
│                                                         │
│   All planets, moons, stations visible                  │
│   Orbital rings, nebula, stars                          │
│   Labels with embedded metrics                          │
│   Route trails glowing between bodies                   │
│                                                         │
│                                                         │
│  ┌─────────────────┐                    ┌────────────┐  │
│  │ Captain Whiskers │                    │  Mission   │  │
│  │ floating avatar  │                    │  Briefing  │  │
│  │ + speech bubble  │                    │  card      │  │
│  └─────────────────┘                    └────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ HUD bar: [Search] · [Galaxy|List] · 16 opps · ✦  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key differences from the dashboard layout

1. **No side panels.** The galaxy fills 100% of the viewport. No 240px left panel, no 280px right panel.
2. **Captain Whiskers floats** over the galaxy in the bottom-left corner as a small avatar (64px) with a speech bubble. Not in a sidebar.
3. **Mission briefing** floats in the bottom-right as a single card — the current "best opportunity" presented as a destination to explore, not a metric to read.
4. **HUD bar** is a minimal transparent strip at the bottom with search, view toggle, and status. Not a full header.
5. **No top header bar.** The logo is a small watermark in the top-left corner. The galaxy IS the brand.

---

## Captain Whiskers: Narrator, Not Sidebar

Captain Whiskers appears as a **64px circular avatar** floating in the bottom-left of the galaxy view. On first load, a speech bubble appears with a mission briefing:

```
         ┌───────────────────────────────────────┐
         │ "Welcome to the Solstice Galaxy.       │
         │  USX on Kamino is producing 1.31%     │
         │  fuel yield — the safest destination   │
         │  right now. Shall we explore?"         │
         │                                        │
         │  [Explore USX ▸]  [Show me routes]     │
         └─────────────────────────────┬──────────┘
                                       │
                                    ┌──┴──┐
                                    │ 🐱  │
                                    └─────┘
```

### Captain behaviors

| Trigger | Narration |
|---------|-----------|
| First load | Mission briefing: best opportunity as a destination |
| Click a planet | "USX — $12.5M mass, 1.31% fuel yield. A reliable destination." |
| Click a moon | "PT-USX — fixed rate fuel. Locks in yield for 90 days." |
| Click a station | "Kamino Station — the largest refinery in the galaxy." |
| Idle 15 seconds | Subtle suggestion: "The SLX system has the highest fuel yield..." |
| Return after absence | "Welcome back. The galaxy shifted while you were away." |

Captain doesn't speak in a sidebar. Captain speaks in **floating speech bubbles** that appear near the avatar and auto-dismiss after 8 seconds (or on click).

---

## Opportunities as Destinations

Each celestial label is not just text — it's a **destination card** embedded in 3D space.

### Planet label (when NOT hovered)

```
◉ USX
$12.5M · 1.31%
```

Small, minimal. Symbol + TVL + APY. No clutter.

### Planet label (on hover)

```
┌──────────────────────┐
│ ◉ USX                │
│ Kamino · Lending      │
│                       │
│ Fuel Yield   1.31%    │
│ Mass         $12.5M   │
│ Score        74       │
│ Risk         A ●      │
│                       │
│ [Explore ▸]           │
└──────────────────────┘
```

Expands into a glass-morphism card with key metrics + an "Explore" button that triggers the detail view with camera fly-to.

### Moon label (on hover)

```
┌──────────────────────┐
│ ◎ PT-USX-16SEP26     │
│ Kamino · Fixed Rate   │
│                       │
│ Fixed Yield  4.85%    │
│ Liquidity    $12.7M   │
│ Maturity     Sep 16   │
│                       │
│ [Begin Mission ▸]     │
└──────────────────────┘
```

Moons use "Begin Mission" instead of "Explore" — they are time-limited opportunities.

---

## Routes as Journeys

The "Best Routes" are not cards in a sidebar. They are **particle trails** drawn on the galaxy map between bodies.

When the user hasn't selected anything, the top-rated route is drawn as a glowing trail:

```
    ◉ USX ─── ═══════ ──── ◎ PT-USX
              (particle trail)

    Route: USDC → USX → PT-USX (Loopscale)
    Fuel Yield: 21.4% · ETA: 90 days · Low Risk
```

The trail is a line with animated particles flowing along it. The route description appears as a small floating label near the midpoint of the trail.

Users can cycle through routes with arrow keys or by clicking "Next route" on the mission briefing card.

---

## Mission Briefing Card

The mission briefing replaces the "Best Routes" sidebar. It's a single floating card in the bottom-right:

```
┌──────────────────────────────┐
│  SUGGESTED DESTINATION       │
│                              │
│  ◉ PT-USX                   │
│  @ Loopscale Station         │
│                              │
│  Fuel Yield    21.4%         │
│  Risk          Low           │
│  ETA           90 Days       │
│                              │
│  [View Route ▸]  [Next ▸]   │
└──────────────────────────────┘
```

This card rotates through the top 3 routes. Clicking "View Route" flies the camera along the route trail. "Next" cycles to the next suggestion.

---

## HUD Bar (Bottom)

Minimal transparent bar at the very bottom of the screen:

```
┌─────────────────────────────────────────────────────────────┐
│  ✦ Yield Galaxy    [🔍 Search...]    [Galaxy|List]   16 ◉   │
└─────────────────────────────────────────────────────────────┘
```

- Logo as small mark, not a heading
- Search opens a command palette overlay (not a sidebar filter)
- Galaxy/List toggle
- Opportunity count with planet icon
- Transparent background, blur, warm border-top only

---

## Detail View: Immersive, Not a Drawer

When a user clicks "Explore" on a planet, the current right-side drawer is replaced by an **overlay panel** that appears over the galaxy with the camera zoomed into the selected body:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     (Galaxy zoomed in — selected planet fills 40%       │
│      of the view, other bodies dimmed)                  │
│                                                         │
│                              ┌────────────────────────┐ │
│                              │ ◉ USX — Kamino         │ │
│                              │                        │ │
│       ◉ USX (large,         │ Score 74 · Risk A      │ │
│          glowing)            │                        │ │
│                              │ Fuel Yield    1.31%    │ │
│                              │ ████████████████       │ │
│                              │ Base: 1.31%            │ │
│                              │                        │ │
│                              │ Mass    $12.5M         │ │
│                              │ IL Risk None           │ │
│                              │                        │ │
│  🐱 "USX on Kamino —        │ [APY Chart 90d]        │ │
│   the most reliable fuel     │                        │ │
│   source in the galaxy."     │ [Share] [Go to Kamino] │ │
│                              └────────────────────────┘ │
│                                                         │
│  [← Back to Galaxy]                          [ESC]      │
└─────────────────────────────────────────────────────────┘
```

The detail panel is translucent glass. The galaxy is still visible behind it, dimmed. The selected planet is centered and enlarged. Captain Whiskers comments in a speech bubble on the left.

---

## Implementation Plan (Updated)

### Phase 1: Color system + CSS foundation (1 hour)

Files: `globals.css`, `constants.ts`

- Update all colors to warm palette
- Background `#0A0E1A`
- Glass-morphism utility classes
- Remove all zinc/indigo references

### Phase 2: Galaxy-first page layout (2 hours)

Files: `page.tsx` (rewrite)

- Galaxy fills 100% viewport — no side panels
- Captain Whiskers avatar floating bottom-left
- Mission briefing card floating bottom-right
- HUD bar at bottom (transparent, minimal)
- Logo watermark top-left
- Remove header bar entirely
- List view becomes a full-screen overlay with transparency

### Phase 3: Captain Whiskers narrator (1.5 hours)

Files: `captain-avatar.tsx` (new), `captain-speech.tsx` (new), `mission-briefing.tsx` (new)

- 64px circular avatar with warm glow ring
- Speech bubble component with auto-dismiss
- Mission briefing card with route suggestion
- Consumes `insights.ts` for narration content
- Contextual narration on planet/moon/station click

### Phase 4: Galaxy scene — warm + alive (3 hours)

Files: `galaxy-scene.tsx`, `celestial-body.tsx`, `celestial-label.tsx`, `star-field.tsx`, `nebula-background.tsx` (new), `orbital-rings.tsx` (new)

- Nebula: radial gradient background quad
- Orbital rings: 3 concentric torus geometries, warm color, slow rotation
- Planet materials: warm emissive, atmospheric glow sprites
- Moon orbital motion: continuous orbit around parent
- Station pulse: scale oscillation
- Star twinkle: random opacity variation
- Lighting: warm point lights (#F6A04D, #F7B36C)
- Bloom: higher intensity, lower threshold

### Phase 5: Enhanced labels — destination cards (2 hours)

Files: `celestial-label.tsx` (rewrite)

- Minimal state: symbol + TVL + APY (always visible)
- Hover state: glass-morphism card with full metrics + "Explore" / "Begin Mission" CTA
- Auto-dismiss on mouse leave
- Warm border, warm text accents

### Phase 6: Detail panel — immersive overlay (2 hours)

Files: `detail-panel.tsx` (rewrite)

- Full-screen translucent overlay instead of right-side drawer
- Captain Whiskers speech bubble with contextual comment
- Glass-morphism card positioned right of center
- Galaxy visible behind (dimmed)
- Camera stays zoomed on selected body
- Back button returns to galaxy overview
- Warm color accents throughout

### Phase 7: Motion + responsive + polish (2 hours)

- Entry sequence: staggered fade-in
- Camera spring physics
- Label hover animations
- Mobile: galaxy fills screen, Captain + mission as bottom overlays
- Touch gestures
- Performance audit

### Total: ~14 hours across the 7 phases

### Files to Create (5)

| File | Purpose |
|------|---------|
| `src/components/captain/captain-avatar.tsx` | Floating cat avatar with glow |
| `src/components/captain/captain-speech.tsx` | Speech bubble with auto-dismiss |
| `src/components/captain/mission-briefing.tsx` | Route suggestion card |
| `src/components/galaxy/nebula-background.tsx` | Radial gradient background |
| `src/components/galaxy/orbital-rings.tsx` | Concentric orbit ring geometries |

### Files to Rewrite (8)

| File | Key change |
|------|------------|
| `src/app/globals.css` | Warm color system |
| `src/app/page.tsx` | Galaxy-first layout, no header, floating elements |
| `src/lib/constants.ts` | Warm CELESTIAL_COLORS |
| `src/components/galaxy/galaxy-scene.tsx` | Warm lighting, nebula, rings |
| `src/components/galaxy/celestial-body.tsx` | Warm materials, moon orbits |
| `src/components/galaxy/celestial-label.tsx` | Destination card on hover |
| `src/components/galaxy/star-field.tsx` | Twinkle effect |
| `src/components/ui/detail-panel.tsx` | Full-screen overlay with Captain comment |

### Files Unchanged

All data layer files, API routes, scoring, store logic.
