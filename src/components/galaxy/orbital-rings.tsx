'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RINGS = [
  { radius: 5, speed: 0.015, opacity: 0.06 },
  { radius: 7.5, speed: -0.01, opacity: 0.04 },
  { radius: 10, speed: 0.008, opacity: 0.03 },
];

export function OrbitalRings() {
  return (
    <group rotation={[Math.PI * 0.15, 0, 0]}>
      {RINGS.map((ring, i) => (
        <Ring key={i} {...ring} />
      ))}
    </group>
  );
}

function Ring({ radius, speed, opacity }: { radius: number; speed: number; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 128]} />
      <meshBasicMaterial
        color="#F6A04D"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
