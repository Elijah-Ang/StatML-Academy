import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { lessons as foundationLessons } from "./generate-foundations.mjs";
import { CORE_MODULES, coreNavLabel } from "./core-modules.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const validateOnly = process.argv.includes("--validate-only");
const sources = ["index.html", "modules", "assets"];
const originalModules = CORE_MODULES.map((module) => module.slug);
const foundationModules = Object.keys(foundationLessons);
// Retain the projection wording checks for existing lessons. Closed frequent
// itemsets with counts have an exact support-preserving property instead.
const projectionInformationClaims = [
  /preserv(?:e|es|ed|ing) (?:\d+% of )?(?:the )?information/i,
  /same information/i,
];
const banned = [
  /definitely related/i,
  /(?:result|relationship) is likely real/i,
  /always standardi[sz]e/i,
  /model is completely lost/i,
  /mandatory feature scaling/i,
  /feature scaling is essential/i,
  /filtering out (?:the )?noise/i,
  /preserving .*mathematical .*soul/i,
  /scale your data first/i,
  /perfectly fits the noise/i,
  /force all scales to 0.?1/i,
  /most informative angle/i,
];

async function collect(dir, prefix = "") {
  const { readdir } = await import("node:fs/promises");
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (
      entry.name === "dist" ||
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name.startsWith(".")
    )
      continue;
    const rel = join(prefix, entry.name);
    if (entry.isDirectory())
      out.push(...(await collect(join(dir, entry.name), rel)));
    else if (entry.name.endsWith(".html")) out.push(rel);
  }
  return out;
}

const pages = await collect(root);
const errors = [];
const titles = new Map();
const firstQuestions = new Map();
for (const rel of pages) {
  const file = join(root, rel);
  const html = await readFile(file, "utf8");
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html))
    errors.push(`${rel}: incomplete HTML document`);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  if (!title) errors.push(`${rel}: missing title`);
  else if (titles.has(title))
    errors.push(`${rel}: duplicate title also used by ${titles.get(title)}`);
  else titles.set(title, rel);
  for (const phrase of [...banned, ...(rel === "modules/association-rules.html" ? [] : projectionInformationClaims)])
    if (phrase.test(html))
      errors.push(`${rel}: banned statistical wording matches ${phrase}`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)) {
    const ref = match[1];
    if (
      /^(?:https?:|data:|mailto:|javascript:|\/\/)/.test(ref) ||
      ref.includes("${")
    )
      continue;
    const target = resolve(dirname(file), ref);
    if (!existsSync(target)) errors.push(`${rel}: missing local asset ${ref}`);
  }
}
for (const [index, slug] of originalModules.entries()) {
  const rel = `modules/${slug}.html`;
  const html = await readFile(join(root, rel), "utf8");
  if (!html.includes("academic-rigor.css"))
    errors.push(`${rel}: missing shared rigor stylesheet`);
  if (!html.includes("academic-rigor.js"))
    errors.push(`${rel}: missing shared rigor interface script`);
  if (!html.includes("core-modules.js"))
    errors.push(`${rel}: missing canonical core navigation script`);
  const expectedLabel = coreNavLabel(
    CORE_MODULES[index],
    index,
    originalModules.length,
  );
  if (!html.includes(`<span class="statml-nav-meta">${expectedLabel}</span>`))
    errors.push(`${rel}: expected generated navigation label ${expectedLabel}`);
  if (/\/18\b/.test(html))
    errors.push(`${rel}: outdated /18 module total returned`);
}
for (const slug of foundationModules) {
  const rel = `modules/${slug}.html`;
  const html = await readFile(join(root, rel), "utf8");
  if (html.length < 7500)
    errors.push(`${rel}: static lesson content is too shallow`);
  const noScriptText = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&\w+;/g, " ")
    .trim();
  if (noScriptText.split(/\s+/).length < 650)
    errors.push(
      `${rel}: fewer than 650 readable words remain with JavaScript disabled`,
    );
  if ((html.match(/<section class="stage"/g) || []).length < 8)
    errors.push(`${rel}: requires at least eight static stages`);
  if (!/<h2(?:\s[^>]*)?>Worked example<\/h2>/.test(html))
    errors.push(`${rel}: missing worked example`);
  if (!html.includes("data-interactive="))
    errors.push(`${rel}: missing topic interaction`);
  if ((html.match(/class="question"/g) || []).length < 5)
    errors.push(`${rel}: requires five topic-specific checks`);
  if ((html.match(/class="static-answer"/g) || []).length < 5)
    errors.push(
      `${rel}: checks need static feedback for no-JavaScript reading`,
    );
  if (
    !html.includes("<small>Prerequisites</small>") ||
    !html.includes("<small>Recommended next</small>")
  )
    errors.push(`${rel}: missing learning-path metadata`);
  if (
    !html.includes("<h3>Assumptions</h3>") ||
    !html.includes("<h3>When the method fails</h3>") ||
    !html.includes("<strong>What to report:</strong>")
  )
    errors.push(
      `${rel}: missing assumptions, failure modes, or reporting guidance`,
    );
  const question = html.match(/<legend>([^<]+)<\/legend>/)?.[1];
  if (!question) errors.push(`${rel}: missing knowledge-check question`);
  else if (firstQuestions.has(question))
    errors.push(
      `${rel}: repeated generic check also used by ${firstQuestions.get(question)}`,
    );
  else firstQuestions.set(question, rel);
}
const landing = await readFile(join(root, "index.html"), "utf8");
for (const token of [
  "curriculum-expansion",
  "curriculum-grid",
  "curriculum-card",
  "New foundations & workflow",
  "Build a defensible modelling process",
])
  if (landing.includes(token))
    errors.push(`index.html: removed foundation card grid returned (${token})`);
