import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChurnBySegmentChart, IncidentImpactByCityChart, NetworkQualityTrendChart, RevenueAtRiskCard, RiskByDriverChart, RiskDistributionChart, MlSpotlightChart } from '@/components/charts/Dashboards';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { analyticsForScenario } from '@/data/analyticsByScenario';

export default function ExecutiveInsights() {
  const [counterfactual, setCounterfactual] = useState(false);
  const { scenario } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  const cf = a.counterfactual;
  const isGrowth = scenario.theme === 'growth';
  const view = counterfactual ? cf.doNothing : cf.withActions;

  // Theme-tuned chrome
  const kicker = isGrowth ? 'text-blue-700' : 'text-vfRed';
  const accentBorder = counterfactual ? 'border-l-amber' : (isGrowth ? 'border-l-blue-600' : 'border-l-vfRed');

  // Per-scenario chart titles
  const titles = {
    distribution:
      scenario.theme === 'billing'    ? 'Bill increase distribution' :
      scenario.theme === 'commercial' ? 'PAC funnel distribution' :
      scenario.theme === 'growth'     ? '5G upgrade readiness distribution' :
                                        'Risk distribution',
    segment:
      scenario.theme === 'billing'    ? 'Bill-shock by segment' :
      scenario.theme === 'commercial' ? 'PAC volume by tariff' :
      scenario.theme === 'growth'     ? 'Upgrade propensity by segment' :
                                        'Churn by segment',
    driver:
      scenario.theme === 'billing'    ? 'Driver share · bill-shock' :
      scenario.theme === 'commercial' ? 'Driver share · PAC' :
      scenario.theme === 'growth'     ? 'Driver share · upgrade' :
                                        'Risk by driver',
    revenue:
      isGrowth ? 'ARPU lift opportunity' : 'Revenue at risk',
    kpi: a.kpiTrend.yLabel,
    city: a.cityImpact.title,
    ml:
      scenario.theme === 'billing'    ? 'Bill forecast vs actual · ML' :
      scenario.theme === 'commercial' ? 'Demand curve · price elasticity · ML' :
      scenario.theme === 'growth'     ? 'Upgrade-propensity distribution · ML' :
                                        'Anomaly score by cell · ML',
  };

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-4">
      <header>
        <div className={`text-xs uppercase tracking-wider font-bold ${kicker}`}>Analytics</div>
        <h1 className="text-3xl font-extrabold text-ink">{isGrowth ? 'Growth Insights' : 'Executive Insights'}</h1>
        <p className="text-sm text-ink-muted">
          {isGrowth
            ? 'Quantify ARPU lift and upgrade conversion vs the do-nothing baseline.'
            : 'Quantify revenue at risk, save opportunities, and the cost of inaction.'}
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className={`vf-card p-5 border-l-4 ${accentBorder}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{counterfactual ? cf.doLabel : cf.withLabel}</div>
            <div className="text-2xl font-extrabold text-ink mt-0.5">{counterfactual ? cf.headlineDoNothing : cf.headlineWith}</div>
            <div className="text-xs text-ink-muted">{cf.cohortNote}</div>
          </div>
          <button onClick={() => setCounterfactual(!counterfactual)} className="vf-btn-secondary">
            {counterfactual ? <ToggleRight className="w-4 h-4 text-amber" /> : <ToggleLeft className="w-4 h-4 text-ink-muted" />}
            {counterfactual ? cf.doLabel : cf.withLabel}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Mini label={cf.primaryUnit}   value={view.primary}   accent={counterfactual} />
          <Mini label={cf.secondaryUnit} value={view.secondary} accent={counterfactual} />
          <Mini label={cf.tertiaryUnit}  value={view.tertiary}  accent={counterfactual} />
          <Mini label={cf.npsUnit}       value={view.nps}       accent={counterfactual} />
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 md:col-span-6 lg:col-span-3" title={titles.distribution}><RiskDistributionChart /></Card>
        <Card className="col-span-12 md:col-span-6 lg:col-span-3" title={titles.segment}><ChurnBySegmentChart /></Card>
        <Card className="col-span-12 md:col-span-6 lg:col-span-3" title={titles.driver}><RiskByDriverChart /></Card>
        <Card className="col-span-12 md:col-span-6 lg:col-span-3" title={titles.revenue}><RevenueAtRiskCard /></Card>
        <Card className="col-span-12 lg:col-span-6" title={`${titles.kpi} · ${scenario.city} ${scenario.postcode}`}><NetworkQualityTrendChart /></Card>
        <Card className="col-span-12 lg:col-span-6" title={titles.city}><IncidentImpactByCityChart /></Card>
        <Card className="col-span-12 lg:col-span-12" title={titles.ml}><MlSpotlightChart /></Card>
      </div>
    </div>
  );
}

function Card({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`vf-card p-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-ink">{title}</div>
        <LastUpdated />
      </div>
      {children}
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-mist p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className={`text-xl font-extrabold mt-0.5 ${accent ? 'text-amber-700' : 'text-ink'}`}>{value}</div>
    </div>
  );
}
