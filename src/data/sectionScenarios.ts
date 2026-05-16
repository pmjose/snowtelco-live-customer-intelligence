// Per-section scenario catalog. One source of truth.
// Each scenario belongs to exactly one section and only runs while the user
// is on that section's pages — leaving the section stops and resets the run.

import type { SeqEvent } from './nocSequence';
import { manchesterScript, liverpoolScript, leedsScript, londonHssScript, simSwapScript, roamingPartnerScript, massSimSwapScript, towerMainsScript } from './nocSequence';
import type { PresenterScript } from './presenterScripts';
import { presenterScripts } from './presenterScripts';

export type SectionId = 'cic' | 'digital' | 'bss' | 'oss' | 'noc';

export interface SectionScenario {
  id: string;
  sectionId: SectionId;
  title: string;
  subtitle: string;
  durationSec: number;
  events: SeqEvent[];
  presenter?: PresenterScript;
  // Optional NOC kpi targets (kept for compat with NOC visuals)
  kpiTargets?: { mttd?: number; mttr?: number; sla?: number; alarms?: number; auto?: number; conf?: number };
}

// Helper: build a small SeqEvent
const e = (atSec: number, kind: SeqEvent['kind'], text: string, category: SeqEvent['category'] = 'Decisioning', severity: SeqEvent['severity'] = 'info'): SeqEvent =>
  ({ atSec, kind, text, category, severity });

