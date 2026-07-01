import type { Opportunity } from './types';

// Real, verifiable external destinations for Explore actions. Presentation
// metadata only — does not touch the data/ingestion layer.
export const PROTOCOL_URLS: Record<string, string> = {
  Kamino: 'https://app.kamino.finance',
  Orca: 'https://www.orca.so',
  Raydium: 'https://raydium.io',
  Loopscale: 'https://app.loopscale.com',
  Exponent: 'https://www.exponent.finance',
};

// Solstice ecosystem tokens all resolve to the Solstice app — deep-linking to
// unconfirmed per-token paths would risk a broken/fake link.
export const SOLSTICE_APP_URL = 'https://app.solstice.finance';

export const PLANET_URLS: Record<string, string> = {
  USX: SOLSTICE_APP_URL,
  eUSX: SOLSTICE_APP_URL,
  SLX: SOLSTICE_APP_URL,
  stSLX: SOLSTICE_APP_URL,
};

export const SUN_URL = SOLSTICE_APP_URL;

export function getProtocolUrl(protocolName: string): string {
  return PROTOCOL_URLS[protocolName] ?? SOLSTICE_APP_URL;
}

export function getPlanetUrl(planet: string): string {
  return PLANET_URLS[planet] ?? SOLSTICE_APP_URL;
}

// Opportunity-level explore target: prefer the real per-pool URL from
// DefiLlama when present, otherwise fall back to the protocol's homepage.
export function getOpportunityUrl(opp: Opportunity, protocolName: string): string {
  return opp.pool_url || getProtocolUrl(protocolName);
}

export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
