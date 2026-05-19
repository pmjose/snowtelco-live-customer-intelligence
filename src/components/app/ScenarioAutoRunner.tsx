import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoState } from '@/state/DemoStateProvider';
import { scenarioById, SECTION_PATH } from '@/data/sectionScenarios';
import { nocIncidents } from '@/data/nocIncidents';

const STAGE_TO_KIND_PRIORITY: Record<string, string[]> = {
  detect: ['detect', 'alarm'],
  observe: ['observe'],
  hypothesize: ['hypothesize'],
  plan: ['plan'],
  act: ['act-snow', 'act-care', 'act-rebalance', 'act-restart', 'act'],
  verify: ['verify'],
  resolved: ['resolve', 'resolved'],
};

declare global {
  interface Window {
    __captureReady?: boolean;
    __captureError?: string;
    __captureCurrentScenario?: string;
    __captureCurrentStage?: string;
  }
}

export function ScenarioAutoRunner() {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const { selectIncident, toggleNocPlay, startNocPlay, nocPlaying, firedEvents, currentStage, setPlaySpeed } = useDemoState();
  const captureRef = useRef<{ runId: string; stage: string; targetKinds: Set<string> } | null>(null);
  const triggeredFor = useRef<string | null>(null);

  // Publish a read-only bridge so capture scripts can poll state.
  useEffect(() => {
    (window as any).__getFiredEvents = () => firedEvents;
    (window as any).__getCurrentStage = () => currentStage;
  }, [firedEvents, currentStage]);

  // Parse URL params and trigger scenario on initial load (before navigate)
  useEffect(() => {
    const params = new URLSearchParams(search);
    const runId = params.get('run');
    const stage = params.get('stage') ?? 'detect';
    const clean = params.get('clean') === '1';

    if (clean) document.body.classList.add('capture-mode');
    else document.body.classList.remove('capture-mode');

    if (!runId) { captureRef.current = null; return; }

    const key = `${runId}|${stage}`;
    if (triggeredFor.current === key) return;
    triggeredFor.current = key;

    if (clean) setPlaySpeed(4);

    window.__captureReady = false;
    window.__captureError = undefined;
    window.__captureCurrentScenario = runId;
    window.__captureCurrentStage = stage;

    const targetKinds = new Set(STAGE_TO_KIND_PRIORITY[stage] ?? [stage]);
    captureRef.current = { runId, stage, targetKinds };

    if (stage === 'idle') {
      window.__captureReady = true;
      return;
    }

    const sec = scenarioById(runId);
    const noc = nocIncidents.find((i) => i.id === runId);
    if (!sec && !noc) {
      window.__captureError = `unknown scenario: ${runId}`;
      window.__captureReady = true;
      return;
    }
    const route = sec ? SECTION_PATH[sec.sectionId] : '/noc';

    selectIncident(runId);
    navigate({ pathname: route, search });

    // Start playback after effects settle. selectIncident's reset effect
    // (sets nocPlaying=false) must fire first. startNocPlay guarantees we
    // always start (never accidentally stop) playback.
    setTimeout(() => { startNocPlay(); }, 800);
  }, [search]);

  // Watch firedEvents — use captureRef (not URL) to avoid post-navigate staleness.
  useEffect(() => {
    const cap = captureRef.current;
    if (!cap) return;
    if (window.__captureReady) return;
    const matched = firedEvents.some((e) => cap.targetKinds.has(e.kind));
    if (matched) {
      window.__captureReady = true;
    }
  }, [firedEvents]);

  return null;
}
