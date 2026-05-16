import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Pause, RotateCcw, Radio, ChevronDown, ChevronUp, Crosshair, SkipBack, SkipForward } from 'lucide-react';
import { useDemoState, type PlaySpeed } from '@/state/DemoStateProvider';
import { scenarioById, scriptForScenario, sectionFromPath, SECTION_LABEL, SECTION_PATH } from '@/data/sectionScenarios';
import { cn } from '@/lib/utils';

const SPEEDS: PlaySpeed[] = [0.25, 0.5, 1, 2, 4];

export function ScenarioTransport() {
  const { nocPlaying, toggleNocPlay, resetNoc, stepBeat, playSpeed, setPlaySpeed, tElapsedMs, selectedIncidentId, currentStage, firedEvents, focusEnabled, setFocusEnabled } = useDemoState();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Keyboard shortcut: Space to toggle play (when not in input) — must be
  // before any early return to keep hook order stable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggleNocPlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleNocPlay]);

  // Hide on the bare landing page
  if (pathname === '/') return null;

  // Hide if the active scenario doesn't belong to the current section
  // (the SectionAutoReset effect will swap it shortly)
  const currentSection = sectionFromPath(pathname);
  const sc = scenarioById(selectedIncidentId);
  if (!sc || !currentSection || sc.sectionId !== currentSection) return null;

  const script = scriptForScenario(selectedIncidentId);
  const pct = Math.min(100, (tElapsedMs / (script.durationSec * 1000)) * 100);
  const elapsed = (tElapsedMs / 1000).toFixed(1);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 vf-card px-3 py-2 flex items-center gap-2 no-print hover:shadow-lg shadow-md"
        title="Expand scenario controls"
      >
        <Radio className={cn('w-3.5 h-3.5', nocPlaying ? 'text-vfRed animate-pulse' : 'text-ink-muted')} />
        <span className="text-[11px] font-bold text-ink">{SECTION_LABEL[sc.sectionId]} · {sc.title}</span>
        <span className="vf-chip bg-mist text-ink-muted text-[9.5px] font-mono">{playSpeed}×</span>
        <ChevronUp className="w-3 h-3 text-ink-muted" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 no-print">
      <div className="vf-card shadow-2xl border-l-4 border-l-vfRed w-[440px] max-w-[calc(100vw-2rem)]">
        <div className="px-3 pt-2.5 pb-2 flex items-center gap-2 border-b border-mist-dark/60">
          <Radio className={cn('w-3.5 h-3.5', nocPlaying ? 'text-vfRed animate-pulse' : 'text-ink-muted')} />
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{SECTION_LABEL[sc.sectionId]} scenario</div>
          <span className={cn('vf-chip text-[9.5px] font-mono uppercase',
            currentStage === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
            currentStage === 'idle' ? 'bg-mist text-ink-muted' :
            'bg-amber/30 text-amber-900')}>
            {currentStage}
          </span>
          <span className="vf-chip bg-vfRed-soft text-vfRed-dark text-[9.5px] font-mono font-bold">{playSpeed}×</span>
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto text-ink-muted hover:text-ink"
            title="Collapse"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-2">
          <div className="flex items-center justify-between text-[11px]">
            <Link to={SECTION_PATH[sc.sectionId]} className="font-bold text-ink truncate hover:text-vfRed-dark" title={sc.subtitle}>
              {sc.title}
            </Link>
            <span className="text-ink-muted font-mono shrink-0 ml-2">T+ {elapsed}s / {script.durationSec}s</span>
          </div>
          <div className="h-1.5 rounded-full bg-mist overflow-hidden mt-1">
            <div className="h-full bg-vfRed transition-all duration-150" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="px-3 pb-2.5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => stepBeat('back')}
            disabled={nocPlaying || tElapsedMs <= 0}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[11px] font-semibold border border-mist-dark text-ink hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed"
            title="Step back one beat (only when paused)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={toggleNocPlay}
            className={cn('inline-flex items-center gap-1 h-9 px-3 rounded-lg text-[12px] font-bold transition',
              nocPlaying ? 'bg-ink text-white hover:bg-ink/90' : 'bg-vfRed text-white hover:bg-vfRed-dark')}
            title={nocPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {nocPlaying
              ? <><Pause className="w-3.5 h-3.5" /> Pause</>
              : <><Play className="w-3.5 h-3.5" /> {firedEvents.length > 0 && currentStage !== 'resolved' ? 'Resume' : 'Run scenario'}</>}
          </button>

          <button
            onClick={() => stepBeat('forward')}
            disabled={nocPlaying || currentStage === 'resolved'}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[11px] font-semibold border border-mist-dark text-ink hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed"
            title="Step forward one beat (only when paused)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={resetNoc}
            className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-[11px] font-semibold border border-mist-dark text-ink hover:bg-mist"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            onClick={() => setFocusEnabled(!focusEnabled)}
            className={cn('inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-[11px] font-semibold border transition',
              focusEnabled ? 'border-vfRed/40 bg-vfRed/10 text-vfRed-dark' : 'border-mist-dark text-ink-muted hover:bg-mist')}
            title={focusEnabled ? 'Auto-focus is ON — events will steer the UI' : 'Auto-focus is OFF'}
          >
            <Crosshair className="w-3.5 h-3.5" /> Focus
          </button>

          <div className="ml-auto inline-flex items-center rounded-lg bg-mist border border-mist-dark p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setPlaySpeed(s)}
                className={cn('px-2 h-8 rounded-md text-[10.5px] font-bold transition',
                  playSpeed === s ? 'bg-white text-ink shadow-sm border border-mist-dark' : 'text-ink-muted hover:text-ink')}
                title={s < 1 ? 'Slower' : s > 1 ? 'Faster' : 'Real-time-ish'}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
