'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useYieldStore } from '@/stores/yield-store';
import { QuickStats } from '@/components/ui/quick-stats';
import { FilterBar } from '@/components/ui/filter-bar';
import { OpportunityTable } from '@/components/ui/opportunity-table';
import { DetailPanel } from '@/components/ui/detail-panel';
import { ObservatoryLite } from '@/components/ui/observatory-lite';

const GalaxyScene = lazy(() =>
  import('@/components/galaxy/galaxy-scene').then((m) => ({ default: m.GalaxyScene }))
);

type ViewMode = 'galaxy' | 'list';

export default function Home() {
  const {
    opportunities, loading, error, lastUpdated,
    selectedId, setSelected, fetchYields,
  } = useYieldStore();

  const [viewMode, setViewMode] = useState<ViewMode>('galaxy');
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    fetchYields();
    const interval = setInterval(fetchYields, 60_000);
    return () => clearInterval(interval);
  }, [fetchYields]);

  // WebGL detection
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  const effectiveView = webglSupported ? viewMode : 'list';

  const selected = selectedId
    ? opportunities.find((o) => o.id === selectedId) ?? null
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-zinc-950/90 backdrop-blur z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg">✦</span>
            <h1 className="text-lg font-bold tracking-tight">Yield Galaxy</h1>
            <span className="text-xs text-zinc-500 hidden sm:inline">Solstice Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
              <button
                onClick={() => setViewMode('galaxy')}
                className={`px-3 py-1.5 transition-colors ${
                  effectiveView === 'galaxy'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                disabled={!webglSupported}
              >
                ✦ Galaxy
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 transition-colors ${
                  effectiveView === 'list'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ☰ List
              </button>
            </div>
            <div className="text-xs text-zinc-500">
              {loading ? (
                <span className="text-amber-400">Updating...</span>
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <span>{opportunities.length} opps</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {effectiveView === 'galaxy' ? (
        <GalaxyView
          opportunities={opportunities}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelected}
          lastUpdated={lastUpdated}
        />
      ) : (
        <ListView
          opportunities={opportunities}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={setSelected}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Detail drawer */}
      {selected && (
        <DetailPanel
          opportunity={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function GalaxyView({ opportunities, loading, selectedId, onSelect, lastUpdated }: {
  opportunities: import('@/lib/types').Opportunity[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  lastUpdated: string | null;
}) {
  if (loading && opportunities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050510]">
        <div className="text-center text-zinc-500">
          <div className="text-3xl mb-3 animate-pulse">✦</div>
          <div>Scanning the galaxy...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* Galaxy canvas */}
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-[#050510]">
            <div className="text-zinc-500 animate-pulse">✦ Loading galaxy...</div>
          </div>
        }
      >
        <GalaxyScene
          opportunities={opportunities}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </Suspense>

      {/* HUD overlay — bottom-left stats */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm">
        <div className="bg-zinc-950/80 backdrop-blur rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 space-y-1">
          <div className="flex gap-4">
            <span>{opportunities.length} opportunities</span>
            <span className="text-zinc-600">·</span>
            <span>{opportunities.filter(o => o.celestial_type === 'planet').length}P {opportunities.filter(o => o.celestial_type === 'moon').length}M {opportunities.filter(o => o.celestial_type === 'station').length}S</span>
          </div>
          <div className="text-zinc-600">Click a body to inspect · Esc to reset · Scroll to zoom</div>
        </div>
      </div>

      {/* HUD overlay — top-right quick stats */}
      <div className="absolute top-3 right-3 z-10">
        <MiniStats opportunities={opportunities} lastUpdated={lastUpdated} />
      </div>
    </div>
  );
}

function MiniStats({ opportunities, lastUpdated }: {
  opportunities: import('@/lib/types').Opportunity[];
  lastUpdated: string | null;
}) {
  if (opportunities.length === 0) return null;
  const totalTvl = opportunities.reduce((s, o) => s + o.tvl, 0);
  const best = opportunities.reduce((a, b) => a.score > b.score ? a : b);
  const fmt = (n: number) => n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + (n/1e3).toFixed(0) + 'K' : '$' + n;

  return (
    <div className="bg-zinc-950/80 backdrop-blur rounded-lg border border-white/10 px-3 py-2 text-xs space-y-0.5">
      <div className="text-zinc-400">TVL: <span className="text-zinc-200 font-mono">{fmt(totalTvl)}</span></div>
      <div className="text-zinc-400">Top: <span className="text-zinc-200 font-mono">{best.symbol}</span> <span className="text-indigo-400">({best.score})</span></div>
    </div>
  );
}

function ListView({ opportunities, loading, error, selectedId, onSelect, lastUpdated }: {
  opportunities: import('@/lib/types').Opportunity[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  lastUpdated: string | null;
}) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <QuickStats opportunities={opportunities} lastUpdated={lastUpdated} />
        <ObservatoryLite opportunities={opportunities} onSelect={(id) => onSelect(id)} />
        <FilterBar />
        {loading && opportunities.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-2xl mb-2">✦</div>
            <div>Scanning the galaxy...</div>
          </div>
        ) : (
          <OpportunityTable
            opportunities={opportunities}
            onSelect={(id) => onSelect(id)}
          />
        )}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            Failed to load data: {error}
          </div>
        )}
      </div>
    </main>
  );
}
