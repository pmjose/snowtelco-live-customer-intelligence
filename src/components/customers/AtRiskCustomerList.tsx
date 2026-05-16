import { motion } from 'framer-motion';
import { useDemoState } from '@/state/DemoStateProvider';
import { customers, driverFor } from '@/data/customers';
import { cn } from '@/lib/utils';
import { stageReached } from '@/state/stages';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const brandColors: Record<string, string> = {
  SnowTelco: 'bg-vfRed text-white',
  'SnowTelco Lite': 'bg-ink text-white',
  SnowFlex: 'bg-amber/90 text-white',
  SnowGo: 'bg-fuchsia-600 text-white',
  SnowTalk: 'bg-blue-600 text-white',
};

export function AtRiskCustomerList() {
  const { selectedCustomerId, selectCustomer, effectiveChurn, stage, scenario } = useDemoState();

  const sorted = [...customers]
    .filter((c) => c.savePriority !== 'Suppress' || stageReached(stage, 'churn_scored'))
    .sort((a, b) => {
      // Pin the active scenario's primary to the top, then sort by current risk.
      if (a.id === scenario.primaryCustomerId) return -1;
      if (b.id === scenario.primaryCustomerId) return 1;
      return effectiveChurn(b.id) - effectiveChurn(a.id);
    });

  return (
    <div className="vf-card p-4 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="vf-section-title">{
            scenario.theme === 'growth'     ? 'Top upgrade candidates'
          : scenario.theme === 'billing'    ? 'Bill-shock cohort'
          : scenario.theme === 'commercial' ? 'PAC-cohort retention list'
                                            : 'At-risk customers'
          }</div>
          <div className="text-xs text-ink-muted">{
            scenario.theme === 'growth'     ? 'Sorted by upgrade propensity'
                                            : 'Sorted by current churn risk'
          }</div>
        </div>
        <span className={`vf-chip ${scenario.theme === 'growth' ? 'bg-blue-100 text-blue-800' : 'bg-vfRed-soft text-vfRed-dark'}`}>
          <AlertTriangle className="w-3.5 h-3.5" /> {sorted.filter((c) => effectiveChurn(c.id) >= 70).length} {scenario.theme === 'growth' ? 'high-prop' : 'high'}
        </span>
      </div>
      <div className="overflow-y-auto pr-1 -mr-1 space-y-2 flex-1 min-h-0">
        {sorted.map((c) => {
          const risk = Math.round(effectiveChurn(c.id));
          const isActive = selectedCustomerId === c.id;
          const reduced = stageReached(stage, 'risk_reduced') && c.id === scenario.primaryCustomerId;
          return (
            <motion.button
              key={c.id}
              layout
              onClick={() => selectCustomer(c.id)}
              animate={isActive ? { scale: 1.01 } : { scale: 1 }}
              className={cn(
                'w-full text-left rounded-xl border p-3 transition group',
                isActive ? 'border-vfRed bg-vfRed-soft/40 shadow-card' : 'border-mist-dark bg-white hover:bg-mist'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-ink truncate">{c.name}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-bold', brandColors[c.brand])}>{c.brand}</span>
                    {c.savePriority !== 'Suppress' && (
                      <span className={cn('text-[10px] font-bold rounded px-1.5 py-0.5',
                        c.savePriority === 'P1' ? 'bg-vfRed text-white' : 'bg-amber text-white')}>{c.savePriority}</span>
                    )}
                    {c.savePriority === 'Suppress' && (
                      <span className="text-[10px] font-bold rounded px-1.5 py-0.5 bg-ink-muted text-white">SUPPRESS</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">{c.location} · Tenure {c.tenureMonths}mo · {c.valueSegment} value</div>
                  <div className="text-xs text-ink-muted mt-0.5">Driver: <span className="font-semibold text-ink">{driverFor(c.id, scenario.id, scenario.primaryCustomerId)}</span></div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Risk</div>
                  <div className={cn('text-2xl font-extrabold leading-none',
                    risk >= 70 ? 'text-vfRed' : risk >= 50 ? 'text-amber' : 'text-ink'
                  )}>{risk}<span className="text-xs">%</span></div>
                  {reduced && (
                    <div className="text-[10px] font-bold text-ok mt-0.5">↓ post-action</div>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-ink-muted">Contract ends in <span className="font-semibold text-ink">{c.contractEndDays}d</span></span>
                <span className="text-ink-muted flex items-center gap-1 group-hover:text-ink">
                  Open 360 <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
