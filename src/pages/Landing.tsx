import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, User2, Smartphone, CreditCard, Wrench, Radio, Bot,
  ShieldCheck, Sparkles, Database, Activity, Gauge, CheckCircle2,
} from 'lucide-react';

interface DomainCard {
  to: string;
  kicker: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  outcome: string;
  highlights: string[];
  accent: string;
}

const domains: DomainCard[] = [
  {
    to: '/command-center',
    kicker: 'CIC',
    title: 'Customer Intelligence',
    desc: 'Identity-resolved 360. Churn explainability, next-best-offer, vulnerability-aware care.',
    icon: User2,
    outcome: '−1.8pp churn YoY',
    highlights: ['Customer 360 across 5 brands', 'NBA + retention engine', 'Vulnerability + GC C5'],
    accent: 'bg-vfRed-soft text-vfRed-dark',
  },
  {
    to: '/digital',
    kicker: 'Digital',
    title: 'Digital Channels',
    desc: 'App, web, conversational and voice — orchestrated, consented, agent-personalised.',
    icon: Smartphone,
    outcome: '+9pp self-serve · CSAT 0.86',
    highlights: ['Cortex Agent containment', 'Voice + chat deflection', 'In-app journeys, NBA-suppressed'],
    accent: 'bg-fuchsia-100 text-fuchsia-700',
  },
  {
    to: '/bss',
    kicker: 'BSS',
    title: 'Commerce & Revenue',
    desc: 'Catalog, order-to-activate, charging, billing, IFRS 9/15 finance — the revenue lifecycle.',
    icon: CreditCard,
    outcome: 'DSO −4d · leakage −0.11pp',
    highlights: ['TMF 620 / 622 / 633 / 648', 'IFRS 9 ECL · IFRS 15 RevRec', 'Bill-shock + RA leakage'],
    accent: 'bg-amber/20 text-amber-800',
  },
  {
    to: '/oss',
    kicker: 'OSS',
    title: 'Service Operations',
    desc: 'Inventory, fulfilment, capacity, field force, energy & sustainability.',
    icon: Wrench,
    outcome: '−3,200kg CO₂/site/mo',
    highlights: ['TMF 638 inventory', 'Field-force routing', 'Energy & ESG scorecard'],
    accent: 'bg-blue-100 text-blue-700',
  },
  {
    to: '/noc',
    kicker: 'NOC',
    title: 'Agentic Network Ops',
    desc: 'Detect → diagnose → decide → act → verify, with closed-loop actions and HITL guardrails.',
    icon: Radio,
    outcome: 'MTTR 47m → 7m24s',
    highlights: ['RAN · Transport · IMS · Sec', 'Topology + alarm storm', 'Auditable agent runs · NIS2'],
    accent: 'bg-emerald-100 text-emerald-700',
  },
];

// Operational scoreboard — observable outcomes from the demo, not value claims.
const scoreboard = [
  { kicker: 'Customer churn',     value: '−1.8pp', unit: 'YoY',         delta: '11.2% → 9.4%',        tone: 'good' as const, icon: User2 },
  { kicker: 'Net Promoter Score', value: '+12',    unit: 'pts',         delta: 'NPS 38 → 50',          tone: 'good' as const, icon: Sparkles },
  { kicker: 'NOC MTTR · RAN',     value: '7m 24s', unit: 'mitigation',  delta: 'vs 47 min baseline',  tone: 'good' as const, icon: Gauge },
  { kicker: 'Self-serve rate',    value: '74%',    unit: 'digital',     delta: '+9pp YoY',             tone: 'good' as const, icon: Smartphone },
  { kicker: 'eSIM activation',    value: '~6 sec', unit: 'agent-driven', delta: 'vs 3–5 days',         tone: 'good' as const, icon: Activity },
  { kicker: 'Care deflection',    value: '+9pp',   unit: 'agent FCR',   delta: 'CSAT 0.86 maintained', tone: 'good' as const, icon: Bot },
];

