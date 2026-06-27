import { create } from 'zustand';

type PlanetName = 'USX' | 'eUSX' | 'SLX' | 'stSLX' | null;

interface GalaxyState {
  focused: PlanetName;
  hovered: PlanetName;
  selectedProtocol: string | null;
  setFocused: (planet: PlanetName) => void;
  setHovered: (planet: PlanetName) => void;
  setSelectedProtocol: (id: string | null) => void;
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  focused: null,
  hovered: null,
  selectedProtocol: null,
  setFocused: (planet) => set({ focused: planet, selectedProtocol: null }),
  setHovered: (planet) => set({ hovered: planet }),
  setSelectedProtocol: (id) => set({ selectedProtocol: id }),
}));
