import { Play, Pause, RotateCcw } from 'lucide-react';
import { AgentOrchestration } from '@/components/noc/AgentOrchestration';
import { useDemoState } from '@/state/DemoStateProvider';
import { orchNodes } from '@/data/orchTopology';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function NocAgents() {
  const { nocPlaying, toggleNocPlay, resetNoc, firedEvents, currentStage, playSpeed, setPlaySpeed } = useDemoState();
  const agents = orchNodes.filter((n) => n.kind === 'agent');
  const integrations = orchNodes.filter((n) => n.kind === 'integration');

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-3 space-y-3">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Network Operations</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Agent Orchestration</h1>
          <p className="text-xs text-ink-muted">Live view of every agent, every integration, every flow — and the reasoning at each step.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('vf-chip text-[10px] uppercase font-bold', currentStage === 'detect' || currentStage === 'act' ? 'bg-vfRed text-white animate-pulse' : currentStage === 'resolved' ? 'bg-emerald-500 text-white' : currentStage === 'idle' ? 'bg-mist text-ink-muted' : 'bg-vfRed-soft text-vfRed-dark')}>
            {currentStage}
          </span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-mist border border-mist-dark p-0.5">
            <button onClick={toggleNocPlay} className={cn('inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-bold', nocPlaying ? 'bg-ink text-white' : 'bg-vfRed text-white hover:bg-vfRed-dark')}>
              {nocPlaying ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Auto-drive</>}
            </button>
            <button onClick={resetNoc} title="Reset" className="inline-flex items-center h-7 px-2 rounded-md text-[11px] font-bold text-ink-muted hover:bg-white">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <SpeedToggle value={playSpeed} onChange={setPlaySpeed} />
        </div>
      </header>

      <div data-focus="kpi-strip" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Agents</div><div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{agents.length}</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Integrations</div><div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{integrations.length}</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live messages</div><div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{firedEvents.length}</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Stage</div><div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none uppercase">{currentStage}</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Auto-resolve %</div><div className="text-xl font-extrabold text-emerald-600 mt-0.5 font-mono tabular-nums leading-none">88%</div></div>
        <div className="vf-card px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">P1 active</div><div className="text-xl font-extrabold text-vfRed mt-0.5 font-mono tabular-nums leading-none">1</div></div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-9">
          <AgentOrchestration />
        </div>
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <Roster title="Agents" items={agents} accent="agent" />
          <Roster title="Integrations" items={integrations} accent="integration" />
          <FlowFeed events={firedEvents.slice(0, 10)} />
        </div>
      </div>
    </div>
  );
}

function Roster({ title, items, accent }: { title: string; items: typeof orchNodes; accent: 'agent' | 'integration' }) {
  const { currentStage } = useDemoState();
  return (
    <div className="vf-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{title}</div>
        <span className="text-[10px] text-ink-muted">{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((n) => {
          const active = n.activeStages.includes(currentStage as any);
          return (
            <div key={n.id} className={cn('flex items-center gap-2 rounded-lg border p-1.5', active ? 'border-vfRed bg-vfRed-soft/50' : 'border-mist-dark')}>
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', active ? 'bg-vfRed animate-pulse' : 'bg-mist-dark')} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-ink truncate leading-tight">{n.label}</div>
                <div className="text-[10px] text-ink-muted truncate leading-tight">{n.sub}</div>
              </div>
              <span className={cn('text-[8px] uppercase font-bold px-1 py-0.5 rounded', accent === 'agent' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-blue-100 text-blue-700')}>
                {accent === 'agent' ? 'AGENT' : 'INT'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowFeed({ events }: { events: ReturnType<typeof useDemoState>['firedEvents'] }) {
  return (
    <div className="vf-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Live messages</div>
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.fid}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 text-[11px] leading-snug"
            >
              <span className="font-mono text-ink-muted w-12 shrink-0">{e.realTime}</span>
              <span className={cn('flex-1', e.severity === 'critical' ? 'text-vfRed-dark font-semibold' : e.severity === 'success' ? 'text-emerald-700' : e.severity === 'warn' ? 'text-amber-700' : 'text-ink')}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="text-[11px] text-ink-muted italic py-2">Press Auto-drive to see agents communicate.</div>
        )}
      </div>
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
