'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { useJourneyStore } from '@/stores/journey-store';
import { useCaptainStore } from '@/stores/captain-store';
import { useExecutionStore } from '@/stores/execution-store';
import { useOptimizerStore } from '@/stores/optimizer-store';
import { useViewStore } from '@/stores/view-store';
import { CAPTAIN_LINES } from '@/components/galaxy/focus-cameras';
import { CAPTAIN_PROTOCOL_LINES } from '@/components/galaxy/planet-data';
import type { PlanetInfo } from '@/components/galaxy/planet-data';
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
  "Hover a planet or station — I'll tell you what I know.",
  "Yields shift by the minute out here. Worth another scan.",
  "Try the optimizer — I'll find you the smartest path.",
  "Every station runs its own risk profile. Ask before you dock.",
  "I've charted every route in this sector. Just say the word.",
  "Patience pays out here — literally.",
  "Four planets, five stations, endless combinations.",
  "Some yields look too good to be true. I check those twice.",
  "The safest path isn't always the slowest one out here.",
  "Ask me about risk grades — I never sugarcoat them.",
  "A quiet market is a good time to plan your next move.",
  "I've seen APYs swing hard overnight. Stay sharp.",
  "Diversifying across protocols usually pays off long-term.",
  "Click List View if you'd rather see everything at once.",
  "Every mission you complete, I remember.",
  "Loopscale runs tighter risk controls than most. Worth knowing.",
];

// Station explanations for hover — short, one glance. Mirrors CAPTAIN_LINES
// (planets) so every hoverable body in the galaxy gets a real explanation.
const STATION_LINES: Record<string, string> = {
  Kamino: 'Kamino — the lending hub. Deposit, borrow, and loop for leveraged yield.',
  Orca: 'Orca — liquidity pools and swaps. Higher reward, impermanent loss risk.',
  Raydium: 'Raydium — concentrated liquidity and AMM pairs. Fast, efficient, volatile.',
  Loopscale: 'Loopscale — structured lending with tighter risk controls.',
  Exponent: 'Exponent — where PT and YT markets live. Fixed yield or leveraged upside.',
};

// Focus explanations — fuller: what it is, whether it's safe, what to do.
// One extra beat of real guidance instead of just re-stating the hover line.
const STATION_FOCUS_LINES: Record<string, string> = {
  Kamino: 'Kamino — the lending hub. Deposit, borrow, and loop for leveraged yield. Grade A-B liquidity here — one of the safer docks in the sector. Good place to start if you\'re new.',
  Orca: 'Orca — liquidity pools and swaps. Yields run hot, but impermanent loss is real if the pair moves. Worth it if you believe both sides hold steady.',
  Raydium: 'Raydium — concentrated liquidity and AMM pairs. Fast and efficient, but volatile — check the pool\'s TVL before committing size.',
  Loopscale: 'Loopscale — structured lending with tighter risk controls than most. A solid pick if safety matters more than raw yield.',
  Exponent: 'Exponent — home of PT and YT markets. PT locks a fixed rate to maturity; YT is leveraged upside with more risk. Know which one you want before minting.',
};

const CAPTAIN_IMAGES: Record<string, string> = {
  idle: '/assets/captain/captain-idle.webp',
  thinking: '/assets/captain/captain-holographic.webp',
  talking: '/assets/captain/captain-speaking.webp',
  success: '/assets/captain/captain-success.webp',
  alert: '/assets/captain/captain-alert.webp',
  default: '/assets/captain/captain-full-body.webp',
};

function getCaptainImage(captainState: string, focused: string | null, activeRoute: boolean, discovering: boolean): string {
  if (activeRoute) return CAPTAIN_IMAGES[captainState] ?? CAPTAIN_IMAGES.default;
  if (focused) return CAPTAIN_IMAGES.talking;
  // "Discovery" — hovering something without committing to it yet reads as
  // the Captain considering/scanning, not fully narrating.
  if (discovering) return CAPTAIN_IMAGES.thinking;
  return CAPTAIN_IMAGES.default;
}

