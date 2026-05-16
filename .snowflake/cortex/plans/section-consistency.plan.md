# Section consistency — quick audit + fixes

## Context

I audited the 5 sections (CIC, Digital, BSS, OSS, NOC) for inconsistent UX patterns:

| Pattern | CIC | Digital | BSS | OSS | NOC |
|---|---|---|---|---|---|
| Sidebar scenario picker | ✅ | ✅ | **MISSING** | ✅ | ✅ |
| ScenarioTransport (bottom-right floating pill) | ✅ | ✅ | ✅ | ✅ | ✅ |
| AppHeader "Run scenario" button (Cmd+K) | ✅ | ✅ | ✅ | ✅ | ✅ |
| AskCIC chatbot grounding | ✅ | ✅ | ✅ | n/a | n/a |
| Page breadcrumb | ✅ | ✅ | ✅ | ✅ | ✅ |
| ML badges (`MlBadge` shared) | ✅ | ✅ | ✅ | – | – |
| Customer 360 deep page | ✅ | – | ✅ | – | – |
| Customer 360 cross-link | ✅ → BSS via "Open in BSS 360" already? | – | ✅ → CIC via "Open in CIC 360" | – | – |

**Root cause of the BSS-sidebar miss**: in [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) line 203:
```ts
const showIncidentPicker = effectiveMode === 'noc' || effectiveMode === 'digital' || effectiveMode === 'oss' || effectiveMode === 'cic';
```
BSS is simply not in the OR-list. Adding `'bss'` enables the same picker the other 4 sections share — `scenariosFor('bss')` already returns the 27 BSS scenarios, `selectIncident` already handles BSS ids, and the ScenarioTransport pill already updates correctly.

**Reverse cross-link asymmetry**: BSS Customer 360 has an "Open in CIC 360" link in the top-right header, but the CIC Customer 360 ([src/pages/Customer360Page.tsx](src/pages/Customer360Page.tsx)) only has a "Back to Command Center" link. Adding the reverse "Open in BSS 360 →" makes navigation symmetric.

## Implementation steps

1. Add `'bss'` to the `showIncidentPicker` condition in [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx). One-line fix.
2. Add a reverse "Open in BSS 360 →" `<Link>` in the header row of [src/pages/Customer360Page.tsx](src/pages/Customer360Page.tsx) that points to `/bss/customer/:id`.
3. Typecheck.

## Verification

- `node node_modules/typescript/lib/tsc.js --noEmit` clean.
- Hard-refresh `/bss` — left sidebar shows a "BSS scenarios" dropdown above the nav groups, listing all 27 BSS scenarios. Pick one → ScenarioTransport pill updates → AskCIC grounds correctly.
- Hard-refresh `/customer/CUST-001` — top-right shows the new "Open in BSS 360 →" link, navigates to `/bss/customer/CUST-001`.
- Spot-check `/cic`, `/digital`, `/oss`, `/noc` — all still show their existing sidebar pickers (no regression).

## Critical files

- [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) — add `'bss'` to showIncidentPicker
- [src/pages/Customer360Page.tsx](src/pages/Customer360Page.tsx) — add reverse cross-link

## Risk

Trivial. Two small targeted edits, no schema or behaviour changes.