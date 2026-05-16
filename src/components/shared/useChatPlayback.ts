import { useEffect, useRef, useState } from 'react';

export interface PlaybackOpts {
  autoStart?: boolean;
  speed?: 0.5 | 1 | 2;
  // delay (ms) before showing typing for an "agent" message
  agentThinkMs?: number;
  // ms per character for the typing animation on agent
  agentMsPerChar?: number;
  // ms per character used to compute reading pause after a message
  readMsPerChar?: number;
  // hard caps
  maxTypingMs?: number;
  maxReadingMs?: number;
  minReadingMs?: number;
  userTypeMs?: number;     // simulated "user is typing" duration
  systemDelayMs?: number;  // small delay before a system bubble
}

export type Role = 'user' | 'agent' | 'system' | 'caller';

export interface PlayMsg { role: Role; text: string }

export interface PlaybackState {
  visibleCount: number;     // how many full bubbles are currently shown
  typingRole: Role | null;  // role currently "typing"
  typedText: string;        // partial text for the in-progress agent bubble (if any)
  playing: boolean;
  done: boolean;
}

export interface PlaybackControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (s: 0.5 | 1 | 2) => void;
  speed: 0.5 | 1 | 2;
}

const DEFAULTS: Required<Omit<PlaybackOpts, 'autoStart'>> = {
  speed: 1,
  agentThinkMs: 1500,
  agentMsPerChar: 22,
  readMsPerChar: 35,
  maxTypingMs: 5000,
  maxReadingMs: 2500,
  minReadingMs: 800,
  userTypeMs: 900,
  systemDelayMs: 250,
};

export function useChatPlayback(thread: PlayMsg[], opts: PlaybackOpts = {}): [PlaybackState, PlaybackControls] {
  const cfg = { ...DEFAULTS, ...opts };
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingRole, setTypingRole] = useState<Role | null>(null);
  const [typedText, setTypedText] = useState('');
  const [playing, setPlaying] = useState(!!opts.autoStart);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(cfg.speed);

  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const reset = () => {
    cancelRef.current.cancelled = true;
    cancelRef.current = { cancelled: false };
    setVisibleCount(0);
    setTypingRole(null);
    setTypedText('');
    setPlaying(false);
  };

  const start = () => {
    if (visibleCount >= thread.length) {
      cancelRef.current.cancelled = true;
      cancelRef.current = { cancelled: false };
      setVisibleCount(0);
      setTypedText('');
      setTypingRole(null);
    }
    setPlaying(true);
  };

  const pause = () => setPlaying(false);

  // Drive playback
  useEffect(() => {
    if (!playing) return;
    if (visibleCount >= thread.length) { setPlaying(false); return; }
    cancelRef.current = { cancelled: false };
    const token = cancelRef.current;

    const sleep = (ms: number) => new Promise<void>((res) => {
      const t = setTimeout(res, ms / speed);
      // attach cleanup so reset can interrupt
      (token as any)._t = t;
    });

    (async () => {
      const msg = thread[visibleCount];

      if (msg.role === 'agent') {
        if (token.cancelled) return;
        setTypingRole('agent');
        setTypedText('');
        await sleep(cfg.agentThinkMs);
        if (token.cancelled) return;

        // type out characters
        const total = Math.min(cfg.maxTypingMs, msg.text.length * cfg.agentMsPerChar);
        const stepMs = Math.max(8, total / Math.max(1, msg.text.length));
        for (let i = 1; i <= msg.text.length; i++) {
          if (token.cancelled) return;
          setTypedText(msg.text.slice(0, i));
          await sleep(stepMs);
        }
        if (token.cancelled) return;
        setTypingRole(null);
        setTypedText('');
        setVisibleCount((v) => v + 1);
        // reading pause after agent
        const rp = Math.min(cfg.maxReadingMs, Math.max(cfg.minReadingMs, msg.text.length * cfg.readMsPerChar));
        await sleep(rp);
      } else if (msg.role === 'user' || msg.role === 'caller') {
        if (token.cancelled) return;
        setTypingRole(msg.role);
        await sleep(cfg.userTypeMs);
        if (token.cancelled) return;
        setTypingRole(null);
        setVisibleCount((v) => v + 1);
        const rp = Math.min(cfg.maxReadingMs, Math.max(500, msg.text.length * 25));
        await sleep(rp);
      } else {
        // system
        if (token.cancelled) return;
        await sleep(cfg.systemDelayMs);
        if (token.cancelled) return;
        setVisibleCount((v) => v + 1);
        await sleep(450);
      }
    })();

    return () => { token.cancelled = true; };
  }, [playing, visibleCount, thread, speed]);

  const done = visibleCount >= thread.length;
  return [
    { visibleCount, typingRole, typedText, playing, done },
    { start, pause, reset, setSpeed, speed },
  ];
}
