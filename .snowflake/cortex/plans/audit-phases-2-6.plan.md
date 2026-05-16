# Plan: Finish Scenario Audit (Phases 2–6)

## Status so far
Phase 1 (static audit) is complete via `scripts/audit.mjs`. Findings:
- **90 scenarios** across cic (10) · digital (31) · bss (33) · oss (16). NOC has its own 8 incidents with presenter scripts in `nocIncidents.ts` + `presenterScripts.ts`.
- **0 duplicate IDs**, **0 duration mismatches**, **0 broken focus routes**.
- All 4 focus targets used (`page`, `kpi-strip`, `cic-grid`, `cic-incident`) resolve to `data-focus` attributes in the DOM.
- Narrator architecture verified: section scenarios drive copy from each event's `.text` (live-event mode); NOC uses staged presenter scripts. So the section-scenario "narrator gap" is by design.

## Remaining phases

### Phase 2 — Event-text quality scan (read-only)
- Re-run a small node script that walks every `e(atSec, kind, text, …)` call and flags empty / very-short text plus the histogram of event kinds.
- Output: list of weak narrator beats per scenario.

### Phase 3 — Section-overview timeline sanity (read-only)
- Confirm `ScenarioTimeline` is mounted on Digital / BSS / OSS / NOC overviews after the header and matches CIC styling.

### Phase 4 — Live browser walk (5 scenarios)
- One representative per section (plus NOC):
  - CIC: London 5G slice
  - Digital: outage comms
  - BSS: Consumer Duty
  - OSS: Barclays slice activation
  - NOC: London HSS incident
- For each: start, follow focus across all routes it touches, log narrator text, page contents, and any visible miss (off-screen focus, blank section, wrong page, weak copy).

### Phase 5 — Compile + fix
- Group issues by file. Likely targets: `sectionScenarios.ts` (tighten weak text, fix any awkward beat), `FocusRuntime` (only if a real bug surfaces), specific subpages (add `data-focus="kpi-strip"` only if it materially improves the focus moment).
- One batched edit pass.

### Phase 6 — Re-walk + summarise
- Re-run the same 5 scenarios.
- Produce a 1-screen audit summary: scope, fixes applied, known gaps left intentionally.

## Critical files
- `src/data/sectionScenarios.ts` (catalogue)
- `src/data/presenterScripts.ts` (NOC narration)
- `src/components/narrator/Narrator.tsx`
- `src/components/app/FocusRuntime.tsx`
- `src/components/timeline/ScenarioTimeline.tsx`
- `src/pages/{digital,bss,oss}/*Overview.tsx`, `src/pages/CommandCenter.tsx`, `src/pages/NocCommandCenter.tsx`

## Risk / scope guardrails
- Do not invent new pages or features.
- Do not touch presenter scripts for non-NOC scenarios — section-scenario narration is event-driven by design.
- Keep edits minimal and traceable; group by file.
