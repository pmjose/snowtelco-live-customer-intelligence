import { Brain, Sparkles } from 'lucide-react';
import { mlByDigitalPage, type ModelMeta } from '@/data/mlMeta';
import { LineChart, Donut, Funnel, Sparkline, Heatmap, Scatter, Gauge, Waterfall } from '@/components/shared/Charts';
import { cn } from '@/lib/utils';

// ─── Shared header MlBadge for Digital pages ─────────────────────────────────
export function DigitalMlBadge({ pageKey, accent = 'red' }: { pageKey: string; accent?: 'red' | 'blue' | 'amber' }) {
  const meta = mlByDigitalPage[pageKey];
  if (!meta) return null;
  return <MlBadge meta={meta} accent={accent} />;
}

export function MlBadge({ meta, accent = 'red' }: { meta: ModelMeta; accent?: 'red' | 'blue' | 'amber' }) {
  const ring = accent === 'blue' ? 'border-blue-300 bg-blue-50/80'
              : accent === 'amber' ? 'border-amber/40 bg-amber/10'
              : 'border-vfRed/30 bg-vfRed-soft/40';
  const text = accent === 'blue' ? 'text-blue-700'
              : accent === 'amber' ? 'text-amber-800'
              : 'text-vfRed-dark';
  const driftTone = meta.drift === 'OK' ? 'text-emerald-700' : meta.drift === 'Warning' ? 'text-amber-800' : 'text-vfRed';
  return (
    <div className={cn('rounded-lg border px-2.5 py-1.5 flex items-center gap-2 min-w-0', ring)}>
      <Brain className={cn('w-3.5 h-3.5 shrink-0', text)} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-bold leading-tight truncate">
          <span className={text}>{meta.scoreLabel}: </span>
          <span className="text-ink font-mono">{meta.scoreValue}</span>
          <span className="text-ink-muted font-normal"> · CI {meta.ci}</span>
        </div>
        <div className="text-[10px] text-ink-muted leading-tight font-mono truncate">
          {meta.name}{meta.auc > 0 ? ` · AUC ${meta.auc.toFixed(2)}` : ''} · drift <span className={driftTone}>{meta.drift}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Live ML decisions counter (Overview) ────────────────────────────────────
export function MlDecisionsCounter() {
  const trend = [88, 92, 96, 102, 108, 114, 121, 127];
  return (
    <div className="vf-card p-3 min-w-[260px]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-vfRed" /> ML decisions / hour</div>
        <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px]">drift OK</span>
      </div>
      <div className="text-2xl font-extrabold text-ink font-mono tabular-nums">127,420</div>
      <div className="text-[10px] text-ink-muted leading-snug">94.2% explainable · audit <span className="font-mono break-all">gold.decision_lineage</span></div>
      <div className="-mx-1 mt-1"><Sparkline data={trend} color="#11567F" height={28} /></div>
    </div>
  );
}

// ─── Channel mix donut (Overview) ────────────────────────────────────────────
export function ChannelMixDonut() {
  return (
    <Donut data={[
      { label: 'App push', value: 38, color: '#29B5E8' },
      { label: 'Email',    value: 28, color: '#F59E0B' },
      { label: 'SMS',      value: 18, color: '#11567F' },
      { label: 'RCS',      value: 9,  color: '#10B981' },
      { label: 'Voice',    value: 4,  color: '#8B5CF6' },
      { label: 'WhatsApp', value: 3,  color: '#EC4899' },
    ]} title="Channel mix" />
  );
}

// ─── Intent x stage heatmap (Overview) ───────────────────────────────────────
export function IntentStageHeatmap() {
  const intents = ['Service quality', 'Bill query', 'Roaming', 'Plan upgrade', 'Cancel / port', 'Tech support'];
  const stages = ['Greet', 'Verify', 'Diagnose', 'Resolve', 'Wrap'];
  // Synthetic but believable heat distribution.
  const data = [
    [0.18, 0.32, 0.62, 0.84, 0.42],
    [0.22, 0.34, 0.46, 0.78, 0.36],
    [0.14, 0.26, 0.52, 0.72, 0.31],
    [0.10, 0.24, 0.36, 0.66, 0.42],
    [0.36, 0.42, 0.58, 0.71, 0.62],
    [0.26, 0.38, 0.48, 0.74, 0.41],
  ];
  return <Heatmap rows={intents} cols={stages} data={data} />;
}

// ─── Conversational: deflection gauge ────────────────────────────────────────
export function DeflectionGauge({ value = 68 }: { value?: number }) {
  return <Gauge value={value} target={70} label="target 70%" />;
}

// ─── Conversational: intent distribution donut ───────────────────────────────
export function IntentDonut() {
  return (
    <Donut data={[
      { label: 'Service quality', value: 22, color: '#29B5E8' },
      { label: 'Bill query',      value: 18, color: '#F59E0B' },
      { label: 'Roaming',         value: 14, color: '#11567F' },
      { label: 'Plan upgrade',    value: 11, color: '#10B981' },
      { label: 'Cancel / port',   value: 8,  color: '#E11D48' },
      { label: 'Tech support',    value: 16, color: '#8B5CF6' },
      { label: 'Other',           value: 11, color: '#9CA3AF' },
    ]} title="Intents (last 60m)" />
  );
}

// ─── Conversational: bot vs human escalations over 60 min ────────────────────
export function ConversationalSentimentLine() {
  const labels = ['T-60', 'T-50', 'T-40', 'T-30', 'T-20', 'T-10', 'now'];
  return (
    <LineChart
      labels={labels}
      series={[
        { name: 'Bot resolved',    data: [42, 48, 56, 64, 71, 78, 84] },
        { name: 'Human escalated', data: [22, 21, 19, 17, 16, 14, 13] },
      ]}
    />
  );
}

// ─── Voice: AHT histogram ────────────────────────────────────────────────────
export function VoiceAhtHistogram() {
  return (
    <Funnel stages={[
      { label: '< 0:30 (deflected)', value: 14, tone: 'good' },
      { label: '0:30 – 1:00',         value: 38, tone: 'good' },
      { label: '1:00 – 2:00',         value: 28 },
      { label: '2:00 – 4:00',         value: 14 },
      { label: '4:00 – 8:00',         value: 5,  tone: 'warn' },
      { label: '> 8:00',              value: 1,  tone: 'bad' },
    ]} formatter={(v) => `${v}%`} />
  );
}

// ─── Voice: save-rate funnel by queue ────────────────────────────────────────
export function VoiceSaveFunnel() {
  return (
    <Funnel stages={[
      { label: 'Inbound (all)',       value: 14600, tone: 'good' },
      { label: 'SAVE-MNP queue',      value: 1840,  tone: 'good' },
      { label: 'NBA accepted',        value: 1306,  tone: 'good' },
      { label: 'Save complete',       value: 928,   tone: 'good' },
      { label: 'CSAT > 0.8 (post)',   value: 824,   tone: 'good' },
    ]} formatter={(v) => v.toLocaleString()} />
  );
}

// ─── Voice: WER + sentiment recovery trend ───────────────────────────────────
export function VoiceWerTrend() {
  const labels = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'];
  return (
    <LineChart
      labels={labels}
      series={[
        { name: 'WER %',              data: [3.1, 3.2, 3.3, 3.6, 3.8, 3.5, 3.4, 3.4] },
        { name: 'Sentiment recovery', data: [62,  64,  66,  68,  72,  74,  76,  78] },
      ]}
    />
  );
}

// ─── Journeys: cohort drop-off heatmap ───────────────────────────────────────
export function JourneyDropoffHeatmap() {
  const journeys = ['eSIM activation', 'Roaming Pass', 'Plan upgrade', 'Data boost', 'Add a line', 'Device upgrade', 'Biometric set-up', 'PAC request'];
  const stages = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];
  const data = [
    [0.08, 0.04, 0.01, 0.0,  0.0 ],
    [0.04, 0.02, 0.02, 0.0,  0.0 ],
    [0.18, 0.12, 0.10, 0.06, 0.04],
    [0.04, 0.0,  0.0,  0.0,  0.0 ],
    [0.22, 0.18, 0.14, 0.12, 0.10],
    [0.20, 0.16, 0.14, 0.10, 0.08],
    [0.10, 0.06, 0.06, 0.0,  0.0 ],
    [0.01, 0.0,  0.0,  0.0,  0.0 ],
  ];
  return <Heatmap rows={journeys} cols={stages} data={data} formatter={(v) => `${Math.round(v * 100)}%`} />;
}

