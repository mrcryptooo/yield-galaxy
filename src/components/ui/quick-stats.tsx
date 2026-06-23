'use client';

import type { Opportunity } from '@/lib/types';
import { formatTvl, formatApy, timeAgo } from '@/lib/format';

export function QuickStats({ opportunities, lastUpdated }: { opportunities: Opportunity[]; lastUpdated: string | null }) {
  if (opportunities.length === 0) return null;

  const totalTvl = opportunities.reduce((sum, o) => sum + o.tvl, 0);
  const avgApy = opportunities.reduce((sum, o) => sum + o.total_apy, 0) / opportunities.length;
  const best = opportunities.reduce((a, b) => a.total_apy > b.total_apy ? a : b);
  const planets = opportunities.filter(o => o.celestial_type === 'planet').length;
  const moons = opportunities.filter(o => o.celestial_type === 'moon').length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      <StatCard label="Opportunities" value={String(opportunities.length)} />
      <StatCard label="Total TVL" value={formatTvl(totalTvl)} />
      <StatCard label="Avg APY" value={formatApy(avgApy)} />
      <StatCard label="Best APY" value={formatApy(best.total_apy)} sub={best.symbol} />
      <StatCard
        label="Galaxy"
        value={`${planets}P · ${moons}M`}
        sub={lastUpdated ? timeAgo(lastUpdated) : undefined}
      />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-mono font-bold text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-500 truncate">{sub}</div>}
    </div>
  );
}
