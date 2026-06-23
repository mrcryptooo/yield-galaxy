'use client';

const LABELS: Record<string, string> = {
  lending: 'Lending',
  lp: 'LP',
  staking: 'Staking',
  vault: 'Vault',
  pt: 'PT',
  yt: 'YT',
};

export function StrategyBadge({ strategy }: { strategy: string }) {
  return (
    <span className="inline-flex items-center h-6 px-2 rounded text-xs font-medium bg-white/5 text-zinc-400 border border-white/10">
      {LABELS[strategy] ?? strategy}
    </span>
  );
}
