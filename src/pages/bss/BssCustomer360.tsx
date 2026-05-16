import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, AlertTriangle, CheckCircle2, Phone, MessageCircle, Mail, Smartphone, ShoppingCart, FileText, Receipt, Users } from 'lucide-react';
import { customerById, customers } from '@/data/customers';
import { cn } from '@/lib/utils';

// ─── BSS overlay per customer ────────────────────────────────────────────

interface BssProfile {
  accountId: string;
  accountTier: 'Consumer' | 'SoHo' | 'SME' | 'Mid-market' | 'Enterprise';
  parentAccountId?: string;
  billingCycleGroup: string;
  services: { name: string; type: string; since: string; status: 'live' | 'paused' | 'pending'; msisdn?: string; iccid?: string }[];
  macdHistory: { date: string; action: 'Add' | 'Change' | 'Move' | 'Delete'; description: string }[];
  ddMandate: { status: 'active' | 'inactive' | 'recall'; since: string; bank: string; lastAttempt: string; lastResult: 'success' | 'fail' | 'recall' };
  paymentMix: { dd: number; card: number; pay: number; openBanking: number };
  arAgeing: { d0_30: number; d31_60: number; d61_90: number; d90Plus: number };
  contracts: { id: string; product: string; start: string; end: string; renewalWindow: string; mrr: string }[];
  disputes12mo: { count: number; refundsIssuedTotal: string; openAge: string };
  clvDrivers: { tenure: string; arpu: string; crossSell: string; churnRisk: string };
  eclStage: 'Stage 1' | 'Stage 2' | 'Stage 3';
  propensityToPay: 'High' | 'Medium' | 'Low';
  recentCases: { id: string; type: string; channel: string; status: 'open' | 'on hold' | 'closed'; openedAt: string }[];
  vulnerability?: 'recent_bereavement' | 'financial_difficulty' | null;
  kycLevel: 'Standard' | 'Enhanced';
  cardsOnFile: number;
}

