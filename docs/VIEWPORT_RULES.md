# Yield Galaxy — Viewport Composition Rules

**Status:** Permanent. Do not override.

---

## 1. Safe Galaxy Area

The center of the viewport is protected territory. No UI element may ever enter this zone.

```
┌──────────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░                                                                        ░│
│░    ┌──────────────────────────────────────────────────────────┐        ░│
│░    │                                                          │        ░│
│░    │                                                          │        ░│
│░    │                    SAFE GALAXY AREA                      │        ░│
│░    │                                                          │        ░│
│░    │              No UI may enter this zone.                  │        ░│
│░    │                                                          │        ░│
│░    │              The sun lives here.                         │        ░│
│░    │              The planets live here.                      │        ░│
│░    │              The moons live here.                        │        ░│
│░    │                                                          │        ░│
│░    │                                                          │        ░│
│░    └──────────────────────────────────────────────────────────┘        ░│
│░                                                                        ░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────────────────────────┘

░ = HUD zone (edges only)
Inner rectangle = PROTECTED — no panels, no cards, no overlays
```

### Safe area definition

```
top:    48px  (below navigation bar)
left:   80px  (Captain character width clearance)
right:  200px (COMMS console width)
bottom: 36px  (telemetry strip height)
```

The safe area is everything BETWEEN these edge reserves. On a 1440×900 viewport:

```
Safe area = (1440 - 80 - 200) × (900 - 48 - 36) = 1160 × 816 = 946,560px²
Total viewport = 1440 × 900 = 1,296,000px²
Safe area = 73% of viewport
```

The Solstice Sun and all four hero planets must have their screen-projected positions fall INSIDE this safe area at the default camera position.

### Exception

The detail panel (opened on click) is the ONLY element permitted to partially overlap the safe area. It slides in from the right and covers the COMMS console zone + part of the safe area. This is acceptable because:
- It is temporary (dismissed on click/escape)
- The galaxy dims behind it (backdrop opacity 0.4)
- The user explicitly requested the overlay by clicking

---

## 2. Edge HUD Rules

Every HUD element lives on one of four edges. No HUD element may float in the middle of the viewport.

```
EDGE ASSIGNMENT:

TOP EDGE:     Navigation bar (full width, 44px)
LEFT EDGE:    Captain character (lower portion only, max 200px wide)
RIGHT EDGE:   COMMS console (max 200px wide, top 48px to bottom 36px)
BOTTOM EDGE:  Telemetry strip (full width, 36px)
```

### Rules

1. **No HUD element spans two edges.** The navigation bar spans the top. The telemetry spans the bottom. They never wrap around corners.

2. **No HUD element bisects the galaxy.** A horizontal bar at mid-height or a vertical bar at mid-width would visually cut the galaxy in half. This is never permitted.

3. **HUD elements must be transparent.** Every panel background must use `rgba` with alpha ≤ 0.5. The nebula and stars must always be visible through every panel.

4. **HUD elements must have no solid borders.** Border opacity must be ≤ 0.06. No element should have a visually distinct edge that creates a "frame" around the galaxy.

5. **HUD text must be muted.** Label text: `#8B8591`. Value text: `#C4BDB7`. Only the accent color `#F6A04D` may appear at full brightness, and only for the most important values (APY, planet names).

---

## 3. Camera Rules

The camera serves the galaxy. The galaxy does not serve the camera.

### Rule 3.1: The camera must frame all hero planets inside the safe area

At the default position `(0, 22, 32)` with FOV `52°`, all four planets and the sun must project onto screen coordinates that fall within the safe area boundaries.

If a planet's screen position falls outside the safe area (behind a panel), the camera position must be adjusted — NOT the panel.

### Rule 3.2: The camera must never move to accommodate UI

If a new feature requires a larger right panel, the camera does NOT pull back or shift left. Instead, the panel must become narrower or collapsible.

### Rule 3.3: The camera adapts to viewport size

On smaller viewports, the camera pulls back (increases Z distance) to fit the same planetary system into fewer pixels. The planets appear smaller but the composition remains intact.

```
Viewport width → Camera Z distance:
  ≥1440px:  Z = 32  (default, optimal)
  1280px:   Z = 34
  1024px:   Z = 38
  768px:    Z = 42
  375px:    Z = 48
```

### Rule 3.4: The idle camera drift must never move a planet outside the safe area

Drift amplitude must be small enough that no planet exits the safe zone during drift. Current drift: 0.25 radius at 0.015 speed. At this amplitude, planet screen positions shift by ~3px. Safe.

---

## 4. Planet Visibility Rules

### Rule 4.1: No hero planet may be partially hidden by UI

Every planet sprite must be 100% visible at all times (when not in detail panel overlay). If a planet is behind a panel, either:
- The planet position must change, OR
- The panel must shrink, OR
- The panel must become more transparent

The planet NEVER moves to accommodate the panel. The panel adapts.

### Rule 4.2: No station may be permanently obscured

