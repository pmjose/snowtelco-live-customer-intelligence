import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoState } from '@/state/DemoStateProvider';

// Watches fired scenario events and, when an event carries a `focus` payload,
// drives the UI to that target: optionally navigates to a route, scrolls the
// matching [data-focus="<target>"] element into view, applies a pulse highlight,
// and (if a tab is specified) clicks the inner [data-focus-tab="<tab>"] button.
//
// Spotlight: when the target is a specific widget (not "page"), dims the rest
// of the page and raises the target with a glow. Skipped for "page" so that
// overview moments don't go dark.
function applySpotlight(target: string) {
  if (target === 'page') {
    // Soft page-level cue: top edge sweeps a thin red shimmer (no dim)
    const existing = document.getElementById('focus-page-sweep');
    if (existing) existing.remove();
    const sweep = document.createElement('div');
    sweep.id = 'focus-page-sweep';
    sweep.className = 'focus-page-sweep';
    document.body.appendChild(sweep);
    window.setTimeout(() => sweep.remove(), 1600);
    return;
  }
  // Add backdrop element to DOM
  const existing = document.getElementById('focus-spotlight-backdrop');
  if (existing) existing.remove();
  const backdrop = document.createElement('div');
  backdrop.id = 'focus-spotlight-backdrop';
  backdrop.className = 'focus-spotlight-backdrop';
  document.body.appendChild(backdrop);
  window.setTimeout(() => backdrop.remove(), 1400);
  // Mark target
  const el = document.querySelector<HTMLElement>(`[data-focus="${target}"]`);
  if (!el) return;
  el.classList.remove('focus-spotlight-target');
  void el.offsetWidth;
  el.classList.add('focus-spotlight-target');
  window.setTimeout(() => el.classList.remove('focus-spotlight-target'), 1400);
}

export function FocusRuntime() {
  const { firedEvents, focusEnabled } = useDemoState();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const seenFid = useRef<number>(0);
  const pendingRoute = useRef<string | null>(null);
  const pendingFocus = useRef<{ target: string; tab?: string; hold?: number } | null>(null);

  // Apply the actual scroll/pulse once the DOM is on the right route
  useEffect(() => {
    if (!pendingFocus.current) return;
    if (pendingRoute.current && pathname !== pendingRoute.current) return; // wait for nav to land
    const fx = pendingFocus.current;
    pendingFocus.current = null;
    pendingRoute.current = null;

    // Defer to next frame so newly mounted route content can register
    const handle = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-focus="${fx.target}"]`);
      if (!el) return;
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        el.scrollIntoView();
      }
      el.classList.remove('focus-pulse');
      // force reflow so the animation restarts when the same element is re-targeted
      void el.offsetWidth;
      el.classList.add('focus-pulse');
      window.setTimeout(() => el.classList.remove('focus-pulse'), 1700);
      applySpotlight(fx.target);

      if (fx.tab) {
        const tabBtn = el.querySelector<HTMLElement>(`[data-focus-tab="${fx.tab}"]`);
        if (tabBtn) tabBtn.click();
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [pathname, firedEvents]);

  useEffect(() => {
    if (!focusEnabled) return;
    if (firedEvents.length === 0) return;
    const latest = firedEvents[0];
    if (latest.fid <= seenFid.current) return;
    seenFid.current = latest.fid;
    if (!latest.focus) return;

    pendingFocus.current = { target: latest.focus.target, tab: latest.focus.tab, hold: latest.focus.hold };
    if (latest.focus.route && pathname !== latest.focus.route) {
      pendingRoute.current = latest.focus.route;
      navigate(latest.focus.route);
    } else {
      pendingRoute.current = null;
      // Trigger the apply-effect by nudging state via microtask
      queueMicrotask(() => {
        // No-op — the effect above re-runs on firedEvents change
      });
      // Apply directly here too, in case the effect already ran
      const el = document.querySelector<HTMLElement>(`[data-focus="${latest.focus.target}"]`);
      if (el) {
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { el.scrollIntoView(); }
        el.classList.remove('focus-pulse');
        void el.offsetWidth;
        el.classList.add('focus-pulse');
        window.setTimeout(() => el.classList.remove('focus-pulse'), 1700);
        applySpotlight(latest.focus.target);
        if (latest.focus.tab) {
          const tabBtn = el.querySelector<HTMLElement>(`[data-focus-tab="${latest.focus.tab}"]`);
          if (tabBtn) tabBtn.click();
        }
        pendingFocus.current = null;
      }
    }
  }, [firedEvents, focusEnabled, navigate, pathname]);

  // Reset cursor when scenario changes (firedEvents resets to [])
  useEffect(() => {
    if (firedEvents.length === 0) {
      seenFid.current = 0;
      pendingFocus.current = null;
      pendingRoute.current = null;
    }
  }, [firedEvents.length]);

  return null;
}
