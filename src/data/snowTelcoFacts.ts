export interface VfFact {
  id: string;
  value: string;
  label: string;
  context?: string;
}

export const snowTelcoFacts: VfFact[] = [
  { id: 'customers', value: '~29M', label: 'UK customers', context: "UK's largest mobile operator" },
  { id: 'investment', value: '£11bn', label: 'Network investment', context: 'Committed UK investment programme' },
  { id: 'fivegsa-2030', value: '99%', label: '5G SA by 2030', context: 'Population coverage target' },
  { id: 'fivegsa-2034', value: '99.96%', label: '5G SA by 2034', context: 'Population coverage target' },
  { id: 'notspots', value: '16,500 km²', label: '4G not-spots removed', context: 'Coverage uplift programme' },
  { id: 'sites-y1', value: '8,000', label: 'Sites in year-one', context: 'Network integration plan' },
];

export const networkSharingScale = '28.6M SnowTelco & SnowTelco Lite mobile customers across the shared network';

export const speedUplift = {
  customers: '7M SnowTelco Lite & SnowFlex customers',
  upliftPct: 'up to 20%',
  metric: '4G data speed improvement',
};

export const yearOneReach = {
  people: '~50M people',
  pct: '71% of UK population',
  description: 'access to fastest 5G speeds within year one',
};

export const networkIntegration = {
  initialSites: '600+ sites initially enabled for automatic network access',
  yearOneTarget: '8,000 sites targeted by end of year one',
};

export const brands = [
  { id: 'snowtelco', name: 'SnowTelco', tagline: 'Premium consumer & business' },
  { id: 'snowtelco-lite', name: 'SnowTelco Lite', tagline: 'Value & data-rich plans' },
  { id: 'snowflex', name: 'SnowFlex', tagline: 'Flexible SIM-only' },
  { id: 'snowgo', name: 'SnowGo', tagline: 'Youth segment' },
  { id: 'snowtalk', name: 'SnowTalk', tagline: 'Affordable mobile' },
];

export const orgPositioning = {
  name: 'SnowTelco',
  formedFrom: 'Snowflake-native customer & network intelligence',
  mission: 'Build the UK’s best network and deliver the best customer experience.',
};
