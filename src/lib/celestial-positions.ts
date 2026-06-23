import type { Opportunity } from './types';

export interface CelestialPosition {
  x: number;
  y: number;
  z: number;
  size: number;
  emissive: number;
}

// Fixed positions for planets (inner ring, radius ~5)
const PLANET_POSITIONS: Record<string, [number, number, number]> = {
  USX:   [4.5, 0, 1.0],
  eUSX:  [-3.0, 0.3, 4.0],
  SLX:   [-4.0, -0.2, -3.5],
  stSLX: [2.0, 0.5, -5.0],
};

// Fixed positions for stations (outer ring, radius ~9)
const STATION_POSITIONS: Record<string, [number, number, number]> = {
  Kamino:    [8.0, 0.8, 3.0],
  Orca:      [-5.0, -0.5, 8.0],
  Raydium:   [-8.5, 0.3, -3.5],
  Loopscale: [3.0, -0.6, -8.5],
  Exponent:  [7.5, 0.4, -6.0],
};

// Moon offset from parent planet
const MOON_OFFSET_RADIUS = 1.6;

export function getPosition(opp: Opportunity, allOpps: Opportunity[]): CelestialPosition {
  const base = getBasePosition(opp, allOpps);
  const size = computeSize(opp.tvl, allOpps);
  const emissive = computeEmissive(opp.total_apy, allOpps);
  return { ...base, size, emissive };
}

function getBasePosition(opp: Opportunity, allOpps: Opportunity[]): { x: number; y: number; z: number } {
  if (opp.celestial_type === 'planet') {
    // If this is an LP or lending position under a planet, cluster near the planet
    const planetPos = PLANET_POSITIONS[opp.celestial_body];
    if (planetPos) {
      // Multiple opps may share the same planet body — offset by index
      const siblings = allOpps.filter(
        o => o.celestial_type === 'planet' && o.celestial_body === opp.celestial_body
      );
      const idx = siblings.findIndex(o => o.id === opp.id);
      if (idx <= 0) return { x: planetPos[0], y: planetPos[1], z: planetPos[2] };
      // Spiral outward from the planet center
      const angle = (idx / siblings.length) * Math.PI * 2;
      const r = 0.6 + idx * 0.25;
      return {
        x: planetPos[0] + Math.cos(angle) * r,
        y: planetPos[1] + (idx % 2 === 0 ? 0.2 : -0.2),
        z: planetPos[2] + Math.sin(angle) * r,
      };
    }
  }

  if (opp.celestial_type === 'moon') {
    // Position near the parent planet
    const parentToken = opp.celestial_body.replace(/^(PT|YT)-/, '');
    const parentPos = PLANET_POSITIONS[parentToken];
    if (parentPos) {
      const moons = allOpps.filter(o => o.celestial_type === 'moon' && o.celestial_body.includes(parentToken));
      const idx = moons.findIndex(o => o.id === opp.id);
      const angle = (idx / Math.max(moons.length, 1)) * Math.PI * 2 + Math.PI / 4;
      return {
        x: parentPos[0] + Math.cos(angle) * MOON_OFFSET_RADIUS,
        y: parentPos[1] + 0.5,
        z: parentPos[2] + Math.sin(angle) * MOON_OFFSET_RADIUS,
      };
    }
  }

  if (opp.celestial_type === 'station') {
    const stationPos = STATION_POSITIONS[opp.celestial_body];
    if (stationPos) return { x: stationPos[0], y: stationPos[1], z: stationPos[2] };
  }

  // Fallback: hash-based position
  const hash = simpleHash(opp.id);
  const angle = (hash % 360) * (Math.PI / 180);
  const r = 6 + (hash % 4);
  return { x: Math.cos(angle) * r, y: (hash % 3) * 0.3 - 0.3, z: Math.sin(angle) * r };
}

function computeSize(tvl: number, allOpps: Opportunity[]): number {
  const tvls = allOpps.map(o => o.tvl);
  const maxTvl = Math.max(...tvls, 1);
  const normalized = Math.log10(Math.max(tvl, 1000)) / Math.log10(Math.max(maxTvl, 1000));
  // Range: 0.15 (tiny) to 0.7 (largest)
  return 0.15 + normalized * 0.55;
}

function computeEmissive(apy: number, allOpps: Opportunity[]): number {
  const cappedApy = Math.min(apy, 100);
  const maxApy = Math.min(Math.max(...allOpps.map(o => o.total_apy), 1), 100);
  // Range: 0.2 (dim) to 2.0 (bright)
  return 0.2 + (cappedApy / maxApy) * 1.8;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
