'use client';

import Image from 'next/image';

export function Branding() {
  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 20,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 20px 12px 14px',
        animation: 'fadeIn 0.8s ease-out',
      }}
    >
      <Image
        src="/assets/branding/yield-galaxy-logo.png"
        alt="Yield Galaxy"
        width={120}
        height={120}
        style={{
          width: '38px', height: '38px', objectFit: 'contain',
          filter: 'drop-shadow(0 0 14px rgba(246,160,77,0.35)) drop-shadow(0 0 4px rgba(246,160,77,0.5))',
          opacity: 0.98,
        }}
      />
      <div>
        <div style={{
          fontSize: '16px', fontWeight: 600, letterSpacing: '0.04em',
          color: 'rgba(250,246,242,0.95)',
          textShadow: '0 0 16px rgba(246,160,77,0.2)',
          lineHeight: 1.15,
        }}>
          Yield Galaxy
        </div>
        <div style={{
          fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.1em',
          color: 'rgba(246,160,77,0.65)',
          marginTop: '2px',
          textTransform: 'uppercase',
        }}>
          Yield Intelligence
        </div>
        <div style={{
          fontSize: '9px', fontWeight: 400, letterSpacing: '0.14em',
          color: 'rgba(245,240,235,0.4)',
          marginTop: '4px',
          fontFamily: 'var(--font-geist-mono), monospace',
          textTransform: 'uppercase',
        }}>
          Built on Solstice
        </div>
      </div>
    </div>
  );
}
