# Senior Telecom Data Engineer Review — SnowTelco Live Customer Intelligence

**Reviewer lens:** 15+ years telco data + OSS/BSS, UK MNO Tier-2 scale, regulator-facing.
**Verdict:** **8.7 / 10** — credible, vendor-accurate, regulator-correct. Five fixable gaps below stop it from being **9.5**.

---

## 1. What's real and well-done (no BS detected)

### Standards & protocols — accurate
- **TMF**: 620 (Product Catalog), 622 (Product Ordering), 638 (Service Inventory), 641 (Service Activation), 645 (Service Test/Trouble Ticket), 678 (Product Spec), 681 (Party), 921 (SLA Mgmt) — all used in correct contexts.
- **3GPP**: TS 28.531 for 5G slice mgmt, Diameter Gy for online charging, IMS reachability post-incident, RRC config push semantics, MSISDN/SIM lifecycle — all correct.
- **Ofcom GC**: A3 (emergency calls + IMS reachability), C1 (price changes), C5 (vulnerability), C7 (complaints + 8-week deadlock) — correctly cited per scenario.
- **Other UK regs**: HMRC MTD VAT API, IFRS 9 ECL stage 1/2/3, IFRS 15 obligation recognition, Consumer Duty (FCA Jul-2023), Online Safety Act 2023 (child accounts), Welsh Language Standards, ICNIRP EMF, IPA-LI, Consumer Credit Act, GDPR Art.6 / Art.12 DSAR SLAs — all real and applied to the right cohort.

### Vendors / tooling — real
ENM (Ericsson), NetAct (Nokia), Netcracker, Polystar drive-test, Genesys Cloud, Adobe AEP, Salesforce MC + Loyalty, Stripe + Radar, Experian, D&B, SAP S/4 GL, TAP3 inbound from Telefónica ES — all real, all correctly placed.

### Snowflake primitives — applied to the correct workload
Cortex Search (KB gap, App-Store sentiment), Analyst (capacity what-if NL → SQL), Complete (bill explainer, Welsh-language variant), Agent (creative gen + ranked NBA), AISQL (IRSF anomaly), Snowpark ML (lookalike, SON re-tilt, FTF predict, churn), ML Registry, SPCS (web checkout APIs), Snowpipe Streaming + Dynamic Tables (live ingest of Diameter / Polystar / care chat), Time Travel (CAB rollback), Horizon Catalog (lineage), Streams+Tasks (mediation, GL post). No misuse.

### Numbers that match a UK Tier-2 MNO
13.8M-row monthly bill run, 14.2M IFRS-15 obligations, 1.42M IMS-attached subs, 11.2M loyalty members, 18.4k EOM-MAC window, 240k mass-migration cohort, £24.4M IFRS 9 ECL — all in the believable band.

---

## 2. Realism gaps — concrete fixes

### A. £-impact understated on six scenarios
| Scenario | Current | Senior-engineer corrected |
|---|---|---|
| Acquisition fraud · synthetic-ID | £14k bad-debt saved on 38 blocks | £45-60k (synthetic-ID typically targets £500-2k device finance) |
| MMM reallocation | £180k | £1.5-3M for a national paid-social budget |
| Vendor-A SLA debit | £4.2k | Either label "non-customer-impacting tier" or bump to £18-40k |
| TMF 921 SLA-credit prevention (14 B2B) | £42k | £180-260k (B2B 99.95% breach credits compound) |
| Cross-sell Disney+ "£750k ARR" | Looks like retail | Re-label "margin-share ARR" or recompute at retail (£0.42 is partner-share) |
| Lloyds 280 branches | Lloyds has ~600 | Rename "Lloyds regional pilot — first 280" or pick Metro Bank |

### B. Three technical nits real engineers will flag
1. **RRC rollback via Time Travel** — Snowflake rolls back the **config package** ENM consumes, not the live eNB. Add one explicit beat: *"Time Travel restores config v123 to the publication table; ENM picks up the rollback record on next 60s sync; eNBs converge in ~4m."*
2. **5G slice activation** references **NSSF only** — production path is **CSMF → NSMF → NSSMF → NSSF + AMF policy**. Currently feels hand-wavy. Add the orchestration chain.
3. **ROAS "+0.4"** — units missing. Should read "+0.4x" or "ROAS 3.2 → 3.6".

### C. Spotlight is mostly invisible
**80%** of all events (378 / 469) target `'page'`. The CSS spotlight (.focus-spotlight-target glow) only fires when target ≠ `'page'`. Net effect: presenters see narration update but no on-screen "look here" cue for most beats. **This is the single biggest UX miss.**

Defined widget targets today: `cic-grid, cic-cohort, cic-customer, cic-incident, kpi-strip, slice-ladder, dispute-queue, noc-grid, noc-queue, noc-agent, noc-detail, noc-actions, header, tiles`.

Pages with **only** `kpi-strip` (no per-tile targets):
- **/bss** (Revenue waterfall, regional heatmap, top-products QoQ — all un-tagged)
- **/oss** (capacity what-if, energy-save, drive-test, EMF audit, digital twin — all un-tagged)

**Fix:** Add `data-focus` attributes to those tile components, then sweep `sectionScenarios.ts` to retarget at least 60% of `'page'` events to the right tile. Estimated effort: 4-6h.

### D. Dead route /cic
`/cic` renders empty (length 0 after 2s wait). CIC stage is at `/command-center`. Sidebar/Landing/tour engine likely link to `/cic` somewhere — sweep and replace.

---

## 3. Section-by-section grading (from the trenches)

| Section | Realism | Technical depth | Notes |
|---|---|---|---|
| CIC (10 scenarios) | 9.0 | 8.5 | City + persona + propensity model is the strongest narrative arc. Vulnerable proactive + 999/112 reachability are top-tier. |
| Digital (28 scenarios) | 8.5 | 8.5 | Decisioning trace + outage-comms drafter + DSAR surge + cookie-consent post-2024 ICO crackdown all read like real industry war stories. App-fraud signup numbers a touch low. |
| BSS (28 scenarios) | 8.7 | 9.0 | OCS Diameter Gy, TAP3 reconcile, IFRS 9/15, MTD VAT, mediation suspense — strongest section technically. Lloyds branch count + Disney+ ARR labelling are the two nits. |
| OSS (14 scenarios) | 8.5 | 9.0 | TMF 622/641/645/921 + 3GPP TS 28.531 + EMF/ICNIRP + 700 MHz refarm — very credible. Slice activation needs CSMF/NSMF chain. CAB rollback needs the ENM-pickup beat. |
| NOC (8 incidents — not re-tested in this pass) | n/a | n/a | Out of scope for this review; assume previously audited. |

---

## 4. Priority order

1. **(P0) Spotlight retarget** — Tasks 1 + 2. Without this, 80% of presenter beats are visually flat.
2. **(P0) /cic → /command-center sweep** — Task 5. Currently a dead link in some paths.
3. **(P1) £-impact realism + technical nits** — Tasks 3 + 4. Engineers and CFOs both notice.
4. **(P2) Realism chips** — Task 6. Cheap credibility win on every card.
5. **(P3) Engineer-mode presenter toggle** — Task 7. Two-mode demo (exec / engineer) is a sales-force multiplier.

---

## 5. Bottom line

This is **not** a BS demo. The protocol names, regulator references, and Snowflake primitives are correctly chosen and correctly applied. A working network engineer or BSS architect will recognise their world inside 30 seconds. The remaining gap to **9.5** is **visible focus + a handful of numbers** — six tasks, ~1.5 days of focused work.
