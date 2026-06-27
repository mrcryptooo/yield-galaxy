'use client';

import { useViewStore } from '@/stores/view-store';

export function NavBar() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);

  return (
    <nav
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <button
        onClick={() => setMode('galaxy')}
        className={mode === 'galaxy' ? 'hud-label hud-glow' : 'hud-label'}
        style={{
          pointerEvents: 'auto', cursor: 'pointer', background: 'none', border: 'none',
          color: mode === 'galaxy' ? 'rgba(246,160,77,0.5)' : 'rgba(245,240,235,0.15)',
          fontSize: '10px', letterSpacing: '0.14em', fontWeight: 500,
          transition: 'color 0.3s ease',
        }}
      >
        Galaxy
      </button>

      <div style={{
        width: '20px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(246,160,77,0.15), transparent)',
      }} />

      <button
        onClick={() => setMode('list')}
        className={mode === 'list' ? 'hud-label hud-glow' : 'hud-label'}
        style={{
          pointerEvents: 'auto', cursor: 'pointer', background: 'none', border: 'none',
          color: mode === 'list' ? 'rgba(246,160,77,0.5)' : 'rgba(245,240,235,0.15)',
          fontSize: '10px', letterSpacing: '0.14em', fontWeight: 500,
          transition: 'color 0.3s ease',
        }}
      >
        List
      </button>
    </nav>
  );
}