Stations are smaller and may be positioned near edges. It is acceptable for a station to be BEHIND a transparent panel (the station is visible through the panel's alpha). It is NOT acceptable for a station to be completely invisible behind an opaque element.

### Rule 4.3: No label may intersect a panel

Planet labels (drei Html overlays) must be positioned so they do not overlap with fixed HUD panels. Labels sit below their planet. If a planet is near the right edge, its label must shift left to avoid the COMMS console.

Label collision avoidance:
- Labels have a `distanceFactor` that scales them with camera distance
- Labels should be placed below or above their parent, never to the side where they might hit a panel
- If a label would overlap the COMMS console, it renders at reduced opacity or is hidden (the planet sprite itself is still visible)

### Rule 4.4: The Solstice Sun must always be visible

The sun is at `(0, 0, 0)`. At all viewport sizes and camera positions, the sun must project to a screen position within the safe area. If the sun is ever behind a panel, the composition is broken.

---

## 5. Responsive Behavior

### Desktop (≥1440px)

```
Camera: (0, 22, 32), FOV 52°
Nav bar: 44px, full width
Captain: 200px tall, lower-left
COMMS: 200px wide, right edge
Telemetry: 36px, full width
Safe area: 73% of viewport
All planets visible. Full labels. Full COMMS content.
```

### Laptop (1280-1439px)

```
Camera: (0, 22, 34), FOV 52°  ← pulled back 2 units
Nav bar: 44px, full width
Captain: 180px tall, lower-left  ← slightly smaller
COMMS: 180px wide, right edge  ← narrower
Telemetry: 36px, full width
Safe area: 72% of viewport
All planets visible. Full labels. COMMS cards may truncate text.
```

### Tablet (768-1279px)

```
Camera: (0, 22, 38), FOV 50°  ← pulled back more, tighter FOV
Nav bar: 40px, full width
Captain: 120px tall, lower-left  ← compact
  Speech bubble hidden. Tap Captain to show.
COMMS: COLLAPSED
  Replaced by a floating button (right edge, 40px)
  Tap to slide in a temporary 200px panel (overlays galaxy, dismissed on tap-outside)
Telemetry: 32px, full width, fewer items (top 2 only)
Safe area: 85% of viewport (COMMS collapsed)
All planets visible. Labels at reduced size.
```

### Mobile (< 768px)

```
Camera: (0, 22, 48), FOV 48°  ← maximum pullback
Nav bar: 40px, full width
Captain: 60px floating avatar, lower-left corner
  Tap to open bottom sheet with speech + overview
COMMS: HIDDEN
  Accessed via bottom sheet tab
Telemetry: HIDDEN
  Data accessible in bottom sheet
Bottom tab bar: 44px
  [Galaxy] [List] [Captain]
Safe area: 95% of viewport
All planets visible but small. Labels show name only (no TVL/APY).
```

### Ultrawide (≥2560px)

```
Camera: (0, 22, 30), FOV 54°  ← closer, wider FOV to fill space
Nav bar: 44px, full width
Captain: 240px tall, lower-left  ← larger on big screens
COMMS: 240px wide, right edge  ← wider, more comfortable text
Telemetry: 40px, full width, all items
Safe area: 75% of viewport
All planets visible at larger scale. Full labels with additional detail.
```

### Summary table

| Viewport | Camera Z | COMMS | Captain | Telemetry | Safe Area |
|----------|:--------:|-------|---------|-----------|:---------:|
| Ultrawide ≥2560 | 30 | 240px panel | 240px full | 40px full | 75% |
| Desktop ≥1440 | 32 | 200px panel | 200px full | 36px full | 73% |
| Laptop 1280-1439 | 34 | 180px panel | 180px full | 36px full | 72% |
| Tablet 768-1279 | 38 | Collapsed (button) | 120px compact | 32px reduced | 85% |
| Mobile < 768 | 48 | Hidden (sheet) | 60px avatar | Hidden (sheet) | 95% |

---

## 6. The Golden Rule

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   If a future feature needs screen space,               │
│                                                         │
│   the galaxy MUST NOT become smaller.                   │
│                                                         │
│   Instead, the HUD must:                                │
│                                                         │
│     1. Reorganize itself                                │
│     2. Collapse into icons                              │
│     3. Move into overlays                               │
│     4. Become togglable                                 │
│     5. Move into a separate view                        │
│                                                         │
│   The galaxy is the product.                            │
│   The galaxy is the world.                              │
│   The world comes first.                                │
│   The interface comes second.                           │
│                                                         │
│   This rule is permanent.                               │
│   No feature overrides it.                              │
│   No deadline overrides it.                             │
│   No stakeholder overrides it.                          │
│                                                         │
│   If the galaxy shrinks, the product is broken.         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Practical application

| Scenario | Wrong response | Right response |
|----------|---------------|----------------|
| "We need a wallet panel" | Add a 300px left sidebar | Add a floating wallet button that opens a bottom sheet |
| "We need a search bar" | Widen the header to 80px | Add Cmd+K command palette overlay |
| "We need more analytics" | Add a dashboard tab with charts covering the galaxy | Add an analytics overlay that dims the galaxy temporarily |
| "We need social features" | Add a user panel on the left | Add a user avatar in the nav bar that opens a profile sheet |
| "We need notifications" | Add a notification panel on the right | Add a notification badge on the COMMS console that expands on click |

The galaxy never gets smaller. The HUD gets smarter.

---

**This document is permanent. It governs every future design decision.**

**The blueprint + viewport rules are complete. Awaiting final approval to begin implementation.**
