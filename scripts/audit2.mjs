import { readFileSync } from 'fs';
const src = readFileSync('src/data/sectionScenarios.ts', 'utf8');
const pattern = /^const\s+(\w+):\s*SectionScenario\s*=\s*\{[\s\S]*?^\};/gm;
const blocks = src.match(pattern) || [];
let totalEvents = 0;
let emptyText = 0;
let veryShort = 0;
const eventKinds = {};
const issues = [];
for (const block of blocks) {
  const idMatch = block.match(/id:\s*'([^']+)'/);
  const id = idMatch ? idMatch[1] : '?';
  const eRe = /\be\(\s*(\d+(?:\.\d+)?)\s*,\s*'([\w-]+)'\s*,\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
  let m;
  let count = 0;
  while ((m = eRe.exec(block)) !== null) {
    count++;
    totalEvents++;
    const kind = m[2];
    eventKinds[kind] = (eventKinds[kind] || 0) + 1;
    const text = m[3].slice(1, -1);
    if (!text.trim()) { emptyText++; issues.push(`${id}: empty text @${m[1]}s/${kind}`); }
    else if (text.length < 30) { veryShort++; issues.push(`${id}: short(${text.length}) "${text}" @${kind}`); }
  }
  if (count === 0) issues.push(`${id}: 0 events parsed`);
}
console.log(`Scenarios: ${blocks.length}`);
console.log(`Total events: ${totalEvents}`);
console.log(`Empty text: ${emptyText}`);
console.log(`Short text (<30ch): ${veryShort}`);
console.log(`\nEvent kinds:`);
for (const [k, n] of Object.entries(eventKinds).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
console.log(`\nFirst 60 issues:`);
for (const i of issues.slice(0, 60)) console.log('  ' + i);
console.log(`\n... total issues: ${issues.length}`);
