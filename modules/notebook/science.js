/* Deterministic teaching calculations shared by the extended notebook lessons. */
import { seeded, mean, sum, clamp, confusion } from "./models.js";
export { seeded, mean, sum, clamp, confusion };
export const variance = (xs, ddof = 1) =>
  xs.length > ddof
    ? sum(xs.map((x) => (x - mean(xs)) ** 2)) / (xs.length - ddof)
    : 0;
export function gaussianRandom(rng) {
  return (
    Math.sqrt(-2 * Math.log(Math.max(1e-12, rng()))) *
    Math.cos(2 * Math.PI * rng())
  );
}
export function splitRows(rows) {
  return {
    train: rows.filter((_, i) => i % 5 < 3),
    validation: rows.filter((_, i) => i % 5 === 3),
    test: rows.filter((_, i) => i % 5 === 4),
  };
}
export function regressionData(
  seed = 31,
  scenario = "curve",
  noise = 0.3,
  n = 75,
) {
  const rng = seeded(seed);
  return Array.from({ length: n }, (_, i) => {
    const x = -2 + 4 * rng(),
      z = -2 + 4 * rng(),
      truth =
        scenario === "linear"
          ? 1 + 1.5 * x + 0.8 * z
          : scenario === "funnel"
            ? 1 + 1.5 * x
            : 1 + 0.6 * x + 0.85 * x * x;
    let y =
      truth +
      gaussianRandom(rng) *
        noise *
        (scenario === "funnel" ? 0.4 + Math.abs(x) : 1);
    if (scenario === "outlier" && i === 0) y += 6;
    return { id: `R${i + 1}`, x, z, y, truth };
  });
}
export function classificationData(seed = 42, scenario = "clouds", n = 80) {
  const rng = seeded(seed);
  return Array.from({ length: n }, (_, i) => {
    const label = i % 2;
    let x, z;
    if (scenario === "rings") {
      const a = rng() * Math.PI * 2,
        r = (label ? 1.6 : 0.55) + gaussianRandom(rng) * 0.16;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    } else {
      const a = gaussianRandom(rng),
        b = gaussianRandom(rng);
      x = (label ? 0.75 : -0.75) + a * 0.7;
      z =
        (label ? 0.45 : -0.45) +
        b * (scenario === "unequal" && label ? 1.1 : 0.6) +
        (scenario === "unequal" && label ? a * 0.45 : 0);
    }
    return { id: `C${i + 1}`, x, z, y: label, label };
  });
}
export function solve(matrix, vector) {
  const a = matrix.map((row, i) => [...row, vector[i]]),
    n = vector.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++)
      if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i;
    if (Math.abs(a[p][c]) < 1e-10) return null;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c];
    for (let j = c; j <= n; j++) a[c][j] /= d;
    for (let i = 0; i < n; i++)
      if (i !== c) {
        const q = a[i][c];
        for (let j = c; j <= n; j++) a[i][j] -= q * a[c][j];
      }
  }
  return a.map((row) => row[n]);
}
export const polynomialBasis = (r, degree) =>
  Array.from({ length: degree + 1 }, (_, i) => r.x ** i);
export function linearFit(rows, basis, lambda = 0, lasso = false) {
  const design = rows.map(basis),
    p = design[0].length,
    n = rows.length;
  let coefficients;
  if (lasso) {
    coefficients = Array(p).fill(0);
    coefficients[0] = mean(rows.map((r) => r.y));
    for (let pass = 0; pass < 250; pass++) {
      let change = 0;
      for (let j = 0; j < p; j++) {
        const old = coefficients[j],
          rho =
            sum(
              rows.map(
                (r, i) =>
                  design[i][j] *
                  (r.y -
                    sum(
                      coefficients.map((b, k) =>
                        k === j ? 0 : b * design[i][k],
                      ),
                    )),
              ),
            ) / n,
          den = sum(design.map((row) => row[j] ** 2)) / n;
        coefficients[j] =
          den > 1e-12
            ? (j === 0
                ? rho
                : Math.sign(rho) * Math.max(0, Math.abs(rho) - lambda)) / den
            : 0;
        change += Math.abs(old - coefficients[j]);
      }
      if (change < 1e-9) break;
    }
  } else {
    const xtx = Array.from({ length: p }, (_, j) =>
      Array.from(
        { length: p },
        (_, k) =>
          sum(design.map((row) => row[j] * row[k])) / n +
          (j === k && j > 0 ? lambda : 0),
      ),
    );
    const xty = Array.from(
      { length: p },
      (_, j) => sum(rows.map((r, i) => design[i][j] * r.y)) / n,
    );
    coefficients = solve(xtx, xty);
  }
  return {
    coefficients,
    predict: (r) =>
      coefficients ? sum(basis(r).map((v, j) => v * coefficients[j])) : NaN,
  };
}
export const mse = (rows, predict) =>
  mean(rows.map((r) => (r.y - predict(r)) ** 2));
