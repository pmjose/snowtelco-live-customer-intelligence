// Per-scenario Q&A cheat sheet. Synthesised from section defaults + regex
// against the scenario events. Not exhaustive — designed to give a presenter
// 5 anticipated questions + 1-line answers per scenario.

import type { SectionScenario } from './sectionScenarios';

export interface QA {
  q: string;
  a: string;
}

const SECTION_QA: Record<string, QA[]> = {
  cic: [
    { q: 'How is consent verified before the agent reaches out?', a: 'Consent + frequency caps are checked at the decisioning layer (gold.consent_state) before any channel fires; vulnerable flags suppress commercial offers under Ofcom GC C5 / GDPR Art.6.' },
    { q: "What's the override rate today?", a: 'Override rate ≈ 0.8% — auto-decide band kicks in above 0.85 confidence and an explainability score above 80%. GDPR Art.22 human-override is one click in the agent desktop.' },
    { q: 'Where does CLV come from?', a: 'CLV is computed nightly in gold.customer_clv_v3 via Snowpark ML on 24 months of charging + tenure + complaint signals; it is the single source of truth for ranking and suppression.' },
    { q: 'How do you avoid contact fatigue?', a: 'Identity-graph stitching (gold.identity_resolved) collapses cross-channel touches; the NBA layer applies a 7-day cap and a per-customer treatment ladder.' },
    { q: 'Is every automated decision auditable?', a: 'Yes — gold.decision_lineage logs model version, features, confidence, channel and outcome. Time Travel preserves point-in-time state for regulator replay.' },
  ],
  digital: [
    { q: 'How fast does the journey complete end-to-end?', a: 'Median P50 < 3 min for the top journeys (eSIM activation, web checkout, in-app upgrade) thanks to Cortex Search + SPCS-hosted decisioning APIs.' },
    { q: "What's the channel-suppression rule?", a: 'Suppression is policy-driven: vulnerability flag → no commercial; consent absent → no marketing; frequency cap → 1 commercial / 7 days; brand-safety → no comms during NOC P1.' },
    { q: 'Is MMM consented and post-ICO compliant?', a: 'Yes — MMM uses consented identity sources only (TCF 2.2 + UK ICO 2024 guidance); attribution model retrained quarterly with consent-rate inputs.' },
    { q: 'Where is the experimentation engine?', a: 'Bayesian engine on Snowpark; ROPE-excluded threshold gates ramps; CFO sign-off auto-attached for any margin-impacting test.' },
    { q: 'How is the 38-second Welsh-language variant generated?', a: 'Cortex Complete with a Welsh prompt template + glossary; output is human-reviewed only when the regulatory class requires it.' },
  ],
  bss: [
    { q: 'Where do refunds and credits actually post?', a: 'gold.dispute_credits, gold.bill_adjustments, gold.partner_settlements — each with a Streams + Tasks pipeline that posts to SAP S/4 GL within the same period.' },
    { q: 'Which TMF model does this map to?', a: 'TMF 620 (catalog), 622 (ordering), 638 (service inventory), 641 (service activation), 678 (product spec), 681 (party), 921 (SLA) — selected per scenario.' },
    { q: 'What is the IFRS 9 / 15 treatment?', a: 'IFRS 9 ECL stage 1/2/3 movement is computed nightly; IFRS 15 obligations recognised against contract terms. Auditor-ready evidence pack auto-generated.' },
    { q: 'How does mediation handle schema drift?', a: 'Suspense queue catches mismatches; auto-replay after schema patch; SLA preserved. Drift signature is a Cortex Search hit against vendor TSBs.' },
    { q: 'Is this Consumer Duty compliant?', a: 'Yes — FCA Consumer Duty (Jul-2023) foreseeable-harm sweep runs across vulnerable + financially-stressed cohorts; board-level evidence pack auto-generated.' },
  ],
  oss: [
    { q: 'Which CHG class and who approves?', a: 'STANDARD (pre-approved playbook, no manual CAB) for repeatable changes; NORMAL (CAB-classified, manual approval) for net-new; EMERGENCY (ECAB) for incidents.' },
    { q: "What's the Time Travel scope here?", a: 'Snowflake Time Travel restores the config-publication table only; the network device picks up the rollback record on its next sync (typically 60s for ENM).' },
    { q: 'How is digital twin used pre-CHG?', a: 'twin_simulator_v1 runs the planned change against the topology twin; predicted blast-radius gates the change to a redesign or to a maintenance window.' },
    { q: 'How do you avoid SLA-credit blow-outs?', a: 'TMF 921 SLA dashboard with slo_burnrate_v2 — predicts breaches 14–30 days out; pre-emptive remediation prevents the credit before it accrues.' },
    { q: 'How are vendor scorecards updated?', a: 'gold.vendor_scorecard auto-debits per the MSA tier (customer-impacting / non-impacting / advisory); penalty posts to gold.partner_settlements in the same period.' },
  ],
  noc: [
    { q: "What's the MTTR before vs after?", a: 'Manual MTTR baseline 35–47 min depending on scenario; agent-orchestrated MTTR 4–8 min. Closure (PIR + sign-off) within 30 min for Ofcom GC A3 reporting.' },
    { q: 'How many customers were impacted?', a: 'Surfaced from gold.customer_impact (subs presenting at affected cells × time-on-network); the agent ranks by CLV and vulnerability for proactive outreach.' },
    { q: 'Who got the auto-comp?', a: 'Ofcom auto-comp is evaluated per GC C7 thresholds; credits queued in the next bill cycle in BSS, posted to gold.dispute_credits with full evidence pack.' },
    { q: 'What is the agent NOT allowed to do?', a: 'No autonomous EMERGENCY change without ECAB; no customer comms without IC approval; no policy override without HITL; no PII export across regions.' },
    { q: 'How is the PIR generated?', a: 'Cortex Complete drafts the PIR (what-changed · who-acted · what-broke · what-next) within 4 min; evidence pack is regulator-ready and auto-attached to the Ofcom record.' },
  ],
};

// Light token substitution for scenario-specific colour
function tokenise(answer: string, scenario: SectionScenario): string {
  // Try to surface a named city/vendor if present in the title
  const cityMatch = scenario.title.match(/(London|Manchester|Liverpool|Birmingham|Leeds|Glasgow|Bristol|Edinburgh|Cardiff|Belfast)/i);
  const vendorMatch = scenario.title.match(/(Lloyds|Barclays|NHS|TfL|Ericsson|Nokia|Netcracker|Openreach|BT|Vodafone)/i);
  let out = answer;
  if (cityMatch) out = out.replace(/{{city}}/g, cityMatch[1]);
  if (vendorMatch) out = out.replace(/{{vendor}}/g, vendorMatch[1]);
  return out;
}

export function getCheatsheet(scenario: SectionScenario): QA[] {
  const base = SECTION_QA[scenario.sectionId] ?? [];
  return base.map((qa) => ({ q: qa.q, a: tokenise(qa.a, scenario) }));
}

// For NOC incidents, a section-noc cheatsheet is sufficient since NOC incidents
// already have hand-authored presenter scripts.
export function getCheatsheetForNoc(): QA[] {
  return SECTION_QA.noc;
}
