# Where does ML/AI fit in the CIC scenarios?

## Context

CIC today shows lots of *outcomes* (KPIs, NBA, funnel, briefing) but doesn't visibly say "this came from a model." For an executive audience that's a missed opportunity — the demo is selling Snowflake-native AI/ML. We need ML to appear at the moment where it actually *drives* the next step, not as a generic "model card" tab.

I walked the four scenarios mentally against the existing layout and the existing data surfaces ([HeroPanels.tsx](src/components/scenario-kits/HeroPanels.tsx), [Customer360.tsx](src/components/customer360/Customer360.tsx), [LiveTimeline.tsx](src/components/timeline/LiveTimeline.tsx), [Uplift.tsx](src/pages/Uplift.tsx), [CommandCenter.tsx](src/pages/CommandCenter.tsx)).

## Where ML naturally lives, by scenario

| Scenario | ML moment | Surface | Visualisation |
|---|---|---|---|
| Manchester (network) | **Anomaly detection** on cell KPIs (PRB util, GTP-U drops) — "the model fired the alarm" | Hero panel slot when active | Time-series with shaded anomaly band + red dot at fire time + 60-min forecast |
| Manchester (network) | **Per-customer churn risk + 12-week forecast** — already exists in Customer 360 (ChurnTrendChart) but is read-only | Customer 360 right column | Add "Forecast band 50/95% CI" + "Drivers (SHAP)" mini-bar |
| Birmingham (billing) | **Bill forecast** — model predicts next-cycle bill vs baseline 90/180-day window | BillShockHeatmap hero | Histogram already shown — add a *forecast cone* card showing predicted vs actual £ over 6 months |
| Birmingham (billing) | **Bill-shock probability** at the cohort level | KPI strip extra | "P(bill-shock) next 30d: 14%" sparkline |
| Leeds (commercial) | **PAC propensity** + **price-elasticity** model | CompetitivePricingPanel hero | Demand curve with elasticity coefficient and "save rate" simulation slider |
| Leeds (commercial) | **Treatment uplift** (already in Uplift quadrant) | Customer 360 inline | Add "Uplift score: +18 pts (CI 12-24)" chip on Offers tab |
| London (growth) | **Upgrade propensity model** — already mentioned in copy but no chart | UpgradeReadinessPanel hero | Propensity score distribution histogram + threshold marker at 0.6 |
| London (growth) | **ARPU lift forecast** with confidence interval | Uplift page | Forecast line: month-over-month projected ARPU with shaded 80%/95% bands |
| All scenarios | **Model trust / lineage** strip | New small card under Customer 360 or in the briefing | Model name, version, last trained, AUC, drift status, top SHAP features |

## Recommended approach (proportional, not over-engineered)

### A. Add a thin "ML Insight" hero overlay
On the hero panel for each scenario, add a small bottom-right badge: model name + score + confidence. Two-line max. Not a new layout — just decorating panels that already exist. Examples:

- Manchester (UkNetworkMap or new anomaly chart): `Anomaly score 0.94 · model anomaly_v3.1 · CI 0.91-0.97`
- Birmingham (BillShockHeatmap): `P(bill-shock | cohort) = 0.42 · model billshock_v2 · drift OK`
- Leeds (CompetitivePricingPanel): `Elasticity ε = -1.8 · price_elasticity_v1 · CI -2.1 to -1.4`
- London (UpgradeReadinessPanel): `Median propensity 0.71 · upgrade_v2 · 1,420 above threshold`

### B. Replace the Manchester "map" hero (network theme) with an Anomaly Detection chart for the active 2-hour window
A line chart of one cell-cluster KPI (e.g. PRB util %) with a shaded "expected band" and red dots where the anomaly model fired, plus a dashed forecast trajectory for the next 60 min. This is the *most* ML-looking surface and replaces a static map for network scenarios. Keep the map only when no scenario is active.

### C. Add a "Model trust" mini-card on Customer 360 (Offers tab footer)
4-line read-only strip showing:
- Model: `next_best_action_v4.2`
- Confidence: 0.87 (HIGH)
- Drift status: green
- Top features (SHAP): Network exp. (-0.31), Contract end (-0.24), Care complaints (-0.18)

This makes every NBA recommendation traceable to a model in one glance. Wire it from new mock data in [src/data/mlMeta.ts](src/data/mlMeta.ts) (new file).

### D. Add a forecast band to ChurnTrendChart (existing component)
The existing trajectory line ends at "Projected." Replace the single point with a **shaded 80%/95% forecast cone** for the next 4 weeks. Tiny chart change, big ML signal. Same pattern reused for ARPU lift on the London Uplift page.

### E. Add 1 new ML-flavoured chart card to the bottom analytics row, scenario-themed
Replace one of the existing 6 chart cards with a per-scenario ML chart:
- Manchester → "Anomaly score by cell" (24h heat-strip)
- Birmingham → "Forecast vs actual bill — 6 months"
- Leeds → "Demand curve · price elasticity"
- London → "Upgrade propensity distribution + threshold"

### F. Surface model touchpoints on the LiveTimeline
Add a small "ML" tag on the steps that are model-driven:
- "Churn impact model executed" → `ML: churn_v6.3 · 89 P1 scored`
- "Next-best-action generated" → `ML: nba_v4.2 · 6 candidates ranked`
- (Birmingham) "Cohort confirmed across 1,840 customers" → `ML: billshock_v2 · 1,840 flagged`

## Implementation steps

1. Create [src/data/mlMeta.ts](src/data/mlMeta.ts) with per-scenario model metadata: `name, version, lastTrained, auc, drift, topFeatures, confidence, score, ci`.
2. Add a small reusable `<MlBadge>` component (model name + score + CI) used as a corner badge on each hero panel.
3. Build `<AnomalyChart>` for Manchester: line + shaded expected band + anomaly dots + forecast tail. Slot into the hero panel switch (`scenario.theme === 'network'`).
4. Add forecast cone (P50/P80/P95 bands) to `ChurnTrendChart` in [src/components/churn/ChurnViz.tsx](src/components/churn/ChurnViz.tsx). Render only when forecast data is present.
5. Add a "Model trust" card to NBA panel and/or Customer360 Offers tab using `mlMeta`.
6. Replace one bottom chart card per scenario with the scenario-specific ML chart (extend the existing scenario theme branches in [CommandCenter.tsx](src/pages/CommandCenter.tsx)).
7. Tag the model-driven `LiveTimeline` events with a small `ML` chip.

## Verification

- Walk all 4 scenarios. Hero panel always shows an ML badge with realistic model name + score.
- Manchester hero is an anomaly chart, not a map.
- Customer 360 Offers tab shows model trust card with SHAP features that match the scenario theme.
- Churn trend ends with a shaded forecast cone.
- Bottom analytics row swaps one card per scenario for the ML-flavoured chart.
- LiveTimeline shows ML chips on the model-driven steps.
- Typecheck and visual hard-refresh on each scenario.

## Critical files

- [src/components/scenario-kits/HeroPanels.tsx](src/components/scenario-kits/HeroPanels.tsx) — host the MlBadge corner overlay; add anomaly chart for network theme
- [src/components/churn/ChurnViz.tsx](src/components/churn/ChurnViz.tsx) — add forecast cone to ChurnTrendChart
- [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) — slot the per-scenario ML chart into the bottom row
- [src/components/timeline/LiveTimeline.tsx](src/components/timeline/LiveTimeline.tsx) — ML chips on model-driven events
- [src/data/mlMeta.ts](src/data/mlMeta.ts) (new) — per-scenario model metadata source-of-truth