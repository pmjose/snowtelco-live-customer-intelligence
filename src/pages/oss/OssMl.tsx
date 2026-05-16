import { motion } from 'framer-motion';
import { useEffect, useState, Fragment } from 'react';
import {
  Bot, Sparkles, ArrowRight, Activity, AlertTriangle, Cpu, Gauge as GaugeIcon, Zap, ShieldCheck, GitBranch, BarChart3, Layers, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Treemap, ParetoChart, BandedLineChart, Histogram, StackedAreaChart, StackedDeltaBars } from '@/pages/bss/BssExtended';

// ════════════════════════════════════════════════════════════════════════════
//  OSS · shared ML primitives kit (blue accent)
// ════════════════════════════════════════════════════════════════════════════

export interface ModelMeta {
  name: string;
  version: string;
  metric: string;       // e.g. "MAPE 8%" or "AUROC 0.92"
  metricTone?: 'good' | 'warn' | 'bad';
  drift: 'stable' | 'watch' | 'drift';
  refreshed: string;    // e.g. "5 min ago"
  owner: string;        // team
  blurb?: string;
}

const driftTone: Record<ModelMeta['drift'], string> = {
  stable: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  watch:  'bg-amber-100 text-amber-800 border-amber/30',
  drift:  'bg-vfRed text-white border-vfRed',
};

export function MlBadge({ model }: { model: string }) {
  return (
    <span className="vf-chip text-[9.5px] bg-blue-50 text-blue-700 border border-blue-200 font-mono inline-flex items-center gap-1">
      <Bot className="w-2.5 h-2.5" /> ML · {model}
    </span>
  );
}

export function ModelCard({ m, accent = true }: { m: ModelMeta; accent?: boolean }) {
  const goodMetric = m.metricTone === 'good' || (!m.metricTone && /MAPE\s*[0-9]/.test(m.metric)); 
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={cn('vf-card p-3', accent && 'border-l-4 border-l-blue-700')}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 grid place-items-center"><Cpu className="w-3.5 h-3.5" /></div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-ink text-[12.5px] leading-tight font-mono truncate">{m.name}</div>
          <div className="text-[10px] text-ink-muted">v{m.version} · owner {m.owner}</div>
        </div>
        <span className={cn('vf-chip border text-[9.5px] font-bold', driftTone[m.drift])}>{m.drift === 'stable' ? '● stable' : m.drift === 'watch' ? '● watch' : '● drift'}</span>
      </div>
      {m.blurb && <div className="text-[11px] text-ink-muted leading-snug mb-1.5">{m.blurb}</div>}
      <div className="flex items-center justify-between text-[11px]">
        <span className={cn('font-mono font-bold', goodMetric ? 'text-emerald-700' : 'text-ink')}>{m.metric}</span>
        <span className="text-ink-muted">refreshed {m.refreshed}</span>
      </div>
    </motion.div>
  );
}

export function ModelRegistryStrip({ models }: { models: ModelMeta[] }) {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-700" />
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">OSS model registry · live</span>
        <span className="ml-auto text-[10px] text-ink-muted">{models.length} production models · all refreshed in last 24h</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {models.map((m) => <ModelCard key={m.name} m={m} accent={false} />)}
      </div>
    </div>
  );
}

