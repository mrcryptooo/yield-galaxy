import { create } from 'zustand';
import type { ExecutionPlan, ExecutionStep } from '@/lib/execution/execution-state';
import type { SimulationResult } from '@/lib/execution/simulation';
import type { ExecutionReceipt } from '@/lib/execution/receipt';

interface ExecutionState {
  plan: ExecutionPlan | null;
  simulation: SimulationResult | null;
  receipt: ExecutionReceipt | null;
  executionSpeech: string | null;

  setPlan: (plan: ExecutionPlan) => void;
  setSimulation: (sim: SimulationResult) => void;
  updateStep: (index: number, step: ExecutionStep) => void;
  updatePlanStatus: (status: ExecutionPlan['status']) => void;
  setReceipt: (receipt: ExecutionReceipt) => void;
  setExecutionSpeech: (speech: string) => void;
  clear: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  plan: null,
  simulation: null,
  receipt: null,
  executionSpeech: null,

  setPlan: (plan) => set({ plan, simulation: null, receipt: null }),

  setSimulation: (simulation) => set({ simulation }),

  updateStep: (index, step) => set((state) => {
    if (!state.plan) return state;
    const steps = [...state.plan.steps];
    steps[index] = step;
    return { plan: { ...state.plan, steps } };
  }),

  updatePlanStatus: (status) => set((state) => {
    if (!state.plan) return state;
    return { plan: { ...state.plan, status } };
  }),

  setReceipt: (receipt) => set({ receipt }),

  setExecutionSpeech: (executionSpeech) => set({ executionSpeech }),

  clear: () => set({ plan: null, simulation: null, receipt: null, executionSpeech: null }),
}));
