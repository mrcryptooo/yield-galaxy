'use client';

import { useViewStore } from '@/stores/view-store';

export function NavBar() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);

  return (
    <nav
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 20,
        pointerEvents: 'none',
        padding: '6px',
        animation: 'fadeIn 0.8s ease-out',
      }}
    >
      <button
        onClick={() => setMode('galaxy')}
        style={{
          pointerEvents: 'auto', cursor: 'pointer', border: 'none',
          background: mode === 'galaxy' ? 'rgba(246,160,77,0.14)' : 'none',
          borderRadius: '9px', padding: '8px 20px',
          color: mode === 'galaxy' ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.4)',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'var(--fs-caption)', letterSpacing: '0.1em', fontWeight: 600,
          textTransform: 'uppercase',
          transition: 'color 0.25s ease, background 0.25s ease',
        }}
      >
        Galaxy
      </button>

      <button
        onClick={() => setMode('list')}
        style={{
          pointerEvents: 'auto', cursor: 'pointer', border: 'none',
          background: mode === 'list' ? 'rgba(246,160,77,0.14)' : 'none',
          borderRadius: '9px', padding: '8px 20px',
          color: mode === 'list' ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.4)',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 'var(--fs-caption)', letterSpacing: '0.1em', fontWeight: 600,
          textTransform: 'uppercase',
          transition: 'color 0.25s ease, background 0.25s ease',
        }}
      >
        List
      </button>
    </nav>
  );
}
