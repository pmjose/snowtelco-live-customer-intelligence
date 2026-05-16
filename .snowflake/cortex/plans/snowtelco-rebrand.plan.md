# Plan: Rebrand to SnowTelco

## Overview
The repo (currently in folder `SnowTelco Live Customer Intelligence/`) is a Vite + React + Tailwind demo branded as **VodafoneThree Customer Intelligence Command Center**. We will convert all VodafoneThree branding to **SnowTelco**, replace the red theme with Snowflake blue, and swap the logo for the provided Snowflake logo.

## Findings

### Where VodafoneThree branding lives
- **Logo asset**: `public/vodafonethree-logo.svg` (favicon target)
- **Remote logo URLs** (Wikimedia VodafoneThree PNG):
  - `src/components/app/AppHeader.tsx:12`
  - `src/pages/Briefing.tsx:23`
- **Page title / app name**: `index.html:10`, `package.json:2`
- **Visible copy**: `Landing.tsx`, `Architecture.tsx`, `Briefing.tsx`, `Settings.tsx`, `CommandCenter.tsx`
- **Facts data file**: `src/data/vodafoneThreeFacts.ts` (imported by `Landing.tsx`)
- **Sub-brand model**: `Brand = 'Vodafone' | 'Three' | 'SMARTY' | 'VOXI' | 'Talkmobile'` in `src/data/customers.ts:0`, used in scenarios, offers, churn, cicChat, timeline, architecture, AtRiskCustomerList, CustomersList
- **Theme tokens**: `tailwind.config.js` defines `vfRed` (#E60000) used pervasively as `bg-vfRed`, `text-vfRed`, etc.
- **localStorage keys**: `vdf3.theme`, `vdf3.sound`, `vdf3.narrator`, `vdf3.scenario` in `DemoStateProvider.tsx`

## Proposed changes

### 1. Logo & favicon
- Rename `public/vodafonethree-logo.svg` → `public/snowtelco-logo.svg` (or keep file, just replace contents — see Q1)
- Update `index.html` favicon `href` accordingly + change `<title>` to `SnowTelco | Customer Intelligence Command Center`
- Replace remote logo `<img src=...>` in AppHeader.tsx and Briefing.tsx with `https://companieslogo.com/img/orig/SNOW-35164165.png?t=1751096598`

### 2. Theme color
Replace `vfRed` palette:
```
vfRed: { DEFAULT: '#29B5E8', dark: '#11567F', soft: '#E0F4FB' }
```
Keeping the token name `vfRed` is the lowest-risk path (no component edits). Alternatively, do a full rename to `brand` (touches ~all UI files). **Q2** — preference?

### 3. Naming swap
- "VodafoneThree" → "SnowTelco"
- Page titles, README, package.json `name: snowtelco-cic`
- Rename data file `vodafoneThreeFacts.ts` → `snowTelcoFacts.ts` and update Landing.tsx import + exported symbol names
- "VodafoneThree UK" → "SnowTelco UK" (keep UK setting since the SVG map is UK-shaped)

### 4. Sub-brand swap
Current dual-brand model has rich semantic meaning (Vodafone = premium, Three = value). Proposed mapping (subject to Q3):
- Vodafone → **SnowTelco** (premium)
- Three → **SnowTelco Lite** (value/data-rich)
- SMARTY → **SnowFlex**
- VOXI → **SnowGo**
- Talkmobile → **SnowTalk**

Plan-name strings get the same swap (e.g. `Vodafone Xtra 100GB` → `SnowTelco Xtra 100GB`, `Three Advanced 100GB` → `SnowTelco Lite Advanced 100GB`).

### 5. localStorage keys
Rename `vdf3.*` → `snowtelco.*` in `DemoStateProvider.tsx`. Resets persisted demo state (acceptable for a demo).

### 6. Verification
Run `npm run typecheck` and `npm run build`.

## Open questions for user
- **Q1**: Replace the local `vodafonethree-logo.svg` file with a Snowflake SVG, or just point everything to the provided remote PNG and delete the local file?
- **Q2**: Keep token name `vfRed` (smallest diff) or rename to `brand`/`snowBlue` everywhere?
- **Q3**: Sub-brand naming — accept the proposal (SnowTelco / SnowTelco Lite / SnowFlex / SnowGo / SnowTalk), collapse to a single brand, or supply your own names?
