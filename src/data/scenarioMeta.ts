// Derived scenario metadata: ROI numbers, regulatory standards, Snowflake primitives.
// We compute these from each scenario's existing event text + a small overrides map for hero scenarios.
// Result: every scenario shows ROI strip + chips with zero per-scenario hand-typing.

import type { SectionScenario, SectionId } from './sectionScenarios';

export interface ScenarioMeta {
  roi: { hoursSaved: number; gbpProtected: number; customersProtected: number };
  standards: string[];
  snowflakePrimitives: string[];
}

// ── Standards detection (regex over title + subtitle + event text) ──────────
const STANDARDS_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bTMF\s*620\b/i, label: 'TMF 620' },
  { re: /\bTMF\s*622\b/i, label: 'TMF 622' },
  { re: /\bTMF\s*638\b/i, label: 'TMF 638' },
  { re: /\bTMF\s*641\b/i, label: 'TMF 641' },
  { re: /\bTMF\s*645\b/i, label: 'TMF 645' },
  { re: /\bTMF\s*648\b/i, label: 'TMF 648' },
  { re: /\bTMF\s*678\b/i, label: 'TMF 678' },
  { re: /\bTMF\s*681\b/i, label: 'TMF 681' },
  { re: /\bTMF\s*921\b/i, label: 'TMF 921' },
  { re: /\b3GPP\s*TS\s*28\.531\b/i, label: '3GPP TS 28.531' },
  { re: /\b3GPP\b/i, label: '3GPP' },
  { re: /\bETSI\s*NFV[- ]?MANO\b/i, label: 'ETSI NFV-MANO' },
  { re: /\bGSMA\s*TS\.32\b/i, label: 'GSMA TS.32' },
  { re: /\bIR\.21\b/i, label: 'GSMA IR.21' },
  { re: /\bTAP3\b/i, label: 'GSMA TAP3' },
  { re: /\bOfcom\s*GC\s*A3\b/i, label: 'Ofcom GC A3' },
  { re: /\bOfcom\s*GC\s*C1\b/i, label: 'Ofcom GC C1' },
  { re: /\bOfcom\s*GC\s*C5\b/i, label: 'Ofcom GC C5' },
  { re: /\bOfcom\s*GC\s*C7\b/i, label: 'Ofcom GC C7' },
  { re: /\bConsumer\s*Duty|FCA\b/i, label: 'FCA Consumer Duty' },
  { re: /\bGDPR(\s*Art\.?\s*\d+)?\b/i, label: 'GDPR' },
  { re: /\bICO\b/i, label: 'ICO' },
  { re: /\bNIS2|NCSC\b/i, label: 'NIS2' },
  { re: /\bICNIRP|EMF\b/i, label: 'ICNIRP' },
  { re: /\bIPA\b|Lawful\s*Intercept/i, label: 'IPA / LI' },
  { re: /\bOnline\s*Safety\s*Act\b/i, label: 'Online Safety Act' },
  { re: /\bPSD2|SCA\b/i, label: 'PSD2' },
  { re: /\bIFRS\s*15\b/i, label: 'IFRS 15' },
  { re: /\bIFRS\s*9\b/i, label: 'IFRS 9' },
  { re: /\bMaking\s*Tax\s*Digital|MTD\b/i, label: 'HMRC MTD' },
  { re: /\bWelsh\s*Language\b/i, label: 'Welsh Language' },
  { re: /\bMEF\s*3\.0\b/i, label: 'MEF 3.0' },
  { re: /\bTCF\s*2\.2\b/i, label: 'IAB TCF 2.2' },
];

// ── Snowflake primitive detection ───────────────────────────────────────────
const SNOWFLAKE_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bCortex\s*Search\b/i, label: 'Cortex Search' },
  { re: /\bCortex\s*Analyst\b/i, label: 'Cortex Analyst' },
  { re: /\bCortex\s*Complete\b/i, label: 'Cortex Complete' },
  { re: /\bCortex\s*Agent\b/i, label: 'Cortex Agent' },
  { re: /\bAI_(?:CLASSIFY|SUMMARIZE|FILTER|EXTRACT|AGG|EMBED|SENTIMENT|TRANSLATE|REDACT)\b|AISQL\b/i, label: 'Cortex AISQL' },
  { re: /\bSnowpark\s*ML\b/i, label: 'Snowpark ML' },
  { re: /\b(?:ML\s*)?Registry\b|Model\s*Registry/i, label: 'ML Registry' },
  { re: /\bSPCS\b|Snowpark\s*Container\s*Services/i, label: 'SPCS' },
  { re: /\bSnowpipe\s*Streaming\b/i, label: 'Snowpipe Streaming' },
  { re: /\bDynamic\s*Tables?\b/i, label: 'Dynamic Tables' },
  { re: /\bTime\s*Travel\b/i, label: 'Time Travel' },
  { re: /\bHorizon\s*(?:Catalog)?\b/i, label: 'Horizon Catalog' },
  { re: /\bTri[- ]?Secret(?:\s*Secure)?\b/i, label: 'Tri-Secret Secure' },
  { re: /\bStreams?\s*(?:and|\+)\s*Tasks?\b|\bTasks?\b/i, label: 'Streams + Tasks' },
];

const detect = (re: RegExp, hay: string) => re.test(hay);

const collectStandards = (hay: string): string[] => {
  const out: string[] = [];
  for (const { re, label } of STANDARDS_PATTERNS) if (detect(re, hay) && !out.includes(label)) out.push(label);
  return out;
};

const collectSnowflake = (hay: string): string[] => {
  const out: string[] = [];
  for (const { re, label } of SNOWFLAKE_PATTERNS) if (detect(re, hay) && !out.includes(label)) out.push(label);
  return out;
};

