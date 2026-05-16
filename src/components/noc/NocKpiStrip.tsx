import { useEffect, useState } from 'react';
import { motion, useMotionValue, animate as fmAnimate } from 'framer-motion';
import { nocKpis, type NocKpi } from '@/data/nocKpis';
import { useDemoState } from '@/state/DemoStateProvider';
import { scriptForIncident } from '@/data/nocSequence';
import { cn } from '@/lib/utils';

export function NocKpiStrip() {
  const { tElapsedMs, selectedIncidentId, nocPlaying } = useDemoState();
  const script = scriptForIncident(selectedIncidentId);
  const totalMs = script.durationSec * 1000;
  const progress = Math.min(1, tElapsedMs / totalMs);

  return (
    <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {nocKpis.map((k) => (
        <KpiCard key={k.id} kpi={k} progress={progress} target={getTarget(k.id, script)} live={nocPlaying || progress > 0} />
      ))}
    </div>
  );
}

function getTarget(id: string, script: ReturnType<typeof scriptForIncident>): number | undefined {
  const t = script.kpiTargets;
  switch (id) {
    case 'mttd': return t.mttd;
    case 'mttr': return t.mttr;
    case 'sla': return t.sla;
    case 'alarms': return t.alarms;
    case 'auto': return t.auto;
    case 'conf': return t.conf;
    default: return undefined;
  }
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function KpiCard({ kpi, progress, target, live }: { kpi: NocKpi; progress: number; target?: number; live: boolean }) {
  const initial = parseFloat(kpi.value);
  const finalVal = target ?? initial;
  const interpolated = lerp(initial, finalVal, progress);
  const tone = kpi.tone === 'good' ? 'text-emerald-600' : kpi.tone === 'bad' ? 'text-vfRed' : kpi.tone === 'warn' ? 'text-amber' : 'text-ink-muted';

  // Live trend extending: append interpolated to trend, drop first
  const trend = (() => {
    const base = kpi.trend.slice();
    if (!live) return base;
    const points = Math.max(1, Math.floor(progress * 8));
    const extra = Array.from({ length: points }, (_, i) => lerp(initial, finalVal, (i + 1) / 8));
    return [...base.slice(points), ...extra];
  })();

  const display = Number.isFinite(interpolated)
    ? (kpi.id === 'mttr' ? interpolated.toFixed(1) : Math.round(interpolated).toString())
    : kpi.value;

  return (
    <motion.div
      className="vf-card px-3 py-2 relative overflow-hidden"
      animate={progress >= 1 && target !== undefined ? { boxShadow: '0 0 0 2px rgba(16,185,129,0.45)' } : { boxShadow: 'none' }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold flex items-center justify-between">
        <span>{kpi.label}</span>
        {live && <span className="w-1.5 h-1.5 rounded-full bg-vfRed animate-pulse" />}
      </div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <CountUp value={display} className="text-xl font-extrabold text-ink font-mono tabular-nums leading-none" />
        {kpi.unit && <span className="text-[10px] text-ink-muted">{kpi.unit}</span>}
      </div>
      {kpi.delta && <div className={cn('text-[10px] mt-0.5 leading-tight', tone)}>{kpi.delta}</div>}
      <Spark data={trend} />
    </motion.div>
  );
}

function CountUp({ value, className }: { value: string; className?: string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => { setShown(value); }, [value]);
  return <motion.span key={value} initial={{ y: -4, opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }} className={className}>{shown}</motion.span>;
}

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-5 mt-1">
      <polyline points={points} fill="none" stroke="#29B5E8" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
