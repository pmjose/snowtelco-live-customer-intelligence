export interface NetworkEvent {
  id: string;
  city: string;
  postcodeArea: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Investigating' | 'Resolved';
  affectedTechnology: string[];
  impactedCustomers: number;
  highValueCustomers: number;
  highChurnRiskCustomers: number;
  cellSitesImpacted: number;
  averageDownloadSpeedBeforeMbps: number;
  averageDownloadSpeedAfterMbps: number;
  droppedCallIncreasePct: number;
  failedDataSessionIncreasePct: number;
  rootCauseHypothesis: string;
  recommendedNetworkAction: string;
  recommendedCareAction: string;
  coordinates: [number, number];
  detectedAt: string;
}

export const primaryIncident: NetworkEvent = {
  id: 'NET-INC-2026-0428-MAN-M14',
  city: 'Manchester',
  postcodeArea: 'M14',
  severity: 'High',
  status: 'Active',
  affectedTechnology: ['4G', '5G'],
  impactedCustomers: 2417,
  highValueCustomers: 312,
  highChurnRiskCustomers: 89,
  cellSitesImpacted: 7,
  averageDownloadSpeedBeforeMbps: 118,
  averageDownloadSpeedAfterMbps: 34,
  droppedCallIncreasePct: 37,
  failedDataSessionIncreasePct: 42,
  rootCauseHypothesis: 'Peak-period demand spike + degraded backhaul on cluster MAN-01: PRB utilisation 96%, BH circuit MAN-01-BH-2 packet loss 4.1%.',
  recommendedNetworkAction: 'MLB intra-cluster (offset −3dB on hot cell) + activate secondary carrier n1; ServiceNow standard change CHG0012987.',
  recommendedCareAction: 'Pre-approved retention playbook PB-RT-CRED-005: proactive apology + £5 service credit + plan refresh for P1 customers.',
  coordinates: [-2.226, 53.451],
  detectedAt: '2026-05-08 09:31',
};

export const secondaryEvents: NetworkEvent[] = [
  {
    id: 'NET-INC-2026-0428-LDN-E14',
    city: 'London',
    postcodeArea: 'E14',
    severity: 'Low',
    status: 'Investigating',
    affectedTechnology: ['5G'],
    impactedCustomers: 412,
    highValueCustomers: 41,
    highChurnRiskCustomers: 9,
    cellSitesImpacted: 2,
    averageDownloadSpeedBeforeMbps: 154,
    averageDownloadSpeedAfterMbps: 121,
    droppedCallIncreasePct: 8,
    failedDataSessionIncreasePct: 11,
    rootCauseHypothesis: 'Localized 5G SA cell capacity at peak hours.',
    recommendedNetworkAction: 'Monitor and rebalance carrier aggregation.',
    recommendedCareAction: 'No proactive contact required.',
    coordinates: [-0.018, 51.505],
    detectedAt: '2026-05-08 08:49',
  },
  {
    id: 'NET-INC-2026-0428-BIR-B4',
    city: 'Birmingham',
    postcodeArea: 'B4',
    severity: 'Low',
    status: 'Resolved',
    affectedTechnology: ['4G'],
    impactedCustomers: 320,
    highValueCustomers: 22,
    highChurnRiskCustomers: 4,
    cellSitesImpacted: 1,
    averageDownloadSpeedBeforeMbps: 84,
    averageDownloadSpeedAfterMbps: 76,
    droppedCallIncreasePct: 4,
    failedDataSessionIncreasePct: 6,
    rootCauseHypothesis: 'Transient backhaul micro-outage; auto-recovered.',
    recommendedNetworkAction: 'Closed.',
    recommendedCareAction: 'None.',
    coordinates: [-1.898, 52.486],
    detectedAt: '2026-05-08 07:11',
  },
];

export const allEvents = [primaryIncident, ...secondaryEvents];
