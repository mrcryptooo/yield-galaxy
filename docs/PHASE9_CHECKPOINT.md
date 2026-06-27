# Phase 9 Checkpoint — Captain Intelligence

**Date:** 2026-06-27
**Build:** TSC PASS, Next.js PASS, ESLint 0 errors

---

## Architecture

```
Live Opportunities ──→ Optimizer Result
         │                    │
         ▼                    ▼
   ┌───────────┐     ┌──────────────┐
   │  insights  │     │   analysis   │
   │  .ts       │     │   .ts        │
   │            │     │              │
   │ TVL conc.  │     │ headline     │
   │ APY anom.  │     │ summary      │
   │ liquidity  │     │ warnings     │
   │ diversity  │     │ advantages   │
   │ compress.  │     │ disadvantages│
   │ PT markets │     │ confidence   │
   └─────┬─────┘     │ risk         │
         │           │ nextStep     │
         │           │ reason       │
         │           └──────┬───────┘
         │                  │
         │    ┌─────────────▼──────────┐
         │    │   recommendations.ts   │
         │    │                        │
         │    │ primary route          │
         │    │ alternative route      │
         │    │ why primary            │
         │    │ why not alternative    │
         │    │ tradeoff               │
         │    └─────────────┬──────────┘
         │                  │
         │    ┌─────────────▼──────────┐
         │    │       risk.ts          │
         │    │                        │
         │    │ protocol risk map      │
         │    │ concentration risk     │
         │    │ complexity risk        │
         │    │ liquidity risk         │
         │    │ summary                │
         │    └─────────────┬──────────┘
         │                  │
         ▼                  ▼
   ┌────────────────────────────────┐
   │         speech.ts              │
   │                                │
   │ speechFromAnalysis()           │
   │ speechFromRecommendation()     │
   │ speechFromInsight()            │
   │ speechFromRisk()               │
   │ speechForJourneyStep()         │
   │ speechForCompletion()          │
   │ speechForIdle()                │
   │                                │
   │ Returns: { text, tone,         │
   │            suggestedState }     │
   └───────────────┬────────────────┘
                   │
         ┌─────────▼──────────┐
         │    summary.ts      │
         │                    │
         │  buildBriefing()   │
         │  → CaptainBriefing │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │  captain-store.ts  │
         │                    │
         │ briefing           │
         │ currentSpeech      │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │  CaptainPresence   │
         │  (component)       │
         │                    │
         │  Reads store       │
         │  Falls back to     │
         │  journey/planet/   │
         │  protocol lines    │
         └────────────────────┘
```

---

## Analysis Pipeline

```
1. generateInsights(opportunities)
   - Scans all 16 pools for patterns
   - TVL concentration, APY anomalies, liquidity gaps
   - Protocol diversity, yield compression, PT availability
   - Returns Insight[] with type + severity

2. analyzeRoute(route, allRoutes, opportunities)
   - Headline: high-yield / balanced / conservative
   - Warnings: simulation warnings + concentration + confidence + PT
   - Advantages: TVL depth, risk profile, diversification, simplicity
   - Disadvantages: complexity, risk, liquidity
   - Confidence score with explanation
   - Risk grade with protocol-level breakdown

3. recommend(optimizerResult)
   - Picks primary and alternative routes
   - Explains why primary was chosen
   - Explains why alternative was rejected
   - Describes the tradeoff between them

4. assessRouteRisk(route)
   - Protocol-level risk map
   - Concentration risk (single vs multi-protocol)
   - Complexity risk (step count)
   - Liquidity risk (minimum TVL)
   - Summary sentence

5. speech.*() functions
   - Convert structured analysis → natural language
   - Each returns { text, tone, suggestedState }
   - Tone: neutral / confident / cautious / alert / celebratory
   - suggestedState: idle / thinking / talking / success / alert

6. buildBriefing(opportunities, optimizerResult)
   - Orchestrates everything
   - Returns CaptainBriefing with all analysis + speech
```

