import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', m => console.log('[browser]', m.type(), m.text()));
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto('http://localhost:5173/?run=cic-manchester-churn&stage=hypothesize&clean=1');
for (let i = 1; i <= 12; i++) {
  await page.waitForTimeout(1000);
  const dbg = await page.evaluate(() => (window).__captureDebug);
  const fired = await page.evaluate(() => ((window).__getFiredEvents?.() ?? []).map(e => e.kind));
  console.log(`t+${i}s: debug=${JSON.stringify(dbg)} liveFired=${JSON.stringify(fired)}`);
}
await browser.close();
