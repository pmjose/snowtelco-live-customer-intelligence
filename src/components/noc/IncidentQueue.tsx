import { useDemoState } from '@/state/DemoStateProvider';
import { nocIncidents, type NocIncident } from '@/data/nocIncidents';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Users } from 'lucide-react';

const priColors: Record<string, string> = {
  P1: 'bg-vfRed text-white',
  P2: 'bg-amber text-white',
  P3: 'bg-mist-dark text-ink',
};

export function IncidentQueue() {
  const { selectedIncidentId, selectIncident } = useDemoState();
  const sorted = [...nocIncidents].sort((a, b) => {
    const order = { P1: 0, P2: 1, P3: 2 };
    if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
    return (b.slaElapsedMin / b.slaTargetMin) - (a.slaElapsedMin / a.slaTargetMin);
  });

  return (
    <div className="vf-card p-3 flex flex-col h-full min-h-0 w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Incident Queue</div>
          <div className="text-sm font-extrabold text-ink leading-tight">{sorted.length} open · {sorted.filter((i) => i.priority === 'P1').length} P1</div>
        </div>
        <span className="vf-chip bg-vfRed-soft text-vfRed-dark animate-pulse text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-vfRed inline-block" /> Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1.5">
        {sorted.map((i) => (
          <IncidentRow key={i.id} incident={i} active={i.id === selectedIncidentId} onClick={() => selectIncident(i.id)} />
        ))}
      </div>
    </div>
  );
}

function IncidentRow({ incident, active, onClick }: { incident: NocIncident; active: boolean; onClick: () => void }) {
  const slaPct = Math.min(1, incident.slaElapsedMin / incident.slaTargetMin);
  const slaTone = slaPct > 0.85 ? 'bg-vfRed' : slaPct > 0.6 ? 'bg-amber' : 'bg-emerald-500';
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border p-2 transition',
        active ? 'border-ink bg-mist/60 shadow-sm' : 'border-mist-dark hover:border-ink/30 hover:bg-mist/40'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn('vf-chip text-[9px] font-bold !px-1.5 !py-0.5', priColors[incident.priority])}>{incident.priority}</span>
          <span className="text-[12px] font-bold text-ink truncate">{incident.city} {incident.postcodeArea}</span>
        </div>
        <span className="text-[9.5px] text-ink-muted shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {incident.slaElapsedMin}/{incident.slaTargetMin}m
        </span>
      </div>
      <div className="text-[10.5px] text-ink-muted mt-0.5 line-clamp-1 leading-snug">{incident.rootCauseHypothesis}</div>
      <div className="flex items-center gap-2.5 text-[10px] text-ink-muted mt-1">
        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {incident.cellSitesImpacted}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {incident.impactedCustomers.toLocaleString()}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-mist overflow-hidden">
        <div className={cn('h-full', slaTone)} style={{ width: `${slaPct * 100}%` }} />
      </div>
    </button>
  );
}
