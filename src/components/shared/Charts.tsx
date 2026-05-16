const COLORS = ['#29B5E8', '#11567F', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#0EA5E9'];

// ─── Vertical bar chart ───────────────────────────────────────────────────────
export function BarChart({ data, height = 140, color = '#29B5E8', formatter }: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatter?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 26);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-[9px] font-mono font-bold text-ink mb-0.5">{formatter ? formatter(d.value) : d.value.toLocaleString()}</div>
              <div className="w-full rounded-t transition-all" style={{ height: h, background: color, opacity: 0.85 }} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-[9.5px] text-ink-muted text-center truncate">{d.label}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal bar (better for long labels) ──────────────────────────────────
export function HBar({ data, formatter, color = '#29B5E8' }: {
  data: { label: string; value: number; sub?: string }[];
  formatter?: (v: number) => string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-1.5">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label}>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-ink truncate pr-2">{d.label}</span>
              <span className="font-mono font-bold text-ink shrink-0">{formatter ? formatter(d.value) : d.value.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-mist overflow-hidden mt-0.5">
              <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
            {d.sub && <div className="text-[9.5px] text-ink-muted mt-0.5">{d.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Line chart (sparkline-ish, multi-series friendly) ────────────────────────
export function LineChart({ series, height = 120, labels, colors = COLORS }: {
  series: { name: string; data: number[] }[];
  height?: number;
  labels?: string[];
  colors?: string[];
}) {
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const range = max - min || 1;
  const W = 600;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {/* horizontal grid */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1="0" x2={W} y1={height * p} y2={height * p} stroke="#eaeaea" strokeWidth="1" />
        ))}
        {series.map((s, si) => {
          const points = s.data.map((d, i) => `${(i / Math.max(1, s.data.length - 1)) * W},${height - ((d - min) / range) * (height - 16) - 8}`).join(' ');
          const color = colors[si % colors.length];
          return (
            <g key={s.name}>
              <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" />
              {s.data.map((d, i) => {
                const x = (i / Math.max(1, s.data.length - 1)) * W;
                const y = height - ((d - min) / range) * (height - 16) - 8;
                return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
              })}
            </g>
          );
        })}
      </svg>
      {labels && (
        <div className="flex justify-between text-[9.5px] text-ink-muted mt-0.5">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
      {series.length > 1 && (
        <div className="flex gap-3 mt-1.5">
          {series.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1 text-[10px] text-ink-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Donut / pie ──────────────────────────────────────────────────────────────
export function Donut({ data, size = 160, title, formatter }: {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  title?: string;
  formatter?: (v: number) => string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const arcs = data.map((d, i) => {
    const frac = total ? d.value / total : 0;
    const dash = circumference * frac;
    const offset = circumference * (1 - cumulative);
    const arc = { d, dash, gap: circumference - dash, offset, color: d.color ?? COLORS[i % COLORS.length] };
    cumulative += frac;
    return arc;
  });

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eaeaea" strokeWidth="14" />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="14"
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        {title && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#111">{title}</text>}
      </svg>
      <div className="space-y-1 flex-1 min-w-[120px]">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between text-[11.5px] gap-2">
            <span className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color ?? COLORS[i % COLORS.length] }} />
              <span className="whitespace-nowrap">{d.label}</span>
            </span>
            <span className="font-mono font-bold text-ink shrink-0">{formatter ? formatter(d.value) : d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Funnel ───────────────────────────────────────────────────────────────────
export function Funnel({ stages, formatter }: {
  stages: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }[];
  formatter?: (v: number) => string;
}) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="space-y-1.5">
      {stages.map((s) => {
        const pct = (s.value / max) * 100;
        const color = s.tone === 'bad' ? '#E11D48' : s.tone === 'warn' ? '#F59E0B' : s.tone === 'good' ? '#10B981' : '#29B5E8';
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-ink truncate pr-2">{s.label}</span>
              <span className="font-mono font-bold text-ink shrink-0">{formatter ? formatter(s.value) : s.value.toLocaleString()}</span>
            </div>
            <div className="h-2.5 rounded-full bg-mist overflow-hidden mt-0.5">
              <div className="h-full" style={{ width: `${Math.max(2, pct)}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sparkline (small inline chart) ───────────────────────────────────────────
export function Sparkline({ data, height = 36, color = '#29B5E8', area = true }: { data: number[]; height?: number; color?: string; area?: boolean }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const W = 100;
  const points = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * W},${100 - ((d - min) / range) * 80 - 10}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} 100`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {area && <polygon points={`0,100 ${points} ${W},100`} fill={color} opacity="0.12" />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
// CSS-grid heatmap. `rows` and `cols` define labels; `data[r][c]` is 0-1.
// Uses HTML grid (not SVG) so cell text stays at native font size and doesn't
// distort with viewport stretching.
export function Heatmap({ rows, cols, data, height = 220, formatter }: {
  rows: string[];
  cols: string[];
  data: number[][];
  height?: number;
  formatter?: (v: number) => string;
}) {
  const colorFor = (v: number) => {
    if (v < 0.25) return '#dcfce7';
    if (v < 0.5)  return '#fef3c7';
    if (v < 0.75) return '#fb923c';
    return '#dc2626';
  };
  return (
    <div className="flex flex-col" style={{ height }}>
      <div
        className="flex-1 grid gap-px"
        style={{
          gridTemplateColumns: `8rem repeat(${cols.length}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))`,
        }}
      >
        {rows.flatMap((rLabel, r) => [
          <div key={`row-${r}`} className="flex items-center pr-2 text-[11px] text-ink font-semibold truncate">{rLabel}</div>,
          ...cols.map((_, c) => {
            const v = data[r][c];
            const above = v >= 0.5;
            return (
              <div
                key={`${r}-${c}`}
                className="flex items-center justify-center text-[12px] font-bold tabular-nums rounded-[2px]"
                style={{ background: colorFor(v), color: above ? '#fff' : '#111' }}
                title={`${rLabel} · ${cols[c]} · ${formatter ? formatter(v) : `${Math.round(v * 100)}`}`}
              >
                {formatter ? formatter(v) : `${Math.round(v * 100)}`}
              </div>
            );
          }),
        ])}
      </div>
      <div className="grid gap-px mt-1 text-[10px] text-ink-muted font-mono" style={{ gridTemplateColumns: `8rem repeat(${cols.length}, minmax(0, 1fr))` }}>
        <div />
        {cols.map((c) => <div key={c} className="text-center truncate">{c}</div>)}
      </div>
    </div>
  );
}

// ─── Scatter (x, y, size, color) ─────────────────────────────────────────────
// Rendered as absolute-positioned HTML circles so dots stay round regardless
// of container width (SVG with preserveAspectRatio="none" stretches them into
// ovals).
export function Scatter({ data, xLabel, yLabel, height = 220, xMax, yMax, threshold }: {
  data: { x: number; y: number; size?: number; color?: string; label?: string; group?: string }[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  xMax?: number;
  yMax?: number;
  threshold?: number;
}) {
  const xM = xMax ?? Math.max(1, ...data.map((d) => d.x));
  const yM = yMax ?? Math.max(1, ...data.map((d) => d.y));
  const thresholdPct = threshold !== undefined ? (threshold / xM) * 100 : null;
  return (
    <div style={{ height }} className="relative pl-5 pb-5 pt-1 pr-1">
      <div className="relative w-full h-full bg-white" style={{
        backgroundImage:
          'linear-gradient(to right, #eee 1px, transparent 1px), linear-gradient(to bottom, #eee 1px, transparent 1px)',
        backgroundSize: '20% 20%',
      }}>
        {thresholdPct !== null && (
          <div className="absolute top-0 bottom-0 border-l border-dashed border-vfRed" style={{ left: `${thresholdPct}%` }} />
        )}
        {data.map((d, i) => {
          const px = (d.x / xM) * 100;
          const py = 100 - (d.y / yM) * 100;
          const diameter = d.size ? Math.min(16, 4 + d.size) : 6;
          return (
            <div
              key={i}
              title={`${d.label ?? ''} x=${d.x} y=${d.y}`}
              className="absolute rounded-full border border-white"
              style={{
                left: `${px}%`,
                top: `${py}%`,
                width: diameter,
                height: diameter,
                background: d.color ?? '#29B5E8',
                opacity: 0.85,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>
      {xLabel && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-ink-muted font-mono">{xLabel}</div>}
      {yLabel && <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[9px] text-ink-muted font-mono" style={{ writingMode: 'vertical-rl' }}>{yLabel}</div>}
    </div>
  );
}

// ─── Gauge (semicircle with target marker) ───────────────────────────────────
export function Gauge({ value, max = 100, target, label, height = 140 }: { value: number; max?: number; target?: number; label?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  // Arc from 200deg to -20deg (approx 220deg span)
  const startA = Math.PI * 0.875;  // 157.5
  const endA   = -Math.PI * 0.125; // -22.5
  const angle  = startA - pct * (startA - endA);
  const r = 36;
  const cx = 50;
  const cy = 60;
  const arc = (from: number, to: number) => {
    const x1 = cx + Math.cos(from) * r;
    const y1 = cy - Math.sin(from) * r;
    const x2 = cx + Math.cos(to) * r;
    const y2 = cy - Math.sin(to) * r;
    const large = Math.abs(from - to) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
  };
  const tone = pct >= 0.7 ? '#10B981' : pct >= 0.4 ? '#F59E0B' : '#E11D48';
  const targetA = target !== undefined ? startA - (target / max) * (startA - endA) : null;
  return (
    <div style={{ height }} className="relative">
      <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <path d={arc(startA, endA)} stroke="#e5e7eb" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d={arc(startA, angle)} stroke={tone} strokeWidth={9} fill="none" strokeLinecap="round" />
        {targetA !== null && (
          <line
            x1={cx + Math.cos(targetA) * (r - 6)}
            y1={cy - Math.sin(targetA) * (r - 6)}
            x2={cx + Math.cos(targetA) * (r + 6)}
            y2={cy - Math.sin(targetA) * (r + 6)}
            stroke="#111"
            strokeWidth={1.4}
          />
        )}
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14" fontWeight={800} fill="#111">{Math.round(pct * 100)}%</text>
        {label && <text x={cx} y={cy + 14} textAnchor="middle" fontSize="5" fill="#6b7280">{label}</text>}
      </svg>
    </div>
  );
}

// ─── Waterfall ───────────────────────────────────────────────────────────────
export function Waterfall({ items, height = 180, formatter = (v) => `£${v}` }: {
  items: { label: string; value: number; tone?: 'pos' | 'neg' | 'total' }[];
  height?: number;
  formatter?: (v: number) => string;
}) {
  let running = 0;
  const bars = items.map((it) => {
    if (it.tone === 'total') {
      const out = { from: 0, to: it.value, ...it };
      running = it.value;
      return out;
    }
    const from = running;
    const to = running + it.value;
    running = to;
    return { from, to, ...it };
  });
  const max = Math.max(0, ...bars.map((b) => Math.max(b.from, b.to)));
  const min = Math.min(0, ...bars.map((b) => Math.min(b.from, b.to)));
  const range = max - min || 1;
  const pctFor = (v: number) => ((v - min) / range) * 100;
  return (
    <div style={{ height }} className="flex flex-col">
      <div className="flex-1 flex items-end gap-1 relative">
        {bars.map((b, i) => {
          const top = Math.min(pctFor(b.from), pctFor(b.to));
          const h = Math.abs(pctFor(b.from) - pctFor(b.to));
          const color = b.tone === 'total' ? '#11567F' : b.tone === 'neg' ? '#E11D48' : '#10B981';
          return (
            <div key={i} className="flex-1 h-full relative">
              <div
                className="absolute rounded text-[10px] font-bold text-white text-center pt-0.5 px-1 truncate"
                style={{
                  left: '15%',
                  right: '15%',
                  bottom: `${top}%`,
                  height: `${Math.max(2, h)}%`,
                  background: color,
                  minHeight: '14px',
                }}
                title={formatter(b.value)}
              >
                {h > 6 ? formatter(b.value) : ''}
              </div>
              {h <= 6 && (
                <div className="absolute left-0 right-0 text-center text-[10px] font-bold text-ink" style={{ bottom: `calc(${top}% + ${h}% + 2px)` }}>
                  {formatter(b.value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 text-[10px] text-ink-muted font-semibold mt-1">
        {items.map((it, i) => (
          <div key={i} className="flex-1 text-center truncate">{it.label}</div>
        ))}
      </div>
    </div>
  );
}
