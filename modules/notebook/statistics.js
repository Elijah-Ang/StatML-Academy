import {
  samplingStory,
  coverageStory,
  anovaStory,
  componentStory,
} from "./statistics-scenes.js";
import {
  makeLab,
  fmt,
  palette,
  extent,
  linspace,
  plotLine,
  bars,
  flow,
} from "./lab.js";
import {
  anovaData,
  anova,
  chiSquare,
  correlation,
  regressionData,
  timeData,
  acf,
  mean,
  sum,
  variance,
  seeded,
  gaussianRandom,
  normalCDF,
  normalPDF,
  tTail,
  logGamma,
} from "./science.js";
export function create(host, slug) {
  const aov = slug === "anova",
    chi = slug === "chi-square",
    corr = slug === "correlation",
    time = slug === "time-series-analysis",
    sampling = slug === "probability-sampling";
  const initial = {
    gap: 8,
    noise: 5,
    interaction: 0,
    setting: 5,
    cell: 0,
    a: 30,
    b: 10,
    c: 30,
    d: 30,
    pattern: "linear",
    outlier: 0,
    trend: 0.15,
    season: 3,
    shift: 0,
    origin: 36,
    lag: 1,
    n: 36,
    effect: 4,
    alternative: 4,
    sampleIndex: 1,
    sigma: 10,
    interval: 1,
    selected: 1,
    seed: 19,
  };
  let controls;
  if (aov)
    controls = [
      {
        key: "gap",
        label: "Between-method mean gap",
        min: 0,
        max: 15,
        step: 0.5,
      },
      {
        key: "noise",
        label: "Within-group noise SD",
        min: 1,
        max: 15,
        step: 0.5,
      },
      {
        key: "interaction",
        label: "Additional setting × method effect",
        min: -15,
        max: 15,
        step: 1,
      },
      {
        key: "setting",
        label: "Second-setting main effect",
        min: -10,
        max: 10,
        step: 1,
      },
    ];
  else if (chi)
    controls = ["a", "b", "c", "d"].map((key, i) => ({
      key,
      label: [
        "A recovered",
        "A not recovered",
        "B recovered",
        "B not recovered",
      ][i],
      min: 1,
      max: 100,
      step: 1,
    }));
  else if (corr)
    controls = [
      {
        key: "pattern",
        label: "Paired pattern",
        options: [
          ["linear", "Increasing linear"],
          ["negative", "Decreasing linear"],
          ["curve", "Symmetric curve"],
        ],
      },
      { key: "noise", label: "Outcome noise", min: 0.1, max: 4, step: 0.1 },
      {
        key: "outlier",
        label: "Move one outcome",
        min: -15,
        max: 15,
        step: 0.5,
      },
      {
        key: "selected",
        label: "Inspect pair number",
        min: 1,
        max: 30,
        step: 1,
      },
    ];
  else if (time)
    controls = [
      {
        key: "trend",
        label: "Trend per month",
        min: -0.3,
        max: 0.5,
        step: 0.01,
      },
      { key: "season", label: "Seasonal amplitude", min: 0, max: 6, step: 0.2 },
      {
        key: "shift",
        label: "Level shift from month 37",
        min: -8,
        max: 8,
        step: 0.5,
      },
      {
        key: "origin",
        label: "Forecast origin (last known month)",
        min: 24,
        max: 36,
        step: 1,
      },
      {
        key: "lag",
        label: "Lag / difference interval",
        min: 1,
        max: 12,
        step: 1,
      },
    ];
  else if (sampling)
    controls = [
      { key: "n", label: "Observations per sample", min: 4, max: 144, step: 1 },
      {
        key: "sampleIndex",
        label: "Inspect sample number",
        min: 1,
        max: 200,
        step: 1,
      },
      { key: "sigma", label: "Population SD", min: 1, max: 20, step: 0.5 },
      {
        key: "interval",
        label: "Density interval ± SD",
        min: 0.1,
        max: 3,
        step: 0.1,
      },
    ];
  else
    controls = [
      {
        key: "effect",
        label: "Observed estimate",
        min: -10,
        max: 10,
        step: 0.2,
      },
      {
        key: "n",
        label: "Independent observations",
        min: 4,
        max: 400,
        step: 1,
      },
      {
        key: "sigma",
        label: "Known population SD",
        min: 1,
        max: 20,
        step: 0.5,
      },
    ];
  if (aov)
    controls.push({
      key: "selected",
      label: "Inspect score number",
      min: 1,
      max: 24,
      step: 1,
    });
  if (!aov && !chi && !corr && !time && !sampling)
    controls.push({
      key: "alternative",
      label: "Planned true effect for power",
      min: -10,
      max: 10,
      step: 0.2,
    });
  if (corr) initial.noise = 0.8;
  const L = makeLab(host, slug, initial, controls);
  let key = "",
    data;
  function compute() {
    const st = L.state,
      k = JSON.stringify(
        controls
          .filter((c) => c.key !== "sampleIndex" && c.key !== "selected")
          .map((c) => st[c.key])
          .concat(st.seed),
      );
    if (k === key) return data;
    key = k;
    if (aov) {
      const rows = anovaData(st.gap, st.noise, st.seed),
        result = anova(rows),
        rng = seeded(st.seed);
      const two = Array.from({ length: 36 }, (_, i) => {
        const group = Math.floor(i / 12),
          setting = Math.floor(i / 6) % 2;
        return {
          id: "T" + i,
          group,
          setting,
          y:
            55 +
            group * st.gap +
            setting * st.setting +
            group * setting * st.interaction +
            gaussianRandom(rng) * st.noise,
        };
      });
      const grand = mean(two.map((r) => r.y)),
        am = [0, 1, 2].map((g) =>
          mean(two.filter((r) => r.group === g).map((r) => r.y)),
        ),
        bm = [0, 1].map((b) =>
          mean(two.filter((r) => r.setting === b).map((r) => r.y)),
        ),
        cm = [0, 1, 2].map((g) =>
          [0, 1].map((b) =>
            mean(
              two
                .filter((r) => r.group === g && r.setting === b)
                .map((r) => r.y),
            ),
          ),
        );
      const ssA = 12 * sum(am.map((m) => (m - grand) ** 2)),
        ssB = 18 * sum(bm.map((m) => (m - grand) ** 2)),
        ssAB =
          6 *
          sum(
            cm.flatMap((cs, g) =>
              cs.map((m, b) => (m - am[g] - bm[b] + grand) ** 2),
            ),
          ),
        ssE = sum(two.map((r) => (r.y - cm[r.group][r.setting]) ** 2));
      return (data = { rows, result, two, am, bm, cm, ssA, ssB, ssAB, ssE });
    }
    if (chi) return (data = chiSquare([st.a, st.b, st.c, st.d]));
    if (corr) {
      const rng = seeded(st.seed),
        rows = Array.from({ length: 30 }, (_, i) => {
          const x = -2 + (4 * i) / 29,
            y =
              (st.pattern === "curve"
                ? 2 * x * x
                : st.pattern === "negative"
                  ? -2 * x
                  : 2 * x) +
              gaussianRandom(rng) * st.noise +
              (i === 0 ? st.outlier : 0);
          return { id: String(i + 1), x, y };
        }),
        r = correlation(rows),
        t = r.r == null ? 0 : r.r * Math.sqrt(28 / (1 - r.r * r.r));
      return (data = { rows, ...r, t, p: tTail(t, 28) });
    }
    if (time) {
      const rows = timeData(st.trend, st.season, st.shift),
        origin = st.origin,
        future = rows.slice(origin, origin + 12),
        forecast = future.map((r, i) => ({
          ...r,
          pred: rows[origin - 12 + i].y,
        })),
        residuals = forecast.map((r) => r.y - r.pred);
      return (data = {
        rows,
        forecast,
        residuals,
        mae: mean(residuals.map(Math.abs)),
      });
    }
    const rng = seeded(st.seed),
      samples = Array.from({ length: 200 }, () =>
        Array.from({ length: st.n }, () => 50 + st.sigma * gaussianRandom(rng)),
      ),
      means = samples.map(mean),
      se = st.sigma / Math.sqrt(st.n),
      z = st.effect / se,
      p = 2 * (1 - normalCDF(Math.abs(z))),
      powerZ = st.alternative / se,
      power =
        normalCDF(-1.9599639845 - powerZ) +
        1 -
        normalCDF(1.9599639845 - powerZ);
    return (data = {
      samples,
      means,
      sampleDomain: [
        Math.min(50 - 4 * st.sigma, ...samples.flat()),
        Math.max(50 + 4 * st.sigma, ...samples.flat()),
      ],
      coverage: means
        .slice(0, 40)
        .map((m) => ({
          mean: m - 50,
          lo: m - 50 - 1.9599639845 * se,
          hi: m - 50 + 1.9599639845 * se,
          covers: Math.abs(m - 50) <= 1.9599639845 * se,
        })),
      se,
      z,
      p,
      power,
      lo: st.effect - 1.9599639845 * se,
      hi: st.effect + 1.9599639845 * se,
    });
  }
  if (!chi && !time)
    L.action(
      "resample",
      aov || corr ? "Draw another sample" : "Draw a new batch",
      () => L.update({ seed: L.state.seed + 1 }),
    );
  L.surface.onAction = (id) => {
    if (corr || aov) L.update({ selected: +id });
  };
  return L.init((animate = false) => {
    const st = L.state,
      d = compute(),
      scene = L.scene;
    if (aov) {
      ["interaction", "setting"].forEach(
        (id) =>
          (document.getElementById(id).closest("label").hidden =
            L.index < 10 && scene !== "interaction"),
      );
    }
    if (aov)
      document.getElementById("selected").closest("label").hidden =
        L.index !== 3;
    if (!aov && !chi && !corr && !time && !sampling) {
      document.getElementById("alternative").closest("label").hidden =
        scene !== "power";
      document.getElementById("effect").closest("label").hidden =
        scene === "power" || [1, 8].includes(L.index);
    }
    if (sampling)
      for (const id of ["n", "sampleIndex"])
        document.getElementById(id).closest("label").hidden =
          scene === "density";
    let receipt, notice;
    if (aov) {
      const r = d.result,
        two = L.index >= 10 || scene === "interaction";
      L.metrics(
        two
          ? [
              ["Factor A SS", fmt(d.ssA, 2)],
              ["Interaction SS", fmt(d.ssAB, 2)],
              ["Error SS", fmt(d.ssE, 2)],
            ]
          : [
              ["F (2, 21)", fmt(r.F, 3)],
              ["Upper-tail p", fmt(r.p, 5)],
              ["η²", fmt(r.eta, 3)],
            ],
      );
      receipt = two
        ? [
            ["Design", "3 methods × 2 settings × 6 observations"],
            ["Factor A SS / df", fmt(d.ssA, 3) + " / 2"],
            ["Factor B SS / df", fmt(d.ssB, 3) + " / 1"],
            ["Interaction SS / df", fmt(d.ssAB, 3) + " / 2"],
            ["Residual SS / df", fmt(d.ssE, 3) + " / 30"],
            ["Marginal means", d.am.map((m) => fmt(m, 2)).join(", ")],
          ]
        : [
            ["Grand mean", fmt(r.grand, 3)],
            ["Between SS / df", fmt(r.between, 3) + " / " + r.d1],
            ["Within SS / df", fmt(r.within, 3) + " / " + r.d2],
            [
              "F calculation",
              fmt(r.between / r.d1, 3) + " / " + fmt(r.within / r.d2, 3),
            ],
            [
              "Mean B − mean A",
              fmt(r.means[1] - r.means[0], 3) +
                " (unadjusted descriptive contrast)",
            ],
          ];
      notice = two
        ? "Computed balanced two-way sample. Interaction is a difference of differences; SS partitions are specific to this balanced design. No post-hoc significance claim is made."
        : "Computed one-way ANOVA under an independent normal, equal-variance teaching model. A p-value is not the probability that equal means are true.";
    } else if (chi) {
      L.metrics([
        ["χ² · df 1", fmt(d.stat, 3)],
        ["Upper-tail p", fmt(d.p, 5)],
        ["Cramér’s V", fmt(d.v, 3)],
      ]);
      receipt = d.expected.map((e, i) => [
        ["A recovered", "A not recovered", "B recovered", "B not recovered"][i],
        "O " +
          st[["a", "b", "c", "d"][i]] +
          " · E " +
          fmt(e, 2) +
          " · contribution " +
          fmt(d.contributions[i], 3),
      ]);
      notice =
        "Pearson chi-square approximation, independent counts, no continuity correction. " +
        (Math.min(...d.expected) < 5
          ? "Some expected counts are below 5: inspect an exact or design-appropriate alternative."
          : "All displayed expected counts are at least 5; design assumptions still need checking.");
    } else if (corr) {
      const row = d.rows[Math.max(0, st.selected - 1)];
      L.metrics([
        ["Pearson r", fmt(d.r, 3)],
        ["t · df 28", fmt(d.t, 3)],
        ["Two-sided p", fmt(d.p, 5)],
      ]);
      receipt = [
        ["Selected pair", row.id],
        ["Centered values", fmt(row.x - d.mx, 3) + ", " + fmt(row.y - d.my, 3)],
        ["Their product", fmt((row.x - d.mx) * (row.y - d.my), 3)],
        ["Sum of products", fmt(d.xy, 3)],
        ["Divide by √(SSx × SSy)", fmt(Math.sqrt(d.xx * d.yy), 3)],
      ];
      notice =
        "Pearson r summarizes linear association. The displayed t-reference p-value assumes independent pairs and the usual bivariate-normal null model; the curved scenario intentionally violates that model. It is not causal evidence.";
    } else if (time) {
      L.metrics([
        ["Known through month", st.origin],
        ["12-step seasonal-naive MAE", fmt(d.mae, 3)],
        [
          "Series ACF at lag " + st.lag,
          fmt(
            acf(
              d.rows.map((r) => r.y),
              st.lag,
            ),
            3,
          ),
        ],
      ]);
      receipt = [
        ["Baseline", "Repeat the last observed 12-month season"],
        ["First future month", d.forecast[0].x],
        ["First prediction", fmt(d.forecast[0].pred, 3)],
        ["Actual for evaluation", fmt(d.forecast[0].y, 3)],
        ["Residual", fmt(d.residuals[0], 3)],
      ];
      notice =
        "Synthetic monthly series. Components are known simulation values, not an estimated decomposition. Fixed-origin forecasts use only the previous observed season; future actuals are used solely to score them. No fabricated forecast interval is shown.";
    } else if (sampling) {
      L.metrics([
        ["Current sample mean", fmt(d.means[st.sampleIndex - 1], 3)],
        ["Theoretical SE", fmt(d.se, 3)],
        ["SD of 200 means", fmt(Math.sqrt(variance(d.means)), 3)],
      ]);
      receipt = [
        ["Population model", "Normal mean 50, SD " + st.sigma],
        ["Current sample n", st.n],
        [
          "Sample SD",
          fmt(Math.sqrt(variance(d.samples[st.sampleIndex - 1])), 3),
        ],
        [
          "Estimated SE",
          fmt(
            Math.sqrt(variance(d.samples[st.sampleIndex - 1])) /
              Math.sqrt(st.n),
            3,
          ),
        ],
        [
          "Interval probability",
          fmt((normalCDF(st.interval) - normalCDF(-st.interval)) * 100, 2) +
            "%",
        ],
      ];
      notice =
        "200 computed independent samples from a stated normal population. One dot represents one sample mean. Resize and scrolling preserve the seed and samples. Clustering and biased selection require different sampling models.";
    } else {
      L.metrics(
        scene === "power"
          ? [
              ["Planned true effect", fmt(st.alternative, 2)],
              ["Prospective power", fmt(d.power * 100, 2) + "%"],
              ["α / known-σ SE", "0.05 / " + fmt(d.se, 3)],
            ]
          : [1, 8].includes(L.index)
            ? [
                ["Fixed true effect", "0"],
                [
                  "This batch covers",
                  d.coverage.filter((r) => r.covers).length + " / 40",
                ],
                ["Nominal procedure", "95%"],
              ]
            : [
                ["Known-σ SE", fmt(d.se, 3)],
                ["95% interval", fmt(d.lo, 2) + " to " + fmt(d.hi, 2)],
                ["Two-sided z-test p", fmt(d.p, 5)],
              ],
      );
      receipt = [
        ["Model", "Independent normal observations, known population SD"],
        ["Null mean effect", "0"],
        ["z = estimate / SE", fmt(d.z, 3)],
        ["Planned true effect for power", fmt(st.alternative, 2)],
        [
          "Repeated-interval batch",
          `${d.coverage.filter((r) => r.covers).length} / 40 cover the fixed true effect 0`,
        ],
        ["Power at specified alternative", fmt(d.power * 100, 2) + "%"],
        [
          "Power interpretation",
          "Prospective power if the chosen effect is the true alternative; not the probability this result is true.",
        ],
      ];
      notice =
        "Exact normal known-σ teaching model with α = 0.05. The observed-estimate and planned-true-effect controls are separate. Repeated intervals simulate new studies with the fixed true effect 0. Real estimated-σ inference usually uses t methods.";
    }
    if (!aov && !chi && !corr && !time && !sampling && scene === "power")
      receipt = [
        ["Planned true effect", fmt(st.alternative, 3)],
        ["Known-σ SE", fmt(d.se, 3)],
        ["Rejection rule", "|estimate / SE| > 1.95996"],
        ["Prospective power", fmt(d.power * 100, 2) + "%"],
        [
          "Scope",
          "Chance to reject H₀=0 if the planned effect is true; not a probability the hypothesis is true.",
        ],
      ];
    if (!aov && !chi && !corr && !time && !sampling && [1, 8].includes(L.index))
      receipt = [
        ["True effect in the simulation", "0 (fixed)"],
        ["Interval rule", "sample mean ± 1.95996 × known-σ SE"],
        [
          "Coverage in this batch",
          d.coverage.filter((r) => r.covers).length + " / 40",
        ],
        [
          "Long-run target",
          "95% under the stated normal, independent, known-σ model",
        ],
      ];
    L.receipt(L.table(["Inspect", "Calculation"], receipt));
    L.note(notice);
    L.data = d;
    L.legend(
      time
        ? [
            ["Observed", palette[0]],
            ["Seasonal-naive forecast", palette[1]],
          ]
        : aov
          ? [
              ["Method A", palette[0]],
              ["Method B", palette[1]],
              ["Method C", palette[2]],
            ]
          : [
              ["Observed / estimate", palette[0]],
              ["Reference / comparison", palette[1]],
            ],
    );
    if (aov && (L.index >= 10 || scene === "interaction"))
      L.legend([
        ["Setting 0", palette[0]],
        ["Setting 1", palette[1]],
      ]);
    if (time && scene === "components")
      L.legend([
        ["Observed", palette[0]],
        ["Trend", palette[1]],
        ["Seasonal", palette[2]],
        ["Remainder", palette[3]],
      ]);
    if (sampling)
      L.legend(
        scene === "density"
          ? [
              ["Population density", palette[0]],
              ["Interval area", palette[2]],
            ]
          : [
              ["One observation", palette[0]],
              ["One sample mean", palette[2]],
              ["Inspected mean", palette[3]],
            ],
      );
    if (!aov && !chi && !corr && !time && !sampling)
      L.legend(
        scene === "power"
          ? [
              ["Null: effect 0", palette[0]],
              ["Planned alternative", palette[1]],
              ["Rejection boundary", palette[2]],
            ]
          : [1, 8].includes(L.index)
            ? [
                ["Covers fixed truth", palette[0]],
                ["Misses truth (×)", palette[1]],
              ]
            : [
                ["Estimate and interval", palette[0]],
                ["Null effect 0", "#969b8f"],
              ],
      );
    L.draw((s, P) => {
      const { w } = s.begin(310);
      if (aov) {
        const two = L.index >= 10 || scene === "interaction";
        if (L.index === 3) anovaStory(s, P, d, st.selected);
        else if (
          scene === "partition" ||
          scene === "table" ||
          scene === "ratio"
        )
          bars(
            s,
            P,
            two
              ? [
                  { label: "A SS", value: d.ssA },
                  { label: "B SS", value: d.ssB },
                  { label: "A×B SS", value: d.ssAB },
                  { label: "Error SS", value: d.ssE },
                ]
              : scene === "ratio"
                ? [
                    {
                      label: "MS between",
                      value: d.result.between / d.result.d1,
                    },
                    {
                      label: "MS within",
                      value: d.result.within / d.result.d2,
                    },
                  ]
                : [
                    { label: "Between SS", value: d.result.between },
                    { label: "Within SS", value: d.result.within },
                  ],
          );
        else if (two) {
          const a = s.axes(
            [0, 2],
            extent(d.cm.flat()),
            "Teaching method",
            "Cell mean",
            [0, 1, 2],
          );
          [0, 1].forEach((b) =>
            plotLine(
              s,
              P,
              "setting" + b,
              d.cm.map((m, g) => [a.x(g), a.y(m[b])]),
              palette[b],
              2.8,
            ),
          );
        } else {
          const a = s.axes(
            [-0.5, 2.5],
            extent(d.rows.map((r) => r.y)),
            "Teaching method",
            "Score",
            [0, 1, 2],
          );
          d.rows.forEach((r, i) => {
            const p = P(r.id, a.x(r.group + ((i % 8) - 3.5) * 0.03), a.y(r.y));
            s.circle(r.id, ...p, 4.7, palette[r.group]);
          });
          d.result.means.forEach((m, i) =>
            s.line(
              "mean" + i,
              a.x(i - 0.25),
              a.y(m),
              a.x(i + 0.25),
              a.y(m),
              palette[i],
              3,
            ),
          );
        }
      } else if (chi) {
        if (scene === "distribution") {
          const xmax = Math.max(10, d.stat * 1.2),
            a = s.axes([0, xmax], [0, 0.65], "Chi-square statistic", "Density"),
            xs = linspace(0.04, xmax, 100),
            pdf = (x) => Math.exp(-x / 2) / Math.sqrt(2 * Math.PI * x);
          plotLine(
            s,
            P,
            "density",
            xs.map((x) => [a.x(x), a.y(Math.min(0.65, pdf(x)))]),
            palette[0],
          );
          s.line(
            "statistic",
            a.x(d.stat),
            a.t,
            a.x(d.stat),
            a.b,
            palette[1],
            2,
          );
          xs.filter((x) => x >= d.stat).forEach((x, i) =>
            s.line(
              "tail" + i,
              a.x(x),
              a.b,
              a.x(x),
              a.y(Math.min(0.65, pdf(x))),
              palette[1] + "45",
              2,
            ),
          );
        } else if (scene === "contributions")
          bars(
            s,
            P,
            d.contributions.map((value, i) => ({
              label: ["A yes", "A no", "B yes", "B no"][i],
              value,
            })),
          );
        else {
          const cellw = (w - 30) / 2;
          [st.a, st.b, st.c, st.d].forEach((v, i) => {
            const x = 15 + (i % 2) * cellw,
              y = 25 + Math.floor(i / 2) * 125;
            s.rect("cell" + i, x, y, cellw - 8, 112, palette[i % 2] + "15", {
              stroke: "#c8cbbd",
            });
            s.text(
              "label" + i,
              x + 12,
              y + 24,
              ["A recovered", "A not", "B recovered", "B not"][i],
              { "font-size": 15 },
            );
            s.text("observed" + i, x + 12, y + 59, "O = " + v, {
              "font-size": 23,
            });
            s.text(
              "expected" + i,
              x + 12,
              y + 88,
              "E = " + fmt(d.expected[i], 2),
              { "font-size": 16 },
            );
          });
        }
      } else if (corr) {
        if (scene === "causal") {
          flow(
            s,
            P,
            [
              "Hot weather",
              "More swimming and more ice-cream sales",
              "Observed association between outcomes",
              "Causal direction is not identified by r",
            ],
            1,
          );
        } else if (scene === "distribution") {
          const limit = Math.max(4, Math.min(12, Math.abs(d.t) + 1)),
            a = s.axes(
              [-limit, limit],
              [0, 0.42],
              "t statistic · df 28",
              "Density",
            ),
            xs = linspace(-limit, limit, 120),
            pdf = (x) =>
              (Math.exp(logGamma(14.5) - logGamma(14)) /
                Math.sqrt(28 * Math.PI)) *
              (1 + (x * x) / 28) ** -14.5;
          plotLine(
            s,
            P,
            "reference",
            xs.map((x) => [a.x(x), a.y(pdf(x))]),
            palette[0],
          );
          s.line(
            "observed",
            a.x(Math.max(-limit, Math.min(limit, d.t))),
            a.t,
            a.x(Math.max(-limit, Math.min(limit, d.t))),
            a.b,
            palette[1],
            2,
          );
        } else {
          const a = s.axes(
            extent(d.rows.map((r) => r.x)),
            extent(d.rows.map((r) => r.y)),
            "Input x",
            "Paired outcome y",
          );
          s.line("xmean", a.x(d.mx), a.t, a.x(d.mx), a.b, "#afb2a7", 1, "3 4");
          s.line("ymean", a.l, a.y(d.my), a.r, a.y(d.my), "#afb2a7", 1, "3 4");
          d.rows.forEach((r) => {
            const p = P(r.id, a.x(r.x), a.y(r.y));
            s.mark(
              r.id,
              ...p,
              palette[0],
              "Pair " + r.id + " x " + fmt(r.x) + " y " + fmt(r.y),
              +r.id === st.selected,
              r.id,
            );
          });
        }
      } else if (time) {
        if (scene === "components") componentStory(s, P, d);
        else if (scene === "lag") {
          const xs = d.rows.slice(0, -st.lag),
            ys = d.rows.slice(st.lag),
            domain = extent(d.rows.map((r) => r.y)),
            a = s.axes(
              domain,
              domain,
              "y at time t − " + st.lag,
              "y at time t",
            );
          xs.forEach((r, i) => {
            const p = P("lag" + i, a.x(r.y), a.y(ys[i].y));
            s.circle("lag" + i, ...p, 4, palette[0]);
          });
        } else if (scene === "residuals") {
          bars(
            s,
            P,
            [1, 2, 3, 4].map((l) => ({
              label: "Lag " + l,
              value: acf(d.residuals, l),
            })),
            { domain: 1 },
          );
        } else {
          const rows =
              scene === "differences"
                ? d.rows
                    .slice(st.lag)
                    .map((r, i) => ({ ...r, y: r.y - d.rows[i].y }))
                : d.rows,
            a = s.axes(
              [1, 48],
              extent(
                scene === "components"
                  ? [
                      ...d.rows.map((r) => r.y),
                      ...d.rows.map((r) => r.seasonal),
                      ...d.rows.map((r) => r.noise),
                    ]
                  : [...rows.map((r) => r.y), ...d.forecast.map((r) => r.pred)],
              ),
              "Month",
              scene === "differences" ? "Difference" : "Value",
            );
          plotLine(
            s,
            P,
            "series",
            rows.map((r) => [a.x(r.x), a.y(r.y)]),
            palette[0],
            2,
          );
          if (scene === "components")
            ["trend", "seasonal", "noise"].forEach((k, i) =>
              plotLine(
                s,
                P,
                k,
                d.rows.map((r) => [a.x(r.x), a.y(r[k])]),
                palette[i + 1],
                1.6,
              ),
            );
          if (scene === "forecast") {
            plotLine(
              s,
              P,
              "forecast",
              d.forecast.map((r) => [a.x(r.x), a.y(r.pred)]),
              palette[1],
              2.6,
              "4 4",
            );
            s.line(
              "origin",
              a.x(st.origin),
              a.t,
              a.x(st.origin),
              a.b,
              palette[2],
              1.4,
              "4 4",
            );
          }
        }
      } else if (sampling) {
        if (scene === "density") {
          const a = s.axes(
              [50 - 3.5 * st.sigma, 50 + 3.5 * st.sigma],
              [0, normalPDF(50, 50, st.sigma) * 1.15],
              "Population value",
              "Density",
            ),
            xs = linspace(50 - 3.5 * st.sigma, 50 + 3.5 * st.sigma, 101);
          plotLine(
            s,
            P,
            "density",
            xs.map((x) => [a.x(x), a.y(normalPDF(x, 50, st.sigma))]),
            palette[0],
          );
          xs.filter((x) => Math.abs(x - 50) < st.interval * st.sigma).forEach(
            (x, i) =>
              s.line(
                "area" + i,
                a.x(x),
                a.b,
                a.x(x),
                a.y(normalPDF(x, 50, st.sigma)),
                palette[2] + "55",
                3,
              ),
          );
        } else {
          samplingStory(s, P, d, st, scene);
        }
      } else {
        if ([1, 8].includes(L.index)) coverageStory(s, P, d);
        else if (scene === "power") {
          const domain = extent(
              [
                -4 * d.se,
                4 * d.se,
                st.alternative - 4 * d.se,
                st.alternative + 4 * d.se,
              ],
              0.01,
            ),
            a = s.axes(
              domain,
              [0, normalPDF(0, 0, d.se) * 1.15],
              "Estimated effect",
              "Sampling density",
            ),
            xs = linspace(...domain, 100);
          [0, st.alternative].forEach((mu, i) =>
            plotLine(
              s,
              P,
              "density" + i,
              xs.map((x) => [a.x(x), a.y(normalPDF(x, mu, d.se))]),
              palette[i],
              2.2,
            ),
          );
          [-1, 1].forEach((sign) =>
            s.line(
              "critical" + sign,
              a.x(sign * 1.96 * d.se),
              a.t,
              a.x(sign * 1.96 * d.se),
              a.b,
              palette[2],
              1.4,
              "4 4",
            ),
          );
        } else {
          const a = s.axes(
              extent([0, d.lo, d.hi]),
              [0, 1],
              "Effect in outcome units",
              "",
            ),
            p = P("estimate", a.x(st.effect), a.y(0.5)),
            lo = P("lo", a.x(d.lo), a.y(0.5)),
            hi = P("hi", a.x(d.hi), a.y(0.5));
          s.line("null", a.x(0), a.t, a.x(0), a.b, "#969b8f", 1.4, "4 4");
          s.line("ci", ...lo, ...hi, palette[0], 4);
          s.circle("estimate", ...p, 8, palette[0]);
          s.text("ci-title", a.l, 55, "95% known-σ confidence interval", {
            "font-size": 16,
          });
        }
      }
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
