import { GitBranch, Database, Layers, Boxes, Sparkles, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDemoState } from '@/state/DemoStateProvider';
import { analyticsForScenario } from '@/data/analyticsByScenario';

interface LineageRow {
  driver: string;
  layer: string;
  table: string;
  col: string;
  upstream: string[];
  themes: string[]; // which scenario themes this row is most relevant for
}

const lineageRows: LineageRow[] = [
  { driver: 'Contract ending within 30 days',  layer: 'Gold', table: 'gold.churn_features',           col: 'days_to_renewal',          upstream: ['silver.contracts', 'bronze.contracts_raw'],                                  themes: ['network', 'commercial'] },
  { driver: 'Network experience degradation',  layer: 'Gold', table: 'gold.network_experience_score', col: 'nes_14d',                  upstream: ['silver.cdr_aggregates', 'silver.ran_telemetry', 'bronze.cdr_raw', 'bronze.ran_raw'], themes: ['network', 'growth'] },
  { driver: 'Recent care complaint',           layer: 'Gold', table: 'gold.care_priority',            col: 'open_complaint_age_days',  upstream: ['silver.care_tickets', 'bronze.care_raw'],                                    themes: ['network', 'billing'] },
  { driver: 'Competitor switching pressure',   layer: 'Gold', table: 'gold.churn_features',           col: 'competitor_pressure_score',upstream: ['silver.benchmark_offers', 'silver.app_events', 'bronze.app_raw'],            themes: ['commercial'] },
  { driver: 'Bill shock',                      layer: 'Gold', table: 'gold.churn_features',           col: 'bill_shock_flag',          upstream: ['silver.billing_events', 'bronze.billing_raw'],                               themes: ['billing'] },
  { driver: 'PAC request indicator',           layer: 'Gold', table: 'gold.churn_features',           col: 'pac_indicator',            upstream: ['silver.support_chat_events', 'bronze.cc_raw'],                               themes: ['commercial', 'billing'] },
  { driver: 'App engagement decline',          layer: 'Gold', table: 'gold.churn_features',           col: 'app_session_trend_30d',    upstream: ['silver.app_events', 'bronze.app_raw'],                                       themes: ['growth', 'commercial'] },
  // ML / scenario-specific rows
  { driver: 'Anomaly score (PRB utilisation)', layer: 'Gold', table: 'gold.cell_kpis',                col: 'anomaly_score',            upstream: ['silver.cell_kpi_window', 'bronze.ran_raw'],                                  themes: ['network'] },
  { driver: 'Network alarm stream',            layer: 'Gold', table: 'gold.network_alarm_stream',     col: 'severity',                 upstream: ['silver.alarm_window', 'bronze.alarm_raw'],                                   themes: ['network'] },
  { driver: 'Roaming Pass policy gap',         layer: 'Gold', table: 'gold.roaming_pass_policy',      col: 'auto_enrol_eligible',      upstream: ['silver.policy_state', 'bronze.policy_raw'],                                  themes: ['billing'] },
  { driver: 'Billing cycle facts',             layer: 'Gold', table: 'gold.billing_cycle',            col: 'cycle_total_amount',       upstream: ['silver.billing_events', 'bronze.billing_raw'],                               themes: ['billing'] },
  { driver: 'TAP3 interconnect reconcile',     layer: 'Gold', table: 'gold.tap3_reconcile',           col: 'reconcile_status',         upstream: ['silver.tap3_partner_files', 'bronze.tap3_raw'],                              themes: ['billing'] },
  { driver: 'Tariff elasticity',               layer: 'Gold', table: 'gold.tariff_elasticity',        col: 'epsilon',                  upstream: ['silver.tariff_events', 'silver.benchmark_offers', 'bronze.app_raw'],         themes: ['commercial'] },
  { driver: '5G handset propensity',           layer: 'Gold', table: 'gold.upgrade_propensity_features', col: 'propensity_5g_sa',      upstream: ['silver.tac_database', 'silver.usage_aggregates', 'bronze.network_raw'],      themes: ['growth'] },
  // ─── Marketing surfaces ───
  { driver: 'Marketing touchpoints (multi-touch attribution)', layer: 'Gold', table: 'gold.touchpoints',           col: 'touchpoint_id',         upstream: ['silver.adobe_aep_events', 'silver.salesforce_mc_events', 'bronze.web_events'],     themes: ['commercial', 'growth'] },
  { driver: 'Spend ledger (paid media)',        layer: 'Gold', table: 'gold.spend_ledger',          col: 'spend_amount',          upstream: ['silver.media_spend', 'bronze.media_invoices'],                              themes: ['commercial', 'growth'] },
  { driver: 'Revenue attribution (Markov / Shapley)', layer: 'Gold', table: 'gold.revenue_attribution', col: 'attributed_revenue',    upstream: ['silver.touchpoint_paths', 'silver.conversions', 'bronze.web_events'],          themes: ['commercial', 'growth'] },
  { driver: 'Review corpus (app stores + social)', layer: 'Gold', table: 'gold.review_corpus',       col: 'review_text',           upstream: ['silver.app_store_reviews', 'silver.social_mentions', 'bronze.review_raw'],     themes: ['commercial', 'growth'] },
  { driver: 'Competitor ads & pricing',         layer: 'Gold', table: 'gold.competitor_ads',        col: 'price_delta',           upstream: ['silver.competitor_scrape', 'bronze.competitor_raw'],                        themes: ['commercial'] },
  { driver: 'Customer embeddings (lookalike)',  layer: 'Gold', table: 'gold.customer_embeddings',   col: 'embedding_v',           upstream: ['silver.customer_features', 'bronze.feature_raw'],                           themes: ['commercial', 'growth'] },
  // ─── AI & Decisioning + Trust & Operations ─────────────────────────────
  { driver: 'Policy registry (rules + versioning)', layer: 'Gold', table: 'gold.policy_registry',     col: 'policy_id',             upstream: ['silver.policy_authoring', 'bronze.policy_raw'],                             themes: ['commercial'] },
  { driver: 'Social mentions corpus',           layer: 'Gold', table: 'gold.social_mentions',       col: 'verbatim',              upstream: ['silver.twitter_stream', 'silver.reddit_pulls'],                              themes: ['commercial', 'growth'] },
  { driver: 'Experiment assignments',           layer: 'Gold', table: 'gold.experiment_assignments', col: 'arm',                   upstream: ['silver.experiment_engine', 'bronze.assignment_raw'],                         themes: ['commercial'] },
  { driver: 'Experiment outcomes',              layer: 'Gold', table: 'gold.experiment_outcomes',   col: 'outcome_metric',        upstream: ['silver.experiment_metrics', 'bronze.outcome_raw'],                           themes: ['commercial'] },
  { driver: 'Holdout register',                 layer: 'Gold', table: 'gold.holdout_register',      col: 'cohort_id',             upstream: ['silver.holdout_def', 'bronze.holdout_raw'],                                  themes: ['commercial'] },
  { driver: 'Identity graph (resolution)',      layer: 'Gold', table: 'gold.identity_graph',        col: 'persistent_id',         upstream: ['silver.deterministic_keys', 'silver.probabilistic_match'],                  themes: ['commercial'] },
  { driver: 'Audience sync ledger',             layer: 'Gold', table: 'gold.audience_sync_log',     col: 'destination',           upstream: ['silver.aep_sync', 'silver.mc_sync', 'silver.sinch_sync'],                    themes: ['commercial'] },
  { driver: 'Webhook event ledger',             layer: 'Gold', table: 'gold.webhook_events',        col: 'http_code',             upstream: ['silver.webhook_dispatch', 'bronze.webhook_raw'],                              themes: ['commercial'] },
  { driver: 'Price test register',              layer: 'Gold', table: 'gold.price_test_register',   col: 'arm',                   upstream: ['silver.price_engine', 'bronze.pricing_raw'],                                 themes: ['commercial'] },
  { driver: 'Knowledge base hits',              layer: 'Gold', table: 'gold.kb_hits',               col: 'query_text',            upstream: ['silver.cortex_search_log', 'silver.kb_index'],                               themes: ['commercial'] },
  { driver: 'DSAR register (privacy)',          layer: 'Gold', table: 'gold.dsar_register',         col: 'case_id',               upstream: ['silver.dsar_intake', 'bronze.dsar_raw'],                                     themes: ['commercial'] },
  { driver: 'WFM roster (capacity)',            layer: 'Gold', table: 'gold.wfm_roster',            col: 'shift_id',              upstream: ['silver.wfm_schedule', 'bronze.wfm_raw'],                                     themes: ['commercial'] },
  { driver: 'Login events',                     layer: 'Gold', table: 'gold.login_events',          col: 'session_id',            upstream: ['silver.auth_stream', 'bronze.auth_raw'],                                     themes: ['commercial'] },
  { driver: 'SIM-swap register',                layer: 'Gold', table: 'gold.sim_swap_register',     col: 'msisdn',                upstream: ['silver.sim_swap_signal', 'bronze.network_iccid_changes'],                    themes: ['commercial'] },
  { driver: 'MFA register',                     layer: 'Gold', table: 'gold.mfa_register',          col: 'method',                upstream: ['silver.mfa_enrolment', 'bronze.mfa_raw'],                                    themes: ['commercial'] },
  // ─── BSS + CRM ─────────────────────────────────────────────────────────
  { driver: 'Customer accounts (master)',       layer: 'Gold', table: 'gold.accounts',              col: 'account_id',            upstream: ['silver.account_master', 'bronze.crm_raw'],                                   themes: ['commercial'] },
  { driver: 'Account hierarchy (B2B)',          layer: 'Gold', table: 'gold.account_hierarchy',     col: 'parent_id',             upstream: ['silver.org_chart', 'bronze.account_relations'],                              themes: ['commercial'] },
  { driver: 'Contacts (CRM)',                   layer: 'Gold', table: 'gold.contacts',              col: 'contact_id',            upstream: ['silver.crm_contacts', 'bronze.contact_raw'],                                 themes: ['commercial'] },
  { driver: 'Credit register',                  layer: 'Gold', table: 'gold.credit_register',       col: 'credit_limit',          upstream: ['silver.credit_bureau', 'silver.payment_history'],                            themes: ['commercial'] },
  { driver: 'Cases (CRM)',                      layer: 'Gold', table: 'gold.cases',                 col: 'case_id',               upstream: ['silver.case_intake', 'bronze.case_raw'],                                     themes: ['commercial'] },
  { driver: 'Case routing rules',               layer: 'Gold', table: 'gold.case_routing_rules',    col: 'rule_id',               upstream: ['silver.routing_authoring'],                                                  themes: ['commercial'] },
  { driver: 'SLA register',                     layer: 'Gold', table: 'gold.sla_register',          col: 'sla_target',            upstream: ['silver.sla_authoring'],                                                      themes: ['commercial'] },
  { driver: 'Interactions (multi-channel)',     layer: 'Gold', table: 'gold.interactions',          col: 'interaction_id',        upstream: ['silver.cc_chats', 'silver.ivr_calls', 'silver.web_telemetry', 'silver.retail'], themes: ['commercial'] },
  { driver: 'Opportunities (CRM)',              layer: 'Gold', table: 'gold.opportunities_crm',     col: 'opportunity_id',        upstream: ['silver.salesforce_opps', 'bronze.crm_raw'],                                  themes: ['commercial'] },
  { driver: 'Renewal register',                 layer: 'Gold', table: 'gold.renewal_register',      col: 'renewal_date',          upstream: ['silver.contracts', 'silver.salesforce_opps'],                                themes: ['commercial'] },
  { driver: 'Subscriptions',                    layer: 'Gold', table: 'gold.subscriptions',         col: 'subscription_id',       upstream: ['silver.subscription_state', 'bronze.subscription_raw'],                       themes: ['commercial'] },
  { driver: 'Services (TMF 633)',               layer: 'Gold', table: 'gold.services',              col: 'service_id',            upstream: ['silver.service_inventory'],                                                  themes: ['commercial'] },
  { driver: 'SIM inventory',                    layer: 'Gold', table: 'gold.sim_inventory',         col: 'iccid',                 upstream: ['silver.sim_provisioning', 'bronze.sim_raw'],                                  themes: ['commercial'] },
  { driver: 'MSISDN register',                  layer: 'Gold', table: 'gold.msisdn_register',       col: 'msisdn',                upstream: ['silver.msisdn_bank', 'bronze.numbering_raw'],                                themes: ['commercial'] },
  { driver: 'Mediation events',                 layer: 'Gold', table: 'gold.mediation_events',      col: 'event_id',              upstream: ['silver.mediation_stream', 'bronze.cdr_raw'],                                  themes: ['commercial'] },
  { driver: 'Suspense register',                layer: 'Gold', table: 'gold.suspense_register',     col: 'suspense_reason',       upstream: ['silver.mediation_stream'],                                                   themes: ['commercial'] },
  { driver: 'Rated CDRs',                       layer: 'Gold', table: 'gold.cdr_rated',             col: 'rated_amount',          upstream: ['silver.rating_engine'],                                                      themes: ['commercial'] },
  { driver: 'Pre-bill QA results',              layer: 'Gold', table: 'gold.pre_bill_qa',           col: 'qa_outcome',            upstream: ['silver.qa_engine'],                                                          themes: ['commercial'] },
  { driver: 'Bill exceptions',                  layer: 'Gold', table: 'gold.bill_exceptions',       col: 'exception_code',        upstream: ['silver.bill_gen'],                                                           themes: ['commercial'] },
  { driver: 'Port register (MNP)',              layer: 'Gold', table: 'gold.port_register',         col: 'port_id',               upstream: ['silver.mnp_engine'],                                                         themes: ['commercial'] },
  { driver: 'PAC codes',                        layer: 'Gold', table: 'gold.pac_codes',             col: 'pac_id',                upstream: ['silver.pac_authoring'],                                                      themes: ['commercial'] },
  { driver: 'Quotes',                           layer: 'Gold', table: 'gold.quotes',                col: 'quote_id',              upstream: ['silver.cpq', 'bronze.crm_raw'],                                              themes: ['commercial'] },
  { driver: 'Opportunities (B2B)',              layer: 'Gold', table: 'gold.opportunities',         col: 'stage',                 upstream: ['silver.salesforce_opps'],                                                    themes: ['commercial'] },
  { driver: 'Contracts',                        layer: 'Gold', table: 'gold.contracts',             col: 'contract_id',           upstream: ['silver.contract_register'],                                                  themes: ['commercial'] },
  { driver: 'Disputes',                         layer: 'Gold', table: 'gold.disputes',              col: 'dispute_id',            upstream: ['silver.dispute_intake'],                                                     themes: ['commercial'] },
  { driver: 'Adjustments',                      layer: 'Gold', table: 'gold.adjustments',           col: 'adjustment_id',         upstream: ['silver.adjustment_engine'],                                                  themes: ['commercial'] },
  { driver: 'Refund ledger',                    layer: 'Gold', table: 'gold.refund_ledger',         col: 'refund_amount',         upstream: ['silver.refund_engine'],                                                      themes: ['commercial'] },
  { driver: 'RevRec performance obligations',   layer: 'Gold', table: 'gold.revrec_obligations',    col: 'obligation_id',         upstream: ['silver.contract_register', 'silver.product_taxonomy'],                       themes: ['commercial'] },
  { driver: 'Deferred revenue',                 layer: 'Gold', table: 'gold.deferred_revenue',      col: 'deferred_amount',       upstream: ['silver.revrec_allocation'],                                                  themes: ['commercial'] },
  { driver: 'Tax ledger',                       layer: 'Gold', table: 'gold.tax_ledger',            col: 'tax_amount',            upstream: ['silver.tax_engine'],                                                         themes: ['commercial'] },
  { driver: 'Regulatory register',              layer: 'Gold', table: 'gold.regulatory_register',   col: 'return_id',             upstream: ['silver.reg_authoring'],                                                      themes: ['commercial'] },
  { driver: 'Ofcom returns',                    layer: 'Gold', table: 'gold.ofcom_returns',         col: 'return_period',         upstream: ['silver.ofcom_authoring'],                                                    themes: ['commercial'] },
  { driver: 'GL journals',                      layer: 'Gold', table: 'gold.gl_journals',           col: 'journal_id',            upstream: ['silver.gl_engine', 'silver.bill_engine'],                                    themes: ['commercial'] },
  { driver: 'Recon exceptions',                 layer: 'Gold', table: 'gold.recon_exceptions',      col: 'variance',              upstream: ['silver.recon_engine'],                                                       themes: ['commercial'] },
  { driver: 'Period close gating',              layer: 'Gold', table: 'gold.period_close',          col: 'period_id',             upstream: ['silver.close_engine'],                                                       themes: ['commercial'] },
  { driver: 'Wholesale contracts',              layer: 'Gold', table: 'gold.wholesale_contracts',   col: 'mvno_partner',          upstream: ['silver.wholesale_register'],                                                 themes: ['commercial'] },
  { driver: 'Partner traffic',                  layer: 'Gold', table: 'gold.partner_traffic',       col: 'gb_consumed',           upstream: ['silver.mediation_stream'],                                                   themes: ['commercial'] },
  { driver: 'Partner settlements',              layer: 'Gold', table: 'gold.partner_settlements',   col: 'settlement_amount',     upstream: ['silver.settlement_engine'],                                                  themes: ['commercial'] },
  { driver: 'IPX traffic',                      layer: 'Gold', table: 'gold.ipx_traffic',           col: 'corridor',              upstream: ['silver.ipx_stream'],                                                         themes: ['commercial'] },
  { driver: 'Promotions',                       layer: 'Gold', table: 'gold.promotions',            col: 'promo_id',              upstream: ['silver.promo_authoring'],                                                    themes: ['commercial'] },
  { driver: 'Promo eligibility',                layer: 'Gold', table: 'gold.promo_eligibility',     col: 'eligible_flag',         upstream: ['silver.promo_engine'],                                                       themes: ['commercial'] },
  { driver: 'Promo fraud',                      layer: 'Gold', table: 'gold.promo_fraud',           col: 'fraud_score',           upstream: ['silver.promo_engine', 'silver.fraud_engine'],                                themes: ['commercial'] },
  { driver: 'Payments ledger',                  layer: 'Gold', table: 'gold.payments',              col: 'payment_id',            upstream: ['silver.bacs_stream', 'silver.card_processor'],                               themes: ['commercial'] },
  { driver: 'DD attempts',                      layer: 'Gold', table: 'gold.dd_attempts',           col: 'attempt_no',            upstream: ['silver.bacs_stream'],                                                        themes: ['commercial'] },
  { driver: 'Cards on file',                    layer: 'Gold', table: 'gold.cards_on_file',         col: 'last4',                 upstream: ['silver.tokenisation', 'silver.card_processor'],                              themes: ['commercial'] },
  // ─── BSS Tier-1 ML features ────────────────────────────────────────────
  { driver: 'Bill-shock features',              layer: 'Gold', table: 'gold.bill_shock_features',   col: 'forecast_bill',         upstream: ['silver.usage_trajectory', 'silver.tariff_register'],                         themes: ['commercial'] },
  { driver: 'IFRS 9 ECL provisions',            layer: 'Gold', table: 'gold.ecl_provisions',        col: 'ecl_amount',            upstream: ['silver.payment_history', 'silver.macro_overlay'],                            themes: ['commercial'] },
  { driver: 'Order-fallout features',           layer: 'Gold', table: 'gold.order_fallout_features',col: 'fallout_propensity',    upstream: ['silver.order_state', 'silver.fallout_history'],                              themes: ['commercial'] },
  { driver: 'CLV register',                     layer: 'Gold', table: 'gold.clv_register',          col: 'ltv_estimate',          upstream: ['silver.tenure', 'silver.arpu_history', 'silver.churn_risk'],                  themes: ['commercial'] },
  { driver: 'Cross-sell features',              layer: 'Gold', table: 'gold.cross_sell_features',   col: 'next_best_product',     upstream: ['silver.service_mix', 'silver.lookalike_cohort'],                             themes: ['commercial'] },
  { driver: 'Cash inflow forecast',             layer: 'Gold', table: 'gold.cash_forecast',         col: 'forecast_amount',       upstream: ['silver.dd_attempts', 'silver.bacs_stream'],                                  themes: ['commercial'] },
  { driver: 'Revenue movements (waterfall)',    layer: 'Gold', table: 'gold.revenue_movements',     col: 'movement_kind',         upstream: ['silver.bill_engine', 'silver.churn_engine', 'silver.cross_sell_engine'],     themes: ['commercial'] },
  { driver: 'Cash position',                    layer: 'Gold', table: 'gold.cash_position',         col: 'closing_balance',       upstream: ['silver.bank_feed', 'silver.bacs_stream'],                                    themes: ['commercial'] },
  { driver: 'Geo revenue density',              layer: 'Gold', table: 'gold.geo_revenue',           col: 'arpu_density',          upstream: ['silver.subscriptions', 'silver.geo_postcode_lookup'],                        themes: ['commercial'] },
  { driver: 'Product performance',              layer: 'Gold', table: 'gold.product_performance',   col: 'revenue',               upstream: ['silver.bill_engine', 'silver.product_taxonomy'],                              themes: ['commercial'] },
];

