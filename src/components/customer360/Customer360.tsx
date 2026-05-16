import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { customerById } from '@/data/customers';
import { churnByCustomer } from '@/data/churn';
import { careHistory, networkExperience, usageBilling, customerTimelines } from '@/data/timeline';
import { useDemoState } from '@/state/DemoStateProvider';
import { ChurnDriverBars, ChurnTrendChart, CurrentChurnGauge } from '@/components/churn/ChurnViz';
import { NextBestActionPanel } from '@/components/offers/NextBestActionPanel';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, BadgeCheck, Calendar, Phone, Smartphone, ShieldCheck, Wifi } from 'lucide-react';

const TABS = ['Overview', 'Churn', 'Network', 'Care', 'Usage & Billing', 'Offers'] as const;
type Tab = typeof TABS[number];

export function Customer360({ customerId, dense = false }: { customerId: string; dense?: boolean }) {
  const customer = customerById(customerId);
  const churn = churnByCustomer(customerId);
  const care = careHistory[customerId];
  const usage = usageBilling[customerId];
  const network = networkExperience[customerId];
  const timeline = customerTimelines[customerId] ?? [];
  const { effectiveChurn, isResolved, scenario } = useDemoState();
  const liveRisk = Math.round(effectiveChurn(customerId));
  const isGrowth = scenario.theme === 'growth';
  // Synthetic upgrade propensity for growth scenario — anchors at 0.78 for the
  // primary, scales by relative risk for others.
  const propensity = isGrowth
    ? (customerId === scenario.primaryCustomerId ? 0.78 : Math.max(0.45, Math.min(0.92, liveRisk / 100 + 0.1)))
    : 0;
  // Theme-aware default tab: billing → Usage & Billing, commercial/growth → Offers,
  // network → Overview (default).
  const defaultTab: Tab = scenario.theme === 'billing' ? 'Usage & Billing'
                       : scenario.theme === 'commercial' ? 'Offers'
                       : scenario.theme === 'growth' ? 'Offers'
                       : 'Overview';
  const [tab, setTab] = useState<Tab>(defaultTab);
  // Re-anchor to the right default when scenario theme changes (don't trap the
  // user on a tab that no longer makes sense for the new scenario).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { setTab(defaultTab); }, [scenario.theme]);

  const trendForStage = useMemo(() => {
    if (customerId !== 'CUST-001') return churn.trend;
    if (isResolved) return churn.trend;
    return churn.trend.map((p) => (p.week === 'Projected' ? { ...p, risk: NaN } : p)).filter((p) => !Number.isNaN(p.risk));
  }, [churn.trend, customerId, isResolved]);

  return (
    <div className={cn('vf-card flex flex-col', dense ? 'h-full min-h-0' : 'p-0')}>
      <div className="p-5 border-b border-mist-dark">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xl font-extrabold text-ink truncate">{customer.name}</div>
              <span className="vf-chip bg-mist text-ink-muted">{customer.brand}</span>
              <span className="vf-chip bg-mist text-ink-muted">{customer.id}</span>
            </div>
            <div className="text-xs text-ink-muted mt-0.5">{customer.location} · {customer.plan}</div>
          </div>
          <div className="text-right">
            {isGrowth ? (
              <>
                <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">Upgrade propensity</div>
                <div className="text-3xl font-extrabold leading-none text-blue-700">{propensity.toFixed(2)}</div>
                {isResolved && customerId === scenario.primaryCustomerId && (
                  <div className="text-[10px] font-bold text-ok mt-0.5">↑ ARPU +£12/mo on upgrade</div>
                )}
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Live churn risk</div>
                <div className={cn('text-3xl font-extrabold leading-none', liveRisk >= 70 ? 'text-vfRed' : liveRisk >= 50 ? 'text-amber' : 'text-ink')}>{liveRisk}%</div>
                {isResolved && customerId === 'CUST-001' && (
                  <div className="text-[10px] font-bold text-ok mt-0.5">↓ projected after action</div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {isGrowth ? (
            <>
              <span className="vf-chip bg-blue-600 text-white"><BadgeCheck className="w-3 h-3" /> Upgrade-ready</span>
              {customer.valueSegment === 'High' && <span className="vf-chip bg-ink text-white"><BadgeCheck className="w-3 h-3" /> High value</span>}
              <span className="vf-chip bg-blue-100 text-blue-800">5G handset</span>
              <span className="vf-chip bg-blue-100 text-blue-800">Heavy data user</span>
              {customer.contractEndDays <= 90 && <span className="vf-chip bg-blue-100 text-blue-800"><Calendar className="w-3 h-3" /> Renewal in {customer.contractEndDays}d</span>}
              {churn.decisioning.consentEligible && <span className="vf-chip bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3" /> Consent eligible</span>}
            </>
          ) : (
            <>
              {liveRisk >= 70 && <span className="vf-chip bg-vfRed text-white"><AlertTriangle className="w-3 h-3" /> High risk</span>}
              {customer.valueSegment === 'High' && <span className="vf-chip bg-ink text-white"><BadgeCheck className="w-3 h-3" /> High value</span>}
              {customer.isImpactedByIncident && <span className="vf-chip bg-amber/20 text-amber-800"><Wifi className="w-3 h-3" /> Network impacted</span>}
              {customer.contractEndDays <= 30 && <span className="vf-chip bg-mist text-ink-muted"><Calendar className="w-3 h-3" /> Contract in {customer.contractEndDays}d</span>}
              {churn.decisioning.consentEligible && <span className="vf-chip bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3" /> Consent eligible</span>}
              {customer.savePriority !== 'Suppress' && (
                <span className={cn('vf-chip', customer.savePriority === 'P1' ? 'bg-vfRed text-white' : 'bg-amber/20 text-amber-800')}>{customer.savePriority} save priority</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-2 border-b border-mist-dark overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition',
              tab === t
                ? (isGrowth ? 'border-blue-600 text-blue-700' : 'border-vfRed text-vfRed')
                : 'border-transparent text-ink-muted hover:text-ink')}>{t}</button>
          ))}
        </div>
      </div>

      <div className={cn('p-5 overflow-y-auto', dense ? 'flex-1 min-h-0' : '')}>
        {tab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Mini label="Tenure" value={`${customer.tenureMonths} mo`} />
              <Mini label="Plan" value={customer.plan} />
              <Mini label="Device" value={customer.device} />
              <Mini label="Monthly spend" value={`£${customer.monthlySpend}`} />
              <Mini label="CLV" value={`£${customer.customerLifetimeValue.toLocaleString()}`} />
              <Mini label="Renewal" value={customer.renewalWindow} />
              <Mini label="Household lines" value={customer.householdLines.toString()} />
              <Mini label="Value segment" value={customer.valueSegment} />
              <Mini label="Consent" value={customer.consentStatus} />
            </div>
            <div className="rounded-xl border border-mist-dark p-4">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Recent customer events</div>
              <ul className="space-y-1.5">
                {timeline.map((e, i) => (
                  <li key={i} className="text-sm flex gap-3">
                    <span className="text-xs text-ink-muted w-24 shrink-0">{e.date}</span>
                    <span className="text-ink">{e.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'Churn' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1 rounded-xl border border-mist-dark p-4">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live churn risk</div>
                <CurrentChurnGauge customerId={customerId} />
                <div className="text-xs text-ink-muted text-center -mt-3">{churn.churnRiskBand} · {churn.riskTrend}</div>
              </div>
              <div className="md:col-span-2 rounded-xl border border-mist-dark p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Risk trajectory · last 12 weeks</div>
                  <div className="text-[10px] text-ink-muted">Model {churn.modelVersion}</div>
                </div>
                <ChurnTrendChart data={trendForStage} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Mini label="30-day prob." value={`${churn.churnProbability30d}%`} />
              <Mini label="60-day prob." value={`${churn.churnProbability60d}%`} />
              <Mini label="90-day prob." value={`${churn.churnProbability90d}%`} />
            </div>

            <div className="rounded-xl border border-mist-dark p-4">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Why is this customer at risk?</div>
              <ChurnDriverBars drivers={churn.drivers} />
              <ul className="mt-3 space-y-1.5">
                {churn.drivers.map((d) => (
                  <li key={d.driver} className="text-xs text-ink-muted">
                    <span className="font-bold text-ink">{d.driver}</span> ({d.contribution} pts · {d.signalType}) — {d.evidence}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-mist p-3">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Model meta</div>
                <ul className="text-xs text-ink mt-1 space-y-0.5">
                  <li>Confidence: <span className="font-semibold">{churn.modelConfidence}%</span></li>
                  <li>Last scored: <span className="font-semibold">{churn.lastScoredAt}</span></li>
                  <li>PAC indicator: <span className="font-semibold">{churn.pacRequestIndicator}</span></li>
                  <li>STAC indicator: <span className="font-semibold">{churn.stacRequestIndicator}</span></li>
                  <li>NPS trend: <span className="font-semibold">{churn.npsTrend}</span></li>
                  <li>App engagement: <span className="font-semibold">{churn.appEngagementTrend}</span></li>
                </ul>
              </div>
              <div className="rounded-xl bg-mist p-3">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Revenue exposure</div>
                <ul className="text-xs text-ink mt-1 space-y-0.5">
                  <li>Expected revenue at risk: <span className="font-semibold">£{churn.expectedRevenueAtRisk}</span></li>
                  <li>90-day exposure: <span className="font-semibold">£{churn.revenueAtRisk90d}</span></li>
                  <li>Customer lifetime value: <span className="font-semibold">£{churn.customerLifetimeValue.toLocaleString()}</span></li>
                  <li>Save priority: <span className="font-semibold">{churn.savePriority}</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'Network' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Mini label="Network exp. score" value={`${network.networkExperienceScore}/100`} accent={network.networkExperienceScore < 60} />
              <Mini label="Dropped calls (14d)" value={`${network.droppedCalls14d}`} />
              <Mini label="Failed sessions (14d)" value={`${network.failedDataSessions14d}`} />
              <Mini label="DL speed before" value={`${network.avgDownloadSpeedMbpsBefore} Mbps`} />
              <Mini label="DL speed after" value={`${network.avgDownloadSpeedMbpsAfter} Mbps`} accent={network.avgDownloadSpeedMbpsAfter < network.avgDownloadSpeedMbpsBefore - 30} />
              <Mini label="Affected cell site" value={network.affectedCellSite} />
            </div>
            <div className="rounded-xl bg-mist p-3 text-sm">
              <span className="font-bold text-ink">Incident exposure: </span>
              <span className={cn(network.incidentExposure === 'High' && 'text-vfRed font-semibold')}>{network.incidentExposure}</span>
              {network.homePostcodeImpacted && <span className="text-ink-muted"> · Home postcode within active incident radius</span>}
            </div>
          </div>
        )}

        {tab === 'Care' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Mini label="Open tickets" value={`${care.openTickets}`} accent={care.openTickets > 0} />
              <Mini label="Recent complaints" value={`${care.recentComplaints}`} accent={care.recentComplaints > 1} />
              <Mini label="Sentiment" value={care.sentiment} accent={care.sentiment === 'Negative'} />
              <Mini label="Resolution status" value={care.resolutionStatus} />
              <Mini label="Last contact reason" value={care.lastContactReason} />
            </div>
            <div className="rounded-xl bg-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1"><Phone className="w-3 h-3" /> Last agent note</div>
              <p className="text-sm text-ink mt-1">{care.lastAgentNote}</p>
            </div>
          </div>
        )}

        {tab === 'Usage & Billing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Mini label="Monthly data" value={`${usage.monthlyDataUsageGb} GB`} />
              <Mini label="Usage trend" value={usage.dataUsageTrend} />
              <Mini label="Roaming" value={usage.roamingUsage} accent={usage.roamingUsage.includes('High')} />
              <Mini label="Latest bill" value={`£${usage.latestBillAmount}`} accent={usage.billShockFlag} />
              <Mini label="Avg bill" value={`£${usage.averageBillAmount}`} />
              <Mini label="Payment status" value={usage.paymentStatus} />
            </div>
            <div className="rounded-xl bg-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1"><Smartphone className="w-3 h-3" /> Product holdings</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {usage.productHoldings.map((p) => <span key={p} className="vf-chip bg-white border border-mist-dark text-ink">{p}</span>)}
              </div>
            </div>
            {usage.billShockFlag && (
              <div className="rounded-xl border border-amber/40 bg-amber/10 p-3 text-sm">
                <div className="font-bold text-amber-800 flex items-center gap-1"><Activity className="w-4 h-4" /> Bill shock flagged</div>
                <p className="text-ink-muted">Latest bill significantly above average — consider proactive bill alerts and roaming pass review.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'Offers' && (
          <NextBestActionPanel customerId={customerId} />
        )}
      </div>
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-mist-dark p-3 bg-white">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">{label}</div>
      <div className={cn('text-sm font-bold mt-0.5', accent ? 'text-vfRed' : 'text-ink')}>{value}</div>
    </motion.div>
  );
}
