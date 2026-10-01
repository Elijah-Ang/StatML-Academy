import { writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { pilots } from "../lessons/pilots.mjs";
import { CORE_MODULES, coreNavLabel } from "./core-modules.mjs";
import { topicDirectory } from "./topic-directory.mjs";
const root = resolve(import.meta.dirname, "..");
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
function quiz(questions = []) {
  return questions
    .map(
      (q, i) =>
        `<div class="question"><fieldset><legend>${esc(q[0])}</legend>${q[1].map((a, j) => `<button type="button" class="quiz-option" data-correct="${j === q[2]}" data-feedback="${esc(q[3])}">${esc(a)}</button>`).join("")}<p class="feedback" aria-live="polite"></p><details class="static-answer"><summary>Answer and explanation</summary><p>${esc(q[1][q[2]])}. ${esc(q[3])}</p></details></fieldset></div>`,
    )
    .join("\n");
}
export function pilotPage(slug, d) {
  const i = CORE_MODULES.findIndex((m) => m.slug === slug);
  const meta = i >= 0 ? coreNavLabel(CORE_MODULES[i], i) : "foundation module";
  return `<!doctype html>
<!-- Generated from lessons/${d.engine ? "expanded" : "pilots"}.mjs. Use the matching notebook generator. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.title)} · StatML Academy</title><meta name="description" content="${esc(d.summary)}">
<link rel="stylesheet" href="academic-rigor.css"><link rel="stylesheet" href="notebook/notebook.css">${(d.styles || []).map(href => `\n<link rel="stylesheet" href="${esc(href)}">`).join("")}
<script src="core-modules.js" defer></script><script src="academic-rigor.js" defer></script>
<script type="module" src="notebook/lesson.js"></script></head>
<body class="paper-notes notebook" data-module="${slug}" data-accent="${d.accent}"${d.engine ? ` data-engine="${d.engine}"` : ""}>
<a href="#lesson" class="skip-link">Skip to lesson</a>
<nav class="statml-site-nav" aria-label="Academy"><a class="brand" href="../index.html">← Data Science Universe</a><span class="nav-title">${esc(d.title)}</span><span class="statml-nav-meta">${meta}</span></nav>
<div class="lesson-toolbar"><label for="stage-select">Lesson map</label><select id="stage-select">${d.stages.map((s, i) => `<option value="${i}">${String(i + 1).padStart(2, "0")} · ${esc(s.title)}</option>`).join("")}</select><span class="stage-progress" aria-live="polite">1 / ${d.stages.length}</span></div>
<div class="mobile-lab-bar"><span><small>Live notebook</small><strong id="mobile-summary">${esc(d.stages[0].question)}</strong></span><button class="primary" type="button" data-open-lab>Explore visual ↗</button></div>
<main class="notebook-layout" id="lesson"><article class="reading">
<header class="hero"><p class="eyebrow">${esc(d.family)}</p><h1>${esc(d.title)}</h1><p class="intro">${esc(d.intro)}</p><div class="pathway"><div><small>Prerequisites</small>${esc(d.prerequisite)}</div><div><small>Recommended next</small><a href="${d.nextSlug}.html">${esc(d.next)}</a></div></div><p class="reading-tip">Read a little. Try a little. Open the “why” when you are ready.</p></header>
<noscript><p class="caution">The full lesson, worked examples and answers are readable here. Enable JavaScript for the interactive experiments and live calculations.</p></noscript>
${d.stages
  .map(
    (
      s,
      i,
    ) => `<section class="stage" id="stage-${i + 1}" data-stage="${i + 1}" aria-labelledby="heading-${i + 1}">
${s.legacyId && s.legacyId !== `stage-${i + 1}` ? `<span class="legacy-anchor" id="${esc(s.legacyId)}" aria-hidden="true"></span>` : ""}<div class="stage-label"><span>${String(i + 1).padStart(2, "0")}</span>${esc(s.title)}</div><h2 id="heading-${i + 1}">${(slug === "evaluation-metrics" && i === 2) || s.worked ? "Worked example" : esc(s.question)}</h2>${(slug === "evaluation-metrics" && i === 2) || s.worked ? `<p class="sub-question">${esc(s.question)}</p>` : ""}
<p class="answer">${s.answer}</p><div class="receipt">${s.receipt.replace("{{QUIZ}}", quiz(d.questions))}</div>
<div class="experiment"><span class="pencil">↳</span><div><strong>Try it</strong><p>${esc(s.experiment)}</p><button type="button" data-explore-stage="${i}">Explore this idea <span aria-hidden="true">↗</span></button></div></div>
<details class="deeper"><summary>Why this works · a little deeper</summary><div>${s.whyHtml || s.why
      .split("\n")
      .map((p) => `<p>${p}</p>`)
      .join(
        "",
      )}${s.reference ? `<div class="reference-reading"><p class="reference-label">Additional reference · worked numbers below are separate examples from the live notebook.</p>${s.reference}</div>` : ""}</div></details>
<details class="check"><summary>Quick check · ${esc(s.check)}</summary><p>${esc(s.solution)}</p></details>
${s.nextReason ? `<p class="lesson-bridge">${esc(s.nextReason)}</p>\n` : ""}${i < d.stages.length - 1 ? `<a class="next-idea" href="#stage-${i + 2}">Next: ${esc(d.stages[i + 1].title)} ↓</a>` : `<a class="next-idea" href="${d.nextSlug}.html">Continue to ${esc(d.next)} →</a>`}
</section>`,
  )
  .join("\n")}
</article><aside class="lab-home" aria-label="Interactive notebook"><section class="lab-panel" id="lab-panel"><header class="lab-header"><div><p class="eyebrow">THE LIVE NOTEBOOK <span id="lab-stage">01</span></p><h2 id="lab-title">${esc(d.stages[0].title)}</h2></div><button class="icon-button" type="button" data-reset aria-label="Reset notebook" title="Reset notebook to its starting values">↺</button></header>
<div id="lab-content" data-interactive="${d.engine || slug}"><p class="loading-note">Your interactive notebook is loading. The complete written lesson is on the left.</p></div>
<p id="motion-status" class="motion-status" aria-live="off"></p><p class="lab-caption" id="lab-caption">${esc(d.summary)}</p><p class="live-announcement" role="status" aria-live="polite"></p></section></aside></main>
<dialog class="lab-dialog" aria-labelledby="dialog-title"><header class="dialog-header"><strong id="dialog-title">Explore the notebook</strong><button type="button" data-close-lab>Back to reading ✕</button></header><div class="dialog-body"></div></dialog>
${topicDirectory({ slug })}
<footer class="notebook-footer"><a href="../index.html">← Back to the Data Science Universe</a><span>StatML Academy · Learn by making the idea move.</span></footer>
</body></html>\n`;
}
export async function generatePilots(slugs = Object.keys(pilots)) {
  for (const slug of slugs)
    await writeFile(
      join(root, "modules", `${slug}.html`),
      pilotPage(slug, pilots[slug]),
    );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await generatePilots();
  console.log("Generated four notebook pilots (38 static stages).");
}
