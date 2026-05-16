import type { SectionScenario } from '@/data/sectionScenarios';
import { getScenarioMeta, fmtGbp, fmtCount, fmtHours } from '@/data/scenarioMeta';
import { Clock, Banknote, Users, ShieldCheck, Snowflake } from 'lucide-react';

interface Props {
  scenario: SectionScenario;
  variant?: 'inline' | 'wide';
  hideRoi?: boolean;
  hideStandards?: boolean;
  hideSnowflake?: boolean;
}

// Compact one-line scorecard rendered in the picker, on the run banner,
// and in the section-overview ScenarioTimeline header.
export function ScenarioMetaBar({ scenario, variant = 'inline', hideRoi, hideStandards, hideSnowflake }: Props) {
  const meta = getScenarioMeta(scenario);
  const wide = variant === 'wide';
  return (
    <div className={wide ? 'flex flex-wrap items-center gap-2 text-[11px]' : 'flex flex-wrap items-center gap-1.5 text-[10.5px]'}>
      {!hideRoi && (
        <div className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5">
          <Clock className="w-3 h-3" />
          <span className="font-mono font-bold">{fmtHours(meta.roi.hoursSaved)}</span>
          <span className="opacity-70">saved</span>
        </div>
      )}
      {!hideRoi && (
        <div className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5">
          <Banknote className="w-3 h-3" />
          <span className="font-mono font-bold">{fmtGbp(meta.roi.gbpProtected)}</span>
        </div>
      )}
      {!hideRoi && (
        <div className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5">
          <Users className="w-3 h-3" />
          <span className="font-mono font-bold">{fmtCount(meta.roi.customersProtected)}</span>
        </div>
      )}
      {!hideStandards && meta.standards.slice(0, wide ? 6 : 3).map((s) => (
        <span key={s} className="flex items-center gap-1 rounded-md bg-mist border border-mist-dark text-ink-muted px-1.5 py-0.5">
          <ShieldCheck className="w-3 h-3" />
          <span className="font-mono">{s}</span>
        </span>
      ))}
      {!hideSnowflake && meta.snowflakePrimitives.slice(0, wide ? 5 : 2).map((s) => (
        <span key={s} className="flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 px-1.5 py-0.5">
          <Snowflake className="w-3 h-3" />
          <span className="font-mono">{s}</span>
        </span>
      ))}
    </div>
  );
}
