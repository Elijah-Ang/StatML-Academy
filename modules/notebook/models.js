/* Pure teaching models. Rendering, resizing and navigation never sample data. */
export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs) => sum(xs) / xs.length;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export function seeded(seed = 42) {
  let x = seed >>> 0;
  return () => {
    x += 0x6d2b79f5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const initialRegression = () =>
  [50, 55, 61, 64, 70].map((y, i) => ({ id: "ABCDE"[i], x: i + 1, y }));
export function lineSummary(points, m, b) {
  const rows = points.map((p) => ({
    ...p,
    predicted: m * p.x + b,
    residual: p.y - (m * p.x + b),
  }));
  return {
    rows,
    sse: sum(rows.map((p) => p.residual ** 2)),
    mae: mean(rows.map((p) => Math.abs(p.residual))),
  };
}
export function leastSquares(points) {
  const mx = mean(points.map((p) => p.x)),
    my = mean(points.map((p) => p.y));
  const xx = sum(points.map((p) => (p.x - mx) ** 2));
  const xy = sum(points.map((p) => (p.x - mx) * (p.y - my)));
  const sst = sum(points.map((p) => (p.y - my) ** 2));
  if (xx < 1e-12) return { valid: false, mx, my, xx, xy, sst };
  const m = xy / xx,
    b = my - m * mx,
    result = lineSummary(points, m, b);
  return {
    valid: true,
    mx,
    my,
    xx,
    xy,
    sst,
    m,
    b,
    ...result,
    r2: sst > 1e-12 ? 1 - result.sse / sst : null,
    rse: points.length > 2 ? Math.sqrt(result.sse / (points.length - 2)) : null,
  };
}
export function clusterData(seed = 23, scenario = "clouds") {
  const random = seeded(seed),
    pts = [];
  for (let i = 0; i < 36; i++) {
    let x, y;
    if (scenario === "moons") {
      const t = ((i % 18) / 17) * Math.PI;
      x = 35 + 13 * (i < 18 ? Math.cos(t) : 1 - Math.cos(t));
      y = 2500 + 2400 * (i < 18 ? Math.sin(t) : 0.5 - Math.sin(t));
    } else {
      const centres = [
          [27, 2100],
          [43, 7300],
          [59, 3300],
        ],
        c = centres[Math.floor(i / 12)];
      x = c[0] + (random() + random() - 1) * 9;
      y = c[1] + (random() + random() - 1) * 1800;
    }
    pts.push({ id: `P${i + 1}`, x, y });
  }
  if (scenario === "outlier") pts.push({ id: "P37", x: 82, y: 15000 });
  return pts;
}
export function featureSpace(points, scaled) {
  const mx = mean(points.map((p) => p.x)),
    my = mean(points.map((p) => p.y));
  const sx = scaled
    ? Math.sqrt(mean(points.map((p) => (p.x - mx) ** 2))) || 1
    : 1;
  const sy = scaled
    ? Math.sqrt(mean(points.map((p) => (p.y - my) ** 2))) || 1
    : 1;
  const ox = scaled ? mx : 0,
    oy = scaled ? my : 0;
  return {
    points: points.map((p) => ({
      id: p.id,
      x: (p.x - ox) / sx,
      y: (p.y - oy) / sy,
    })),
    raw: (p) => ({ x: p.x * sx + ox, y: p.y * sy + oy }),
    sx,
    sy,
  };
}
export const distance2 = (p, c) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
export const inertia = (points, centroids, assignments) =>
  sum(
    points.map((p, i) =>
      assignments[i] < 0 ? 0 : distance2(p, centroids[assignments[i]]),
    ),
  );
export function initKmeans(points, k, seed) {
  const random = seeded(seed),
    indices = points.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    centroids: indices.slice(0, k).map((i) => ({ ...points[i] })),
    assignments: points.map(() => -1),
    phase: "initialized",
    iteration: 0,
    wcss: null,
    converged: false,
    empty: 0,
  };
}
export function stepKmeans(points, previous) {
  if (previous.converged) return previous;
  const centroids = previous.centroids.map((c) => ({ ...c }));
  if (previous.phase !== "assigned") {
    const assignments = points.map((p) =>
      centroids.reduce(
        (best, c, j) =>
          distance2(p, c) < distance2(p, centroids[best]) ? j : best,
        0,
      ),
    );
    const converged =
      previous.phase === "recentered" &&
      assignments.every((a, i) => a === previous.assignments[i]);
    return {
      ...previous,
      centroids,
      assignments,
      phase: converged ? "converged" : "assigned",
      converged,
      wcss: inertia(points, centroids, assignments),
    };
  }
  let empty = 0;
  centroids.forEach((c, j) => {
    const members = points.filter((_, i) => previous.assignments[i] === j);
    if (members.length) {
      c.x = mean(members.map((p) => p.x));
      c.y = mean(members.map((p) => p.y));
    } else empty++;
  });
  return {
    ...previous,
    centroids,
    phase: "recentered",
    iteration: previous.iteration + 1,
    wcss: inertia(points, centroids, previous.assignments),
    empty,
  };
}
export function fitKmeans(points, k, seed) {
  let state = initKmeans(points, k, seed);
  for (let i = 0; i < 100 && !state.converged; i++)
    state = stepKmeans(points, state);
  return state;
}
export function elbow(points) {
  return Array.from({ length: 6 }, (_, i) => ({
    k: i + 1,
    wcss: Math.min(
      ...[11, 23, 47, 89, 131].map(
        (seed) => fitKmeans(points, i + 1, seed).wcss,
      ),
    ),
  }));
}
export const bayesCounts = {
  spam: { n: 40, free: 30, winner: 24, meeting: 2, unicorn: 0 },
  ham: { n: 60, free: 6, winner: 3, meeting: 30, unicorn: 1 },
};
export function bayesPosterior(evidence, alpha = 1, duplicate = false) {
  const classes = ["spam", "ham"];
  const rows = Object.entries(evidence)
    .filter(([, v]) => v !== "ignore")
    .map(([word, value]) => ({
      word,
      value,
      probabilities: classes.map((c) => {
        const d = bayesCounts[c];
        return (
          ((value === "present" ? d[word] : d.n - d[word]) + alpha) /
          (d.n + 2 * alpha)
        );
      }),
    }));
  if (duplicate && rows.some((r) => r.word === "free"))
    rows.push({
      ...rows.find((r) => r.word === "free"),
      word: "free (duplicate)",
    });
  const logs = classes.map(
    (c, i) =>
      Math.log(bayesCounts[c].n / 100) +
      sum(rows.map((r) => Math.log(r.probabilities[i]))),
  );
  const max = Math.max(...logs);
  if (!Number.isFinite(max)) return { rows, logs, scores: [0, 0], p: null };
  const weights = logs.map((l) => Math.exp(l - max));
  return {
    rows,
    logs,
    scores: logs.map(Math.exp),
    p: weights[0] / sum(weights),
  };
}
export const gaussian = (x, mu, sigma) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
export function gaussianPosterior(x) {
  const a = gaussian(x, 165, 7),
    b = gaussian(x, 180, 8);
  return { a, b, p: a / (a + b) };
}
export function validationScores() {
  // Fixed illustrative validation predictions, exactly TP80/FN20/FP90/TN810 at 0.5.
  const random = seeded(73),
    rows = [];
  for (let i = 0; i < 1000; i++) {
    const positive = i < 100;
    const high = positive ? i < 80 : i < 190;
    const score = high ? 0.5 + random() * 0.49 : 0.01 + random() * 0.48;
    rows.push({ id: `V${i + 1}`, label: +positive, score });
  }
  return rows;
}
export function confusion(rows, threshold) {
  const c = { tp: 0, fn: 0, fp: 0, tn: 0 };
  for (const r of rows)
    c[r.score >= threshold ? (r.label ? "tp" : "fp") : r.label ? "fn" : "tn"]++;
  const safe = (n, d) => (d ? n / d : null);
  return {
    ...c,
    accuracy: (c.tp + c.tn) / rows.length,
    precision: safe(c.tp, c.tp + c.fp),
    recall: safe(c.tp, c.tp + c.fn),
    specificity: safe(c.tn, c.tn + c.fp),
    fpr: safe(c.fp, c.fp + c.tn),
    f1: safe(2 * c.tp, 2 * c.tp + c.fp + c.fn),
    alerts: c.tp + c.fp,
  };
}
export function rankingCurve(rows) {
  // Each distinct score is an operating point; tied scores enter together.
  const thresholds = [
    Infinity,
    ...new Set(rows.map((r) => r.score).sort((a, b) => b - a)),
  ];
  const curve = thresholds.map((t) => ({
    threshold: t,
    ...confusion(rows, t),
  }));
  let auc = 0;
  for (let i = 1; i < curve.length; i++)
    auc +=
      ((curve[i].fpr - curve[i - 1].fpr) *
        (curve[i].recall + curve[i - 1].recall)) /
      2;
  return { curve, auc };
}
export function probabilityScores(rows) {
  return {
    brier: mean(rows.map((r) => (r.score - r.label) ** 2)),
    logLoss: -mean(
      rows.map((r) =>
        r.label
          ? Math.log(Math.max(r.score, 1e-15))
          : Math.log(Math.max(1 - r.score, 1e-15)),
      ),
    ),
    bins: Array.from({ length: 5 }, (_, i) => {
      const members = rows.filter(
        (r) => Math.min(4, Math.floor(r.score * 5)) === i,
      );
      return {
        n: members.length,
        predicted: members.length ? mean(members.map((r) => r.score)) : null,
        observed: members.length ? mean(members.map((r) => r.label)) : null,
      };
    }),
  };
}