// ─── Feature importance · animated horizontal bars ──────────────────────────
export function FeatureImportance({ title, features, modelHint }: { title: string; features: { label: string; value: number }[]; modelHint?: string }) {
  const max = Math.max(...features.map((f) => f.value));
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{title}</span>
        {modelHint && <span className="ml-auto"><MlBadge model={modelHint} /></span>}
      </div>
      <div className="space-y-1.5">
        {features.map((f, i) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[11px] text-ink w-[140px] truncate shrink-0">{f.label}</span>
            <div className="relative flex-1 h-3 rounded bg-mist">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(f.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-blue-700 to-blue-400"
              />
            </div>
            <span className="text-[10.5px] font-mono font-bold text-blue-700 w-10 text-right">{f.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="text-[9.5px] text-ink-muted mt-1.5">SHAP-based importance · top {features.length} features · refreshed nightly.</div>
    </div>
  );
}

// ─── Confidence gauge · semi-circle with animated needle ────────────────────
export function ConfidenceGauge({ label, value, tone = 'blue', subLabel }: { label: string; value: number; tone?: 'blue' | 'emerald' | 'amber' | 'red'; subLabel?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const angle = -90 + (v / 100) * 180;
  const colorMap = { blue: '#1d4ed8', emerald: '#10b981', amber: '#f59e0b', red: '#dc2626' };
  const c = colorMap[tone];
  return (
    <div className="vf-card p-3 flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold w-full text-left">{label}</div>
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px] mt-1">
        {/* Track */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth={14} strokeLinecap="round" />
        {/* Coloured arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={c}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={Math.PI * 80}
          initial={{ strokeDashoffset: Math.PI * 80 }}
          whileInView={{ strokeDashoffset: Math.PI * 80 * (1 - v / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        />
        {/* Needle */}
        <motion.line
          x1={100} y1={100} x2={100} y2={32}
          stroke={c} strokeWidth={3} strokeLinecap="round"
          initial={{ rotate: -90, originX: 100, originY: 100 } as any}
          whileInView={{ rotate: angle }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{ originX: '100px', originY: '100px' } as any}
        />
        <circle cx={100} cy={100} r={5} fill={c} />
        <text x={100} y={92} fontSize="22" fontWeight={800} textAnchor="middle" fill="#0f172a" className="font-mono">
          {Math.round(v)}%
        </text>
      </svg>
      {subLabel && <div className="text-[10.5px] text-ink-muted -mt-1 text-center">{subLabel}</div>}
    </div>
  );
}

// ─── Forecast vs actual · line + confidence band ────────────────────────────
export function ForecastVsActual({ title, actual, forecast, lo, hi, labels, modelHint }: { title: string; actual: number[]; forecast: number[]; lo: number[]; hi: number[]; labels: string[]; modelHint?: string }) {
  const all = [...actual, ...forecast, ...lo, ...hi];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const W = 480, H = 160, pad = 28;
  const xAt = (i: number, len: number) => pad + (i * (W - pad * 2)) / Math.max(1, len - 1);
  const yAt = (v: number) => pad + (1 - (v - min) / Math.max(1, max - min)) * (H - pad * 2);
  const total = labels.length;
  const actualPath = actual.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, total)} ${yAt(v)}`).join(' ');
  const forecastPath = forecast.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(actual.length + i - 1, total)} ${yAt(v)}`).join(' ');
  const bandPath = (() => {
    const ups = hi.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(actual.length + i - 1, total)} ${yAt(v)}`).join(' ');
    const dns = lo.map((v, i) => `L ${xAt(actual.length + lo.length - 1 - i, total)} ${yAt(lo[lo.length - 1 - i])}`).join(' ');
    return `${ups} ${dns} Z`;
  })();
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{title}</span>
        {modelHint && <span className="ml-auto"><MlBadge model={modelHint} /></span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <motion.path d={bandPath} fill="#bfdbfe" fillOpacity={0.5} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} />
        <motion.path d={actualPath} fill="none" stroke="#0f172a" strokeWidth={2} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} />
        <motion.path d={forecastPath} fill="none" stroke="#1d4ed8" strokeWidth={2} strokeDasharray="4 3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }} />
        {/* x labels */}
        {labels.map((l, i) => i % Math.ceil(total / 6) === 0 && (
          <text key={i} x={xAt(i, total)} y={H - 6} fontSize="9" fill="#94a3b8" textAnchor="middle">{l}</text>
        ))}
      </svg>
      <div className="flex items-center gap-3 text-[10px] text-ink-muted mt-1">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5 bg-ink rounded" /> Actual</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-700 rounded" style={{ borderTop: '2px dashed #1d4ed8' }} /> Forecast</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded bg-blue-200/80" /> 95% confidence band</span>
      </div>
    </div>
  );
}

// ─── Decision flow · agent pipe with particles ──────────────────────────────
export function DecisionFlow({ stops, modelHint }: { stops: string[]; modelHint?: string }) {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-3.5 h-3.5 text-blue-700" />
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Agentic decision pipe</span>
        {modelHint && <span className="ml-auto"><MlBadge model={modelHint} /></span>}
      </div>
      <svg viewBox="0 0 600 90" className="w-full">
        <defs>
          <linearGradient id="ossPipe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <line x1={40} y1={45} x2={560} y2={45} stroke="url(#ossPipe)" strokeWidth={3} strokeLinecap="round" />
        <path id="ossPipePath" d="M 40 45 L 560 45" fill="none" />
        {[0, 1, 2].map((i) => (
          <circle key={i} r={4.5} fill="#1d4ed8">
            <animateMotion dur={`${4.2 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 1.4}s`}>
              <mpath href="#ossPipePath" />
            </animateMotion>
          </circle>
        ))}
        {stops.map((s, i) => {
          const x = 40 + (i * 520) / Math.max(1, stops.length - 1);
          return (
            <g key={s + i}>
              <circle cx={x} cy={45} r={9} fill="#fff" stroke="#1d4ed8" strokeWidth={2.4} />
              <text x={x} y={49} fontSize="10" fontWeight={800} textAnchor="middle" fill="#1d4ed8">{i + 1}</text>
              <text x={x} y={20} fontSize="10.5" fontWeight={700} textAnchor="middle" fill="#0f172a">{s}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── 24h agent activity counter ─────────────────────────────────────────────
export function OssAgentCounter() {
  const SIGNALS_PER_SEC = 980;     // OSS-scoped (~85M/day)
  const DECISIONS_PER_SEC = 14;    // ~1.2M/day
  const ACTIONS_PER_SEC   = 2;     // ~170k/day
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const fmt = (n: number) => Math.floor(n).toLocaleString();
  return (
    <div className="vf-card p-3 inline-flex flex-wrap items-center gap-2">
      <span className="relative inline-flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-bold">OSS agentic activity · this session</span>
      <Counter label="signals processed" value={fmt(t * SIGNALS_PER_SEC)} />
      <span className="text-ink-muted">·</span>
      <Counter label="agent decisions" value={fmt(t * DECISIONS_PER_SEC)} />
      <span className="text-ink-muted">·</span>
      <Counter label="closed-loop actions" value={fmt(t * ACTIONS_PER_SEC)} />
    </div>
  );
}
function Counter({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-base font-extrabold font-mono tabular-nums text-ink">{value}</span>
      <span className="text-[10px] text-ink-muted">{label}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Pre-composed page blocks
// ════════════════════════════════════════════════════════════════════════════

// ─── Overview ──────────────────────────────────────────────────────────────
export function OverviewMlBlock() {
  const models: ModelMeta[] = [
    { name: 'order_fallout_v2.1',   version: '2.1', metric: 'AUROC 0.94', drift: 'stable', refreshed: '12m ago', owner: 'BSS-OSS DS', blurb: 'Order fallout propensity.' },
    { name: 'cfr_predict_v3',       version: '3.0', metric: 'MAPE 6%',    drift: 'stable', refreshed: '4h ago',  owner: 'OSS-CHG',    blurb: 'Change-failure-rate forecast.' },
    { name: 'mttr_predict_v3',      version: '3.0', metric: 'MAPE 11%',   drift: 'watch',  refreshed: '8m ago',  owner: 'OSS-Assure', blurb: 'Trouble-ticket MTTR.' },
    { name: 'capacity_forecast_v2', version: '2.4', metric: 'MAPE 8%',    drift: 'stable', refreshed: '1h ago',  owner: 'OSS-Plan',   blurb: '12-month per-cluster forecast.' },
    { name: 'energy_save_v3',       version: '3.1', metric: 'reward 0.78',drift: 'stable', refreshed: '6m ago',  owner: 'OSS-ESG',    blurb: 'RL energy-save policy.' },
    { name: 'inventory_drift_v3',   version: '3.0', metric: 'F1 0.91',    drift: 'stable', refreshed: 'nightly', owner: 'OSS-Inv',    blurb: 'Multi-source drift detection.' },
  ];
  return (
    <div className="space-y-3">
      <ModelRegistryStrip models={models} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-start">
        <DecisionFlow
          stops={['silver.work_orders', 'gold.fieldforce_routing', 'route_optimiser_v2', 'ServiceNow CHG · dispatched']}
          modelHint="route_optimiser_v2"
        />
        <OssAgentCounter />
      </div>
    </div>
  );
}

// ─── Service Order ─────────────────────────────────────────────────────────
export function ServiceOrderMlBlock() {
  const features = [
    { label: 'Vendor on-time history',   value: 0.31 },
    { label: 'Customer commit window',   value: 0.22 },
    { label: 'Spectrum / permit risk',   value: 0.15 },
    { label: 'Site survey backlog',      value: 0.13 },
    { label: 'Field-force load (region)',value: 0.10 },
    { label: 'Stockout-risk on parts',   value: 0.09 },
  ];
  const actual   = [88, 89, 90, 91, 92, 92, 93, 94, 94, 95];
  const forecast = [95, 95, 96, 96, 97];
  const lo       = [93, 93, 94, 93, 94];
  const hi       = [97, 98, 98, 99, 99];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'order_jeopardy_v3', version: '3.0', metric: 'AUROC 0.93', drift: 'stable', refreshed: '12m ago', owner: 'OSS-Order', blurb: 'Predicts probability of breaching customer-commit date per active service order.' }} />
        <ConfidenceGauge label="Top-risk order · jeopardy probability" value={62} tone="amber" subLabel="Tesco · IoT mMTC nationwide · O-002" />
        <ConfidenceGauge label="Lloyds 280-branch · on-time confidence" value={88} tone="emerald" subLabel="6-day commit window" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FeatureImportance title="Jeopardy drivers · SHAP top 6" features={features} modelHint="order_jeopardy_v3" />
        <ForecastVsActual title="On-time-commit · 12-week forecast" actual={actual} forecast={forecast} lo={lo} hi={hi}
          labels={['W-9','W-8','W-7','W-6','W-5','W-4','W-3','W-2','W-1','W0','W+1','W+2','W+3','W+4','W+5']}
          modelHint="commit_forecast_v1" />
      </div>
    </div>
  );
}

// ─── Activation ────────────────────────────────────────────────────────────
export function ActivationMlBlock() {
  const buckets = [
    { label: '<1d', count: 12 },
    { label: '1d',  count: 38 },
    { label: '2d',  count: 64 },
    { label: '3d',  count: 42 },
    { label: '4d',  count: 18 },
    { label: '5d+', count: 10 },
  ];
  const features = [
    { label: 'Auto-orchestration eligible', value: 0.34 },
    { label: 'Vendor delivery lead-time',  value: 0.22 },
    { label: 'Spectrum permit', value: 0.14 },
    { label: 'Site survey green', value: 0.11 },
    { label: 'CPE in stock', value: 0.10 },
    { label: 'Field-force backlog', value: 0.09 },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <ModelCard m={{ name: 'activation_eta_v2', version: '2.0', metric: 'MAPE 14%', drift: 'stable', refreshed: '20m ago', owner: 'OSS-Activate', blurb: 'Per-order ETA regression. Used for customer-comms freshness.' }} />
      <div className="vf-card p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Time-to-activate · distribution</span>
          <span className="ml-auto"><MlBadge model="activation_eta_v2" /></span>
        </div>
        <Histogram buckets={buckets} mean={2.4} />
        <div className="text-[10px] text-ink-muted mt-1">Mean 2.4d · p95 4.6d · auto-flagged tail = at-risk orders.</div>
      </div>
      <FeatureImportance title="Auto-orchestration · top features" features={features} modelHint="auto_orchestration_v3" />
    </div>
  );
}

// ─── Inventory ─────────────────────────────────────────────────────────────
export function InventoryMlBlock() {
  // 5 sources × 7 days drift heatmap
  const sources = ['Netcracker', 'Cramer', 'NetAct', 'ENM', 'CMDB'];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const matrix = [
    [3, 4, 2, 5, 3, 4, 4],
    [5, 6, 7, 5, 4, 5, 6],
    [2, 1, 3, 2, 2, 1, 2],
    [4, 4, 5, 3, 4, 4, 5],
    [3, 2, 2, 4, 3, 2, 3],
  ];
  const max = Math.max(...matrix.flat());
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <ModelCard m={{ name: 'inventory_drift_v3', version: '3.0', metric: 'F1 0.91', drift: 'stable', refreshed: 'nightly', owner: 'OSS-Inv', blurb: 'Detects mismatches across Netcracker / Cramer / vendor EMS / CMDB.' }} />
      <div className="vf-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Drift heatmap · source × day</span>
          <span className="ml-auto"><MlBadge model="inventory_drift_v3" /></span>
        </div>
        <div className="grid grid-cols-[80px_repeat(7,_1fr)] gap-1 text-[10px]">
          <span></span>
          {days.map((d) => <div key={d} className="text-center font-bold text-ink-muted">{d}</div>)}
          {sources.map((s, i) => (
            <Fragment key={s}>
              <div className="text-[10px] font-bold text-ink-muted self-center">{s}</div>
              {matrix[i].map((v, j) => {
                const t = v / max;
                const fill = t > 0.7 ? 'bg-blue-700 text-white' : t > 0.45 ? 'bg-blue-400 text-white' : t > 0.2 ? 'bg-blue-200 text-blue-900' : 'bg-mist text-ink-muted';
                return (
                  <motion.div key={`${s}-${j}`} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i * 7 + j) * 0.015 }}
                    className={cn('h-7 rounded font-mono font-bold grid place-items-center', fill)}>
                    {v}
                  </motion.div>
                );
              })}
            </Fragment>
          ))}
        </div>
        <div className="text-[10px] text-ink-muted mt-1.5">Cramer mid-week peaks (legacy fixed-line). Auto-merge clears 78% nightly.</div>
      </div>
      <ParetoChart items={[
        { label: 'Cramer · attribute drift', value: 38 },
        { label: 'NetAct · stale assets',    value: 24 },
        { label: 'CMDB · missing CIs',       value: 18 },
        { label: 'ENM · serial mismatch',    value: 12 },
        { label: 'Manual edits',             value: 8 },
      ]} />
    </div>
  );
}

// ─── Topology / Network Inventory ──────────────────────────────────────────
export function TopologyMlBlock() {
  const features = [
    { label: 'Customer count downstream', value: 0.36 },
    { label: 'SLA tier of impacted',      value: 0.21 },
    { label: 'Redundancy depth',          value: 0.15 },
    { label: 'Recent alarm history',      value: 0.11 },
    { label: 'Traffic class (URLLC)',     value: 0.09 },
    { label: 'Recent CHG activity',       value: 0.08 },
  ];
  const treemap = [
    { label: 'Ericsson · RAN', value: 38, margin: 0.62 },
    { label: 'Nokia · RAN',    value: 24, margin: 0.58 },
    { label: 'Cisco · transport', value: 14, margin: 0.71 },
    { label: 'Juniper · transport', value: 10, margin: 0.66 },
    { label: 'Mavenir · IMS',  value: 8,  margin: 0.74 },
    { label: 'Other',          value: 6,  margin: 0.50 },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <ModelCard m={{ name: 'topology_blast_radius_v2', version: '2.1', metric: 'AUROC 0.91', drift: 'stable', refreshed: '1h ago', owner: 'OSS-Topo', blurb: 'Ranks blast radius for any node failure across the impact graph.' }} />
      <FeatureImportance title="Blast-radius drivers" features={features} modelHint="topology_blast_radius_v2" />
      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Resources · vendor × tech</div>
        <Treemap items={treemap} />
      </div>
    </div>
  );
}

// ─── Assurance ─────────────────────────────────────────────────────────────
export function AssuranceMlBlock() {
  const data = [98, 102, 95, 88, 84, 78, 74, 72, 70, 68, 66, 65];
  const lo   = [92, 96, 89, 82, 78, 72, 68, 66, 64, 62, 60, 58];
  const hi   = [104,108, 101,94, 90, 84, 80, 78, 76, 74, 72, 72];
  const buckets = [
    { label: '<30m', count: 14 },
    { label: '30–60m', count: 22 },
    { label: '1–2h', count: 18 },
    { label: '2–4h', count: 8 },
    { label: '4h+', count: 4 },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'assurance_triage_v2', version: '2.0', metric: 'F1 0.92', drift: 'stable', refreshed: '8m ago', owner: 'OSS-Assure', blurb: 'Auto-triage + dedupe + skill-route for trouble tickets.' }} />
        <ConfidenceGauge label="Severity classifier · top-priority TT" value={94} tone="emerald" subLabel="severity_classifier_v2" />
        <ConfidenceGauge label="Auto-resolve confidence · TT-04816" value={71} tone="blue" subLabel="TfL · 38 sites · slice mMTC" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BandedLineChart data={data} bands={[{ color: '#10b981', min: Math.min(...lo), max: Math.max(...hi) }]} label="MTTR (min) · last 12 weeks · forecast band (mttr_predict_v3)" />
        <div className="vf-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Ticket-age distribution · current open</span>
            <span className="ml-auto"><MlBadge model="mttr_predict_v3" /></span>
          </div>
          <Histogram buckets={buckets} mean={1.8} />
        </div>
      </div>
    </div>
  );
}

// ─── Field Force ───────────────────────────────────────────────────────────
export function FieldForceMlBlock() {
  const features = [
    { label: 'Parts on-hand match',  value: 0.32 },
    { label: 'Skill match score',    value: 0.24 },
    { label: 'Drive distance (km)',  value: 0.16 },
    { label: 'Tech tenure (yrs)',    value: 0.12 },
    { label: 'Prior-fix history',    value: 0.10 },
    { label: 'Weather risk',         value: 0.06 },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'route_optimiser_v2', version: '2.3', metric: '−14 rolls/day', drift: 'stable', refreshed: '4m ago', owner: 'OSS-Field', blurb: 'Skill-aware route optimiser · live traffic + telematics.' }} />
        <ModelCard m={{ name: 'ftf_predict_v1', version: '1.4', metric: 'AUROC 0.88', drift: 'stable', refreshed: '20m ago', owner: 'OSS-Field', blurb: 'First-time-fix probability before dispatch.' }} />
        <RouteOptimiserAnimated />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FeatureImportance title="First-time-fix · top features" features={features} modelHint="ftf_predict_v1" />
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tech utilisation · live · by region</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { region: 'NW',  v: 84 },
              { region: 'YH',  v: 71 },
              { region: 'LDN', v: 92 },
              { region: 'SCOT',v: 64 },
            ].map((g) => <ConfidenceGauge key={g.region} label={`Region · ${g.region}`} value={g.v} tone={g.v > 90 ? 'red' : g.v > 75 ? 'amber' : 'blue'} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteOptimiserAnimated() {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live route · depot → 4 jobs</span>
        <span className="ml-auto"><MlBadge model="route_optimiser_v2" /></span>
      </div>
      <svg viewBox="0 0 320 160" className="w-full">
        <circle cx={40} cy={80} r={9} fill="#1d4ed8" />
        <text x={40} y={106} fontSize="9" fontWeight={700} textAnchor="middle" fill="#0f172a">Depot</text>
        {[
          { x: 110, y: 40, label: 'WO-1' },
          { x: 180, y: 110, label: 'WO-2' },
          { x: 240, y: 50, label: 'WO-3' },
          { x: 290, y: 120, label: 'WO-4' },
        ].map((j, i) => (
          <g key={j.label}>
            <circle cx={j.x} cy={j.y} r={6} fill="#10b981" />
            <text x={j.x} y={j.y - 10} fontSize="9" fontWeight={700} textAnchor="middle" fill="#065f46">{j.label}</text>
            <path id={`route-${i}`} d={`M 40 80 Q ${(40 + j.x) / 2} ${j.y - 30} ${j.x} ${j.y}`} fill="none" stroke="#3b82f6" strokeWidth={1.6} strokeDasharray="4 3" />
            <circle r={3} fill="#1d4ed8">
              <animateMotion dur={`${2.6 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.5}s`}>
                <mpath href={`#route-${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>
      <div className="text-[10px] text-ink-muted mt-1">Optimised sequence saved 38 min vs baseline. ETAs from Geotab telematics.</div>
    </div>
  );
}

// ─── CAB ───────────────────────────────────────────────────────────────────
export function CabMlBlock() {
  const data = [2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.5, 1.5, 1.4, 1.4, 1.4];
  const lo   = [1.8, 1.7, 1.6, 1.5, 1.5, 1.4, 1.3, 1.2, 1.2, 1.2, 1.2, 1.1];
  const hi   = [2.4, 2.3, 2.2, 2.1, 1.9, 1.8, 1.8, 1.8, 1.7, 1.7, 1.6, 1.6];
  const causes = [
    { label: 'Vendor sw regression',  value: 32 },
    { label: 'Config drift',          value: 22 },
    { label: 'Capacity unsized',      value: 14 },
    { label: 'Insufficient testing',  value: 12 },
    { label: 'Procedural error',      value: 10 },
    { label: 'Other',                 value: 10 },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'cab_auto_approve_v2', version: '2.1', metric: 'AUROC 0.96', drift: 'stable', refreshed: '6m ago', owner: 'OSS-CHG', blurb: 'Standard-CHG auto-approval. Suppresses 84% of routine CAB review.' }} />
        <ModelCard m={{ name: 'cfr_predict_v3', version: '3.0', metric: 'MAPE 6%', drift: 'stable', refreshed: '4h ago', owner: 'OSS-CHG', blurb: 'Change-failure-rate forecast at the change-class level.' }} />
        <ConfidenceGauge label="Next CHG · auto-approval confidence" value={97} tone="emerald" subLabel="CHG0013014 · catalog v126 publish" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BandedLineChart data={data} bands={[{ color: '#1d4ed8', min: Math.min(...lo), max: Math.max(...hi) }]} label="Change failure rate (%) · 12 weeks · forecast band (cfr_predict_v3)" />
        <ParetoChart items={causes} />
      </div>
      <RollbackTimeline />
    </div>
  );
}

