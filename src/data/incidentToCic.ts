import type { ScenarioId } from './scenarios';

// Mapping from agentic-incident id → CIC scenario id (when there's a sensible
// customer narrative match). Incidents not in the map have no single-customer
// focus and CIC pages show a fallback banner.
export const INCIDENT_TO_CIC: Record<string, ScenarioId | undefined> = {
  // Legacy NOC incident ids
  'NET-INC-2026-0428-MAN-M14': 'manchester',
  'SEC-INC-2026-0508-SIMSWAP-CUST-002': 'birmingham-bill',
  'NET-INC-2026-0508-LDS-LS2': 'leeds-snowflex',
  'NET-INC-2026-0508-LDN-HSS': 'london-5g',
  // No mapping for: LIV-L1, ROAMING-VPN-A, MASS-SIMSWAP, NYK-MAINS

  // New per-section CIC scenario ids
  'cic-manchester-churn': 'manchester',
  'cic-birmingham-billshock': 'birmingham-bill',
  'cic-leeds-snowflex': 'leeds-snowflex',
  'cic-london-5g-upgrade': 'london-5g',
};

export const cicForIncident = (incidentId: string): ScenarioId | undefined =>
  INCIDENT_TO_CIC[incidentId];

export const incidentHasCicFocus = (incidentId: string): boolean =>
  !!INCIDENT_TO_CIC[incidentId] || incidentId.startsWith('cic-');
