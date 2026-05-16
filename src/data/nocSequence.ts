// Sequencer scripts: a list of timed events per scenario.
// Each event fires when t >= atSec * 1000 / playSpeed elapsed since play started.

export type SeqEventKind =
  | 'detect'
  | 'alarm'
  | 'observe'
  | 'hypothesize'
  | 'plan'
  | 'act-rebalance'
  | 'act-snow'
  | 'act-restart'
  | 'act-care'
  | 'verify'
  | 'resolve'
  | 'log';

export interface SeqEvent {
  atSec: number;
  kind: SeqEventKind;
  category?: 'Network' | 'Care' | 'Billing' | 'CDR' | 'Decisioning' | 'Activation';
  severity?: 'info' | 'warn' | 'critical' | 'success';
  text: string;
  // When set, the FocusRuntime steers the UI to this target as the event fires:
  // optionally navigates to `route`, scrolls the [data-focus="<target>"] element
  // into view, applies a pulse highlight, and clicks the [data-focus-tab="<tab>"]
  // button inside it if present.
  focus?: {
    target: string;
    route?: string;
    tab?: string;
    hold?: number;
  };
}

export interface IncidentScript {
  incidentId: string;
  durationSec: number;
  events: SeqEvent[];
  // KPI animation targets at end of run
  kpiTargets: {
    mttd?: number;
    mttr?: number;       // Mean time to mitigation (service restored)
    sla?: number;
    alarms?: number;
    auto?: number;
    conf?: number;
  };
}

const log = (atSec: number, text: string, category: SeqEvent['category'] = 'Network', severity: SeqEvent['severity'] = 'info'): SeqEvent => ({
  atSec, kind: 'log', text, category, severity,
});

