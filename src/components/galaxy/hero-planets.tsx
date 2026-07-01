'use client';

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_POSITIONS } from './positions';
import { useGalaxyStore } from '@/stores/galaxy-store';

const TEXTURES: Record<string, string> = {
  USX: '/assets/planets/usx-planet.webp',
  eUSX: '/assets/planets/eusx-planet.webp',
  SLX: '/assets/planets/slx-planet.webp',
  stSLX: '/assets/planets/stslx-planet.webp',
};

const SOUL: Record<string, {
  glow: string; warmGlow: string;
  glowBase: number; shimmerAmp: number; shimmerHz: [number, number];
  breatheHz: [number, number]; breatheAmp: [number, number];
  atmoScale: number; lightIntensity: number; lightDistance: number;
  spriteScale: number; distanceFade: number;
  haloLayers: Array<{ scale: number; opacity: number; color: string }>;
}> = {
  USX: {
    glow: '#F6A04D', warmGlow: '#FFD090',
    glowBase: 0.09, shimmerAmp: 0.018, shimmerHz: [0.55, 1.0],
    breatheHz: [0.32, 0.85], breatheAmp: [0.01, 0.004],
    atmoScale: 1.3, lightIntensity: 1.4, lightDistance: 12,
    spriteScale: 7.5, distanceFade: 1.0,
    haloLayers: [
      { scale: 0.48, opacity: 0.09, color: '#FFD090' },
      { scale: 0.62, opacity: 0.04, color: '#F6A04D' },
      { scale: 0.8, opacity: 0.015, color: '#F7B36C' },
    ],
  },
  eUSX: {
    glow: '#B8A8D8', warmGlow: '#D3C7E7',
    glowBase: 0.065, shimmerAmp: 0.01, shimmerHz: [0.3, 0.6],
    breatheHz: [0.18, 0.5], breatheAmp: [0.007, 0.003],
    atmoScale: 1.5, lightIntensity: 0.6, lightDistance: 8,
    spriteScale: 6.2, distanceFade: 0.72,
    haloLayers: [
      { scale: 0.5, opacity: 0.06, color: '#D3C7E7' },
      { scale: 0.7, opacity: 0.03, color: '#B8A8D8' },
      { scale: 0.95, opacity: 0.01, color: '#9B8DC0' },
    ],
  },
  SLX: {
    glow: '#14b8a6', warmGlow: '#5eead4',
    glowBase: 0.07, shimmerAmp: 0.035, shimmerHz: [0.9, 1.5],
    breatheHz: [0.5, 1.3], breatheAmp: [0.022, 0.008],
    atmoScale: 1.2, lightIntensity: 0.7, lightDistance: 9,
    spriteScale: 5.8, distanceFade: 0.82,
    haloLayers: [
      { scale: 0.45, opacity: 0.07, color: '#5eead4' },
      { scale: 0.58, opacity: 0.03, color: '#14b8a6' },
      { scale: 0.72, opacity: 0.012, color: '#0d9488' },
    ],
  },
  stSLX: {
    glow: '#EAB0BE', warmGlow: '#F0C8D4',
    glowBase: 0.04, shimmerAmp: 0.005, shimmerHz: [0.15, 0.35],
    breatheHz: [0.1, 0.28], breatheAmp: [0.005, 0.002],
    atmoScale: 1.55, lightIntensity: 0.35, lightDistance: 7,
    spriteScale: 5.2, distanceFade: 0.78,
    haloLayers: [
      { scale: 0.55, opacity: 0.04, color: '#F0C8D4' },
      { scale: 0.75, opacity: 0.02, color: '#EAB0BE' },
      { scale: 1.0, opacity: 0.008, color: '#D4919F' },
    ],
  },
};

export function HeroPlanets() {
  return (
    <>
      {(Object.keys(PLANET_POSITIONS) as Array<keyof typeof PLANET_POSITIONS>).map((name) => (
        <Planet key={name} name={name as 'USX' | 'eUSX' | 'SLX' | 'stSLX'} />
      ))}
    </>
  );
}

