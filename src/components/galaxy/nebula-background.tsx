'use client';

import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EquirectangularReflectionMapping } from 'three';

export function NebulaBackground() {
  const { scene } = useThree();

  try {
    const texture = useTexture('/assets/backgrounds/nebula-panorama.webp');
    texture.mapping = EquirectangularReflectionMapping;
    texture.rotation = Math.PI * 0.8;
    scene.background = texture;
    scene.backgroundIntensity = 0.55;
  } catch {
    // Fallback: solid deep space
  }

  return null;
}
