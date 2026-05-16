import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoState } from '@/state/DemoStateProvider';
import { scenarios } from '@/data/scenarios';
import { SHORTCUT_LIST } from '@/lib/useKeyboard';
import { Moon, Sun, Volume2, VolumeX, Mic, MicOff, Settings as Cog, BookOpen, ArrowRight, Radio, ShieldAlert, Globe, Zap, ThermometerSun, Network, Bot, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoverageBars } from '@/components/shared/CoverageBars';
import { coverageRowFor, LEVEL_LABEL } from '@/data/scenarioCoverage';
import { sectionScenarios, SECTION_LABEL } from '@/data/sectionScenarios';

const DEMO_TO_INCIDENT: Record<string, string> = {
  'manchester': 'NET-INC-2026-0428-MAN-M14',
  'liverpool': 'NET-INC-2026-0508-LIV-L1',
  'leeds': 'NET-INC-2026-0508-LDS-LS2',
  'london-hss': 'NET-INC-2026-0508-LDN-HSS',
  'sim-swap': 'SEC-INC-2026-0508-SIMSWAP-CUST-002',
  'roaming': 'NET-INC-2026-0508-ROAMING-VPN-A',
  'mass-simswap': 'SEC-INC-2026-0508-MASS-SIMSWAP',
  'tower-mains': 'NET-INC-2026-0508-NYK-MAINS',
};

type Tab = 'config' | 'demos';

interface DemoEntry {
  id: string;
  kicker: string;
  title: string;
  domains: string[];
  duration: string;
  priority: 'P1' | 'P2' | 'P3';
  icon: React.ComponentType<{ className?: string }>;
  storyline: string;
  rootCause: string;
  detection: string[];
  reasoning: string[];
  actions: string[];
  outcome: string[];
  toolCalls: string[];
  governance: string[];
  link?: string;
  linkLabel?: string;
}

