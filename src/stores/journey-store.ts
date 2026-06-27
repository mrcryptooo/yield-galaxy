import { create } from 'zustand';
import type { ActiveRoute } from '@/lib/route-engine';
import { buildRoute } from '@/lib/route-engine';
import type { RouteTemplate } from '@/lib/route-engine';

interface JourneyState {
  activeRoute: ActiveRoute | null;
  startJourney: (template: RouteTemplate) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  endJourney: () => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  activeRoute: null,

  startJourney: (template) => {
    set({ activeRoute: buildRoute(template) });
  },

  nextStep: () => set((state) => {
    if (!state.activeRoute) return state;
    const next = Math.min(state.activeRoute.currentStep + 1, state.activeRoute.nodes.length - 1);
    return { activeRoute: { ...state.activeRoute, currentStep: next } };
  }),

  prevStep: () => set((state) => {
    if (!state.activeRoute) return state;
    const prev = Math.max(state.activeRoute.currentStep - 1, 0);
    return { activeRoute: { ...state.activeRoute, currentStep: prev } };
  }),

  goToStep: (index) => set((state) => {
    if (!state.activeRoute) return state;
    const clamped = Math.max(0, Math.min(index, state.activeRoute.nodes.length - 1));
    return { activeRoute: { ...state.activeRoute, currentStep: clamped } };
  }),

  endJourney: () => set({ activeRoute: null }),
}));
