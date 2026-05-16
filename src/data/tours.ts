// Curated tours: orchestrate a sequence of scenarios with short narrative beats
// between them. Used by /tours page to run a one-click executive demo.

import type { SectionId } from './sectionScenarios';

export interface TourStep {
  scenarioId: string;
  // Optional override of inter-scenario delay (default 6s)
  pauseAfterSec?: number;
}

export interface Tour {
  id: string;
  name: string;
  audience: 'CXO' | 'CTO' | 'CDO/CRO' | 'Full bake-off';
  durationMin: number;
  blurb: string;
  sections: SectionId[];
  steps: TourStep[];
}

export const tours: Tour[] = [
  {
    id: 'cxo-5min',
    name: '5-minute CXO tour',
    audience: 'CXO',
    durationMin: 5,
    blurb: 'Customer save · regulator-grade comms · revenue protection · network restored — in five minutes.',
    sections: ['cic', 'digital', 'bss', 'noc'],
    steps: [
      { scenarioId: 'cic-manchester-churn' },
      { scenarioId: 'dig-outage-comms' },
      { scenarioId: 'bss-fca-consumer-duty' },
      { scenarioId: 'NET-INC-2026-0428-MAN-M14' },
    ],
  },
  {
    id: 'cto-10min',
    name: '10-minute CTO tour',
    audience: 'CTO',
    durationMin: 10,
    blurb: 'Slice activation · digital twin · CAB rollback · roaming partner outage · HSS storm — proof of agentic ops.',
    sections: ['oss', 'noc'],
    steps: [
      { scenarioId: 'oss-slice-activation' },
      { scenarioId: 'oss-digital-twin-prechg' },
      { scenarioId: 'oss-cab-rollback' },
      { scenarioId: 'oss-tmf921-sla' },
      { scenarioId: 'NET-INC-2026-0508-LDN-HSS' },
      { scenarioId: 'NET-INC-2026-0508-ROAMING-VPN-A' },
      { scenarioId: 'NET-INC-2026-0428-MAN-M14' },
      { scenarioId: 'oss-vendor-sla-breach' },
    ],
  },
  {
    id: 'cdo-cro-10min',
    name: '10-minute CDO / CRO tour',
    audience: 'CDO/CRO',
    durationMin: 10,
    blurb: 'Consumer Duty · acquisition fraud · revenue assurance · DSAR surge · cohort-led growth — risk and revenue, on one stage.',
    sections: ['bss', 'cic', 'digital'],
    steps: [
      { scenarioId: 'bss-fca-consumer-duty' },
      { scenarioId: 'bss-acquisition-fraud' },
      { scenarioId: 'bss-revenue-assurance' },
      { scenarioId: 'bss-revenue-leakage' },
      { scenarioId: 'dig-privacy-dsar-surge' },
      { scenarioId: 'cic-vulnerable-proactive' },
      { scenarioId: 'cic-recontract-wave' },
      { scenarioId: 'cic-london-5g-upgrade' },
    ],
  },
  {
    id: 'full-bake-off-20min',
    name: '20-minute full bake-off',
    audience: 'Full bake-off',
    durationMin: 20,
    blurb: 'Fourteen scenarios across CIC, Digital, BSS, OSS and NOC. The whole stack on one stage.',
    sections: ['cic', 'digital', 'bss', 'oss', 'noc'],
    steps: [
      { scenarioId: 'cic-manchester-churn' },
      { scenarioId: 'cic-london-5g-upgrade' },
      { scenarioId: 'cic-999-reachability' },
      { scenarioId: 'dig-outage-comms' },
      { scenarioId: 'dig-care-chat-deflection' },
      { scenarioId: 'dig-identity-sim-swap' },
      { scenarioId: 'bss-fca-consumer-duty' },
      { scenarioId: 'bss-billing-cycle-close' },
      { scenarioId: 'bss-revenue-leakage' },
      { scenarioId: 'oss-slice-activation' },
      { scenarioId: 'oss-digital-twin-prechg' },
      { scenarioId: 'NET-INC-2026-0428-MAN-M14' },
      { scenarioId: 'NET-INC-2026-0508-LDN-HSS' },
      { scenarioId: 'NET-INC-2026-0508-ROAMING-VPN-A' },
    ],
  },
];

export const tourById = (id: string): Tour | undefined => tours.find((t) => t.id === id);
