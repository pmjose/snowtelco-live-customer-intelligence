import type { Stage } from '@/state/stages';

export interface TimelineEvent {
  time: string;
  title: string;
  stage: Stage;
}

export const liveTimeline: TimelineEvent[] = [
  { time: '09:31', title: 'Network telemetry anomaly detected in Manchester M14', stage: 'incident_detected' },
  { time: '09:33', title: 'Cell cluster degradation confirmed across 7 sites', stage: 'incident_detected' },
  { time: '09:35', title: '2,417 impacted customers identified', stage: 'customers_impacted' },
  { time: '09:37', title: 'Churn impact model executed', stage: 'churn_scored' },
  { time: '09:38', title: '89 P1 customers prioritized', stage: 'churn_scored' },
  { time: '09:40', title: 'Customer 360 opened for Amelia Hughes', stage: 'customer_selected' },
  { time: '09:42', title: 'Next-best-action generated', stage: 'offer_generated' },
  { time: '09:44', title: 'Proactive SMS / app workflow prepared', stage: 'outreach_triggered' },
  { time: '09:46', title: 'Projected churn risk reduced from 82% to 41%', stage: 'risk_reduced' },
];

export interface CustomerEvent {
  date: string;
  text: string;
}

export const customerTimelines: Record<string, CustomerEvent[]> = {
  'CUST-001': [
    { date: '2026-04-14', text: 'Bill 28% above average due to roaming overage' },
    { date: '2026-04-19', text: 'App engagement dropped below normal pattern' },
    { date: '2026-04-22', text: 'Complaint opened: poor data speeds' },
    { date: '2026-04-27', text: 'Complaint unresolved after 5 days' },
    { date: '2026-05-03', text: 'Network degradation detected in home postcode' },
    { date: '2026-05-08', text: 'Churn score increased to 82%' },
    { date: '2026-05-08', text: 'Retention action recommended' },
  ],
  'CUST-002': [
    { date: '2026-04-02', text: 'Travel detected — roaming usage in Spain' },
    { date: '2026-04-12', text: 'Bill 32% above average; roaming overage £21' },
    { date: '2026-04-22', text: 'Care contact: bill explanation request' },
    { date: '2026-05-01', text: 'Competitor pricing benchmark visited' },
    { date: '2026-05-08', text: 'Churn score 76%' },
  ],
  'CUST-003': [
    { date: '2026-04-09', text: 'Plan-comparison sessions in app' },
    { date: '2026-04-21', text: 'Visit to competitor pricing page' },
    { date: '2026-04-30', text: 'Plan downgrade interaction' },
    { date: '2026-05-08', text: 'Churn score 71%' },
  ],
  'CUST-004': [
    { date: '2026-04-05', text: 'Care contact: indoor coverage complaint' },
    { date: '2026-04-12', text: 'Care contact: same issue, sentiment negative' },
    { date: '2026-04-19', text: 'Care contact #3, escalation requested' },
    { date: '2026-05-08', text: 'Churn score 63%' },
  ],
  'CUST-005': [
    { date: '2026-04-25', text: 'Plan-comparison sessions in app' },
    { date: '2026-05-01', text: 'PAC code requested via support chat' },
    { date: '2026-05-08', text: 'Churn score 69%' },
  ],
  'CUST-006': [
    { date: '2026-04-26', text: 'Retention offer accepted (12 days ago)' },
    { date: '2026-05-01', text: 'Plan-comparison sessions' },
    { date: '2026-05-08', text: 'Churn score 64% — suppressed (offer fatigue)' },
  ],
};

export const careHistory: Record<string, {
  openTickets: number;
  recentComplaints: number;
  lastContactReason: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  resolutionStatus: string;
  lastAgentNote: string;
}> = {
  'CUST-001': { openTickets: 1, recentComplaints: 2, lastContactReason: 'Poor data speeds and dropped calls', sentiment: 'Negative', resolutionStatus: 'Open - SLA risk', lastAgentNote: 'Customer reported poor 5G performance around home postcode and asked about contract end date.' },
  'CUST-002': { openTickets: 0, recentComplaints: 1, lastContactReason: 'Bill explanation request after roaming', sentiment: 'Neutral', resolutionStatus: 'Resolved', lastAgentNote: 'Customer asked for proactive bill alerts going forward.' },
  'CUST-003': { openTickets: 0, recentComplaints: 0, lastContactReason: 'Plan question', sentiment: 'Neutral', resolutionStatus: 'Resolved', lastAgentNote: 'Customer interested in flexible add-ons.' },
  'CUST-004': { openTickets: 1, recentComplaints: 3, lastContactReason: 'Indoor coverage complaint', sentiment: 'Negative', resolutionStatus: 'Open - SLA risk', lastAgentNote: 'Customer requested escalation; expressed frustration with unresolved status.' },
  'CUST-005': { openTickets: 0, recentComplaints: 0, lastContactReason: 'PAC code request', sentiment: 'Neutral', resolutionStatus: 'Open - retention', lastAgentNote: 'Customer cited price as reason for considering switch.' },
  'CUST-006': { openTickets: 0, recentComplaints: 0, lastContactReason: 'Retention discussion', sentiment: 'Positive', resolutionStatus: 'Resolved', lastAgentNote: 'Customer accepted refreshed plan; do not re-offer.' },
};

