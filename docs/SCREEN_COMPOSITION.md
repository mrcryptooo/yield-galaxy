# Yield Galaxy — Screen Composition (Source of Truth)

**Status:** Permanent. World coordinates derive FROM this document, not the reverse.

---

## Viewport Grid

```
0%                    50%                   100%
┌──────────────────────┬──────────────────────┐ 0%
│                      │                      │
│   UPPER LEFT         │   UPPER RIGHT        │
│                      │                      │
│                      │                      │
├──────────────────────┼──────────────────────┤ 50%
│                      │                      │
│   LOWER LEFT         │   LOWER RIGHT        │
│                      │                      │
│                      │                      │
└──────────────────────┴──────────────────────┘ 100%
```

---

## Solstice Sun

| Property | Value |
|----------|-------|
| **Viewport position** | 48% from left, 38% from top |
| **Viewport size** | 14-16% of viewport width |
| **Role** | Absolute focal point. The eye arrives here first via brightness. |
| **Relationship to empty space** | Slightly above center — more empty space below than above. Creates grounding. The world extends upward beyond the frame. |
| **Relationship to camera** | Always centered in the safe area. Camera target points slightly in front of the sun (z=-2), pushing the sun above the viewport midpoint. |

**Why not dead center:** Dead center is static. Placing the sun at 48% left, 38% top creates subtle tension. The eye finds it instantly (brightest object) but the asymmetry makes the composition dynamic.

---

## USX — The Hero World

| Property | Value |
|----------|-------|
| **Visual importance** | #1 planet. The primary asset. The first world users should notice after the sun. |
| **Viewport size** | 10-12% of viewport width (largest planet) |
| **Viewport location** | 22% from left, 32% from top |
| **Relationship to sun** | Upper-left of sun. Close — the nearest planet. Feels like the "home world" orbiting close to the star. |
| **Relationship to empty space** | Open space to its left (the left panel will go here in Milestone 3, but USX must be clearly visible even with a 200px panel). Open space between USX and eUSX above. |
| **Relationship to camera** | Nearest planet to camera. Therefore largest in perspective. This is intentional — the hero world dominates. |

---

## eUSX — The Ethereal World

| Property | Value |
|----------|-------|
| **Visual importance** | #2 planet. The enhanced variant. Should feel elevated, aspirational. |
| **Viewport size** | 6-8% of viewport width (smaller because further away) |
| **Viewport location** | 55% from left, 15% from top |
| **Relationship to sun** | Upper-right of sun. Far. The distance communicates "enhanced, evolved, beyond." |
| **Relationship to empty space** | Floats in upper space with significant empty sky around it. Feels solitary and elevated. Partially near the top edge — suggesting the universe extends beyond the frame. |
| **Relationship to camera** | Furthest planet from camera. Appears smallest. This makes it feel distant and mysterious. |

---

## SLX — The Energetic World

| Property | Value |
|----------|-------|
| **Visual importance** | #3 planet. The governance token. Energetic, vibrant. |
| **Viewport size** | 7-9% of viewport width |
| **Viewport location** | 35% from left, 72% from top |
| **Relationship to sun** | Lower-left of sun. Medium distance. |
| **Relationship to empty space** | Space between SLX and USX (above-left) creates a visual corridor. Space between SLX and the bottom edge gives breathing room. |
| **Relationship to camera** | Medium distance. Average apparent size. Not dominant, not insignificant. |

---

## stSLX — The Ancient World

| Property | Value |
|----------|-------|
| **Visual importance** | #4 planet. Staked SLX. Ancient, rare, premium. |
| **Viewport size** | 5-7% of viewport width (smallest planet — most distant) |
| **Viewport location** | 78% from left, 55% from top |
| **Relationship to sun** | Right of sun. Far. Isolated in the right side of the frame. |
| **Relationship to empty space** | The RIGHT SIDE of the viewport is relatively empty. stSLX is the only major object there. This isolation communicates "rare, remote, premium destination." The COMMS console (Milestone 3) will share this edge but stSLX must remain visible above/beside it. |
| **Relationship to camera** | Far. Appears small. The smallness reinforces "distant, hard to reach, valuable." |

---

## Stations

Stations are SMALLER than planets. They sit between orbital layers. They should be noticed AFTER all four planets.

| Station | Viewport location | Size | Character |
|---------|------------------|------|-----------|
| **Kamino** | 85% left, 28% top | 3-4% | Far right, upper. The largest station — industrial, prominent. Near stSLX's zone but not touching. |
| **Orca** | 12% left, 58% top | 2-3% | Far left. Elegant, solitary. The only object in the far-left zone. |
| **Raydium** | 65% left, 82% top | 2-3% | Lower-right. Trading frontier. Near the bottom edge. |
| **Loopscale** | 25% left, 18% top | 2-3% | Upper-left, between USX and eUSX. Research outpost. |
| **Exponent** | 50% left, 92% top | 2-3% | Bottom-center. Nearly at the frame edge. The furthest destination. |

