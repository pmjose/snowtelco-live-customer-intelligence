# Where should the Live Timeline live?

## Where it is now

In [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) line 79, `<LiveTimeline />` sits **between** the 3-column grid (cohort / incident / customer 360) and the bottom analytics row. Reading order today:

1. Header
2. KPI strip
3. 3-col grid (cohort / incident / Customer 360)
4. **Live timeline**
5. Bottom analytics (6 chart cards)

That slot is a tomb. By the time the audience scrolls down to it, they've already burned the visual budget on the grid above. It also competes for attention with the chart row immediately below.

## Options

### Option A — Move under the header, above the KPI strip (recommended)
The timeline becomes the "you are here" anchor for the scenario.
1. Header: which scenario / city / brand
2. **Live timeline**: where we are in that scenario (stage 3 of 7, 09:21 churn impact model executed)
3. KPI strip: the numeric outcome at this point in time
4. Grid: deep dive into cohort / incident / customer
5. Bottom analytics

This is the natural narrative for a presenter: *"Manchester degradation, we're at the 'churn scored' stage, here's what the numbers look like, now let me show you the customer."*

Cost: pushes KPIs down by ~80px. Trivial.

### Option B — Keep where it is, but make it sticky on scroll
Wrap it in `sticky top-0 z-20` (with the right offset for the existing top nav). Persistent breadcrumb. Cheap. Doesn't fix the "burned-eye" problem on first paint.

### Option C — Fold into the IncidentCard column (replace `EventStreamWidget`)
The timeline becomes a vertical mini-track inside the incident column. Tight, scenario-coupled. Downside: loses full-width prominence and EventStreamWidget already serves the "what just happened" feed.

### Option D — Compact stage indicator next to the header, full timeline at bottom only when paused
Header gets a "Stage 3 of 7 · 09:21" chip; the full 9-step track only renders when the scenario is paused or stepping. Most cinematic, but adds engine state plumbing.

## Recommendation: Option A

Lowest cost, highest narrative value. Single change:

```tsx
// Before (line ~47-49)
<KpiStrip />

<div data-focus="cic-grid" ...>

// After
<LiveTimeline />
<KpiStrip />

<div data-focus="cic-grid" ...>
```

And remove the second instance from line 79.

## Implementation steps

1. Move `<LiveTimeline />` to immediately below the header (above `<KpiStrip />`) in [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx).
2. Remove the original placement (line 79) so it isn't rendered twice.
3. Optional polish: when `scenario.theme === 'growth'`, swap the timeline progress bar from `bg-vfRed` to `bg-blue-600` for chrome consistency. Same for the stage-reached dots. (One conditional in [src/components/timeline/LiveTimeline.tsx](src/components/timeline/LiveTimeline.tsx) lines 68 + 82.)

## Verification

- Walk Manchester / Birmingham / Leeds / London. Timeline should sit just under the title, above KPIs, in every scenario.
- For London (growth), progress bar should be blue.
- Bottom of page should now flow KPIs → grid → analytics with no orphaned timeline.

## Critical files

- [src/pages/CommandCenter.tsx](src/pages/CommandCenter.tsx) — relocate the component (2-line move)
- [src/components/timeline/LiveTimeline.tsx](src/components/timeline/LiveTimeline.tsx) — optional theme-aware accent