'use client';

import { Html } from '@react-three/drei';
import type { Opportunity } from '@/lib/types';
import type { CelestialPosition } from '@/lib/celestial-positions';
import { formatApy } from '@/lib/format';
import { CELESTIAL_COLORS } from '@/lib/constants';

interface Props {
  opportunity: Opportunity;
  position: CelestialPosition;
  isSelected: boolean;
  isHovered: boolean;
}

export function CelestialLabel({ opportunity, position, isSelected, isHovered }: Props) {
  const visible = isSelected || isHovered;
  const colorKey = opportunity.celestial_body.startsWith('PT') ? 'PT'
    : opportunity.celestial_body.startsWith('YT') ? 'YT'
    : opportunity.celestial_body;
  const color = CELESTIAL_COLORS[colorKey] ?? '#6366f1';

  const typeIcon = opportunity.celestial_type === 'planet' ? '◉'
    : opportunity.celestial_type === 'moon' ? '◎' : '▣';

  return (
    <Html
      position={[position.x, position.y + position.size + 0.3, position.z]}
      center
      distanceFactor={12}
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex flex-col items-center gap-0.5 select-none">
        {/* Always visible: symbol */}
        <div
          className="text-[10px] font-bold tracking-wide whitespace-nowrap"
          style={{ color, textShadow: '0 0 8px rgba(0,0,0,0.8)' }}
        >
          {typeIcon} {opportunity.symbol}
        </div>

        {/* Always visible: APY */}
        <div
          className="text-[9px] font-mono whitespace-nowrap"
          style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}
        >
          {formatApy(opportunity.total_apy)}
        </div>

        {/* Hover/selected: expanded info */}
        {visible && (
          <div
            className="mt-1 px-2 py-1 rounded-md text-[9px] whitespace-nowrap"
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: `1px solid ${color}33`,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <span className="font-bold" style={{ color }}>
              {opportunity.score}
            </span>
            <span className="mx-1 opacity-50">·</span>
            <span>Risk {opportunity.risk_grade}</span>
            <span className="mx-1 opacity-50">·</span>
            <span>{opportunity.source?.name ?? opportunity.source_id}</span>
          </div>
        )}
      </div>
    </Html>
  );
}