function RollbackTimeline() {
  const stops = [
    { t: '00:00', label: 'CHG push',          tone: '#1d4ed8' },
    { t: '+1m',   label: 'Guard breach',      tone: '#f59e0b' },
    { t: '+4m',   label: 'Time Travel rollback', tone: '#10b981' },
    { t: '+8m',   label: 'KPI recovers',      tone: '#10b981' },
  ];
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Failed-change rollback · auto-replay</span>
        <span className="ml-auto"><MlBadge model="cab_rollback_v1" /></span>
      </div>
      <div className="relative px-4">
        <div className="absolute left-4 right-4 top-1/2 h-px bg-mist-dark" />
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute left-4 right-4 top-1/2 h-px bg-blue-700 origin-left" />
        <div className="grid grid-cols-4 gap-2 relative">
          {stops.map((s, i) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.25 }}
              className="flex flex-col items-center text-center">
              <div className="w-7 h-7 rounded-full grid place-items-center border-2 bg-white" style={{ borderColor: s.tone, color: s.tone }}>
                <span className="text-[10px] font-bold font-mono">{i + 1}</span>
              </div>
              <div className="text-[10.5px] font-bold text-ink leading-tight mt-1">{s.label}</div>
              <div className="text-[9.5px] text-ink-muted font-mono">{s.t}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="text-[10px] text-ink-muted mt-2">8-min total · zero customer-impact &gt; 8 min · auto-PIR drafted in 4 min for Ofcom GC A3.</div>
    </div>
  );
}

