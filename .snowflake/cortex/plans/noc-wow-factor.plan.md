# Plan: NOC "wow" upgrade

## What's flat today
- `/events` is a static list with `motion` only on initial mount — never appends, never moves.
- NOC KPIs are hard-coded constants — they don't react to auto-drive.
- Map (`/network`) doesn't pulse, doesn't show alarm storms.
- Action tray runs but the rest of the UI doesn't visibly change.
- No sound, no big screen-mode, no "war room" feel.

## Goal
A presenter clicks **Auto-drive** and the entire NOC visibly comes alive: events stream in real time, KPIs tick, the map pulses, alarms cluster on a topology, and the agent reasoning fills in — all in lockstep over ~30s.

## Core idea: a single shared `tickClock`
Add a global high-frequency tick (200ms via `requestAnimationFrame` throttled) on `DemoStateProvider` that increments while `nocPlaying`. Every panel reads from it. This avoids 5 separate timers fighting each other.

## High-impact additions

### 1. Live Event Firehose (`/events` redesign)
- New `useEventFirehose(playing, speed)` hook that emits events into a rolling buffer (cap 200), tagged with realtime offsets from a virtual T0 = 09:31.
- Append with slide-in + fade animation (framer's `AnimatePresence`).
- **Three-column layout**:
  - Center: streaming feed with auto-scroll lock + pause-on-hover
  - Left: per-category counters (Network/Care/Billing/CDR/Decisioning/Activation) that animate up
  - Right: severity heatmap (last 60s) + tiny "events/sec" sparkline
- A scrubber timeline along the top with stage markers (Detect / Plan / Act / Verify) that you can click to jump.
- A "Boss view" button → fullscreen, larger fonts, ticker tape across the bottom (good for screensharing).

### 2. Live KPI tick-down on /noc
- KPIs (`mttr`, `mttd`, `alarms`, `auto-actions`, `agent-confidence`) interpolate over auto-drive time.
- Use `framer-motion`'s `useMotionValue` + `animate(...)` for smooth count-up/down.
- Sparklines extend live, dropping the oldest sample.
- After Verify step, a green flash + "Resolved · MTTR 7m24s" badge.

### 3. Map alarm storm (`/network`)
- Add pulsing rings around degraded sites whose intensity scales with `tickClock`.
- "Storm cone" polygon on the cluster filling with red, then shrinking back to green as actions execute.
- Customer dots on map gradually flip from red → amber → green during Verify.
- Mini-map widget on `/noc` (right-side, above reasoning, optional toggle) so you don't have to leave the command center.

### 4. Topology aliveness (`/noc/topology`)
- Status pills pulse on alarm; aggregate alarm counts roll up the tree.
- During auto-drive, draw the agent's traversal: highlight Core → REG-NW → CLU-MAN-01 → SITE → CELL with a glowing edge.
- Click any node to scope the event firehose + reasoning to that subtree.

### 5. War-room theming
- A "Big screen" toggle on `/noc` (key: `B`) that:
  - Switches body to `dark-ops` automatically
  - Hides sidebar, expands KPI strip + queue, doubles font
  - Adds a 3-line ticker at the bottom cycling latest events
- Add ambient "alert" sound on Detect, "ack" on Approve, "resolve" on Verify (uses existing `sounds.ts`; throttled, off by default).

### 6. Auto-drive sequencer (richer)
Replace the simple 8-step counter with an event-driven script: array of `{ atSec, kind, payload }` actions. The clock fires events when their time elapses. Examples:
- `0s` Detect anomaly (toast + map pulse + first event burst)
- `2s` Alarm storm (events 4/sec for 4s)
- `8s` Hypothesis displayed; topology highlighted
- `12s` Plan generated; action tray reveals tier-1
- `14s` Approve rebalance (auto if `autoApprove`)
- `18s` ServiceNow ticket; ServiceNow row in events
- `22s` Care notified; CIC/care animation
- `28s` Verify — KPIs animate to recovered values; map nodes flip green
- `32s` Resolved — celebratory flash, MTTR final, summary card slides up

This is reusable — same script can drive CIC mode (already has stages) and gives you a single "story timeline".

### 7. Per-incident scenarios for the queue
Right now there's one hero. Make it possible to play different scenario timelines:
- Manchester M14 (existing)
- Liverpool L1 thermal throttle (faster, auto-resolved no-approval)
- Leeds LS2 IPRAN (slower, escalates to vendor)
Selecting a queue row + pressing Auto-drive plays that incident's script.

### 8. Polish
- Replace the static "Live Simulation" header chip with the real elapsed `T+mm:ss`.
- Add little tool-call "shimmer" while a tool is executing (already-imported `framer-motion`).
- Replace 6 KPI cards with 7 to fill the row evenly on 1440px.
- Skeleton-shimmer placeholders for KPIs while T0 is pending.

## Files to add
- `src/lib/clock.ts` — shared tick clock + sequencer engine
- `src/data/nocSequence.ts` — scripted timelines per incident
- `src/components/noc/EventFirehose.tsx` — new streaming list with virtualization (manual)
- `src/components/noc/KpiTickerCard.tsx` — animated KPI tile
- `src/components/noc/StormPulse.tsx` — SVG pulse ring component
- `src/components/noc/MiniMap.tsx` — small map widget for `/noc`
- `src/components/noc/Ticker.tsx` — bottom ticker tape

## Files to modify
- `src/state/DemoStateProvider.tsx` — add `tickClock`, `tElapsed`, `playSpeed`, replace `nocStep` driver with sequencer
- `src/pages/EventStream.tsx` — full rebuild around firehose
- `src/pages/NocCommandCenter.tsx` — wire animated KPI strip + storm pulse + ticker
- `src/pages/NocTopology.tsx` — pulse + traversal glow
- `src/pages/NetworkMap.tsx` — alarm storm overlay + customer dot recovery
- `src/components/noc/NocKpiStrip.tsx` → wraps `KpiTickerCard`
- `src/lib/sounds.ts` — add `ack`, `resolve`

## Out of scope
- Real Snowflake calls / streaming SQL
- LLM/agent SDK integration
- Mobile-first layout

## Open questions
- **Q1 — Scope**: Ship all 8 items, or top 3 (firehose, live KPIs, map storm) first as the highest "wow"? Default proposal: ship top 3 first, then 4–8 in a follow-up.
- **Q2 — Speed**: Default playback speed (1×, 2×, or 4×)? Add a `1× / 2× / 4×` toggle?
- **Q3 — Sound**: On by default during auto-drive, or always opt-in? Default proposal: opt-in (it can be jarring during demos with audience).
- **Q4 — Big-screen mode**: Build it now or defer? Default proposal: build a *minimal* version (hide sidebar, larger fonts) but skip the ticker tape until later.
- **Q5 — Scenario branching**: Single Manchester arc only, or all three (Liverpool/Leeds variants)? Default proposal: Manchester first, scaffold branching for follow-up.