// Outcome scoreboard — directional improvements demonstrated in the scenarios. No £ claims.
const valueDrivers = [
  { label: 'Churn save',            before: '11.2% YoY',     after: '9.4% YoY',        outcome: '−1.8pp',     caption: 'Snowpark ML + NBA retention engine, audit-ready CIC' },
  { label: 'Bill-shock prevention', before: 'high disputes', after: 'auto-explained',  outcome: 'GC C4',      caption: 'Cortex Complete bill explainer · Ofcom GC C4 fairness' },
  { label: 'Care deflection',       before: '£42 per case',  after: '£15 per case',    outcome: '−64% unit',  caption: 'Cortex Agent FCR + co-pilot · CSAT 0.86' },
  { label: 'Revenue assurance',     before: 'leakage 0.18%', after: 'leakage 0.07%',   outcome: '−0.11pp',    caption: 'AISQL anomaly + closed-loop remediation playbooks' },
  { label: 'eSIM activation',       before: '3–5 days',      after: '~6 sec',          outcome: '+11pp conv', caption: 'Order-to-Activate agent · KYC + fraud + eSIM in one flow' },
  { label: 'NOC mitigation',        before: '47 min',        after: '7m 24s',          outcome: '−84% MTTR',  caption: 'Closed-loop RAN/IMS · NIS2 + Ofcom GC A3 audit trail' },
];

const liveScenarios = [
  { tag: 'CIC',     text: 'Manchester churn save · 89 P1 customers · NBA + retention offer · churn drop −34pp' },
  { tag: 'Digital', text: 'Care chat deflection · CSAT 0.86 · Cortex Agent contained 42% of incoming volume' },
  { tag: 'BSS',     text: '5G SA Unlimited Max · published TMF 620 to 6 channels in 4 min · CAB-approved · audit trail' },
  { tag: 'OSS',     text: 'Energy-save automation · NYK rural site · 1,420 customers protected · 3,200kg CO₂ avoided' },
  { tag: 'NOC',     text: 'London IMS · HSS Cx storm · 1.42M subs · agent-mitigated 9m48s · GC A3 + NIS2 evidence pack' },
];

