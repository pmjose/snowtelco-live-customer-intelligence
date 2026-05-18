import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity, BarChart3, Boxes, ClipboardCheck, GitBranch, Map, MessageSquare, Network,
  Settings as SettingsIcon, TrendingUp, User, Users, Workflow, ScrollText, FileText,
  Radio, Bot, History, Smartphone, MessageCircle, Phone, Sparkles, Layers, ShoppingCart, Database,
  CreditCard, Receipt, Banknote, ShieldAlert, Award, Building2, Boxes as InvIcon,
  Wrench, Hammer, Truck, Gauge, Leaf, Home, BookOpen,
  Brain, Mic, FlaskConical, Plug, PoundSterling, LifeBuoy, Lock, Calendar, KeyRound,
  Briefcase, Headphones, Activity as Pulse, FileSpreadsheet, Calculator, Tag, GitMerge,
  Cpu, MapPin, Globe2, Hash, Zap, Server, Target, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDemoState, type Mode } from '@/state/DemoStateProvider';
import { scenariosFor, SECTION_LABEL, type SectionId } from '@/data/sectionScenarios';
import { scenarioById as cicScenarioById } from '@/data/scenarios';
import { cicForIncident } from '@/data/incidentToCic';

interface NavItem { to: string; label: string; icon: any; }
interface NavGroup { title: string; items: NavItem[]; }

