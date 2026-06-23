'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartPoint {
  date: string;
  apy: number;
}

export function APYChart({ poolId }: { poolId: string }) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/yields/${encodeURIComponent(poolId)}/history`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((json) => {
        const points: ChartPoint[] = (json.data ?? [])
          .slice(-90)
          .map((d: { timestamp: string; apy: number }) => ({
            date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            apy: Math.round(d.apy * 100) / 100,
          }));
        setData(points);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [poolId]);

  if (loading) {
    return <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">Loading chart...</div>;
  }

  if (error || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">No chart data available</div>;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#71717a' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#71717a' }}
            tickFormatter={(v: number) => `${v}%`}
            width={45}
          />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(v) => [`${v}%`, 'APY']}
          />
          <Area
            type="monotone"
            dataKey="apy"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#apyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