export default function Lineage() {
  const { scenario, mode } = useDemoState();
  const a = analyticsForScenario(scenario.id);
  // Lineage is reachable from the Reference section as a domain-neutral catalog
  // AND from CIC pages as a scenario-aware view. We treat it as neutral by default.
  const [scoped, setScoped] = useState(false);
  const isGrowth = scenario.theme === 'growth';
  const accentChip = isGrowth ? 'bg-blue-100 text-blue-800' : 'bg-vfRed-soft text-vfRed-dark';

  const [q, setQ] = useState('');
  const [layer, setLayer] = useState<'all' | 'Bronze' | 'Silver' | 'Gold'>('all');

  const sorted = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let rows = lineageRows.filter((r) =>
      (layer === 'all' || r.layer === layer) &&
      (!ql ||
        r.driver.toLowerCase().includes(ql) ||
        r.table.toLowerCase().includes(ql) ||
        r.col.toLowerCase().includes(ql) ||
        r.upstream.some((u) => u.toLowerCase().includes(ql)))
    );
    if (scoped) {
      rows = [...rows].sort((x, y) => {
        const xh = a.lineageHighlight.includes(x.driver) ? 0 : 1;
        const yh = a.lineageHighlight.includes(y.driver) ? 0 : 1;
        return xh - yh;
      });
    }
    return rows;
  }, [q, layer, scoped, a.lineageHighlight]);

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-6 space-y-4">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-vfRed">Architecture</div>
          <h1 className="text-3xl font-extrabold text-ink">Decision Lineage</h1>
          <p className="text-sm text-ink-muted">
            Every model feature maps back to specific governed tables and columns in Snowflake. Every score is reproducible and auditable — no matter which domain calls it.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
          <span className="vf-chip bg-mist text-ink-muted">{lineageRows.length} drivers</span>
          <span className="vf-chip bg-mist text-ink-muted">100+ gold tables</span>
        </div>
      </header>

      {/* Filters */}
      <div className="vf-card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search driver · gold table · column · upstream…"
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-mist-dark bg-white text-sm focus:outline-none focus:border-vfRed"
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mr-1">Layer</span>
          {(['all', 'Bronze', 'Silver', 'Gold'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setLayer(v)}
              className={`text-[11px] px-2 py-1 rounded-full border ${layer === v ? 'bg-ink text-white border-ink' : 'bg-white text-ink-muted border-mist-dark hover:border-ink'}`}
            >
              {v === 'all' ? 'All' : v}
            </button>
          ))}
        </div>
        {mode === 'cic' && (
          <label className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={scoped}
              onChange={(e) => setScoped(e.target.checked)}
              className="accent-vfRed"
            />
            Scope to active CIC scenario
          </label>
        )}
      </div>

      {scoped && mode === 'cic' && (
        <div className={`vf-card p-4 border-l-4 ${isGrowth ? 'border-l-blue-600' : 'border-l-vfRed'}`}>
          <div className="flex items-start gap-3">
            <Sparkles className={`w-5 h-5 mt-0.5 ${isGrowth ? 'text-blue-700' : 'text-vfRed'}`} />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Scenario · lineage focus</div>
              <div className="font-bold text-ink">{scenario.label}</div>
              <div className="text-xs text-ink-muted mt-0.5">
                Highlighted features below feed the active scenario's models. Other rows still belong to the platform but are out of scope right now.
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.lineageHighlight.map((d) => (
                  <span key={d} className={`vf-chip ${accentChip}`}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="vf-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-[10px] uppercase tracking-wider text-ink-muted font-bold">
            <tr>
              <th className="text-left px-4 py-2.5">Driver / feature</th>
              <th className="text-left px-4 py-2.5">Layer</th>
              <th className="text-left px-4 py-2.5">Gold table</th>
              <th className="text-left px-4 py-2.5">Column</th>
              <th className="text-left px-4 py-2.5">Upstream</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const relevant = scoped && a.lineageHighlight.includes(r.driver);
              const dim = scoped && !relevant;
              return (
                <tr key={r.driver} className={`border-t border-mist-dark ${relevant ? (isGrowth ? 'bg-blue-50/40' : 'bg-vfRed-soft/20') : ''} ${dim ? 'opacity-60' : ''}`}>
                  <td className={`px-4 py-2.5 font-bold text-ink border-l-4 ${relevant ? (isGrowth ? 'border-l-blue-500' : 'border-l-vfRed') : 'border-l-transparent'}`}>
                    {r.driver}
                    {relevant && <span className={`ml-2 vf-chip text-[10px] ${accentChip}`}>active</span>}
                  </td>
                  <td className="px-4 py-2.5"><span className="vf-chip bg-mist text-ink-muted"><Boxes className="w-3 h-3" /> {r.layer}</span></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink">{r.table}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink">{r.col}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {r.upstream.map((u) => {
                        const isSilver = u.startsWith('silver');
                        return (
                          <span key={u} className={`vf-chip text-[10px] ${isSilver ? 'bg-mist text-ink-muted' : 'bg-mist-dark text-ink'}`}>
                            {isSilver ? <Layers className="w-3 h-3" /> : <Database className="w-3 h-3" />} {u}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[12px] text-ink-muted">No rows match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Box title="Snowflake-native lineage" icon={GitBranch}>Lineage and access history are surfaced via Snowflake Horizon, including cross-database object lineage from sources through to activation tables.</Box>
        <Box title="Governance overlays" icon={Layers}>Each lineage edge respects masking policies, row access policies, and tag-based classification — so the same lineage view filters by viewer role.</Box>
        <Box title="Reproducibility" icon={Boxes}>Every score includes the exact `model_version` and `as_of_timestamp` used, allowing any prediction to be re-derived from the underlying tables.</Box>
      </div>
    </div>
  );
}

function Box({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="vf-card p-4">
      <div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4 text-vfRed" /><div className="font-bold text-ink">{title}</div></div>
      <p className="text-sm text-ink-muted">{children}</p>
    </div>
  );
}
