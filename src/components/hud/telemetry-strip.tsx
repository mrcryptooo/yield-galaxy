'use client';

import { useJourneyStore } from '@/stores/journey-store';

export interface TelemetryReading {
  label: string;
  value: string;
  accent?: boolean;
}

export function TelemetryStrip({ readings }: { readings?: TelemetryReading[] }) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  if (activeRoute) return null;

  const items = readings ?? [
    { label: 'USX', value: '77 · A' },
    { label: 'SLX-SOL', value: '405%', accent: true },
    { label: 'PT-USX', value: 'FIXED' },
    { label: 'SCAN', value: '6 < 0.5%' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {items.map((r, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {i > 0 && <Dot />}
          <Reading label={r.label} value={r.value} accent={r.accent} />
        </span>
      ))}
    </div>
  );
}

function Reading({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span style={{ pointerEvents: 'auto', cursor: 'default' }}>
      <span style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: '8px',
        letterSpacing: '0.12em',
        color: accent ? 'rgba(246,160,77,0.35)' : 'rgba(245,240,235,0.18)',
        textShadow: accent ? '0 0 6px rgba(246,160,77,0.1)' : 'none',
      }}>
        {label}
      </span>
      {' '}
      <span style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: '8px',
        fontWeight: 300,
        letterSpacing: '0.06em',
        color: 'rgba(245,240,235,0.22)',
      }}>
        {value}
      </span>
    </span>
  );
}

function Dot() {
  return (
    <span style={{
      width: '2px',
      height: '2px',
      borderRadius: '50%',
      background: 'rgba(246,160,77,0.15)',
      display: 'inline-block',
    }} />
  );
}