if (
  !landing.includes(
    "Interactive learning platform · core curriculum and foundation modules",
  )
)
  errors.push("index.html: footer wording does not match visible navigation");
if ((landing.match(/\{ id:'/g) || []).length !== originalModules.length)
  errors.push(
    "index.html: visible curriculum module count no longer matches the core module inventory",
  );
if (
  !landing.includes("modules/core-modules.js") ||
  !landing.includes("STATML_CORE_MODULES.map")
)
  errors.push(
    "index.html: landing module data is not generated from the canonical inventory",
  );
const landingPaths = [
  ...landing.matchAll(/\{ id:'[^']+'[\s\S]*?path:'modules\/([^']+)\.html'/g),
].map((match) => match[1]);
if (landingPaths.join("|") !== originalModules.join("|"))
  errors.push(
    "index.html: visual curriculum order differs from the canonical core inventory",
  );
const poly = await readFile(
  join(root, "modules/polynomial-regression.html"),
  "utf8",
);
if (/Test (?:MSE|Error)/i.test(poly))
  errors.push(
    "modules/polynomial-regression.html: test performance is still displayed during degree selection",
  );
const trees = await readFile(
  join(root, "modules/classification-trees.html"),
  "utf8",
);
if (/>\s*Test Accuracy\s*</i.test(trees) || /data-type="Test"/i.test(trees))
  errors.push(
    "modules/classification-trees.html: test accuracy is still displayed during depth selection",
  );
const logistic = await readFile(
  join(root, "modules/logistic-regression.html"),
  "utf8",
);
// Notebook runtime replaces the former inline canvas implementation. Check the
// boundary here; model and browser suites exercise disjoint IDs and the lock.
const classifier = await readFile(
  join(root, "modules/notebook/classification.js"),
  "utf8",
);
if (!logistic.includes('data-engine="classification"'))
  errors.push("Logistic must use the shared classification notebook");
if ((classifier.match(/matrix\(d\.split\.test/g) || []).length !== 1)
  errors.push("Final-test metrics must have one isolated reveal call");
if (
  !classifier.includes("if(sealed)return") &&
  !classifier.includes("if (sealed) return")
)
  errors.push("Final-test reveal must be one-time");
if (
  !classifier.includes("matrix(d.split.validation") &&
  !classifier.includes("matrix(\n      d.split.validation")
)
  errors.push("Development confusion counts must use validation");
if (
  !classifier.includes("'reveal-test'") &&
  !classifier.includes('"reveal-test"')
)
  errors.push("Final-test lock control missing");
// Load every lazy controller in Node to catch syntax/import failures before publishing.
// Controller modules are pure at import time; DOM work belongs inside create().
const { catalog } = await import("../modules/notebook/catalog.js");
for (const engine of new Set(Object.values(catalog).map(c => c.engine))) {
  try { await import("../modules/notebook/" + engine + ".js"); }
  catch (error) { errors.push(engine + ": cannot load notebook controller: " + error.message); }
}
const { expanded } = await import("../lessons/expanded.mjs");
for (const [slug, lesson] of Object.entries(expanded)) {
  const html = await readFile(join(root, "modules", slug + ".html"), "utf8");
  if (
    (html.match(/<section class="stage"/g) || []).length !==
    lesson.stages.length
  )
    errors.push(slug + ": incomplete stage migration");
  if (
    !html.includes("notebook/lesson.js") ||
    !html.includes('data-engine="' + lesson.engine + '"')
  )
    errors.push(slug + ": missing notebook engine");
  if (
    /src=["'][^"']*(?:deep-sketch|study-sketch|foundation-module|handwritten-theme)\.js/.test(
      html,
    )
  )
    errors.push(slug + ": legacy renderer is still loaded");
}
const rigorScript = await readFile(
  join(root, "modules/academic-rigor.js"),
  "utf8",
);
if (
  /createTreeWalker|NodeFilter|const replacements|\.replace\(from/i.test(
    rigorScript,
  )
)
  errors.push(
    "modules/academic-rigor.js: runtime text replacement logic is forbidden",
  );
for (const heading of [
  "Assumptions",
  "When the method fails",
  "Validation and leakage",
  "Interpretation cautions",
  "What to report",
])
  if (!rigorScript.includes(heading))
    errors.push(
      `modules/academic-rigor.js: missing shared checklist heading ${heading}`,
    );
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
if (!validateOnly) {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  for (const source of sources)
    await cp(join(root, source), join(dist, source), { recursive: true });
}
console.log(
  `${validateOnly ? "Validated" : "Built"} ${pages.length} pages with statistical-content and local-link checks.`,
);
