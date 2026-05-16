import { EChart } from '@/components/charts/EChart';
import { useDemoState } from '@/state/DemoStateProvider';
import { analyticsForScenario } from '@/data/analyticsByScenario';

const groupColor: Record<string, string> = {
  Persuadable: '#29B5E8',
  'Sure thing': '#10B981',
  'Lost cause': '#9CA3AF',
  'Do not disturb': '#F59E0B',
};

// Per-scenario cohort framing for the outcome simulator card.
const COHORT_BY_SCENARIO: Record<string, { size: number; persuadable: number; sure: number; lost: number; dnd: number; saveValue: string; }> = {
  manchester:       { size: 89,    persuadable: 62, sure: 14, lost: 9, dnd: 4, saveValue: '£420k' },
  'birmingham-bill':{ size: 71,    persuadable: 51, sure: 9,  lost: 7, dnd: 4, saveValue: '£180k' },
  'leeds-snowflex': { size: 38,    persuadable: 28, sure: 4,  lost: 4, dnd: 2, saveValue: '£94k'  },
  'london-5g':      { size: 12400, persuadable: 8540, sure: 1860, lost: 1240, dnd: 760, saveValue: '£180k/yr' },
};

export default function Uplift() {
  const { selectedCustomerId, scenario } = useDemoState();
  const primaryId = scenario.primaryCustomerId;
  const cohort = COHORT_BY_SCENARIO[scenario.id] ?? COHORT_BY_SCENARIO.manchester;
  const a = analyticsForScenario(scenario.id);
  const quadrantData = a.quadrant;
  const isGrowth = scenario.theme === 'growth';
  const yAxisName = isGrowth ? 'Conversion lift (pp)' : 'Uplift (% reduction if treated)';
  const opt = {
    grid: { left: 60, right: 24, top: 24, bottom: 50 },
    xAxis: { type: 'value', name: isGrowth ? 'Propensity score (×100)' : 'P(churn | no action) %', nameLocation: 'middle', nameGap: 26, max: 100, splitLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#6b7280', fontSize: 10 } },
    yAxis: { type: 'value', name: yAxisName, nameLocation: 'middle', nameGap: 38, nameRotate: 90, max: 80, splitLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#6b7280', fontSize: 10 } },
    tooltip: { trigger: 'item', formatter: (p: any) => `${p.data.name}<br/>${isGrowth ? 'Propensity' : 'P(churn)'}: ${p.data.value[0]}<br/>${isGrowth ? 'Conv. lift' : 'Uplift'}: ${p.data.value[1]} pts<br/>Group: ${p.data.group}` },
    series: [
      { type: 'line', markLine: { silent: true, symbol: 'none', lineStyle: { color: '#d4d4d4', type: 'dashed' }, data: [{ xAxis: 50 }, { yAxis: 40 }] } },
      {
        type: 'scatter',
        symbolSize: (v: number[]) => 14 + v[1] * 0.4,
        data: quadrantData.map((p) => {
          const isPrimary = p.id === primaryId;
          const isSelected = p.id === selectedCustomerId;
          const primaryColor = isGrowth ? '#2563EB' : '#E11D48';
          return {
            name: isPrimary ? `${p.name} ★` : p.name,
            value: [p.x, p.y],
            group: p.group,
            itemStyle: {
              color: isPrimary ? primaryColor : groupColor[p.group],
              opacity: isPrimary ? 1 : 0.85,
              borderColor: isPrimary ? '#111' : isSelected ? '#111' : '#fff',
              borderWidth: isPrimary ? 3 : isSelected ? 2 : 1,
            },
            symbolSize: isPrimary ? 28 + p.y * 0.4 : 14 + p.y * 0.4,
          };
        }),
        label: { show: true, formatter: (p: any) => p.data.name, position: 'top', color: '#111', fontSize: 11, fontWeight: 700 },
      },
    ],
  } as any;

  const primaryName = quadrantData.find((q) => q.id === primaryId)?.name ?? 'primary';

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-6 space-y-4">
      <header>
        <div className={`text-xs uppercase tracking-wider font-bold ${scenario.theme === 'growth' ? 'text-blue-700' : 'text-vfRed'}`}>Analytics</div>
        <h1 className="text-3xl font-extrabold text-ink">
          {scenario.theme === 'growth'    ? `Conversion funnel · ${scenario.short}`
           : scenario.theme === 'billing' ? `Cost vs save payoff · ${scenario.short}`
           : `Treatment Uplift · ${scenario.short}`}
        </h1>
        <p className="text-sm text-ink-muted">
          {scenario.theme === 'growth'
            ? <>Funnel from eligible base to upgrades. Primary upgrade target for this scenario: <b>{primaryName}</b> ({primaryId}).</>
            : scenario.theme === 'billing'
            ? <>Refund cost vs CLV protected for the bill-shock cohort. Primary save target: <b>{primaryName}</b> ({primaryId}).</>
            : <>Send retention treatments only where the action moves the needle. Primary save target: <b>{primaryName}</b> ({primaryId}).</>}
        </p>
      </header>

      {scenario.theme === 'growth' ? <GrowthFunnelView scenario={scenario} cohort={cohort} primaryName={primaryName} /> :
       scenario.theme === 'billing' ? <BillingPayoffView scenario={scenario} cohort={cohort} primaryName={primaryName} /> : (
      <>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="vf-card p-4 lg:col-span-2">
          <div className="font-bold text-ink mb-2">Uplift quadrant — population view</div>
          <EChart option={opt} height={420} />
          <div className="text-xs text-ink-muted mt-2">Top-right quadrant = Persuadables · ideal targets for retention treatment. Red ★ marks the primary save target for the active scenario.</div>
        </div>
        <div className="space-y-3">
          {Object.entries(groupColor).map(([g, c]) => {
            const desc: Record<string, string> = {
              'Persuadable': 'Likely to churn without action — and treatment moves the needle. Top priority.',
              'Sure thing': 'Will stay regardless. Treating wastes margin.',
              'Lost cause': 'Will churn regardless. Save margin for persuadables.',
              'Do not disturb': 'Treatment increases annoyance and complaints. Suppress.',
            };
            return (
              <div key={g} className="vf-card p-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                  <div className="font-bold text-ink">{g}</div>
                </div>
                <p className="text-xs text-ink-muted mt-1">{desc[g]}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vf-card p-4">
        <div className="font-bold text-ink mb-2">Treatment outcome simulator (cohort {cohort.size.toLocaleString()} {scenario.id === 'london-5g' ? 'high-CLV' : 'P1'} customers · {scenario.city})</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Mini label="Persuadables" value={cohort.persuadable.toString()} accent="text-vfRed" />
          <Mini label="Sure things" value={cohort.sure.toString()} accent="text-emerald-600" />
          <Mini label="Lost causes" value={cohort.lost.toString()} accent="text-ink-muted" />
          <Mini label="Do-not-disturbs" value={cohort.dnd.toString()} accent="text-amber-700" />
        </div>
        <div className="mt-3 text-xs text-ink-muted">Treating only persuadables yields the highest expected save value at ~{cohort.saveValue} across this cohort.</div>
      </div>
      </>
      )}
    </div>
  );
}

function GrowthFunnelView({ scenario, cohort, primaryName }: any) {
  const eligible = scenario.impactedCustomers; // 12,400 — the single source of truth
  const stages = [
    { label: 'Eligible (5G handset + coverage + legacy plan)', count: eligible,                      pct: 100,  color: 'bg-blue-200' },
    { label: 'Exposed (in-app + push + email)',                count: Math.round(eligible * 0.92),   pct: 92,   color: 'bg-blue-300' },
    { label: 'Engaged (opened journey)',                       count: Math.round(eligible * 0.38),   pct: 38,   color: 'bg-blue-400' },
    { label: 'Offered (NBA shown)',                            count: Math.round(eligible * 0.265),  pct: 26.5, color: 'bg-blue-500' },
    { label: 'Upgraded (5G SA Unlimited Max)',                 count: Math.round(eligible * 0.114),  pct: 11.4, color: 'bg-blue-600' },
  ];
  const max = stages[0].count;
  return (
    <>
      <div className="vf-card p-4">
        <div className="font-bold text-ink mb-3">Day-1 conversion funnel · {primaryName} cohort</div>
        <div className="space-y-2.5">
          {stages.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-72 text-[12px] text-ink font-semibold">{s.label}</div>
              <div className="flex-1 h-9 bg-mist rounded-md relative overflow-hidden">
                <div style={{ width: `${(s.count / max) * 100}%` }} className={`h-full ${s.color} transition-all duration-500`} />
              </div>
              <div className="w-24 text-right font-mono text-sm font-extrabold text-ink tabular-nums">{s.count.toLocaleString()}</div>
              <div className="w-16 text-right text-[11px] font-mono text-ink-muted tabular-nums">{s.pct}%</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="ARPU lift / mo" value="+£15k" accent="text-blue-700" />
        <Mini label="ARPU lift / yr" value="£180k" accent="text-blue-700" />
        <Mini label="Day-1 conv." value="11.4%" accent="text-emerald-600" />
        <Mini label="Eligible base" value={eligible.toLocaleString()} accent="text-ink" />
      </div>
      <div className="vf-card p-4 text-xs text-ink-muted">Funnel sized {eligible.toLocaleString()} eligible customers (5G handset + in-coverage + propensity &gt; 0.6). ROI break-even at month 3 against the £5 first-month credit.</div>
    </>
  );
}

function BillingPayoffView({ scenario, cohort, primaryName }: any) {
  const rows = [
    { offer: 'Bill explainer SMS only',          cost: '£0',       save: '£42k',  ratio: '∞',   recommended: false },
    { offer: 'Bill explainer + £4 goodwill credit', cost: '£7.4k', save: '£128k', ratio: '17×', recommended: true },
    { offer: 'Full refund + Roaming Pass auto-enrol', cost: '£18.4k', save: '£180k', ratio: '10×', recommended: false },
    { offer: 'Senior care callback for top 50',   cost: '£3.2k',   save: '£62k',  ratio: '19×', recommended: false },
  ];
  return (
    <>
      <div className="vf-card p-4">
        <div className="font-bold text-ink mb-3">Cost vs CLV-protected · {primaryName} cohort ({cohort.size.toLocaleString()})</div>
        <table className="w-full text-xs border border-mist-dark">
          <thead className="bg-mist">
            <tr>
              <th className="text-left px-2 py-1 border-r border-mist-dark">Treatment</th>
              <th className="text-left px-2 py-1 border-r border-mist-dark">Refund cost</th>
              <th className="text-left px-2 py-1 border-r border-mist-dark">CLV protected</th>
              <th className="text-left px-2 py-1 border-r border-mist-dark">ROI</th>
              <th className="text-left px-2 py-1">Decision</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-t border-mist-dark ${r.recommended ? 'bg-emerald-50' : ''}`}>
                <td className="px-2 py-1.5 border-r border-mist-dark font-bold">{r.offer}</td>
                <td className="px-2 py-1.5 border-r border-mist-dark font-mono">{r.cost}</td>
                <td className="px-2 py-1.5 border-r border-mist-dark font-mono">{r.save}</td>
                <td className="px-2 py-1.5 border-r border-mist-dark font-mono font-bold">{r.ratio}</td>
                <td className="px-2 py-1.5">{r.recommended ? <span className="vf-chip bg-emerald-500 text-white">Recommended</span> : <span className="vf-chip bg-mist text-ink-muted">Considered</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-ink-muted mt-2">Recommended treatment maximises ROI without exceeding goodwill-credit policy floor (max 3 / 12mo).</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Refund cost (recommended)" value="£7.4k" accent="text-amber-700" />
        <Mini label="CLV protected" value="£180k" accent="text-emerald-600" />
        <Mini label="Cohort enrolled" value="1,840" accent="text-ink" />
        <Mini label="Dispute SLA" value="94% < 48h" accent="text-emerald-600" />
      </div>
    </>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-mist p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className={`text-xl font-extrabold mt-0.5 ${accent ?? 'text-ink'}`}>{value}</div>
    </div>
  );
}
