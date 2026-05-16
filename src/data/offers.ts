export interface Offer {
  rank: number;
  offerName: string;
  actionType: string;
  acceptanceProbability: number;
  marginImpact: 'Low' | 'Medium' | 'High';
  retentionImpact: 'Low' | 'Medium' | 'High';
  expectedRiskReductionPts: number;
  eligibility: 'Eligible' | 'Suppressed' | 'Conditional';
  channel: string;
  rationale: string;
}

export interface NonOfferAction {
  id: string;
  label: string;
  description: string;
  channel: string;
}

export const recommendedHeadline: Record<string, string> = {
  'CUST-001': 'Proactive apology + £5 loyalty credit + network issue update + unlimited 5G retention plan',
  'CUST-002': 'Bill explanation + £4 loyalty credit + roaming pass review + retention upgrade',
  'CUST-003': 'Loyalty SIM-only refresh + 12-month price lock + youth perks bundle',
  'CUST-004': 'Care callback from senior agent + complaint resolution + handset upgrade review',
  'CUST-005': 'Loyalty SnowFlex plan refresh + flexible 30GB price match',
  'CUST-006': 'No commercial action — suppressed (offer fatigue). Resolve open friction first.',
};

export const offersByCustomer: Record<string, Offer[]> = {
  'CUST-001': [
    {
      rank: 1,
      offerName: '5G Unlimited Loyalty Plan + £5 monthly credit for 6 months',
      actionType: 'Retention offer',
      acceptanceProbability: 64,
      marginImpact: 'Medium',
      retentionImpact: 'High',
      expectedRiskReductionPts: 41,
      eligibility: 'Eligible',
      channel: 'Proactive SMS + app notification',
      rationale: 'High-value customer with recent network degradation, renewal window open, and unresolved complaint. Loyalty credit offsets recent service impact while keeping customer on unlimited 5G plan.',
    },
    {
      rank: 2,
      offerName: 'Mobile + Home Broadband bundle review',
      actionType: 'Converged bundle',
      acceptanceProbability: 51,
      marginImpact: 'High',
      retentionImpact: 'Medium',
      expectedRiskReductionPts: 28,
      eligibility: 'Eligible',
      channel: 'Care agent callback',
      rationale: 'Customer has high home data usage and is eligible for converged value review.',
    },
    {
      rank: 3,
      offerName: 'Handset upgrade eligibility check',
      actionType: 'Upgrade',
      acceptanceProbability: 38,
      marginImpact: 'High',
      retentionImpact: 'Medium',
      expectedRiskReductionPts: 19,
      eligibility: 'Eligible',
      channel: 'App journey',
      rationale: 'Device is over 30 months old and customer has high mobile data usage.',
    },
  ],
  'CUST-002': [
    { rank: 1, offerName: 'SnowTelco Xtra renewal + £4 loyalty credit', actionType: 'Retention offer', acceptanceProbability: 58, marginImpact: 'Medium', retentionImpact: 'High', expectedRiskReductionPts: 28, eligibility: 'Eligible', channel: 'Outbound call', rationale: 'High value, bill-shock driver, renewal window approaching. Retention with credit and simplified bill explanation.' },
    { rank: 2, offerName: 'Roaming Pass auto-enrol', actionType: 'Add-on optimisation', acceptanceProbability: 49, marginImpact: 'Low', retentionImpact: 'Medium', expectedRiskReductionPts: 18, eligibility: 'Eligible', channel: 'App notification', rationale: 'Roaming overage caused last bill to spike; pass enrolment removes risk of repeat.' },
    { rank: 3, offerName: 'Family plan migration', actionType: 'Upsell', acceptanceProbability: 31, marginImpact: 'High', retentionImpact: 'Medium', expectedRiskReductionPts: 14, eligibility: 'Eligible', channel: 'Care agent callback', rationale: 'Household has 3 lines; multi-SIM family plan offers better value.' },
  ],
  'CUST-003': [
    { rank: 1, offerName: 'SnowGo Loyalty 12-month price lock', actionType: 'Retention offer', acceptanceProbability: 55, marginImpact: 'Medium', retentionImpact: 'High', expectedRiskReductionPts: 19, eligibility: 'Eligible', channel: 'App notification', rationale: 'Open renewal window with competitor browsing; price lock removes competitive pressure.' },
    { rank: 2, offerName: 'Endless Social bundle expansion', actionType: 'Upsell', acceptanceProbability: 41, marginImpact: 'Low', retentionImpact: 'Medium', expectedRiskReductionPts: 12, eligibility: 'Eligible', channel: 'Push notification', rationale: 'Engagement aligns with social-heavy usage profile.' },
    { rank: 3, offerName: 'Refer-a-friend credit', actionType: 'Engagement', acceptanceProbability: 24, marginImpact: 'Low', retentionImpact: 'Low', expectedRiskReductionPts: 6, eligibility: 'Eligible', channel: 'Email', rationale: 'Relationship-strengthening play; modest risk reduction.' },
  ],
  'CUST-004': [
    { rank: 1, offerName: 'Senior care callback + complaint fast-track', actionType: 'Care recovery', acceptanceProbability: 72, marginImpact: 'Low', retentionImpact: 'High', expectedRiskReductionPts: 26, eligibility: 'Eligible', channel: 'Outbound call', rationale: 'Care dissatisfaction is primary driver; resolving complaint before any commercial offer is required.' },
    { rank: 2, offerName: 'Handset upgrade with loyalty discount', actionType: 'Upgrade', acceptanceProbability: 44, marginImpact: 'High', retentionImpact: 'Medium', expectedRiskReductionPts: 21, eligibility: 'Conditional', channel: 'Care agent callback', rationale: 'Device age 24 months; eligible after care issue is closed.' },
    { rank: 3, offerName: 'SnowTelco Pro Broadband review', actionType: 'Converged bundle', acceptanceProbability: 36, marginImpact: 'High', retentionImpact: 'Medium', expectedRiskReductionPts: 15, eligibility: 'Eligible', channel: 'Email', rationale: 'Existing broadband holder; converged value review.' },
  ],
  'CUST-005': [
    { rank: 1, offerName: 'SnowFlex 30GB price match', actionType: 'Retention offer', acceptanceProbability: 49, marginImpact: 'Low', retentionImpact: 'Medium', expectedRiskReductionPts: 19, eligibility: 'Eligible', channel: 'App notification', rationale: 'PAC observed; price match aligns with price-sensitive driver.' },
    { rank: 2, offerName: 'Flexible add-on credit', actionType: 'Add-on', acceptanceProbability: 38, marginImpact: 'Low', retentionImpact: 'Low', expectedRiskReductionPts: 9, eligibility: 'Eligible', channel: 'SMS', rationale: 'Encourage continued engagement.' },
    { rank: 3, offerName: 'SnowTelco Lite brand cross-sell', actionType: 'Brand migration', acceptanceProbability: 22, marginImpact: 'Medium', retentionImpact: 'Medium', expectedRiskReductionPts: 7, eligibility: 'Conditional', channel: 'Email', rationale: 'Optional path if customer wants more data.' },
  ],
  'CUST-006': [
    { rank: 1, offerName: 'No offer — suppressed', actionType: 'Suppression', acceptanceProbability: 0, marginImpact: 'Low', retentionImpact: 'Low', expectedRiskReductionPts: 0, eligibility: 'Suppressed', channel: '—', rationale: 'Customer received a retention offer within the last 14 days. Re-engage only after suppression window or if friction is detected.' },
  ],
};

export const nonOfferActions: NonOfferAction[] = [
  { id: 'apology', label: 'Proactive apology message', description: 'Acknowledge the network impact in customer’s home postcode.', channel: 'SMS + app' },
  { id: 'network_update', label: 'Network issue update', description: 'Share fix ETA and a transparency message.', channel: 'App in-product' },
  { id: 'service_credit', label: 'Service credit', description: 'Apply £5 service credit to next bill for affected day.', channel: 'Auto on bill' },
  { id: 'data_boost', label: 'Temporary data boost', description: 'Free 10GB data boost during incident period.', channel: 'Auto-applied' },
  { id: 'complaint_escalation', label: 'Complaint escalation', description: 'Escalate open complaint to senior care for SLA recovery.', channel: 'Care queue' },
  { id: 'network_ticket', label: 'Network ticket escalation', description: 'Open incident ticket against affected cell sites with priority.', channel: 'NOC' },
  { id: 'callback', label: 'Care callback', description: 'Schedule a senior care agent callback within 4 hours.', channel: 'Outbound call' },
];
