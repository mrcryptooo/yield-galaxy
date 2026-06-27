/**
 * WORLD CINEMATOGRAPHY — FRAME-FIRST COMPOSITION
 *
 * Every position is chosen for how it reads IN THE FRAME,
 * not how it looks on a coordinate grid.
 *
 * Camera: (2, 20, 30) looking at (-1, -1, -3), FOV 50
 * At this angle, Z compresses ~60%. Objects further in Z appear
 * closer together vertically than objects spread in X.
 *
 * Frame composition:
 *   USX:   bottom-center-left — foreground anchor, largest, grounds the frame
 *   eUSX:  upper-right — background, creates diagonal with USX
 *   SLX:   far-left mid — secondary, creates width
 *   stSLX: right, slightly low — isolated, mystery
 *
 * Eye path (S-curve):
 *   Sun (center, brightest) → USX (large, below) → eUSX (distant, above-right)
 *   → SLX (left, energy) → stSLX (right, alone) → stations (scattered, discovered)
 *
 * Negative space:
 *   Lower-right is intentionally sparse — rest area
 *   Upper-left has only Loopscale — breathing room
 */

export const PLANET_POSITIONS = {
  USX: {
    // FOREGROUND ANCHOR: below sun, left-of-center.
    // Large, close to camera. Grounds the bottom of the frame.
    // The viewer's eye finds the sun, then drops to USX.
    pos: [-6, -4, 12] as [number, number, number],
    size: 0.92,
  },
  eUSX: {
    // BACKGROUND PEAK: high, right-of-center, very far.
    // Small in frame due to distance. Creates the primary diagonal with USX.
    // Partially near the upper frame edge — universe extends beyond.
    pos: [8, 6, -18] as [number, number, number],
    size: 0.68,
  },
  SLX: {
    // FAR LEFT: mid-height, creates width.
    // The energetic planet lives at the edge of the system.
    // Orbiting right reveals it fully; from default angle it's partially cut.
    pos: [-15, 1, -3] as [number, number, number],
    size: 0.60,
  },
  stSLX: {
    // RIGHT, SLIGHTLY LOW: isolated, ancient.
    // Nothing else near it. It owns the right side of the frame.
    // From default angle, it catches rim light differently than other planets.
    pos: [13, -3, -6] as [number, number, number],
    size: 0.53,
  },
} as const;

export const STATION_POSITIONS = {
  Kamino: {
    // BEHIND AND RIGHT of sun — discovered by orbiting right.
    // The largest station, industrial blue. Reward for exploration.
    pos: [10, 2, 10] as [number, number, number],
    size: 0.34,
  },
  Orca: {
    // FAR UPPER-LEFT — between SLX and the frame edge.
    // Elegant, solitary. A distant outpost.
    pos: [-12, 4, -10] as [number, number, number],
    size: 0.28,
  },
  Raydium: {
    // LOWER-RIGHT — occupies the negative space area.
    // Not too prominent (small, deep), but gives the bottom-right
    // something to discover when you orbit down.
    pos: [8, -5, -15] as [number, number, number],
    size: 0.28,
  },
  Loopscale: {
    // UPPER-LEFT — balances Kamino (upper-right behind sun).
    // Research outpost, violet glow.
    pos: [-8, 5, -14] as [number, number, number],
    size: 0.26,
  },
  Exponent: {
    // DEEPEST — bottom of the scene, barely visible from default.
    // Orbiting down or zooming out reveals it.
    pos: [0, -4, -22] as [number, number, number],
    size: 0.24,
  },
} as const;

export const MOON_ORBITS = {
  'PT-USX': {
    parent: 'USX' as const,
    orbitRadius: 2.0,
    orbitAngle: 4.0,
    orbitSpeed: 0.07,
    size: 0.14,
  },
  'PT-eUSX': {
    parent: 'eUSX' as const,
    orbitRadius: 1.5,
    orbitAngle: 1.2,
    orbitSpeed: 0.05,
    size: 0.10,
  },
  'PT-SLX': {
    parent: 'SLX' as const,
    orbitRadius: 1.5,
    orbitAngle: 5.0,
    orbitSpeed: 0.09,
    size: 0.09,
  },
  'PT-stSLX': {
    parent: 'stSLX' as const,
    orbitRadius: 1.3,
    orbitAngle: 2.2,
    orbitSpeed: 0.06,
    size: 0.09,
  },
} as const;

export const CAMERA = {
  position: [2, 20, 30] as [number, number, number],
  target: [-1, -1, -3] as [number, number, number],
  fov: 50,
} as const;
