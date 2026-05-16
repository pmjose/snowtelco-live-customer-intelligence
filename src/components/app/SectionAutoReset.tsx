import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoState } from '@/state/DemoStateProvider';
import { sectionFromPath, scenarioById, scenariosFor } from '@/data/sectionScenarios';

// Watches the current route and resets the active scenario when the user moves
// to a different section. Also auto-selects the first scenario of the new
// section so the sidebar dropdown / transport bar are in a sensible state.
export function SectionAutoReset() {
  const { pathname } = useLocation();
  const { selectedIncidentId, selectIncident, resetNoc, nocPlaying, toggleNocPlay, mode, setMode } = useDemoState();

  useEffect(() => {
    const newSection = sectionFromPath(pathname);
    if (!newSection) return;
    // Keep `mode` in lock-step with the active section so panels that branch
    // on mode (event stream, briefing isNoc check, header chip) stay coherent.
    if (mode !== newSection) setMode(newSection);
    const active = scenarioById(selectedIncidentId);
    if (!active || active.sectionId !== newSection) {
      // Stop and reset whatever's running
      if (nocPlaying) toggleNocPlay();
      // Auto-select first scenario of the new section
      const list = scenariosFor(newSection);
      if (list.length > 0) selectIncident(list[0].id);
      resetNoc();
    }
  }, [pathname]);

  return null;
}
