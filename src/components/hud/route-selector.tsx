'use client';

import { useJourneyStore } from '@/stores/journey-store';
import { ROUTE_TEMPLATES } from '@/lib/route-templates';

export function RouteSelector() {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const startJourney = useJourneyStore((s) => s.startJourney);

  if (activeRoute) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '16px',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '6px',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <span className="hud-label" style={{ marginBottom: '4px', marginRight: '2px' }}>
        ROUTES
      </span>

      {ROUTE_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => startJourney(template)}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px 0',
            textAlign: 'right',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            fontSize: '9px',
            fontWeight: 400,
            letterSpacing: '0.03em',
            color: 'rgba(245,240,235,0.35)',
            textShadow: '0 0 8px rgba(0,0,0,0.5)',
            transition: 'color 0.2s ease',
          }}>
            {template.name}
          </div>
          <div style={{
            fontSize: '7px',
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.1em',
            color: 'rgba(246,160,77,0.15)',
          }}>
            {template.steps.length} STEPS
          </div>
        </button>
      ))}
    </div>
  );
}
