# Architecture rebuild + Database page (TMF SID) + Scenarios explorer

## Goal
Make three things measurably better:
1. **Architecture** — go from "long capability list" to a living, animated, vendor-real data plane that reads like a real Tier-1 UK telco design.
2. **Database page (new)** — a real schema browser anchored on TM Forum SID, with the database/schema/table catalog you'd expect on a UK Tier-1 (Vodafone/BT/EE/VMO2-class) Snowflake account.
3. **Scenarios explorer (new)** — a single page that lists all 28 demo scenarios with filters, mini-timelines, and one-click deep links into the right page with the right scenario active.

## Constraints / facts
- Synthetic data only. No live Snowflake connection used.
- Existing Landing references "28 scenarios across 5 sections" (CIC, Digital, BSS, OSS, NOC). The codebase already has 8 NOC scripts + 4 customer scenarios + scenario-shaped journeys in BSS/Digital/OSS.
- Existing Architecture lives in `src/pages/Architecture.tsx` (447 LOC). Existing Lineage in `src/pages/Lineage.tsx` lists ~110 gold tables — reuse these.
- App router is `src/main.tsx` (BrowserRouter + Routes).
- Build commands (already proven clean): `node node_modules/typescript/lib/tsc.js --noEmit` then `node node_modules/vite/bin/vite.js build`.
- Tailwind tokens (`vfRed`, `mist`, `ink`, `vf-card`, `vf-chip`) are the existing visual language — reuse, do not introduce a new design system.

---

## Part 1 — Scenarios explorer `/scenarios`

### 1a. New file `src/data/demoScenarios.ts`
Single source of truth for the 28 scenarios. Each entry:
```ts
{
  id, domain: 'CIC'|'Digital'|'BSS'|'OSS'|'NOC',
  theme: 'network'|'billing'|'commercial'|'growth'|'fraud'|'finance'|'esg',
  title, city, severity: 'High'|'Medium'|'Low',
  cortexFeatures: ['Cortex Agents','AI_AGG',...],
  vendors: ['Ericsson ENM','Mavenir IMS',...],
  targetRoute: '/noc' | '/bss/billing' | '/digital/conversational' | ...,
  scenarioId?: ScenarioId,        // for the existing CIC scenario provider
  miniTimeline: [4 steps],         // detect / diagnose / act / verify
  kpiBefore, kpiAfter, kpiDelta,
  storyline,
}
```
Composition target — 28 entries:
- **NOC (8)**: Manchester M14 · Liverpool L1 · Leeds LS2 · London E14 IMS HSS · NYK rural mains · Roaming partner DE · Single SIM-swap · Mass SIM-swap.
- **CIC (4)**: Manchester churn · Birmingham bill-shock · Leeds SnowFlex · London 5G upgrade.
- **BSS (8)**: Catalog publish · O2A eSIM · Charging OCS · Bill-shock · Dunning recovery · Revenue assurance leakage · Disputes · IFRS 9 ECL.
- **Digital (5)**: Care chat deflection · Voice agent · In-app journey · Marketplace NBA · Privacy DSAR.
- **OSS (3)**: Inventory drift · Field-force routing · Energy save NYK.

### 1b. New page `src/pages/Scenarios.tsx`
Layout:
- Hero with title "Demo scenarios · pick one and open the demo on the right page" + active scenario callout.
- Sticky filter bar: search box (city/keyword) + domain pills + theme pills + severity dots + Cortex feature multi-select.
- Animated grid of cards (framer-motion stagger 0.04s). Card content:
  - Top row: domain badge · city · severity dot.
  - Title.
  - Animated 4-step mini-timeline (icons + dotted progress that animates on viewport entry).
  - KPI delta chip (e.g. `−84% MTTR`).
  - Cortex pill row · vendor pill row.
  - "Open scenario →" CTA.
- Card click → `setScenario(...)` if it has a scenarioId, then `navigate(targetRoute)`.
- Empty state when filters return zero.
- Keyboard: `/` focuses search, `Esc` clears filters.

### 1c. Wire it
- Add `<Route path="/scenarios" element={<Scenarios />} />` in `src/main.tsx`.
- Add sidebar entry "Demo scenarios" near Architecture.
- Update Landing's primary CTA "Open the demo" → `/scenarios`.
- Add a 6th tile to Landing's domain grid linking to `/scenarios` (or convert to a hero CTA strip beside the domains).

---

## Part 2 — Architecture rebuild `/architecture`

Goal: stop being a list, start being a system diagram that breathes.

### 2a. New top-of-page hero — animated layered data plane
Replace `ArchSvg` with a multi-layer SVG (1500×880 ish) with 5 vertical bands:

