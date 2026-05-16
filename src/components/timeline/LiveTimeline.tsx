import { motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { stageOrder, stageOrderIndex, stageReached, type Stage } from '@/state/stages';
import { mlForScenario } from '@/data/mlMeta';
import { cn } from '@/lib/utils';

const PRIMARY_NAME: Record<string, string> = {
  'CUST-001': 'Amelia Hughes',
  'CUST-002': 'Daniel Shah',
  'CUST-003': 'Hannah Bennett',
  'CUST-004': 'Ravi Patel',
  'CUST-005': 'Grace Williams',
  'CUST-006': 'Jack Reynolds',
};

interface TLEvent { time: string; title: string; stage: Stage; ml?: string }

function timelineForScenario(s: ReturnType<typeof useDemoState>['scenario']): TLEvent[] {
  const baseTime = (s.detectedAt ?? '2026-05-08 09:31').slice(11, 16); // HH:MM
  const [hh, mm] = baseTime.split(':').map((x) => parseInt(x, 10));
  const tPlus = (mins: number) => {
    const total = hh * 60 + mm + mins;
    const H = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const M = String(total % 60).padStart(2, '0');
    return `${H}:${M}`;
  };

  const primaryName = PRIMARY_NAME[s.primaryCustomerId] ?? 'primary customer';
  const isNetworkScenario = s.cellSitesImpacted > 0;
  const ml = mlForScenario(s.id);

  // Try to extract a risk-reduction snippet from narration.risk_reduced (e.g. "82% to 41%")
  const rrMatch = (s.narration.risk_reduced ?? '').match(/(\d{1,3})%\s*[\u2192>\-to]+\s*(\d{1,3})%/i);
  const rrText = rrMatch ? `${rrMatch[1]}% to ${rrMatch[2]}%` : 'reduced significantly';

  return [
    { time: tPlus(0), title: `${isNetworkScenario ? 'Network telemetry anomaly' : 'Anomaly'} detected in ${s.city} ${s.postcode}`, stage: 'incident_detected', ml: isNetworkScenario ? `${ml.hero.name} · score ${ml.hero.scoreValue}` : undefined },
    { time: tPlus(2), title: isNetworkScenario
      ? `Cell-cluster degradation confirmed across ${s.cellSitesImpacted} sites`
      : `Cohort confirmed across ${s.impactedCustomers.toLocaleString()} customers`, stage: 'incident_detected', ml: !isNetworkScenario ? `${ml.hero.name} · ${s.impactedCustomers.toLocaleString()} flagged` : undefined },
    { time: tPlus(4), title: `${s.impactedCustomers.toLocaleString()} impacted customers identified`, stage: 'customers_impacted' },
    { time: tPlus(6), title: 'Churn impact model executed', stage: 'churn_scored', ml: `churn_propensity_v6.3 · ${s.highChurnRiskCustomers} P1 scored` },
    { time: tPlus(7), title: `${s.highChurnRiskCustomers} P1 customers prioritised`, stage: 'churn_scored' },
    { time: tPlus(9), title: `Customer 360 opened for ${primaryName}`, stage: 'customer_selected' },
    { time: tPlus(11), title: 'Next-best-action generated', stage: 'offer_generated', ml: `${ml.nba.name} · 6 candidates ranked` },
    { time: tPlus(13), title: 'Proactive SMS / app workflow prepared', stage: 'outreach_triggered' },
    { time: tPlus(15), title: `Projected churn risk reduced from ${rrText}`, stage: 'risk_reduced' },
  ];
}

export function LiveTimeline() {
  const { stage, scenario } = useDemoState();
  const currentIdx = stageOrderIndex(stage);
  const events = timelineForScenario(scenario);
  const dateStr = (scenario.detectedAt ?? '2026-05-08').slice(0, 10);
  const isGrowth = scenario.theme === 'growth';

  return (
    <div className="vf-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Live timeline</div>
          <div className="font-bold text-ink">{scenario.incidentTitle} · {dateStr}</div>
        </div>
        <div className="text-xs text-ink-muted">Stage {Math.max(0, currentIdx)} of {stageOrder.length - 1}</div>
      </div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-mist-dark" />
        <motion.div
          className={cn('absolute left-0 top-3 h-0.5', isGrowth ? 'bg-blue-600' : 'bg-vfRed')}
          initial={{ width: 0 }}
          animate={{ width: `${(currentIdx / (stageOrder.length - 1)) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
        <div className="relative grid grid-cols-9 gap-2">
          {events.map((e, i) => {
            const reached = stageReached(stage, e.stage);
            const isCurrent = e.stage === stage && i === currentIdx - 1;
            return (
              <div key={i} className="flex flex-col items-start">
                <div className="relative z-10 mb-2">
                  <div className={cn(
                    'w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold border-2',
                    reached
                      ? (isGrowth ? 'bg-blue-600 border-blue-600 text-white' : 'bg-vfRed border-vfRed text-white')
                      : 'bg-white border-mist-dark text-ink-muted',
                    isCurrent && 'animate-pulse-red'
                  )}>
                    {reached && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-ink">{e.time}</div>
                <div className={cn('text-[11px] leading-tight mt-0.5 line-clamp-3',
                  reached ? 'text-ink' : 'text-ink-muted'
                )}>{e.title}</div>
                {e.ml && (
                  <div className={cn('mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold',
                    isGrowth ? 'bg-blue-100 text-blue-800' : 'bg-vfRed-soft text-vfRed-dark'
                  )}>
                    <Brain className="w-2.5 h-2.5" /> ML · {e.ml}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
