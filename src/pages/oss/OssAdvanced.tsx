import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Activity, Radio, Cpu, Server, MapPin, Bot, Shield, Plug, Globe2, Zap, GitBranch, FileCog, Briefcase, Database, ArrowRight, AlertTriangle, ShieldCheck, ChevronRight, Hash } from 'lucide-react';
import { BarChart, HBar, LineChart, Donut, Funnel, Sparkline } from '@/components/shared/Charts';
import { Treemap, ParetoChart, BandedLineChart, Histogram } from '@/pages/bss/BssExtended';
import { ModelCard, FeatureImportance, ConfidenceGauge, ForecastVsActual, MlBadge } from '@/pages/oss/OssMl';
import { cn } from '@/lib/utils';

// ─── Shared mini primitives (page chrome) ──────────────────────────────────
function PageHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <header>
      <div className="text-[10px] uppercase tracking-wider font-bold text-blue-700">{kicker}</div>
      <h1 className="text-2xl font-extrabold text-ink leading-tight">{title}</h1>
      <p className="text-xs text-ink-muted">{subtitle}</p>
    </header>
  );
}

function Kpi({ label, value, delta, tone = 'neutral', unit }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral'; unit?: string }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</span>
        {unit && <span className="text-[10px] text-ink-muted">{unit}</span>}
      </div>
      {delta && <div className={cn('text-[10px] mt-0.5', toneCls)}>{delta}</div>}
    </div>
  );
}

function GoldChips({ chips }: { chips: string[] }) {
  return (
    <div className="vf-card p-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold mr-1">Lineage · gold</span>
      {chips.map((c) => (<span key={c} className="vf-chip bg-yellow-50 text-yellow-800 border border-yellow-200 font-mono text-[10px]">{c}</span>))}
      <Link to="/lineage" className="ml-auto text-[10px] text-blue-700 font-bold inline-flex items-center gap-0.5 hover:underline">Open lineage <GitBranch className="w-3 h-3" /></Link>
    </div>
  );
}

function StandardsRow({ chips }: { chips: string[] }) {
  return (
    <div className="vf-card p-2.5 flex flex-wrap items-center gap-1.5">
      <FileCog className="w-3.5 h-3.5 text-blue-700" />
      <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold mr-1">Standards</span>
      {chips.map((c) => (<span key={c} className="vf-chip bg-mist text-ink-muted text-[10px]">{c}</span>))}
    </div>
  );
}

const KpiStripCls = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3';

