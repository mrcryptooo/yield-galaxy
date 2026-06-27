'use client';

import { lazy, Suspense } from 'react';
import { VisorLayer } from '@/components/hud/visor-layer';
import { NavBar } from '@/components/hud/nav-bar';
import { CaptainPresence } from '@/components/hud/captain-presence';
import { CommsConsole } from '@/components/hud/comms-console';
import { TelemetryStrip } from '@/components/hud/telemetry-strip';

const GalaxyScene = lazy(() =>
  import('@/components/galaxy/galaxy-scene').then((m) => ({ default: m.GalaxyScene }))
);

export default function Home() {
  return (
    <>
      {/* THE WORLD */}
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
        <GalaxyScene />
      </Suspense>

      {/* THE VISOR — HUD elements float inside the world, moving with the camera */}
      <VisorLayer>
        <NavBar />
        <CaptainPresence />
        <CommsConsole />
        <TelemetryStrip />
      </VisorLayer>
    </>
  );
}
