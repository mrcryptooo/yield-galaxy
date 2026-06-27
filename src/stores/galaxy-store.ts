import { create } from 'zustand';

type PlanetName = 'USX' | 'eUSX' | 'SLX' | 'stSLX' | null;

interface GalaxyState {
  focused: PlanetName;
  hovered: PlanetName;
  setFocused: (planet: PlanetName) => void;
  setHovered: (planet: PlanetName) => void;
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  focused: null,
  hovered: null,
  setFocused: (planet) => set({ focused: planet }),
  setHovered: (planet) => set({ hovered: planet }),
}));
