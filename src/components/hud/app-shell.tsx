'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useViewStore } from '@/stores/view-store';

// Unified App Shell (Task 1): one persistent CSS Grid — top bar, left panel,
// center (galaxy owns this — no chrome), right panel, bottom mission panel.
// Every panel shares the exact same `.shell-panel` glass treatment so the
// whole HUD reads as one design system instead of independent floating
// windows. See globals.css `.app-shell` / `.shell-*` for the grid itself.
export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell">{children}</div>;
}

export function TopBar() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);

  return (
    <div className="shell-panel shell-top" style={{ gap: '24px' }}>
      {/* Logo + wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Image
          src="/assets/branding/yield-galaxy-logo.png"
          alt="Yield Galaxy"
          width={120}
          height={120}
          style={{
            width: '34px', height: '34px', objectFit: 'contain',
            filter: 'drop-shadow(0 0 14px rgba(246,160,77,0.35)) drop-shadow(0 0 4px rgba(246,160,77,0.5))',
          }}
        />
        <div>
          <div style={{
            fontSize: '15px', fontWeight: 600, letterSpacing: '0.03em',
            color: 'rgba(250,246,242,0.95)', lineHeight: 1.1,
          }}>
            Yield Galaxy
          </div>
          <div style={{
            fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em',
            color: 'rgba(246,160,77,0.6)', textTransform: 'uppercase', marginTop: '2px',
          }}>
            Yield Intelligence
          </div>
        </div>
      </div>

      {/* Galaxy / List switch */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '11px',
      }}>
        <button
          onClick={() => setMode('galaxy')}
          style={{
            cursor: 'pointer', border: 'none',
            background: mode === 'galaxy' ? 'rgba(246,160,77,0.14)' : 'none',
            borderRadius: '8px', padding: '8px 18px',
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
            cursor: 'pointer', border: 'none',
            background: mode === 'list' ? 'rgba(246,160,77,0.14)' : 'none',
            borderRadius: '8px', padding: '8px 18px',
            color: mode === 'list' ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.4)',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 'var(--fs-caption)', letterSpacing: '0.1em', fontWeight: 600,
            textTransform: 'uppercase',
            transition: 'color 0.25s ease, background 0.25s ease',
          }}
        >
          List
        </button>
      </div>

      {/* Reserved space for Wallet / Portfolio / Settings / Notifications —
          not built yet, intentionally left empty. */}
      <div style={{ flex: 1 }} />
    </div>
  );
}

export function LeftPanel({ children }: { children: ReactNode }) {
  return <div className="shell-panel shell-left no-scrollbar">{children}</div>;
}

export function CenterPanel({ children }: { children: ReactNode }) {
  return <div className="shell-center">{children}</div>;
}

export function RightPanel({ children }: { children: ReactNode }) {
  return <div className="shell-panel shell-right no-scrollbar">{children}</div>;
}

export function BottomPanel({ children }: { children: ReactNode }) {
  return <div className="shell-panel shell-bottom">{children}</div>;
}
