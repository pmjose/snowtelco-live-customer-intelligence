import { Wrench, Boxes, Hammer, Truck, Gauge, Leaf, Bot, ShieldCheck, Sparkles, AlertTriangle, ArrowRight, GitBranch, Search, Activity, FileCog, Network as NetIcon, Workflow, ChevronRight, Zap, BarChart3, Plug, Calendar, Layers as LayersIcon, Link2, ClipboardCheck, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, Fragment } from 'react';
import { BarChart, HBar, LineChart, Donut, Funnel, Sparkline } from '@/components/shared/Charts';
import { ScenarioTimeline } from '@/components/timeline/ScenarioTimeline';
import { cn } from '@/lib/utils';
import { useDemoState } from '@/state/DemoStateProvider';
import { OverviewMlBlock, ServiceOrderMlBlock, ActivationMlBlock, InventoryMlBlock, TopologyMlBlock, AssuranceMlBlock, FieldForceMlBlock, CabMlBlock, CapacityMlBlock, EnergyMlBlock, EnergyExecExtension, MlBadge } from '@/pages/oss/OssMl';

// ════════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES (OSS — anchored on blue accent)
// ════════════════════════════════════════════════════════════════════════════

const ossKicker = 'text-blue-700';
const ossAccent = 'bg-blue-100 text-blue-700';
const ossAccentSoft = 'bg-blue-50 text-blue-700 border-blue-200';

function PageHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <header>
      <div className={cn('text-[10px] uppercase tracking-wider font-bold', ossKicker)}>{kicker}</div>
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
      {chips.map((c) => (
        <span key={c} className="vf-chip bg-yellow-50 text-yellow-800 border border-yellow-200 font-mono text-[10px]">{c}</span>
      ))}
      <Link to="/lineage" className="ml-auto text-[10px] text-blue-700 font-bold inline-flex items-center gap-0.5 hover:underline">
        Open lineage <GitBranch className="w-3 h-3" />
      </Link>
    </div>
  );
}

function StandardsRow({ chips }: { chips: string[] }) {
  return (
    <div className="vf-card p-2.5 flex flex-wrap items-center gap-1.5">
      <FileCog className="w-3.5 h-3.5 text-blue-700" />
      <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold mr-1">Standards</span>
      {chips.map((c) => (
        <span key={c} className="vf-chip bg-mist text-ink-muted text-[10px]">{c}</span>
      ))}
    </div>
  );
}

function CortexCard({ title, body, icon: Icon = Bot, tone = 'blue' }: { title: string; body: string; icon?: any; tone?: 'blue' | 'emerald' | 'amber' }) {
  const styles = tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/40' : tone === 'amber' ? 'border-amber/40 bg-amber/10' : 'border-blue-200 bg-blue-50/40';
  return (
    <div className={cn('vf-card p-3 border-l-4', styles)}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{title}</div>
          <div className="text-[12px] text-ink leading-snug mt-0.5">{body}</div>
        </div>
      </div>
    </div>
  );
}

// ─── UK regions for OSS heatmap (OSS-themed, blue) ──────────────────────────
const UK_REGIONS = [
  { id: 'SCOT', label: 'Scotland',     cx: 220, cy: 95,  count: 24 },
  { id: 'NE',   label: 'North East',   cx: 245, cy: 165, count: 18 },
  { id: 'NW',   label: 'North West',   cx: 200, cy: 175, count: 36 },
  { id: 'YH',   label: 'Yorkshire',    cx: 240, cy: 200, count: 28 },
  { id: 'WM',   label: 'West Midlands',cx: 200, cy: 235, count: 22 },
  { id: 'EM',   label: 'East Midlands',cx: 245, cy: 235, count: 16 },
  { id: 'EE',   label: 'East England', cx: 290, cy: 245, count: 14 },
  { id: 'WAL',  label: 'Wales',        cx: 155, cy: 240, count: 12 },
  { id: 'LDN',  label: 'London',       cx: 270, cy: 295, count: 42 },
  { id: 'SE',   label: 'South East',   cx: 285, cy: 305, count: 26 },
  { id: 'SW',   label: 'South West',   cx: 195, cy: 305, count: 20 },
  { id: 'NI',   label: 'N. Ireland',   cx: 95,  cy: 175, count: 8 },
];

