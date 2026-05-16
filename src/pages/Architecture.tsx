import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Database, Cpu, Sparkles, ShieldCheck, Lock, Zap, Layers, FileCog,
  RefreshCw, BarChart3, Code2, Globe2, Workflow, Smartphone, CreditCard, Wrench, Radio,
  Bot, Boxes, Share2, Search, GitBranch, ChevronDown, ChevronUp, Play, Pause,
  ArrowRight,
} from 'lucide-react';
import type { ComponentType } from 'react';

// ════════════════════════════════════════════════════════════════════════════
//  ARCHITECTURE PAGE
//  Three blocks up top (animated data plane · trace one event · UK Tier-1 KPI)
//  followed by capability catalog as collapsible tabs.
// ════════════════════════════════════════════════════════════════════════════

interface Capability {
  name: string;
  detail: string;
  telco: string;
  usedIn?: string[];
}
interface Category {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  blurb: string;
  caps: Capability[];
}

const categories: Category[] = [
  { id: 'ingestion', title: 'Data Ingestion', icon: Zap,
    blurb: 'Continuous, low-latency ingestion of every telco signal — RAN counters, alarms, CDRs, probes, BSS events, app/web telemetry — into Snowflake.',
    caps: [
      { name: 'Snowpipe Streaming', detail: 'Sub-second row-level streaming via Java SDK. No staging files.', telco: 'Live RAN counters · alarm bus · CDR mediation · probe events.', usedIn: ['NOC: Manchester / Liverpool / Leeds / London HSS', 'Digital: live chat events', 'BSS: live OCS charging'] },
      { name: 'Kafka Connector for Snowflake', detail: 'Native Kafka → table loader with exactly-once.', telco: 'EMS alarm topics (Ericsson ENM, Nokia NetAct), Diameter logs, CDR streams.', usedIn: ['All NOC scenarios'] },
      { name: 'Snowpipe (auto-ingest)', detail: 'Event-driven file loads from S3/Azure/GCS via SQS/Event Grid/PubSub.', telco: 'Roaming TAP3.12 partner files · vendor inventory dumps · dbexports.', usedIn: ['NOC: Roaming partner', 'BSS: Revenue assurance', 'OSS: Inventory drift'] },
      { name: 'Openflow (NiFi-based)', detail: 'Visual data movement & connectors, including 200+ pre-built.', telco: 'CRM CDC (Salesforce/Amdocs CES) · ServiceNow webhooks · TMF Open API ingestion.' },
      { name: 'External Tables · Iceberg ingest', detail: 'Query data in place on object storage; no copy needed.', telco: 'Cell-side data lakes · vendor analytics output · partner data feeds.' },
      { name: 'Native Connectors', detail: 'ServiceNow, Workday, Salesforce, Google Analytics, etc.', telco: 'Adobe Analytics + Snowplow web/app events · ServiceNow tickets.' },
    ] },
  { id: 'storage', title: 'Storage & Format', icon: Database,
    blurb: 'A single hybrid columnar store, plus open Iceberg interoperability — so the same data serves NOC, BSS and partners without duplication.',
    caps: [
      { name: 'Hybrid Columnar Micro-Partitions', detail: 'Automatic clustering, pruning, compression. No vacuums, no manual maintenance.', telco: '7-year CDR retention with sub-second analytical queries on petabyte-scale.' },
      { name: 'Apache Iceberg Tables', detail: 'Snowflake-managed or externally-managed catalogs (REST/Glue).', telco: 'Cross-cloud / cross-vendor interop with cell-side lakes & partner ecosystems.', usedIn: ['NOC: Roaming partner (TAP3)', 'OSS: Inventory reconcile'] },
      { name: 'External Volumes', detail: 'Bring-your-own object storage for Iceberg.', telco: 'Sovereignty: keep raw probes/CDRs in regional buckets, query from Snowflake.' },
      { name: 'Time Travel', detail: 'Query data as of any point in last 1–90 days.', telco: 'Compare network KPIs vs T-30s before incident · before/after for PIR audit.', usedIn: ['All NOC PIR drafts', 'BSS: Catalog rollback', 'OSS: Inventory drift'] },
      { name: 'Fail-safe + Zero-copy Clone', detail: '7-day disaster recovery & instant clones with no storage cost.', telco: 'Spin up "production-clone" sandbox for vendor RCA without copying TB-scale data.' },
      { name: 'Hybrid Tables (Unistore)', detail: 'OLTP + analytic on a single row-store table.', telco: 'Fraud-decisioning state machine · agent run-state journal · service-credit ledger · OCS pre-paid balance lookup.', usedIn: ['NOC: Single + Mass SIM-swap', 'BSS: Live OCS charging', 'BSS: Revenue assurance'] },
    ] },
  { id: 'compute', title: 'Compute', icon: Cpu,
    blurb: 'Right-sized, isolated compute for every workload — from a single-row OLTP fraud check to a multi-cluster RAN-KPI aggregation.',
    caps: [
      { name: 'Virtual Warehouses', detail: 'Multi-cluster auto-scale, auto-suspend, per-second billing, T-shirt sizing XS→6XL.', telco: 'Separate WHs per domain (NOC_WH, BSS_WH, FRAUD_WH) for noisy-neighbour isolation & chargeback.' },
      { name: 'Snowpark Container Services (SPCS)', detail: 'Run any container directly on Snowflake compute (CPU + GPU).', telco: 'Vendor-supplied RCA models · Cortex Agent runtime · Streamlit ops dashboards.', usedIn: ['Agent runtime (all 28 scenarios)', 'Digital: Marketplace partner adapters'] },
      { name: 'Search Optimization Service', detail: 'Sub-second point lookup on petabyte tables.', telco: 'CDR forensic queries by IMSI/MSISDN · agent-driven incident lookup.' },
      { name: 'Query Acceleration Service', detail: 'Auto-elastic boost for outlier-heavy queries.', telco: 'Surge during major-incident triage; pay only for the boost used.' },
      { name: 'Cortex Compute', detail: 'GPU-backed compute for AI workloads, fully managed.', telco: 'AISQL · Cortex Analyst · Cortex Search · Document AI for vendor TSBs/runbooks.' },
      { name: 'Auto-suspend & Resume', detail: '60-second granularity, idle WHs cost £0.', telco: 'Demo NOC environment runs at near-zero cost between incidents.' },
    ] },
  { id: 'pipelines', title: 'Transform & Pipelines', icon: Workflow,
    blurb: 'Declarative, incremental pipelines — what we used to do with ETL tools is now Dynamic Tables and Snowpark in-database.',
    caps: [
      { name: 'Dynamic Tables', detail: 'Declarative incremental pipelines with target_lag (sub-second to days).', telco: 'NOC live-KPI cube refreshed every 5s · churn-cohort silver/gold tables.', usedIn: ['NOC: Live KPIs', 'CIC: All 4 scenarios (cohorts)', 'BSS: Live OCS metrics'] },
      { name: 'Streams + Tasks', detail: 'CDC streams + scheduled/triggered tasks for procedural ETL.', telco: 'Fraud-pattern detection task · roaming reconciliation · TAP file processing.' },
      { name: 'Materialized Views', detail: 'Auto-maintained aggregates with query-time rewrite.', telco: 'Per-cell DL throughput rolling averages · billing run aggregates.' },
      { name: 'Snowpark (Python · Scala · Java)', detail: 'Push-down dataframe API + UDF/UDTF/SP execution in-database.', telco: 'Churn model scoring · roaming-cost model · capacity forecasting — no data movement.' },
      { name: 'dbt on Snowflake', detail: 'First-class dbt integration including Cortex functions.', telco: 'Data engineering team owns silver/gold layer with version control + tests.' },
      { name: 'Notebooks (Snowflake Notebooks)', detail: 'SQL + Python + Streamlit interleaved.', telco: 'Data scientists collaborate on RCA without exporting data outside Snowflake.' },
    ] },
  { id: 'ai', title: 'AI · Cortex · ML', icon: Sparkles,
    blurb: 'A complete AI stack on top of governed data — LLMs, semantic search, ML models, agents and document AI.',
    caps: [
      { name: 'Cortex Agents', detail: 'Tool-using agent runtime with planning, memory, evaluation.', telco: 'NOC orchestrator: detect → diagnose → plan → act → verify, fully auditable.', usedIn: ['All 28 scenarios across 5 sections'] },
      { name: 'Cortex Analyst', detail: 'Production text-to-SQL over a semantic model.', telco: '"Show me the 7-day churn-rate trend in Manchester clusters" → executable SQL.', usedIn: ['NOC: Leeds LS2 (LSP query)', 'CIC: ad-hoc executive', 'OSS: Capacity what-if'] },
      { name: 'Cortex Search', detail: 'Hybrid (vector + lexical) search-as-a-service over your data.', telco: 'RAG over runbooks, vendor TSBs, prior PIRs, regulator guidance.', usedIn: ['NOC: Manchester / Liverpool / London HSS / NYK', 'Digital: Care chat (runbook RAG)'] },
      { name: 'AISQL: AI_AGG · AI_FILTER · AI_CLASSIFY · AI_COMPLETE · AI_SUMMARIZE', detail: 'LLM functions callable from SQL, governed by RBAC.', telco: 'Aggregate fraud-signal narratives · classify care tickets · summarise incident transcripts.', usedIn: ['NOC: Mass SIM-swap (AI_AGG)', 'BSS: Revenue assurance (IRSF)', 'Digital: Care chat'] },
      { name: 'Document AI', detail: 'Extract structured fields from PDFs, images, scanned docs.', telco: 'Parse vendor advisories · KYC docs · Ofcom rulings · O2A document scan.' },
      { name: 'Snowpark ML + Model Registry + Feature Store', detail: 'Train, register, version and serve ML models.', telco: 'Churn model, fraud model, propensity model — versioned, monitored, audited.', usedIn: ['CIC: Manchester churn (CHURN_MODEL_V3.2)', 'BSS: Dunning recovery'] },
      { name: 'Cortex Fine-Tuning', detail: 'Fine-tune Snowflake-hosted LLMs on proprietary data.', telco: 'Tone of customer comms learned from approved past templates.' },
    ] },
  { id: 'governance', title: 'Governance · Security · Compliance', icon: ShieldCheck,
    blurb: 'Single governed plane: RBAC, masking, row-access, lineage, audit — built in, not bolted on. Telco-grade compliance out of the box.',
    caps: [
      { name: 'Horizon Catalog', detail: 'Unified catalog of objects + ML assets + policies + lineage + quality + cost.', telco: 'Single audit pane: who accessed CDR-X, where it came from, what model used it.' },
      { name: 'RBAC + Database Roles', detail: 'Hierarchical role grants, separation of duties.', telco: 'NOC_OPS · NOC_APPROVER · BILLING_READ · FRAUD_INVESTIGATOR roles.' },
      { name: 'Tag-based Masking + Row Access Policies', detail: 'Mask/redact by classification tag; row-level filters by attribute.', telco: 'PII masked except for fraud investigators · per-region row access for regulators.' },
      { name: 'Object Tagging + Classification', detail: 'Auto-classify columns (e.g. PII) and propagate tags.', telco: 'GDPR data-subject categories tagged at column level for DSAR fulfilment.' },
      { name: 'Trust Center + Compliance', detail: 'SOC 1/2 Type II · ISO 27001/27701/27017/27018 · PCI · HIPAA · FedRAMP.', telco: 'Pre-shipped compliance posture for Ofcom, FCA, ICO, CMA, NCSC.' },
      { name: 'Access History + Object Dependencies', detail: 'Every access logged with object-level lineage.', telco: 'Regulator-ready trace: which agent action read which CDR, when, why.' },
      { name: 'Data Quality Monitoring (DQM)', detail: 'SLAs on freshness, volume, schema for Dynamic Tables / pipelines.', telco: 'Stop the agent acting on stale or broken data automatically.' },
    ] },
  { id: 'security', title: 'Platform Security & Network', icon: Lock,
    blurb: 'Defence-in-depth at the platform level — everything encrypted, network-isolated and identity-bound by default.',
    caps: [
      { name: 'End-to-end Encryption', detail: 'TLS 1.2+ in transit, AES-256 at rest, hierarchical key model.', telco: 'Carrier-grade encryption baseline; satisfies NIS2 / DORA telco controls.' },
      { name: 'Customer-Managed Keys (Tri-Secret Secure)', detail: 'Bring your own key from AWS KMS / Azure Key Vault.', telco: 'Hold the key for cell-site CDRs and roaming files in your own HSM.' },
      { name: 'Network Policies + Private Connectivity', detail: 'AWS PrivateLink, Azure Private Link, GCP Private Service Connect, IP allowlists.', telco: 'No traffic ever leaves the carrier network to reach Snowflake.' },
      { name: 'External Network Rules + UDF Egress', detail: 'Govern outbound calls from Cortex Agents and Snowpark.', telco: 'Whitelist agent calls to ServiceNow / RAN OAM / IMS only.' },
      { name: 'SSO · MFA · SCIM · OAuth · SAML', detail: 'Federated identity, automated user lifecycle.', telco: 'Single sign-on with Azure AD or Okta · automatic deprovisioning of leavers.' },
    ] },
  { id: 'sharing', title: 'Sharing · Apps · Marketplace', icon: Share2,
    blurb: 'Live, governed data exchange — no FTP, no copies — with partners, MVNOs, regulators and content providers.',
    caps: [
      { name: 'Secure Data Sharing', detail: 'Live, read-only access to objects across accounts. No data movement.', telco: 'Roaming partner share IR.21 + TAP files live · MVNO host gives wholesale data live.' },
      { name: 'Snowflake Marketplace', detail: '3,000+ datasets and apps from 800+ providers.', telco: 'Demographic enrichment · weather (for outage forecasting) · fraud feeds (Subex/WeDo).' },
      { name: 'Cross-Cloud Auto-Fulfillment', detail: 'Replicate listings across AWS/Azure/GCP automatically.', telco: 'Regulator gets a live data product on their cloud of choice.' },
      { name: 'Native Apps Framework', detail: 'Build, distribute and run apps inside customer accounts (data never leaves).', telco: 'Vendor (Ericsson/Nokia) ships an RCA model as a Native App you install in your account.' },
      { name: 'Data Clean Rooms', detail: 'Privacy-preserving multi-party analytics.', telco: 'Cross-MNO fraud-pattern collaboration · joint audience studies with partners.' },
    ] },
  { id: 'replication', title: 'Replication · DR · Continuity', icon: RefreshCw,
    blurb: 'Carrier-grade resilience — multi-region, multi-cloud failover and zero-RPO replication for every database object.',
    caps: [
      { name: 'Database & Account Replication', detail: 'Replicate databases, users, roles, policies, pipes across regions/clouds.', telco: 'Active-active across UK regions · failover plane to EU continent for major events.' },
      { name: 'Failover Groups + Client Redirect', detail: 'Atomic failover with automatic JDBC/ODBC client redirect.', telco: 'Sub-minute regional failover during a Snowflake or cloud-region degradation.', usedIn: ['NOC: London HSS (replicated to eu-west-2, RPO 1m)', 'BSS: Billing cycle close'] },
      { name: 'Cross-Cloud Replication', detail: 'Replicate AWS ↔ Azure ↔ GCP.', telco: 'Avoid single-cloud regulator concentration risk; serve regulator on their cloud.' },
      { name: 'Time Travel + Fail-safe', detail: 'Recover from accidental drops/updates without backups.', telco: 'Roll back a bad PCRF policy push instantly · undo a fraud-rule misconfig.' },
    ] },
  { id: 'observability', title: 'Observability & FinOps', icon: BarChart3,
    blurb: 'See what is running, what it costs, and where the bottlenecks are — across pipelines, AI agents and warehouses.',
    caps: [
      { name: 'Account Usage views', detail: 'SQL-queryable history of queries, tasks, pipes, costs, lineage.', telco: 'Build per-domain (NOC/BSS) cost dashboards · per-agent cost-to-serve.' },
      { name: 'Query Profile + Query Insights', detail: 'Visual EXPLAIN with optimisation hints.', telco: 'Tune agent SQL · find slow CDR queries · identify pruning opportunities.' },
      { name: 'Resource Monitors + Budgets', detail: 'Hard credit limits, suspends, alerts.', telco: 'Cap NOC compute spend per quarter · budget Cortex Agent usage per scenario.' },
      { name: 'Snowsight Cost Insights', detail: 'Out-of-the-box cost dashboards by user/role/warehouse/object.', telco: 'CFO-ready FinOps view across Digital, BSS, OSS, NOC.' },
      { name: 'Event Tables (logs/traces/metrics)', detail: 'Capture telemetry from Snowpark, SPCS, Cortex Agents.', telco: 'OpenTelemetry-style audit of every agent reasoning step + tool call.' },
    ] },
  { id: 'developer', title: 'Developer Experience', icon: Code2,
    blurb: 'Build, test and ship telco apps without leaving Snowflake — Streamlit, notebooks, CLI, REST APIs.',
    caps: [
      { name: 'Streamlit in Snowflake', detail: 'Deploy Streamlit apps that run on Snowflake compute, governed by RBAC.', telco: 'NOC dashboards, fraud investigator console, regulator reporting portal.' },
      { name: 'Snowflake Notebooks', detail: 'Hybrid SQL/Python notebooks with collaboration & lineage.', telco: 'Live RCA notebook attached to an incident · collaborative model retraining.' },
      { name: 'Snow CLI · REST APIs · SDKs', detail: 'Manage objects, deploy apps, call Cortex from any environment.', telco: 'CI/CD for Dynamic Tables, agents, models · headless service-account access.' },
      { name: 'Git Integration', detail: 'Native Git repos referenced from Snowflake objects.', telco: 'Version-control runbooks, dbt projects, agent prompts.' },
    ] },
];

