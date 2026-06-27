import type { Opportunity } from './types';
import type { PlanetInfo, Protocol } from '@/components/galaxy/planet-data';
import { SOURCE_DISPLAY_NAMES } from './constants';
import { formatTvl, formatApy, timeAgo } from './format';

const PLANET_DESCRIPTIONS: Record<string, string> = {
  USX: 'The stablecoin at the heart of Solstice. Overcollateralized, reliable, the foundation of every journey.',
  eUSX: 'Enhanced USX. Delta-neutral yield from funding rate arbitrage. Yields move inverse to stSLX.',
  SLX: 'The governance token of Solstice. High energy, high volatility. The pulse of the ecosystem.',
  stSLX: 'Staked SLX. Ancient, patient. Yields run inverse to eUSX. The long game.',
};

export function buildPlanetData(opportunities: Opportunity[]): Record<string, PlanetInfo> {
  const planets: Record<string, PlanetInfo> = {};
  const planetPools = opportunities.filter(o => o.celestial_type === 'planet');

  const grouped: Record<string, Opportunity[]> = {};
  for (const pool of planetPools) {
    const body = pool.celestial_body;
    if (!grouped[body]) grouped[body] = [];
    grouped[body].push(pool);
  }

  for (const [body, pools] of Object.entries(grouped)) {
    const totalTvl = pools.reduce((s, o) => s + o.tvl, 0);
    const bestApy = Math.max(...pools.map(o => o.total_apy));
    const uniqueProtocols = new Set(pools.map(o => SOURCE_DISPLAY_NAMES[o.source_id] ?? o.source_id));

    const protocols: Protocol[] = pools.slice(0, 6).map((o) => ({
      id: o.id,
      name: SOURCE_DISPLAY_NAMES[o.source_id] ?? o.source?.name ?? o.source_id,
      apy: o.total_apy,
      tvl: formatTvl(o.tvl),
      risk: o.risk_grade,
      type: o.strategy.charAt(0).toUpperCase() + o.strategy.slice(1),
      depositApy: o.base_apy,
      borrowApy: o.reward_apy,
      updated: timeAgo(o.updated_at),
    }));

    planets[body] = {
      name: body,
      description: PLANET_DESCRIPTIONS[body] ?? `${body} — a celestial body in the Solstice galaxy.`,
      tvl: formatTvl(totalTvl),
      avgApy: formatApy(bestApy),
      protocolCount: uniqueProtocols.size,
      protocols,
    };
  }

  return planets;
}