export const usageBilling: Record<string, {
  monthlyDataUsageGb: number;
  dataUsageTrend: string;
  roamingUsage: string;
  latestBillAmount: number;
  averageBillAmount: number;
  billShockFlag: boolean;
  paymentStatus: string;
  productHoldings: string[];
}> = {
  'CUST-001': { monthlyDataUsageGb: 84, dataUsageTrend: '+23% vs prior month', roamingUsage: 'High last billing cycle', latestBillAmount: 49, averageBillAmount: 38, billShockFlag: true, paymentStatus: 'Current', productHoldings: ['Mobile SIM-only', 'Roaming add-on'] },
  'CUST-002': { monthlyDataUsageGb: 62, dataUsageTrend: '+9% vs prior month', roamingUsage: 'High last cycle', latestBillAmount: 62, averageBillAmount: 47, billShockFlag: true, paymentStatus: 'Current', productHoldings: ['Handset plan', 'SnowTelco Xtra perks'] },
  'CUST-003': { monthlyDataUsageGb: 28, dataUsageTrend: 'Flat', roamingUsage: 'None', latestBillAmount: 20, averageBillAmount: 20, billShockFlag: false, paymentStatus: 'Current', productHoldings: ['SIM-only'] },
  'CUST-004': { monthlyDataUsageGb: 58, dataUsageTrend: '-4%', roamingUsage: 'Occasional', latestBillAmount: 64, averageBillAmount: 62, billShockFlag: false, paymentStatus: 'Current', productHoldings: ['Handset', 'Watch plan', 'Pro Broadband'] },
  'CUST-005': { monthlyDataUsageGb: 21, dataUsageTrend: '+3%', roamingUsage: 'None', latestBillAmount: 12, averageBillAmount: 12, billShockFlag: false, paymentStatus: 'Current', productHoldings: ['SIM-only flexible'] },
  'CUST-006': { monthlyDataUsageGb: 26, dataUsageTrend: 'Flat', roamingUsage: 'None', latestBillAmount: 18, averageBillAmount: 18, billShockFlag: false, paymentStatus: 'Current', productHoldings: ['SIM-only'] },
};

export const networkExperience: Record<string, {
  networkExperienceScore: number;
  droppedCalls14d: number;
  failedDataSessions14d: number;
  avgDownloadSpeedMbpsBefore: number;
  avgDownloadSpeedMbpsAfter: number;
  affectedCellSite: string;
  incidentExposure: 'High' | 'Medium' | 'Low' | 'None';
  homePostcodeImpacted: boolean;
}> = {
  'CUST-001': { networkExperienceScore: 42, droppedCalls14d: 12, failedDataSessions14d: 7, avgDownloadSpeedMbpsBefore: 118, avgDownloadSpeedMbpsAfter: 34, affectedCellSite: 'MAN-M14-073', incidentExposure: 'High', homePostcodeImpacted: true },
  'CUST-002': { networkExperienceScore: 68, droppedCalls14d: 2, failedDataSessions14d: 1, avgDownloadSpeedMbpsBefore: 121, avgDownloadSpeedMbpsAfter: 119, affectedCellSite: 'BIR-B4-021', incidentExposure: 'None', homePostcodeImpacted: false },
  'CUST-003': { networkExperienceScore: 74, droppedCalls14d: 1, failedDataSessions14d: 0, avgDownloadSpeedMbpsBefore: 94, avgDownloadSpeedMbpsAfter: 94, affectedCellSite: 'GLA-G12-009', incidentExposure: 'None', homePostcodeImpacted: false },
  'CUST-004': { networkExperienceScore: 59, droppedCalls14d: 5, failedDataSessions14d: 3, avgDownloadSpeedMbpsBefore: 132, avgDownloadSpeedMbpsAfter: 124, affectedCellSite: 'LDN-E14-117', incidentExposure: 'Low', homePostcodeImpacted: false },
  'CUST-005': { networkExperienceScore: 77, droppedCalls14d: 0, failedDataSessions14d: 1, avgDownloadSpeedMbpsBefore: 88, avgDownloadSpeedMbpsAfter: 88, affectedCellSite: 'LDS-LS2-044', incidentExposure: 'None', homePostcodeImpacted: false },
  'CUST-006': { networkExperienceScore: 71, droppedCalls14d: 1, failedDataSessions14d: 0, avgDownloadSpeedMbpsBefore: 92, avgDownloadSpeedMbpsAfter: 92, affectedCellSite: 'LIV-L1-015', incidentExposure: 'None', homePostcodeImpacted: false },
};
