# Yield Galaxy — Visual Blueprint

**Role:** Product Designer + Creative Director
**Date:** 2026-06-25
**Status:** Design phase — no code until approved

---

## 1. Desktop Layout (1440 × 900)

### Grid System

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          HEADER — 48px                                   │
│  Fixed top. Always visible. Never scrolls.                               │
├─────────────┬────────────────────────────────────────────┬───────────────┤
│             │                                            │               │
│   LEFT      │              GALAXY                        │    RIGHT      │
│   PANEL     │              VIEWPORT                      │    PANEL      │
│             │                                            │               │
│   200px     │              flex-1                        │    220px      │
│   fixed     │              (~1020px on 1440)             │    fixed      │
│             │                                            │               │
│             │              This is the hero.             │               │
│             │              This is the product.          │               │
│             │              70% of visual attention.      │               │
│             │                                            │               │
│             │                                            │               │
│             │                                            │               │
├─────────────┴────────────────────────────────────────────┴───────────────┤
│                        OBSERVATORY — 52px                                │
│  Fixed bottom. Compact intelligence strip.                               │
└──────────────────────────────────────────────────────────────────────────┘
```

### Why these dimensions

- **Header 48px:** Enough for logo + nav + status. Not a pixel more. The galaxy starts immediately below.
- **Left 200px:** Captain Whiskers needs 80px portrait + text. Galaxy overview needs 2-column stats. Destination card needs button. 200px fits this with breathing room. 140px (previous) felt cramped — text wrapped unnaturally.
- **Right 220px:** Routes need title + path + yield + ETA + risk. At 140px these wrapped onto 4-5 lines and became unreadable. 220px allows 2-line cards.
- **Galaxy flex-1 (~1020px):** This is 70.8% of 1440px. With the 48px header and 52px observatory, the galaxy viewport is 1020 × 800 = **56.7% of total screen area**. Combined with the darkened nebula bleeding under the semi-transparent panels, the perceived galaxy coverage is ~75%.
- **Observatory 52px:** Enough for a title row + one row of data pills. Not a pixel more.

### Safe margins

- All panel content: 16px padding
- Cards within panels: 12px padding
- Card spacing: 8px gap
- Label text: never closer than 4px to any edge

---

## 2. Galaxy Composition

### The scene is NOT a solar system simulator. It is a cinematic space-opera navigation interface.

```
CAMERA VIEW (top-down 3/4 angle, looking slightly down)

                            ◉ eUSX
                          (violet, ethereal)
                              ◎ PT-eUSX


        ◉ USX                                          ▣ Kamino
     (gold, hero,                                       Station
      LARGEST)
          ◎ PT-USX          ✦ SOLSTICE
                              SUN

     ▣ Orca                                         ◉ stSLX
      Station                                    (rose, ancient)
                                                    ◎ PT-stSLX


         ▣ Loopscale                    ◉ SLX
           Station                   (teal, energetic)
                                       ◎ PT-SLX

                      ▣ Exponent        ▣ Raydium
                       Station            Station
```

### Why this composition

**USX is upper-left.** Western eyes enter a page top-left. USX is the primary asset ($12M+ TVL), the largest planet. It gets prime visual real estate.

**The Sun is center, slightly left.** Not geometric center — visual center. The eye finds it second via its glow, after USX draws initial attention. The asymmetry creates tension and interest.

**eUSX floats above-right.** It's the "enhanced" variant — elevated, aspirational. Creating a diagonal with SLX (lower-right) — the composition's backbone.

**SLX is lower-right.** The energetic counterpoint. The eye follows a Z-pattern: USX → eUSX → Sun → SLX.

**stSLX is right-center.** The ancient, rare planet. Isolated in its own territory. Never competing.

**Stations scatter asymmetrically at the edges.** They are destinations between worlds, not visual anchors. Smaller than planets. Never competing.

**Moons orbit outward from the sun.** Each moon is placed on the far side of its parent (relative to the sun), making the parent-child relationship obvious.

### Camera

```
Position: (0, 22, 32)
Target:   (0, -1, 0)
FOV:      52°
```

**Why:** At this angle and distance, the sun (radius 3.5) fills ~14% of viewport width. USX (sprite 6.5x) fills ~10%. The full system (r=14) fits within the FOV. The slight downward look creates cinematic depth without making planets appear flat.

### Orbital rings

4 rings, each with unique tilt. NOT one per planet — they suggest structure without enforcing it. Tube radius 0.003 (hair-thin). Opacity 0.02-0.035 (barely visible). They exist to create depth, not to diagram orbits.

---

## 3. UI Hierarchy

### What belongs WHERE and WHY

**HEADER (48px, fixed top)**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Captain 24px]  Yield Galaxy           [Galaxy] [List]        16 destinations│
└──────────────────────────────────────────────────────────────────────────┘
```

