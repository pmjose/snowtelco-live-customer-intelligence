import { useState, useMemo } from 'react';
import { useDemoState } from '@/state/DemoStateProvider';
import { Link } from 'react-router-dom';
import {
  Megaphone, BarChart3, Users, Repeat, Eye, Sparkles, ShieldCheck,
  TrendingUp, Send, Zap, Brain, Search, Cpu,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DigitalMlBadge,
  HubSpendRevenueLine, FunnelRoasScatter, LookalikeScatter, SuppressionDonut,
  TriggerHeatmap, RfafFunnelChart, BrandSentimentTrend, BrandThemeDonut,
} from './DigitalCharts';

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
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

// Reusable Campaign tile — used in Hub list + active-scenario card.
export interface CampaignVM {
  id: string;
  name: string;
  status: 'live' | 'scheduled' | 'paused' | 'done';
  audience: number;
  channels: string[];
  holdoutPct: number;
  conv: number; // %
  uplift: number; // pp vs holdout
  roas: number; // x
  spend: number; // £
  cap: number; // £
  brand: string;
}
export function CampaignCard({ c, highlight = false }: { c: CampaignVM; highlight?: boolean }) {
  const tone = c.status === 'live' ? 'bg-emerald-100 text-emerald-700'
              : c.status === 'paused' ? 'bg-amber/20 text-amber-800'
              : c.status === 'scheduled' ? 'bg-mist text-ink-muted'
              : 'bg-mist text-ink-muted';
  const spendPct = Math.min(100, Math.round((c.spend / c.cap) * 100));
  return (
    <div className={cn('vf-card p-3', highlight && 'ring-2 ring-vfRed shadow-md')}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-sm text-ink truncate">{c.name}</div>
          <div className="text-[10px] text-ink-muted truncate">{c.brand} · {c.channels.join(' · ')}</div>
        </div>
        <span className={cn('vf-chip text-[9px] uppercase font-bold', tone)}>{c.status}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mt-2 text-[11px]">
        <Stat label="Audience" value={c.audience >= 1000 ? `${(c.audience / 1000).toFixed(c.audience >= 10000 ? 0 : 1)}k` : `${c.audience}`} />
        <Stat label="Conv" value={`${c.conv}%`} />
        <Stat label="Uplift" value={`+${c.uplift}pp`} />
        <Stat label="ROAS" value={`${c.roas.toFixed(1)}x`} />
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] text-ink-muted">
          <span>Spend £{(c.spend / 1000).toFixed(0)}k of £{(c.cap / 1000).toFixed(0)}k cap</span>
          <span>holdout {c.holdoutPct}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-mist overflow-hidden">
          <div className="h-full bg-vfRed transition-all duration-500" style={{ width: `${spendPct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-mist/60 px-1.5 py-1 min-w-0">
      <div className="text-[9px] uppercase text-ink-muted font-bold tracking-wider whitespace-nowrap">{label}</div>
      <div className="font-mono tabular-nums text-[12px] font-extrabold text-ink leading-none whitespace-nowrap">{value}</div>
    </div>
  );
}

const CAMPAIGNS: CampaignVM[] = [
  { id: 'cmp-5g-hero',      name: '5G Hero · Unlimited Max',     status: 'live',      audience: 240180, channels: ['App', 'Email', 'RCS'], holdoutPct: 5, conv: 11.4, uplift: 6.4, roas: 4.6, spend: 184000, cap: 320000, brand: 'SnowTelco' },
  { id: 'cmp-roam-pre',     name: 'Pre-travel Roaming Pass',     status: 'live',      audience: 4200,   channels: ['Push', 'Email'],        holdoutPct: 5, conv: 16.5, uplift: 9.2, roas: 6.1, spend: 12400,  cap: 30000,  brand: 'SnowTelco' },
  { id: 'cmp-disney',       name: 'Disney+ family attach',       status: 'live',      audience: 24000,  channels: ['In-app', 'Email'],      holdoutPct: 5, conv: 27,   uplift: 18.4, roas: 5.4, spend: 32100, cap: 80000,  brand: 'SnowTelco' },
  { id: 'cmp-snowflex-match', name: 'SnowFlex price match',      status: 'live',      audience: 940,    channels: ['App', 'SMS'],           holdoutPct: 5, conv: 44,   uplift: 16,   roas: 3.8, spend: 6400,  cap: 20000,  brand: 'SnowFlex' },
  { id: 'cmp-winback',      name: 'Winback wave Q2',             status: 'scheduled', audience: 18420,  channels: ['Email', 'Push', 'SMS'], holdoutPct: 10, conv: 0,    uplift: 0,    roas: 0,   spend: 0,     cap: 92000,  brand: 'SnowTelco' },
  { id: 'cmp-anniv',        name: 'Birthday / anniversary',      status: 'live',      audience: 12200,  channels: ['Push', 'Email'],        holdoutPct: 5, conv: 38,   uplift: 22,   roas: 7.4, spend: 4200,  cap: 18000,  brand: 'SnowTelco' },
  { id: 'cmp-rfaf',         name: 'Refer-a-friend Q2',           status: 'live',      audience: 8400,   channels: ['Email', 'Push'],        holdoutPct: 0, conv: 14,   uplift: 0,    roas: 9.1, spend: 2100,  cap: 12000,  brand: 'SnowTelco' },
  { id: 'cmp-app-rating',   name: 'iOS rating recovery',         status: 'paused',    audience: 18400,  channels: ['In-app', 'Email'],      holdoutPct: 0, conv: 22,   uplift: 0,    roas: 0,   spend: 1800,  cap: 4000,   brand: 'SnowTelco' },
];

const ACTIVE_CAMPAIGN_BY_SCENARIO: Record<string, string> = {
  'dig-campaign-launch-lookalike': 'cmp-5g-hero',
  'dig-roaming-push':              'cmp-roam-pre',
  'dig-marketplace-bundle':        'cmp-disney',
  'dig-attribution-rebalance':     'cmp-5g-hero',
  'dig-competitor-counter':        'cmp-snowflex-match',
  'dig-winback-lapsed':            'cmp-winback',
  'dig-anniversary-loyalty':       'cmp-anniv',
  'dig-refer-a-friend':            'cmp-rfaf',
  'dig-appstore-rating-watch':     'cmp-app-rating',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Campaigns Hub
// ─────────────────────────────────────────────────────────────────────────────
export default function MarketingCampaigns() {
  const { selectedIncidentId } = useDemoState();
  const activeId = ACTIVE_CAMPAIGN_BY_SCENARIO[selectedIncidentId];
  const tiles = [
    { to: '/digital/marketing/funnel',    label: 'Funnel & Attribution', icon: BarChart3, desc: 'Sankey · multi-touch · MMM slider' },
    { to: '/digital/marketing/audience',  label: 'Audience Builder',     icon: Users,     desc: 'Predicate editor · lookalike from seed' },
    { to: '/digital/marketing/lifecycle', label: 'Lifecycle & Loyalty',  icon: Repeat,    desc: 'Triggers · loyalty · refer-a-friend' },
    { to: '/digital/marketing/brand',     label: 'Brand & Competitor',   icon: Eye,       desc: 'Share of voice · competitor watch' },
  ];
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="Digital · Marketing" title="Campaigns Hub" subtitle="Plan, run, attribute. Cortex Agent generates creative, Snowpark ML scores audiences, MMM allocates spend." badge={<DigitalMlBadge pageKey="marketingHub" />} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiTile label="Active campaigns" value="6" delta="+2 vs last wk" tone="good" />
        <KpiTile label="Audience served" value="312k" delta="weekly reach" tone="good" />
        <KpiTile label="Conv (weighted)" value="14.8%" delta="+2.4pp" tone="good" />
        <KpiTile label="Holdout uplift" value="+8.6pp" delta="vs control" tone="good" />
        <KpiTile label="ROAS (mean)" value="5.1x" delta="+0.4 MoM" tone="good" />
        <KpiTile label="Spend MTD" value="£244k" delta="of £600k cap" tone="neutral" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="vf-card p-3 hover:shadow-md transition group">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-vfRed-soft text-vfRed-dark grid place-items-center"><Icon className="w-4 h-4" /></div>
                <div className="font-bold text-ink group-hover:text-vfRed">{t.label}</div>
              </div>
              <div className="text-[11px] text-ink-muted mt-1">{t.desc}</div>
            </Link>
          );
        })}
      </div>

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live & scheduled campaigns</div>
            <div className="text-xs text-ink-muted">Snowflake-native pipeline · audience refreshed every 15 min</div>
          </div>
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> GDPR Art.6 + 22 · Ofcom GC C1</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {CAMPAIGNS.map((c) => <CampaignCard key={c.id} c={c} highlight={c.id === activeId} />)}
        </div>
      </div>
      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Cumulative spend vs revenue · last 30d</div>
        <HubSpendRevenueLine />
        <div className="text-[10px] text-ink-muted mt-1">Source <span className="font-mono">gold.spend_ledger</span> + <span className="font-mono">gold.revenue_attribution</span></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Funnel & Attribution
// ─────────────────────────────────────────────────────────────────────────────
export function MarketingFunnel() {
  const [paidSocialPct, setPaidSocialPct] = useState(40);
  // Diminishing-returns curves redrawn from a slider on paid-social allocation.
  // Cheap to compute; visually huge.
  const channels = useMemo(() => {
    const remaining = 100 - paidSocialPct;
    const retargeting = Math.round(remaining * 0.45);
    const rcs = Math.round(remaining * 0.20);
    const email = Math.round(remaining * 0.20);
    const search = Math.max(0, remaining - retargeting - rcs - email);
    const totalSpend = 600;
    return [
      { name: 'Paid social',  pct: paidSocialPct, spend: Math.round(totalSpend * paidSocialPct / 100), eff: 0.7 + 0.6 * Math.exp(-paidSocialPct / 30) },
      { name: 'Retargeting',  pct: retargeting,   spend: Math.round(totalSpend * retargeting / 100),   eff: 1.4 + 0.4 * Math.exp(-retargeting / 30) },
      { name: 'RCS',          pct: rcs,           spend: Math.round(totalSpend * rcs / 100),           eff: 1.6 + 0.5 * Math.exp(-rcs / 20) },
      { name: 'Email',        pct: email,         spend: Math.round(totalSpend * email / 100),         eff: 2.2 + 0.4 * Math.exp(-email / 18) },
      { name: 'Search',       pct: search,        spend: Math.round(totalSpend * search / 100),        eff: 1.1 + 0.4 * Math.exp(-search / 25) },
    ];
  }, [paidSocialPct]);
  const totalIncRevenue = channels.reduce((s, c) => s + c.spend * c.eff, 0);

  const sankey = [
    { stage: 'Awareness',    n: 4_200_000, color: '#bfdbfe' },
    { stage: 'Consideration', n: 1_280_000, color: '#93c5fd' },
    { stage: 'Add-to-cart',   n: 184_000,   color: '#60a5fa' },
    { stage: 'Conversion',    n: 28_400,    color: '#3b82f6' },
    { stage: 'Activation',    n: 24_180,    color: '#1d4ed8' },
  ];
  const max = sankey[0].n;

  const attribution = [
    { model: 'Last-click',   social: 31, retarg: 22, rcs: 12, email: 18, search: 17 },
    { model: 'Markov',       social: 24, retarg: 28, rcs: 16, email: 21, search: 11 },
    { model: 'Shapley',      social: 22, retarg: 27, rcs: 18, email: 22, search: 11 },
  ];

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="Digital · Marketing · Funnel" title="Funnel & Attribution" subtitle="Acquisition Sankey, multi-touch attribution, and a Marketing Mix Model that re-allocates live." badge={<DigitalMlBadge pageKey="funnel" />} />

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Acquisition Sankey · last 30d</div>
          <div className="space-y-2">
            {sankey.map((s, i) => {
              const w = (s.n / max) * 100;
              const drop = i > 0 ? Math.round((1 - s.n / sankey[i - 1].n) * 100) : 0;
              return (
                <div key={s.stage} className="flex items-center gap-3">
                  <div className="w-32 text-[12px] text-ink font-semibold">{s.stage}</div>
                  <div className="flex-1 h-7 bg-mist rounded-md overflow-hidden">
                    <div className="h-full" style={{ width: `${w}%`, background: s.color }} />
                  </div>
                  <div className="w-24 text-right font-mono text-xs font-extrabold text-ink tabular-nums">{s.n.toLocaleString()}</div>
                  {i > 0 && <div className="w-12 text-right text-[10px] text-vfRed tabular-nums">−{drop}%</div>}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-ink-muted mt-2">Source: <span className="font-mono">gold.touchpoints</span> · attribution: <span className="font-mono">gold.revenue_attribution</span></div>
        </div>

        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Multi-touch attribution · % credit by channel</div>
          <table className="w-full text-[11px] border border-mist-dark">
            <thead className="bg-mist">
              <tr>
                <th className="text-left px-2 py-1 border-r border-mist-dark">Model</th>
                <th className="text-right px-2 py-1 border-r border-mist-dark">Social</th>
                <th className="text-right px-2 py-1 border-r border-mist-dark">Retarg</th>
                <th className="text-right px-2 py-1 border-r border-mist-dark">RCS</th>
                <th className="text-right px-2 py-1 border-r border-mist-dark">Email</th>
                <th className="text-right px-2 py-1">Search</th>
              </tr>
            </thead>
            <tbody>
              {attribution.map((a) => (
                <tr key={a.model} className="border-t border-mist-dark">
                  <td className="px-2 py-1.5 border-r border-mist-dark font-bold">{a.model}</td>
                  <td className="px-2 py-1.5 border-r border-mist-dark font-mono text-right">{a.social}%</td>
                  <td className="px-2 py-1.5 border-r border-mist-dark font-mono text-right">{a.retarg}%</td>
                  <td className="px-2 py-1.5 border-r border-mist-dark font-mono text-right">{a.rcs}%</td>
                  <td className="px-2 py-1.5 border-r border-mist-dark font-mono text-right">{a.email}%</td>
                  <td className="px-2 py-1.5 font-mono text-right">{a.search}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[10px] text-ink-muted mt-2">Markov / Shapley computed in Snowpark over <span className="font-mono">gold.touchpoints</span></div>
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Marketing Mix Model · Bayesian (Snowpark)</div>
            <div className="text-xs text-ink-muted">Drag the slider to reallocate spend between paid social and other channels.</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Paid social:</span>
            <input type="range" min={10} max={70} value={paidSocialPct} onChange={(e) => setPaidSocialPct(parseInt(e.target.value, 10))} className="w-48" />
            <span className="font-mono text-sm font-bold text-ink w-10 text-right">{paidSocialPct}%</span>
          </div>
        </div>
        <div className="space-y-2 mt-3">
          {channels.map((c) => {
            const incRevenue = c.spend * c.eff;
            return (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-32 text-[12px] text-ink font-semibold">{c.name}</div>
                <div className="flex-1 h-6 bg-mist rounded-md overflow-hidden relative">
                  <div className="h-full bg-vfRed/30" style={{ width: `${c.pct * 1.4}%` }} title={`spend share ${c.pct}%`} />
                  <div className="absolute inset-y-0 left-0 h-full bg-emerald-500/70" style={{ width: `${Math.min(100, (incRevenue / 1500) * 100)}%` }} title={`incremental revenue £${incRevenue.toFixed(0)}k`} />
                </div>
                <div className="w-20 text-right font-mono text-[11px] text-ink tabular-nums">£{c.spend}k spend</div>
                <div className="w-24 text-right font-mono text-[11px] text-emerald-700 tabular-nums">£{Math.round(incRevenue)}k inc.rev</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] mt-3 border-t border-mist-dark pt-2">
          <span className="text-ink-muted">Diminishing returns modelled as <span className="font-mono">eff = α + β·exp(−spend/γ)</span> per channel</span>
          <span className="text-ink"><b>Total incremental revenue:</b> <span className="font-mono text-emerald-700 font-bold">£{Math.round(totalIncRevenue).toLocaleString()}k / mo</span></span>
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">ROAS scatter · spend vs return</div>
        <FunnelRoasScatter />
        <div className="text-[10px] text-ink-muted mt-1">Bubble size = revenue · model <span className="font-mono">mmm_bayesian_v2</span></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Audience Builder
// ─────────────────────────────────────────────────────────────────────────────
export function MarketingAudience() {
  const [predicate, setPredicate] = useState('tenure > 6mo AND CLV > 400 AND consent.marketing = true AND last_offer_age > 12d');
  // "Live count" is presentation-only synthetic, but tied to predicate length so
  // it changes responsively as the user edits.
  const liveCount = useMemo(() => {
    const seed = 240180;
    const variance = (predicate.length % 27) * 1450;
    return seed - variance;
  }, [predicate]);
  const overlap = Math.round(liveCount * 0.18);
  const lookalikeBase = 1000;
  const lookalikeReach = 240000;

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="Digital · Marketing · Audience" title="Audience Builder" subtitle="Predicate-style segment editor backed by Cortex SQL · lookalike-from-seed via Snowpark ML." badge={<DigitalMlBadge pageKey="audience" />} />

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1.5">
            <Cpu className="w-3 h-3" /> Predicate (Cortex SQL)
          </div>
          <span className="text-[10px] text-ink-muted">computed 4 sec ago</span>
        </div>
        <textarea
          value={predicate}
          onChange={(e) => setPredicate(e.target.value)}
          rows={3}
          className="w-full font-mono text-[12px] text-ink p-3 rounded-lg border border-mist-dark bg-mist/30 leading-relaxed"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <KpiTile label="Live cohort" value={liveCount.toLocaleString()} delta="from gold.customer_master" tone="good" />
          <KpiTile label="Suppress (open complaint)" value="2,180" delta="ICO + offer-fatigue" tone="warn" />
          <KpiTile label="Overlap (active campaigns)" value={overlap.toLocaleString()} delta="excluded automatically" tone="neutral" />
          <KpiTile label="Net reachable" value={(liveCount - 2180 - overlap).toLocaleString()} delta="post-suppression" tone="good" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2 flex items-center gap-1.5"><Brain className="w-3 h-3" /> Lookalike-from-seed (Snowpark ML)</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Seed</div>
              <div className="text-2xl font-extrabold text-ink font-mono">{lookalikeBase.toLocaleString()}</div>
              <div className="text-[10px] text-ink-muted">High-CLV converters · last 90d</div>
            </div>
            <div className="rounded-lg bg-vfRed-soft/40 p-3 border border-vfRed/30">
              <div className="text-[10px] uppercase tracking-wider text-vfRed-dark font-bold">Lookalike</div>
              <div className="text-2xl font-extrabold text-ink font-mono">{lookalikeReach.toLocaleString()}</div>
              <div className="text-[10px] text-ink-muted">Cosine similarity ≥ 0.82</div>
            </div>
            <div className="rounded-lg bg-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Embedding</div>
              <div className="text-2xl font-extrabold text-ink font-mono">128-d</div>
              <div className="text-[10px] text-ink-muted"><span className="font-mono">gold.customer_embeddings</span></div>
            </div>
          </div>
          <div className="text-[10px] text-ink-muted mt-2">Model · <span className="font-mono">customer_lookalike_v1.6</span> · trained on 4.2M customer-month rows · refreshed nightly</div>
        </div>

        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Suppression & guardrails</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Marketing consent revoked · <span className="font-mono text-ink-muted">gold.consent_register</span></li>
            <li>• Open complaint or vulnerability flag · <span className="font-mono text-ink-muted">gold.vulnerability_register</span></li>
            <li>• Offer-fatigue (any retention offer in 12d)</li>
            <li>• Frequency cap (3/day, 7/week per customer)</li>
            <li>• Audience overlap with active campaigns (auto-excluded)</li>
            <li>• Quiet hours 21:00–08:00 local (marketing only)</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Lookalike scatter · 2-D embedding projection</div>
          <LookalikeScatter />
          <div className="text-[10px] text-ink-muted mt-1">Red = seed converters · grey = candidates · model <span className="font-mono">customer_lookalike_v1.6</span></div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Suppression mix</div>
          <SuppressionDonut />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Lifecycle & Loyalty
// ─────────────────────────────────────────────────────────────────────────────
export function MarketingLifecycle() {
  const triggers = [
    { id: 'onb-d0',   name: 'Onboarding · D0 welcome',         eligible: '6.4k/wk',  conv: 92, status: 'live' },
    { id: 'onb-d7',   name: 'Onboarding · D7 setup nudge',     eligible: '5.9k/wk',  conv: 71, status: 'live' },
    { id: 'onb-d30',  name: 'Onboarding · D30 NPS + upsell',   eligible: '5.1k/wk',  conv: 28, status: 'live' },
    { id: 'anniv',    name: 'Anniversary surprise',            eligible: '12.2k/wk', conv: 38, status: 'live' },
    { id: 'lapse',    name: 'Lapse · 30d no-engagement',       eligible: '4.4k/wk',  conv: 14, status: 'live' },
    { id: 'winback',  name: 'Winback · 90d post-cancel',       eligible: '18.4k/wk', conv: 9,  status: 'scheduled' },
    { id: 'birthday', name: 'Birthday · loyalty boost',        eligible: '8.4k/wk',  conv: 44, status: 'live' },
    { id: 'rfaf',     name: 'Refer-a-friend · advocate nudge', eligible: '8.4k/wk',  conv: 14, status: 'live' },
  ];
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="Digital · Marketing · Lifecycle" title="Lifecycle & Loyalty" subtitle="Trigger journeys, loyalty missions, and refer-a-friend — all consent-respecting and cap-aware." badge={<DigitalMlBadge pageKey="lifecycle" />} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiTile label="Active triggers" value="8" />
        <KpiTile label="Daily fires" value="14.2k" delta="+8% WoW" tone="good" />
        <KpiTile label="Avg conv (triggers)" value="36%" delta="+4pp" tone="good" />
        <KpiTile label="Loyalty members" value="11.2M" delta="+0.4M MoM" tone="good" />
        <KpiTile label="Mission completion" value="58%" delta="vs 42% baseline" tone="good" />
        <KpiTile label="Viral coefficient (RFAF)" value="0.42" delta="invites/advocate" tone="good" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {triggers.map((t) => (
          <div key={t.id} className="vf-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-[13px] text-ink leading-tight line-clamp-2">{t.name}</div>
              <span className={cn('vf-chip text-[9px] uppercase font-bold', t.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-mist text-ink-muted')}>{t.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <Stat label="Eligible" value={t.eligible} />
              <Stat label="Conv" value={`${t.conv}%`} />
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-mist overflow-hidden">
              <div className="h-full bg-vfRed" style={{ width: `${t.conv}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Refer-a-friend funnel</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <RfafStep n="8,400" label="Advocates identified" />
          <RfafStep n="3,540" label="Invites sent" />
          <RfafStep n="1,320" label="Friends opened" />
          <RfafStep n="612"   label="Conversions" />
          <RfafStep n="£94k"  label="LTV created" tone="good" />
        </div>
        <div className="text-[10px] text-ink-muted mt-2">Model · <span className="font-mono">advocate_propensity_v1.0</span> · seed: customers with NPS ≥ 9 + ≥ 6 mo tenure · features from <span className="font-mono">gold.engagement_features</span></div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Trigger heat-map · day × trigger</div>
          <TriggerHeatmap />
          <div className="text-[10px] text-ink-muted mt-1">Daily fires per trigger · darker = busier</div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Refer-a-friend cohort funnel</div>
          <RfafFunnelChart />
        </div>
      </div>
    </div>
  );
}

function RfafStep({ n, label, tone }: { n: string; label: string; tone?: 'good' }) {
  return (
    <div className={cn('rounded-lg p-3', tone === 'good' ? 'bg-emerald-50 border border-emerald-200' : 'bg-mist')}>
      <div className="text-xl font-extrabold text-ink font-mono">{n}</div>
      <div className="text-[10px] text-ink-muted">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Brand Health & Competitor Watch
// ─────────────────────────────────────────────────────────────────────────────
export function MarketingBrand() {
  const sov = [
    { brand: 'SnowTelco',   share: 32, change: +1.4 },
    { brand: 'Competitor A', share: 27, change: -0.8 },
    { brand: 'Competitor B', share: 18, change: +0.3 },
    { brand: 'Competitor C', share: 15, change: +1.1 },
    { brand: 'Others',       share: 8,  change: -0.6 },
  ];
  const threats = [
    { id: 't1', headline: 'Competitor A · 30GB SIM-only £18 (was £22)', detail: 'Cortex Search detected promo on competitor site + 4 social posts in last 4h. PAC velocity in LS2 +340% vs baseline.', counter: 'Auto-drafted: SnowFlex 30GB price-match + 6mo loyalty boost · cohort 940 LS2/LS5 customers.', severity: 'high' as const },
    { id: 't2', headline: 'Competitor C · Disney+ + 20GB bundle £25', detail: 'Family-plan attack vector. Forecasts +18% PAC requests on family lines if untreated.', counter: 'Auto-drafted: Disney+ family bundle promo at £24 with 6mo loyalty extension.', severity: 'medium' as const },
    { id: 't3', headline: 'Competitor B · "5G unlimited" awareness ad', detail: 'Heavy paid social YouTube + TikTok last 7d. Brand-search SnowTelco 5G −4%.', counter: 'Auto-drafted: response film "5G SA Unlimited Max — actually live in 24 cells today" · paid social retarget.', severity: 'medium' as const },
  ];
  const sentiment = [
    { city: 'London',     pos: 62, neg: 18, neu: 20 },
    { city: 'Manchester', pos: 48, neg: 32, neu: 20 },
    { city: 'Birmingham', pos: 54, neg: 24, neu: 22 },
    { city: 'Leeds',      pos: 56, neg: 22, neu: 22 },
    { city: 'Glasgow',    pos: 61, neg: 17, neu: 22 },
    { city: 'Bristol',    pos: 58, neg: 18, neu: 24 },
  ];
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="Digital · Marketing · Brand" title="Brand Health & Competitor Watch" subtitle="Share-of-voice, sentiment heat-map, and competitor-pricing watch via Cortex Search over public review/ad corpora." badge={<DigitalMlBadge pageKey="brand" />} />

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2 flex items-center gap-1.5"><Megaphone className="w-3 h-3" /> Share of voice · UK MNO</div>
          <div className="space-y-2">
            {sov.map((s) => (
              <div key={s.brand} className="flex items-center gap-3">
                <div className="w-32 text-[12px] text-ink font-semibold truncate">{s.brand}</div>
                <div className="flex-1 h-5 bg-mist rounded-md overflow-hidden">
                  <div className="h-full bg-vfRed" style={{ width: `${s.share * 2}%` }} />
                </div>
                <div className="w-12 text-right font-mono text-xs font-bold text-ink tabular-nums">{s.share}%</div>
                <div className={cn('w-12 text-right text-[10px] font-mono tabular-nums', s.change > 0 ? 'text-emerald-700' : 'text-vfRed')}>{s.change > 0 ? '+' : ''}{s.change}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-ink-muted mt-2">Cortex Search over <span className="font-mono">gold.review_corpus</span> + <span className="font-mono">gold.competitor_ads</span></div>
        </div>

        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Brand sentiment · last 7d by city</div>
          <table className="w-full text-[11px]">
            <thead className="bg-mist text-ink-muted">
              <tr>
                <th className="text-left px-2 py-1">City</th>
                <th className="text-right px-2 py-1">Positive %</th>
                <th className="text-right px-2 py-1">Neutral %</th>
                <th className="text-right px-2 py-1">Negative %</th>
                <th className="text-left px-2 py-1">Mix</th>
              </tr>
            </thead>
            <tbody>
              {sentiment.map((s) => (
                <tr key={s.city} className="border-t border-mist-dark">
                  <td className="px-2 py-1.5 font-bold">{s.city}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-emerald-700">{s.pos}%</td>
                  <td className="px-2 py-1.5 text-right font-mono">{s.neu}%</td>
                  <td className="px-2 py-1.5 text-right font-mono text-vfRed">{s.neg}%</td>
                  <td className="px-2 py-1.5">
                    <div className="flex h-2 rounded overflow-hidden">
                      <div style={{ width: `${s.pos}%`, background: '#10b981' }} />
                      <div style={{ width: `${s.neu}%`, background: '#9ca3af' }} />
                      <div style={{ width: `${s.neg}%`, background: '#ef4444' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[10px] text-ink-muted mt-2">Sentiment via <span className="font-mono">AI_SENTIMENT</span> on <span className="font-mono">gold.review_corpus</span></div>
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1.5"><Search className="w-3 h-3" /> Today's competitor moves to react to · Cortex Search</div>
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><Sparkles className="w-3 h-3" /> auto-drafted counter-offers</span>
        </div>
        <div className="space-y-2">
          {threats.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-lg border p-3', t.severity === 'high' ? 'border-vfRed/40 bg-vfRed-soft/20' : 'border-amber/40 bg-amber/10')}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-sm text-ink">{t.headline}</div>
                <span className={cn('vf-chip text-[9px] uppercase font-bold', t.severity === 'high' ? 'bg-vfRed text-white' : 'bg-amber text-white')}>{t.severity}</span>
              </div>
              <div className="text-[12px] text-ink-muted mt-1">{t.detail}</div>
              <div className="text-[12px] text-ink mt-2 flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" /><span><b>Counter-offer (auto-drafted by Cortex Agent):</b> {t.counter}</span></div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Brand sentiment trend · 30d</div>
          <BrandSentimentTrend />
          <div className="text-[10px] text-ink-muted mt-1">Cortex AI · <span className="font-mono">AI_SENTIMENT</span> on <span className="font-mono">gold.review_corpus</span></div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Theme clusters · last 7d</div>
          <BrandThemeDonut />
          <div className="text-[10px] text-ink-muted mt-1">AI_SUMMARIZE clustering · <span className="font-mono">theme_cluster_v1</span></div>
        </div>
      </div>
    </div>
  );
}
