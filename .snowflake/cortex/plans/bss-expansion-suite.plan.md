# BSS expansion + CRM — full build plan

## Sidebar — final BSS layout (6 groups, 25 pages)

```
Commerce
  Overview · Catalog · Quote-to-Order (NEW) · Order-to-Activate
  Subscriptions & Services (NEW) · Number Inventory & Porting (NEW)

CRM (NEW group)
  Customer Accounts (NEW)
  Cases & SLAs (NEW)
  Interactions Timeline (NEW)
  Sales & Renewals Pipeline (NEW)

Revenue
  Charging & Rating · Mediation Pipeline (NEW)
  Billing & Invoice · Bill-Run Monitor (NEW)
  Payments & Direct Debit (NEW)
  Collections · Disputes & Adjustments (NEW)
  Revenue Assurance

Finance & Compliance (NEW group)
  Revenue Recognition (NEW) · Tax & Regulatory (NEW) · GL / ERP Reconciliation (NEW)

Wholesale & Promotions (NEW group)
  Wholesale / MVNO Billing (NEW) · Settlement & Interconnect (NEW) · Promotions Engine (NEW)

Loyalty & B2B
  Loyalty · Enterprise (B2B)
```

Net: 9 → **25 BSS pages**, 16 new, across 6 groups.

## Animation primitives (13 in BssCharts.tsx)

`BillRunRing`, `MediationFlow`, `MsisdnGrid`, `PortQueueLadder`, `GlPostingWaterfall`, `Ifrs15Waterfall`, `DdAttemptLadder`, `DisputeKanban`, `PromoStackingTree`, `SettlementSankey`, **`AccountHierarchyTree`**, **`CaseQueueKanban`**, **`InteractionRiver`** — all framer-motion + CSS/SVG, no new deps.

## Per-page spec — CRM (4 new pages)

**Customer Accounts** `/bss/accounts` — KPIs: 12.4M accounts, 18.4k B2B, ARPU £24.80. Panels: account-type donut, `AccountHierarchyTree`, top accounts table, credit-hold feed. ML `account_segmenter_v3`. Scenario `bss-account-onboard`.

**Cases & SLAs** `/bss/cases` — KPIs: 1,840 open, 42 SLA-risk, MTTR 4:12. Panels: `CaseQueueKanban`, reasons donut, SLA breach feed, agent leaderboard. ML `case_triage_v2.4`. Scenario `bss-case-sla-breach`.

**Interactions Timeline** `/bss/interactions` — KPIs: 1.8M/day, 7 channels, 94% identity match. Panels: `InteractionRiver`, channel donut, journey heatmap, top customer story. ML `interaction_stitch_v2.0`. Scenario `bss-interaction-stitch`.

**Sales & Renewals Pipeline** `/bss/pipeline` — KPIs: £14.4M open, renewals 184/92/41/14 (90/60/30/15d), 41% win rate. Panels: pipeline funnel, renewal cards, MRR/ARR ladder, churn-risk per contract. ML `renewal_propensity_v2`. Scenario `bss-renewal-window`.

## Per-page spec — BSS domain (12 new pages)

