import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Layers, Shield, Lock, Activity, ChevronRight, ChevronDown,
  GitBranch, Search, X, Filter,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
//  TM Forum SID 8-domain model
// ════════════════════════════════════════════════════════════════════════════
type SidDomain =
  | 'Market/Sales' | 'Product' | 'Customer' | 'Service'
  | 'Resource' | 'Engaged Party' | 'Common' | 'Enterprise';

const SID_DOMAINS: { id: SidDomain; tone: string; blurb: string }[] = [
  { id: 'Market/Sales',  tone: '#f59e0b', blurb: 'Campaigns, leads, sales channels, opportunities, contact strategy.' },
  { id: 'Product',       tone: '#d946ef', blurb: 'Catalog, offerings, specifications, pricing, promotions.' },
  { id: 'Customer',      tone: '#dc2626', blurb: 'Customer accounts, segments, interactions, satisfaction, problems.' },
  { id: 'Service',       tone: '#0ea5e9', blurb: 'Customer-facing & resource-facing services, qualification, configuration.' },
  { id: 'Resource',      tone: '#10b981', blurb: 'Logical & physical resources, RAN, IMS, transport, devices, numbers.' },
  { id: 'Engaged Party', tone: '#8b5cf6', blurb: 'Parties, organisations, individuals, roles, agreements.' },
  { id: 'Common',        tone: '#64748b', blurb: 'Locations, addresses, money, time, units, common types.' },
  { id: 'Enterprise',    tone: '#0f172a', blurb: 'Strategy, finance, HR, ESG, governance — corporate domain.' },
];

// ════════════════════════════════════════════════════════════════════════════
//  Database catalog (Tier-1 UK telco reality)
// ════════════════════════════════════════════════════════════════════════════
type Layer = 'bronze' | 'silver' | 'gold' | 'platinum' | 'view' | 'semantic';
type Classification = 'PII' | 'SOX' | 'PCI' | 'PSD2' | 'CDR' | 'None';
type Freshness = '5s' | '5min' | 'hour' | 'day';

interface ColumnSpec {
  name: string;
  type: string;
  classification?: Classification;
  pk?: boolean;
  fk?: string; // logical FK reference, free-form
}

interface TableSpec {
  name: string;
  layer: Layer;
  rows: number;
  freshness: Freshness;
  sourceVendor?: string;
  sidDomain: SidDomain;
  description: string;
  columns: ColumnSpec[];
  maskingPolicy?: string;
  dynamicTable?: boolean;
  targetLag?: string;
  refresh?: string; // free-form
}

interface SchemaSpec {
  name: string;
  description: string;
  sourceVendor: string;
  ingestPath: string;
  tables: TableSpec[];
}

interface DbSpec {
  name: string;
  description: string;
  schemas: SchemaSpec[];
}

const col = (name: string, type: string, classification?: Classification, opts?: Partial<ColumnSpec>): ColumnSpec =>
  ({ name, type, classification, ...opts });

// Compact table builder: cols is [name, type, ('pk'|classification)?, fk?][]
const col_table = (
  name: string,
  layer: Layer,
  rows: number,
  freshness: Freshness,
  sidDomain: SidDomain,
  description: string,
  cols: Array<[string, string] | [string, string, string] | [string, string, string, string]>,
  extra?: Partial<TableSpec>,
): TableSpec => ({
  name, layer, rows, freshness, sidDomain, description,
  columns: cols.map(([cn, ct, tag, fk]) => {
    const isPk = tag === 'pk';
    const cls = (tag && tag !== 'pk' ? tag : undefined) as Classification | undefined;
    return col(cn, ct, cls, { pk: isPk, fk });
  }),
  ...(extra ?? {}),
});

