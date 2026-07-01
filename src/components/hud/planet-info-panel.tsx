'use client';

import { useGalaxyStore } from '@/stores/galaxy-store';
import { useViewStore } from '@/stores/view-store';
import type { PlanetInfo } from '@/components/galaxy/planet-data';

// Planet Info lives inside <LeftRail> (safe layout system) — previously a
// 3D-world-positioned Html card next to the planet, which was a source of
// unpredictable screen-space overlap with the 2D HUD rails. Explore here is
// in-app only (View List); external links exist ONLY in List View, per the
// galaxy click-behavior contract (click -> focus -> details -> Captain, never
// a website).
export function PlanetInfoPanel({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  const focused = useGalaxyStore((s) => s.focused);
  const setMode = useViewStore((s) => s.setMode);

  if (!focused) return null;
  const data = planetData[focused];
  if (!data) return null;

  return (
    <div style={{ pointerEvents: 'auto', animation: 'fadeIn var(--dur-base) var(--ease-premium) both', width: '100%' }}>
      <div style={{
        fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.03em',
        color: 'rgba(246,160,77,0.95)',
        textShadow: '0 0 24px rgba(246,160,77,0.3)',
        marginBottom: '6px',
      }}>
        {data.name}
      </div>

      <div className="hud-body" style={{
        fontSize: '12.5px', marginBottom: '12px', color: 'rgba(245,240,235,0.65)',
      }}>
        {data.description}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        <StatLine label="TVL" value={data.tvl} />
        <StatLine label="APY" value={data.avgApy} accent />
        <StatLine label="PROTOCOLS" value={String(data.protocolCount)} />
      </div>

      <button
        onClick={() => setMode('list')}
        style={{
          width: '100%', cursor: 'pointer',
          background: 'rgba(246,160,77,0.1)',
          border: '1px solid rgba(246,160,77,0.3)',
          borderRadius: '8px', padding: '7px 0',
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
          color: 'rgba(246,160,77,0.9)',
          transition: 'background var(--dur-fast) var(--ease-premium), border-color var(--dur-fast) var(--ease-premium)',
        }}
      >
        VIEW OPPORTUNITIES
      </button>
    </div>
  );
}

function StatLine({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontSize: '10px', letterSpacing: '0.14em', fontWeight: 600,
        color: 'rgba(246,160,77,0.45)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '15px', fontWeight: 500, letterSpacing: '0.01em',
        color: accent ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.85)',
        fontFamily: 'var(--font-geist-mono), monospace',
        textShadow: accent ? '0 0 14px rgba(246,160,77,0.3)' : 'none',
      }}>
        {value}
      </span>
    </div>
  );
}
