'use client';

export function NavBar() {
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
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* NAV system indicator */}
      <span className="hud-label hud-glow" style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
        Galaxy
      </span>

      {/* Thin separator line */}
      <div style={{
        width: '20px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(246,160,77,0.15), transparent)',
      }} />

      <span className="hud-label" style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        color: 'rgba(245,240,235,0.15)',
      }}>
        List
      </span>
    </nav>
  );
}
