import { Link } from 'react-router-dom';
import { Network, History, Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX, Bot } from 'lucide-react';
import { NocKpiStrip } from '@/components/noc/NocKpiStrip';
import { IncidentQueue } from '@/components/noc/IncidentQueue';
import { IncidentDetail } from '@/components/noc/IncidentDetail';
import { ActionTray } from '@/components/noc/ActionTray';
import { AgentReasoning } from '@/components/agent/AgentReasoning';
import { MiniMap } from '@/components/noc/MiniMap';
import { ScenarioTimeline } from '@/components/timeline/ScenarioTimeline';
import { liveAgentRun } from '@/data/agentRuns';
import { useDemoState } from '@/state/DemoStateProvider';
import { useEffect, useMemo, useState } from 'react';
import { scriptForScenario } from '@/data/sectionScenarios';
import { cn } from '@/lib/utils';

const STAGE_LABELS: Record<string, string> = {
  idle: 'Idle',
  detect: 'Detect',
  observe: 'Observe',
  hypothesize: 'Hypothesize',
  plan: 'Plan',
  act: 'Act',
  verify: 'Verify',
  resolved: 'Resolved',
};

export default function NocCommandCenter() {
  const {
    nocPlaying, toggleNocPlay, resetNoc,
    tElapsedMs, playSpeed, setPlaySpeed,
    soundOn, setSoundOn,
    selectedIncidentId, currentStage, firedEvents,
    bigScreen, toggleBigScreen,
  } = useDemoState();
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'denied'>>({});

  // Keyboard 'B' toggle big-screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'b' || e.key === 'B') toggleBigScreen();
      if (e.key === ' ') { e.preventDefault(); toggleNocPlay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleBigScreen, toggleNocPlay]);

  const script = scriptForScenario(selectedIncidentId);
  const totalSec = script.durationSec;

  const visibleRun = useMemo(() => {
    // Reveal reasoning steps based on currentStage progression
    const stageOrder: Array<typeof currentStage> = ['idle', 'detect', 'observe', 'hypothesize', 'plan', 'act', 'verify', 'resolved'];
    const idx = stageOrder.indexOf(currentStage);
    const stepsToShow = currentStage === 'idle' ? 0 : Math.min(liveAgentRun.steps.length, idx);
    return {
      ...liveAgentRun,
      steps: liveAgentRun.steps.slice(0, stepsToShow).map((s, i) => {
        if (decisions[i]) return { ...s, outcome: decisions[i] };
        if (i === 3 && currentStage === 'act') return { ...s, outcome: 'auto' as const };
        return s;
      }),
      outcome: currentStage === 'resolved' ? 'Resolved — KPIs verified within 5-min window.' : liveAgentRun.outcome,
    };
  }, [currentStage, decisions]);

  const decideStep = (idx: number, outcome: 'approved' | 'denied') => {
    setDecisions((prev) => ({ ...prev, [idx]: outcome }));
  };

  const tickerEvents = firedEvents.slice(0, 6);

  return (
    <div className={cn('mx-auto px-3 lg:px-4 py-3 space-y-3', bigScreen ? 'max-w-full' : 'max-w-[1700px]')}>
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Network Operations</div>
          <h1 className={cn('font-extrabold text-ink leading-tight', bigScreen ? 'text-3xl' : 'text-2xl')}>Agentic NOC Command Center</h1>
          <p className="text-xs text-ink-muted">Detect → diagnose → decide → act → verify · NOC orchestrator drives all domains in sync.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('vf-chip text-[10px] uppercase font-bold', currentStage === 'detect' || currentStage === 'act' ? 'bg-vfRed text-white animate-pulse' : currentStage === 'resolved' ? 'bg-emerald-500 text-white' : currentStage === 'idle' ? 'bg-mist text-ink-muted' : 'bg-vfRed-soft text-vfRed-dark')}>
            {STAGE_LABELS[currentStage] || currentStage}
          </span>
          <span className="vf-chip bg-mist text-ink font-mono text-[11px]">T+ {(tElapsedMs / 1000).toFixed(1)}s / {totalSec}s</span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-mist border border-mist-dark p-0.5">
            <button onClick={toggleNocPlay} className={cn('inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-bold', nocPlaying ? 'bg-ink text-white' : 'bg-vfRed text-white hover:bg-vfRed-dark')}>
              {nocPlaying ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Run scenario</>}
            </button>
            <button onClick={resetNoc} title="Reset" className="inline-flex items-center h-7 px-2 rounded-md text-[11px] font-bold text-ink-muted hover:bg-white">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <SpeedToggle value={playSpeed} onChange={setPlaySpeed} />
          <button onClick={() => setSoundOn(!soundOn)} title={`Sounds ${soundOn ? 'on' : 'off'}`} className="vf-chip bg-mist text-ink-muted">
            {soundOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
          <button onClick={toggleBigScreen} className="vf-chip bg-mist text-ink-muted" title="Big screen (B)">
            {bigScreen ? <><Minimize2 className="w-3 h-3" /> Compact</> : <><Maximize2 className="w-3 h-3" /> Big screen</>}
          </button>
          <Link to="/noc/agents" className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]"><Bot className="w-3.5 h-3.5" /> Agents</Link>
          <Link to="/noc/topology" className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]"><Network className="w-3.5 h-3.5" /> Topology</Link>
          <Link to="/noc/agent-runs" className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]"><History className="w-3.5 h-3.5" /> Runs</Link>
        </div>
      </header>

      <ScenarioTimeline />

      <NocKpiStrip />

      <div data-focus="noc-grid" className="grid grid-cols-12 gap-3" style={{ height: bigScreen ? 'calc(100vh - 230px)' : 'calc(100vh - 250px)', minHeight: '640px' }}>
        <div data-focus="noc-queue" className="col-span-12 lg:col-span-3 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <IncidentQueue />
          </div>
          <div className="flex-shrink-0">
            <MiniMap />
          </div>
        </div>
        <div data-focus="noc-detail" className="col-span-12 lg:col-span-5 min-h-0 flex flex-col gap-3 overflow-hidden">
          <div className="flex-shrink-0">
            <IncidentDetail />
          </div>
          <div data-focus="noc-actions" className="flex-1 min-h-0">
            <ActionTray />
          </div>
        </div>
        <div data-focus="noc-agent" className="col-span-12 lg:col-span-4 min-h-0 flex">
          <AgentReasoning
            run={visibleRun}
            autoApprove={false}
            onApprove={(_s, i) => decideStep(i, 'approved')}
            onDeny={(_s, i) => decideStep(i, 'denied')}
            className="w-full"
          />
        </div>
      </div>

      {/* Big-screen ticker */}
      {bigScreen && tickerEvents.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-ink text-white py-2 px-4 z-40 overflow-hidden border-t border-vfRed">
          <div className="flex items-center gap-3 animate-marquee whitespace-nowrap text-sm font-mono">
            {[...tickerEvents, ...tickerEvents].map((e, i) => (
              <span key={`${e.fid}-${i}`} className="inline-flex items-center gap-2">
                <span className="text-vfRed">●</span>
                <span className="text-mist">{e.realTime}</span>
                <span>{e.text}</span>
                <span className="text-ink-muted px-2">|</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpeedToggle({ value, onChange }: { value: 0.25 | 0.5 | 1 | 2 | 4; onChange: (v: 0.25 | 0.5 | 1 | 2 | 4) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg bg-mist border border-mist-dark p-0.5">
      {[0.25, 0.5, 1, 2, 4].map((s) => (
        <button key={s} onClick={() => onChange(s as 0.25 | 0.5 | 1 | 2 | 4)} className={cn('px-2 h-7 rounded-md text-[10px] font-bold', value === s ? 'bg-white text-ink shadow-sm border border-mist-dark' : 'text-ink-muted hover:text-ink')}>
          {s}x
        </button>
      ))}
    </div>
  );
}
