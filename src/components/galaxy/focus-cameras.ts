/**
 * Handcrafted camera positions for each planet's Focus Mode.
 * Each planet has a unique cinematic viewpoint.
 * DO NOT calculate these automatically.
 */

export const FOCUS_CAMERAS: Record<string, {
  position: [number, number, number];
  target: [number, number, number];
}> = {
  USX: {
    // Close, slightly above and right — hero world fills 40% of frame
    position: [-3, -1, 15],
    target: [-6, -4, 12],
  },
  eUSX: {
    // Approach from below-left — the distant world looms above
    position: [5, 3, -13],
    target: [8, 6, -18],
  },
  SLX: {
    // Side approach — the energetic world pulses to the right
    position: [-12, 2, 0],
    target: [-15, 1, -3],
  },
  stSLX: {
    // Low approach — the ancient world rises above the viewer
    position: [11, -1, -2],
    target: [13, -3, -6],
  },
};

export const CAPTAIN_LINES: Record<string, string> = {
  USX: 'USX — the heart of Solstice. Stable, reliable, where most journeys begin.',
  eUSX: 'Enhanced USX. Deeper yields, longer horizons. Not for the impatient.',
  SLX: 'SLX burns bright. High energy, high reward. Approach with respect.',
  stSLX: 'Staked SLX. Ancient, patient. The slow path to something permanent.',
};
