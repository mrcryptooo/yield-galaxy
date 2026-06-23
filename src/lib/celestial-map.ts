import { SOURCE_DISPLAY_NAMES } from './constants';
import type { CelestialType, Strategy, ILRisk, DefiLlamaPool } from './types';

interface CelestialMapping {
  celestial_type: CelestialType;
  celestial_body: string;
  strategy: Strategy;
  il_risk: ILRisk;
}

const PLANET_ALIASES: Record<string, string> = {
  USX: 'USX',
  EUSX: 'eUSX',
  SLX: 'SLX',
  STSLX: 'stSLX',
};

function toPlanet(raw: string): string | null {
  return PLANET_ALIASES[raw.toUpperCase()] ?? null;
}

/**
 * Map a DefiLlama pool to its celestial identity.
 *
 * Priority:
 *   1. PT/YT symbol (any protocol) → moon
 *   2. Single Solstice token → planet (lending/staking/vault)
 *   3. LP pair with a Solstice token → planet (lp)
 *   4. Fallback → station
 */
export function mapPool(pool: DefiLlamaPool): CelestialMapping {
  const symbol = pool.symbol.toUpperCase();
  const tokens = symbol.split('-').map((t) => t.trim());

  // --- PT/YT detection (works across Kamino, Exponent, any protocol) ---
  // Matches: "PT-USX-16SEP26", "PT-EUSX-16SEP26", "YT-SLX-01MAR27"
  const ptMatch = symbol.match(/^(PT|YT)-(\w+)/);
  if (ptMatch) {
    const side = ptMatch[1] as 'PT' | 'YT';
    const underlying = toPlanet(ptMatch[2]);
    if (underlying) {
      return {
        celestial_type: 'moon',
        celestial_body: `${side}-${underlying}`,
        strategy: side === 'PT' ? 'pt' : 'yt',
        il_risk: 'none',
      };
    }
  }

  // --- Single-asset: lending, staking, vault ---
  if (tokens.length === 1) {
    const planet = toPlanet(tokens[0]);
    if (planet) {
      return {
        celestial_type: 'planet',
        celestial_body: planet,
        strategy: inferSingleStrategy(pool.project),
        il_risk: 'none',
      };
    }
  }

  // --- LP pair: classify under the Solstice token side ---
  if (tokens.length >= 2) {
    // Find the first Solstice token in the pair
    for (const t of tokens) {
      const planet = toPlanet(t);
      if (planet) {
        return {
          celestial_type: 'planet',
          celestial_body: planet,
          strategy: 'lp',
          il_risk: 'medium',
        };
      }
    }
  }

  // --- Fallback: station named after protocol ---
  const stationName = SOURCE_DISPLAY_NAMES[pool.project] ?? pool.project;
  return {
    celestial_type: 'station',
    celestial_body: stationName,
    strategy: tokens.length >= 2 ? 'lp' : 'vault',
    il_risk: tokens.length >= 2 ? 'medium' : 'none',
  };
}

function inferSingleStrategy(project: string): Strategy {
  if (project === 'kamino-lend' || project === 'loopscale') return 'lending';
  if (project === 'kamino-liquidity') return 'vault';
  return 'lending';
}