Contents:
- Captain avatar (24px) — brand identity, always present
- "Yield Galaxy" — product name, no tagline
- Galaxy / List toggle — persistent navigation, never hidden
- Destination count — "16 destinations" — minimal status

**Why:** The header is infrastructure. It should be noticed once and then forgotten. No search bar (users explore, not search). No status pills (no wallet yet). No CTAs (no "LAUNCH MISSION" without functionality). Every element earns its place by being functional.

---

**LEFT PANEL (200px)**

```
┌────────────────────┐
│ [Captain 80px]     │
│ CAPTAIN WHISKERS   │
│ Cosmic Cartographer│
│                    │
│ "Exploring Solstice│
│  Galaxy. 16 dests  │
│  detected."        │
│                    │
├────────────────────┤
│ OVERVIEW           │
│                    │
│ TVL        $74.2M  │
│ APY (Avg)  26.3%   │
│                    │
│ Planets  12        │
│ Moons     3        │
│ Stations  1        │
├────────────────────┤
│ DESTINATION        │
│                    │
│ [Captain 32px] USX │
│ Kamino   1.33%     │
│ Risk A · Score 77  │
│                    │
│ [VIEW ROUTE]       │
└────────────────────┘
```

**Why Captain is here:** The mascot IS the product identity. 80px portrait is large enough to show expression (speaking, idle, alert) but doesn't compete with the galaxy. The speech text creates a personal, narrative feeling — "exploring" not "displaying."

**Why Overview is here:** Users need context before exploring. TVL and APY answer "is this ecosystem worth exploring?" Planets/Moons/Stations answer "what's out there?"

**Why Destination is here:** This is the navigator's recommendation. Captain suggests where to go. It bridges the panel (data) with the galaxy (experience). VIEW ROUTE is the primary CTA — it selects the destination in the galaxy and opens the detail panel.

---

**RIGHT PANEL (220px)**

```
┌──────────────────────┐
│ BEST ROUTES          │
│                      │
│ 1. Dock at USX       │
│    USDC → USX →      │
│    Deposit at Kamino  │
│    Yield 1.33%       │
│    ETA Flexible      │
│    Risk: Very Low    │
│                      │
│ 2. Acquire PT-USX    │
│    USDC → USX →      │
│    PT-USX → Hold     │
│    Yield 4.85%       │
│    ETA Sep 2026      │
│    Risk: Low         │
│                      │
│ 3. Harvest SLX       │
│    USDC → SLX →      │
│    Pair SOL → Orca   │
│    Yield 405%        │
│    ETA Flexible      │
│    Risk: High        │
├──────────────────────┤
│ ALERTS               │
│                      │
│ [Captain] Highest    │
│ Fuel Yield           │
│ SLX-SOL 405%  2m ago │
│                      │
│ [Captain] Yield      │
│ Compression          │
│ 6 pools < 0.5% 2m   │
│                      │
│ [Captain] Route      │
│ Optimization         │
│ Better route   1h    │
└──────────────────────┘
```

**Why Routes are on the right:** Routes are the primary intelligence output. They answer "what should I do?" This is the most valuable content after the galaxy itself. Right panel = action panel. Left panel = context panel.

**Why Alerts are below Routes:** Alerts are reactive (something changed). Routes are proactive (what to do). Proactive > reactive in visual hierarchy.

**Why 220px:** Route cards need 3 lines of path text (USDC → USX → Deposit at Kamino). At 140px this wraps to 5-6 lines and becomes unreadable. At 220px it fits cleanly in 2-3 lines.

---

