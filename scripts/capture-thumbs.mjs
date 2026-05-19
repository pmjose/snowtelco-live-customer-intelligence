#!/usr/bin/env node
// Per-stage screenshot capture for every scenario.
//
// Usage:
//   node scripts/capture-thumbs.mjs                  # all scenarios × all stages
//   node scripts/capture-thumbs.mjs --hero-only      # one PNG per scenario (detect frame copied as hero)
//   node scripts/capture-thumbs.mjs --only=cic-manchester-churn
//   node scripts/capture-thumbs.mjs --stage=resolved
//   node scripts/capture-thumbs.mjs --base=http://localhost:5173

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const MANIFEST = join(ROOT, 'scripts', 'scenarios.manifest.json');
const OUT_DIR = join(ROOT, 'public', 'script-thumbs');
mkdirSync(OUT_DIR, { recursive: true });

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    if (a.startsWith('--')) {
      const [k, v = 'true'] = a.slice(2).split('=');
      return [k, v];
    }
    return [a, 'true'];
  }),
);

const BASE = args.base ?? 'http://localhost:5173';
const HERO_ONLY = args['hero-only'] === 'true';
const ONLY = args.only;          // single scenario id
const ONLY_STAGE = args.stage;   // single stage key
const VIEWPORT = { width: 1280, height: 720 };
const STAGE_TIMEOUT_MS = 30_000;
const POST_READY_DELAY = 350;

const STAGE_TO_KIND = {
  detect: ['detect', 'alarm'],
  observe: ['observe'],
  hypothesize: ['hypothesize'],
  plan: ['plan'],
  act: ['act-snow', 'act-care', 'act-rebalance', 'act-restart', 'act'],
  verify: ['verify'],
  resolved: ['resolve', 'resolved'],
};

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const scenarios = ONLY ? manifest.filter((s) => s.id === ONLY || s.id.startsWith(ONLY)) : manifest;

if (!scenarios.length) {
  console.error(`No scenarios matched (--only=${ONLY ?? '*'}). Did you run build-manifest first?`);
  process.exit(1);
}

console.log(`[capture] ${scenarios.length} scenarios; hero-only=${HERO_ONLY}; stage=${ONLY_STAGE ?? 'all'}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });

let captured = 0;
let skipped = 0;
let failed = 0;
let pageUseCount = 0;
const MAX_PAGE_USES = 20;
let page = await ctx.newPage();

for (const sc of scenarios) {
  const stages = HERO_ONLY ? ['detect'] : (ONLY_STAGE ? sc.stages.filter((s) => s === ONLY_STAGE) : sc.stages);
  for (const stage of stages) {
    // Recycle page periodically to prevent memory buildup crashing Vite
    pageUseCount++;
    if (pageUseCount > MAX_PAGE_USES) {
      await page.close();
      page = await ctx.newPage();
      pageUseCount = 0;
    }
    const file = join(OUT_DIR, `${sc.id}__${stage}.png`);
    const sectionFallback = { noc: '/noc', digital: '/digital', bss: '/bss', oss: '/oss' };
    const stageRoute = sc.routes?.[stage] ?? sectionFallback[sc.sectionId] ?? '/command-center';
    const url = `${BASE}${stageRoute}?run=${encodeURIComponent(sc.id)}&stage=${stage}&clean=1`;
    process.stdout.write(`[capture] ${sc.id} · ${stage} ... `);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      // Give the ScenarioAutoRunner time to mount, trigger selectIncident + startNocPlay
      await page.waitForTimeout(1200);
      const targetKinds = STAGE_TO_KIND[stage] ?? [stage];
      await page.waitForFunction(
        (kinds) => {
          const fired = (window).__getFiredEvents?.() ?? [];
          return fired.some((e) => kinds.includes(e.kind));
        },
        targetKinds,
        { timeout: STAGE_TIMEOUT_MS }
      );
      await page.waitForTimeout(POST_READY_DELAY);
      await page.screenshot({ path: file, type: 'png', fullPage: false });
      captured++;
      process.stdout.write('OK\n');
    } catch (e) {
      const msg = e.message ?? String(e);
      if (msg.includes('ERR_CONNECTION_REFUSED') || msg.includes('net::ERR_')) {
        process.stdout.write(`FAIL — server down, waiting 5s and retrying...\n`);
        await page.waitForTimeout(5000);
      } else {
        process.stdout.write(`FAIL — retrying with fresh page... `);
      }
      // Retry once with a fresh page (fixes NOC RAF race conditions)
      await page.close();
      page = await ctx.newPage();
      pageUseCount = 0;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForTimeout(1200);
        const targetKinds2 = STAGE_TO_KIND[stage] ?? [stage];
        await page.waitForFunction(
          (kinds) => { const fired = (window).__getFiredEvents?.() ?? []; return fired.some((e) => kinds.includes(e.kind)); },
          targetKinds2, { timeout: STAGE_TIMEOUT_MS }
        );
        await page.waitForTimeout(POST_READY_DELAY);
        await page.screenshot({ path: file, type: 'png', fullPage: false });
        captured++;
        process.stdout.write(`retry OK\n`);
      } catch (e2) {
        failed++;
        process.stdout.write(`retry FAIL — ${e2.message ?? e2}\n`);
      }
    }
  }
}

await browser.close();

// Hero shot copy: for each scenario, copy {id}__detect.png → {id}.png so the
// hero ScreenshotCard at the top of each script page renders the correct image.
for (const sc of scenarios) {
  const heroSrc = join(OUT_DIR, `${sc.id}__detect.png`);
  const heroDst = join(OUT_DIR, `${sc.id}.png`);
  if (existsSync(heroSrc)) {
    copyFileSync(heroSrc, heroDst);
  }
}

console.log(`\n[capture] done — captured=${captured} failed=${failed} skipped=${skipped}`);
process.exit(failed > 0 ? 1 : 0);
