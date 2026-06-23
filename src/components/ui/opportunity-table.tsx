'use client';

import type { Opportunity, SortField } from '@/lib/types';
import { formatTvl, formatApy } from '@/lib/format';
import { ScoreBadge } from './score-badge';
import { RiskBadge } from './risk-badge';
import { StrategyBadge } from './strategy-badge';
import { CelestialBadge } from './celestial-badge';
import { useYieldStore } from '@/stores/yield-store';

export function OpportunityTable({ opportunities, onSelect }: {
  opportunities: Opportunity[];
  onSelect: (id: string) => void;
}) {
  const { sortField, sortOrder, setSort } = useYieldStore();

  const SortHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => {
    const active = sortField === field;
    const arrow = active ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : '';
    return (
      <th
        onClick={() => setSort(field)}
        className={`cursor-pointer select-none px-3 py-2 text-left text-xs font-medium text-zinc-500 hover:text-zinc-300 ${className ?? ''}`}
      >
        {children}{arrow}
      </th>
    );
  };

  if (opportunities.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.02] px-6 py-12 text-center text-zinc-500">
        No opportunities match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] border-b border-white/10">
          <tr>
            <SortHeader field="score" className="w-16">Score</SortHeader>
            <SortHeader field="risk_grade" className="w-14">Risk</SortHeader>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Opportunity</th>
            <SortHeader field="total_apy" className="text-right w-24">APY</SortHeader>
            <SortHeader field="tvl" className="text-right w-24 hidden sm:table-cell">TVL</SortHeader>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 hidden md:table-cell">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 hidden lg:table-cell">Strategy</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 hidden lg:table-cell">Protocol</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <tr
              key={opp.id}
              onClick={() => onSelect(opp.id)}
              className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
            >
              <td className="px-3 py-2.5">
                <ScoreBadge score={opp.score} />
              </td>
              <td className="px-3 py-2.5">
                <RiskBadge grade={opp.risk_grade} />
              </td>
              <td className="px-3 py-2.5">
                <div className="font-medium text-zinc-100">{opp.symbol}</div>
                <div className="text-xs text-zinc-500 hidden sm:block">{opp.source?.name ?? opp.source_id}</div>
              </td>
              <td className="px-3 py-2.5 text-right font-mono font-medium text-zinc-100">
                {formatApy(opp.total_apy)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-zinc-400 hidden sm:table-cell">
                {formatTvl(opp.tvl)}
              </td>
              <td className="px-3 py-2.5 hidden md:table-cell">
                <CelestialBadge type={opp.celestial_type} body={opp.celestial_body} />
              </td>
              <td className="px-3 py-2.5 hidden lg:table-cell">
                <StrategyBadge strategy={opp.strategy} />
              </td>
              <td className="px-3 py-2.5 text-zinc-400 hidden lg:table-cell">
                {opp.source?.name ?? opp.source_id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
