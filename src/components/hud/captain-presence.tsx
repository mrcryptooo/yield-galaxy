'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useJourneyStore } from '@/stores/journey-store';
import { useCaptainStore } from '@/stores/captain-store';
import { useExecutionStore } from '@/stores/execution-store';
import { CAPTAIN_LINES } from '@/components/galaxy/focus-cameras';
import { CAPTAIN_PROTOCOL_LINES } from '@/components/galaxy/planet-data';
import { CAPTAIN_JOURNEY_LINES } from '@/lib/route-templates';

// Random idle chatter — only ever shown when nothing else has anything to say
const IDLE_DIALOGUE = [
  "All quiet in the Solstice sector, Explorer.",
  "Scanning for fresh yield signatures...",
  "The galaxy never stops moving. Neither do we.",
  "Whenever you're ready, I can plot a route.",
  "Every planet out there has a story. Ask me anything.",
  "Systems nominal. Standing by for your next move.",
  "I like this view. Feels like home.",
  "Let me know if you want the safest path or the fastest one.",
];

const CAPTAIN_IMAGES: Record<string, string> = {
  idle: '/assets/captain/captain-idle.webp',
  thinking: '/assets/captain/captain-holographic.webp',
  talking: '/assets/captain/captain-speaking.webp',
  success: '/assets/captain/captain-success.webp',
  alert: '/assets/captain/captain-alert.webp',
  default: '/assets/captain/captain-full-body.webp',
};

function getCaptainImage(captainState: string, focused: string | null, activeRoute: boolean): string {
  if (activeRoute) return CAPTAIN_IMAGES[captainState] ?? CAPTAIN_IMAGES.default;
  if (focused) return CAPTAIN_IMAGES.talking;
  return CAPTAIN_IMAGES.default;
}

