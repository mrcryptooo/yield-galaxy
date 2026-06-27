'use client';

import Image from 'next/image';

export function Branding() {
  return (
    <div style={{
      position: 'fixed',
      top: '14px',
      left: '16px',
      zIndex: 20,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <Image
        src="/assets/branding/yield-galaxy-logo.png"
        alt="Yield Galaxy"
        width={120}
        height={120}
        style={{
          width: '28px', height: '28px', objectFit: 'contain',
          filter: 'drop-shadow(0 0 8px rgba(246,160,77,0.12))',
        }}
      />
      <div>
        <div style={{
          fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em',
          color: 'rgba(245,240,235,0.5)',
          textShadow: '0 0 12px rgba(246,160,77,0.08)',
          lineHeight: 1,
        }}>
          Yield Galaxy
        </div>
        <div style={{
          fontSize: '8px', fontWeight: 300, letterSpacing: '0.12em',
          color: 'rgba(245,240,235,0.18)',
          marginTop: '3px',
          fontFamily: 'var(--font-geist-mono), monospace',
          textTransform: 'uppercase',
        }}>
          Built on Solstice
        </div>
      </div>
    </div>
  );
}
