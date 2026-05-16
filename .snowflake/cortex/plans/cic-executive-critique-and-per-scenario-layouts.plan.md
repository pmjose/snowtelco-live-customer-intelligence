# Executive critique — every step, every CIC scenario

I am wearing my MD-of-Customer-Intelligence hat. Brutally honest read of what shows on screen during each beat for each scenario, plus what to fix.

## Scenario 1 — Manchester churn save (network)

| Beat | Route shown | What works | What I don't like | Fix |
|---|---|---|---|---|
| t=0 detect | /command-center cic-incident card | Network anomaly framing is correct. PRB / cell sites / DL speed before/after numbers all relevant. Map pin on Manchester with M14 overlay is the right primary visual. | "Detect" KPI strip lights up but the network-quality trend below is generic mock data — it doesn't react. RiskDistribution / ChurnBySegment charts have nothing to do with Manchester M14. | Replace static "Risk distribution / Churn by segment / Risk by driver" cards on this scenario with: live-cell-status grid, dropped-call+failed-session sparklines, and PRB utilisation by hour for the M14 cluster. |
| t=2 observe | (stays) | "Snowpark ML scored cohort" toast is good copy. | The toast disappears in 3s; nothing on screen records that the model ran. | Add a small "Decisioning trace" rail under IncidentCard listing each tool-call (snowflake.cell_kpis, ml.score_cohort, cortex.search.kb) with status chips. |
| t=3.5 cohort | cic-cohort | AtRisk list pulses, Amelia at top, "Network degradation" driver. | Other 5 customers shown with the same driver string is a lie — Sophie/Owen aren't on M14. | The AtRisk list should be filtered to the scenario cohort (cohort customers only) and labelled "Manchester M14 P1 cohort (89)". |
| t=5 hypothesize | /customer/CUST-001 | Customer 360 swap to Amelia is the right move. | The Risk-trajectory side chart is generic; doesn't show the M14-driven jump. | Show a "what changed" annotation on the trajectory at the M14 detection moment: 42% → 82% with a vertical line dated 2026-05-08 09:31. |
| t=7 plan | (stays) | "Plan: rank 89 P1 by CLV × risk-reduction" is good. | NextBestActionPanel renders generic offer cards. | Show the ranked NBA list with offer × cost × expected ROI per row, top 3 cards. |
| t=11 act-care | /approvals | Approvals page is appropriate here. | The 4-stage approval bar is decorative — it doesn't move when the scenario fires. | Auto-advance the approval stepper one stage on `act-care` so the page actually shows execution. |
| t=16 accepted log | /customer/CUST-001 | Re-visiting Amelia mid-acceptance is good. | Nothing on her page reflects "accepted" — her risk number doesn't tick down live. | After `outreach_triggered`, her live-risk should ease toward `projectedRiskAfterAction` over 2-3s. |
| t=19 verify | /uplift | Uplift quadrant with Amelia ★ is correct. | The cohort simulator at the bottom uses the cohort numbers but doesn't visualise the actual save. | Add a small "saved vs at-risk" donut and a £-protected counter that animates up to £420k. |
| t=23 briefing log | /briefing | Briefing has the right Manchester template. | Top-5 P1 table is misleading: only Amelia is in the M14 cohort; Sophie/Daniel/Grace aren't. | Replace the Top-5 with the **actual cohort sample** (3 random customer rows from the cohort, not the global 6). |
| t=26 resolve | cic-grid | Whole dashboard in resolved mode. | Risk-distribution / churn-by-segment cards still show population values that don't reflect the resolution. | After resolve, swap RiskByDriver pie for a "Save outcomes" pie (Saved / Pending / Declined / Suppressed) with scenario numbers. |

## Scenario 2 — Birmingham bill-shock wave (billing)

This is the most jarring one. **Yes — the UK map should not dominate this scenario.**

