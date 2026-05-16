export type EventCategory = 'Network' | 'Care' | 'Billing' | 'CDR' | 'Decisioning' | 'Activation';

export interface OpEvent {
  id: string;
  time: string;
  category: EventCategory;
  text: string;
  severity?: 'info' | 'warn' | 'critical' | 'success';
}

export const opEvents: OpEvent[] = [
  { id: 'e1', time: '09:31:02', category: 'Network', severity: 'critical', text: 'Anomaly detected MAN-M14-073 — RSRP -118dBm sustained 90s' },
  { id: 'e2', time: '09:31:12', category: 'Network', severity: 'warn', text: 'Adjacent sites MAN-M14-074..079 trending degraded' },
  { id: 'e3', time: '09:31:48', category: 'CDR', text: 'CDR ingest spike: failed-session count +42% in postcode M14' },
  { id: 'e4', time: '09:32:11', category: 'CDR', text: 'CDR-449281 — dropped session, customer CUST-001' },
  { id: 'e5', time: '09:33:04', category: 'Network', severity: 'critical', text: 'Cell cluster degradation confirmed across 7 sites' },
  { id: 'e6', time: '09:33:30', category: 'Decisioning', text: 'Network impact model triggered: estimated 2,417 affected customers' },
  { id: 'e7', time: '09:34:12', category: 'Care', text: 'Care queue depth +18% in Manchester catchment' },
  { id: 'e8', time: '09:35:00', category: 'Decisioning', severity: 'info', text: 'Churn impact model executed (CHURN_MODEL_UK_MOBILE_V3.2)' },
  { id: 'e9', time: '09:35:40', category: 'Decisioning', text: 'CUST-001 (Amelia Hughes): risk 42% → 82% (+40)' },
  { id: 'e10', time: '09:35:42', category: 'Decisioning', text: 'CUST-002 (Daniel Shah): risk 54% → 76% (+22)' },
  { id: 'e11', time: '09:36:01', category: 'Decisioning', text: 'P1 cohort assembled: 89 customers (high-value × very-high-churn)' },
  { id: 'e12', time: '09:36:18', category: 'Care', text: 'Bill alert sent to 1,204 customers (proactive bill explanation)' },
  { id: 'e13', time: '09:37:00', category: 'Decisioning', text: 'Eligibility checks: consent, margin floor, offer fatigue, open complaint' },
  { id: 'e14', time: '09:37:22', category: 'Decisioning', text: 'CUST-006 (Owen Brennan) suppressed — recent retention offer (12d)' },
  { id: 'e15', time: '09:38:04', category: 'Decisioning', text: 'NBA generated: 89 ranked actions ready' },
  { id: 'e16', time: '09:38:09', category: 'Activation', text: 'Approval workflow initialised: Marketing → Compliance → Legal → Send' },
  { id: 'e17', time: '09:39:15', category: 'CDR', text: 'PAC code requested CUST-009' },
  { id: 'e18', time: '09:40:12', category: 'Care', text: 'Senior care callback queued for CUST-001 (SLA recovery)' },
  { id: 'e19', time: '09:40:48', category: 'Activation', severity: 'success', text: 'Marketing approved Manchester M14 retention campaign' },
  { id: 'e20', time: '09:41:32', category: 'Activation', severity: 'success', text: 'Compliance approved (consent + margin floor)' },
  { id: 'e21', time: '09:42:06', category: 'Activation', text: 'Legal review in progress' },
  { id: 'e22', time: '09:42:20', category: 'Activation', severity: 'success', text: 'Legal approved' },
  { id: 'e23', time: '09:43:00', category: 'Activation', severity: 'success', text: 'SMS outreach sent to 89 customers' },
  { id: 'e24', time: '09:43:11', category: 'Activation', severity: 'success', text: 'Push notifications delivered: 76/89 acknowledged' },
  { id: 'e25', time: '09:44:00', category: 'Network', text: 'RAN team escalation accepted — capacity rebalancing initiated' },
  { id: 'e26', time: '09:45:20', category: 'Network', severity: 'success', text: 'MAN-M14-074 recovered (DL 92 Mbps)' },
  { id: 'e27', time: '09:45:52', category: 'Network', severity: 'success', text: 'MAN-M14-075 recovered (DL 96 Mbps)' },
  { id: 'e28', time: '09:46:18', category: 'Decisioning', severity: 'success', text: 'Risk reduction observed: cohort avg 79% → 47%' },
  { id: 'e29', time: '09:46:45', category: 'Activation', text: 'Service credit £5 queued on next bill for 2,417 affected customers' },
  { id: 'e30', time: '09:47:10', category: 'Network', severity: 'success', text: 'All 7 sites restored — incident moved to Resolved' },
];

export const categoryColor: Record<EventCategory, string> = {
  Network: 'bg-vfRed-soft text-vfRed-dark',
  Care: 'bg-amber/20 text-amber-800',
  Billing: 'bg-blue-100 text-blue-700',
  CDR: 'bg-mist text-ink',
  Decisioning: 'bg-fuchsia-100 text-fuchsia-700',
  Activation: 'bg-emerald-100 text-emerald-700',
};
