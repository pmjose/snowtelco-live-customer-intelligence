// Agent / integration topology for the NOC orchestration view.

export type NodeKind = 'agent' | 'integration';
export type AgentRole = 'orchestrator' | 'detector' | 'reasoner' | 'planner' | 'approver' | 'executor' | 'verifier' | 'narrator';

export interface OrchNode {
  id: string;
  kind: NodeKind;
  label: string;
  sub?: string;
  // 0..1 normalized position on the canvas
  x: number;
  y: number;
  role?: AgentRole;
  // Which sequence stages activate this node (so it pulses/highlights)
  activeStages: Array<'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved'>;
  // Default purpose / current activity per stage
  activityByStage?: Partial<Record<'idle' | 'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved', string>>;
  toolCalls?: string[];
  vendor?: string;
}

export interface OrchEdge {
  id: string;
  from: string;
  to: string;
  // Stages during which this flow is active
  activeStages: Array<'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved'>;
  label?: string;
  curve?: number; // -1..1 bend
}

// Layout: orchestrator center; agents in inner ring; integrations on outer ring.
export const orchNodes: OrchNode[] = [
  {
    id: 'orchestrator',
    kind: 'agent', role: 'orchestrator', label: 'Orchestrator', sub: 'Cortex Agent',
    x: 0.5, y: 0.5,
    activeStages: ['detect', 'observe', 'hypothesize', 'plan', 'act', 'verify', 'resolved'],
    activityByStage: {
      idle: 'Awaiting trigger',
      detect: 'Routing detection signal',
      observe: 'Coordinating observation',
      hypothesize: 'Polling reasoner',
      plan: 'Compiling playbook',
      act: 'Dispatching actions',
      verify: 'Awaiting verification',
      resolved: 'Closing run',
    },
    toolCalls: ['agent.invoke', 'memory.fetch', 'memory.persist'],
  },
  // Inner agents (around orchestrator)
  { id: 'detector', kind: 'agent', role: 'detector', label: 'Detector', sub: 'Streaming anomaly model', x: 0.5, y: 0.18,
    activeStages: ['detect'],
    activityByStage: { idle: 'Listening to alarm bus', detect: 'Anomaly: RSRP -118dBm × 90s' },
    toolCalls: ['snowflake.alarm_stream', 'snowflake.cell_kpis'],
  },
  { id: 'reasoner', kind: 'agent', role: 'reasoner', label: 'Reasoner', sub: 'Cortex Analyst + RAG', x: 0.78, y: 0.30,
    activeStages: ['observe', 'hypothesize'],
    activityByStage: {
      observe: 'Pulling 7 cell KPIs · 47 alarms',
      hypothesize: 'Backhaul congestion + RAN overload (88%)',
    },
    toolCalls: ['cortex.analyst.text2sql', 'cortex.search.kb', 'memory.similar_incidents'],
  },
  { id: 'planner', kind: 'agent', role: 'planner', label: 'Planner', sub: 'Tool-using LLM', x: 0.85, y: 0.62,
    activeStages: ['plan'],
    activityByStage: { plan: '3-step playbook: Rebalance → ServiceNow → Care' },
    toolCalls: ['simulate.capacity_rebalance', 'risk.estimate', 'policy.guardrails'],
  },
  { id: 'approver', kind: 'agent', role: 'approver', label: 'Approver', sub: 'Human-in-the-loop', x: 0.65, y: 0.85,
    activeStages: ['plan', 'act'],
    activityByStage: { plan: 'Awaiting NOC engineer', act: 'T1 reversible · approved' },
    toolCalls: ['notify.slack', 'audit.log'],
  },
  { id: 'executor', kind: 'agent', role: 'executor', label: 'Executor', sub: 'Action runner', x: 0.35, y: 0.85,
    activeStages: ['act'],
    activityByStage: { act: 'Running 3 actions · 2 reversible' },
    toolCalls: ['ran.apply_rebalance', 'servicenow.create_change', 'care.push_playbook'],
  },
  { id: 'verifier', kind: 'agent', role: 'verifier', label: 'Verifier', sub: 'KPI watcher', x: 0.15, y: 0.62,
    activeStages: ['verify', 'resolved'],
    activityByStage: { verify: 'Watching 5-min KPI window', resolved: 'PASS — auto-rollback skipped' },
    toolCalls: ['snowflake.cell_kpis(watch=true)', 'sla.check'],
  },
  { id: 'narrator', kind: 'agent', role: 'narrator', label: 'Narrator', sub: 'Briefing writer', x: 0.22, y: 0.30,
    activeStages: ['detect', 'observe', 'hypothesize', 'plan', 'act', 'verify', 'resolved'],
    activityByStage: {
      detect: 'Drafting incident summary',
      resolved: 'Filing executive briefing',
    },
    toolCalls: ['cortex.complete', 'memory.append'],
  },

  // Integrations (outer ring)
  { id: 'snowflake', kind: 'integration', label: 'Snowflake', sub: 'Cell KPIs · Alarms · Memory', vendor: 'snowflake',
    x: 0.5, y: 0.04,
    activeStages: ['detect', 'observe', 'verify'],
    activityByStage: {
      idle: 'STREAMING ON',
      detect: 'Streaming detection query',
      observe: 'Returning 7 outliers',
      verify: 'Returning 5-min KPI window',
    },
    toolCalls: ['STREAM cell_kpi_alerts', 'AI_AGG(reasoning_text)', 'TIME_SLICE 5m'],
  },
  { id: 'servicenow', kind: 'integration', label: 'ServiceNow', sub: 'Change & Incident',
    x: 0.96, y: 0.50,
    activeStages: ['act'],
    activityByStage: { act: 'Drafted INC0012987 with evidence' },
    toolCalls: ['POST /now/change', 'POST /now/incident'],
  },
  { id: 'care', kind: 'integration', label: 'Care Orchestrator', sub: 'Salesforce + custom',
    x: 0.78, y: 0.96,
    activeStages: ['act'],
    activityByStage: { act: 'Pushed P1 playbook · 89 customers' },
    toolCalls: ['playbook.run', 'segment.upsert'],
  },
  { id: 'ran', kind: 'integration', label: 'RAN Controller', sub: 'Vendor RAN OAM',
    x: 0.22, y: 0.96,
    activeStages: ['act', 'verify'],
    activityByStage: { act: 'Rebalance MAN-02 → MAN-01', verify: 'Holding new config' },
    toolCalls: ['rebalance.apply', 'restart.schedule'],
  },
  { id: 'comms', kind: 'integration', label: 'Customer Comms', sub: 'SMS · App push',
    x: 0.04, y: 0.50,
    activeStages: ['act'],
    activityByStage: { act: 'Apology + £5 credit · 2,417 cust' },
    toolCalls: ['sms.send_batch', 'push.notify'],
  },
];

