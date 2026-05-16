# Plan — BSS pages insight pass (one-by-one)

## Goal
Bring every remaining BSS page up to the same executive-presentation standard as Catalog, Quote-to-Order and Order-to-Activate. For each page: 2–4 tailored insight panels + (where it fits) a Cortex Complete sprinkle.

## Pages already enriched (skip)
Catalog, Quote-to-Order, Order-to-Activate, Bill-Run, Collections, Subscriptions (partial), Pipeline, Disputes, Wholesale, Promotions, Revenue Assurance, RevRec, Customer 360.

## Per-page additions

### 1. Subscriptions
Already has churn waterfall + service-mix area + cross-sell ML. Add:
- **Tenure histogram** — distribution of subs by months on book (mean 38 mo, median 24 mo).
- **ARPU by acquisition cohort** — cohort retention layer recoloured for ARPU.

### 2. Numbers & Porting
- **Port-in vs port-out funnel** (PAC requested → validated → completed → Ofcom-1-day SLA).
- **MNP 1-day SLA banded line** (12 weeks) red < 95% / amber 95–98 / green ≥ 98.
- **MSISDN inventory utilisation** — donut (in-use / quarantine / spare / reserved).

### 3. Accounts (CRM)
- **Segment treemap** — Premium / Mid / Value / PAYG / B2B SMB / B2B Enterprise sized by ACV, coloured by margin.
- **UK heatmap** of account density (reuse `UkRegionMap`).
- **Tenure histogram** with median + churn-risk overlay.

### 4. Cases
- **MTTR histogram** (mean 18 hrs).
- **Top case-reason Pareto** (80/20).
- **Agent leaderboard** — `StackedDeltaBars` showing cases-resolved/agent with QoQ delta.

### 5. Interactions
- **Channel mix donut** (Voice / Chat / App / Email / SMS / Social).
- **24-hour interaction volume curve** (LineChart) showing peak hours.
- **Sentiment trend banded line** — % positive over 12 weeks (red <60 / amber 60–75 / green ≥75).

### 6. Mediation
- **Throughput stacked-area** — CDRs/sec by source (4G voice / 5G data / SMS / roaming TAP3).
- **Reject reason Pareto** — schema mismatch / dup / late / etc.
- **End-to-end lag histogram** (median 11s).

### 7. Billing
Already has bill-shock ML. Add:
- **Bill-size histogram** with anomaly tail flagged.
- **Dispute rate banded line** (12 weeks) target ≤ 0.4%.
- **First-bill explainer waterfall** (subs base → pro-rata → discounts → roaming → bundles → final).

### 8. Charging
Already has live OCS sessions. Add:
- **Peak-hour rating heatmap** (24 hrs × 7 days) showing weekend roaming spikes.
- **Roaming country mix** treemap by minutes.
- **Rating latency histogram** (median 42 ms, P99 180 ms).

### 9. Payments
- **DD success rate banded line** (12 weeks) target ≥ 98%.
- **Retry funnel** — Attempt → Bank decline → Retry success → Final fail.
- **SCA failure root-cause Pareto** (3DS expired / wrong OTP / abandonment).
- **Cortex Complete** — auto-drafted dunning email for SCA failure.

### 10. Tax
- **VAT remittance trend** (12 months) with HMRC due-date markers.
- **Regulatory return calendar** — gantt-style mini bars (VAT / IPT / Ofcom GC C5 / ICO ROPA).
- **Jurisdictional VAT treemap** (UK 96% / IoM / CI / NI special).

### 11. GL
- **Month-end close gantt** — 7 streams (subledger close / accruals / FX / intercompany / consolidations / disclosures / sign-off) with status.
- **Variance Pareto** — top 10 GL accounts by abs variance vs forecast.
- **Journal volume daily trend** with month-end spike highlighted.

### 12. Settlement & Interconnect
Already has Sankey + Cortex letter. Add:
- **TAP3 corridor leaderboard** — `StackedDeltaBars` top 10 corridors with QoQ delta.
- **Reconciliation MTTR banded line** target ≤ 5 days.
- **Dispute volume trend** + open/aged stack.

### 13. Loyalty
Already has redemption HBar. Add:
- **Engagement funnel** (Member → Active → Redeemed-this-mo → Multi-redeemer).
- **Tier mix donut** (Gold / Silver / Bronze / New) + tier-up rate.
- **Redemption ROI scatter** (cost vs ARPU lift) — reuse Histogram-style bars or simple HBar.

### 14. B2B / Enterprise
- **SLA banded line** — 99.5% target, last 12 weeks, red < 99 / amber 99–99.5 / green ≥ 99.5.
- **Hierarchy whale** — top-10 enterprise accounts by lines + £ACV with QoQ delta.
- **e-bonding throughput** stacked-area (orders / changes / disconnects per day).

## Implementation pattern
- Insert panels at the **bottom of each page** before `</PageShell>` (or `</div>` for wrapped pages).
- Reuse existing primitives — no new files.
- Synthetic but realistic numbers consistent with the rest of the demo (e.g. 12.4M subs, 184k activations/30d, £142M MRR).
- Each panel pairs a chart with a 1-line caption + a `gold.*` table reference.

## Sequencing
Execute pages in the order above; typecheck after each batch of 3-4 pages; final `vite build` + visual walk at the end.

## Files touched
- `src/pages/bss/BssExtended.tsx` — most pages live here.
- `src/pages/bss/BssOverview.tsx` — Charging, Loyalty, B2B.
- `src/pages/bss/BssBilling.tsx`.
- `src/pages/Lineage.tsx` — append any new gold-table references introduced.
