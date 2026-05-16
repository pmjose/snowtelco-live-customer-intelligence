# VodafoneThree Customer Intelligence Command Center
## 10-Minute Demo Script (v2)

**Total runtime:** ~10:00
**Pace:** ~140 wpm
**Audience:** VodafoneThree executive, commercial, network operations, and customer experience stakeholders
**Pre-flight checklist:**

- Browser at `http://localhost:5173/` (or the Netlify URL)
- Sound on or off (your call — `M` toggles)
- Narrator overlay on (it auto-prompts each line) — `N` toggles
- Scenario set to **Manchester M14 — Network degradation**
- Demo state at `normal` (press `R` to reset)
- One window, no other tabs visible

---

## [0:00 – 0:45] OPEN — Landing page

**Where:** `/` (landing page)

> "Good morning. What you're about to see is the **VodafoneThree Customer Intelligence Command Center** — an internal operations system used by Care, Marketing, Network Operations, and the Executive team. It is a live simulation of how VodafoneThree can use Snowflake-native data and AI to detect churn, generate the next best action, and proactively resolve service issues before customers leave.
>
> Let me set the scale. Across the top: **~29 million UK customers**, **£11 billion** of network investment, **99% 5G Standalone** by 2030, **99.96% by 2034**, **16,500 square kilometres** of 4G not-spots being removed, and **8,000 sites** delivered in year one of the network integration plan.
>
> Underneath that data foundation, six capabilities: Churn Intelligence, Next Best Offer, Proactive Issue Resolution, Customer 360, Network Experience, and Executive Insights. One platform, five customer brands — Vodafone, Three, SMARTY, VOXI, and Talkmobile — all on a single identity-resolved Customer 360.
>
> What you won't see here is a generic telecom dashboard. What you will see is a **VodafoneThree-specific operations command center**, built for the moments that matter — churn, network incidents, retention conversations, and executive decisions.
>
> Let me show you what live operations look like."

**Action:** Click **Launch Command Center**.

---

## [0:45 – 1:30] FRAME — Command Center layout & navigation

**Where:** `/command-center`

> "This is the live Command Center. Let me orient you quickly.
>
> The **left sidebar** is how the team moves through the platform. Operations, Decisioning, Analytics, Architecture — and at the bottom, the red **Ask CIC** button, our Cortex AI assistant. I'll come back to all of these.
>
> Inside the main view: **at-risk customers** on the left, **UK network map** in the middle, **Customer 360** on the right with the **live event stream** beneath it, and a **timeline** running across the bottom.
>
> At the very top of the sidebar: a **scenario picker**. Manchester, Bristol, Birmingham, London. The same engine, four different stories — proves this is a platform, not one demo. Today I'll run **Manchester** because it's the richest end-to-end story.
>
> One more orientation point: the **bottom-left card** is a **presenter narrator** that updates with the operations script as we move through stages. So even if you couldn't hear me, you'd see what the system is doing."

**Action:** Press **Play** in Demo Controls (top right) — or just press `Space`.

---

## [1:30 – 2:30] STAGE 1–2 — Incident detected → Customers impacted

**Stage:** `incident_detected` → `customers_impacted`

> "Network telemetry has just flagged an anomaly in **Manchester M14**. Notice three things at once:
>
> First, the **map** — the incident radius is pulsing red around Manchester, and you can see the cell-site markers updating.
>
> Second, the **toast notification** in the top-right confirming the alert.
>
> Third, the **narrator** has automatically advanced to the operations script for this stage.
>
> Within seconds, the system tells us the impact: **2,417 customers** affected across **7 cell sites**. Average download speed has dropped from **118 Mbps to 34 Mbps**, dropped calls are up **37%**, failed data sessions up **42%**. Of those impacted: **312 are high-value customers** and **89 are P1 churn-risk**.
>
> This is the moment in a traditional operator where complaint volume starts spiking. Care queues fill up. Twitter lights up. Here, we already know who's affected, and we haven't waited for a single customer to call.
>
> Look at the KPI strip at the top — every tile has a **sparkline** showing the last 24 hours of that metric. Impacted customers, P1 risk, high-value exposure, network experience score — you can see exactly when things broke and how fast they're escalating.
>
> Below the Customer 360 panel, the **Live Event Stream**. This is the operations team's working view — every CDR ingest, every care contact, every model run, every approval, time-stamped. If you click into Event Stream from the sidebar, you get a full-screen feed with category filters: Network, Care, Billing, CDR, Decisioning, Activation."

