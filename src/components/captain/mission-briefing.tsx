'use client';

import { useState, useMemo } from 'react';
import type { Opportunity } from '@/lib/types';
import { formatApy, formatTvl } from '@/lib/format';

interface Props {
  opportunities: Opportunity[];
  onSelect: (id: string) => void;
}

interface Route {
  name: string;
  description: string;
  opportunity: Opportunity;
  fuelYield: string;
  risk: string;
  eta: string;
}

export function MissionBriefing({ opportunities, onSelect }: Props) {
  const [index, setIndex] = useState(0);

  const routes = useMemo(() => {
    if (opportunities.length === 0) return [];
    const sorted = [...opportunities].sort((a, b) => b.score - a.score);
    const result: Route[] = [];

    const best = sorted[0];
    if (best) {
      result.push({
        name: `Explore ${best.celestial_body}`,
        description: `${best.symbol} @ ${best.source?.name ?? best.source_id}`,
        opportunity: best,
        fuelYield: formatApy(best.total_apy),
        risk: best.risk_grade === 'A' ? 'Low' : best.risk_grade === 'B' ? 'Low' : best.risk_grade === 'C' ? 'Medium' : 'High',
        eta: best.strategy === 'pt' ? '90 Days' : 'Flexible',
      });
    }

    const pt = sorted.find(o => o.strategy === 'pt');
    if (pt) {
      result.push({
        name: `Mission: ${pt.celestial_body}`,
        description: `Fixed rate @ ${pt.source?.name ?? pt.source_id}`,
        opportunity: pt,
        fuelYield: formatApy(pt.total_apy),
        risk: 'Low',
        eta: 'Sep 16, 2026',
      });
    }

    const highest = sorted.reduce((a, b) => a.total_apy > b.total_apy ? a : b);
    if (highest && highest.id !== best?.id) {
      result.push({
        name: `High Yield: ${highest.celestial_body}`,
        description: `${highest.symbol} @ ${highest.source?.name ?? highest.source_id}`,
        opportunity: highest,
        fuelYield: formatApy(highest.total_apy),
        risk: highest.tvl < 50000 ? 'High' : 'Medium',
        eta: 'Flexible',
      });
    }

    return result;
  }, [opportunities]);

  if (routes.length === 0) return null;

  const route = routes[index % routes.length];
  const typeIcon = route.opportunity.celestial_type === 'planet' ? '◉'
    : route.opportunity.celestial_type === 'moon' ? '◎' : '▣';

  return (
    <div className="glass" style={{ padding: '12px 16px', width: '260px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium tracking-widest" style={{ color: 'var(--solar)' }}>
          SUGGESTED DESTINATION
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {index + 1}/{routes.length}
        </span>
      </div>

      <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-warm)' }}>
        {typeIcon} {route.name}
      </div>
      <div className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
        {route.description}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Fuel Yield</div>
          <div className="text-sm font-mono font-medium" style={{ color: 'var(--solar)' }}>{route.fuelYield}</div>
        </div>
        <div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Risk</div>
          <div className="text-sm font-medium" style={{ color: route.risk === 'Low' ? '#4ade80' : route.risk === 'Medium' ? 'var(--solar)' : '#ef4444' }}>
            {route.risk}
          </div>
        </div>
        <div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>ETA</div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-warm)' }}>{route.eta}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSelect(route.opportunity.id)}
          className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors"
          style={{
            background: 'rgba(246,160,77,0.12)',
            color: 'var(--solar)',
            border: '1px solid rgba(246,160,77,0.25)',
          }}
        >
          View Route
        </button>
        {routes.length > 1 && (
          <button
            onClick={() => setIndex(i => i + 1)}
            className="px-3 text-xs py-1.5 rounded-lg transition-colors"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border-warm)',
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
