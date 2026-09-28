import assert from "node:assert/strict";
import { knnVoteReceipt } from "../modules/notebook/classification.js";
import { gaussianOlsCriteria } from "../modules/notebook/regression-lab.js";
import { classificationData, splitRows, knnFit, linearFit } from "../modules/notebook/science.js";

const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} ≠ ${expected}`);
const training = splitRows(classificationData()).train;
for (const k of [1, 5, 21])
  for (const scaled of [false, true])
    for (const weighted of [false, true]) {
      const fit = knnFit(training, k, scaled, weighted);
      for (const query of [{ x: 0, z: 0 }, { x: -2, z: 1.5 }, training[0]]) {
        const votes = knnVoteReceipt(fit, query, weighted);
        assert.equal(votes.rows.length, k);
        assert.deepEqual(votes.rows.map((r) => r.id), fit.neighbors(query).map((r) => r.id));
        close(votes.rows.reduce((n, r) => n + r.weight, 0), 1, "complete normalized vote");
        close(votes.classZero + votes.classOne, 1, "all class shares");
        close(votes.classOne, fit.predict(query), "visual/model agreement");
        assert.ok(votes.rows.every((r) => r.weight >= 0 && r.weight <= 1));
        if (votes.exactMatches)
          assert.ok(votes.rows.filter((r) => r.distance >= 1e-10).every((r) => r.weight === 0));
      }
    }

const simple = [
  { id: "a", x: 1, z: 0, y: 0 },
  { id: "b", x: 2, z: 0, y: 1 },
  { id: "c", x: 4, z: 0, y: 1 },
];
const weighted = knnVoteReceipt(knnFit(simple, 3, false, true), { x: 0, z: 0 }, true);
weighted.rows.forEach((r, i) => close(r.weight, [4 / 7, 2 / 7, 1 / 7][i], "inverse-distance share"));
close(weighted.classOne, 3 / 7, "independent weighted example");
const duplicates = [{ ...simple[0], x: 0 }, { ...simple[1], x: 0 }, simple[2]];
for (const useWeights of [false, true]) {
  const fit = knnFit(duplicates, 3, false, useWeights),
    vote = knnVoteReceipt(fit, { x: 0, z: 0 }, useWeights);
  assert.equal(vote.exactMatches, 2);
  assert.deepEqual(vote.rows.map((r) => r.weight), [0.5, 0.5, 0]);
  close(vote.classOne, 0.5, "conflicting exact matches");
}

// Hand-solvable OLS: yhat = 1 + 2x; residuals [1,-1,0,-1,1].
const rows = [-2, -1, 0, 1, 2].map((x, i) => ({ x, y: [-2, -2, 1, 2, 6][i] })),
  basis = (r) => [1, r.x],
  criteria = gaussianOlsCriteria(rows, basis);
close(criteria.rss, 4, "OLS RSS");
assert.equal(criteria.parameters, 3, "intercept + slope + variance");
close(criteria.aic, 5 * Math.log(4 / 5) + 2 * 3, "Gaussian AIC");
close(criteria.bic, 5 * Math.log(4 / 5) + 3 * Math.log(5), "Gaussian BIC");
assert.notDeepEqual(linearFit(rows, basis, 2).coefficients, criteria.fit.coefficients);
console.log("Vote/criteria checks passed: all K neighbors, inverse-distance normalization, exact matches, hand-calculated OLS likelihood and parameter count.");
