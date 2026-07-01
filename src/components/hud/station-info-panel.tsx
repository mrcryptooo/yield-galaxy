'use client';

import { useGalaxyStore } from '@/stores/galaxy-store';

// Station Info lives inside the Left Panel — stations behave exactly like
// planets (click -> camera focus -> info here -> Captain explanation), just
// with different information. External links stay out of the galaxy
// entirely; there is no Explore button here on purpose (List View only).
const STATION_DETAILS: Record<string, { tagline: string; type: string; color: string }> = {
  Kamino: { tagline: 'Lending markets — deposit, borrow, and loop for leveraged yield.', type: 'Lending', color: '#6CB4EE' },
  Orca: { tagline: 'Liquidity pools and swaps. Higher reward, impermanent loss risk.', type: 'Liquidity', color: '#F5F0EB' },
  Raydium: { tagline: 'Concentrated liquidity and AMM pairs. Fast, efficient, volatile.', type: 'AMM', color: '#F6A04D' },
  Loopscale: { tagline: 'Structured lending with tighter risk controls.', type: 'Lending', color: '#C4B5E7' },
  Exponent: { tagline: 'Home of PT and YT markets — fixed yield or leveraged upside.', type: 'Yield Markets', color: '#EAB0BE' },
};

export function StationInfoPanel() {
  const focusedStation = useGalaxyStore((s) => s.focusedStation);
  if (!focusedStation) return null;

  const info = STATION_DETAILS[focusedStation];
  if (!info) return null;

  return (
    <div style={{ pointerEvents: 'auto', animation: 'fadeIn 0.4s ease-out', width: '100%' }}>
      <div style={{
        fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.03em',
        color: info.color,
        textShadow: `0 0 24px ${info.color}55`,
        marginBottom: '4px',
      }}>
        {focusedStation}
      </div>
      <div style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em',
        color: 'rgba(245,240,235,0.4)', textTransform: 'uppercase', marginBottom: '10px',
      }}>
        Station · {info.type}
      </div>
      <div className="hud-body" style={{ fontSize: '12.5px', color: 'rgba(245,240,235,0.65)' }}>
        {info.tagline}
      </div>
    </div>
  );
}