// ─── UK Tier-1 reality block ────────────────────────────────────────────────
const TIER1_KPIS = [
  { value: 12.4, suffix: 'M', label: 'Subscribers',         sub: 'Consumer + Enterprise + MVNO host' },
  { value: 21.4, suffix: 'k', label: 'Cell sites',          sub: '4G / 5G NSA / 5G SA across 5 UK regions' },
  { value: 2.4,  suffix: 'B', label: 'CDRs / day',          sub: 'Mediation streaming · 7-yr retention' },
  { value: 38,   suffix: '',  label: 'Source systems',      sub: 'BSS · OSS · Network · Digital · Finance' },
  { value: 312,  suffix: '',  label: 'Gold tables',         sub: 'Curated, governed, lineage-traced' },
  { value: 86,   suffix: '',  label: 'Cortex Agents',       sub: 'Across CIC · Digital · BSS · OSS · NOC' },
];

// ─── Vendor matrix (Tier-1 UK reality) ─────────────────────────────────────
const VENDOR_MATRIX: { domain: string; tone: string; vendors: { name: string; role: string; ingest: string }[] }[] = [
  { domain: 'Network · RAN / Core / IMS', tone: 'border-emerald-300 bg-emerald-50/40',
    vendors: [
      { name: 'Ericsson ENM',         role: 'RAN OSS · 4G/5G NR',           ingest: 'Snowpipe Streaming + Kafka' },
      { name: 'Nokia NetAct',         role: 'RAN OSS · multi-vendor',       ingest: 'Snowpipe Streaming' },
      { name: 'Mavenir IMS',          role: 'IMS / VoLTE / VoNR',           ingest: 'Kafka · syslog' },
      { name: 'Oracle USPL HSS',      role: 'HSS / UDM · subscriber state', ingest: 'CDC via Openflow' },
      { name: 'Polystar / Empirix',   role: 'Probes · KPIs · QoE',          ingest: 'Kafka · auto-ingest' },
      { name: 'Cisco IOS-XR',         role: 'IP transport · MPLS',          ingest: 'syslog · streaming telemetry' },
      { name: 'Juniper MX',           role: 'Transport · BGP / BFD',        ingest: 'gNMI · Kafka' },
    ] },
  { domain: 'BSS · CRM · Billing', tone: 'border-amber-300 bg-amber-50/40',
    vendors: [
      { name: 'Amdocs CES',           role: 'Catalog · CRM · Billing',      ingest: 'Openflow CDC · TMF Open APIs' },
      { name: 'Netcracker',           role: 'OMS · Inventory · Billing',    ingest: 'Openflow CDC' },
      { name: 'Salesforce Service',   role: 'Care · cases · 360',           ingest: 'Salesforce CDC connector' },
      { name: 'Salesforce Loyalty',   role: 'Tiers · missions · rewards',   ingest: 'Native connector' },
      { name: 'Ericsson Charging',    role: 'OCS · Diameter Gy/Sy',         ingest: 'Hybrid Tables · Kafka' },
      { name: 'BlackLine',            role: 'Recon · close · controls',     ingest: 'Snowpipe' },
      { name: 'SAP S/4HANA',          role: 'GL · AP · AR · Treasury',      ingest: 'Openflow · Iceberg' },
    ] },
  { domain: 'Digital · Care · Marketing', tone: 'border-fuchsia-300 bg-fuchsia-50/40',
    vendors: [
      { name: 'Adobe Experience Platform', role: 'Web · audience · journeys', ingest: 'Native connector + Iceberg' },
      { name: 'Snowplow',             role: 'First-party event collection',   ingest: 'Snowpipe Streaming' },
      { name: 'Salesforce Marketing Cloud', role: 'Outbound · email · push', ingest: 'CDC + reverse ETL via Openflow' },
      { name: 'Genesys Cloud CX',     role: 'Voice · routing · IVR',          ingest: 'Webhooks + Kafka' },
      { name: 'NICE CXone',           role: 'Voice · transcripts · QA',       ingest: 'Kafka' },
      { name: 'Sinch',                role: 'SMS · RCS · push gateway',       ingest: 'Webhooks' },
      { name: 'Stripe',               role: 'Card · 3DS · Radar',             ingest: 'Webhooks · Iceberg' },
    ] },
];