// ─── Journeys: drop-off recovery 14d ─────────────────────────────────────────
export function JourneyRecoveryLine() {
  const labels = ['D-13','D-12','D-11','D-10','D-9','D-8','D-7','D-6','D-5','D-4','D-3','D-2','D-1','today'];
  return (
    <LineChart
      labels={labels}
      series={[
        { name: 'Abandoned',  data: [820, 760, 740, 690, 760, 720, 700, 680, 720, 660, 640, 620, 610, 580] },
        { name: 'Recovered',  data: [240, 230, 240, 250, 280, 260, 270, 260, 290, 280, 290, 300, 300, 310] },
      ]}
    />
  );
}

// ─── Channels: ROI scatter ───────────────────────────────────────────────────
export function ChannelRoiScatter() {
  return (
    <Scatter
      xLabel="Cost / send (£)"
      yLabel="Conversion %"
      xMax={1.0}
      yMax={50}
      data={[
        { x: 0.001, y: 18,  size: 60, color: '#F59E0B', label: 'Email' },
        { x: 0.0,   y: 28,  size: 60, color: '#29B5E8', label: 'App push' },
        { x: 0.04,  y: 22,  size: 50, color: '#11567F', label: 'SMS' },
        { x: 0.02,  y: 32,  size: 30, color: '#10B981', label: 'RCS' },
        { x: 0.85,  y: 44,  size: 16, color: '#8B5CF6', label: 'Voice' },
        { x: 0.05,  y: 12,  size: 24, color: '#EC4899', label: 'WhatsApp' },
      ]}
    />
  );
}

