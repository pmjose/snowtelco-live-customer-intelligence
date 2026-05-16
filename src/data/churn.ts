export type SignalType = 'Commercial' | 'Network' | 'Care' | 'Market' | 'Billing' | 'Engagement';

export interface ChurnDriver {
  driver: string;
  contribution: number;
  evidence: string;
  signalType: SignalType;
}

export interface DecisioningRules {
  consentEligible: boolean;
  recentOfferFatigue: boolean;
  openComplaint: boolean;
  marginFloorPassed: boolean;
  saveActionAllowed: boolean;
  suppressReason: string | null;
}

export interface ChurnRecord {
  customerId: string;
  churnRisk: number;
  churnRiskBand: 'Low' | 'Medium' | 'High' | 'Very High';
  churnProbability30d: number;
  churnProbability60d: number;
  churnProbability90d: number;
  riskTrend: string;
  expectedRevenueAtRisk: number;
  revenueAtRisk90d: number;
  customerLifetimeValue: number;
  savePriority: 'P1' | 'P2' | 'P3' | 'Suppress';
  modelConfidence: number;
  pacRequestIndicator: 'Likely' | 'Observed' | 'Not observed';
  stacRequestIndicator: 'Likely' | 'Observed' | 'Not observed';
  npsTrend: string;
  appEngagementTrend: string;
  modelVersion: string;
  lastScoredAt: string;
  drivers: ChurnDriver[];
  decisioning: DecisioningRules;
  trend: { week: string; risk: number }[];
}

const baseModel = 'CHURN_MODEL_UK_MOBILE_V3.2';
const scoredAt = '2026-05-08 09:42';

