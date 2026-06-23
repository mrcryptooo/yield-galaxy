'use client';

const COLORS: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  B: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  C: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  F: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function RiskBadge({ grade }: { grade: string }) {
  const color = COLORS[grade] ?? COLORS.C;
  return (
    <span className={`inline-flex items-center justify-center w-8 h-7 rounded-md border text-sm font-mono font-bold ${color}`}>
      {grade}
    </span>
  );
}
