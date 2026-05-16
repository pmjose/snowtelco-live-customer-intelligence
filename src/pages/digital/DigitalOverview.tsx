import { Smartphone, Layers, MessageCircle, Phone, Sparkles, ShoppingCart } from 'lucide-react';
import { DomainLanding, type DomainTile } from '@/components/shared/DomainLanding';
import { ScenarioTimeline } from '@/components/timeline/ScenarioTimeline';
import {
  DigitalMlBadge, MlDecisionsCounter, ChannelMixDonut, IntentStageHeatmap,
  DeflectionGauge, IntentDonut, ConversationalSentimentLine,
  VoiceAhtHistogram, VoiceSaveFunnel, VoiceWerTrend,
  JourneyDropoffHeatmap, JourneyRecoveryLine,
  BundleAttachTrend, CumulativeArpuLine, PartnerContributionDonut,
} from './DigitalCharts';

const tiles: DomainTile[] = [
  { to: '/digital/channels', label: 'Channel Orchestrator', desc: 'Multi-channel comms (Salesforce MC, Sinch SMS, Genesys Cloud) with consent + frequency caps + Ofcom marketing rules.', icon: Layers, status: 'live' },
  { to: '/digital/conversational', label: 'Conversational AI', desc: 'Chat deflection, intent + sentiment, escalate-to-human policy.', icon: MessageCircle, status: 'live' },
  { to: '/digital/voice', label: 'Voice Agent', desc: 'Inbound voice with live transcript, sentiment and next-best-action.', icon: Phone, status: 'live' },
  { to: '/digital/journeys', label: 'In-App Journeys', desc: 'eSIM activation, Roaming Pass, plan upgrade — agent-personalised.', icon: Sparkles, status: 'live' },
  { to: '/digital/marketplace', label: 'Marketplace', desc: 'Partner bundles (Disney+, Netflix, Spotify) and entitlement provisioning.', icon: ShoppingCart, status: 'live' },
];

export default function DigitalOverview() {
  return (
    <div>
      <DomainLanding
        kicker="Digital"
        title="Digital Channels"
        subtitle="App, web, conversational and voice — execution layer that reacts in sync with NOC orchestration."
        banner={null}
        kpis={[
          { label: 'Self-service rate', value: '74', unit: '%', delta: '+6pp WoW', tone: 'good' },
          { label: 'Care deflection', value: '64', unit: '%', delta: '+14pp WoW', tone: 'good' },
          { label: 'App DAU', value: '3.2M', delta: '+4%', tone: 'good' },
          { label: 'Voice AHT', value: '4:18', delta: '−42s', tone: 'good' },
          { label: 'Chat NPS', value: '+44', delta: '+3', tone: 'good' },
          { label: 'Outbound (24h)', value: '127k', delta: 'consent ✓', tone: 'neutral' },
        ]}
        tiles={tiles}
        timeline={<ScenarioTimeline />}
      />
      <div className="max-w-[1500px] mx-auto px-4 lg:px-6 pb-6 space-y-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4"><MlDecisionsCounter /></div>
          <div className="col-span-12 md:col-span-4 vf-card p-3"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Channel mix · last 24h</div><ChannelMixDonut /></div>
          <div className="col-span-12 md:col-span-4 vf-card p-3"><div className="flex items-center justify-between mb-1"><div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Active model</div></div><DigitalMlBadge pageKey="overview" /></div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Intent × stage heat-map · Cortex Classifier</div>
          <IntentStageHeatmap />
          <div className="text-[10px] text-ink-muted mt-2">Source <span className="font-mono">gold.cc_chats</span> + <span className="font-mono">gold.ivr_calls</span> · classifier <span className="font-mono">intent_classifier_v4.1</span></div>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Today's AI decisions · funnel (last 24h)</div>
          <Funnel stages={[
            { label: 'Requested',  value: 412000, tone: 'neutral' },
            { label: 'Eligible',   value: 388000, tone: 'good' },
            { label: 'Suppressed', value: 24000,  tone: 'warn' },
            { label: 'Served',     value: 364000, tone: 'good' },
            { label: 'Converted',  value: 29400,  tone: 'good' },
          ]} formatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
          <div className="text-[10px] text-ink-muted mt-2">Source <span className="font-mono">gold.decision_lineage</span> · <Link to="/digital/decisioning" className="text-vfRed font-bold">Open Decisioning Brain →</Link></div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-3 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Live deflection rate</div>
          <DeflectionGauge value={68} />
          <div className="text-[10px] text-ink-muted text-center -mt-1">Cortex chat v3.2 · target 70%</div>
        </div>
        <div className="col-span-12 md:col-span-4 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Intent distribution · last 60m</div>
          <IntentDonut />
        </div>
        <div className="col-span-12 md:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Bot resolved vs human escalated · last 60m</div>
          <ConversationalSentimentLine />
          <div className="text-[10px] text-ink-muted mt-1">Source <span className="font-mono">gold.cc_chats</span></div>
        </div>
      </div>
    </div>
  );
}// ─────────────────────────────────────────────────────────────────────────────
// Conversational AI
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Bot, ThumbsUp, AlertCircle, ArrowRight, MessageSquare, User2, Headphones, Pause, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { HBar, Sparkline, BarChart, Donut, Funnel } from '@/components/shared/Charts';
import { useChatPlayback } from '@/components/shared/useChatPlayback';
import { TypingDots } from '@/components/shared/TypingDots';
import { useDemoState } from '@/state/DemoStateProvider';