export const churnRecords: ChurnRecord[] = [
  {
    customerId: 'CUST-001',
    churnRisk: 82,
    churnRiskBand: 'Very High',
    churnProbability30d: 31,
    churnProbability60d: 52,
    churnProbability90d: 82,
    riskTrend: '+18 pts in 14 days',
    expectedRevenueAtRisk: 684,
    revenueAtRisk90d: 114,
    customerLifetimeValue: 1840,
    savePriority: 'P1',
    modelConfidence: 87,
    pacRequestIndicator: 'Likely',
    stacRequestIndicator: 'Not observed',
    npsTrend: 'Declined from +14 to -22',
    appEngagementTrend: '-38% sessions in last 30 days',
    modelVersion: baseModel,
    lastScoredAt: scoredAt,
    drivers: [
      { driver: 'Contract ending within 30 days', contribution: 24, evidence: 'Renewal window opens in 21 days', signalType: 'Commercial' },
      { driver: 'Network experience degradation', contribution: 21, evidence: '12 dropped calls and 7 failed data sessions in last 14 days', signalType: 'Network' },
      { driver: 'Recent care complaint', contribution: 17, evidence: 'Open complaint unresolved for 5 days; SLA breach predicted', signalType: 'Care' },
      { driver: 'Competitor switching pressure', contribution: 11, evidence: 'SIM-only benchmark offer estimated £6/month below current plan', signalType: 'Market' },
      { driver: 'Bill shock', contribution: 9, evidence: 'Latest bill 28% above three-month average due to roaming overage', signalType: 'Billing' },
    ],
    decisioning: {
      consentEligible: true,
      recentOfferFatigue: false,
      openComplaint: true,
      marginFloorPassed: true,
      saveActionAllowed: true,
      suppressReason: null,
    },
    trend: [
      { week: 'W-12', risk: 34 },
      { week: 'W-10', risk: 36 },
      { week: 'W-8', risk: 39 },
      { week: 'W-6', risk: 42 },
      { week: 'W-4', risk: 47 },
      { week: 'W-2', risk: 64 },
      { week: 'Now', risk: 82 },
      { week: 'Projected', risk: 41 },
    ],
  },
  {
    customerId: 'CUST-002',
    churnRisk: 76,
    churnRiskBand: 'High',
    churnProbability30d: 22,
    churnProbability60d: 47,
    churnProbability90d: 76,
    riskTrend: '+11 pts in 30 days',
    expectedRevenueAtRisk: 564,
    revenueAtRisk90d: 141,
    customerLifetimeValue: 2210,
    savePriority: 'P1',
    modelConfidence: 81,
    pacRequestIndicator: 'Not observed',
    stacRequestIndicator: 'Not observed',
    npsTrend: 'Declined from +9 to -3',
    appEngagementTrend: 'Stable',
    modelVersion: baseModel,
    lastScoredAt: scoredAt,
    drivers: [
      { driver: 'Bill shock', contribution: 28, evidence: 'Latest bill 32% above three-month average; roaming overage £21', signalType: 'Billing' },
      { driver: 'Contract approaching renewal', contribution: 18, evidence: 'Renewal window opens in 34 days', signalType: 'Commercial' },
      { driver: 'Competitor pressure', contribution: 15, evidence: 'Comparable plan benchmark £8/mo below', signalType: 'Market' },
      { driver: 'Care friction', contribution: 9, evidence: 'Two billing-related contacts in last 21 days', signalType: 'Care' },
      { driver: 'App engagement', contribution: 6, evidence: 'My SnowTelco session count flat', signalType: 'Engagement' },
    ],
    decisioning: { consentEligible: true, recentOfferFatigue: false, openComplaint: false, marginFloorPassed: true, saveActionAllowed: true, suppressReason: null },
    trend: [
      { week: 'W-12', risk: 51 }, { week: 'W-10', risk: 53 }, { week: 'W-8', risk: 55 },
      { week: 'W-6', risk: 58 }, { week: 'W-4', risk: 62 }, { week: 'W-2', risk: 71 },
      { week: 'Now', risk: 76 }, { week: 'Projected', risk: 48 },
    ],
  },
  {
    customerId: 'CUST-003',
    churnRisk: 71,
    churnRiskBand: 'High',
    churnProbability30d: 26,
    churnProbability60d: 49,
    churnProbability90d: 71,
    riskTrend: '+7 pts in 21 days',
    expectedRevenueAtRisk: 240,
    revenueAtRisk90d: 60,
    customerLifetimeValue: 540,
    savePriority: 'P2',
    modelConfidence: 78,
    pacRequestIndicator: 'Likely',
    stacRequestIndicator: 'Not observed',
    npsTrend: 'Declined from +6 to -8',
    appEngagementTrend: '-12% sessions',
    modelVersion: baseModel,
    lastScoredAt: scoredAt,
    drivers: [
      { driver: 'Competitor offer', contribution: 26, evidence: 'Visited competitor pricing page twice', signalType: 'Market' },
      { driver: 'Contract ending within 30 days', contribution: 21, evidence: 'Renewal window opens in 18 days', signalType: 'Commercial' },
      { driver: 'Price sensitivity', contribution: 13, evidence: 'Plan downgrade interaction last month', signalType: 'Engagement' },
      { driver: 'App engagement decline', contribution: 8, evidence: 'My SnowGo usage trending down', signalType: 'Engagement' },
      { driver: 'Care friction', contribution: 3, evidence: 'One unresolved query', signalType: 'Care' },
    ],
    decisioning: { consentEligible: true, recentOfferFatigue: false, openComplaint: false, marginFloorPassed: true, saveActionAllowed: true, suppressReason: null },
    trend: [
      { week: 'W-12', risk: 56 }, { week: 'W-10', risk: 57 }, { week: 'W-8', risk: 58 },
      { week: 'W-6', risk: 60 }, { week: 'W-4', risk: 63 }, { week: 'W-2', risk: 68 },
      { week: 'Now', risk: 71 }, { week: 'Projected', risk: 52 },
    ],
  },
  {
    customerId: 'CUST-004',
    churnRisk: 63,
    churnRiskBand: 'Medium',
    churnProbability30d: 14,
    churnProbability60d: 38,
    churnProbability90d: 63,
    riskTrend: '+9 pts in 30 days',
    expectedRevenueAtRisk: 744,
    revenueAtRisk90d: 186,
    customerLifetimeValue: 2980,
    savePriority: 'P2',
    modelConfidence: 75,
    pacRequestIndicator: 'Not observed',
    stacRequestIndicator: 'Not observed',
    npsTrend: 'Declined from +11 to +1',
    appEngagementTrend: 'Stable',
    modelVersion: baseModel,
    lastScoredAt: scoredAt,
    drivers: [
      { driver: 'Care dissatisfaction', contribution: 22, evidence: '3 contacts about same issue, sentiment negative', signalType: 'Care' },
      { driver: 'Network experience friction', contribution: 14, evidence: 'Indoor coverage complaint', signalType: 'Network' },
      { driver: 'Competitor pressure', contribution: 12, evidence: 'Equivalent plan benchmarked', signalType: 'Market' },
      { driver: 'High value at risk', contribution: 9, evidence: 'CLV £2,980 + handset plan', signalType: 'Commercial' },
      { driver: 'Bill explanation friction', contribution: 6, evidence: 'Asked for bill walk-through', signalType: 'Billing' },
    ],
    decisioning: { consentEligible: true, recentOfferFatigue: false, openComplaint: true, marginFloorPassed: true, saveActionAllowed: true, suppressReason: null },
    trend: [
      { week: 'W-12', risk: 36 }, { week: 'W-10', risk: 38 }, { week: 'W-8', risk: 40 },
      { week: 'W-6', risk: 44 }, { week: 'W-4', risk: 50 }, { week: 'W-2', risk: 58 },
      { week: 'Now', risk: 63 }, { week: 'Projected', risk: 37 },
    ],
  },
  {
    customerId: 'CUST-005',
    churnRisk: 69,
    churnRiskBand: 'High',
    churnProbability30d: 33,
    churnProbability60d: 52,
    churnProbability90d: 69,
    riskTrend: '+12 pts in 21 days',
    expectedRevenueAtRisk: 144,
    revenueAtRisk90d: 36,
    customerLifetimeValue: 320,
    savePriority: 'P2',
    modelConfidence: 79,
    pacRequestIndicator: 'Observed',
    stacRequestIndicator: 'Not observed',
    npsTrend: 'Flat',
    appEngagementTrend: '-22% sessions',
    modelVersion: baseModel,
    lastScoredAt: scoredAt,
    drivers: [
      { driver: 'Price sensitivity', contribution: 24, evidence: 'Multiple plan-comparison sessions in app', signalType: 'Engagement' },
      { driver: 'Contract ending within 14 days', contribution: 22, evidence: 'Renewal window opens in 9 days', signalType: 'Commercial' },
      { driver: 'PAC request indicator', contribution: 14, evidence: 'PAC code initiated via support chat', signalType: 'Commercial' },
      { driver: 'Competitor offer', contribution: 6, evidence: 'Comparable price benchmark', signalType: 'Market' },
      { driver: 'Care friction', contribution: 3, evidence: 'One short interaction', signalType: 'Care' },
    ],
    decisioning: { consentEligible: true, recentOfferFatigue: false, openComplaint: false, marginFloorPassed: true, saveActionAllowed: true, suppressReason: null },
    trend: [
      { week: 'W-12', risk: 42 }, { week: 'W-10', risk: 44 }, { week: 'W-8', risk: 47 },
      { week: 'W-6', risk: 50 }, { week: 'W-4', risk: 55 }, { week: 'W-2', risk: 64 },
      { week: 'Now', risk: 69 }, { week: 'Projected', risk: 50 },
    ],
  },
  {
    customerId: 'CUST-006',
    churnRisk: 64,
    churnRiskBand: 'High',
    churnProbability30d: 18,
    churnProbability60d: 41,
    churnProbability90d: 64,
    riskTrend: '+3 pts in 30 days',
    expectedRevenueAtRisk: 216,
    revenueAtRisk90d: 54,
    customerLifetimeValue: 480,
    savePriority: 'Suppress',
    modelConfidence: 73,
    pacRequestIndicator: 'Not observed',
    stacRequestIndicator: 'Not observed',
    npsTrend: 'Stable',
    appEngagementTrend: 'Stable',
    modelVersion: baseModel,
    lastScoredAt: scoredAt,
    drivers: [
      { driver: 'Offer fatigue', contribution: 28, evidence: 'Received retention offer 12 days ago', signalType: 'Commercial' },
      { driver: 'Price sensitivity', contribution: 14, evidence: 'Repeated plan comparison', signalType: 'Engagement' },
      { driver: 'Contract approaching renewal', contribution: 10, evidence: 'Renewal in 27 days', signalType: 'Commercial' },
      { driver: 'Care friction', contribution: 6, evidence: 'One billing question', signalType: 'Care' },
      { driver: 'Competitor pressure', contribution: 6, evidence: 'Generic competitor browsing', signalType: 'Market' },
    ],
    decisioning: { consentEligible: true, recentOfferFatigue: true, openComplaint: false, marginFloorPassed: true, saveActionAllowed: false, suppressReason: 'Customer received retention offer within last 14 days' },
    trend: [
      { week: 'W-12', risk: 60 }, { week: 'W-10', risk: 60 }, { week: 'W-8', risk: 61 },
      { week: 'W-6', risk: 62 }, { week: 'W-4', risk: 62 }, { week: 'W-2', risk: 63 },
      { week: 'Now', risk: 64 }, { week: 'Projected', risk: 64 },
    ],
  },
];

