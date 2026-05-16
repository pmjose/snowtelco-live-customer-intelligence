import { topology, childrenOf, type TopoNode } from '@/data/topology';
import { useDemoState } from '@/state/DemoStateProvider';
import { cn } from '@/lib/utils';

const statusColor: Record<TopoNode['status'], string> = {
  OK: 'bg-emerald-500',
  Watch: 'bg-amber',
  Degraded: 'bg-vfRed',
  Down: 'bg-vfRed-dark',
};

const statusBg: Record<TopoNode['status'], string> = {
  OK: 'bg-emerald-50 border-emerald-200',
  Watch: 'bg-amber/10 border-amber/30',
  Degraded: 'bg-vfRed-soft border-vfRed/30',
  Down: 'bg-vfRed-soft border-vfRed-dark',
};

export default function NocTopology() {
  const core = topology.find((n) => n.type === 'core')!;
  const regions = childrenOf(core.id);
  const { nocPlaying, currentStage } = useDemoState();
  const traversalActive = nocPlaying || currentStage !== 'idle';
  // Path being traced by agent: Core → REG-NW → CLU-MAN-01
  const onPath = (id: string) => traversalActive && ['CORE-UK', 'REG-NW', 'CLU-MAN-01', 'SITE-MAN-M14-A'].includes(id);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-5">
      <header className="mb-4">
        <div className="text-xs uppercase tracking-wider text-vfRed font-bold">Network Operations</div>
        <h1 className="text-3xl font-extrabold text-ink">Topology</h1>
        <p className="text-sm text-ink-muted">Core → Region → Cluster → Site → Cell. Status colors reflect live alarm aggregation. {traversalActive && <span className="text-vfRed font-bold">Agent traversing path…</span>}</p>
      </header>

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Sites</div><div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">21,400</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Regions</div><div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{regions.length}</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">OK</div><div className="text-xl font-extrabold text-emerald-600 mt-0.5 font-mono tabular-nums leading-none">18,420</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Watch</div><div className="text-xl font-extrabold text-amber-600 mt-0.5 font-mono tabular-nums leading-none">412</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Degraded</div><div className="text-xl font-extrabold text-vfRed mt-0.5 font-mono tabular-nums leading-none">84</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Down</div><div className="text-xl font-extrabold text-vfRed-dark mt-0.5 font-mono tabular-nums leading-none">12</div></div>
      </div>

      <div className="vf-card p-5">
        <Pill node={core} size="lg" highlighted={onPath(core.id)} />
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regions.map((r) => (
            <RegionCard key={r.id} region={r} highlighted={onPath(r.id)} onPath={onPath} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RegionCard({ region, highlighted, onPath }: { region: TopoNode; highlighted: boolean; onPath: (id: string) => boolean }) {
  const clusters = childrenOf(region.id);
  return (
    <div className={cn('rounded-xl border p-3 transition', statusBg[region.status], highlighted && 'ring-2 ring-vfRed glow')}>
      <Pill node={region} highlighted={highlighted} />
      <div className="mt-2 space-y-2">
        {clusters.map((c) => (
          <ClusterCard key={c.id} cluster={c} highlighted={onPath(c.id)} onPath={onPath} />
        ))}
        {clusters.length === 0 && <div className="text-[11px] text-ink-muted italic">No clusters reporting</div>}
      </div>
    </div>
  );
}

function ClusterCard({ cluster, highlighted, onPath }: { cluster: TopoNode; highlighted: boolean; onPath: (id: string) => boolean }) {
  const sites = childrenOf(cluster.id);
  return (
    <div className={cn('rounded-lg border p-2 transition', statusBg[cluster.status], highlighted && 'ring-2 ring-vfRed glow')}>
      <Pill node={cluster} highlighted={highlighted} />
      <div className="mt-1.5 grid grid-cols-1 gap-1">
        {sites.map((s) => (
          <SiteCard key={s.id} site={s} highlighted={onPath(s.id)} />
        ))}
      </div>
    </div>
  );
}

function SiteCard({ site, highlighted }: { site: TopoNode; highlighted?: boolean }) {
  const cells = childrenOf(site.id);
  return (
    <div className={cn('rounded-md bg-white/70 border p-1.5', highlighted ? 'border-vfRed shadow' : 'border-mist-dark')}>
      <div className="flex items-center justify-between gap-2">
        <Pill node={site} small highlighted={highlighted} />
        {cells.length > 0 && <span className="text-[10px] text-ink-muted">{cells.length} cells</span>}
      </div>
      {cells.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {cells.map((c) => (
            <span key={c.id} className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded', statusBg[c.status])}>
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ node, size = 'md', small, highlighted }: { node: TopoNode; size?: 'md' | 'lg'; small?: boolean; highlighted?: boolean }) {
  const pulse = node.status === 'Down' || node.status === 'Degraded';
  return (
    <div className="flex items-center gap-2">
      <span className="relative inline-flex">
        <span className={cn('rounded-full inline-block', statusColor[node.status], size === 'lg' ? 'w-3 h-3' : small ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
        {pulse && <span className={cn('absolute inset-0 rounded-full pulse-ring', statusColor[node.status])} />}
      </span>
      <div className={cn('font-bold', size === 'lg' ? 'text-base' : small ? 'text-[11px]' : 'text-sm', highlighted ? 'text-vfRed' : 'text-ink')}>{node.label}</div>
      <span className={cn('vf-chip text-[10px] uppercase', node.type === 'core' ? 'bg-ink text-white' : 'bg-mist text-ink-muted')}>{node.type}</span>
    </div>
  );
}
