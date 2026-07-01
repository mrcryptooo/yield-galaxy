'use client';

import { lazy, Suspense, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell, TopBar, LeftPanel, CenterPanel, RightPanel, BottomPanel } from '@/components/hud/app-shell';
import { SolanaWalletProvider } from '@/components/providers/solana-wallet-provider';
import { CaptainPresence } from '@/components/hud/captain-presence';
import { CommsConsole } from '@/components/hud/comms-console';
import { TelemetryStrip } from '@/components/hud/telemetry-strip';
import { MissionPanel } from '@/components/hud/mission-panel';
import { RouteSelector } from '@/components/hud/route-selector';
import { PlanetInfoPanel } from '@/components/hud/planet-info-panel';
import { StationInfoPanel } from '@/components/hud/station-info-panel';
import { ListView } from '@/components/list/list-view';
import { useYields } from '@/hooks/use-yields';
import { buildPlanetData } from '@/lib/build-planet-data';
import { formatApy } from '@/lib/format';
import { FALLBACK_PLANET_DATA } from '@/components/galaxy/planet-data';
import { SOURCE_DISPLAY_NAMES } from '@/lib/constants';

const GalaxyScene = lazy(() =>
  import('@/components/galaxy/galaxy-scene').then((m) => ({ default: m.GalaxyScene }))
);

const queryClient = new QueryClient();

function HomeContent() {
  const { data: opportunities } = useYields();

  const planetData = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return FALLBACK_PLANET_DATA;
    return buildPlanetData(opportunities);
  }, [opportunities]);

  const destinationCount = opportunities?.length ?? 16;

  const commsSignals = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return undefined;
    const planets = opportunities
      .filter(o => o.celestial_type === 'planet')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return planets.map(o => ({
      title: `Dock at ${o.celestial_body}`,
      value: formatApy(o.total_apy),
      tag: 'NAV' as const,
    }));
  }, [opportunities]);

  const telemetryReadings = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return undefined;
    const best = opportunities.reduce((a, b) => a.total_apy > b.total_apy ? a : b);
    const safest = opportunities.filter(o => o.risk_grade === 'A')[0];
    const lowCount = opportunities.filter(o => o.total_apy < 0.5).length;
    return [
      { label: safest?.celestial_body ?? 'USX', value: `${safest?.score ?? 77} · ${safest?.risk_grade ?? 'A'}` },
      { label: best.symbol, value: formatApy(best.total_apy), accent: true },
      { label: 'POOLS', value: String(opportunities.length) },
      { label: 'SCAN', value: `${lowCount} < 0.5%` },
    ];
  }, [opportunities]);

  // Best current opportunity by composite score — Captain always has a
  // concrete recommendation ready as its default line, instead of a generic
  // status message with no actionable content.
  const bestOpportunitySummary = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return undefined;
    const best = opportunities.reduce((a, b) => (b.score > a.score ? b : a));
    const protocol = SOURCE_DISPLAY_NAMES[best.source_id] ?? best.source_id;
    return `${best.celestial_body} at ${protocol} leads right now at ${formatApy(best.total_apy)}.`;
  }, [opportunities]);

  return (
    <AppShell>
      <TopBar />

      <LeftPanel>
        <PlanetInfoPanel planetData={planetData} />
        <StationInfoPanel />
        <CaptainPresence destinationCount={destinationCount} bestOpportunitySummary={bestOpportunitySummary} planetData={planetData} />
      </LeftPanel>

      <CenterPanel>
        {/* GalaxyScene stays mounted at all times — switching to List View
            must never reload the world or reset the camera/focus state.
            ListView renders as an overlay on top of the (still-running)
            canvas, exactly like the previous full-viewport version, just
            now scoped to the center grid cell instead of the whole page. */}
        <Suspense
          fallback={
            <div style={{
              position: 'absolute', inset: 0, background: '#0A0E1A', borderRadius: 'var(--panel-radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src="/assets/captain/captain-holographic.webp"
                alt=""
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', opacity: 0.3 }}
              />
            </div>
          }
        >
          <GalaxyScene planetData={planetData} />
        </Suspense>

        <ListView opportunities={opportunities} />
      </CenterPanel>

      <RightPanel>
        <CommsConsole signals={commsSignals} />
        <RouteSelector opportunities={opportunities} />
        <TelemetryStrip readings={telemetryReadings} />
      </RightPanel>

      <BottomPanel>
        <MissionPanel planetData={planetData} opportunities={opportunities} />
      </BottomPanel>
    </AppShell>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        <HomeContent />
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
}
