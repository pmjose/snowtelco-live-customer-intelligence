import { useDemoState } from '@/state/DemoStateProvider';
import { stageReached } from '@/state/stages';
import { motion } from 'framer-motion';
import { mlForScenario, type ModelMeta } from '@/data/mlMeta';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

// Small reusable ML badge — sits in the corner of any hero/panel and proves
// "the model said so" with name + score + CI. Kept compact (3 lines max).
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
          {meta.name} · AUC {meta.auc.toFixed(2)} · drift <span className={driftTone}>{meta.drift}</span>
        </div>
      </div>
    </div>
  );
}

// Anomaly detection chart for network-theme scenarios.
// Renders a synthetic 60-min KPI series (PRB utilisation %) with:
//  - a shaded "expected band" around historical baseline,
//  - dots for points the anomaly model flagged,
//  - a dashed forecast tail for the next 30 min.
export function AnomalyChart() {
  const { scenario, stage } = useDemoState();
  const ml = mlForScenario(scenario.id).hero;
  const active = stageReached(stage, 'incident_detected');

  // 60 minutes observed (every 2 min) + 15 min forecast (every 2 min).
  const observed: number[] = [
    62, 64, 63, 65, 66, 65, 67, 68, 70, 72, 74, 78, 82, 88, 91, 93, 95, 96, 96, 95, 94, 93, 92, 91, 90, 88, 86, 85, 84, 83,
  ];
  const forecast: number[] = [82, 80, 77, 73, 68, 63, 58];
  const expected: { lo: number; hi: number }[] = observed.map((_, i) => {
    const base = 65 + Math.sin(i / 6) * 3;
    return { lo: base - 8, hi: base + 8 };
  });
  const anomalyIdx: number[] = observed.map((v, i) => (v > expected[i].hi ? i : -1)).filter((i) => i >= 0);

  const W = 100; // viewBox width units per series point — we'll use percentages
  const total = observed.length + forecast.length;
  const x = (i: number) => (i / (total - 1)) * 100;
  const yMax = 100;
  const yMin = 40;
  const y = (v: number) => 100 - ((v - yMin) / (yMax - yMin)) * 100;

  const pathObs = observed.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const pathForecast = forecast.map((v, i) => {
    const idx = observed.length + i;
    return `${i === 0 ? 'M' : 'L'} ${x(idx)} ${y(v)}`;
  }).join(' ');
  const bandTop = expected.map((e, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(e.hi)}`).join(' ');
  const bandBot = expected.map((e, i) => `L ${x(observed.length - 1 - i)} ${y(expected[observed.length - 1 - i].lo)}`).join(' ');
  const bandPath = `${bandTop} ${bandBot} Z`;

  return (
    <div className="vf-card h-full min-h-[420px] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Anomaly detection · {scenario.city} {scenario.postcode}</div>
          <div className="text-lg font-bold text-ink">PRB utilisation · cluster MAN-01</div>
          <div className="text-xs text-ink-muted mt-0.5">{scenario.cellSitesImpacted} cells · expected band 65±8% · {anomalyIdx.length} anomaly points fired</div>
        </div>
        <MlBadge meta={ml} accent="red" />
      </div>

      <div className="mt-4 flex-1 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Y grid */}
          {[20, 40, 60, 80].map((g) => (
            <line key={g} x1={0} y1={g} x2={100} y2={g} stroke="#e5e7eb" strokeWidth={0.2} />
          ))}
          {/* Expected band */}
          <path d={bandPath} fill="#34d39933" stroke="none" />
          {/* Forecast band tail */}
          <rect x={x(observed.length - 1)} y={0} width={100 - x(observed.length - 1)} height={100} fill="#29B5E81A" />
          {/* Observed line */}
          <path d={pathObs} fill="none" stroke="#111" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
          {/* Forecast (dashed) */}
          <path d={pathForecast} fill="none" stroke="#29B5E8" strokeWidth={0.8} strokeDasharray="2 1.5" vectorEffect="non-scaling-stroke" />
          {/* Anomaly dots */}
          {anomalyIdx.map((i) => (
            <circle key={i} cx={x(i)} cy={y(observed[i])} r={1.4} fill="#E11D48" stroke="#fff" strokeWidth={0.4} />
          ))}
          {/* Forecast endpoint */}
          <circle cx={x(total - 1)} cy={y(forecast[forecast.length - 1])} r={1.2} fill="#29B5E8" />
        </svg>
        <div className="absolute top-1 left-1 text-[9px] text-ink-muted font-mono">100%</div>
        <div className="absolute bottom-1 left-1 text-[9px] text-ink-muted font-mono">40%</div>
        <div className="absolute bottom-1 right-1 text-[9px] text-ink-muted font-mono">T+15m</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-ink-muted font-mono">now</div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted border-t border-mist-dark pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-ink inline-block" /> observed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-300/60" /> expected band</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-vfRed" /> anomaly</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-snowBlue inline-block" style={{ background: '#29B5E8' }} /> forecast</span>
        </div>
        <span className={active ? 'text-vfRed font-bold' : ''}>{active ? `Model ${ml.name} · score ${ml.scoreValue}` : 'Standby'}</span>
      </div>
    </div>
  );
}

// Bill-shock hero panel — replaces the UK map for billing-themed scenarios.
// Bar chart of bill increase vs baseline bucketed across the cohort, with
// the 25% threshold line called out.
export function BillShockHeatmap() {
  const { stage, scenario, isResolved } = useDemoState();
  const active = stageReached(stage, 'incident_detected');
  const ml = mlForScenario(scenario.id).hero;
  const buckets = [
    { range: '0–10%',   count: 240, threshold: false },
    { range: '10–25%',  count: 380, threshold: false },
    { range: '25–40%',  count: 690, threshold: true },
    { range: '40–60%',  count: 420, threshold: true },
    { range: '60–80%',  count: 90,  threshold: true },
    { range: '80%+',    count: 20,  threshold: true },
  ];
  const max = Math.max(...buckets.map((b) => b.count));
  const flagged = buckets.filter((b) => b.threshold).reduce((s, b) => s + b.count, 0);
  return (
    <div className="vf-card h-full min-h-[420px] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Bill-shock cluster · {scenario.city} {scenario.postcode}</div>
          <div className="text-lg font-bold text-ink">Roaming overage distribution</div>
          <div className="text-xs text-ink-muted mt-0.5">{scenario.impactedCustomers.toLocaleString()} customers · post-Easter holiday roaming · Roaming Pass NOT auto-enrolled</div>
        </div>
        <MlBadge meta={ml} accent="red" />
      </div>

      <div className="mt-4 flex-1 flex flex-col gap-3 justify-end">
        {buckets.map((b, i) => (
          <div key={b.range} className="flex items-center gap-3">
            <div className="w-20 text-[11px] text-ink-muted font-semibold tabular-nums">{b.range}</div>
            <div className="flex-1 h-7 bg-mist rounded-md relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.count / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className={b.threshold ? 'h-full bg-vfRed/85' : 'h-full bg-amber/70'}
              />
              {/* 25% threshold line at end of "10-25%" bucket */}
            </div>
            <div className="w-12 text-right font-mono text-xs font-bold text-ink tabular-nums">{b.count}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-ink-muted border-t border-mist-dark pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-vfRed/85" /> Above 25% threshold</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber/70" /> Within tolerance</span>
        </div>
        <span className={active ? 'text-vfRed font-bold' : ''}>{active ? (isResolved ? 'RESOLVED · cohort credited' : 'LIVE · auto-credit + Roaming Pass enrol queued') : 'Standby'}</span>
      </div>
    </div>
  );
}

// Competitive pricing hero panel — replaces the UK map for commercial scenarios.
export function CompetitivePricingPanel() {
  const { stage, scenario } = useDemoState();
  const active = stageReached(stage, 'incident_detected');
  const ml = mlForScenario(scenario.id).hero;
  const tariffs = [
    { brand: 'SnowFlex SIM-only',          price: 22, gb: 30, perks: 'No bundle',          us: true,   highlight: false },
    { brand: 'SnowFlex Boost (proposed)',  price: 22, gb: 60, perks: '+6mo loyalty boost', us: true,   highlight: true },
    { brand: 'Competitor A · Flex 30',     price: 18, gb: 30, perks: 'No bundle',          us: false,  highlight: false },
    { brand: 'Competitor B · Lite',        price: 20, gb: 25, perks: '6mo @ £18',          us: false,  highlight: false },
    { brand: 'Competitor C · Pro Flex',    price: 25, gb: 50, perks: 'Disney+ 6mo',        us: false,  highlight: false },
  ];
  const ourMin = Math.min(...tariffs.filter(t => t.us).map(t => t.price));
  const compMin = Math.min(...tariffs.filter(t => !t.us).map(t => t.price));
  const delta = compMin - ourMin;
  const maxGb = Math.max(...tariffs.map(t => t.gb));
  return (
    <div className="vf-card h-full min-h-[420px] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Competitive landscape · {scenario.city} {scenario.postcode}</div>
          <div className="text-lg font-bold text-ink">SnowFlex SIM-only vs market</div>
          <div className="text-xs text-ink-muted mt-0.5">PAC-request volume +340% in LS2/LS5 · competitor mid-month tariff change matched (Cortex Search)</div>
        </div>
        <MlBadge meta={ml} accent="red" />
      </div>

      <div className="mt-4 flex-1 flex flex-col gap-2.5 justify-end">
        {tariffs.map((t, i) => (
          <div key={t.brand} className={`rounded-lg border ${t.highlight ? 'border-vfRed bg-vfRed-soft/30' : t.us ? 'border-mist-dark bg-mist' : 'border-mist-dark bg-white'} p-2.5`}>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-ink truncate">{t.brand}{t.highlight && <span className="ml-1 text-[10px] text-vfRed">★ NBA</span>}{t.us && !t.highlight && <span className="ml-1 text-[10px] text-ink-muted">us</span>}</div>
                <div className="text-[10px] text-ink-muted">{t.perks}</div>
              </div>
              <div className="text-sm font-mono font-bold text-ink w-16 text-right">£{t.price}</div>
              <div className="w-32 h-2 rounded bg-mist relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(t.gb / maxGb) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={t.highlight ? 'h-full bg-vfRed' : t.us ? 'h-full bg-ink' : 'h-full bg-ink-muted/50'}
                />
              </div>
              <div className="w-12 text-right text-[11px] font-mono text-ink-muted tabular-nums">{t.gb}GB</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted border-t border-mist-dark pt-3">
        <span>Bars = data allowance · sorted by value-for-money</span>
        <span className={active ? 'text-vfRed font-bold' : ''}>{active ? 'Retention NBA armed · margin floor 2.4× ROI' : 'Standby'}</span>
      </div>
    </div>
  );
}

// Upgrade readiness hero panel — replaces the UK map for growth scenarios.
export function UpgradeReadinessPanel() {
  const { stage, scenario } = useDemoState();
  const active = stageReached(stage, 'incident_detected');
  const ml = mlForScenario(scenario.id).hero;
  const slices = [
    { label: '5G handset',          value: 76, count: '946k' },
    { label: 'In coverage (E14)',   value: 41, count: '512k' },
    { label: 'Legacy plan',         value: 22, count: '274k' },
    { label: 'Propensity > 0.6',    value: 9.5,count: '12.4k' },
    { label: 'Contract end ≤90d',   value: 4.4,count: '5.5k' },
  ];
  return (
    <div className="vf-card h-full min-h-[420px] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Upgrade opportunity · {scenario.city} {scenario.postcode}</div>
          <div className="text-lg font-bold text-ink">5G SA Unlimited Max — funnel</div>
          <div className="text-xs text-ink-muted mt-0.5">5G SA live across 24 cells · 1.4M scored by Snowpark ML upgrade-propensity model</div>
        </div>
        <MlBadge meta={ml} accent="blue" />
      </div>

      <div className="mt-4 flex-1 flex flex-col gap-3 justify-end">
        {slices.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-44 text-[11px] text-ink font-semibold">{s.label}</div>
            <div className="flex-1 h-7 bg-mist rounded-md relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="h-full bg-blue-500/85"
              />
            </div>
            <div className="w-16 text-right font-mono text-xs font-bold text-ink tabular-nums">{s.count}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted border-t border-mist-dark pt-3">
        <span>Funnel from 1.4M base → 5,500 ready-to-upgrade today</span>
        <span className={active ? 'text-blue-700 font-bold' : ''}>{active ? 'Wave seeded · 12,400 reached · day-1 conv 11.4%' : 'Coverage live · standby'}</span>
      </div>
    </div>
  );
}
