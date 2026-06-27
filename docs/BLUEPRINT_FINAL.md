# Yield Galaxy — Final Composition Document

**Revision:** v3 (final)
**Mindset:** Game menu, not dashboard. World, not page.

---

## The Fundamental Shift

A dashboard places data in the center and UI around it.

A world places the ENVIRONMENT in the center and UI at the edges.

The difference:

```
DASHBOARD:                         WORLD:
┌─────────────────────┐            ┌─────────────────────┐
│ ████ HEADER ████████│            │                     │
├────┬──────────┬─────┤            │                     │
│████│          │█████│            │   ENVIRONMENT       │
│████│  CONTENT │█████│            │   (fills everything)│
│████│          │█████│            │                     │
│████│          │█████│            │             ░░░░░░░░│
├────┴──────────┴─────┤            │  ░░░░░              │
│ ████ FOOTER ████████│            │                     │
└─────────────────────┘            └─────────────────────┘
                                   ░ = UI hugging edges

In a dashboard, the content lives INSIDE the UI.
In a world, the UI lives INSIDE the content.
```

Yield Galaxy is a world.

---

## Visual Weight Map

Every element in the composition has a visual weight. Weight determines where the eye goes.

```
WEIGHT HIERARCHY:

10 ████████████  Solstice Sun (brightest, largest, center, glowing)
 9 ███████████   USX planet (big, textured, warm light, upper-left)
 8 ██████████    eUSX, SLX, stSLX (large, each unique color)
 6 ████████      Captain Whiskers (character, face, eyes draw attention)
 5 ███████       Planet labels (text near bright objects)
 4 ██████        Orbital rings (structural, very subtle)
 3 █████         Station sprites (small, edge of scene)
 2 ████          Panel text (muted color, edge of screen)
 1 ███           Observatory strip (smallest text, bottom edge)
 0 ██            Nebula (atmospheric, never dominant)
```

The sun is weight 10. Panel text is weight 2. That's a 5:1 ratio. If panels ever feel heavier than the galaxy, the ratio is broken.

---

## Eye Movement

The eye should follow this exact path on first load:

```
ENTRY:

     1 ──────→ SUN (center glow pulls the eye immediately)
     │
     2 ──────→ USX (large planet, upper-left, nearest to Western reading start)
     │
     3 ──────→ eUSX, then SLX, then stSLX (scan the planets, understand the system)
     │
     4 ──────→ Captain Whiskers (character face — humans are hardwired to notice faces)
     │
     5 ──────→ Captain's speech ("Exploring..." — now the user reads)
     │
     6 ──────→ Right panel text (routes, alerts — discovered, not imposed)
     │
     7 ──────→ Observatory (bottom — last, lowest priority)
```

If the user's eye goes to panel text BEFORE the galaxy, the design has failed.

**How to guarantee this order:**

