import { motion } from 'framer-motion';
import { useDemoState } from '@/state/DemoStateProvider';
import { AtRiskCustomerList } from '@/components/customers/AtRiskCustomerList';
import { LiveTimeline } from '@/components/timeline/LiveTimeline';
import { DemoControls } from '@/components/app/DemoControls';
import { UkNetworkMap } from '@/components/map/UkNetworkMap';
import { IncidentCard } from '@/components/incident/IncidentCard';
import { Customer360 } from '@/components/customer360/Customer360';
import { ChurnBySegmentChart, IncidentImpactByCityChart, NetworkQualityTrendChart, OfferAcceptanceMatrixChart, RevenueAtRiskCard, RiskByDriverChart, RiskDistributionChart, MlSpotlightChart } from '@/components/charts/Dashboards';
import { BillShockHeatmap, CompetitivePricingPanel, UpgradeReadinessPanel, AnomalyChart } from '@/components/scenario-kits/HeroPanels';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';
import { stageReached } from '@/state/stages';
import { primaryIncident } from '@/data/networkEvents';
import { SparklineKpi } from '@/components/kpi/SparklineKpi';
import { kpiTrends } from '@/data/kpiTrends';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { EventStreamWidget } from '@/pages/EventStream';
import { incidentHasCicFocus } from '@/data/incidentToCic';
import { incidentById } from '@/data/nocIncidents';
import { Info } from 'lucide-react';

