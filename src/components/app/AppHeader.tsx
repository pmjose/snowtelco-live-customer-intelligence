import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, MessageSquare, Moon, Sun, Volume2, VolumeX, Radio, User2, Smartphone, CreditCard, Wrench, Play } from 'lucide-react';
import { useDemoState, type Mode } from '@/state/DemoStateProvider';
import { cn } from '@/lib/utils';
import { CommandPalette } from './CommandPalette';

const MODE_TARGET: Record<Mode, string> = {
  cic: '/command-center',
  digital: '/digital',
  bss: '/bss',
  oss: '/oss',
  noc: '/noc',
};

export function AppHeader() {
  const { toggleChat, theme, setTheme, soundOn, setSoundOn, mode, setMode } = useDemoState();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    navigate(MODE_TARGET[m]);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-mist-dark no-print">
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <div className="px-4 lg:px-6 h-16 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://companieslogo.com/img/orig/SNOW-35164165.png?t=1751096598"
            alt="SnowTelco"
            className="h-9 w-auto object-contain"
          />
          <span className="text-lg font-extrabold text-ink tracking-tight">Snow<span className="text-vfRed">Telco</span></span>
        </Link>
        <div className="hidden lg:flex items-center gap-2">
          <span className="vf-chip border border-ink/15 text-ink-muted">
            <ShieldCheck className="w-3.5 h-3.5" /> Internal
          </span>
        </div>
        <div className="ml-2 hidden md:inline-flex rounded-lg border border-mist-dark p-0.5 bg-mist">
          <ModeBtn active={mode === 'cic'} onClick={() => switchMode('cic')} icon={<User2 className="w-3.5 h-3.5" />} label="CIC" />
          <ModeBtn active={mode === 'digital'} onClick={() => switchMode('digital')} icon={<Smartphone className="w-3.5 h-3.5" />} label="Digital" />
          <ModeBtn active={mode === 'bss'} onClick={() => switchMode('bss')} icon={<CreditCard className="w-3.5 h-3.5" />} label="BSS" />
          <ModeBtn active={mode === 'oss'} onClick={() => switchMode('oss')} icon={<Wrench className="w-3.5 h-3.5" />} label="OSS" />
          <ModeBtn active={mode === 'noc'} onClick={() => switchMode('noc')} icon={<Radio className="w-3.5 h-3.5" />} label="NOC" />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-mist-dark text-ink hover:bg-mist text-[11.5px] font-semibold"
            title="Run a scenario (Cmd/Ctrl+K)"
          >
            <Play className="w-3.5 h-3.5 text-vfRed" />
            Run scenario
            <kbd className="ml-1 text-[9.5px] px-1 py-0.5 rounded bg-mist text-ink-muted font-mono">⌘K</kbd>
          </button>
          <IconBtn onClick={() => setSoundOn(!soundOn)} title={`Sounds ${soundOn ? 'on' : 'off'} (M)`}>
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </IconBtn>
          <IconBtn onClick={() => setTheme(theme === 'light' ? 'dark-ops' : 'light')} title="Toggle theme (T)">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </IconBtn>
          <IconBtn onClick={toggleChat} title="Ask agent (?)">
            <MessageSquare className="w-4 h-4" />
          </IconBtn>
        </div>
        <div className="hidden xl:flex items-center gap-3 pl-3 ml-1 border-l border-mist-dark">
          <div className="text-right leading-tight">
            <div className="text-xs text-ink-muted">{labelForMode(mode)}</div>
            <div className="text-xs font-semibold text-ink flex items-center gap-1">
              <Activity className="w-3 h-3 text-vfRed" /> Demo Environment
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-ink text-white grid place-items-center text-[11px] font-bold">{mode.toUpperCase().slice(0, 2)}</div>
        </div>
      </div>
    </header>
  );
}

function labelForMode(m: Mode) {
  return m === 'noc' ? 'Network Operations' : m === 'cic' ? 'Customer Intelligence' : m === 'digital' ? 'Digital Channels' : m === 'bss' ? 'Commerce & Revenue' : 'Service Operations';
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn('px-2.5 h-7 rounded-md text-[11px] font-bold inline-flex items-center gap-1.5 transition', active ? 'bg-white text-ink shadow-sm border border-mist-dark' : 'text-ink-muted hover:text-ink')}>
      {icon}
      {label}
    </button>
  );
}

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className="w-9 h-9 rounded-lg border border-mist-dark text-ink hover:bg-mist grid place-items-center">
      {children}
    </button>
  );
}
