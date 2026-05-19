import { useEffect, useRef } from 'react';
import { useDemoState } from '@/state/DemoStateProvider';
import { useNarration } from '@/lib/useNarration';
import { presenterFor, derivePresenterFor, type NocStageKey } from '@/data/presenterScripts';
import { scenarioById as sectionScenarioById } from '@/data/sectionScenarios';

export function NarrationRunner() {
  const { narratedMode, currentStage, selectedIncidentId, firedEvents, nocPlaying } = useDemoState();
  const { speak, stop } = useNarration();
  const lastSpoken = useRef<string>('');

  useEffect(() => {
    if (!narratedMode) {
      stop();
      lastSpoken.current = '';
      return;
    }

    if (!nocPlaying) {
      stop();
      lastSpoken.current = '';
      return;
    }

    if (currentStage === 'idle') return;

    const sectionScenario = sectionScenarioById(selectedIncidentId);
    const manual = presenterFor(selectedIncidentId);
    const derived = sectionScenario && !manual ? derivePresenterFor(sectionScenario) : null;
    const presenter = manual ?? derived;
    if (!presenter) return;

    const key = `${selectedIncidentId}-${currentStage}`;
    if (lastSpoken.current === key) return;
    lastSpoken.current = key;

    let text: string | undefined;
    if (currentStage === 'detect' && firedEvents.length <= 2) {
      text = presenter.intro;
    } else if (currentStage === 'resolved') {
      text = presenter.closing;
    } else {
      text = presenter.beatsByStage[currentStage as NocStageKey];
    }

    if (text) {
      speak(text, { rate: 1.05 });
    }
  }, [narratedMode, nocPlaying, currentStage, selectedIncidentId, firedEvents.length]);

  return null;
}
