'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_POSITIONS, MOON_ORBITS } from './positions';

export function Moons() {
  return (
    <>
      {(Object.keys(MOON_ORBITS) as Array<keyof typeof MOON_ORBITS>).map((name) => (
        <Moon key={name} name={name} />
      ))}
    </>
  );
}

function Moon({ name }: { name: keyof typeof MOON_ORBITS }) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const moon = MOON_ORBITS[name];
  const parent = PLANET_POSITIONS[moon.parent];
  const r = moon.size * 0.35;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    // Orbital motion — smooth, graceful
    const angle = moon.orbitAngle + t * moon.orbitSpeed;
    groupRef.current.position.set(
      parent.pos[0] + Math.cos(angle) * moon.orbitRadius,
      parent.pos[1] + Math.sin(t * 0.2 + moon.orbitAngle) * 0.15, // Gentle vertical drift
      parent.pos[2] + Math.sin(angle) * moon.orbitRadius,
    );

    // Subtle glow pulse — each moon at its own rhythm
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.02 + Math.sin(t * 0.9 + moon.orbitAngle * 2) * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[r, 20, 20]} />
        <meshStandardMaterial
          color="#F7B36C"
          emissive="#F7B36C"
          emissiveIntensity={0.6}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[r * 2.0, 12, 12]} />
        <meshBasicMaterial color="#F7B36C" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
