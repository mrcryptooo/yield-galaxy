# Phase 8 Checkpoint — Dynamic Route Optimizer

**Date:** 2026-06-27
**Build:** TSC PASS, Next.js PASS, ESLint 0 errors

---

## Architecture Diagram

```
                    User Input
                    (USDC, $1000, moderate)
                         │
                         ▼
              ┌─────────────────────┐
              │  RouteConstraints   │
              │  constraints.ts     │
              └─────────┬───────────┘
                        │
          ┌─────────────▼──────────────┐
          │    OpportunityGraph         │
          │    opportunity-graph.ts     │
          │                            │
          │  Nodes: USDC, USX, eUSX,   │
          │    SLX, stSLX, Kamino,     │
          │    Orca, Raydium,          │
          │    Loopscale, PT-USX, ...  │
          │                            │
          │  Edges: swap, convert,     │
          │    deposit, lp, mint,      │
          │    stake, navigate         │
          └─────────────┬──────────────┘
                        │
              ┌─────────▼──────────┐
              │    findPaths()     │
              │    DFS, max 5 depth│
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────┐
              │   resolveEdges()   │
              │   best edge per    │
              │   segment          │
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────┐
              │ meetsConstraints() │
              │  TVL, risk grade,  │
              │  max steps         │
              └─────────┬──────────┘
                        │
          ┌─────────────▼──────────────┐
          │         Scorer             │
          │         scorer.ts          │
          │                            │
          │  APY score      (35%)      │
          │  TVL score      (20%)      │
          │  Risk score     (25%)      │
          │  Complexity     (-10%)     │
          │  Diversification (+10%)    │
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │        Simulator           │
          │        simulator.ts        │
          │                            │
          │  Cumulative APY            │
          │  Cumulative Risk           │
          │  Estimated time            │
          │  Step-by-step results      │
          │  Warnings (low TVL, etc)   │
          └─────────────┬──────────────┘
                        │
              ┌─────────▼──────────┐
              │  generateExplanation│
              │  Captain reasons   │
              └─────────┬──────────┘
                        │
                        ▼
              OptimizedRoute[]
              (sorted by score, top 8)
                        │
          ┌─────────────▼──────────────┐
          │  dynamic-route-builder.ts   │
          │                            │
          │  optimizedRouteToTemplate()│
          │  → RouteTemplate           │
          │                            │
          │  generateCaptainLines()    │
          │  → per-action narration    │
          └─────────────┬──────────────┘
                        │
                        ▼
              Existing Journey Engine
              (UNCHANGED)
```

---

## Data Flow

```
Page loads
  → useYields() fetches Opportunity[]
  → User clicks FIND ROUTES
  → buildGraph(opportunities) → OpportunityGraph
  → optimize(opportunities, 'USDC', 1000, riskPreference) → OptimizerResult
  → Top 8 routes displayed in RouteSelector
  → User clicks a route
  → optimizedRouteToTemplate(route, graph) → RouteTemplate
  → generateCaptainLines(route, graph) → captain narration
  → startJourney(template) → Journey Engine takes over
  → Camera flies, trails render, Captain narrates
  → ZERO changes to journey engine internals
```

---

## Files Created (7)

| File | Lines | Purpose |
|------|:-----:|---------|
| `src/lib/optimizer/opportunity-graph.ts` | 123 | Build graph from live opportunities. Nodes = assets/protocols/products. Edges = transitions with APY/TVL/risk. DFS path finder. |
| `src/lib/optimizer/constraints.ts` | 45 | Risk preference → constraints (max grade, min TVL, max steps). Grade comparison utilities. |
| `src/lib/optimizer/scorer.ts` | 80 | Multi-factor route scoring: APY (35%), TVL (20%), risk (25%), complexity (-10%), diversification (+10%). Confidence rating. |
| `src/lib/optimizer/simulator.ts` | 78 | Simulates route execution: cumulative APY, risk, time estimate, warnings (low TVL, extreme APY). |
| `src/lib/optimizer/optimizer.ts` | 130 | Orchestrator: graph → paths → edges → constraints → score → simulate → explain → rank. Returns top 8. |
| `src/lib/dynamic-route-builder.ts` | 97 | Converts OptimizedRoute → RouteTemplate (for Journey Engine). Generates dynamic Captain narration. |
| `src/stores/optimizer-store.ts` | 34 | Zustand store: result, graph, selectedRoute, startAsset, amount, riskPreference. |