---

## [2:30 – 3:45] STAGE 3–4 — Churn scored → Customer selected

**Stage:** `churn_scored` → `customer_selected`

> "The churn impact model has now re-scored every affected customer. You can see the at-risk list re-sorting in real time. **Amelia Hughes** rises to the top — her risk has jumped from **42% to 82%** in the last 14 days.
>
> Amelia is on **Three**, **high value**, **Manchester M14**, contract ends in **21 days**. The Customer 360 panel has automatically opened on the right — six tabs: Overview, Churn, Network, Care, Usage & Billing, Offers.
>
> Look at the **Churn tab**. There's a churn risk gauge, the 30/60/90-day probability cards, and a 12-week trend showing risk creeping up gradually before jumping today.
>
> But the headline analytical moment is the **Why is this customer at risk?** panel. Five drivers, every one with evidence, every one signal-typed:
>
> - **Contract ending in 21 days** — 24 points contribution, signal type: Commercial
> - **Network experience degradation** — 21 points, with 12 dropped calls and 7 failed data sessions in the last 14 days, signal type: Network
> - **Open complaint, unresolved 5 days, SLA breach predicted** — 17 points, signal type: Care
> - **Competitor SIM-only offer £6/month below current plan** — 11 points, signal type: Market
> - **Bill shock, latest bill 28% above three-month average due to roaming overage** — 9 points, signal type: Billing
>
> This isn't a generic AI score. Every contribution is **explainable**, every signal is **traceable**. Model version is on the card — `CHURN_MODEL_UK_MOBILE_V3.2`. Last scored two minutes ago. Confidence 87%.
>
> And every churn driver here maps back to a real gold table and column in Snowflake — I'll show you that in the **Decision Lineage** page in a moment."

---

## [3:45 – 5:15] STAGE 5–6 — Offer generated + retention message preview + suppression

**Stage:** `offer_generated`

> "Now decisioning takes over. Watch the Next Best Action panel.
>
> Eligibility is checked. Propensity is scored. Margin is verified. Treatment uplift is calculated...
>
> ...and we have a **ranked recommendation**.
>
> The headline action: **'Proactive apology + £5 loyalty credit + network issue update + unlimited 5G retention plan.'** **64% acceptance probability**. Projected **41-point** churn risk reduction.
>
> Below it: a converged Mobile + Home Broadband bundle review at 51% acceptance. And a handset upgrade eligibility check at 38%.
>
> Now — and this is what's new and powerful — scroll down. The **Activation Preview**.
>
> This is **exactly the SMS, in-app push, and email** Amelia would receive. Personalised with her name, location, and brand. Branded properly. Signed off correctly. With opt-out language. Activation isn't an abstraction — it's ready to send.
>
> And critically, the **decisioning checks** are visible in the panel:
>
> - Consent eligible — Yes
> - Recent offer fatigue — None
> - Margin floor — Above
> - Open complaint — Yes, **resolve before any commercial offer fires**
>
> That last point matters. The system is telling us: 'Send the apology, send the service credit, but hold the commercial offer until the care issue is closed.' That is built-in governance — the platform won't let you make a commercial offer to a customer with an open complaint, no matter how juicy the propensity score.
>
> Let me show you suppression in action. If I click on **Owen Brennan** in the at-risk list..."

**Action:** Click `CUST-006` / Owen Brennan in the at-risk list.

> "...you'll see Owen is **suppressed**. The reason is right there: 'Customer received retention offer within last 14 days.' Offer fatigue protection is automatic. No agent override needed. No marketing accident possible.
>
> Back to Amelia."

**Action:** Click `CUST-001` / Amelia.

---

## [5:15 – 6:15] APPROVAL WORKFLOW — How a campaign actually goes out

**Where:** Sidebar → **Approval Workflow**

> "Every commercial offer flows through a four-step gate before it reaches a customer. Let me show you that explicitly."

**Action:** Click sidebar → **Approval Workflow**.

