'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialPosition } from '@/lib/celestial-positions';

const DEFAULT_POS = new THREE.Vector3(0, 10, 22);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
const FLY_SPEED = 3;

interface Props {
  target: CelestialPosition | null;
  onReset: () => void;
}

export function GalaxyCamera({ target, onReset }: Props) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const goalPos = useRef(DEFAULT_POS.clone());
  const goalTarget = useRef(DEFAULT_TARGET.clone());
  const flying = useRef(false);

  useEffect(() => {
    if (target) {
      const bodyPos = new THREE.Vector3(target.x, target.y, target.z);
      const offset = new THREE.Vector3(2.5, 1.5, 2.5);
      goalPos.current.copy(bodyPos).add(offset);
      goalTarget.current.copy(bodyPos);
      flying.current = true;
    } else {
      goalPos.current.copy(DEFAULT_POS);
      goalTarget.current.copy(DEFAULT_TARGET);
      flying.current = true;
    }
  }, [target]);

  // Escape key resets camera
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onReset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onReset]);

  useFrame((_, delta) => {
    if (!flying.current) return;

    const t = Math.min(1, delta * FLY_SPEED);
    camera.position.lerp(goalPos.current, t);

    if (controlsRef.current) {
      const ctrl = controlsRef.current as unknown as { target: THREE.Vector3 };
      ctrl.target.lerp(goalTarget.current, t);
    }

    if (camera.position.distanceTo(goalPos.current) < 0.05) {
      flying.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={50}
      dampingFactor={0.05}
      enableDamping
    />
  );
}
