# Digital — more visuals + AI/ML surfaces

## Context

Each Digital page has KPI tiles but few "this is the model talking" visuals. Existing primitives in [src/components/shared/Charts.tsx](src/components/shared/Charts.tsx): `BarChart`, `HBar`, `LineChart`, `Donut`, `Funnel`, `Sparkline`. Plus `EChart` for richer needs (heatmap, scatter, gauge, waterfall). The CIC scenarios already use an `MlBadge` component + scenario-keyed `mlMeta.ts` — we re-use both here.

## Per-page additions

### `/digital` Overview
- **Live ML Decisions counter** card (header): "127,420 ML decisions / hour · 94.2% drift OK · audit gold.decision_lineage" + sparkline.
- **Channel mix Donut** — share of dispatch volume by channel.
- **Intent × stage heatmap** — which intents land where in the funnel (Cortex Classifier output).

### `/digital/conversational`
- **Real-time deflection-rate gauge** (EChart gauge, target 70%).
- **Intent distribution Donut** (replaces current list).
- **Sentiment trajectory LineChart** — last 60 min, Bot vs Human escalations overlaid.
- **MlBadge**: `cortex_chat_v3.2 · deflection 0.87 · drift OK`.

### `/digital/voice`
- **AHT distribution histogram** — bins 0:30 / 1:00 / 2:00 / 4:00 / 8:00+.
- **Save-rate funnel by queue** — SAVE-MNP / SAVE-VULN / SAVE-COMPLEX with conv % at each.
- **WER + sentiment trend LineChart** — last 24h.
- **MlBadge**: `cortex_voice_v1 (Whisper-large-v3) · WER 3.4% · sentiment recovery +0.78`.

### `/digital/journeys`
- **Cohort drop-off heatmap** — journey × stage, drop-off colour intensity.
- **Drop-off recovery LineChart** — last 14d, abandoned vs recovered.
- Keep existing propensity widget.

### `/digital/channels`
- **Channel ROI scatter** — x = cost / send, y = conversion %, size = volume.
- **Cap utilisation gauges** per channel.
- **Cost waterfall** — weekly cost broken down by channel.

### `/digital/marketplace`
- **Bundle attach trend LineChart** — 12 weeks, multi-series per partner.
- **Cumulative ARPU lift** — 90d monotonic curve with annotated launches.
- **Partner contribution Donut**.

### `/digital/marketing` Campaigns Hub
- **Cumulative spend vs revenue LineChart** (last 30d).
- Per-campaign conv% mini-Sparkline inside `CampaignCard`.

### `/digital/marketing/funnel`
- **Channel ROAS scatter** — x = spend, y = ROAS, size = revenue.

### `/digital/marketing/audience`
- **Lookalike scatter** — 2-D embedding projection: seed (red) vs candidates (grey) vs threshold band.
- **Suppression Donut** — reasons removed.

### `/digital/marketing/lifecycle`
- **Trigger heatmap** — day of week × trigger type, intensity = fires per day.
- **Refer-a-friend funnel** — proper Funnel chart on top of existing tiles.

### `/digital/marketing/brand`
- **Sentiment trend LineChart** — 30d, multi-series (positive / neutral / negative).
- **Theme cluster Donut** — top 6 themes from `gold.review_corpus`.

## ML / AI hooks per page (named models)

| Page | Models surfaced |
|---|---|
| Overview | Aggregated count + drift status across all live models |
| Conversational | `cortex_chat_v3.2`, `intent_classifier_v4.1`, `vulnerability_v2.1`, `csat_predictor_v1.8` |
| Voice | `cortex_voice_v1` (Whisper), `voice_sentiment_v2`, `save_uplift_v1.4` |
| Journeys | `esim_activation_v2.1`, `travel_pattern_v1.4`, `cart_recovery_v3.0`, `fcr_likelihood_v2.0` |
| Channels | `channel_recommender_v2`, `cap_utilisation_v1` |
| Marketplace | `next_best_bundle_v1.6`, `arpu_lift_forecast_v1` |
| Marketing Hub | `creative_generator` (Cortex Agent), MMM model |
| Funnel | `markov_attribution_v1`, `shapley_attribution_v1`, `mmm_bayesian_v2` |
| Audience | `customer_lookalike_v1.6`, `consent_resolver_v1` |
| Lifecycle | `winback_propensity_v2`, `advocate_propensity_v1.0`, `loyalty_mission_v1` |
| Brand | `review_sentiment_v3` (AI_SENTIMENT), `competitor_watch` (Cortex Search), `theme_cluster_v1` (AI_SUMMARIZE) |

Each page header gets an `MlBadge` showing the primary model — name, AUC, drift, last trained, audit pointer to `gold.decision_lineage`.

## Implementation steps

1. Extend [src/data/mlMeta.ts](src/data/mlMeta.ts) with `mlByDigitalPage` (11 entries).
2. Add small `Heatmap`, `Scatter`, `Gauge`, `Waterfall` thin wrappers over EChart in [src/components/shared/Charts.tsx](src/components/shared/Charts.tsx).
3. Add chart blocks to [src/pages/digital/DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx): Overview ML counter, channel donut, intent heatmap; Conversational deflection gauge + intent donut + sentiment trajectory; Voice AHT histogram + save funnel + WER trend; Journeys cohort heatmap + recovery line; Marketplace bundle trend + cumulative ARPU + partner donut.
4. Add charts to [src/pages/digital/DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx): ROI scatter + cap utilisation + cost waterfall.
5. Add charts to [src/pages/digital/DigitalMarketing.tsx](src/pages/digital/DigitalMarketing.tsx): hub spend-vs-revenue line, funnel ROAS scatter, audience lookalike scatter, lifecycle trigger heatmap, brand sentiment trend + theme donut.
6. Add `MlBadge` to every Digital page header (driven by `mlByDigitalPage`).
7. `tsc --noEmit` clean + walk every Digital page + the 16 scenarios.

## Verification

- `/digital` shows ML-decisions counter + heatmap + channel donut.
- `/digital/conversational` deflection gauge animates idle → live; intent donut + sentiment line render.
- `/digital/voice` AHT histogram, save funnel, WER + sentiment line render.
- `/digital/journeys` cohort heatmap renders.
- `/digital/channels` ROI scatter, cap gauges, waterfall render.
- `/digital/marketplace` bundle trend, cumulative ARPU, partner donut render.
- `/digital/marketing/*` 5 new charts (one per sub-page).
- Every Digital page has an `MlBadge` in its header.
- Typecheck clean.

## Critical files

- [src/data/mlMeta.ts](src/data/mlMeta.ts) — add `mlByDigitalPage` map
- [src/pages/digital/DigitalOverview.tsx](src/pages/digital/DigitalOverview.tsx) — bulk of new charts (5 sub-pages here)
- [src/pages/digital/DigitalChannels.tsx](src/pages/digital/DigitalChannels.tsx) — ROI scatter + cap utilisation + waterfall
- [src/pages/digital/DigitalMarketing.tsx](src/pages/digital/DigitalMarketing.tsx) — 5 new marketing-sub-page charts
- [src/components/shared/Charts.tsx](src/components/shared/Charts.tsx) — Heatmap / Scatter / Gauge / Waterfall thin wrappers