import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, X, ChevronLeft, ChevronRight, Pause, Play, Wrench } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDemoState } from '@/state/DemoStateProvider';
import { presenterFor, derivePresenterFor, type DomainKey, type NocStageKey } from '@/data/presenterScripts';
import { incidentById } from '@/data/nocIncidents';
import { scenarioById as sectionScenarioById, sectionFromPath, SECTION_LABEL } from '@/data/sectionScenarios';
import { getScenarioMeta } from '@/data/scenarioMeta';
import { cn } from '@/lib/utils';

const STAGE_ORDER: NocStageKey[] = ['idle', 'detect', 'observe', 'hypothesize', 'plan', 'act', 'verify', 'resolved'];

function domainFromPath(p: string): DomainKey {
  if (p.startsWith('/noc')) return 'noc';
  if (p.startsWith('/digital')) return 'digital';
  if (p.startsWith('/bss')) return 'bss';
  if (p.startsWith('/oss')) return 'oss';
  return 'cic';
}

function isCicRoute(p: string) {
  return p === '/' || ['/command-center', '/customer', '/customers', '/compare', '/approvals', '/insights', '/uplift', '/lineage', '/briefing'].some((x) => p.startsWith(x));
}

export function Narrator() {
  const { narratorOn, setNarratorOn, scenario, stage, currentStage, selectedIncidentId, nocPlaying, firedEvents } = useDemoState();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [manualStageIdx, setManualStageIdx] = useState<number | null>(null);
  const [engineerMode, setEngineerMode] = useState(false);

  const presenter = presenterFor(selectedIncidentId);
  const incident = incidentById(selectedIncidentId);
  const sectionScenario = sectionScenarioById(selectedIncidentId);
  // Derive a presenter from a section scenario when none is hand-written.
  // This gives every CIC/Digital/BSS/OSS scenario a staged narrator
  // (intro → per-stage → closing) without manually authoring 90 scripts.
  const derivedPresenter = useMemo(
    () => (sectionScenario && !presenter ? derivePresenterFor(sectionScenario) : null),
    [sectionScenario, presenter]
  );
  const effectivePresenter = presenter ?? derivedPresenter;
  const currentSection = sectionFromPath(pathname);
  const domain = domainFromPath(pathname);
  const onCic = isCicRoute(pathname);

  // Use staged-presenter mode when we have any presenter (manual or derived).
  // The live-event-text mode is the fallback.
  const useSectionScenario = !!sectionScenario && sectionScenario.sectionId !== 'noc' && !presenter && !derivedPresenter;

  // Reset manual override on context change
  useEffect(() => { setManualStageIdx(null); }, [selectedIncidentId, nocPlaying, scenario?.id]);

  const liveStageIdx = STAGE_ORDER.indexOf(currentStage as NocStageKey);
  const stageIdx = manualStageIdx ?? Math.max(0, liveStageIdx);
  const stageKey = STAGE_ORDER[stageIdx] as NocStageKey;

  // CIC mode (legacy stage-based narration) takes priority when on a CIC route
  // AND no scenario events have fired yet.
  const useCic = onCic && firedEvents.length === 0 && !nocPlaying && !useSectionScenario;

  const { topLine, kicker } = useMemo(() => {
    if (useCic && scenario) {
      const line = scenario.narration?.[stage];
      if (line) return { topLine: line, kicker: `CIC · ${scenario.short ?? scenario.label}` };
    }
    if (useSectionScenario && sectionScenario) {
      const sectionLabel = SECTION_LABEL[sectionScenario.sectionId];
      const latest = firedEvents[0];
      if (!latest) {
        return { topLine: sectionScenario.subtitle, kicker: `${sectionLabel} · ${sectionScenario.title}` };
      }
      const offSection = currentSection && currentSection !== sectionScenario.sectionId;
      const kickerSuffix = offSection ? ` · (in ${SECTION_LABEL[currentSection!]})` : '';
      return {
        topLine: latest.text,
        kicker: `${sectionLabel} · ${latest.kind}${kickerSuffix}`,
      };
    }
    if (!effectivePresenter) {
      return { topLine: 'Press \u2318K to run a scenario, or open the NOC Command Center and pick one from the queue.', kicker: 'Presenter' };
    }
    if (stageKey === 'idle' && !nocPlaying && firedEvents.length === 0) return { topLine: effectivePresenter.intro, kicker: `${incident?.city ?? sectionScenario?.title ?? 'Scenario'} · intro` };
    if (stageKey === 'idle') return { topLine: effectivePresenter.intro, kicker: `${incident?.city ?? sectionScenario?.title ?? 'Scenario'} · intro` };
    if (stageKey === 'resolved') return { topLine: effectivePresenter.closing, kicker: `${incident?.city ?? sectionScenario?.title ?? 'Scenario'} · closing` };
    if (domain !== 'noc' && effectivePresenter.domainNotes[domain]) {
      return { topLine: effectivePresenter.domainNotes[domain]!, kicker: `In ${domain.toUpperCase()} · ${stageKey}` };
    }
    const beat = effectivePresenter.beatsByStage[stageKey];
    if (beat) return { topLine: beat, kicker: `${stageKey} · ${incident?.city ?? sectionScenario?.title ?? ''}` };
    return { topLine: effectivePresenter.intro, kicker: incident?.city ?? sectionScenario?.title ?? 'Scenario' };
  }, [presenter, derivedPresenter, effectivePresenter, scenario, stage, stageKey, domain, nocPlaying, firedEvents, incident, useCic, useSectionScenario, sectionScenario, currentSection]);

  const latestEvent = firedEvents[0];

  if (!narratorOn) {
    return (
      <button
        onClick={() => setNarratorOn(true)}
        className="fixed bottom-4 left-4 z-40 w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center shadow-md hover:shadow-lg no-print"
        title="Show presenter narrator"
        aria-label="Show presenter narrator"
      >
        <Mic className="w-4 h-4" />
      </button>
    );
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-40 vf-card px-3 py-2 flex items-center gap-2 no-print hover:shadow-lg"
      >
        <Mic className="w-3.5 h-3.5 text-vfRed" />
        <span className="text-[11px] font-bold text-ink">Presenter</span>
        <span className="vf-chip bg-mist text-ink-muted text-[9.5px] font-mono">{useCic ? stage : stageKey}</span>
      </button>
    );
  }

  const canPrev = stageIdx > 0;
  const canNext = stageIdx < STAGE_ORDER.length - 1;
  const isManual = manualStageIdx !== null;
  const showStageBar = !useCic && !useSectionScenario;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-md w-[420px] no-print">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${useCic ? scenario?.id : selectedIncidentId}-${useCic ? stage : stageKey}-${domain}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className="vf-card border-l-4 border-l-vfRed shadow-xl"
        >
          <div className="p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-vfRed text-white grid place-items-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-ink-muted truncate">{kicker}</div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEngineerMode((v) => !v)}
                      className={cn('text-[9.5px] font-bold uppercase px-1.5 py-1 rounded-md inline-flex items-center gap-0.5',
                        engineerMode ? 'bg-blue-100 text-blue-700' : 'bg-mist text-ink-muted hover:text-ink')}
                      title={engineerMode ? 'Hide engineer detail' : 'Show engineer detail'}
                    >
                      <Wrench className="w-3 h-3" /> ENG
                    </button>
                    <button
                      onClick={() => setCollapsed(true)}
                      className="text-ink-muted hover:text-ink text-[10px] uppercase font-bold"
                      title="Collapse"
                    >
                      —
                    </button>
                    <button onClick={() => setNarratorOn(false)} className="text-ink-muted hover:text-ink" title="Close">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-[13.5px] font-semibold text-ink leading-snug mt-1">{topLine}</div>
                {engineerMode && sectionScenario && (() => {
                  const meta = getScenarioMeta(sectionScenario);
                  return (
                    <div className="mt-2 pt-2 border-t border-mist-dark/60 space-y-1">
                      {meta.standards.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Standards</span>
                          {meta.standards.slice(0, 6).map((s) => (
                            <span key={s} className="vf-chip text-[9.5px] bg-mist text-ink-muted border border-mist-dark font-mono">{s}</span>
                          ))}
                        </div>
                      )}
                      {meta.snowflakePrimitives.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] uppercase tracking-wider text-blue-700 font-bold">Snowflake</span>
                          {meta.snowflakePrimitives.slice(0, 6).map((s) => (
                            <span key={s} className="vf-chip text-[9.5px] bg-blue-50 text-blue-700 border border-blue-200 font-mono">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

    {latestEvent && effectivePresenter && !useCic && !useSectionScenario && (
              <div className="mt-2.5 pt-2.5 border-t border-mist-dark/60 text-[10.5px] leading-snug">
                <span className="text-ink-muted">Live event · </span>
                <span className="text-ink">{latestEvent.text}</span>
              </div>
            )}

            {showStageBar && (
              <div className="mt-2.5 flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {STAGE_ORDER.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setManualStageIdx(i)}
                      disabled={!effectivePresenter}
                      className={cn('h-1.5 rounded-full transition',
                        i === stageIdx ? 'w-5 bg-vfRed' : i <= liveStageIdx ? 'w-2 bg-vfRed/40' : 'w-2 bg-mist',
                        !effectivePresenter && 'opacity-50')}
                      title={s}
                    />
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {effectivePresenter && (
                    <>
                      <button
                        disabled={!canPrev}
                        onClick={() => setManualStageIdx(Math.max(0, stageIdx - 1))}
                        className="w-7 h-7 rounded-md hover:bg-mist text-ink disabled:opacity-30 grid place-items-center"
                        title="Previous beat"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setManualStageIdx(null)}
                        className={cn('text-[9.5px] font-bold uppercase px-1.5 py-1 rounded-md',
                          isManual ? 'bg-amber/30 text-amber-900' : 'bg-emerald-100 text-emerald-700')}
                        title={isManual ? 'Resume auto' : 'Auto'}
                      >
                        {isManual ? <Play className="w-3 h-3 inline" /> : <Pause className="w-3 h-3 inline" />}
                        <span className="ml-1">{isManual ? 'Manual' : 'Auto'}</span>
                      </button>
                      <button
                        disabled={!canNext}
                        onClick={() => setManualStageIdx(Math.min(STAGE_ORDER.length - 1, stageIdx + 1))}
                        className="w-7 h-7 rounded-md hover:bg-mist text-ink disabled:opacity-30 grid place-items-center"
                        title="Next beat"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
