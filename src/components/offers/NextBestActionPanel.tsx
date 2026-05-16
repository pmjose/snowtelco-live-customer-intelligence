import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ShieldCheck, Lock, ClipboardCheck, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoState } from '@/state/DemoStateProvider';
import { stageReached } from '@/state/stages';
import { offersByCustomer, recommendedHeadline, nonOfferActions } from '@/data/offers';
import { churnByCustomer } from '@/data/churn';
import { customerById } from '@/data/customers';
import { mlForScenario } from '@/data/mlMeta';
import { RetentionMessages } from './RetentionMessages';

export function NextBestActionPanel({ customerId }: { customerId: string }) {
  const { stage, scenario } = useDemoState();
  const customer = customerById(customerId);
  const churn = churnByCustomer(customerId);
  const offers = offersByCustomer[customerId] ?? [];
  const calculating = stage === 'offer_generated' && false;
  const isCalculating = stage === 'customer_selected';
  const isReady = stageReached(stage, 'offer_generated');
  const headline = recommendedHeadline[customerId];
  const suppressed = customer.savePriority === 'Suppress';
  const ml = mlForScenario(scenario.id).nba;
  const isGrowth = scenario.theme === 'growth';

  const decisioningSummary = useMemo(() => ({
    consent: churn.decisioning.consentEligible ? 'Eligible' : 'Blocked',
    offerFatigue: churn.decisioning.recentOfferFatigue ? 'Recent offer detected' : 'No recent offer',
    margin: churn.decisioning.marginFloorPassed ? 'Above floor' : 'Below floor',
    openComplaint: churn.decisioning.openComplaint ? 'Yes — resolve before commercial offer' : 'None',
  }), [churn]);

  return (
    <div className="vf-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${isGrowth ? 'text-blue-700' : 'text-vfRed'}`} />
          <div className="vf-section-title">{isGrowth ? 'Next Best Action · Upgrade' : 'Next Best Action'}</div>
        </div>
        <span className="vf-chip border border-mist-dark text-ink-muted">{
          scenario.theme === 'growth'     ? `Upgrade decisioning · ${customer.brand}`
        : scenario.theme === 'billing'    ? `Bill-shock decisioning · ${customer.brand}`
        : scenario.theme === 'commercial' ? `Retention decisioning · ${customer.brand}`
                                          : `Decisioning · ${customer.brand}`
        }</span>
      </div>

      {suppressed ? (
        <div className="rounded-xl bg-mist border border-mist-dark p-4">
          <div className="flex items-center gap-2 text-ink"><Lock className="w-4 h-4" /><span className="font-bold">Suppressed</span></div>
          <p className="text-sm text-ink-muted mt-1">{churn.decisioning.suppressReason}</p>
        </div>
      ) : isCalculating ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="shimmer h-14 rounded-xl" />
          ))}
          <div className="text-xs text-ink-muted">Calculating eligibility, propensity, margin, and uplift...</div>
        </div>
      ) : isReady ? (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${isGrowth ? 'bg-blue-50 border-blue-200' : 'bg-vfRed-soft/60 border-vfRed/30'}`}
          >
            <div className={`text-[10px] uppercase tracking-wider font-bold ${isGrowth ? 'text-blue-700' : 'text-vfRed-dark'}`}>{
              scenario.theme === 'growth'     ? 'Recommended upgrade'
            : scenario.theme === 'billing'    ? 'Recommended remediation'
            : scenario.theme === 'commercial' ? 'Recommended retention offer'
                                              : 'Recommended action'
            }</div>
            <div className="text-base font-bold text-ink mt-1">{headline}</div>
            <div className="text-xs text-ink-muted mt-1">{
              scenario.theme === 'growth'     ? 'Top action combines plan upgrade, handset incentive, and care touch.'
            : scenario.theme === 'billing'    ? 'Top action combines bill explanation, goodwill credit, and Roaming Pass enrolment.'
            : scenario.theme === 'commercial' ? 'Top action combines tariff match, loyalty boost, and offer-fatigue check.'
                                              : 'Top action combines care, commercial, and network response.'
            }</div>
          </motion.div>

          {/* Compact ML provenance strip — surfaced immediately under the
              recommended action so the model is visible without scrolling. */}
          <div className={`mt-2 rounded-lg border ${isGrowth ? 'border-blue-200 bg-blue-50/50' : 'border-mist-dark bg-mist'} px-3 py-1.5 flex items-center gap-2 flex-wrap text-[11px]`}>
            <Brain className={`w-3.5 h-3.5 shrink-0 ${isGrowth ? 'text-blue-700' : 'text-vfRed'}`} />
            <span className="font-mono text-ink font-bold">{ml.name}</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">{ml.scoreLabel}: <span className="font-mono text-ink">{ml.scoreValue}</span> <span className="text-ink-muted">CI {ml.ci}</span></span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">AUC <span className="font-mono text-ink">{ml.auc.toFixed(2)}</span></span>
            <span className="text-ink-muted">·</span>
            <span className={`vf-chip text-[10px] ${ml.drift === 'OK' ? 'bg-emerald-100 text-emerald-700' : ml.drift === 'Warning' ? 'bg-amber/20 text-amber-800' : 'bg-vfRed-soft text-vfRed-dark'}`}>drift {ml.drift}</span>
            <span className="text-ink-muted ml-auto font-mono truncate">audit · gold.decision_lineage</span>
          </div>

          <div className="space-y-2 mt-4">
            <AnimatePresence>
              {offers.map((o, i) => (
                <motion.div
                  key={o.rank}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-mist-dark p-3 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-ink text-white grid place-items-center text-xs font-bold shrink-0">#{o.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-ink">{o.offerName}</span>
                        <span className="vf-chip bg-mist text-ink-muted">{o.actionType}</span>
                        <span className={`vf-chip ${o.eligibility === 'Eligible' ? 'bg-emerald-100 text-emerald-700' : o.eligibility === 'Conditional' ? 'bg-amber/20 text-amber-800' : 'bg-vfRed-soft text-vfRed-dark'}`}>
                          {o.eligibility}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1">{o.rationale}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[11px]">
                        <Mini label="Accept %" value={`${o.acceptanceProbability}%`} />
                        <Mini label="Risk red." value={`-${o.expectedRiskReductionPts} pts`} />
                        <Mini label="Margin" value={o.marginImpact} />
                        <Mini label="Channel" value={o.channel} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Decisioning checks</div>
              <ul className="text-xs text-ink mt-1 space-y-0.5">
                <li>Consent: <span className="font-semibold">{decisioningSummary.consent}</span></li>
                <li>Offer fatigue: <span className="font-semibold">{decisioningSummary.offerFatigue}</span></li>
                <li>Margin: <span className="font-semibold">{decisioningSummary.margin}</span></li>
                <li>Open complaint: <span className="font-semibold">{decisioningSummary.openComplaint}</span></li>
              </ul>
            </div>
            <div className="rounded-xl bg-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1"><Send className="w-3 h-3" /> Non-commercial actions</div>
              <ul className="text-xs text-ink mt-1 space-y-0.5">
                {nonOfferActions.slice(0, 5).map((a) => (
                  <li key={a.id}>• {a.label} <span className="text-ink-muted">— {a.channel}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <RetentionMessages customerId={customerId} />
          </div>

          <div className={`mt-4 rounded-xl border ${isGrowth ? 'border-blue-200 bg-blue-50/60' : 'border-mist-dark bg-mist'} p-3`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Brain className={`w-4 h-4 ${isGrowth ? 'text-blue-700' : 'text-vfRed'}`} />
                <div className={`text-[10px] uppercase tracking-wider font-bold ${isGrowth ? 'text-blue-700' : 'text-vfRed-dark'}`}>Model trust · {ml.family}</div>
              </div>
              <span className={`vf-chip ${ml.drift === 'OK' ? 'bg-emerald-100 text-emerald-700' : ml.drift === 'Warning' ? 'bg-amber/20 text-amber-800' : 'bg-vfRed-soft text-vfRed-dark'}`}>Drift {ml.drift}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg bg-white px-2 py-1 border border-mist-dark min-w-0">
                <div className="text-[9px] uppercase tracking-wide text-ink-muted font-semibold">Model</div>
                <div className="text-xs font-mono font-bold text-ink truncate">{ml.name}</div>
              </div>
              <div className="rounded-lg bg-white px-2 py-1 border border-mist-dark min-w-0">
                <div className="text-[9px] uppercase tracking-wide text-ink-muted font-semibold">{ml.scoreLabel}</div>
                <div className="text-xs font-mono font-bold text-ink truncate">{ml.scoreValue}</div>
              </div>
              <div className="rounded-lg bg-white px-2 py-1 border border-mist-dark min-w-0">
                <div className="text-[9px] uppercase tracking-wide text-ink-muted font-semibold">CI</div>
                <div className="text-xs font-mono font-bold text-ink truncate">{ml.ci}</div>
              </div>
              <div className="rounded-lg bg-white px-2 py-1 border border-mist-dark min-w-0">
                <div className="text-[9px] uppercase tracking-wide text-ink-muted font-semibold">AUC · trained</div>
                <div className="text-xs font-mono font-bold text-ink truncate">{ml.auc.toFixed(2)} · {ml.lastTrained}</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">Top features (SHAP)</div>
              <div className="space-y-1">
                {ml.topFeatures.map((f) => {
                  const pct = Math.min(100, Math.abs(f.contribution) * 100);
                  const positive = f.contribution > 0;
                  return (
                    <div key={f.name} className="flex items-center gap-2">
                      <div className="w-44 text-[11px] text-ink truncate">{f.name}</div>
                      <div className="flex-1 h-2 bg-mist rounded-sm relative overflow-hidden">
                        <div className={`h-full ${positive ? (isGrowth ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-vfRed'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={`w-12 text-right text-[10px] font-mono ${positive ? 'text-emerald-700' : 'text-vfRed'}`}>{positive ? '+' : ''}{f.contribution.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-ink-muted font-mono truncate">Trained on {ml.trainedRows} · features from <span className="text-ink">{ml.goldTable}</span> · audit in <span className="text-ink">gold.decision_lineage</span></div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => toast.success('Approval workflow initiated', { description: 'Marketing → Compliance → Legal → Activation' })}
              className="vf-btn-primary"
            >
              <Send className="w-4 h-4" /> Approve & Send
            </button>
            <Link to="/approvals" className="vf-btn-secondary">
              <ClipboardCheck className="w-4 h-4" /> View Approval Workflow
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-sm text-ink-muted">{
          scenario.theme === 'growth'     ? 'Run the demo to generate ranked upgrade actions for this customer.'
        : scenario.theme === 'billing'    ? 'Run the demo to generate ranked bill-shock remediation actions for this customer.'
        : scenario.theme === 'commercial' ? 'Run the demo to generate ranked price-match retention actions for this customer.'
                                          : 'Run the demo to generate ranked retention actions for this customer.'
        }</div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-mist px-2 py-1 min-w-0">
      <div className="text-[9px] uppercase tracking-wide text-ink-muted font-semibold whitespace-nowrap">{label}</div>
      <div className="text-xs font-bold text-ink truncate">{value}</div>
    </div>
  );
}