| Beat | Route shown | What works | What I don't like | Fix |
|---|---|---|---|---|
| t=0 detect | cic-incident | "Bill-shock cluster · 1,840 customers · 25%+ above baseline" is correct framing. | **Big UK map with a red pin on Birmingham is the wrong primary visual.** This is a roaming/billing event, not a RAN failure. There is no cell-site to look at. | **Replace the map with a "Bill-shock cluster" card**: bar chart of bill amount delta (% above baseline) bucketed across the cohort, with the threshold line at 25%. |
| | | IncidentCard correctly switches to non-network tile variant (postcode/tech/brand). | "Cell sites: 0" tile reads sad. | Hide cell-sites tile entirely on non-network scenarios; show "Roaming usage delta" / "Avg overage £" / "TAP3 partner" instead. |
| t=2 observe | (stays) | "Root cause: post-Easter holiday roaming · Roaming Pass NOT auto-enrolled" — perfect copy. | Nothing on screen surfaces *why this is policy-relevant*. | Add a small "Policy compliance" chip: "Roaming Pass auto-enrol policy = OFF in B4. Enable to prevent recurrence." |
| t=4 cohort log | cic-cohort | AtRisk list with Daniel pinned, "Bill shock" driver. | Showing Sophie/Ravi with "Bill-shock exposure" is fictional. | Same as Manchester — show the actual bill-shock cohort sample, not the global 6. |
| t=6 hypothesize | /customer/CUST-002 | Daniel's profile is right. | His Network-experience tab is irrelevant here. | When scenario theme = billing, default Customer 360 to the Usage & Billing tab, hide Network tab. |
| t=8 plan | (stays) | Bill-explanation + £4 credit + auto-enrol — accurate. | Plan should look like a billing playbook, not a network playbook. | NBA panel template per theme: billing → "Credit £X · Bill explainer video · Auto-enrol Roaming Pass" with three checkbox commitments. |
| t=10 eligibility | (stays) | "Goodwill policy check" is correct. | Doesn't show the policy box. | Add a small "Goodwill policy" panel with FCA TCF compliance check + max-3-credits/12mo counter. |
| t=12 act-care | /approvals | Genesys outbound + Sinch SMS dispatch — accurate. | Approvals page reads "Manchester M14" by default; needs the bill-shock variant. | Already scenario-aware; verify it renders Birmingham campaign correctly. |
| t=14 dispatched | (stays) | TAP3 reconciliation framing is good. | No visual confirmation that 1,840 SMS went out. | Add a small "Outreach dispatch" pill on the page showing 1,840/1,840 sent, 244/244 calls queued. |
| t=17 accepted | /customer/CUST-002 | Daniel accepted bill explainer + Roaming Pass enrol. | His billing card doesn't update. | Show "Roaming Pass enrolled" green chip on Customer 360 after `outreach_triggered`. |
| t=20 verify | /uplift | Same uplift page. | The uplift quadrant is a churn-saving framing — bill-shock is more about NPS / disputes / refund cost. | When scenario theme = billing, replace Uplift page with a **"Cost vs Save" payoff matrix**: refund cost × dispute SLA × churn-prevented. |
| t=22 resolve | /briefing | Briefing template is bill-shock-aware. | Briefing card shows projected outcomes; doesn't show the actual £180k saved. | Pull the resolve-line £-figure into a hero stat at the top of the briefing. |

**Net executive opinion on Birmingham**: the map is wrong, the network charts are wrong, the network tab on Customer 360 is wrong. This scenario is 80% billing, 20% care.

## Scenario 3 — Leeds price competition (commercial)

| Beat | Route shown | What works | What I don't like | Fix |
|---|---|---|---|---|
| t=0 detect | cic-incident | "PAC-request volume +340% in LS2/LS5 · SnowFlex SIM-only base" — correct framing. | UK map again. PAC churn isn't geographic infrastructure — it's competitive. The map is a distraction. | **Replace map with a "Competitive landscape" widget**: SnowFlex tariff vs top 3 competitors (price × GB × bundle) with the at-risk delta highlighted. |
| t=2 observe | (stays) | "Cortex Search: competitor mid-month tariff change" — perfect. | The screen doesn't show the competitor announcement. | Add a small "Market signal" card with the matched press release / pricing-page diff snippet. |
| t=4 cohort | cic-cohort | "940 active PAC requests · 28 high-CLV · 38 P1" cohort log — accurate. | KpiStrip shows "P1 churn-risk 122" not 38 (per the report). Misleading. | Either align the script to scenarios.ts numbers OR override the strip per scenario from the script's cohort log. |
| t=6 hypothesize | /customer/CUST-005 | Grace, SnowFlex, price-sensitive. | Grace's risk band only nudges from 44% to 50% which is way below 69% mentioned in toast. | Drive Grace's churn risk from the scenario script's hypothesize beat (set effectiveChurn override to 69% during this scenario). |
| t=8 plan | (stays) | NBA = +30GB at same price + 6mo loyalty boost — accurate. | NBA panel renders generic offer cards. | Commercial-themed NBA: tariff comparison ladder (current SnowFlex / proposed boost / competitor) with the proposed offer highlighted. |
| t=10 margin | (stays) | ROI 2.4× pre-approved — good. | Nothing on screen shows the margin floor calculation. | Add a "Margin floor check" mini-tile: cost £X · 12-mo CLV uplift £Y · ratio. |
| t=12 act-care | /approvals | In-app modal + email for 28 high-CLV. | Approvals page text is fine but the cohort-size emphasis should be 28 not 940. | Make Approvals primary cohort = high-CLV cohort, secondary = full base. |
| t=14 accepted | /customer/CUST-005 | Grace declined PAC continuation, accepted +30GB boost. | Customer 360 doesn't visualise the offer acceptance. | Show "Accepted +30GB Boost" chip + a Save Counter ("Saves: 412 of 940 · 44%"). |
| t=16 cohort save | (stays) | 412/940 retained vs 28% baseline — strong. | The save-rate vs baseline isn't visualised. | Live-update the bar chart "Saves vs control" on screen. |
| t=19 verify | /uplift | Persuadables/Sure-thing quadrant is appropriate for commercial. | Cohort sizing in the simulator is OK. Good. | Keep. |
| t=21 resolve | /briefing | Briefing has Leeds SnowFlex template. | Same Top-5 issue — Sophie/Daniel/Ravi don't belong in this cohort. | Same fix — actual cohort sample. |

