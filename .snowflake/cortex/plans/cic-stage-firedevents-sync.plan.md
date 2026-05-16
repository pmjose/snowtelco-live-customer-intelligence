# Plan — CIC stage ↔ firedEvents sync (so every beat makes sense on screen)

## Why each step looks wrong today

For a CIC section scenario (e.g. `cic-leeds-snowflex`), pressing Play on the transport bar does this:
- The engine ticks `tElapsedMs` and pushes `SeqEvent`s into `firedEvents`
- `currentStage` (NOC-style: idle/detect/observe/.../resolved) is derived from `firedEvents` — used by ScenarioTransport, FocusRuntime, presenter narrator
- **`stage` (CIC stage machine: normal → incident_detected → … → risk_reduced) is NEVER touched**

Everything on the CIC pages depends on `stage`:
- `isIncidentActive = stageReached(stage,'incident_detected') && !stageReached(stage,'risk_reduced')` → still false
- `KpiStrip` impacted/p1/high-value all branch on `isIncidentActive` → all read 0
- `IncidentCard` shows the "Network status: stable" baseline because `stageReached(stage,'incident_detected')` is false
- `effectiveChurn` returns pre-incident risk; AtRisk list never re-scores the cohort
- The `setSelectedCustomerId(scenario.primaryCustomerId)` effect is gated on `stage === 'customer_selected'` — never fires
- Narration toasts (one per stage) never fire — presenter is silent on the toast layer
- Post-action chip on the AtRisk primary is gated on `stageReached(stage,'risk_reduced')` — never lights up

So when the scenario "plays", events stream and the focus pulse navigates correctly, but the dashboard underneath looks like it never started.

## The fix (single useEffect)

In `src/state/DemoStateProvider.tsx`, add an effect that maps the latest fired-event kinds to a CIC `Stage` and calls `setStageRaw` whenever it changes:

```ts
function cicStageFromKinds(kinds: Set<string>): Stage {
  if (kinds.has('resolve'))                         return 'risk_reduced';
  if (kinds.has('verify'))                          return 'risk_reduced';
  if (kinds.has('act-care') || kinds.has('act-snow') ||
      kinds.has('act-rebalance') || kinds.has('act-restart'))
                                                    return 'outreach_triggered';
  if (kinds.has('plan'))                            return 'offer_generated';
  if (kinds.has('hypothesize'))                     return 'customer_selected';
  if (kinds.has('observe'))                         return 'customers_impacted';
  if (kinds.has('detect'))                          return 'incident_detected';
  return 'normal';
}

useEffect(() => {
  if (firedEvents.length === 0) return;             // selectIncident already resets to 'normal'
  const kinds = new Set(firedEvents.map((e) => e.kind));
  const next = cicStageFromKinds(kinds);
  setStageRaw((prev) => (prev === next ? prev : next));
}, [firedEvents]);
```

This lights up the entire CIC dashboard in lock-step with the scripted beats, for every section scenario (CIC + Digital + BSS + OSS — but the CIC dashboard is what the user is looking at).

## Per-beat verification matrix (after the fix)

For each CIC scenario × each beat, what shows on screen and why it makes sense:

### Manchester (`cic-manchester-churn`)
| t | beat | route | stage | what should be visible & why |
|---|---|---|---|---|
| 0  | detect           | /command-center cic-incident | incident_detected | IncidentCard "Manchester M14 cell cluster degradation", KPI 2,417 / 312 / 89, map pin Manchester with M14 overlay, EventStream beat #1 |
| 2  | observe          | (stays) | customers_impacted | KPIs lit, AtRisk shows Amelia at top with red driver "Network degradation (Manchester M14)" |
| 3.5| log cohort       | cic-cohort | customers_impacted | AtRisk list scrolled/pulsed |
| 5  | hypothesize      | /customer/CUST-001 | customer_selected | Customer360 page for Amelia auto-selected because the customer-selected effect now fires |
| 7  | plan             | (stays) | offer_generated | Toast "Recommended action: …" fires (CIC narration), NextBestAction panel populates |
| 11 | act-care         | /approvals | outreach_triggered | Approvals page shows Manchester campaign, EventStream "Salesforce Service Cloud · push playbook" |
| 16 | log accepted     | /customer/CUST-001 | outreach_triggered | Customer360 — accepted offer logged in event stream |
| 19 | verify           | /uplift | risk_reduced | Uplift page Amelia ★, cohort 89 P1 simulator |
| 23 | briefing log     | /briefing | risk_reduced | Briefing scenario-aware (Manchester template) |
| 26 | resolve          | cic-grid | risk_reduced | Whole dashboard in resolved state — post-action chip on Amelia, KPI risk reduction lit |

