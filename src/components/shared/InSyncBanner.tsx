import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Radio, ArrowRight, Info } from 'lucide-react';
import { useDemoState } from '@/state/DemoStateProvider';
import { scriptForIncident } from '@/data/nocSequence';
import { incidentById } from '@/data/nocIncidents';
import { coverageFor, LEVEL_LABEL, LEVEL_COLOR } from '@/data/scenarioCoverage';
import { cn } from '@/lib/utils';

type Domain = 'digital' | 'bss' | 'oss';

interface DomainSpec {
  label: string;
  filter: (text: string, category?: string) => boolean;
  kpis: (events: { text: string }[]) => Array<{ label: string; value: string; tone?: 'good' | 'warn' | 'bad' }>;
}

const COUNT = (events: { text: string }[], rx: RegExp) => events.filter((e) => rx.test(e.text)).length;
const SUM_NUMBER = (events: { text: string }[], rx: RegExp): number =>
  events.reduce((acc, e) => {
    const m = e.text.match(rx);
    return acc + (m ? Number(m[1].replace(/[, ]/g, '')) : 0);
  }, 0);

const SPECS: Record<Domain, DomainSpec> = {
  digital: {
    label: 'Digital',
    filter: (text, category) =>
      category === 'Care' ||
      /push|sms|email|voice|whatsapp|rcs|comms|app push|notify|notification|playbook/i.test(text),
    kpis: (events) => {
      const pushed = SUM_NUMBER(events, /(\d{1,3}(?:,\d{3})*)\s+(?:customers?|outbound roamers|delivered|push|SMS|notifications?|playbook)/i);
      const suppressed = SUM_NUMBER(events, /(\d{1,3}(?:,\d{3})*)\s+suppressed/i);
      const verified = COUNT(events, /verified-channel|registered MSISDN/i);
      return [
        { label: 'Comms dispatched', value: pushed.toLocaleString(), tone: 'good' },
        { label: 'Suppressed', value: suppressed.toLocaleString(), tone: 'warn' },
        { label: 'Verified-channel', value: String(verified), tone: 'good' },
      ];
    },
  },
  bss: {
    label: 'BSS',
    filter: (text, category) =>
      category === 'Billing' || category === 'Activation' ||
      /credit|charging|billing|invoice|order|freeze|MFA|payments|service credit|Ofcom|loss avoided|goodwill|fraud|swap/i.test(text),
    kpis: (events) => {
      const credits = SUM_NUMBER(events, /(?:£|\$)([\d,]+)/);
      const ordersFrozen = COUNT(events, /freeze|frozen|bulk_freeze|lock outbound/i);
      const fraudPrevented = SUM_NUMBER(events, /(?:£|\$)([\d,]+)\s*(?:loss avoided|fraud)/i);
      return [
        { label: 'Goodwill / credits', value: `£${credits.toLocaleString()}`, tone: 'warn' },
        { label: 'Orders frozen / locked', value: String(ordersFrozen), tone: 'good' },
        { label: 'Fraud loss prevented', value: `£${fraudPrevented.toLocaleString()}`, tone: 'good' },
      ];
    },
  },
  oss: {
    label: 'OSS',
    filter: (text, category) =>
      category === 'Activation' ||
      /servicenow|change|CHG|INC|MIM|SEC-|VND-|WO-|ticket|work order|dispatch|PIR|capacity|maintenance|field-tech|fieldforce|vendor/i.test(text),
    kpis: (events) => {
      const tickets = COUNT(events, /servicenow\.|CHG\d|INC\d|MIM-|SEC-INC|VND-/i);
      const workOrders = COUNT(events, /work[ ]?order|WO-|fieldforce\.dispatch/i);
      const pir = COUNT(events, /pir|post-implementation|narrator\.draft_pir/i);
      return [
        { label: 'Tickets opened', value: String(tickets), tone: 'warn' },
        { label: 'Work orders', value: String(workOrders), tone: 'good' },
        { label: 'PIR drafts', value: String(pir), tone: 'good' },
      ];
    },
  },
};