**OBSERVATORY (52px, fixed bottom)**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ OBSERVATORY  │ Top Opp: USX │ Highest: SLX-SOL │ Fixed: PT-USX │ 6<0.5%│
└──────────────────────────────────────────────────────────────────────────┘
```

**Why 52px:** One row of text pills. No cards. No borders. No visual weight. The observatory should feel like a news ticker, not a dashboard section. It answers "what's notable right now?" without competing with the galaxy.

---

**FLOATING ELEMENTS (on the galaxy canvas)**

- Planet/station labels — float near each object, managed by drei `<Html>`
- "Scroll to zoom · Drag to rotate" hint — bottom-right corner, 8px, 30% opacity
- No other overlays on the galaxy canvas

**Why no overlays:** The galaxy IS the product. Overlaying it with UI defeats the purpose. Every panel sits OUTSIDE the canvas, not on top of it.

---

## 4. User Journey — First 5 Seconds

```
t=0.0s  Page loads. Dark background (#0A0E1A). Header appears instantly.
        Side panels are invisible (opacity 0).
        Galaxy canvas is loading.

t=0.3s  Nebula fades in (opacity 0 → 0.3, 600ms ease).
        Stars begin appearing (5 layers, staggered 100ms each).

t=0.8s  Solstice Sun fades in at center. Begins glowing immediately.
        Its light illuminates nothing yet — planets haven't appeared.

t=1.2s  USX planet fades in (upper-left). Then eUSX (200ms later).
        Then SLX (200ms later). Then stSLX (200ms later).
        Each planet arrives with its own self-light.

t=2.0s  Stations fade in simultaneously (all 5, subtle).
        Moons begin their orbital motion.
        Orbital rings draw themselves.

t=2.5s  Left panel slides in from left (200px, 400ms ease-out).
        Right panel slides in from right (220px, 400ms ease-out).
        Bottom observatory fades in.

t=3.0s  Captain Whiskers speech appears:
        "Exploring Solstice Galaxy. 16 destinations detected."

t=3.5s  Camera begins subtle idle drift.
        The scene is alive. Everything breathes.
```

**Why this sequence:** The galaxy enters first because IT IS THE PRODUCT. Panels appear AFTER the user has already been captivated by the space. If panels appeared first, the user would read text. We want them to feel wonder.

---

## 5. Asset Placement Map — All 22 Assets

| # | Asset | Where | Size | When Visible |
|---|-------|-------|------|-------------|
| 1 | captain-avatar.webp | Header logo (24px), Alert cards (24px), Observatory (16px) | 24/16px | Always |
| 2 | captain-speaking.webp | Left panel Captain portrait (80px) | 80px | When narrating |
| 3 | captain-idle.webp | Left panel Captain portrait (80px) | 80px | Default state |
| 4 | captain-alert.webp | Left panel + right alert cards (24px) | 80/24px | Risk warnings |
| 5 | captain-success.webp | Detail panel header (24px) | 24px | Risk grade A/B |
| 6 | captain-mission-control.webp | Right panel route cards (24px) | 24px | Route suggestions |
| 7 | captain-holographic.webp | Galaxy loading state (64px) | 64px | Loading |
| 8 | captain-full-body.webp | Error/empty state (120px) | 120px | No data |
| 9 | captain-master.webp | OG share cards (200px) | 200px | Social sharing |
| 10 | usx-planet.webp | Galaxy 3D Billboard sprite | 6.5x scale | Always (galaxy) |
| 11 | eusx-planet.webp | Galaxy 3D Billboard sprite | 6.0x scale | Always (galaxy) |
| 12 | slx-planet.webp | Galaxy 3D Billboard sprite | 5.5x scale | Always (galaxy) |
| 13 | stslx-planet.webp | Galaxy 3D Billboard sprite | 5.5x scale | Always (galaxy) |
| 14 | kamino-station.webp | Galaxy 3D Billboard sprite | 2.2x scale | Always (galaxy) |
| 15 | loopscale-station.webp | Galaxy 3D Billboard sprite | 2.2x scale | Always (galaxy) |
| 16 | orca-station.webp | Galaxy 3D Billboard sprite | 2.2x scale | Always (galaxy) |
| 17 | raydium-station.webp | Galaxy 3D Billboard sprite | 2.2x scale | Always (galaxy) |
| 18 | exponent-station.webp | Galaxy 3D Billboard sprite | 2.2x scale | Always (galaxy) |
| 19 | nebula-panorama.webp | Galaxy scene.background (equirectangular) | Full viewport | Always |
| 20 | observatory-interior.webp | Observatory strip CSS background | Full width | Always |
| 21 | mission-control-interior.webp | Right panel CSS background (soft-light blend) | Full height | Always |
| 22 | explorer-card-bg.webp | OG image API route background | 1200x630 | Social sharing |

**Zero unused assets.** Every file has a purpose and a location.

---

## 6. Motion Language

Every animation must feel **inevitable, not decorative.** Like gravity, not confetti.

| Element | Motion | Duration | Easing | Why |
|---------|--------|----------|--------|-----|
| Sun | Breathing scale 0.96-1.04 | 2.8s loop | sine | Stars pulse. It should feel alive, not animated. |
| Planets | Per-identity rotation speed | Continuous | sine | Each planet has character. USX is slow/stable. SLX is fast/energetic. |
| Moons | Orbital motion around parent | Continuous | linear | Moons orbit. This is physics, not decoration. |
| Stars | Multi-layer rotation (5 speeds) | Continuous | linear | Creates parallax depth. Layers at different speeds = depth perception. |
| Camera | Subtle drift (0.015 speed, 0.25 radius) | Continuous | sine | The universe breathes. The camera shouldn't feel locked. |
| Panel slide-in | translateX + opacity | 400ms | ease-out | Panels arrive from their edge. Left from left, right from right. Natural. |
| Detail panel open | translateX(16px→0) + opacity | 300ms | cubic-bezier(0.16,1,0.3,1) | Smooth, no bounce. Feels like opening a drawer. |
| Detail panel close | translateX(0→16px) + opacity | 250ms | ease-in | Slightly faster than open. Closing feels instant. |
| Card hover | translateY(-1px) + border brighten | 200ms | ease-out | Subtle lift. Says "this is interactive" without shouting. |
| View transition (Galaxy↔List) | Crossfade + scale(0.99→1) | 300ms | cubic-bezier | Smooth morph. Never a jarring swap. |
| Entry sequence | Staggered fade-in | 3.5s total | See §4 | Cinematic. The universe reveals itself. |
| Orbit rings | Independent rotation per ring | Continuous | linear | Each ring at different speed + tilt = depth, not diagram. |
| Labels | Hover expand with card | 200ms | ease-out | Information on demand, not always visible. |

---

## 7. Responsive Strategy

### Desktop (≥1280px) — Primary
Full 3-column layout. All panels visible. Galaxy at full scale.

### Tablet (768-1279px)
- Left panel collapses to icon-only (Captain avatar 40px, no text)
- Right panel collapses to alert badges (icons, no text)
- Galaxy takes ~90% of width
- Observatory remains (compact)

### Mobile (< 768px)
- No side panels
- Galaxy fills entire viewport (100%)
- Bottom sheet for details (swipe up)
- Captain avatar floating bottom-left (40px)
- Tab bar at bottom: Galaxy | List | Captain

**Why desktop-first:** The 3D galaxy is the product. It needs screen real estate. Mobile is a consumption view, not the primary experience.

---

## 8. ASCII Wireframes

### Galaxy View (Primary)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [🐱24] Yield Galaxy                    [Galaxy] [List]        16 destinations│
├──────────┬───────────────────────────────────────────────────┬───────────┤
│          │                                                   │           │
│ [🐱80px] │    ◉ USX        ◉ eUSX                          │BEST ROUTES│
│ CAPTAIN  │              ◎                                   │           │
│ WHISKERS │                                                   │ 1. Dock   │
│ "Explor- │                     ✦ SUN                        │    USX    │
│  ing..." │                                                   │ 2. PT-USX │
│          │  ▣ Orca                          ◉ stSLX         │ 3. SLX    │
│ OVERVIEW │                                   ◎              │           │
│ TVL $74M │         ▣ Loop    ◉ SLX                          │───────────│
│ APY 26%  │                     ◎       ▣ Ray                │ ALERTS    │
│ 12P 3M 1S│              ▣ Expo                              │           │
│          │                                    ▣ Kamino      │ [🐱] High │
│ DEST     │                                                   │ [🐱] Comp │
│ USX 1.33%│                                                   │ [🐱] Route│
│ [ROUTE]  │    Scroll to zoom · Drag to rotate               │           │
├──────────┴───────────────────────────────────────────────────┴───────────┤
│ OBSERVATORY │ USX Kamino 77·A │ SLX-SOL 405% │ PT-USX Fixed │ 6<0.5%   │
└──────────────────────────────────────────────────────────────────────────┘
```

### List View

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [🐱24] Yield Galaxy                    [Galaxy] [List]        16 destinations│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  16 opportunities    $74.2M TVL    26.3% Avg APY    12P · 3M             │
│                                                                          │
│  OBSERVATORY  │ USX 77·A │ SLX-SOL 405% │ PT-USX Fixed │ 6<0.5%        │
│                                                                          │
│  Score │ Risk │ Destination      │ APY    │ TVL     │ Type  │ Protocol  │
│  ──────┼──────┼──────────────────┼────────┼─────────┼───────┼───────────│
│   77   │  A   │ USX              │  1.33% │ $12.4M  │ ◉ USX │ Kamino   │
│   74   │  B   │ USX-USDC         │  0.73% │ $13.8M  │ ◉ USX │ Orca     │
│   67   │  C   │ USX              │  1.62% │  $1.2M  │ ◉ USX │ Loopscale│
│   ...  │      │                  │        │         │       │          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Detail View (panel slides in from right over galaxy)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [🐱24] Yield Galaxy                    [Galaxy] [List]        16 destinations│
├──────────┬────────────────────────────────────┬─────────────────────────┤
│          │                                    │ USX                  ✕  │
│ LEFT     │        GALAXY (dimmed)             │ Kamino · Lending        │
│ PANEL    │                                    │                         │
│ (same)   │                                    │ [77] [A] [◉USX] [Lend] │
│          │                                    │                         │
│          │                                    │ Total APY               │
│          │                                    │ ████████████ 1.33%      │
│          │                                    │ Base: 1.33%             │
│          │                                    │                         │
│          │                                    │ TVL      $12.4M         │
│          │                                    │ IL Risk  None           │
│          │                                    │                         │
│          │                                    │ [APY Chart 90d]         │
│          │                                    │                         │
│          │                                    │ [Share on 𝕏] [Copy]    │
│          │                                    │ [Go to Kamino ↗]       │
├──────────┴────────────────────────────────────┴─────────────────────────┤
│ OBSERVATORY                                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

**Why the detail panel replaces the right panel:** When inspecting a specific opportunity, routes and alerts become irrelevant. The detail panel takes the right panel's space AND extends over part of the galaxy (with a dimmed backdrop). This creates focus without destroying context — the galaxy is still visible, dimmed.

---

## 9. Design Rationale

### Why panels sit OUTSIDE the galaxy, not on top

If panels overlay the galaxy, the galaxy becomes decoration. By giving the galaxy its own uninterrupted viewport, it remains the primary interface. Users look AT the galaxy, not THROUGH panels at the galaxy.

### Why Captain Whiskers is 80px, not 48px

At 48px, expression states (speaking, idle, alert) are indistinguishable. At 80px, the user can see the cat's eyes, posture, and mood. The Captain is a character, not an icon.

### Why the right panel has routes AND alerts (not just alerts)

Routes are the product's primary value proposition: "what should I do with my capital?" Moving routes to a separate page or hiding them behind a click would bury the most important intelligence. They must be visible on the primary screen.

### Why the observatory is 52px and not bigger

The observatory answers "what's notable right now?" — this is a glance-and-move-on interaction. Making it bigger would suggest it's a primary interface element. It's a status bar, not a dashboard section.

### Why no search bar

Users don't search a galaxy. They explore it. Adding search implies the product is a database query tool. The galaxy map IS the navigation. Click a planet to explore it. The command palette (Cmd+K) can be added later for power users.

### Why no wallet connection in the header

No wallet integration exists yet. Showing "Connect Wallet" that does nothing is worse than showing nothing. Every element must function. The header gains wallet UI when wallet features ship.

### Why 200px left panel (not 140px)

At 140px, "CAPTAIN WHISKERS" wraps to two lines. Galaxy overview stats touch the edges. The destination card is too cramped for the CTA button. 200px gives each element room to breathe while still leaving 70%+ for the galaxy.

---

**This blueprint is the permanent design reference for Yield Galaxy v2.**

**Awaiting approval to begin implementation.**
