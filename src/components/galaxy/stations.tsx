'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { STATION_POSITIONS } from './positions';

const TEXTURES: Record<string, string> = {
  Kamino: '/assets/stations/kamino-station.webp',
  Loopscale: '/assets/stations/loopscale-station.png',
  Orca: '/assets/stations/orca-station.webp',
  Raydium: '/assets/stations/raydium-station.png',
  Exponent: '/assets/stations/exponent-station.png',
};

const IDENTITY: Record<string, { light: string; lightIntensity: number; glowOpacity: number }> = {
  Kamino:    { light: '#6CB4EE', lightIntensity: 0.5,  glowOpacity: 0.035 },
  Orca:      { light: '#F5F0EB', lightIntensity: 0.35, glowOpacity: 0.025 },
  Raydium:   { light: '#F6A04D', lightIntensity: 0.4,  glowOpacity: 0.03 },
  Loopscale: { light: '#C4B5E7', lightIntensity: 0.3,  glowOpacity: 0.025 },
  Exponent:  { light: '#EAB0BE', lightIntensity: 0.3,  glowOpacity: 0.02 },
};

const SPRITE_SCALE = 7;

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
  const glowRef = useRef<THREE.Mesh>(null);
  const { pos, size } = STATION_POSITIONS[name];
  const id = IDENTITY[name]!;
  const texture = useTexture(TEXTURES[name]!);
  const spriteSize = size * SPRITE_SCALE;

  const rhythm = useMemo(() => ({
    speed: 0.6 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    beaconInterval: 5 + Math.random() * 12,
    floatSpeed: 0.15 + Math.random() * 0.1,
    floatAmp: 0.12 + Math.random() * 0.08,
  }), []);

  const beaconRef = useRef(3 + Math.random() * 5);

  useFrame(({ clock }) => {
    if (!groupRef.current || !lightRef.current) return;
    const t = clock.elapsedTime;

    const pulse = Math.sin(t * rhythm.speed + rhythm.phase) * 0.012 + 1;
    const floatY = Math.sin(t * rhythm.floatSpeed) * rhythm.floatAmp;
    groupRef.current.scale.setScalar(pulse);
    groupRef.current.position.y = pos[1] + floatY;

    let beacon = 0;
    if (t > beaconRef.current) beaconRef.current = t + rhythm.beaconInterval;
    const since = t - (beaconRef.current - rhythm.beaconInterval);
    if (since >= 0 && since < 1.2) {
      beacon = since < 0.15 ? since / 0.15 : Math.max(0, 1 - (since - 0.15) / 1.05);
    }
    lightRef.current.intensity = id.lightIntensity + beacon * 0.8;

    if (glowRef.current) {
      const glowPulse = id.glowOpacity + Math.sin(t * 0.8 + rhythm.phase) * 0.008 + beacon * 0.02;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowPulse;
    }
  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]}>
      <pointLight ref={lightRef} color={id.light} intensity={id.lightIntensity} distance={8} />

      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh>
          <planeGeometry args={[spriteSize, spriteSize]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} opacity={0.95} />
        </mesh>
      </Billboard>

      {/* Volumetric halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[spriteSize * 0.5, 16, 16]} />
        <meshBasicMaterial color={id.light} transparent opacity={id.glowOpacity} side={THREE.BackSide} />
      </mesh>

      {/* Outer atmosphere */}
      <mesh>
        <sphereGeometry args={[spriteSize * 0.8, 12, 12]} />
        <meshBasicMaterial color={id.light} transparent opacity={id.glowOpacity * 0.3} side={THREE.BackSide} />
      </mesh>

      {/* Label */}
      <Html center distanceFactor={14} style={{ pointerEvents: 'none' }} position={[0, -spriteSize * 0.55, 0]}>
        <div style={{
          textAlign: 'center',
          textShadow: '0 0 12px rgba(0,0,0,0.9)',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 400, letterSpacing: '0.06em',
            color: 'rgba(245,240,235,0.35)',
          }}>
            {name}
          </div>
        </div>
      </Html>
    </group>
  );
}
