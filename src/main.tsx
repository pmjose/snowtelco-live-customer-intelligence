import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/app/AppShell';
import Landing from '@/pages/Landing';
import CommandCenter from '@/pages/CommandCenter';
import Customer360Page from '@/pages/Customer360Page';
import Architecture from '@/pages/Architecture';
import Scenarios from '@/pages/Scenarios';
import DatabasePage from '@/pages/Database';
import CustomersList from '@/pages/CustomersList';
import CompareCustomers from '@/pages/CompareCustomers';
import Approvals from '@/pages/Approvals';
import ExecutiveInsights from '@/pages/ExecutiveInsights';
import Uplift from '@/pages/Uplift';
import NetworkMap from '@/pages/NetworkMap';
import EventStream from '@/pages/EventStream';
import Lineage from '@/pages/Lineage';
import Briefing from '@/pages/Briefing';
import Settings from '@/pages/Settings';
import Tours from '@/pages/Tours';
import Compliance from '@/pages/Compliance';
import NocCommandCenter from '@/pages/NocCommandCenter';
import NocTopology from '@/pages/NocTopology';
import { NocMim, NocWallboard, NocRunbooks, NocShift, NocCustomerImpact, NocStatusPage, NocVendor, NocPir, NocSynthetic, NocResilience, NocCsirt, NocMaintenance, NocPerf, NocComms } from '@/pages/noc/NocAdvanced';
import NocAgentRuns from '@/pages/NocAgentRuns';
import NocAgents from '@/pages/NocAgents';
import DigitalOverview, { DigitalConversational, DigitalVoice, DigitalJourneys, DigitalMarketplace } from '@/pages/digital/DigitalOverview';
import MarketingCampaigns, { MarketingFunnel, MarketingAudience, MarketingLifecycle, MarketingBrand } from '@/pages/digital/DigitalMarketing';
import DigitalChannels from '@/pages/digital/DigitalChannels';
import {
  DigitalDecisioning, DigitalVoC, DigitalExperiments, DigitalMartech, DigitalPricing,
  DigitalSelfService, DigitalPrivacy, DigitalForecast, DigitalIdentity,
} from '@/pages/digital/DigitalExtended';
import BssOverview, { BssCatalog, BssCharging, BssCollections, BssRevenueAssurance, BssLoyalty, BssB2B } from '@/pages/bss/BssOverview';
import BssO2A from '@/pages/bss/BssO2A';
import BssBilling from '@/pages/bss/BssBilling';
import {
  BssAccounts, BssCases, BssInteractions, BssPipeline,
  BssSubscriptions, BssMediation, BssBillRun, BssNumbers, BssQuoteToOrder, BssDisputes,
  BssRevRec, BssTax, BssGL, BssWholesale, BssSettlement, BssPromotions, BssPayments,
} from '@/pages/bss/BssExtended';
import BssCustomer360 from '@/pages/bss/BssCustomer360';
import OssOverview, { OssInventory, OssProvisioning, OssFieldForce, OssCapacity, OssEnergy, OssServiceOrder, OssAssurance, OssChange, OssTopology } from '@/pages/oss/OssOverview';
import { OssSlicing, OssPmFm, OssSon, OssNfv, OssSiteLifecycle, OssMlOps, OssRoaming, OssNumbers, OssTowerco, OssWholesaleOps, OssLi, OssDigitalTwin, OssMec, OssSlo } from '@/pages/oss/OssAdvanced';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          {/* CIC */}
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/cic" element={<Navigate to="/command-center" replace />} />
          <Route path="/cic/*" element={<Navigate to="/command-center" replace />} />
          <Route path="/customer/:id" element={<Customer360Page />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/compare" element={<CompareCustomers />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/insights" element={<ExecutiveInsights />} />
          <Route path="/uplift" element={<Uplift />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/lineage" element={<Lineage />} />
          <Route path="/briefing" element={<Briefing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/compliance" element={<Compliance />} />
          {/* Network shared */}
          <Route path="/network" element={<NetworkMap />} />
          <Route path="/events" element={<EventStream />} />
          {/* NOC */}
          <Route path="/noc" element={<NocCommandCenter />} />
          <Route path="/noc/topology" element={<NocTopology />} />
          <Route path="/noc/agents" element={<NocAgents />} />
          <Route path="/noc/agent-runs" element={<NocAgentRuns />} />
          <Route path="/noc/change" element={<OssChange />} />
          <Route path="/noc/mim" element={<NocMim />} />
          <Route path="/noc/wallboard" element={<NocWallboard />} />
          <Route path="/noc/runbooks" element={<NocRunbooks />} />
          <Route path="/noc/shift" element={<NocShift />} />
          <Route path="/noc/customer-impact" element={<NocCustomerImpact />} />
          <Route path="/noc/status-page" element={<NocStatusPage />} />
          <Route path="/noc/vendor-escalation" element={<NocVendor />} />
          <Route path="/noc/pir" element={<NocPir />} />
          <Route path="/noc/synthetic" element={<NocSynthetic />} />
          <Route path="/noc/resilience" element={<NocResilience />} />
          <Route path="/noc/csirt" element={<NocCsirt />} />
          <Route path="/noc/maintenance" element={<NocMaintenance />} />
          <Route path="/noc/perf" element={<NocPerf />} />
          <Route path="/noc/comms" element={<NocComms />} />
          {/* Digital */}
          <Route path="/digital" element={<DigitalOverview />} />
          <Route path="/digital/channels" element={<DigitalChannels />} />
          <Route path="/digital/conversational" element={<DigitalConversational />} />
          <Route path="/digital/voice" element={<DigitalVoice />} />
          <Route path="/digital/journeys" element={<DigitalJourneys />} />
          <Route path="/digital/marketplace" element={<DigitalMarketplace />} />
          <Route path="/digital/marketing" element={<MarketingCampaigns />} />
          <Route path="/digital/marketing/funnel" element={<MarketingFunnel />} />
          <Route path="/digital/marketing/audience" element={<MarketingAudience />} />
          <Route path="/digital/marketing/lifecycle" element={<MarketingLifecycle />} />
          <Route path="/digital/marketing/brand" element={<MarketingBrand />} />
          <Route path="/digital/decisioning" element={<DigitalDecisioning />} />
          <Route path="/digital/voc" element={<DigitalVoC />} />
          <Route path="/digital/experiments" element={<DigitalExperiments />} />
          <Route path="/digital/martech" element={<DigitalMartech />} />
          <Route path="/digital/pricing" element={<DigitalPricing />} />
          <Route path="/digital/self-service" element={<DigitalSelfService />} />
          <Route path="/digital/privacy" element={<DigitalPrivacy />} />
          <Route path="/digital/forecast" element={<DigitalForecast />} />
          <Route path="/digital/identity" element={<DigitalIdentity />} />
          {/* BSS */}
          <Route path="/bss" element={<BssOverview />} />
          <Route path="/bss/catalog" element={<BssCatalog />} />
          <Route path="/bss/order-to-activate" element={<BssO2A />} />
          <Route path="/bss/charging" element={<BssCharging />} />
          <Route path="/bss/billing" element={<BssBilling />} />
          <Route path="/bss/collections" element={<BssCollections />} />
          <Route path="/bss/revenue-assurance" element={<BssRevenueAssurance />} />
          <Route path="/bss/loyalty" element={<BssLoyalty />} />
          <Route path="/bss/b2b" element={<BssB2B />} />
          <Route path="/bss/accounts" element={<BssAccounts />} />
          <Route path="/bss/cases" element={<BssCases />} />
          <Route path="/bss/interactions" element={<BssInteractions />} />
          <Route path="/bss/pipeline" element={<BssPipeline />} />
          <Route path="/bss/subscriptions" element={<BssSubscriptions />} />
          <Route path="/bss/mediation" element={<BssMediation />} />
          <Route path="/bss/bill-run" element={<BssBillRun />} />
          <Route path="/bss/numbers" element={<BssNumbers />} />
          <Route path="/bss/quote-to-order" element={<BssQuoteToOrder />} />
          <Route path="/bss/disputes" element={<BssDisputes />} />
          <Route path="/bss/revrec" element={<BssRevRec />} />
          <Route path="/bss/tax" element={<BssTax />} />
          <Route path="/bss/gl" element={<BssGL />} />
          <Route path="/bss/wholesale" element={<BssWholesale />} />
          <Route path="/bss/settlement" element={<BssSettlement />} />
          <Route path="/bss/promotions" element={<BssPromotions />} />
          <Route path="/bss/payments" element={<BssPayments />} />
          <Route path="/bss/customer/:id" element={<BssCustomer360 />} />
          {/* OSS */}
          <Route path="/oss" element={<OssOverview />} />
          <Route path="/oss/inventory" element={<OssInventory />} />
          <Route path="/oss/provisioning" element={<OssProvisioning />} />
          <Route path="/oss/field-force" element={<OssFieldForce />} />
          <Route path="/oss/capacity" element={<OssCapacity />} />
          <Route path="/oss/energy" element={<OssEnergy />} />
          <Route path="/oss/service-order" element={<OssServiceOrder />} />
          <Route path="/oss/assurance" element={<OssAssurance />} />
          <Route path="/oss/change" element={<OssChange />} />
          <Route path="/oss/topology" element={<OssTopology />} />
          <Route path="/oss/slicing" element={<OssSlicing />} />
          <Route path="/oss/pm-fm" element={<OssPmFm />} />
          <Route path="/oss/son" element={<OssSon />} />
          <Route path="/oss/nfv" element={<OssNfv />} />
          <Route path="/oss/site-lifecycle" element={<OssSiteLifecycle />} />
          <Route path="/oss/mlops" element={<OssMlOps />} />
          <Route path="/oss/roaming" element={<OssRoaming />} />
          <Route path="/oss/numbers" element={<OssNumbers />} />
          <Route path="/oss/towerco" element={<OssTowerco />} />
          <Route path="/oss/wholesale-ops" element={<OssWholesaleOps />} />
          <Route path="/oss/li" element={<OssLi />} />
          <Route path="/oss/digital-twin" element={<OssDigitalTwin />} />
          <Route path="/oss/mec" element={<OssMec />} />
          <Route path="/oss/slo" element={<OssSlo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