function OssUkHeatmap({ title = 'Live work-orders + open changes by region' }: { title?: string }) {
  // Soft polygon outlines for GB + Ireland
  const gbPath = `M 170 25 L 195 22 L 240 28 L 248 38 L 260 60 L 275 88 L 270 115 L 280 142 L 270 170 L 290 180 L 305 200 L 310 230 L 315 260 L 295 290 L 305 320 L 270 335 L 235 330 L 210 318 L 180 310 L 160 290 L 145 260 L 165 240 L 175 215 L 155 200 L 145 175 L 165 155 L 160 130 L 175 110 L 165 85 L 175 60 L 170 25 Z`;
  const irelandPath = `M 92 175 L 110 180 L 122 195 L 128 220 L 120 240 L 105 245 L 88 240 L 75 220 L 78 195 L 92 175 Z`;
  const max = Math.max(...UK_REGIONS.map((r) => r.count));
  const hex = (cx: number, cy: number, r: number) => {
    const pts = [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return pts.join(' ');
  };
  return (
    <div className="vf-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">{title}</div>
      <svg viewBox="0 0 380 380" className="w-full max-h-[360px]">
        <path d={gbPath} fill="#e0f2fe" stroke="#7dd3fc" strokeWidth={1.5} />
        <path d={irelandPath} fill="#f0fdfa" stroke="#a7f3d0" strokeWidth={1.5} />
        {UK_REGIONS.map((r) => {
          const t = r.count / max;
          const radius = 10 + t * 16;
          const fill = t > 0.7 ? '#1d4ed8' : t > 0.45 ? '#3b82f6' : t > 0.2 ? '#60a5fa' : '#93c5fd';
          return (
            <g key={r.id}>
              <polygon points={hex(r.cx, r.cy, radius)} fill={fill} stroke="#fff" strokeWidth={1.4} opacity={0.92} />
              <text x={r.cx} y={r.cy + 3.5} fontSize="9" fontWeight={800} textAnchor="middle" fill="#fff">{r.count}</text>
              <text x={r.cx} y={r.cy + radius + 11} fontSize="8.5" fontWeight={700} textAnchor="middle" fill="#0c4a6e">{r.id}</text>
            </g>
          );
        })}
      </svg>
      <div className="text-[10px] text-ink-muted leading-snug mt-1">Open work-orders + in-flight changes per region · refreshes every 5 min from <code className="font-mono text-[10px]">silver.work_orders</code> + <code className="font-mono text-[10px]">gold.change_register</code>.</div>
    </div>
  );
}

// ─── Live agent activity ticker ─────────────────────────────────────────────
function AgentTicker() {
  const events = [
    { ts: 'now', text: 'route-optimised dispatch · 14 jobs re-sequenced', src: 'fieldforce_routing_v2' },
    { ts: '4m ago', text: 'energy-save · NYK · 280W → 198W on 12 cells', src: 'energy_save_v3' },
    { ts: '11m ago', text: 'inventory drift · 6 reconciles auto-applied', src: 'inventory_drift_v3' },
    { ts: '16m ago', text: 'CAB · CHG0013014 · auto-approved (standard)', src: 'cab_router_v1' },
    { ts: '23m ago', text: 'capacity what-if · Manchester BH · agent-replied', src: 'cortex_analyst' },
    { ts: '34m ago', text: 'TMF 645 · 42 tickets auto-triaged · vendor-A', src: 'assurance_triage_v2' },
  ];
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative inline-flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Agent activity · OSS</span>
        <span className="ml-auto text-[10px] text-ink-muted">last 30 min</span>
      </div>
      <ul className="space-y-1">
        {events.map((e, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11.5px]">
            <span className="text-[10px] text-ink-muted font-mono w-14 shrink-0 mt-0.5">{e.ts}</span>
            <span className="text-ink leading-snug flex-1">{e.text}</span>
            <span className="vf-chip bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-mono">{e.src}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ════════════════════════════════════════════════════════════════════════════

const OUTCOMES = [
  { label: 'On-time activation', value: '+0.8pp', sub: '95.6% → 96.4%' },
  { label: 'Inventory accuracy', value: '99.2%', sub: 'TMF 638 reconciled nightly' },
  { label: 'Truck rolls / day',  value: '−14',    sub: 'route-optimised dispatch' },
  { label: 'Energy MoM',         value: '−3.2%',  sub: 'energy-save automation' },
];

const TILES_PRIMARY = [
  { to: '/oss/service-order', label: 'Service Order', desc: 'TMF 622 customer-commit · order decomposition · jeopardy.', icon: ClipboardCheck, outcome: 'p95 commit-to-activation 6d', kicker: 'TMF 622' },
  { to: '/oss/provisioning',  label: 'Activation',    desc: 'TMF 641 fulfilment · field install · acceptance · hand-over.', icon: Hammer, outcome: 'on-time 96.4%', kicker: 'TMF 641' },
  { to: '/oss/inventory',     label: 'Service Inventory', desc: 'TMF 638 customer → service → resource tree.', icon: Boxes, outcome: '14,820 active', kicker: 'TMF 638' },
  { to: '/oss/topology',      label: 'Network Inventory', desc: 'Physical: sites · circuits · spectrum (Cramer / Netcracker).', icon: NetIcon, outcome: '21,400 sites', kicker: 'Physical' },
  { to: '/oss/assurance',     label: 'Service Assurance', desc: 'TMF 645 trouble-tickets · NOC ↔ field ↔ BSS-credit.', icon: ShieldCheck, outcome: 'MTTR 1h 48m', kicker: 'TMF 645' },
  { to: '/oss/field-force',   label: 'Network Field Ops',   desc: 'Network field engineers · RAN/Transport/B2B installs. Skill match · SLA · H&S · ESG-tagged.', icon: Truck, outcome: 'FTF 91%', kicker: 'Field Ops' },
  { to: '/noc/change',        label: 'Change Mgmt · CAB',desc: 'NOC-owned. CHG / CFR / freeze-window · Ofcom GC A3 PIR draft. Templates from OSS.', icon: ClipboardCheck, outcome: 'CFR 1.4%', kicker: 'NOC · CAB' },
  { to: '/oss/capacity',      label: 'Capacity',      desc: '12-month outlook · what-if · CO₂-aware capex.', icon: Gauge, outcome: '34 sites at risk', kicker: 'Plan' },
  { to: '/oss/energy',        label: 'Energy & ESG',  desc: 'kWh · CO₂ · renewable mix · SBTi target tracking.', icon: Leaf, outcome: '−3.2% MoM', kicker: 'Sustain' },
];

export default function OssOverview() {
  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-5 space-y-4">
      {/* ── Header (matches other OSS pages) ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="vf-card overflow-hidden p-0">
        <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3 border-b border-mist-dark">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-blue-700">OSS · Service Operations</div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Plan · Build · Run · Sustain the network</h1>
            <p className="text-xs text-ink-muted">TMF 622 / 638 / 641 / 645 aligned · Ofcom GC A3 · NIS2 · ISO 14001 / 27001 · SBTi</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live UK Tier-1</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums leading-none text-ink">21,400 sites</div>
            </div>
            <Wrench className="w-8 h-8 text-blue-700" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-mist-dark/60">
          {OUTCOMES.map((o) => (
            <div key={o.label} className="bg-white p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{o.label}</div>
              <div className="text-2xl font-extrabold text-blue-700 font-mono tabular-nums mt-0.5">{o.value}</div>
              <div className="text-[11px] text-ink-muted mt-1">{o.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <ScenarioTimeline />

      {/* ── Board KPI strip ── */}
      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <Kpi label="Open work orders" value="218" delta="−12 today" tone="good" />
        <Kpi label="On-time activation" value="96.4" unit="%" delta="+0.8pp" tone="good" />
        <Kpi label="Order jeopardy" value="14" delta="of 184 in flight" tone="warn" />
        <Kpi label="Inventory drift" value="0.8" unit="%" delta="auto-reconciled" tone="good" />
        <Kpi label="MTTR (TMF 645)" value="1h 48m" delta="vs 4h baseline" tone="good" />
        <Kpi label="Field FTF" value="91" unit="%" delta="+3pp YoY" tone="good" />
        <Kpi label="Energy MoM" value="−3.2" unit="%" delta="energy-save" tone="good" />
        <Kpi label="Sites at risk (90d)" value="34" delta="capacity forecast" tone="warn" />
      </div>

      {/* ── 3-up: heatmap · jeopardy · agent ticker ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5">
          <OssUkHeatmap />
        </div>
        <div className="lg:col-span-4">
          <div className="vf-card p-3 h-full">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Top-5 jeopardy · today</span>
            </div>
            <ul className="space-y-1.5 text-[11.5px]">
              {[
                { who: 'Tesco · IoT mMTC nationwide',  type: 'Vendor delivery', risk: 'High',   eta: '2026-05-30' },
                { who: 'University of Manchester',     type: 'Spectrum permit', risk: 'Med',    eta: '2026-06-04' },
                { who: 'NYK · DAL-A site mains',       type: 'Battery + cabinet', risk: 'Med',  eta: 'today' },
                { who: 'London Canary Wharf · E14',    type: 'Capacity > 85% PRB Q3', risk: 'Med', eta: 'Q3 2026' },
                { who: 'Vendor-A · LDS-LS2 splice',    type: 'SLA at risk',     risk: 'Low',    eta: '3h' },
              ].map((r) => (
                <li key={r.who} className="flex items-start gap-2">
                  <span className={cn('vf-chip text-[9.5px] font-bold w-12 justify-center shrink-0', r.risk === 'High' ? 'bg-vfRed text-white' : r.risk === 'Med' ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}>{r.risk}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-ink font-bold leading-tight truncate">{r.who}</div>
                    <div className="text-[10.5px] text-ink-muted">{r.type}</div>
                  </div>
                  <span className="text-[10px] font-mono text-ink-muted shrink-0">{r.eta}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-3">
          <AgentTicker />
        </div>
      </div>

      {/* ── Tile grid ── */}
      <section>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className={cn('text-[10px] uppercase tracking-wider font-bold', ossKicker)}>Sub-domains</div>
            <h2 className="text-lg font-extrabold text-ink">Pick an OSS area</h2>
          </div>
          <Link to="/scenarios" className="text-[11px] text-blue-700 font-bold inline-flex items-center gap-0.5">Browse OSS scenarios <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {TILES_PRIMARY.map((t, i) => (
            <motion.div key={t.to} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <Link to={t.to} className="vf-card p-3 hover:shadow-elev hover:-translate-y-0.5 transition flex flex-col gap-1.5 h-full group">
                <div className="flex items-center gap-2">
                  <div className={cn('w-9 h-9 rounded-lg grid place-items-center', ossAccent)}>
                    <t.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9.5px] uppercase tracking-wider text-ink-muted font-bold">{t.kicker}</div>
                    <div className="font-extrabold text-ink leading-tight">{t.label}</div>
                  </div>
                </div>
                <p className="text-[11.5px] text-ink-muted leading-snug">{t.desc}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px] font-bold">{t.outcome}</span>
                  <span className="text-[11px] text-blue-700 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">Open <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <OverviewMlBlock />
      <StandardsRow chips={['TMF 622 · Order', 'TMF 638 · Inventory', 'TMF 641 · Activation', 'TMF 645 · Trouble Ticket', 'Ofcom GC A3', 'NIS2', 'ISO 27001', 'ISO 14001', 'SBTi', 'ITIL v4']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE INVENTORY (TMF 638)
// ════════════════════════════════════════════════════════════════════════════
const services = [
  { id: 'SVC-MAN-001', cust: 'Barclays · LSE branch (Manchester)', type: 'Private 5G campus', resources: ['gNB-MAN-CITY-01', 'gNB-MAN-CITY-02', 'MEC-MAN-A', 'Slice URLLC-01'], state: 'Active', sla: '99.99%' },
  { id: 'SVC-LDN-145', cust: 'BBC · Broadcasting House', type: 'Leased line 10 Gbps', resources: ['CKT-LDN-W1-001', 'PE-LDN-1', 'Cross-connect MX-LDN-3'], state: 'Active', sla: '99.95%' },
  { id: 'SVC-LDN-028', cust: 'TfL · Tube tunnels', type: 'mMTC slice (sensors)', resources: ['IoT-PCSCF-LDN-CORE', 'Slice mMTC-04', '38 sites'], state: 'Active', sla: '99.99%' },
  { id: 'SVC-MAN-200', cust: 'Manchester City Council', type: 'CCTV Mobile (4G LTE)', resources: ['eNB-MAN-CITY-12', 'APN: cctv.man.city'], state: 'Active', sla: '99.5%' },
  { id: 'SVC-NEW-302', cust: 'Newcastle Hospital', type: 'Mobile broadband (5G)', resources: ['gNB-NEW-CTY-01', 'Slice eMBB-MED-01'], state: 'Pending activation', sla: '99.95%' },
];

export function OssInventory() {
  const driftSparkline = [4, 6, 5, 7, 6, 5, 4, 6, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 3];
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Inventory (TMF 638)" title="Service inventory" subtitle="TMF 638-aligned customer → service → resource tree. Single source of truth for what is sold, deployed and changeable." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Active services" value="14,820" />
        <Kpi label="Resources under mgmt" value="412k" />
        <Kpi label="Inventory drift" value="0.8%" delta="auto-reconciled nightly" tone="good" />
        <Kpi label="Pending activation" value="142" />
        <Kpi label="Decommission queue" value="38" />
        <Kpi label="Avg time-to-activate" value="2.4 days" delta="−0.6d" tone="good" />
      </div>

      <CortexCard title="Cortex Search · impact analysis"
        body='"Find me services impacted if PE-LDN-1 fails" → 184 services · 12 customers Tier-1 · top: BBC · Vodafone · Lloyds · Tesco · TfL. Auto-drafted impact email pack with restoration ETA + customer apology template.' />

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Service ID</th>
              <th className="py-1.5 px-2">Customer</th>
              <th className="py-1.5 px-2">Type</th>
              <th className="py-1.5 px-2">Resources</th>
              <th className="py-1.5 px-2">SLA</th>
              <th className="py-1.5 px-2">State</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{s.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{s.cust}</td>
                <td className="py-1.5 px-2">{s.type}</td>
                <td className="py-1.5 px-2 text-[10.5px] text-ink-muted">{s.resources.join(' · ')}</td>
                <td className="py-1.5 px-2 font-mono">{s.sla}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', s.state === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/20 text-amber-800')}>{s.state}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Services by type</div>
          <Donut
            data={[
              { label: 'Mobile broadband (consumer)', value: 12_400, color: '#1d4ed8' },
              { label: 'Leased line / wholesale', value: 1_180, color: '#0c4a6e' },
              { label: 'Private 5G campus', value: 184, color: '#10B981' },
              { label: 'IoT / mMTC slices', value: 720, color: '#F59E0B' },
              { label: 'CCTV LTE / vertical', value: 336, color: '#8B5CF6' },
            ]}
            formatter={(v) => v.toLocaleString()}
            size={150}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Resource vendor mix</div>
          <Donut
            data={[
              { label: 'Ericsson',  value: 38, color: '#1d4ed8' },
              { label: 'Nokia',     value: 24, color: '#3b82f6' },
              { label: 'Cisco',     value: 14, color: '#10B981' },
              { label: 'Juniper',   value: 10, color: '#F59E0B' },
              { label: 'Mavenir',   value: 8,  color: '#8B5CF6' },
              { label: 'Other',     value: 6,  color: '#94a3b8' },
            ]}
            formatter={(v) => `${v}%`}
            size={150}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Drift · last 30 days (count of records)</div>
          <Sparkline data={driftSparkline} color="#1d4ed8" height={70} />
          <div className="text-[10px] text-ink-muted mt-1">Daily drift count auto-cleared by `inventory_drift_v3`. Three sources reconciled: Netcracker · Cramer · ServiceNow CMDB.</div>
        </div>
      </div>

      <GoldChips chips={['silver.inventory_state', 'gold.inventory_drift', 'gold.topology_snapshot', 'silver.cmdb_state']} />
      <InventoryMlBlock />
      <StandardsRow chips={['TMF 638 · Service Inventory', 'TMF 633 · Service Specification', 'ISO 27001', 'ITIL v4 · CMDB']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROVISIONING (TMF 641)
// ════════════════════════════════════════════════════════════════════════════
const orderQueue = [
  { id: 'O-2026-0508-014', cust: 'Lloyds · 280 branches', type: '4G/5G fleet refresh', step: 'Site survey', eta: '2026-05-21', risk: 'Low' },
  { id: 'O-2026-0508-021', cust: 'University of Manchester', type: 'Private 5G campus', step: 'Spectrum permit', eta: '2026-06-04', risk: 'Med' },
  { id: 'O-2026-0508-019', cust: 'Newcastle Hospital', type: 'Mobile broadband (5G)', step: 'gNB integration', eta: '2026-05-12', risk: 'Low' },
  { id: 'O-2026-0508-008', cust: 'Manchester Council', type: 'CCTV LTE expansion', step: 'Rollout (pre-test)', eta: '2026-05-09', risk: 'Low' },
  { id: 'O-2026-0508-002', cust: 'Tesco', type: 'IoT mMTC nationwide', step: 'Vendor delivery', eta: '2026-05-30', risk: 'High' },
];

export function OssProvisioning() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Activation (TMF 641)" title="Service activation & fulfilment" subtitle="From order → site survey → install → integration tests → handover. The TMF 641 fulfilment side. Customer-commit (TMF 622) lives one click left." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="In-flight orders" value="184" />
        <Kpi label="Avg time-to-activate" value="2.4 days" delta="−0.6d" tone="good" />
        <Kpi label="On-time activation" value="96.4%" delta="+0.8pp" tone="good" />
        <Kpi label="At-risk orders" value="14" tone="warn" />
        <Kpi label="Activation rework" value="2.1%" delta="−0.4pp" tone="good" />
        <Kpi label="Auto-activation rate" value="64%" delta="zero-touch" tone="good" />
      </div>

      <CortexCard title="Fallout prevention · order_fallout_v2.1"
        body="412 in-flight orders flagged at-risk — top drivers: PAC mismatch (132) · credit hold (92) · tariff lookup (74) · address (58). 248 auto-remediated; 164 routed to ops queue. Saved revenue ~£184k. Audit row → gold.order_fallout_features." />

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Order</th>
              <th className="py-1.5 px-2">Customer</th>
              <th className="py-1.5 px-2">Type</th>
              <th className="py-1.5 px-2">Current step</th>
              <th className="py-1.5 px-2">Target activation</th>
              <th className="py-1.5 px-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {orderQueue.map((o) => (
              <tr key={o.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{o.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{o.cust}</td>
                <td className="py-1.5 px-2">{o.type}</td>
                <td className="py-1.5 px-2 text-ink-muted">{o.step}</td>
                <td className="py-1.5 px-2 font-mono">{o.eta}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', o.risk === 'High' ? 'bg-vfRed text-white' : o.risk === 'Med' ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}>{o.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Orders by current step</div>
          <Funnel
            stages={[
              { label: 'Order capture (TMF 622)', value: 184, tone: 'good' },
              { label: 'Site survey & feasibility', value: 96, tone: 'good' },
              { label: 'Spectrum / permits', value: 42, tone: 'warn' },
              { label: 'Vendor delivery', value: 38, tone: 'warn' },
              { label: 'Field-force install', value: 28, tone: 'good' },
              { label: 'Integration tests', value: 14, tone: 'good' },
              { label: 'Hand-over & activation', value: 8, tone: 'good' },
            ]}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">On-time activation · last 12 months</div>
          <LineChart
            height={140}
            series={[{ name: 'On-time %', data: [93.1, 93.6, 93.8, 94.2, 94.5, 94.9, 95.2, 95.4, 95.6, 95.8, 96.1, 96.4] }]}
            labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']}
            colors={['#10B981']}
          />
          <div className="text-[10px] text-ink-muted mt-1">Auto-activation rate climbed from 48% to 64% over the last 12 months as zero-touch flows expanded.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Vendor-delivery rework · Pareto</div>
          <HBar
            data={[
              { label: 'Vendor-A · fibre splice', value: 38, sub: '≈ 41% of rework' },
              { label: 'Vendor-B · gNB integration', value: 22, sub: 'optical link issues' },
              { label: 'Vendor-C · CPE ship-then-ship', value: 14, sub: 'wrong SKU' },
              { label: 'Spectrum permit · Ofcom', value: 9, sub: 'admin' },
              { label: 'Customer site readiness', value: 8, sub: 'door access' },
            ]}
            color="#1d4ed8"
            formatter={(v) => `${v}%`}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Standard fulfilment workflow (B2B leased line)</div>
          <ol className="text-[12px] text-ink space-y-0.5 list-decimal list-inside">
            <li>Order capture (TMF 622) → catalog validation</li>
            <li>Feasibility & site survey (geo + line quality + planning)</li>
            <li>Equipment & circuit allocation (inventory reservation)</li>
            <li>Field-force dispatch → install → cabling</li>
            <li>Integration tests (BERT, throughput, latency)</li>
            <li>Customer hand-over (acceptance)</li>
            <li>Billing activation + service inventory updated (TMF 638)</li>
          </ol>
        </div>
      </div>

      <GoldChips chips={['silver.orders', 'gold.order_fallout_features', 'gold.fieldforce_routing', 'silver.work_orders']} />
      <ActivationMlBlock />
      <StandardsRow chips={['TMF 622 · Order', 'TMF 641 · Activation', 'TMF 638 · Inventory', 'Ofcom GC C1', 'ITIL v4']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD FORCE
// ════════════════════════════════════════════════════════════════════════════
const workOrders = [
  { id: 'WO-2026-0508-NYK-001', site: 'SITE-NYK-DAL-A', task: 'Replace cabinet fan-controller + battery upgrade', tech: 'James K.', status: 'Dispatched', eta: '2h 15m', skill: 'RAN_HW' },
  { id: 'WO-2026-0508-LIV-001', site: 'gNB-LIV-L1-A', task: 'Fan replacement (vendor TSB-2024-117)', tech: 'Sarah M.', status: 'En route', eta: '32m', skill: 'RAN_HW' },
  { id: 'WO-2026-0508-LDS-002', site: 'PE-LDS-2 · MH-LS-417', task: 'Vendor-A fibre splice repair', tech: 'Vendor team', status: 'Vendor scheduled', eta: '3h', skill: 'TRANSPORT' },
  { id: 'WO-2026-0508-MAN-018', site: 'CLU-MAN-01', task: 'PIR — confirm capacity changes hold', tech: 'Owen D.', status: 'Scheduled', eta: 'Tomorrow', skill: 'RAN_PLAN' },
  { id: 'WO-2026-0508-BIR-005', site: 'gNB-BIR-B4-A', task: 'Routine acceptance test', tech: 'Priya R.', status: 'Completed', eta: '—', skill: 'RAN_TEST' },
];

export function OssFieldForce() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Network Field Operations" title="Network field ops · work orders & dispatch" subtitle="Network field engineers (RAN · transport · IMS · B2B installs). Skill matching, parts inventory, on-site reporting, ESG-tagged dispatch, SLA tracking. Distinct from consumer install / Openreach-style appointments." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Open work orders" value="218" tone="warn" />
        <Kpi label="Field techs (live)" value="142" />
        <Kpi label="Avg drive time" value="38 min" delta="route-optimised" tone="good" />
        <Kpi label="First-time-fix rate" value="91%" delta="+3pp" tone="good" />
        <Kpi label="Truck rolls / day" value="86" delta="−14 vs baseline" tone="good" />
        <Kpi label="Parts on-hand" value="98%" delta="van inventory" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1">
          <OssUkHeatmap title="Work-orders by region · today" />
        </div>
        <div className="lg:col-span-2">
          <div className="vf-card p-3 overflow-x-auto h-full">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
                <tr className="text-left">
                  <th className="py-1.5 px-2">Work order</th>
                  <th className="py-1.5 px-2">Site / Asset</th>
                  <th className="py-1.5 px-2">Task</th>
                  <th className="py-1.5 px-2">Tech</th>
                  <th className="py-1.5 px-2">Skill</th>
                  <th className="py-1.5 px-2">Status</th>
                  <th className="py-1.5 px-2">ETA</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((w) => (
                  <tr key={w.id} className="border-b border-mist-dark/60">
                    <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{w.id}</td>
                    <td className="py-1.5 px-2 font-mono text-[11px] text-ink">{w.site}</td>
                    <td className="py-1.5 px-2 text-ink">{w.task}</td>
                    <td className="py-1.5 px-2 text-ink-muted">{w.tech}</td>
                    <td className="py-1.5 px-2"><span className="vf-chip bg-mist text-ink-muted text-[10px]">{w.skill}</span></td>
                    <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', w.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : w.status === 'Dispatched' || w.status === 'En route' ? 'bg-blue-100 text-blue-700' : 'bg-amber/20 text-amber-800')}>{w.status}</span></td>
                    <td className="py-1.5 px-2 font-mono">{w.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Parts stockout-risk · top 6 SKUs</div>
          <HBar
            data={[
              { label: 'Fan-controller v3 (cabinet)', value: 12, sub: 'reorder ETA 5d' },
              { label: 'Battery cell · Eaton 9PX',    value: 9,  sub: 'safety stock 11' },
              { label: 'Fibre splice kit',            value: 7,  sub: 'low' },
              { label: 'CPE Cat-12 router',           value: 5,  sub: 'OK' },
              { label: 'Antenna cable LMR-400',       value: 4,  sub: 'OK' },
              { label: 'Fuse 250A',                   value: 3,  sub: 'OK' },
            ]}
            color="#dc2626"
            formatter={(v) => `${v} stockout-days`}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tech mix · own vs contractor</div>
          <Donut
            data={[
              { label: 'Own techs',       value: 64, color: '#1d4ed8' },
              { label: 'Vodafone-A FSL',  value: 18, color: '#3b82f6' },
              { label: 'Vendor-B service',value: 11, color: '#10B981' },
              { label: 'Spot agency',     value: 7,  color: '#F59E0B' },
            ]}
            formatter={(v) => `${v}%`}
            size={140}
          />
          <div className="text-[10px] text-ink-muted mt-1">Contractor share trending down (32% → 28% YoY) as own-tech upskilling completes.</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Truck rolls / day · last 14 days</div>
          <BarChart
            data={['M','T','W','T','F','S','S','M','T','W','T','F','S','S'].map((d, i) => ({ label: d, value: [108, 102, 96, 92, 90, 64, 58, 102, 100, 92, 88, 86, 62, 58][i] }))}
            color="#1d4ed8"
          />
          <div className="text-[10px] text-ink-muted mt-1">Route-optimisation cut weekday rolls from ~108 to ~92 (−14) with no FTF impact.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Dispatch optimiser</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Skill match · proximity · van-stock parts · SLA priority (Salesforce Field Service)</li>
            <li>• Routing: Snowpark ML route optimiser (live traffic from TomTom Move)</li>
            <li>• Real-time ETA from Geotab telematics</li>
            <li>• Customer SMS via Sinch + push via Salesforce Marketing Cloud at dispatch + arrival</li>
          </ul>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">ESG-tagged dispatch</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Vehicle CO₂ + grid-mix attributed per work order</li>
            <li>• EV-first dispatch where available (62% of own fleet)</li>
            <li>• Co-routing avoidance: 3+ jobs per vehicle/day target</li>
            <li>• Daily report → <code className="font-mono text-[10.5px]">platinum.esg_scorecard</code></li>
          </ul>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Health & safety</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Lone-worker check-in via app every 60 min</li>
            <li>• RAMS auto-attached per asset class</li>
            <li>• PPE & vehicle inspection check-list</li>
            <li>• Working-at-height authorisation (specialist roles)</li>
          </ul>
        </div>
      </div>

      <GoldChips chips={['silver.work_orders', 'gold.fieldforce_routing', 'silver.engineer_roster', 'gold.energy_attribution']} />
      <FieldForceMlBlock />
      <StandardsRow chips={['TMF 645 · Trouble Ticket', 'TMF 641 · Activation', 'ISO 45001 · H&S', 'ESG · scope 1', 'GDPR · location']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CAPACITY
// ════════════════════════════════════════════════════════════════════════════
const capacityRisks = [
  { region: 'London (Canary Wharf · E14)', metric: 'PRB > 85%', breach: 'Q3 2026', action: 'Add carrier n78', cost: '£420k', co2: '+18 t/yr' },
  { region: 'Manchester (M14 cluster)', metric: 'BH bandwidth > 80%', breach: 'Q3 2026', action: 'BH circuit upgrade', cost: '£180k', co2: '+4 t/yr' },
  { region: 'Birmingham (B4)', metric: 'Active UE > 90%', breach: 'Q4 2026', action: 'Sectorisation review', cost: '£60k', co2: '+2 t/yr' },
  { region: 'Glasgow (G12)', metric: 'Site density', breach: 'Q1 2027', action: 'Add 2 small cells', cost: '£140k', co2: '+6 t/yr' },
  { region: 'Leeds (LS2)', metric: 'IPRAN ring spare 12%', breach: 'Q4 2026', action: 'New ring or upgrade', cost: '£260k', co2: '+8 t/yr' },
  { region: 'Edinburgh (EH1)', metric: 'Spectrum re-farm', breach: 'Q2 2027', action: '700MHz re-farm', cost: '£40k', co2: '−1 t/yr' },
];

export function OssCapacity() {
  const { selectedIncidentId } = useDemoState();
  const isCapacity = selectedIncidentId === 'oss-capacity';
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Capacity Planning" title="12-month capacity outlook" subtitle="Forecast-driven view of network capacity per region, with what-if simulations, ROI estimates and CO₂-aware capex." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Sites at risk (90d)" value="34" tone="warn" />
        <Kpi label="Sites at risk (12m)" value="142" tone="bad" />
        <Kpi label="Forecast accuracy" value="92%" delta="MAPE" tone="good" />
        <Kpi label="Capex pipeline" value="£8.4M" delta="next 12m" />
        <Kpi label="ROI > 18m" value="14 projects" delta="prioritised" tone="good" />
        <Kpi label="Sustainability bonus" value="£0.4M" delta="energy-save" tone="good" />
      </div>

      {isCapacity && (
        <CortexCard tone="amber" title="Active scenario · Manchester BH"
          body='Cortex Analyst replied: "If we delay Manchester BH upgrade by 6 months, 4.2k customers shift to churn-risk + 12pp · saves £180k capex / costs £240k churn. Recommendation: prioritise within current period." Audit: gold.decision_lineage.' />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">12-month PRB utilisation forecast · top 3 regions</div>
          <LineChart
            height={160}
            series={[
              { name: 'London (Canary Wharf)', data: [62, 65, 68, 71, 74, 78, 82, 86, 88, 90, 92, 94] },
              { name: 'Manchester (M14)', data: [58, 60, 63, 66, 70, 74, 78, 81, 83, 84, 86, 88] },
              { name: 'Birmingham (B4)', data: [54, 56, 59, 62, 65, 68, 72, 76, 80, 84, 88, 91] },
            ]}
            labels={['Now', '+1m', '+2m', '+3m', '+4m', '+5m', '+6m', '+7m', '+8m', '+9m', '+10m', '+12m']}
            colors={['#E11D48', '#F59E0B', '#1d4ed8']}
          />
          <div className="text-[10px] text-ink-muted mt-1">Threshold 85%. London breaches in Q3 — carrier addition planned. Manchester BH at risk Q3, Birmingham Q4.</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Demand-driver Pareto · what's pushing the curve</div>
          <HBar
            data={[
              { label: '5G handset attach', value: 38, sub: 'consumer + enterprise' },
              { label: 'Video streaming · UHD', value: 22, sub: 'eMBB' },
              { label: 'Fixed-Wireless Access', value: 16, sub: '5G FWA' },
              { label: 'IoT · mMTC', value: 11, sub: 'Tesco · TfL · councils' },
              { label: 'Roaming inbound (post-FTA)', value: 8,  sub: 'EU corridor' },
              { label: 'Other', value: 5, sub: '' },
            ]}
            color="#1d4ed8"
            formatter={(v) => `${v}%`}
          />
        </div>
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Region / Cluster</th>
              <th className="py-1.5 px-2">Metric</th>
              <th className="py-1.5 px-2">Breach window</th>
              <th className="py-1.5 px-2">Recommended action</th>
              <th className="py-1.5 px-2 text-right">Capex</th>
              <th className="py-1.5 px-2 text-right">CO₂ Δ</th>
            </tr>
          </thead>
          <tbody>
            {capacityRisks.map((r) => {
              const highlight = isCapacity && r.region.startsWith('Manchester');
              return (
                <tr key={r.region} className={cn('border-b border-mist-dark/60', highlight && 'bg-amber/10')}>
                  <td className="py-1.5 px-2 font-bold text-ink">{r.region}</td>
                  <td className="py-1.5 px-2 text-ink-muted">{r.metric}</td>
                  <td className="py-1.5 px-2"><span className="vf-chip bg-amber/20 text-amber-800 text-[10px]">{r.breach}</span></td>
                  <td className="py-1.5 px-2">{r.action}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">{r.cost}</td>
                  <td className={cn('py-1.5 px-2 text-right font-mono', r.co2.startsWith('-') || r.co2.startsWith('−') ? 'text-emerald-600' : 'text-amber-700')}>{r.co2}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Forecast methodology</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Per-cell traffic forecast (Snowpark ML, Prophet + custom)</li>
            <li>• Demographic growth + seasonal + event overlay</li>
            <li>• Customer churn / acquisition mix per region</li>
            <li>• Spectrum re-farm timeline factored in</li>
            <li>• Re-trained weekly · MAPE 8% on 90-day horizon</li>
          </ul>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">What-if simulator (Cortex Analyst-driven)</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• "Delay Manchester BH upgrade by 6 months?" → 4.2k churn-risk +12pp</li>
            <li>• "5G SA demand grows 30% faster?" → London capex +£1.4M, breach pulled in 4 months</li>
            <li>• "Hyde Park concert in Leeds?" → temporary cell-on-wheels recommended</li>
          </ul>
        </div>
      </div>

      <GoldChips chips={['silver.capacity_window', 'gold.capacity_forecast', 'gold.cell_kpis', 'gold.energy_attribution']} />
      <CapacityMlBlock />
      <StandardsRow chips={['Ofcom · spectrum', '3GPP TS 23.501', 'SBTi', 'NIS2', 'TMF 633']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ENERGY
// ════════════════════════════════════════════════════════════════════════════
const energyByRegion = [
  { region: 'London', kwh: '6.2 GWh', pct: 16, co2: '880 t' },
  { region: 'North West', kwh: '5.1 GWh', pct: 13, co2: '724 t' },
  { region: 'West Midlands', kwh: '3.9 GWh', pct: 10, co2: '554 t' },
  { region: 'Yorkshire', kwh: '3.7 GWh', pct: 10, co2: '525 t' },
  { region: 'Scotland', kwh: '5.4 GWh', pct: 14, co2: '383 t' },
  { region: 'South East', kwh: '6.4 GWh', pct: 17, co2: '909 t' },
  { region: 'Other', kwh: '7.0 GWh', pct: 20, co2: '994 t' },
];
const topDrainers = [
  { site: 'SITE-LDN-CW-A', region: 'London',   kwh24: '6,420 kWh', mode: 'Active',   savings: '12%' },
  { site: 'SITE-MAN-PIC-1', region: 'NW',      kwh24: '5,180 kWh', mode: 'Active',   savings: '14%' },
  { site: 'SITE-BIR-B4-A', region: 'WM',       kwh24: '4,920 kWh', mode: 'Active',   savings: '11%' },
  { site: 'SITE-LDS-LS2-1', region: 'Yorks',   kwh24: '4,740 kWh', mode: 'Active',   savings: '13%' },
  { site: 'SITE-NYK-DAL-A', region: 'Yorks',   kwh24: '4,610 kWh', mode: 'Battery',  savings: '— (mains failure)' },
  { site: 'SITE-EDI-EH1-1', region: 'Scot',    kwh24: '4,420 kWh', mode: 'Active',   savings: '9%' },
  { site: 'SITE-GLA-G12-2', region: 'Scot',    kwh24: '4,180 kWh', mode: 'Active',   savings: '10%' },
  { site: 'SITE-NCL-NE1-A', region: 'NE',      kwh24: '3,940 kWh', mode: 'Active',   savings: '8%' },
  { site: 'SITE-CDF-CF1-1', region: 'Wales',   kwh24: '3,720 kWh', mode: 'Active',   savings: '9%' },
  { site: 'SITE-BRS-BS1-A', region: 'SW',      kwh24: '3,540 kWh', mode: 'Active',   savings: '7%' },
];

export function OssEnergy() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Energy & Sustainability" title="Network energy & CO₂" subtitle="RAN energy posture with energy-save automation, renewable PPA mix, CO₂ delta vs baseline. SBTi-aligned target tracking." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Network energy" value="37.7" unit="GWh / mo" delta="−3.2% MoM" tone="good" />
        <Kpi label="Renewable mix" value="78%" delta="+4pp YoY" tone="good" />
        <Kpi label="CO₂ intensity" value="142" unit="g / kWh" delta="−6%" tone="good" />
        <Kpi label="Annual CO₂ avoided" value="16,200 t" delta="energy-save mode" tone="good" />
        <Kpi label="Site-level monitoring" value="99.4%" delta="Eaton + Vertiv meters" tone="good" />
        <Kpi label="Energy / GB" value="0.014" unit="kWh" delta="−9% YoY" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Renewable energy mix</div>
          <Donut
            data={[
              { label: 'Wind PPA', value: 42, color: '#10B981' },
              { label: 'Solar PPA', value: 18, color: '#F59E0B' },
              { label: 'Hydro', value: 12, color: '#1d4ed8' },
              { label: 'REGO', value: 6, color: '#8B5CF6' },
              { label: 'Grid mix (residual)', value: 22, color: '#94A3B8' },
            ]}
            formatter={(v) => `${v}%`}
            title="78%"
            size={150}
          />
          <div className="text-[10px] text-ink-muted mt-1">78% renewable · +4pp YoY · SBTi-aligned</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">CO₂ intensity · last 24 months</div>
          <LineChart
            height={140}
            series={[{ name: 'g CO₂ / kWh', data: [196, 192, 188, 186, 183, 180, 178, 174, 170, 168, 164, 161, 159, 156, 154, 151, 149, 147, 146, 144, 144, 143, 142, 142] }]}
            labels={['M-24', 'M-18', 'M-12', 'M-6', 'Now']}
            colors={['#10B981']}
          />
          <div className="text-[10px] text-ink-muted mt-1">−27% intensity vs baseline. SBTi target: −50% Scope 1+2 by 2030.</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Energy by region · GWh / mo</div>
          <HBar
            data={energyByRegion.map((r) => ({ label: r.region, value: parseFloat(r.kwh.replace(' GWh', '')), sub: `CO₂ ${r.co2}` }))}
            formatter={(v) => `${v.toFixed(1)} GWh`}
            color="#10B981"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Abatement waterfall · MoM</div>
          <BarChart
            data={[
              { label: 'Baseline',      value: 39.0 },
              { label: 'Off-peak 5G',   value: 38.4 },
              { label: 'Micro-DTX',     value: 38.0 },
              { label: 'Carrier off',   value: 37.8 },
              { label: 'HVAC',          value: 37.7 },
              { label: 'Today',         value: 37.7 },
            ]}
            color="#10B981"
            formatter={(v) => `${v.toFixed(1)} GWh`}
          />
          <div className="text-[10px] text-ink-muted mt-1">Cumulative abatement to today: 1.3 GWh / month (≈ 184t CO₂).</div>
        </div>
        <div className="vf-card p-3 overflow-x-auto">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top-10 energy-draining sites · last 24h</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr className="text-left">
                <th className="py-1.5 px-2">Site</th>
                <th className="py-1.5 px-2">Region</th>
                <th className="py-1.5 px-2">24h kWh</th>
                <th className="py-1.5 px-2">Mode</th>
                <th className="py-1.5 px-2">Savings potential</th>
              </tr>
            </thead>
            <tbody>
              {topDrainers.map((d) => (
                <tr key={d.site} className="border-b border-mist-dark/60">
                  <td className="py-1.5 px-2 font-mono text-[11px] text-ink">{d.site}</td>
                  <td className="py-1.5 px-2 text-ink-muted">{d.region}</td>
                  <td className="py-1.5 px-2 font-mono">{d.kwh24}</td>
                  <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', d.mode === 'Battery' ? 'bg-amber/20 text-amber-800' : 'bg-emerald-100 text-emerald-700')}>{d.mode}</span></td>
                  <td className="py-1.5 px-2 font-bold text-emerald-700">{d.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Energy-save automation telemetry (yesterday)</div>
            <BarChart
              data={['00','03','06','09','12','15','18','21'].map((h, i) => ({ label: h, value: [62, 60, 64, 78, 88, 92, 96, 84][i] }))}
              color="#10B981"
              formatter={(v) => `${v}%`}
            />
            <div className="text-[10px] text-ink-muted mt-1">% of off-peak cells in micro-DTX / symbol-shutdown by hour. Saved 3.4 GWh yesterday.</div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">ESG board pack · auto-generated</div>
            <ul className="text-[12px] text-ink space-y-1">
              <li>• Quarterly ESG report drafted by Cortex Complete · 14 KPIs · 7 charts</li>
              <li>• Source: <code className="font-mono text-[11px]">platinum.esg_scorecard</code></li>
              <li>• SBTi target: −50% Scope 1+2 by 2030 (vs 2020 baseline)</li>
              <li>• REGO + PPA evidence packs auto-attached</li>
              <li>• Embedded carbon tracking per gNB lifecycle</li>
            </ul>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Energy-save automation</div>
            <ul className="text-[12px] text-ink space-y-1">
              <li>• Off-peak 5G suspension on low-traffic cells (02:00–05:00)</li>
              <li>• Symbol shutdown / micro-DTX</li>
              <li>• Carrier shutdown if demand &lt; threshold</li>
              <li>• Cabinet HVAC tracking vs ambient</li>
              <li>• Battery extension (rural sites) on mains failure</li>
            </ul>
          </div>
        </div>
      </div>

      <GoldChips chips={['silver.energy_window', 'gold.energy_co2_index', 'gold.energy_attribution', 'platinum.esg_scorecard']} />
      <EnergyMlBlock />
      <EnergyExecExtension />
      <StandardsRow chips={['SBTi', 'ISO 14001 · EMS', 'TCFD', 'GHG Protocol', 'CSRD (EU)', 'Ofcom GC C7']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NEW PAGES (Phase B)
// ════════════════════════════════════════════════════════════════════════════

// ─── B1: TMF 622 Service Order ──────────────────────────────────────────────
const tmf622Orders = [
  { id: 'SO-2026-0508-001', cust: 'Lloyds Banking Group', items: 280, value: '£2.4M / yr', stage: 'Decomposed → activation', commit: '2026-05-21' },
  { id: 'SO-2026-0508-002', cust: 'Tesco · IoT mMTC',     items: 18_400, value: '£1.8M / yr', stage: 'Vendor delivery',         commit: '2026-05-30' },
  { id: 'SO-2026-0508-003', cust: 'Newcastle Hospital',   items: 4,     value: '£72k / yr',  stage: 'Integration tests',         commit: '2026-05-12' },
  { id: 'SO-2026-0508-004', cust: 'University of Manchester', items: 12, value: '£420k / yr',stage: 'Spectrum permit',           commit: '2026-06-04' },
  { id: 'SO-2026-0508-005', cust: 'Manchester Council CCTV', items: 84, value: '£180k / yr', stage: 'Field-force install',       commit: '2026-05-09' },
];

export function OssServiceOrder() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Service Order (TMF 622)" title="Customer-commit · order management" subtitle="The customer-facing commitment side. CPQ → order capture → decomposition → routed activation. Distinct from TMF 641 fulfilment." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Open service orders" value="184" />
        <Kpi label="On-time commit" value="94.8%" delta="+1.4pp" tone="good" />
        <Kpi label="Order jeopardy" value="14" delta="of 184" tone="warn" />
        <Kpi label="Auto-orchestrated" value="68%" delta="zero-touch" tone="good" />
        <Kpi label="Avg CPQ→commit" value="6.2 days" delta="−1.4d" tone="good" />
        <Kpi label="Order value · 30d" value="£24.6M" delta="ARR-impacting" tone="good" />
      </div>

      <CortexCard title="Cortex Agent · order decomposition"
        body="Lloyds 280-branch fleet refresh decomposed into 280 serviceOrderItem calls: 280 × Ericsson gNB activations, 280 × CPE shipments (Cisco), 96 × site surveys, 12 × spectrum-permit checks. Routed to 6 vendors + own field force. Auto-generated activation timeline + customer commitment letter." />

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Order</th>
              <th className="py-1.5 px-2">Customer</th>
              <th className="py-1.5 px-2 text-right">Items</th>
              <th className="py-1.5 px-2">Value</th>
              <th className="py-1.5 px-2">Stage</th>
              <th className="py-1.5 px-2">Commit</th>
            </tr>
          </thead>
          <tbody>
            {tmf622Orders.map((o) => (
              <tr key={o.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{o.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{o.cust}</td>
                <td className="py-1.5 px-2 text-right font-mono">{o.items.toLocaleString()}</td>
                <td className="py-1.5 px-2 font-mono">{o.value}</td>
                <td className="py-1.5 px-2"><span className="vf-chip bg-blue-100 text-blue-700 text-[10px]">{o.stage}</span></td>
                <td className="py-1.5 px-2 font-mono">{o.commit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Order funnel · CPQ to live</div>
          <Funnel
            stages={[
              { label: 'CPQ · proposal accepted',         value: 184, tone: 'good' },
              { label: 'Service order captured (TMF 622)',value: 184, tone: 'good' },
              { label: 'Decomposed · serviceOrderItems',  value: 184, tone: 'good' },
              { label: 'Vendor + FSL routed',             value: 162, tone: 'warn' },
              { label: 'Activation (TMF 641) handover',   value: 96,  tone: 'good' },
              { label: 'Customer hand-over · live',       value: 84,  tone: 'good' },
            ]}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Decomposition · Lloyds 280-branch refresh</div>
          <ul className="text-[11.5px] text-ink space-y-1">
            <li>• <b>280×</b> gNB activations (Ericsson)</li>
            <li>• <b>280×</b> CPE shipments (Cisco)</li>
            <li>• <b>96×</b> site surveys (own field force)</li>
            <li>• <b>12×</b> spectrum-permit checks (Ofcom)</li>
            <li>• <b>4×</b> SLA contracts (Salesforce + DocuSign)</li>
            <li>• <b>1×</b> billing-account creation (Amdocs CES)</li>
          </ul>
          <div className="text-[10px] text-ink-muted mt-2">All routed via <code className="font-mono text-[10px]">silver.orders</code> + agent-driven dispatch in &lt; 4 minutes.</div>
        </div>
      </div>

      <GoldChips chips={['silver.orders', 'silver.quotes', 'gold.order_fallout_features', 'gold.contracts']} />
      <ServiceOrderMlBlock />
      <StandardsRow chips={['TMF 622 · Service Order', 'TMF 648 · Quote', 'TMF 641 · Activation', 'TMF 638 · Inventory', 'Ofcom GC C1']} />
    </div>
  );
}

// ─── B2: TMF 645 Service Assurance ──────────────────────────────────────────
const tickets = [
  { id: 'TT-2026-04812', impact: 'BBC · Broadcasting House', symptom: 'Latency spike LDN-W1', severity: 'High',  age: '34m', mttr_proj: '1h 12m' },
  { id: 'TT-2026-04813', impact: 'Lloyds branch (M14)',      symptom: 'CPE offline',          severity: 'Med',   age: '1h 4m',  mttr_proj: '2h 30m' },
  { id: 'TT-2026-04814', impact: 'Tesco IoT (NW)',           symptom: 'Auth failures',        severity: 'Med',   age: '52m',  mttr_proj: '1h 48m' },
  { id: 'TT-2026-04815', impact: 'Manchester Council CCTV',  symptom: 'Bandwidth degraded',   severity: 'Low',   age: '2h 12m', mttr_proj: '3h 20m' },
  { id: 'TT-2026-04816', impact: 'TfL · 38 sites',           symptom: 'Slice mMTC SR drop',   severity: 'High',  age: '12m',  mttr_proj: '1h 04m' },
];

export function OssAssurance() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Service Assurance (TMF 645)" title="Trouble-ticket workflow" subtitle="Cross-vendor service assurance: NOC alarm → trouble ticket → field action → BSS SLA-credit. Auto-triage + Cortex Search runbook RAG." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Open tickets" value="42" tone="warn" />
        <Kpi label="MTTR (P1)" value="1h 12m" delta="vs 4h baseline" tone="good" />
        <Kpi label="MTTR (P2)" value="3h 24m" delta="−18%" tone="good" />
        <Kpi label="Agent-resolved" value="68%" delta="auto-triage" tone="good" />
        <Kpi label="SLA-credit triggered" value="4" delta="this week" />
        <Kpi label="Cross-vendor escalations" value="8" delta="open" />
      </div>

      <CortexCard title="Auto-triage · Cortex Agent + Cortex Search"
        body="42 tickets in last 4h. assurance_triage_v2 confidence 0.92 — 28 are duplicates of NOC incident MAN-M14, auto-merged. 14 routed: 9 to vendor-A field crews, 4 to own techs (skill-matched), 1 to BSS dispute desk for SLA credit. Avg time-to-triage: 38 sec." />

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Ticket</th>
              <th className="py-1.5 px-2">Impact</th>
              <th className="py-1.5 px-2">Symptom</th>
              <th className="py-1.5 px-2">Sev</th>
              <th className="py-1.5 px-2">Age</th>
              <th className="py-1.5 px-2">MTTR fcst</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{t.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{t.impact}</td>
                <td className="py-1.5 px-2 text-ink-muted">{t.symptom}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', t.severity === 'High' ? 'bg-vfRed text-white' : t.severity === 'Med' ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}>{t.severity}</span></td>
                <td className="py-1.5 px-2 font-mono">{t.age}</td>
                <td className="py-1.5 px-2 font-mono">{t.mttr_proj}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Triage Pareto · symptom × vendor</div>
          <HBar
            data={[
              { label: 'Vendor-A · transport', value: 42, sub: 'fibre splice / optical link' },
              { label: 'Vendor-B · gNB',       value: 24, sub: 'integration · sw upgrade' },
              { label: 'Mavenir · IMS',        value: 14, sub: 'P-CSCF · diameter' },
              { label: 'Oracle · HSS',         value: 10, sub: 'replication · auth' },
              { label: 'Other',                value: 10, sub: '' },
            ]}
            color="#1d4ed8"
            formatter={(v) => `${v}%`}
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Cross-system flow</div>
          <ol className="text-[12px] text-ink space-y-0.5 list-decimal list-inside">
            <li><b>NOC</b> · alarm → incident</li>
            <li><b>OSS · Assurance</b> · trouble ticket opened (TMF 645)</li>
            <li><b>OSS · Field</b> · dispatch (skill-matched)</li>
            <li><b>OSS · Change</b> · CHG raised if change required</li>
            <li><b>BSS · Disputes</b> · SLA-credit auto-evaluated</li>
            <li>Customer notified (Genesys + Sinch + email)</li>
          </ol>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">SLA-credit ladder</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• &lt; 1h MTTR · no credit</li>
            <li>• 1–4h · 5% MRC credit</li>
            <li>• 4–24h · 25% MRC credit</li>
            <li>• &gt; 24h · 50% MRC credit + RCA letter</li>
            <li>• Auto-pushed to <code className="font-mono text-[11px]">gold.disputes</code></li>
          </ul>
        </div>
      </div>

      <GoldChips chips={['silver.case_intake', 'gold.cases', 'gold.disputes', 'gold.sla_register']} />
      <AssuranceMlBlock />
      <StandardsRow chips={['TMF 645 · Trouble Ticket', 'TMF 638 · Inventory', 'ITIL v4 · Incident', 'Ofcom GC C1', 'NIS2']} />
    </div>
  );
}

// ─── B3: Change Management / CAB ────────────────────────────────────────────
const changes = [
  { id: 'CHG0013014', what: 'Catalog v126 publish · 5G SA Unlimited Max',  cls: 'Standard', risk: 'Low',  outcome: 'Approved · auto', when: 'Tonight 02:30' },
  { id: 'CHG0013015', what: 'BH circuit upgrade Manchester M14',            cls: 'Normal',   risk: 'Med',  outcome: 'CAB Tue', when: '2026-05-13' },
  { id: 'CHG0012987', what: 'MLB intra-cluster offset −3dB MAN-M14',        cls: 'Standard', risk: 'Low',  outcome: 'Approved · auto', when: 'Now' },
  { id: 'CHG0013012', what: 'Vendor-A fibre splice repair · LDS-LS2',       cls: 'Standard', risk: 'Low',  outcome: 'Approved · auto', when: '+3h' },
  { id: 'CHG0013011', what: 'Mavenir IMS P-CSCF rate-limit policy',         cls: 'Emergency',risk: 'High', outcome: 'Approved · ECAB', when: 'Last hour' },
  { id: 'CHG0013002', what: 'PCRF rule v124 (mediation suspense recovery)', cls: 'Standard', risk: 'Low',  outcome: 'Implemented · OK', when: '2 days ago' },
];

export function OssChange() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="NOC · Change Management · CAB" title="Change Advisory Board · network change governance" subtitle="Owned by NOC · IT-aligned. CHG / CFR / freeze-window posture. Standard / Normal / Emergency CAB. Ofcom GC A3 PIR drafting on every failed change. Templates + design-for-change come from OSS, execution lives here." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Open changes" value="42" />
        <Kpi label="Change failure rate (CFR)" value="1.4%" delta="−0.4pp" tone="good" />
        <Kpi label="Standard auto-approved" value="84%" delta="zero-touch" tone="good" />
        <Kpi label="Failed CHG · MTTR" value="34m" delta="rollback" tone="good" />
        <Kpi label="Freeze-window posture" value="Normal" delta="no active freeze" tone="good" />
        <Kpi label="PIR draft SLA" value="100%" delta="Ofcom GC A3" tone="good" />
      </div>

      <CortexCard title="Cortex Complete · auto-PIR draft"
        body="When a CHG fails: agent pulls T-30s state via Time Travel, captures alarms + KPI delta + agent-run audit, drafts Post-Implementation Review with 'what we did / what changed / what we'll do differently' — ready in &lt; 4 minutes for Ofcom GC A3 evidence pack." />

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">CHG</th>
              <th className="py-1.5 px-2">What</th>
              <th className="py-1.5 px-2">Class</th>
              <th className="py-1.5 px-2">Risk</th>
              <th className="py-1.5 px-2">Outcome</th>
              <th className="py-1.5 px-2">When</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((c) => (
              <tr key={c.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{c.id}</td>
                <td className="py-1.5 px-2 text-ink">{c.what}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', c.cls === 'Emergency' ? 'bg-vfRed text-white' : c.cls === 'Normal' ? 'bg-amber/30 text-amber-900' : 'bg-blue-100 text-blue-700')}>{c.cls}</span></td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', c.risk === 'High' ? 'bg-vfRed text-white' : c.risk === 'Med' ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}>{c.risk}</span></td>
                <td className="py-1.5 px-2 text-ink">{c.outcome}</td>
                <td className="py-1.5 px-2 font-mono text-ink-muted">{c.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">CAB calendar · 30-day heatmap</div>
          <div className="grid grid-cols-7 gap-1 text-[10px]">
            {Array.from({ length: 30 }).map((_, i) => {
              const v = [12,8,14,9,16,7,4,11,6,15,9,12,8,14,5,12,7,9,11,13,8,14,4,8,11,15,6,9,11,12][i];
              const t = v / 16;
              const fill = t > 0.7 ? 'bg-blue-700 text-white' : t > 0.45 ? 'bg-blue-400 text-white' : t > 0.2 ? 'bg-blue-200 text-blue-900' : 'bg-mist text-ink-muted';
              return <div key={i} className={cn('h-7 rounded grid place-items-center font-mono font-bold', fill)}>{v}</div>;
            })}
          </div>
          <div className="text-[10px] text-ink-muted mt-1.5">Daily change volume across all classes. Clear weekend pattern. 1 emergency CAB this period (CHG0013011).</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Change types · 30 days</div>
          <Donut
            data={[
              { label: 'Standard (auto)',  value: 312, color: '#1d4ed8' },
              { label: 'Normal · CAB',     value: 38,  color: '#3b82f6' },
              { label: 'Emergency · ECAB', value: 4,   color: '#dc2626' },
              { label: 'Failed → rollback',value: 5,   color: '#f59e0b' },
            ]}
            size={150}
          />
        </div>
      </div>

      <GoldChips chips={['gold.change_register', 'silver.change_authoring', 'gold.incident_master', 'gold.decision_lineage']} />
      <CabMlBlock />
      <StandardsRow chips={['ITIL v4 · Change Enablement', 'Ofcom GC A3 · PIR', 'NIS2', 'ISO 27001 · A.12.1', 'SOX (where applicable)']} />
    </div>
  );
}

// ─── B4: Network Inventory / Topology ───────────────────────────────────────
const sites = [
  { id: 'SITE-LDN-CW-A', region: 'London',  vendor: 'Ericsson', tech: '4G/5G NSA + SA', circuits: 4, services: 184 },
  { id: 'SITE-MAN-PIC-1',region: 'NW',      vendor: 'Nokia',    tech: '4G/5G NSA',     circuits: 3, services: 142 },
  { id: 'SITE-BIR-B4-A', region: 'WM',      vendor: 'Ericsson', tech: '4G + 5G NSA',   circuits: 2, services: 96 },
  { id: 'SITE-LDS-LS2-1',region: 'Yorks',   vendor: 'Nokia',    tech: '4G/5G NSA',     circuits: 3, services: 84 },
  { id: 'SITE-NYK-DAL-A',region: 'Yorks',   vendor: 'Ericsson', tech: '4G',            circuits: 1, services: 28 },
  { id: 'SITE-EDI-EH1-1',region: 'Scot',    vendor: 'Ericsson', tech: '4G/5G NSA',     circuits: 2, services: 72 },
];

export function OssTopology() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Network Inventory · Physical" title="Sites · circuits · spectrum" subtitle="Cramer / Netcracker physical view. Sites × racks × circuits × spectrum. Impact graph: pick a node → impacted services + customers." />

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Sites" value="21,400" />
        <Kpi label="Cells (4G+5G)" value="184k" />
        <Kpi label="IPRAN nodes" value="3,840" />
        <Kpi label="Active circuits" value="42,800" />
        <Kpi label="Spectrum (MHz)" value="940" delta="across bands" />
        <Kpi label="Inventory accuracy" value="99.2%" delta="vs CMDB" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1">
          <OssUkHeatmap title="Sites by region" />
        </div>
        <div className="lg:col-span-2 vf-card p-3 overflow-x-auto">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top 6 sites by service density</div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr className="text-left">
                <th className="py-1.5 px-2">Site</th>
                <th className="py-1.5 px-2">Region</th>
                <th className="py-1.5 px-2">Vendor</th>
                <th className="py-1.5 px-2">Tech mix</th>
                <th className="py-1.5 px-2 text-right">Circuits</th>
                <th className="py-1.5 px-2 text-right">Services</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id} className="border-b border-mist-dark/60">
                  <td className="py-1.5 px-2 font-mono text-[11px] text-ink">{s.id}</td>
                  <td className="py-1.5 px-2 text-ink-muted">{s.region}</td>
                  <td className="py-1.5 px-2"><span className="vf-chip bg-mist text-ink-muted text-[10px]">{s.vendor}</span></td>
                  <td className="py-1.5 px-2 text-ink-muted">{s.tech}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{s.circuits}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">{s.services}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Impact graph · "what breaks if PE-LDN-1 fails?"</div>
          <ImpactGraph />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Spectrum holdings (MHz)</div>
          <HBar
            data={[
              { label: '700 MHz',  value: 30, sub: 'low-band coverage' },
              { label: '800 MHz',  value: 20, sub: '4G core' },
              { label: '1800 MHz', value: 60, sub: '4G capacity' },
              { label: '2100 MHz', value: 60, sub: '4G urban' },
              { label: '2600 MHz', value: 50, sub: '4G' },
              { label: '3.4–3.8 GHz', value: 80, sub: '5G C-band' },
              { label: '26 GHz', value: 850, sub: '5G mmWave (trial)' },
            ]}
            color="#1d4ed8"
            formatter={(v) => `${v} MHz`}
          />
        </div>
      </div>

      <GoldChips chips={['silver.inventory_state', 'gold.topology_snapshot', 'silver.cmdb_relationships', 'gold.site_inventory']} />
      <TopologyMlBlock />
      <StandardsRow chips={['TMF 638 · Inventory', 'TMF 633 · Service', 'ITIL v4 · CMDB', 'Ofcom · spectrum', 'NIS2']} />
    </div>
  );
}

function ImpactGraph() {
  // Tiny graph: PE-LDN-1 → CKT-LDN-W1-001 → SVC-LDN-145 (BBC) + SVC-LDN-028 (TfL) ...
  return (
    <svg viewBox="0 0 460 220" className="w-full">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      {/* Root */}
      <g>
        <rect x={20} y={90} width={130} height={36} rx={6} fill="#dc2626" />
        <text x={85} y={107} fontSize="11" fontWeight={800} textAnchor="middle" fill="#fff">PE-LDN-1</text>
        <text x={85} y={120} fontSize="9.5" textAnchor="middle" fill="#fee2e2">root failure</text>
      </g>
      {/* Circuits */}
      {[0, 1, 2].map((i) => {
        const cy = 50 + i * 60;
        return (
          <g key={i}>
            <line x1={150} y1={108} x2={210} y2={cy + 14} stroke="#94a3b8" strokeWidth={1.4} markerEnd="url(#arr)" />
            <rect x={210} y={cy} width={110} height={28} rx={5} fill="#fff" stroke="#0c4a6e" />
            <text x={265} y={cy + 18} fontSize="10.5" textAnchor="middle" fontWeight={700} fill="#0c4a6e">{['CKT-LDN-W1-001', 'CKT-LDN-W1-014', 'CKT-LDN-W2-022'][i]}</text>
          </g>
        );
      })}
      {/* Services */}
      {[0, 1, 2, 3].map((i) => {
        const cy = 24 + i * 50;
        return (
          <g key={i}>
            <line x1={320} y1={[60, 60, 120, 180][i] + 14} x2={360} y2={cy + 14} stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#arr)" />
            <rect x={360} y={cy} width={92} height={28} rx={5} fill="#fff" stroke="#10B981" />
            <text x={406} y={cy + 18} fontSize="10.5" textAnchor="middle" fontWeight={700} fill="#065f46">
              {['SVC-LDN-145 · BBC', 'SVC-LDN-028 · TfL', 'SVC-LDN-090 · LSE', 'SVC-LDN-122 · Tesco'][i]}
            </text>
          </g>
        );
      })}
      <text x={20} y={20} fontSize="10" fill="#0f172a" fontWeight={700}>Impact: 184 services · 12 Tier-1 customers · auto-drafted comms email pack ready.</text>
    </svg>
  );
}