const BSS_OVERLAY: Record<string, BssProfile> = {
  'CUST-001': {
    accountId: 'ACC-1001',
    accountTier: 'Consumer',
    billingCycleGroup: 'CYCLE-04',
    services: [
      { name: 'Unlimited 5G SIM-only',     type: 'Mobile',   since: '2022-09-12', status: 'live', msisdn: '07401-001-001', iccid: 'eSIM-A2B4-…-9831' },
      { name: 'Roaming Pass EU',           type: 'Add-on',   since: '2025-04-02', status: 'live' },
    ],
    macdHistory: [
      { date: '2025-04-02', action: 'Add',    description: 'Roaming Pass EU added (auto-enrol)' },
      { date: '2024-08-12', action: 'Change', description: 'Migrated from 30GB to Unlimited 5G' },
      { date: '2022-09-12', action: 'Add',    description: 'Account opened; eSIM provisioned' },
    ],
    ddMandate: { status: 'active', since: '2022-09-12', bank: 'Barclays · sort 20-** · acct ****-7401', lastAttempt: '2026-04-28', lastResult: 'success' },
    paymentMix: { dd: 100, card: 0, pay: 0, openBanking: 0 },
    arAgeing: { d0_30: 38, d31_60: 0, d61_90: 0, d90Plus: 0 },
    contracts: [
      { id: 'CON-1001-A', product: 'Unlimited 5G SIM-only · 24mo', start: '2024-09-12', end: '2026-09-12', renewalWindow: 'Future', mrr: '£38' },
    ],
    disputes12mo: { count: 1, refundsIssuedTotal: '£12', openAge: 'closed 18d ago' },
    clvDrivers: { tenure: '44mo', arpu: '£38', crossSell: '+£18 (Roaming Pass)', churnRisk: '0.82 (M14 incident)' },
    eclStage: 'Stage 1',
    propensityToPay: 'High',
    recentCases: [
      { id: 'CASE-9402', type: 'Service · M14 5G',    channel: 'Chat',  status: 'open',   openedAt: 'today 09:24' },
      { id: 'CASE-9311', type: 'Billing · pro-rata',  channel: 'Voice', status: 'closed', openedAt: '12d ago' },
    ],
    kycLevel: 'Standard',
    cardsOnFile: 0,
  },
  'CUST-002': {
    accountId: 'ACC-1002',
    accountTier: 'Consumer',
    billingCycleGroup: 'CYCLE-02',
    services: [
      { name: 'SnowTelco Xtra 100GB',  type: 'Mobile', since: '2020-09-04', status: 'live', msisdn: '07401-002-002' },
      { name: 'Handset plan · S23',    type: 'Device', since: '2024-02-12', status: 'live' },
      { name: 'SnowTelco Xtra perks',  type: 'Bundle', since: '2024-02-12', status: 'live' },
    ],
    macdHistory: [
      { date: '2024-02-12', action: 'Add',    description: 'Galaxy S23 handset plan + Xtra perks bundle' },
      { date: '2022-08-08', action: 'Change', description: 'Plan upgrade to Xtra 100GB' },
      { date: '2020-09-04', action: 'Add',    description: 'Account opened; physical SIM dispatched' },
    ],
    ddMandate: { status: 'active', since: '2020-09-04', bank: 'HSBC · sort 40-** · acct ****-3128', lastAttempt: '2026-04-04', lastResult: 'success' },
    paymentMix: { dd: 100, card: 0, pay: 0, openBanking: 0 },
    arAgeing: { d0_30: 47, d31_60: 0, d61_90: 0, d90Plus: 0 },
    contracts: [
      { id: 'CON-1002-A', product: 'Xtra 100GB + S23 · 36mo', start: '2024-02-12', end: '2027-02-12', renewalWindow: 'Future', mrr: '£47' },
    ],
    disputes12mo: { count: 2, refundsIssuedTotal: '£42', openAge: 'one open 3.6d' },
    clvDrivers: { tenure: '67mo', arpu: '£47', crossSell: '+£0', churnRisk: '0.76 (bill shock)' },
    eclStage: 'Stage 1',
    propensityToPay: 'High',
    recentCases: [
      { id: 'CASE-9388', type: 'Billing · roaming charge', channel: 'Email', status: 'open',  openedAt: '3.6d ago' },
      { id: 'CASE-9214', type: 'Billing · plan change',    channel: 'Voice', status: 'closed',openedAt: '34d ago' },
    ],
    kycLevel: 'Standard',
    cardsOnFile: 0,
  },
  'CUST-003': {
    accountId: 'ACC-1003',
    accountTier: 'Consumer',
    billingCycleGroup: 'CYCLE-06',
    services: [
      { name: 'SnowGo Endless Social',  type: 'Mobile', since: '2024-07-22', status: 'live', msisdn: '07401-003-003' },
    ],
    macdHistory: [
      { date: '2024-07-22', action: 'Add', description: 'Account opened · pre-paid → SnowGo SIM-only' },
    ],
    ddMandate: { status: 'inactive', since: '—', bank: 'card-on-file', lastAttempt: '—', lastResult: 'success' },
    paymentMix: { dd: 0, card: 100, pay: 0, openBanking: 0 },
    arAgeing: { d0_30: 20, d31_60: 0, d61_90: 0, d90Plus: 0 },
    contracts: [
      { id: 'CON-1003-A', product: 'SnowGo Endless Social · rolling', start: '2024-07-22', end: 'rolling', renewalWindow: 'Open', mrr: '£20' },
    ],
    disputes12mo: { count: 0, refundsIssuedTotal: '£0', openAge: '—' },
    clvDrivers: { tenure: '22mo', arpu: '£20', crossSell: '+£0', churnRisk: '0.71 (competitor offer)' },
    eclStage: 'Stage 1',
    propensityToPay: 'Medium',
    recentCases: [
      { id: 'CASE-9320', type: 'Care · plan options', channel: 'Chat', status: 'closed', openedAt: '6d ago' },
    ],
    kycLevel: 'Standard',
    cardsOnFile: 1,
  },
  'CUST-004': {
    accountId: 'ACC-1004',
    accountTier: 'Consumer',
    billingCycleGroup: 'CYCLE-01',
    services: [
      { name: 'Unlimited Max 5G',          type: 'Mobile',     since: '2021-06-10', status: 'live', msisdn: '07401-004-004' },
      { name: 'Apple Watch eSIM',          type: 'Companion',  since: '2023-11-22', status: 'live' },
      { name: 'SnowTelco Pro Broadband',   type: 'Broadband',  since: '2022-04-11', status: 'live' },
      { name: 'Family line × 1',           type: 'Mobile',     since: '2023-02-04', status: 'live' },
    ],
    macdHistory: [
      { date: '2023-11-22', action: 'Add',    description: 'Apple Watch eSIM provisioned' },
      { date: '2023-02-04', action: 'Add',    description: 'Family line added' },
      { date: '2022-04-11', action: 'Add',    description: 'Pro Broadband ordered' },
      { date: '2021-06-10', action: 'Add',    description: 'Account opened · Unlimited Max 5G' },
    ],
    ddMandate: { status: 'active', since: '2021-06-10', bank: 'NatWest · sort 60-** · acct ****-4422', lastAttempt: '2026-05-01', lastResult: 'success' },
    paymentMix: { dd: 100, card: 0, pay: 0, openBanking: 0 },
    arAgeing: { d0_30: 62, d31_60: 0, d61_90: 0, d90Plus: 0 },
    contracts: [
      { id: 'CON-1004-A', product: 'Unlimited Max 5G + Watch + Pro BB · 24mo', start: '2024-06-10', end: '2026-06-10', renewalWindow: 'Approaching', mrr: '£62' },
    ],
    disputes12mo: { count: 0, refundsIssuedTotal: '£0', openAge: '—' },
    clvDrivers: { tenure: '58mo', arpu: '£62', crossSell: '+£28 (Watch + BB)', churnRisk: '0.63 (care)' },
    eclStage: 'Stage 1',
    propensityToPay: 'High',
    recentCases: [
      { id: 'CASE-9244', type: 'Care · 5G upgrade', channel: 'App',   status: 'closed', openedAt: '8d ago' },
    ],
    kycLevel: 'Standard',
    cardsOnFile: 1,
  },
  'CUST-005': {
    accountId: 'ACC-1005',
    accountTier: 'Consumer',
    billingCycleGroup: 'CYCLE-08',
    services: [
      { name: 'SnowFlex 30GB Flexible',    type: 'Mobile',  since: '2025-03-08', status: 'live', msisdn: '07401-005-005' },
    ],
    macdHistory: [
      { date: '2025-03-08', action: 'Add', description: 'Account opened · SnowFlex 30GB · port-in from EE' },
    ],
    ddMandate: { status: 'active', since: '2025-03-08', bank: 'Monzo · sort 04-** · acct ****-9012', lastAttempt: '2026-04-22', lastResult: 'success' },
    paymentMix: { dd: 100, card: 0, pay: 0, openBanking: 0 },
    arAgeing: { d0_30: 12, d31_60: 0, d61_90: 0, d90Plus: 0 },
    contracts: [
      { id: 'CON-1005-A', product: 'SnowFlex 30GB · 12mo', start: '2025-03-08', end: '2026-03-08', renewalWindow: 'Open', mrr: '£12' },
    ],
    disputes12mo: { count: 0, refundsIssuedTotal: '£0', openAge: '—' },
    clvDrivers: { tenure: '14mo', arpu: '£12', crossSell: '+£0', churnRisk: '0.69 (price-sensitive)' },
    eclStage: 'Stage 1',
    propensityToPay: 'Medium',
    recentCases: [
      { id: 'CASE-9268', type: 'Care · price match', channel: 'Chat', status: 'open', openedAt: '2d ago' },
    ],
    kycLevel: 'Standard',
    cardsOnFile: 0,
  },
  'CUST-006': {
    accountId: 'ACC-1006',
    accountTier: 'Consumer',
    billingCycleGroup: 'CYCLE-03',
    services: [
      { name: 'SnowTelco Lite Advanced 100GB', type: 'Mobile', since: '2023-10-04', status: 'live', msisdn: '07401-006-006' },
    ],
    macdHistory: [
      { date: '2023-10-04', action: 'Add',    description: 'Account opened · SIM-only Advanced 100GB' },
      { date: '2025-12-08', action: 'Change', description: 'Retention offer accepted · 12mo lock' },
    ],
    ddMandate: { status: 'active', since: '2023-10-04', bank: 'Lloyds · sort 30-** · acct ****-6655', lastAttempt: '2026-04-14', lastResult: 'success' },
    paymentMix: { dd: 100, card: 0, pay: 0, openBanking: 0 },
    arAgeing: { d0_30: 18, d31_60: 0, d61_90: 0, d90Plus: 0 },
    contracts: [
      { id: 'CON-1006-A', product: 'Lite Advanced 100GB · 12mo', start: '2025-12-08', end: '2026-12-08', renewalWindow: 'Future', mrr: '£18' },
    ],
    disputes12mo: { count: 0, refundsIssuedTotal: '£0', openAge: '—' },
    clvDrivers: { tenure: '31mo', arpu: '£18', crossSell: '+£0', churnRisk: '0.64 (offer fatigue)' },
    eclStage: 'Stage 1',
    propensityToPay: 'High',
    recentCases: [],
    kycLevel: 'Standard',
    cardsOnFile: 0,
  },
};

