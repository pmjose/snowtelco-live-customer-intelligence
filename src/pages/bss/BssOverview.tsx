import { CreditCard, Layers, ShoppingCart, Gauge, Receipt, Banknote, ShieldAlert, Award, Building2 } from 'lucide-react';
import { Fragment } from 'react';
import { DomainLanding, type DomainTile } from '@/components/shared/DomainLanding';
import { ScenarioTimeline } from '@/components/timeline/ScenarioTimeline';
import { BarChart, HBar, LineChart, Donut, Funnel, Sparkline, Waterfall } from '@/components/shared/Charts';
import { cn } from '@/lib/utils';
import { UkRegionMap, StackedDeltaBars, Treemap, ParetoChart, BandedLineChart, AreaChart, Histogram, StackedAreaChart } from '@/pages/bss/BssExtended';

const tiles: DomainTile[] = [
  { to: '/bss/order-to-activate', label: 'Order-to-Activate', desc: 'Acquisition wizard: credit + fraud + eSIM + first-bill, agent-assisted.', icon: ShoppingCart, status: 'live' },
  { to: '/bss/billing', label: 'Billing & Invoice', desc: 'Bill cycle preview, dispute, Ofcom auto-compensation evaluation.', icon: Receipt, status: 'live' },
  { to: '/bss/catalog', label: 'Product Catalog', desc: 'TMF 620 catalog of plans, add-ons, devices and bundles.', icon: Layers, status: 'live' },
  { to: '/bss/charging', label: 'Charging & Rating', desc: 'Real-time charging meter on a roaming session.', icon: Gauge, status: 'live' },
  { to: '/bss/collections', label: 'Collections', desc: 'Dunning + payment-plan workflow with predictive recovery.', icon: Banknote, status: 'live' },
  { to: '/bss/revenue-assurance', label: 'Revenue Assurance', desc: 'Leakage, fraud (IRSF / SIM-box / Wangiri) detection.', icon: ShieldAlert, status: 'live' },
  { to: '/bss/loyalty', label: 'Loyalty', desc: 'VeryMe / Stuff-style rewards engine.', icon: Award, status: 'live' },
  { to: '/bss/b2b', label: 'Enterprise', desc: 'Account hierarchy, MSA, SLA credits, e-bonding.', icon: Building2, status: 'live' },
];

export default function BssOverview() {
  return (
    <>
      <DomainLanding
        kicker="BSS"
        title="Commerce & Revenue"
        subtitle="Catalog, order, charging, billing — execution + audit layer that reflects what NOC agents instruct."
        banner={null}
        kpis={[
          { label: 'ARPU', value: '£24.40', delta: '+£0.40 MoM', tone: 'good' },
          { label: 'Activations / day', value: '6,320', delta: '+11%', tone: 'good' },
          { label: 'Revenue at risk', value: '£1.42M', delta: 'churn + bill-shock', tone: 'warn' },
          { label: 'Leakage flags', value: '14', delta: 'open · auto-routed', tone: 'warn' },
          { label: 'Fraud cases', value: '7', delta: 'investigating', tone: 'bad' },
          { label: 'Dispute SLA', value: '94', unit: '%', delta: '+2pp', tone: 'good' },
        ]}
        tiles={tiles}
        timeline={<ScenarioTimeline />}
      />
      <ExecutiveOverviewPanels />
    </>
  );
}

function ExecutiveOverviewPanels() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="vf-card p-4" data-focus="bss-revenue-waterfall">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Group · MTD</div>
              <h3 className="text-sm font-extrabold text-ink">Revenue movements waterfall</h3>
            </div>
            <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px] font-bold">+£3.4M MoM</span>
          </div>
          <Waterfall
            height={200}
            formatter={(v) => `£${v.toFixed(1)}M`}
            items={[
              { label: 'Apr base', value: 184.2, tone: 'total' },
              { label: 'Acq + upgrades', value: +6.8, tone: 'pos' },
              { label: 'Cross-sell', value: +1.6, tone: 'pos' },
              { label: 'Roaming', value: +0.9, tone: 'pos' },
              { label: 'Churn', value: -2.4, tone: 'neg' },
              { label: 'Discounts', value: -1.8, tone: 'neg' },
              { label: 'Disputes', value: -0.3, tone: 'neg' },
              { label: 'Bad-debt', value: -1.4, tone: 'neg' },
              { label: 'May MTD', value: 187.6, tone: 'total' },
            ]}
          />
          <div className="text-[10px] text-ink-muted mt-2">Source <code className="font-mono">gold.revenue_movements</code> · refreshed every 15 min via Snowpipe.</div>
        </div>

        <div className="vf-card p-4" data-focus="bss-revenue-heatmap">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">UK · ARPU density</div>
              <h3 className="text-sm font-extrabold text-ink">Revenue heatmap by region</h3>
            </div>
            <span className="vf-chip bg-mist text-ink text-[9px] font-bold">£/mo · 12 regions</span>
          </div>
          <UkRegionMap data={{
            SCOT: 18.4, NI: 6.2, NE: 12.1, NW: 24.6, YORKS: 18.9, EM: 15.3,
            WM: 21.8, WALES: 9.4, EAST: 17.2, LON: 38.2, SE: 28.6, SW: 14.1,
          }} />
          <div className="text-[10px] text-ink-muted mt-2">London + SE = 36% of group revenue · NI under-indexed vs. population (-2.1pp).</div>
        </div>
      </div>

      <div className="vf-card p-4" data-focus="bss-product-mix">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Product portfolio · QoQ</div>
            <h3 className="text-sm font-extrabold text-ink">Top revenue products with QoQ delta</h3>
          </div>
          <span className="vf-chip bg-mist text-ink text-[9px] font-bold">gold.product_performance</span>
        </div>
        <StackedDeltaBars items={[
          { label: '5G SA Unlimited Pro', value: 67.2, delta: +8.4 },
          { label: '5G 100 GB',           value: 55.1, delta: +3.1 },
          { label: '5G 30 GB',            value: 38.9, delta: -1.2 },
          { label: 'SnowFlex 30 SIM-only', value: 18.6, delta: +12.6 },
          { label: 'Roaming Pass EU',      value: 9.4,  delta: +24.8 },
          { label: 'Device finance (iP16)', value: 8.2,  delta: +6.4 },
          { label: 'Mobile Insurance Pro', value: 4.1,  delta: +2.0 },
          { label: 'Pay-as-you-go',        value: 3.7,  delta: -4.4 },
        ]} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collections & Dunning
// ─────────────────────────────────────────────────────────────────────────────

