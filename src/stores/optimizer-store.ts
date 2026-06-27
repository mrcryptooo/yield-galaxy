import { create } from 'zustand';
import type { OptimizerResult, OptimizedRoute } from '@/lib/optimizer/optimizer';
import type { RiskPreference } from '@/lib/optimizer/constraints';
import type { OpportunityGraph } from '@/lib/optimizer/opportunity-graph';

interface OptimizerState {
  result: OptimizerResult | null;
  graph: OpportunityGraph | null;
  selectedRoute: OptimizedRoute | null;
  startAsset: string;
  amount: number;
  riskPreference: RiskPreference;
  setStartAsset: (asset: string) => void;
  setAmount: (amount: number) => void;
  setRiskPreference: (pref: RiskPreference) => void;
  setResult: (result: OptimizerResult, graph: OpportunityGraph) => void;
  selectRoute: (route: OptimizedRoute | null) => void;
  clear: () => void;
}

export const useOptimizerStore = create<OptimizerState>((set) => ({
  result: null,
  graph: null,
  selectedRoute: null,
  startAsset: 'USDC',
  amount: 1000,
  riskPreference: 'moderate',

  setStartAsset: (startAsset) => set({ startAsset }),
  setAmount: (amount) => set({ amount }),
  setRiskPreference: (riskPreference) => set({ riskPreference }),
  setResult: (result, graph) => set({ result, graph, selectedRoute: null }),
  selectRoute: (selectedRoute) => set({ selectedRoute }),
  clear: () => set({ result: null, graph: null, selectedRoute: null }),
}));
