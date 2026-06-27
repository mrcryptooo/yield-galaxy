'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function StarField() {
  return (
    <>
      {/* Star layers — depth through varied distances */}
      <StarLayer count={500} rMin={25} rMax={35} size={0.07} opacity={0.7} speed={0.001} color="#F5F0EB" />
      <StarLayer count={800} rMin={35} rMax={50} size={0.04} opacity={0.45} speed={0.0006} color="#F5F0EB" />
      <StarLayer count={1200} rMin={50} rMax={75} size={0.022} opacity={0.22} speed={0.0003} color="#D3C7E7" />
      <StarLayer count={600} rMin={70} rMax={90} size={0.015} opacity={0.12} speed={0.0002} color="#C4B5E7" />

      {/* Warm dust — atmospheric, barely there */}
      <StarLayer count={60} rMin={12} rMax={30} size={0.15} opacity={0.02} speed={0.0003} color="#F6A04D" />

      {/* Debris — tiny particles drifting through the scene */}
      <Debris />

      {/* Shooting stars */}
      <ShootingStars />
    </>
  );
}

function StarLayer({ count, rMin, rMax, size, opacity, speed, color }: {
  count: number; rMin: number; rMax: number; size: number; opacity: number; speed: number; color: string;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = rMin + Math.random() * (rMax - rMin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, rMin, rMax]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={size} sizeAttenuation depthWrite={false} opacity={opacity} />
    </Points>
  );
}

// Tiny debris particles that drift slowly through the near field
function Debris() {
  const count = 40;
  const ref = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.001;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    velocities.current = vel;
    return pos;
  }, []);

  useFrame(() => {
    if (!ref.current || !velocities.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const vel = velocities.current;
    for (let i = 0; i < count; i++) {
      attr.array[i * 3] += vel[i * 3];
      attr.array[i * 3 + 1] += vel[i * 3 + 1];
      attr.array[i * 3 + 2] += vel[i * 3 + 2];
      // Wrap around if too far
      for (let j = 0; j < 3; j++) {
        const limit = j === 1 ? 15 : 30;
        if (Math.abs(attr.array[i * 3 + j]) > limit) {
          attr.array[i * 3 + j] *= -0.9;
        }
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <Points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <PointMaterial transparent color="#F5F0EB" size={0.025} sizeAttenuation depthWrite={false} opacity={0.08} />
    </Points>
  );
}

function ShootingStars() {
  const stars = useRef(
    Array.from({ length: 3 }, () => ({
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 0,
      nextSpawn: 4 + Math.random() * 12,
    }))
  );

  const meshRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    stars.current.forEach((star, i) => {
      const mesh = meshRefs[i].current;
      if (!mesh) return;

      if (!star.active) {
        mesh.visible = false;
        if (t > star.nextSpawn) {
          const angle = Math.random() * Math.PI * 2;
          const r = 22 + Math.random() * 12;
          star.pos.set(Math.cos(angle) * r, (Math.random() - 0.3) * 8, Math.sin(angle) * r);
          const dir = new THREE.Vector3(-Math.cos(angle), -0.3 - Math.random() * 0.3, -Math.sin(angle))
            .normalize().multiplyScalar(18 + Math.random() * 10);
          star.vel.copy(dir);
          star.life = 0;
          star.maxLife = 0.6 + Math.random() * 0.5;
          star.active = true;
        }
      } else {
        star.life += delta;
        star.pos.addScaledVector(star.vel, delta);
        mesh.position.copy(star.pos);
        mesh.visible = true;

        const progress = star.life / star.maxLife;
        const fade = progress < 0.15 ? progress / 0.15 : Math.max(0, 1 - (progress - 0.15) / 0.85);
        (mesh.material as THREE.MeshBasicMaterial).opacity = fade * 0.6;

        if (star.life > star.maxLife) {
          star.active = false;
          star.nextSpawn = t + 7 + Math.random() * 18;
        }
      }
    });
  });

  return (
    <group>
      {meshRefs.map((ref, i) => (
        <mesh key={i} ref={ref} visible={false}>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshBasicMaterial color="#FFFAF0" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
