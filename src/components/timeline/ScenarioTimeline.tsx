import { motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { scenarioById } from '@/data/sectionScenarios';
import { ScenarioMetaBar } from '@/components/scenarios/ScenarioMetaBar';
import type { SeqEvent } from '@/data/nocSequence';
import { cn } from '@/lib/utils';

// ─── Timeline beats: one per significant kind, dedup by kind keeping the
// first event of that kind (so the storyboard reads detect → observe →
// hypothesize → plan → act → verify → resolve). All timeline beats are
// wrapped in this stable display order.
const STAGE_ORDER: SeqEvent['kind'][] = [
  'detect', 'alarm', 'observe', 'hypothesize', 'plan',
  'act-rebalance', 'act-snow', 'act-restart', 'act-care',
  'verify', 'resolve',
];
const STAGE_LABEL: Record<string, string> = {
  detect: 'Detect',
  alarm: 'Alarm',
  observe: 'Observe',
  hypothesize: 'Hypothesise',
  plan: 'Plan',
  'act-rebalance': 'Act · rebalance',
  'act-snow': 'Act · ServiceNow',
  'act-restart': 'Act · restart',
  'act-care': 'Act · care',
  verify: 'Verify',
  resolve: 'Resolve',
};

const fmtTime = (atSec: number) => {
  // Anchor synthetic clock at 09:31 (matches existing CIC timeline)
  const total = 9 * 60 + 31 + Math.round(atSec / 60);
  const H = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const M = String(total % 60).padStart(2, '0');
  return `${H}:${M}`;
};

// Find an ML-ish chip from event text (heuristic — looks for typical model names)
const ML_RE = /\b([a-z][a-z0-9_]+(?:_v\d+(?:\.\d+)?|_VxX))\b/i;
const mlChip = (text: string): string | null => {
  const m = text.match(ML_RE);
  if (!m) return null;
  // Avoid trivial matches by filtering to likely model names
  if (!/_v\d|score|model|predict|classif|propensity|optim|recommend|forecast|drift|recover|restart|escalate|register|extend|rebalance|fail|response/i.test(m[0])) return null;
  return m[0];
};

interface Beat {
  kind: SeqEvent['kind'];
  atSec: number;
  text: string;
  ml?: string | null;
  reached: boolean;
  current: boolean;
}

function buildBeats(events: SeqEvent[], tElapsedMs: number): Beat[] {
  const elapsed = tElapsedMs / 1000;
  // Pick first event for each kind in STAGE_ORDER
  const seen = new Set<string>();
  const beats: Beat[] = [];
  for (const ev of events) {
    if (!STAGE_ORDER.includes(ev.kind)) continue;
    if (seen.has(ev.kind)) continue;
    seen.add(ev.kind);
    beats.push({
      kind: ev.kind,
      atSec: ev.atSec,
      text: ev.text,
      ml: mlChip(ev.text),
      reached: elapsed >= ev.atSec,
      current: false,
    });
  }
  // Sort by stage order, then time
  beats.sort((a, b) => {
    const ka = STAGE_ORDER.indexOf(a.kind);
    const kb = STAGE_ORDER.indexOf(b.kind);
    if (ka !== kb) return ka - kb;
    return a.atSec - b.atSec;
  });
  // Mark "current" = last reached beat
  let lastReachedIdx = -1;
  beats.forEach((b, i) => { if (b.reached) lastReachedIdx = i; });
  if (lastReachedIdx >= 0) beats[lastReachedIdx].current = true;
  return beats;
}

export function ScenarioTimeline({ className }: { className?: string }) {
  const { selectedIncidentId, tElapsedMs } = useDemoState();
  const sc = scenarioById(selectedIncidentId);
  if (!sc) return null;

  const beats = buildBeats(sc.events, tElapsedMs);
  if (beats.length === 0) return null;

  const reachedCount = beats.filter((b) => b.reached).length;
  const accent = sc.sectionId === 'cic' || sc.sectionId === 'digital' ? 'blue' : 'red';
  const railOn = accent === 'blue' ? 'bg-blue-600' : 'bg-vfRed';
  const dotOn = accent === 'blue' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-vfRed border-vfRed text-white';
  const chipCls = accent === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-vfRed-soft text-vfRed-dark';

  // Always render once a scenario is selected — even when idle — so users see
  // the upcoming beats before they hit "Play".
  // (Earlier we hid it at idle; that contradicted the CIC LiveTimeline pattern
  // and made the section overview pages look empty.)

  return (
    <div className={cn('vf-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Live timeline</div>
          <div className="font-bold text-ink truncate">{sc.title}</div>
        </div>
        <div className="text-xs text-ink-muted">Stage {Math.max(0, reachedCount - 1)} of {beats.length - 1}</div>
      </div>
      <div className="mb-3"><ScenarioMetaBar scenario={sc} variant="wide" /></div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-mist-dark" />
        <motion.div
          className={cn('absolute left-0 top-3 h-0.5', railOn)}
          initial={{ width: 0 }}
          animate={{ width: `${(reachedCount / beats.length) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
        <div className="relative grid gap-2" style={{ gridTemplateColumns: `repeat(${beats.length}, minmax(0, 1fr))` }}>
          {beats.map((b, i) => (
            <div key={i} className="flex flex-col items-start min-w-0">
              <div className="relative z-10 mb-2">
                <div className={cn(
                  'w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold border-2',
                  b.reached ? dotOn : 'bg-white border-mist-dark text-ink-muted',
                  b.current && 'animate-pulse',
                )}>
                  {b.reached && <Check className="w-3 h-3" />}
                </div>
              </div>
              <div className="text-[10px] font-bold text-ink">{fmtTime(b.atSec)}</div>
              <div className={cn('text-[11px] leading-tight mt-0.5 line-clamp-3', b.reached ? 'text-ink' : 'text-ink-muted')}>{b.text}</div>
              {b.ml && (
                <div className={cn('mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold', chipCls)}>
                  <Brain className="w-2.5 h-2.5" /> ML · {b.ml}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