const cicGroups: NavGroup[] = [
  {
    title: 'Operations', items: [
      { to: '/command-center', label: 'Command Center', icon: Activity },
      { to: '/customers', label: 'At-Risk Customers', icon: Users },
      { to: '/customer/CUST-001', label: 'Customer 360', icon: User },
    ],
  },
  {
    title: 'Decisioning', items: [
      { to: '/compare', label: 'Compare Customers', icon: Workflow },
      { to: '/approvals', label: 'Approval Workflow', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Analytics', items: [
      { to: '/insights', label: 'Executive Insights', icon: BarChart3 },
      { to: '/uplift', label: 'Treatment Uplift', icon: TrendingUp },
      { to: '/briefing', label: 'Briefing Export', icon: FileText },
    ],
  },
  {
    title: 'Architecture', items: [
      { to: '/architecture', label: 'Snowflake Blueprint', icon: Boxes },
      { to: '/database', label: 'Database catalog', icon: Database },
      { to: '/lineage', label: 'Decision Lineage', icon: GitBranch },
      { to: '/scenarios', label: 'Demo scenarios', icon: Sparkles },
    ],
  },
];

const digitalGroups: NavGroup[] = [
  { title: 'Digital Channels', items: [
    { to: '/digital', label: 'Overview', icon: Smartphone },
    { to: '/digital/channels', label: 'Channel Orchestrator', icon: Layers },
    { to: '/digital/conversational', label: 'Conversational AI', icon: MessageCircle },
    { to: '/digital/voice', label: 'Voice Agent', icon: Phone },
    { to: '/digital/journeys', label: 'In-App Journeys', icon: Sparkles },
    { to: '/digital/marketplace', label: 'Marketplace', icon: ShoppingCart },
  ] },
  { title: 'Marketing', items: [
    { to: '/digital/marketing', label: 'Campaigns Hub', icon: Sparkles },
    { to: '/digital/marketing/funnel', label: 'Funnel & Attribution', icon: BarChart3 },
    { to: '/digital/marketing/audience', label: 'Audience Builder', icon: Users },
    { to: '/digital/marketing/lifecycle', label: 'Lifecycle & Loyalty', icon: Workflow },
    { to: '/digital/marketing/brand', label: 'Brand & Competitor', icon: TrendingUp },
  ] },
  { title: 'AI & Decisioning', items: [
    { to: '/digital/decisioning', label: 'Decisioning Brain', icon: Brain },
    { to: '/digital/voc', label: 'Voice of Customer', icon: Mic },
    { to: '/digital/experiments', label: 'Experimentation', icon: FlaskConical },
    { to: '/digital/martech', label: 'Personalisation Studio', icon: Plug },
    { to: '/digital/pricing', label: 'Pricing & Offer', icon: PoundSterling },
  ] },
  { title: 'Trust & Operations', items: [
    { to: '/digital/self-service', label: 'Self-Service Hub', icon: LifeBuoy },
    { to: '/digital/privacy', label: 'Privacy & Consent', icon: Lock },
    { to: '/digital/forecast', label: 'Forecasting & Capacity', icon: Calendar },
    { to: '/digital/identity', label: 'Identity Trust', icon: KeyRound },
  ] },
];

const bssGroups: NavGroup[] = [
  { title: 'Commerce', items: [
    { to: '/bss', label: 'Overview', icon: CreditCard },
    { to: '/bss/catalog', label: 'Product Catalog', icon: Layers },
    { to: '/bss/quote-to-order', label: 'Quote-to-Order', icon: FileText },
    { to: '/bss/order-to-activate', label: 'Order-to-Activate', icon: ShoppingCart },
    { to: '/bss/subscriptions', label: 'Subscriptions & Services', icon: Workflow },
    { to: '/bss/numbers', label: 'Numbers & Porting', icon: KeyRound },
  ] },
  { title: 'CRM', items: [
    { to: '/bss/accounts', label: 'Customer Accounts', icon: Users },
    { to: '/bss/customer/CUST-001', label: 'Customer 360', icon: User },
    { to: '/bss/cases', label: 'Cases & SLAs', icon: Headphones },
    { to: '/bss/interactions', label: 'Interactions Timeline', icon: Pulse },
    { to: '/bss/pipeline', label: 'Sales & Renewals', icon: Briefcase },
  ] },
  { title: 'Revenue', items: [
    { to: '/bss/charging', label: 'Charging & Rating', icon: Gauge },
    { to: '/bss/mediation', label: 'Mediation Pipeline', icon: GitMerge },
    { to: '/bss/billing', label: 'Billing & Invoice', icon: Receipt },
    { to: '/bss/bill-run', label: 'Bill-Run Monitor', icon: Calendar },
    { to: '/bss/payments', label: 'Payments & DD', icon: Banknote },
    { to: '/bss/collections', label: 'Collections', icon: Banknote },
    { to: '/bss/disputes', label: 'Disputes & Adjustments', icon: ShieldAlert },
    { to: '/bss/revenue-assurance', label: 'Revenue Assurance', icon: ShieldAlert },
  ] },
  { title: 'Finance & Compliance', items: [
    { to: '/bss/revrec', label: 'Revenue Recognition', icon: Calculator },
    { to: '/bss/tax', label: 'Tax & Regulatory', icon: FileSpreadsheet },
    { to: '/bss/gl', label: 'GL / ERP Recon', icon: GitBranch },
  ] },
  { title: 'Wholesale & Promotions', items: [
    { to: '/bss/wholesale', label: 'Wholesale / MVNO', icon: Building2 },
    { to: '/bss/settlement', label: 'Settlement & IPX', icon: Network },
    { to: '/bss/promotions', label: 'Promotions Engine', icon: Tag },
  ] },
  { title: 'Loyalty & B2B', items: [
    { to: '/bss/loyalty', label: 'Loyalty', icon: Award },
    { to: '/bss/b2b', label: 'Enterprise', icon: Building2 },
  ] },
];

const ossGroups: NavGroup[] = [
  { title: 'Service Operations', items: [
    { to: '/oss', label: 'Overview', icon: Wrench },
    { to: '/oss/service-order', label: 'Service Order (TMF 622)', icon: ClipboardCheck },
    { to: '/oss/provisioning', label: 'Activation (TMF 641)', icon: Hammer },
    { to: '/oss/inventory', label: 'Service Inventory (TMF 638)', icon: InvIcon },
    { to: '/oss/topology', label: 'Network Inventory', icon: Network },
    { to: '/oss/numbers', label: 'Number Portability (MNP)', icon: Hash },
  ] },
  { title: 'Run-the-Network', items: [
    { to: '/oss/assurance', label: 'Service Assurance (TMF 645)', icon: ShieldAlert },
    { to: '/oss/pm-fm', label: 'PM / FM (TMF 681)', icon: Pulse },
    { to: '/oss/son', label: 'Self-Organising Network', icon: Radio },
    { to: '/oss/nfv', label: 'NFV / CNF Lifecycle', icon: Cpu },
    { to: '/oss/slicing', label: '5G Network Slicing', icon: Layers },
    { to: '/oss/field-force', label: 'Network Field Operations', icon: Truck },
    { to: '/oss/slo', label: 'SLO / SLI · Burn rate', icon: Target },
  ] },
  { title: 'Plan & Sustain', items: [
    { to: '/oss/capacity', label: 'Capacity Planner', icon: Gauge },
    { to: '/oss/site-lifecycle', label: 'Site Lifecycle', icon: MapPin },
    { to: '/oss/digital-twin', label: 'Network Digital Twin', icon: Server },
    { to: '/oss/mec', label: 'Edge / MEC', icon: Zap },
    { to: '/oss/energy', label: 'Energy & Sustainability', icon: Leaf },
  ] },
  { title: 'Partner & Compliance', items: [
    { to: '/oss/roaming', label: 'Roaming · IR.21 · IPX', icon: Globe2 },
    { to: '/oss/towerco', label: 'Towerco Settlements', icon: Building2 },
    { to: '/oss/wholesale-ops', label: 'Wholesale / MVNO Ops', icon: Briefcase },
    { to: '/oss/li', label: 'Lawful Intercept', icon: Lock },
    { to: '/oss/mlops', label: 'MLOps · Model Registry', icon: Brain },
  ] },
];

const nocGroups: NavGroup[] = [
  { title: 'Live Ops', items: [
    { to: '/noc', label: 'Command Center', icon: Radio },
    { to: '/noc/wallboard', label: 'Wallboard', icon: Activity },
    { to: '/noc/mim', label: 'Major Incident · MIM', icon: AlertTriangle },
    { to: '/noc/customer-impact', label: 'Customer Impact', icon: Users },
    { to: '/noc/perf', label: 'Live Perf · KPI deck', icon: Gauge },
    { to: '/noc/topology', label: 'Topology', icon: Network },
    { to: '/noc/agents', label: 'Agent Orchestration', icon: Bot },
    { to: '/noc/agent-runs', label: 'Agent Runs', icon: History },
  ] },
  { title: 'Run-the-NOC', items: [
    { to: '/noc/runbooks', label: 'Runbook Library', icon: BookOpen },
    { to: '/noc/shift', label: 'Shift & On-Call', icon: Calendar },
    { to: '/noc/vendor-escalation', label: 'Vendor Escalation', icon: Phone },
    { to: '/noc/synthetic', label: 'Synthetic Probes', icon: FlaskConical },
    { to: '/noc/maintenance', label: 'Maintenance Calendar', icon: Calendar },
    { to: '/noc/change', label: 'Change Mgmt · CAB', icon: ClipboardCheck },
  ] },
  { title: 'Governance & Comms', items: [
    { to: '/noc/pir', label: 'Post-Incident Review', icon: FileText },
    { to: '/noc/status-page', label: 'Status Page', icon: ScrollText },
    { to: '/noc/comms', label: 'Customer Comms', icon: MessageSquare },
    { to: '/noc/resilience', label: 'Resilience · Chaos · DR', icon: ShieldCheck },
    { to: '/noc/csirt', label: 'CSIRT · Cyber', icon: Lock },
  ] },
  { title: 'Network', items: [
    { to: '/network', label: 'Network Map', icon: Map },
    { to: '/events', label: 'Event Stream', icon: ScrollText },
  ] },
];

const referenceGroups: NavGroup[] = [
  { title: 'Reference', items: [
    { to: '/architecture', label: 'Architecture', icon: Boxes },
    { to: '/database', label: 'Database catalog', icon: Database },
    { to: '/scenarios', label: 'Demo scenarios', icon: Sparkles },
    { to: '/lineage', label: 'Decision Lineage', icon: GitBranch },
    { to: '/settings', label: 'Demo catalogue', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ] },
];

const referenceFooterGroup: NavGroup = {
  title: 'Quick links', items: [
    { to: '/', label: 'Demo home', icon: Home },
    { to: '/tours', label: 'Curated tours', icon: Sparkles },
    { to: '/compliance', label: 'Compliance cockpit', icon: ShieldCheck },
    { to: '/scenarios', label: 'All scenarios', icon: Sparkles },
    { to: '/architecture', label: 'Architecture', icon: Boxes },
    { to: '/database', label: 'Database catalog', icon: Database },
    { to: '/settings', label: 'Demo catalogue', icon: BookOpen },
  ],
};

type EffectiveMode = Mode | 'reference';

const GROUPS_BY_MODE: Record<Mode, NavGroup[]> = {
  cic: cicGroups,
  digital: digitalGroups,
  bss: bssGroups,
  oss: ossGroups,
  noc: nocGroups,
};

export function Sidebar() {
  const { selectedIncidentId, selectIncident, toggleChat, chatOpen, mode } = useDemoState();
  const { pathname } = useLocation();
  const effectiveMode: EffectiveMode = pathname.startsWith('/noc') ? 'noc'
    : pathname.startsWith('/digital') ? 'digital'
    : pathname.startsWith('/bss') ? 'bss'
    : pathname.startsWith('/oss') ? 'oss'
    : pathname.startsWith('/architecture') || pathname.startsWith('/settings') || pathname.startsWith('/database') || pathname.startsWith('/scenarios') || pathname.startsWith('/lineage') ? 'reference'
    : pathname.startsWith('/network') || pathname.startsWith('/events') ? (mode === 'noc' ? 'noc' : mode)
    : ['/command-center', '/customer', '/customers', '/compare', '/approvals', '/insights', '/uplift', '/briefing'].some((p) => pathname.startsWith(p)) ? 'cic'
    : (mode as EffectiveMode);

  const groups = effectiveMode === 'reference'
    ? referenceGroups
    : [...GROUPS_BY_MODE[effectiveMode], referenceFooterGroup];

  // Resolve the CIC primary customer for the active scenario so the "Customer 360"
  // sidebar link always opens the protagonist of the running scenario.
  const cicId = cicForIncident(selectedIncidentId);
  const primaryCustomerId = cicId ? cicScenarioById(cicId).primaryCustomerId : 'CUST-001';
  const dynamicGroups: NavGroup[] = groups.map((g) => ({
    ...g,
    items: g.items.map((item) =>
      item.to.startsWith('/customer/CUST-') && effectiveMode === 'cic'
        ? { ...item, to: `/customer/${primaryCustomerId}` }
        : item
    ),
  }));

  const showIncidentPicker = effectiveMode === 'noc' || effectiveMode === 'digital' || effectiveMode === 'oss' || effectiveMode === 'cic' || effectiveMode === 'bss';

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-mist-dark bg-white sticky top-16 self-start" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="p-3 overflow-y-auto flex-1">
        {showIncidentPicker && (
          <div className="px-2 pb-3">
            <div className="text-[10px] uppercase tracking-wider font-bold text-ink-muted mb-1.5">{SECTION_LABEL[effectiveMode as SectionId]} scenarios</div>
            {(() => {
              const list = scenariosFor(effectiveMode as SectionId);
              const active = list.find((s) => s.id === selectedIncidentId);
              return (
                <>
                  <select
                    value={active?.id ?? (list[0]?.id ?? '')}
                    onChange={(e) => selectIncident(e.target.value)}
                    title={active?.title}
                    className="w-full text-xs rounded-lg border border-mist-dark bg-white px-2 py-1.5 font-semibold text-ink"
                  >
                    {list.map((s) => (
                      <option key={s.id} value={s.id} title={s.subtitle}>{s.title}</option>
                    ))}
                  </select>
                  <div className="text-[10px] text-ink-muted leading-snug mt-1.5">
                    Specific to <b>{SECTION_LABEL[effectiveMode as SectionId]}</b>. Stops automatically when you leave this section. Use <kbd className="px-1 rounded bg-mist border border-mist-dark text-[9px] font-mono">⌘K</kbd> for the same list.
                  </div>
                </>
              );
            })()}
          </div>
        )}
        {dynamicGroups.map((g, gi) => (
          <div key={`${g.title}-${gi}`} className="mb-4">
            <div className="px-2 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-ink-muted">{g.title}</div>
            <div className="space-y-0.5">
              {g.items.map((it, ii) => (
                <NavLink
                  key={`${g.title}-${ii}-${it.to}-${it.label}`}
                  to={it.to}
                  end={it.to === '/noc' || it.to === '/digital' || it.to === '/bss' || it.to === '/oss' || it.to === '/'}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition',
                    isActive ? 'bg-vfRed-soft text-vfRed-dark' : 'text-ink-muted hover:bg-mist hover:text-ink'
                  )}
                >
                  <it.icon className="w-4 h-4" />
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-mist-dark space-y-1">
        <button
          onClick={toggleChat}
          className={cn('w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition',
            chatOpen ? 'bg-ink text-white' : 'bg-vfRed text-white hover:bg-vfRed-dark')}
        >
          <MessageSquare className="w-4 h-4" />
          Ask Cortex AI
          <span className="ml-auto text-[10px] opacity-80">?</span>
        </button>
        <div id="sidebar-presenter-slot" />
      </div>
    </aside>
  );
}
