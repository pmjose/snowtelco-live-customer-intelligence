# OSS · ML + animations + more visuals · consistent across pages

## Goal
1. Add a clear, consistent **ML layer** to every OSS page so the platform story ("we run real models on Snowflake gold tables") is visible everywhere.
2. Add **animations** that tell the agent / model story (entry stagger on KPI tiles + tables, animated forecasts, animated agent decision pipe, count-up KPIs, animated feature-importance bars).
3. Add **2–3 new visuals per page** using existing chart toolkit (`Treemap`, `ParetoChart`, `BandedLineChart`, `AreaChart`, `StackedAreaChart`, `StackedDeltaBars`, `Histogram`, `CycleSlaHeatmap`) plus a small new OSS-ML primitive kit.
4. Keep the **blue OSS accent** consistent. No vfRed kickers, no money claims that aren't already validated.

## Constraint discipline
- Synthetic data only.
- One file: extend `src/pages/oss/OssOverview.tsx` (already houses 10 pages).
- Reuse `BssExtended` primitives (`Treemap`, `ParetoChart`, `BandedLineChart`, `Histogram`, `StackedDeltaBars`).
- Build `tsc --noEmit` + `vite build` clean at the end.

---

## A · New OSS ML primitives (added at the bottom of `OssOverview.tsx`, ≈200 LOC)

```ts
ModelCard         // name · version · MAPE/AUROC · drift status · last refresh · owner
ModelRegistryStrip// horizontal strip of 6 ModelCards
FeatureImportance // animated horizontal bars (sorted desc) — top 6 features
ConfidenceGauge   // semi-circle gauge with animated needle (0–100%)
ForecastVsActual  // line + confidence band, animated reveal on viewport-enter
DecisionFlow      // 4-stop animated pipe Detect → Predict → Plan → Act with particles
```

All primitives:
- Render in `vf-card` shells.
- Use the OSS blue palette (`#1d4ed8`, `#3b82f6`, `#60a5fa`, `#93c5fd`).
- Use framer-motion for entry animations (already a project dependency).

---

## B · Per-page ML + animation + visual additions

### B1. Overview `/oss`
- Add a **`ModelRegistryStrip`** with 6 production OSS models: `order_fallout_v2.1`, `cfr_predict_v3`, `mttr_predict_v3`, `capacity_forecast_v2`, `energy_save_v3`, `inventory_drift_v3`. Each ModelCard shows version · MAPE/AUROC · drift · refresh · owner.
- Add a **`DecisionFlow`** mini animation showing one OSS agent path: `silver.work_orders → gold.fieldforce_routing → route_optimiser_v2 → ServiceNow CHG`.
- Wrap the existing 9-tile grid in a stagger (already initiated, tighten timing).
- Add count-up animation on the 8 board KPIs.
- Add a **24h agent activity counter** band: `signals · decisions · actions` (same visual as Landing, smaller, OSS-scoped).

### B2. Service Order (TMF 622) `/oss/service-order`
- Add column "Jeopardy" to the orders table — `order_jeopardy_v3` probability rendered as a mini horizontal bar (animated width on entry).
- Add a **`ModelCard`** + **`ConfidenceGauge`** card pair: model overview + jeopardy confidence on the top at-risk order.
- Add a **`FeatureImportance`** card for jeopardy drivers (top 6 features).
- Add a **`ForecastVsActual`** card: predicted vs actual on-time-commit, last 12 weeks.
- Animated decomposition fan-out (Lloyds 280-branch) — staggered tiles fan out on mount.

### B3. Activation (TMF 641) `/oss/provisioning`
- Replace the static funnel with a **stage-transition animation** (framer-motion `layout` so the funnel re-flows when hover-highlighting a stage).
- Add a **`Histogram`** of TTA in days, with mean line (reuse `Histogram`).
- Add a **`FeatureImportance`** for `order_fallout_v2.1` drivers.
- Add `ModelCard` for `activation_eta_v2`.
- Animated count-up on KPI strip.

