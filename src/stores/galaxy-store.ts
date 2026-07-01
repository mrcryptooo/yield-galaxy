import { create } from 'zustand';

type PlanetName = 'USX' | 'eUSX' | 'SLX' | 'stSLX' | null;
type StationName = string | null;

interface GalaxyState {
  focused: PlanetName;
  hovered: PlanetName;
  // Stations behave exactly like planets (focus camera + info panel + Captain
  // explanation) but are a separate celestial category, so they get their
  // own parallel focus/hover state rather than overloading PlanetName.
  focusedStation: StationName;
  hoveredStation: StationName;
  selectedProtocol: string | null;
  setFocused: (planet: PlanetName) => void;
  setHovered: (planet: PlanetName) => void;
  setFocusedStation: (station: StationName) => void;
  setHoveredStation: (station: StationName) => void;
  setSelectedProtocol: (id: string | null) => void;
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  focused: null,
  hovered: null,
  focusedStation: null,
  hoveredStation: null,
  selectedProtocol: null,
  // Focusing a planet clears station focus and vice versa — only one body
  // is ever "in focus" at a time, same as the existing planet/protocol rule.
  setFocused: (planet) => set({ focused: planet, focusedStation: null, selectedProtocol: null }),
  setHovered: (planet) => set({ hovered: planet }),
  setFocusedStation: (station) => set({ focusedStation: station, focused: null, selectedProtocol: null }),
  setHoveredStation: (station) => set({ hoveredStation: station }),
  setSelectedProtocol: (id) => set({ selectedProtocol: id }),
}));
