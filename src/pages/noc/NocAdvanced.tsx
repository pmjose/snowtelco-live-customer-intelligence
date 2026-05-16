import { Link } from 'react-router-dom';
import { Calendar, GitBranch, Radio, Users, Phone, BookOpen, AlertTriangle, ShieldCheck, FileCog, Activity } from 'lucide-react';
import { BarChart, HBar, LineChart, Donut, Sparkline, Funnel } from '@/components/shared/Charts';
import { Treemap, ParetoChart, BandedLineChart, Histogram } from '@/pages/bss/BssExtended';
import { ModelCard, FeatureImportance, ConfidenceGauge } from '@/pages/oss/OssMl';
import { cn } from '@/lib/utils';

// ─── Shared chrome ─────────────────────────────────────────────────────────
function PageHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <header>
      <div className="text-[10px] uppercase tracking-wider font-bold text-vfRed">{kicker}</div>
      <h1 className="text-2xl font-extrabold text-ink leading-tight">{title}</h1>
      <p className="text-xs text-ink-muted">{subtitle}</p>
    </header>
  );
}
function Kpi({ label, value, delta, tone = 'neutral', unit }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral'; unit?: string }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</span>
        {unit && <span className="text-[10px] text-ink-muted">{unit}</span>}
      </div>
      {delta && <div className={cn('text-[10px] mt-0.5', toneCls)}>{delta}</div>}
    </div>
  );
}
function GoldChips({ chips }: { chips: string[] }) {
  return (
    <div className="vf-card p-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold mr-1">Lineage · gold</span>
      {chips.map((c) => (<span key={c} className="vf-chip bg-yellow-50 text-yellow-800 border border-yellow-200 font-mono text-[10px]">{c}</span>))}
      <Link to="/lineage" className="ml-auto text-[10px] text-vfRed font-bold inline-flex items-center gap-0.5 hover:underline">Open lineage <GitBranch className="w-3 h-3" /></Link>
    </div>
  );
}
function StandardsRow({ chips }: { chips: string[] }) {
  return (
    <div className="vf-card p-2.5 flex flex-wrap items-center gap-1.5">
      <FileCog className="w-3.5 h-3.5 text-vfRed" />
      <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold mr-1">Standards</span>
      {chips.map((c) => (<span key={c} className="vf-chip bg-mist text-ink-muted text-[10px]">{c}</span>))}
    </div>
  );
}
const KpiStripCls = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3';