function Planet({ name }: { name: 'USX' | 'eUSX' | 'SLX' | 'stSLX' }) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRefs = useRef<THREE.Mesh[]>([]);
  const lightRef = useRef<THREE.PointLight>(null);
  const { pos, size } = PLANET_POSITIONS[name];
  const soul = SOUL[name]!;
  const texture = useTexture(TEXTURES[name]!);
  const spriteSize = size * soul.spriteScale;

  const focused = useGalaxyStore((s) => s.focused);
  const hovered = useGalaxyStore((s) => s.hovered);
  const setFocused = useGalaxyStore((s) => s.setFocused);
  const setHovered = useGalaxyStore((s) => s.setHovered);

  const isMe = focused === name;
  const isMeHovered = hovered === name;
  const somethingFocused = focused !== null;
  const dimmed = somethingFocused && !isMe;

  // Spring targets
  const springScale = useRef(1);
  const springGlow = useRef(1);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    setFocused(focused === name ? null : name);
  }, [name, focused, setFocused]);

  const handleOver = useCallback(() => {
    setHovered(name);
    document.body.style.cursor = 'pointer';
  }, [name, setHovered]);

  const handleOut = useCallback(() => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  }, [setHovered]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // Spring targets
    const targetScale = isMeHovered ? 1.08 : isMe ? 1.04 : 1;
    const targetGlow = isMe ? 1.6 : dimmed ? 0.5 : isMeHovered ? 1.3 : 1;

    // Spring interpolation (damped)
    springScale.current += (targetScale - springScale.current) * delta * 4;
    springGlow.current += (targetGlow - springGlow.current) * delta * 3;

    // Breathing + spring scale
    if (groupRef.current) {
      const b = 1
        + Math.sin(t * soul.breatheHz[0]) * soul.breatheAmp[0]
        + Math.sin(t * soul.breatheHz[1] + 1.7) * soul.breatheAmp[1];
      groupRef.current.scale.setScalar(b * springScale.current);
    }

    // Light intensity reacts
    if (lightRef.current) {
      lightRef.current.intensity = soul.lightIntensity * springGlow.current;
    }

    // Halo shimmer + glow reaction
    haloRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const layer = soul.haloLayers[i];
      if (!layer) return;
      const shimmer = layer.opacity
        + Math.sin(t * soul.shimmerHz[0] + i * 1.1) * soul.shimmerAmp
        + Math.sin(t * soul.shimmerHz[1] + i * 2.3) * soul.shimmerAmp * 0.35;
      mat.opacity = Math.max(0, shimmer * springGlow.current);
    });
  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]}>
      <pointLight ref={lightRef} color={soul.warmGlow} intensity={soul.lightIntensity} distance={soul.lightDistance} />

      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>
          <planeGeometry args={[spriteSize, spriteSize]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} opacity={dimmed ? soul.distanceFade * 0.6 : soul.distanceFade} />
        </mesh>
      </Billboard>

      {soul.haloLayers.map((layer, i) => (
        <mesh key={i} ref={(el) => { if (el) haloRefs.current[i] = el; }}>
          <sphereGeometry args={[spriteSize * layer.scale * soul.atmoScale, 32, 32]} />
          <meshBasicMaterial color={layer.color} transparent opacity={layer.opacity} side={THREE.BackSide} />
        </mesh>
      ))}

      {/* Hover label — glass-backed, premium */}
      {isMeHovered && !isMe && (
        <Html center distanceFactor={18} style={{ pointerEvents: 'none' }} position={[0, spriteSize * 0.4, 0]}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '8px 18px' }}>
            <div style={{
              fontSize: 'var(--fs-title)',
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: soul.glow,
              textShadow: `0 0 16px ${soul.glow}55`,
            }}>
              {name}
            </div>
            <div style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'rgba(245,240,235,0.6)',
              marginTop: '3px',
            }}>
              Explore →
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
