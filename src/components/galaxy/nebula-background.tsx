'use client';

import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EquirectangularReflectionMapping } from 'three';

export function NebulaBackground() {
  const { scene } = useThree();

  try {
    const texture = useTexture('/assets/backgrounds/nebula-panorama.webp');
    texture.mapping = EquirectangularReflectionMapping;
    // Rotate to show the most atmospheric section — dust lanes and color variation
    texture.rotation = Math.PI * 0.8;
    scene.background = texture;
    // Enough to see cloud structure, not enough to compete with the sun
    scene.backgroundIntensity = 0.45;
  } catch {
    // Fallback: solid deep space
  }

  return null;
}
