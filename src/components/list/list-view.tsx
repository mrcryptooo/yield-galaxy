'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { Opportunity } from '@/lib/types';
import { SOURCE_DISPLAY_NAMES } from '@/lib/constants';
import { formatTvl, formatApy } from '@/lib/format';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useViewStore } from '@/stores/view-store';

type SortKey = 'score' | 'total_apy' | 'tvl' | 'risk_grade' | 'source_id';

const RISK_COLORS: Record<string, string> = {
  A: '#4ade80', B: '#a78bfa', C: '#F6A04D', D: '#fb923c', F: '#ef4444',
};

const PROTOCOL_LOGOS: Record<string, string> = {
  Kamino: '/assets/stations/kamino-station.webp',
  Loopscale: '/assets/stations/loopscale-station.png',
  Orca: '/assets/stations/orca-station.webp',
  Raydium: '/assets/stations/raydium-station.png',
  Exponent: '/assets/stations/exponent-station.png',
};

export function ListView({ opportunities }: { opportunities?: Opportunity[] }) {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  const setFocused = useGalaxyStore((s) => s.setFocused);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    if (!opportunities) return [];
    const items = [...opportunities];
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'score') cmp = a.score - b.score;
      else if (sortKey === 'total_apy') cmp = a.total_apy - b.total_apy;
      else if (sortKey === 'tvl') cmp = a.tvl - b.tvl;
      else if (sortKey === 'risk_grade') cmp = a.risk_grade.localeCompare(b.risk_grade);
      else if (sortKey === 'source_id') cmp = (SOURCE_DISPLAY_NAMES[a.source_id] ?? a.source_id).localeCompare(SOURCE_DISPLAY_NAMES[b.source_id] ?? b.source_id);
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [opportunities, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const explore = (opp: Opportunity) => {
    if (opp.celestial_type === 'planet') {
      const name = opp.celestial_body as 'USX' | 'eUSX' | 'SLX' | 'stSLX';
      setFocused(name);
      setMode('galaxy');
    }
  };

  if (mode !== 'list') return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 15,
      background: 'rgba(8,11,20,0.88)',
      backdropFilter: 'blur(24px)',
      overflow: 'auto',
      padding: '90px 40px 60px',
      animation: 'fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1180px', margin: '0 auto 28px' }}>
        <h1 style={{
          fontSize: 'var(--fs-hero)', fontWeight: 600, letterSpacing: '0.02em',
          color: 'rgba(246,160,77,0.9)',
          textShadow: '0 0 30px rgba(246,160,77,0.15)',
          margin: '0 0 6px',
        }}>
          Yield Opportunities
        </h1>
        <p style={{
          fontSize: 'var(--fs-body)', fontWeight: 400, letterSpacing: '0.01em',
          color: 'rgba(245,240,235,0.55)', margin: 0,
        }}>
          {sorted.length} destinations across the Solstice ecosystem
        </p>
      </div>

      {/* Sort controls */}
      <div className="glass-panel" style={{
        maxWidth: '1180px', margin: '0 auto 16px',
        display: 'flex', gap: '4px', padding: '8px 12px', width: 'fit-content',
      }}>
        {([
          ['Protocol', 'source_id'],
          ['TVL', 'tvl'],
          ['APY', 'total_apy'],
          ['Risk', 'risk_grade'],
          ['Score', 'score'],
        ] as [string, SortKey][]).map(([label, key]) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            style={{
              background: sortKey === key ? 'rgba(246,160,77,0.12)' : 'none',
              border: 'none', borderRadius: '8px', padding: '6px 14px',
              fontSize: 'var(--fs-caption)', fontWeight: 600, letterSpacing: '0.08em',
              fontFamily: 'var(--font-geist-mono), monospace',
              color: sortKey === key ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.45)',
              cursor: 'pointer', textTransform: 'uppercase',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            {label}{sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : ''}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{
        maxWidth: '1180px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '14px',
      }}>
        {sorted.map((opp) => {
          const protocol = SOURCE_DISPLAY_NAMES[opp.source_id] ?? opp.source_id;
          const logo = PROTOCOL_LOGOS[protocol];
          const riskColor = RISK_COLORS[opp.risk_grade] ?? 'rgba(245,240,235,0.3)';
          return (
            <div
              key={opp.id}
              className="glass-card"
              style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              {/* Top row: logo + protocol/asset + risk badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'rgba(246,160,77,0.06)', border: '1px solid rgba(246,160,77,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {logo ? (
                    <Image src={logo} alt={protocol} width={44} height={44} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(246,160,77,0.7)' }}>{protocol[0]}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--fs-body)', fontWeight: 600, letterSpacing: '0.01em',
                    color: 'rgba(250,246,242,0.92)',
                  }}>
                    {protocol}
                  </div>
                  <div style={{
                    fontSize: 'var(--fs-micro)', fontWeight: 500, letterSpacing: '0.04em',
                    color: 'rgba(245,240,235,0.45)', marginTop: '2px',
                  }}>
                    {opp.symbol}
                  </div>
                </div>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `${riskColor}22`, border: `1px solid ${riskColor}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: riskColor,
                  fontFamily: 'var(--font-geist-mono), monospace', flexShrink: 0,
                }}>
                  {opp.risk_grade}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <Stat label="TVL" value={formatTvl(opp.tvl)} />
                <Stat
                  label="APY"
                  value={formatApy(opp.total_apy)}
                  accent={opp.total_apy > 10}
                />
                <Stat label="SCORE" value={String(opp.score)} />
              </div>

              {/* Route preview */}
              <div style={{
                fontSize: 'var(--fs-caption)', fontWeight: 400, letterSpacing: '0.01em',
                color: 'rgba(245,240,235,0.4)',
                fontFamily: 'var(--font-geist-mono), monospace',
                paddingTop: '4px', borderTop: '1px solid rgba(246,160,77,0.08)',
              }}>
                {opp.celestial_body !== protocol ? `${opp.celestial_body} → ${protocol}` : protocol} · {opp.strategy}
              </div>

              {/* Explore */}
              {opp.celestial_type === 'planet' ? (
                <button
                  onClick={() => explore(opp)}
                  style={{
                    background: 'rgba(246,160,77,0.08)',
                    border: '1px solid rgba(246,160,77,0.22)',
                    borderRadius: '8px',
                    padding: '8px 0',
                    fontSize: 'var(--fs-caption)', fontWeight: 600,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    letterSpacing: '0.1em',
                    color: 'rgba(246,160,77,0.85)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(246,160,77,0.5)';
                    e.currentTarget.style.background = 'rgba(246,160,77,0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(246,160,77,0.22)';
                    e.currentTarget.style.background = 'rgba(246,160,77,0.08)';
                  }}
                >
                  EXPLORE →
                </button>
              ) : (
                <span style={{
                  fontSize: 'var(--fs-micro)', color: 'rgba(245,240,235,0.3)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {opp.celestial_type}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
        color: 'rgba(246,160,77,0.45)', fontFamily: 'var(--font-geist-mono), monospace',
        marginBottom: '2px', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--fs-value)', fontWeight: 600,
        color: accent ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.85)',
        fontFamily: 'var(--font-geist-mono), monospace',
        textShadow: accent ? '0 0 14px rgba(246,160,77,0.3)' : 'none',
      }}>
        {value}
      </div>
    </div>
  );
}
