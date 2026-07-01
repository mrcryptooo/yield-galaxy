'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function SolsticeSun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const heatRef = useRef<THREE.Mesh>(null);
  const logoRef = useRef<THREE.Mesh>(null);
  const rayRef = useRef<THREE.Mesh>(null);

  const texture = useTexture('/assets/galaxy/solstice-sun.png');
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (coreRef.current) {
      const breathe = 1 + Math.sin(t * 0.3) * 0.03 + Math.sin(t * 0.77) * 0.015;
      coreRef.current.scale.setScalar(breathe);
      coreRef.current.rotation.y += 0.0016;
    }

    // Billboard-locked logo plate — always faces the camera, so the Solstice
    // mark never rotates out of view no matter how the textured sphere spins.
    if (logoRef.current) {
      const pulse = 1 + Math.sin(t * 0.4) * 0.02;
      logoRef.current.scale.setScalar(pulse);
      const mat = logoRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.9 + Math.sin(t * 0.6) * 0.08;
    }

    if (rayRef.current) {
      rayRef.current.rotation.z += 0.0011;
      const mat = rayRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + Math.sin(t * 0.5) * 0.02;
    }

    if (coronaRef.current) {
      const pulse = 1 + Math.sin(t * 0.15) * 0.04 + Math.sin(t * 0.4) * 0.02;
      coronaRef.current.scale.setScalar(pulse);
      coronaRef.current.rotation.z -= 0.0003;
      const mat = coronaRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 0.25) * 0.03;
    }

    if (heatRef.current) {
      const dist = 1 + Math.sin(t * 0.2) * 0.05;
      heatRef.current.scale.setScalar(dist);
      const mat = heatRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(t * 0.35) * 0.015;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <pointLight color="#F6A04D" intensity={3} distance={35} position={[0, 5, 0]} />
      <pointLight color="#EAB0BE" intensity={0.8} distance={25} position={[0, -4, 2]} />
      <pointLight color="#F7B36C" intensity={0.5} distance={20} position={[3, 0, -3]} />

      {/* Core — textured sphere with sun artwork, true volumetric rotation */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[3.5, 64, 64]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Logo plate — billboard-locked so the Solstice mark reads from every
          viewing angle regardless of the core sphere's rotation */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh ref={logoRef} position={[0, 0, 0.02]}>
          <circleGeometry args={[2.55, 48]} />
          <meshBasicMaterial map={texture} transparent opacity={0.9} toneMapped={false} depthWrite={false} />
        </mesh>
      </Billboard>

      {/* Solar rays — rotating god-ray plate */}
      <mesh ref={rayRef}>
        <ringGeometry args={[3.6, 6.4, 64]} />
        <meshBasicMaterial color="#FFD8A8" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Heat distortion layer */}
      <mesh ref={heatRef}>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#FFE8C0" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Inner corona — warm glow */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshBasicMaterial color="#FFEEDD" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* Solar rays */}
      <mesh>
        <sphereGeometry args={[7.0, 28, 28]} />
        <meshBasicMaterial color="#F6A04D" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Mid halo */}
      <mesh>
        <sphereGeometry args={[9.0, 24, 24]} />
        <meshBasicMaterial color="#F7B36C" transparent opacity={0.025} side={THREE.BackSide} />
      </mesh>

      {/* Outer halo */}
      <mesh>
        <sphereGeometry args={[12.0, 20, 20]} />
        <meshBasicMaterial color="#EAB0BE" transparent opacity={0.012} side={THREE.BackSide} />
      </mesh>

      {/* Distant glow */}
      <mesh>
        <sphereGeometry args={[16.0, 16, 16]} />
        <meshBasicMaterial color="#D3C7E7" transparent opacity={0.005} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
