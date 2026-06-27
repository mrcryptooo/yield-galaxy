'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

/**
 * Atmospheric layers that sit BETWEEN planets and the background.
 * These create the perception that objects exist INSIDE a medium,
 * not floating on top of a wallpaper.
 */
export function Atmosphere() {
  return (
    <>
      {/* Sun-scattered light — brighter near center, fades with distance */}
      <SunHaze />

      {/* Mid-field dust — faint particles that give depth between foreground and background */}
      <DepthDust />

      {/* Near-camera particles — cross the viewport, create parallax depth */}
      <LensParticles />

      {/* Foreground wisps — very faint streaks that drift slowly */}
      <ForegroundWisps />
    </>
  );
}

// Volumetric approximation: a large faint sphere of warm light around the sun
// This makes the space NEAR the sun feel illuminated, not just the sun itself
function SunHaze() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime;
      const scale = 1 + Math.sin(t * 0.1) * 0.03;
      ref.current.scale.setScalar(scale);
      ref.current.rotation.y += 0.0002;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[18, 32, 32]} />
      <meshBasicMaterial
        color="#F6A04D"
        transparent
        opacity={0.008}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Dust particles distributed in the mid-field — not stars (too close), not debris (too active)
// These just... exist. They give the space between planets a sense of medium.
function DepthDust() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distributed in a thick disc around the orbital plane
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 20;
      pos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.0002;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#F7B36C"
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.03}
      />
    </Points>
  );
}

// Tiny particles very close to the camera — creates the feeling of looking through a medium
// Like dust on a camera lens, but in 3D
function LensParticles() {
  const ref = useRef<THREE.Points>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const positions = useMemo(() => {
    const count = 15;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    basePositions.current = new Float32Array(pos);
    return pos;
  }, []);

  useFrame(({ camera, clock }) => {
    if (!ref.current || !basePositions.current) return;
    const t = clock.elapsedTime;
    // These particles follow the camera, always in front of it
    ref.current.position.copy(camera.position);
    ref.current.quaternion.copy(camera.quaternion);

    // Gentle drift within the camera-relative space
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < 15; i++) {
      attr.array[i * 3] = basePositions.current[i * 3] + Math.sin(t * 0.1 + i) * 0.3;
      attr.array[i * 3 + 1] = basePositions.current[i * 3 + 1] + Math.cos(t * 0.08 + i * 1.3) * 0.15;
      attr.array[i * 3 + 2] = basePositions.current[i * 3 + 2] - 3; // Always in front
    }
    attr.needsUpdate = true;
  });

  return (
    <Points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#F5F0EB"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.06}
      />
    </Points>
  );
}

// Very faint horizontal wisps that drift slowly across the mid-ground
// Like seeing through nebula gas — not visible directly, but felt
function ForegroundWisps() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(clock.elapsedTime * 0.02) * 3;
      ref.current.position.z = Math.cos(clock.elapsedTime * 0.015) * 2;
    }
  });

  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[(i - 1) * 12, (i - 1) * 1.5 - 2, -5 + i * 3]}
          rotation={[0.1 * i, 0.3 * i, 0.05 * i]}
        >
          <planeGeometry args={[18, 3]} />
          <meshBasicMaterial
            color="#F6A04D"
            transparent
            opacity={0.004}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
