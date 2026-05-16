# Executive QA — findings & ranked fixes

I walked all four CIC scenarios under a senior-MD lens. The chatbot, briefing, approvals and uplift pages are demo-ready. The breakages live on the Customer 360 surface and on the London (growth) story.

## Show-stoppers — fix before any customer demo

### 1. Duplicate NBA panel on Customer 360 (every scenario)
The "Next Best Action" card and "Approve & Send" button appear twice — once in the main column and once in the right sidebar. Spotted on Leeds and London; likely affects every scenario because the page mounts both `Customer360` (which contains an inline NBA tab) and a sibling `NextBestActionPanel`. Looks broken.

**Fix**: in [src/pages/Customer360Page.tsx](src/pages/Customer360Page.tsx), remove the standalone `<NextBestActionPanel customerId={customerId} />` from the right column. Keep the in-tab NBA inside `Customer360`. Replace the right-side slot with the existing `ChurnTrendChart` only (or a small "Decision lineage" mini-card for governance flavour).

### 2. London growth funnel numbers don't add up
On `/uplift` for London the funnel reads `Eligible 6,800 (100%) → Exposed 12,400 (92%)` — you cannot expose more people than are eligible. Hard credibility hit. Same scenario also has three different cohort sizes in different places (12,400 / 6,800 / 320).

**Fix**: in [src/pages/Uplift.tsx](src/pages/Uplift.tsx) `GrowthFunnelView`, set `Eligible = 12,400` (the propensity > 0.6 cohort) and recalc cascading percentages. Align Briefing, IncidentCard, and the chatbot prompt answer for London on the same denominator: 12,400 eligible (100%) → 11,408 exposed (92%) → 4,712 engaged (38%) → 3,290 offered (26%) → 1,420 upgraded (11.4%). Drop the 6,800 number entirely; it's an unrelated catchment count.

### 3. Customer 360 still reads as "churn risk" on the growth scenario
For London/Ravi the page shows **"LIVE CHURN RISK 63%"** in amber-red. This is an upgrade campaign, not a save campaign. The whole framing on this page should flip when scenario.theme === 'growth'.

**Fix**: in [src/components/customer360/Customer360.tsx](src/components/customer360/Customer360.tsx), when `scenario.theme === 'growth'`:
- Replace the big "Live churn risk N%" header with **"Upgrade propensity 0.78"** (use a 0.0–1.0 score, blue accent, BadgeCheck icon).
- Hide the "High risk" / "Network impacted" red chips.
- Show "5G handset", "Heavy data user", "Contract end ≤ 90d" chips instead.
- Default tab → Offers (already done) but rename "Live churn risk" stats label to "Upgrade signals".

### 4. Growth chrome isn't blue at the page level
IncidentCard chrome is blue, the UpgradeReadinessPanel is blue, but the rest of the dashboard (KPI strip values, briefing accent, customer header) is still red. The visual differentiation between defence and offence is half-implemented.

**Fix**: in [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) and [src/pages/Briefing.tsx](src/pages/Briefing.tsx), when `scenario.theme === 'growth'`:
- The page kicker ("Customer Intelligence" red) → "Growth Intelligence" blue.
- KPI strip accents already partially blue — extend to cohort number colours.
- Briefing header strip → blue accent + "GROWTH OPPORTUNITY · EXECUTIVE BRIEFING".
- Replace the red `text-vfRed` border-l on the briefing card with blue when growth.

## Medium fixes — polish that affects credibility

### 5. Customer drivers don't adapt to the active scenario
Ravi's row in AtRisk shows "Care dissatisfaction" at idle, then "5G upgrade propensity" when the London scenario is active. Inconsistent. Sophie/Hannah always show their generic driver regardless of scenario.

**Fix**: in [src/components/customers/AtRiskCustomerList.tsx](src/components/customers/AtRiskCustomerList.tsx), use `driverFor(...)` for *all* rows (not just primary), so non-primaries inherit a scenario-themed cohort label rather than their stale `mainDriver`. Already partially in place — drop the conditional that limits it to the primary.

