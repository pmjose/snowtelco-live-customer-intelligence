# Plan: Narrated Demo Voiceover

## Problem Statement

The Manchester Churn Save (Amelia Hughes) scenario has **7 stages** with rich presenter script text (~60-87 words each). The user wants a **voiced narration** that reads each stage's text aloud, synchronized with the scenario's event-driven timeline.

### Key Timing Challenge

The scenario's event timeline fires stages at these virtual-time offsets:
- detect: 0s, observe: 2s, hypothesize: 5s, plan: 7s, act: 11s, verify: 19s, resolve: 26s

At **1× speed** (BASE_PACE=0.45), real-time gaps between stages are:
- detect→observe: ~4.4s real
- observe→hypothesize: ~6.7s real
- hypothesize→plan: ~4.4s real
- plan→act: ~8.9s real
- act→verify: ~17.8s real
- verify→resolve: ~15.6s real

But the narration per stage is ~25-37 seconds of spoken word. **The narration is 3-5× longer than the time between events.**

### Solution: Decouple Narration from Event Speed

Two viable approaches:

---

## Approach A: Browser Web Speech API (Recommended for MVP)

**Pros:** Zero dependencies, works offline, instant, no API keys, no build step  
**Cons:** Voice quality varies by OS/browser, limited voice selection

**Behavior:**
1. When a stage fires, start speaking that stage's text
2. If the next stage fires before speech finishes, **interrupt** (cancel current utterance) and start the new stage's text
3. Alternatively: **slow the scenario** — pause playback until narration finishes each beat, then resume (this keeps narration + visuals in sync)

**Option B-variant: Pre-generated audio** (ElevenLabs / OpenAI TTS)
- Generate MP3 files per stage per scenario (offline build step)
- Higher quality, consistent voice, exact timing known in advance
- Can pre-calculate durations and adjust playback speed to match
- Requires API key and ~$0.50 per scenario

---

## Recommended Architecture (Approach A with "narration-paced" mode)

### New Mode: "Narrated Demo"

When enabled, the scenario runs in **narration-paced** mode:
1. Playback starts → `intro` text is spoken
2. When intro finishes speaking → advance to `detect` stage (fire detect event)
3. Speak `detect` text → when done, advance to `observe`
4. ...repeat until `resolved`

This means the narration **drives** the timeline, not the other way around. The visual events fire when the narrator is ready for them.

### Implementation Details

#### 1. `useNarration` Hook

```typescript
// src/hooks/useNarration.ts
export function useNarration() {
  const synth = window.speechSynthesis;
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, opts?: { rate?: number; onEnd?: () => void }) => {
    synth.cancel(); // interrupt any current speech
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts?.rate ?? 1.1; // slightly faster than default
    u.pitch = 1.0;
    u.voice = selectVoice(); // pick best English voice
    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); opts?.onEnd?.(); };
    utteranceRef.current = u;
    synth.speak(u);
  }, []);

  const stop = useCallback(() => { synth.cancel(); setSpeaking(false); }, []);
  
  return { speak, stop, speaking, voiceEnabled, setVoiceEnabled };
}
```

#### 2. Narration-Paced Playback Mode

Add a `narratedMode` boolean to DemoStateProvider. When true:
- Instead of RAF-based continuous playback, use a **step-through** model
- After `selectIncident`, speak the `intro` text
- On speech end → fire `detect` event manually, speak `detect` text
- On speech end → fire next events up to `observe`, speak `observe` text
- Continue until `resolved`

This replaces the time-based sequencer with a narration-driven sequencer for this mode.

#### 3. Narrator UI Changes

- Add a 🔊 speaker icon/toggle to the Narrator component
- When `narratedMode` is active, show a pulsing indicator
- Allow the user to click "Skip" to jump to next stage without waiting for speech

#### 4. Voice Selection

```typescript
function selectVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  // Prefer: Daniel (macOS), Google UK English Male, Microsoft Ryan
  const preferred = ['Daniel', 'Google UK English Male', 'Microsoft Ryan Online'];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => v.lang.startsWith('en')) ?? null;
}
```

#### 5. Speed Adjustment

- At 1× playback: speech rate 1.1 (natural)
- At 2× playback: speech rate 1.5 (fast but intelligible)
- At 4× playback: disable narration (capture mode)

---

## File Changes

| File | Change |
|------|--------|
| `src/hooks/useNarration.ts` | New — TTS hook |
| `src/state/DemoStateProvider.tsx` | Add `narratedMode` state, narration-driven sequencer |
| `src/components/narrator/Narrator.tsx` | Add voice toggle, speaking indicator, skip button |
| `src/data/presenterScripts.ts` | No change needed (text already exists) |
| `src/lib/useKeyboard.ts` | Add keyboard shortcut (e.g. `N` for narrate) |

---

## Alternative: Pre-Generated Audio (Phase 2)

If browser TTS quality isn't acceptable:
1. Create `scripts/generate-narration.mjs` that calls OpenAI TTS API or ElevenLabs
2. Generate MP3 per stage: `public/narration/cic-manchester-churn/detect.mp3`
3. Hook plays `<audio>` elements instead of Web Speech API
4. Exact durations are known → can auto-pace scenario precisely

---

## Testing Plan

1. Run Manchester Churn at 1× with narration enabled
2. Verify voice starts on each stage transition
3. Verify voice is interrupted cleanly when manually advancing
4. Verify voice stops on scenario reset
5. Verify no narration fires in capture/clean mode
6. Test on Chrome (best Web Speech), Safari (macOS voices), Firefox
