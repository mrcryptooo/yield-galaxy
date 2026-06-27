'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useJourneyStore } from '@/stores/journey-store';
import { CAPTAIN_LINES } from '@/components/galaxy/focus-cameras';
import { CAPTAIN_PROTOCOL_LINES } from '@/components/galaxy/planet-data';
import { CAPTAIN_JOURNEY_LINES } from '@/lib/route-templates';

const CAPTAIN_COMPLETION_LINES = [
  'Mission accomplished. Well flown, Explorer.',
  'Route complete. The yields are yours.',
  'Journey finished. The galaxy remembers.',
];

function getCaptainImage(captainState: string, focused: string | null, activeRoute: boolean): string {
  if (activeRoute) {
    switch (captainState) {
      case 'thinking': return '/assets/captain/captain-holographic.webp';
      case 'talking': return '/assets/captain/captain-speaking.webp';
      case 'success': return '/assets/captain/captain-full-body.webp';
      case 'alert': return '/assets/captain/captain-speaking.webp';
      default: return '/assets/captain/captain-full-body.webp';
    }
  }
  return focused ? '/assets/captain/captain-speaking.webp' : '/assets/captain/captain-full-body.webp';
}

export function CaptainPresence({ destinationCount }: { destinationCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const focused = useGalaxyStore((s) => s.focused);
  const selectedProtocol = useGalaxyStore((s) => s.selectedProtocol);
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const completed = useJourneyStore((s) => s.completed);
  const captainState = useJourneyStore((s) => s.captainState);

  let speech: string;
  if (activeRoute && completed) {
    const idx = activeRoute.template.name.length % CAPTAIN_COMPLETION_LINES.length;
    speech = CAPTAIN_COMPLETION_LINES[idx];
  } else if (activeRoute) {
    const node = activeRoute.nodes[activeRoute.currentStep];
    const dynamicLines = activeRoute.template._captainLines;
    const staticLines = CAPTAIN_JOURNEY_LINES[activeRoute.template.id];
    speech = dynamicLines?.[node.action] ?? staticLines?.[node.action] ?? `Navigating to ${node.label}.`;
  } else if (selectedProtocol) {
    speech = CAPTAIN_PROTOCOL_LINES[selectedProtocol] ?? 'Scanning this protocol...';
  } else if (focused) {
    speech = CAPTAIN_LINES[focused] ?? 'Interesting choice, Explorer.';
  } else {
    speech = `Exploring Solstice Galaxy. ${destinationCount ?? 16} destinations detected.`;
  }

  const captainImage = getCaptainImage(captainState, focused, !!activeRoute);

  const isJourneyActive = !!activeRoute;
  const speechColor = completed
    ? 'rgba(246,160,77,0.6)'
    : isJourneyActive
      ? 'rgba(245,240,235,0.6)'
      : focused
        ? 'rgba(245,240,235,0.55)'
        : 'rgba(245,240,235,0.4)';

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.008;
      if (containerRef.current) {
        const breathe = 1 + Math.sin(t * 0.4) * 0.008;
        const floatY = Math.sin(t * 0.25) * 1.5 + Math.sin(t * 0.6) * 0.5;
        const swayX = Math.sin(t * 0.15) * 0.3;
        containerRef.current.style.transform = `translate(${swayX}px, ${floatY}px) scale(${breathe})`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '44px', left: '8px',
      zIndex: 10, pointerEvents: 'none',
    }}>
      {/* State indicator */}
      {isJourneyActive && (
        <div style={{
          marginBottom: '4px', marginLeft: '32px',
          fontSize: '7px',
          fontFamily: 'var(--font-geist-mono), monospace',
          letterSpacing: '0.15em',
          color: completed
            ? 'rgba(246,160,77,0.4)'
            : captainState === 'talking'
              ? 'rgba(246,160,77,0.3)'
              : 'rgba(245,240,235,0.15)',
          animation: 'fadeIn 0.4s ease-out',
        }}>
          {completed ? 'SUCCESS' : captainState === 'talking' ? 'NARRATING' : captainState === 'thinking' ? 'PLOTTING' : 'READY'}
        </div>
      )}

      {/* Speech */}
      <div
        key={speech}
        style={{
          marginBottom: '8px', marginLeft: '32px', maxWidth: '190px',
          fontSize: '10px', lineHeight: '1.65', fontWeight: 300,
          letterSpacing: '0.02em',
          color: speechColor,
          textShadow: completed
            ? '0 0 15px rgba(246,160,77,0.12)'
            : '0 0 15px rgba(246,160,77,0.06)',
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {speech}
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-30px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: `radial-gradient(circle at 30% 40%, rgba(246,160,77,${completed ? 0.12 : 0.07}) 0%, transparent 60%)`,
          transition: 'background 1s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15px', left: '20px',
          width: '100px', height: '40px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(246,160,77,0.04) 0%, transparent 70%)',
        }} />
        <Image
          src={captainImage}
          alt="Captain Whiskers"
          width={400} height={400}
          style={{
            width: '168px', height: '168px', objectFit: 'contain',
            position: 'relative', opacity: completed ? 1 : 0.9,
            filter: completed
              ? 'drop-shadow(0 2px 24px rgba(246,160,77,0.15)) drop-shadow(2px 0 12px rgba(246,160,77,0.08))'
              : 'drop-shadow(0 2px 20px rgba(246,160,77,0.08)) drop-shadow(2px 0 10px rgba(246,160,77,0.04))',
            transition: 'filter 1s ease, opacity 1s ease',
          }}
          priority
        />
      </div>
    </div>
  );
}
