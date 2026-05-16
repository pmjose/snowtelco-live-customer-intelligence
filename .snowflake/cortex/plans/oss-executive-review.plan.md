# OSS · senior-OSS-executive review

## What's there today (audit)
`/oss` ships 5 pages from a single `OssOverview.tsx` (~547 LOC):

| Page | What it does | Verdict |
|---|---|---|
| Overview | KPI strip + 5 tiles. Banner=null. | Thin vs BSS/Digital/NOC overviews. No agent narrative, no UK map, no risk panel, no regulator chips. |
| Service Inventory (TMF 638) | KPI strip + service table + donut + bullet list | Good shape. Missing: vendor-mix donut, drift sparkline, lineage chips, audit footer. |
| Provisioning (TMF 641) | KPI + queue table + funnel + line + workflow list | OK. Missing: TMF 622 vs 641 split, fallout-prevention insight, jeopardy view, gold-table chips. |
| Field Force | KPI + work-orders table + donut + bar + dispatch + H&S | OK. Missing: real UK heatmap, parts-stockout risk, vendor split, ESG-tagged dispatch. |
| Capacity Planner | KPI + 3-region forecast + capex H-bar + risk table + what-if | OK. Missing: Pareto of demand drivers, energy/CO₂-aware capex, scenario-aware. |
| Energy & Sustainability | KPI + renewable donut + intensity line + region H-bar + automation telemetry | Good shape. Missing: site-level top drainers, ESG board pack, abatement waterfall. |

`OssOverview` is **stylistically thin** — kicker is generic `text-vfRed` (other domains have themed banners with branded gradients). No live agent ticker. No top-3 hot-list. No scenario hook. No regulator chips. Doesn't match the executive treatment of Landing or NOC.

OSS scenarios in `sectionScenarios.ts` are 5 (provisioning, field-dispatch, capacity what-if, energy-save NYK, inventory drift). All connect, none rich enough.

---

## Senior OSS view · gaps that matter

A Tier-1 UK MNO OSS executive would expect to see (and demo) these areas — and many are missing or merged:

1. **TMF 622 Service Order vs TMF 641 Service Order Activation** — today's "Provisioning" conflates them. Order management owns the customer commit and SLA; activation owns fulfilment. They have different KPIs (jeopardy, fallout, auto-orchestration vs on-time, rework, FCR).
2. **TMF 645 Service Assurance / Trouble Ticketing** — the cross-vendor ticket workflow that sits between NOC alarms, field force, and BSS dispute / SLA-credit flows. Currently invisible.
3. **Change Management / CAB** — every BSS/NOC scenario tells a story about CHGxxx tickets but there's no OSS page that owns CAB rhythm, change failure rate, freeze-window posture, GC A3 PIR drafting.
4. **Network Inventory (physical)** vs Service Inventory — Tier-1 OSS distinguishes Cramer/Netcracker physical (sites · sectors · circuits · racks) from TMF 638 service inventory.
5. **Spectrum & RF Planning** — buried inside Capacity. Should be its own panel even if part of capacity.
6. **Vendor & Workforce performance** — vendor SLA, contractor mix, productivity, parts stock-out — missing.
7. **Visual + agent consistency** — BSS pages now have agent-narrative cards, Cortex-Complete drafts, gold-table chips, animated charts (Treemap, ParetoChart, BandedLineChart). OSS has none of those.
8. **Branding** — the OSS Landing card uses **blue** as the accent. The OSS pages use `text-vfRed` for the kicker — inconsistent.

---

## Plan · three phases

### PHASE A · Polish the existing 5 + Overview *(must-have)*

