import { useDemoState } from '@/state/DemoStateProvider';
import { incidentById } from '@/data/nocIncidents';
import { nodeById } from '@/data/topology';
import { ChevronRight, Activity, Signal, PhoneOff, Users, BadgePoundSterling } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IncidentDetail() {
  const { selectedIncidentId } = useDemoState();
  const inc = incidentById(selectedIncidentId);
  const cluster = inc.linkedClusterId ? nodeById(inc.linkedClusterId) : undefined;
  const region = cluster?.parentId ? nodeById(cluster.parentId) : undefined;

  const dlDelta = inc.averageDownloadSpeedAfterMbps - inc.averageDownloadSpeedBeforeMbps;
  const clvAtRisk = inc.highChurnRiskCustomers * 480; // rough avg

  return (
    <div className="vf-card p-3 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center text-[10px] text-ink-muted gap-1 flex-wrap">
            <span>UK Core</span>
            {region && <><ChevronRight className="w-3 h-3" /><span>{region.label}</span></>}
            {cluster && <><ChevronRight className="w-3 h-3" /><span className="font-bold text-ink">{cluster.label}</span></>}
            <ChevronRight className="w-3 h-3" />
            <span>{inc.cellSitesImpacted} sites · {inc.affectedTechnology.join('/')}</span>
          </div>
          <h2 className="text-lg font-extrabold text-ink leading-tight mt-0.5">
            {inc.city} {inc.postcodeArea} — {inc.severity.toLowerCase()} severity
          </h2>
          <div className="text-[12px] text-ink-muted mt-0.5 line-clamp-2">{inc.rootCauseHypothesis}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn('vf-chip font-bold text-[10px]', inc.priority === 'P1' ? 'bg-vfRed text-white' : 'bg-mist text-ink')}>{inc.priority} · {inc.status}</span>
          <span className="text-[10px] text-ink-muted">{inc.detectedAt}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <KpiTile icon={<Signal className="w-3.5 h-3.5" />} label="DL" value={`${inc.averageDownloadSpeedAfterMbps}`} unit="Mbps" delta={`${dlDelta > 0 ? '+' : ''}${dlDelta}`} tone="bad" />
        <KpiTile icon={<PhoneOff className="w-3.5 h-3.5" />} label="Drops" value={`+${inc.droppedCallIncreasePct}%`} delta="vs base" tone="bad" />
        <KpiTile icon={<Activity className="w-3.5 h-3.5" />} label="Fail sess" value={`+${inc.failedDataSessionIncreasePct}%`} delta="vs base" tone="bad" />
        <KpiTile icon={<Users className="w-3.5 h-3.5" />} label="Blast" value={inc.impactedCustomers.toLocaleString()} delta={`${inc.highValueCustomers} HV`} tone="warn" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <KpiTile icon={<BadgePoundSterling className="w-3.5 h-3.5" />} label="CLV risk" value={`£${(clvAtRisk / 1000).toFixed(0)}k`} delta={`${inc.highChurnRiskCustomers} P1`} tone="warn" />
        <KpiTile label="SLA" value={`${inc.slaElapsedMin}/${inc.slaTargetMin}m`} delta={`${Math.round((inc.slaElapsedMin / inc.slaTargetMin) * 100)}%`} tone={inc.slaElapsedMin / inc.slaTargetMin > 0.85 ? 'bad' : 'warn'} />
        <KpiTile label="Sites" value={`${inc.cellSitesImpacted}`} delta={inc.affectedTechnology.join('/')} tone="neutral" />
      </div>
    </div>
  );
}

function KpiTile({ icon, label, value, unit, delta, tone }: { icon?: React.ReactNode; label: string; value: string; unit?: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : tone === 'good' ? 'text-emerald-600' : 'text-ink-muted';
  return (
    <div className="rounded-lg border border-mist-dark px-2 py-1.5 bg-white">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-ink-muted font-bold">
        {icon}{label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-base font-extrabold text-ink font-mono tabular-nums leading-none">{value}</span>
        {unit && <span className="text-[10px] text-ink-muted">{unit}</span>}
      </div>
      {delta && <div className={cn('text-[10px] mt-0.5 leading-tight', toneCls)}>{delta}</div>}
    </div>
  );
}
