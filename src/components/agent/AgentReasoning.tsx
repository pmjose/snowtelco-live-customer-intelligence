import { motion } from 'framer-motion';
import { Eye, Lightbulb, ListTree, Play, ShieldCheck, Bot } from 'lucide-react';
import type { AgentRun, AgentStage, AgentStep } from '@/data/agentRuns';
import { cn } from '@/lib/utils';

const STAGE_META: Record<AgentStage, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  observe: { label: 'Observe', icon: Eye, color: 'bg-vfRed-soft text-vfRed-dark' },
  hypothesize: { label: 'Hypothesize', icon: Lightbulb, color: 'bg-amber/10 text-amber' },
  plan: { label: 'Plan', icon: ListTree, color: 'bg-fuchsia-100 text-fuchsia-700' },
  act: { label: 'Act', icon: Play, color: 'bg-vfRed/10 text-vfRed-dark' },
  verify: { label: 'Verify', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-700' },
};

interface Props {
  run: AgentRun;
  onApprove?: (step: AgentStep, idx: number) => void;
  onDeny?: (step: AgentStep, idx: number) => void;
  autoApprove?: boolean;
  className?: string;
}

export function AgentReasoning({ run, onApprove, onDeny, autoApprove, className }: Props) {
  return (
    <div className={cn('vf-card p-3 flex flex-col h-full min-h-0', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink text-white grid place-items-center"><Bot className="w-3.5 h-3.5" /></div>
          <div>
            <div className="text-[12px] font-bold text-ink leading-tight">Agent reasoning</div>
            <div className="text-[10px] text-ink-muted">{run.id} · {run.startedAt}</div>
          </div>
        </div>
        <span className={cn('vf-chip text-[10px]', run.status === 'live' ? 'bg-vfRed-soft text-vfRed-dark' : 'bg-mist text-ink-muted')}>
          {run.status === 'live' ? 'LIVE' : 'CLOSED'}
        </span>
      </div>

      <div className="overflow-y-auto pr-1 -mr-1 space-y-2 flex-1 min-h-0">
        {run.steps.length === 0 && (
          <div className="text-[12px] text-ink-muted italic px-1 py-2">No agent steps yet — press <span className="font-bold text-ink">Auto-drive</span> above.</div>
        )}
        {run.steps.map((s, i) => {
          const meta = STAGE_META[s.stage];
          const Icon = meta.icon;
          const effective = autoApprove && s.outcome === 'pending' ? 'auto' : s.outcome;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="rounded-lg border border-mist-dark p-2"
            >
              <div className="flex items-start gap-2">
                <div className={cn('w-6 h-6 rounded-md grid place-items-center shrink-0', meta.color)}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-[12px] text-ink truncate">{s.title}</div>
                    <div className="text-[9.5px] text-ink-muted shrink-0">{s.ts}</div>
                  </div>
                  <div className="text-[11px] text-ink-muted mt-0.5 leading-snug">{s.detail}</div>

                  {s.evidence && s.evidence.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.evidence.map((e) => (
                        <span key={e} className="vf-chip bg-mist text-ink-muted text-[9.5px] !px-1.5 !py-0.5">{e}</span>
                      ))}
                    </div>
                  )}

                  {s.toolCalls && s.toolCalls.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {s.toolCalls.slice(0, 2).map((t) => (
                        <div key={t} className="font-mono text-[9.5px] text-ink-muted truncate">
                          <span className="text-emerald-700">→</span> {t}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-[10px] text-ink-muted">
                      {typeof s.confidence === 'number' && (
                        <span>conf <b className="text-ink">{Math.round(s.confidence * 100)}%</b></span>
                      )}
                    </div>
                    {s.requiresApproval && (
                      <div className="flex items-center gap-1">
                        {effective === 'pending' ? (
                          <>
                            <button onClick={() => onDeny?.(s, i)} className="px-1.5 h-6 rounded-md text-[10px] font-bold border border-mist-dark text-ink-muted hover:bg-mist">Deny</button>
                            <button onClick={() => onApprove?.(s, i)} className="px-1.5 h-6 rounded-md text-[10px] font-bold bg-vfRed text-white hover:bg-vfRed-dark">Approve</button>
                          </>
                        ) : (
                          <span className={cn('vf-chip text-[9.5px] !px-1.5 !py-0.5', effective === 'approved' && 'bg-emerald-100 text-emerald-700', effective === 'auto' && 'bg-emerald-100 text-emerald-700', effective === 'denied' && 'bg-mist text-ink-muted')}>
                            {effective === 'approved' ? 'Approved' : effective === 'auto' ? 'Auto' : 'Denied'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-mist-dark text-[10.5px] text-ink-muted">
        <span className="text-ink font-semibold">{run.outcome}</span>
      </div>
    </div>
  );
}
