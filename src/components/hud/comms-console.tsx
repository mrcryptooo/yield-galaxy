'use client';

import { useJourneyStore } from '@/stores/journey-store';

export interface CommsSignal {
  title: string;
  value: string;
  tag: string;
  dimmed?: boolean;
}

export function CommsConsole({ signals }: { signals?: CommsSignal[] }) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  if (activeRoute) return null;

  const items = signals ?? [
    { title: 'Dock at USX', value: '1.33%', tag: 'NAV' },
    { title: 'Acquire PT-USX', value: '4.85%', tag: 'NAV' },
    { title: 'Harvest SLX', value: '405%', tag: 'NAV' },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '26%',
        right: '20px',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        zIndex: 10,
        pointerEvents: 'none',
        padding: '16px 18px',
        animation: 'fadeIn 0.8s ease-out',
      }}
    >
      <span className="hud-label" style={{ marginBottom: '2px' }}>
        Comms
      </span>

      {items.map((s, i) => (
        <Signal key={i} title={s.title} value={s.value} tag={s.tag} dimmed={s.dimmed} />
      ))}

      <div style={{
        width: '40px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(246,160,77,0.15))',
        margin: '2px 0',
      }} />

      <Signal title="Highest Yield" value="2m" tag="SIGNAL" dimmed />
      <Signal title="Compression" value="2m" tag="SIGNAL" dimmed />
    </div>
  );
}

function Signal({ title, value, tag, dimmed }: {
  title: string; value: string; tag: string; dimmed?: boolean;
}) {
  const opacity = dimmed ? 0.65 : 1;
  return (
    <div
      style={{
        textAlign: 'right',
        pointerEvents: 'auto',
        cursor: 'pointer',
        opacity,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 500, color: dimmed ? 'rgba(245,240,235,0.4)' : 'rgba(245,240,235,0.7)' }}>
          {title}
        </span>
        <span className="hud-glow" style={{
          fontSize: 'var(--fs-body)', fontWeight: 600, fontFamily: 'var(--font-geist-mono), monospace',
          color: dimmed ? 'rgba(246,160,77,0.4)' : 'rgba(246,160,77,0.9)',
        }}>
          {value}
        </span>
      </div>
      <span style={{
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.14em',
        color: 'rgba(246,160,77,0.3)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {tag}
      </span>
    </div>
  );
}