// ─── Capacity ──────────────────────────────────────────────────────────────
export function CapacityMlBlock() {
  const actual   = [62, 65, 68, 71, 74, 78, 82];
  const forecast = [82, 86, 88, 90, 92, 94];
  const lo       = [80, 84, 86, 88, 90, 91];
  const hi       = [84, 88, 90, 92, 94, 96];
  const features = [
    { label: '5G handset attach',     value: 0.34 },
    { label: 'FWA take-up',           value: 0.22 },
    { label: 'IoT mMTC growth',       value: 0.15 },
    { label: 'Roaming inbound',       value: 0.11 },
    { label: 'Seasonality',           value: 0.10 },
    { label: 'Event overlay',         value: 0.08 },
  ];
  const treemap = [
    { label: '5G expansion',  value: 38, margin: 0.55 },
    { label: '4G capacity',   value: 22, margin: 0.42 },
    { label: 'Transport',     value: 16, margin: 0.61 },
    { label: 'Spectrum',      value: 12, margin: 0.78 },
    { label: 'Small cells',   value: 8,  margin: 0.50 },
    { label: 'Energy retro',  value: 4,  margin: 0.84 },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'capacity_forecast_v2', version: '2.4', metric: 'MAPE 8%', drift: 'stable', refreshed: '1h ago', owner: 'OSS-Plan', blurb: 'Per-cell Prophet + custom · weekly retrain · 90-day MAPE 8%.' }} />
        <ForecastVsActual title="London Canary Wharf · PRB% forecast"
          actual={actual} forecast={forecast} lo={lo} hi={hi}
          labels={['M-6','M-5','M-4','M-3','M-2','M-1','Now','M+1','M+2','M+3','M+4','M+6','M+9','M+12']}
          modelHint="capacity_forecast_v2" />
        <FeatureImportance title="Capacity-breach drivers" features={features} modelHint="capacity_forecast_v2" />
      </div>
      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Capex pipeline · region × technology (margin = ROI proxy)</div>
        <Treemap items={treemap} />
      </div>
    </div>
  );
}

