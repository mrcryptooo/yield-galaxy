'use client';

import { useJourneyStore } from '@/stores/journey-store';
import type { PlanetInfo } from '@/components/galaxy/planet-data';
import { formatApy } from '@/lib/format';

export function JourneyHud({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const nextStep = useJourneyStore((s) => s.nextStep);
  const prevStep = useJourneyStore((s) => s.prevStep);
  const endJourney = useJourneyStore((s) => s.endJourney);

  if (!activeRoute) return null;

  const current = activeRoute.nodes[activeRoute.currentStep];
  const isFirst = activeRoute.currentStep === 0;
  const isLast = activeRoute.currentStep === activeRoute.nodes.length - 1;

  const planetInfo = planetData[current.celestialKey];
  const bestProtocol = planetInfo?.protocols[0];

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      right: '16px',
      zIndex: 15,
      pointerEvents: 'none',
      animation: 'fadeIn 0.6s ease-out',
    }}>
      {/* Route title */}
      <div style={{
        textAlign: 'right',
        marginBottom: '8px',
      }}>
        <span style={{
          fontSize: '7px',
          letterSpacing: '0.15em',
          color: 'rgba(246,160,77,0.3)',
          fontFamily: 'var(--font-geist-mono), monospace',
        }}>
          ROUTE
        </span>
        <div style={{
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '0.04em',
          color: 'rgba(246,160,77,0.6)',
          textShadow: '0 0 12px rgba(246,160,77,0.1)',
        }}>
          {activeRoute.template.name}
        </div>
      </div>

      {/* Current node info */}
      <div style={{
        textAlign: 'right',
        marginBottom: '10px',
        padding: '8px 0',
        borderTop: '1px solid rgba(246,160,77,0.06)',
      }}>
        <div style={{
          fontSize: '7px',
          letterSpacing: '0.12em',
          color: 'rgba(246,160,77,0.25)',
          fontFamily: 'var(--font-geist-mono), monospace',
          marginBottom: '3px',
        }}>
          STEP {activeRoute.currentStep + 1}/{activeRoute.nodes.length}
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 400,
          color: 'rgba(245,240,235,0.5)',
          letterSpacing: '0.03em',
          marginBottom: '4px',
        }}>
          {current.label}
        </div>

        {/* Protocol data from live layer */}
        {bestProtocol && (
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '4px',
          }}>
            <MiniStat label="APY" value={formatApy(bestProtocol.apy)} />
            <MiniStat label="TVL" value={bestProtocol.tvl} />
            <MiniStat label="RISK" value={bestProtocol.risk} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        pointerEvents: 'auto',
      }}>
        {!isFirst && (
          <button onClick={prevStep} style={navBtnStyle}>
            ← PREV
          </button>
        )}
        {!isLast && (
          <button onClick={nextStep} style={{ ...navBtnStyle, color: 'rgba(246,160,77,0.6)' }}>
            NEXT →
          </button>
        )}
        <button onClick={endJourney} style={{ ...navBtnStyle, color: 'rgba(245,240,235,0.2)' }}>
          ESC
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span style={{
        fontSize: '6px',
        letterSpacing: '0.12em',
        color: 'rgba(246,160,77,0.25)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {label}
      </span>
      {' '}
      <span style={{
        fontSize: '9px',
        fontWeight: 300,
        color: 'rgba(245,240,235,0.4)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {value}
      </span>
    </span>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(246,160,77,0.08)',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '8px',
  fontFamily: 'var(--font-geist-mono), monospace',
  letterSpacing: '0.1em',
  color: 'rgba(245,240,235,0.3)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};
