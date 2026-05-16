import { Brain, Mic, FlaskConical, Plug, PoundSterling, LifeBuoy, Lock, Calendar, KeyRound, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DigitalMlBadge } from './DigitalCharts';
import { BarChart, Donut, Funnel, HBar, Heatmap, LineChart, Scatter, Sparkline, Waterfall } from '@/components/shared/Charts';

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout primitives (mirrors DigitalMarketing.tsx PageHeader/KpiTile)
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

function StatusChip({ status }: { status: 'live' | 'scheduled' | 'paused' | 'done' | 'breach' | 'warn' | 'ok' }) {
  const tone = status === 'live' || status === 'ok' ? 'bg-emerald-100 text-emerald-700'
              : status === 'warn' ? 'bg-amber/20 text-amber-800'
              : status === 'breach' || status === 'paused' ? 'bg-vfRed text-white'
              : 'bg-mist text-ink-muted';
  return <span className={cn('vf-chip text-[9px] uppercase font-bold', tone)}>{status}</span>;
}

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Decisioning Brain
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalDecisioning() {
  const trace = [
    { ts: '00:00.00', step: 'Intent received', detail: 'CUST-001 · M14 chat · "5G slow at home"', tone: 'detect' },
    { ts: '00:00.04', step: 'Customer state',  detail: 'CLV £980 · churn 0.62 · contract ending 21d', tone: 'observe' },
    { ts: '00:00.07', step: 'Eligible offers', detail: '12 offers retrieved from gold.offer_eligibility', tone: 'observe' },
    { ts: '00:00.12', step: 'Suppression',     detail: '3 dropped: frequency cap (1) · margin floor (1) · vulnerability (1)', tone: 'plan' },
    { ts: '00:00.18', step: 'Cortex Agent reasoning', detail: '"Network event known · prioritise apology + credit · avoid upsell"', tone: 'plan' },
    { ts: '00:00.24', step: 'Ranked output',   detail: 'P1: £5 credit · P2: 10GB boost · P3: contract refresh', tone: 'act' },
    { ts: '00:00.31', step: 'Channel select',  detail: 'In-bot delivery · cap OK · consent OK', tone: 'act' },
    { ts: '00:00.38', step: 'Delivered',       detail: 'CSAT prediction 0.86 · audit logged', tone: 'verify' },
    { ts: '00:00.41', step: 'Resolved',        detail: 'p95 latency 41ms · explainable 94.2%', tone: 'resolve' },
  ];
  const suppression = [
    { label: 'Frequency cap',  value: 38, sub: '14.2k/d' },
    { label: 'Vulnerability',  value: 22, sub: '8.4k/d' },
    { label: 'Quiet hours',    value: 14, sub: '5.1k/d' },
    { label: 'Offer fatigue',  value: 11, sub: '4.2k/d' },
    { label: 'Margin floor',   value: 8,  sub: '3.0k/d' },
    { label: 'Consent',        value: 7,  sub: '2.6k/d' },
  ];
  const policies = [
    { name: 'No upsell on vulnerability flag', version: 'v3', edited: '2026-04-12', blocking: true },
    { name: 'Margin floor 28% on all SnowFlex offers', version: 'v2', edited: '2026-03-30', blocking: true },
    { name: 'Quiet hours 21:00–08:00 UK', version: 'v1', edited: '2025-12-04', blocking: true },
    { name: 'Frequency cap 3/wk per channel', version: 'v4', edited: '2026-04-22', blocking: true },
    { name: 'Bereavement → 12mo upsell suppression', version: 'v2', edited: '2026-02-08', blocking: true },
    { name: 'Offer parity within ±£2 of competitor', version: 'v1', edited: '2026-01-21', blocking: false },
    { name: 'Holdout 5% on all campaigns', version: 'v1', edited: '2025-11-04', blocking: true },
    { name: 'GDPR Art.22 human-override required for high-risk decisions', version: 'v3', edited: '2026-04-01', blocking: true },
  ];
  return (
    <PageShell>
      <PageHeader kicker="Digital · AI" title="Decisioning Brain" subtitle="Where every NBA comes from. Reasoning chain → eligibility → policy → ranked offer → executed channel — fully audit-trailed." badge={<DigitalMlBadge pageKey="decisioning" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> GDPR Art.22 · human-override available</span>
        <GoldChip tables={['gold.decision_lineage', 'gold.policy_registry', 'gold.offer_eligibility']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Decisions / hour" value="127k" delta="+12% WoW" tone="good" />
        <KpiTile label="Eligible / decided" value="92%" delta="model+rules" tone="good" />
        <KpiTile label="Suppressed" value="6.3%" delta="of eligible" tone="neutral" />
        <KpiTile label="P95 latency" value="41ms" delta="SLA 80ms" tone="good" />
        <KpiTile label="Override rate" value="0.8%" delta="human-in-loop" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Reasoning trace · live decision</CardTitle>
          <div className="space-y-1.5">
            {trace.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <span className="font-mono text-ink-muted shrink-0 w-[68px]">{t.ts}</span>
                <span className={cn(
                  'vf-chip text-[9px] uppercase font-bold w-[64px] justify-center',
                  t.tone === 'detect' ? 'bg-vfRed text-white'
                  : t.tone === 'observe' ? 'bg-amber/20 text-amber-800'
                  : t.tone === 'plan' ? 'bg-blue-100 text-blue-700'
                  : t.tone === 'act' ? 'bg-purple-100 text-purple-700'
                  : t.tone === 'verify' ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-mist text-ink-muted',
                )}>{t.step.split(' ')[0]}</span>
                <div className="min-w-0">
                  <div className="font-bold text-ink">{t.step}</div>
                  <div className="text-ink-muted">{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <CardTitle>Today's AI decisions · funnel</CardTitle>
            <Funnel stages={[
              { label: 'Requested',  value: 412000, tone: 'neutral' },
              { label: 'Eligible',   value: 388000, tone: 'good' },
              { label: 'Suppressed', value: 24000,  tone: 'warn' },
              { label: 'Served',     value: 364000, tone: 'good' },
              { label: 'Converted',  value: 29400,  tone: 'good' },
            ]} formatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
          </div>
          <div className="vf-card p-3">
            <CardTitle>Suppression reasons (24h, %)</CardTitle>
            <HBar data={suppression} color="#E11D48" />
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Policy library · {policies.filter(p => p.blocking).length} blocking · {policies.length} total</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Policy</th><th>Version</th><th>Last edited</th><th>Blocking</th></tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{p.name}</td>
                  <td className="text-center font-mono">{p.version}</td>
                  <td className="text-center font-mono">{p.edited}</td>
                  <td className="text-center"><StatusChip status={p.blocking ? 'live' : 'warn'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Voice of Customer
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalVoC() {
  const themes = [
    { name: '5G coverage Manchester', vol: 1840, delta: +28, sentiment: -0.42, tone: 'bad' },
    { name: 'Billing app crash',      vol: 1420, delta: +14, sentiment: -0.36, tone: 'bad' },
    { name: 'Roaming Pass clarity',   vol: 940,  delta: +6,  sentiment: -0.18, tone: 'warn' },
    { name: 'eSIM activation slow',   vol: 720,  delta: -8,  sentiment: -0.22, tone: 'warn' },
    { name: 'Customer service good',  vol: 680,  delta: +4,  sentiment: +0.62, tone: 'good' },
    { name: 'Disney+ bundle love',    vol: 540,  delta: +12, sentiment: +0.54, tone: 'good' },
    { name: 'PAC request slow',       vol: 380,  delta: +18, sentiment: -0.48, tone: 'bad' },
    { name: 'Network speed (general)',vol: 320,  delta: -4,  sentiment: -0.06, tone: 'neutral' },
  ];
  const heatRows = themes.slice(0, 6).map(t => t.name);
  const heatCols = ['W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'Now'];
  const heatData = heatRows.map((_, r) => heatCols.map((__, c) => Math.max(0, Math.min(1, 0.3 + (r * 0.06) + (Math.sin(r + c) * 0.18) + (c === 5 ? 0.12 : 0)))));
  const verbatims = [
    { src: 'iOS review', text: '"Network has been awful in M14 for two weeks. Snowtelco need to fix this or I am leaving."', sentiment: -0.78, theme: '5G coverage Manchester', ts: '12 min ago' },
    { src: 'Chat', text: '"App keeps crashing when I try to view my bill. Cleared cache, still bad."', sentiment: -0.52, theme: 'Billing app crash', ts: '24 min ago' },
    { src: 'Voice', text: '"Disney+ bundle is amazing value, the kids love it."', sentiment: +0.71, theme: 'Disney+ bundle love', ts: '38 min ago' },
    { src: 'Twitter', text: '"@snowtelco roaming pass saved me €40 in Spain — finally clear what I am paying."', sentiment: +0.62, theme: 'Roaming Pass clarity', ts: '52 min ago' },
    { src: 'Email feedback', text: '"PAC took 48 hours, missed my number-port window with new provider."', sentiment: -0.66, theme: 'PAC request slow', ts: '1h ago' },
  ];
  return (
    <PageShell>
      <PageHeader kicker="Digital · AI" title="Voice of Customer" subtitle="Verbatims from reviews, chat, voice, social and email — clustered by theme via Cortex AI_CLASSIFY + AI_SUMMARIZE." badge={<DigitalMlBadge pageKey="voc" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.review_corpus', 'gold.cc_chats', 'gold.ivr_calls', 'gold.social_mentions']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Verbatims / day" value="18.4k" delta="+12% WoW" tone="warn" />
        <KpiTile label="Theme drift alerts" value="3" delta="+1 today" tone="warn" />
        <KpiTile label="NPS detractor" value="14.2%" delta="+0.8pp" tone="bad" />
        <KpiTile label="Top theme" value="M14 5G" delta="vol +28%" tone="bad" />
        <KpiTile label="App-store score" value="4.6" delta="held" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Top themes · 7-day vs prior · sentiment</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Theme</th><th className="text-right">Volume</th><th className="text-right">Δ</th><th className="text-right">Sentiment</th></tr>
            </thead>
            <tbody>
              {themes.map((t) => (
                <tr key={t.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{t.name}</td>
                  <td className="text-right font-mono">{t.vol.toLocaleString()}</td>
                  <td className={cn('text-right font-mono', t.delta > 0 ? 'text-vfRed' : 'text-emerald-600')}>{t.delta > 0 ? '+' : ''}{t.delta}%</td>
                  <td className={cn('text-right font-mono', t.sentiment < -0.3 ? 'text-vfRed' : t.sentiment < 0 ? 'text-amber-700' : 'text-emerald-600')}>{t.sentiment.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <CardTitle>Source mix (24h)</CardTitle>
            <Donut data={[
              { label: 'App reviews', value: 32, color: '#29B5E8' },
              { label: 'Chat',        value: 28, color: '#F59E0B' },
              { label: 'Voice',       value: 18, color: '#11567F' },
              { label: 'Social',      value: 14, color: '#10B981' },
              { label: 'Email',       value: 8,  color: '#8B5CF6' },
            ]} />
          </div>
          <div className="vf-card p-3">
            <CardTitle>NPS detractor trend (30d)</CardTitle>
            <Sparkline data={[10.4, 10.8, 11.2, 11.6, 11.4, 12.0, 12.4, 12.8, 13.0, 13.2, 13.4, 13.6, 13.8, 14.0, 14.2]} color="#E11D48" />
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Sentiment heatmap · theme × week</CardTitle>
        <Heatmap rows={heatRows} cols={heatCols} data={heatData} formatter={(v) => `${Math.round(v * 100)}`} />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Verbatim feed (redacted, AI-classified)</CardTitle>
        <div className="space-y-2">
          {verbatims.map((v, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px]">
              <span className="vf-chip bg-mist text-ink-muted text-[9px] uppercase font-bold w-[80px] shrink-0 justify-center">{v.src}</span>
              <div className="flex-1 min-w-0">
                <div className="text-ink leading-snug">{v.text}</div>
                <div className="text-[10px] text-ink-muted mt-0.5 flex items-center gap-2">
                  <span>{v.ts}</span>
                  <span>·</span>
                  <span className="font-mono">theme: {v.theme}</span>
                  <span>·</span>
                  <span className={cn('font-mono', v.sentiment < 0 ? 'text-vfRed' : 'text-emerald-600')}>sent {v.sentiment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Experimentation
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalExperiments() {
  const tests = [
    { name: '5G Hero · creative A/B/C', owner: 'Marketing', ramp: 100, metric: '+6.4pp conv', p: 0.012, status: 'live', guard: 'ok' },
    { name: 'Roaming Pass · price £2.94 vs £3.20', owner: 'Pricing', ramp: 50, metric: '+0.8pp attach', p: 0.082, status: 'live', guard: 'ok' },
    { name: 'eSIM journey · QR-first vs activation-code', owner: 'Care', ramp: 100, metric: '+4.0pp completion', p: 0.004, status: 'live', guard: 'ok' },
    { name: 'Disney+ bundle · single vs ranked modal', owner: 'Marketplace', ramp: 100, metric: '+2.1pp attach', p: 0.018, status: 'live', guard: 'ok' },
    { name: 'Voice agent · empathy-first vs offer-first', owner: 'Care', ramp: 25, metric: '+1.2pp save', p: 0.21, status: 'live', guard: 'ok' },
    { name: 'Anniversary · gift vs credit', owner: 'Lifecycle', ramp: 50, metric: '+0.4pp accept', p: 0.34, status: 'live', guard: 'ok' },
    { name: 'Winback · £15 vs £10', owner: 'Lifecycle', ramp: 10, metric: '+2.4pp return', p: 0.05, status: 'live', guard: 'breach' },
    { name: 'Brand · "Network you trust" vs "5G unlocked"', owner: 'Brand', ramp: 100, metric: '+0.6pp recall', p: 0.04, status: 'done', guard: 'ok' },
  ];
  const conflictRows = ['5G Hero', 'Disney+ bundle', 'Roaming pricing', 'Voice empathy', 'Winback'];
  const conflictCols = ['5G Hero', 'Disney+ bundle', 'Roaming pricing', 'Voice empathy', 'Winback'];
  const conflictData = conflictRows.map((_, r) => conflictCols.map((__, c) => r === c ? 1 : Math.max(0, 0.4 + Math.sin(r * 2 + c) * 0.4)));
  return (
    <PageShell>
      <PageHeader kicker="Digital · AI" title="Experimentation Platform" subtitle="Live A/B and Bayesian tests, holdouts, ramp schedules, and guardrails — every campaign causally measured." badge={<DigitalMlBadge pageKey="experiments" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.experiment_assignments', 'gold.experiment_outcomes', 'gold.holdout_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Active tests" value="24" delta="+3 vs last wk" tone="good" />
        <KpiTile label="Completed YTD" value="184" delta="+22 QoQ" tone="good" />
        <KpiTile label="Avg ramp time" value="7d" delta="median" tone="neutral" />
        <KpiTile label="Win rate" value="28%" delta="vs control" tone="good" />
        <KpiTile label="Guardrail breach" value="1" delta="winback £15" tone="warn" />
      </div>
      <div className="vf-card p-3">
        <CardTitle>Live tests · ramp / metric / p-value / guardrails</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Test</th><th>Owner</th><th>Ramp</th><th>Primary delta</th><th>p-value</th><th>Status</th><th>Guard</th></tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{t.name}</td>
                  <td className="text-center text-ink-muted">{t.owner}</td>
                  <td className="text-center font-mono">{t.ramp}%</td>
                  <td className="text-center font-mono text-emerald-600">{t.metric}</td>
                  <td className={cn('text-center font-mono', t.p < 0.05 ? 'text-emerald-700 font-bold' : t.p < 0.1 ? 'text-amber-800' : 'text-ink-muted')}>{t.p.toFixed(3)}</td>
                  <td className="text-center"><StatusChip status={t.status as any} /></td>
                  <td className="text-center"><StatusChip status={t.guard as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Test conflict matrix · audience overlap</CardTitle>
          <Heatmap rows={conflictRows} cols={conflictCols} data={conflictData} formatter={(v) => `${Math.round(v * 100)}`} />
          <div className="text-[10px] text-ink-muted mt-2">Darker = more audience overlap. Mutual-exclusion required when overlap &gt; 60%.</div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Bayesian posterior · 5G Hero (current)</CardTitle>
          <LineChart series={[
            { name: 'Prior',     data: [0, 4, 12, 22, 34, 38, 32, 22, 14, 6, 1] },
            { name: 'Posterior', data: [0, 1, 4, 14, 38, 62, 48, 22, 8, 2, 0] },
          ]} colors={['#9CA3AF', '#11567F']} height={180} />
          <div className="text-[10px] text-ink-muted mt-2">P(uplift &gt; 0) = 98.8% · expected uplift +6.4pp · ROPE [-2pp,+2pp] excluded.</div>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Personalisation / MarTech Hub
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalMartech() {
  const partners = [
    { name: 'Adobe Experience Platform', sync: 'streaming', lagP95: '38s', match: '94%', status: 'ok' },
    { name: 'Salesforce Marketing Cloud', sync: '5-min batch', lagP95: '92s', match: '88%', status: 'warn' },
    { name: 'Sinch (SMS/RCS)',           sync: 'streaming', lagP95: '28s', match: '92%', status: 'ok' },
    { name: 'Braze',                      sync: 'streaming', lagP95: '52s', match: '86%', status: 'ok' },
    { name: 'TikTok Ads Manager',         sync: 'hourly',    lagP95: '14m', match: '74%', status: 'warn' },
    { name: 'Meta CAPI',                  sync: 'streaming', lagP95: '46s', match: '82%', status: 'ok' },
  ];
  const lag = [38, 42, 48, 56, 72, 92, 88, 64, 52, 46, 42, 40];
  const webhookEvents = [
    { ts: '14:08:22', dest: 'Salesforce MC', code: 504, msg: 'gateway timeout · retry queued', tone: 'warn' },
    { ts: '13:54:08', dest: 'TikTok Ads',    code: 401, msg: 'token refreshed · backfilled 412 events', tone: 'ok' },
    { ts: '13:18:11', dest: 'Sinch RCS',     code: 200, msg: '46k events · OK', tone: 'ok' },
    { ts: '12:42:33', dest: 'Adobe AEP',     code: 200, msg: '184k events · OK', tone: 'ok' },
    { ts: '11:21:04', dest: 'Braze',         code: 502, msg: 'auto-retried · success after 1 attempt', tone: 'ok' },
  ];
  return (
    <PageShell>
      <PageHeader kicker="Digital · AI" title="Personalisation Studio" subtitle="MarTech plumbing — identity graph, audience sync, webhook health, schema drift. Everything below the campaign card." badge={<DigitalMlBadge pageKey="martech" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.identity_graph', 'gold.audience_sync_log', 'gold.webhook_events']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Identity match-rate" value="88%" delta="+1.2pp WoW" tone="good" />
        <KpiTile label="Audience sync P95" value="92s" delta="SLA 5m" tone="good" />
        <KpiTile label="Touchpoints / day" value="6.4M" delta="+8% WoW" tone="good" />
        <KpiTile label="Failed deliveries" value="0.18%" delta="of 6.4M" tone="good" />
        <KpiTile label="Schema-drift alerts" value="2" delta="open" tone="warn" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Audience sync · destinations</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Destination</th><th>Mode</th><th>Lag (P95)</th><th>Match</th><th>Status</th></tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{p.name}</td>
                  <td className="text-center text-ink-muted font-mono">{p.sync}</td>
                  <td className="text-center font-mono">{p.lagP95}</td>
                  <td className="text-center font-mono">{p.match}</td>
                  <td className="text-center"><StatusChip status={p.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <CardTitle>Identity graph composition</CardTitle>
            <Donut data={[
              { label: 'Deterministic', value: 64, color: '#10B981' },
              { label: 'Probabilistic', value: 22, color: '#F59E0B' },
              { label: 'Household stitch', value: 9, color: '#11567F' },
              { label: 'Device-only',   value: 5, color: '#9CA3AF' },
            ]} />
          </div>
          <div className="vf-card p-3">
            <CardTitle>Salesforce MC sync lag · last 12h (s)</CardTitle>
            <LineChart series={[{ name: 'lag (s)', data: lag }]} colors={['#E11D48']} height={120} />
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Webhook ledger · last 24h</CardTitle>
        <div className="space-y-1.5 text-[12px]">
          {webhookEvents.map((e, i) => (
            <div key={i} className="flex items-center gap-2 border-b border-mist-dark/60 pb-1">
              <span className="font-mono text-ink-muted w-[68px] shrink-0">{e.ts}</span>
              <span className="vf-chip bg-mist text-ink-muted text-[9px] w-[140px] shrink-0 justify-center">{e.dest}</span>
              <span className={cn('font-mono shrink-0 w-[40px] text-center font-bold', e.code >= 500 ? 'text-vfRed' : e.code >= 400 ? 'text-amber-700' : 'text-emerald-600')}>{e.code}</span>
              <span className="text-ink">{e.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Pricing & Offer Intelligence
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalPricing() {
  const tariffs = [
    { name: 'SnowFlex 30GB',         price: 20, attach: 18, elasticity: -1.32, comp: 22, status: 'live' },
    { name: '5G Unlimited Max',      price: 42, attach: 12, elasticity: -0.92, comp: 45, status: 'live' },
    { name: 'Family 4-line',         price: 84, attach: 6,  elasticity: -1.18, comp: 88, status: 'live' },
    { name: 'Roaming Pass EU/day',   price: 2.94, attach: 22, elasticity: -1.46, comp: 3.20, status: 'live' },
    { name: 'PAYG bundle 10GB',      price: 12, attach: 8,  elasticity: -1.62, comp: 12, status: 'paused' },
    { name: 'B2B SoHo line',         price: 24, attach: 4,  elasticity: -0.71, comp: 26, status: 'live' },
  ];
  const elastCurve = (slope: number) => Array.from({ length: 11 }, (_, i) => Math.max(0, 100 + slope * i * 5));
  const wtp = [
    { label: '£0–10/mo',  value: 12, color: '#9CA3AF' },
    { label: '£10–20/mo', value: 32, color: '#29B5E8' },
    { label: '£20–35/mo', value: 28, color: '#10B981' },
    { label: '£35–50/mo', value: 18, color: '#F59E0B' },
    { label: '£50+',      value: 10, color: '#11567F' },
  ];
  return (
    <PageShell>
      <PageHeader kicker="Digital · AI" title="Pricing & Offer Intelligence" subtitle="Tariff elasticity, willingness-to-pay segments, A/B price tests and competitor parity — margin floor enforced." badge={<DigitalMlBadge pageKey="pricing" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.tariff_elasticity', 'gold.competitor_ads', 'gold.price_test_register']} />
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> Margin floor 28% enforced</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Tariffs live" value="24" delta="2 paused" tone="good" />
        <KpiTile label="Elasticity (median)" value="−1.18" delta="ε > 1 = elastic" tone="warn" />
        <KpiTile label="Margin floor breaches" value="0" delta="all-time" tone="good" />
        <KpiTile label="Active price A/Bs" value="6" delta="+1 this wk" tone="good" />
        <KpiTile label="Competitor delta" value="−£1.20" delta="avg cheaper" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Tariff portfolio</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Tariff</th><th>Price</th><th>Attach</th><th>ε</th><th>Competitor</th><th>Status</th></tr>
            </thead>
            <tbody>
              {tariffs.map((t) => (
                <tr key={t.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{t.name}</td>
                  <td className="text-center font-mono">£{t.price.toFixed(t.price < 10 ? 2 : 0)}</td>
                  <td className="text-center font-mono">{t.attach}%</td>
                  <td className={cn('text-center font-mono', t.elasticity < -1.3 ? 'text-vfRed' : t.elasticity < -1 ? 'text-amber-700' : 'text-emerald-600')}>{t.elasticity.toFixed(2)}</td>
                  <td className="text-center font-mono text-ink-muted">£{t.comp.toFixed(t.comp < 10 ? 2 : 0)}</td>
                  <td className="text-center"><StatusChip status={t.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <CardTitle>Willingness-to-pay segments</CardTitle>
            <Donut data={wtp} />
          </div>
          <div className="vf-card p-3">
            <CardTitle>Elasticity curve · SnowFlex 30GB</CardTitle>
            <LineChart series={[{ name: 'attach', data: elastCurve(-1.32) }]} colors={['#11567F']} height={120} />
            <div className="text-[10px] text-ink-muted mt-1">x = price step (£1) · y = forecast attach %</div>
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Active price A/Bs · leaderboard</CardTitle>
        <HBar data={[
          { label: 'SnowFlex 30GB · £18 vs £20', value: 4.2, sub: 'p=0.006 · winner £18' },
          { label: 'Roaming Pass · £2.94 vs £3.20', value: 0.8, sub: 'p=0.18 · ongoing' },
          { label: '5G Unlimited Max · £42 vs £40', value: 1.6, sub: 'p=0.04 · winner £42' },
          { label: 'Family 4-line · £84 vs £80', value: 0.4, sub: 'p=0.31 · ongoing' },
          { label: 'Disney+ attach · £8.99 vs £7.99', value: 2.4, sub: 'p=0.02 · winner £8.99' },
        ]} color="#10B981" formatter={(v) => `+${v.toFixed(1)}pp`} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Self-Service Hub
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalSelfService() {
  const unanswered = [
    { q: '"esim transfer iPhone 15 to 16"', count: 612, age: '24h', tone: 'bad' },
    { q: '"Disney+ login on smart TV not working"', count: 384, age: '3d', tone: 'warn' },
    { q: '"PAC code request weekend"', count: 278, age: '6d', tone: 'warn' },
    { q: '"how to pause data abroad"', count: 184, age: '12h', tone: 'warn' },
    { q: '"wifi calling android setup"', count: 142, age: '4d', tone: 'neutral' },
    { q: '"family bill split"', count: 92, age: '2d', tone: 'neutral' },
  ];
  const heatRows = ['Bill query', 'Roaming', 'eSIM activation', 'Plan upgrade', 'Cancel/port', 'Tech support'];
  const heatCols = ['IVR', 'WebChat', 'App Help', 'KB'];
  const heatData = heatRows.map((_, r) => heatCols.map((__, c) => Math.max(0, Math.min(1, 0.3 + (c * 0.12) + Math.sin(r + c) * 0.2))));
  return (
    <PageShell>
      <PageHeader kicker="Digital · Trust & Ops" title="Self-Service Hub" subtitle="One view of IVR, WebChat, App Help and Knowledge Base — containment, hit-rate, escalation reasons." badge={<DigitalMlBadge pageKey="selfservice" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.kb_hits', 'gold.ivr_calls', 'gold.cc_chats']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Containment" value="64%" delta="+9pp WoW" tone="good" />
        <KpiTile label="IVR self-serve" value="41%" delta="+4pp" tone="good" />
        <KpiTile label="Web help" value="72%" delta="+6pp" tone="good" />
        <KpiTile label="KB articles" value="1,840" delta="+24 this wk" tone="good" />
        <KpiTile label="Top unanswered" value="esim transfer" delta="612 hits / 24h" tone="warn" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Containment funnel · all channels (24h)</CardTitle>
          <Funnel stages={[
            { label: 'Intent expressed', value: 184000, tone: 'neutral' },
            { label: 'KB / FAQ search',  value: 142000, tone: 'good' },
            { label: 'Answer surfaced',  value: 122000, tone: 'good' },
            { label: 'Resolved (no agent)', value: 117760, tone: 'good' },
            { label: 'Escalated to agent',  value: 24400,  tone: 'warn' },
          ]} formatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>KB hit-rate heatmap · intent × channel</CardTitle>
          <Heatmap rows={heatRows} cols={heatCols} data={heatData} formatter={(v) => `${Math.round(v * 100)}`} />
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Top unanswered questions · Cortex Search gaps</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr><th className="text-left py-1.5">Query</th><th>Hits 24h</th><th>Oldest</th><th>Action</th></tr>
          </thead>
          <tbody>
            {unanswered.map((u) => (
              <tr key={u.q} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-bold text-ink font-mono">{u.q}</td>
                <td className="text-center font-mono">{u.count.toLocaleString()}</td>
                <td className="text-center font-mono text-ink-muted">{u.age}</td>
                <td className="text-center"><span className="vf-chip bg-vfRed-soft text-vfRed-dark text-[9px] uppercase font-bold">draft KB</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Privacy & Consent
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalPrivacy() {
  const consent = [73, 73, 72, 72, 71, 71, 71, 71];
  const dsar = [
    { case: 'DSAR-2026-08412', age: '0.4d', status: 'in_progress', owner: 'DPO team', priority: 'normal' },
    { case: 'DSAR-2026-08406', age: '1.2d', status: 'in_progress', owner: 'DPO team', priority: 'normal' },
    { case: 'DSAR-2026-08389', age: '2.8d', status: 'pending evidence', owner: 'Legal', priority: 'high' },
    { case: 'DSAR-2026-08374', age: '4.6d', status: 'pending evidence', owner: 'DPO team', priority: 'high' },
    { case: 'DSAR-2026-08361', age: '6.1d', status: 'pending evidence', owner: 'Legal', priority: 'breach risk' },
  ];
  const suppression = [
    { label: 'Marketing opt-out',   value: 32, sub: '5.4k/d' },
    { label: 'Vulnerability flag',  value: 22, sub: '3.7k/d' },
    { label: 'Frequency cap',       value: 18, sub: '3.0k/d' },
    { label: 'Quiet hours',         value: 14, sub: '2.4k/d' },
    { label: 'Special category',    value: 8,  sub: '1.4k/d' },
    { label: 'Bereavement (12mo)',  value: 6,  sub: '1.0k/d' },
  ];
  return (
    <PageShell>
      <PageHeader kicker="Digital · Trust & Ops" title="Privacy & Consent Centre" subtitle="ICO/Ofcom posture, consent drift, DSAR queue and the vulnerability register — every suppression auditable." badge={<DigitalMlBadge pageKey="privacy" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> ICO · Ofcom GC C5 · GDPR Art.6/7/9/22</span>
        <GoldChip tables={['gold.consent_register', 'gold.dsar_register', 'gold.vulnerability_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Consent rate" value="71%" delta="−1pp 4w" tone="warn" />
        <KpiTile label="Opt-outs (24h)" value="1,420" delta="vs base 1,180" tone="warn" />
        <KpiTile label="DSAR queue" value="18" delta="avg age 3.2d" tone="warn" />
        <KpiTile label="ICO breaches" value="0" delta="all-time" tone="good" />
        <KpiTile label="Vulnerability flags" value="2,440" delta="active" tone="neutral" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>DSAR queue · open cases</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Case</th><th>Age</th><th>Status</th><th>Owner</th><th>Priority</th></tr>
            </thead>
            <tbody>
              {dsar.map((d) => (
                <tr key={d.case} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink font-mono">{d.case}</td>
                  <td className="text-center font-mono">{d.age}</td>
                  <td className="text-center text-ink-muted">{d.status}</td>
                  <td className="text-center text-ink-muted">{d.owner}</td>
                  <td className={cn('text-center font-bold', d.priority === 'breach risk' ? 'text-vfRed' : d.priority === 'high' ? 'text-amber-700' : 'text-ink-muted')}>{d.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <CardTitle>Consent rate · 8-week trend</CardTitle>
            <LineChart series={[{ name: 'consent %', data: consent }]} colors={['#11567F']} height={140} />
            <div className="text-[10px] text-ink-muted mt-1">−2pp drift over 8w · investigate "Marketing opt-out" growth.</div>
          </div>
          <div className="vf-card p-3">
            <CardTitle>Suppression reasons (24h)</CardTitle>
            <HBar data={suppression} color="#E11D48" />
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Vulnerability register · active flags by type</CardTitle>
        <Donut data={[
          { label: 'Financial difficulty', value: 32, color: '#E11D48' },
          { label: 'Bereavement (12mo)',   value: 18, color: '#F59E0B' },
          { label: 'Health (mental)',      value: 14, color: '#11567F' },
          { label: 'Health (physical)',    value: 12, color: '#29B5E8' },
          { label: 'Cognitive',            value: 10, color: '#8B5CF6' },
          { label: 'Domestic abuse',       value: 8,  color: '#10B981' },
          { label: 'Other',                value: 6,  color: '#9CA3AF' },
        ]} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Forecasting & Capacity
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalForecast() {
  const forecast = Array.from({ length: 14 }, (_, i) => 4400 + Math.sin(i * 0.6) * 800 + (i > 9 ? 600 : 0));
  const actual = forecast.slice(0, 7).map((y) => y + (Math.random() - 0.4) * 280);
  const surgeRows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const surgeCols = ['00', '04', '08', '12', '16', '20'];
  const surgeData = surgeRows.map((_, r) => surgeCols.map((__, c) => Math.max(0, Math.min(1, 0.18 + (c >= 2 && c <= 4 ? 0.5 : 0.1) + (r === 4 || r === 5 ? 0.18 : 0) + Math.sin(r + c) * 0.1))));
  const drivers = [
    { label: 'Baseline',         value: 4400, tone: 'total' as const },
    { label: '5G Hero campaign', value: 1200, tone: 'pos' as const },
    { label: 'NOC M14 incident', value: 800,  tone: 'pos' as const },
    { label: 'Seasonality',      value: -400, tone: 'neg' as const },
    { label: 'Forecast',         value: 6000, tone: 'total' as const },
  ];
  return (
    <PageShell>
      <PageHeader kicker="Digital · Trust & Ops" title="Forecasting & Capacity" subtitle="14-day chat/voice/email forecast vs WFM staffing — surge probability, driver attribution, P95 wait." badge={<DigitalMlBadge pageKey="forecast" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.cc_chats', 'gold.ivr_calls', 'gold.wfm_roster']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Forecast horizon" value="14d" delta="hourly grain" tone="neutral" />
        <KpiTile label="MAPE (last 30d)" value="6.4%" delta="target ≤8%" tone="good" />
        <KpiTile label="Surge prob today" value="12%" delta="3-4pm window" tone="warn" />
        <KpiTile label="WFM gap" value="+18 FTE" delta="needed Mon-Fri 12-17" tone="warn" />
        <KpiTile label="P95 wait now" value="1:42" delta="SLA 2:00" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Volume forecast vs actuals · daily</CardTitle>
          <LineChart series={[
            { name: 'Forecast', data: forecast },
            { name: 'Actual',   data: actual },
          ]} colors={['#11567F', '#E11D48']} height={200} />
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>Surge probability · hour × day-of-week</CardTitle>
          <Heatmap rows={surgeRows} cols={surgeCols} data={surgeData} formatter={(v) => `${Math.round(v * 100)}`} />
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>Forecast driver attribution · today vs yesterday (chats)</CardTitle>
        <Waterfall items={drivers} formatter={(v) => `${(v / 1000).toFixed(1)}k`} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Identity Trust
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalIdentity() {
  const successTrend = Array.from({ length: 24 }, (_, i) => 99.30 + Math.sin(i * 0.7) * 0.18 + (i === 14 ? -0.12 : 0));
  const swaps = [
    { ts: '14:18:42', acct: 'CUST-9824', risk: 0.94, geo: 'Coventry → Lisbon', mfa: 'biometric+SMS', outcome: 'BLOCKED', tone: 'breach' as const },
    { ts: '13:42:18', acct: 'CUST-7421', risk: 0.71, geo: 'London → Manchester', mfa: 'TOTP', outcome: 'STEP-UP', tone: 'warn' as const },
    { ts: '13:08:55', acct: 'CUST-3140', risk: 0.62, geo: 'Birmingham (impossible travel)', mfa: 'biometric', outcome: 'STEP-UP', tone: 'warn' as const },
    { ts: '12:54:11', acct: 'CUST-1042', risk: 0.34, geo: 'Glasgow', mfa: 'push', outcome: 'ALLOWED', tone: 'ok' as const },
    { ts: '12:18:02', acct: 'CUST-5612', risk: 0.88, geo: 'Leeds → Bucharest', mfa: '—', outcome: 'BLOCKED', tone: 'breach' as const },
  ];
  const heatRows = ['UK', 'EU', 'NA', 'Other'];
  const heatCols = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
  const heatData = heatRows.map((_, r) => heatCols.map((__, c) => Math.max(0, Math.min(1, 0.04 + (r === 0 ? 0.4 : 0.08) + Math.sin(r + c) * 0.1 + (c === 4 ? 0.18 : 0)))));
  return (
    <PageShell>
      <PageHeader kicker="Digital · Trust & Ops" title="Identity & Login Trust" subtitle="Login success, MFA adoption, SIM-swap detection, account-takeover risk — every digital channel." badge={<DigitalMlBadge pageKey="identity" />} />
      <div className="flex flex-wrap gap-2 items-center">
        <GoldChip tables={['gold.login_events', 'gold.sim_swap_register', 'gold.mfa_register']} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Login success" value="99.42%" delta="−0.04pp" tone="good" />
        <KpiTile label="MFA adoption" value="81%" delta="+2pp WoW" tone="good" />
        <KpiTile label="Biometric usage" value="64%" delta="+8pp QoQ" tone="good" />
        <KpiTile label="SIM-swap flags (24h)" value="12" delta="2 blocked" tone="warn" />
        <KpiTile label="ATO blocked (24h)" value="184" delta="0 successful" tone="good" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>Login success · last 24h (%)</CardTitle>
          <LineChart series={[{ name: 'success %', data: successTrend }]} colors={['#11567F']} height={180} />
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <CardTitle>MFA method mix</CardTitle>
            <Donut data={[
              { label: 'Biometric (FIDO2)', value: 64, color: '#10B981' },
              { label: 'Push',              value: 18, color: '#11567F' },
              { label: 'TOTP',              value: 12, color: '#F59E0B' },
              { label: 'SMS',               value: 6,  color: '#9CA3AF' },
            ]} />
          </div>
          <div className="vf-card p-3">
            <CardTitle>Geo-velocity heatmap · region × hour</CardTitle>
            <Heatmap rows={heatRows} cols={heatCols} data={heatData} formatter={(v) => `${Math.round(v * 100)}`} />
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <CardTitle>SIM-swap & ATO feed (last 24h)</CardTitle>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr><th className="text-left py-1.5">Time</th><th>Account</th><th>Risk</th><th>Geo / signal</th><th>MFA</th><th>Outcome</th></tr>
          </thead>
          <tbody>
            {swaps.map((s) => (
              <tr key={s.ts} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-mono text-ink-muted">{s.ts}</td>
                <td className="text-center font-mono">{s.acct}</td>
                <td className={cn('text-center font-mono font-bold', s.risk > 0.8 ? 'text-vfRed' : s.risk > 0.5 ? 'text-amber-700' : 'text-emerald-600')}>{s.risk.toFixed(2)}</td>
                <td className="text-center text-ink-muted">{s.geo}</td>
                <td className="text-center text-ink-muted">{s.mfa}</td>
                <td className="text-center"><StatusChip status={s.tone === 'ok' ? 'ok' : s.tone === 'warn' ? 'warn' : 'breach'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