// ─── Energy ────────────────────────────────────────────────────────────────
export function EnergyMlBlock() {
  // 24h kWh by source
  const wind  = [180,170,160,160,170,180,200,220,240,260,260,250,240,240,250,260,270,260,250,240,230,220,210,200];
  const solar = [0,0,0,0,0,5,30,80,140,200,250,280,290,280,250,200,140,80,30,5,0,0,0,0];
  const grid  = [120,120,120,120,120,130,140,160,180,200,200,210,220,220,210,200,180,160,150,140,140,130,130,120];
  const labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'energy_save_v3', version: '3.1', metric: 'reward 0.78', drift: 'stable', refreshed: '6m ago', owner: 'OSS-ESG', blurb: 'RL agent for off-peak 5G suspend · symbol-shutdown · carrier shutdown.' }} />
        <ConfidenceGauge label="Next 60-min · energy-save action confidence" value={86} tone="emerald" subLabel="off-peak 5G suspend on 412 cells" />
        <RlTrainingSparkline />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">kWh sources · last 24h</span>
            <span className="ml-auto"><MlBadge model="energy_save_v3" /></span>
          </div>
          <StackedAreaChart series={[wind, solar, grid]} colors={['#10b981', '#f59e0b', '#94a3b8']} labels={labels} />
          <div className="flex items-center gap-3 text-[10px] text-ink-muted mt-1">
            <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded bg-emerald-500" /> Wind PPA</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded bg-amber-500" /> Solar PPA</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded bg-slate-400" /> Grid (residual)</span>
          </div>
        </div>
        <AnimatedAbatement />
      </div>
    </div>
  );
}