**Net executive opinion on Leeds**: the map adds nothing. This is a tariff fight. Replace the map with a competitive intelligence widget.

## Scenario 4 — London 5G SA upgrade (growth)

| Beat | Route shown | What works | What I don't like | Fix |
|---|---|---|---|---|
| t=0 detect | cic-incident | "5G SA coverage live in E14 cluster · 24 cells active" — exciting framing. | This is a *positive* event but the IncidentCard styling is red/critical. It looks like an incident. | When scenario theme = growth, swap IncidentCard chrome from red/alert to blue/launch with an "Opportunity" chip instead of "Severity". |
| t=2 observe | (stays) | "Snowpark ML upgrade-propensity model · 1.4M base scored" — correct. | Risk-by-driver / risk-distribution charts are about losing customers; this scenario is about *upselling* them. | Replace the bottom row charts on growth scenarios with: 5G handset penetration funnel, propensity histogram, ARPU lift simulation. |
| t=4 cohort | cic-cohort | Top cohort 12,400. | KpiStrip says "Impacted customers" — wrong wording for an upgrade campaign. | When scenario theme = growth, relabel KPI strip: "Eligible customers / High-CLV / High-propensity / Coverage cells / Offers ready / ARPU lift forecast". |
| t=6 hypothesize | /customer/CUST-004 | Ravi 0.78 propensity, 5G handset, heavy data. | Customer 360 shows "Live churn risk 39%" — that framing is wrong for an upgrade scenario. | Show "Upgrade propensity 78%" instead of churn risk on growth scenarios. |
| t=8 plan | (stays) | NBA = 5G SA Unlimited Max + £5 first-month credit. | Generic NBA cards again. | Growth-themed NBA: contract end window + propensity score + offer + first-month delta. |
| t=10 eligibility | (stays) | Contract end window OK + no offer fatigue. | No view of the contract end window. | Show a small "renewal calendar" with Ravi's contract-end date and the offer window highlighted. |
| t=12 act-care | /approvals | Approvals page covers it. | Same — campaign chrome is generic. | Growth-themed Approvals: replace red-incident header with blue-launch header, "Launch wave" button instead of "Approve commercial offer". |
| t=14 high-CLV outreach | (stays) | £5 credit pre-applied + Genesys retention call. | No visual. | Show a tiny "320 high-CLV: handled by senior agent" pill. |
| t=16 accepted | /customer/CUST-004 | Ravi upgraded in-app, ARPU +£12/mo. | Customer 360 still shows churn risk. Inconsistent. | After upgrade, show new ARPU chip on Ravi's page. |
| t=19 verify | /uplift | Day-1: 1,420 upgraded (11.4%). | Uplift quadrant doesn't fit a growth scenario; it's a churn frame. | Replace Uplift page on growth scenarios with **"Conversion funnel"** (eligible → exposed → engaged → upgraded → ARPU). |
| t=22 resolve | /briefing | Briefing template = London E14 5G cohort. | "Risk reduction" KPI tile is meaningless for an upgrade campaign. | Replace "Risk reduction" with "ARPU lift forecast (£/yr)" on growth scenarios. |

**Net executive opinion on London**: the entire CIC dashboard is themed for *defence* (churn, save, risk reduced). This scenario is *offence* — needs a theme swap.

---

# Proposal — "Scenario Kits" architecture

Single concept fix for the whole class of issues above:

```
type ScenarioTheme = 'network' | 'billing' | 'commercial' | 'growth';
```

