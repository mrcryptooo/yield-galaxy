'use client';

export interface CommsSignal {
  title: string;
  value: string;
  tag: string;
  dimmed?: boolean;
}

export function CommsConsole({ signals }: { signals?: CommsSignal[] }) {
  const items = signals ?? [
    { title: 'Dock at USX', value: '1.33%', tag: 'NAV' },
    { title: 'Acquire PT-USX', value: '4.85%', tag: 'NAV' },
    { title: 'Harvest SLX', value: '405%', tag: 'NAV' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <span className="hud-label" style={{ marginBottom: '2px', marginRight: '2px' }}>
        COMMS
      </span>

      {items.map((s, i) => (
        <Signal key={i} title={s.title} value={s.value} tag={s.tag} dimmed={s.dimmed} />
      ))}

      <div style={{
        width: '40px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(246,160,77,0.1))',
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
  const opacity = dimmed ? 0.6 : 1;
  return (
    <div
      style={{
        textAlign: 'right',
        pointerEvents: 'auto',
        cursor: 'pointer',
        opacity,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
        <span className="hud-title" style={{ color: dimmed ? 'rgba(245,240,235,0.25)' : 'rgba(245,240,235,0.4)' }}>
          {title}
        </span>
        <span className="hud-value hud-glow" style={{ color: dimmed ? 'rgba(246,160,77,0.2)' : 'rgba(246,160,77,0.4)' }}>
          {value}
        </span>
      </div>
      <span style={{
        fontSize: '7px',
        letterSpacing: '0.15em',
        color: 'rgba(246,160,77,0.15)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {tag}
      </span>
    </div>
  );
}