// ─── Trace one event scenarios ─────────────────────────────────────────────
const TRACE_SCENARIOS = [
  { id: 'cdr', label: 'CDR (mediation event)',
    stops: [
      { stage: 'Mediation (Ericsson)',          t: '12 ms',  detail: 'Diameter Gy event from Ericsson Charging' },
      { stage: 'Snowpipe Streaming',            t: '380 ms', detail: 'Java SDK row-level append, exactly-once' },
      { stage: 'bronze.cdr_raw',                t: '< 1 s',  detail: 'Raw landing zone, micro-partitioned' },
      { stage: 'silver.cdr_aggregates (DT)',    t: '5 s lag',detail: 'Dynamic Table · target_lag=5s' },
      { stage: 'gold.network_experience_score', t: '< 30 s', detail: 'Curated KPI · feeds NOC + CIC' },
      { stage: 'Cortex Agent decision',         t: '2.1 s',  detail: 'Detect→Diagnose→Plan via tool calls' },
      { stage: 'Action: MLB offset −3dB',       t: '4 s',    detail: 'Reversible push via External Network Rule' },
      { stage: 'Verify: gold.cell_kpis',        t: '5 min',  detail: 'KPI delta → audit packet to Event Table' },
    ] },
  { id: 'chat', label: 'Care chat',
    stops: [
      { stage: 'Genesys Cloud',           t: '40 ms',  detail: 'WebSocket inbound · sentiment scored' },
      { stage: 'Kafka topic (chat.live)', t: '110 ms', detail: 'Partitioned by msisdn · 7-day retention' },
      { stage: 'Snowpipe Streaming',      t: '380 ms', detail: 'Stream-to-table' },
      { stage: 'Cortex Search · runbook RAG', t: '1.4 s', detail: 'Hybrid vector + lexical · runbook KB' },
      { stage: 'Cortex Agent (intent + plan)', t: '2.0 s', detail: 'Tool calls: billing.apply_credit, plans.boost' },
      { stage: 'gold.interactions',       t: '< 5 s',  detail: 'Identity-resolved interaction row' },
      { stage: 'Action: credit + boost',  t: '< 1 s',  detail: 'Hybrid Table state machine' },
      { stage: 'Verify: CSAT prediction', t: 'realtime', detail: 'Snowpark ML model serving' },
    ] },
  { id: 'order', label: 'Order (TMF 622)',
    stops: [
      { stage: 'Salesforce / Amdocs CES', t: '60 ms',  detail: 'CDC capture' },
      { stage: 'Openflow connector',      t: '420 ms', detail: 'Schema-aware ingest · 200+ adapters' },
      { stage: 'bronze.orders_raw',       t: '< 1 s',  detail: 'Multi-tenant landing' },
      { stage: 'silver.order_state (DT)', t: '10 s',   detail: 'Stateful pipeline · target_lag=10s' },
      { stage: 'order_fallout_v2 model',  t: '180 ms', detail: 'Snowpark ML inference' },
      { stage: 'gold.order_fallout_features', t: '< 5 s', detail: 'Curated decision input' },
      { stage: 'Cortex Agent triage',     t: '900 ms', detail: 'Auto-fix or escalate' },
      { stage: 'Verify: gold.orders',     t: 'cycle',  detail: 'Activation confirmed · journey closed' },
    ] },
  { id: 'alarm', label: 'RAN alarm',
    stops: [
      { stage: 'Ericsson ENM / Nokia NetAct', t: '20 ms',  detail: 'SNMP / NETCONF push' },
      { stage: 'Kafka topic (alarms.live)',   t: '90 ms',  detail: 'Multi-vendor normalised' },
      { stage: 'Snowpipe Streaming',          t: '320 ms', detail: 'Append-only audit stream' },
      { stage: 'silver.alarm_window (DT)',    t: '5 s',    detail: 'Time-bucketed · per-cluster' },
      { stage: 'gold.network_alarm_stream',   t: '< 10 s', detail: 'Storm detection · severity ranking' },
      { stage: 'Cortex Agent · NOC orchestrator', t: '2.4 s', detail: 'Plan w/ Cortex Search runbook RAG' },
      { stage: 'Action: ServiceNow CHG',      t: '< 1 s',  detail: 'External Network Rule · audited' },
      { stage: 'Verify: gold.cell_kpis',      t: '5 min',  detail: 'KPI recovers · auto-rollback armed' },
    ] },
  { id: 'tap3', label: 'Roaming TAP3 file',
    stops: [
      { stage: 'Partner SFTP (TAP3.12)',  t: 'hourly', detail: 'GSMA-format settlement file' },
      { stage: 'S3 bucket · auto-ingest', t: '< 30 s', detail: 'Snowpipe with SQS notification' },
      { stage: 'bronze.tap3_raw (Iceberg)', t: '< 1 min', detail: 'External Volume · sovereignty' },
      { stage: 'silver.tap3_partner_files', t: '5 min',  detail: 'Schema-validated · de-duped' },
      { stage: 'gold.tap3_reconcile',     t: '15 min', detail: 'Reconcile vs our-side mediation' },
      { stage: 'Cortex Agent · settlement', t: '4.2 s',  detail: 'Auto-dispute draft when delta > tol.' },
      { stage: 'Action: dispute opened',  t: '< 1 s',  detail: 'gold.partner_settlements updated' },
      { stage: 'Verify: ledger reconciles', t: 'cycle', detail: 'Period close gating respects' },
    ] },
  { id: 'web', label: 'Web event (Snowplow)',
    stops: [
      { stage: 'Snowplow collector',      t: '30 ms',  detail: 'Edge JS SDK' },
      { stage: 'Iceberg landing',         t: '< 1 s',  detail: 'Open format · cross-cloud share' },
      { stage: 'bronze.web_events_raw',   t: '< 5 s',  detail: 'Sub-second pruning at scale' },
      { stage: 'silver.touchpoint_paths', t: '60 s',   detail: 'Sessionised · multi-touch attribution' },
      { stage: 'gold.touchpoints',        t: '5 min',  detail: 'Markov + Shapley attribution feed' },
      { stage: 'Cortex Agent · cart recovery', t: '1.1 s', detail: 'Channel + offer NBA' },
      { stage: 'Action: SMS / RCS push',  t: '< 1 s',  detail: 'Sinch via External Network Rule' },
      { stage: 'Verify: gold.conversions', t: '< 5 min', detail: 'Cart recovered · holdout uplift' },
    ] },
];

