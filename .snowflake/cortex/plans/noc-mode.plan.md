---
name: "noc-mode"
created: "2026-05-14T13:29:18.329Z"
status: pending
---

# Plan: Agentic NOC Mode

## Goal

Reuse the existing demo skeleton (DemoStateProvider, scenarios, networkEvents, NetworkMap, EventStream) to tell a credible **Agentic NOC** story alongside the existing Customer Intelligence story, controlled by a single mode toggle.

## Design choices

### Mode toggle (lens, not a fork)

Add `mode: 'cic' | 'noc'` to `DemoStateProvider` (persisted via `snowtelco.mode`). Header gets a segmented control: **CIC ⇄ NOC**. The same routes render different layouts/components depending on `mode`. This keeps a single codebase, lets exec viewers flip the lens live, and reuses the scenario state machine.

Alternative considered: separate `/noc/*` route tree. Rejected — duplicates layout, header, scenario plumbing.

### NOC information architecture

Three new pages + one panel, plus mode-aware tweaks to two existing pages.

**New pages**

1. `/noc` (NOC Command Center)

   - Top KPI strip: MTTD, MTTR, SLA burn (%), open P1/P2/P3, alarms/min, auto-actions today, agent confidence.
   - Left: **Incident triage queue** (sortable by severity / SLA breach risk / customer impact). Sourced from `primaryIncident + secondaryEvents`, padded with 4–6 synthetic open incidents.
   - Center: **Active incident detail** (selected from queue) — shows topology breadcrumbs `Region → Cluster → Site → Cell`, KPI deltas, alarm storm sparkline, blast-radius (impacted customers + £CLV at risk).
   - Right: **Agent reasoning panel** (see below).
   - Bottom: **Closed-loop action tray** (3 actions: Capacity rebalance, Open ServiceNow ticket, Schedule rolling restart) with approve/deny + auto-approve toggle.

2. `/noc/topology` (Topology graph)

   - Force-directed / nested SVG: Core → Region → Cluster → Site → Cell, with status coloring. Click a node to filter incidents/customers. Mock topology in new `src/data/topology.ts`.

3. `/noc/agent-runs` (Agent run history)

   - Table of past incidents with: detection time, agent steps taken, MTTR, human approvals, outcome. Drill-in shows the same reasoning timeline format used live.

**Mode-aware existing pages**

- `/command-center` — when `mode==='noc'`, redirect to `/noc`. Keep CIC view in CIC mode.
- `/network` — already topology-ish; add NOC overlays (alarm rings, planned-work polygons) when in NOC mode.
- `/events` — same stream, but in NOC mode prepend network/alarm events and tag with agent actions ("Agent suggested: rebalance cluster MAN-01").
- `AppHeader` — show NOC mode chip + an SLA breach countdown when an incident is active.

### Agent reasoning panel

Reusable `AgentReasoning` component (`src/components/agent/AgentReasoning.tsx`). Driven by data, not LLM calls. Stages: **Observe → Hypothesize → Plan → Act → Verify**. Each stage has:

- timestamp, summary, confidence, evidence chips (KPI deltas, alarms, similar-past-incidents), tool calls (`query.snowflake.cell_kpis`, `lookup.servicenow.changes`, `simulate.capacity_rebalance`, `notify.care_orchestrator`).
- Human-in-the-loop control: any "Act" stage can require approval before proceeding (toggle global "auto-approve").

Reusable so it can also embed under selected customer in CIC mode later.

### Data additions (synthetic, deterministic)

- `src/data/nocKpis.ts` — MTTD/MTTR/SLA history, alarms/min sparklines.
- `src/data/topology.ts` — Region/Cluster/Site/Cell tree (UK), site IDs that map to existing incident postcodes.
- `src/data/agentRuns.ts` — 6–8 past agent runs + the live one keyed by `scenarioId`.
- `src/data/nocActions.ts` — closed-loop action catalog with side-effect descriptions ("Reduces dropped calls by est. 22%", "Opens INC0012345 in ServiceNow").
- Extend `networkEvents.ts` with: `slaTarget`, `slaBreachAt`, `agentRunId`, `linkedSiteId`.

### Theme

NOC mode applies a darker, ops-flavored palette via the existing `dark-ops` class plus a new `noc` body class for accent tweaks (amber/red status hues, monospace KPI numbers). No tailwind token changes required.

### Scenario integration

Add a fifth scenario `noc-cluster-degradation-london` to `scenarios.ts` so NOC story has its own arc. Map existing Manchester scenario into NOC view too — same incident shows from a customer-pain angle (CIC) or network/agent angle (NOC).

### Routing additions

- `/noc`, `/noc/topology`, `/noc/agent-runs` registered in `main.tsx`.
- Auto-redirect: in CIC mode, `/noc/*` redirects back to `/command-center`; in NOC mode, `/command-center` redirects to `/noc`.

### Briefing

`Briefing.tsx` becomes mode-aware: NOC briefing replaces churn/CLV with MTTR, SLA, auto-actions, agent confidence; same printable layout.

## Files to create

- `src/pages/NocCommandCenter.tsx`
- `src/pages/NocTopology.tsx`
- `src/pages/NocAgentRuns.tsx`
- `src/components/noc/IncidentQueue.tsx`
- `src/components/noc/IncidentDetail.tsx`
- `src/components/noc/ActionTray.tsx`
- `src/components/agent/AgentReasoning.tsx`
- `src/components/noc/SlaCountdown.tsx`
- `src/data/topology.ts`, `nocKpis.ts`, `agentRuns.ts`, `nocActions.ts`

## Files to modify

- `src/state/DemoStateProvider.tsx` — add `mode`, `setMode`, `autoApprove`, persistence, `runAction(id)` stub.
- `src/main.tsx` — register NOC routes + redirects.
- `src/components/app/AppHeader.tsx` — CIC/NOC segmented toggle, SLA chip.
- `src/data/networkEvents.ts` — add SLA + agent-run linkage; add 4–6 secondary incidents.
- `src/data/scenarios.ts` — new NOC scenario, NOC narrations on existing scenarios.
- `src/pages/EventStream.tsx`, `NetworkMap.tsx` — mode-aware overlays.
- `src/pages/Briefing.tsx` — NOC variant.
- `src/index.css` — minor `.noc` accents.

## Out of scope (explicit)

- Real Snowflake calls — all data remains synthetic/deterministic.
- LLM/agent SDK integration — agent reasoning is scripted per scenario for now.
- Auth/RBAC for NOC actions.

## Open questions

- **Q1**: Mode UX — segmented toggle in header (default), or separate landing tile, or a `?mode=noc` URL param? Default proposal: header toggle.
- **Q2**: Should NOC mode change the **routes** (`/noc`) or just the **content of `/command-center`**? Default proposal: dedicated `/noc/*` routes with auto-redirect from `/command-center`.
- **Q3**: Closed-loop actions — purely visual/animated, or also dispatch toasts and update KPIs in real time so a presenter can show MTTR ticking down? Default proposal: real time, hooked into `startSelfHealing` analog → `runAction`.
- **Q4**: Keep the same dark-ops palette or introduce a true NOC dark-amber theme? Default proposal: reuse `dark-ops`, add `.noc` accent class.
- **Q5**: Should the agent reasoning panel be available in CIC too (for offer recommendations)? Default proposal: yes — build it generic from day one.