export const orchEdges: OrchEdge[] = [
  // Detection flow
  { id: 'e-sf-det', from: 'snowflake', to: 'detector', activeStages: ['detect'], label: 'cell_kpi_alerts' },
  { id: 'e-det-orch', from: 'detector', to: 'orchestrator', activeStages: ['detect'], label: 'incident.detected' },

  // Observation/Hypothesis
  { id: 'e-orch-rea', from: 'orchestrator', to: 'reasoner', activeStages: ['observe', 'hypothesize'], label: 'analyze' },
  { id: 'e-rea-sf', from: 'reasoner', to: 'snowflake', activeStages: ['observe'], label: 'cortex.text2sql' },
  { id: 'e-sf-rea', from: 'snowflake', to: 'reasoner', activeStages: ['observe'], label: 'rows + reasoning_text' },

  // Plan
  { id: 'e-orch-plan', from: 'orchestrator', to: 'planner', activeStages: ['plan'], label: 'playbook?' },
  { id: 'e-plan-app', from: 'planner', to: 'approver', activeStages: ['plan'], label: 'await approve (T1)' },

  // Act
  { id: 'e-app-orch', from: 'approver', to: 'orchestrator', activeStages: ['act'], label: 'approved' },
  { id: 'e-orch-exec', from: 'orchestrator', to: 'executor', activeStages: ['act'], label: 'execute' },
  { id: 'e-exec-ran', from: 'executor', to: 'ran', activeStages: ['act'], label: 'rebalance' },
  { id: 'e-exec-snow', from: 'executor', to: 'servicenow', activeStages: ['act'], label: 'open change' },
  { id: 'e-exec-care', from: 'executor', to: 'care', activeStages: ['act'], label: 'push playbook' },
  { id: 'e-care-comms', from: 'care', to: 'comms', activeStages: ['act'], label: 'comms' },

  // Verify
  { id: 'e-orch-ver', from: 'orchestrator', to: 'verifier', activeStages: ['verify'], label: 'verify' },
  { id: 'e-ver-sf', from: 'verifier', to: 'snowflake', activeStages: ['verify'], label: 'kpi window' },
  { id: 'e-sf-ver', from: 'snowflake', to: 'verifier', activeStages: ['verify'], label: 'PASS' },
  { id: 'e-ver-orch', from: 'verifier', to: 'orchestrator', activeStages: ['verify', 'resolved'], label: 'resolved' },

  // Narrator (always listening)
  { id: 'e-orch-nar', from: 'orchestrator', to: 'narrator', activeStages: ['detect', 'plan', 'verify', 'resolved'], label: 'narrate' },
];

export const nodeById = (id: string) => orchNodes.find((n) => n.id === id)!;
