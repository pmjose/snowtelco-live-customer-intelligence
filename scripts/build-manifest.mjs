#!/usr/bin/env node
// Compiles src/data/sectionScenarios.ts + src/data/nocIncidents.ts via esbuild
// and emits scripts/scenarios.manifest.json with [{id, sectionId, kind, stages}].

import { build } from 'esbuild';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(process.cwd());
const OUT = join(ROOT, 'scripts', 'scenarios.manifest.json');

async function bundleEntry(srcPath) {
  const outFile = join(ROOT, 'scripts', `_${srcPath.replace(/[\/\.]/g, '_')}.mjs`);
  await build({
    entryPoints: [join(ROOT, srcPath)],
    outfile: outFile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    alias: { '@': join(ROOT, 'src') },
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(outFile).href);
  unlinkSync(outFile);
  return mod;
}

const sectionMod = await bundleEntry('src/data/sectionScenarios.ts');
const nocMod = await bundleEntry('src/data/nocIncidents.ts');

const KIND_TO_STAGE = {
  detect: 'detect', alarm: 'detect',
  observe: 'observe',
  hypothesize: 'hypothesize',
  plan: 'plan',
  'act-snow': 'act', 'act-care': 'act', 'act-rebalance': 'act', 'act-restart': 'act', act: 'act',
  verify: 'verify',
  resolve: 'resolved', resolved: 'resolved',
};

function stagesFor(events) {
  const stages = [];
  const routes = {};
  const seen = new Set();
  seen.add('detect');
  stages.push('detect');
  for (const ev of events ?? []) {
    const s = KIND_TO_STAGE[ev.kind];
    if (!s) continue;
    if (!seen.has(s)) {
      seen.add(s);
      stages.push(s);
    }
    if (ev.focus?.route && !routes[s]) routes[s] = ev.focus.route;
  }
  return { stages, routes };
}

const out = [];
const seenIds = new Set();
for (const s of (sectionMod.sectionScenarios ?? [])) {
  const { stages, routes } = stagesFor(s.events);
  out.push({ id: s.id, sectionId: s.sectionId, kind: 'section', title: s.title, stages, routes });
  seenIds.add(s.id);
}
// Only add nocIncidents that have a corresponding sectionScenario (event script).
// Incidents without scripts (LDN-E14, BIR-B4, GLA-G12) are queue filler only.


writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`[build-manifest] wrote ${out.length} scenarios → ${OUT}`);
