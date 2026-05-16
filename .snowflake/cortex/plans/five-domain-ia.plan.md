# Five-domain information architecture

## Goal
A presenter clicks one segment in the header and lands in a coherent, self-contained domain. No mixed bags.

## Mode taxonomy

| Mode | Audience | Headline question |
|---|---|---|
| **CIC** | Care VP / CMO | "Who is at risk and what should we do?" |
| **Digital** | Chief Digital Officer | "How are channels performing and orchestrating?" |
| **BSS** | CFO / Commercial | "Where is revenue won, lost, leaking?" |
| **OSS** | Service Operations | "What is being built, fixed, planned?" |
| **NOC** | CTO / Network Ops | "Detect → diagnose → decide → act → verify" |

(NOC is kept separate from the broader OSS because it is the headline live story.)

## Header
Replace the current 2-segment CIC/NOC chip with a 5-segment control:
`CIC · Digital · BSS · OSS · NOC`. Same persistence (`snowtelco.mode`). Mode change navigates to that domain's landing page; sidebar swaps groups. Existing keyboard `B` for big-screen and `Space` for play preserved.

```mermaid
flowchart LR
  Header[CIC | Digital | BSS | OSS | NOC]
  Sidebar[Per-domain nav]
  Page[Domain page]
  Header --> Sidebar --> Page
```

## Per-domain page map

### CIC — `/cic/*` (was `/command-center` etc.)
Existing pages stay, just relocated:
- `/cic` Command Center (was `/command-center`)
- `/cic/customers` At-Risk
- `/cic/customer/:id` 360
- `/cic/compare`
- `/cic/approvals`
- `/cic/insights` Executive Insights
- `/cic/uplift` Treatment Uplift
- `/cic/lineage` Decision Lineage
- `/cic/briefing` Briefing Export
Backwards-compat redirects from old paths.

### Digital — `/digital/*` (NEW)
- `/digital` Channels Overview (KPI strip: deflection rate, NPS, app DAU, voice AHT)
- `/digital/channels` Channel Orchestrator — SMS / Push / Email / RCS / WhatsApp with consent + frequency caps + Ofcom marketing rules
- `/digital/conversational` Conversational AI — chat transcript + intent + sentiment + NBA
- `/digital/voice` Voice Agent — simulated inbound call, transcript, sentiment, escalation
- `/digital/journeys` In-App Journeys — eSIM activation, Roaming Pass purchase, plan upgrade
- `/digital/marketplace` Partner / Bundles (Disney+, Spotify, etc.)

### BSS — `/bss/*` (NEW)
- `/bss` Commerce Overview (revenue, ARPU, churn $, leakage, fraud cases)
- `/bss/catalog` Product & Rate-Plan Catalog (TMF 620)
- `/bss/order-to-activate` O2A wizard — credit + fraud + eSIM + first-bill, agent-assisted
- `/bss/charging` Charging & Rating — real-time meter on a roaming session
- `/bss/billing` Billing & Invoice Preview
- `/bss/collections` Dunning + payment-plan workflow
- `/bss/revenue-assurance` Leakage + Fraud (IRSF / SIM-box / Wangiri)
- `/bss/loyalty` Loyalty / VeryMe-style rewards
- `/bss/b2b` Enterprise account hierarchy + SLA credits

### OSS — `/oss/*` (NEW; assurance-NOC stays under `/noc`)
- `/oss` Service-Ops Overview
- `/oss/inventory` Service Inventory (TMF 638) — customer → service → resource tree
- `/oss/provisioning` Activation / Fulfilment workflow (e.g. enterprise leased line)
- `/oss/field-force` Work orders, dispatch, parts, SLA
- `/oss/capacity` Capacity Planner — 12-month outlook + what-if agent
- `/oss/energy` Energy & Sustainability — kWh, CO₂, RAN sleep agent