interface ChatMsg { role: 'user' | 'agent' | 'system'; text: string; meta?: string; }

const SAMPLE_THREAD: ChatMsg[] = [
  { role: 'user',   text: 'My data has been awful in Manchester this morning, what is going on?', meta: 'intent=service_quality · sentiment=neg (−0.62) · lang=en-GB' },
  { role: 'system', text: 'Identity verified · CUST-001 (Amelia Hughes) · M14 · contract ends in 21 days · last bill £38' },
  { role: 'agent',  text: 'Hi Amelia — yes, we detected a network issue in Manchester M14 this morning at 09:31. Our engineers are on it. I can see you were affected. I have applied a £5 service credit on your next bill and can offer you a one-off 10 GB data boost for today — would that help?', meta: 'tool=billing.apply_credit(amount=5) · tool=plans.boost(gb=10, expiry=24h)' },
  { role: 'user',   text: 'Yes please. And what is the ETA?' },
  { role: 'agent',  text: 'Capacity rebalancing is already underway. Most cells should recover in the next 10–15 minutes. I will send a follow-up SMS when the area is fully restored. Anything else?', meta: 'tool=cortex.search.kb(noc_runbook) · tool=comms.schedule_followup' },
  { role: 'user',   text: 'No thanks.' },
  { role: 'agent',  text: 'Thank you, Amelia. Your data boost is active until 23:59 today and the £5 credit will appear on your next bill. Have a great day.', meta: 'satisfaction prediction: 0.86 · sentiment trajectory: neg → neu → pos' },
];

const intents = [
  { label: 'Service quality', share: 22 },
  { label: 'Bill query', share: 18 },
  { label: 'Roaming', share: 14 },
  { label: 'Plan upgrade', share: 11 },
  { label: 'Cancel / port', share: 8 },
  { label: 'Tech support', share: 16 },
  { label: 'Other', share: 11 },
];

