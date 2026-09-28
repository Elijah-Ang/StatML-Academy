// Clip the displayed input square at the exact probability cutoff. This is
// geometry only: threshold changes never retrain the logistic model.
export function logisticRegions(weights, threshold, domain = [-3, 3]) {
  const [lo, hi] = domain;
  const square = [
    [lo, lo],
    [hi, lo],
    [hi, hi],
    [lo, hi],
  ];
  if (threshold <= 0) return { positive: square, negative: [], boundary: [] };
  if (threshold >= 1) return { positive: [], negative: square, boundary: [] };
  const cutoff = Math.log(threshold / (1 - threshold));
  const distance = ([x, z]) =>
    weights[0] + weights[1] * x + weights[2] * z - cutoff;
  const cross = (a, b, da, db) =>
    a.map((v, i) => v + ((b[i] - v) * da) / (da - db));
  const clip = (sign) => {
    const result = [];
    square.forEach((a, i) => {
      const b = square[(i + 1) % square.length],
        da = sign * distance(a),
        db = sign * distance(b);
      if (da >= 0) result.push(a);
      if (da >= 0 !== db >= 0) result.push(cross(a, b, da, db));
    });
    return result;
  };
  const boundary = [];
  const add = (p) => {
    if (!boundary.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-9))
      boundary.push(p);
  };
  square.forEach((a, i) => {
    const b = square[(i + 1) % square.length],
      da = distance(a),
      db = distance(b);
    if (Math.abs(da) < 1e-10) add(a);
    if (da * db < 0) add(cross(a, b, da, db));
  });
  // A constant model has no separating line, including equality everywhere.
  if (Math.hypot(weights[1], weights[2]) < 1e-12)
    return {
      positive: distance(square[0]) >= 0 ? square : [],
      negative: distance(square[0]) < 0 ? square : [],
      boundary: [],
    };
  return {
    positive: clip(1),
    negative: clip(-1),
    boundary: boundary.slice(0, 2),
  };
}
