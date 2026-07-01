'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EquirectangularReflectionMapping, BackSide, type Mesh, type Texture } from 'three';
import { useGalaxyStore } from '@/stores/galaxy-store';

const BASE_INTENSITY = 0.62;
const FOCUSED_INTENSITY = 0.4;

export function NebulaBackground() {
  const { scene } = useThree();

  // useTexture suspends on first mount. Calling useFrame (or any hook) after
  // it in the SAME component means the suspended render and the resumed
  // render register a different number of hooks for this fiber, which is
  // exactly the "change in the order of Hooks" error. Fix: this component
  // only calls the suspending hook, then hands the resolved texture down as
  // a plain prop to a child that owns useFrame/useRef — the child never
  // suspends, so its hook list is always identical between renders.
  const texture = useTexture('/assets/backgrounds/nebula-panorama.webp');

  // One-time scene setup belongs in an effect, not the render body — this is
  // the one instance in this file that's a genuine fix rather than idiomatic
  // R3F per-frame mutation (which NebulaLayers' useFrame below still owns).
  useEffect(() => {
    texture.mapping = EquirectangularReflectionMapping;
    texture.rotation = Math.PI * 0.8;
    scene.background = texture;
    scene.backgroundIntensity = BASE_INTENSITY;
  }, [scene, texture]);

  return <NebulaLayers texture={texture} />;
}

// Second + third nebula layers, mapped onto huge inverted spheres and
// rotated independently — gives the background genuine parallax depth
// instead of a single flat panorama, and pushes the sense of scale outward.
function NebulaLayers({ texture }: { texture: Texture }) {
  const parallaxRef = useRef<Mesh>(null);
  const deepRef = useRef<Mesh>(null);
  const { scene } = useThree();
  const focused = useGalaxyStore((s) => s.focused);
  const focusedStation = useGalaxyStore((s) => s.focusedStation);

  useFrame((_, delta) => {
    if (parallaxRef.current) parallaxRef.current.rotation.y += delta * 0.0025;
    if (deepRef.current) deepRef.current.rotation.y -= delta * 0.0009;

    // Focus Mode (Task 2): the world softly darkens behind whatever is
    // focused, so the eye reads "this is what I'm looking at" — restores
    // just as smoothly when focus clears.
    const targetIntensity = (focused || focusedStation) ? FOCUSED_INTENSITY : BASE_INTENSITY;
    scene.backgroundIntensity += (targetIntensity - scene.backgroundIntensity) * delta * 2;
  });

  return (
    <>
      <mesh ref={parallaxRef} scale={-1}>
        <sphereGeometry args={[140, 48, 48]} />
        <meshBasicMaterial map={texture} side={BackSide} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={deepRef} scale={-1} rotation={[0, Math.PI * 0.4, 0]}>
        <sphereGeometry args={[190, 32, 32]} />
        <meshBasicMaterial map={texture} side={BackSide} transparent opacity={0.1} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}
