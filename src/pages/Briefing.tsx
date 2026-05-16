import { Printer } from 'lucide-react';
import { primaryIncident } from '@/data/networkEvents';
import { customers, driverFor } from '@/data/customers';
import { cicForIncident } from '@/data/incidentToCic';
import { churnByCustomer } from '@/data/churn';
import { recommendedHeadline } from '@/data/offers';
import { useDemoState } from '@/state/DemoStateProvider';
import { nocKpis } from '@/data/nocKpis';
import { liveAgentRun } from '@/data/agentRuns';
import { scenarioById, SECTION_LABEL } from '@/data/sectionScenarios';
import { analyticsForScenario } from '@/data/analyticsByScenario';

export default function Briefing() {
  const { mode, selectedIncidentId, scenario } = useDemoState();
  const sc = scenarioById(selectedIncidentId);
  const isNoc = mode === 'noc' || sc?.sectionId === 'noc';
  const isGrowth = scenario.theme === 'growth';

  // Generic scenario-aware fields. Fall back to the legacy Manchester template
  // when no SectionScenario is active.
  const issueId = sc?.id ?? 'NET-INC-2026-0428-MAN-M14';
  const sectionLabel = sc ? SECTION_LABEL[sc.sectionId] : 'Customer Intelligence';
  const headerKicker = sc
    ? `${sectionLabel}${isGrowth ? ' · Growth Opportunity' : ''} · Executive Briefing`
    : (isNoc ? 'Network Operations · Executive Briefing' : 'Customer Intelligence Command Center · Executive Briefing');
  const briefingTitle = sc?.title ?? (isNoc
    ? 'Manchester M14 cluster degradation — agent-led closed-loop response'
    : 'Manchester M14 cell cluster degradation — 89 P1 customers at churn risk');
  const situation = sc?.subtitle ?? `A network telemetry anomaly was detected in Manchester postcode M14 at 09:31 affecting ${primaryIncident.cellSitesImpacted} cell sites across 4G and 5G. Average download speed fell from ${primaryIncident.averageDownloadSpeedBeforeMbps} Mbps to ${primaryIncident.averageDownloadSpeedAfterMbps} Mbps, dropped calls increased ${primaryIncident.droppedCallIncreasePct}%, and failed sessions ${primaryIncident.failedDataSessionIncreasePct}%. ${primaryIncident.impactedCustomers.toLocaleString()} customers were impacted; ${primaryIncident.highValueCustomers} of them are high-value, and ${primaryIncident.highChurnRiskCustomers} were re-scored to P1 churn-risk.`;

  // Action lines: pull the salient act/verify/resolve beats from the scenario,
  // otherwise fall back to the original Manchester action list.
  const scenarioActions = sc
    ? sc.events
        .filter((e) => e.kind === 'detect' || e.kind === 'plan' || e.kind.startsWith('act-') || e.kind === 'verify' || e.kind === 'resolve')
        .slice(0, 6)
        .map((e) => e.text)
    : null;

  // Per-CIC-scenario cohort framing (primary customer + scenario-relevant action +
  // descriptive driver + table title).
  const cicCohort: Record<string, {
    title: string;
    primary: string;
    driver: string;
    action: string;
    cohortNote: string;
    outcomes: string[];
  }> = {
    'cic-manchester-churn': {
      title: 'Top P1 save targets · Manchester M14 cohort',
      primary: 'CUST-001',
      driver: 'Network degradation (M14 cell cluster)',
      action: 'Proactive apology + £5 service credit + 10GB boost + plan refresh',
      cohortNote: '89 P1 customers in Manchester M14 — top ranked by CLV × risk reduction.',
      outcomes: [
        'Cohort risk: avg 79% → 47% (−32 pts) over the 5-min watch window',
        'CLV protected: ~£420k across 89 P1 customers',
        'Save actions dispatched: 89 (76 acknowledged in app within 4 min)',
        'No Ofcom auto-comp triggered (mitigation < 2h)',
      ],
    },
    'cic-birmingham-billshock': {
      title: 'Top P1 save targets · Birmingham bill-shock wave',
      primary: 'CUST-002',
      driver: 'Bill shock (post-Easter roaming, Roaming Pass not auto-enrolled)',
      action: 'Bill explanation + £4 goodwill credit + Roaming Pass auto-enrol (12mo)',
      cohortNote: '244 high-CLV from a 1,840-customer bill-shock cluster — outbound retention queued.',
      outcomes: [
        'Cohort risk: avg 71% → 48% (−23 pts) after explanation + enrolment',
        '1,840 customers auto-enrolled in Roaming Pass (12 mo)',
        '244 high-CLV outbound retention calls queued (Genesys)',
        'CLV protected: ~£180k · forecast bill-shock recurrence: 0',
      ],
    },
    'cic-leeds-snowflex': {
      title: 'Top retention targets · Leeds SnowFlex PAC cohort',
      primary: 'CUST-005',
      driver: 'Competitor tariff launch (PAC requested, price-sensitive)',
      action: '+30GB at same price + 6-month loyalty boost · in-app retention modal',
      cohortNote: '28 high-CLV from a 940-PAC SnowFlex cohort — competitor-driven, tariff-elastic.',
      outcomes: [
        'PAC continuations declined: 412 of 940 retained (44% vs 28% baseline)',
        'Save rate uplift: +16pp vs untreated control',
        'CLV protected: ~£94k across the SnowFlex cohort',
        'Offer ROI: 2.4× over 12-month CLV uplift (margin floor preserved)',
      ],
    },
    'cic-london-5g-upgrade': {
      title: 'Top upgrade targets · London E14 5G SA cohort',
      primary: 'CUST-004',
      driver: 'Upgrade propensity (5G handset, heavy data, legacy plan)',
      action: '5G SA Unlimited Max + £5 first-month credit · upgrade journey + retention call',
      cohortNote: '12,400 5G-capable customers eligible (handset + in-coverage + propensity > 0.6). 1,280 are high-CLV.',
      outcomes: [
        'Day-1: 1,420 upgraded (11.4% conversion) vs 4% baseline',
        'ARPU lift: +£15k/mo run-rate · forecast +£180k/yr',
        '1,280 high-CLV: pre-applied £5 credit + Genesys retention call',
        '11,408 reached across in-app + push + email upgrade journey',
      ],
    },
  };
  const cohort = sc ? cicCohort[sc.id] : undefined;

  // Synthetic cohort sample per scenario — the primary customer + a few realistic
  // peers from the actual cohort (not the global 6 customers, which would mix in
  // unrelated brands/cities). Each row stays small so it reads as a sample.
  type CohortRow = { name: string; brand: string; risk: number; driver: string; action: string };
  const cohortSamples: Record<string, CohortRow[]> = {
    'cic-manchester-churn': [
      { name: 'Aisha M.',      brand: 'SnowTelco Lite', risk: 78, driver: 'Network degradation', action: 'Apology + £5 credit + plan refresh' },
      { name: 'Tom W.',        brand: 'SnowTelco Lite', risk: 74, driver: 'Network degradation', action: 'Apology + £5 credit + 10GB boost' },
      { name: 'Priya R.',      brand: 'SnowTelco',      risk: 72, driver: 'Network degradation', action: 'Senior care callback + 10GB boost' },
      { name: 'James K.',      brand: 'SnowTelco Lite', risk: 71, driver: 'Network degradation', action: 'Apology + £5 credit + plan refresh' },
    ],
    'cic-birmingham-billshock': [
      { name: 'Yusuf A.',      brand: 'SnowTelco',      risk: 73, driver: 'Bill shock (roaming)', action: 'Bill explainer + Roaming Pass auto-enrol' },
      { name: 'Rachel B.',     brand: 'SnowTelco',      risk: 70, driver: 'Bill shock (roaming)', action: 'Bill explainer + £4 goodwill credit' },
      { name: 'Mohammed K.',   brand: 'SnowTelco',      risk: 68, driver: 'Bill shock (roaming)', action: 'Bill explainer + Roaming Pass auto-enrol' },
      { name: 'Emma S.',       brand: 'SnowTelco',      risk: 66, driver: 'Bill shock (roaming)', action: 'Bill explainer + Roaming Pass auto-enrol' },
    ],
    'cic-leeds-snowflex': [
      { name: 'Liam C.',       brand: 'SnowFlex',       risk: 71, driver: 'Competitor tariff launch', action: '+30GB boost + 6-mo loyalty lock' },
      { name: 'Olivia P.',     brand: 'SnowFlex',       risk: 67, driver: 'Competitor tariff launch', action: '+30GB boost + 6-mo loyalty lock' },
      { name: 'Daisy R.',      brand: 'SnowFlex',       risk: 65, driver: 'Competitor tariff launch', action: '+30GB boost + 6-mo loyalty lock' },
      { name: 'Noah F.',       brand: 'SnowFlex',       risk: 62, driver: 'Competitor tariff launch', action: '+30GB boost + 6-mo loyalty lock' },
    ],
    'cic-london-5g-upgrade': [
      { name: 'Sara D.',       brand: 'SnowTelco',      risk: 0,  driver: '5G upgrade propensity 0.81', action: '5G SA Unlimited Max + £5 credit' },
      { name: 'Marcus L.',     brand: 'SnowTelco',      risk: 0,  driver: '5G upgrade propensity 0.79', action: '5G SA Unlimited Max + £5 credit' },
      { name: 'Yara A.',       brand: 'SnowTelco',      risk: 0,  driver: '5G upgrade propensity 0.77', action: '5G SA Unlimited Max + £5 credit' },
      { name: 'Ethan H.',      brand: 'SnowTelco',      risk: 0,  driver: '5G upgrade propensity 0.74', action: '5G SA Unlimited Max + £5 credit' },
    ],
  };
  const sampleRows = sc ? cohortSamples[sc.id] ?? [] : [];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6 space-y-4">
      <header className="flex items-center justify-between no-print">
        <div>
          <div className={`text-xs uppercase tracking-wider font-bold ${isGrowth ? 'text-blue-700' : 'text-vfRed'}`}>Analytics</div>
          <h1 className="text-3xl font-extrabold text-ink">{isGrowth ? 'Growth Briefing' : 'Executive Briefing'}</h1>
          <p className="text-sm text-ink-muted">A printable one-page summary of the active scenario and recommended actions.</p>
        </div>
        <button onClick={() => window.print()} className="vf-btn-primary">
          <Printer className="w-4 h-4" /> Print to PDF
        </button>
      </header>

      <div className="vf-card p-8 print-page">
        <div className="flex items-start justify-between border-b border-mist-dark pb-4 mb-4">
          <div>
            <img src="https://companieslogo.com/img/orig/SNOW-35164165.png?t=1751096598" alt="SnowTelco" className="h-10 mb-2" />
            <div className="text-xs uppercase tracking-wider text-ink-muted font-bold">{headerKicker}</div>
          </div>
          <div className="text-right text-xs text-ink-muted">
            <div>Date: 8 May 2026</div>
            <div>Issue: {issueId}</div>
            <div>Author: Customer Intelligence Ops</div>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-ink">{briefingTitle}</h2>

        {isNoc && !sc && (
          <section className="mt-4">
            <h3 className="vf-section-title">NOC KPIs</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {nocKpis.slice(0, 4).map((k) => (
                <div key={k.id} className="rounded-lg border border-mist-dark p-2">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{k.label}</div>
                  <div className="text-lg font-extrabold text-ink font-mono tabular-nums">{k.value}{k.unit ?? ''}</div>
                  {k.delta && <div className="text-[10px] text-ink-muted">{k.delta}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4">
          <h3 className="vf-section-title">Situation</h3>
          <p className="text-sm text-ink mt-1">{situation}</p>
        </section>

        <AtAGlance scenarioId={scenario.id} isGrowth={isGrowth} sectionId={sc?.sectionId} digitalScenarioId={sc?.id} />

        <section className="mt-4">
          <h3 className="vf-section-title">{isNoc ? 'Agent-led actions' : 'Action taken'}</h3>
          <ul className="list-disc list-inside text-sm text-ink mt-1 space-y-0.5">
            {scenarioActions ? (
              scenarioActions.map((line, i) => <li key={i}>{line}</li>)
            ) : isNoc ? (
              <>
                <li>Agent {liveAgentRun.id} opened at 09:31:18 — observe → hypothesize → plan within 44 seconds.</li>
                <li>Capacity rebalance MAN-02 → MAN-01 (T1, reversible) approved by NOC engineer.</li>
                <li>ServiceNow change INC0012987 auto-drafted with KPI/alarm evidence pack.</li>
                <li>Care orchestrator notified for {primaryIncident.highChurnRiskCustomers} P1 customers.</li>
              </>
            ) : (
              <>
                <li>RAN/backhaul investigation escalated; temporary capacity rebalancing applied.</li>
                <li>Proactive apology + £5 loyalty credit + retention plan refresh dispatched to 89 P1 customers.</li>
                <li>Service credit £5 queued for all {primaryIncident.impactedCustomers.toLocaleString()} affected customers.</li>
                <li>Senior care callback scheduled for customers with open complaints.</li>
              </>
            )}
          </ul>
        </section>

        {!sc || sc.sectionId === 'cic' ? (
          <section className="mt-4">
            <h3 className="vf-section-title">{cohort?.title ?? 'Top 5 P1 customers'}</h3>
            {cohort && <p className="text-[11px] text-ink-muted mt-1">{cohort.cohortNote}</p>}
            <table className="w-full text-xs mt-2 border border-mist-dark">
              <thead className="bg-mist">
                <tr>
                  <th className="text-left px-2 py-1 border-r border-mist-dark">Customer</th>
                  <th className="text-left px-2 py-1 border-r border-mist-dark">Brand</th>
                  <th className="text-left px-2 py-1 border-r border-mist-dark">{sc?.id === 'cic-london-5g-upgrade' ? 'Propensity' : 'Risk'}</th>
                  <th className="text-left px-2 py-1 border-r border-mist-dark">Driver</th>
                  <th className="text-left px-2 py-1">Recommended action</th>
                </tr>
              </thead>
              <tbody>
                {/* Primary customer row from the global dataset, marked ★ */}
                {(() => {
                  if (!cohort) {
                    return customers.slice(0, 5).map((c) => {
                      const churn = churnByCustomer(c.id);
                      return (
                        <tr key={c.id} className="border-t border-mist-dark">
                          <td className="px-2 py-1 border-r border-mist-dark font-bold">{c.name}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{c.brand}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{churn.churnRisk}%</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{c.mainDriver}</td>
                          <td className="px-2 py-1">{recommendedHeadline[c.id]}</td>
                        </tr>
                      );
                    });
                  }
                  const primary = customers.find((c) => c.id === cohort.primary);
                  const primaryChurn = primary ? churnByCustomer(primary.id) : null;
                  const isGrowth = sc?.id === 'cic-london-5g-upgrade';
                  return (
                    <>
                      {primary && (
                        <tr key={primary.id} className={`border-t border-mist-dark ${isGrowth ? 'bg-blue-50' : 'bg-vfRed-soft/30'}`}>
                          <td className="px-2 py-1 border-r border-mist-dark font-bold">{primary.name} ★</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{primary.brand}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{isGrowth ? '0.78' : `${primaryChurn?.churnRisk ?? '?'}%`}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{cohort.driver}</td>
                          <td className="px-2 py-1">{cohort.action}</td>
                        </tr>
                      )}
                      {sampleRows.map((r, i) => (
                        <tr key={`sample-${i}`} className="border-t border-mist-dark">
                          <td className="px-2 py-1 border-r border-mist-dark font-bold">{r.name}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{r.brand}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{isGrowth ? r.driver.match(/0\.\d+/)?.[0] ?? '—' : `${r.risk}%`}</td>
                          <td className="px-2 py-1 border-r border-mist-dark">{r.driver}</td>
                          <td className="px-2 py-1">{r.action}</td>
                        </tr>
                      ))}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="mt-4 grid grid-cols-2 gap-3">
          <Box title="Projected outcomes">
            <ul className="text-sm text-ink space-y-0.5 list-disc list-inside">
              {cohort ? (
                cohort.outcomes.map((o, i) => <li key={i}>{o}</li>)
              ) : sc ? (
                <>
                  {(() => {
                    const resolveEv = sc.events.find((e) => e.kind === 'resolve');
                    const verifyEv = sc.events.find((e) => e.kind === 'verify');
                    return (
                      <>
                        {verifyEv && <li>{verifyEv.text}</li>}
                        {resolveEv && <li>{resolveEv.text}</li>}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  <li>Cohort risk: 79% → 47% (–32 pts)</li>
                  <li>CLV protected: £93,640</li>
                  <li>Care volume avoided: ~1,500 contacts</li>
                </>
              )}
            </ul>
          </Box>
          <Box title="Next steps">
            <ul className="text-sm text-ink space-y-0.5">
              <li>Monitor outcome KPIs over the next 14 days</li>
              <li>Close any open complaints before further commercial offers</li>
              <li>Review uplift in 30 days for model retraining</li>
            </ul>
          </Box>
        </section>

        <div className="mt-6 pt-4 border-t border-mist-dark text-[10px] text-ink-muted">
          Generated by SnowTelco Customer Intelligence Command Center · Snowflake-native data and AI · governed by consent, masking, and access policies.
        </div>
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-mist-dark p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">{title}</div>
      {children}
    </div>
  );
}

// Print-safe inline-SVG outcome bars + driver donut, scenario-themed.
function AtAGlance({ scenarioId, isGrowth, sectionId, digitalScenarioId }: { scenarioId: string; isGrowth: boolean; sectionId?: string; digitalScenarioId?: string }) {
  // Digital section gets its own outcome surface (deflection / save / activation
  // / attach metrics) instead of CIC's CLV-based one.
  if (sectionId === 'digital' && digitalScenarioId && DIGITAL_OUTCOMES[digitalScenarioId]) {
    const d = DIGITAL_OUTCOMES[digitalScenarioId];
    return (
      <section className="mt-4 grid grid-cols-2 gap-3">
        <Box title="Outcome at a glance">
          <div className="space-y-2 mt-1">
            {d.bars.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <div className="w-44 text-[11px] text-ink truncate">{b.label}</div>
                <div className="flex-1 h-4 bg-mist rounded-sm relative overflow-hidden">
                  <div style={{ width: `${b.pct}%`, background: b.color }} className="h-full" />
                </div>
                <div className="w-20 text-right text-[11px] font-mono font-bold text-ink tabular-nums">{b.value}</div>
              </div>
            ))}
          </div>
        </Box>
        <Box title="Channel mix">
          <ul className="text-[11px] text-ink space-y-1 mt-1">
            {d.channels.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />
                <span className="font-semibold truncate">{c.label}</span>
                <span className="text-ink-muted ml-auto font-mono">{c.value}</span>
              </li>
            ))}
          </ul>
        </Box>
      </section>
    );
  }
  const a = analyticsForScenario(scenarioId);
  const max = Math.max(...a.outcomeBars.map((b) => b.value));
  const drivers = a.topDriversForDonut;
  const total = drivers.reduce((s, d) => s + d.share, 0);
  const colors = isGrowth
    ? ['#2563EB', '#3B82F6', '#60A5FA', '#BFDBFE']
    : ['#29B5E8', '#0EA5E9', '#10B981', '#9CA3AF'];

  // Build donut slices as SVG paths (single donut radius 16, ring 8)
  const cx = 50, cy = 50, r = 38, ir = 22;
  let acc = 0;
  const slices = drivers.map((d, i) => {
    const startAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.share;
    const endAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(startAngle) * r;
    const y1 = cy + Math.sin(startAngle) * r;
    const x2 = cx + Math.cos(endAngle) * r;
    const y2 = cy + Math.sin(endAngle) * r;
    const x3 = cx + Math.cos(endAngle) * ir;
    const y3 = cy + Math.sin(endAngle) * ir;
    const x4 = cx + Math.cos(startAngle) * ir;
    const y4 = cy + Math.sin(startAngle) * ir;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${large} 0 ${x4} ${y4} Z`, color: colors[i] ?? '#9CA3AF', label: d.driver, share: d.share };
  });

  const fmtCurrency = (v: number) => v >= 1000 ? `£${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `£${v}`;

  return (
    <section className="mt-4 grid grid-cols-2 gap-3">
      <Box title={isGrowth ? 'ARPU lift at a glance' : 'Outcome at a glance'}>
        <div className="space-y-2 mt-1">
          {a.outcomeBars.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <div className="w-44 text-[11px] text-ink truncate">{b.label}</div>
              <div className="flex-1 h-4 bg-mist rounded-sm relative overflow-hidden">
                <div style={{ width: `${(b.value / max) * 100}%`, background: b.color }} className="h-full" />
              </div>
              <div className="w-16 text-right text-[11px] font-mono font-bold text-ink tabular-nums">{fmtCurrency(b.value)}</div>
            </div>
          ))}
        </div>
      </Box>
      <Box title="Top drivers (share)">
        <div className="flex items-center gap-3 mt-1">
          <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
            {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
          </svg>
          <ul className="text-[11px] text-ink space-y-1 min-w-0">
            {slices.map((s) => (
              <li key={s.label} className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
                <span className="font-semibold truncate">{s.label}</span>
                <span className="text-ink-muted ml-auto font-mono">{s.share}%</span>
              </li>
            ))}
          </ul>
        </div>
      </Box>
    </section>
  );
}

const DIGITAL_OUTCOMES: Record<string, { bars: { label: string; value: string; pct: number; color: string }[]; channels: { label: string; value: string; color: string }[] }> = {
  'dig-care-chat-deflection': {
    bars: [
      { label: 'Chats deflected (no human)', value: '28,680',  pct: 100, color: '#10B981' },
      { label: 'Avg resolution time',        value: '2:14',    pct: 35,  color: '#11567F' },
      { label: 'Cost per chat',              value: '£15',     pct: 25,  color: '#F59E0B' },
      { label: 'Vs human handle cost',       value: '£42',     pct: 70,  color: '#9CA3AF' },
    ],
    channels: [
      { label: 'In-conversation only',  value: '42,180/day', color: '#11567F' },
      { label: 'SMS follow-up',         value: 'queued',     color: '#F59E0B' },
    ],
  },
  'dig-voice-save-cancel': {
    bars: [
      { label: 'CLV protected',         value: '£480',  pct: 100, color: '#10B981' },
      { label: 'AHT vs baseline',       value: '1:01',  pct: 23,  color: '#11567F' },
      { label: 'WER',                   value: '3.4%',  pct: 12,  color: '#9CA3AF' },
      { label: 'Save rate',             value: '71%',   pct: 71,  color: '#11567F' },
    ],
    channels: [
      { label: 'Voice (the call)',         value: '1',  color: '#E11D48' },
      { label: 'SMS confirmation',         value: '1',  color: '#F59E0B' },
      { label: 'Email summary',            value: '1',  color: '#11567F' },
    ],
  },
  'dig-esim-activation-funnel': {
    bars: [
      { label: 'eSIMs activated',           value: '16,450', pct: 100, color: '#10B981' },
      { label: 'Funnel completion',         value: '87%',    pct: 87,  color: '#11567F' },
      { label: 'Drop-off recovered',        value: '412',    pct: 33,  color: '#F59E0B' },
      { label: 'Physical SIM cost saved',   value: '£32k',   pct: 60,  color: '#10B981' },
    ],
    channels: [
      { label: 'In-app journey',         value: '18,420', color: '#11567F' },
      { label: 'Recovery push',          value: '1,250',  color: '#F59E0B' },
      { label: 'Voice callback',         value: '412',    color: '#E11D48' },
    ],
  },
  'dig-roaming-push': {
    bars: [
      { label: 'Roaming Pass enrolled',     value: '612',    pct: 100, color: '#10B981' },
      { label: 'Conversion rate',           value: '16.5%',  pct: 50,  color: '#11567F' },
      { label: 'ARPU lift / wk',            value: '£12.8k', pct: 80,  color: '#10B981' },
      { label: 'Bill-shock cases avoided',  value: '~480',   pct: 70,  color: '#9CA3AF' },
    ],
    channels: [
      { label: 'App push',           value: '3,720', color: '#11567F' },
      { label: 'Email',              value: '3,720', color: '#F59E0B' },
      { label: 'RCS confirmation',   value: '612',   color: '#10B981' },
    ],
  },
  'dig-marketplace-bundle': {
    bars: [
      { label: 'Disney+ attached',          value: '2,180',  pct: 100, color: '#10B981' },
      { label: 'Conversion rate',           value: '27%',    pct: 50,  color: '#11567F' },
      { label: 'Revenue / mo',              value: '£19.6k', pct: 80,  color: '#10B981' },
      { label: 'Lift vs holdout',           value: '+18.4pp', pct: 70, color: '#11567F' },
    ],
    channels: [
      { label: 'In-app modal',         value: '7,980', color: '#11567F' },
      { label: 'Confirmation email',   value: '2,180', color: '#F59E0B' },
    ],
  },
  'dig-appstore-rating-watch': {
    bars: [
      { label: 'Sentiment recovered',         value: '+0.21',     pct: 100, color: '#10B981' },
      { label: 'Cohort intercepted',          value: '18,400',    pct: 80,  color: '#11567F' },
      { label: 'NPS uplift',                  value: '+0.18',     pct: 60,  color: '#10B981' },
      { label: 'Store rating retained',       value: '4.6 → 4.6', pct: 50,  color: '#9CA3AF' },
    ],
    channels: [
      { label: 'In-app intercept',     value: '18,400', color: '#11567F' },
      { label: 'Resolution email',     value: '4,200',  color: '#F59E0B' },
    ],
  },
  'dig-web-checkout-abandon': {
    bars: [
      { label: 'Carts recovered',          value: '612',     pct: 100, color: '#10B981' },
      { label: 'Recovery rate',            value: '34%',     pct: 70,  color: '#11567F' },
      { label: 'Revenue recovered',        value: '£92k',    pct: 90,  color: '#10B981' },
      { label: 'CAC saved',                value: '£34k',    pct: 60,  color: '#9CA3AF' },
    ],
    channels: [
      { label: 'SMS recovery',         value: '1,820', color: '#F59E0B' },
      { label: 'Email recovery',       value: '1,820', color: '#11567F' },
      { label: 'App push',             value: '760',   color: '#10B981' },
      { label: 'RCS rich card',        value: '240',   color: '#E11D48' },
    ],
  },
  'dig-vulnerable-care-routing': {
    bars: [
      { label: 'Vulnerability classified',  value: '0.97',     pct: 97,  color: '#10B981' },
      { label: 'Bill paused',               value: '30 days',  pct: 60,  color: '#F59E0B' },
      { label: 'Commercial offers blocked', value: '12 mo',    pct: 90,  color: '#9CA3AF' },
      { label: 'CSAT',                      value: '0.92',     pct: 92,  color: '#10B981' },
    ],
    channels: [
      { label: 'Specialist callback', value: '1', color: '#E11D48' },
      { label: 'Payment-plan email',  value: '1', color: '#11567F' },
    ],
  },
  'dig-fcr-prediction': {
    bars: [
      { label: 'Chats served',              value: '6,200',     pct: 100, color: '#10B981' },
      { label: 'FCR overall',               value: '78%',       pct: 78,  color: '#11567F' },
      { label: 'Escalation cost saved',     value: '£12k/h',    pct: 70,  color: '#10B981' },
      { label: 'Vulnerability false-pos',   value: '0.4%',      pct: 5,   color: '#9CA3AF' },
    ],
    channels: [
      { label: 'In-bot',          value: '4,180', color: '#11567F' },
      { label: 'Assist mode',     value: '1,420', color: '#F59E0B' },
      { label: 'Specialist',      value: '600',   color: '#E11D48' },
    ],
  },
  'dig-app-fraud-signup': {
    bars: [
      { label: 'Fraud loss avoided',        value: '£42k',     pct: 100, color: '#10B981' },
      { label: 'Synthetic confirmed',       value: '12 of 14', pct: 86,  color: '#E11D48' },
      { label: 'False-block by review',     value: '0',        pct: 0,   color: '#9CA3AF' },
      { label: 'SIMs not provisioned',      value: '16',       pct: 70,  color: '#11567F' },
    ],
    channels: [
      { label: 'KYC step-up SMS',     value: '18', color: '#F59E0B' },
      { label: 'Step-up push',        value: '14', color: '#11567F' },
      { label: 'Confirmation email',  value: '18', color: '#10B981' },
    ],
  },
  'dig-campaign-launch-lookalike': {
    bars: [
      { label: 'Conversions',                 value: '27,400', pct: 100, color: '#10B981' },
      { label: 'Holdout uplift',              value: '+6.4pp', pct: 64,  color: '#11567F' },
      { label: 'ROAS',                        value: '4.6x',   pct: 80,  color: '#10B981' },
      { label: 'Spend used',                  value: '£184k',  pct: 58,  color: '#F59E0B' },
    ],
    channels: [
      { label: 'In-app',     value: '232k', color: '#11567F' },
      { label: 'Email',      value: '232k', color: '#F59E0B' },
      { label: 'RCS',        value: '108k', color: '#10B981' },
    ],
  },
  'dig-attribution-rebalance': {
    bars: [
      { label: 'Portfolio ROAS lift',         value: '+0.4x',  pct: 80,  color: '#10B981' },
      { label: 'Incremental revenue',         value: '£82k/mo', pct: 90, color: '#11567F' },
      { label: 'Spend reallocated',           value: '£180k',  pct: 60,  color: '#F59E0B' },
      { label: 'Brand-safety regressions',    value: '0',      pct: 0,   color: '#9CA3AF' },
    ],
    channels: [
      { label: 'Paid social (capped)',  value: '−£180k', color: '#E11D48' },
      { label: 'Retargeting',           value: '+£90k',  color: '#11567F' },
      { label: 'RCS',                   value: '+£60k',  color: '#10B981' },
      { label: 'Email',                 value: '+£30k',  color: '#F59E0B' },
    ],
  },
  'dig-competitor-counter': {
    bars: [
      { label: 'CLV protected',         value: '£94k',  pct: 100, color: '#10B981' },
      { label: 'Customers retained',    value: '412',   pct: 44,  color: '#11567F' },
      { label: 'Save uplift vs control', value: '+16pp', pct: 60, color: '#10B981' },
      { label: 'Time to live creative', value: '22 min', pct: 30, color: '#F59E0B' },
    ],
    channels: [
      { label: 'In-app',     value: '940', color: '#11567F' },
      { label: 'SMS',        value: '940', color: '#F59E0B' },
    ],
  },
  'dig-winback-lapsed': {
    bars: [
      { label: 'Customers returned',    value: '2,420', pct: 100, color: '#10B981' },
      { label: 'CLV recovered',         value: '£384k', pct: 95,  color: '#11567F' },
      { label: 'ARPU lift / mo',        value: '£42k',  pct: 70,  color: '#10B981' },
      { label: 'Holdout uplift',        value: '+4.9pp', pct: 49, color: '#F59E0B' },
    ],
    channels: [
      { label: 'Email',  value: '8,200', color: '#11567F' },
      { label: 'Push',   value: '4,180', color: '#F59E0B' },
      { label: 'SMS',    value: '2,540', color: '#10B981' },
    ],
  },
  'dig-anniversary-loyalty': {
    bars: [
      { label: 'Reward acceptances',    value: '4,640', pct: 100, color: '#10B981' },
      { label: 'CSAT lift',             value: '+0.6',  pct: 60,  color: '#11567F' },
      { label: 'Disney+ trials',        value: '1,420', pct: 70,  color: '#F59E0B' },
      { label: 'ARPU lift / mo',        value: '£18k',  pct: 50,  color: '#10B981' },
    ],
    channels: [
      { label: 'Push',   value: '12,200', color: '#11567F' },
      { label: 'Email',  value: '12,200', color: '#F59E0B' },
    ],
  },
  'dig-refer-a-friend': {
    bars: [
      { label: 'New customers',         value: '612',   pct: 100, color: '#10B981' },
      { label: 'LTV created',           value: '£94k',  pct: 90,  color: '#11567F' },
      { label: 'Viral coefficient',     value: '0.42',  pct: 42,  color: '#F59E0B' },
      { label: 'CAC saved',             value: '£38k',  pct: 60,  color: '#10B981' },
    ],
    channels: [
      { label: 'Email',  value: '8,400', color: '#11567F' },
      { label: 'Push',   value: '8,400', color: '#F59E0B' },
    ],
  },
  'dig-decisioning-trace': {
    bars: [
      { label: 'P95 latency',           value: '41ms',  pct: 95, color: '#10B981' },
      { label: 'Explainable',           value: '94.2%', pct: 94, color: '#11567F' },
      { label: 'Override rate',         value: '0.8%',  pct: 92, color: '#10B981' },
      { label: 'CSAT prediction',       value: '0.86',  pct: 86, color: '#F59E0B' },
    ],
    channels: [
      { label: 'In-bot', value: '1', color: '#11567F' },
    ],
  },
  'dig-voc-theme-drift': {
    bars: [
      { label: 'Cohort intercepted',    value: '18.4k', pct: 100, color: '#10B981' },
      { label: 'FAQ deflected',         value: '8,940', pct: 49,  color: '#11567F' },
      { label: 'Sentiment recovery',    value: '+0.21', pct: 70,  color: '#F59E0B' },
      { label: 'Store rating',          value: '4.6 ✓', pct: 92,  color: '#10B981' },
    ],
    channels: [
      { label: 'In-app', value: '18,400', color: '#29B5E8' },
      { label: 'Email',  value: '12,200', color: '#11567F' },
    ],
  },
  'dig-experiment-rollout': {
    bars: [
      { label: 'Uplift (causal)',       value: '+6.4pp', pct: 100, color: '#10B981' },
      { label: 'P(uplift > 0)',         value: '98.8%',  pct: 99,  color: '#11567F' },
      { label: 'Ramp',                  value: '100%',   pct: 100, color: '#10B981' },
      { label: 'Guardrail breach',      value: '0',      pct: 100, color: '#10B981' },
    ],
    channels: [
      { label: 'App',   value: '232k', color: '#11567F' },
      { label: 'Email', value: '232k', color: '#F59E0B' },
      { label: 'RCS',   value: '232k', color: '#10B981' },
    ],
  },
  'dig-martech-sync-lag': {
    bars: [
      { label: 'Sync recovered',        value: 'P95 38s', pct: 92, color: '#10B981' },
      { label: 'Retry queue drained',   value: '2:48',    pct: 80, color: '#11567F' },
      { label: 'Failed deliveries',     value: '0',       pct: 100, color: '#10B981' },
      { label: 'Sends preserved',       value: '232k',    pct: 100, color: '#10B981' },
    ],
    channels: [
      { label: 'Salesforce MC', value: '232k', color: '#11567F' },
    ],
  },
  'dig-price-test': {
    bars: [
      { label: 'Attach uplift',         value: '+4.2pp', pct: 100, color: '#10B981' },
      { label: 'Margin floor',          value: '31.4%',  pct: 92,  color: '#11567F' },
      { label: 'Revenue lift',          value: '+£42k/mo', pct: 84, color: '#10B981' },
      { label: 'p-value',               value: '0.006',  pct: 96,  color: '#10B981' },
    ],
    channels: [
      { label: 'Pricing engine', value: '1', color: '#11567F' },
    ],
  },
  'dig-selfservice-kb-gap': {
    bars: [
      { label: 'KB hit-rate',           value: '+14pp', pct: 80, color: '#10B981' },
      { label: 'Containment',           value: '+4pp',  pct: 70, color: '#11567F' },
      { label: 'FCR',                   value: '+2pp',  pct: 65, color: '#F59E0B' },
      { label: 'Sessions resolved',     value: '412',   pct: 67, color: '#10B981' },
    ],
    channels: [
      { label: 'KB',   value: '1', color: '#11567F' },
      { label: 'App',  value: '1', color: '#F59E0B' },
    ],
  },
  'dig-privacy-dsar-surge': {
    bars: [
      { label: 'Cases closed (48h)',    value: '12 / 18', pct: 66, color: '#10B981' },
      { label: 'ICO breaches',          value: '0',       pct: 100, color: '#10B981' },
      { label: 'Avg age (after)',       value: '1.6d',    pct: 80, color: '#11567F' },
      { label: 'Vulnerability re-route', value: '2',      pct: 100, color: '#10B981' },
    ],
    channels: [
      { label: 'DPO',   value: '14', color: '#11567F' },
      { label: 'Legal', value: '4',  color: '#F59E0B' },
    ],
  },
  'dig-forecast-surge': {
    bars: [
      { label: 'Surge absorbed',        value: '+148%',  pct: 100, color: '#10B981' },
      { label: 'P95 wait',              value: '1:42',   pct: 86,  color: '#11567F' },
      { label: 'WFM gap closed',        value: '+18 FTE',pct: 100, color: '#10B981' },
      { label: 'MAPE',                  value: '5.8%',   pct: 92,  color: '#10B981' },
    ],
    channels: [
      { label: 'Chat',  value: '6,000', color: '#11567F' },
      { label: 'Voice', value: '1,800', color: '#F59E0B' },
    ],
  },
  'dig-identity-sim-swap': {
    bars: [
      { label: 'ATO blocked',           value: '1 / 1',  pct: 100, color: '#10B981' },
      { label: 'Risk score',            value: '0.94',   pct: 94,  color: '#E11D48' },
      { label: 'False-block',           value: '0',      pct: 100, color: '#10B981' },
      { label: 'Case opened',           value: 'FRD-7488', pct: 100, color: '#11567F' },
    ],
    channels: [
      { label: 'MFA biometric', value: '1', color: '#10B981' },
      { label: 'SMS',           value: '1', color: '#F59E0B' },
    ],
  },
};
