# Digital expansion — full build plan

Adds 9 new Digital pages, sidebar groupings, scenarios, ML badges, chatbot grounding, gold-table lineage, and 11 in-page deepenings. Designed to stay 100% on-brand with the existing patterns: `vf-card` cards, `KpiTile` strip, `DigitalMlBadge`, `Charts.tsx` primitives, scenario timeline beats, and AskCIC scenario lookup.

## Sidebar layout

The Digital section gets a third group so the page list stays scannable:

```
Digital Channels       (existing — 6 entries)
Marketing              (existing — 5 entries)
AI & Decisioning       (NEW)
  Decisioning Brain         /digital/decisioning
  Voice of Customer         /digital/voc
  Experimentation           /digital/experiments
  Personalisation Studio    /digital/martech            (MarTech & Activation Hub)
  Pricing Intelligence      /digital/pricing
Trust & Operations    (NEW)
  Self-Service Hub          /digital/self-service
  Privacy & Consent         /digital/privacy
  Forecasting & Capacity    /digital/forecast
  Identity Trust            /digital/identity
```

## Files touched

**New (9 pages, 1 chart module, 1 scenario module update, 1 chat module update):**
- `src/pages/digital/DigitalDecisioning.tsx`
- `src/pages/digital/DigitalVoC.tsx`
- `src/pages/digital/DigitalExperiments.tsx`
- `src/pages/digital/DigitalMartech.tsx`
- `src/pages/digital/DigitalPricing.tsx`
- `src/pages/digital/DigitalSelfService.tsx`
- `src/pages/digital/DigitalPrivacy.tsx`
- `src/pages/digital/DigitalForecast.tsx`
- `src/pages/digital/DigitalIdentity.tsx`
- `src/pages/digital/DigitalCharts.tsx` — append ~12 new chart primitives.

**Edited:**
- `src/main.tsx` — register 9 new routes.
- `src/components/app/Sidebar.tsx` — add the two new nav groups.
- `src/data/sectionScenarios.ts` — add 9 new scenarios (one per page) so each lands on its home page when run; register them in the section list.
- `src/data/cicChat.ts` — add prompts + answers for the 9 new scenarios so AskCIC stays grounded.
- `src/data/mlMeta.ts` — add `mlByDigitalPage` entries for the 9 new pages.
- `src/pages/Briefing.tsx` — add `DIGITAL_OUTCOMES` rows for the 9 new scenarios.
- `src/pages/Lineage.tsx` — add new gold-table rows used by these pages.

## Per-page spec

For each new page: `PageHeader` with `DigitalMlBadge`, KPI strip (4–6 tiles), 2–3 chart panels, 1–2 tables/heatmaps, gold-table lineage chip, GDPR/regulatory chip, and a "Run scenario" affordance.

### 1. Decisioning Brain (`/digital/decisioning`)
**KPIs:** Decisions/hour 127k · Eligible/decided 92% · Suppressed 6.3% · Avg latency 41ms · Override rate 0.8%.
**Panels:**
- Reasoning trace timeline (event → policy → eligible offers → ranked → executed) for the active scenario.
- Suppression-reason histogram (consent, cap, vulnerability, fatigue, quiet hours, competitor parity).
- "Today's AI decisions" funnel: Requested 412k → Eligible 388k → Suppressed 24k → Served 364k → Converted 29.4k.
- Policy library table (8 policies, version, last edited, blocking).
**ML:** `decisioning_brain_v1.4` AUC n/a (rules+ML hybrid) · `gold.decision_lineage`, `gold.policy_registry`, `gold.offer_eligibility`.
**Scenario:** `dig-decisioning-trace` — walks one customer's NBA from intent through to delivered offer, 18s.

### 2. Voice of Customer (`/digital/voc`)
**KPIs:** Verbatims/day 18.4k · Theme drift +12 · NPS detractors 14.2% · Top theme "5G coverage Manchester" · App-store score 4.6.
**Panels:**
- Theme volume sparklines (top 8 themes, 30-day trend).
- Sentiment heatmap (theme × week).
- Source mix donut (App reviews, chat, voice, social, email feedback).
- Verbatim sample feed (5 redacted verbatims, AI-classified, source link).
**ML:** `voc_classifier_v3.1` AUC 0.91 drift OK · `gold.review_corpus`, `gold.cc_chats`, `gold.ivr_calls`, `gold.social_mentions`.
**Scenario:** `dig-voc-theme-drift` — Manchester 5G theme spikes, store rating risk forecast, intervention triggered.

