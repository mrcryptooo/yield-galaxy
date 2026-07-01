'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { SolsticeSun } from './solstice-sun';
import { StarField } from './star-field';
import { NebulaBackground } from './nebula-background';
import { OrbitalRings } from './orbital-rings';
import { GalaxyCamera } from './galaxy-camera';
import { HeroPlanets } from './hero-planets';
import { Stations } from './stations';
import { Moons } from './moons';
import { WorldEvents } from './world-events';
import { Atmosphere } from './atmosphere';
import { WorldLife } from './world-life';
import { PlanetExperience } from './planet-experience';
import { JourneyPlayer } from './journey-player';
import { MissionFocusSync } from './mission-focus-sync';
import type { PlanetInfo } from './planet-data';
import { CAMERA } from './positions';

function GalaxyContent({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  return (
    <>
      <ambientLight intensity={0.03} color="#F5F0EB" />
      <WorldLife />

      <NebulaBackground />
      <StarField />
      <OrbitalRings />
      <SolsticeSun />
      <HeroPlanets />
      <Stations />
      <Moons />
      <Atmosphere />
      <WorldEvents />
      <PlanetExperience planetData={planetData} />
      <JourneyPlayer />
      <MissionFocusSync />

      <GalaxyCamera />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2.2} />
      </EffectComposer>
    </>
  );
}

export function GalaxyScene({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  return (
    <Canvas
      camera={{ position: [0, 45, 55], fov: CAMERA.fov, near: 0.1, far: 300 }}
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#0A0E1A', borderRadius: 'var(--panel-radius)' }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <GalaxyContent planetData={planetData} />
      </Suspense>
    </Canvas>
  );
}
