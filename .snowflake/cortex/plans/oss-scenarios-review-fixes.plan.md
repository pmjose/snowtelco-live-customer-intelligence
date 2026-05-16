# OSS scenarios · senior-OSS review

## Context — what I checked

11 OSS scenarios in [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts):

| # | id | what it covers |
|---|---|---|
| 1 | `oss-b2b-provisioning` | Lloyds 280-branch B2B activation (TMF 622→641) |
| 2 | `oss-field-dispatch-liverpool` | Liverpool gNB fan replacement |
| 3 | `oss-capacity-whatif` | Manchester BH upgrade ROI |
| 4 | `oss-energy-save` | NYK mains failure + battery extend |
| 5 | `oss-inventory-drift` | Nightly federated reconcile |
| 6 | `oss-assurance-triage` | TMF 645 ticket auto-triage |
| 7 | `oss-b2b-fast-order` | Lloyds 280-branch fast-order (TMF 622) |
| 8 | `oss-cab-rollback` | Failed CHG → Time Travel rollback |
| 9 | `oss-drive-test-optimise` | Polystar drive-test → SON re-tilt |
| 10 | `oss-vendor-sla-breach` | Vendor-A SLA breach + auto-escalation |
| 11 | `oss-spectrum-refarm` | 700 MHz re-farm milestone |

I checked each event step by step against: technical realism, vendor/standards correctness, narrative arc (detect → observe → plan → act → verify → resolve), ML model name-checking vs the rebuilt OSS pages, focus-route accuracy after the recent CAB → NOC move and Field Force rename, and cross-domain links.

---

## Findings — per scenario (severity tagged)

### 1. `oss-b2b-provisioning` — Lloyds 280-branch B2B activation
- **HIGH · OVERLAP**: tells the same Lloyds 280-branch story as `oss-b2b-fast-order`. Pick one. Recommendation: **retire #1, keep #7** (it's better positioned for TMF 622 + ARR narrative).
- MEDIUM: Step 5 says 2-week field-survey window for only 12 sites — generous. Should be 5-7 days.
- MEDIUM: Wave-1 says 96 sites — but step 4 said only 12 needed surveys (so 268 should be activatable in wave 1). Internal inconsistency.
- LOW: No ML model named (`order_fallout_v2.1`, `auto_orchestration_v3`, `activation_eta_v2`).
- LOW: "MSA SLA 99.95%" — fine, but inventory page shows BBC at 99.95% and Barclays at 99.99%; clarify which tier Lloyds is on.

### 2. `oss-field-dispatch-liverpool` — Liverpool fan replacement
- MEDIUM · NAMING: page kicker is now "Network Field Operations" but scenario still calls it "Field-force dispatch". Bring the language in line.
- MEDIUM: "MTTR-closure 02:48" is ambiguous (2h48m or 02:48 wall-clock?). Use `2h 48m` or `MTTR 168 min`.
- MEDIUM: No ML model named — `ftf_predict_v1` (first-time-fix predictor) should naturally fire here on the parts-on-hand check.
- LOW: No ESG-tagged dispatch chip mentioned (a key new feature on the page).
- LOW: No mention of parts-stockout-risk dimension (also a new feature on the page).

### 3. `oss-capacity-whatif` — Manchester BH upgrade ROI
- MEDIUM · MODEL: page block uses **Cortex Analyst** (text-to-SQL) for what-if, but scenario calls it "Snowpark ML simulator". Wrong primitive.
- MEDIUM: No ML model named (`capacity_forecast_v2` MAPE 8% Prophet+custom should be cited).
- LOW: "sustainability bonus £40k" — vague, doesn't tie to the new £148/MWh + DSR/PPA story.
- LOW: Doesn't reference the new demand-driver Pareto (5G handset attach 38%, FWA 22%, IoT mMTC 16%, etc.) which is the most "executive" visual on the page.

### 4. `oss-energy-save` — NYK rural mains failure
- HIGH · MATH ERROR: Step 9 reads "Generator ETA 2h 15m · margin 1h 50m". With battery extend → 4h 30m runtime and gen at +2h 15m, the margin is **2h 15m**, not 1h 50m. Fix the number.
- MEDIUM: No ML model named — both `energy_save_v3` (RL agent reward 0.78) and `dsr_opportunity_v1` should fire here.
- MEDIUM: Doesn't reference any of the **new resilience tiles** (battery fleet 94.2%, diesel 3.4%, mains-fail rate 0.31, DSR YTD £840k).
- MEDIUM: Doesn't mention `battery_eol_v2` (would naturally surface — "fleet has 412 cells flagged for replace; this site's battery passed 6h endurance test").
- LOW: "Battery upgrade business case auto-drafted" — should explicitly say "Cortex Complete drafted business case ready for CFO".
- LOW: Doesn't reference Scope 1/2/3 attribution or SBTi pathway from the new Energy page.