const demos: DemoEntry[] = [
  {
    id: 'manchester',
    kicker: 'NOC · RAN',
    title: 'Manchester M14 — RAN cluster congestion',
    domains: ['NOC', 'OSS', 'BSS', 'CIC'],
    duration: '34s',
    priority: 'P1',
    icon: Radio,
    storyline: 'Peak-period demand spike + degraded backhaul on cluster MAN-01 (Rusholme/Fallowfield/Moss Side, dense student SIM area). 7 cells flagged, 2,417 customers impacted, 89 P1 churn-risk identified.',
    rootCause: 'PRB utilisation 96% sustained 90s · Active UE +180% vs baseline · scheduler delay p95 4.8ms · BH circuit MAN-01-BH-2 packet loss 4.1%.',
    detection: [
      'EMS alarm storm via Ericsson ENM (47 alarms across MAN-01)',
      'Probe (Polystar) RTP MOS 4.1 → 3.4 in cluster',
      'CDR: failed-session count +42% in M14',
      'GTP-U packet drops on S1-U gNB-MAN-M14-A: 0.9%',
    ],
    reasoning: [
      'Pattern matches 4 prior MAN-01 incidents (Apr-25, Jul-25, Nov-25, Feb-26)',
      'Vendor RAN telemetry confirms BBU-MAN-01-A scheduler saturation',
      'Confidence 88% (vendor data + historical match + current signal)',
    ],
    actions: [
      'MLB intra-cluster: −3dB offset on cell 234-15-90412-3, target neighbour …-7',
      'Activate secondary carrier band n1 (+180 MHz, +35% capacity)',
      'ServiceNow standard change CHG0012987 (CAB pre-approved)',
      'Care orchestrator: pre-approved playbook PB-RT-CRED-005 to 89 P1 customers',
    ],
    outcome: [
      'Service restored · MTTR-mitigation 7m24s · 0 SLA breaches',
      'Cohort risk 79% → 47%',
      '2,417 service credits queued · CHG0012987 awaiting PIR',
    ],
    toolCalls: [
      'snowflake.cell_kpis(window=15m, cluster=MAN-01)',
      'memory.similar_incidents(top=4)',
      'simulate.mlb_handover_offset(...)',
      'ran.apply_mlb · ran.activate_carrier · servicenow.create_change · care.push_playbook',
    ],
    governance: ['GDPR Art.22 audit trail', 'CAB pre-approved (standard change)', 'Ofcom service credit policy'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'liverpool',
    kicker: 'NOC · RAN HW',
    title: 'Liverpool L1 — gNB thermal alarm',
    domains: ['NOC', 'OSS'],
    duration: '24s',
    priority: 'P2',
    icon: ThermometerSun,
    storyline: 'Single-site thermal incident on gNB-LIV-L1-A (Liverpool city centre). Internal board temperature breached 75°C threshold; vendor EnergyController auto-throttled to 70% PRB cap. 421 customers presenting at the cell.',
    rootCause: 'Cabinet fan-controller intermittent — same failure signature as 3 prior incidents on the same gNB (vendor TSB-2024-117).',
    detection: [
      'Vendor RAN OAM (Ericsson) BoardTemp alarm: BBU-LIV-L1-A board 7',
      'EnergyController auto-throttle: PRB cap 100% → 70%',
      'CDR: failed sessions +19%, drop rate +14% (single cell)',
    ],
    reasoning: [
      'Pattern matches 3 historical thermal incidents on same gNB (all auto-resolved by FCT cycle)',
      'Cabinet AC reports 22°C ambient (normal) — fault isolated to fan-controller',
      'Confidence 94%',
    ],
    actions: [
      'Hold throttle (masking 88% capacity loss)',
      'Field-tech dispatched (skill=RAN_HW, ETA 45m) for fan replacement',
      'Schedule rolling restart in 02:00–03:00 maintenance window',
    ],
    outcome: [
      'Service restored · MTTR-mitigation 4m12s',
      'MTTR-closure pending field-tech (32m) — incident remains OPEN',
      '0 customer comms required (single-cell soft impact)',
    ],
    toolCalls: ['memory.similar_incidents(asset=gNB-LIV-L1-A, type=thermal)', 'cortex.search.kb("gNB thermal fan-controller")', 'fieldforce.dispatch'],
    governance: ['Pre-approved maintenance window', 'Audit trail recorded'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'leeds',
    kicker: 'NOC · Transport',
    title: 'Leeds LS2 — IPRAN ring fault',
    domains: ['NOC', 'OSS'],
    duration: '40s',
    priority: 'P2',
    icon: Network,
    storyline: 'BFD session down + OSPF flap on vendor-A circuit LS-RING-2 (Leeds central). Transport-layer fault suspected — fibre splice at MH-LS-417, ~3.2 km from PE-LDS-2. 612 customers across 3 sites affected.',
    rootCause: 'Vendor-A fibre splice fault on circuit LS-RING-2 (PE-LDS-2 ↔ PE-LDS-3); OTDR self-test localises discontinuity at 3.2 km.',
    detection: [
      'BFD session BFD-LS-RING-2-PE2 down (3 of 5 hellos missed)',
      'OSPF flap on PE-LDS-2 ↔ PE-LDS-3 link',
      '64 alarms in 12s across 3 sites (Cisco IOS-XR + Juniper MX)',
      '3.4% packet loss on primary path',
    ],
    reasoning: [
      'No high-confidence historical match — atypical pattern',
      'Loss localised to span PE-LDS-2 ↔ PE-LDS-3 (vendor-A only)',
      'Confidence 84% — vendor escalation needed',
    ],
    actions: [
      'MPLS LSP reroute to secondary ring LS-RING-3 (T2, transport CAB approved)',
      'Vendor-A P1 ticket VND-2026-0508-A0142 raised',
      'Targeted Care comms — 612 customers · pre-approved playbook PB-RT-TRP-003',
    ],
    outcome: [
      'Service restored on secondary ring · MTTR-mitigation 11m36s',
      '+18ms latency penalty for diversity, 0 drops',
      '1 SLA breach · vendor RCA mandatory · MTTR-closure pending splice repair (~3h)',
    ],
    toolCalls: ['snowflake.transport_loss(circuit=LS-RING-2)', 'simulate.mpls_lsp_reroute', 'transport.lsp_reroute', 'servicenow.escalate(vendor=A)'],
    governance: ['Transport CAB approval (T2)', 'Ofcom auto-comp rule evaluated (<2h → ineligible)'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'london-hss',
    kicker: 'NOC · IMS Core',
    title: 'London IMS — HSS Diameter session storm',
    domains: ['NOC', 'OSS', 'BSS', 'CIC', 'Digital'],
    duration: '36s',
    priority: 'P1',
    icon: Bot,
    storyline: 'IMS registration failure rate 12% on P-CSCF cluster LDN-PCSCF-01 (Mavenir) — VoLTE service-affecting for 1.42M attached subscribers across London + South-East. Ofcom-notifiable major incident.',
    rootCause: 'Stale Diameter session leak after MME-LDN-2 failover at 09:24; HSS S6a session table at 96% capacity causing IMS registration storm.',
    detection: [
      'IMS reg failure rate 12% (baseline 0.4%) on LDN-PCSCF-01',
      'HSS-LDN-A response latency p99 480ms (SLA 50ms) · S6a/Cx Diameter peer flapping',
      'SRVCC handover failures +220%',
      '142 alarms in 18s across IMS core (Mavenir + Oracle USPL)',
    ],
    reasoning: [
      '1 high-confidence historical match (LDN-HSS Sep-25, resolved by session-table flush)',
      'MME-LDN-2 failover at 09:24:08 → re-register storm started 09:24:42',
      'Vendor advisory ORA-HSS-2025-08 applicable',
      'Confidence 91%',
    ],
    actions: [
      'Flush idle Diameter sessions on HSS-LDN-A (>300s idle) — frees ~620k sessions',
      'Rate-limit P-CSCF re-reg attempts (max 4000/sec)',
      'ServiceNow major incident MIM-2026-0508-001 + Ofcom notification 30-min clock',
      'Hold proactive comms (Ofcom-led messaging will lead) · prepare bulletin',
    ],
    outcome: [
      'Service restored · MTTR-mitigation 9m48s',
      'Reg failures 12% → 1.4% · MOS recovered to 4.0',
      '1 Ofcom-notifiable event (≥1M affected) · MIM-2026-0508-001 awaiting RCA',
    ],
    toolCalls: ['snowflake.diameter_metrics(node=HSS-LDN-A)', 'cortex.search.kb("HSS Diameter table saturation")', 'hss.diameter_flush', 'pcscf.rate_limit'],
    governance: ['CTO duty-officer approval (T2 emergency)', 'Ofcom 30-min notification clock', 'Audit trail (immutable)'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'sim-swap',
    kicker: 'BSS · Security',
    title: 'SIM-swap fraud (single customer)',
    domains: ['BSS', 'NOC', 'CIC', 'Digital'],
    duration: '26s',
    priority: 'P1',
    icon: ShieldAlert,
    storyline: 'Suspected SIM-swap fraud on MSISDN +44 7700 900 461 (CUST-002, Daniel Shah). Risk score 0.94 — request from new device + new IP (TOR exit), social-engineered care PIN. £4.2k banking-app exposure.',
    rootCause: 'Social-engineered care PIN compromise; account takeover in progress, attacker has banking apps queued for transfer.',
    detection: [
      'Behavioural anomaly: 4 password resets in 12min, 2 banking apps queried within 30s',
      'New device fingerprint, new IP (TOR exit node), city mismatch (Birmingham → Lagos)',
      'Care log review reveals attacker provided DOB + PIN on first try',
    ],
    reasoning: [
      '12 prior similar incidents, 9 confirmed fraud (75% base rate)',
      'AI_AGG fraud-pattern score 0.96 + supervised model + LLM corroboration',
      'Confidence 97%',
    ],
    actions: [
      'Freeze SIM-swap order ORD-2026-0508-99428 (T1 reversible)',
      'Step-up MFA: passkey + biometric required',
      'Lock outbound payments on account BAC-9921 (24h)',
      'Contact customer via VERIFIED channel only (app push + voice on registered MSISDN)',
      'Share IOCs to GSMA T-ISAC (anonymised)',
    ],
    outcome: [
      'Fraud prevented · MTTR-mitigation 3m24s',
      '£4,200 loss avoided · customer retained · police-reported',
      'CTI feed updated · cross-MNO sharing via GSMA T-ISAC',
    ],
    toolCalls: ['snowflake.fraud_signals', 'memory.similar_incidents(type=simswap)', 'oms.freeze_order', 'auth.require_step_up', 'cti.share_iocs'],
    governance: ['Pre-approved playbook PB-SEC-SIMSWAP-001', 'GDPR Art.22 + chain-of-custody preservation', 'Police report mandatory'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'roaming',
    kicker: 'Cross-domain · Roaming',
    title: 'Roaming partner outage (GRX/IPX)',
    domains: ['NOC', 'BSS', 'Digital', 'CIC', 'OSS'],
    duration: '38s',
    priority: 'P1',
    icon: Globe,
    storyline: 'Roaming partner VPN-A (GRX) BGP session down — 14 destination countries impacted. 12,418 outbound roamers (UK customers abroad) + 4,210 inbound roamers (foreign visitors in UK) affected.',
    rootCause: 'Partner VPN-A core router fault; secondary IPX peer (BICS) viable for failover with +24ms latency penalty.',
    detection: [
      'Diameter S6a/S6d failures from inbound roamers +2,400% in 60s',
      'GTP-C tunnels to VPN-A timing out · S8 path probes failing',
      'CDR: outbound roamers in ES/IT/GR/TR reporting "no service"',
      '96 alarms across IPX peering + roaming GW (IR.21 partner: VPN-A)',
    ],
    reasoning: [
      '2 prior historical matches, both auto-routed via secondary IPX',
      'BICS standby capacity 34% utilised — sufficient for failover',
      'Confidence 92%',
    ],
    actions: [
      'NOC: BGP reroute to BICS (T2 reversible · transport CAB pre-cleared)',
      'BSS: pause overage billing for 4,820 in-flight roaming sessions (Ofcom EU/UK protections)',
      'Digital: app push to 12,418 outbound roamers in 5 languages (en/es/it/el/tr)',
      'CIC: 1,840 high-CLV goodwill credits (PB-RT-ROAM-001)',
      'OSS: vendor P1 ticket VND-2026-0508-VPN-A0211 + GSMA IR.21 partner notification',
    ],
    outcome: [
      'Service restored · MTTR-mitigation 8m36s',
      '12,418 customers protected · £14k goodwill applied',
      '0 SLA breaches · Ofcom auto-comp evaluated (outage <2h → ineligible, goodwill applied)',
      'Vendor RCA pending; primary path returning in 4h maintenance window',
    ],
    toolCalls: ['snowflake.roaming_kpis(partner=VPN-A)', 'simulate.ipx_failover', 'transport.bgp_reroute', 'billing.pause_session_charging', 'cortex.complete(template=ROAMING_OUTAGE, locales=[5])', 'gsma.partner_notify(IR.21)'],
    governance: ['Ofcom GC C7 incident log', 'GSMA IR.21 bilateral protocol', 'Channel consent + frequency cap honoured (714 suppressed)'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'mass-simswap',
    kicker: 'Cross-domain · Security',
    title: 'Mass SIM-swap fraud campaign',
    domains: ['BSS', 'Digital', 'NOC', 'CIC', 'OSS'],
    duration: '30s',
    priority: 'P1',
    icon: ShieldAlert,
    storyline: 'Coordinated wave of 47 social-engineered SIM-swaps in 18 minutes, all from the same care-agent operator (op-id 4421). All targets are high-CLV. Estimated £180k fraud exposure.',
    rootCause: 'Insider operator (op-4421) compromise OR external PIN-database leak — both scenarios resolved by bulk freeze + operator suspension.',
    detection: [
      '47 SIM-swap requests in 18 min from same operator',
      'Common signals: same script timing · all PINs verified on first attempt · 100% high-CLV targets',
      'Geographic spread across 9 postcodes — no plausible legitimate cluster',
      'AI_AGG fraud-pattern score 0.96',
    ],
    reasoning: [
      '3 prior similar incidents (2 insider, 1 PIN-leak)',
      'Insider-or-leak pattern dominant — both branches converge on same action',
      'Confidence 96%',
    ],
    actions: [
      'BSS: freeze all 47 SIM-swap orders (bulk)',
      'IAM: suspend operator op-4421, revoke session, forensic preservation',
      'Payments: lock outbound on 47 accounts (24h)',
      'Digital: postcode-wide MFA step-up on 4,118 customers',
      'Care: verified-channel notify to 47 victims (registered MSISDN only)',
      'OSS: SEC-INC-2026-0508-002 + HR investigation paged + GSMA T-ISAC CTI sharing',
    ],
    outcome: [
      'Mass fraud prevented · MTTR-mitigation 5m24s',
      '£184,200 loss avoided · 46/47 customers retained · 1 unreachable (police-reported)',
      'Op-4421 access revoked · forensic image taken · interview scheduled',
      'FCA/Ofcom notification filed',
    ],
    toolCalls: ['snowflake.fraud_signals(operator=op-4421)', 'memory.similar_incidents(type=mass_simswap)', 'oms.bulk_freeze', 'iam.suspend_operator', 'cti.share_iocs(GSMA_T_ISAC)'],
    governance: ['Pre-approved playbook PB-SEC-MASSWAP-001', 'HR investigation triggered', 'FCA + Ofcom regulatory notification'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
  {
    id: 'tower-mains',
    kicker: 'OSS · ESG · Energy',
    title: 'Tower mains failure + battery exhaustion',
    domains: ['NOC', 'OSS', 'CIC', 'Digital'],
    duration: '30s',
    priority: 'P2',
    icon: Zap,
    storyline: 'Mains failure at rural site SITE-NYK-DAL-A (North Yorkshire Dales) — Northern Powergrid regional outage. Battery countdown 3h 10m vs utility ETA 4h 30m → 1h 20m gap requiring field intervention. 1,420 residents impacted.',
    rootCause: 'Regional power utility outage; site has 3h 10m battery autonomy at full draw vs 4h 30m mains-restoration ETA.',
    detection: [
      'Cabinet PSU log: AC mains lost at 14:08:22 · battery online',
      'Battery state: 100% → 96% (steady drain · gNB + transport ~280W)',
      'Power utility (Northern Powergrid) advisory broadcast',
      'No alternative coverage: nearest neighbour cell 4.2 km',
    ],
    reasoning: [
      '1 prior similar incident (2024 winter storm)',
      'Energy-save mode simulation: extends battery 3h 10m → 4h 30m',
      'Confidence 89%',
    ],
    actions: [
      'NOC: activate energy-save mode (5G off-peak, 4G TX −2dB) · draw 280W → 198W',
      'OSS: ESG-tagged work order WO-2026-0508-NYK-001 + portable generator dispatch (ETA 2h 15m)',
      'Digital: low-key informational push to 18 high-CLV residents only ("reduced data speeds in your area")',
      'OSS follow-up: queue battery-replacement upgrade for next maintenance cycle',
    ],
    outcome: [
      'Service uninterrupted · MTTR-mitigation 14m (mode change)',
      '1,420 customers protected · zero disconnects',
      '3,200kg CO₂ avoided vs cells-dropped scenario',
      'Battery upgrade business case auto-drafted in PIR',
    ],
    toolCalls: ['cortex.search.kb("rural site mains outage SOP")', 'simulate.energy_save_mode', 'ran.energy_save', 'fieldforce.dispatch(skill=ENERGY_HW)', 'opex.estimate'],
    governance: ['Pre-approved energy-save profile', 'ESG-tagged work order', 'Audit trail with CO₂ delta'],
    link: '/noc',
    linkLabel: 'Open NOC',
  },
];

export default function Settings() {
  const s = useDemoState();
  const [tab, setTab] = useState<Tab>('config');

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-5 space-y-4">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Settings</div>
        <h1 className="text-3xl font-extrabold text-ink">Demo configuration</h1>
        <p className="text-sm text-ink-muted">Theme, sound, scenario controls — and a full reference of every demo scenario.</p>
      </header>

      <div className="inline-flex rounded-lg border border-mist-dark bg-white p-0.5">
        <TabBtn active={tab === 'config'} onClick={() => setTab('config')} icon={<Cog className="w-3.5 h-3.5" />} label="Configuration" />
        <TabBtn active={tab === 'demos'} onClick={() => setTab('demos')} icon={<BookOpen className="w-3.5 h-3.5" />} label={`Demo catalogue (${demos.length})`} />
      </div>

      {tab === 'config' && (
        <div className="space-y-4">
          <div className="vf-card p-5">
            <div className="vf-section-title mb-3">Theme</div>
            <div className="flex gap-2">
              <Toggle active={s.theme === 'light'} onClick={() => s.setTheme('light')} icon={Sun} label="Light" desc="Executive default" />
              <Toggle active={s.theme === 'dark-ops'} onClick={() => s.setTheme('dark-ops')} icon={Moon} label="Dark Network-Ops" desc="Tuned for ops centres" />
            </div>
          </div>
          <div className="vf-card p-5">
            <div className="vf-section-title mb-3">Sounds</div>
            <div className="flex gap-2">
              <Toggle active={s.soundOn} onClick={() => s.setSoundOn(true)} icon={Volume2} label="On" desc="Subtle event tones" />
              <Toggle active={!s.soundOn} onClick={() => s.setSoundOn(false)} icon={VolumeX} label="Off" desc="Silent demo" />
            </div>
          </div>
          <div className="vf-card p-5">
            <div className="vf-section-title mb-3">Presenter narrator overlay</div>
            <div className="flex gap-2">
              <Toggle active={s.narratorOn} onClick={() => s.setNarratorOn(true)} icon={Mic} label="Show" desc="Bottom-left card" />
              <Toggle active={!s.narratorOn} onClick={() => s.setNarratorOn(false)} icon={MicOff} label="Hide" desc="Self-driven demo" />
            </div>
          </div>
          <div className="vf-card p-5">
            <div className="vf-section-title mb-3">CIC scenario</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {scenarios.map((sc) => (
                <button key={sc.id} onClick={() => s.setScenarioId(sc.id)} className={`text-left rounded-xl border p-3 transition ${s.scenarioId === sc.id ? 'border-vfRed bg-vfRed-soft/30' : 'border-mist-dark hover:bg-mist'}`}>
                  <div className="font-bold text-ink">{sc.label}</div>
                  <div className="text-xs text-ink-muted mt-1">{sc.storyline}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="vf-card p-5">
            <div className="vf-section-title mb-3">Keyboard shortcuts</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {SHORTCUT_LIST.map((k) => (
                <div key={k.keys} className="flex items-center justify-between rounded-lg bg-mist px-3 py-2">
                  <span className="text-sm text-ink">{k.action}</span>
                  <kbd className="vf-chip bg-white border border-mist-dark text-ink font-mono">{k.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
          <div className="vf-card p-5">
            <div className="vf-section-title mb-1">About this demo</div>
            <p className="text-sm text-ink-muted">SnowTelco demo platform — agentic AI across the entire telco stack on Snowflake. All data is synthetic. Designed to show what a Snowflake-native, agent-orchestrated telco platform looks like in production.</p>
          </div>
        </div>
      )}

      {tab === 'demos' && (
        <div className="space-y-4">
          <div className="vf-card p-4">
            <div className="text-[12px] text-ink-muted">
              <b className="text-ink">{sectionScenarios.length} scenarios</b> across CIC · Digital · BSS · OSS · NOC. Each section's scenarios run only while you're in that section — leaving the section stops and resets the script. Pick from the sidebar dropdown of any section, or hit <kbd className="px-1 rounded bg-mist border border-mist-dark text-[9px] font-mono">⌘K</kbd> to open the section's palette. NOC scenarios have full agent-reasoning detail below; the other sections show summary cards.
            </div>
            <div className="mt-2 rounded-md bg-amber/15 border border-amber/40 px-2.5 py-1.5 text-[11px] text-amber-900">
              <b>Demo-time compression</b> · scripts run at ~10× real-world speed. Real-world MTTD on a similar PRB-overload event is 2–4 minutes from first counter spike to actionable signal; transport-fault correlation and vendor escalation cycles are similarly compressed for narrative clarity. The reasoning steps, tool calls and approval gates are real.
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(['cic', 'digital', 'bss', 'oss', 'noc'] as const).map((s) => {
                const c = sectionScenarios.filter((x) => x.sectionId === s).length;
                return <span key={s} className="vf-chip bg-mist text-ink-muted text-[10px]">{SECTION_LABEL[s]} · {c}</span>;
              })}
            </div>
          </div>

          <div className="space-y-5">
            {(['cic', 'digital', 'bss', 'oss', 'noc'] as const).map((sect) => {
              const list = sectionScenarios.filter((s) => s.sectionId === sect);
              if (list.length === 0) return null;
              const sectDemo = demos.filter((d) => DEMO_TO_INCIDENT[d.id] && list.some((sc) => sc.id === DEMO_TO_INCIDENT[d.id]));
              return (
                <div key={sect}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="vf-chip bg-ink text-white text-[10.5px] font-bold uppercase tracking-wider">{SECTION_LABEL[sect]}</span>
                    <div className="text-[12px] text-ink-muted">{list.length} scenario{list.length === 1 ? '' : 's'}</div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {list.map((sc) => {
                      const detailed = sectDemo.find((d) => DEMO_TO_INCIDENT[d.id] === sc.id);
                      return detailed ? (
                        <DemoCard key={sc.id} d={detailed} />
                      ) : (
                        <CompactScenarioCard key={sc.id} title={sc.title} subtitle={sc.subtitle} duration={sc.durationSec} eventCount={sc.events.length} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn('px-3 h-8 rounded-md text-[12px] font-bold inline-flex items-center gap-1.5 transition', active ? 'bg-ink text-white shadow-sm' : 'text-ink-muted hover:text-ink')}>
      {icon}
      {label}
    </button>
  );
}

function CompactScenarioCard({ title, subtitle, duration, eventCount }: { title: string; subtitle: string; duration: number; eventCount: number }) {
  return (
    <div className="vf-card p-3.5 flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[14px] font-extrabold text-ink leading-tight">{title}</div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="vf-chip bg-mist text-ink-muted text-[10px] font-mono">{duration}s</span>
          <span className="vf-chip bg-mist text-ink-muted text-[10px] font-mono">{eventCount} events</span>
        </div>
      </div>
      <p className="text-[11.5px] text-ink-muted leading-snug">{subtitle}</p>
    </div>
  );
}

function DemoCard({ d }: { d: DemoEntry }) {
  const Icon = d.icon;
  const priCls = d.priority === 'P1' ? 'bg-vfRed text-white' : d.priority === 'P2' ? 'bg-amber/30 text-amber-900' : 'bg-mist text-ink';
  const incidentId = DEMO_TO_INCIDENT[d.id];
  const coverage = incidentId ? coverageRowFor(incidentId) : null;
  return (
    <div className="vf-card p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-vfRed-soft text-vfRed-dark grid place-items-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{d.kicker}</div>
            <div className="text-[15px] font-extrabold text-ink leading-tight">{d.title}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn('vf-chip text-[10px] font-bold', priCls)}>{d.priority}</span>
          <span className="text-[10px] text-ink-muted font-mono">{d.duration}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {d.domains.map((dom) => (
          <span key={dom} className="vf-chip bg-mist text-ink-muted text-[10px]">{dom}</span>
        ))}
      </div>

      <p className="text-[12px] text-ink leading-snug">{d.storyline}</p>

      {incidentId && coverage && (
        <Section title="Cross-domain surfaces">
          <div className="mb-2"><CoverageBars incidentId={incidentId} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {(['noc', 'cic', 'digital', 'bss', 'oss'] as const).map((dom) => (
              <div key={dom} className="text-[10.5px] leading-snug">
                <span className="font-bold uppercase text-ink-muted tracking-wider mr-1">{dom}</span>
                <span className="font-mono text-ink-muted mr-1">[{LEVEL_LABEL[coverage[dom].level]}]</span>
                <span className="text-ink">{coverage[dom].note}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Root cause">
        <p className="text-[11.5px] text-ink-muted leading-snug">{d.rootCause}</p>
      </Section>

      <Section title="Detection signals">
        <BulletList items={d.detection} />
      </Section>

      <Section title="Agent reasoning">
        <BulletList items={d.reasoning} />
      </Section>

      <Section title="Closed-loop actions">
        <BulletList items={d.actions} />
      </Section>

      <Section title="Outcome">
        <BulletList items={d.outcome} tone="success" />
      </Section>

      <Section title="Tool calls (selected)">
        <div className="space-y-0.5">
          {d.toolCalls.map((t) => (
            <div key={t} className="font-mono text-[10.5px] text-ink-muted">
              <span className="text-emerald-700">→</span> {t}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Governance & compliance">
        <div className="flex flex-wrap gap-1">
          {d.governance.map((g) => (
            <span key={g} className="vf-chip bg-emerald-50 text-emerald-700 text-[10px]">{g}</span>
          ))}
        </div>
      </Section>

      {d.link && (
        <Link to={d.link} className="vf-btn-primary !py-1.5 !px-3 !text-[11px] inline-flex items-center gap-1 self-start mt-1">
          {d.linkLabel || 'Open'} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-wider text-ink-muted font-bold mb-1">{title}</div>
      {children}
    </div>
  );
}

function BulletList({ items, tone = 'normal' }: { items: string[]; tone?: 'normal' | 'success' }) {
  return (
    <ul className="space-y-0.5">
      {items.map((it) => (
        <li key={it} className="text-[11.5px] text-ink flex items-start gap-1.5 leading-snug">
          <span className={cn('w-1 h-1 rounded-full shrink-0 mt-1.5', tone === 'success' ? 'bg-emerald-500' : 'bg-vfRed')} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Toggle({ active, onClick, icon: Icon, label, desc }: { active: boolean; onClick: () => void; icon: any; label: string; desc: string }) {
  return (
    <button onClick={onClick} className={`flex-1 rounded-xl border p-4 text-left transition ${active ? 'border-vfRed bg-vfRed-soft/30' : 'border-mist-dark hover:bg-mist'}`}>
      <div className="flex items-center gap-2"><Icon className={`w-4 h-4 ${active ? 'text-vfRed' : 'text-ink-muted'}`} /><span className="font-bold text-ink">{label}</span></div>
      <div className="text-xs text-ink-muted mt-1">{desc}</div>
    </button>
  );
}
