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

export function mapPool(pool: DefiLlamaPool): CelestialMapping {
  const symbol = pool.symbol.toUpperCase();
  const tokens = symbol.split('-').map((t) => t.trim());

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

  if (tokens.length >= 2) {
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
