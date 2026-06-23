'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function NebulaBackground() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -30]} scale={[80, 80, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          uColor1: { value: new THREE.Color('#0A0E1A') },
          uColor2: { value: new THREE.Color('#1a1535') },
          uColor3: { value: new THREE.Color('#0d1225') },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          varying vec2 vUv;
          void main() {
            float d = distance(vUv, vec2(0.5));
            vec3 col = mix(uColor2, uColor1, smoothstep(0.0, 0.5, d));
            col = mix(col, uColor3, smoothstep(0.3, 0.7, vUv.x * 0.5 + vUv.y * 0.5));
            float alpha = 1.0 - smoothstep(0.4, 0.55, d);
            gl_FragColor = vec4(col, alpha * 0.6);
          }
        `}
      />
    </mesh>
  );
}
