# Lift-to-9.5 plan (excluding live-data)

Four parallel workstreams. Each one is shippable on its own; landing all four hits the 9.5 bar.

---

## WS-1 · Per-scenario presenter scripts (90/90)
**Lifts:** Narrative coherence, Demo-ability, CTO gap.

- Extend `presenterScripts.ts` from 8 NOC keys to **all 90 SectionScenario IDs**.
- Each script: `intro` (1 sentence), `beatsByStage` (one line per kind that the scenario actually fires — typically 5–7), `closing` (1 sentence). Skip `domainNotes` (NOC-only).
- Wire `Narrator.tsx` so when a section scenario has a presenter, it overrides the live-event-text mode and runs the staged narration like NOC.
- Reuse the existing stage rail. The narrator picks beat by latest `event.kind`.
- Style: same voice as existing 8 NOC ones — short, executive, names a Snowflake primitive once per beat where natural.
- Acceptance: every scenario, when run, shows a presenter line for every beat. No "log" raw text in narrator unless the script is missing.

## WS-2 · Targeted focus selectors + spotlight overlay
**Lifts:** UI/focus orchestration, Visual design, Demo-ability.

- New widget-level `data-focus` taxonomy added to ~25 hero widgets. Examples:
  - `cohort-table`, `incident-detail`, `model-card`, `slice-ladder`, `dispute-queue`,
    `mediation-pipeline`, `bill-run-monitor`, `revenue-assurance-grid`, `field-dispatch-map`,
    `capacity-heatmap`, `change-cab`, `mim-bridge`, `status-page-editor`, `consumer-duty-evidence`.
- Update ~30 scenario events to point at these specific targets instead of `target: 'page'`.
- Add a **spotlight overlay** in `FocusRuntime`:
  - When a target lands, dim the rest of the page (`backdrop-brightness-50`) for ~1.4s.
  - Pulse the target with a 2px red ring + soft glow.
  - Skip dim when target is `'page'` (overview moments).
- Acceptance: the new event focus targets pulse with a visible spotlight on the right widget.

## WS-3 · ROI strip + standards chips on every scenario
**Lifts:** Data realism, Snowflake story, CTO gap, Domain credibility.

- Add three optional fields to `SectionScenario`:
  - `roi: { hoursSaved: number; gbpProtected: number; customersProtected: number; }`
  - `standards: string[]` (e.g. `['TMF 622', 'Ofcom GC C7', 'GDPR Art.34']`)
  - `snowflakePrimitives: string[]` (e.g. `['Cortex Search', 'Snowpark ML', 'Time Travel']`)
- Populate for all 90 scenarios with realistic, scenario-tied values.
- Render:
  - **ROI strip** at top of each scenario card in the ⌘K picker AND on the run banner.
  - **Standards chips** + **Snowflake-Inside chips** below the title in the picker AND on the section-overview timeline panel.
- Build a small `<ScenarioMetaBar />` component reused in 3 places.
- Acceptance: every scenario shows ROI numbers, standards chips, and Snowflake chips during selection and during run.

## WS-4 · Curated tours + unified `/compliance` dashboard
**Lifts:** Demo-ability, Regulatory, Visual.

### 4a · Curated tours
- New `tours.ts` with three tours:
  - `cxo-5min`: 4 scenarios (1 CIC churn save · 1 NOC P1 · 1 BSS Consumer Duty · 1 Digital outage comms)
  - `cto-10min`: 8 scenarios (adds OSS slice activation, OSS digital-twin, NOC roaming partner, BSS revenue assurance)
  - `full-bake-off-20min`: 14 scenarios spanning all five sections
- New `/tours` page lists them with ROI totals; "Start tour" runs scenarios sequentially with 5s breaks.
- Tour engine: tiny state machine on top of existing scenario runner.
- Acceptance: pick a tour → demo runs end-to-end without manual ⌘K.

### 4b · `/compliance` dashboard
- New page aggregating synthetic but realistic compliance signals:
  - GC A3 999-impact log (last 30d)
  - Consumer Duty foreseeable-harm queue (open / actioned / due)
  - IPA-LI requests (in-flight / completed / Time-Travel evidence ready)
  - NIS2 reportable incident clock
  - ICNIRP audit (sites due / overdue)
  - Welsh Language Standards comms coverage
  - Online Safety Act child-account verifications
- Each tile clickable into the scenario(s) that exercise it.
- Acceptance: `/compliance` is exec-grade, two screens deep max, every tile maps to ≥1 scenario.

---

## Build order (suggested)
1. **WS-3** (ROI + chips) — highest visibility per LOC, unblocks WS-4.
2. **WS-1** (presenter scripts × 90) — biggest narrative lift; can be batched per section.
3. **WS-4** (tours + /compliance) — depends on WS-3 metadata.
4. **WS-2** (focus targets + spotlight) — last; tightens the polish.

## Files touched (rough)
- `src/data/sectionScenarios.ts` — metadata fields populated for 90 scenarios
- `src/data/presenterScripts.ts` — +82 keys
- `src/data/tours.ts` (new)
- `src/pages/Compliance.tsx` (new) + route in `main.tsx`
- `src/pages/Tours.tsx` (new) + route in `main.tsx`
- `src/components/scenarios/ScenarioMetaBar.tsx` (new)
- `src/components/picker/CommandPicker.tsx` (or wherever ⌘K renders) — render `ScenarioMetaBar`
- `src/components/timeline/ScenarioTimeline.tsx` — render `ScenarioMetaBar`
- `src/components/narrator/Narrator.tsx` — prefer presenter when present
- `src/components/app/FocusRuntime.tsx` — spotlight overlay
- `src/index.css` — `.focus-spotlight`, `.focus-pulse-strong`
- ~25 page/widget files: add new `data-focus` attrs (no other change)
- ~30 scenarios: change a few `target: 'page'` → specific target

## Risk / scope guardrails
- No new "live data" plumbing.
- Don't break existing 8 NOC scripts — they keep their richer `domainNotes`.
- Keep TS types backward-compatible (new fields all optional).
- Build + typecheck after each workstream.

## Verification
- Build (`tsc --noEmit && vite build`) clean after each WS.
- Live walk: 1 scenario per section after WS-1; tour run after WS-4; spotlight visual after WS-2.
- Static audit script (`scripts/audit.mjs`) re-run to confirm no regressions.
