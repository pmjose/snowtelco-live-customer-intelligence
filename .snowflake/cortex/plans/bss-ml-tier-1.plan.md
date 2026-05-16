# BSS ML Tier 1

## What lands where

| Model | Page | Panel |
|---|---|---|
| `bill_shock_v2.4` | `/bss/billing` | At-risk cohort + forecast bars |
| `bad_debt_ecl_v3` | `/bss/collections` | IFRS 9 Stage 1/2/3 waterfall |
| `cash_forecast_v3` | `/bss/collections` | 14d forecast vs actual |
| `order_fallout_v2.1` | `/bss/order-to-activate` | At-risk orders + reasons |
| `clv_bayesian_v3` | `/bss/accounts` | LTV histogram + leaderboard |
| `bill_explainer_v1.4` | `/bss/bill-run` | Cortex Complete streaming text |
| `cross_sell_propensity_v2` | `/bss/subscriptions` | NB-product per customer |

Plus Cortex Complete "Draft" buttons on Disputes, Settlement, RevRec, Tax, GL, Pipeline, Cases.

## Files

- `src/pages/bss/BssExtended.tsx` — 4 new primitives + CLV, Bill-explainer, Cross-sell panels + Cortex buttons
- `src/pages/bss/BssBilling.tsx` — Bill-shock panel
- `src/pages/bss/BssOverview.tsx` — ECL + Cash forecast in BssCollections
- `src/pages/bss/BssO2A.tsx` — Order-fallout panel
- `src/data/mlMeta.ts` — 7 new mlByBssPage entries
- `src/data/sectionScenarios.ts` — 5 new scenarios
- `src/data/cicChat.ts` — 5 new prompt/answer sets
- `src/pages/Lineage.tsx` — 6 new gold tables

## Steps

1. Primitives + ML metadata + gold tables
2. Bill-shock panel
3. ECL + Cash panels
4. Order-fallout panel
5. CLV panel
6. Bill explainer
7. Cross-sell panel
8. Cortex Complete sprinkle buttons
9. 5 scenarios + 5 chatbot sets
10. Typecheck

## Verification

- `node node_modules/typescript/lib/tsc.js --noEmit` clean
- Hard-refresh 6 affected pages, panels render
- 5 new scenarios run end-to-end, AskCIC grounds correctly

## Critical files

- [src/pages/bss/BssExtended.tsx](src/pages/bss/BssExtended.tsx)
- [src/pages/bss/BssOverview.tsx](src/pages/bss/BssOverview.tsx)
- [src/data/mlMeta.ts](src/data/mlMeta.ts)
- [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts)
- [src/data/cicChat.ts](src/data/cicChat.ts)