// ─── Channels: cost waterfall ────────────────────────────────────────────────
export function ChannelCostWaterfall() {
  return (
    <Waterfall
      items={[
        { label: 'Email',    value: 240,  tone: 'pos' },
        { label: 'SMS',      value: 720,  tone: 'pos' },
        { label: 'App push', value: 0,    tone: 'pos' },
        { label: 'RCS',      value: 360,  tone: 'pos' },
        { label: 'Voice',    value: 1280, tone: 'pos' },
        { label: 'WhatsApp', value: 180,  tone: 'pos' },
        { label: 'Total / wk', value: 2780, tone: 'total' },
      ]}
      formatter={(v) => `£${v}`}
    />
  );
}

// ─── Marketplace: bundle attach trend ────────────────────────────────────────
export function BundleAttachTrend() {
  const labels = ['W-11','W-10','W-9','W-8','W-7','W-6','W-5','W-4','W-3','W-2','W-1','now'];
  return (
    <LineChart
      labels={labels}
      series={[
        { name: 'Disney+',     data: [1280, 1320, 1390, 1420, 1490, 1540, 1620, 1710, 1820, 1960, 2080, 2180] },
        { name: 'Netflix',     data: [820,  860,  900,  940,  990,  1040, 1090, 1140, 1190, 1240, 1290, 1340] },
        { name: 'Spotify',     data: [620,  660,  680,  710,  740,  780,  820,  860,  900,  940,  980,  1020] },
        { name: 'YouTube Pre.',data: [220,  240,  260,  280,  300,  320,  340,  360,  380,  400,  420,  440] },
      ]}
    />
  );
}

// ─── Marketplace: cumulative ARPU lift 90d ───────────────────────────────────
export function CumulativeArpuLine() {
  const labels = ['D-90','D-75','D-60','D-45','D-30','D-15','today'];
  return (
    <LineChart
      labels={labels}
      series={[{ name: 'ARPU lift £/mo', data: [12, 28, 48, 72, 94, 124, 148] }]}
    />
  );
}

// ─── Marketplace: partner contribution donut ─────────────────────────────────
export function PartnerContributionDonut() {
  return (
    <Donut data={[
      { label: 'Disney+', value: 24, color: '#29B5E8' },
      { label: 'Netflix', value: 21, color: '#F59E0B' },
      { label: 'Spotify', value: 18, color: '#11567F' },
      { label: 'YouTube Premium', value: 12, color: '#10B981' },
      { label: 'Apple TV+', value: 10, color: '#8B5CF6' },
      { label: 'Norton', value: 9,  color: '#EC4899' },
      { label: 'Other',  value: 6,  color: '#9CA3AF' },
    ]} title="Revenue share" />
  );
}

// ─── Marketing hub: cumulative spend vs revenue ──────────────────────────────
export function HubSpendRevenueLine() {
  const labels = ['D-30','D-25','D-20','D-15','D-10','D-5','today'];
  return (
    <LineChart
      labels={labels}
      series={[
        { name: 'Spend (£k)',   data: [42, 86, 120, 158, 192, 218, 244] },
        { name: 'Revenue (£k)', data: [62, 142, 220, 312, 410, 502, 598] },
      ]}
    />
  );
}