export const churnByCustomer = (id: string) => churnRecords.find((c) => c.customerId === id) ?? churnRecords[0];

// Aggregate datasets
export const riskDistribution = [
  { band: 'Low', value: 14820000, color: '#10B981' },
  { band: 'Medium', value: 9100000, color: '#F59E0B' },
  { band: 'High', value: 3450000, color: '#EF4444' },
  { band: 'Very High', value: 1630000, color: '#11567F' },
];

export const churnBySegment = [
  { segment: 'Consumer SIM-only', risk: 11.4 },
  { segment: 'Consumer handset', risk: 8.6 },
  { segment: 'Family plans', risk: 6.9 },
  { segment: 'Youth (SnowGo)', risk: 13.2 },
  { segment: 'Prepay (SnowFlex)', risk: 15.7 },
  { segment: 'Business mobile', risk: 5.2 },
];

export const riskByDriver = [
  { driver: 'Contract expiry', share: 27 },
  { driver: 'Network issues', share: 19 },
  { driver: 'Billing shock', share: 16 },
  { driver: 'Care dissatisfaction', share: 14 },
  { driver: 'Competitor pressure', share: 13 },
  { driver: 'Low engagement', share: 11 },
];

export const revenueAtRisk = {
  monthlyRecurringRevenue: 41200000,
  ninetyDayExposure: 123600000,
  clvExposure: 612000000,
  highValueExposure: 184000000,
};

export const networkQualityTrend = [
  { hour: '06:00', baseline: 96, current: 96 },
  { hour: '07:00', baseline: 95, current: 95 },
  { hour: '08:00', baseline: 94, current: 92 },
  { hour: '09:00', baseline: 95, current: 78 },
  { hour: '09:30', baseline: 95, current: 51 },
  { hour: '10:00', baseline: 95, current: 44 },
  { hour: '10:30', baseline: 95, current: 47 },
  { hour: '11:00', baseline: 95, current: 56 },
];

export const incidentImpactByCity = [
  { city: 'Manchester', impact: 2417 },
  { city: 'Birmingham', impact: 320 },
  { city: 'London', impact: 412 },
  { city: 'Leeds', impact: 184 },
  { city: 'Liverpool', impact: 211 },
  { city: 'Glasgow', impact: 92 },
  { city: 'Bristol', impact: 64 },
  { city: 'Cardiff', impact: 43 },
  { city: 'Edinburgh', impact: 51 },
  { city: 'Belfast', impact: 28 },
];
