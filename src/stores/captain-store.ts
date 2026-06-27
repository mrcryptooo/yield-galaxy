import { create } from 'zustand';
import type { CaptainBriefing } from '@/lib/captain/summary';
import type { CaptainSpeech } from '@/lib/captain/speech';

interface CaptainStore {
  briefing: CaptainBriefing | null;
  currentSpeech: CaptainSpeech | null;
  setBriefing: (briefing: CaptainBriefing) => void;
  setSpeech: (speech: CaptainSpeech) => void;
  clear: () => void;
}

export const useCaptainStore = create<CaptainStore>((set) => ({
  briefing: null,
  currentSpeech: null,
  setBriefing: (briefing) => set({ briefing, currentSpeech: briefing.speech }),
  setSpeech: (currentSpeech) => set({ currentSpeech }),
  clear: () => set({ briefing: null, currentSpeech: null }),
}));