export default function Landing() {
  return (
    <div className="relative">
      <ExecutiveBackdrop />

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative max-w-[1600px] mx-auto px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1400px]"
        >
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="vf-chip bg-vfRed-soft text-vfRed-dark font-bold tracking-wider uppercase">Executive briefing</span>
            <span className="vf-chip border border-ink/15 text-ink-muted">Snowflake AI Data Cloud</span>
            <span className="vf-chip border border-ink/15 text-ink-muted">UK · synthetic demo</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[1.04]">
            Agentic AI across the entire telco stack —<br className="hidden md:inline" />
            <span className="text-vfRed">measured in seconds, hours and customer outcomes.</span>
          </h1>
          <p className="mt-6 text-lg text-ink-muted max-w-5xl leading-relaxed">
            Five domains. One Snowflake-native data plane. Cortex Agents close the loop end-to-end —
            from detect → decide → act → verify — with consent, masking, RBAC and full audit baked in.
            Every number on this page is observable in the demo scenarios. £-value sizing is customer-specific.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/command-center" className="vf-btn-primary group">
              Open the demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/scenarios" className="vf-btn-secondary">Demo scenarios</Link>
            <Link to="/architecture" className="vf-btn-secondary">View Architecture</Link>
            <Link to="/database" className="vf-btn-secondary">Database catalog</Link>
          </div>

          {/* Live savings ticker — accumulates from page-load */}
          <LiveSavingsTicker />
        </motion.div>

        {/* Board-level scoreboard */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {scoreboard.map((k, i) => (
            <motion.div
              key={k.kicker}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.45 }}
              className="vf-card p-3 relative overflow-hidden"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-bold">
                <k.icon className="w-3 h-3 text-vfRed" />{k.kicker}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-ink font-mono tabular-nums leading-none">{k.value}</span>
                <span className="text-[10px] text-ink-muted">{k.unit}</span>
              </div>
              <div className="text-[10.5px] mt-1 text-emerald-700 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />{k.delta}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── OUTCOME SCOREBOARD ──────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-6 pb-10">
        <div className="vf-card overflow-hidden p-0">
          <div className="bg-gradient-to-r from-vfRed via-rose-700 to-rose-900 text-white px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] font-bold opacity-90">Outcome scoreboard · what changes, directionally</div>
              <div className="text-2xl font-extrabold leading-tight">Six demonstrable improvements across the customer + operations lifecycle</div>
              <div className="text-[12px] opacity-90 mt-1">Directional, scenario-validated, audit-attestable. £-value sizing is customer-specific and worked through in the working session.</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Live demo scope</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums leading-none">28 scenarios</div>
              </div>
              <CheckCircle2 className="w-10 h-10 opacity-90" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-mist-dark/60">
            {valueDrivers.map((d) => (
              <div key={d.label} className="bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-extrabold text-ink text-[14px]">{d.label}</div>
                  <span className="vf-chip bg-emerald-100 text-emerald-700 font-bold text-[10.5px] whitespace-nowrap">{d.outcome}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2 text-[12px] font-mono">
                  <span className="line-through text-ink-muted">{d.before}</span>
                  <ArrowRight className="w-3 h-3 text-ink-muted shrink-0" />
                  <span className="text-vfRed font-extrabold tabular-nums">{d.after}</span>
                </div>
                <div className="text-[11px] text-ink-muted mt-2 leading-snug">{d.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FIVE-DOMAIN GRID ────────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-6 pb-10">
        <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Five domains</div>
            <h2 className="text-2xl font-extrabold text-ink leading-tight">One platform across the entire telco stack</h2>
          </div>
          <span className="text-xs text-ink-muted">Each domain runs scenarios independently · <Link to="/scenarios" className="text-vfRed font-bold underline-offset-2 hover:underline">browse all 60+ scenarios →</Link></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {domains.map((d, i) => (
            <motion.div
              key={d.kicker}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link to={d.to} className="vf-card p-4 hover:shadow-elev hover:-translate-y-0.5 transition group flex flex-col gap-2 h-full">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-lg grid place-items-center ${d.accent}`}>
                    <d.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-bold">{d.kicker}</span>
                </div>
                <div className="font-extrabold text-ink leading-tight">{d.title}</div>
                <p className="text-xs text-ink-muted leading-snug flex-1">{d.desc}</p>
                <div className="vf-chip bg-emerald-100 text-emerald-700 text-[10.5px] font-bold w-fit">
                  {d.outcome}
                </div>
                <ul className="space-y-0.5">
                  {d.highlights.map((h) => (
                    <li key={h} className="text-[11px] text-ink flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-vfRed mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1 text-[11px] text-vfRed font-bold pt-1">
                  Open <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── STRATEGIC MOATS + LIVE STREAM ───────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-6 pb-16 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-vfRed" />
              <div className="font-extrabold text-ink text-lg">Why agentic on Snowflake</div>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Telcos run with fragmented data and human-only loops — alarms in one tool, customers in another, billing in a third. Agentic AI on Snowflake collapses the loop: every signal, every customer, every action sits on one governed plane, and Cortex Agents close the loop end-to-end with full audit.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              <Pillar icon={<Sparkles className="w-4 h-4" />} title="Closed-loop NOC" body="Detect → diagnose → decide → act → verify. Reversible, auditable, HITL-gated where required." />
              <Pillar icon={<Database className="w-4 h-4" />} title="One data plane" body="CDR, EMS alarms, CRM, billing, digital events — all on Snowflake. No copies, no drift." />
              <Pillar icon={<ShieldCheck className="w-4 h-4" />} title="Governed by design" body="Consent, masking, RBAC, GDPR Art.22, Ofcom GC C1/C4/C5, NIS2 — embedded in every flow." />
              <Pillar icon={<Activity className="w-4 h-4" />} title="Real-time decisions" body="Snowpipe Streaming + Dynamic Tables + Cortex Analyst on live signals at 28k events/s." />
              <Pillar icon={<User2 className="w-4 h-4" />} title="Identity-resolved" body="Customer 360 stitched across all brands, products and channels via deterministic + probabilistic match." />
              <Pillar icon={<Bot className="w-4 h-4" />} title="Auditable agents" body="Every reasoning step, tool call, approval and reversal is recorded for the regulator." />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-vfRed">
                  <span className="absolute inset-0 rounded-full bg-vfRed/60 animate-ping" />
                </span>
                <span className="text-sm font-bold text-ink">Live operations stream</span>
              </div>
              <span className="vf-chip bg-mist text-ink-muted text-[10px]">last 24h</span>
            </div>
            <div className="space-y-2">
              {liveScenarios.map((a, i) => (
                <motion.div
                  key={a.text}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.4, duration: 0.4 }}
                  className="flex items-start gap-2 p-2 rounded-lg bg-mist/60 border border-mist-dark/60"
                >
                  <span className="vf-chip bg-white border border-mist-dark text-ink-muted shrink-0 text-[10px] font-bold">{a.tag}</span>
                  <span className="text-[12.5px] text-ink leading-snug">{a.text}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-mist-dark text-[11px] text-ink-muted">
              Open a section, pick from the sidebar dropdown or hit <kbd className="px-1 rounded bg-mist border border-mist-dark text-[9px] font-mono">⌘K</kbd>, then press Play.
            </div>
          </div>

          <div className="vf-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-vfRed" />
              <div className="font-bold text-ink">Snowflake AI Data Cloud · platform</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Cortex Agents','Cortex Analyst','Cortex Search',
                'AISQL · AI_AGG · AI_FILTER · AI_COMPLETE',
                'Snowpipe Streaming','Dynamic Tables','Snowpark ML',
                'Iceberg Tables','Horizon Catalog','Time Travel','Marketplace',
              ].map((t) => (
                <span key={t} className="vf-chip bg-ink text-white text-[10px] font-bold">{t}</span>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-muted mt-3 leading-snug">
              Real-time ingest from EMS · NMS · CDR · Probes · CRM · Billing into Snowflake.
              Cortex Agents close the loop with governed actions back to ServiceNow, RAN OAM, IMS, Care orchestrator and Customer Comms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LiveSavingsTicker() {
  // Agentic activity demo — counters observable in the scenarios. No £ claims.
  // Rates calibrated to be presenter-credible at UK-scale and visibly tick:
  //   signals (mediation events) ≈ 28.4k/s
  //   agent decisions (Cortex Agents over customer + network events) ≈ 84/s (~7.3M/day)
  //   closed-loop actions (auto-applied remediations) ≈ 12/s (~1M/day)
  const SIGNALS_PER_SEC   = 28_400;
  const DECISIONS_PER_SEC = 84;
  const ACTIONS_PER_SEC   = 12;
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      setElapsedMs(t - start);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const sec = elapsedMs / 1000;
  const signals   = Math.floor(sec * SIGNALS_PER_SEC);
  const decisions = Math.floor(sec * DECISIONS_PER_SEC);
  const actions   = Math.floor(sec * ACTIONS_PER_SEC);
  const elapsedSec = Math.floor(sec);
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white px-3 py-2 shadow-sm w-fit"
    >
      <span className="relative inline-flex w-2.5 h-2.5">
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
        <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-bold mr-1">Agentic activity · since you opened this page</span>
      <Counter label="signals processed"    value={signals}   />
      <span className="text-ink-muted">·</span>
      <Counter label="agent decisions"      value={decisions} />
      <span className="text-ink-muted">·</span>
      <Counter label="closed-loop actions"  value={actions}   />
      <span className="text-[11px] text-ink-muted ml-1">{mm}:{ss}</span>
    </motion.div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-ink font-mono tabular-nums text-[14px] font-extrabold">{value.toLocaleString('en-GB')}</span>
      <span className="text-[10.5px] text-ink-muted">{label}</span>
    </span>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-mist-dark p-3 bg-mist/40">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-vfRed">{icon}</span>
        <div className="font-bold text-ink text-[12.5px]">{title}</div>
      </div>
      <p className="text-[11.5px] text-ink-muted leading-snug">{body}</p>
    </div>
  );
}

function ExecutiveBackdrop() {
  // Subtle radial + thin grid — boardroom calm rather than busy network pattern.
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
      <div className="absolute inset-0" style={{
        background:
          'radial-gradient(1100px 400px at 18% -10%, rgba(225,29,72,0.10) 0%, transparent 70%),' +
          'radial-gradient(900px 360px at 95% 0%, rgba(41,181,232,0.10) 0%, transparent 65%),' +
          'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
      }} />
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <pattern id="execGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#111" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#execGrid)" />
      </svg>
    </div>
  );
}
