# Digital Marketing Suite

## Why this is missing

Digital today has Conversational, Voice, Journeys, Channels, Marketplace. There is no surface for the **Marketing org** — the CMO / growth lead / lifecycle manager. Marketing is one of the biggest telco buying motions and currently invisible in the demo. Adding it lights up Cortex Agent (creative gen), Snowpark ML (lookalike, uplift), Cortex Search (competitor / review mining), and Bayesian MMM all in one section.

## Five new surfaces under `/digital/marketing/...`

| Route | Surface |
|---|---|
| `/digital/marketing` | **Campaigns Hub** — live campaigns table (audience, channel mix, holdout, Day-N conversion, ROAS, spend cap). Tile links to Funnel / Audience / Attribution / Lifecycle. |
| `/digital/marketing/funnel` | **Funnel & Attribution** — Acquisition Sankey (Awareness → Consideration → Add-to-cart → Conversion → Activation). Multi-touch attribution table (last-click vs Markov vs Shapley). ROAS per channel. **Marketing Mix Model curve with slider** that reallocates spend live. |
| `/digital/marketing/audience` | **Audience Builder** — predicate-style segment editor with **live row count via Cortex SQL** (`tenure > 6mo AND CLV > 400 AND consent.marketing = true AND last_offer_age > 12d`). **Lookalike-from-seed** (Snowpark ML on `gold.customer_embeddings`). Suppression + overlap vs active campaigns. |
| `/digital/marketing/lifecycle` | **Lifecycle & Loyalty** — trigger journeys (D0 / D7 / D30 onboarding, anniversary, lapse, winback). Loyalty mission tracker. Refer-a-friend funnel with viral coefficient. |
| `/digital/marketing/brand` | **Brand Health & Competitor Watch** — share of voice vs UK MNOs. Sentiment heat map by city / channel / brand. **Competitor pricing & ad watch** via Cortex Search over `gold.competitor_ads` + `gold.review_corpus`. "Today's threats" panel with auto-drafted counter-offers. |

## Six new scenarios — each with a "wow" moment

| ID | Title | Wow moment |
|---|---|---|
| `dig-campaign-launch-lookalike` | "5G Hero" launch · 240k lookalike | Cortex Agent **streams 6 subject lines + 3 body variants in real time** with brand-voice prompt visible. Holdout-vs-treatment uplift shown live. |
| `dig-attribution-rebalance` | Multi-touch attribution rebalance | MMM spots over-spend on paid social → reallocates £180k to retargeting + RCS → ROAS lift +0.4. **Slider** redraws curves. |
| `dig-competitor-counter` | Competitor counter-launch (24h) | Cortex Search detects competitor SIM-only price drop → **auto-generates** counter-offer + audience + creative + press-release draft for PR team. |
| `dig-winback-lapsed` | Winback wave · 18k lapsed | Propensity-scored, channel-personalised, regulator-compliant (Ofcom GC C5 vulnerability suppression). |
| `dig-anniversary-loyalty` | Birthday / anniversary surprise | Trigger-based cross-product reward (10GB boost + Disney+ trial + £5 credit) → CSAT lift. |
| `dig-refer-a-friend` | Refer-a-friend wave · 8.4k advocates | Advocate identification, viral coefficient calc, paid-channel attribution avoided. |

## Snowflake angles each surface lights up

| Surface | Snowflake |
|---|---|
| Audience Builder | Cortex SQL over `gold.customer_master` + `gold.consent_register` + `gold.engagement_features` (live count + freshness) |
| Lookalike | Snowpark ML similarity over `gold.customer_embeddings` |
| Creative | Cortex Agent + Cortex Complete generates copy variants gated by brand-voice prompt |
| Attribution | Snowpark Markov + Shapley over `gold.touchpoints` |
| MMM | Snowpark Bayesian MMM over `gold.spend_ledger` + `gold.revenue_attribution` |
| Brand health | Cortex Search over `gold.review_corpus` + `gold.competitor_ads` (with `AI_SUMMARIZE` for theme clusters) |
| Holdout uplift | Causal model over `gold.uplift_predictions` (already referenced) |

All scenarios cite these gold tables so the lineage page picks them up.

## "Coolness" multipliers (cheap, visually huge)

- **Cortex Agent generates creative LIVE in the demo** — reuse the existing `useChatPlayback` token streamer to type subject lines and body copy. Add a "regenerate" button.
- **Live MMM slider** — drag and the spend → revenue curves redraw. One numeric input, three lines redraw, big payoff.
- **Audience predicate live count** — typing in the predicate ticks the count up to "240,180 customers · computed 4 sec ago via Cortex SQL".
- **Competitor watch ticker** — "Three competitor moves to react to today" with auto-drafted counter-offers. Same Cortex Search pattern as the App-store rating scenario.
- **Holdout uplift visible** — every campaign card shows control vs treatment. Causal credibility = board credibility.

## Implementation order

1. New gold tables to [src/data/mlMeta.ts](src/data/mlMeta.ts) and lineage rows in [src/pages/Lineage.tsx](src/pages/Lineage.tsx) (`gold.touchpoints`, `gold.spend_ledger`, `gold.revenue_attribution`, `gold.review_corpus`, `gold.competitor_ads`, `gold.customer_embeddings`).
2. Build 5 new pages in `src/pages/digital/marketing/` — `Campaigns.tsx`, `Funnel.tsx`, `Audience.tsx`, `Lifecycle.tsx`, `Brand.tsx`. Same pattern as [DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx).
3. Register the 5 routes in [src/main.tsx](src/main.tsx) and add a Marketing group to the Digital sidebar in [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx).
4. Add 6 new scenarios to [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) with proper focus targets pointing into the new marketing pages.
5. Add `DIGITAL_OUTCOMES` entries in [src/pages/Briefing.tsx](src/pages/Briefing.tsx) for each new scenario.
6. Per-scenario Channel Orchestrator entries in [src/pages/digital/DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx).
7. Chatbot answers in [src/data/cicChat.ts](src/data/cicChat.ts) for the 6 new scenarios.
8. Shared `CampaignCard` component reused by Campaigns Hub + the active-scenario tile.

## Verification

- `/digital/marketing` shows the Campaigns Hub with 8 live campaigns. Each tile clicks through to Funnel / Audience / Lifecycle / Brand.
- Run all 6 new scenarios end-to-end. Each should focus to the right surface, fire ML chips on the LiveTimeline, and produce a Digital briefing with scenario-specific bars.
- Walk all 16 Digital scenarios (5 originals + 5 from last batch + 6 marketing). `tsc --noEmit` clean.

## Critical files

- [src/data/sectionScenarios.ts](src/data/sectionScenarios.ts) — 6 new scenario definitions
- [src/pages/digital/marketing/](src/pages/digital/marketing) (new) — 5 new pages
- [src/main.tsx](src/main.tsx) — 5 new routes
- [src/components/app/Sidebar.tsx](src/components/app/Sidebar.tsx) — Marketing group inside Digital
- [src/pages/Briefing.tsx](src/pages/Briefing.tsx) + [src/pages/digital/DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx) — 6 new entries each