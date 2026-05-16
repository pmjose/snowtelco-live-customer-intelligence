import { readFileSync } from 'fs';
const src = readFileSync('src/data/sectionScenarios.ts', 'utf8');

// Find all top-level scenario consts
const scenarios = [];
const pattern = /^const\s+(\w+):\s*SectionScenario\s*=\s*\{[\s\S]*?^\};/gm;
const blocks = src.match(pattern) || [];
for (const block of blocks) {
  const idMatch = block.match(/id:\s*'([^']+)'/);
  const sectionMatch = block.match(/sectionId:\s*'([^']+)'/);
  const titleMatch = block.match(/title:\s*'([^']+)'/);
  const durMatch = block.match(/durationSec:\s*(\d+)/);
  if (!idMatch || !sectionMatch) continue;
  const events = [];
  const evRe = /\be\(\s*(\d+(?:\.\d+)?)\s*,\s*'([\w-]+)'/g;
  const focusRe = /focus:\s*\{\s*route:\s*'([^']+)',\s*target:\s*'([^']+)'\s*\}/g;
  let m;
  while ((m = evRe.exec(block)) !== null) events.push({ atSec: parseFloat(m[1]), kind: m[2] });
  const focuses = [];
  while ((m = focusRe.exec(block)) !== null) focuses.push({ route: m[1], target: m[2] });
  const maxAt = events.length ? Math.max(...events.map((e) => e.atSec)) : 0;
  scenarios.push({
    section: sectionMatch[1],
    id: idMatch[1],
    title: titleMatch ? titleMatch[1] : '',
    durationSec: durMatch ? parseInt(durMatch[1], 10) : 0,
    eventCount: events.length,
    maxAt,
    focusCount: focuses.length,
    focuses,
  });
}

const main = readFileSync('src/main.tsx', 'utf8');
const routes = new Set();
const rRe = /Route path="([^"]+)"/g;
let rm;
while ((rm = rRe.exec(main)) !== null) routes.add(rm[1]);

console.log(`Total scenarios: ${scenarios.length}`);
const bySection = {};
for (const s of scenarios) bySection[s.section] = (bySection[s.section] || 0) + 1;
console.log('By section:', bySection);

const ids = scenarios.map((s) => s.id);
const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log(`Duplicate IDs: ${dups.length ? dups.join(', ') : 'none'}`);

const durFails = scenarios.filter((s) => s.durationSec < s.maxAt);
console.log(`Duration < maxAt: ${durFails.length}`);
for (const s of durFails) console.log(`  - ${s.section}/${s.id}: dur=${s.durationSec} maxAt=${s.maxAt}`);

const routeMisses = [];
for (const s of scenarios) {
  for (const f of s.focuses) {
    let r = f.route;
    if (r.startsWith('/customer/CUST-')) r = '/customer/:id';
    if (!routes.has(r)) routeMisses.push(`${s.section}/${s.id} -> ${f.route}`);
  }
}
console.log(`Route misses: ${routeMisses.length}`);
for (const m of routeMisses) console.log(`  - ${m}`);

const usedRoutes = new Set();
const usedTargets = new Set();
const targetByRoute = {};
for (const s of scenarios) for (const f of s.focuses) {
  usedRoutes.add(f.route);
  usedTargets.add(f.target);
  if (!targetByRoute[f.route]) targetByRoute[f.route] = new Set();
  targetByRoute[f.route].add(f.target);
}
console.log(`Distinct routes referenced: ${usedRoutes.size}`);
console.log(`Distinct targets: ${[...usedTargets].sort().join(', ')}`);

const presenter = readFileSync('src/data/presenterScripts.ts', 'utf8');
const presenterKeys = new Set();
const pkRe = /^\s{2,}'([^']+)':\s*\{/gm;
while ((rm = pkRe.exec(presenter)) !== null) presenterKeys.add(rm[1]);
const noNarrator = scenarios.filter((s) => !presenterKeys.has(s.id));
console.log(`Presenter keys: ${presenterKeys.size}`);
console.log(`Scenarios without presenter: ${noNarrator.length}`);

console.log('\n--- Routes referenced and their targets ---');
for (const r of [...usedRoutes].sort()) {
  console.log(`${r}: ${[...targetByRoute[r]].join(', ')}`);
}
