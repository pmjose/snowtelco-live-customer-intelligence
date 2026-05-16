import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { incidentById } from '@/data/nocIncidents';
import { cn } from '@/lib/utils';

const SEGMENT_LABELS: Record<string, string> = {
  'command-center': 'Command Center',
  customers: 'At-Risk Customers',
  customer: 'Customer 360',
  compare: 'Compare Customers',
  approvals: 'Approvals',
  insights: 'Executive Insights',
  uplift: 'Treatment Uplift',
  architecture: 'Architecture',
  lineage: 'Decision Lineage',
  briefing: 'Briefing',
  digital: 'Digital',
  channels: 'Channel Orchestrator',
  conversational: 'Conversational AI',
  voice: 'Voice Agent',
  journeys: 'In-App Journeys',
  marketplace: 'Marketplace',
  bss: 'BSS',
  catalog: 'Product Catalog',
  'order-to-activate': 'Order-to-Activate',
  charging: 'Charging & Rating',
  billing: 'Billing & Invoice',
  collections: 'Collections',
  'revenue-assurance': 'Revenue Assurance',
  loyalty: 'Loyalty',
  b2b: 'Enterprise',
  oss: 'OSS',
  inventory: 'Service Inventory',
  provisioning: 'Provisioning',
  'field-force': 'Field Force',
  capacity: 'Capacity Planner',
  energy: 'Energy & Sustainability',
  noc: 'NOC',
  agents: 'Agent Orchestration',
  topology: 'Topology',
  'agent-runs': 'Agent Runs',
  network: 'Network Map',
  events: 'Event Stream',
  settings: 'Settings',
};

const DOMAIN_LABEL: Record<string, string> = {
  'command-center': 'CIC',
  customers: 'CIC',
  customer: 'CIC',
  compare: 'CIC',
  approvals: 'CIC',
  insights: 'CIC',
  uplift: 'CIC',
  briefing: 'CIC',
  lineage: 'CIC',
  digital: 'Digital',
  bss: 'BSS',
  oss: 'OSS',
  noc: 'NOC',
  network: 'Network',
  events: 'Network',
  architecture: 'Reference',
  settings: 'Reference',
};

export function PageBreadcrumb() {
  const { pathname } = useLocation();
  const { nocPlaying, selectedIncidentId, currentStage } = useDemoState();

  if (pathname === '/') return null;

  const segs = pathname.split('/').filter(Boolean);
  const first = segs[0] ?? '';
  const domain = DOMAIN_LABEL[first] ?? '';

  // Build trail with collapsed labels — drop the first segment if it's the bare overview
  // (e.g. on /digital we don't want "Digital > Digital"; on /digital/voice we want "Digital > Voice Agent")
  const trailSegs = segs.length > 1 ? segs.slice(1) : segs;
  const trail: { label: string; to?: string }[] = [];
  let acc = '/' + segs[0];
  if (segs.length > 1) {
    trailSegs.forEach((s, i) => {
      acc += '/' + s;
      const label = SEGMENT_LABELS[s] ?? s;
      trail.push({ label, to: i < trailSegs.length - 1 ? acc : undefined });
    });
  } else {
    const label = SEGMENT_LABELS[segs[0]] ?? segs[0];
    // Only show if different from the domain label (avoid "Digital > Digital")
    if (label && label !== domain) trail.push({ label });
  }

  const incident = nocPlaying ? incidentById(selectedIncidentId) : null;

  return (
    <div className="border-b border-mist-dark bg-white/60 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-9 flex items-center gap-1.5 text-[11.5px]">
        <Link to="/" className="text-ink-muted hover:text-ink flex items-center gap-1">
          <Home className="w-3 h-3" />
        </Link>
        <ChevronRight className="w-3 h-3 text-ink-muted/60" />
        {domain && (
          <>
            <span className="font-bold text-ink">{domain}</span>
            {trail.length > 0 && <ChevronRight className="w-3 h-3 text-ink-muted/60" />}
          </>
        )}
        {trail.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {t.to ? (
              <Link to={t.to} className="text-ink-muted hover:text-ink">{t.label}</Link>
            ) : (
              <span className="text-ink font-semibold">{t.label}</span>
            )}
            {i < trail.length - 1 && <ChevronRight className="w-3 h-3 text-ink-muted/60" />}
          </span>
        ))}

        {incident && (
          <div className="ml-auto flex items-center gap-2">
            <span className={cn('vf-chip text-[10px] font-mono',
              currentStage === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
              currentStage === 'verify' ? 'bg-emerald-100/80 text-emerald-700' :
              currentStage === 'idle' ? 'bg-mist text-ink-muted' :
              'bg-amber/30 text-amber-900 animate-pulse')}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {currentStage.toUpperCase()}
            </span>
            <span className="vf-chip bg-vfRed text-white text-[10px] font-mono">{incident.priority}</span>
            <span className="text-[10.5px] text-ink-muted truncate max-w-[280px]">{incident.city}</span>
          </div>
        )}
      </div>
    </div>
  );
}