export default function CommandCenter() {
  const { selectedCustomerId, selectedIncidentId, scenario } = useDemoState();
  const hasCic = incidentHasCicFocus(selectedIncidentId);
  const incident = incidentById(selectedIncidentId);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider font-bold ${scenario.theme === 'growth' ? 'text-blue-700' : 'text-vfRed'}`}>
            {scenario.theme === 'growth' ? 'Growth Intelligence' : 'Customer Intelligence'}
          </div>
          <h1 className="text-3xl font-extrabold text-ink">
            {scenario.theme === 'growth' ? 'Live Growth Intelligence Command Center' : 'Live Customer Intelligence Command Center'}
          </h1>
          <p className="text-sm text-ink-muted">
            {scenario.theme === 'growth'
              ? 'Upgrade propensity, next-best-action, and proactive growth journeys across SnowTelco UK.'
              : 'Churn, next-best-action, and proactive network care across SnowTelco UK.'}
          </p>
        </div>
        <DemoControls />
      </div>

      {!hasCic && (
        <div className="rounded-lg bg-amber/15 border border-amber/40 px-3 py-2 text-[12px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <b>{incident.city}</b> has no single customer focus on CIC — this incident is systemic ({incident.priority} · {incident.affectedTechnology.join(' / ')}). The Customer 360 below shows a representative customer; the cohort summary and at-risk list still reflect the active scenario.
          </div>
        </div>
      )}

      <LiveTimeline />

      <KpiStrip />

      <div data-focus="cic-grid" className="grid grid-cols-12 gap-4">
        <div data-focus="cic-cohort" className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-[640px]">
          <div className="flex-1 min-h-[420px]"><AtRiskCustomerList /></div>
          <RevenueAtRiskCard />
        </div>

        <div data-focus="cic-incident" className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="h-[460px]">
            {scenario.theme === 'billing' ? <BillShockHeatmap />
             : scenario.theme === 'commercial' ? <CompetitivePricingPanel />
             : scenario.theme === 'growth' ? <UpgradeReadinessPanel />
             : <UkNetworkMap />}
          </div>
          <IncidentCard />
        </div>

        <div data-focus="cic-customer" className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <Customer360 customerId={selectedCustomerId} dense />
          <EventStreamWidget />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {scenario.theme === 'billing' ? (
          <>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Roaming overage distribution" subtitle={`${scenario.city} ${scenario.postcode}`}><RiskDistributionChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Bill-shock by tariff" subtitle="Bills 25%+ above baseline"><ChurnBySegmentChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Roaming policy compliance" subtitle="Auto-enrol coverage"><RiskByDriverChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Care queue inflow" subtitle="Bill-explanation requests"><NetworkQualityTrendChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Bill forecast vs actual" subtitle="ML · billshock_forecast_v2 · 80%/95% CI"><MlSpotlightChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Cost vs save payoff" subtitle="Refund cost vs CLV protected"><OfferAcceptanceMatrixChart /></ChartCard>
          </>
        ) : scenario.theme === 'commercial' ? (
          <>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="PAC volume" subtitle="Last 7 days · LS2/LS5"><RiskDistributionChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Tariff competitiveness" subtitle="vs top 3"><RiskByDriverChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Save rate" subtitle="vs untreated control"><ChurnBySegmentChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Margin floor" subtitle="Pre-approved offers"><NetworkQualityTrendChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Demand curve · price elasticity" subtitle="ML · price_elasticity_v1 · ε = -1.8"><MlSpotlightChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Offer acceptance vs margin" subtitle="Recommended offers (sized by risk reduction)"><OfferAcceptanceMatrixChart /></ChartCard>
          </>
        ) : scenario.theme === 'growth' ? (
          <>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="5G handset penetration" subtitle="London base"><RiskDistributionChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Upgrade propensity" subtitle="Score distribution"><ChurnBySegmentChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="ARPU lift simulator" subtitle="Monthly run-rate"><RiskByDriverChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="5G SA coverage" subtitle={`${scenario.city} ${scenario.postcode} cells`}><NetworkQualityTrendChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Upgrade propensity distribution" subtitle="ML · upgrade_propensity_v2 · threshold 0.6"><MlSpotlightChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Conversion funnel" subtitle="Eligible → exposed → upgraded"><OfferAcceptanceMatrixChart /></ChartCard>
          </>
        ) : (
          <>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Risk distribution" subtitle="Customer base"><RiskDistributionChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Churn by segment" subtitle="% predicted churn next 90d"><ChurnBySegmentChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Risk by driver" subtitle="Population share"><RiskByDriverChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-3" title="Network quality" subtitle={`${scenario.city} ${scenario.postcode} today`}><NetworkQualityTrendChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Anomaly score by cell · 24h" subtitle="ML · anomaly_detect_v3.1 · score 0.94 (CI 0.91–0.97)"><MlSpotlightChart /></ChartCard>
            <ChartCard className="col-span-12 md:col-span-6 lg:col-span-6" title="Offer acceptance vs margin" subtitle="Recommended offers (sized by risk reduction)"><OfferAcceptanceMatrixChart /></ChartCard>
          </>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, className, children }: { title: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`vf-card p-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold text-ink">{title}</div>
          {subtitle && <div className="text-xs text-ink-muted">{subtitle}</div>}
        </div>
        <LastUpdated />
      </div>
      {children}
    </div>
  );
}

