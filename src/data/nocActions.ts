export interface NocAction {
  id: string;
  title: string;
  detail: string;
  tier: 'T1' | 'T2' | 'T3';
  reversible: boolean;
  estImpact: string;
  runtimeSec: number;
  toolChain: string[];
  kpiEffect?: { mttrDelta?: number; slaDelta?: number; alarmsDelta?: number };
}

export const nocActions: NocAction[] = [
  {
    id: 'rebalance-cap',
    title: 'MLB intra-cluster + carrier-add (MAN-01)',
    detail: 'Offset −3dB on hot cell 234-15-90412-3 + activate secondary carrier band n1. Pre-approved playbook PB-RAN-MLB-002.',
    tier: 'T1',
    reversible: true,
    estImpact: '−22% drops · +61 Mbps DL · +35% capacity',
    runtimeSec: 18,
    toolChain: ['ran.apply_mlb', 'ran.activate_carrier', 'snowflake.verify_kpis'],
    kpiEffect: { mttrDelta: -2.1, alarmsDelta: -45 },
  },
  {
    id: 'open-snow',
    title: 'ServiceNow standard change',
    detail: 'Auto-draft change record CHG0012987 with full evidence pack (KPIs, alarms, similar past incidents, simulation results). CAB pre-approved (standard).',
    tier: 'T2',
    reversible: true,
    estImpact: 'Vendor SLA clock starts · audit trail',
    runtimeSec: 6,
    toolChain: ['servicenow.create_change', 'memory.attach_evidence'],
  },
  {
    id: 'rolling-restart',
    title: 'Rolling gNB restart (maintenance window)',
    detail: 'Restart affected gNBs sequentially during the 02:00–03:00 low-traffic window after fan-controller replacement.',
    tier: 'T2',
    reversible: false,
    estImpact: 'Clears stuck sessions · post-fan-replacement',
    runtimeSec: 12,
    toolChain: ['ran.schedule_restart', 'maintenance.window_lock'],
    kpiEffect: { slaDelta: -3 },
  },
  {
    id: 'notify-care',
    title: 'Notify Care orchestrator',
    detail: 'Push impacted P1 customer list to Care with pre-approved playbook PB-RT-CRED-005 (legal-cleared 2026-04-01).',
    tier: 'T1',
    reversible: true,
    estImpact: 'Pre-empts ~1.5k inbound contacts',
    runtimeSec: 4,
    toolChain: ['care.push_playbook', 'snowflake.customer_segment'],
  },
  {
    id: 'hss-flush',
    title: 'Flush HSS Diameter sessions (HSS-LDN-A)',
    detail: 'Flush idle Diameter sessions (>300s) on HSS-LDN-A and rate-limit P-CSCF re-reg attempts. T2 emergency change · CTO duty-officer approval.',
    tier: 'T2',
    reversible: false,
    estImpact: 'Frees ~620k sessions (54% of cap)',
    runtimeSec: 14,
    toolChain: ['hss.diameter_flush', 'pcscf.rate_limit', 'audit.log'],
  },
  {
    id: 'lsp-reroute',
    title: 'MPLS LSP reroute (LS-RING-2 → LS-RING-3)',
    detail: 'Reroute affected LSPs onto secondary ring · +18ms latency, no drops predicted. T2 reversible · transport CAB approval.',
    tier: 'T2',
    reversible: true,
    estImpact: '+18ms latency · 0 drops · 0 service breach',
    runtimeSec: 10,
    toolChain: ['transport.lsp_reroute', 'risk.estimate'],
  },
];
