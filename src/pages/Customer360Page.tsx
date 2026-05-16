import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Customer360 } from '@/components/customer360/Customer360';
import { customerById } from '@/data/customers';
import { useDemoState } from '@/state/DemoStateProvider';
import { ChurnTrendChart } from '@/components/churn/ChurnViz';
import { churnByCustomer } from '@/data/churn';

export default function Customer360Page() {
  const { id } = useParams();
  const customerId = id ?? 'CUST-001';
  const customer = customerById(customerId);
  const churn = churnByCustomer(customerId);
  const { selectCustomer, scenario } = useDemoState();
  useEffect(() => { selectCustomer(customerId); }, [customerId, selectCustomer]);
  const isGrowth = scenario.theme === 'growth';

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/command-center" className="text-sm text-ink-muted hover:text-ink inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </Link>
        <div className="flex items-center gap-3">
          <Link to={`/bss/customer/${customerId}`} className="text-xs text-vfRed hover:text-vfRed-dark font-bold inline-flex items-center gap-1">
            Open in BSS 360 <ArrowRight className="w-3 h-3" />
          </Link>
          <span className="text-xs text-ink-muted">Customer profile · {customer.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <Customer360 customerId={customerId} />
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="vf-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              {isGrowth ? 'Engagement trajectory · 12 weeks' : 'Risk trajectory · 12 weeks'}
            </div>
            <ChurnTrendChart data={churn.trend} />
          </div>
          <div className="vf-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Decision lineage</div>
            <ul className="text-xs text-ink space-y-1">
              <li>• Features: <span className="font-mono text-ink-muted">gold.churn_features · gold.upgrade_propensity_features</span></li>
              <li>• Decisioning: <span className="font-mono text-ink-muted">gold.next_best_action · gold.policy_engine</span></li>
              <li>• Audit trail: <span className="font-mono text-ink-muted">gold.decision_lineage</span></li>
              <li>• Consent: <span className="font-mono text-ink-muted">gold.consent_register</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
