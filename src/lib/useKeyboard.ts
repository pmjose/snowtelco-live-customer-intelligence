import { useEffect } from 'react';
import { customers } from '@/data/customers';
import { useDemoState } from '@/state/DemoStateProvider';

export function useKeyboardShortcuts() {
  const s = useDemoState();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === ' ') { e.preventDefault(); s.togglePlay(); }
      else if (e.key === 'ArrowRight') { s.advance(); }
      else if (e.key.toLowerCase() === 'r') { s.reset(); }
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) { s.toggleChat(); }
      else if (e.key.toLowerCase() === 'n') { s.setNarratorOn(!s.narratorOn); }
      else if (e.key.toLowerCase() === 't') { s.setTheme(s.theme === 'light' ? 'dark-ops' : 'light'); }
      else if (e.key.toLowerCase() === 'm') { s.setSoundOn(!s.soundOn); }
      else if (/^[1-6]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const c = customers[idx];
        if (c) s.selectCustomer(c.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s]);
}

export const SHORTCUT_LIST: { keys: string; action: string }[] = [
  { keys: 'Space', action: 'Play / pause demo' },
  { keys: '→', action: 'Advance one stage' },
  { keys: 'R', action: 'Restart demo' },
  { keys: '1-6', action: 'Select customer' },
  { keys: '?', action: 'Open Ask Cortex AI chat' },
  { keys: 'N', action: 'Toggle narrator overlay' },
  { keys: 'T', action: 'Toggle dark Network-Ops mode' },
  { keys: 'M', action: 'Toggle sounds' },
];
