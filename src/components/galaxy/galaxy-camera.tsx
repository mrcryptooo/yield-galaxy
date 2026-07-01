'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CAMERA } from './positions';
import { FOCUS_CAMERAS } from './focus-cameras';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useJourneyStore } from '@/stores/journey-store';
import { getCameraForNode } from '@/lib/route-engine';

const FINAL_POS = new THREE.Vector3(...CAMERA.position);
const FINAL_TARGET = new THREE.Vector3(...CAMERA.target);
const OPEN_POS = new THREE.Vector3(0, 45, 55);
const OPEN_TARGET = new THREE.Vector3(0, 0, 10);

export function GalaxyCamera() {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera, gl } = useThree();

  const focused = useGalaxyStore((s) => s.focused);
  const setFocused = useGalaxyStore((s) => s.setFocused);

  const phase = useRef<'opening' | 'idle' | 'flying' | 'journey-orbit'>('opening');
  const progress = useRef(0);
  const journeyOrbitTime = useRef(0);
  const flyFrom = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const flyTo = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const drift = useRef({ x: 0, y: 0 });

  // React to focus changes
  const prevFocused = useRef<string | null>(null);
  useEffect(() => {
    if (focused === prevFocused.current) return;
    prevFocused.current = focused;

    const ctrl = controlsRef.current as unknown as { target: THREE.Vector3 } | null;
    flyFrom.current.pos.copy(camera.position);
    flyFrom.current.target.copy(ctrl?.target ?? FINAL_TARGET);

    if (focused && FOCUS_CAMERAS[focused]) {
      const fc = FOCUS_CAMERAS[focused];
      flyTo.current.pos.set(...fc.position);
      flyTo.current.target.set(...fc.target);
    } else {
      flyTo.current.pos.copy(FINAL_POS);
      flyTo.current.target.copy(FINAL_TARGET);
    }
    phase.current = 'flying';
    progress.current = 0;
  }, [focused, camera]);

  // React to journey step changes
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const prevJourneyStep = useRef<number>(-1);
  const prevRouteId = useRef<string | null>(null);

  useEffect(() => {
    if (!activeRoute) {
      if (prevRouteId.current !== null) {
        prevRouteId.current = null;
        prevJourneyStep.current = -1;
        const ctrl = controlsRef.current as unknown as { target: THREE.Vector3 } | null;
        flyFrom.current.pos.copy(camera.position);
        flyFrom.current.target.copy(ctrl?.target ?? FINAL_TARGET);
        flyTo.current.pos.copy(FINAL_POS);
        flyTo.current.target.copy(FINAL_TARGET);
        phase.current = 'flying';
        progress.current = 0;
      }
      return;
    }

    const routeChanged = prevRouteId.current !== activeRoute.template.id;
    const stepChanged = prevJourneyStep.current !== activeRoute.currentStep;

    if (!routeChanged && !stepChanged) return;

    prevRouteId.current = activeRoute.template.id;
    prevJourneyStep.current = activeRoute.currentStep;

    const node = activeRoute.nodes[activeRoute.currentStep];
    if (!node) return;

    const cam = getCameraForNode(node);
    const ctrl = controlsRef.current as unknown as { target: THREE.Vector3 } | null;
    flyFrom.current.pos.copy(camera.position);
    flyFrom.current.target.copy(ctrl?.target ?? FINAL_TARGET);
    flyTo.current.pos.set(...cam.position);
    flyTo.current.target.set(...cam.target);
    phase.current = 'flying';
    progress.current = 0;
  }, [activeRoute, camera]);

  const selectedProtocol = useGalaxyStore((s) => s.selectedProtocol);
  const setSelectedProtocol = useGalaxyStore((s) => s.setSelectedProtocol);

  const endJourney = useJourneyStore((s) => s.endJourney);

  // ESC: journey → protocol → planet → galaxy (layered exit)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeRoute) {
          endJourney();
        } else if (selectedProtocol) {
          setSelectedProtocol(null);
        } else if (focused) {
          setFocused(null);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focused, selectedProtocol, activeRoute, setFocused, setSelectedProtocol, endJourney]);

  // Click empty space: protocol → planet → galaxy
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.target !== gl.domElement) return;
      if (selectedProtocol) {
        setSelectedProtocol(null);
      } else if (focused) {
        setFocused(null);
      }
    };
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [focused, setFocused, gl.domElement]);

  useFrame((_, delta) => {
    const ctrl = controlsRef.current as unknown as { target: THREE.Vector3 } | null;

    // Opening
    if (phase.current === 'opening') {
      progress.current = Math.min(1, progress.current + delta * 0.18);
      const e = smootherstep(progress.current);
      camera.position.lerpVectors(OPEN_POS, FINAL_POS, e);
      if (ctrl) ctrl.target.lerpVectors(OPEN_TARGET, FINAL_TARGET, e);
      if (progress.current >= 1) phase.current = 'idle';
      return;
    }

    // Flying (focus or return) — momentum + slight overshoot before settling,
    // so a fly-to reads as weighted travel rather than a linear tween.
    if (phase.current === 'flying') {
      const speed = activeRoute ? 0.32 : 0.55;
      progress.current = Math.min(1, progress.current + delta * speed);
      const posEase = easeOutBackSoft(progress.current);
      const targetEase = smootherstep(progress.current);
      camera.position.lerpVectors(flyFrom.current.pos, flyTo.current.pos, posEase);
      if (ctrl) ctrl.target.lerpVectors(flyFrom.current.target, flyTo.current.target, targetEase);
      if (progress.current >= 1) {
        if (activeRoute) {
          phase.current = 'journey-orbit';
          journeyOrbitTime.current = 0;
        } else {
          phase.current = 'idle';
        }
      }
      return;
    }

    // Orbit micro-motion at journey node
    if (phase.current === 'journey-orbit') {
      journeyOrbitTime.current += delta;
      const orbitRadius = 0.3;
      const orbitSpeed = 0.4;
      const t = journeyOrbitTime.current * orbitSpeed;
      camera.position.x = flyTo.current.pos.x + Math.sin(t) * orbitRadius;
      camera.position.y = flyTo.current.pos.y + Math.cos(t * 0.7) * orbitRadius * 0.3;
      camera.position.z = flyTo.current.pos.z + Math.cos(t) * orbitRadius * 0.5;
      return;
    }

    // Idle drift — micro breathing, gives the whole rig a sense of weight
    // even at rest instead of feeling perfectly locked-off.
    drift.current.x += delta * 0.006;
    drift.current.y += delta * 0.005;
    camera.position.x += (Math.sin(drift.current.x * 0.5) * 0.05 + Math.sin(drift.current.x * 0.9) * 0.025) * delta;
    camera.position.y += (Math.cos(drift.current.y * 0.35) * 0.025 + Math.sin(drift.current.y * 0.62) * 0.012) * delta;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={FINAL_TARGET}
      enablePan={false}
      enableZoom={!focused && !activeRoute}
      enableRotate={!focused && !activeRoute}
      minDistance={10}
      maxDistance={60}
      dampingFactor={0.015}
      enableDamping
      rotateSpeed={0.25}
      zoomSpeed={0.4}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI * 0.6}
    />
  );
}

function smootherstep(x: number): number {
  x = Math.max(0, Math.min(1, x));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// Soft back-ease: overshoots slightly past the destination then settles back,
// giving camera fly-tos a sense of momentum and weight instead of a flat tween.
function easeOutBackSoft(x: number): number {
  x = Math.max(0, Math.min(1, x));
  const c1 = 0.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
