# OSS scenarios · UI walkthrough · review + fixes

## What I tested
For every OSS scenario in [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) I checked:
1. Every `focus.route` exists in [src/main.tsx](src/main.tsx).
2. The runtime engine in [src/state/DemoStateProvider.tsx](src/state/DemoStateProvider.tsx) will fire each event (event `atSec` ≤ `durationSec * 1000`).
3. Each focus target (`page`, `kpi-strip`) has a `data-focus` marker on the destination page so [FocusRuntime](src/components/app/FocusRuntime.tsx) can scroll/pulse it.
4. The bottom transport bar in [ScenarioTransport](src/components/app/ScenarioTransport.tsx) stays visible across the navigation hops.
5. Step text is internally consistent (timing, math, vendor names, model names).

## Findings — bugs surfaced

### CRITICAL — events never fire on `oss-cab-rollback`
- After the previous review pass I extended the timeline so MTTR math reconciles (events at 0, 2, 4, 6, 9, 15, 22, 28, **34**), **but I forgot to bump `durationSec`** — it's still **18**.
- Runtime stops firing events the moment `virt >= durationSec * 1000` (DemoStateProvider line 302).
- Net effect: the `15s log`, `22s log`, `28s verify`, `34s resolve` events **silently drop**. The audience sees the rollback but never sees the PIR drafted, the verify, or the resolve. Showstopper.

**Fix**: bump `durationSec: 18` → `durationSec: 36` so all 9 events fire.

### HIGH — focus pulse never fires on any OSS page
- 10 of 10 OSS scenarios use `focus.target: 'kpi-strip'` on the verify step. None of the OSS pages I rebuilt has a `data-focus="kpi-strip"` element.
- `data-focus="page"` works because `<main data-focus="page">` lives in [AppShell.tsx](src/components/app/AppShell.tsx) — but the per-page sub-targets (kpi-strip) silently no-op.
- Comparable surfaces use it: [DomainLanding.tsx](src/components/shared/DomainLanding.tsx) marks `data-focus="kpi-strip"` on its KPI grid.

**Fix**: add `data-focus="kpi-strip"` to the **8-KPI strip on the Overview** and to each sub-page's KPI strip (10 places total: Overview · Service Order · Activation · Inventory · Network Inventory · Service Assurance · Field Force · CAB · Capacity · Energy). Single-line edit per page.

### HIGH — transport bar disappears mid-scenario when navigating to /noc/change
- ScenarioTransport line 37: `if (sc.sectionId !== currentSection) return null;`.
- Two OSS scenarios (`oss-cab-rollback`, `oss-drive-test-optimise`) navigate the user to `/noc/change`. As soon as the URL flips to NOC, `currentSection === 'noc'` but `sc.sectionId === 'oss'` → transport bar unmounts mid-play.
- User loses pause / resume / step controls and the visual progress timeline.

**Fix options (pick one):**
- **A** (preferred — minimal): change those two scenarios' `/noc/change` focus payloads to `/oss/change` (we already kept the alias active in [main.tsx](src/main.tsx) line 130). The page renders the same `<OssChange/>` component; only the URL is `/oss/change` so the sidebar + transport stay in OSS mode.
- **B** (more invasive): edit `ScenarioTransport.tsx` to render any time `nocPlaying` is true regardless of `currentSection`. Better long-term but touches the runtime semantics.

I recommend **A** for now — zero-risk, immediately fixes the bug. Document the decision; we can flip to B later if more cross-section scenarios appear.

### MEDIUM — vendor SLA breach math inconsistency
`oss-vendor-sla-breach`:
- `e(0)`: "vendor-A 3h SLA expires in 14m"
- `e(6)`: "**+28m** (18m SLA breach)"
- 28 − 14 = 14m past SLA, not 18m. Either bump the breach time to **+32m (18m breach)** or relabel as **+28m (14m breach)**. I'll go with **+32m (18m breach)** — keeps the headline "vendor missed by 18m".
- `e(11)` "service restored at +52m" — relative to what? Tighten to "service restored T+52m (vs SLA breach +32m · MTTR within wider 3h target)".

**Fix**: 2-line edit.

### LOW — cross-section navigation UX (acceptable but worth a note)
After fix above, all OSS scenarios stay on `/oss/...` URLs throughout. Sidebar stays in OSS mode end-to-end. Transport bar stays visible. Audience never feels lost.

