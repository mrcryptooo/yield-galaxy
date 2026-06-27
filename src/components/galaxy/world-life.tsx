'use client';

import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * WORLD LIFE — slow environmental changes over minutes.
 *
 * This component manages the world's "breath" at a macro scale.
 * Individual objects have their own micro-animations.
 * This creates the macro rhythm — the world's mood shifts slowly.
 *
 * A user who stays 5 minutes will experience:
 * - Lighting that warms and cools
 * - Nebula that brightens and dims
 * - Activity cycles (calm periods → active periods)
 * - A rare "deep pulse" event every 2-4 minutes
 */
export function WorldLife() {
  const sunLightRef = useRef<THREE.PointLight>(null);
  const deepPulseRef = useRef({ nextTime: 90 + Math.random() * 120, active: false, progress: 0 });

  useFrame(({ clock, scene }) => {
    const t = clock.elapsedTime;

    // MACRO BREATHING — the entire world's light level shifts over ~80 seconds
    // Two incommensurate periods ensure it never loops noticeably
    const worldBreath = 1
      + Math.sin(t * 0.013) * 0.06      // ~77 second cycle
      + Math.sin(t * 0.0089) * 0.03;    // ~112 second cycle — never aligns with the first

    // Apply to the sun's primary light
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 5.5 * worldBreath;
    }

    // NEBULA INTENSITY shifts — brighter during "exhale", dimmer during "inhale"
    if (scene.backgroundIntensity !== undefined) {
      scene.backgroundIntensity = 0.42 + Math.sin(t * 0.011) * 0.05;
    }

    // DEEP PULSE — a rare, slow brightening of the entire scene
    // Happens every 2-4 minutes. Takes ~8 seconds to complete.
    // The user notices something changed but can't pinpoint what.
    const dp = deepPulseRef.current;
    if (t > dp.nextTime && !dp.active) {
      dp.active = true;
      dp.progress = 0;
    }
    if (dp.active) {
      dp.progress += 0.005;
      // Slow rise, long plateau, very slow fade
      let intensity = 0;
      if (dp.progress < 0.15) {
        intensity = dp.progress / 0.15;
      } else if (dp.progress < 0.4) {
        intensity = 1;
      } else if (dp.progress < 1) {
        intensity = 1 - (dp.progress - 0.4) / 0.6;
      } else {
        dp.active = false;
        dp.nextTime = t + 120 + Math.random() * 180;
      }

      // During a deep pulse, everything gets slightly warmer and brighter
      if (sunLightRef.current) {
        sunLightRef.current.intensity += intensity * 1.5;
      }
      if (scene.backgroundIntensity !== undefined) {
        scene.backgroundIntensity += intensity * 0.06;
      }
    }
  });

  // This light overrides the sun's primary — we control it from here
  return (
    <pointLight
      ref={sunLightRef}
      position={[0, 0, 0]}
      color="#FFEEDD"
      intensity={5.5}
      distance={55}
    />
  );
}
