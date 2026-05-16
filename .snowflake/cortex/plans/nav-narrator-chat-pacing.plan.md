---
name: "nav-narrator-chat-pacing"
created: "2026-05-14T19:17:24.131Z"
status: pending
---

# Plan — Navigation, Narrator overlay, Chatbot pacing

Three connected pieces of work. Each is independent enough to ship in any order, but they share the same shell components, so I'll do them in one batch.

---

## A. Navigation — make it easier

### What's wrong today

- Modes work (`CIC · Digital · BSS · OSS · NOC` toggle in header) but to **start a scenario** users must navigate to `/noc`, find the scenario picker in the sidebar, then press *Run scenario*. The other domains (Digital/BSS/OSS) have no scenario picker — by design, but that's not clear.
- `/architecture` and `/settings` live "outside" the 5 modes; the sidebar falls back to whatever mode the user last visited, which is confusing.
- No obvious way to jump back to the demo home; users have to click the logo.
- The 5-domain toggle is hidden on small viewports (`hidden md:inline-flex`).

### Changes

1. **Header → "Run scenario" command-palette button** (always visible, on every page).

   - Click opens a `<dialog>` listing all 8 scenarios with one-line subtitles, priority chip, target SLA.

   - Selecting a scenario:

     - sets `selectedIncidentId`
     - navigates to `/noc`
     - calls `toggleNocPlay()` to start

   - Keyboard shortcut: `Cmd/Ctrl+K`

2. **Sidebar — Reference group** appended to *every* mode's groups so it is always present:

   - Demo home (→ `/`)
   - Architecture (→ `/architecture`)
   - Demo catalogue (→ `/settings?tab=demos`)
   - Settings (→ `/settings`)

3. **Page-header breadcrumb component** (`<PageHeader>`) reused on all sub-pages: `Domain › Section · scenario state chip` so users always know where they are and whether a scenario is running.

4. **Make the 5-mode toggle visible on all viewport widths** (just remove `md:` gate; current design already fits at `sm:` widths).

### Files touched

- `src/components/app/AppHeader.tsx` — add command palette + Cmd-K hook
- `src/components/app/Sidebar.tsx` — append Reference group to every mode
- `src/components/shared/PageHeader.tsx` — new tiny component (optional polish)
- `src/components/app/CommandPalette.tsx` — new component

---

## B. Presenter narrator overlay — all sections × all scenarios

### What's wrong today

- A `<Narrator>` component exists (`src/components/narrator/Narrator.tsx`) but is wired to the **old CIC scenario engine** (`scenario.narration[stage]`). It only fires on the old `Stage` machine.
- New 8-scenario NOC engine (`nocSequence.ts` + `firedEvents` + `currentStage`) has no narration overlay.
- When the user is on `/digital` while the NOC script is running, they see no presenter cue.

### Design

1. **Extend `IncidentScript` in `src/data/nocSequence.ts`** with a `presenter` block:

   ```
   presenter: {
     intro: string;                // shown when scenario starts
     domainNotes: {
       noc: string;
       cic?: string;
       digital?: string;
       bss?: string;
       oss?: string;
     };
     beatsByStage: Partial<Record<NocStage, string>>;
     closing: string;
   }
   ```

   - `NocStage` = `'idle' | 'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved'`
   - I'll author a 4–7-line teleprompter for each of the 8 scenarios. Each beat is one sentence the presenter would actually say (e.g. *"Notice the agent has just hypothesised — 91% confidence — based on a similar HSS event from September."*).

2. **Rewrite `Narrator.tsx`** to compose its line from:

   - `presenter.intro` (for the first 6s of a run)
   - `presenter.beatsByStage[currentStage]` (live during run)
   - `presenter.domainNotes[currentDomain]` (overlay when user switches mode mid-scenario, e.g. *"You're now on Digital — watch the personalised pushes ranked by Snowpark ML."*)
   - `presenter.closing` (post `resolve`)
   - Latest fired event headline (always shown small underneath)

3. **Manual override**: ‹Prev / Next› buttons on the overlay so the presenter can step beats manually if they want to slow down (audience question, etc.). Manual mode pauses auto-advance until next stage transition.

4. **Re-style the overlay**: bottom-left, larger and more readable; chip with stage; small dot to indicate "live, auto-advancing" vs "manual"; collapse-to-pill toggle so it doesn't block the screen.

5. **Domain detection**: derive from `useLocation().pathname` (same logic as Sidebar).

### Files touched

- `src/data/nocSequence.ts` — add `presenter` per script (8 entries; \~30 lines per scenario)
- `src/components/narrator/Narrator.tsx` — rewrite
- `src/state/DemoStateProvider.tsx` — small additions: `narratorBeatIdx`, `narratorOverride: 'auto'|'manual'`, `nextBeat()`, `prevBeat()`

---

## C. Chatbot pacing — make it look real

### What's wrong today

- `DigitalConversational` reveals a new bubble every **1.4 s** unconditionally (`setTimeout(..., 1400)` in the `useEffect`). Long agent paragraphs flash instantly. There's no typing indicator.
- `DigitalVoice` has the same flat 1.1 s cadence on `VOICE_THREAD`.

### Pacing model (length-aware)

A new tiny hook `useChatPlayback(thread, options)` returns the current bubble index + a `typing` flag.

Per-message delay rules:

| Role       | Reading delay (before this bubble appears)                                                      | Typing animation                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **user**   | 600 ms (small "user is typing…")                                                                | char-by-char at 35 ms/char (visible "user typing" bubble), then full text on send |
| **system** | 250 ms                                                                                          | none — appears instantly with a fade                                              |
| **agent**  | 1.5 s "agent is typing…" then char-by-char at 22 ms/char (capped at 5 s for very long messages) | yes                                                                               |

Plus an inter-bubble **reading pause** after each message of `min(2.5 s, 35 ms × prevTextLength)` so the audience has time to read.

### UX additions

- **Typing indicator bubble** with three animated dots (CSS `@keyframes`) for `agent` and `user`.
- **Replay** button restarts. **Pause / Resume** controls. **Speed switch** (×0.5 / ×1 / ×2) for presenters in a hurry.
- Auto-scroll only at end-of-thread; allow user to scroll up without auto-snapping back.

### Voice transcript pacing

Apply the same hook (with role names mapped: `caller → user`, `agent → agent`) so a 12-line voice call doesn't whip past in 12 s.

### Files touched

- `src/components/shared/useChatPlayback.ts` — new hook
- `src/components/shared/TypingDots.tsx` — small CSS-only component
- `src/pages/digital/DigitalOverview.tsx` — replace the current `setStep`/`setT` loops in `DigitalConversational` and `DigitalVoice`

---

## D. Verification

1. `node node_modules/typescript/lib/tsc.js --noEmit` — clean
2. `node node_modules/vite/bin/vite.js build` — clean
3. Manual: walk Manchester scenario through `/noc → /digital → /bss → /oss`, narrator should change line per domain and per stage.
4. Manual: hit Cmd-K from `/architecture`; pick London HSS; should jump to `/noc` and start.
5. Manual: open `/digital/conversational` → press *Replay sample* → typing dots should appear, agent paragraph should not flash.

## E. Out of scope (will not touch this round)

- Sound design beyond what already exists.
- Voice synthesis ("speak" the narrator).
- Mobile optimization beyond making the 5-mode toggle reachable.
