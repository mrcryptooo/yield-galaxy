'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_POSITIONS } from './positions';
import type { PlanetInfo, Protocol } from './planet-data';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useViewStore } from '@/stores/view-store';

export function PlanetExperience({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  const focused = useGalaxyStore((s) => s.focused);
  if (!focused) return null;

  const planetPos = PLANET_POSITIONS[focused];
  if (!planetPos) return null;

  const data = planetData[focused];
  if (!data) return null;

  return (
    <group position={[planetPos.pos[0], planetPos.pos[1], planetPos.pos[2]]}>
      <InfoLayer data={data} />
      <ProtocolOrbits protocols={data.protocols} planetSize={planetPos.size} />
    </group>
  );
}

// Floating holographic AR card beside the planet — Task 8: premium info card
// with a visual pointer connecting it back to the body it describes.
function InfoLayer({ data }: { data: PlanetInfo }) {
  const ref = useRef<HTMLDivElement>(null);
  const setMode = useViewStore((s) => s.setMode);

  return (
    <Html
      position={[3.5, 2, 0]}
      distanceFactor={12}
      style={{ pointerEvents: 'none', width: '230px' }}
    >
      <div ref={ref} style={{ animation: 'fadeIn 0.8s ease-out', position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Pointer — connects the card visually back to the planet */}
        <div style={{
          position: 'absolute', left: '-34px', top: '50%', width: '32px', height: '1px',
          background: 'linear-gradient(90deg, rgba(246,160,77,0.5), rgba(246,160,77,0.05))',
        }} />
        <div style={{
          position: 'absolute', left: '-36px', top: 'calc(50% - 3px)', width: '6px', height: '6px',
          borderRadius: '50%', background: 'rgba(246,160,77,0.7)',
          boxShadow: '0 0 10px rgba(246,160,77,0.6)',
        }} />

        <div className="glass-panel-strong" style={{ padding: '16px 18px', width: '100%' }}>
          {/* Planet name — hero size, glowing */}
          <div style={{
            fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.03em',
            color: 'rgba(246,160,77,0.95)',
            textShadow: '0 0 24px rgba(246,160,77,0.3)',
            marginBottom: '6px',
          }}>
            {data.name}
          </div>

          {/* Description */}
          <div className="hud-body" style={{
            fontSize: '12.5px', marginBottom: '12px', color: 'rgba(245,240,235,0.65)',
          }}>
            {data.description}
          </div>

          {/* Stats — holographic feel, larger and readable */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            <StatLine label="TVL" value={data.tvl} />
            <StatLine label="APY" value={data.avgApy} accent />
            <StatLine label="PROTOCOLS" value={String(data.protocolCount)} />
          </div>

          <button
            onClick={() => setMode('list')}
            style={{
              width: '100%', pointerEvents: 'auto', cursor: 'pointer',
              background: 'rgba(246,160,77,0.1)',
              border: '1px solid rgba(246,160,77,0.3)',
              borderRadius: '8px', padding: '7px 0',
              fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
              color: 'rgba(246,160,77,0.9)',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
          >
            EXPLORE →
          </button>
        </div>
      </div>
    </Html>
  );
}

function StatLine({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontSize: '10px', letterSpacing: '0.14em', fontWeight: 600,
        color: 'rgba(246,160,77,0.45)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '15px', fontWeight: 500, letterSpacing: '0.01em',
        color: accent ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.85)',
        fontFamily: 'var(--font-geist-mono), monospace',
        textShadow: accent ? '0 0 14px rgba(246,160,77,0.3)' : 'none',
      }}>
        {value}
      </span>
    </div>
  );
}

// Protocols orbit the focused planet as small floating objects
function ProtocolOrbits({ protocols, planetSize }: { protocols: Protocol[]; planetSize: number }) {
  const selectedProtocol = useGalaxyStore((s) => s.selectedProtocol);

  return (
    <group>
      {protocols.slice(0, 6).map((proto, i) => (
        <ProtocolNode
          key={proto.id}
          protocol={proto}
          index={i}
          total={Math.min(protocols.length, 6)}
          orbitRadius={planetSize * 5 + 2}
          isSelected={selectedProtocol === proto.id}
          anySelected={selectedProtocol !== null}
        />
      ))}
    </group>
  );
}

function ProtocolNode({ protocol, index, total, orbitRadius, isSelected, anySelected }: {
  protocol: Protocol; index: number; total: number;
  orbitRadius: number; isSelected: boolean; anySelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const setSelectedProtocol = useGalaxyStore((s) => s.setSelectedProtocol);

  const baseAngle = (index / total) * Math.PI * 2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // Slow orbit
    const angle = baseAngle + t * 0.05;
    groupRef.current.position.set(
      Math.cos(angle) * orbitRadius,
      Math.sin(angle * 0.3) * 0.5 + (isSelected ? 0.3 : 0),
      Math.sin(angle) * orbitRadius,
    );
    // Scale spring
    const targetScale = isSelected ? 1.3 : (anySelected ? 0.7 : 1);
    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (targetScale - s) * 0.08);
  });

  return (
    <group ref={groupRef}>
      {/* Clickable sphere */}
      <mesh
        onClick={(e) => { e.stopPropagation(); setSelectedProtocol(isSelected ? null : protocol.id); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial
          color={isSelected ? '#F6A04D' : '#F7B36C'}
          transparent
          opacity={anySelected && !isSelected ? 0.3 : 0.7}
        />
      </mesh>

      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial
          color="#F6A04D"
          transparent
          opacity={isSelected ? 0.06 : 0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Protocol label — glass-backed */}
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }} position={[0, 0.4, 0]}>
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '5px 12px',
            opacity: anySelected && !isSelected ? 0.45 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div style={{
            fontSize: '12px', fontWeight: 600, letterSpacing: '0.03em',
            color: isSelected ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.8)',
          }}>
            {protocol.name}
          </div>
          <div style={{
            fontSize: '11px', fontFamily: 'var(--font-geist-mono), monospace',
            color: 'rgba(246,160,77,0.6)', marginTop: '1px',
          }}>
            {protocol.apy}%
          </div>
        </div>
      </Html>

      {/* Holographic data plate — only when selected */}
      {isSelected && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }} position={[1.5, 0.5, 0]}>
          <div className="glass-panel-strong" style={{
            width: '190px',
            padding: '14px',
            animation: 'fadeIn 0.5s ease-out',
          }}>
            <div style={{
              fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em',
              color: 'rgba(246,160,77,0.9)', marginBottom: '8px',
            }}>
              {protocol.name} · {protocol.type}
            </div>

            <HoloStat label="DEPOSIT APY" value={`${protocol.depositApy}%`} />
            {protocol.borrowApy > 0 && <HoloStat label="BORROW APY" value={`${protocol.borrowApy}%`} />}
            <HoloStat label="TVL" value={protocol.tvl} />
            <HoloStat label="RISK" value={protocol.risk} />
            <HoloStat label="UPDATED" value={protocol.updated} />

            {/* Mini sparkline — just a visual indicator */}
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'end', gap: '1px', height: '16px' }}>
              {[3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h * 1.5}px`, borderRadius: '1px',
                  background: `rgba(246,160,77,${0.15 + i * 0.03})`,
                }} />
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function HoloStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{
        fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600,
        color: 'rgba(246,160,77,0.5)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '12.5px', fontWeight: 500,
        color: 'rgba(245,240,235,0.85)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {value}
      </span>
    </div>
  );
}