function KpiStrip() {
  const { stage, isIncidentActive, isResolved, scenario } = useDemoState();
  const showCohort = isIncidentActive || isResolved;
  const impacted = showCohort ? scenario.impactedCustomers : 0;
  const p1 = showCohort ? scenario.highChurnRiskCustomers : 0;
  const highValue = showCohort ? scenario.highValueCustomers : 0;
  const reduction = isResolved ? 41 : 0;
  const PRIMARY_FIRST_NAMES: Record<string, string> = {
    'CUST-001': 'Amelia', 'CUST-002': 'Daniel', 'CUST-003': 'Hannah',
    'CUST-004': 'Ravi', 'CUST-005': 'Grace', 'CUST-006': 'Jack',
  };
  const primaryFirst = PRIMARY_FIRST_NAMES[scenario.primaryCustomerId] ?? 'primary';

  // Growth scenarios are about offence, not defence — relabel everything.
  if (scenario.theme === 'growth') {
    const eligible = showCohort ? scenario.impactedCustomers : 0;
    const offersReady = stageReached(stage, 'offer_generated') ? scenario.impactedCustomers : 0;
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SparklineKpi label={isResolved ? 'Eligible reached' : 'Eligible customers'} value={eligible.toLocaleString()} trend={kpiTrends.impactedCustomers} accent={isResolved ? 'text-emerald-600' : 'text-blue-700'} />
        <SparklineKpi label={isResolved ? 'High-CLV upgraded' : 'High-CLV'} value={highValue.toLocaleString()} trend={kpiTrends.highValue} accent={isResolved ? 'text-emerald-600' : 'text-blue-700'} />
        <SparklineKpi label="High-propensity" value={showCohort ? p1.toString() : '0'} trend={kpiTrends.p1Risk} accent="text-blue-700" />
        <SparklineKpi label="Coverage cells (5G SA)" value={showCohort ? '24' : '0'} trend={kpiTrends.netExp} color="#0EA5E9" accent="text-blue-700" />
        <SparklineKpi label="Offers ready" value={offersReady.toLocaleString()} trend={kpiTrends.acceptance} color="#10B981" accent="text-ink" />
        <SparklineKpi label={`ARPU lift forecast`} value={isResolved ? '£180k/yr' : '—'} trend={kpiTrends.saveValue} color="#10B981" accent={isResolved ? 'text-ok' : 'text-ink-muted'} />
      </div>
    );
  }

  // Defence scenarios: network / billing / commercial — same KPI shape with
  // theme-tuned colours.
  const impactedTone = isResolved ? 'text-emerald-600' : impacted > 0 ? 'text-vfRed' : 'text-ink';
  const p1Tone = isResolved ? 'text-emerald-600' : p1 > 0 ? 'text-vfRed' : 'text-ink';
  const impactedLabelLive = scenario.theme === 'billing' ? 'Bill-shock cohort' : scenario.theme === 'commercial' ? 'PAC requests' : 'Impacted customers';
  const p1LabelLive = scenario.theme === 'billing' ? 'Refund-eligible' : scenario.theme === 'commercial' ? 'High-CLV at risk' : 'P1 churn-risk';
  const middleLabel = scenario.theme === 'commercial' ? 'Save rate' : scenario.theme === 'billing' ? 'Roaming Pass enrolled' : 'Network exp. score';
  const middleValue = scenario.theme === 'commercial' ? (isResolved ? '44%' : isIncidentActive ? '12%' : '28%')
                    : scenario.theme === 'billing'    ? (isResolved ? '1,840' : isIncidentActive ? '0' : '—')
                    :                                    (isResolved ? '88' : isIncidentActive ? '44' : '95');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <SparklineKpi label={isResolved ? 'Cohort saved' : impactedLabelLive} value={impacted.toLocaleString()} trend={kpiTrends.impactedCustomers} accent={impactedTone} />
      <SparklineKpi label={isResolved ? 'P1 contacted' : p1LabelLive} value={p1.toString()} trend={kpiTrends.p1Risk} accent={p1Tone} />
      <SparklineKpi label={isResolved ? 'High-value protected' : 'High-value exposed'} value={highValue.toString()} trend={kpiTrends.highValue} accent={isResolved ? 'text-emerald-600' : 'text-amber-700'} />
      <SparklineKpi label={middleLabel} value={middleValue} trend={kpiTrends.netExp} color="#0EA5E9" accent={isResolved ? 'text-emerald-600' : isIncidentActive ? 'text-vfRed' : 'text-ink'} />
      <SparklineKpi label={`Save actions ready`} value={stageReached(stage, 'offer_generated') ? scenario.highChurnRiskCustomers.toString() : '0'} trend={kpiTrends.acceptance} color="#10B981" accent="text-ink" />
      <SparklineKpi label={`Risk reduction (${primaryFirst})`} value={reduction ? `-${reduction} pts` : '—'} trend={kpiTrends.saveValue} color="#10B981" accent={reduction ? 'text-ok' : 'text-ink-muted'} />
    </div>
  );
}
