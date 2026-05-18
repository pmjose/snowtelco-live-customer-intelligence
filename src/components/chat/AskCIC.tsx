import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { findAnswer, scenarioAnswers, scenarioPrompts, type ChatChart } from '@/data/cicChat';
import { scenarioById as sectionScenarioById } from '@/data/sectionScenarios';
import { BarChart, Donut, Funnel, HBar } from '@/components/shared/Charts';

interface Message { role: 'user' | 'assistant'; text: string; citations?: string[]; streaming?: boolean; thinking?: boolean; chart?: ChatChart }

// Total target answer time: ~8 seconds.
// Phase 1: ~3.5s "thinking" with tool-call ticks shown to user.
// Phase 2: ~4.5s streaming the final answer token by token.
const THINK_MS = 3500;
const STREAM_MS = 4500;

// Section-scenario IDs for the four CIC scenarios alias back to the legacy
// short keys used in scenarioPrompts/scenarioAnswers.
const CIC_ALIAS: Record<string, string> = {
  'cic-manchester-churn': 'manchester',
  'cic-birmingham-billshock': 'birmingham-bill',
  'cic-leeds-snowflex': 'leeds-snowflex',
  'cic-london-5g-upgrade': 'london-5g',
};

export function AskCIC() {
  const { chatOpen, setChatOpen, scenario, selectedIncidentId } = useDemoState();

  // Resolve the active scenario from the section runner first; fall back to
  // the legacy CIC scenario state for back-compat.
  const sec = sectionScenarioById(selectedIncidentId);
  const rawId = sec?.id ?? scenario.id;
  const activeId = CIC_ALIAS[rawId] ?? rawId;
  const activeShort = sec ? sec.title.split(' · ')[0] : scenario.short;
  const activeLabel = sec ? sec.title : scenario.label;

  // Greeting copy that mentions the active scenario so the user knows the bot
  // has context.
  const greet = useMemo<Message>(() => ({
    role: 'assistant',
    text: `Hi — I'm Cortex AI, your Customer Intelligence assistant. I'm grounded on the active scenario: ${activeLabel}. Ask me about the cohort, drivers, NBAs, or projected outcomes.`,
    citations: [],
  }), [activeId, activeLabel]);

  const [messages, setMessages] = useState<Message[]>([greet]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<boolean>(false);

  // Reset transcript when the active scenario changes — never carry the wrong
  // narrative across scenarios.
  useEffect(() => {
    setMessages([greet]);
    setInput('');
    cancelRef.current = true;
    setBusy(false);
  }, [activeId, greet]);

  const resetChat = () => {
    cancelRef.current = true;
    setMessages([greet]);
    setInput('');
    setBusy(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chatOpen]);

  const ask = async (q: string) => {
    if (!q.trim() || busy) return;
    cancelRef.current = false;
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');

    // Resolve the answer scoped to the active scenario.
    const ans = findAnswer(q, activeId) ?? scenarioAnswers[activeId]?.[0] ?? scenarioAnswers.manchester[0];

    // Phase 1: thinking — show tool-call ticks so it looks real and gives the
    // model ~2.5s of "reasoning" before the answer streams.
    const toolSteps = [
      `Resolving question against ${activeLabel} context\u2026`,
      `Querying Snowflake gold layer (${ans.citations[0] ?? 'gold.churn_features'})\u2026`,
      `Running Cortex Analyst over scenario semantic model\u2026`,
      `Reasoning over Cortex Search runbook KB\u2026`,
      `Composing answer\u2026`,
    ];
    setMessages((m) => [...m, { role: 'assistant', text: toolSteps[0], thinking: true, citations: [] }]);
    const stepInterval = THINK_MS / toolSteps.length;
    for (let i = 1; i < toolSteps.length; i++) {
      await new Promise((r) => setTimeout(r, stepInterval));
      if (cancelRef.current) { setBusy(false); return; }
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: toolSteps[i] };
        return copy;
      });
    }
    await new Promise((r) => setTimeout(r, stepInterval));
    if (cancelRef.current) { setBusy(false); return; }

    // Phase 2: stream the actual answer token-by-token over ~STREAM_MS so the
    // user can read along.
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: 'assistant', text: '', citations: ans.citations, streaming: true, chart: ans.chart };
      return copy;
    });
    const tokens = ans.answer.split(' ');
    const tokenDelay = Math.max(8, Math.floor(STREAM_MS / Math.max(1, tokens.length)));
    let acc = '';
    for (const t of tokens) {
      if (cancelRef.current) { setBusy(false); return; }
      acc += (acc ? ' ' : '') + t;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: acc, streaming: true };
        return copy;
      });
      await new Promise((r) => setTimeout(r, tokenDelay));
    }
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { ...copy[copy.length - 1], streaming: false };
      return copy;
    });
    setBusy(false);
  };

  const prompts = scenarioPrompts[activeId] ?? scenarioPrompts.manchester;

  return (
    <AnimatePresence>
      {chatOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white dark:bg-[#131a26] z-50 shadow-elev border-l border-mist-dark flex flex-col no-print"
        >
          <div className="px-4 py-3 border-b border-mist-dark flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vfRed text-white grid place-items-center"><MessageSquare className="w-4 h-4" /></div>
            <div className="flex-1">
              <div className="font-bold text-ink">Ask Cortex AI</div>
              <div className="text-[11px] text-ink-muted truncate">Powered by Snowflake Cortex AI · grounded on <span className="font-semibold text-ink">{activeShort}</span></div>
            </div>
            <button onClick={resetChat} title="Reset conversation" className="text-ink-muted hover:text-vfRed p-1.5 rounded hover:bg-mist transition"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={() => setChatOpen(false)} className="text-ink-muted hover:text-ink p-1.5 rounded hover:bg-mist transition"><X className="w-4 h-4" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-ink text-white' : m.thinking ? 'bg-mist text-ink-muted italic' : 'bg-mist text-ink'}`}>
                  {m.thinking && <span className="inline-block w-1.5 h-1.5 rounded-full bg-vfRed mr-2 align-middle animate-pulse" />}
                  {m.text}
                  {m.streaming && <span className="inline-block w-1 h-4 bg-vfRed ml-1 align-middle animate-pulse" />}
                  {m.role === 'assistant' && m.chart && !m.streaming && !m.thinking && (
                    <div className="mt-3 -mx-1 rounded-lg bg-white border border-mist-dark p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1.5">{m.chart.title}</div>
                      <ChatChartRender chart={m.chart} />
                    </div>
                  )}
                  {m.role === 'assistant' && m.citations && m.citations.length > 0 && !m.streaming && !m.thinking && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.citations.map((c) => (
                        <span key={c} className="vf-chip bg-white border border-mist-dark text-ink-muted text-[10px]">
                          <Sparkles className="w-3 h-3 text-vfRed" /> {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-mist-dark space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Suggested for {activeShort}</div>
            <div className="flex flex-wrap gap-1">
              {prompts.slice(0, 5).map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  disabled={busy}
                  className="vf-chip bg-mist hover:bg-vfRed-soft hover:text-vfRed-dark transition text-ink-muted disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') ask(input); }}
                placeholder={`Ask about ${activeShort}\u2026`}
                disabled={busy}
                className="flex-1 rounded-lg border border-mist-dark px-3 py-2 text-sm bg-white disabled:opacity-50"
              />
              <button onClick={() => ask(input)} disabled={busy} className="px-3 rounded-lg bg-vfRed text-white hover:bg-vfRed-dark disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// Render the chart payload attached to an assistant message.
function ChatChartRender({ chart }: { chart: ChatChart }) {
  const fmt = (v: number) => {
    const u = (chart as any).unit ?? '';
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M${u ? ' ' + u : ''}`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k${u ? ' ' + u : ''}`;
    return u ? `${v} ${u}` : `${v}`;
  };
  if (chart.kind === 'hbar') return <HBar data={chart.data} formatter={fmt} color="#E11D48" />;
  if (chart.kind === 'bar')  return <BarChart data={chart.data} height={140} color="#29B5E8" formatter={fmt} />;
  if (chart.kind === 'donut') return <div className="flex justify-center"><Donut data={chart.data} size={150} formatter={fmt} /></div>;
  if (chart.kind === 'funnel') return <Funnel stages={chart.stages} formatter={fmt} />;
  return null;
}
