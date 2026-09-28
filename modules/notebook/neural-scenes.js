import { palette, fmt, linspace, extent } from "./lab.js";
import {
  networkForward,
  activation,
  imagePatch,
  filters,
  convolve,
  sum,
} from "./science.js";
import {
  caption,
  frame,
  line,
  mesh,
  arrow,
  dot,
  heat,
  cells,
  confusionDots,
  paper,
  grid,
} from "./spatial.js";
const colors = [palette[0], palette[2], palette[4]];
function probabilityMap(
  s,
  P,
  key,
  box,
  model,
  rows,
  kind,
  q,
  { errors = false, mask = [1, 1, 1], labels = ["Input x₁", "Input x₂"] } = {},
) {
  const probability = (x, z) => networkForward(model, { x, z }, kind, mask).p;
  heat(s, key + "heat", box, probability, 22);
  const a = frame(s, key, box, [-2.5, 2.5], [-2.5, 2.5], labels, box.h > 160);
  // Marching squares: contours are extracted from this network's probabilities.
  contour(s, key + "boundary", box, probability, 0.5);
  rows.forEach((r) => {
    const wrong = +(probability(r.x, r.z) >= 0.5) !== r.y;
    const mark = key + "-inspect-" + r.id;
    const point = P(mark, a.x(r.x), a.y(r.z));
    s.mark(
      mark,
      ...point,
      palette[r.y],
      `Inspect ${r.id}: class ${r.y}, input ${fmt(r.x, 2)}, ${fmt(r.z, 2)}`,
      Math.abs(q.x - r.x) < 1e-9 && Math.abs(q.z - r.z) < 1e-9,
      r.id,
    );
    if (r.y)
      s.path(
        mark + "-class-shape",
        `M${point[0] - 2},${point[1] - 2}l4,4m-4,0l4,-4`,
        paper,
        1.1,
        "none",
        { "pointer-events": "none" },
      );
    if (errors && wrong)
      s.circle(key + "error" + r.id, a.x(r.x), a.y(r.z), 9, "none", {
        stroke: palette[3],
        "stroke-width": 1.5,
      });
  });
  const p = P(key + "query", a.x(q.x), a.y(q.z));
  s.circle(key + "query", ...p, 7, palette[3], {
    stroke: paper,
    "stroke-width": 2,
  });
  return a;
}
function contour(s, key, box, fn, level, n = 24) {
  const val = Array.from({ length: n + 1 }, (_, j) =>
    Array.from({ length: n + 1 }, (_, i) =>
      fn(-2.5 + (i * 5) / n, 2.5 - (j * 5) / n),
    ),
  );
  let path = "";
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const pts = [
          [i, j],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ],
        vs = [val[j][i], val[j][i + 1], val[j + 1][i + 1], val[j + 1][i]],
        hits = [];
      for (let e = 0; e < 4; e++) {
        const t = (e + 1) % 4;
        if (vs[e] < level !== vs[t] < level) {
          const f = (level - vs[e]) / (vs[t] - vs[e]);
          hits.push([
            box.x + ((pts[e][0] + f * (pts[t][0] - pts[e][0])) * box.w) / n,
            box.y + ((pts[e][1] + f * (pts[t][1] - pts[e][1])) * box.h) / n,
          ]);
        }
      }
      for (let k = 0; k + 1 < hits.length; k += 2)
        path += `M${hits[k]}L${hits[k + 1]}`;
    }
  s.path(key, path, palette[2], 2.2);
}
// Hidden responses and probabilities are different quantities. The signed,
// violet/green activation scale deliberately differs from the red/blue output.
function activationField(s, key, box, model, kind, unit) {
  const n = 15;
  const values = Array.from({ length: n }, (_, j) =>
    Array.from(
      { length: n },
      (_, i) =>
        networkForward(
          model,
          { x: -2.5 + ((i + 0.5) * 5) / n, z: 2.5 - ((j + 0.5) * 5) / n },
          kind,
        ).a[unit],
    ),
  );
  const high =
    kind === "relu"
      ? Math.max(
          1,
          ...[-2.5, 2.5].flatMap((x) =>
            [-2.5, 2.5].map(
              (z) => networkForward(model, { x, z }, kind).a[unit],
            ),
          ),
        )
      : 1;
  values.forEach((row, j) =>
    row.forEach((v, i) => {
      s.rect(
        key + i + ":" + j,
        box.x + (i * box.w) / n,
        box.y + (j * box.h) / n,
        box.w / n + 0.1,
        box.h / n + 0.1,
        v < 0 ? palette[4] : palette[2],
        { opacity: (Math.abs(v) / high) * 0.65, rx: 0 },
      );
    }),
  );
  return { low: kind === "tanh" ? -1 : 0, high };
}
function activationDomain(z, kind) {
  const low = Math.min(-4, Math.floor(z - 0.5));
  const high = Math.max(4, Math.ceil(z + 0.5));
  return {
    x: [low, high],
    y:
      kind === "tanh"
        ? [-1.1, 1.1]
        : kind === "relu"
          ? [-0.1, high * 1.08]
          : [-0.05, 1.05],
  };
}
function features(s, P, model, rows, kind, q, mask = [1, 1, 1], regularization = false) {
  const w = (s.w - 42) / 3,
    h = 76;
  const f = networkForward(model, q, kind, mask);
  const dropped = mask.some((v) => v !== 1);
  caption(s, "feature-step-1", "1. What does each unit notice?", 76);
  for (let i = 0; i < 3; i++) {
    const box = { x: 14 + i * (w + 7), y: 115, w, h };
    const scale = activationField(s, "hidden-field" + i, box, model, kind, i);
    const a = frame(s, "hidden" + i, box, [-2.5, 2.5], [-2.5, 2.5], [], false);
    s.circle(
      "hidden-query" + i,
      ...P("hidden-query" + i, a.x(q.x), a.y(q.z)),
      4,
      palette[3],
      { stroke: paper, "stroke-width": 1.5 },
    );
    s.text("hidden-name" + i, box.x + w / 2, 103, "Unit " + (i + 1), {
      "text-anchor": "middle",
      "font-size": 14,
    });
    s.text("hidden-value" + i, box.x + w / 2, 210, "a = " + fmt(f.a[i], 2), {
      "text-anchor": "middle",
      "font-size": 13,
    });
    s.text(
      "hidden-scale" + i,
      box.x + w / 2,
      228,
      fmt(scale.low, 0) + " … " + fmt(scale.high, kind === "relu" ? 1 : 0),
      {
        "text-anchor": "middle",
        "font-size": 12,
        fill: "#677267",
      },
    );
    if (mask[i] === 0) {
      s.line("dropped" + i, box.x, box.y, box.x + w, box.y + h, palette[1], 3);
      s.line(
        "dropped-other" + i,
        box.x,
        box.y + h,
        box.x + w,
        box.y,
        palette[1],
        3,
      );
    }
  }
  let next = caption(
    s,
    "feature-activation-scale",
    kind === "tanh"
      ? "Activation: violet − · paper 0 · green +"
      : "Activation: paper 0 → stronger green = more",
    251,
  );
  next = caption(
    s,
    "feature-step-2",
    "2. Weight each response; add the bias.",
    next + 9,
  );
  const terms = [...f.used.map((v, i) => v * model.out[i]), model.bias];
  const center = next + 64,
    height = 39;
  const max = Math.max(0.05, ...terms.map(Math.abs));
  const width = (s.w - 66) / 4;
  const names = dropped
    ? ["v₁ × ã₁", "v₂ × ã₂", "v₃ × ã₃", "bias"]
    : ["v₁ × a₁", "v₂ × a₂", "v₃ × a₃", "bias"];
  s.line("contribution-zero", 32, center, s.w - 18, center, grid, 1.5);
  s.text("contribution-zero-label", 24, center + 4, "0", {
    "text-anchor": "end",
    "font-size": 12,
  });
  terms.forEach((value, i) => {
    const x = 40 + width * (i + 0.5),
      color = i < 3 ? colors[i] : palette[3];
    const end = P("contribution-end" + i, x, center - (value / max) * height);
    s.rect(
      "contribution-bar" + i,
      x - width * 0.25,
      Math.min(center, end[1]),
      width * 0.5,
      Math.max(1, Math.abs(end[1] - center)),
      color + "88",
      { stroke: color, "stroke-width": 1.5 },
    );
    s.text("contribution-name" + i, x, next + 10, names[i], {
      "font-size": 12,
      "text-anchor": "middle",
    });
    s.text("contribution-value" + i, x, center + height + 21, fmt(value, 3), {
      "font-size": 13,
      "text-anchor": "middle",
    });
  });
  next = center + height + 47;
  if (regularization) {
    const end = caption(s, "feature-mask", dropped
      ? "Training mask: drop unit 1; keep units 2 and 3 × 1.5."
      : "Evaluation: keep all three units at full strength.", next);
    // Reserve the same band in both modes so the probability map stays put.
    next = Math.max(end, next + 66);
  }
  next = caption(s, "feature-sum", "Signed sum z = " + fmt(f.score, 3), next);
  next = caption(
    s,
    "feature-step-3",
    "3. Sigmoid turns z into P(1) = " + fmt(f.p, 3),
    next + 5,
  );
  const box = { x: 43, y: next + 12, w: s.w - 68, h: 100 };
  probabilityMap(s, P, "feature-output", box, model, rows, kind, q, {
    mask,
    labels: ["Input x₁", ""],
  });
  s.text("feature-output-y-name", 14, box.y - 3, "x₂", { "font-size": 13 });
  next = box.y + box.h + 60;
  next = caption(
    s,
    "feature-probability-scale",
    "Probability: blue 0 → red 1",
    next,
  );
  caption(
    s,
    "feature-footer",
    "Pick an output dot to follow that input through every map.",
    next + 2,
  );
}
function inputWeights(s, P, model, q) {
  caption(s, "title", "One input, three different sensitivities.");
  const weights = model.hidden.map((h) => h.w[0]);
  const bound = Math.max(0.2, ...weights.map((w) => 2.5 * Math.abs(w))) * 1.15;
  const a = frame(
    s,
    "input-weight-space",
    { x: 47, y: 109, w: s.w - 78, h: 225 },
    [-2.5, 2.5],
    [-bound, bound],
    ["", "Contribution wᵢ₁ × x₁"],
  );
  s.text(
    "input-weight-space-xl",
    (a.l + a.r) / 2,
    a.b + 41,
    "Shared input x₁",
    {
      "font-size": 14,
      "text-anchor": "middle",
    },
  );
  s.line("input-weight-zero", a.l, a.y(0), a.r, a.y(0), grid, 1.5);
  const query = P("input-weight-query", a.x(q.x), a.b);
  s.line(
    "input-weight-guide",
    query[0],
    a.t,
    query[0],
    a.b,
    palette[3],
    1.6,
    "4 4",
  );
  s.circle("input-weight-query", ...query, 5, palette[3]);
  weights.forEach((weight, i) => {
    line(
      s,
      P,
      "input-weight-slope" + i,
      [-2.5, 2.5].map((x) => [a.x(x), a.y(weight * x)]),
      colors[i],
      2.5,
    );
    s.circle(
      "input-weight-product" + i,
      ...P("input-weight-product" + i, a.x(q.x), a.y(weight * q.x)),
      5,
      colors[i],
      { stroke: paper, "stroke-width": 1.5 },
    );
  });
  let next = caption(
    s,
    "input-weight-caption",
    "Gold input x₁ = " + fmt(q.x, 2),
    408,
  );
  weights.forEach((weight, i) => {
    next = caption(
      s,
      "input-weight-number" + i,
      `Unit ${i + 1}: ${fmt(weight, 2)} × ${fmt(q.x, 2)} = ${fmt(weight * q.x, 3)}`,
      next + 10,
      colors[i],
    );
  });
  next = caption(
    s,
    "input-weight-meaning",
    "Upward slope: positive weight. Downward: negative.",
    next + 12,
  );
  caption(
    s,
    "input-weight-scope",
    "Change the first weight: only unit 1’s line tilts.",
    next + 5,
  );
}
function neuron(s, P, model, q, f, kind) {
  const h = model.hidden[0],
    parts = [h.w[0] * q.x, h.w[1] * q.z, h.b],
    running = [0, parts[0], parts[0] + parts[1], f.z[0]],
    yd = extent([...running, 0], 0.25);
  caption(s, "title", "One neuron multiplies, adds, then bends the result.");
  const a = frame(
    s,
    "neuron-sum",
    { x: 45, y: 91, w: s.w - 77, h: 132 },
    [0, 3],
    yd,
    [],
  );
  parts.forEach((v, i) => {
    const x = a.x(i + 0.5),
      x2 = a.x(i + 0.82),
      p = P("sum-end" + i, x2, a.y(running[i + 1]));
    arrow(
      s,
      "sum-part" + i,
      [a.x(i + 0.18), a.y(running[i])],
      p,
      palette[i],
      2.7,
    );
    s.text(
      "sum-value" + i,
      x,
      79,
      ["w₁x₁", "w₂x₂", "bias"][i] + " = " + fmt(v, 2),
      { "text-anchor": "middle", "font-size": 12 },
    );
  });
  const domain = activationDomain(f.z[0], kind);
  const aa = frame(
    s,
    "neuron-bend",
    { x: 45, y: 307, w: s.w - 77, h: 79 },
    domain.x,
    domain.y,
    ["Weighted sum z", "Activation a"],
  );
  line(
    s,
    P,
    "neuron-activation",
    linspace(...domain.x).map((x) => [aa.x(x), aa.y(activation(x, kind))]),
    palette[2],
    2.5,
  );
  const z = f.z[0];
  s.circle(
    "neuron-result",
    ...P("neuron-result", aa.x(z), aa.y(activation(z, kind))),
    6,
    palette[3],
  );
  s.text(
    "neuron-number",
    s.w / 2,
    276,
    `z = ${fmt(f.z[0], 3)} → a = ${fmt(f.a[0], 3)}`,
    { "text-anchor": "middle", "font-size": 18 },
  );
}
function landscape(s, P, d, st, scene) {
  const v = d.landscape,
    lo = Math.min(...v.values.flat()),
    hi = Math.max(...v.values.flat()),
    span = v.span;
  caption(
    s,
    "title",
    scene === "backward"
      ? "The gradient points uphill. Learning steps downhill."
      : "Move two weights across a measured loss landscape.",
  );
  // The mesh visits exactly the precomputed 21×21 sample coordinates.
  const project = mesh(
    s,
    P,
    "loss-surface",
    (x, z) =>
      v.values[Math.round(((z + span) / (2 * span)) * 20)][
        Math.round(((x + span) / (2 * span)) * 20)
      ],
    {
      lo: -span,
      hi: span,
      yDomain: [Math.max(0, lo - 0.1), hi * 1.1],
      angle: 38,
      top: 95,
      height: 265,
    },
  );
  s.text(
    "loss-surface-labelX",
    ...(() => {
      const p = project(span, -span, Math.max(0, lo - 0.1));
      return [p[0], p[1] + 19];
    })(),
    "Δv₁",
    { "font-size": 14, "text-anchor": "middle" },
  );
  s.text(
    "loss-surface-labelZ",
    ...(() => {
      const p = project(-span, span, Math.max(0, lo - 0.1));
      return [p[0], p[1] + 19];
    })(),
    "Δv₂",
    { "font-size": 14, "text-anchor": "middle" },
  );
  s.text(
    "loss-surface-labelY",
    ...(() => {
      const p = project(-span, -span, hi * 1.1);
      return [p[0], p[1] - 8];
    })(),
    "Loss",
    { "font-size": 14, "text-anchor": "middle" },
  );
  const g = v.gradient,
    norm = Math.hypot(...g),
    step = g.map((x) => -st.rate * x),
    next = v.objective(v.center[0] + step[0], v.center[1] + step[1]);
  const relative = v.center.map((x, i) => x - v.origin[i]);
  const here = P("loss-here", ...project(...relative, v.value)),
    there = P(
      "loss-next",
      ...project(relative[0] + step[0], relative[1] + step[1], next),
    );
  const trail = d.landscapeTrail.filter(
    (p) =>
      Math.abs(p[0] - v.origin[0]) <= span &&
      Math.abs(p[1] - v.origin[1]) <= span,
  );
  if (trail.length > 1)
    line(
      s,
      P,
      "descent-trail",
      trail.map((p) =>
        project(p[0] - v.origin[0], p[1] - v.origin[1], v.objective(...p)),
      ),
      palette[3],
      2.6,
    );
  s.circle("loss-here", ...here, 7, palette[3], {
    stroke: paper,
    "stroke-width": 2,
  });
  arrow(s, "actual-step", here, there, palette[1], 3);
  s.circle("proposed-step", ...there, 4, palette[1]);
  if (norm > 1e-7) {
    const vector = g.map((x) => (-x / norm) * span * 0.45),
      ground = lo * 0.99;
    arrow(
      s,
      "gradient-direction",
      project(...relative, ground),
      project(relative[0] + vector[0], relative[1] + vector[1], ground),
      palette[1],
      2.5,
    );
  }
  let foot = caption(
    s,
    "loss-equation",
    `∂L/∂v₁ = ${fmt(g[0], 4)} · ∂L/∂v₂ = ${fmt(g[1], 4)}`,
    373,
  );
  foot = caption(
    s,
    "loss-step",
    `Loss ${fmt(v.value, 4)} → ${fmt(next, 4)} for this two-weight step`,
    foot + 5,
  );
  foot = caption(
    s,
    "loss-scope",
    "Floor arrow: downhill −∇L. Gold trail: actual steps.",
    foot + 5,
  );
  caption(
    s,
    "loss-slice",
    "A convex slice: only v₁ and v₂ vary; hidden features stay fixed.",
    foot + 5,
  );
}
function conv(s, P, st, { hierarchy = false } = {}) {
  const kernel = filters[st.filter],
    r = Math.floor(st.window / 3),
    c = st.window % 3,
    cs = Math.min(32, (s.w - 44) / 9),
    x = Math.max(18, (s.w - (8 * cs + 24)) / 2),
    right = x + 5 * cs + 24,
    y = 89;
  caption(
    s,
    "title",
    hierarchy
      ? "Small local patterns become spatial feature maps."
      : "Slide a filter. Multiply nine pairs, then add.",
  );
  cells(s, "input-pixel", imagePatch, x, y, cs);
  s.text("input-name", x, 75, "5 × 5 input", { "font-size": 15 });
  const p = P("conv-window", x + c * cs, y + r * cs);
  s.rect("conv-window", p[0] - 2, p[1] - 2, 3 * cs, 3 * cs, "none", {
    stroke: palette[3],
    "stroke-width": 3,
  });
  cells(s, "kernel", kernel, right, y, cs);
  s.text("kernel-name", right, 75, "3 × 3 filter", { "font-size": 14 });
  const products = kernel.map((row, i) =>
      row.map((v, j) => v * imagePatch[r + i][c + j]),
    ),
    out = Array.from({ length: 3 }, (_, i) =>
      Array.from({ length: 3 }, (_, j) => convolve(kernel, i, j)),
    );
  cells(s, "products", products, x, 285, cs);
  s.text("products-name", x, 268, "Nine products", { "font-size": 14 });
  const output = hierarchy
    ? out.map((row) => row.map((v) => Math.max(0, v)))
    : out;
  cells(s, "featuremap", output, right, 285, cs, { selected: st.window });
  s.text(
    "featuremap-name",
    right,
    268,
    hierarchy ? "After ReLU" : "Feature map",
    { "font-size": 14 },
  );
  arrow(
    s,
    "filter-to-map",
    [right + 1.5 * cs, y + 3 * cs + 12],
    [right + 1.5 * cs, 246],
    palette[2],
    2,
  );
  arrow(
    s,
    "sum-products",
    [x + 3 * cs + 7, 285 + 1.5 * cs],
    [right - 8, 285 + 1.5 * cs],
    palette[2],
    2,
  );
  s.text(
    "sum-products-label",
    (x + 3 * cs + right) / 2,
    285 + 1.5 * cs - 13,
    "Σ",
    { "font-size": 17, "text-anchor": "middle" },
  );
  caption(
    s,
    "conv-sum",
    `Selected sum: ${products.flat().join(" + ")} = ${sum(products.flat())}`,
    407,
  );
}
function fruit(
  s,
  key,
  x,
  y,
  size,
  { box = false, mask = false, background = "#edf1e7" } = {},
) {
  s.rect(key + "photo", x, y, size, size, background, { stroke: grid });
  const cx = x + size * 0.5,
    cy = y + size * 0.53,
    r = size * 0.24;
  s.path(
    key + "apple",
    `M${cx},${cy - r * 0.8} C${cx - r * 1.5},${cy - r * 1.6} ${cx - r * 1.2},${cy + r} ${cx},${cy + r} C${cx + r * 1.2},${cy + r} ${cx + r * 1.5},${cy - r * 1.6} ${cx},${cy - r * 0.8}Z`,
    palette[1],
    2,
    mask ? palette[4] + "a0" : palette[1] + "70",
  );
  s.path(
    key + "leaf",
    `M${cx},${cy - r * 0.8}q${-r * 0.2},${-r * 0.8} ${r * 0.55},${-r * 0.9}q${r * 0.1},${r * 0.7} ${-r * 0.55},${r * 0.9}`,
    palette[2],
    2,
    palette[2] + "70",
  );
  if (box)
    s.rect(
      key + "box",
      cx - r * 1.12,
      cy - r * 1.85,
      r * 2.3,
      r * 3.1,
      "none",
      { stroke: palette[3], "stroke-width": 2, "stroke-dasharray": "5 4" },
    );
}
export function renderNeural(s, P, L, slug) {
  const st = L.state,
    d = L.data,
    scene = L.scene,
    model = d.model,
    q = { x: st.x, z: st.z, y: +st.label },
    f = d.forward,
    kind = st.activation;
  s.begin(460);
  s.svg.dataset.visual =
    "neural-" +
    scene +
    (scene === "cycle" ? "-" + st.phase : "") +
    (scene === "architecture" ? "-" + st.architecture : "");
  if (scene === "task") {
    caption(s, "title", "One image. Three different questions to answer.");
    const size = Math.min(235, s.w - 60);
    fruit(s, "task-image", (s.w - size) / 2, 77, size, {
      box: st.task === "detection",
      mask: st.task === "segmentation",
    });
    const output =
      st.task === "classification"
        ? "Classification: an apple is present."
        : st.task === "detection"
          ? "Detection: locate the apple with a box."
          : "Segmentation: label the apple pixels.";
    caption(s, "task-output", output, 347);
    caption(
      s,
      "task-scope",
      "Illustrated output contract; no image inference is run.",
      414,
    );
  } else if (scene === "shortcut") {
    caption(s, "title", "Same apple, different background. A shortcut breaks.");
    const size = Math.min(174, (s.w - 50) / 2);
    fruit(s, "cue-a", 17, 108, size, { background: "#dfeaf1" });
    fruit(s, "cue-b", s.w - 17 - size, 108, size, {
      background: st.cue === "changed" ? "#efe0d6" : "#dfeaf1",
    });
    s.text("cue-before", 17, 91, "Training example", { "font-size": 14 });
    s.text("cue-after", s.w - 17 - size, 91, "New environment", {
      "font-size": 14,
    });
    caption(
      s,
      "cue-rule",
      "Toy shortcut rule: blue background → “apple”.",
      331,
    );
    caption(
      s,
      "cue-answer",
      st.cue === "changed"
        ? "The right prediction flips. The object did not change."
        : "Both pass the shortcut rule. This hides the weakness.",
      376,
      palette[1],
    );
    caption(
      s,
      "cue-scope",
      "A counterexample to a rule, not a trained classifier.",
      435,
    );
  } else if (scene === "pipeline") {
    caption(s, "title", "Keep the same observation in only one sample.");
    ["train", "validation", "test"].forEach((k, j) => {
      const y = 95 + j * 103,
        rows = d.split[k],
        cols = Math.floor((s.w - 50) / 16);
      s.text(
        "split-name" + k,
        20,
        y - 16,
        [
          `Train: ${rows.length} examples fit weights`,
          `Validation: ${rows.length} examples guide choices`,
          `Test: ${rows.length} examples stay sealed`,
        ][j],
        { "font-size": 15 },
      );
      rows.forEach((r, i) => {
        const x = 26 + (i % cols) * 16,
          cy = y + Math.floor(i / cols) * 17;
        if (k === "test")
          s.rect("split-sealed" + i, x - 4, cy - 4, 8, 8, "#ccd0c4");
        else dot(s, P, "split" + r.id, x, cy, r.y);
      });
    });
    caption(
      s,
      "pipeline-foot",
      "Fit preprocessing on train; reuse it on held-out rows.",
      426,
    );
  } else if (scene === "tensor") {
    caption(s, "title", "A picture becomes an array of numerical entries.");
    const cs = Math.min(39, (s.w - 70) / 5),
      x = (s.w - 5 * cs) / 2;
    for (let i = 3; i >= 1; i--)
      s.rect(
        "batch-sheet" + i,
        x + i * 7,
        78 - i * 7,
        5 * cs,
        5 * cs,
        "#e6eade",
        { stroke: grid },
      );
    cells(s, "tensor-pixels", imagePatch, x, 78, cs, { selected: st.pixel });
    const r = Math.floor(st.pixel / 5),
      c = st.pixel % 5;
    caption(
      s,
      "tensor-address",
      `image[row ${r}, col ${c}, channel 0] = ${imagePatch[r][c]}`,
      320,
    );
    const yy = 369,
      unit = (s.w - 36) / 8;
    for (let i = 0; i < 8; i++) {
      s.rect("batch" + i, 18 + i * unit, yy, unit - 4, 28, palette[0] + "28", {
        stroke: grid,
      });
      s.text("batch-num" + i, 18 + i * unit + (unit - 4) / 2, yy + 19, i + 1, {
        "font-size": 13,
        "text-anchor": "middle",
      });
    }
    caption(
      s,
      "tensor-foot",
      "8 × 5 × 5 × 1 = 200 entries in this batch.",
      438,
    );
  } else if (scene === "hierarchy") conv(s, P, st, { hierarchy: true });
  else if (scene === "architecture" && st.architecture === "cnn")
    conv(s, P, st);
  else if (scene === "architecture" && st.architecture === "rnn") {
    caption(s, "title", "The state carries a compressed memory through time.");
    const a = frame(
      s,
      "recurrent",
      { x: 46, y: 108, w: s.w - 73, h: 224 },
      [0, 4],
      [-1, 1],
      ["Sequence step", "Hidden state h"],
    );
    const vals = [0, ...d.rnn.map((r) => r.h)];
    line(
      s,
      P,
      "state-curve",
      vals.map((h, i) => [a.x(i), a.y(h)]),
      palette[2],
      2.6,
    );
    d.rnn.forEach((r, i) => {
      s.circle(
        "state" + i,
        ...P("state" + i, a.x(i + 1), a.y(r.h)),
        i === st.token ? 7 : 4,
        palette[2],
      );
      s.text("input" + i, a.x(i + 0.5), 82, "x=" + fmt(r.x, 1), {
        "font-size": 13,
        "text-anchor": "middle",
      });
    });
    const r = d.rnn[st.token];
    caption(
      s,
      "rnn-rule",
      `h = tanh(0.7 × ${fmt(r.before, 3)} + 0.5 × ${r.x})`,
      390,
    );
    caption(
      s,
      "rnn-result",
      `Step ${st.token + 1}: new state ${fmt(r.h, 4)}`,
      427,
    );
  } else if (scene === "architecture" && st.architecture === "attention") {
    caption(s, "title", "One query gathers different amounts from each token.");
    const tokens = ["the", "cat", "sat", "here"],
      xs = tokens.map((_, i) => 28 + ((s.w - 56) * i) / 3),
      qy = 95;
    tokens.forEach((t, i) => {
      s.path(
        "attention-arc" + i,
        `M${xs[st.token]},${qy}Q${s.w / 2},${170 + Math.abs(st.token - i) * 10} ${xs[i]},${qy}`,
        palette[i],
        1 + 9 * d.attention.weights[i],
      );
      s.circle(
        "token" + i,
        xs[i],
        qy,
        17,
        i === st.token ? palette[3] + "45" : paper,
        { stroke: palette[i] },
      );
      s.text("token-label" + i, xs[i], qy + 4, t, {
        "font-size": 13,
        "text-anchor": "middle",
      });
      s.text("weight" + i, xs[i], 193, fmt(d.attention.weights[i], 2), {
        "font-size": 13,
        "text-anchor": "middle",
      });
    });
    const a = frame(
      s,
      "value-space",
      { x: 48, y: 247, w: s.w - 77, h: 143 },
      [0, 1],
      [0, 1],
      ["Value coordinate 1", "Value coordinate 2"],
    );
    [
      [0.1, 0.2],
      [0.9, 0.4],
      [0.2, 0.1],
      [0.7, 0.8],
    ].forEach((v, i) => {
      arrow(
        s,
        "value" + i,
        [a.x(0), a.y(0)],
        [a.x(v[0]), a.y(v[1])],
        palette[i],
        1 + d.attention.weights[i] * 5,
      );
      s.circle("value-end" + i, a.x(v[0]), a.y(v[1]), 4, palette[i]);
    });
    const c = d.attention.context;
    s.circle("context", ...P("context", a.x(c[0]), a.y(c[1])), 7, palette[3], {
      stroke: paper,
      "stroke-width": 2,
    });
    caption(
      s,
      "context-caption",
      "Gold: the weighted-average context vector.",
      447,
    );
  } else if (scene === "transfer") {
    caption(
      s,
      "title",
      "Reuse feature extractors; adapt the trainable pieces.",
    );
    const cs = Math.min(32, (s.w - 54) / 7),
      out = Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) =>
          Math.max(0, convolve(filters.vertical, r, c)),
        ),
      );
    cells(s, "transfer-feature", out, 22, 103, cs);
    cells(s, "transfer-adapt", out, s.w - 22 - 3 * cs, 103, cs);
    s.text("frozen-label", 22, 85, "Early features: frozen", {
      "font-size": 13,
    });
    s.text(
      "adapt-label",
      s.w - 22,
      85,
      st.transfer === "fine" ? "Later: trainable" : "Later: frozen",
      { "font-size": 13, "text-anchor": "end" },
    );
    s.rect(
      "trainable-backbone",
      s.w - 25 - 3 * cs,
      100,
      3 * cs + 4,
      3 * cs + 4,
      "none",
      {
        stroke: st.transfer === "fine" ? palette[3] : grid,
        "stroke-width": 3,
        "stroke-dasharray": st.transfer === "fine" ? null : "4 4",
      },
    );
    const a = frame(
      s,
      "transfer-head",
      { x: 48, y: 285, w: s.w - 78, h: 91 },
      [-1, 1],
      [-1, 1],
      ["Learned feature 1", "New task head"],
    );
    for (let i = 0; i < 18; i++) {
      const x = Math.sin(i * 2.1) * 0.9,
        y = Math.cos(i * 1.4) * 0.8;
      dot(s, P, "transfer-row" + i, a.x(x), a.y(y), +(x + y > 0));
    }
    line(
      s,
      P,
      "transfer-boundary",
      [
        [-1, 1],
        [1, -1],
      ].map(([x, y]) => [a.x(x), a.y(y)]),
      palette[3],
      3,
    );
    caption(
      s,
      "transfer-scope",
      "Illustrative features and new head; no pretrained model loaded.",
      435,
    );
  } else if (scene === "contract") {
    caption(
      s,
      "title",
      st.contract === "missing"
        ? "A missing coordinate cannot enter this network."
        : "Swapping columns moves the point to a different place.",
    );
    const a = probabilityMap(
      s,
      P,
      "contract",
      { x: 45, y: 88, w: s.w - 74, h: 257 },
      model,
      d.split.train,
      kind,
      q,
    );
    if (st.contract === "swapped") {
      const p = P("swapped", a.x(q.z), a.y(q.x));
      arrow(s, "swap", [a.x(q.x), a.y(q.z)], p, palette[1], 2.5);
      s.circle("swapped", ...p, 6, palette[1]);
      caption(
        s,
        "contract-answer",
        `${fmt(f.p, 4)} → ${fmt(networkForward(model, { x: q.z, z: q.x }, kind).p, 4)} after the swap`,
        405,
      );
    } else if (st.contract === "missing") {
      s.line(
        "missing-coordinate",
        a.x(q.x),
        a.t,
        a.x(q.x),
        a.b,
        palette[1],
        3,
        "5 5",
      );
      caption(
        s,
        "contract-answer",
        "Input rejected: x₂ is required. No prediction issued.",
        405,
        palette[1],
      );
    } else
      caption(
        s,
        "contract-answer",
        "Saved order and units place the point correctly.",
        405,
      );
  } else if (scene === "training" || scene === "settings") {
    caption(s, "title", "Training changes weights; validation only measures.");
    const max = Math.max(
        0.8,
        ...d.trace.flatMap((t) => [t.train, t.validation]),
      ),
      a = frame(
        s,
        "training",
        { x: 48, y: 86, w: s.w - 79, h: 280 },
        [0, Math.max(1, d.steps)],
        [0, max * 1.1],
        ["Completed parameter updates", "Binary cross-entropy"],
      );
    ["train", "validation"].forEach((k, i) => {
      line(
        s,
        P,
        "training-" + k,
        d.trace.map((t) => [a.x(t.step), a.y(t[k])]),
        palette[i],
        2.5,
      );
      if (d.trace.length === 1)
        s.circle(
          "training-initial" + i,
          a.x(0),
          a.y(d.trace[0][k]),
          5,
          palette[i],
        );
    });
    const best = d.trace.reduce((a, b) =>
      a.validation < b.validation ? a : b,
    );
    s.line(
      "best-validation",
      a.x(best.step),
      a.t,
      a.x(best.step),
      a.b,
      palette[3],
      1.5,
      "4 4",
    );
    caption(
      s,
      "training-foot",
      `Gold: lowest stored validation loss at step ${best.step}`,
      427,
    );
  } else if (scene === "evaluation") {
    caption(s, "title", "Inspect validation errors before a final evaluation.");
    confusionDots(
      s,
      P,
      d.split.validation,
      (r) => networkForward(model, r, kind).p,
      { top: 99 },
    );
    caption(
      s,
      "eval-foot",
      "Actual classes by row; predicted classes by column.",
      431,
    );
  } else if (scene === "errors") {
    caption(s, "title", "Errors have locations. Look for a pattern in them.");
    probabilityMap(
      s,
      P,
      "errors",
      { x: 45, y: 91, w: s.w - 74, h: 268 },
      model,
      d.split.validation,
      kind,
      q,
      { errors: true },
    );
    caption(
      s,
      "errors-foot",
      "Gold rings: misclassified validation observations.",
      425,
    );
  } else if (scene === "backward" || scene === "update")
    landscape(s, P, d, st, scene);
  else if (scene === "neuron" && slug === "neural-networks" && L.index === 4)
    inputWeights(s, P, model, q);
  else if (scene === "neuron") neuron(s, P, model, q, f, kind);
  else if (scene === "activation") {
    caption(s, "title", "A nonlinear activation bends a weighted sum.");
    const domain = activationDomain(f.z[0], kind);
    const a = frame(
      s,
      "activation",
      { x: 45, y: 85, w: s.w - 74, h: 136 },
      domain.x,
      domain.y,
      ["Weighted sum z", "Activation a"],
    );
    line(
      s,
      P,
      "activation-function",
      linspace(...domain.x).map((x) => [a.x(x), a.y(activation(x, kind))]),
      palette[2],
      2.6,
    );
    const z = f.z[0];
    s.circle(
      "activation-query",
      ...P("activation-query", a.x(z), a.y(activation(z, kind))),
      6,
      palette[3],
    );
    probabilityMap(
      s,
      P,
      "activation-map",
      { x: 45, y: 338, w: s.w - 74, h: 103 },
      model,
      d.split.train,
      kind,
      q,
    );
    caption(
      s,
      "nonlinear-caption",
      "These bends reshape the boundary below.",
      286,
    );
    caption(s, "nonlinear-probability", "Output shading: blue 0 → red 1.", 499);
  } else if (scene === "loss" || (scene === "cycle" && st.phase === 1)) {
    caption(
      s,
      "title",
      `The inspected label is ${q.y}. Confident mistakes cost more.`,
    );
    const a = frame(
      s,
      "loss-curve",
      { x: 48, y: 97, w: s.w - 77, h: 260 },
      [0, 1],
      [0, 5],
      ["Predicted P(class 1)", "Binary cross-entropy"],
    );
    line(
      s,
      P,
      "row-loss",
      linspace(0.01, 0.99).map((p) => [
        a.x(p),
        a.y(-(q.y ? Math.log(p) : Math.log(1 - p))),
      ]),
      palette[1],
      2.6,
    );
    const loss = -(q.y
      ? Math.log(Math.max(f.p, 1e-12))
      : Math.log(Math.max(1 - f.p, 1e-12)));
    s.circle(
      "row-loss-point",
      ...P("row-loss-point", a.x(f.p), a.y(Math.min(5, loss))),
      7,
      palette[3],
    );
    caption(
      s,
      "loss-caption",
      `p = ${fmt(f.p, 4)} · loss = ${fmt(loss, 4)}${loss > 5 ? " (above plot)" : ""}`,
      424,
    );
  } else if (scene === "cycle" && st.phase === 2)
    landscape(s, P, d, st, "backward");
  else if (
    scene === "forward" ||
    scene === "regularization" ||
    (scene === "cycle" && st.phase === 0)
  ) {
    caption(
      s,
      "title",
      scene === "regularization"
        ? "Drop a unit. See which response disappears."
        : "Three learned responses combine into one prediction.",
    );
    features(s, P, model, d.split.train, kind, q, d.mask, scene === "regularization");
  } else if (scene === "inputs") {
    caption(
      s,
      "title",
      "Two measurements locate one example in feature space.",
    );
    const a = frame(
      s,
      "inputs",
      { x: 46, y: 92, w: s.w - 78, h: 237 },
      [-2.5, 2.5],
      [-2.5, 2.5],
      ["Standardized feature x₁", "Standardized feature x₂"],
    );
    d.split.train.forEach((r) =>
      dot(s, P, "example" + r.id, a.x(r.x), a.y(r.z), r.y),
    );
    const p = P("input-query", a.x(q.x), a.y(q.z));
    s.line("input-x", a.x(q.x), a.b, ...p, palette[3], 2, "4 4");
    s.line("input-z", a.l, a.y(q.z), ...p, palette[3], 2, "4 4");
    s.circle("input-query", ...p, 7, palette[3]);
    caption(
      s,
      "input-numbers",
      `[${fmt(q.x, 2)}, ${fmt(q.z, 2)}] is the input; ${q.y} is its label.`,
      402,
    );
  } else {
    caption(
      s,
      "title",
      scene === "cycle"
        ? "Weights updated. The prediction field changes."
        : "Learning reshapes the boundary around examples.",
    );
    probabilityMap(
      s,
      P,
      "network",
      { x: 45, y: 87, w: s.w - 74, h: 282 },
      model,
      d.split.train,
      kind,
      q,
    );
    caption(
      s,
      "network-foot",
      `Green: P(1)=0.5 boundary · query P(1)=${fmt(f.p, 3)}`,
      424,
    );
  }
  s.end("Current reading section: " + scene + ". " + hostReceipt(L));
}
function hostReceipt(L) {
  return (
    L.surface.host.parentElement.querySelector("#lab-receipt")?.textContent ||
    ""
  );
}
