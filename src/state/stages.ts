export type Stage =
  | 'normal'
  | 'incident_detected'
  | 'customers_impacted'
  | 'churn_scored'
  | 'customer_selected'
  | 'offer_generated'
  | 'outreach_triggered'
  | 'risk_reduced';

export const stageOrder: Stage[] = [
  'normal',
  'incident_detected',
  'customers_impacted',
  'churn_scored',
  'customer_selected',
  'offer_generated',
  'outreach_triggered',
  'risk_reduced',
];

export const stageLabel: Record<Stage, string> = {
  normal: 'Normal Operations',
  incident_detected: 'Incident Detected',
  customers_impacted: 'Customers Impacted',
  churn_scored: 'Churn Scored',
  customer_selected: 'Customer Selected',
  offer_generated: 'Offer Generated',
  outreach_triggered: 'Outreach Triggered',
  risk_reduced: 'Risk Reduced',
};

export const stageOrderIndex = (s: Stage) => stageOrder.indexOf(s);
export const stageReached = (current: Stage, target: Stage) => stageOrderIndex(current) >= stageOrderIndex(target);
