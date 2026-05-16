# Make analytics surfaces scenario-aware

## Context

After exploring:
- [src/components/charts/Dashboards.tsx](src/components/charts/Dashboards.tsx) — six shared charts (`RiskDistributionChart`, `ChurnBySegmentChart`, `RiskByDriverChart`, `NetworkQualityTrendChart`, `IncidentImpactByCityChart`, `OfferAcceptanceMatrixChart`). All read from globals in [src/data/churn.ts](src/data/churn.ts) (`riskDistribution`, `churnBySegment`, `riskByDriver`, …). Only `RevenueAtRiskCard` and `IncidentImpactByCityChart` are scenario-aware today.
- [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) — the bottom row already has scenario-specific *titles*, but the components render the same data → headlines change, charts don't.
- [src/pages/ExecutiveInsights.tsx](src/pages/ExecutiveInsights.tsx) — hard-coded Manchester counterfactual ("89 P1 customers · £163k CLV"), unchanged across scenarios.
- [src/pages/Lineage.tsx](src/pages/Lineage.tsx) — single global driver list. Manchester is the implicit default.
- [src/pages/Briefing.tsx](src/pages/Briefing.tsx) — cohort table is scenario-correct, but no chart anchors the page.
- [src/pages/Uplift.tsx](src/pages/Uplift.tsx) — Growth and Billing variants are themed; the network/commercial quadrant uses a single fixed 6-customer scatter regardless of scenario.

## Approach

A single source of truth for per-scenario analytics, then point every page at it. No new chart components — refactor existing ones to take their data from the active scenario.

### 1. New file: `src/data/analyticsByScenario.ts`

Per-`ScenarioId` dataset, one entry per scenario, used by every page below. Shape:

```ts
interface ScenarioAnalytics {
  // Risk / propensity distribution (4 bands)
  riskDistribution: { band: string; value: number; color: string }[];
  // Theme-correct segment breakdown — e.g. roaming bands for Birmingham,
  // tariff buckets for Leeds, plan tiers for London
  churnBySegment: { segment: string; risk: number }[];
  // Driver share — Manchester: network/contract, Birmingham: roaming/policy,
  // Leeds: competitor/price, London: handset/data/legacy-plan
  riskByDriver: { driver: string; share: number }[];
  // KPI trend — Manchester: NES%, Birmingham: bills 25%+ above baseline,
  // Leeds: PAC requests/day, London: 5G SA conversion %
  kpiTrend: { x: string; baseline: number; current: number; unit?: string; label: string }[];
  // City impact — adapt the metric label per scenario
  cityImpact: { city: string; impact: number; label: string };
  // Offers/treatments × outcome
  offers: { name: string; x: number; y: number; margin: 'High' | 'Medium' | 'Low' }[];
  // Counterfactual numbers used by ExecutiveInsights
  counterfactual: {
    cohortLabel: string;
    withActions:    { primary: string; secondary: string; tertiary: string; nps: string };
    doNothing:      { primary: string; secondary: string; tertiary: string; nps: string };
    headlineWith:   string;  // e.g. "22 expected churners · £93,640 CLV protected"
    headlineDoNothing: string;
    cohortNote:     string;
  };
  // Lineage rows that are relevant to this scenario
  lineageHighlight: string[]; // matches the `driver` field in lineageRows
}

export const analyticsByScenario: Record<ScenarioId, ScenarioAnalytics> = { ... };
```

Concrete examples:

| Scenario | churnBySegment | riskByDriver leaders | kpiTrend |
|---|---|---|---|
| Manchester | Consumer SIM-only, Consumer handset, Family, SnowGo, SnowFlex prepay, Business | Contract expiry 27%, Network issues 41%, Care 14%, … | NES% baseline 95 → 44 then 56 |
| Birmingham | Roaming-heavy SnowTelco, Roaming-light SnowTelco, SnowFlex roaming, Bus mobile roaming, Bundle (no roam), Family | Bill shock 38%, Roaming policy 24%, Care 14%, Engagement 11%, Competitor 8%, Other 5% | Bills 25%+ above baseline (count by hour, post-Easter spike) |
| Leeds | SnowFlex SIM-only flex, SnowFlex 30GB, SnowFlex 60GB, Family flex, Youth flex, Senior flex | Competitor pressure 36%, PAC indicator 24%, Price sensitivity 19%, Tenure 12%, Care 6%, Other 3% | PAC requests/day · last 7d (baseline 30 → spike 142) |
| London | 5G handset legacy, 5G handset upgraded, 4G handset, IoT, Bus mobile, Family | 5G handset 41%, Heavy data 28%, Legacy plan 19%, Tenure 7%, Coverage 3%, Other 2% | 5G SA conversion % · last 24h (baseline 4% → 11.4%) |

### 2. Refactor shared charts in [Dashboards.tsx](src/components/charts/Dashboards.tsx)

Each function reads `useDemoState().scenario.id` and pulls the matching `analyticsByScenario[id]` slice. Falls back to globals if missing. No API change to call sites.

- `RiskDistributionChart` → uses `analytics.riskDistribution` (legend stays the same shape; titles in the call site already changed).
- `ChurnBySegmentChart` → `analytics.churnBySegment`.
- `RiskByDriverChart` → `analytics.riskByDriver`.
- `NetworkQualityTrendChart` → `analytics.kpiTrend` + a tiny per-scenario y-axis label override (default `%`, billing → count, leeds → req/day).
- `OfferAcceptanceMatrixChart` → `analytics.offers`.
- `IncidentImpactByCityChart` already scenario-aware; just relabel the chart subtitle from the scenario.

