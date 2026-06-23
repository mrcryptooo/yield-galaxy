'use client';

import type { Opportunity } from '@/lib/types';
import { generateInsights, type Insight } from '@/lib/insights';
import { useMemo } from 'react';

interface Props {
  opportunities: Opportunity[];
  onSelect: (id: string) => void;
}

const TYPE_STYLES: Record<string, string> = {
  best: 'border-indigo-500/20 bg-indigo-500/5',
  momentum: 'border-amber-500/20 bg-amber-500/5',
  alert: 'border-red-500/20 bg-red-500/5',
  tip: 'border-zinc-500/20 bg-zinc-500/5',
};

export function ObservatoryLite({ opportunities, onSelect }: Props) {
  const insights = useMemo(() => generateInsights(opportunities), [opportunities]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm">🔭</span>
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Observatory</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {insights.slice(0, 6).map((insight) => (
          <InsightCard key={insight.id} insight={insight} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight, onSelect }: { insight: Insight; onSelect: (id: string) => void }) {
  const style = TYPE_STYLES[insight.type] ?? TYPE_STYLES.tip;

  return (
    <button
      onClick={() => insight.opportunityId && onSelect(insight.opportunityId)}
      disabled={!insight.opportunityId}
      className={`text-left rounded-lg border px-3 py-2.5 transition-colors hover:brightness-110 disabled:cursor-default ${style}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{insight.icon}</span>
        <span className="text-xs font-semibold text-zinc-300">{insight.title}</span>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{insight.body}</p>
    </button>
  );
}
