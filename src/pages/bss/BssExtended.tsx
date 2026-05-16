import { useEffect, useMemo, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Headphones, Activity as Pulse, Users, FileText, Calendar, KeyRound,
  Workflow, GitMerge, Banknote, ShieldAlert, Calculator, FileSpreadsheet, GitBranch,
  Building2, Network, Tag, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, ArrowRight, MessageCircle, Mail, Smartphone, Phone, ShoppingCart, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mlByBssPage } from '@/data/mlMeta';
import { customers } from '@/data/customers';
import { MlBadge } from '@/pages/digital/DigitalCharts';
import { BarChart, Donut, Funnel, HBar, Heatmap, LineChart, Sparkline, Waterfall } from '@/components/shared/Charts';

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout primitives (mirrors DigitalExtended.tsx)
// ─────────────────────────────────────────────────────────────────────────────

function PageHeader({ kicker, title, subtitle, badge }: { kicker: string; title: string; subtitle: string; badge?: React.ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">{kicker}</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">{title}</h1>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>
      {badge}
    </header>
  );
}

function KpiTile({ label, value, delta, tone = 'neutral' }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</div>
      {delta && <div className={cn('text-[10px] mt-0.5', toneCls)}>{delta}</div>}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">{children}</div>;
}

function GoldChip({ tables }: { tables: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tables.map((t) => (
        <span key={t} className="vf-chip bg-mist text-ink-muted text-[9px] font-mono"><Sparkles className="w-3 h-3 text-vfRed" /> {t}</span>
      ))}
    </div>
  );
}

function StatusChip({ status }: { status: 'live' | 'scheduled' | 'paused' | 'done' | 'breach' | 'warn' | 'ok' | 'open' | 'closed' }) {
  const tone = status === 'live' || status === 'ok' || status === 'closed' ? 'bg-emerald-100 text-emerald-700'
              : status === 'warn' ? 'bg-amber/20 text-amber-800'
              : status === 'breach' || status === 'paused' ? 'bg-vfRed text-white'
              : status === 'open' ? 'bg-blue-100 text-blue-700'
              : 'bg-mist text-ink-muted';
  return <span className={cn('vf-chip text-[9px] uppercase font-bold', tone)}>{status}</span>;
}

function BssMlBadge({ pageKey }: { pageKey: string }) {
  const meta = mlByBssPage[pageKey];
  if (!meta) return null;
  return <MlBadge meta={meta} />;
}

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Animation primitives
// ─────────────────────────────────────────────────────────────────────────────

