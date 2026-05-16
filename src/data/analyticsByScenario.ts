import type { ScenarioId } from './scenarios';

// One source of truth for per-scenario analytics. Used by:
//  - bottom-row charts on Command Center
//  - ExecutiveInsights counterfactual + chart row
//  - Lineage scenario focus / row highlighting
//  - Briefing at-a-glance cards
//  - Uplift quadrant
//
// Numbers are presentation-only synthetic figures designed to read coherently
// inside each scenario's narrative.

export interface ScenarioAnalytics {
  riskDistribution: { band: string; value: number; color: string }[];
  churnBySegment:   { segment: string; risk: number }[];
  riskByDriver:     { driver: string; share: number }[];
  kpiTrend: {
    yLabel: string;
    yMax?: number;
    yFormat?: string; // echarts label formatter
    points: { hour: string; baseline: number; current: number }[];
  };
  cityImpact: {
    title: string;
    metric: string;
    rows: { city: string; impact: number }[];
  };
  offers: { name: string; x: number; y: number; margin: 'High' | 'Medium' | 'Low' }[];
  counterfactual: {
    cohortLabel: string;
    cohortNote: string;
    primaryUnit:    string; // e.g. "Expected churners (90d)" / "Upgrades expected (30d)"
    secondaryUnit:  string; // CLV / ARPU lift
    tertiaryUnit:   string; // Care volume / Engagement
    npsUnit:        string;
    withActions:    { primary: string; secondary: string; tertiary: string; nps: string };
    doNothing:      { primary: string; secondary: string; tertiary: string; nps: string };
    headlineWith:   string;
    headlineDoNothing: string;
    withLabel:      string; // toggle label
    doLabel:        string;
  };
  lineageHighlight: string[];
  quadrant: { id: string; name: string; x: number; y: number; group: string }[];
  // Top drivers used by Briefing donut
  topDriversForDonut: { driver: string; share: number }[];
  // Outcome bars for Briefing
  outcomeBars: { label: string; value: number; color: string }[];
}

const RISK_COLORS = { low: '#10B981', med: '#F59E0B', high: '#EF4444', vhigh: '#11567F' };

