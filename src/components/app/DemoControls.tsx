import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { stageLabel, stageOrder } from '@/state/stages';

export function DemoControls() {
  const { stage, isPlaying, togglePlay, advance, reset } = useDemoState();
  const idx = stageOrder.indexOf(stage);
  const total = stageOrder.length - 1;

  return (
    <div className="vf-card p-3 flex items-center gap-2">
      <button onClick={togglePlay} className="w-9 h-9 rounded-lg bg-vfRed text-white grid place-items-center hover:bg-vfRed-dark transition" aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button onClick={advance} disabled={stage === 'risk_reduced'} className="w-9 h-9 rounded-lg border border-mist-dark text-ink grid place-items-center hover:bg-mist disabled:opacity-40" aria-label="Step">
        <ChevronRight className="w-4 h-4" />
      </button>
      <button onClick={reset} className="w-9 h-9 rounded-lg border border-mist-dark text-ink grid place-items-center hover:bg-mist" aria-label="Restart">
        <RotateCcw className="w-4 h-4" />
      </button>
      <div className="ml-2 pl-3 border-l border-mist-dark min-w-[180px]">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Stage {idx}/{total}</div>
        <div className="text-sm font-bold text-ink">{stageLabel[stage]}</div>
      </div>
      <div className="ml-2 hidden md:block w-40 h-1.5 rounded-full bg-mist overflow-hidden">
        <motion.div
          className="h-full bg-vfRed"
          initial={{ width: 0 }}
          animate={{ width: `${(idx / total) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}
