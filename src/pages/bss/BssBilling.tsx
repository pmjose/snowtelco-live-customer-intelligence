import { Receipt, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePageAutoDrive, AutoDriveControl } from '@/components/shared/AutoDrive';
import { useDemoState } from '@/state/DemoStateProvider';
import { Histogram, BandedLineChart } from '@/pages/bss/BssExtended';
import { Waterfall } from '@/components/shared/Charts';

interface Line { code: string; desc: string; qty: number; rate: string; amount: number; tag?: 'credit' | 'goodwill' | 'usage' | 'rec' }

const lines: Line[] = [
  { code: 'PLAN-5GSA-MAX',     desc: '5G SA Unlimited Max — monthly recurring', qty: 1, rate: '£42.00', amount: 42.00, tag: 'rec' },
  { code: 'DEVICE-IP16P',      desc: 'iPhone 16 Pro 256GB — finance instalment 5/24', qty: 1, rate: '£24.00', amount: 24.00, tag: 'rec' },
  { code: 'ROAM-PASS-EU',      desc: 'Roaming Pass EU — auto-enrolled', qty: 1, rate: '£0.00', amount: 0.00, tag: 'rec' },
  { code: 'USAGE-OOB-DATA',    desc: 'Out-of-bundle data 0.42 GB — included (Roaming Pass)', qty: 1, rate: '£0.00', amount: 0.00, tag: 'usage' },
  { code: 'USAGE-INTL-CALLS',  desc: 'International calls (3 calls, 12 min)', qty: 1, rate: '£3.60', amount: 3.60, tag: 'usage' },
  { code: 'CR-SVC-MANM14',     desc: 'Service credit · MAN-M14 incident 2026-05-08 (Ofcom auto-comp ineligible <2h)', qty: 1, rate: '£5.00', amount: -5.00, tag: 'goodwill' },
  { code: 'CR-LOY-005',        desc: 'Pre-approved retention credit · playbook PB-RT-CRED-005', qty: 1, rate: '£5.00', amount: -5.00, tag: 'credit' },
];

const subtotal = lines.reduce((a, l) => a + l.amount, 0);
const vat = +(subtotal * 0.20).toFixed(2);
const total = +(subtotal + vat).toFixed(2);

const tagCls: Record<string, string> = {
  credit: 'bg-emerald-100 text-emerald-700',
  goodwill: 'bg-emerald-100 text-emerald-700',
  usage: 'bg-amber/20 text-amber-800',
  rec: 'bg-mist text-ink',
};