function RlTrainingSparkline() {
  // Episode reward curve over 30 epochs
  const reward = [0.32, 0.35, 0.38, 0.41, 0.44, 0.47, 0.49, 0.52, 0.55, 0.58, 0.60, 0.62, 0.64, 0.66, 0.67, 0.68, 0.70, 0.71, 0.72, 0.73, 0.74, 0.75, 0.75, 0.76, 0.76, 0.77, 0.77, 0.77, 0.78, 0.78];
  const W = 280, H = 90, pad = 12;
  const xAt = (i: number) => pad + (i * (W - pad * 2)) / (reward.length - 1);
  const yAt = (v: number) => pad + (1 - v) * (H - pad * 2);
  const path = reward.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ');
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">RL training · episode reward · last 30 epochs</span>
        <span className="ml-auto"><MlBadge model="energy_save_v3" /></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <motion.path d={path} fill="none" stroke="#10b981" strokeWidth={2}
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
      </svg>
      <div className="text-[10px] text-ink-muted mt-0.5">Latest reward 0.78 · target 0.85 · weekly retrain · Snowpark + GPU SPCS.</div>
    </div>
  );
}

function AnimatedAbatement() {
  const stages = [
    { label: 'Baseline',     value: 39.0, color: '#94a3b8' },
    { label: 'Off-peak 5G',  value: 38.4, color: '#3b82f6' },
    { label: 'Micro-DTX',    value: 38.0, color: '#10b981' },
    { label: 'Carrier off',  value: 37.8, color: '#10b981' },
    { label: 'HVAC',         value: 37.7, color: '#10b981' },
    { label: 'Today',        value: 37.7, color: '#0f172a' },
  ];
  const max = Math.max(...stages.map((s) => s.value));
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Abatement waterfall · animated · GWh / mo</span>
        <span className="ml-auto"><MlBadge model="energy_save_v3" /></span>
      </div>
      <div className="grid grid-cols-6 gap-2 items-end h-[150px]">
        {stages.map((s, i) => (
          <motion.div key={s.label} initial={{ height: 0 }} whileInView={{ height: `${(s.value / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.15 + i * 0.18, ease: 'easeOut' }}
            className="rounded-t-md flex items-end justify-center text-[10px] font-bold text-white pb-1" style={{ background: s.color }}>
            <span>{s.value.toFixed(1)}</span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2 mt-1 text-[9.5px] text-ink-muted text-center">
        {stages.map((s) => <span key={s.label}>{s.label}</span>)}
      </div>
      <div className="text-[10px] text-ink-muted mt-2">Cumulative abatement to today: 1.3 GWh / month (≈ 184t CO₂).</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ENERGY · CSO/CTO-grade extension (Scope 1/2/3 + SBTi pathway + resilience + cost & risk)
// ════════════════════════════════════════════════════════════════════════════

export function EnergyExecExtension() {
  return (
    <div className="space-y-3">
      {/* ── Row 1 · Scope 1/2/3 + SBTi pathway ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ScopeBreakdown />
        <SbtiPathway />
      </div>

      {/* ── Row 2 · Resilience ── */}
      <ResilienceBlock />

      {/* ── Row 3 · Cost & risk ── */}
      <CostAndRiskBlock />

      {/* ── Row 4 · Per-vendor footprint + ML models ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <VendorFootprint />
        <ModelCard m={{ name: 'kwh_demand_forecast_v2', version: '2.1', metric: 'MAPE 5%', drift: 'stable', refreshed: '12m ago', owner: 'OSS-ESG', blurb: 'Next-24h kWh demand · per-site · feeds RL agent + DSR opportunity scorer.' }} />
        <ModelCard m={{ name: 'battery_eol_v2', version: '2.0', metric: 'AUROC 0.91', drift: 'watch', refreshed: '6h ago', owner: 'OSS-Power', blurb: 'Cell-level end-of-life predictor across the 60k battery fleet. Drives proactive replacement.' }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'dsr_opportunity_v1', version: '1.3', metric: 'reward 0.72', drift: 'stable', refreshed: '4m ago', owner: 'OSS-ESG', blurb: 'Demand-Side Response · scores best windows to participate in National Grid DFS / BM. Drives £-positive curtailment.' }} />
        <ModelCard m={{ name: 'site_anomaly_v1', version: '1.6', metric: 'F1 0.88', drift: 'stable', refreshed: '8m ago', owner: 'OSS-ESG', blurb: 'Per-site kWh anomaly detection · flags drift before it becomes a top-10 drainer.' }} />
      </div>

      {/* ── Methodology + cross-domain footnote ── */}
      <div className="vf-card p-3 text-[11px] text-ink-muted leading-snug">
        <span className="font-bold text-ink">Methodology · </span>
        Scope 2 reported on both <b>location-based</b> (UK national grid 158 g/kWh) and <b>market-based</b> (residual mix after PPAs · 142 g/kWh) per GHG Protocol.
        Embodied carbon (Scope 3.1 · purchased equipment) tracked via gNB lifecycle assessments per Ericsson + Nokia disclosures.
        <span className="ml-2 text-blue-700 font-bold">↪ Cross-domain:</span> energy-save misfires causing customer outages &gt; 2h flow into BSS auto-comp evaluation
        (<code className="font-mono text-[10.5px]">gold.disputes</code> · Ofcom GC C5).
      </div>
    </div>
  );
}

// ─── Scope 1/2/3 breakdown ──────────────────────────────────────────────────
function ScopeBreakdown() {
  const scopes = [
    { label: 'Scope 1 · diesel + HVAC', value: 8.4, color: '#dc2626', sub: 'gen-set + cooling at sites' },
    { label: 'Scope 2 · electricity (market-based)', value: 64.2, color: '#1d4ed8', sub: '78% PPA-covered' },
    { label: 'Scope 3 · embodied + supply chain', value: 27.4, color: '#8b5cf6', sub: 'gNB lifecycle + business' },
  ];
  const total = scopes.reduce((n, s) => n + s.value, 0);
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Scope 1 / 2 / 3 split · ktCO₂e / yr</span>
        <span className="ml-auto"><MlBadge model="ghg_inventory_v2" /></span>
      </div>
      <div className="flex h-7 w-full rounded overflow-hidden border border-mist-dark mb-2">
        {scopes.map((s, i) => (
          <motion.div key={s.label}
            initial={{ width: 0 }}
            whileInView={{ width: `${(s.value / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: 'easeOut' }}
            className="h-full grid place-items-center text-[10.5px] font-bold text-white"
            style={{ background: s.color }}>
            {((s.value / total) * 100).toFixed(0)}%
          </motion.div>
        ))}
      </div>
      <ul className="space-y-1.5">
        {scopes.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded" style={{ background: s.color }} />
            <span className="font-bold text-ink truncate flex-1">{s.label}</span>
            <span className="text-ink-muted text-[10.5px] truncate hidden md:inline">{s.sub}</span>
            <span className="font-mono font-bold text-ink ml-auto">{s.value.toFixed(1)} kt</span>
          </li>
        ))}
      </ul>
      <div className="text-[10px] text-ink-muted mt-1.5">Total {total.toFixed(1)} ktCO₂e · CSRD-aligned · external auditor link auto-attached.</div>
    </div>
  );
}