- Sun and planets must be BRIGHTER than any UI text
- Panel backgrounds must be DARKER than the nebula
- Panel text must be MUTED (not white — use #8B8591 for labels, #C4BDB7 for values)
- Captain's face is the bridge between galaxy (visual) and UI (text)

---

## Object Hierarchy

### Tier 1: The World (the galaxy IS the application)

These elements ARE the product. Without them, there is no application.

- Solstice Sun
- 4 Hero Planets (USX, eUSX, SLX, stSLX)
- Nebula atmosphere
- Orbital rings
- Stars

### Tier 2: World Objects (exist inside the world)

These elements live inside the galaxy. They are part of the environment.

- 5 Stations (Kamino, Orca, Raydium, Loopscale, Exponent)
- 4 PT Moons (orbiting parents)
- Planet labels (name + TVL + APY floating near each planet)
- Station labels (name only)

### Tier 3: World Interface (HUD attached to the edges)

These elements are painted on the glass of the user's spaceship viewport. They support navigation without covering the view.

- Captain Whiskers (lower-left — the navigator sitting beside you)
- Communications console (right edge — incoming intelligence)
- Telemetry strip (bottom edge — system readings)
- Navigation bar (top edge — minimal, transparent)

### Tier 4: Overlays (temporary, on demand)

These appear only when requested and disappear when dismissed.

- Detail panel (inspecting a specific planet/opportunity)
- Command palette (Cmd+K for power users, future)

**Nothing in Tier 3 or 4 should ever cover a Tier 1 or 2 element when the user isn't interacting.**

---

## Composition: The Final Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│░░░ Yield Galaxy ░░░░░░░░░░░░░░░░ [Galaxy│List] ░░░░░░░░░░░░░░░░░░░░░░ 16 ░│
│                                                                          │
│                                                                          │
│                          ◉ eUSX                                          │
│                        $11.6M · 0.03%                                    │
│                            ◎                                    ░░░░░░░░│
│                                                                 ░COMMS ░│
│   ◉ USX                       ✦✦✦                              ░       ░│
│   $12.4M · 1.33%                ✦✦✦  SOLSTICE             ░Dock USX░│
│       ◎ PT-USX                  ✦✦✦                        ░1.33%   ░│
│                                                                 ░       ░│
│                                                    ◉ stSLX     ░PT-USX ░│
│  ▣ Orca                                          $9.9M          ░4.85%  ░│
│                                                      ◎          ░       ░│
│                                                                 ░SLX    ░│
│          ▣ Loopscale        ◉ SLX                              ░405%   ░│
│                            $6.1M · 0.33%            ▣ Raydium  ░       ░│
│                               ◎                                 ░░░░░░░░│
│                                                                          │
│                     ▣ Exponent                     ▣ Kamino              │
│                                                                          │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░ 🐱 Captain │ USX·Kamino·77·A │ SLX-SOL·405% │ PT-USX·Fixed │ 6<0.5% ░│
└──────────────────────────────────────────────────────────────────────────┘

░ = UI elements (transparent, edge-hugging, low visual weight)
Everything else = THE WORLD
```

### What changed from v2

| v2 Blueprint | v3 Final |
|-------------|----------|
| Left panel: 200px solid panel | **Captain floats in the lower-left corner of the galaxy viewport** |
| Right panel: 220px solid panel | **Communications console hugs the right edge, semi-transparent, no solid background** |
| Observatory: 52px separate strip | **Telemetry bar at the bottom, integrated into the world edge** |
| Header: 48px solid bar | **Transparent navigation bar, nearly invisible** |
| Galaxy: lives between panels | **Galaxy fills the ENTIRE viewport. UI overlays the edges.** |

### Why this is different

The galaxy canvas is now `position: absolute; inset: 0` — it fills the entire page. UI elements float ON TOP of the edges. The galaxy is never "inside" a layout cell. It IS the layout.

The panels are not `<aside>` elements in a CSS grid. They are `position: fixed` overlays with transparent backgrounds that let the nebula bleed through.

---

## Captain Whiskers: Character, Not Card

```
                                    ┌──────────────────────┐
                                    │ "Exploring Solstice   │
                                    │  Galaxy. 16 dests     │
                                    │  detected. USX at     │
                                    │  Kamino is the top    │
                                    │  destination."        │
                                    └──────────┬───────────┘
                                               │
                                               │
                              ┌────────────────┐
                              │                │
                              │  [Captain      │
                              │   full-body    │
                              │   200px tall   │
                              │   standing     │
                              │   in spacesuit]│
                              │                │
                              └────────────────┘
```

The Captain is not an 80px avatar inside a card. The Captain is a **200px full-body illustration** standing at the bottom-left of the viewport, with a speech bubble floating above. Like a game companion. Like Navi in Zelda. Like Ghost in Destiny.

**Asset:** `captain-full-body.webp` — this is the primary Captain representation. Not avatar. Not speaking. The full character.

The speech bubble appears to the RIGHT of the Captain, floating. It fades in after the galaxy loads. It auto-dismisses after 10 seconds. Clicking the Captain re-triggers it.

**Galaxy Overview** (TVL, APY, planets/moons/stations) moves INTO the speech bubble or into a small tooltip that appears on hover over the Captain. It does NOT get its own panel.

---

## Communications Console (Right Edge)

Not a sidebar. A translucent console attached to the right edge of the viewport.

```
Right edge:
                                                          ┌────────────────┐
                                                          │ COMMS          │
                                                          │                │
                                                          │ ▸ Dock at USX  │
                                                          │   1.33% · Low  │
                                                          │                │
                                                          │ ▸ Acquire PT   │
                                                          │   4.85% · Low  │
                                                          │                │
                                                          │ ▸ Harvest SLX  │
                                                          │   405% · High  │
                                                          │                │
                                                          │ ─────────────  │
                                                          │                │
                                                          │ ⚠ Highest Yld  │
                                                          │   2m ago       │
                                                          │                │
                                                          │ ⚠ Compression  │
                                                          │   2m ago       │
                                                          └────────────────┘

Width: 200px
Background: rgba(10, 14, 26, 0.5)
Border-left: 1px solid rgba(246, 160, 77, 0.06)
Position: fixed, right: 0, top: 48px, bottom: 56px
```

**Why "COMMS" not "BEST ROUTES":** In a spacecraft, incoming intelligence arrives through the communications console. "COMMS" fits the world. "BEST ROUTES FOR YOU" fits a dashboard.

The console has no header bar, no "View All" link, no section dividers. Just content flowing top to bottom. Routes at the top (proactive), alerts at the bottom (reactive). Separated by a thin line.

---

## Telemetry Strip (Bottom Edge)

Not a footer. Not an observatory panel. A spacecraft telemetry readout.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🐱 │ USX · Kamino · Score 77 │ SLX-SOL · 405% APY │ PT-USX · Fixed │ 6 pools < 0.5% │
└──────────────────────────────────────────────────────────────────────────┘

Height: 36px
Background: rgba(10, 14, 26, 0.6)
Border-top: 1px solid rgba(246, 160, 77, 0.04)
Position: fixed, bottom: 0
Text: 9px, #8B8591, monospace
```

This reads like a spacecraft status bar. Monospace font. Pipe separators. Minimal. Functional. No cards. No borders. No hover states. Pure data.

---

## Navigation Bar (Top Edge)

Nearly invisible. The user should forget it exists.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Yield Galaxy                         [Galaxy] [List]                    16  │
└──────────────────────────────────────────────────────────────────────────┘

Height: 44px
Background: rgba(10, 14, 26, 0.3)  ← MORE transparent than panels
Text: 12px, #8B8591
Position: fixed, top: 0
```

No logo icon. Just the word "Yield Galaxy" in muted text. The galaxy/list toggle as two small text buttons. The destination count as a number. Nothing else.

**Why no Captain avatar in the header:** The Captain is a 200px character in the viewport. Duplicating a 24px avatar in the header is redundant and reduces the Captain's impact.

---

## Negative Space Analysis

```
┌──────────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 3% nav
│                                                                          │
│                                                                          │
│                         GALAXY                                           │
│                         (EMPTY SPACE)                                    │
│                                                                          │ 75%
│                                                                          │ OPEN
│                                                   ░░░░░░░░░░░░░░░░░░░░░│ GALAXY
│                                                   ░░ COMMS (13%) ░░░░░░│
│                                                   ░░░░░░░░░░░░░░░░░░░░░│
│                                                                          │
│ ┌──────┐                                                                 │
│ │ CAPT │                                                                 │
│ │ 200px│                                                                 │
│ └──────┘                                                                 │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 4% telemetry
└──────────────────────────────────────────────────────────────────────────┘

UI coverage: nav (3%) + comms (13%) + captain (8%) + telemetry (4%) = 28%
Galaxy coverage: 72% UNOBSTRUCTED + 28% visible through transparent UI = ~85% perceived
```

72% of the viewport has ZERO UI on top of it. The remaining 28% has semi-transparent overlays that let the nebula and stars bleed through. The perceived galaxy coverage is ~85%.

**Compare to v2 blueprint:** v2 had solid 200px + 220px panels = 420px of opaque UI. That was 29% opaque coverage. Now it's 0% opaque — everything is transparent.

---

## The "No Text" Test

If I hide all text, all numbers, all buttons:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                                                                          │
│                          ◉                                               │
│                            ◎                                             │
│                                                                          │
│   ◉                            ✦✦✦                                     │
│       ◎                         ✦✦✦                                     │
│                                 ✦✦✦                          ◉          │
│                                                                ◎         │
│  ▣                                                                       │
│          ▣              ◉                              ▣                 │
│                           ◎                                              │
│                                                                          │
│              ┌────────┐                                                  │
│              │ [CAT]  │          ▣               ▣                       │
│              └────────┘                                                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Does this communicate "premium space exploration interface"?**

- Central glowing object (sun) ✓
- Large spheres in an orbital arrangement ✓
- Smaller objects at the edges ✓
- A CHARACTER standing in the corner ✓
- Deep space atmosphere ✓

**Yes.** Even without text, this reads as a space navigation interface with a companion character. That is the test.

---

## Asset Reassignment (Final)

| # | Asset | Role | Where | Justification |
|---|-------|------|-------|---------------|
| 1 | captain-full-body | **PRIMARY Captain representation** | Lower-left viewport, 200px | This is the Captain. Not an icon. Not a circle crop. The full character. |
| 2 | captain-speaking | Speech bubble active state | Replaces full-body when narrating | Expression change indicates the Captain is talking |
| 3 | captain-idle | Default state | Replaces full-body when speech dismissed | Calm, watchful |
| 4 | captain-alert | Risk warning state | Replaces full-body during alerts | Visual alarm |
| 5 | captain-avatar | Telemetry strip icon (16px) | Bottom-left of telemetry bar | Tiny brand mark |
| 6 | captain-success | Detail panel (good opportunity) | 24px in detail header | Contextual reaction |
| 7 | captain-master | OG share card | Social sharing only | Marketing |
| 8 | captain-holographic | Loading state | 80px centered during galaxy load | Atmospheric loading |
| 9 | captain-mission-control | **REMOVED from active use** | Available but not loaded | Indistinguishable from avatar at small sizes |
| 10-13 | 4 planet textures | Galaxy Billboard sprites | 3D scene | Essential |
| 14-18 | 5 station textures | Galaxy Billboard sprites | 3D scene | Essential |
| 19 | nebula-panorama | Scene background | 3D scene.background | Essential |
| 20 | observatory-interior | **REMOVED** | Not loaded | Invisible at 36px strip height |
| 21 | mission-control-interior | **REMOVED** | Not loaded | Invisible through transparency |
| 22 | explorer-card-bg | OG share card background | API route | Social sharing |

**Active assets: 19.** 3 removed from active use (still in public/ but not loaded).

---

## Motion: Cinematic, Not Animated

| Moment | What Happens | Duration | Feeling |
|--------|-------------|----------|---------|
| **Page load** | Black. Nothing. Then: a single point of light appears at center. | 0-0.5s | Anticipation |
| **Sun ignition** | The point EXPANDS into the Solstice Sun. Bloom flares. Light radiates outward. | 0.5-1.2s | Wonder |
| **Planet reveal** | From the sun's light, planets emerge one by one. Each with its own glow. USX first (hero). | 1.2-2.5s | Discovery |
| **Stars appear** | Star layers fade in progressively. Depth establishes. | 1.5-2.5s | Scale |
| **Orbits draw** | Orbital rings trace themselves, thin and elegant. | 2.0-2.8s | Structure |
| **Captain enters** | Captain Whiskers slides up from the bottom-left. Speech bubble appears. | 2.8-3.5s | Companionship |
| **Comms + Telemetry** | Right console and bottom strip fade in last. | 3.2-3.8s | Interface |
| **Idle state** | Camera drifts. Sun breathes. Planets rotate. Moons orbit. Stars twinkle. | Continuous | Life |

**The entry is a story, not a fade-in sequence.** It has a beginning (darkness), a climax (sun ignition), and a resolution (the world is alive). This is what separates a world from a dashboard.

---

## Why Every Element Exists

| Element | Exists because... |
|---------|------------------|
| Solstice Sun | It is the center of the Solstice ecosystem. Everything revolves around it. |
| 4 Planets | They are the four assets users can deploy capital into. They ARE the product. |
| 5 Stations | They are the protocols where deployment happens. They are destinations. |
| 4 Moons | They are fixed-yield opportunities orbiting their parent asset. Hierarchy. |
| Captain Whiskers | He is the navigator. He tells the user where to go. He makes the experience personal. |
| COMMS console | It answers "what should I do?" — the most valuable question in DeFi. |
| Telemetry strip | It answers "what's notable right now?" — a glance, not a study. |
| Navigation bar | It lets the user switch between Galaxy and List views. Nothing else. |
| Planet labels | They identify what the user is looking at. Name + APY + TVL. |

**Elements that do NOT exist (and why):**

| Removed | Why |
|---------|-----|
| Galaxy Overview panel | Stats belong in Captain's speech or on hover, not in a permanent panel |
| Suggested Destination card | Captain's speech already suggests destinations |
| "VIEW ROUTE" button | Clicking a planet IS viewing the route |
| Section headers ("BEST ROUTES FOR YOU") | Dashboard language, not world language |
| "View All" links | There is no "all" — the galaxy shows everything |
| Footer tagline | Marketing copy does not belong inside a world |
| Observatory label | The telemetry strip needs no label — it IS the observatory |

---

**This is the final composition. The galaxy is the world. The UI is the spaceship HUD. The Captain is the companion. Everything else is atmosphere.**

**Awaiting approval.**
