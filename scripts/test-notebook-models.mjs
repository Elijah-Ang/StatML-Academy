import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import * as m from "../modules/notebook/models.js";
import { pilotPage } from "./generate-pilots.mjs";
import { pilots } from "../lessons/pilots.mjs";
const close = (a, b, t = 1e-10) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
const fit = m.leastSquares(m.initialRegression());
close(fit.m, 4.9);
close(fit.b, 45.3);
close(fit.sse, 1.9);
close(fit.rows[2].residual, 1);
close(m.lineSummary(m.initialRegression(), 7, 40).sse, 51);
assert.equal(
  m.leastSquares([
    { x: 3, y: 4 },
    { x: 3, y: 8 },
    { x: 3, y: 9 },
  ]).valid,
  false,
);
assert.equal(
  m.leastSquares([
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 3, y: 4 },
  ]).r2,
  null,
);
for (const scenario of ["clouds", "outlier", "moons"])
  for (const scaled of [false, true])
    for (const k of [1, 3, 6]) {
      const raw = m.clusterData(23, scenario),
        space = m.featureSpace(raw, scaled),
        points = space.points;
      assert.deepEqual(raw, m.clusterData(23, scenario));
      let s = m.initKmeans(points, k, 11),
        n = 0;
      const original = structuredClone(s);
      assert.equal(new Set(s.centroids.map((p) => p.id)).size, k);
      while (!s.converged && n++ < 100) {
        const before = structuredClone(s),
          next = m.stepKmeans(points, s);
        assert.deepEqual(s, before, "Step mutated its input snapshot");
        if (s.wcss != null)
          assert.ok(next.wcss <= s.wcss + 1e-6, "WCSS increased");
        s = next;
      }
      assert.ok(s.converged);
      assert.deepEqual(
        original.assignments,
        points.map(() => -1),
      );
      s.centroids.forEach((c, j) => {
        const members = points.filter((_, i) => s.assignments[i] === j);
        if (members.length) {
          close(c.x, m.mean(members.map((p) => p.x)));
          close(c.y, m.mean(members.map((p) => p.y)));
        }
      });
      const reconstructed = space.raw(points[0]);
      close(reconstructed.x, raw[0].x);
      close(reconstructed.y, raw[0].y);
    }
const r = m.bayesPosterior(
  { free: "present", winner: "present", meeting: "ignore" },
  1,
);
const a = 0.4 * (31 / 42) * (25 / 42),
  b = 0.6 * (7 / 62) * (4 / 62);
close(r.p, a / (a + b));
close(
  m.bayesPosterior({ free: "ignore", winner: "ignore", meeting: "ignore" }, 1)
    .p,
  0.4,
);
assert.notEqual(
  m.bayesPosterior({ free: "present", meeting: "ignore" }, 1).p,
  m.bayesPosterior({ free: "present", meeting: "absent" }, 1).p,
);
assert.equal(m.bayesPosterior({ unicorn: "present" }, 0).p, 0);
assert.ok(m.bayesPosterior({ unicorn: "present" }, 1).p > 0);
assert.ok(
  m.bayesPosterior({ free: "present" }, 1, true).p >
    m.bayesPosterior({ free: "present" }, 1).p,
);
close(
  m.gaussianPosterior(169).p,
  m.gaussian(169, 165, 7) / (m.gaussian(169, 165, 7) + m.gaussian(169, 180, 8)),
);
const rows = m.validationScores(),
  c = m.confusion(rows, 0.5);
assert.deepEqual([c.tp, c.fn, c.fp, c.tn], [80, 20, 90, 810]);
close(c.precision, 80 / 170);
close(c.recall, 0.8);
close(c.accuracy, 0.89);
assert.equal(m.confusion(rows, 1).precision, null);
assert.equal(m.confusion(rows, 1).recall, 0);
assert.equal(m.confusion(rows, 0).recall, 1);
for (const t of [0, 0.13, 0.5, 0.81, 1]) {
  const c = m.confusion(rows, t);
  assert.equal(c.tp + c.fn, 100);
  assert.equal(c.fp + c.tn, 900);
  assert.equal(c.tp + c.fp + c.fn + c.tn, 1000);
}
const ranking = m.rankingCurve(rows);
assert.equal(ranking.curve[0].fpr, 0);
assert.equal(ranking.curve.at(-1).recall, 1);
close(
  m.rankingCurve([
    { label: 1, score: 0.9 },
    { label: 0, score: 0.1 },
  ]).auc,
  1,
);
close(
  m.rankingCurve([
    { label: 1, score: 0.5 },
    { label: 0, score: 0.5 },
  ]).auc,
  0.5,
);
const ps = m.probabilityScores([
  { label: 1, score: 0.8 },
  { label: 0, score: 0.3 },
]);
close(ps.brier, 0.065);
close(ps.logLoss, -(Math.log(0.8) + Math.log(0.7)) / 2);
assert.equal(
  m.probabilityScores(rows).bins.reduce((s, b) => s + b.n, 0),
  1000,
);
// Imports and validation must be genuinely read-only; generated pages must match their authored sources.
const root = resolve(import.meta.dirname, "..");
async function hashes() {
  const files = (await readdir(resolve(root, "modules"))).filter(
    (f) => f.endsWith(".html") || f === "core-modules.js",
  );
  return Object.fromEntries(
    await Promise.all(
      files.map(async (f) => [
        f,
        createHash("sha256")
          .update(await readFile(resolve(root, "modules", f)))
          .digest("hex"),
      ]),
    ),
  );
}
const before = await hashes();
await import("./generate-foundations.mjs");
await import("./core-modules.mjs");
execFileSync(process.execPath, ["scripts/build.mjs", "--validate-only"], {
  cwd: root,
});
assert.deepEqual(await hashes(), before, "Validation rewrote lesson sources");
for (const [slug, data] of Object.entries(pilots))
  assert.equal(
    await readFile(resolve(root, "modules", slug + ".html"), "utf8"),
    pilotPage(slug, data),
    `${slug} differs from authored source`,
  );
console.log(
  "Notebook model checks passed: regression degeneracy, K-means snapshots/descent, Bayes evidence, fixed-score metrics, and read-only validation.",
);
