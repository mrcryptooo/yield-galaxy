import { create } from 'zustand';

type ViewMode = 'galaxy' | 'list';

interface ViewState {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  mode: 'galaxy',
  setMode: (mode) => set({ mode }),
}));
