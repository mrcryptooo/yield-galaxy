'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useJourneyStore } from '@/stores/journey-store';

const TRAIL_COLOR = new THREE.Color('#F6A04D');
const PARTICLE_COUNT = 32;

export function RouteTrails() {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const completed = useJourneyStore((s) => s.completed);
  if (!activeRoute) return null;

  return (
    <group>
      {activeRoute.nodes.map((node, i) => (
        <RouteNodeMarker
          key={node.id}
          position={node.position}
          label={node.label}
          index={i}
          currentStep={activeRoute.currentStep}
          total={activeRoute.nodes.length}
          completed={completed}
        />
      ))}

      {activeRoute.nodes.map((node, i) => {
        if (i === 0) return null;
        const prev = activeRoute.nodes[i - 1];
        return (
          <EnergyLine
            key={`line-${i}`}
            from={prev.position}
            to={node.position}
            segmentIndex={i}
            currentStep={activeRoute.currentStep}
            completed={completed}
          />
        );
      })}

      <RouteParticles nodes={activeRoute.nodes} currentStep={activeRoute.currentStep} />

      {completed && <CompletionBurst nodes={activeRoute.nodes} />}
    </group>
  );
}

function RouteNodeMarker({ position, label, index, currentStep, total, completed }: {
  position: [number, number, number];
  label: string;
  index: number;
  currentStep: number;
  total: number;
  completed: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const arrivalRef = useRef(0);
  const prevStep = useRef(-1);

  const isCompleted = index < currentStep || completed;
  const isCurrent = index === currentStep && !completed;
  const isFuture = index > currentStep && !completed;

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = clock.elapsedTime;

    if (currentStep !== prevStep.current && index === currentStep) {
      arrivalRef.current = t;
      prevStep.current = currentStep;
    }

    const timeSinceArrival = t - arrivalRef.current;
    const arrivalPulse = arrivalRef.current > 0 && timeSinceArrival < 1.5
      ? Math.exp(-timeSinceArrival * 2) * 0.8
      : 0;

    if (completed) {
      const completionPulse = Math.sin(t * 1.5 + index * 0.4) * 0.1;
      meshRef.current.scale.setScalar(1.0 + completionPulse);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + completionPulse * 0.02;
      glowRef.current.scale.setScalar(3.0);
      return;
    }

    const baseScale = isCurrent ? 1.3 : (isCompleted ? 0.9 : 0.5);
    const targetScale = baseScale + arrivalPulse * 0.6;
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(s + (targetScale - s) * 0.08);

    if (isCurrent) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.12;
      glowRef.current.scale.setScalar((2.5 + arrivalPulse * 3) * pulse);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 2) * 0.02 + arrivalPulse * 0.1;
    } else if (isCompleted) {
      glowRef.current.scale.setScalar(2.0);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04;
    } else {
      glowRef.current.scale.setScalar(1.2);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshBasicMaterial
          color={isCurrent ? '#F6A04D' : (isCompleted ? '#F7B36C' : '#F5F0EB')}
          transparent
          opacity={isFuture ? 0.15 : (isCompleted ? 0.6 : 0.9)}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshBasicMaterial
          color="#F6A04D"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      <Html center distanceFactor={12} style={{ pointerEvents: 'none' }} position={[0, 0.7, 0]}>
        <div style={{
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0,0,0,0.9)',
          opacity: isFuture ? 0.25 : 1,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{
            fontSize: '7px',
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.12em',
            color: isCompleted ? 'rgba(246,160,77,0.4)' : 'rgba(246,160,77,0.2)',
            marginBottom: '2px',
          }}>
            {isCompleted ? '✓' : `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: isCurrent ? 500 : 300,
            letterSpacing: '0.04em',
            color: isCurrent ? 'rgba(246,160,77,0.85)' : (isCompleted ? 'rgba(245,240,235,0.45)' : 'rgba(245,240,235,0.15)'),
          }}>
            {label}
          </div>
        </div>
      </Html>
    </group>
  );
}

function EnergyLine({ from, to, segmentIndex, currentStep, completed }: {
  from: [number, number, number];
  to: [number, number, number];
  segmentIndex: number;
  currentStep: number;
  completed: boolean;
}) {
  const isActive = segmentIndex <= currentStep || completed;
  const isCurrent = segmentIndex === currentStep && !completed;

  const lineObj = useMemo(() => {
    const mid = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 1.5,
      (from[2] + to[2]) / 2,
    );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      mid,
      new THREE.Vector3(...to),
    ]);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
    const mat = new THREE.LineBasicMaterial({
      color: TRAIL_COLOR,
      transparent: true,
      opacity: 0.1,
    });
    return new THREE.Line(geo, mat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    if (completed) {
      mat.opacity = 0.12 + Math.sin(clock.elapsedTime * 1.5 + segmentIndex * 0.3) * 0.04;
    } else if (isCurrent) {
      mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.12;
    } else {
      mat.opacity = isActive ? 0.18 : 0.03;
    }
  });

  return (
    <group>
      <primitive object={lineObj} />
    </group>
  );
}

function RouteParticles({ nodes, currentStep }: {
  nodes: { position: [number, number, number] }[];
  currentStep: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef<Float32Array>(null);
  const positionsRef = useRef<Float32Array>(null);

  if (!progressRef.current) {
    const prog = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) prog[i] = (i / PARTICLE_COUNT);
    progressRef.current = prog;
  }
  if (!positionsRef.current) {
    positionsRef.current = new Float32Array(PARTICLE_COUNT * 3);
  }

  useFrame(({ clock }) => {
    if (!pointsRef.current || nodes.length < 2 || !progressRef.current || !positionsRef.current) return;
    const t = clock.elapsedTime;
    const prog = progressRef.current;
    const pos = positionsRef.current;
    const totalSegments = nodes.length - 1;
    const frontier = (currentStep + 0.5) / totalSegments;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const speed = 0.004 + (i % 3) * 0.001;
      prog[i] += speed + Math.sin(t * 0.3 + i * 0.7) * 0.0008;

      if (prog[i] > frontier) prog[i] = Math.max(0, frontier - 0.3 - (i / PARTICLE_COUNT) * 0.2);

      const segProgress = prog[i] * totalSegments;
      const segIdx = Math.min(Math.floor(segProgress), totalSegments - 1);
      const segT = segProgress - segIdx;

      const a = nodes[segIdx].position;
      const b = nodes[Math.min(segIdx + 1, nodes.length - 1)].position;

      const midY = (a[1] + b[1]) / 2 + 1.5;
      const mt = 1 - segT;

      pos[i * 3] = mt * mt * a[0] + 2 * mt * segT * ((a[0] + b[0]) / 2) + segT * segT * b[0];
      pos[i * 3 + 1] = mt * mt * a[1] + 2 * mt * segT * midY + segT * segT * b[1];
      pos[i * 3 + 2] = mt * mt * a[2] + 2 * mt * segT * ((a[2] + b[2]) / 2) + segT * segT * b[2];
    }

    const geo = pointsRef.current.geometry;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.attributes.position.needsUpdate = true;
  });

  const initialPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={TRAIL_COLOR}
        size={0.07}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function CompletionBurst({ nodes }: { nodes: { position: [number, number, number] }[] }) {
  const burstRef = useRef<THREE.Points>(null);
  const startTime = useRef(0);

  const burstCount = 48;
  const burstPositions = useMemo(() => new Float32Array(burstCount * 3), []);
  const velocities = useRef<Float32Array>(null);

  if (!velocities.current) {
    const vel = new Float32Array(burstCount * 3);
    const lastNode = nodes[nodes.length - 1].position;
    for (let i = 0; i < burstCount; i++) {
      vel[i * 3] = (i * 2.399 % 1 - 0.5) * 2;
      vel[i * 3 + 1] = (i * 3.571 % 1 - 0.3) * 2;
      vel[i * 3 + 2] = (i * 1.618 % 1 - 0.5) * 2;
      burstPositions[i * 3] = lastNode[0];
      burstPositions[i * 3 + 1] = lastNode[1];
      burstPositions[i * 3 + 2] = lastNode[2];
    }
    velocities.current = vel;
  }

  useFrame(({ clock }) => {
    if (!burstRef.current || !velocities.current) return;
    if (startTime.current === 0) startTime.current = clock.elapsedTime;

    const elapsed = clock.elapsedTime - startTime.current;
    const decay = Math.exp(-elapsed * 0.8);
    const lastNode = nodes[nodes.length - 1].position;
    const pos = burstPositions;
    const vel = velocities.current;

    for (let i = 0; i < burstCount; i++) {
      pos[i * 3] = lastNode[0] + vel[i * 3] * elapsed * decay;
      pos[i * 3 + 1] = lastNode[1] + vel[i * 3 + 1] * elapsed * decay;
      pos[i * 3 + 2] = lastNode[2] + vel[i * 3 + 2] * elapsed * decay;
    }

    const geo = burstRef.current.geometry;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.attributes.position.needsUpdate = true;

    const mat = burstRef.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 0.6 * decay);
  });

  return (
    <points ref={burstRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[burstPositions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#F6A04D"
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
