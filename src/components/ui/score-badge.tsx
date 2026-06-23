'use client';

export function ScoreBadge({ score }: { score: number }) {
  const bg =
    score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
    score >= 60 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    score >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
    'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md border text-sm font-mono font-bold ${bg}`}>
      {score}
    </span>
  );
}
