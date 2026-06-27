'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ORBITS = [
  { radius: 9.5,  speed: 0.003,  opacity: 0.05,  tiltX: 0.12, tiltZ: 0.04 },
  { radius: 10.5, speed: -0.002, opacity: 0.04,  tiltX: 0.18, tiltZ: -0.06 },
  { radius: 9.0,  speed: 0.002,  opacity: 0.035, tiltX: 0.22, tiltZ: 0.08 },
  { radius: 10.0, speed: -0.002, opacity: 0.035, tiltX: 0.28, tiltZ: -0.03 },
];

export function OrbitalRings() {
  return (
    <group>
      {ORBITS.map((o, i) => <Ring key={i} {...o} />)}
    </group>
  );
}

function Ring({ radius, speed, opacity, tiltX, tiltZ }: {
  radius: number; speed: number; opacity: number; tiltX: number; tiltZ: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * speed; });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2 + tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, 0.008, 6, 256]} />
      <meshBasicMaterial color="#F6A04D" transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}
