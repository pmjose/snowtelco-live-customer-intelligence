// Presenter teleprompter beats for each NOC scenario.
// Keyed by incidentId. Each script has:
// - intro: shown when scenario starts (T+0 → T+6s)
// - beatsByStage: line keyed by NocStage as the agent advances
// - domainNotes: line shown when the user switches to a given domain mid-run
// - closing: shown after `resolve` event fires

export type NocStageKey = 'idle' | 'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved';
export type DomainKey = 'cic' | 'digital' | 'bss' | 'oss' | 'noc';

export interface PresenterScript {
  intro: string;
  beatsByStage: Partial<Record<NocStageKey, string>>;
  domainNotes: Partial<Record<DomainKey, string>>;
  closing: string;
}

export const presenterScripts: Record<string, PresenterScript> = {
  // ── Manchester M14 — RAN cluster congestion ───────────────────────────────
  'NET-INC-2026-0428-MAN-M14': {
    intro:
      'Manchester M14 cluster — peak-hour PRB congestion. The agent has spotted the spike from Snowpipe Streaming RAN counters. Watch how it gets from "alarm" to "service restored" in under eight minutes.',
    beatsByStage: {
      detect: 'PRB utilisation 96% sustained over 90 seconds. The agent is correlating cell counters, scheduler delay and GTP-U N3 drops — these are not three alarms, this is one event.',
      observe: 'Cortex Search just retrieved four prior runbooks for this cluster. The agent is also pulling network-impact: 2,417 customers are presenting at the affected cells right now.',
      hypothesize: 'Hypothesis at 88% confidence — peak-period demand on a cluster with degraded backhaul. Same pattern as April, July, November and February.',
      plan: 'Two RAN actions, one ITSM, one Care. Each one comes with a simulation: MLB offset −3 dB, +61 Mbps DL; secondary carrier n1, +35% capacity. Eligibility checks happen before the playbook fires.',
      act: 'MLB offset and carrier-add applied via Ericsson ENM. ServiceNow change CHG0012987 opened with the full evidence pack. Salesforce Service Cloud is queueing 89 personalised credits for high-CLV customers.',
      verify: 'Five-minute watch window — KPIs back inside 80% of baseline, no auto-rollback. The agent is now drafting the executive briefing.',
      resolved: 'Service restored — MTTR-mitigation 7 m 24 s. Zero SLA breaches. CHG0012987 awaiting post-implementation review.',
    },
    domainNotes: {
      noc: 'You are on NOC — the agent orchestrator. Every stage runs here.',
      cic: 'CIC view: 89 high-CLV customers identified by CHURN_MODEL_UK_MOBILE_V3.2. Each one has been ranked and a tailored apology + £5 credit + plan refresh is queued.',
      digital: 'Digital view: 89 push notifications + SMS scheduled via Salesforce Marketing Cloud and Sinch. Consent and frequency caps were checked before the agent fired.',
      bss: 'BSS view: £5 service credit queued in Amdocs CES on the next bill for 2,417 affected customers. Ofcom auto-comp evaluated.',
      oss: 'OSS view: ServiceNow change CHG0012987 with the full agent evidence pack. Field-force not dispatched — this is software-only.',
    },
    closing: 'Important: 47 minutes manual MTTR became 7 minutes with the agent — and the audit trail is regulator-ready end-to-end.',
  },

  // ── Liverpool L1 — gNB thermal ─────────────────────────────────────────────
  'NET-INC-2026-0508-LIV-L1': {
    intro: 'Liverpool — single-site thermal alarm on an Ericsson Radio 4480. Notice: not every incident is huge. Most are small, and the right answer is "do less, faster".',
    beatsByStage: {
      detect: 'Board temperature 78 °C. EnergyController has already auto-throttled to 70% PRB cap — 88% of the capacity is preserved.',
      observe: 'The agent has matched three prior incidents on the same gNB. All resolved by fan-controller auto-recovery per Ericsson TSB-2024-117.',
      hypothesize: 'Hypothesis at 94% confidence — intermittent fan-controller, same signature as before.',
      plan: 'No customer comms. Hold the throttle, dispatch a Salesforce Field Service technician, queue a maintenance-window restart.',
      act: 'Field-tech ETA 45 minutes. Maintenance window 02:00–03:00 booked in Netcracker. The fan-controller has just auto-recovered on cycle 6 of 6 — exactly as the TSB predicts.',
      verify: 'Throttle released in 10% steps. Downlink back to 128 Mbps. Incident stays open until the field-tech signs off the hardware.',
      resolved: 'MTTR-mitigation 4 m 12 s. MTTR-closure pending the field-tech. Zero customer comms — the right action was no action.',
    },
    domainNotes: {
      noc: 'NOC view: a calm scenario. The agent\'s value here is in deciding NOT to fire customer comms.',
      cic: 'CIC view: nothing surfaced. CLV protected at ~£18.2k.',
      digital: 'Digital view: no push, no SMS — by design. Throttle is masking 88% of capacity.',
      bss: 'BSS view: no credits. No bill impact.',
      oss: 'OSS view: Salesforce Field Service work order live. The technician has the asset, the symptom and the TSB on their tablet.',
    },
    closing: 'The agent\'s policy is "minimum customer disturbance". Single-site soft impact = no broadcast.',
  },

  // ── Leeds LS2 — IPRAN transport ───────────────────────────────────────────
  'NET-INC-2026-0508-LDS-LS2': {
    intro: 'Leeds LS2 — transport ring fault on a Juniper MX204. This one needs vendor escalation and a CAB approval — watch the human-in-the-loop step.',
    beatsByStage: {
      detect: 'BFD session down, OSPF flapping on the Openreach span between PE-LDS-2 and PE-LDS-3. Three sites affected.',
      observe: 'No high-confidence historical match. The agent ran a Cortex Analyst text-to-SQL: 14 LSPs on this ring, 11 carrying customer-facing services.',
      hypothesize: 'Openreach fibre fault localised by OTDR self-test — 3.2 km from PE-LDS-2. 84% confidence.',
      plan: 'Reroute via secondary ring LS-RING-3. Latency goes up 18 ms, no SLA breach. But this is a T2 change on shared transport — needs a human approval.',
      act: 'NOC engineer and transport-CAB delegate approved at 16:39. Junos commit-confirmed. Openreach P1 ticket opened in ServiceNow.',
      verify: 'BFD up, OSPF converged, RSVP-TE LSPs signalled on the new path. One SLA breach in 39 cells (data > 30 min).',
      resolved: 'Restored on secondary path in 11 m 36 s. Closure depends on Openreach\'s splice repair (~3 h). Vendor RCA mandatory.',
    },
    domainNotes: {
      noc: 'NOC view: an example where the agent stops and asks for a human.',
      cic: 'CIC view: 612 customers including 14 P1 churn risks; the agent ranked them for a goodwill credit.',
      digital: 'Digital view: 612 targeted Salesforce MC pushes — Ofcom auto-compensation thresholds NOT triggered (under 2 hours).',
      bss: 'BSS view: £5 goodwill via Amdocs CES on next bill for 612 customers. Plus the e-bonded ServiceNow ticket on the Openreach side.',
      oss: 'OSS view: Openreach work order live. Splice repair team dispatched, ETA three hours.',
    },
    closing: 'When the model is uncertain — 84% — the agent writes the change request and waits for a human. Auditable by design.',
  },

  // ── London HSS / VoLTE ────────────────────────────────────────────────────
  'NET-INC-2026-0508-LDN-HSS': {
    intro: 'London — IMS core. This is the highest-impact failure mode in mobile telco: a VoLTE registration storm hitting 1.42 million subscribers.',
    beatsByStage: {
      detect: 'Mavenir P-CSCF reg failure rate 12% — baseline is 0.4%. Oracle USPL HSS Cx Diameter peer is flapping. SRVCC handovers up 220%.',
      observe: '142 alarms in 18 seconds. Empirix probe shows MOS dropping from 4.2 to 2.9. Salesforce Service Cloud queue is up 340% in 90 seconds. Twitter is starting to trend.',
      hypothesize: 'Stale Cx sessions on Oracle USPL HSS after a Mavenir S-CSCF re-anchor that followed an MME failover at 09:24. 91% confidence.',
      plan: 'Flush idle Cx sessions, rate-limit P-CSCF re-reg, fail over to LDN-PCSCF-02 if not recovered in 90 seconds. T2 emergency change — the CTO duty-officer is on the pager.',
      act: 'Approval received at 16:28. Cx flush cleared 624,118 stale sessions. Mavenir P-CSCF rate-limit applied. ServiceNow major incident MIM-2026-0508-001. GC A3 999-impact triage opened, NIS2/NCSC clock running.',
      verify: 'IMS reg failures 12% → 5.8% → 1.4%. SRVCC HO success back at 99.1%. MOS recovered to 4.0 median. Ten-minute extended watch window on IMS.',
      resolved: 'Service restored, 9 m 48 s. NIS2/NCSC notifiable event filed (≥1 M users). RCA pending Oracle and Mavenir advisories.',
    },
    domainNotes: {
      noc: 'NOC view: the agent\'s job is to recommend, not to commit. The CTO duty-officer approved.',
      cic: 'CIC view: comms are held. The regulator-led messaging will lead.',
      digital: 'Digital view: bulletin drafted in Salesforce MC, awaiting sign-off. No push goes out before regulator coordination.',
      bss: 'BSS view: no individual credits. This is a systemic outage; bulk policy will follow the RCA.',
      oss: 'OSS view: Major incident MIM-2026-0508-001. NIS2 preliminary notification ready to send to NCSC.',
    },
    closing: 'The point of the agent here is not to act faster than the engineer — it is to present the evidence, the simulation and the audit trail in one place so the human can decide.',
  },

  // ── Single SIM-swap ───────────────────────────────────────────────────────
  'SEC-INC-2026-0508-SIMSWAP-CUST-002': {
    intro: 'A SIM-swap fraud attempt on Daniel Shah — CUST-002. Risk score 0.94. The agent has 90 seconds before the swap completes.',
    beatsByStage: {
      detect: 'New device, new IP — TOR exit node. Last login was Birmingham, the request is from Lagos. Two known UK retail-bank app device-bindings revoked in the last 30 seconds.',
      observe: 'Salesforce Service Cloud care log: a four-minute call where the attacker provided DOB and a 4-digit care KBA. The KBA was compromised.',
      hypothesize: 'Account takeover in progress. 97% confidence. The cost of a false positive is one inconvenienced customer; the cost of a miss is direct money loss.',
      plan: 'Freeze the swap, step up MFA, lock outbound payments, contact via verified channel only.',
      act: 'Amdocs OMS freeze, Salesforce Identity step-up, Amdocs CES payments lock. ServiceNow security incident opened. Customer contacted via app push and registered MSISDN — not the new device.',
      verify: 'Customer confirmed: did not request the swap. Police-reported. £4,200 loss prevented.',
      resolved: 'Fraud blocked in 3 m 24 s. Cisco SecureX CTI feed updated. The customer keeps the original SIM.',
    },
    domainNotes: {
      noc: 'NOC view: security incidents share the same agent runtime as network incidents — same audit trail, same approval gates.',
      cic: 'CIC view: a fraud-protection upsell is queued for after the resolution call.',
      digital: 'Digital view: the verified-channel push is the key — never trust the new device.',
      bss: 'BSS view: Amdocs OMS freeze and Amdocs CES payments lock. Both reversible if the customer re-confirms.',
      oss: 'OSS view: forensic preservation enabled. Chain-of-custody for police evidence.',
    },
    closing: 'Three minutes from anomaly to police-reported, with the customer kept on the original SIM.',
  },

  // ── Roaming partner outage ────────────────────────────────────────────────
  'NET-INC-2026-0508-ROAMING-VPN-A': {
    intro: 'Roaming — IPX peer VPN-A is down. This is the broadest cross-domain scenario: NOC, BSS, Digital, OSS all light up.',
    beatsByStage: {
      detect: 'BGP session to IPX peer VPN-A is down. 14 destination countries. Diameter S6a/S6d failures from inbound roamers up 2,400%.',
      observe: '12,418 outbound and 4,210 inbound roamers impacted. Spain, Italy, Greece, Turkey reporting "no service".',
      hypothesize: 'VPN-A core router fault, 92% confidence. Two prior incidents both auto-routed via BICS — the secondary IPX peer.',
      plan: 'Failover to BICS, pause overage billing, push localised comms in five languages, open vendor and Ofcom paths.',
      act: 'Cisco ASR 9000 BGP reroute applied. Amdocs CES paused 4,820 in-flight roaming sessions. Cortex Complete localised the push in five languages — 11,704 delivered.',
      verify: 'Outbound roamer attach success at 99.4%. Inbound re-registrations succeeding. UK Mobile Roaming Charges Regulations 2024 honoured.',
      resolved: 'Resolved 8 m 36 s. £14k goodwill applied for 1,840 high-CLV roamers. Vendor RCA pending.',
    },
    domainNotes: {
      noc: 'NOC view: orchestrating four domains in one script.',
      cic: 'CIC view: NBA generated for 1,840 high-CLV roamers — proactive £5 credit and bonus 1 GB EU Roaming Pass.',
      digital: 'Digital view: 11,704 personalised pushes in en-GB, es-ES, it-IT, el-GR, tr-TR. Cortex Complete generated the copy.',
      bss: 'BSS view: Amdocs CES paused billing on 4,820 sessions before the customer ever saw an overage.',
      oss: 'OSS view: ServiceNow vendor escalation and GSMA IR.21 partner desk paged.',
    },
    closing: 'One scenario, four domains synchronised, no customer asked for a credit — and yet the goodwill was applied before they noticed.',
  },

  // ── Mass SIM-swap ─────────────────────────────────────────────────────────
  'SEC-INC-2026-0508-MASS-SIMSWAP': {
    intro: 'Mass SIM-swap. AISQL has correlated 47 swap requests in 18 minutes from a single identity-back-office operator. This is either insider fraud or a credentials compromise — both answers are "freeze".',
    beatsByStage: {
      detect: 'Operator op-4421, role IDENTITY_OPS. Same approval-script timing on every request. 100% high-CLV consumer targets.',
      observe: 'AI_AGG fraud-pattern score 0.96, supervised model and Cortex Complete in agreement. Three prior incidents — two insider, one compromised KBA dump.',
      hypothesize: 'Insider compromise OR KBA leak. 96% confidence. False-positive cost is 0.04, miss cost is £180k.',
      plan: 'Bulk-freeze 47 orders, suspend the operator in Salesforce Identity, postcode-wide MFA step-up, verified-channel notification to all 47 victims.',
      act: 'Amdocs OMS bulk-freeze. Salesforce Identity session revoked. ServiceNow security incident, Workday HR paged. CTI broadcast on GSMA T-ISAC anonymised.',
      verify: 'No further fraud signals. 46 of 47 victims confirmed they did not request a swap. One unreachable, police-reported.',
      resolved: '£184,200 loss prevented in 5 m 24 s. Operator suspended pending forensic interview.',
    },
    domainNotes: {
      noc: 'NOC view: same agent runtime, this time orchestrating across BSS, Identity, HR and CTI.',
      cic: 'CIC view: a fraud-protection upsell is queued for the 47 victims — six months free.',
      digital: 'Digital view: postcode-wide MFA step-up affects 4,118 customers. MFA burden up 12% — limited blast radius.',
      bss: 'BSS view: 47 orders frozen in Amdocs OMS, 47 accounts payment-locked in Amdocs CES.',
      oss: 'OSS view: Workday HR investigation ticket open, forensic image taken with chain-of-custody.',
    },
    closing: 'The agent\'s policy: when both branches of the hypothesis lead to the same action, do not wait for certainty — act and audit.',
  },

  // ── Tower mains failure ───────────────────────────────────────────────────
  'NET-INC-2026-0508-NYK-MAINS': {
    intro: 'Rural North Yorkshire — mains failure at SITE-NYK-DAL-A. Northern Powergrid says four-and-a-half hours. The battery says three-ten. The agent\'s job is to bridge the gap without dropping a single call.',
    beatsByStage: {
      detect: 'AC mains lost at 14:08. Eaton power monitor reports battery at 100%. gNB and transport drawing 280 W.',
      observe: '1,420 customers presenting at this site, 18 high-CLV. Nearest neighbour cell 4.2 km — partial overlap only. No alternative coverage.',
      hypothesize: 'Battery insufficient for utility ETA. Generator dispatch needed. 89% confidence based on similar 2024 winter storm event.',
      plan: 'Energy-save mode (5G off-peak suspension, 4G TX −2 dB) extends battery from 3 h 10 m to 4 h 30 m. Generator ETA 2 h 15 m. Low-key push to high-CLV residents only.',
      act: 'Ericsson EnergyController battery-extend profile applied. ServiceNow ESG-tagged work order. Salesforce Field Service has the generator on the road. £840 opex saves 3,200 kg CO₂ vs the cells-dropped scenario.',
      verify: 'Generator on-site at T+2 h 8 m. Cutover successful. Energy-save released. Mains restored at T+3 h 22 m.',
      resolved: 'Customer-facing outage: zero seconds. MTT-Protect 14 m. 1,420 customers protected. 3,200 kg CO₂ avoided. Battery upgrade queued.',
    },
    domainNotes: {
      noc: 'NOC view: an ESG-positive scenario. Showing the agent makes commercial AND sustainability decisions.',
      cic: 'CIC view: high-CLV cohort protected without alarm or escalation.',
      digital: 'Digital view: 18 low-key pushes to high-CLV residents. Frequency cap respected.',
      bss: 'BSS view: zero credits — service was maintained throughout.',
      oss: 'OSS view: ESG-tagged work order. Battery-replacement business case auto-drafted for the PIR.',
    },
    closing: 'Energy-aware ops: protect customers, protect the network, protect the carbon budget — in one decision.',
  },
};