---

## Audit table — every scenario, every step

| Scenario | dur (s) | last evt (s) | routes used | data-focus markers needed | other |
|---|---|---|---|---|---|
| oss-field-dispatch-liverpool | 18 | 17.5 | /oss/field-force, /oss | kpi-strip on Overview + Field Force | OK |
| oss-capacity-whatif | 18 | 17 | /oss/capacity, /oss | kpi-strip on Overview + Capacity | OK |
| oss-energy-save | 20 | 19 | /oss/energy, /oss/field-force, /oss | kpi-strip on Overview + Energy | OK |
| oss-inventory-drift | 16 | 15 | /oss/inventory, /oss | kpi-strip on Overview + Inventory | OK |
| oss-assurance-triage | 18 | 17 | /oss/assurance, /oss | kpi-strip on Overview + Assurance | OK |
| oss-b2b-fast-order | 22 | 21 | /oss/service-order, /oss/topology, /oss | kpi-strip on Overview + Service Order + Topology | OK |
| **oss-cab-rollback** | **18** | **34** | /noc/change, /oss | kpi-strip on Overview | **CRITICAL: events 15s, 22s, 28s, 34s never fire**; HIGH: transport disappears |
| oss-drive-test-optimise | 18 | 16 | /oss/topology, /noc/change, /oss/field-force, /oss | kpi-strip on Overview + Field Force | HIGH: transport disappears at /noc/change |
| oss-vendor-sla-breach | 16 | 15 | /oss/field-force, /oss | kpi-strip on Overview + Field Force | MEDIUM: math inconsistency on +28m breach |
| oss-spectrum-refarm | 16 | 15 | /oss/topology, /oss/capacity, /oss, /oss/energy | kpi-strip on Overview + Capacity + Energy | OK |

---

## Implementation steps (in order)

1. **`oss-cab-rollback`** — bump `durationSec` 18 → **36** in [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts).
2. **`oss-cab-rollback`** + **`oss-drive-test-optimise`** — change `/noc/change` focus payloads to `/oss/change` (alias still active). Keeps transport bar visible.
3. **`oss-vendor-sla-breach`** — fix math: e(6) text → "Vendor-A on-site at **+32m** (18m SLA breach)"; e(11) → "service restored T+52m vs target T+180m · 0 customer SLA-credit triggered".
4. **Add `data-focus="kpi-strip"` markers** to the KPI grid on each OSS page (10 sites in [src/pages/oss/OssOverview.tsx](src/pages/oss/OssOverview.tsx)). Single-attribute add per grid.
5. **Build verification**: `node node_modules/typescript/lib/tsc.js --noEmit` and `node node_modules/vite/bin/vite.js build` must end clean.

## Verification (manual UI walkthrough after fix)

For each of the 10 OSS scenarios on `/scenarios`:
- [ ] Click "Open scenario" — sidebar should select OSS mode, page navigates to first focus route.
- [ ] Run scenario — transport bar shows, time fills, progress reaches 100%.
- [ ] Every event in the script fires (no silent drop). Verify by counting toast/firedEvents entries vs `events.length` in the catalog.
- [ ] On the `verify` step, the destination page's KPI strip pulses (focus-pulse class triggers + scroll into view).
- [ ] Resolve step fires; transport stays visible; "stage = resolved" chip shows.
- [ ] No console errors.

## Critical Files

- [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) — fix durationSec; redirect /noc/change → /oss/change; fix vendor-SLA math.
- [src/pages/oss/OssOverview.tsx](src/pages/oss/OssOverview.tsx) — add 10 `data-focus="kpi-strip"` attributes (one per KPI grid).
- [src/components/app/ScenarioTransport.tsx](src/components/app/ScenarioTransport.tsx) — reference only; `sc.sectionId !== currentSection` check is the reason transport disappears (we work around it via fix #2 rather than touching the file).
- [src/components/app/FocusRuntime.tsx](src/components/app/FocusRuntime.tsx) — reference only; consumes `data-focus` attributes.
- [src/state/DemoStateProvider.tsx](src/state/DemoStateProvider.tsx) — reference only; line 302 is the `virt >= totalMs` cutoff.

## Out of scope
- Reworking the `ScenarioTransport` cross-section behaviour (keep for later if more scenarios cross sections).
- New OSS scenarios.
- Page redesigns / additional ML primitives.