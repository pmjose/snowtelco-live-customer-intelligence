# Plan — CIC scenario relevance audit & fixes

## Scenarios under audit
1. `cic-manchester-churn` (Amelia, CUST‑001) — Manchester / Network degradation
2. `cic-birmingham-billshock` (Daniel, CUST‑002) — Birmingham / Bill‑shock
3. `cic-leeds-snowflex` (Grace, CUST‑005) — Leeds / Competitor PAC spike
4. `cic-london-5g-upgrade` (Ravi, CUST‑004) — London / 5G SA upgrade

## Beats per scenario (focus targets)
detect → `/command-center` (cic‑incident) · cohort log → `cic-cohort` · hypothesize → `/customer/:id` · act-care → `/approvals` · accept-log → `/customer/:id` · verify → `/uplift` · briefing log + resolve → `/briefing` (or `cic-grid`).

## Findings (after walking each beat in code)

| # | Where | Bug | Severity |
|---|---|---|---|
| 1 | `src/data/incidentToCic.ts` | Map only knows NOC incident ids — picking `cic-leeds-snowflex` returns `undefined`, so `scenarioId` stays as `manchester`. Cascades into every panel below. | Blocker |
| 2 | `CommandCenter.tsx` `hasCic` banner | `incidentHasCicFocus('cic-leeds-snowflex')` is false → shows misleading "no single customer focus" banner on legitimate CIC scenarios. | High |
| 3 | `KpiStrip` (CommandCenter.tsx:94) | Reads `primaryIncident.impactedCustomers / highValueCustomers / highChurnRiskCustomers` — always Manchester numbers (2,417 / 312 / 89). | High |
| 4 | `IncidentCard.tsx` | Hard‑codes `primaryIncident` for severity, id, city, postcode area, technology, dates, root‑cause, recommended actions. Always reads "Manchester M14 cell cluster degradation" regardless of scenario. | High |
| 5 | `UkNetworkMap.tsx` | Uses `scenario.coordinates` so it follows once fix #1 lands. The "manchesterM14Sites" overlay layer always renders — fine for Manchester, wrong for Birmingham/Leeds/London. | Medium |
| 6 | `CommandCenter.tsx` chart card subtitles | `NetworkQualityTrendChart` card subtitle hard‑coded to "Manchester M14 today"; `IncidentImpactByCityChart` highlight is hard‑coded to Manchester. | Medium |
| 7 | `Uplift.tsx` | Scatter shows all six customers; the active scenario's primary isn't highlighted/labelled. | Low |
| 8 | `Approvals.tsx` | Header is fully generic — no hint that this is the cohort/offer for the active scenario (Leeds → "+30GB" / Birmingham → "Roaming Pass auto‑enrol" / etc.). | Low |
| 9 | `AtRiskCustomerList` | Sorts by `isImpactedByIncident` (per‑customer boolean fixed on Amelia). Other scenarios' primary customer isn't bumped to top. | Low |
| 10 | `Briefing.tsx` | Already scenario‑aware in last patch, but should also override per‑scenario "Projected outcomes" with quantitative deltas (cohort risk, CLV, conversion) instead of recycling the verify/resolve event lines verbatim. | Low |

## Fix plan (per file)

### 1. `src/data/incidentToCic.ts` — map cic‑* ids
Add four entries so the legacy `scenarioId` flips with each CIC scenario:
```ts
'cic-manchester-churn': 'manchester',
'cic-birmingham-billshock': 'birmingham-bill',
'cic-leeds-snowflex': 'leeds-snowflex',
'cic-london-5g-upgrade': 'london-5g',
```
Also make `incidentHasCicFocus` return true for any cic-* id.

### 2. `src/pages/CommandCenter.tsx`
- `KpiStrip`: replace `primaryIncident.*` with `scenario.impactedCustomers / highValueCustomers / highChurnRiskCustomers`.
- `NetworkQualityTrendChart` card subtitle: derive from `scenario.city` + `scenario.postcode`.
- Hide / re-label `hasCic` banner for cic-* scenarios (already covered by fix #1).

### 3. `src/components/incident/IncidentCard.tsx`
Replace `primaryIncident` references with the active `scenario` from context. Map fields:
- `severity` → `scenario.incidentSeverity`
- `id` → `scenario.incidentTitle`-derived id (use `scenario.id`)
- `city` / `postcodeArea` → `scenario.city` / `scenario.postcode`
- `affectedTechnology` / `detectedAt` / `impactedCustomers` etc. → `scenario.*`
- Title line → `scenario.incidentTitle` instead of literal "{city} M14 cell cluster degradation"

### 4. `src/components/charts/Dashboards.tsx`
- `IncidentImpactByCityChart`: highlight `scenario.city` instead of hardcoded "Manchester".

### 5. `src/components/map/UkNetworkMap.tsx`
- Only render the `manchesterM14Sites` overlay when `scenario.id === 'manchester'`. (Cleaner: render no detail overlay for non‑Manchester scenarios; the existing pin already moves to `scenario.coordinates`.)

### 6. `src/pages/Uplift.tsx`
- Highlight the active scenario primary customer (larger dot + label) using `scenario.primaryCustomerId`.
- Add a header line: "Treatment uplift · {scenario.label}".

### 7. `src/pages/Approvals.tsx`
- Add a small header strip showing scenario context: cohort size, offer headline, primary customer, derived from the active scenario (or the ranAction map).

### 8. `src/pages/Briefing.tsx`
- Replace the generic "Projected outcomes" bullets with per‑scenario quantitative deltas (we already define them in the `cicCohort` map — add `outcomes: string[]` per scenario and render them).

### 9. (defer / optional) per‑scenario `isImpactedByIncident`
Convert the customer flag into a per‑scenario set. Bigger data refactor; defer unless time allows.

## Verification

After implementing fixes 1–8 walk every beat for all four CIC scenarios:
- Manchester (regression check — must still match existing baseline)
- Birmingham (incident card → "Birmingham B4 — Bill‑shock wave"; KPIs 1,840 / 244 / 71)
- Leeds (incident card → "Leeds LS2 — SnowFlex PAC spike"; KPIs 940 / 28 / 38; map pin in Leeds; primary customer Grace highlighted in Uplift; Briefing already correct)
- London (incident card → "London E14 — 5G SA launch"; KPIs 12,400 / 320 / NA; primary Ravi)

Then `tsc --noEmit` and `vite build`.

## Out of scope
- Changing the underlying telco data shape (per‑scenario impacted‑customer set, per‑scenario churn drivers in pie chart).
- Digital / BSS / OSS scenario relevance audit (that is a separate pass; this plan is CIC only as requested).