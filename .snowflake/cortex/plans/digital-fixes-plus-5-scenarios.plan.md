# Digital section: critique fixes + 5 new scenarios

## A. Fixes from the QA

### A1. P1 — per-scenario Channel Orchestrator state
The dispatch counts (89 SMS, 67 push, 89 email, 41 RCS, 12 voice, 28 WhatsApp) are hardcoded in [DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx) and stay identical across all five scenarios. Refactor: introduce `digitalChannelStateByScenario` keyed on `selectedIncidentId`. Each scenario gets its own `reach` / `consentRate` / `capRemaining` / `cost` profile. Examples:
- Care chat → 0 dispatch (in-conversation)
- Voice save → 1 voice + 1 SMS follow-up
- eSIM funnel recovery → 1,250 push + 412 voice + 89 email
- Roaming push → 3,720 push + 3,720 email + 612 RCS confirm
- Marketplace bundle → 7,980 in-app modal + 2,180 email confirm

### A2. P1 — Roaming Pass ARPU number
"ARPU lift £1.8k/wk" is wrong (612 × £3 × 7 = £12.8k). Change to `ARPU lift £12.8k/wk · £2.94/customer/day` in the resolve event of [sectionScenarios.ts](src/data/sectionScenarios.ts) and the chatbot answer in [cicChat.ts](src/data/cicChat.ts).

### A3. P1 — Digital-specific briefing
[Briefing.tsx](src/pages/Briefing.tsx) currently always renders the CIC briefing. Add a Digital code path that, when `sc.sectionId === 'digital'`, switches the title, kicker, situation copy, and the Top-5 table into Digital framing (channel, journey, deflection rate, save rate, attach rate). Reuse the at-a-glance bar/donut component, themed amber for Digital.

### A4. Medium — Manchester toast bleed
"Anomaly flagged in Manchester M14: 7 cell sites" appears as a toast in eSIM / Roaming / Marketplace. Likely a CIC-narration leak. Search for the toast trigger and gate it on `scenario.theme === 'network'` AND `sc.sectionId === 'cic'`.

### A5. Medium — CUST-001 reuse
The Care-chat and Voice-save scenarios both star CUST-001. Switch the Voice scenario to **CUST-007 ("Hannah Bennett")** (we already have her) — high-CLV, contract ending, plausible save target.

### A6. Medium — In-App Journeys active highlight
On Roaming Pass, the catalog still flags eSIM as "top journey." When `sc.id` matches a journey card, render that card with a highlighted border + glow. Update inside [DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx) `DigitalJourneys`.

### A7. Medium — Propensity / confidence widget
Add a small "Score distribution" sparkline-histogram inside the journeys + marketplace pages: "4,200 scored — propensity > 0.6 in green" / "24,000 scored — propensity > 0.6 in green." Reuses the inline-SVG pattern from `HeroPanels.tsx` so it stays print-safe.

### A8. Low — `COMPLETIO` truncation
Expand the column / change `text-overflow: ellipsis` on the journey-card label so it shows `COMPLETION`. One-line CSS fix in [DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx).

## B. Five new scenarios

Each is built like the existing five: 7–10 events with realistic `focus` targets, kicker subtitle, ML hint, and a credible technology stack.

### B1. App-store rating intervention
**id:** `dig-appstore-rating-watch` · **duration:** 18s · **stack:** Cortex Search + AI_SUMMARIZE on review corpus + Salesforce MC.
- detect: 200-review rolling sentiment crashes from +0.42 → −0.31 (last 6h on iOS UK).
- observe: theme cluster: "5G coverage Manchester" (28%) + "billing app crash" (24%) + "tariff vs competitor" (18%).
- hypothesize: app-store score will drop from 4.6 → 4.2 within 48h if untreated.
- plan: trigger in-app intercept survey for the affected cohort; spin up dynamic FAQ via Cortex Agent.
- act: 18,400 cohort matched · in-app modal queued · iOS App Store appeal pre-drafted.
- verify: cohort sentiment +0.21 in 6h · 4.6 retained.
- resolve: +0.18 NPS · 0 store-rating slip · evidence pack to App Store team.
- focus: lands on a new tile inside `/digital/conversational` showing review stream + theme clusters.

### B2. Web checkout abandonment recovery
**id:** `dig-web-checkout-abandon` · **duration:** 18s · **stack:** Adobe Experience Platform + Stripe webhook + Snowpark Container Services + Salesforce MC.
- detect: 1,820 carts abandoned at the payment step in the last 30 min (vs baseline 240).
- observe: cohort split — 760 had price-match opportunity, 480 hit address validation, 360 had Stripe 3DS friction, 220 timed out.
- plan: dynamic NBA — price-match for 760 (within margin floor), pre-filled address fix for 480, alternative payment rail for 360.
- act: Salesforce MC + Sinch SMS dispatch · ranked recovery push within 30 min window.
- verify: 612 carts recovered (33%) · checkout completion 76% (+8pp).
- resolve: revenue recovered £92k · CAC saved £34k · 0 PCI / fraud flags.
- focus: lands on `/digital/journeys` with the Web journey row highlighted (existing surface).

