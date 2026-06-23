'use client';

import { Suspense, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { Opportunity } from '@/lib/types';
import { getPosition } from '@/lib/celestial-positions';
import { StarField } from './star-field';
import { NebulaBackground } from './nebula-background';
import { OrbitalRings } from './orbital-rings';
import { CelestialBody } from './celestial-body';
import { CelestialLabel } from './celestial-label';
import { GalaxyCamera } from './galaxy-camera';

interface Props {
  opportunities: Opportunity[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function GalaxyContent({ opportunities, selectedId, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positions = useMemo(() => {
    return opportunities.map((opp) => ({
      opp,
      pos: getPosition(opp, opportunities),
    }));
  }, [opportunities]);

  const selectedPos = useMemo(() => {
    if (!selectedId) return null;
    return positions.find((p) => p.opp.id === selectedId)?.pos ?? null;
  }, [selectedId, positions]);

  const handleReset = useCallback(() => onSelect(null), [onSelect]);

  return (
    <>
      {/* Warm lighting */}
      <ambientLight intensity={0.1} color="#F5F0EB" />
      <pointLight position={[0, 8, 0]} intensity={0.9} color="#F6A04D" distance={40} />
      <pointLight position={[-8, -3, 6]} intensity={0.4} color="#F7B36C" distance={30} />
      <pointLight position={[10, -2, -8]} intensity={0.3} color="#D3C7E7" distance={25} />

      <NebulaBackground />
      <StarField />
      <OrbitalRings />

      {positions.map(({ opp, pos }) => (
        <group key={opp.id}>
          <CelestialBody
            opportunity={opp}
            position={pos}
            isSelected={opp.id === selectedId}
            onSelect={onSelect}
            onHover={setHoveredId}
          />
          <CelestialLabel
            opportunity={opp}
            position={pos}
            isSelected={opp.id === selectedId}
            isHovered={opp.id === hoveredId}
          />
        </group>
      ))}

      <GalaxyCamera target={selectedPos} onReset={handleReset} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.6}
          intensity={1.2}
        />
      </EffectComposer>
    </>
  );
}

export function GalaxyScene({ opportunities, selectedId, onSelect }: Props) {
  return (
    <div className="absolute inset-0" onClick={() => onSelect(null)}>
      <Canvas
        camera={{ position: [0, 10, 22], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0A0E1A' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <GalaxyContent
            opportunities={opportunities}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
