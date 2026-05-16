import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';

export interface DomainTile {
  to: string;
  label: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  status?: 'live' | 'preview' | 'planned';
}

interface KpiSpec {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  tone?: 'good' | 'warn' | 'bad' | 'neutral';
}

export function DomainLanding({ title, subtitle, kicker, kpis, tiles, banner, timeline }: {
  title: string;
  subtitle: string;
  kicker: string;
  kpis: KpiSpec[];
  tiles: DomainTile[];
  banner?: React.ReactNode;
  timeline?: React.ReactNode;
}) {
  return (
    <div data-focus="page" className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header data-focus="header">
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">{kicker}</div>
        <h1 className="text-3xl font-extrabold text-ink leading-tight">{title}</h1>
        <p className="text-sm text-ink-muted">{subtitle}</p>
      </header>

      {timeline}

      {banner}

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>

      <div data-focus="tiles" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Tile key={t.to} tile={t} />
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, unit, delta, tone }: KpiSpec) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-xl font-extrabold text-ink font-mono tabular-nums leading-none">{value}</span>
        {unit && <span className="text-[10px] text-ink-muted">{unit}</span>}
      </div>
      {delta && <div className={`text-[10px] mt-0.5 ${toneCls}`}>{delta}</div>}
    </div>
  );
}

function Tile({ tile }: { tile: DomainTile }) {
  const status = tile.status ?? 'live';
  const statusLabel = status === 'live' ? 'Live' : status === 'preview' ? 'Preview' : 'Planned';
  const statusCls = status === 'live' ? 'bg-emerald-100 text-emerald-700' : status === 'preview' ? 'bg-amber/20 text-amber-800' : 'bg-mist text-ink-muted';
  return (
    <Link to={tile.to} data-focus={`tile:${tile.to}`} className="vf-card p-4 hover:shadow-elev transition group flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-vfRed-soft text-vfRed-dark grid place-items-center">
          <tile.icon className="w-4 h-4" />
        </div>
        <div className="font-bold text-ink flex-1">{tile.label}</div>
        <span className={`vf-chip text-[9px] uppercase ${statusCls}`}>{statusLabel}</span>
      </div>
      <p className="text-xs text-ink-muted leading-snug flex-1">{tile.desc}</p>
      <div className="flex items-center gap-1 text-[11px] text-vfRed font-bold">
        Open <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function ComingSoon({ title, subtitle, kicker }: { title: string; subtitle: string; kicker: string }) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
      <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">{kicker}</div>
      <h1 className="text-3xl font-extrabold text-ink leading-tight">{title}</h1>
      <p className="text-sm text-ink-muted">{subtitle}</p>
      <div className="vf-card p-8 mt-4 text-center">
        <div className="text-sm font-bold text-ink">Coming soon</div>
        <p className="text-xs text-ink-muted mt-1">This surface is on the roadmap. Use the sidebar to navigate to the live pages in this domain.</p>
      </div>
    </div>
  );
}