// ─── Funnel: ROAS scatter ────────────────────────────────────────────────────
export function FunnelRoasScatter() {
  return (
    <Scatter
      xLabel="Spend (£k)"
      yLabel="ROAS (x)"
      xMax={300}
      yMax={9}
      data={[
        { x: 240, y: 0.7, size: 80, color: '#E11D48', label: 'Paid social' },
        { x: 130, y: 1.4, size: 60, color: '#F59E0B', label: 'Search' },
        { x: 80,  y: 4.2, size: 50, color: '#10B981', label: 'Retargeting' },
        { x: 60,  y: 5.6, size: 40, color: '#11567F', label: 'RCS' },
        { x: 40,  y: 6.8, size: 30, color: '#29B5E8', label: 'Email' },
        { x: 50,  y: 8.4, size: 24, color: '#8B5CF6', label: 'Refer-a-friend' },
      ]}
    />
  );
}

// ─── Audience: lookalike scatter ─────────────────────────────────────────────
export function LookalikeScatter() {
  // 80 candidate dots + 20 seed dots, distributed in two clusters near (60, 60)
  const candidates = Array.from({ length: 80 }, (_, i) => ({
    x: 30 + Math.random() * 60,
    y: 30 + Math.random() * 60,
    size: 6,
    color: '#9CA3AF',
    label: `cand ${i}`,
  }));
  const seeds = Array.from({ length: 20 }, (_, i) => ({
    x: 56 + (Math.random() - 0.5) * 14,
    y: 60 + (Math.random() - 0.5) * 14,
    size: 10,
    color: '#E11D48',
    label: `seed ${i}`,
  }));
  return (
    <Scatter
      xLabel="Embedding axis 1"
      yLabel="Embedding axis 2"
      xMax={100}
      yMax={100}
      data={[...candidates, ...seeds]}
    />
  );
}

// ─── Audience: suppression donut ─────────────────────────────────────────────
export function SuppressionDonut() {
  return (
    <Donut data={[
      { label: 'Net reachable',    value: 62, color: '#10B981' },
      { label: 'Open complaint',   value: 14, color: '#F59E0B' },
      { label: 'Offer fatigue',    value: 12, color: '#11567F' },
      { label: 'Frequency cap',    value: 7,  color: '#8B5CF6' },
      { label: 'Vulnerability',    value: 3,  color: '#E11D48' },
      { label: 'Quiet hours',      value: 2,  color: '#9CA3AF' },
    ]} title="Suppression mix" />
  );
}

// ─── Lifecycle: trigger heatmap ──────────────────────────────────────────────
export function TriggerHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const triggers = ['Onboarding D0', 'Onboarding D7', 'Onboarding D30', 'Anniversary', 'Lapse', 'Winback', 'Birthday', 'RFAF'];
  // Each row is a trigger, each col is a day; intensity = fires/day
  const data = triggers.map((_, ti) =>
    days.map((__, di) => {
      const base = 0.2 + (ti * 0.06) + (di === 0 || di === 6 ? -0.06 : 0);
      return Math.min(1, base + (Math.sin(ti + di) + 1) * 0.18);
    })
  );
  return <Heatmap rows={triggers} cols={days} data={data} formatter={(v) => `${Math.round(v * 100)}`} />;
}

// ─── Lifecycle: refer-a-friend funnel ────────────────────────────────────────
export function RfafFunnelChart() {
  return (
    <Funnel stages={[
      { label: 'Advocates identified', value: 8400, tone: 'good' },
      { label: 'Invites sent',         value: 3540 },
      { label: 'Friends opened',       value: 1320 },
      { label: 'Conversions',          value: 612, tone: 'good' },
      { label: 'LTV created (£)',      value: 94000, tone: 'good' },
    ]} formatter={(v) => v.toLocaleString()} />
  );
}

// ─── Brand: sentiment trend 30d ──────────────────────────────────────────────
export function BrandSentimentTrend() {
  const labels = ['D-30','D-25','D-20','D-15','D-10','D-5','today'];
  return (
    <LineChart
      labels={labels}
      series={[
        { name: 'Positive', data: [54, 56, 58, 57, 60, 61, 62] },
        { name: 'Neutral',  data: [22, 21, 21, 22, 21, 20, 20] },
        { name: 'Negative', data: [24, 23, 21, 21, 19, 19, 18] },
      ]}
    />
  );
}

// ─── Brand: theme cluster donut ──────────────────────────────────────────────
export function BrandThemeDonut() {
  return (
    <Donut data={[
      { label: '5G coverage',          value: 28, color: '#29B5E8' },
      { label: 'Billing app crash',    value: 24, color: '#F59E0B' },
      { label: 'Tariff vs competitor', value: 18, color: '#11567F' },
      { label: 'Customer service',     value: 14, color: '#10B981' },
      { label: 'Roaming complaints',   value: 10, color: '#8B5CF6' },
      { label: 'Other',                value: 6,  color: '#9CA3AF' },
    ]} title="Theme clusters · last 7d" />
  );
}
