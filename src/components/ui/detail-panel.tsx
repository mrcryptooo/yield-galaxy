'use client';

import type { Opportunity } from '@/lib/types';
import { formatTvl, formatApy, formatDate } from '@/lib/format';
import { ScoreBadge } from './score-badge';
import { RiskBadge } from './risk-badge';
import { StrategyBadge } from './strategy-badge';
import { CelestialBadge } from './celestial-badge';
import { APYChart } from './apy-chart';
import { ShareButton } from './share-button';

export function DetailPanel({ opportunity, onClose }: {
  opportunity: Opportunity;
  onClose: () => void;
}) {
  const o = opportunity;
  const totalApyParts = [
    { label: 'Base', value: o.base_apy, color: 'bg-indigo-500' },
    { label: 'Reward', value: o.reward_apy, color: 'bg-purple-500' },
  ].filter((p) => p.value > 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-zinc-950 border-l border-white/10 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-white/10 px-5 py-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-zinc-100 truncate">{o.symbol}</h2>
            <p className="text-sm text-zinc-500">{o.source?.name ?? o.source_id} · {o.strategy}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Score + Risk + Type row */}
          <div className="flex items-center gap-3 flex-wrap">
            <ScoreBadge score={o.score} />
            <RiskBadge grade={o.risk_grade} />
            <CelestialBadge type={o.celestial_type} body={o.celestial_body} />
            <StrategyBadge strategy={o.strategy} />
          </div>

          {/* APY hero */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="text-xs text-zinc-500 mb-1">Total APY</div>
            <div className="text-3xl font-mono font-bold text-zinc-100">
              {formatApy(o.total_apy)}
            </div>

            {/* APY breakdown bar */}
            {totalApyParts.length > 0 && o.total_apy > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                  {totalApyParts.map((part) => (
                    <div
                      key={part.label}
                      className={`${part.color} opacity-70`}
                      style={{ width: `${(part.value / o.total_apy) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex gap-4 text-xs text-zinc-500">
                  {totalApyParts.map((part) => (
                    <span key={part.label}>
                      <span className={`inline-block w-2 h-2 rounded-full ${part.color} opacity-70 mr-1`} />
                      {part.label}: {formatApy(part.value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="TVL" value={formatTvl(o.tvl)} />
            <MetricCard label="IL Risk" value={o.il_risk === 'none' ? 'None' : o.il_risk.charAt(0).toUpperCase() + o.il_risk.slice(1)} />
            <MetricCard label="Token A" value={o.token_a} />
            <MetricCard label="Token B" value={o.token_b ?? '—'} />
          </div>

          {/* APY chart */}
          <div>
            <div className="text-xs text-zinc-500 mb-2">APY History (90d)</div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <APYChart poolId={o.id} />
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Chain</span>
              <span className="text-zinc-400">{o.chain}</span>
            </div>
            <div className="flex justify-between">
              <span>Pool ID</span>
              <span className="text-zinc-400 font-mono truncate ml-4 max-w-[200px]">{o.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span className="text-zinc-400">{formatDate(o.updated_at)}</span>
            </div>
            {o.pool_meta && (
              <div className="flex justify-between">
                <span>Market</span>
                <span className="text-zinc-400">{o.pool_meta}</span>
              </div>
            )}
          </div>

          {/* External link */}
          {o.pool_url && (
            <a
              href={o.pool_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg border border-indigo-500/30 text-indigo-400 text-sm font-medium hover:bg-indigo-500/10 transition-colors"
            >
              Open on {o.source?.name ?? o.source_id} ↗
            </a>
          )}

          {o.source?.url && !o.pool_url && (
            <a
              href={o.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg border border-white/10 text-zinc-400 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Go to {o.source.name} ↗
            </a>
          )}

          {/* Share */}
          <ShareButton opportunity={o} />
        </div>
      </div>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-sm font-medium text-zinc-200">{value}</div>
    </div>
  );
}