> "**Marketing review** — done at 09:43.
>
> **Compliance check** — consent and margin floor — done at 09:44.
>
> **Legal review** — currently active.
>
> **Activation send** — pending.
>
> Every approval is timestamped, every approver is named, every step is audit-logged in Snowflake. If a regulator asks, 'Who approved this campaign? When? On what basis?', the answer is one query. This is what governed activation looks like.
>
> Underneath, the **approval principles** are spelled out: consent-aware activation, margin floor, offer fatigue, open-complaint hold, full audit trail. Nothing about this is opaque or off-the-books."

**Action:** Press `R` to reset, or use back arrow to return to Command Center.

---

## [6:15 – 7:15] STAGE 7–8 — Outreach → Risk reduced + Self-healing

**Stage:** `outreach_triggered` → `risk_reduced`

**Action:** Resume the demo with `Space` (or it's already at risk_reduced).

> "Outreach is now triggered — proactive SMS and app notification dispatched, care callback scheduled, network ticket escalated to RAN. The 89 P1 customers each got the same playbook in parallel.
>
> And here's the outcome — Amelia's **projected churn risk has dropped from 82% to 41%**. The KPI strip has updated. The timeline shows action in progress.
>
> Now let me show you something powerful for the Network Operations team. Sidebar → **Network Map**."

**Action:** Sidebar → **Network Map**, click **Play resolution**.

> "This is the full-screen network map with **self-healing playback**. Click 'Play resolution' and you'll see the incident radius **shrinking** in real time as the seven cell sites recover one by one — green dots replacing red. The MTTR counter ticks down from 12 minutes. Customers cleared.
>
> Three map tones at the top — OSM, light, dark — for different ops centre environments. Network operators tend to like the dark mode."

**Action:** Press `T` to switch to dark Network-Ops theme briefly to show, then `T` again.

---

## [7:15 – 8:00] ASK CIC — Conversational analytics with Cortex AI

**Action:** Press `?` to open the Ask CIC drawer.

> "Every executive expects to ask questions in natural language. Here's **Ask CIC**, powered by **Snowflake Cortex AI** over the same governed semantic layer that powers everything else you've seen.
>
> Suggested prompts at the top. Let me click 'What happens if we do nothing?'..."

**Action:** Click suggested prompt **"What happens if we do nothing?"**

> "Streaming response, like any modern AI assistant. The answer:
>
> - **51 expected churners** in the next 90 days
> - **£163,000 in lost CLV**
> - **+1,840 incoming care contacts** that won't happen if we act now
> - **NPS impact: -3 points** across the Manchester base
>
> Acting now reduces that to **22 churners** and protects **£93,640** of CLV.
>
> And the most important part — every answer comes with **citation chips**. `gold.churn_features`, `gold.uplift_predictions`, `gold.executive_kpi_marts`. The user can verify exactly which governed tables produced the answer. This is the difference between a hallucinating chatbot and a governed Cortex AI agent.
>
> Try another. 'Why is Amelia at risk?' — same five drivers, same evidence, written in plain English. 'Which segment has the worst churn?' — SMARTY at 15.7%, then VOXI at 13.2%."

**Action:** Close chat with `?` or X.

---

## [8:00 – 9:00] EXECUTIVE INSIGHTS + COUNTERFACTUAL + BRIEFING

**Where:** Sidebar → **Executive Insights**

> "Now zoom out for the executive view."

**Action:** Sidebar → **Executive Insights**.

> "Risk distribution across the entire customer base. Churn by segment. Risk by driver. Revenue at risk — MRR, 90-day exposure, CLV, high-value segment exposure. Network quality trend. Incident impact by city.
>
> Every chart has a **last-updated** badge — these would refresh in near-real-time in production.
>
> The most important toggle on this page is at the top: **'Showing: With actions' / 'Showing: Do nothing'**."

**Action:** Click the toggle to switch to "Do nothing".

> "**Counterfactual mode.** This is what the cohort looks like if we don't act. **51 churners. £163,400 CLV lost. +1,840 contacts into care. -3 NPS.** That is the cost of inaction.
>
> Toggle back. **22 churners. £93,640 protected.**
>
> That number — £163,000 saved on a single Manchester incident — is the line that closes the business case. Times that by the number of similar incidents per quarter, and you have the value of this platform.
>
> One more thing for the board. Sidebar → **Briefing Export**."

**Action:** Sidebar → **Briefing Export**.

> "Print-styled, one-page executive briefing. Situation, action taken, top 5 P1 customers, projected outcomes, next steps. **Print to PDF**, attach to the board pack, done."

---

## [9:00 – 9:45] ARCHITECTURE & LINEAGE — Production blueprint

**Action:** Sidebar → **Snowflake Blueprint**.

> "The browser demo uses hardcoded data. This is how it would run in production on **Snowflake**.
>
> Sources on the left — CRM, billing, CDRs, RAN telemetry, care, app events, consent, competitor benchmarks. **Snowpipe Streaming** and the **Kafka connector** land them. **Bronze, Silver, Gold** medallion layers, with identity resolution unifying Vodafone, Three, SMARTY, VOXI, Talkmobile into a single Customer 360.
>
> **Dynamic Tables, Streams, Tasks, Snowpark** for the feature pipelines. **Snowpark ML** for churn, propensity, CLV, network impact, and treatment uplift models. **Cortex AI** powers Ask CIC. Activation lights up the Command Center, agent desktop, contact-centre routing, SMS, push, app personalization, and NOC.
>
> **Cross-cutting governance** — masking, row access, tagging, lineage, access history, consent-aware activation. **Cross-cutting observability** — pipeline health, model drift, cost, SLA.
>
> Snowflake isn't just the database here. It's the governed data cloud, the feature pipeline, the ML environment, the decisioning layer, and the activation layer — in one place."

**Action:** Sidebar → **Decision Lineage**.

> "And to close the loop on explainability — **Decision Lineage**. Every churn driver Amelia just saw is mapped back to the exact gold table and column that produced it, with the upstream silver and bronze tables behind it. `gold.network_experience_score` traces back to `silver.cdr_aggregates` and `silver.ran_telemetry`, which trace back to `bronze.cdr_raw` and `bronze.ran_raw`. Every prediction is reproducible. Every score is auditable. Every regulator's question has a one-query answer."

---

## [9:45 – 10:00] CLOSE

> "So three executive questions, three answers:
>
> **One — which customers are at risk and why.** We just saw Amelia, fully explained, in seconds, with five drivers and traceable evidence.
>
> **Two — what's the best action for each one.** Ranked, eligibility-checked, consent-aware, margin-respecting, with the actual SMS, push, and email ready to send.
>
> **Three — can VodafoneThree detect and resolve service issues before they become churn.** Yes — Manchester M14 to projected risk reduction in under fifteen minutes, with no customer needing to pick up a phone, and £163,000 of CLV protected on this single incident alone.
>
> That's the Customer Intelligence Command Center on Snowflake. Happy to take questions."

---

## Presenter cue card

| Time | Stage / Page | Click / Key |
|---|---|---|
| 0:00 | Landing | Launch Command Center |
| 1:30 | Play scenario | `Space` |
| 5:15 | Suppression demo | Click Owen → back to Amelia |
| 6:15 | Approvals | Sidebar → Approval Workflow |
| 7:15 | Self-healing | Sidebar → Network Map → Play resolution |
| 8:00 | Chat | `?` → "What happens if we do nothing?" |
| 8:45 | Counterfactual | Sidebar → Executive Insights → toggle |
| 9:00 | Briefing | Sidebar → Briefing Export |
| 9:15 | Architecture | Sidebar → Snowflake Blueprint |
| 9:30 | Lineage | Sidebar → Decision Lineage |
| 9:45 | Close | Stay on Lineage or Architecture |

## Optional 60-second extensions (if Q&A allows)

- **Compare customers**: Sidebar → At-Risk Customers → tag two customers with **+ Compare** → sidebar → Compare Customers → radar + side-by-side table.
- **Treatment uplift**: Sidebar → Treatment Uplift → quadrant chart of persuadables / sure things / lost causes / do-not-disturbs. Selected customer is highlighted.
- **Scenario swap**: Top of sidebar → switch to **Bristol — Bill-shock wave** or **Birmingham — SMARTY price competition**. Same engine, new story.
- **Settings**: Sidebar → Settings → keyboard shortcut cheat-sheet, theme, sounds, narrator.