### Birmingham (`cic-birmingham-billshock`)
Same beat shape; verification differences:
- IncidentCard: "Birmingham B4 — Bill-shock wave", `cellSitesImpacted = 0` so the Stat tiles fall back to the non-network variant (postcode / tech / brand / detected)
- KPIs: 1,840 / 244 / 71
- AtRisk primary: Daniel, driver "Bill shock (post-Easter roaming)"
- Map pin: Birmingham (no Manchester overlay)
- IncidentImpactByCityChart: Birmingham highlighted
- Approvals: bill-shock campaign / Roaming Pass auto-enrol
- Uplift: Daniel ★, cohort 71 P1
- Briefing: Birmingham bill-shock cohort

### Leeds (`cic-leeds-snowflex`)
- IncidentCard: "Leeds LS2 — competitor PAC spike", non-network variant tiles
- KPIs: 940 / 28 / 38
- AtRisk primary: Grace, driver "Competitor SIM-only push"
- Map pin: Leeds, no overlay
- IncidentImpactByCityChart: Leeds highlighted
- Approvals: SnowFlex retention modal + 30 GB
- Uplift: Grace ★, cohort 28 high-CLV
- Briefing: Leeds SnowFlex cohort

### London (`cic-london-5g-upgrade`)
- IncidentCard: "London E14 — 5G SA launch", `cellSitesImpacted = 24` so network-variant tiles
- KPIs: 6,800 / 320 / (P1 not strictly applicable — show as upgrade-ready cohort)
- AtRisk primary: Ravi, driver "5G upgrade propensity"
- Map pin: London
- IncidentImpactByCityChart: London highlighted
- Approvals: upgrade campaign
- Uplift: Ravi ★, cohort 320 high-CLV
- Briefing: London E14 5G cohort

## Optional secondary tightenings (do only if quick)

1. **Approvals auto-advance** — when an `act-care` event fires for the active scenario, advance the Approvals stepper one stage so the page actually shows progress when the focus runtime jumps to it.
2. **CIC narration toasts** — they already fire from the existing `useEffect([stage, scenario, soundOn])`. Verify they read sensible copy for each scenario. Manchester narration is hand-written; Birmingham/Leeds/London narration also exists in `scenarios.ts`.
3. **NetworkQualityTrendChart** — only meaningful for network scenarios. Hide for non-network scenarios (Birmingham/Leeds bill-shock & PAC spike) or replace with a different small chart. Defer if not time.

## Verification

1. `tsc --noEmit` and `vite build` clean.
2. Walk all four CIC scenarios from a clean refresh:
   - Pick scenario from sidebar → all panels reset to baseline for the new scenario (Customer 360 swaps to new primary).
   - Press play, watch every beat: KPIs light up at detect, primary highlighted at hypothesize, Approvals shows campaign at act-care, Uplift highlights primary at verify, Briefing on resolve.
   - Confirm narration toast fires roughly in sync with the beats (the existing toast effect on `stage`).
3. Run a NOC scenario after running a CIC one — confirm CIC stage resets and the NOC scenario plays normally.

## Out of scope

- Replacing `customers.ts` with per-scenario churn data (so non-primary rows show different risks per scenario). The "primary pinned with right driver" framing already covers the most visible mismatch.
- Reworking the static `riskDistribution` / `churnBySegment` / `kpiTrends` charts.