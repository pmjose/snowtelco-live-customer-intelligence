import { useState } from 'react';
import { Link } from 'react-router-dom';
import { customers } from '@/data/customers';
import { useDemoState } from '@/state/DemoStateProvider';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomersList() {
  const { effectiveChurn, compareIds, toggleCompare, selectCustomer } = useDemoState();
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState<string>('All');

  const filtered = customers.filter((c) =>
    (q === '' || c.name.toLowerCase().includes(q.toLowerCase()) || c.location.toLowerCase().includes(q.toLowerCase())) &&
    (brand === 'All' || c.brand === brand)
  ).sort((a, b) => effectiveChurn(b.id) - effectiveChurn(a.id));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-vfRed font-bold">Decisioning</div>
        <h1 className="text-3xl font-extrabold text-ink">At-Risk Customers</h1>
        <p className="text-sm text-ink-muted">Filter, compare, and open Customer 360 for any at-risk customer.</p>
      </header>

      <div className="vf-card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or location..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-mist-dark text-sm bg-white" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-ink-muted" />
          {['All', 'SnowTelco', 'SnowTelco Lite', 'SnowFlex', 'SnowGo'].map((b) => (
            <button key={b} onClick={() => setBrand(b)} className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold',
              brand === b ? 'bg-ink text-white' : 'bg-mist text-ink-muted hover:text-ink')}>{b}</button>
          ))}
        </div>
        <div className="text-xs text-ink-muted ml-auto">{filtered.length} customers · {compareIds.length}/3 in compare</div>
      </div>

      <div className="vf-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-[10px] uppercase tracking-wider text-ink-muted font-bold">
            <tr>
              <th className="text-left px-3 py-2">Customer</th>
              <th className="text-left px-3 py-2">Brand</th>
              <th className="text-left px-3 py-2">Location</th>
              <th className="text-left px-3 py-2">Driver</th>
              <th className="text-right px-3 py-2">Risk</th>
              <th className="text-right px-3 py-2">CLV</th>
              <th className="text-right px-3 py-2">Save</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const r = Math.round(effectiveChurn(c.id));
              const inCompare = compareIds.includes(c.id);
              return (
                <tr key={c.id} className="border-t border-mist-dark hover:bg-mist/50">
                  <td className="px-3 py-2 font-bold text-ink">{c.name}</td>
                  <td className="px-3 py-2"><span className="vf-chip bg-mist text-ink-muted">{c.brand}</span></td>
                  <td className="px-3 py-2 text-ink-muted">{c.location}</td>
                  <td className="px-3 py-2 text-ink-muted">{c.mainDriver}</td>
                  <td className={cn('px-3 py-2 text-right font-extrabold', r >= 70 ? 'text-vfRed' : r >= 50 ? 'text-amber' : 'text-ink')}>{r}%</td>
                  <td className="px-3 py-2 text-right text-ink">£{c.customerLifetimeValue.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={cn('vf-chip', c.savePriority === 'P1' ? 'bg-vfRed text-white' : c.savePriority === 'Suppress' ? 'bg-ink-muted text-white' : 'bg-amber/20 text-amber-800')}>{c.savePriority}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => toggleCompare(c.id)} className={cn('text-xs font-semibold mr-2', inCompare ? 'text-vfRed' : 'text-ink-muted hover:text-ink')}>
                      {inCompare ? 'In compare' : '+ Compare'}
                    </button>
                    <Link to={`/customer/${c.id}`} onClick={() => selectCustomer(c.id)} className="text-xs font-semibold text-ink hover:text-vfRed">Open 360 →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
