'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { STATION_POSITIONS } from './positions';

const TEXTURES: Record<string, string> = {
  Kamino: '/assets/stations/kamino-station.webp',
  Loopscale: '/assets/stations/loopscale-station.webp',
  Orca: '/assets/stations/orca-station.webp',
  Raydium: '/assets/stations/raydium-station.webp',
  Exponent: '/assets/stations/exponent-station.webp',
};

// Each station has unique visual identity
const IDENTITY: Record<string, { light: string; lightIntensity: number; glowOpacity: number }> = {
  Kamino:    { light: '#6CB4EE', lightIntensity: 0.35, glowOpacity: 0.02 },   // Industrial blue
  Orca:      { light: '#F5F0EB', lightIntensity: 0.25, glowOpacity: 0.015 },  // Clean white
  Raydium:   { light: '#F6A04D', lightIntensity: 0.3,  glowOpacity: 0.02 },   // Warm orange
  Loopscale: { light: '#C4B5E7', lightIntensity: 0.2,  glowOpacity: 0.015 },  // Research violet
  Exponent:  { light: '#EAB0BE', lightIntensity: 0.2,  glowOpacity: 0.012 },  // Rose
};

const SPRITE_SCALE = 3.8;

export function Stations() {
  return (
    <>
      {(Object.keys(STATION_POSITIONS) as Array<keyof typeof STATION_POSITIONS>).map((name) => (
        <Station key={name} name={name} />
      ))}
    </>
  );
}

function Station({ name }: { name: keyof typeof STATION_POSITIONS }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const { pos, size } = STATION_POSITIONS[name];
  const id = IDENTITY[name]!;
  const texture = useTexture(TEXTURES[name]!);
  const spriteSize = size * SPRITE_SCALE;

  const rhythm = useMemo(() => ({
    speed: 1.0 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    beaconInterval: 5 + Math.random() * 12,
  }), []);

  const beaconRef = useRef(3 + Math.random() * 5);

  useFrame(({ clock }) => {
    if (!groupRef.current || !lightRef.current) return;
    const t = clock.elapsedTime;

    const pulse = Math.sin(t * rhythm.speed + rhythm.phase) * 0.015 + 1;
    groupRef.current.scale.setScalar(pulse);

    let beacon = 0;
    if (t > beaconRef.current) beaconRef.current = t + rhythm.beaconInterval;
    const since = t - (beaconRef.current - rhythm.beaconInterval);
    if (since >= 0 && since < 0.8) {
      beacon = since < 0.1 ? since / 0.1 : Math.max(0, 1 - (since - 0.1) / 0.7);
    }
    lightRef.current.intensity = id.lightIntensity + beacon * 0.6;
  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]}>
      <pointLight ref={lightRef} color={id.light} intensity={id.lightIntensity} distance={5} />

      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh>
          <planeGeometry args={[spriteSize, spriteSize]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} opacity={0.92} />
        </mesh>
      </Billboard>

      <mesh>
        <sphereGeometry args={[spriteSize * 0.3, 16, 16]} />
        <meshBasicMaterial color={id.light} transparent opacity={id.glowOpacity} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