### NOC — `/noc/*` (already exists)
Stays as-is: Command Center / Agents / Topology / Agent Runs / Event Firehose. Add `/noc/scenarios` chooser if useful.

## Cross-cutting "lenses" (a second header row, not a mode)
Three small chips (off by default), apply on top of any mode:
- **Persona** — CMO / CTO / CFO / Care VP / Regulator (filters KPIs visible)
- **Compliance** — Ofcom / GDPR overlays
- **Scenario** — pick a storyline, drives auto-drive across all domains

## Demo-script chooser
A `/demo` "war-room" page that scripts a multi-domain story, e.g.:
1. (NOC) HSS storm detected
2. (Digital) Voice queue spikes
3. (CIC) Care orchestrator drafts comms
4. (BSS) Service-credit posted; Ofcom auto-comp evaluated
5. (OSS) PIR drafted, capacity-plan trigger issued
The same `tElapsedMs` + sequencer drives every domain.

## File-level changes (sketch)

### Modify
- `src/state/DemoStateProvider.tsx` — `Mode = 'cic'|'digital'|'bss'|'oss'|'noc'`; persistence; setMode redirect target table.
- `src/components/app/AppHeader.tsx` — 5-segment toggle.
- `src/components/app/Sidebar.tsx` — five `groups[]` constants, swap on mode.
- `src/main.tsx` — five route prefixes; legacy redirects (`/command-center` → `/cic`, etc.).

### New
- `src/pages/cic/*` — moves of existing pages (or thin wrappers), keep components.
- `src/pages/digital/{Overview,Channels,Conversational,Voice,Journeys,Marketplace}.tsx`
- `src/pages/bss/{Overview,Catalog,O2A,Charging,Billing,Collections,RevenueAssurance,Loyalty,B2B}.tsx`
- `src/pages/oss/{Overview,Inventory,Provisioning,FieldForce,Capacity,Energy}.tsx`
- `src/data/digital/*`, `src/data/bss/*`, `src/data/oss/*` (synthetic, deterministic)
- `src/components/shared/DomainKpiStrip.tsx` — reused per-domain
- `src/components/shared/PersonaLens.tsx`

## Sequencing (so the demo stays usable mid-build)

### Step 1 — Restructure (no new content)
1. Add 5-mode toggle + sidebar swap.
2. Move existing CIC pages under `/cic/*` with redirects from old paths.
3. Add Digital / BSS / OSS landing pages with placeholder KPI strips and "coming soon" content blocks listing planned sub-pages.

### Step 2 — Phase 1 priority pages (high-impact, low cost)
4. BSS · Order-to-Activate (acquisition story is the biggest current gap).
5. Digital · Channel Orchestrator (closes the comms-loop story).
6. NOC · SIM-swap fraud sub-scenario (security flavour).
7. BSS · Billing & Invoice preview.

### Step 3 — Phase 2 fill-out
8. OSS · Inventory + Capacity + Field Force.
9. Digital · Conversational AI / Voice Agent.
10. BSS · Revenue Assurance + Collections.

### Step 4 — Differentiators
11. OSS · Energy & Sustainability.
12. BSS · B2B tenant view.
13. `/demo` multi-domain war-room script.

## Out of scope (this plan)
- Real Snowflake calls / live data — synthetic only.
- LLM SDK integration; agent reasoning remains scripted.
- Mobile-first layout.

## Open questions
- **Q1 — Order**: ship Step 1 (full restructure + landings only) first this iteration, then iterate? Recommended.
- **Q2 — Names**: `Digital`, `BSS`, `OSS`, `NOC`, `CIC` — keep these acronyms or use plain words (e.g. `Customer`, `Channels`, `Commerce`, `Operations`, `Network`)? Acronyms read well to telco audiences but plain words read better to mixed audiences.
- **Q3 — Persona / Compliance lenses**: build now or defer until domain pages exist?
- **Q4 — Old paths**: keep redirects from `/command-center`, `/customers`, etc. to new `/cic/*` paths, or hard-cut?
