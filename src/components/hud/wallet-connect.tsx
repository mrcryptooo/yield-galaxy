'use client';

import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWalletStore } from '@/stores/wallet-store';

const SUPPORTED_WALLETS = ['Phantom', 'Backpack', 'Solflare'] as const;

const WALLET_COLORS: Record<string, string> = {
  Phantom: '#AB9FF2',
  Backpack: '#E33D3D',
  Solflare: '#FFC10B',
};

function shortAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Top Bar wallet control — the reserved space in app-shell.tsx's TopBar.
// Disconnected: a single "Connect Wallet" trigger opening a small menu of
// the three supported wallets. Connected: icon + name + short address +
// a stablecoin-only portfolio figure (USDC/USDT, both ~$1 — there's no
// price oracle here, so this intentionally does not claim to price SOL or
// the Solstice tokens) + a live connection-status dot.
export function WalletConnect() {
  const { wallets } = useWallet();
  const connected = useWalletStore((s) => s.connected);
  const connecting = useWalletStore((s) => s.connecting);
  const walletName = useWalletStore((s) => s.walletName);
  const publicKey = useWalletStore((s) => s.publicKey);
  const tokens = useWalletStore((s) => s.tokens);
  const loading = useWalletStore((s) => s.loading);
  const error = useWalletStore((s) => s.error);
  const connect = useWalletStore((s) => s.connect);
  const disconnect = useWalletStore((s) => s.disconnect);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const detected = new Map<string, WalletReadyState>(wallets.map((w) => [w.adapter.name, w.readyState]));
  const stableValue = tokens
    .filter((t) => t.symbol === 'USDC' || t.symbol === 'USDT')
    .reduce((sum, t) => sum + t.amount, 0);

  if (connected && publicKey) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: loading ? 'rgba(246,160,77,0.6)' : 'rgba(120,220,150,0.85)',
          boxShadow: loading ? '0 0 8px rgba(246,160,77,0.5)' : '0 0 8px rgba(120,220,150,0.5)',
          animation: loading ? 'missionPulse 1.2s ease-in-out infinite' : undefined,
        }} />
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
          background: WALLET_COLORS[walletName ?? ''] ?? 'rgba(245,240,235,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: '#0A0E1A',
        }}>
          {walletName?.[0] ?? 'W'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(245,240,235,0.85)', letterSpacing: '0.02em' }}>
            {walletName} · {shortAddress(publicKey)}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(246,160,77,0.55)', letterSpacing: '0.06em' }}>
            ${stableValue.toFixed(2)} portfolio
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          style={{
            background: 'none', border: '1px solid rgba(245,240,235,0.12)',
            borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
            fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.08em', color: 'rgba(245,240,235,0.4)',
          }}
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        disabled={connecting}
        style={{
          background: 'rgba(246,160,77,0.1)', border: '1px solid rgba(246,160,77,0.28)',
          borderRadius: '8px', padding: '8px 16px', cursor: connecting ? 'default' : 'pointer',
          fontSize: 'var(--fs-caption)', fontWeight: 600,
          fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.08em',
          color: 'rgba(246,160,77,0.9)', opacity: connecting ? 0.6 : 1,
        }}
      >
        {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
      </button>

      {menuOpen && (
        <div className="glass-panel" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '180px',
          padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px',
          animation: 'fadeIn var(--dur-fast) var(--ease-premium) both', zIndex: 10,
        }}>
          {SUPPORTED_WALLETS.map((name) => {
            const readyState = detected.get(name);
            const installed = readyState === WalletReadyState.Installed;
            return (
              <button
                key={name}
                onClick={() => { setMenuOpen(false); connect(name); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'none', border: 'none', borderRadius: '6px',
                  padding: '8px 10px', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(246,160,77,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                  background: WALLET_COLORS[name], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 700, color: '#0A0E1A',
                }}>
                  {name[0]}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(245,240,235,0.85)', flex: 1 }}>{name}</span>
                <span style={{ fontSize: '9px', fontWeight: 500, color: installed ? 'rgba(120,220,150,0.7)' : 'rgba(245,240,235,0.3)' }}>
                  {installed ? 'Detected' : 'Not installed'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '200px',
          fontSize: '10px', color: 'rgba(246,160,77,0.8)', padding: '6px 10px',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