export const mae = (rows, predict) =>
  mean(rows.map((r) => Math.abs(r.y - predict(r))));
export function correlation(points) {
  const mx = mean(points.map((p) => p.x)),
    my = mean(points.map((p) => p.y));
  const xx = sum(points.map((p) => (p.x - mx) ** 2)),
    yy = sum(points.map((p) => (p.y - my) ** 2)),
    xy = sum(points.map((p) => (p.x - mx) * (p.y - my)));
  return { mx, my, xx, yy, xy, r: xx && yy ? xy / Math.sqrt(xx * yy) : null };
}
export function covariance(points) {
  const mx = mean(points.map((p) => p.x)),
    mz = mean(points.map((p) => p.z));
  return {
    mx,
    mz,
    xx:
      sum(points.map((p) => (p.x - mx) ** 2)) / Math.max(1, points.length - 1),
    zz:
      sum(points.map((p) => (p.z - mz) ** 2)) / Math.max(1, points.length - 1),
    xz:
      sum(points.map((p) => (p.x - mx) * (p.z - mz))) /
      Math.max(1, points.length - 1),
  };
}
export function pca(points, standardize = false) {
  const c = covariance(points),
    sx = standardize ? Math.sqrt(c.xx) || 1 : 1,
    sz = standardize ? Math.sqrt(c.zz) || 1 : 1;
  const centered = points.map((p) => ({
      ...p,
      x: (p.x - c.mx) / sx,
      z: (p.z - c.mz) / sz,
    })),
    s = covariance(centered),
    angle = 0.5 * Math.atan2(2 * s.xz, s.xx - s.zz),
    delta = Math.sqrt((s.xx - s.zz) ** 2 + 4 * s.xz * s.xz),
    eigenvalues = [
      (s.xx + s.zz + delta) / 2,
      Math.max(0, (s.xx + s.zz - delta) / 2),
    ];
  const scores = centered.map((p) => ({
    ...p,
    pc1: p.x * Math.cos(angle) + p.z * Math.sin(angle),
    pc2: -p.x * Math.sin(angle) + p.z * Math.cos(angle),
  }));
  return {
    ...s,
    mx: c.mx,
    mz: c.mz,
    sx,
    sz,
    centered,
    angle,
    eigenvalues,
    scores,
    pve: eigenvalues[0] / sum(eigenvalues),
  };
}
export function hierarchical(points, linkage = "average") {
  let groups = points.map((p, i) => ({ id: i, members: [i], height: 0 })),
    snapshots = [structuredClone(groups)],
    merges = [],
    id = points.length;
  const distance = (a, b) => {
    const d = a.members.flatMap((i) =>
      b.members.map((j) =>
        Math.hypot(points[i].x - points[j].x, points[i].z - points[j].z),
      ),
    );
    if (linkage === "single") return Math.min(...d);
    if (linkage === "complete") return Math.max(...d);
    if (linkage === "ward") {
      const center = (g) => [
          mean(g.members.map((i) => points[i].x)),
          mean(g.members.map((i) => points[i].z)),
        ],
        u = center(a),
        v = center(b);
      return (
        ((a.members.length * b.members.length) /
          (a.members.length + b.members.length)) *
        ((u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2)
      );
    }
    return mean(d);
  };
  while (groups.length > 1) {
    let best = [0, 1],
      min = Infinity;
    for (let i = 0; i < groups.length; i++)
      for (let j = i + 1; j < groups.length; j++) {
        const d = distance(groups[i], groups[j]);
        if (d < min) {
          min = d;
          best = [i, j];
        }
      }
    const [a, b] = best.map((i) => groups[i]),
      g = {
        id: id++,
        members: [...a.members, ...b.members],
        height: min,
        left: a.id,
        right: b.id,
      };
    merges.push(g);
    groups = groups.filter((_, i) => !best.includes(i));
    groups.push(g);
    snapshots.push(structuredClone(groups));
  }
  return { merges, snapshots };
}
export const sigmoid = (x) =>
  x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
export const logLoss = (rows, predict) =>
  -mean(
    rows.map((r) => {
      const p = clamp(predict(r), 1e-12, 1 - 1e-12);
      return r.y * Math.log(p) + (1 - r.y) * Math.log(1 - p);
    }),
  );
export function logisticStep(rows, w, rate = 0.2, lambda = 0.02) {
  const gradient = w.map(
    (v, j) =>
      mean(
        rows.map(
          (r) =>
            (sigmoid(w[0] + w[1] * r.x + w[2] * r.z) - r.y) * [1, r.x, r.z][j],
        ),
      ) + (j ? lambda * v : 0),
  );
  return { weights: w.map((v, j) => v - rate * gradient[j]), gradient };
}
export function logisticFit(rows, steps = 300, rate = 0.2, lambda = 0.02) {
  let w = [0, 0, 0];
  for (let i = 0; i < steps; i++)
    w = logisticStep(rows, w, rate, lambda).weights;
  return {
    weights: w,
    predict: (r) => sigmoid(w[0] + w[1] * r.x + w[2] * r.z),
  };
}
export function knnFit(rows, k = 5, scaled = true, weighted = false) {
  const c = covariance(rows),
    sx = scaled ? Math.sqrt(c.xx) || 1 : 1,
    sz = scaled ? Math.sqrt(c.zz) || 1 : 1;
  const neighbors = (query) =>
    rows
      .map((r) => ({
        ...r,
        distance: Math.hypot((r.x - query.x) / sx, (r.z - query.z) / sz),
      }))
      .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
      .slice(0, k);
  return {
    neighbors,
    predict: (q) => {
      const near = neighbors(q),
        exact = near.filter((r) => r.distance < 1e-10);
      if (exact.length) return mean(exact.map((r) => r.y));
      const ws = near.map((r) => (weighted ? 1 / r.distance : 1));
      return sum(near.map((r, i) => r.y * ws[i])) / sum(ws);
    },
    sx,
    sz,
  };
}
export function discriminantFit(
  rows,
  separate = false,
  shrink = 0,
  equalPriors = false,
) {
  const classes = [0, 1].map((y) => rows.filter((r) => r.y === y)),
    cs = classes.map(covariance),
    df = rows.length - 2,
    pool = {};
  for (const key of ["xx", "zz", "xz"])
    pool[key] = sum(cs.map((c, i) => (classes[i].length - 1) * c[key])) / df;
  const estimates = cs.map((c, i) => {
    const raw = separate ? c : pool;
    const xx = (1 - shrink) * raw.xx + shrink * pool.xx + 1e-5,
      zz = (1 - shrink) * raw.zz + shrink * pool.zz + 1e-5,
      xz = (1 - shrink) * raw.xz + shrink * pool.xz,
      det = xx * zz - xz * xz;
    return {
      ...c,
      xx,
      zz,
      xz,
      det,
      prior: equalPriors ? 0.5 : classes[i].length / rows.length,
      n: classes[i].length,
    };
  });
  const scores = (r) =>
    estimates.map((c) => {
      const x = r.x - c.mx,
        z = r.z - c.mz,
        d = (c.zz * x * x - 2 * c.xz * x * z + c.xx * z * z) / c.det;
      return Math.log(c.prior) - 0.5 * Math.log(c.det) - 0.5 * d;
    });
  return {
    estimates,
    pool,
    scores,
    predict: (r) => {
      const s = scores(r);
      return sigmoid(s[1] - s[0]);
    },
  };
}
export function treeFit(
  rows,
  {
    depth = 3,
    minLeaf = 2,
    classification = true,
    features = 2,
    seed = 4,
  } = {},
) {
  const rng = seeded(seed);
  let serial = 0;
  const impurity = (rs) =>
    classification
      ? 2 * mean(rs.map((r) => r.y)) * (1 - mean(rs.map((r) => r.y)))
      : variance(
          rs.map((r) => r.y),
          0,
        );
  function build(rs, d) {
    const node = {
      id: serial++,
      n: rs.length,
      value: mean(rs.map((r) => r.y)),
      impurity: impurity(rs),
      ids: rs.map((r) => r.id),
    };
    if (d >= depth || rs.length < 2 * minLeaf || node.impurity < 1e-12)
      return node;
    let best = null;
    const keys = features === 1 ? [rng() < 0.5 ? "x" : "z"] : ["x", "z"];
    for (const key of keys) {
      const values = [...new Set(rs.map((r) => r[key]))].sort((a, b) => a - b);
      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2,
          left = rs.filter((r) => r[key] <= threshold),
          right = rs.filter((r) => r[key] > threshold);
        if (left.length < minLeaf || right.length < minLeaf) continue;
        const score =
          (left.length * impurity(left) + right.length * impurity(right)) /
          rs.length;
        if (!best || score < best.score - 1e-12)
          best = { key, threshold, left, right, score };
      }
    }
    if (!best || best.score >= node.impurity - 1e-12) return node;
    node.key = best.key;
    node.threshold = best.threshold;
    node.gain = node.impurity - best.score;
    node.left = build(best.left, d + 1);
    node.right = build(best.right, d + 1);
    return node;
  }
  return build(rows, 0);
}
export function treePath(tree, row) {
  const path = [tree];
  while (tree.left) {
    tree = row[tree.key] <= tree.threshold ? tree.left : tree.right;
    path.push(tree);
  }
  return path;
}
export const treePredict = (tree, row) => treePath(tree, row).at(-1).value;
export function forestFit(
  rows,
  count = 12,
  depth = 3,
  features = 1,
  seed = 21,
) {
  const rng = seeded(seed),
    trees = Array.from({ length: count }, (_, i) => {
      const sample = Array.from(
        { length: rows.length },
        () => rows[Math.floor(rng() * rows.length)],
      );
      return {
        tree: treeFit(sample, { depth, minLeaf: 2, features, seed: seed + i }),
        inBag: new Set(sample.map((r) => r.id)),
      };
    });
  const predict = (r) => mean(trees.map((t) => treePredict(t.tree, r)));
  const oob = rows.map((r) => {
    const voters = trees.filter((t) => !t.inBag.has(r.id));
    return {
      ...r,
      score: voters.length
        ? mean(voters.map((t) => treePredict(t.tree, r)))
        : null,
      voters: voters.length,
    };
  });
  return { trees, predict, oob };
}
export function boostFit(rows, validation, rounds = 20, rate = 0.2, depth = 1) {
  const initial = mean(rows.map((r) => r.y)),
    trees = [],
    trace = [];
  const predictAt = (r, n = trees.length) =>
    initial + rate * sum(trees.slice(0, n).map((t) => treePredict(t, r)));
  trace.push({
    round: 0,
    train: mse(rows, predictAt),
    validation: mse(validation, predictAt),
  });
  for (let i = 0; i < rounds; i++) {
    const residuals = rows.map((r) => ({ ...r, y: r.y - predictAt(r) }));
    trees.push(
      treeFit(residuals, { depth, classification: false, minLeaf: 3 }),
    );
    trace.push({
      round: i + 1,
      train: mse(rows, predictAt),
      validation: mse(validation, predictAt),
    });
  }
  return { initial, trees, trace, predict: predictAt };
}
export function oneRuleFit(rows, feature = "auto") {
  const fallback=mean(rows.map(r=>r.y))>=.5?1:0;
  const rules = ["x", "z"].map((key) => {
    const sorted = rows.map((r) => r[key]).filter(Number.isFinite).sort((a, b) => a - b),
      cuts = [
        sorted[Math.floor(sorted.length / 3)],
        sorted[Math.floor((sorted.length * 2) / 3)],
      ],
      bucket = (r) => !sorted.length || !Number.isFinite(r[key]) ? null : (r[key] <= cuts[0] ? 0 : r[key] <= cuts[1] ? 1 : 2);
    const values = [0, 1, 2].map((k) => {
      const rs = rows.filter((r) => bucket(r) === k);
      return {
        n: rs.length,
        positive: sum(rs.map((r) => r.y)),
        prediction: rs.length ? (mean(rs.map((r) => r.y)) >= 0.5 ? 1 : 0) : fallback,
      };
    });
    const predict = (r) => bucket(r)==null ? fallback : values[bucket(r)].prediction;
    return {
      key,
      cuts,
      values,
      fallback,
      bucket,
      predict,
      errors: sum(rows.map((r) => +(predict(r) !== r.y))),
    };
  });
  return feature === "auto"
    ? rules.reduce((a, b) => (a.errors <= b.errors ? a : b))
    : rules.find((r) => r.key === feature);
}
export function svmFit(rows, C = 1, kernel = "linear", gamma = 0.8) {
  const n = rows.length,
    y = rows.map((r) => (r.y ? 1 : -1)),
    a = Array(n).fill(0),
    K = rows.map((p) =>
      rows.map((q) =>
        kernel === "rbf"
          ? Math.exp(-gamma * ((p.x - q.x) ** 2 + (p.z - q.z) ** 2))
          : p.x * q.x + p.z * q.z,
      ),
    );
  let b = 0,
    passes = 0,
    iteration = 0;
  const f = (i) => b + sum(a.map((v, j) => v * y[j] * K[j][i]));
  while (passes < 8 && iteration++ < 350) {
    let changed = 0;
    for (let i = 0; i < n; i++) {
      const ei = f(i) - y[i];
      if (
        !(
          (y[i] * ei < -0.001 && a[i] < C - 1e-8) ||
          (y[i] * ei > 0.001 && a[i] > 1e-8)
        )
      )
        continue;
      let j = (i + iteration) % n;
      if (j === i) j = (j + 1) % n;
      const ej = f(j) - y[j],
        ai = a[i],
        aj = a[j];
      let lo, hi;
      if (y[i] !== y[j]) {
        lo = Math.max(0, aj - ai);
        hi = Math.min(C, C + aj - ai);
      } else {
        lo = Math.max(0, ai + aj - C);
        hi = Math.min(C, ai + aj);
      }
      if (hi - lo < 1e-10) continue;
      const eta = 2 * K[i][j] - K[i][i] - K[j][j];
      if (eta >= -1e-12) continue;
      a[j] = clamp(aj - (y[j] * (ei - ej)) / eta, lo, hi);
      if (Math.abs(a[j] - aj) < 1e-6) {
        a[j] = aj;
        continue;
      }
      a[i] = ai + y[i] * y[j] * (aj - a[j]);
      const b1 =
          b - ei - y[i] * (a[i] - ai) * K[i][i] - y[j] * (a[j] - aj) * K[i][j],
        b2 =
          b - ej - y[i] * (a[i] - ai) * K[i][j] - y[j] * (a[j] - aj) * K[j][j];
      b =
        a[i] > 1e-8 && a[i] < C - 1e-8
          ? b1
          : a[j] > 1e-8 && a[j] < C - 1e-8
            ? b2
            : (b1 + b2) / 2;
      changed++;
    }
    passes = changed ? 0 : passes + 1;
  }
  const score = (q) =>
    b +
    sum(
      rows.map(
        (r, i) =>
          a[i] *
          y[i] *
          (kernel === "rbf"
            ? Math.exp(-gamma * ((r.x - q.x) ** 2 + (r.z - q.z) ** 2))
            : r.x * q.x + r.z * q.z),
      ),
    );
  const norm2 = sum(
    a.map((ai, i) => sum(a.map((aj, j) => ai * aj * y[i] * y[j] * K[i][j]))),
  );
  return {
    a,
    b,
    score,
    predict: (r) => (score(r) >= 0 ? 1 : 0),
    support: rows.filter((_, i) => a[i] > 1e-6),
    norm: Math.sqrt(Math.max(0, norm2)),
    objective:
      0.5 * norm2 +
      C * sum(rows.map((r, i) => Math.max(0, 1 - y[i] * score(r)))),
    iterations: iteration,
  };
}
// Distribution utilities: regularized gamma/beta with bounded continued fractions.
export function logGamma(z) {
  const c = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.984369578019572e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5)
    return (
      Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
    );
  z--;
  let x = 0.99999999999980993;
  for (let i = 0; i < c.length; i++) x += c[i] / (z + i + 1);
  const t = z + c.length - 0.5;
  return 0.9189385332046727 + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function betaFraction(a, b, x) {
  let c = 1,
    d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m < 250; m++) {
    let aa = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 3e-14) break;
  }
  return h;
}
export function betaCDF(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) -
      logGamma(a) -
      logGamma(b) +
      a * Math.log(x) +
      b * Math.log1p(-x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (bt * betaFraction(a, b, x)) / a
    : 1 - (bt * betaFraction(b, a, 1 - x)) / b;
}
export const fTail = (f, d1, d2) => betaCDF(d2 / (d2 + d1 * f), d2 / 2, d1 / 2);
export const tTail = (t, df) => betaCDF(df / (df + t * t), df / 2, 0.5);
export function normalCDF(x) {
  const sign = x < 0 ? -1 : 1,
    z = Math.abs(x) / Math.SQRT2,
    t = 1 / (1 + 0.3275911 * z),
    erf =
      1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
        t +
        0.254829592) *
        t *
        Math.exp(-z * z);
  return 0.5 * (1 + sign * erf);
}
export const normalPDF = (x, mu = 0, sd = 1) =>
  Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