### 3. ExecutiveInsights ([ExecutiveInsights.tsx](src/pages/ExecutiveInsights.tsx))

- Wire `useDemoState` and pull `analytics.counterfactual`. Replace the hard-coded "89 P1 Manchester / £163k CLV" headline + the four `Mini` tiles with `withActions` / `doNothing` per scenario.
- Page kicker becomes blue ("Growth Insights") when `scenario.theme === 'growth'`.
- For London the toggle becomes "Showing: Upgrade journey" vs "Showing: Do nothing" — primary metric becomes "upgrades" not "churners", currency becomes ARPU lift.
- Chart card titles become scenario-aware (mirror the bottom row on Command Center).

### 4. Lineage ([Lineage.tsx](src/pages/Lineage.tsx))

- Wire `useDemoState`. Add an "Active scenario · lineage focus" callout above the table (city + theme + 1-line "what this scenario depends on").
- Add a `relevant` boolean to each lineage row computed from the scenario theme. Relevant rows render with a coloured left border and pinned to the top; non-relevant rows fade to 60% opacity.
- Add 2-3 scenario-specific rows when the global list doesn't already cover them: `5G handset propensity` for London, `Roaming Pass policy gap` for Birmingham, `Tariff elasticity` for Leeds, `Anomaly score (PRB util)` for Manchester. Maps to `gold.upgrade_propensity_features`, `gold.roaming_pass_policy`, `gold.tariff_elasticity`, `gold.cell_kpis` already in the data dictionary.

### 5. Briefing ([Briefing.tsx](src/pages/Briefing.tsx))

Add a small two-card "At a glance" strip below the existing situation block, scenario-themed:

- Card A: **Cohort outcome bar** (3 mini bars: with action / counterfactual / baseline) sized for the scenario's primary KPI (CLV protected for defence, ARPU lift for growth).
- Card B: **Driver share donut** = top 4 drivers from `analytics.riskByDriver` for this scenario.

Cards stay print-friendly (use the existing inline SVG bar pattern from `HeroPanels.tsx` to avoid pulling EChart into print pages).

### 6. Uplift ([Uplift.tsx](src/pages/Uplift.tsx))

- Move the hard-coded `quadrantData` into `analyticsByScenario.ts` as `quadrant: { id, name, x, y, group }[]`. Each scenario gets a quadrant tuned for it: e.g. for Birmingham move Daniel into the persuadable corner; for Leeds shift Grace up; for Manchester keep current; for London is a different page already.
- Y-axis label adapts: network/billing/commercial = "Uplift (% reduction)", growth = "Conversion lift (pp)".

### 7. Bottom-row Command Center

No code change beyond step 2 — the existing call sites already pick scenario-specific titles. Once the shared charts read scenario data, the rendered numbers will line up with the titles.

## Implementation steps

1. Create [src/data/analyticsByScenario.ts](src/data/analyticsByScenario.ts) with the four scenario datasets (riskDistribution, churnBySegment, riskByDriver, kpiTrend, offers, counterfactual, lineageHighlight, quadrant).
2. Refactor each chart in [Dashboards.tsx](src/components/charts/Dashboards.tsx) to read scenario-specific data.
3. Update [ExecutiveInsights.tsx](src/pages/ExecutiveInsights.tsx): scenario-aware counterfactual headline + Mini tiles + kicker colour.
4. Update [Lineage.tsx](src/pages/Lineage.tsx): scenario callout + relevant-row highlighting + add 4 scenario-specific lineage rows.
5. Update [Briefing.tsx](src/pages/Briefing.tsx): add the two-card "At a glance" strip with inline SVG bars / donut.
6. Update [Uplift.tsx](src/pages/Uplift.tsx): move `quadrantData` into `analyticsByScenario` and read it; adapt y-axis label per theme.
7. Run `tsc --noEmit`. Walk all four scenarios in the browser; verify each page changes meaningfully when the scenario changes.

## Verification

- Switch between Manchester / Birmingham / Leeds / London while on Command Center: the bottom-row charts visibly change, not just titles.
- Same for Executive Insights: counterfactual headline + Mini tiles re-anchor; growth scenario shows ARPU/upgrade language not churn.
- Lineage page: pinned rows + callout track the active scenario; the 4 ML/feature rows newly relevant per theme are highlighted.
- Briefing print preview shows the new at-a-glance cards with scenario-correct numbers.
- Uplift quadrant: the primary customer for each scenario sits clearly in the persuadable corner; y-axis label says "Conversion lift (pp)" only for London.
- `tsc --noEmit` exits clean.

## Critical files

- [src/data/analyticsByScenario.ts](src/data/analyticsByScenario.ts) (new) — single source of truth for per-scenario analytics
- [src/components/charts/Dashboards.tsx](src/components/charts/Dashboards.tsx) — refactor 6 shared charts to read scenario data
- [src/pages/ExecutiveInsights.tsx](src/pages/ExecutiveInsights.tsx) — scenario-aware counterfactual + chrome
- [src/pages/Lineage.tsx](src/pages/Lineage.tsx) — scenario callout + relevant-row highlighting
- [src/pages/Briefing.tsx](src/pages/Briefing.tsx) — at-a-glance scenario charts
- [src/pages/Uplift.tsx](src/pages/Uplift.tsx) — per-scenario quadrant + axis label