export function CaptainPresence({ destinationCount }: { destinationCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const focused = useGalaxyStore((s) => s.focused);
  const hovered = useGalaxyStore((s) => s.hovered);
  const selectedProtocol = useGalaxyStore((s) => s.selectedProtocol);
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const completed = useJourneyStore((s) => s.completed);
  const captainState = useJourneyStore((s) => s.captainState);
  const captainSpeech = useCaptainStore((s) => s.currentSpeech);
  const briefing = useCaptainStore((s) => s.briefing);
  const executionSpeech = useExecutionStore((s) => s.executionSpeech);
  const executionPlan = useExecutionStore((s) => s.plan);

  // Idle dialogue: fires every 20-40s. The if/else priority chain below only
  // ever surfaces it as the last resort, after focus/route/protocol/hover/briefing.
  const [idleLine, setIdleLine] = useState<string | null>(null);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 20000 + Math.random() * 20000;
      timeout = setTimeout(() => {
        setIdleLine(IDLE_DIALOGUE[Math.floor(Math.random() * IDLE_DIALOGUE.length)]);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  let speech: string;
  let stateLabel: string = '';

  if (executionSpeech && executionPlan) {
    speech = executionSpeech;
    stateLabel = executionPlan.status === 'executing' ? 'EXECUTING' : executionPlan.status === 'completed' ? 'CONFIRMED' : executionPlan.status === 'failed' ? 'FAILED' : 'READY';
  } else if (activeRoute && completed) {
    speech = briefing?.idleSpeech
      ? `Route complete. ${briefing.analysis?.headline ?? 'Position established.'}`
      : 'Mission accomplished.';
    stateLabel = 'SUCCESS';
  } else if (activeRoute) {
    const node = activeRoute.nodes[activeRoute.currentStep];
    const dynamicLines = activeRoute.template._captainLines;
    const staticLines = CAPTAIN_JOURNEY_LINES[activeRoute.template.id];
    speech = dynamicLines?.[node.action] ?? staticLines?.[node.action] ?? `Navigating to ${node.label}.`;
    stateLabel = captainState === 'talking' ? 'NARRATING' : captainState === 'thinking' ? 'PLOTTING' : 'READY';
  } else if (selectedProtocol) {
    // Protocol.id is `${slug}__${opportunityId}` for React-key/selection
    // uniqueness (see build-planet-data.ts); CAPTAIN_PROTOCOL_LINES is keyed
    // by the slug alone, so recover it by splitting on the separator. Ids
    // without `__` (e.g. FALLBACK_PLANET_DATA) pass through unchanged.
    const protocolSlug = selectedProtocol.split('__')[0];
    speech = CAPTAIN_PROTOCOL_LINES[protocolSlug] ?? 'Scanning this protocol...';
  } else if (focused) {
    speech = CAPTAIN_LINES[focused] ?? 'Interesting choice, Explorer.';
  } else if (captainSpeech) {
    speech = captainSpeech.text;
    if (captainSpeech.tone === 'cautious') stateLabel = 'ALERT';
    else if (captainSpeech.tone === 'confident') stateLabel = 'ANALYSIS';
  } else if (hovered) {
    speech = `Take a closer look at ${hovered}?`;
  } else if (idleLine) {
    speech = idleLine;
  } else {
    speech = `Exploring Yield Galaxy. ${destinationCount ?? 16} destinations detected.`;
  }

  const captainImage = getCaptainImage(
    captainSpeech?.suggestedState ?? captainState,
    focused,
    !!activeRoute,
  );

  const isJourneyActive = !!activeRoute;
  const hasBriefing = !!captainSpeech && !isJourneyActive && !focused && !selectedProtocol;
  const speechColor = completed
    ? 'rgba(246,160,77,0.7)'
    : isJourneyActive
      ? 'rgba(245,240,235,0.65)'
      : captainSpeech?.tone === 'alert'
        ? 'rgba(246,160,77,0.6)'
        : captainSpeech?.tone === 'confident'
          ? 'rgba(245,240,235,0.6)'
          : focused
            ? 'rgba(245,240,235,0.6)'
            : 'rgba(245,240,235,0.45)';

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.008;
      if (containerRef.current) {
        const breathe = 1 + Math.sin(t * 0.35) * 0.01;
        const floatY = Math.sin(t * 0.2) * 2.0 + Math.sin(t * 0.55) * 0.8;
        const swayX = Math.sin(t * 0.12) * 0.5;
        containerRef.current.style.transform = `translate(${swayX}px, ${floatY}px) scale(${breathe})`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '32px', left: '8px',
      zIndex: 10, pointerEvents: 'none',
    }}>
      {/* State indicator */}
      {(isJourneyActive || hasBriefing) && stateLabel && (
        <div style={{
          marginBottom: '8px', marginLeft: '46px',
          fontSize: '11px', fontWeight: 600,
          fontFamily: 'var(--font-geist-mono), monospace',
          letterSpacing: '0.14em',
          color: completed
            ? 'rgba(246,160,77,0.5)'
            : stateLabel === 'ALERT'
              ? 'rgba(246,160,77,0.45)'
              : captainState === 'talking'
                ? 'rgba(246,160,77,0.35)'
                : 'rgba(245,240,235,0.18)',
          animation: 'fadeIn 0.4s ease-out',
        }}>
          {stateLabel}
        </div>
      )}

      {/* Speech — glass-backed, larger, always readable over the galaxy */}
      <div
        key={speech}
        className="glass-panel"
        style={{
          marginBottom: '12px', marginLeft: '46px', maxWidth: '260px',
          padding: '12px 16px',
          fontSize: 'var(--fs-body)', lineHeight: '1.6', fontWeight: 400,
          letterSpacing: '0.01em',
          color: speechColor,
          textShadow: completed
            ? '0 0 18px rgba(246,160,77,0.15)'
            : '0 0 12px rgba(246,160,77,0.06)',
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {speech}
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-45px',
          width: '190px', height: '190px', borderRadius: '50%',
          background: `radial-gradient(circle at 30% 40%, rgba(246,160,77,${completed ? 0.16 : 0.1}) 0%, transparent 60%)`,
          transition: 'background 1s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: '-25px', left: '30px',
          width: '150px', height: '60px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(246,160,77,0.06) 0%, transparent 70%)',
        }} />
        <Image
          src={captainImage}
          alt="Captain Whiskers"
          width={600} height={600}
          style={{
            width: '300px', height: '300px', objectFit: 'contain',
            position: 'relative', opacity: completed ? 1 : 0.95,
            animation: hovered || focused || activeRoute ? 'none' : 'blink 6s ease-in-out infinite',
            filter: completed
              ? 'drop-shadow(0 2px 32px rgba(246,160,77,0.22)) drop-shadow(2px 0 16px rgba(246,160,77,0.12))'
              : 'drop-shadow(0 2px 28px rgba(246,160,77,0.12)) drop-shadow(2px 0 14px rgba(246,160,77,0.06))',
            transition: 'filter 1s ease, opacity 1s ease',
          }}
          priority
        />
      </div>
    </div>
  );
}