### B4. Service Inventory (TMF 638) `/oss/inventory`
- Add a **drift heatmap** (`CycleSlaHeatmap`-style 7×24 grid) — sources × days.
- Add `ModelCard` for `inventory_drift_v3`.
- Add a **`ParetoChart`** of "where drift comes from" (Cramer / NetAct / ENM / CMDB / manual).
- Add an **animated impact-radius card**: top 5 services by predicted blast radius (drives the Cortex Search panel that's already there).
- Animate the existing drift sparkline on viewport-enter (`Sparkline` is static today; wrap in a motion path).

### B5. Network Inventory (Topology) `/oss/topology`
- Make the existing `ImpactGraph` SVG **animated** — particles flow from PE-LDN-1 to circuits to services on a 4-second loop.
- Add **`FeatureImportance`** for `blast_radius_v2` (top features: customer count, SLA tier, redundancy depth, alarm history, traffic class, recent CHG).
- Add a **`Treemap`** of resources by vendor × tech.
- Add `ModelCard` for `topology_blast_radius_v2`.

### B6. Service Assurance (TMF 645) `/oss/assurance`
- Add a **`BandedLineChart`** of MTTR forecast (`mttr_predict_v3` predicted band vs actuals).
- Add a **`Histogram`** of ticket-age distribution by severity.
- Add **`ConfidenceGauge`** for the severity classifier (`severity_classifier_v2`) on the top-priority ticket.
- Add `ModelCard` for `assurance_triage_v2`.
- Animate ticket rows on mount (stagger).

### B7. Field Force `/oss/field-force`
- Add an **animated route-optimiser SVG** — depot → top-3 jobs with animated dotted curves and en-route particles (small, beside UK heatmap).
- Add **`FeatureImportance`** for `ftf_predict_v1` (parts-on-hand · skill match · drive distance · prior-fix history · weather · tech tenure).
- Add `ModelCard` for `route_optimiser_v2`.
- Add a **gauge band** for tech utilisation per region (4 mini-gauges).
- Animate parts stockout-risk H-bars on entry.

### B8. Change Mgmt · CAB `/oss/change`
- Add a **`BandedLineChart`** of CFR trend (last 12 weeks · `cfr_predict_v3` band over actuals).
- Add **`ConfidenceGauge`** for the next-up CHG's auto-approval classifier (`cab_auto_approve_v2`).
- Add **`ParetoChart`** of failure-cause categories (CHG-fail Pareto).
- Add `ModelCard` for `cab_auto_approve_v2` and `cfr_predict_v3` (two cards side by side).
- Animate the 30-day calendar heatmap cells on mount (cascading stagger).
- Animated rollback timeline visual: 4 dots showing detect → guard breach → Time Travel rollback → KPI recovers.

### B9. Capacity `/oss/capacity`
- Add a **`ForecastVsActual`** for the top-3 regions (animated reveal of forecast band on viewport-enter).
- Add `ModelCard` for `capacity_forecast_v2` (Prophet · MAPE 8% · last refresh).
- Add a **`Treemap`** of capex by region × technology (4G expansion vs 5G expansion vs spectrum vs transport).
- Add **`FeatureImportance`** for capacity-breach drivers.
- Animate the 12-month line chart on viewport-enter.

### B10. Energy `/oss/energy`
- Replace the static abatement bar chart with an **animated waterfall** (each stage drops in sequentially with a slight bounce).
- Add **`StackedAreaChart`** of kWh sources × time (24h × renewable mix).
- Add `ModelCard` for `energy_save_v3` (RL agent · reward curve · last training).
- Add a **mini training-progress sparkline** for the RL agent ("episode reward over last 30 epochs").
- Add **`ConfidenceGauge`** for "next 60-min energy-save action confidence".
- Animate the top-10 drainers table rows.

---

## C · Page-wide consistency layer

- Wrap every page's KPI strip in a `motion.div` + stagger.
- Wrap every table's `<tbody>` rows in a stagger so first paint feels alive.
- Wrap every chart card in a `whileInView` reveal.
- Add a **`MlBadge`** chip ("ML · `model_name@v3`") next to any KPI that comes from a model so the audience knows which numbers are model-driven (e.g. fallout %, forecast accuracy, drift %, jeopardy count, MTTR forecast, CFR forecast, FTF rate).
- Standardise all gold-table chips and standards strips at the end of every page (already done in the previous pass — confirm no regressions).

---

## D · Wiring + verification
1. All edits in **one file**: `src/pages/oss/OssOverview.tsx` (already 1,200+ LOC; will land ~+700 LOC; if it crosses ~2,200, split out an `OssMl.tsx` for the new primitives).
2. No new dependencies. Reuse `framer-motion`, `lucide-react`, existing `Charts`, BssExtended primitives.
3. Run `tsc --noEmit` and `vite build` after every two pages to keep the loop fast.

## Out of scope
- Real ML calls / training. All numbers are illustrative.
- New routes / new pages.
- Cross-domain changes (BSS / NOC stay as they are).
- Heavy SVG force-graphs / d3 layouts — too much for this pass; use simple animated paths.

## Risk + mitigation
- **File size**: if `OssOverview.tsx` crosses ~2,200 LOC after this work, extract the new primitives into `OssMl.tsx`. Decide once everything compiles.
- **Animation overdose**: avoid long durations; cap entry animations at 0.4–0.5s; respect `useReducedMotion()` if it ships clean (out of scope, but prepared).
- **Performance**: keep animated SVG particles ≤ 12 simultaneously per page.