import { Check, ChevronRight, ShieldCheck, CreditCard, Smartphone, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePageAutoDrive, AutoDriveControl } from '@/components/shared/AutoDrive';
import { useDemoState } from '@/state/DemoStateProvider';
import { Funnel, Donut, LineChart } from '@/components/shared/Charts';
import { Histogram, BandedLineChart, ParetoChart, UkRegionMap, CortexCompleteDraft } from '@/pages/bss/BssExtended';

interface Step {
  id: string;
  label: string;
  desc: string;
  toolCalls: string[];
  decision: string;
  ms: number;
}

const steps: Step[] = [
  {
    id: 'capture',
    label: 'Order capture',
    desc: 'Customer selects 5G SA Unlimited Max plan + handset upgrade in-app. Consent + marketing prefs captured (GDPR Art.6, Ofcom GC C1).',
    toolCalls: ['cortex.intent.classify(channel=app)', 'tmf622.create_order(catalog_item=PLAN-5GSA-MAX)'],
    decision: 'Order draft ORD-2026-0508-99421',
    ms: 600,
  },
  {
    id: 'identity',
    label: 'Identity & KYC',
    desc: 'Document scan + liveness + sanctions/PEP screening. Risk model returns LOW.',
    toolCalls: ['kyc.docscan(passport)', 'kyc.liveness()', 'sanctions.screen(name+dob)'],
    decision: 'KYC PASS · risk score 0.08 (LOW)',
    ms: 800,
  },
  {
    id: 'credit',
    label: 'Credit check',
    desc: 'Credit-bureau soft-pull (Experian) + internal model. Eligible for 24-month device finance.',
    toolCalls: ['experian.softpull(...)', 'snowflake.credit_model.score(...)'],
    decision: 'APPROVED · device finance £24/mo',
    ms: 700,
  },
  {
    id: 'fraud',
    label: 'Fraud check',
    desc: 'Velocity + device fingerprint + IP geolocation + SIM-swap risk. No anomalies.',
    toolCalls: ['fraud.velocity_check()', 'fraud.device_fingerprint()', 'fraud.simswap_risk()'],
    decision: 'CLEAR · risk 0.02',
    ms: 600,
  },
  {
    id: 'esim',
    label: 'eSIM provisioning',
    desc: 'Reserve MSISDN, generate eSIM profile (SM-DP+ / SM-SR), push QR to app.',
    toolCalls: ['imsi.allocate()', 'msisdn.allocate()', 'esim.generate_profile(SM-DP+)', 'app.push_qr()'],
    decision: 'eSIM 894410016001234567890 ready',
    ms: 900,
  },
  {
    id: 'activation',
    label: 'Network activation',
    desc: 'HSS/UDM provisioning, AUC keys, PCRF policy bind, default APN. End-to-end attach test.',
    toolCalls: ['hss.add_subscriber()', 'pcrf.bind_policy()', 'auc.provision_keys()', 'test.attach_e2e()'],
    decision: 'ATTACHED · default bearer up · IP 100.65.x.x',
    ms: 1100,
  },
  {
    id: 'billing',
    label: 'First bill setup',
    desc: 'Create billing account, prorated charge for current cycle, payment-method tokenisation, first-bill preview emailed.',
    toolCalls: ['billing.create_account()', 'billing.prorate_cycle()', 'pcc.tokenise_card()', 'comms.first_bill_preview()'],
    decision: 'Account BAC-9921 · first bill £18.42 (prorated)',
    ms: 700,
  },
  {
    id: 'welcome',
    label: 'Welcome journey',
    desc: 'Personalised welcome push, plan walkthrough, Roaming Pass eligibility surfaced. Cross-sell Disney+ bundle (eligible).',
    toolCalls: ['cortex.complete(welcome_message)', 'nba.rank_addons()', 'app.push(welcome)'],
    decision: 'Welcome dispatched · 3 NBA add-ons surfaced',
    ms: 600,
  },
];

