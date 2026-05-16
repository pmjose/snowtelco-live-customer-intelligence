// Tiny Web Audio API tones — no external assets

let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { ctx = null; }
  }
  return ctx;
}

function tone(freq: number, durMs: number, type: OscillatorType = 'sine', volume = 0.05) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + durMs / 1000);
}

export const sounds = {
  incident() { tone(220, 380, 'square', 0.045); setTimeout(() => tone(180, 260, 'square', 0.045), 80); },
  alarm() { tone(880, 80, 'sawtooth', 0.025); },
  ack() { tone(720, 90, 'triangle', 0.04); setTimeout(() => tone(960, 80, 'triangle', 0.04), 60); },
  resolve() { tone(660, 140, 'sine', 0.05); setTimeout(() => tone(880, 180, 'sine', 0.05), 100); setTimeout(() => tone(1320, 240, 'sine', 0.05), 220); },
  success() { tone(660, 140, 'sine', 0.05); setTimeout(() => tone(880, 220, 'sine', 0.05), 100); },
  tick() { tone(520, 60, 'triangle', 0.025); },
};
