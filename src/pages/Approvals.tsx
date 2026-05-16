import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ClipboardCheck, Clock, Send, ShieldCheck, Megaphone, Scale } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';

interface Step { id: string; title: string; approver: string; icon: any; status: 'done' | 'active' | 'pending'; ts?: string; }

const initialSteps: Step[] = [
  { id: 'mkt', title: 'Marketing review', approver: 'C. Bennett · Retention Marketing', icon: Megaphone, status: 'done', ts: '09:43' },
  { id: 'comp', title: 'Compliance check', approver: 'M. Patel · Compliance', icon: ShieldCheck, status: 'done', ts: '09:44' },
  { id: 'legal', title: 'Legal review', approver: 'S. Edwards · Legal', icon: Scale, status: 'active' },
  { id: 'send', title: 'Activation send', approver: 'CIC Activation Service', icon: Send, status: 'pending' },
];

export default function Approvals() {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const { scenario } = useDemoState();

  // Per-scenario campaign framing.
  const campaign: Record<string, { headline: string; cohort: string; channels: string; eligible: string; suppressed: string; clv: string; }> = {
    manchester: {
      headline: 'Manchester M14 — proactive apology + £5 loyalty credit',
      cohort: '89 P1 customers (Manchester M14 cohort)',
      channels: 'SMS + push + care callback',
      eligible: '89/89',
      suppressed: '4',
      clv: '£163,400',
    },
    'birmingham-bill': {
      headline: 'Birmingham B4 — bill-shock explanation + £4 goodwill credit + Roaming Pass auto-enrol',
      cohort: '244 high-CLV customers (1,840 cohort)',
      channels: 'SMS bill-explanation + Genesys outbound retention',
      eligible: '244/244',
      suppressed: '12',
      clv: '£180,000',
    },
    'leeds-snowflex': {
      headline: 'Leeds SnowFlex — +30GB at same price + 6-month loyalty boost (PAC retention)',
      cohort: '28 high-CLV customers (940 active PAC requests)',
      channels: 'In-app retention modal + email',
      eligible: '28/28',
      suppressed: '2',
      clv: '£94,000',
    },
    'london-5g': {
      headline: 'London E14 — 5G SA Unlimited Max + £5 first-month credit (upgrade journey)',
      cohort: '12,400 5G-capable customers (320 high-CLV)',
      channels: 'In-app + push + email + Genesys retention call (high-CLV)',
      eligible: '12,400/12,400',
      suppressed: '180',
      clv: '£180,000/yr ARPU',
    },
  };
  const c = campaign[scenario.id] ?? campaign.manchester;

  const advance = () => {
    setSteps((prev) => {
      const i = prev.findIndex((s) => s.status === 'active');
      if (i < 0) return prev;
      const copy = [...prev];
      copy[i] = { ...copy[i], status: 'done', ts: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) };
      if (copy[i + 1]) copy[i + 1] = { ...copy[i + 1], status: 'active' };
      return copy;
    });
  };
  const reset = () => setSteps(initialSteps);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-vfRed font-bold">Decisioning</div>
        <h1 className="text-3xl font-extrabold text-ink">Approval Workflow</h1>
        <p className="text-sm text-ink-muted">Every commercial offer flows through Marketing, Compliance, Legal, and Activation gates before it reaches a customer.</p>
      </header>

      <div className="vf-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Active campaign · {scenario.short}</div>
            <div className="font-bold text-ink">{c.headline}</div>
            <div className="text-xs text-ink-muted">Cohort: {c.cohort} · Channel: {c.channels}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="vf-btn-secondary">Reset</button>
            <button onClick={advance} className="vf-btn-primary">
              <Check className="w-4 h-4" /> Approve current step
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 rounded-xl border p-3 ${
                s.status === 'done' ? 'bg-emerald-50 border-emerald-200'
                : s.status === 'active' ? 'bg-vfRed-soft/40 border-vfRed/30'
                : 'bg-mist border-mist-dark'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg grid place-items-center ${
                s.status === 'done' ? 'bg-emerald-500 text-white' :
                s.status === 'active' ? 'bg-vfRed text-white animate-pulse-red' : 'bg-white text-ink-muted border border-mist-dark'
              }`}>
                {s.status === 'done' ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-ink">{s.title}</div>
                <div className="text-xs text-ink-muted">{s.approver}</div>
              </div>
              <div className="text-xs text-ink-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {s.ts ? `${s.ts}` : s.status === 'active' ? 'In progress' : 'Pending'}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <Stat label="Eligibility checks passed" value={c.eligible} />
          <Stat label="Suppressed (offer fatigue)" value={c.suppressed} />
          <Stat label="Estimated CLV protected" value={c.clv} />
        </div>
      </div>

      <div className="vf-card p-5">
        <div className="vf-section-title mb-2 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-vfRed" /> Approval principles</div>
        <ul className="text-sm text-ink-muted list-disc list-inside space-y-1">
          <li>Consent-aware activation: only customers with marketing consent receive commercial messages.</li>
          <li>Margin floor: any offer below margin floor is automatically blocked.</li>
          <li>Offer fatigue: customers with retention offers in the last 14 days are suppressed.</li>
          <li>Open-complaint hold: care issue must be resolved before any commercial offer is sent.</li>
          <li>Audit trail: every approval is timestamped, logged in Snowflake, and traceable in Decision Lineage.</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-mist p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5">{value}</div>
    </div>
  );
}