### 5. `oss-inventory-drift` — Nightly federated reconcile
- HIGH · STANDARDS ERROR: "billing alignment OK (**TMF 620**)" — TMF 620 is **Catalog Management**, not billing. Billing alignment is **TMF 678**. Use the correct ref.
- MEDIUM: No ML model named — `inventory_drift_v3` F1 0.91 sits right on the page block.
- MEDIUM: Doesn't mention the new **drift heatmap by source** (Cramer mid-week peaks · NetAct stale assets · etc.) — the scenario's drift number doesn't match the page Pareto either (page says 38% Cramer attribute drift, scenario says 1,840 stales out of 3,296).
- LOW: No ServiceNow CHG number (other scenarios use `CHG013xxx` format).
- LOW: Doesn't reference `topology_blast_radius_v2` (would naturally fire on "which assets are critical?").

### 6. `oss-assurance-triage` — TMF 645 ticket auto-triage
- LOW: Doesn't mention `severity_classifier_v2` (which has its own ConfidenceGauge on the page).
- LOW: Doesn't mention `mttr_predict_v3` (the BandedLineChart on the page block).
- LOW: "9 to vendor-A field · 4 to own techs" — should explicitly reference the own/vendor mix donut on the page.
- Else: solid scenario.

### 7. `oss-b2b-fast-order` — Lloyds 280-branch TMF 622
- HIGH · OVERLAP: see #1. Retire #1, keep this one.
- MEDIUM · WORDING: "ARR +£840k recognised in revrec_obligations" — ARR isn't recognised; **revenue is**. Should be "MRR +£70k recognised this period (annualised £840k)" for accounting precision (CFO would catch this).
- MEDIUM: "On-time commit 100%" — perfect numbers feel demo-y. Use **97%** or **98%** to be credible.
- MEDIUM: Doesn't mention `order_fallout_v2.1` or `order_jeopardy_v3` (the very models the page block names).
- LOW: Doesn't visit `/oss/topology` to show TMF 638 inventory reservation.

### 8. `oss-cab-rollback` — Failed change auto-rollback
- HIGH · STALE FOCUS PATH: focus payloads point to `/oss/change`. After the recent reorg, the canonical route is **`/noc/change`**. Update.
- HIGH · TECHNICAL ERROR: "PCRF rule v124 · gNB-MAN-M14-*" — PCRF rules don't apply to specific gNBs (gNBs are RAN, PCRF is policy/charging). Either:
  - Reframe as "RRC config v124 on gNB-MAN-M14-*" (RAN-side), OR
  - Reframe as "PCRF rule v124 affects bearer-attach across MAN cluster" (cluster-level, not per-gNB).
- HIGH · VENDOR MISMATCH: "ECAB · Mavenir vendor on bridge" — Mavenir is IMS. PCRF is typically **Cisco** or **Oracle** in UK Tier-1. Pick the right vendor for the actual change being rolled back.
- HIGH · MATH DISCREPANCY: resolve step says "Failed CHG MTTR 34m" but step 4 says "KPI recovers in 4m". The 34m figure isn't supported by any earlier event. Either:
  - Reduce resolve to "MTTR 8m · ECAB convened in parallel" matching the timeline, OR
  - Stretch the timeline so 34m makes sense (rollback at +4m, ECAB convene/attestation/PIR draft taking up to +34m).
- LOW: No `cab_auto_approve_v2` / `cfr_predict_v3` / `cab_rollback_v1` model attribution.

### 9. `oss-drive-test-optimise` — Polystar drive-test → SON
- LOW · NAMING: "son_recommendations_v2" — model should be `son_recommender_v2` (consistency with other ML model names on the page).
- LOW: "gold.energy_attribution updated" by an SON re-tilt is tenuous. Either drop or justify ("zero-truck-roll attribution captured in `gold.energy_attribution`").
- LOW: Doesn't visit `/oss/field-force` to show ESG-tagged zero-truck-roll dispatch — missed cross-page opportunity.
- LOW: Should mention which CHG class (Standard, since pre-approved window).