export function chiTail(x, df) {
  if (x <= 0) return 1;
  const a = df / 2,
    z = x / 2;
  if (z < a + 1) {
    let term = 1 / a,
      s = term;
    for (let n = 1; n < 500; n++) {
      term *= z / (a + n);
      s += term;
      if (term < s * 1e-14) break;
    }
    return clamp(1 - s * Math.exp(-z + a * Math.log(z) - logGamma(a)), 0, 1);
  }
  let b = z + 1 - a,
    c = 1e30,
    d = 1 / b,
    h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-14) break;
  }
  return clamp(Math.exp(-z + a * Math.log(z) - logGamma(a)) * h, 0, 1);
}
export function anovaData(gap = 8, noise = 5, seed = 19) {
  const rng = seeded(seed);
  return Array.from({ length: 24 }, (_, i) => ({
    id: `A${i + 1}`,
    group: Math.floor(i / 8),
    y: 55 + Math.floor(i / 8) * gap + gaussianRandom(rng) * noise,
  }));
}
export function anova(rows) {
  const groups = [...new Set(rows.map((r) => r.group))].map((g) =>
      rows.filter((r) => r.group === g),
    ),
    grand = mean(rows.map((r) => r.y)),
    means = groups.map((rs) => mean(rs.map((r) => r.y))),
    between = sum(groups.map((rs, i) => rs.length * (means[i] - grand) ** 2)),
    within = sum(
      groups.map((rs, i) => sum(rs.map((r) => (r.y - means[i]) ** 2))),
    ),
    d1 = groups.length - 1,
    d2 = rows.length - groups.length,
    F = between / d1 / (within / d2);
  return {
    grand,
    means,
    between,
    within,
    total: between + within,
    d1,
    d2,
    F,
    p: fTail(F, d1, d2),
    eta: between / (between + within),
  };
}
export function chiSquare(cells) {
  const row = [cells[0] + cells[1], cells[2] + cells[3]],
    col = [cells[0] + cells[2], cells[1] + cells[3]],
    n = sum(cells),
    expected = [
      (row[0] * col[0]) / n,
      (row[0] * col[1]) / n,
      (row[1] * col[0]) / n,
      (row[1] * col[1]) / n,
    ],
    contributions = cells.map((o, i) => (o - expected[i]) ** 2 / expected[i]),
    stat = sum(contributions);
  return {
    n,
    row,
    col,
    expected,
    contributions,
    stat,
    p: chiTail(stat, 1),
    v: Math.sqrt(stat / n),
  };
}
export function timeData(trend = 0.15, season = 3, shift = 0, seed = 13) {
  const rng = seeded(seed);
  return Array.from({ length: 48 }, (_, i) => {
    const level = 20 + trend * i + (i >= 36 ? shift : 0),
      seasonal = season * Math.sin((i * 2 * Math.PI) / 12),
      noise = gaussianRandom(rng) * 0.55;
    return {
      id: `M${i + 1}`,
      x: i + 1,
      trend: level,
      seasonal,
      noise,
      y: level + seasonal + noise,
    };
  });
}
export function acf(values, lag) {
  const m = mean(values),
    den = sum(values.map((v) => (v - m) ** 2));
  return den
    ? sum(values.slice(lag).map((v, i) => (v - m) * (values[i] - m))) / den
    : 0;
}
// A tiny 2→3→1 network: gradients are computed before any parameter is updated.
export function networkInitial(seed = 7) {
  const rng = seeded(seed);
  return {
    hidden: Array.from({ length: 3 }, () => ({
      w: [rng() - 0.5, rng() - 0.5],
      b: 0,
    })),
    out: [rng() - 0.5, rng() - 0.5, rng() - 0.5],
    bias: 0,
  };
}
export const activation = (z, kind) =>
  kind === "relu"
    ? Math.max(0, z)
    : kind === "sigmoid"
      ? sigmoid(z)
      : Math.tanh(z);
