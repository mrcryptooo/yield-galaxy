'use client';

import { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { useYieldStore } from '@/stores/yield-store';
import { DetailPanel } from '@/components/ui/detail-panel';
import { CaptainAvatar } from '@/components/captain/captain-avatar';
import { CaptainSpeech } from '@/components/captain/captain-speech';
import { MissionBriefing } from '@/components/captain/mission-briefing';
import { generateInsights } from '@/lib/insights';
import { QuickStats } from '@/components/ui/quick-stats';
import { FilterBar } from '@/components/ui/filter-bar';
import { OpportunityTable } from '@/components/ui/opportunity-table';
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
  const [showSpeech, setShowSpeech] = useState(true);
  const [captainMessage, setCaptainMessage] = useState('');

  useEffect(() => {
    fetchYields();
    const interval = setInterval(fetchYields, 60_000);
    return () => clearInterval(interval);
  }, [fetchYields]);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (!gl) setWebglSupported(false);
    } catch { setWebglSupported(false); }
  }, []);

  // Captain narration based on context
  useEffect(() => {
    if (opportunities.length === 0) return;
    const insights = generateInsights(opportunities);
    const best = insights.find(i => i.type === 'best');
    if (best) {
      setCaptainMessage(best.body);
      setShowSpeech(true);
    }
  }, [opportunities]);

  // Captain reacts to selections
  useEffect(() => {
    if (!selectedId || opportunities.length === 0) return;
    const opp = opportunities.find(o => o.id === selectedId);
    if (!opp) return;
    const protocol = opp.source?.name ?? opp.source_id;
    const typeWord = opp.celestial_type === 'moon' ? 'mission' : opp.celestial_type === 'station' ? 'station' : 'destination';
    setCaptainMessage(`${opp.symbol} at ${protocol} — ${typeWord} with ${opp.total_apy.toFixed(2)}% fuel yield and ${opp.risk_grade === 'A' ? 'low' : opp.risk_grade === 'B' ? 'low' : 'moderate'} hazard rating.`);
    setShowSpeech(true);
  }, [selectedId, opportunities]);

  const effectiveView = webglSupported ? viewMode : 'list';
  const selected = selectedId ? opportunities.find((o) => o.id === selectedId) ?? null : null;

  const handleDismissSpeech = useCallback(() => setShowSpeech(false), []);

  if (effectiveView === 'list') {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
        <header className="shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-warm)' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--solar)', fontSize: '18px' }}>✦</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-warm)' }}>Yield Galaxy</span>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle mode={effectiveView} onChange={setViewMode} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {loading ? 'Updating...' : `${opportunities.length} destinations`}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
            <QuickStats opportunities={opportunities} lastUpdated={lastUpdated} />
            <ObservatoryLite opportunities={opportunities} onSelect={(id) => setSelected(id)} />
            <FilterBar />
            {loading && opportunities.length === 0 ? (
              <LoadingState />
            ) : (
              <OpportunityTable opportunities={opportunities} onSelect={(id) => setSelected(id)} />
            )}
          </div>
        </main>
        {selected && <DetailPanel opportunity={selected} onClose={() => setSelected(null)} />}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: 'var(--bg)' }}>
      {/* Galaxy — 100% of viewport */}
      {loading && opportunities.length === 0 ? (
        <LoadingState />
      ) : (
        <Suspense fallback={<LoadingState />}>
          <GalaxyScene
            opportunities={opportunities}
            selectedId={selectedId}
            onSelect={setSelected}
          />
        </Suspense>
      )}

      {/* Logo watermark — top left */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 opacity-70">
        <span style={{ color: 'var(--solar)', fontSize: '16px' }}>✦</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-warm)' }}>Yield Galaxy</span>
      </div>

      {/* Captain Whiskers — bottom left */}
      {opportunities.length > 0 && (
        <div className="absolute bottom-20 left-4 z-20 flex flex-col items-start gap-2">
          {showSpeech && captainMessage && (
            <CaptainSpeech
              message={captainMessage}
              onDismiss={handleDismissSpeech}
              actions={!selectedId ? [{ label: 'Explore ▸', onClick: () => {
                const best = [...opportunities].sort((a, b) => b.score - a.score)[0];
                if (best) setSelected(best.id);
              }}] : undefined}
            />
          )}
          <CaptainAvatar
            size={52}
            onClick={() => { setShowSpeech(true); }}
          />
        </div>
      )}

      {/* Mission Briefing — bottom right */}
      {opportunities.length > 0 && !selectedId && (
        <div className="absolute bottom-20 right-4 z-20 hidden sm:block">
          <MissionBriefing
            opportunities={opportunities}
            onSelect={(id) => setSelected(id)}
          />
        </div>
      )}

      {/* HUD bar — bottom center */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          className="mx-auto max-w-lg flex items-center justify-center gap-4 px-4 py-2.5 rounded-t-xl"
          style={{
            background: 'rgba(10,14,26,0.7)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border-warm)',
            borderLeft: '1px solid var(--border-warm)',
            borderRight: '1px solid var(--border-warm)',
          }}
        >
          <ViewToggle mode={effectiveView} onChange={setViewMode} />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {opportunities.length} destinations
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>·</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
            Click to explore · ESC to reset
          </span>
        </div>
      </div>

      {/* Detail overlay */}
      {selected && (
        <DetailPanel
          opportunity={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {error && (
        <div className="absolute top-4 right-4 z-30 glass px-4 py-2 text-xs" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}
    </div>
  );
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-warm)' }}>
      <button
        onClick={() => onChange('galaxy')}
        className="px-3 py-1 text-[11px] transition-colors"
        style={{
          background: mode === 'galaxy' ? 'rgba(246,160,77,0.15)' : 'transparent',
          color: mode === 'galaxy' ? 'var(--solar)' : 'var(--text-muted)',
        }}
      >
        ✦ Galaxy
      </button>
      <button
        onClick={() => onChange('list')}
        className="px-3 py-1 text-[11px] transition-colors"
        style={{
          background: mode === 'list' ? 'rgba(246,160,77,0.15)' : 'transparent',
          color: mode === 'list' ? 'var(--solar)' : 'var(--text-muted)',
        }}
      >
        List
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 h-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-2xl mb-3 animate-pulse" style={{ color: 'var(--solar)' }}>✦</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Scanning the galaxy...</div>
      </div>
    </div>
  );
}
