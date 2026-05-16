import { EChart } from './EChart';
import { revenueAtRisk } from '@/data/churn';
import { useDemoState } from '@/state/DemoStateProvider';
import { mlForScenario } from '@/data/mlMeta';
import { analyticsForScenario } from '@/data/analyticsByScenario';

export function RiskDistributionChart() {
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const opt = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['55%', '78%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { formatter: '{b}\n{c|{d}%}', rich: { c: { fontWeight: 700, color: '#111' } }, color: '#6b7280', fontSize: 11 },
      labelLine: { length: 8, length2: 6 },
      data: a.riskDistribution.map((d) => ({ name: d.band, value: d.value, itemStyle: { color: d.color } })),
    }],
  } as any;
  return <EChart option={opt} height={220} />;
}

export function ChurnBySegmentChart() {
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const barColor = scenario.theme === 'growth' ? '#2563EB' : '#29B5E8';
  const opt = {
    grid: { left: 160, right: 24, top: 6, bottom: 24 },
    xAxis: { type: 'value', axisLabel: { color: '#6b7280', fontSize: 10, formatter: '{value}%' }, splitLine: { lineStyle: { color: '#eee' } } },
    yAxis: { type: 'category', data: a.churnBySegment.map((d) => d.segment), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#111', fontWeight: 600, fontSize: 11 } },
    tooltip: { trigger: 'axis' },
    series: [{
      type: 'bar',
      data: a.churnBySegment.map((d) => ({ value: d.risk, itemStyle: { color: barColor, borderRadius: [0, 6, 6, 0] } })),
      barWidth: 12,
      label: { show: true, position: 'right', formatter: '{c}%', color: '#111', fontWeight: 700, fontSize: 11 },
    }],
  } as any;
  return <EChart option={opt} height={220} />;
}

export function RiskByDriverChart() {
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const colors = scenario.theme === 'growth'
    ? ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']
    : ['#29B5E8', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const opt = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      roseType: 'radius',
      radius: ['25%', '78%'],
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { color: '#111', fontSize: 11 },
      data: a.riskByDriver.map((d, i) => ({ name: d.driver, value: d.share, itemStyle: { color: colors[i % colors.length] } })),
    }],
  } as any;
  return <EChart option={opt} height={240} />;
}

