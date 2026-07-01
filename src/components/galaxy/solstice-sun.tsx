'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SUN_URL, openExternal } from '@/lib/explore-links';

// Logo decals wrapped around the sphere's surface (not billboard-locked) so
// the mark rotates WITH the star and reads as part of its surface. Spaced
// 90 degrees apart around the equator so at least one decal is always facing
// broadly toward the camera regardless of viewing angle or rotation phase.
const DECAL_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

export function SolsticeSun() {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const heatRef = useRef<THREE.Mesh>(null);
  const rayRef = useRef<THREE.Mesh>(null);

  const texture = useTexture('/assets/galaxy/solstice-sun.png');
  texture.colorSpace = THREE.SRGBColorSpace;

  const decalPositions = useMemo(() => DECAL_ANGLES.map((a) => ({
    position: [Math.sin(a) * 3.54, 0, Math.cos(a) * 3.54] as [number, number, number],
    rotationY: a,
  })), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (coreRef.current) {
      const breathe = 1 + Math.sin(t * 0.3) * 0.03 + Math.sin(t * 0.77) * 0.015;
      coreRef.current.scale.setScalar(breathe);
    }

    // The whole group (sphere + wrapped decals) rotates together, so the
    // decals stay fixed to the surface instead of sliding across it.
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0016;
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

      {/* Core — textured sphere with sun artwork, true volumetric rotation.
          Logo decals are children so they rotate WITH the surface: true 3D,
          no billboard feeling. Four decals 90° apart guarantee the mark is
          visible (wrapped around, not stuck to the camera) from any angle. */}
      <group ref={groupRef}>
        <mesh
          ref={coreRef}
          onClick={(e) => { e.stopPropagation(); openExternal(SUN_URL); }}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[3.5, 64, 64]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        {decalPositions.map((d, i) => (
          <mesh key={i} position={d.position} rotation={[0, d.rotationY, 0]}>
            <circleGeometry args={[1.7, 48]} />
            <meshBasicMaterial map={texture} transparent opacity={0.85} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
        ))}

        {hovered && (
          <Html center distanceFactor={20} style={{ pointerEvents: 'none' }} position={[0, -4.6, 0]}>
            <div className="glass-panel" style={{ padding: '6px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(246,160,77,0.9)' }}>
                Solstice ↗
              </div>
            </div>
          </Html>
        )}
      </group>

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