function BillRunRing({ pct, label, sub, running = false }: { pct: number; label: string; sub: string; running?: boolean }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div className="vf-card p-3 flex items-center gap-3 min-w-[180px]">
      <div className="relative w-[88px] h-[88px] shrink-0">
        <svg width={88} height={88} viewBox="0 0 88 88">
          <circle cx={44} cy={44} r={r} fill="none" stroke="#eaeaea" strokeWidth={8} />
          <motion.circle
            cx={44} cy={44} r={r} fill="none"
            stroke={running ? '#E11D48' : '#10B981'}
            strokeWidth={8} strokeLinecap="round"
            transform="rotate(-90 44 44)"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <text x={44} y={48} textAnchor="middle" fontSize={14} fontWeight={800} fill="#111">{Math.round(pct)}%</text>
        </svg>
        {running && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-vfRed"
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-ink truncate">{label}</div>
        <div className="text-[10px] text-ink-muted">{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Wholesale / MVNO Billing
// ─────────────────────────────────────────────────────────────────────────────

function MediationFlow({ rate = 28400, suspense = 412 }: { rate?: number; suspense?: number }) {
  const stages = [
    { id: 'ran',   label: 'RAN ingest',  v: rate, color: '#11567F' },
    { id: 'med',   label: 'Mediation',   v: rate, color: '#29B5E8' },
    { id: 'susp',  label: 'Suspense',    v: suspense, color: suspense > 1000 ? '#E11D48' : '#F59E0B' },
    { id: 'rate',  label: 'Rated',       v: rate - suspense, color: '#10B981' },
    { id: 'bill',  label: 'Billed',      v: rate - suspense, color: '#10B981' },
  ];
  return (
    <div className="flex items-stretch gap-1 w-full">
      {stages.map((s, i) => (
        <div key={s.id} className="flex-1 flex items-center">
          <motion.div
            className="flex-1 vf-card p-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold truncate">{s.label}</div>
            <motion.div
              className="text-base font-extrabold font-mono tabular-nums leading-tight"
              style={{ color: s.color }}
              key={s.v}
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {s.v >= 1000 ? `${(s.v / 1000).toFixed(1)}k` : s.v}
            </motion.div>
            <div className="text-[9px] text-ink-muted">{s.id === 'susp' ? 'in queue' : 'events/sec'}</div>
          </motion.div>
          {i < stages.length - 1 && (
            <motion.div
              className="px-1 text-ink-muted"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

function MsisdnGrid() {
  // 40×10 = 400 cells; each = a 10k MSISDN range
  const total = 400;
  const cells = Array.from({ length: total }, (_, i) => {
    const r = (Math.sin(i * 1.7) + 1) / 2;
    const state = r < 0.10 ? 'free' : r < 0.18 ? 'reserved' : r < 0.86 ? 'active' : r < 0.93 ? 'suspended' : 'quarantined';
    return { i, state };
  });
  const colorFor = (s: string) =>
    s === 'free' ? '#9CA3AF'
    : s === 'reserved' ? '#F59E0B'
    : s === 'active' ? '#10B981'
    : s === 'suspended' ? '#11567F'
    : '#E11D48';
  return (
    <div>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(40, minmax(0, 1fr))' }}>
        {cells.map((c) => (
          <motion.div
            key={c.i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (c.i % 40) * 0.005 }}
            className="aspect-square rounded-[1px]"
            style={{ background: colorFor(c.state) }}
            title={`Range ${(7401000000 + c.i * 10000).toString()} · ${c.state}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
        {[
          ['Free', '#9CA3AF'], ['Reserved', '#F59E0B'], ['Active', '#10B981'], ['Suspended', '#11567F'], ['Quarantined', '#E11D48'],
        ].map(([k, c]) => (
          <span key={k} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{k}</span>
        ))}
      </div>
    </div>
  );
}

function PortQueueLadder({ direction = 'in' }: { direction?: 'in' | 'out' }) {
  const stages = ['Validate', 'Exchange', 'Cutover', 'Confirm'];
  const counts = direction === 'in' ? [62, 48, 42, 32] : [22, 28, 26, 16];
  return (
    <div className="space-y-1.5">
      {stages.map((s, i) => (
        <motion.div
          key={s}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: i * 0.12, duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold w-[68px] shrink-0">{s}</span>
          <div className="flex-1 h-5 bg-mist rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: direction === 'in' ? '#11567F' : '#F59E0B' }}
              initial={{ width: 0 }}
              animate={{ width: `${counts[i] * 1.4}%` }}
              transition={{ delay: i * 0.12 + 0.2, duration: 0.6 }}
            />
            <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10.5px] font-mono font-bold text-ink">{counts[i]}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function GlPostingWaterfall() {
  return (
    <Waterfall
      items={[
        { label: 'Opening',           value: 142000, tone: 'total' },
        { label: 'Revenue posted',    value: 38000,  tone: 'pos' },
        { label: 'Refunds & adj',     value: -1200,  tone: 'neg' },
        { label: 'Settlements',       value: 8200,   tone: 'pos' },
        { label: 'Tax & USO',         value: -19400, tone: 'neg' },
        { label: 'COGS / Interconnect', value: -7800, tone: 'neg' },
        { label: 'Closing',           value: 159800, tone: 'total' },
      ]}
      formatter={(v) => `£${(v / 1000).toFixed(0)}k`}
      height={200}
    />
  );
}

function Ifrs15Waterfall() {
  return (
    <Waterfall
      items={[
        { label: 'Q-open deferred',   value: 184000, tone: 'total' },
        { label: 'New obligations',   value: 42000,  tone: 'pos' },
        { label: 'Recognised M1',     value: -14200, tone: 'neg' },
        { label: 'Recognised M2',     value: -14200, tone: 'neg' },
        { label: 'Recognised M3',     value: -14200, tone: 'neg' },
        { label: 'Modifications',     value: -1800,  tone: 'neg' },
        { label: 'Q-close deferred',  value: 181600, tone: 'total' },
      ]}
      formatter={(v) => `£${(v / 1000).toFixed(0)}k`}
      height={200}
    />
  );
}

function DdAttemptLadder() {
  const rows = [
    { label: 'Attempt 1', success: 92, fail: 8 },
    { label: 'Attempt 2', success: 4.6, fail: 3.4 },
    { label: 'Attempt 3', success: 1.8, fail: 1.6 },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-[10.5px] mb-0.5">
            <span className="font-bold text-ink">{r.label}</span>
            <span className="text-ink-muted">success {r.success}% · fail {r.fail}%</span>
          </div>
          <div className="flex h-3 rounded overflow-hidden bg-mist">
            <motion.div initial={{ width: 0 }} animate={{ width: `${r.success}%` }} transition={{ delay: i * 0.15, duration: 0.6 }} className="bg-emerald-500" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${r.fail}%` }} transition={{ delay: i * 0.15 + 0.1, duration: 0.6 }} className="bg-vfRed" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DisputeKanban() {
  const cols = [
    { title: 'Inbox',    color: '#9CA3AF', items: ['DSP-8412 · billing query', 'DSP-8408 · roaming charge', 'DSP-8401 · late fee', 'DSP-8398 · double-charge'] },
    { title: 'Triage',   color: '#F59E0B', items: ['DSP-8392 · device IMEI', 'DSP-8388 · pro-rata wrong'] },
    { title: 'Action',   color: '#11567F', items: ['DSP-8378 · refund £42', 'DSP-8372 · adjustment £18'] },
    { title: 'Closed',   color: '#10B981', items: ['DSP-8358 · resolved', 'DSP-8344 · resolved'] },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {cols.map((c, ci) => (
        <div key={c.title} className="bg-mist/40 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{c.title}</span>
            <span className="ml-auto text-[10px] font-mono text-ink-muted">{c.items.length}</span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence>
              {c.items.map((it, i) => (
                <motion.div
                  key={it}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ci * 0.1 + i * 0.05 }}
                  className="vf-card px-2 py-1.5 text-[11px] text-ink"
                >
                  {it}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromoStackingTree() {
  return (
    <div className="text-[12px] text-ink space-y-1.5 font-mono">
      <div className="flex items-center gap-2"><span className="vf-chip bg-blue-100 text-blue-700 text-[9px]">Offer</span> 5G Hero · £5 first-month credit</div>
      <div className="pl-6 flex items-center gap-2"><span className="text-ink-muted">└─</span><span className="vf-chip bg-mist text-ink-muted text-[9px]">Eligibility</span> match (24,180 customers)</div>
      <div className="pl-6 flex items-center gap-2"><span className="text-ink-muted">└─</span><span className="vf-chip bg-mist text-ink-muted text-[9px]">Eligibility</span> Disney+ trial active (1,840 overlap)</div>
      <div className="pl-12 flex items-center gap-2"><span className="text-ink-muted">└─</span><span className="vf-chip bg-amber/20 text-amber-800 text-[9px]">Conflict</span> stacking policy v3 — only 1 commercial offer / 7d</div>
      <div className="pl-12 flex items-center gap-2"><span className="text-ink-muted">└─</span><span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px]">Resolution</span> keep 5G Hero · suppress Disney trial reminder</div>
      <div className="pl-12 flex items-center gap-2"><span className="text-ink-muted">└─</span><span className="vf-chip bg-mist text-ink-muted text-[9px]">Audit</span> gold.decision_lineage</div>
    </div>
  );
}

function SettlementSankey() {
  const partners = [
    { name: 'Telefónica ES', inflow: 18.4, outflow: 12.2 },
    { name: 'Vodafone DE',   inflow: 14.2, outflow: 11.8 },
    { name: 'Orange FR',     inflow: 9.8,  outflow: 8.4 },
    { name: 'TIM IT',        inflow: 6.4,  outflow: 4.2 },
    { name: 'KPN NL',        inflow: 4.2,  outflow: 3.8 },
  ];
  const max = Math.max(...partners.map(p => Math.max(p.inflow, p.outflow)));
  return (
    <div className="space-y-1.5">
      {partners.map((p, i) => (
        <motion.div key={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 text-[11px]">
          <span className="w-[100px] truncate font-bold text-ink">{p.name}</span>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 h-3 bg-mist rounded relative overflow-hidden">
              <motion.div className="absolute inset-y-0 right-0 bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${(p.inflow / max) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.6 }} />
            </div>
            <span className="font-mono w-[44px] text-right">£{p.inflow.toFixed(1)}M</span>
            <span className="text-ink-muted">vs</span>
            <span className="font-mono w-[44px]">£{p.outflow.toFixed(1)}M</span>
            <div className="flex-1 h-3 bg-mist rounded relative overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 bg-vfRed" initial={{ width: 0 }} animate={{ width: `${(p.outflow / max) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.6 }} />
            </div>
          </div>
          <span className="font-mono font-bold w-[64px] text-right" style={{ color: p.inflow > p.outflow ? '#10B981' : '#E11D48' }}>{p.inflow > p.outflow ? '+' : ''}£{(p.inflow - p.outflow).toFixed(1)}M</span>
        </motion.div>
      ))}
      <div className="flex justify-between text-[9px] text-ink-muted mt-1"><span>Inflow (TAP3 · revenue)</span><span>Net</span><span>Outflow (cost)</span></div>
    </div>
  );
}

function AccountHierarchyTree() {
  const root = { name: 'GreenLeaf Group plc', tier: 'Enterprise', spend: '£42.4k/mo' };
  const children = [
    { name: 'GreenLeaf UK Ltd',  tier: 'BU', spend: '£18.4k/mo', count: 240 },
    { name: 'GreenLeaf Eire',    tier: 'BU', spend: '£8.4k/mo',  count: 92 },
    { name: 'GreenLeaf Logistics', tier: 'BU', spend: '£12.2k/mo', count: 184 },
    { name: 'GreenLeaf Retail',  tier: 'BU', spend: '£3.4k/mo',  count: 64 },
  ];
  return (
    <div className="space-y-1.5 text-[12px] font-mono">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <span className="vf-chip bg-vfRed text-white text-[9px]">{root.tier}</span>
        <span className="font-bold text-ink">{root.name}</span>
        <span className="text-ink-muted">· {root.spend}</span>
      </motion.div>
      {children.map((c, i) => (
        <motion.div key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="pl-6 flex items-center gap-2">
          <span className="text-ink-muted">└─</span>
          <span className="vf-chip bg-mist text-ink-muted text-[9px]">{c.tier}</span>
          <span className="font-bold text-ink">{c.name}</span>
          <span className="text-ink-muted">· {c.spend} · {c.count} lines</span>
        </motion.div>
      ))}
    </div>
  );
}

function CaseQueueKanban() {
  const cols = [
    { title: 'Triage',    color: '#9CA3AF', items: [{ id: 'CASE-9412', sla: 'OK',     pri: 'P3' }, { id: 'CASE-9410', sla: 'OK',     pri: 'P2' }] },
    { title: 'Open',      color: '#F59E0B', items: [{ id: 'CASE-9402', sla: '2h left', pri: 'P1' }, { id: 'CASE-9398', sla: '4h left', pri: 'P2' }, { id: 'CASE-9388', sla: 'OK',     pri: 'P3' }] },
    { title: 'On hold',   color: '#11567F', items: [{ id: 'CASE-9378', sla: 'paused',  pri: 'P2' }] },
    { title: 'Resolved',  color: '#10B981', items: [{ id: 'CASE-9358', sla: 'closed',  pri: 'P1' }, { id: 'CASE-9344', sla: 'closed',  pri: 'P2' }] },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {cols.map((c, ci) => (
        <div key={c.title} className="bg-mist/40 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{c.title}</span>
            <span className="ml-auto text-[10px] font-mono text-ink-muted">{c.items.length}</span>
          </div>
          <div className="space-y-1.5">
            {c.items.map((it, i) => {
              const breach = it.sla.includes('left');
              return (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ci * 0.08 + i * 0.04 }}
                  className={cn('vf-card px-2 py-1.5 text-[11px] relative', breach && 'ring-2 ring-vfRed')}
                >
                  {breach && (
                    <motion.span
                      className="absolute inset-0 rounded-lg ring-2 ring-vfRed pointer-events-none"
                      animate={{ opacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-ink font-bold">{it.id}</span>
                    <span className="vf-chip bg-mist text-ink-muted text-[9px]">{it.pri}</span>
                  </div>
                  <div className={cn('text-[10px]', breach ? 'text-vfRed font-bold' : 'text-ink-muted')}>{it.sla}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function InteractionRiver() {
  const channels = [
    { name: 'Voice', icon: Phone,          color: '#11567F' },
    { name: 'Chat',  icon: MessageCircle,  color: '#29B5E8' },
    { name: 'Email', icon: Mail,           color: '#F59E0B' },
    { name: 'App',   icon: Smartphone,     color: '#10B981' },
    { name: 'Retail',icon: ShoppingCart,   color: '#8B5CF6' },
  ];
  // 24 hours x channels of dots
  const events = Array.from({ length: 60 }, (_, i) => ({
    ch: i % channels.length,
    t: (i * 1.7) % 100,
    size: 2 + Math.abs(Math.sin(i)) * 6,
  }));
  return (
    <div className="space-y-1.5">
      {channels.map((ch, ci) => {
        const Icon = ch.icon;
        return (
          <div key={ch.name} className="flex items-center gap-2">
            <div className="w-[68px] flex items-center gap-1 text-[10.5px] text-ink-muted font-bold">
              <Icon className="w-3 h-3" />{ch.name}
            </div>
            <div className="relative flex-1 h-6 bg-mist/60 rounded">
              {events.filter(e => e.ch === ci).map((e, i) => (
                <motion.span
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${e.t}%`, width: e.size, height: e.size, background: ch.color, opacity: 0.85 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.85 }}
                  transition={{ delay: i * 0.04 }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex justify-between text-[9px] text-ink-muted mt-1 font-mono"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM-1. Customer Accounts
// ─────────────────────────────────────────────────────────────────────────────
export function BssAccounts() {
  const top = [
    { id: 'ACC-7401', name: 'GreenLeaf Group plc',    tier: 'Enterprise', arpu: '£42.4k', tenure: '7y', credit: 'OK',    status: 'live' as const },
    { id: 'ACC-7204', name: 'Brookfield Logistics',   tier: 'Mid-mkt',    arpu: '£18.4k', tenure: '4y', credit: 'OK',    status: 'live' as const },
    { id: 'ACC-6918', name: 'NorthBlock Engineering', tier: 'SME',        arpu: '£6.2k',  tenure: '2y', credit: 'Hold',  status: 'warn' as const },
    { id: 'ACC-6804', name: 'Trentham Care Homes',    tier: 'SME',        arpu: '£4.8k',  tenure: '5y', credit: 'OK',    status: 'live' as const },
    { id: 'ACC-6612', name: 'Polaris Retail Ltd',     tier: 'Mid-mkt',    arpu: '£12.4k', tenure: '3y', credit: 'OK',    status: 'live' as const },
  ];
  return (
    <PageShell>
      <PageHeader kicker="BSS · CRM" title="Customer Accounts" subtitle="Account master with B2B hierarchy, contacts, billing accounts, credit posture and lifecycle." badge={<BssMlBadge pageKey="accounts" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.accounts', 'gold.contacts', 'gold.account_hierarchy', 'gold.credit_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Active accounts" value="12.4M" delta="+0.6% MoM" tone="good" />
        <KpiTile label="B2B accounts" value="18.4k" delta="+184 QoQ" tone="good" />
        <KpiTile label="Avg ARPU" value="£24.80" delta="+£0.40 MoM" tone="good" />
        <KpiTile label="Credit holds" value="412" delta="+24 today" tone="warn" />
        <KpiTile label="Top-tier accts" value="184" delta="+6 QoQ" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Account-type mix</CardTitle>
          <Donut data={[
            { label: 'Consumer',   value: 92, color: '#29B5E8' },
            { label: 'SoHo',       value: 4,  color: '#F59E0B' },
            { label: 'SME',        value: 2.4, color: '#11567F' },
            { label: 'Mid-market', value: 1.2, color: '#10B981' },
            { label: 'Enterprise', value: 0.4, color: '#E11D48' },
          ]} />
        </div>
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Active scenario · account hierarchy</CardTitle>
          <AccountHierarchyTree />
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Demo customers · BSS 360 quick-jump</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {customers.map((c) => (
            <Link
              key={c.id}
              to={`/bss/customer/${c.id}`}
              className="vf-card p-2 hover:ring-2 hover:ring-vfRed transition flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-vfRed-soft text-vfRed-dark grid place-items-center font-bold text-[11px] shrink-0">
                {c.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[12px] text-ink truncate group-hover:text-vfRed">{c.name}</div>
                <div className="text-[10px] text-ink-muted truncate">{c.id} · {c.brand}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-[10px] text-ink-muted mt-2">Reused from CIC · BSS lens (billing, services, AR ageing, contracts) on each profile.</div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Top accounts (by ARPU)</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr><th className="text-left py-1.5">Account</th><th>Tier</th><th>ARPU/mo</th><th>Tenure</th><th>Credit</th><th>Status</th></tr>
          </thead>
          <tbody>
            {top.map((a) => (
              <tr key={a.id} className="border-b border-mist-dark/60">
                <td className="py-1.5"><span className="font-mono text-ink-muted text-[10.5px]">{a.id}</span> · <span className="font-bold text-ink">{a.name}</span></td>
                <td className="text-center text-ink-muted">{a.tier}</td>
                <td className="text-center font-mono">{a.arpu}</td>
                <td className="text-center font-mono">{a.tenure}</td>
                <td className="text-center"><StatusChip status={a.credit === 'OK' ? 'ok' : 'warn'} /></td>
                <td className="text-center"><StatusChip status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="vf-card p-3">
        <MlPanelHeader pageKey="accounts:clv" label="CLV / LTV register · Bayesian estimator" />
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-7">
            <LtvHistogram />
            <div className="text-[10px] text-ink-muted mt-2">Median CLV £1,840 · top decile £42k · retention spend ROI 4.2x · audit <span className="font-mono">gold.clv_register</span>.</div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Account</th><th>LTV</th><th>Drivers</th></tr></thead>
              <tbody>
                {[
                  ['ACC-7401', '£42.4k', 'tenure 7y · cross-sell 4'],
                  ['ACC-7204', '£18.4k', 'tenure 4y · ARPU ↑'],
                  ['ACC-6612', '£12.4k', 'tenure 3y · churn ↓'],
                  ['ACC-6804', '£4.8k',  'tenure 5y · vulnerability'],
                ].map((r, i) => (
                  <tr key={i} className="border-b border-mist-dark/60"><td className="py-1.5 font-mono">{r[0]}</td><td className="text-center font-mono font-bold">{r[1]}</td><td className="text-center text-ink-muted">{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Account segments · ACV × margin treemap</CardTitle>
          <Treemap items={[
            { label: 'Consumer Premium', value: 92,  margin: 0.46 },
            { label: 'Consumer Mid',     value: 76,  margin: 0.36 },
            { label: 'Consumer Value',   value: 48,  margin: 0.24 },
            { label: 'PAYG',             value: 14,  margin: 0.18 },
            { label: 'B2B SME',          value: 24,  margin: 0.34 },
            { label: 'B2B Mid-market',   value: 32,  margin: 0.42 },
            { label: 'B2B Enterprise',   value: 38,  margin: 0.52 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Consumer Premium = single biggest revenue pool · B2B Enterprise = highest margin (52%) · PAYG smallest + lowest margin (auto-flagged for migration nudges).</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Account density · UK regions</CardTitle>
          <UkRegionMap data={{
            SCOT: 28, NI: 8, NE: 18, NW: 42, YORKS: 32, EM: 24,
            WM: 38, WALES: 14, EAST: 28, LON: 76, SE: 52, SW: 22,
          }} />
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>Tenure distribution · 12.4M accounts</CardTitle>
        <Histogram
          mean={5}
          buckets={[
            { label: '<3 mo',   count: 380 },
            { label: '3-6 mo',  count: 720 },
            { label: '6-12 mo', count: 1240 },
            { label: '1-2 yr',  count: 2180 },
            { label: '2-3 yr',  count: 2640 },
            { label: '3-5 yr',  count: 2820 },
            { label: '5-7 yr',  count: 1480 },
            { label: '7-10 yr', count: 720 },
            { label: '>10 yr',  count: 220 },
          ]}
          height={150}
        />
        <div className="text-[10px] text-ink-muted mt-2">Median tenure 38 mo · 9% under 6mo (highest churn-risk window — auto-enrol in onboarding journey).</div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM-2. Cases & SLAs
// ─────────────────────────────────────────────────────────────────────────────
export function BssCases() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · CRM" title="Cases & SLAs" subtitle="Inbound case routing, AI triage via Cortex AI_CLASSIFY, SLA breach watch, agent desktop." badge={<BssMlBadge pageKey="cases" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.cases', 'gold.case_routing_rules', 'gold.sla_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Open cases" value="1,840" delta="+128 today" tone="warn" />
        <KpiTile label="SLA breach risk" value="42" delta="auto-routed" tone="warn" />
        <KpiTile label="Avg MTTR" value="4:12" delta="−18m WoW" tone="good" />
        <KpiTile label="Top reason" value="billing" delta="38% of cases" tone="neutral" />
        <KpiTile label="Auto-classified" value="92%" delta="Cortex AI_CLASSIFY" tone="good" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Case queue · live</CardTitle>
        <CaseQueueKanban />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Case reasons (24h)</CardTitle>
          <HBar data={[
            { label: 'Billing query',     value: 38, sub: '702 cases' },
            { label: 'Service issue',     value: 22, sub: '405 cases' },
            { label: 'Plan change',       value: 14, sub: '258 cases' },
            { label: 'Roaming',           value: 9,  sub: '166 cases' },
            { label: 'Cancellation',      value: 7,  sub: '129 cases' },
            { label: 'Vulnerability',     value: 5,  sub: '92 cases' },
            { label: 'Fraud / dispute',   value: 5,  sub: '88 cases' },
          ]} color="#11567F" />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>SLA-breach feed</CardTitle>
          <div className="space-y-1.5 text-[11.5px]">
            {['CASE-9402 · 2h left · P1 billing','CASE-9398 · 4h left · P2 plan change','CASE-9381 · 6h left · P2 service','CASE-9374 · 7h left · P2 roaming'].map((row) => (
              <div key={row} className="flex items-center gap-2 border-b border-mist-dark/50 pb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-vfRed shrink-0" />
                <span className="text-ink">{row}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · customer-friendly answer"
        prompt="draft answer for CASE-9402 (P1 billing query)"
        output={`Hi,

Thanks for getting in touch about your bill. I can see why this looks higher than usual — your March bill includes a one-off pro-rata charge for the plan change you made on the 14th, plus the EU Roaming Pass days you used while travelling. The headline figure breaks down as:

• Standard plan (full month) · £42
• Pro-rata plan upgrade (Mar 14–31) · £18
• EU Roaming Pass · 6 days · £17.64

We can spread the pro-rata charge over the next two cycles if that helps. Let me know and I'll arrange it. — Sam`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Mean-time-to-resolve · 24h distribution</CardTitle>
          <Histogram
            mean={3}
            buckets={[
              { label: '<30m',   count: 318 },
              { label: '30-60m', count: 524 },
              { label: '1-2h',   count: 612 },
              { label: '2-4h',   count: 482 },
              { label: '4-8h',   count: 268 },
              { label: '8-24h',  count: 142 },
              { label: '1-2d',   count: 64 },
              { label: '2-5d',   count: 28 },
              { label: '>5d',    count: 8 },
            ]}
            height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Median 1.7h · P95 6.4h · 8 cases &gt; 5d auto-escalated to senior panel · trends within Ofcom GC C4 complaints handling.</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Reason root-cause · 80/20 Pareto</CardTitle>
          <ParetoChart height={170} items={[
            { label: 'Billing query',   value: 38 },
            { label: 'Service issue',   value: 22 },
            { label: 'Plan change',     value: 14 },
            { label: 'Roaming',         value: 9 },
            { label: 'Cancellation',    value: 7 },
            { label: 'Vulnerability',   value: 5 },
            { label: 'Fraud / dispute', value: 5 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Top 2 = 60% of volume · billing query auto-routed to bill-explainer Cortex Complete · service issues correlate with NOC pulses.</div>
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>Agent leaderboard · cases-resolved this week with QoQ delta</CardTitle>
        <StackedDeltaBars items={[
          { label: 'Lucy P. · senior',     value: 0.184, delta: +12.4 },
          { label: 'Sam R. · senior',      value: 0.172, delta: +8.6 },
          { label: 'Priya M. · senior',    value: 0.168, delta: +14.2 },
          { label: 'James K. · mid',       value: 0.142, delta: +6.4 },
          { label: 'Alex T. · mid',        value: 0.128, delta: -2.4 },
          { label: 'Chris O. · mid',       value: 0.112, delta: +4.2 },
          { label: 'Mo H. · onboarding',   value: 0.084, delta: +24.6 },
          { label: 'Bot · Cortex Agent',   value: 0.420, delta: +38.4 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">Cortex Agent (FCR contained) deflects 42% of incoming · senior tier handles complex appeals · Mo H. onboarding ramp +24.6% (lift from co-pilot suggestions).</div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM-3. Interactions Timeline
// ─────────────────────────────────────────────────────────────────────────────
export function BssInteractions() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · CRM" title="Interactions Timeline" subtitle="Multi-channel customer touchpoints stitched via identity graph; per-customer journey, NBA suppression on fatigue." badge={<BssMlBadge pageKey="interactions" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.interactions', 'gold.identity_graph', 'gold.touchpoints']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Interactions / day" value="1.8M" delta="+8% WoW" tone="good" />
        <KpiTile label="Channels stitched" value="7" delta="incl. social" tone="good" />
        <KpiTile label="Identity match" value="94%" delta="+1.2pp" tone="good" />
        <KpiTile label="Avg / customer / wk" value="3.2" delta="+0.4 vs prior" tone="neutral" />
        <KpiTile label="Cross-channel jrnys" value="412k" delta="+9% WoW" tone="good" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>CUST-001 · last 24h interaction river</CardTitle>
        <InteractionRiver />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Channel mix (24h)</CardTitle>
          <Donut data={[
            { label: 'App',    value: 38, color: '#10B981' },
            { label: 'Chat',   value: 22, color: '#29B5E8' },
            { label: 'Voice',  value: 16, color: '#11567F' },
            { label: 'Email',  value: 12, color: '#F59E0B' },
            { label: 'SMS',    value: 6,  color: '#8B5CF6' },
            { label: 'Retail', value: 4,  color: '#9CA3AF' },
            { label: 'Social', value: 2,  color: '#EC4899' },
          ]} />
        </div>
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Identity-graph match-rate · 28d trend</CardTitle>
          <Sparkline data={[91.2,91.4,91.6,91.8,92.0,92.2,92.4,92.6,92.8,93.0,93.2,93.4,93.6,93.8,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0,94.0]} color="#10B981" />
          <div className="text-[10px] text-ink-muted mt-2">Deterministic + probabilistic stitch · powered by <span className="font-mono">identity_resolution_v3</span>.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>24-hour interaction volume curve</CardTitle>
          <LineChart
            height={150}
            series={[{ name: 'Interactions/h (000s)', data: [12,8,6,5,4,4,5,8,18,38,62,84,96,102,98,94,88,82,76,68,52,38,24,16] }]}
            labels={['00','03','06','09','12','15','18','21']}
            colors={['#11567F']}
          />
          <div className="text-[10px] text-ink-muted mt-2">Peak 13:00–14:00 · 102k interactions/h · staffing model auto-tuned via <span className="font-mono">queue_forecast_v2</span> (MAPE 6.4%).</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Customer sentiment · last 12 weeks</CardTitle>
          <BandedLineChart
            data={[68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 77, 78]}
            bands={[
              { color: '#E11D48', min: 50, max: 60 },
              { color: '#F59E0B', min: 60, max: 75 },
              { color: '#10B981', min: 75, max: 90 },
            ]}
            height={150}
            label="red < 60% positive · amber 60–75 · green ≥ 75 · trended into green band 2 weeks ago · driven by Cortex Agent FCR + co-pilot deflection."
          />
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>NBA suppression · fatigue & frequency-cap</CardTitle>
        <ParetoChart height={170} items={[
          { label: 'Frequency cap (3/wk)',     value: 42 },
          { label: 'Vulnerability flag',       value: 22 },
          { label: 'Recently contacted (24h)', value: 14 },
          { label: 'Active complaint',         value: 10 },
          { label: 'Channel preference',       value: 6 },
          { label: 'Consent withdrawn',        value: 6 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">184k NBAs suppressed in 24h (15% of generated) · honors Ofcom GC C5 vulnerability + ICO marketing-consent rules.</div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM-4. Sales & Renewals Pipeline
// ─────────────────────────────────────────────────────────────────────────────
export function BssPipeline() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · CRM" title="Sales & Renewals Pipeline" subtitle="B2B opportunity pipeline + renewal windows + churn-risk on contracts. Snowpark ML scored." badge={<BssMlBadge pageKey="pipeline" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.opportunities_crm', 'gold.contracts', 'gold.renewal_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Open pipeline" value="£14.4M" delta="+£1.2M MoM" tone="good" />
        <KpiTile label="Win rate" value="41%" delta="+3pp QoQ" tone="good" />
        <KpiTile label="Avg deal" value="£8.4k" delta="B2B" tone="neutral" />
        <KpiTile label="At-risk renewals" value="£2.1M" delta="184 contracts" tone="warn" />
        <KpiTile label="MRR / ARR" value="£142M / £1.7B" delta="run-rate" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Pipeline funnel</CardTitle>
          <Funnel stages={[
            { label: 'Lead',       value: 1820, tone: 'neutral' },
            { label: 'Qualified',  value: 942,  tone: 'good' },
            { label: 'Proposal',   value: 488,  tone: 'good' },
            { label: 'Negotiation',value: 248,  tone: 'good' },
            { label: 'Won',        value: 112,  tone: 'good' },
          ]} formatter={(v) => `${v.toLocaleString()}`} />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Renewal windows</CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {[{ w: '90d', n: 184, v: '£8.4M' }, { w: '60d', n: 92, v: '£4.2M' }, { w: '30d', n: 41, v: '£2.1M' }, { w: '15d', n: 14, v: '£640k' }].map((r) => (
              <div key={r.w} className="vf-card p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{r.w} window</div>
                <div className="text-xl font-extrabold font-mono leading-none">{r.n}</div>
                <div className="text-[10px] text-ink-muted">contracts · {r.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Top open deals</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr><th className="text-left py-1.5">Deal</th><th>Account</th><th>Stage</th><th>Value</th><th>Confidence</th></tr>
          </thead>
          <tbody>
            {[
              { id: 'OPP-3812', acct: 'GreenLeaf Group plc', stage: 'Negotiation', value: '£420k/yr', conf: '0.78' },
              { id: 'OPP-3804', acct: 'Brookfield Logistics', stage: 'Proposal', value: '£184k/yr', conf: '0.62' },
              { id: 'OPP-3792', acct: 'Polaris Retail',      stage: 'Qualified',  value: '£92k/yr',  conf: '0.48' },
              { id: 'OPP-3781', acct: 'Trentham Care Homes', stage: 'Negotiation', value: '£64k/yr', conf: '0.84' },
            ].map((d) => (
              <tr key={d.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-mono text-ink">{d.id}</td>
                <td className="text-center text-ink-muted">{d.acct}</td>
                <td className="text-center"><StatusChip status="open" /></td>
                <td className="text-center font-mono font-bold">{d.value}</td>
                <td className="text-center font-mono">{d.conf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · renewal proposal v1"
        prompt="draft renewal proposal for OPP-3812 (GreenLeaf Group plc)"
        output={`Re: GreenLeaf Group plc · OPP-3812 renewal

Dear Sarah,

Ahead of your contract renewal on 14 June, here's our proposed offer for the next 36-month term:

• 580 lines @ blended £72/line/mo (vs current £78) — a 7.7% reduction
• 24/7 SLA upgrade across all 4 BUs (response ≤ 15 min, resolve ≤ 4h)
• Disney+ for executive tier (40 users) — included
• Quarterly business reviews with our Sales Engineer + dedicated Slack channel

Net annual value £420k, vs current £464k. Margin floor 31% (above policy 28%). I have CFO sign-off on the SLA upgrade.

Happy to walk through it any time this week. — James`}
      />

      <div className="vf-card p-3">
        <CardTitle>Top 10 accounts · ACV whale chart with QoQ delta</CardTitle>
        <StackedDeltaBars items={[
          { label: 'GreenLeaf Group plc',     value: 4.2, delta: +12.4 },
          { label: 'Brookfield Logistics',    value: 3.8, delta: +8.6 },
          { label: 'Polaris Retail',          value: 2.9, delta: -4.2 },
          { label: 'Trentham Care Homes',     value: 2.2, delta: +18.4 },
          { label: 'Wessex Foods',            value: 1.8, delta: +2.4 },
          { label: 'NorthStar Engineering',   value: 1.6, delta: -8.4 },
          { label: 'Bluebell Council',        value: 1.4, delta: +0.8 },
          { label: 'Riverbank Property',      value: 1.2, delta: +6.2 },
          { label: 'Albion Construction',     value: 1.0, delta: -12.6 },
          { label: 'Stratford Group',         value: 0.9, delta: +4.8 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">Top 10 = £21.0M ACV (29% of B2B book) · Trentham +18.4% on care-home wearable rollout · Albion -12.6% downsizing post-merger.</div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Subscriptions & Services Inventory
// ─────────────────────────────────────────────────────────────────────────────
export function BssSubscriptions() {
  const services = [
    { name: '5G Unlimited Max',    type: 'Mobile',     status: 'live' as const, since: '2024-08-12' },
    { name: 'Roaming Pass EU',     type: 'Add-on',     status: 'live' as const, since: '2025-04-02' },
    { name: 'Disney+ via SnowTelco', type: 'Bundle',   status: 'live' as const, since: '2026-01-08' },
    { name: 'Apple Watch eSIM',    type: 'Service',    status: 'live' as const, since: '2025-11-22' },
  ];
  return (
    <PageShell>
      <PageHeader kicker="BSS · Commerce" title="Subscriptions & Services" subtitle="The 'what does this customer have' view — TMF 633 service inventory, eSIM/SIM, MSISDN lifecycle, plan history, MACD." badge={<BssMlBadge pageKey="subscriptions" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.subscriptions', 'gold.services', 'gold.sim_inventory', 'gold.msisdn_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Active subs" value="12.4M" delta="+0.4% MoM" tone="good" />
        <KpiTile label="Active services" value="38.6M" delta="3.1 per sub" tone="good" />
        <KpiTile label="eSIM share" value="41%" delta="+6pp QoQ" tone="good" />
        <KpiTile label="MSISDNs in use" value="14.8M" delta="of 16.2M" tone="good" />
        <KpiTile label="Plan changes / day" value="12.4k" delta="+8% WoW" tone="neutral" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Subscription state</CardTitle>
          <Donut data={[
            { label: 'Active',     value: 88, color: '#10B981' },
            { label: 'Suspended',  value: 6,  color: '#F59E0B' },
            { label: 'Pending',    value: 4,  color: '#11567F' },
            { label: 'Cancelled (30d)', value: 2, color: '#9CA3AF' },
          ]} />
        </div>
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>CUST-001 · live service card</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Service</th><th>Type</th><th>Live since</th><th>Status</th></tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{s.name}</td>
                  <td className="text-center text-ink-muted">{s.type}</td>
                  <td className="text-center font-mono text-ink-muted">{s.since}</td>
                  <td className="text-center"><StatusChip status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>eSIM vs physical SIM (28d trend)</CardTitle>
        <LineChart series={[
          { name: 'eSIM',     data: [34,35,35,36,36,37,37,38,38,38,39,39,40,40,40,41,41,41,41,41,41,41,41,41,41,41,41,41] },
          { name: 'Physical', data: [66,65,65,64,64,63,63,62,62,62,61,61,60,60,60,59,59,59,59,59,59,59,59,59,59,59,59,59] },
        ]} colors={['#10B981', '#9CA3AF']} height={140} />
      </div>
      <div className="vf-card p-3">
        <MlPanelHeader pageKey="subscriptions:crosssell" label="Next-best product · cross-sell propensity" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <KpiTile label="Eligible cohort" value="1.84M" delta="+184k QoQ" tone="good" />
          <KpiTile label="Weekly conversions" value="12.4k" delta="+8% WoW" tone="good" />
          <KpiTile label="Avg ARPU lift" value="+£0.42" delta="per converter" tone="good" />
          <KpiTile label="Top NB-product" value="Roaming Pass" delta="38% of recs" tone="neutral" />
          <KpiTile label="Top-1 accuracy" value="0.71" delta="vs random 0.20" tone="good" />
        </div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Customer</th><th>Top recommendation</th><th>Confidence</th><th>Expected ARPU lift</th></tr></thead>
          <tbody>
            {[
              ['CUST-001', 'Disney+ family attach',     '0.84', '+£8.99/mo'],
              ['CUST-204', 'Roaming Pass auto-enrol',   '0.78', '+£12.4/mo'],
              ['CUST-381', 'Apple Watch eSIM',          '0.71', '+£5.0/mo'],
              ['CUST-512', '5G Hero Unlimited Max',     '0.69', '+£12/mo'],
              ['CUST-614', 'Family 4-line bundle',      '0.62', '+£28/mo'],
            ].map((r, i) => (
              <tr key={i} className="border-b border-mist-dark/60"><td className="py-1.5 font-mono">{r[0]}</td><td className="font-bold text-ink">{r[1]}</td><td className="text-center font-mono">{r[2]}</td><td className="text-center font-mono text-emerald-700 font-bold">{r[3]}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.cross_sell_features</span> · suppression honors vulnerability + frequency cap.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Subscriber base movements · QoQ</CardTitle>
          <Waterfall
            height={200}
            formatter={(v) => `${v.toFixed(2)}M`}
            items={[
              { label: 'Q4 close',      value: 12.18, tone: 'total' },
              { label: 'Gross adds',    value: +0.42, tone: 'pos' },
              { label: 'Port-ins',      value: +0.18, tone: 'pos' },
              { label: 'Vol. churn',    value: -0.22, tone: 'neg' },
              { label: 'Invol. churn',  value: -0.10, tone: 'neg' },
              { label: 'Port-outs',     value: -0.06, tone: 'neg' },
              { label: 'Q1 close',      value: 12.40, tone: 'total' },
            ]}
          />
          <div className="text-[10px] text-ink-muted mt-2">Net add +220k subs · gross-to-net ratio 0.36 · port-in/port-out ratio 3.0× (best in 8 quarters).</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Service mix · stacked area (28d)</CardTitle>
          <StackedAreaChart
            series={[
              [12.0, 12.1, 12.2, 12.2, 12.3, 12.3, 12.4, 12.4, 12.4, 12.4],
              [4.6,  4.7,  4.8,  4.9,  5.0,  5.1,  5.2,  5.3,  5.4,  5.5],
              [3.2,  3.3,  3.4,  3.4,  3.5,  3.5,  3.6,  3.6,  3.6,  3.6],
              [2.0,  2.0,  2.1,  2.1,  2.2,  2.2,  2.3,  2.3,  2.4,  2.4],
            ]}
            colors={['#11567F', '#29B5E8', '#10B981', '#F59E0B']}
            labels={['Mobile voice/data', 'Roaming attach', 'Bundles (Disney+ etc)', 'Wearable eSIM']}
          />
          <div className="text-[10px] text-ink-muted mt-2">Wearable eSIM is fastest growing service (+20% in 28d) · roaming attach steady at 5.5M ahead of summer.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Tenure distribution · 12.4M subs</CardTitle>
          <Histogram
            mean={5}
            buckets={[
              { label: '<3 mo',   count: 380 },
              { label: '3-6 mo',  count: 720 },
              { label: '6-12 mo', count: 1240 },
              { label: '1-2 yr',  count: 2180 },
              { label: '2-3 yr',  count: 2640 },
              { label: '3-5 yr',  count: 2820 },
              { label: '5-7 yr',  count: 1480 },
              { label: '7-10 yr', count: 720 },
              { label: '>10 yr',  count: 220 },
            ]}
            height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Median tenure 38 mo · 38% of book is 3+ years (cash-cow segment) · 9% under 6 mo (highest churn risk window).</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>ARPU retention by acquisition cohort</CardTitle>
          <CohortRetentionLayer />
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Mediation Pipeline
// ─────────────────────────────────────────────────────────────────────────────
export function BssMediation() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Revenue" title="Mediation Pipeline" subtitle="Raw event → mediated → rated → billed. Streaming health, suspense queue, replay tooling." badge={<BssMlBadge pageKey="mediation" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.mediation_events', 'gold.suspense_register', 'gold.cdr_rated']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Events / sec" value="28.4k" delta="+4% WoW" tone="good" />
        <KpiTile label="P95 latency" value="184ms" delta="SLA 500ms" tone="good" />
        <KpiTile label="Suspense" value="412" delta="auto-replay" tone="warn" />
        <KpiTile label="Dedupe rate" value="0.04%" delta="−0.01pp" tone="good" />
        <KpiTile label="Late events" value="0.02%" delta="of 28.4k/s" tone="good" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Live pipeline · last second</CardTitle>
        <MediationFlow rate={28400} suspense={412} />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Suspense reasons</CardTitle>
          <Donut data={[
            { label: 'Schema mismatch', value: 32, color: '#E11D48' },
            { label: 'Unknown subscriber', value: 28, color: '#F59E0B' },
            { label: 'Tariff lookup',   value: 18, color: '#11567F' },
            { label: 'Roaming partner', value: 14, color: '#29B5E8' },
            { label: 'Late > 24h',      value: 8,  color: '#9CA3AF' },
          ]} />
        </div>
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>P95 latency · last 24h (ms)</CardTitle>
          <Sparkline data={[178,180,182,184,186,184,182,180,178,180,184,188,192,194,196,194,190,186,184,182,180,178,176,178]} color="#11567F" />
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>Throughput by source · 24h stacked area (kCDRs/sec)</CardTitle>
        <StackedAreaChart
          series={[
            [9.2, 8.8, 8.4, 8.0, 7.8, 8.0, 8.6, 9.4, 10.6, 12.0, 12.8, 13.2, 13.6, 13.4, 13.2, 12.8, 12.4, 11.8, 11.4, 11.0, 10.4, 9.8, 9.4, 9.2],
            [6.8, 6.4, 6.0, 5.8, 5.6, 5.8, 6.4, 7.2, 8.4, 9.6, 10.4, 10.8, 11.0, 10.8, 10.4, 10.0, 9.6, 9.0, 8.6, 8.2, 7.8, 7.4, 7.0, 6.8],
            [3.2, 3.0, 2.8, 2.8, 2.8, 2.8, 3.0, 3.4, 4.0, 4.6, 5.2, 5.4, 5.6, 5.4, 5.2, 5.0, 4.8, 4.4, 4.2, 4.0, 3.8, 3.6, 3.4, 3.2],
            [2.4, 2.2, 2.0, 2.0, 1.8, 1.8, 2.0, 2.4, 2.8, 3.4, 3.8, 4.0, 4.2, 4.0, 3.8, 3.6, 3.4, 3.2, 3.0, 2.8, 2.6, 2.4, 2.2, 2.4],
          ]}
          colors={['#11567F', '#29B5E8', '#10B981', '#F59E0B']}
          labels={['4G/5G voice + data', 'IMS/VoLTE', 'SMS', 'Roaming TAP3 inbound']}
        />
        <div className="text-[10px] text-ink-muted mt-2">28.4k events/s peak (lunch + evening) · roaming TAP3 inbound surges in Aug + Dec · streaming via Snowpipe Streaming + auto-scale rating cluster.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Reject root-cause · 80/20 Pareto</CardTitle>
          <ParetoChart height={170} items={[
            { label: 'Schema mismatch',     value: 32 },
            { label: 'Unknown subscriber',  value: 28 },
            { label: 'Tariff lookup',       value: 18 },
            { label: 'Roaming partner',     value: 14 },
            { label: 'Duplicate (dedup)',   value: 4 },
            { label: 'Late > 24h',          value: 4 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">2 reasons = 60% of suspense · schema mismatch auto-resolved on next deploy · unknown-subscriber feeds activation fallout retry.</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>End-to-end mediation lag · last hour</CardTitle>
          <Histogram
            mean={2}
            buckets={[
              { label: '<5s',    count: 6240 },
              { label: '5-10s',  count: 12480 },
              { label: '10-20s', count: 8420 },
              { label: '20-30s', count: 3120 },
              { label: '30-60s', count: 1240 },
              { label: '1-5m',   count: 380 },
              { label: '5-30m',  count: 84 },
              { label: '>30m',   count: 18 },
            ]}
            height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Median 11s · P99 4.2 min · billing-impact horizon &lt; 30s for 92% of events · late events (&gt;24h) routed to RA leakage workflow.</div>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bill-Run Monitor
// ─────────────────────────────────────────────────────────────────────────────
export function BssBillRun() {
  const cycles = [
    { id: 'CYCLE-01', pct: 100, sub: '4.2M rows · done',   running: false },
    { id: 'CYCLE-02', pct: 100, sub: '3.8M rows · done',   running: false },
    { id: 'CYCLE-03', pct: 100, sub: '5.4M rows · done',   running: false },
    { id: 'CYCLE-04', pct: 68,  sub: '9.4M / 13.8M · live', running: true },
    { id: 'CYCLE-05', pct: 0,   sub: 'queued',              running: false },
    { id: 'CYCLE-06', pct: 0,   sub: 'queued',              running: false },
  ];
  return (
    <PageShell>
      <PageHeader kicker="BSS · Revenue" title="Bill-Run Monitor" subtitle="Month-end cycle command centre — progress per cycle group, pre-bill QA, exception triage, regression vs prior." badge={<BssMlBadge pageKey="billrun" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.billing_cycle', 'gold.pre_bill_qa', 'gold.bill_exceptions']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Running cycle" value="CYCLE-04" delta="day 22 of 31" tone="warn" />
        <KpiTile label="Progress" value="68%" delta="ETA 14:42" tone="good" />
        <KpiTile label="Rows processed" value="9.4M / 13.8M" delta="streaming" tone="good" />
        <KpiTile label="Pre-bill QA" value="99.84%" delta="2,184 fails" tone="good" />
        <KpiTile label="Exceptions" value="412" delta="−18 vs prior" tone="good" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Cycle groups</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {cycles.map((c) => <BillRunRing key={c.id} pct={c.pct} label={c.id} sub={c.sub} running={c.running} />)}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Pre-bill QA · top failure types</CardTitle>
          <HBar data={[
            { label: 'Tariff lookup miss',        value: 38, sub: '832 fails' },
            { label: 'Pro-rata calc out-of-range',value: 22, sub: '482 fails' },
            { label: 'Roaming TAP3 not arrived',  value: 14, sub: '306 fails' },
            { label: 'Discount stacking conflict',value: 12, sub: '262 fails' },
            { label: 'Tax code missing',          value: 8,  sub: '174 fails' },
            { label: 'Promo expiry mismatch',     value: 6,  sub: '128 fails' },
          ]} color="#11567F" />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Anomaly cohort · top high-bill vs prior cycle</CardTitle>
          <table className="w-full text-[11.5px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Account</th><th>This</th><th>Prior</th><th>Δ</th></tr></thead>
            <tbody>
              {[['ACC-7401','£42.4k','£18.2k','+133%'],['ACC-6918','£12.8k','£4.2k','+204%'],['ACC-6804','£8.4k','£3.6k','+133%']].map((r,i)=>(
                <tr key={i} className="border-b border-mist-dark/60"><td className="py-1.5 font-mono">{r[0]}</td><td className="text-center font-mono">{r[1]}</td><td className="text-center font-mono">{r[2]}</td><td className="text-center font-mono text-vfRed font-bold">{r[3]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="vf-card p-3">
        <MlPanelHeader pageKey="billrun:explainer" label="Bill anomaly explainer · Cortex Complete" />
        <CortexCompleteDraft
          title="ACC-7401 · +133% vs prior cycle"
          prompt="explain bill anomaly for ACC-7401, suggest care brief"
          output={`ACC-7401 (GreenLeaf Group plc) is +133% vs the prior cycle, driven by:
• 14 days of EU roaming (£18.4k) — Roaming Pass not enrolled
• 3 international long-form calls (£420)
• 1 device-finance addition for the new Logistics BU (£1.2k)

Care brief: this is a legitimate spend pattern (procurement-driven travel + new BU). Recommended action — offer Roaming Pass back-credit £4.2k (margin floor 31%), enrol the 240 UK lines onto auto-Roaming Pass, mark account for retention specialist follow-up. Audit row to gold.decision_lineage.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Cycle SLA heatmap · last 6 cycles × 16 days</CardTitle>
          <CycleSlaHeatmap />
          <div className="text-[10px] text-ink-muted mt-2">CYCLE-04 currently in QA (day 22) · CYCLE-05/06 queued · all prior cycles closed within SLA.</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Bill amount distribution · CYCLE-04 (in-flight)</CardTitle>
          <Histogram
            mean={6}
            buckets={[
              { label: '£0–10',    count: 142 },
              { label: '£10–20',   count: 384 },
              { label: '£20–30',   count: 612 },
              { label: '£30–40',   count: 524 },
              { label: '£40–60',   count: 318 },
              { label: '£60–100',  count: 168 },
              { label: '£100–200', count: 64 },
              { label: '£200–500', count: 28 },
              { label: '£500–2k',  count: 18 },
              { label: '> £2k',    count: 6 },
              { label: '> £10k',   count: 2 },
              { label: '> £42k',   count: 1 },
            ]}
            height={160}
          />
          <div className="text-[10px] text-ink-muted mt-2">Mean £24.40 · long-tail above £200 contains 49 anomaly candidates (auto-routed to RA + Cortex Complete explainer).</div>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Number Inventory & Porting
// ─────────────────────────────────────────────────────────────────────────────
export function BssNumbers() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Commerce" title="Number Inventory & Porting" subtitle="MSISDN bank, port-in / port-out queues, PAC code requests, Ofcom MNP 1-day SLA." badge={<BssMlBadge pageKey="numbers" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> Ofcom MNP · GC C5</span>
        <GoldChip tables={['gold.msisdn_register', 'gold.port_register', 'gold.pac_codes']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Free MSISDNs" value="1.4M" delta="of 16.2M" tone="good" />
        <KpiTile label="In use" value="14.8M" delta="91.4% utilised" tone="good" />
        <KpiTile label="Port-in queue" value="184" delta="ETA 18h" tone="good" />
        <KpiTile label="Port-out queue" value="92" delta="ETA 14h" tone="good" />
        <KpiTile label="Ofcom MNP success" value="99.6%" delta="SLA 99%" tone="good" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>MSISDN inventory · 400 ranges × 10k each</CardTitle>
        <MsisdnGrid />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6 vf-card p-3">
          <CardTitle>Port-in queue</CardTitle>
          <PortQueueLadder direction="in" />
        </div>
        <div className="col-span-12 lg:col-span-6 vf-card p-3">
          <CardTitle>Port-out queue</CardTitle>
          <PortQueueLadder direction="out" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Port-in funnel · last 30d</CardTitle>
          <Funnel
            stages={[
              { label: 'PAC requested',           value: 8420, tone: 'neutral' },
              { label: 'PAC validated',           value: 8284, tone: 'good' },
              { label: 'Losing carrier confirm',  value: 8180, tone: 'good' },
              { label: 'Number ported',           value: 8118, tone: 'good' },
              { label: 'Within Ofcom 1-day SLA',  value: 8085, tone: 'good' },
            ]}
            formatter={(v) => v.toLocaleString()}
          />
          <div className="text-[10px] text-ink-muted mt-2">96.0% within Ofcom MNP 1-day SLA · 33 breaches in 30d (root-cause: losing carrier delays · auto-escalation enabled).</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>MNP 1-day SLA · last 12 weeks</CardTitle>
          <BandedLineChart
            data={[97.8, 98.0, 98.2, 98.4, 98.6, 98.8, 99.0, 99.1, 99.2, 99.4, 99.5, 99.6]}
            bands={[
              { color: '#E11D48', min: 95, max: 97 },
              { color: '#F59E0B', min: 97, max: 99 },
              { color: '#10B981', min: 99, max: 100 },
            ]}
            height={150}
            label="red < 97% (Ofcom intervention) · amber 97–99% · green ≥ 99% · trended into green band 4 weeks ago."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>MSISDN inventory state · 16.2M numbers</CardTitle>
          <Donut data={[
            { label: 'In use',          value: 91, color: '#10B981' },
            { label: 'Quarantine (90d)', value: 5,  color: '#F59E0B' },
            { label: 'Spare / available', value: 3,  color: '#29B5E8' },
            { label: 'Reserved (premium)', value: 1,  color: '#11567F' },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">91.4% utilised · 1.4M spare · 90-day Ofcom quarantine on cancelled numbers · gold-number reserve: 184 (auto-released after 24mo).</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Port-out reasons · churn lens</CardTitle>
          <ParetoChart height={170} items={[
            { label: 'Better deal elsewhere', value: 38 },
            { label: 'Network coverage',      value: 22 },
            { label: 'Family bundle',         value: 14 },
            { label: 'Bill dispute',          value: 10 },
            { label: 'Service issue',         value: 8 },
            { label: 'Other',                 value: 8 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Top 2 = 60% of port-outs · feeds <span className="font-mono">gold.churn_features</span> · winback offers auto-fired on PAC-requested events with model conf ≥ 0.6.</div>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Quote-to-Order
// ─────────────────────────────────────────────────────────────────────────────
export function BssQuoteToOrder() {
  const openQuotes = [
    { id: 'QTE-2026-04812', acct: 'GreenLeaf Group plc',     lines: 580,  value: '£420k/yr', stage: 'Negotiation',  age: '2d', conf: 0.84, owner: 'James K.' },
    { id: 'QTE-2026-04808', acct: 'Brookfield Logistics',    lines: 184,  value: '£184k/yr', stage: 'Proposal',     age: '4d', conf: 0.62, owner: 'Priya M.' },
    { id: 'QTE-2026-04802', acct: 'Polaris Retail',          lines: 96,   value: '£92k/yr',  stage: 'Quote drafted', age: '1d', conf: 0.48, owner: 'Sam R.'   },
    { id: 'QTE-2026-04794', acct: 'Trentham Care Homes',     lines: 72,   value: '£64k/yr',  stage: 'Negotiation',  age: '6d', conf: 0.78, owner: 'Lucy P.'  },
    { id: 'QTE-2026-04788', acct: 'Wessex Foods',            lines: 240,  value: '£148k/yr', stage: 'Proposal',     age: '3d', conf: 0.71, owner: 'James K.' },
    { id: 'QTE-2026-04781', acct: 'NorthStar Engineering',   lines: 48,   value: '£42k/yr',  stage: 'Negotiation',  age: '8d', conf: 0.34, owner: 'Priya M.' },
    { id: 'QTE-2026-04772', acct: 'Bluebell Council',        lines: 320,  value: '£196k/yr', stage: 'Quote drafted', age: '1d', conf: 0.58, owner: 'Sam R.'   },
  ];

  return (
    <PageShell>
      <PageHeader kicker="BSS · Commerce" title="Quote-to-Order" subtitle="TMF 648. B2B quote pipeline, propensity-scored, auto-priced; quote → order conversion live." badge={<BssMlBadge pageKey="quotetoorder" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.quotes', 'gold.opportunities', 'gold.contracts', 'gold.q2o_conversion']} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiTile label="Open quotes"       value="412"     delta="+24 today"   tone="good" />
        <KpiTile label="Q→O conversion"    value="38%"     delta="+2pp QoQ"    tone="good" />
        <KpiTile label="Avg quote age"     value="2.4d"    delta="−0.4d"       tone="good" />
        <KpiTile label="Avg time-to-quote" value="42 min"  delta="auto-priced" tone="good" />
        <KpiTile label="Win rate"          value="41%"     delta="+3pp"        tone="good" />
        <KpiTile label="Avg deal"          value="£8.4k"   delta="B2B"         tone="neutral" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Quote pipeline funnel · last 30 days</CardTitle>
          <Funnel stages={[
            { label: 'Lead',          value: 1820, tone: 'neutral' },
            { label: 'Quote drafted', value: 942,  tone: 'good' },
            { label: 'Negotiation',   value: 488,  tone: 'good' },
            { label: 'Order placed',  value: 248,  tone: 'good' },
            { label: 'Lost',          value: 154,  tone: 'bad' },
          ]} formatter={(v) => v.toLocaleString()} />
          <div className="text-[10px] text-ink-muted mt-2">52% lead→quote · 26% quote→order · 17% lead→order end-to-end (above 14% target).</div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Lost-reason mix</CardTitle>
          <Donut data={[
            { label: 'Price',              value: 38, color: '#E11D48' },
            { label: 'Lost to competitor', value: 28, color: '#F59E0B' },
            { label: 'No decision',        value: 18, color: '#11567F' },
            { label: 'Service fit',        value: 10, color: '#29B5E8' },
            { label: 'Other',              value: 6,  color: '#9CA3AF' },
          ]} />
        </div>
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <CardTitle>Open quotes · propensity-scored (Snowpark ML)</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5">Quote</th>
              <th>Account</th>
              <th className="text-center">Lines</th>
              <th className="text-right">Value</th>
              <th>Stage</th>
              <th className="text-center">Age</th>
              <th className="text-center">Win conf.</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {openQuotes.map((q) => (
              <tr key={q.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-mono text-[11px] text-ink-muted">{q.id}</td>
                <td className="font-bold text-ink">{q.acct}</td>
                <td className="text-center font-mono">{q.lines}</td>
                <td className="text-right font-mono font-bold">{q.value}</td>
                <td><span className="vf-chip bg-mist text-ink text-[10px]">{q.stage}</span></td>
                <td className="text-center font-mono">{q.age}</td>
                <td className="text-center">
                  <span className={cn('vf-chip text-[10px] font-mono', q.conf > 0.75 ? 'bg-emerald-100 text-emerald-700' : q.conf > 0.5 ? 'bg-amber/30 text-amber-900' : 'bg-mist text-ink-muted')}>{q.conf.toFixed(2)}</span>
                </td>
                <td className="text-ink-muted">{q.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.q2o_conversion</span> · model <span className="font-mono">q2o_winprop_v3</span> · features: account size, prior win-rate, deal cycle length, owner velocity, competitor presence.</div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Time-to-close distribution · MTTC 14d (won deals)</CardTitle>
          <Histogram
            mean={4}
            buckets={[
              { label: '<3d',   count: 18 },
              { label: '3-7d',  count: 62 },
              { label: '7-10d', count: 88 },
              { label: '10-14d',count: 72 },
              { label: '14-21d',count: 48 },
              { label: '21-30d',count: 22 },
              { label: '30-45d',count: 12 },
              { label: '45-60d',count: 6 },
              { label: '>60d',  count: 4 },
            ]}
            height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Median 12d · 80th-percentile 22d · stale-quote alerts auto-fire at age &gt; 30d.</div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Q→O conversion trend · last 12 months</CardTitle>
          <BandedLineChart
            data={[32, 33, 33, 34, 34, 35, 36, 36, 37, 37, 38, 38]}
            bands={[
              { color: '#E11D48', min: 0,  max: 28 },
              { color: '#F59E0B', min: 28, max: 35 },
              { color: '#10B981', min: 35, max: 50 },
            ]}
            height={150}
            label="red < 28% (review pricing) · amber 28–35% · green ≥ 35% (target) · trended into green band 5 months ago."
          />
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>Top-10 deals · ACV with QoQ delta</CardTitle>
        <StackedDeltaBars items={[
          { label: 'GreenLeaf Group plc',    value: 0.42, delta: +14.0 },
          { label: 'Bluebell Council',       value: 0.20, delta: +0.0  },
          { label: 'Brookfield Logistics',   value: 0.18, delta: +6.4  },
          { label: 'Wessex Foods',           value: 0.15, delta: +12.2 },
          { label: 'Polaris Retail',         value: 0.09, delta: -2.4  },
          { label: 'Trentham Care Homes',    value: 0.06, delta: +18.6 },
          { label: 'NorthStar Engineering',  value: 0.04, delta: -8.4  },
          { label: 'Stratford Group',        value: 0.04, delta: +4.2  },
          { label: 'Riverbank Property',     value: 0.03, delta: +1.8  },
          { label: 'Albion Construction',    value: 0.03, delta: -12.4 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">Top-10 = £1.24M ACV (~57% of pipeline) · GreenLeaf renewal & Bluebell council frame represent largest single moves.</div>
      </div>

      <CortexCompleteDraft
        title="Cortex Agent · auto-drafted quote response"
        prompt="generate quote QTE-2026-04812 · GreenLeaf Group plc · 580 lines · 36mo term · best-fit pricing"
        output={`Quote: QTE-2026-04812
Account: GreenLeaf Group plc · Procurement: Sarah Webb
Term: 36 months · effective from contract signature

Recommended bundle:
• 580 × 5G SA Pro (Unlimited) @ £72/line/mo → £41,760/mo
• 24/7 SLA upgrade across 4 BUs (response ≤ 15 min, resolve ≤ 4h) → £2,400/mo
• Disney+ executive tier (40 users) → included
• Quarterly Business Reviews + dedicated Slack channel → included
• Roaming Pass EU auto-enrol on 240 frequent travellers → £8.4k/mo (with 18% volume discount)

Annual contract value: £420k · effective £/line £72 (vs current £78 = -7.7%)
Margin floor: 31% (above policy 28%) · CFO sign-off captured for SLA tier
Win-confidence (model q2o_winprop_v3): 0.84 — propose to send today.

DocuSign envelope drafted. Proposal PDF auto-generated. Send when ready.`}
      />
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Disputes & Adjustments
// ─────────────────────────────────────────────────────────────────────────────
export function BssDisputes() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Revenue" title="Disputes & Adjustments" subtitle="Billing dispute intake, AI triage via Cortex AI_CLASSIFY, dual-control adjustments, refund queue, Ofcom complaint codes." badge={<BssMlBadge pageKey="disputes" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> Ofcom GC C4 · dual-control</span>
        <GoldChip tables={['gold.disputes', 'gold.adjustments', 'gold.refund_ledger']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Open disputes" value="1,840" delta="+128 today" tone="warn" />
        <KpiTile label="Avg age" value="3.6d" delta="SLA 8d" tone="good" />
        <KpiTile label="Approved adj. / d" value="£42.4k" delta="dual-ctrl" tone="neutral" />
        <KpiTile label="Refund queue" value="412" delta="age 1.2d" tone="warn" />
        <KpiTile label="AI triage conf." value="0.92" delta="auto-routed" tone="good" />
      </div>
      <div className="vf-card p-3" data-focus="dispute-queue">
        <CardTitle>Dispute kanban · live</CardTitle>
        <DisputeKanban />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Top dispute reasons</CardTitle>
          <HBar data={[
            { label: 'Billing query (rate plan)',  value: 32, sub: '589 cases' },
            { label: 'Roaming charge',             value: 22, sub: '405 cases' },
            { label: 'Pro-rata wrong',             value: 14, sub: '258 cases' },
            { label: 'Late fee',                   value: 12, sub: '221 cases' },
            { label: 'Double-charge',              value: 9,  sub: '166 cases' },
            { label: 'Promo expired',              value: 6,  sub: '111 cases' },
            { label: 'Device IMEI / ESN',          value: 5,  sub: '90 cases' },
          ]} color="#11567F" />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Ofcom complaint codes (24h)</CardTitle>
          <Donut data={[
            { label: 'Bill complaint',     value: 42, color: '#E11D48' },
            { label: 'Service issue',      value: 24, color: '#F59E0B' },
            { label: 'Switching / port',   value: 14, color: '#11567F' },
            { label: 'Misselling',         value: 10, color: '#8B5CF6' },
            { label: 'Other',              value: 10, color: '#9CA3AF' },
          ]} />
        </div>
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · dispute resolution letter"
        prompt="draft resolution letter for DSP-8408 (roaming charge dispute, £42)"
        output={`Dear Mr Patel,

Thank you for raising your concern about the £42 roaming charge on your March bill (case DSP-8408).

Having reviewed your usage, I can see you used 6 days of roaming in Spain. While this is consistent with our published EU Roaming Pass rate (£3/day with the active pass, or pay-as-you-go without), I can also see this is the first time we've billed you for roaming in three years of tenure with us.

As a goodwill gesture, I'm applying a £42 credit to your next bill — effectively waiving this month's roaming charge. I've also enrolled you in auto-Roaming Pass for future trips so you'll never be charged out-of-pass rates again unless you opt out.

The credit will appear on your April bill. Please don't hesitate to get in touch if anything else is unclear.

Kind regards,
Lucy
SnowTelco Care Team`}
      />

      <div className="vf-card p-3">
        <CardTitle>Time-to-resolve distribution · MTTR 2.1 days</CardTitle>
        <Histogram
          mean={2}
          buckets={[
            { label: '<1d',   count: 412 },
            { label: '1-2d',  count: 624 },
            { label: '2-3d',  count: 384 },
            { label: '3-4d',  count: 218 },
            { label: '4-5d',  count: 124 },
            { label: '5-6d',  count: 52 },
            { label: '6-8d',  count: 18 },
            { label: '8-10d', count: 6 },
            { label: '>10d',  count: 2 },
          ]}
          height={150}
        />
        <div className="text-[10px] text-ink-muted mt-2">SLA = 8d · 99.6% within SLA · 8 outliers escalated to senior dispute panel.</div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Revenue Recognition (IFRS 15)
// ─────────────────────────────────────────────────────────────────────────────
export function BssRevRec() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Finance" title="Revenue Recognition · IFRS 15" subtitle="Performance obligations, deferred revenue release, contract assets, capitalised commissions." badge={<BssMlBadge pageKey="revrec" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> IFRS 15 · ASC 606 audit-ready</span>
        <GoldChip tables={['gold.revrec_obligations', 'gold.deferred_revenue', 'gold.contracts']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Deferred revenue" value="£184M" delta="−£2.4M MoM" tone="good" />
        <KpiTile label="Performance obligs" value="14.2M" delta="open" tone="neutral" />
        <KpiTile label="Contract assets" value="£42M" delta="−£1.2M" tone="good" />
        <KpiTile label="MRR" value="£142M" delta="+£2.1M MoM" tone="good" />
        <KpiTile label="ARR" value="£1.7B" delta="run-rate" tone="good" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Quarter waterfall · deferred → recognised</CardTitle>
        <Ifrs15Waterfall />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6 vf-card p-3">
          <CardTitle>MRR / ARR ladder · 12-month run-rate (£M)</CardTitle>
          <LineChart series={[{ name: 'MRR', data: [128,130,131,133,134,135,136,137,138,139,140,141,142] }]} colors={['#10B981']} height={140} />
        </div>
        <div className="col-span-12 lg:col-span-6 vf-card p-3">
          <CardTitle>Audit-close checklist</CardTitle>
          <ul className="space-y-1.5 text-[12px]">
            {[
              ['Performance obligations identified', true],
              ['Standalone selling prices allocated', true],
              ['Deferred revenue calc reviewed',     true],
              ['Capitalised commissions amortised',  true],
              ['Modifications reviewed (Q)',         true],
              ['CFO sign-off (auto-routed)',         false],
            ].map(([txt, done]) => (
              <li key={txt as string} className="flex items-center gap-2">
                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber" />}
                <span className={cn(done ? 'text-ink' : 'text-ink-muted')}>{txt as string}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · IFRS 15 disclosure paragraph"
        prompt="draft IFRS 15 deferred-revenue disclosure for Q4 audit pack"
        output={`Note 18 — Revenue Recognition (IFRS 15)

Performance obligations: at quarter-close, the Group held 14.2 million open performance obligations across consumer and B2B contracts, principally relating to bundled handset, service and content components.

Allocation: standalone selling prices were allocated using a weighted-average observable price method, with model accuracy MAPE 1.4% (revrec_allocation_v3). No material changes in allocation methodology since prior period.

Movement: deferred revenue moved from £184.0M (Q-open) to £181.6M (Q-close). New obligations of £42M were recognised on the balance sheet, offset by £42.6M recognised through the income statement and £1.8M of contract modifications.

Contract assets stand at £42M (down £1.2M), reflecting natural amortisation of capitalised costs on multi-quarter customer contracts.

The Group considers the methodology and estimates to be stable, audit-ready, and consistent with the prior comparative period.`}
      />

      <div className="vf-card p-3">
        <CardTitle>Cohort retention · 6 quarterly acquisition cohorts</CardTitle>
        <CohortRetentionLayer />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Tax & Regulatory
// ─────────────────────────────────────────────────────────────────────────────
export function BssTax() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Finance" title="Tax & Regulatory" subtitle="UK VAT · IPT · USO levies · Ofcom GC compliance · HMRC MTD returns · ICO calendar." badge={<BssMlBadge pageKey="tax" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> HMRC MTD · Ofcom GC C4/C5 · ICO</span>
        <GoldChip tables={['gold.tax_ledger', 'gold.regulatory_register', 'gold.ofcom_returns']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="VAT due (this period)" value="£18.4M" delta="MTD ready" tone="good" />
        <KpiTile label="IPT" value="£42k" delta="device insurance" tone="neutral" />
        <KpiTile label="USO contribution" value="£1.2M" delta="annual" tone="neutral" />
        <KpiTile label="Open Ofcom audits" value="0" delta="all clear" tone="good" />
        <KpiTile label="Returns due 7d" value="2" delta="VAT + USO" tone="warn" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Tax ledger · monthly</CardTitle>
          <LineChart series={[
            { name: 'VAT (£M)', data: [16.2,16.4,16.8,17.0,17.2,17.4,17.6,17.8,18.0,18.2,18.4,18.4] },
            { name: 'IPT (£k)', data: [38,38,40,40,41,41,42,42,42,42,42,42] },
            { name: 'USO (£k)', data: [98,99,99,100,100,100,100,100,100,100,100,100] },
          ]} colors={['#11567F', '#F59E0B', '#10B981']} height={160} />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Reporting calendar · next 14d</CardTitle>
          <div className="space-y-1.5 text-[12px]">
            {[
              { d: '2026-05-21', what: 'HMRC VAT MTD return', body: 'Q4', tone: 'warn' },
              { d: '2026-05-24', what: 'Ofcom USO return',    body: 'annual', tone: 'warn' },
              { d: '2026-05-28', what: 'ICO data-protection registration', body: 'fee', tone: 'neutral' },
              { d: '2026-06-02', what: 'IPT (HMRC)',          body: 'monthly', tone: 'neutral' },
            ].map((e) => (
              <div key={e.d} className="flex items-center gap-2 border-b border-mist-dark/50 pb-1">
                <Calendar className={cn('w-3.5 h-3.5 shrink-0', e.tone === 'warn' ? 'text-amber-700' : 'text-ink-muted')} />
                <span className="font-mono text-ink-muted w-[88px] shrink-0">{e.d}</span>
                <span className="font-bold text-ink truncate">{e.what}</span>
                <span className="text-ink-muted ml-auto">{e.body}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · MTD VAT cover note"
        prompt="draft cover note for HMRC MTD VAT100 submission, Q4"
        output={`HMRC VAT100 Q4 — cover note

Submitting period: 2026-Q4 (Jan–Mar 2026)
VAT due: £18,442,184 (Box 5)
Method: HMRC Making Tax Digital API (digital link verified)
Source: gold.tax_ledger, 184M bill lines aggregated

Pre-submission checks:
- 100% line-coverage (no unmapped tax codes)
- Reconciliation to GL: matches to £0
- Prior-period adjustments: £nil
- Voluntary disclosures: none

Payment: scheduled BACS D+1 from CFO signature.

Approver: K. Ahmed (CFO)
Submitter: Tax Operations
Audit retention: 4 years (gold.regulatory_register)`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>VAT remittance trend · 12 months with HMRC due dates</CardTitle>
          <BandedLineChart
            data={[16.2, 16.4, 16.8, 17.0, 17.2, 17.4, 17.6, 17.8, 18.0, 18.2, 18.4, 18.4]}
            bands={[
              { color: '#10B981', min: 14, max: 22 },
            ]}
            height={150}
            label="quarterly cycle: Jan/Apr/Jul/Oct submission · MTD digital-link verified · always submitted within HMRC 7-day filing window."
          />
        </div>
        <div className="vf-card p-3">
          <CardTitle>Jurisdictional VAT mix · last 12 months</CardTitle>
          <Treemap items={[
            { label: 'GB (England, Wales, Scotland)', value: 220, margin: 0.20 },
            { label: 'Northern Ireland (NI Protocol)', value: 8,  margin: 0.20 },
            { label: 'Isle of Man',                    value: 1.2, margin: 0.20 },
            { label: 'Channel Islands (no UK VAT)',    value: 0.8, margin: 0.0 },
            { label: 'EU OSS (digital services)',      value: 4,  margin: 0.21 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">96% remitted to HMRC · NI Protocol kept separate (EU goods rules) · CI lines treated as zero-rated · OSS handled via single EU return.</div>
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>Regulatory return health · last 4 quarters</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr><th className="text-left py-1.5">Return</th><th>Authority</th><th>Frequency</th><th>Last submitted</th><th>Days early</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              { r: 'VAT100 (MTD)',           a: 'HMRC',  f: 'Quarterly', l: '2026-04-29', d: 8,  s: 'ok' as const },
              { r: 'IPT (insurance prem.)',  a: 'HMRC',  f: 'Monthly',   l: '2026-05-02', d: 4,  s: 'ok' as const },
              { r: 'USO contribution',       a: 'Ofcom', f: 'Annual',    l: '2025-09-18', d: 12, s: 'ok' as const },
              { r: 'Affordable Tariff (ATT)',a: 'Ofcom', f: 'Quarterly', l: '2026-04-22', d: 6,  s: 'ok' as const },
              { r: 'GC C4 complaints data',  a: 'Ofcom', f: 'Quarterly', l: '2026-04-25', d: 5,  s: 'ok' as const },
              { r: 'ROPA (Art.30)',          a: 'ICO',   f: 'On change', l: '2026-03-14', d: 0,  s: 'ok' as const },
            ].map((r) => (
              <tr key={r.r} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-bold text-ink">{r.r}</td>
                <td className="text-ink-muted">{r.a}</td>
                <td className="text-ink-muted">{r.f}</td>
                <td className="font-mono text-ink-muted">{r.l}</td>
                <td className="text-center font-mono font-bold text-emerald-700">+{r.d}d</td>
                <td><StatusChip status={r.s} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-ink-muted mt-2">Zero late submissions in 4 quarters · all returns auto-prepared from <span className="font-mono">gold.tax_ledger</span> + <span className="font-mono">gold.regulatory_register</span> · CFO sign-off via DocuSign + audit trail.</div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. GL / ERP Reconciliation
// ─────────────────────────────────────────────────────────────────────────────
export function BssGL() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Finance" title="GL / ERP Reconciliation" subtitle="Daily journals to SAP S/4HANA · period-close gating · exception triage." badge={<BssMlBadge pageKey="gl" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.gl_journals', 'gold.recon_exceptions', 'gold.period_close']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Daily journals" value="184k" delta="+4% MoM" tone="good" />
        <KpiTile label="Recon match" value="99.86%" delta="+0.04pp" tone="good" />
        <KpiTile label="Open exceptions" value="14" delta="−6 vs prior" tone="good" />
        <KpiTile label="Period close" value="✓ ready" delta="all groups" tone="good" />
        <KpiTile label="ERP partner" value="SAP S/4" delta="streaming" tone="neutral" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>GL posting waterfall · today (£)</CardTitle>
        <GlPostingWaterfall />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Top variance · this period vs prior</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Account</th><th>This</th><th>Prior</th><th>Δ</th><th>Status</th></tr></thead>
          <tbody>
            {[
              ['400-Revenue · Mobile',   '£142M', '£139M', '+2.1%', 'ok'],
              ['400-Revenue · Bundles',  '£18.4M','£16.2M', '+13.6%', 'ok'],
              ['500-COGS · Interconnect','£7.8M', '£7.6M',  '+2.6%', 'ok'],
              ['600-Tax · VAT',          '£18.4M','£16.2M', '+13.6%', 'warn'],
              ['700-Adj · Refunds',      '£1.2M', '£0.8M',  '+50%',  'warn'],
            ].map((r, i) => (
              <tr key={i} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-mono text-ink">{r[0]}</td>
                <td className="text-center font-mono">{r[1]}</td>
                <td className="text-center font-mono text-ink-muted">{r[2]}</td>
                <td className="text-center font-mono font-bold">{r[3]}</td>
                <td className="text-center"><StatusChip status={r[4] as any} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · variance commentary"
        prompt="explain the +13.6% MoM movement on 600-Tax · VAT for the controller pack"
        output={`600-Tax · VAT moved £16.2M → £18.4M (+13.6%) MoM.

Drivers:
• Bundle attach uplift from Disney+ campaign (+£1.4M VAT, attested by Marketing Ops)
• Pre-bill QA cleared a residual 2,184 cases that had been under-VATed in prior cycles (+£0.6M, one-off)
• Roaming volume seasonality (+£0.2M, in line with Easter travel)

Margin and contribution unaffected. The one-off element (+£0.6M) is a true-up, not a structural shift; baseline VAT growth normalises at +5.4% MoM after stripping it out.

Recommended for sign-off without further investigation.`}
      />

      <div className="vf-card p-3">
        <CardTitle>Month-end close · stream gantt (day 1–7)</CardTitle>
        <GLCloseGantt />
        <div className="text-[10px] text-ink-muted mt-2">Day-7 close target met for 11 consecutive months · longest stream = consolidations (3.2d) · CFO sign-off auto-routed when all green.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Top variance accounts vs forecast · 80/20 Pareto</CardTitle>
          <ParetoChart height={180} items={[
            { label: '600-Tax · VAT',         value: 22 },
            { label: '400-Rev · Roaming',     value: 18 },
            { label: '500-Cogs · Wholesale',  value: 14 },
            { label: '400-Rev · Bundles',     value: 12 },
            { label: '700-Adj · Refunds',     value: 10 },
            { label: '300-Cash · DD failed',  value: 8 },
            { label: '500-Cogs · Roaming',    value: 7 },
            { label: '600-Tax · IPT',         value: 5 },
            { label: 'Other',                 value: 4 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Top 3 = 54% of variance · all explained in Cortex commentary above + tagged for CFO review.</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Daily journal volume · last 30d</CardTitle>
          <AreaChart
            data={[124, 128, 132, 134, 138, 142, 144, 146, 150, 154, 156, 160, 164, 168, 172, 176, 180, 186, 192, 196, 204, 218, 248, 312, 484, 612, 384, 196, 148, 132]}
            color="#11567F" height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Spike days 24-26 = month-end close · auto-scaled SAP load · journal volume target 1,200/day with seasonal up to 4×.</div>
        </div>
      </div>
    </PageShell>
  );
}

function GLCloseGantt() {
  const streams = [
    { name: 'Subledger close',     start: 1, dur: 2,   status: 'done' as const },
    { name: 'Accruals',            start: 1, dur: 3,   status: 'done' as const },
    { name: 'FX revaluation',      start: 2, dur: 1.5, status: 'done' as const },
    { name: 'Intercompany',        start: 2.5, dur: 2.5, status: 'done' as const },
    { name: 'Consolidations',      start: 4, dur: 3.2, status: 'inflight' as const },
    { name: 'Disclosures pack',    start: 6, dur: 1,   status: 'inflight' as const },
    { name: 'CFO sign-off',        start: 7, dur: 0.5, status: 'pending' as const },
  ];
  const days = 7.5;
  const colorFor = (s: 'done' | 'inflight' | 'pending') => s === 'done' ? '#10B981' : s === 'inflight' ? '#F59E0B' : '#9CA3AF';
  return (
    <div>
      <div className="grid mb-2 text-[10px] text-ink-muted" style={{ gridTemplateColumns: `12rem repeat(7, minmax(0, 1fr))` }}>
        <div />
        {[1,2,3,4,5,6,7].map((d) => <div key={d} className="text-center font-bold">D{d}</div>)}
      </div>
      <div className="space-y-1.5">
        {streams.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-[12rem] truncate font-bold text-ink shrink-0">{s.name}</span>
            <div className="flex-1 h-5 bg-mist rounded relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(s.dur / days) * 100}%` }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="absolute inset-y-0 rounded"
                style={{ left: `${(s.start / days) * 100}%`, background: colorFor(s.status) }}
              />
            </div>
            <span className="font-mono w-[36px] text-right text-ink-muted">{s.dur.toFixed(1)}d</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" />done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber" />in-flight</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-400" />pending</span>
      </div>
    </div>
  );
}
export function BssWholesale() {
  const partners = [
    { name: 'GiffGaff Power MVNO', subs: '420k', revenue: '£8.4M/mo', sla: 'OK' },
    { name: 'Voxi Light',          subs: '380k', revenue: '£6.2M/mo', sla: 'OK' },
    { name: 'PlusOne Telecom',     subs: '184k', revenue: '£3.2M/mo', sla: 'OK' },
    { name: 'iD Mobile reseller',  subs: '142k', revenue: '£2.8M/mo', sla: 'Warn' },
    { name: 'Lebara wholesale',    subs: '92k',  revenue: '£1.6M/mo', sla: 'OK' },
  ];
  return (
    <PageShell>
      <PageHeader kicker="BSS · Wholesale" title="Wholesale / MVNO Billing" subtitle="Host network — MVNO contracts, traffic, settlement, partner SLAs." badge={<BssMlBadge pageKey="wholesale" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.wholesale_contracts', 'gold.partner_traffic', 'gold.partner_settlements']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="MVNO partners" value="14" delta="+1 QoQ" tone="good" />
        <KpiTile label="Wholesale subs" value="1.84M" delta="+4% MoM" tone="good" />
        <KpiTile label="Wholesale revenue" value="£42.4M/mo" delta="+£1.2M" tone="good" />
        <KpiTile label="Settlement net" value="+£8.2M" delta="favourable" tone="good" />
        <KpiTile label="Disputes open" value="4" delta="all <14d" tone="neutral" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>MVNO partners</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Partner</th><th>Subs</th><th>Revenue</th><th>SLA</th></tr></thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.name} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-bold text-ink">{p.name}</td>
                <td className="text-center font-mono">{p.subs}</td>
                <td className="text-center font-mono">{p.revenue}</td>
                <td className="text-center"><StatusChip status={p.sla === 'OK' ? 'ok' : 'warn'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Wholesale revenue leaderboard · QoQ</CardTitle>
          <StackedDeltaBars items={[
            { label: 'GiffGaff Power MVNO', value: 8.4, delta: +6.2 },
            { label: 'Voxi Light',          value: 6.2, delta: +1.8 },
            { label: 'PlusOne Telecom',     value: 3.2, delta: -2.4 },
            { label: 'iD Mobile reseller',  value: 2.8, delta: -8.6 },
            { label: 'Lebara wholesale',    value: 1.6, delta: +12.4 },
            { label: 'Honest Mobile',       value: 1.2, delta: +18.2 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Source <code className="font-mono">gold.partner_traffic</code> · iD Mobile margin under pressure due to 5G traffic mix shift.</div>
        </div>
        <div className="vf-card p-3">
          <CardTitle>Wholesale concentration · Pareto</CardTitle>
          <ParetoChart height={180} items={[
            { label: 'GiffGaff', value: 8.4 },
            { label: 'Voxi',     value: 6.2 },
            { label: 'PlusOne',  value: 3.2 },
            { label: 'iD',       value: 2.8 },
            { label: 'Lebara',   value: 1.6 },
            { label: 'Honest',   value: 1.2 },
            { label: 'Smarty',   value: 0.8 },
            { label: 'Asda Mob', value: 0.4 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Top 2 partners = 60% of wholesale revenue · concentration risk: GiffGaff renewal Q3 26.</div>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Settlement & Interconnect
// ─────────────────────────────────────────────────────────────────────────────
export function BssSettlement() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Wholesale" title="Settlement & Interconnect" subtitle="TAP3 outbound · IPX corridors · MNO partner settlements · disputes." badge={<BssMlBadge pageKey="settlement" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.tap3_reconcile', 'gold.ipx_traffic', 'gold.partner_settlements']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="TAP3 files (24h)" value="184" delta="all received" tone="good" />
        <KpiTile label="IPX traffic" value="14.2 TB" delta="+8% WoW" tone="good" />
        <KpiTile label="Settlement net" value="+£8.2M" delta="this month" tone="good" />
        <KpiTile label="Top corridor" value="UK→ES" delta="38% of inbound" tone="neutral" />
        <KpiTile label="Disputes open" value="2" delta="age <7d" tone="neutral" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Partner inflow vs outflow</CardTitle>
        <SettlementSankey />
      </div>
      <CortexCompleteDraft
        title="Cortex Agent · partner dispute letter"
        prompt="draft dispute letter to Telefónica ES for SET-2026-184 (£42k TAP3 mismatch)"
        output={`Dispute reference: SET-2026-184
Counterparty: Telefónica ES
Period: April 2026 outbound TAP3
Disputed amount: £42,184

Dear Settlement Operations,

Following the receipt of your April outbound TAP3 file, we identified a £42,184 reconciliation gap on 1,420 records. Our investigation indicates the gap is driven by a tariff-schedule update on your side that pre-dated our schema patch (€0.018/min on the relevant tariff bucket).

Attached is the evidence pack with the per-record breakdown, your prior schedule v2, and the now-applied schedule v3. Our calc, after re-rating, agrees to within £14 — well inside our mutual £1k tolerance.

We propose to settle at our re-rated total (£12,184k inbound, vs your file at £12,142k). Please confirm acknowledgement within 5 business days, after which we will book the £42k delta to the open settlement account.

Kind regards,
SnowTelco Wholesale Settlements`}
      />

      <div className="vf-card p-3">
        <CardTitle>Top TAP3 corridors · settlement net QoQ</CardTitle>
        <StackedDeltaBars items={[
          { label: 'UK → Spain (Telefónica)',    value: 4.2, delta: +14.8 },
          { label: 'UK → France (Orange)',       value: 3.4, delta: +6.4 },
          { label: 'UK → Italy (TIM)',           value: 2.8, delta: +12.2 },
          { label: 'UK → Portugal (NOS)',        value: 1.6, delta: +18.4 },
          { label: 'UK → Greece (Cosmote)',      value: 1.4, delta: +24.6 },
          { label: 'UK → Germany (DT)',          value: 1.2, delta: +2.4 },
          { label: 'UK → USA (T-Mobile)',        value: 0.9, delta: +8.6 },
          { label: 'UK → Netherlands (KPN)',     value: 0.7, delta: -1.8 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">EU corridors regulated under EU Roam-Like-At-Home cap · USA pay-per-day model = highest margin · Greece +24.6% (early summer travel surge).</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>Reconciliation MTTR · last 12 weeks</CardTitle>
          <BandedLineChart
            data={[6.4, 6.2, 6.0, 5.8, 5.6, 5.4, 5.2, 4.8, 4.6, 4.4, 4.2, 3.8]}
            bands={[
              { color: '#10B981', min: 0, max: 5 },
              { color: '#F59E0B', min: 5, max: 8 },
              { color: '#E11D48', min: 8, max: 14 },
            ]}
            height={150}
            label="green ≤ 5d (target) · amber 5–8d · red > 8d (escalate) · trended into green band 5 weeks ago via auto-validation pipeline."
          />
        </div>
        <div className="vf-card p-3">
          <CardTitle>Open settlement disputes · age &amp; volume (last 12 weeks)</CardTitle>
          <AreaChart
            data={[14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]}
            color="#11567F" height={150}
            band={{ lo: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0], hi: [18, 16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5] }}
          />
          <div className="text-[10px] text-ink-muted mt-2">Open dispute count down 86% in 12 weeks · auto-evidence-pack pipeline + Cortex letter drafting cuts manual dispute time from 14d → 2.4d median.</div>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Promotions Engine
// ─────────────────────────────────────────────────────────────────────────────
export function BssPromotions() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Wholesale" title="Promotions Engine" subtitle="TMF 634. Promo eligibility, stacking rules, expiry, A/B inventory, fraud-on-promo." badge={<BssMlBadge pageKey="promotions" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.promotions', 'gold.promo_eligibility', 'gold.promo_fraud']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Active promos" value="24" delta="+2 this wk" tone="good" />
        <KpiTile label="Eligibility / day" value="1.4M" delta="streaming" tone="good" />
        <KpiTile label="Stacking conflicts" value="184" delta="auto-resolved" tone="good" />
        <KpiTile label="Fraud blocked" value="12" delta="−4 WoW" tone="good" />
        <KpiTile label="Avg promo cost" value="£4.20" delta="per converter" tone="neutral" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Stacking decision · live trace</CardTitle>
          <PromoStackingTree />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Promo A/B leaderboard</CardTitle>
          <HBar data={[
            { label: '5G Hero · £5 credit',         value: 6.4, sub: 'p=0.012' },
            { label: 'Disney+ trial vs cashback',   value: 4.2, sub: 'p=0.04' },
            { label: 'Roaming Pass auto-enrol',     value: 3.6, sub: 'p=0.02' },
            { label: 'Anniversary 10GB boost',      value: 2.4, sub: 'p=0.06' },
            { label: 'Winback £15 vs £10',          value: 1.8, sub: 'p=0.05' },
          ]} color="#10B981" formatter={(v) => `+${v.toFixed(1)}pp`} />
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Campaign uplift trend · 8-week rolling A/B (treat − control)</CardTitle>
        <BandedLineChart
          data={[2.4, 2.8, 3.1, 3.4, 3.6, 4.0, 4.4, 4.8]}
          bands={[
            { color: '#E11D48', min: 0, max: 1 },
            { color: '#F59E0B', min: 1, max: 3 },
            { color: '#10B981', min: 3, max: 8 },
          ]}
          height={150}
          label="red < 1pp (kill) · amber 1–3pp (iterate) · green > 3pp (scale) · current campaign mix at +4.8pp uplift this week, all green band."
        />
      </div>
    </PageShell>
  );
}
export function BssPayments() {
  return (
    <PageShell>
      <PageHeader kicker="BSS · Revenue" title="Payments & Direct Debit" subtitle="DD success rate, BACS recall, cards on file, SCA failure modes, retry policy." badge={<BssMlBadge pageKey="payments" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.payments', 'gold.dd_attempts', 'gold.cards_on_file']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="DD success" value="98.4%" delta="+0.4pp" tone="good" />
        <KpiTile label="BACS recall" value="0.12%" delta="of 1.84M" tone="good" />
        <KpiTile label="Cards on file" value="6.2M" delta="+184k QoQ" tone="good" />
        <KpiTile label="SCA failure" value="0.84%" delta="−0.18pp" tone="good" />
        <KpiTile label="Avg recovery" value="3.2d" delta="attempt 1→3" tone="neutral" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6 vf-card p-3">
          <CardTitle>DD attempt ladder</CardTitle>
          <DdAttemptLadder />
        </div>
        <div className="col-span-12 lg:col-span-6 vf-card p-3">
          <CardTitle>Payment-method mix</CardTitle>
          <Donut data={[
            { label: 'Direct Debit',   value: 68, color: '#11567F' },
            { label: 'Card on file',   value: 22, color: '#F59E0B' },
            { label: 'Apple/Google Pay', value: 6, color: '#10B981' },
            { label: 'Open banking',   value: 3, color: '#8B5CF6' },
            { label: 'Other',          value: 1, color: '#9CA3AF' },
          ]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <CardTitle>DD success rate · last 12 weeks</CardTitle>
          <BandedLineChart
            data={[97.2, 97.4, 97.6, 97.8, 97.9, 98.0, 98.1, 98.2, 98.2, 98.3, 98.3, 98.4]}
            bands={[
              { color: '#E11D48', min: 95, max: 96.5 },
              { color: '#F59E0B', min: 96.5, max: 98 },
              { color: '#10B981', min: 98, max: 100 },
            ]}
            height={150}
            label="red < 96.5% (financial impact) · amber 96.5–98% · green ≥ 98% (target) · trended into green band 8 weeks ago."
          />
        </div>
        <div className="vf-card p-3">
          <CardTitle>DD retry funnel · last 30d</CardTitle>
          <Funnel
            stages={[
              { label: 'DD attempts',           value: 1840000, tone: 'neutral' },
              { label: '1st-attempt success',   value: 1810240, tone: 'good' },
              { label: 'Bank decline (retry)',  value: 22480,   tone: 'bad' },
              { label: '2nd-attempt success',   value: 18420,   tone: 'good' },
              { label: '3rd-attempt success',   value: 3120,    tone: 'good' },
              { label: 'Final fail → dunning',  value: 940,     tone: 'bad' },
            ]}
            formatter={(v) => v.toLocaleString()}
          />
          <div className="text-[10px] text-ink-muted mt-2">98.4% first-attempt success · retry policy adds 1.16pp · 940 final fails routed to collections (0.05% of attempts).</div>
        </div>
      </div>

      <div className="vf-card p-3">
        <CardTitle>SCA failure root-cause · 80/20 Pareto</CardTitle>
        <ParetoChart height={170} items={[
          { label: '3DS challenge expired',   value: 38 },
          { label: 'OTP wrong / mistyped',    value: 22 },
          { label: 'Customer abandonment',    value: 18 },
          { label: 'Issuer not enrolled',     value: 10 },
          { label: 'Frictionless rejected',   value: 7 },
          { label: 'Network timeout',         value: 5 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">Top 2 = 60% of SCA failures · 3DS expiry auto-retried with extended window via PSD2 RTS exemption when eligible · OTP failures routed to silent re-auth attempt.</div>
      </div>

      <CortexCompleteDraft
        title="Cortex Agent · DD failure dunning email"
        prompt="draft empathetic dunning email for ACC-6804 (DD failed - insufficient funds, 1st failure)"
        output={`Subject: We couldn't take your SnowTelco payment — but it's nothing to worry about

Hi Sarah,

We tried to take your monthly payment of £42.40 today and it didn't go through. Don't worry — this happens, and there's no late-fee for the first time.

We'll try again on 22 May. To avoid any disruption to your service:

• Make sure there are funds in your account by then, or
• Tap "Pay now" in the app to settle it manually (takes 30 seconds), or
• Reply to this email and we'll set up a 2-month payment plan — interest-free.

If money is tight right now, we have a hardship scheme that can help — no judgement, just options. Just reply with the word "help" and Lucy from our Customer Care team will be in touch.

— SnowTelco`}
      />
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 1 ML primitives
// ─────────────────────────────────────────────────────────────────────────────

export function EclWaterfall() {
  return (
    <Waterfall items={[
      { label: 'Q-open ECL',          value: 22400, tone: 'total' },
      { label: 'New Stage 1',         value: 1840,  tone: 'pos' },
      { label: 'Migrations to Stage 2', value: 2240, tone: 'pos' },
      { label: 'Migrations to Stage 3', value: 1080, tone: 'pos' },
      { label: 'Recoveries',          value: -1820, tone: 'neg' },
      { label: 'Write-offs',          value: -1340, tone: 'neg' },
      { label: 'Q-close ECL',         value: 24400, tone: 'total' },
    ]} formatter={(v) => `£${(v / 1000).toFixed(1)}k`} height={200} />
  );
}

export function CashInflowForecast() {
  const actual = [4.2, 4.4, 4.1, 4.6, 4.8, 5.0, 4.9, 5.2, 5.1, 5.4, 5.3, 5.6, 5.4, 5.7];
  const forecast = [...actual, 5.6, 5.4, 5.5, 5.2, 5.3, 5.4, 5.6, 5.5, 5.4, 5.6, 5.7, 5.8, 5.9, 6.0];
  return (
    <div>
      <LineChart series={[
        { name: 'Actual (£M/d)',    data: actual.concat(Array(14).fill(null as any)).slice(0, 28) },
        { name: 'Forecast (£M/d)',  data: Array(14).fill(null as any).concat(forecast.slice(14)) },
      ]} colors={['#11567F', '#10B981']} height={140} />
      <div className="text-[10px] text-ink-muted mt-1 font-mono">14d actual + 14d forecast · MAPE 4.2%</div>
    </div>
  );
}

export function LtvHistogram() {
  const buckets = [
    { label: '£0–500',    n: 4.2, color: '#9CA3AF' },
    { label: '£500–1k',   n: 5.4, color: '#29B5E8' },
    { label: '£1–2k',     n: 6.8, color: '#11567F' },
    { label: '£2–4k',     n: 4.4, color: '#10B981' },
    { label: '£4–8k',     n: 1.8, color: '#F59E0B' },
    { label: '£8k+',      n: 0.6, color: '#E11D48' },
  ];
  const max = Math.max(...buckets.map(b => b.n));
  return (
    <div className="flex items-end gap-1.5 h-28">
      {buckets.map((b, i) => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full rounded-t"
            style={{ background: b.color }}
            initial={{ height: 0 }}
            animate={{ height: `${(b.n / max) * 100}%` }}
            transition={{ delay: i * 0.08, duration: 0.7 }}
          />
          <span className="text-[10px] font-mono text-ink">{b.n}M</span>
          <span className="text-[9px] text-ink-muted">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CortexCompleteDraft({ title, prompt, output }: { title: string; prompt: string; output: string }) {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const start = () => {
    setStreaming(true); setText(''); setDone(false);
    let i = 0;
    const tokens = output.split(' ');
    const tick = () => {
      if (i >= tokens.length) { setStreaming(false); setDone(true); return; }
      setText((t) => (t ? t + ' ' : '') + tokens[i]);
      i++;
      setTimeout(tick, 22);
    };
    setTimeout(tick, 600);
  };
  return (
    <div className="vf-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{title}</div>
          <div className="text-[10px] text-ink-muted font-mono">prompt: {prompt}</div>
        </div>
        <button
          onClick={start}
          disabled={streaming}
          className="vf-btn-primary !py-1 !px-2.5 !text-[11px] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" /> {streaming ? 'Drafting…' : done ? 'Re-draft' : 'Draft with Cortex Agent'}
        </button>
      </div>
      <AnimatePresence>
        {(streaming || done) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-mist/60 p-2.5 text-[12px] text-ink leading-snug whitespace-pre-line"
          >
            {text}{streaming && <span className="inline-block w-1 h-4 bg-vfRed ml-0.5 align-middle animate-pulse" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MlPanelHeader({ pageKey, label }: { pageKey: string; label: string }) {
  return (
    <div className="flex items-center justify-between mb-2 gap-2">
      <CardTitle>{label}</CardTitle>
      <BssMlBadge pageKey={pageKey} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 1+2 visual primitives (15 charts across BSS)
// ─────────────────────────────────────────────────────────────────────────────

export function Treemap({ items }: { items: { label: string; value: number; margin: number }[] }) {
  // Simple slice-and-dice treemap. Sort desc, alternate horizontal/vertical splits.
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, it) => s + it.value, 0);
  const colorFor = (m: number) => m >= 0.35 ? '#10B981' : m >= 0.25 ? '#F59E0B' : '#E11D48';
  // single-row layout for simplicity: width ∝ value
  let acc = 0;
  return (
    <div className="w-full h-44 flex gap-[2px]">
      {sorted.map((it, i) => {
        const pct = (it.value / total) * 100;
        const out = (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: i * 0.05, duration: 0.45 }}
            className="rounded-[2px] flex flex-col items-center justify-center text-white text-center px-1"
            style={{ width: `${pct}%`, background: colorFor(it.margin), minWidth: 0 }}
            title={`${it.label} · £${it.value}M · margin ${(it.margin * 100).toFixed(0)}%`}
          >
            <div className="text-[11px] font-bold truncate w-full">{it.label}</div>
            <div className="text-[10px] font-mono opacity-90">£{it.value}M</div>
          </motion.div>
        );
        acc += pct;
        return out;
      })}
    </div>
  );
}

export function ParetoChart({ items, height = 200 }: { items: { label: string; value: number }[]; height?: number }) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, it) => s + it.value, 0);
  const max = sorted[0]?.value ?? 1;
  let cum = 0;
  const cumPoints = sorted.map((it) => {
    cum += it.value;
    return (cum / total) * 100;
  });
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 relative" style={{ height }}>
        {sorted.map((it, i) => {
          const h = (it.value / max) * 80;
          return (
            <div key={it.label} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
              <motion.div
                className="w-full rounded-t bg-vfRed"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              />
              <div className="text-[9px] text-ink-muted truncate w-full text-center" title={it.label}>{it.label}</div>
            </div>
          );
        })}
        {/* cumulative line overlay */}
        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none" stroke="#11567F" strokeWidth="0.6"
            points={cumPoints.map((p, i) => `${(i / (sorted.length - 1)) * 100},${100 - p * 0.85}`).join(' ')}
          />
          {cumPoints.map((p, i) => (
            <circle key={i} cx={(i / (sorted.length - 1)) * 100} cy={100 - p * 0.85} r="0.8" fill="#11567F" />
          ))}
        </svg>
      </div>
      <div className="text-[10px] text-ink-muted">Bars = value · navy line = cumulative %.</div>
    </div>
  );
}

export function BandedLineChart({ data, bands, label, height = 140 }: {
  data: number[];
  bands: { color: string; min: number; max: number }[];
  label?: string;
  height?: number;
}) {
  const min = Math.min(...data, ...bands.map(b => b.min));
  const max = Math.max(...data, ...bands.map(b => b.max));
  const range = max - min || 1;
  const W = 600;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * W},${height - ((v - min) / range) * height * 0.9 - height * 0.05}`).join(' ');
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {bands.map((b, i) => {
          const y1 = height - ((b.max - min) / range) * height * 0.9 - height * 0.05;
          const y2 = height - ((b.min - min) / range) * height * 0.9 - height * 0.05;
          return <rect key={i} x={0} y={y1} width={W} height={Math.max(0, y2 - y1)} fill={b.color} opacity={0.18} />;
        })}
        <motion.polyline
          fill="none" stroke="#11567F" strokeWidth="2" points={points}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.0 }}
        />
        {data.map((v, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * W} cy={height - ((v - min) / range) * height * 0.9 - height * 0.05} r="2" fill="#11567F" />
        ))}
      </svg>
      {label && <div className="text-[10px] text-ink-muted mt-1">{label}</div>}
    </div>
  );
}

export function AreaChart({ data, color = '#11567F', height = 140, band }: { data: number[]; color?: string; height?: number; band?: { lo: number[]; hi: number[] } }) {
  const all = band ? [...data, ...band.lo, ...band.hi] : data;
  const min = Math.min(...all, 0);
  const max = Math.max(...all, 1);
  const range = max - min || 1;
  const W = 600;
  const toPoints = (arr: number[]) => arr.map((v, i) => `${(i / (arr.length - 1)) * W},${height - ((v - min) / range) * height * 0.9 - height * 0.05}`).join(' ');
  const linePoints = toPoints(data);
  const areaPath = band
    ? `M ${toPoints(band.lo)} L ${toPoints([...band.hi].reverse()).split(' ').reverse().join(' ')} Z`
    : '';
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {band && (
        <polygon
          fill={color} fillOpacity={0.15}
          points={[...band.lo.map((v, i) => `${(i / (band.lo.length - 1)) * W},${height - ((v - min) / range) * height * 0.9 - height * 0.05}`), ...band.hi.map((v, i) => `${((band.hi.length - 1 - i) / (band.hi.length - 1)) * W},${height - ((band.hi[band.hi.length - 1 - i] - min) / range) * height * 0.9 - height * 0.05}`)].join(' ')}
        />
      )}
      <motion.polyline fill="none" stroke={color} strokeWidth="2" points={linePoints} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.0 }} />
    </svg>
  );
}

export function StackedAreaChart({ series, colors, labels }: { series: number[][]; colors: string[]; labels?: string[] }) {
  const N = series[0]?.length ?? 0;
  const totals = Array.from({ length: N }, (_, i) => series.reduce((s, row) => s + row[i], 0));
  const max = Math.max(...totals, 1);
  const W = 600;
  const H = 160;
  // Build cumulative bands
  const cum: number[][] = [];
  let prev = Array(N).fill(0);
  for (const row of series) {
    const next = row.map((v, i) => prev[i] + v);
    cum.push(next);
    prev = next;
  }
  const yFor = (v: number) => H - (v / max) * (H - 12) - 6;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
        {series.map((_, idx) => {
          const upper = cum[idx];
          const lower = idx === 0 ? Array(N).fill(0) : cum[idx - 1];
          const points = [
            ...upper.map((v, i) => `${(i / (N - 1)) * W},${yFor(v)}`),
            ...lower.map((v, i) => `${((N - 1 - i) / (N - 1)) * W},${yFor(lower[N - 1 - i])}`),
          ].join(' ');
          return <motion.polygon key={idx} points={points} fill={colors[idx]} initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: idx * 0.08 }} />;
        })}
      </svg>
      {labels && (
        <div className="flex flex-wrap gap-2 mt-1.5 text-[10px]">
          {labels.map((l, i) => (
            <span key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: colors[i] }} />{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function StackedDeltaBars({ items }: { items: { label: string; value: number; delta: number }[] }) {
  const max = Math.max(...items.map(i => i.value));
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          className="flex items-center gap-2 text-[11.5px]"
        >
          <span className="w-[160px] truncate text-ink font-bold shrink-0">{it.label}</span>
          <div className="flex-1 h-4 bg-mist rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-vfRed"
              initial={{ width: 0 }}
              animate={{ width: `${(it.value / max) * 100}%` }}
              transition={{ delay: i * 0.05 + 0.1, duration: 0.6 }}
            />
          </div>
          <span className="font-mono w-[64px] text-right font-bold">£{it.value.toFixed(1)}M</span>
          <span className={cn('font-mono w-[56px] text-right font-bold', it.delta > 0 ? 'text-emerald-600' : it.delta < 0 ? 'text-vfRed' : 'text-ink-muted')}>
            {it.delta > 0 ? '+' : ''}{it.delta.toFixed(1)}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function Histogram({ buckets, mean, height = 140 }: { buckets: { label: string; count: number }[]; mean?: number; height?: number }) {
  const max = Math.max(...buckets.map(b => b.count), 1);
  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-0 flex items-end gap-[2px]">
        {buckets.map((b, i) => (
          <div key={b.label} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
            <motion.div
              className="w-full rounded-t bg-blue-500"
              initial={{ height: 0 }}
              animate={{ height: `${(b.count / max) * 80}%` }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              title={`${b.label}: ${b.count}`}
            />
            <div className="text-[9px] text-ink-muted text-center w-full truncate">{b.label}</div>
          </div>
        ))}
      </div>
      {mean !== undefined && (
        <div className="absolute inset-y-0 border-l-2 border-dashed border-vfRed pointer-events-none" style={{ left: `${(mean / buckets.length) * 100}%` }}>
          <span className="text-[9px] text-vfRed font-bold absolute -top-3 -translate-x-1/2 whitespace-nowrap">mean</span>
        </div>
      )}
    </div>
  );
}

export function UkRegionMap({ data }: { data: Record<string, number> }) {
  // Real(istic) UK + Ireland silhouette as the underlying map, with heat hexagons placed
  // at each region's geographic centroid on top.

  // Detailed Great Britain coastline (clockwise from Cape Wrath / NW tip)
  const gbPath = `
    M 170 25 L 195 22 L 240 28 L 248 38 L 260 60 L 275 88 L 270 115
    L 282 138 L 268 158 L 252 178 L 268 188 L 290 196 L 300 215
    L 318 232 L 332 250 L 338 270 L 350 285 L 358 295 L 372 296
    L 385 300 L 396 318 L 392 340 L 388 360 L 378 372 L 384 388
    L 388 402 L 372 410 L 348 415 L 320 418 L 290 420 L 258 422
    L 220 425 L 190 422 L 158 415 L 142 405 L 138 388 L 168 380
    L 195 388 L 215 380 L 215 358 L 195 348 L 165 350 L 145 358
    L 132 348 L 130 325 L 142 308 L 152 290 L 165 280 L 158 260
    L 175 250 L 192 268 L 220 282 L 218 260 L 222 240 L 235 232
    L 215 215 L 192 200 L 180 175 L 198 158 L 215 155 L 198 138
    L 180 122 L 165 100 L 155 78 L 152 55 L 162 38 Z`;

  // Ireland (clockwise from Malin Head)
  const irelandPath = `
    M 92 188 L 110 195 L 120 210 L 135 218 L 142 232 L 145 252
    L 155 275 L 152 295 L 138 308 L 115 318 L 92 322 L 65 318
    L 45 305 L 35 282 L 32 258 L 50 240 L 62 222 L 75 210 Z`;

  // Region centroids on the silhouette
  const regions: { id: string; label: string; cx: number; cy: number }[] = [
    { id: 'SCOT',  label: 'Scotland',       cx: 220, cy: 105 },
    { id: 'NE',    label: 'North-East',     cx: 295, cy: 215 },
    { id: 'NW',    label: 'North-West',     cx: 245, cy: 265 },
    { id: 'YORKS', label: 'Yorks & Humber', cx: 318, cy: 268 },
    { id: 'NI',    label: 'N. Ireland',     cx: 122, cy: 230 },
    { id: 'WALES', label: 'Wales',          cx: 178, cy: 318 },
    { id: 'WM',    label: 'W. Midlands',    cx: 240, cy: 320 },
    { id: 'EM',    label: 'E. Midlands',    cx: 295, cy: 312 },
    { id: 'EAST',  label: 'East England',   cx: 358, cy: 332 },
    { id: 'SW',    label: 'South-West',     cx: 228, cy: 392 },
    { id: 'LON',   label: 'London',         cx: 340, cy: 386 },
    { id: 'SE',    label: 'South-East',     cx: 358, cy: 405 },
  ];

  const max = Math.max(...Object.values(data), 1);
  const min = Math.min(...Object.values(data));
  const heat = (v: number) => {
    const t = Math.min(1, Math.max(0, v / max));
    if (t < 0.2) return '#0F8AA8';
    if (t < 0.4) return '#5DBE9A';
    if (t < 0.6) return '#F4D03F';
    if (t < 0.8) return '#E67E22';
    return '#C0392B';
  };

  // Hexagon path (pointy-top) centred at (cx, cy) with radius r
  const hexPath = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 30);
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return 'M ' + pts.join(' L ') + ' Z';
  };

  return (
    <div>
      <div className="relative w-full" style={{ aspectRatio: '460 / 460' }}>
        <svg viewBox="0 0 460 460" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="ukMapGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <linearGradient id="ukLand" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F8FB" />
              <stop offset="100%" stopColor="#D8E3EB" />
            </linearGradient>
            <radialGradient id="seaBg" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#E9F2F8" />
              <stop offset="100%" stopColor="#CFE0EB" />
            </radialGradient>
            <pattern id="seaTexture" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#BDD2DE" strokeWidth="0.4" opacity="0.4" />
            </pattern>
          </defs>

          <rect x="0" y="0" width="460" height="460" fill="url(#seaBg)" />
          <rect x="0" y="0" width="460" height="460" fill="url(#seaTexture)" />

          {/* UK + Ireland real silhouette */}
          <g>
            <path d={irelandPath} fill="url(#ukLand)" stroke="#6E8290" strokeWidth="1.2" strokeLinejoin="round" opacity={0.92} />
            <path d={gbPath} fill="url(#ukLand)" stroke="#6E8290" strokeWidth="1.2" strokeLinejoin="round" />
          </g>

          {/* Heatwave halos pulsing under each hex */}
          {regions.map((reg, i) => {
            const v = data[reg.id] ?? 0;
            const t = v / max;
            const radius = 24 + t * 22;
            return (
              <motion.circle
                key={`halo-${reg.id}`}
                cx={reg.cx} cy={reg.cy} r={radius}
                fill={heat(v)} opacity={0.32}
                filter="url(#ukMapGlow)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.18, 0.45, 0.18], scale: [0.85, 1.05, 0.85] }}
                transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.16 }}
                style={{ transformOrigin: `${reg.cx}px ${reg.cy}px` }}
              />
            );
          })}

          {/* Hexagons on top of the map */}
          {regions.map((reg, i) => {
            const v = data[reg.id] ?? 0;
            const t = v / max;
            const radius = 16 + t * 8; // 16..24
            return (
              <motion.path
                key={reg.id}
                d={hexPath(reg.cx, reg.cy, radius)}
                fill={heat(v)}
                stroke="#ffffff" strokeWidth="2"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.45, type: 'spring' }}
                style={{ transformOrigin: `${reg.cx}px ${reg.cy}px` }}
              >
                <title>{`${reg.label} · £${v}M/mo`}</title>
              </motion.path>
            );
          })}

          {/* Region labels — white halo so they stay legible over any colour */}
          {regions.map((reg) => {
            const v = data[reg.id] ?? 0;
            const t = v / max;
            const radius = 16 + t * 8;
            const flipLeft = ['EAST', 'SE', 'YORKS', 'NE', 'EM'].includes(reg.id);
            const labelX = reg.cx + (flipLeft ? -radius - 4 : radius + 4);
            const anchor = flipLeft ? 'end' : 'start';
            return (
              <g key={`lbl-${reg.id}`} pointerEvents="none">
                <text x={labelX} y={reg.cy - 3} textAnchor={anchor}
                  fontSize="10" fontWeight="700" fill="#1f2937"
                  style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3, strokeLinejoin: 'round' }}>
                  {reg.label}
                </text>
                <text x={labelX} y={reg.cy + 10} textAnchor={anchor}
                  fontSize="11" fontWeight="800"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill="#111"
                  style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3, strokeLinejoin: 'round' }}>
                  £{v}M
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-muted">
        <span>cool</span>
        <div className="flex-1 h-2 rounded-full" style={{
          background: 'linear-gradient(to right, #0F8AA8 0%, #5DBE9A 25%, #F4D03F 50%, #E67E22 75%, #C0392B 100%)'
        }} />
        <span>hot</span>
        <span className="ml-2 font-mono">£{min}M – £{max}M / mo · hex size ∝ revenue</span>
      </div>
    </div>
  );
}

export function CohortRetentionLayer() {
  // 6 quarterly cohorts; survival % at month 0,3,6,9,12,15,18,21,24
  const cohorts = [
    { name: '2024-Q1', color: '#11567F', survival: [100, 96, 92, 88, 84, 81, 78, 76, 74] },
    { name: '2024-Q2', color: '#29B5E8', survival: [100, 96, 93, 89, 85, 82, 80, 78, 0] },
    { name: '2024-Q3', color: '#10B981', survival: [100, 97, 94, 90, 87, 84, 81, 0, 0] },
    { name: '2024-Q4', color: '#F59E0B', survival: [100, 97, 94, 91, 88, 85, 0, 0, 0] },
    { name: '2025-Q1', color: '#E11D48', survival: [100, 98, 95, 92, 89, 0, 0, 0, 0] },
    { name: '2025-Q2', color: '#8B5CF6', survival: [100, 98, 96, 93, 0, 0, 0, 0, 0] },
  ];
  const N = cohorts[0].survival.length;
  const W = 600;
  const H = 180;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
        {cohorts.map((c, idx) => {
          const points = c.survival
            .map((v, i) => v > 0 ? `${(i / (N - 1)) * W},${H - (v / 100) * (H - 12) - 6}` : null)
            .filter(Boolean) as string[];
          return <motion.polyline
            key={c.name}
            points={points.join(' ')}
            fill="none" stroke={c.color} strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: idx * 0.08, duration: 0.8 }}
          />;
        })}
      </svg>
      <div className="flex flex-wrap gap-2 mt-1.5 text-[10px]">
        {cohorts.map((c) => (
          <span key={c.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />{c.name}</span>
        ))}
      </div>
      <div className="text-[10px] text-ink-muted mt-1">x = months since acquisition · y = % retained · gross-retention 84% · net-retention 96%.</div>
    </div>
  );
}

export function CycleSlaHeatmap() {
  const cycles = ['CYCLE-01','CYCLE-02','CYCLE-03','CYCLE-04','CYCLE-05','CYCLE-06'];
  const days = ['d1','d3','d5','d7','d9','d11','d13','d15','d17','d19','d21','d23','d25','d27','d29','d31'];
  // 0=closed (green), 1=QA (blue), 2=running (amber), 3=queued (grey)
  const data = [
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,2,2,1,3,3,3,3,3],
    [0,0,0,0,0,0,0,2,2,3,3,3,3,3,3,3],
    [0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3],
  ];
  const colors = ['#10B981', '#29B5E8', '#F59E0B', '#E5E7EB'];
  const labels = ['closed', 'QA', 'running', 'queued'];
  return (
    <div>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `7rem repeat(${days.length}, minmax(0, 1fr))` }}>
        <div />
        {days.map((d) => <div key={d} className="text-[9px] text-ink-muted text-center">{d}</div>)}
        {cycles.map((c, r) => (
          <Fragment key={c}>
            <div className="text-[10px] font-bold text-ink pr-2 self-center truncate">{c}</div>
            {data[r].map((v, ci) => (
              <motion.div
                key={`${c}-${ci}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (r * 16 + ci) * 0.005 }}
                className="aspect-square rounded-[2px]"
                style={{ background: colors[v] }}
                title={`${c} · ${days[ci]} · ${labels[v]}`}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-1.5 text-[10px]">
        {labels.map((l, i) => <span key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: colors[i] }} />{l}</span>)}
      </div>
    </div>
  );
}
