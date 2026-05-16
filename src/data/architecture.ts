export interface ArchLayer {
  id: string;
  title: string;
  blurb: string;
  nodes: { id: string; label: string; detail?: string }[];
  snowflake?: string[];
}

export const architectureLayers: ArchLayer[] = [
  {
    id: 'sources',
    title: 'Data Sources',
    blurb: 'Operational systems generating customer, network, and engagement signals.',
    nodes: [
      { id: 'crm', label: 'CRM / Customer Master' },
      { id: 'billing', label: 'Billing & Payments' },
      { id: 'product', label: 'Product Catalogue' },
      { id: 'contracts', label: 'Contracts & Renewal' },
      { id: 'cdr', label: 'CDRs / Usage Records' },
      { id: 'telemetry', label: 'Network Telemetry' },
      { id: 'ran', label: 'RAN & Cell-site Performance' },
      { id: 'devices', label: 'Device Diagnostics' },
      { id: 'care', label: 'Care Tickets & Complaints' },
      { id: 'cc', label: 'Contact Centre Interactions' },
      { id: 'digital', label: 'App & Web Events' },
      { id: 'campaigns', label: 'Campaign History' },
      { id: 'consent', label: 'Consent & Preferences' },
      { id: 'enrich', label: 'External Enrichment' },
      { id: 'compete', label: 'Competitor Benchmarks' },
    ],
  },
  {
    id: 'ingestion',
    title: 'Ingestion',
    blurb: 'Real-time and batch ingestion into Snowflake.',
    nodes: [
      { id: 'snowpipe-streaming', label: 'Snowpipe Streaming' },
      { id: 'kafka', label: 'Kafka Connector' },
      { id: 'batch', label: 'Batch File Ingestion' },
      { id: 'cdc', label: 'CDC Pipelines' },
      { id: 'api', label: 'API Ingestion' },
      { id: 'events', label: 'Event Streams (digital/care/network)' },
    ],
    snowflake: ['Snowpipe Streaming', 'Snowflake Connector for Kafka'],
  },
  {
    id: 'bronze',
    title: 'Bronze',
    blurb: 'Raw, immutable landing zone.',
    nodes: [
      { id: 'raw-cdr', label: 'Raw CDRs' },
      { id: 'raw-net', label: 'Raw Network Events' },
      { id: 'raw-care', label: 'Raw Care Events' },
      { id: 'raw-bill', label: 'Raw Billing Extracts' },
      { id: 'raw-app', label: 'Raw App Events' },
      { id: 'raw-consent', label: 'Raw Consent Records' },
    ],
  },
  {
    id: 'silver',
    title: 'Silver',
    blurb: 'Cleansed, conformed, identity-resolved.',
    nodes: [
      { id: 'identity', label: 'Customer Identity Resolution', detail: 'Across SnowTelco, SnowTelco Lite, SnowFlex, SnowGo, SnowTalk' },
      { id: 'std-product', label: 'Standardized Product Catalogue' },
      { id: 'norm-tele', label: 'Normalized Cell-site Telemetry' },
      { id: 'clean-bill', label: 'Cleansed Billing Events' },
      { id: 'dedup-care', label: 'Deduplicated Care Tickets' },
      { id: 'unified-consent', label: 'Unified Consent Status' },
      { id: 'geo', label: 'Conformed Geography & Cell-site Mapping' },
    ],
    snowflake: ['Dynamic Tables', 'Streams & Tasks', 'Snowpark'],
  },
  {
    id: 'gold',
    title: 'Gold',
    blurb: 'Business-ready, governed data products.',
    nodes: [
      { id: 'cust360', label: 'Customer 360' },
      { id: 'churn-feat', label: 'Churn Feature Table' },
      { id: 'nes', label: 'Network Experience Score' },
      { id: 'eligibility', label: 'Offer Eligibility Table' },
      { id: 'nba-table', label: 'Next-Best-Action Table' },
      { id: 'value-clv', label: 'Customer Value & CLV' },
      { id: 'care-priority', label: 'Care Priority Table' },
      { id: 'incident-impact', label: 'Incident Impact Table' },
      { id: 'campaign-act', label: 'Campaign Activation Table' },
      { id: 'exec-mart', label: 'Executive KPI Marts' },
    ],
    snowflake: ['Dynamic Tables', 'Snowpark', 'Cortex Analyst-style semantic layer'],
  },
  {
    id: 'aiml',
    title: 'AI / ML Decisioning',
    blurb: 'Models and decision rules driving every action.',
    nodes: [
      { id: 'churn-model', label: 'Churn Propensity' },
      { id: 'offer-model', label: 'Offer Propensity' },
      { id: 'clv-model', label: 'Customer Lifetime Value' },
      { id: 'net-impact', label: 'Network Impact Model' },
      { id: 'complaint-esc', label: 'Complaint Escalation' },
      { id: 'save-prio', label: 'Save Action Prioritization' },
      { id: 'uplift', label: 'Treatment Uplift' },
      { id: 'rules', label: 'Eligibility · Consent · Margin · Suppression Rules' },
    ],
    snowflake: ['Snowpark ML', 'Cortex AI / AI_COMPLETE', 'Model Registry'],
  },
  {
    id: 'activation',
    title: 'Activation',
    blurb: 'Decisions delivered to people and systems.',
    nodes: [
      { id: 'cic', label: 'Customer Intelligence Command Center' },
      { id: 'agent-desk', label: 'Care Agent Desktop' },
      { id: 'cc-routing', label: 'Contact Centre Routing' },
      { id: 'campaigns-orch', label: 'Campaign Orchestration' },
      { id: 'sms', label: 'SMS' },
      { id: 'push', label: 'Push' },
      { id: 'email', label: 'Email' },
      { id: 'app-perso', label: 'App Personalization' },
      { id: 'noc', label: 'Network Operations' },
      { id: 'exec-dash', label: 'Executive Dashboards' },
    ],
  },
];

export const governanceOverlay = {
  id: 'governance',
  title: 'Governance & Security (cross-cutting)',
  items: [
    'Role-based access control',
    'Row access policies',
    'Dynamic data masking',
    'Tag-based classification',
    'PII handling',
    'Consent-aware activation',
    'Lineage & access history',
    'Audit history',
    'Data quality checks',
    'Model governance & explainability',
    'Approval workflows for campaigns',
    'Secure sharing / clean rooms',
  ],
};

export const observabilityOverlay = {
  id: 'observability',
  title: 'Observability · FinOps · Operations',
  items: [
    'Pipeline health & freshness',
    'Model & feature drift',
    'Failed ingestion alerts',
    'Cost monitoring',
    'Warehouse utilization',
    'SLA monitoring',
  ],
};

export const snowflakePositioning = [
  { title: 'Governed Data Cloud', body: 'A single, governed foundation for all customer, network, and decisioning data.' },
  { title: 'Customer 360 Foundation', body: 'Identity-resolved, brand-aware customer data across SnowTelco, SnowTelco Lite, SnowFlex, SnowGo, SnowTalk.' },
  { title: 'Real-time Feature Pipeline', body: 'Snowpipe Streaming, Dynamic Tables, Streams & Tasks for low-latency feature freshness.' },
  { title: 'AI/ML Execution Environment', body: 'Snowpark ML and Cortex AI co-located with governed data.' },
  { title: 'Decisioning & Activation Layer', body: 'Eligibility, consent, margin, and suppression enforced before any activation channel.' },
  { title: 'Governance Control Plane', body: 'Masking, row access, tagging, lineage and access history applied across every layer.' },
];
