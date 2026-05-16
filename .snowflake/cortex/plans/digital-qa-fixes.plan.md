# Digital scenario QA — fix plan

After a full QA pass over all 16 Digital scenarios + Ask CIC, the hard issues are:

| # | Severity | Issue |
|---|----------|-------|
| 1 | **P1** | Ask CIC always grounds on Manchester regardless of which Digital scenario is active. Prompts, header, placeholder and every answer reference M14 / Amelia / 2,417 cohort. |
| 2 | **P1** | Anniversary scenario claims "ARPU lift £18k/mo" — that figure is cohort revenue, not ARPU per user. |
| 3 | **P2** | App-store rating intervention focuses on `/digital/conversational` — should land on `/digital/marketing/brand` where the review-sentiment surfaces live. |
| 4 | **P2** | Web checkout abandonment focuses on `/digital/journeys` — should land on `/digital/marketing/funnel` (the funnel + attribution view). |
| 5 | **P2** | App fraud at signup focuses on `/digital/conversational` — should land on `/digital/channels` (where the channel-level KYC step-up plays out). |
| 6 | **P2** | Winback timeline reads as if 1,640 (day-3, 9%) and 2,420 (day-7) contradict each other — fix progression copy. |

## Scope of changes

**Files touched (4):**

1. `src/data/cicChat.ts` — widen `scenarioPrompts` and `scenarioAnswers` from `Record<ScenarioId, …>` to `Record<string, …>` and add 16 Digital scenarios.
2. `src/components/chat/AskCIC.tsx` — pull the active section scenario from `selectedIncidentId`; pick its title, prompts, answers; fall back to CIC scenario when the active section is `cic`.
3. `src/state/DemoStateProvider.tsx` — read-only: confirm `selectedIncidentId` is exposed in context (it is).
4. `src/data/sectionScenarios.ts` — change focus routes on `digAppStoreWatch`, `digCheckoutAbandon`, `digFraudSignup`. Tweak `digAnniversaryLoyalty` and `digWinbackLapsed` copy.

## Detailed changes

### 1. Chatbot grounding (P1)

Today `AskCIC` does:
```ts
const { scenario } = useDemoState();           // CIC scenario only
const prompts = scenarioPrompts[scenario.id] ?? scenarioPrompts.manchester;
const ans = findAnswer(q, scenario.id);
```

After the change:
```ts
const { selectedIncidentId, scenario } = useDemoState();
const sec = sectionScenarioById(selectedIncidentId);
const activeId = sec?.id ?? scenario.id;
const activeLabel = sec?.title ?? scenario.label;
const activeShort = sec?.title?.split(' · ')[0] ?? scenario.short;
const prompts = scenarioPrompts[activeId] ?? scenarioPrompts.manchester;
const ans = findAnswer(q, activeId) ?? scenarioAnswers[activeId]?.[0] ?? scenarioAnswers.manchester[0];
```

This means the bot tracks whichever section scenario is currently selected — Digital, BSS, OSS, NOC — not just the CIC one. CIC scenarios still work because their section IDs (`cic-manchester-churn`, etc.) will get their own entries OR fall through to the existing `manchester` / `birmingham-bill` / `leeds-snowflex` / `london-5g` keys via an alias map.

To keep the existing CIC entries working without renaming, add an alias map:
```ts
const aliasFor: Record<string, string> = {
  'cic-manchester-churn': 'manchester',
  'cic-birmingham-billshock': 'birmingham-bill',
  'cic-leeds-snowflex': 'leeds-snowflex',
  'cic-london-5g-upgrade': 'london-5g',
};
const lookupId = aliasFor[activeId] ?? activeId;
```

Type changes in `cicChat.ts`:
- `scenarioPrompts: Record<string, string[]>`
- `scenarioAnswers: Record<string, CicQa[]>`
- `findAnswer(q: string, id: string)` becomes string-indexed.

### 2. Digital chatbot content (P1)

For each of the 16 Digital scenarios, add ~5 prompts. Each scenario gets 4–5 short answers with realistic gold-table citations. The answers reference the same cohort sizes / conversion rates / model names that already appear in the scenario timeline, so the QA pass is internally consistent.