### 3. Experimentation Platform (`/digital/experiments`)
**KPIs:** Active tests 24 · Completed YTD 184 · Avg ramp 7d · Win rate 28% · Guardrail breaches 1.
**Panels:**
- Live test grid (test, owner, ramp %, p-value, primary metric delta, guardrails OK/breach).
- Conflict matrix (heatmap of mutual-exclusion overlaps).
- Bayesian posterior chart (prior → posterior for the focused test).
- Holdout leaderboard.
**ML:** `bayesian_uplift_v2` · `gold.experiment_assignments`, `gold.experiment_outcomes`, `gold.holdout_register`.
**Scenario:** `dig-experiment-rollout` — 5G Hero campaign passes Bayesian threshold, ramps 10 → 50 → 100%.

### 4. Personalisation / MarTech Hub (`/digital/martech`)
**KPIs:** Identity match-rate 88% · Audience sync lag P95 92s · Touchpoints/day 6.4M · Failed deliveries 0.18% · Schema-drift alerts 2.
**Panels:**
- Identity graph stats (deterministic vs probabilistic match, household stitching).
- Sync-lag chart per partner (Adobe AEP, Salesforce MC, Sinch, Braze).
- Webhook failure ledger (last 24h).
- Audience freshness heatmap (audience × destination × age).
**ML:** `identity_resolution_v3` AUC 0.94 · `gold.identity_graph`, `gold.audience_sync_log`, `gold.webhook_events`.
**Scenario:** `dig-martech-sync-lag` — Salesforce MC sync lag spikes to P95=4 min during a campaign launch; auto-throttled and recovered.

### 5. Pricing & Offer Intelligence (`/digital/pricing`)
**KPIs:** Tariffs live 24 · Elasticity median −1.18 · Margin floor breaches 0 · Active price A/Bs 6 · Competitor delta avg −£1.20.
**Panels:**
- Elasticity curves (price vs forecast attach, per tariff).
- Willingness-to-pay segments (donut + table).
- Price A/B leaderboard.
- Competitor parity tracker (your price vs A/B/C).
**ML:** `tariff_elasticity_v2.0` · `gold.tariff_elasticity`, `gold.competitor_ads`, `gold.price_test_register`.
**Scenario:** `dig-price-test` — SnowFlex 30GB £18 vs £20 A/B reaches significance; recommendation auto-drafted.

### 6. Self-Service Hub (`/digital/self-service`)
**KPIs:** Containment 64% (+9pp) · IVR self-serve 41% · Web help 72% · KB articles 1,840 · Top unanswered "esim transfer iPhone".
**Panels:**
- Containment funnel (intent → search → answer → resolved or escalated).
- KB hit-rate heatmap (intent × channel).
- Unanswered questions feed (top 10).
- Channel-mix sankey (IVR + WebChat + App Help + KB → resolved/escalated).
**ML:** `containment_v2.3` · `gold.kb_hits`, `gold.ivr_calls`, `gold.cc_chats`.
**Scenario:** `dig-selfservice-kb-gap` — 600 unanswered "esim transfer" hits, KB article auto-drafted, FCR rises 4pp.

### 7. Privacy & Consent Centre (`/digital/privacy`)
**KPIs:** Consent rate 71% · Opt-outs 24h 1,420 · DSAR queue 18 (avg age 3.2d) · ICO breaches 0 · Vulnerability flags 2,440.
**Panels:**
- Consent drift sparkline (28-day, by purpose).
- DSAR queue table (case, age, status, owner).
- Suppression-reason histogram.
- Vulnerability register summary by flag type.
**ML:** `vulnerability_v2.1` · `gold.consent_register`, `gold.dsar_register`, `gold.vulnerability_register`.
**Scenario:** `dig-privacy-dsar-surge` — DSAR submissions spike post-breach-news; auto-routed to specialist queue, SLA held.

### 8. Forecasting & Capacity (`/digital/forecast`)
**KPIs:** Forecast horizon 14d · MAPE 6.4% · Surge prob today 12% · WFM gap +18 FTE · P95 wait 1:42.
**Panels:**
- Volume forecast vs actuals (chat / voice / email).
- Surge-probability heatmap (hour × day-of-week).
- Capacity vs forecast gap chart.
- Driver waterfall (campaign launch +1.2k, NOC incident +800, seasonality −400).
**ML:** `volume_forecast_v3` MAPE 6.4% · `gold.cc_chats`, `gold.ivr_calls`, `gold.wfm_roster`.
**Scenario:** `dig-forecast-surge` — campaign + NOC incident drive 4× chat volume; surge plan auto-published.