// ────────────────────────────────────────────────────────────────────────────
//  PAGE
// ────────────────────────────────────────────────────────────────────────────
export default function Architecture() {
  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-6 space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">Reference architecture</div>
        <h1 className="text-3xl font-extrabold text-ink leading-tight mt-1">SnowTelco · Agentic Telco on the Snowflake AI Data Cloud</h1>
        <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
          One governed plane for Digital, BSS, OSS and Network. The blocks below are the production deployment pattern — vendor-real, throughput-real, audit-real.
        </p>
        <div className="mt-2 vf-card p-2.5 inline-flex items-center gap-2 text-[12px] bg-amber/10 border-amber/30">
          <Activity className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-amber-900">
            Demo runs against synthetic data. Throughput, vendor names and feature mapping below reflect a real Tier-1 UK MNO design.
          </span>
        </div>
      </header>

      {/* ── BLOCK 1 — UK Tier-1 reality KPI strip ── */}
      <section>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">UK Tier-1 reality · today</div>
            <h2 className="text-xl font-extrabold text-ink leading-tight">Scale we run at</h2>
          </div>
          <span className="vf-chip bg-mist text-ink-muted text-[10px]">live counters animate on first paint · synthetic data</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TIER1_KPIS.map((k, i) => <Tier1Kpi key={k.label} {...k} delay={i * 0.08} />)}
        </div>
      </section>

      {/* ── BLOCK 2 — Animated 5-layer data plane ── */}
      <section className="vf-card p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Live data plane</div>
            <h2 className="text-xl font-extrabold text-ink leading-tight">Sources → Ingestion → Storage / Compute → Cortex AI → Domain experiences</h2>
          </div>
          <span className="vf-chip bg-mist text-ink-muted text-[10px]">animated · particles + throughput · closed-loop returns at the bottom</span>
        </div>
        <DataPlane />
      </section>

      {/* ── BLOCK 3 — Trace one event ── */}
      <section className="vf-card p-4">
        <div className="flex items-end justify-between mb-2 flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Trace one event</div>
            <h2 className="text-xl font-extrabold text-ink leading-tight">Pick an event type · we replay it through the stack</h2>
          </div>
          <span className="vf-chip bg-mist text-ink-muted text-[10px]">8 stops · timing real · pause on hover</span>
        </div>
        <TraceOneEvent />
      </section>

      {/* ── BLOCK 4 — Vendor matrix ── */}
      <section>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Vendor matrix · what we ingest from</div>
            <h2 className="text-xl font-extrabold text-ink leading-tight">Real Tier-1 UK telco source systems</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {VENDOR_MATRIX.map((m) => (
            <div key={m.domain} className={`vf-card p-3 border-l-4 ${m.tone}`}>
              <div className="font-extrabold text-ink text-[13px] mb-2">{m.domain}</div>
              <ul className="space-y-1.5">
                {m.vendors.map((v) => (
                  <li key={v.name} className="text-[11.5px] flex items-baseline gap-1.5 leading-snug">
                    <span className="font-bold text-ink shrink-0 w-[42%] truncate">{v.name}</span>
                    <span className="text-ink-muted shrink-0 w-[28%] truncate">{v.role}</span>
                    <span className="vf-chip text-[9.5px] bg-mist text-ink-muted ml-auto">{v.ingest}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOCK 5 — Capability catalog (collapsible) ── */}
      <section>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Capability catalog</div>
            <h2 className="text-xl font-extrabold text-ink leading-tight">Every feature, mapped to a telco use</h2>
          </div>
          <span className="vf-chip bg-mist text-ink-muted text-[10px]">{categories.length} categories · {categories.reduce((n, c) => n + c.caps.length, 0)} capabilities</span>
        </div>
        <CapabilityTabs />
      </section>

      {/* ── BLOCK 6 — Closed-loop targets ── */}
      <section>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Closed-loop actions</div>
            <h2 className="text-xl font-extrabold text-ink leading-tight">Cortex Agents → governed write-backs</h2>
          </div>
          <span className="vf-chip bg-mist text-ink-muted text-[10px]">External Network Rules · Egress audit · Reversible</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[
            ['RAN OAM (Ericsson/Nokia)', 'MLB offset · carrier add · TX power · cell restart'],
            ['IMS / HSS (Mavenir, Oracle)', 'Diameter session flush · P-CSCF rate-limit'],
            ['Transport (Cisco/Juniper)', 'MPLS LSP reroute · BFD reset · BGP failover'],
            ['ServiceNow', 'CHG / INC / SEC tickets with full evidence pack'],
            ['Care Orchestrator', 'Pre-approved playbook push · multi-channel comms'],
            ['Billing (Amdocs/Netcracker)', 'Service credit · Ofcom auto-comp evaluation'],
            ['BSS Identity / OMS', 'SIM-swap freeze · MFA step-up · payments lock'],
            ['Fraud / CTI', 'GSMA T-ISAC IOC sharing · vendor advisory ingest'],
            ['Field Force (FSL/ClickSoftware)', 'Dispatch · work order · ESG-tagged reporting'],
          ].map(([from, detail]) => (
            <div key={from} className="vf-card p-3">
              <div className="font-bold text-[12px] text-ink"><span className="text-vfRed">→</span> {from}</div>
              <div className="text-[11px] text-ink-muted mt-1">{detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOCK 7 — Standards ── */}
      <section className="vf-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileCog className="w-4 h-4 text-vfRed" />
          <div className="font-extrabold text-ink">Aligned to telco standards & regulator expectations</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['TM Forum SID', 'TMF 620 (Catalog)', 'TMF 622 (Order)', 'TMF 633 (Service)', 'TMF 638 (Service Inventory)', 'TMF 641 (Service Order)', 'TMF 645 (Trouble Ticket)', 'TMF 648 (Quote)', 'GSMA TS.32 (Roaming)', 'GSMA T-ISAC', 'IR.21', '3GPP TS 23.501 (5G)', 'ETSI NFV', 'Ofcom GC C1/C4/C5/C7', 'GDPR', 'NIS2', 'DORA', 'IFRS 9 ECL · IFRS 15 RevRec', 'HMRC MTD VAT', 'ICO ROPA', 'ISO 27001/27701', 'PCI DSS · PSD2', 'SOC 2', 'FedRAMP'].map((t) => (
            <span key={t} className="vf-chip bg-mist text-ink-muted text-[10px]">{t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Tier-1 KPI tile with animated count-up
// ════════════════════════════════════════════════════════════════════════════
function Tier1Kpi({ value, suffix, label, sub, delay }: { value: number; suffix: string; label: string; sub: string; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now() + delay * 1000;
    const dur = 1400;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.max(0, Math.min(1, (t - start) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      setV(value * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  const display = value < 10 ? v.toFixed(1) : Math.round(v).toLocaleString();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="vf-card p-3 relative overflow-hidden"
    >
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-extrabold text-ink font-mono tabular-nums leading-none">{display}</span>
        {suffix && <span className="text-lg font-extrabold text-vfRed">{suffix}</span>}
      </div>
      <div className="text-[11px] text-ink-muted mt-1 leading-snug">{sub}</div>
      <span className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full bg-vfRed-soft/40" />
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Animated 5-layer data plane (full-width SVG)
// ════════════════════════════════════════════════════════════════════════════
function DataPlane() {
  const W = 1500;
  const H = 760;

  // Layer Y midlines
  const yLayer = [80, 220, 380, 540, 680];
  const layerLabels = ['Sources', 'Ingestion', 'Storage & Compute', 'Cortex AI · Agents', 'Domain experiences'];

  // Sources (top row)
  const sources = useMemo(() => ([
    { label: 'Ericsson ENM', tone: '#10b981' },
    { label: 'Nokia NetAct', tone: '#10b981' },
    { label: 'Mavenir IMS',  tone: '#10b981' },
    { label: 'Oracle USPL',  tone: '#10b981' },
    { label: 'Polystar',     tone: '#10b981' },
    { label: 'Amdocs CES',   tone: '#f59e0b' },
    { label: 'Netcracker',   tone: '#f59e0b' },
    { label: 'Salesforce',   tone: '#f59e0b' },
    { label: 'ServiceNow',   tone: '#f59e0b' },
    { label: 'Adobe AEP',    tone: '#d946ef' },
    { label: 'Snowplow',     tone: '#d946ef' },
    { label: 'Genesys',      tone: '#d946ef' },
  ]), []);

  // Ingest pipes
  const ingest = [
    { label: 'Snowpipe Streaming', metric: '28,400 events/s' },
    { label: 'Kafka Connector',    metric: '12,800 msgs/s' },
    { label: 'Snowpipe auto-ingest', metric: '184 files/min' },
    { label: 'Openflow CDC',       metric: '6,200 rows/s' },
    { label: 'External Tables · Iceberg', metric: '0-copy' },
  ];

  // Storage / compute boxes
  const storage = [
    { label: 'Hybrid Columnar', sub: 'micro-partitioned' },
    { label: 'Iceberg Tables',  sub: 'open · cross-cloud' },
    { label: 'Hybrid Tables',   sub: 'OLTP + analytic' },
    { label: 'Time Travel',     sub: '90-day · undrop' },
    { label: 'NOC_WH XL × 4',   sub: 'multi-cluster' },
    { label: 'BSS_WH L × 2',    sub: 'auto-suspend' },
    { label: 'CORTEX_WH XL',    sub: 'GPU · serverless' },
  ];

  // Cortex / AI
  const ai = [
    { label: 'Cortex Agents',   sub: 'Plan · Tools · Memory' },
    { label: 'Cortex Analyst',  sub: 'text-to-SQL' },
    { label: 'Cortex Search',   sub: 'hybrid vector + lex' },
    { label: 'AISQL functions', sub: 'AI_AGG · AI_FILTER · AI_CLASSIFY' },
    { label: 'Snowpark ML',     sub: 'churn · fraud · propensity' },
    { label: 'Document AI',     sub: 'PDF · KYC · TSBs' },
  ];

  // Domains
  const domains = [
    { label: 'CIC',     icon: Activity },
    { label: 'Digital', icon: Smartphone },
    { label: 'BSS',     icon: CreditCard },
    { label: 'OSS',     icon: Wrench },
    { label: 'NOC',     icon: Radio },
  ];

  // Closed-loop label rotator
  const loopTargets = [
    '→ RAN OAM (Ericsson) · MLB offset',
    '→ Diameter rate-limit (Mavenir)',
    '→ ServiceNow CHG ticket',
    '→ Salesforce credit + boost',
    '→ PCRF policy push',
    '→ GSMA T-ISAC share',
  ];
  const [loopIdx, setLoopIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLoopIdx((i) => (i + 1) % loopTargets.length), 2000);
    return () => clearInterval(t);
  }, [loopTargets.length]);

  // Helpers for x-positions
  const colX = (i: number, n: number, padL = 60, padR = 60) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 1000 }}>
        <defs>
          <linearGradient id="dpBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <linearGradient id="layerSrc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="layerIngest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="layerStore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="layerAi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#11567F" />
            <stop offset="100%" stopColor="#0c3f5e" />
          </linearGradient>
          <linearGradient id="layerDom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fee2e2" />
            <stop offset="100%" stopColor="#fecaca" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#dpBg)" />

        {/* Layer bands */}
        <rect x={20} y={40} width={W - 40} height={80} rx={10} fill="url(#layerSrc)" stroke="#e5e7eb" />
        <rect x={20} y={180} width={W - 40} height={80} rx={10} fill="url(#layerIngest)" stroke="#bfdbfe" />
        <rect x={20} y={320} width={W - 40} height={120} rx={10} fill="url(#layerStore)" stroke="#bae6fd" />
        <rect x={20} y={480} width={W - 40} height={120} rx={10} fill="url(#layerAi)" stroke="#0c3f5e" />
        <rect x={20} y={640} width={W - 40} height={80} rx={10} fill="url(#layerDom)" stroke="#fecaca" />

        {/* Layer labels */}
        {layerLabels.map((l, i) => (
          <text key={l} x={32} y={[68, 208, 348, 508, 668][i]} fontSize="11" fontWeight={800}
                fill={i === 3 ? '#fff' : '#111'} opacity={0.85}>
            {l.toUpperCase()}
          </text>
        ))}

        {/* Sources */}
        {sources.map((s, i) => {
          const x = colX(i, sources.length);
          return (
            <g key={s.label}>
              <rect x={x - 60} y={yLayer[0] - 16} width={120} height={32} rx={6} fill="#fff" stroke={s.tone} strokeWidth={1.5} />
              <circle cx={x - 48} cy={yLayer[0]} r={3.5} fill={s.tone} />
              <text x={x - 40} y={yLayer[0] + 4} fontSize="10.5" fontWeight={700} fill="#111">{s.label}</text>
            </g>
          );
        })}

        {/* Source → Ingest connectors with particles */}
        {sources.map((s, i) => {
          const x1 = colX(i, sources.length);
          const x2 = colX(i % ingest.length, ingest.length);
          const id = `pSi-${i}`;
          return (
            <g key={`si-${i}`}>
              <path d={curve(x1, yLayer[0] + 16, x2, yLayer[1] - 16)} fill="none" stroke={s.tone} strokeOpacity="0.32" strokeWidth="1.2" id={id} />
              <circle r="3" fill={s.tone}>
                <animateMotion dur={`${2 + (i % 4) * 0.3}s`} repeatCount="indefinite" begin={`${(i * 0.12).toFixed(2)}s`}>
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
            </g>
          );
        })}

        {/* Ingest pipes */}
        {ingest.map((p, i) => {
          const x = colX(i, ingest.length);
          return (
            <g key={p.label}>
              <rect x={x - 105} y={yLayer[1] - 22} width={210} height={44} rx={8} fill="#fff" stroke="#1d4ed8" strokeWidth={1.5} />
              <text x={x} y={yLayer[1] - 4} fontSize="11" fontWeight={800} fill="#1e3a8a" textAnchor="middle">{p.label}</text>
              <rect x={x - 62} y={yLayer[1] + 4} width={124} height={14} rx={3} fill="#1e3a8a" />
              <text x={x} y={yLayer[1] + 14} fontSize="9.5" fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="ui-monospace, Menlo">
                <ThroughputPulse seed={i}>{p.metric}</ThroughputPulse>
              </text>
            </g>
          );
        })}

        {/* Ingest → Storage */}
        {ingest.map((_, i) => {
          const x1 = colX(i, ingest.length);
          const x2 = colX(i % storage.length, storage.length);
          const id = `pIS-${i}`;
          return (
            <g key={`is-${i}`}>
              <path d={curve(x1, yLayer[1] + 22, x2, yLayer[2] - 28)} fill="none" stroke="#1d4ed8" strokeOpacity="0.32" strokeWidth="1.2" id={id} />
              <circle r="3" fill="#1d4ed8">
                <animateMotion dur={`${1.6 + (i % 3) * 0.2}s`} repeatCount="indefinite" begin={`${(i * 0.18).toFixed(2)}s`}>
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
            </g>
          );
        })}

        {/* Storage / Compute boxes */}
        {storage.map((b, i) => {
          const x = colX(i, storage.length);
          return (
            <g key={b.label}>
              <rect x={x - 80} y={yLayer[2] - 28} width={160} height={56} rx={8} fill="#fff" stroke="#0369a1" strokeWidth={1.5} />
              <text x={x} y={yLayer[2] - 8} fontSize="11" fontWeight={800} fill="#0c4a6e" textAnchor="middle">{b.label}</text>
              <text x={x} y={yLayer[2] + 8} fontSize="9.5" fill="#475569" textAnchor="middle">{b.sub}</text>
              <ActiveBlink x={x + 60} y={yLayer[2] - 18} />
            </g>
          );
        })}

        {/* Storage → AI */}
        {storage.map((_, i) => {
          const x1 = colX(i, storage.length);
          const x2 = colX(i % ai.length, ai.length);
          const id = `pSA-${i}`;
          return (
            <g key={`sa-${i}`}>
              <path d={curve(x1, yLayer[2] + 28, x2, yLayer[3] - 28)} fill="none" stroke="#0369a1" strokeOpacity="0.32" strokeWidth="1.2" id={id} />
              <circle r="2.5" fill="#0369a1">
                <animateMotion dur={`${1.4 + (i % 3) * 0.2}s`} repeatCount="indefinite" begin={`${(i * 0.15).toFixed(2)}s`}>
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
            </g>
          );
        })}

        {/* AI / Cortex blocks */}
        {ai.map((c, i) => {
          const x = colX(i, ai.length);
          return (
            <g key={c.label}>
              <rect x={x - 95} y={yLayer[3] - 28} width={190} height={56} rx={8} fill="#0e4d6f" stroke="#fff" strokeOpacity={0.2} />
              <text x={x} y={yLayer[3] - 8} fontSize="11" fontWeight={800} fill="#fff" textAnchor="middle">{c.label}</text>
              <text x={x} y={yLayer[3] + 8} fontSize="9.5" fill="#cbd5e1" textAnchor="middle">{c.sub}</text>
            </g>
          );
        })}

        {/* AI → Domains */}
        {ai.map((_, i) => {
          const x1 = colX(i, ai.length);
          const x2 = colX(i % domains.length, domains.length);
          const id = `pAD-${i}`;
          return (
            <g key={`ad-${i}`}>
              <path d={curve(x1, yLayer[3] + 28, x2, yLayer[4] - 16)} fill="none" stroke="#dc2626" strokeOpacity="0.45" strokeWidth="1.3" id={id} />
              <circle r="3" fill="#dc2626">
                <animateMotion dur={`${1.6 + (i % 3) * 0.2}s`} repeatCount="indefinite" begin={`${(i * 0.2).toFixed(2)}s`}>
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
            </g>
          );
        })}

        {/* Domains */}
        {domains.map((d, i) => {
          const x = colX(i, domains.length);
          return (
            <g key={d.label}>
              <rect x={x - 80} y={yLayer[4] - 16} width={160} height={32} rx={6} fill="#fff" stroke="#dc2626" strokeWidth={1.6} />
              <circle cx={x - 64} cy={yLayer[4]} r={4} fill="#dc2626" />
              <text x={x - 50} y={yLayer[4] + 4} fontSize="11" fontWeight={800} fill="#7f1d1d">{d.label}</text>
            </g>
          );
        })}

        {/* Closed-loop arc */}
        <path d={`M ${W - 60} ${yLayer[4]} Q ${W / 2} ${H - 12} 60 ${yLayer[0]}`} fill="none" stroke="#dc2626" strokeOpacity={0.55} strokeWidth={1.6} strokeDasharray="6 5" />
        <text x={W / 2} y={H - 10} fontSize="11" fontWeight={800} fill="#7f1d1d" textAnchor="middle">
          Closed-loop ·
          <tspan dx="6">{loopTargets[loopIdx]}</tspan>
        </text>
      </svg>
    </div>
  );
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const cy = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
}

function ThroughputPulse({ children, seed }: { children: React.ReactNode; seed: number }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 1100 + (seed % 4) * 90);
    return () => clearInterval(t);
  }, [seed]);
  return <tspan opacity={on ? 1 : 0.6}>{children}</tspan>;
}

function ActiveBlink({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3} fill="#10b981">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Trace one event
// ════════════════════════════════════════════════════════════════════════════
function TraceOneEvent() {
  const [scenarioId, setScenarioId] = useState(TRACE_SCENARIOS[0].id);
  const [running, setRunning] = useState(true);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState(0);
  const sc = TRACE_SCENARIOS.find((s) => s.id === scenarioId)!;
  const stops = sc.stops;

  useEffect(() => {
    if (!running || hover) return;
    const start = performance.now();
    const duration = 9000; // full lap
    let raf = 0;
    const tick = (t: number) => {
      const p = ((t - start) % duration) / duration;
      setPos(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, hover, scenarioId]);

  const activeIdx = Math.min(stops.length - 1, Math.floor(pos * stops.length));

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {TRACE_SCENARIOS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setScenarioId(t.id); setPos(0); }}
            className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${scenarioId === t.id ? 'bg-vfRed text-white border-vfRed' : 'bg-white text-ink-muted border-mist-dark hover:border-vfRed'}`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setRunning((r) => !r)}
          className="ml-auto inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-mist-dark bg-white text-ink-muted hover:border-ink"
          title={running ? 'Pause' : 'Play'}
        >
          {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {running ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-mist-dark" />
        <motion.div
          initial={false}
          animate={{ width: `${(activeIdx / (stops.length - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-px bg-vfRed"
          style={{ maxWidth: 'calc(100% - 24px)' }}
        />
        <div className="grid grid-flow-col auto-cols-fr gap-2 relative">
          {stops.map((s, i) => {
            const reached = i <= activeIdx;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <motion.div
                  animate={{ scale: i === activeIdx ? 1.3 : 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className={`w-7 h-7 rounded-full grid place-items-center border-2 ${reached ? 'bg-vfRed border-vfRed text-white' : 'bg-white border-mist-dark text-ink-muted'}`}
                >
                  <span className="text-[10px] font-mono font-bold">{i + 1}</span>
                </motion.div>
                <div className={`text-[10.5px] font-bold mt-1.5 leading-tight ${reached ? 'text-ink' : 'text-ink-muted'}`}>{s.stage}</div>
                <div className={`text-[9.5px] font-mono mt-0.5 ${reached ? 'text-vfRed font-bold' : 'text-ink-muted'}`}>{s.t}</div>
                <div className="text-[9.5px] text-ink-muted mt-0.5 leading-snug max-w-[12ch]">{s.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-ink-muted">
        Total path · <span className="font-mono font-bold text-ink">{stops[0].t}</span>
        <ArrowRight className="inline w-3 h-3 mx-1" />
        <span className="font-mono font-bold text-ink">{stops[stops.length - 1].t}</span>
        · 8 stops · all hops auditable via Event Tables.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Capability tabs (collapsible)
// ════════════════════════════════════════════════════════════════════════════
function CapabilityTabs() {
  const [active, setActive] = useState(categories[0].id);
  const [open, setOpen] = useState(true);
  const cat = categories.find((c) => c.id === active)!;
  return (
    <div className="vf-card p-0 overflow-hidden">
      <div className="flex flex-wrap gap-0.5 px-2 pt-2 bg-mist/40">
        {categories.map((c) => {
          const on = c.id === active;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => { setActive(c.id); setOpen(true); }}
              className={`text-[11px] px-3 py-1.5 rounded-t-lg inline-flex items-center gap-1.5 border-b-2 ${
                on ? 'bg-white text-ink border-vfRed font-extrabold' : 'bg-transparent text-ink-muted border-transparent hover:text-ink'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.title}
              <span className={`text-[9.5px] font-mono px-1 rounded ${on ? 'bg-vfRed-soft text-vfRed-dark' : 'bg-mist text-ink-muted'}`}>{c.caps.length}</span>
            </button>
          );
        })}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-[10px] px-2 py-1 text-ink-muted inline-flex items-center gap-1"
        >
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {open ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4"
          >
            <p className="text-[12px] text-ink-muted max-w-3xl mb-3 leading-snug">{cat.blurb}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {cat.caps.map((c) => <CapCard key={c.name} c={c} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CapCard({ c }: { c: Capability }) {
  return (
    <div className="vf-card p-3 flex flex-col gap-1.5">
      <div className="font-bold text-[12.5px] text-ink leading-tight">{c.name}</div>
      <div className="text-[11px] text-ink-muted leading-snug">{c.detail}</div>
      <div className="rounded-md bg-vfRed-soft/40 border border-vfRed/20 px-2 py-1 mt-auto">
        <div className="text-[9px] uppercase tracking-wider text-vfRed-dark font-bold mb-0.5">Telco use</div>
        <div className="text-[11px] text-ink leading-snug">{c.telco}</div>
      </div>
      {c.usedIn && c.usedIn.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Used in</span>
          {c.usedIn.map((s) => (
            <span key={s} className="vf-chip bg-mist text-ink-muted text-[9.5px] font-mono">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}
