'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Rare environmental events that surprise the viewer.
 * These are NOT gameplay. They are environmental storytelling.
 * Each event is rare, unexpected, and beautiful.
 */
export function WorldEvents() {
  return (
    <>
      <Comet />
      <DustWave />
    </>
  );
}

// A comet that crosses the far background every 30-90 seconds
function Comet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const state = useRef({
    active: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    maxLife: 0,
    nextSpawn: 20 + Math.random() * 40,
  });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = state.current;
    const mesh = meshRef.current;
    const trail = trailRef.current;
    if (!mesh || !trail) return;

    if (!s.active) {
      mesh.visible = false;
      trail.visible = false;
      if (t > s.nextSpawn) {
        // Spawn comet — crosses the far background
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 15;
        s.pos.set(Math.cos(angle) * r, (Math.random() - 0.3) * 12, Math.sin(angle) * r);
        const dir = new THREE.Vector3(
          -Math.cos(angle) + (Math.random() - 0.5) * 0.4,
          -0.15 + Math.random() * 0.3,
          -Math.sin(angle) + (Math.random() - 0.5) * 0.4,
        ).normalize().multiplyScalar(8 + Math.random() * 6);
        s.vel.copy(dir);
        s.life = 0;
        s.maxLife = 3 + Math.random() * 2;
        s.active = true;
      }
      return;
    }

    s.life += delta;
    s.pos.addScaledVector(s.vel, delta);
    mesh.position.copy(s.pos);
    trail.position.copy(s.pos);

    // Trail stretches behind the comet
    trail.lookAt(s.pos.clone().sub(s.vel.clone().normalize()));

    const progress = s.life / s.maxLife;
    const fade = progress < 0.1 ? progress / 0.1 : Math.max(0, 1 - (progress - 0.1) / 0.9);

    mesh.visible = true;
    trail.visible = true;
    (mesh.material as THREE.MeshBasicMaterial).opacity = fade * 0.8;
    (trail.material as THREE.MeshBasicMaterial).opacity = fade * 0.15;
    trail.scale.set(1, 1, 2 + fade * 3);

    if (s.life > s.maxLife) {
      s.active = false;
      s.nextSpawn = t + 30 + Math.random() * 60;
    }
  });

  return (
    <group>
      {/* Comet head */}
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#FFFAF0" transparent opacity={0} />
      </mesh>
      {/* Comet tail */}
      <mesh ref={trailRef} visible={false}>
        <coneGeometry args={[0.04, 1, 6]} />
        <meshBasicMaterial color="#F7B36C" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Occasional dust wave — a faint plane of particles that drifts through
function DustWave() {
  const groupRef = useRef<THREE.Group>(null);
  const state = useRef({
    active: false,
    nextSpawn: 40 + Math.random() * 50,
    life: 0,
    maxLife: 8,
  });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = state.current;
    if (!groupRef.current) return;

    if (!s.active) {
      groupRef.current.visible = false;
      if (t > s.nextSpawn) {
        s.active = true;
        s.life = 0;
        s.maxLife = 6 + Math.random() * 4;
        groupRef.current.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 5,
          -15 - Math.random() * 10,
        );
        groupRef.current.rotation.set(
          Math.random() * 0.3,
          Math.random() * Math.PI,
          Math.random() * 0.2,
        );
      }
      return;
    }

    s.life += delta;
    groupRef.current.visible = true;
    groupRef.current.position.z += delta * 1.5;

    const progress = s.life / s.maxLife;
    const fade = progress < 0.2 ? progress / 0.2 : Math.max(0, 1 - (progress - 0.2) / 0.8);
    const mat = (groupRef.current.children[0] as THREE.Mesh)?.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = fade * 0.012;

    if (s.life > s.maxLife) {
      s.active = false;
      s.nextSpawn = t + 45 + Math.random() * 60;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <planeGeometry args={[25, 8]} />
        <meshBasicMaterial color="#F6A04D" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
