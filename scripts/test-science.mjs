import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as m from "../modules/notebook/science.js";
import { expanded } from "../lessons/expanded.mjs";
import { pilotPage } from "./generate-pilots.mjs";
const fixtures = JSON.parse(
  await readFile(
    new URL("../lessons/expanded/science-fixtures.json", import.meta.url),
    "utf8",
  ),
);
const close = (a, b, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(a - b) <= tolerance,
    "Expected " + a + " ≈ " + b + " within " + tolerance,
  );
for (const [f, a, b, p] of fixtures.f) close(m.fTail(f, a, b), p, 2e-12);
for (const [t, df, p] of fixtures.t) close(m.tTail(t, df), p, 2e-12);
for (const [x, df, p] of fixtures.chi) close(m.chiTail(x, df), p, 2e-12);
for (const [x, p] of fixtures.normal) close(m.normalCDF(x), p, 8e-8);
const points = fixtures.pca.points.map(([x, z], i) => ({
    x,
    z,
    id: String(i),
  })),
  pca = m.pca(points);
pca.eigenvalues.forEach((v, i) => close(v, fixtures.pca.eigenvalues[i]));
close(m.sum(pca.eigenvalues), pca.xx + pca.zz);
close(m.sum(pca.scores.map((r) => r.pc1 * r.pc2)), 0);
for (const kind of ["single", "complete", "average", "ward"]) {
  const h = m.hierarchical(points, kind);
  assert.equal(h.snapshots.length, 8);
  h.merges.forEach((merge, i) =>
    close(
      merge.height,
      kind === "ward"
        ? fixtures.hierarchical[kind][i] ** 2 / 2
        : fixtures.hierarchical[kind][i],
    ),
  );
  h.snapshots.forEach((groups, i) => {
    assert.equal(groups.length, 8 - i);
    assert.equal(new Set(groups.flatMap((g) => g.members)).size, 8);
  });
}
const anova = m.anova(
  fixtures.anova.groups.flatMap((g, i) =>
    g.map((y, j) => ({ id: i + "-" + j, group: i, y })),
  ),
);
close(anova.F, fixtures.anova.F);
close(anova.p, fixtures.anova.p);
close(anova.total, anova.between + anova.within);
const chi = m.chiSquare(fixtures.contingency.cells);
close(chi.stat, fixtures.contingency.stat);
close(chi.p, fixtures.contingency.p);
close(m.sum(chi.expected), 100);
const exact = Array.from({ length: 12 }, (_, i) => ({
    id: String(i),
    x: i / 3,
    z: i % 3,
    y: 2 + (3 * i) / 3 - 0.5 * (i % 3),
  })),
  fit = m.linearFit(exact, (r) => [1, r.x, r.z]);
fit.coefficients.forEach((v, i) => close(v, [2, 3, -0.5][i]));
close(m.mse(exact, fit.predict), 0);
assert.equal(m.linearFit(exact, (r) => [1, r.x, r.x]).coefficients, null);
const shrunk = m.linearFit(exact, (r) => [1, r.x, r.z], 100, true);
close(shrunk.coefficients[1], 0);
close(shrunk.coefficients[2], 0);
close(shrunk.coefficients[0], m.mean(exact.map((r) => r.y)));
const splits = m.splitRows(m.classificationData());
assert.equal(
  new Set(
    Object.values(splits)
      .flat()
      .map((r) => r.id),
  ).size,
  80,
);
const logistic = m.logisticFit(splits.train),
  initialLoss = m.logLoss(splits.train, () => 0.5);
assert.ok(m.logLoss(splits.train, logistic.predict) < initialLoss);
const lda = m.discriminantFit(splits.train),
  pooledQDA = m.discriminantFit(splits.train, true, 1);
