import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AutoDriveState {
  step: number;
  playing: boolean;
  elapsedMs: number;
  toggle: () => void;
  reset: () => void;
  progress: number; // 0..1
  totalMs: number;
}

/**
 * usePageAutoDrive — generic per-page sequencer.
 * Drives `step` from 0..totalSteps over totalSteps * msPerStep / speed ms.
 * Reads global playSpeed from caller (passed in) so the speed toggle stays consistent.
 */
export function usePageAutoDrive(totalSteps: number, msPerStep: number, speed: number = 1): AutoDriveState {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const totalMs = totalSteps * msPerStep;

  const toggle = () => {
    setPlaying((p) => {
      if (!p) startRef.current = performance.now() - elapsedMs * speed;
      return !p;
    });
  };
  const reset = () => {
    setPlaying(false);
    setStep(0);
    setElapsedMs(0);
    cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      const real = now - startRef.current;
      const virt = real * speed;
      setElapsedMs(virt);
      const idx = Math.min(totalSteps, Math.floor(virt / msPerStep));
      setStep(idx);
      if (virt >= totalMs) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, msPerStep, totalSteps, totalMs]);

  return { step, playing, elapsedMs, toggle, reset, progress: Math.min(1, elapsedMs / totalMs), totalMs };
}

export function AutoDriveControl({ s, label = 'Auto-drive' }: { s: AutoDriveState; label?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-1 rounded-lg bg-mist border border-mist-dark p-0.5">
        <button onClick={s.toggle} className={cn('inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-bold', s.playing ? 'bg-ink text-white' : 'bg-vfRed text-white hover:bg-vfRed-dark')}>
          {s.playing ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> {label}</>}
        </button>
        <button onClick={s.reset} title="Reset" className="inline-flex items-center h-7 px-2 rounded-md text-[11px] font-bold text-ink-muted hover:bg-white">
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
      <span className="vf-chip bg-mist text-ink font-mono text-[11px]">T+ {(s.elapsedMs / 1000).toFixed(1)}s</span>
      <div className="hidden md:block w-32 h-1 rounded-full bg-mist overflow-hidden">
        <div className="h-full bg-vfRed transition-all" style={{ width: `${s.progress * 100}%` }} />
      </div>
    </div>
  );
}
