import assert from "node:assert/strict";
import {
  classificationData,
  regressionData,
  splitRows,
  treeFit,
  treePredict,
  forestFit,
  networkInitial,
  networkStep,
  networkLoss,
  linearFit,
} from "../modules/notebook/science.js";
import {
  partitions,
  splitCandidates,
  pruneTree,
  coefficientIntervals,
  regressionScores,
  lossLandscape,
} from "../modules/notebook/spatial-science.js";
const close = (a, b, eps = 1e-8) =>
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
for (const classification of [true, false]) {
  const rows = splitRows(
    classification ? classificationData(21) : regressionData(21),
  ).train;
  const tree = treeFit(rows, { depth: 3, minLeaf: 3, classification });
  const regions = partitions(tree);
  for (let i = 0; i < 40; i++)
    for (let j = 0; j < 40; j++) {
      const q = { x: -2.99 + (i * 5.98) / 39, z: -2.99 + (j * 5.98) / 39 };
      const leaf = regions.leaves.find(
        ({ bounds: [l, r, b, t] }) =>
          q.x > l && q.x <= r && q.z > b && q.z <= t,
      );
      assert.ok(leaf);
      close(leaf.node.value, treePredict(tree, q));
    }
  const cs = ["x", "z"].flatMap((k) =>
      splitCandidates(rows, k, classification, 3).map((c) => ({
        ...c,
        key: k,
      })),
    ),
    best = cs.reduce((a, b) => (a.score < b.score ? a : b));
  close(tree.gain, best.gain);
  assert.equal(tree.key, best.key);
  close(tree.threshold, best.threshold);
  function everySubtree(n) {
    const leaf = { risk: (n.n / tree.n) * n.impurity, leaves: 1 };
    return n.left
      ? [
          leaf,
          ...everySubtree(n.left).flatMap((l) =>
            everySubtree(n.right).map((r) => ({
              risk: l.risk + r.risk,
              leaves: l.leaves + r.leaves,
            })),
          ),
        ]
      : [leaf];
  }
  const exhaustive = everySubtree(tree);
  let prior = Infinity;
  for (const alpha of [0, 0.0001, 0.002, 0.01, 0.03, 0.1, 0.3, 1, 10]) {
    const p = pruneTree(tree, alpha);
    close(
      p.risk + alpha * p.leaves,
      Math.min(...exhaustive.map((t) => t.risk + alpha * t.leaves)),
    );
    assert.ok(p.leaves <= prior);
    prior = p.leaves;
    for (const r of rows) assert.ok(Number.isFinite(treePredict(p.node, r)));
  }
}
// Independent OLS fixture from NumPy + SciPy, generated from these explicit rows.
const rows = Array.from({ length: 18 }, (_, i) => ({
  id: "I" + i,
  x: (i % 6) - 2.5,
  z: Math.floor(i / 6) - 1,
  y:
    1.2 +
    1.7 * ((i % 6) - 2.5) -
    0.65 * (Math.floor(i / 6) - 1) +
    [0.2, -0.4, 0.1, 0.35, -0.3, 0.05][(i * 5) % 6],
}));
const ci = coefficientIntervals(rows, (r) => [1, r.x, r.z]);
const { readFile } = await import("node:fs/promises");
const fixture = JSON.parse(
  await readFile(
    new URL("../lessons/expanded/spatial-fixtures.json", import.meta.url),
    "utf8",
  ),
);
ci.intervals.forEach((c, i) => {
  close(c.value, fixture.coefficients[i]);
  close(c.se, fixture.se[i]);
  close(c.lo, fixture.lo[i]);
  close(c.hi, fixture.hi[i]);
});
const fit2 = linearFit(rows, (r) => [1, r.x]),
  fit3 = linearFit(rows, (r) => [1, r.x, r.z]);
assert.ok(
  regressionScores(rows, fit3, 3).r2 >= regressionScores(rows, fit2, 2).r2,
);
const model = networkInitial(7),
  sample = splitRows(classificationData(74, "rings", 80)).train;
for (const kind of ["tanh", "sigmoid", "relu"])
  for (const decay of [0, 0.13]) {
    const land = lossLandscape(model, sample, kind, decay),
      eps = 1e-5;
    land.gradient.forEach((v, j) => {
      const plus = [...land.center],
        minus = [...land.center];
      plus[j] += eps;
      minus[j] -= eps;
      close(
        v,
        (land.objective(...plus) - land.objective(...minus)) / (2 * eps),
        2e-8,
      );
    });
    const step = networkStep(model, sample, { kind, rate: 0.2, decay });
    const frozen = structuredClone(model);
    frozen.out[0] = step.model.out[0];
    frozen.out[1] = step.model.out[1];
    const anchored = lossLandscape(
      frozen,
      sample,
      kind,
      decay,
      3,
      21,
      land.origin,
    );
    assert.deepEqual(anchored.origin, land.origin);
    assert.deepEqual(anchored.values, land.values);
    const actual =
      networkLoss(frozen, sample, kind) +
      (decay / 2) * (frozen.out[0] ** 2 + frozen.out[1] ** 2);
    close(land.objective(frozen.out[0], frozen.out[1]), actual);
    assert.ok(actual <= land.value + 1e-10);
  }
const forest = forestFit(sample, 18, 4, 1, 21);
for (const r of forest.oob) {
  const voters = forest.trees.filter((t) => !t.tree.ids.includes(r.id));
  assert.equal(r.voters, voters.length);
  if (voters.length)
    close(
      r.score,
      voters.reduce((v, t) => v + treePredict(t.tree, r), 0) / voters.length,
    );
  else assert.equal(r.score, null);
}
console.log(
  "Spatial science passed: region/prediction equivalence, midpoint search, exhaustive subtree pruning, independent OLS intervals, finite-difference loss landscapes, and bootstrap/OOB exclusions.",
);
