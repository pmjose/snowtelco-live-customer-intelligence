import type { Stage } from '@/state/stages';

export type ScenarioId = 'manchester' | 'birmingham-bill' | 'leeds-snowflex' | 'london-5g';
export type ScenarioTheme = 'network' | 'billing' | 'commercial' | 'growth';

export interface Scenario {
  id: ScenarioId;
  theme: ScenarioTheme;
  label: string;
  short: string;
  city: string;
  postcode: string;
  storyline: string;
  primaryCustomerId: string;
  incidentTitle: string;
  incidentSeverity: 'High' | 'Medium' | 'Low';
  impactedCustomers: number;
  highValueCustomers: number;
  highChurnRiskCustomers: number;
  cellSitesImpacted: number;
  speedBefore: number;
  speedAfter: number;
  droppedCallIncreasePct: number;
  failedDataSessionIncreasePct: number;
  rootCauseHypothesis: string;
  recommendedNetworkAction: string;
  recommendedCareAction: string;
  coordinates: [number, number];
  detectedAt: string;
  affectedTechnology: string[];
  brand: string;
  narration: Record<Stage, string>;
  topAtRisk: string[];
}

export const scenarios: Scenario[] = [
  {
    id: 'manchester',
    theme: 'network',
    label: 'Manchester M14 — Network degradation',
    short: 'Manchester',
    city: 'Manchester',
    postcode: 'M14',
    storyline: 'Cell-cluster degradation creates churn risk across high-value SnowTelco Lite customers.',
    primaryCustomerId: 'CUST-001',
    incidentTitle: 'Manchester M14 cell cluster degradation',
    incidentSeverity: 'High',
    impactedCustomers: 2417,
    highValueCustomers: 312,
    highChurnRiskCustomers: 89,
    cellSitesImpacted: 7,
    speedBefore: 118,
    speedAfter: 34,
    droppedCallIncreasePct: 37,
    failedDataSessionIncreasePct: 42,
    rootCauseHypothesis: 'Peak-period demand spike + degraded backhaul on cluster MAN-01: PRB utilisation 96%, GTP-U packet drops, BH circuit MAN-01-BH-2 packet loss 4.1%.',
    recommendedNetworkAction: 'MLB intra-cluster (offset −3dB on hot cell) + secondary carrier add (band n1); ServiceNow standard change CHG0012987.',
    recommendedCareAction: 'Pre-approved retention playbook PB-RT-CRED-005: proactive apology + £5 service credit + plan refresh for P1.',
    coordinates: [-2.226, 53.451],
    detectedAt: '2026-05-08 09:31',
    affectedTechnology: ['4G', '5G'],
    brand: 'SnowTelco Lite',
    narration: {
      normal: 'Network stable. Customer baseline at expected levels.',
      incident_detected: 'Anomaly flagged in Manchester M14: 7 cell sites showing degraded performance.',
      customers_impacted: '2,417 customers identified as impacted, 312 high-value, 89 P1 churn-risk.',
      churn_scored: 'Churn impact model executed. Amelia Hughes risk jumps from 42% to 82%.',
      customer_selected: 'Customer 360 opened for Amelia Hughes — SnowTelco Lite, Manchester M14, contract ends in 21 days.',
      offer_generated: 'Recommended action: proactive apology + £5 loyalty credit + unlimited 5G retention plan.',
      outreach_triggered: 'Outreach triggered: SMS, in-app push, care callback queued, NOC ticket escalated.',
      risk_reduced: 'Projected risk dropped 82% → 41%. Action in progress for the remaining 88 P1 customers.',
    },
    topAtRisk: ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-004', 'CUST-005'],
  },
  {
    id: 'birmingham-bill',
    theme: 'billing',
    label: 'Post-Easter roaming bill-shock · 1,840 without Roaming Pass',
    short: 'Roaming bill-shock',
    city: 'Birmingham',
    postcode: 'B4',
    storyline: 'Behavioural cohort: 1,840 customers travelled non-EU during Easter without Roaming Pass auto-enrol — bills 25%+ above baseline. National incident, not regional.',
    primaryCustomerId: 'CUST-002',
    incidentTitle: 'Roaming bill-shock wave · post-Easter cohort',
    incidentSeverity: 'Medium',
    impactedCustomers: 1840,
    highValueCustomers: 244,
    highChurnRiskCustomers: 71,
    cellSitesImpacted: 0,
    speedBefore: 110,
    speedAfter: 110,
    droppedCallIncreasePct: 0,
    failedDataSessionIncreasePct: 0,
    rootCauseHypothesis: 'Behavioural cohort: customers travelled non-EU during Easter, lacked Roaming Pass auto-enrol, no spend cap configured. Bills landed 25%+ above 6-month baseline.',
    recommendedNetworkAction: 'No network action required.',
    recommendedCareAction: 'Proactive bill explanation, Roaming Pass auto-enrol, and retention treatment for high-value contacts.',
    coordinates: [-1.898, 52.486],
    detectedAt: '2026-05-08 09:15',
    affectedTechnology: ['Billing'],
    brand: 'SnowTelco',
    narration: {
      normal: 'Billing baseline normal.',
      incident_detected: 'Roaming overage cohort detected — 1,840 customers, bills 25%+ above baseline (national, not regional).',
      customers_impacted: '244 high-value customers exposed to bill-shock churn risk.',
      churn_scored: 'Daniel Shah re-scored from 54% to 76% — primary driver bill-shock.',
      customer_selected: 'Customer 360 opened for Daniel Shah — SnowTelco · cohort representative.',
      offer_generated: 'Recommended action: bill explanation + £4 loyalty credit + Roaming Pass auto-enrol.',
      outreach_triggered: 'Outbound call queued, Roaming Pass enrolment ready, goodwill credit policy check passed (max 3/12mo).',
      risk_reduced: 'Projected risk dropped 76% → 48% across the cohort.',
    },
    topAtRisk: ['CUST-002', 'CUST-004', 'CUST-001', 'CUST-005', 'CUST-003'],
  },
  {
    id: 'leeds-snowflex',
    theme: 'commercial',
    label: 'Competitor tariff PAC spike · SnowFlex price-sensitive cohort',
    short: 'Competitor PAC spike',
    city: 'Leeds',
    postcode: 'LS2',
    storyline: 'Competitor mid-month tariff launch (national) triggers a PAC-request spike across the SnowFlex price-sensitive base — cohort defined by tenure × tariff × usage, not geography.',
    primaryCustomerId: 'CUST-005',
    incidentTitle: 'Competitor tariff PAC spike · SnowFlex cohort',
    incidentSeverity: 'Medium',
    impactedCustomers: 940,
    highValueCustomers: 28,
    highChurnRiskCustomers: 122,
    cellSitesImpacted: 0,
    speedBefore: 96,
    speedAfter: 96,
    droppedCallIncreasePct: 0,
    failedDataSessionIncreasePct: 0,
    rootCauseHypothesis: 'Competitor 30GB SIM-only campaign pricing 18% below benchmark — PAC requests trending in SnowFlex price-sensitive cohort.',
    recommendedNetworkAction: 'No network action.',
    recommendedCareAction: 'Targeted SnowFlex price-match retention with 12-month price lock, gated by tenure and CLV uplift checks.',
    coordinates: [-1.548, 53.800],
    detectedAt: '2026-05-08 08:48',
    affectedTechnology: ['Commercial'],
    brand: 'SnowFlex',
    narration: {
      normal: 'SnowFlex base steady.',
      incident_detected: 'PAC request spike detected (Ofcom MNP) — 122 SnowFlex customers in last 24h, national pattern.',
      customers_impacted: '940 customers in renewal window exposed to competitor pressure.',
      churn_scored: 'Grace Williams re-scored to 69% — driver: price sensitivity + PAC indicator.',
      customer_selected: 'Customer 360 opened for Grace Williams — SnowFlex · cohort representative.',
      offer_generated: 'Recommended action: 30GB price match + 12-month price lock (tenure ≥12mo, predicted CLV uplift > offer cost).',
      outreach_triggered: 'App push and SMS retention treatment queued; offer-fatigue check (60d) passed.',
      risk_reduced: 'Projected risk 69% → 50% across cohort.',
    },
    topAtRisk: ['CUST-005', 'CUST-003', 'CUST-006', 'CUST-001', 'CUST-002'],
  },
  {
    id: 'london-5g',
    theme: 'growth',
    label: 'London E14 — 5G SA launch · upgrade opportunity',
    short: 'London',
    city: 'London',
    postcode: 'E14',
    storyline: '5G SA launch in Canary Wharf — proactive upgrade journeys for high-CLV customers.',
    primaryCustomerId: 'CUST-004',
    incidentTitle: 'London E14 — 5G SA launch (n78 + n1 anchor)',
    incidentSeverity: 'Low',
    impactedCustomers: 12400,
    highValueCustomers: 1280,
    highChurnRiskCustomers: 320,
    cellSitesImpacted: 0,
    speedBefore: 154,
    speedAfter: 612,
    droppedCallIncreasePct: 0,
    failedDataSessionIncreasePct: 0,
    rootCauseHypothesis: '5G Standalone activated across 14 sites (Ericsson AIR 6428 + dual-mode 5G Core slice). Upgrade opportunity, not an incident.',
    recommendedNetworkAction: 'Monitor standalone slice utilisation and end-to-end latency vs SLA targets.',
    recommendedCareAction: 'Personalised upgrade journey to 5G SA-capable plans for handset-eligible customers (eligibility checked against IMEI TAC database).',
    coordinates: [-0.018, 51.505],
    detectedAt: '2026-05-08 08:00',
    affectedTechnology: ['5G SA'],
    brand: 'SnowTelco',
    narration: {
      normal: 'London E14 baseline.',
      incident_detected: '5G Standalone live across 14 Canary Wharf sites — 12,400 high-CLV customers in coverage are upgrade-eligible.',
      customers_impacted: '12,400 customers eligible (5G handset + in-coverage + propensity > 0.6); 1,280 are high-CLV.',
      churn_scored: 'Engagement scoring complete. Ravi Patel ranked top upgrade-propensity in cluster.',
      customer_selected: 'Customer 360 opened for Ravi Patel — SnowTelco, London E14.',
      offer_generated: 'Recommended action: 5G SA Unlimited Max + handset upgrade with loyalty discount.',
      outreach_triggered: 'In-app upgrade journey enabled, care callback for high-CLV cohort.',
      risk_reduced: 'Projected uplift +£11 ARPU on accepted journeys.',
    },
    topAtRisk: ['CUST-004', 'CUST-002', 'CUST-001', 'CUST-005', 'CUST-003'],
  },
];

export const scenarioById = (id: ScenarioId) => scenarios.find((s) => s.id === id) ?? scenarios[0];
