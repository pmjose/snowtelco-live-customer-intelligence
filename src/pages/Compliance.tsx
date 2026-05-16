import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileLock, Clock4, RadioTower, Languages, Baby, ScrollText } from 'lucide-react';
import { sectionScenarios } from '@/data/sectionScenarios';
import { getScenarioMeta } from '@/data/scenarioMeta';

interface Tile {
  key: string;
  title: string;
  authority: string;
  status: 'green' | 'amber' | 'red';
  metric: string;
  metricLabel: string;
  detail: string;
  scenarioMatch: RegExp;
  icon: typeof ShieldCheck;
}

const TILES: Tile[] = [
  {
    key: 'gc-a3',
    title: '999 / 112 reachability',
    authority: 'Ofcom GC A3',
    status: 'green',
    metric: '0',
    metricLabel: 'reportable lapses (30d)',
    detail: '1.42M IMS-attached subs · last sweep 4h ago · evidence pack auto-filed.',
    scenarioMatch: /Ofcom GC A3|999/,
    icon: RadioTower,
  },
  {
    key: 'consumer-duty',
    title: 'Consumer Duty foreseeable-harm',
    authority: 'FCA',
    status: 'amber',
    metric: '4,820',
    metricLabel: 'cases actioned this quarter',
    detail: 'Vulnerable cohort · bill-shock · debt-distress · digital-exclusion lanes all green; tariff-suitability board paper queued.',
    scenarioMatch: /Consumer Duty|FCA/,
    icon: ShieldCheck,
  },
  {
    key: 'ipa-li',
    title: 'Lawful Intercept · IPA evidence',
    authority: 'Investigatory Powers Act',
    status: 'green',
    metric: '24/24',
    metricLabel: 'requests audit-clean',
    detail: 'Time Travel 90d retention · Snowflake provides regulator-grade reproducibility.',
    scenarioMatch: /IPA|Lawful Intercept|LI/,
    icon: FileLock,
  },
  {
    key: 'nis2',
    title: 'NIS2 incident reporting',
    authority: 'NCSC · NIS2',
    status: 'green',
    metric: '0',
    metricLabel: 'open clocks',
    detail: 'Last reportable incident filed within 24h early-warning + 72h follow-up windows.',
    scenarioMatch: /NIS2|NCSC/,
    icon: Clock4,
  },
  {
    key: 'icnirp',
    title: 'ICNIRP / EMF audits',
    authority: 'ICNIRP',
    status: 'amber',
    metric: '38',
    metricLabel: 'sites due in 90d',
    detail: 'Mast-classified sites scanned · 0 over public-exposure thresholds · auto-scheduling workflow live.',
    scenarioMatch: /ICNIRP|EMF/,
    icon: AlertTriangle,
  },
  {
    key: 'welsh',
    title: 'Welsh Language Standards',
    authority: 'Welsh Language Commissioner',
    status: 'green',
    metric: '100%',
    metricLabel: 'comms in cy-GB',
    detail: 'Cortex Complete drafts cy-GB variant for every English customer comms. Ofcom-friendly.',
    scenarioMatch: /Welsh/,
    icon: Languages,
  },
  {
    key: 'osa',
    title: 'Online Safety Act · child accounts',
    authority: 'Ofcom · OSA',
    status: 'green',
    metric: '12,400',
    metricLabel: 'verified parental consents',
    detail: 'Family-plan child accounts · age verification · safe-search defaults · monthly Ofcom report queue.',
    scenarioMatch: /Online Safety Act/,
    icon: Baby,
  },
  {
    key: 'gdpr',
    title: 'GDPR · DSAR / Art.34',
    authority: 'ICO · GDPR',
    status: 'amber',
    metric: '3.4d',
    metricLabel: 'avg DSAR turnaround (target 30d)',
    detail: 'DSAR surge auto-routed · Art.34 breach notifications drafted within 6h via Cortex Complete.',
    scenarioMatch: /GDPR|DSAR|ICO/,
    icon: ScrollText,
  },
];

const STATUS_CLS: Record<Tile['status'], string> = {
  green: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-300 bg-amber-50 text-amber-900',
  red: 'border-rose-300 bg-rose-50 text-rose-900',
};

const STATUS_DOT: Record<Tile['status'], string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
};

function matchingScenarios(re: RegExp) {
  return sectionScenarios
    .filter((s) => {
      const meta = getScenarioMeta(s);
      const hay = [s.title, s.subtitle, ...meta.standards].join(' ');
      return re.test(hay);
    })
    .slice(0, 3);
}

export default function Compliance() {
  return (
    <div data-focus="page" className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <header>
        <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Compliance Cockpit</div>
        <h1 className="text-2xl font-bold text-ink">Regulatory posture · live</h1>
        <p className="text-sm text-ink-muted mt-1">UK telco regulatory surface in one screen. Each tile maps to scenarios that exercise the control.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {TILES.map((t) => {
          const Icon = t.icon;
          const hits = matchingScenarios(t.scenarioMatch);
          return (
            <div key={t.key} className={`vf-card p-4 border-l-4 ${STATUS_CLS[t.status]}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-ink text-sm leading-tight truncate">{t.title}</div>
                    <div className="text-[10.5px] uppercase tracking-wider text-ink-muted font-semibold">{t.authority}</div>
                  </div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[t.status]} mt-1`} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-ink font-mono">{t.metric}</span>
                <span className="text-[11px] text-ink-muted">{t.metricLabel}</span>
              </div>
              <div className="text-[11.5px] text-ink mt-1 leading-snug">{t.detail}</div>
              {hits.length > 0 && (
                <div className="mt-2 pt-2 border-t border-ink/10">
                  <div className="text-[9.5px] uppercase tracking-wider text-ink-muted font-bold mb-1">Tied scenarios</div>
                  <ul className="space-y-0.5">
                    {hits.map((s) => (
                      <li key={s.id} className="text-[11px] text-ink truncate">· {s.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="vf-card p-4 text-[12px] text-ink-muted">
        Snowflake primitives behind this view: <span className="font-semibold text-ink">Cortex Complete</span> drafts
        regulator-grade comms; <span className="font-semibold text-ink">Time Travel</span> gives 90-day reproducibility for
        IPA-LI; <span className="font-semibold text-ink">Horizon Catalog</span> + <span className="font-semibold text-ink">Tri-Secret Secure</span> govern access; <span className="font-semibold text-ink">Cortex Search</span> serves the audit-evidence trail. <Link to="/architecture" className="text-vfRed-dark underline">See blueprint →</Link>
      </div>
    </div>
  );
}