export default function BssBilling() {
  const { playSpeed } = useDemoState();
  const drive = usePageAutoDrive(lines.length + 1, 700, playSpeed);
  const visibleLines = lines.slice(0, drive.step);
  const showTotals = drive.step >= lines.length;
  const visSubtotal = visibleLines.reduce((a, l) => a + l.amount, 0);
  const visVat = +(visSubtotal * 0.20).toFixed(2);
  const visTotal = +(visSubtotal + visVat).toFixed(2);

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Manual demo</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Bill Cycle Preview · BAC-9921</h1>
          <p className="text-xs text-ink-muted">Standalone presenter aid for the bill-cycle flow. Independent from NOC scenarios.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> Ofcom auto-comp evaluated</span>
          <AutoDriveControl s={drive} label="Build bill" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-8">
          <div className="vf-card p-5">
            <div className="flex items-start justify-between border-b border-mist-dark pb-3 mb-3">
              <div>
                <img src="https://companieslogo.com/img/orig/SNOW-35164165.png?t=1751096598" alt="SnowTelco" className="h-9 mb-2" />
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Invoice · BAC-9921 · 2026-05-31</div>
              </div>
              <div className="text-right text-[11px] text-ink-muted leading-tight">
                <div>Daniel Shah</div>
                <div>123 Bull Street, Birmingham B4 6AT</div>
                <div className="font-mono">MSISDN +44 7700 900 461</div>
                <div className="font-mono">Account BAC-9921</div>
              </div>
            </div>

            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
                <tr className="text-left">
                  <th className="py-1.5">Code</th>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visibleLines.map((l) => (
                    <motion.tr key={l.code} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="border-b border-mist-dark/60">
                      <td className="py-1.5 font-mono text-ink-muted text-[11px]">{l.code}</td>
                      <td className="py-1.5">
                        {l.desc}
                        {l.tag && <span className={cn('ml-2 vf-chip text-[9px] uppercase', tagCls[l.tag])}>{l.tag}</span>}
                      </td>
                      <td className="py-1.5 text-right font-mono">{l.qty}</td>
                      <td className="py-1.5 text-right font-mono">{l.rate}</td>
                      <td className={cn('py-1.5 text-right font-mono font-bold', l.amount < 0 && 'text-emerald-700')}>£{l.amount.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {visibleLines.length === 0 && (
                  <tr><td colSpan={5} className="py-3 text-center text-ink-muted italic text-[11.5px]">Press <b>Build bill</b> to render line items.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} className="py-1.5 text-right font-bold">Subtotal</td><td className="py-1.5 text-right font-mono">£{visSubtotal.toFixed(2)}</td></tr>
                <tr><td colSpan={4} className="py-1.5 text-right font-bold">VAT (20%)</td><td className="py-1.5 text-right font-mono">£{visVat.toFixed(2)}</td></tr>
                <tr className="border-t border-mist-dark"><td colSpan={4} className="py-2 text-right font-extrabold text-ink">Total due 2026-06-15</td><td className="py-2 text-right font-mono font-extrabold text-vfRed">{showTotals ? `£${visTotal.toFixed(2)}` : '—'}</td></tr>
              </tfoot>
            </table>

            <div className="mt-4 p-3 rounded-lg bg-mist/60 border border-mist-dark text-[11.5px] text-ink-muted leading-relaxed">
              You can pay by direct debit, card or bank transfer. Detailed call records are available in your My SnowTelco app. If you think there is an error on this bill, contact us within 60 days under Ofcom General Conditions of Entitlement (GC C7).
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-3">
          <Card title="Bill explanation (agent)" icon={<Sparkles className="w-4 h-4" />}>
            <div className="text-[12px] text-ink leading-snug">
              Your bill is <b>£8.00 lower</b> than usual this month. We applied a <b>£5 service credit</b> for the Manchester M14 incident on 8 May, and a <b>£5 loyalty credit</b> from your retention plan. International call usage was £3.60. Roaming charges were covered by your auto-enrolled Roaming Pass.
            </div>
          </Card>
          <Card title="Compliance" icon={<ShieldCheck className="w-4 h-4" />}>
            <Bullet>Ofcom auto-compensation rule evaluated (incident &lt;2h → ineligible; goodwill applied)</Bullet>
            <Bullet>VAT applied at 20% standard rate (HMRC)</Bullet>
            <Bullet>Billing accuracy controls passed (RA leakage check)</Bullet>
            <Bullet>Goodwill credit policy: max 3 / 12 months — 1 used</Bullet>
            <Bullet>Plain-language explanation generated by Cortex (Ofcom GC C1)</Bullet>
          </Card>
          <Card title="Disputes" icon={<AlertCircle className="w-4 h-4" />}>
            <div className="text-[12px] text-ink-muted">No open dispute. Customer can raise one within 60 days. Predicted dispute risk for this bill: <b className="text-ink">3% (low)</b> — based on absence of bill-shock and presence of explanation.</div>
          </Card>
          <Card title="Predicted CLV impact" icon={<Receipt className="w-4 h-4" />}>
            <div className="text-[12px] text-ink-muted">£10 of credits offset by predicted retention uplift of <b className="text-ink">+£186 CLV</b> over 24 months — margin floor passed.</div>
          </Card>
        </div>
      </div>
      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Bill-shock forecast · next 14 days · bill_shock_v2.4</div>
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px]"><Sparkles className="w-3 h-3" /> Snowpark XGBoost · AUC 0.89 · drift OK</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <Kpi label="At-risk customers" value="18,420" delta="next 14d" tone="warn" />
          <Kpi label="Auto-treated" value="14,180" delta="Roaming Pass push" tone="good" />
          <Kpi label="Forecast bill (severe)" value=">5x avg" delta="412 cases" tone="bad" />
          <Kpi label="Forecast bill (moderate)" value="2-5x avg" delta="2,840 cases" tone="warn" />
          <Kpi label="Avoided bill-shock £" value="£42k/wk" delta="forecast" tone="good" />
        </div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Customer</th><th>Forecast bill</th><th>vs 90d avg</th><th>Driver</th><th>Recommended action</th></tr></thead>
          <tbody>
            {[
              ['CUST-204', '£148', '5.2x', 'Travel pattern + no Roaming Pass', 'Auto-push Roaming Pass'],
              ['CUST-381', '£92',  '3.4x', 'Heavy data 3 days running', 'Usage-cap nudge'],
              ['CUST-512', '£128', '4.8x', 'International call burst', 'Soft cap + apology credit'],
              ['CUST-614', '£74',  '2.8x', 'Bundle add-on overlap', 'Pre-bill clarification SMS'],
            ].map((r, i) => (
              <tr key={i} className="border-b border-mist-dark/60"><td className="py-1.5 font-mono">{r[0]}</td><td className="text-center font-mono font-bold">{r[1]}</td><td className="text-center font-mono text-vfRed">{r[2]}</td><td className="text-center text-ink-muted">{r[3]}</td><td className="text-center text-emerald-700 font-bold">{r[4]}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.bill_shock_features</span> · GDPR Art.6 + Ofcom GC C4 fairness honored.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Bill amount distribution · this cycle</div>
            <span className="text-[10px] text-ink-muted">12.4M bills</span>
          </div>
          <Histogram
            mean={5}
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
            ]}
            height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Mean £24.40 · long-tail above £200 = anomaly candidates · auto-flagged for bill-shock prevention nudges.</div>
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Dispute rate · last 12 weeks</div>
            <span className="text-[11px] font-mono font-bold text-emerald-700">0.32% · target ≤ 0.4%</span>
          </div>
          <BandedLineChart
            data={[0.48, 0.46, 0.44, 0.42, 0.40, 0.38, 0.36, 0.36, 0.34, 0.34, 0.32, 0.32]}
            bands={[
              { color: '#10B981', min: 0,    max: 0.4 },
              { color: '#F59E0B', min: 0.4,  max: 0.6 },
              { color: '#E11D48', min: 0.6,  max: 1.0 },
            ]}
            height={150}
            label="green ≤ 0.4% (target) · amber 0.4–0.6% · red > 0.6% (Ofcom risk) · trended into green band 5 weeks ago."
          />
        </div>
      </div>

      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Average bill explained · variance vs last month</div>
          <span className="vf-chip bg-mist text-ink text-[9px] font-bold">Cortex Complete bill explainer</span>
        </div>
        <Waterfall
          height={200}
          formatter={(v) => `£${v.toFixed(2)}`}
          items={[
            { label: 'Apr base',         value: 23.80, tone: 'total' },
            { label: 'New plan adds',    value: +0.84, tone: 'pos' },
            { label: 'Roaming attach',   value: +0.42, tone: 'pos' },
            { label: 'Cross-sell',       value: +0.32, tone: 'pos' },
            { label: 'Goodwill credits', value: -0.24, tone: 'neg' },
            { label: 'Promo expiry',     value: -0.18, tone: 'neg' },
            { label: 'Bundle discounts', value: -0.56, tone: 'neg' },
            { label: 'May avg',          value: 24.40, tone: 'total' },
          ]}
        />
        <div className="text-[10px] text-ink-muted mt-2">+£0.60 MoM · roaming + new plans drove uplift, partly offset by bundle discount expansion · explainer auto-shipped to CFO daily brief.</div>
      </div>
    </div>
  );
}

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

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">
        {icon}{title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-[12px] text-ink leading-snug">
      <span className="w-1 h-1 rounded-full bg-vfRed shrink-0 mt-1.5" />
      <span>{children}</span>
    </div>
  );
}
