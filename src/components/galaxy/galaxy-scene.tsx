'use client';

import { Suspense, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { Opportunity } from '@/lib/types';
import { getPosition } from '@/lib/celestial-positions';
import { StarField } from './star-field';
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
    const item = positions.find((p) => p.opp.id === selectedId);
    return item?.pos ?? null;
  }, [selectedId, positions]);

  const handleReset = useCallback(() => onSelect(null), [onSelect]);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#7c3aed" />
      <pointLight position={[10, -3, -5]} intensity={0.4} color="#3b82f6" />

      <StarField />

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
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          intensity={0.8}
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
        style={{ background: '#050510' }}
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
