import { useDemoState } from '@/state/DemoStateProvider';
import { stageReached } from '@/state/stages';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, Activity, Rocket, CreditCard, ShoppingBag } from 'lucide-react';

const workflow = [
  'Detect incident',
  'Identify impacted customers',
  'Score churn impact',
  'Prioritize save actions',
  'Trigger proactive outreach',
  'Track risk reduction',
];

const growthWorkflow = [
  'Coverage live',
  'Score propensity',
  'Identify eligible cohort',
  'Rank offers',
  'Launch journey',
  'Track conversion',
];

export function IncidentCard() {
  const { stage, isResolved, scenario } = useDemoState();
  const visible = stageReached(stage, 'incident_detected');
  const isGrowth = scenario.theme === 'growth';
  const isBilling = scenario.theme === 'billing';
  const isCommercial = scenario.theme === 'commercial';
  const ThemeIcon = isGrowth ? Rocket : isBilling ? CreditCard : isCommercial ? ShoppingBag : AlertTriangle;
  const accent = isGrowth ? 'border-l-blue-600' : 'border-l-vfRed';
  const chipBg = isGrowth ? 'bg-blue-600' : 'bg-vfRed';
  const chipText = isGrowth ? 'Opportunity' : `${scenario.incidentSeverity} severity`;

  if (!visible) {
    const idleHeading =
      scenario.theme === 'growth'     ? 'Growth status: ready' :
      scenario.theme === 'billing'    ? 'Billing baseline: normal' :
      scenario.theme === 'commercial' ? 'Retention baseline: stable' :
                                        'Network status: stable';
    const idleBody =
      scenario.theme === 'growth'
        ? `5G SA coverage live across ${scenario.city} ${scenario.postcode}. Run the demo to seed the upgrade wave.`
      : scenario.theme === 'billing'
        ? `No active bill-shock cluster. Run the demo to simulate the ${scenario.city} ${scenario.postcode} roaming-overage scenario.`
      : scenario.theme === 'commercial'
        ? `PAC volume nominal. Run the demo to simulate the ${scenario.city} ${scenario.postcode} competitor scenario.`
        : `No active incidents. Run the demo to simulate the ${scenario.city} ${scenario.postcode} network scenario.`;
    return (
      <div className={`vf-card p-5 border-l-4 ${accent} opacity-90`}>
        <div className="flex items-center gap-2 text-ink-muted">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-semibold">{idleHeading}</span>
        </div>
        <p className="text-xs text-ink-muted mt-2">{idleBody}</p>
      </div>
    );
  }

  const stageIdx = ['incident_detected', 'customers_impacted', 'churn_scored', 'customer_selected', 'offer_generated', 'outreach_triggered', 'risk_reduced'].indexOf(stage);
  const isNetwork = scenario.cellSitesImpacted > 0 && scenario.theme === 'network';
  const wf = isGrowth ? growthWorkflow : workflow;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`vf-card p-5 border-l-4 ${accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`vf-chip ${chipBg} text-white`}><ThemeIcon className="w-3.5 h-3.5" /> {chipText}</span>
            <span className="vf-chip border border-mist-dark text-ink-muted">{scenario.id.toUpperCase()}</span>
            {isResolved ? (
              <span className="vf-chip bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> {isGrowth ? 'Wave seeded' : 'Action in progress'}</span>
            ) : (
              <span className={`vf-chip ${isGrowth ? 'bg-blue-100 text-blue-800' : 'bg-amber/20 text-amber-800'}`}>{isGrowth ? 'Launching' : 'Investigating'}</span>
            )}
          </div>
          <div className="text-lg font-bold text-ink">{scenario.incidentTitle}</div>
          <div className="text-xs text-ink-muted mt-0.5">{isGrowth ? 'Live since' : 'Detected'} {scenario.detectedAt} · {scenario.affectedTechnology.join(' + ')} · {scenario.brand}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Stat label={isGrowth ? 'Eligible' : 'Impacted customers'} value={scenario.impactedCustomers.toLocaleString()} />
        <Stat label="High-value" value={scenario.highValueCustomers.toLocaleString()} />
        <Stat label={isGrowth ? 'High-propensity' : 'P1 churn-risk'} value={scenario.highChurnRiskCustomers.toLocaleString()} accent={!isGrowth} />
        {isNetwork ? (
          <>
            <Stat label="Cell sites" value={scenario.cellSitesImpacted.toString()} />
            <Stat label="Dropped calls" value={`+${scenario.droppedCallIncreasePct}%`} accent />
            <Stat label="Failed sessions" value={`+${scenario.failedDataSessionIncreasePct}%`} accent />
            <Stat label="DL speed before" value={`${scenario.speedBefore} Mbps`} />
            <Stat label="DL speed after" value={`${scenario.speedAfter} Mbps`} accent />
          </>
        ) : isBilling ? (
          <>
            <Stat label="Avg overage" value="+25%" accent />
            <Stat label="Roaming Pass auto-enrol" value="OFF" accent />
            <Stat label="TAP3 partner" value={`Multi-EU`} />
            <Stat label="Detected" value={scenario.detectedAt.split(' ')[1] ?? scenario.detectedAt} />
          </>
        ) : isCommercial ? (
          <>
            <Stat label="PAC requests" value={scenario.impactedCustomers.toLocaleString()} accent />
            <Stat label="Postcode area" value={scenario.postcode} />
            <Stat label="Tariff lever" value={`+30GB`} />
            <Stat label="Brand" value={scenario.brand} />
          </>
        ) : (
          <>
            <Stat label="Coverage cells" value="24" />
            <Stat label="Postcode area" value={scenario.postcode} />
            <Stat label="ARPU lift" value="+£12/mo" />
            <Stat label="Tech focus" value={scenario.affectedTechnology.join(' / ')} />
          </>
        )}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-mist p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{isGrowth ? 'Opportunity hypothesis' : 'Root cause hypothesis'}</div>
          <div className="text-sm text-ink mt-1">{scenario.rootCauseHypothesis}</div>
        </div>
        <div className="rounded-xl bg-mist p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{isGrowth ? 'Launch playbook' : 'Recommended action'}</div>
          <div className="text-sm text-ink mt-1">{scenario.recommendedNetworkAction}</div>
          <div className="text-xs text-ink-muted mt-1">{scenario.recommendedCareAction}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Workflow</div>
        <div className="flex flex-wrap items-center gap-2">
          {wf.map((w, i) => {
            const active = i <= stageIdx;
            return (
              <div key={w} className="flex items-center gap-2">
                <AnimatePresence>
                  <motion.div
                    key={`${w}-${active}`}
                    initial={{ opacity: 0.6, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`vf-chip ${active ? (isGrowth ? 'bg-blue-600 text-white' : 'bg-vfRed text-white') : 'bg-mist text-ink-muted border border-mist-dark'}`}
                  >
                    {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {w}
                  </motion.div>
                </AnimatePresence>
                {i < wf.length - 1 && <ArrowRight className="w-3 h-3 text-ink-muted" />}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-mist-dark p-3 bg-white">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">{label}</div>
      <div className={`text-lg font-extrabold mt-0.5 ${accent ? 'text-vfRed' : 'text-ink'}`}>{value}</div>
    </div>
  );
}
