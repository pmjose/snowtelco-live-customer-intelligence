import type { ScenarioId } from './scenarios';

// A small chart payload an answer can attach. The chat renderer maps this to
// the existing shared chart components (HBar / BarChart / Donut / Funnel).
export type ChatChart =
  | { kind: 'hbar';    title: string; data: { label: string; value: number; sub?: string }[]; unit?: string }
  | { kind: 'bar';     title: string; data: { label: string; value: number }[]; unit?: string }
  | { kind: 'donut';   title: string; data: { label: string; value: number; color?: string }[]; unit?: string }
  | { kind: 'funnel';  title: string; stages: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }[]; unit?: string };

export interface CicQa {
  prompt: string;
  answer: string;
  citations: string[];
  chart?: ChatChart;
}

// ─── Per-scenario prompt menu ────────────────────────────────────────────────
// Surface these in the chat composer, scoped to the active scenario, so the
// presenter clicks straight into the right narrative.
export const scenarioPrompts: Record<string, string[]> = {
  manchester: [
    'Why is Amelia at risk?',
    'Summarize the Manchester M14 incident',
    'How big is the cohort and what are we offering?',
    'What is the projected save value?',
    'What happens if we do nothing?',
    'Show the network evidence pack',
  ],
  'birmingham-bill': [
    'Why did 1,840 customers get bill-shocked?',
    'Why is Daniel re-scored to 76% churn risk?',
    'What is the recommended treatment for the cohort?',
    'Are we Ofcom auto-comp eligible?',
    'How does Roaming Pass auto-enrol prevent recurrence?',
    'What is the cost-vs-save payoff?',
  ],
  'leeds-snowflex': [
    'Why is the SnowFlex base spiking PAC requests?',
    'Why is Grace flagged as price-sensitive?',
    'What is the competitor doing that triggered this?',
    'What retention NBA do we recommend?',
    'What is the margin floor on the +30GB boost?',
    'What is the projected save rate vs control?',
  ],
  'london-5g': [
    'Why is 5G SA Unlimited Max the right NBA for E14?',
    'How did we score Ravi at 0.78 propensity?',
    'How big is the eligible cohort for the upgrade wave?',
    'What is the day-1 conversion rate vs baseline?',
    'What is the ARPU lift forecast?',
    'How are we suppressing offer fatigue and consent issues?',
  ],

  // ─── Digital section ─────────────────────────────────────────────────────
  'dig-care-chat-deflection': [
    'How did Cortex Agent deflect the chat?',
    'What was the cost vs human-handle?',
    'Why was Amelia\'s sentiment recovering?',
    'What was the CSAT prediction?',
    'Are we GDPR Art.22 compliant?',
  ],
  'dig-voice-save-cancel': [
    'How did the voice agent save the cancel?',
    'What was the sentiment trajectory?',
    'What is Hannah\'s CLV at risk?',
    'How did the AHT compare to baseline?',
    'Did the QA scorecard pass?',
  ],
  'dig-esim-activation-funnel': [
    'How big was the eSIM funnel?',
    'Where did customers drop off?',
    'How did drop-off recovery work?',
    'What is the funnel completion vs baseline?',
    'What was the NPS lift?',
  ],
  'dig-roaming-push': [
    'How was the travel cohort identified?',
    'What suppressions did we apply?',
    'What was the conversion rate?',
    'How much ARPU lift did we generate?',
    'How does this prevent bill shock?',
  ],
  'dig-marketplace-bundle': [
    'How did the bundle propensity model rank Disney+?',
    'What was the holdout-vs-treatment lift?',
    'What is the rev-share margin with Disney?',
    'How fast was entitlement provisioned?',
    'What is the churn delta on attached customers?',
  ],
  'dig-appstore-rating-watch': [
    'What did Cortex Search detect in the review corpus?',
    'What were the top theme clusters?',
    'How did we intervene in-app?',
    'Did the App Store rating slip?',
    'What is the GDPR / regulatory posture?',
  ],
  'dig-web-checkout-abandon': [
    'Why did 1,820 carts abandon at payment?',
    'How did we rank recovery channels?',
    'What was the recovery rate per channel?',
    'How much revenue was recovered?',
    'Did we breach the margin floor?',
  ],
  'dig-vulnerable-care-routing': [
    'How did we detect the bereavement vulnerability?',
    'What did we suppress and route?',
    'Are we Ofcom GC C5 / ICO compliant?',
    'What did the specialist offer?',
    'How long are commercial offers suppressed?',
  ],
  'dig-fcr-prediction': [
    'How does the FCR-likelihood model route chats?',
    'What were the FCR rates by tier?',
    'Did the vulnerability classifier trip?',
    'What was the cost saving?',
    'Where is the audit trail?',
  ],
  'dig-app-fraud-signup': [
    'What signals flagged the 18 signups?',
    'How did the KYC step-up resolve?',
    'How much fraud loss was avoided?',
    'Did we hard-block any false positives?',
    'How does this feed Stripe Radar?',
  ],
  'dig-campaign-launch-lookalike': [
    'How big is the lookalike audience and what suppression applied?',
    'What did the holdout-vs-treatment uplift look like?',
    'Which creative variant won?',
    'What is the projected ARPU lift?',
    'How was vulnerability + fatigue suppression handled?',
  ],
  'dig-attribution-rebalance': [
    'Why is paid social over-credited?',
    'What is the Bayesian MMM telling us?',
    'What does the rebalance look like?',
    'What is the forecast portfolio ROAS?',
    'Are we re-pacing within the day?',
  ],
  'dig-competitor-counter': [
    'What did Cortex Search detect?',
    'How did PAC velocity move?',
    'What did the counter-offer cost?',
    'What is the save rate vs untreated control?',
    'Who reviewed the PR draft?',
  ],
  'dig-winback-lapsed': [
    'How did we score the lapsed cohort?',
    'What is the channel mix?',
    'What is the day-3 vs day-7 conversion?',
    'How much CLV did we recover?',
    'How did the holdout perform?',
  ],
  'dig-anniversary-loyalty': [
    'How does the anniversary trigger work?',
    'What rewards do the tiers get?',
    'What was the acceptance rate?',
    'What is the revenue lift?',
    'Did we cause offer fatigue?',
  ],
  'dig-refer-a-friend': [
    'How were advocates identified?',
    'What is the referral funnel?',
    'What is the viral coefficient?',
    'How much CAC did we save?',
    'Were any fraud flags raised?',
  ],

  // ─── Digital · AI & Decisioning + Trust & Operations ─────────────────────
  'dig-decisioning-trace': [
    'Walk me through this decision',
    'What was suppressed and why?',
    'How long did the decision take?',
    'Was a human override needed?',
    'Where is the audit trail?',
  ],
  'dig-voc-theme-drift': [
    'What theme is drifting?',
    'How did we intercept the cohort?',
    'Did the App Store rating slip?',
    'What is the NPS impact?',
    'How is this wired to NOC?',
  ],
  'dig-experiment-rollout': [
    'What is the Bayesian read?',
    'Did any guardrail breach?',
    'Was there an audience-overlap conflict?',
    'How did we ramp?',
    'What did we update in gold?',
  ],
  'dig-martech-sync-lag': [
    'Why did sync lag spike?',
    'How did we throttle?',
    'Did any sends fail?',
    'How fast did we recover?',
    'Where is the audit trail?',
  ],
  'dig-price-test': [
    'What does the price A/B say?',
    'Are we above the margin floor?',
    'How does competitor parity look?',
    'What is the revenue lift?',
    'What did we update in gold?',
  ],
  'dig-selfservice-kb-gap': [
    'What KB gap was detected?',
    'How did we draft the article?',
    'What is the containment lift?',
    'How does FCR change?',
    'Where is the audit trail?',
  ],
  'dig-privacy-dsar-surge': [
    'Why did DSARs spike?',
    'How did we triage?',
    'Are we ICO-compliant?',
    'How did vulnerability flags interact?',
    'How many cases closed in 48h?',
  ],
  'dig-forecast-surge': [
    'What is driving the surge?',
    'What is the WFM gap?',
    'How did we hold SLA?',
    'How accurate was the forecast?',
    'What did we publish to gold?',
  ],
  'dig-identity-sim-swap': [
    'Why was this flagged?',
    'How did we challenge?',
    'Did we false-block anyone?',
    'How is industry trust ring fed?',
    'Where is the audit trail?',
  ],

  // ─── BSS · Commerce / CRM / Revenue / Finance / Wholesale ───────────────
  // ─── BSS · Commerce / CRM / Revenue / Finance / Wholesale ───────────────
  'bss-catalog-publish': [
    'What is being published?',
    'How was CAB approved?',
    'Which channels picked up the change?',
    'Can we roll back?',
    'Where is the audit trail?',
  ],
  'bss-billing-cycle-close': [
    'How big is the cycle?',
    'Any auto-comp cases?',
    'Where did pre-bill QA fail?',
    'Is the cycle audit-ready?',
    'Where is the audit trail?',
  ],
  'bss-charging-roaming': [
    'Why did the OCS event spike?',
    'Was the customer protected?',
    'How did Roaming Pass auto-enrol fire?',
    'Was margin floor honored?',
    'Where is the audit trail?',
  ],
  'bss-dunning-recovery': [
    'How big is the dunning cohort?',
    'How is treatment tone chosen?',
    'Are vulnerability flags suppressing?',
    'What is the recovery rate?',
    'Where is the audit trail?',
  ],
  'bss-revenue-assurance': [
    'What leakage was detected?',
    'How did we score it?',
    'How was IRSF blocked?',
    'How much revenue did we recover?',
    'Where is the audit trail?',
  ],
  'bss-loyalty-mission': [
    'How big is the loyalty mission?',
    'How were tiers scored?',
    'How did partner provisioning work?',
    'What is the day-1 ROI?',
    'Where is the audit trail?',
  ],

  'bss-account-onboard': [
    'Walk me through the onboarding',
    'How was credit limit decided?',
    'How big is the hierarchy?',
    'What was provisioned?',
    'What is the ARPU forecast?',
  ],
  'bss-case-sla-breach': [
    'Why was the SLA at risk?',
    'How did AI triage help?',
    'What was the MTTR?',
    'Did anyone breach SLA?',
    'Where is the audit trail?',
  ],
  'bss-interaction-stitch': [
    'What channels did CUST-001 use?',
    'How did identity stitch work?',
    'Why suppress the NBA?',
    'How was case fatigue avoided?',
    'Where is the audit trail?',
  ],
  'bss-renewal-window': [
    'Why is GreenLeaf at risk?',
    'What is the save plan?',
    'Was margin held?',
    'How much CLV was protected?',
    'Where is the audit trail?',
  ],
  'bss-sub-plan-change': [
    'What does the customer have now?',
    'How does pro-rata work?',
    'How fast did entitlement provision?',
    'What is the ARPU change?',
    'Where is the audit trail?',
  ],
  'bss-mediation-suspense-spike': [
    'What caused the spike?',
    'How did we recover?',
    'Did SLA breach?',
    'How was the rule deployed?',
    'Where is the audit trail?',
  ],
  'bss-bill-run-cycle04': [
    'How big is the cycle?',
    'What was the QA pass rate?',
    'How did exception triage go?',
    'Any anomaly customers?',
    'Where is the audit trail?',
  ],
  'bss-port-in-burst': [
    'Why the port-in spike?',
    'Did we hold Ofcom SLA?',
    'How did auto-validation perform?',
    'What is the ARPU impact?',
    'Where is the audit trail?',
  ],
  'bss-quote-b2b-fast-track': [
    'Why was this quote fast-tracked?',
    'Was margin floor held?',
    'How fast was Q→O?',
    'What kicked off after sign?',
    'Where is the audit trail?',
  ],
  'bss-dispute-bill-shock': [
    'What caused the dispute wave?',
    'How did AI triage route them?',
    'What was the refund total?',
    'Was Ofcom auto-comp fired?',
    'Where is the audit trail?',
  ],
  'bss-revrec-quarter-close': [
    'What was recognised this quarter?',
    'What is the deferred balance?',
    'Is the audit pack ready?',
    'How is allocation done?',
    'What is the MRR/ARR?',
  ],
  'bss-vat-mtd-submit': [
    'How big was the VAT return?',
    'How was the return built?',
    'Did HMRC accept it?',
    'When does payment go?',
    'Where is the audit trail?',
  ],
  'bss-gl-period-close': [
    'How many journals posted?',
    'Did recon match?',
    'How were exceptions cleared?',
    'Any control breaches?',
    'Where is the audit trail?',
  ],
  'bss-wholesale-month-close': [
    'How big is the settlement?',
    'Were partners in tolerance?',
    'Any disputes?',
    'How did partners get statements?',
    'Where is the audit trail?',
  ],
  'bss-settlement-spain': [
    'What was the mismatch?',
    'How was it reconciled?',
    'What was recovered?',
    'Did the partner agree?',
    'Where is the audit trail?',
  ],
  'bss-promo-stacking-conflict': [
    'What was the conflict?',
    'How was it resolved?',
    'Did NBA respect it?',
    'Were any duplicates served?',
    'Where is the audit trail?',
  ],

  // ─── BSS Tier-1 ML scenarios ───────────────────────────────────────────
  'bss-bill-shock-prevent': [
    'How big is the at-risk cohort?',
    'How did we treat them?',
    'How much bill-shock did we avoid?',
    'Are we Ofcom-compliant?',
    'Where is the audit trail?',
  ],
  'bss-ecl-period-close': [
    'What is the ECL provision?',
    'How does the Stage 1/2/3 split look?',
    'Are we audit-ready?',
    'What macro overlay did we use?',
    'Where is the audit trail?',
  ],
  'bss-fallout-prevented': [
    'How many orders were at risk?',
    'How did we auto-remediate?',
    'How much revenue did we save?',
    'What was the SLA impact?',
    'Where is the audit trail?',
  ],
  'bss-cross-sell-fired': [
    'How big is the eligible cohort?',
    'What is the top recommendation?',
    'How much ARPU lift did we get?',
    'How was suppression handled?',
    'Where is the audit trail?',
  ],
  'bss-explain-bill-spike': [
    'Why did ACC-7401 spike?',
    'What does the care brief say?',
    'Is the spend legitimate?',
    'What is the recommended action?',
    'Where is the audit trail?',
  ],
};

