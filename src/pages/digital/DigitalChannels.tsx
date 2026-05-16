import { useMemo } from 'react';
import { MessageSquare, Mail, Smartphone, Phone, MessageCircle, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoState } from '@/state/DemoStateProvider';
import { cn } from '@/lib/utils';
import { scriptForIncident } from '@/data/nocSequence';
import { ChannelRoiScatter, ChannelCostWaterfall, DigitalMlBadge } from './DigitalCharts';

interface ChannelMetric {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  reach: number;
  consentRate: number;
  capRemaining: number;
  match: RegExp; // events that fire activity for this channel
  cost: string;
}

// Default cohort dispatch profile (used by NOC/legacy scenarios when no
// Digital scenario-specific profile applies).
const defaultChannels: ChannelMetric[] = [
  { id: 'sms',      label: 'SMS',              icon: MessageSquare, reach: 89, consentRate: 100, capRemaining: 2, match: /\bSMS\b/i, cost: '£0.04 each' },
  { id: 'push',     label: 'App push',         icon: Smartphone,    reach: 67, consentRate: 75,  capRemaining: 5, match: /push|app push|notification|notify_secure/i, cost: 'free' },
  { id: 'email',    label: 'Email',            icon: Mail,          reach: 89, consentRate: 100, capRemaining: 4, match: /email/i, cost: '£0.001 each' },
  { id: 'rcs',      label: 'RCS',              icon: MessageCircle, reach: 41, consentRate: 46,  capRemaining: 3, match: /\bRCS\b|quick-repl/i, cost: '£0.02 each' },
  { id: 'voice',    label: 'Voice (callback)', icon: Phone,         reach: 12, consentRate: 100, capRemaining: 1, match: /voice|callback|registered MSISDN/i, cost: '£0.85/call' },
  { id: 'whatsapp', label: 'WhatsApp',         icon: MessageCircle, reach: 28, consentRate: 31,  capRemaining: 2, match: /whatsapp/i, cost: '£0.05 each' },
];