Example for `dig-campaign-launch-lookalike`:
```ts
'dig-campaign-launch-lookalike': [
  'How big is the lookalike audience and what suppression applied?',
  'What did the holdout-vs-treatment uplift look like?',
  'Which creative variant won?',
  'What is the projected ARPU lift?',
  'How was vulnerability + fatigue suppression handled?',
],
```

with answers citing `gold.customer_embeddings`, `gold.touchpoints`, `gold.spend_ledger`, `gold.decision_lineage`. Numbers are reused: 240,180 lookalike, 232k net reachable, 5% holdout, 11.4% conv vs 5.0%, +6.4pp uplift, ROAS 4.6×, 27,400 conversions.

Same pattern for the other 15 scenarios. Each answer is 4–8 lines, no charts initially (we can add them later if needed; the chart payload is optional).

### 3. Focus target fixes (P2)

In `sectionScenarios.ts`:

**dig-appstore-rating-watch**
```diff
- focus: { route: '/digital/conversational', target: 'page' }   // detect
+ focus: { route: '/digital/marketing/brand',  target: 'page' }
- focus: { route: '/digital/channels',         target: 'page' }   // act-care
+ focus: { route: '/digital/marketing/brand',  target: 'page' }
- focus: { route: '/digital',                  target: 'page' }   // resolve
+ focus: { route: '/digital/marketing/brand',  target: 'page' }
```

**dig-web-checkout-abandon**
```diff
- focus: { route: '/digital/journeys',           target: 'page' }   // detect
+ focus: { route: '/digital/marketing/funnel',   target: 'page' }
- focus: { route: '/digital/channels',           target: 'page' }   // act-care (kept — channels is correct here)
  focus: { route: '/digital/channels',           target: 'page' }
- focus: { route: '/digital',                    target: 'page' }   // resolve
+ focus: { route: '/digital/marketing/funnel',   target: 'page' }
```

**dig-app-fraud-signup**
```diff
- focus: { route: '/digital/conversational', target: 'page' }   // detect
+ focus: { route: '/digital/channels',       target: 'page' }
- focus: { route: '/digital/channels',       target: 'page' }   // act-care (already correct)
  focus: { route: '/digital/channels',       target: 'page' }
- focus: { route: '/digital',                target: 'page' }   // resolve
+ focus: { route: '/digital/channels',       target: 'page' }
```

Voice scenario already correctly routes to `/digital/voice` at `t=0` — no change. The QA agent missed it because they were stepping forward from a stale state, not because the focus was wrong.

### 4. Number fixes (P2)

**digAnniversaryLoyalty** — change "ARPU lift £18k/mo" to "revenue lift £18k/mo (≈ £3.88/mo per converter)".

**digWinbackLapsed** — clarify the day-3 / day-7 progression:
```diff
- 'Day-3: 1,640 returned · 9% conversion · vs 4% baseline winback rate'
+ 'Day-3: 1,640 returned · 9% conversion at day-3 vs 4% control'
- 'Day-7: 2,420 retained · ARPU lift £42k/mo run-rate'
+ 'Day-7: 2,420 cumulative retained · 13% by day-7 vs 4.1% control · revenue +£42k/mo run-rate'
```

### 5. Build verification

- Run `node node_modules/typescript/lib/tsc.js --noEmit` to confirm clean types.
- Dispatch a small browser subagent to spot-check the chatbot on three Digital scenarios (dig-campaign-launch-lookalike, dig-vulnerable-care-routing, dig-refer-a-friend) and confirm:
  - Header reads "grounded on \<digital scenario short\>"
  - Suggested prompts are scenario-relevant (not Manchester)
  - Answers cite Digital gold tables, not CIC ones
  - Reset button still works

## Out of scope

- The other reported "step-forward only shows 1-2 navigable beats" finding is the way the engine intentionally steps between focus events; not a bug.
- The QA agent flagged Voice scenario as a focus mismatch but the source already routes to `/digital/voice` at `t=0`. No code change needed; this was a false positive.
- Optional charts inside Digital chatbot answers (donut/funnel) — can add later in a separate pass if you want richer panels.

## Risk

Low. The changes are purely additive (new scenario IDs in chat data) plus four route-string edits and one copy fix. No engine changes, no schema changes.