// ── ROI heuristics by section ───────────────────────────────────────────────
// Mining cohort/customer numbers from text where possible.
const findFirst = (re: RegExp, hay: string): number | null => {
  const m = hay.match(re);
  if (!m) return null;
  const raw = m[1].replace(/[,_]/g, '');
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return null;
  if (/m\b/i.test(m[0])) return num * 1_000_000;
  if (/k\b/i.test(m[0])) return num * 1_000;
  return num;
};

const cohortNumber = (hay: string): number | null =>
  findFirst(/(\d[\d,]*\.?\d*)\s*(?:customers|subs|subscribers|users|cohort|impacted|affected|enrolled|reached|contacted)/i, hay) ??
  findFirst(/(\d[\d,]*\.?\d*)\s*(?:k|m)\b/i, hay);

const gbpNumber = (hay: string): number | null => {
  const m = hay.match(/£\s*(\d[\d,]*\.?\d*)\s*(k|m|bn)?\b/i);
  if (!m) return null;
  const raw = parseFloat(m[1].replace(/,/g, ''));
  if (!m[2]) return raw;
  if (m[2].toLowerCase() === 'k') return raw * 1_000;
  if (m[2].toLowerCase() === 'm') return raw * 1_000_000;
  return raw * 1_000_000_000;
};

// Section-tied ROI baselines so every scenario has a sensible default.
const SECTION_DEFAULTS: Record<SectionId, ScenarioMeta['roi']> = {
  cic:     { hoursSaved:  12, gbpProtected:  150_000, customersProtected:  1_400 },
  digital: { hoursSaved:   8, gbpProtected:   90_000, customersProtected:  4_000 },
  bss:     { hoursSaved:  18, gbpProtected:  420_000, customersProtected:  6_500 },
  oss:     { hoursSaved:  24, gbpProtected:  680_000, customersProtected: 12_000 },
  noc:     { hoursSaved:  40, gbpProtected: 1_200_000, customersProtected: 38_000 },
};

// Hero overrides — scenarios we want pixel-perfect numbers on.
const OVERRIDES: Record<string, Partial<ScenarioMeta>> = {
  'cic-manchester-churn': { roi: { hoursSaved: 6, gbpProtected: 420_000, customersProtected: 2_417 } },
  'cic-london-5g-upgrade': { roi: { hoursSaved: 16, gbpProtected: 180_000, customersProtected: 12_400 } },
  'cic-birmingham-billshock': { roi: { hoursSaved: 9, gbpProtected: 180_000, customersProtected: 1_840 } },
  'cic-leeds-snowflex': { roi: { hoursSaved: 7, gbpProtected: 94_000, customersProtected: 940 } },
  'dig-outage-comms': { roi: { hoursSaved: 4, gbpProtected: 240_000, customersProtected: 184_000 } },
  'dig-care-chat-deflection': { roi: { hoursSaved: 14, gbpProtected: 86_000, customersProtected: 6_200 } },
  'bss-fca-consumer-duty': { roi: { hoursSaved: 32, gbpProtected: 950_000, customersProtected: 4_820 } },
  'bss-billing-cycle-close': { roi: { hoursSaved: 24, gbpProtected: 1_400_000, customersProtected: 2_100_000 } },
  'oss-slice-activation': { roi: { hoursSaved: 36, gbpProtected: 720_000, customersProtected: 280 } },
  'oss-digital-twin-prechg': { roi: { hoursSaved: 28, gbpProtected: 1_800_000, customersProtected: 220_000 } },
  'oss-cab-rollback': { roi: { hoursSaved: 18, gbpProtected: 540_000, customersProtected: 89_000 } },
  'oss-tmf921-sla': { roi: { hoursSaved: 22, gbpProtected: 380_000, customersProtected: 14 } },
  'NET-INC-2026-0428-MAN-M14': { roi: { hoursSaved: 47, gbpProtected: 1_240_000, customersProtected: 2_417 } },
  'NET-INC-2026-0508-LDN-HSS': { roi: { hoursSaved: 92, gbpProtected: 4_600_000, customersProtected: 1_420_000 } },
};

// Public API: compute meta for a scenario.
export function getScenarioMeta(s: SectionScenario): ScenarioMeta {
  const hay = [s.title, s.subtitle, ...s.events.map((e) => e.text ?? '')].join(' \n ');
  const standards = collectStandards(hay);
  const snowflakePrimitives = collectSnowflake(hay);
  if (snowflakePrimitives.length === 0) snowflakePrimitives.push('Cortex Analyst');
  // ROI: try to mine, else section defaults
  const def = SECTION_DEFAULTS[s.sectionId];
  const minedCohort = cohortNumber(hay);
  const minedGbp = gbpNumber(hay);
  const roi: ScenarioMeta['roi'] = {
    hoursSaved: def.hoursSaved,
    gbpProtected: minedGbp ? Math.max(minedGbp, def.gbpProtected / 4) : def.gbpProtected,
    customersProtected: minedCohort ? Math.round(minedCohort) : def.customersProtected,
  };
  const ov = OVERRIDES[s.id];
  return {
    roi: ov?.roi ?? roi,
    standards: ov?.standards ?? standards,
    snowflakePrimitives: ov?.snowflakePrimitives ?? snowflakePrimitives,
  };
}

// Pretty formatters
export const fmtGbp = (n: number): string => {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`;
  if (n >= 1_000) return `£${Math.round(n / 1_000)}k`;
  return `£${n}`;
};

export const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

export const fmtHours = (n: number): string => `${n}h`;