### 9. Identity & Login Trust (`/digital/identity`)
**KPIs:** Login success 99.42% · MFA adoption 81% · Biometric 64% · SIM-swap flags 12 · ATO attempts blocked 184.
**Panels:**
- Login success trend.
- MFA-method donut (TOTP, push, biometric, SMS).
- SIM-swap detection feed (last 24h, with score and outcome).
- Geo-velocity heatmap (impossible-travel detector).
**ML:** `ato_risk_v2.4` AUC 0.93 · `gold.login_events`, `gold.sim_swap_register`, `gold.mfa_register`.
**Scenario:** `dig-identity-sim-swap` — SIM-swap attempt detected on a high-CLV account; auth challenge issued, blocked.

## Existing-page quick wins (in scope)

Each is a small panel addition (no new routes):
- **Overview** — "Today's AI decisions" mini-funnel panel.
- **Conversational** — "Top unanswered questions" feed.
- **Voice** — "Saves by reason" donut.
- **Journeys** — Journey-conflict matrix heatmap (which journeys collide for the same customer).
- **Channels** — Frequency-cap heatmap (hour × channel).
- **Marketplace** — Partner cohort table (revenue × renewal × NPS).
- **Campaigns Hub** — Copy-variants leaderboard with brand-voice score.
- **Funnel** — Geo-holdout incrementality result panel.
- **Audience** — Cortex Search natural-language search bar (mocked, opens canned audience).
- **Lifecycle** — Journey-conflict + fatigue-score panel.
- **Brand** — Share-of-search vs share-of-voice trend chart.

## Scenarios

Add 9 new scenarios (1 per new page) to `sectionScenarios.ts`, each ~16–20s with the standard DETECT → OBSERVE → PLAN → ACT → VERIFY → RESOLVE arc, focus targets pinned to the new page, gold-table references in the resolve toast. Register all 9 in the section scenario list and surface in the dropdown. Add 9 entries to `Briefing.tsx` `DIGITAL_OUTCOMES`.

## Chatbot grounding

Add 9 entries to `scenarioPrompts` and `scenarioAnswers` in `cicChat.ts` — 4 prompts + 3 short answers per scenario, citing the right gold tables.

## Gold tables introduced

`gold.policy_registry`, `gold.social_mentions`, `gold.experiment_assignments`, `gold.experiment_outcomes`, `gold.holdout_register`, `gold.identity_graph`, `gold.audience_sync_log`, `gold.webhook_events`, `gold.price_test_register`, `gold.kb_hits`, `gold.dsar_register`, `gold.wfm_roster`, `gold.login_events`, `gold.sim_swap_register`, `gold.mfa_register`. Add to `Lineage.tsx`.

## Build verification

- `node node_modules/typescript/lib/tsc.js --noEmit`
- `node node_modules/vite/bin/vite.js build` (sanity)
- Browser walk: hard-refresh /digital, click each new sidebar entry, run each new scenario, open AskCIC and check grounding.

## Phasing

This is a big drop. To keep blast-radius manageable I'll execute in 3 phases under one sustained run:

1. **Phase A — scaffolding** (1 commit's worth): sidebar groups, 9 stub pages with KPI strip + headers + ML badges + scenario buttons (no charts yet), 9 routes registered, 9 stub scenarios, 9 stub chatbot entries.
2. **Phase B — content** : fill each page with charts, panels, tables, tooltips, lineage chips. Wire scenario beats. Author chatbot answers.
3. **Phase C — quick wins**: add the 11 in-page deepenings.

After each phase: typecheck → fix → continue.

## Risk & scope notes

- Big surface area. To keep velocity, every new page reuses existing patterns (no new design language). Charts come from `Charts.tsx` and `DigitalCharts.tsx`.
- All synthetic data — no Snowflake connection.
- Visual regressions risk on smaller widths; will reuse existing breakpoints.
- The Decisioning Brain is the highest-value page; if time pressure forces a cut, drop Identity Trust first (least uniquely Snowflake-y).

## Out of scope

- React component test coverage (project doesn't have unit tests for pages today).
- Live data plumbing.
- Re-theming or a11y deep dive.

## Tasks

Tracked in the plan card.