// ─────────────────────────────────────────────────────────────────────────────
// Manchester M14 — RAN cluster congestion + backhaul overload
// Detection: PRB / Active UEs / Scheduler latency (NOT RSRP — that's coverage)
// Mitigation: MLB intra-cluster + carrier add on hot cell
// ─────────────────────────────────────────────────────────────────────────────
export const manchesterScript: IncidentScript = {
  incidentId: 'NET-INC-2026-0428-MAN-M14',
  durationSec: 34,
  kpiTargets: { mttr: 7.4, sla: 12, alarms: 28, auto: 67, conf: 95 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'Anomaly: PRB utilisation 96% sustained 90s on cell 234-15-90412-3 (gNB-MAN-M14-A, 5G SA NR n78)', category: 'Network', severity: 'critical', focus: { route: '/noc', target: 'noc-detail' } },
    log(0.3, 'Active UE count +180% vs 30-day baseline at gNB-MAN-M14-A (Ericsson AIR 6488)', 'Network', 'warn'),
    log(0.6, 'Scheduler delay p95 4.8ms (baseline 1.1ms)', 'Network', 'warn'),
    { atSec: 1,   kind: 'alarm',      text: 'Alarm storm starting on cluster MAN-01 — Ericsson ENM (RAN OAM) + Nokia NetAct (transport)', category: 'Network', severity: 'warn' },
    log(1.4, 'Adjacent cells 234-15-90412-1..6 trending degraded (PRB > 88%)', 'Network', 'warn'),
    log(2.0, 'GTP-U packet drops on N3 (gNB → Ericsson UPF) for gNB-MAN-M14-A: 0.9% (>0.3% threshold)', 'Network', 'warn'),
    log(2.6, 'Backhaul circuit MAN-01-BH-2 packet loss 4.1% (Cisco NCS-540 reports LSP rerouted)', 'Network', 'warn'),
    log(3.2, 'Probe (Polystar OSIX): RTP MOS dropping 4.1 → 3.4 in cluster', 'Network', 'warn'),
    log(3.6, 'CDR ingest spike: failed-session count +42% in postcode M14', 'CDR', 'warn'),
    { atSec: 4.5, kind: 'observe',    text: 'Agent observe: 7 cells flagged · DC rate +37% · DL p50 118→34 Mbps', category: 'Decisioning', severity: 'info', focus: { route: '/noc', target: 'noc-agent' } },
    log(4.9, 'snowflake.cell_kpis(window=15m, cluster=MAN-01) → 7 outliers', 'Decisioning'),
    log(5.4, 'snowflake.alarm_stream(cluster=MAN-01) → 47 alarms (45 RAN, 2 transport)', 'Decisioning'),
    log(5.9, 'network_impact.customers_at_cells(7 cells, last_15m_presence) → 2,417', 'Decisioning'),
    log(6.4, 'cortex.search.kb("MAN-01 backhaul congestion") → 4 prior runbooks', 'Decisioning'),
    { atSec: 7.5, kind: 'hypothesize', text: 'Hypothesis: peak-period demand spike + degraded BH → cluster overload (88% conf)', category: 'Decisioning', severity: 'info' },
    log(8.0, 'memory.similar_incidents(top=4) → MAN-01 Apr-25, Jul-25, Nov-25, Feb-26', 'Decisioning'),
    log(8.6, 'Ericsson Baseband 6630 (BBU-MAN-01-A) telemetry confirms scheduler saturation', 'Network'),
    log(9.4, 'Care queue depth +18% in Manchester catchment', 'Care', 'warn'),
    { atSec: 10.5, kind: 'plan',       text: 'Plan: (1) MLB intra-cluster + carrier add on hot cell  (2) ServiceNow change  (3) Care playbook for P1', category: 'Decisioning', severity: 'info' },
    log(11.0, 'simulate.mlb_handover_offset(cell=234-15-90412-3, target=234-15-90412-7, offset=-3dB) → −22% drops, +61 Mbps DL', 'Decisioning'),
    log(11.6, 'simulate.add_secondary_carrier(cell=234-15-90412-3, band=n1) → +180 MHz, +35% capacity', 'Decisioning'),
    log(12.2, 'Eligibility checks: consent ✓ · margin floor ✓ · offer fatigue (12d) ✓ · open complaint ✗', 'Decisioning'),
    { atSec: 13.5, kind: 'act-rebalance', text: 'Action: MLB offset −3dB on cell 234-15-90412-3 + activate secondary carrier n1 (T1 reversible · pre-approved playbook PB-RAN-MLB-002)', category: 'Activation', severity: 'success', focus: { route: '/noc', target: 'noc-actions' } },
    log(14.0, 'ran.apply_mlb(cell=234-15-90412-3, offset=-3) → ACK from Ericsson ENM', 'Activation', 'success'),
    log(14.6, 'ran.activate_carrier(cell=234-15-90412-3, band=n1) → ACK from Ericsson ENM', 'Activation', 'success'),
    log(15.4, 'CHURN_MODEL_UK_MOBILE_V3.2 executed → 89 P1 customers identified (high-value × very-high churn)', 'Decisioning'),
    { atSec: 16.5, kind: 'act-snow',   text: 'Action: ServiceNow standard change CHG0012987 opened with full evidence pack', category: 'Activation', severity: 'success' },
    log(17.0, 'ServiceNow ITOM → create_change(template=BH-CONGESTION, ci=CLUSTER-MAN-01) → CHG0012987 · CAB pre-approved (standard)', 'Activation'),
    log(17.8, 'NBA generated: 89 ranked actions ready (apology + £5 credit + plan refresh)', 'Decisioning'),
    { atSec: 19, kind: 'act-care',   text: 'Action: Care orchestrator notified · pre-approved playbook PB-RT-CRED-005 (legal-cleared 2026-04-01)', category: 'Care', severity: 'success' },
    log(19.4, 'Salesforce Service Cloud → push_playbook(segment=P1_HV, playbook=PB-RT-CRED-005) → 89 customers · SMS via Sinch', 'Care', 'success'),
    log(20.6, 'Audit: action provenance recorded · GDPR Art.22 compliance — automated decision with human override available', 'Activation'),
    log(22.0, 'Cell 234-15-90412-1 recovered (PRB 71%, DL 92 Mbps)', 'Network', 'success'),
    log(23.5, 'Cell 234-15-90412-3 recovered (PRB 64%, DL 96 Mbps)', 'Network', 'success'),
    log(24.5, 'Cell 234-15-90412-5 recovered (PRB 58%, DL 88 Mbps)', 'Network', 'success'),
    { atSec: 26, kind: 'verify',     text: 'Verify (5-min watch window): KPIs within 80% of baseline · auto-rollback NOT triggered', category: 'Decisioning', severity: 'success', focus: { route: '/noc', target: 'noc-agent' } },
    log(26.5, 'snowflake.cell_kpis(window=5m, watch=true, cluster=MAN-01) → PASS', 'Decisioning', 'success'),
    log(27.5, 'Risk reduction observed: cohort avg 79% → 47%', 'Decisioning', 'success'),
    log(29.0, 'Service credit £5 queued on next bill for 2,417 affected customers via Amdocs CES Billing (Ofcom auto-comp consideration)', 'Billing', 'success'),
    log(30.0, 'SMS via Sinch sent to 89 customers · Salesforce Marketing Cloud push acknowledged 76/89', 'Care', 'success'),
    log(31.5, 'narrator.draft_briefing(incident=NET-INC-...-MAN-M14) → executive briefing filed', 'Decisioning', 'success'),
    { atSec: 33, kind: 'resolve',    text: 'Service restored · MTTR-mitigation 7m24s · 0 SLA breaches · CHG0012987 awaiting post-implementation review (PIR)', category: 'Network', severity: 'success', focus: { route: '/noc', target: 'noc-grid' } },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Liverpool L1 — gNB thermal alarm with auto-throttle
// Realism: temp recovery has a cause; MTTR-mitigation vs MTTR-closure distinction
// ─────────────────────────────────────────────────────────────────────────────
export const liverpoolScript: IncidentScript = {
  incidentId: 'NET-INC-2026-0508-LIV-L1',
  durationSec: 24,
  kpiTargets: { mttr: 4.2, sla: 8, alarms: 12, auto: 71, conf: 96 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'gNB-LIV-L1-A (Ericsson Radio 4480) internal temperature 78°C (warn 75°C, critical 82°C) · auto-throttle engaged', category: 'Network', severity: 'critical' },
    log(0.4, 'Ericsson ENM BoardTemp alarm: Baseband 6630 (BBU-LIV-L1-A) board 7', 'Network', 'warn'),
    log(0.9, 'Ericsson EnergyController auto-throttle: PRB cap 100% → 70%', 'Network', 'warn'),
    { atSec: 2,   kind: 'alarm',      text: 'Single-site impact contained · 421 customers presenting at gNB-LIV-L1-A', category: 'Network', severity: 'warn' },
    log(2.4, 'Snowpipe Streaming CDR ingest: failed sessions +19%, DC rate +14% (single cell)', 'CDR', 'warn'),
    log(2.9, 'network_impact.customers_at_cells([gNB-LIV-L1-A]) → 421 (12 high-value)', 'Decisioning'),
    log(3.4, 'Cabinet PSU log: mains stable · cabinet AC reports 22°C ambient (normal)', 'Network'),
    { atSec: 4.5, kind: 'observe',    text: 'Agent observe: thermal pattern matches 3 historical incidents on same gNB', category: 'Decisioning', severity: 'info' },
    log(5.0, 'memory.similar_incidents(asset=gNB-LIV-L1-A, type=thermal) → 3 matches, all resolved by fan auto-recovery', 'Decisioning'),
    log(5.6, 'cortex.search.kb("gNB thermal fan-controller") → Ericsson TSB-2024-117 ("Baseband 6630 fan-tray intermittent")', 'Decisioning'),
    { atSec: 6.5, kind: 'hypothesize', text: 'Hypothesis: cabinet fan-controller intermittent — same failure signature as prior 3 (94% conf)', category: 'Decisioning', severity: 'info' },
    log(7.2, 'No customer comms required — single cell soft-impact, throttle masking 88% of capacity', 'Care'),
    { atSec: 8.5, kind: 'plan',       text: 'Plan: hold throttle · dispatch field-tech · monitor temp · queue rolling restart for maintenance window', category: 'Decisioning' },
    log(9.2, 'Salesforce Field Service → dispatch(skill=RAN_HW, asset=gNB-LIV-L1-A, eta=45m) — no on-call escalation needed', 'Activation'),
    { atSec: 10.5, kind: 'act-restart', text: 'Action: schedule rolling gNB restart (02:00–03:00 maintenance window) · post-fan-replacement', category: 'Activation', severity: 'success' },
    log(11.2, 'Netcracker maintenance.window_lock(02:00–03:00, asset=gNB-LIV-L1-A) → CONFIRMED', 'Activation', 'success'),
    log(12.5, 'gNB-LIV-L1-A fan-controller auto-recovered (fan-controller test cycle 6 of 6 — expected behaviour per Ericsson TSB-2024-117)', 'Network'),
    log(13.6, 'Throttle holding · temperature dropping (76°C, slope −0.4°C/min)', 'Network'),
    log(15.0, 'Temperature normalised at 72°C · EnergyController releasing throttle in 10% steps', 'Network', 'success'),
    log(16.4, 'PRB cap restored 70% → 80% → 90% → 100%', 'Network', 'success'),
    { atSec: 18, kind: 'verify',    text: 'Verify: DL recovered to 128 Mbps · field-tech ETA 32m for fan replacement (incident remains OPEN until tech sign-off)', category: 'Decisioning', severity: 'success' },
    log(19.0, 'Risk to customer base contained · CLV protected ~£18.2k · 0 customer comms', 'Decisioning', 'success'),
    log(20.5, 'narrator.draft_pir(incident=NET-INC-...-LIV-L1) → PIR template populated, awaiting field-tech findings', 'Decisioning'),
    { atSec: 23, kind: 'resolve',   text: 'Service restored · MTTR-mitigation 4m12s · MTTR-closure pending field-tech (ETA 32m) · 0 escalations', category: 'Network', severity: 'success' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Leeds LS2 — IPRAN ring fault, vendor escalation, T2 approval required
// Realism: BFD / LSP / OSPF terminology, transport-CAB approval flow
// ─────────────────────────────────────────────────────────────────────────────
export const leedsScript: IncidentScript = {
  incidentId: 'NET-INC-2026-0508-LDS-LS2',
  durationSec: 40,
  kpiTargets: { mttr: 11.6, sla: 22, alarms: 64, auto: 58, conf: 84 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'IPRAN ring fault — BFD session BFD-LS-RING-2-PE2 down (3 of 5 hellos missed) on circuit LS-RING-2', category: 'Network', severity: 'critical' },
    log(0.5, 'OSPF flap on Juniper MX204 PE-LDS-2 ↔ PE-LDS-3 link (Openreach fibre, vendor-A)', 'Network', 'warn'),
    log(1.0, 'Ring members LS2-A, LS2-B, LS2-C reporting 3.4% packet loss on primary path', 'Network', 'warn'),
    { atSec: 2,   kind: 'alarm',      text: 'Alarm storm: 64 alarms in 12s across 3 sites (Cisco IOS-XR 8201 + Juniper MX204)', category: 'Network', severity: 'critical' },
    log(2.5, 'CDR ingest: failed sessions +17% (612 customers presenting at affected cells)', 'CDR', 'warn'),
    log(3.0, 'network_impact.customers_at_circuit(LS-RING-2) → 612 (71 high-value, 14 P1 churn)', 'Decisioning'),
    log(4.0, 'Care queue: +9 contacts in last 60s ("data not working in central Leeds")', 'Care', 'warn'),
    { atSec: 6,   kind: 'observe',    text: 'Agent observe: pattern atypical · no high-confidence historical match · transport-layer fault suspected', category: 'Decisioning', severity: 'warn' },
    log(7.0, 'memory.similar_incidents(top=5) → 0 matches above 0.7 confidence', 'Decisioning', 'warn'),
    log(8.0, 'snowflake.transport_loss(circuit=LS-RING-2, vendor=Openreach) → loss localised to span PE-LDS-2 ↔ PE-LDS-3', 'Decisioning'),
    log(8.8, 'Cortex Analyst text2sql("show MPLS LSPs on LS-RING-2") → 14 LSPs, 11 with ≥1 customer-impacting service', 'Decisioning'),
    { atSec: 10, kind: 'hypothesize', text: 'Hypothesis: Openreach fibre fault between PE-LDS-2 and PE-LDS-3 (84% conf) — vendor escalation required', category: 'Decisioning', severity: 'warn' },
    log(11.0, 'OTDR (Viavi MTS-6000) self-test on Openreach circuit indicates discontinuity at ~3.2 km from PE-LDS-2', 'Network', 'warn'),
    { atSec: 13, kind: 'plan',      text: 'Plan: (1) reroute LSPs via secondary ring LS-RING-3  (2) raise vendor-A P1 ticket  (3) targeted Care comms for 612', category: 'Decisioning' },
    log(14.0, 'simulate.mpls_lsp_reroute(primary=LS-RING-2, secondary=LS-RING-3) → +18ms latency, no drops, no SLA breach predicted', 'Decisioning'),
    log(14.8, 'risk.estimate(reroute) → low (LS-RING-3 utilisation 34% post-reroute)', 'Decisioning'),
    { atSec: 16, kind: 'act-rebalance', text: 'Proposed action: MPLS LSP reroute → LS-RING-3 (T2 reversible · transport-layer · CAB approval required)', category: 'Activation', severity: 'warn' },
    log(17.0, 'Human approval required: T2 normal change on shared transport — ServiceNow change CHG0012988 paged to NOC engineer + transport-CAB delegate', 'Activation', 'warn'),
    log(19.0, 'NOC engineer + transport-CAB delegate approved at 16:39 (CAB pre-approval window for P1 hot-fix)', 'Activation', 'success'),
    log(19.5, 'Juniper Junos PyEZ → lsp_reroute(primary=LS-RING-2, target=LS-RING-3) → APPLIED (commit-confirmed 5min)', 'Activation', 'success'),
    { atSec: 21, kind: 'act-snow',  text: 'Action: Openreach P1 ticket VND-2026-0508-OR0142 opened — Openreach SLA clock: 4h restoration', category: 'Activation', severity: 'success' },
    log(21.5, 'ServiceNow ITSM → escalate(vendor=Openreach, severity=P1, evidence=OTDR+BFD+OSPF) → ACK 16:41', 'Activation', 'success'),
    log(23.5, 'Reroute applied — primary ring isolated · packet loss falling (1.8% → measurement on legacy path only)', 'Network'),
    log(25.0, 'New path stable: BFD up, OSPF converged, MPLS RSVP-TE LSPs signalled', 'Network', 'success'),
    { atSec: 27, kind: 'act-care',  text: 'Action: targeted Care comms — 612 customers · proactive apology + £5 service credit · pre-approved playbook PB-RT-TRP-003', category: 'Care', severity: 'success' },
    log(27.6, 'Salesforce Service Cloud → push_playbook(segment=LS2_AFFECTED, playbook=PB-RT-TRP-003) → 612 customers · SMS via Sinch + email via Salesforce MC', 'Care', 'success'),
    log(29.5, 'Openreach confirms fibre splice fault at manhole MH-LS-417 — repair team dispatched (ETA 3h)', 'Network'),
    log(31.5, 'Risk reduction observed: 612 affected customers · 14 P1 churn → 6 P1 (post-credit eligibility)', 'Decisioning', 'success'),
    log(33.0, 'Amdocs CES Billing → service credit £5 queued for 612 customers · Ofcom auto-compensation thresholds NOT triggered (<2h outage)', 'Billing', 'success'),
    { atSec: 35, kind: 'verify',    text: 'Verify (5-min KPI window): customer-facing KPIs PASS · vendor SLA clock active · 1 SLA breach (cust-facing data > 30min in 39 cells)', category: 'Decisioning', severity: 'success' },
    log(36.5, 'narrator.draft_pir → PIR draft includes RCA placeholder, vendor evidence packet, customer impact summary', 'Decisioning'),
    { atSec: 39, kind: 'resolve',   text: 'Service restored on secondary ring · MTTR-mitigation 11m36s · MTTR-closure pending vendor splice repair (~3h) · 1 SLA breach · vendor RCA mandatory', category: 'Network', severity: 'success' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// London E14 — HSS / VoLTE registration storm
// Highest-impact telco scenario type. Multi-vendor coordination (HSS vendor + IMS vendor).
// ─────────────────────────────────────────────────────────────────────────────
export const londonHssScript: IncidentScript = {
  incidentId: 'NET-INC-2026-0508-LDN-HSS',
  durationSec: 36,
  kpiTargets: { mttr: 9.8, sla: 18, alarms: 142, auto: 64, conf: 91 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'IMS registration failure rate 12% on Mavenir P-CSCF cluster LDN-PCSCF-01 (baseline 0.4%) — VoLTE service-affecting', category: 'Network', severity: 'critical' },
    log(0.4, 'Oracle USPL HSS-LDN-A response latency p99: 480ms (SLA 50ms) · Cx Diameter peer flapping', 'Network', 'critical'),
    log(0.9, 'SRVCC handover failures +220% in last 3 min', 'Network', 'critical'),
    { atSec: 1.5, kind: 'alarm',      text: 'Alarm storm: 142 alarms in 18s across IMS core (Mavenir P/I/S-CSCF + Oracle USPL HSS)', category: 'Network', severity: 'critical' },
    log(2.2, 'Probe (Empirix E-XMS): MOS dropping 4.2 → 2.9 on calls traversing LDN-PCSCF-01', 'Network', 'critical'),
    log(2.8, 'Snowpipe Streaming CDR: VoLTE call setup failure rate 18% (baseline 0.3%)', 'CDR', 'critical'),
    log(3.4, 'Salesforce Service Cloud queue: voice complaints +340% in 90s · Twitter mentions trending', 'Care', 'critical'),
    log(4.0, 'network_impact.subscribers_at_pcscf(LDN-PCSCF-01) → 1.42M attached subscribers (London + SE)', 'Decisioning'),
    { atSec: 5,   kind: 'observe',    text: 'Agent observe: HSS Cx Diameter session table at 96% capacity · stale IMS registrations accumulating after S-CSCF re-home', category: 'Decisioning', severity: 'critical' },
    log(5.6, 'snowflake.diameter_metrics(node=HSS-LDN-A, interface=Cx, last=10m) → UAR/SAR storm, 8.4× normal volume', 'Decisioning'),
    log(6.4, 'cortex.search.kb("Oracle USPL Cx session-table saturation") → Oracle advisory ORA-HSS-2025-08 + 2 internal runbooks', 'Decisioning'),
    log(7.2, 'memory.similar_incidents(top=5) → 1 high-confidence match (LDN-HSS Sep-25, resolved by Cx session-table flush + S-CSCF re-anchor)', 'Decisioning'),
    { atSec: 8.5, kind: 'hypothesize', text: 'Hypothesis: stale Cx sessions after S-CSCF re-home at 09:24 (post-MME failover) — IMS re-registration storm filling HSS Cx table (91% conf)', category: 'Decisioning', severity: 'warn' },
    log(9.2, 'Correlation: Mavenir S-CSCF re-anchor event at 09:24:08 (after MME-LDN-2 failover) → IMS re-register storm started 09:24:42', 'Decisioning'),
    { atSec: 10.5, kind: 'plan',      text: 'Plan: (1) flush stale Cx sessions on Oracle USPL HSS-LDN-A  (2) rate-limit Mavenir P-CSCF re-reg attempts  (3) failover P-CSCF traffic to LDN-PCSCF-02 if not recovered in 90s', category: 'Decisioning', severity: 'warn' },
    log(11.2, 'simulate.diameter_flush(node=HSS-LDN-A, interface=Cx, idle>300s) → frees ~620k sessions (54% of cap)', 'Decisioning'),
    log(11.9, 'risk.estimate(p_cscf_failover=LDN-PCSCF-02) → 1.42M re-registrations, 90s convergence, manageable on Mavenir standby capacity', 'Decisioning'),
    log(12.6, 'Eligibility: T2 emergency change (service-affecting) → expedited CAB · CTO duty-officer auto-paged via Salesforce on-call rota', 'Decisioning', 'warn'),
    { atSec: 14, kind: 'act-restart', text: 'Action: flush idle Cx Diameter sessions on Oracle USPL HSS-LDN-A + rate-limit Mavenir P-CSCF re-reg (T2 emergency · CTO duty-officer approval)', category: 'Activation', severity: 'warn' },
    log(14.6, 'Approval received from CTO duty-officer (16:28) via ServiceNow CAB · audit trail recorded', 'Activation', 'success'),
    log(15.4, 'Oracle USPL hss.diameter_flush(node=HSS-LDN-A, interface=Cx, idle_threshold=300s) → 624,118 sessions cleared', 'Activation', 'success'),
    log(16.0, 'Mavenir pcscf.rate_limit(node=LDN-PCSCF-01, max_reg_per_sec=4000) → APPLIED', 'Activation', 'success'),
    { atSec: 17.5, kind: 'act-snow', text: 'Action: ServiceNow major incident MIM-2026-0508-001 opened · Ofcom GC A3 (999/112 reachability) impact triage opened · NIS2/NCSC preliminary notification clock running', category: 'Activation', severity: 'critical' },
    log(18.2, 'ServiceNow ITSM → create_incident(template=IMS-MAJOR, severity=P1, gc_a3_triage=true, ncsc_notify=true) → MIM-2026-0508-001', 'Activation'),
    log(19.6, 'IMS reg failure rate 12% → 5.8% (improving)', 'Network'),
    log(21.0, 'Cx session table 96% → 71% (recovering)', 'Network'),
    { atSec: 22.5, kind: 'act-care', text: 'Action: hold all proactive Care comms (regulator-led messaging will lead) · prepare bulletin for 1.42M IMS-attached subs', category: 'Care', severity: 'warn' },
    log(23.2, 'Salesforce Marketing Cloud draft_bulletin(template=VOLTE_OUTAGE, audience=LDN_PCSCF_01_attached) → drafted, awaiting sign-off', 'Care'),
    log(24.5, 'IMS reg failure rate 5.8% → 1.4%', 'Network', 'success'),
    log(26.0, 'SRVCC HO success rate recovered to 99.1% (baseline 99.4%)', 'Network', 'success'),
    log(27.5, 'MOS recovered: median 4.0 across LDN-PCSCF-01 traffic', 'Network', 'success'),
    { atSec: 29.5, kind: 'verify',   text: 'Verify (10-min watch window — extended for IMS): registration & call-setup KPIs within 95% of baseline', category: 'Decisioning', severity: 'success' },
    log(30.5, 'snowflake.ims_kpis(window=10m, watch=true, cluster=LDN-PCSCF-01) → PASS', 'Decisioning', 'success'),
    log(32.0, 'Bulletin published: "We are aware of a brief voice-call issue affecting some London customers around 09:25–09:35. The issue is resolved." (consumer + business channels)', 'Care', 'success'),
    log(33.5, 'narrator.draft_pir(incident=NET-INC-...-LDN-HSS) → Ofcom notification draft + PIR template populated', 'Decisioning'),
    { atSec: 35, kind: 'resolve',   text: 'Service restored · MTTR-mitigation 9m48s · NIS2/NCSC notifiable event (≥1M users) · GC A3 999-impact triage closed (no 999 calls failed) · MIM-2026-0508-001 awaiting RCA + Oracle/Mavenir advisory follow-up', category: 'Network', severity: 'success' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SIM-swap fraud — security blend with BSS (account takeover prevention)
// ─────────────────────────────────────────────────────────────────────────────
export const simSwapScript: IncidentScript = {
  incidentId: 'SEC-INC-2026-0508-SIMSWAP-CUST-002',
  durationSec: 26,
  kpiTargets: { mttr: 3.4, sla: 6, alarms: 8, auto: 78, conf: 97 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'Anomaly: SIM-swap request for MSISDN +44 7700 900 461 from new device + new IP (TOR exit node)', category: 'Network', severity: 'critical' },
    log(0.4, 'Risk model (Snowpark ML): device fingerprint UNKNOWN · last login city Birmingham · request city Lagos', 'Decisioning', 'critical'),
    log(0.9, 'Behavioural anomaly: 4 self-service password resets in 12min · device-binding revoke for 2 known UK retail-bank app TACs in last 30s (CTI cross-flow)', 'Decisioning', 'critical'),
    { atSec: 1.5, kind: 'alarm',      text: 'Cross-system alarm (Salesforce Identity + Amdocs OMS): account-takeover risk score 0.94', category: 'Network', severity: 'critical' },
    log(2.0, 'snowflake.fraud_signals(msisdn=+447700900461, last=24h) → 5 high-risk indicators', 'Decisioning'),
    log(2.6, 'memory.similar_incidents(type=simswap) → 12 prior, 9 confirmed fraud', 'Decisioning'),
    { atSec: 3.5, kind: 'observe',    text: 'Agent observe: classic SIM-swap pattern · victim CUST-002 · attacker likely social-engineered care', category: 'Decisioning', severity: 'critical' },
    log(4.2, 'Salesforce Service Cloud agent-call review (call-2026-0508-1142, 4m duration): attacker provided DOB + 4-digit care PIN (KBA — compromised)', 'Decisioning'),
    { atSec: 5.5, kind: 'hypothesize', text: 'Hypothesis: account takeover in progress (97% conf) — block before swap completes', category: 'Decisioning', severity: 'critical' },
    { atSec: 7,   kind: 'plan',       text: 'Plan: (1) freeze swap  (2) step-up MFA on customer  (3) lock outbound payments  (4) contact customer via verified channel', category: 'Decisioning' },
    log(7.6, 'risk.estimate(action=freeze) → 0.02 false-positive · low customer impact', 'Decisioning'),
    { atSec: 9, kind: 'act-restart', text: 'Action: freeze SIM-swap order ORD-2026-0508-99428 in Amdocs OMS · T1 reversible · pre-approved playbook PB-SEC-SIMSWAP-001', category: 'Billing', severity: 'success' },
    log(9.6, 'Amdocs OMS → oms.freeze_order(ORD-2026-0508-99428) → ACK', 'Billing', 'success'),
    log(10.8, 'Salesforce Identity → require_step_up(msisdn=+447700900461, methods=[passkey, biometric]) → APPLIED', 'Activation', 'success'),
    { atSec: 12, kind: 'act-snow',  text: 'Action: ServiceNow security incident SEC-INC-2026-0508-001 · Cisco SecureX CTI alerted · STIR/SHAKEN check on incoming numbers', category: 'Activation', severity: 'critical' },
    log(12.6, 'ServiceNow SecOps → create_incident(template=SECURITY-ATO, severity=P1) → SEC-INC-2026-0508-001', 'Activation'),
    log(14.0, 'Amdocs CES Billing → payments.lock_outbound(account=BAC-9921, duration=24h) → APPLIED', 'Billing', 'success'),
    { atSec: 15.5, kind: 'act-care', text: 'Action: contact customer via verified channel (My SnowTelco app push via Salesforce MC + voice on registered MSISDN through Genesys Cloud, NOT new device)', category: 'Care', severity: 'success' },
    log(16.2, 'Salesforce MC + Genesys Cloud → notify_secure(customer=CUST-002, channels=[app_push_verified, voice_registered]) → 2/2 acknowledged', 'Care', 'success'),
    log(17.8, 'Customer confirmed: did NOT request swap. Police report flag set.', 'Care', 'critical'),
    log(19.0, 'Attacker session terminated · 3 devices revoked · audit packet preserved (chain-of-custody)', 'Activation', 'success'),
    { atSec: 21, kind: 'verify',    text: 'Verify: no further fraud signals · customer retained on original SIM · fraud loss prevented £4,200', category: 'Decisioning', severity: 'success' },
    log(22.0, 'CTI feed updated with attacker IOCs · cross-MNO sharing via GSMA T-ISAC opt-in', 'Decisioning'),
    log(23.5, 'narrator.draft_pir(incident=SEC-INC-...-SIMSWAP) → customer apology + fraud-protection upsell drafted', 'Decisioning'),
    { atSec: 25, kind: 'resolve',   text: 'Fraud prevented · MTTR-mitigation 3m24s · £4,200 loss avoided · customer retained · police-reported', category: 'Network', severity: 'success' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Roaming partner outage (GRX/IPX) — broadest cross-domain fan-out
// NOC → BSS → Digital → CIC → OSS, Ofcom + GSMA hooks
// ─────────────────────────────────────────────────────────────────────────────
export const roamingPartnerScript: IncidentScript = {
  incidentId: 'NET-INC-2026-0508-ROAMING-VPN-A',
  durationSec: 38,
  kpiTargets: { mttr: 8.6, sla: 14, alarms: 96, auto: 73, conf: 92 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'IPX peer VPN-A BGP session down · 14 destination countries impacted', category: 'Network', severity: 'critical' },
    log(0.4, 'Diameter S6a/S6d failures from inbound roamers via IPX peer VPN-A: +2,400% in 60s', 'Network', 'critical'),
    log(0.9, 'GTP-C tunnels to IPX peer VPN-A timing out · S8 path probes failing', 'Network', 'critical'),
    log(1.4, 'Outbound roamers in Spain, Italy, Greece, Turkey reporting "no service"', 'CDR', 'warn'),
    { atSec: 2,   kind: 'alarm',      text: 'Alarm storm: 96 alarms across IPX peering + roaming GW (GSMA IR.21 partner: VPN-A)', category: 'Network', severity: 'critical' },
    log(2.4, 'snowflake.roaming_kpis(partner=VPN-A, last=10m) → 12,418 outbound roamers, 4,210 inbound roamers impacted', 'Decisioning'),
    log(3.0, 'network_impact.cohort(impact=ipx_peer_outage, partner=VPN-A) → 12,418 outbound · 4,210 inbound', 'Decisioning'),
    { atSec: 4,   kind: 'observe',    text: 'Agent observe: cross-domain blast radius — NOC + BSS billing + outbound CIC cohort', category: 'Decisioning', severity: 'warn' },
    log(4.6, 'cortex.search.kb("IPX BGP partner outage runbook") → RB-ROAM-002 · last triggered 2024-11-04', 'Decisioning'),
    log(5.4, 'memory.similar_incidents(type=ipx_partner) → 2 prior, both auto-routed via secondary peer (BICS / Syniverse)', 'Decisioning'),
    { atSec: 7,   kind: 'hypothesize', text: 'Hypothesis: VPN-A core router fault (92% conf) — failover via secondary IPX peer (BICS) viable', category: 'Decisioning', severity: 'warn' },
    log(7.6, 'simulate.ipx_failover(primary=VPN-A, secondary=BICS) → +24ms latency, no SLA breach predicted', 'Decisioning'),
    { atSec: 9,   kind: 'plan',       text: 'Plan: (1) IPX failover BICS  (2) BSS pause overage billing during outage  (3) Digital push proactive comms  (4) CIC goodwill cohort  (5) OSS open vendor + Ofcom log', category: 'Decisioning' },
    log(9.6, 'BSS pre-flight: identify in-flight roaming sessions (4,820) for billing-pause eligibility', 'Billing', 'info'),
    { atSec: 11, kind: 'act-rebalance', text: 'Action (NOC): IPX failover to BICS · BGP reroute on Cisco ASR 9000 (T2 reversible · transport CAB pre-cleared for partner failover)', category: 'Activation', severity: 'success' },
    log(11.5, 'Cisco ASR 9000 → transport.bgp_reroute(target=BICS) → APPLIED · BFD up · Diameter rebinding', 'Activation', 'success'),
    log(12.8, 'Inbound roamer S6a re-registrations succeeding via Oracle USPL HSS (412 in last 30s)', 'Network', 'success'),
    { atSec: 14, kind: 'act-snow',  text: 'Action (BSS): pause overage billing in Amdocs CES for 4,820 in-flight roaming sessions · UK Mobile Roaming Charges Regulations 2024 honoured', category: 'Billing', severity: 'success' },
    log(14.6, 'Amdocs CES Billing → pause_session_charging(filter=ipx_VPN_A_outage) → 4,820 sessions paused', 'Billing', 'success'),
    log(15.4, 'Cohort assembled: 12,418 outbound roamers · 1,840 high-CLV · ranked by destination & impact duration', 'Decisioning'),
    { atSec: 17, kind: 'act-care',  text: 'Action (Digital): Salesforce Marketing Cloud app push to 12,418 outbound roamers — "Limited service abroad, working on it" (localised by destination)', category: 'Care', severity: 'success' },
    log(17.6, 'Cortex Complete (template=ROAMING_OUTAGE, locales=[en-GB,es-ES,it-IT,el-GR,tr-TR]) → 12,418 personalised', 'Care'),
    log(18.4, 'Salesforce MC + Sinch SMS → channel.push(consent_filtered=true, freq_cap_check=ok) → 11,704 delivered · 714 suppressed (consent/cap)', 'Care', 'success'),
    log(20.0, 'CIC: NBA generated for 1,840 high-CLV roamers — proactive £5 service credit + bonus 1GB EU Roaming Pass', 'Decisioning'),
    { atSec: 21.5, kind: 'act-snow', text: 'Action (OSS): Openreach/IPX vendor P1 ticket VND-2026-0508-VPN-A0211 in ServiceNow + Ofcom GC C7 incident log started', category: 'Activation', severity: 'critical' },
    log(22.2, 'ServiceNow ITSM → escalate(vendor=VPN-A_partner, severity=P1, category=IPX_outage) → ACK', 'Activation'),
    log(23.0, 'GSMA OPS → partner_notify(IR.21, partner=VPN-A) → bilateral incident desk paged', 'Activation'),
    log(24.5, 'Service restored on BICS path — outbound roamer attach success rate 99.4%', 'Network', 'success'),
    log(26.0, 'Inbound roamers from VPN-A: 4,210 → 4,180 attached · 30 still re-registering', 'Network', 'success'),
    { atSec: 27.5, kind: 'verify',  text: 'Verify (10-min watch): cross-domain KPIs — roaming attach 99.4%, app push 94% delivered, billing pause active', category: 'Decisioning', severity: 'success' },
    log(28.5, 'BSS (Amdocs CES): 4,820 paused sessions reviewed · 4,690 closed (auto-credited if applicable) · 130 to manual review', 'Billing', 'success'),
    log(30.0, 'CIC: 1,840 high-CLV goodwill credits applied · pre-approved playbook PB-RT-ROAM-001', 'Decisioning', 'success'),
    log(31.5, 'Digital: follow-up "service restored" push sent to 11,704 customers · ack rate 78%', 'Care', 'success'),
    log(33.0, 'OSS: PIR draft populated · Ofcom auto-comp evaluated (outage <2h → ineligible, goodwill applied)', 'Activation'),
    log(34.5, 'Vendor confirms VPN-A core router failover · primary path returning in 4h maintenance window', 'Network'),
    { atSec: 37, kind: 'resolve',  text: 'Resolved · MTTR-mitigation 8m36s · 12,418 customers protected · £14k goodwill applied · 0 SLA breaches · vendor RCA pending', category: 'Network', severity: 'success' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Mass SIM-swap fraud campaign — coordinated wave from a call-centre operator
// ─────────────────────────────────────────────────────────────────────────────
export const massSimSwapScript: IncidentScript = {
  incidentId: 'SEC-INC-2026-0508-MASS-SIMSWAP',
  durationSec: 30,
  kpiTargets: { mttr: 5.4, sla: 8, alarms: 47, auto: 81, conf: 96 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'Pattern detected: 47 SIM-swap requests in 18 min approved by same identity-back-office operator (op-id 4421, role: IDENTITY_OPS)', category: 'Network', severity: 'critical' },
    log(0.4, 'Common signals: same operator · same approval-script timing · all KBA verified on first attempt · 100% high-CLV consumer targets', 'Decisioning', 'critical'),
    log(0.9, 'Geographic spread: 47 customers across 9 postcodes · no plausible legitimate cluster (consumer accounts only — B2B fleet portal not involved)', 'Decisioning', 'critical'),
    { atSec: 1.5, kind: 'alarm',      text: 'AISQL AI_AGG fraud-pattern score 0.96 · supervised model + Cortex Complete LLM corroboration', category: 'Network', severity: 'critical' },
    log(2.0, 'snowflake.fraud_signals(operator=op-4421, last=24h) → 47 high-risk swaps, 0 prior pattern from this op', 'Decisioning'),
    log(2.6, 'memory.similar_incidents(type=mass_simswap) → 3 prior, 2 confirmed insider · 1 confirmed compromised KBA dump', 'Decisioning'),
    { atSec: 3.5, kind: 'observe',    text: 'Agent observe: classic insider-or-compromised pattern in identity-ops · victim cohort 47 · estimated £180k fraud exposure', category: 'Decisioning', severity: 'critical' },
    log(4.0, 'CIC: 47 victims identified · 38 high-CLV consumer accounts · (B2B lines unaffected — different approval flow)', 'Decisioning'),
    { atSec: 5,   kind: 'hypothesize', text: 'Hypothesis: insider compromise of identity-ops operator op-4421 OR KBA-database leak (96% conf) — both scenarios = freeze', category: 'Decisioning', severity: 'critical' },
    log(5.6, 'risk.estimate(action=mass_freeze) → 0.04 false-positive · low customer impact (originals retained)', 'Decisioning'),
    { atSec: 7,   kind: 'plan',       text: 'Plan: (1) freeze all 47 swaps  (2) suspend op-4421 + revoke session  (3) postcode-wide MFA step-up  (4) Care callbacks on registered MSISDNs', category: 'Decisioning' },
    log(8.0, 'Pre-approved playbook PB-SEC-MASSWAP-001 selected (security-cleared 2026-03-15)', 'Decisioning'),
    { atSec: 9, kind: 'act-restart', text: 'Action (BSS): freeze 47 SIM-swap orders in Amdocs OMS · suspend operator op-4421 in Salesforce Identity · payments lock on 47 accounts (Amdocs CES)', category: 'Billing', severity: 'success' },
    log(9.6, 'Amdocs OMS → oms.bulk_freeze(orders=[ORD-...01..47]) → ACK · audit packet preserved (Tri-Secret Secure)', 'Billing', 'success'),
    log(10.4, 'Salesforce Identity → suspend_operator(id=op-4421, role=IDENTITY_OPS) → session revoked · forensic preservation enabled', 'Activation', 'success'),
    log(11.2, 'Amdocs CES Billing → payments.lock_outbound(accounts=47, duration=24h) → APPLIED', 'Billing', 'success'),
    { atSec: 12.5, kind: 'act-snow',  text: 'Action (OSS): ServiceNow security incident SEC-INC-2026-0508-002 · Workday HR investigation paged · Cisco SecureX CTI feed updated', category: 'Activation', severity: 'critical' },
    log(13.2, 'ServiceNow SecOps → create_incident(template=INSIDER-FRAUD, severity=P1, hr_paged=true) → SEC-INC-2026-0508-002', 'Activation'),
    log(14.4, 'GSMA T-ISAC share_iocs(network=GSMA_T_ISAC, attributes=[op_pattern, timing_signature]) → broadcast (anonymised)', 'Activation'),
    { atSec: 15.5, kind: 'act-care',  text: 'Action (Digital): Salesforce Identity step-up MFA across 9 postcodes · 47 verified-channel notifications via Salesforce MC + Genesys Cloud', category: 'Care', severity: 'success' },
    log(16.2, 'Salesforce Identity → step_up(scope=postcodes_9, method=passkey+biometric) → 4,118 customers · MFA burden +12%', 'Activation', 'success'),
    log(17.0, 'Salesforce MC + Genesys Cloud → notify_secure(victims=47, channels=[app_push_verified, voice_registered]) → 44/47 acknowledged', 'Care', 'success'),
    log(18.4, '46/47 victims confirmed: did NOT request swap · 1 unreachable (police-reported)', 'Care', 'critical'),
    log(19.6, 'Attacker sessions terminated · 132 devices revoked across victim accounts', 'Activation', 'success'),
    log(21.0, 'CIC: fraud-protection upsell drafted for 47 victims (free fraud monitoring 6mo · pre-approved playbook PB-RT-FRAUD-001)', 'Decisioning'),
    { atSec: 22.5, kind: 'verify',    text: 'Verify: no further fraud signals from operator pattern · postcode MFA stable · CTI sharing acknowledged', category: 'Decisioning', severity: 'success' },
    log(23.5, 'Workday HR: op-4421 access fully revoked · interview scheduled · forensic image taken (chain-of-custody preserved)', 'Activation'),
    log(25.0, 'Estimated loss prevented: £184,200 (47 × avg £3,919 banking-app exposure)', 'Decisioning', 'success'),
    log(26.5, 'Regulator notification (FCA/Ofcom) — operator fraud event logged · incident report filed', 'Activation'),
    { atSec: 28, kind: 'resolve',   text: 'Mass fraud prevented · MTTR-mitigation 5m24s · £184k loss avoided · 46/47 customers retained · operator suspended', category: 'Network', severity: 'success' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Tower mains failure + battery exhaustion — ESG/energy angle
// ─────────────────────────────────────────────────────────────────────────────
export const towerMainsScript: IncidentScript = {
  incidentId: 'NET-INC-2026-0508-NYK-MAINS',
  durationSec: 30,
  kpiTargets: { mttr: 14.0, sla: 35, alarms: 28, auto: 62, conf: 89 },
  events: [
    { atSec: 0,   kind: 'detect',     text: 'Site SITE-NYK-DAL-A (rural · North Yorkshire) — mains failure · battery cutover (T+0)', category: 'Network', severity: 'critical' },
    log(0.4, 'Eaton power monitor: AC mains lost at 14:08:22 · battery online · estimated runtime 3h 10m', 'Network', 'warn'),
    log(0.9, 'Power utility (Northern Powergrid) advisory: regional outage · ETA restoration 4h 30m', 'Network', 'warn'),
    log(1.5, 'Battery state: 100% → 96% (Vertiv lithium pack · steady drain · gNB + transport ~280W)', 'Network', 'warn'),
    { atSec: 2,   kind: 'alarm',      text: 'Battery countdown started · ETA depletion before mains restoration · field intervention required', category: 'Network', severity: 'warn' },
    log(2.4, 'network_impact.customers_at_site(SITE-NYK-DAL-A, last_24h_presence) → 1,420 · 18 high-CLV', 'Decisioning'),
    log(3.0, 'No alternative coverage: nearest neighbour cell 4.2km · partial overlap only', 'Network', 'warn'),
    { atSec: 4,   kind: 'observe',    text: 'Agent observe: 1h 20m gap between battery depletion and mains ETA — generator dispatch needed', category: 'Decisioning', severity: 'warn' },
    log(4.5, 'cortex.search.kb("rural site mains outage SOP") → RB-ENERGY-007 · battery-aware ops playbook', 'Decisioning'),
    log(5.2, 'memory.similar_incidents(site=SITE-NYK-DAL-A, type=mains) → 1 prior 2024 (winter storm)', 'Decisioning'),
    { atSec: 6,   kind: 'hypothesize', text: 'Hypothesis: battery insufficient for utility ETA · dispatch portable generator + activate energy-save mode (89% conf)', category: 'Decisioning', severity: 'warn' },
    log(6.6, 'simulate.energy_save_mode(site=SITE-NYK-DAL-A) → reduces draw 280W → 198W · extends battery 3h 10m → 4h 30m', 'Decisioning'),
    log(7.2, 'Salesforce Field Service → dispatch(skill=ENERGY_HW, asset=portable_generator, eta=2h 15m) — confirmed', 'Activation'),
    { atSec: 8.5, kind: 'plan',       text: 'Plan: (1) energy-save mode (cells reduce TX power)  (2) generator dispatch  (3) Digital low-key comms  (4) OSS open ESG-tagged ticket', category: 'Decisioning' },
    { atSec: 10, kind: 'act-rebalance', text: 'Action (NOC): activate Ericsson EnergyController battery-extend profile · 5G off-peak suspension · 4G TX power −2dB (T1 reversible · pre-approved)', category: 'Activation', severity: 'success' },
    log(10.6, 'Ericsson ENM → ran.energy_save(site=SITE-NYK-DAL-A, profile=BATTERY_EXTEND) → APPLIED · draw 198W', 'Activation', 'success'),
    log(11.4, 'Coverage impact: peak DL throughput reduced 5G→4G fallback · acceptable for residential mix', 'Network'),
    { atSec: 13, kind: 'act-snow',   text: 'Action (OSS): ServiceNow work order WO-2026-0508-NYK-001 · ESG-tagged · battery-replacement upgrade also queued', category: 'Activation', severity: 'success' },
    log(13.6, 'ServiceNow ITSM → create_workorder(template=POWER-OUTAGE, esg_tag=true, asset=SITE-NYK-DAL-A) → WO-2026-0508-NYK-001', 'Activation'),
    log(14.4, 'opex.estimate(generator_dispatch + tech_2h) → £840 · CO₂ delta 21kg (vs 3,200kg if cells dropped + churn)', 'Decisioning'),
    { atSec: 16, kind: 'act-care',  text: 'Action (Digital): low-key informational push via Salesforce MC to high-CLV residents only — "Reduced data speeds in your area"', category: 'Care', severity: 'success' },
    log(16.6, 'Salesforce MC → channel.push(audience=high_clv_at_site, freq_cap_check=ok) → 18/18 delivered', 'Care', 'success'),
    log(18.0, 'Battery state: 84% · runtime now estimated 3h 50m · generator ETA 2h · margin 1h 50m', 'Network'),
    log(20.0, 'Generator on-site (T+2h 8m) · cutover prep started', 'Network', 'success'),
    log(21.5, 'Generator cutover successful · battery charging resumed at 38% remaining', 'Network', 'success'),
    log(23.0, 'Energy-save mode released · 5G + full TX restored', 'Network', 'success'),
    { atSec: 24, kind: 'verify',    text: 'Verify: full service maintained throughout · zero customer disconnects · energy SLA preserved', category: 'Decisioning', severity: 'success' },
    log(25.0, 'Mains restored at T+3h 22m · generator on standby · battery 92%', 'Network', 'success'),
    log(26.5, 'ESG report: avoided 3,200kg CO₂ vs cells-dropped scenario · 1,420 customers protected', 'Decisioning', 'success'),
    log(28.0, 'narrator.draft_pir(incident=NET-INC-...-NYK-MAINS) → battery-replacement business case + battery-monitor predictive alert', 'Decisioning'),
    { atSec: 29, kind: 'resolve',   text: 'Service uninterrupted · customer-facing outage = 0s · MTT-Protect 14m (mode change applied) · 1,420 customers protected · 3,200kg CO₂ avoided · battery upgrade queued', category: 'Network', severity: 'success' },
  ],
};

export const scriptsByIncident: Record<string, IncidentScript> = {
  [manchesterScript.incidentId]: manchesterScript,
  [liverpoolScript.incidentId]: liverpoolScript,
  [leedsScript.incidentId]: leedsScript,
  [londonHssScript.incidentId]: londonHssScript,
  [simSwapScript.incidentId]: simSwapScript,
  [roamingPartnerScript.incidentId]: roamingPartnerScript,
  [massSimSwapScript.incidentId]: massSimSwapScript,
  [towerMainsScript.incidentId]: towerMainsScript,
};

export const scriptForIncident = (id: string): IncidentScript => scriptsByIncident[id] ?? manchesterScript;
