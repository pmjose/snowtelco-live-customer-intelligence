import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Database, Headphones, Radio, MessageSquare, Wrench, ShieldCheck, Brain, ListTree, UserCheck, Eye, Sparkles, Activity, FileCog } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { orchNodes, orchEdges, nodeById, type OrchNode } from '@/data/orchTopology';
import { cn } from '@/lib/utils';

const W = 1100;
const H = 680;

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  orchestrator: Bot,
  detector: Eye,
  reasoner: Brain,
  planner: ListTree,
  approver: UserCheck,
  executor: Wrench,
  verifier: ShieldCheck,
  narrator: FileCog,
  snowflake: Database,
  servicenow: FileCog,
  care: Headphones,
  ran: Radio,
  comms: MessageSquare,
};

export function AgentOrchestration() {
  const { currentStage, firedEvents, nocPlaying, tElapsedMs, selectedIncidentId } = useDemoState();
  const stage = currentStage as Exclude<typeof currentStage, 'idle'> | 'idle';

  const nodeCenter = (n: OrchNode) => ({ x: n.x * W, y: n.y * H });

  // Latest reasoning text per node (for bubbles)
  const nodeReasoning = useMemo(() => {
    const m: Record<string, string> = {};
    const stageMap: Record<string, string[]> = {
      detect: ['detector', 'orchestrator', 'snowflake', 'narrator'],
      observe: ['reasoner', 'orchestrator', 'snowflake'],
      hypothesize: ['reasoner', 'orchestrator'],
      plan: ['planner', 'orchestrator', 'approver', 'narrator'],
      act: ['executor', 'approver', 'orchestrator', 'ran', 'servicenow', 'care', 'comms'],
      verify: ['verifier', 'orchestrator', 'snowflake', 'narrator'],
      resolved: ['orchestrator', 'narrator'],
    };
    const recent = firedEvents.slice(0, 6);
    recent.forEach((e) => {
      const targets = stageMap[e.kind === 'log' ? stage : e.kind] || [];
      targets.forEach((id) => { if (!m[id]) m[id] = e.text; });
    });
    return m;
  }, [firedEvents, stage]);

  const isEdgeActive = (e: typeof orchEdges[number]) => e.activeStages.includes(stage as any);
  const isNodeActive = (n: OrchNode) => n.activeStages.includes(stage as any);
  const isNodeDone = (n: OrchNode) => {
    const stageOrder = ['idle', 'detect', 'observe', 'hypothesize', 'plan', 'act', 'verify', 'resolved'];
    const cur = stageOrder.indexOf(stage);
    return n.activeStages.every((s) => stageOrder.indexOf(s) < cur);
  };

  const script = `${selectedIncidentId}`;

  return (
    <div className="vf-card p-3 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="vf-chip bg-vfRed-soft text-vfRed-dark text-[10px]">
            <span className={cn('w-1.5 h-1.5 rounded-full inline-block', nocPlaying ? 'bg-vfRed animate-pulse' : 'bg-mist-dark')} />
            {nocPlaying ? 'Live orchestration' : 'Idle'}
          </span>
          <span className="text-[11px] text-ink-muted font-mono">{script}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="vf-chip bg-mist text-ink font-mono text-[11px]">T+ {(tElapsedMs / 1000).toFixed(1)}s</span>
          <span className="vf-chip bg-mist text-ink-muted text-[10px] uppercase">{stage}</span>
        </div>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Glow filters */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="orchGrad">
              <stop offset="0%" stopColor="#29B5E8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#29B5E8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#e5e7eb" />
          </pattern>
          <rect width={W} height={H} fill="url(#dots)" opacity="0.5" />

          {/* Edges */}
          {orchEdges.map((e) => {
            const a = nodeCenter(nodeById(e.from));
            const b = nodeCenter(nodeById(e.to));
            const active = isEdgeActive(e);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            // Slight curve via control point perpendicular to direction
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const bend = 30;
            const cx = mid.x + nx * bend;
            const cy = mid.y + ny * bend;
            const path = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
            const id = `path-${e.id}`;
            return (
              <g key={e.id}>
                <path d={path} fill="none" stroke={active ? '#29B5E8' : '#e5e7eb'} strokeWidth={active ? 2.5 : 1.5} strokeDasharray={active ? '0' : '4 4'} opacity={active ? 0.9 : 0.7} />
                <path id={id} d={path} fill="none" stroke="none" />
                {active && (
                  <>
                    <circle r="5" fill="#29B5E8" filter="url(#glow)">
                      <animateMotion dur="1.6s" repeatCount="indefinite">
                        <mpath href={`#${id}`} />
                      </animateMotion>
                    </circle>
                    <circle r="3" fill="#fff">
                      <animateMotion dur="1.6s" repeatCount="indefinite">
                        <mpath href={`#${id}`} />
                      </animateMotion>
                    </circle>
                  </>
                )}
                {e.label && active && (
                  <text x={cx} y={cy - 4} fontSize="10" fontWeight="700" fill="#11567F" textAnchor="middle" className="pointer-events-none">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Orchestrator halo */}
          {nocPlaying && (() => {
            const o = nodeCenter(nodeById('orchestrator'));
            return <circle cx={o.x} cy={o.y} r="120" fill="url(#orchGrad)" />;
          })()}

          {/* Nodes (foreignObject for rich content) */}
          {orchNodes.map((n) => {
            const c = nodeCenter(n);
            const active = isNodeActive(n);
            const done = isNodeDone(n);
            return (
              <foreignObject key={n.id} x={c.x - 90} y={c.y - 40} width={180} height={80} style={{ overflow: 'visible' }}>
                <NodeCard node={n} active={active} done={done} reasoning={nodeReasoning[n.id]} stage={stage} />
              </foreignObject>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-muted flex-wrap">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-vfRed animate-pulse" /> Active agent</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mist-dark" /> Idle</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-vfRed" /> Live data flow</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-mist-dark" /> Dormant connection</span>
      </div>
    </div>
  );
}

function NodeCard({ node, active, done, reasoning, stage }: { node: OrchNode; active: boolean; done: boolean; reasoning?: string; stage: string }) {
  const Icon = ICONS[node.role || node.id] || Activity;
  const isAgent = node.kind === 'agent';
  const activity = node.activityByStage?.[stage as keyof typeof node.activityByStage] || node.activityByStage?.idle;

  return (
    <div className="relative w-[180px] -translate-y-1/2 select-none" style={{ position: 'absolute', top: '50%', left: 0 }}>
      <div className={cn(
        'rounded-xl border bg-white shadow-sm transition relative',
        active ? 'border-vfRed shadow-md' : done ? 'border-emerald-300' : 'border-mist-dark'
      )}>
        {active && (
          <span className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-vfRed/60 animate-pulse" />
        )}
        <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-mist-dark">
          <div className={cn(
            'w-7 h-7 rounded-lg grid place-items-center shrink-0',
            isAgent ? (active ? 'bg-vfRed text-white' : done ? 'bg-emerald-500 text-white' : 'bg-ink text-white') : (active ? 'bg-vfRed-soft text-vfRed-dark' : 'bg-mist text-ink')
          )}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-extrabold text-ink truncate leading-tight">{node.label}</div>
            {node.sub && <div className="text-[9.5px] text-ink-muted truncate leading-tight">{node.sub}</div>}
          </div>
          <span className={cn('text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded', isAgent ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-blue-100 text-blue-700')}>
            {isAgent ? 'AGENT' : 'INT'}
          </span>
        </div>
        <div className="px-2.5 py-1.5">
          <div className={cn('text-[10.5px] leading-snug line-clamp-2', active ? 'text-ink font-semibold' : 'text-ink-muted')}>
            {activity || 'Standing by'}
          </div>
        </div>
      </div>

      {/* Reasoning bubble */}
      <AnimatePresence>
        {active && reasoning && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[220px] bg-ink text-white text-[10.5px] rounded-lg px-2 py-1 shadow-lg z-10 leading-snug"
          >
            <Sparkles className="w-3 h-3 inline mr-1 text-vfRed" />
            {reasoning}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