### 10. `oss-vendor-sla-breach` — Vendor-A field SLA breach
- HIGH · LOGIC INVERSION: Step 6 says "Vendor-A on-site at +18m (breach) · vendor-B reserve crew stood down". If Vendor-A breached the SLA by 18m, **Vendor-B should have been dispatched**, not stood down. Either:
  - Say "Vendor-A on-site at +12m (just inside SLA) · vendor-B reserve crew stood down" (no breach), OR
  - Say "Vendor-A on-site at +28m (18m breach) · vendor-B was dispatched but cancelled mid-route as Vendor-A confirmed arrival".
- MEDIUM · AMBIGUITY: "0 BSS dispute" but earlier "SLA penalty £4.2k recorded". Penalty is to vendor; dispute is from customer. Wording leaves the audience unsure who paid whom. Clarify: "vendor penalty £4.2k debited to Vendor-A · 0 customer SLA-credit triggered".
- MEDIUM: No `ftf_predict_v1` mention even though it would directly flag this (parts-on-hand + skill-match dimension).
- LOW: "vendor scorecard updated" — should name the gold table (`gold.vendor_scorecards` — but actually we have `gold.partner_settlements` only; might need `gold.vendor_perf` invented or use `silver.engineer_roster` cross-link).

### 11. `oss-spectrum-refarm` — 700 MHz milestone
- MEDIUM · WEAK IMPACT: 24 cells decommissioned · £40k/yr saving — too small to be exec-grade. Either:
  - Scale up to "**national 700 MHz programme milestone — 600 cells decommissioned across UK · £980k/yr · 24 t CO₂/yr**", OR
  - Merge into the Capacity scenario as a sub-event.
- MEDIUM · MODEL NAMING: "spectrum_refarm_v1 auto-detects decommission" — this is event-detection, not really an ML model. Either drop the `_v1` suffix or reframe as `spectrum_lifecycle_v1`.
- LOW: Numbers are direct copies from the Capacity-page table row — feels like dramatising a row, not a story.
- LOW: Doesn't reference `capacity_forecast_v2` even though it directly refreshes capacity forecast.

---

## Cross-cutting issues