export function CaptainPresence({ destinationCount, bestOpportunitySummary, planetData }: { destinationCount?: number; bestOpportunitySummary?: string; planetData?: Record<string, PlanetInfo> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const focused = useGalaxyStore((s) => s.focused);
  const hovered = useGalaxyStore((s) => s.hovered);
  const focusedStation = useGalaxyStore((s) => s.focusedStation);
  const hoveredStation = useGalaxyStore((s) => s.hoveredStation);
  const selectedProtocol = useGalaxyStore((s) => s.selectedProtocol);
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const completed = useJourneyStore((s) => s.completed);
  const captainState = useJourneyStore((s) => s.captainState);
  const captainSpeech = useCaptainStore((s) => s.currentSpeech);
  const briefing = useCaptainStore((s) => s.briefing);
  const executionSpeech = useExecutionStore((s) => s.executionSpeech);
  const executionPlan = useExecutionStore((s) => s.plan);
  const viewMode = useViewStore((s) => s.mode);
  const riskPreference = useOptimizerStore((s) => s.riskPreference);

  // Idle dialogue: fires every 20-40s, never repeating the immediately
  // previous line. The if/else priority chain below only ever surfaces it as
  // the last resort, after focus/route/protocol/hover/briefing.
  const [idleLine, setIdleLine] = useState<string | null>(null);
  const lastIdleIndex = useRef(-1);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 20000 + Math.random() * 20000;
      timeout = setTimeout(() => {
        let next = Math.floor(Math.random() * IDLE_DIALOGUE.length);
        if (IDLE_DIALOGUE.length > 1) {
          while (next === lastIdleIndex.current) next = Math.floor(Math.random() * IDLE_DIALOGUE.length);
        }
        lastIdleIndex.current = next;
        setIdleLine(IDLE_DIALOGUE[next]);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  // Transient reactions: brief acknowledgement when the user switches view or
  // changes the optimizer's risk preference, then fades back to whatever the
  // priority chain would otherwise show.
  const [transientLine, setTransientLine] = useState<string | null>(null);
  const mountedView = useRef(false);
  useEffect(() => {
    if (!mountedView.current) { mountedView.current = true; return; }
    setTransientLine(viewMode === 'list' ? 'List view — every opportunity, sorted and scored side by side.' : 'Back in the galaxy. Click any body to focus it.');
    const t = setTimeout(() => setTransientLine(null), 4000);
    return () => clearTimeout(t);
  }, [viewMode]);

  const mountedRisk = useRef(false);
  useEffect(() => {
    if (!mountedRisk.current) { mountedRisk.current = true; return; }
    const label = riskPreference === 'conservative' ? 'the safest routes' : riskPreference === 'aggressive' ? 'maximum yield' : 'a balanced path';
    setTransientLine(`Recalculating for ${label}.`);
    const t = setTimeout(() => setTransientLine(null), 4000);
    return () => clearTimeout(t);
  }, [riskPreference]);

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
    // Explain the planet, why its numbers matter, and what's safe to do —
    // not just flavor text.
    const info = planetData?.[focused];
    const base = CAPTAIN_LINES[focused] ?? 'Interesting choice, Explorer.';
    if (info) {
      const best = info.protocols[0];
      const safety = best && ['A', 'B'].includes(best.risk)
        ? `${best.name} looks like the safest entry.`
        : best
          ? `${best.name} leads on yield, but mind the ${best.risk}-grade risk.`
          : '';
      speech = `${base} TVL ${info.tvl}, best yield ${info.avgApy} across ${info.protocolCount} protocol${info.protocolCount === 1 ? '' : 's'}. ${safety}`;
    } else {
      speech = base;
    }
  } else if (focusedStation) {
    speech = STATION_FOCUS_LINES[focusedStation] ?? STATION_LINES[focusedStation] ?? `Docking at ${focusedStation}. Let's see what's here.`;
  } else if (captainSpeech) {
    speech = captainSpeech.text;
    if (captainSpeech.tone === 'cautious') stateLabel = 'ALERT';
    else if (captainSpeech.tone === 'confident') stateLabel = 'ANALYSIS';
  } else if (hovered) {
    speech = CAPTAIN_LINES[hovered] ?? `Take a closer look at ${hovered}?`;
  } else if (hoveredStation) {
    speech = STATION_LINES[hoveredStation] ?? `Take a closer look at ${hoveredStation}?`;
  } else if (transientLine) {
    speech = transientLine;
  } else if (idleLine) {
    speech = idleLine;
  } else {
    speech = bestOpportunitySummary
      ? `Exploring Yield Galaxy. ${bestOpportunitySummary}`
      : `Exploring Yield Galaxy. ${destinationCount ?? 16} destinations detected.`;
  }

  const captainImage = getCaptainImage(
    captainSpeech?.suggestedState ?? captainState,
    focused ?? focusedStation,
    !!activeRoute,
    !!(hovered || hoveredStation) && !focused && !focusedStation,
  );

  const isJourneyActive = !!activeRoute;
  const hasBriefing = !!captainSpeech && !isJourneyActive && !focused && !focusedStation && !selectedProtocol;
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

  // Lives inside the Left shell panel — a normal flow child, pushed to the
  // bottom of the panel's flex column via marginTop:auto.
  return (
    <div style={{
      pointerEvents: 'none',
      borderTop: '1px solid rgba(246,160,77,0.1)',
      paddingTop: '16px',
      marginTop: 'auto',
      width: '100%',
    }}>
      {/* State indicator */}
      {(isJourneyActive || hasBriefing) && stateLabel && (
        <div style={{
          marginBottom: '8px',
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
          animation: 'fadeIn var(--dur-base) var(--ease-premium) both',
        }}>
          {stateLabel}
        </div>
      )}

      {/* Speech — glass-backed, larger, always readable over the galaxy */}
      <div
        key={speech}
        className="glass-panel"
        style={{
          marginBottom: '14px', width: '100%',
          padding: '12px 16px',
          fontSize: 'var(--fs-body)', lineHeight: '1.6', fontWeight: 400,
          letterSpacing: '0.01em',
          color: speechColor,
          textShadow: completed
            ? '0 0 18px rgba(246,160,77,0.15)'
            : '0 0 12px rgba(246,160,77,0.06)',
          animation: 'fadeIn var(--dur-slow) var(--ease-premium) both',
          boxSizing: 'border-box',
        }}
      >
        {speech}
      </div>

      <div ref={containerRef} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', top: '-10px', right: '10px',
          width: '150px', height: '150px', borderRadius: '50%',
          background: `radial-gradient(circle at 30% 40%, rgba(246,160,77,${completed ? 0.16 : 0.1}) 0%, transparent 60%)`,
          transition: 'background 1s ease',
        }} />
        <Image
          src={captainImage}
          alt="Captain Whiskers"
          width={500} height={500}
          style={{
            width: '220px', height: '220px', objectFit: 'contain',
            position: 'relative', opacity: completed ? 1 : 0.95,
            animation: hovered || hoveredStation || focused || focusedStation || activeRoute ? 'none' : 'blink 6s ease-in-out infinite',
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