Add `theme` to each CIC scenario in `scenarios.ts`:
- manchester        → 'network'
- birmingham-bill   → 'billing'
- leeds-snowflex    → 'commercial'
- london-5g         → 'growth'

Then drive five conditional things off the theme:

1. **Hero panel swap** in `CommandCenter.tsx` middle column:
   - network  → `<UkNetworkMap />` (current)
   - billing  → new `<BillShockHeatmap />` (delta-bucket bar chart of bill increase by area + threshold line)
   - commercial → new `<CompetitivePricingPanel />` (SnowTelco vs competitor tariff ladder, PAC volume sparkline)
   - growth   → new `<UpgradeReadinessPanel />` (handset / coverage / propensity grid)

2. **KPI strip labels**:
   - network/billing/commercial: Impacted / P1 / High-value / Network exp / Save actions / Risk reduction
   - growth: Eligible / High-CLV / High-propensity / Coverage cells / Offers ready / ARPU lift

3. **IncidentCard chrome**:
   - network/billing/commercial: red border, "severity" chip
   - growth: blue border, "opportunity" chip, "Launch wave" verb instead of "Resolve"

4. **Customer 360 default tab**:
   - network → Network
   - billing → Usage & Billing
   - commercial → Offers
   - growth → Offers (with ARPU chip)

5. **Bottom dashboard charts** (the static six):
   - network → keep current (RiskByDriver, NetworkQualityTrend, IncidentImpactByCity)
   - billing → swap NetworkQualityTrend for "Bill-shock distribution" + "Roaming policy compliance"
   - commercial → swap RiskByDriver for "Tariff competitiveness" + "PAC volume by week"
   - growth → swap to "Conversion funnel" + "ARPU lift simulator" + "Coverage rollout"

Plus 2 cohort-correctness fixes that apply across all scenarios:

6. **Top-5 cohort table** in Briefing — show 3-5 fabricated cohort customers per scenario instead of recycling the global 6.

7. **AtRisk list driver** — primary keeps real driver; non-primary rows currently inherit a coercive label ("Network experience" / "Bill-shock exposure" / "5G-capable") that overstates relevance. Either filter the list to the actual cohort, or relabel non-primary drivers as their own original drivers (`c.mainDriver`).

## Implementation steps (priority order)

1. Add `theme: ScenarioTheme` to each CIC scenario in [src/data/scenarios.ts](src/data/scenarios.ts).
2. Build `<BillShockHeatmap />`, `<CompetitivePricingPanel />`, `<UpgradeReadinessPanel />` widgets in `src/components/scenario-kits/`.
3. Conditional hero swap in [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) middle column based on `scenario.theme`.
4. Theme-aware KPI strip labels in `KpiStrip` (same file).
5. Theme-aware IncidentCard chrome + "Opportunity" framing in [src/components/incident/IncidentCard.tsx](src/components/incident/IncidentCard.tsx).
6. Theme-aware default tab in [src/components/customer360/Customer360.tsx](src/components/customer360/Customer360.tsx) (initial `useState<Tab>` value).
7. Theme-aware bottom-row charts in `CommandCenter.tsx` (replace 1-2 of the six static cards based on theme).
8. Cohort-correct Top-5 table in [src/pages/Briefing.tsx](src/pages/Briefing.tsx) — synthesise 3-5 cohort rows per scenario.
9. Sanity-fix the AtRisk list — drop the coercive "cohort theme" driver for non-primary rows; use customer.mainDriver.
10. Add a theme-aware Uplift page swap (growth → Conversion funnel, billing → Refund-cost matrix).

## Critical files

- [src/data/scenarios.ts](src/data/scenarios.ts) — add `theme` field, single source of truth
- [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) — hero swap + KPI labels + chart swap
- [src/components/incident/IncidentCard.tsx](src/components/incident/IncidentCard.tsx) — chrome + verb per theme
- [src/components/customer360/Customer360.tsx](src/components/customer360/Customer360.tsx) — default tab per theme
- [src/pages/Briefing.tsx](src/pages/Briefing.tsx) — cohort-correct table

## Verification

Walk all four scenarios after each implementation step:
- Manchester should look unchanged (network).
- Birmingham hero panel becomes the bill-shock heatmap; map disappears.
- Leeds hero panel becomes the competitive ladder.
- London chrome turns blue/launch; KPI strip says "Eligible / ARPU lift" instead of "Impacted / Risk reduction".
- Briefing tables show cohort-relevant customers, not the global 6.

## Out of scope

- Real per-customer cohort data (would need new mock data per scenario).
- Reworking the firedEvents engine (already correct).
- NOC / Digital / BSS / OSS theming (this plan is CIC only — telecom executive request).