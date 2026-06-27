'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useJourneyStore } from '@/stores/journey-store';

const TRAIL_COLOR = new THREE.Color('#F6A04D');
const DIM_COLOR = new THREE.Color('#F6A04D');
const PARTICLE_COUNT = 24;

export function RouteTrails() {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
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
          />
        );
      })}

      <RouteParticles nodes={activeRoute.nodes} />
    </group>
  );
}

function RouteNodeMarker({ position, label, index, currentStep, total }: {
  position: [number, number, number];
  label: string;
  index: number;
  currentStep: number;
  total: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const isCompleted = index < currentStep;
  const isCurrent = index === currentStep;
  const isFuture = index > currentStep;

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = clock.elapsedTime;

    const targetScale = isCurrent ? 1.2 : (isCompleted ? 0.8 : 0.6);
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(s + (targetScale - s) * 0.06);

    if (isCurrent) {
      const pulse = 1 + Math.sin(t * 3) * 0.15;
      glowRef.current.scale.setScalar(pulse * 2.5);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 2) * 0.03;
    } else {
      glowRef.current.scale.setScalar(1.5);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isCompleted ? 0.03 : 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshBasicMaterial
          color={isCurrent ? '#F6A04D' : (isCompleted ? '#F7B36C' : '#F5F0EB')}
          transparent
          opacity={isFuture ? 0.2 : (isCompleted ? 0.5 : 0.8)}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial
          color="#F6A04D"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      <Html center distanceFactor={12} style={{ pointerEvents: 'none' }} position={[0, 0.6, 0]}>
        <div style={{
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0,0,0,0.9)',
          opacity: isFuture ? 0.3 : 1,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{
            fontSize: '7px',
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.12em',
            color: 'rgba(246,160,77,0.3)',
            marginBottom: '2px',
          }}>
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: isCurrent ? 500 : 300,
            letterSpacing: '0.04em',
            color: isCurrent ? 'rgba(246,160,77,0.8)' : (isCompleted ? 'rgba(245,240,235,0.4)' : 'rgba(245,240,235,0.2)'),
          }}>
            {label}
          </div>
        </div>
      </Html>
    </group>
  );
}

function EnergyLine({ from, to, segmentIndex, currentStep }: {
  from: [number, number, number];
  to: [number, number, number];
  segmentIndex: number;
  currentStep: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isActive = segmentIndex <= currentStep;
  const isCurrent = segmentIndex === currentStep;

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
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
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
    if (isCurrent) {
      mat.opacity = 0.3 + Math.sin(clock.elapsedTime * 4) * 0.1;
    } else {
      mat.opacity = isActive ? 0.15 : 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={lineObj} />
    </group>
  );
}

function RouteParticles({ nodes }: {
  nodes: { position: [number, number, number] }[];
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

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      prog[i] += 0.003 + Math.sin(t * 0.5 + i) * 0.001;
      if (prog[i] > 1) prog[i] = 0;

      const totalSegments = nodes.length - 1;
      const segProgress = prog[i] * totalSegments;
      const segIdx = Math.min(Math.floor(segProgress), totalSegments - 1);
      const segT = segProgress - segIdx;

      const a = nodes[segIdx].position;
      const b = nodes[segIdx + 1].position;

      const midY = (a[1] + b[1]) / 2 + 1.5;
      const t2 = segT;
      const mt = 1 - t2;

      pos[i * 3] = mt * mt * a[0] + 2 * mt * t2 * ((a[0] + b[0]) / 2) + t2 * t2 * b[0];
      pos[i * 3 + 1] = mt * mt * a[1] + 2 * mt * t2 * midY + t2 * t2 * b[1];
      pos[i * 3 + 2] = mt * mt * a[2] + 2 * mt * t2 * ((a[2] + b[2]) / 2) + t2 * t2 * b[2];
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
        color={DIM_COLOR}
        size={0.06}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
