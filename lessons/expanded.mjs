import { visualRevision } from '../modules/notebook/visual-revisions.js';
import {workflowPrompts} from "./workflow-prompts.mjs";
import { spatialPrompts } from "./spatial-prompts.mjs";
import { storyPrompts } from "./story-prompts.mjs";
import { readFileSync } from "node:fs";
import { catalog, sceneLabels } from "../modules/notebook/catalog.js";
import { lessons as foundations } from "../scripts/generate-foundations.mjs";
const reference = JSON.parse(
  readFileSync(new URL("./expanded/reference.json", import.meta.url), "utf8"),
);
const source = readFileSync(
  new URL("./expanded/answers.txt", import.meta.url),
  "utf8",
);
const authored = {};
let key;
for (const line of source
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean)) {
  if (line.startsWith("[")) {
    key = line.slice(1, -1);
    authored[key] = [];
  } else authored[key].push(line.split(" | "));
}
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const table = (pairs) =>
  '<div class="table-wrap"><table><thead><tr><th scope="col">Follow the idea</th><th scope="col">Read it in plain language</th></tr></thead><tbody>' +
  pairs
    .split(";")
    .map((pair) => {
      const [a, ...b] = pair.split("~");
      return (
        '<tr><th scope="row">' +
        esc(a) +
        "</th><td>" +
        esc(b.join("~")) +
        "</td></tr>"
      );
    })
    .join("") +
  "</tbody></table></div>";
const families = {
  statistics: "Statistics · Evidence and uncertainty",
  "regression-lab": "Supervised learning · Regression and validation",
  classification: "Supervised learning · Classification",
  trees: "Supervised learning · Trees and ensembles",
  "tree-space": "Supervised learning · Trees and ensembles",
  multiple: "Supervised learning · Multiple regression",
  unsupervised: "Unsupervised learning · Structure and representation",
  neural: "Deep learning · Learn the computation",
  workflow: "Foundations · A defensible workflow",
};
const next = {
  anova: "experimental-design",
  correlation: "simple-linear-regression",
  "chi-square": "confidence-hypothesis-testing",
  "time-series-analysis": "data-leakage-pipelines",
  "multiple-linear-regression": "regression-diagnostics",
  "polynomial-regression": "bias-variance",
  "regression-trees": "random-forest",
  "hierarchical-clustering": "pca",
  pca: "model-selection",
  "logistic-regression": "evaluation-metrics",
  knn: "support-vector-machine",
  lda: "qda",
  qda: "model-selection",
  "classification-trees": "random-forest",
  "support-vector-machine": "model-selection",
  "one-r": "classification-trees",
  "bias-variance": "model-selection",
  "model-selection": "data-leakage-pipelines",
  "neural-networks": "deep-learning",
  "deep-learning": "evaluation-metrics",
  "probability-sampling": "confidence-hypothesis-testing",
  "confidence-hypothesis-testing": "experimental-design",
  "data-leakage-pipelines": "model-selection",
  "regression-diagnostics": "multiple-linear-regression",
  "random-forest": "gradient-boosting",
  "gradient-boosting": "evaluation-metrics",
  "missing-data-encoding": "data-leakage-pipelines",
  "imbalanced-classification": "evaluation-metrics",
  "experimental-design": "anova",
};
const title = (slug) =>
  reference[slug]?.title ||
  {
    "simple-linear-regression": "Simple Linear Regression",
    "evaluation-metrics": "Evaluation Metrics",
  }[slug];
export const expanded = Object.fromEntries(
  Object.entries(reference).map(([slug, d]) => {
    const config = catalog[slug],
      f = foundations[slug];
    if (
      authored[slug]?.length !== d.stages.length ||
      config.scenes.length !== d.stages.length
    )
      throw new Error("Stage coverage mismatch: " + slug);
    const questions = f?.questions.map((q, i) => {
      const shift = (i + 1) % q[1].length;
      return [
        q[0],
        [...q[1].slice(shift), ...q[1].slice(0, shift)],
        (q[2] - shift + q[1].length) % q[1].length,
        q[3],
      ];
    });
    return [
      slug,
      {
        title: d.title,
        family: families[config.engine],
        accent:
          config.engine === "unsupervised"
            ? "green"
            : config.engine === "neural"
              ? "gold"
              : config.engine === "statistics"
                ? "blue"
                : "red",
        intro: d.intro || authored[slug][0][0],
        prerequisite:
          d.prerequisite || f?.prerequisite ||
          (config.engine === "neural"
            ? "Weighted sums, functions, and train–validation–test splits"
            : "Means, plots, and the train–validation distinction"),
        nextSlug: next[slug],
        next: title(next[slug]),
        summary:
          "Read the idea, inspect a small example, then change one thing in the live notebook.",
        questions,
        engine: config.engine,
        stages: d.stages.map((stage, i) => {
          const [answer, mini, check, solution] = authored[slug][i],
            scene = config.scenes[i];
          let deep = stage.reference
            .replace(/^\s*(?:Stage\s*)?\d{1,2}\s*/, "")
            .replaceAll(
              "the visual panel",
              "the corresponding conceptual example",
            );
          // Revised explanations own the optional depth. Legacy button text is
          // removed only for source sections that have not yet been rewritten.
          if (f && i === 8 && !stage.languageReviewed) deep = "";
          if (f && i === 3 && !stage.languageReviewed)
            deep = deep.replace(
              /<p>A defensible analysis connects[\s\S]*?<\/p>/,
              "",
            );
          return {
            title:
              slug === "neural-networks" && i === 2
                ? "Split, then learn preprocessing"
                : stage.title.replace(/^\d+[.\s]+/, ""),
            question: visualRevision(slug,i)?.question || stage.question,
            answer: esc(answer),
            receipt:
              '<div class="receipt-label">A small example · separate from the live dataset</div>' +
              table(mini) +
              (f && i === 8 ? "{{QUIZ}}" : "") +
              '<p class="mini-note"><strong>Your notebook:</strong> <span data-bind="live-receipt">Open the visual to inspect the current calculation.</span></p>',
            experiment:
              visualRevision(slug,i)?.action || stage.experiment || storyPrompts[slug]?.[i] || workflowPrompts[slug]?.[i] ||
              spatialPrompts[slug]?.[i] ||
              sceneLabels[scene] +
                ". Use the labeled controls, predict what will change, then compare the calculation before and after.",
            why: stage.languageReviewed ? "" : answer + "\n" + solution,
            whyHtml: stage.languageReviewed ? deep : undefined,
            reference: stage.languageReviewed ? "" : deep,
            check,
            solution,
            legacyId: stage.legacyId,
            scene,
            worked: !!f && i === 2,
          };
        }),
      },
    ];
  }),
);
