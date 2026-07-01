'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '@/stores/journey-store';

// Cinematic pacing: longer dwell at each destination, slightly slower travel,
// so a mission reads as a guided tour rather than a technical checklist.
const DWELL_TIME = 4.6;
const FLY_TIME = 2.6;

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
