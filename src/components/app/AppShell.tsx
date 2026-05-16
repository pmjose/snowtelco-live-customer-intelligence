import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { PageBreadcrumb } from './PageBreadcrumb';
import { ScenarioTransport } from './ScenarioTransport';
import { SectionAutoReset } from './SectionAutoReset';
import { FocusRuntime } from './FocusRuntime';
import { DemoStateProvider } from '@/state/DemoStateProvider';
import { Narrator } from '@/components/narrator/Narrator';
import { AskCIC } from '@/components/chat/AskCIC';
import { KeyboardBridge } from './KeyboardBridge';

export function AppShell() {
  const loc = useLocation();
  const isLanding = loc.pathname === '/';

  return (
    <DemoStateProvider>
      <KeyboardBridge />
      <SectionAutoReset />
      <FocusRuntime />
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex flex-1 min-h-0">
          {!isLanding && <Sidebar />}
          <main data-focus="page" className="flex-1 min-w-0 pb-28">
            {!isLanding && <PageBreadcrumb />}
            <Outlet />
          </main>
        </div>
        <Narrator />
        <ScenarioTransport />
        <AskCIC />
        <Toaster richColors position="top-right" closeButton expand toastOptions={{ className: 'no-print' }} />
      </div>
    </DemoStateProvider>
  );
}
