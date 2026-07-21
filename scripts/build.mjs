import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const sources = ['index.html', 'modules'];
const htmlFiles = [
  'index.html',
  ...Array.from({ length: 0 }),
];

async function collect(dir, prefix = '') {
  const { readdir } = await import('node:fs/promises');
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === '.git' || entry.name.startsWith('.')) continue;
    const rel = join(prefix, entry.name);
    if (entry.isDirectory()) out.push(...await collect(join(dir, entry.name), rel));
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const pages = await collect(root);
const errors = [];
for (const rel of pages) {
  const file = join(root, rel);
  const html = await readFile(file, 'utf8');
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) errors.push(`${rel}: incomplete HTML document`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)) {
    const ref = match[1];
    if (/^(?:https?:|data:|mailto:|javascript:|\/\/)/.test(ref) || ref.includes('${')) continue;
    const target = resolve(dirname(file), ref);
    if (!existsSync(target)) errors.push(`${rel}: missing local asset ${ref}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const source of sources) await cp(join(root, source), join(dist, source), { recursive: true });
console.log(`Built ${pages.length} pages with validated local links.`);