### 6. Telco jargon that confuses a CIC audience
- "2,417 customers presenting" — clinical. Use "impacted".
- "TAP3 partner files reconciled — no mediation issue" — interconnect jargon.
- "Roaming Pass auto-enrol policy is OFF for the B4 catchment (legacy postcode rule)" — undefined term.
- "Competitor SIM-only push triggers PAC-request spike" — "push" is ambiguous.

**Fix**: in [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) and [src/data/cicChat.ts](src/data/cicChat.ts), do a copy pass: "presenting" → "impacted", "TAP3 partner files" → "interconnect billing files", "legacy postcode rule" → "known configuration gap", "competitor SIM-only push" → "competitor tariff launch".

### 7. Cohort denominator drift between Briefing / Approvals / Uplift / Chatbot
For London the cohort variously appears as 6,800 / 12,400 / 320. For Birmingham it's 1,840 / 244 / 71. For Leeds it's 940 / 38 / 28. Each is technically a different slice but readers conflate them.

**Fix**: introduce a `cohortBreakdown: { total; highCLV; primary }` field on each scenario in [src/data/scenarios.ts](src/data/scenarios.ts) and reference all surfaces from it consistently. Add a small "Cohort breakdown" tile next to the KPI strip on `/command-center` so the three numbers are visible side-by-side.

### 8. Save priority Grace = P2, but treated as the primary star
Grace is the protagonist of Leeds but `savePriority = 'P2'` undermines urgency.

**Fix**: bump Grace to P1 in [src/data/customers.ts](src/data/customers.ts) for the Leeds scenario, OR add a `scenarioOverrides` map that promotes a customer's priority during their scenario.

## Low / cosmetic

### 9. RISK REDUCTION KPI shows "—" with no sparkline at idle
Every other KPI has a sparkline. Visually inconsistent.

**Fix**: in [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) `KpiStrip`, give the idle state a flat sparkline at 0 like the others.

### 10. Truncated column headers in NBA scoring grid
"ACCEPTAN" and "REDUCTIO" — column widths too tight.

**Fix**: in the relevant NBA grid component, allow header to wrap or shorten labels to "ACCEPT %" and "RED. PTS".

### 11. Mid-play at 4× is a blur
Acceptable design tradeoff — the step buttons mitigate this. Document it in `docs/` if not already.

## Implementation order

1. (Show-stoppers) Customer 360 duplicate panel — 1 line removal in `Customer360Page.tsx`
2. (Show-stoppers) London funnel numbers consistent at 12,400 base — `Uplift.tsx` GrowthFunnelView
3. (Show-stoppers) Growth-theme Customer 360 framing — `Customer360.tsx` conditional header
4. (Show-stoppers) Page-level blue chrome for growth — `CommandCenter.tsx` + `Briefing.tsx` accents
5. (Medium) AtRisk drivers via `driverFor` for all rows
6. (Medium) Copy pass on jargon
7. (Medium) `cohortBreakdown` on scenarios + render
8. (Medium) Grace → P1 for Leeds
9. (Low) Idle sparkline on Risk Reduction KPI
10. (Low) Column header widths

## Verification

Walk all four scenarios after each batch:
- Manchester: should look unchanged.
- Birmingham: bill-shock heatmap, billing chrome, no map.
- Leeds: competitive pricing panel, Grace as P1, no duplicate NBA card.
- London: blue chrome end-to-end, "Upgrade propensity" header on Customer 360, funnel arithmetic clean (12,400 → 1,420 = 11.4%).

## Critical files

- [src/pages/Customer360Page.tsx](src/pages/Customer360Page.tsx) — kill the standalone NBA panel
- [src/components/customer360/Customer360.tsx](src/components/customer360/Customer360.tsx) — growth-theme header swap
- [src/pages/Uplift.tsx](src/pages/Uplift.tsx) — fix the broken funnel
- [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) — blue chrome at the page level
- [src/data/scenarios.ts](src/data/scenarios.ts) — cohort breakdown source-of-truth + Grace P1