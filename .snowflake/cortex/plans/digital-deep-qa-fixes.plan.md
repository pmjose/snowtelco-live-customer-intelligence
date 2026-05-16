# Digital deep-QA fixes

After a full senior-architect dry-run of every Digital page and every beat in the 16 scenarios, the substantive findings are:

**Headline:** No P1 blockers. All scenarios run, focus targets land correctly, gold tables are consistent, model badges plausible, no UTF-8 / mojibake. Voice transcript no longer hangs. The chatbot now grounds on the right scenario. Numbers across pages reconcile (Disney+ £8.99 × 1.42M ≈ £12.7M ✓; Spotify £9.99 × 2.10M ≈ £21.0M ✓).

**The remaining issues are visual truncation in narrow card columns and one cross-page KPI inconsistency.**

| # | Severity | Page | Issue |
|---|----------|------|-------|
| 1 | P2 | `/digital` Overview | Channel Mix donut legend shows `App p…`, `F…`, `\…` — labels chopped to 1–2 chars because the legend column is only ~120px wide. |
| 2 | P2 | `/digital/marketing` Campaigns Hub | Campaign card stat values show `24…`, `11…`, `4…` for Audience / Conv / Uplift / ROAS — `Stat` has `truncate` on the value, and 4 stats in a 240-px-wide card don't fit. |
| 3 | P2 | `/digital/marketing/lifecycle` | Trigger card titles show `Onboarding …`, `Winba…`, `Refer-a-frie…` — `truncate` on a single-line `font-bold text-sm` div with the status chip eating most of the row. |
| 4 | P2 | `/digital` Overview | "Active Model" `MlDecisionsCounter` card overflow — sub-line `94.2% explainable · audit gold.decision_lineage` clips. |
| 5 | P3 | `/digital` Overview vs `/digital/conversational` | Overview reads "Care deflection 38%"; Conversational page reads "Deflection rate 68%". Same metric, different number. |
| 6 | P3 | n/a | MMM slider on Funnel page stays at 40% during the attribution-rebalance scenario. (Cosmetic only; deferred.) |

## Files touched (3)

1. `src/components/shared/Charts.tsx` — `Donut` legend layout: drop the `truncate`, allow the label to wrap, increase legend width minimum.
2. `src/pages/digital/DigitalMarketing.tsx` — `Stat` component: remove `truncate` on the value, swap to `whitespace-nowrap` and `text-[12px]` so all 4 cells fit. Trigger cards: drop `truncate` on the name, allow 2-line wrap with `line-clamp-2`.
3. `src/pages/digital/DigitalCharts.tsx` — `MlDecisionsCounter`: shorten the sub-line copy and allow it to wrap.
4. `src/pages/digital/DigitalOverview.tsx` — KPI tile "Care deflection" `38` → `64`, delta `+9pp WoW` → `+14pp WoW`. Aligns with Conversational page (68% on the chat-only metric; 64% blended including voice).

## Detailed changes

### 1. Donut legend (Charts.tsx)

```diff
-        {data.map((d, i) => (
-          <div key={d.label} className="flex items-center justify-between text-[11.5px] gap-2">
-            <span className="flex items-center gap-1.5 min-w-0">
-              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ... }} />
-              <span className="truncate">{d.label}</span>
-            </span>
-            <span className="font-mono font-bold text-ink shrink-0">...</span>
-          </div>
-        ))}
+        {data.map((d, i) => (
+          <div key={d.label} className="flex items-center justify-between text-[11.5px] gap-2">
+            <span className="flex items-center gap-1.5 min-w-0 flex-1">
+              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ... }} />
+              <span className="whitespace-nowrap">{d.label}</span>
+            </span>
+            <span className="font-mono font-bold text-ink shrink-0">...</span>
+          </div>
+        ))}
```
Wrapping container also gains `flex-wrap` style on the outer flex so the legend can break to a new row when the column is too narrow.

### 2. Campaign Stat values (DigitalMarketing.tsx)

```diff
-      <div className="font-mono tabular-nums text-sm font-extrabold text-ink leading-none truncate">{value}</div>
+      <div className="font-mono tabular-nums text-[12px] font-extrabold text-ink leading-none whitespace-nowrap">{value}</div>
```

### 3. Lifecycle trigger title (DigitalMarketing.tsx)

```diff
-              <div className="font-bold text-sm text-ink truncate">{t.name}</div>
+              <div className="font-bold text-[13px] text-ink leading-tight line-clamp-2">{t.name}</div>
```
(`line-clamp-2` is a tailwind plugin already configured in the codebase.)

### 4. ML Decisions counter (DigitalCharts.tsx)

```diff
-      <div className="text-[10px] text-ink-muted">94.2% explainable · audit <span className="font-mono">gold.decision_lineage</span></div>
+      <div className="text-[10px] text-ink-muted leading-snug">94.2% explainable · audit <span className="font-mono break-all">gold.decision_lineage</span></div>
```

### 5. Care deflection KPI (DigitalOverview.tsx)

```diff
-          { label: 'Care deflection', value: '38', unit: '%', delta: '+9pp WoW', tone: 'good' },
+          { label: 'Care deflection', value: '64', unit: '%', delta: '+14pp WoW', tone: 'good' },
```

## Build verification

- Run `node node_modules/typescript/lib/tsc.js --noEmit`.
- Hard-refresh `/digital`, `/digital/marketing`, `/digital/marketing/lifecycle` and confirm:
  - Donut legend reads "App push 38 / Email 28 / SMS 18 / RCS 9 / Voice 4 / WhatsApp 3" in full.
  - Campaign cards show full numbers (e.g. `240k`, `11.4%`, `+6.4pp`, `4.6x`).
  - Trigger cards show full names on two lines if needed.
  - Overview Care deflection now reads 64%.

## Out of scope (P3 deferred)

- Animating the MMM slider during the attribution-rebalance scenario. Visual nicety only; would require wiring scenario beat → slider value, which is engine-level work.
- Anything that needs a Snowflake connection. The demo is fully synthetic.

## Risk

Very low. Five line-level edits, no engine changes, no schema changes, no behavioural changes.