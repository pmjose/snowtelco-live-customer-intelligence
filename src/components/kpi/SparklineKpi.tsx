import { EChart } from '@/components/charts/EChart';

export function Sparkline({ data, color = '#29B5E8', height = 40 }: { data: number[]; color?: string; height?: number }) {
  const opt = {
    grid: { left: 0, right: 0, top: 4, bottom: 4 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: { color, width: 2 },
      areaStyle: { color: color + '22' },
    }],
  } as any;
  return <EChart option={opt} height={height} />;
}

export function SparklineKpi({ label, value, trend, color = '#29B5E8', accent }: { label: string; value: string; trend: number[]; color?: string; accent?: string }) {
  return (
    <div className="vf-card p-3">
      <div className="flex items-center justify-between">
        <div className="vf-kpi-label">{label}</div>
      </div>
      <div className={`text-xl font-extrabold mt-0.5 ${accent ?? 'text-ink'}`}>{value}</div>
      <div className="-mx-2 mt-1"><Sparkline data={trend} color={color} height={36} /></div>
    </div>
  );
}
