'use client';

import { Html } from '@react-three/drei';
import type { Opportunity } from '@/lib/types';
import type { CelestialPosition } from '@/lib/celestial-positions';
import { formatApy, formatTvl } from '@/lib/format';
import { CELESTIAL_COLORS } from '@/lib/constants';

interface Props {
  opportunity: Opportunity;
  position: CelestialPosition;
  isSelected: boolean;
  isHovered: boolean;
}

export function CelestialLabel({ opportunity, position, isSelected, isHovered }: Props) {
  const o = opportunity;
  const colorKey = o.celestial_body.startsWith('PT') ? 'PT'
    : o.celestial_body.startsWith('YT') ? 'YT'
    : o.celestial_body;
  const color = CELESTIAL_COLORS[colorKey] ?? '#F6A04D';
  const typeIcon = o.celestial_type === 'planet' ? '◉' : o.celestial_type === 'moon' ? '◎' : '▣';
  const expanded = isSelected || isHovered;
  const cta = o.celestial_type === 'moon' ? 'Begin Mission' : 'Explore';

  return (
    <Html
      position={[position.x, position.y + position.size + 0.35, position.z]}
      center
      distanceFactor={12}
      style={{ pointerEvents: expanded ? 'auto' : 'none' }}
    >
      <div
        className="flex flex-col items-center gap-0.5 select-none transition-all duration-200"
        style={{ transform: expanded ? 'scale(1.05)' : 'scale(1)' }}
      >
        {/* Minimal label — always visible */}
        {!expanded && (
          <div className="text-center" style={{ textShadow: '0 0 12px rgba(0,0,0,0.9)' }}>
            <div className="text-[10px] font-medium whitespace-nowrap" style={{ color }}>
              {typeIcon} {o.symbol}
            </div>
            <div className="text-[8px] font-mono whitespace-nowrap" style={{ color: 'rgba(245,240,235,0.6)' }}>
              {formatTvl(o.tvl)} · {formatApy(o.total_apy)}
            </div>
          </div>
        )}

        {/* Expanded destination card — on hover/select */}
        {expanded && (
          <div
            className="rounded-xl p-3 min-w-[180px]"
            style={{
              background: 'rgba(10,14,26,0.82)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${color}33`,
              boxShadow: `0 0 20px ${color}15`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs" style={{ color }}>{typeIcon}</span>
              <span className="text-xs font-medium" style={{ color: '#F5F0EB' }}>{o.symbol}</span>
            </div>
            <div className="text-[10px] mb-2" style={{ color: '#8B8591' }}>
              {o.source?.name ?? o.source_id} · {o.strategy}
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span style={{ color: '#8B8591' }}>Fuel Yield</span>
                <span className="font-mono font-medium" style={{ color }}>{formatApy(o.total_apy)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#8B8591' }}>Mass</span>
                <span className="font-mono" style={{ color: '#F5F0EB' }}>{formatTvl(o.tvl)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#8B8591' }}>Score</span>
                <span className="font-mono" style={{ color }}>{o.score}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#8B8591' }}>Risk</span>
                <span className="font-medium" style={{ color: o.risk_grade === 'A' ? '#4ade80' : o.risk_grade === 'B' ? '#D3C7E7' : color }}>
                  {o.risk_grade}
                </span>
              </div>
            </div>
            {isHovered && !isSelected && (
              <div
                className="mt-2 text-center text-[10px] py-1 rounded-lg font-medium"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  color,
                }}
              >
                {cta} ▸
              </div>
            )}
          </div>
        )}
      </div>
    </Html>
  );
}