| Page | Route | KPI hooks | Lead primitive | Scenario |
|---|---|---|---|---|
| Subscriptions & Services | `/bss/subscriptions` | 12.4M subs · 38.6M services · 41% eSIM | service-card | `bss-sub-plan-change` |
| Mediation Pipeline | `/bss/mediation` | 28.4k events/s · P95 184ms · 412 suspense | `MediationFlow` | `bss-mediation-suspense-spike` |
| Bill-Run Monitor | `/bss/bill-run` | CYCLE-04 · 68% · 9.4M/13.8M rows | `BillRunRing` | `bss-bill-run-cycle04` |
| Number Inventory & Porting | `/bss/numbers` | 1.4M free · 14.8M used · 99.6% MNP | `MsisdnGrid` + `PortQueueLadder` | `bss-port-in-burst` |
| Quote-to-Order | `/bss/quote-to-order` | 412 quotes · 38% conv · £8.4k avg | pipeline funnel | `bss-quote-b2b-fast-track` |
| Disputes & Adjustments | `/bss/disputes` | 1,840 open · £42.4k/d adjustments | `DisputeKanban` | `bss-dispute-bill-shock` |
| Revenue Recognition (IFRS 15) | `/bss/revrec` | £184M deferred · 14.2M obligations · ARR £1.7B | `Ifrs15Waterfall` | `bss-revrec-quarter-close` |
| Tax & Regulatory | `/bss/tax` | £18.4M VAT · USO £1.2M · 0 Ofcom audits | reg-calendar | `bss-vat-mtd-submit` |
| GL / ERP Reconciliation | `/bss/gl` | 184k journals · 99.86% match · 14 exceptions | `GlPostingWaterfall` | `bss-gl-period-close` |
| Wholesale / MVNO Billing | `/bss/wholesale` | 14 partners · 1.84M wholesale subs · £42.4M/mo | partner table | `bss-wholesale-month-close` |
| Settlement & Interconnect | `/bss/settlement` | 184 TAP3 · 14.2 TB IPX · UK→ES top corridor | `SettlementSankey` | `bss-settlement-spain` |
| Promotions Engine | `/bss/promotions` | 24 promos · 1.4M eligibility/d · 12 fraud blocked | `PromoStackingTree` | `bss-promo-stacking-conflict` |

## In-page quick wins (8 across existing BSS pages)

Overview heartbeat, Catalog version timeline, O2A stage waterfall, Charging event-stream sparkline, Billing pre-bill QA, Collections DSO trend, RevAssurance leakage estimator, Loyalty redemption velocity, Enterprise renewal pipeline link-out.

## Files touched

**New:** `src/pages/bss/BssExtended.tsx`, `src/pages/bss/BssCharts.tsx`.
**Edited:** `src/main.tsx`, `src/components/app/Sidebar.tsx`, `src/data/sectionScenarios.ts`, `src/data/cicChat.ts`, `src/data/mlMeta.ts`, `src/pages/Briefing.tsx`, `src/pages/Lineage.tsx`.

## Implementation steps

1. Sidebar restructure into 6 groups + 16 new nav entries
2. 16 routes in main.tsx
3. `mlByBssPage` (16 entries) + helper
4. ~38 new gold-table rows in Lineage
5. `BssCharts.tsx` — 13 animation primitives
6. `BssExtended.tsx` — 16 page exports (4 CRM + 12 BSS)
7. 16 scenarios in sectionScenarios.ts
8. 16 outcome rows in Briefing.tsx
9. 16 prompt+answer sets in cicChat.ts
10. 8 quick-win panels on existing BSS pages
11. Typecheck + browser sanity walk

## Verification

- `node node_modules/typescript/lib/tsc.js --noEmit` clean
- 16 pages render, ML badges + gold chips visible, no oval-dot / stretched-text regressions
- 6 representative scenarios run end-to-end, AskCIC grounds correctly (not Manchester), prompts cite right gold tables
- Sidebar shows 6 groups, all 9 existing BSS entries preserved

## Critical files

- [src/pages/bss/BssExtended.tsx](src/pages/bss/BssExtended.tsx) — 16 new page components
- [src/pages/bss/BssCharts.tsx](src/pages/bss/BssCharts.tsx) — 13 chart/animation primitives
- [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) — 16 new scenarios + registry
- [src/data/cicChat.ts](src/data/cicChat.ts) — 16 prompt+answer sets
- [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) — 6-group restructure

## Phasing

A — scaffolding (sidebar + routes + 16 stubs + scenarios + chatbot + ML + gold). B — 13 primitives + fill 16 pages with content. C — 8 quick-win panels + final typecheck + browser walk.

## Risk

Biggest single drop yet. All animations use existing deps (framer-motion + CSS/SVG). Synthetic data only. No Snowflake plumbing.