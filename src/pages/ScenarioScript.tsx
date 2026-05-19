import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clipboard, Play, Printer, FileText, Bot, Wrench } from 'lucide-react';
import { scenarioById, SECTION_LABEL } from '@/data/sectionScenarios';
import { incidentById, nocIncidents } from '@/data/nocIncidents';
import { presenterFor, derivePresenterFor, type PresenterScript, type NocStageKey, type DomainKey } from '@/data/presenterScripts';
import { getScenarioMeta, fmtGbp, fmtCount, fmtHours } from '@/data/scenarioMeta';
import { getCheatsheet, getCheatsheetForNoc } from '@/data/presenterCheatsheet';
import { ScreenshotCard } from '@/components/scenarios/ScreenshotCard';
import { ScenarioMetaBar } from '@/components/scenarios/ScenarioMetaBar';

const STAGE_ORDER: { key: NocStageKey; label: string; tone: string }[] = [
  { key: 'detect',       label: 'Detect',       tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'observe',      label: 'Observe',      tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'hypothesize',  label: 'Hypothesise',  tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'plan',         label: 'Plan',         tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'act',          label: 'Act',          tone: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  { key: 'verify',       label: 'Verify',       tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'resolved',     label: 'Resolve',      tone: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const DOMAIN_TO_PATH: Record<DomainKey, string> = {
  cic: '/command-center',
  digital: '/digital',
  bss: '/bss',
  oss: '/oss',
  noc: '/noc',
};

const SECTION_HOME: Record<string, string> = {
  cic: '/command-center',
  digital: '/digital',
  bss: '/bss',
  oss: '/oss',
  noc: '/noc',
};

interface UnifiedScenario {
  kind: 'section' | 'noc';
  id: string;
  title: string;
  subtitle: string;
  sectionId: 'cic' | 'digital' | 'bss' | 'oss' | 'noc';
  durationSec?: number;
  events: { tSec: number; kind: string; text: string; severity?: string }[];
  liveRoute: string;
}

function buildUnified(id: string): { unified: UnifiedScenario; script: PresenterScript } | null {
  // NOC first
  const nocLikely = nocIncidents.find((i) => i.id === id);
  if (nocLikely) {
    const script = presenterFor(id);
    if (!script) return null;
    return {
      unified: {
        kind: 'noc',
        id,
        title: `${nocLikely.city} · ${nocLikely.affectedTechnology.join(' · ')}`,
        subtitle: nocLikely.rootCauseHypothesis,
        sectionId: 'noc',
        events: [],
        liveRoute: '/noc',
      },
      script,
    };
  }
  // Section
  const sc = scenarioById(id);
  if (sc) {
    const script = presenterFor(id) ?? derivePresenterFor(sc);
    return {
      unified: {
        kind: 'section',
        id: sc.id,
        title: sc.title,
        subtitle: sc.subtitle,
        sectionId: sc.sectionId,
        durationSec: sc.durationSec,
        events: sc.events.map((e) => ({ tSec: (e as any).atSec ?? 0, kind: e.kind, text: e.text, severity: (e as any).severity })),
        liveRoute: SECTION_HOME[sc.sectionId] ?? '/scenarios',
      },
      script,
    };
  }
  return null;
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) navigator.clipboard.writeText(text);
}

function buildPlainScript(u: UnifiedScenario, script: PresenterScript): string {
  const lines: string[] = [];
  lines.push(`SCENARIO: ${u.title}`);
  lines.push(`SECTION:  ${SECTION_LABEL[u.sectionId]}`);
  lines.push('');
  lines.push('INTRO');
  lines.push(script.intro);
  lines.push('');
  for (const stage of STAGE_ORDER) {
    const beat = script.beatsByStage[stage.key];
    if (!beat) continue;
    lines.push(`— ${stage.label.toUpperCase()} —`);
    lines.push(beat);
    lines.push('');
  }
  lines.push('CLOSING');
  lines.push(script.closing);
  return lines.join('\n');
}

export default function ScenarioScript() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const printMode = searchParams.get('print') === '1';

  const built = useMemo(() => buildUnified(id), [id]);

  if (!built) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/scenarios" className="inline-flex items-center gap-1 text-vfRed font-bold text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to scenarios
        </Link>
        <div className="vf-card p-8">
          <div className="text-lg font-extrabold text-ink">Scenario not found</div>
          <div className="text-sm text-ink-muted mt-1">No scenario with id <code className="font-mono">{id}</code>. <Link to="/scenarios" className="text-vfRed underline">Browse the catalog</Link>.</div>
        </div>
      </div>
    );
  }

  const { unified: u, script } = built;
  const sectionMeta = u.kind === 'section' ? getScenarioMeta(scenarioById(u.id)!) : null;
  const cheats = u.kind === 'noc' ? getCheatsheetForNoc() : getCheatsheet(scenarioById(u.id)!);
  const eventsByStage: Record<string, typeof u.events> = {};
  for (const ev of u.events) {
    const k = ev.kind.replace(/^act-.*/, 'act').replace('alarm', 'detect').replace('resolve', 'resolved');
    eventsByStage[k] = eventsByStage[k] ?? [];
    eventsByStage[k].push(ev);
  }
  const captionFor = (label: string) => `Stage: ${label}. Live UI shows scenario "${u.title}".`;

  return (
    <div className={printMode ? 'scenario-script-print' : 'min-h-screen bg-mist/40'}>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-5">

        {/* Toolbar */}
        <div className="flex items-center gap-2 no-print">
          <Link to="/scenarios" className="inline-flex items-center gap-1 text-vfRed font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to scenarios
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <Link to={u.liveRoute} className="vf-chip bg-vfRed text-white text-[11px] font-bold inline-flex items-center gap-1 hover:bg-vfRed-dark">
              <Play className="w-3 h-3" /> Open the live stage
            </Link>
            <button
              onClick={() => copyToClipboard(buildPlainScript(u, script))}
              className="vf-chip bg-white text-ink border border-mist-dark text-[11px] font-bold inline-flex items-center gap-1 hover:bg-mist"
              title="Copy script to clipboard"
            >
              <Clipboard className="w-3 h-3" /> Copy
            </button>
            <a
              href={`?print=1`}
              target="_blank"
              rel="noopener"
              className="vf-chip bg-white text-ink border border-mist-dark text-[11px] font-bold inline-flex items-center gap-1 hover:bg-mist"
              title="Print-friendly version"
            >
              <Printer className="w-3 h-3" /> Print
            </a>
          </div>
        </div>

        {/* Header */}
        <header>
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-vfRed">{SECTION_LABEL[u.sectionId]}</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink leading-tight mt-1">{u.title}</h1>
          <p className="text-sm text-ink-muted leading-snug mt-1.5">{u.subtitle}</p>
          {sectionMeta && u.kind === 'section' && (
            <div className="mt-3">
              <ScenarioMetaBar scenario={scenarioById(u.id)!} variant="wide" />
            </div>
          )}
          {u.durationSec && (
            <div className="text-[11px] text-ink-muted mt-2">Stage runtime: <span className="font-bold text-ink">~{u.durationSec}s</span> · Live event count: <span className="font-bold text-ink">{u.events.length}</span></div>
          )}
        </header>

        {/* Hero screenshot */}
        <ScreenshotCard scenarioId={u.id} sectionId={u.sectionId} title={u.title} caption={captionFor('intro / opening')} />

        {/* INTRO */}
        <Block label="INTRO" sub={u.durationSec ? `T+0 → T+${Math.min(6, u.durationSec)}s` : 'Opening beat'} tone="bg-vfRed/10 text-vfRed border-vfRed/30">
          <p className="text-[15px] leading-relaxed text-ink">{script.intro}</p>
          <PresenterTip>Set the room: name the persona, the cohort and the regulator/standards on the table. Pause before pressing play.</PresenterTip>
        </Block>

        {/* PER STAGE */}
        {STAGE_ORDER.map((stage) => {
          const beat = script.beatsByStage[stage.key];
          if (!beat) return null;
          const evs = eventsByStage[stage.key] ?? [];
          return (
            <Block key={stage.key} label={stage.label.toUpperCase()} tone={stage.tone}>
              <p className="text-[15px] leading-relaxed text-ink">{beat}</p>
              <div className="mt-3">
                <ScreenshotCard
                  scenarioId={u.id}
                  sectionId={u.sectionId}
                  title={u.title}
                  stage={stage.key}
                  caption={captionFor(stage.label)}
                />
              </div>
              {evs.length > 0 && (
                <div className="mt-3 vf-card p-3 bg-mist/40">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1.5">Live event log · {stage.label}</div>
                  <ul className="space-y-1">
                    {evs.map((ev, i) => (
                      <li key={i} className="text-[12px] text-ink leading-snug">
                        <span className="font-mono text-ink-muted mr-2">t+{ev.tSec}s</span>
                        <span className="font-mono text-[10px] text-vfRed mr-2">{ev.kind}</span>
                        {ev.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Block>
          );
        })}

        {/* CLOSING */}
        <Block label="CLOSING" sub="Resolve / outcome" tone="bg-emerald-50 text-emerald-700 border-emerald-200">
          <p className="text-[15px] leading-relaxed text-ink">{script.closing}</p>
          <PresenterTip>Land the headline number. Connect to the next scenario in your tour, or invite the audience question.</PresenterTip>
        </Block>

        {/* DOMAIN NOTES */}
        {Object.keys(script.domainNotes).length > 0 && (
          <section className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-ink-muted">If asked about other parts of the stack</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(Object.keys(script.domainNotes) as DomainKey[]).map((d) => (
                <div key={d} className="vf-card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="vf-chip bg-mist text-ink-muted text-[9px] font-bold uppercase">{d}</span>
                    <Link to={DOMAIN_TO_PATH[d]} className="ml-auto text-[10px] text-vfRed font-bold inline-flex items-center gap-0.5 hover:underline">
                      Open {d.toUpperCase()} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-[12.5px] text-ink leading-snug">{script.domainNotes[d]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CHEAT SHEET */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-vfRed" />
            <h2 className="text-base font-extrabold text-ink">Anticipated Q&A — presenter cheat sheet</h2>
          </div>
          <div className="space-y-2">
            {cheats.map((qa, i) => (
              <details key={i} className="vf-card p-3 group" open={i === 0 || printMode}>
                <summary className="cursor-pointer list-none flex items-start gap-2">
                  <span className="vf-chip bg-vfRed text-white text-[9px] font-bold mt-0.5">Q{i + 1}</span>
                  <span className="text-[13px] font-bold text-ink leading-snug flex-1">{qa.q}</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted group-open:rotate-90 transition" />
                </summary>
                <p className="mt-2 ml-9 text-[12.5px] text-ink leading-snug">{qa.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* PRESENTER STANDARDS / SF SUMMARY */}
        {sectionMeta && (
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-700" />
              <h2 className="text-base font-extrabold text-ink">Engineer-mode summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="vf-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1.5">Standards cited</div>
                <div className="flex flex-wrap gap-1">
                  {sectionMeta.standards.length ? sectionMeta.standards.map((s) => (
                    <span key={s} className="vf-chip text-[9.5px] bg-mist text-ink-muted border border-mist-dark font-mono">{s}</span>
                  )) : <span className="text-[12px] text-ink-muted">No specific standard cited.</span>}
                </div>
              </div>
              <div className="vf-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold mb-1.5">Snowflake primitives</div>
                <div className="flex flex-wrap gap-1">
                  {sectionMeta.snowflakePrimitives.length ? sectionMeta.snowflakePrimitives.map((s) => (
                    <span key={s} className="vf-chip text-[9.5px] bg-blue-50 text-blue-700 border border-blue-200 font-mono">{s}</span>
                  )) : <span className="text-[12px] text-ink-muted">No Snowflake primitive surfaced.</span>}
                </div>
              </div>
            </div>
            <div className="vf-card p-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Hours saved</div>
                <div className="text-xl font-extrabold text-ink mt-0.5">{fmtHours(sectionMeta.roi.hoursSaved)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">£ protected / unlocked</div>
                <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{fmtGbp(sectionMeta.roi.gbpProtected)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Customers in scope</div>
                <div className="text-xl font-extrabold text-ink mt-0.5">{fmtCount(sectionMeta.roi.customersProtected)}</div>
              </div>
            </div>
          </section>
        )}

        {/* Footer nav */}
        <footer className="flex items-center justify-between pt-4 border-t border-mist-dark mt-4 no-print">
          <Link to="/scenarios" className="text-[12px] text-ink-muted font-bold hover:text-ink inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All scenarios
          </Link>
          <Link to={u.liveRoute} className="text-[12px] text-vfRed font-bold inline-flex items-center gap-1 hover:underline">
            Run this scenario live <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </div>
    </div>
  );
}

function Block({ label, sub, tone, children }: { label: string; sub?: string; tone: string; children: React.ReactNode }) {
  return (
    <section className="vf-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`vf-chip text-[10px] font-extrabold tracking-wider border ${tone}`}>{label}</span>
        {sub && <span className="text-[10px] text-ink-muted font-bold">· {sub}</span>}
      </div>
      {children}
    </section>
  );
}

function PresenterTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2.5 flex items-start gap-2 rounded-md bg-mist/60 border border-mist-dark px-2.5 py-1.5">
      <Bot className="w-3.5 h-3.5 text-vfRed mt-0.5 shrink-0" />
      <span className="text-[11.5px] text-ink-muted leading-snug">{children}</span>
    </div>
  );
}
