import { coverageRowFor, LEVEL_ORDER, LEVEL_LABEL, LEVEL_COLOR, type CoverageDomain } from '@/data/scenarioCoverage';

const DOMAINS: { key: CoverageDomain; label: string }[] = [
  { key: 'noc', label: 'NOC' },
  { key: 'cic', label: 'CIC' },
  { key: 'digital', label: 'Dig' },
  { key: 'bss', label: 'BSS' },
  { key: 'oss', label: 'OSS' },
];

export function CoverageBars({ incidentId, size = 'sm', showLabels = true }: { incidentId: string; size?: 'sm' | 'md'; showLabels?: boolean }) {
  const row = coverageRowFor(incidentId);
  if (!row) return null;

  const dotPx = size === 'md' ? 7 : 5;
  const dotGap = size === 'md' ? 3 : 2;

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      {DOMAINS.map((d) => {
        const cell = row[d.key];
        const filled = LEVEL_ORDER[cell.level]; // 0..4
        return (
          <div key={d.key} title={`${d.label}: ${LEVEL_LABEL[cell.level]} — ${cell.note}`} className="inline-flex items-center gap-1">
            {showLabels && <span className="text-[9.5px] font-bold text-ink-muted uppercase tracking-wider">{d.label}</span>}
            <div className="flex items-center" style={{ gap: dotGap }}>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className="rounded-full"
                  style={{
                    width: dotPx,
                    height: dotPx,
                    background: n <= filled ? LEVEL_COLOR[cell.level] : '#E5E7EB',
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
