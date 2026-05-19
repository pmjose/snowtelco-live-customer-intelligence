# Plan: Per-Scenario Presenter-Script Pages

## Goal
For each of the 98 scenarios (90 SectionScenarios + 8 NOC incidents), provide a dedicated route with the **full presenter script** (what to say, beat by beat, with screenshots), accessible from the scenario card on `/scenarios` and from the Narrator panel.

---

## Route shape

```
/scenarios/:id            → ScenarioScript page (works for both noc-* and section-* ids)
/scenarios/:id/print      → print-friendly variant (one column, screenshots inline, page-break-friendly)
```

Resolution order inside the page:
1. `incidentById(id)` → NOC incident → use `presenterFor(id)` from `presenterScripts.ts`
2. `scenarioById(id)` → SectionScenario → use manual `presenterScripts[id]` if present, else `derivePresenterFor(scenario)`
3. Otherwise → 404 panel

---

## Page layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to scenarios                                        │
│                                                             │
│  [section chip]  Scenario title                             │
│  Subtitle line                                              │
│                                                             │
│  ROI strip:  hours · £ protected · customers · standards    │
│  Snowflake primitives:  chips                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Open the live stage  →    Print script  →   PDF →   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ── INTRO  (T+0 to T+6s) ─────────────────────────────────  │
│  > Spoken script paragraph                                  │
│  [screenshot of the stage at T+0]                           │
│                                                             │
│  ── DETECT (T+0 → T+4s) ──────────────────────────────────  │
│  > Spoken script paragraph                                  │
│  Live event log:                                            │
│   • t+0  detect  · "..."                                    │
│   • t+2  observe · "..."                                    │
│  [screenshot of the stage]                                  │
│                                                             │
│  ── OBSERVE / HYPOTHESIZE / PLAN / ACT / VERIFY ─────────   │
│      (one block per stage; same template)                   │
│                                                             │
│  ── CLOSING (resolve) ────────────────────────────────────  │
│  > Spoken script paragraph                                  │
│                                                             │
│  ── DOMAIN NOTES (CIC | Digital | BSS | OSS | NOC) ──────   │
│      Per-domain one-liner with link to that section page    │
│                                                             │
│  ── PRESENTER CHEAT-SHEET ───────────────────────────────   │
│   • Standards cited:  TMF 622, 3GPP TS 28.531, GC A3, …    │
│   • Snowflake features used:  Cortex Search/Analyst/…       │
│   • Common Q&A: 5 anticipated questions + 1-line answers    │
└─────────────────────────────────────────────────────────────┘
```

---

## Screenshot strategy — three options

### Option A — Static thumbnails per scenario (lightweight, ships fast)
- One PNG per scenario in `public/script-thumbs/{id}.png` (1280×720, ~80kB).
- Author manually for hero scenarios (~14), use a placeholder gradient with the scenario title for the other 76.
- Pros: zero runtime cost; no headless browser needed; works offline; works on GitHub Pages.
- Cons: 14 hand-authored, 76 placeholder.

### Option B — On-page live mini-stage embed (no screenshots, render the actual UI)
- Each script block embeds an `<iframe src="/section-page#scenario-id">` sized 1280×400, lazy-loaded.
- Pros: always up to date; no asset drift.
- Cons: heavy memory (98 mini-apps), iframe scroll/state weirdness, breaks print mode.

### Option C — Pre-rendered SVG illustrations per stage (medium effort)
- One SVG per stage per scenario (~6 per scenario × 98 = ~600 SVGs).
- Pros: small, scalable, prints clean.
- Cons: heavy authoring effort.

**Recommendation: Option A**, with a helper that falls back to a generated placeholder card (gradient + section icon + title) when `/script-thumbs/{id}.png` is absent. Hero 14 get real screenshots; the rest get placeholders that still look polished.

---

## Files to add / modify

### NEW
1. **`src/pages/ScenarioScript.tsx`** — the new page component. Renders intro/per-stage beats/closing/domain notes/cheat-sheet from `presenterFor(id) ?? derivePresenterFor(scenario)`. Uses `<ScenarioMetaBar>` (already exists), `<ScreenshotCard>` (new local helper), and a printable mode via `?print=1`.
2. **`src/components/scenarios/ScreenshotCard.tsx`** — `<img src={`/script-thumbs/${id}.png`}>` with `onError` fallback to a CSS placeholder card showing the section icon + scenario title.
3. **`public/script-thumbs/.gitkeep`** — empty directory so the static path resolves; real PNGs added later.
4. **`src/data/presenterCheatsheet.ts`** — derives 3–5 anticipated Q&A per scenario from the event log + section defaults (regex on text + section-specific question banks).

### MODIFY
1. **`src/main.tsx`** — add `<Route path="/scenarios/:id" element={<ScenarioScript />} />`.
2. **`src/pages/Scenarios.tsx`** — on each card add a small "Script" button next to the existing "Open scenario" CTA. The card itself still triggers the live demo via the existing onClick; the new button is a `<Link to={`/scenarios/${id}`}>` that stops propagation. So users get two affordances per card: "Open scenario" (live) and "Script" (read-only narrative).
3. **`src/components/narrator/Narrator.tsx`** — in expanded panel header add a tiny "📄 Script" link that opens `/scenarios/:id` in a new tab for the active scenario.
4. **`src/data/presenterScripts.ts`** — keep the existing `derivePresenterFor` but extend it to also synthesise: (a) `domainNotes` defaults per section (one line per domain), (b) intro/closing tone per section.

### NICE TO HAVE
- Print stylesheet block in `src/index.css` so `/scenarios/:id?print=1` prints clean A4 with screenshots inline.
- "Copy script to clipboard" button (one-line + bullets, no markup) so presenters can paste into a teleprompter.

---

## Q&A cheat-sheet generator (per scenario)

Section-keyed question banks (existing scenarios already have plenty of language to mine):

- **CIC** → "How is consent verified?", "What's the override rate?", "Where does CLV come from?"
- **Digital** → "How fast is the journey?", "What's the channel-suppression rule?", "Is this MMM consented?"
- **BSS** → "Where do refunds post?", "Which TMF model?", "Where does the GL impact land?"
- **OSS** → "Which CHG class?", "Who approves the playbook?", "What's the Time Travel scope?"
- **NOC** → "MTTR before/after?", "How many customers impacted?", "Who got the auto-comp?"

The generator picks 5 of these per section, then substitutes scenario-specific tokens (city, vendor, model name) found via regex on the events.

---

## Linking from the catalog

Each scenario card on `/scenarios` gets:
```
[ ▶ Open scenario ]  [ 📄 Script ]   …   [ REALISM ✓ ]   [ /section ↗ ]
```

The script link uses `e.preventDefault(); e.stopPropagation()` inside the card's button to avoid triggering the live demo.

---

## Out of scope (this round)
- Auto-capture screenshots via Playwright/Puppeteer (would need CI).
- Multi-language script translations.
- Presenter mode that auto-advances slides synced to scenario timeline.