**A1. `/oss` Overview** — make it executive
- Switch kicker tone to **blue** (`bg-blue-100 text-blue-700`) to match Landing's OSS card.
- Add a header banner card (gradient blue) with the same shape used by Landing's outcome scoreboard: 4 OSS outcome chips (`On-time activation +0.8pp`, `Inventory accuracy 99.2%`, `−14 truck-rolls/day`, `−3.2% energy MoM`).
- Replace the 6-KPI strip with **8 board-grade KPIs** matching the OSS storyline (open WO, on-time activ, jeopardy, drift, MTTR, FTF rate, energy MoM, sites at risk 90d).
- Add a **Top-5 jeopardy / risk panel** ranked across orders + capacity + energy.
- Add a **live UK ops heatmap** (reuse existing `UkRegionMap` from `BssExtended.tsx`) — sites + WO density per region.
- Add an **agent activity card** showing last 5 OSS-agent actions (route-optimised dispatch, energy-save 280W→198W, drift-reconcile, capacity what-if, etc).
- Add a **regulator/standards strip** (TMF 638 / 641 / 645 / 622, Ofcom GC A3, NIS2, ISO 14001 / 27001 / SBTi).
- Tile cards rendered in 4-up grid with outcome chips (matches Landing's domain cards).

**A2. Service Inventory** — add insight + lineage
- Add **vendor-mix donut** (Ericsson / Nokia / Mavenir / Cisco / Juniper) for the resource pool.
- Add **drift sparkline** (last 30 days · daily drift count) and a **drift heatmap** (Netcracker × Cramer × CMDB).
- Add **gold-table audit chips** (`gold.inventory_drift`, `silver.inventory_state`, `gold.topology_snapshot`) with a "Open lineage →" CTA.
- Add a **Cortex Search panel**: "Find me services impacted if PE-LDN-1 fails" → sample answer.

**A3. Provisioning** — split TMF 622 / 641 + fallout prevention
- Banner clarifies: this page covers **TMF 641 Service Order Activation**. Cross-link to a new `/oss/service-order` (TMF 622) page in Phase B.
- Add **fallout-prevention card**: `order_fallout_v2.1` model (already in `gold.order_fallout_features`) flagged 412 at-risk → 248 auto-remediated. Reuse the BSS narrative for consistency.
- Add a **jeopardy timeline** for in-flight enterprise orders (Lloyds, University of Manchester, etc) — `BandedLineChart` with green/amber bands.
- Add a **vendor-delivery Pareto** (where rework comes from).
- Add agent-narrative card with Cortex Complete-drafted progress note.

**A4. Field Force** — UK heatmap + parts + ESG
- Replace generic donut with **UK heatmap** of live work-orders today (reuse `UkRegionMap`).
- Add **parts-stockout risk** mini-table (battery cells, fan controllers, fibre splice kits).
- Add **vendor split** (own techs vs contractor partners) and **NPS by tech**.
- Add **ESG-tagged dispatch** chip (vehicle CO₂ + grid mix attributed) → small Sankey or stacked bar.
- Add gold-table chips (`gold.fieldforce_routing`, `silver.work_orders`, `gold.engineer_roster`).

**A5. Capacity** — Pareto + energy-aware capex + scenario hook
- Add **demand-driver Pareto** (5G handset attach · IoT growth · video streaming · fixed-wireless).
- Capex pipeline H-bar gets a **CO₂/£ chip** per row (energy-aware capex).
- Make the page **scenario-aware** — when the active scenario is `oss-capacity`, pre-select the Manchester risk row.
- Add a what-if drawer that uses the existing what-if bullets but renders them as agent-replayed timeline.
- Add gold-table chips (`gold.capacity_forecast`, `silver.capacity_window`).

**A6. Energy** — site-level + abatement waterfall + ESG board pack
- Add **top-20 energy-draining sites** sortable mini-table (uses the new `oss.views.energy_top_drainers` from the database catalog).
- Add an **abatement waterfall** (baseline → off-peak 5G suspend → micro-DTX → carrier shutdown → HVAC tuning → today).
- Add a **board-pack export** card ("Generated quarterly · ESG.pdf · auto-drafted by Cortex Complete · 14 KPIs · 7 charts").
- Add gold-table chips (`gold.energy_co2_index`, `gold.energy_attribution`, `platinum.esg_scorecard`).

### PHASE B · Add 4 new OSS pages *(should-have)*

Each page follows the established page anatomy: kicker · title · subtitle · KPI strip · body · regulator/standards chips · gold-table chips. All exported from `OssOverview.tsx` (or a new `OssExtended.tsx` if file gets too big — likely yes).

**B1. `/oss/service-order` — TMF 622 Service Order**
- The customer-commit side. KPIs: open orders, jeopardy, on-time-commit, fallout rate, auto-orchestrated %, average CPQ→commit days.
- Funnel from CPQ (BSS) → order capture → decomposition → activation handover.
- Cross-vendor decomposition diagram (eg. Lloyds 280-branch refresh decomposes into 280 `serviceOrderItem` calls to Ericsson + Cisco + AMP).
- Animated stage transitions.

**B2. `/oss/assurance` — TMF 645 Service Assurance / Trouble Tickets**
- KPI strip: open trouble tickets, MTTR by severity, agent-resolved %, SLA-credit triggers.
- Cross-link card to NOC alarms (the upstream) and BSS disputes (the downstream credit).
- Triage Pareto by symptom × vendor.
- "Cortex Agent · ticket auto-triage" narrative.

**B3. `/oss/change` — Change Management + CAB**
- KPIs: open CHG, change failure rate (CFR), MTTR for failed CHG, freeze-window posture, GC A3 PIR drafting SLA.
- Last 30 days CAB calendar heatmap (CHG approved / failed / standard / emergency).
- Failed-change retro panel with auto-PIR draft.
- Standards: ITIL · NIS2 · Ofcom GC A3.

**B4. `/oss/topology` (or `/oss/network-inventory`) — Physical Network Inventory + impact graph**
- The Cramer/Netcracker physical view: sites × racks × circuits × spectrum.
- A small interactive impact graph: pick a transport node → list of impacted services / customers.
- Cross-link to Service Inventory (TMF 638) — "service depends on these resources".

### PHASE C · OSS scenarios in `sectionScenarios.ts` *(nice-to-have)*

Add 6 scenarios so the OSS scenario dropdown matches the depth of Digital/BSS:

1. **TMF 645 trouble-ticket auto-triage** — vendor split, MTTR, SLA-credit avoided.
2. **TMF 622 enterprise fast-order** — Lloyds 280-branch decomposition, end-to-end activation in 6 days.
3. **CAB failure rollback** — bad change push, auto-rollback via Time Travel snapshot.
4. **Drive-test → optimisation** — drive-test telemetry triggers RF re-tilt; gold.son_recommendations updated.
5. **Vendor SLA breach** — Vendor-A field crew misses SLA window, automated escalation + replacement.
6. **Spectrum re-farm milestone** — 700 MHz re-farm decommission completion auto-detected; capacity forecast refreshed.

Each follows the existing event-script shape (detect → observe → plan → act-care/act-snow → verify → resolve).

### Wiring

- Add new routes to `src/main.tsx` (4 routes from Phase B).
- Add sidebar entries to `ossGroups` in `Sidebar.tsx`. Suggested grouping:
  - **Service Operations**: Overview · Service Order · Provisioning · Service Inventory · Network Inventory
  - **Run-the-Network**: Service Assurance · Field Force · Change Management
  - **Plan & Sustain**: Capacity Planner · Energy & Sustainability
- Run `tsc --noEmit` + `vite build` after each phase. Both must end clean.

### Out of scope
- Real Snowflake calls — synthetic data only.
- Any restructuring of the BSS / NOC pages (cross-link only).
- New chart primitives unless an existing one cannot be reused (Treemap, Pareto, BandedLineChart, Histogram, UkRegionMap from BssExtended/BssOverview are the toolkit).

### Risk + mitigation
- **File-size risk**: `OssOverview.tsx` already 547 LOC; Phase B will push it past 1.2k. Move helpers + chart cards into `OssExtended.tsx` once the file passes ~900 LOC.
- **Scenario-aware rendering** can collide with existing scenario state: only opt-in (e.g. `mode === 'oss'` checks before highlighting).
- **Visual consistency**: anchor every kicker, banner gradient and pill on the **blue** accent (`#11567F` / `bg-blue-100 / text-blue-700`) so OSS reads as one section.

### What I'll deliver if you approve
- **Phase A** (pages 1–6 polished + Overview rebuilt) — ~1 hour, high impact.
- **Phase B** (4 new pages) — additional ~1 hour, medium-high impact.
- **Phase C** (6 new scenarios) — additional ~30 min, nice consistency win.

You can cut to A only, or A + B, or all three.