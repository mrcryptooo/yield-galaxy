'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SolsticeSun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const turbulenceRef = useRef<THREE.Mesh>(null);
  const flareState = useRef({ last: 0, next: 4 + Math.random() * 6 });

  // Core texture — white-hot center graduating to deep amber
  const coreMaterial = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d')!;

    // Base gradient
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.08, '#FFFDF5');
    g.addColorStop(0.2, '#FFE8C0');
    g.addColorStop(0.4, '#F6A04D');
    g.addColorStop(0.65, '#C4751E');
    g.addColorStop(0.85, '#8B4513');
    g.addColorStop(1, '#4A2008');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    // Surface turbulence — irregular darker patches
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 140;
      const x = 256 + Math.cos(angle) * dist;
      const y = 256 + Math.sin(angle) * dist;
      const r = 15 + Math.random() * 35;
      const tg = ctx.createRadialGradient(x, y, 0, x, y, r);
      tg.addColorStop(0, `rgba(74, 32, 8, ${0.15 + Math.random() * 0.2})`);
      tg.addColorStop(1, 'rgba(74, 32, 8, 0)');
      ctx.fillStyle = tg;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return new THREE.MeshBasicMaterial({ map: tex });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Core — violent breathing, two incommensurate frequencies
    if (coreRef.current) {
      const violence = 1
        + Math.sin(t * 0.3) * 0.04
        + Math.sin(t * 0.77 + 1.2) * 0.02
        + Math.sin(t * 1.9 + 0.5) * 0.008; // High-frequency tremor
      coreRef.current.scale.setScalar(violence);
      coreRef.current.rotation.z += 0.0006;
      coreRef.current.rotation.x += 0.0002;
    }

    // Inner glow — flares
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshBasicMaterial;
      let flare = 0;
      if (t > flareState.current.next) {
        flareState.current.last = t;
        flareState.current.next = t + 5 + Math.random() * 14;
      }
      const since = t - flareState.current.last;
      if (since < 2.0) {
        flare = since < 0.2 ? since / 0.2 : Math.max(0, 1 - (since - 0.2) / 1.8);
        flare *= 0.5 + Math.random() * 0.1; // Slight randomness each frame
      }
      mat.opacity = 0.18 + flare * 0.15;
      innerRef.current.scale.setScalar(1 + flare * 0.06);
    }

    // Corona — slow undulation with turbulence
    if (coronaRef.current) {
      const scale = 1 + Math.sin(t * 0.12) * 0.04 + Math.sin(t * 0.31) * 0.015;
      coronaRef.current.scale.setScalar(scale);
      coronaRef.current.rotation.z -= 0.0003;
    }

    // Turbulence ring — rotates opposite to core
    if (turbulenceRef.current) {
      turbulenceRef.current.rotation.z -= 0.001;
      turbulenceRef.current.rotation.x += 0.0004;
      const mat = turbulenceRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(t * 0.5) * 0.015;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Light — the sun illuminates everything */}
      {/* Primary light controlled by WorldLife — not here */}
      <pointLight color="#F6A04D" intensity={3} distance={35} position={[0, 5, 0]} />
      <pointLight color="#EAB0BE" intensity={0.8} distance={25} position={[0, -4, 2]} />
      <pointLight color="#F7B36C" intensity={0.5} distance={20} position={[3, 0, -3]} />

      {/* Core — textured, turbulent surface */}
      <mesh ref={coreRef} material={coreMaterial}>
        <sphereGeometry args={[3.5, 64, 64]} />
      </mesh>

      {/* Turbulence layer — slightly larger, counter-rotating */}
      <mesh ref={turbulenceRef}>
        <sphereGeometry args={[3.7, 32, 32]} />
        <meshBasicMaterial color="#FFD090" transparent opacity={0.04} side={THREE.FrontSide} />
      </mesh>

      {/* Hot inner glow — flare target */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial color="#FFEEDD" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>

      {/* Active corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[5.8, 32, 32]} />
        <meshBasicMaterial color="#F6A04D" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>

      {/* Mid halo */}
      <mesh>
        <sphereGeometry args={[7.5, 28, 28]} />
        <meshBasicMaterial color="#F7B36C" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>

      {/* Outer corona */}
      <mesh>
        <sphereGeometry args={[10.0, 24, 24]} />
        <meshBasicMaterial color="#EAB0BE" transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>

      {/* Distant scattered light */}
      <mesh>
        <sphereGeometry args={[13.0, 16, 16]} />
        <meshBasicMaterial color="#D3C7E7" transparent opacity={0.006} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
