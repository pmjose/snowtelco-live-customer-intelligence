# SnowTelco · Live Customer Intelligence

> **An agentic, end-to-end telco operations demo built on Snowflake.**
> One stage. Five operating domains. Ninety scenarios. Regulator-grade evidence trail throughout.

🌐 **Live demo:** [pmjose.github.io/SnowTelco-Live-Customer-Intelligence](https://pmjose.github.io/SnowTelco-Live-Customer-Intelligence/)

---

## Why this exists

Telco leaders are being asked to show — not pitch — what an *agentic* operating model looks like across customer, digital, commerce, network and incident response. SnowTelco is that demo. It runs in a browser, in five minutes, with no live data dependency, and it stays inside the regulatory rails a UK telco actually has to live with: Ofcom GC A3 / C1 / C5 / C7, FCA Consumer Duty, GDPR, NIS2, ICNIRP, IPA / Lawful Intercept, Online Safety Act, Welsh Language Standards, TMF 620 / 622 / 638 / 641 / 645 / 678 / 681 / 921, 3GPP TS 28.531, ETSI NFV-MANO, GSMA TS.32 / IR.21 / TAP3.

Behind every scenario is a believable Snowflake architecture: **Cortex Search · Cortex Analyst · Cortex Complete · AISQL · Snowpark ML · ML Registry · Snowpark Container Services · Snowpipe Streaming · Dynamic Tables · Time Travel · Horizon Catalog · Tri-Secret Secure**.

---

## What an executive sees in 5 minutes

| Domain | Hero scenario | Outcome |
|---|---|---|
| **CIC · Customer Intelligence** | Manchester churn save | 89 P1 customers saved in 7 minutes · ~£420k CLV protected |
| **Digital** | Outage comms drafter | Cortex Complete drafts status page + SMS + in-app + B2B email + Welsh-language variant in 38 sec for 184k customers |
| **BSS · Commerce & Revenue** | FCA Consumer Duty sweep | 4,820 customers actioned · regulator-grade evidence pack ready |
| **OSS · Service Operations** | Barclays trading-floor 5G slice | TMF 641 + 3GPP TS 28.531 slice live · £4.2M ARR booked |
| **NOC · Network Operations** | London IMS HSS storm | 1.42M subs · MTTR-mit 7 min · GC A3 + NIS2 clocks satisfied |

Every scenario plays through a **Detect → Observe → Hypothesise → Plan → Act → Verify → Resolve** loop with an executive narrator, a live timeline, ROI counters and standards chips.

---

## What's in the box

- **90 scenarios** across CIC (10), Digital (31), BSS (33), OSS (16) and NOC (8 incidents). Curated playlists for **CXO 5-min**, **CTO 10-min**, **CDO/CRO 10-min** and a **20-min full bake-off**.
- **Compliance Cockpit** (`/compliance`) — eight tiles for the UK regulatory surface, each tied back to scenarios that exercise the control.
- **Curated Tours** (`/tours`) — one-click executive demos with aggregated ROI totals (e.g. *307h saved · £9.8m protected · 2.1m customers* across the bake-off).
- **Per-scenario ROI strip** — hours saved · £ value · customers protected — visible everywhere a scenario shows up.
- **Per-scenario standards & Snowflake chips** — TMF / 3GPP / Ofcom / FCA / GDPR / NIS2 etc. plus the Snowflake primitive in play.
- **Spotlight focus engine** — when a scenario fires an event, the right page is opened, the right widget is dimmed-and-glowed, the narrator advances a stage, and the timeline ticks.
- **No live-data dependency** — the demo runs entirely on synthetic, regulator-friendly data, but every screen is wired the way it would be against real Snowflake objects.

---

## Speaker mode

| Audience | Tour | What you'll show | Time |
|---|---|---|---|
| CXO / CFO / CMO | `/tours` → 5-minute CXO tour | Customer save · regulator-grade comms · revenue protection · network restored | 5 min |
| CTO / Head of Network | `/tours` → 10-minute CTO tour | Slice activation · digital twin · CAB rollback · roaming partner outage · HSS storm | 10 min |
| CDO / CRO / Head of Risk | `/tours` → 10-minute CDO/CRO tour | Consumer Duty · acquisition fraud · revenue assurance · DSAR surge · cohort-led growth | 10 min |
| Full bake-off | `/tours` → 20-minute tour | All 5 domains, 14 scenarios | 20 min |

Press <kbd>⌘K</kbd> on any section to run any of the 90 scenarios on demand.

---

## Snowflake story

Every scenario is grounded in a Snowflake primitive:

| Capability | Where it shows up |
|---|---|
| **Cortex Search** | Runbook retrieval, prior-incident matching, Voice-of-Customer drift detection |
| **Cortex Analyst** | Natural-language access to billing, network and customer marts |
| **Cortex Complete** | Outage comms drafting (multi-channel · multi-language), evidence-pack summarisation |
| **AISQL** (`AI_CLASSIFY` / `AI_SUMMARIZE` / `AI_AGG`) | Dispute triage, sentiment, theme drift, foreseeable-harm cohort scoring |
| **Snowpark ML + ML Registry** | Churn, propensity, jeopardy, slice-SLA, fraud, FTF prediction — 24+ named models |
| **Snowpark Container Services** | GPU inference for image / video / voice models, Streamlit gateways |
| **Snowpipe Streaming** | Sub-second RAN counters, BSS mediation, NOC alarms |
| **Dynamic Tables** | Always-fresh marts: `gold.dispute_kanban`, `gold.consumer_duty_register`, `gold.slice_inventory` |
| **Time Travel** | 90-day audit reproducibility for IPA / LI and CAB rollbacks |
| **Horizon Catalog** | Discovery, lineage, classification — visible from `/lineage` |
| **Tri-Secret Secure** | Customer-managed keys for regulated workloads |

---

## Architecture & lineage

- `/architecture` — Snowflake blueprint: marts, models, agents, integrations.
- `/database` — Live database catalog (mart-level, not row-level).
- `/lineage` — Decision lineage: every scenario beat traces back to source.

---

## Running it

```bash
# clone & install
git clone https://github.com/pmjose/SnowTelco-Live-Customer-Intelligence.git
cd SnowTelco-Live-Customer-Intelligence
npm install

# dev
npm run dev    # http://localhost:5173

# production build
npm run build
npm run preview
```

**Stack:** React 18 · Vite 5 · TypeScript · Tailwind · framer-motion · MapLibre · ECharts · React Router v6.

---

## Deployment

The demo auto-deploys to GitHub Pages on every push to `main` via `.github/workflows/pages.yml`. The Vite `base` is the repo name; `public/404.html` + a small inverse shim in `index.html` make deep links survive a refresh.

---

## Disclaimer

SnowTelco is a fictional UK MNO created to illustrate the *art of the possible* with Snowflake's data + AI platform. All numbers, customers, sites, incidents and regulatory artefacts are synthetic. £-value sizing in any real bake-off is customer-specific.
