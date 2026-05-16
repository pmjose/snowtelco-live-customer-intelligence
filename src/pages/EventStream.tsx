import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX, Gauge } from 'lucide-react';
import { categoryColor, opEvents, type EventCategory } from '@/data/eventStream';
import { useDemoState } from '@/state/DemoStateProvider';
import { scriptForIncident } from '@/data/nocSequence';
import { cn } from '@/lib/utils';

const CATS: (EventCategory | 'All')[] = ['All', 'Network', 'Care', 'Billing', 'CDR', 'Decisioning', 'Activation'];
const STAGE_MARKERS: Array<{ kind: string; label: string }> = [
  { kind: 'detect', label: 'Detect' },
  { kind: 'observe', label: 'Observe' },
  { kind: 'hypothesize', label: 'Hypothesize' },
  { kind: 'plan', label: 'Plan' },
  { kind: 'act-rebalance', label: 'Act' },
  { kind: 'verify', label: 'Verify' },
  { kind: 'resolve', label: 'Resolve' },
];

export default function EventStream() {
  const {
    mode, firedEvents, nocPlaying, toggleNocPlay, resetNoc,
    tElapsedMs, playSpeed, setPlaySpeed, soundOn, setSoundOn,
    selectedIncidentId, currentStage,
  } = useDemoState();
  const [filter, setFilter] = useState<EventCategory | 'All'>('All');
  const [boss, setBoss] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const script = scriptForIncident(selectedIncidentId);
  const totalMs = script.durationSec * 1000;
  const progress = Math.min(1, tElapsedMs / totalMs);

  // Show live fired events whenever a scenario is running (any section);
  // fall back to static historical events when idle.
  const useLive = firedEvents.length > 0;
  const events = useLive
    ? firedEvents.filter((e) => filter === 'All' || (e.category && e.category === filter))
    : (filter === 'All' ? opEvents : opEvents.filter((e) => e.category === filter));

  const counts = useMemo(() => {
    const c: Record<string, number> = { Network: 0, Care: 0, Billing: 0, CDR: 0, Decisioning: 0, Activation: 0 };
    (useLive ? firedEvents : opEvents).forEach((e) => { if (e.category) c[e.category] = (c[e.category] || 0) + 1; });
    return c;
  }, [mode, firedEvents]);

  // Events-per-second sparkline (last 30 buckets of 1s each)
  const eps = useMemo(() => {
    if (mode !== 'noc') return Array.from({ length: 30 }, () => 0);
    const buckets = Array.from({ length: 30 }, () => 0);
    const nowSec = tElapsedMs / 1000;
    firedEvents.forEach((e) => {
      const bucket = Math.floor(nowSec - e.atSec);
      if (bucket >= 0 && bucket < 30) buckets[29 - bucket] += 1;
    });
    return buckets;
  }, [firedEvents, tElapsedMs, mode]);

  const stageColor: Record<string, string> = {
    idle: 'bg-mist text-ink-muted',
    detect: 'bg-vfRed text-white animate-pulse',
    observe: 'bg-vfRed-soft text-vfRed-dark',
    hypothesize: 'bg-amber/20 text-amber-800',
    plan: 'bg-fuchsia-100 text-fuchsia-700',
    act: 'bg-vfRed text-white',
    verify: 'bg-emerald-100 text-emerald-700',
    resolved: 'bg-emerald-500 text-white',
  };

  return (
    <div className={cn('mx-auto px-4 lg:px-6 py-3 space-y-3', boss ? 'max-w-full' : 'max-w-[1600px]')}>
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Operations</div>
          <h1 className={cn('font-extrabold text-ink leading-tight', boss ? 'text-4xl' : 'text-2xl')}>Live Event Firehose</h1>
          <p className="text-xs text-ink-muted">{mode === 'noc' ? `Streaming live for ${selectedIncidentId}` : 'Continuous feed of network, customer, decisioning and activation events.'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('vf-chip text-[10px] uppercase font-bold', stageColor[currentStage])}>{currentStage}</span>
          <span className="vf-chip bg-mist text-ink font-mono text-[11px]">T+ {(tElapsedMs / 1000).toFixed(1)}s / {script.durationSec}s</span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-mist border border-mist-dark p-0.5">
            <button onClick={toggleNocPlay} className={cn('inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-bold', nocPlaying ? 'bg-ink text-white' : 'bg-vfRed text-white hover:bg-vfRed-dark')}>
              {nocPlaying ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Auto-drive</>}
            </button>
            <button onClick={resetNoc} title="Reset" className="inline-flex items-center h-7 px-2 rounded-md text-xs font-bold text-ink-muted hover:bg-white">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <SpeedToggle value={playSpeed} onChange={setPlaySpeed} />
          <button onClick={() => setSoundOn(!soundOn)} title={`Sounds ${soundOn ? 'on' : 'off'}`} className="vf-chip bg-mist text-ink-muted">
            {soundOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
          <button onClick={() => setBoss(!boss)} className="vf-chip bg-mist text-ink-muted">
            {boss ? <><Minimize2 className="w-3 h-3" /> Compact</> : <><Maximize2 className="w-3 h-3" /> Boss view</>}
          </button>
        </div>
      </header>

      {/* Scrubber timeline */}
      {mode === 'noc' && (
        <div className="vf-card px-3 py-2">
          <div className="relative h-9">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-mist" />
            <motion.div
              className="absolute inset-y-0 left-0 my-3 h-1.5 rounded-full bg-vfRed"
              animate={{ width: `${progress * 100}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
            {STAGE_MARKERS.map((m) => {
              const ev = script.events.find((e) => e.kind === m.kind);
              if (!ev) return null;
              const left = (ev.atSec * 1000 / totalMs) * 100;
              const passed = tElapsedMs >= ev.atSec * 1000;
              return (
                <div key={m.kind} className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${left}%` }}>
                  <span className={cn('w-3 h-3 rounded-full border-2 border-white shadow', passed ? 'bg-vfRed' : 'bg-mist-dark')} style={{ marginTop: 12 }} />
                  <span className="text-[9.5px] font-bold text-ink-muted absolute -bottom-3.5 whitespace-nowrap">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-3">
        {/* Left: counters */}
        <div className="col-span-12 lg:col-span-2">
          <div className="vf-card p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Counters</div>
            {Object.entries(counts).map(([cat, n]) => (
              <CounterRow key={cat} label={cat as EventCategory} value={n} />
            ))}
            <div className="border-t border-mist-dark pt-2 mt-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Total</div>
              <div className="text-2xl font-extrabold text-ink font-mono tabular-nums">{(useLive ? firedEvents : opEvents).length}</div>
            </div>
          </div>
        </div>

        {/* Center: stream */}
        <div className="col-span-12 lg:col-span-8">
          <div className="vf-card p-2 flex flex-col" style={{ height: boss ? 'calc(100vh - 250px)' : '640px' }}>
            <div className="flex flex-wrap gap-1 px-2 py-1 border-b border-mist-dark">
              {CATS.map((c) => (
                <button key={c} onClick={() => setFilter(c)} className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold', filter === c ? 'bg-ink text-white' : 'bg-mist text-ink-muted hover:text-ink')}>
                  {c}
                </button>
              ))}
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto">
              <AnimatePresence initial={false}>
                {events.map((e) => {
                  const cat = (e.category || 'Network') as EventCategory;
                  return (
                    <motion.div
                      key={'fid' in e ? e.fid : e.id}
                      initial={{ opacity: 0, x: -16, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn('flex items-start gap-3 px-3 py-1.5 border-b border-mist-dark/60', boss ? 'text-base' : 'text-sm')}
                    >
                      <span className={cn('font-mono text-ink-muted shrink-0', boss ? 'w-24 text-sm' : 'w-20 text-[11px]')}>
                        {'realTime' in e ? e.realTime : e.time}
                      </span>
                      <span className={cn('vf-chip shrink-0 text-[10px]', categoryColor[cat])}>{cat}</span>
                      <span className={cn('flex-1', e.severity === 'critical' ? 'text-vfRed-dark font-semibold' : e.severity === 'success' ? 'text-emerald-700' : e.severity === 'warn' ? 'text-amber-700' : 'text-ink')}>{e.text}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {events.length === 0 && (
                <div className="text-center text-ink-muted text-sm py-12">
                  Press <span className="font-bold text-ink">Auto-drive</span> to start streaming live events.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: heatmap + eps */}
        <div className="col-span-12 lg:col-span-2 space-y-3">
          <div className="vf-card p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              <Gauge className="w-3 h-3" /> Events/sec
            </div>
            <div className="text-2xl font-extrabold text-ink font-mono tabular-nums mt-1">{eps[eps.length - 1] || 0}</div>
            <Spark data={eps} color="#29B5E8" />
            <div className="text-[10px] text-ink-muted mt-1">last 30s</div>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Severity heatmap</div>
            <Heatmap events={useLive ? firedEvents : (opEvents as any)} />
          </div>
        </div>
      </div>

      {/* Boss-mode ticker */}
      {boss && (
        <div className="fixed bottom-0 left-0 right-0 bg-ink text-white py-2 px-4 z-40 overflow-hidden border-t border-vfRed">
          <div className="flex items-center gap-3 animate-marquee whitespace-nowrap text-sm font-mono">
            {events.slice(0, 8).map((e: any) => (
              <span key={'fid' in e ? e.fid : e.id} className="inline-flex items-center gap-2">
                <span className="text-vfRed">●</span>
                <span className="text-mist">{'realTime' in e ? e.realTime : e.time}</span>
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

function CounterRow({ label, value }: { label: EventCategory; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('vf-chip text-[10px]', categoryColor[label])}>{label}</span>
      <motion.span
        key={value}
        initial={{ scale: 1.4, color: '#29B5E8' }}
        animate={{ scale: 1, color: '#111111' }}
        transition={{ duration: 0.3 }}
        className="text-base font-extrabold font-mono tabular-nums"
      >
        {value}
      </motion.span>
    </div>
  );
}

function Spark({ data, color = '#29B5E8' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-10 mt-1">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Heatmap({ events }: { events: Array<{ severity?: string }> }) {
  const cells = events.slice(0, 60);
  const colorFor = (s?: string) => s === 'critical' ? 'bg-vfRed' : s === 'warn' ? 'bg-amber' : s === 'success' ? 'bg-emerald-500' : 'bg-mist-dark';
  return (
    <div className="grid grid-cols-10 gap-0.5">
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className={cn('h-3 rounded-sm', cells[i] ? colorFor(cells[i].severity) : 'bg-mist')} />
      ))}
    </div>
  );
}

function SpeedToggle({ value, onChange }: { value: 0.25 | 0.5 | 1 | 2 | 4; onChange: (v: 0.25 | 0.5 | 1 | 2 | 4) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg bg-mist border border-mist-dark p-0.5">
      {[0.25, 0.5, 1, 2, 4].map((s) => (
        <button key={s} onClick={() => onChange(s as 0.25 | 0.5 | 1 | 2 | 4)} className={cn('px-2 h-7 rounded-md text-[11px] font-bold', value === s ? 'bg-white text-ink shadow-sm border border-mist-dark' : 'text-ink-muted hover:text-ink')}>
          {s}x
        </button>
      ))}
    </div>
  );
}

export function EventStreamWidget({ limit = 6 }: { limit?: number }) {
  const { firedEvents } = useDemoState();
  const useLive = firedEvents.length > 0;
  const list = useLive ? firedEvents.slice(0, limit) : opEvents.slice(0, limit);
  return (
    <div className="vf-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-ink text-sm">Live Event Stream</div>
        <span className="vf-chip bg-vfRed-soft text-vfRed-dark text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-vfRed inline-block animate-pulse" /> Live
        </span>
      </div>
      <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {list.map((e: any) => (
            <motion.div key={'fid' in e ? e.fid : e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 text-xs">
              <span className="font-mono text-ink-muted w-14 shrink-0">{'realTime' in e ? e.realTime : e.time?.slice(0, 5)}</span>
              <span className={cn('vf-chip shrink-0 text-[9px]', categoryColor[(e.category || 'Network') as EventCategory])}>{e.category}</span>
              <span className="text-ink line-clamp-1">{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