for (const r of splits.validation) close(lda.predict(r), pooledQDA.predict(r));
for (const kernel of ["linear", "rbf"]) {
  const rows = fixtures.svm.points.map(([x, z], i) => ({
      x,
      z,
      y: fixtures.svm.labels[i],
      id: String(i),
    })),
    model = m.svmFit(rows, 1, kernel, 0.8);
  rows.forEach((r, i) => close(model.score(r), fixtures.svm[kernel][i], 0.012));
  model.a.forEach((v) => assert.ok(v >= -1e-8 && v <= 1 + 1e-8));
  close(m.sum(model.a.map((v, i) => v * (rows[i].y ? 1 : -1))), 0, 1e-8);
}
const tree = m.treeFit(splits.train, { depth: 4 });
function auditTree(node) {
  assert.equal(node.ids.length, node.n);
  if (node.left) {
    close(node.n, node.left.n + node.right.n);
    close(
      node.gain,
      node.impurity -
        (node.left.n * node.left.impurity +
          node.right.n * node.right.impurity) /
          node.n,
    );
    assert.ok(node.gain > 0);
    auditTree(node.left);
    auditTree(node.right);
  }
}
auditTree(tree);
for (const r of splits.validation) {
  const path = m.treePath(tree, r);
  assert.equal(path.at(-1).value, m.treePredict(tree, r));
}
const forest = m.forestFit(splits.train, 12);
for (const r of forest.oob) {
  const eligible = forest.trees.filter((t) => !t.inBag.has(r.id));
  assert.equal(eligible.length, r.voters);
  if (eligible.length)
    close(r.score, m.mean(eligible.map((t) => m.treePredict(t.tree, r))));
  else assert.equal(r.score, null);
}
const regressionSplit = m.splitRows(m.regressionData()),
  boost = m.boostFit(
    regressionSplit.train,
    regressionSplit.validation,
    20,
    0.2,
    2,
  );
boost.trace
  .slice(1)
  .forEach((r, i) => assert.ok(r.train <= boost.trace[i].train + 1e-10));
close(boost.predict(regressionSplit.validation[0], 0), boost.initial);
const knn = m.knnFit(splits.train, 1);
close(knn.predict(splits.train[0]), splits.train[0].y);
const model = m.networkInitial(),
  rows = splits.train.slice(0, 5),
  g = m.networkStep(model, rows, { rate: 0 }).gradient,
  eps = 1e-5;
for (const path of [
  ["bias"],
  ...Array.from({ length: 3 }, (_, i) => ["out", i]),
  ...Array.from({ length: 3 }, (_, i) => ["hidden", i, "b"]),
  ...Array.from({ length: 6 }, (_, i) => [
    "hidden",
    Math.floor(i / 2),
    "w",
    i % 2,
  ]),
]) {
  const plus = structuredClone(model),
    minus = structuredClone(model),
    get = (o) => path.reduce((v, k) => v[k], o),
    set = (o, v) => {
      const parent = path.slice(0, -1).reduce((v, k) => v[k], o);
      parent[path.at(-1)] = v;
    };
  set(plus, get(plus) + eps);
  set(minus, get(minus) - eps);
  close(
    (m.networkLoss(plus, rows) - m.networkLoss(minus, rows)) / (2 * eps),
    get(g),
    2e-8,
  );
}
assert.ok(
  m.networkLoss(m.networkStep(model, rows, { rate: 0.2 }).model, rows) <
    m.networkLoss(model, rows),
);
assert.deepEqual(
  Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => m.convolve(m.filters.vertical, r, c)),
  ),
  [
    [3, 3, 0],
    [2, 2, 0],
    [1, 1, 0],
  ],
);
for (let i = 0; i < 4; i++) {
  const a = m.attention(i);
  close(m.sum(a.weights), 1);
  assert.ok(a.weights.every((w) => w > 0 && w < 1));
}
for (const [slug, d] of Object.entries(expanded))
  assert.equal(
    await readFile(
      new URL("../modules/" + slug + ".html", import.meta.url),
      "utf8",
    ),
    pilotPage(slug, d),
    "Generated source drift: " + slug,
  );
assert.equal(
  Object.values(expanded).reduce((n, d) => n + d.stages.length, 0),
  321,
);
console.log(
  "Scientific model checks passed: independent SciPy/NumPy/SVC fixtures, split isolation, exact tree/ensemble receipts, neural finite-difference gradients, convolution, attention, and all 321 authored stages.",
);
