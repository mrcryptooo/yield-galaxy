'use client';

const TYPE_STYLES: Record<string, string> = {
  planet: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  moon: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  station: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  planet: '◉',
  moon: '◎',
  station: '▣',
};

export function CelestialBadge({ type, body }: { type: string; body: string }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.station;
  const icon = TYPE_ICONS[type] ?? '·';
  return (
    <span className={`inline-flex items-center gap-1 h-6 px-2 rounded text-xs font-medium border ${style}`}>
      {icon} {body}
    </span>
  );
}