export const presenterFor = (incidentId: string): PresenterScript | null =>
  presenterScripts[incidentId] ?? null;

// ── Derived presenter for SectionScenarios (CIC/Digital/BSS/OSS) ─────────────
// Synthesises a presenter script on-demand from a scenario's events so every
// scenario plays through the staged narrator (intro → per-stage → closing)
// even when it doesn't have a hand-written script. Hand-written scripts in
// `presenterScripts` always win.

import type { SectionScenario } from './sectionScenarios';

const SECTION_OPENING: Record<string, string> = {
  cic: 'A customer-impact moment is unfolding. Watch the agent move from signal to save.',
  digital: 'A digital-channel moment is going live across web, app, voice and conversational.',
  bss: 'A revenue / commerce process is running. Watch the agent stay inside policy and audit.',
  oss: 'A network operations moment is opening. Watch the agent decide before customers feel it.',
  noc: 'A network incident is unfolding. The agent is moving from alarm to restored service.',
};

const SECTION_CLOSING: Record<string, string> = {
  cic: 'Outcome: the right customers reached, in policy, with the audit trail filed.',
  digital: 'Outcome: comms shipped at scale with consent, frequency caps and brand safety preserved.',
  bss: 'Outcome: revenue protected, regulator-grade evidence pack produced, zero manual reconciliation.',
  oss: 'Outcome: network change executed under change control, digital-twin proven, customers unaffected.',
  noc: 'Outcome: incident resolved, evidence pack filed, regulator clocks satisfied.',
};

