import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  scenarioId: string;
  caption?: string;
  sectionId: 'cic' | 'digital' | 'bss' | 'oss' | 'noc';
  title: string;
  stage?: string;
}

const SECTION_GRADIENT: Record<string, string> = {
  cic: 'from-vfRed/80 via-rose-400/60 to-amber-300/40',
  digital: 'from-purple-500/80 via-fuchsia-400/60 to-pink-300/40',
  bss: 'from-emerald-600/80 via-emerald-400/60 to-teal-300/40',
  oss: 'from-blue-600/80 via-sky-400/60 to-cyan-300/40',
  noc: 'from-ink/85 via-slate-700/70 to-vfRed/60',
};

const SECTION_LABEL: Record<string, string> = {
  cic: 'CIC · Customer Intelligence',
  digital: 'Digital · Channels & Marketing',
  bss: 'BSS · Commerce & Revenue',
  oss: 'OSS · Network Operations',
  noc: 'NOC · Live Incidents',
};

import { BASE_URL } from '@/lib/runtime';

export function ScreenshotCard({ scenarioId, caption, sectionId, title, stage }: Props) {
  const [attempt, setAttempt] = useState<0 | 1 | 2>(0);
  const candidates = stage
    ? [`${BASE_URL}script-thumbs/${scenarioId}__${stage}.png`, `${BASE_URL}script-thumbs/${scenarioId}.png`]
    : [`${BASE_URL}script-thumbs/${scenarioId}.png`];
  const errored = attempt >= candidates.length;
  const src = !errored ? candidates[attempt] : '';
  return (
    <figure className="vf-card overflow-hidden">
      {!errored ? (
        <img
          src={src}
          alt={caption ?? title}
          className="w-full aspect-[16/9] object-cover bg-mist"
          onError={() => setAttempt((a) => (a + 1) as 0 | 1 | 2)}
          loading="lazy"
        />
      ) : (
        <div className={`w-full aspect-[16/9] bg-gradient-to-br ${SECTION_GRADIENT[sectionId] ?? 'from-mist to-white'} relative flex flex-col justify-end p-6`}>
          <div className="absolute top-4 right-4 vf-chip bg-white/80 text-ink text-[9px] font-bold backdrop-blur">
            <ImageIcon className="w-3 h-3" /> Stage preview
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/90 drop-shadow">{SECTION_LABEL[sectionId]}</div>
          <div className="text-xl md:text-2xl font-extrabold text-white drop-shadow leading-tight mt-1 max-w-[70%]">{title}</div>
        </div>
      )}
      {caption && (
        <figcaption className="px-3 py-2 text-[11px] text-ink-muted bg-white border-t border-mist-dark">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
