'use client';

import { useEffect } from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { PLANET_POSITIONS, STATION_POSITIONS } from './positions';

const PLANET_NAMES = new Set(Object.keys(PLANET_POSITIONS));
const STATION_NAMES = new Set(Object.keys(STATION_POSITIONS));

// "Camera is the guide" — the world no longer draws mission graphics inside
// the galaxy. Instead, the current mission step drives the SAME focus state
// a manual click would (galaxy-store's focused/focusedStation), so the
// existing highlight/dim/Left-Panel system does the work: the camera flight
// itself already reacts to activeRoute in galaxy-camera.tsx (untouched,
// locked), this just keeps "what's highlighted" in sync with "where the
// camera is going" without any new floating UI in the 3D world.
export function MissionFocusSync() {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const completed = useJourneyStore((s) => s.completed);
  const setFocused = useGalaxyStore((s) => s.setFocused);
  const setFocusedStation = useGalaxyStore((s) => s.setFocusedStation);

  useEffect(() => {
    if (!activeRoute || completed) return;
    const node = activeRoute.nodes[activeRoute.currentStep];
    if (!node) return;

    if (PLANET_NAMES.has(node.celestialKey)) {
      setFocused(node.celestialKey as 'USX' | 'eUSX' | 'SLX' | 'stSLX');
    } else if (STATION_NAMES.has(node.celestialKey)) {
      setFocusedStation(node.celestialKey);
    }
    // Moon steps (PT-USX etc.) have no Left Panel card yet — leave whatever
    // was last highlighted rather than clearing it to nothing.
  }, [activeRoute?.template.id, activeRoute?.currentStep, completed, setFocused, setFocusedStation]);

  // Clear the highlight when the mission ends so the galaxy returns to its
  // normal, unfocused state.
  useEffect(() => {
    if (!activeRoute) {
      setFocused(null);
      setFocusedStation(null);
    }
  }, [activeRoute, setFocused, setFocusedStation]);

  return null;
}