const derivative = (z, a, kind) =>
  kind === "relu" ? +(z > 0) : kind === "sigmoid" ? a * (1 - a) : 1 - a * a;
export function networkForward(model, row, kind = "tanh", mask = [1, 1, 1]) {
  const z = model.hidden.map((h) => h.b + h.w[0] * row.x + h.w[1] * row.z),
    a = z.map((v) => activation(v, kind)),
    used = a.map((v, i) => v * mask[i]),
    score = model.bias + sum(used.map((v, i) => v * model.out[i]));
  return { z, a, used, score, p: sigmoid(score) };
}
export function networkStep(
  model,
  rows,
  { rate = 0.2, decay = 0, kind = "tanh", mask = [1, 1, 1] } = {},
) {
  const gradient = {
    hidden: model.hidden.map(() => ({ w: [0, 0], b: 0 })),
    out: [0, 0, 0],
    bias: 0,
  };
  for (const row of rows) {
    const f = networkForward(model, row, kind, mask),
      d = (f.p - row.y) / rows.length;
    gradient.bias += d;
    model.hidden.forEach((h, i) => {
      gradient.out[i] += d * f.used[i];
      const dz = d * model.out[i] * mask[i] * derivative(f.z[i], f.a[i], kind);
      gradient.hidden[i].w[0] += dz * row.x;
      gradient.hidden[i].w[1] += dz * row.z;
      gradient.hidden[i].b += dz;
    });
  }
  const next = structuredClone(model);
  next.bias -= rate * gradient.bias;
  next.out = next.out.map((w, i) => w - rate * (gradient.out[i] + decay * w));
  next.hidden = next.hidden.map((h, i) => ({
    w: h.w.map((w, j) => w - rate * (gradient.hidden[i].w[j] + decay * w)),
    b: h.b - rate * gradient.hidden[i].b,
  }));
  return { model: next, gradient };
}
export const networkLoss = (model, rows, kind = "tanh") =>
  logLoss(rows, (r) => networkForward(model, r, kind).p);
export const imagePatch = [
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];
export const filters = {
  vertical: [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ],
  horizontal: [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ],
};
export const convolve = (kernel, r, c) =>
  sum(
    kernel.flatMap((row, i) => row.map((v, j) => v * imagePatch[r + i][c + j])),
  );
export function attention(index = 1) {
  const q = [
      [0.2, 0.5],
      [1, 0.1],
      [0.3, 0.2],
      [0.9, 0.7],
    ],
    k = [
      [0.1, 0.3],
      [1, 0.8],
      [0.2, 0.1],
      [0.8, 0.6],
    ],
    v = [
      [0.1, 0.2],
      [0.9, 0.4],
      [0.2, 0.1],
      [0.7, 0.8],
    ],
    scores = k.map(
      (key) => sum(key.map((x, i) => x * q[index][i])) / Math.SQRT2,
    ),
    max = Math.max(...scores),
    exp = scores.map((s) => Math.exp(s - max)),
    weights = exp.map((e) => e / sum(exp));
  return {
    scores,
    weights,
    context: [0, 1].map((i) => sum(weights.map((w, j) => w * v[j][i]))),
  };
}
