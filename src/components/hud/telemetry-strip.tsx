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

  // Lives inside <RightRail> (safe layout system) — last child, so it
  // stacks below Comms/Routes in normal flow and can never overlap them.
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      pointerEvents: 'none',
      width: '100%',
      borderTop: '1px solid rgba(246,160,77,0.1)',
      paddingTop: '14px',
    }}>
      <span className="hud-label" style={{ marginBottom: '2px' }}>
        Telemetry
      </span>
      {items.map((r, i) => (
        <Reading key={i} label={r.label} value={r.value} accent={r.accent} />
      ))}
    </div>
  );
}

function Reading({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span style={{ pointerEvents: 'auto', cursor: 'default', textAlign: 'right' }}>
      <span style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 'var(--fs-micro)',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: accent ? 'rgba(246,160,77,0.55)' : 'rgba(245,240,235,0.4)',
        textShadow: accent ? '0 0 8px rgba(246,160,77,0.15)' : 'none',
      }}>
        {label}
      </span>
      {' '}
      <span style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 'var(--fs-caption)',
        fontWeight: 500,
        letterSpacing: '0.03em',
        color: 'rgba(245,240,235,0.6)',
      }}>
        {value}
      </span>
    </span>
  );
}