export const analyticsByScenario: Record<ScenarioId, ScenarioAnalytics> = {
  manchester: {
    riskDistribution: [
      { band: 'Low',       value: 14820000, color: RISK_COLORS.low },
      { band: 'Medium',    value: 9100000,  color: RISK_COLORS.med },
      { band: 'High',      value: 3450000,  color: RISK_COLORS.high },
      { band: 'Very High', value: 1630000,  color: RISK_COLORS.vhigh },
    ],
    churnBySegment: [
      { segment: 'Consumer SIM-only', risk: 11.4 },
      { segment: 'Consumer handset',  risk: 8.6  },
      { segment: 'Family plans',      risk: 6.9  },
      { segment: 'Youth (SnowGo)',    risk: 13.2 },
      { segment: 'Prepay (SnowFlex)', risk: 15.7 },
      { segment: 'Business mobile',   risk: 5.2  },
    ],
    riskByDriver: [
      { driver: 'Network issues',     share: 41 },
      { driver: 'Contract expiry',    share: 22 },
      { driver: 'Care dissatisfaction', share: 14 },
      { driver: 'Billing shock',      share: 8  },
      { driver: 'Competitor pressure',share: 9  },
      { driver: 'Low engagement',     share: 6  },
    ],
    kpiTrend: {
      yLabel: 'Network Experience Score',
      yMax: 100,
      yFormat: '{value}%',
      points: [
        { hour: '06:00', baseline: 96, current: 96 },
        { hour: '07:00', baseline: 95, current: 95 },
        { hour: '08:00', baseline: 94, current: 92 },
        { hour: '09:00', baseline: 95, current: 78 },
        { hour: '09:30', baseline: 95, current: 51 },
        { hour: '10:00', baseline: 95, current: 44 },
        { hour: '10:30', baseline: 95, current: 47 },
        { hour: '11:00', baseline: 95, current: 56 },
      ],
    },
    cityImpact: {
      title: 'Incident impact by area',
      metric: 'Impacted customers',
      rows: [
        { city: 'Manchester M14', impact: 2417 },
        { city: 'Manchester M15', impact: 312  },
        { city: 'Salford M3',     impact: 184  },
        { city: 'Stockport SK1',  impact: 92   },
        { city: 'Bolton BL1',     impact: 64   },
        { city: 'Oldham OL1',     impact: 43   },
        { city: 'Rochdale OL11',  impact: 28   },
      ],
    },
    offers: [
      { name: 'Apology + £5 credit',     x: 78, y: 41, margin: 'High'   },
      { name: '10GB data boost',         x: 64, y: 32, margin: 'Medium' },
      { name: 'Plan refresh (5G Lite)',  x: 49, y: 28, margin: 'High'   },
      { name: 'Senior care callback',    x: 72, y: 22, margin: 'Low'    },
      { name: 'Handset upgrade review',  x: 38, y: 19, margin: 'High'   },
      { name: 'Family plan migration',   x: 31, y: 12, margin: 'High'   },
    ],
    counterfactual: {
      cohortLabel: '89 P1 churn-risk customers · Manchester M14',
      cohortNote: 'Cohort: 89 P1 churn-risk customers · total cohort CLV £420k. Numbers below isolate the marginal effect on the 22 expected churners.',
      primaryUnit:   'Expected churners (90d)',
      secondaryUnit: 'CLV avoided · expected churners',
      tertiaryUnit:  'Care volume impact',
      npsUnit:       'NPS impact',
      withActions:   { primary: '22',  secondary: '£93,640',  tertiary: '+340 contacts',   nps: '+0.5 pts' },
      doNothing:     { primary: '51',  secondary: '£163,400', tertiary: '+1,840 contacts', nps: '-3 pts'   },
      headlineWith:      '22 expected churners · £93k CLV avoided · £420k cohort CLV protected',
      headlineDoNothing: '51 expected churners · £163k CLV lost · cohort CLV exposed £420k',
      withLabel: 'Showing: With actions',
      doLabel:   'Showing: Do nothing',
    },
    lineageHighlight: [
      'Network experience degradation',
      'Contract ending within 30 days',
      'Anomaly score (PRB utilisation)',
      'Network alarm stream',
    ],
    quadrant: [
      { id: 'CUST-001', name: 'Amelia', x: 78, y: 64, group: 'Persuadable' },
      { id: 'CUST-002', name: 'Daniel', x: 71, y: 58, group: 'Persuadable' },
      { id: 'CUST-003', name: 'Sophie', x: 56, y: 42, group: 'Persuadable' },
      { id: 'CUST-004', name: 'Ravi',   x: 64, y: 26, group: 'Sure thing' },
      { id: 'CUST-005', name: 'Grace',  x: 73, y: 49, group: 'Persuadable' },
      { id: 'CUST-006', name: 'Owen',   x: 28, y: 18, group: 'Do not disturb' },
    ],
    topDriversForDonut: [
      { driver: 'Network issues',  share: 41 },
      { driver: 'Contract expiry', share: 22 },
      { driver: 'Care',            share: 14 },
      { driver: 'Other',           share: 23 },
    ],
    outcomeBars: [
      { label: 'CLV protected (with action)', value: 93640, color: '#10B981' },
      { label: 'CLV lost (do nothing)',       value: 163400, color: '#E11D48' },
      { label: 'Avg cohort baseline',         value: 50000,  color: '#9CA3AF' },
    ],
  },
  'birmingham-bill': {
    riskDistribution: [
      { band: 'Within tolerance', value: 620000, color: RISK_COLORS.low },
      { band: '10–25% above',     value: 380000, color: RISK_COLORS.med },
      { band: '25–60% above',     value: 1110000, color: RISK_COLORS.high },
      { band: '60%+ above',       value: 110000, color: RISK_COLORS.vhigh },
    ],
    churnBySegment: [
      { segment: 'Roaming-heavy SnowTelco',    risk: 22.4 },
      { segment: 'Roaming-light SnowTelco',    risk: 6.1  },
      { segment: 'SnowFlex roaming',           risk: 17.8 },
      { segment: 'Bus mobile (roaming)',       risk: 9.4  },
      { segment: 'Inclusive bundle (no roam)', risk: 2.1  },
      { segment: 'Family plans',               risk: 4.6  },
    ],
    riskByDriver: [
      { driver: 'Bill shock',          share: 38 },
      { driver: 'Roaming policy gap',  share: 24 },
      { driver: 'Care dissatisfaction',share: 14 },
      { driver: 'Engagement decline',  share: 11 },
      { driver: 'Competitor pressure', share: 8  },
      { driver: 'Other',               share: 5  },
    ],
    kpiTrend: {
      yLabel: 'Bills 25%+ above baseline (count)',
      yMax: 700,
      yFormat: '{value}',
      points: [
        { hour: '06:00', baseline: 110, current: 110 },
        { hour: '07:00', baseline: 110, current: 140 },
        { hour: '08:00', baseline: 110, current: 220 },
        { hour: '09:00', baseline: 110, current: 380 },
        { hour: '09:30', baseline: 110, current: 540 },
        { hour: '10:00', baseline: 110, current: 620 },
        { hour: '10:30', baseline: 110, current: 600 },
        { hour: '11:00', baseline: 110, current: 540 },
      ],
    },
    cityImpact: {
      title: 'Bill-shock impact by area',
      metric: 'Roaming overage bills',
      rows: [
        { city: 'Birmingham B4', impact: 1840 },
        { city: 'Solihull B91',  impact: 220  },
        { city: 'Wolverhampton WV1', impact: 184 },
        { city: 'Coventry CV1',  impact: 142  },
        { city: 'Walsall WS1',   impact: 84   },
        { city: 'Dudley DY1',    impact: 42   },
        { city: 'Stoke ST1',     impact: 28   },
      ],
    },
    offers: [
      { name: 'Bill explainer SMS',          x: 88, y: 14, margin: 'High'   },
      { name: '£4 goodwill credit',          x: 71, y: 36, margin: 'Medium' },
      { name: 'Roaming Pass auto-enrol',     x: 64, y: 28, margin: 'High'   },
      { name: 'Full refund + Pass enrol',    x: 78, y: 47, margin: 'Low'    },
      { name: 'Senior care callback',        x: 56, y: 22, margin: 'Medium' },
      { name: 'Tariff bundle migration',     x: 38, y: 18, margin: 'High'   },
    ],
    counterfactual: {
      cohortLabel: '1,840 bill-shock cohort · Birmingham B4',
      cohortNote: 'Cohort: 1,840 customers with roaming bills 25%+ above baseline · 244 high-CLV. Total cohort CLV £180k. Tile values below isolate the expected-churner subset.',
      primaryUnit:   'Expected churners (90d)',
      secondaryUnit: 'CLV avoided · expected churners',
      tertiaryUnit:  'Care volume impact',
      npsUnit:       'NPS impact',
      withActions:   { primary: '38',  secondary: '£62,400',  tertiary: '+520 contacts',   nps: '+0.4 pts' },
      doNothing:     { primary: '142', secondary: '£312,800', tertiary: '+3,200 contacts', nps: '-4 pts'   },
      headlineWith:      '38 expected churners · £62k CLV avoided · £180k cohort CLV protected · 1,840 enrolled in Roaming Pass',
      headlineDoNothing: '142 expected churners · £313k CLV lost · Ofcom complaint risk +220%',
      withLabel: 'Showing: Bill explainer + credit + Roaming Pass',
      doLabel:   'Showing: Do nothing',
    },
    lineageHighlight: [
      'Bill shock',
      'Billing cycle facts',
      'TAP3 interconnect reconcile',
      'Roaming Pass policy gap',
    ],
    quadrant: [
      { id: 'CUST-001', name: 'Amelia', x: 64, y: 38, group: 'Persuadable' },
      { id: 'CUST-002', name: 'Daniel', x: 76, y: 62, group: 'Persuadable' },
      { id: 'CUST-003', name: 'Sophie', x: 52, y: 28, group: 'Persuadable' },
      { id: 'CUST-004', name: 'Ravi',   x: 48, y: 14, group: 'Sure thing'  },
      { id: 'CUST-005', name: 'Grace',  x: 41, y: 22, group: 'Sure thing'  },
      { id: 'CUST-006', name: 'Owen',   x: 32, y: 12, group: 'Do not disturb' },
    ],
    topDriversForDonut: [
      { driver: 'Bill shock',         share: 38 },
      { driver: 'Roaming policy gap', share: 24 },
      { driver: 'Care',               share: 14 },
      { driver: 'Other',              share: 24 },
    ],
    outcomeBars: [
      { label: 'CLV protected (with action)', value: 180000, color: '#10B981' },
      { label: 'CLV lost (do nothing)',       value: 312800, color: '#E11D48' },
      { label: 'Refund cost',                 value: 7400,   color: '#F59E0B' },
    ],
  },
  'leeds-snowflex': {
    riskDistribution: [
      { band: 'Stable',           value: 4200000, color: RISK_COLORS.low },
      { band: 'Browsing market',  value: 1820000, color: RISK_COLORS.med },
      { band: 'PAC requested',    value: 940000,  color: RISK_COLORS.high },
      { band: 'PAC committed',    value: 110000,  color: RISK_COLORS.vhigh },
    ],
    churnBySegment: [
      { segment: 'SnowFlex SIM-only flex', risk: 18.4 },
      { segment: 'SnowFlex 30GB',          risk: 14.2 },
      { segment: 'SnowFlex 60GB',          risk: 9.6  },
      { segment: 'Family flex',            risk: 6.4  },
      { segment: 'Youth flex',             risk: 22.1 },
      { segment: 'Senior flex',            risk: 4.2  },
    ],
    riskByDriver: [
      { driver: 'Competitor pressure',  share: 36 },
      { driver: 'PAC indicator',        share: 24 },
      { driver: 'Price sensitivity',    share: 19 },
      { driver: 'Tenure / contract end',share: 12 },
      { driver: 'Care dissatisfaction', share: 6  },
      { driver: 'Other',                share: 3  },
    ],
    kpiTrend: {
      yLabel: 'PAC requests / day',
      yMax: 200,
      yFormat: '{value}',
      points: [
        { hour: 'Mon', baseline: 32, current: 31 },
        { hour: 'Tue', baseline: 32, current: 36 },
        { hour: 'Wed', baseline: 32, current: 58 },
        { hour: 'Thu', baseline: 32, current: 92 },
        { hour: 'Fri', baseline: 32, current: 122 },
        { hour: 'Sat', baseline: 32, current: 142 },
        { hour: 'Sun', baseline: 32, current: 138 },
        { hour: 'Today', baseline: 32, current: 128 },
      ],
    },
    cityImpact: {
      title: 'PAC volume by area',
      metric: 'PAC requests · last 7d',
      rows: [
        { city: 'Leeds LS2',  impact: 412 },
        { city: 'Leeds LS5',  impact: 268 },
        { city: 'Bradford BD1', impact: 184 },
        { city: 'Wakefield WF1', impact: 92 },
        { city: 'Huddersfield HD1', impact: 64 },
        { city: 'Halifax HX1', impact: 41 },
        { city: 'York YO1',   impact: 28  },
      ],
    },
    offers: [
      { name: '+30GB at same price',           x: 81, y: 42, margin: 'Medium' },
      { name: '6mo loyalty boost',             x: 74, y: 38, margin: 'High'   },
      { name: '£18 SIM-only match',            x: 86, y: 31, margin: 'Low'    },
      { name: 'Family plan migration',         x: 38, y: 14, margin: 'High'   },
      { name: 'Disney+ 6mo bundle',            x: 52, y: 22, margin: 'Medium' },
      { name: 'Care callback (price coach)',   x: 64, y: 18, margin: 'High'   },
    ],
    counterfactual: {
      cohortLabel: '940-PAC SnowFlex cohort · Leeds LS2',
      cohortNote: 'Cohort: 940 PAC requests in last 7 days · 28 high-CLV. Total cohort CLV £142k.',
      primaryUnit:   'Customers retained (PAC declined)',
      secondaryUnit: 'CLV protected · save uplift',
      tertiaryUnit:  'Care volume impact',
      npsUnit:       'NPS impact',
      withActions:   { primary: '412', secondary: '£94,000',  tertiary: '+180 contacts', nps: '+0.6 pts' },
      doNothing:     { primary: '264', secondary: '£32,000',  tertiary: '+820 contacts', nps: '-2 pts'   },
      headlineWith:      '412 PAC declined · £94k CLV protected · save rate 44%',
      headlineDoNothing: '676 customers ported · £142k CLV lost · save rate 28%',
      withLabel: 'Showing: Price match + loyalty boost',
      doLabel:   'Showing: Do nothing',
    },
    lineageHighlight: [
      'Competitor switching pressure',
      'PAC request indicator',
      'Tariff elasticity',
      'App engagement decline',
    ],
    quadrant: [
      { id: 'CUST-001', name: 'Amelia', x: 48, y: 32, group: 'Persuadable' },
      { id: 'CUST-002', name: 'Daniel', x: 56, y: 28, group: 'Persuadable' },
      { id: 'CUST-003', name: 'Sophie', x: 41, y: 21, group: 'Sure thing'  },
      { id: 'CUST-004', name: 'Ravi',   x: 38, y: 14, group: 'Sure thing'  },
      { id: 'CUST-005', name: 'Grace',  x: 78, y: 58, group: 'Persuadable' },
      { id: 'CUST-006', name: 'Owen',   x: 34, y: 12, group: 'Do not disturb' },
    ],
    topDriversForDonut: [
      { driver: 'Competitor pressure', share: 36 },
      { driver: 'PAC indicator',       share: 24 },
      { driver: 'Price sensitivity',   share: 19 },
      { driver: 'Other',               share: 21 },
    ],
    outcomeBars: [
      { label: 'CLV protected (price match)', value: 94000,  color: '#10B981' },
      { label: 'CLV lost (do nothing)',       value: 142000, color: '#E11D48' },
      { label: 'Treatment cost',              value: 6800,   color: '#F59E0B' },
    ],
  },
  'london-5g': {
    riskDistribution: [
      { band: '4G handset',              value: 880000,  color: RISK_COLORS.low },
      { band: '5G handset, legacy plan', value: 274000,  color: RISK_COLORS.med },
      { band: 'Propensity > 0.6',        value: 12400,   color: '#2563EB' },
      { band: 'High-CLV ready',          value: 1280,    color: RISK_COLORS.vhigh },
    ],
    churnBySegment: [
      { segment: '5G handset · legacy plan',    risk: 28.4 },
      { segment: '5G handset · upgraded plan',  risk: 6.2  },
      { segment: '4G handset',                  risk: 1.4  },
      { segment: 'IoT',                         risk: 0.4  },
      { segment: 'Bus mobile',                  risk: 3.2  },
      { segment: 'Family plans',                risk: 7.8  },
    ],
    riskByDriver: [
      { driver: '5G handset (TAC match)', share: 41 },
      { driver: 'Heavy data > 80GB/mo',   share: 28 },
      { driver: 'Legacy plan flag',       share: 19 },
      { driver: 'Tenure (mo)',            share: 7  },
      { driver: 'Coverage at home',       share: 3  },
      { driver: 'Other',                  share: 2  },
    ],
    kpiTrend: {
      yLabel: '5G SA conversion %',
      yMax: 14,
      yFormat: '{value}%',
      points: [
        { hour: '00:00', baseline: 4, current: 4 },
        { hour: '03:00', baseline: 4, current: 5 },
        { hour: '06:00', baseline: 4, current: 6 },
        { hour: '09:00', baseline: 4, current: 8 },
        { hour: '12:00', baseline: 4, current: 9 },
        { hour: '15:00', baseline: 4, current: 10.4 },
        { hour: '18:00', baseline: 4, current: 11.2 },
        { hour: '21:00', baseline: 4, current: 11.4 },
      ],
    },
    cityImpact: {
      title: '5G upgrade-eligible by area',
      metric: 'Eligible cohort',
      rows: [
        { city: 'London E14',     impact: 12400 },
        { city: 'London E1',      impact: 8200  },
        { city: 'London SE1',     impact: 7200  },
        { city: 'London SW1',     impact: 5600  },
        { city: 'London W1',      impact: 4800  },
        { city: 'London EC2',     impact: 3400  },
        { city: 'London N1',      impact: 2400  },
      ],
    },
    offers: [
      { name: '5G SA Unlimited Max + £5 credit', x: 88, y: 42, margin: 'High'   },
      { name: '5G SA Unlimited',                 x: 74, y: 32, margin: 'High'   },
      { name: 'Handset upgrade · loyalty',       x: 56, y: 28, margin: 'Medium' },
      { name: 'Family plan migration',           x: 38, y: 18, margin: 'High'   },
      { name: 'Care concierge call',             x: 64, y: 16, margin: 'Low'    },
      { name: 'Disney+ / Apple+ bundle',         x: 28, y: 12, margin: 'Medium' },
    ],
    counterfactual: {
      cohortLabel: '12,400 upgrade-eligible · London E14',
      cohortNote: 'Cohort: 12,400 5G-capable customers, propensity > 0.6 · 1,280 high-CLV',
      primaryUnit:   'Upgrades expected (30d)',
      secondaryUnit: 'ARPU lift / yr',
      tertiaryUnit:  'Engagement uplift',
      npsUnit:       'NPS impact',
      withActions:   { primary: '1,420', secondary: '+£180k/yr', tertiary: '+18 pts session-time', nps: '+1.2 pts' },
      doNothing:     { primary: '496',   secondary: '+£62k/yr',  tertiary: '+4 pts session-time',  nps: '0 pts'   },
      headlineWith:      '1,420 upgrades · +£180k/yr ARPU lift · day-1 conv 11.4%',
      headlineDoNothing: '496 upgrades · +£62k/yr ARPU lift · day-1 conv 4%',
      withLabel: 'Showing: Upgrade journey',
      doLabel:   'Showing: Do nothing',
    },
    lineageHighlight: [
      '5G handset propensity',
      'App engagement decline',
      'Network experience degradation',
      'Tariff elasticity',
    ],
    quadrant: [
      { id: 'CUST-001', name: 'Amelia', x: 38, y: 16, group: 'Sure thing'  },
      { id: 'CUST-002', name: 'Daniel', x: 42, y: 22, group: 'Sure thing'  },
      { id: 'CUST-003', name: 'Sophie', x: 48, y: 28, group: 'Persuadable' },
      { id: 'CUST-004', name: 'Ravi',   x: 78, y: 64, group: 'Persuadable' },
      { id: 'CUST-005', name: 'Grace',  x: 52, y: 32, group: 'Persuadable' },
      { id: 'CUST-006', name: 'Owen',   x: 28, y: 8,  group: 'Do not disturb' },
    ],
    topDriversForDonut: [
      { driver: '5G handset',     share: 41 },
      { driver: 'Heavy data',     share: 28 },
      { driver: 'Legacy plan',    share: 19 },
      { driver: 'Other',          share: 12 },
    ],
    outcomeBars: [
      { label: 'ARPU lift / yr (with journey)', value: 180000, color: '#2563EB' },
      { label: 'ARPU lift / yr (do nothing)',   value: 62000,  color: '#9CA3AF' },
      { label: 'Programme cost',                value: 14000,  color: '#F59E0B' },
    ],
  },
};

export function analyticsForScenario(id: string): ScenarioAnalytics {
  return (analyticsByScenario as any)[id] ?? analyticsByScenario.manchester;
}