export function DigitalConversational() {
  const ref = useRef<HTMLDivElement>(null);
  const [{ visibleCount, typingRole, typedText, playing, done }, ctrl] = useChatPlayback(SAMPLE_THREAD, { autoStart: true });

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount, typedText, typingRole]);

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Digital · Conversational AI</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Care chat — deflect, assist, escalate</h1>
          <p className="text-xs text-ink-muted">Cortex-powered chat with intent, sentiment, identity, NBA and live tool-use. Escalates to human only on policy + sentiment thresholds.</p>
          <div className="mt-2"><DigitalMlBadge pageKey="conversational" /></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> GDPR Art.22 · audit logged</span>
          <div className="inline-flex rounded-lg border border-mist-dark p-0.5 bg-mist text-[10px] font-bold">
            {([0.5, 1, 2] as const).map((s) => (
              <button key={s} onClick={() => ctrl.setSpeed(s)} className={cn('px-1.5 h-6 rounded-md', ctrl.speed === s ? 'bg-white text-ink shadow-sm' : 'text-ink-muted')}>{s}×</button>
            ))}
          </div>
          {playing
            ? <button onClick={ctrl.pause} className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]"><Pause className="w-3.5 h-3.5" /> Pause</button>
            : <button onClick={ctrl.start} className="vf-btn-primary !py-1.5 !px-2.5 !text-[11px]"><Play className="w-3.5 h-3.5" /> {done ? 'Replay' : 'Play'}</button>}
          <button onClick={ctrl.reset} className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiTile label="Conversations / day" value="42,180" tone="neutral" />
        <KpiTile label="Deflection rate" value="68%" delta="+9pp WoW" tone="good" />
        <KpiTile label="Avg resolution time" value="2:14" delta="−1m 8s" tone="good" />
        <KpiTile label="Escalation rate" value="11%" delta="−3pp" tone="good" />
        <KpiTile label="Avg sentiment lift" value="+0.41" delta="neg → neu/pos" tone="good" />
        <KpiTile label="CSAT (post-chat)" value="4.6 / 5" delta="+0.2" tone="good" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-3 flex flex-col" style={{ height: 540 }}>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-mist-dark">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-vfRed-soft text-vfRed-dark grid place-items-center"><MessageSquare className="w-4 h-4" /></div>
                <div>
                  <div className="font-bold text-sm text-ink">Live chat · CUST-001 (Amelia Hughes)</div>
                  <div className="text-[10px] text-ink-muted">Channel: app · session-id 9c2a4e</div>
                </div>
              </div>
              <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><ThumbsUp className="w-3 h-3" /> Sentiment recovering</span>
            </div>
            <div ref={ref} className="flex-1 overflow-y-auto space-y-2 pr-1">
              <AnimatePresence initial={false}>
                {SAMPLE_THREAD.slice(0, visibleCount).map((m, i) => <Bubble key={i} m={m} />)}
                {typingRole === 'agent' && (
                  <Bubble key={`typing-agent-${visibleCount}`} m={{ role: 'agent', text: typedText }} typing={!typedText} />
                )}
                {typingRole === 'user' && (
                  <Bubble key={`typing-user-${visibleCount}`} m={{ role: 'user', text: '' }} typing />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Top intents (last 24h)</div>
              <span className="text-[10px] text-ink-muted">42,180 chats</span>
            </div>
            <HBar
              data={intents.map((i) => ({ label: i.label, value: i.share }))}
              formatter={(v) => `${v}%`}
            />
          </div>
          <div className="vf-card p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Deflection rate · last 14 days</div>
              <span className="text-[11px] font-mono font-bold text-emerald-600">68% ↑</span>
            </div>
            <Sparkline data={[42, 45, 48, 52, 55, 54, 57, 60, 59, 62, 64, 65, 67, 68]} color="#10B981" />
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Escalation policy</div>
            <ul className="text-[11.5px] text-ink space-y-1">
              <li><b>Sentiment</b> ≤ −0.7 sustained 30s → human</li>
              <li><b>Vulnerability</b> markers → human (Ofcom GC C5)</li>
              <li><b>Complaint</b> intent → human within 60s</li>
              <li><b>Refund</b> &gt; £25 → human approval</li>
              <li><b>Repeat contact</b> ≥ 3 in 7d → human</li>
            </ul>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Tool calls (this thread)</div>
            <div className="space-y-0.5 font-mono text-[10.5px] text-ink-muted">
              <div><span className="text-emerald-700">→</span> cortex.complete(intent_classify)</div>
              <div><span className="text-emerald-700">→</span> identity.verify(channel=app, biometric=true)</div>
              <div><span className="text-emerald-700">→</span> cortex.search.kb(noc_runbook=MAN-M14)</div>
              <div><span className="text-emerald-700">→</span> billing.apply_credit(amount=5)</div>
              <div><span className="text-emerald-700">→</span> plans.boost(gb=10, expiry=24h)</div>
              <div><span className="text-emerald-700">→</span> comms.schedule_followup(sms, +20m)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BundlePropensityHint({ scenarioId }: { scenarioId: string }) {
  if (scenarioId !== 'dig-marketplace-bundle') return null;
  const buckets = [
    { x: 0.0, n: 280 }, { x: 0.1, n: 540 }, { x: 0.2, n: 880 }, { x: 0.3, n: 1340 }, { x: 0.4, n: 1880 },
    { x: 0.5, n: 2420 }, { x: 0.6, n: 4180 }, { x: 0.7, n: 4620 }, { x: 0.8, n: 5180 }, { x: 0.9, n: 2680 },
  ];
  const max = Math.max(...buckets.map((b) => b.n));
  const above = buckets.filter((b) => b.x >= 0.6).reduce((s, b) => s + b.n, 0);
  return (
    <div className="vf-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Bundle attach propensity · Disney+ · score distribution</div>
          <div className="text-xs text-ink-muted">24,000 family-plan customers scored · threshold 0.60</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Above threshold</div>
          <div className="text-xl font-extrabold text-ink font-mono">{above.toLocaleString()}</div>
        </div>
      </div>
      <div className="flex items-end gap-1 h-20">
        {buckets.map((b) => {
          const h = (b.n / max) * 100;
          const aboveT = b.x >= 0.6;
          return (
            <div key={b.x} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{ height: `${h}%`, background: aboveT ? '#11567F' : '#9CA3AF' }} title={`p=${b.x.toFixed(1)} · n=${b.n.toLocaleString()}`} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-ink-muted mt-1 font-mono">
        {buckets.filter((_, i) => i % 2 === 0).map((b) => <span key={b.x}>{b.x.toFixed(1)}</span>)}
      </div>
      <div className="text-[10px] text-ink-muted mt-1">Model: <span className="font-mono text-ink">next_best_bundle_v1.6</span> · feature store <span className="font-mono text-ink">gold.bundle_attach</span></div>
    </div>
  );
}

function Bubble({ m, typing = false }: { m: ChatMsg; typing?: boolean }) {
  const isUser = m.role === 'user';
  const isSystem = m.role === 'system';
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-2', isUser ? 'justify-end' : '')}>
      {!isUser && !isSystem && <div className="w-7 h-7 rounded-lg bg-ink text-white grid place-items-center shrink-0"><Bot className="w-3.5 h-3.5" /></div>}
      {isSystem && <div className="w-7 h-7 rounded-lg bg-amber/30 text-amber-900 grid place-items-center shrink-0"><AlertCircle className="w-3.5 h-3.5" /></div>}
      <div className={cn('rounded-xl px-3 py-2 text-[12.5px] leading-snug max-w-[78%]', isUser ? 'bg-vfRed text-white' : isSystem ? 'bg-amber/10 text-amber-900 border border-amber/30' : 'bg-mist text-ink')}>
        {typing && !m.text ? <TypingDots /> : (
          <>
            <div>{m.text}{typing && m.text && <span className="opacity-60 animate-pulse">▍</span>}</div>
            {m.meta && !typing && <div className={cn('text-[10px] mt-1 font-mono', isUser ? 'text-white/70' : 'text-ink-muted')}>{m.meta}</div>}
          </>
        )}
      </div>
      {isUser && <div className="w-7 h-7 rounded-lg bg-vfRed text-white grid place-items-center shrink-0"><User2 className="w-3.5 h-3.5" /></div>}
    </motion.div>
  );
}

function KpiTile({ label, value, delta, tone = 'neutral' }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</div>
      {delta && <div className={cn('text-[10px] mt-0.5', toneCls)}>{delta}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Voice Agent
// ─────────────────────────────────────────────────────────────────────────────
const VOICE_THREAD: { speaker: 'caller' | 'agent'; text: string; sentiment?: number; ts: string; intent?: string }[] = [
  { speaker: 'caller', text: 'Hi, I keep getting dropped calls and I want to leave. Your network is unreliable.', sentiment: -0.74, ts: '00:04', intent: 'cancel' },
  { speaker: 'agent', text: 'I am sorry to hear that, Hannah. I can see you are in Leeds LS5 — there is a known capacity event this morning that engineering is patching. Before we discuss cancellation, can I tell you what we found and what we are doing about it?', ts: '00:11' },
  { speaker: 'caller', text: 'Go on.', sentiment: -0.36, ts: '00:23' },
  { speaker: 'agent', text: 'Capacity rebalancing was applied at 09:18 and three sites have already recovered. I have applied a £5 service credit and offered a 10 GB data boost. We will SMS you when the area is fully restored. If you still want to cancel after that, I can wait — but most customers in similar situations stay.', ts: '00:31' },
  { speaker: 'caller', text: 'Hmm, OK, leave it for now.', sentiment: 0.12, ts: '00:54' },
  { speaker: 'agent', text: 'Thank you. Have a great day.', ts: '01:01' },
];

export function DigitalVoice() {
  const voiceThread = useMemo(
    () => VOICE_THREAD.map((m) => ({ role: (m.speaker === 'caller' ? 'caller' : 'agent') as 'caller' | 'agent', text: m.text })),
    [],
  );
  const [{ visibleCount, typingRole, typedText, playing, done }, ctrl] = useChatPlayback(voiceThread, { autoStart: true, agentThinkMs: 1200, agentMsPerChar: 18, userTypeMs: 1100 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }); }, [visibleCount, typedText, typingRole]);

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Digital · Voice Agent</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Voice — live transcript, sentiment & save</h1>
          <p className="text-xs text-ink-muted">Cortex Voice agent with real-time STT, intent & sentiment tracking, NBA, and human handoff. CCaaS: Genesys Cloud CX · STT: OpenAI Whisper-large-v3 · TTS: AWS Polly Neural · CRM: Salesforce Service Cloud.</p>
          <div className="mt-2"><DigitalMlBadge pageKey="voice" /></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-mist-dark p-0.5 bg-mist text-[10px] font-bold">
            {([0.5, 1, 2] as const).map((s) => (
              <button key={s} onClick={() => ctrl.setSpeed(s)} className={cn('px-1.5 h-6 rounded-md', ctrl.speed === s ? 'bg-white text-ink shadow-sm' : 'text-ink-muted')}>{s}×</button>
            ))}
          </div>
          {playing
            ? <button onClick={ctrl.pause} className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]"><Pause className="w-3.5 h-3.5" /> Pause</button>
            : <button onClick={ctrl.start} className="vf-btn-primary !py-1.5 !px-2.5 !text-[11px]"><Play className="w-3.5 h-3.5" /> {done ? 'Replay' : 'Play'}</button>}
          <button onClick={ctrl.reset} className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiTile label="Voice volume / day" value="14.6k" />
        <KpiTile label="AI handled (full)" value="42%" delta="+12pp" tone="good" />
        <KpiTile label="Save rate (cancel)" value="71%" delta="+18pp" tone="good" />
        <KpiTile label="AHT" value="4:18" delta="−42s" tone="good" />
        <KpiTile label="WER (UK English)" value="3.4%" delta="Whisper-l-v3" tone="good" />
        <KpiTile label="QA pass rate" value="98%" delta="+2pp" tone="good" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-4">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Inbound calls by hour (today)</div>
            <BarChart
              data={['00','03','06','09','12','15','18','21'].map((h, i) => ({ label: h, value: [120, 80, 240, 920, 1240, 1380, 1620, 980][i] }))}
              color="#29B5E8"
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">AI-handled rate · 30 days</div>
            <Sparkline data={[28, 30, 31, 33, 32, 34, 35, 36, 36, 37, 38, 38, 39, 40, 40, 41, 41, 41, 41, 42, 41, 42, 42, 42, 42, 42, 42, 42, 42, 42]} color="#11567F" />
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <Stat label="Now" value="42%" />
              <Stat label="vs last mo" value="+12pp" />
              <Stat label="Target Q4" value="55%" />
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Save-the-cancel rate</div>
            <Sparkline data={[52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 71, 71, 71]} color="#10B981" />
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <Stat label="Now" value="71%" />
              <Stat label="Baseline" value="53%" />
              <Stat label="Lift" value="+18pp" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <div className="vf-card p-3" style={{ height: 460 }}>
            <div className="flex items-center justify-between pb-2 border-b border-mist-dark mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-vfRed-soft text-vfRed-dark grid place-items-center"><Phone className="w-4 h-4" /></div>
                <div>
                  <div className="font-bold text-sm text-ink">Live call · CUST-003 (Hannah Bennett) · save-the-cancel</div>
                  <div className="text-[10px] text-ink-muted">DDI: 0808-100-9999 · queue: SAVE-MNP · agent: cortex-voice-v1</div>
                </div>
              </div>
              <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]">CALL ACTIVE · 01:01</span>
            </div>
            <div ref={ref} className="overflow-y-auto h-[360px] space-y-2 pr-1">
              {VOICE_THREAD.slice(0, visibleCount).map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-lg px-3 py-2 text-[12.5px]', m.speaker === 'caller' ? 'bg-mist' : 'bg-vfRed-soft/40 border border-vfRed/20')}>
                  <div className="flex items-center justify-between text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">
                    <span>{m.speaker === 'caller' ? '— Caller' : '— Agent'}</span>
                    <span className="font-mono">{m.ts}</span>
                  </div>
                  <div className="text-ink leading-snug">{m.text}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-muted">
                    {m.intent && <span className="vf-chip bg-mist text-ink text-[9px]">intent: {m.intent}</span>}
                    {typeof m.sentiment === 'number' && <span className={cn('vf-chip text-[9px]', m.sentiment > 0 ? 'bg-emerald-100 text-emerald-700' : m.sentiment < -0.5 ? 'bg-vfRed text-white' : 'bg-amber/20 text-amber-800')}>sent: {m.sentiment.toFixed(2)}</span>}
                  </div>
                </motion.div>
              ))}
              {typingRole === 'agent' && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg px-3 py-2 text-[12.5px] bg-vfRed-soft/40 border border-vfRed/20">
                  <div className="flex items-center justify-between text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">
                    <span>— Agent</span>
                    <span className="font-mono">live</span>
                  </div>
                  {typedText ? <div className="text-ink leading-snug">{typedText}<span className="opacity-60 animate-pulse">▍</span></div> : <TypingDots className="text-vfRed" />}
                </motion.div>
              )}
              {typingRole === 'caller' && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg px-3 py-2 text-[12.5px] bg-mist">
                  <div className="text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">— Caller</div>
                  <TypingDots className="text-ink-muted" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Sentiment timeline</div>
            <div className="h-16 flex items-end gap-1">
              {[-0.78, -0.40, 0.10, 0.32].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className={cn('w-full rounded-t', s > 0 ? 'bg-emerald-500' : s < -0.5 ? 'bg-vfRed' : 'bg-amber')} style={{ height: `${Math.abs(s) * 60}px` }} />
                  <span className="text-[9px] font-mono mt-0.5 text-ink-muted">{s.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">NBA shown to caller</div>
            <ol className="text-[12px] text-ink space-y-1 list-decimal list-inside">
              <li>£5 service credit (auto)</li>
              <li>10 GB data boost (24h)</li>
              <li>Follow-up SMS on restoration</li>
              <li>Plan refresh option (waiting if requested)</li>
            </ol>
          </div>
          <div className="vf-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Compliance & QA</div>
            <ul className="text-[11.5px] text-ink space-y-1">
              <li><b>Recording</b> — opt-in confirmed</li>
              <li><b>STIR/SHAKEN</b> attestation: A</li>
              <li><b>QA scorecard</b> — empathy ✓ · resolution ✓ · regulator phrasing ✓</li>
              <li><b>Vulnerability</b> markers — none detected</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-4 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">AHT distribution · today</div>
          <VoiceAhtHistogram />
        </div>
        <div className="col-span-12 md:col-span-4 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Save funnel · SAVE-MNP</div>
          <VoiceSaveFunnel />
        </div>
        <div className="col-span-12 md:col-span-4 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">WER & sentiment recovery · 24h</div>
          <VoiceWerTrend />
          <div className="text-[10px] text-ink-muted mt-1">Whisper-large-v3 · <span className="font-mono">gold.ivr_calls</span></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// In-App Journeys
// ─────────────────────────────────────────────────────────────────────────────
const journeyCatalog = [
  { id: 'esim-act', name: 'eSIM activation', steps: 4, completion: 87, eligible: '4.2M', avg: '2:48' },
  { id: 'roam-pass', name: 'Roaming Pass enrol', steps: 3, completion: 92, eligible: '1.8M', avg: '0:48' },
  { id: 'plan-up', name: 'Plan upgrade (5G SA)', steps: 5, completion: 64, eligible: '320k', avg: '4:02' },
  { id: 'data-boost', name: 'Data boost (one-off)', steps: 2, completion: 96, eligible: '12.4M', avg: '0:18' },
  { id: 'add-line', name: 'Add a line / family', steps: 6, completion: 41, eligible: '870k', avg: '6:18' },
  { id: 'device-up', name: 'Device upgrade', steps: 7, completion: 48, eligible: '2.1M', avg: '8:32' },
  { id: 'biometric', name: 'Biometric set-up (passkey)', steps: 3, completion: 78, eligible: '8.0M', avg: '1:08' },
  { id: 'pac-req', name: 'PAC request (Ofcom)', steps: 2, completion: 99, eligible: 'all', avg: '0:24' },
];

export function DigitalJourneys() {
  const { selectedIncidentId } = useDemoState();
  // Map active Digital scenario → which journey card to highlight.
  const ACTIVE_JOURNEY_BY_SCENARIO: Record<string, string> = {
    'dig-esim-activation-funnel':  'esim-act',
    'dig-roaming-push':            'roam-pass',
    'dig-web-checkout-abandon':    'pac-req',
    'dig-fcr-prediction':          'biometric',
  };
  const activeJourneyId = ACTIVE_JOURNEY_BY_SCENARIO[selectedIncidentId];

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Digital · In-App Journeys</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">App journeys — eSIM, Roaming, upgrades</h1>
          <p className="text-xs text-ink-muted">Catalog of personalised in-app journeys, agent-prompted from CIC and surfaced to the right customer at the right moment.</p>
        </div>
        <DigitalMlBadge pageKey="journeys" />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiTile label="Active journeys" value="8" />
        <KpiTile label="Daily completions" value="124k" delta="+11%" tone="good" />
        <KpiTile label="Avg completion" value="74%" delta="+5pp" tone="good" />
        <KpiTile label="Eligibility hit-rate" value="91%" delta="TAC + plan" tone="good" />
        <KpiTile label="Drop-off recovery" value="34%" delta="agent-prompted" tone="good" />
        <KpiTile label="ARPU lift" value="+£2.10" delta="trailing 90d" tone="good" />
      </div>

      <PropensityHint scenarioId={selectedIncidentId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Top journey · eSIM activation funnel</div>
            <span className="text-[10px] text-ink-muted">last 24h</span>
          </div>
          <Funnel
            stages={[
              { label: '1. Eligibility check', value: 18420, tone: 'good' },
              { label: '2. QR / activation code', value: 16890, tone: 'good' },
              { label: '3. Profile install', value: 16210, tone: 'good' },
              { label: '4. Activation & test call', value: 16038, tone: 'good' },
            ]}
          />
          <div className="text-[10px] text-ink-muted mt-2">Stage drop-off: 8% / 4% / 1% — overall completion 87%.</div>
        </div>
        <div className="vf-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Completion rate by journey</div>
            <span className="text-[10px] text-ink-muted">% finishing</span>
          </div>
          <HBar
            data={journeyCatalog.map((j) => ({ label: j.name, value: j.completion, sub: `${j.eligible} eligible · avg ${j.avg}` }))}
            formatter={(v) => `${v}%`}
            color="#11567F"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {journeyCatalog.map((j) => {
          const isActive = j.id === activeJourneyId;
          return (
            <div key={j.id} className={`vf-card p-3 ${isActive ? 'ring-2 ring-vfRed shadow-md' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-sm text-ink truncate">{j.name}</div>
                {isActive && <span className="vf-chip bg-vfRed text-white text-[9px]">ACTIVE</span>}
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <Stat label="Steps" value={String(j.steps)} />
                <Stat label="Done %" value={`${j.completion}%`} />
                <Stat label="Avg" value={j.avg} />
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-mist overflow-hidden">
                <div className={`h-full ${isActive ? 'bg-vfRed' : 'bg-vfRed/60'}`} style={{ width: `${j.completion}%` }} />
              </div>
              <div className="text-[10px] text-ink-muted mt-1.5">Eligible: {j.eligible}</div>
            </div>
          );
        })}
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Personalisation rules</div>
        <ul className="text-[12px] text-ink grid grid-cols-1 md:grid-cols-2 gap-1">
          <li>• Show eSIM activation only to TAC ∈ eSIM-capable list</li>
          <li>• Surface Roaming Pass 2 days before historical travel pattern</li>
          <li>• Plan upgrade ranking by predicted CLV uplift (Snowpark ML)</li>
          <li>• Drop-off recovery: agent voice/SMS within 24h if Step ≥ 3 abandoned</li>
          <li>• Skip if open complaint or offer-fatigue (12d)</li>
          <li>• A/B test journeys via Cortex Search ranked variants</li>
        </ul>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Cohort drop-off heat-map · journey × stage</div>
          <JourneyDropoffHeatmap />
          <div className="text-[10px] text-ink-muted mt-1">Source <span className="font-mono">gold.web_telemetry</span> · darker = higher drop-off</div>
        </div>
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Drop-off recovery · 14d</div>
          <JourneyRecoveryLine />
          <div className="text-[10px] text-ink-muted mt-1">Recovery via Salesforce MC + Genesys callback (Snowpark ML)</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-mist/60 px-1.5 py-1">
      <div className="text-[9px] uppercase text-ink-muted font-bold tracking-wider whitespace-nowrap">{label}</div>
      <div className="font-mono tabular-nums text-sm font-extrabold text-ink leading-none">{value}</div>
    </div>
  );
}

// Inline propensity-distribution hint — shown above the journey grid when the
// active scenario has a propensity model behind it. Inline-SVG so it stays
// print-safe and doesn't pull EChart into pages it doesn't already use.
function PropensityHint({ scenarioId }: { scenarioId: string }) {
  const cfg = PROPENSITY_BY_SCENARIO[scenarioId];
  if (!cfg) return null;
  const max = Math.max(...cfg.buckets.map((b) => b.n));
  const aboveThreshold = cfg.buckets.filter((b) => b.x >= cfg.threshold).reduce((s, b) => s + b.n, 0);
  return (
    <div className="vf-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{cfg.title}</div>
          <div className="text-xs text-ink-muted">{cfg.subtitle} · threshold {cfg.threshold.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Above threshold</div>
          <div className="text-xl font-extrabold text-ink font-mono">{aboveThreshold.toLocaleString()}</div>
        </div>
      </div>
      <div className="flex items-end gap-1 h-20">
        {cfg.buckets.map((b) => {
          const h = (b.n / max) * 100;
          const above = b.x >= cfg.threshold;
          return (
            <div key={b.x} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{ height: `${h}%`, background: above ? '#11567F' : '#9CA3AF' }} title={`p=${b.x.toFixed(1)} · n=${b.n.toLocaleString()}`} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-ink-muted mt-1 font-mono">
        {cfg.buckets.filter((_, i) => i % 2 === 0).map((b) => <span key={b.x}>{b.x.toFixed(1)}</span>)}
      </div>
      <div className="text-[10px] text-ink-muted mt-1">Model: <span className="font-mono text-ink">{cfg.model}</span> · feature store <span className="font-mono text-ink">{cfg.featureStore}</span></div>
    </div>
  );
}

const PROPENSITY_BY_SCENARIO: Record<string, { title: string; subtitle: string; threshold: number; model: string; featureStore: string; buckets: { x: number; n: number }[] }> = {
  'dig-esim-activation-funnel': {
    title: 'eSIM activation propensity · score distribution',
    subtitle: '4.2M eligible base scored',
    threshold: 0.6,
    model: 'esim_activation_v2.1',
    featureStore: 'gold.esim_activations',
    buckets: [
      { x: 0.0, n: 280 }, { x: 0.1, n: 460 }, { x: 0.2, n: 720 }, { x: 0.3, n: 1080 }, { x: 0.4, n: 1640 },
      { x: 0.5, n: 2280 }, { x: 0.6, n: 2640 }, { x: 0.7, n: 2120 }, { x: 0.8, n: 1280 }, { x: 0.9, n: 540 },
    ],
  },
  'dig-roaming-push': {
    title: 'Travel-pattern propensity · score distribution',
    subtitle: '1.8M base scored on booking + location signals',
    threshold: 0.6,
    model: 'travel_pattern_v1.4',
    featureStore: 'gold.web_telemetry',
    buckets: [
      { x: 0.0, n: 380 }, { x: 0.1, n: 520 }, { x: 0.2, n: 760 }, { x: 0.3, n: 980 }, { x: 0.4, n: 1240 },
      { x: 0.5, n: 1480 }, { x: 0.6, n: 2400 }, { x: 0.7, n: 1180 }, { x: 0.8, n: 480 }, { x: 0.9, n: 140 },
    ],
  },
  'dig-web-checkout-abandon': {
    title: 'Cart-recovery propensity · score distribution',
    subtitle: '1,820 abandoned carts scored',
    threshold: 0.5,
    model: 'cart_recovery_v3.0',
    featureStore: 'gold.web_telemetry',
    buckets: [
      { x: 0.0, n: 60 }, { x: 0.1, n: 120 }, { x: 0.2, n: 220 }, { x: 0.3, n: 280 }, { x: 0.4, n: 320 },
      { x: 0.5, n: 360 }, { x: 0.6, n: 240 }, { x: 0.7, n: 140 }, { x: 0.8, n: 60 }, { x: 0.9, n: 20 },
    ],
  },
  'dig-fcr-prediction': {
    title: 'First-call-resolution likelihood · score distribution',
    subtitle: '6,200 inbound chats scored',
    threshold: 0.7,
    model: 'fcr_likelihood_v2.0',
    featureStore: 'gold.cc_chats',
    buckets: [
      { x: 0.0, n: 60 }, { x: 0.1, n: 140 }, { x: 0.2, n: 240 }, { x: 0.3, n: 360 }, { x: 0.4, n: 480 },
      { x: 0.5, n: 720 }, { x: 0.6, n: 920 }, { x: 0.7, n: 1320 }, { x: 0.8, n: 1180 }, { x: 0.9, n: 780 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace (partner bundles)
// ─────────────────────────────────────────────────────────────────────────────
const partners = [
  { id: 'disney', name: 'Disney+', tier: 'Premium add-on', price: '£8.99/mo', subscribers: '1.42M', renewal: '92%', revenue: '£12.7M/mo', logo: '🎬' },
  { id: 'netflix', name: 'Netflix', tier: 'Premium add-on', price: '£10.99/mo', subscribers: '0.98M', renewal: '88%', revenue: '£10.8M/mo', logo: '🎥' },
  { id: 'spotify', name: 'Spotify Premium', tier: 'Music add-on', price: '£9.99/mo', subscribers: '2.10M', renewal: '94%', revenue: '£21.0M/mo', logo: '🎵' },
  { id: 'youtube', name: 'YouTube Premium', tier: 'Music+Video', price: '£11.99/mo', subscribers: '0.42M', renewal: '85%', revenue: '£5.0M/mo', logo: '▶️' },
  { id: 'apple-tv', name: 'Apple TV+', tier: 'Premium add-on', price: '£6.99/mo', subscribers: '0.31M', renewal: '79%', revenue: '£2.2M/mo', logo: '🍎' },
  { id: 'norton', name: 'Norton Mobile Security', tier: 'Security add-on', price: '£3.99/mo', subscribers: '0.62M', renewal: '90%', revenue: '£2.5M/mo', logo: '🛡️' },
];

export function DigitalMarketplace() {
  const { selectedIncidentId } = useDemoState();
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Digital · Marketplace</div>
          <h1 className="text-2xl font-extrabold text-ink leading-tight">Marketplace & partner bundles</h1>
          <p className="text-xs text-ink-muted">Third-party content & security bundles surfaced to eligible customers, fulfilled through the entitlement service.</p>
        </div>
        <DigitalMlBadge pageKey="marketplace" />
      </header>

      <BundlePropensityHint scenarioId={selectedIncidentId} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiTile label="Active partners" value="6" />
        <KpiTile label="Bundled subs" value="5.85M" delta="+0.3M MoM" tone="good" />
        <KpiTile label="Bundle attach rate" value="42%" delta="+4pp" tone="good" />
        <KpiTile label="Wholesale margin" value="38%" delta="post-rev-share" tone="neutral" />
        <KpiTile label="Monthly revenue" value="£54.2M" delta="+£3.1M MoM" tone="good" />
        <KpiTile label="Churn (vs unbundled)" value="−6.4pp" delta="bundle effect" tone="good" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Monthly revenue by partner</div>
          <HBar
            data={partners.map((p) => ({ label: `${p.logo} ${p.name}`, value: parseFloat(p.revenue.replace(/[£M\/mo ]/g, '')) }))}
            formatter={(v) => `£${v.toFixed(1)}M`}
            color="#11567F"
          />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Bundle attach rate · last 12 weeks</div>
          <Sparkline data={[34, 35, 35, 36, 37, 37, 38, 39, 40, 41, 41, 42]} color="#10B981" />
          <div className="mt-2 text-[11px] text-ink-muted">Attach lift driven by next-best-bundle (Snowpark ML) ranking and CIC voice prompts. 5% holdout shows +6.4pp churn reduction in bundled cohort.</div>
        </div>
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left">
              <th className="py-1.5 px-2">Partner</th>
              <th className="py-1.5 px-2">Tier</th>
              <th className="py-1.5 px-2">Price</th>
              <th className="py-1.5 px-2 text-right">Subscribers</th>
              <th className="py-1.5 px-2 text-right">Renewal</th>
              <th className="py-1.5 px-2 text-right">Revenue / mo</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-bold text-ink">{p.logo} {p.name}</td>
                <td className="py-1.5 px-2 text-ink-muted">{p.tier}</td>
                <td className="py-1.5 px-2 font-mono">{p.price}</td>
                <td className="py-1.5 px-2 text-right font-mono">{p.subscribers}</td>
                <td className="py-1.5 px-2 text-right font-mono">{p.renewal}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold">{p.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Entitlement provisioning</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Partner API: SnowTelco-side adapter via Snowpark Container Services (SPCS)</li>
            <li>• Provisioning latency: P95 1.4s</li>
            <li>• Refund path: dispute → automatic clawback within 48h via Amdocs CES</li>
            <li>• Billing: bundled into next monthly invoice (line-item, Amdocs CES)</li>
            <li>• Cancel-anywhere: in-app, voice (Genesys) or chat (Salesforce)</li>
          </ul>
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Eligibility & next-best-bundle</div>
          <ul className="text-[12px] text-ink space-y-1">
            <li>• Plan-tier gate: Unlimited Max → all bundles eligible</li>
            <li>• Household composition: family plan → Disney+ first</li>
            <li>• Music affinity (Snowpark ML): Spotify recommendation</li>
            <li>• Predicted CLV uplift &gt; offer cost (margin floor)</li>
            <li>• Consent + frequency cap honoured</li>
            <li>• A/B test groups: 5% holdout for bundle-effect measurement</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-8 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Bundle attach trend · 12 weeks</div>
          <BundleAttachTrend />
          <div className="text-[10px] text-ink-muted mt-1">Source <span className="font-mono">gold.bundle_attach</span> · ranking model <span className="font-mono">next_best_bundle_v1.6</span></div>
        </div>
        <div className="col-span-12 lg:col-span-4 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Partner revenue share</div>
          <PartnerContributionDonut />
        </div>
        <div className="col-span-12 vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Cumulative ARPU lift · 90d</div>
          <CumulativeArpuLine />
          <div className="text-[10px] text-ink-muted mt-1">Forecast model <span className="font-mono">arpu_lift_forecast_v1</span></div>
        </div>
      </div>
    </div>
  );
}
