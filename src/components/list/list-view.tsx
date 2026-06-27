'use client';

import { useState, useMemo } from 'react';
import type { Opportunity } from '@/lib/types';
import { SOURCE_DISPLAY_NAMES } from '@/lib/constants';
import { formatTvl, formatApy } from '@/lib/format';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useViewStore } from '@/stores/view-store';

type SortKey = 'score' | 'total_apy' | 'tvl' | 'risk_grade' | 'source_id';

const RISK_COLORS: Record<string, string> = {
  A: '#4ade80', B: '#a78bfa', C: '#F6A04D', D: '#fb923c', F: '#ef4444',
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
      background: 'rgba(10,14,26,0.92)',
      backdropFilter: 'blur(20px)',
      overflow: 'auto',
      padding: '60px 40px 40px',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 24px' }}>
        <h1 style={{
          fontSize: '20px', fontWeight: 400, letterSpacing: '0.06em',
          color: 'rgba(246,160,77,0.6)',
          margin: '0 0 4px',
        }}>
          Yield Opportunities
        </h1>
        <p style={{
          fontSize: '12px', fontWeight: 300, letterSpacing: '0.03em',
          color: 'rgba(245,240,235,0.3)', margin: 0,
        }}>
          {sorted.length} destinations across the Solstice ecosystem
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 120px 100px 80px 60px 60px 80px',
        gap: '12px', padding: '0 16px 8px',
        borderBottom: '1px solid rgba(246,160,77,0.06)',
      }}>
        {([
          ['Protocol', 'source_id'],
          ['Asset', null],
          ['TVL', 'tvl'],
          ['APY', 'total_apy'],
          ['Risk', 'risk_grade'],
          ['Score', 'score'],
          ['', null],
        ] as [string, SortKey | null][]).map(([label, key]) => (
          <button
            key={label || 'action'}
            onClick={() => key && toggleSort(key)}
            style={{
              background: 'none', border: 'none', padding: '4px 0',
              textAlign: key === 'tvl' || key === 'total_apy' || key === 'score' ? 'right' : 'left',
              fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em',
              fontFamily: 'var(--font-geist-mono), monospace',
              color: sortKey === key ? 'rgba(246,160,77,0.5)' : 'rgba(245,240,235,0.2)',
              cursor: key ? 'pointer' : 'default',
              textTransform: 'uppercase',
            }}
          >
            {label}{sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : ''}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {sorted.map((opp) => {
          const protocol = SOURCE_DISPLAY_NAMES[opp.source_id] ?? opp.source_id;
          return (
            <div
              key={opp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 80px 60px 60px 80px',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                margin: '2px 0',
                background: 'rgba(245,240,235,0.01)',
                border: '1px solid rgba(246,160,77,0.03)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
                cursor: 'default',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(246,160,77,0.04)';
                e.currentTarget.style.borderColor = 'rgba(246,160,77,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245,240,235,0.01)';
                e.currentTarget.style.borderColor = 'rgba(246,160,77,0.03)';
              }}
            >
              {/* Protocol */}
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em',
                  color: 'rgba(245,240,235,0.6)',
                }}>
                  {protocol}
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: 300, letterSpacing: '0.04em',
                  color: 'rgba(245,240,235,0.2)', marginTop: '2px',
                }}>
                  {opp.strategy} · {opp.celestial_body}
                </div>
              </div>

              {/* Asset */}
              <div style={{
                fontSize: '12px', fontWeight: 400, letterSpacing: '0.03em',
                color: 'rgba(245,240,235,0.45)',
              }}>
                {opp.symbol}
              </div>

              {/* TVL */}
              <div style={{
                fontSize: '13px', fontWeight: 400, textAlign: 'right',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'rgba(245,240,235,0.5)', letterSpacing: '0.02em',
              }}>
                {formatTvl(opp.tvl)}
              </div>

              {/* APY */}
              <div style={{
                fontSize: '14px', fontWeight: 500, textAlign: 'right',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: opp.total_apy > 10 ? 'rgba(246,160,77,0.7)' : 'rgba(245,240,235,0.5)',
                letterSpacing: '0.02em',
              }}>
                {formatApy(opp.total_apy)}
              </div>

              {/* Risk */}
              <div style={{
                fontSize: '12px', fontWeight: 500, textAlign: 'center',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: RISK_COLORS[opp.risk_grade] ?? 'rgba(245,240,235,0.3)',
              }}>
                {opp.risk_grade}
              </div>

              {/* Score */}
              <div style={{
                fontSize: '13px', fontWeight: 400, textAlign: 'right',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'rgba(246,160,77,0.4)',
              }}>
                {opp.score}
              </div>

              {/* Explore */}
              {opp.celestial_type === 'planet' ? (
                <button
                  onClick={() => explore(opp)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(246,160,77,0.1)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '9px', fontWeight: 400,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    letterSpacing: '0.08em',
                    color: 'rgba(246,160,77,0.4)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(246,160,77,0.3)';
                    e.currentTarget.style.color = 'rgba(246,160,77,0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(246,160,77,0.1)';
                    e.currentTarget.style.color = 'rgba(246,160,77,0.4)';
                  }}
                >
                  EXPLORE →
                </button>
              ) : (
                <span style={{
                  fontSize: '8px', color: 'rgba(245,240,235,0.12)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  textAlign: 'center',
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