// ─── Layout helpers ──────────────────────────────────────────────────────

function KpiTile({ label, value, delta, tone = 'neutral' }: { label: string; value: string; delta?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneCls = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-vfRed' : tone === 'warn' ? 'text-amber' : 'text-ink-muted';
  return (
    <div className="vf-card px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">{label}</div>
      <div className="text-xl font-extrabold text-ink mt-0.5 font-mono tabular-nums leading-none">{value}</div>
      {delta && <div className={cn('text-[10px] mt-0.5', toneCls)}>{delta}</div>}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-2">{children}</div>;
}

function StatusChip({ status }: { status: 'live' | 'paused' | 'pending' | 'open' | 'closed' | 'on hold' | 'active' | 'inactive' | 'recall' | 'success' | 'fail' }) {
  const tone = status === 'live' || status === 'closed' || status === 'active' || status === 'success' ? 'bg-emerald-100 text-emerald-700'
              : status === 'open' ? 'bg-blue-100 text-blue-700'
              : status === 'on hold' || status === 'pending' || status === 'inactive' ? 'bg-mist text-ink-muted'
              : 'bg-vfRed text-white';
  return <span className={cn('vf-chip text-[9px] uppercase font-bold', tone)}>{status}</span>;
}

// ─── The page ────────────────────────────────────────────────────────────

export default function BssCustomer360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerId = id ?? 'CUST-001';
  const customer = customerById(customerId);
  const bss = BSS_OVERLAY[customerId] ?? BSS_OVERLAY['CUST-001'];
  const totalOpen = bss.arAgeing.d0_30 + bss.arAgeing.d31_60 + bss.arAgeing.d61_90 + bss.arAgeing.d90Plus;

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/bss/accounts" className="text-sm text-ink-muted hover:text-ink inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Customer Accounts
        </Link>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-ink-muted font-bold uppercase tracking-wider">Customer:</label>
          <select
            value={customerId}
            onChange={(e) => navigate(`/bss/customer/${e.target.value}`)}
            className="text-xs rounded-lg border border-mist-dark bg-white px-2 py-1.5 font-semibold text-ink min-w-[220px]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.id} · {c.name} · {c.brand}</option>
            ))}
          </select>
          <Link to={`/customer/${customerId}`} className="text-xs text-vfRed hover:text-vfRed-dark font-bold inline-flex items-center gap-1">
            Open in CIC 360 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="vf-card p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-vfRed-soft text-vfRed-dark grid place-items-center font-extrabold text-lg">
              {customer.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-vfRed font-bold">BSS · CRM · Customer 360</div>
              <h1 className="text-2xl font-extrabold text-ink leading-tight">{customer.name}</h1>
              <div className="text-xs text-ink-muted">
                <span className="font-mono">{bss.accountId}</span> · {bss.accountTier} · {customer.brand} · {customer.city}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><CheckCircle2 className="w-3 h-3" /> DD active</span>
            <span className="vf-chip bg-emerald-100 text-emerald-700 text-[10px]"><CheckCircle2 className="w-3 h-3" /> Marketing consent</span>
            {bss.vulnerability && (
              <span className="vf-chip bg-vfRed-soft text-vfRed-dark text-[10px]"><AlertTriangle className="w-3 h-3" /> Vulnerability: {bss.vulnerability.replace('_', ' ')}</span>
            )}
            <span className="vf-chip bg-mist text-ink-muted text-[10px]">ECL {bss.eclStage}</span>
            <span className="vf-chip bg-mist text-ink-muted text-[10px]">KYC {bss.kycLevel}</span>
            <span className="vf-chip bg-mist text-ink-muted text-[10px]">Cycle {bss.billingCycleGroup}</span>
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Active services" value={`${bss.services.length}`} delta="this account" tone="good" />
        <KpiTile label="ARPU / mo" value={`£${customer.monthlySpend}`} delta={customer.brand} tone="good" />
        <KpiTile label="CLV (est.)" value={`£${customer.customerLifetimeValue.toLocaleString()}`} delta="clv_bayesian_v3" tone="good" />
        <KpiTile label="ECL stage" value={bss.eclStage} delta={`prop-to-pay ${bss.propensityToPay}`} tone={bss.eclStage === 'Stage 1' ? 'good' : 'warn'} />
        <KpiTile label="Open balance" value={totalOpen ? `£${totalOpen}` : '£0'} delta="0d past due" tone="good" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* 1. Billing accounts hierarchy */}
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>1 · Billing accounts hierarchy</CardTitle>
          <div className="space-y-1 text-[12px] font-mono">
            {bss.parentAccountId && (
              <div className="flex items-center gap-2"><span className="vf-chip bg-vfRed text-white text-[9px]">PARENT</span><span className="font-bold text-ink">{bss.parentAccountId}</span></div>
            )}
            <div className={cn('flex items-center gap-2', bss.parentAccountId && 'pl-4')}>
              {bss.parentAccountId && <span className="text-ink-muted">└─</span>}
              <span className="vf-chip bg-mist text-ink-muted text-[9px]">{bss.accountTier.toUpperCase()}</span>
              <span className="font-bold text-ink">{bss.accountId}</span>
              <span className="text-ink-muted">· cycle {bss.billingCycleGroup}</span>
            </div>
          </div>
          <div className="text-[10px] text-ink-muted mt-2">Invoice consolidation: account-level · audit <span className="font-mono">gold.accounts + gold.account_hierarchy</span>.</div>
        </div>

        {/* 2. Services & MSISDN inventory */}
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>2 · Services & MSISDN inventory</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Service</th><th>Type</th><th>MSISDN / ICCID</th><th>Live since</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bss.services.map((s) => (
                <tr key={s.name} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-bold text-ink">{s.name}</td>
                  <td className="text-center text-ink-muted">{s.type}</td>
                  <td className="text-center font-mono text-[10.5px]">{s.msisdn ?? s.iccid ?? '—'}</td>
                  <td className="text-center font-mono text-ink-muted">{s.since}</td>
                  <td className="text-center"><StatusChip status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Plan history (MACD) */}
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>3 · Plan history · MACD timeline</CardTitle>
          <div className="space-y-1.5 text-[12px]">
            {bss.macdHistory.map((m, i) => (
              <div key={i} className="flex items-center gap-2 border-b border-mist-dark/60 pb-1">
                <span className="font-mono text-ink-muted w-[88px] shrink-0">{m.date}</span>
                <span className={cn('vf-chip text-[9px] uppercase font-bold w-[64px] justify-center',
                  m.action === 'Add' ? 'bg-emerald-100 text-emerald-700'
                  : m.action === 'Change' ? 'bg-blue-100 text-blue-700'
                  : m.action === 'Move' ? 'bg-amber/20 text-amber-800'
                  : 'bg-vfRed text-white')}>{m.action}</span>
                <span className="text-ink">{m.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Payments & DD */}
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>4 · Payments & Direct Debit</CardTitle>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex items-center gap-2"><span className="text-ink-muted w-[100px]">Mandate</span><StatusChip status={bss.ddMandate.status} /><span className="font-mono text-ink-muted">since {bss.ddMandate.since}</span></div>
            <div className="flex items-center gap-2"><span className="text-ink-muted w-[100px]">Bank</span><span className="font-mono text-ink">{bss.ddMandate.bank}</span></div>
            <div className="flex items-center gap-2"><span className="text-ink-muted w-[100px]">Last attempt</span><span className="font-mono text-ink">{bss.ddMandate.lastAttempt}</span><StatusChip status={bss.ddMandate.lastResult} /></div>
            <div className="flex items-center gap-2"><span className="text-ink-muted w-[100px]">Cards on file</span><span className="font-mono text-ink">{bss.cardsOnFile}</span></div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Payment-method mix</div>
            <div className="flex h-3 rounded overflow-hidden">
              {bss.paymentMix.dd > 0 && <div className="bg-emerald-500" style={{ width: `${bss.paymentMix.dd}%` }} title={`DD ${bss.paymentMix.dd}%`} />}
              {bss.paymentMix.card > 0 && <div className="bg-amber" style={{ width: `${bss.paymentMix.card}%` }} title={`Card ${bss.paymentMix.card}%`} />}
              {bss.paymentMix.pay > 0 && <div className="bg-blue-500" style={{ width: `${bss.paymentMix.pay}%` }} title={`Apple/Google Pay ${bss.paymentMix.pay}%`} />}
              {bss.paymentMix.openBanking > 0 && <div className="bg-purple-500" style={{ width: `${bss.paymentMix.openBanking}%` }} title={`Open banking ${bss.paymentMix.openBanking}%`} />}
            </div>
          </div>
        </div>

        {/* 5. AR ageing */}
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>5 · AR ageing · open balance</CardTitle>
          <div className="grid grid-cols-4 gap-2 text-[12px]">
            {[
              { label: '0–30d',  value: bss.arAgeing.d0_30,  tone: 'good' },
              { label: '31–60d', value: bss.arAgeing.d31_60, tone: bss.arAgeing.d31_60 ? 'warn' : 'neutral' },
              { label: '61–90d', value: bss.arAgeing.d61_90, tone: bss.arAgeing.d61_90 ? 'warn' : 'neutral' },
              { label: '90+d',   value: bss.arAgeing.d90Plus, tone: bss.arAgeing.d90Plus ? 'bad' : 'neutral' },
            ].map((b) => (
              <div key={b.label} className="vf-card p-2 text-center">
                <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">{b.label}</div>
                <div className={cn('text-base font-extrabold font-mono', b.tone === 'good' ? 'text-emerald-700' : b.tone === 'warn' ? 'text-amber-700' : b.tone === 'bad' ? 'text-vfRed' : 'text-ink-muted')}>£{b.value}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-ink-muted mt-2">Total open £{totalOpen} · 0d past due · audit <span className="font-mono">gold.payments</span>.</div>
        </div>

        {/* 6. Contracts */}
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>6 · Contracts</CardTitle>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-ink-muted font-bold border-b border-mist-dark">
              <tr><th className="text-left py-1.5">Contract</th><th>Product</th><th>Start</th><th>End</th><th>Window</th><th>MRR</th></tr>
            </thead>
            <tbody>
              {bss.contracts.map((c) => (
                <tr key={c.id} className="border-b border-mist-dark/60">
                  <td className="py-1.5 font-mono text-ink">{c.id}</td>
                  <td className="text-ink">{c.product}</td>
                  <td className="text-center font-mono text-ink-muted">{c.start}</td>
                  <td className="text-center font-mono text-ink-muted">{c.end}</td>
                  <td className="text-center text-ink-muted">{c.renewalWindow}</td>
                  <td className="text-center font-mono font-bold">{c.mrr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 7. Disputes & adjustments */}
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>7 · Disputes & adjustments (12mo)</CardTitle>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            <div className="vf-card p-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Disputes</div>
              <div className={cn('text-base font-extrabold font-mono', bss.disputes12mo.count ? 'text-amber-700' : 'text-emerald-700')}>{bss.disputes12mo.count}</div>
            </div>
            <div className="vf-card p-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Refunds</div>
              <div className="text-base font-extrabold font-mono text-ink">{bss.disputes12mo.refundsIssuedTotal}</div>
            </div>
            <div className="vf-card p-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-ink-muted font-bold">Open age</div>
              <div className="text-[10.5px] font-mono text-ink-muted leading-tight">{bss.disputes12mo.openAge}</div>
            </div>
          </div>
        </div>

        {/* 8. CLV / ECL drivers */}
        <div className="col-span-12 lg:col-span-7 vf-card p-3">
          <CardTitle>8 · CLV drivers · clv_bayesian_v3</CardTitle>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="vf-card p-2"><div className="text-[10px] text-ink-muted">Tenure</div><div className="font-bold text-ink">{bss.clvDrivers.tenure}</div></div>
            <div className="vf-card p-2"><div className="text-[10px] text-ink-muted">ARPU</div><div className="font-bold text-ink">{bss.clvDrivers.arpu}</div></div>
            <div className="vf-card p-2"><div className="text-[10px] text-ink-muted">Cross-sell uplift</div><div className="font-bold text-ink">{bss.clvDrivers.crossSell}</div></div>
            <div className="vf-card p-2"><div className="text-[10px] text-ink-muted">Churn risk</div><div className="font-bold text-vfRed">{bss.clvDrivers.churnRisk}</div></div>
          </div>
          <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.clv_register</span>.</div>
        </div>

        {/* 9. Care & interactions */}
        <div className="col-span-12 lg:col-span-5 vf-card p-3">
          <CardTitle>9 · Recent cases · interactions</CardTitle>
          {bss.recentCases.length === 0 ? (
            <div className="text-[12px] text-ink-muted italic">No recent cases · clean account.</div>
          ) : (
            <div className="space-y-1.5 text-[12px]">
              {bss.recentCases.map((c) => (
                <div key={c.id} className="flex items-center gap-2 border-b border-mist-dark/60 pb-1">
                  <span className="font-mono text-ink-muted w-[80px] shrink-0">{c.id}</span>
                  <span className="vf-chip bg-mist text-ink-muted text-[9px] w-[60px] justify-center shrink-0">{c.channel}</span>
                  <span className="text-ink truncate">{c.type}</span>
                  <span className="ml-auto"><StatusChip status={c.status} /></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 10. Consent & compliance */}
        <div className="col-span-12 vf-card p-3">
          <CardTitle>10 · Consent & compliance</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
            <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-ink-muted">Marketing consent</span><span className="font-mono text-ink ml-auto">{customer.consentStatus.includes('eligible') ? 'opted-in' : 'suppressed'}</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-ink-muted">KYC level</span><span className="font-mono text-ink ml-auto">{bss.kycLevel}</span></div>
            <div className="flex items-center gap-2">{bss.vulnerability ? <AlertTriangle className="w-3.5 h-3.5 text-vfRed" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}<span className="text-ink-muted">Vulnerability</span><span className="font-mono text-ink ml-auto">{bss.vulnerability ?? 'none'}</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-ink-muted">GDPR Art.6 basis</span><span className="font-mono text-ink ml-auto">contract</span></div>
          </div>
          <div className="text-[10px] text-ink-muted mt-2">audit <span className="font-mono">gold.consent_register + gold.vulnerability_register</span>.</div>
        </div>
      </div>

      {/* Footer · audit */}
      <div className="vf-card p-3 flex items-center gap-2 flex-wrap">
        <Sparkles className="w-3.5 h-3.5 text-vfRed shrink-0" />
        <span className="text-[10px] text-ink-muted">Powered by <span className="font-mono text-ink">gold.accounts · gold.subscriptions · gold.services · gold.contracts · gold.payments · gold.ecl_provisions · gold.clv_register · gold.cases · gold.consent_register</span></span>
      </div>
    </div>
  );
}