---

## Data Flow

```
Page loads → useYields() → opportunities
  │
  ├── Captain idle: "Exploring Solstice Galaxy. 16 destinations detected."
  │
  ▼
User clicks FIND ROUTES
  → optimize(opportunities) → OptimizerResult
  → buildBriefing(opportunities, result) → CaptainBriefing
  → captain-store.setBriefing(briefing)
  → Captain speaks: "I recommend USX Route. Selected for high confidence, low risk profile."
  │
  ▼
User clicks a route → startJourney(template)
  → Captain switches to journey narration
  → Per-step speech from _captainLines (dynamic) or static fallback
  │
  ▼
Journey completes
  → Captain: "Route complete. Balanced route: 1.54% APY."
  → 6s auto-exit → Captain returns to idle/briefing
```

---

## Files Created (7)

| File | Lines | Purpose |
|------|:-----:|---------|
| `src/lib/captain/analysis.ts` | 112 | Route analysis: headline, warnings, advantages, disadvantages, confidence, risk explanation |
| `src/lib/captain/insights.ts` | 88 | Ecosystem insights: TVL concentration, APY anomalies, liquidity, diversity, compression |
| `src/lib/captain/risk.ts` | 63 | Risk assessment: protocol map, concentration, complexity, liquidity, summary |
| `src/lib/captain/recommendations.ts` | 82 | Route comparison: primary vs alternative, why/why-not, tradeoff description |
| `src/lib/captain/speech.ts` | 118 | Natural speech generation from all structured outputs. 7 speech generators. |
| `src/lib/captain/summary.ts` | 60 | Orchestrator: buildBriefing() combines all analysis into CaptainBriefing |
| `src/stores/captain-store.ts` | 18 | Zustand store: briefing, currentSpeech, setBriefing, setSpeech, clear |

---

## Files Modified (2)

| File | What changed |
|------|-------------|
| `captain-presence.tsx` | Reads from captain-store. Falls back through: briefing → journey → protocol → planet → idle. State indicator shows ANALYSIS/ALERT. |
| `route-selector.tsx` | Calls `buildBriefing()` after optimizer runs, sets captain-store. |

---

## Performance

- All captain modules are pure functions — no React, no Three.js, no network
- `generateInsights()`: O(n) scan of ~16 opportunities, <1ms
- `analyzeRoute()`: O(e) where e = edges in route, <1ms
- `recommend()`: O(1) — reads top 2 pre-sorted routes
- `assessRouteRisk()`: O(e) — single pass over edges
- `buildBriefing()`: orchestrates all above, total <2ms
- Speech generation: string concatenation, <0.1ms
- Captain store: 3 fields, no computed selectors

---

## Future AI Extension

The architecture is designed for drop-in LLM replacement:

1. **`speech.ts`** currently generates speech with templates. Replace any `speech*()` function with an LLM call that takes the structured `RouteAnalysis` / `RiskAssessment` / `Recommendation` as context and returns natural language.

2. **`summary.ts`** → `buildBriefing()` is the single orchestration point. An LLM-powered version would call the same analysis functions, then pass their output to an LLM for synthesis instead of template concatenation.

3. **`captain-store.ts`** already separates `briefing` (structured) from `currentSpeech` (text). An LLM would write to `currentSpeech` while the structured `briefing` remains available for UI display.

4. **Streaming**: `setSpeech()` can be called incrementally for token-by-token streaming from an LLM.

No architecture changes needed — just swap the speech generation layer.

---

## Build Status

- **TypeScript:** PASS (exit 0)
- **Next.js build:** PASS (exit 0)
- **ESLint (Phase 9 files):** 0 errors, 0 warnings
- **No visual regressions**: Captain component layout, animations, and image switching unchanged
- **Backward compatible**: All existing journey/planet/protocol speech still works as fallback