### B3. Vulnerability-aware care routing (compliance)
**id:** `dig-vulnerable-care-routing` · **duration:** 22s · **stack:** Cortex Classifier on chat transcript + Ofcom GC C5 / ICO vulnerability flags + Genesys SAVE-VULN queue.
- detect: inbound chat — "I've just been bereaved and I can't pay this bill" · sentiment −0.84.
- observe: vulnerability classifier confidence 0.97 → flag = recent_bereavement.
- plan: suppress all commercial offers; route to vulnerability specialist; activate ICO/Ofcom evidence trail.
- act: chat routed to specialist queue · payment plan offered · safeguarding flag set on account.
- verify: bill paused 30 days · all upsell offers suppressed for 12 mo · regulator-ready audit trail.
- resolve: vulnerability case opened with reference VLN-2026-04812 · CSAT 0.92 · 0 commercial action triggered.
- focus: lands on `/digital/conversational` with a compliance / safeguarding banner above the conversation.

### B4. First-call-resolution prediction
**id:** `dig-fcr-prediction` · **duration:** 18s · **stack:** FCR-prediction model on chat features (intent + sentiment + history) + Genesys routing + skill-based queue.
- detect: 6,200 inbound chats in the last hour at 4× baseline.
- observe: FCR-likelihood model scores each chat — 4,180 above 0.7 (deflection-safe), 1,420 at 0.4–0.7 (assist), 600 below 0.4 (route human).
- plan: route 600 low-FCR chats directly to specialist humans, skipping the bot.
- act: Cortex Agent handles 4,180 in-bot · 1,420 assist-mode · 600 specialist routing.
- verify: FCR overall 78% (+12pp) · escalation cost down £12k/h.
- resolve: 6,200 served · zero queue overflow · vulnerability false-positives 0.4%.
- focus: lands on `/digital/conversational` with a new "FCR forecast" callout (mini stacked bar).

### B5. App fraud / synthetic identity at signup
**id:** `dig-app-fraud-signup` · **duration:** 18s · **stack:** Cortex Classifier on KYC features + device fingerprint + Stripe Radar + Genesys step-up.
- detect: 240 new-customer signups in last 15 min · fraud-risk model flags 18 above threshold 0.85.
- observe: signals — burst velocity (12 from same device fingerprint), geo mismatch (IP UK / address NL / phone IE), Stripe Radar flag.
- plan: pause provisioning · KYC step-up (Onfido document + selfie) · re-score after evidence.
- act: 14 stepped up · 4 hard-block · evidence pack auto-attached to FRD-2026-7421.
- verify: post-step-up only 2 of 14 cleared (12 confirmed synthetic) · 0 false-block by manual review.
- resolve: £42k fraud loss avoided · 16 SIMs not provisioned · GDPR data minimisation respected.
- focus: lands on a new "Trust & Fraud" panel inside `/digital/conversational` (or a new `/digital/fraud` route — see notes).

## C. Where each new scenario renders

We can either:
1. **Reuse existing pages** by adding new content blocks gated on the active scenario — cheaper, less consistent, but ships faster.
2. **Add a sixth Digital sub-page** for fraud/trust under `/digital/fraud`.

Recommended: **Option 1** for B1, B3, B4 (fold into `/digital/conversational` since they're conversational at heart). **Option 2** for B5 with a new `/digital/fraud` route. B2 already fits `/digital/journeys`.

## D. Implementation order

1. Refactor channel orchestrator state per scenario (A1) — touches [DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx).
2. Roaming Pass ARPU correction (A2) — [sectionScenarios.ts](src/data/sectionScenarios.ts) + [cicChat.ts](src/data/cicChat.ts).
3. Manchester toast bleed (A4) — find the trigger; gate on section.
4. Voice save scenario protagonist swap (A5) — [sectionScenarios.ts](src/data/sectionScenarios.ts).
5. In-App Journeys highlight + COMPLETIO truncation (A6, A8) — [DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx).
6. Propensity score widget (A7) — small inline-SVG component, used by journeys + marketplace.
7. Digital-specific briefing path (A3) — [Briefing.tsx](src/pages/Briefing.tsx).
8. Add 5 new scenarios + content blocks (B1–B5) — [sectionScenarios.ts](src/data/sectionScenarios.ts) + minor additions in `DigitalOverview.tsx` for content panels + new `/digital/fraud` route.
9. Typecheck + walk all 10 Digital scenarios.

## E. Verification

- Open `/digital`, switch scenario via sidebar dropdown, confirm channel orchestrator numbers change per scenario.
- Switch from CIC Manchester to a Digital scenario; confirm no Manchester toast appears.
- `/briefing` for any Digital scenario shows Digital framing (kicker, situation, top-table).
- Run all 10 scenarios end-to-end. Each should have its own resolve toast, focus path, and ML chips.
- `tsc --noEmit` clean.

## Critical files

- [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) — 5 new scenario definitions + Roaming Pass + Voice protagonist edits
- [src/pages/digital/DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx) — per-scenario channel state
- [src/pages/digital/DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx) — journey highlight, score widget, COMPLETIO fix, content panels for new scenarios
- [src/pages/Briefing.tsx](src/pages/Briefing.tsx) — Digital code path
- [src/data/cicChat.ts](src/data/cicChat.ts) — chatbot answers for the 5 new Digital scenarios
- [src/main.tsx](src/main.tsx) — register `/digital/fraud` route if we go with Option 2 for B5