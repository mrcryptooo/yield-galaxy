'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/stores/journey-store';

// Cinematic pacing: long dwell at each destination — enough time for
// Captain's line, the estimate, and the reason to actually be read — and
// slower travel, so a mission reads as a guided tour, not a checklist.
const DWELL_TIME = 7.5;
const FLY_TIME = 3.4;

export function JourneyPlayer() {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const playing = useJourneyStore((s) => s.playing);
  const completed = useJourneyStore((s) => s.completed);
  const nextStep = useJourneyStore((s) => s.nextStep);
  const setCaptainState = useJourneyStore((s) => s.setCaptainState);

  const timer = useRef(0);
  const phase = useRef<'flying' | 'dwelling' | 'done'>('flying');
  const lastStep = useRef(-1);

  useEffect(() => {
    if (!activeRoute) {
      lastStep.current = -1;
      phase.current = 'flying';
      timer.current = 0;
      return;
    }
    if (activeRoute.currentStep !== lastStep.current) {
      lastStep.current = activeRoute.currentStep;
      phase.current = 'flying';
      timer.current = 0;
    }
  }, [activeRoute]);

  useFrame((_, delta) => {
    if (!activeRoute || !playing || completed) return;

    timer.current += delta;

    if (phase.current === 'flying') {
      if (timer.current > 0.3) {
        setCaptainState('talking');
      }
      if (timer.current >= FLY_TIME) {
        phase.current = 'dwelling';
        timer.current = 0;
      }
      return;
    }

    if (phase.current === 'dwelling') {
      if (timer.current >= DWELL_TIME) {
        nextStep();
        phase.current = 'flying';
        timer.current = 0;
      }
      return;
    }
  });

  return null;
}
