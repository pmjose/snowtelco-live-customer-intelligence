import { liveAgentRun, pastAgentRuns } from '@/data/agentRuns';
import { AgentReasoning } from '@/components/agent/AgentReasoning';
import { Clock, ShieldCheck, UserCheck } from 'lucide-react';

export default function NocAgentRuns() {
  const allClosed = pastAgentRuns;
  const totalSec = allClosed.reduce((acc, r) => acc + (r.mttrSeconds ?? 0), 0);
  const avgMttr = (totalSec / Math.max(1, allClosed.length) / 60).toFixed(1);
  const auto = allClosed.filter((r) => r.humanApprovals === 0).length;
  const autoPct = Math.round((auto / Math.max(1, allClosed.length)) * 100);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-5 space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-vfRed font-bold">Network Operations</div>
        <h1 className="text-3xl font-extrabold text-ink">Agent runs</h1>
        <p className="text-sm text-ink-muted">Every closed-loop incident response is auditable: detection → reasoning → actions → verification.</p>
      </header>

      <div data-focus="kpi-strip" className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat icon={<Clock className="w-4 h-4" />} label="Avg MTTR (last 7)" value={`${avgMttr} min`} />
        <Stat icon={<ShieldCheck className="w-4 h-4" />} label="Auto-resolved" value={`${autoPct}%`} sub={`${auto}/${allClosed.length} runs`} />
        <Stat icon={<UserCheck className="w-4 h-4" />} label="Human approvals" value={`${allClosed.reduce((a, r) => a + r.humanApprovals, 0)}`} sub="across closed runs" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="vf-card p-4">
            <div className="text-xs uppercase tracking-wider text-ink-muted font-bold mb-2">History</div>
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] text-ink-muted uppercase tracking-wider border-b border-mist-dark">
                <tr>
                  <th className="py-2 px-2">Run</th>
                  <th className="py-2 px-2">Started</th>
                  <th className="py-2 px-2">MTTR</th>
                  <th className="py-2 px-2">Approvals</th>
                  <th className="py-2 px-2">Outcome</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-mist-dark bg-vfRed-soft/40">
                  <td className="py-2 px-2 font-bold text-ink">{liveAgentRun.id}</td>
                  <td className="py-2 px-2 text-ink-muted">{liveAgentRun.startedAt}</td>
                  <td className="py-2 px-2 text-vfRed font-bold">LIVE</td>
                  <td className="py-2 px-2">{liveAgentRun.humanApprovals}</td>
                  <td className="py-2 px-2 text-ink-muted">{liveAgentRun.outcome}</td>
                </tr>
                {allClosed.map((r) => (
                  <tr key={r.id} className="border-b border-mist-dark hover:bg-mist/40">
                    <td className="py-2 px-2 font-bold text-ink">{r.id}</td>
                    <td className="py-2 px-2 text-ink-muted">{r.startedAt}</td>
                    <td className="py-2 px-2 font-mono">{((r.mttrSeconds ?? 0) / 60).toFixed(1)} min</td>
                    <td className="py-2 px-2">{r.humanApprovals}</td>
                    <td className="py-2 px-2 text-ink-muted">{r.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="min-h-[600px]">
          <AgentReasoning run={liveAgentRun} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="vf-card p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-muted font-bold">{icon}{label}</div>
      <div className="text-3xl font-extrabold text-ink mt-1 font-mono tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-ink-muted mt-0.5">{sub}</div>}
    </div>
  );
}
