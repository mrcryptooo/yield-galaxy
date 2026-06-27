'use client';

import { lazy, Suspense, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VisorLayer } from '@/components/hud/visor-layer';
import { NavBar } from '@/components/hud/nav-bar';
import { CaptainPresence } from '@/components/hud/captain-presence';
import { CommsConsole } from '@/components/hud/comms-console';
import { TelemetryStrip } from '@/components/hud/telemetry-strip';
import { JourneyHud } from '@/components/hud/journey-hud';
import { RouteSelector } from '@/components/hud/route-selector';
import { useYields } from '@/hooks/use-yields';
import { buildPlanetData } from '@/lib/build-planet-data';
import { formatApy } from '@/lib/format';
import { FALLBACK_PLANET_DATA } from '@/components/galaxy/planet-data';

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

  return (
    <>
      <Suspense
        fallback={
          <div style={{
            position: 'fixed', inset: 0, background: '#0A0E1A',
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

      <VisorLayer>
        <NavBar />
        <CaptainPresence destinationCount={destinationCount} />
        <CommsConsole signals={commsSignals} />
        <TelemetryStrip readings={telemetryReadings} />
        <RouteSelector />
        <JourneyHud planetData={planetData} />
      </VisorLayer>
    </>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