// ─── SBTi pathway line ──────────────────────────────────────────────────────
function SbtiPathway() {
  // Historical (M-24 → Now) + pathway forecast (Now → 2030)
  const labels = ['2020', '2022', '2024', 'Now', '2026', '2028', '2030', '2050'];
  const actual   = [196, 178, 158, 142, NaN, NaN, NaN, NaN];
  const target   = [196, 178, 158, 142, 124, 108, 98,  20];
  const W = 480, H = 160, pad = 28;
  const xAt = (i: number) => pad + (i * (W - pad * 2)) / (labels.length - 1);
  const yMin = 0, yMax = 200;
  const yAt = (v: number) => pad + (1 - (v - yMin) / (yMax - yMin)) * (H - pad * 2);
  const actualPath = actual.map((v, i) => Number.isNaN(v) ? null : `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).filter(Boolean).join(' ');
  const targetPath = target.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ');
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">CO₂ intensity · SBTi pathway · g/kWh</span>
        <span className="ml-auto"><MlBadge model="sbti_pathway_v1" /></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* y-axis ticks */}
        {[0, 50, 100, 150, 200].map((v) => (
          <g key={v}>
            <line x1={pad} y1={yAt(v)} x2={W - pad} y2={yAt(v)} stroke="#e5e7eb" strokeDasharray="2 3" />
            <text x={pad - 6} y={yAt(v) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* Target pathway dashed */}
        <motion.path d={targetPath} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="5 4"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 }} />
        {/* Actual */}
        <motion.path d={actualPath} fill="none" stroke="#1d4ed8" strokeWidth={2.5}
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }} />
        {/* "Now" marker */}
        <line x1={xAt(3)} y1={pad} x2={xAt(3)} y2={H - pad} stroke="#dc2626" strokeOpacity={0.4} strokeDasharray="3 3" />
        <text x={xAt(3)} y={pad - 6} fontSize="9" fontWeight={800} textAnchor="middle" fill="#dc2626">Now · 142</text>
        {/* x labels */}
        {labels.map((l, i) => (
          <text key={l} x={xAt(i)} y={H - 6} fontSize="9" fill="#94a3b8" textAnchor="middle">{l}</text>
        ))}
        {/* Target endpoints */}
        <circle cx={xAt(6)} cy={yAt(98)} r={3.5} fill="#10b981" />
        <text x={xAt(6)} y={yAt(98) - 8} fontSize="9" fontWeight={800} textAnchor="middle" fill="#065f46">SBTi 2030</text>
        <circle cx={xAt(7)} cy={yAt(20)} r={3.5} fill="#10b981" />
        <text x={xAt(7) - 6} y={yAt(20) - 8} fontSize="9" fontWeight={800} textAnchor="end" fill="#065f46">net-zero 2050</text>
      </svg>
      <div className="flex items-center gap-3 text-[10px] text-ink-muted mt-1">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-700" /> Actual (market-based)</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500" style={{ borderTop: '2px dashed #10b981' }} /> SBTi pathway · −50% by 2030</span>
        <span className="ml-auto font-bold text-emerald-700">on-track</span>
      </div>
    </div>
  );
}

// ─── Resilience: battery / diesel / DSR / mains ─────────────────────────────
function ResilienceBlock() {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Resilience · battery · diesel · DSR · mains</span>
        <span className="ml-auto"><MlBadge model="battery_eol_v2" /></span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ResilienceTile
          label="Battery fleet health"
          big="94.2%"
          sub="60,840 cells · 412 flagged for replace"
          tone="emerald"
          bars={[{ k: '<6mo', v: 7 }, { k: '6–12', v: 18 }, { k: '12+', v: 75 }]}
        />
        <ResilienceTile
          label="Diesel generators"
          big="3.4%"
          sub="728 sites · 14 ran > 30m yesterday"
          tone="amber"
          bars={[{ k: 'OK', v: 92 }, { k: 'Low', v: 6 }, { k: 'Crit', v: 2 }]}
        />
        <ResilienceTile
          label="Mains failure rate"
          big="0.31"
          sub="events / site / month · YTD"
          tone="blue"
          bars={[{ k: 'Q1', v: 0.34 }, { k: 'Q2', v: 0.29 }, { k: 'Now', v: 0.31 }]}
        />
        <ResilienceTile
          label="DSR revenue · YTD"
          big="£840k"
          sub="National Grid DFS + BM · 18 events"
          tone="emerald"
          bars={[{ k: 'Apr', v: 120 }, { k: 'May', v: 184 }, { k: 'Jun', v: 248 }]}
        />
      </div>
      <div className="text-[10px] text-ink-muted mt-2">
        DSR (Demand-Side Response) participation is opt-in per site · scored daily by <code className="font-mono text-[10.5px]">dsr_opportunity_v1</code>.
        Battery EoL flagged proactively by <code className="font-mono text-[10.5px]">battery_eol_v2</code> — replaces ~3,200 cells / yr at scheduled FSL truck rolls.
      </div>
    </div>
  );
}

function ResilienceTile({ label, big, sub, tone, bars }: { label: string; big: string; sub: string; tone: 'emerald' | 'amber' | 'blue'; bars: { k: string; v: number }[] }) {
  const toneCls = tone === 'emerald' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-blue-700';
  const max = Math.max(...bars.map((b) => b.v));
  return (
    <div className="vf-card p-3 border border-mist-dark">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className={cn('text-2xl font-extrabold font-mono tabular-nums leading-none mt-1', toneCls)}>{big}</div>
      <div className="text-[10.5px] text-ink-muted mt-1 leading-snug">{sub}</div>
      <div className="grid grid-cols-3 gap-1 mt-2 items-end h-10">
        {bars.map((b, i) => (
          <motion.div key={b.k} initial={{ height: 0 }} whileInView={{ height: `${(b.v / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            className="rounded-t bg-current opacity-75 grid place-items-end justify-center text-[9px] text-white font-mono pb-0.5">
            <span>{b.v}</span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 mt-0.5 text-[9px] text-center text-ink-muted">
        {bars.map((b) => <span key={b.k}>{b.k}</span>)}
      </div>
    </div>
  );
}

// ─── Cost & risk: £/MWh, hedge, peer benchmark, PPA maturity ───────────────
function CostAndRiskBlock() {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Cost & risk · energy is #2 OpEx</span>
        <span className="ml-auto"><MlBadge model="energy_cost_forecast_v1" /></span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* £/MWh tile */}
        <div className="vf-card p-3 border border-mist-dark">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Blended £ / MWh</div>
          <div className="text-2xl font-extrabold font-mono tabular-nums leading-none mt-1 text-ink">£148</div>
          <div className="text-[10.5px] text-emerald-700 font-bold mt-1">−9% YoY · hedge protected</div>
          <div className="text-[10px] text-ink-muted mt-1">Total spend FY £67M · #2 OpEx after labour.</div>
        </div>
        {/* Hedge coverage */}
        <div className="vf-card p-3 border border-mist-dark">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Hedge coverage · forward 24m</div>
          <div className="grid grid-cols-12 gap-0.5 mt-1.5 h-3">
            {Array.from({ length: 24 }).map((_, i) => {
              const v = i < 6 ? 0.95 : i < 12 ? 0.78 : i < 18 ? 0.52 : 0.18;
              const fill = v > 0.7 ? '#10b981' : v > 0.4 ? '#f59e0b' : '#dc2626';
              return <motion.div key={i} initial={{ scaleY: 0 }} whileInView={{ scaleY: v }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.018 }}
                className="h-full origin-bottom rounded-sm" style={{ background: fill }} />;
            })}
          </div>
          <div className="flex justify-between text-[9.5px] text-ink-muted mt-0.5"><span>Now</span><span>+12m</span><span>+24m</span></div>
          <div className="text-[10.5px] text-amber-700 font-bold mt-1">Cliff at +18m</div>
          <div className="text-[10px] text-ink-muted mt-0.5">Treasury action drafted by Cortex Complete.</div>
        </div>
        {/* Peer benchmark */}
        <div className="vf-card p-3 border border-mist-dark">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Peer benchmark · kWh / GB</div>
          <ul className="space-y-1 mt-1.5">
            {[
              { name: 'SnowTelco (us)', v: 0.014, hi: true },
              { name: 'Vodafone UK',    v: 0.018 },
              { name: 'BT EE',          v: 0.021 },
              { name: 'VMO2',           v: 0.024 },
            ].map((p, i) => {
              const max = 0.024;
              return (
                <li key={p.name} className="flex items-center gap-2 text-[10.5px]">
                  <span className={cn('w-[80px] truncate', p.hi ? 'font-extrabold text-blue-700' : 'text-ink-muted')}>{p.name}</span>
                  <div className="relative flex-1 h-2.5 rounded bg-mist">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${(p.v / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                      className={cn('absolute inset-y-0 left-0 rounded', p.hi ? 'bg-blue-700' : 'bg-mist-dark')} />
                  </div>
                  <span className="font-mono font-bold text-ink w-10 text-right">{p.v.toFixed(3)}</span>
                </li>
              );
            })}
          </ul>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">Best-in-class · 33% below peer median.</div>
        </div>
        {/* PPA maturity */}
        <div className="vf-card p-3 border border-mist-dark">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">PPA maturity · MWh / yr</div>
          <div className="space-y-1 mt-1.5">
            {[
              { name: 'Wind A · Glas',    end: '2028', mwh: 240, ok: true },
              { name: 'Wind B · NSea',    end: '2027', mwh: 180, ok: true },
              { name: 'Solar A · Kent',   end: '2026', mwh: 90,  ok: false },
              { name: 'Hydro · Sct',      end: '2030', mwh: 120, ok: true },
            ].map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-[10.5px]">
                <span className="w-[88px] truncate font-bold text-ink">{p.name}</span>
                <span className="font-mono text-ink-muted">{p.mwh}</span>
                <span className={cn('vf-chip text-[9.5px] ml-auto', p.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/30 text-amber-900')}>exp {p.end}</span>
              </div>
            )).map((el, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -4 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 + i * 0.08 }}>
                {el}
              </motion.div>
            ))}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-1">Solar A renewal due Q2 2026.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Per-vendor energy footprint ────────────────────────────────────────────
function VendorFootprint() {
  const vendors = [
    { name: 'Ericsson · 5G AAS',   kwhPerCell: 1.62, share: 38, note: 'Symbol-shutdown ON' },
    { name: 'Nokia · ReefShark',   kwhPerCell: 1.74, share: 24, note: 'Carrier-off ON' },
    { name: 'Mavenir · vRAN',      kwhPerCell: 1.48, share: 8,  note: 'Best-in-class' },
    { name: 'Ericsson · 4G',       kwhPerCell: 0.92, share: 16, note: '— ' },
    { name: 'Nokia · 4G',          kwhPerCell: 0.98, share: 14, note: '— ' },
  ];
  const max = Math.max(...vendors.map((v) => v.kwhPerCell));
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Vendor footprint · kWh / cell / day</span>
        <span className="ml-auto"><MlBadge model="vendor_efficiency_v1" /></span>
      </div>
      <ul className="space-y-1.5">
        {vendors.map((v, i) => (
          <li key={v.name} className="flex items-center gap-2 text-[11px]">
            <span className="w-[140px] truncate font-bold text-ink">{v.name}</span>
            <div className="relative flex-1 h-3 rounded bg-mist">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${(v.kwhPerCell / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.05 + i * 0.06 }}
                className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-blue-700 to-blue-400" />
            </div>
            <span className="font-mono font-bold text-blue-700 w-10 text-right">{v.kwhPerCell.toFixed(2)}</span>
            <span className="text-[10px] text-ink-muted w-[140px] truncate hidden md:inline">{v.note}</span>
          </li>
        ))}
      </ul>
      <div className="text-[10px] text-ink-muted mt-1.5">Mavenir vRAN best-in-class on per-cell consumption · drives vendor RFP scoring.</div>
    </div>
  );
}