---

## Moons

Moons orbit their parent. Their viewport position is ALWAYS relative to their parent planet. They never have independent viewport positions.

| Moon | Parent | Orbit direction | Size |
|------|--------|----------------|------|
| PT-USX | USX | Outward from sun (further from center) | 2-3% |
| PT-eUSX | eUSX | Outward from sun | 2% |
| PT-SLX | SLX | Outward from sun | 2% |
| PT-stSLX | stSLX | Outward from sun | 2% |

---

## Negative Space Map

```
0%                    50%                   100%
┌──────────────────────┬──────────────────────┐ 0%
│          ▣Loop       │    ○ eUSX            │
│                      │                      │
│  ◉ USX               │              ▣Kamino │
│      ◎               │                      │
│                  ✦ SUN                      │
│                      │           ◉ stSLX    │
│ ▣Orca                │              ◎       │
│          ◉ SLX       │                      │
│            ◎         │      ▣Raydium        │
│                 ▣Expo│                      │
└──────────────────────┴──────────────────────┘ 100%

Empty zones (negative space):
  - Between USX and eUSX (upper-center): OPEN SKY
  - Right of sun, above stSLX: BREATHING ROOM
  - Below sun, left of Raydium: REST AREA
  - Far left below Orca: DEEP SPACE

Occupied zones:
  - Upper-left: USX (hero)
  - Upper-right: eUSX (distant)
  - Center: SUN
  - Lower-left: SLX + Orca
  - Right: stSLX + Kamino

Balance: left side has more objects (USX + SLX + Orca + Loopscale)
         right side has fewer but stSLX + Kamino create weight
         Bottom-center is sparse (Exponent + Raydium at edges)

This is intentionally asymmetric. Not balanced = dynamic.
```

---

## Deriving World Coordinates

To convert viewport percentages to world coordinates, given:
- Camera at (0, 22, 32), looking at (0, 0, -2), FOV 52°
- Viewport: 1440 × 900

The visible field at z=0 (sun plane) is approximately:
- Width: ±18 units (36 total)
- Depth (z-axis, compressed by camera angle): ±16 units visible

Conversion:
```
viewport_x% → world_x = (viewport_x% - 48%) × 36 / 100
viewport_y% → world_z = (38% - viewport_y%) × 32 / 100  (inverted, compressed)
```

| Object | Viewport (x%, y%) | World (x, z) | World y | Radius |
|--------|:------------------:|:------------:|:-------:|:------:|
| Sun | 48%, 38% | (0, 0) | 0 | 0 |
| USX | 22%, 32% | (-9.4, 1.9) | 0.8 | 7.6 |
| eUSX | 55%, 15% | (2.5, 7.4) | 2.5 | 13.0 |
| SLX | 35%, 72% | (-4.7, -10.9) | -0.8 | 9.8 |
| stSLX | 78%, 55% | (10.8, -5.4) | -0.5 | 11.7 |
| Kamino | 85%, 28% | (13.3, 3.2) | 0.6 | 14.0 |
| Orca | 12%, 58% | (-13.0, -6.4) | 0.2 | 12.4 |
| Raydium | 65%, 82% | (6.1, -14.1) | -0.4 | 14.8 |
| Loopscale | 25%, 18% | (-8.3, 6.4) | -0.3 | 11.2 |
| Exponent | 50%, 92% | (0.7, -17.3) | 0.5 | 17.3 |

---

## Update to positions.ts

These derived coordinates replace the previous positions:

```typescript
PLANET_POSITIONS = {
  USX:   (-9.4,  0.8,  1.9)   // 22%, 32% — hero, close
  eUSX:  ( 2.5,  2.5,  7.4)   // 55%, 15% — far, elevated
  SLX:   (-4.7, -0.8, -10.9)  // 35%, 72% — medium, lower
  stSLX: (10.8, -0.5, -5.4)   // 78%, 55% — far right, isolated
}
```

Note: the z-axis is INVERTED relative to viewport y% because the camera looks toward negative z. Objects "higher" on screen (lower y%) have POSITIVE z in world space. Objects "lower" on screen (higher y%) have NEGATIVE z.

---

**This document is the source of truth. World coordinates in `positions.ts` must match these viewport percentages. If the camera changes, the world coordinates must be recalculated from viewport percentages, not the other way around.**

**Composition is locked. Milestone 2 may begin.**