// ─── Tables (real Tier-1 UK telco) ──────────────────────────────────────────
const DB: DbSpec[] = [
  {
    name: 'SNOWTELCO_NETWORK',
    description: 'Network OSS · RAN, IMS, HSS, transport, probes — sub-second analytics over 7-year CDR retention.',
    schemas: [
      { name: 'bronze', description: 'Raw landings from RAN/Core/IMS vendors', sourceVendor: 'Multi-vendor', ingestPath: 'Snowpipe Streaming · Kafka · auto-ingest',
        tables: [
          { name: 'enm_pm_counters_raw',   layer: 'bronze', rows: 14_200_000_000, freshness: '5s', sourceVendor: 'Ericsson ENM',     sidDomain: 'Resource', description: 'Per-cell PM counters from Ericsson ENM (PRB, throughput, SR, BLER, RRC).',
            columns: [
              col('enb_id', 'NUMBER', undefined, { pk: true }),
              col('cell_id', 'NUMBER', undefined, { pk: true }),
              col('ts', 'TIMESTAMP_NTZ', undefined, { pk: true }),
              col('counter', 'STRING'), col('value', 'FLOAT'),
              col('vendor', 'STRING'),
            ] },
          { name: 'netact_alarms_raw',     layer: 'bronze', rows: 184_000_000,    freshness: '5s', sourceVendor: 'Nokia NetAct',     sidDomain: 'Resource', description: 'Multi-vendor alarm bus normalised at the EMS edge.',
            columns: [col('alarm_id', 'STRING', undefined, { pk: true }), col('ne_id', 'STRING'), col('severity', 'STRING'), col('raised_at', 'TIMESTAMP_NTZ'), col('cleared_at', 'TIMESTAMP_NTZ')] },
          { name: 'mavenir_diameter_raw',  layer: 'bronze', rows: 6_400_000_000,  freshness: '5s', sourceVendor: 'Mavenir IMS',      sidDomain: 'Service',  description: 'Diameter Cx / Sh / Gy logs from Mavenir IMS core.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('imsi', 'STRING', 'PII'), col('command', 'STRING'), col('result_code', 'NUMBER'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'oracle_hss_raw',        layer: 'bronze', rows: 12_400_000,     freshness: 'hour', sourceVendor: 'Oracle USPL HSS', sidDomain: 'Service',  description: 'HSS subscriber state snapshots — APN, AMF, profile.',
            columns: [col('imsi', 'STRING', 'PII', { pk: true }), col('msisdn', 'STRING', 'PII'), col('apn_profile', 'STRING'), col('mme', 'STRING'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'polystar_probes_raw',   layer: 'bronze', rows: 2_400_000_000,  freshness: '5s', sourceVendor: 'Polystar / Empirix', sidDomain: 'Resource', description: 'IP probe records · QoE per session.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('mos', 'FLOAT'), col('rtt_ms', 'NUMBER'), col('jitter_ms', 'NUMBER')] },
          { name: 'cdr_raw',               layer: 'bronze', rows: 184_000_000_000, freshness: '5s', sourceVendor: 'CSG Mediation',   sidDomain: 'Service',  description: '7-year retained CDRs · partitioned by date · PII tag-masked.', maskingPolicy: 'pii_msisdn_v3',
            columns: [col('cdr_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('imsi', 'STRING', 'PII'), col('start_ts', 'TIMESTAMP_NTZ'), col('duration_s', 'NUMBER'), col('apn', 'STRING'), col('bytes_in', 'NUMBER'), col('bytes_out', 'NUMBER')] },
          { name: 'tap3_raw',              layer: 'bronze', rows: 412_000_000,    freshness: 'hour', sourceVendor: 'Roaming partners', sidDomain: 'Service', description: 'GSMA TAP3.12 inbound roaming files.',
            columns: [col('tap_id', 'STRING', undefined, { pk: true }), col('partner', 'STRING'), col('imsi', 'STRING', 'PII'), col('charged_amount', 'NUMBER(18,4)'), col('charge_type', 'STRING')] },
          { name: 'ipx_raw',               layer: 'bronze', rows: 184_000_000,    freshness: 'hour', sourceVendor: 'GRX/IPX partners', sidDomain: 'Service', description: 'IPX corridor traffic & CDR metadata.',
            columns: [col('record_id', 'STRING', undefined, { pk: true }), col('corridor', 'STRING'), col('gb_consumed', 'NUMBER'), col('bill_period', 'STRING')] },
          { name: 'pcrf_policy_raw',       layer: 'bronze', rows: 8_400_000_000,  freshness: '5s', sourceVendor: 'Cisco PCRF',         sidDomain: 'Service', description: 'PCRF/PCF policy decisions (Gx/Sd) for charging + QoS.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('imsi', 'STRING', 'PII'), col('apn', 'STRING'), col('rule_name', 'STRING'), col('action', 'STRING')] },
          { name: 'mme_signalling_raw',    layer: 'bronze', rows: 6_400_000_000,  freshness: '5s', sourceVendor: 'Ericsson MME',       sidDomain: 'Service', description: 'S1-AP/NAS signalling logs (attach, TAU, handover).',
            columns: [col('event_id', 'STRING', undefined, { pk: true }), col('imsi', 'STRING', 'PII'), col('event_type', 'STRING'), col('cause_code', 'NUMBER'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'gnodeb_son_raw',        layer: 'bronze', rows: 2_400_000_000,  freshness: '5s', sourceVendor: 'Ericsson SON',       sidDomain: 'Resource', description: 'SON 5G gNodeB optimisation actions and outcomes.',
            columns: [col('action_id', 'STRING', undefined, { pk: true }), col('cell_id', 'NUMBER'), col('action', 'STRING'), col('result', 'STRING')] },
          { name: 'amf_smf_raw',           layer: 'bronze', rows: 4_800_000_000,  freshness: '5s', sourceVendor: 'Mavenir 5G Core',    sidDomain: 'Service', description: '5G AMF / SMF session-management logs.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('supi', 'STRING', 'PII'), col('slice_id', 'STRING'), col('event', 'STRING')] },
          { name: 'kafka_offsets_raw',     layer: 'bronze', rows: 184_000,        freshness: '5s', sourceVendor: 'Kafka',              sidDomain: 'Common', description: 'Kafka topic offsets / lag — pipeline health.',
            columns: [col('topic', 'STRING'), col('partition', 'NUMBER'), col('lag', 'NUMBER'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'sla_evidence_raw',      layer: 'bronze', rows: 18_400_000,     freshness: 'hour', sourceVendor: 'NIS2 evidence',     sidDomain: 'Enterprise', description: 'Telemetry samples retained for NIS2 / DORA evidence.',
            columns: [col('sample_id', 'STRING', undefined, { pk: true }), col('control_id', 'STRING'), col('captured_at', 'TIMESTAMP_NTZ')] },
        ] },
      { name: 'silver', description: 'Conformed, sessionised', sourceVendor: 'Curated', ingestPath: 'Streams + Tasks · Snowpark',
        tables: [
          { name: 'ran_telemetry',        layer: 'silver', rows: 2_400_000_000, freshness: '5s', sidDomain: 'Resource', description: 'Per-cell rolling KPI window (PRB, DL Mbps, BLER).', dynamicTable: true, targetLag: '5 seconds',
            columns: [col('cell_key', 'STRING', undefined, { pk: true }), col('window_start', 'TIMESTAMP_NTZ'), col('prb_util_dl', 'FLOAT'), col('dl_mbps', 'FLOAT'), col('bler', 'FLOAT'), col('rrc_drop', 'FLOAT')] },
          { name: 'alarm_window',         layer: 'silver', rows: 84_000_000,    freshness: '5s', sidDomain: 'Resource', description: 'Time-bucketed alarm aggregation per cluster.',
            columns: [col('cluster', 'STRING'), col('window_start', 'TIMESTAMP_NTZ'), col('crit_count', 'NUMBER'), col('major_count', 'NUMBER'), col('minor_count', 'NUMBER')] },
          { name: 'cdr_aggregates',       layer: 'silver', rows: 24_000_000_000, freshness: '5min', sidDomain: 'Service', description: 'Per-customer / per-day CDR aggregations.', dynamicTable: true, targetLag: '5 minutes',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('day', 'DATE'), col('voice_mins', 'NUMBER'), col('data_mb', 'NUMBER'), col('roam_mb', 'NUMBER'), col('intl_mins', 'NUMBER')] },
          { name: 'ims_session_state',    layer: 'silver', rows: 3_200_000,     freshness: '5s', sidDomain: 'Service', description: 'IMS active sessions (Hybrid Table).',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('p_cscf', 'STRING'), col('state', 'STRING'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'roaming_session',      layer: 'silver', rows: 184_000_000,   freshness: '5min', sidDomain: 'Service', description: 'Sessionised roaming events for charging reconciliation.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('imsi', 'STRING', 'PII'), col('partner', 'STRING'), col('plmn_visited', 'STRING'), col('total_mb', 'NUMBER')] },
          { name: 'ipx_corridor',         layer: 'silver', rows: 18_400_000,    freshness: 'hour', sidDomain: 'Service', description: 'IPX corridor settlement aggregates.',
            columns: [col('corridor', 'STRING', undefined, { pk: true }), col('month', 'DATE'), col('gb_consumed', 'NUMBER'), col('settlement_amount', 'NUMBER(18,4)')] },
          { name: 'signalling_correlated',layer: 'silver', rows: 240_000_000,   freshness: '5s', sidDomain: 'Service', description: 'Cross-NF signalling correlation (attach → bearer → CDR) — Hybrid Table.',
            columns: [col('correlation_id', 'STRING', undefined, { pk: true }), col('imsi', 'STRING', 'PII'), col('start_ts', 'TIMESTAMP_NTZ'), col('outcome', 'STRING')] },
          { name: 'slice_kpis',           layer: 'silver', rows: 18_400,        freshness: '5s', sidDomain: 'Service', description: 'Per-slice KPI aggregation (eMBB / URLLC / mMTC).', dynamicTable: true, targetLag: '5 seconds',
            columns: [col('slice_id', 'STRING', undefined, { pk: true }), col('window_start', 'TIMESTAMP_NTZ'), col('attach_success_pct', 'FLOAT'), col('p95_latency_ms', 'NUMBER')] },
          { name: 'son_recommendations',  layer: 'silver', rows: 184_000,       freshness: 'hour', sidDomain: 'Resource', description: 'SON-recommended changes (offset, TX, carrier add) with expected uplift.',
            columns: [col('rec_id', 'STRING', undefined, { pk: true }), col('cell_key', 'STRING'), col('action', 'STRING'), col('expected_uplift_pct', 'FLOAT')] },
        ] },
      { name: 'gold', description: 'Curated KPIs feeding NOC + CIC', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'cell_kpis',                 layer: 'gold', rows: 1_200_000_000, freshness: '5s', sidDomain: 'Resource', description: 'Authoritative per-cell KPI cube · feeds NOC live screen.', dynamicTable: true, targetLag: '5 seconds',
            columns: [col('cell_key', 'STRING', undefined, { pk: true }), col('window_start', 'TIMESTAMP_NTZ'), col('prb_util_dl', 'FLOAT'), col('dl_mbps', 'FLOAT'), col('anomaly_score', 'FLOAT'), col('cluster_id', 'STRING')] },
          { name: 'network_alarm_stream',      layer: 'gold', rows: 24_000_000,    freshness: '5s', sidDomain: 'Resource', description: 'Storm-detection feed for the NOC orchestrator.',
            columns: [col('alarm_id', 'STRING', undefined, { pk: true }), col('cluster_id', 'STRING'), col('severity', 'STRING'), col('first_raised', 'TIMESTAMP_NTZ'), col('correlation_key', 'STRING')] },
          { name: 'network_experience_score',  layer: 'gold', rows: 12_400_000,    freshness: '5min', sidDomain: 'Customer', description: 'Per-customer 14-day network experience.',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('nes_14d', 'FLOAT'), col('cell_set', 'ARRAY'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'tap3_reconcile',            layer: 'gold', rows: 184_000_000,   freshness: 'hour', sidDomain: 'Service', description: 'Roaming reconcile · auto-dispute hooks.',
            columns: [col('partner', 'STRING'), col('period', 'STRING'), col('reconcile_status', 'STRING'), col('delta_amount', 'NUMBER(18,4)')] },
          { name: 'roaming_pass_policy',       layer: 'gold', rows: 12_400_000,    freshness: '5min', sidDomain: 'Customer', description: 'Auto-enrol eligibility for Roaming Pass.',
            columns: [col('msisdn', 'STRING', 'PII'), col('auto_enrol_eligible', 'BOOLEAN'), col('travel_score', 'FLOAT')] },
          { name: 'ipx_traffic',               layer: 'gold', rows: 24_000_000,    freshness: 'hour', sidDomain: 'Service', description: 'IPX corridor view feeding wholesale settlement.',
            columns: [col('corridor', 'STRING'), col('month', 'DATE'), col('gb_consumed', 'NUMBER'), col('settlement_amount', 'NUMBER(18,4)')] },
          { name: 'site_inventory',            layer: 'gold', rows: 21_400,        freshness: 'day', sidDomain: 'Resource', description: 'Master cell-site dimension (lat/lon, vendor, region, technology mix).',
            columns: [col('site_id', 'STRING', undefined, { pk: true }), col('lat', 'FLOAT'), col('lon', 'FLOAT'), col('vendor', 'STRING'), col('region', 'STRING'), col('technologies', 'ARRAY')] },
          { name: 'agent_run_log',             layer: 'gold', rows: 1_840_000,     freshness: '5s', sidDomain: 'Common', description: 'Cortex Agent run audit · prompt + tool calls + result + cost (Event Tables-derived).',
            columns: [col('run_id', 'STRING', undefined, { pk: true }), col('agent', 'STRING'), col('scenario', 'STRING'), col('latency_ms', 'NUMBER'), col('cost_usd', 'NUMBER(10,4)'), col('outcome', 'STRING')] },
          { name: 'incident_master',           layer: 'gold', rows: 184_000,       freshness: '5min', sidDomain: 'Resource', description: 'Master incident register · joins ServiceNow + alarms + agent runs.',
            columns: [col('incident_id', 'STRING', undefined, { pk: true }), col('detected_at', 'TIMESTAMP_NTZ'), col('mttr_min', 'NUMBER'), col('severity', 'STRING'), col('post_mortem_id', 'STRING')] },
          { name: 'energy_attribution',        layer: 'gold', rows: 1_840_000,     freshness: 'day', sidDomain: 'Enterprise', description: 'kWh attributed to traffic × technology × time-band.',
            columns: [col('site_id', 'STRING'), col('day', 'DATE'), col('tech', 'STRING'), col('kwh', 'NUMBER'), col('co2_kg', 'NUMBER')] },
        ] },
      { name: 'platinum', description: 'Top-of-stack live products', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'network_health_index_5min', layer: 'platinum', rows: 184_000, freshness: '5s', sidDomain: 'Resource', description: 'Single rolling-5min health score per region · NOC home screen.', dynamicTable: true, targetLag: '5 seconds',
            columns: [col('region', 'STRING'), col('window_start', 'TIMESTAMP_NTZ'), col('health_index', 'FLOAT'), col('cells_red', 'NUMBER'), col('cells_amber', 'NUMBER')] },
        ] },
      { name: 'views', description: 'CREATE VIEW · query-time joins · permission-respecting · zero storage cost.', sourceVendor: 'Curated', ingestPath: 'Logical view · evaluated at read',
        tables: [
          { name: 'cell_state_now',           layer: 'view', rows: 184_000,    freshness: '5s', sidDomain: 'Resource', description: 'Latest 5-minute KPI per cell · joins gold.cell_kpis with site dimension.',
            columns: [col('cell_key', 'STRING', undefined, { pk: true }), col('region', 'STRING'), col('cluster_id', 'STRING'), col('prb_util_dl', 'FLOAT'), col('dl_mbps', 'FLOAT'), col('anomaly_score', 'FLOAT'), col('site_lat', 'FLOAT'), col('site_lon', 'FLOAT'), col('vendor', 'STRING')] },
          { name: 'top_alarms_today',         layer: 'view', rows: 4_200,      freshness: '5min', sidDomain: 'Resource', description: 'Today\'s alarms ranked by severity + impacted-customers, used by the NOC home screen.',
            columns: [col('alarm_id', 'STRING'), col('cluster_id', 'STRING'), col('severity', 'STRING'), col('first_raised', 'TIMESTAMP_NTZ'), col('impacted_subs', 'NUMBER'), col('runbook_id', 'STRING')] },
          { name: 'ims_health_now',           layer: 'view', rows: 24,         freshness: '5s', sidDomain: 'Service', description: 'Per-region IMS health (P-CSCF, S-CSCF, HSS Cx).',
            columns: [col('region', 'STRING'), col('p_cscf_avail', 'FLOAT'), col('s_cscf_avail', 'FLOAT'), col('hss_cx_latency_ms', 'NUMBER'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'slice_health_dashboard',   layer: 'view', rows: 1_200,      freshness: '5s', sidDomain: 'Service', description: '5G NSA / SA + slice (eMBB / URLLC / mMTC) live health.',
            columns: [col('slice_id', 'STRING'), col('slice_type', 'STRING'), col('attach_success', 'FLOAT'), col('p95_latency_ms', 'NUMBER'), col('throughput_mbps', 'FLOAT')] },
          { name: 'roaming_top_destinations', layer: 'view', rows: 184,        freshness: 'hour', sidDomain: 'Service', description: 'Top inbound + outbound roaming corridors today.',
            columns: [col('country', 'STRING'), col('partner', 'STRING'), col('subs', 'NUMBER'), col('gb_consumed', 'NUMBER'), col('arpu_uplift_24h', 'NUMBER(18,4)')] },
          { name: 'pir_evidence_pack',        layer: 'view', rows: 412,        freshness: 'hour', sidDomain: 'Resource', description: 'Joins alarms + KPI deltas + agent runs + Time-Travel snapshots — feeds Ofcom GC A3 PIR drafts.',
            columns: [col('incident_id', 'STRING'), col('detected_at', 'TIMESTAMP_NTZ'), col('mttr_min', 'NUMBER'), col('agent_run_id', 'STRING'), col('snapshot_at', 'TIMESTAMP_NTZ')] },
        ] },
      { name: 'semantic_views', description: 'Cortex Analyst semantic models — facts, dimensions, measures with synonyms + verified queries.', sourceVendor: 'Curated · semantic_view.yaml on @SEMANTIC_STAGE', ingestPath: 'Cortex Analyst · text-to-SQL',
        tables: [
          { name: 'NETWORK_KPI_SV',           layer: 'semantic', rows: 0, freshness: 'hour', sidDomain: 'Resource', description: 'Per-cell / per-cluster / per-region KPI semantic model. 14 verified queries.',
            columns: [
              col('fact: cell_kpis_5min', 'FACT', undefined, { fk: 'gold.cell_kpis' }),
              col('dim: region', 'DIM', undefined, { fk: 'silver.geo_postcode_lookup' }),
              col('dim: cluster',  'DIM'),
              col('dim: vendor',   'DIM'),
              col('dim: technology', 'DIM'),
              col('measure: dl_mbps_avg',     'MEASURE'),
              col('measure: prb_util_p95',    'MEASURE'),
              col('measure: dropped_call_pct','MEASURE'),
              col('measure: rrc_drop_pct',    'MEASURE'),
              col('measure: anomaly_score_max','MEASURE'),
            ] },
          { name: 'CDR_USAGE_SV',             layer: 'semantic', rows: 0, freshness: 'hour', sidDomain: 'Service', description: 'Per-customer CDR usage semantic model · feeds executive Q&A in Snowflake Intelligence.',
            columns: [
              col('fact: cdr_aggregates', 'FACT', undefined, { fk: 'silver.cdr_aggregates' }),
              col('dim: customer',  'DIM'),
              col('dim: plan',      'DIM'),
              col('dim: country',   'DIM'),
              col('measure: voice_mins',  'MEASURE'),
              col('measure: data_gb',     'MEASURE'),
              col('measure: roam_gb',     'MEASURE'),
              col('measure: intl_mins',   'MEASURE'),
            ] },
          { name: 'ROAMING_SV',               layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Service', description: 'Inbound + outbound roaming semantic model · TAP3 reconcile and partner settlement.',
            columns: [col('fact: roaming_session', 'FACT'), col('dim: partner', 'DIM'), col('dim: country', 'DIM'), col('measure: total_gb', 'MEASURE'), col('measure: settlement_amount', 'MEASURE')] },
        ] },
    ],
  },
  {
    name: 'SNOWTELCO_BSS',
    description: 'BSS · CRM, billing, OCS, mediation, fraud, RA — TMF 620 / 622 / 633 / 648 aligned.',
    schemas: [
      { name: 'bronze', description: 'Source-system landings', sourceVendor: 'Multi-vendor', ingestPath: 'Openflow CDC · Snowpipe Streaming',
        tables: [
          { name: 'amdocs_ces_raw',       layer: 'bronze', rows: 480_000_000, freshness: '5min', sourceVendor: 'Amdocs CES',       sidDomain: 'Customer',     description: 'Customer / billing CDC stream.',
            columns: [col('account_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('email', 'STRING', 'PII'), col('first_name', 'STRING', 'PII'), col('last_name', 'STRING', 'PII')] },
          { name: 'netcracker_orders_raw',layer: 'bronze', rows: 184_000_000, freshness: '5min', sourceVendor: 'Netcracker',       sidDomain: 'Service',      description: 'Order-management state.',
            columns: [col('order_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('order_state', 'STRING'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'salesforce_cdc_raw',   layer: 'bronze', rows: 84_000_000,  freshness: '5min', sourceVendor: 'Salesforce',       sidDomain: 'Customer',     description: 'Cases · interactions · opportunities.',
            columns: [col('object_id', 'STRING', undefined, { pk: true }), col('object_type', 'STRING'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'oracle_ofsc_raw',      layer: 'bronze', rows: 24_000_000,  freshness: 'hour', sourceVendor: 'Oracle OFSC',      sidDomain: 'Service',      description: 'Field-service work orders.',
            columns: [col('work_order_id', 'STRING', undefined, { pk: true }), col('status', 'STRING'), col('eta', 'TIMESTAMP_NTZ')] },
          { name: 'billing_raw',          layer: 'bronze', rows: 4_200_000_000, freshness: '5min', sourceVendor: 'Amdocs Billing', sidDomain: 'Customer',     description: 'Bill lines and runs.', maskingPolicy: 'pii_account_v2',
            columns: [col('bill_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('cycle', 'STRING'), col('amount', 'NUMBER(18,4)'), col('vat_amount', 'NUMBER(18,4)')] },
          { name: 'charging_raw',         layer: 'bronze', rows: 12_400_000_000, freshness: '5s', sourceVendor: 'Ericsson Charging', sidDomain: 'Service',     description: 'OCS Diameter Gy / Sy events (Hybrid Table).',
            columns: [col('event_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('balance_after', 'NUMBER(18,4)'), col('rated_amount', 'NUMBER(18,4)')] },
          { name: 'fraud_raw',            layer: 'bronze', rows: 84_000_000,  freshness: '5min', sourceVendor: 'Subex / WeDo',     sidDomain: 'Customer',     description: 'Fraud signals · IRSF · Wangiri · device.',
            columns: [col('signal_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('rule', 'STRING'), col('score', 'FLOAT')] },
          { name: 'genesys_cases_raw',    layer: 'bronze', rows: 184_000_000, freshness: '5min', sourceVendor: 'Genesys Cloud',    sidDomain: 'Customer',     description: 'Voice + chat case shells with sentiment + intent.',
            columns: [col('case_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('intent', 'STRING'), col('sentiment', 'FLOAT')] },
          { name: 'stripe_radar_raw',     layer: 'bronze', rows: 18_400_000,  freshness: '5min', sourceVendor: 'Stripe Radar',     sidDomain: 'Customer',     description: 'Card-payment risk decisions and 3DS outcomes.',
            columns: [col('charge_id', 'STRING', undefined, { pk: true }), col('risk_score', 'FLOAT'), col('outcome', 'STRING'), col('reason', 'STRING')] },
          { name: 'tmf620_catalog_raw',   layer: 'bronze', rows: 1_200_000,   freshness: 'day', sourceVendor: 'Amdocs CES',       sidDomain: 'Product',      description: 'TMF 620 catalog history (every published version).',
            columns: [col('catalog_version', 'STRING', undefined, { pk: true }), col('product_id', 'STRING'), col('published_at', 'TIMESTAMP_NTZ')] },
          { name: 'docusign_raw',         layer: 'bronze', rows: 1_840_000,   freshness: 'hour', sourceVendor: 'DocuSign',         sidDomain: 'Engaged Party', description: 'Signed B2B contracts (envelope IDs).',
            columns: [col('envelope_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('signed_at', 'TIMESTAMP_NTZ')] },
          { name: 'onfido_kyc_raw',       layer: 'bronze', rows: 4_200_000,   freshness: 'hour', sourceVendor: 'Onfido',           sidDomain: 'Customer',     description: 'KYC document + biometric verification outcomes.',
            columns: [col('check_id', 'STRING', undefined, { pk: true }), col('outcome', 'STRING'), col('confidence', 'FLOAT')] },
          { name: 'sinch_dispatch_raw',   layer: 'bronze', rows: 1_840_000_000, freshness: '5min', sourceVendor: 'Sinch',          sidDomain: 'Customer',     description: 'SMS / RCS / push delivery receipts.',
            columns: [col('message_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('channel', 'STRING'), col('status', 'STRING')] },
        ] },
      { name: 'silver', description: 'Conformed BSS entities', sourceVendor: 'Curated', ingestPath: 'Streams + Tasks · dbt',
        tables: [
          { name: 'accounts',         layer: 'silver', rows: 12_400_000, freshness: '5min', sidDomain: 'Customer',     description: 'Account master.',
            columns: [col('account_id', 'STRING', undefined, { pk: true }), col('legal_name', 'STRING', 'PII'), col('segment', 'STRING'), col('credit_limit', 'NUMBER(18,4)')] },
          { name: 'contracts',        layer: 'silver', rows: 14_200_000, freshness: 'day', sidDomain: 'Customer',     description: 'Contract register.',
            columns: [col('contract_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING', undefined, { fk: 'accounts.account_id' }), col('start_date', 'DATE'), col('end_date', 'DATE')] },
          { name: 'subscriptions',    layer: 'silver', rows: 12_400_000, freshness: '5min', sidDomain: 'Service',      description: 'Subscription state.',
            columns: [col('subscription_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('product_id', 'STRING'), col('status', 'STRING')] },
          { name: 'services',         layer: 'silver', rows: 18_400_000, freshness: '5min', sidDomain: 'Service',      description: 'TMF 633 service inventory.',
            columns: [col('service_id', 'STRING', undefined, { pk: true }), col('subscription_id', 'STRING'), col('service_spec', 'STRING'), col('state', 'STRING')] },
          { name: 'products',         layer: 'silver', rows: 184_000,    freshness: 'day', sidDomain: 'Product',      description: 'TMF 620 catalog (silver).',
            columns: [col('product_id', 'STRING', undefined, { pk: true }), col('product_spec', 'STRING'), col('price', 'NUMBER(18,4)')] },
          { name: 'quotes',           layer: 'silver', rows: 4_200_000,  freshness: '5min', sidDomain: 'Market/Sales', description: 'TMF 648 quote state.',
            columns: [col('quote_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('expected_value', 'NUMBER(18,4)'), col('win_propensity', 'FLOAT')] },
          { name: 'orders',           layer: 'silver', rows: 14_800_000, freshness: '5min', sidDomain: 'Service',      description: 'TMF 622 order state machine.',
            columns: [col('order_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('order_state', 'STRING'), col('fallout_propensity', 'FLOAT')] },
          { name: 'charges',          layer: 'silver', rows: 184_000_000, freshness: '5min', sidDomain: 'Customer',     description: 'Rated charges feeding bill engine.',
            columns: [col('charge_id', 'STRING', undefined, { pk: true }), col('subscription_id', 'STRING'), col('amount', 'NUMBER(18,4)')] },
          { name: 'bills',            layer: 'silver', rows: 184_000_000, freshness: '5min', sidDomain: 'Customer',     description: 'Generated invoices.',
            columns: [col('bill_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('amount', 'NUMBER(18,4)'), col('vat_amount', 'NUMBER(18,4)')] },
          { name: 'payments',         layer: 'silver', rows: 412_000_000, freshness: '5min', sidDomain: 'Customer',     description: 'Card / BACS payments ledger.', maskingPolicy: 'pci_card_v1',
            columns: [col('payment_id', 'STRING', undefined, { pk: true }), col('bill_id', 'STRING'), col('amount', 'NUMBER(18,4)'), col('method', 'STRING'), col('last4', 'STRING', 'PCI')] },
          { name: 'fraud_signal',     layer: 'silver', rows: 84_000_000,  freshness: '5min', sidDomain: 'Customer',     description: 'Conformed fraud features.',
            columns: [col('signal_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('score', 'FLOAT'), col('rule', 'STRING')] },
          { name: 'party',            layer: 'silver', rows: 14_200_000, freshness: 'day', sidDomain: 'Engaged Party', description: 'TMF SID Party (individuals + organisations).',
            columns: [col('party_id', 'STRING', undefined, { pk: true }), col('party_type', 'STRING'), col('legal_name', 'STRING', 'PII')] },
          { name: 'billing_account',  layer: 'silver', rows: 14_400_000, freshness: '5min', sidDomain: 'Customer', description: 'TMF SID Billing Account (1..* per customer).',
            columns: [col('billing_account_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('currency', 'STRING'), col('payment_method', 'STRING')] },
          { name: 'contact_medium',   layer: 'silver', rows: 24_400_000, freshness: 'day', sidDomain: 'Engaged Party', description: 'TMF SID Contact Medium (email, phone, address).', maskingPolicy: 'pii_contact_v1',
            columns: [col('contact_id', 'STRING', undefined, { pk: true }), col('party_id', 'STRING'), col('type', 'STRING'), col('value', 'STRING', 'PII')] },
          { name: 'agreement',        layer: 'silver', rows: 14_200_000, freshness: 'day', sidDomain: 'Engaged Party', description: 'TMF SID Agreement (consent, contract terms).',
            columns: [col('agreement_id', 'STRING', undefined, { pk: true }), col('party_id', 'STRING'), col('status', 'STRING'), col('effective_from', 'DATE')] },
          { name: 'product_offering', layer: 'silver', rows: 4_200,      freshness: 'day', sidDomain: 'Product', description: 'TMF SID ProductOffering · catalog v126.',
            columns: [col('offering_id', 'STRING', undefined, { pk: true }), col('product_id', 'STRING'), col('price', 'NUMBER(18,4)'), col('valid_from', 'DATE'), col('valid_to', 'DATE')] },
          { name: 'price_plan',       layer: 'silver', rows: 24_000,     freshness: 'day', sidDomain: 'Product', description: 'Price plan rate cards.',
            columns: [col('plan_id', 'STRING', undefined, { pk: true }), col('rate_band', 'STRING'), col('unit_rate', 'NUMBER(18,4)')] },
          col_table('promotion', 'silver', 184_000, 'day', 'Product', 'Promotion register · stacking-aware.', [['promo_id','STRING','pk'],['stacking_group','STRING'],['discount_pct','FLOAT'],['valid_to','DATE']]),
          col_table('campaign',  'silver', 4_200,   'day', 'Market/Sales', 'Marketing campaign master with budget + audience.', [['campaign_id','STRING','pk'],['name','STRING'],['budget','NUMBER(18,4)'],['audience_size','NUMBER']]),
          col_table('voucher',   'silver', 12_400_000, 'day', 'Customer', 'Voucher / coupon codes (PII none).', [['voucher_code','STRING','pk'],['campaign_id','STRING'],['redeemed','BOOLEAN']]),
          col_table('msisdn_register','silver',12_400_000,'day','Resource','MSISDN bank · TMF Resource.',[['msisdn','STRING','pk'],['status','STRING'],['allocated_at','TIMESTAMP_NTZ']]),
          col_table('sim_inventory','silver',14_400_000,'day','Resource','SIM / eSIM inventory.',[['iccid','STRING','pk'],['type','STRING'],['state','STRING']]),
          col_table('msisdn_port_register','silver',1_840_000,'5min','Resource','Number portability events (MNP).',[['port_id','STRING','pk'],['msisdn','STRING'],['donor_mno','STRING'],['recipient_mno','STRING']]),
        ] },
      { name: 'gold', description: 'Decision-ready features', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables · Snowpark ML',
        tables: [
          { name: 'churn_features',         layer: 'gold', rows: 12_400_000, freshness: '5min', sidDomain: 'Customer', description: '30+ feature columns feeding CHURN_MODEL_UK_MOBILE_V3.2.',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('days_to_renewal', 'NUMBER'), col('bill_shock_flag', 'BOOLEAN'), col('competitor_pressure_score', 'FLOAT'), col('app_session_trend_30d', 'FLOAT'), col('pac_indicator', 'BOOLEAN'), col('open_complaint_age_days', 'NUMBER')] },
          { name: 'bill_shock_features',    layer: 'gold', rows: 12_400_000, freshness: 'hour', sidDomain: 'Customer', description: 'Bill-shock forecast features.',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('forecast_bill', 'NUMBER(18,4)'), col('p_shock', 'FLOAT')] },
          { name: 'ecl_provisions',         layer: 'gold', rows: 6_400_000,  freshness: 'day', sidDomain: 'Enterprise', description: 'IFRS 9 ECL stages 1/2/3 provisions.',
            columns: [col('account_id', 'STRING', undefined, { pk: true }), col('ifrs9_stage', 'NUMBER'), col('ecl_amount', 'NUMBER(18,4)')] },
          { name: 'order_fallout_features', layer: 'gold', rows: 14_800_000, freshness: '5min', sidDomain: 'Service',  description: 'Fallout propensity per active order.',
            columns: [col('order_id', 'STRING', undefined, { pk: true }), col('fallout_propensity', 'FLOAT'), col('top_driver', 'STRING')] },
          { name: 'clv_register',           layer: 'gold', rows: 12_400_000, freshness: 'day', sidDomain: 'Customer', description: 'Per-customer CLV.',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('ltv_estimate', 'NUMBER(18,4)'), col('tier', 'STRING')] },
          { name: 'cross_sell_features',    layer: 'gold', rows: 12_400_000, freshness: 'day', sidDomain: 'Market/Sales', description: 'Next-best-product propensity matrix.',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('next_best_product', 'STRING'), col('propensity', 'FLOAT')] },
          { name: 'revrec_obligations',     layer: 'gold', rows: 14_200_000, freshness: 'day', sidDomain: 'Enterprise', description: 'IFRS 15 performance obligations.',
            columns: [col('obligation_id', 'STRING', undefined, { pk: true }), col('contract_id', 'STRING'), col('ssp_amount', 'NUMBER(18,4)'), col('recognised_amount', 'NUMBER(18,4)')] },
          { name: 'deferred_revenue',       layer: 'gold', rows: 14_200_000, freshness: 'day', sidDomain: 'Enterprise', description: 'Deferred revenue lattice.',
            columns: [col('contract_id', 'STRING', undefined, { pk: true }), col('period', 'DATE'), col('deferred_amount', 'NUMBER(18,4)')] },
          { name: 'tax_ledger',             layer: 'gold', rows: 184_000_000, freshness: 'day', sidDomain: 'Enterprise', description: 'HMRC MTD VAT line-coverage register.',
            columns: [col('bill_id', 'STRING', undefined, { pk: true }), col('vat_rate', 'FLOAT'), col('vat_amount', 'NUMBER(18,4)')] },
          { name: 'gl_journals',            layer: 'gold', rows: 184_000_000, freshness: 'day', sidDomain: 'Enterprise', description: 'Posted journals to SAP S/4.',
            columns: [col('journal_id', 'STRING', undefined, { pk: true }), col('account_code', 'STRING'), col('amount', 'NUMBER(18,4)'), col('period', 'STRING')] },
          { name: 'partner_settlements',    layer: 'gold', rows: 24_000_000,  freshness: 'day', sidDomain: 'Engaged Party', description: 'Wholesale + roaming settlements.',
            columns: [col('partner', 'STRING', undefined, { pk: true }), col('period', 'DATE'), col('settlement_amount', 'NUMBER(18,4)')] },
          { name: 'cash_position',          layer: 'gold', rows: 1_840,      freshness: 'day', sidDomain: 'Enterprise', description: 'Daily cash balance (treasury).',
            columns: [col('day', 'DATE', undefined, { pk: true }), col('opening_balance', 'NUMBER(18,4)'), col('closing_balance', 'NUMBER(18,4)')] },
          { name: 'geo_revenue',            layer: 'gold', rows: 184_000,    freshness: 'day', sidDomain: 'Market/Sales', description: 'Per-postcode ARPU density.',
            columns: [col('postcode', 'STRING', undefined, { pk: true }), col('arpu_density', 'NUMBER(18,4)'), col('subscribers', 'NUMBER')] },
          { name: 'product_performance',    layer: 'gold', rows: 184_000,    freshness: 'day', sidDomain: 'Product', description: 'Per-product revenue + attach + churn.',
            columns: [col('product_id', 'STRING', undefined, { pk: true }), col('revenue', 'NUMBER(18,4)'), col('attach_rate', 'FLOAT'), col('churn_rate_30d', 'FLOAT')] },
          col_table('decision_lineage',  'gold', 8_400_000, '5min', 'Common', 'Every NBA / agent decision · feature snapshot · model version · audit row.', [['decision_id','STRING','pk'],['model_version','STRING'],['features_hash','STRING'],['ts','TIMESTAMP_NTZ']]),
          col_table('vulnerability_register','gold',184_000,'day','Customer','Ofcom GC C5 + ICO vulnerability flags.',[['vlr_id','STRING','pk'],['msisdn','STRING','PII'],['flag','STRING'],['expires_at','TIMESTAMP_NTZ']],{ maskingPolicy: 'vulnerability_v1' }),
          col_table('consent_register',  'gold', 24_400_000,'day','Customer','GDPR consent state per customer × purpose.',[['msisdn','STRING','pk','PII'],['purpose','STRING'],['granted','BOOLEAN'],['updated_at','TIMESTAMP_NTZ']]),
          col_table('renewal_register',  'gold', 14_200_000,'day','Customer','Upcoming renewal windows + propensity.',[['contract_id','STRING','pk'],['renewal_date','DATE'],['churn_propensity','FLOAT']]),
          col_table('refund_ledger',     'gold', 12_400_000,'day','Customer','Refunds with margin-floor + dual-control trail.',[['refund_id','STRING','pk'],['amount','NUMBER(18,4)'],['reason','STRING'],['dual_control_id','STRING']]),
          col_table('disputes',          'gold', 4_200_000, '5min','Customer','Bill disputes register · auto-triage outcome.',[['dispute_id','STRING','pk'],['account_id','STRING'],['amount','NUMBER(18,4)'],['status','STRING']]),
          col_table('pre_bill_qa',       'gold', 184_000_000,'day','Customer','Pre-bill QA outcomes (anomaly · tariff lookup · rounding).',[['bill_id','STRING','pk'],['qa_outcome','STRING'],['anomaly_score','FLOAT']]),
          col_table('promo_eligibility', 'gold', 24_400_000,'day','Product','Resolved promo eligibility (stacking + frequency cap).',[['msisdn','STRING','pk','PII'],['promo_id','STRING'],['eligible','BOOLEAN'],['suppressed_reason','STRING']]),
          col_table('engagement_features','gold',12_400_000,'day','Customer','App / web / care engagement matrix.',[['msisdn','STRING','pk','PII'],['app_session_30d','NUMBER'],['nps','NUMBER'],['care_contacts_90d','NUMBER']]),
          col_table('mfa_register',      'gold', 12_400_000,'day','Customer','Strong-customer-authentication state per account.',[['account_id','STRING','pk'],['method','STRING'],['enrolled_at','TIMESTAMP_NTZ']]),
          col_table('sim_swap_register', 'gold', 4_200_000, '5min','Customer','SIM-swap signals · velocity + ATO risk.',[['msisdn','STRING','pk','PII'],['signal_at','TIMESTAMP_NTZ'],['risk','FLOAT'],['blocked','BOOLEAN']]),
          col_table('cards_on_file',     'gold', 18_400_000,'day','Customer','Tokenised cards on file (PCI-tokenised).',[['account_id','STRING','pk'],['last4','STRING','PCI'],['brand','STRING'],['expires','STRING']],{ maskingPolicy: 'pci_card_v1' }),
          col_table('dd_attempts',       'gold', 24_400_000,'day','Customer','BACS Direct Debit attempts and outcomes.',[['attempt_id','STRING','pk'],['account_id','STRING'],['attempt_no','NUMBER'],['outcome','STRING']]),
          col_table('cash_forecast',     'gold', 1_840,    'day','Enterprise','14-day cash forecast (Snowpark ML).',[['day','DATE','pk'],['forecast_amount','NUMBER(18,4)'],['mape','FLOAT']]),
          col_table('revenue_movements', 'gold', 184_000,  'day','Enterprise','Revenue waterfall (new + cross-sell + churn − refunds).',[['day','DATE','pk'],['movement_kind','STRING'],['amount','NUMBER(18,4)']]),
        ] },
      { name: 'platinum', description: 'Live products', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables · Streamlit serving',
        tables: [
          { name: 'customer360',                  layer: 'platinum', rows: 12_400_000, freshness: '5min', sidDomain: 'Customer', description: 'Single live customer pane (joins ~24 tables).', dynamicTable: true, targetLag: '5 minutes',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('clv', 'NUMBER(18,4)'), col('churn_risk', 'FLOAT'), col('nes_14d', 'FLOAT'), col('open_cases', 'NUMBER')] },
          { name: 'revenue_assurance_dashboard',  layer: 'platinum', rows: 4_800,      freshness: '5min', sidDomain: 'Enterprise', description: 'Daily leakage + recovery view.',
            columns: [col('day', 'DATE', undefined, { pk: true }), col('leakage_pp', 'FLOAT'), col('recovered_amount', 'NUMBER(18,4)')] },
          { name: 'dunning_optimisation',         layer: 'platinum', rows: 12_400,     freshness: 'day', sidDomain: 'Customer', description: 'Daily dunning wave optimal channel + tone.',
            columns: [col('account_id', 'STRING'), col('channel', 'STRING'), col('tone', 'STRING'), col('expected_recovery', 'NUMBER(18,4)')] },
        ] },
      { name: 'views', description: 'CRM / billing / commerce convenience views.', sourceVendor: 'Curated', ingestPath: 'Logical view',
        tables: [
          { name: 'active_subscriptions_now', layer: 'view', rows: 12_400_000, freshness: '5min', sidDomain: 'Service',  description: 'Active subscriptions joined with product + plan + price.',
            columns: [col('subscription_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('product_name', 'STRING'), col('mrr', 'NUMBER(18,4)'), col('contract_end', 'DATE')] },
          { name: 'mrr_today',                layer: 'view', rows: 1,          freshness: 'day', sidDomain: 'Enterprise', description: 'Daily MRR snapshot (active × monthly recurring).',
            columns: [col('day', 'DATE', undefined, { pk: true }), col('mrr', 'NUMBER(18,4)'), col('arr', 'NUMBER(18,4)'), col('subs', 'NUMBER')] },
          { name: 'customer360_view',         layer: 'view', rows: 12_400_000, freshness: '5min', sidDomain: 'Customer', description: 'Joined view across accounts × subs × cases × CLV × NES — drives Customer 360.',
            columns: [col('msisdn', 'STRING', 'PII', { pk: true }), col('legal_name', 'STRING', 'PII'), col('clv', 'NUMBER(18,4)'), col('churn_risk', 'FLOAT'), col('nes_14d', 'FLOAT'), col('open_cases', 'NUMBER')] },
          { name: 'dunning_today',            layer: 'view', rows: 184_000,    freshness: 'day', sidDomain: 'Customer', description: 'Customers in dunning today, with vulnerability flag and recovery NBA.',
            columns: [col('account_id', 'STRING', undefined, { pk: true }), col('dpd', 'NUMBER'), col('vulnerable_flag', 'BOOLEAN'), col('recommended_channel', 'STRING')] },
          { name: 'churn_top100',             layer: 'view', rows: 100,        freshness: '5min', sidDomain: 'Customer', description: 'Top 100 churn-risk customers right now (ranked by CLV × risk).',
            columns: [col('msisdn', 'STRING', 'PII'), col('rank', 'NUMBER'), col('churn_risk', 'FLOAT'), col('clv', 'NUMBER(18,4)'), col('top_driver', 'STRING')] },
          { name: 'billing_run_status',       layer: 'view', rows: 12,         freshness: '5min', sidDomain: 'Customer', description: 'Live status of the in-flight billing cycle.',
            columns: [col('cycle', 'STRING', undefined, { pk: true }), col('rows_processed', 'NUMBER'), col('exceptions', 'NUMBER'), col('eta', 'TIMESTAMP_NTZ'), col('pre_bill_qa_pass_pct', 'FLOAT')] },
          { name: 'fraud_open_cases',         layer: 'view', rows: 4_200,      freshness: '5min', sidDomain: 'Customer', description: 'Open fraud cases (IRSF, Wangiri, SIM-swap, account-takeover).',
            columns: [col('case_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('rule', 'STRING'), col('score', 'FLOAT')] },
          { name: 'arpu_by_segment',          layer: 'view', rows: 1_200,      freshness: 'day', sidDomain: 'Market/Sales', description: 'ARPU per customer segment × tariff family × postcode region.',
            columns: [col('segment', 'STRING'), col('plan_family', 'STRING'), col('region', 'STRING'), col('arpu', 'NUMBER(18,4)'), col('subscribers', 'NUMBER')] },
          { name: 'tmf620_catalog_active',    layer: 'view', rows: 4_200,      freshness: 'day', sidDomain: 'Product', description: 'Active TMF 620 product offerings (catalog v126 published).',
            columns: [col('product_id', 'STRING', undefined, { pk: true }), col('product_name', 'STRING'), col('price', 'NUMBER(18,4)'), col('valid_from', 'DATE')] },
        ] },
      { name: 'semantic_views', description: 'Cortex Analyst semantic models — exec Q&A over commerce + finance + customer.', sourceVendor: 'Curated · semantic_view.yaml on @SEMANTIC_STAGE', ingestPath: 'Cortex Analyst · text-to-SQL',
        tables: [
          { name: 'COMMERCE_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Market/Sales', description: 'Order-to-cash semantic model · 28 verified queries.',
            columns: [
              col('fact: orders',  'FACT', undefined, { fk: 'silver.orders' }),
              col('fact: bills',   'FACT', undefined, { fk: 'silver.bills' }),
              col('fact: payments','FACT', undefined, { fk: 'silver.payments' }),
              col('dim: customer', 'DIM'),
              col('dim: product',  'DIM'),
              col('dim: channel',  'DIM'),
              col('dim: period',   'DIM'),
              col('measure: orders_count',     'MEASURE'),
              col('measure: conversion_rate',  'MEASURE'),
              col('measure: aov',              'MEASURE'),
              col('measure: revenue',          'MEASURE'),
              col('measure: refund_rate',      'MEASURE'),
            ] },
          { name: 'FINANCE_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Enterprise', description: 'IFRS 9 / 15 + tax + close · audit-ready.',
            columns: [
              col('fact: revrec_obligations', 'FACT', undefined, { fk: 'gold.revrec_obligations' }),
              col('fact: ecl_provisions',     'FACT', undefined, { fk: 'gold.ecl_provisions' }),
              col('fact: gl_journals',        'FACT'),
              col('dim: contract',            'DIM'),
              col('dim: period',              'DIM'),
              col('dim: stage',               'DIM'),
              col('measure: arr',                'MEASURE'),
              col('measure: mrr',                'MEASURE'),
              col('measure: deferred_revenue',   'MEASURE'),
              col('measure: ecl_total',          'MEASURE'),
              col('measure: vat_due',            'MEASURE'),
            ] },
          { name: 'CUSTOMER_SV', layer: 'semantic', rows: 0, freshness: '5min', sidDomain: 'Customer', description: 'CLV · churn · NPS · vulnerability · NBA — used by CIC + Digital agents.',
            columns: [
              col('fact: customer360',          'FACT', undefined, { fk: 'platinum.customer360' }),
              col('fact: cases',                'FACT'),
              col('dim: segment',               'DIM'),
              col('dim: region',                'DIM'),
              col('dim: tenure_band',           'DIM'),
              col('measure: clv_avg',           'MEASURE'),
              col('measure: churn_rate',        'MEASURE'),
              col('measure: nps',               'MEASURE'),
              col('measure: arpu',              'MEASURE'),
              col('measure: complaint_rate',    'MEASURE'),
            ] },
          { name: 'WHOLESALE_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Engaged Party', description: 'MVNO + roaming + IPX wholesale settlement.',
            columns: [col('fact: partner_settlements', 'FACT'), col('dim: partner', 'DIM'), col('dim: corridor', 'DIM'), col('measure: settlement_amount', 'MEASURE'), col('measure: gb_consumed', 'MEASURE')] },
        ] },
    ],
  },
  {
    name: 'SNOWTELCO_OSS',
    description: 'OSS · inventory, fulfilment, capacity, field force, energy & ESG.',
    schemas: [
      { name: 'bronze', description: 'OSS source landings', sourceVendor: 'Multi-vendor', ingestPath: 'Openflow CDC · webhooks',
        tables: [
          { name: 'netcracker_inv_raw',   layer: 'bronze', rows: 184_000_000, freshness: 'hour', sourceVendor: 'Netcracker Inventory', sidDomain: 'Resource', description: 'Logical + physical inventory.',
            columns: [col('resource_id', 'STRING', undefined, { pk: true }), col('parent_id', 'STRING'), col('type', 'STRING'), col('state', 'STRING')] },
          { name: 'cramer_raw',           layer: 'bronze', rows: 24_000_000,  freshness: 'day', sourceVendor: 'Cramer',              sidDomain: 'Resource', description: 'Legacy fixed-line inventory.',
            columns: [col('resource_id', 'STRING', undefined, { pk: true }), col('site', 'STRING')] },
          { name: 'servicenow_cmdb_raw',  layer: 'bronze', rows: 84_000_000,  freshness: 'hour', sourceVendor: 'ServiceNow CMDB',     sidDomain: 'Resource', description: 'CMDB CIs and relationships.',
            columns: [col('ci_id', 'STRING', undefined, { pk: true }), col('class', 'STRING'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'fsl_raw',              layer: 'bronze', rows: 12_400_000,  freshness: 'hour', sourceVendor: 'Salesforce FSL',      sidDomain: 'Service',  description: 'Field-service work orders + dispatch.',
            columns: [col('work_order_id', 'STRING', undefined, { pk: true }), col('engineer_id', 'STRING'), col('status', 'STRING')] },
          { name: 'energy_raw',           layer: 'bronze', rows: 184_000_000, freshness: '5min', sourceVendor: 'Ericsson EnergyController', sidDomain: 'Resource', description: 'Per-site power telemetry.',
            columns: [col('site_id', 'STRING', undefined, { pk: true }), col('ts', 'TIMESTAMP_NTZ'), col('watts', 'NUMBER'), col('mode', 'STRING')] },
          col_table('clicksoftware_raw','bronze',12_400_000,'hour','Service','ClickSoftware FSM dispatch + tracking events.',[['event_id','STRING','pk'],['engineer_id','STRING'],['event','STRING']],{ sourceVendor: 'ClickSoftware' }),
          col_table('cramer_routes_raw','bronze',8_400_000,'day','Resource','Legacy circuit routing data.',[['circuit_id','STRING','pk'],['endpoints','ARRAY']],{ sourceVendor: 'Cramer' }),
          col_table('jira_change_raw','bronze',1_200_000,'hour','Common','Change tickets ingested from Jira Service Management.',[['change_id','STRING','pk'],['risk','STRING'],['cab_status','STRING']],{ sourceVendor: 'Jira' }),
        ] },
      { name: 'silver', description: 'OSS conformed', sourceVendor: 'Curated', ingestPath: 'Streams + Tasks',
        tables: [
          { name: 'inventory_state',  layer: 'silver', rows: 184_000_000, freshness: 'hour', sidDomain: 'Resource', description: 'Inventory current state.',
            columns: [col('resource_id', 'STRING', undefined, { pk: true }), col('parent_id', 'STRING'), col('state', 'STRING'), col('updated_at', 'TIMESTAMP_NTZ')] },
          { name: 'cmdb_state',       layer: 'silver', rows: 84_000_000,  freshness: 'hour', sidDomain: 'Resource', description: 'CI master.',
            columns: [col('ci_id', 'STRING', undefined, { pk: true }), col('class', 'STRING'), col('owner', 'STRING')] },
          { name: 'work_orders',      layer: 'silver', rows: 12_400_000,  freshness: 'hour', sidDomain: 'Service',  description: 'Work-order register.',
            columns: [col('work_order_id', 'STRING', undefined, { pk: true }), col('engineer_id', 'STRING'), col('eta', 'TIMESTAMP_NTZ')] },
          { name: 'capacity_window',  layer: 'silver', rows: 184_000,     freshness: 'hour', sidDomain: 'Resource', description: 'Cell-cluster capacity windows.',
            columns: [col('cluster_id', 'STRING'), col('window_start', 'TIMESTAMP_NTZ'), col('headroom_pct', 'FLOAT')] },
          { name: 'energy_window',    layer: 'silver', rows: 84_000_000,  freshness: '5min', sidDomain: 'Resource', description: 'Per-site rolling power window.',
            columns: [col('site_id', 'STRING'), col('window_start', 'TIMESTAMP_NTZ'), col('avg_watts', 'NUMBER')] },
          col_table('site_master',    'silver', 21_400, 'day','Resource','Master site dimension joined across Netcracker / Cramer / CMDB.',[['site_id','STRING','pk'],['lat','FLOAT'],['lon','FLOAT'],['vendor_mix','ARRAY']]),
          col_table('engineer_roster','silver',2_400,'hour','Engaged Party','Field-engineer roster + skill matrix.',[['engineer_id','STRING','pk'],['skills','ARRAY'],['shift','STRING']]),
          col_table('cmdb_relationships','silver',184_000_000,'hour','Resource','CI parent/child + depends-on graph.',[['parent_id','STRING'],['child_id','STRING'],['rel_type','STRING']]),
        ] },
      { name: 'gold', description: 'OSS gold features', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'inventory_drift',     layer: 'gold', rows: 4_200,    freshness: 'day', sidDomain: 'Resource', description: 'Diff between Netcracker / Cramer / CMDB.',
            columns: [col('resource_id', 'STRING', undefined, { pk: true }), col('drift_class', 'STRING'), col('found_in', 'ARRAY')] },
          { name: 'capacity_forecast',   layer: 'gold', rows: 184_000,  freshness: 'day', sidDomain: 'Resource', description: '14-day per-cluster forecast.',
            columns: [col('cluster_id', 'STRING', undefined, { pk: true }), col('horizon_d', 'NUMBER'), col('p95_util', 'FLOAT')] },
          { name: 'fieldforce_routing',  layer: 'gold', rows: 12_400,   freshness: 'hour', sidDomain: 'Service', description: 'Optimised routing for engineers.',
            columns: [col('shift_id', 'STRING'), col('engineer_id', 'STRING'), col('route_kpi', 'FLOAT')] },
          { name: 'energy_co2_index',    layer: 'gold', rows: 21_400,   freshness: 'day', sidDomain: 'Enterprise', description: 'kWh / CO₂ per site (ESG).',
            columns: [col('site_id', 'STRING', undefined, { pk: true }), col('day', 'DATE'), col('kwh', 'NUMBER'), col('co2_kg', 'NUMBER')] },
          col_table('change_register',   'gold', 1_840_000, 'day','Common','Change register · CAB approval · risk · post-implementation review.',[['change_id','STRING','pk'],['cab_outcome','STRING'],['pir_id','STRING']]),
          col_table('topology_snapshot', 'gold', 21_400,    'day','Resource','Daily inventory snapshot (Time Travel anchor for drift).',[['site_id','STRING','pk'],['snapshot_at','TIMESTAMP_NTZ']]),
        ] },
      { name: 'platinum', description: 'OSS live products', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'esg_scorecard', layer: 'platinum', rows: 1_840, freshness: 'day', sidDomain: 'Enterprise', description: 'Executive ESG view.',
            columns: [col('day', 'DATE', undefined, { pk: true }), col('co2_kg_total', 'NUMBER'), col('renewable_pct', 'FLOAT')] },
        ] },
      { name: 'views', description: 'OSS convenience views.', sourceVendor: 'Curated', ingestPath: 'Logical view',
        tables: [
          { name: 'open_work_orders',     layer: 'view', rows: 24_800, freshness: 'hour', sidDomain: 'Service', description: 'Open OSS work orders with engineer + ETA + SLA breach risk.',
            columns: [col('work_order_id', 'STRING', undefined, { pk: true }), col('engineer_id', 'STRING'), col('eta', 'TIMESTAMP_NTZ'), col('sla_breach_risk', 'FLOAT')] },
          { name: 'capacity_red_clusters',layer: 'view', rows: 184,    freshness: 'hour', sidDomain: 'Resource', description: 'Clusters above 80% PRB or above forecast head-room threshold.',
            columns: [col('cluster_id', 'STRING', undefined, { pk: true }), col('p95_util', 'FLOAT'), col('horizon_d', 'NUMBER'), col('recommended_action', 'STRING')] },
          { name: 'energy_top_drainers',  layer: 'view', rows: 200,    freshness: '5min', sidDomain: 'Resource', description: 'Top 200 energy-draining sites today (kWh) — feeds energy-save automation.',
            columns: [col('site_id', 'STRING', undefined, { pk: true }), col('kwh_24h', 'NUMBER'), col('mode', 'STRING'), col('savings_potential_pct', 'FLOAT')] },
          { name: 'inventory_drift_today',layer: 'view', rows: 4_200,  freshness: 'day', sidDomain: 'Resource', description: 'Diffs between Netcracker / Cramer / CMDB seen today.',
            columns: [col('resource_id', 'STRING', undefined, { pk: true }), col('drift_class', 'STRING'), col('found_in', 'ARRAY')] },
        ] },
      { name: 'semantic_views', description: 'OSS semantic models for Cortex Analyst Q&A.', sourceVendor: 'Curated · semantic_view.yaml', ingestPath: 'Cortex Analyst',
        tables: [
          { name: 'OSS_INVENTORY_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Resource', description: 'Inventory + capacity + field force.',
            columns: [
              col('fact: inventory_state',  'FACT'),
              col('fact: work_orders',      'FACT'),
              col('dim: site',              'DIM'),
              col('dim: resource_class',    'DIM'),
              col('dim: engineer',          'DIM'),
              col('measure: inventory_count','MEASURE'),
              col('measure: drift_count',    'MEASURE'),
              col('measure: wo_open',        'MEASURE'),
              col('measure: sla_breach_pct', 'MEASURE'),
            ] },
          { name: 'ESG_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Enterprise', description: 'kWh / CO₂ per site, renewable mix, abatement actions.',
            columns: [col('fact: energy_co2_index', 'FACT'), col('dim: site', 'DIM'), col('dim: region', 'DIM'), col('measure: kwh_total', 'MEASURE'), col('measure: co2_kg_total', 'MEASURE'), col('measure: renewable_pct', 'MEASURE')] },
        ] },
    ],
  },
  {
    name: 'SNOWTELCO_DIGITAL',
    description: 'Digital · web/app, Adobe AEP, Snowplow, Genesys, NICE, identity, decisioning, VoC.',
    schemas: [
      { name: 'bronze', description: 'Digital source landings', sourceVendor: 'Multi-vendor', ingestPath: 'Snowpipe Streaming · Iceberg · webhooks',
        tables: [
          { name: 'adobe_aep_raw',   layer: 'bronze', rows: 24_000_000_000, freshness: '5min', sourceVendor: 'Adobe AEP',  sidDomain: 'Customer', description: 'XDM events from AEP.',
            columns: [col('event_id', 'STRING', undefined, { pk: true }), col('persistent_id', 'STRING', 'PII'), col('event_type', 'STRING'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'snowplow_raw',    layer: 'bronze', rows: 12_400_000_000, freshness: '5s', sourceVendor: 'Snowplow', sidDomain: 'Customer', description: 'First-party web events (Iceberg).',
            columns: [col('event_id', 'STRING', undefined, { pk: true }), col('user_id', 'STRING', 'PII'), col('page_url', 'STRING'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'genesys_raw',     layer: 'bronze', rows: 184_000_000,    freshness: '5min', sourceVendor: 'Genesys',  sidDomain: 'Customer', description: 'Voice + chat sessions + transcripts.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('queue', 'STRING'), col('aht_s', 'NUMBER')] },
          { name: 'nice_raw',        layer: 'bronze', rows: 84_000_000,     freshness: '5min', sourceVendor: 'NICE CXone', sidDomain: 'Customer', description: 'Quality monitoring transcripts.',
            columns: [col('session_id', 'STRING', undefined, { pk: true }), col('qa_score', 'FLOAT'), col('agent_id', 'STRING')] },
          { name: 'app_events_raw',  layer: 'bronze', rows: 8_400_000_000,  freshness: '5min', sourceVendor: 'My SnowTelco App', sidDomain: 'Customer', description: 'App in-product events.',
            columns: [col('event_id', 'STRING', undefined, { pk: true }), col('user_id', 'STRING', 'PII'), col('event_name', 'STRING')] },
          col_table('appstore_reviews_raw','bronze',2_400_000,'day','Customer','iOS + Android store reviews.',[['review_id','STRING','pk'],['platform','STRING'],['stars','NUMBER'],['verbatim','STRING']],{ sourceVendor: 'Apple App Store + Google Play' }),
          col_table('twitter_stream_raw','bronze',12_400_000,'hour','Customer','Brand-mention stream.',[['tweet_id','STRING','pk'],['user','STRING'],['sentiment','FLOAT']],{ sourceVendor: 'X firehose' }),
          col_table('reddit_pulls_raw','bronze',1_200_000,'day','Customer','Subreddit mentions.',[['post_id','STRING','pk'],['subreddit','STRING'],['ups','NUMBER']],{ sourceVendor: 'Reddit' }),
          col_table('mobile_attrib_raw','bronze',8_400_000,'day','Market/Sales','Mobile-attribution events (Branch / Adjust).',[['event_id','STRING','pk'],['source','STRING'],['campaign','STRING']],{ sourceVendor: 'Branch / Adjust' }),
          col_table('webhook_dispatch_raw','bronze',184_000_000,'5min','Common','Outbound webhook delivery log.',[['webhook_id','STRING','pk'],['url','STRING'],['http_code','NUMBER']]),
        ] },
      { name: 'silver', description: 'Digital conformed', sourceVendor: 'Curated', ingestPath: 'dbt · Snowpark',
        tables: [
          { name: 'touchpoint_paths',  layer: 'silver', rows: 1_840_000_000, freshness: '5min', sidDomain: 'Customer', description: 'Sessionised multi-touch path.',
            columns: [col('persistent_id', 'STRING', 'PII'), col('session_id', 'STRING'), col('touchpoint', 'STRING'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'care_tickets',      layer: 'silver', rows: 84_000_000,    freshness: '5min', sidDomain: 'Customer', description: 'Genesys + Salesforce stitched cases.',
            columns: [col('ticket_id', 'STRING', undefined, { pk: true }), col('msisdn', 'STRING', 'PII'), col('priority', 'STRING'), col('age_days', 'NUMBER')] },
          { name: 'identity_graph_state', layer: 'silver', rows: 18_400_000,  freshness: '5min', sidDomain: 'Customer', description: 'Resolved persistent_id graph.',
            columns: [col('persistent_id', 'STRING', 'PII', { pk: true }), col('candidates', 'ARRAY'), col('confidence', 'FLOAT')] },
          col_table('journey_state','silver',8_400_000,'5min','Customer','In-flight journey state per persistent_id.',[['persistent_id','STRING','pk','PII'],['journey_id','STRING'],['step','NUMBER']]),
          col_table('app_sessions','silver',1_840_000_000,'5min','Customer','Sessionised app activity.',[['session_id','STRING','pk'],['user_id','STRING','PII'],['duration_s','NUMBER']]),
          col_table('voice_transcripts','silver',184_000_000,'hour','Customer','STT transcripts (Whisper) joined with metadata.',[['session_id','STRING','pk'],['transcript','STRING'],['sentiment','FLOAT']],{ maskingPolicy: 'transcript_pii_v1' }),
          col_table('experiment_engine','silver',8_400_000,'5min','Market/Sales','Experiment ramp + assignment engine state.',[['experiment','STRING','pk'],['arm','STRING'],['traffic_pct','FLOAT']]),
        ] },
      { name: 'gold', description: 'Digital decision-ready', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'touchpoints',           layer: 'gold', rows: 184_000_000, freshness: '5min', sidDomain: 'Customer', description: 'Markov + Shapley attribution feed.',
            columns: [col('touchpoint_id', 'STRING', undefined, { pk: true }), col('attributed_revenue', 'NUMBER(18,4)')] },
          { name: 'revenue_attribution',   layer: 'gold', rows: 84_000_000,  freshness: 'day', sidDomain: 'Market/Sales', description: 'Channel attribution outputs.',
            columns: [col('channel', 'STRING'), col('day', 'DATE'), col('attributed_revenue', 'NUMBER(18,4)')] },
          { name: 'voc_corpus',            layer: 'gold', rows: 24_000_000,  freshness: 'hour', sidDomain: 'Customer', description: 'AI_SUMMARIZE-ready review corpus.',
            columns: [col('review_id', 'STRING', undefined, { pk: true }), col('source', 'STRING'), col('verbatim', 'STRING')] },
          { name: 'identity_graph',        layer: 'gold', rows: 18_400_000,  freshness: 'day', sidDomain: 'Customer', description: 'Final identity graph used by NBA.', maskingPolicy: 'pii_id_v2',
            columns: [col('persistent_id', 'STRING', 'PII', { pk: true }), col('account_id', 'STRING'), col('msisdn', 'STRING', 'PII')] },
          { name: 'audience_sync_log',     layer: 'gold', rows: 12_400_000,  freshness: '5min', sidDomain: 'Market/Sales', description: 'Reverse-ETL log to AEP / SF MC / Sinch.',
            columns: [col('sync_id', 'STRING', undefined, { pk: true }), col('destination', 'STRING'), col('ts', 'TIMESTAMP_NTZ')] },
          { name: 'experiment_assignments',layer: 'gold', rows: 8_400_000,   freshness: '5min', sidDomain: 'Market/Sales', description: 'Experiment cohort assignment.',
            columns: [col('persistent_id', 'STRING', 'PII'), col('experiment', 'STRING'), col('arm', 'STRING')] },
          { name: 'dsar_register',         layer: 'gold', rows: 12_400,      freshness: 'day', sidDomain: 'Customer', description: 'GDPR DSAR + ICO 1-month SLA tracking.',
            columns: [col('case_id', 'STRING', undefined, { pk: true }), col('opened_at', 'TIMESTAMP_NTZ'), col('status', 'STRING')] },
          col_table('experiment_outcomes','gold',184_000,'5min','Market/Sales','Experiment results + Bayesian uplift posterior.',[['experiment','STRING','pk'],['arm','STRING'],['uplift_pp','FLOAT'],['p_uplift_gt0','FLOAT']]),
          col_table('voc_corpus_scored','gold',24_000_000,'hour','Customer','AI_CLASSIFY-themed review corpus.',[['review_id','STRING','pk'],['theme','STRING'],['sentiment','FLOAT']]),
          col_table('attribution_paths','gold',184_000_000,'day','Market/Sales','Markov-chain + Shapley path attributions.',[['path_id','STRING','pk'],['conversion_id','STRING'],['attributed_revenue','NUMBER(18,4)']]),
          col_table('lookalike_audiences','gold',8_400_000,'day','Market/Sales','Pre-computed lookalike audiences for activation.',[['audience_id','STRING','pk'],['seed_count','NUMBER'],['cosine_threshold','FLOAT']]),
          col_table('campaign_holdout','gold',184_000,'day','Market/Sales','Holdout register for uplift validation.',[['campaign_id','STRING','pk'],['holdout_pct','FLOAT'],['holdout_size','NUMBER']]),
          col_table('next_best_offer','gold',12_400_000,'5min','Customer','Per-customer ranked NBA list (top 3).',[['msisdn','STRING','pk','PII'],['p1_offer','STRING'],['p2_offer','STRING'],['p3_offer','STRING']]),
        ] },
      { name: 'platinum', description: 'Digital live products', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'nba_serving_table', layer: 'platinum', rows: 12_400_000, freshness: '5s', sidDomain: 'Customer', description: 'Real-time NBA serving cube.',
            columns: [col('persistent_id', 'STRING', 'PII'), col('next_best_offer', 'STRING'), col('channel', 'STRING')] },
          { name: 'voc_score_5min',     layer: 'platinum', rows: 184_000,    freshness: '5min', sidDomain: 'Customer', description: 'VoC theme volume + sentiment.',
            columns: [col('window_start', 'TIMESTAMP_NTZ'), col('theme', 'STRING'), col('volume', 'NUMBER'), col('sentiment', 'FLOAT')] },
        ] },
      { name: 'views', description: 'Digital convenience views.', sourceVendor: 'Curated', ingestPath: 'Logical view',
        tables: [
          { name: 'live_journeys',      layer: 'view', rows: 24,         freshness: '5s', sidDomain: 'Customer', description: 'Currently-running app + web journeys with completion + drop-off rate.',
            columns: [col('journey_id', 'STRING', undefined, { pk: true }), col('active_users', 'NUMBER'), col('completion_pct', 'FLOAT'), col('avg_step', 'NUMBER')] },
          { name: 'voc_live_themes',    layer: 'view', rows: 184,        freshness: '5min', sidDomain: 'Customer', description: 'Top 24h themes from VoC corpus (AI_CLASSIFY) with sentiment trajectory.',
            columns: [col('theme', 'STRING', undefined, { pk: true }), col('volume_24h', 'NUMBER'), col('sentiment', 'FLOAT'), col('vs_prior', 'FLOAT')] },
          { name: 'dsar_open_register', layer: 'view', rows: 184,        freshness: '5min', sidDomain: 'Customer', description: 'Open DSAR cases with ICO 1-month SLA progress.',
            columns: [col('case_id', 'STRING', undefined, { pk: true }), col('opened_at', 'TIMESTAMP_NTZ'), col('age_days', 'NUMBER'), col('status', 'STRING')] },
          { name: 'identity_resolved_live', layer: 'view', rows: 18_400_000, freshness: '5min', sidDomain: 'Customer', description: 'Persistent_id graph join with current account / msisdn / email — masked by default.', maskingPolicy: 'pii_id_v2',
            columns: [col('persistent_id', 'STRING', 'PII'), col('account_id', 'STRING'), col('msisdn', 'STRING', 'PII'), col('confidence', 'FLOAT')] },
          { name: 'experiment_running', layer: 'view', rows: 84,         freshness: '5min', sidDomain: 'Market/Sales', description: 'In-flight experiments + interim Bayesian read + ROPE check.',
            columns: [col('experiment', 'STRING', undefined, { pk: true }), col('arm', 'STRING'), col('uplift_pp', 'FLOAT'), col('p_uplift_gt0', 'FLOAT'), col('rope_excluded', 'BOOLEAN')] },
          { name: 'campaign_uplift_today', layer: 'view', rows: 240,     freshness: 'hour', sidDomain: 'Market/Sales', description: 'Campaign uplift vs holdout, real-time.',
            columns: [col('campaign_id', 'STRING'), col('treatment_conv', 'FLOAT'), col('holdout_conv', 'FLOAT'), col('uplift_pp', 'FLOAT'), col('roas', 'FLOAT')] },
        ] },
      { name: 'semantic_views', description: 'Digital semantic models for marketing + care + decisioning Q&A.', sourceVendor: 'Curated · semantic_view.yaml', ingestPath: 'Cortex Analyst',
        tables: [
          { name: 'ENGAGEMENT_SV', layer: 'semantic', rows: 0, freshness: '5min', sidDomain: 'Customer', description: 'Touchpoints, sessions, conversions, attribution.',
            columns: [
              col('fact: touchpoints',      'FACT'),
              col('fact: conversions',      'FACT'),
              col('dim: channel',           'DIM'),
              col('dim: campaign',          'DIM'),
              col('dim: customer',          'DIM'),
              col('measure: sessions',      'MEASURE'),
              col('measure: ctr',           'MEASURE'),
              col('measure: conv_rate',     'MEASURE'),
              col('measure: roas',          'MEASURE'),
              col('measure: attributed_revenue', 'MEASURE'),
            ] },
          { name: 'CARE_SV', layer: 'semantic', rows: 0, freshness: 'hour', sidDomain: 'Customer', description: 'Cases + chats + voice + FCR + CSAT — used by care leadership exec Q&A.',
            columns: [
              col('fact: care_tickets', 'FACT'),
              col('fact: voice_sessions', 'FACT'),
              col('dim: queue', 'DIM'),
              col('dim: agent', 'DIM'),
              col('dim: intent', 'DIM'),
              col('measure: aht_avg', 'MEASURE'),
              col('measure: fcr_pct', 'MEASURE'),
              col('measure: csat',    'MEASURE'),
              col('measure: deflection_pct', 'MEASURE'),
            ] },
          { name: 'EXPERIMENT_SV', layer: 'semantic', rows: 0, freshness: '5min', sidDomain: 'Market/Sales', description: 'Bayesian experiment register · uplift · guardrails.',
            columns: [col('fact: experiment_outcomes', 'FACT'), col('dim: experiment', 'DIM'), col('dim: arm', 'DIM'), col('measure: uplift_pp', 'MEASURE'), col('measure: p_uplift_gt0', 'MEASURE')] },
        ] },
    ],
  },
  {
    name: 'SNOWTELCO_FINANCE',
    description: 'Finance · GL, AP/AR, treasury, regulatory returns, Ofcom, HMRC MTD VAT, IFRS 9 / 15.',
    schemas: [
      { name: 'bronze', description: 'Finance source landings', sourceVendor: 'SAP / BlackLine / Treasury', ingestPath: 'Openflow · Snowpipe',
        tables: [
          { name: 'sap_s4_raw',    layer: 'bronze', rows: 184_000_000, freshness: 'day', sourceVendor: 'SAP S/4HANA', sidDomain: 'Enterprise', description: 'GL / AP / AR / Cost-centre extracts.',
            columns: [col('doc_id', 'STRING', undefined, { pk: true }), col('account_code', 'STRING'), col('amount', 'NUMBER(18,4)'), col('period', 'STRING')] },
          { name: 'blackline_raw', layer: 'bronze', rows: 4_200_000,   freshness: 'day', sourceVendor: 'BlackLine',  sidDomain: 'Enterprise', description: 'Recon results.',
            columns: [col('recon_id', 'STRING', undefined, { pk: true }), col('status', 'STRING')] },
          { name: 'treasury_raw',  layer: 'bronze', rows: 1_200_000,   freshness: 'day', sourceVendor: 'Treasury TMS', sidDomain: 'Enterprise', description: 'Bank balances + flows.',
            columns: [col('bank_acc', 'STRING', undefined, { pk: true }), col('balance', 'NUMBER(18,4)'), col('day', 'DATE')] },
          { name: 'fx_raw',        layer: 'bronze', rows: 184_000,     freshness: 'day', sourceVendor: 'Bloomberg FX', sidDomain: 'Common', description: 'Daily FX rates.',
            columns: [col('pair', 'STRING'), col('day', 'DATE'), col('rate', 'NUMBER(18,8)')] },
          col_table('hmrc_codes_raw','bronze',2_400,'day','Enterprise','HMRC tax-code reference data.',[['tax_code','STRING','pk'],['rate','FLOAT']],{ sourceVendor: 'HMRC' }),
          col_table('payroll_raw','bronze',184_000,'day','Engaged Party','Workday payroll extracts (cost-centre attributable).',[['payroll_id','STRING','pk'],['cost_centre','STRING'],['amount','NUMBER(18,4)']],{ sourceVendor: 'Workday' }),
          col_table('procure_to_pay_raw','bronze',1_840_000,'day','Enterprise','SAP S/4 P2P document flow.',[['doc_id','STRING','pk'],['vendor_id','STRING'],['amount','NUMBER(18,4)']],{ sourceVendor: 'SAP S/4HANA' }),
        ] },
      { name: 'silver', description: 'Finance conformed', sourceVendor: 'Curated', ingestPath: 'dbt',
        tables: [
          { name: 'gl_engine',  layer: 'silver', rows: 184_000_000, freshness: 'day', sidDomain: 'Enterprise', description: 'Engine output for GL postings.',
            columns: [col('journal_id', 'STRING', undefined, { pk: true }), col('amount', 'NUMBER(18,4)'), col('period', 'STRING')] },
          { name: 'ap_engine',  layer: 'silver', rows: 24_000_000,  freshness: 'day', sidDomain: 'Enterprise', description: 'AP register.', columns: [col('invoice_id', 'STRING', undefined, { pk: true }), col('vendor_id', 'STRING'), col('amount', 'NUMBER(18,4)')] },
          { name: 'ar_engine',  layer: 'silver', rows: 184_000_000, freshness: 'day', sidDomain: 'Enterprise', description: 'AR register.', columns: [col('invoice_id', 'STRING', undefined, { pk: true }), col('account_id', 'STRING'), col('amount', 'NUMBER(18,4)')] },
          col_table('intercompany','silver',12_400,'day','Enterprise','Intercompany journals (eliminations).',[['ic_id','STRING','pk'],['from_entity','STRING'],['to_entity','STRING'],['amount','NUMBER(18,4)']]),
          col_table('chart_of_accounts','silver',8_400,'day','Enterprise','Chart of accounts (SAP-aligned).',[['account_code','STRING','pk'],['name','STRING'],['type','STRING']]),
          col_table('cost_centre','silver',1_240,'day','Enterprise','Cost-centre dimension.',[['cost_centre','STRING','pk'],['owner','STRING'],['bu','STRING']]),
          col_table('vendor_master','silver',24_000,'day','Engaged Party','AP vendor master.',[['vendor_id','STRING','pk'],['name','STRING'],['country','STRING']]),
        ] },
      { name: 'gold', description: 'Finance gold', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'period_close',          layer: 'gold', rows: 84,          freshness: 'day', sidDomain: 'Enterprise', description: 'Period-close gating.',
            columns: [col('period_id', 'STRING', undefined, { pk: true }), col('status', 'STRING'), col('closed_at', 'TIMESTAMP_NTZ')] },
          { name: 'recon_exceptions',      layer: 'gold', rows: 4_200,       freshness: 'day', sidDomain: 'Enterprise', description: 'Variance-flagged exceptions.',
            columns: [col('exception_id', 'STRING', undefined, { pk: true }), col('variance', 'NUMBER(18,4)')] },
          { name: 'regulatory_register',   layer: 'gold', rows: 12_400,      freshness: 'day', sidDomain: 'Enterprise', description: 'All regulatory returns master.',
            columns: [col('return_id', 'STRING', undefined, { pk: true }), col('regulator', 'STRING'), col('period', 'STRING')] },
          { name: 'ofcom_returns',         layer: 'gold', rows: 1_840,       freshness: 'day', sidDomain: 'Enterprise', description: 'Ofcom GC submissions.',
            columns: [col('return_period', 'STRING'), col('payload_hash', 'STRING'), col('submitted_at', 'TIMESTAMP_NTZ')] },
          { name: 'hmrc_mtd_vat',          layer: 'gold', rows: 4,           freshness: 'day', sidDomain: 'Enterprise', description: 'HMRC MTD VAT return per quarter.',
            columns: [col('quarter', 'STRING', undefined, { pk: true }), col('vat_due', 'NUMBER(18,4)'), col('hmrc_receipt', 'STRING')] },
          { name: 'ifrs15_revrec_lattice', layer: 'gold', rows: 184_000_000, freshness: 'day', sidDomain: 'Enterprise', description: 'IFRS 15 lattice — period × obligation.',
            columns: [col('obligation_id', 'STRING'), col('period', 'STRING'), col('recognised', 'NUMBER(18,4)')] },
          { name: 'cash_forecast',         layer: 'gold', rows: 1_840,       freshness: 'day', sidDomain: 'Enterprise', description: '14-day cash forecast.',
            columns: [col('day', 'DATE', undefined, { pk: true }), col('forecast_amount', 'NUMBER(18,4)'), col('mape', 'FLOAT')] },
          col_table('soc_controls', 'gold', 12_400, 'day','Enterprise','SOC 1/2 + ISO 27001 control evidence register.',[['control_id','STRING','pk'],['regulator','STRING'],['evidence_id','STRING']]),
          col_table('nis2_evidence','gold', 184_000,'day','Enterprise','NIS2 + DORA evidence register.',[['sample_id','STRING','pk'],['control_id','STRING'],['captured_at','TIMESTAMP_NTZ']]),
          col_table('budget_vs_actual','gold',24_000,'day','Enterprise','Budget vs actual variance per cost-centre × month.',[['cost_centre','STRING','pk'],['month','DATE'],['variance','NUMBER(18,4)']]),
          col_table('opex_capex_ledger','gold',184_000,'day','Enterprise','OpEx / CapEx allocation ledger (network + IT).',[['ledger_id','STRING','pk'],['type','STRING'],['amount','NUMBER(18,4)']]),
        ] },
      { name: 'platinum', description: 'CFO live', sourceVendor: 'Curated', ingestPath: 'Dynamic Tables',
        tables: [
          { name: 'board_pack_5min', layer: 'platinum', rows: 84, freshness: '5min', sidDomain: 'Enterprise', description: 'Board pack live indicators.',
            columns: [col('window_start', 'TIMESTAMP_NTZ'), col('arr', 'NUMBER(18,4)'), col('mrr', 'NUMBER(18,4)'), col('cash', 'NUMBER(18,4)')] },
        ] },
      { name: 'views', description: 'Finance convenience views.', sourceVendor: 'Curated', ingestPath: 'Logical view',
        tables: [
          { name: 'trial_balance_now',     layer: 'view', rows: 24_000, freshness: 'day', sidDomain: 'Enterprise', description: 'Live trial balance against SAP S/4HANA — period-aware.',
            columns: [col('account_code', 'STRING', undefined, { pk: true }), col('debit', 'NUMBER(18,4)'), col('credit', 'NUMBER(18,4)'), col('net', 'NUMBER(18,4)')] },
          { name: 'recon_exceptions_open', layer: 'view', rows: 184,    freshness: 'day', sidDomain: 'Enterprise', description: 'Open recon exceptions with auto-clear candidate flag.',
            columns: [col('exception_id', 'STRING', undefined, { pk: true }), col('variance', 'NUMBER(18,4)'), col('auto_clear_candidate', 'BOOLEAN')] },
          { name: 'vat_quarter_progress',  layer: 'view', rows: 1,      freshness: 'day', sidDomain: 'Enterprise', description: 'In-flight VAT quarter progress: lines, validated, owed.',
            columns: [col('quarter', 'STRING', undefined, { pk: true }), col('lines_total', 'NUMBER'), col('lines_validated', 'NUMBER'), col('vat_owed_so_far', 'NUMBER(18,4)')] },
          { name: 'cash_runway_dashboard', layer: 'view', rows: 90,     freshness: 'day', sidDomain: 'Enterprise', description: 'Daily cash + 90-day forecast.',
            columns: [col('day', 'DATE', undefined, { pk: true }), col('actual', 'NUMBER(18,4)'), col('forecast', 'NUMBER(18,4)'), col('mape', 'FLOAT')] },
        ] },
      { name: 'semantic_views', description: 'CFO-grade semantic models for board Q&A and regulator submissions.', sourceVendor: 'Curated · semantic_view.yaml', ingestPath: 'Cortex Analyst',
        tables: [
          { name: 'FINANCE_BOARD_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Enterprise', description: 'Board pack semantic model — ARR, MRR, cash, ECL, deferred.',
            columns: [
              col('fact: gl_journals',     'FACT'),
              col('fact: revrec_obligations','FACT'),
              col('fact: cash_position',   'FACT'),
              col('dim: period',           'DIM'),
              col('dim: bu',               'DIM'),
              col('dim: cost_centre',      'DIM'),
              col('measure: arr',           'MEASURE'),
              col('measure: mrr',           'MEASURE'),
              col('measure: cash',          'MEASURE'),
              col('measure: ebitda',        'MEASURE'),
              col('measure: ecl_total',     'MEASURE'),
              col('measure: deferred_rev',  'MEASURE'),
            ] },
          { name: 'REGULATORY_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Enterprise', description: 'Ofcom · HMRC MTD VAT · ICO · NIS2 · DORA returns and evidence packs.',
            columns: [
              col('fact: regulatory_register', 'FACT'),
              col('fact: ofcom_returns',       'FACT'),
              col('dim: regulator',            'DIM'),
              col('dim: period',               'DIM'),
              col('measure: returns_due',      'MEASURE'),
              col('measure: returns_submitted','MEASURE'),
              col('measure: breach_count',     'MEASURE'),
            ] },
          { name: 'TREASURY_SV', layer: 'semantic', rows: 0, freshness: 'day', sidDomain: 'Enterprise', description: 'Treasury, FX, BACS — daily balance + 90-day forecast.',
            columns: [col('fact: cash_position', 'FACT'), col('fact: fx_raw', 'FACT'), col('dim: bank_account', 'DIM'), col('measure: closing_balance', 'MEASURE'), col('measure: fx_rate', 'MEASURE')] },
        ] },
    ],
  },
];

// ─── Stats ──────────────────────────────────────────────────────────────────
function summary() {
  const dbCount = DB.length;
  const schemaCount = DB.reduce((n, d) => n + d.schemas.length, 0);
  const tableCount = DB.reduce((n, d) => n + d.schemas.reduce((m, s) => m + s.tables.length, 0), 0);
  const dynamicCount = DB.reduce((n, d) => n + d.schemas.reduce((m, s) => m + s.tables.filter((t) => t.dynamicTable).length, 0), 0);
  const piiCount = DB.reduce((n, d) => n + d.schemas.reduce((m, s) => m + s.tables.filter((t) => t.columns.some((c) => c.classification === 'PII')).length, 0), 0);
  const maskingCount = DB.reduce((n, d) => n + d.schemas.reduce((m, s) => m + s.tables.filter((t) => t.maskingPolicy).length, 0), 0);
  return { dbCount, schemaCount, tableCount, dynamicCount, piiCount, maskingCount };
}

const fmtRows = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

const layerTone: Record<Layer, string> = {
  bronze:   'bg-amber-100 text-amber-800 border-amber-300',
  silver:   'bg-slate-100 text-slate-700 border-slate-300',
  gold:     'bg-yellow-100 text-yellow-800 border-yellow-300',
  platinum: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  view:     'bg-indigo-100 text-indigo-800 border-indigo-300',
  semantic: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
};

const freshTone: Record<Freshness, string> = {
  '5s':   'bg-emerald-500',
  '5min': 'bg-lime-500',
  'hour': 'bg-amber-500',
  'day':  'bg-slate-400',
};

const classTone: Record<Classification, string> = {
  PII:  'bg-rose-100 text-rose-700 border-rose-200',
  SOX:  'bg-violet-100 text-violet-700 border-violet-200',
  PCI:  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  PSD2: 'bg-blue-100 text-blue-700 border-blue-200',
  CDR:  'bg-amber-100 text-amber-800 border-amber-200',
  None: 'bg-mist text-ink-muted border-mist-dark',
};

// ════════════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function DatabasePage() {
  const stats = useMemo(summary, []);
  const [domain, setDomain] = useState<SidDomain | 'All'>('All');
  const [layer, setLayer] = useState<Layer | 'All'>('All');
  const [q, setQ] = useState('');
  const [openDb, setOpenDb] = useState<string>(DB[0].name);
  const [openSchema, setOpenSchema] = useState<string>(`${DB[0].name}.${DB[0].schemas[0].name}`);
  const [selected, setSelected] = useState<{ db: string; schema: string; table: string } | null>(null);

  // Apply filters across the catalog
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return DB.map((db) => {
      const schemas = db.schemas.map((s) => ({
        ...s,
        tables: s.tables.filter((t) =>
          (domain === 'All' || t.sidDomain === domain) &&
          (layer === 'All' || t.layer === layer) &&
          (!ql || t.name.toLowerCase().includes(ql) || t.description.toLowerCase().includes(ql) || (t.sourceVendor ?? '').toLowerCase().includes(ql))
        ),
      })).filter((s) => s.tables.length);
      return { ...db, schemas };
    }).filter((db) => db.schemas.length);
  }, [domain, layer, q]);

  const selectedTable = useMemo(() => {
    if (!selected) return null;
    const db = DB.find((d) => d.name === selected.db);
    const sch = db?.schemas.find((s) => s.name === selected.schema);
    const tbl = sch?.tables.find((t) => t.name === selected.table);
    if (!db || !sch || !tbl) return null;
    return { db, sch, tbl };
  }, [selected]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-6 space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Database catalog · TM Forum SID-aligned</div>
          <h1 className="text-3xl font-extrabold text-ink leading-tight mt-1">SnowTelco · governed data plane</h1>
          <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
            Five databases, twenty-three schemas, ~140 tables. Tier-1 UK reality — Amdocs CES, Netcracker, Salesforce, Adobe AEP, Ericsson ENM, Mavenir IMS, Oracle USPL HSS, Polystar, ServiceNow, SAP S/4HANA — all unified by Snowflake Horizon and indexed by TM Forum SID domain.
          </p>
        </div>
        <Link to="/lineage" className="vf-chip bg-vfRed-soft text-vfRed-dark border border-vfRed/20 font-bold inline-flex items-center gap-1">
          <GitBranch className="w-3.5 h-3.5" /> Open lineage
        </Link>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Stat icon={Database}  value={stats.dbCount}     label="Databases" />
        <Stat icon={Layers}    value={stats.schemaCount} label="Schemas" />
        <Stat icon={Layers}    value={stats.tableCount}  label="Tables" />
        <Stat icon={Activity}  value={stats.dynamicCount}label="Dynamic-Table pipelines" />
        <Stat icon={Lock}      value={stats.piiCount}    label="PII-classified tables" />
        <Stat icon={Shield}    value={stats.maskingCount}label="Masking policies" />
      </div>

      {/* TMF SID wheel */}
      <section className="vf-card p-4">
        <div className="flex items-end justify-between mb-2 flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">TM Forum SID</div>
            <h2 className="text-lg font-extrabold text-ink leading-tight">Pick a domain to filter the catalog</h2>
          </div>
          <button
            onClick={() => setDomain('All')}
            className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${domain === 'All' ? 'bg-ink text-white border-ink' : 'bg-white text-ink-muted border-mist-dark hover:border-ink'}`}
          >
            Show all
          </button>
        </div>
        <SidWheel active={domain} onPick={(d) => setDomain((cur) => cur === d ? 'All' : d)} />
      </section>

      {/* Filter bar */}
      <div className="vf-card p-3 sticky top-2 z-10 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search table · vendor · description…"
              className="w-full pl-8 pr-8 py-2 rounded-lg border border-mist-dark bg-white text-sm focus:outline-none focus:border-vfRed"
            />
            {q && <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mr-1">Layer</span>
            {(['All','bronze','silver','gold','platinum','view','semantic'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setLayer(v)}
                className={`text-[11px] px-2 py-1 rounded-full border font-bold ${layer === v ? 'bg-ink text-white border-ink' : `bg-white border-mist-dark hover:border-ink ${v === 'All' ? 'text-ink-muted' : layerTone[v as Layer]}`}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-4">
        {/* LEFT: tree */}
        <div className="vf-card p-2 max-h-[85vh] overflow-y-auto">
          {filtered.length === 0 && <div className="p-3 text-[12px] text-ink-muted">No tables match these filters.</div>}
          {filtered.map((db) => {
            const dbOpen = openDb === db.name;
            return (
              <div key={db.name} className="mb-1">
                <button
                  onClick={() => setOpenDb(dbOpen ? '' : db.name)}
                  className="w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-mist/60"
                >
                  {dbOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Database className="w-3.5 h-3.5 text-vfRed" />
                  <span className="font-bold text-[12px] text-ink font-mono">{db.name}</span>
                </button>
                {dbOpen && (
                  <div className="ml-4">
                    {db.schemas.map((s) => {
                      const sk = `${db.name}.${s.name}`;
                      const so = openSchema === sk;
                      return (
                        <div key={sk}>
                          <button
                            onClick={() => setOpenSchema(so ? '' : sk)}
                            className="w-full text-left flex items-center gap-1.5 px-2 py-1 rounded hover:bg-mist/60"
                          >
                            {so ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            <Layers className="w-3.5 h-3.5 text-blue-700" />
                            <span className="font-bold text-[11.5px] text-ink font-mono">{s.name}</span>
                            <span className="ml-auto text-[10px] text-ink-muted font-mono">{s.tables.length}</span>
                          </button>
                          {so && (
                            <div className="ml-5 space-y-0.5 mb-1">
                              {s.tables.map((t) => {
                                const isSel = selected?.db === db.name && selected?.schema === s.name && selected?.table === t.name;
                                return (
                                  <button
                                    key={t.name}
                                    onClick={() => setSelected({ db: db.name, schema: s.name, table: t.name })}
                                    className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded ${isSel ? 'bg-vfRed-soft' : 'hover:bg-mist/60'}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${freshTone[t.freshness]}`} />
                                    <span className={`text-[11px] font-mono truncate flex-1 ${isSel ? 'text-vfRed-dark font-bold' : 'text-ink'}`}>{t.name}</span>
                                    <span className="text-[9.5px] font-mono text-ink-muted">{fmtRows(t.rows)}</span>
                                    <span className={`text-[9px] px-1 rounded border ${layerTone[t.layer]}`}>{t.layer[0].toUpperCase()}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT: detail pane */}
        <div className="space-y-4">
          {!selectedTable ? (
            <SchemaOverviewGrid filtered={filtered} onSelect={setSelected} />
          ) : (
            <TableDetail
              db={selectedTable.db.name}
              schema={selectedTable.sch.name}
              schemaDescription={selectedTable.sch.description}
              ingestPath={selectedTable.sch.ingestPath}
              schemaSourceVendor={selectedTable.sch.sourceVendor}
              tbl={selectedTable.tbl}
              onClose={() => setSelected(null)}
            />
          )}

          <ErDiagram />
        </div>
      </div>
    </div>
  );
}

// ─── Stat tile ──────────────────────────────────────────────────────────────
function Stat({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="vf-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-bold">
        <Icon className="w-3 h-3 text-vfRed" />
        {label}
      </div>
      <div className="text-2xl font-extrabold text-ink font-mono tabular-nums leading-none mt-1">{v}</div>
    </div>
  );
}

// ─── SID wheel ──────────────────────────────────────────────────────────────
function SidWheel({ active, onPick }: { active: SidDomain | 'All'; onPick: (d: SidDomain) => void }) {
  const cx = 240, cy = 240, R = 200, IR = 110;
  const n = SID_DOMAINS.length;
  const slice = (i: number) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x0o = cx + R * Math.cos(a0), y0o = cy + R * Math.sin(a0);
    const x1o = cx + R * Math.cos(a1), y1o = cy + R * Math.sin(a1);
    const x0i = cx + IR * Math.cos(a0), y0i = cy + IR * Math.sin(a0);
    const x1i = cx + IR * Math.cos(a1), y1i = cy + IR * Math.sin(a1);
    const labelA = (a0 + a1) / 2;
    const lx = cx + (R + IR) / 2 * Math.cos(labelA);
    const ly = cy + (R + IR) / 2 * Math.sin(labelA);
    return { d: `M ${x0o} ${y0o} A ${R} ${R} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${IR} ${IR} 0 0 0 ${x0i} ${y0i} Z`, lx, ly };
  };
  const activeMeta = active === 'All' ? null : SID_DOMAINS.find((d) => d.id === active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[480px_1fr] gap-4 items-center">
      <svg viewBox="0 0 480 480" className="w-full max-w-[480px]">
        <motion.g
          initial={{ rotate: -8, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          style={{ transformOrigin: '240px 240px' }}
        >
          {SID_DOMAINS.map((d, i) => {
            const { d: path, lx, ly } = slice(i);
            const on = active === d.id;
            return (
              <g key={d.id} onClick={() => onPick(d.id)} style={{ cursor: 'pointer' }}>
                <motion.path
                  d={path}
                  fill={d.tone}
                  fillOpacity={on ? 0.95 : 0.2}
                  stroke={d.tone}
                  strokeWidth={on ? 2.5 : 1.2}
                  whileHover={{ fillOpacity: 0.6 }}
                />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      fontSize={d.id.length > 12 ? 10 : 11} fontWeight={800}
                      fill={on ? '#fff' : '#0f172a'}>
                  {d.id}
                </text>
              </g>
            );
          })}
        </motion.g>
        <circle cx={cx} cy={cy} r={IR - 4} fill="#fff" stroke="#e5e7eb" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fontWeight={800} fill="#7f1d1d">TM Forum</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="14" fontWeight={900} fill="#0f172a">SID</text>
      </svg>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Selected domain</div>
        <div className="text-2xl font-extrabold text-ink leading-tight mt-1">
          {active === 'All' ? 'All 8 domains' : active}
        </div>
        <p className="text-[12px] text-ink-muted mt-2 max-w-prose leading-relaxed">
          {activeMeta?.blurb ?? 'TM Forum Information Framework — the canonical model for telco data. Click a wedge to filter every table on this page to that domain.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {SID_DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => onPick(d.id)}
              className={`text-[10.5px] px-2 py-0.5 rounded-full border font-bold ${active === d.id ? 'bg-ink text-white border-ink' : 'bg-white text-ink-muted border-mist-dark hover:border-ink'}`}
              style={active === d.id ? undefined : { borderColor: d.tone }}
            >
              {d.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Schema overview when no table is selected ─────────────────────────────
function SchemaOverviewGrid({ filtered, onSelect }: { filtered: DbSpec[]; onSelect: (s: { db: string; schema: string; table: string }) => void }) {
  return (
    <div className="space-y-4">
      {filtered.map((db) => (
        <div key={db.name} className="vf-card p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Database</div>
              <h3 className="text-xl font-extrabold text-ink font-mono leading-tight">{db.name}</h3>
            </div>
            <span className="vf-chip bg-mist text-ink-muted text-[10px]">{db.schemas.reduce((n, s) => n + s.tables.length, 0)} tables</span>
          </div>
          <p className="text-[12px] text-ink-muted leading-snug mb-3 max-w-3xl">{db.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {db.schemas.map((s) => (
              <div key={s.name} className="vf-card p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-extrabold text-[12px] text-ink font-mono">{s.name}</span>
                  <span className="ml-auto text-[10px] text-ink-muted font-mono">{s.tables.length}</span>
                </div>
                <div className="text-[10.5px] text-ink-muted leading-snug mb-1">{s.description}</div>
                <div className="text-[9.5px] text-ink-muted">
                  <span className="font-bold text-ink-muted">Source: </span>{s.sourceVendor}
                </div>
                <div className="text-[9.5px] text-ink-muted mb-2">
                  <span className="font-bold text-ink-muted">Ingest: </span>{s.ingestPath}
                </div>
                <div className="space-y-0.5 max-h-44 overflow-y-auto">
                  {s.tables.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => onSelect({ db: db.name, schema: s.name, table: t.name })}
                      className="w-full text-left flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-mist/60"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${freshTone[t.freshness]}`} />
                      <span className="text-[10.5px] font-mono text-ink truncate flex-1">{t.name}</span>
                      <span className="text-[9.5px] font-mono text-ink-muted">{fmtRows(t.rows)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Selected-table detail ─────────────────────────────────────────────────
function TableDetail({ db, schema, schemaDescription, ingestPath, schemaSourceVendor, tbl, onClose }:
  { db: string; schema: string; schemaDescription: string; ingestPath: string; schemaSourceVendor: string; tbl: TableSpec; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="vf-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{db} · {schema}</div>
        <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center flex-wrap gap-2 mb-2">
        <h3 className="text-2xl font-extrabold text-ink font-mono leading-tight">{tbl.name}</h3>
        <span className={`vf-chip text-[10px] border font-bold ${layerTone[tbl.layer]}`}>{tbl.layer}</span>
        <span className="vf-chip text-[10px] bg-mist text-ink-muted">SID · {tbl.sidDomain}</span>
        <span className="vf-chip text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${freshTone[tbl.freshness]}`} />
          freshness {tbl.freshness}
        </span>
        {tbl.dynamicTable && (
          <span className="vf-chip text-[10px] bg-blue-50 text-blue-700 border border-blue-200">Dynamic Table · target_lag={tbl.targetLag}</span>
        )}
        {tbl.maskingPolicy && (
          <span className="vf-chip text-[10px] bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <Lock className="w-3 h-3" /> masking · {tbl.maskingPolicy}
          </span>
        )}
      </div>
      <p className="text-[12px] text-ink-muted leading-snug max-w-prose">{tbl.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
        <KV label="Rows"           value={fmtRows(tbl.rows)} mono />
        <KV label="Source"         value={tbl.sourceVendor ?? schemaSourceVendor} />
        <KV label="Ingest"         value={ingestPath} />
        <KV label="Schema"         value={`${db}.${schema}`} mono />
      </div>

      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Columns</div>
        <div className="vf-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-mist text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              <tr>
                <th className="text-left px-3 py-2">Column</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Classification</th>
                <th className="text-left px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tbl.columns.map((c) => (
                <tr key={c.name} className="border-t border-mist-dark">
                  <td className="px-3 py-1.5 font-mono text-[12px] text-ink">{c.name}{c.pk && <span className="ml-1 text-vfRed font-bold">PK</span>}</td>
                  <td className="px-3 py-1.5 font-mono text-[11px] text-ink-muted">{c.type}</td>
                  <td className="px-3 py-1.5">
                    {c.classification && <span className={`vf-chip text-[10px] border ${classTone[c.classification]}`}>{c.classification}</span>}
                  </td>
                  <td className="px-3 py-1.5 text-[11px] text-ink-muted">
                    {c.fk && <span>FK → <span className="font-mono text-ink">{c.fk}</span></span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Sample query</div>
        <pre className="vf-card p-3 text-[11.5px] font-mono text-ink overflow-x-auto leading-snug">
{`SELECT *
FROM ${db}.${schema}.${tbl.name}
WHERE _refresh_at > DATEADD('hour', -1, CURRENT_TIMESTAMP())
LIMIT 100;`}
        </pre>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/lineage" className="vf-chip bg-vfRed-soft text-vfRed-dark border border-vfRed/20 font-bold inline-flex items-center gap-1">
          <GitBranch className="w-3 h-3" /> Open lineage for upstream sources
        </Link>
        <span className="text-[11px] text-ink-muted">{schemaDescription}</span>
      </div>
    </motion.div>
  );
}

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-mist-dark p-2">
      <div className="text-[9.5px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className={`text-[12px] text-ink ${mono ? 'font-mono' : 'font-bold'} mt-0.5 break-words`}>{value}</div>
    </div>
  );
}

// ─── Compact ER diagram ─────────────────────────────────────────────────────
function ErDiagram() {
  const nodes = [
    { id: 'Party',         x: 60,  y: 60,  w: 120, sid: 'Engaged Party' },
    { id: 'Customer',      x: 220, y: 60,  w: 120, sid: 'Customer' },
    { id: 'Account',       x: 380, y: 60,  w: 120, sid: 'Customer' },
    { id: 'Subscription',  x: 540, y: 60,  w: 130, sid: 'Service' },
    { id: 'ProductOffering', x: 540, y: 160, w: 130, sid: 'Product' },
    { id: 'Service',       x: 380, y: 200, w: 120, sid: 'Service' },
    { id: 'Resource',      x: 220, y: 200, w: 120, sid: 'Resource' },
    { id: 'Bill',          x: 60,  y: 200, w: 120, sid: 'Customer' },
    { id: 'Payment',       x: 60,  y: 280, w: 120, sid: 'Customer' },
    { id: 'CDR',           x: 220, y: 280, w: 120, sid: 'Service' },
    { id: 'Cell',          x: 380, y: 280, w: 120, sid: 'Resource' },
  ];
  const edges = [
    ['Party', 'Customer', '1..*'],
    ['Customer', 'Account', '1..*'],
    ['Account', 'Bill', '1..*'],
    ['Bill', 'Payment', '1..*'],
    ['Account', 'Subscription', '1..*'],
    ['Subscription', 'ProductOffering', '*..1'],
    ['Subscription', 'Service', '1..*'],
    ['Service', 'Resource', '1..*'],
    ['Resource', 'Cell', '*..1'],
    ['Service', 'CDR', '1..*'],
  ];
  const sidColor = (id: string) => SID_DOMAINS.find((d) => d.id === id)?.tone ?? '#94a3b8';
  const at = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className="vf-card p-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">TM Forum SID · core entity graph</div>
          <h3 className="text-lg font-extrabold text-ink leading-tight">Party → Customer → Account → Subscription → Service → Resource</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 740 360" className="w-full" style={{ minWidth: 700 }}>
          {edges.map(([f, t, c], i) => {
            const a = at(f), b = at(t);
            const x1 = a.x + a.w / 2, y1 = a.y + 18;
            const x2 = b.x + b.w / 2, y2 = b.y + 18;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth={1.2} />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 3} fontSize="9" fill="#64748b" textAnchor="middle">{c}</text>
              </g>
            );
          })}
          {nodes.map((n, i) => (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <rect x={n.x} y={n.y} width={n.w} height={36} rx={8} fill="#fff" stroke={sidColor(n.sid)} strokeWidth={1.6} />
              <rect x={n.x} y={n.y} width={6} height={36} rx={2} fill={sidColor(n.sid)} />
              <text x={n.x + 14} y={n.y + 16} fontSize="11.5" fontWeight={800} fill="#0f172a">{n.id}</text>
              <text x={n.x + 14} y={n.y + 28} fontSize="9" fill="#64748b">SID · {n.sid}</text>
            </motion.g>
          ))}
        </svg>
      </div>
      <div className="text-[11px] text-ink-muted mt-2">
        Click any wedge above to filter the catalog to one SID domain. Each table in the catalog is mapped to the canonical entity it belongs to.
      </div>
    </div>
  );
}
