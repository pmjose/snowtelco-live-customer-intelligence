# BSS Customer 360

## Context

- Existing Customer 360 lives at `/customer/:id` ([src/pages/Customer360Page.tsx](src/pages/Customer360Page.tsx)) and renders the CIC churn lens.
- The 6 demo customers are defined in [src/data/customers.ts](src/data/customers.ts): Amelia Hughes (CUST-001), Daniel Shah (CUST-002), Hannah Bennett (CUST-003), Ravi Kapoor (CUST-004), Grace Owen (CUST-005), one more (CUST-006). Each has `plan`, `device`, `monthlySpend`, `tenureMonths`, `customerLifetimeValue`, `productHoldings`, `consentStatus`, etc.
- BSS already has a Customer Accounts page at `/bss/accounts` ([src/pages/bss/BssExtended.tsx](src/pages/bss/BssExtended.tsx)) and a CRM Pipeline page. Today the accounts table is read-only — we'll make rows clickable.
- BSS lens means the BSS audience cares about billing accounts hierarchy, active services / MSISDN / SIM, plan history (MACD), payment behaviour, AR ageing, ECL stage, contract dates, dispute history, CLV — not the churn save story.

## Design

```mermaid
flowchart LR
    list[/bss/accounts/] --> click[Click a customer row]
    click --> route[/bss/customer/:id/]
    route --> page[BssCustomer360 page]
    page --> sources[customers.ts + scenarios.ts data]
    page --> sections[10 BSS-lens sections]
    sections --> billing[Billing account · DD · cards]
    sections --> services[Services · MSISDN · SIM]
    sections --> contract[Contract · MACD history]
    sections --> finance[CLV · ECL stage · disputes]
    sections --> care[Cases / interactions]
    sections --> compliance[Consent · vulnerability · KYC]
```

## Page sections (single new page)

Header: avatar, name, tier (Consumer / SoHo / SME / etc.), city, brand, status badges (DD active, marketing consent, vulnerability flag, ECL stage). "Open in CIC 360" link back-references the existing CIC view.

KPI strip (5 tiles): Active services count · ARPU/mo · CLV · ECL stage · Open balance.

10 BSS panels:

1. **Billing accounts hierarchy** — account ID, billing entity, parent (for B2B customers), invoice consolidation rule, billing-cycle group.
2. **Services & MSISDN inventory** — table of active services (Mobile SIM, Roaming Pass, Disney+, etc.), MSISDN, ICCID/eSIM profile, since-date, status.
3. **Plan history (MACD)** — chronological MACD table: Move, Add, Change, Delete actions over the last 24 months.
4. **Payments & DD** — DD mandate status, mandate date, payment-method mix, last 6 attempts (success/fail), BACS recall flag.
5. **AR ageing** — bucketed open balance: 0–30d / 31–60d / 61–90d / 90+d. Total open + overdue chip.
6. **Contracts** — current contract, start, end, renewal window, MRR, churn risk (cross-link), terms.
7. **Disputes & adjustments** — past 12-month disputes, refunds issued, adjustments approved (£), Ofcom complaint codes if any.
8. **CLV & ECL** — `clv_bayesian_v3` value with drivers, IFRS 9 stage, propensity-to-pay band.
9. **Care & interactions** — cross-channel interaction river (cases opened, calls, chats), top recent cases, average MTTR per ticket.
10. **Consent & compliance** — marketing consent, vulnerability flags (with reason if any), KYC level, GDPR Art.6 lawful basis.

Each panel uses the same card pattern as `BssExtended.tsx` (PageHeader / KpiTile / GoldChip helpers). Reuse `BssMlBadge` and `CortexCompleteDraft` already exported.

## Data — reuse the 6 customers, add a tiny BSS overlay

Two options for the BSS-specific fields:

**A.** Inline a `BSS_OVERLAY` map at the top of the new page file with per-customer billing-account, services list, payment behaviour, AR ageing, etc. Pros: zero schema churn. Cons: keeps BSS data colocated with the page.

