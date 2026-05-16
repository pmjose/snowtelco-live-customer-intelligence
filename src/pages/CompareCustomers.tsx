import { useDemoState } from '@/state/DemoStateProvider';
import { customers } from '@/data/customers';
import { customerById } from '@/data/customers';
import { churnByCustomer } from '@/data/churn';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EChart } from '@/components/charts/EChart';

export default function CompareCustomers() {
  const { compareIds, toggleCompare, clearCompare, effectiveChurn } = useDemoState();
  const items = compareIds.map((id) => ({ c: customerById(id), churn: churnByCustomer(id) }));

  const radar = {
    legend: { textStyle: { color: '#6b7280' } },
    radar: {
      indicator: [
        { name: 'Churn risk', max: 100 },
        { name: 'Network exp.', max: 100 },
        { name: 'CLV (£k)', max: 3 },
        { name: 'Tenure (yr)', max: 8 },
        { name: 'Spend (£/mo)', max: 80 },
      ],
      shape: 'polygon',
      splitLine: { lineStyle: { color: '#e5e7eb' } },
      axisName: { color: '#111', fontSize: 11, fontWeight: 600 },
    },
    series: [{
      type: 'radar',
      data: items.map(({ c }, i) => ({
        name: c.name,
        value: [Math.round(effectiveChurn(c.id)), c.networkExperienceScore, c.customerLifetimeValue / 1000, c.tenureMonths / 12, c.monthlySpend],
        lineStyle: { color: ['#29B5E8', '#0EA5E9', '#10B981'][i], width: 2 },
        areaStyle: { color: ['#29B5E833', '#0EA5E933', '#10B98133'][i] },
      })),
    }],
  } as any;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-vfRed font-bold">Decisioning</div>
        <h1 className="text-3xl font-extrabold text-ink">Compare Customers</h1>
        <p className="text-sm text-ink-muted">Pick 2–3 customers to compare risk, drivers, and exposure side-by-side.</p>
      </header>

      <div className="vf-card p-3">
        <div className="flex flex-wrap gap-2">
          {customers.map((c) => {
            const inSel = compareIds.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggleCompare(c.id)} className={cn('vf-chip text-xs',
                inSel ? 'bg-vfRed text-white' : 'bg-mist text-ink-muted hover:bg-vfRed-soft hover:text-vfRed-dark')}>
                {inSel ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {c.name} · {c.brand}
              </button>
            );
          })}
          {compareIds.length > 0 && (
            <button onClick={clearCompare} className="vf-chip border border-mist-dark text-ink-muted ml-2">Clear all</button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="vf-card p-12 text-center text-ink-muted">Select customers above to start comparing.</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="vf-card p-4">
            <div className="font-bold text-ink mb-2">Profile comparison</div>
            <EChart option={radar} height={360} />
          </div>
          <div className="vf-card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-mist text-[10px] uppercase tracking-wider text-ink-muted font-bold">
                <tr>
                  <th className="text-left px-3 py-2">Metric</th>
                  {items.map(({ c }) => <th key={c.id} className="text-right px-3 py-2">{c.name}</th>)}
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  { k: 'Brand', v: items.map((i) => i.c.brand) },
                  { k: 'Location', v: items.map((i) => i.c.location) },
                  { k: 'Churn risk', v: items.map((i) => `${Math.round(effectiveChurn(i.c.id))}%`) },
                  { k: 'Save priority', v: items.map((i) => i.c.savePriority) },
                  { k: 'Main driver', v: items.map((i) => i.c.mainDriver) },
                  { k: 'Network exp.', v: items.map((i) => `${i.c.networkExperienceScore}/100`) },
                  { k: 'Tenure', v: items.map((i) => `${i.c.tenureMonths} mo`) },
                  { k: 'Monthly spend', v: items.map((i) => `£${i.c.monthlySpend}`) },
                  { k: 'CLV', v: items.map((i) => `£${i.c.customerLifetimeValue.toLocaleString()}`) },
                  { k: 'Contract end', v: items.map((i) => `${i.c.contractEndDays}d`) },
                  { k: '90d revenue at risk', v: items.map((i) => `£${i.churn.revenueAtRisk90d}`) },
                ].map((row) => (
                  <tr key={row.k} className="border-t border-mist-dark">
                    <td className="px-3 py-2 text-ink-muted">{row.k}</td>
                    {row.v.map((cell, i) => <td key={i} className="px-3 py-2 text-right font-semibold">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
