import { encodingScene } from './metric-scenes.js';
import { makeLab, fmt, palette, bars } from "./lab.js";
import { workflowScene } from "./workflow-scenes.js";
import { mean, seeded } from "./science.js";
export function create(host, slug) {
  const design = slug === "experimental-design",
    missing = slug === "missing-data-encoding";
  const initial = {
    mode: "safe",
    step: 0,
    feature: "before",
    encoding: "onehot",
    mechanism: "mcar",
    missing: 30,
    clusters: 20,
    size: 30,
    icc: 0.05,
    seed: 71,
    selected: 1,
  };
  const controls = design
    ? [
        {
          key: "clusters",
          label: "Randomized schools",
          min: 4,
          max: 40,
          step: 2,
        },
        { key: "size", label: "Students per school", min: 5, max: 50, step: 1 },
        {
          key: "icc",
          label: "Assumed intraclass correlation",
          min: 0,
          max: 0.4,
          step: 0.01,
        },
        { key: "selected", label: "Inspect school", min: 1, max: 40, step: 1 },
      ]
    : [
        {
          key: "mode",
          label: "Transformation fit",
          options: [
            ["safe", "Training rows only"],
            ["leaked", "Include held-out rows (leak)"],
          ],
        },
        ...(missing
          ? [
              {
                key: "encoding",
                label: "Category representation",
                options: [
                  ["onehot", "One-hot: unordered"],
                  ["ordinal", "Ordinal: assumed order"],
                ],
              },
              {
                key: "mechanism",
                label: "Simulated missingness assumption",
                options: [
                  ["mcar", "MCAR: independent missingness"],
                  ["mar", "MAR: depends on observed group"],
                  ["mnar", "MNAR: high hidden values more likely"],
                ],
              },
              {
                key: "missing",
                label: "Simulated missingness strength (%)",
                min: 10,
                max: 70,
                step: 5,
              },
            ]
          : [
              {
                key: "feature",
                label: "Candidate feature availability",
                options: [
                  ["before", "Measured before prediction"],
                  ["after", "Recorded after the outcome"],
                ],
              },
            ]),
        {
          key: "step",
          label: "Inspect pipeline step",
          min: 0,
          max: 4,
          step: 1,
        },
      ];
  const L = makeLab(host, slug, initial, controls);
  let key = "",
    data;
  function compute() {
    const st = L.state,
      k = JSON.stringify(st);
    if (k === key) return data;
    key = k;
    const rng = seeded(st.seed);
    if (design) {
      const baselineRng = seeded(712);
      const schools = Array.from({ length: st.clusters }, (_, i) => ({
          id: i + 1,
          baseline: 40 + 30 * baselineRng(),
          random: rng(),
        }))
          .sort((a, b) => a.random - b.random)
          .map((r, i) => ({ ...r, treatment: i < st.clusters / 2 }))
          .sort((a, b) => a.id - b.id),
        de = 1 + (st.size - 1) * st.icc,
        n = st.clusters * st.size,
        treated = schools.filter((r) => r.treatment),
        control = schools.filter((r) => !r.treatment);
      return (data = {
        schools,
        de,
        n,
        effective: n / de,
        imbalance:
          mean(treated.map((r) => r.baseline)) -
          mean(control.map((r) => r.baseline)),
      });
    }
    const rows = Array.from({ length: 18 }, (_, i) => {
      const group = i % 2,
        truth = 20 + group * 15 + 20 * rng(),
        u = rng(),
        prob =
          (st.missing / 100) *
          (st.mechanism === "mar"
            ? group
              ? 1.5
              : 0.5
            : st.mechanism === "mnar"
              ? truth > 45
                ? 1.5
                : 0.5
              : 1);
      return {
        id: "R" + (i + 1),
        group,
        truth,
        value: u < prob ? null : truth,
        train: i < 12,
      };
    });
    const train = rows.filter((r) => r.train),
      held = rows.filter((r) => !r.train),
      fitRows = st.mode === "safe" ? train : rows,
      observed = fitRows.filter((r) => r.value != null),
      fill = observed.length ? mean(observed.map((r) => r.value)) : null,
      actualMissing = rows.filter((r) => r.value == null),
      error =
        fill == null || !actualMissing.length
          ? null
          : mean(actualMissing.map((r) => (r.truth - fill) ** 2));
    return (data = {
      rows,
      train,
      held,
      fill,
      fitObserved: observed.length,
      error,
      actualMissing,
      safeMean: mean([2, 4]),
      leakedMean: mean([2, 4, 100]),
    });
  }
  if (design)
    L.action("randomize", "Randomize school allocation again", () =>
      L.update({ seed: L.state.seed + 1 }),
    );
  else {
    L.action("repair", "Use training-only fit", () =>
      L.update({ mode: "safe", step: 1 }),
    );
    L.action("next-step", "Next pipeline step", () =>
      L.update({ step: (L.state.step + 1) % 5 }),
    );
  }
  return L.init((animate = false) => {
    const st = L.state,
      d = compute(),
      scene = L.scene;
    L.data = d;
    let receipt, notice;
    if (design) {
      const school = d.schools[Math.min(st.selected, d.schools.length) - 1];
      L.metrics([
        ["Randomized units", st.clusters],
        ["Design effect", fmt(d.de, 3)],
        ["Approx. effective n", fmt(d.effective, 1)],
      ]);
      receipt = [
        ["Measured students", d.n],
        ["Independent assignment unit", "School"],
        ["Baseline treated − control", fmt(d.imbalance, 3)],
        [
          "Selected school",
          school.id + " · " + (school.treatment ? "treatment" : "control"),
        ],
        [
          "Formula",
          "1 + (" +
            st.size +
            " − 1) × " +
            fmt(st.icc, 2) +
            " = " +
            fmt(d.de, 3),
        ],
      ];
      notice =
        "Balanced random assignment of schools; baseline values stay fixed across allocations. Finite-sample imbalance is expected. n/design effect is an equal-cluster-size approximation, not a power calculation or a substitute for cluster-aware inference.";
      L.legend([
        ["Treatment schools", palette[0]],
        ["Control schools", palette[1]],
      ]);
    } else {
      const safe = st.mode === "safe",
        fit = missing ? d.fill : safe ? d.safeMean : d.leakedMean,
        invalid = !missing && st.feature === "after";
      L.metrics([
        ["Fitted mean", fit == null ? "Unavailable" : fmt(fit, 3)],
        ["Observed fit rows", missing ? d.fitObserved : safe ? 2 : 3],
        [
          "Status",
          invalid
            ? "Unavailable feature"
            : safe
              ? "Split respected"
              : "Leak exposed",
        ],
      ]);
      receipt = missing
        ? [
            [
              "Observed / missing",
              d.rows.length -
                d.actualMissing.length +
                " / " +
                d.actualMissing.length,
            ],
            [
              "Fitted imputation mean",
              fit == null ? "No observed training values" : fmt(fit, 3),
            ],
            [
              "Known simulated missing-value MSE",
              d.error == null ? "Unavailable" : fmt(d.error, 3),
            ],
            ["Category example", "red, blue, green; new value purple"],
            [
              "Encoding",
              st.encoding === "onehot"
                ? "Columns Red, Blue, Green, New?: red → [1,0,0,0], blue → [0,1,0,0], green → [0,0,1,0], unknown purple → [0,0,0,1]"
                : "red → 0, blue → 1, green → 2; this asserts ordered distances",
            ],
            [
              "Assumption",
              st.mechanism.toUpperCase() +
                " was chosen in the simulation, not diagnosed from observed data.",
            ],
          ]
        : [
            ["Training values", "2 and 4"],
            ["Held-out value", "100"],
            ["Safe training mean", fmt(d.safeMean, 3)],
            ["Leaked all-row mean", fmt(d.leakedMean, 3)],
            ["Held-out transformed value", fmt(100 - fit, 3)],
            [
              "Feature timing",
              invalid
                ? "After outcome: invalid even with safe transforms"
                : "Available before prediction",
            ],
          ];
      notice = missing
        ? "A small synthetic dataset has known hidden values so reconstruction error can be computed. That oracle is unavailable in real missing data. No universal imputer ranking is implied. Unknown categories use an explicit saved policy."
        : "This example calculates input centering, rather than prediction accuracy. Only training rows should teach the saved mean. Also check related groups, time order and whether each input is known when predicting.";
      L.legend([
        ["Training", palette[0]],
        ["Held-out", palette[1]],
        ["Missing / imputed", palette[3]],
      ]);
    }
    const pipelineScene = ["pipeline", "leakage", "report"].includes(scene);
    const visible = new Set(
      design
        ? ["assignment", "clusters"].includes(scene)
          ? ["clusters", "size", "selected"]
          : scene === "design-effect"
            ? ["clusters", "size", "icc"]
            : scene === "report"
              ? ["clusters"]
              : []
        : missing
          ? scene === "encoding"
            ? ["encoding"]
            : scene === "mechanism"
              ? ["mechanism", "missing"]
              : [
                  "mode",
                  "mechanism",
                  "missing",
                  ...(pipelineScene ? ["step"] : []),
                ]
          : scene === "timing"
            ? ["feature"]
            : scene === "nested"
              ? []
              : ["mode", ...(pipelineScene ? ["step"] : [])],
    );
    controls.forEach(
      (c) =>
        (host.querySelector("#" + c.key).closest("label").hidden = !visible.has(
          c.key,
        )),
    );
    const randomize = host.querySelector("#randomize");
    if (randomize)
      randomize.hidden = !["assignment", "clusters", "report"].includes(scene);
    const repair = host.querySelector("#repair"),
      next = host.querySelector("#next-step");
    if (repair) repair.hidden = !visible.has("mode");
    if (next) next.hidden = !pipelineScene;
    L.receipt(L.table(["Inspect", "Value"], receipt));
    L.note(notice);
    L.draw((s, P) => {
      const { w } = s.begin(310);
      if (design && scene === "design-effect") {
        bars(s, P, [
          { label: "Rows n", value: d.n },
          { label: "Effective n", value: d.effective },
          { label: "Schools", value: st.clusters },
        ]);
      } else if (missing && ["missing", "means"].includes(scene)) {
        const cw = (w - 30) / 6;
        d.rows.forEach((r, i) => {
          const p = P(r.id, 15 + (i % 6) * cw, 30 + Math.floor(i / 6) * 83);
          s.rect(
            r.id,
            p[0],
            p[1],
            cw - 5,
            71,
            r.value == null
              ? palette[3] + "18"
              : (r.train ? palette[0] : palette[1]) + "18",
            { stroke: r.train ? palette[0] + "80" : palette[1] + "80" },
          );
          s.text("id" + r.id, p[0] + 6, p[1] + 19, r.id, { "font-size": 12 });
          s.text(
            "value" + r.id,
            p[0] + 6,
            p[1] + 43,
            r.value == null ? "?" : fmt(r.value, 0),
            { "font-size": 17 },
          );
          s.text(
            "fill" + r.id,
            p[0] + 6,
            p[1] + 60,
            r.value == null
              ? "→" + fmt(d.fill, 0)
              : r.train
                ? "train"
                : "holdout",
            { "font-size": 10 },
          );
        });
      } else if (!design && scene === "encoding") {
        encodingScene(s,P,st.encoding);
      } else workflowScene(s, P, { scene, st, d, design, missing });
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