**B.** Add a `bssProfile` map next to `customers` in [src/data/customers.ts](src/data/customers.ts).

Pick **A** for this drop — keeps `customers.ts` untouched and avoids any risk to the CIC pages that read from it. We'll do **B** if we ever need cross-page reuse.

Per customer, BSS overlay carries:
```ts
{
  accountId: string;            // e.g. ACC-1001
  parentAccountId?: string;     // e.g. ACC-7401 for GreenLeaf
  billingCycleGroup: string;    // CYCLE-04
  services: { name; type; since; status; msisdn?; iccid? }[];
  macdHistory: { date; action; description }[];
  ddMandate: { status; since; bank; lastAttempt; lastResult };
  paymentMix: { dd; card; pay; openBanking };
  arAgeing: { d0_30; d31_60; d61_90; d90Plus };
  contracts: { id; product; start; end; renewalWindow; mrr; }[];
  disputes12mo: { count; refundsIssuedTotal; openAge };
  clvDrivers: { tenure; arpu; crossSell; churnRisk; }; // headline numbers per customer
  eclStage: 'Stage 1' | 'Stage 2' | 'Stage 3';
  propensityToPay: 'High' | 'Medium' | 'Low';
  recentCases: { id; type; channel; status; openedAt }[];
  vulnerability?: 'recent_bereavement' | 'financial_difficulty' | null;
  kycLevel: 'Standard' | 'Enhanced';
}
```

The 6 entries take ~120 lines total inlined. Picking believable numbers consistent with each customer's CIC profile (e.g. CUST-001 Amelia is High value · ECL Stage 1 · prop-to-pay High · 1 open dispute).

## Files touched

**New (1):**
- `src/pages/bss/BssCustomer360.tsx` — the page + the BSS overlay map.

**Edited (3):**
- [src/main.tsx](src/main.tsx) — register `/bss/customer/:id` route.
- [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) — add a "Customer 360" entry under CRM (or under Customer Accounts as a sub-link). Simpler: add it as a stand-alone item under CRM that defaults to `/bss/customer/CUST-001`.
- [src/pages/bss/BssExtended.tsx](src/pages/bss/BssExtended.tsx) — make the existing top-accounts table rows in `BssAccounts` link to `/bss/customer/:id` (use `<Link>` from react-router-dom). Add a small "Open in BSS 360" CTA.

## Implementation steps

1. Add `BssCustomer360` page with the BSS overlay map for 6 customers + 10 panels.
2. Wire route in `main.tsx`.
3. Add sidebar entry under CRM (between Customer Accounts and Cases).
4. Make `BssAccounts` top-accounts rows clickable.
5. Typecheck (`node node_modules/typescript/lib/tsc.js --noEmit`).

## Verification

- Typecheck clean.
- Hard-refresh `/bss/customer/CUST-001` (Amelia) and walk panels: header chips, 5 KPIs, 10 sections.
- Visit `/bss/customer/CUST-002` through `/bss/customer/CUST-006` — each shows the right BSS overlay (different stages, AR ageing, services, etc.).
- Click a row in `/bss/accounts` and confirm it lands on the right customer page.
- Sidebar shows "Customer 360" under CRM and the link defaults to CUST-001.

## Critical files

- [src/pages/bss/BssCustomer360.tsx](src/pages/bss/BssCustomer360.tsx) — new page + overlay
- [src/data/customers.ts](src/data/customers.ts) — read-only source of 6 customers
- [src/main.tsx](src/main.tsx) — route registration
- [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) — CRM group nav entry
- [src/pages/bss/BssExtended.tsx](src/pages/bss/BssExtended.tsx) — make accounts table rows clickable

## Risk

Very low. One new page, one route, one sidebar entry, one small accounts-table tweak. Reuses existing 6 customers — no schema work. The CIC `/customer/:id` route remains untouched.