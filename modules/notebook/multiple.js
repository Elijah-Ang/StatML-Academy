import { makeLab, fmt, palette, linspace, extent } from "./lab.js";
import {
  regressionData,
  splitRows,
  linearFit,
  mse,
  mean,
  seeded,
  gaussianRandom,
  sum,
} from "./science.js";
import { coefficientIntervals, regressionScores } from "./spatial-science.js";
import { caption, frame, line, mesh, arrow, paper } from "./spatial.js";
export function create(host, slug) {
  const initial = {
    query: 0.7,
    slice: 0.4,
    noise: 0.5,
    seed: 31,
    selected: "R1",
    angle: 35,
    b0: 1,
    b1: 1.5,
    b2: 0.8,
    noiseFeature: "yes",
  };
  const controls = [
    { key: "query", label: "Input x₁", min: -2, max: 2, step: 0.05 },
    { key: "slice", label: "Hold x₂ at", min: -2, max: 2, step: 0.05 },
    { key: "angle", label: "Rotate the data space", min: 15, max: 70, step: 1 },
    { key: "b0", label: "Intercept β₀", min: -2, max: 4, step: 0.05 },
    { key: "b1", label: "Slope β₁", min: -2, max: 3, step: 0.05 },
    { key: "b2", label: "Slope β₂", min: -2, max: 3, step: 0.05 },
    { key: "noise", label: "Outcome noise SD", min: 0.1, max: 2, step: 0.1 },
    {
      key: "selected",
      label: "Inspect a training observation",
      options: splitRows(regressionData()).train.map((r) => [r.id, r.id]),
    },
    {
      key: "noiseFeature",
      label: "Add an unrelated predictor",
      options: [
        ["yes", "Include seeded noise"],
        ["no", "Use only x₁ and x₂"],
      ],
    },
  ];
  const L = makeLab(host, slug, initial, controls);
  let cache = "",
    data;
  const fitAction = L.action(
    "fit-plane",
    "Find the least-squares plane",
    () => {
      const b = data.fit.coefficients;
      L.update({ b0: b[0], b1: b[1], b2: b[2] });
    },
  );
  const sample = L.action("resample", "Draw a new dataset", () =>
    L.update({ seed: L.state.seed + 1 }),
  );
  L.surface.onAction = (id) => L.update({ selected: id });
  return L.init((animate = false) => {
    const st = L.state,
      i = L.index,
      key = JSON.stringify([st.seed, st.noise]);
    if (key !== cache) {
      cache = key;
      const all = regressionData(st.seed, "linear", st.noise),
        split = splitRows(all),
        basis = (r) => [1, r.x, r.z];
      const ci = coefficientIntervals(split.train, basis),
        fit = ci.fit,
        rng = seeded(st.seed + 717);
      split.train.forEach((r) => (r.unrelated = gaussianRandom(rng)));
      const extra = linearFit(split.train, (r) => [1, r.x, r.z, r.unrelated]);
      const confounding = split.train.map((r) => ({
        ...r,
        z: 0.9 * r.x + 0.4 * r.z,
        y: 2 * (0.9 * r.x + 0.4 * r.z) + (r.y - (1 + 1.5 * r.x + 0.8 * r.z)),
      }));
      const adjusted = linearFit(confounding, basis),
        marginal = linearFit(confounding, (r) => [1, r.x]);
      data = {
        all,
        split,
        train: split.train,
        fit,
        ci,
        extra,
        confounding,
        adjusted,
        marginal,
        xOnZ: linearFit(
          confounding.map((r) => ({ ...r, y: r.x })),
          (r) => [1, r.z],
        ),
        yOnZ: linearFit(confounding, (r) => [1, r.z]),
      };
    }
    const d = data,
      row = d.train.find((r) => r.id === st.selected),
      manual = i === 2 || i === 3,
      b = manual ? [st.b0, st.b1, st.b2] : d.fit.coefficients,
      predict = (r) => b[0] + b[1] * r.x + b[2] * r.z,
      q = { x: st.query, z: st.slice },
      pred = predict(q),
      residual = row.y - predict(row);
    const scores = regressionScores(d.train, d.fit, 3),
      extraScores = regressionScores(d.train, d.extra, 4);
    L.data = {
      ...d,
      coefficients: b,
      prediction: pred,
      residual,
      scores,
      extraScores,
    };
    let receipt = [
      [
        "Current equation",
        `${fmt(b[0], 3)} + ${fmt(b[1], 3)}x₁ + ${fmt(b[2], 3)}x₂`,
      ],
      ["Query prediction", fmt(pred, 4)],
      [
        "Selected observation",
        `${row.id}: actual ${fmt(row.y, 3)}, fitted ${fmt(predict(row), 3)}`,
      ],
      ["Selected residual", fmt(residual, 4)],
    ];
    if (i === 6)
      receipt = [
        ["Apparent x₁ slope", fmt(d.marginal.coefficients[1], 4)],
        ["After adjustment for x₂", fmt(d.adjusted.coefficients[1], 4)],
        [
          "Data-generating rule",
          "x₂ shares variation with x₁; y = 2x₂ + noise. No direct x₁ term.",
        ],
        [
          "Interpretation",
          "A controlled synthetic example of confounding, not proof of causality from regression.",
        ],
      ];
    if (i === 7)
      receipt = [
        [
          "Two-input R² / adjusted R²",
          `${fmt(scores.r2, 4)} / ${fmt(scores.adjusted, 4)}`,
        ],
        [
          "With noise: R² / adjusted R²",
          `${fmt(extraScores.r2, 4)} / ${fmt(extraScores.adjusted, 4)}`,
        ],
        [
          "Parameter count",
          st.noiseFeature === "yes"
            ? "4, including intercept"
            : "3, including intercept",
        ],
        [
          "Penalty",
          "Adjusted R² may increase or decrease; the noise predictor sometimes fits by chance.",
        ],
      ];
    if (i === 8)
      receipt = d.ci.intervals.map((c, j) => [
        ["Intercept", "x₁ slope", "x₂ slope"][j],
        `${fmt(c.value, 3)}; 95% CI [${fmt(c.lo, 3)}, ${fmt(c.hi, 3)}]`,
      ]);
    L.receipt(L.table(["Follow the model", "Computed value"], receipt));
    L.metrics(
      i === 6
        ? [
            ["Marginal x₁ slope", fmt(d.marginal.coefficients[1], 3)],
            ["Adjusted x₁ slope", fmt(d.adjusted.coefficients[1], 3)],
            ["Direct x₁ effect in generator", "0"],
          ]
        : i === 7
          ? [
              [
                "Training R²",
                fmt(st.noiseFeature === "yes" ? extraScores.r2 : scores.r2, 4),
              ],
              [
                "Adjusted R²",
                fmt(
                  st.noiseFeature === "yes"
                    ? extraScores.adjusted
                    : scores.adjusted,
                  4,
                ),
              ],
              ["Training rows", d.train.length],
            ]
          : [
              ["Training MSE", fmt(mse(d.train, predict), 3)],
              ["Validation MSE", fmt(mse(d.split.validation, predict), 3)],
              ["Query prediction", fmt(pred, 3)],
            ],
    );
    L.legend(
      i === 6
        ? [
            ["Marginal association", palette[1]],
            ["After adjusting for x₂", palette[2]],
          ]
        : [
            ["Observed outcomes", palette[0]],
            ["Prediction surface", palette[2]],
            ["Residual / change", palette[1]],
          ],
    );
    L.note(
      i === 8
        ? "Classical t intervals assume independent, equal-variance normal errors and full-rank predictors. These intervals concern mean coefficients, not individual prediction intervals."
        : i === 6
          ? "Controlled confounding scenario using 45 training observations. Both comparisons use exactly the same rows; final-test observations remain sealed."
          : "Synthetic inputs and outcome in teaching units. The 3D height is y, and the two ground axes are x₁ and x₂. The green sheet is the fitted mean; each vertical thread is an observed-minus-fitted residual. 45 training, 15 validation and 15 sealed test rows.",
    );
    const visible = new Set(
      i === 6
        ? ["noise"]
        : i === 7
          ? ["noiseFeature", "noise"]
          : i === 8
            ? ["noise"]
            : i === 4
              ? ["query", "slice"]
              : i === 1 || i === 5
                ? ["query", "slice"]
                : [
                    "query",
                    "slice",
                    "angle",
                    "selected",
                    "noise",
                    ...(manual ? ["b0", "b1", "b2"] : []),
                  ],
    );
    controls.forEach(
      (c) =>
        (host.querySelector("#" + c.key).closest("label").hidden = !visible.has(
          c.key,
        )),
    );
    fitAction.hidden = !manual;
    sample.hidden = i === 1 || i === 5;
    L.draw((s, P) => {
      s.begin(420);
      s.svg.dataset.visual = [
        "prediction-plane",
        "contribution-waterfall",
        "tilt-plane",
        "least-squares-plane",
        "conditional-slice",
        "prediction-waterfall",
        "confounding-clouds",
        "adjusted-r2",
        "coefficient-intervals",
      ][i];
      if ([0, 2, 3].includes(i)) {
        const titleEnd = caption(
          s,
          "mlr-title",
          i === 0
            ? "Every dot has two inputs and one height."
            : i === 2
              ? "Tilt either slope. Watch the residual threads."
              : "Least squares shortens all residual threads together.",
        );
        const ys = [
            ...d.all.map((r) => r.y),
            ...[-2.4, 2.4].flatMap((x) =>
              [-2.4, 2.4].map((z) => predict({ x, z })),
            ),
          ],
          yd = extent(ys, 0.08);
        const project = mesh(s, P, "plane", (x, z) => predict({ x, z }), {
          angle: st.angle,
          yDomain: yd,
          top: Math.max(60, titleEnd + 34),
          height: 285,
        });
        d.train.forEach((r) => {
          const a = project(r.x, r.z, r.y),
            b = project(r.x, r.z, predict(r)),
            sel = r.id === st.selected;
          line(
            s,
            P,
            "residual-" + r.id,
            [a, b],
            sel ? palette[1] : palette[0] + "66",
            sel ? 2.5 : 0.8,
          );
          const p = P("point-" + r.id, ...a);
          s.mark(
            "point-" + r.id,
            ...p,
            palette[0],
            `${r.id}: x₁ ${fmt(r.x)}, x₂ ${fmt(r.z)}, y ${fmt(r.y)}`,
            sel,
            r.id,
          );
        });
        const qp = P("query", ...project(q.x, q.z, pred));
        s.circle("query", ...qp, 7, palette[3], {
          stroke: paper,
          "stroke-width": 2,
        });
        line(
          s,
          P,
          "slice",
          linspace(-2.4, 2.4).map((x) =>
            project(x, st.slice, predict({ x, z: st.slice })),
          ),
          palette[3],
          3,
        );
        caption(
          s,
          "mlr-foot",
          `Gold line: x₂ = ${fmt(st.slice, 2)} · height ŷ = ${fmt(pred, 2)}`,
          Math.max(60, titleEnd + 34) + 323,
        );
      } else if (i === 1 || i === 5) {
        caption(
          s,
          "mlr-title",
          "Build one prediction: add signed contributions.",
        );
        const parts = [b[0], b[1] * q.x, b[2] * q.z],
          totals = [0, parts[0], parts[0] + parts[1], pred],
          yd = extent([...totals, 0], 0.24);
        const a = frame(
          s,
          "waterfall",
          { x: 46, y: 92, w: s.w - 72, h: 225 },
          [0, 4],
          yd,
          ["", "Predicted outcome"],
        );
        const names = ["Start β₀", "Add β₁x₁", "Add β₂x₂", "Total ŷ"];
        parts.concat(pred).forEach((v, j) => {
          const bottom = j === 3 ? 0 : totals[j],
            top = j === 3 ? pred : totals[j + 1],
            x = a.x(j + 0.5),
            bw = (a.w / 4) * 0.58;
          const p = P("waterfall" + j, x, a.y(top)),
            py = a.y(bottom);
          s.rect(
            "contribution" + j,
            x - bw / 2,
            Math.min(p[1], py),
            bw,
            Math.abs(py - p[1]),
            palette[j] + "50",
            { stroke: palette[j] },
          );
          s.text(
            "contribution-label" + j,
            x,
            Math.min(p[1], py) - 10,
            `${v > 0 && j < 3 ? "+" : ""}${fmt(v, 2)}`,
            { "text-anchor": "middle", "font-size": 15 },
          );
          s.text("contribution-name" + j, x, 347, names[j], {
            "text-anchor": "middle",
            "font-size": 12,
          });
          if (j < 2)
            s.line(
              "carry" + j,
              x + bw / 2,
              a.y(top),
              a.x(j + 1.5) - bw / 2,
              a.y(top),
              palette[2],
              1.2,
              "4 3",
            );
        });
        caption(
          s,
          "mlr-foot",
          "A negative contribution moves the running total down.",
          388,
        );
      } else if (i === 4) {
        caption(
          s,
          "mlr-title",
          "Holding x₂ fixed gives a straight slice of the plane.",
        );
        const yd = extent(
            [-2, 2].flatMap((x) => [-2, 2].map((z) => predict({ x, z }))),
            0.15,
          ),
          a = frame(
            s,
            "slice2d",
            { x: 43, y: 94, w: s.w - 66, h: 230 },
            [-2, 2],
            yd,
            ["Input x₁", "Predicted y"],
          );
        [-1.5, 0, 1.5].forEach((z, j) =>
          line(
            s,
            P,
            "other-slice" + j,
            [-2, 2].map((x) => [a.x(x), a.y(predict({ x, z }))]),
            "#bfc9be",
            1.4,
            "5 5",
          ),
        );
        line(
          s,
          P,
          "chosen-slice",
          [-2, 2].map((x) => [a.x(x), a.y(predict({ x, z: st.slice }))]),
          palette[2],
          3,
        );
        const qx = Math.min(1, st.query),
          p0 = P("rise-start", a.x(qx), a.y(predict({ x: qx, z: st.slice }))),
          p1 = P(
            "rise-end",
            a.x(qx + 1),
            a.y(predict({ x: qx + 1, z: st.slice })),
          );
        s.line("run", ...p0, p1[0], p0[1], palette[3], 2, "4 4");
        arrow(s, "rise", [p1[0], p0[1]], p1, palette[1], 2);
        caption(
          s,
          "mlr-foot",
          `+1 in x₁ → ${fmt(b[1], 3)} in ŷ, at the same x₂.`,
          385,
        );
      } else if (i === 6) {
        caption(
          s,
          "mlr-title",
          "Remove the shared x₂ pattern. The x₁ slope changes.",
        );
        const residuals = d.confounding.map((r) => ({
          ...r,
          rx: r.x - d.xOnZ.predict(r),
          ry: r.y - d.yOnZ.predict(r),
        }));
        const plots = [
          {
            rows: d.confounding,
            x: (r) => r.x,
            y: (r) => r.y,
            label: "Raw x₁ and y",
            slope: d.marginal.coefficients[1],
            intercept: d.marginal.coefficients[0],
          },
          {
            rows: residuals,
            x: (r) => r.rx,
            y: (r) => r.ry,
            label: "After removing x₂",
            slope: d.adjusted.coefficients[1],
            intercept: 0,
          },
        ];
        plots.forEach((v, j) => {
          const a = frame(
            s,
            "confound" + j,
            { x: 44, y: 92 + j * 163, w: s.w - 68, h: 100 },
            extent(v.rows.map(v.x)),
            extent(v.rows.map(v.y)),
            [],
            false,
          );
          s.text(
            "confound-label" + j,
            a.l,
            a.t - 12,
            v.label + ": slope " + fmt(v.slope, 2),
            { "font-size": 15, fill: palette[j ? 2 : 1] },
          );
          v.rows.forEach((r) =>
            s.circle(
              "confound-dot" + j + r.id,
              ...P("confound-dot" + j + r.id, a.x(v.x(r)), a.y(v.y(r))),
              2.8,
              palette[0] + "99",
            ),
          );
          const xd = extent(v.rows.map(v.x));
          line(
            s,
            P,
            "confound-line" + j,
            xd.map((x) => [a.x(x), a.y(v.intercept + v.slope * x)]),
            palette[j ? 2 : 1],
            2.6,
          );
          s.text("confound-x" + j, a.r, a.b + 18, j ? "x₁ residual" : "x₁", {
            "text-anchor": "end",
            "font-size": 12,
          });
        });
      } else if (i === 7) {
        const titleEnd = caption(
          s,
          "mlr-title",
          "More predictors shrink training error. Is it worth it?",
        );
        const a = frame(
          s,
          "r2",
          { x: 65, y: titleEnd + 59, w: s.w - 103, h: 330 - titleEnd - 59 },
          [0, 1],
          [-0.2, 1],
          [],
        );
        // The chart heading owns a separate band above value annotations.
        s.text("r2-yl", a.l, a.t - 37, "R² / adjusted R²", { "font-size": 14 });
        const series =
          st.noiseFeature === "yes" ? [scores, extraScores] : [scores, scores];
        ["r2", "adjusted"].forEach((k, j) => {
          line(
            s,
            P,
            "score-line" + k,
            series.map((v, i) => [a.x(0.2 + 0.6 * i), a.y(v[k])]),
            palette[j],
            2.5,
          );
          series.forEach((v, i) => {
            s.circle(
              "score" + k + i,
              ...P("score" + k + i, a.x(0.2 + 0.6 * i), a.y(v[k])),
              6,
              palette[j],
            );
            s.text(
              "score-value" + k + i,
              a.x(0.2 + 0.6 * i),
              a.y(v[k]) + (j ? 26 : -13),
              fmt(v[k], 3),
              { "text-anchor": "middle", "font-size": 14, fill: palette[j] },
            );
          });
        });
        s.text("r2-before", a.x(0.2), 367, "x₁ + x₂", {
          "text-anchor": "middle",
          "font-size": 14,
        });
        s.text(
          "r2-after",
          a.x(0.8),
          367,
          st.noiseFeature === "yes" ? "+ random noise" : "No extra term",
          { "text-anchor": "middle", "font-size": 14 },
        );
        caption(s, "r2-key", "Blue: R² · red: adjusted R²", 400);
      } else {
        caption(
          s,
          "mlr-title",
          "An estimate is a location. Uncertainty is a range.",
        );
        const xd = extent(
            [0, ...d.ci.intervals.flatMap((c) => [c.lo, c.hi])],
            0.25,
          ),
          a = frame(
            s,
            "ci",
            { x: 85, y: 95, w: s.w - 119, h: 210 },
            xd,
            [0, 3],
            ["Coefficient value", ""],
            false,
          );
        s.line("zero", a.x(0), a.t, a.x(0), a.b, "#969f90", 1.3, "4 4");
        d.ci.intervals.forEach((c, j) => {
          const y = a.y(2.5 - j),
            p = P("ci-point" + j, a.x(c.value), y);
          s.text("ci-name" + j, 14, y + 5, ["β₀", "β₁", "β₂"][j], {
            "font-size": 18,
          });
          s.line("ci-range" + j, a.x(c.lo), y, a.x(c.hi), y, palette[0], 3);
          s.circle("ci-point" + j, ...p, 6, palette[0]);
          s.text(
            "ci-numeric" + j,
            a.x((c.lo + c.hi) / 2),
            y + 26,
            `${fmt(c.value, 2)} [${fmt(c.lo, 2)}, ${fmt(c.hi, 2)}]`,
            { "text-anchor": "middle", "font-size": 13 },
          );
        });
        caption(
          s,
          "mlr-foot",
          "95% t intervals · " + d.ci.df + " residual degrees of freedom",
          375,
        );
      }
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