// Per-scenario channel dispatch profiles. Each Digital scenario has its own
// realistic cohort-sized reach so the orchestrator no longer shows the same
// 89 / 67 / 89 / 41 / 12 / 28 dispatch counts everywhere.
function channelsForScenario(incidentId: string): ChannelMetric[] {
  switch (incidentId) {
    case 'dig-care-chat-deflection': return [
      { ...defaultChannels[0], reach: 0,    capRemaining: 3 },                 // SMS — none, in-conversation
      { ...defaultChannels[1], reach: 0,    capRemaining: 5 },                 // push
      { ...defaultChannels[2], reach: 0,    capRemaining: 4 },                 // email
      { ...defaultChannels[3], reach: 0,    capRemaining: 3 },                 // RCS
      { ...defaultChannels[4], reach: 0,    capRemaining: 1 },                 // voice
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },                 // whatsapp
    ];
    case 'dig-voice-save-cancel': return [
      { ...defaultChannels[0], reach: 1,    capRemaining: 3 },                 // SMS follow-up
      { ...defaultChannels[1], reach: 0,    capRemaining: 5 },
      { ...defaultChannels[2], reach: 1,    capRemaining: 4 },                 // confirmation email
      { ...defaultChannels[3], reach: 0,    capRemaining: 3 },
      { ...defaultChannels[4], reach: 1,    capRemaining: 1 },                 // the call itself
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-esim-activation-funnel': return [
      { ...defaultChannels[0], reach: 412,  capRemaining: 8 },
      { ...defaultChannels[1], reach: 1250, capRemaining: 12 },                // recovery push
      { ...defaultChannels[2], reach: 89,   capRemaining: 14 },
      { ...defaultChannels[3], reach: 0,    capRemaining: 6 },
      { ...defaultChannels[4], reach: 412,  capRemaining: 4 },                 // voice callback recovery
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-roaming-push': return [
      { ...defaultChannels[0], reach: 0,    capRemaining: 8 },
      { ...defaultChannels[1], reach: 3720, capRemaining: 14 },                // push
      { ...defaultChannels[2], reach: 3720, capRemaining: 18 },                // email
      { ...defaultChannels[3], reach: 612,  capRemaining: 6 },                 // RCS confirm
      { ...defaultChannels[4], reach: 0,    capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-marketplace-bundle': return [
      { ...defaultChannels[0], reach: 0,    capRemaining: 12 },
      { ...defaultChannels[1], reach: 7980, capRemaining: 18 },                // in-app modal push
      { ...defaultChannels[2], reach: 2180, capRemaining: 22 },                // confirmation email
      { ...defaultChannels[3], reach: 0,    capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,    capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-appstore-rating-watch': return [
      { ...defaultChannels[0], reach: 0,    capRemaining: 8 },
      { ...defaultChannels[1], reach: 18400, capRemaining: 18 },               // in-app intercept
      { ...defaultChannels[2], reach: 4200, capRemaining: 14 },                // resolution email
      { ...defaultChannels[3], reach: 0,    capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,    capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-web-checkout-abandon': return [
      { ...defaultChannels[0], reach: 1820, capRemaining: 8 },                 // recovery SMS
      { ...defaultChannels[1], reach: 760,  capRemaining: 12 },                // app push
      { ...defaultChannels[2], reach: 1820, capRemaining: 14 },                // recovery email
      { ...defaultChannels[3], reach: 240,  capRemaining: 6 },                 // RCS rich
      { ...defaultChannels[4], reach: 0,    capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-vulnerable-care-routing': return [
      { ...defaultChannels[0], reach: 0,    capRemaining: 6 },
      { ...defaultChannels[1], reach: 0,    capRemaining: 6 },
      { ...defaultChannels[2], reach: 1,    capRemaining: 8 },                 // payment-plan email
      { ...defaultChannels[3], reach: 0,    capRemaining: 4 },
      { ...defaultChannels[4], reach: 1,    capRemaining: 1 },                 // specialist callback
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-fcr-prediction': return [
      { ...defaultChannels[0], reach: 0,    capRemaining: 8 },
      { ...defaultChannels[1], reach: 4180, capRemaining: 12 },                // in-bot
      { ...defaultChannels[2], reach: 0,    capRemaining: 14 },
      { ...defaultChannels[3], reach: 1420, capRemaining: 6 },                 // assist mode quick-replies
      { ...defaultChannels[4], reach: 600,  capRemaining: 4 },                 // route human (specialist)
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-app-fraud-signup': return [
      { ...defaultChannels[0], reach: 18,   capRemaining: 8 },                 // KYC step-up SMS
      { ...defaultChannels[1], reach: 14,   capRemaining: 12 },                // step-up push
      { ...defaultChannels[2], reach: 18,   capRemaining: 14 },                // confirmation email
      { ...defaultChannels[3], reach: 0,    capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,    capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,    capRemaining: 2 },
    ];
    case 'dig-campaign-launch-lookalike': return [
      { ...defaultChannels[0], reach: 0,     capRemaining: 8 },
      { ...defaultChannels[1], reach: 232000, capRemaining: 18 },              // in-app push
      { ...defaultChannels[2], reach: 232000, capRemaining: 22 },              // email
      { ...defaultChannels[3], reach: 108000, capRemaining: 6 },               // RCS
      { ...defaultChannels[4], reach: 0,     capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,     capRemaining: 2 },
    ];
    case 'dig-attribution-rebalance': return [
      { ...defaultChannels[0], reach: 0,     capRemaining: 8 },
      { ...defaultChannels[1], reach: 0,     capRemaining: 12 },
      { ...defaultChannels[2], reach: 0,     capRemaining: 14 },
      { ...defaultChannels[3], reach: 0,     capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,     capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,     capRemaining: 2 },
    ];
    case 'dig-competitor-counter': return [
      { ...defaultChannels[0], reach: 940,   capRemaining: 8 },                // SMS
      { ...defaultChannels[1], reach: 940,   capRemaining: 12 },               // in-app
      { ...defaultChannels[2], reach: 0,     capRemaining: 14 },
      { ...defaultChannels[3], reach: 0,     capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,     capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,     capRemaining: 2 },
    ];
    case 'dig-winback-lapsed': return [
      { ...defaultChannels[0], reach: 2540,  capRemaining: 8 },
      { ...defaultChannels[1], reach: 4180,  capRemaining: 12 },
      { ...defaultChannels[2], reach: 8200,  capRemaining: 14 },
      { ...defaultChannels[3], reach: 0,     capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,     capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,     capRemaining: 2 },
    ];
    case 'dig-anniversary-loyalty': return [
      { ...defaultChannels[0], reach: 0,     capRemaining: 8 },
      { ...defaultChannels[1], reach: 12200, capRemaining: 12 },               // push
      { ...defaultChannels[2], reach: 12200, capRemaining: 14 },               // email
      { ...defaultChannels[3], reach: 0,     capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,     capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,     capRemaining: 2 },
    ];
    case 'dig-refer-a-friend': return [
      { ...defaultChannels[0], reach: 0,     capRemaining: 8 },
      { ...defaultChannels[1], reach: 8400,  capRemaining: 12 },               // push
      { ...defaultChannels[2], reach: 8400,  capRemaining: 14 },               // email
      { ...defaultChannels[3], reach: 0,     capRemaining: 6 },
      { ...defaultChannels[4], reach: 0,     capRemaining: 4 },
      { ...defaultChannels[5], reach: 0,     capRemaining: 2 },
    ];
    default: return defaultChannels;
  }
}

export default function DigitalChannels() {
  const { firedEvents, nocPlaying, tElapsedMs, selectedIncidentId, currentStage } = useDemoState();
  const script = scriptForIncident(selectedIncidentId);
  const channels = useMemo(() => channelsForScenario(selectedIncidentId), [selectedIncidentId]);

  const careEvents = useMemo(
    () => firedEvents.filter((e) => e.category === 'Care' || /push|sms|email|notify|playbook|comms|rcs/i.test(e.text)),
    [firedEvents]
  );

  const idle = !nocPlaying && tElapsedMs === 0 && firedEvents.length === 0;
  const dispatchStarted = currentStage === 'act' || currentStage === 'verify' || currentStage === 'resolved';
  const acked = currentStage === 'verify' || currentStage === 'resolved';

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Digital · Channels</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Channel Orchestrator</h1>
          <p className="text-xs text-ink-muted">Execution layer for outbound comms — dispatches NBAs from the Decisioning agents with consent, frequency cap, channel suitability and Ofcom rule checks. Per-channel ROI, deliverability and complaints in real time.</p>
          <div className="mt-2"><DigitalMlBadge pageKey="channels" /></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> GDPR Art.6 + 22 · Ofcom GC C1</span>
          <span className="vf-chip bg-mist text-ink-muted text-[10px]"><Radio className="w-3 h-3" /> Consent + cap enforced</span>
        </div>
      </header>

      {!idle && (
        <div className="vf-card p-3 border-l-4 border-l-vfRed">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('vf-chip text-[10px] font-bold', nocPlaying ? 'bg-vfRed text-white animate-pulse' : 'bg-emerald-100 text-emerald-700')}>
              {nocPlaying ? 'LIVE · IN SYNC WITH NOC' : 'SCENARIO PAUSED'}
            </span>
            <span className="vf-chip bg-mist text-ink-muted text-[10px] uppercase">{currentStage}</span>
            <span className="vf-chip bg-mist text-ink font-mono text-[10px]">T+ {(tElapsedMs / 1000).toFixed(1)}s / {script.durationSec}s</span>
            <span className="text-[12px] text-ink ml-1"><b>{selectedIncidentId}</b></span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {channels.map((c, i) => (
          <ChannelCard
            key={c.id}
            c={c}
            dispatchStarted={dispatchStarted}
            acked={acked}
            careEvents={careEvents}
            delay={i * 0.04}
          />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Comms event stream (NOC sync)</div>
              <span className="text-[10px] text-ink-muted">{careEvents.length} events</span>
            </div>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 -mr-1">
              <AnimatePresence initial={false}>
                {careEvents.slice(0, 30).map((e) => (
                  <motion.div key={e.fid} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex gap-3 text-[11.5px] leading-snug">
                    <span className="font-mono text-ink-muted w-12 shrink-0">{e.realTime}</span>
                    <span className={cn('flex-1', e.severity === 'critical' ? 'text-vfRed-dark font-semibold' : e.severity === 'success' ? 'text-emerald-700' : e.severity === 'warn' ? 'text-amber-700' : 'text-ink')}>{e.text}</span>
                  </motion.div>
                ))}
                {careEvents.length === 0 && (
                  <div className="text-[11.5px] text-ink-muted italic py-2">No comms events yet. Run a Digital scenario from the sidebar to see channel orchestration in real time.</div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">
              <ShieldCheck className="w-3 h-3" /> Guardrails (deterministic, agent-instructed)
            </div>
            <ul className="text-[12px] text-ink space-y-1.5">
              <li><b>Consent</b> — granular per channel · withdraw any time</li>
              <li><b>Frequency cap</b> — 3/day, 7/week per customer · auto-throttle</li>
              <li><b>Quiet hours</b> — 21:00–08:00 local · marketing only</li>
              <li><b>Margin floor</b> — offer cost ≤ predicted CLV uplift</li>
              <li><b>Offer fatigue</b> — block if any retention offer in last 12d</li>
              <li><b>Open complaint</b> — block all proactive comms</li>
              <li><b>Ofcom GC C1</b> — clear pricing & post-contract info</li>
            </ul>
          </div>
          <div className="vf-card p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">
              <AlertTriangle className="w-3 h-3" /> Suppressed
            </div>
            <div className="text-[12px] text-ink-muted">Suppressions logged for audit (consent withdrawn · frequency-cap exhausted · open complaint · offer fatigue).</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Channel ROI · cost vs conversion</div>
          <ChannelRoiScatter />
          <div className="text-[10px] text-ink-muted mt-1">Bubble size = volume · model <span className="font-mono">channel_recommender_v2</span></div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Weekly cost waterfall</div>
          <ChannelCostWaterfall />
          <div className="text-[10px] text-ink-muted mt-1">£/wk by channel · Sinch + Salesforce MC + Genesys</div>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ c, dispatchStarted, acked, careEvents, delay }: { c: ChannelMetric; dispatchStarted: boolean; acked: boolean; careEvents: { text: string }[]; delay: number }) {
  const Icon = c.icon;
  const matchedEvents = careEvents.filter((e) => c.match.test(e.text));
  const hasActivity = matchedEvents.length > 0;
  const sent = !dispatchStarted && !hasActivity ? 0 : c.reach;
  const ack = acked ? Math.round(c.reach * 0.7) : (hasActivity ? Math.round(c.reach * 0.3) : 0);
  const state: 'sending' | 'queued' | 'idle' | 'done' =
    !hasActivity && !dispatchStarted ? 'idle'
    : !dispatchStarted ? 'queued'
    : !acked ? 'sending'
    : 'done';
  const stateCls = state === 'sending' ? 'bg-vfRed-soft text-vfRed-dark animate-pulse'
    : state === 'queued' ? 'bg-amber/20 text-amber-800'
    : state === 'done' ? 'bg-emerald-100 text-emerald-700'
    : 'bg-mist text-ink-muted';
  const ackPct = sent ? Math.round((ack / sent) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="vf-card p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-ink" />
          <span className="font-bold text-sm text-ink">{c.label}</span>
        </div>
        <span className={cn('vf-chip text-[9px] uppercase font-bold', stateCls)}>{state}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        <Stat label="Reach" value={`${c.reach}`} />
        <Stat label="Sent" value={`${sent}`} />
        <Stat label="Ack" value={`${ack}`} sub={`${ackPct}%`} />
        <Stat label="Cap left" value={`${c.capRemaining}`} sub="today" />
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-mist overflow-hidden">
        <div className="h-full bg-vfRed transition-all duration-500" style={{ width: `${(sent / Math.max(1, c.reach)) * 100}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-ink-muted mt-1.5">
        <span>Consent {c.consentRate}%</span>
        <span>{c.cost}</span>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-mist/60 px-1.5 py-1">
      <div className="text-[9px] uppercase text-ink-muted font-bold tracking-wider">{label}</div>
      <div className="font-mono tabular-nums text-sm font-extrabold text-ink leading-none">{value}</div>
      {sub && <div className="text-[9px] text-ink-muted">{sub}</div>}
    </div>
  );
}
