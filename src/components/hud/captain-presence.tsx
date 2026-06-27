'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useJourneyStore } from '@/stores/journey-store';
import { CAPTAIN_LINES } from '@/components/galaxy/focus-cameras';
import { CAPTAIN_PROTOCOL_LINES } from '@/components/galaxy/planet-data';
import { CAPTAIN_JOURNEY_LINES } from '@/lib/route-templates';

export function CaptainPresence({ destinationCount }: { destinationCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const focused = useGalaxyStore((s) => s.focused);
  const selectedProtocol = useGalaxyStore((s) => s.selectedProtocol);
  const activeRoute = useJourneyStore((s) => s.activeRoute);

  let speech: string;
  if (activeRoute) {
    const node = activeRoute.nodes[activeRoute.currentStep];
    const routeLines = CAPTAIN_JOURNEY_LINES[activeRoute.template.id];
    speech = routeLines?.[node.action] ?? `Navigating to ${node.label}.`;
  } else if (selectedProtocol) {
    speech = CAPTAIN_PROTOCOL_LINES[selectedProtocol] ?? 'Scanning this protocol...';
  } else if (focused) {
    speech = CAPTAIN_LINES[focused] ?? 'Interesting choice, Explorer.';
  } else {
    speech = `Exploring Solstice Galaxy. ${destinationCount ?? 16} destinations detected.`;
  }

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
      {/* Speech — one sentence, contextual */}
      <div
        key={speech}
        style={{
          marginBottom: '8px', marginLeft: '32px', maxWidth: '190px',
          fontSize: '10px', lineHeight: '1.65', fontWeight: 300,
          letterSpacing: '0.02em',
          color: focused ? 'rgba(245,240,235,0.55)' : 'rgba(245,240,235,0.4)',
          textShadow: '0 0 15px rgba(246,160,77,0.06)',
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {speech}
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-30px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 40%, rgba(246,160,77,0.07) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15px', left: '20px',
          width: '100px', height: '40px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(246,160,77,0.04) 0%, transparent 70%)',
        }} />
        <Image
          src={focused ? '/assets/captain/captain-speaking.webp' : '/assets/captain/captain-full-body.webp'}
          alt="Captain Whiskers"
          width={400} height={400}
          style={{
            width: '168px', height: '168px', objectFit: 'contain',
            position: 'relative', opacity: 0.9,
            filter: 'drop-shadow(0 2px 20px rgba(246,160,77,0.08)) drop-shadow(2px 0 10px rgba(246,160,77,0.04))',
          }}
          priority
        />
      </div>
    </div>
  );
}