---

## Files Modified (4)

| File | What changed |
|------|-------------|
| `route-engine.ts` | Added optional `_captainLines` field to `RouteTemplate` |
| `route-selector.tsx` | Replaced static template list with optimizer UI: risk toggle, FIND ROUTES button, scored results |
| `captain-presence.tsx` | Reads `_captainLines` from template for dynamic narration |
| `page.tsx` | Passes `opportunities` to `<RouteSelector>` |

---

## How the Optimizer Works

### 1. Graph Construction
Every live `Opportunity` becomes edges in a directed graph. Structural edges (USDC→USX swap, USX→eUSX convert, SLX→stSLX stake) are added automatically. Protocol edges (USX→Kamino deposit, SLX→Orca LP) come from live data with real APY/TVL.

### 2. Path Finding
DFS from start node (USDC) with depth limit based on risk preference (conservative=4, moderate=5, aggressive=6). Visited-set prevents cycles.

### 3. Constraint Filtering
Each path's edges are checked against:
- Minimum TVL (conservative=$1M, moderate=$100K, aggressive=$10K)
- Maximum risk grade (conservative=B, moderate=C, aggressive=D)
- Maximum step count

### 4. Scoring
Each valid route gets a composite score:
- **APY** (35%): log-scaled, capped at 100%. Risk preference multiplier adjusts weight.
- **TVL** (20%): log-scaled minimum TVL across path. Deep liquidity = higher score.
- **Risk** (25%): inverse of average + worst risk grade. Conservative preference amplifies this.
- **Complexity** (-10%): penalty per step beyond 2.
- **Diversification** (+10%): bonus per unique protocol.

### 5. Simulation
Before returning, each route is simulated:
- Cumulative APY = sum of all yield-bearing edges
- Cumulative risk = worst risk grade across path
- Estimated time = sum of action time estimates (swap=0.5min, deposit=1min, LP=2min, etc.)
- Warnings generated for low TVL (<$50K) or extreme APY (>500%)

### 6. Explanation
Natural language explanation generated from optimizer results. Captain narration is generated per-action.

---

## Future Extension Points

1. **Wallet integration**: Replace `startAsset: 'USDC'` with actual wallet holdings. The optimizer already accepts any start asset.
2. **Multi-asset routes**: Add edges for cross-asset paths (USX→SLX via Orca LP).
3. **Historical backtesting**: Feed snapshot data into simulator for historical APY verification.
4. **Real-time re-optimization**: Watch for APY changes during journey and suggest route modifications.
5. **Custom constraints**: Expose constraint builder to UI (min TVL slider, max steps, excluded protocols).
6. **Route comparison**: Show 2-3 routes side-by-side with trade-off analysis.

---

## Performance Notes

- Graph construction: O(n) where n = number of opportunities (~16)
- Path finding: O(V! / (V-d)!) worst case, bounded by maxDepth (4-6). With ~15 nodes and 5 depth, typically <200 paths.
- Scoring + simulation: O(p * e) where p = paths and e = edges per path. Sub-millisecond.
- Total optimizer runtime: <10ms on 16 opportunities. No async, no network calls.
- All optimizer code is pure functions — no React, no Three.js, no side effects.

---

## Known Limitations

1. **Structural edges are hardcoded**: USDC→USX, USX→eUSX, SLX→stSLX transitions don't come from DefiLlama. If new swap routes appear, they need manual addition to `opportunity-graph.ts`.
2. **No cross-asset LP detection**: The graph doesn't automatically create edges for LP pairs that bridge two assets (e.g., eUSX-USX LP should connect both eUSX and USX nodes).
3. **APY is additive, not compound**: Simulator sums APY rather than compounding, which slightly overstates multi-step yields.
4. **No slippage modeling**: Route simulation doesn't account for price impact on swaps.
5. **stSLX may have no live data**: As found in Phase 6 verification, stSLX pools dropped below $5K TVL. Routes through stSLX may show 0% APY.

---

## Build Status

- **TypeScript:** PASS (exit 0)
- **Next.js build:** PASS (exit 0)
- **ESLint (Phase 8 files):** 0 errors, 0 warnings (excluding pre-existing `<img>` warning in page.tsx)
- **No visual regressions**: All LOCKED files untouched
- **Journey Engine**: Unmodified, receives RouteTemplate from optimizer exactly as before
