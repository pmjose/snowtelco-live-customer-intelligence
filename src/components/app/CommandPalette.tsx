import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Radio, X } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { scenariosFor, sectionFromPath, SECTION_LABEL, SECTION_PATH, type SectionId } from '@/data/sectionScenarios';
import { ScenarioMetaBar } from '@/components/scenarios/ScenarioMetaBar';
import { cn } from '@/lib/utils';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { selectIncident, resetNoc, toggleNocPlay, nocPlaying } = useDemoState();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSection: SectionId = sectionFromPath(pathname) ?? 'cic';

  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } else { setQ(''); setIdx(0); } }, [open]);

  const all = scenariosFor(currentSection);
  const list = all.filter((s) =>
    !q ||
    s.id.toLowerCase().includes(q.toLowerCase()) ||
    s.title.toLowerCase().includes(q.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(q.toLowerCase())
  );

  const run = (id: string) => {
    setQ('');
    setIdx(0);
    onClose();
    selectIncident(id);
    resetNoc();
    // Stay on current section page
    if (sectionFromPath(pathname) !== currentSection) navigate(SECTION_PATH[currentSection]);
    setTimeout(() => { if (!nocPlaying) toggleNocPlay(); }, 350);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
      if (e.key === 'Enter') { e.preventDefault(); if (list[idx]) run(list[idx].id); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, list, idx]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-mist-dark overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-mist-dark">
              <Search className="w-4 h-4 text-ink-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                placeholder={`Run a ${SECTION_LABEL[currentSection]} scenario — type to filter...`}
                className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-muted"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-mist text-ink-muted font-mono">esc</kbd>
              <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {list.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-ink-muted">No scenario matches "{q}" in {SECTION_LABEL[currentSection]}</div>
              )}
              {list.map((s, k) => (
                <button
                  key={s.id}
                  onClick={() => run(s.id)}
                  onMouseEnter={() => setIdx(k)}
                  className={cn('w-full text-left px-4 py-3 border-b border-mist-dark/60 flex items-start gap-3 transition',
                    k === idx ? 'bg-vfRed-soft/40' : 'hover:bg-mist/60')}
                >
                  <div className="w-9 h-9 rounded-lg bg-vfRed-soft text-vfRed-dark grid place-items-center shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-ink">{s.title}</span>
                      <span className="vf-chip bg-mist text-ink-muted text-[10px] font-mono">{s.durationSec}s</span>
                    </div>
                    <div className="text-[11.5px] text-ink-muted leading-snug mt-0.5 line-clamp-2">{s.subtitle}</div>
                    <div className="mt-1.5"><ScenarioMetaBar scenario={s} /></div>
                  </div>
                  <div className="shrink-0 text-vfRed-dark"><Play className="w-4 h-4" /></div>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 bg-mist/40 border-t border-mist-dark text-[10.5px] text-ink-muted flex items-center justify-between">
              <div>Press <kbd className="px-1 py-0.5 rounded bg-white border border-mist-dark text-[9.5px] font-mono">enter</kbd> to run · scenarios are scoped to <b>{SECTION_LABEL[currentSection]}</b></div>
              <div className="font-mono">{list.length} scenarios</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
