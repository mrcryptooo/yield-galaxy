import { create } from 'zustand';
import type { ActiveRoute } from '@/lib/route-engine';
import { buildRoute } from '@/lib/route-engine';
import type { RouteTemplate } from '@/lib/route-engine';

export type CaptainState = 'idle' | 'thinking' | 'talking' | 'success' | 'alert';

interface JourneyState {
  activeRoute: ActiveRoute | null;
  playing: boolean;
  completed: boolean;
  captainState: CaptainState;
  startJourney: (template: RouteTemplate) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  togglePlaying: () => void;
  setCompleted: () => void;
  setCaptainState: (state: CaptainState) => void;
  endJourney: () => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  activeRoute: null,
  playing: false,
  completed: false,
  captainState: 'idle',

  startJourney: (template) => {
    set({
      activeRoute: buildRoute(template),
      playing: true,
      completed: false,
      captainState: 'thinking',
    });
  },

  nextStep: () => set((state) => {
    if (!state.activeRoute) return state;
    const next = state.activeRoute.currentStep + 1;
    if (next >= state.activeRoute.nodes.length) {
      return { ...state, completed: true, playing: false, captainState: 'success' };
    }
    return {
      activeRoute: { ...state.activeRoute, currentStep: next },
      captainState: 'thinking',
    };
  }),

  prevStep: () => set((state) => {
    if (!state.activeRoute) return state;
    const prev = Math.max(state.activeRoute.currentStep - 1, 0);
    return {
      activeRoute: { ...state.activeRoute, currentStep: prev },
      captainState: 'thinking',
    };
  }),

  goToStep: (index) => set((state) => {
    if (!state.activeRoute) return state;
    const clamped = Math.max(0, Math.min(index, state.activeRoute.nodes.length - 1));
    return { activeRoute: { ...state.activeRoute, currentStep: clamped } };
  }),

  togglePlaying: () => set((state) => ({ playing: !state.playing })),

  setCompleted: () => set({ completed: true, playing: false, captainState: 'success' }),

  setCaptainState: (captainState) => set({ captainState }),

  endJourney: () => set({
    activeRoute: null,
    playing: false,
    completed: false,
    captainState: 'idle',
  }),
}));
