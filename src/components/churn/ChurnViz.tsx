import { useEffect, useRef } from 'react';
import { useDemoState } from '@/state/DemoStateProvider';
import { EChart } from '@/components/charts/EChart';

export function ChurnGauge({ value, projected }: { value: number; projected?: number }) {
  const opt = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        progress: { show: true, width: 16, roundCap: true },
        axisLine: { lineStyle: { width: 16, color: [[1, '#f1f1f1']] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 36,
          fontWeight: 800,
          color: value >= 70 ? '#29B5E8' : value >= 50 ? '#F59E0B' : '#111',
          formatter: '{value}%',
          offsetCenter: [0, 0],
        },
        data: [{ value, itemStyle: { color: value >= 70 ? '#29B5E8' : value >= 50 ? '#F59E0B' : '#10B981' } }],
      },
      ...(projected !== undefined
        ? [{
            type: 'gauge',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            progress: { show: false },
            axisLine: { show: false },
            pointer: {
              show: true,
              length: '70%',
              width: 4,
              itemStyle: { color: '#10B981' },
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            detail: { show: false },
            data: [{ value: projected }],
          }]
        : []),
    ],
  } as any;
  return <EChart option={opt} height={200} />;
}

export function ChurnTrendChart({ data }: { data: { week: string; risk: number }[] }) {
  // The last point is treated as the model's forecast — render a 80%/95%
  // confidence cone around it so the chart visibly says "ML forecast".
  const lastIdx = data.length - 1;
  const forecastVal = data[lastIdx]?.risk ?? 0;
  const ci80 = 6;  // ±6 pts inner band
  const ci95 = 12; // ±12 pts outer band
  const blank = data.map(() => undefined as any);
  const upper95 = [...blank];
  const upper80 = [...blank];
  const lower80 = [...blank];
  const lower95 = [...blank];
  if (lastIdx >= 1) {
    upper95[lastIdx - 1] = data[lastIdx - 1].risk;
    upper80[lastIdx - 1] = data[lastIdx - 1].risk;
    lower80[lastIdx - 1] = data[lastIdx - 1].risk;
    lower95[lastIdx - 1] = data[lastIdx - 1].risk;
    upper95[lastIdx] = Math.min(100, forecastVal + ci95);
    upper80[lastIdx] = Math.min(100, forecastVal + ci80);
    lower80[lastIdx] = Math.max(0,   forecastVal - ci80);
    lower95[lastIdx] = Math.max(0,   forecastVal - ci95);
  }
  const opt = {
    grid: { left: 30, right: 16, top: 10, bottom: 24 },
    xAxis: { type: 'category', data: data.map((d) => d.week), axisLine: { lineStyle: { color: '#d4d4d4' } }, axisLabel: { color: '#6b7280', fontSize: 10 } },
    yAxis: { type: 'value', max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#6b7280', fontSize: 10 } },
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    series: [
      // 95% band: upper line, then lower line stacked-fill below it
      { name: 'CI95 lower', type: 'line', data: lower95, lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci95', areaStyle: { opacity: 0 }, z: 1 },
      { name: 'CI95 upper', type: 'line', data: upper95.map((v, i) => v == null ? undefined : v - (lower95[i] ?? 0)), lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci95', areaStyle: { color: 'rgba(41,181,232,0.10)' }, z: 1 },
      // 80% band
      { name: 'CI80 lower', type: 'line', data: lower80, lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci80', areaStyle: { opacity: 0 }, z: 2 },
      { name: 'CI80 upper', type: 'line', data: upper80.map((v, i) => v == null ? undefined : v - (lower80[i] ?? 0)), lineStyle: { opacity: 0 }, symbol: 'none', stack: 'ci80', areaStyle: { color: 'rgba(41,181,232,0.20)' }, z: 2 },
      // Main risk line
      {
        name: 'Risk',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.risk),
        lineStyle: { color: '#29B5E8', width: 3 },
        itemStyle: { color: '#29B5E8' },
        z: 3,
        markPoint: {
          data: [
            { coord: [data.length - 2, data[data.length - 2].risk], symbol: 'pin', symbolSize: 28, itemStyle: { color: '#29B5E8' }, label: { show: false } },
            { coord: [data.length - 1, data[data.length - 1].risk], symbol: 'pin', symbolSize: 28, itemStyle: { color: '#10B981' }, label: { show: false } },
          ],
        },
      },
    ],
  } as any;
  return <EChart option={opt} height={180} />;
}

export function ChurnDriverBars({ drivers }: { drivers: { driver: string; contribution: number; signalType: string }[] }) {
  const colors: Record<string, string> = {
    Commercial: '#29B5E8', Network: '#0EA5E9', Care: '#F59E0B', Market: '#8B5CF6', Billing: '#10B981', Engagement: '#EC4899',
  };
  const opt = {
    grid: { left: 140, right: 30, top: 5, bottom: 10 },
    xAxis: { type: 'value', max: 30, axisLine: { show: false }, splitLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#6b7280', fontSize: 10, formatter: '{value} pts' } },
    yAxis: { type: 'category', data: drivers.map((d) => d.driver).reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#111', fontWeight: 600, fontSize: 11 } },
    tooltip: { trigger: 'axis' },
    series: [
      {
        type: 'bar',
        data: drivers.map((d) => ({ value: d.contribution, itemStyle: { color: colors[d.signalType] ?? '#29B5E8', borderRadius: [0, 6, 6, 0] } })).reverse(),
        barWidth: 14,
        label: { show: true, position: 'right', formatter: '{c}', color: '#111', fontWeight: 700, fontSize: 11 },
      },
    ],
  } as any;
  return <EChart option={opt} height={Math.max(180, drivers.length * 32)} />;
}

// Animated stage-aware churn risk
export function CurrentChurnGauge({ customerId }: { customerId: string }) {
  const { effectiveChurn, stage, isResolved } = useDemoState();
  const value = Math.round(effectiveChurn(customerId));
  const projected = isResolved && customerId === 'CUST-001' ? undefined : undefined;
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value, stage]);
  return <ChurnGauge value={value} projected={projected} />;
}