// ════════════════════════════════════════════════════════════════════════════
// 1. /oss/slicing — 5G Network Slicing (3GPP TS 28.530)
// ════════════════════════════════════════════════════════════════════════════
const slices = [
  { id: 'SLC-eMBB-01',  type: 'eMBB',   tenant: 'Consumer mobile broadband', sla: '99.95%', latency: '< 30ms', state: 'Active' },
  { id: 'SLC-URLLC-01', type: 'URLLC',  tenant: 'Barclays · trading floor',  sla: '99.999%', latency: '< 5ms', state: 'Active' },
  { id: 'SLC-URLLC-02', type: 'URLLC',  tenant: 'Manchester Hospital · TeleSurgery', sla: '99.999%', latency: '< 8ms', state: 'Active' },
  { id: 'SLC-mMTC-04',  type: 'mMTC',   tenant: 'TfL · IoT sensors',          sla: '99.5%',   latency: '< 100ms', state: 'Active' },
  { id: 'SLC-eMBB-12',  type: 'eMBB',   tenant: 'Tesco · in-store FWA',       sla: '99.9%',   latency: '< 20ms', state: 'Provisioning' },
];
export function OssSlicing() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · 5G Network Slicing (3GPP TS 28.530-538)" title="Slice lifecycle management" subtitle="Slice catalog (GST/NEST templates) · slice instance dashboard · per-slice SLA · slice-as-a-service for B2B." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active slices" value="38" />
        <Kpi label="GST templates" value="12" delta="6 eMBB · 4 URLLC · 2 mMTC" />
        <Kpi label="Slice ARR" value="£42M" delta="+18% YoY" tone="good" />
        <Kpi label="Avg slice SLA" value="99.96%" tone="good" />
        <Kpi label="SLA breaches (30d)" value="2" delta="vs 8 baseline" tone="good" />
        <Kpi label="Slice-as-a-Service (B2B)" value="14" delta="enterprise customers" />
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">Slice</th><th className="py-1.5 px-2">Type</th><th className="py-1.5 px-2">Tenant</th><th className="py-1.5 px-2">SLA</th><th className="py-1.5 px-2">Latency target</th><th className="py-1.5 px-2">State</th></tr>
          </thead>
          <tbody>
            {slices.map((s) => (
              <tr key={s.id} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{s.id}</td>
                <td className="py-1.5 px-2 font-bold text-ink">{s.type}</td>
                <td className="py-1.5 px-2">{s.tenant}</td>
                <td className="py-1.5 px-2 font-mono">{s.sla}</td>
                <td className="py-1.5 px-2 font-mono">{s.latency}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', s.state === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/20 text-amber-800')}>{s.state}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Slice mix · by type</div>
          <Donut data={[{ label: 'eMBB', value: 22, color: '#1d4ed8' }, { label: 'URLLC', value: 10, color: '#dc2626' }, { label: 'mMTC', value: 6, color: '#10b981' }]} formatter={(v) => `${v}`} size={140} />
        </div>
        <div className="vf-card p-3 lg:col-span-2">
          <BandedLineChart data={[2.4, 2.6, 2.5, 2.3, 2.1, 2.2, 2.0, 1.9, 2.0, 1.8, 1.7, 1.6]} bands={[{ color: '#10b981', min: 1.4, max: 2.6 }]} label="URLLC P95 latency · last 12 weeks · ms · target < 5ms" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'slice_sla_predict_v2', version: '2.0', metric: 'AUROC 0.93', drift: 'stable', refreshed: '8m ago', owner: 'OSS-5G', blurb: 'Predicts SLA breach risk per slice in next 60 minutes · feeds NSSF orchestrator.' }} />
        <FeatureImportance title="SLA-breach risk drivers" features={[{ label: 'Cell load (host gNB)', value: 0.34 }, { label: 'Slice load · burst', value: 0.22 }, { label: 'NF resource pressure', value: 0.16 }, { label: 'Backhaul latency', value: 0.12 }, { label: 'Slice age', value: 0.09 }, { label: 'Tenant traffic class', value: 0.07 }]} modelHint="slice_sla_predict_v2" />
      </div>
      <GoldChips chips={['gold.slice_inventory', 'gold.slice_kpis', 'silver.slice_sla', 'platinum.slice_health']} />
      <StandardsRow chips={['3GPP TS 28.530 · Slice Mgmt', '3GPP TS 28.531 · LCM', 'GSMA NG.116 · GST', 'TMF 641 (sliced)', 'ETSI NFV']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. /oss/pm-fm — Performance & Fault Management (TMF 681)
// ════════════════════════════════════════════════════════════════════════════
export function OssPmFm() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Performance & Fault Management (TMF 681)" title="PM/FM control plane" subtitle="Bulk PM file ingestion · KPI threshold tooling · alarm correlation · alarm-storm detection. Distinct from ticket-centric Service Assurance." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active alarms" value="412" tone="warn" />
        <Kpi label="Alarms / sec" value="84" delta="peak ingest" />
        <Kpi label="KPI breaches (24h)" value="38" tone="warn" />
        <Kpi label="MTTD" value="22 sec" tone="good" />
        <Kpi label="Storm corrections" value="14" delta="auto-collapsed" tone="good" />
        <Kpi label="Threshold profiles" value="184" delta="versioned" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Alarms · severity mix · last 24h</div>
          <Donut data={[{ label: 'Critical', value: 38, color: '#dc2626' }, { label: 'Major', value: 142, color: '#f59e0b' }, { label: 'Minor', value: 184, color: '#3b82f6' }, { label: 'Warning', value: 480, color: '#94a3b8' }]} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Alarm rate · last 6h (per minute)</div>
          <Sparkline data={[42, 38, 44, 88, 124, 96, 72, 68, 84, 52, 48, 46, 44, 68, 92, 84, 72, 64, 58, 56, 54, 52, 48, 46]} color="#1d4ed8" height={80} />
          <div className="text-[10px] text-ink-muted mt-1">Spike at T-5h corresponds to MAN-M14 cluster — auto-correlated.</div>
        </div>
      </div>

      <ParetoChart items={[{ label: 'gNB-MAN-M14-* · cluster congestion', value: 38 }, { label: 'PE-LDN-1 · transport', value: 22 }, { label: 'IMS · Cx storm', value: 16 }, { label: 'Roaming partner ES · steering', value: 11 }, { label: 'Other', value: 13 }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ModelCard m={{ name: 'alarm_correlation_v3', version: '3.1', metric: 'F1 0.94', drift: 'stable', refreshed: '4m ago', owner: 'OSS-PMFM', blurb: 'Correlates raw alarms into incidents · collapses ~9× alarm volume into 1× incident.' }} />
        <ConfidenceGauge label="Storm-detect confidence · current cluster" value={91} tone="amber" subLabel="MAN-M14 · 38 critical · auto-collapsed" />
        <ConfidenceGauge label="KPI-threshold tuning · false-positive reduction" value={82} tone="emerald" subLabel="184 thresholds active" />
      </div>
      <GoldChips chips={['silver.alarms_raw', 'gold.alarm_correlated', 'gold.kpi_threshold_breach', 'silver.pm_counters']} />
      <StandardsRow chips={['TMF 681 · Performance Threshold', '3GPP TS 32.401 PM', '3GPP TS 32.111 FM', 'X.733 alarm model', 'ITIL v4']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. /oss/son — Self-Organising Network
// ════════════════════════════════════════════════════════════════════════════
export function OssSon() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Self-Organising Network" title="Self-config · self-optimise · self-heal" subtitle="Zero-touch site bring-up · load-balancing & mobility optimisation · cell-outage compensation. SON closed-loop with NOC + Field Ops." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Self-config events (30d)" value="184" delta="zero-touch site bring-up" tone="good" />
        <Kpi label="Self-optimise (30d)" value="2,418" delta="−1.2pp churn risk" tone="good" />
        <Kpi label="Self-heal (30d)" value="412" delta="cell-outage compensation" tone="good" />
        <Kpi label="Avg restore time" value="42 sec" delta="vs 28m manual" tone="good" />
        <Kpi label="False-positive rate" value="2.1%" tone="good" />
        <Kpi label="Cells with SON ON" value="98%" delta="184k of 188k" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">SON action mix · last 30 days</div>
          <Donut data={[{ label: 'MLB · load-balance', value: 1240, color: '#1d4ed8' }, { label: 'MRO · handover-tune', value: 720, color: '#3b82f6' }, { label: 'CCO · coverage-tilt', value: 380, color: '#10b981' }, { label: 'COD · outage compensate', value: 412, color: '#dc2626' }, { label: 'PCI · planning conflict', value: 78, color: '#f59e0b' }]} formatter={(v) => v.toLocaleString()} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Self-X success rate · 12 weeks</div>
          <LineChart height={140} series={[{ name: 'Success %', data: [88, 89, 90, 91, 92, 93, 93, 94, 95, 95, 96, 96] }]} labels={['W-12','W-11','W-10','W-9','W-8','W-7','W-6','W-5','W-4','W-3','W-2','Now']} colors={['#10b981']} />
          <div className="text-[10px] text-ink-muted mt-1">Steady gains as son_recommender_v2 retrains weekly.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'son_recommender_v2', version: '2.4', metric: 'success 96%', drift: 'stable', refreshed: '2h ago', owner: 'OSS-SON', blurb: 'Recommends MLB / MRO / CCO actions · pre-approved Standard CHG window auto-pushed via Ericsson SON.' }} />
        <FeatureImportance title="Self-X recommendation drivers" features={[{ label: 'Cell PRB utilisation', value: 0.32 }, { label: 'Handover failure rate', value: 0.21 }, { label: 'Drive-test telemetry', value: 0.16 }, { label: 'Neighbour relations', value: 0.13 }, { label: 'Time-of-day pattern', value: 0.10 }, { label: 'Customer NES delta', value: 0.08 }]} modelHint="son_recommender_v2" />
      </div>
      <GoldChips chips={['gold.son_recommendations', 'gold.cell_kpis', 'silver.handover_events', 'silver.son_actions']} />
      <StandardsRow chips={['3GPP TS 32.500 · SON', '3GPP TS 36.902 · LTE SON', '3GPP TS 28.313 · 5G SON', 'O-RAN · SMO · Non-RT RIC', 'ITIL v4']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. /oss/nfv — NFV / Cloud-Native NF Lifecycle (ETSI MANO)
// ════════════════════════════════════════════════════════════════════════════
export function OssNfv() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · NFV · Cloud-Native NF Lifecycle (ETSI MANO)" title="VNF / CNF orchestration" subtitle="VNF-D + CNF Helm chart catalog · scale-out · scale-in · heal. Snowflake-side audit of every MANO action." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active VNFs" value="184" />
        <Kpi label="Active CNFs" value="412" delta="K8s pods" />
        <Kpi label="Auto-scale (24h)" value="142" delta="scale-out + scale-in" tone="good" />
        <Kpi label="Auto-heal (24h)" value="18" tone="good" />
        <Kpi label="Resource utilisation" value="68%" delta="across 24 K8s clusters" />
        <Kpi label="Vendor charts" value="72" delta="Mavenir · Ericsson · Nokia" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">NF inventory · vendor × type</div>
          <Treemap items={[{ label: 'Mavenir IMS · CNF',   value: 28, margin: 0.62 }, { label: 'Ericsson 5G Core · CNF', value: 24, margin: 0.58 }, { label: 'Nokia ReefShark · CNF', value: 14, margin: 0.61 }, { label: 'Cisco PCRF · VNF',       value: 10, margin: 0.50 }, { label: 'Oracle USPL · VNF',       value: 8,  margin: 0.55 }, { label: 'Other',                   value: 16, margin: 0.50 }]} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Scale + heal events · last 14 days</div>
          <BarChart data={Array.from({ length: 14 }, (_, i) => ({ label: `D-${14 - i}`, value: [12, 18, 24, 16, 14, 8, 6, 22, 18, 14, 12, 10, 8, 16][i] }))} color="#1d4ed8" />
          <div className="text-[10px] text-ink-muted mt-1">Auto-scaled in 38 sec p95 · zero customer-visible disruption.</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'nf_autoscale_v1', version: '1.5', metric: 'reward 0.84', drift: 'stable', refreshed: '12m ago', owner: 'OSS-NFV', blurb: 'RL agent for proactive auto-scale · anticipates load 5-10 min ahead.' }} />
        <FeatureImportance title="Autoscale signal drivers" features={[{ label: 'Pod CPU (5m avg)', value: 0.31 }, { label: 'Memory pressure', value: 0.22 }, { label: 'Inbound rate', value: 0.18 }, { label: 'Time-of-day', value: 0.12 }, { label: 'Slice load', value: 0.10 }, { label: 'Upstream NF state', value: 0.07 }]} modelHint="nf_autoscale_v1" />
      </div>
      <GoldChips chips={['gold.nf_inventory', 'silver.mano_events', 'gold.k8s_pods', 'gold.helm_releases']} />
      <StandardsRow chips={['ETSI NFV-MANO', 'ETSI NFV-IFA-013 SOL003', 'TOSCA', 'CNCF · Helm', 'O-RAN · O2 IMS']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. /oss/site-lifecycle — Site Lifecycle
// ════════════════════════════════════════════════════════════════════════════
export function OssSiteLifecycle() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Site Lifecycle" title="Site acquisition → decommission" subtitle="Acquisition · permits · construction · RFI · integration · handover · decommission. Cross-links Capex + Field Ops + Towerco." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Sites in build" value="184" />
        <Kpi label="Permits pending" value="42" tone="warn" />
        <Kpi label="Avg cycle time" value="312 days" delta="−42d YoY" tone="good" />
        <Kpi label="Decommission queue" value="38" />
        <Kpi label="Capex YTD" value="£24.6M" />
        <Kpi label="On-time handover" value="82%" delta="+6pp" tone="good" />
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Lifecycle funnel · 184 sites in flight</div>
        <Funnel stages={[{ label: 'Acquisition · landlord identified', value: 184, tone: 'good' }, { label: 'Planning permission', value: 142, tone: 'warn' }, { label: 'Construction · civil works', value: 92, tone: 'good' }, { label: 'RFI · power + fibre', value: 64, tone: 'warn' }, { label: 'Integration · vendor + tests', value: 42, tone: 'good' }, { label: 'Acceptance · handover', value: 28, tone: 'good' }, { label: 'On-air · live', value: 22, tone: 'good' }]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ParetoChart items={[{ label: 'Planning permission · council delay', value: 38 }, { label: 'Power-up · DNO connection', value: 24 }, { label: 'Fibre backhaul · Openreach', value: 18 }, { label: 'Vendor delivery · CPE', value: 11 }, { label: 'Land-rights · re-negotiation', value: 9 }]} />
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Capex pipeline · region × tech</div>
          <Treemap items={[{ label: 'London · 5G SA', value: 28, margin: 0.55 }, { label: 'Manchester · 5G NSA', value: 18, margin: 0.50 }, { label: 'Birmingham · 4G + 5G', value: 16, margin: 0.48 }, { label: 'Scotland · 4G coverage', value: 12, margin: 0.42 }, { label: 'Yorkshire · small cells', value: 14, margin: 0.50 }, { label: 'Other', value: 12, margin: 0.45 }]} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'site_build_eta_v1', version: '1.4', metric: 'MAPE 12%', drift: 'stable', refreshed: '1h ago', owner: 'OSS-Plan', blurb: 'Predicts on-air date per site · accounts for council, DNO, vendor delays.' }} />
        <FeatureImportance title="Cycle-time drivers" features={[{ label: 'Council region', value: 0.28 }, { label: 'DNO area', value: 0.22 }, { label: 'Site type (rooftop / GF)', value: 0.16 }, { label: 'Backhaul provider', value: 0.13 }, { label: 'Vendor mix', value: 0.11 }, { label: 'Season', value: 0.10 }]} modelHint="site_build_eta_v1" />
      </div>
      <GoldChips chips={['gold.site_inventory', 'silver.site_milestones', 'gold.capex_pipeline', 'silver.permits']} />
      <StandardsRow chips={['TMF 633 · Service Spec', 'TMF 638 · Inventory', 'BS 8542 · Telecom installation', 'Ofcom · Code of Practice', 'ICNIRP · EMF']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. /oss/mlops — MLOps · OSS Model Registry
// ════════════════════════════════════════════════════════════════════════════
const allModels = [
  { name: 'order_fallout_v2.1',       owner: 'BSS-OSS DS',   metric: 'AUROC 0.94', drift: 'stable', infer: '1.4M/d' },
  { name: 'order_jeopardy_v3',        owner: 'OSS-Order',    metric: 'AUROC 0.93', drift: 'stable', infer: '0.4M/d' },
  { name: 'activation_eta_v2',        owner: 'OSS-Activate', metric: 'MAPE 14%',   drift: 'stable', infer: '24k/d' },
  { name: 'auto_orchestration_v3',    owner: 'OSS-Activate', metric: 'AUROC 0.91', drift: 'stable', infer: '0.6M/d' },
  { name: 'inventory_drift_v3',       owner: 'OSS-Inv',      metric: 'F1 0.91',    drift: 'stable', infer: 'nightly' },
  { name: 'topology_blast_radius_v2', owner: 'OSS-Topo',     metric: 'AUROC 0.91', drift: 'stable', infer: '120k/d' },
  { name: 'assurance_triage_v2',      owner: 'OSS-Assure',   metric: 'F1 0.92',    drift: 'stable', infer: '0.2M/d' },
  { name: 'severity_classifier_v2',   owner: 'OSS-Assure',   metric: 'F1 0.94',    drift: 'stable', infer: '0.2M/d' },
  { name: 'mttr_predict_v3',          owner: 'OSS-Assure',   metric: 'MAPE 11%',   drift: 'watch',  infer: '0.2M/d' },
  { name: 'route_optimiser_v2',       owner: 'OSS-Field',    metric: '−14 rolls/d',drift: 'stable', infer: '8k/d' },
  { name: 'ftf_predict_v1',           owner: 'OSS-Field',    metric: 'AUROC 0.88', drift: 'stable', infer: '4k/d' },
  { name: 'cab_auto_approve_v2',      owner: 'OSS-CHG',      metric: 'AUROC 0.96', drift: 'stable', infer: '1.2k/d' },
  { name: 'cfr_predict_v3',           owner: 'OSS-CHG',      metric: 'MAPE 6%',    drift: 'stable', infer: 'daily' },
  { name: 'cab_rollback_v1',          owner: 'OSS-CHG',      metric: 'P99 rollback < 4m', drift: 'stable', infer: 'on-event' },
  { name: 'capacity_forecast_v2',     owner: 'OSS-Plan',     metric: 'MAPE 8%',    drift: 'stable', infer: 'weekly' },
  { name: 'energy_save_v3',           owner: 'OSS-ESG',      metric: 'reward 0.78',drift: 'stable', infer: '24k/d' },
  { name: 'kwh_demand_forecast_v2',   owner: 'OSS-ESG',      metric: 'MAPE 5%',    drift: 'stable', infer: 'hourly' },
  { name: 'battery_eol_v2',           owner: 'OSS-Power',    metric: 'AUROC 0.91', drift: 'watch',  infer: 'nightly' },
  { name: 'dsr_opportunity_v1',       owner: 'OSS-ESG',      metric: 'reward 0.72',drift: 'stable', infer: 'hourly' },
  { name: 'site_anomaly_v1',          owner: 'OSS-ESG',      metric: 'F1 0.88',    drift: 'stable', infer: '5min' },
  { name: 'son_recommender_v2',       owner: 'OSS-SON',      metric: 'success 96%',drift: 'stable', infer: 'daily' },
  { name: 'slice_sla_predict_v2',     owner: 'OSS-5G',       metric: 'AUROC 0.93', drift: 'stable', infer: '24k/d' },
  { name: 'alarm_correlation_v3',     owner: 'OSS-PMFM',     metric: 'F1 0.94',    drift: 'stable', infer: '7M/d' },
  { name: 'nf_autoscale_v1',          owner: 'OSS-NFV',      metric: 'reward 0.84',drift: 'stable', infer: '0.5M/d' },
];
export function OssMlOps() {
  const driftWatch = allModels.filter((m) => m.drift === 'watch').length;
  const driftStable = allModels.length - driftWatch;
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · MLOps · Model Registry" title="Snowpark ML model registry · drift · retraining" subtitle="All OSS production models in one auditable place. Drift dashboard · A/B holdout · weekly retraining cadence on Snowpark + GPU SPCS." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Models in production" value={`${allModels.length}`} delta="across 8 OSS teams" />
        <Kpi label="Drift-stable" value={`${driftStable}`} tone="good" />
        <Kpi label="On watch" value={`${driftWatch}`} tone="warn" />
        <Kpi label="Daily inferences" value="14.2M" delta="across all models" tone="good" />
        <Kpi label="Avg model age" value="42 days" delta="since last retrain" />
        <Kpi label="A/B holdout active" value="6" delta="experiments" />
      </div>

      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">Model</th><th className="py-1.5 px-2">Owner</th><th className="py-1.5 px-2">Metric</th><th className="py-1.5 px-2">Drift</th><th className="py-1.5 px-2">Inferences</th></tr>
          </thead>
          <tbody>
            {allModels.map((m) => (
              <tr key={m.name} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink">{m.name}</td>
                <td className="py-1.5 px-2 text-ink-muted">{m.owner}</td>
                <td className="py-1.5 px-2 font-mono">{m.metric}</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', m.drift === 'stable' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/30 text-amber-900')}>{m.drift}</span></td>
                <td className="py-1.5 px-2 font-mono text-[11px] text-ink-muted">{m.infer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Models by team</div>
          <Donut data={[{ label: 'OSS-ESG', value: 4, color: '#10b981' }, { label: 'OSS-Assure', value: 3, color: '#1d4ed8' }, { label: 'OSS-CHG', value: 3, color: '#3b82f6' }, { label: 'OSS-Order', value: 2, color: '#f59e0b' }, { label: 'OSS-Field', value: 2, color: '#8b5cf6' }, { label: 'Other', value: 10, color: '#94a3b8' }]} size={140} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Retraining queue</div>
          <ul className="text-[11.5px] space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> mttr_predict_v3 · MAPE drifted +2pp · queued for retrain tonight</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> battery_eol_v2 · seasonal pattern shift · queued tomorrow</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> capacity_forecast_v2 · scheduled weekly · next Sun 02:00</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> energy_save_v3 · RL · continuous · last reward 0.78</li>
          </ul>
        </div>
      </div>
      <GoldChips chips={['platinum.model_registry', 'gold.model_drift', 'gold.training_runs', 'gold.ab_holdout']} />
      <StandardsRow chips={['Snowpark ML Registry', 'MLflow-compatible', 'ISO/IEC 23053 AI', 'Ofcom · explainability', 'GDPR Art.22']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. /oss/roaming — Roaming Operations · IR.21 · IPX
// ════════════════════════════════════════════════════════════════════════════
export function OssRoaming() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Roaming Operations" title="IR.21 · IPX peering · Steering" subtitle="GSMA IR.21 directory · IPX corridor management · steering of roaming · TAP3 reconcile + dispute workflow." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active roamers" value="148k" delta="outbound + inbound" />
        <Kpi label="Roaming partners" value="412" delta="across 184 countries" />
        <Kpi label="TAP3 disputes open" value="14" tone="warn" />
        <Kpi label="Steering hits (24h)" value="42k" delta="quality + cost" tone="good" />
        <Kpi label="Settlement balance" value="+£8.2M" delta="net inbound" tone="good" />
        <Kpi label="IR.21 records" value="412" delta="auto-fetched daily" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Top corridors · GB inbound</div>
          <HBar data={[{ label: 'Spain', value: 28, sub: 'Movistar / Vodafone ES' }, { label: 'France', value: 22, sub: 'Orange / Bouygues' }, { label: 'USA', value: 16, sub: 'AT&T / T-Mobile / Verizon' }, { label: 'Italy', value: 14, sub: 'TIM / Vodafone IT' }, { label: 'Germany', value: 11, sub: 'Vodafone DE / Telekom' }, { label: 'Netherlands', value: 9, sub: 'KPN / VodafoneZiggo' }]} color="#1d4ed8" formatter={(v) => `${v}%`} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Partner SLA mix</div>
          <Donut data={[{ label: 'Tier 1 · 99.95%+', value: 184, color: '#10b981' }, { label: 'Tier 2 · 99.5%+', value: 142, color: '#1d4ed8' }, { label: 'Tier 3 · best-effort', value: 86, color: '#f59e0b' }]} size={140} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'roaming_steering_v1', version: '1.6', metric: 'reward 0.74', drift: 'stable', refreshed: '8m ago', owner: 'OSS-Roam', blurb: 'Selects best partner per visited country per QoE x cost · respects Ofcom + GSMA fairness rules.' }} />
        <ParetoChart items={[{ label: 'TAP3 schema mismatch', value: 38 }, { label: 'Tariff disagreement', value: 24 }, { label: 'Late records', value: 16 }, { label: 'Currency / FX', value: 12 }, { label: 'Other', value: 10 }]} />
      </div>
      <GoldChips chips={['gold.roaming_session', 'gold.tap3_reconcile', 'gold.partner_settlements', 'silver.ir21_directory']} />
      <StandardsRow chips={['GSMA TS.32 · Roaming', 'GSMA IR.21', 'GSMA TAP3.12', 'IR.85 · LTE Roaming', 'Ofcom · WTO · IRRT']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. /oss/numbers — Number Portability (MNP)
// ════════════════════════════════════════════════════════════════════════════
export function OssNumbers() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Number Portability · MNP (Ofcom)" title="Mobile Number Portability operations" subtitle="Ofcom-mandated 1-day-portability process · port-in / port-out · PAC code lifecycle · cycle-time tracking." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Ports in (today)" value="412" tone="good" />
        <Kpi label="Ports out (today)" value="184" />
        <Kpi label="Net (today)" value="+228" tone="good" />
        <Kpi label="Cycle time" value="4h 32m" delta="vs 1d Ofcom SLA" tone="good" />
        <Kpi label="Port failures" value="0.6%" delta="−0.4pp" tone="good" />
        <Kpi label="PAC issued (today)" value="2,418" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Daily ports · last 14 days</div>
          <BarChart data={Array.from({ length: 14 }, (_, i) => ({ label: `D-${14 - i}`, value: [380, 412, 442, 380, 312, 248, 184, 380, 412, 444, 380, 412, 384, 412][i] }))} color="#1d4ed8" />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Port-out reasons</div>
          <Donut data={[{ label: 'Price / tariff', value: 38, color: '#dc2626' }, { label: 'Coverage', value: 22, color: '#f59e0b' }, { label: 'Bundle / family', value: 16, color: '#1d4ed8' }, { label: 'Customer service', value: 11, color: '#10b981' }, { label: 'Other', value: 13, color: '#94a3b8' }]} formatter={(v) => `${v}%`} size={140} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'port_failure_predict_v1', version: '1.3', metric: 'AUROC 0.86', drift: 'stable', refreshed: '14m ago', owner: 'OSS-Numbers', blurb: 'Predicts port failure 6h ahead · auto-pre-fixes 78% of cases.' }} />
        <BandedLineChart data={[1.4, 1.2, 1.0, 0.9, 0.8, 0.7, 0.7, 0.6, 0.6, 0.6, 0.5, 0.6]} bands={[{ color: '#10b981', min: 0.4, max: 1.5 }]} label="Port failure rate · 12 weeks · % · Ofcom SLA target < 1%" />
      </div>
      <GoldChips chips={['gold.port_register', 'gold.pac_codes', 'silver.mnp_engine', 'silver.msisdn_register']} />
      <StandardsRow chips={['Ofcom · 1-day MNP', 'GC C7 · Number Portability', 'MNS · 3GPP TS 23.066', 'TMF 638', 'GDPR Art.6']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. /oss/towerco — Towerco Settlements (Cellnex / CTIL / MBNL)
// ════════════════════════════════════════════════════════════════════════════
export function OssTowerco() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Towerco Settlements" title="Cellnex · Cornerstone (CTIL) · MBNL" subtitle="Towerco lease + co-tenancy management · monthly opex · disputes · co-tenant ratio target." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active tower leases" value="14,800" />
        <Kpi label="Co-tenancy ratio" value="2.4" delta="target ≥ 2.0" tone="good" />
        <Kpi label="Monthly opex" value="£18.4M" delta="−2.1% MoM" tone="good" />
        <Kpi label="Open disputes" value="42" tone="warn" />
        <Kpi label="Auto-recon match" value="98.6%" tone="good" />
        <Kpi label="Lease renewals (next 12m)" value="2,418" delta="negotiation due" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Towerco share</div>
          <Donut data={[{ label: 'Cornerstone (CTIL)', value: 6_200, color: '#1d4ed8' }, { label: 'MBNL', value: 4_800, color: '#3b82f6' }, { label: 'Cellnex', value: 2_400, color: '#10b981' }, { label: 'Own + other', value: 1_400, color: '#94a3b8' }]} formatter={(v) => v.toLocaleString()} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Monthly opex by region · £k</div>
          <HBar data={[{ label: 'London', value: 4_200, sub: '23%' }, { label: 'Scotland', value: 2_400, sub: '13%' }, { label: 'NW', value: 2_180, sub: '12%' }, { label: 'WM', value: 1_840, sub: '10%' }, { label: 'Yorkshire', value: 1_640, sub: '9%' }, { label: 'Other', value: 6_140, sub: '33%' }]} color="#1d4ed8" formatter={(v) => `£${(v / 1000).toFixed(1)}M`} />
        </div>
      </div>
      <ModelCard m={{ name: 'towerco_recon_v1', version: '1.4', metric: 'recon 98.6%', drift: 'stable', refreshed: 'nightly', owner: 'OSS-Towerco', blurb: 'Auto-reconciles towerco invoice vs lease + co-tenancy ledger. Surfaces 1.4% exception queue.' }} />
      <GoldChips chips={['gold.tower_leases', 'gold.cotenancy_register', 'silver.towerco_invoices', 'gold.partner_settlements']} />
      <StandardsRow chips={['Ofcom · Code of Practice', 'Telecoms Infra Code', 'IFRS 16 · leases', 'TMF 638', 'BS 8542']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 10. /oss/wholesale-ops — Wholesale / MVNO Operations
// ════════════════════════════════════════════════════════════════════════════
export function OssWholesaleOps() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Wholesale / MVNO Operations" title="MVNO host · BNG · VLAN · settlement" subtitle="MVNO host operations · BNG sessions · VLAN allocation · settlement reconciliation. 14 MVNO partners on the platform." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active MVNOs" value="14" delta="Lebara · Sky · ASDA Mobile · …" />
        <Kpi label="MVNO subscribers" value="1.84M" delta="hosted on our network" />
        <Kpi label="BNG sessions (live)" value="412k" delta="across 24 BNGs" />
        <Kpi label="VLANs allocated" value="2,418" />
        <Kpi label="Settlement balance" value="+£3.2M" delta="net inbound this period" tone="good" />
        <Kpi label="Open disputes" value="6" tone="warn" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">MVNO mix · subscribers</div>
          <Donut data={[{ label: 'Lebara', value: 480, color: '#1d4ed8' }, { label: 'Sky Mobile', value: 420, color: '#3b82f6' }, { label: 'ASDA Mobile', value: 280, color: '#10b981' }, { label: 'iD Mobile', value: 240, color: '#f59e0b' }, { label: 'Other', value: 420, color: '#94a3b8' }]} formatter={(v) => `${v}k`} size={150} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Settlement preview · this period</div>
          <Treemap items={[{ label: 'Lebara', value: 1_240, margin: 0.32 }, { label: 'Sky Mobile', value: 880, margin: 0.28 }, { label: 'ASDA', value: 620, margin: 0.24 }, { label: 'iD', value: 480, margin: 0.22 }, { label: 'Other', value: 580, margin: 0.20 }]} />
        </div>
      </div>
      <ModelCard m={{ name: 'mvno_settlement_v1', version: '1.3', metric: 'recon 99.4%', drift: 'stable', refreshed: '12m ago', owner: 'OSS-Wholesale', blurb: 'Auto-reconciles MVNO usage feed vs invoice. Surfaces 0.6% exception queue.' }} />
      <GoldChips chips={['gold.wholesale_contracts', 'gold.mvno_subscribers', 'silver.bng_sessions', 'gold.partner_settlements']} />
      <StandardsRow chips={['Ofcom · Wholesale Access', 'TMF 622 · ordering', 'BBFRA · agreements', 'IFRS 15 RevRec', 'GDPR']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11. /oss/li — Lawful Intercept (ETSI TS 103 221)
// ════════════════════════════════════════════════════════════════════════════
export function OssLi() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Lawful Intercept (ETSI TS 103 221)" title="Lawful Intercept operations · IUK CSP duties" subtitle="Active warrants · LIID register · LEMF delivery · audit chain. UK CSP statutory obligation under the Investigatory Powers Act 2016." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Active warrants" value="14" />
        <Kpi label="LIIDs assigned" value="42" />
        <Kpi label="Daily request volume" value="184" delta="auto-routed" tone="good" />
        <Kpi label="P95 response time" value="38 sec" tone="good" />
        <Kpi label="Audit completeness" value="100%" tone="good" />
        <Kpi label="Operator clearances" value="14" delta="DV-cleared" />
      </div>

      <div className="vf-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Authority · request mix · last 30 days</div>
        <Donut data={[{ label: 'NCA · National Crime Agency', value: 38, color: '#dc2626' }, { label: 'Met Police', value: 22, color: '#f59e0b' }, { label: 'GCHQ', value: 14, color: '#1d4ed8' }, { label: 'MI5', value: 11, color: '#8b5cf6' }, { label: 'Other regional', value: 15, color: '#94a3b8' }]} size={150} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Response-time distribution · last 30 days</div>
          <Histogram buckets={[{ label: '<30s', count: 124 }, { label: '30-60s', count: 62 }, { label: '1-3min', count: 14 }, { label: '3-10min', count: 4 }]} mean={42} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Compliance · audit chain</div>
          <ul className="text-[11.5px] space-y-1.5">
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Every action logged to <code className="font-mono text-[11px]">gold.li_audit</code> · Time Travel-protected (90d)</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Operators DV-cleared · access via Snowflake RBAC role <code className="font-mono text-[11px]">LI_OPERATOR</code></li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Tri-Secret-Secure (CMK) on all LI tables</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ICR (Internet Connection Records) as per IPA 2016 Part 4</li>
          </ul>
        </div>
      </div>
      <GoldChips chips={['gold.li_warrants', 'gold.li_audit', 'silver.li_handovers']} />
      <StandardsRow chips={['ETSI TS 103 221 · LI', 'Investigatory Powers Act 2016', 'ETSI 33.106 · 3GPP LI', 'Snowflake CMK · Tri-Secret', 'NCSC IT Security']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 12. /oss/digital-twin — Network Digital Twin / Simulation
// ════════════════════════════════════════════════════════════════════════════
export function OssDigitalTwin() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Digital Twin · Network Simulation" title="What-if at network scale" subtitle="Per-cell digital twin built from gold.cell_kpis + topology. Run scenarios in minutes, not weeks. Validate change before it ships." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="Twin scenarios in flight" value="42" />
        <Kpi label="Sim accuracy (MAPE)" value="8%" delta="vs measured" tone="good" />
        <Kpi label="Scenarios run today" value="184" />
        <Kpi label="Solver utilisation" value="62%" delta="GPU SPCS" />
        <Kpi label="Avg sim time" value="3m 24s" delta="for full UK twin" tone="good" />
        <Kpi label="Decisions validated" value="12,400" delta="capex + change pre-flight" tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Active scenarios</div>
          <ul className="text-[11.5px] space-y-1">
            <li className="flex items-center gap-2"><span className="vf-chip bg-blue-100 text-blue-700 text-[9.5px]">Capex</span> Manchester BH upgrade — Q1 vs Q3 ROI · MAPE 7%</li>
            <li className="flex items-center gap-2"><span className="vf-chip bg-amber/30 text-amber-900 text-[9.5px]">Event</span> Hyde Park concert · cell-on-wheels placement · MAPE 9%</li>
            <li className="flex items-center gap-2"><span className="vf-chip bg-emerald-100 text-emerald-700 text-[9.5px]">SON</span> e-tilt impact 18 cells — 4h re-evaluation · MAPE 6%</li>
            <li className="flex items-center gap-2"><span className="vf-chip bg-fuchsia-100 text-fuchsia-700 text-[9.5px]">Slice</span> URLLC reservation for Barclays trading floor · MAPE 8%</li>
            <li className="flex items-center gap-2"><span className="vf-chip bg-vfRed text-white text-[9.5px]">Failure</span> "What if PE-LDN-1 fails for 4h?" — blast-radius simulation</li>
          </ul>
        </div>
        <ForecastVsActual title="Twin · simulated PRB% vs actual · last 12 weeks (London CW)" actual={[62, 64, 66, 68, 70, 72, 75, 78, 80, 82]} forecast={[82, 84, 86, 88, 90, 92]} lo={[80, 82, 84, 86, 87, 89]} hi={[84, 86, 88, 90, 92, 94]} labels={['W-9','W-8','W-7','W-6','W-5','W-4','W-3','W-2','W-1','Now','+1','+2','+3','+4','+5']} modelHint="twin_simulator_v1" />
      </div>
      <ModelCard m={{ name: 'twin_simulator_v1', version: '1.6', metric: 'MAPE 8%', drift: 'stable', refreshed: 'on-demand', owner: 'OSS-Plan', blurb: 'GPU-backed network simulator on Snowpark Container Services. Accepts what-if delta, returns full-network response.' }} />
      <GoldChips chips={['gold.cell_kpis', 'gold.topology_snapshot', 'gold.twin_runs', 'platinum.twin_results']} />
      <StandardsRow chips={['ITU-T Y.3090 · Digital Twin Network', 'TMF 633', 'O-RAN · A1 policy', 'NIST · DTN', 'GDPR']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 13. /oss/mec — Edge / MEC Orchestration
// ════════════════════════════════════════════════════════════════════════════
export function OssMec() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · Edge / MEC Orchestration" title="5G MEC + local break-out" subtitle="MEC node placement · workload deployment · latency-class routing · local break-out for B2B campus + URLLC slices." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="MEC nodes" value="42" delta="across 6 UK metros" />
        <Kpi label="Workloads deployed" value="184" delta="Helm-managed" />
        <Kpi label="P95 RTT (URLLC)" value="3.4ms" delta="target < 5ms" tone="good" />
        <Kpi label="Break-out hits / sec" value="12,800" />
        <Kpi label="Edge utilisation" value="58%" />
        <Kpi label="Active campuses" value="14" delta="Barclays + Hospitals + Stadia" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Workload classes</div>
          <Donut data={[{ label: 'URLLC (low-latency)', value: 38, color: '#dc2626' }, { label: 'Video / CDN', value: 24, color: '#1d4ed8' }, { label: 'IoT aggregation', value: 18, color: '#10b981' }, { label: 'Private 5G', value: 14, color: '#f59e0b' }, { label: 'Other', value: 6, color: '#94a3b8' }]} size={140} />
        </div>
        <div className="vf-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">Latency · last hour by node (ms)</div>
          <Histogram buckets={[{ label: '<2ms', count: 14 }, { label: '2-3ms', count: 18 }, { label: '3-5ms', count: 8 }, { label: '5-10ms', count: 2 }]} mean={3.4} />
        </div>
      </div>
      <ModelCard m={{ name: 'mec_placement_v1', version: '1.4', metric: 'reward 0.81', drift: 'stable', refreshed: '6m ago', owner: 'OSS-Edge', blurb: 'Optimal MEC placement for new workloads · trades off latency, cost, and energy.' }} />
      <GoldChips chips={['gold.mec_inventory', 'gold.workload_placement', 'silver.mec_latency', 'gold.break_out_hits']} />
      <StandardsRow chips={['ETSI MEC · ISG MEC', '3GPP TS 23.501 · MEC', 'O-RAN · O-Cloud', 'CNCF Helm', 'GSMA OPG']} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 14. /oss/slo — SLO/SLI · Error Budgets
// ════════════════════════════════════════════════════════════════════════════
const slos = [
  { service: 'Mobile Voice (P-CSCF Cx)', sli: 'attach success', target: 99.95, actual: 99.97, burn: 0.02, status: 'OK' },
  { service: '5G Data Plane (UPF)',      sli: 'session est.',  target: 99.9,  actual: 99.86, burn: 0.14, status: 'WARN' },
  { service: 'eSIM Activation',          sli: 'completion',    target: 99.5,  actual: 99.78, burn: 0.0,  status: 'OK' },
  { service: 'Roaming TAP3 Reconcile',   sli: '24h freshness', target: 99.0,  actual: 98.4,  burn: 0.32, status: 'WARN' },
  { service: 'NOC Incident MTTR',        sli: 'P1 < 30m',      target: 95.0,  actual: 96.4,  burn: 0.0,  status: 'OK' },
  { service: 'Bill Run Cycle Close',     sli: 'on-time',       target: 99.0,  actual: 99.2,  burn: 0.0,  status: 'OK' },
];
export function OssSlo() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <PageHeader kicker="OSS · SLO / SLI · Error Budgets" title="Service-level objectives & burn rates" subtitle="Per-service SLOs with burn-rate alerting. Error budgets aligned with FY24 commitments. Pages BSS dispute desk on burn-rate breach." />
      <div data-focus="kpi-strip" className={KpiStripCls}>
        <Kpi label="SLOs tracked" value={`${slos.length}`} />
        <Kpi label="OK" value={`${slos.filter((s) => s.status === 'OK').length}`} tone="good" />
        <Kpi label="Burning fast" value={`${slos.filter((s) => s.status === 'WARN').length}`} tone="warn" />
        <Kpi label="Avg 30d budget left" value="84%" tone="good" />
        <Kpi label="P1 burn alerts (30d)" value="4" delta="all auto-resolved" tone="good" />
        <Kpi label="Auto-credit triggers" value="0" tone="good" />
      </div>
      <div className="vf-card p-3 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
            <tr className="text-left"><th className="py-1.5 px-2">Service</th><th className="py-1.5 px-2">SLI</th><th className="py-1.5 px-2 text-right">Target</th><th className="py-1.5 px-2 text-right">Actual (30d)</th><th className="py-1.5 px-2 text-right">Burn</th><th className="py-1.5 px-2">Status</th></tr>
          </thead>
          <tbody>
            {slos.map((s) => (
              <tr key={s.service} className="border-b border-mist-dark/60">
                <td className="py-1.5 px-2 font-bold text-ink">{s.service}</td>
                <td className="py-1.5 px-2 text-ink-muted">{s.sli}</td>
                <td className="py-1.5 px-2 text-right font-mono">{s.target.toFixed(2)}%</td>
                <td className={cn('py-1.5 px-2 text-right font-mono font-bold', s.actual >= s.target ? 'text-emerald-700' : 'text-amber-700')}>{s.actual.toFixed(2)}%</td>
                <td className={cn('py-1.5 px-2 text-right font-mono', s.burn > 0.1 ? 'text-amber-700' : 'text-ink-muted')}>{s.burn.toFixed(2)}×</td>
                <td className="py-1.5 px-2"><span className={cn('vf-chip text-[10px]', s.status === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/30 text-amber-900')}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ModelCard m={{ name: 'slo_burnrate_v2', version: '2.1', metric: 'precision 0.92', drift: 'stable', refreshed: '4m ago', owner: 'OSS-SLO', blurb: 'Predicts burn-rate breach 6h ahead · pages on-call before customer-visible breach.' }} />
        <BandedLineChart data={[0.04, 0.06, 0.05, 0.08, 0.10, 0.08, 0.12, 0.14, 0.12, 0.10, 0.08, 0.07]} bands={[{ color: '#f59e0b', min: 0.0, max: 0.16 }]} label="UPF session-est. burn-rate · 12 weeks · target < 0.10×" />
      </div>
      <GoldChips chips={['gold.slo_definitions', 'gold.sli_measurements', 'gold.error_budgets', 'silver.burn_rate']} />
      <StandardsRow chips={['Google SRE · SLO/SLI', 'ITIL v4', 'TMF 921 · SLA Mgmt', 'Ofcom GC C1 · QoS', 'ISO 20000']} />
    </div>
  );
}