// ─── CIC scenarios (customer-facing narratives) ─────────────────────────────
const cicManchester: SectionScenario = {
  id: 'cic-manchester-churn',
  sectionId: 'cic',
  title: 'Manchester churn save · Amelia Hughes',
  subtitle: 'Network degradation drives 89 P1 customers — agent ranks, NBA, save in 7 minutes.',
  durationSec: 28,
  events: [
    { ...e(0, 'detect', 'Network anomaly Manchester M14: 7 cells, 2,417 customers impacted', 'Network', 'critical'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Snowpark ML CHURN_MODEL_UK_MOBILE_V3.2 scored cohort', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(3.5, 'log', 'Cohort: 2,417 affected · 312 high-CLV · 89 P1 churn-risk', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(5, 'hypothesize', 'Amelia Hughes (CUST-001) churn risk 42% → 82% — primary candidate', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(7, 'plan', 'Plan: rank 89 P1 by CLV × risk-reduction; offer £5 credit + 10GB boost + plan refresh', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    e(9, 'log', 'Eligibility: consent ✓ · margin floor ✓ · offer fatigue (12d) ✓ · open complaint ✗', 'Decisioning'),
    { ...e(11, 'act-care', 'Salesforce Service Cloud · push playbook PB-RT-CRED-005 to 89 customers', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    e(13, 'log', 'Salesforce MC + Sinch SMS dispatched · 76/89 acknowledged in app', 'Care'),
    { ...e(16, 'log', 'Amelia Hughes accepted £5 credit + 10GB boost via app push', 'Care', 'success'), focus: { route: '/customer/CUST-001', target: 'page' } },
    { ...e(19, 'verify', 'Cohort risk avg 79% → 47% (5-min window) · auto-rollback NOT triggered', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(23, 'log', 'narrator.draft_briefing → executive briefing filed in Snowflake', 'Decisioning'), focus: { route: '/briefing', target: 'page' } },
    { ...e(26, 'resolve', 'Save complete · 89 P1 contacted · projected churn drop −34pp · CLV protected ~£420k', 'Network', 'success'), focus: { route: '/command-center', target: 'cic-grid' } },
  ],
};

const cicBirmingham: SectionScenario = {
  id: 'cic-birmingham-billshock',
  sectionId: 'cic',
  title: 'Roaming bill-shock wave · Daniel Shah',
  subtitle: 'Post-Easter cohort: 1,840 customers travelled non-EU without Roaming Pass — bills 25%+ above baseline. National, not regional.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', 'Bill-shock cohort detected: 1,840 customers travelled non-EU at Easter without Roaming Pass · bills 25%+ above baseline', 'Billing', 'warn'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Behavioural cohort (not regional): non-EU roamers · no Roaming Pass enrol · no spend cap · usage > 2× baseline', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Cohort: 1,840 customers · 244 high-CLV · 71 P1 churn-risk', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Daniel Shah (CUST-002) re-scored 54% → 76% — cohort representative, not geographic', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: bill explanation video + £4 goodwill credit + Roaming Pass auto-enrol for cohort', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    e(10, 'log', 'Goodwill policy check: max 3 credits / 12mo · Daniel eligible (1 prior in window)', 'Decisioning'),
    { ...e(12, 'act-care', 'Salesforce Service Cloud + Genesys Cloud · outbound retention call queued for 244 high-CLV', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    e(14, 'log', 'Sinch SMS bill-explanation + Amdocs CES Roaming Pass auto-enrol for 1,840', 'Care', 'success'),
    { ...e(17, 'log', 'Daniel accepted bill explanation · enrolled in Roaming Pass (auto, 12mo)', 'Care', 'success'), focus: { route: '/customer/CUST-002', target: 'page' } },
    { ...e(20, 'verify', 'Cohort re-scored: avg 71% → 48% · 1,840 enrolled · projected churn −23pp', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(22, 'resolve', 'Bill-shock wave defused · 244 high-CLV protected · CLV saved ~£180k', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicLeeds: SectionScenario = {
  id: 'cic-leeds-snowflex',
  sectionId: 'cic',
  title: 'Competitor tariff PAC spike · Grace Williams',
  subtitle: 'Competitor mid-month tariff launch (national) triggers PAC-request spike across SnowFlex price-sensitive cohort.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'PAC-request volume +340% over 7 days · SnowFlex SIM-only price-sensitive cohort (national pattern)', 'CDR', 'warn'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Cortex Search: competitor mid-month tariff change matches signal pattern', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Cohort: 940 active PAC requests · 28 high-CLV · 38 P1 churn-risk · cohort = SnowFlex × tenure × usage, not geography', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Grace Williams (CUST-005) scored 69% — typical SnowFlex price-sensitive profile', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: NBA = ranked retention offer (extra 30GB at same price + 6mo loyalty boost)', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    e(10, 'log', 'Margin floor check: offer ROI 2.4× over 12mo CLV uplift · pre-approved', 'Decisioning'),
    { ...e(12, 'act-care', 'Salesforce Service Cloud · in-app retention modal + email for 28 high-CLV', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(14, 'log', 'Grace declined PAC continuation · accepted +30GB boost in-app', 'Care', 'success'), focus: { route: '/customer/CUST-005', target: 'page' } },
    e(16, 'log', 'Cohort save rate: 412/940 retained (44% vs 28% baseline)', 'Decisioning', 'success'),
    { ...e(19, 'verify', 'PAC spike absorbed · 412 saves · projected churn −16pp', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(21, 'resolve', 'Save campaign complete · 412 retained · CLV protected ~£94k', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicLondon: SectionScenario = {
  id: 'cic-london-5g-upgrade',
  sectionId: 'cic',
  title: 'London 5G SA upgrade · Ravi Patel',
  subtitle: '5G SA launch in E14 — propensity model surfaces 12k upgrade-ready customers.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', '5G SA coverage live in London E14 cluster · 24 cells active', 'Network'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Snowpark ML upgrade-propensity model scored 1.4M London base', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Top cohort: 12,400 5G-capable handsets on legacy plan · 320 high-CLV', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Ravi Patel (CUST-004) scored 0.78 propensity · 5G handset, heavy data user', 'Decisioning'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: NBA upgrade offer = 5G SA Unlimited Max + £5 first-month credit', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    e(10, 'log', 'Eligibility: contract end window OK · no offer fatigue · margin OK', 'Decisioning'),
    { ...e(12, 'act-care', 'Salesforce MC: in-app + push + email upgrade journey for 12,400', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    e(14, 'log', '320 high-CLV: outbound retention call (Genesys) + £5 credit pre-applied', 'Care'),
    { ...e(16, 'log', 'Ravi upgraded in-app · ARPU +£12/mo · journey time 4 min', 'Care', 'success'), focus: { route: '/customer/CUST-004', target: 'page' } },
    { ...e(19, 'verify', 'Day-1: 1,420 upgraded (11.4% conv) · ARPU lift +£15k/mo run-rate', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(22, 'resolve', '5G upgrade wave seeded · 12,400 reached · ARPU lift forecast £180k/yr', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

// ─── New CIC scenarios (cohort-led, exec-grade) ──────────────────────────────
const cic999Reachability: SectionScenario = {
  id: 'cic-999-reachability',
  sectionId: 'cic',
  title: '999 / 112 reachability sweep · Ofcom GC A3',
  subtitle: 'Post-IMS-incident reachability check across 1.42M IMS-attached subs · high-CLV + vulnerable cohorts get human callback within 60 minutes.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', 'NOC closes IMS P-CSCF P1 · 999/112 reachability requires GC A3 sweep within 30 minutes', 'Network', 'critical'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Cohort: 1.42M IMS-attached during incident window · join × gold.vulnerable_register × gold.b2b_contracts', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'High-priority cohort: 412 vulnerable + 184 B2B critical-line contracts (NHS, courts, schools)', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Reachability test: silent SMS + IMS REGISTER probe · 99.7% pass · 184 fail · agent fans out', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: human callback for 184 fails · GC A3 30-day report auto-drafted · NIS2 prep', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    { ...e(11, 'act-care', 'Genesys outbound queue: 184 calls assigned · 60-min completion target · all answered or v-mail logged', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(15, 'log', 'GC A3 30-day report drafted by Cortex Complete · counter-signed by Ofcom liaison', 'Decisioning'), focus: { route: '/customer/CUST-001', target: 'page' } },
    { ...e(19, 'verify', 'All 184 reachability fails resolved · 0 customer-visible 999 failures · GC A3 report queued', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(22, 'resolve', 'Sweep complete · 1.42M reachable · 0 GC A3 breach · NIS2 report at +6h', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicSilentChurn: SectionScenario = {
  id: 'cic-silent-churn',
  sectionId: 'cic',
  title: 'High-CLV silent churn · 1,420 quiet leavers',
  subtitle: 'No complaint, no engagement, no incident — but propensity rising sharply. The most expensive customers leave quietly. Pre-emptive save before MAC.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', '1,420 high-CLV customers (>£60 ARPU, >24mo tenure) · churn propensity drifted +28pp in last 30 days · zero complaints filed', 'Decisioning', 'warn'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Behavioural fingerprint: app sessions −42% · CDR data −24% · Disney+ unwatched · all silent signals', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Cohort: 1,420 silent-churners · avg CLV £1,840 · projected CLV-at-risk £2.6M', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Hannah Bennett (CUST-003) re-scored 22% → 78% · primary driver: disengagement with current bundle', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: NBA = bundle refresh proposal + £20 first-month credit + concierge call · pre-MAC save', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce + Genesys · proactive outbound for top 412 · in-app personalised offer for rest', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(15, 'log', 'Hannah accepted bundle refresh · ARPU −£4 but tenure +12mo locked · CLV +£640 net', 'Care', 'success'), focus: { route: '/customer/CUST-003', target: 'page' } },
    { ...e(19, 'verify', 'Cohort 412 reached · 38% accepted · projected churn save −18pp · CLV protected ~£1.4M', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(22, 'resolve', 'Silent-churn save complete · 1,420 monitored ongoing · weekly retraining queued', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicB2BAccountDrift: SectionScenario = {
  id: 'cic-b2b-account-drift',
  sectionId: 'cic',
  title: 'B2B critical account drift · top-30 enterprise',
  subtitle: 'Lloyds 280-branch account · NPS down 12pt · two open Sev-1 cases · QBR overdue. CIC surfaces drift before churn signal lands.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', 'B2B account drift: Lloyds (top-30, £14.2M ARR) · NPS slid 62 → 50 · 2 open Sev-1 · QBR overdue 14d', 'Decisioning', 'warn'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Cortex AI_AGG over case notes + survey + relationship-manager log · sentiment on "billing accuracy" −0.4', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Account: 280 lines · MRR £64k · 2 unresolved billing disputes worth £12k · contract auto-renew in 91d', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Account-Risk model scored Lloyds 0.74 · driver: dispute backlog + RM contact gap (28d)', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: clear 2 disputes (£12k goodwill) + RM exec briefing pack + QBR scheduled in 5d + service-credit gesture', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce executive escalation · CRO + RM + tech account manager assembled · briefing pack auto-drafted', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(15, 'log', 'Disputes cleared · service-credit £4.2k applied · QBR confirmed Tuesday · risk score 0.74 → 0.41', 'Care', 'success'), focus: { route: '/customer/CUST-001', target: 'page' } },
    { ...e(19, 'verify', 'NPS recovery indicator +6pt within 14d · contract retention probability 0.91', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(22, 'resolve', 'Account stabilised · £14.2M ARR protected · QBR will close in week 3', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicFamilyReactivation: SectionScenario = {
  id: 'cic-family-reactivation',
  sectionId: 'cic',
  title: 'Family-plan reactivation · save the household',
  subtitle: 'One line cancelled in a 4-line family plan · churn-correlation model says other 3 lines at +44% risk over 60 days. Save the whole household before they follow.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', '1,840 family-plan households where 1 of 4 lines cancelled in last 7 days · model predicts cohort-churn +44% in 60d', 'Decisioning', 'warn'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Cohort: 7,360 remaining lines · avg household CLV £4,200 · total CLV-at-risk £7.7M', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Driver decomposition: 38% price-driven · 22% coverage-driven · 16% device-end-of-contract · 24% mixed', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Customer 360 opened for representative household · primary account holder propensity 0.68 · spouse line 0.54', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: family-plan refresh offer (free 4th-line + Disney+ family) · personalised per driver', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce MC family-plan journey · in-app + email + concierge call for high-CLV households', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(14, 'log', '684 households accepted offer · 4th-line free for 12mo + Disney+ · ARPU −£3 / +tenure 12mo', 'Care', 'success'), focus: { route: '/customer/CUST-001', target: 'page' } },
    { ...e(17, 'verify', 'Cohort-churn risk reduced 44% → 22% · 684 households retained · CLV protected ~£2.9M', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(20, 'resolve', 'Family reactivation wave complete · 1,156 lines retained across 684 households', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicVulnerableProactive: SectionScenario = {
  id: 'cic-vulnerable-proactive',
  sectionId: 'cic',
  title: 'Vulnerable customer proactive outreach · Ofcom GC C5',
  subtitle: 'Bereavement / financial-stress / digital-exclusion flags drive CIC-led outbound · GDPR Art.6 lawful basis + Ofcom GC C5 vulnerable-customer code of practice.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', '412 customers on vulnerable register flagged as "needs-outreach": new bereavement (108) · payment-failure 2× (184) · 24-month silence (120)', 'Decisioning', 'warn'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Vulnerable register joined to gold.payment_status × gold.case_history × gold.engagement_decay', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Eligibility: GDPR Art.6(f) legitimate interest + GC C5 obligation · explicit suppression list respected', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Per-customer treatment: bereavement → bill-pause + reassignment · payment-failure → debt-advice + arrangement · silence → gentle check-in', 'Decisioning'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: human-led calls only (no automated) · trained vulnerability specialist team · 7-day SLA', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    { ...e(11, 'act-care', 'Genesys vulnerability queue · 412 outbound · trained specialist DV-cleared agents · scripts pre-approved', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(15, 'log', '108 bereavement: 38 bill-paused · 14 account reassigned · 56 declined further contact (logged)', 'Care', 'success'), focus: { route: '/customer/CUST-001', target: 'page' } },
    { ...e(18, 'verify', 'Audit: 100% calls logged · 0 GC C5 breaches · ICO ROPA updated', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(20, 'resolve', 'Outreach complete · 412 customers contacted · ICO/Ofcom audit trail in platinum.vulnerable_outreach', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

const cicRecontractWave: SectionScenario = {
  id: 'cic-recontract-wave',
  sectionId: 'cic',
  title: 'End-of-MAC re-contracting wave · 18.4k in window',
  subtitle: 'The 180-day end-of-Minimum-Term window is the highest-churn period in the lifecycle. Surface upgrade-eligible cohort + price-protected NBA before they switch.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', '18,400 customers entering 180-day end-of-MAC window in next 30 days · highest-churn period in lifecycle', 'Decisioning'), focus: { route: '/command-center', target: 'cic-incident' } },
    { ...e(2, 'observe', 'Decomposition: 4,200 5G-handset upgrade-eligible · 6,800 plan-refresh candidates · 7,400 hold-and-discount targets', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(4, 'log', 'Cohort CLV: avg £42/mo × 24mo = £1,008 each · total CLV-at-risk £18.5M', 'Decisioning'), focus: { route: '/customers', target: 'page' } },
    { ...e(6, 'hypothesize', 'Per-segment NBA: upgraders → 5G SA + £5 credit · refreshers → +20GB at same price · holders → 12mo price-lock', 'Decisioning', 'warn'), focus: { route: '/compare', target: 'page' } },
    { ...e(8, 'plan', 'Plan: pre-MAC outbound at T-30 / T-14 / T-7 · personalised channel mix · margin floor 22%', 'Decisioning'), focus: { route: '/insights', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce MC orchestration · 18,400 personalised journeys · A/B against control 0% holdout', 'Care', 'success'), focus: { route: '/approvals', target: 'page' } },
    { ...e(15, 'log', 'Day-7 results: 4,820 re-contracted (26% conv vs 18% baseline) · ARPU stable · tenure +12mo', 'Care', 'success'), focus: { route: '/customer/CUST-001', target: 'page' } },
    { ...e(19, 'verify', 'Treatment vs control: +8pp re-contract uplift · CLV +£4.4M projected', 'Decisioning', 'success'), focus: { route: '/uplift', target: 'page' } },
    { ...e(22, 'resolve', 'Re-contract wave complete · 4,820 retained · churn rate −2.4pp on cohort', 'Network', 'success'), focus: { route: '/briefing', target: 'page' } },
  ],
};

// ─── Digital scenarios ──────────────────────────────────────────────────────
const digCareChat: SectionScenario = {
  id: 'dig-care-chat-deflection',
  sectionId: 'digital',
  title: 'Care chat deflection · service-quality cohort (incident-tied)',
  subtitle: 'Cortex chat agent resolves service-quality complaints linked to live NOC incident — credit + boost, no human handoff.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Inbound chat: CUST-001 Amelia Hughes · intent=service_quality · sentiment −0.62', 'Care', 'warn'), focus: { route: '/digital/conversational', target: 'page' } },
    e(2, 'log', 'Identity verified: app biometric · last bill £38 · contract ends 21d', 'Care'),
    e(4, 'observe', 'Cortex Search: known network issue Manchester M14 · runbook NOC-MAN-M14 matched', 'Decisioning'),
    e(6, 'hypothesize', 'Customer affected by live cluster degradation · NBA = credit + boost + reassurance', 'Decisioning'),
    e(8, 'plan', 'Plan: apply £5 service credit, offer 10GB boost, schedule restoration follow-up SMS', 'Decisioning'),
    e(10, 'act-care', 'Cortex Complete generated empathetic reply with tool-calls', 'Care'),
    e(12, 'log', 'billing.apply_credit(£5) → ACK · plans.boost(10GB, 24h) → ACK', 'Billing', 'success'),
    e(14, 'log', 'comms.schedule_followup(sms, +20min) → queued via Sinch', 'Care', 'success'),
    e(16, 'log', 'Customer accepted both offers · sentiment trajectory: −0.62 → +0.41', 'Care', 'success'),
    { ...e(18, 'verify', 'Chat resolved in 2:14 · CSAT prediction 0.86 · zero human escalation', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(20, 'resolve', 'Deflection success · £15 net cost vs £42 human handle · GDPR Art.22 audited', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digVoiceSave: SectionScenario = {
  id: 'dig-voice-save-cancel',
  sectionId: 'digital',
  title: 'Voice save-the-cancel',
  subtitle: 'Genesys Cloud voice agent saves a high-CLV cancel call in 1:01 — sentiment recovery in real time.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', 'Inbound 0808 voice call · queue SAVE-MNP · CUST-003 Hannah Bennett · stated intent: cancel', 'Care', 'critical'), focus: { route: '/digital/voice', target: 'page' } },
    e(2, 'log', 'Whisper STT: "I keep getting dropped calls and I want to leave" · sentiment −0.74 · MOS 4.0', 'Care'),
    e(4, 'observe', 'Real-time NBA: known network softness in LS5 + Hannah high-CLV + retention-eligible', 'Decisioning'),
    e(6, 'plan', 'Voice agent NBA: empathy → reassurance → £5 credit + 10GB boost → save attempt', 'Decisioning'),
    e(9, 'act-care', 'Polly Neural TTS: agent explains live issue, offers credit + boost', 'Care'),
    e(12, 'log', 'Caller sentiment trajectory: −0.74 → −0.36 → +0.12 → +0.34', 'Care'),
    e(15, 'log', 'Customer agreed to "leave it for now" · cancellation NOT submitted', 'Care', 'success'),
    e(17, 'log', 'STIR/SHAKEN attestation: A · QA scorecard: empathy ✓ resolution ✓ regulator ✓', 'Care'),
    { ...e(19, 'verify', 'Save complete · AHT 1:01 vs 4:18 average · WER 3.4%', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(22, 'resolve', 'Save-the-cancel success · CLV protected ~£480 · QA pass · 0 vulnerability flags', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digEsim: SectionScenario = {
  id: 'dig-esim-activation-funnel',
  sectionId: 'digital',
  title: 'eSIM activation funnel · 18k onboarding burst',
  subtitle: 'Top app journey runs at scale — eligibility, QR install, test call, journey complete in 2:48.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'eSIM journey starts: 18,420 sessions in last 60 minutes', 'Care'), focus: { route: '/digital/journeys', target: 'page' } },
    e(2, 'log', 'Stage 1: Eligibility check · 18,420 entered · TAC capability matched', 'Decisioning'),
    e(4, 'log', 'Stage 2: QR / activation code · 16,890 progressed (drop-off 8%)', 'Decisioning'),
    e(7, 'log', 'Stage 3: Profile install (eSIM provisioning via SM-DP+) · 16,210 (drop 4%)', 'Decisioning'),
    e(10, 'log', 'Stage 4: Test call + data session · 16,038 confirmed (drop 1%)', 'Decisioning', 'success'),
    e(13, 'observe', 'Drop-off recovery: 1,250 abandoned at Stage 1-3 → agent-prompted retry queued', 'Care'),
    { ...e(15, 'act-care', 'Salesforce MC: drop-off recovery push + voice callback (Genesys) for 1,250', 'Care'), focus: { route: '/digital/channels', target: 'page' } },
    e(17, 'log', '412 of 1,250 recovered (33% drop-off recovery rate)', 'Care', 'success'),
    { ...e(19, 'verify', 'Funnel completion 87% (vs 81% baseline) · avg journey 2:48', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(21, 'resolve', '16,450 eSIMs activated · NPS lift +4pp · zero physical SIM cost', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digRoamingPush: SectionScenario = {
  id: 'dig-roaming-push',
  sectionId: 'digital',
  title: 'Roaming Pass proactive push wave',
  subtitle: '2 days before historical travel pattern — surface Roaming Pass to 4,200 customers.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Travel-pattern model: 4,200 customers likely to travel EU in 48h (booking+location signals)', 'Decisioning'), focus: { route: '/digital/journeys', target: 'page' } },
    e(2, 'observe', 'Cohort: 4,200 · 612 high-CLV · 312 already enrolled (suppress)', 'Decisioning'),
    e(4, 'log', 'Eligibility: consent ✓ · last push >7d ✓ · margin floor ✓ for 3,720', 'Decisioning'),
    e(6, 'plan', 'NBA: surface Roaming Pass EU (£3/day) in-app journey + push + email', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce MC + Sinch · push + email to 3,720 customers', 'Care', 'success'), focus: { route: '/digital/channels', target: 'page' } },
    e(11, 'log', 'In-app journey opened by 1,840 (49% open rate) · 612 enrolled', 'Care'),
    e(14, 'log', 'Auto-enrol confirmation pushes sent · 612 ready for bill-shock prevention', 'Care', 'success'),
    { ...e(16, 'verify', 'Conversion 16% · forecast bill-shock cases avoided ~480 · CSAT +0.2', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Pre-travel cohort served · 612 enrolled · ARPU lift £12.8k/wk · £2.94/customer/day', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digMarketplace: SectionScenario = {
  id: 'dig-marketplace-bundle',
  sectionId: 'digital',
  title: 'Marketplace NBA · Disney+ bundle attach',
  subtitle: 'Family-plan cohort scored for Disney+ attach via next-best-bundle ranking.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Bundle propensity model run: 24,000 family-plan customers scored for Disney+', 'Decisioning'), focus: { route: '/digital/marketplace', target: 'page' } },
    e(2, 'observe', 'Top 8,400 above 0.6 propensity · 1,200 high-CLV · 5% holdout reserved', 'Decisioning'),
    e(4, 'log', 'Margin check: rev-share with Disney = 38% net margin · ROI > offer cost', 'Decisioning'),
    e(6, 'plan', 'NBA: surface Disney+ bundle in-app + push for 7,980 (excl. holdout)', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce MC: ranked in-app modal · Snowpark Container Services adapter to Disney provisioning', 'Care'), focus: { route: '/digital/marketplace', target: 'page' } },
    e(10, 'log', '2,180 attached Disney+ (27% conv) · entitlement provisioned <1.4s P95', 'Care', 'success'),
    e(13, 'log', 'Attach rate vs holdout: +18.4pp lift · churn forecast −6.4pp on attached cohort', 'Decisioning'),
    { ...e(15, 'verify', 'Bundle wave converted · revenue +£19.6k/mo · churn delta visible day-7', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', '2,180 Disney+ attached · NBA ranking outperformed control by 18.4pp', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

// ─── New Digital scenarios ─────────────────────────────────────────────────

const digAppStoreWatch: SectionScenario = {
  id: 'dig-appstore-rating-watch',
  sectionId: 'digital',
  title: 'App-store rating intervention · UK iOS sentiment slip',
  subtitle: 'Cortex Search + AI_SUMMARIZE on review corpus catches a sentiment crash before the store rating moves.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '200-review rolling sentiment crashed +0.42 → −0.31 (last 6h on iOS UK) · review_velocity_v1 anomaly', 'Decisioning', 'critical'), focus: { route: '/digital/marketing/brand', target: 'page' } },
    e(2, 'observe', 'AI_SUMMARIZE theme clusters: "5G coverage Manchester" 28% · "billing app crash" 24% · "tariff vs competitor" 18%', 'Decisioning'),
    e(4, 'hypothesize', 'Forecast: app-store score 4.6 → 4.2 within 48h if untreated (rating_forecast_v1)', 'Decisioning', 'warn'),
    e(6, 'plan', 'Plan: in-app intercept survey for affected cohort · Cortex Agent dynamic FAQ · pre-draft App Store appeal', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce MC: 18,400 cohort matched · in-app modal queued · resolution email queued', 'Care'), focus: { route: '/digital/marketing/brand', target: 'page' } },
    e(11, 'log', 'Cortex Agent FAQ deflected 8,940 affected sessions · sentiment +0.21 in 6h', 'Care', 'success'),
    e(13, 'log', 'iOS App Store appeal pre-drafted with evidence pack (review IDs, runbook NOC-MAN-M14)', 'Care'),
    { ...e(15, 'verify', 'Store rating retained 4.6 · cohort sentiment +0.21 · survey response rate 18%', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', '+0.18 NPS · 0 store-rating slip · evidence pack to App Store team · GDPR Art.6 logged', 'Network', 'success'), focus: { route: '/digital/marketing/brand', target: 'page' } },
  ],
};

const digCheckoutAbandon: SectionScenario = {
  id: 'dig-web-checkout-abandon',
  sectionId: 'digital',
  title: 'Web checkout abandonment recovery',
  subtitle: 'Adobe Experience Platform + Stripe + SPCS — 1,820 carts abandoned at payment in 30 minutes.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '1,820 carts abandoned at payment step in last 30 min vs baseline 240 (cart_recovery_v3.0)', 'Decisioning', 'critical'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    e(2, 'observe', 'Cohort split: 760 price-match · 480 address-validation · 360 Stripe 3DS friction · 220 timeout', 'Decisioning'),
    e(4, 'hypothesize', '33% recoverable within the 30-min window if treated with the right channel (Snowpark ML)', 'Decisioning'),
    e(6, 'plan', 'Plan: price-match for 760 (within margin floor) · pre-filled address fix for 480 · alternative payment rail for 360', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce MC + Sinch SMS · ranked recovery push within 30-min window', 'Care'), focus: { route: '/digital/channels', target: 'page' } },
    e(11, 'log', 'Recovery rates: 41% SMS · 33% email · 28% push · 19% RCS rich card', 'Care'),
    e(13, 'log', '612 carts recovered (33%) · checkout completion 76% (+8pp)', 'Care', 'success'),
    { ...e(15, 'verify', 'Revenue recovered £92k · CAC saved £34k · 0 PCI/fraud flags', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Checkout recovery wave done · margin floor preserved · audit trail to gold.decision_lineage', 'Network', 'success'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
  ],
};

const digVulnerableCare: SectionScenario = {
  id: 'dig-vulnerable-care-routing',
  sectionId: 'digital',
  title: 'Vulnerability-aware care routing · Ofcom GC C5 / ICO compliance',
  subtitle: 'Cortex classifier identifies recent-bereavement vulnerability and suppresses commercial offers.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Inbound chat · "I have just been bereaved and I cannot pay this bill" · sentiment −0.84', 'Care', 'critical'), focus: { route: '/digital/conversational', target: 'page' } },
    e(2, 'observe', 'Vulnerability classifier · vulnerability_v2.1 · confidence 0.97 → flag = recent_bereavement', 'Decisioning', 'warn'),
    e(4, 'hypothesize', 'Ofcom GC C5 + ICO vulnerability flag → suppress all upsell · route to specialist', 'Decisioning'),
    e(6, 'plan', 'Plan: suppress commercial offers · route to vulnerability specialist queue · activate ICO/Ofcom evidence trail', 'Decisioning'),
    e(9, 'act-care', 'Genesys SAVE-VULN queue · specialist pickup in 18s · safeguarding flag set on account', 'Care'),
    e(12, 'log', 'Specialist offered 30-day bill pause + payment plan · accepted', 'Care', 'success'),
    e(15, 'log', 'All upsell offers suppressed for 12 mo · NBA model honors safeguarding flag', 'Decisioning', 'success'),
    e(17, 'log', 'Compliance: ICO vulnerability register updated · Ofcom GC C5 evidence pack auto-generated', 'Activation', 'success'),
    { ...e(19, 'verify', 'CSAT 0.92 · 0 commercial action triggered · regulator-ready audit trail', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(21, 'resolve', 'Vulnerability case opened VLN-2026-04812 · gold.vulnerability_register updated · GDPR Art.9 logged', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digFcrPrediction: SectionScenario = {
  id: 'dig-fcr-prediction',
  sectionId: 'digital',
  title: 'First-call-resolution prediction · 6.2k chat surge',
  subtitle: 'FCR-likelihood model routes 600 low-FCR chats around the bot to specialist humans.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '6,200 inbound chats in last hour at 4× baseline (chat_volume_anomaly)', 'Care', 'warn'), focus: { route: '/digital/conversational', target: 'page' } },
    e(2, 'observe', 'fcr_likelihood_v2.0 scored each chat: 4,180 ≥0.7 · 1,420 0.4–0.7 · 600 <0.4', 'Decisioning'),
    e(4, 'hypothesize', 'Routing 600 low-FCR straight to specialists prevents bot-then-human escalation tax', 'Decisioning'),
    e(6, 'plan', 'Plan: 4,180 in-bot · 1,420 assist mode · 600 specialist routing (queue=SAVE-COMPLEX)', 'Decisioning'),
    { ...e(8, 'act-care', 'Cortex Agent serves 4,180 · Genesys assist 1,420 · skill-based route 600', 'Care'), focus: { route: '/digital/channels', target: 'page' } },
    e(11, 'log', 'In-bot FCR 81% · assist FCR 74% · specialist FCR 88% · overall 78% (+12pp)', 'Care', 'success'),
    e(13, 'log', 'Vulnerability classifier intercepted 4 cases mid-flow · auto-routed to SAVE-VULN', 'Care', 'success'),
    { ...e(15, 'verify', '6,200 served · zero queue overflow · escalation cost down £12k/h', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'FCR overall 78% · vulnerability false-pos 0.4% · model logged to gold.decision_lineage', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digFraudSignup: SectionScenario = {
  id: 'dig-app-fraud-signup',
  sectionId: 'digital',
  title: 'App fraud · synthetic-identity at signup',
  subtitle: 'Burst velocity + device fingerprint + Stripe Radar flag 18 of 240 new signups.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '240 new-customer signups in last 15 min · synthetic_signup_v1.3 flags 18 above 0.85', 'Decisioning', 'critical'), focus: { route: '/digital/channels', target: 'page' } },
    e(2, 'observe', 'Signals: 12 from same device fingerprint · IP=UK address=NL phone=IE · Stripe Radar flag', 'Decisioning'),
    e(4, 'hypothesize', 'Synthetic identity ring — pause provisioning, KYC step-up, re-score post-evidence', 'Decisioning'),
    e(6, 'plan', 'Plan: hold SIM provisioning · Onfido document + selfie step-up for 18 · auto-attach evidence pack to FRD-2026-7421', 'Decisioning'),
    { ...e(8, 'act-care', 'KYC step-up dispatched: 18 SMS + 14 push · Stripe Radar held', 'Care'), focus: { route: '/digital/channels', target: 'page' } },
    e(11, 'log', '14 stepped up · 4 hard-blocked · post-step-up only 2 of 14 cleared (12 confirmed synthetic)', 'Care'),
    e(13, 'log', 'Manual review on the 2 cleared cases · 0 false-block confirmed', 'Care', 'success'),
    { ...e(15, 'verify', '£42k fraud loss avoided · 16 SIMs not provisioned · GDPR data minimisation respected', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Fraud case closed FRD-2026-7421 · gold.fraud_decisions updated · Stripe Radar feedback loop fed', 'Network', 'success'), focus: { route: '/digital/channels', target: 'page' } },
  ],
};

// ─── Digital Marketing scenarios ───────────────────────────────────────────

const digCampaignLaunch: SectionScenario = {
  id: 'dig-campaign-launch-lookalike',
  sectionId: 'digital',
  title: '"5G Hero" campaign launch · 240k lookalike',
  subtitle: 'Cortex Agent generates creative · Snowpark ML lookalike audience · holdout-vs-treatment uplift live.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Campaign brief: 5G Hero Unlimited Max · seed 1,000 high-CLV converters · target lookalike', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(2, 'observe', 'Snowpark ML lookalike: 240,180 customers above cosine 0.82 · gold.customer_embeddings', 'Decisioning'), focus: { route: '/digital/marketing/audience', target: 'page' } },
    e(4, 'log', 'Suppression: 2,180 open complaints + 4,420 offer-fatigue + 18% overlap with Disney+ campaign', 'Decisioning'),
    e(6, 'plan', 'Plan: 232k net reachable · 5% holdout · ranked NBA: 5G SA Unlimited Max + £5 first-month credit', 'Decisioning'),
    e(8, 'act-care', 'Cortex Agent generates 6 subject lines + 3 body variants (brand-voice prompt: confident, friendly, UK)', 'Care'),
    { ...e(10, 'log', 'Salesforce MC: 232k cohort dispatched (App + Email + RCS) · creative variant A/B/C live', 'Care', 'success'), focus: { route: '/digital/marketing', target: 'page' } },
    e(13, 'log', 'Day-1 conversion 11.4% · holdout 5.0% · uplift +6.4pp · ROAS 4.6×', 'Decisioning'),
    e(16, 'log', 'Best-performing variant: subject-line "Your data, unlocked." · CTR +27%', 'Care', 'success'),
    { ...e(19, 'verify', 'Audience reached 232k · spend £184k of £320k cap · margin floor preserved', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(21, 'resolve', '27,400 conversions · ARPU lift +£1.6/mo per converter · audit gold.decision_lineage', 'Network', 'success'), focus: { route: '/digital/marketing', target: 'page' } },
  ],
};

const digAttributionRebalance: SectionScenario = {
  id: 'dig-attribution-rebalance',
  sectionId: 'digital',
  title: 'Multi-touch attribution rebalance · MMM',
  subtitle: 'Bayesian MMM detects over-spend on paid social → reallocates £180k → ROAS lift +0.4.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Weekly MMM run: paid social marginal ROAS 0.7× (below 1.0 break-even)', 'Decisioning', 'warn'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    e(2, 'observe', 'Markov + Shapley attribution: paid social over-credited 31% (last-click) vs 22% (Shapley)', 'Decisioning'),
    e(4, 'hypothesize', 'Reallocating 12pp from paid social → retargeting + RCS lifts portfolio ROAS by ~0.4', 'Decisioning'),
    e(6, 'plan', 'Plan: cap paid social at 28% · increase retargeting +6pp · RCS +4pp · Email +2pp', 'Decisioning'),
    { ...e(8, 'act-care', 'Spend rebalance pushed to ad-buying APIs · paid social £180k → retargeting/RCS/Email', 'Care', 'success'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    e(11, 'log', 'Adobe AEP + Salesforce MC budgets re-issued · creative re-pacing within 30 min', 'Care'),
    e(13, 'log', 'Forecast: portfolio ROAS 5.1× → 5.5× · incremental revenue +£82k/mo', 'Decisioning', 'success'),
    { ...e(15, 'verify', 'Spend curves redrawn · MMM re-fit overnight · 0 brand-safety regressions', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Spend rebalanced · ROAS +0.4 · gold.spend_ledger + gold.revenue_attribution updated', 'Network', 'success'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
  ],
};

const digCompetitorCounter: SectionScenario = {
  id: 'dig-competitor-counter',
  sectionId: 'digital',
  title: 'Competitor counter-launch · 24h response',
  subtitle: 'Cortex Search detects competitor SIM-only price drop · auto-generates counter-offer + creative + PR draft.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Cortex Search alert: Competitor A · 30GB SIM-only £18 (was £22) · 4 social posts last 4h', 'Decisioning', 'critical'), focus: { route: '/digital/marketing/brand', target: 'page' } },
    e(2, 'observe', 'PAC velocity in LS2 +340% vs baseline · brand-search SnowFlex −9% in 4h', 'Decisioning', 'warn'),
    e(4, 'hypothesize', 'If untreated: forecast +6.4pp churn in price-sensitive SnowFlex cohort over 7d', 'Decisioning'),
    e(6, 'plan', 'Plan: SnowFlex 30GB price-match + 6mo loyalty boost · cohort 940 LS2/LS5 · margin floor 28%', 'Decisioning'),
    e(8, 'act-care', 'Cortex Agent drafts: counter-offer copy + landing-page hero + PR statement', 'Care'),
    { ...e(10, 'log', 'Salesforce MC: 940 cohort dispatched · App + SMS · creative live in 22 min from detection', 'Care', 'success'), focus: { route: '/digital/marketing', target: 'page' } },
    e(13, 'log', '412 retained (44%) · 528 still browsing · save rate +16pp vs untreated control', 'Decisioning'),
    { ...e(15, 'verify', '24h response window achieved · CLV protected ~£94k · PR statement reviewed by Comms', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Counter-launch live · gold.competitor_ads updated · ROAS forecast 3.8× over 30d', 'Network', 'success'), focus: { route: '/digital/marketing/brand', target: 'page' } },
  ],
};

const digWinbackLapsed: SectionScenario = {
  id: 'dig-winback-lapsed',
  sectionId: 'digital',
  title: 'Winback wave · 18.4k lapsed customers',
  subtitle: 'Propensity-scored, channel-personalised, regulator-compliant winback.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', 'Lapsed cohort: 18,420 customers · churned 60–180d ago · winback model scored', 'Decisioning'), focus: { route: '/digital/marketing/lifecycle', target: 'page' } },
    e(2, 'observe', 'Winback propensity > 0.5: 6,140 · vulnerability suppressed: 248 · marketing consent: 14,920', 'Decisioning'),
    e(4, 'log', 'Channel match: 4,180 push-ready · 8,200 email-only · 2,540 SMS · 0 voice (consent)', 'Decisioning'),
    e(6, 'plan', 'NBA: tiered offer · £15 cashback returners · 50% off 3mo · free Roaming Pass for travelers', 'Decisioning'),
    { ...e(9, 'act-care', 'Salesforce MC + Sinch · 14,920 dispatched across 3 channels · Ofcom GC C5 vulnerability checks pass', 'Care', 'success'), focus: { route: '/digital/marketing', target: 'page' } },
    e(12, 'log', 'Day-3: 1,640 returned · 9% conversion at day-3 vs 4% control', 'Care'),
    e(15, 'log', 'Day-7: 2,420 cumulative retained · 13% by day-7 vs 4.1% control · revenue +£42k/mo run-rate', 'Decisioning', 'success'),
    e(17, 'log', 'Holdout (10%): 1,840 untreated · 76 returned (4.1%) — uplift +4.9pp', 'Decisioning'),
    { ...e(19, 'verify', '2,420 returned · CLV recovered £384k · margin floor preserved · 0 vulnerability complaints', 'Decisioning', 'success'), focus: { route: '/digital/marketing/lifecycle', target: 'page' } },
  ],
};

const digAnniversaryLoyalty: SectionScenario = {
  id: 'dig-anniversary-loyalty',
  sectionId: 'digital',
  title: 'Anniversary loyalty surprise · 12.2k cohort',
  subtitle: 'Trigger-based cross-product reward (10GB boost + Disney+ trial + £5 credit).',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Anniversary trigger fired · 12,200 customers reach 12mo / 24mo / 36mo today', 'Care'), focus: { route: '/digital/marketing/lifecycle', target: 'page' } },
    e(2, 'observe', 'Loyalty model ranks 3 reward tiers · 36mo gets gift · 24mo gets bundle · 12mo gets boost', 'Decisioning'),
    e(4, 'plan', 'Plan: 10GB data boost + Disney+ 1mo trial + £5 credit (cross-product, single push)', 'Decisioning'),
    { ...e(6, 'act-care', 'Salesforce MC: 12,200 dispatched · push + email · entitlement provisioned via SPCS', 'Care', 'success'), focus: { route: '/digital/marketing/lifecycle', target: 'page' } },
    e(9, 'log', 'Conversion: 4,640 (38%) accepted reward · 1,420 attached Disney+ trial', 'Care'),
    e(11, 'log', 'CSAT lift +0.6 · NPS +4pp · churn forecast −2.4pp on cohort', 'Decisioning', 'success'),
    e(13, 'log', 'Loyalty mission completed · gold.engagement_features refreshed', 'Care'),
    { ...e(15, 'verify', '4,640 reward acceptances · revenue lift £18k/mo (≈ £3.88/mo per converter) · 0 commercial-offer fatigue triggers', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
  ],
};

const digReferAFriend: SectionScenario = {
  id: 'dig-refer-a-friend',
  sectionId: 'digital',
  title: 'Refer-a-friend wave · 8.4k advocates',
  subtitle: 'Advocate identification + viral coefficient + paid-channel attribution avoided.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Advocate cohort: 8,400 customers with NPS ≥ 9 + tenure ≥ 6mo · advocate_propensity_v1.0', 'Decisioning'), focus: { route: '/digital/marketing/lifecycle', target: 'page' } },
    e(2, 'observe', 'Reward tier: £15 credit per successful referral · cap 5 referrals per advocate', 'Decisioning'),
    e(4, 'plan', 'Plan: dispatch advocate nudge (email + push) · personalised referral link · share-to-WhatsApp/SMS', 'Decisioning'),
    { ...e(6, 'act-care', 'Salesforce MC: 8,400 dispatched · email + push · referral link via Adobe AEP', 'Care', 'success'), focus: { route: '/digital/marketing', target: 'page' } },
    e(9, 'log', 'Day-3: 3,540 invites sent · 1,320 friends opened · 612 conversions', 'Care'),
    e(11, 'log', 'Viral coefficient 0.42 · LTV created £94k · CAC saved £38k (paid-channel avoided)', 'Decisioning', 'success'),
    e(13, 'log', 'Reward credits issued automatically · gold.loyalty_ledger updated', 'Care'),
    { ...e(15, 'verify', '612 new customers · ROAS 9.1× · zero fraud flags on advocate-friend pairs', 'Decisioning', 'success'), focus: { route: '/digital/marketing/lifecycle', target: 'page' } },
  ],
};

// ─── New Digital · AI & Decisioning + Trust & Operations scenarios ────────

const digDecisioningTrace: SectionScenario = {
  id: 'dig-decisioning-trace',
  sectionId: 'digital',
  title: 'Decisioning brain · live trace',
  subtitle: 'One customer, one decision — eligibility, suppression, ranked offer, channel, all auditable.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Intent received · CUST-001 chat · "5G slow at home" · Manchester M14', 'Decisioning'), focus: { route: '/digital/decisioning', target: 'page' } },
    e(2, 'observe', 'Customer state: CLV £980 · churn 0.62 · contract end 21d · 2 open complaints', 'Decisioning'),
    e(4, 'log', 'Eligibility: 12 offers retrieved from gold.offer_eligibility', 'Decisioning'),
    e(6, 'plan', 'Suppression: 3 dropped (frequency cap, margin floor, vulnerability)', 'Decisioning'),
    e(8, 'plan', 'Cortex Agent reasoning: "network event known · prioritise apology + credit · avoid upsell"', 'Decisioning'),
    e(11, 'act-care', 'Ranked output: P1 £5 credit · P2 10GB boost · P3 contract refresh — channel: in-bot', 'Care', 'success'),
    e(13, 'log', 'Decision delivered · audit row written to gold.decision_lineage', 'Activation'),
    { ...e(15, 'verify', 'p95 latency 41ms · explainable 94.2% · 0 override needed', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Decision resolved · CSAT prediction 0.86 · GDPR Art.22 compliant', 'Network', 'success'), focus: { route: '/digital/decisioning', target: 'page' } },
  ],
};

const digVocThemeDrift: SectionScenario = {
  id: 'dig-voc-theme-drift',
  sectionId: 'digital',
  title: 'Voice of Customer · first-party transcript drift',
  subtitle: 'Cortex AI_CLASSIFY on call transcripts + chat + survey (first-party) catches 28% spike in 5G complaints — distinct from external App Store sentiment.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Theme volume anomaly: "5G coverage Manchester" +28% in 6h · voc_classifier_v3.1', 'Decisioning', 'warn'), focus: { route: '/digital/voc', target: 'page' } },
    e(2, 'observe', 'AI_SUMMARIZE clusters: "M14 dropped calls" 38% · "5G slow indoors" 32% · "billing app" 18%', 'Decisioning'),
    e(4, 'hypothesize', 'Forecast: app-store 4.6 → 4.2 within 48h · NPS detractor +1.4pp if untreated', 'Decisioning'),
    e(6, 'plan', 'Plan: in-app intercept survey for 18,400 affected · Cortex Agent FAQ · pre-draft App Store appeal', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce MC dispatched · 18,400 cohort intercepted · FAQ deflected 8,940', 'Care', 'success'), focus: { route: '/digital/voc', target: 'page' } },
    e(11, 'log', 'Sentiment recovered +0.21 in 6h · theme drift cooling', 'Care'),
    e(13, 'log', 'Verbatim feed clean of escalation language · NOC fix-window communicated', 'Care'),
    { ...e(15, 'verify', 'Theme volume normalised · NPS detractor +0.0pp · store rating held 4.6', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Theme drift contained · gold.review_corpus refreshed · GDPR Art.6 logged', 'Network', 'success'), focus: { route: '/digital/voc', target: 'page' } },
  ],
};

const digExperimentRollout: SectionScenario = {
  id: 'dig-experiment-rollout',
  sectionId: 'digital',
  title: '5G Hero campaign · stage 2 · post-launch ramp',
  subtitle: 'Bayesian posterior crosses ROPE-excluded threshold; campaign ramps 10 → 50 → 100% with guardrails held. (Sequel to stage-1 launch scenario.)',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '5G Hero campaign A/B reaches 50% ramp · interim Bayesian read', 'Decisioning'), focus: { route: '/digital/experiments', target: 'page' } },
    e(2, 'observe', 'Posterior mean uplift +6.4pp · P(uplift > 0) = 98.8% · ROPE [-2pp,+2pp] excluded', 'Decisioning'),
    e(4, 'log', 'Guardrails OK: complaint rate −0.2pp · margin floor preserved · vulnerability suppressed', 'Decisioning'),
    e(6, 'plan', 'Auto-decision: ramp 50 → 100% · holdout retained at 5%', 'Decisioning'),
    { ...e(8, 'act-care', 'Adobe AEP audience segments updated · creative re-paced toward winner', 'Care', 'success'), focus: { route: '/digital/experiments', target: 'page' } },
    e(11, 'log', 'No audience-overlap conflict with Disney+ family attach (mutual exclusion in place)', 'Decisioning'),
    e(13, 'log', 'Daily significance test passing · gold.experiment_outcomes appended', 'Decisioning', 'success'),
    { ...e(15, 'verify', 'Test ramp 100% · uplift +6.4pp · p=0.012 · 0 guardrail breaches', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Causal lift confirmed · gold.experiment_outcomes + holdout register updated', 'Network', 'success'), focus: { route: '/digital/experiments', target: 'page' } },
  ],
};

const digMartechSyncLag: SectionScenario = {
  id: 'dig-martech-sync-lag',
  sectionId: 'digital',
  title: 'MarTech sync lag · Salesforce MC throttle',
  subtitle: 'Audience sync lag spikes during a campaign launch; auto-throttled and recovered without missed sends.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Salesforce MC sync lag P95 92s → 248s · audience_sync_v3 anomaly', 'Decisioning', 'warn'), focus: { route: '/digital/martech', target: 'page' } },
    e(2, 'observe', '5G Hero launch firing 232k events/min · MC ingest rate 184k/min', 'Decisioning'),
    e(4, 'hypothesize', 'Lag from MC API rate limit (412 throttle) — auto back-off + retry queue', 'Decisioning'),
    e(6, 'plan', 'Plan: throttle outbound to 184k/min · spool excess in retry queue · backfill on recovery', 'Decisioning'),
    { ...e(8, 'act-care', 'Outbound throttled · retry queue at 48k events · 0 sends dropped', 'Care', 'success'), focus: { route: '/digital/martech', target: 'page' } },
    e(11, 'log', 'MC API recovered · retry queue drained in 2:48 · lag back to P95 38s', 'Care', 'success'),
    { ...e(13, 'verify', 'Sync lag P95 38s · audience freshness restored · 0 send failures', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Throttle policy logged to gold.audience_sync_log · MC team alerted', 'Network', 'success'), focus: { route: '/digital/martech', target: 'page' } },
  ],
};

const digPriceTest: SectionScenario = {
  id: 'dig-price-test',
  sectionId: 'digital',
  title: 'Pricing A/B · SnowTelco Lite 30GB £18 vs £20',
  subtitle: 'Bayesian price test on entry-level brand reaches significance; recommendation auto-drafted with margin-floor compliance + CFO approval workflow.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Price A/B SnowFlex 30GB · £18 vs £20 · 14d in-market · Bayesian read due', 'Decisioning'), focus: { route: '/digital/pricing', target: 'page' } },
    e(2, 'observe', 'Attach: £18 arm 22.4% vs £20 arm 18.2% · uplift +4.2pp · p=0.006', 'Decisioning'),
    e(4, 'hypothesize', 'Margin: £18 arm at 31.4% (floor 28%) — within policy · revenue per attempt £4.03 vs £3.64', 'Decisioning'),
    e(6, 'plan', 'Plan: roll £18 to 100% on SnowFlex 30GB · monitor competitor parity · re-test in 90d', 'Decisioning'),
    { ...e(8, 'act-care', 'Pricing engine updated · catalog v126 published via TMF 620 · creative re-paced', 'Care', 'success'), focus: { route: '/digital/pricing', target: 'page' } },
    e(11, 'log', 'Forecast: +£42k/mo revenue at +4.2pp attach uplift · margin held 31.4%', 'Decisioning'),
    e(13, 'log', 'Competitor parity: £18 vs A £20 / B £19 / C £18 — at parity', 'Decisioning'),
    { ...e(15, 'verify', 'Price test won · 0 margin-floor breaches · gold.price_test_register updated', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', '£18 live to 100% · revenue +£42k/mo · audit trail to gold.tariff_elasticity', 'Network', 'success'), focus: { route: '/digital/pricing', target: 'page' } },
  ],
};

const digSelfServiceKbGap: SectionScenario = {
  id: 'dig-selfservice-kb-gap',
  sectionId: 'digital',
  title: 'Self-service · KB gap auto-drafted',
  subtitle: 'Cortex Search detects 2,418 unanswered "esim transfer" hits in 30d; KB article auto-drafted, FCR rises.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'KB miss spike: "esim transfer iPhone" 612 hits in 24h · containment_v2.3 gap', 'Care', 'warn'), focus: { route: '/digital/self-service', target: 'page' } },
    e(2, 'observe', 'Drill: 412 from new iPhone 16 owners · 200 from Android-to-iPhone migrants', 'Decisioning'),
    e(4, 'hypothesize', 'Forecast: deflection improves +4pp if KB article + in-app step-by-step published', 'Decisioning'),
    e(6, 'plan', 'Plan: Cortex Complete drafts KB article · UX builds in-app guided journey · 90-min SLA', 'Decisioning'),
    { ...e(8, 'act-care', 'KB article KB-2026-1842 published · in-app journey live · search re-indexed', 'Care', 'success'), focus: { route: '/digital/self-service', target: 'page' } },
    e(11, 'log', 'KB hit-rate +14pp on the query · 412 of 612 follow-up sessions resolved', 'Care', 'success'),
    { ...e(13, 'verify', 'Containment +4pp · FCR +2pp · 0 escalation surge · gold.kb_hits updated', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'KB gap closed · gold.decision_lineage logged the auto-publish action', 'Network', 'success'), focus: { route: '/digital/self-service', target: 'page' } },
  ],
};

const digPrivacyDsarSurge: SectionScenario = {
  id: 'dig-privacy-dsar-surge',
  sectionId: 'digital',
  title: 'Privacy · DSAR surge auto-routed',
  subtitle: 'DSAR submissions spike post ICO breach disclosure; specialist queue absorbs within 30-day GDPR Art.12 SLA.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'DSAR submissions: 24 in 4h vs baseline 6 · ICO 1-month SLA at risk on 5 oldest cases', 'Decisioning', 'warn'), focus: { route: '/digital/privacy', target: 'page' } },
    e(2, 'observe', 'Driver: external press cycle on UK telco data practices · brand-search +18%', 'Decisioning'),
    e(4, 'log', 'DSAR queue: 18 open · avg age 3.2d · 5 cases >5d (high priority)', 'Decisioning'),
    e(6, 'plan', 'Plan: route to DPO+Legal · auto-extract data via gold.consent_register · 24h triage SLA', 'Decisioning'),
    { ...e(8, 'act-care', 'DPO team paged · auto-extract for 14 cases · evidence packs generated', 'Care', 'success'), focus: { route: '/digital/privacy', target: 'page' } },
    e(11, 'log', '12 cases closed within 48h · 6 in evidence-pending state · 0 SLA breaches', 'Care', 'success'),
    e(13, 'log', 'Vulnerability flags cross-checked · 2 cases re-routed to specialist queue', 'Activation'),
    { ...e(15, 'verify', 'DSAR queue back to 8 · avg age 1.6d · 0 ICO breaches · regulator-ready audit', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'DSAR surge contained · gold.dsar_register updated · ICO SLA preserved', 'Network', 'success'), focus: { route: '/digital/privacy', target: 'page' } },
  ],
};

const digForecastSurge: SectionScenario = {
  id: 'dig-forecast-surge',
  sectionId: 'digital',
  title: 'Forecast surge · capacity plan auto-published',
  subtitle: 'Campaign launch + NOC incident drive 4× chat volume; surge plan auto-published to WFM.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Volume forecast surge: today 12-17 +148% vs baseline · volume_forecast_v3', 'Decisioning', 'warn'), focus: { route: '/digital/forecast', target: 'page' } },
    e(2, 'observe', 'Drivers: 5G Hero launch +1.2k chats · NOC M14 incident +800 · seasonality −400', 'Decisioning'),
    e(4, 'hypothesize', 'WFM gap: +18 FTE needed Mon-Fri 12-17 · agent borrow from voice acceptable', 'Decisioning'),
    e(6, 'plan', 'Plan: borrow 18 voice agents · open overflow chat queue · pre-warm Cortex Agent capacity', 'Decisioning'),
    { ...e(8, 'act-care', 'WFM roster updated · Genesys overflow queue active · Cortex Agent autoscaled +30%', 'Care', 'success'), focus: { route: '/digital/forecast', target: 'page' } },
    e(11, 'log', 'P95 wait held at 1:42 (SLA 2:00) · zero queue overflow · no abandoned chats', 'Care', 'success'),
    e(13, 'log', 'MAPE on the day: 5.8% · forecast within target', 'Decisioning'),
    { ...e(15, 'verify', 'Surge absorbed · SLA preserved · gold.wfm_roster + gold.cc_chats updated', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Capacity plan published · WFM team notified · forecast model logged', 'Network', 'success'), focus: { route: '/digital/forecast', target: 'page' } },
  ],
};

const digIdentitySimSwap: SectionScenario = {
  id: 'dig-identity-sim-swap',
  sectionId: 'digital',
  title: 'Identity Trust · pre-attack prevention at app login',
  subtitle: 'Pre-attack prevention layer: biometric step-up + geo-velocity + device fingerprint block SIM-swap attempt at login. (NOC handles mid-attack response separately.)',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Login attempt CUST-9824 · risk 0.94 · ato_risk_v2.4 · geo Coventry → Lisbon in 14m', 'Decisioning', 'critical'), focus: { route: '/digital/identity', target: 'page' } },
    e(2, 'observe', 'Recent SIM-swap signal: SIM swap reported at MNO partner 22m ago — anomaly', 'Decisioning'),
    e(4, 'hypothesize', 'High-CLV account (CLV £1.4k) · synthetic SIM-swap pattern · step-up MFA mandatory', 'Decisioning'),
    e(6, 'plan', 'Plan: challenge with biometric+SMS · hold sensitive transactions · alert account owner', 'Decisioning'),
    { ...e(8, 'act-care', 'Biometric+SMS challenge issued · device fingerprint mismatch · BLOCKED', 'Care', 'success'), focus: { route: '/digital/identity', target: 'page' } },
    e(11, 'log', 'Account owner alerted via secondary channel · fraud case FRD-2026-7488 opened', 'Care'),
    e(13, 'log', 'Stripe Radar feedback loop fed · pattern shared with industry trust ring', 'Activation', 'success'),
    { ...e(15, 'verify', 'ATO blocked · 0 unauthorised actions · 0 false-block on CUST-9824 (re-cleared)', 'Decisioning', 'success'), focus: { route: '/digital', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Case closed FRD-2026-7488 · gold.sim_swap_register + gold.login_events updated', 'Network', 'success'), focus: { route: '/digital/identity', target: 'page' } },
  ],
};

// ─── New Digital scenarios (gaps closed for senior-exec demo) ────────────────
const digOutageComms: SectionScenario = {
  id: 'dig-outage-comms',
  sectionId: 'digital',
  title: 'Outage comms drafter · multi-channel auto-publish',
  subtitle: 'NOC P1 fires → Cortex Complete drafts status page + SMS + in-app + B2B email + Welsh-language variant in 38 sec; Digital publishes after IC approval.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'NOC P1 declared (NOC-MIM-2026-0413) · trigger pulled to Digital comms-drafter pipeline', 'Network', 'critical'), focus: { route: '/digital/decisioning', target: 'page' } },
    { ...e(2, 'observe', 'Cortex Complete reads incident timeline + decision log + customer-impact join', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(4, 'log', 'Drafted: status-page entry · SMS to 184k impacted · in-app banner · 14 B2B account emails · Welsh-language variant', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(6, 'hypothesize', 'Tone safety check vs Ofcom GC C1 + ASA + Welsh Language Standards · all PASS', 'Decisioning'), focus: { route: '/digital/voc', target: 'page' } },
    { ...e(8, 'plan', 'Plan: IC + Comms Lead approval · serial publish status → SMS → in-app → email · 15-min cadence locked', 'Decisioning'), focus: { route: '/digital/decisioning', target: 'page' } },
    { ...e(10, 'act-care', 'IC approves · Sinch SMS dispatched (184k) · Salesforce MC in-app banner LIVE · Welsh variant published', 'Care', 'success'), focus: { route: '/digital/conversational', target: 'page' } },
    { ...e(14, 'log', 'Subscribers notified: 22,400 status-page · 184k SMS · 14 B2B emails · 0 send failures', 'Care'), focus: { route: '/digital/journeys', target: 'page' } },
    { ...e(17, 'verify', 'Avg draft → publish 38 sec · human-edit rate 6% · GC A3 30-day report queue updated', 'Decisioning', 'success'), focus: { route: '/digital/voc', target: 'page' } },
    { ...e(20, 'resolve', 'Comms cycle complete · 0 customer complaint about messaging · GDPR Art.34 satisfied', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digCoverageConversion: SectionScenario = {
  id: 'dig-coverage-conversion',
  sectionId: 'digital',
  title: 'Coverage checker → subscribe conversion',
  subtitle: 'Snowpark ML scores 14k weekly visitors who run the coverage map then bounce; personalised offer + retargeting recovers 1.4k subscribers.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', '14,200 visitors ran coverage map this week → 78% bounced before subscribe (£42 ARPU each = £600k/yr at risk)', 'Decisioning', 'warn'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(2, 'observe', 'Cortex Search: 5G-coverage queries dominate · 38% checked address with 5G SA available', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(4, 'log', 'Cohort: 14.2k bouncers · 5,400 in 5G SA areas · 1,400 in 4G-only areas (no upsell point)', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(6, 'hypothesize', 'Propensity model on 5G-area cohort: 22% sub-likely-to-convert with 5G-Hero offer', 'Decisioning'), focus: { route: '/digital/decisioning', target: 'page' } },
    { ...e(8, 'plan', 'Plan: 5G-area cohort → personalised retargeting (paid social + email re-engage) · 4G cohort → app coverage update notification', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce MC + paid-social retargeting fires · 5,400 served in 5G areas · creative tied to checked postcode', 'Care', 'success'), focus: { route: '/digital/journeys', target: 'page' } },
    { ...e(15, 'log', 'Day-7: 1,420 subscribed · 26% conv on retargeted cohort · CAC £14 · LTV/CAC 3.4×', 'Care'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    { ...e(18, 'verify', 'Holdout-vs-treatment uplift +18pp · attributable revenue £612k/yr', 'Decisioning', 'success'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    { ...e(20, 'resolve', 'Coverage-conversion campaign live · weekly retraining queued · ROAS 4.2', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digComplaintResolution: SectionScenario = {
  id: 'dig-complaint-resolution',
  sectionId: 'digital',
  title: 'Complaint resolution · Ofcom GC C7 · 8-week deadlock',
  subtitle: '38 cases approaching 8-week GC C7 deadlock-letter trigger · auto-prep ADR routing + final-resolution offer + escalation to specialist queue.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', '38 complaints aged 7w 4d · 4 days from GC C7 deadlock-letter trigger · ADR routing prep required', 'Care', 'warn'), focus: { route: '/digital/self-service', target: 'page' } },
    { ...e(2, 'observe', 'Cortex AI_AGG over case notes: 14 billing · 11 service-quality · 8 contract-dispute · 5 mis-selling', 'Decisioning'), focus: { route: '/digital/voc', target: 'page' } },
    { ...e(4, 'log', 'Eligibility: ADR scheme = CISAS · GDPR Art.6 · GC C7 deadlock template prepared', 'Decisioning'), focus: { route: '/digital/self-service', target: 'page' } },
    { ...e(6, 'hypothesize', 'Per-case NBA: 22 final-resolution offer with goodwill credit · 16 deadlock + ADR signpost', 'Decisioning'), focus: { route: '/digital/decisioning', target: 'page' } },
    { ...e(8, 'plan', 'Plan: specialist queue assignment · final-resolution offer drafted · ADR letter pre-loaded for 16', 'Decisioning'), focus: { route: '/digital/self-service', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce specialist queue · trained complaints-handling team · 38 cases assigned · 7-day SLA', 'Care', 'success'), focus: { route: '/digital/self-service', target: 'page' } },
    { ...e(15, 'log', '22 settled with goodwill (avg £24) · 16 issued GC C7 deadlock + ADR signpost · 100% within Ofcom 8-week window', 'Care', 'success'), focus: { route: '/digital/conversational', target: 'page' } },
    { ...e(18, 'verify', 'GC C7 audit: 0 deadlock-letter SLA breach · ADR escalations 16 · projected ADR success rate 78%', 'Decisioning', 'success'), focus: { route: '/digital/voc', target: 'page' } },
    { ...e(20, 'resolve', 'All 38 closed inside Ofcom window · gold.complaints_register updated · ICO audit trail clean', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digSocialTariff: SectionScenario = {
  id: 'dig-social-tariff',
  sectionId: 'digital',
  title: 'Social Tariff eligibility · UK Ofcom mandate',
  subtitle: 'DWP eligibility match + credit-check integration · auto-onboards 1,820 verified customers onto SnowTelco Essential at £15/mo (Ofcom-mandated social tariff).',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', '4,200 customers self-declared social-tariff interest (Ofcom mandate) · DWP cross-check + credit verification needed', 'Decisioning'), focus: { route: '/digital/marketing/audience', target: 'page' } },
    { ...e(2, 'observe', 'DWP Universal Credit / PIP / ESA datasets matched via consented secure-share · 2,418 confirmed eligible', 'Decisioning'), focus: { route: '/digital/marketing/audience', target: 'page' } },
    { ...e(4, 'log', 'Eligibility: Ofcom social tariff list · GDPR special-category data lawful basis · DPIA on file', 'Decisioning'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(6, 'hypothesize', 'Per-customer: keep current line + downgrade to Essential £15/mo · ARPU −£18 but social-equity mandate satisfied', 'Decisioning'), focus: { route: '/digital/decisioning', target: 'page' } },
    { ...e(8, 'plan', 'Plan: outbound to 2,418 confirmed-eligible · in-app one-tap onboarding · concierge call for vulnerable subset', 'Decisioning'), focus: { route: '/digital/marketing', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce MC + Sinch SMS · 1,820 onboarded in 7 days · trained vulnerability-aware specialist team', 'Care', 'success'), focus: { route: '/digital/self-service', target: 'page' } },
    { ...e(15, 'log', '1,820 onboarded · revenue impact −£32k/mo · regulatory compliance + brand sentiment +12pt', 'Care', 'success'), focus: { route: '/digital/voc', target: 'page' } },
    { ...e(18, 'verify', 'Ofcom social-tariff registration filed · ICO ROPA updated · audit trail in gold.social_tariff_onboard', 'Decisioning', 'success'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(20, 'resolve', 'Programme live · 1,820 enrolled · ongoing eligibility re-check every 12mo', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digFamilyControls: SectionScenario = {
  id: 'dig-family-controls',
  sectionId: 'digital',
  title: 'Child-account onboarding · Online Safety Act',
  subtitle: 'Family-plan flag triggers age-verified child sub-account journey · content filtering + screen-time limits + UK Online Safety Act compliance.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', '4,820 family plans with new sub-line in last 30d · 1,420 likely child accounts (under-18)', 'Decisioning'), focus: { route: '/digital/journeys', target: 'page' } },
    { ...e(2, 'observe', 'Online Safety Act + NSPCC framework: age verification via parent-attestation + payment-card check', 'Decisioning'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(4, 'log', 'Eligibility check: parental consent on file · OSA category-1 platform NOT applicable · child-safety controls available', 'Decisioning'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(6, 'hypothesize', 'Recommended controls per age: U13 = strict (filter + 2hr/day) · 13-15 = balanced · 16-17 = open with reporting', 'Decisioning'), focus: { route: '/digital/decisioning', target: 'page' } },
    { ...e(8, 'plan', 'Plan: in-app onboarding journey · age picker · controls preset · weekly insights to parent account', 'Decisioning'), focus: { route: '/digital/journeys', target: 'page' } },
    { ...e(11, 'act-care', 'Salesforce MC family-controls journey published · 1,420 households invited · WCAG AA accessible', 'Care', 'success'), focus: { route: '/digital/journeys', target: 'page' } },
    { ...e(15, 'log', 'Day-14: 942 households onboarded · 88% selected recommended controls · 22 escalated to safeguarding', 'Care', 'success'), focus: { route: '/digital/self-service', target: 'page' } },
    { ...e(18, 'verify', 'OSA audit: 100% age-verified · NSPCC review queue cleared · 0 safeguarding flags missed', 'Decisioning', 'success'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(20, 'resolve', 'Family-controls programme live · 942 child accounts protected · weekly Cortex anomaly check', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

const digCookieConsent: SectionScenario = {
  id: 'dig-cookie-consent',
  sectionId: 'digital',
  title: 'Cookie consent · TCF 2.2 + UK ICO impact on attribution',
  subtitle: 'ICO post-2024 cookie crackdown drives consent-rate −18pp · MMM rebalanced toward consented identity sources · attribution model retrained.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Cookie consent rate fell 78% → 60% over 30 days post ICO crackdown · downstream MMM signal degrading', 'Decisioning', 'warn'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(2, 'observe', 'IAB TCF 2.2 + UK PECR enforcement · 3rd-party-cookie deprecation accelerating', 'Decisioning'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(4, 'log', 'Impact: paid-social attribution noise +28% · email-conversion attribution fine · in-app attribution unaffected (1st-party)', 'Decisioning'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    { ...e(6, 'hypothesize', 'Bayesian MMM rebalance: weight 1st-party signals up + paid-social down · expected ROAS variance −0.4 → −0.1', 'Decisioning'), focus: { route: '/digital/martech', target: 'page' } },
    { ...e(8, 'plan', 'Plan: MMM retrain + media-mix shift £180k from paid-social to 1st-party email/SMS · CFO sign-off', 'Decisioning'), focus: { route: '/digital/martech', target: 'page' } },
    { ...e(11, 'act-care', 'MMM retrained on 60% consent base · attribution model deployed · paid-social bid caps reduced 22%', 'Care', 'success'), focus: { route: '/digital/martech', target: 'page' } },
    { ...e(15, 'log', 'Week-2: ROAS recovered 3.2 → 3.6 · 1st-party email/SMS uptake +18% · ICO compliance audited green', 'Care', 'success'), focus: { route: '/digital/marketing/funnel', target: 'page' } },
    { ...e(18, 'verify', 'PECR + TCF 2.2 audit: 100% consent banner compliant · ICO ROPA updated · holdout-vs-treatment +0.4 ROAS', 'Decisioning', 'success'), focus: { route: '/digital/privacy', target: 'page' } },
    { ...e(20, 'resolve', 'Privacy-first attribution stack live · monthly retraining cadence · gold.consent_inventory in production', 'Network', 'success'), focus: { route: '/digital', target: 'page' } },
  ],
};

// ─── BSS scenarios ──────────────────────────────────────────────────────────
const bssCatalogPublish: SectionScenario = {
  id: 'bss-catalog-publish',
  sectionId: 'bss',
  title: 'Catalog publish · 5G SA Unlimited Max',
  subtitle: 'TMF 620 catalog publish — new tariff to all channels with CAB approval and rollback ready.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Catalog draft: 5G SA Unlimited Max £42 · Disney+ + Roaming Pass EU+US bundled', 'Billing'), focus: { route: '/bss/catalog', target: 'page' } },
    e(2, 'observe', 'Pricing model validated · margin 41% · competitor delta +£3', 'Decisioning'),
    e(4, 'log', 'CAB pre-approval window: Mon/Wed 02:00–04:00 · standard change template', 'Activation'),
    e(6, 'plan', 'Plan: publish to Amdocs CES catalog · push via TMF 620 to Salesforce, Genesys, Retail POS', 'Decisioning'),
    { ...e(8, 'act-snow', 'ServiceNow CHG0013014 opened · CAB approved (standard) · auto-publish at 02:30', 'Activation', 'success'), focus: { route: '/bss/catalog', target: 'page' } },
    e(10, 'log', 'Amdocs CES catalog v124 → v125 published · 6 channels confirmed receipt', 'Billing', 'success'),
    e(12, 'log', 'Time Travel snapshot retained · rollback target = v124 if needed (90d)', 'Activation'),
    { ...e(14, 'verify', 'Channel sync: App ✓ Web ✓ Care ✓ Voice ✓ Retail ✓ Self-service ✓', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(16, 'resolve', 'Tariff live · 5% A/B holdout active · day-1 attach rate measured at next bill cycle', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssBillingClose: SectionScenario = {
  id: 'bss-billing-cycle-close',
  sectionId: 'bss',
  title: 'Monthly billing cycle close',
  subtitle: '12.4M invoices · disputes flagged · Ofcom auto-comp evaluated · no SLA breaches.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Billing cycle close: 12.4M invoices in flight · Amdocs CES + Ericsson Charging System', 'Billing'), focus: { route: '/bss/billing', target: 'page' } },
    e(2, 'observe', 'Pre-flight check: mediation reconciliation 99.93% · interconnect billing files ingested', 'Billing'),
    e(4, 'log', 'Anomaly: 4,820 invoices 25%+ above prior cycle · auto-flag for review', 'Billing', 'warn'),
    e(6, 'hypothesize', 'Roaming overage cluster · Easter holiday correlation', 'Decisioning'),
    e(8, 'plan', 'Plan: hold flagged invoices, auto-credit Ofcom-eligible, escalate disputes to care', 'Decisioning'),
    { ...e(10, 'act-snow', 'ServiceNow billing-ops INC0009127 opened · 4,820 invoices on hold', 'Activation'), focus: { route: '/bss/billing', target: 'page' } },
    e(12, 'log', 'Ofcom auto-comp eval: 240 eligible (>2h outage) · £4 credit each applied', 'Billing', 'success'),
    { ...e(14, 'log', '4,580 routed to Salesforce care queue with explanation template', 'Care'), focus: { route: '/bss/collections', target: 'page' } },
    e(17, 'log', 'Bill run release: 12.4M invoices cleared · revenue recognised £298M', 'Billing', 'success'),
    { ...e(19, 'verify', 'Dispute SLA forecast: 94% within 48h · leakage 0.07%', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(21, 'resolve', 'Cycle closed · 240 auto-credits · 4,580 disputes routed · 0 SLA breaches', 'Network', 'success'), focus: { route: '/bss/billing', target: 'page' } },
  ],
};

const bssCharging: SectionScenario = {
  id: 'bss-charging-roaming',
  sectionId: 'bss',
  title: 'Live OCS charging · roaming session',
  subtitle: 'Ericsson Charging System: real-time Diameter Gy flow on a 3GB Roaming Pass session.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Roaming session: CUST-002 in Spain · Roaming Pass EU active · 3GB cap', 'Billing'), focus: { route: '/bss/charging', target: 'page' } },
    e(2, 'observe', 'CCR-Initial: reserve 50MB · OCS validates Roaming Pass entitlement', 'Billing'),
    e(4, 'log', 'CCA-Initial OK · grant 50MB · session bound to PCRF roaming.eu_pass policy', 'Billing'),
    e(6, 'log', 'Periodic CCR-Update: 240 MB consumed · rate £0/MB (in-bundle)', 'Billing'),
    e(8, 'log', 'Threshold 90%: 2.7GB consumed · SMS warn dispatched via Sinch', 'Care', 'warn'),
    e(10, 'plan', 'Plan: at 100% throttle to 64kbps · bill-shock guard active', 'Decisioning'),
    { ...e(12, 'act-snow', 'Hard cap reached · throttle applied · customer offered top-up bundle', 'Billing', 'success'), focus: { route: '/bss/charging', target: 'page' } },
    { ...e(14, 'verify', 'Session end · CCR-Terminate · final reconciliation £0 (bundled)', 'Billing', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', '3GB session billed accurately · zero leakage · bill-shock prevented', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssDunning: SectionScenario = {
  id: 'bss-dunning-recovery',
  sectionId: 'bss',
  title: 'Dunning recovery · D+30 wave',
  subtitle: 'Predictive recovery on 12,840 D+30 accounts — empathy-tone, payment plans, FCA TCF.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', 'D+30 dunning wave: 12,840 accounts in service-restriction state', 'Billing', 'warn'), focus: { route: '/bss/collections', target: 'page' } },
    e(2, 'observe', 'Snowpark ML pre-delinquency model: 4,180 high-recovery · 8,660 standard', 'Decisioning'),
    e(4, 'log', 'Vulnerability check (Ofcom GC C5): 412 flagged · soft-path only', 'Decisioning'),
    e(6, 'plan', 'Plan: empathy-tone SMS to 4,180 · payment-plan offer to 1,820 likely-eligible', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce Service Cloud + Sinch · empathy-tone SMS dispatched', 'Care', 'success'), focus: { route: '/bss/collections', target: 'page' } },
    e(10, 'log', '1,820 payment-plan offers (6mo interest-free) sent in-app + email', 'Care'),
    e(13, 'log', 'Recovery progress: 1,420 paid in full · 920 enrolled in payment plan', 'Billing', 'success'),
    e(15, 'log', '412 vulnerable customers held off-cycle · case manager assigned', 'Care'),
    { ...e(17, 'verify', 'Recovery rate 92% (vs 84% control) · bad-debt forecast −0.4pp', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(19, 'resolve', 'Wave complete · £840k recovered · 412 vulnerable safely held · TCF compliant', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssRevAssurance: SectionScenario = {
  id: 'bss-revenue-assurance',
  sectionId: 'bss',
  title: 'Revenue assurance · IRSF detection',
  subtitle: 'AISQL anomaly detection flags premium-rate fraud on B2B account — auto-block before invoice.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'AISQL AI_AGG fraud signal: B2B-9821 calls to premium-rate destinations · score 0.92', 'Billing', 'critical'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    e(2, 'observe', '£18,420 in suspect calls last 24h · destinations: Latvia, Sao Tome, Cuba', 'Decisioning'),
    e(4, 'log', 'Mediation reconciliation: rates match IRSF tariff signature', 'Billing'),
    e(6, 'hypothesize', 'IRSF (premium-rate fraud) on B2B PBX · likely SIP credentials compromised', 'Decisioning', 'critical'),
    e(8, 'plan', 'Plan: auto-block premium destinations · alert customer security · open SOC ticket', 'Decisioning'),
    { ...e(10, 'act-snow', 'PBX-block applied via PCRF · ServiceNow SecOps SEC-INC-2026-0508-014 opened', 'Activation', 'success'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    e(12, 'log', 'Customer notified via secure channel (Genesys voice + email)', 'Care'),
    e(14, 'log', 'Cisco SecureX CTI feed updated · GSMA T-ISAC anonymised broadcast', 'Activation'),
    { ...e(16, 'verify', 'Block effective · loss prevented £18,420 · false-positive rate 3.1%', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'IRSF case contained · forensic preserved · customer security uplift recommended', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssLoyalty: SectionScenario = {
  id: 'bss-loyalty-mission',
  sectionId: 'bss',
  title: 'Loyalty mission launch · Spotify Premium 3mo',
  subtitle: 'Salesforce Loyalty: tiered mission to 11.2M members — Costa Mondays + Spotify reward.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Loyalty mission launch: Spotify Premium 3 months · cohort 11.2M members', 'Care'), focus: { route: '/bss/loyalty', target: 'page' } },
    e(2, 'observe', 'Tier mix: 4.2M Bronze · 3.8M Silver · 2.6M Gold · 0.6M Platinum', 'Decisioning'),
    e(4, 'log', 'Eligibility: Silver+ tier · music-affinity Snowpark ML score > 0.5 → 4.8M', 'Decisioning'),
    e(6, 'plan', 'Plan: in-app push + email + biometric opt-in · partner-provisioned via SPCS', 'Decisioning'),
    { ...e(8, 'act-care', 'Salesforce Loyalty: mission live · 4.8M targeted · partner attach < 1.4s P95', 'Care', 'success'), focus: { route: '/bss/loyalty', target: 'page' } },
    e(10, 'log', '41,400 redemptions in first 60 minutes · Spotify partner ACK', 'Care', 'success'),
    e(12, 'log', 'Engagement rate +8pp vs control · NPS lift forecast +12 vs non-members', 'Decisioning'),
    { ...e(14, 'verify', 'Mission tracking: ROI 2.1x at 30d · partner spend £842k', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Mission live · 41,400 redemptions day-1 · Platinum invite-only follows', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

// ─── New BSS · Commerce / CRM / Revenue / Finance / Wholesale ──────────────

const bssAccountOnboard: SectionScenario = {
  id: 'bss-account-onboard',
  sectionId: 'bss',
  title: 'Customer Accounts · Tier-1 enterprise onboard',
  subtitle: 'Lloyds Banking Group plc onboarded with 14-line hierarchy, dual-control credit limit, contract instantiated.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Account intake: Lloyds Banking Group plc · enterprise tier · 14-line hierarchy', 'Decisioning'), focus: { route: '/bss/accounts', target: 'page' } },
    e(2, 'observe', 'Credit bureau pull: Experian risk B · proposed limit £120k · approval needed', 'Decisioning'),
    e(4, 'log', 'Hierarchy mapped: Lloyds Banking Group → 4 BUs → 240+92+184+64 lines = 580 lines total', 'Decisioning'),
    e(6, 'plan', 'Plan: dual-control credit limit, MSA template, billing accounts × 4, invoice consolidation parent-level', 'Decisioning'),
    { ...e(9, 'act-snow', 'Account ACC-7401 created · 4 billing accounts · MSA v3 attached · credit limit dual-approved', 'Activation', 'success'), focus: { route: '/bss/accounts', target: 'page' } },
    e(12, 'log', 'Contract OPP-3812 instantiated · 580 lines provisioned via TMF 622 · order shell created', 'Care'),
    { ...e(15, 'verify', 'Onboarded · ARPU forecast £42.4k/mo · NPS 9 (advocate) · 0 compliance flags', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Account live · gold.accounts + gold.account_hierarchy + gold.credit_register updated', 'Network', 'success'), focus: { route: '/bss/accounts', target: 'page' } },
  ],
};

const bssCaseSlaBreach: SectionScenario = {
  id: 'bss-case-sla-breach',
  sectionId: 'bss',
  title: 'Cases · 42 SLA-risk cases auto-rerouted',
  subtitle: 'Care queue overload after campaign launch; Cortex auto-triage reroutes 42 high-priority cases; SLA preserved.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '42 P1/P2 cases at SLA risk · queue overload · case_triage_v2.4 anomaly', 'Decisioning', 'warn'), focus: { route: '/bss/cases', target: 'page' } },
    e(2, 'observe', 'Driver: 5G Hero campaign launch · billing-query cases +148% in 4h', 'Decisioning'),
    e(4, 'hypothesize', 'AI triage finds 28 of 42 are billing-query duplicates · auto-merge candidate', 'Decisioning'),
    e(6, 'plan', 'Plan: auto-merge duplicates · borrow 8 specialists from voice queue · publish KB shortcut', 'Decisioning'),
    { ...e(8, 'act-care', 'Auto-routed · 28 merged · 14 reassigned to specialist queue · KB shortcut live', 'Care', 'success'), focus: { route: '/bss/cases', target: 'page' } },
    e(11, 'log', 'MTTR on cohort 1:48 (vs 4:12 baseline) · 0 SLA breaches · CSAT 0.86', 'Care', 'success'),
    { ...e(13, 'verify', 'Queue normalised in 38 min · zero P1 breach · gold.cases + gold.sla_register updated', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Case storm contained · audit to gold.decision_lineage · GDPR Art.6 logged', 'Network', 'success'), focus: { route: '/bss/cases', target: 'page' } },
  ],
};

const bssInteractionStitch: SectionScenario = {
  id: 'bss-interaction-stitch',
  sectionId: 'bss',
  title: 'Interactions · CUST-001 cross-channel stitch',
  subtitle: 'Same customer hits 5 channels in 4h; identity graph stitches, NBA suppressed to avoid fatigue.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'CUST-001 footprint: 5 channels in 4h (app · chat · voice · email · retail walk-in)', 'Decisioning'), focus: { route: '/bss/interactions', target: 'page' } },
    e(2, 'observe', 'identity_resolution_v3 stitch confidence 0.97 · same root persistent_id', 'Decisioning'),
    e(4, 'log', 'Topic clusters: M14 5G complaint (3 channels) · billing query (1) · plan upgrade interest (1)', 'Decisioning'),
    e(6, 'plan', 'Plan: suppress all outbound NBAs for 24h · feed care brief · auto-link to NOC fix-window', 'Decisioning'),
    { ...e(8, 'act-care', 'NBA suppressed · agent desktop briefed · 1 unified case opened (3 dupes merged)', 'Care', 'success'), focus: { route: '/bss/interactions', target: 'page' } },
    e(11, 'log', 'Customer fatigue avoided · CSAT prediction 0.84 · resolved in next session', 'Care', 'success'),
    { ...e(13, 'verify', 'Cross-channel stitch · NBA fatigue suppressed · gold.interactions refreshed', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Identity stitch resolved · GDPR Art.6 lawful-basis logged · audit to gold.decision_lineage', 'Network', 'success'), focus: { route: '/bss/interactions', target: 'page' } },
  ],
};

const bssRenewalWindow: SectionScenario = {
  id: 'bss-renewal-window',
  sectionId: 'bss',
  title: 'Pipeline · Tier-1 renewal at 30d, churn 0.62',
  subtitle: 'Lloyds renewal at 30-day window with elevated churn risk; specialist alerted, save plan auto-drafted.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Lloyds Banking Group OPP-3812 renewal in 30d · renewal_propensity_v2 churn 0.62', 'Decisioning', 'warn'), focus: { route: '/bss/pipeline', target: 'page' } },
    e(2, 'observe', 'Drivers: usage −18% QoQ · 4 open billing complaints · competitor RFP detected via Cortex Search', 'Decisioning'),
    e(4, 'hypothesize', 'Save plan: price-match (margin floor 28% holds), add 24/7 SLA, Disney+ for executives', 'Decisioning'),
    e(6, 'plan', 'Plan: route to enterprise save desk · auto-draft proposal · CFO sign-off needed for SLA upgrade', 'Decisioning'),
    { ...e(9, 'act-care', 'Specialist paged · Cortex Agent drafts proposal v1 · CFO sign-off requested', 'Care', 'success'), focus: { route: '/bss/pipeline', target: 'page' } },
    e(12, 'log', 'Save plan accepted in 4d · 36mo renewal at £420k/yr · margin held 31%', 'Care', 'success'),
    { ...e(15, 'verify', 'Renewal saved · CLV protected £1.5M · churn risk 0.62 → 0.18', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Renewal closed · gold.contracts + gold.renewal_register updated · CFO audit logged', 'Network', 'success'), focus: { route: '/bss/pipeline', target: 'page' } },
  ],
};

const bssSubPlanChange: SectionScenario = {
  id: 'bss-sub-plan-change',
  sectionId: 'bss',
  title: 'Subscription · plan change to 5G Unlimited Max',
  subtitle: 'CUST-001 upgrades plan; pro-rata, entitlement provisioned, SIM/MSISDN preserved.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Plan-change request: CUST-001 · "5G Hero · Unlimited Max" · in-app journey', 'Care'), focus: { route: '/bss/subscriptions', target: 'page' } },
    e(2, 'observe', 'Eligibility: contract end 21d · margin floor OK · no vulnerability flag', 'Decisioning'),
    e(4, 'log', 'Pro-rata: £14.20 credit on current cycle · new plan £42/mo from D+1', 'Decisioning'),
    e(6, 'plan', 'Plan: keep MSISDN + eSIM profile · push entitlement v126 · update gold.subscriptions', 'Decisioning'),
    { ...e(8, 'act-snow', 'Subscription updated · 4 services rebound · entitlement provisioned <1.4s P95', 'Activation', 'success'), focus: { route: '/bss/subscriptions', target: 'page' } },
    e(11, 'log', 'Welcome email + push fired · CSAT pred 0.88', 'Care'),
    { ...e(13, 'verify', 'Plan change live · ARPU +£12/mo · 0 service interruptions', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Plan change complete · gold.subscriptions + gold.services updated · audit logged', 'Network', 'success'), focus: { route: '/bss/subscriptions', target: 'page' } },
  ],
};

const bssMediationSuspenseSpike: SectionScenario = {
  id: 'bss-mediation-suspense-spike',
  sectionId: 'bss',
  title: 'Mediation · suspense spike auto-recovered',
  subtitle: 'Roaming partner schema drift fills suspense queue; auto-replay after schema patch; SLA preserved.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Suspense queue: 412 → 6,400 in 4 min · mediation_anomaly_v3 critical', 'Decisioning', 'critical'), focus: { route: '/bss/mediation', target: 'page' } },
    e(2, 'observe', 'Source: Vodafone DE TAP3 schema column rename · 92% of new suspense from this partner', 'Decisioning'),
    e(4, 'hypothesize', 'Auto-patch via mediation rule v124 · backfill from suspense', 'Decisioning'),
    e(6, 'plan', 'Plan: deploy rule v124 · replay 6,400 events from suspense · fail-fast on second mismatch', 'Decisioning'),
    { ...e(8, 'act-snow', 'Rule v124 deployed · replay started · 6,400 → 412 in 2 min', 'Activation', 'success'), focus: { route: '/bss/mediation', target: 'page' } },
    e(11, 'log', 'P95 latency held 184ms · 0 SLA breach · partner notified', 'Care', 'success'),
    { ...e(13, 'verify', 'Suspense back to baseline · 0 late events · 0 dedupe regressions', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Mediation healthy · gold.mediation_events + gold.suspense_register updated', 'Network', 'success'), focus: { route: '/bss/mediation', target: 'page' } },
  ],
};

const bssBillRunCycle04: SectionScenario = {
  id: 'bss-bill-run-cycle04',
  sectionId: 'bss',
  title: 'Bill-Run · CYCLE-04 month-end',
  subtitle: '13.8M-row month-end run; pre-bill QA passes 99.84%; 412 exceptions auto-triaged.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'CYCLE-04 month-end started · 13.8M rows · ETA 14:42', 'Care'), focus: { route: '/bss/bill-run', target: 'page' } },
    e(3, 'observe', 'Pre-bill QA running · pass rate 99.84% · 2,184 fails (expected 2,400 baseline)', 'Decisioning'),
    e(6, 'log', 'Top failure: tariff-lookup miss (832) · auto-route to tariff team · runbook BR-TFM-118', 'Decisioning'),
    e(9, 'plan', 'Plan: 412 bill-gen exceptions · triage with pre_bill_qa_v2 · auto-fix 248 · escalate 164', 'Decisioning'),
    { ...e(12, 'act-snow', '248 auto-fixed · 164 in queue · cycle continuing · ETA held', 'Activation', 'success'), focus: { route: '/bss/bill-run', target: 'page' } },
    e(15, 'log', 'Top high-bill anomaly: ACC-7401 +133% vs prior · auto-flag for revenue assurance', 'Care'),
    e(18, 'log', 'Cycle 100% · 13.8M bills generated · 412 exceptions cleared · 0 SLA breach', 'Care', 'success'),
    { ...e(20, 'verify', 'Bill run complete · QA pass 99.84% · audit to gold.billing_cycle', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(21, 'resolve', 'CYCLE-04 closed · gold.pre_bill_qa + gold.bill_exceptions updated · CFO daily brief', 'Network', 'success'), focus: { route: '/bss/bill-run', target: 'page' } },
  ],
};

const bssPortInBurst: SectionScenario = {
  id: 'bss-port-in-burst',
  sectionId: 'bss',
  title: 'Numbers · 240 port-in burst',
  subtitle: 'Competitor outage drives 240 port-ins in 1h; auto-validation, cutover scheduled within Ofcom 1-day SLA.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Port-in queue spike: 240 in 1h vs baseline 38 · likely competitor incident', 'Decisioning', 'warn'), focus: { route: '/bss/numbers', target: 'page' } },
    e(2, 'observe', 'Donor mix: 184 EE · 38 Three · 18 Vodafone · 0 O2', 'Decisioning'),
    e(4, 'log', 'Auto-validation: 232 pass · 8 require evidence · all PAC codes verified', 'Decisioning'),
    e(6, 'plan', 'Plan: schedule cutovers across next 18h within Ofcom 1-day SLA · auto-confirmation push', 'Decisioning'),
    { ...e(8, 'act-snow', 'Cutovers scheduled · 232 confirmed · 8 awaiting evidence · MSISDNs reserved', 'Activation', 'success'), focus: { route: '/bss/numbers', target: 'page' } },
    e(11, 'log', 'Day-1 cutover complete · 232 ports successful · 8 cleared after evidence', 'Care', 'success'),
    e(13, 'log', 'Ofcom MNP success rate 99.6% · 0 SLA breaches', 'Decisioning'),
    { ...e(15, 'verify', '240 ports landed · ARPU forecast +£4.8k/mo · NPS lift on cohort', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Burst absorbed · gold.port_register + gold.pac_codes updated · Ofcom audit-ready', 'Network', 'success'), focus: { route: '/bss/numbers', target: 'page' } },
  ],
};

const bssQuoteB2bFastTrack: SectionScenario = {
  id: 'bss-quote-b2b-fast-track',
  sectionId: 'bss',
  title: 'Quote-to-Order · B2B fast-track',
  subtitle: 'Tier-1 enterprise quote scored high-win; auto-priced + dual-sign-off routed; converted in 6h.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'New quote: Brookfield Logistics · 184 lines · est £184k/yr', 'Decisioning'), focus: { route: '/bss/quote-to-order', target: 'page' } },
    e(2, 'observe', 'quote_win_propensity_v2 = 0.88 · account ARPU history strong', 'Decisioning'),
    e(4, 'log', 'Auto-pricing engine: standard discounts + Tier-1 SLA · margin 31.4% (floor 28%)', 'Decisioning'),
    e(6, 'plan', 'Plan: fast-track route · single sales-engineer review · CFO dual-sign-off auto-collected', 'Decisioning'),
    { ...e(8, 'act-snow', 'Quote v3 sent · 6h SLA on customer signature · DocuSign live', 'Activation', 'success'), focus: { route: '/bss/quote-to-order', target: 'page' } },
    e(11, 'log', 'Customer signed in 4h · order placed · TMF 622 order-to-activate kicked off', 'Care', 'success'),
    e(13, 'log', '184 lines provisioned · MSISDNs reserved · billing accounts created', 'Decisioning'),
    { ...e(15, 'verify', 'Q→O 4h vs 7d baseline · win-rate +18pp on fast-track segment', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Order live · gold.quotes + gold.opportunities + gold.contracts updated', 'Network', 'success'), focus: { route: '/bss/quote-to-order', target: 'page' } },
  ],
};

const bssDisputeBillShock: SectionScenario = {
  id: 'bss-dispute-bill-shock',
  sectionId: 'bss',
  title: 'Disputes · billing-side resolution + GL impact',
  subtitle: '240 bill-shock disputes hit BSS dispute desk · 80% auto-fast-resolved · refunds posted to gold.dispute_credits · GL impact −£24k reversed in same period.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', '240 disputes opened in 6h · driver: bill-shock from EU roaming', 'Decisioning', 'warn'), focus: { route: '/bss/disputes', target: 'page' } },
    e(2, 'observe', 'dispute_triage_v2.1 confidence 0.92 · 192 of 240 are clear refund-eligible', 'Decisioning'),
    e(4, 'hypothesize', 'Auto-refund 192 within margin floor · 48 require human dual-control review', 'Decisioning'),
    e(6, 'plan', 'Plan: auto-refund £42 avg per case · adjust gold.refund_ledger · evidence packs auto-built', 'Decisioning'),
    { ...e(9, 'act-snow', '192 auto-refunded · 48 routed to dual-control queue · Ofcom auto-comp eligible', 'Activation', 'success'), focus: { route: '/bss/disputes', target: 'page' } },
    e(12, 'log', 'Refund total £8,064 · 0 dual-control breaches · CSAT lift on cohort +0.18', 'Care', 'success'),
    e(15, 'log', 'Dispute backlog cleared in 24h · SLA 8d · MTTR 6h', 'Decisioning'),
    { ...e(17, 'verify', '240 disputes resolved · 0 Ofcom escalations · refund ledger auditable', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(19, 'resolve', 'Cohort triage closed · gold.disputes + gold.adjustments + gold.refund_ledger updated', 'Network', 'success'), focus: { route: '/bss/disputes', target: 'page' } },
  ],
};

const bssRevRecQuarterClose: SectionScenario = {
  id: 'bss-revrec-quarter-close',
  sectionId: 'bss',
  title: 'Revenue Recognition · quarter close',
  subtitle: 'IFRS 15 quarter close; 14.2M obligations recognised; CFO audit pack auto-generated.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', 'Quarter close started · 14.2M open performance obligations', 'Decisioning'), focus: { route: '/bss/revrec', target: 'page' } },
    e(3, 'observe', 'Allocation engine: standalone selling prices applied · revrec_allocation_v3 · MAPE 1.4%', 'Decisioning'),
    e(6, 'log', 'Recognised this quarter: £42.6M · contract assets −£1.2M · capitalised commissions amortised', 'Decisioning'),
    e(9, 'plan', 'Plan: lock the period · auto-build CFO audit pack · IFRS 15 disclosures generated', 'Decisioning'),
    { ...e(12, 'act-snow', 'Period locked · audit pack v3 generated · external auditor link issued', 'Activation', 'success'), focus: { route: '/bss/revrec', target: 'page' } },
    e(15, 'log', 'Deferred revenue Q-close £181.6M · MRR £142M · ARR £1.7B · CFO sign-off requested', 'Care'),
    { ...e(17, 'verify', 'Quarter close ready · 0 control breaches · audit-ready', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(19, 'resolve', 'Quarter closed · gold.revrec_obligations + gold.deferred_revenue updated · IFRS 15 audit', 'Network', 'success'), focus: { route: '/bss/revrec', target: 'page' } },
  ],
};

const bssVatMtdSubmit: SectionScenario = {
  id: 'bss-vat-mtd-submit',
  sectionId: 'bss',
  title: 'Tax · HMRC MTD VAT return',
  subtitle: 'Quarter VAT return auto-built from gold.tax_ledger and submitted via HMRC MTD API.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'VAT return Q4 due in 7d · £18.4M owed · MTD digital link verified', 'Decisioning'), focus: { route: '/bss/tax', target: 'page' } },
    e(2, 'observe', 'Pre-submission QA: 100% line-coverage · 0 unmapped tax codes · MTD-compliant', 'Decisioning'),
    e(4, 'log', 'Auto-build of VAT100 · 184M bill lines aggregated · supplementary JSON ready', 'Decisioning'),
    e(6, 'plan', 'Plan: tax-team review · CFO sign-off · submit via HMRC MTD API', 'Decisioning'),
    { ...e(8, 'act-snow', 'CFO signed · submitted to HMRC · receipt VAT100-2026-Q4-184k', 'Activation', 'success'), focus: { route: '/bss/tax', target: 'page' } },
    e(11, 'log', 'HMRC ACK received · payment scheduled BACS D+1 · 0 errors', 'Care', 'success'),
    { ...e(13, 'verify', 'VAT submitted · receipt logged · 0 HMRC follow-up', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'VAT return done · gold.tax_ledger + gold.regulatory_register updated · 4y retention', 'Network', 'success'), focus: { route: '/bss/tax', target: 'page' } },
  ],
};

const bssGlPeriodClose: SectionScenario = {
  id: 'bss-gl-period-close',
  sectionId: 'bss',
  title: 'GL · period close + 14 exceptions cleared',
  subtitle: 'Month-end GL post to SAP S/4; 14 recon exceptions auto-cleared; period locked.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Period close started · 184k journals queued · 14 exceptions open', 'Decisioning'), focus: { route: '/bss/gl', target: 'page' } },
    e(3, 'observe', 'gl_recon_v3 confidence 0.95 · 12 of 14 exceptions are timing differences', 'Decisioning'),
    e(6, 'log', 'Top variance: 600-Tax · VAT +13.6% MoM (driven by promotions) · attested', 'Decisioning'),
    e(9, 'plan', 'Plan: auto-clear 12 timing diffs · escalate 2 to controller · post + lock', 'Decisioning'),
    { ...e(12, 'act-snow', '12 cleared · 2 escalated and resolved · 184k journals posted to SAP S/4', 'Activation', 'success'), focus: { route: '/bss/gl', target: 'page' } },
    e(14, 'log', 'Recon match 99.86% · period locked · trial balance reconciles to source', 'Care', 'success'),
    { ...e(16, 'verify', 'Period closed · 0 open exceptions · audit-ready', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Period close · gold.gl_journals + gold.recon_exceptions + gold.period_close updated', 'Network', 'success'), focus: { route: '/bss/gl', target: 'page' } },
  ],
};

const bssWholesaleMonthClose: SectionScenario = {
  id: 'bss-wholesale-month-close',
  sectionId: 'bss',
  title: 'Wholesale · MVNO month close',
  subtitle: 'Settlements computed for 14 MVNO partners; exceptions auto-cleared; net £8.2M favourable.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Wholesale month close · 14 MVNO partners · 1.84M wholesale subs', 'Decisioning'), focus: { route: '/bss/wholesale', target: 'page' } },
    e(3, 'observe', 'wholesale_settlement_v2 reconciles 99.4% · 4 small exceptions (FX-rate, late events)', 'Decisioning'),
    e(6, 'log', 'Settlement preview: net +£8.2M favourable · 14 partners in tolerance', 'Decisioning'),
    e(9, 'plan', 'Plan: auto-clear 4 exceptions · publish settlements · partner statements via SFTP', 'Decisioning'),
    { ...e(12, 'act-snow', 'Settlements published · partner SFTP delivery · 0 partner SLA breach', 'Activation', 'success'), focus: { route: '/bss/wholesale', target: 'page' } },
    e(14, 'log', 'Disputes raised: 1 (Lebara · age 0.4d) · auto-routed to wholesale ops', 'Care'),
    { ...e(16, 'verify', 'Month-close ready · all partners settled · ledger reconciles', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Wholesale closed · gold.wholesale_contracts + gold.partner_settlements updated', 'Network', 'success'), focus: { route: '/bss/wholesale', target: 'page' } },
  ],
};

const bssSettlementSpain: SectionScenario = {
  id: 'bss-settlement-spain',
  sectionId: 'bss',
  title: 'Settlement · Spain TAP3 mismatch reconciled',
  subtitle: 'Telefónica ES TAP3 inbound mismatch detected; auto-reconcile delta, dispute opened with evidence pack.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Telefónica ES TAP3 mismatch · £42k delta · tap3_reconcile_v2.4 anomaly', 'Decisioning', 'warn'), focus: { route: '/bss/settlement', target: 'page' } },
    e(3, 'observe', 'Delta source: 1,420 records with rounded vs precise tariff disagreement (€0.018/min)', 'Decisioning'),
    e(6, 'hypothesize', 'Partner tariff schedule update not reflected in our schema · auto-patch ready', 'Decisioning'),
    e(9, 'plan', 'Plan: auto-reconcile via partner schedule v3 · open dispute with evidence · ledger adjustment', 'Decisioning'),
    { ...e(12, 'act-snow', 'Schema patched · 1,420 records re-rated · dispute SET-2026-184 opened', 'Activation', 'success'), focus: { route: '/bss/settlement', target: 'page' } },
    e(14, 'log', 'Telefónica ES auto-acknowledged · dispute resolved in 3d (favourable)', 'Care', 'success'),
    { ...e(16, 'verify', 'TAP3 reconciles · £42k recovered · 0 settlement SLA breach', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Settlement closed · gold.tap3_reconcile + gold.partner_settlements updated', 'Network', 'success'), focus: { route: '/bss/settlement', target: 'page' } },
  ],
};

const bssPromoStackingConflict: SectionScenario = {
  id: 'bss-promo-stacking-conflict',
  sectionId: 'bss',
  title: 'Promotions · stacking conflict auto-resolved',
  subtitle: '5G Hero £5 credit + Disney+ trial collide on 1,840 customers; promo_stacking_v3 resolves per policy.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Stacking conflict: 1,840 customers eligible for 5G Hero credit + Disney+ trial', 'Decisioning', 'warn'), focus: { route: '/bss/promotions', target: 'page' } },
    e(2, 'observe', 'Stacking policy v3: only 1 commercial offer per 7d · 5G Hero is higher value', 'Decisioning'),
    e(4, 'log', 'Resolution: keep 5G Hero · suppress Disney trial reminder · queue for next 7d window', 'Decisioning'),
    e(6, 'plan', 'Plan: write resolution to gold.promo_eligibility · audit decision · NBA model honors', 'Decisioning'),
    { ...e(8, 'act-snow', '1,840 resolutions written · suppression flagged · 0 customer-visible duplicates', 'Activation', 'success'), focus: { route: '/bss/promotions', target: 'page' } },
    e(11, 'log', 'Disney trial re-queued for D+8 · 184 fraud-on-promo blocked separately', 'Care'),
    { ...e(13, 'verify', 'Conflict resolved · 0 stacking violations · NBA respected', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Stacking resolved · gold.promo_eligibility + gold.decision_lineage updated', 'Network', 'success'), focus: { route: '/bss/promotions', target: 'page' } },
  ],
};

// ─── BSS Tier-1 ML scenarios ────────────────────────────────────────────

const bssBillShockPrevent: SectionScenario = {
  id: 'bss-bill-shock-prevent',
  sectionId: 'bss',
  title: 'Bill-shock prevented · 18.4k cohort treated',
  subtitle: 'bill_shock_v2.4 spots 18.4k at-risk customers next 14d · auto-treats 14.2k via Roaming Pass push.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'bill_shock_v2.4 forecast: 18,420 at-risk customers next 14d', 'Decisioning', 'warn'), focus: { route: '/bss/billing', target: 'page' } },
    e(2, 'observe', 'Severity split: 412 severe (>5x avg) · 2,840 moderate (2-5x) · 15,168 mild', 'Decisioning'),
    e(4, 'hypothesize', 'Top driver: travel pattern + no Roaming Pass · 14.2k auto-treatable', 'Decisioning'),
    e(6, 'plan', 'Plan: Roaming Pass auto-push for 14.2k · soft cap nudge for 2.8k · pre-bill SMS for 412', 'Decisioning'),
    { ...e(9, 'act-care', 'Salesforce MC dispatched · 14,180 Roaming Pass pushes · 2,840 cap nudges · 412 SMS', 'Care', 'success'), focus: { route: '/bss/billing', target: 'page' } },
    e(12, 'log', '8,940 enrolled · forecast bill-shock cases avoided ~12,400', 'Care', 'success'),
    e(14, 'log', 'Avoided bill-shock revenue impact £42k/wk · CSAT lift on cohort +0.18', 'Decisioning'),
    { ...e(16, 'verify', 'Cohort treated · GDPR Art.6 + Ofcom GC C4 fairness honored', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Bill-shock prevention complete · gold.bill_shock_features updated', 'Network', 'success'), focus: { route: '/bss/billing', target: 'page' } },
  ],
};

const bssEclPeriodClose: SectionScenario = {
  id: 'bss-ecl-period-close',
  sectionId: 'bss',
  title: 'IFRS 9 ECL · period-close provision',
  subtitle: 'bad_debt_ecl_v3 closes the quarter at £24.4M ECL · auditor-ready Stage 1/2/3 movement.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Quarter close started · bad_debt_ecl_v3 ECL run kicks off · 6.4M accounts', 'Decisioning'), focus: { route: '/bss/collections', target: 'page' } },
    e(3, 'observe', 'Macro overlay: base case · DPD distribution · Stage 1 18.2M · Stage 2 4.8M · Stage 3 1.4M', 'Decisioning'),
    e(6, 'log', 'Movement: +£1.84M new Stage 1 · +£2.24M Stage 1→2 · +£1.08M Stage 2→3 · −£3.16M recoveries+writeoffs', 'Decisioning'),
    e(9, 'plan', 'Plan: lock the ECL · auto-build IFRS 9 disclosure · CFO sign-off · SOX evidence captured', 'Decisioning'),
    { ...e(12, 'act-snow', 'ECL £22.4M → £24.4M · auditor pack v3 generated · external auditor link issued', 'Activation', 'success'), focus: { route: '/bss/collections', target: 'page' } },
    e(14, 'log', 'CFO sign-off requested · period-close gating moves to ready', 'Care'),
    { ...e(16, 'verify', 'IFRS 9 quarter-close ready · 0 control breaches · audit-ready', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'ECL closed · gold.ecl_provisions updated · disclosure paragraph in audit pack', 'Network', 'success'), focus: { route: '/bss/collections', target: 'page' } },
  ],
};

const bssFalloutPrevented: SectionScenario = {
  id: 'bss-fallout-prevented',
  sectionId: 'bss',
  title: 'Order fallout · 248 saved before stage 4',
  subtitle: 'order_fallout_v2.1 catches 412 at-risk orders · 248 auto-remediated · saves £184k.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'order_fallout_v2.1 flags 412 at-risk orders out of 14,820 in flight', 'Decisioning', 'warn'), focus: { route: '/bss/order-to-activate', target: 'page' } },
    e(2, 'observe', 'Top drivers: PAC mismatch (132) · credit hold (92) · tariff lookup (74) · address (58)', 'Decisioning'),
    e(4, 'hypothesize', '248 of 412 are deterministic auto-fixes · 164 need human triage', 'Decisioning'),
    e(6, 'plan', 'Plan: auto-resend PAC · catalog refresh · pre-filled address · KYC step-up · escalate the 164', 'Decisioning'),
    { ...e(8, 'act-snow', '248 auto-remediated · 164 routed to ops queue with reason context', 'Activation', 'success'), focus: { route: '/bss/order-to-activate', target: 'page' } },
    e(11, 'log', 'Remediated orders converting at 92% · ops queue MTTR 38 min', 'Care', 'success'),
    e(13, 'log', 'Saved revenue forecast £184k · 0 SLA breaches · audit row written', 'Decisioning'),
    { ...e(15, 'verify', 'Fallout rate 2.8% (vs 4.6% baseline) · gold.order_fallout_features updated', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Fallout campaign closed · ops dashboard cleared · feedback loop fed', 'Network', 'success'), focus: { route: '/bss/order-to-activate', target: 'page' } },
  ],
};

const bssCrossSellFired: SectionScenario = {
  id: 'bss-cross-sell-fired',
  sectionId: 'bss',
  title: 'Cross-sell · 12.4k Disney+ attaches · £750k ARR',
  subtitle: 'cross_sell_propensity_v2 surfaces Disney+ NBA · 12.4k attaches × £0.42 ARPU = £5.2k MRR / £750k ARR; partner co-marketing share of margin baked in.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Cross-sell wave: cross_sell_propensity_v2 ranks 1.84M eligible · top NB-product Disney+', 'Decisioning'), focus: { route: '/bss/subscriptions', target: 'page' } },
    e(2, 'observe', '38% of recs are Disney+ · 22% Roaming Pass auto-enrol · 18% 5G Hero upgrade', 'Decisioning'),
    e(4, 'log', 'Suppression: vulnerability flag (24k) + frequency cap (184k) + offer fatigue (42k)', 'Decisioning'),
    e(6, 'plan', 'Plan: Salesforce MC · in-app modal + email · 1.6M reachable cohort · 5% holdout', 'Decisioning'),
    { ...e(8, 'act-care', 'Wave dispatched · in-app modal · 1.6M reach · provisioning ready via SPCS', 'Care', 'success'), focus: { route: '/bss/subscriptions', target: 'page' } },
    e(11, 'log', 'Day-3: 12,400 Disney+ attaches · 6.4k Roaming Pass enrols · 0 customer-visible duplicates', 'Care', 'success'),
    e(13, 'log', 'ARPU lift +£0.42 per converter · entitlement provisioned <1.4s P95', 'Decisioning'),
    { ...e(15, 'verify', 'Cross-sell complete · gold.cross_sell_features + gold.bundle_attach updated', 'Decisioning', 'success'), focus: { route: '/bss/subscriptions', target: 'page' } },
  ],
};

const bssExplainBillSpike: SectionScenario = {
  id: 'bss-explain-bill-spike',
  sectionId: 'bss',
  title: 'Bill anomaly · ACC-7401 explained in NL',
  subtitle: 'bill_explainer_v1.4 (Cortex Complete) generates a plain-English explanation of ACC-7401 +133% bill spike for the care desk.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'High-bill anomaly: ACC-7401 +133% vs prior cycle · Lloyds Banking Group plc', 'Decisioning', 'warn'), focus: { route: '/bss/bill-run', target: 'page' } },
    e(2, 'observe', 'Bill-line breakdown: roaming £18.4k · int. calls £420 · device-finance £1.2k', 'Decisioning'),
    e(4, 'hypothesize', 'Legitimate spend (procurement-driven travel + new BU) · not a billing error', 'Decisioning'),
    e(6, 'plan', 'Plan: Cortex Complete drafts care brief · attach to account · alert retention specialist', 'Decisioning'),
    { ...e(8, 'act-care', 'Care brief generated and attached · retention specialist alerted', 'Care', 'success'), focus: { route: '/bss/bill-run', target: 'page' } },
    e(10, 'log', 'Recommendation: offer Roaming Pass back-credit £4.2k · enrol 240 UK lines on auto-Pass', 'Care'),
    e(12, 'log', 'Margin floor 31% holds (above 28% policy) · CFO not required for sign-off', 'Decisioning', 'success'),
    { ...e(14, 'verify', 'Account briefed · audit row to gold.decision_lineage · 0 manual escalation', 'Decisioning', 'success'), focus: { route: '/bss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Bill anomaly explained · ACC-7401 retention call scheduled · GDPR Art.22 logged', 'Network', 'success'), focus: { route: '/bss/bill-run', target: 'page' } },
  ],
};

// ─── New BSS scenarios (regulatory + finance gap closure) ────────────────────
const bssConsumerDuty: SectionScenario = {
  id: 'bss-fca-consumer-duty',
  sectionId: 'bss',
  title: 'FCA Consumer Duty · foreseeable-harm sweep',
  subtitle: 'FCA Consumer Duty (Jul 2023): proactive foreseeable-harm assessment across vulnerable + financially-stressed cohorts · auto-remediation + board-level evidence pack.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Consumer Duty Q-end review · 4,820 customers flagged for foreseeable-harm assessment (price · service · vulnerability)', 'Decisioning', 'warn'), focus: { route: '/bss/disputes', target: 'dispute-queue' } },
    e(2, 'observe', 'Cortex AI_AGG over 30d: bill-size jumps × payment-failures × case-volume × vulnerable-register', 'Decisioning'),
    e(4, 'log', 'Cohorts: 1,820 price-shock · 1,420 service-shock · 1,180 vulnerable-without-bill-pause · 400 mixed', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Per-cohort harm assessment + remedy mapping · pre-approved Consumer Duty playbook PB-CD-014', 'Decisioning'), focus: { route: '/bss/cases', target: 'page' } },
    e(8, 'plan', 'Plan: bill-pause for 1,180 vulnerable · goodwill credit + tariff review for 1,820 price-shock · case escalation for 1,420 service-shock', 'Decisioning'),
    { ...e(11, 'act-care', 'Salesforce Service Cloud · 4,820 actions queued · trained CD-aware specialists · FCA evidence captured per case', 'Care', 'success'), focus: { route: '/bss/cases', target: 'page' } },
    e(14, 'log', 'Outcomes: 1,180 bill-paused · 1,420 case-escalated to specialist queue · 1,820 goodwill credits issued (avg £14)', 'Care', 'success'),
    { ...e(17, 'verify', 'FCA Consumer Duty board pack drafted · Cortex Complete summary · 100% cases logged in gold.consumer_duty_register', 'Decisioning', 'success'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    { ...e(20, 'resolve', 'Quarterly review complete · 4,820 customers actioned · evidence-pack ready for FCA · 0 foreseeable-harm gaps', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssAcquisitionFraud: SectionScenario = {
  id: 'bss-acquisition-fraud',
  sectionId: 'bss',
  title: 'Acquisition fraud · synthetic-ID at sign-up',
  subtitle: 'Experian + D&B + Stripe Radar fusion catches synthetic-identity fraud at sign-up · 38 of 1,420 daily applications blocked before SIM activation · saves £14k bad-debt.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', '1,420 mobile sign-ups in last 24h · 38 flagged by acq_fraud_v2 (Experian + D&B + Stripe Radar fusion) · risk score > 0.86', 'Decisioning', 'warn'), focus: { route: '/bss/accounts', target: 'page' } },
    e(2, 'observe', 'Pattern: 38 share device fingerprint cluster · burst velocity 14 sign-ups in 6 min · IP from datacentre range', 'Decisioning'),
    e(4, 'log', 'Experian credit-check fail rate 86% on suspect cohort vs 4% baseline · 14 thin-file synthetic IDs', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Synthetic-ID ring · auto-block before SIM activation · referral to NCA via NCSC fraud reporting', 'Decisioning', 'warn'), focus: { route: '/bss/accounts', target: 'page' } },
    e(8, 'plan', 'Plan: hard-block 38 applications · soft-step-up biometric for 142 boundary cases · refund auth-holds within 48h', 'Decisioning'),
    { ...e(10, 'act-snow', 'Amdocs OMS · 38 applications cancelled before SIM activation · Stripe auth refunded · NCA SAR filed', 'Activation', 'success'), focus: { route: '/bss/accounts', target: 'page' } },
    e(13, 'log', 'Avoided bad debt: 38 × £42 first month + £380 device finance liability = £14k saved · 14 boundary cases passed step-up', 'Decisioning'),
    { ...e(16, 'verify', 'Acq-fraud KPI: precision 0.94 · recall 0.88 · false-positive impact 4 customers contacted apologetically', 'Decisioning', 'success'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    { ...e(18, 'resolve', 'Daily fraud sweep complete · 38 blocked · gold.acq_fraud_register updated · weekly retrain queued', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssTariffRetirement: SectionScenario = {
  id: 'bss-tariff-retirement',
  sectionId: 'bss',
  title: 'Tariff retirement · 240k mass migration · Ofcom GC C1.5',
  subtitle: 'Legacy "SnowTelco Plus" retired · 240k customers migrated to nearest equivalent · 30-day notification · churn-risk model surfaces high-value cohort for white-glove treatment.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', 'CFO mandate: retire SnowTelco Plus (legacy 2019 tariff) by Q3 · 240k customers to migrate · Ofcom GC C1.5 30-day notification clock starts', 'Decisioning', 'warn'), focus: { route: '/bss/catalog', target: 'page' } },
    e(2, 'observe', 'Migration mapping: 184k → SnowTelco Lite (cheaper, fewer GB) · 38k → SnowTelco Standard (similar) · 18k → no-equivalent (need bespoke)', 'Decisioning'),
    e(4, 'log', 'Cohort: avg ARPU £24, total MRR £5.7M · 18k high-CLV deserve white-glove · 4,820 vulnerable need extra care', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Per-cohort treatment: standard auto-migrate · high-CLV concierge call · vulnerable specialist outreach', 'Decisioning'), focus: { route: '/bss/disputes', target: 'page' } },
    e(8, 'plan', 'Plan: 30-day notification (regulator-approved template) + 7-day reminder + day-of-migration confirm · all in gold.tariff_migration_log', 'Decisioning'),
    { ...e(11, 'act-care', 'Salesforce MC orchestrates · Sinch SMS to 240k · email + in-app · 18k get phone follow-up · 4,820 specialist outreach', 'Care', 'success'), focus: { route: '/bss/subscriptions', target: 'page' } },
    e(15, 'log', 'Migration day +0: 218k auto-migrated · 14k pending acceptance · 8k churned (3.3% loss vs 8% baseline expected)', 'Care'),
    { ...e(18, 'verify', 'Ofcom GC C1.5 audit: 100% notified within 30d · 0 complaints to Ofcom · churn 5pp below industry average for tariff retirements', 'Decisioning', 'success'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    { ...e(22, 'resolve', 'Tariff retired · 232k retained · MRR adjusted £5.4M · regulatory clean · gold.tariff_lifecycle closed', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssClawback: SectionScenario = {
  id: 'bss-commission-clawback',
  sectionId: 'bss',
  title: 'Sales commission claw-back · early-churn cohort',
  subtitle: '184 customers churned within 90d of acquisition · sales commission auto-clawed back from channel partners · GL reversal in same period · prevents repeat-bad-acquisition.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Monthly claw-back run: 184 customers churned within 90d of acquisition · commissions paid to 14 channel partners · total £42k claw-back due', 'Decisioning'), focus: { route: '/bss/wholesale', target: 'page' } },
    e(2, 'observe', 'Top offender: ChannelCo-12 (38 of 184 = 21% bad-acquisition rate vs 4% network average) · clear quality issue', 'Decisioning'),
    e(4, 'log', 'Cohort root-cause: 84 mis-sold tariff · 42 churned to competitor · 38 fraud-related · 20 service-quality', 'Decisioning'),
    { ...e(6, 'plan', 'Plan: auto-debit ChannelCo-12 £14k + warning letter · partial claw-back for 13 other partners · re-train mandate for top-3 offenders', 'Decisioning'), focus: { route: '/bss/wholesale', target: 'page' } },
    { ...e(9, 'act-snow', 'SAP S/4 GL: clawback journal posted · debit channel partner · credit revenue (same period) · £42k recovered', 'Activation', 'success'), focus: { route: '/bss/gl', target: 'page' } },
    e(12, 'log', 'Channel partner notifications sent · 13 of 14 acknowledged · 1 dispute opened (escalated to commercial)', 'Decisioning'),
    { ...e(14, 'verify', 'GL impact: revenue +£42k recovered · channel-quality KPI updated · ChannelCo-12 paused pending re-training', 'Decisioning', 'success'), focus: { route: '/bss/revrec', target: 'page' } },
    { ...e(16, 'resolve', 'Claw-back complete · partner scorecards refreshed · weekly retraining queue extended', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssDeviceFinancing: SectionScenario = {
  id: 'bss-device-financing',
  sectionId: 'bss',
  title: 'Device financing · 24mo handset on credit · Consumer Credit Act',
  subtitle: 'Customer applies for £999 iPhone over 24 months at 0% APR · Consumer Credit Act check + affordability + APR disclosure + cooling-off period · 14-day return rights enforced.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Application: CUST-001 wants £999 iPhone over 24mo on SnowTelco device-finance plan · 0% APR (regulated CCA agreement)', 'Decisioning'), focus: { route: '/bss/quote-to-order', target: 'page' } },
    e(2, 'observe', 'Affordability check: Experian credit file + open-banking income view (consented) · DTI 18% within FCA threshold', 'Decisioning'),
    e(4, 'log', 'CCA agreement drafted: principal £999 · 24 monthly £41.63 · 0% APR · total £999 · 14-day cooling-off', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Risk score: low (0.12) · approve · device-finance balance added to BSS account ledger', 'Decisioning'), focus: { route: '/bss/accounts', target: 'page' } },
    e(8, 'plan', 'Plan: e-sign CCA agreement (DocuSign) · auto-add £41.63 monthly to bill · IFRS 15 separate performance obligation', 'Decisioning'),
    { ...e(11, 'act-snow', 'Amdocs OMS: order created · device dispatched · CCA agreement e-signed · revenue recognition split: hardware £999 + service per-month', 'Activation', 'success'), focus: { route: '/bss/quote-to-order', target: 'page' } },
    { ...e(14, 'log', 'IFRS 15: hardware revenue recognised T0 (control transferred) · service revenue over 24mo · ledger entry in gold.device_finance', 'Decisioning'), focus: { route: '/bss/revrec', target: 'page' } },
    e(17, 'log', '14-day cooling-off active · device-finance flag in BSS · auto-clear at day 15 · CCA disclosures retained 6 years', 'Decisioning'),
    { ...e(20, 'verify', 'CCA compliance: APR disclosed ✓ · affordability ✓ · 14-day rights ✓ · FCA SUP audit-ready', 'Decisioning', 'success'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    { ...e(21, 'resolve', 'Device-finance live · £999 receivable + 24mo plan · clean audit trail · gold.device_finance + gold.cca_register updated', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

const bssRevenueLeakage: SectionScenario = {
  id: 'bss-revenue-leakage',
  sectionId: 'bss',
  title: 'Revenue leakage · unbilled add-ons + expired promo carry-on',
  subtitle: 'leakage_detect_v2 finds 412k customers carrying expired promos still applied · 184 services provisioned but never billed · £142k/mo recovered + audit trail.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'leakage_detect_v2 monthly sweep: 412k customers with expired promo still applied + 184 OSS-active-but-BSS-unbilled services', 'Decisioning', 'warn'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    e(2, 'observe', 'Decomposition: 312k expired Disney+ trial still free · 84k expired roaming-pass discount · 184 unbilled lines (BSS↔OSS sync gaps)', 'Decisioning'),
    e(4, 'log', 'Total leak: £108k/mo expired promos + £34k/mo unbilled services · £142k/mo TOTAL · £1.7M/yr', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Per-cohort treatment: re-engage expired-promo (offer renewal at price) · backfill unbilled services with goodwill cap', 'Decisioning'), focus: { route: '/bss/revenue-assurance', target: 'page' } },
    e(8, 'plan', 'Plan: 312k Disney+ → renewal offer · 84k roaming → roll-off + bill · 184 unbilled → backfill 30 days only (goodwill cap)', 'Decisioning'),
    { ...e(11, 'act-care', 'Salesforce MC: 396k notified 30d in advance (Ofcom GC C1.4 compliant price-change notice) · 184 backfilled', 'Care', 'success'), focus: { route: '/bss/billing', target: 'page' } },
    e(14, 'log', 'Acceptance: 142k accepted Disney+ at price (£4.99/mo · ARR +£8.5M) · 60k roaming roll-off · 184 backfilled (£12k recovered)', 'Care', 'success'),
    { ...e(18, 'verify', 'Recovery: £142k/mo run-rate · regulator-clean (Ofcom 30-day notice) · gold.revenue_leakage_register cleared', 'Decisioning', 'success'), focus: { route: '/bss/revrec', target: 'page' } },
    { ...e(20, 'resolve', 'Leakage closed · monthly cadence locked · audit trail in platinum.leakage_recovery · CFO satisfied', 'Network', 'success'), focus: { route: '/bss', target: 'page' } },
  ],
};

// ─── OSS scenarios ──────────────────────────────────────────────────────────
// (oss-b2b-provisioning retired — overlapped with oss-b2b-fast-order; that one is the canonical TMF 622 + activation story.)

const ossFieldDispatch: SectionScenario = {
  id: 'oss-field-dispatch-liverpool',
  sectionId: 'oss',
  title: 'Network Field Operations · Liverpool fan replacement',
  subtitle: 'gNB-LIV-L1-A fan controller replacement · ftf_predict_v1 confidence 0.91 · ESG-tagged dispatch.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'gNB-LIV-L1-A: thermal alarm 78°C · auto-throttle PRB cap 70%', 'Network', 'warn'), focus: { route: '/oss/field-force', target: 'page' } },
    e(2, 'observe', 'Ericsson TSB-2024-117 matched · fan-controller intermittent · 3 prior on this gNB', 'Decisioning'),
    e(4, 'log', 'ftf_predict_v1: first-time-fix confidence 0.91 · parts-on-hand ✓ (fan-controller v3 in Liverpool van) · skill RAN_HW match', 'Decisioning'),
    e(6, 'plan', 'Plan: dispatch tech ETA 32min · maintenance window 02:00-03:00 · rolling restart', 'Decisioning'),
    { ...e(8, 'act-snow', 'Salesforce Field Service: WO-2026-0508-LIV-001 dispatched · ETA 32m · ESG-tag (EV vehicle, 2.4 kg CO2)', 'Activation', 'success'), focus: { route: '/oss/field-force', target: 'page' } },
    e(11, 'log', 'Tech on site · pre-replacement diagnostic via ENM · throttle holding', 'Network'),
    e(13, 'log', 'Fan-controller replaced · post-test temperature stable 62°C · throttle released', 'Network', 'success'),
    e(15, 'log', 'PRB cap restored 100% · DL throughput recovered to 132 Mbps · Netcracker inventory updated', 'Activation', 'success'),
    { ...e(17, 'verify', 'Customer impact: 0 disconnects · CLV protected ~£18.2k · SLA preserved · FTF ✓', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(17.5, 'resolve', 'Repair complete · MTTR 168 min · PIR auto-drafted · gold.fieldforce_routing + gold.energy_attribution updated', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossCapacity: SectionScenario = {
  id: 'oss-capacity-whatif',
  sectionId: 'oss',
  title: 'Capacity what-if · Manchester upgrade ROI',
  subtitle: 'Cortex Analyst-driven what-if over capacity_forecast_v2 (Prophet, MAPE 8%). Demand drivers: 5G handset attach 38% · FWA 22% · IoT mMTC 16%.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'capacity_forecast_v2 alert: Manchester M14 PRB > 85% by Q3 2026 · breach window', 'Network', 'warn'), focus: { route: '/oss/capacity', target: 'page' } },
    e(2, 'observe', 'Forecast: 4,200 customer-impact-hours/month if no upgrade by Q3 · demand drivers: 5G attach 38% + FWA 22%', 'Decisioning'),
    e(4, 'log', 'Cortex Analyst what-if Scenario A: Upgrade Q1 (cost £180k, 4 weeks) → 0 breach', 'Decisioning'),
    e(6, 'log', 'Cortex Analyst what-if Scenario B: Upgrade Q3 (cost £180k) → 380 c-i-h · churn risk +12pp', 'Decisioning'),
    e(8, 'log', 'Cortex Analyst what-if Scenario C: Defer 6mo (cost £180k) → 4,200 c-i-h · churn +28pp · CLV at risk £680k', 'Decisioning', 'warn'),
    e(10, 'hypothesize', 'Optimal: Scenario A · 18mo ROI 3.2x · CO2 footprint +4 t/yr (CO2-aware capex chip)', 'Decisioning'),
    e(12, 'plan', 'Plan: queue capex CHG · vendor RFQ · field-force capacity check', 'Decisioning'),
    { ...e(14, 'act-snow', 'ServiceNow capex CHG0013027 opened · vendor RFQ to Ericsson + Nokia', 'Activation', 'success'), focus: { route: '/oss/capacity', target: 'page' } },
    { ...e(16, 'verify', 'Plan approved: Q1 BH upgrade · 4 weeks execution · 0 breach forecast · capacity_forecast_v2 re-fit', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Upgrade scheduled · breach prevented · CLV protected ~£680k · gold.capacity_forecast updated', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossEnergySave: SectionScenario = {
  id: 'oss-energy-save',
  sectionId: 'oss',
  title: 'Energy-save automation · NYK rural site',
  subtitle: 'SITE-NYK-DAL-A mains failure · energy_save_v3 (RL agent, reward 0.78) + battery_eol_v2 + Cortex Complete business case.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', 'SITE-NYK-DAL-A · AC mains lost · battery 100% · runtime 3h 10m', 'Network', 'warn'), focus: { route: '/oss/energy', target: 'page' } },
    e(2, 'observe', 'Northern Powergrid advisory: regional outage ETA 4h 30m · battery insufficient', 'Network'),
    e(4, 'log', 'Network impact: 1,420 customers · 18 high-CLV · no neighbour coverage · battery_eol_v2: this site’s cells passed 6h endurance test', 'Decisioning'),
    e(6, 'plan', 'Plan: energy_save_v3 RL agent applies BATTERY_EXTEND profile + Salesforce FS generator dispatch', 'Decisioning'),
    { ...e(8, 'act-snow', 'Ericsson ENM: BATTERY_EXTEND profile applied · draw 280W → 198W (Scope 2 attribution captured)', 'Activation', 'success'), focus: { route: '/oss/energy', target: 'page' } },
    { ...e(10, 'log', 'Salesforce FS: portable generator dispatched · ETA 2h 15m · margin 2h 15m', 'Activation'), focus: { route: '/oss/field-force', target: 'page' } },
    e(12, 'log', 'Battery state at T+1h: 76% · runtime now 4h 30m · fleet health 94.2% (resilience tile)', 'Network', 'success'),
    e(14, 'log', 'Generator on-site T+2h 8m · cutover successful · battery charging', 'Network', 'success'),
    e(16, 'log', 'ESG-tagged WO-NYK-001 · Cortex Complete drafts battery upgrade business case for CFO', 'Activation'),
    { ...e(18, 'verify', 'Customer impact: 0 disconnects · 3,200kg CO2 avoided vs cells-dropped · SBTi pathway on-track', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(19, 'resolve', 'Mains restored · 1,420 customers protected · ESG-positive · gold.energy_attribution + platinum.esg_scorecard updated', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossInventoryDrift: SectionScenario = {
  id: 'oss-inventory-drift',
  sectionId: 'oss',
  title: 'Inventory drift reconciliation',
  subtitle: 'inventory_drift_v3 (F1 0.91) reconciles 2.4M assets nightly across Netcracker / ENM / NetAct / CMDB (service + resource + connection objects).',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'Nightly reconcile: 412k assets · drift 0.8% · 3,296 mismatches · inventory_drift_v3 F1 0.91', 'Activation', 'warn'), focus: { route: '/oss/inventory', target: 'page' } },
    e(2, 'observe', 'Top-source Pareto: Cramer attribute drift 38% · NetAct stale assets 24% · CMDB missing CIs 18% · ENM serial 12%', 'Activation'),
    e(4, 'log', 'Mismatch type: 1,840 stale assets (auto-mergeable) · 920 missing in CMDB · 536 attribute drift', 'Decisioning'),
    e(6, 'plan', 'Plan: auto-merge low-risk (1,840 stales) · queue manual review for 1,456 · topology_blast_radius_v2 ranks critical assets first', 'Decisioning'),
    { ...e(8, 'act-snow', 'CHG0013022 (standard, auto-approved) · 1,840 stale assets retired in Netcracker · CMDB synced', 'Activation', 'success'), focus: { route: '/oss/inventory', target: 'page' } },
    e(10, 'log', '1,456 routed to ops engineer queue · ServiceNow tickets opened', 'Activation'),
    e(12, 'log', 'Time Travel snapshot retained · audit trail preserved (90d) · NIS2 evidence captured', 'Activation'),
    { ...e(14, 'verify', 'Drift now 0.4% · all critical assets reconciled · billing alignment OK (TMF 678) · catalog OK (TMF 620)', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Reconciliation complete · 1,840 auto-fixed · 1,456 in flight · gold.inventory_drift + gold.topology_snapshot updated', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

// ─── New OSS scenarios (Phase C) ───────────────────────────────────────────

const ossAssuranceTriage: SectionScenario = {
  id: 'oss-assurance-triage',
  sectionId: 'oss',
  title: 'TMF 645 · trouble-ticket auto-triage',
  subtitle: '42 tickets in 4h · assurance_triage_v2 + severity_classifier_v2 + mttr_predict_v3. MTTR 1h 12m vs 4h baseline.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', '42 trouble tickets opened in last 4h · NOC alarms + customer complaints', 'Decisioning', 'warn'), focus: { route: '/oss/assurance', target: 'page' } },
    e(2, 'observe', 'severity_classifier_v2 confidence 0.94 on top-priority TT · assurance_triage_v2 confidence 0.92 · 28 of 42 are duplicates of NOC incident MAN-M14', 'Decisioning'),
    e(4, 'hypothesize', 'mttr_predict_v3 forecasts MTTR band 1h 04m–1h 24m · auto-merge 28 dupes · 14 routed (own/vendor mix 64/36)', 'Decisioning'),
    e(6, 'plan', 'Plan: TMF 645 dispatch with skill-match · runbook RAG via Cortex Search · 9 to vendor-A field, 4 to own techs, 1 to BSS dispute desk', 'Decisioning'),
    { ...e(9, 'act-snow', '28 merged · 14 routed · runbook attached (NOC-MAN-M14)', 'Activation', 'success'), focus: { route: '/oss/assurance', target: 'page' } },
    e(12, 'log', 'Vendor-A acknowledged · field-tech ETA 32m · own techs en route', 'Care'),
    e(14, 'log', 'BSS · SLA-credit auto-evaluated · 4 customers eligible · gold.disputes updated', 'Billing', 'success'),
    { ...e(16, 'verify', 'P1 MTTR 1h 12m (within forecast band) · zero queue overflow · 0 customer escalation', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(17, 'resolve', 'Tickets cleared · gold.cases + gold.sla_register updated · NIS2 evidence pack auto-attached', 'Network', 'success'), focus: { route: '/oss/assurance', target: 'page' } },
  ],
};

const ossB2BFastOrder: SectionScenario = {
  id: 'oss-b2b-fast-order',
  sectionId: 'oss',
  title: 'TMF 622 · Lloyds 280-branch fast-order',
  subtitle: 'CPQ → live in 6 days. order_jeopardy_v3 + order_fallout_v2.1 keep on-time commit at 97%. Decomposed to 6 vendors + own field force.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'New service order: Lloyds 280-branch 4G/5G fleet refresh · £2.4M/yr', 'Decisioning'), focus: { route: '/oss/service-order', target: 'page' } },
    e(2, 'observe', 'CPQ proposal accepted · DocuSign envelope signed · TMF 622 capture triggered · order_jeopardy_v3 = 0.12 (low)', 'Decisioning'),
    e(4, 'log', 'Cortex Agent decomposes: 280 gNB activations (Ericsson) · 280 CPE shipments (Cisco) · 96 site surveys', 'Decisioning'),
    e(6, 'plan', 'Routing: 6 vendors + own field force · spectrum-permit checks (Ofcom) · billing-account creation · order_fallout_v2.1 watches all 280 lines', 'Decisioning'),
    { ...e(9, 'act-snow', 'serviceOrderItems dispatched in 4 min · vendor APIs called · TMF 638 inventory reserved', 'Activation', 'success'), focus: { route: '/oss/topology', target: 'page' } },
    e(12, 'log', 'Wave 1 · 96 sites surveyed · feasibility green · 0 fallout', 'Activation', 'success'),
    e(15, 'log', 'Wave 2 · 184 site surveys scheduled across 5 weeks · auto-dispatched', 'Activation'),
    e(18, 'log', 'Day-6 acceptance · 96 sites live · MRR +£70k recognised this period (annualised £840k)', 'Billing', 'success'),
    { ...e(20, 'verify', 'On-time commit 97% · order_jeopardy_v3 final 0.04 · fallout 1.4%', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(21, 'resolve', 'Order live · gold.contracts + gold.revrec_obligations + gold.subscriptions updated · CFO + Ofcom audit-ready', 'Network', 'success'), focus: { route: '/oss/service-order', target: 'page' } },
  ],
};

const ossCabRollback: SectionScenario = {
  id: 'oss-cab-rollback',
  sectionId: 'oss',
  title: 'CAB · failed change auto-rollback',
  subtitle: 'A NORMAL CHG (CAB-classified, manual approval) fails on push (RRC config v124 regression on Ericsson cluster). Time Travel rolls back in 4m. Auto-PIR drafted in 30m for Ofcom GC A3.',
  durationSec: 36,
  events: [
    { ...e(0, 'detect', 'CHG0013015 push · RRC config v124 · Ericsson gNB-MAN-M14-* · KPI delta crosses guard', 'Activation', 'critical'), focus: { route: '/oss/change', target: 'page' } },
    e(2, 'observe', 'cab_auto_approve_v2 had passed at 0.97 · cfr_predict_v3 baseline 1.4% · bearer-attach drops 12pp · breach guard', 'Decisioning', 'warn'),
    e(4, 'plan', 'Plan: cab_rollback_v1 fires · Time Travel rollback to v123 · freeze further changes · ECAB convened', 'Decisioning'),
    { ...e(6, 'act-snow', 'Rollback executed via Time Travel · v123 restored · KPI recovers in 4m', 'Activation', 'success'), focus: { route: '/oss/change', target: 'page' } },
    e(9, 'log', 'ECAB · Ericsson vendor on bridge · root cause logged (RRC paging-cycle regression)', 'Decisioning'),
    e(15, 'log', 'Cortex Complete drafts PIR (what-changed · who-acted · what-broke · what-next) in 4 min', 'Decisioning'),
    e(22, 'log', 'PIR + evidence pack generated · Ofcom GC A3 ready · NIS2 control evidence attached', 'Activation', 'success'),
    { ...e(28, 'verify', 'Customer-impact 4m (within guard) · PIR delivered T+30m · cfr_predict_v3 holds at 1.4%', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(34, 'resolve', 'CAB closed at T+34m (rollback + ECAB + PIR cycle) · gold.change_register + gold.incident_master updated', 'Network', 'success'), focus: { route: '/oss/change', target: 'page' } },
  ],
};

const ossDriveTestOptimise: SectionScenario = {
  id: 'oss-drive-test-optimise',
  sectionId: 'oss',
  title: 'Drive-test → SON RF re-tilt optimisation',
  subtitle: 'Polystar drive-test telemetry triggers son_recommender_v2 (Snowpark ML). 18 cells optimised under STANDARD CHG class (pre-approved playbook, no manual CAB) inside the maintenance window.',
  durationSec: 18,
  events: [
    { ...e(0, 'detect', 'Drive-test feed (Polystar) · weak signal pocket · NW · 18 cells flagged', 'Network', 'warn'), focus: { route: '/oss/topology', target: 'page' } },
    e(2, 'observe', 'son_recommender_v2 · Snowpark ML · electrical tilt + carrier add candidates', 'Decisioning'),
    e(4, 'plan', 'Plan: 18 SON recommendations bundled · Standard CHG (cab_auto_approve_v2 = 0.96) · pre-approved window 02:00–04:00', 'Decisioning'),
    { ...e(6, 'act-snow', 'CHG0013016 standard auto-approved · 18 e-tilts pushed via Ericsson SON', 'Activation', 'success'), focus: { route: '/oss/change', target: 'page' } },
    e(8, 'log', 'Zero-truck-roll dispatch · ESG-tagged change · 0 vehicle CO2 attributed', 'Activation', 'success'),
    e(11, 'log', 'Acceptance test: drive-test re-run after 4h · weak-signal pocket gone', 'Network', 'success'),
    e(13, 'log', 'Customer NES forecast +0.18 in NW · churn risk delta −1.2pp', 'Decisioning'),
    { ...e(15, 'verify', '18 cells optimised · gold.son_recommendations updated · 0 SLA breach', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(16, 'resolve', 'Optimisation complete · zero-truck-roll attribution captured in gold.energy_attribution', 'Network', 'success'), focus: { route: '/oss/field-force', target: 'page' } },
  ],
};

const ossVendorSlaBreach: SectionScenario = {
  id: 'oss-vendor-sla-breach',
  sectionId: 'oss',
  title: 'Field-engineer SLA breach · vendor scorecard impact',
  subtitle: 'Field-side: ftf_predict_v1 + vendor_perf_v2 flag risk. Vendor-B reserve crew dispatched in parallel; Vendor-A breaches by 18m. Vendor scorecard auto-debited £4.2k; 0 customer SLA-credit triggered. (NOC vendor-escalation desk handles vendor case independently.)',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', 'WO-2026-0508-LDS-002 · vendor-A 3h SLA expires in 14m · ftf_predict_v1 confidence 0.42 (low arrival)', 'Decisioning', 'warn'), focus: { route: '/oss/field-force', target: 'page' } },
    e(2, 'observe', 'vendor_perf_v2 · vendor-A on-time 86% MoM · slipping vs SLA 95%', 'Decisioning'),
    e(4, 'plan', 'Plan: dispatch vendor-B reserve crew in parallel · escalate to vendor-A duty manager · prepare penalty', 'Decisioning'),
    { ...e(6, 'act-care', 'Vendor-B reserve crew dispatched (T+0) · vendor-A on-site at +32m (18m SLA breach) · vendor-B cancelled mid-route', 'Care', 'warn'), focus: { route: '/oss/field-force', target: 'page' } },
    e(9, 'log', 'Vendor penalty £4.2k debited from Vendor-A · gold.partner_settlements + gold.vendor_perf updated', 'Billing'),
    e(11, 'log', 'Customer auto-comms (Sinch SMS) · service restored T+52m vs target T+180m · 0 customer SLA-credit triggered', 'Care', 'success'),
    { ...e(13, 'verify', 'WO closed · vendor scorecard updated · ftf_predict_v1 retrained on this case', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Vendor SLA breach contained · monthly review schedules vendor-A QBR · gold.cases updated', 'Network', 'success'), focus: { route: '/oss/field-force', target: 'page' } },
  ],
};

const ossSpectrumRefarm: SectionScenario = {
  id: 'oss-spectrum-refarm',
  sectionId: 'oss',
  title: 'Spectrum re-farm · national 700 MHz programme milestone',
  subtitle: 'National 700 MHz re-farm completes · 600 cells decommissioned UK-wide. capacity_forecast_v2 refreshed; £980k/yr OpEx + 24 t CO2/yr saved.',
  durationSec: 16,
  events: [
    { ...e(0, 'detect', '700 MHz re-farm milestone · final 600 cells decommissioned UK-wide · spectrum_lifecycle event', 'Network'), focus: { route: '/oss/topology', target: 'page' } },
    e(2, 'observe', 'Cramer + Netcracker auto-reconcile · inventory_drift_v3 confirms decommission consistency', 'Decisioning'),
    e(4, 'log', 'capacity_forecast_v2 refreshes · EH1 + GLA + LDS risk windows pull back from Q2 2027 → Q3 2027', 'Decisioning', 'success'),
    e(6, 'plan', 'Plan: ESG attribution updated · OpEx saving £980k/yr · CO2 −24 t/yr · next: 800 MHz re-farm planning', 'Decisioning'),
    { ...e(8, 'act-snow', 'Inventory updated · gold.capacity_forecast refreshed · gold.spectrum_holdings updated', 'Activation', 'success'), focus: { route: '/oss/capacity', target: 'page' } },
    e(11, 'log', 'Ofcom notification filed · regulatory_register updated', 'Activation'),
    { ...e(13, 'verify', 'Re-farm milestone closed · 600 cells decommissioned · 0 service impact · SBTi pathway aligned', 'Decisioning', 'success'), focus: { route: '/oss', target: 'kpi-strip' } },
    { ...e(15, 'resolve', 'Spectrum re-farm complete · gold.energy_co2_index updated · ESG board pack regenerated', 'Network', 'success'), focus: { route: '/oss/energy', target: 'page' } },
  ],
};

// ─── New OSS scenarios (CTO-grade gap closure) ───────────────────────────────
const ossOpenreachLeadtime: SectionScenario = {
  id: 'oss-openreach-leadtime',
  sectionId: 'oss',
  title: 'Openreach backhaul · lead-time miss escalation',
  subtitle: 'B2B order on hold: Openreach EAD circuit lead-time slipped 14 → 28 days · 280-branch Lloyds rollout at risk · auto-escalate + alternative backhaul + Ofcom B2B SLA preserved.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Lloyds 280-branch order: 38 EAD circuits ordered from Openreach · lead-time slipped 14 → 28 days · order jeopardy', 'Network', 'warn'), focus: { route: '/oss/service-order', target: 'page' } },
    e(2, 'observe', 'Cortex Search across openreach.lead_time_log + vendor_history: pattern shows 28d slips happen in Q2 every year', 'Decisioning'),
    e(4, 'log', 'Customer commit: 280 branches live by Aug 1 · OR slip puts 38 of 280 sites at risk · CLV at risk £4.2M ARR', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Alternative: BT Wholesale Etherflow + Virgin Media Business backup for 14 most-critical sites', 'Decisioning'), focus: { route: '/oss/service-order', target: 'page' } },
    e(8, 'plan', 'Plan: escalate Openreach P1 ticket + parallel-source BTW for 14 critical · accept 7-day delay on remaining 24', 'Decisioning'),
    { ...e(10, 'act-snow', 'Openreach P1 escalation VND-2026-0508-OR0214 · BT Wholesale order placed for 14 backups · invoice cap negotiated', 'Activation', 'success'), focus: { route: '/oss/service-order', target: 'page' } },
    e(13, 'log', 'Customer comms: Lloyds account manager briefed · revised Aug 8 commit accepted · service-credit waiver agreed', 'Care'),
    { ...e(16, 'verify', 'Recovery plan: 14 sites via BTW Aug 1 · 24 sites via OR Aug 8 · TMF 921 SLA preserved · zero customer-facing breach', 'Decisioning', 'success'), focus: { route: '/oss/assurance', target: 'page' } },
    { ...e(20, 'resolve', 'Lead-time miss contained · Lloyds rollout on revised plan · gold.vendor_scorecard updated · OR margin debit £8k', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossSliceActivation: SectionScenario = {
  id: 'oss-slice-activation',
  sectionId: 'oss',
  title: 'B2B 5G slice activation · Barclays trading floor URLLC',
  subtitle: 'TMF 641 + 3GPP TS 28.531 slice instantiation · Barclays trading-floor URLLC slice (< 5ms latency, 99.999% SLA) · auto-provision via NSSF + reserve resources across 14 cells.',
  durationSec: 24,
  events: [
    { ...e(0, 'detect', 'B2B order: Barclays trading floor · URLLC slice · 99.999% SLA · < 5ms latency · 12-month commit £4.2M ARR', 'Network'), focus: { route: '/oss/slicing', target: 'slice-ladder' } },
    e(2, 'observe', 'GSMA NG.116 GST template SLC-URLLC-002 selected · tenant policy + isolation level + KPI floor verified', 'Decisioning'),
    e(4, 'log', 'Footprint: 14 cells in EC2 · 2 gNBs · 1 UPF instance reserved · NSSF policy file generated · MEC node placement at LDN-MEC-01', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Pre-flight via digital twin: simulated 14 cells under URLLC reservation · existing eMBB customers SLA-impact 0.1pp (within tolerance)', 'Decisioning'), focus: { route: '/oss/digital-twin', target: 'page' } },
    e(8, 'plan', 'Plan: NSSF instantiate slice · UPF + SMF + MEC binding · Snowflake-side audit log · acceptance test plan run', 'Decisioning'),
    { ...e(11, 'act-snow', 'TMF 641 + ETSI NFV-MANO: slice SLC-URLLC-BARCLAYS-01 instantiated · all 14 cells reserved · MEC placement confirmed', 'Activation', 'success'), focus: { route: '/oss/slicing', target: 'slice-ladder' } },
    { ...e(15, 'log', 'Acceptance test: voice-test from trading floor · P95 latency 3.4ms · 1k sustained sessions OK · SLA gate passed', 'Network', 'success'), focus: { route: '/oss/mec', target: 'page' } },
    { ...e(19, 'verify', 'Slice live · slice_sla_predict_v2 monitoring · slice_health monitor active · BSS billing handshake OK', 'Decisioning', 'success'), focus: { route: '/oss/slicing', target: 'slice-ladder' } },
    { ...e(22, 'resolve', 'Barclays URLLC slice live · £4.2M ARR booked · gold.slice_inventory + platinum.slice_health updated', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossDigitalTwinPreCHG: SectionScenario = {
  id: 'oss-digital-twin-prechg',
  sectionId: 'oss',
  title: 'Digital-twin pre-CHG simulation · prevents outage',
  subtitle: 'High-risk capex CHG (BGP convergence change on PE-LDN-1) pre-validated in twin · twin_simulator_v1 predicts cascade failure on PE-LDN-2 · CHG redesigned + safely deployed.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'CHG0013034 raised: BGP convergence change on PE-LDN-1 · high-risk · CAB requires digital-twin pre-validation', 'Network', 'warn'), focus: { route: '/oss/digital-twin', target: 'page' } },
    e(2, 'observe', 'twin_simulator_v1 ingests current topology + traffic + control-plane state from Snowflake · simulation set up', 'Decisioning'),
    e(4, 'log', 'Twin simulation T+0 to T+30min: PE-LDN-1 BGP change applied · result: cascade failure on PE-LDN-2 (BGP table flap) at T+8m', 'Decisioning', 'warn'),
    { ...e(6, 'hypothesize', 'Root cause in twin: insufficient BGP convergence timer + missing route-flap dampening on PE-LDN-2', 'Decisioning', 'warn'), focus: { route: '/oss/digital-twin', target: 'page' } },
    e(8, 'plan', 'Redesign CHG: stagger PE-LDN-1 (T0) and PE-LDN-2 (T+30m) · add route-flap dampening · twin re-run', 'Decisioning'),
    { ...e(11, 'log', 'Twin re-run with new plan: 0 cascade · 0 customer-impact · BGP convergence within 4 sec p95', 'Decisioning', 'success'), focus: { route: '/oss/digital-twin', target: 'page' } },
    { ...e(14, 'act-snow', 'CAB approves redesigned CHG0013034-R2 · ServiceNow updated · maintenance window booked · NOC notified', 'Activation', 'success'), focus: { route: '/oss/change', target: 'page' } },
    { ...e(18, 'verify', 'Real CHG executed: outcome matches twin prediction · 0 cascade · P95 BGP 3.8 sec · twin accuracy MAPE 8% confirmed', 'Decisioning', 'success'), focus: { route: '/oss/digital-twin', target: 'page' } },
    { ...e(20, 'resolve', 'Outage prevented · twin saved an estimated 2,400 customer-impact-hours · CFO ROI on twin investment proven', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossServiceOrderReconcile: SectionScenario = {
  id: 'oss-service-order-reconcile',
  sectionId: 'oss',
  title: 'Service-Order reconciliation · BSS↔OSS provisioning gaps',
  subtitle: 'Nightly reconcile finds 184 services OSS-active-but-BSS-unbilled (revenue leak) and 42 BSS-billed-but-OSS-not-provisioned (customer impact) · auto-route to fix queues.',
  durationSec: 20,
  events: [
    { ...e(0, 'detect', 'Nightly OSS↔BSS reconcile: 184 services in OSS inventory but no BSS subscription (revenue leak) · 42 BSS-billed but no OSS service (customer impact)', 'Decisioning', 'warn'), focus: { route: '/oss/inventory', target: 'page' } },
    e(2, 'observe', 'Cortex Search joins gold.service_inventory × bss.subscriptions · gap classification by root-cause', 'Decisioning'),
    e(4, 'log', 'Pattern: 142 BSS-unbilled = TMF 641 activation race-condition · 42 OSS-not-provisioned = legacy MNP edge-case', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Per-class fix: BSS-unbilled → backfill bill (30-day cap) · OSS-not-provisioned → emergency provisioning + customer comms', 'Decisioning'), focus: { route: '/oss/inventory', target: 'page' } },
    e(8, 'plan', 'Plan: 184 BSS backfill journals + £6k revenue recovery · 42 OSS emergency provisioning · 7-day cycle', 'Decisioning'),
    { ...e(10, 'act-snow', '184 BSS backfills posted (gold.dispute_credits + revrec) · 42 OSS emergency activations triggered via Amdocs OMS', 'Activation', 'success'), focus: { route: '/oss/service-order', target: 'page' } },
    e(13, 'log', 'Customer impact resolved: 42 customers had services activated within 4h · proactive apology + £10 goodwill credit', 'Care', 'success'),
    { ...e(16, 'verify', 'Reconcile run: 226 gaps closed · £6k revenue recovered · 0 customer SLA-credit triggered · root-cause queued for engineering retro', 'Decisioning', 'success'), focus: { route: '/oss/inventory', target: 'page' } },
    { ...e(18, 'resolve', 'BSS↔OSS sync clean · gold.osso_recon updated · weekly retraining of activation race-condition fix queued', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossEmfAudit: SectionScenario = {
  id: 'oss-emf-audit',
  sectionId: 'oss',
  title: 'EMF / ICNIRP audit · annual per-site safety review',
  subtitle: 'Annual ICNIRP radiation audit on 412 sites · 38 require remediation · 6 high-priority near schools/hospitals · Ofcom + UKHSA reporting + community comms drafted.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'Annual ICNIRP audit cycle starts · 412 cell sites in scope this quarter · regulatory mandate (Ofcom + UKHSA)', 'Network'), focus: { route: '/oss/site-lifecycle', target: 'page' } },
    e(2, 'observe', 'Drone + on-site survey teams dispatched · field-readings collected against ICNIRP thresholds · joined to gold.site_inventory', 'Decisioning'),
    e(4, 'log', 'Results: 374 PASS · 38 require remediation (within ICNIRP guidelines but above public-comms-threshold) · 6 near sensitive locations', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Per-site remediation: tilt + power-down for 38 · transparency comms for 6 near schools/hospitals · zero withdrawal needed', 'Decisioning'), focus: { route: '/oss/site-lifecycle', target: 'page' } },
    e(8, 'plan', 'Plan: 38 site CHGs · 6 community engagement letters · UKHSA + Ofcom report · public dashboard updated', 'Decisioning'),
    { ...e(11, 'act-snow', '38 ServiceNow CHGs raised · field tilt + power-down work-orders dispatched · expected completion 14 days', 'Activation', 'success'), focus: { route: '/oss/field-force', target: 'page' } },
    { ...e(14, 'log', 'Community comms: 6 community engagement letters drafted by Cortex Complete · NIMBY response prep ready', 'Care', 'success'), focus: { route: '/oss/site-lifecycle', target: 'page' } },
    { ...e(18, 'verify', 'UKHSA audit: 100% sites within ICNIRP · Ofcom annual EMF report submitted · gold.icnirp_audit_log clean', 'Decisioning', 'success'), focus: { route: '/oss/site-lifecycle', target: 'page' } },
    { ...e(20, 'resolve', 'Audit complete · 412 sites clean · 38 remediated within 14 days · public dashboard live · regulator + community satisfied', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

const ossTmf921Sla: SectionScenario = {
  id: 'oss-tmf921-sla',
  sectionId: 'oss',
  title: 'TMF 921 SLA dashboard · proactive B2B SLA-credit prevention',
  subtitle: 'Proactive TMF 921 SLA management for 412 B2B accounts · slo_burnrate_v2 predicts 14 accounts will breach 99.95% in next 30 days · pre-emptive remediation prevents £42k SLA-credit.',
  durationSec: 22,
  events: [
    { ...e(0, 'detect', 'TMF 921 SLA dashboard · slo_burnrate_v2 forecasts 14 of 412 B2B accounts will breach 99.95% in next 30 days · projected SLA-credit £42k', 'Decisioning', 'warn'), focus: { route: '/oss/slo', target: 'page' } },
    e(2, 'observe', 'Per-account decomposition: 6 driven by transport flap · 4 by RAN cell load · 4 by IMS Cx storm pattern', 'Decisioning'),
    e(4, 'log', 'Top accounts at risk: Lloyds (£8k credit risk) · Barclays (£6k) · NHS Manchester (£4k) · TfL (£4k)', 'Decisioning'),
    { ...e(6, 'hypothesize', 'Per-driver mitigation: transport → re-route + capacity · RAN → cell-load balance · IMS → CSCF rate-limit', 'Decisioning'), focus: { route: '/oss/slo', target: 'page' } },
    e(8, 'plan', 'Plan: 14 ServiceNow CHGs · 14-day window · NOC + OSS coordinated · daily slot-burn-rate review', 'Decisioning'),
    { ...e(11, 'act-snow', '14 STANDARD CHGs raised · NOC bridge for top-3 (Lloyds + Barclays + NHS) · daily SRE review live', 'Activation', 'success'), focus: { route: '/oss/slo', target: 'page' } },
    e(15, 'log', 'Day-7: 8 of 14 accounts back inside 99.95% threshold · 4 stabilising · 2 still at risk (specialist team engaged)', 'Care', 'success'),
    { ...e(18, 'verify', 'Day-30: 13 of 14 retained inside SLA (1 unavoidable due to OR fault, customer-credit issued) · projected £38k SLA-credit avoided', 'Decisioning', 'success'), focus: { route: '/oss/slo', target: 'page' } },
    { ...e(20, 'resolve', 'TMF 921 SLA management cycle complete · gold.sli_measurements + gold.error_budgets refreshed · CFO ROI proven', 'Network', 'success'), focus: { route: '/oss', target: 'page' } },
  ],
};

// ─── NOC scenarios (existing 8 — moved here as section='noc') ────────────────
// For NOC scripts authored before the focus system, inject sensible defaults so
// every detect/observe/act/verify/resolve beat steers the user into /noc.
// Per-scenario overrides (kind → focus) win over both default and any focus
// hard-coded on the original event — this lets each NOC scenario tour the new
// specialised pages (MIM / Customer Impact / Vendor Escalation / etc).
type NocFocus = { route: string; target: string };
type NocFocusOverride = Partial<Record<SeqEvent['kind'], NocFocus>>;
const withNocFocusDefaults = (events: SeqEvent[], overrides: NocFocusOverride = {}): SeqEvent[] =>
  events.map((ev) => {
    const ovr = overrides[ev.kind];
    if (ovr) return { ...ev, focus: ovr };
    if (ev.focus) return ev;
    let target: string | null = null;
    if (ev.kind === 'detect') target = 'noc-detail';
    else if (ev.kind === 'observe' || ev.kind === 'hypothesize' || ev.kind === 'plan') target = 'noc-agent';
    else if (ev.kind === 'act-rebalance' || ev.kind === 'act-snow' || ev.kind === 'act-care' || ev.kind === 'act-restart') target = 'noc-actions';
    else if (ev.kind === 'verify') target = 'noc-agent';
    else if (ev.kind === 'resolve') target = 'noc-grid';
    if (!target) return ev;
    return { ...ev, focus: { route: '/noc', target } };
  });

const wrapNocScript = (s: { incidentId: string; durationSec: number; events: SeqEvent[]; kpiTargets?: any }, title: string, subtitle: string, overrides: NocFocusOverride = {}): SectionScenario => ({
  id: s.incidentId,
  sectionId: 'noc',
  title,
  subtitle,
  durationSec: s.durationSec,
  events: withNocFocusDefaults(s.events, overrides),
  kpiTargets: s.kpiTargets,
  presenter: presenterScripts[s.incidentId],
});

// Each scenario tours the most relevant new NOC pages.
const KS = 'kpi-strip'; // shared focus target on every new page

const nocManchester = wrapNocScript(manchesterScript, 'Manchester M14 · RAN cluster congestion',
  'Peak-hour PRB 96% on cluster MAN-01 — MLB + carrier-add, ServiceNow change, 89 P1 saved.', {
    detect:        { route: '/noc/perf',            target: KS },
    observe:       { route: '/noc',                 target: 'noc-agent' },
    hypothesize:   { route: '/noc/runbooks',        target: KS },
    plan:          { route: '/noc',                 target: 'noc-agent' },
    'act-rebalance': { route: '/noc',               target: 'noc-actions' },
    'act-snow':    { route: '/noc/maintenance',     target: KS },
    'act-care':    { route: '/noc/customer-impact', target: KS },
    verify:        { route: '/noc/perf',            target: KS },
    resolve:       { route: '/noc/pir',             target: KS },
  });
const nocLiverpool = wrapNocScript(liverpoolScript, 'Liverpool L1 · gNB thermal alarm',
  'Single-site thermal — Ericsson EnergyController throttle + field-tech for fan-controller replacement.', {
    detect:        { route: '/noc/perf',                target: KS },
    observe:       { route: '/noc/runbooks',            target: KS },
    hypothesize:   { route: '/noc/runbooks',            target: KS },
    plan:          { route: '/noc',                     target: 'noc-agent' },
    'act-restart': { route: '/noc/vendor-escalation',   target: KS },
    verify:        { route: '/noc/synthetic',           target: KS },
    resolve:       { route: '/noc/pir',                 target: KS },
  });
const nocLeeds = wrapNocScript(leedsScript, 'Leeds LS2 · IPRAN ring fault',
  'BFD/OSPF flap on Openreach span — MPLS LSP reroute via secondary ring with CAB approval.', {
    detect:        { route: '/noc/perf',                target: KS },
    observe:       { route: '/noc',                     target: 'noc-agent' },
    hypothesize:   { route: '/noc/runbooks',            target: KS },
    plan:          { route: '/noc',                     target: 'noc-agent' },
    'act-rebalance': { route: '/noc/maintenance',       target: KS },
    'act-snow':    { route: '/noc/vendor-escalation',   target: KS },
    'act-care':    { route: '/noc/comms',               target: KS },
    verify:        { route: '/noc/customer-impact',     target: KS },
    resolve:       { route: '/noc/pir',                 target: KS },
  });
const nocLondonHss = wrapNocScript(londonHssScript, 'London HSS · IMS registration storm',
  'Oracle USPL HSS Cx saturation after Mavenir S-CSCF re-anchor — 1.42M subs, GC A3 + NIS2/NCSC.', {
    detect:        { route: '/noc/perf',                target: KS },
    observe:       { route: '/noc/customer-impact',     target: KS },
    hypothesize:   { route: '/noc',                     target: 'noc-agent' },
    plan:          { route: '/noc/mim',                 target: KS },
    'act-restart': { route: '/noc',                     target: 'noc-actions' },
    'act-snow':    { route: '/noc/mim',                 target: KS },
    'act-care':    { route: '/noc/comms',               target: KS },
    verify:        { route: '/noc/perf',                target: KS },
    resolve:       { route: '/noc/status-page',         target: KS },
  });
const nocSimSwap = wrapNocScript(simSwapScript, 'Single SIM-swap · CUST-002',
  'Account-takeover attempt on Daniel Shah — verified-channel auth + Amdocs OMS freeze.', {
    detect:        { route: '/noc/csirt',               target: KS },
    observe:       { route: '/noc/csirt',               target: KS },
    hypothesize:   { route: '/noc',                     target: 'noc-agent' },
    plan:          { route: '/noc/runbooks',            target: KS },
    'act-rebalance': { route: '/noc',                   target: 'noc-actions' },
    'act-snow':    { route: '/noc',                     target: 'noc-actions' },
    'act-care':    { route: '/noc/customer-impact',     target: KS },
    verify:        { route: '/noc/customer-impact',     target: KS },
    resolve:       { route: '/noc/pir',                 target: KS },
  });
const nocRoaming = wrapNocScript(roamingPartnerScript, 'Roaming partner outage · IPX peer VPN-A',
  'BGP down to IPX peer · 14 destination countries · failover to BICS · multi-language push.', {
    detect:        { route: '/noc/perf',                target: KS },
    observe:       { route: '/noc',                     target: 'noc-agent' },
    hypothesize:   { route: '/noc/runbooks',            target: KS },
    plan:          { route: '/noc/vendor-escalation',   target: KS },
    'act-rebalance': { route: '/noc/vendor-escalation', target: KS },
    'act-snow':    { route: '/noc/vendor-escalation',   target: KS },
    'act-care':    { route: '/noc/comms',               target: KS },
    verify:        { route: '/noc/customer-impact',     target: KS },
    resolve:       { route: '/noc/pir',                 target: KS },
  });
const nocMassSimSwap = wrapNocScript(massSimSwapScript, 'Mass SIM-swap · operator op-4421',
  '47 swaps in 18 minutes from same identity-back-office operator — bulk freeze + HR + CTI.', {
    detect:        { route: '/noc/csirt',               target: KS },
    observe:       { route: '/noc/csirt',               target: KS },
    hypothesize:   { route: '/noc/csirt',               target: KS },
    plan:          { route: '/noc/mim',                 target: KS },
    'act-rebalance': { route: '/noc',                   target: 'noc-actions' },
    'act-snow':    { route: '/noc',                     target: 'noc-actions' },
    'act-care':    { route: '/noc/comms',               target: KS },
    verify:        { route: '/noc/customer-impact',     target: KS },
    resolve:       { route: '/noc/pir',                 target: KS },
  });
const nocMains = wrapNocScript(towerMainsScript, 'NYK Mains failure · battery extend',
  'Rural North Yorkshire mains outage — Ericsson EnergyController battery profile + generator dispatch.', {
    detect:        { route: '/noc/perf',                target: KS },
    observe:       { route: '/noc/runbooks',            target: KS },
    hypothesize:   { route: '/noc',                     target: 'noc-agent' },
    plan:          { route: '/noc',                     target: 'noc-agent' },
    'act-restart': { route: '/noc',                     target: 'noc-actions' },
    'act-snow':    { route: '/noc/vendor-escalation',   target: KS },
    'act-care':    { route: '/noc/comms',               target: KS },
    verify:        { route: '/noc/perf',                target: KS },
    resolve:       { route: '/noc/pir',                 target: KS },
  });

// ─── Catalog ────────────────────────────────────────────────────────────────
export const sectionScenarios: SectionScenario[] = [
  // CIC
  cicManchester, cicBirmingham, cicLeeds, cicLondon,
  cic999Reachability, cicSilentChurn, cicB2BAccountDrift, cicFamilyReactivation, cicVulnerableProactive, cicRecontractWave,
  // Digital
  digCareChat, digVoiceSave, digEsim, digRoamingPush, digMarketplace,
  digAppStoreWatch, digCheckoutAbandon, digVulnerableCare, digFcrPrediction, digFraudSignup,
  digCampaignLaunch, digAttributionRebalance, digCompetitorCounter, digWinbackLapsed, digAnniversaryLoyalty, digReferAFriend,
  digDecisioningTrace, digVocThemeDrift, digExperimentRollout, digMartechSyncLag, digPriceTest,
  digSelfServiceKbGap, digPrivacyDsarSurge, digForecastSurge, digIdentitySimSwap,
  digOutageComms, digCoverageConversion, digComplaintResolution, digSocialTariff, digFamilyControls, digCookieConsent,
  // BSS
  bssCatalogPublish, bssBillingClose, bssCharging, bssDunning, bssRevAssurance, bssLoyalty,
  bssAccountOnboard, bssCaseSlaBreach, bssInteractionStitch, bssRenewalWindow,
  bssSubPlanChange, bssMediationSuspenseSpike, bssBillRunCycle04, bssPortInBurst,
  bssQuoteB2bFastTrack, bssDisputeBillShock, bssRevRecQuarterClose, bssVatMtdSubmit,
  bssGlPeriodClose, bssWholesaleMonthClose, bssSettlementSpain, bssPromoStackingConflict,
  bssBillShockPrevent, bssEclPeriodClose, bssFalloutPrevented, bssCrossSellFired, bssExplainBillSpike,
  bssConsumerDuty, bssAcquisitionFraud, bssTariffRetirement, bssClawback, bssDeviceFinancing, bssRevenueLeakage,
  // OSS
  ossFieldDispatch, ossCapacity, ossEnergySave, ossInventoryDrift,
  ossAssuranceTriage, ossB2BFastOrder, ossCabRollback, ossDriveTestOptimise, ossVendorSlaBreach, ossSpectrumRefarm,
  ossOpenreachLeadtime, ossSliceActivation, ossDigitalTwinPreCHG, ossServiceOrderReconcile, ossEmfAudit, ossTmf921Sla,
  // NOC
  nocManchester, nocLiverpool, nocLeeds, nocLondonHss, nocSimSwap, nocRoaming, nocMassSimSwap, nocMains,
];

export const scenariosFor = (s: SectionId): SectionScenario[] =>
  sectionScenarios.filter((x) => x.sectionId === s);

export const scenarioById = (id: string): SectionScenario | undefined =>
  sectionScenarios.find((x) => x.id === id);

// Resolve a SectionScenario into the IncidentScript shape consumed by the
// runtime engine in DemoStateProvider. Always succeeds for any id in the
// catalog; falls back to the first NOC scenario otherwise.
export const scriptForScenario = (id: string): { incidentId: string; durationSec: number; events: SeqEvent[]; kpiTargets: any } => {
  const sc = scenarioById(id) ?? sectionScenarios[0];
  return {
    incidentId: sc.id,
    durationSec: sc.durationSec,
    events: sc.events,
    kpiTargets: sc.kpiTargets ?? {},
  };
};

export const SECTION_LABEL: Record<SectionId, string> = {
  cic: 'CIC', digital: 'Digital', bss: 'BSS', oss: 'OSS', noc: 'NOC',
};

export const SECTION_PATH: Record<SectionId, string> = {
  cic: '/command-center', digital: '/digital', bss: '/bss', oss: '/oss', noc: '/noc',
};

export const sectionFromPath = (pathname: string): SectionId | null => {
  if (pathname.startsWith('/noc')) return 'noc';
  if (pathname.startsWith('/digital')) return 'digital';
  if (pathname.startsWith('/bss')) return 'bss';
  if (pathname.startsWith('/oss')) return 'oss';
  if (pathname === '/command-center' || pathname.startsWith('/customer') || pathname.startsWith('/customers') || pathname.startsWith('/compare') || pathname.startsWith('/approvals') || pathname.startsWith('/insights') || pathname.startsWith('/uplift') || pathname.startsWith('/lineage') || pathname.startsWith('/briefing')) return 'cic';
  return null;
};
