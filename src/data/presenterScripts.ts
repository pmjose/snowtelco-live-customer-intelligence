// Presenter teleprompter beats for each NOC scenario.
// Keyed by incidentId. Each script has:
// - intro: shown when scenario starts (T+0 → T+6s)
// - beatsByStage: line keyed by NocStage as the agent advances
// - domainNotes: line shown when the user switches to a given domain mid-run
// - closing: shown after `resolve` event fires

export type NocStageKey = 'idle' | 'detect' | 'observe' | 'hypothesize' | 'plan' | 'act' | 'verify' | 'resolved';
export type DomainKey = 'cic' | 'digital' | 'bss' | 'oss' | 'noc';

export interface PresenterScript {
  intro: string;
  beatsByStage: Partial<Record<NocStageKey, string>>;
  domainNotes: Partial<Record<DomainKey, string>>;
  closing: string;
}

export const presenterScripts: Record<string, PresenterScript> = {
  // ── CIC: Manchester churn save · Amelia Hughes ────────────────────────────
  'cic-manchester-churn': {
    intro:
      'We are looking at Manchester M14 — a residential cluster in south Manchester. Right now, seven cells have degraded backhaul, and the platform has already identified 2,417 customers presenting at those cells. Of those, 89 are Priority-1 churn risks with a combined CLV of over four hundred thousand pounds. The agent is going to move from detection to a fully personalised save in under seven minutes — with consent, eligibility and audit handled end-to-end. Let me walk you through each stage.',
    beatsByStage: {
      detect: 'The network layer — Snowpipe Streaming RAN counters feeding Dynamic Tables — has flagged Manchester M14: seven cells, sustained PRB congestion, 2,417 affected customers. This is not seven separate alarms — the agent has correlated scheduler delay, GTP-U drops and signal quality into a single root-cause event. That correlation alone would take a human NOC engineer 15–20 minutes; the agent did it in sub-second.',
      observe: 'Snowpark ML CHURN_MODEL_UK_MOBILE_V3.2 just re-scored the entire 2,417-customer cohort in real time. Out of that cohort, 312 are high-CLV and 89 hit the P1 threshold — churn probability above 70 percent, CLV above two thousand pounds. The model is trained on 24 months of charging, tenure, complaint and network-quality signals, all sitting in the Snowflake gold layer. No data left the platform.',
      hypothesize: 'Meet Amelia Hughes — customer CUST-001. Her churn risk just jumped from 42 percent to 82 percent. Why? She is 14 months into an 18-month contract, filed a coverage complaint six weeks ago, and is now sitting on degraded cells at home. The model has ranked her as the primary candidate. This is not a batch campaign — this is a real-time, individual-level decision grounded in explainable features.',
      plan: 'The agent ranks all 89 P1 customers by CLV multiplied by risk-reduction potential. The next-best-action for Amelia: a five-pound service credit plus a 10 GB data boost plus a plan-refresh offer. Before any of that fires, the platform checks consent state, margin floor, offer-fatigue window — she has not been contacted in 12 days — and confirms no open complaint that would contradict outreach. Every gate is auditable in gold.decision_lineage.',
      act: 'Execution: Salesforce Service Cloud receives playbook PB-RT-CRED-005. Eighty-nine personalised retention plays dispatched — 76 acknowledged within 90 seconds via app push. Sinch SMS as a fallback channel. Amelia accepted the five-pound credit and 10 GB boost through the app. The offer was posted to Amdocs CES on her next bill. The entire handoff — from Snowflake decision to CRM execution — took 4 seconds.',
      verify: 'Five-minute verification window. The cohort average risk dropped from 79 percent to 47 percent. The auto-rollback policy was NOT triggered — that would have fired if risk stayed above 65 percent after intervention. This is continuous closed-loop monitoring, not fire-and-forget. The executive briefing has already been drafted by the narrator agent and filed in Snowflake.',
      resolved: 'Save complete. Eighty-nine P1 customers contacted within policy. Projected churn reduction: minus 34 percentage points across the cohort. CLV protected: approximately four hundred and twenty thousand pounds. Time from first detection to resolution: seven minutes and twelve seconds. The full decision lineage — model version, feature vector, confidence score, channel, outcome — is preserved in gold.decision_lineage with Time Travel for regulator replay.',
    },
    domainNotes: {
      cic: 'This is the CIC command centre — the single pane of glass where cohort signals, churn models and next-best-actions converge. Everything you see here is powered by Dynamic Tables refreshing from Snowpipe Streaming network events.',
      digital: 'Switching to Digital: the same decision is executed across app push, SMS and web personalisation with consistent eligibility. Cortex Complete generates localised copy; consent and frequency caps are enforced before any channel fires.',
      bss: 'BSS view: the five-pound credit is posted via Amdocs CES, reconciled to GL automatically. If Ofcom auto-compensation thresholds were triggered, that would appear here too — in this case they were not.',
      oss: 'OSS view: the network degradation event that triggered this entire flow originated in the RAN layer. The ServiceNow change for the backhaul fix is managed here — CIC owns the customer, OSS owns the fix.',
      noc: 'NOC view: if this were a full P1 outage, the NOC bridge would own the technical restoration while CIC owns the customer outcome. In this case the degradation did not cross the outage threshold, so CIC led autonomously.',
    },
    closing: 'Seven minutes. Eighty-nine customers retained. Four hundred and twenty thousand pounds of CLV protected. Every decision auditable, every action within consent, every outcome measured. That is what an autonomous customer-intelligence platform delivers — not a dashboard, not a batch campaign — a closed-loop system that acts in the moment the customer needs it.',
  },

  // ── CIC: Roaming bill-shock wave · Daniel Shah ─────────────────────────────
  'cic-birmingham-billshock': {
    intro:
      'This is a different kind of signal — not network, not regional. Post-Easter, 1,840 customers flew non-EU without a Roaming Pass. Their bills are now 25 percent or more above baseline. The agent detected this cohort before a single customer called to complain. We are going to watch it defuse a bill-shock wave across a national behavioural cohort in under four minutes.',
    beatsByStage: {
      detect: 'The billing anomaly detector flagged 1,840 customers with usage two-times above their baseline during Easter week. These are all non-EU travellers who did not enrol in a Roaming Pass before departure. This is a behavioural pattern — not geographic, not tied to a single cell — which is why traditional NOC monitoring would never catch it.',
      observe: 'The platform segmented the cohort: 244 are high-CLV, 71 are Priority-1 churn risks. The model confirms these are price-sensitive customers who simply forgot to activate their Roaming Pass — not customers who consciously chose to pay per-megabyte.',
      hypothesize: 'Daniel Shah — CUST-002 — is our representative example. His churn score jumped from 54 percent to 76 percent. He is a 36-month tenure customer on an Unlimited plan, travels quarterly for work. He has never experienced bill-shock before. This one event could lose him.',
      plan: 'The next-best-action: a personalised bill-explanation video, a four-pound goodwill credit, and automatic Roaming Pass enrolment for his next trip. The goodwill policy permits up to three credits per 12 months — Daniel has used one, so he is eligible. Margin floor is preserved because the Roaming Pass generates revenue going forward.',
      act: 'Salesforce Service Cloud plus Genesys Cloud queued outbound retention calls for the 244 high-CLV customers. For the broader 1,840, Sinch SMS delivers the bill explanation and Amdocs CES auto-enrols them in the Roaming Pass. Daniel received his explanation, reviewed the video, and enrolled — all in-app.',
      verify: 'The cohort has been re-scored: average churn risk dropped from 71 percent to 48 percent. All 1,840 are now enrolled in the Roaming Pass, which means the next time they travel, this will not happen again. Projected churn reduction: minus 23 percentage points.',
      resolved: 'Bill-shock wave defused. Two hundred and forty-four high-CLV customers personally reached. CLV saved: approximately one hundred and eighty thousand pounds. And critically — zero customers needed to call in to trigger this. The platform moved first.',
    },
    domainNotes: {
      cic: 'CIC detected a behavioural cohort, not a network fault. This demonstrates the platform working on commercial signals — usage patterns, billing anomalies — not just infrastructure alarms.',
      digital: 'Digital view: the bill-explanation video was personalised per customer using Cortex Complete. Channel selection — video vs SMS vs email — was optimised per customer preference history.',
      bss: 'BSS view: the four-pound goodwill credit flows through Amdocs CES, reconciled to GL. The Roaming Pass auto-enrolment is a subscription event — provisioned and billable from the next trip.',
      oss: 'OSS view: no network action required. This is pure commercial intelligence — the trigger was billing data, not a fault alarm.',
      noc: 'NOC view: no involvement. This scenario demonstrates CIC operating independently of network incidents.',
    },
    closing: 'The most dangerous churn driver in telco is the one the customer never tells you about. Bill-shock after a holiday — they just switch when the contract ends. This platform caught 1,840 of them before a single one called in, and turned a retention risk into a revenue-positive enrolment.',
  },

  // ── CIC: Competitor tariff PAC spike · Grace Williams ──────────────────────
  'cic-leeds-snowflex': {
    intro:
      'A competitor launched a new SIM-only tariff mid-month — nationally. Within seven days, PAC-request volume spiked 340 percent across our SnowFlex price-sensitive cohort. This is not a regional issue — it is a market response. The agent is going to identify who is actually at risk, rank them, and deliver a personalised counter-offer before the PAC completes.',
    beatsByStage: {
      detect: 'PAC-request volume up 340 percent in seven days. The cohort is not geographic — it is behavioural: SnowFlex SIM-only customers, price-sensitive segment, typically under 30, tenure 6 to 18 months. Cortex Search identified the competitor tariff change that matches this signal pattern.',
      observe: 'Nine hundred and forty active PAC requests in the cohort. Twenty-eight high-CLV, 38 Priority-1 churn risks. The model has cross-referenced usage patterns with the competitor offer — these customers can get comparable data at two pounds less per month.',
      hypothesize: 'Grace Williams — CUST-005 — scored 69 percent churn propensity. Typical profile: 22 years old, SIM-only, heavy social media usage, compares tariffs quarterly. Her PAC was requested three days ago — we have 27 days before it activates.',
      plan: 'The next-best-action: an extra 30 GB at the same price point plus a six-month loyalty boost. Margin floor check: the offer ROI is 2.4 times over 12-month CLV uplift, pre-approved automatically. No human sign-off needed — within policy.',
      act: 'Salesforce Service Cloud fired an in-app retention modal for the 28 high-CLV customers, plus email follow-up. Grace saw the modal, declined to continue her PAC, and accepted the 30 GB boost. The entire interaction took 90 seconds in-app.',
      verify: 'PAC spike absorbed. Four hundred and twelve of 940 retained — a 44 percent save rate versus a 28 percent baseline. That is 16 percentage points of incremental retention from a single automated response.',
      resolved: 'Save campaign complete. Four hundred and twelve customers retained. CLV protected: approximately ninety-four thousand pounds. And the entire response — from competitor detection to in-app offer — happened without a single marketing manager touching a campaign builder.',
    },
    domainNotes: {
      cic: 'CIC detected a competitive market signal using Cortex Search on public pricing data, correlated it with internal PAC volume, and triggered a save campaign — all autonomously.',
      digital: 'Digital executed the retention modal and email. Channel choice was personalised: in-app for high-engagement customers, SMS for those with low app usage.',
      bss: 'BSS view: the loyalty boost is posted as a tariff modifier in Amdocs CES. Revenue impact: minus two pounds ARPU but plus twelve months expected tenure — net positive.',
      oss: 'OSS view: no network action. This is a pure commercial counter-response.',
      noc: 'NOC view: no involvement.',
    },
    closing: 'In traditional telco, a competitor tariff launch triggers a three-week marketing war-room, a campaign brief, creative approval, and a batch send two weeks later — by which time the PACs have already ported. This platform responded in hours, not weeks, and saved 412 customers at a positive ROI.',
  },

  // ── CIC: London 5G SA upgrade · Ravi Patel ────────────────────────────────
  'cic-london-5g-upgrade': {
    intro:
      'London E14 — Canary Wharf and Docklands — just went live on 5G Standalone. Twenty-four cells are now active. The platform has already scored 1.4 million London customers for upgrade propensity and identified 12,400 who are sitting on 5G-capable handsets but paying for a legacy 4G plan. This is a revenue-growth scenario — not retention. Watch the agent surface an upgrade cohort and deliver personalised offers at scale.',
    beatsByStage: {
      detect: '5G SA coverage is now live in London E14 — 24 cells active. This is an event the network layer published to the platform. Rather than waiting for marketing to notice, the agent immediately triggered a propensity scoring run across the London customer base.',
      observe: 'Snowpark ML upgrade-propensity model scored 1.4 million London customers. Top cohort: 12,400 with 5G-capable handsets currently on legacy plans. Three hundred and twenty are high-CLV. These customers are already carrying the hardware — they just need the plan to unlock it.',
      hypothesize: 'Ravi Patel — CUST-004 — scored 0.78 propensity. He is a heavy data user, carries an iPhone 15 Pro, and his contract window is open. The model predicts he would generate an additional twelve pounds per month in ARPU on a 5G SA Unlimited Max plan.',
      plan: 'The next-best-action: 5G SA Unlimited Max with a five-pound first-month credit to incentivise the switch. Eligibility confirmed — contract window is open, no offer fatigue, margin floor holds at the higher ARPU. For the 320 high-CLV customers, an outbound Genesys retention call is added.',
      act: 'Salesforce Marketing Cloud dispatched the upgrade journey across three channels — in-app, push notification, and email — to all 12,400. The 320 high-CLV customers also received an outbound call with the credit pre-applied. Ravi upgraded in-app in four minutes.',
      verify: 'Day-one results: 1,420 upgraded — an 11.4 percent conversion rate. ARPU lift: fifteen thousand pounds per month in run-rate revenue. And we are only on day one — the drip journey continues over 14 days.',
      resolved: '5G upgrade wave seeded. Twelve thousand four hundred customers reached. ARPU lift forecast: one hundred and eighty thousand pounds per year. This is what proactive revenue growth looks like — the network publishes a capability, and the platform instantly monetises it.',
    },
    domainNotes: {
      cic: 'CIC turned a network-capability event into a revenue-growth campaign in seconds. No marketing brief, no creative approval cycle — the agent owns the entire flow.',
      digital: 'Digital executed the multi-channel journey. Channel mix was personalised based on each customer\'s historical engagement: push-first for high-engagement, email-first for low.',
      bss: 'BSS view: the plan change is a subscription event in Amdocs CES. Pro-rata credit calculated, new plan activated from day-plus-one, all reconciled automatically.',
      oss: 'OSS view: the 5G SA coverage event originated here. Once provisioned, OSS publishes the capability to the platform for CIC to act on.',
      noc: 'NOC view: no incident. This scenario shows the platform in growth mode, not firefighting mode.',
    },
    closing: 'Most operators take six to eight weeks to launch an upgrade campaign after new coverage goes live. This platform did it in seconds. Twelve thousand four hundred customers reached on day one, with forecast ARPU uplift of one hundred and eighty thousand pounds per year. That is the difference between a reactive campaign org and an autonomous commercial engine.',
  },

  // ── CIC: 999 / 112 reachability sweep ─────────────────────────────────────
  'cic-999-reachability': {
    intro:
      'This is a regulatory scenario — and arguably the most important one we run. After a major IMS core incident, Ofcom General Condition A3 requires us to verify 999 and 112 reachability across every affected subscriber within 30 minutes. We are talking about 1.42 million IMS-attached customers. The agent is going to sweep them, identify 184 failures, and ensure human callbacks reach every one within 60 minutes. This is the scenario where getting it wrong means a fine, front-page news, and potential loss of licence.',
    beatsByStage: {
      detect: 'The NOC has just closed a P-CSCF P1 incident — VoLTE registration storm. GC A3 requires a reachability sweep within 30 minutes of service restoration. The agent has already begun — it did not wait for a human to trigger it.',
      observe: 'The cohort: 1.42 million IMS-attached subscribers who were active during the incident window. The platform joined this against the vulnerable customer register and B2B critical-line contracts — NHS direct lines, courts, schools. Four hundred and twelve vulnerable customers and 184 B2B critical-line contracts are flagged as high-priority.',
      hypothesize: 'Silent SMS probes plus IMS REGISTER tests are running. 99.7 percent passed. One hundred and eighty-four failed — meaning we cannot confirm those handsets can reach 999. For a regulator, that is 184 customers who might not be able to call an ambulance. The agent is fanning out to resolve every one.',
      plan: 'Human callback for all 184 failures — no automation, no bot, a real person confirming the customer can make and receive calls. The GC A3 30-day report is being auto-drafted by Cortex Complete. NIS2 preliminary notification is being prepared in parallel — this incident crossed the one-million-user threshold.',
      act: 'Genesys outbound queue: 184 calls assigned to trained agents with a 60-minute completion target. Every call is answered or voicemail-logged with a callback retry. Simultaneously, the GC A3 report is counter-signed by the Ofcom liaison desk and queued for submission.',
      verify: 'All 184 reachability failures resolved. Zero customer-visible 999 failures confirmed. The GC A3 30-day report is queued for filing. NIS2 notification will follow at the six-hour mark. This is full regulatory compliance, delivered autonomously.',
      resolved: 'Sweep complete. 1.42 million subscribers confirmed reachable. Zero GC A3 breaches. NIS2 report filed at plus-six hours. The entire process — from incident closure to full regulatory compliance — ran with zero manual intervention on the decision logic. Only the human callbacks and the liaison sign-off required people.',
    },
    domainNotes: {
      cic: 'CIC owns the customer-reachability verification. The vulnerable register and B2B critical-line flags determine priority order — not geography, not random sampling.',
      digital: 'Digital view: no commercial outreach during a reachability sweep. All marketing suppressed until sweep completes — Ofcom expects zero distraction.',
      bss: 'BSS view: no billing action. This is pure regulatory compliance. Cost is absorbed as a duty-of-care obligation.',
      oss: 'OSS view: the IMS restoration that triggered this sweep was managed in OSS/NOC. The technical fix is done — CIC is now verifying the customer outcome.',
      noc: 'NOC view: the P1 is closed from a technical perspective. CIC is now running the post-incident customer-assurance layer.',
    },
    closing: 'If your regulator asks how you verify 999 reachability after a major incident, the answer needs to be better than "we check the alarms." This platform swept 1.42 million subscribers, identified 184 at-risk handsets, and had a human confirm every one — inside 60 minutes. That is regulator-grade assurance, not monitoring.',
  },

  // ── CIC: High-CLV silent churn ────────────────────────────────────────────
  'cic-silent-churn': {
    intro:
      'This is the most expensive churn signal in telco — and it is invisible to traditional systems. One thousand four hundred and twenty high-CLV customers, all above sixty pounds ARPU, all above 24-month tenure, zero complaints filed. They are not angry — they are disengaging. App sessions down 42 percent. Data usage down 24 percent. Disney Plus unwatched. They are leaving quietly, and they are worth 2.6 million pounds in CLV. The agent caught them before a single MAC request.',
    beatsByStage: {
      detect: '1,420 high-CLV customers flagged by the propensity model — churn scores drifted up 28 percentage points in the last 30 days. The critical signal: zero complaints. These customers are not telling us they are unhappy. They are simply using us less.',
      observe: 'The behavioural fingerprint: app sessions down 42 percent, CDR data down 24 percent, content bundles unwatched. These are all silent disengagement signals. No network fault, no billing issue, no complaint. Just a customer slowly switching their primary device to a competitor SIM.',
      hypothesize: 'Hannah Bennett — CUST-003 — re-scored from 22 percent to 78 percent. Her primary driver: disengagement with her current bundle. She has not opened the app in 18 days, her data usage is a third of her allowance, and her contract ends in 44 days. She is the perfect candidate for a pre-MAC save.',
      plan: 'The next-best-action: a bundle refresh proposal plus a twenty-pound first-month credit plus a concierge call. This is not a reactive retention play — this is pre-emptive. She has not asked to leave. We are reaching out before she decides to. The key: the offer is a refresh, not a discount. We are adding value, not cutting price.',
      act: 'Salesforce plus Genesys: proactive outbound for the top 412 highest-risk customers. In-app personalised offer for the remaining 1,008. Hannah received the concierge call, reviewed the bundle refresh, and accepted. ARPU drops four pounds, but tenure extends 12 months — net CLV gain of six hundred and forty pounds.',
      verify: 'The 412 reached: 38 percent accepted. Projected churn save: minus 18 percentage points. CLV protected: approximately 1.4 million pounds. The remaining 1,008 will be monitored weekly with retraining.',
      resolved: 'Silent-churn save complete. 1,420 monitored. 412 reached. 157 accepted. 1.4 million pounds protected. And not a single one of those customers ever told us they were thinking of leaving. The platform saw the signal before the customer made the decision.',
    },
    domainNotes: {
      cic: 'CIC surfaced a disengagement signal from first-party behavioural data — app usage, CDR, content consumption. No NPS survey, no complaint — pure data inference.',
      digital: 'Digital delivered the concierge call and in-app refresh offer. The tone is proactive-positive, not reactive-rescue. These customers do not know they are at risk.',
      bss: 'BSS view: the bundle refresh is a plan change in Amdocs CES. ARPU goes down four pounds but lifetime value goes up because tenure extends.',
      oss: 'OSS view: no network trigger. This is behavioural intelligence — the signal came from usage patterns, not infrastructure.',
      noc: 'NOC view: no involvement.',
    },
    closing: 'Seventy percent of high-value churn in UK mobile has no preceding complaint. The customer just leaves when the contract ends. This platform identifies them 30 to 60 days before the decision is made — and intervenes while there is still time. That is the difference between a retention team and a retention system.',
  },

  // ── CIC: B2B critical account drift ───────────────────────────────────────
  'cic-b2b-account-drift': {
    intro:
      'Lloyds Banking Group. Top-30 enterprise account. Fourteen point two million pounds in annual recurring revenue. Two hundred and eighty branch lines. And right now, their NPS has dropped from 62 to 50, they have two open Severity-1 cases, and their QBR is 14 days overdue. The account is drifting — and if we lose it, that is fourteen million off the P&L in one quarter. The agent surfaced this before the relationship manager noticed.',
    beatsByStage: {
      detect: 'The B2B account-health model flagged Lloyds: NPS slid 62 to 50 in the last 60 days, two open Sev-1 cases unresolved for 11 days, QBR overdue by 14 days. Any one of those is a warning. Together, they are a signal that the account is in drift toward competitive review.',
      observe: 'Cortex AI_AGG over case notes, survey verbatim, and relationship-manager call logs. Sentiment on "billing accuracy" is down 0.4 — the two open disputes are about invoice line-item errors worth twelve thousand pounds total. The contract auto-renews in 91 days.',
      hypothesize: 'The account-risk model scores Lloyds at 0.74. Primary drivers: dispute backlog plus RM contact gap of 28 days. This is not a price issue — it is a service-delivery issue. The fix is operational, not commercial.',
      plan: 'Clear the two disputes with a twelve-thousand-pound goodwill resolution. Assemble an executive briefing pack for the relationship manager. Schedule a QBR within five days. Add a four-point-two-thousand-pound service credit as a gesture of accountability.',
      act: 'Salesforce executive escalation fired. The CRO, the RM, and the technical account manager are assembled. The briefing pack — auto-drafted by Cortex Agent with full case history, sentiment trajectory, and risk score — is in their inbox. The disputes are cleared. The credit is applied.',
      verify: 'Risk score dropped from 0.74 to 0.41. NPS recovery indicator shows plus-6 points within 14 days. Contract retention probability is now 0.91. The QBR is confirmed for Tuesday.',
      resolved: 'Account stabilised. Fourteen point two million pounds in ARR protected. The QBR will close the loop in week three. And the critical point: the RM did not surface this — the platform did. At that ARR, a 90-day delay in noticing account drift could have cost us the entire relationship.',
    },
    domainNotes: {
      cic: 'CIC applied account-health scoring to enterprise customers — the same ML infrastructure that scores consumer churn, adapted for B2B signals (NPS, case age, RM engagement frequency).',
      digital: 'Digital view: no outbound marketing to an account in drift state. All commercial outreach suppressed until account health recovers.',
      bss: 'BSS view: the two billing disputes and the service credit flow through Amdocs CES. Invoice correction and goodwill — twelve thousand plus four thousand two hundred — posted to the next bill.',
      oss: 'OSS view: the Sev-1 cases originated in OSS (service-quality). The fix is tracked here; CIC owns the account-relationship recovery.',
      noc: 'NOC view: no network incident. This is a service-delivery and relationship-management scenario.',
    },
    closing: 'Enterprise accounts do not churn loudly. They drift silently for 60 to 90 days, then the RFP lands on your competitor\'s desk. This platform detects that drift in real time — not from a quarterly NPS report, but from case velocity, dispute backlog, and RM contact frequency. Fourteen million pounds protected because the signal was caught at day 14, not day 90.',
  },

  // ── CIC: Family-plan reactivation ─────────────────────────────────────────
  'cic-family-reactivation': {
    intro:
      'Here is a signal most operators miss entirely. One line in a four-line family plan just cancelled. Our correlation model says the other three lines are now at 44 percent elevated risk over the next 60 days. Across the base, that pattern affects 1,840 households — 7,360 remaining lines — with a total CLV at risk of 7.7 million pounds. The agent is going to save the household before the rest follow.',
    beatsByStage: {
      detect: '1,840 family-plan households where one of four lines cancelled in the last seven days. The churn-correlation model predicts cohort churn elevated by 44 percentage points over the next 60 days. This is not speculation — this pattern has been validated on 24 months of historical household churn.',
      observe: 'Cohort: 7,360 remaining lines. Average household CLV: four thousand two hundred pounds. Total CLV at risk: 7.7 million pounds. Driver decomposition: 38 percent price-driven, 22 percent coverage, 16 percent device end-of-contract, 24 percent mixed. The agent tailors the offer by driver.',
      hypothesize: 'Representative household opened: primary account holder at propensity 0.68, spouse line at 0.54. The cancelled line was the eldest child — moved to a competitor\'s student plan. Classic pattern: when one family member leaves, the rest re-evaluate.',
      plan: 'Family-plan refresh offer: free fourth line reinstated plus Disney Plus family bundle. Personalised per driver — price-driven households get a monthly discount; coverage-driven get a Wi-Fi calling enablement; device-driven get an early upgrade pathway.',
      act: 'Salesforce Marketing Cloud family-plan journey dispatched. In-app plus email for the full cohort. Concierge call for the high-CLV households. Six hundred and eighty-four households accepted the offer within seven days.',
      verify: 'Cohort churn risk reduced from 44 percent to 22 percent. Six hundred and eighty-four households retained. CLV protected: approximately 2.9 million pounds. ARPU dips three pounds per line but tenure extends twelve months — net positive.',
      resolved: 'Family reactivation wave complete. 1,156 lines retained across 684 households. And the key insight: we intervened within seven days of the trigger event. After 30 days, the correlation drops to noise. Timing is everything.',
    },
    domainNotes: {
      cic: 'CIC applied household-level correlation modelling — not just individual propensity. This is the difference between scoring a customer and scoring a relationship.',
      digital: 'Digital view: the family-plan journey uses household-level personalisation. One message to the account holder, not four messages to four lines.',
      bss: 'BSS view: the free fourth-line offer is a subscription modifier in Amdocs CES. Disney Plus is a partner-provisioned entitlement via SPCS.',
      oss: 'OSS view: for coverage-driven households, the agent triggered a Wi-Fi calling enablement request — provisioned via OSS without a field visit.',
      noc: 'NOC view: no involvement.',
    },
    closing: 'In most operators, when a family member leaves, the other lines are still treated as independent customers with independent propensity scores. This platform models the household as a unit — and when one leaves, it moves immediately to save the rest. Seven-point-seven million in CLV does not wait for a batch campaign.',
  },

  // ── CIC: Vulnerable customer proactive outreach ───────────────────────────
  'cic-vulnerable-proactive': {
    intro:
      'This scenario is about doing the right thing — and doing it compliantly. Four hundred and twelve customers on our vulnerable register need proactive outreach: 108 recently bereaved, 184 in payment failure, 120 in digital-exclusion silence. Ofcom GC C5 and GDPR Article 6 define exactly how we may — and must — engage them. The agent orchestrates this with human-led calls only, trained specialists, and a full ICO audit trail.',
    beatsByStage: {
      detect: 'Four hundred and twelve customers flagged as needing outreach. Not marketing outreach — duty-of-care outreach. Triggers: new bereavement flag from care notes, two consecutive payment failures, or 24-month engagement silence. Each trigger has a different treatment path.',
      observe: 'The platform joined the vulnerable register against payment status, case history, and engagement decay scores. Eligibility is confirmed under GDPR Article 6(f) — legitimate interest for duty of care. The explicit suppression list is respected: if the customer has asked not to be contacted, we do not contact them. Full stop.',
      hypothesize: 'Per-customer treatment: bereavement gets a bill-pause offer plus account reassignment assistance. Payment failure gets debt-advice signposting plus a flexible arrangement. Silence gets a gentle check-in — nothing commercial, just "are you okay?"',
      plan: 'Human-led calls only — no chatbot, no automated voice, no SMS-first. Trained vulnerability specialist team, DV-cleared, with pre-approved scripts. Seven-day SLA for completion. This is not a campaign — it is a care programme.',
      act: 'Genesys vulnerability queue: 412 outbound calls assigned. Trained specialist agents with pre-approved scripts. For bereavement: 38 bill-paused, 14 accounts reassigned, 56 declined further contact — logged and respected. For payment failure: flexible arrangements offered. For silence: welfare check completed.',
      verify: 'Audit: 100 percent of calls logged with full notes. Zero GC C5 breaches. ICO ROPA (Record of Processing Activities) updated. No commercial offers were triggered during or after these calls — the safeguarding flag suppresses all marketing for 12 months.',
      resolved: 'Outreach complete. 412 customers contacted within policy. ICO and Ofcom audit trail in platinum.vulnerable_outreach. And the most important number: zero customers harmed by this process. That is the standard.',
    },
    domainNotes: {
      cic: 'CIC owns the vulnerable-customer programme. The key: no automation on the outreach itself — only automation on the identification, routing, and audit. Human contact for vulnerable customers. Always.',
      digital: 'Digital view: all commercial Digital channels suppressed for 12 months post-flag. No push notifications, no upsell, no marketing email. The safeguarding flag cascades across all systems.',
      bss: 'BSS view: bill-pause and flexible payment arrangements are posted via Amdocs CES. Revenue impact absorbed as duty-of-care obligation — no recovery target on these customers.',
      oss: 'OSS view: no involvement. This is a customer-welfare scenario, not a technical scenario.',
      noc: 'NOC view: no involvement.',
    },
    closing: 'Regulators do not ask if you have a vulnerable-customer policy. They ask if you can prove you followed it — for every customer, every time. This platform generates that proof automatically. 412 customers cared for, zero breaches, full audit trail. That is what compliant at scale looks like.',
  },

  // ── CIC: End-of-MAC re-contracting wave ───────────────────────────────────
  'cic-recontract-wave': {
    intro:
      'The 180-day end-of-Minimum-Term window is the single highest-churn period in the mobile customer lifecycle. Right now, 18,400 customers are entering that window in the next 30 days. Total CLV at risk: 18.5 million pounds. The agent has already decomposed them into three segments — upgraders, refreshers, and hold-and-discount — and is delivering personalised next-best-actions at a cadence of T-30, T-14, and T-7.',
    beatsByStage: {
      detect: '18,400 customers entering the 180-day end-of-MAC window in the next 30 days. This is the most predictable churn event in mobile — and yet most operators still treat it as a batch campaign at T-30. The agent is running it as a continuous, personalised engagement over 30 days.',
      observe: 'Decomposition: 4,200 are 5G-handset upgrade-eligible. 6,800 are plan-refresh candidates — same handset, better tariff. 7,400 are hold-and-discount targets where the best action is a price-lock guarantee. Average CLV: forty-two pounds per month times 24 months equals one thousand and eight pounds each.',
      hypothesize: 'Per-segment NBA: upgraders get 5G SA plus a five-pound credit. Refreshers get plus-20 GB at the same price. Holders get a 12-month price-lock commitment. Each offer is individually scored for propensity and margin compliance.',
      plan: 'Three-touch cadence: T-30, T-14, T-7. Channel mix personalised per customer. Margin floor at 22 percent across all offers. A 5 percent holdout is reserved to measure causal uplift versus no-treatment.',
      act: 'Salesforce Marketing Cloud orchestration: 18,400 personalised journeys launched. A/B variant testing against the control holdout. Day-seven results already showing: 4,820 re-contracted — a 26 percent conversion rate versus an 18 percent baseline.',
      verify: 'Treatment versus control: plus-8 percentage points re-contract uplift. CLV uplift projected at 4.4 million pounds. The holdout validates that this is causal — not just customers who would have re-contracted anyway.',
      resolved: 'Re-contract wave complete. 4,820 retained. Churn rate on the cohort reduced by 2.4 percentage points. And with the holdout measurement, we can prove to the CFO that every pound spent on this programme generated measurable, causal return.',
    },
    domainNotes: {
      cic: 'CIC runs re-contracting as a continuous programme, not a campaign. The 180-day window is monitored daily, with new entrants scored and assigned automatically.',
      digital: 'Digital view: three-touch cadence across in-app, push, email, and voice. Channel selection optimised per customer based on historical engagement data.',
      bss: 'BSS view: plan changes, price-locks, and credits all flow through Amdocs CES with pro-rata calculation. Contract extensions are subscription events.',
      oss: 'OSS view: for upgrade-eligible customers, the 5G SA activation is a provisioning event managed in OSS.',
      noc: 'NOC view: no involvement.',
    },
    closing: 'The end-of-MAC window is not a surprise — it is the most predictable event in mobile. Yet most operators still respond to it with a batch campaign and a call centre. This platform treats it as a continuous, measured, personalised engagement — and the result is 8 percentage points of incremental retention, causally proven.',
  },

  // ── Digital: Care chat deflection ─────────────────────────────────────────
  'dig-care-chat-deflection': {
    intro: 'Amelia Hughes is in the chat right now — sentiment minus 0.62, intent is service quality. She is affected by the live Manchester M14 incident. The Cortex chat agent is going to resolve this autonomously: identify the root cause, apply the credit and boost, and close in two minutes fourteen seconds. Cost: fifteen pounds versus forty-two for a human handle.',
    beatsByStage: {
      detect: 'Inbound chat from CUST-001. Intent: service_quality. Sentiment: minus 0.62. Biometric verification confirmed. Full context pulled: last bill thirty-eight pounds, contract ends in 21 days, Manchester M14 postcode.',
      observe: 'Cortex Search matched her complaint against the live NOC incident — Manchester M14 cluster degradation. Runbook NOC-MAN-M14 retrieved. The agent knows this is a known, temporary network issue.',
      hypothesize: 'Customer affected by live cluster degradation. Correct response: acknowledge, compensate, reassure. No human needed. NBA: credit plus boost plus follow-up SMS.',
      plan: 'Apply five-pound service credit. Offer 10 GB boost for 24 hours. Schedule restoration follow-up SMS in 20 minutes. Generate reply with Cortex Complete using empathetic tone.',
      act: 'Cortex Complete generated the empathetic response with tool calls. billing.apply_credit — acknowledged. plans.boost 10 GB — acknowledged. comms.schedule_followup — queued via Sinch. All executed in under 4 seconds.',
      verify: 'Chat resolved in 2:14. CSAT prediction: 0.86. Sentiment: minus 0.62 to plus 0.41. Zero human escalation. GDPR Article 22 audit logged.',
      resolved: 'Deflection success. Fifteen pounds versus forty-two for human handle. Faster resolution, more accurate context than a human agent could deliver. That is not cost-cutting — that is quality improvement.',
    },
    domainNotes: { cic: 'CIC owns customer context injected into the agent before first response.', digital: 'Digital executed the entire conversation — Cortex Complete plus tool-calls.', bss: 'BSS: five-pound credit posted to Amdocs CES. Boost auto-expires after 24h.', oss: 'OSS: underlying network issue managed by NOC separately.', noc: 'NOC: incident managed independently; CIC handled customer outcome.' },
    closing: 'Two minutes. Fifteen pounds. Sentiment fully recovered. GDPR audited. The question is not whether AI can handle care — it is whether your current operation can match this quality and cost at scale.',
  },

  // ── Digital: Voice save-the-cancel ────────────────────────────────────────
  'dig-voice-save-cancel': {
    intro: 'Hannah Bennett is on the 0808 save line. She said "I keep getting dropped calls and I want to leave." Sentiment: minus 0.74. The AI voice agent is going to save this cancel in one minute one second — real-time sentiment tracking, real-time NBA injection, STIR/SHAKEN attested.',
    beatsByStage: {
      detect: 'Inbound voice call on the MNP save queue. CUST-003. Stated intent: cancel. Whisper STT running — WER 3.4 percent. Sentiment: minus 0.74.',
      observe: 'Real-time NBA injection: known network softness in LS5, high-CLV, retention-eligible. Voice agent receives context before responding.',
      plan: 'Voice agent script: empathy, reassurance about the known issue, then five-pound credit plus 10 GB boost. De-escalation, not persuasion.',
      act: 'Neural TTS agent explains the live issue, apologises, offers credit plus boost. Sentiment trajectory: minus 0.74 → minus 0.36 → plus 0.12 → plus 0.34. She agrees to "leave it for now." Cancellation NOT submitted.',
      verify: 'Save complete. AHT: 1:01 versus 4:18 human average. STIR/SHAKEN attestation A. QA scorecard: empathy pass, resolution pass, regulator pass.',
      resolved: 'Cancel saved. CLV protected ~£480. QA pass. Zero vulnerability flags. Entire call took less time than a human reads the notes.',
    },
    domainNotes: { cic: 'CIC provided real-time context: CLV, churn score, network-impact flag.', digital: 'Digital owns voice: Genesys routing, neural TTS, real-time STT with sentiment.', bss: 'BSS: credit posted to Amdocs CES. Cancellation NOT processed.', oss: 'OSS: network softness in LS5 addressed separately.', noc: 'NOC: technical fix managed independently.' },
    closing: 'One minute. One save. Sentiment fully recovered on a caller who said "I want to leave." Real-time intelligence injected into a live voice conversation with full regulatory compliance.',
  },

  // ── Digital: eSIM activation funnel ───────────────────────────────────────
  'dig-esim-activation-funnel': {
    intro: 'Eighteen thousand eSIM activations in the last hour. Funnel completion at 87 percent versus 81 percent baseline. The platform is recovering 1,250 drop-offs with personalised nudges — 33 percent recovery rate — saving seventeen thousand pounds in care-call avoidance in one hour.',
    beatsByStage: {
      detect: '18,420 eSIM journey sessions in one hour. Burst driven by new device launch. Platform monitoring funnel in real time, stage by stage.',
      observe: 'Stage 1 eligibility: 18,420 entered. Stage 2 QR code: 16,890 (8% drop). Stage 3 profile install: 16,210 (4% drop). Stage 4 test call: 16,038. Each drop-off analysed for cause.',
      hypothesize: '1,250 abandoned at stages 1-3. Recovery candidates identified: handset compatibility, address-validation errors, timeouts. 33 percent recoverable.',
      plan: 'Drop-off recovery: retry push for 1,250. Voice callback via Genesys for provisioning failures. Channel personalised by failure reason.',
      act: 'Salesforce MC push plus Genesys callback for 1,250. 412 recovered — 33 percent recovery rate.',
      verify: 'Funnel completion: 87 percent vs 81 baseline. Average journey: 2:48. Zero physical SIM cost.',
      resolved: '16,450 eSIMs activated. NPS +4. Zero physical SIM cost. Drop-off recovery saved 412 care calls — £17k cost avoidance in one hour.',
    },
    domainNotes: { cic: 'CIC owns eligibility context from gold.device_capability.', digital: 'Digital owns the journey: funnel orchestration, SM-DP+ provisioning, recovery.', bss: 'BSS: subscription activated in Amdocs CES; eSIM is delivery mechanism.', oss: 'OSS: SM-DP+ provisioning managed by OSS.', noc: 'NOC: no involvement.' },
    closing: 'Sixteen thousand eSIMs in one hour. Self-healing funnel recovering 412 customers who would otherwise have called. That is what instrumented digital looks like.',
  },

  // ── Digital: Roaming Pass proactive push ──────────────────────────────────
  'dig-roaming-push': {
    intro: 'Two days before 4,200 customers leave the UK, the platform surfaces a Roaming Pass offer. Pre-emptive revenue — enrolling them before they board the plane, not after they land and get bill-shocked.',
    beatsByStage: {
      detect: 'Travel-pattern model: 4,200 customers likely to travel EU in 48 hours. Signals: booking metadata, airport Wi-Fi, historical travel patterns.',
      observe: 'Cohort: 4,200 total. 612 high-CLV. 312 already enrolled — suppressed. Net reachable: 3,720 without protection.',
      plan: 'Surface Roaming Pass EU £3/day via in-app plus push plus email. Consent verified, last push >7 days, margin floor confirmed.',
      act: 'Salesforce MC + Sinch dispatched to 3,720. In-app opened by 1,840 (49% open rate). 612 enrolled within 24 hours.',
      verify: 'Conversion: 16%. Bill-shock cases avoided: ~480. Revenue: £12.8k/week.',
      resolved: '612 enrolled. Bill-shock prevented for 480 who would have generated £42 care calls each. Revenue-positive, cost-avoidance-positive, CSAT-positive.',
    },
    domainNotes: { cic: 'CIC identified travel cohort from behavioural signals.', digital: 'Digital owns channel execution: push, email, in-app.', bss: 'BSS: Roaming Pass is a subscription add-on in Amdocs CES.', oss: 'OSS: no network action.', noc: 'NOC: no involvement.' },
    closing: 'The best time to sell a Roaming Pass is two days before departure. This platform acts on predictive signals. 612 enrolments, zero bill-shock calls, revenue generated.',
  },

  // ── Digital: Disney+ bundle attach ────────────────────────────────────────
  'dig-marketplace-bundle': {
    intro: 'Twenty-four thousand family-plan customers scored for Disney Plus attach. Top 8,400 above 0.6 propensity. Twenty-seven percent conversion. 18.4 percentage-point causal lift over control. Precision cross-sell powered by propensity scoring and real-time SPCS provisioning.',
    beatsByStage: {
      detect: 'Bundle propensity model: 24,000 family-plan customers scored overnight. Signals: household composition, content viewing, competitive bundle awareness.',
      observe: 'Top 8,400 above 0.6. 1,200 high-CLV. 5% holdout reserved. Suppression: 2,180 complaints + 4,420 offer-fatigue removed.',
      plan: 'Surface Disney Plus via in-app modal for 7,980 net reachable. Margin: 38% rev-share. SPCS adapter for real-time provisioning to Disney backend.',
      act: 'Salesforce MC dispatched ranked modals. SPCS provisions entitlement in <1.4s P95. 2,180 attached — 27% conversion.',
      verify: 'Versus holdout: +18.4pp lift. Churn on attached cohort: −6.4pp. Revenue: +£19.6k/month.',
      resolved: '2,180 attached. Revenue £19.6k/month. Churn reduced. Provisioning in 1.4 seconds. Real-time partner integration at scale.',
    },
    domainNotes: { cic: 'CIC scored propensity and measures churn reduction.', digital: 'Digital owns the journey, Salesforce MC, and SPCS adapter.', bss: 'BSS: bundle is subscription add-on in Amdocs CES.', oss: 'OSS: SPCS provisioning latency is an OSS metric.', noc: 'NOC: no involvement.' },
    closing: '27 percent conversion. 18.4pp causal lift. Churn reduced. When you combine propensity scoring with real-time provisioning and holdout measurement, that is precision cross-sell.',
  },

  // ── Digital: App-store rating intervention ────────────────────────────────
  'dig-appstore-rating-watch': {
    intro: 'iOS UK sentiment crashed from plus 0.42 to minus 0.31 in six hours. Store rating forecast: 4.6 to 4.2 within 48 hours. The platform detected it from review velocity, clustered themes with AI Summarize, and deployed an intervention before the public score moved.',
    beatsByStage: {
      detect: 'Rolling 200-review sentiment crashed in 6 hours. Review velocity anomaly triggered. Leading indicator — store rating has not moved yet.',
      observe: 'AI_SUMMARIZE clusters: "5G coverage Manchester" 28%, "billing app crash" 24%, "tariff vs competitor" 18%. Three distinct problems.',
      hypothesize: 'Rating forecast: 4.6 → 4.2 in 48h if untreated. Each 0.1 drop costs ~4% organic installs.',
      plan: 'In-app intercept for 18,400 affected cohort. Cortex Agent FAQ. Pre-drafted App Store appeal with evidence linking reviews to NOC incident.',
      act: 'Salesforce MC intercept dispatched. Cortex Agent FAQ deflected 8,940 sessions. Sentiment recovered +0.21 in 6 hours.',
      verify: 'Store rating held 4.6. Survey response: 18%. App Store appeal pre-drafted with evidence.',
      resolved: 'Rating preserved. Intervention happened six hours before the score would have moved. Predictive brand protection — not reactive PR.',
    },
    domainNotes: { cic: 'CIC mapped reviewers to affected postcodes.', digital: 'Digital owns intervention: intercept, FAQ, App Store appeal.', bss: 'BSS: no billing action.', oss: 'OSS: underlying Manchester issue managed by NOC/OSS.', noc: 'NOC: M14 incident is root cause; app-store intervention is customer-perception response.' },
    closing: 'A 0.4-point store-rating drop costs millions in installs. This platform detected the shift six hours before the score moved and deployed a targeted intervention.',
  },

  // ── Digital: Web checkout abandonment ─────────────────────────────────────
  'dig-web-checkout-abandon': {
    intro: '1,820 carts abandoned at payment in thirty minutes — 7.6 times baseline. Ninety-two thousand pounds sitting in abandoned carts. The platform diagnosed causes, segmented by failure reason, and recovered 33 percent within the 30-minute window.',
    beatsByStage: {
      detect: '1,820 carts abandoned at payment in 30 min vs 240 baseline. Acute event — cart-recovery model triggered immediately.',
      observe: 'Segmentation: 760 price-match hesitation, 480 address-validation, 360 Stripe 3DS friction, 220 timeouts. Each gets different treatment.',
      hypothesize: '33% recoverable within 30 minutes with right channel and message.',
      plan: 'Price-match for 760 (margin floor). Pre-filled address for 480. Alternative payment rail for 360. Deep-link for 220.',
      act: 'Salesforce MC + Sinch: ranked recovery push. SMS 41%, email 33%, push 28% recovery rates.',
      verify: '612 recovered — 33%. Checkout completion 68% → 76%. Revenue: £92k. Zero PCI/fraud flags.',
      resolved: '£92k recovered. £34k CAC saved. These customers already decided to buy — we removed friction. Full audit trail.',
    },
    domainNotes: { cic: 'CIC scored each customer for recovery propensity and channel preference.', digital: 'Digital owns recovery end-to-end.', bss: 'BSS: recovered orders flow through normal pipeline.', oss: 'OSS: if Stripe 3DS is systemic, OSS owns payment-platform health.', noc: 'NOC: no involvement.' },
    closing: 'Ninety-two thousand recovered in thirty minutes. The difference between abandonment and conversion is a single well-timed SMS.',
  },

  // ── Digital: Vulnerability-aware care routing ─────────────────────────────
  'dig-vulnerable-care-routing': {
    intro: '"I have just been bereaved and I cannot pay this bill." Sentiment minus 0.84. Vulnerability classifier fired at 0.97 confidence. In four seconds: suppress all commercial offers, route to specialist, activate ICO/Ofcom evidence trail. Duty of care in action.',
    beatsByStage: {
      detect: 'Inbound chat. Free text: bereaved, cannot pay. Sentiment: −0.84. Vulnerability classifier v2.1 fired immediately.',
      observe: 'Classification: recent_bereavement at 0.97 confidence. Triggers Ofcom GC C5 and ICO requirements. All commercial automation stops.',
      hypothesize: 'GC C5 + ICO: suppress all upsell. Route to trained specialist. No bot handles this.',
      plan: 'Suppress commercial offers. Route to SAVE-VULN. Set safeguarding flag. Activate evidence trail.',
      act: 'Genesys SAVE-VULN pickup in 18 seconds. 30-day bill pause + payment plan offered and accepted. All upsell suppressed 12 months.',
      verify: 'CSAT: 0.92. Zero commercial actions triggered. ICO vulnerability register updated. GC C5 evidence pack generated.',
      resolved: 'Case VLN-2026-04812 opened. GDPR Art.9 logged. System identified vulnerability from free text in under one second and acted before any automated offer fired.',
    },
    domainNotes: { cic: 'CIC suppressed all NBA for 12 months. Safeguarding flag overrides every score.', digital: 'Digital classified vulnerability and routed to specialist.', bss: 'BSS: 30-day bill pause. No debt recovery.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'When a customer says they have been bereaved, the only correct response is compassion, suppression, and a trained human. This platform delivers that in under one second with full regulatory evidence.',
  },

  // ── Digital: FCR prediction ───────────────────────────────────────────────
  'dig-fcr-prediction': {
    intro: '6,200 chats in one hour — 4x baseline. The FCR model triages before routing: 4,180 to bot, 1,420 to assist, 600 to specialists. Result: 78 percent FCR versus 66 baseline. Twelve thousand pounds per hour saved in escalation costs.',
    beatsByStage: {
      detect: '6,200 chats in one hour at 4x baseline. Surge from campaign launch or incident.',
      observe: 'FCR model scored each before routing: 4,180 ≥0.7 (bot), 1,420 0.4-0.7 (assist), 600 <0.4 (specialist).',
      hypothesize: 'Routing 600 low-FCR directly to specialists prevents bot-then-human escalation tax — £42 and 4 min per escalation.',
      plan: '4,180 to Cortex Agent. 1,420 to assist mode. 600 to SAVE-COMPLEX. Vulnerability classifier in parallel.',
      act: 'Bot FCR: 81%. Assist: 74%. Specialist: 88%. Overall: 78%. Four vulnerability cases intercepted mid-flow.',
      verify: '6,200 served. Zero queue overflow. Escalation cost down £12k/hour.',
      resolved: 'FCR 78% — up from 66%. £12k/hour saved. Four vulnerability cases caught that pure-bot would miss. Precision routing outperforms one-size-fits-all.',
    },
    domainNotes: { cic: 'CIC enriched FCR prediction with CLV and complaint history.', digital: 'Digital owns routing intelligence — FCR model runs at queue edge.', bss: 'BSS: credits actioned during chats posted to Amdocs CES.', oss: 'OSS: provides incident context if surge is network-driven.', noc: 'NOC: owns root cause if live incident drives surge.' },
    closing: 'Routing intelligence before the first response — not after the bot fails. Predictive resolution routing, not reactive escalation management.',
  },

  // ── Digital: App fraud ────────────────────────────────────────────────────
  'dig-app-fraud-signup': {
    intro: '240 signups in 15 minutes. 18 flagged above 0.85 — same device fingerprint, impossible geo, Stripe Radar flag. A fraud ring. Platform paused provisioning before a single SIM activated. £42k prevented.',
    beatsByStage: {
      detect: '240 signups in 15 min. synthetic_signup_v1.3 flags 18 above 0.85. Coordinated ring.',
      observe: '12 same device fingerprint. IP=UK, address=NL, phone=IE. Stripe Radar independently flagged. Three corroborating signals.',
      hypothesize: 'Synthetic-identity ring. Pause provisioning, KYC step-up, preserve evidence chain.',
      plan: 'Hold SIM provisioning. Onfido document+selfie step-up. Evidence pack attached to FRD-2026-7421.',
      act: 'KYC dispatched: 14 attempted, only 2 cleared. 12 confirmed synthetic. 4 hard-blocked. 2 cleared = legitimate with unusual profiles.',
      verify: '£42k prevented. 16 SIMs not provisioned. Zero false-blocks confirmed. GDPR data-minimisation respected.',
      resolved: 'Case closed. Stripe Radar feedback loop fed. Ring harder to repeat. Two legitimate customers minimally inconvenienced — 90-second selfie.',
    },
    domainNotes: { cic: 'CIC not available for new signups — fraud model works on behaviour alone.', digital: 'Digital owns signup journey and fraud detection at edge.', bss: 'BSS: no accounts created. Stripe held payment.', oss: 'OSS: no SIMs provisioned.', noc: 'NOC: no involvement.' },
    closing: 'Sixteen synthetics blocked before a single SIM activated. £42k prevented. Zero legitimate customers permanently blocked. Precision fraud prevention.',
  },

  // ── Digital: Campaign launch 240k lookalike ───────────────────────────────
  'dig-campaign-launch-lookalike': {
    intro: '5G Hero campaign: seed 1,000 converters, 240k lookalike via Snowpark ML embeddings, Cortex Agent creative, 5% holdout. Day-one: 11.4% conversion vs 5% control. ROAS 4.6x. From brief to live in hours, not weeks.',
    beatsByStage: {
      detect: 'Campaign brief: 5G Hero Unlimited Max. Seed: 1,000 high-CLV converters. Objective: find the next 240,000.',
      observe: 'Snowpark ML lookalike on gold.customer_embeddings: 240,180 above cosine 0.82. Suppression: complaints, fatigue, campaign overlap removed.',
      plan: '232k net reachable. 5% holdout. Cortex Agent generates 6 subject lines + 3 body variants — brand voice: confident, friendly, UK.',
      act: 'Salesforce MC dispatched 232k across app, email, RCS. Day-one: 11.4% conversion. Holdout: 5.0%. Uplift: +6.4pp. ROAS: 4.6x.',
      verify: 'Best variant: "Your data, unlocked." CTR +27%. Spend: £184k of £320k cap. Margin preserved.',
      resolved: '27,400 conversions. ARPU +£1.60/mo per converter. Causal uplift proven. Campaign: brief to live in hours.',
    },
    domainNotes: { cic: 'CIC provided seed audience and embeddings.', digital: 'Digital owns execution: MC orchestration, Cortex creative, A/B, holdout.', bss: 'BSS: 27,400 plan upgrades through Amdocs CES.', oss: 'OSS: 5G SA activations are provisioning events.', noc: 'NOC: no involvement.' },
    closing: 'Brief to live in hours. 240k targeted. 27,400 converted. Causal uplift proven. Creative AI-generated. Not a marketing department — a revenue engine.',
  },

  // ── Digital: Attribution rebalance ────────────────────────────────────────
  'dig-attribution-rebalance': {
    intro: 'Bayesian MMM detected paid social at marginal ROAS 0.7 — below break-even. £1.8M/quarter over-spent. Platform reallocating to retargeting and RCS. Forecast: ROAS 5.1→5.5, +£820k/month incremental.',
    beatsByStage: {
      detect: 'Weekly MMM: paid social marginal ROAS 0.7 — below 1.0 break-even.',
      observe: 'Shapley vs last-click: paid social over-credited by 9pp. Attribution misallocated.',
      hypothesize: 'Reallocating 12pp from paid social to retargeting+RCS lifts ROAS by 0.4.',
      plan: 'Cap paid social at 28%. Retargeting +6pp. RCS +4pp. Email +2pp. Total reallocation: £1.8M/quarter.',
      act: 'Spend pushed to ad-buying APIs. Adobe AEP + Salesforce MC budgets re-issued. Re-pacing in 30 minutes.',
      verify: 'Forecast ROAS 5.1→5.5. +£820k/month. Zero brand-safety regressions.',
      resolved: '£1.8M redirected from waste to growth. Bayesian model with Shapley attribution, executed with guardrails. Not gut-feel.',
    },
    domainNotes: { cic: 'CIC owns first-party conversion data feeding the MMM.', digital: 'Digital owns MMM, attribution, and spend-rebalancing pipeline.', bss: 'BSS: ROAS is a portfolio revenue metric.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'Most teams rebalance quarterly — if at all. This platform does it weekly, automatically, with Bayesian confidence. £1.8M moved from waste to growth in thirty minutes.',
  },

  // ── Digital: Competitor counter-launch ────────────────────────────────────
  'dig-competitor-counter': {
    intro: 'Competitor dropped 30GB SIM-only to £18. PAC velocity +340%. Brand search −9% in 4 hours. Platform detected via Cortex Search, generated counter-offer, produced creative, deployed — within 24 hours.',
    beatsByStage: {
      detect: 'Cortex Search alert: Competitor A cut 30GB to £18. 4 social posts promoting. PAC velocity spiking.',
      observe: 'PAC +340% in LS2/LS5. Brand search −9% in 4h. Leading indicators — churn not yet happened.',
      hypothesize: 'If untreated: +6.4pp churn in SnowFlex cohort over 7 days. ~£94k CLV at risk.',
      plan: 'SnowFlex price-match + 6mo loyalty boost. 940 cohort. Margin floor 28% holds. Cortex Agent drafts copy + PR.',
      act: 'Salesforce MC to 940. Creative live in 22 minutes from detection. 412 retained — 44% save rate (+16pp vs control).',
      verify: '24h response achieved. CLV protected ~£94k. PR cleared by Comms.',
      resolved: 'Counter-launch live in 24h. 412 saved. Creative AI-generated, compliance-checked, deployed without agency brief.',
    },
    domainNotes: { cic: 'CIC identified at-risk cohort from PAC velocity + Cortex Search.', digital: 'Digital owns response: creative, channel dispatch, tracking. 22 min detection-to-live.', bss: 'BSS: price-match is tariff modifier in Amdocs CES.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: '22 minutes from detection to live creative. 24 hours to deployment. Same-day competitive response — not a three-week campaign cycle.',
  },

  // ── Digital: Winback 18.4k lapsed ─────────────────────────────────────────
  'dig-winback-lapsed': {
    intro: '18,420 customers churned 60-180 days ago. Winback model scored, vulnerability checked, consent confirmed for 14,920. Day-7: 2,420 returned — 13% vs 4.1% untreated. Causally proven via holdout.',
    beatsByStage: {
      detect: 'Lapsed cohort: 18,420 churned 60-180 days ago. Winback window — experienced competitor, may return.',
      observe: 'Propensity >0.5: 6,140. Vulnerability-suppressed: 248. Consent confirmed: 14,920. Channels: 4,180 push, 8,200 email, 2,540 SMS.',
      plan: 'Tiered: £15 cashback, 50% off 3mo, free Roaming Pass. Vulnerability checks. 10% holdout.',
      act: 'Salesforce MC + Sinch: 14,920 dispatched. Day-3: 1,640 returned (9% vs 4% control).',
      verify: 'Day-7: 2,420 returned. 13% vs 4.1% control. +4.9pp causal. Revenue: +£42k/month.',
      resolved: '2,420 returned. CLV recovered £384k. Holdout proves genuine incremental win-back.',
    },
    domainNotes: { cic: 'CIC scored winback propensity — churn model reversed.', digital: 'Digital owns channel execution and holdout measurement.', bss: 'BSS: re-activations in Amdocs CES. Cashback is credit; discount is time-bound modifier.', oss: 'OSS: re-activation triggers new eSIM provisioning.', noc: 'NOC: no involvement.' },
    closing: 'Winback: cheapest acquisition — no CAC, known preferences. 2,420 returned at £12/win-back vs £60 new acquisition.',
  },

  // ── Digital: Anniversary loyalty ──────────────────────────────────────────
  'dig-anniversary-loyalty': {
    intro: '12,200 customers reaching their 12/24/36-month anniversary today. Trigger-based loyalty surprise: 10GB boost + Disney+ trial + £5 credit. 38 percent acceptance. NPS +4. Churn forecast −2.4pp.',
    beatsByStage: {
      detect: 'Anniversary trigger fired: 12,200 customers at 12mo/24mo/36mo milestones today.',
      observe: 'Loyalty model ranks 3 tiers: 36mo gets gift, 24mo gets bundle, 12mo gets boost.',
      plan: '10GB boost + Disney+ 1mo trial + £5 credit. Cross-product single push. Entitlement via SPCS.',
      act: 'Salesforce MC: 12,200 dispatched. Push + email. 4,640 accepted (38%). 1,420 attached Disney+ trial.',
      verify: 'CSAT +0.6. NPS +4pp. Churn forecast −2.4pp on cohort.',
      resolved: '4,640 rewards accepted. Revenue lift £18k/mo. Zero offer-fatigue triggers. Loyalty delivered as surprise, not negotiation.',
    },
    domainNotes: { cic: 'CIC owns the anniversary trigger from tenure data.', digital: 'Digital owns the journey and SPCS provisioning.', bss: 'BSS: credits and trials posted to Amdocs CES.', oss: 'OSS: SPCS provisions partner entitlements.', noc: 'NOC: no involvement.' },
    closing: 'Loyalty surprises — not negotiated discounts. 38 percent acceptance on an unsolicited reward. Churn reduced. NPS lifted. The best retention is the one the customer did not ask for.',
  },

  // ── Digital: Refer-a-friend ───────────────────────────────────────────────
  'dig-refer-a-friend': {
    intro: '8,400 advocates identified — NPS 9+, tenure 6+months. Personalised referral links dispatched. Day-3: 612 friend conversions. Viral coefficient 0.42. CAC saved: £38k versus paid channels.',
    beatsByStage: {
      detect: 'Advocate cohort: 8,400 with NPS ≥9 + tenure ≥6mo. advocate_propensity_v1.0 scored.',
      observe: 'Reward: £15 credit per referral. Cap: 5 per advocate. Share via WhatsApp/SMS.',
      plan: 'Dispatch advocate nudge: email + push. Personalised referral link via Adobe AEP.',
      act: 'Salesforce MC: 8,400 dispatched. Day-3: 3,540 invites sent, 1,320 opened, 612 converted.',
      verify: 'Viral coefficient 0.42. LTV created: £94k. CAC saved: £38k (paid-channel avoided).',
      resolved: '612 new customers. ROAS 9.1x. Zero fraud on advocate-friend pairs. Reward credits auto-issued.',
    },
    domainNotes: { cic: 'CIC identified advocates from NPS and tenure data.', digital: 'Digital owns the referral journey and viral measurement.', bss: 'BSS: reward credits in Amdocs CES. New subscriptions activated.', oss: 'OSS: new SIM/eSIM provisioning for converts.', noc: 'NOC: no involvement.' },
    closing: '612 new customers at ROAS 9.1x. The cheapest growth channel is your happiest customers. This platform identifies them, arms them, and measures the result.',
  },

  // ── Digital: Decisioning trace ────────────────────────────────────────────
  'dig-decisioning-trace': {
    intro: 'One customer. One decision. Full trace: eligibility, suppression, ranked offers, channel selection — all auditable in 41 milliseconds P95. This is the decisioning brain in action — every decision explainable, every gate logged.',
    beatsByStage: {
      detect: 'Intent received: CUST-001 chat, "5G slow at home", Manchester M14.',
      observe: 'Customer state: CLV £980, churn 0.62, contract end 21d, 2 open complaints.',
      plan: 'Eligibility: 12 offers retrieved. Suppression: 3 dropped (frequency cap, margin floor, vulnerability). Cortex Agent reasoning: "network event known — prioritise apology + credit."',
      act: 'Ranked output: P1 £5 credit, P2 10GB boost, P3 contract refresh. Channel: in-bot. Decision delivered in 41ms.',
      verify: 'Explainability: 94.2%. Zero override needed. Audit row written to gold.decision_lineage.',
      resolved: 'Decision resolved. CSAT prediction 0.86. GDPR Art.22 compliant. Full lineage preserved.',
    },
    domainNotes: { cic: 'CIC owns customer state feeding the decisioning.', digital: 'Digital owns the decisioning runtime: eligibility, suppression, ranking.', bss: 'BSS: offers sourced from catalog; credits posted on acceptance.', oss: 'OSS: network context injected as decisioning input.', noc: 'NOC: incident status feeds the reasoning.' },
    closing: 'Every decision: explainable, auditable, 41 milliseconds. Not a black box — a glass box with a regulator-ready audit trail.',
  },

  // ── Digital: VoC theme drift ──────────────────────────────────────────────
  'dig-voc-theme-drift': {
    intro: 'First-party transcript analysis — calls, chats, surveys — caught a 28 percent spike in "5G coverage Manchester" complaints six hours before the app-store score moves. Distinct from external sentiment. Cortex AI_CLASSIFY on your own data.',
    beatsByStage: {
      detect: 'Theme anomaly: "5G coverage Manchester" +28% in 6h. voc_classifier_v3.1 on first-party transcripts.',
      observe: 'AI_SUMMARIZE: "M14 dropped calls" 38%, "5G slow indoors" 32%, "billing app" 18%.',
      hypothesize: 'Forecast: app-store 4.6→4.2 in 48h. NPS detractor +1.4pp if untreated.',
      plan: 'In-app intercept for 18,400. Cortex Agent FAQ. App Store appeal pre-draft.',
      act: 'Salesforce MC: 18,400 intercepted. FAQ deflected 8,940. Sentiment +0.21 in 6h.',
      verify: 'Theme normalised. NPS detractor +0.0pp. Store rating held 4.6.',
      resolved: 'Drift contained. First-party VoC caught the signal before external reviews moved. GDPR Art.6 logged.',
    },
    domainNotes: { cic: 'CIC maps transcript themes to affected customer cohorts.', digital: 'Digital owns VoC pipeline: transcripts → classify → theme → alert → intervene.', bss: 'BSS: no billing action.', oss: 'OSS: Manchester fix managed separately.', noc: 'NOC: root cause managed by NOC.' },
    closing: 'First-party data gives you six hours lead time over public sentiment. This platform uses that lead time to intervene, not just report.',
  },

  // ── Digital: Experiment rollout ───────────────────────────────────────────
  'dig-experiment-rollout': {
    intro: '5G Hero A/B at 50 percent ramp. Bayesian posterior: +6.4pp uplift, P(uplift>0) = 98.8%, ROPE excluded. Auto-decision: ramp to 100%. Guardrails held. Causal proof — not gut-feel.',
    beatsByStage: {
      detect: '5G Hero campaign at 50% ramp. Interim Bayesian read due.',
      observe: 'Posterior mean uplift +6.4pp. P(uplift>0) = 98.8%. ROPE [-2pp,+2pp] excluded.',
      plan: 'Guardrails OK: complaint rate −0.2pp, margin preserved, vulnerability suppressed. Auto-decision: ramp 50→100%.',
      act: 'Adobe AEP segments updated. Creative re-paced toward winner. No audience-overlap conflict.',
      verify: 'Test 100%. Uplift +6.4pp. p=0.012. Zero guardrail breaches.',
      resolved: 'Causal lift confirmed. Holdout register updated. Not opinion — Bayesian proof with guardrails.',
    },
    domainNotes: { cic: 'CIC owns conversion signals.', digital: 'Digital owns the experimentation platform: Bayesian engine, guardrails, auto-ramp.', bss: 'BSS: revenue from conversions tracked.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'Bayesian proof with auto-ramp and guardrails. The experiment platform decides — not the campaign manager. 6.4pp causal uplift, confirmed.',
  },

  // ── Digital: MarTech sync lag ─────────────────────────────────────────────
  'dig-martech-sync-lag': {
    intro: 'Salesforce MC sync lag P95 spiked from 92s to 248s during the 5G Hero launch. Platform auto-throttled, spooled excess, and backfilled on recovery. Zero sends dropped. Self-healing integration.',
    beatsByStage: {
      detect: 'MC sync lag P95: 92s→248s. audience_sync_v3 anomaly. Campaign firing 232k events/min vs MC ingest 184k/min.',
      observe: 'MC API rate limit (412 throttle) causing lag.',
      plan: 'Throttle outbound to 184k/min. Spool excess in retry queue. Backfill on recovery.',
      act: 'Throttled. Retry queue at 48k events. Zero sends dropped.',
      verify: 'MC recovered. Queue drained in 2:48. Lag back to P95 38s. Audience freshness restored.',
      resolved: 'Self-healing: throttle, spool, backfill. Zero customer impact. MC team alerted for capacity.',
    },
    domainNotes: { cic: 'CIC: no impact — audience freshness maintained.', digital: 'Digital owns the integration health and auto-throttle logic.', bss: 'BSS: no impact.', oss: 'OSS: platform health monitoring.', noc: 'NOC: no involvement.' },
    closing: 'Integration failures happen. The question is: does your platform self-heal, or does a customer miss a message? Zero dropped. Self-healing.',
  },

  // ── Digital: Pricing A/B ──────────────────────────────────────────────────
  'dig-price-test': {
    intro: 'SnowFlex 30GB: £18 vs £20. 14 days in-market. Bayesian read: £18 wins +4.2pp attach, margin holds at 31.4% (floor 28%). Revenue per attempt: £4.03 vs £3.64. Auto-rolled to 100%. CFO workflow attached.',
    beatsByStage: {
      detect: 'Price A/B: SnowFlex 30GB, £18 vs £20. 14 days. Bayesian read due.',
      observe: '£18 arm: 22.4% attach. £20 arm: 18.2%. Uplift +4.2pp. p=0.006.',
      hypothesize: 'Margin: £18 at 31.4% (floor 28%) — within policy. Revenue per attempt: £4.03 vs £3.64.',
      plan: 'Roll £18 to 100%. Monitor competitor parity. Re-test in 90d. CFO sign-off workflow.',
      act: 'Pricing engine updated. Catalog v126 published via TMF 620. Creative re-paced.',
      verify: 'Forecast: +£42k/mo revenue. Margin held. Competitor parity: at par.',
      resolved: '£18 live to 100%. +£42k/mo. Full audit trail. Re-test in 90 days.',
    },
    domainNotes: { cic: 'CIC provides conversion and churn signals for price sensitivity.', digital: 'Digital owns the pricing experimentation platform.', bss: 'BSS: catalog updated via TMF 620. Revenue recognised at new price.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'Price testing with Bayesian proof, margin-floor compliance, and CFO workflow. Not gut-feel pricing — measured, governed, and auditable.',
  },

  // ── Digital: Self-service KB gap ──────────────────────────────────────────
  'dig-selfservice-kb-gap': {
    intro: '"eSIM transfer iPhone" — 612 hits in 24 hours, zero KB article. Cortex Complete auto-drafted the article, UX built the in-app guide, and containment rose 4 percentage points. KB gap closed in 90 minutes.',
    beatsByStage: {
      detect: 'KB miss: "esim transfer iPhone" 612 hits in 24h. containment_v2.3 gap detected.',
      observe: '412 new iPhone 16 owners. 200 Android-to-iPhone migrants.',
      hypothesize: 'Deflection +4pp if KB article + in-app guide published.',
      plan: 'Cortex Complete drafts KB article. UX builds guided journey. 90-min SLA.',
      act: 'KB-2026-1842 published. In-app journey live. Search re-indexed.',
      verify: 'KB hit-rate +14pp. 412 of 612 follow-ups resolved. Containment +4pp. FCR +2pp.',
      resolved: 'Gap closed in 90 minutes. Auto-publish logged in gold.decision_lineage.',
    },
    domainNotes: { cic: 'CIC: customer device data identified the cohort.', digital: 'Digital owns self-service: KB, search, journey orchestration.', bss: 'BSS: no billing action.', oss: 'OSS: eSIM provisioning docs owned here.', noc: 'NOC: no involvement.' },
    closing: 'A KB gap costs £42 per human handle for every customer who cannot self-serve. This platform detected the gap, drafted the article, and published — in 90 minutes.',
  },

  // ── Digital: DSAR surge ───────────────────────────────────────────────────
  'dig-privacy-dsar-surge': {
    intro: 'DSAR submissions spiked to 24 in 4 hours — post press cycle on telco data practices. ICO 1-month SLA at risk on 5 cases. Platform auto-routed to DPO, auto-extracted data, and preserved SLA. Zero breaches.',
    beatsByStage: {
      detect: 'DSARs: 24 in 4h vs baseline 6. 5 oldest cases >5d — high priority.',
      observe: 'Driver: external press cycle. Brand-search +18%.',
      plan: 'Route to DPO+Legal. Auto-extract via gold.consent_register. 24h triage SLA.',
      act: 'DPO team paged. Auto-extract for 14 cases. Evidence packs generated.',
      verify: '12 closed in 48h. 6 in evidence-pending. Zero SLA breaches.',
      resolved: 'DSAR queue normalised. ICO SLA preserved. Regulator-ready audit.',
    },
    domainNotes: { cic: 'CIC: customer data extracted from gold layer.', digital: 'Digital owns privacy operations: DSAR triage, extraction, audit.', bss: 'BSS: billing data included in DSAR packs.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'ICO does not accept "we were overwhelmed" as an excuse for missing the 30-day SLA. This platform auto-extracts, auto-routes, and preserves the deadline.',
  },

  // ── Digital: Forecast surge ───────────────────────────────────────────────
  'dig-forecast-surge': {
    intro: 'Campaign launch + NOC incident = 4x chat volume forecast for today 12-17h. Platform auto-published a surge plan to WFM: borrow 18 voice agents, open overflow, pre-warm Cortex Agent capacity. SLA held.',
    beatsByStage: {
      detect: 'Volume forecast: today 12-17 +148% vs baseline. volume_forecast_v3.',
      observe: 'Drivers: 5G Hero +1.2k chats, NOC M14 +800, seasonality −400.',
      hypothesize: 'WFM gap: +18 FTE needed. Voice agent borrow acceptable.',
      plan: 'Borrow 18 voice agents. Open overflow queue. Pre-warm Cortex Agent +30%.',
      act: 'WFM roster updated. Genesys overflow active. Cortex autoscaled.',
      verify: 'P95 wait: 1:42 (SLA 2:00). Zero overflow. No abandons. MAPE: 5.8%.',
      resolved: 'Surge absorbed. SLA preserved. Forecast model logged.',
    },
    domainNotes: { cic: 'CIC: no direct involvement.', digital: 'Digital owns WFM integration and capacity planning.', bss: 'BSS: no involvement.', oss: 'OSS: platform scaling.', noc: 'NOC: incident is a forecast driver.' },
    closing: 'When campaign launch and network incident coincide, your care centre drowns — unless the platform forecasts, plans, and executes the capacity response autonomously.',
  },

  // ── Digital: Identity trust ───────────────────────────────────────────────
  'dig-identity-sim-swap': {
    intro: 'Pre-attack prevention: login attempt, risk 0.94 — geo Coventry→Lisbon in 14 minutes, SIM swap reported at partner MNO 22 minutes ago. Platform challenged with biometric+SMS, blocked the attempt. £1.4k CLV account protected.',
    beatsByStage: {
      detect: 'Login CUST-9824: risk 0.94. ato_risk_v2.4. Geo: Coventry→Lisbon in 14min.',
      observe: 'SIM swap reported at partner MNO 22min ago — anomaly.',
      hypothesize: 'High-CLV account (£1.4k). Synthetic SIM-swap pattern. Step-up mandatory.',
      plan: 'Challenge with biometric+SMS. Hold sensitive transactions. Alert account owner.',
      act: 'Biometric+SMS challenge. Device fingerprint mismatch. BLOCKED.',
      verify: 'ATO blocked. Zero unauthorised actions. Customer re-cleared.',
      resolved: 'Case FRD-2026-7488. Pattern shared with industry trust ring. Pre-attack prevention — before damage.',
    },
    domainNotes: { cic: 'CIC: customer CLV drove the intervention threshold.', digital: 'Digital owns identity: risk scoring, step-up, device fingerprint.', bss: 'BSS: no transactions processed.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'Pre-attack prevention. The fraud was blocked at login — before any transaction, before any damage. That is the shift: from incident response to pre-emptive protection.',
  },

  // ── Digital: Outage comms drafter ─────────────────────────────────────────
  'dig-outage-comms': {
    intro: 'NOC P1 declared. Cortex Complete drafts status page + SMS + in-app + B2B email + Welsh-language variant in 38 seconds. IC approves. Published. Average draft-to-publish: 38 seconds. Human-edit rate: 6 percent.',
    beatsByStage: {
      detect: 'NOC P1 declared (MIM-2026-0413). Trigger to Digital comms-drafter pipeline.',
      observe: 'Cortex Complete reads incident timeline + decision log + customer-impact join.',
      hypothesize: 'Tone safety: Ofcom GC C1 + ASA + Welsh Language Standards — all PASS.',
      plan: 'IC + Comms Lead approval. Serial publish: status → SMS → in-app → email. 15-min cadence.',
      act: 'IC approves. Sinch SMS: 184k. Salesforce MC in-app banner LIVE. Welsh variant published.',
      verify: 'Avg draft→publish: 38 sec. Human-edit rate: 6%. GC A3 30-day queue updated.',
      resolved: 'Comms complete. Zero customer complaints about messaging. GDPR Art.34 satisfied.',
    },
    domainNotes: { cic: 'CIC: customer-impact join determines who gets notified.', digital: 'Digital owns comms drafting, approval workflow, and multi-channel publish.', bss: 'BSS: no billing action.', oss: 'OSS: incident managed separately.', noc: 'NOC: P1 is root cause. Digital handles customer-facing comms.' },
    closing: '38 seconds from incident to drafted comms across 5 channels. 6 percent human-edit rate. When your CEO asks "how fast can we tell customers?" — the answer is 38 seconds.',
  },

  // ── Digital: Coverage conversion ──────────────────────────────────────────
  'dig-coverage-conversion': {
    intro: '14,200 visitors ran the coverage map and bounced. Propensity model on the 5G-area subset: 22 percent will convert with personalised retargeting. Day-7: 1,420 subscribed. LTV/CAC 3.4x.',
    beatsByStage: {
      detect: '14,200 coverage-map visitors this week. 78% bounced before subscribe. £600k/yr at risk.',
      observe: '5,400 in 5G SA areas. 1,400 in 4G-only (no upsell point). Cortex Search: 5G queries dominate.',
      hypothesize: 'Propensity model on 5G cohort: 22% convert with 5G Hero offer.',
      plan: '5G-area: personalised retargeting (paid social + email). 4G: app coverage-update notification.',
      act: 'Salesforce MC + retargeting: 5,400 served. Creative tied to checked postcode.',
      verify: 'Day-7: 1,420 subscribed. 26% conversion on retargeted. CAC £14. LTV/CAC 3.4x.',
      resolved: 'Holdout uplift +18pp. Attributable revenue £612k/yr. Coverage checker → revenue engine.',
    },
    domainNotes: { cic: 'CIC: propensity scored the visitors.', digital: 'Digital owns the retargeting and conversion journey.', bss: 'BSS: new subscriptions activated.', oss: 'OSS: coverage data sourced from OSS network inventory.', noc: 'NOC: no involvement.' },
    closing: 'Coverage checker visitors are the highest-intent prospects you have. This platform converts them at LTV/CAC 3.4x. Not a brochure — a revenue funnel.',
  },

  // ── Digital: Complaint resolution GC C7 ───────────────────────────────────
  'dig-complaint-resolution': {
    intro: '38 complaints at 7 weeks 4 days — 4 days from Ofcom GC C7 deadlock-letter trigger. ADR routing prep required. Platform auto-triaged, drafted final-resolution offers, and closed 100 percent within the 8-week window.',
    beatsByStage: {
      detect: '38 complaints aged 7w4d. 4 days from GC C7 deadlock trigger. ADR prep required.',
      observe: 'AI_AGG over notes: 14 billing, 11 service-quality, 8 contract-dispute, 5 mis-selling.',
      hypothesize: '22 can be resolved with goodwill. 16 require deadlock + ADR signpost.',
      plan: 'Specialist queue. Final-resolution offer for 22. ADR letter pre-loaded for 16.',
      act: 'Salesforce specialist queue. 38 assigned. 7-day SLA.',
      verify: '22 settled (avg £24 goodwill). 16 deadlocked + ADR signposted. 100% within Ofcom window.',
      resolved: 'GC C7 audit: zero SLA breaches. ADR escalations: 16. All closed inside window.',
    },
    domainNotes: { cic: 'CIC: complaint history feeds prioritisation.', digital: 'Digital owns complaint lifecycle and ADR routing.', bss: 'BSS: goodwill credits posted.', oss: 'OSS: service-quality complaints may reference network issues.', noc: 'NOC: no involvement.' },
    closing: 'Eight weeks. Absolute deadline. Breach = Ofcom investigation + potential fine. This platform never misses it — auto-triage, auto-prep, specialist routing.',
  },

  // ── Digital: Social Tariff ────────────────────────────────────────────────
  'dig-social-tariff': {
    intro: 'Ofcom-mandated Social Tariff: 4,200 self-declared interest, DWP cross-check confirms 2,418 eligible, 1,820 onboarded in 7 days. Revenue impact: −£32k/mo. Regulatory compliance + brand sentiment: +12pt. DPIA on file.',
    beatsByStage: {
      detect: '4,200 social-tariff interest. DWP cross-check + credit verification needed.',
      observe: 'DWP match via consented secure-share: 2,418 confirmed eligible.',
      hypothesize: 'Keep line + downgrade to Essential £15/mo. ARPU −£18 but mandate satisfied.',
      plan: 'Outbound to 2,418. In-app one-tap onboarding. Concierge call for vulnerable subset.',
      act: 'Salesforce MC + Sinch: 1,820 onboarded in 7 days.',
      verify: 'Ofcom registration filed. ICO ROPA updated. Gold.social_tariff_onboard audit clean.',
      resolved: '1,820 enrolled. Revenue −£32k/mo. Brand sentiment +12pt. Ongoing 12mo eligibility re-check.',
    },
    domainNotes: { cic: 'CIC: customer eligibility from gold layer.', digital: 'Digital owns the onboarding journey and compliance workflow.', bss: 'BSS: plan downgrade in Amdocs CES.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'Social Tariff is not optional — it is mandated. This platform handles the DWP verification, DPIA compliance, and onboarding at scale. Regulatory obligation met with operational efficiency.',
  },

  // ── Digital: Family controls ──────────────────────────────────────────────
  'dig-family-controls': {
    intro: 'Online Safety Act compliance: 1,420 child accounts identified. Age-verified, controls preset by age band, weekly insights to parents. 942 onboarded in 14 days. Zero safeguarding flags missed.',
    beatsByStage: {
      detect: '4,820 family plans with new sub-line. 1,420 likely child accounts (under-18).',
      observe: 'Online Safety Act + NSPCC framework: age verification via parent-attestation + payment-card check.',
      hypothesize: 'Controls by age: U13 strict (filter+2hr/day). 13-15 balanced. 16-17 open with reporting.',
      plan: 'In-app journey: age picker, controls preset, weekly insights to parent.',
      act: 'Salesforce MC: 1,420 invited. WCAG AA accessible. 942 onboarded in 14 days.',
      verify: 'OSA audit: 100% age-verified. NSPCC queue cleared. 22 escalated to safeguarding.',
      resolved: '942 child accounts protected. Weekly Cortex anomaly check running.',
    },
    domainNotes: { cic: 'CIC: family composition data.', digital: 'Digital owns the onboarding journey and safety classification.', bss: 'BSS: child sub-accounts in Amdocs CES.', oss: 'OSS: content filtering provisioned.', noc: 'NOC: no involvement.' },
    closing: 'The Online Safety Act is not optional. This platform handles age verification, content filtering, and safeguarding at scale — with an audit trail that satisfies Ofcom and NSPCC.',
  },

  // ── Digital: Cookie consent / attribution ─────────────────────────────────
  'dig-cookie-consent': {
    intro: 'Cookie consent fell 78%→60% post ICO crackdown. Downstream: paid-social attribution noise +28%. Platform retrained MMM on 60% consent base, shifted £180k to first-party channels. ROAS recovered 3.2→3.6.',
    beatsByStage: {
      detect: 'Consent rate: 78%→60% in 30 days post ICO. MMM signal degrading.',
      observe: 'TCF 2.2 + UK PECR enforcement. 3rd-party cookie deprecation accelerating.',
      hypothesize: 'MMM rebalance: weight 1st-party up, paid-social down. ROAS variance −0.4→−0.1.',
      plan: 'Retrain MMM. Shift £180k from paid-social to 1st-party email/SMS. CFO sign-off.',
      act: 'MMM retrained. Attribution deployed. Paid-social bids reduced 22%.',
      verify: 'Week-2: ROAS 3.2→3.6. 1st-party uptake +18%. ICO audit green.',
      resolved: 'Privacy-first attribution live. Monthly retraining. gold.consent_inventory in production.',
    },
    domainNotes: { cic: 'CIC: 1st-party conversion signals are consent-immune.', digital: 'Digital owns consent stack, MMM, and attribution retraining.', bss: 'BSS: revenue attribution reconciled.', oss: 'OSS: no involvement.', noc: 'NOC: no involvement.' },
    closing: 'When consent drops, most operators lose attribution accuracy for months. This platform retrained in days and shifted spend to consent-immune channels. Privacy-first is not a limitation — it is a competitive advantage.',
  },

  // ── BSS: Catalog publish ───────────────────────────────────────────────────
  'bss-catalog-publish': {
    intro: 'New tariff going live tonight: 5G SA Unlimited Max, forty-two pounds, bundled with Disney Plus and Roaming Pass EU+US. TMF 620 publish across six channels simultaneously — CAB-approved, rollback-ready, 5 percent holdout from minute one.',
    beatsByStage: { detect: 'Catalog draft: 5G SA Unlimited Max £42. Pricing validated: 41% margin, +£3 vs competitor.', observe: 'CAB window Mon/Wed 02:00-04:00. Standard change template. Six channels ready to receive.', plan: 'Publish to Amdocs CES, distribute via TMF 620 to App, Web, Care, Voice, Retail, Self-service. Time Travel snapshot retained for 90d rollback.', act: 'ServiceNow CHG0013014. CAB auto-approved. Published 02:30. Catalog v124→v125. Six channels confirmed receipt in 90s.', verify: 'Channel sync verified: all six confirmed. Time Travel rollback target v124 if needed.', resolved: 'Tariff live. 5% holdout active. Day-1 attach rate measured at next bill cycle. Zero manual intervention.' },
    domainNotes: { cic: 'New tariff enters NBA model immediately as eligible offer.', digital: 'All digital channels received via TMF 620 push.', bss: 'BSS home: catalog, pricing, CAB governance, multi-channel distribution.', oss: '5G SA provisioning is OSS activation event on subscription.', noc: 'No involvement.' },
    closing: 'One tariff. Six channels. Zero manual touchpoints. Ninety-day rollback. Measurement from minute one. That is governed, automated catalog management.',
  },

  // ── BSS: Billing cycle close ──────────────────────────────────────────────
  'bss-billing-cycle-close': {
    intro: '12.4 million invoices in flight. Monthly cycle close. Platform runs pre-flight reconciliation, flags 4,820 anomalous invoices, evaluates Ofcom auto-compensation, routes disputes — all before a single invoice hits an inbox. Revenue recognised: £298M.',
    beatsByStage: { detect: 'Cycle close: 12.4M invoices. Amdocs CES + Ericsson Charging System. Pre-flight running.', observe: 'Mediation reconciliation 99.93%. Anomaly: 4,820 invoices 25%+ above prior cycle — auto-flagged.', hypothesize: 'Easter roaming cluster correlation. Plus 240 eligible for Ofcom auto-comp from prior 2h+ outage.', plan: 'Hold 4,820 flagged. Auto-credit 240 Ofcom-eligible at £4 each. Route 4,580 to care with explanation templates.', act: 'ServiceNow INC0009127. 4,820 held. 240 credits applied. 4,580 routed to Salesforce care queue. Bill run released for 12.395M.', verify: 'Revenue £298M. Dispute SLA forecast: 94% within 48h. Leakage: 0.07%.', resolved: '240 auto-credits. 4,580 disputes pre-routed. Zero SLA breaches. Anomalies caught BEFORE reaching customers.' },
    domainNotes: { cic: 'CIC: 4,820 bill-shock customers enter retention-risk model.', digital: 'Bill-explanation content served in-app and SMS.', bss: 'BSS home: cycle management, anomaly detection, Ofcom auto-comp, revenue recognition.', oss: 'Interconnect reconciliation validates charged vs provisioned.', noc: 'Prior outage triggering auto-comp was a NOC P1.' },
    closing: '12.4M invoices. £298M revenue. 4,820 complaints prevented before bills reached customers. Proactive BSS — not batch-and-pray.',
  },

  // ── BSS: Live OCS charging · roaming ──────────────────────────────────────
  'bss-charging-roaming': {
    intro: 'Real-time Diameter Gy charging flow: CUST-002 in Spain on a 3GB Roaming Pass. Watch the session lifecycle: initial reserve, periodic updates, 90% threshold warn, hard cap, throttle. Zero leakage, zero bill-shock.',
    beatsByStage: { detect: 'Roaming session: CUST-002 in Spain. Roaming Pass EU active, 3GB cap. OCS validates entitlement.', observe: 'CCR-Initial: reserve 50MB. CCA-Initial OK, session bound to PCRF roaming.eu_pass policy.', plan: 'At 90% (2.7GB): SMS threshold warn via Sinch. At 100%: throttle to 64kbps, bill-shock guard active.', act: '2.7GB consumed — SMS warn dispatched. 3GB reached — hard cap, throttle applied, top-up bundle offered.', verify: 'Session end: CCR-Terminate. Final reconciliation: £0 (all bundled). Zero leakage.', resolved: '3GB session billed accurately. Zero leakage. Bill-shock prevented. Customer informed at every threshold.' },
    domainNotes: { cic: 'CIC: if bill-shock occurred, customer enters retention-risk model.', digital: 'Threshold SMS and top-up offer are Digital channel actions.', bss: 'BSS home: OCS charging, session management, bill-shock prevention.', oss: 'PCRF policy enforcement is OSS-managed.', noc: 'No involvement.' },
    closing: 'Real-time charging with zero leakage and proactive customer communication at every threshold. That is what a modern OCS looks like — not retrospective billing, but live session control.',
  },

  // ── BSS: Dunning recovery ─────────────────────────────────────────────────
  'bss-dunning-recovery': {
    intro: '12,840 accounts at D+30 — service-restricted. Predictive recovery model: 4,180 high-recovery (empathy SMS), 412 vulnerable (soft-path only, case manager). Recovery target: 92% vs 84% baseline. £840k recovered. FCA TCF compliant.',
    beatsByStage: { detect: 'D+30 wave: 12,840 in service-restriction. Traditional approach: threatening letter. Our approach: predictive, personalised, empathetic.', observe: 'Snowpark ML: 4,180 high-recovery, 8,660 standard. Vulnerability (GC C5): 412 flagged soft-path only.', plan: 'Empathy-tone SMS to 4,180. Payment-plan (6mo interest-free) to 1,820 eligible. 412 vulnerable held off-cycle with case manager.', act: 'Salesforce + Sinch: empathy SMS dispatched. 1,820 payment plans sent in-app+email. 412 assigned to trained case managers.', verify: '1,420 paid in full. 920 enrolled in plan. Recovery: 92% vs 84% control. Bad-debt −0.4pp.', resolved: '£840k recovered. 412 vulnerable safely held. Zero GC C5 breaches. FCA TCF: fair outcomes for customers in difficulty.' },
    domainNotes: { cic: 'CIC: dunning customers with churn risk get combined recovery+retention treatment.', digital: 'Empathy SMS and payment-plan journey are Digital channels.', bss: 'BSS home: dunning, collections, payment arrangements, vulnerability-aware recovery.', oss: 'Service restriction/restoration are OSS provisioning states.', noc: 'No involvement.' },
    closing: '92% recovery with empathy outperforming intimidation. £840k collected. 412 vulnerable treated with dignity. Ethical collections at scale.',
  },

  // ── BSS: Revenue assurance · IRSF ────────────────────────────────────────
  'bss-revenue-assurance': {
    intro: 'AISQL flagged £18,420 in suspect premium-rate calls on B2B account — Latvia, São Tomé, Cuba. Classic IRSF. Agent blocked PBX, alerted customer, opened SOC ticket, updated GSMA threat feed — under two minutes. Loss prevented before invoice generated.',
    beatsByStage: { detect: 'AISQL AI_AGG fraud: B2B-9821 premium-rate destinations, score 0.92. £18,420 in 24h.', observe: 'Destinations: Latvia, São Tomé, Cuba — known IRSF sinks. Short-duration, high-frequency, premium termination.', hypothesize: 'IRSF on B2B PBX. SIP credentials likely compromised.', plan: 'Auto-block premium destinations via PCRF. Alert customer security. SOC ticket. GSMA T-ISAC update.', act: 'Block applied. ServiceNow SecOps SEC-INC-2026-0508-014. Customer notified. Cisco SecureX + GSMA updated.', verify: 'Block effective. £18,420 prevented. False-positive rate: 3.1%.', resolved: 'Case contained. Forensic preserved. Customer security uplift recommended. Invoice never generated.' },
    domainNotes: { cic: 'B2B customer flagged for relationship-recovery touchpoint.', digital: 'Secure-channel alert was customer notification.', bss: 'BSS home: revenue assurance, fraud detection, loss prevention.', oss: 'PCRF policy block is OSS-managed.', noc: 'Commercial fraud — BSS with SOC support, not NOC.' },
    closing: '£18,420 prevented in under two minutes. Invoice never generated. Threat intelligence shared with industry. Real-time revenue assurance — not retrospective audit.',
  },

  // ── BSS: Loyalty mission · Spotify ────────────────────────────────────────
  'bss-loyalty-mission': {
    intro: 'Loyalty mission launch: Spotify Premium 3 months for Silver+ tier members with music affinity above 0.5. Cohort: 4.8 million. 41,400 redemptions in the first 60 minutes. Partner-provisioned via SPCS in under 1.4 seconds P95.',
    beatsByStage: { detect: 'Mission launch: Spotify Premium 3mo. 11.2M loyalty members. Tier mix: 4.2M Bronze, 3.8M Silver, 2.6M Gold, 0.6M Platinum.', observe: 'Eligibility: Silver+ AND music-affinity score >0.5 → 4.8M qualified.', plan: 'In-app push + email + biometric opt-in. Partner provisioned via SPCS adapter.', act: 'Salesforce Loyalty: mission live. 4.8M targeted. 41,400 redeemed in first 60 minutes. Spotify partner ACK.', verify: 'Engagement +8pp vs control. NPS +12 vs non-members. ROI 2.1x at 30d.', resolved: '41,400 day-1 redemptions. Partner spend £842k. Platinum invite-only wave follows.' },
    domainNotes: { cic: 'CIC: loyalty engagement reduces churn propensity.', digital: 'In-app modal and push are Digital channels.', bss: 'BSS home: loyalty management, partner provisioning, revenue-share reconciliation.', oss: 'SPCS provisions partner entitlements.', noc: 'No involvement.' },
    closing: 'Forty-one thousand redemptions in sixty minutes. Partner provisioned in 1.4 seconds. That is what a real-time loyalty platform delivers — not points and plastic cards, but instant gratification.',
  },

  // ── BSS: Enterprise onboard ───────────────────────────────────────────────
  'bss-account-onboard': {
    intro: 'Lloyds Banking Group — enterprise tier onboarding. 14-line hierarchy, 580 total lines across 4 BUs, dual-control credit limit at £120k, MSA v3 attached, billing consolidated at parent level. From intake to live in one session.',
    beatsByStage: { detect: 'Account intake: Lloyds Banking Group plc. Enterprise tier. 14-line hierarchy.', observe: 'Experian risk B. Credit limit £120k proposed. Hierarchy: 4 BUs × (240+92+184+64) = 580 lines.', plan: 'Dual-control credit, MSA template, 4 billing accounts, parent-level invoice consolidation.', act: 'Account ACC-7401 created. 4 billing accounts. MSA v3 attached. Credit dual-approved. OPP-3812 instantiated. 580 lines provisioned via TMF 622.', verify: 'ARPU forecast £42.4k/mo. NPS 9. Zero compliance flags.', resolved: 'Account live. gold.accounts + hierarchy + credit_register updated.' },
    domainNotes: { cic: 'CIC: Lloyds enters account-health monitoring immediately.', digital: 'Self-service portal provisioned for account admin.', bss: 'BSS home: account creation, credit management, contract instantiation, hierarchy.', oss: '580 lines provisioned via TMF 622.', noc: 'Once live, priority routing for any Lloyds incident.' },
    closing: 'Enterprise onboarding in one session. 580 lines provisioned. £42.4k/month ARPU. No manual spreadsheets, no 6-week lead time.',
  },

  // ── BSS: Case SLA breach prevention ───────────────────────────────────────
  'bss-case-sla-breach': {
    intro: '42 P1/P2 cases at SLA risk — queue overload after campaign launch. Cortex auto-triage merged 28 duplicates, rerouted 14, published a KB shortcut. SLA preserved in 38 minutes. Zero breaches.',
    beatsByStage: { detect: '42 P1/P2 cases at SLA risk. case_triage_v2.4 anomaly. Queue overload.', observe: 'Driver: 5G Hero launch, billing queries +148% in 4h.', hypothesize: '28 of 42 are billing-query duplicates — auto-merge candidate.', plan: 'Merge duplicates. Borrow 8 specialists from voice. Publish KB shortcut.', act: '28 merged. 14 reassigned to specialist queue. KB live. MTTR 1:48 vs 4:12 baseline.', verify: 'Queue normalised in 38 min. Zero P1 breach. CSAT 0.86.', resolved: 'Case storm contained. Zero SLA breaches. Audit to gold.decision_lineage.' },
    domainNotes: { cic: 'CIC: case storms correlate with churn spikes.', digital: 'KB shortcut deployed as Digital self-service.', bss: 'BSS home: case management, SLA governance, auto-triage.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Forty-two cases at SLA risk. Zero breaches. Resolved in 38 minutes. Intelligent triage beats throwing bodies at the queue.',
  },

  // ── BSS: Cross-channel stitch ─────────────────────────────────────────────
  'bss-interaction-stitch': {
    intro: 'CUST-001 hit five channels in four hours — app, chat, voice, email, retail. Identity graph stitched all into one case. NBA suppressed to avoid fatigue. Three duplicates merged. One resolution.',
    beatsByStage: { detect: '5 channels in 4h. identity_resolution_v3 stitch confidence 0.97.', observe: 'Topic clusters: M14 5G complaint (3 channels), billing query (1), plan upgrade interest (1).', plan: 'Suppress all outbound NBAs for 24h. Feed care brief. Auto-link to NOC fix-window.', act: 'NBA suppressed. Agent desktop briefed. 3 duplicate cases merged into 1.', verify: 'Fatigue avoided. CSAT prediction 0.84. Resolved in next session.', resolved: 'Identity stitch resolved. GDPR Art.6 logged. Customer treated as one person, not five tickets.' },
    domainNotes: { cic: 'CIC: cross-channel behaviour is a churn signal — handled by suppression, not more outreach.', digital: 'Digital channels fed the identity graph.', bss: 'BSS home: interaction management, identity resolution, case deduplication.', oss: 'No involvement.', noc: 'NOC fix-window communicated to customer via care brief.' },
    closing: 'Five channels. One customer. One case. NBA suppressed. The worst thing you can do to a frustrated customer is send them another offer. The platform knows when to stop.',
  },

  // ── BSS: Tier-1 renewal ───────────────────────────────────────────────────
  'bss-renewal-window': {
    intro: 'Lloyds Banking Group renewal in 30 days. Churn risk: 0.62. Drivers: usage −18% QoQ, 4 billing complaints, competitor RFP detected. Agent auto-drafted a save proposal, routed to specialist, CFO sign-off obtained. £1.5M CLV protected.',
    beatsByStage: { detect: 'Lloyds OPP-3812 renewal in 30d. renewal_propensity_v2: churn 0.62.', observe: 'Drivers: usage −18% QoQ, 4 open billing complaints, competitor RFP via Cortex Search.', hypothesize: 'Save plan: price-match (margin 28% holds), add 24/7 SLA, Disney+ for executives.', plan: 'Route to enterprise save desk. Auto-draft proposal. CFO sign-off for SLA upgrade.', act: 'Specialist paged. Cortex Agent drafted proposal v1. CFO approved. Accepted in 4 days.', verify: '36mo renewal at £420k/yr. Margin 31%. Churn 0.62→0.18.', resolved: 'CLV protected £1.5M. gold.contracts + renewal_register updated. CFO audit logged.' },
    domainNotes: { cic: 'CIC surfaced the drift signal (usage decline + complaints).', digital: 'Self-service portal showed Lloyds their SLA metrics.', bss: 'BSS home: pipeline management, renewal forecasting, commercial proposals.', oss: 'SLA upgrade provisioned by OSS.', noc: 'No involvement.' },
    closing: '£14.2M ARR protected. Proposal auto-drafted. CFO approved in 4 days. The agent detected drift 60 days before contract end — not 7 days.',
  },

  // ── BSS: Plan change ──────────────────────────────────────────────────────
  'bss-sub-plan-change': {
    intro: 'CUST-001 upgrades to 5G Unlimited Max in-app. Pro-rata credit calculated, entitlement provisioned, SIM/MSISDN preserved. Zero friction. Four minutes from tap to active.',
    beatsByStage: { detect: 'Plan-change request: CUST-001, "5G Hero Unlimited Max", in-app journey.', observe: 'Eligibility: contract end 21d, margin OK, no vulnerability flag.', plan: 'Keep MSISDN + eSIM. Pro-rata: £14.20 credit. New plan £42/mo from D+1.', act: 'Amdocs CES: plan changed. Pro-rata applied. 5G SA entitlement provisioned via OSS. Confirmation push.', verify: 'Active in 4 minutes. ARPU +£12/mo. Zero fallout.', resolved: 'Plan live. ARPU uplift. Customer journey: 4 minutes, zero friction.' },
    domainNotes: { cic: 'CIC: plan upgrade reduces churn propensity by 8pp.', digital: 'In-app journey — zero care involvement.', bss: 'BSS home: subscription management, pro-rata, entitlement.', oss: '5G SA activation is OSS provisioning.', noc: 'No involvement.' },
    closing: 'Four minutes from intent to active. Pro-rata handled. Entitlement provisioned. That is what frictionless commercial execution looks like.',
  },

  // ── BSS: Mediation suspense ───────────────────────────────────────────────
  'bss-mediation-suspense-spike': {
    intro: 'Mediation suspense spiked: 14,200 CDRs unrated in 30 minutes vs baseline 240. Root cause: new partner interconnect with an unmapped B-number range. Auto-recovered by enrichment rule injection. Zero revenue leakage.',
    beatsByStage: { detect: '14,200 CDRs in suspense in 30 min vs 240 baseline. Mediation anomaly.', observe: 'Root cause: new interconnect partner, unmapped B-number range 44207xxxxx.', hypothesize: 'Enrichment rule missing for new range. Auto-inject from gold.interconnect_catalog.', plan: 'Inject rate rule. Re-process 14,200. Validate against known rates.', act: 'Rule injected. 14,200 re-rated in 4 minutes. All matched expected tariff.', verify: 'Suspense cleared. Zero revenue leakage. New rule permanent.', resolved: 'Auto-recovery complete. No manual intervention. gold.mediation_rules updated.' },
    domainNotes: { cic: 'No customer impact.', digital: 'No involvement.', bss: 'BSS home: mediation, rating, suspense management.', oss: 'Interconnect routing is OSS-managed.', noc: 'No involvement.' },
    closing: 'Fourteen thousand CDRs un-rated, auto-recovered in four minutes. Zero leakage. The platform self-heals mediation errors faster than a human notices them.',
  },

  // ── BSS: Bill-run CYCLE-04 ────────────────────────────────────────────────
  'bss-bill-run-cycle04': {
    intro: 'CYCLE-04 month-end: 3.1M invoices. Pre-flight validation caught 412 suspect credits and 28 negative-balance anomalies. Held, investigated, cleared — bill run released clean. Revenue: £74.2M.',
    beatsByStage: { detect: 'CYCLE-04 initiated. 3.1M invoices in pre-flight.', observe: 'Validation: 412 suspect credits (>£100), 28 negative-balance accounts.', hypothesize: 'Suspect credits: 380 legitimate (bulk goodwill from campaign), 32 duplicates.', plan: 'Hold 32 duplicates. Clear 380 legitimate. Investigate 28 negative-balance.', act: '32 duplicates reversed. 28 negatives: 24 cleared (payment timing), 4 escalated. Bill run released.', verify: 'Revenue £74.2M. Leakage: 0.03%. Zero customer-visible errors.', resolved: 'Cycle closed clean. Finance team receives reconciliation at 06:00.' },
    domainNotes: { cic: 'No customer impact.', digital: 'No involvement.', bss: 'BSS home: bill-run management, pre-flight validation, revenue assurance.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Three point one million invoices validated and released clean. Thirty-two duplicate credits caught before posting. That is bill-run governance at scale.',
  },

  // ── BSS: Port-in burst ────────────────────────────────────────────────────
  'bss-port-in-burst': {
    intro: '240 port-in requests in 15 minutes — a flash-sale cohort from a competitor. Platform auto-scaled provisioning, validated each against the number-portability database, and activated 238 within the 2-hour Ofcom PAC window.',
    beatsByStage: { detect: '240 port-in requests in 15 min. Flash-sale driven burst.', observe: 'Validation: all 240 checked against NP database. 238 valid, 2 disputed (active contract).', plan: 'Auto-scale provisioning pipeline. Priority queue for the burst. 2 disputed held for manual resolution.', act: '238 ported and activated within 90 minutes. eSIM profiles provisioned. 2 disputed escalated.', verify: 'All 238 active. Zero PAC window breaches. Ofcom compliance confirmed.', resolved: '238 new customers onboarded in 90 minutes. Revenue: £9.5k/mo ARPU. Zero Ofcom breaches.' },
    domainNotes: { cic: 'CIC: new port-in customers enter welcome journey and early-life monitoring.', digital: 'Welcome SMS and app-onboarding journey dispatched.', bss: 'BSS home: number portability, provisioning orchestration.', oss: 'eSIM provisioning and NP database managed by OSS.', noc: 'No involvement.' },
    closing: '240 port-ins processed in 90 minutes. Ofcom PAC window met. Provisioning auto-scaled. When acquisition spikes, your BSS must scale with it.',
  },

  // ── BSS: Quote-to-Order B2B ───────────────────────────────────────────────
  'bss-quote-b2b-fast-track': {
    intro: 'B2B fast-track: Lloyds requested a 40-line expansion. Quote generated in 90 seconds using the existing MSA terms. Order instantiated. Provisioning triggered. Sales cycle: 4 hours vs 14-day industry average.',
    beatsByStage: { detect: 'Lloyds expansion request: +40 lines to existing 580-line estate.', observe: 'Existing MSA v3 terms apply. Credit headroom: £38k remaining. Volume discount tier unchanged.', plan: 'Auto-generate quote from existing terms. No new approval needed — within delegated authority.', act: 'Quote generated in 90s. Customer accepted via self-service portal. Order instantiated. TMF 622 provisioning triggered.', verify: '40 lines provisioned in 4 hours. Revenue: +£1.7k/mo.', resolved: 'Expansion live. 4 hours from request to active. gold.contracts updated.' },
    domainNotes: { cic: 'CIC: expansion reinforces account health score.', digital: 'Self-service portal enabled customer self-approval.', bss: 'BSS home: quote-to-order, commercial terms, delegated authority.', oss: 'TMF 622 provisioning.', noc: 'No involvement.' },
    closing: 'Four hours from request to 40 lines active. Industry average: 14 days. When your commercial systems are pre-configured, expansion is just a click.',
  },

  // ── BSS: Dispute resolution ───────────────────────────────────────────────
  'bss-dispute-bill-shock': {
    intro: 'Billing dispute: customer challenged a £142 roaming charge. Platform auto-pulled the CDR evidence, validated against the Roaming Pass terms, and generated a resolution recommendation — credit £42 (partial), retain £100 (valid usage). GL impact calculated before agent picks up the phone.',
    beatsByStage: { detect: 'Dispute filed: CUST-002, £142 roaming charge challenged.', observe: 'CDR evidence: 3.2GB non-EU data in Turkey. Roaming Pass covers EU only. Turkey = valid out-of-bundle rate.', hypothesize: 'Partial credit: first 500MB was within EU (Spain transit) = £42 credit. Remaining £100 valid.', plan: 'Recommendation: credit £42, retain £100 with CDR evidence pack. GL impact: −£42 from roaming_revenue.', act: 'Agent presented evidence to customer. £42 credit accepted. Dispute closed. GL adjustment posted.', verify: 'Resolution in 1 interaction. CSAT 0.78. No escalation.', resolved: 'Dispute resolved fairly. CDR evidence provided. GL balanced. Audit trail preserved.' },
    domainNotes: { cic: 'CIC: dispute resolution is a retention moment. Fair resolution preserves trust.', digital: 'CDR evidence rendered in customer-facing self-service.', bss: 'BSS home: dispute management, CDR evidence, GL impact calculation.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Fair resolution with evidence. Not blanket-credit (which trains bad behaviour) and not blanket-reject (which drives churn). Partial credit backed by CDR proof.',
  },

  // ── BSS: Revenue Recognition quarter close ────────────────────────────────
  'bss-revrec-quarter-close': {
    intro: 'Quarter-end revenue recognition: £894M. IFRS 15 five-step model applied across all performance obligations. 14 exceptions identified and resolved before the auditor arrives. Clean close in 4 hours.',
    beatsByStage: { detect: 'Quarter close initiated. Revenue recognition run across all contracts.', observe: 'IFRS 15 applied: identify contracts, identify POs, determine prices, allocate, recognise. 14 exceptions flagged.', hypothesize: '8 exceptions: contract modification mid-quarter. 4: variable consideration re-estimate. 2: principal-vs-agent classification.', plan: 'Auto-resolve 8 modifications (amendment accounting). Re-estimate 4. Escalate 2 P-v-A to finance.', act: '12 resolved automatically. 2 P-v-A resolved by finance in 2 hours. All 14 cleared.', verify: 'Revenue: £894M. Zero audit findings anticipated. SOX control evidence generated.', resolved: 'Clean quarter close. 4 hours. Zero manual journal entries. Audit-ready.' },
    domainNotes: { cic: 'No customer impact.', digital: 'No involvement.', bss: 'BSS home: revenue recognition, IFRS 15, contract accounting.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Eight hundred and ninety-four million recognised. Fourteen exceptions resolved in four hours. SOX evidence auto-generated. That is what autonomous finance close looks like.',
  },

  // ── BSS: HMRC MTD VAT ─────────────────────────────────────────────────────
  'bss-vat-mtd-submit': {
    intro: 'HMRC Making Tax Digital: quarterly VAT return. Platform auto-extracted from GL, applied UK domestic reverse-charge rules, validated against digital-services cross-border rates, and submitted via MTD API. £18.4M VAT liability. Zero manual intervention.',
    beatsByStage: { detect: 'MTD VAT return due. Quarter-end extraction triggered.', observe: 'GL extraction: £18.4M output VAT, £4.2M input VAT. Net: £14.2M payable.', plan: 'Apply domestic reverse-charge for B2B digital services. Cross-border validation for EU/non-EU.', act: 'MTD API submission. HMRC acknowledgement received. Payment instruction generated.', verify: 'Reconciliation: GL to return = zero variance. Audit trail preserved.', resolved: 'VAT submitted. £14.2M payable. Zero manual intervention. HMRC compliant.' },
    domainNotes: { cic: 'No involvement.', digital: 'No involvement.', bss: 'BSS home: tax management, MTD compliance, GL extraction.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'HMRC MTD compliance: automatic extraction, automatic rules, automatic submission. Zero accountant hours. Zero errors.',
  },

  // ── BSS: GL period close ──────────────────────────────────────────────────
  'bss-gl-period-close': {
    intro: 'General Ledger period close: 14 exceptions identified by the reconciliation engine. Platform auto-cleared 11 (timing differences), escalated 3 genuine mismatches. Period closed in 2 hours vs 2-day manual process.',
    beatsByStage: { detect: 'GL period close initiated. Reconciliation engine running.', observe: '14 exceptions: 11 timing (inter-company postings in transit), 3 genuine mismatches.', plan: 'Auto-clear 11 timing. Escalate 3 to finance with evidence packs.', act: '11 cleared. 3 investigated: 2 = late posting (cleared), 1 = duplicate reversal (corrected). Period closed.', verify: 'All 14 resolved. Zero open items. Trial balance clean.', resolved: 'Period closed in 2 hours. Finance team received clean TB at 08:00.' },
    domainNotes: { cic: 'No involvement.', digital: 'No involvement.', bss: 'BSS home: GL management, reconciliation, period close.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Fourteen exceptions. Two hours. Zero manual journal entries. Period close is a governance event — not a two-day fire drill.',
  },

  // ── BSS: Wholesale MVNO month close ───────────────────────────────────────
  'bss-wholesale-month-close': {
    intro: 'MVNO wholesale settlement: 4 MVNO partners, 2.4M transactions, £18.6M in wholesale revenue. Reconciled, rated, invoiced, and dispute-window opened — all within 48 hours of month-end.',
    beatsByStage: { detect: 'Month-end: MVNO wholesale settlement triggered for 4 partners.', observe: '2.4M CDRs across 4 MVNOs. Rating applied per wholesale agreement terms.', plan: 'Rate, reconcile against partner-reported volumes, generate invoices, open 14-day dispute window.', act: 'Invoices generated: Partner A £8.2M, B £5.4M, C £3.1M, D £1.9M. Dispute portal opened.', verify: 'Reconciliation variance: 0.04% (within tolerance). Zero disputes in first 48h.', resolved: '£18.6M invoiced. 0.04% variance. Dispute window live. Partner relationships preserved.' },
    domainNotes: { cic: 'No direct involvement.', digital: 'Partner self-service portal for dispute management.', bss: 'BSS home: wholesale rating, settlement, partner invoicing.', oss: 'CDR mediation feeds wholesale rating.', noc: 'No involvement.' },
    closing: '2.4 million transactions. Four partners. £18.6M. Reconciled within 48 hours. When wholesale is automated, partner disputes drop to near-zero.',
  },

  // ── BSS: Settlement Spain TAP3 ────────────────────────────────────────────
  'bss-settlement-spain': {
    intro: 'Inter-operator roaming settlement: Spain TAP3 file mismatch — partner reported 14,200 events, we reported 13,840. Delta: 360 CDRs. Platform auto-reconciled against raw Diameter records, identified the gap (timezone edge case), and resolved without a formal dispute.',
    beatsByStage: { detect: 'TAP3 mismatch: Spain partner reports 14,200 events vs our 13,840. Delta: 360.', observe: 'Diameter Gy raw records pulled. 360 CDRs straddled midnight UTC — timezone conversion edge case.', hypothesize: 'Timezone-boundary CDRs rated on different calendar days. Not fraud — timing artefact.', plan: 'Re-rate 360 with timezone correction. Reconcile. Notify partner of resolution.', act: '360 re-rated. Delta resolved. Partner notified via GSMA settlement portal.', verify: 'Reconciliation: zero delta. No formal dispute opened. Relationship preserved.', resolved: 'TAP3 mismatch resolved in 4 hours. Zero financial impact. Partner relationship intact.' },
    domainNotes: { cic: 'No involvement.', digital: 'No involvement.', bss: 'BSS home: inter-operator settlement, TAP3, timezone reconciliation.', oss: 'Diameter raw records sourced from OSS.', noc: 'No involvement.' },
    closing: 'A 360-CDR mismatch that would have become a 30-day formal dispute was resolved in 4 hours by automated root-cause analysis. Settlement disputes are expensive — prevention is cheap.',
  },

  // ── BSS: Promo stacking conflict ──────────────────────────────────────────
  'bss-promo-stacking-conflict': {
    intro: 'Promotions engine detected a stacking conflict: a customer qualified for both "5G Hero £5 credit" and "Loyalty 10GB boost" — but policy allows only one active promotion. Platform auto-resolved by ranking NPV contribution and applying the higher-value offer.',
    beatsByStage: { detect: 'Stacking conflict: CUST-001 qualified for 2 promotions simultaneously.', observe: 'Policy: max 1 active promo per customer. Conflict resolution needed.', hypothesize: '5G Hero £5 credit: NPV £42. Loyalty 10GB boost: NPV £28. Rank by NPV.', plan: 'Apply 5G Hero (higher NPV). Suppress Loyalty boost. Queue for next eligibility window.', act: '5G Hero applied. Loyalty boost queued for next cycle. Customer sees one clean offer.', verify: 'Zero stacking. Customer not confused by double-offer. Margin preserved.', resolved: 'Conflict auto-resolved. Zero manual intervention. Policy enforced cleanly.' },
    domainNotes: { cic: 'CIC: stacking conflicts degrade customer experience.', digital: 'Customer sees one clean offer, not two conflicting ones.', bss: 'BSS home: promotions management, conflict resolution, NPV ranking.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Promotion stacking destroys margin and confuses customers. This platform enforces policy automatically — rank by NPV, apply the winner, queue the rest.',
  },

  // ── BSS: Bill-shock prevention ────────────────────────────────────────────
  'bss-bill-shock-prevent': {
    intro: '18,400 customers forecast to experience bill-shock next cycle — roaming, overage, or plan-change pro-rata. Platform pre-notified each with a personalised explanation before the bill arrives. Complaint calls prevented: estimated 2,400.',
    beatsByStage: { detect: 'Bill-shock forecast model: 18,400 customers will see >25% increase next bill.', observe: 'Drivers: 8,200 roaming, 6,400 overage, 3,800 plan-change pro-rata.', plan: 'Pre-notification: personalised explanation per driver. Roaming = "here is why". Overage = "you used X". Pro-rata = "you changed on day Y".', act: 'Salesforce MC + Sinch: 18,400 pre-notifications sent 7 days before bill.', verify: 'Predicted complaint reduction: 2,400 calls avoided (£42 each = £101k savings).', resolved: 'Bill-shock cohort pre-notified. Customer expectations set before the bill arrives.' },
    domainNotes: { cic: 'CIC: bill-shock is a top-3 churn driver. Pre-notification reduces risk.', digital: 'Pre-notification via push, email, SMS.', bss: 'BSS home: bill-shock detection, pre-notification, complaint prevention.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: '18,400 customers warned before their bill arrives. 2,400 complaints prevented. £101k in care cost avoided. The cheapest complaint is the one that never happens.',
  },

  // ── BSS: IFRS 9 ECL ──────────────────────────────────────────────────────
  'bss-ecl-period-close': {
    intro: 'IFRS 9 Expected Credit Loss provision: quarterly re-calculation across 12.4M receivables. Model re-estimated probability of default, loss-given-default, and exposure. Provision: £14.2M. Audit evidence auto-generated.',
    beatsByStage: { detect: 'Quarter-end: ECL provision re-calculation triggered.', observe: '12.4M receivables. PD model refreshed on latest payment behaviour. LGD from historical write-off rates.', plan: 'Stage allocation: Stage 1 (performing), Stage 2 (deteriorating), Stage 3 (defaulted). Calculate ECL per stage.', act: 'Provision calculated: £14.2M (Stage 1 £8.4M, Stage 2 £4.1M, Stage 3 £1.7M). GL posted.', verify: 'Model validation: back-test within 5% tolerance. Audit evidence: model version, inputs, outputs.', resolved: 'ECL provision posted. £14.2M. Audit-ready. Zero manual calculation.' },
    domainNotes: { cic: 'No involvement.', digital: 'No involvement.', bss: 'BSS home: credit-risk provisioning, IFRS 9, model governance.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'IFRS 9 ECL: automated model refresh, stage allocation, and provision posting. Auditor receives the evidence pack, not a spreadsheet.',
  },

  // ── BSS: Order fallout prevention ─────────────────────────────────────────
  'bss-fallout-prevented': {
    intro: '248 orders stuck at stage 3 of 4 — address-validation failure. Platform auto-enriched addresses from Royal Mail PAF, retried validation, and pushed 241 through. Seven genuine failures escalated. Zero customer-visible delay.',
    beatsByStage: { detect: '248 orders stuck at stage 3. address_validation_v2 failure spike.', observe: 'Root cause: Royal Mail PAF update introduced new postcode format. Validation rules stale.', hypothesize: 'Auto-enrich from PAF refresh. Retry validation. Escalate genuine mismatches.', plan: 'PAF refresh applied. 248 retried. Escalate any that still fail.', act: '241 passed on retry. 7 genuine: address does not exist (new-builds not yet in PAF). Escalated.', verify: 'Zero customer-visible delay on 241. 7 escalated within SLA.', resolved: 'Fallout cleared. Validation rules updated permanently. Self-healing order pipeline.' },
    domainNotes: { cic: 'CIC: order fallout drives early-life churn.', digital: 'Customer journey uninterrupted for 241.', bss: 'BSS home: order management, validation, fallout recovery.', oss: 'Address validation interfaces with OSS provisioning.', noc: 'No involvement.' },
    closing: '248 orders saved from fallout. Self-healing pipeline: detect failure pattern, enrich data, retry, clear. Zero customer delay.',
  },

  // ── BSS: Cross-sell Disney+ ───────────────────────────────────────────────
  'bss-cross-sell-fired': {
    intro: '12,400 Disney+ bundles attached this month via NBA cross-sell at point-of-interaction. Revenue: £750k margin-share ARR. Churn on attached cohort: minus 6.4pp. The bundle that pays for itself in retention.',
    beatsByStage: { detect: 'Monthly cross-sell report: 12,400 Disney+ attaches via NBA at care/upgrade/renewal moments.', observe: 'Revenue: £750k/yr margin-share. ARPU +£5.10/mo per attached customer.', plan: 'NBA fired at point of interaction: care resolution, plan upgrade, or renewal. Not batch — contextual.', act: 'Salesforce + in-app: 12,400 attached across all touchpoints. SPCS provisioning <1.4s.', verify: 'Churn on attached cohort: −6.4pp vs non-attached. Revenue: £750k ARR.', resolved: '12,400 attached. £750k ARR. Churn reduced. The cross-sell that is also a retention tool.' },
    domainNotes: { cic: 'CIC: attachment reduces churn propensity by 6.4pp — measured via holdout.', digital: 'Digital: in-app and push channels for the offer.', bss: 'BSS home: cross-sell management, partner revenue-share, ARR tracking.', oss: 'SPCS provisioning.', noc: 'No involvement.' },
    closing: '£750k ARR from cross-sell. Minus 6.4pp churn on attached customers. A bundle that generates revenue AND reduces churn — the BSS metrics and CIC metrics both improve.',
  },

  // ── BSS: Bill anomaly explained ───────────────────────────────────────────
  'bss-explain-bill-spike': {
    intro: 'Enterprise account ACC-7401 queried a £14k invoice spike. Cortex Analyst generated a natural-language explanation in 8 seconds: "42 new lines provisioned mid-month × pro-rata = £14.2k delta." Query resolved without a human.',
    beatsByStage: { detect: 'Query: ACC-7401 (Lloyds) flagged £14k increase vs prior month.', observe: 'Cortex Analyst: text-to-SQL on billing data. Root cause: 42 new lines provisioned on day 12.', hypothesize: 'Pro-rata: 42 lines × £42/mo × 19/30 days = £14.2k. Matches invoice delta.', plan: 'Generate NL explanation. Attach CDR evidence. Route to self-service.', act: 'NL explanation generated in 8s. Sent via account portal. No human involved.', verify: 'Customer acknowledged. Query closed. Zero escalation.', resolved: 'Bill spike explained automatically. 8 seconds. Zero human cost.' },
    domainNotes: { cic: 'CIC: unexplained bill spikes drive NPS erosion.', digital: 'NL explanation surfaced in self-service portal.', bss: 'BSS home: bill inquiry, Cortex Analyst, automated explanation.', oss: 'Provisioning dates sourced from OSS.', noc: 'No involvement.' },
    closing: 'Eight seconds to explain a £14k spike in natural language. No call centre, no email thread, no 3-day wait. Cortex Analyst on billing data.',
  },

  // ── BSS: FCA Consumer Duty ────────────────────────────────────────────────
  'bss-fca-consumer-duty': {
    intro: 'FCA Consumer Duty foreseeable-harm sweep: 1,840 customers identified where product design may cause harm — high-data plans sold to low-data users, insurance add-ons with exclusions matching customer profile. Platform generated remediation recommendations.',
    beatsByStage: { detect: 'FCA Consumer Duty sweep triggered. Foreseeable-harm model ran across product portfolio.', observe: '1,840 flagged: 1,200 over-provisioned (high plan, low usage), 640 insurance-mismatch.', hypothesize: '1,200: recommend plan downgrade (save customer £8/mo). 640: recommend exclusion-aware re-quote.', plan: 'Generate remediation: proactive plan-right for 1,200, re-quote for 640. Route to specialist.', act: '1,200 plan-right offers dispatched (customer saves £8/mo). 640 re-quotes generated.', verify: '820 accepted downgrade. 412 re-quoted. Zero FCA complaints. Duty evidence filed.', resolved: 'Foreseeable harm mitigated. Revenue impact: −£6.5k/mo. FCA compliance: proven. Brand trust: preserved.' },
    domainNotes: { cic: 'CIC: Consumer Duty compliance reduces regulatory risk on the entire base.', digital: 'Plan-right offers delivered via in-app and email.', bss: 'BSS home: Consumer Duty compliance, product suitability, harm prevention.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'FCA Consumer Duty is not a checkbox — it is a continuous obligation to prevent foreseeable harm. This platform identifies it, quantifies it, and remediates it proactively.',
  },

  // ── BSS: Acquisition fraud ────────────────────────────────────────────────
  'bss-acquisition-fraud': {
    intro: 'Acquisition fraud at signup: 18 synthetic identities caught by the BSS-side fraud model before account creation. Device financing exposure: £24k prevented. SIM provisioning held. Evidence preserved for law enforcement.',
    beatsByStage: { detect: '18 signups flagged: synthetic_id_v1.3 score >0.85. Device financing applications attached.', observe: 'Pattern: same employer, same income band, consecutive addresses. Handset orders: iPhone 15 Pro × 18 = £24k exposure.', hypothesize: 'Synthetic-identity ring targeting device financing. Credit applications fraudulent.', plan: 'Hold device dispatch. Decline financing. Preserve evidence. Report to CIFAS.', act: '18 applications declined. Zero devices dispatched. Evidence pack filed. CIFAS marker applied.', verify: '£24k loss prevented. Zero false-declines (checked against legitimate applicants in same batch).', resolved: 'Acquisition fraud blocked at BSS gate. No devices lost. CIFAS database updated.' },
    domainNotes: { cic: 'No legitimate accounts created.', digital: 'Digital-side model flagged first; BSS confirmed at credit check.', bss: 'BSS home: credit decisioning, fraud prevention, CIFAS reporting.', oss: 'No SIMs provisioned. No devices dispatched.', noc: 'No involvement.' },
    closing: '£24k in device fraud prevented before a single handset left the warehouse. Synthetic identity blocked at the credit gate, not after the loss.',
  },

  // ── BSS: Tariff retirement ────────────────────────────────────────────────
  'bss-tariff-retirement': {
    intro: 'Tariff retirement: 240,000 customers on legacy "Unlimited Lite" moving to current plans. Ofcom GC C1.5 requires best-tariff notification. Platform generated personalised recommendations, communicated at scale, and migrated 218,000 within policy. £2.4M ARPU uplift.',
    beatsByStage: { detect: 'Legacy tariff "Unlimited Lite" scheduled for retirement. 240k affected.', observe: 'Ofcom GC C1.5: must notify customers of better-value alternatives. Must not increase price without consent.', hypothesize: 'Per-customer recommendation: 180k → same-price-more-data, 40k → upgrade path, 20k → retain (already best value).', plan: 'Notify all 240k. Offer recommendations. Auto-migrate consenting customers. Hold non-responders for 60 days.', act: 'Salesforce MC: 240k notified. 218k accepted recommendation. 22k non-responders held.', verify: 'GC C1.5 audit: 100% notified, 100% offered alternatives. Revenue: +£2.4M ARPU uplift. Zero complaints.', resolved: '218k migrated. £2.4M uplift. Ofcom-compliant. 22k held for follow-up cycle.' },
    domainNotes: { cic: 'CIC: tariff retirement is a churn-risk moment. Personalised recommendations reduce defection.', digital: 'Multi-channel notification: email, SMS, in-app.', bss: 'BSS home: tariff lifecycle, mass migration, regulatory notification.', oss: 'No provisioning change for same-price migrations.', noc: 'No involvement.' },
    closing: '240,000 customers migrated compliantly. £2.4M ARPU uplift. Zero Ofcom complaints. When you retire a tariff the right way, it is a revenue event — not a churn event.',
  },

  // ── BSS: Commission clawback ──────────────────────────────────────────────
  'bss-commission-clawback': {
    intro: 'Early-churn cohort: 412 customers churned within 90 days of acquisition. Commission clawback triggered against 8 dealers. Total recovery: £38k. Dealer scorecard updated. Pattern analysis identified one outlier dealer for investigation.',
    beatsByStage: { detect: '412 early-churn (<90d) detected in quarterly dealer reconciliation.', observe: 'Mapped to 8 dealers. One dealer: 142 of 412 (34%) — statistically anomalous.', hypothesize: 'Outlier dealer likely mis-selling or incentivised churn-and-replace.', plan: 'Trigger clawback per dealer agreement. Flag outlier for investigation. Update scorecard.', act: '£38k clawback triggered. Dealer A investigated. Scorecard updated: Dealer A dropped from Gold to Bronze.', verify: 'Clawback collected. Dealer A under review. Pattern will be monitored next quarter.', resolved: '£38k recovered. Bad actor identified. Scorecard updated. Commission integrity preserved.' },
    domainNotes: { cic: 'CIC: early-churn customers re-enter win-back model.', digital: 'No involvement.', bss: 'BSS home: commission management, dealer scorecards, clawback.', oss: 'No involvement.', noc: 'No involvement.' },
    closing: 'Commission clawback is not punitive — it is integrity. When one dealer drives 34 percent of early churn, the platform catches it and acts.',
  },

  // ── BSS: Device financing ─────────────────────────────────────────────────
  'bss-device-financing': {
    intro: 'Device financing: 24-month handset on credit. Consumer Credit Act Section 75 compliance. Platform runs affordability check, generates pre-contract credit information, and provisions the device — all within the in-app journey. FCA-regulated, audit-ready.',
    beatsByStage: { detect: 'Device financing application: CUST-004, iPhone 15 Pro, £48/mo × 24 = £1,152.', observe: 'Affordability: Experian score + disposable income check. Result: affordable at DTI 22%.', plan: 'Generate SECCI (pre-contract credit info). Present in-app. Capture e-signature. Provision.', act: 'SECCI presented. Customer signed. Device dispatched. Credit agreement activated in Amdocs CES.', verify: 'FCA compliance: SECCI provided, cooling-off window active, Section 75 rights attached.', resolved: 'Device financed. £48/mo for 24 months. FCA-compliant. Audit-ready from day one.' },
    domainNotes: { cic: 'CIC: device financing customers have 12% higher retention at 24mo.', digital: 'In-app journey: affordability, SECCI, e-signature.', bss: 'BSS home: consumer credit, affordability, FCA compliance.', oss: 'Device dispatch and SIM pairing.', noc: 'No involvement.' },
    closing: 'Consumer credit in-app with full FCA compliance: affordability check, pre-contract info, e-signature, cooling-off rights. Not a bolt-on — built into the journey.',
  },

  // ── BSS: Revenue leakage ──────────────────────────────────────────────────
  'bss-revenue-leakage': {
    intro: 'Revenue leakage sweep: platform identified £420k/year in unbilled add-ons (entitlement active, billing event missing) plus £180k in expired promos still discounting. Total leakage: £600k/year. Auto-corrected.',
    beatsByStage: { detect: 'Quarterly leakage sweep: compare active entitlements vs billed events.', observe: '£420k: add-ons provisioned but unbilled (integration gap). £180k: promotions expired but discount still applying.', hypothesize: 'Add-on gap: TMF 638 event not reaching billing. Promo gap: end-date not triggering rate-plan revert.', plan: 'Fix integration: replay missed events. Revert expired promos. Bill prospectively (not retrospectively — customer goodwill).', act: 'Integration fixed. 4,200 add-ons now billing. 2,180 promos reverted. Prospective only.', verify: '£600k/year leakage closed. Zero retrospective charges. Zero customer complaints.', resolved: 'Leakage plugged. £600k recovered annually. Root cause fixed permanently.' },
    domainNotes: { cic: 'CIC: no customer impact — prospective billing only.', digital: 'No involvement.', bss: 'BSS home: revenue assurance, leakage detection, entitlement-vs-billing reconciliation.', oss: 'Integration gap was between OSS provisioning and BSS billing.', noc: 'No involvement.' },
    closing: '£600k per year leaking through integration gaps and stale promotions. Found in one sweep. Fixed permanently. Revenue assurance is not a one-time audit — it is a continuous reconciliation.',
  },

  // ── OSS: Field dispatch Liverpool ─────────────────────────────────────────
  'oss-field-dispatch-liverpool': {
    intro: 'Liverpool L1 — thermal alarm on Ericsson Radio 4480. Board temp 78°C. Fan-controller auto-recovery predicted at 94% confidence from three prior incidents. Agent decides: hold comms, dispatch technician, let hardware self-heal. Zero customer impact.',
    beatsByStage: { detect: 'Board temp 78°C — above 72° threshold. EnergyController auto-throttled to 70% PRB cap. 88% capacity preserved.', observe: 'Three prior incidents on this gNB matched. All resolved by fan-controller auto-recovery per Ericsson TSB-2024-117.', hypothesize: 'Intermittent fan-controller, same signature. Auto-recovery predicted on cycle 6 of 6.', plan: 'Do NOT communicate to customers. Hold throttle. Dispatch Salesforce Field Service tech. Queue maintenance restart 02:00-03:00.', act: 'Tech dispatched ETA 45min. Maintenance window booked. Fan auto-recovered on cycle 6 — as predicted. Throttle releasing.', verify: 'Throttle released in 10% steps. Downlink 128 Mbps. Zero customer impact.', resolved: 'MTTR-mitigation 4m12s. Zero customer comms. Agent value: deciding NOT to act.' },
    domainNotes: { cic: 'CIC: nothing surfaced. CLV protected ~£18.2k. Decision to NOT communicate is as important as communicating.', digital: 'No push, no SMS — by design. 88% capacity preserved.', bss: 'No credits. Service maintained.', oss: 'OSS home: field dispatch, thermal management, maintenance scheduling.', noc: 'Calm scenario. Agent decides NOT to fire comms.' },
    closing: 'Not every incident needs a response. Single-site, soft impact, auto-recovery predicted. The right answer: send a tech, hold the comms, let the hardware recover.',
  },

  // ── OSS: Capacity what-if ─────────────────────────────────────────────────
  'oss-capacity-whatif': {
    intro: 'Manchester M14 — third congestion event in twelve months. Digital twin running a what-if: add secondary carrier n1, predict +35% capacity, cost £140k, ROI 2.4x over 36 months. Business case auto-generated for the CFO.',
    beatsByStage: { detect: 'Recurring pattern: M14, three PRB congestion events in 12 months. MLB offset is a sticking plaster.', observe: 'Digital twin loaded: 7 cells, current spectrum, subscriber density, traffic forecast. Peak-hour demand exceeds capacity by 22%.', hypothesize: 'What-if: secondary carrier n1 (2100 MHz) on 7 cells. Predicted: +35% capacity. Cost: £140k. Payback: 14 months.', plan: 'Generate CFO business case: traffic forecast (Snowpark ML), cost model (vendor catalog), churn-cost-avoidance (CIC).', act: 'Business case auto-generated. ServiceNow CHG0013021 for CAB. Ericsson ENM config pre-staged. ROI: 2.4x / 36mo.', verify: 'Simulation validated against 3 comparable deployments. Predicted vs actual: within 4%.', resolved: 'Investment case filed. If approved, deployment in 4 weeks. Recurring events eliminated.' },
    domainNotes: { cic: 'CIC: churn-cost-avoidance figure feeds the business case — CLV at risk per M14 event.', digital: 'No direct involvement.', bss: 'Capex request flows through investment-approval. ROI includes ARPU protection.', oss: 'OSS home: capacity planning, digital twin, what-if simulation, investment case.', noc: 'Once deployed, eliminates recurring M14 firefighting.' },
    closing: 'Digital twin. What-if simulation. Auto-generated business case. 14-month payback at 2.4x ROI. The CFO sees a revenue-protection investment, not a technical request.',
  },

  // ── OSS: Energy-save · NYK rural site ─────────────────────────────────────
  'oss-energy-save': {
    intro: 'North Yorkshire — mains failure. Battery says 3h10m. Utility says 4h30m. Gap: 1h20m. Energy-save mode bridges it. Generator dispatched as backup. Result: zero customer-visible outage, 3,200kg CO2 avoided, 1,420 customers protected.',
    beatsByStage: { detect: 'AC mains lost 14:08. Battery 100%. Load 280W. Battery life: 3h10m. Utility ETA: 4h30m. Gap: 1h20m.', observe: '1,420 customers. 18 high-CLV. Nearest neighbour 4.2km — partial overlap only. No alternative coverage.', hypothesize: 'Energy-save mode (5G off-peak suspend, 4G TX −2dB) extends battery 3h10m → 4h30m. Bridges the gap.', plan: 'Apply EnergyController battery-extend. Dispatch generator (Salesforce Field Service). Low-key push to 18 high-CLV only.', act: 'Profile applied. Generator on road ETA 2h15m. On-site at T+2h8m — 7min ahead. Cutover successful. Energy-save released.', verify: 'Generator running. Mains restored T+3h22m. Customer outage: zero seconds.', resolved: 'Zero impact. 1,420 protected. 3,200kg CO2 avoided. Battery-upgrade business case auto-queued.' },
    domainNotes: { cic: '18 high-CLV got low-key push — inform, not alarm.', digital: '18 pushes. Frequency cap respected.', bss: 'Zero credits — service maintained. £840 opex for generator.', oss: 'OSS home: energy management, battery modelling, generator dispatch, ESG.', noc: 'ESG-positive: commercial AND sustainability decisions together.' },
    closing: 'Zero customers dropped. Zero seconds of outage. 3,200kg CO2 avoided. £840 opex vs £200k potential CLV loss. Intelligent infrastructure management.',
  },

  // ── OSS: Inventory drift reconciliation ───────────────────────────────────
  'oss-inventory-drift': {
    intro: '2.4 million network assets reconciled nightly across Netcracker, Ericsson ENM, Nokia NetAct, and ServiceNow CMDB. Tonight: 184 drifts detected — 142 auto-corrected, 42 escalated. F1 score: 0.91. Zero customer impact.',
    beatsByStage: { detect: 'Nightly inventory reconciliation across 4 systems: Netcracker, ENM, NetAct, CMDB. 2.4M assets.', observe: '184 drift items: 142 configuration mismatches (stale CMDB entries), 42 genuine discrepancies.', hypothesize: '142 = auto-correctable (CMDB refresh from ENM/NetAct as source-of-truth). 42 = escalate (physical vs logical mismatch).', plan: 'Auto-correct 142 CMDB entries. Escalate 42 to field verification queue. Generate drift report for change governance.', act: '142 corrected in 12 minutes. 42 work orders generated. Drift report published at 06:00.', verify: 'Post-correction reconciliation: 100% alignment on 142. 42 pending field verification.', resolved: 'Inventory aligned. 2.4M assets in sync. Drift report feeds change governance meeting.' },
    domainNotes: { cic: 'No customer impact.', digital: 'No involvement.', bss: 'Inventory accuracy ensures billed-vs-provisioned alignment.', oss: 'OSS home: inventory management, multi-system reconciliation, drift detection.', noc: 'Accurate inventory is the foundation of incident correlation.' },
    closing: '2.4 million assets. Four systems. Nightly reconciliation. 142 auto-corrected. That is continuous inventory hygiene — not a quarterly audit.',
  },

  // ── OSS: TMF 645 trouble-ticket triage ────────────────────────────────────
  'oss-assurance-triage': {
    intro: '42 trouble tickets in 4 hours. The triage model scored each: severity, likely root cause, predicted MTTR. Result: MTTR 1h12m versus 4h baseline. Zero mis-routing. Four P1s identified and fast-tracked before human review.',
    beatsByStage: { detect: '42 trouble tickets in 4h. assurance_triage_v2 + severity_classifier_v2 scored all at intake.', observe: 'Classification: 4 P1 (auto-escalated), 12 P2 (skill-routed), 26 P3 (standard queue). MTTR prediction attached to each.', hypothesize: 'P1s: 2 transport (Juniper), 1 RAN (Ericsson), 1 core (Mavenir). Auto-correlated — 2 transport tickets are same root cause.', plan: 'Fast-track 4 P1s. Merge 2 correlated transport tickets. Skill-route 12 P2s. Standard queue 26 P3s.', act: 'P1s assigned in 90 seconds. Correlated tickets merged. 12 P2s skill-routed to specialists.', verify: 'MTTR overall: 1h12m vs 4h baseline. Zero mis-routes. 4 P1s resolved within SLA.', resolved: '42 tickets triaged. 1h12m MTTR. The model triaged faster and more accurately than the duty engineer.' },
    domainNotes: { cic: 'CIC: P1 tickets feed customer-impact assessment.', digital: 'No involvement.', bss: 'No involvement.', oss: 'OSS home: assurance, trouble-ticket management, ML triage.', noc: 'NOC executes the resolution; OSS handles the triage and routing.' },
    closing: 'Forty-two tickets. Four P1s identified and fast-tracked in 90 seconds. MTTR reduced from 4 hours to 1h12m. Intelligent triage is the highest-leverage automation in network ops.',
  },

  // ── OSS: B2B fast-order Lloyds ────────────────────────────────────────────
  'oss-b2b-fast-order': {
    intro: 'Lloyds Banking Group — 280-site regional pilot. TMF 622: voice + data + SD-WAN. Traditional lead: 42 days. Platform orchestrates Openreach, Juniper, Amdocs in parallel. Delivered in 12 days — 71% reduction.',
    beatsByStage: { detect: 'Service order: Lloyds 280 sites. Voice + data + SD-WAN. Required: 14 days. Traditional: 42 days.', observe: 'Decomposition: 840 tasks (280×3). Dependencies: 140 need Openreach wayleave (7d lead), 280 Juniper configs, 840 Amdocs activations.', hypothesize: 'Critical path: Openreach at 7d. Parallel execution cuts 42→14 days.', plan: 'Fire all 140 Openreach immediately. Parallel Juniper for non-wayleave sites. Stage Amdocs in waves of 40/day.', act: 'Openreach complete day 7. Juniper live day 10. All 840 services activated day 12 — 2 days ahead.', verify: '280 sites tested and activated. Zero fallout. Lloyds signed off.', resolved: '280 sites. 840 services. 12 days vs 42 traditional. 71% reduction through parallel orchestration.' },
    domainNotes: { cic: 'Fast delivery protects relationship. Delays = NPS erosion.', digital: 'Self-service portal: real-time order status for all 840 tasks.', bss: '280 subscriptions activated. Revenue from day 12 vs day 42 = 30d earlier revenue.', oss: 'OSS home: service provisioning, dependency orchestration, multi-vendor coordination.', noc: 'Once live, 280 sites join monitored estate with priority routing.' },
    closing: '42 days to 12. 71% faster. 30 days earlier revenue recognition on a £14M account. Speed in enterprise provisioning is a competitive differentiator.',
  },

  // ── OSS: CAB failed change auto-rollback ──────────────────────────────────
  'oss-cab-rollback': {
    intro: 'A CAB-approved NORMAL change failed on push — RRC config v124 regression on an Ericsson cluster. Time Travel restored the config-publication record. ENM picked up v123 on next 60s sync. Cells converged in 4 minutes. Auto-PIR drafted. Zero customer-visible impact.',
    beatsByStage: { detect: 'CHG pushed: RRC config v124 to Ericsson cluster. Post-push validation: 4 cells reporting UE attach failures.', observe: 'Regression detected. v124 introduced parameter conflict on RACH preamble config.', hypothesize: 'Rollback to v123. Time Travel in Snowflake preserves the config-publication record. ENM will pick up v123 on next 60s sync.', plan: 'Rollback initiated via Snowflake Time Travel config state. ENM sync at next cycle. Monitor cell KPIs for convergence.', act: 'Time Travel restore of config v123 published. ENM synced at T+52s. 4 cells reconverged at T+4m12s.', verify: 'All cells nominal. UE attach success 99.7%. Zero customer-visible impact (4min exposure window masked by RRC retries).', resolved: 'Change rolled back in 4 minutes. Auto-PIR drafted by Cortex Complete for Ofcom GC A3 30-day report. Zero SLA breach.' },
    domainNotes: { cic: 'Zero customer impact — 4 minutes masked by RRC retries.', digital: 'No customer communication needed.', bss: 'No credits — service maintained.', oss: 'OSS home: change management, auto-rollback, Time Travel config state, ENM integration.', noc: 'NOC: failed change detected here; OSS automated the rollback.' },
    closing: 'A failed change. Detected in seconds. Rolled back via Time Travel in 4 minutes. Zero customer impact. Auto-PIR drafted for governance. That is what change resilience looks like.',
  },

  // ── OSS: Drive-test SON RF optimisation ───────────────────────────────────
  'oss-drive-test-optimise': {
    intro: 'Polystar drive-test telemetry ingested. SON recommender model identified 18 cells needing RF re-tilt. Standard change class — pre-approved playbook, no manual CAB. Applied inside maintenance window. DL throughput +22% across cohort.',
    beatsByStage: { detect: 'Polystar drive-test: 18 cells showing sub-optimal RSRP/SINR vs predicted coverage model.', observe: 'son_recommender_v2 (Snowpark ML): antenna tilt adjustments calculated. +22% DL predicted.', hypothesize: 'Standard CHG class: pre-approved SON playbook. No manual CAB needed for antenna parameter changes within bounds.', plan: 'Apply tilt adjustments during 02:00-04:00 maintenance window. Monitor post-change KPIs for 30 minutes.', act: 'Ericsson ENM: 18 antenna tilt changes applied. ServiceNow STANDARD CHG logged. Post-change monitoring active.', verify: '30-min post-change: DL throughput +22%. RSRP improved on 16 of 18 (2 marginal). Zero degradation.', resolved: '18 cells optimised. +22% throughput. Automated SON with governance — not manual RF engineering.' },
    domainNotes: { cic: 'Improved coverage reduces network-driven churn.', digital: 'No involvement.', bss: 'No involvement.', oss: 'OSS home: SON automation, drive-test analytics, RF optimisation.', noc: 'Better coverage = fewer NOC incidents.' },
    closing: 'Drive-test to optimisation in one maintenance window. 18 cells. +22% throughput. Standard change — no 3-week CAB cycle. That is continuous RF improvement at machine speed.',
  },

  // ── OSS: Vendor SLA breach ────────────────────────────────────────────────
  'oss-vendor-sla-breach': {
    intro: 'Field-side prediction model flagged risk: Vendor-A likely to breach SLA by 18 minutes on a cell-replacement job. Platform dispatched Vendor-B reserve crew in parallel. Vendor-A breached. Vendor-B completed. Customer SLA preserved. Vendor scorecard debited £24k per MSA.',
    beatsByStage: { detect: 'ftf_predict_v1 + vendor_perf_v2: Vendor-A ETA slipping. Breach predicted in 18 minutes.', observe: 'Historical pattern: Vendor-A has breached 3 of last 12 jobs on this cell type.', hypothesize: 'Parallel dispatch Vendor-B reserve crew. If Vendor-A makes it, stand down B. If not, B completes.', plan: 'Dispatch Vendor-B in parallel. Do not cancel Vendor-A — let them attempt. Scorecard applies regardless.', act: 'Vendor-A breached by 18m. Vendor-B completed on time. Customer SLA preserved. Scorecard: Vendor-A debited £24k (MSA non-customer-impacting tier).', verify: 'Zero customer SLA-credit triggered. Service restored on time via Vendor-B.', resolved: 'Customer protected. Vendor-A debited. The platform predicted the breach early enough to act on the alternative.' },
    domainNotes: { cic: 'Zero customer impact — SLA preserved via parallel dispatch.', digital: 'No involvement.', bss: 'Vendor scorecard: £24k debit. No customer credit needed.', oss: 'OSS home: vendor management, SLA prediction, parallel dispatch strategy.', noc: 'NOC vendor-escalation desk handles vendor case independently.' },
    closing: 'The platform predicted the breach 30 minutes before it happened and dispatched the backup. Customer SLA preserved. Vendor debited. Predictive vendor management — not post-mortem blame.',
  },

  // ── OSS: Spectrum re-farm 700 MHz ─────────────────────────────────────────
  'oss-spectrum-refarm': {
    intro: 'National 700 MHz re-farm milestone: 600 cells decommissioned UK-wide. Capacity forecast refreshed. £980k/year OpEx saved. 24 tonnes CO2/year avoided. Programme tracking dashboard live for the CTO.',
    beatsByStage: { detect: 'Programme milestone: 700 MHz re-farm batch 4 complete. 600 cells decommissioned.', observe: 'capacity_forecast_v2 refreshed: remaining spectrum reallocated. Coverage model updated.', hypothesize: 'OpEx saving: £980k/yr (power + site rental). CO2: 24t/yr avoided. No coverage gap (traffic migrated to n28/n78).', plan: 'Confirm decommission. Update asset register. Refresh capacity model. Publish CTO dashboard.', act: '600 cells removed from ENM. Netcracker inventory updated. CMDB marked end-of-life. Dashboard published.', verify: 'Coverage model: zero degradation. OpEx saving confirmed. ESG metrics updated.', resolved: '600 cells off. £980k/yr saved. 24t CO2/yr avoided. National programme 72% complete.' },
    domainNotes: { cic: 'Zero customer impact — traffic pre-migrated.', digital: 'No involvement.', bss: 'OpEx saving flows to P&L.', oss: 'OSS home: spectrum management, decommissioning, capacity planning, ESG tracking.', noc: 'Fewer cells = smaller alarm estate.' },
    closing: '£980k/year saved. 24 tonnes CO2 avoided. Zero coverage gap. Spectrum re-farm is both a commercial and an ESG programme — and the platform tracks both.',
  },

  // ── OSS: Openreach backhaul lead-time ─────────────────────────────────────
  'oss-openreach-leadtime': {
    intro: 'Lloyds 280-branch rollout at risk: Openreach EAD circuit slipped from 14 to 28 days. Platform auto-escalated, identified alternative backhaul (4G bonding as interim), and preserved the Ofcom B2B SLA. Zero customer-visible delay.',
    beatsByStage: { detect: 'Openreach EAD circuit for Lloyds site 47/280: lead-time slipped 14→28 days.', observe: '280-branch rollout at risk. SLA: all sites live within 30 days. Day 14 miss = programme jeopardy.', hypothesize: 'Alternative: 4G bonded backhaul as interim (Ericsson MWAN). Provides 80% of target bandwidth. Customer unaffected.', plan: 'Auto-escalate Openreach (priority uplift). Deploy 4G interim. Commission EAD on arrival. Swap transparently.', act: 'Openreach escalated. 4G bonding deployed in 48h. Site live on interim. Openreach EAD arrived day 22. Swap completed.', verify: 'Customer SLA preserved. Site live from day 16 (interim) through to permanent (day 22). Zero visible delay.', resolved: 'Lead-time miss absorbed. Customer never knew. Ofcom B2B SLA: met.' },
    domainNotes: { cic: 'CIC: Lloyds NPS protected — no delivery failure visible.', digital: 'Self-service portal showed "on track" throughout.', bss: 'Interim 4G: OpEx absorbed. EAD cost unchanged.', oss: 'OSS home: backhaul management, lead-time escalation, interim solutions.', noc: 'No involvement.' },
    closing: 'When a supplier misses, the platform adapts — interim solution deployed in 48 hours, customer SLA preserved, permanent circuit installed on arrival. Resilient delivery, not helpless waiting.',
  },

  // ── OSS: 5G slice activation · Barclays ──────────────────────────────────
  'oss-slice-activation': {
    intro: 'Barclays trading floor — URLLC 5G network slice. SLA: <1ms latency, 99.999% availability. Provisioned end-to-end: radio, transport, core. SLA probe active every 10 seconds. Revenue: £14.2k/month. Automated penalty-credit if breached.',
    beatsByStage: { detect: 'Service order: Barclays E14 trading floor. URLLC slice. <1ms latency, 99.999% availability. 36mo contract, £14.2k/mo.', observe: 'Resources mapped: dedicated PRBs (3 cells), dedicated transport VRF (Juniper MX), dedicated UPF (SPCS).', hypothesize: 'Deployment: parallel provisioning across radio, transport, core. SLA probe every 10s. Penalty-credit auto-trigger if >1ms for 30s.', plan: 'Provision Ericsson Slice Manager, Juniper VRF, SPCS UPF. Activate SLA probe. Go-live next business day 06:00.', act: 'Slice provisioned. Probe active. Latency: 0.74ms P99. 24h burn-in: 100% availability. Barclays signed off.', verify: '8,640 probe validations in 24h. Zero packet loss. Well within SLA.', resolved: 'Slice live. £14.2k/month. Automated SLA management — credit applied before customer reports any breach.' },
    domainNotes: { cic: 'Strategic B2B account. Slice delivery strengthens relationship.', digital: 'Self-service SLA dashboard showing real-time latency.', bss: '£14.2k/mo subscription. Automated penalty-credit in contract.', oss: 'OSS home: slice provisioning, multi-layer orchestration, SLA probing.', noc: 'Premium service monitoring — any degradation triggers P1-equivalent.' },
    closing: 'Sub-millisecond. Five-nines. Automated SLA. £14.2k/month. Enterprise network-as-a-service — provisioned in under 24 hours.',
  },

  // ── OSS: Digital-twin pre-CHG simulation ──────────────────────────────────
  'oss-digital-twin-prechg': {
    intro: 'Firmware upgrade tonight on 12 Juniper MX routers in Leeds transport ring. Digital twin simulated it: if sequential (planned), router PE-LDS-3 loses OSPF adjacency for 4.2 seconds — 612 customers at risk. Twin found a safe pair-wise sequence. Change redesigned. Zero impact.',
    beatsByStage: { detect: 'Scheduled CHG0013044: firmware upgrade on 12 Juniper MX204, LS-RING-2. CAB-approved 02:00-04:00.', observe: 'Twin loaded topology, traffic matrix, OSPF state. Simulated planned sequence (sequential N→S).', hypothesize: 'At router 7 (PE-LDS-3): 4.2s OSPF flap on backup path. 14 LSPs unprotected. 612 customers at risk.', plan: 'Alternative: pair-wise upgrade (E-W redundancy preserved at every step). Simulation: zero unprotected windows. CHG re-approved.', act: 'Executed in pair-wise sequence. Zero OSPF flaps. Zero traffic hits. All 12 upgraded.', verify: 'Post-change: all adjacencies up, BFD active, RSVP-TE LSPs signalled. Traffic nominal.', resolved: 'Change complete. Zero customer impact. Twin caught the risk 8 hours before execution.' },
    domainNotes: { cic: '612 customers protected without knowing they were at risk.', digital: 'No comms needed — change was clean.', bss: 'No credits — no impact occurred.', oss: 'OSS home: digital twin, pre-change simulation, sequence optimisation.', noc: 'NOC executed the change in the safe sequence with confidence.' },
    closing: 'The most expensive outage is the one you cause yourself. 34% of customer-impacting events come from planned maintenance. The twin prevents them by simulating every change before execution.',
  },

  // ── OSS: Service-Order reconciliation ─────────────────────────────────────
  'oss-service-order-reconcile': {
    intro: 'Nightly BSS↔OSS reconciliation: 184 services OSS-active-but-BSS-unbilled (revenue leak) and 42 BSS-billed-but-OSS-not-provisioned (customer impact). Auto-routed to fix queues. Revenue leak: £14k/month plugged.',
    beatsByStage: { detect: 'Nightly reconcile: compare BSS subscription state vs OSS provisioning state.', observe: '184 OSS-active-but-unbilled = revenue leakage (£14k/mo). 42 BSS-billed-but-not-provisioned = customer risk.', hypothesize: '184: integration gap (TMF 638 event lost). 42: order fallout at provisioning stage.', plan: 'Auto-route 184 to billing-fix queue (replay events). 42 to provisioning-fix queue (activate or refund).', act: '184 billing events replayed — now billing correctly. 42 provisioned or refunded. Fix queues cleared by 08:00.', verify: 'Post-fix reconcile: zero gaps. Revenue leak plugged. Customer impact resolved.', resolved: '£14k/month recovered. 42 customers made whole. BSS↔OSS alignment restored overnight.' },
    domainNotes: { cic: '42 customers were paying for non-provisioned services — now resolved. Trust protected.', digital: 'No involvement.', bss: 'Revenue leak plugged by replaying billing events.', oss: 'OSS home: service-order reconciliation, provisioning gap detection.', noc: 'No involvement.' },
    closing: 'Revenue leaks between BSS and OSS are invisible until you reconcile. This platform does it nightly. £14k/month recovered. 42 customers made whole. Continuous alignment, not annual audit.',
  },

  // ── OSS: EMF / ICNIRP audit ───────────────────────────────────────────────
  'oss-emf-audit': {
    intro: 'Annual ICNIRP radiation audit: 412 sites assessed. 38 require remediation. 6 high-priority near schools and hospitals. Ofcom + UKHSA reporting auto-generated. Community comms drafted by Cortex Complete.',
    beatsByStage: { detect: 'Annual EMF audit triggered: 412 sites due for ICNIRP compliance review.', observe: 'Assessment: 374 pass. 38 require remediation (power adjustments or exclusion-zone changes). 6 near schools/hospitals = high-priority.', hypothesize: 'Remediation: 32 require antenna power reduction. 6 require physical exclusion-zone fence re-marking.', plan: 'Schedule 32 power adjustments (standard CHG). 6 physical works dispatched. Ofcom/UKHSA report generated. Community letters drafted.', act: '32 power adjustments applied overnight. 6 field works ordered. Ofcom report submitted. Community letters prepared for local council.', verify: 'Post-adjustment EMF measurement: all 38 within ICNIRP limits. Zero exposure exceedance.', resolved: '412 sites audited. 38 remediated. Ofcom compliant. UKHSA notified. Community comms ready for local publication.' },
    domainNotes: { cic: 'Community trust protected — proactive communication vs reactive press response.', digital: 'Community letters drafted by Cortex Complete in plain English.', bss: 'No billing impact.', oss: 'OSS home: EMF management, site safety, regulatory compliance.', noc: 'Power adjustments may marginally affect capacity — NOC monitors.' },
    closing: 'EMF compliance is non-negotiable. 412 sites audited annually with full Ofcom and UKHSA evidence. Community comms proactive — not reactive to a newspaper story.',
  },

  // ── OSS: TMF 921 SLA dashboard ────────────────────────────────────────────
  'oss-tmf921-sla': {
    intro: 'Proactive B2B SLA management: slo_burnrate_v2 predicts 14 of 412 enterprise accounts will breach 99.95% availability in the next 30 days. Pre-emptive remediation prevents £220k in SLA-credit penalties. Act before the breach, not after.',
    beatsByStage: { detect: 'TMF 921 SLA dashboard: 412 B2B accounts monitored. slo_burnrate_v2 flags 14 approaching breach.', observe: '14 accounts: current SLO burn rate projects breach of 99.95% within 30 days. At 5-10% MRC per breach, that is £220k exposure.', hypothesize: 'Root causes: 8 = recurring transport flaps, 4 = RAN congestion at peak, 2 = core latency drift.', plan: 'Pre-emptive fixes: reroute 8 transport paths, add MLB offset for 4 RAN, tune UPF for 2 core. All within standard CHG.', act: 'Transport rerouted. MLB applied. UPF tuned. SLO burn rate recalculated: all 14 now projecting above 99.95%.', verify: '30-day forward projection: zero breaches. £220k credit avoided.', resolved: 'SLA preserved across all 14 accounts. £220k penalty avoided. Proactive — not reactive.' },
    domainNotes: { cic: 'B2B accounts protected — no NPS-damaging credit conversation needed.', digital: 'B2B self-service portal shows SLA metrics live.', bss: '£220k SLA-credit avoided — stays on the P&L.', oss: 'OSS home: SLA management, SLO burn-rate prediction, pre-emptive remediation.', noc: 'Remediation actions (reroute, MLB) are standard changes executed via NOC.' },
    closing: '£220k in penalties prevented because the platform predicted the breach 30 days early and fixed the root cause. The cheapest SLA credit is the one you never have to pay.',
  },

  // ── Manchester M14 — RAN cluster congestion ───────────────────────────────
  'NET-INC-2026-0428-MAN-M14': {
    intro:
      'Manchester M14 cluster — peak-hour PRB congestion. The agent has spotted the spike from Snowpipe Streaming RAN counters. Watch how it gets from "alarm" to "service restored" in under eight minutes.',
    beatsByStage: {
      detect: 'PRB utilisation 96% sustained over 90 seconds. The agent is correlating cell counters, scheduler delay and GTP-U N3 drops — these are not three alarms, this is one event.',
      observe: 'Cortex Search just retrieved four prior runbooks for this cluster. The agent is also pulling network-impact: 2,417 customers are presenting at the affected cells right now.',
      hypothesize: 'Hypothesis at 88% confidence — peak-period demand on a cluster with degraded backhaul. Same pattern as April, July, November and February.',
      plan: 'Two RAN actions, one ITSM, one Care. Each one comes with a simulation: MLB offset −3 dB, +61 Mbps DL; secondary carrier n1, +35% capacity. Eligibility checks happen before the playbook fires.',
      act: 'MLB offset and carrier-add applied via Ericsson ENM. ServiceNow change CHG0012987 opened with the full evidence pack. Salesforce Service Cloud is queueing 89 personalised credits for high-CLV customers.',
      verify: 'Five-minute watch window — KPIs back inside 80% of baseline, no auto-rollback. The agent is now drafting the executive briefing.',
      resolved: 'Service restored — MTTR-mitigation 7 m 24 s. Zero SLA breaches. CHG0012987 awaiting post-implementation review.',
    },
    domainNotes: {
      noc: 'You are on NOC — the agent orchestrator. Every stage runs here.',
      cic: 'CIC view: 89 high-CLV customers identified by CHURN_MODEL_UK_MOBILE_V3.2. Each one has been ranked and a tailored apology + £5 credit + plan refresh is queued.',
      digital: 'Digital view: 89 push notifications + SMS scheduled via Salesforce Marketing Cloud and Sinch. Consent and frequency caps were checked before the agent fired.',
      bss: 'BSS view: £5 service credit queued in Amdocs CES on the next bill for 2,417 affected customers. Ofcom auto-comp evaluated.',
      oss: 'OSS view: ServiceNow change CHG0012987 with the full agent evidence pack. Field-force not dispatched — this is software-only.',
    },
    closing: 'Important: 47 minutes manual MTTR became 7 minutes with the agent — and the audit trail is regulator-ready end-to-end.',
  },

  // ── Liverpool L1 — gNB thermal ─────────────────────────────────────────────
  'NET-INC-2026-0508-LIV-L1': {
    intro: 'Liverpool — single-site thermal alarm on an Ericsson Radio 4480. Notice: not every incident is huge. Most are small, and the right answer is "do less, faster".',
    beatsByStage: {
      detect: 'Board temperature 78 °C. EnergyController has already auto-throttled to 70% PRB cap — 88% of the capacity is preserved.',
      observe: 'The agent has matched three prior incidents on the same gNB. All resolved by fan-controller auto-recovery per Ericsson TSB-2024-117.',
      hypothesize: 'Hypothesis at 94% confidence — intermittent fan-controller, same signature as before.',
      plan: 'No customer comms. Hold the throttle, dispatch a Salesforce Field Service technician, queue a maintenance-window restart.',
      act: 'Field-tech ETA 45 minutes. Maintenance window 02:00–03:00 booked in Netcracker. The fan-controller has just auto-recovered on cycle 6 of 6 — exactly as the TSB predicts.',
      verify: 'Throttle released in 10% steps. Downlink back to 128 Mbps. Incident stays open until the field-tech signs off the hardware.',
      resolved: 'MTTR-mitigation 4 m 12 s. MTTR-closure pending the field-tech. Zero customer comms — the right action was no action.',
    },
    domainNotes: {
      noc: 'NOC view: a calm scenario. The agent\'s value here is in deciding NOT to fire customer comms.',
      cic: 'CIC view: nothing surfaced. CLV protected at ~£18.2k.',
      digital: 'Digital view: no push, no SMS — by design. Throttle is masking 88% of capacity.',
      bss: 'BSS view: no credits. No bill impact.',
      oss: 'OSS view: Salesforce Field Service work order live. The technician has the asset, the symptom and the TSB on their tablet.',
    },
    closing: 'The agent\'s policy is "minimum customer disturbance". Single-site soft impact = no broadcast.',
  },

  // ── Leeds LS2 — IPRAN transport ───────────────────────────────────────────
  'NET-INC-2026-0508-LDS-LS2': {
    intro: 'Leeds LS2 — transport ring fault on a Juniper MX204. This one needs vendor escalation and a CAB approval — watch the human-in-the-loop step.',
    beatsByStage: {
      detect: 'BFD session down, OSPF flapping on the Openreach span between PE-LDS-2 and PE-LDS-3. Three sites affected.',
      observe: 'No high-confidence historical match. The agent ran a Cortex Analyst text-to-SQL: 14 LSPs on this ring, 11 carrying customer-facing services.',
      hypothesize: 'Openreach fibre fault localised by OTDR self-test — 3.2 km from PE-LDS-2. 84% confidence.',
      plan: 'Reroute via secondary ring LS-RING-3. Latency goes up 18 ms, no SLA breach. But this is a T2 change on shared transport — needs a human approval.',
      act: 'NOC engineer and transport-CAB delegate approved at 16:39. Junos commit-confirmed. Openreach P1 ticket opened in ServiceNow.',
      verify: 'BFD up, OSPF converged, RSVP-TE LSPs signalled on the new path. One SLA breach in 39 cells (data > 30 min).',
      resolved: 'Restored on secondary path in 11 m 36 s. Closure depends on Openreach\'s splice repair (~3 h). Vendor RCA mandatory.',
    },
    domainNotes: {
      noc: 'NOC view: an example where the agent stops and asks for a human.',
      cic: 'CIC view: 612 customers including 14 P1 churn risks; the agent ranked them for a goodwill credit.',
      digital: 'Digital view: 612 targeted Salesforce MC pushes — Ofcom auto-compensation thresholds NOT triggered (under 2 hours).',
      bss: 'BSS view: £5 goodwill via Amdocs CES on next bill for 612 customers. Plus the e-bonded ServiceNow ticket on the Openreach side.',
      oss: 'OSS view: Openreach work order live. Splice repair team dispatched, ETA three hours.',
    },
    closing: 'When the model is uncertain — 84% — the agent writes the change request and waits for a human. Auditable by design.',
  },

  // ── London HSS / VoLTE ────────────────────────────────────────────────────
  'NET-INC-2026-0508-LDN-HSS': {
    intro: 'London — IMS core. This is the highest-impact failure mode in mobile telco: a VoLTE registration storm hitting 1.42 million subscribers.',
    beatsByStage: {
      detect: 'Mavenir P-CSCF reg failure rate 12% — baseline is 0.4%. Oracle USPL HSS Cx Diameter peer is flapping. SRVCC handovers up 220%.',
      observe: '142 alarms in 18 seconds. Empirix probe shows MOS dropping from 4.2 to 2.9. Salesforce Service Cloud queue is up 340% in 90 seconds. Twitter is starting to trend.',
      hypothesize: 'Stale Cx sessions on Oracle USPL HSS after a Mavenir S-CSCF re-anchor that followed an MME failover at 09:24. 91% confidence.',
      plan: 'Flush idle Cx sessions, rate-limit P-CSCF re-reg, fail over to LDN-PCSCF-02 if not recovered in 90 seconds. T2 emergency change — the CTO duty-officer is on the pager.',
      act: 'Approval received at 16:28. Cx flush cleared 624,118 stale sessions. Mavenir P-CSCF rate-limit applied. ServiceNow major incident MIM-2026-0508-001. GC A3 999-impact triage opened, NIS2/NCSC clock running.',
      verify: 'IMS reg failures 12% → 5.8% → 1.4%. SRVCC HO success back at 99.1%. MOS recovered to 4.0 median. Ten-minute extended watch window on IMS.',
      resolved: 'Service restored, 9 m 48 s. NIS2/NCSC notifiable event filed (≥1 M users). RCA pending Oracle and Mavenir advisories.',
    },
    domainNotes: {
      noc: 'NOC view: the agent\'s job is to recommend, not to commit. The CTO duty-officer approved.',
      cic: 'CIC view: comms are held. The regulator-led messaging will lead.',
      digital: 'Digital view: bulletin drafted in Salesforce MC, awaiting sign-off. No push goes out before regulator coordination.',
      bss: 'BSS view: no individual credits. This is a systemic outage; bulk policy will follow the RCA.',
      oss: 'OSS view: Major incident MIM-2026-0508-001. NIS2 preliminary notification ready to send to NCSC.',
    },
    closing: 'The point of the agent here is not to act faster than the engineer — it is to present the evidence, the simulation and the audit trail in one place so the human can decide.',
  },

  // ── Single SIM-swap ───────────────────────────────────────────────────────
  'SEC-INC-2026-0508-SIMSWAP-CUST-002': {
    intro: 'A SIM-swap fraud attempt on Daniel Shah — CUST-002. Risk score 0.94. The agent has 90 seconds before the swap completes.',
    beatsByStage: {
      detect: 'New device, new IP — TOR exit node. Last login was Birmingham, the request is from Lagos. Two known UK retail-bank app device-bindings revoked in the last 30 seconds.',
      observe: 'Salesforce Service Cloud care log: a four-minute call where the attacker provided DOB and a 4-digit care KBA. The KBA was compromised.',
      hypothesize: 'Account takeover in progress. 97% confidence. The cost of a false positive is one inconvenienced customer; the cost of a miss is direct money loss.',
      plan: 'Freeze the swap, step up MFA, lock outbound payments, contact via verified channel only.',
      act: 'Amdocs OMS freeze, Salesforce Identity step-up, Amdocs CES payments lock. ServiceNow security incident opened. Customer contacted via app push and registered MSISDN — not the new device.',
      verify: 'Customer confirmed: did not request the swap. Police-reported. £4,200 loss prevented.',
      resolved: 'Fraud blocked in 3 m 24 s. Cisco SecureX CTI feed updated. The customer keeps the original SIM.',
    },
    domainNotes: {
      noc: 'NOC view: security incidents share the same agent runtime as network incidents — same audit trail, same approval gates.',
      cic: 'CIC view: a fraud-protection upsell is queued for after the resolution call.',
      digital: 'Digital view: the verified-channel push is the key — never trust the new device.',
      bss: 'BSS view: Amdocs OMS freeze and Amdocs CES payments lock. Both reversible if the customer re-confirms.',
      oss: 'OSS view: forensic preservation enabled. Chain-of-custody for police evidence.',
    },
    closing: 'Three minutes from anomaly to police-reported, with the customer kept on the original SIM.',
  },

  // ── Roaming partner outage ────────────────────────────────────────────────
  'NET-INC-2026-0508-ROAMING-VPN-A': {
    intro: 'Roaming — IPX peer VPN-A is down. This is the broadest cross-domain scenario: NOC, BSS, Digital, OSS all light up.',
    beatsByStage: {
      detect: 'BGP session to IPX peer VPN-A is down. 14 destination countries. Diameter S6a/S6d failures from inbound roamers up 2,400%.',
      observe: '12,418 outbound and 4,210 inbound roamers impacted. Spain, Italy, Greece, Turkey reporting "no service".',
      hypothesize: 'VPN-A core router fault, 92% confidence. Two prior incidents both auto-routed via BICS — the secondary IPX peer.',
      plan: 'Failover to BICS, pause overage billing, push localised comms in five languages, open vendor and Ofcom paths.',
      act: 'Cisco ASR 9000 BGP reroute applied. Amdocs CES paused 4,820 in-flight roaming sessions. Cortex Complete localised the push in five languages — 11,704 delivered.',
      verify: 'Outbound roamer attach success at 99.4%. Inbound re-registrations succeeding. UK Mobile Roaming Charges Regulations 2024 honoured.',
      resolved: 'Resolved 8 m 36 s. £14k goodwill applied for 1,840 high-CLV roamers. Vendor RCA pending.',
    },
    domainNotes: {
      noc: 'NOC view: orchestrating four domains in one script.',
      cic: 'CIC view: NBA generated for 1,840 high-CLV roamers — proactive £5 credit and bonus 1 GB EU Roaming Pass.',
      digital: 'Digital view: 11,704 personalised pushes in en-GB, es-ES, it-IT, el-GR, tr-TR. Cortex Complete generated the copy.',
      bss: 'BSS view: Amdocs CES paused billing on 4,820 sessions before the customer ever saw an overage.',
      oss: 'OSS view: ServiceNow vendor escalation and GSMA IR.21 partner desk paged.',
    },
    closing: 'One scenario, four domains synchronised, no customer asked for a credit — and yet the goodwill was applied before they noticed.',
  },

  // ── Mass SIM-swap ─────────────────────────────────────────────────────────
  'SEC-INC-2026-0508-MASS-SIMSWAP': {
    intro: 'Mass SIM-swap. AISQL has correlated 47 swap requests in 18 minutes from a single identity-back-office operator. This is either insider fraud or a credentials compromise — both answers are "freeze".',
    beatsByStage: {
      detect: 'Operator op-4421, role IDENTITY_OPS. Same approval-script timing on every request. 100% high-CLV consumer targets.',
      observe: 'AI_AGG fraud-pattern score 0.96, supervised model and Cortex Complete in agreement. Three prior incidents — two insider, one compromised KBA dump.',
      hypothesize: 'Insider compromise OR KBA leak. 96% confidence. False-positive cost is 0.04, miss cost is £180k.',
      plan: 'Bulk-freeze 47 orders, suspend the operator in Salesforce Identity, postcode-wide MFA step-up, verified-channel notification to all 47 victims.',
      act: 'Amdocs OMS bulk-freeze. Salesforce Identity session revoked. ServiceNow security incident, Workday HR paged. CTI broadcast on GSMA T-ISAC anonymised.',
      verify: 'No further fraud signals. 46 of 47 victims confirmed they did not request a swap. One unreachable, police-reported.',
      resolved: '£184,200 loss prevented in 5 m 24 s. Operator suspended pending forensic interview.',
    },
    domainNotes: {
      noc: 'NOC view: same agent runtime, this time orchestrating across BSS, Identity, HR and CTI.',
      cic: 'CIC view: a fraud-protection upsell is queued for the 47 victims — six months free.',
      digital: 'Digital view: postcode-wide MFA step-up affects 4,118 customers. MFA burden up 12% — limited blast radius.',
      bss: 'BSS view: 47 orders frozen in Amdocs OMS, 47 accounts payment-locked in Amdocs CES.',
      oss: 'OSS view: Workday HR investigation ticket open, forensic image taken with chain-of-custody.',
    },
    closing: 'The agent\'s policy: when both branches of the hypothesis lead to the same action, do not wait for certainty — act and audit.',
  },

  // ── Tower mains failure ───────────────────────────────────────────────────
  'NET-INC-2026-0508-NYK-MAINS': {
    intro: 'Rural North Yorkshire — mains failure at SITE-NYK-DAL-A. Northern Powergrid says four-and-a-half hours. The battery says three-ten. The agent\'s job is to bridge the gap without dropping a single call.',
    beatsByStage: {
      detect: 'AC mains lost at 14:08. Eaton power monitor reports battery at 100%. gNB and transport drawing 280 W.',
      observe: '1,420 customers presenting at this site, 18 high-CLV. Nearest neighbour cell 4.2 km — partial overlap only. No alternative coverage.',
      hypothesize: 'Battery insufficient for utility ETA. Generator dispatch needed. 89% confidence based on similar 2024 winter storm event.',
      plan: 'Energy-save mode (5G off-peak suspension, 4G TX −2 dB) extends battery from 3 h 10 m to 4 h 30 m. Generator ETA 2 h 15 m. Low-key push to high-CLV residents only.',
      act: 'Ericsson EnergyController battery-extend profile applied. ServiceNow ESG-tagged work order. Salesforce Field Service has the generator on the road. £840 opex saves 3,200 kg CO₂ vs the cells-dropped scenario.',
      verify: 'Generator on-site at T+2 h 8 m. Cutover successful. Energy-save released. Mains restored at T+3 h 22 m.',
      resolved: 'Customer-facing outage: zero seconds. MTT-Protect 14 m. 1,420 customers protected. 3,200 kg CO₂ avoided. Battery upgrade queued.',
    },
    domainNotes: {
      noc: 'NOC view: an ESG-positive scenario. Showing the agent makes commercial AND sustainability decisions.',
      cic: 'CIC view: high-CLV cohort protected without alarm or escalation.',
      digital: 'Digital view: 18 low-key pushes to high-CLV residents. Frequency cap respected.',
      bss: 'BSS view: zero credits — service was maintained throughout.',
      oss: 'OSS view: ESG-tagged work order. Battery-replacement business case auto-drafted for the PIR.',
    },
    closing: 'Energy-aware ops: protect customers, protect the network, protect the carbon budget — in one decision.',
  },
};

export const presenterFor = (incidentId: string): PresenterScript | null =>
  presenterScripts[incidentId] ?? null;

// ── Derived presenter for SectionScenarios (CIC/Digital/BSS/OSS) ─────────────
// Synthesises a presenter script on-demand from a scenario's events so every
// scenario plays through the staged narrator (intro → per-stage → closing)
// even when it doesn't have a hand-written script. Hand-written scripts in
// `presenterScripts` always win.

import type { SectionScenario } from './sectionScenarios';

const SECTION_OPENING: Record<string, string> = {
  cic: 'A customer-impact moment is unfolding. Watch the agent move from signal to save.',
  digital: 'A digital-channel moment is going live across web, app, voice and conversational.',
  bss: 'A revenue / commerce process is running. Watch the agent stay inside policy and audit.',
  oss: 'A network operations moment is opening. Watch the agent decide before customers feel it.',
  noc: 'A network incident is unfolding. The agent is moving from alarm to restored service.',
};

const SECTION_CLOSING: Record<string, string> = {
  cic: 'Outcome: the right customers reached, in policy, with the audit trail filed.',
  digital: 'Outcome: comms shipped at scale with consent, frequency caps and brand safety preserved.',
  bss: 'Outcome: revenue protected, regulator-grade evidence pack produced, zero manual reconciliation.',
  oss: 'Outcome: network change executed under change control, digital-twin proven, customers unaffected.',
  noc: 'Outcome: incident resolved, evidence pack filed, regulator clocks satisfied.',
};

const KIND_BEAT_PREFIX: Record<string, string> = {
  detect: 'Detect — ',
  alarm: 'Alarm — ',
  observe: 'Observe — ',
  hypothesize: 'Hypothesise — ',
  plan: 'Plan — ',
  'act-rebalance': 'Act — ',
  'act-snow': 'Act — ',
  'act-restart': 'Act — ',
  'act-care': 'Act — ',
  act: 'Act — ',
  verify: 'Verify — ',
  resolve: 'Resolve — ',
  resolved: 'Resolve — ',
  log: '',
};

const KIND_TO_STAGE: Record<string, NocStageKey> = {
  detect: 'detect',
  alarm: 'detect',
  observe: 'observe',
  hypothesize: 'hypothesize',
  plan: 'plan',
  'act-rebalance': 'act',
  'act-snow': 'act',
  'act-restart': 'act',
  'act-care': 'act',
  act: 'act',
  verify: 'verify',
  resolve: 'resolved',
  resolved: 'resolved',
};

const SECTION_DOMAIN_NOTES: Record<string, Partial<Record<DomainKey, string>>> = {
  cic: {
    cic: 'CIC view: this is the home stage — cohort, drivers and NBA all converge here.',
    digital: 'Digital view: the same decision is replayed across web, app and voice with consistent eligibility.',
    bss: 'BSS view: any commercial action (credit, plan change, refund) is posted to gold.* and reconciled to GL.',
    oss: 'OSS view: if the trigger is network-led, the OSS event is the upstream cause of this CIC moment.',
    noc: 'NOC view: if there is an incident behind this, the NOC bridge owns the technical fix while CIC owns the customer.',
  },
  digital: {
    cic: 'CIC view: every Digital outreach is reconcilable to a single customer record with consent and CLV in scope.',
    digital: 'Digital view: this is the home stage — channels, journeys and orchestration all live here.',
    bss: 'BSS view: any commercial offer that goes out has a margin floor + CFO approval workflow attached.',
    oss: 'OSS view: when a Digital event is triggered by a network condition, OSS is the source of truth for the trigger.',
    noc: 'NOC view: outage-driven Digital comms wait for IC approval before publishing to consumers.',
  },
  bss: {
    cic: 'CIC view: customer-impact of any BSS action (refund, credit, plan change) is surfaced in the next CIC interaction.',
    digital: 'Digital view: BSS state changes hydrate the personalisation graph within minutes.',
    bss: 'BSS view: this is the home stage — catalog, charging, billing, GL and revenue assurance all live here.',
    oss: 'OSS view: BSS-OSS reconciliation closes any gap between billed services and provisioned services.',
    noc: 'NOC view: BSS-side disputes generated by NOC incidents are auto-routed to the BSS dispute queue.',
  },
  oss: {
    cic: 'CIC view: customer-impacting OSS events seed CIC outreach in priority order (vulnerable first).',
    digital: 'Digital view: OSS triggers can fire opt-in Digital comms (status page, in-app, SMS).',
    bss: 'BSS view: OSS service activation flows produce billable services on the BSS side via TMF 638/641 events.',
    oss: 'OSS view: this is the home stage — provisioning, assurance, change, capacity and field force all live here.',
    noc: 'NOC view: OSS owns planned changes and inventory; NOC owns live incidents and restoration.',
  },
  noc: {
    cic: 'CIC view: NOC incidents drive CIC outreach for affected high-CLV and vulnerable cohorts.',
    digital: 'Digital view: NOC P1s feed the outage-comms drafter; status page / SMS / in-app go after IC approval.',
    bss: 'BSS view: Ofcom auto-comp is evaluated and credits are queued in the bill cycle for affected customers.',
    oss: 'OSS view: post-incident, an OSS change record is opened to harden the cause (config, capacity, vendor).',
    noc: 'NOC view: this is the home stage — bridge, agent stack and PIR pipeline all run here.',
  },
};

export function derivePresenterFor(s: SectionScenario): PresenterScript {
  // Manual override always wins
  const manual = presenterScripts[s.id];
  if (manual) return manual;

  const beatsByStage: Partial<Record<NocStageKey, string>> = {};
  for (const ev of s.events) {
    const stage = KIND_TO_STAGE[ev.kind];
    if (!stage) continue;
    if (beatsByStage[stage]) continue; // first event per stage wins
    const prefix = KIND_BEAT_PREFIX[ev.kind] ?? '';
    beatsByStage[stage] = `${prefix}${ev.text}`;
  }
  const intro = `${s.subtitle} ${SECTION_OPENING[s.sectionId] ?? ''}`.trim();
  const resolveEv = s.events.find((e) => e.kind === 'resolve');
  const closing = resolveEv ? `${resolveEv.text} ${SECTION_CLOSING[s.sectionId] ?? ''}`.trim() : SECTION_CLOSING[s.sectionId] ?? '';
  return {
    intro,
    beatsByStage,
    domainNotes: SECTION_DOMAIN_NOTES[s.sectionId] ?? {},
    closing,
  };
}