function Kpi({ label, value, delta, tone = 'neutral' }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</div>
      {delta && <div className={cn('text-[10px] mt-0.5', toneCls)}>{delta}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog (TMF 620)
// ─────────────────────────────────────────────────────────────────────────────
const plans = [
  { id: 'PLAN-5GSA-MAX', name: '5G SA Unlimited Max', price: '£42', data: 'Unlimited', perks: 'Disney+, Roaming Pass EU+US', subs: '1.4M', tier: 'Premium' },
  { id: 'PLAN-5GSA-PRO', name: '5G SA Unlimited Pro', price: '£32', data: 'Unlimited', perks: 'Roaming Pass EU', subs: '2.1M', tier: 'Premium' },
  { id: 'PLAN-5G-100', name: '5G 100 GB', price: '£24', data: '100 GB', perks: 'Roaming Pass EU (3GB)', subs: '4.6M', tier: 'Mid' },
  { id: 'PLAN-5G-30', name: '5G 30 GB', price: '£14', data: '30 GB', perks: '—', subs: '7.2M', tier: 'Value' },
  { id: 'PLAN-FLEX-30', name: 'SnowFlex 30 GB SIM-only', price: '£8', data: '30 GB', perks: 'No contract', subs: '3.9M', tier: 'Value' },
  { id: 'PLAN-PAYG', name: 'Pay-as-you-go', price: '£0', data: 'On-demand', perks: 'Top-ups in app', subs: '1.8M', tier: 'PAYG' },
];

const addons = [
  { id: 'ROAM-EU', name: 'Roaming Pass EU', price: '£3/day', desc: 'Use UK plan in EU' },
  { id: 'ROAM-WORLD', name: 'Roaming Pass World', price: '£6/day', desc: 'Use UK plan in 100+ destinations' },
  { id: 'DATA-BOOST-10', name: 'Data Boost 10 GB', price: '£5', desc: 'One-off, expires next bill' },
  { id: 'DEV-FIN-IP16', name: 'iPhone 16 Pro 256 GB', price: '£24/mo × 24', desc: '24-month device finance' },
  { id: 'INS-MOB-PRO', name: 'Mobile Insurance Pro', price: '£8/mo', desc: 'Theft + accidental damage' },
];

export function BssCatalog() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Catalog (TMF 620)</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">Product & rate-plan catalog</h1>
        <p className="text-xs text-ink-muted">Single source of truth for plans, add-ons, devices and bundles — Amdocs CES catalog · published to all channels via TMF 620 Open API to Salesforce, Genesys, Retail POS.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Active plans" value="6" />
        <Kpi label="Active add-ons" value="38" />
        <Kpi label="Devices" value="142" />
        <Kpi label="Bundles" value="14" />
        <Kpi label="Variants (regional)" value="4" />
        <Kpi label="Last publish" value="2h ago" tone="good" />
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tariff plans</div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">ID</th>
              <th className="py-1.5 px-2">Plan</th>
              <th className="py-1.5 px-2">Tier</th>
              <th className="py-1.5 px-2 text-right">Price</th>
              <th className="py-1.5 px-2">Data</th>
              <th className="py-1.5 px-2">Perks</th>
              <th className="py-1.5 px-2 text-right">Subs</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{p.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{p.name}</td>
                <td className="py-1.5 px-2"><span className="vf-chip bg-mist text-ink-muted text-[10px]">{p.tier}</span></td>
                <td className="py-1.5 px-2 text-right font-mono">{p.price}</td>
                <td className="py-1.5 px-2 font-mono">{p.data}</td>
                <td className="py-1.5 px-2 text-ink-muted">{p.perks}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold">{p.subs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Subscribers per plan</div>
          <BarChart
            data={plans.map((p) => ({ label: p.id.replace('PLAN-', '').slice(0, 9), value: parseFloat(p.subs.replace('M', '')) }))}
            color="#29B5E8"
            formatter={(v) => `${v.toFixed(1)}M`}
          />
          <div className="text-[10px] text-ink-muted mt-2">Largest cohort: 5G 30 GB (7.2M) — value-tier anchor.</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Add-ons & devices</div>
          <ul className="space-y-1">
            {addons.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-[12px] border-b border-mist-dark/60 py-1.5">
                <div>
                  <div className="font-bold text-ink">{a.name}</div>
                  <div className="text-[10.5px] text-ink-muted">{a.desc}</div>
                </div>
                <span className="font-mono text-ink">{a.price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Catalog publishing</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Source of truth: TMF 620 catalog · stored in Snowflake</li>
            <li>• Channels consume via Open API (App, Web, Care, Voice, Retail)</li>
            <li>• Publish window: Mon/Wed 02:00–04:00 (CAB-approved)</li>
            <li>• Versioning: every change has a version + audit trail</li>
            <li>• Rollback: Time Travel → query catalog "as of" any past point</li>
            <li>• A/B testing: variant flag at plan level (5% holdout)</li>
          </ul>
        </div>
      </div>

      <div className="vf-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Catalog mix · revenue × margin</div>
            <h3 className="text-sm font-extrabold text-ink">Plan portfolio treemap</h3>
          </div>
          <span className="vf-chip bg-mist text-ink text-[9px] font-bold">size = £M MRR · colour = gross margin</span>
        </div>
        <Treemap items={[
          { label: '5G SA Pro',     value: 67.2, margin: 0.46 },
          { label: '5G 100 GB',     value: 55.1, margin: 0.38 },
          { label: '5G 30 GB',      value: 38.9, margin: 0.32 },
          { label: '5G SA Max',     value: 28.6, margin: 0.51 },
          { label: 'SnowFlex 30',   value: 18.6, margin: 0.22 },
          { label: 'PAYG',          value: 7.8,  margin: 0.18 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">Premium tier (Pro + Max) = 50% of MRR · 47% blended margin · SnowFlex SIM-only growing fastest at +12.6% QoQ but lowest margin at 22%.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Add-on attach × base plan</div>
              <h3 className="text-sm font-extrabold text-ink">Attach-rate heatmap</h3>
            </div>
            <span className="vf-chip bg-mist text-ink text-[9px] font-bold">% of subs on plan</span>
          </div>
          <AttachRateHeatmap />
          <div className="text-[10px] text-ink-muted mt-2">Roaming Pass attach is 2× higher on Premium tiers · Insurance under-attached on SnowFlex (only 6%) · target for next-best-product cross-sell.</div>
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">28-day net flow between plans</div>
              <h3 className="text-sm font-extrabold text-ink">Plan migration · top movements</h3>
            </div>
            <span className="vf-chip bg-mist text-ink text-[9px] font-bold">net subs · 28d</span>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            {[
              { from: '5G 30 GB',     to: '5G 100 GB',         net: +18420, tone: 'pos'  },
              { from: '5G 100 GB',    to: '5G SA Pro',         net: +12680, tone: 'pos'  },
              { from: 'PAYG',         to: 'SnowFlex 30',       net: +9240,  tone: 'pos'  },
              { from: '5G 30 GB',     to: 'SnowFlex 30',       net: +6840,  tone: 'pos'  },
              { from: '5G SA Pro',    to: '5G SA Max',         net: +3420,  tone: 'pos'  },
              { from: '5G 100 GB',    to: '5G 30 GB',          net: -2840,  tone: 'neg'  },
              { from: '5G SA Pro',    to: 'Churn',             net: -1840,  tone: 'neg'  },
              { from: '5G 30 GB',     to: 'Churn',             net: -3620,  tone: 'neg'  },
            ].map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2"
              >
                <span className="font-bold text-ink min-w-[110px] truncate">{r.from}</span>
                <span className="text-ink-muted">→</span>
                <span className="font-bold text-ink min-w-[110px] truncate">{r.to}</span>
                <div className="flex-1 h-1.5 bg-mist rounded relative overflow-hidden">
                  <motion.div
                    className={cn('absolute inset-y-0', r.tone === 'pos' ? 'bg-emerald-500 left-0' : 'bg-vfRed left-0')}
                    initial={{ width: 0 }} animate={{ width: `${(Math.abs(r.net) / 18420) * 100}%` }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.6 }}
                  />
                </div>
                <span className={cn('font-mono text-[11px] font-bold w-[64px] text-right', r.tone === 'pos' ? 'text-emerald-700' : 'text-vfRed')}>
                  {r.net > 0 ? '+' : ''}{r.net.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </ul>
          <div className="text-[10px] text-ink-muted mt-2">Net upgrade flow +49k subs · downgrade −2.8k · churn −5.5k · gross-add 18k via PAYG → SIM-only ladder.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Lifecycle · acquire / retain / decline</div>
              <h3 className="text-sm font-extrabold text-ink">Plan lifecycle stage</h3>
            </div>
            <span className="vf-chip bg-mist text-ink text-[9px] font-bold">growth × share</span>
          </div>
          <PlanLifecycleMatrix />
          <div className="text-[10px] text-ink-muted mt-2">Star = SnowFlex (high growth + rising share) · Cash-cow = 5G 30 GB (mature, big base) · Question = 5G SA Max (high margin, niche) · Dog = PAYG (declining, low growth).</div>
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Catalog publish audit</div>
              <h3 className="text-sm font-extrabold text-ink">Recent versions</h3>
            </div>
            <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px] font-bold">CAB-approved</span>
          </div>
          <ul className="space-y-1.5 text-[11.5px]">
            {[
              { v: 'v2026.05.13', when: '2h ago',  who: 'C. Owens (CAB)',  desc: 'Roaming Pass EU+US — bundle 5G SA Pro · effective 14 May', tag: 'Bundle' },
              { v: 'v2026.05.06', when: '7d ago',  who: 'M. Hughes',        desc: 'Disney+ 2 mo free — A/B vs cashback (5% holdout)',         tag: 'A/B' },
              { v: 'v2026.04.29', when: '14d ago', who: 'A. Khan',          desc: 'iPhone 16 Pro 256 GB — finance terms updated to 24 mo',     tag: 'Device' },
              { v: 'v2026.04.22', when: '21d ago', who: 'C. Owens (CAB)',  desc: 'PAYG top-up bundle re-priced (£10 → £12 with 50% data uplift)', tag: 'Pricing' },
              { v: 'v2026.04.15', when: '28d ago', who: 'M. Hughes',        desc: 'SnowFlex 30 SIM-only launch (no contract, EU roaming inc.)',   tag: 'New plan' },
            ].map((r) => (
              <li key={r.v} className="border-b border-mist-dark/60 pb-1.5 flex items-start gap-2">
                <span className="vf-chip bg-mist text-ink-muted text-[9px] font-mono shrink-0">{r.v}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">{r.desc}</div>
                  <div className="text-[10px] text-ink-muted">{r.when} · {r.who}</div>
                </div>
                <span className="vf-chip bg-vfRed-soft text-vfRed-dark text-[9px] shrink-0">{r.tag}</span>
              </li>
            ))}
          </ul>
          <div className="text-[10px] text-ink-muted mt-2">Time Travel: query catalog "as of" any past point · rollback target ≤ 4 min.</div>
        </div>
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Catalog hygiene · Cortex AI_CLASSIFY</div>
            <h3 className="text-sm font-extrabold text-ink">Stale SKUs · auto-retire candidates</h3>
          </div>
          <span className="vf-chip bg-amber/20 text-amber-800 text-[9px] font-bold">12 candidates · pending CAB review</span>
        </div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5">SKU</th>
              <th>Type</th>
              <th className="text-right">Active subs</th>
              <th className="text-right">90d adds</th>
              <th>Last sold</th>
              <th>Reason</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {[
              { sku: 'PLAN-3G-LEGACY', type: 'Plan',   subs: 412,    adds: 0,   last: '184d ago', reason: '3G shutdown 2024-Q4',     rec: 'Migrate to 5G 30 GB (no price change)' },
              { sku: 'DEV-FIN-IP12',   type: 'Device', subs: 1240,   adds: 4,   last: '38d ago',  reason: 'Apple end-of-life',       rec: 'Retire · auto-replace with iP15' },
              { sku: 'ROAM-USA-LEG',   type: 'Add-on', subs: 184,    adds: 2,   last: '74d ago',  reason: 'Superseded by Roaming Pass World', rec: 'Retire · move subs to Roaming Pass' },
              { sku: 'INS-MOB-BASIC',  type: 'Add-on', subs: 6420,   adds: 18,  last: '12d ago',  reason: 'Lower attach than Pro tier',        rec: 'Keep · de-emphasise in checkout' },
              { sku: 'BUN-DISNEY-1MO', type: 'Bundle', subs: 240,    adds: 0,   last: '92d ago',  reason: 'A/B winner used 2-month variant',   rec: 'Retire · variant lost' },
            ].map((r) => (
              <tr key={r.sku} className="border-b border-mist-dark/60">
                <td className="py-1.5 font-mono text-[11px] text-ink-muted">{r.sku}</td>
                <td><span className="vf-chip bg-mist text-ink text-[10px]">{r.type}</span></td>
                <td className="text-right font-mono">{r.subs.toLocaleString()}</td>
                <td className="text-right font-mono">{r.adds}</td>
                <td className="text-ink-muted">{r.last}</td>
                <td className="text-ink-muted">{r.reason}</td>
                <td className="font-bold text-ink">{r.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-ink-muted mt-2">Cortex AI_CLASSIFY scores SKUs daily; flag triggers when 90d adds &lt; 10 AND active subs &lt; 1% of book.</div>
      </div>
    </div>
  );
}

function AttachRateHeatmap() {
  const plans  = ['SA Max', 'SA Pro', '5G 100', '5G 30', 'SnowFlex', 'PAYG'];
  const addons = ['Roaming Pass EU', 'Roaming Pass World', 'Data Boost 10', 'Disney+ bundle', 'Apple Music', 'Insurance Pro', 'Device finance'];
  // Attach rate (0..1)
  const data: number[][] = [
    /* Roaming EU */     [0.74, 0.62, 0.41, 0.22, 0.18, 0.04],
    /* Roaming World */  [0.42, 0.28, 0.12, 0.04, 0.02, 0.01],
    /* Data Boost */     [0.12, 0.18, 0.32, 0.48, 0.18, 0.06],
    /* Disney+ */        [0.62, 0.48, 0.24, 0.10, 0.08, 0.02],
    /* Apple Music */    [0.32, 0.22, 0.10, 0.04, 0.02, 0.00],
    /* Insurance Pro */  [0.41, 0.34, 0.22, 0.14, 0.06, 0.02],
    /* Device finance */ [0.58, 0.52, 0.38, 0.18, 0.04, 0.00],
  ];
  const colorFor = (v: number) => {
    if (v < 0.05) return '#F3F4F6';
    if (v < 0.15) return '#DBEAFE';
    if (v < 0.30) return '#7FBEEB';
    if (v < 0.50) return '#29B5E8';
    return '#11567F';
  };
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `9rem repeat(${plans.length}, minmax(0, 1fr))` }}>
      <div />
      {plans.map((p) => <div key={p} className="text-[9.5px] font-bold text-ink-muted text-center self-end pb-1">{p}</div>)}
      {addons.map((a, r) => (
        <Fragment key={a}>
          <div className="text-[10px] font-bold text-ink pr-2 self-center truncate">{a}</div>
          {data[r].map((v, c) => (
            <motion.div
              key={`${a}-${c}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (r * plans.length + c) * 0.012 }}
              className="aspect-[7/3] rounded-[2px] flex items-center justify-center text-[10px] font-mono font-bold"
              style={{ background: colorFor(v), color: v >= 0.30 ? '#fff' : '#1f2937' }}
              title={`${a} on ${plans[c]}: ${(v * 100).toFixed(0)}%`}
            >
              {(v * 100).toFixed(0)}
            </motion.div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

function PlanLifecycleMatrix() {
  // BCG-style: x = market share %, y = MRR growth %. Bubble size = subs.
  const plans = [
    { name: '5G SA Max',     share: 7,  growth: 12, subs: 1.4,  margin: 51 },
    { name: '5G SA Pro',     share: 18, growth: 8,  subs: 2.1,  margin: 46 },
    { name: '5G 100 GB',     share: 24, growth: 3,  subs: 4.6,  margin: 38 },
    { name: '5G 30 GB',      share: 36, growth: -1, subs: 7.2,  margin: 32 },
    { name: 'SnowFlex 30',   share: 16, growth: 22, subs: 3.9,  margin: 22 },
    { name: 'PAYG',          share: 9,  growth: -8, subs: 1.8,  margin: 18 },
  ];
  const W = 460, H = 220;
  const xMin = 0, xMax = 40;
  const yMin = -12, yMax = 25;
  const xTo = (v: number) => 36 + ((v - xMin) / (xMax - xMin)) * (W - 56);
  const yTo = (v: number) => H - 26 - ((v - yMin) / (yMax - yMin)) * (H - 42);
  // Quadrant colours
  const quadrantColor = (g: number, s: number) => {
    if (g >= 5  && s >= 18) return '#10B981'; // Star
    if (g <  5  && s >= 18) return '#11567F'; // Cash cow
    if (g >= 5  && s <  18) return '#F59E0B'; // Question
    return '#9CA3AF';                         // Dog
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="xMidYMid meet">
      {/* axes & grid */}
      <line x1={36} y1={yTo(0)} x2={W - 20} y2={yTo(0)} stroke="#9CA3AF" strokeDasharray="3 3" />
      <line x1={xTo(18)} y1={10} x2={xTo(18)} y2={H - 24} stroke="#9CA3AF" strokeDasharray="3 3" />
      {/* quadrant labels */}
      <text x={xTo(28)} y={26} fontSize="10" fontWeight="700" fill="#10B981" textAnchor="middle">★ STAR</text>
      <text x={xTo(28)} y={H - 10} fontSize="10" fontWeight="700" fill="#11567F" textAnchor="middle">CASH COW</text>
      <text x={xTo(8)} y={26} fontSize="10" fontWeight="700" fill="#F59E0B" textAnchor="middle">? QUESTION</text>
      <text x={xTo(8)} y={H - 10} fontSize="10" fontWeight="700" fill="#9CA3AF" textAnchor="middle">DOG</text>
      {/* axis ticks */}
      <text x={W / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="#6B7280">market share % →</text>
      <text x={6} y={H / 2} fontSize="9" textAnchor="middle" fill="#6B7280" transform={`rotate(-90 6 ${H / 2})`}>MRR growth % →</text>
      {/* bubbles */}
      {plans.map((p, i) => (
        <motion.g key={p.name} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
          <circle cx={xTo(p.share)} cy={yTo(p.growth)} r={6 + p.subs * 2.4} fill={quadrantColor(p.growth, p.share)} fillOpacity={0.32} stroke={quadrantColor(p.growth, p.share)} strokeWidth="1.6" />
          <text x={xTo(p.share)} y={yTo(p.growth) + 3} fontSize="9.5" fontWeight="700" fill="#1f2937" textAnchor="middle"
            style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3, strokeLinejoin: 'round' }}>{p.name}</text>
          <title>{`${p.name} · share ${p.share}% · growth ${p.growth}% · ${p.subs}M subs · margin ${p.margin}%`}</title>
        </motion.g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Charging & Rating
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import { useEffect as useEff, useState as useSt } from 'react';

export function BssCharging() {
  const [mb, setMb] = useSt(0);
  useEff(() => { const t = setInterval(() => setMb((x) => x + Math.random() * 12 + 4), 300); return () => clearInterval(t); }, []);
  const cap = 3000; // 3 GB Roaming Pass
  const usedPct = Math.min(100, (mb / cap) * 100);

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Charging & Rating</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">Real-time online charging</h1>
        <p className="text-xs text-ink-muted">Live OCS view (Ericsson Charging System): a roaming session being rated, balance debited, policy enforced via Ericsson PCRF/PCF.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Sessions / sec" value="14,600" />
        <Kpi label="Charge events / sec" value="32,400" />
        <Kpi label="Avg rate latency" value="42 ms" tone="good" />
        <Kpi label="Reservation accuracy" value="99.992%" tone="good" />
        <Kpi label="Rejected calls" value="0.04%" tone="good" />
        <Kpi label="Bill-cycle leakage" value="0.07%" delta="−0.04pp" tone="good" />
      </div>

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Sessions / sec · last 60 minutes</div>
          <span className="text-[10px] text-ink-muted">peak 16,840 · trough 11,920</span>
        </div>
        <LineChart
          height={140}
          series={[
            { name: 'Sessions/s', data: [12400, 12800, 13200, 13900, 14400, 14600, 14820, 15400, 15800, 16100, 16400, 16840, 16500, 16200, 15800, 15400, 15100, 14700, 14400, 14600] },
            { name: 'Charge events/s × 0.5', data: [13800, 14000, 14600, 15400, 16100, 16200, 16400, 17100, 17600, 17900, 18200, 18600, 18400, 18100, 17600, 17200, 16800, 16400, 16100, 16200] },
          ]}
          labels={['-60m', '-50m', '-40m', '-30m', '-20m', '-10m', 'now']}
          colors={['#29B5E8', '#F59E0B']}
        />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live session</div>
                <div className="font-bold text-ink">CUST-002 · roaming in Spain · Roaming Pass EU active</div>
              </div>
              <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px] animate-pulse">CHARGING</span>
            </div>
            <div className="text-[12px] text-ink-muted mb-1.5">Bundle used</div>
            <div className="h-3 rounded-full bg-mist overflow-hidden">
              <motion.div className="h-full bg-vfRed" animate={{ width: `${usedPct}%` }} transition={{ duration: 0.2 }} />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span className="font-mono text-ink-muted">0 MB</span>
              <span className="font-mono font-bold text-ink">{mb.toFixed(0)} MB / {cap} MB</span>
              <span className="font-mono text-ink-muted">{cap} MB</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Kpi label="Reserved" value={`${(Math.min(cap, mb + 50)).toFixed(0)} MB`} />
              <Kpi label="Rated this min" value={`${(mb / 60).toFixed(0)} MB`} />
              <Kpi label="Rate £/MB" value="£0.00" delta="bundle covers" tone="good" />
            </div>

            <div className="mt-4 rounded-lg bg-mist/60 border border-mist-dark p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Diameter Gy flow</div>
              <ol className="text-[11.5px] text-ink space-y-0.5 list-decimal list-inside">
                <li>CCR-Initial → reserve quota 50 MB</li>
                <li>OCS validates Roaming Pass entitlement (active, EU)</li>
                <li>CCA-Initial OK · grant 50 MB</li>
                <li>Periodic CCR-Update every 30s with usage</li>
                <li>CCR-Terminate at session end · final reconciliation</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Policy enforcement</div>
            <ul className="text-[12px] text-ink space-y-1">
              <li>• PCRF/PCF binding: roaming.eu_pass</li>
              <li>• QoS class: 5G default bearer</li>
              <li>• Throttle threshold: at 90% bundle → SMS warn</li>
              <li>• Hard cap: 100% → throttle to 64 kbps</li>
              <li>• Bill-shock guard: confirm before extra charges</li>
            </ul>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Rate plan tariff</div>
            <table className="w-full text-[11.5px]">
              <thead><tr className="text-left text-[10px] text-ink-muted"><th>Service</th><th>Rate</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>Voice (UK)</td><td className="font-mono">£0/min</td><td className="text-ink-muted">in-bundle</td></tr>
                <tr><td>Voice (EU)</td><td className="font-mono">£0/min</td><td className="text-ink-muted">EU-Roam Reg.</td></tr>
                <tr><td>SMS (EU)</td><td className="font-mono">£0/SMS</td><td className="text-ink-muted">EU-Roam Reg.</td></tr>
                <tr><td>Data (UK)</td><td className="font-mono">£0/MB</td><td className="text-ink-muted">in-bundle</td></tr>
                <tr><td>Data (EU)</td><td className="font-mono">£0/MB</td><td className="text-ink-muted">3 GB Roaming Pass</td></tr>
                <tr><td>Data (World)</td><td className="font-mono">£6/day</td><td className="text-ink-muted">Roaming Pass World</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Charging traffic heatmap · 7 days × 24h (sessions/sec, k)</div>
          <ChargingHeatmap />
          <div className="text-[10px] text-ink-muted mt-2">Peak Friday 18:00–22:00 + Saturday all-day · roaming spike on weekends · capacity reservation auto-tuned 60 min ahead via <span className="font-mono">queue_forecast_v2</span>.</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top roaming destinations · last 7d</div>
          <Treemap items={[
            { label: 'Spain',     value: 84, margin: 0.42 },
            { label: 'France',    value: 56, margin: 0.38 },
            { label: 'Italy',     value: 42, margin: 0.36 },
            { label: 'Portugal',  value: 32, margin: 0.34 },
            { label: 'Greece',    value: 28, margin: 0.32 },
            { label: 'Germany',   value: 24, margin: 0.40 },
            { label: 'USA',       value: 18, margin: 0.58 },
            { label: 'Netherlands', value: 14, margin: 0.36 },
            { label: 'UAE',       value: 8,  margin: 0.62 },
            { label: 'Other',     value: 16, margin: 0.30 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">size = roaming minutes (M) · colour = margin · USA + UAE highest margin (Pay-Per-Day model) · EU corridors regulated cap.</div>
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Rate latency distribution · last 1h (ms)</div>
        <Histogram
          mean={2}
          buckets={[
            { label: '<20ms',    count: 4820 },
            { label: '20-40ms',  count: 18420 },
            { label: '40-60ms',  count: 12480 },
            { label: '60-80ms',  count: 4820 },
            { label: '80-120ms', count: 1840 },
            { label: '120-180ms',count: 480 },
            { label: '180-300ms',count: 120 },
            { label: '300-500ms',count: 38 },
            { label: '>500ms',   count: 8 },
          ]}
          height={140}
        />
        <div className="text-[10px] text-ink-muted mt-2">Median 42 ms · P95 96 ms · P99 184 ms · SLA 500 ms · 8 events &gt; 500ms auto-retried (idempotent reservation API).</div>
      </div>
    </div>
  );
}

function ChargingHeatmap() {
  const days  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = ['00','03','06','09','12','15','18','21'];
  // values 0..1 — peak Fri eve + Sat
  const data: number[][] = [
    [0.18, 0.12, 0.10, 0.42, 0.66, 0.72, 0.78, 0.42],
    [0.22, 0.14, 0.10, 0.42, 0.62, 0.70, 0.74, 0.40],
    [0.20, 0.12, 0.10, 0.44, 0.66, 0.74, 0.78, 0.42],
    [0.22, 0.14, 0.12, 0.46, 0.70, 0.78, 0.82, 0.46],
    [0.24, 0.16, 0.14, 0.48, 0.74, 0.84, 0.96, 0.84],
    [0.32, 0.20, 0.18, 0.62, 0.84, 0.92, 0.94, 0.78],
    [0.36, 0.22, 0.16, 0.56, 0.74, 0.82, 0.78, 0.62],
  ];
  const colorFor = (v: number) => {
    if (v < 0.2) return '#DBEAFE';
    if (v < 0.4) return '#7FBEEB';
    if (v < 0.6) return '#29B5E8';
    if (v < 0.8) return '#11567F';
    return '#0B3A56';
  };
  return (
    <div>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `3.6rem repeat(${hours.length}, minmax(0, 1fr))` }}>
        <div />
        {hours.map((h) => <div key={h} className="text-[9.5px] text-ink-muted text-center">{h}</div>)}
        {days.map((d, r) => (
          <Fragment key={d}>
            <div className="text-[10px] font-bold text-ink pr-2 self-center">{d}</div>
            {data[r].map((v, c) => (
              <motion.div
                key={`${d}-${c}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (r * 8 + c) * 0.012 }}
                className="aspect-[3/2] rounded-[2px] flex items-center justify-center text-[9.5px] font-mono font-bold"
                style={{ background: colorFor(v), color: v >= 0.6 ? '#fff' : '#1f2937' }}
                title={`${d} ${hours[c]}:00 — ${(v * 18.4).toFixed(1)}k sessions/s`}
              >
                {(v * 18.4).toFixed(0)}
              </motion.div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
const dunningStages = [
  { stage: 'D+0 — Bill issued', count: 12_400_000, tone: 'neutral' as const },
  { stage: 'D+14 — Friendly reminder (SMS + email)', count: 84_200, tone: 'neutral' as const },
  { stage: 'D+21 — Phone reminder (auto)', count: 38_100, tone: 'warn' as const },
  { stage: 'D+30 — Service partial restriction', count: 12_840, tone: 'warn' as const },
  { stage: 'D+45 — Final notice', count: 4_120, tone: 'bad' as const },
  { stage: 'D+60 — Suspension', count: 1_640, tone: 'bad' as const },
  { stage: 'D+90 — Disconnect & DCA', count: 420, tone: 'bad' as const },
];

export function BssCollections() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Collections</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">Dunning & predictive recovery</h1>
        <p className="text-xs text-ink-muted">Pre-delinquency model (Snowpark ML) + tone-of-voice variants + payment-plan offers — orchestrated through Salesforce Service Cloud and Sinch SMS, with hand-off to a TCC-accredited DCA panel.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Open balance" value="£14.2M" tone="warn" />
        <Kpi label="DSO (days)" value="32" delta="−4d YoY" tone="good" />
        <Kpi label="Recovery rate" value="92%" delta="+3pp" tone="good" />
        <Kpi label="Bad-debt %" value="0.6%" delta="−0.2pp" tone="good" />
        <Kpi label="Predictive saves" value="2,840" delta="last 30d" tone="good" />
        <Kpi label="Payment plans active" value="14,200" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Dunning funnel</div>
            <Funnel
              stages={dunningStages.map((s) => ({ label: s.stage, value: s.count, tone: s.tone }))}
            />
          </div>
          <div className="vf-card p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">DSO trend · last 12 months · SLA bands</div>
              <span className="text-[11px] font-mono font-bold text-emerald-600">32 days · −4d YoY</span>
            </div>
            <BandedLineChart
              data={[36, 36, 35, 35, 35, 34, 34, 33, 33, 33, 32, 32]}
              bands={[
                { color: '#10B981', min: 0,  max: 30 },
                { color: '#F59E0B', min: 30, max: 35 },
                { color: '#E11D48', min: 35, max: 50 },
              ]}
              height={150}
              label="green ≤ 30d (SLA) · amber 30–35d · red > 35d · 12-month trend trending out of red into green band."
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Predictive recovery</div>
            <ul className="text-[12px] text-ink space-y-1">
              <li>• Pre-delinquency model (Snowpark ML) scored daily</li>
              <li>• Tone-of-voice variants (formal · empathetic · firm)</li>
              <li>• Payment-plan eligibility auto-evaluated</li>
              <li>• Vulnerability flag (Ofcom GC C5) — soft path only</li>
              <li>• Hardship scheme: 6 months interest-free</li>
            </ul>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Compliance</div>
            <div className="text-[12px] text-ink-muted">FCA Treating Customers Fairly · Ofcom GC C4 (vulnerability) · ICO ICO data-protection · Pre-action protocol pre-court · DCA accreditation check.</div>
          </div>
        </div>
      </div>
      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">IFRS 9 ECL provision · bad-debt model</div>
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px]">Bayesian survival · bad_debt_ecl_v3 · drift OK</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
          <CollKpi label="ECL provision" value="£24.4M" delta="+£0.8M MoM" tone="warn" />
          <CollKpi label="Stage 1 (12mo ECL)" value="£18.2M" delta="+0.4pp" tone="neutral" />
          <CollKpi label="Stage 2 (lifetime)" value="£4.8M" delta="+1.4pp migration" tone="warn" />
          <CollKpi label="Stage 3 (impaired)" value="£1.4M" delta="+£0.2M" tone="bad" />
        </div>
        <Ecl />
        <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.ecl_provisions</span> · macro overlay: base case · IFRS 9 audit-ready.</div>
      </div>
      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">14-day cash inflow forecast · Prophet + XGBoost</div>
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px]">cash_forecast_v3 · MAPE 4.2% · drift OK</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <CollKpi label="14-day forecast" value="£142M" delta="+£8.4M vs prior" tone="good" />
          <CollKpi label="DD inflow" value="£124M" delta="98.4% success" tone="good" />
          <CollKpi label="Late renewals" value="−£2.0M" delta="risk band" tone="warn" />
          <CollKpi label="DSO improvement" value="+£1.4M" delta="vs base" tone="good" />
        </div>
        <CashForecast />
        <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.cash_forecast</span> · feeds CFO daily brief.</div>
      </div>
    </div>
  );
}

function CollKpi({ label, value, delta, tone = 'neutral' }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</div>
      {delta && <div className={`text-[10px] mt-0.5 ${toneCls}`}>{delta}</div>}
    </div>
  );
}

function Ecl() {
  const items = [
    { label: 'Q-open ECL',          value: 22400, tone: 'total' as const },
    { label: 'New Stage 1',         value: 1840,  tone: 'pos'   as const },
    { label: 'Migrate to Stage 2',  value: 2240,  tone: 'pos'   as const },
    { label: 'Migrate to Stage 3',  value: 1080,  tone: 'pos'   as const },
    { label: 'Recoveries',          value: -1820, tone: 'neg'   as const },
    { label: 'Write-offs',          value: -1340, tone: 'neg'   as const },
    { label: 'Q-close ECL',         value: 24400, tone: 'total' as const },
  ];
  return (
    <div className="space-y-1">
      {items.map((it, i) => {
        const max = 24400;
        const pct = (Math.abs(it.value) / max) * 100;
        const color = it.tone === 'total' ? '#11567F' : it.tone === 'pos' ? '#E11D48' : '#10B981';
        return (
          <div key={i} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-[170px] shrink-0 font-bold text-ink truncate">{it.label}</span>
            <div className="flex-1 h-3 bg-mist rounded relative overflow-hidden">
              <div className="absolute inset-y-0 left-0" style={{ background: color, width: `${pct}%` }} />
            </div>
            <span className="font-mono w-[80px] text-right font-bold" style={{ color }}>£{(it.value / 1000).toFixed(1)}k</span>
          </div>
        );
      })}
    </div>
  );
}

function CashForecast() {
  const actual = [4.2, 4.4, 4.1, 4.6, 4.8, 5.0, 4.9, 5.2, 5.1, 5.4, 5.3, 5.6, 5.4, 5.7];
  const forecast = [5.6, 5.4, 5.5, 5.2, 5.3, 5.4, 5.6, 5.5, 5.4, 5.6, 5.7, 5.8, 5.9, 6.0];
  const lo = forecast.map((v) => v - 0.4);
  const hi = forecast.map((v) => v + 0.4);
  const series = [...actual, ...forecast];
  const loFull = [...actual, ...lo];
  const hiFull = [...actual, ...hi];
  return (
    <div>
      <AreaChart data={series} color="#11567F" height={150} band={{ lo: loFull, hi: hiFull }} />
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-ink-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#11567F]" />Actual + forecast</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: '#11567F', opacity: 0.25 }} />80% confidence band</span>
        <span className="flex-1 text-right">Day 14 = today · MAPE 4.2% · band ±£0.4M.</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Assurance & Fraud
// ─────────────────────────────────────────────────────────────────────────────
const raSignals = [
  { id: 'IRSF-2026-0508-014', type: 'IRSF (premium-rate)', amount: '£18,420', cust: 'B2B-9821', state: 'Investigating', risk: 0.92 },
  { id: 'WANGIRI-2026-0508-002', type: 'Wangiri callback', amount: '£420', cust: '4,210 customers', state: 'Auto-blocked', risk: 0.97 },
  { id: 'LEAK-2026-0508-007', type: 'Mediation leakage', amount: '£12,800', cust: '—', state: 'Open', risk: 0.78 },
  { id: 'SIMBOX-2026-0508-001', type: 'SIM-box (bypass)', amount: '£42,180', cust: '—', state: 'Investigating', risk: 0.88 },
  { id: 'RR-2026-0508-031', type: 'Roaming reconciliation', amount: '£8,420', cust: '—', state: 'Resolved', risk: 0.62 },
];

export function BssRevenueAssurance() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Revenue Assurance</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">Leakage & fraud monitoring</h1>
        <p className="text-xs text-ink-muted">Mediation → rating → billing reconciliation across Amdocs CES + Ericsson Charging System, plus fraud detection (IRSF, Wangiri, SIM-box). Powered by AISQL (AI_AGG, AI_FILTER) anomaly detection.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Leakage (detected)" value="£82.4k" tone="warn" delta="last 30d" />
        <Kpi label="Leakage / revenue" value="0.07%" tone="good" delta="−0.04pp" />
        <Kpi label="Fraud cases" value="14" tone="bad" />
        <Kpi label="Loss prevented" value="£2.4M" tone="good" delta="YTD" />
        <Kpi label="False positive" value="3.1%" tone="good" delta="−1.2pp" />
        <Kpi label="Auto-resolution" value="71%" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Loss prevented by fraud type · YTD</div>
          <HBar
            data={[
              { label: 'IRSF (premium-rate)', value: 980_000, sub: '34 cases · auto-blocked' },
              { label: 'SIM-box bypass', value: 720_000, sub: '12 cases · investigation' },
              { label: 'Wangiri callback', value: 340_000, sub: '4,210 customers protected' },
              { label: 'Mediation leakage', value: 240_000, sub: 'reconciliation backlog' },
              { label: 'Roaming reconciliation', value: 120_000, sub: 'TAP3 mismatches' },
            ]}
            formatter={(v) => `£${(v / 1000).toFixed(0)}k`}
            color="#11567F"
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Leakage rate · last 12 months</div>
          <LineChart
            height={140}
            series={[{ name: 'Leakage %', data: [0.18, 0.16, 0.15, 0.14, 0.14, 0.13, 0.12, 0.11, 0.10, 0.09, 0.08, 0.07] }]}
            labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']}
            colors={['#10B981']}
          />
          <div className="text-[10px] text-ink-muted mt-1">AISQL anomaly detection on mediation→rating delta surfaced 0.11pp YoY improvement.</div>
        </div>
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">ID</th>
              <th className="py-1.5 px-2">Type</th>
              <th className="py-1.5 px-2">Customer</th>
              <th className="py-1.5 px-2 text-right">Amount</th>
              <th className="py-1.5 px-2 text-right">Risk</th>
              <th className="py-1.5 px-2">State</th>
            </tr>
          </thead>
          <tbody>
            {raSignals.map((r) => (
              <tr key={r.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{r.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{r.type}</td>
                <td className="py-1.5 px-2 text-ink-muted">{r.cust}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold">{r.amount}</td>
                <td className="py-1.5 px-2 text-right">
                  <span className={cn('vf-chip text-[10px] font-mono', r.risk > 0.9 ? 'bg-vfRed text-white' : r.risk > 0.7 ? 'bg-amber/30 text-amber-900' : 'bg-mist text-ink-muted')}>{r.risk.toFixed(2)}</span>
                </td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', r.state === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : r.state === 'Auto-blocked' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/20 text-amber-800')}>{r.state}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">RA · 90-day backlog</div>
            <h3 className="text-sm font-extrabold text-ink">Leakage by root-cause · Pareto 80/20</h3>
          </div>
          <span className="vf-chip bg-mist text-ink text-[9px] font-bold">£ recoverable · per category</span>
        </div>
        <ParetoChart height={210} items={[
          { label: 'Mediation gap',    value: 184 },
          { label: 'Roaming TAP3',     value: 142 },
          { label: 'Wholesale recon',  value: 96 },
          { label: 'Promo over-grant', value: 68 },
          { label: 'Disputes',         value: 42 },
          { label: 'Fraud (IRSF)',     value: 38 },
          { label: 'Order fallout',    value: 24 },
          { label: 'Other',            value: 16 },
        ]} />
        <div className="text-[10px] text-ink-muted mt-2">3 categories (mediation + TAP3 + wholesale) = 65% of recoverable revenue · prioritise these for fix-once-recover-everywhere.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty
// ─────────────────────────────────────────────────────────────────────────────
const rewards = [
  { name: 'Free coffee Mondays (Costa)', redeemed: 184_200, partner: 'Costa Coffee' },
  { name: 'Cinema tickets BOGOF', redeemed: 92_800, partner: 'Cineworld' },
  { name: 'Spotify Premium 3 months free', redeemed: 41_400, partner: 'Spotify' },
  { name: 'Apple Music 3 months free', redeemed: 28_200, partner: 'Apple' },
  { name: '£5 Just Eat voucher', redeemed: 142_700, partner: 'Just Eat' },
  { name: 'Disney+ 2 months free', redeemed: 38_900, partner: 'Disney' },
];

export function BssLoyalty() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Loyalty</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">SnowTelco Rewards</h1>
        <p className="text-xs text-ink-muted">Tiered loyalty programme with partner perks, mission-style challenges and tenure milestones — fulfilled via Salesforce Loyalty Management, redeemable in-app.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Active members" value="11.2M" delta="+1.4M YoY" tone="good" />
        <Kpi label="Engagement rate" value="62%" delta="+8pp" tone="good" />
        <Kpi label="Avg redemptions / mo" value="3.4" />
        <Kpi label="Churn (members)" value="0.6%" delta="−1.4pp vs non-members" tone="good" />
        <Kpi label="NPS lift" value="+12" delta="vs non-members" tone="good" />
        <Kpi label="Partner spend" value="£8.4M" delta="last 30d" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top redemptions (this month)</div>
            <HBar
              data={rewards.map((r) => ({ label: r.name, value: r.redeemed, sub: r.partner }))}
              formatter={(v) => v.toLocaleString()}
              color="#29B5E8"
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tier distribution</div>
            <Donut
              data={[
                { label: 'Bronze (0–12m)', value: 4_200_000, color: '#F59E0B' },
                { label: 'Silver (12–36m)', value: 3_800_000, color: '#94A3B8' },
                { label: 'Gold (36m+)', value: 2_600_000, color: '#FBBF24' },
                { label: 'Platinum', value: 600_000, color: '#11567F' },
              ]}
              formatter={(v) => `${(v / 1_000_000).toFixed(2)}M`}
              size={140}
            />
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tier model</div>
            <ul className="text-[12px] text-ink space-y-1">
              <li><b>Bronze</b> — 0–12 months tenure</li>
              <li><b>Silver</b> — 12–36 months</li>
              <li><b>Gold</b> — 36+ months · all bundles available</li>
              <li><b>Platinum</b> — high-CLV invite-only · concierge support</li>
            </ul>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Mission-style challenges</div>
            <div className="text-[12px] text-ink-muted">"Watch 3 hours on Disney+ this weekend" · "Use 5G in 3 different cities" · "Refer a friend" — gamified, opt-in, GDPR-compliant.</div>
          </div>
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Member engagement funnel · last 30 days</div>
        <Funnel
          stages={[
            { label: 'Members enrolled',    value: 11200000, tone: 'neutral' },
            { label: 'Active (login 30d)',  value: 6944000,  tone: 'good' },
            { label: 'Earned this month',   value: 4480000,  tone: 'good' },
            { label: 'Redeemed this month', value: 1840000,  tone: 'good' },
            { label: 'Multi-redeemer (≥2)', value: 624000,   tone: 'good' },
            { label: 'Tier-up this month',  value: 184000,   tone: 'good' },
          ]}
          formatter={(v) => v.toLocaleString()}
        />
        <div className="text-[10px] text-ink-muted mt-2">62% engagement (login 30d) · 16% redeem · 1.6% tier-up · members churn 1.4pp lower than non-members (programme ROI 4.2× on partner spend).</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Redemption ROI · cost vs ARPU lift per offer</div>
          <StackedDeltaBars items={[
            { label: 'Disney+ 2 mo free',     value: 1.84, delta: +5.2 },
            { label: 'Free coffee Mondays',   value: 0.42, delta: +1.6 },
            { label: '£5 Just Eat voucher',   value: 0.52, delta: +1.2 },
            { label: 'Spotify 3 mo free',     value: 0.96, delta: +3.4 },
            { label: 'Cinema BOGOF',          value: 0.62, delta: +2.0 },
            { label: 'Apple Music 3 mo free', value: 0.74, delta: +2.6 },
            { label: 'Roaming Pass · gift',   value: 1.24, delta: +6.4 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">value = £M monthly cost · delta = ARPU pp lift · Roaming Pass gift highest ROI (+6.4pp uplift) · Disney+ + Spotify drive Premium retention.</div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tier-up rate · last 12 months</div>
          <BandedLineChart
            data={[1.0, 1.1, 1.2, 1.2, 1.3, 1.4, 1.4, 1.5, 1.5, 1.6, 1.6, 1.6]}
            bands={[
              { color: '#E11D48', min: 0,   max: 0.8 },
              { color: '#F59E0B', min: 0.8, max: 1.5 },
              { color: '#10B981', min: 1.5, max: 3 },
            ]}
            height={150}
            label="red < 0.8% (engagement risk) · amber 0.8–1.5% · green ≥ 1.5% (target) · trended into green band 4 weeks ago via mission-challenge launch."
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// B2B / Enterprise
// ─────────────────────────────────────────────────────────────────────────────
const tenants = [
  { id: 'BARCLAYS', name: 'Barclays plc', lines: '42,000', mrr: '£1,008k', sla: '99.95%', breaches: 0, slice: 'eMBB+URLLC' },
  { id: 'BBC', name: 'BBC', lines: '6,400', mrr: '£115k', sla: '99.95%', breaches: 0, slice: 'eMBB' },
  { id: 'TFL', name: 'Transport for London', lines: '18,200', mrr: '£146k', sla: '99.99%', breaches: 1, slice: 'mMTC' },
  { id: 'NHS-MH', name: 'NHS Manchester', lines: '4,800', mrr: '£134k', sla: '99.99%', breaches: 0, slice: 'URLLC' },
  { id: 'JLR', name: 'Jaguar Land Rover', lines: '12,400', mrr: '£521k', sla: '99.95%', breaches: 0, slice: 'Private 5G' },
];

export function BssB2B() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Enterprise (B2B)</div>
        <h1 className="text-2xl font-extrabold text-ink leading-tight">Account hierarchy & SLA</h1>
        <p className="text-xs text-ink-muted">B2B accounts, MSAs, custom rate plans, slice-aware SLAs and e-bonding to enterprise procurement (SAP Ariba) & ticketing (ServiceNow CSM ↔ customer ITSM).</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kpi label="Enterprise tenants" value="412" />
        <Kpi label="Total lines" value="2.42M" />
        <Kpi label="MRR" value="£48.4M" delta="+£1.2M MoM" tone="good" />
        <Kpi label="Open SLA breaches" value="3" tone="warn" />
        <Kpi label="Slice instances" value="184" />
        <Kpi label="Custom MSAs" value="287" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">MRR by top tenant</div>
          <HBar
            data={tenants.map((t) => ({ label: t.name, value: parseFloat(t.mrr.replace(/[£k ]/g, '')) }))}
            formatter={(v) => `£${v}k`}
            color="#11567F"
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Slice mix · enterprise lines</div>
          <Donut
            data={[
              { label: 'eMBB', value: 1_240_000, color: '#29B5E8' },
              { label: 'URLLC', value: 480_000, color: '#10B981' },
              { label: 'mMTC', value: 480_000, color: '#F59E0B' },
              { label: 'Private 5G', value: 220_000, color: '#11567F' },
            ]}
            formatter={(v) => `${(v / 1_000_000).toFixed(2)}M`}
            size={140}
          />
        </div>
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top tenants</div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Account</th>
              <th className="py-1.5 px-2 text-right">Lines</th>
              <th className="py-1.5 px-2 text-right">MRR</th>
              <th className="py-1.5 px-2">SLA</th>
              <th className="py-1.5 px-2">Slice</th>
              <th className="py-1.5 px-2 text-right">Breaches (90d)</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-bold text-ink">{t.name} <span className="text-[10px] font-mono text-ink-muted">({t.id})</span></td>
                <td className="py-1.5 px-2 text-right font-mono">{t.lines}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold">{t.mrr}</td>
                <td className="py-1.5 px-2 font-mono">{t.sla}</td>
                <td className="py-1.5 px-2"><span className="vf-chip bg-mist text-ink-muted text-[10px]">{t.slice}</span></td>
                <td className="py-1.5 px-2 text-right">
                  <span className={cn('vf-chip text-[10px] font-mono', t.breaches === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-vfRed-soft text-vfRed-dark')}>{t.breaches}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Slice-aware SLAs</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li><b>eMBB</b> — DL ≥ 100 Mbps p50 · 99.95%</li>
            <li><b>URLLC</b> — latency p99 ≤ 10ms · 99.99%</li>
            <li><b>mMTC</b> — devices/km², coverage 99.5%</li>
            <li><b>Private 5G</b> — campus-wide, custom KPIs</li>
          </ul>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">e-bonding integrations</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• ServiceNow ↔ tenant ITSM (CHG/INC two-way sync)</li>
            <li>• Procurement: SAP Ariba (SOX-compliant POs)</li>
            <li>• Custom MSAs versioned in Snowflake (Time Travel rollback)</li>
            <li>• SLA credits auto-computed and applied to invoice</li>
            <li>• TMF 645 for trouble-tickets with major tenants</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Network SLA · last 12 weeks (top tenants)</div>
          <BandedLineChart
            data={[99.42, 99.48, 99.54, 99.60, 99.64, 99.68, 99.72, 99.76, 99.80, 99.82, 99.84, 99.86]}
            bands={[
              { color: '#E11D48', min: 99,   max: 99.5 },
              { color: '#F59E0B', min: 99.5, max: 99.9 },
              { color: '#10B981', min: 99.9, max: 100 },
            ]}
            height={150}
            label="red < 99.5% (SLA credit triggers) · amber 99.5–99.9% · green ≥ 99.9% (URLLC class) · trended into green band 4 weeks ago."
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top enterprise accounts · MRR with QoQ delta</div>
          <StackedDeltaBars items={[
            { label: 'Barclays plc',           value: 1.008, delta: +6.4 },
            { label: 'Jaguar Land Rover',      value: 0.521, delta: +12.8 },
            { label: 'Transport for London',   value: 0.146, delta: +4.2 },
            { label: 'NHS Manchester',         value: 0.134, delta: +18.6 },
            { label: 'BBC',                    value: 0.115, delta: +0.8 },
            { label: 'Stratford Group plc',    value: 0.082, delta: +6.4 },
            { label: 'GreenLeaf Group plc',    value: 0.064, delta: +14.2 },
            { label: 'Polaris Retail Ltd',     value: 0.052, delta: -2.4 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Top 8 = £2.1M MRR (~76% of B2B book) · NHS Manchester +18.6% on URLLC clinical-IoT rollout · JLR Private 5G ramp continues.</div>
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">e-bonding throughput · last 24h (events/h)</div>
        <StackedAreaChart
          series={[
            [184, 180, 178, 176, 174, 178, 188, 220, 268, 320, 380, 412, 432, 444, 448, 432, 408, 372, 332, 292, 252, 218, 196, 188],
            [62, 58, 56, 54, 52, 56, 64, 84, 108, 132, 158, 168, 176, 180, 182, 174, 166, 152, 138, 122, 104, 88, 76, 68],
            [12, 10, 10, 8, 8, 10, 14, 24, 36, 48, 58, 64, 68, 72, 72, 68, 62, 56, 48, 42, 36, 30, 24, 20],
          ]}
          colors={['#11567F', '#29B5E8', '#F59E0B']}
          labels={['Order / change requests', 'Trouble-tickets (TMF 645)', 'SLA credit calculations']}
        />
        <div className="text-[10px] text-ink-muted mt-2">Two-way ServiceNow sync · peak 09:00–14:00 office hours · all events with SOX-compliant audit row in <span className="font-mono">gold.b2b_ebonding</span>.</div>
      </div>
    </div>
  );
}
