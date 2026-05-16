# Plan — CIC scenario deep relevance pass

## Why the screen still feels off

The earlier fix only touched `incidentToCic` so `scenarioId` flips. But `selectIncident` (the entry point used by the unified picker, sidebar, command palette, transport bar) only updates `selectedIncidentId` + `scenarioId` — it does NOT reset:
- `selectedCustomerId` → so Customer 360 keeps showing whoever was selected last (almost always Amelia)
- `stage` → so KpiStrip / IncidentCard show "resolved" or partway numbers from the previous run
- `ranActionIds` → so action chips light up wrongly
- `compareIds` → so the compare bar drags Manchester picks across scenarios
- it doesn't persist scenarioId, so a refresh reverts the user

That single hole produces ~80% of the perceived mismatch.

On top of that, several panels still read Manchester-only defaults:
- `AtRiskCustomerList` "↓ post-action" chip is hard-coded to `CUST-001`
- `EventStreamWidget` shows generic static `opEvents` on CIC routes — even while a CIC scenario is firing live events. The user sees Manchester-flavoured generic events while running Leeds.
- `RevenueAtRiskCard` is fully static (always shows Manchester numbers)
- `customers.ts` `mainDriver` / `isImpactedByIncident` are fixed per customer — Sophie/Hannah/Owen always read the same driver regardless of scenario

## Fix plan (priority order)

### 1. Make `selectIncident` actually switch scenarios — `src/state/DemoStateProvider.tsx`
Replace the body so it does the same housekeeping `setScenarioId` does, but only when the resolved CIC scenario actually changes:
```ts
const selectIncident = useCallback((id: string) => {
  setSelectedIncidentId(id);
  const cic = cicForIncident(id);
  if (cic) {
    setScenarioIdRaw(cic);
    save('snowtelco.scenario', cic);
    const s = scenarioById(cic);
    setSelectedCustomerId(s.primaryCustomerId);
    setStageRaw('normal');
    setIsPlaying(false);
    setRanActionIds([]);
    setCompareIds([]);
    setResolutionProgress(0);
    lastToastedStage.current = null;
  }
}, []);
```
This single change cascades into KpiStrip, IncidentCard, UkNetworkMap, AtRiskCustomerList, Customer360, charts, Briefing, Approvals, Uplift — all of which already read from `scenario` / `selectedCustomerId` / `stage`.

### 2. Per-scenario "reduced" chip — `src/components/customers/AtRiskCustomerList.tsx`
Change the hard-coded test:
```ts
const reduced = stageReached(stage, 'risk_reduced') && c.id === 'CUST-001';
```
to:
```ts
const reduced = stageReached(stage, 'risk_reduced') && c.id === scenario.primaryCustomerId;
```
(Scenario already in context.) Also bump the scenario primary to the top of the list when it isn't already (sort by primary first, then by churn).

### 3. EventStreamWidget on CIC routes — `src/pages/EventStream.tsx`
Today: `list = mode === 'noc' ? firedEvents : opEvents`.
Change to:
```ts
const list = (firedEvents.length > 0 ? firedEvents : opEvents).slice(0, limit);
```
So whenever a scenario is firing (any section), the widget shows the live beats. Falls back to static when idle.
Apply the same logic to the page-level `EventStream.tsx` filtering (line ~36) and counter (line ~132).

### 4. Per-scenario Revenue-at-Risk — `src/components/charts/Dashboards.tsx`
Convert `RevenueAtRiskCard` from static `revenueAtRisk` to scenario-driven values via a small lookup keyed on `scenario.id`:
```ts
const REV: Record<ScenarioId, { mrr; ninetyDay; clv; highValue }> = {
  manchester:        { mrr:'£2.3m', ninetyDay:'£6.9m', clv:'£18m', highValue:'£12m' },
  'birmingham-bill': { mrr:'£1.6m', ninetyDay:'£4.8m', clv:'£14m', highValue:'£9m' },
  'leeds-snowflex':  { mrr:'£0.4m', ninetyDay:'£1.2m', clv:'£3m',  highValue:'£1.8m' },
  'london-5g':       { mrr:'£0.6m ARPU lift', ninetyDay:'£1.8m',  clv:'£8m',  highValue:'£5m' },
};
```
Read it via `useDemoState`. Keeps the visual layout, swaps the numbers.

### 5. Per-scenario customer drivers — light touch
Instead of editing `customers.ts` (which would ripple), add a small `driverFor(customerId, scenarioId)` resolver in `src/data/customers.ts` (or a sibling file) that returns the scenario-relevant driver for non-primary customers ("Network degradation" / "Bill shock" / "Competitor offer" / "Upgrade propensity"). Use it in `AtRiskCustomerList` and `Briefing` instead of `c.mainDriver`.
Example logic: primary uses scenario's narrative driver; everyone else inherits the scenario's collective theme.

### 6. Mode auto-sync (small) — `src/components/app/SectionAutoReset.tsx` or `AppShell`
When pathname matches a section, also call `setMode(section)`. Avoids `mode === 'noc'` ghost state on CIC routes that drives the EventStreamWidget back to `opEvents` (also addressed by fix #3, but this stops the rest of the app from getting confused — header chip, briefing isNoc check etc.).

## Verification

After implementing, walk every CIC scenario from a clean refresh:
1. Open `/command-center`, run scenario, watch KPIs / IncidentCard / map / event stream / Customer 360 / charts.
2. Switch to a different CIC scenario via sidebar → confirm Customer 360 changes to new primary, KPI numbers reset to baseline, event stream clears, map pin moves, IncidentCard title swaps.
3. Run the new scenario, verify post-action chip lights only on the new primary, briefing & uplift show the new cohort, approvals shows the new campaign.
4. Refresh the page mid-scenario — verify localStorage persisted the right scenarioId.
5. `tsc --noEmit` and `vite build` clean.

## Out of scope

- Rewriting the underlying `customers.ts` data shape so each customer has per-scenario churn/driver — that's a bigger refactor.
- Replacing the static `riskDistribution` / `churnBySegment` / `kpiTrends` / `networkQualityTrend` series with per-scenario versions. They are population-level views and reading them as "context" is acceptable; we only re-tune the four most jarring panels (revenue, event stream, customer list, post-action chip).