const KIND_BEAT_PREFIX: Record<string, string> = {
  detect: 'Detect — ',
  alarm: 'Alarm — ',
  observe: 'Observe — ',
  hypothesize: 'Hypothesise — ',
  plan: 'Plan — ',
  'act-rebalance': 'Act — ',
  'act-snow': 'Act — ',
  'act-restart': 'Act — ',
  'act-care': 'Act — ',
  act: 'Act — ',
  verify: 'Verify — ',
  resolve: 'Resolve — ',
  resolved: 'Resolve — ',
  log: '',
};

const KIND_TO_STAGE: Record<string, NocStageKey> = {
  detect: 'detect',
  alarm: 'detect',
  observe: 'observe',
  hypothesize: 'hypothesize',
  plan: 'plan',
  'act-rebalance': 'act',
  'act-snow': 'act',
  'act-restart': 'act',
  'act-care': 'act',
  act: 'act',
  verify: 'verify',
  resolve: 'resolved',
  resolved: 'resolved',
};

export function derivePresenterFor(s: SectionScenario): PresenterScript {
  // Manual override always wins
  const manual = presenterScripts[s.id];
  if (manual) return manual;

  const beatsByStage: Partial<Record<NocStageKey, string>> = {};
  for (const ev of s.events) {
    const stage = KIND_TO_STAGE[ev.kind];
    if (!stage) continue;
    if (beatsByStage[stage]) continue; // first event per stage wins
    const prefix = KIND_BEAT_PREFIX[ev.kind] ?? '';
    beatsByStage[stage] = `${prefix}${ev.text}`;
  }
  const intro = `${s.subtitle} ${SECTION_OPENING[s.sectionId] ?? ''}`.trim();
  const resolveEv = s.events.find((e) => e.kind === 'resolve');
  const closing = resolveEv ? `${resolveEv.text} ${SECTION_CLOSING[s.sectionId] ?? ''}`.trim() : SECTION_CLOSING[s.sectionId] ?? '';
  return {
    intro,
    beatsByStage,
    domainNotes: {},
    closing,
  };
}