export function RevenueAtRiskCard() {
  const { scenario } = useDemoState();
  // Per-scenario revenue framing. Numbers are framing-only (presentation copy).
  const REV: Record<string, { mrr: string; ninetyDay: string; clv: string; highValue: string; label: string }> = {
    manchester:        { mrr: '£2.3m', ninetyDay: '£6.9m', clv: '£18m',     highValue: '£12m',   label: 'Manchester M14 cohort' },
    'birmingham-bill': { mrr: '£1.6m', ninetyDay: '£4.8m', clv: '£14m',     highValue: '£9m',    label: 'Birmingham B4 cohort' },
    'leeds-snowflex':  { mrr: '£0.4m', ninetyDay: '£1.2m', clv: '£3m',      highValue: '£1.8m',  label: 'Leeds SnowFlex cohort' },
    'london-5g':       { mrr: '£0.6m lift', ninetyDay: '£1.8m lift', clv: '£8m', highValue: '£5m', label: 'London E14 5G cohort' },
  };
  const r = REV[scenario.id] ?? REV.manchester;
  const items = [
    { label: scenario.id === 'london-5g' ? 'MRR uplift potential' : 'MRR at risk', value: r.mrr },
    { label: '90-day exposure', value: r.ninetyDay },
    { label: 'CLV exposure', value: r.clv },
    { label: 'High-value', value: r.highValue },
  ];
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{r.label}</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-mist p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{it.label}</div>
            <div className="text-xl font-extrabold text-ink mt-0.5">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetworkQualityTrendChart() {
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const lineColor = scenario.theme === 'growth' ? '#2563EB' : scenario.theme === 'billing' ? '#F59E0B' : scenario.theme === 'commercial' ? '#8B5CF6' : '#29B5E8';
  const areaColor = scenario.theme === 'growth' ? 'rgba(37,99,235,0.12)' : scenario.theme === 'billing' ? 'rgba(245,158,11,0.12)' : scenario.theme === 'commercial' ? 'rgba(139,92,246,0.12)' : 'rgba(41,181,232,0.10)';
  const opt = {
    grid: { left: 36, right: 16, top: 18, bottom: 24 },
    xAxis: { type: 'category', data: a.kpiTrend.points.map((d) => d.hour), axisLabel: { color: '#6b7280', fontSize: 10 }, axisLine: { lineStyle: { color: '#d4d4d4' } } },
    yAxis: { type: 'value', max: a.kpiTrend.yMax, splitLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#6b7280', fontSize: 10, formatter: a.kpiTrend.yFormat ?? '{value}' }, axisLine: { show: false }, name: a.kpiTrend.yLabel, nameTextStyle: { fontSize: 9, color: '#9ca3af' } },
    tooltip: { trigger: 'axis' },
    legend: { right: 8, top: 0, textStyle: { color: '#6b7280', fontSize: 11 } },
    series: [
      { name: 'Baseline', type: 'line', data: a.kpiTrend.points.map((d) => d.baseline), smooth: true, lineStyle: { color: '#9CA3AF', type: 'dashed', width: 2 }, itemStyle: { color: '#9CA3AF' }, symbol: 'none' },
      { name: 'Today',    type: 'line', data: a.kpiTrend.points.map((d) => d.current),  smooth: true, lineStyle: { color: lineColor, width: 3 }, itemStyle: { color: lineColor }, areaStyle: { color: areaColor } },
    ],
  } as any;
  return <EChart option={opt} height={200} />;
}

export function IncidentImpactByCityChart() {
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const highlight = scenario.theme === 'growth' ? '#2563EB' : '#29B5E8';
  const opt = {
    grid: { left: 130, right: 16, top: 10, bottom: 24 },
    xAxis: { type: 'value', axisLabel: { color: '#6b7280', fontSize: 10 }, splitLine: { lineStyle: { color: '#eee' } } },
    yAxis: { type: 'category', data: a.cityImpact.rows.map((d) => d.city).reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#111', fontWeight: 600, fontSize: 11 } },
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}<br/>${a.cityImpact.metric}: ${p[0].value.toLocaleString()}` },
    series: [{
      type: 'bar',
      data: a.cityImpact.rows.map((d, i) => ({ value: d.impact, itemStyle: { color: i === 0 ? highlight : '#9CA3AF', borderRadius: [0, 6, 6, 0] } })).reverse(),
      barWidth: 11,
      label: { show: true, position: 'right', formatter: (p: any) => p.value.toLocaleString(), color: '#111', fontWeight: 700, fontSize: 10 },
    }],
  } as any;
  return <EChart option={opt} height={220} />;
}

export function OfferAcceptanceMatrixChart() {
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const isGrowth = scenario.theme === 'growth';
  const opt = {
    grid: { left: 50, right: 24, top: 20, bottom: 36 },
    xAxis: { type: 'value', name: isGrowth ? 'Acceptance %' : 'Acceptance %', nameLocation: 'middle', nameGap: 24, nameTextStyle: { color: '#6b7280' }, axisLabel: { color: '#6b7280', fontSize: 10 }, splitLine: { lineStyle: { color: '#eee' } }, max: 100 },
    yAxis: { type: 'value', name: isGrowth ? 'Conversion lift (pp)' : 'Risk reduction (pts)', nameLocation: 'middle', nameGap: 36, nameRotate: 90, nameTextStyle: { color: '#6b7280' }, axisLabel: { color: '#6b7280', fontSize: 10 }, splitLine: { lineStyle: { color: '#eee' } }, max: 50 },
    tooltip: { trigger: 'item', formatter: (p: any) => `${p.data.name}<br/>Acceptance: ${p.data.value[0]}%<br/>${isGrowth ? 'Conversion lift' : 'Risk Δ'}: ${isGrowth ? '+' : '-'}${p.data.value[1]} pts<br/>Margin: ${p.data.margin}` },
    series: [{
      type: 'scatter',
      symbolSize: (v: number[]) => 14 + v[1] * 0.6,
      data: a.offers.map((p) => ({
        name: p.name,
        value: [p.x, p.y],
        margin: p.margin,
        itemStyle: {
          color: p.margin === 'High' ? (isGrowth ? '#2563EB' : '#29B5E8') : p.margin === 'Medium' ? '#F59E0B' : '#9CA3AF',
          opacity: 0.85,
        },
      })),
      label: { show: true, formatter: (p: any) => p.data.name, position: 'top', color: '#111', fontSize: 10 },
    }],
  } as any;
  return <EChart option={opt} height={260} />;
}

// ML spotlight chart — picks the right ML visual for the active scenario.
// Manchester (network)  → anomaly score by cell-cluster, last 24h
// Birmingham (billing)  → forecast vs actual bill £, last 6 months + 1mo forecast
// Leeds (commercial)    → demand curve · price elasticity ε
// London (growth)       → upgrade-propensity distribution + threshold marker
export function MlSpotlightChart() {
  const { scenario } = useDemoState();
  const ml = mlForScenario(scenario.id).hero;

  if (scenario.theme === 'network') {
    // Anomaly score by cell over the last 24h, in 1-hour bins
    const cells = ['MAN-01-A', 'MAN-01-B', 'MAN-01-C', 'MAN-02-A', 'MAN-03-A', 'MAN-03-B', 'MAN-04-A'];
    const data: any[] = [];
    for (let h = 0; h < 24; h++) {
      for (let c = 0; c < cells.length; c++) {
        let v = Math.max(0, 0.15 + Math.sin(h / 4) * 0.1 + (Math.random() - 0.5) * 0.1);
        if (h >= 14 && h <= 18 && c <= 2) v = 0.55 + Math.random() * 0.4; // anomaly window
        data.push([h, c, +v.toFixed(2)]);
      }
    }
    const opt = {
      grid: { left: 70, right: 16, top: 12, bottom: 28 },
      xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}:00`), axisLabel: { color: '#6b7280', fontSize: 9 } },
      yAxis: { type: 'category', data: cells, axisLabel: { color: '#111', fontSize: 10, fontWeight: 600 } },
      tooltip: { position: 'top' },
      visualMap: { min: 0, max: 1, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemHeight: 80, itemWidth: 8, textStyle: { fontSize: 9 }, inRange: { color: ['#dcfce7', '#fef3c7', '#fb923c', '#dc2626'] } },
      series: [{ type: 'heatmap', data, progressive: 0, itemStyle: { borderColor: '#fff', borderWidth: 0.5 } }],
    } as any;
    return <EChart option={opt} height={260} />;
  }

  if (scenario.theme === 'billing') {
    // Forecast vs actual bill £, with 80% / 95% bands at the forecast tail
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun*'];
    const actual = [42, 44, 43, 45, 46, 58, 71, null as unknown as number];
    const forecastVal = 65;
    const ci80 = 8;
    const ci95 = 14;
    // Build CI bands only at the forecast tail
    const lower95 = months.map((_, i) => i === months.length - 1 ? forecastVal - ci95 : null);
    const lower80 = months.map((_, i) => i === months.length - 1 ? forecastVal - ci80 : null);
    const upper80 = months.map((_, i) => i === months.length - 1 ? forecastVal + ci80 : null);
    const upper95 = months.map((_, i) => i === months.length - 1 ? forecastVal + ci95 : null);
    // Anchor the bands to the previous (actual) point so they form a wedge
    lower95[months.length - 2] = actual[months.length - 2] as number;
    lower80[months.length - 2] = actual[months.length - 2] as number;
    upper80[months.length - 2] = actual[months.length - 2] as number;
    upper95[months.length - 2] = actual[months.length - 2] as number;
    const opt = {
      grid: { left: 36, right: 16, top: 18, bottom: 24 },
      xAxis: { type: 'category', data: months, axisLabel: { color: '#6b7280', fontSize: 10 } },
      yAxis: { type: 'value', name: '£', nameTextStyle: { fontSize: 9, color: '#9ca3af' }, axisLabel: { color: '#6b7280', fontSize: 10 } },
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      series: [
        { name: 'CI95 lo', type: 'line', data: lower95, lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci95', areaStyle: { opacity: 0 } },
        { name: 'CI95 hi', type: 'line', data: upper95.map((v, i) => v == null ? null : (v - (lower95[i] ?? 0))), lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci95', areaStyle: { color: 'rgba(245,158,11,0.10)' } },
        { name: 'CI80 lo', type: 'line', data: lower80, lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci80', areaStyle: { opacity: 0 } },
        { name: 'CI80 hi', type: 'line', data: upper80.map((v, i) => v == null ? null : (v - (lower80[i] ?? 0))), lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci80', areaStyle: { color: 'rgba(245,158,11,0.20)' } },
        { name: 'Actual', type: 'line', smooth: true, data: actual, lineStyle: { color: '#111', width: 2.5 }, itemStyle: { color: '#111' }, connectNulls: false },
        { name: 'Forecast', type: 'line', smooth: true, data: months.map((_, i) => i === months.length - 1 ? forecastVal : (i === months.length - 2 ? actual[i] : null)), lineStyle: { color: '#F59E0B', width: 2.5, type: 'dashed' }, itemStyle: { color: '#F59E0B' } },
      ],
    } as any;
    return <EChart option={opt} height={260} />;
  }

  if (scenario.theme === 'commercial') {
    // Demand curve: price -> quantity, with elasticity slope
    const points = [
      { p: 16, q: 1450 }, { p: 18, q: 1280 }, { p: 20, q: 1080 }, { p: 22, q: 940 }, { p: 24, q: 760 }, { p: 26, q: 590 }, { p: 28, q: 420 },
    ];
    const opt = {
      grid: { left: 50, right: 16, top: 16, bottom: 36 },
      xAxis: { type: 'value', name: 'Price (£/mo)', nameLocation: 'middle', nameGap: 22, nameTextStyle: { fontSize: 10, color: '#6b7280' }, min: 14, max: 30, axisLabel: { color: '#6b7280', fontSize: 10 } },
      yAxis: { type: 'value', name: 'Demand', nameTextStyle: { fontSize: 9, color: '#9ca3af' }, axisLabel: { color: '#6b7280', fontSize: 10 } },
      tooltip: { trigger: 'axis', formatter: (p: any) => `£${p[0].data[0]} → ${p[0].data[1]} customers` },
      series: [
        { type: 'line', smooth: true, data: points.map((d) => [d.p, d.q]), lineStyle: { color: '#29B5E8', width: 3 }, itemStyle: { color: '#29B5E8' }, areaStyle: { color: 'rgba(41,181,232,0.10)' } },
        { type: 'scatter', data: [[22, 940]], symbolSize: 16, itemStyle: { color: '#E11D48', borderColor: '#fff', borderWidth: 2 }, label: { show: true, position: 'right', formatter: 'today · £22', color: '#E11D48', fontWeight: 700, fontSize: 10 } },
        { type: 'scatter', data: [[20, 1080]], symbolSize: 14, itemStyle: { color: '#10B981', borderColor: '#fff', borderWidth: 2 }, label: { show: true, position: 'top', formatter: 'NBA · £20 match', color: '#10B981', fontWeight: 700, fontSize: 10 } },
      ],
    } as any;
    return <EChart option={opt} height={260} />;
  }

  // Growth (London) → upgrade-propensity distribution + threshold marker at 0.6
  const buckets = [
    { x: 0.0, n: 320 }, { x: 0.1, n: 540 }, { x: 0.2, n: 870 }, { x: 0.3, n: 1240 }, { x: 0.4, n: 1820 }, { x: 0.5, n: 2480 },
    { x: 0.6, n: 2640 }, { x: 0.7, n: 1980 }, { x: 0.8, n: 1240 }, { x: 0.9, n: 610 },
  ];
  const opt = {
    grid: { left: 36, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: buckets.map((b) => b.x.toFixed(1)), name: 'Propensity', nameLocation: 'middle', nameGap: 22, nameTextStyle: { fontSize: 10, color: '#6b7280' }, axisLabel: { color: '#6b7280', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280', fontSize: 10 } },
    tooltip: { trigger: 'axis' },
    series: [{
      type: 'bar',
      data: buckets.map((b) => ({ value: b.n, itemStyle: { color: b.x >= 0.6 ? '#2563EB' : '#93C5FD', borderRadius: [4, 4, 0, 0] } })),
      barCategoryGap: '20%',
      markLine: { silent: true, symbol: 'none', lineStyle: { color: '#E11D48', type: 'dashed', width: 2 }, data: [{ xAxis: '0.6', label: { show: true, formatter: 'threshold 0.6', color: '#E11D48', fontWeight: 700, fontSize: 10, position: 'insideEndTop' } }] },
    }],
  } as any;
  return <EChart option={opt} height={260} />;
}
