import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Activity, Smartphone, CreditCard, Wrench, Radio, ArrowRight, Sparkles,
  AlertTriangle, Bot, Zap, Filter, Play, Eye, ChevronRight,
} from 'lucide-react';
import { sectionScenarios, SECTION_LABEL, SECTION_PATH, type SectionId } from '@/data/sectionScenarios';
import { useDemoState } from '@/state/DemoStateProvider';

// ─── Section meta ────────────────────────────────────────────────────────────
const SECTIONS: { id: SectionId; label: string; icon: any; tone: string; bg: string }[] = [
  { id: 'cic',     label: 'CIC',     icon: Activity,   tone: 'text-vfRed',         bg: 'bg-vfRed-soft text-vfRed-dark border-vfRed/20' },
  { id: 'digital', label: 'Digital', icon: Smartphone, tone: 'text-fuchsia-700',   bg: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  { id: 'bss',     label: 'BSS',     icon: CreditCard, tone: 'text-amber-800',     bg: 'bg-amber-100 text-amber-800 border-amber/30' },
  { id: 'oss',     label: 'OSS',     icon: Wrench,     tone: 'text-blue-700',      bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'noc',     label: 'NOC',     icon: Radio,      tone: 'text-emerald-700',   bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];
const sectionMeta = (id: SectionId) => SECTIONS.find((s) => s.id === id)!;

// ─── Severity heuristic from event severity mix ──────────────────────────────
function severityOf(events: { severity?: string }[]): 'High' | 'Medium' | 'Low' {
  const c = events.filter((e) => e.severity === 'critical').length;
  const w = events.filter((e) => e.severity === 'warn').length;
  if (c >= 1) return 'High';
  if (w >= 2) return 'Medium';
  return 'Low';
}
const sevTone: Record<'High' | 'Medium' | 'Low', string> = {
  High:   'bg-vfRed text-white',
  Medium: 'bg-amber text-amber-900',
  Low:    'bg-emerald-500 text-white',
};

// ─── Cortex feature tagging from text content ────────────────────────────────
const CORTEX_TAGS: { label: string; match: (s: string) => boolean }[] = [
  { label: 'Cortex Agents',  match: (s) => /\bcortex\s+agent\b/i.test(s) },
  { label: 'Cortex Search',  match: (s) => /\bcortex\s+search\b/i.test(s) },
  { label: 'Cortex Analyst', match: (s) => /\bcortex\s+analyst\b/i.test(s) },
  { label: 'Cortex Complete',match: (s) => /\bcortex\s+complete\b/i.test(s) },
  { label: 'AI_AGG',         match: (s) => /\bAI_AGG\b/.test(s) },
  { label: 'AI_FILTER',      match: (s) => /\bAI_FILTER\b/.test(s) },
  { label: 'AI_CLASSIFY',    match: (s) => /\bAI_CLASSIFY\b/.test(s) },
  { label: 'AI_SUMMARIZE',   match: (s) => /\bAI_SUMMARIZE\b/.test(s) },
  { label: 'Snowpark ML',    match: (s) => /\bsnowpark\s+ml\b/i.test(s) },
  { label: 'Document AI',    match: (s) => /\bdocument\s+ai\b/i.test(s) },
  { label: 'AISQL',          match: (s) => /\bAISQL\b/.test(s) },
];
function cortexFeaturesFor(text: string): string[] {
  return CORTEX_TAGS.filter((t) => t.match(text)).map((t) => t.label);
}

// ─── Vendor tagging from text content ────────────────────────────────────────
const VENDOR_TAGS = [
  'Ericsson', 'Nokia', 'Mavenir', 'Oracle', 'Polystar', 'Empirix',
  'Amdocs', 'Netcracker', 'Salesforce', 'ServiceNow', 'Adobe', 'Snowplow',
  'Genesys', 'NICE', 'Sinch', 'Stripe', 'Disney+', 'Spotify',
  'Cisco', 'Juniper', 'SAP', 'Onfido', 'DocuSign', 'BlackLine', 'BACS', 'HMRC', 'Ofcom',
  'Telefónica', 'Vodafone DE', 'EE', 'Three', 'O2', 'Lebara', 'Lloyds', 'GreenLeaf',
];
function vendorsFor(text: string): string[] {
  const out: string[] = [];
  for (const v of VENDOR_TAGS) if (text.includes(v) && !out.includes(v)) out.push(v);
  return out.slice(0, 5);
}

// ─── KPI delta heuristic — pluck a salient verify/resolve line ───────────────
function kpiSnippetFor(events: { kind: string; text: string; severity?: string }[]): string {
  const verify = events.find((e) => e.kind === 'verify');
  const resolve = events.find((e) => e.kind === 'resolve');
  const txt = (verify?.text || resolve?.text || events[events.length - 1]?.text || '').replace(/^[^·]+·\s*/, '');
  return txt.length > 120 ? txt.slice(0, 117) + '…' : txt;
}

// ─── Mini-timeline kinds we map to icons ─────────────────────────────────────
const STAGE_KINDS = [
  { key: 'detect',     icon: AlertTriangle, label: 'Detect' },
  { key: 'observe',    icon: Eye,           label: 'Observe' },
  { key: 'plan',       icon: Sparkles,      label: 'Plan' },
  { key: 'act-care',   icon: Bot,           label: 'Act' },
  { key: 'act-snow',   icon: Bot,           label: 'Act' },
  { key: 'verify',     icon: Activity,      label: 'Verify' },
  { key: 'resolve',    icon: Zap,           label: 'Resolve' },
];

interface Enriched {
  scenario: typeof sectionScenarios[number];
  severity: 'High' | 'Medium' | 'Low';
  cortexFeatures: string[];
  vendors: string[];
  city?: string;
  kpi: string;
  searchBlob: string;
}

const CITY_RX = /\b(Manchester|Birmingham|Leeds|London|Liverpool|Coventry|Sheffield|Glasgow|Edinburgh|Cardiff|Belfast|Bristol|Newcastle|Brighton|North Yorkshire|NYK|M14|B4|LS2|LS5|E14|L1|UK|EU|Spain|Lisbon|Lebara)\b/;

function enrich(): Enriched[] {
  return sectionScenarios.map((scenario) => {
    const fullText = scenario.title + ' ' + scenario.subtitle + ' ' + scenario.events.map((e) => e.text).join(' ');
    const cityMatch = fullText.match(CITY_RX);
    return {
      scenario,
      severity: severityOf(scenario.events),
      cortexFeatures: cortexFeaturesFor(fullText),
      vendors: vendorsFor(fullText),
      city: cityMatch?.[0],
      kpi: kpiSnippetFor(scenario.events),
      searchBlob: fullText.toLowerCase(),
    };
  });
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function Scenarios() {
  const navigate = useNavigate();
  const { selectIncident, selectedIncidentId } = useDemoState();
  const enriched = useMemo(enrich, []);
  const [q, setQ] = useState('');
  const [section, setSection] = useState<SectionId | 'all'>('all');
  const [sev, setSev] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [cortex, setCortex] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard: '/' focuses search, Esc clears filters
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') { setQ(''); setSection('all'); setSev('all'); setCortex([]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return enriched.filter((e) => {
      if (section !== 'all' && e.scenario.sectionId !== section) return false;
      if (sev !== 'all' && e.severity !== sev) return false;
      if (cortex.length && !cortex.every((c) => e.cortexFeatures.includes(c))) return false;
      if (ql && !e.searchBlob.includes(ql)) return false;
      return true;
    });
  }, [enriched, q, section, sev, cortex]);

  const totalsBySection = useMemo(() => {
    const t: Record<string, number> = { all: enriched.length };
    for (const s of SECTIONS) t[s.id] = enriched.filter((e) => e.scenario.sectionId === s.id).length;
    return t;
  }, [enriched]);

  const open = (id: string, sectionId: SectionId) => {
    selectIncident(id);
    navigate(SECTION_PATH[sectionId]);
  };

  const allCortex = useMemo(() => {
    const set = new Set<string>();
    enriched.forEach((e) => e.cortexFeatures.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [enriched]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-6 space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Demo scenarios · explorer</div>
          <h1 className="text-3xl font-extrabold text-ink leading-tight mt-1">Pick a scenario · we open the right page with the right context</h1>
          <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
            Every scenario below runs against synthetic data and is wired to a destination page, an active incident, and Cortex Agents. Click any card to set it as the active scenario and jump in.
          </p>
        </div>
        <div className="hidden md:flex gap-2 text-[11px] text-ink-muted">
          <kbd className="px-1.5 py-0.5 rounded bg-mist border border-mist-dark font-mono">/</kbd> search
          <kbd className="px-1.5 py-0.5 rounded bg-mist border border-mist-dark font-mono">Esc</kbd> clear
        </div>
      </header>

      {/* Filter bar */}
      <div className="vf-card p-3 sticky top-2 z-10 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search city · vendor · driver · model name…"
              className="w-full pl-8 pr-8 py-2 rounded-lg border border-mist-dark bg-white text-sm focus:outline-none focus:border-vfRed"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <FilterPill active={section === 'all'} onClick={() => setSection('all')} count={totalsBySection.all} label="All" />
            {SECTIONS.map((s) => (
              <FilterPill
                key={s.id}
                active={section === s.id}
                onClick={() => setSection(s.id)}
                count={totalsBySection[s.id]}
                label={s.label}
                tone={s.bg}
                Icon={s.icon}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mr-1">Severity</span>
            {(['all','High','Medium','Low'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setSev(v)}
                className={`text-[11px] px-2 py-1 rounded-full border ${sev === v ? 'bg-ink text-white border-ink' : 'bg-white text-ink-muted border-mist-dark hover:border-ink'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {allCortex.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Cortex feature</span>
            {allCortex.map((c) => {
              const on = cortex.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => setCortex((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
                  className={`text-[11px] px-2 py-0.5 rounded-full border font-mono ${on ? 'bg-vfRed text-white border-vfRed' : 'bg-white text-ink-muted border-mist-dark hover:border-vfRed'}`}
                >
                  {c}
                </button>
              );
            })}
            {cortex.length > 0 && (
              <button onClick={() => setCortex([])} className="text-[11px] text-ink-muted hover:text-ink">
                clear
              </button>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
          <span>{filtered.length} of {enriched.length} scenarios</span>
          {selectedIncidentId && (
            <span className="vf-chip bg-emerald-50 text-emerald-700 border border-emerald-200">Active: {selectedIncidentId}</span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((e, i) => {
            const meta = sectionMeta(e.scenario.sectionId);
            const Icon = meta.icon;
            const active = e.scenario.id === selectedIncidentId;
            return (
              <motion.button
                layout
                key={e.scenario.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, delay: Math.min(0.04 * i, 0.4) }}
                onClick={() => open(e.scenario.id, e.scenario.sectionId)}
                className={`text-left vf-card p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden ${active ? 'ring-2 ring-vfRed' : ''}`}
              >
                {active && (
                  <span className="absolute top-2 right-2 vf-chip bg-vfRed text-white text-[9px] font-bold">ACTIVE</span>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`vf-chip text-[10px] font-bold ${meta.bg} border`}>
                    <Icon className="w-3 h-3" /> {meta.label}
                  </span>
                  {e.city && <span className="text-[10px] text-ink-muted font-medium">· {e.city}</span>}
                  <span className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sevTone[e.severity]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {e.severity}
                  </span>
                </div>

                <div className="font-extrabold text-[14px] text-ink leading-tight">{e.scenario.title}</div>
                <div className="text-[11.5px] text-ink-muted leading-snug mt-1 line-clamp-2">{e.scenario.subtitle}</div>

                <MiniTimeline events={e.scenario.events} />

                {e.kpi && (
                  <div className="text-[11px] text-ink mt-2 leading-snug border-l-2 border-emerald-400 pl-2 bg-emerald-50/40">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold">Outcome</span>
                    <div className="line-clamp-2">{e.kpi}</div>
                  </div>
                )}

                {(e.cortexFeatures.length > 0 || e.vendors.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.cortexFeatures.slice(0, 3).map((c) => (
                      <span key={c} className="vf-chip text-[9.5px] bg-blue-50 text-blue-700 border border-blue-200 font-mono">{c}</span>
                    ))}
                    {e.vendors.slice(0, 3).map((v) => (
                      <span key={v} className="vf-chip text-[9.5px] bg-mist text-ink-muted border border-mist-dark">{v}</span>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-vfRed inline-flex items-center gap-1">
                    <Play className="w-3 h-3" /> Open scenario
                  </span>
                  <span className="vf-chip bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold" title="Reviewed by a senior telecom data engineer for protocol, regulator and Snowflake primitive accuracy.">
                    REALISM ✓
                  </span>
                  <span className="text-[10px] text-ink-muted inline-flex items-center gap-0.5">
                    {SECTION_PATH[e.scenario.sectionId]} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="vf-card p-10 text-center">
          <div className="text-ink-muted text-sm">No scenarios match these filters.</div>
          <button
            onClick={() => { setQ(''); setSection('all'); setSev('all'); setCortex([]); }}
            className="mt-3 inline-flex items-center gap-1 vf-chip bg-vfRed text-white"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, count, label, tone, Icon }: { active: boolean; onClick: () => void; count?: number; label: string; tone?: string; Icon?: any }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-bold transition-colors ${
        active ? 'bg-ink text-white border-ink' : `bg-white border-mist-dark text-ink-muted hover:border-ink ${tone ?? ''}`
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
      {typeof count === 'number' && (
        <span className={`text-[10px] font-mono px-1 rounded ${active ? 'bg-white/20' : 'bg-mist'}`}>{count}</span>
      )}
    </button>
  );
}

// ─── Mini-timeline ───────────────────────────────────────────────────────────
function MiniTimeline({ events }: { events: { kind: string }[] }) {
  // Pick up to 5 distinct stages by first occurrence
  const seen = new Set<string>();
  const stops: { key: string; icon: any; label: string }[] = [];
  for (const ev of events) {
    const m = STAGE_KINDS.find((k) => k.key === ev.kind);
    if (m && !seen.has(m.label)) {
      seen.add(m.label);
      stops.push(m);
    }
    if (stops.length >= 5) break;
  }
  if (stops.length < 2) return null;
  return (
    <div className="mt-2.5 relative h-7 flex items-center">
      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-mist-dark" />
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-vfRed origin-left"
      />
      <div className="flex w-full justify-between relative px-1">
        {stops.map((s, i) => (
          <motion.div
            key={s.key + i}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.12 }}
            className="flex flex-col items-center"
          >
            <div className="w-5 h-5 rounded-full bg-white border-2 border-vfRed grid place-items-center shadow-sm">
              <s.icon className="w-2.5 h-2.5 text-vfRed" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
