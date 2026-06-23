'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Opportunity } from '@/lib/types';
import type { CelestialPosition } from '@/lib/celestial-positions';
import { CELESTIAL_COLORS } from '@/lib/constants';

interface Props {
  opportunity: Opportunity;
  position: CelestialPosition;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function CelestialBody({ opportunity, position, isSelected, onSelect, onHover }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colorKey = opportunity.celestial_body.startsWith('PT') ? 'PT'
    : opportunity.celestial_body.startsWith('YT') ? 'YT'
    : opportunity.celestial_body;
  const color = CELESTIAL_COLORS[colorKey] ?? '#6366f1';

  // Gentle rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const scale = hovered || isSelected ? 1.2 : 1;
  const emissiveIntensity = hovered ? position.emissive * 1.5 : position.emissive;

  const handleClick = (e: THREE.Event) => {
    (e as unknown as { stopPropagation: () => void }).stopPropagation();
    onSelect(opportunity.id);
  };

  if (opportunity.celestial_type === 'station') {
    return (
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        scale={scale}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); onHover(opportunity.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
      >
        <octahedronGeometry args={[position.size * 0.8, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity * 0.7}
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>
    );
  }

  if (opportunity.celestial_type === 'moon') {
    return (
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        scale={scale}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); onHover(opportunity.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[position.size * 0.6, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
    );
  }

  // Planet (default)
  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); onHover(opportunity.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[position.size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
  );
}
