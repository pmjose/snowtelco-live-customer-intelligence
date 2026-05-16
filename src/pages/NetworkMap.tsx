import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Timer, CheckCircle2 } from 'lucide-react';
import { UkNetworkMap } from '@/components/map/UkNetworkMap';
import { useDemoState } from '@/state/DemoStateProvider';

export default function NetworkMap() {
  const { resolutionProgress, startSelfHealing, reset, scenario } = useDemoState();
  const sitesTotal = 7;
  const sitesRecovered = Math.round(resolutionProgress * sitesTotal);
  const mttrSecondsTarget = 720; // 12 minutes
  const mttrRemaining = Math.max(0, Math.round((1 - resolutionProgress) * mttrSecondsTarget));
  const [tone, setTone] = useState<'osm' | 'light' | 'dark'>('osm');

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-vfRed font-bold">Operations</div>
          <h1 className="text-3xl font-extrabold text-ink">Network Map · {scenario.short}</h1>
          <p className="text-sm text-ink-muted">Full-screen network state with self-healing playback.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="vf-card p-1.5 flex items-center gap-1">
            {(['osm','light','dark'] as const).map((t) => (
              <button key={t} onClick={() => setTone(t)} className={`px-2 py-1 rounded text-xs font-semibold ${tone === t ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'}`}>{t.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={reset} className="vf-btn-secondary"><RotateCcw className="w-4 h-4" /> Reset</button>
          <button onClick={startSelfHealing} className="vf-btn-primary"><Play className="w-4 h-4" /> Play resolution</button>
        </div>
      </header>

      <div className="vf-card overflow-hidden h-[620px]">
        <UkNetworkMap mapTone={tone} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Cell sites recovered" value={`${sitesRecovered}/${sitesTotal}`} icon={CheckCircle2} done={sitesRecovered === sitesTotal} />
        <Stat label="MTTR remaining" value={mttrRemaining > 0 ? `${Math.floor(mttrRemaining / 60)}m ${mttrRemaining % 60}s` : '0:00'} icon={Timer} done={mttrRemaining === 0} />
        <Stat label="Resolution progress" value={`${Math.round(resolutionProgress * 100)}%`} icon={Play} />
        <Stat label="Customers cleared" value={`${Math.round(resolutionProgress * 2417).toLocaleString()}`} icon={CheckCircle2} done={resolutionProgress === 1} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, done }: { label: string; value: string; icon: any; done?: boolean }) {
  return (
    <motion.div className="vf-card p-3" animate={done ? { scale: [1, 1.04, 1] } : {}}>
      <div className="flex items-center justify-between">
        <div className="vf-kpi-label">{label}</div>
        <Icon className={`w-3.5 h-3.5 ${done ? 'text-ok' : 'text-ink-muted'}`} />
      </div>
      <div className={`text-xl font-extrabold mt-0.5 ${done ? 'text-ok' : 'text-ink'}`}>{value}</div>
    </motion.div>
  );
}