// ─── Per-scenario, per-prompt answers ────────────────────────────────────────
// Keyed by scenario then by prompt for fast lookup. Citations are mocked
// Snowflake gold-layer table names so the answer "feels real".
export const scenarioAnswers: Record<string, CicQa[]> = {
  manchester: [
    {
      prompt: 'Why is Amelia at risk?',
      answer: `Amelia Hughes (CUST-001) has a live churn risk of 82%, up 40 points since the M14 cluster degradation flagged at 09:31. Top contributing drivers ranked by Snowpark ML CHURN_MODEL_UK_MOBILE_V3.2:

1) Network experience degradation in Manchester M14 — 27 pts (12 dropped calls + 7 failed sessions in 14 days, DL speed 118 → 34 Mbps)
2) Contract ending in 21 days — 24 pts
3) Open complaint, SLA breach risk — 17 pts
4) Competitor SIM-only offer ~£6/mo below — 11 pts
5) Bill shock, last bill 28% above 3-mo average — 3 pts

Save priority P1. Pre-approved playbook PB-RT-CRED-005: proactive apology + £5 loyalty credit + 10GB boost + plan refresh. Projected risk reduction 41 points (82% → 41%).`,
      citations: ['gold.churn_features', 'gold.network_experience_score', 'gold.care_priority', 'gold.offer_eligibility'],
      chart: {
        kind: 'hbar',
        title: 'Risk drivers — contribution (pts)',
        data: [
          { label: 'Network experience (M14)', value: 27 },
          { label: 'Contract ending in 21 days', value: 24 },
          { label: 'Open complaint · SLA risk', value: 17 },
          { label: 'Competitor SIM-only −£6', value: 11 },
          { label: 'Bill shock +28%', value: 3 },
        ],
        unit: 'pts',
      },
    },
    {
      prompt: 'Summarize the Manchester M14 incident',
      answer: `Incident NET-INC-2026-0428-MAN-M14 — detected 2026-05-08 09:31 in postcode M14.

• 7 cell sites on cluster MAN-01 degraded (4G + 5G NR n78)
• 2,417 customers impacted, 312 high-value, 89 P1 churn-risk
• Avg DL speed 118 → 34 Mbps, dropped calls +37%, failed sessions +42%
• Root cause hypothesis: peak-period demand spike + degraded backhaul (PRB 96%, GTP-U packet drops, BH circuit MAN-01-BH-2 packet loss 4.1%)
• Network action: MLB intra-cluster (offset −3dB on hot cell) + secondary carrier add (band n1) under ServiceNow CHG0012987
• Care action: pre-approved retention playbook for the 89 P1 cohort

ETA mitigation 7m24s; auto-rollback armed if KPIs miss the 5-min watch window.`,
      citations: ['gold.network_alarm_stream', 'gold.cell_kpis', 'gold.servicenow_changes'],
    },
    {
      prompt: 'How big is the cohort and what are we offering?',
      answer: `Cohort breakdown for the M14 event:
• 2,417 customers in catchment of the 7 degraded cells
• 312 high-value (CLV > £900)
• 89 P1 churn-risk (high-value × very-high churn)
• 4 suppressed (offer fatigue ≤14 days)

Offer for the 89 P1 cohort:
• £5 loyalty credit (within Ofcom auto-comp threshold)
• 10GB one-off data boost (24h)
• Proactive apology with restoration ETA SMS
• Plan refresh option for contract-ending customers

Margin floor passes; eligibility checks (consent, fatigue, open complaint) all green.`,
      citations: ['gold.next_best_action', 'gold.offer_eligibility', 'gold.customer_value'],
    },
    {
      prompt: 'What is the projected save value?',
      answer: `Projected save for the Manchester M14 cohort, modelled by uplift:

• 89 P1 customers contacted, 76 acknowledged in app within 4 minutes
• Cohort risk avg 79% → 47% in 5-min watch window (−32 points)
• Expected churners avoided: ~29 of 89 over the next 90 days
• CLV protected: ~£420k
• 90-day revenue protected: £10.1k MRR equivalent
• Care volume avoided: ~1,500 incoming complaints
• Ofcom auto-comp not triggered (mitigation < 2 hours)`,
      citations: ['gold.executive_kpi_marts', 'gold.uplift_predictions', 'gold.customer_value'],
      chart: {
        kind: 'donut',
        title: 'Cohort outcomes (89 P1)',
        data: [
          { label: 'Saved',     value: 67, color: '#10B981' },
          { label: 'Pending',   value: 13, color: '#F59E0B' },
          { label: 'Declined',  value: 5,  color: '#9CA3AF' },
          { label: 'Suppressed',value: 4,  color: '#E5E7EB' },
        ],
      },
    },
    {
      prompt: 'What happens if we do nothing?',
      answer: `Counterfactual ("do nothing") for the 89 P1 cohort:

• Expected churners next 90 days: 51 of 89
• Lost revenue: £163k CLV / £10.1k 90-day MRR
• Care volume into queue: +1,840 incoming complaints over 14 days
• NPS impact: −3 points across the Manchester base
• Ofcom auto-comp likely triggered if mitigation > 2 hours

Acting now (£5 credit + 10GB boost + plan refresh) brings expected churners down to 22 of 89, saving £93,640 of CLV at risk plus the £56k Ofcom auto-comp avoidance.`,
      citations: ['gold.uplift_predictions', 'gold.churn_features', 'gold.regulatory_obligations'],
    },
    {
      prompt: 'Show the network evidence pack',
      answer: `Auto-generated evidence pack for ServiceNow CHG0012987:

• Cluster MAN-01 · 7 cells flagged at PRB > 88% sustained 90s+
• Hottest cell 234-15-90412-3 (gNB-MAN-M14-A) PRB 96%, scheduler delay p95 4.8ms (baseline 1.1ms)
• Backhaul circuit MAN-01-BH-2 packet loss 4.1% (Cisco NCS-540 reports LSP rerouted)
• 47 active alarms (45 RAN, 2 transport) in Ericsson ENM + Nokia NetAct
• MOS dropping 4.1 → 3.4 across cluster (Polystar OSIX probe)
• 4 prior incidents matched in runbook KB (Cortex Search): MAN-01 Apr-25, Jul-25, Nov-25, Feb-26
• Simulated MLB offset −3dB → −22% drops, +61 Mbps DL in this hour`,
      citations: ['gold.alarm_stream', 'gold.cell_kpis', 'gold.runbook_kb', 'gold.servicenow_changes'],
    },
  ],

  'birmingham-bill': [
    {
      prompt: 'Why did 1,840 customers get bill-shocked?',
      answer: `Birmingham B4 bill-shock cluster — 1,840 customers with bills 25%+ above their 3-month baseline.

Root cause analysis:
• 84% of cohort travelled inside the EU during the post-Easter holiday window
• Roaming Pass auto-enrol policy is OFF for the B4 catchment (known configuration gap)
• Avg roaming charge: £18.40 above baseline
• Interconnect billing files reconciled — no mediation issue
• 244 customers in the high-value segment (CLV > £900)
• 71 re-scored to P1 churn-risk after the bill rendered

The cohort was identified by AISQL anomaly detection on the bill cycle close at 04:12 today.`,
      citations: ['gold.billing_cycle', 'gold.roaming_usage', 'gold.tap3_reconcile', 'gold.churn_features'],
      chart: {
        kind: 'bar',
        title: 'Bill increase vs baseline (cohort distribution)',
        data: [
          { label: '0–10%',  value: 240 },
          { label: '10–25%', value: 380 },
          { label: '25–40%', value: 690 },
          { label: '40–60%', value: 420 },
          { label: '60–80%', value: 90 },
          { label: '80%+',     value: 20 },
        ],
        unit: 'customers',
      },
    },
    {
      prompt: 'Why is Daniel re-scored to 76% churn risk?',
      answer: `Daniel Shah (CUST-002) was re-scored from 54% → 76% by CHURN_MODEL_UK_MOBILE_V3.2 after the bill render at 04:12.

Driver contributions:
1) Bill shock — latest bill £62 vs £47 average, +32% — 22 pts
2) Roaming Pass NOT auto-enrolled despite 3 prior EU trips — 14 pts
3) Goodwill credit applied 9 months ago (1 of 3 / 12mo policy used) — 6 pts
4) High-tenure (4yr) but contract ends in 38 days — 5 pts
5) Sentiment trend negative on last support touchpoint — 4 pts

Save priority P1. Recommended treatment: bill explanation video + £4 goodwill credit + Roaming Pass auto-enrol (12 mo).`,
      citations: ['gold.churn_features', 'gold.roaming_usage', 'gold.care_priority', 'gold.offer_eligibility'],
    },
    {
      prompt: 'What is the recommended treatment for the cohort?',
      answer: `Recommended treatment for the 1,840-customer cohort:

Tier 1 — 244 high-CLV (CLV > £900):
• Outbound retention call via Genesys Cloud (senior agent)
• Bill explanation video link in-app
• £4 goodwill credit (within FCA TCF + 3/12mo policy)
• Roaming Pass auto-enrol (12 months)

Tier 2 — 1,596 standard cohort:
• Sinch SMS bill-explanation message
• In-app bill explanation video
• Roaming Pass auto-enrol (12 months)

Compliance: passes FCA TCF (vulnerable customer guard), Ofcom GC C5 (vulnerability check flagged 12 customers for soft-path only).`,
      citations: ['gold.next_best_action', 'gold.policy_engine', 'gold.fca_tcf_compliance'],
    },
    {
      prompt: 'Are we Ofcom auto-comp eligible?',
      answer: `Ofcom auto-comp eligibility check on this cohort:

• Trigger: outage > 2 hours OR billing material breach
• Bill-shock alone is NOT an auto-comp trigger (Ofcom General Conditions C5/C9)
• 0 of 1,840 customers eligible for £4-per-day auto-comp
• However, FCA TCF expects proportionate redress for vulnerable customers (12 flagged) — soft-path goodwill credit applied
• Goodwill £4 credit on 244 high-CLV is within policy (max 3 / 12mo)

Bottom line: no statutory auto-comp; voluntary goodwill treatment is appropriate and within policy.`,
      citations: ['gold.regulatory_obligations', 'gold.fca_tcf_compliance', 'gold.policy_engine'],
    },
    {
      prompt: 'How does Roaming Pass auto-enrol prevent recurrence?',
      answer: `Roaming Pass auto-enrol mechanic:

• Detects roaming attach against an EU partner network
• Auto-applies the £3/day Roaming Pass cap (capped at £20/wk)
• Customer is opted-in for 12 months; can opt-out in-app
• Prevents bill-shock for this cohort entirely (£0 overage above the cap)

Forecast: of the 1,840 enrolled today, 612 are likely to roam in the next 12 months; bill-shock recurrence drops from current 33% to <2%.

Recommendation: extend auto-enrol policy from B4 to all UK catchments via a CHG ticket — addressable cohort 312k customers, prevents ~6,400 bill-shock cases per year.`,
      citations: ['gold.roaming_pass_policy', 'gold.bill_shock_history', 'gold.policy_engine'],
    },
    {
      prompt: 'What is the cost-vs-save payoff?',
      answer: `Cost vs CLV-protected matrix for the 1,840 cohort:

• Bill explainer SMS only — cost £0, CLV protected ~£42k (∞ ROI)
• Bill explainer + £4 goodwill credit — cost £7.4k, CLV protected ~£128k (17× ROI) ← RECOMMENDED
• Full refund + Roaming Pass auto-enrol — cost £18.4k, CLV protected ~£180k (10× ROI)
• Senior care callback for top 50 — cost £3.2k, CLV protected ~£62k (19× ROI)

Recommended option maximises ROI without exceeding the goodwill-credit policy floor and stays inside FCA TCF guidelines for the vulnerable subset.`,
      citations: ['gold.uplift_predictions', 'gold.customer_value', 'gold.policy_engine'],
      chart: {
        kind: 'hbar',
        title: 'CLV protected by treatment (£k)',
        data: [
          { label: 'Bill explainer SMS only', value: 42, sub: 'cost £0' },
          { label: 'Explainer + £4 credit ★', value: 128, sub: 'cost £7.4k · 17× ROI' },
          { label: 'Full refund + auto-enrol', value: 180, sub: 'cost £18.4k · 10× ROI' },
          { label: 'Senior callback (top 50)', value: 62, sub: 'cost £3.2k · 19× ROI' },
        ],
        unit: '£k',
      },
    },
  ],

  'leeds-snowflex': [
    {
      prompt: 'Why is the SnowFlex base spiking PAC requests?',
      answer: `Leeds LS2/LS5 SnowFlex SIM-only base: PAC-request volume +340% over 7 days vs trailing-7d baseline.

Root cause analysis:
• Cortex Search matched a competitor mid-month tariff change announcement (publicly indexed press release + pricing-page diff)
• Competitor offer: 30 GB SIM-only at £18 (SnowFlex equivalent £22) — 18% below benchmark
• 940 active PAC requests, 28 high-CLV (CLV > £900), 38 P1 churn-risk
• Tenure profile: 78% of cohort < 14 months (price-elastic)
• No network or care issue correlates — this is a tariff event

Window of opportunity: PAC code is valid 30 days; retention NBA must reach the customer before they port.`,
      citations: ['gold.pac_requests', 'gold.competitor_intelligence', 'gold.cortex_search_runbooks', 'gold.churn_features'],
      chart: {
        kind: 'bar',
        title: 'PAC requests · last 7 days (LS2/LS5)',
        data: [
          { label: 'D-7', value: 28 },
          { label: 'D-6', value: 34 },
          { label: 'D-5', value: 41 },
          { label: 'D-4', value: 88 },
          { label: 'D-3', value: 142 },
          { label: 'D-2', value: 198 },
          { label: 'D-1', value: 264 },
          { label: 'Today', value: 145 },
        ],
        unit: 'PAC',
      },
    },
    {
      prompt: 'Why is Grace flagged as price-sensitive?',
      answer: `Grace Williams (CUST-005) profile:

• SnowFlex SIM-only £22/mo, 30GB
• Tenure 14 months (within tariff-elastic window)
• 6 plan-comparison sessions on the website in the last 21 days (web telemetry)
• 1 PAC code requested via support chat 7 days ago — not yet ported
• Engagement-to-spend ratio low (typical SnowFlex price-sensitive profile)
• Sentiment trend: neutral, no service complaints
• Score: 0.69 churn probability per Snowpark ML PRICE_ELASTICITY_V1.4

This is a rational price-comparison churn — Grace is shopping, not unhappy.`,
      citations: ['gold.churn_features', 'gold.web_telemetry', 'gold.care_history', 'gold.price_elasticity_features'],
    },
    {
      prompt: 'What is the competitor doing that triggered this?',
      answer: `Competitor signal matched by Cortex Search at 08:42:

• Competitor A "Flex 30" — 30 GB SIM-only at £18/mo (introductory 6-month price, then £22)
• Targeted at SnowFlex-equivalent demographic (price-sensitive, contract end window)
• In-market push since 2026-04-28 (matches the PAC spike onset)
• Offer perks: no bundle, easy 30-day cancel
• Geographic concentration: Leeds, Manchester, Birmingham (LS/M/B postcodes)

Counter-strategy: out-value rather than out-price. SnowFlex Boost (proposed) = 30 GB → 60 GB at the same £22, plus 6-month loyalty boost (+5% recurring discount post-month-12). ROI 2.4× over 12-month CLV uplift.`,
      citations: ['gold.competitor_intelligence', 'gold.cortex_search_runbooks', 'gold.tariff_elasticity'],
    },
    {
      prompt: 'What retention NBA do we recommend?',
      answer: `Ranked NBA for the 940-PAC cohort:

Tier 1 — 28 high-CLV:
• In-app retention modal: SnowFlex Boost (+30GB at same price + 6-month loyalty lock)
• Senior care callback (Genesys outbound) for the top 12 (CLV > £1.5k)

Tier 2 — 912 standard cohort:
• In-app retention modal + email
• Tariff comparison chart showing SnowFlex Boost vs competitor (out-value framing)

Margin floor: ROI 2.4× over 12-month CLV uplift, pre-approved by margin-engine. Save-rate forecast 44% (vs untreated control 28%) → 412 saves of 940.`,
      citations: ['gold.next_best_action', 'gold.margin_engine', 'gold.uplift_predictions'],
    },
    {
      prompt: 'What is the margin floor on the +30GB boost?',
      answer: `Margin floor check for SnowFlex Boost (+30GB at £22, 6-month loyalty lock):

• Wholesale data cost: £0.28/GB → +£8.40/customer marginal cost
• Loyalty boost: 5% recurring discount post-month-12 → £1.10/mo cost over 12 months
• 12-month CLV uplift on a saved customer: £264 (vs £127 churn-replacement cost)
• Net margin per saved customer: £142 over 12 months
• ROI ratio: 2.4× — passes the 1.6× margin floor

Margin engine pre-approved this offer at 08:48; no manual review required.`,
      citations: ['gold.margin_engine', 'gold.tariff_elasticity', 'gold.customer_value'],
    },
    {
      prompt: 'What is the projected save rate vs control?',
      answer: `Save rate forecast for the 940-PAC cohort, modelled by treatment-uplift on a 5% control holdout:

• Control (no intervention): 28% retention (262 of 940)
• Treatment (SnowFlex Boost NBA): 44% retention (412 of 940)
• Net uplift: +16 percentage points (150 incremental saves)
• Persuadables: 28 of 38 P1 (74%)
• CLV protected: ~£94k across the cohort
• Cost: 28 high-CLV calls + 912 in-app modals + 940 email = £4.2k execution
• Net save value: £89.8k (21× ROI)

Day-7 measurement window for actual conversion vs forecast.`,
      citations: ['gold.uplift_predictions', 'gold.executive_kpi_marts', 'gold.customer_value'],
      chart: {
        kind: 'donut',
        title: 'Save-rate forecast (940 PAC cohort)',
        data: [
          { label: 'Saved (treatment)',  value: 412, color: '#10B981' },
          { label: 'Saved (control — 28%)', value: 263, color: '#A7F3D0' },
          { label: 'Lost despite NBA',   value: 528, color: '#9CA3AF' },
        ],
      },
    },
  ],

  'london-5g': [
    {
      prompt: 'Why is 5G SA Unlimited Max the right NBA for E14?',
      answer: `5G SA Unlimited Max NBA selection rationale for the London E14 cluster:

• 5G Standalone coverage just live across 24 cells in Canary Wharf (E14)
• 1.4M London base scored by Snowpark ML upgrade-propensity model
• 12,400 5G-capable handsets on legacy plans within E14 catchment
• 320 in the high-CLV high-propensity quadrant (propensity > 0.6, CLV > £900)
• Ravi Patel scored 0.78 propensity — heavy data user, 5G handset, contract ending in 62 days
• Margin floor: 5G SA Unlimited Max £49 vs current avg £37 → +£12 ARPU at 41% margin

This is a coverage-launch-driven upsell event, not a churn save. Treatment frame is "offence" not "defence".`,
      citations: ['gold.coverage_inventory', 'gold.upgrade_propensity_features', 'gold.customer_value', 'gold.tariff_catalog'],
    },
    {
      prompt: 'How did we score Ravi at 0.78 propensity?',
      answer: `Ravi Patel (CUST-004) — propensity 0.78 from UPGRADE_PROPENSITY_MODEL_V2.1.

Top features:
1) 5G-capable handset (iPhone 15 Pro, TAC matched) — 0.21
2) Heavy data user — 58 GB/mo (top decile for current plan) — 0.18
3) In E14 5G SA coverage from today — 0.14
4) Contract ending in 62 days (renewal window opens day-90) — 0.11
5) Browsed "5G plans" page 4 times in last 14 days (web telemetry) — 0.08
6) High-value tier, low offer fatigue (last accepted offer 11 months ago) — 0.06

Recommended NBA: 5G SA Unlimited Max + £5 first-month credit; eligibility green.`,
      citations: ['gold.upgrade_propensity_features', 'gold.web_telemetry', 'gold.customer_value', 'gold.offer_eligibility'],
    },
    {
      prompt: 'How big is the eligible cohort for the upgrade wave?',
      answer: `Eligible cohort funnel for the E14 5G SA upgrade wave:

• Total London base: 1,400,000
• 5G handset (TAC-matched): 946,000 (76%)
• In E14 5G SA coverage today: 512,000 (54% of 5G handsets)
• Currently on legacy plan (not 5G SA): 274,000 (53% of in-coverage)
• Upgrade-propensity > 0.6: 12,400 (4.5% of legacy)
• Contract end ≤ 90 days: 5,500 (44% of high-propensity)
• High-CLV (CLV > £900) within high-propensity: 320

Day-1 launch targets the 12,400 high-propensity cohort across in-app + push + email; the 320 high-CLV get an additional Genesys retention call.`,
      citations: ['gold.coverage_inventory', 'gold.upgrade_propensity_features', 'gold.customer_value'],
      chart: {
        kind: 'funnel',
        title: 'Eligibility funnel — London base → ready cohort',
        stages: [
          { label: 'Total London base',          value: 1400000, tone: 'neutral' },
          { label: '5G handset',                 value: 946000,  tone: 'neutral' },
          { label: 'In E14 5G SA coverage',      value: 512000,  tone: 'neutral' },
          { label: 'Legacy plan',                value: 274000,  tone: 'neutral' },
          { label: 'Propensity > 0.6',           value: 12400,   tone: 'good' },
          { label: 'Contract end ≤ 90d',         value: 5500,    tone: 'good' },
          { label: 'High-CLV (£>900) within',    value: 320,     tone: 'good' },
        ],
      },
    },
    {
      prompt: 'What is the day-1 conversion rate vs baseline?',
      answer: `Day-1 conversion forecast for the E14 5G upgrade wave:

• Eligible cohort: 12,400
• Exposed (in-app + push + email): 11,408 (92%)
• Engaged (opened journey): 4,712 (38% of exposed)
• Offered (NBA shown): 3,290 (26% of exposed)
• Upgraded day-1: 1,420 (11.4% of exposed)

Vs baseline (last 5G launch at Manchester M3):
• Manchester M3 day-1 conversion: 4.0%
• London E14 forecast: 11.4% (+7.4 pp uplift, driven by handset penetration + heavy-data customer base in Canary Wharf)

Day-1 ARPU lift: +£15k/mo run-rate; £180k/yr forecast.`,
      citations: ['gold.upgrade_funnel', 'gold.executive_kpi_marts', 'gold.tariff_catalog'],
      chart: {
        kind: 'funnel',
        title: 'Day-1 conversion funnel',
        stages: [
          { label: 'Eligible',  value: 12400, tone: 'neutral' },
          { label: 'Exposed',   value: 11408, tone: 'neutral' },
          { label: 'Engaged',   value: 4712,  tone: 'good' },
          { label: 'Offered',   value: 3290,  tone: 'good' },
          { label: 'Upgraded',  value: 1420,  tone: 'good' },
        ],
      },
    },
    {
      prompt: 'What is the ARPU lift forecast?',
      answer: `ARPU lift forecast for the E14 5G SA Unlimited Max upgrade:

• Per-customer uplift: +£12/month (£37 → £49)
• Day-1 upgrades: 1,420 → +£15k/mo run-rate
• 30-day forecast: 4,200 upgrades → +£50k/mo
• 12-month forecast: 12,400 reached × 39% adoption = 4,840 upgrades → +£58k/mo run-rate, £696k/yr ARPU

Discounting £5 first-month credit (one-off, recoverable in month 2):
• Net 12-month ARPU lift: ~£180k for the high-propensity cohort
• Coverage payback period: 3 months on the cohort spend

ROI ratio: 6.2× over 12 months.`,
      citations: ['gold.tariff_catalog', 'gold.upgrade_funnel', 'gold.executive_kpi_marts'],
    },
    {
      prompt: 'How are we suppressing offer fatigue and consent issues?',
      answer: `Eligibility & suppression layer for the upgrade wave:

• Marketing consent: 12,400 → 12,220 pass (180 suppressed; opted out of marketing)
• Offer fatigue: last commercial offer ≥14 days → 12,180 pass (40 within fatigue window)
• Open complaint hold: 0 open complaints in this cohort
• Vulnerability flag (Ofcom GC C5): 24 flagged → soft-path only (no aggressive push)
• Margin floor: passes
• Net eligible: 12,156 customers exposed across in-app + push + email

Audit trail: every suppression decision is recorded in gold.decision_lineage with the rule that fired and the timestamp. GDPR Art. 22 compliant — automated decisioning with human override available.`,
      citations: ['gold.decision_lineage', 'gold.consent_register', 'gold.offer_eligibility', 'gold.vulnerability_register'],
    },
  ],

  // ─── Digital section answers ─────────────────────────────────────────────
  'dig-care-chat-deflection': [
    {
      prompt: 'How did Cortex Agent deflect the chat?',
      answer: `Amelia Hughes (CUST-001) opened a chat citing M14 service quality. Cortex Agent retrieved the live network status (RAN softness in M14 cluster, ETA 09:45) via Cortex Search, summarised it back, offered a £5 loyalty credit + 10GB data boost, and resolved in 2:14.\n\nDeflection rate today: 68% · CSAT prediction 0.86 · zero human escalation. Net cost £15 vs £42 human-handle baseline.`,
      citations: ['gold.cc_chats', 'gold.network_experience_score', 'gold.offer_eligibility', 'gold.decision_lineage'],
    },
    {
      prompt: 'What was the cost vs human-handle?',
      answer: `Bot-served chat: £15 fully loaded (compute + offer cost). Human-handle baseline: £42 (15-min average AHT × loaded agent rate). Net saving £27 per deflected chat. Across the 8,940 deflected sessions today that is ~£241k operational saving with CSAT held at 4.6/5.`,
      citations: ['gold.cc_chats', 'gold.care_cost_model'],
    },
    {
      prompt: 'Are we GDPR Art.22 compliant?',
      answer: `Yes. Every automated decision (offer recommendation, deflection, sentiment classification) is logged to gold.decision_lineage with the model version, features, and confidence. Human-override is one click in the agent desktop. We meet Art.22 — automated decisioning with meaningful human review available.`,
      citations: ['gold.decision_lineage', 'gold.consent_register'],
    },
  ],
  'dig-voice-save-cancel': [
    {
      prompt: 'How did the voice agent save the cancel?',
      answer: `Hannah Bennett (CUST-003) called SAVE-MNP queue stating "I want to leave". Whisper STT scored sentiment −0.74. The Genesys voice agent (powered by Cortex) recognised her as high-CLV in an LS5 known-soft cell, ran the empathy → reassurance → offer playbook, and surfaced £5 credit + 10GB boost. AHT 1:01 (vs 4:18 average). Cancellation never submitted.`,
      citations: ['gold.ivr_calls', 'gold.network_experience_score', 'gold.offer_eligibility'],
    },
    {
      prompt: 'What was the sentiment trajectory?',
      answer: `Real-time STT sentiment: −0.74 → −0.36 → +0.12 → +0.34 across the 1:01 call. The agent's prompt set was tuned by Cortex Complete to land empathy first. WER on the STT was 3.4%. STIR/SHAKEN attestation A throughout.`,
      citations: ['gold.ivr_calls', 'gold.sentiment_features'],
    },
    {
      prompt: 'What is Hannah\'s CLV at risk?',
      answer: `Hannah's 24-month residual CLV is ~£480 (£20/mo × 24mo, churn-adjusted). Save rate uplift on this cohort is +18pp vs no-intervention control, so the expected save value is ~£86 per call at our current population.`,
      citations: ['gold.customer_value', 'gold.save_propensity'],
    },
  ],
  'dig-esim-activation-funnel': [
    {
      prompt: 'How big was the eSIM funnel?',
      answer: `18,420 sessions entered the eSIM activation journey in the last 60 minutes. Stage drop-off: Eligibility 0% (TAC matched) → QR scan −8% → Profile install (SM-DP+) −4% → Test call/data −1%. Net 16,038 confirmed activations.`,
      citations: ['gold.web_telemetry', 'gold.esim_activation', 'gold.decision_lineage'],
    },
    {
      prompt: 'How did drop-off recovery work?',
      answer: `1,250 customers abandoned at Stages 1–3. Salesforce MC fired a recovery push and Genesys queued a voice callback. 412 of the 1,250 recovered (33% drop-off recovery rate). Final journey count: 16,450 eSIMs activated.`,
      citations: ['gold.cc_chats', 'gold.web_telemetry'],
    },
    {
      prompt: 'What is the funnel completion vs baseline?',
      answer: `87% completion vs 81% baseline (+6pp). Avg journey time 2:48. NPS lift +4pp on activated customers. Zero physical SIM cost — pure margin upgrade vs the legacy SIM-by-post path.`,
      citations: ['gold.web_telemetry', 'gold.nps_panel'],
    },
  ],
  'dig-roaming-push': [
    {
      prompt: 'How was the travel cohort identified?',
      answer: `Travel-pattern model fuses booking signals (where consented), location seasonality, calendar history, and device travel posture. It scored 4,200 customers as likely-EU-travel within 48h. Of those, 612 are high-CLV and 312 are already enrolled and suppressed.`,
      citations: ['gold.travel_pattern', 'gold.consent_register', 'gold.customer_value'],
    },
    {
      prompt: 'What suppressions did we apply?',
      answer: `From the 4,200 candidates we removed: 312 already enrolled, 168 marketing-consent expired, varied vulnerability flags, and recent-push (>7d) gating. Net 3,720 served. All decisions written to gold.decision_lineage with the suppression rule that fired.`,
      citations: ['gold.consent_register', 'gold.decision_lineage', 'gold.vulnerability_register'],
    },
    {
      prompt: 'How much ARPU lift did we generate?',
      answer: `612 enrolled at £2.94/customer/day. At 7-day average usage that is ~£12.8k/wk run-rate of incremental revenue, plus the bill-shock prevention effect on ~480 forecast cases. CSAT lift +0.2 on the cohort.`,
      citations: ['gold.roaming_pass_policy', 'gold.tap3_reconcile', 'gold.billing_cycle'],
    },
  ],
  'dig-marketplace-bundle': [
    {
      prompt: 'How did the bundle propensity model rank Disney+?',
      answer: `bundle_propensity_v2.1 scored 24,000 family-plan customers. Top 8,400 cleared 0.6 propensity; 1,200 are high-CLV. We held a 5% control. Margin check on the Disney rev-share: 38% net — well above offer cost.`,
      citations: ['gold.bundle_attach', 'gold.customer_value', 'gold.partner_revshare'],
    },
    {
      prompt: 'What was the holdout-vs-treatment lift?',
      answer: `Treatment cohort (7,980) attached at 27%; control (5%) attached at 8.6%. Net uplift +18.4pp incremental. Churn forecast on attached customers improved by −6.4pp at day-30. Audit trail in gold.decision_lineage.`,
      citations: ['gold.bundle_attach', 'gold.decision_lineage'],
    },
    {
      prompt: 'How fast was entitlement provisioned?',
      answer: `Entitlement provisioned in <1.4s P95 via the SPCS adapter to Disney's APIs. 2,180 customers walked away from a single in-app modal with Disney+ live on their account. Revenue uplift +£19.6k/mo.`,
      citations: ['gold.bundle_attach', 'gold.partner_provisioning'],
    },
  ],
  'dig-appstore-rating-watch': [
    {
      prompt: 'What did Cortex Search detect in the review corpus?',
      answer: `200-review rolling sentiment crashed from +0.42 to −0.31 over 6h on iOS UK. review_velocity_v1 flagged the anomaly. AI_SUMMARIZE clustered themes: "5G coverage Manchester" 28% · "billing app crash" 24% · "tariff vs competitor" 18%.`,
      citations: ['gold.review_corpus', 'gold.app_telemetry', 'gold.decision_lineage'],
    },
    {
      prompt: 'How did we intervene in-app?',
      answer: `18,400 affected customers got an in-app intercept survey + Cortex Agent dynamic FAQ. 8,940 sessions were deflected by the FAQ alone. Sentiment recovered +0.21 in 6h. Resolution email queued.`,
      citations: ['gold.cc_chats', 'gold.app_telemetry', 'gold.review_corpus'],
    },
    {
      prompt: 'Did the App Store rating slip?',
      answer: `No. Store rating retained at 4.6. Cortex Agent pre-drafted an App Store appeal with the evidence pack (review IDs + runbook NOC-MAN-M14). NPS lift +0.18 across the cohort. GDPR Art.6 lawful-basis logged.`,
      citations: ['gold.review_corpus', 'gold.decision_lineage'],
    },
  ],
  'dig-web-checkout-abandon': [
    {
      prompt: 'Why did 1,820 carts abandon at payment?',
      answer: `cart_recovery_v3.0 split the 1,820 abandons: 760 price-match shopping · 480 address-validation friction · 360 Stripe 3DS challenge friction · 220 timeout. Baseline at this hour is 240 — this is 7.6× normal.`,
      citations: ['gold.web_telemetry', 'gold.checkout_funnel'],
    },
    {
      prompt: 'How did we rank recovery channels?',
      answer: `Snowpark ML re-ranked channel within the 30-min window. Recovery rates landed: 41% SMS · 33% email · 28% push · 19% RCS rich card. Price-match was capped at the margin floor; address-fix used pre-filled forms.`,
      citations: ['gold.web_telemetry', 'gold.decision_lineage'],
    },
    {
      prompt: 'How much revenue was recovered?',
      answer: `612 carts recovered (33%). Checkout completion 76% (+8pp vs baseline). Revenue recovered £92k, CAC saved £34k. Zero PCI / fraud flags. All decisions audit-trailed to gold.decision_lineage.`,
      citations: ['gold.checkout_funnel', 'gold.decision_lineage'],
    },
  ],
  'dig-vulnerable-care-routing': [
    {
      prompt: 'How did we detect the bereavement vulnerability?',
      answer: `Inbound chat: "I have just been bereaved and I cannot pay this bill" · sentiment −0.84. vulnerability_v2.1 classifier returned confidence 0.97 with flag = recent_bereavement. Routed away from upsell, into the SAVE-VULN specialist queue (pickup 18s).`,
      citations: ['gold.cc_chats', 'gold.vulnerability_register'],
    },
    {
      prompt: 'What did we suppress and route?',
      answer: `All commercial offers suppressed for 12 months. Safeguarding flag set on the account. NBA model honours the flag — no upsell, no winback wave, no cross-sell. Specialist accepted a 30-day bill pause + payment plan.`,
      citations: ['gold.vulnerability_register', 'gold.decision_lineage'],
    },
    {
      prompt: 'Are we Ofcom GC C5 / ICO compliant?',
      answer: `Yes. ICO vulnerability register updated. Ofcom GC C5 evidence pack auto-generated. GDPR Art.9 logged (special category data). Case opened VLN-2026-04812. CSAT 0.92 on the call. Zero commercial actions triggered.`,
      citations: ['gold.vulnerability_register', 'gold.decision_lineage'],
    },
  ],
  'dig-fcr-prediction': [
    {
      prompt: 'How does the FCR-likelihood model route chats?',
      answer: `fcr_likelihood_v2.0 scored each of 6,200 inbound chats. 4,180 above 0.7 went to bot. 1,420 in 0.4–0.7 went to human-assist mode (bot drafts, human approves). 600 below 0.4 routed straight to specialist humans (SAVE-COMPLEX).`,
      citations: ['gold.cc_chats', 'gold.decision_lineage'],
    },
    {
      prompt: 'What were the FCR rates by tier?',
      answer: `In-bot 81% · assist 74% · specialist 88% · overall 78% (+12pp vs flat-routed baseline). Vulnerability classifier intercepted 4 cases mid-flow and re-routed to SAVE-VULN. Zero queue overflow during the surge.`,
      citations: ['gold.cc_chats', 'gold.vulnerability_register'],
    },
    {
      prompt: 'What was the cost saving?',
      answer: `Bot-then-human escalation tax avoided on 600 hard chats. Run-rate saving £12k/h vs the legacy bot-first-no-rescore policy. Vulnerability false-positive rate 0.4%. Model logged to gold.decision_lineage.`,
      citations: ['gold.cc_chats', 'gold.decision_lineage'],
    },
  ],
  'dig-app-fraud-signup': [
    {
      prompt: 'What signals flagged the 18 signups?',
      answer: `synthetic_signup_v1.3 fused: device-fingerprint (12 from same device), IP/address/phone country mismatch (UK/NL/IE), Stripe Radar high-risk score, and burst velocity (240 signups in 15 min vs baseline 24). 18 of 240 cleared the 0.85 threshold.`,
      citations: ['gold.fraud_decisions', 'gold.device_fingerprint'],
    },
    {
      prompt: 'How did the KYC step-up resolve?',
      answer: `18 stepped up via Onfido (document + selfie). 14 attempted; 4 abandoned (hard-block). Of the 14, only 2 cleared evidence — the other 12 were confirmed synthetic. Manual review on the 2 cleared cases: zero false-block confirmed.`,
      citations: ['gold.fraud_decisions', 'gold.kyc_register'],
    },
    {
      prompt: 'How much fraud loss was avoided?',
      answer: `£42k fraud loss avoided (16 SIMs not provisioned × estimated lifetime fraud loss). GDPR data-minimisation respected on the step-up evidence. Case closed FRD-2026-7421. Stripe Radar feedback loop fed.`,
      citations: ['gold.fraud_decisions', 'gold.decision_lineage'],
    },
  ],
  'dig-campaign-launch-lookalike': [
    {
      prompt: 'How big is the lookalike audience and what suppression applied?',
      answer: `Snowpark ML lookalike (cosine ≥ 0.82 against the 1,000-converter seed) returned 240,180 customers from gold.customer_embeddings. Suppression: 2,180 open complaints + 4,420 offer-fatigue + 18% overlap with the live Disney+ campaign. Net 232k reachable.`,
      citations: ['gold.customer_embeddings', 'gold.touchpoints', 'gold.decision_lineage'],
    },
    {
      prompt: 'What did the holdout-vs-treatment uplift look like?',
      answer: `Treatment 11.4% conv · holdout (5%) 5.0% conv · uplift +6.4pp · ROAS 4.6×. 27,400 conversions on the day-1 measurement. ARPU lift +£1.6/mo per converter, run-rate ~£44k/mo.`,
      citations: ['gold.touchpoints', 'gold.revenue_attribution'],
    },
    {
      prompt: 'Which creative variant won?',
      answer: `Cortex Agent generated 6 subject lines + 3 body variants on a "confident, friendly, UK" brand-voice prompt. Winner: subject line "Your data, unlocked." with CTR +27% over the control variant. Re-paced spend toward A in real time.`,
      citations: ['gold.creative_library', 'gold.touchpoints'],
    },
    {
      prompt: 'What is the projected ARPU lift?',
      answer: `Per-converter ARPU lift: +£1.6/mo. Run-rate against 27,400 converters: ~£44k/mo gross, £26k/mo net of offer cost. Audit trail in gold.decision_lineage.`,
      citations: ['gold.revenue_attribution', 'gold.decision_lineage'],
    },
  ],
  'dig-attribution-rebalance': [
    {
      prompt: 'Why is paid social over-credited?',
      answer: `Last-click view-through credits paid social with 31% of conversions. Markov + Shapley reattribution puts paid social at 22% — i.e. last-click overstates by 9pp. Marginal ROAS on paid social ran at 0.7× last week, below break-even.`,
      citations: ['gold.touchpoints', 'gold.revenue_attribution'],
    },
    {
      prompt: 'What is the Bayesian MMM telling us?',
      answer: `mmm_bayesian_v2 fit overnight on 26 weeks of spend × revenue × seasonality. Posterior says reallocate 12pp out of paid social into retargeting (+6pp), RCS (+4pp), email (+2pp). Forecast: portfolio ROAS 5.1× → 5.5×; +£82k/mo incremental revenue.`,
      citations: ['gold.spend_ledger', 'gold.revenue_attribution'],
    },
    {
      prompt: 'Are we re-pacing within the day?',
      answer: `Yes. Adobe AEP + Salesforce MC budgets re-issued within 30 min of approval. Creative re-pacing followed. Zero brand-safety regressions in QA. Audit trail in gold.spend_ledger and gold.revenue_attribution.`,
      citations: ['gold.spend_ledger', 'gold.revenue_attribution', 'gold.decision_lineage'],
    },
  ],
  'dig-competitor-counter': [
    {
      prompt: 'What did Cortex Search detect?',
      answer: `Competitor A dropped 30GB SIM-only from £22 to £18 — 4 social posts in the last 4 hours. Cortex Search alerted in <90s of the first post. Brand-search SnowFlex −9% in 4h. PAC velocity in LS2 +340% vs baseline.`,
      citations: ['gold.competitor_ads', 'gold.review_corpus'],
    },
    {
      prompt: 'What did the counter-offer cost?',
      answer: `Cohort 940 in LS2/LS5, margin floor 28%. Offer: SnowFlex 30GB price-match + 6mo loyalty boost. Cortex Agent drafted counter-offer copy + landing-page hero + PR statement (Comms approved). Creative live in 22 min from detection.`,
      citations: ['gold.competitor_ads', 'gold.creative_library'],
    },
    {
      prompt: 'What is the save rate vs untreated control?',
      answer: `412 retained (44%) on the treated cohort · 528 still browsing. Save rate +16pp vs untreated control. CLV protected ~£94k. Forecast 30-day ROAS on the counter-launch: 3.8×.`,
      citations: ['gold.competitor_ads', 'gold.revenue_attribution'],
    },
  ],
  'dig-winback-lapsed': [
    {
      prompt: 'How did we score the lapsed cohort?',
      answer: `winback_propensity_v2 scored 18,420 customers churned 60–180d ago. Above 0.5 propensity: 6,140. Vulnerability suppressed: 248. Marketing consent live: 14,920. Channel match: 4,180 push-ready · 8,200 email-only · 2,540 SMS · 0 voice (consent).`,
      citations: ['gold.customer_value', 'gold.consent_register', 'gold.vulnerability_register'],
    },
    {
      prompt: 'What is the day-3 vs day-7 conversion?',
      answer: `Day-3: 1,640 returned (9% of consented cohort, vs 4% control). Day-7: 2,420 cumulative retained — 13% by day-7 vs 4.1% control. Net uplift +8.9pp. Revenue +£42k/mo run-rate. CLV recovered £384k.`,
      citations: ['gold.customer_value', 'gold.touchpoints', 'gold.revenue_attribution'],
    },
    {
      prompt: 'How did the holdout perform?',
      answer: `Holdout (10%, 1,840 untreated): 76 returned (4.1%). Treated minus control = +8.9pp uplift. Margin floor preserved. Zero vulnerability complaints across the wave.`,
      citations: ['gold.touchpoints', 'gold.decision_lineage'],
    },
  ],
  'dig-anniversary-loyalty': [
    {
      prompt: 'How does the anniversary trigger work?',
      answer: `12,200 customers reach 12mo / 24mo / 36mo anniversaries today. The loyalty model ranks 3 reward tiers: 36mo gets a gift, 24mo gets a bundle attach (Disney+ trial), 12mo gets a 10GB data boost. Single push, cross-product entitlement via SPCS.`,
      citations: ['gold.engagement_features', 'gold.bundle_attach'],
    },
    {
      prompt: 'What was the acceptance rate?',
      answer: `4,640 of 12,200 accepted reward (38% acceptance rate). 1,420 attached the Disney+ trial. CSAT lift +0.6 · NPS +4pp · churn forecast −2.4pp on the cohort.`,
      citations: ['gold.engagement_features', 'gold.bundle_attach', 'gold.nps_panel'],
    },
    {
      prompt: 'What is the revenue lift?',
      answer: `Revenue lift £18k/mo across the 4,640 accepters (≈ £3.88/mo per converter — a mix of the data boost upsell, Disney+ trial-to-paid attach, and reduced churn). This is cohort revenue, not per-user ARPU.`,
      citations: ['gold.revenue_attribution', 'gold.engagement_features'],
    },
    {
      prompt: 'Did we cause offer fatigue?',
      answer: `No commercial-offer fatigue triggers fired. The reward window suppressed any other offers for 14 days post-trigger. Loyalty mission completed. gold.engagement_features refreshed.`,
      citations: ['gold.decision_lineage', 'gold.engagement_features'],
    },
  ],
  'dig-refer-a-friend': [
    {
      prompt: 'How were advocates identified?',
      answer: `advocate_propensity_v1.0 selected 8,400 customers with NPS ≥ 9 + tenure ≥ 6mo. Reward tier: £15 credit per successful referral · cap 5 referrals per advocate. Suppressions: open complaints, vulnerability flags, recent offer fatigue.`,
      citations: ['gold.engagement_features', 'gold.nps_panel'],
    },
    {
      prompt: 'What is the referral funnel?',
      answer: `8,400 advocates → 3,540 invites sent → 1,320 friends opened → 612 conversions. Day-3 measurement. Personalised referral link via Adobe AEP, share-to-WhatsApp/SMS embedded.`,
      citations: ['gold.touchpoints', 'gold.engagement_features'],
    },
    {
      prompt: 'What is the viral coefficient?',
      answer: `Viral coefficient 0.42 (each advocate brings 0.42 paying friends on average). LTV created £94k. CAC saved £38k vs the equivalent paid-channel acquisition. ROAS 9.1×.`,
      citations: ['gold.touchpoints', 'gold.revenue_attribution'],
    },
    {
      prompt: 'Were any fraud flags raised?',
      answer: `Zero fraud flags on advocate-friend pairs. Device-fingerprint, IP, payment-method overlap checked at the point of friend signup. Reward credits issued automatically. gold.loyalty_ledger updated.`,
      citations: ['gold.fraud_decisions', 'gold.loyalty_ledger', 'gold.engagement_features'],
    },
  ],

  // ─── AI & Decisioning + Trust & Operations answers ───────────────────────
  'dig-decisioning-trace': [
    {
      prompt: 'Walk me through this decision',
      answer: `Intent received from CUST-001 chat ("5G slow at home", M14). Customer state pulled: CLV £980, churn 0.62, contract end 21d. Eligibility retrieved 12 offers. Suppression dropped 3 (frequency cap, margin floor, vulnerability). Cortex Agent reasoned: "network event known — prioritise apology + credit, avoid upsell". Ranked output P1 £5 credit, P2 10GB boost, P3 contract refresh. Channel = in-bot. Delivered, audit row written. p95 41ms.`,
      citations: ['gold.decision_lineage', 'gold.policy_registry', 'gold.offer_eligibility'],
    },
    {
      prompt: 'What was suppressed and why?',
      answer: `Three offers dropped before ranking. (1) Roaming Pass push — frequency cap (last push 4 days ago, policy max 7d). (2) 5G Hero upgrade — margin floor 28% breached at the discount tier. (3) Contract auto-renewal nudge — vulnerability flag on the account (financial difficulty, 6 months ago) — policy suppresses upsell on flagged accounts.`,
      citations: ['gold.policy_registry', 'gold.offer_eligibility', 'gold.vulnerability_register'],
    },
    {
      prompt: 'Was a human override needed?',
      answer: `No. Override rate today is 0.8%. This decision had explainability score 94.2% and confidence 0.93 — well within the auto-decide band. GDPR Art.22 human-override is one click in the agent desktop if needed.`,
      citations: ['gold.decision_lineage', 'gold.policy_registry'],
    },
  ],
  'dig-voc-theme-drift': [
    {
      prompt: 'What theme is drifting?',
      answer: `voc_classifier_v3.1 detected "5G coverage Manchester" volume +28% in 6h. AI_SUMMARIZE clustered the verbatims into three sub-themes: M14 dropped calls 38%, 5G slow indoors 32%, billing app 18% (unrelated). Forecast: app-store 4.6 → 4.2 within 48h, NPS detractor +1.4pp if untreated.`,
      citations: ['gold.review_corpus', 'gold.cc_chats', 'gold.social_mentions'],
    },
    {
      prompt: 'How did we intercept the cohort?',
      answer: `18,400 affected customers received an in-app intercept survey + Cortex Agent dynamic FAQ. 8,940 sessions deflected by FAQ alone. NOC fix-window (engineering ETA) was surfaced inside the FAQ. Sentiment recovered +0.21 within 6h.`,
      citations: ['gold.cc_chats', 'gold.review_corpus'],
    },
    {
      prompt: 'Did the App Store rating slip?',
      answer: `No — held at 4.6. Theme volume normalised within 12h. NPS detractor delta was 0.0pp (we held the line). GDPR Art.6 lawful-basis logged for the in-app survey.`,
      citations: ['gold.review_corpus', 'gold.decision_lineage'],
    },
  ],
  'dig-experiment-rollout': [
    {
      prompt: 'What is the Bayesian read?',
      answer: `5G Hero campaign A/B at 50% ramp. Posterior mean uplift +6.4pp · P(uplift > 0) = 98.8% · ROPE [-2pp, +2pp] excluded. Significance achieved (p=0.012). Decision: ramp 50 → 100% with 5% holdout retained.`,
      citations: ['gold.experiment_assignments', 'gold.experiment_outcomes'],
    },
    {
      prompt: 'Did any guardrail breach?',
      answer: `Zero breaches. Complaint rate −0.2pp on treatment vs control · margin floor preserved · vulnerability suppressed · brand-safety clean. Daily significance test continues passing.`,
      citations: ['gold.experiment_outcomes', 'gold.holdout_register'],
    },
    {
      prompt: 'Was there an audience-overlap conflict?',
      answer: `No. Conflict matrix shows 5G Hero vs Disney+ family attach overlap is 18% (below 60% mutual-exclusion threshold) and they target different propensities. Both can run concurrently.`,
      citations: ['gold.experiment_assignments'],
    },
  ],
  'dig-martech-sync-lag': [
    {
      prompt: 'Why did sync lag spike?',
      answer: `5G Hero campaign launch fired 232k events/min into Salesforce MC, but MC's API rate limit is ~184k/min. Excess hit the 412 throttle response. Lag P95 went 92s → 248s. Detected by audience_sync_v3 anomaly model.`,
      citations: ['gold.audience_sync_log', 'gold.webhook_events'],
    },
    {
      prompt: 'How did we throttle?',
      answer: `Outbound auto-throttled to 184k/min (just under MC API ceiling). Excess events spooled in retry queue (peaked at 48k). Zero sends dropped. Auto back-off + retry restored steady state.`,
      citations: ['gold.audience_sync_log'],
    },
    {
      prompt: 'How fast did we recover?',
      answer: `MC API recovered after the 4-min ingest burn-down. Retry queue drained in 2:48. Lag P95 back to 38s within 6 minutes of detection. Zero send failures, zero campaign sends missed.`,
      citations: ['gold.audience_sync_log', 'gold.webhook_events'],
    },
  ],
  'dig-price-test': [
    {
      prompt: 'What does the price A/B say?',
      answer: `SnowFlex 30GB at £18 vs £20, 14 days in-market. Attach: £18 arm 22.4% vs £20 arm 18.2%. Uplift +4.2pp · p=0.006 · winner £18. Revenue per attempt £4.03 vs £3.64 — £18 is also revenue-positive after the price cut.`,
      citations: ['gold.price_test_register', 'gold.tariff_elasticity'],
    },
    {
      prompt: 'Are we above the margin floor?',
      answer: `Yes. £18 arm runs at 31.4% margin, well above the 28% policy floor. Forecast: +£42k/mo revenue at the +4.2pp attach uplift. Catalog v126 published via TMF 620 with the new price.`,
      citations: ['gold.tariff_elasticity', 'gold.policy_registry'],
    },
    {
      prompt: 'How does competitor parity look?',
      answer: `At parity. Your price £18 vs Competitor A £20, B £19, C £18. We re-test in 90 days or when a competitor moves >£2.`,
      citations: ['gold.competitor_ads', 'gold.price_test_register'],
    },
  ],
  'dig-selfservice-kb-gap': [
    {
      prompt: 'What KB gap was detected?',
      answer: `containment_v2.3 spotted 612 unanswered "esim transfer iPhone" hits in 24h with no matching KB article. Drill: 412 from new iPhone 16 owners and 200 from Android-to-iPhone migrants. Forecast: deflection +4pp if the KB + in-app journey ship.`,
      citations: ['gold.kb_hits', 'gold.cc_chats'],
    },
    {
      prompt: 'How did we draft the article?',
      answer: `Cortex Complete drafted KB-2026-1842 from the Top-3 carrier docs + internal eSIM playbook. UX shipped a 4-step in-app guided journey. Search index re-built within 90 minutes. KB hit-rate on the query +14pp.`,
      citations: ['gold.kb_hits', 'gold.decision_lineage'],
    },
    {
      prompt: 'What is the containment lift?',
      answer: `Containment +4pp on the affected query · FCR +2pp overall (because the deflected hits were correctly resolved, not just deflected). 412 of 612 follow-up sessions resolved without an agent. Zero escalation surge.`,
      citations: ['gold.kb_hits', 'gold.cc_chats'],
    },
  ],
  'dig-privacy-dsar-surge': [
    {
      prompt: 'Why did DSARs spike?',
      answer: `External press cycle on UK telco data practices drove +18% brand search and a 4× spike in DSAR submissions (24 in 4h vs baseline 6). 5 cases were already >5d old, putting the ICO 1-month SLA at risk.`,
      citations: ['gold.dsar_register', 'gold.consent_register'],
    },
    {
      prompt: 'How did we triage?',
      answer: `Auto-extract via gold.consent_register for 14 cases · evidence packs generated · DPO + Legal paged with a 24h triage SLA. 12 closed within 48h, 6 in evidence-pending state. Vulnerability flags cross-checked — 2 cases re-routed to specialist queue.`,
      citations: ['gold.dsar_register', 'gold.vulnerability_register'],
    },
    {
      prompt: 'Are we ICO-compliant?',
      answer: `Yes. Zero ICO breaches. Queue back to 8 cases at avg age 1.6d. Regulator-ready audit trail in gold.dsar_register. GDPR Art.15 (subject access) + Art.17 (erasure) responses logged with the data extract evidence.`,
      citations: ['gold.dsar_register', 'gold.decision_lineage'],
    },
  ],
  'dig-forecast-surge': [
    {
      prompt: 'What is driving the surge?',
      answer: `volume_forecast_v3 attributes today 12-17 +148% to: 5G Hero campaign launch +1.2k chats, NOC M14 incident +800 chats, seasonality −400. Net forecast: 6,000 chats vs baseline 4,400.`,
      citations: ['gold.cc_chats', 'gold.network_alarm_stream'],
    },
    {
      prompt: 'What is the WFM gap?',
      answer: `+18 FTE needed Mon-Fri 12-17. Plan: borrow 18 voice agents (acceptable; voice volume is below baseline today), open the overflow chat queue, pre-warm Cortex Agent capacity +30%.`,
      citations: ['gold.wfm_roster', 'gold.cc_chats'],
    },
    {
      prompt: 'How did we hold SLA?',
      answer: `P95 wait held at 1:42 against the 2:00 SLA. Zero queue overflow. Zero abandoned chats. MAPE on the day was 5.8% — forecast within target.`,
      citations: ['gold.cc_chats', 'gold.wfm_roster'],
    },
  ],
  'dig-identity-sim-swap': [
    {
      prompt: 'Why was this flagged?',
      answer: `Login attempt on CUST-9824 (CLV £1.4k). ato_risk_v2.4 returned 0.94. Geo-velocity: Coventry → Lisbon in 14 minutes (impossible travel). Recent SIM-swap signal at the MNO partner 22 minutes prior. Pattern matches synthetic SIM-swap fraud playbook.`,
      citations: ['gold.login_events', 'gold.sim_swap_register'],
    },
    {
      prompt: 'How did we challenge?',
      answer: `Biometric + SMS step-up issued. Device fingerprint did not match registered devices. Challenge failed. BLOCKED. Account owner alerted via secondary channel (registered email + push to known device).`,
      citations: ['gold.mfa_register', 'gold.login_events'],
    },
    {
      prompt: 'Did we false-block anyone?',
      answer: `No. CUST-9824 contacted Care via the secondary channel within 8 minutes, re-authenticated via biometric on their registered device, and was re-cleared. Zero false-blocks confirmed. Stripe Radar feedback loop fed; pattern shared with industry trust ring.`,
      citations: ['gold.fraud_decisions', 'gold.sim_swap_register'],
    },
  ],

  // ─── BSS · Commerce / CRM / Revenue / Finance / Wholesale ───────────────
  'bss-catalog-publish': [
    {
      prompt: 'What is being published?',
      answer: `5G SA Unlimited Max · £42 · bundles Disney+ + Roaming Pass EU/US. Standalone selling price set, margin 41%, competitor delta +£3. Catalog v124 → v125 via TMF 620 to Amdocs CES; auto-published to Salesforce, Genesys and Retail POS.`,
      citations: ['gold.product_catalog', 'gold.rate_plans', 'gold.decision_lineage'],
    },
    {
      prompt: 'How was CAB approved?',
      answer: `Standard change template, ServiceNow CHG0013014. CAB pre-approval window Mon/Wed 02:00-04:00. Auto-approved as standard change at 02:30 publish. Audit row written.`,
      citations: ['gold.change_register', 'gold.decision_lineage'],
    },
    {
      prompt: 'Which channels picked up the change?',
      answer: `Six channels confirmed receipt within 2 minutes of publish: App, Web, Care, Voice, Retail, Self-service. TMF 620 receipts logged. Day-1 attach measured at the next bill cycle (5% A/B holdout active).`,
      citations: ['gold.product_catalog', 'gold.touchpoints'],
    },
    {
      prompt: 'Can we roll back?',
      answer: `Yes. Time-travel snapshot retained for 90 days; rollback target = catalog v124. One-click rollback re-publishes the prior version via TMF 620. Audit row written. Tested in pre-prod weekly.`,
      citations: ['gold.product_catalog', 'gold.decision_lineage'],
    },
  ],
  'bss-billing-cycle-close': [
    {
      prompt: 'How big is the cycle?',
      answer: `12.4M invoices generated this run. Cycle group CYCLE-04 (day 22-31). Pre-bill QA pass rate 99.84% with 2,184 fails (in line with the 2,400 baseline). 412 bill-gen exceptions raised; 248 auto-fixed and 164 escalated/resolved within the cycle window.`,
      citations: ['gold.billing_cycle', 'gold.pre_bill_qa', 'gold.bill_exceptions'],
    },
    {
      prompt: 'Any auto-comp cases?',
      answer: `Yes. 1,840 customers triggered Ofcom auto-comp eligibility (loss-of-service > 2 working days threshold). Compensation auto-credited at the published per-day rate; £92k total credit issued. Zero Ofcom escalations expected.`,
      citations: ['gold.bill_exceptions', 'gold.regulatory_register'],
    },
    {
      prompt: 'Where did pre-bill QA fail?',
      answer: `Top failure types: tariff-lookup miss (832 / 38%), pro-rata calc out-of-range (482), roaming TAP3 not arrived (306), discount-stacking conflict (262), tax code missing (174), promo expiry mismatch (128). All routed to the right ops team; cycle continued.`,
      citations: ['gold.pre_bill_qa', 'gold.bill_exceptions'],
    },
    {
      prompt: 'Is the cycle audit-ready?',
      answer: `Yes. Pre-bill QA pass 99.84%, 0 SLA breach, 0 unresolved exceptions, full lineage written to gold.decision_lineage. CFO daily brief auto-generated. Period-close gating moves to "ready" state.`,
      citations: ['gold.billing_cycle', 'gold.decision_lineage'],
    },
  ],
  'bss-charging-roaming': [
    {
      prompt: 'Why did the OCS event spike?',
      answer: `Live OCS detected a 4× spike in roaming MB consumption from a customer travelling EU. Forecast bill £148 vs 90-day avg £28 (5.2x). bill_shock_v2.4 flagged the customer pre-bill; OCS issued the credit-control rating event in real time.`,
      citations: ['gold.cdr_rated', 'gold.bill_shock_features'],
    },
    {
      prompt: 'Was the customer protected?',
      answer: `Yes. Roaming Pass auto-enrol fired at the OCS rating decision point — the customer was switched onto the £3/day Pass before they crossed the £40 spend threshold. Saved bill £92 vs out-of-pass rate. SMS confirmation sent in <2 seconds.`,
      citations: ['gold.cdr_rated', 'gold.roaming_pass_policy'],
    },
    {
      prompt: 'How did Roaming Pass auto-enrol fire?',
      answer: `Eligibility check at OCS: consent ✓, last push >7d ✓, margin floor ✓, no vulnerability flag. NBA model approved. Provisioning push to OCS rating engine in 184ms P95 — faster than the next CDR rate calc.`,
      citations: ['gold.roaming_pass_policy', 'gold.decision_lineage'],
    },
    {
      prompt: 'Was margin floor honored?',
      answer: `Yes. £3/day Roaming Pass holds 36% margin (above 28% policy floor). Audit row written to gold.decision_lineage with the margin attestation. CFO daily brief shows 0 margin-floor breaches across the OCS event stream.`,
      citations: ['gold.decision_lineage', 'gold.tariff_elasticity'],
    },
  ],
  'bss-dunning-recovery': [
    {
      prompt: 'How big is the dunning cohort?',
      answer: `D+30 cohort: 12,840 accounts past due. dd_retry_policy_v2 scored each on propensity-to-pay × time-to-pay. Tiered treatment: 8,420 high-prop (gentle SMS), 3,220 medium (call-back offer), 1,200 low (specialist queue). Vulnerability flags suppressed 184 cases entirely.`,
      citations: ['gold.payments', 'gold.dd_attempts', 'gold.vulnerability_register'],
    },
    {
      prompt: 'How is treatment tone chosen?',
      answer: `FCA Treating Customers Fairly: tone matches risk profile. Gentle / empathetic for first-time misses, firm-but-supportive at D+30, formal pre-court protocol at D+60+. Cortex Complete drafts the message; agent reviews high-value cases.`,
      citations: ['gold.payments', 'gold.decision_lineage'],
    },
    {
      prompt: 'Are vulnerability flags suppressing?',
      answer: `Yes. 184 vulnerability-flagged accounts in the cohort routed to specialist queue with full upsell/dunning suppression. Ofcom GC C5 evidence captured. Bereavement, financial-difficulty, and health flags all honored automatically.`,
      citations: ['gold.vulnerability_register', 'gold.decision_lineage'],
    },
    {
      prompt: 'What is the recovery rate?',
      answer: `Day-7 recovery: 64% on the high-prop tier, 38% on medium, 12% on low. Net £1.4M recovered against £4.2M past-due. ECL Stage 2 migration on the long-tail down 1.4pp vs prior cycle. DSO improved by 0.8 days.`,
      citations: ['gold.payments', 'gold.ecl_provisions'],
    },
  ],
  'bss-revenue-assurance': [
    {
      prompt: 'What leakage was detected?',
      answer: `Four signals open today: IRSF (premium-rate fraud) £18.4k on B2B-9821, Wangiri callback £420 across 4,210 customers (auto-blocked), mediation leakage £12.8k on rate-plan v124, and a SIM-box bypass £42.2k. Total exposure ~£74k, of which £42.6k recoverable.`,
      citations: ['gold.fraud_decisions', 'gold.cdr_rated'],
    },
    {
      prompt: 'How did we score it?',
      answer: `Snowpark ML anomaly model on call-pattern + tariff + geography features. Each signal carries a precision score (0.78-0.97). High-precision signals (≥0.9) auto-block; medium go to investigation; low get a watch-list flag.`,
      citations: ['gold.fraud_decisions', 'gold.decision_lineage'],
    },
    {
      prompt: 'How was IRSF blocked?',
      answer: `IRSF call pattern detected on B2B-9821 within 14 minutes of the first call. OCS-side block applied to the destination number range. Customer notified. Estimated £18.4k saved. Audit pack auto-built for partner dispute / regulator if needed.`,
      citations: ['gold.fraud_decisions', 'gold.decision_lineage'],
    },
    {
      prompt: 'How much revenue did we recover?',
      answer: `Today: £42.6k blocked + £18.4k recovered via partner dispute + £6.2k credit-back to wronged customers. 30-day rolling recovery £142k. Margin assurance: 0 over-credit issued.`,
      citations: ['gold.fraud_decisions', 'gold.refund_ledger'],
    },
  ],
  'bss-loyalty-mission': [
    {
      prompt: 'How big is the loyalty mission?',
      answer: `Spotify Premium 3-month reward · cohort 11.2M loyalty members. Tier mix: Bronze 4.2M, Silver 3.8M, Gold 2.6M, Platinum 0.6M. Eligibility filter: Silver+ tier with music-affinity ≥0.5 (Snowpark ML) → 4.8M targeted.`,
      citations: ['gold.engagement_features', 'gold.bundle_attach'],
    },
    {
      prompt: 'How were tiers scored?',
      answer: `Loyalty tier from gold.engagement_features (recency, frequency, monetary). Music-affinity score from streaming-app behaviour, content-bundle history and Cortex Search on declared interests. Top decile = Platinum (~5% of base).`,
      citations: ['gold.engagement_features'],
    },
    {
      prompt: 'How did partner provisioning work?',
      answer: `Salesforce Loyalty triggered the mission at 09:00 BST. SPCS adapter to Spotify Partner API provisioned the 3-month entitlement <1.4s P95. 41,400 redemptions in the first 60 minutes; partner ACK received on each.`,
      citations: ['gold.bundle_attach', 'gold.partner_settlements'],
    },
    {
      prompt: 'What is the day-1 ROI?',
      answer: `Engagement rate +8pp vs control. NPS lift forecast +12 vs non-members. ROI 2.1× at 30-day projection. Partner spend £842k (within budget). Platinum invite-only campaign queued for next week.`,
      citations: ['gold.engagement_features', 'gold.revenue_attribution'],
    },
  ],

  'bss-account-onboard': [
    {
      prompt: 'Walk me through the onboarding',
      answer: `GreenLeaf Group plc onboarded as enterprise tier. Hierarchy: parent + 4 BUs (UK Ltd, Eire, Logistics, Retail) = 580 lines total. 4 billing accounts created, MSA v3 attached. Credit limit £120k dual-approved (Experian risk B). Contract OPP-3812 instantiated, 580 lines provisioned via TMF 622, order shell created. Audit to gold.accounts + gold.account_hierarchy + gold.credit_register.`,
      citations: ['gold.accounts', 'gold.account_hierarchy', 'gold.credit_register'],
    },
    {
      prompt: 'How was credit limit decided?',
      answer: `Experian bureau pull returned risk B. account_segmenter_v3 + payment-history features set the proposed limit at £120k against £42.4k/mo forecast spend. Dual-control approval (Sales VP + CFO delegate) auto-collected via DocuSign. Limit attached to all 4 billing accounts. Audit row in gold.credit_register.`,
      citations: ['gold.credit_register', 'gold.accounts'],
    },
    {
      prompt: 'How big is the hierarchy?',
      answer: `Parent GreenLeaf Group plc → 4 business units. UK Ltd 240 lines (£18.4k/mo), Eire 92 lines (£8.4k/mo), Logistics 184 lines (£12.2k/mo), Retail 64 lines (£3.4k/mo). Total 580 lines, £42.4k/mo. Invoice consolidation at parent level; statements per BU.`,
      citations: ['gold.account_hierarchy', 'gold.accounts'],
    },
  ],
  'bss-case-sla-breach': [
    {
      prompt: 'Why was the SLA at risk?',
      answer: `5G Hero campaign launch drove a +148% spike in billing-query cases over 4 hours. 42 P1/P2 cases were within 2-4h of their SLA breach. case_triage_v2.4 detected the queue overload anomaly. Driver clustered to 28 billing-query duplicates and 14 mixed.`,
      citations: ['gold.cases', 'gold.sla_register'],
    },
    {
      prompt: 'How did AI triage help?',
      answer: `Cortex AI_CLASSIFY identified 28 of 42 cases as duplicates of the same root cause (campaign FAQ). Auto-merged into 1 case + KB shortcut. 14 reassigned from voice to billing specialists (workforce borrow). MTTR on the cohort dropped from 4:12 baseline to 1:48.`,
      citations: ['gold.cases', 'gold.case_routing_rules'],
    },
    {
      prompt: 'Did anyone breach SLA?',
      answer: `Zero P1 breach. Zero P2 breach. Queue normalised in 38 minutes. 0 customer-visible duplicates. CSAT prediction held at 0.86. Audit trail to gold.cases + gold.sla_register + gold.decision_lineage.`,
      citations: ['gold.sla_register', 'gold.decision_lineage'],
    },
  ],
  'bss-interaction-stitch': [
    {
      prompt: 'What channels did CUST-001 use?',
      answer: `Five channels in 4 hours: app session (M14 5G complaint), chat, voice, email follow-up, retail walk-in. Topic clustering: 3 channels on M14 5G, 1 billing query, 1 plan-upgrade interest. identity_resolution_v3 stitched all five to the same persistent_id at 0.97 confidence.`,
      citations: ['gold.interactions', 'gold.identity_graph', 'gold.touchpoints'],
    },
    {
      prompt: 'Why suppress the NBA?',
      answer: `Customer is already in heavy contact (5 channels in 4h on the same root issue). Triggering an outbound NBA would compound fatigue. Policy auto-suppresses NBAs for 24h on customers with cross-channel velocity > 4. Care brief built, NOC fix-window auto-linked. Resolved in next session at 0.84 CSAT prediction.`,
      citations: ['gold.decision_lineage', 'gold.interactions'],
    },
    {
      prompt: 'How was case fatigue avoided?',
      answer: `3 duplicate cases auto-merged into 1 unified case once stitch confidence cleared 0.95. NBA suppressed. Agent desktop briefed with the cross-channel timeline. Customer never repeated themselves. Audit trail to gold.interactions + gold.decision_lineage. GDPR Art.6 lawful-basis logged.`,
      citations: ['gold.interactions', 'gold.decision_lineage'],
    },
  ],
  'bss-renewal-window': [
    {
      prompt: 'Why is GreenLeaf at risk?',
      answer: `OPP-3812 enters 30-day renewal window with renewal_propensity_v2 churn 0.62. Drivers: usage −18% QoQ, 4 open billing complaints, competitor RFP detected via Cortex Search on procurement portal mentions. CLV at risk £1.5M.`,
      citations: ['gold.contracts', 'gold.renewal_register'],
    },
    {
      prompt: 'What is the save plan?',
      answer: `Cortex Agent drafted: price-match (margin floor 28% holds at 31%), upgrade to 24/7 SLA, Disney+ for executives. Routed to enterprise save desk. CFO sign-off requested for SLA upgrade. Save plan accepted in 4 days; 36-month renewal at £420k/yr.`,
      citations: ['gold.contracts', 'gold.opportunities_crm'],
    },
    {
      prompt: 'How much CLV was protected?',
      answer: `£1.5M CLV protected across 36-month renewal. Churn risk dropped 0.62 → 0.18. Margin held at 31% (above 28% floor). Audit trail to gold.contracts + gold.renewal_register with CFO sign-off log.`,
      citations: ['gold.contracts', 'gold.renewal_register'],
    },
  ],
  'bss-sub-plan-change': [
    {
      prompt: 'What does the customer have now?',
      answer: `CUST-001 four active services post-change: 5G Hero · Unlimited Max (mobile, live since 2026-05-15), Roaming Pass EU (add-on), Disney+ via SnowTelco (bundle), Apple Watch eSIM (service). MSISDN and eSIM profile preserved across the change.`,
      citations: ['gold.subscriptions', 'gold.services'],
    },
    {
      prompt: 'How does pro-rata work?',
      answer: `Old plan paid through to D-1; pro-rata credit £14.20 applied to current cycle. New plan £42/mo from D+1. Catalog v126 entitlement provisioned via SPCS, P95 1.4s. Welcome email + push fired automatically.`,
      citations: ['gold.subscriptions', 'gold.billing_cycle'],
    },
    {
      prompt: 'What is the ARPU change?',
      answer: `+£12/mo per converter on this plan. Across the broader 5G Hero campaign cohort, ARPU lift forecast +£1.6/mo per converter, run-rate ~£44k/mo gross / £26k/mo net of offer cost. Audit trail to gold.subscriptions + gold.services.`,
      citations: ['gold.subscriptions', 'gold.revenue_attribution'],
    },
  ],
  'bss-mediation-suspense-spike': [
    {
      prompt: 'What caused the spike?',
      answer: `Vodafone DE TAP3 inbound feed had a column rename (schema drift). 92% of the new suspense in the 4-minute spike was from this partner. Suspense queue went from 412 → 6,400. mediation_anomaly_v3 fired critical.`,
      citations: ['gold.mediation_events', 'gold.suspense_register'],
    },
    {
      prompt: 'How did we recover?',
      answer: `Mediation rule v124 auto-deployed (schema patch). Replay started against the suspense queue. 6,400 → 412 in 2 minutes. 0 SLA breach, 0 dedupe regressions. Partner ops notified via webhook. Late-event % held at 0.02%.`,
      citations: ['gold.mediation_events', 'gold.suspense_register'],
    },
    {
      prompt: 'Did SLA breach?',
      answer: `No. P95 mediation latency held at 184ms throughout (SLA 500ms). 0 late events beyond 24h. Suspense back to baseline 412. Audit row written to gold.mediation_events + gold.suspense_register with rule version v124.`,
      citations: ['gold.mediation_events'],
    },
  ],
  'bss-bill-run-cycle04': [
    {
      prompt: 'How big is the cycle?',
      answer: `CYCLE-04 month-end. 13.8M bill rows. ETA 14:42, day 22 of 31. Pre-bill QA pass rate 99.84% (2,184 fails of 13.8M, expected 2,400 baseline). 412 bill-gen exceptions raised; 248 auto-fixed, 164 escalated and resolved.`,
      citations: ['gold.billing_cycle', 'gold.pre_bill_qa'],
    },
    {
      prompt: 'What was the QA pass rate?',
      answer: `99.84%. Top failure type: tariff-lookup miss (832 fails / 38%). Auto-routed to tariff team via runbook BR-TFM-118. Other top failures: pro-rata calc out-of-range (482), roaming TAP3 not arrived (306), discount-stacking conflict (262). All cleared inside the cycle window.`,
      citations: ['gold.pre_bill_qa', 'gold.bill_exceptions'],
    },
    {
      prompt: 'Any anomaly customers?',
      answer: `Top high-bill anomaly: ACC-7401 +133% vs prior cycle (£42.4k vs £18.2k); auto-flagged for revenue assurance. Two more SME accounts at +204% and +133%; both verified as legitimate device-financing additions. Audit trail to gold.billing_cycle + gold.bill_exceptions.`,
      citations: ['gold.bill_exceptions', 'gold.billing_cycle'],
    },
  ],
  'bss-port-in-burst': [
    {
      prompt: 'Why the port-in spike?',
      answer: `Competitor outage drove 240 port-in requests in 1 hour vs baseline 38. Donor mix: 184 EE, 38 Three, 18 Vodafone, 0 O2. Likely a mass-PAC issuance event from a competitor incident page.`,
      citations: ['gold.port_register', 'gold.pac_codes'],
    },
    {
      prompt: 'Did we hold Ofcom SLA?',
      answer: `Yes. 99.6% MNP success rate (Ofcom target 99%). Cutovers scheduled across the next 18 hours, all within the Ofcom 1-day SLA. Zero SLA breaches across the burst. Audit trail to gold.port_register and gold.pac_codes.`,
      citations: ['gold.port_register', 'gold.pac_codes'],
    },
    {
      prompt: 'What is the ARPU impact?',
      answer: `240 ports landed; ARPU forecast +£4.8k/mo run-rate. NPS lift on the cohort (acquisition-driven NPS bump). Day-1 cutover complete: 232 successful, 8 cleared after evidence. Mass-port event captured cleanly.`,
      citations: ['gold.port_register', 'gold.revenue_attribution'],
    },
  ],
  'bss-quote-b2b-fast-track': [
    {
      prompt: 'Why was this quote fast-tracked?',
      answer: `Brookfield Logistics quote (184 lines, £184k/yr). quote_win_propensity_v2 returned 0.88. Account ARPU history strong, no open complaints, sales-rep Tier-1. Fast-track route applies: single SE review + auto-collected dual sign-off (Sales VP + CFO delegate).`,
      citations: ['gold.quotes', 'gold.opportunities'],
    },
    {
      prompt: 'Was margin floor held?',
      answer: `Yes. Auto-pricing engine: standard discounts + Tier-1 SLA, margin landed at 31.4% against 28% floor. Auto-pricing wrote audit row to gold.price_test_register with the discount stack and rationale.`,
      citations: ['gold.quotes', 'gold.price_test_register'],
    },
    {
      prompt: 'How fast was Q→O?',
      answer: `4 hours from quote send to customer signature, vs 7-day baseline. DocuSign live, customer signed in 4h, order placed, TMF 622 order-to-activate kicked off, 184 lines provisioned. Audit trail to gold.quotes + gold.opportunities + gold.contracts.`,
      citations: ['gold.quotes', 'gold.contracts'],
    },
  ],
  'bss-dispute-bill-shock': [
    {
      prompt: 'What caused the dispute wave?',
      answer: `Bill-shock from EU roaming. 240 disputes opened in 6 hours. dispute_triage_v2.1 confidence 0.92, classified 192 as clear refund-eligible, 48 needing dual-control review. Driver: cohort travelled to ES/IT without Roaming Pass enrolled.`,
      citations: ['gold.disputes', 'gold.adjustments'],
    },
    {
      prompt: 'How did AI triage route them?',
      answer: `192 auto-routed to refund flow (within margin floor, average £42 per case). 48 routed to dual-control queue (higher value or unusual pattern). Refund total £8,064. 0 dual-control breaches. Ofcom auto-comp eligibility tracked.`,
      citations: ['gold.disputes', 'gold.refund_ledger'],
    },
    {
      prompt: 'What was the refund total?',
      answer: `£8,064 across 192 auto-refunds plus the 48 reviewed cases (most also refunded after dual-control). MTTR 6 hours vs 8-day SLA. CSAT lift on cohort +0.18. Backlog cleared in 24h. Full ledger auditable in gold.refund_ledger.`,
      citations: ['gold.refund_ledger', 'gold.adjustments'],
    },
  ],
  'bss-revrec-quarter-close': [
    {
      prompt: 'What was recognised this quarter?',
      answer: `£42.6M recognised. Allocation engine (revrec_allocation_v3, MAPE 1.4%) applied standalone selling prices to the 14.2M open performance obligations. Contract assets dropped £1.2M. Capitalised commissions amortised on a straight-line basis over 36 months.`,
      citations: ['gold.revrec_obligations', 'gold.deferred_revenue'],
    },
    {
      prompt: 'What is the deferred balance?',
      answer: `Q-open £184M, Q-close £181.6M (drop of £2.4M, in line with maturity). MRR £142M, ARR £1.7B run-rate. New obligations +£42M from this quarter's contract starts; modifications −£1.8M.`,
      citations: ['gold.deferred_revenue', 'gold.revrec_obligations'],
    },
    {
      prompt: 'Is the audit pack ready?',
      answer: `Yes. Period locked. Audit pack v3 generated, external auditor link issued. Disclosures auto-built per IFRS 15 / ASC 606 (performance obligations identified, SSPs allocated, deferred-revenue calc reviewed, capitalised commissions amortised, modifications reviewed). CFO sign-off requested.`,
      citations: ['gold.revrec_obligations', 'gold.contracts'],
    },
  ],
  'bss-vat-mtd-submit': [
    {
      prompt: 'How big was the VAT return?',
      answer: `£18.4M owed for Q4. 184M bill lines aggregated into VAT100 form. Pre-submission QA: 100% line-coverage, 0 unmapped tax codes, MTD digital link verified. CFO signed; submitted via HMRC MTD API.`,
      citations: ['gold.tax_ledger', 'gold.regulatory_register'],
    },
    {
      prompt: 'Did HMRC accept it?',
      answer: `Yes. HMRC ACK received with receipt VAT100-2026-Q4-184k. 0 errors, no follow-up required. Payment scheduled BACS D+1. Audit trail to gold.tax_ledger + gold.regulatory_register, retained for 4 years per HMRC.`,
      citations: ['gold.regulatory_register', 'gold.tax_ledger'],
    },
    {
      prompt: 'When does payment go?',
      answer: `BACS payment scheduled D+1 from CFO signature. £18.4M out of operating account. Cash-flow impact pre-modeled in the bill-cycle close. Audit row in gold.regulatory_register with payment confirmation hash.`,
      citations: ['gold.regulatory_register'],
    },
  ],
  'bss-gl-period-close': [
    {
      prompt: 'How many journals posted?',
      answer: `184k journals posted to SAP S/4HANA. Daily streaming push; the period-close batch added the closing accruals. 12 of 14 open exceptions auto-cleared as timing differences; 2 escalated to controller and resolved within the close window.`,
      citations: ['gold.gl_journals', 'gold.recon_exceptions'],
    },
    {
      prompt: 'Did recon match?',
      answer: `Yes. Recon match 99.86% (target ≥ 99.5%). Top variance: 600-Tax · VAT +13.6% MoM (driven by promotions, attested by tax team). All variances reviewed and signed off. Trial balance reconciles to source.`,
      citations: ['gold.recon_exceptions', 'gold.gl_journals'],
    },
    {
      prompt: 'Any control breaches?',
      answer: `Zero. Period locked, audit-ready. SOX controls evidence captured automatically. Period-close gating (gold.period_close) reflects "ready" state across all groups. CFO daily brief generated.`,
      citations: ['gold.period_close', 'gold.gl_journals'],
    },
  ],
  'bss-wholesale-month-close': [
    {
      prompt: 'How big is the settlement?',
      answer: `Net +£8.2M favourable across 14 MVNO partners and 1.84M wholesale subs. wholesale_settlement_v2 reconciled to 99.4%. 4 small exceptions (FX-rate, late events) auto-cleared in tolerance.`,
      citations: ['gold.partner_settlements', 'gold.wholesale_contracts'],
    },
    {
      prompt: 'Were partners in tolerance?',
      answer: `All 14 partners in tolerance. Top: GiffGaff Power MVNO (420k subs, £8.4M/mo), Voxi Light (380k, £6.2M/mo). One SLA warning (iD Mobile reseller) self-cleared; Lebara wholesale dispute opened (age 0.4d, auto-routed to wholesale ops).`,
      citations: ['gold.wholesale_contracts', 'gold.partner_traffic'],
    },
    {
      prompt: 'How did partners get statements?',
      answer: `SFTP delivery to each partner's tenant. 0 partner SLA breach on statement delivery. Settlement amounts auto-posted to gold.partner_settlements with partner-readable PDF + machine-readable JSON.`,
      citations: ['gold.partner_settlements'],
    },
  ],
  'bss-settlement-spain': [
    {
      prompt: 'What was the mismatch?',
      answer: `Telefónica ES TAP3 inbound mismatch of £42k. tap3_reconcile_v2.4 anomaly. Source: 1,420 records with rounded vs precise tariff disagreement (€0.018/min difference) — partner pushed a tariff-schedule update we hadn't ingested.`,
      citations: ['gold.tap3_reconcile', 'gold.partner_settlements'],
    },
    {
      prompt: 'How was it reconciled?',
      answer: `Partner schedule v3 auto-patched into our schema. 1,420 records re-rated. Dispute SET-2026-184 opened with evidence pack. Telefónica ES auto-acknowledged; resolved in 3 days favourable to us.`,
      citations: ['gold.tap3_reconcile', 'gold.partner_settlements'],
    },
    {
      prompt: 'What was recovered?',
      answer: `£42k recovered. 0 settlement SLA breach. Audit trail to gold.tap3_reconcile and gold.partner_settlements with the schedule version that triggered the patch.`,
      citations: ['gold.tap3_reconcile'],
    },
  ],
  'bss-promo-stacking-conflict': [
    {
      prompt: 'What was the conflict?',
      answer: `1,840 customers eligible simultaneously for the 5G Hero £5 first-month credit and the Disney+ trial reminder. Stacking policy v3 says only 1 commercial offer per customer per 7 days.`,
      citations: ['gold.promotions', 'gold.promo_eligibility'],
    },
    {
      prompt: 'How was it resolved?',
      answer: `promo_stacking_v3 ranked by expected value. 5G Hero won (higher EV). Disney+ reminder suppressed for these 1,840 and re-queued for D+8. 184 fraud-on-promo attempts were blocked separately. 0 customer-visible duplicates.`,
      citations: ['gold.promo_eligibility', 'gold.decision_lineage'],
    },
    {
      prompt: 'Did NBA respect it?',
      answer: `Yes. The NBA model reads gold.promo_eligibility before ranking. 0 stacking violations across the 1,840 affected customers. Audit trail to gold.decision_lineage with the rule version that fired.`,
      citations: ['gold.promo_eligibility', 'gold.decision_lineage'],
    },
  ],

  // ─── BSS Tier-1 ML answers ─────────────────────────────────────────────
  'bss-bill-shock-prevent': [
    {
      prompt: 'How big is the at-risk cohort?',
      answer: `bill_shock_v2.4 forecast 18,420 at-risk customers over the next 14 days. Severity split: 412 severe (>5x avg bill), 2,840 moderate (2-5x), 15,168 mild. Top driver is travel pattern combined with no Roaming Pass enrolment.`,
      citations: ['gold.bill_shock_features'],
    },
    {
      prompt: 'How did we treat them?',
      answer: `Tiered intervention. Salesforce MC dispatched 14,180 Roaming Pass auto-pushes (the deterministic auto-treat tier), 2,840 soft-cap nudges, and 412 pre-bill SMS for the severe tier. 8,940 customers enrolled across the wave. Margin floor and frequency cap honored throughout.`,
      citations: ['gold.bill_shock_features', 'gold.decision_lineage'],
    },
    {
      prompt: 'How much bill-shock did we avoid?',
      answer: `Forecast 12,400 bill-shock cases avoided out of the 18.4k cohort. Revenue impact +£42k/wk run-rate (avoided bill-write-offs and Ofcom auto-comp). CSAT lift +0.18 on the cohort.`,
      citations: ['gold.bill_shock_features', 'gold.billing_cycle'],
    },
  ],
  'bss-ecl-period-close': [
    {
      prompt: 'What is the ECL provision?',
      answer: `Q-close ECL £24.4M (+£0.8M MoM). Bayesian survival model bad_debt_ecl_v3, IFRS 9 Stage 1 / 2 / 3 structure. Movement: +£1.84M new Stage 1, +£2.24M Stage 1→2, +£1.08M Stage 2→3, −£3.16M recoveries+writeoffs.`,
      citations: ['gold.ecl_provisions'],
    },
    {
      prompt: 'How does the Stage 1/2/3 split look?',
      answer: `Stage 1 (12-month ECL) £18.2M, Stage 2 (lifetime ECL) £4.8M, Stage 3 (credit-impaired) £1.4M. Stage 1→2 migration ratio 1.4% on the period (in line with prior quarter; no concerning trend).`,
      citations: ['gold.ecl_provisions', 'gold.payments'],
    },
    {
      prompt: 'Are we audit-ready?',
      answer: `Yes. Auditor pack v3 generated with the IFRS 9 disclosure paragraph, Stage 1/2/3 movement table, and macro-overlay assumption (base case). External auditor link issued; CFO sign-off requested. SOX evidence captured automatically.`,
      citations: ['gold.ecl_provisions', 'gold.period_close'],
    },
  ],
  'bss-fallout-prevented': [
    {
      prompt: 'How many orders were at risk?',
      answer: `412 of 14,820 in-flight orders flagged at risk by order_fallout_v2.1 (propensity ≥ 0.6). Top drivers: PAC mismatch (132), credit hold (92), tariff lookup (74), address validation (58), device IMEI (28), network capacity (28).`,
      citations: ['gold.order_fallout_features'],
    },
    {
      prompt: 'How did we auto-remediate?',
      answer: `248 auto-remediated: PAC auto-resend, catalog refresh v124→v126, pre-filled address picker, KYC step-up. 164 routed to ops queue with reason context attached so triage takes <40 min instead of 4h. Remediated orders converting at 92%.`,
      citations: ['gold.order_fallout_features', 'gold.decision_lineage'],
    },
    {
      prompt: 'How much revenue did we save?',
      answer: `Saved revenue forecast £184k (preserved activation revenue from the 248 auto-remediated orders + most of the 164 ops-queue ones). Fallout rate drops to 2.8% vs 4.6% baseline. Zero SLA breaches in O2A across the burst.`,
      citations: ['gold.order_fallout_features', 'gold.billing_cycle'],
    },
  ],
  'bss-cross-sell-fired': [
    {
      prompt: 'How big is the eligible cohort?',
      answer: `1.84M customers eligible after cross_sell_propensity_v2 ranking. Top NB-product distribution: 38% Disney+, 22% Roaming Pass auto-enrol, 18% 5G Hero upgrade, 12% Apple Watch eSIM, 10% family bundle.`,
      citations: ['gold.cross_sell_features'],
    },
    {
      prompt: 'What is the top recommendation?',
      answer: `Disney+ family attach is the top NB-product across the cohort (38% of recommendations). Wave dispatched via Salesforce MC + in-app modal for 1.6M (after suppression). Day-3: 12,400 Disney+ attaches plus 6,400 Roaming Pass enrolments.`,
      citations: ['gold.cross_sell_features', 'gold.bundle_attach'],
    },
    {
      prompt: 'How much ARPU lift did we get?',
      answer: `+£0.42/mo per converter average. On 12.4k attaches that's ~£5.2k/mo additional ARPU run-rate (Disney+ rev-share already excluded from this number). Entitlement provisioned <1.4s P95 via SPCS. Zero customer-visible duplicates.`,
      citations: ['gold.cross_sell_features', 'gold.revenue_attribution'],
    },
  ],
  'bss-explain-bill-spike': [
    {
      prompt: 'Why did ACC-7401 spike?',
      answer: `ACC-7401 (GreenLeaf Group plc) is +133% vs prior cycle. Bill-line breakdown: 14 days EU roaming (£18.4k, no Roaming Pass enrolled), 3 international long-form calls (£420), 1 device-finance addition for the new Logistics BU (£1.2k). Cortex Complete (bill_explainer_v1.4) authored the explanation.`,
      citations: ['gold.decision_lineage'],
    },
    {
      prompt: 'Is the spend legitimate?',
      answer: `Yes. Procurement-driven travel + new BU device-finance is fully consistent with account history. This is not a billing error — it is a legitimate spend pattern. No fraud signals. Audit row written to gold.decision_lineage with the explainer prompt and the model version.`,
      citations: ['gold.decision_lineage'],
    },
    {
      prompt: 'What is the recommended action?',
      answer: `Two-step. (1) Goodwill: offer Roaming Pass back-credit £4.2k (margin floor 31% holds, above 28% policy). (2) Structural: enrol the 240 UK lines on auto-Roaming Pass to prevent recurrence. Retention specialist call scheduled. CFO sign-off not required.`,
      citations: ['gold.decision_lineage', 'gold.bill_shock_features'],
    },
  ],
};

// Backwards-compat helpers (some places still import these names) — keep them
// pointing at the manchester pool so nothing breaks.
export const cicAnswers: CicQa[] = scenarioAnswers.manchester;
export const suggestedPrompts: string[] = scenarioPrompts.manchester;

// ─── Resolver ────────────────────────────────────────────────────────────────
// Find the best answer for a query, scoped to the active scenario.
export function findAnswer(query: string, scenarioId: string = 'manchester'): CicQa | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const pool = scenarioAnswers[scenarioId] ?? scenarioAnswers.manchester;
  // 1) Exact prompt match within the active scenario
  for (const a of pool) if (a.prompt.toLowerCase() === q) return a;
  // 2) Substring/keyword match within the active scenario (rough but bounded)
  for (const a of pool) {
    const tokens = a.prompt.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
    if (tokens.some((t) => q.includes(t))) return a;
  }
  // 3) Fall back to the scenario's first canned answer (intro flavour)
  return pool[0] ?? null;
}
