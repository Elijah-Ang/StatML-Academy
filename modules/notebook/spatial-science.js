import {
  mean,
  variance,
  linearFit,
  solve,
  sum,
  tTail,
  networkForward,
  networkLoss,
  networkStep,
} from "./science.js";
export function partitions(tree, bounds = [-3, 3, -3, 3]) {
  const leaves = [],
    cuts = [];
  function walk(n, b, depth) {
    if (!n.left) {
      leaves.push({ node: n, bounds: b, depth });
      return;
    }
    cuts.push({ node: n, bounds: b, depth });
    const [x0, x1, z0, z1] = b,
      t = n.threshold;
    walk(n.left, n.key === "x" ? [x0, t, z0, z1] : [x0, x1, z0, t], depth + 1);
    walk(n.right, n.key === "x" ? [t, x1, z0, z1] : [x0, x1, t, z1], depth + 1);
  }
  walk(tree, bounds, 0);
  return { leaves, cuts };
}
export function splitCandidates(rows, key, classification, minLeaf = 2) {
  const imp = (rs) =>
    classification
      ? 2 * mean(rs.map((r) => r.y)) * (1 - mean(rs.map((r) => r.y)))
      : variance(
          rs.map((r) => r.y),
          0,
        );
  const values = [...new Set(rows.map((r) => r[key]))].sort((a, b) => a - b),
    parent = imp(rows),
    out = [];
  for (let i = 0; i < values.length - 1; i++) {
    const threshold = (values[i] + values[i + 1]) / 2,
      left = rows.filter((r) => r[key] <= threshold),
      right = rows.filter((r) => r[key] > threshold);
    if (Math.min(left.length, right.length) < minLeaf) continue;
    const score =
      (left.length * imp(left) + right.length * imp(right)) / rows.length;
    out.push({ threshold, left, right, score, gain: parent - score, parent });
  }
  return out;
}
// Globally optimal subtree of this fixed grown tree for R(T)+alpha*leaves.
// R is sum(node.n/root.n * node.impurity); alpha therefore has impurity units.
export function pruneTree(tree, alpha) {
  function visit(n) {
    const risk = (n.n / tree.n) * n.impurity;
    if (!n.left) return { node: { ...n }, risk, leaves: 1 };
    const l = visit(n.left),
      r = visit(n.right);
    if (
      risk + alpha <=
      l.risk + r.risk + alpha * (l.leaves + r.leaves) + 1e-12
    ) {
      const node = { ...n };
      delete node.left;
      delete node.right;
      delete node.key;
      delete node.threshold;
      delete node.gain;
      return { node, risk, leaves: 1 };
    }
    return {
      node: { ...n, left: l.node, right: r.node },
      risk: l.risk + r.risk,
      leaves: l.leaves + r.leaves,
    };
  }
  return visit(tree);
}
export function coefficientIntervals(rows, basis) {
  const fit = linearFit(rows, basis),
    p = fit.coefficients.length,
    n = rows.length,
    df = n - p;
  const rss = sum(rows.map((r) => (r.y - fit.predict(r)) ** 2)),
    X = rows.map(basis);
  const gram = Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) => sum(X.map((r) => r[i] * r[j]))),
  );
  let lo = 0,
    hi = 30;
  for (let i = 0; i < 70; i++) {
    let m = (lo + hi) / 2;
    if (tTail(m, df) > 0.05) lo = m;
    else hi = m;
  }
  const critical = (lo + hi) / 2;
  const intervals = fit.coefficients.map((value, j) => {
    const e = Array.from({ length: p }, (_, i) => +(i === j)),
      col = solve(gram, e),
      se = Math.sqrt(Math.max(0, (rss / df) * col[j]));
    return { value, se, lo: value - critical * se, hi: value + critical * se };
  });
  return { fit, intervals, df, rss };
}
export function regressionScores(rows, fit, p) {
  const rss = sum(rows.map((r) => (r.y - fit.predict(r)) ** 2)),
    mu = mean(rows.map((r) => r.y)),
    tss = sum(rows.map((r) => (r.y - mu) ** 2));
  return {
    r2: 1 - rss / tss,
    adjusted: 1 - rss / (rows.length - p) / (tss / (rows.length - 1)),
    rss,
  };
}
// Fix hidden features and all but two output weights. Every height is the same
// training BCE + L2 objective used by this restricted two-parameter update.
export function lossLandscape(
  model,
  rows,
  kind,
  decay = 0,
  span = 3,
  n = 21,
  origin = model.out.slice(0, 2),
) {
  const center = [model.out[0], model.out[1]];
  span = Math.max(
    span,
    1.3 * Math.abs(center[0] - origin[0]),
    1.3 * Math.abs(center[1] - origin[1]),
  );
  const bounds = [
    origin[0] - span,
    origin[0] + span,
    origin[1] - span,
    origin[1] + span,
  ];
  const fs = rows.map((r) => ({ ...networkForward(model, r, kind), y: r.y }));
  const objective = (x, z) =>
    mean(
      fs.map((f) => {
        const score =
          model.bias + x * f.a[0] + z * f.a[1] + model.out[2] * f.a[2];
        return (
          Math.max(score, 0) -
          f.y * score +
          Math.log1p(Math.exp(-Math.abs(score)))
        );
      }),
    ) +
    (decay / 2) * (x * x + z * z);
  const g = networkStep(model, rows, { rate: 0, kind }).gradient;
  const gradient = [g.out[0] + decay * center[0], g.out[1] + decay * center[1]];
  const values = Array.from({ length: n }, (_, j) =>
    Array.from({ length: n }, (_, i) =>
      objective(
        bounds[0] + (2 * span * i) / (n - 1),
        bounds[2] + (2 * span * j) / (n - 1),
      ),
    ),
  );
  return {
    center,
    origin,
    span,
    bounds,
    gradient,
    values,
    value: objective(...center),
    objective,
  };
}
