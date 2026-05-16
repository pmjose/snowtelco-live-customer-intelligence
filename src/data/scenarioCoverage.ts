// Coverage matrix: how strongly each scenario surfaces in each domain,
// and the one-liner that should appear in that domain's InSyncBanner / catalogue card.

export type CoverageLevel = 'full' | 'strong' | 'medium' | 'thin' | 'none';
export type CoverageDomain = 'noc' | 'cic' | 'digital' | 'bss' | 'oss';

export interface CoverageCell {
  level: CoverageLevel;
  note: string;
}

export type CoverageRow = Record<CoverageDomain, CoverageCell>;

// Keyed by NocIncident id
export const scenarioCoverage: Record<string, CoverageRow> = {
  // ── Manchester M14 ───────────────────────────────────────────────────────
  'NET-INC-2026-0428-MAN-M14': {
    noc: { level: 'full', note: 'Primary stage: RAN orchestration with MLB + carrier-add, ServiceNow change.' },
    cic: { level: 'strong', note: '89 P1 churn-risk customers prioritised · Amelia Hughes 360 opened · CHURN_MODEL_UK_MOBILE_V3.2.' },
    digital: { level: 'strong', note: '89 personalised pushes + SMS via Salesforce MC and Sinch; consent + freq-cap honoured.' },
    bss: { level: 'medium', note: '£5 service credit queued via Amdocs CES on next bill for 2,417 customers.' },
    oss: { level: 'thin', note: 'Software-only mitigation — no field dispatch. ServiceNow CHG0012987 awaits PIR.' },
  },
  // ── Liverpool L1 ─────────────────────────────────────────────────────────
  'NET-INC-2026-0508-LIV-L1': {
    noc: { level: 'full', note: 'Single-site thermal — auto-throttle masks 88% of capacity; minimal-disturbance policy.' },
    cic: { level: 'none', note: 'By design: single-cell soft impact, no cohort identified, CLV ~£18.2k protected silently.' },
    digital: { level: 'none', note: 'By design: no push, no SMS — throttle is masking 88% of capacity. Zero customer comms.' },
    bss: { level: 'none', note: 'No bill impact — no service credits issued.' },
    oss: { level: 'strong', note: 'Salesforce Field Service work order live; fan-controller replacement in maintenance window.' },
  },
  // ── Leeds LS2 ────────────────────────────────────────────────────────────
  'NET-INC-2026-0508-LDS-LS2': {
    noc: { level: 'full', note: 'Transport reroute via secondary IPRAN ring after CAB approval; vendor escalation to Openreach.' },
    cic: { level: 'medium', note: '612 customers + 14 P1 churn — ranked for goodwill credit cohort.' },
    digital: { level: 'medium', note: '612 targeted Salesforce MC pushes; Ofcom auto-comp NOT triggered (<2h).' },
    bss: { level: 'medium', note: '£5 goodwill via Amdocs CES queued for 612 customers on next bill.' },
    oss: { level: 'strong', note: 'Openreach P1 ticket open; splice repair team ETA ~3h. PIR draft populated.' },
  },
  // ── London HSS / VoLTE ───────────────────────────────────────────────────
  'NET-INC-2026-0508-LDN-HSS': {
    noc: { level: 'full', note: 'IMS core: Cx flush + P-CSCF rate-limit; CTO duty-officer approval; failover armed.' },
    cic: { level: 'thin', note: 'By design: 1.42M attached subs — proactive comms HELD pending regulator-led messaging.' },
    digital: { level: 'thin', note: 'Salesforce MC bulletin DRAFTED, awaiting sign-off. No push goes out before regulator coordination.' },
    bss: { level: 'thin', note: 'Systemic outage — no individual credits. Bulk policy decision will follow the RCA.' },
    oss: { level: 'strong', note: 'ServiceNow MIM-2026-0508-001; GC A3 999-impact triage; NIS2/NCSC preliminary clock running.' },
  },
  // ── Single SIM-swap ──────────────────────────────────────────────────────
  'SEC-INC-2026-0508-SIMSWAP-CUST-002': {
    noc: { level: 'medium', note: 'Security incident on the agent runtime — same audit trail as network incidents.' },
    cic: { level: 'strong', note: 'Single victim CUST-002 (Daniel Shah); fraud-protection upsell queued post-resolution.' },
    digital: { level: 'strong', note: 'Verified-channel app push + voice on registered MSISDN — never the new device.' },
    bss: { level: 'strong', note: 'Amdocs OMS swap freeze + Amdocs CES outbound payments lock; both reversible.' },
    oss: { level: 'medium', note: 'ServiceNow SecOps SEC-INC-2026-0508-001; forensic preservation enabled (Tri-Secret).' },
  },
  // ── Roaming partner outage ───────────────────────────────────────────────
  'NET-INC-2026-0508-ROAMING-VPN-A': {
    noc: { level: 'full', note: 'Cross-domain orchestration: IPX failover (Cisco ASR 9000), 14-country impact.' },
    cic: { level: 'strong', note: 'NBA for 1,840 high-CLV roamers — proactive £5 credit + 1GB EU Roaming Pass bonus.' },
    digital: { level: 'strong', note: '12,418 personalised pushes via Salesforce MC in en-GB, es-ES, it-IT, el-GR, tr-TR.' },
    bss: { level: 'strong', note: 'Amdocs CES paused billing on 4,820 in-flight roaming sessions before any overage.' },
    oss: { level: 'medium', note: 'ServiceNow vendor escalation + GSMA IR.21 partner desk paged.' },
  },
  // ── Mass SIM-swap ────────────────────────────────────────────────────────
  'SEC-INC-2026-0508-MASS-SIMSWAP': {
    noc: { level: 'medium', note: 'AISQL AI_AGG fraud-pattern correlation; same agent runtime, audit-grade.' },
    cic: { level: 'thin', note: '47 victims identified; fraud-protection upsell drafted for post-resolution outreach (6 months free).' },
    digital: { level: 'strong', note: 'Salesforce Identity postcode-wide MFA step-up — 4,118 customers; verified-channel notify of 47 victims.' },
    bss: { level: 'strong', note: '47 SIM-swap orders frozen in Amdocs OMS; 47 accounts payment-locked in Amdocs CES.' },
    oss: { level: 'strong', note: 'ServiceNow SecOps SEC-INC-2026-0508-002; Workday HR investigation; Cisco SecureX CTI broadcast.' },
  },
  // ── NYK Mains ────────────────────────────────────────────────────────────
  'NET-INC-2026-0508-NYK-MAINS': {
    noc: { level: 'full', note: 'Energy-aware ops: battery-extend profile + generator dispatch; ESG-positive decision logged.' },
    cic: { level: 'thin', note: 'High-CLV cohort protected silently — no escalation, no churn-model trigger.' },
    digital: { level: 'thin', note: 'Low-key informational push to 18 high-CLV residents only — no broadcast comms.' },
    bss: { level: 'none', note: 'Service maintained throughout — zero customer-facing outage, no credits required.' },
    oss: { level: 'strong', note: 'ESG-tagged ServiceNow work order; Salesforce Field Service generator dispatch; battery upgrade queued.' },
  },
};

export const coverageFor = (incidentId: string, domain: CoverageDomain): CoverageCell | null =>
  scenarioCoverage[incidentId]?.[domain] ?? null;

export const coverageRowFor = (incidentId: string): CoverageRow | null =>
  scenarioCoverage[incidentId] ?? null;

export const LEVEL_ORDER: Record<CoverageLevel, number> = {
  none: 0, thin: 1, medium: 2, strong: 3, full: 4,
};

export const LEVEL_LABEL: Record<CoverageLevel, string> = {
  none: 'No surface', thin: 'Thin', medium: 'Medium', strong: 'Strong', full: 'Full',
};

export const LEVEL_COLOR: Record<CoverageLevel, string> = {
  none: '#E5E7EB',
  thin: '#FCA5A5',
  medium: '#F59E0B',
  strong: '#10B981',
  full: '#11567F',
};
