export type AgentStage = 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify';

export interface AgentStep {
  stage: AgentStage;
  title: string;
  detail: string;
  toolCalls?: string[];
  evidence?: string[];
  confidence?: number;
  requiresApproval?: boolean;
  outcome?: 'pending' | 'approved' | 'auto' | 'denied';
  ts: string;
}

export interface AgentRun {
  id: string;
  incidentId: string;
  title: string;
  startedAt: string;
  closedAt?: string;
  status: 'live' | 'closed';
  mttrSeconds?: number;
  humanApprovals: number;
  outcome: string;
  steps: AgentStep[];
}

export const liveAgentRun: AgentRun = {
  id: 'AGT-LIVE-MAN-M14',
  incidentId: 'NET-INC-2026-0428-MAN-M14',
  title: 'Manchester M14 cluster congestion — agent run',
  startedAt: '09:31:18',
  status: 'live',
  humanApprovals: 1,
  outcome: 'In progress — MLB + carrier-add applied, watching 5-min KPI window',
  steps: [
    {
      stage: 'observe',
      title: 'Anomaly detected on cluster MAN-01',
      detail: 'PRB utilisation 96% sustained 90s on cell 234-15-90412-3 · Active UEs +180% · scheduler delay p95 4.8ms · GTP-U drops 0.9%.',
      toolCalls: ['snowflake.cell_kpis(window=15m)', 'snowflake.alarm_stream(cluster=MAN-01)', 'network_impact.customers_at_cells(7 cells)'],
      evidence: ['PRB 96%', 'DC rate +37%', '7 cells flagged', '2,417 customers'],
      confidence: 0.97,
      ts: '09:31:18',
    },
    {
      stage: 'hypothesize',
      title: 'Backhaul congestion + RAN cell overload',
      detail: 'Pattern matches 4 prior MAN-01 incidents (Apr-25, Jul-25, Nov-25, Feb-26). Backhaul circuit MAN-01-BH-2 packet loss 4.1% minutes prior. Vendor RAN telemetry confirms BBU scheduler saturation.',
      toolCalls: ['memory.similar_incidents(top=4)', 'snowflake.transport_loss(circuit=MAN-01-BH-2)', 'cortex.search.kb'],
      evidence: ['4 similar past', 'BH packet loss 4.1%', 'BBU saturation', 'No planned work'],
      confidence: 0.88,
      ts: '09:31:46',
    },
    {
      stage: 'plan',
      title: '3-step playbook proposed',
      detail: '(1) MLB intra-cluster: −3dB offset on cell 234-15-90412-3, target neighbour …-7. (2) Activate secondary carrier band n1. (3) ServiceNow standard change + Care orchestrator with PB-RT-CRED-005.',
      toolCalls: ['simulate.mlb_handover_offset(...)', 'simulate.add_secondary_carrier(...)', 'servicenow.draft_change(template=BH-CONGESTION)'],
      evidence: ['Sim: −22% drops', 'Sim: +61 Mbps DL', '+35% capacity', 'Blast radius: 2,417'],
      confidence: 0.91,
      ts: '09:32:02',
    },
    {
      stage: 'act',
      title: 'MLB + carrier-add — awaiting approval',
      detail: 'Bundled action ready (T1 reversible). Pre-approved playbook PB-RAN-MLB-002 covers offset + carrier activation. Auto-approve disabled for shared-RAN actions; awaiting NOC engineer.',
      toolCalls: ['ran.apply_mlb(cell=234-15-90412-3, offset=-3)', 'ran.activate_carrier(band=n1)'],
      evidence: ['Reversible in 60s', 'Pre-approved playbook', 'CAB-cleared (standard)'],
      requiresApproval: true,
      outcome: 'pending',
      confidence: 0.91,
      ts: '09:32:14',
    },
    {
      stage: 'verify',
      title: 'Verification window queued',
      detail: 'After execution, agent samples DL/DC/PRB for 5 min and rolls back if KPIs do not recover within 80% of baseline. Auto-rollback ready.',
      toolCalls: ['snowflake.cell_kpis(window=5m, watch=true)'],
      evidence: ['Auto-rollback threshold set', 'Watch every 30s'],
      confidence: 0.86,
      ts: '09:32:15',
    },
  ],
};

export const pastAgentRuns: AgentRun[] = [
  {
    id: 'AGT-2026-0507-LDN-E14',
    incidentId: 'NET-INC-2026-0507-LDN-E14',
    title: 'Canary Wharf 5G capacity at peak',
    startedAt: '2026-05-07 18:42',
    closedAt: '2026-05-07 18:48',
    status: 'closed',
    mttrSeconds: 360,
    humanApprovals: 0,
    outcome: 'Auto-rebalanced carrier aggregation; KPIs restored.',
    steps: [],
  },
  {
    id: 'AGT-2026-0506-BIR-B4',
    incidentId: 'NET-INC-2026-0506-BIR-B4',
    title: 'Digbeth 4G site soft-failure',
    startedAt: '2026-05-06 11:14',
    closedAt: '2026-05-06 11:23',
    status: 'closed',
    mttrSeconds: 540,
    humanApprovals: 1,
    outcome: 'Rolling restart on B4-A; verified clean.',
    steps: [],
  },
  {
    id: 'AGT-2026-0505-GLA-G12',
    incidentId: 'NET-INC-2026-0505-GLA-G12',
    title: 'Glasgow West End fibre flap',
    startedAt: '2026-05-05 03:02',
    closedAt: '2026-05-05 03:07',
    status: 'closed',
    mttrSeconds: 300,
    humanApprovals: 0,
    outcome: 'Auto-failover to redundant link; Openreach ticket raised.',
    steps: [],
  },
  {
    id: 'AGT-2026-0504-LIV-L1',
    incidentId: 'NET-INC-2026-0504-LIV-L1',
    title: 'Liverpool L1 backhaul jitter',
    startedAt: '2026-05-04 22:48',
    closedAt: '2026-05-04 22:59',
    status: 'closed',
    mttrSeconds: 660,
    humanApprovals: 1,
    outcome: 'Vendor change executed; jitter normalised.',
    steps: [],
  },
  {
    id: 'AGT-2026-0503-MAN-M1',
    incidentId: 'NET-INC-2026-0503-MAN-M1',
    title: 'Manchester city-centre 5G micro-outage',
    startedAt: '2026-05-03 12:11',
    closedAt: '2026-05-03 12:15',
    status: 'closed',
    mttrSeconds: 240,
    humanApprovals: 0,
    outcome: 'Self-healed via gNB warm restart.',
    steps: [],
  },
  {
    id: 'AGT-2026-0502-LDS-LS2',
    incidentId: 'NET-INC-2026-0502-LDS-LS2',
    title: 'Leeds LS2 IPRAN packet loss',
    startedAt: '2026-05-02 16:37',
    closedAt: '2026-05-02 16:55',
    status: 'closed',
    mttrSeconds: 1080,
    humanApprovals: 2,
    outcome: 'Manual reroute approved; vendor escalation.',
    steps: [],
  },
];