export default function BssO2A() {
  const { playSpeed } = useDemoState();
  const drive = usePageAutoDrive(steps.length, 800, playSpeed);
  const completed = drive.step;
  const total = steps.length;

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · Manual demo</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Order-to-Activate</h1>
          <p className="text-xs text-ink-muted">Standalone presenter aid: end-to-end acquisition flow. Independent from NOC scenarios.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="vf-chip bg-mist text-ink font-mono text-[11px]">{completed}/{total} steps</span>
          <AutoDriveControl s={drive} label="Run order" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-8 space-y-2">
          {steps.map((s, i) => {
            const isDone = i < completed;
            const isNext = !isDone && completed === i;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn('vf-card p-3 flex gap-3', isDone ? 'border-emerald-300 bg-emerald-50/40' : isNext && drive.playing ? 'border-vfRed shadow-md' : 'border-mist-dark')}
              >
                <div className={cn('w-9 h-9 rounded-lg grid place-items-center shrink-0', isDone ? 'bg-emerald-500 text-white' : isNext && drive.playing ? 'bg-vfRed text-white animate-pulse' : 'bg-mist text-ink-muted')}>
                  {isDone ? <Check className="w-4 h-4" /> : <span className="font-bold text-xs">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm text-ink">{s.label}</div>
                    {isDone && <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]">{s.decision}</span>}
                  </div>
                  <div className="text-[12px] text-ink-muted mt-0.5 leading-snug">{s.desc}</div>
                  <div className="mt-1.5 space-y-0.5">
                    {s.toolCalls.map((t) => (
                      <div key={t} className="font-mono text-[10.5px] text-ink-muted truncate">
                        <span className="text-emerald-700">→</span> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-3">
          <Card title="Order summary" icon={<CreditCard className="w-4 h-4" />}>
            <Row label="Plan" value="5G SA Unlimited Max" />
            <Row label="Handset" value="iPhone 16 Pro · 256 GB" />
            <Row label="Term" value="24 months · £24/mo" />
            <Row label="Add-ons" value="Disney+ bundle (NBA)" />
            <Row label="Channel" value="App · in-app upgrade" />
          </Card>
          <Card title="Compliance" icon={<ShieldCheck className="w-4 h-4" />}>
            <Bullet>GDPR Art.6 lawful basis · contract</Bullet>
            <Bullet>Ofcom GC C1 — clear pre-contract info</Bullet>
            <Bullet>Marketing consent: opt-in (granular)</Bullet>
            <Bullet>Sanctions / PEP — screened</Bullet>
            <Bullet>Audit trail (TMF 622) recorded</Bullet>
          </Card>
          <Card title="Identifiers" icon={<Smartphone className="w-4 h-4" />}>
            <Row label="Order" value="ORD-2026-0508-99421" mono />
            <Row label="MSISDN" value="+44 7700 900 461" mono />
            <Row label="IMSI" value="234150123456789" mono />
            <Row label="ICCID" value="894410016001234567890" mono />
            <Row label="Billing" value="BAC-9921" mono />
          </Card>
          <Card title="Outcome" icon={<Receipt className="w-4 h-4" />}>
            <div className="text-sm text-ink">Activation in <b>~6.0s</b>. Cross-sell of <b>3 add-ons</b> surfaced. First bill £18.42 (prorated). Customer onboarded with full KYC + fraud + eSIM in a single agent-driven flow.</div>
          </Card>
        </div>
      </div>
      <div className="vf-card p-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Order fallout forecast · order_fallout_v2.1</div>
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[9px]">Snowpark XGBoost · AUC 0.91 · drift OK</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <O2aKpi label="Orders in flight" value="14,820" delta="this hour" tone="neutral" />
          <O2aKpi label="At-risk fallout" value="412" delta="prop ≥ 0.6" tone="warn" />
          <O2aKpi label="Auto-remediated" value="248" delta="prevented today" tone="good" />
          <O2aKpi label="Manual triage" value="164" delta="ops queue" tone="neutral" />
          <O2aKpi label="Saved revenue" value="£184k" delta="forecast" tone="good" />
        </div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-7">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark"><tr><th className="text-left py-1.5">Order</th><th>Stage</th><th>Fallout prop</th><th>Reason</th><th>Remediation</th></tr></thead>
              <tbody>
                {[
                  ['ORD-9412', 'Port-in', '0.84', 'PAC mismatch', 'Auto-resend PAC + push'],
                  ['ORD-9408', 'Credit hold', '0.78', 'Bureau pull pending', 'Step-up KYC'],
                  ['ORD-9401', 'Tariff lookup', '0.71', 'Catalog drift v124→v126', 'Catalog refresh'],
                  ['ORD-9398', 'Address validation', '0.62', 'Royal Mail PAF gap', 'In-app address picker'],
                  ['ORD-9374', 'Device IMEI', '0.58', 'IMEI not GSMA', 'Manual review'],
                ].map((r, i) => (
                  <tr key={i} className="border-b border-mist-dark/60"><td className="py-1.5 font-mono">{r[0]}</td><td className="text-center text-ink-muted">{r[1]}</td><td className="text-center font-mono font-bold text-vfRed">{r[2]}</td><td className="text-center text-ink-muted">{r[3]}</td><td className="text-center text-emerald-700 font-bold">{r[4]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Fallout reasons (24h)</div>
            <div className="space-y-1.5 text-[12px]">
              {[
                ['Port-in PAC mismatch', 32, '#E11D48'],
                ['Credit / fraud hold',  22, '#F59E0B'],
                ['Tariff lookup',        18, '#11567F'],
                ['Address validation',   14, '#29B5E8'],
                ['Device IMEI',          8,  '#10B981'],
                ['Network capacity',     6,  '#9CA3AF'],
              ].map(([label, pct, color]) => (
                <div key={label as string} className="flex items-center gap-2">
                  <span className="w-[160px] truncate text-ink">{label as string}</span>
                  <div className="flex-1 h-3 bg-mist rounded relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0" style={{ background: color as string, width: `${(pct as number) * 2.6}%` }} />
                  </div>
                  <span className="font-mono w-[36px] text-right">{pct as number}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.order_fallout_features</span> · feeds activation revenue forecast.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Activation funnel · last 24h</div>
            <span className="text-[10px] text-ink-muted">14,820 → 13,940 live</span>
          </div>
          <Funnel
            stages={[
              { label: 'Order placed',         value: 14820, tone: 'neutral' },
              { label: 'KYC pass',             value: 14620, tone: 'good' },
              { label: 'Credit pass',          value: 14380, tone: 'good' },
              { label: 'Fraud clear',          value: 14310, tone: 'good' },
              { label: 'eSIM provisioned',     value: 14180, tone: 'good' },
              { label: 'Network attached',     value: 14040, tone: 'good' },
              { label: 'First bill live',      value: 13940, tone: 'good' },
              { label: 'Fallout / pending',    value: 880,   tone: 'bad'  },
            ]}
            formatter={(v) => v.toLocaleString()}
          />
          <div className="text-[10px] text-ink-muted mt-2">94.1% straight-through · 5.9% fallout (412 ML-flagged at-risk · 248 auto-remediated · 220 in ops queue).</div>
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Time-to-activate distribution · last 7d</div>
            <span className="text-[10px] font-mono font-bold text-emerald-700">median 6.1s · digital · P95 4.2 min</span>
          </div>
          <Histogram
            mean={3}
            buckets={[
              { label: '<5s',     count: 4180 },
              { label: '5-10s',   count: 6240 },
              { label: '10-30s',  count: 1820 },
              { label: '30s-2m',  count: 880  },
              { label: '2-5m',    count: 542  },
              { label: '5-15m',   count: 348  },
              { label: '15m-1h',  count: 224  },
              { label: '1-4h',    count: 142  },
              { label: '4-24h',   count: 84   },
              { label: '>24h',    count: 22   },
            ]}
            height={150}
          />
          <div className="text-[10px] text-ink-muted mt-2">Long-tail = retail port-ins waiting for losing-carrier release · 1-day Ofcom MNP SLA met on 99.4% of port-ins.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Activation channel mix · last 30d</div>
            <span className="text-[10px] text-ink-muted">184k activations</span>
          </div>
          <Donut data={[
            { label: 'App (in-app upgrade / new line)', value: 52, color: '#11567F' },
            { label: 'Web (snowtelco.co.uk)',           value: 22, color: '#29B5E8' },
            { label: 'Care (voice + chat)',             value: 12, color: '#F59E0B' },
            { label: 'Retail store',                    value: 10, color: '#10B981' },
            { label: 'Partner / MVNO',                  value: 4,  color: '#9CA3AF' },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Digital = 74% (App + Web) · target 80% by EOY · Retail conversion drag from device-finance friction (rejection rate 14%).</div>
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Same-day activation SLA · last 12 weeks</div>
            <span className="text-[10px] font-mono font-bold text-emerald-700">98.4% · target 95%</span>
          </div>
          <BandedLineChart
            data={[94.2, 94.8, 95.1, 95.6, 95.8, 96.2, 96.6, 97.1, 97.4, 97.8, 98.1, 98.4]}
            bands={[
              { color: '#E11D48', min: 90, max: 92 },
              { color: '#F59E0B', min: 92, max: 95 },
              { color: '#10B981', min: 95, max: 100 },
            ]}
            height={150}
            label="red < 92% (Ofcom risk) · amber 92–95% · green ≥ 95% (target) · 12-week trend trending out of amber into green band."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Activation hot-spots · regional volume</div>
            <span className="text-[10px] text-ink-muted">activations / 30d (000s)</span>
          </div>
          <UkRegionMap data={{
            SCOT: 14, NI: 4, NE: 9, NW: 21, YORKS: 16, EM: 12,
            WM: 19, WALES: 7, EAST: 14, LON: 38, SE: 26, SW: 11,
          }} />
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Fallout root-cause · 80/20 Pareto</div>
            <span className="text-[10px] text-ink-muted">last 24h</span>
          </div>
          <ParetoChart height={180} items={[
            { label: 'PAC mismatch',     value: 32 },
            { label: 'Credit hold',      value: 22 },
            { label: 'Tariff drift',     value: 18 },
            { label: 'Address PAF',      value: 14 },
            { label: 'Device IMEI',      value: 8 },
            { label: 'Network capacity', value: 6 },
          ]} />
          <div className="text-[10px] text-ink-muted mt-2">Top-3 root-causes = 72% of fallout · automated remediation playbooks live on PAC mismatch + tariff drift.</div>
        </div>
      </div>

      <CortexCompleteDraft
        title="Cortex Agent · personalised welcome message"
        prompt="draft welcome message for ORD-2026-0508-99421 · 5G SA Max + iP16 Pro · suggest next-best add-ons"
        output={`Hi Alex,

Welcome to SnowTelco — your iPhone 16 Pro is on its way and your 5G SA Unlimited Max plan is already live on your eSIM. You can start using it now.

Three things you'll probably love:

• Roaming Pass EU is included on your plan — no need to buy it before you travel. We've enabled it automatically.
• Disney+ on us for 12 months — tap "Activate Disney+" in the app, takes ~30 seconds. (Worth £95.88.)
• Your first bill is £18.42 (prorated) on 28 May, then £42/month from June. Set up Direct Debit in 2 taps to dodge the £3 paper-bill fee.

Anything I can help with — reply here or chat to us in the app.

— Lucy at SnowTelco`}
      />
    </div>
  );
}

function O2aKpi({ label, value, delta, tone = 'neutral' }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</div>
      {delta && <div className={`text-[10px] mt-0.5 ${toneCls}`}>{delta}</div>}
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[12px]">
      <span className="text-ink-muted">{label}</span>
      <span className={cn('font-bold text-ink truncate', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-[12px] text-ink">
      <ChevronRight className="w-3 h-3 text-vfRed shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