export function InSyncBanner({ domain }: { domain: Domain }) {
  const { firedEvents, nocPlaying, tElapsedMs, selectedIncidentId, currentStage } = useDemoState();
  const script = scriptForIncident(selectedIncidentId);
  const incident = incidentById(selectedIncidentId);
  const spec = SPECS[domain];

  const filtered = useMemo(
    () => firedEvents.filter((e) => spec.filter(e.text, e.category)),
    [firedEvents, spec]
  );
  const kpis = useMemo(() => spec.kpis(filtered), [filtered, spec]);

  // Hide banner entirely if nothing is happening
  const idle = !nocPlaying && tElapsedMs === 0 && firedEvents.length === 0;
  if (idle) {
    return (
      <div className="vf-card p-3 bg-mist/40 border-dashed">
        <div className="flex items-center gap-2 text-[12px] text-ink-muted">
          <Radio className="w-3.5 h-3.5" />
          <span><b className="text-ink">In sync with NOC.</b> When a scenario runs in NOC, this domain reflects what the agents do here. <Link to="/noc" className="text-vfRed font-bold inline-flex items-center gap-0.5">Open NOC <ArrowRight className="w-3 h-3" /></Link></span>
        </div>
      </div>
    );
  }

  // Hide banner on domains where the active scenario has no meaningful surface
  // (avoids showing a "Birmingham backhaul outage" banner on Commerce & Revenue).
  const cov = coverageFor(selectedIncidentId, domain);
  if (cov && (cov.level === 'none' || cov.level === 'thin')) {
    return null;
  }

  const pct = Math.min(100, (tElapsedMs / (script.durationSec * 1000)) * 100);
  const stageLabel = currentStage === 'idle' ? 'Idle' : currentStage.charAt(0).toUpperCase() + currentStage.slice(1);
  const coverage = cov;
  const isThin = coverage && (coverage.level === 'thin' || coverage.level === 'none');

  return (
    <div className="vf-card p-3 border-l-4 border-l-vfRed">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('vf-chip text-[10px] font-bold', nocPlaying ? 'bg-vfRed text-white animate-pulse' : 'bg-emerald-100 text-emerald-700')}>
              {nocPlaying ? 'LIVE · IN SYNC WITH NOC' : 'SCENARIO PAUSED'}
            </span>
            <span className="vf-chip bg-mist text-ink-muted text-[10px] uppercase">{stageLabel}</span>
            <span className="vf-chip bg-mist text-ink font-mono text-[10px]">T+ {(tElapsedMs / 1000).toFixed(1)}s / {script.durationSec}s</span>
            {coverage && (
              <span
                className="vf-chip text-[10px] font-bold uppercase"
                style={{ background: `${LEVEL_COLOR[coverage.level]}22`, color: LEVEL_COLOR[coverage.level], borderColor: LEVEL_COLOR[coverage.level] }}
                title={coverage.note}
              >
                {spec.label} surface · {LEVEL_LABEL[coverage.level]}
              </span>
            )}
          </div>
          <div className="text-[14px] font-extrabold text-ink leading-tight">{incident.id} — {incident.city}</div>
          <div className="text-[11px] text-ink-muted leading-snug max-w-3xl">{incident.rootCauseHypothesis}</div>
        </div>
        <Link to="/noc" className="vf-btn-secondary !py-1.5 !px-2.5 !text-[11px]"><Radio className="w-3.5 h-3.5" /> NOC view</Link>
      </div>

      <div className="h-1 rounded-full bg-mist overflow-hidden mt-2">
        <div className="h-full bg-vfRed transition-all duration-150" style={{ width: `${pct}%` }} />
      </div>

      {coverage && (
        <div className={cn('mt-2 rounded-md px-2.5 py-1.5 text-[11.5px] flex items-start gap-1.5',
          isThin ? 'bg-amber/15 border border-amber/40 text-amber-900' : 'bg-mist/60 border border-mist-dark text-ink')}>
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span><b>Why this {spec.label} surface is {LEVEL_LABEL[coverage.level].toLowerCase()}:</b> {coverage.note}</span>
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 mt-3">
        {kpis.map((k, i) => (
          <KpiTile key={i} {...k} />
        ))}
      </div>

      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Latest in {spec.label}</div>
        <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 -mr-1">
          <AnimatePresence initial={false}>
            {filtered.slice(0, 6).map((e) => (
              <motion.div
                key={e.fid}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-2 text-[11.5px] leading-snug"
              >
                <span className="font-mono text-ink-muted w-12 shrink-0">{e.realTime}</span>
                <span className={cn('flex-1', e.severity === 'critical' ? 'text-vfRed-dark font-semibold' : e.severity === 'success' ? 'text-emerald-700' : e.severity === 'warn' ? 'text-amber-700' : 'text-ink')}>{e.text}</span>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-[11px] text-ink-muted italic">No {spec.label} events yet for this scenario.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, tone = 'good' }: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : 'text-amber';
  return (
    <div className="rounded-md bg-mist/60 border border-mist-dark px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className={cn('font-mono tabular-nums text-base font-extrabold leading-none mt-0.5', toneCls)}>{value}</div>
    </div>
  );
}
