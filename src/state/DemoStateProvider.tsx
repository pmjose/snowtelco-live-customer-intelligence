import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { stageOrder, type Stage, stageReached } from './stages';
import { customers } from '@/data/customers';
import { churnByCustomer } from '@/data/churn';
import { scenarioById, type ScenarioId } from '@/data/scenarios';
import { sounds } from '@/lib/sounds';
import { type SeqEvent } from '@/data/nocSequence';
import { cicForIncident } from '@/data/incidentToCic';
import { scriptForScenario, scenarioById as sectionScenarioById } from '@/data/sectionScenarios';

export type Theme = 'light' | 'dark-ops';
export type Mode = 'cic' | 'digital' | 'bss' | 'oss' | 'noc';
export type PlaySpeed = 0.25 | 0.5 | 1 | 2 | 4;

export interface FiredEvent extends SeqEvent {
  fid: number;        // unique
  incidentId: string;
  realTime: string;   // mm:ss display
}

interface DemoCtx {
  stage: Stage;
  isPlaying: boolean;
  selectedCustomerId: string;
  setStage: (s: Stage) => void;
  advance: () => void;
  reset: () => void;
  togglePlay: () => void;
  selectCustomer: (id: string) => void;
  effectiveChurn: (customerId: string) => number;
  isIncidentActive: boolean;
  isResolved: boolean;
  // settings
  theme: Theme;
  setTheme: (t: Theme) => void;
  soundOn: boolean;
  setSoundOn: (b: boolean) => void;
  narratorOn: boolean;
  setNarratorOn: (b: boolean) => void;
  // mode (CIC vs NOC)
  mode: Mode;
  setMode: (m: Mode) => void;
  autoApprove: boolean;
  setAutoApprove: (b: boolean) => void;
  selectedIncidentId: string;
  selectIncident: (id: string) => void;
  ranActionIds: string[];
  runAction: (id: string) => void;
  resetActions: () => void;
  // NOC sequencer
  nocPlaying: boolean;
  toggleNocPlay: () => void;
  startNocPlay: () => void;
  resetNoc: () => void;
  stepBeat: (direction: 'forward' | 'back') => void;
  tElapsedMs: number;
  playSpeed: PlaySpeed;
  setPlaySpeed: (s: PlaySpeed) => void;
  firedEvents: FiredEvent[];        // newest first
  currentStage: 'idle' | 'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved';
  bigScreen: boolean;
  toggleBigScreen: () => void;
  // scenario
  scenarioId: ScenarioId;
  setScenarioId: (id: ScenarioId) => void;
  scenario: ReturnType<typeof scenarioById>;
  // compare
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  // chat
  chatOpen: boolean;
  setChatOpen: (b: boolean) => void;
  toggleChat: () => void;
  // self-healing
  resolutionProgress: number;
  startSelfHealing: () => void;
  // scenario-driven focus
  focusEnabled: boolean;
  setFocusEnabled: (b: boolean) => void;
  // narrated demo mode
  narratedMode: boolean;
  setNarratedMode: (b: boolean) => void;
}

const DemoStateContext = createContext<DemoCtx | null>(null);
const STAGE_INTERVAL_MS = 4200;
// Global pace multiplier: 1× on the transport bar plays at this fraction of
// real-time so the presenter has room to talk over each beat. Lower = slower.
const BASE_PACE = 0.45;

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } }

const fmtTime = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [stage, setStageRaw] = useState<Stage>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-001');
  const [theme, setThemeRaw] = useState<Theme>(() => load('snowtelco.theme', 'light'));
  const [soundOn, setSoundOnRaw] = useState<boolean>(() => load('snowtelco.sound', true));
  const [narratorOn, setNarratorOnRaw] = useState<boolean>(() => load('snowtelco.narrator', true));
  const [focusEnabled, setFocusEnabledRaw] = useState<boolean>(() => load('snowtelco.focus', true));
  const [scenarioId, setScenarioIdRaw] = useState<ScenarioId>(() => load('snowtelco.scenario', 'manchester' as ScenarioId));
  const [mode, setModeRaw] = useState<Mode>(() => load('snowtelco.mode', 'cic'));
  const [autoApprove, setAutoApproveRaw] = useState<boolean>(() => load('snowtelco.autoApprove', false));
  // Seed `selectedIncidentId` from the persisted CIC scenario so the dropdown
  // and downstream panels survive page navigations / reloads. Falls back to the
  // legacy Manchester NOC incident only if nothing else is persisted.
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    const persisted = load<string>('snowtelco.incident', '');
    if (persisted) return persisted;
    const sc = load<ScenarioId>('snowtelco.scenario', 'manchester');
    const cicMap: Record<string, string> = {
      manchester: 'cic-manchester-churn',
      'birmingham-bill': 'cic-birmingham-billshock',
      'leeds-snowflex': 'cic-leeds-snowflex',
      'london-5g': 'cic-london-5g-upgrade',
    };
    return cicMap[sc] ?? 'cic-manchester-churn';
  });
  const [ranActionIds, setRanActionIds] = useState<string[]>([]);
  const [nocPlaying, setNocPlaying] = useState<boolean>(false);
  const [tElapsedMs, setTElapsedMs] = useState<number>(0);
  const [playSpeed, setPlaySpeedRaw] = useState<PlaySpeed>(() => load('snowtelco.speed', 1));
  const [firedEvents, setFiredEvents] = useState<FiredEvent[]>([]);
  const [bigScreen, setBigScreen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [resolutionProgress, setResolutionProgress] = useState(0);
  const [narratedMode, setNarratedModeRaw] = useState<boolean>(() => load('snowtelco.narratedMode', false));
  const lastToastedStage = useRef<Stage | null>(null);
  const healingRaf = useRef<number>(0);
  const healingStart = useRef<number>(0);
  const playStart = useRef<number>(0);
  const tickRaf = useRef<number>(0);
  const firedIdx = useRef<number>(0);
  const fidRef = useRef<number>(0);

  const scenario = useMemo(() => scenarioById(scenarioId), [scenarioId]);

  const setStage = useCallback((s: Stage) => setStageRaw(s), []);
  const setTheme = useCallback((t: Theme) => { setThemeRaw(t); save('snowtelco.theme', t); }, []);
  const setSoundOn = useCallback((b: boolean) => { setSoundOnRaw(b); save('snowtelco.sound', b); }, []);
  const setNarratorOn = useCallback((b: boolean) => { setNarratorOnRaw(b); save('snowtelco.narrator', b); }, []);
  const setFocusEnabled = useCallback((b: boolean) => { setFocusEnabledRaw(b); save('snowtelco.focus', b); }, []);
  const setMode = useCallback((m: Mode) => { setModeRaw(m); save('snowtelco.mode', m); }, []);
  const setAutoApprove = useCallback((b: boolean) => { setAutoApproveRaw(b); save('snowtelco.autoApprove', b); }, []);
  const setPlaySpeed = useCallback((s: PlaySpeed) => { setPlaySpeedRaw(s); save('snowtelco.speed', s); }, []);
  const setNarratedMode = useCallback((b: boolean) => { setNarratedModeRaw(b); save('snowtelco.narratedMode', b); }, []);
  const selectIncident = useCallback((id: string) => {
    setSelectedIncidentId(id);
    save('snowtelco.incident', id);
    const cic = cicForIncident(id);
    if (cic) {
      // Switching the active CIC scenario must reset the rest of the per-scenario
      // state so panels (Customer 360, KPIs, AtRisk list, charts, briefing) stop
      // showing leftovers from the previous run.
      setScenarioIdRaw((prev) => {
        if (prev === cic) return prev;
        save('snowtelco.scenario', cic);
        const s = scenarioById(cic);
        setSelectedCustomerId(s.primaryCustomerId);
        setStageRaw('normal');
        setIsPlaying(false);
        setRanActionIds([]);
        setCompareIds([]);
        setResolutionProgress(0);
        lastToastedStage.current = null;
        return cic;
      });
    }
  }, []);
  const runAction = useCallback((id: string) => {
    setRanActionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const resetActions = useCallback(() => setRanActionIds([]), []);
  const toggleBigScreen = useCallback(() => setBigScreen((b) => !b), []);

  const resetNoc = useCallback(() => {
    setNocPlaying(false);
    setTElapsedMs(0);
    setRanActionIds([]);
    setFiredEvents([]);
    firedIdx.current = 0;
    cancelAnimationFrame(tickRaf.current);
  }, []);

  const toggleNocPlay = useCallback(() => {
    setNocPlaying((p) => {
      if (!p) {
        playStart.current = performance.now() - tElapsedMs / (playSpeed * BASE_PACE);
      }
      return !p;
    });
  }, [tElapsedMs, playSpeed]);

  const startNocPlay = useCallback(() => {
    setNocPlaying((p) => {
      if (!p) {
        playStart.current = performance.now() - tElapsedMs / (playSpeed * BASE_PACE);
      }
      return true;
    });
  }, [tElapsedMs, playSpeed]);

  // Step the scenario one beat forward / backward. Only meaningful when paused.
  // Snaps to the next/previous event that carries a `focus` payload so every
  // step produces a visible screen change (the FocusRuntime drives navigation
  // + pulse off the latest fired event's focus tag).
  const stepBeat = useCallback((direction: 'forward' | 'back') => {
    if (nocPlaying) return;
    const script = scriptForScenario(selectedIncidentId);
    const events = script.events;
    if (events.length === 0) return;
    const currentMs = tElapsedMs;

    const focusEvents = events.filter((e) => !!e.focus);
    if (focusEvents.length === 0) return;

    let target: typeof events[number] | undefined;
    if (direction === 'forward') {
      target = focusEvents.find((e) => e.atSec * 1000 > currentMs + 1);
      if (!target) return; // already at or past last focus beat
    } else {
      // Find latest focus event strictly before current time, else first
      const before = focusEvents.filter((e) => e.atSec * 1000 < currentMs - 1);
      if (before.length === 0) {
        target = focusEvents[0];
        if (target.atSec * 1000 >= currentMs - 1) {
          // Already at/before the first focus beat — rewind to t=0 and clear
          setTElapsedMs(0);
          setFiredEvents([]);
          firedIdx.current = 0;
          return;
        }
      } else {
        target = before[before.length - 1];
      }
    }
    if (!target) return;
    const targetMs = target.atSec * 1000;

    // Rebuild fired events from scratch so order, fids, and indices stay
    // deterministic relative to the new tElapsedMs.
    const fid0 = fidRef.current;
    const newFired: FiredEvent[] = [];
    let nextFid = fid0;
    for (const ev of events) {
      if (ev.atSec * 1000 > targetMs) break;
      nextFid += 1;
      newFired.unshift({ ...ev, fid: nextFid, incidentId: selectedIncidentId, realTime: fmtTime(ev.atSec * 1000) });
    }
    fidRef.current = nextFid;
    firedIdx.current = newFired.length;
    setFiredEvents(newFired.slice(0, 200));
    setTElapsedMs(targetMs);
  }, [nocPlaying, selectedIncidentId, tElapsedMs]);

  // Reset fired events when incident changes
  const prevIncidentRef = useRef(selectedIncidentId);
  useEffect(() => {
    if (prevIncidentRef.current === selectedIncidentId) return;
    prevIncidentRef.current = selectedIncidentId;
    setFiredEvents([]);
    firedIdx.current = 0;
    setTElapsedMs(0);
    setNocPlaying(false);
    setRanActionIds([]);
  }, [selectedIncidentId]);

  // Tick clock + sequencer
  useEffect(() => {
    if (!nocPlaying) return;
    const script = scriptForScenario(selectedIncidentId);
    const totalMs = script.durationSec * 1000;

    const tick = (now: number) => {
      const elapsedReal = now - playStart.current;
      const virt = elapsedReal * playSpeed * BASE_PACE;
      setTElapsedMs(virt);

      // fire events whose atSec <= virt
      while (firedIdx.current < script.events.length && script.events[firedIdx.current].atSec * 1000 <= virt) {
        const ev = script.events[firedIdx.current];
        firedIdx.current += 1;
        const fid = ++fidRef.current;
        const fired: FiredEvent = { ...ev, fid, incidentId: selectedIncidentId, realTime: fmtTime(ev.atSec * 1000) };
        setFiredEvents((prev) => [fired, ...prev].slice(0, 200));

        // side effects: action runs, sounds, toasts
        if (soundOn) {
          if (ev.kind === 'detect') sounds.incident();
          else if (ev.kind === 'alarm') sounds.alarm();
          else if (ev.kind.startsWith('act-')) sounds.ack();
          else if (ev.kind === 'resolve') sounds.resolve();
          else if (ev.kind === 'verify') sounds.success();
          else if (ev.severity === 'critical') sounds.alarm();
        }
        if (ev.kind === 'detect') toast.error(ev.text);
        else if (ev.kind === 'resolve') toast.success(ev.text);
        else if (ev.kind === 'verify') toast.success(ev.text);
        else if (ev.kind.startsWith('act-')) toast.message(ev.text);

        if (ev.kind === 'act-rebalance') runAction('rebalance-cap');
        if (ev.kind === 'act-snow') runAction('open-snow');
        if (ev.kind === 'act-restart') runAction('rolling-restart');
        if (ev.kind === 'act-care') runAction('notify-care');
      }

      if (virt >= totalMs) {
        setNocPlaying(false);
        return;
      }
      tickRaf.current = requestAnimationFrame(tick);
    };

    tickRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(tickRaf.current);
  }, [nocPlaying, selectedIncidentId, playSpeed, runAction, soundOn]);

  const setScenarioId = useCallback((id: ScenarioId) => {
    setScenarioIdRaw(id);
    save('snowtelco.scenario', id);
    setStageRaw('normal');
    setIsPlaying(false);
    lastToastedStage.current = null;
    const s = scenarioById(id);
    setSelectedCustomerId(s.primaryCustomerId);
  }, []);

  const advance = useCallback(() => {
    setStageRaw((prev) => {
      const idx = stageOrder.indexOf(prev);
      return idx >= stageOrder.length - 1 ? prev : stageOrder[idx + 1];
    });
  }, []);

  const reset = useCallback(() => {
    setStageRaw('normal');
    setSelectedCustomerId(scenario.primaryCustomerId);
    setIsPlaying(false);
    setResolutionProgress(0);
    cancelAnimationFrame(healingRaf.current);
    lastToastedStage.current = null;
  }, [scenario]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);
  const selectCustomer = useCallback((id: string) => setSelectedCustomerId(id), []);
  const toggleChat = useCallback(() => setChatOpen((c) => !c), []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }, []);
  const clearCompare = useCallback(() => setCompareIds([]), []);

  const startSelfHealing = useCallback(() => {
    cancelAnimationFrame(healingRaf.current);
    setResolutionProgress(0);
    healingStart.current = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - healingStart.current) / 12000);
      setResolutionProgress(p);
      if (p < 1) healingRaf.current = requestAnimationFrame(tick);
    };
    healingRaf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => { cancelAnimationFrame(healingRaf.current); cancelAnimationFrame(tickRaf.current); }, []);

  // CIC auto-advance
  useEffect(() => {
    if (!isPlaying) return;
    if (stage === 'risk_reduced') { setIsPlaying(false); return; }
    const t = setTimeout(advance, STAGE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [isPlaying, stage, advance]);

  // Drive the legacy CIC `stage` machine from the new section-scenario engine's
  // fired-event stream so the CIC dashboard (KpiStrip, IncidentCard, AtRisk,
  // narration toasts, post-action chip) tracks every scripted beat.
  useEffect(() => {
    if (firedEvents.length === 0) return; // selectIncident already reset to 'normal'
    const kinds = new Set(firedEvents.map((e) => e.kind));
    let next: Stage = 'normal';
    if (kinds.has('resolve') || kinds.has('verify'))                           next = 'risk_reduced';
    else if (kinds.has('act-care') || kinds.has('act-snow') ||
             kinds.has('act-rebalance') || kinds.has('act-restart'))           next = 'outreach_triggered';
    else if (kinds.has('plan'))                                                next = 'offer_generated';
    else if (kinds.has('hypothesize'))                                         next = 'customer_selected';
    else if (kinds.has('observe'))                                             next = 'customers_impacted';
    else if (kinds.has('detect'))                                              next = 'incident_detected';
    setStageRaw((prev) => (prev === next ? prev : next));
  }, [firedEvents]);

  // CIC Toasts + sounds. Only fires when the active scenario is a CIC scenario,
  // otherwise the Manchester / Birmingham etc. narration leaks into Digital /
  // BSS / OSS / NOC stages.
  useEffect(() => {
    if (lastToastedStage.current === stage) return;
    lastToastedStage.current = stage;
    const sec = sectionScenarioById(selectedIncidentId);
    const isCicScenario = !sec || sec.sectionId === 'cic';
    if (!isCicScenario) return;
    const n = scenario.narration[stage];
    switch (stage) {
      case 'incident_detected':
        toast.error(n);
        if (soundOn) sounds.incident();
        break;
      case 'customers_impacted': toast.warning(n); if (soundOn) sounds.tick(); break;
      case 'churn_scored': toast.info(n); if (soundOn) sounds.tick(); break;
      case 'customer_selected': toast.message(n); break;
      case 'offer_generated': toast.success(n); if (soundOn) sounds.success(); break;
      case 'outreach_triggered': toast.info(n); break;
      case 'risk_reduced': toast.success(n); if (soundOn) sounds.success(); break;
      default: break;
    }
  }, [stage, scenario, soundOn]);

  useEffect(() => {
    if (stage === 'customer_selected') setSelectedCustomerId(scenario.primaryCustomerId);
  }, [stage, scenario]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark-ops' || bigScreen) root.classList.add('dark-ops'); else root.classList.remove('dark-ops');
  }, [theme, bigScreen]);

  // Derived NOC stage
  const currentStage: DemoCtx['currentStage'] = useMemo(() => {
    if (firedEvents.length === 0) return 'idle';
    const kinds = new Set(firedEvents.map((e) => e.kind));
    if (kinds.has('resolve')) return 'resolved';
    if (kinds.has('verify')) return 'verify';
    if (kinds.has('act-rebalance') || kinds.has('act-snow') || kinds.has('act-care') || kinds.has('act-restart')) return 'act';
    if (kinds.has('plan')) return 'plan';
    if (kinds.has('hypothesize')) return 'hypothesize';
    if (kinds.has('observe')) return 'observe';
    if (kinds.has('detect')) return 'detect';
    return 'idle';
  }, [firedEvents]);

  const effectiveChurn = useCallback(
    (customerId: string) => {
      const cust = customers.find((c) => c.id === customerId);
      const churn = churnByCustomer(customerId);
      if (!cust) return churn.churnRisk;
      const isStoryCustomer = customerId === scenario.primaryCustomerId;
      if (stageReached(stage, 'risk_reduced') && isStoryCustomer) return cust.projectedRiskAfterAction;
      if (stageReached(stage, 'churn_scored') && (cust.isImpactedByIncident || isStoryCustomer)) return cust.churnRiskAfterIncident;
      return cust.churnRiskBeforeIncident;
    },
    [stage, scenario]
  );

  const isIncidentActive = stageReached(stage, 'incident_detected') && !stageReached(stage, 'risk_reduced');
  const isResolved = stage === 'risk_reduced';

  const value = useMemo<DemoCtx>(
    () => ({
      stage, isPlaying, selectedCustomerId,
      setStage, advance, reset, togglePlay, selectCustomer,
      effectiveChurn, isIncidentActive, isResolved,
      theme, setTheme, soundOn, setSoundOn, narratorOn, setNarratorOn,
      mode, setMode, autoApprove, setAutoApprove,
      selectedIncidentId, selectIncident, ranActionIds, runAction, resetActions,
      nocPlaying, toggleNocPlay, startNocPlay, resetNoc, stepBeat,
      tElapsedMs, playSpeed, setPlaySpeed, firedEvents, currentStage,
      bigScreen, toggleBigScreen,
      scenarioId, setScenarioId, scenario,
      compareIds, toggleCompare, clearCompare,
      chatOpen, setChatOpen, toggleChat,
      resolutionProgress, startSelfHealing,
      focusEnabled, setFocusEnabled,
      narratedMode, setNarratedMode,
    }),
    [stage, isPlaying, selectedCustomerId, setStage, advance, reset, togglePlay, selectCustomer,
      effectiveChurn, isIncidentActive, isResolved,
      theme, setTheme, soundOn, setSoundOn, narratorOn, setNarratorOn,
      mode, setMode, autoApprove, setAutoApprove,
      selectedIncidentId, selectIncident, ranActionIds, runAction, resetActions,
      nocPlaying, toggleNocPlay, startNocPlay, resetNoc, stepBeat,
      tElapsedMs, playSpeed, setPlaySpeed, firedEvents, currentStage,
      bigScreen, toggleBigScreen,
      scenarioId, setScenarioId, scenario,
      compareIds, toggleCompare, clearCompare,
      chatOpen, toggleChat,
      resolutionProgress, startSelfHealing,
      focusEnabled, setFocusEnabled,
      narratedMode, setNarratedMode,
    ]
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState() {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error('useDemoState must be used within DemoStateProvider');
  return ctx;
}
