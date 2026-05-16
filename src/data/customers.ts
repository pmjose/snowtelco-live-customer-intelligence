export type Brand = 'SnowTelco' | 'SnowTelco Lite' | 'SnowFlex' | 'SnowGo' | 'SnowTalk';
export type ValueSegment = 'High' | 'Medium' | 'Low';
export type SavePriority = 'P1' | 'P2' | 'P3' | 'Suppress';
export type RiskBand = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Customer {
  id: string;
  name: string;
  location: string;
  city: string;
  postcode: string;
  brand: Brand;
  valueSegment: ValueSegment;
  churnRiskBeforeIncident: number;
  churnRiskAfterIncident: number;
  projectedRiskAfterAction: number;
  churnRiskBand: RiskBand;
  contractEndDays: number;
  mainDriver: string;
  networkExperienceScore: number;
  savePriority: SavePriority;
  tenureMonths: number;
  plan: string;
  device: string;
  monthlySpend: number;
  customerLifetimeValue: number;
  renewalWindow: 'Open' | 'Approaching' | 'Future';
  consentStatus: string;
  productHoldings: string[];
  householdLines: number;
  isImpactedByIncident: boolean;
}

export const customers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Amelia Hughes',
    location: 'Manchester M14',
    city: 'Manchester',
    postcode: 'M14',
    brand: 'SnowTelco Lite',
    valueSegment: 'High',
    churnRiskBeforeIncident: 42,
    churnRiskAfterIncident: 82,
    projectedRiskAfterAction: 41,
    churnRiskBand: 'Very High',
    contractEndDays: 21,
    mainDriver: 'Network degradation',
    networkExperienceScore: 42,
    savePriority: 'P1',
    tenureMonths: 44,
    plan: 'Unlimited 5G SIM-only',
    device: 'iPhone 13',
    monthlySpend: 38,
    customerLifetimeValue: 1840,
    renewalWindow: 'Open',
    consentStatus: 'Marketing consent: eligible',
    productHoldings: ['Mobile SIM-only', 'Roaming add-on'],
    householdLines: 2,
    isImpactedByIncident: true,
  },
  {
    id: 'CUST-002',
    name: 'Daniel Shah',
    location: 'Birmingham B4',
    city: 'Birmingham',
    postcode: 'B4',
    brand: 'SnowTelco',
    valueSegment: 'High',
    churnRiskBeforeIncident: 54,
    churnRiskAfterIncident: 76,
    projectedRiskAfterAction: 48,
    churnRiskBand: 'High',
    contractEndDays: 34,
    mainDriver: 'Bill shock',
    networkExperienceScore: 68,
    savePriority: 'P1',
    tenureMonths: 67,
    plan: 'SnowTelco Xtra 100GB',
    device: 'Samsung Galaxy S23',
    monthlySpend: 47,
    customerLifetimeValue: 2210,
    renewalWindow: 'Approaching',
    consentStatus: 'Marketing consent: eligible',
    productHoldings: ['Mobile handset plan', 'SnowTelco Xtra perks'],
    householdLines: 3,
    isImpactedByIncident: false,
  },
  {
    id: 'CUST-003',
    name: 'Sophie McKenzie',
    location: 'Glasgow G12',
    city: 'Glasgow',
    postcode: 'G12',
    brand: 'SnowGo',
    valueSegment: 'Medium',
    churnRiskBeforeIncident: 58,
    churnRiskAfterIncident: 71,
    projectedRiskAfterAction: 52,
    churnRiskBand: 'High',
    contractEndDays: 18,
    mainDriver: 'Competitor offer',
    networkExperienceScore: 74,
    savePriority: 'P2',
    tenureMonths: 22,
    plan: 'SnowGo Endless Social',
    device: 'iPhone 12',
    monthlySpend: 20,
    customerLifetimeValue: 540,
    renewalWindow: 'Open',
    consentStatus: 'Marketing consent: eligible',
    productHoldings: ['SIM-only'],
    householdLines: 1,
    isImpactedByIncident: false,
  },
  {
    id: 'CUST-004',
    name: 'Ravi Patel',
    location: 'London E14',
    city: 'London',
    postcode: 'E14',
    brand: 'SnowTelco',
    valueSegment: 'High',
    churnRiskBeforeIncident: 39,
    churnRiskAfterIncident: 63,
    projectedRiskAfterAction: 37,
    churnRiskBand: 'Medium',
    contractEndDays: 62,
    mainDriver: 'Care dissatisfaction',
    networkExperienceScore: 59,
    savePriority: 'P2',
    tenureMonths: 58,
    plan: 'Unlimited Max 5G',
    device: 'iPhone 15 Pro',
    monthlySpend: 62,
    customerLifetimeValue: 2980,
    renewalWindow: 'Future',
    consentStatus: 'Marketing consent: eligible',
    productHoldings: ['Handset plan', 'Watch plan', 'SnowTelco Pro Broadband'],
    householdLines: 4,
    isImpactedByIncident: false,
  },
  {
    id: 'CUST-005',
    name: 'Grace Williams',
    location: 'Leeds LS2',
    city: 'Leeds',
    postcode: 'LS2',
    brand: 'SnowFlex',
    valueSegment: 'Medium',
    churnRiskBeforeIncident: 44,
    churnRiskAfterIncident: 69,
    projectedRiskAfterAction: 50,
    churnRiskBand: 'High',
    contractEndDays: 9,
    mainDriver: 'Price sensitivity',
    networkExperienceScore: 77,
    savePriority: 'P1',
    tenureMonths: 14,
    plan: 'SnowFlex 30GB Flexible',
    device: 'Pixel 7a',
    monthlySpend: 12,
    customerLifetimeValue: 320,
    renewalWindow: 'Open',
    consentStatus: 'Marketing consent: eligible',
    productHoldings: ['SIM-only flexible'],
    householdLines: 1,
    isImpactedByIncident: false,
  },
  {
    id: 'CUST-006',
    name: 'Owen Brennan',
    location: 'Liverpool L1',
    city: 'Liverpool',
    postcode: 'L1',
    brand: 'SnowTelco Lite',
    valueSegment: 'Medium',
    churnRiskBeforeIncident: 61,
    churnRiskAfterIncident: 64,
    projectedRiskAfterAction: 64,
    churnRiskBand: 'High',
    contractEndDays: 27,
    mainDriver: 'Offer fatigue',
    networkExperienceScore: 71,
    savePriority: 'Suppress',
    tenureMonths: 31,
    plan: 'SnowTelco Lite Advanced 100GB',
    device: 'Samsung A54',
    monthlySpend: 18,
    customerLifetimeValue: 480,
    renewalWindow: 'Approaching',
    consentStatus: 'Suppressed: recent retention offer',
    productHoldings: ['SIM-only'],
    householdLines: 1,
    isImpactedByIncident: false,
  },
];

export const customerById = (id: string) => customers.find((c) => c.id === id) ?? customers[0];

// Resolve a customer's churn driver in the context of an active scenario.
// The active scenario's primary customer keeps a scenario-specific driver
// label; other customers inherit the scenario's collective theme so the list
// reads coherently when running e.g. Leeds (competitor PAC) vs Manchester
// (network degradation).
export function driverFor(customerId: string, scenarioId: string, primaryCustomerId: string): string {
  const themes: Record<string, { primary: string; cohort: string }> = {
    manchester:        { primary: 'Network degradation (Manchester M14)', cohort: 'Network experience' },
    'birmingham-bill': { primary: 'Bill shock (post-Easter roaming)',     cohort: 'Bill-shock exposure' },
    'leeds-snowflex':  { primary: 'Competitor tariff launch',             cohort: 'Price sensitivity' },
    'london-5g':       { primary: '5G upgrade propensity',                cohort: '5G-capable handset' },
  };
  const theme = themes[scenarioId];
  if (!theme) return customerById(customerId).mainDriver;
  return customerId === primaryCustomerId ? theme.primary : theme.cohort;
}
