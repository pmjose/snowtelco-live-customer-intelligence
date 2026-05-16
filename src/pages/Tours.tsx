import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Clock, Users, Banknote, ChevronRight } from 'lucide-react';
import { tours, type Tour } from '@/data/tours';
import { scenarioById, SECTION_PATH, SECTION_LABEL } from '@/data/sectionScenarios';
import { getScenarioMeta, fmtCount, fmtGbp, fmtHours } from '@/data/scenarioMeta';
import { useDemoState } from '@/state/DemoStateProvider';
import { ScenarioMetaBar } from '@/components/scenarios/ScenarioMetaBar';
import { cn } from '@/lib/utils';

const PAUSE_BETWEEN_SEC = 5;

function tourTotals(t: Tour) {
  let hours = 0, gbp = 0, customers = 0;
  for (const step of t.steps) {
    const sc = scenarioById(step.scenarioId);
    if (!sc) continue;
    const m = getScenarioMeta(sc);
    hours += m.roi.hoursSaved;
    gbp += m.roi.gbpProtected;
    customers += m.roi.customersProtected;
  }
  return { hours, gbp, customers };
}

export default function Tours() {
  const navigate = useNavigate();
  const { selectIncident, resetNoc, toggleNocPlay, nocPlaying } = useDemoState();
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    setActiveTour(null);
    setStepIdx(0);
  };

  useEffect(() => () => stop(), []);

  const launchScenario = (sid: string) => {
    const sc = scenarioById(sid);
    if (!sc) return;
    selectIncident(sid);
    resetNoc();
    navigate(SECTION_PATH[sc.sectionId]);
    window.setTimeout(() => { if (!nocPlaying) toggleNocPlay(); }, 350);
  };

  const startTour = (t: Tour) => {
    setActiveTour(t.id);
    setStepIdx(0);
    runStep(t, 0);
  };

  const runStep = (t: Tour, idx: number) => {
    if (idx >= t.steps.length) { stop(); return; }
    const step = t.steps[idx];
    const sc = scenarioById(step.scenarioId);
    if (!sc) { runStep(t, idx + 1); return; }
    setStepIdx(idx);
    launchScenario(step.scenarioId);
    const totalMs = (sc.durationSec + (step.pauseAfterSec ?? PAUSE_BETWEEN_SEC)) * 1000;
    timerRef.current = window.setTimeout(() => runStep(t, idx + 1), totalMs);
  };

  return (
    <div data-focus="page" className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Curated Tours</div>
        <h1 className="text-2xl font-bold text-ink">One-click executive demos</h1>
        <p className="text-sm text-ink-muted mt-1">Pick a tour. Each scenario runs end-to-end with auto-focus, narrator and timeline; we pause briefly between scenarios so you can talk.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tours.map((t) => {
          const totals = tourTotals(t);
          const running = activeTour === t.id;
          return (
            <div key={t.id} className={cn('vf-card p-5 flex flex-col gap-3 transition', running ? 'ring-2 ring-vfRed' : '')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-vfRed-dark font-bold">{t.audience}</div>
                  <div className="text-lg font-bold text-ink">{t.name}</div>
                  <div className="text-[12.5px] text-ink-muted mt-0.5">{t.blurb}</div>
                </div>
                <div className="vf-chip bg-mist text-ink-muted text-[10px] font-mono">{t.durationMin} min</div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <div className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono font-bold">{fmtHours(totals.hours)}</span>
                  <span className="opacity-70">saved</span>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5">
                  <Banknote className="w-3 h-3" />
                  <span className="font-mono font-bold">{fmtGbp(totals.gbp)}</span>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5">
                  <Users className="w-3 h-3" />
                  <span className="font-mono font-bold">{fmtCount(totals.customers)}</span>
                </div>
                {t.sections.map((s) => (
                  <span key={s} className="vf-chip bg-mist text-ink-muted text-[10px] font-mono">{SECTION_LABEL[s]}</span>
                ))}
              </div>

              <ol className="space-y-1.5">
                {t.steps.map((step, i) => {
                  const sc = scenarioById(step.scenarioId);
                  if (!sc) return null;
                  const current = running && stepIdx === i;
                  return (
                    <li key={step.scenarioId + i} className={cn('flex items-center gap-2 text-[12px] rounded-md px-2 py-1', current ? 'bg-vfRed-soft/40 ring-1 ring-vfRed' : 'hover:bg-mist/60')}>
                      <span className="font-mono text-[10px] text-ink-muted w-6 text-right">{i + 1}.</span>
                      <span className="vf-chip bg-mist text-ink-muted text-[9.5px] font-mono">{SECTION_LABEL[sc.sectionId]}</span>
                      <span className="font-semibold text-ink truncate flex-1">{sc.title}</span>
                      <span className="font-mono text-[10px] text-ink-muted">{sc.durationSec}s</span>
                      {current && <span className="vf-chip bg-vfRed text-white text-[9.5px] font-mono">running</span>}
                    </li>
                  );
                })}
              </ol>

              <div className="flex items-center gap-2 mt-1">
                {!running ? (
                  <button onClick={() => startTour(t)} className="vf-btn-primary inline-flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" /> Start tour
                  </button>
                ) : (
                  <button onClick={stop} className="vf-btn inline-flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5" /> Stop tour
                  </button>
                )}
                <span className="text-[11px] text-ink-muted">Auto-runs each scenario · {PAUSE_BETWEEN_SEC}s breaks for narration.</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="vf-card p-4">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-ink-muted" />
          <div className="font-semibold text-ink text-sm">Want to design your own tour?</div>
        </div>
        <div className="text-[12px] text-ink-muted mt-1">Use ⌘K on any section to run any of the 90+ scenarios on demand. Tours just stitch them together.</div>
      </div>
    </div>
  );
}

// Render a meta bar inline for a scenario id (small helper used in lists)
export function ScenarioMetaInline({ scenarioId }: { scenarioId: string }) {
  const sc = scenarioById(scenarioId);
  if (!sc) return null;
  return <ScenarioMetaBar scenario={sc} />;
}