1. **Overlap (HIGH)** — Lloyds 280-branch told in two scenarios. Retire `oss-b2b-provisioning` (#1).
2. **Stale focus paths (HIGH)** — `oss-cab-rollback` still routes to `/oss/change`; canonical is `/noc/change`.
3. **ML model attribution gap** — pre-existing scenarios (1–5) cite no models by name; the new pages prominently feature `order_fallout_v2.1`, `cfr_predict_v3`, `mttr_predict_v3`, `capacity_forecast_v2`, `energy_save_v3`, `inventory_drift_v3`, `route_optimiser_v2`, `assurance_triage_v2`, `topology_blast_radius_v2`, `cab_auto_approve_v2`, `dsr_opportunity_v1`, `battery_eol_v2`. Each scenario should name-check at least one model.
4. **Standards / vendor errors** — TMF 620 used for billing (should be 678); PCRF assigned to Mavenir (should be Cisco/Oracle); PCRF rule applied per-gNB (wrong layer).
5. **Math errors / inconsistencies** — energy-save margin (1h 50m vs 2h 15m); CAB MTTR (34m vs 4m KPI recovery).
6. **Naming inconsistency** — pages now say "Network Field Operations" but scenarios still say "Field-force dispatch".
7. **New page features under-narrated** — Scope 1/2/3, SBTi pathway, resilience tiles, DSR, vendor footprint, peer benchmark, hedge coverage, cost-and-risk panel, demand-driver Pareto, drift Pareto, impact-radius card, animated rollback timeline — none of these surface in any scenario.
8. **Cross-page focus underused** — most scenarios stay on 1–2 pages. Best scenarios visit 3+ pages (provisioning does → field-force → inventory). Apply the same pattern to others.

---

## Implementation steps (single-file edits to `sectionScenarios.ts`)

1. **Retire `oss-b2b-provisioning`** (#1) — remove the `const` and remove from the catalog array. Keep `oss-b2b-fast-order` as the canonical TMF 622 + activation story.
2. **`oss-field-dispatch-liverpool`** — rename to "Network Field Operations · Liverpool fan replacement"; cite `ftf_predict_v1` confidence + parts-on-hand; add ESG-tag step; format `MTTR 168 min`.
3. **`oss-capacity-whatif`** — replace "Snowpark ML simulator" with "Cortex Analyst-driven what-if"; cite `capacity_forecast_v2` MAPE 8%; add demand-driver Pareto reference; tighten ROI math.
4. **`oss-energy-save`** — fix margin math (2h 15m); cite `energy_save_v3` reward 0.78 + `battery_eol_v2`; add resilience tile reference (battery fleet 94.2%); add explicit Cortex Complete for the business case; add Scope 2 attribution mention.
5. **`oss-inventory-drift`** — fix "TMF 620" → "TMF 678"; cite `inventory_drift_v3` F1 0.91; align numbers with page Pareto (38% Cramer attribute drift); add `topology_blast_radius_v2` cross-link.
6. **`oss-assurance-triage`** — cite `severity_classifier_v2` and `mttr_predict_v3` explicitly; reference own/vendor mix donut.
7. **`oss-b2b-fast-order`** — fix "ARR +£840k recognised" → "MRR +£70k recognised this period (annualised £840k)"; relax 100% → 97%; cite `order_fallout_v2.1` + `order_jeopardy_v3`; add a `/oss/topology` focus stop.
8. **`oss-cab-rollback`** — change all focus paths from `/oss/change` to `/noc/change`; reframe to "RRC config v124 on gNB-MAN-M14-*" (or PCRF cluster-level — pick one); fix vendor (Mavenir → Cisco/Oracle for PCRF, or Ericsson/Nokia for RRC); reconcile MTTR math (8m or 34m, but consistent).
9. **`oss-drive-test-optimise`** — rename `son_recommendations_v2` → `son_recommender_v2`; remove or justify `gold.energy_attribution` link; add a `/oss/field-force` stop with ESG-tagged zero-truck-roll messaging; mention "Standard CHG (auto-approved)".
10. **`oss-vendor-sla-breach`** — fix logic inversion (Vendor-B should have been dispatched, then cancelled OR Vendor-A made it inside SLA); clarify "vendor penalty £4.2k debited" vs "0 customer SLA-credit"; cite `ftf_predict_v1`; name `gold.vendor_perf` (or use `gold.partner_settlements`).
11. **`oss-spectrum-refarm`** — scale up to national programme (600 cells · £980k/yr · 24 t CO₂); rename detector reference; cite `capacity_forecast_v2` directly.

## Verification

1. `node node_modules/typescript/lib/tsc.js --noEmit` clean.
2. `node node_modules/vite/bin/vite.js build` clean.
3. Smoke check on `/scenarios` — open each OSS scenario, confirm:
   - It opens the right page (no `/oss/change` 404 — should redirect to `/noc/change`).
   - Each scenario references at least one model from the page block it lands on.
   - Resolve step text ≤ 120 chars (so it fits the card UI).
4. Manual narrative read of each scenario — check the arc still flows after edits.

## Critical Files

- [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) — the only file we edit; all 11 OSS scenarios live between lines ~1106–1320.
- [src/pages/oss/OssOverview.tsx](src/pages/oss/OssOverview.tsx) — reference for page kickers + KPIs to align with.
- [src/pages/oss/OssMl.tsx](src/pages/oss/OssMl.tsx) — reference for the canonical model names we should name-check (`order_fallout_v2.1`, `cfr_predict_v3`, `mttr_predict_v3`, `capacity_forecast_v2`, `energy_save_v3`, `inventory_drift_v3`, `route_optimiser_v2`, `assurance_triage_v2`, `topology_blast_radius_v2`, `cab_auto_approve_v2`, `cab_rollback_v1`, `dsr_opportunity_v1`, `battery_eol_v2`, `kwh_demand_forecast_v2`, `site_anomaly_v1`, `ftf_predict_v1`, `severity_classifier_v2`).
- [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) — confirms `/noc/change` is the canonical change-management route now.
- [src/main.tsx](src/main.tsx) — confirms both `/noc/change` and the `/oss/change` alias resolve to the same component.

## Out of scope

- Adding new OSS scenarios beyond the 11 — review only.
- Changing the data model for `SectionScenario`.
- Touching NOC/BSS/Digital scenarios.
- Page-side edits (the rebuild is good; only scenarios need this pass).