import { useCallback, useEffect, useRef, useState } from 'react';

function selectVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  const preferred = ['Daniel', 'Google UK English Male', 'Microsoft Ryan', 'Samantha', 'Google UK English Female'];
  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith('en')) ?? null;
}

export interface NarrationControls {
  speak: (text: string, opts?: { rate?: number; onEnd?: () => void }) => void;
  stop: () => void;
  speaking: boolean;
  voiceReady: boolean;
}

export function useNarration(): NarrationControls {
  const [speaking, setSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const onEndRef = useRef<(() => void) | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const check = () => {
      if (speechSynthesis.getVoices().length > 0) setVoiceReady(true);
    };
    check();
    speechSynthesis.addEventListener('voiceschanged', check);
    return () => speechSynthesis.removeEventListener('voiceschanged', check);
  }, []);

  const speak = useCallback((text: string, opts?: { rate?: number; onEnd?: () => void }) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts?.rate ?? 1.1;
    u.pitch = 1.0;
    u.voice = selectVoice();
    onEndRef.current = opts?.onEnd ?? null;
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      onEndRef.current?.();
      onEndRef.current = null;
    };
    u.onerror = () => {
      setSpeaking(false);
      onEndRef.current?.();
      onEndRef.current = null;
    };
    utteranceRef.current = u;
    speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
    onEndRef.current = null;
  }, []);

  useEffect(() => () => { speechSynthesis.cancel(); }, []);

  return { speak, stop, speaking, voiceReady };
}