// ════════════════════════════════════════════════════════════════════════════
// 1. /noc/mim — Major Incident Management · War-room
// ════════════════════════════════════════════════════════════════════════════
const icsRoles = [
  { role: 'Incident Commander', name: 'Sarah Khan', shift: 'Day',   on: true,  ext: '#noc-bridge-1' },
  { role: 'Operations Lead',    name: 'David Chen', shift: 'Day',   on: true,  ext: '#noc-bridge-1' },
  { role: 'Comms Lead',         name: 'Priya Patel', shift: 'Day',  on: true,  ext: '#noc-bridge-1' },
  { role: 'Liaison · BSS',      name: 'Tom Walsh',  shift: 'Day',   on: true,  ext: '#bss-dispute' },
  { role: 'SME · RAN',          name: 'Hiro Tanaka', shift: 'Day',  on: true,  ext: '#noc-ran' },
  { role: 'SME · Core/IMS',     name: 'Maria Lopez', shift: 'Day',  on: true,  ext: '#noc-core' },
  { role: 'Vendor · Ericsson',  name: 'O. Lindqvist', shift: 'Day', on: false, ext: 'CSC SR-44128' },
  { role: 'Exec sponsor · CTO', name: 'A. Rivera',  shift: 'Day',   on: true,  ext: 'on-bridge' },
];
const decisionLog = [
  { t: 'T+02m', who: 'IC',  decision: 'Open P1 bridge · NOC-MIM-2026-0413' },
  { t: 'T+04m', who: 'Ops', decision: 'Engage Ericsson SR-44128 · severity 1' },
  { t: 'T+06m', who: 'IC',  decision: 'Customer comms cadence: 15-min · status page LIVE' },
  { t: 'T+08m', who: 'Ops', decision: 'Auto-rollback CHG0013015 (Time Travel)' },
  { t: 'T+12m', who: 'IC',  decision: 'No customer SLA-credit triggered yet · monitor' },
  { t: 'T+18m', who: 'Ops', decision: 'KPIs verified within 5-min window · downgrade to P2' },
  { t: 'T+22m', who: 'IC',  decision: 'Bridge closed · PIR draft auto-started' },
];
export function NocMim() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Major Incident Management (MIM)" title="War-room · ICS bridge · 15-min comms cadence" subtitle="P1 incident escalation distinct from regular queue. ICS-201 roles · decision log · auto-PIR draft. Aligned to Ofcom GC A3 + NIS2." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active P1 bridges" value="1" tone="bad" delta="NOC-MIM-2026-0413" />
        <Kpi label="On bridge" value="14" delta="incl. Ericsson + CTO" />
        <Kpi label="Time on bridge" value="22m" tone="warn" />
        <Kpi label="Comms cadence" value="15 min" delta="status page live" tone="good" />
        <Kpi label="Customer impact" value="184k" delta="MAN-M14 cluster" tone="warn" />
        <Kpi label="MIM (rolling 30d)" value="6" delta="MTTR 38 min" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="vf-card p-3 lg:col-span-2 overflow-x-auto">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">ICS-201 roster · NOC-MIM-2026-0413</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr className="text-left"><th className="py-1.5 px-2">Role</th><th className="py-1.5 px-2">Name</th><th className="py-1.5 px-2">Shift</th><th className="py-1.5 px-2">On bridge</th><th className="py-1.5 px-2">Channel</th></tr>
            </thead>
            <tbody>
              {icsRoles.map((r) => (
                <tr key={r.role} className="border-b border-mist-dark/60">
                  <td className="py-1.5 px-2 font-bold text-ink">{r.role}</td>
                  <td className="py-1.5 px-2">{r.name}</td>
                  <td className="py-1.5 px-2 text-ink-muted">{r.shift}</td>
                  <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', r.on ? 'bg-emerald-100 text-emerald-700' : 'bg-mist text-ink-muted')}>{r.on ? 'ON' : 'pending'}</span></td>
                  <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{r.ext}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Decision log · timestamped</div>
          <ul className="text-[11.5px] space-y-1.5">
            {decisionLog.map((d) => (
              <li key={d.t} className="flex gap-2"><span className="font-mono text-vfRed shrink-0 w-12">{d.t}</span><span className="text-ink-muted shrink-0 w-8">{d.who}</span><span className="text-ink">{d.decision}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <ModelCard m={{ name: 'mim_severity_v2', version: '2.1', metric: 'precision 0.94', drift: 'stable', refreshed: '6m ago', owner: 'NOC-MIM', blurb: 'Auto-classifies P1 vs P2 within 90 sec of detection · auto-pages IC + opens bridge.' }} />
      <GoldChips chips={['gold.mim_bridges', 'gold.decision_log', 'gold.comms_cadence', 'silver.escalation_tree']} />
      <StandardsRow chips={['ICS-201 (FEMA)', 'ITIL v4 · Major Incident', 'Ofcom GC A3', 'NIS2 · Article 23 incident', 'ISO 22301 BCM']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. /noc/wallboard — NOC Wallboard
// ════════════════════════════════════════════════════════════════════════════
export function NocWallboard() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Wallboard" title="Live wallboard · the front-of-room screen" subtitle="High-contrast aggregate health · MTTD / MTTA / MTTR rolling · customer-impact counter · last-24h ribbon. Designed for the NOC big screen." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="P1 active" value="1" tone="bad" />
        <Kpi label="P2 active" value="4" tone="warn" />
        <Kpi label="P3 active" value="38" />
        <Kpi label="MTTD (24h)" value="22 sec" tone="good" />
        <Kpi label="MTTA (24h)" value="48 sec" tone="good" />
        <Kpi label="MTTR (24h)" value="14 min" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Customer impact · live</div>
          <div className="text-3xl font-extrabold text-vfRed font-mono tabular-nums">184k</div>
          <div className="text-[11px] text-ink-muted mt-0.5">MAN-M14 cluster · 38 cells degraded · est. £24k/hr risk</div>
          <Sparkline data={[42,46,52,68,84,92,142,178,184,184,182,178]} color="#dc2626" height={56} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Domain health</div>
          <Donut data={[{ label: 'OK', value: 18420, color: '#10b981' }, { label: 'Watch', value: 412, color: '#f59e0b' }, { label: 'Degraded', value: 84, color: '#dc2626' }, { label: 'Down', value: 12, color: '#7f1d1d' }]} formatter={(v) => v.toLocaleString()} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Last 24h ribbon</div>
          <ul className="text-[11px] space-y-1">
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-12">14:22</span><span className="text-vfRed">P1 opened — MAN-M14 cluster</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-12">11:08</span><span className="text-amber-700">CHG0013015 push (RRC v124)</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-12">09:42</span><span className="text-emerald-700">P2 closed · IMS Cx storm contained</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-12">06:15</span><span className="text-ink-muted">Shift handover Day → Day</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-12">03:48</span><span className="text-emerald-700">P3 auto-resolved · battery_eol_v2</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-12">01:24</span><span className="text-amber-700">Vendor SR-44128 raised · Ericsson</span></li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">MTTR · last 14 days · minutes</div>
          <BarChart data={Array.from({ length: 14 }, (_, i) => ({ label: `D-${14 - i}`, value: [22,18,24,16,12,14,20,18,12,10,14,12,16,14][i] }))} color="#dc2626" />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Auto-resolve % · 12 weeks</div>
          <LineChart height={140} series={[{ name: 'Auto %', data: [68,72,74,76,78,79,81,82,84,85,86,88] }]} labels={['W-12','W-11','W-10','W-9','W-8','W-7','W-6','W-5','W-4','W-3','W-2','Now']} colors={['#10b981']} />
        </div>
      </div>
      <GoldChips chips={['gold.noc_health', 'gold.mttr', 'silver.alarm_stream', 'gold.customer_impact']} />
      <StandardsRow chips={['ITIL v4 · Service Operation', 'Google SRE · MTTx', 'TMF 681', 'Ofcom GC A3 reporting']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. /noc/runbooks — Run-book / Playbook Library
// ════════════════════════════════════════════════════════════════════════════
const runbooks = [
  { id: 'RB-RAN-0142', title: 'gNB thermal alarm > 75°C',          domain: 'RAN',     ver: 'v3.2', uses: 1240, ftf: 0.94, mtl: '4m 12s' },
  { id: 'RB-RAN-0214', title: 'Cell PRB > 92% sustained',           domain: 'RAN',     ver: 'v2.8', uses: 880,  ftf: 0.91, mtl: '6m 02s' },
  { id: 'RB-IMS-0042', title: 'P-CSCF Cx interface storm',          domain: 'IMS',     ver: 'v4.1', uses: 412,  ftf: 0.96, mtl: '3m 38s' },
  { id: 'RB-CORE-018', title: 'UPF session-establish failure',      domain: 'Core',    ver: 'v2.4', uses: 322,  ftf: 0.92, mtl: '5m 14s' },
  { id: 'RB-TX-0061',  title: 'PE backbone link flap',              domain: 'Transport', ver: 'v1.9', uses: 268,  ftf: 0.88, mtl: '7m 24s' },
  { id: 'RB-ROAM-09',  title: 'Roaming partner SoR steering',       domain: 'Roaming', ver: 'v1.4', uses: 142,  ftf: 0.93, mtl: '4m 56s' },
  { id: 'RB-CHG-007',  title: 'CHG rollback via Time Travel',       domain: 'Change',  ver: 'v2.1', uses: 38,   ftf: 0.99, mtl: '3m 52s' },
];
export function NocRunbooks() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Runbook Library" title="Searchable SOPs · ML-suggested next runbook" subtitle="≈ 800 versioned runbooks across RAN / Core / IMS / Transport / Roaming. ML-suggests next runbook based on alarm signature." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Runbooks" value="824" />
        <Kpi label="Auto-suggested (24h)" value="412" delta="ML-routed" tone="good" />
        <Kpi label="First-time-fix" value="92%" tone="good" />
        <Kpi label="Versions in flight" value="38" delta="under review" tone="warn" />
        <Kpi label="Avg time-to-execute" value="4m 38s" tone="good" />
        <Kpi label="Authors" value="42" delta="across 8 squads" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">ID</th><th className="py-1.5 px-2">Title</th><th className="py-1.5 px-2">Domain</th><th className="py-1.5 px-2">Ver</th><th className="py-1.5 px-2 text-right">Uses (90d)</th><th className="py-1.5 px-2 text-right">FTF</th><th className="py-1.5 px-2 text-right">MTL</th></tr>
          </thead>
          <tbody>
            {runbooks.map((r) => (
              <tr key={r.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{r.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{r.title}</td>
                <td className="py-1.5 px-2"><span className="vf-chip bg-mist text-ink-muted text-[10px]">{r.domain}</span></td>
                <td className="py-1.5 px-2 text-ink-muted font-mono">{r.ver}</td>
                <td className="py-1.5 px-2 text-right font-mono">{r.uses.toLocaleString()}</td>
                <td className="py-1.5 px-2 text-right font-mono text-emerald-700">{(r.ftf * 100).toFixed(0)}%</td>
                <td className="py-1.5 px-2 text-right font-mono">{r.mtl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'runbook_recommend_v3', version: '3.2', metric: 'top-1 acc 91%', drift: 'stable', refreshed: '12m ago', owner: 'NOC-Run', blurb: 'Recommends next runbook from alarm signature + topology context · feeds NOC agent.' }} />
        <FeatureImportance title="Recommendation drivers" features={[{ label: 'Alarm class', value: 0.34 }, { label: 'Topology context', value: 0.22 }, { label: 'Time-of-day', value: 0.13 }, { label: 'Vendor / NF', value: 0.12 }, { label: 'Recent changes', value: 0.11 }, { label: 'Customer impact', value: 0.08 }]} modelHint="runbook_recommend_v3" />
      </div>
      <GoldChips chips={['platinum.runbooks', 'gold.runbook_executions', 'gold.ftf_per_runbook', 'silver.runbook_versions']} />
      <StandardsRow chips={['ITIL v4 · Knowledge Mgmt', 'ISO 20000', 'TMF 681', 'NIST CSF']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. /noc/shift — Shift Handoff & On-Call
// ════════════════════════════════════════════════════════════════════════════
const shiftRota = [
  { name: 'Sarah Khan',    role: 'Shift Lead', shift: 'Day · 06-18', site: 'Newbury HQ', fatigue: 0.18 },
  { name: 'David Chen',    role: 'Ops',        shift: 'Day · 06-18', site: 'Newbury HQ', fatigue: 0.22 },
  { name: 'Priya Patel',   role: 'Comms',      shift: 'Day · 06-18', site: 'Newbury HQ', fatigue: 0.14 },
  { name: 'Hiro Tanaka',   role: 'SME · RAN',  shift: 'Day · 06-18', site: 'Tokyo BCP',  fatigue: 0.42 },
  { name: 'Marie Dubois',  role: 'Shift Lead', shift: 'Night · 18-06', site: 'Newbury HQ', fatigue: 0.30 },
  { name: 'Carlos Rivera', role: 'Ops',        shift: 'Night · 18-06', site: 'Madrid BCP', fatigue: 0.36 },
  { name: 'Liu Wei',       role: 'SME · Core', shift: 'Night · 18-06', site: 'Singapore BCP', fatigue: 0.24 },
];
export function NocShift() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Shift & On-Call" title="Shift handover · follow-the-sun rota" subtitle="Current shift · handover briefing · ICS escalation tree · fatigue tracker. 24×7 follow-the-sun across Newbury / Madrid / Tokyo / Singapore." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Current shift" value="Day" delta="06:00 → 18:00 BST" />
        <Kpi label="On-duty" value="14" delta="across 4 sites" tone="good" />
        <Kpi label="On-call backup" value="6" delta="P1 escalation" />
        <Kpi label="Avg fatigue" value="0.27" delta="< 0.40 threshold" tone="good" />
        <Kpi label="Handover SLA" value="100%" delta="last 30d" tone="good" />
        <Kpi label="OOH callouts (30d)" value="14" tone="warn" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Live rota · who's on now</div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">Name</th><th className="py-1.5 px-2">Role</th><th className="py-1.5 px-2">Shift</th><th className="py-1.5 px-2">Site</th><th className="py-1.5 px-2 text-right">Fatigue</th></tr>
          </thead>
          <tbody>
            {shiftRota.map((p) => (
              <tr key={p.name} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-bold text-ink">{p.name}</td>
                <td className="py-1.5 px-2">{p.role}</td>
                <td className="py-1.5 px-2 text-ink-muted">{p.shift}</td>
                <td className="py-1.5 px-2 text-ink-muted">{p.site}</td>
                <td className={cn('py-1.5 px-2 text-right font-mono font-bold', p.fatigue > 0.40 ? 'text-vfRed' : p.fatigue > 0.30 ? 'text-amber-700' : 'text-emerald-700')}>{p.fatigue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Last handover · 06:00 BST</div>
          <ul className="text-[11.5px] space-y-1">
            <li>· Carry-over: 1× P1 (NOC-MIM-2026-0413 · MAN-M14 cluster) — Sarah taking IC</li>
            <li>· 2× P2 in flight: IMS Cx storm (warm), roaming-steering (resolved overnight)</li>
            <li>· CHG window: CHG0013027 capex Manchester M14 · 02:00-04:00 tomorrow</li>
            <li>· Watch: vendor-A CSC SR-44128 · Ericsson · 4h response SLA</li>
            <li>· Risk: Q3 PRB headroom &lt; 8% in 6 sites · capacity_forecast_v2 alert</li>
          </ul>
        </div>
        <ModelCard m={{ name: 'fatigue_predict_v1', version: '1.2', metric: 'AUROC 0.84', drift: 'stable', refreshed: '4m ago', owner: 'NOC-People', blurb: 'Predicts fatigue 4-6h ahead from on-call density + sleep proxies (consensual). Auto-suggests rota swap.' }} />
      </div>
      <GoldChips chips={['gold.shift_rota', 'gold.handover_briefings', 'gold.escalation_tree', 'silver.oncall_paging']} />
      <StandardsRow chips={['ICS-209 · Sit Report', 'ITIL v4', 'EU Working Time Directive', 'GDPR Art.6 · consent', 'ISO 22301']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. /noc/customer-impact — Customer Impact Heatmap
// ════════════════════════════════════════════════════════════════════════════
export function NocCustomerImpact() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Customer Impact" title="Live customer-impact heatmap" subtitle="Impacted customer count · MRR at risk · B2B SLA-breach watchlist · feeds BSS dispute desk pre-emptively." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Impacted (live)" value="184k" tone="bad" delta="MAN-M14" />
        <Kpi label="MRR at risk" value="£612k" tone="warn" />
        <Kpi label="B2B SLA breach risk" value="14" delta="of 412 watched" tone="warn" />
        <Kpi label="Auto-credit triggers" value="0" tone="good" />
        <Kpi label="Status page subscribers" value="22.4k" delta="auto-notified" />
        <Kpi label="Avg notify lag" value="42 sec" tone="good" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Impacted by region</div>
          <HBar data={[{ label: 'Manchester · NW', value: 142, sub: '77%' }, { label: 'Liverpool · NW', value: 22, sub: '12%' }, { label: 'Leeds · Y&H', value: 14, sub: '8%' }, { label: 'Other', value: 6, sub: '3%' }]} color="#dc2626" formatter={(v) => `${v}k`} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top B2B contracts at risk</div>
          <Treemap items={[{ label: 'Lloyds · 280 branches', value: 480, margin: 0.55 }, { label: 'Barclays · trading floor', value: 380, margin: 0.62 }, { label: 'NHS Manchester', value: 240, margin: 0.50 }, { label: 'TfL · IoT', value: 180, margin: 0.45 }, { label: 'Tesco · in-store FWA', value: 120, margin: 0.40 }, { label: 'Other', value: 280, margin: 0.42 }]} />
        </div>
      </div>
      <ModelCard m={{ name: 'impact_predict_v2', version: '2.4', metric: 'MAPE 6%', drift: 'stable', refreshed: '2m ago', owner: 'NOC-Impact', blurb: 'Predicts customer impact within 60 sec of P1 detection · joins gold.cell_kpis × silver.subs_geo × gold.b2b_contracts.' }} />
      <GoldChips chips={['gold.customer_impact', 'gold.mrr_at_risk', 'gold.b2b_contracts', 'silver.subs_geo']} />
      <StandardsRow chips={['Ofcom GC C1 · QoS', 'TMF 921 · SLA', 'GDPR Art.34', 'NIS2 · Article 23']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. /noc/status-page — Status page / Public outage register
// ════════════════════════════════════════════════════════════════════════════
const statusRows = [
  { service: 'Mobile Voice',   state: 'Operational',  since: '24d',  detail: 'All UK regions normal' },
  { service: 'Mobile Data 4G', state: 'Operational',  since: '24d',  detail: 'All UK regions normal' },
  { service: 'Mobile Data 5G', state: 'Degraded · NW', since: '14m', detail: 'Manchester M14 cluster · investigating · ETA 30m' },
  { service: 'SMS / RCS',      state: 'Operational',  since: '24d',  detail: '—' },
  { service: 'Roaming · EU',   state: 'Operational',  since: '24d',  detail: '—' },
  { service: 'eSIM activation',state: 'Operational',  since: '8d',   detail: '—' },
  { service: 'My SnowTelco app', state: 'Operational', since: '24d', detail: '—' },
  { service: 'B2B Wholesale APIs', state: 'Operational', since: '24d', detail: 'TMF Open APIs healthy' },
];
export function NocStatusPage() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Status Page · Public outage register" title="status.SnowTelco.co.uk · auto-published" subtitle="Auto-drafted comms · Cortex Complete on platinum.outage_history · Ofcom GC A3 30-day report draft." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Subscribers" value="22.4k" delta="status.SnowTelco.co.uk" />
        <Kpi label="Active incidents" value="1" tone="warn" />
        <Kpi label="Comms cadence" value="15 min" tone="good" />
        <Kpi label="Avg publish lag" value="42 sec" tone="good" />
        <Kpi label="Ofcom GC A3 reports (12m)" value="14" delta="all on time" tone="good" />
        <Kpi label="Public outages (30d)" value="3" delta="−2 vs baseline" tone="good" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">Service</th><th className="py-1.5 px-2">State</th><th className="py-1.5 px-2">Since</th><th className="py-1.5 px-2">Detail</th></tr>
          </thead>
          <tbody>
            {statusRows.map((s) => (
              <tr key={s.service} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-bold text-ink">{s.service}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', s.state.startsWith('Operational') ? 'bg-emerald-100 text-emerald-700' : s.state.startsWith('Degraded') ? 'bg-amber/30 text-amber-900' : 'bg-vfRed text-white')}>{s.state}</span></td>
                <td className="py-1.5 px-2 font-mono text-ink-muted">{s.since}</td>
                <td className="py-1.5 px-2 text-ink-muted">{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'comms_drafter_v2', version: '2.4', metric: 'human-edit rate 6%', drift: 'stable', refreshed: '12m ago', owner: 'NOC-Comms', blurb: 'Cortex-Complete drafts status updates + Ofcom GC A3 30-day report from incident timeline + decision log.' }} />
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Ofcom GC A3 30-day report queue</div>
          <ul className="text-[11.5px] space-y-1">
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 14 of 14 reports submitted on time (last 12 months)</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Auto-drafted within 6 hours · human-edited · counter-signed by IC</li>
            <li className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 1 in flight: NOC-MIM-2026-0413 · due in 28 days</li>
          </ul>
        </div>
      </div>
      <GoldChips chips={['platinum.outage_history', 'gold.status_publishes', 'gold.gc_a3_reports', 'silver.subscribers']} />
      <StandardsRow chips={['Ofcom GC A3 · 30-day report', 'NIS2 · Article 23', 'GDPR Art.34', 'ISO 22301']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. /noc/vendor-escalation — Vendor Escalation Desk
// ════════════════════════════════════════════════════════════════════════════
const vendorCases = [
  { id: 'SR-44128',  vendor: 'Ericsson', sev: 'Sev 1', subject: 'gNB-MAN-M14-* RRC config v124 regression', age: '22m', sla: '4h', state: 'Engaged' },
  { id: 'CR-019842', vendor: 'Nokia',    sev: 'Sev 2', subject: 'ReefShark CNF · auto-scale flap',         age: '3h 14m', sla: '8h', state: 'Engaged' },
  { id: 'TAC-883712',vendor: 'Cisco',    sev: 'Sev 2', subject: 'PE-LDN-1 BGP flap · sustained',           age: '6h 02m', sla: '8h', state: 'Engineer' },
  { id: 'SR-9982',   vendor: 'Mavenir',  sev: 'Sev 3', subject: 'IMS · P-CSCF Cx storm pattern',           age: '1d 4h', sla: '24h', state: 'Engineer' },
  { id: 'CR-SAM-44', vendor: 'Samsung',  sev: 'Sev 3', subject: 'CW-LDN-O2 CW flag · degraded since DR',   age: '2d 6h', sla: '48h', state: 'Pending' },
];
export function NocVendor() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Vendor Escalation Desk" title="Open vendor cases · response SLA tracking" subtitle="Ericsson SR · Nokia CR · Cisco TAC · Mavenir · Samsung. Per-vendor response history feeds vendor scorecard + commercial QBR." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Open cases" value={`${vendorCases.length}`} />
        <Kpi label="Sev 1 active" value="1" tone="bad" />
        <Kpi label="Avg response (Sev 1)" value="42 min" delta="SLA 60m · OK" tone="good" />
        <Kpi label="Avg time-to-fix" value="4h 12m" delta="across 90d" />
        <Kpi label="Vendor SLA breaches (30d)" value="2" tone="warn" />
        <Kpi label="Penalties recovered" value="£18.4k" delta="vs SLA credit" tone="good" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">Case</th><th className="py-1.5 px-2">Vendor</th><th className="py-1.5 px-2">Sev</th><th className="py-1.5 px-2">Subject</th><th className="py-1.5 px-2">Age</th><th className="py-1.5 px-2">SLA</th><th className="py-1.5 px-2">State</th></tr>
          </thead>
          <tbody>
            {vendorCases.map((c) => (
              <tr key={c.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{c.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{c.vendor}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', c.sev.includes('1') ? 'bg-vfRed text-white' : c.sev.includes('2') ? 'bg-amber/30 text-amber-900' : 'bg-mist text-ink-muted')}>{c.sev}</span></td>
                <td className="py-1.5 px-2 text-ink-muted">{c.subject}</td>
                <td className="py-1.5 px-2 font-mono text-ink-muted">{c.age}</td>
                <td className="py-1.5 px-2 font-mono">{c.sla}</td>
                <td className="py-1.5 px-2"><span className="vf-chip bg-mist text-ink-muted text-[10px]">{c.state}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ParetoChart items={[{ label: 'Ericsson · RRC regressions', value: 38 }, { label: 'Nokia · CNF autoscale', value: 22 }, { label: 'Cisco · BGP / transport', value: 16 }, { label: 'Mavenir · IMS', value: 12 }, { label: 'Samsung · O-RAN', value: 8 }, { label: 'Other', value: 4 }]} />
      <GoldChips chips={['gold.vendor_cases', 'gold.vendor_scorecard', 'gold.partner_settlements', 'silver.vendor_response']} />
      <StandardsRow chips={['ITIL v4 · Supplier Mgmt', 'TMF 648 · Quote', 'TMF 622', 'ISO 9001 · vendor SLA']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. /noc/pir — Post-Incident Review (PIR)
// ════════════════════════════════════════════════════════════════════════════
const pirs = [
  { id: 'PIR-2026-0413', incident: 'NOC-MIM-2026-0413 · MAN-M14 cluster', status: 'Draft', mttr: '38m', actions: 6, owner: 'Sarah Khan' },
  { id: 'PIR-2026-0398', incident: 'IMS Cx storm · 14 cells', status: 'Closed', mttr: '24m', actions: 4, owner: 'David Chen' },
  { id: 'PIR-2026-0382', incident: 'Roaming-steering ES partner', status: 'Closed', mttr: '52m', actions: 8, owner: 'Marie Dubois' },
  { id: 'PIR-2026-0364', incident: 'CHG0013004 · failed push', status: 'Closed', mttr: '12m', actions: 3, owner: 'Carlos Rivera' },
  { id: 'PIR-2026-0341', incident: 'PE-LDN-1 BGP flap', status: 'Closed', mttr: '1h 04m', actions: 7, owner: 'David Chen' },
];
export function NocPir() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Post-Incident Review (PIR)" title="RCA · 5-Whys · action register" subtitle="Auto-drafted PIR for every P1/P2 within 6h. NIS2 + Ofcom GC A3 reporting workflow. Cortex Complete RCA narrative on incident timeline." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="PIRs in flight" value="3" tone="warn" />
        <Kpi label="Closed (90d)" value="42" tone="good" />
        <Kpi label="Avg actions / PIR" value="5.4" />
        <Kpi label="Action close-out rate" value="92%" delta="within agreed date" tone="good" />
        <Kpi label="Auto-RCA hit-rate" value="78%" delta="LLM-drafted" tone="good" />
        <Kpi label="Avg cycle time" value="3.2 days" delta="down 2.1d" tone="good" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">PIR ID</th><th className="py-1.5 px-2">Incident</th><th className="py-1.5 px-2">Status</th><th className="py-1.5 px-2">MTTR</th><th className="py-1.5 px-2 text-right">Actions</th><th className="py-1.5 px-2">Owner</th></tr>
          </thead>
          <tbody>
            {pirs.map((p) => (
              <tr key={p.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{p.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{p.incident}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', p.status === 'Draft' ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}>{p.status}</span></td>
                <td className="py-1.5 px-2 font-mono">{p.mttr}</td>
                <td className="py-1.5 px-2 text-right font-mono">{p.actions}</td>
                <td className="py-1.5 px-2 text-ink-muted">{p.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ParetoChart items={[{ label: 'Vendor regression', value: 38 }, { label: 'Capacity / load', value: 22 }, { label: 'Change-induced', value: 14 }, { label: 'Hardware fault', value: 12 }, { label: 'Process / human', value: 8 }, { label: 'Other', value: 6 }]} />
      <ModelCard m={{ name: 'rca_narrative_v2', version: '2.3', metric: 'human-edit rate 22%', drift: 'stable', refreshed: '8m ago', owner: 'NOC-PIR', blurb: 'Cortex Complete drafts RCA narrative · 5-Whys + action register · cites timeline events.' }} />
      <GoldChips chips={['gold.pir_register', 'gold.pir_actions', 'gold.rca_categories', 'silver.incident_timeline']} />
      <StandardsRow chips={['ITIL v4 · Problem Mgmt', 'NIS2 · Art 23 final report', 'Ofcom GC A3', 'ISO 22301']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. /noc/synthetic — Synthetic monitoring / Probes
// ════════════════════════════════════════════════════════════════════════════
export function NocSynthetic() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Synthetic Monitoring · Probes" title="Active probes · drive-test · voice-test · IMS reg" subtitle="Active synthetic transactions distinct from PM/FM passive counters. Drive-test (Polystar) · IoT probe agents · voice test calls · IMS REGISTER." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Probe agents" value="2,418" delta="UK-wide" />
        <Kpi label="Drive-test fleet" value="42" delta="cars + drones" />
        <Kpi label="Tests / minute" value="14.2k" />
        <Kpi label="Pass rate" value="99.4%" tone="good" />
        <Kpi label="Drift detected" value="6" delta="cells flagged" tone="warn" />
        <Kpi label="DT-driven SON actions (24h)" value="38" tone="good" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Probe types · last 24h</div>
          <Donut data={[{ label: 'IMS REGISTER',  value: 4200, color: '#1d4ed8' }, { label: 'Voice-test call',  value: 2400, color: '#3b82f6' }, { label: 'Data throughput', value: 3800, color: '#10b981' }, { label: 'SMS / RCS', value: 1200, color: '#f59e0b' }, { label: 'Drive-test fixes', value: 800, color: '#dc2626' }, { label: 'IoT keepalive', value: 1800, color: '#8b5cf6' }]} formatter={(v) => v.toLocaleString()} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Voice-test P95 setup time · 12 weeks · sec</div>
          <BandedLineChart data={[1.4,1.5,1.4,1.3,1.2,1.2,1.1,1.0,1.1,1.0,1.0,0.9]} bands={[{ color: '#10b981', min: 0.5, max: 1.6 }]} label="target < 1.5s" />
        </div>
      </div>
      <ModelCard m={{ name: 'drift_detect_v2', version: '2.1', metric: 'F1 0.92', drift: 'stable', refreshed: '6m ago', owner: 'NOC-Probes', blurb: 'Detects probe-result drift before customer-visible degradation · feeds SON + NOC queue.' }} />
      <GoldChips chips={['gold.probe_results', 'silver.drive_test', 'silver.voice_tests', 'gold.synthetic_pass_rate']} />
      <StandardsRow chips={['3GPP TS 32.401 PM', 'Ofcom QoS · Code', 'ETSI TR 103 559', 'ITU-T G.107']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 10. /noc/resilience — Resilience · Chaos · DR Drill
// ════════════════════════════════════════════════════════════════════════════
export function NocResilience() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Resilience · Chaos · DR" title="Failover · chaos engineering · DR drills" subtitle="Last failover · chaos schedule · DR test calendar · RPO/RTO compliance. Aligned to ISO 22301 BCM + NIS2 resilience." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Last DR test" value="14d ago" delta="quarterly cadence" tone="good" />
        <Kpi label="DR drills passed (12m)" value="4 / 4" tone="good" />
        <Kpi label="RPO compliance" value="100%" delta="< 15 min" tone="good" />
        <Kpi label="RTO compliance" value="98%" delta="< 4h" tone="good" />
        <Kpi label="Chaos GD runs (30d)" value="42" delta="across 18 services" />
        <Kpi label="Findings → fixed" value="38 / 42" tone="good" />
      </div>
      <Funnel stages={[{ label: 'Chaos GD scheduled', value: 42, tone: 'good' }, { label: 'Executed in stage', value: 42, tone: 'good' }, { label: 'Findings raised', value: 24, tone: 'warn' }, { label: 'Fixed within agreed date', value: 22, tone: 'good' }, { label: 'Tracked to platinum.chaos_findings', value: 22, tone: 'good' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Upcoming DR / chaos calendar</div>
          <ul className="text-[11.5px] space-y-1">
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-24">Tue 09:00</span><span>UPF DR drill · Manchester ↔ Birmingham failover</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-24">Wed 14:00</span><span>Chaos · IMS P-CSCF random pod kill (10%)</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-24">Fri 02:00</span><span>BGP convergence test · PE-LDN-1 admin-down</span></li>
            <li className="flex items-baseline gap-2"><span className="font-mono text-ink-muted w-24">Sun 04:00</span><span>Snowflake replication failover drill (Time Travel)</span></li>
          </ul>
        </div>
        <ModelCard m={{ name: 'chaos_blast_v1', version: '1.4', metric: 'reward 0.81', drift: 'stable', refreshed: '4m ago', owner: 'NOC-Resilience', blurb: 'RL agent picks chaos experiments by predicted blast radius vs learning value. Stays inside guardrails.' }} />
      </div>
      <GoldChips chips={['gold.dr_drills', 'platinum.chaos_findings', 'gold.failover_log', 'silver.rto_rpo']} />
      <StandardsRow chips={['ISO 22301 · BCM', 'NIS2 · resilience', 'Ofcom · resilience guidance', 'NIST CSF · RC.RP', 'CNCF · Chaos Eng']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11. /noc/csirt — CSIRT bridge / Cyber response
// ════════════════════════════════════════════════════════════════════════════
export function NocCsirt() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · CSIRT · Cyber response" title="DDoS · scrubbing · NIS2 cyber escalation" subtitle="Distinct from operational P1 — DDoS / volumetric / signalling abuse. Scrubbing-centre status · ANS/IPACL · NIS2 reporting." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active CSIRT incidents" value="0" tone="good" />
        <Kpi label="DDoS attacks blocked (30d)" value="412" delta="auto-scrubbed" tone="good" />
        <Kpi label="Peak attack" value="1.2 Tbps" delta="last week" tone="warn" />
        <Kpi label="Scrubbing utilisation" value="38%" />
        <Kpi label="NIS2 reports (12m)" value="2" delta="all on time" tone="good" />
        <Kpi label="Mean time to scrub" value="14 sec" tone="good" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Attack mix · last 30 days</div>
          <Donut data={[{ label: 'Volumetric (UDP/SYN)', value: 240, color: '#dc2626' }, { label: 'Reflection / amplif.', value: 84, color: '#f59e0b' }, { label: 'Application L7', value: 56, color: '#1d4ed8' }, { label: 'Signalling / SS7', value: 22, color: '#8b5cf6' }, { label: 'Other', value: 10, color: '#94a3b8' }]} formatter={(v) => `${v}`} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Attack peak history · 14 days · Gbps</div>
          <BarChart data={Array.from({ length: 14 }, (_, i) => ({ label: `D-${14 - i}`, value: [180, 220, 180, 240, 320, 480, 1200, 280, 160, 140, 200, 240, 180, 160][i] }))} color="#dc2626" />
        </div>
      </div>
      <ModelCard m={{ name: 'ddos_classifier_v3', version: '3.2', metric: 'F1 0.96', drift: 'stable', refreshed: '4m ago', owner: 'NOC-CSIRT', blurb: 'Classifies DDoS attack class within 5 sec · auto-routes to scrubbing centre · feeds NIS2 reporting.' }} />
      <GoldChips chips={['gold.ddos_events', 'gold.scrub_centre', 'gold.nis2_reports', 'silver.netflow']} />
      <StandardsRow chips={['NIS2 · Article 23 cyber', 'Ofcom · TSR (Telecoms Security)', 'ENISA · CSIRT', 'NIST CSF · RS', 'GSMA FS.36']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 12. /noc/maintenance — Maintenance Window calendar
// ════════════════════════════════════════════════════════════════════════════
const freezes = [
  { name: 'FA Cup Final',         start: '2026-05-30', end: '2026-05-30', tone: 'bad' as const },
  { name: 'Glastonbury 2026',     start: '2026-06-25', end: '2026-06-29', tone: 'bad' as const },
  { name: 'Royal Wedding',        start: '2026-07-12', end: '2026-07-12', tone: 'bad' as const },
  { name: 'NOTTING HILL Carnival',start: '2026-08-30', end: '2026-09-01', tone: 'bad' as const },
  { name: 'Holiday code freeze',  start: '2026-12-20', end: '2027-01-04', tone: 'warn' as const },
];
const upcomingChg = [
  { id: 'CHG0013027', svc: 'Manchester M14 capex',  when: 'Tue 02:00 · 2h',  risk: 'Med', region: 'NW' },
  { id: 'CHG0013031', svc: 'IMS · CSCF v9.4 patch', when: 'Wed 03:00 · 90m', risk: 'Low', region: 'UK' },
  { id: 'CHG0013034', svc: 'PE backbone uplift',    when: 'Sun 02:00 · 4h',  risk: 'High', region: 'UK' },
];
export function NocMaintenance() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Maintenance Calendar · Freeze Windows" title="Change calendar · freeze-window guard" subtitle="Visual change calendar · freeze windows for events / holidays · auto-deny CHG that violates a freeze." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="CHGs (next 7d)" value="14" />
        <Kpi label="High-risk CHGs" value="2" tone="warn" />
        <Kpi label="Freeze windows (next 90d)" value={`${freezes.length}`} />
        <Kpi label="Freeze violations attempted" value="0" tone="good" />
        <Kpi label="On-call coverage gaps" value="0" tone="good" />
        <Kpi label="Customer comms drafted" value="14" delta="auto" tone="good" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Upcoming CHG window</div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr className="text-left"><th className="py-1.5 px-2">CHG</th><th className="py-1.5 px-2">Service</th><th className="py-1.5 px-2">Window</th><th className="py-1.5 px-2">Risk</th><th className="py-1.5 px-2">Region</th></tr></thead>
          <tbody>
            {upcomingChg.map((c) => (
              <tr key={c.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{c.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{c.svc}</td>
                <td className="py-1.5 px-2 font-mono">{c.when}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', c.risk === 'High' ? 'bg-vfRed text-white' : c.risk === 'Med' ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}>{c.risk}</span></td>
                <td className="py-1.5 px-2 text-ink-muted">{c.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Freeze windows · next 90 days</div>
        <ul className="text-[11.5px] space-y-1">
          {freezes.map((f) => (
            <li key={f.name} className="flex items-baseline gap-2"><Calendar className="w-3 h-3 shrink-0 text-vfRed" /><span className={cn('vf-chip text-[10px]', f.tone === 'bad' ? 'bg-vfRed text-white' : 'bg-amber/30 text-amber-900')}>{f.start} → {f.end}</span><span>{f.name}</span></li>
          ))}
        </ul>
      </div>
      <GoldChips chips={['gold.change_calendar', 'gold.freeze_windows', 'gold.cab_decisions', 'silver.event_calendar']} />
      <StandardsRow chips={['ITIL v4 · Change Enablement', 'TMF 681', 'Ofcom GC A3', 'ISO 20000']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 13. /noc/perf — Live Performance war-room (RAN/Core/IMS KPI)
// ════════════════════════════════════════════════════════════════════════════
export function NocPerf() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Live Performance war-room" title="RAN / Core / IMS KPI deck — live" subtitle="DCR · drop · accessibility · retainability · IRAT · throughput · CSCF · UPF session-est. The 'right-now' view, distinct from PM/FM bulk." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="DCR (RAN)" value="0.42%" delta="target < 0.5%" tone="good" />
        <Kpi label="Accessibility" value="99.6%" tone="good" />
        <Kpi label="Retainability" value="99.4%" tone="good" />
        <Kpi label="UPF session-est." value="99.86%" delta="target 99.9%" tone="warn" />
        <Kpi label="P-CSCF Cx success" value="99.97%" tone="good" />
        <Kpi label="Throughput P95 (5G)" value="412 Mbps" tone="good" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">DCR · last 24h · %</div>
          <Sparkline data={[0.32,0.38,0.42,0.40,0.36,0.38,0.42,0.48,0.52,0.46,0.44,0.42,0.40,0.38,0.36,0.34,0.36,0.38,0.40,0.42,0.40,0.38,0.42,0.42]} color="#1d4ed8" height={80} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">UPF session-est. · 12 weeks</div>
          <BandedLineChart data={[99.92,99.91,99.90,99.91,99.89,99.90,99.88,99.86,99.87,99.86,99.85,99.86]} bands={[{ color: '#10b981', min: 99.80, max: 100.0 }]} label="target ≥ 99.9%" />
        </div>
      </div>
      <Histogram buckets={[{ label: '<200 Mbps', count: 8 }, { label: '200-400', count: 22 }, { label: '400-600', count: 38 }, { label: '600-800', count: 18 }, { label: '>800', count: 6 }]} mean={412} />
      <ModelCard m={{ name: 'kpi_anomaly_v2', version: '2.4', metric: 'F1 0.93', drift: 'stable', refreshed: '60s ago', owner: 'NOC-Perf', blurb: 'Multivariate anomaly across DCR · drop · throughput. Sub-minute detection · feeds NOC queue + Wallboard.' }} />
      <GoldChips chips={['gold.cell_kpis_live', 'gold.upf_kpis', 'gold.cscf_kpis', 'silver.pm_counters']} />
      <StandardsRow chips={['3GPP TS 32.401', '3GPP TS 28.554 KPI', 'TMF 681', 'Ofcom QoS', 'ITU-T G.107 voice']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 14. /noc/comms — Customer comms drafter
// ════════════════════════════════════════════════════════════════════════════
const commsTemplates = [
  { ch: 'Status page',  state: 'PUBLISHED', t: 'T+04m', body: 'We are aware of an issue affecting 5G data in Manchester. Engineering teams are engaged; ETA 30 min.' },
  { ch: 'SMS · impacted', state: 'QUEUED',  t: 'T+05m', body: 'SnowTelco: We\'re sorry, you may experience 5G issues in Manchester. Restoration ETA 30 min. Reply HELP or visit status.snowtelco.co.uk.' },
  { ch: 'In-app banner', state: 'PUBLISHED', t: 'T+06m', body: 'Service degraded in your area · we\'re on it. Tap for live updates.' },
  { ch: 'B2B email · Lloyds', state: 'DRAFT',  t: 'T+08m', body: 'Subject: NOC-MIM-2026-0413 · Active P1 affecting Manchester branches. Our IC is Sarah Khan. Next update at T+15m.' },
  { ch: 'Twitter / X',  state: 'DRAFT',  t: 'T+10m', body: 'We\'re investigating a 5G data issue in Manchester. Updates: status.snowtelco.co.uk' },
];
export function NocComms() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Customer Communications" title="Comms drafter · multi-channel · auto-published" subtitle="Cortex Complete drafts status update + SMS + in-app banner + B2B email + social. Push to Digital + BSS in real time." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Channels" value="6" delta="status · SMS · app · email · X · push" />
        <Kpi label="Avg draft → publish" value="38 sec" tone="good" />
        <Kpi label="Human-edit rate" value="6%" tone="good" />
        <Kpi label="Recipients (this incident)" value="184k" />
        <Kpi label="Multi-language" value="EN · CY" delta="UK + Welsh" tone="good" />
        <Kpi label="GDPR opt-in respect" value="100%" tone="good" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr className="text-left"><th className="py-1.5 px-2">Channel</th><th className="py-1.5 px-2">State</th><th className="py-1.5 px-2">When</th><th className="py-1.5 px-2">Draft</th></tr></thead>
          <tbody>
            {commsTemplates.map((c) => (
              <tr key={c.ch} className="border-b border-mist-dark/60 align-top">
                <td className="py-1.5 px-2 font-bold text-ink">{c.ch}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', c.state === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : c.state === 'QUEUED' ? 'bg-amber/30 text-amber-900' : 'bg-mist text-ink-muted')}>{c.state}</span></td>
                <td className="py-1.5 px-2 font-mono text-ink-muted">{c.t}</td>
                <td className="py-1.5 px-2 text-ink-muted">{c.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'comms_drafter_v2', version: '2.4', metric: 'human-edit rate 6%', drift: 'stable', refreshed: '12m ago', owner: 'NOC-Comms', blurb: 'Cortex Complete · multi-channel comms drafted from incident timeline + customer-impact join.' }} />
        <ConfidenceGauge label="Tone safety · UK regulator-compatible" value={94} tone="emerald" subLabel="checked against Ofcom GC C1 · GDPR · ASA" />
      </div>
      <GoldChips chips={['gold.comms_publishes', 'gold.recipient_segments', 'silver.customer_comms_log', 'gold.gc_a3_reports']} />
      <StandardsRow chips={['Ofcom GC C1 · GC C5', 'GDPR Art.34', 'ASA · Code', 'Welsh Language Standards', 'NIS2 · Art 23']} />
    </div>
  );
}