1. **Sources** — six wide pill rows, each with real vendor names: Ericsson ENM · Nokia NetAct · Mavenir IMS · Oracle USPL HSS · Polystar/Empirix probes · Amdocs CES · Netcracker · Salesforce · ServiceNow · Genesys · NICE · Adobe AEP · Snowplow · Cisco IOS-XR · Juniper MX · GRX/IPX partners.
2. **Ingestion** — Snowpipe Streaming · Kafka Connector · Snowpipe auto-ingest · Openflow · External Tables/Iceberg. Each shows a live tickerized throughput badge (animated count-up using requestAnimationFrame, same pattern as Landing's LiveSavingsTicker).
3. **Storage & compute** — micro-partitioned columnar · Iceberg · Hybrid Tables · Time Travel · multi-cluster warehouses (NOC_WH XL × 4, BSS_WH L × 2, FRAUD_WH M × 1, CORTEX_WH XL GPU). Active query badges blink in/out at 1.2s intervals.
4. **AI · Cortex · Agents** — Cortex Agents (rotating tool-call ticker: AI_AGG → AI_FILTER → Cortex Search → AI_COMPLETE). Cortex Analyst · Cortex Search · Document AI · Snowpark ML.
5. **Domain experiences** — CIC · Digital · BSS · OSS · NOC tiles, each with a live activity badge.

Between layers: bezier-path "rivers" with looping `<animateMotion>` particles, similar to existing `ArchSvg` but layered top-to-bottom and many more particles to feel like a busy plane.

Below the stack: **closed-loop return arc** in a contrasting colour, with the action target rotating every ~2s ("→ RAN OAM (Ericsson)" → "→ Diameter rate-limit" → "→ ServiceNow CHG" → ...).

### 2b. "Trace one event" interactive component
A horizontal 8-stop track. User picks an event type from 6 chips (CDR · Care chat · Order · Alarm · Roaming TAP3 · Web event). On click, an animated packet hops through 8 stops with timing badges (e.g. "Mediation → 12ms", "Snowpipe Streaming → 380ms", "bronze.cdr_raw", "silver.cdr_aggregates → DT 5s lag", "gold.network_experience_score", "Cortex Agent decision · 2.1s", "Action: MLB offset −3dB", "Verify: gold.cell_kpis Δ 5min"). Replays on a loop, pause-on-hover.

### 2c. "UK Tier-1 scale today" KPI strip
6 large counters (animated count-up on scroll-into-view):
- 12.4M subs
- 21,400 cell sites
- 2.4B CDRs / day
- 38 source systems
- 312 gold tables
- 86 Cortex Agents

### 2d. Vendor matrix block
Three-column grid: **Network** · **BSS/CRM** · **Digital/Care** with vendor logos rendered as inline SVG word-marks (no external assets). Hover reveals: protocol used, ingestion path, Snowflake feature.

### 2e. Capability Catalog (collapsed)
Move the existing 11 capability categories into a `<details>`-style collapsible section near the bottom, opened-by-default for the first one. Same cards, smaller chrome.

### 2f. Standards block — keep, condense to one row of pills (already exists).

### 2g. Closed-loop targets — keep, condense to one row of cards.

---

## Part 3 — Database page `/database` (TMF SID)

### 3a. New file `src/data/databaseCatalog.ts`
Real Tier-1 UK shape:
```
SNOWTELCO_NETWORK
  bronze.{enm_pm_counters_raw, netact_alarms_raw, mavenir_diameter_raw, oracle_hss_raw, polystar_probes_raw, cdr_raw, tap3_raw, ipx_raw}
  silver.{ran_telemetry, alarm_window, cdr_aggregates, ims_session_state, hss_subscriber_state, roaming_session, ipx_corridor}
  gold.{cell_kpis, network_alarm_stream, network_experience_score, ims_health, hss_replication, roaming_pass_policy, tap3_reconcile, ipx_traffic}
  platinum.{network_health_index_5min}                  -- DT target_lag = 5s

SNOWTELCO_BSS
  bronze.{amdocs_ces_raw, netcracker_orders_raw, salesforce_cdc_raw, oracle_ofsc_raw, billing_raw, charging_raw, mediation_raw, fraud_raw}
  silver.{accounts, contracts, subscriptions, services, products, quotes, orders, charges, bills, payments, dispute_intake, fraud_signal}
  gold.{churn_features, bill_shock_features, ecl_provisions, order_fallout_features, clv_register, cross_sell_features,
        revrec_obligations, deferred_revenue, tax_ledger, gl_journals, partner_settlements, ...}    -- 100+ already in Lineage
  platinum.{customer360, revenue_assurance_dashboard, dunning_optimisation}

SNOWTELCO_OSS
  bronze.{netcracker_inv_raw, cramer_raw, servicenow_cmdb_raw, fsl_raw, energy_raw}
  silver.{inventory_state, cmdb_state, work_orders, capacity_window, energy_window}
  gold.{inventory_drift, capacity_forecast, fieldforce_routing, energy_co2_index}
  platinum.{esg_scorecard}

SNOWTELCO_DIGITAL
  bronze.{adobe_aep_raw, snowplow_raw, genesys_raw, nice_raw, app_events_raw, web_events_raw, ivr_raw}
  silver.{touchpoint_paths, conversion_window, care_tickets, voice_transcripts, app_sessions, journey_state}
  gold.{touchpoints, revenue_attribution, voc_corpus, social_mentions, knowledge_base_index, identity_graph, audience_sync_log, experiment_assignments, dsar_register, ...}
  platinum.{nba_serving_table, voc_score_5min}

SNOWTELCO_FINANCE
  bronze.{sap_s4_raw, blackline_raw, treasury_raw, fx_raw}
  silver.{gl_engine, ap_engine, ar_engine, treasury_window}
  gold.{period_close, recon_exceptions, regulatory_register, ofcom_returns, hmrc_mtd_vat, ifrs15_revrec_lattice, cash_position, cash_forecast}
  platinum.{board_pack_5min}
```
Per-table metadata: `rows` (animated count-up), `freshness` (5s/5min/hour/day), `tmfSidDomain` (one of 8), `layer`, `sourceVendor`, `classification` (PII/SOX/PCI/PSD2/None), `maskingPolicy?`, `accessRoles[]`.

### 3b. New page `src/pages/Database.tsx`
- Top: **animated TMF SID 8-domain wheel** (SVG, 8 wedges with subtle rotation on mount, hover scales the wedge, click filters all tables to that domain). Domains: Market/Sales · Product · Customer · Service · Resource · Engaged Party · Common · Enterprise.
- Below the wheel: KPI strip — 5 databases · 22 schemas · 312 tables · 47 dynamic-table pipelines · 86 RBAC roles · 14 masking policies.
- Two-pane layout:
  - **Left**: collapsible tree (DB → schema → table) with row-count chip and freshness dot per node. Layer filter pills on top: bronze · silver · gold · platinum.
  - **Right**: schema detail pane — when a schema is selected, show: schema description, source vendor, ingestion path, list of tables as cards. When a table is clicked, expand inline: columns (with classification chips), masking policy chip, refresh lag, sample query, and "Open lineage →" link to `/lineage`.
- **Compact ER diagram** at the bottom: Party → Customer → Account → Subscription → ProductOffering → Service → Resource (TMF SID core), drawn as boxes with connectors and small cardinality labels. Animated entry.
- Sidebar entry: "Database catalog".
- Route: `<Route path="/database" element={<Database />} />`.

### 3c. Reuse, don't duplicate
- The 100+ gold tables already in `Lineage.tsx` become the seed for the gold layer of the catalog (just import the array shape and tag `tmfSidDomain` per row).
- Lineage page stays as-is; Database is the breadth view, Lineage is the upstream-trace view. Cross-link both ways.

---

## Part 4 — Wiring + verification

1. Add to `src/main.tsx` routes: `/scenarios`, `/database`.
2. Add sidebar nav entries (find the existing nav file and slot under Architecture).
3. Update Landing CTAs:
   - "Open the demo" → `/scenarios`
   - "View Architecture" stays on `/architecture`.
   - Add a small "Schema catalog" link in the platform pill ribbon at the bottom of Landing.
4. Run `tsc --noEmit` then `vite build`. Both must succeed; no new warnings.
5. Smoke check: open `/scenarios` (filter, click a card, lands on the right page with the right scenario active), `/database` (click a TMF SID wedge, table list filters), `/architecture` (animations run, particles flow, "Trace one event" loops).

## Out of scope
- Real Snowflake connection — synthetic everywhere.
- New skills / Cortex calls.
- Restyling the existing Landing visuals beyond CTA target changes.
- Reskinning Lineage.

## Risk + mitigation
- **Heavy SVG animations**: cap concurrent particles at ~24 across all paths; lazy-init on `IntersectionObserver`; pause when tab not visible.
- **Bundle size**: avoid logo image imports — render vendor names as styled SVG `<text>` only.
- **Scenarios route divergence**: scenario card click should fall back to a sensible page (`/command-center`) when `targetRoute` missing, so partial data never breaks navigation.
