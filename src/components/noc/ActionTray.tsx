import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Check, Sparkles, Shield } from 'lucide-react';
import { nocActions } from '@/data/nocActions';
import { useDemoState } from '@/state/DemoStateProvider';
import { cn } from '@/lib/utils';

export function ActionTray() {
  const { ranActionIds, runAction, autoApprove, setAutoApprove } = useDemoState();

  const handleRun = (id: string, title: string, est: string) => {
    runAction(id);
    toast.success(`Action executed: ${title}`, { description: est });
  };

  return (
    <div className="vf-card p-3 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Closed-loop actions</div>
          <div className="text-sm font-extrabold text-ink leading-tight">{ranActionIds.length}/{nocActions.length} executed</div>
        </div>
        <button
          onClick={() => setAutoApprove(!autoApprove)}
          className={cn('vf-chip text-[10px]', autoApprove ? 'bg-emerald-100 text-emerald-700' : 'bg-mist text-ink-muted')}
        >
          <Shield className="w-3 h-3" /> Auto-approve {autoApprove ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1 -mr-1">
        {nocActions.map((a, i) => {
          const ran = ranActionIds.includes(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn('rounded-lg border p-2', ran ? 'border-emerald-300 bg-emerald-50/50' : 'border-mist-dark bg-white')}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn('vf-chip text-[9px] font-bold !px-1.5 !py-0.5', a.tier === 'T1' ? 'bg-vfRed-soft text-vfRed-dark' : a.tier === 'T2' ? 'bg-amber/10 text-amber' : 'bg-mist text-ink-muted')}>{a.tier}</span>
                  <span className="font-bold text-[12px] text-ink truncate">{a.title}</span>
                </div>
                {a.reversible && <span className="text-[9px] text-emerald-700 font-bold">REV</span>}
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5 line-clamp-2 leading-snug">{a.detail}</div>
              <div className="flex items-center gap-1 flex-wrap mt-1">
                <span className="vf-chip bg-mist text-ink-muted text-[9px] !px-1.5 !py-0.5">{a.estImpact}</span>
                <span className="vf-chip bg-mist text-ink-muted text-[9px] !px-1.5 !py-0.5">~{a.runtimeSec}s</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="font-mono text-[9.5px] text-ink-muted truncate flex-1 min-w-0">
                  <span className="text-emerald-700">→</span> {a.toolChain[0]}
                </div>
                {ran ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0"><Check className="w-3 h-3" /> Done</span>
                ) : (
                  <button onClick={() => handleRun(a.id, a.title, a.estImpact)} className="px-2 h-6 rounded-md text-[10px] font-bold bg-ink text-white hover:bg-ink-soft inline-flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3" /> Run
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
