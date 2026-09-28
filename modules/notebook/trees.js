import { boostingStory } from "./boosting-scenes.js";
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
  classificationData,
  regressionData,
  splitRows,
  treeFit,
  treePredict,
  treePath,
  forestFit,
  boostFit,
  mse,
  mean,
  sum,
} from "./science.js";
export function create(host, slug) {
  const forest = slug === "random-forest",
    boost = slug === "gradient-boosting",
    classification = forest || slug === "classification-trees";
  const initial = {
    depth: 3,
    minLeaf: 3,
    trees: 12,
    features: 1,
    rate: 0.2,
    round: 8,
    query: 0,
    second: 0,
    selected: classification ? "C1" : "R1",
    seed: 21,
  };
  const source = () =>
    classification
      ? classificationData(initial.seed)
      : regressionData(initial.seed);
  const controls = [
    {
      key: "depth",
      label: boost ? "Weak learner depth" : "Maximum tree depth",
      min: 1,
      max: 5,
      step: 1,
    },
    { key: "query", label: "Query input x", min: -2.4, max: 2.4, step: 0.1 },
    { key: "second", label: "Query input z", min: -2.4, max: 2.4, step: 0.1 },
    {
      key: "selected",
      label: "Inspect training row",
      options: splitRows(source()).train.map((r) => [r.id, r.id]),
    },
    ...(forest
      ? [
          { key: "trees", label: "Tree count", min: 3, max: 30, step: 1 },
          {
            key: "features",
            label: "Candidate features per split",
            min: 1,
            max: 2,
            step: 1,
          },
        ]
      : boost
        ? [
            {
              key: "rate",
              label: "Learning rate",
              min: 0.02,
              max: 0.5,
              step: 0.02,
            },
            {
              key: "round",
              label: "Selected boosting round",
              min: 0,
              max: 30,
              step: 1,
            },
          ]
        : [
            {
              key: "minLeaf",
              label: "Minimum training rows per leaf",
              min: 1,
              max: 10,
              step: 1,
            },
          ]),
  ];
  const L = makeLab(host, slug, initial, controls);
  let key = "",
    data;
  const loss = (rows, predict) =>
    classification
      ? mean(rows.map((r) => +(r.y !== +(predict(r) >= 0.5))))
      : mse(rows, predict);
  function compute() {
    const st = L.state,
      k = JSON.stringify([
        st.depth,
        st.minLeaf,
        st.trees,
        st.features,
        st.rate,
        st.seed,
      ]);
    if (key === k) return data;
    key = k;
    const split = splitRows(
        classification ? classificationData(st.seed) : regressionData(st.seed),
      ),
      tree = treeFit(split.train, {
        depth: st.depth,
        minLeaf: st.minLeaf,
        classification,
      }),
      ensemble = forest
        ? forestFit(split.train, st.trees, st.depth, st.features, st.seed)
        : boost
          ? boostFit(split.train, split.validation, 30, st.rate, st.depth)
          : null;
    const predict = forest ? ensemble.predict : (r) => treePredict(tree, r),
      curve = Array.from({ length: 5 }, (_, i) => {
        const t = treeFit(split.train, {
          depth: i + 1,
          minLeaf: st.minLeaf,
          classification,
        });
        return {
          x: i + 1,
          train: loss(split.train, (r) => treePredict(t, r)),
          validation: loss(split.validation, (r) => treePredict(t, r)),
        };
      });
    return (data = { split, tree, ensemble, predict, curve });
  }
  L.action("new-sample", "Draw a new dataset", () =>
    L.update({ seed: L.state.seed + 1 }),
  );
  if (boost) {
    L.action("round-back", "Previous round", () =>
      L.update({ round: Math.max(0, L.state.round - 1) }),
    );
    L.action("round-next", "Add next learner", () =>
      L.update({ round: Math.min(30, L.state.round + 1) }),
    );
  }
  L.surface.onAction = (id) => L.update({ selected: id });
  return L.init((animate = false) => {
    const st = L.state,
      d = compute(),
      scene = L.scene,
      row = d.split.train.find((r) => r.id === st.selected),
      q = { x: st.query, z: st.second },
      predict = boost ? (r) => d.ensemble.predict(r, st.round) : d.predict,
      path = treePath(d.tree, q),
      leaf = path.at(-1),
      oob = forest ? d.ensemble.oob.find((r) => r.id === st.selected) : null;
    const validation = loss(d.split.validation, predict),
      train = loss(d.split.train, predict),
      counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
    if (classification)
      d.split.validation.forEach(
        (r) =>
          counts[
            r.y
              ? predict(r) >= 0.5
                ? "tp"
                : "fn"
              : predict(r) >= 0.5
                ? "fp"
                : "tn"
          ]++,
      );
    L.data = { ...d, path, oob, validation, train };
    L.metrics([
      [classification ? "Train error rate" : "Training MSE", fmt(train, 3)],
      [
        classification ? "Validation error" : "Validation MSE",
        fmt(validation, 3),
      ],
      ["Query prediction", fmt(predict(q), 3)],
    ]);
    L.legend([
      ["Training", palette[0]],
      ["Validation", palette[1]],
      ["Prediction / selected path", palette[2]],
    ]);
    let receipt = path.map((n, i) => [
      i === 0 ? "Root" : "Step " + i,
      n.left
        ? n.key + " ≤ " + fmt(n.threshold, 3) + " · n " + n.n
        : "Leaf prediction " + fmt(n.value, 3) + " · n " + n.n,
    ]);
    let notice =
      "Computed CART with training-only split search. Validation selects complexity; final-test rows remain sealed. The path shows a single query through the actual fitted tree.";
    if (scene === "gain") {
      const t = d.tree;
      receipt = t.left
        ? [
            ["Parent impurity", fmt(t.impurity, 4)],
            ["Left: n × impurity", t.left.n + " × " + fmt(t.left.impurity, 4)],
            [
              "Right: n × impurity",
              t.right.n + " × " + fmt(t.right.impurity, 4),
            ],
            [
              "Weighted children",
              fmt(
                (t.left.n * t.left.impurity + t.right.n * t.right.impurity) /
                  t.n,
                4,
              ),
            ],
            ["Gain", fmt(t.gain, 4)],
          ]
        : [["No split", "No allowed candidate improves impurity."]];
      notice +=
        " Impurity is " +
        (classification
          ? "Gini."
          : "mean squared deviation; multiplying by node n gives SSE.");
    }
    if (scene === "pruning") {
      receipt.push(
        [
          "Displayed control",
          "Maximum depth and minimum leaf size are pre-pruning controls.",
        ],
        [
          "Post-pruning distinction",
          "Cost-complexity pruning removes branches after growth; the live control does not claim to run that algorithm.",
        ],
      );
    }
    if (forest) {
      const eligible = d.ensemble.trees.map((t, i) => ({
        ...t,
        index: i + 1,
        eligible: !t.inBag.has(row.id),
      }));
      receipt =
        scene === "oob" || scene === "bootstrap"
          ? [
              ["Selected row", row.id + " · actual " + row.y],
              ...eligible
                .slice(0, 8)
                .map((t) => [
                  "Tree " + t.index,
                  t.eligible
                    ? "OOB: eligible, fraction " +
                      fmt(treePredict(t.tree, row), 3)
                    : "In bag: excluded from this OOB vote",
                ]),
              ["All eligible voters", oob.voters + " of " + st.trees],
              [
                "OOB fraction",
                oob.score == null
                  ? "Unavailable: no eligible trees"
                  : fmt(oob.score, 4),
              ],
            ]
          : [
              ...d.ensemble.trees
                .slice(0, 6)
                .map((t, i) => [
                  "Tree " + (i + 1) + " query fraction",
                  fmt(treePredict(t.tree, q), 3),
                ]),
              ["Mean across all " + st.trees, fmt(predict(q), 4)],
            ];
      notice =
        "Actual bootstrap trees with random candidate features. The forest averages leaf class fractions. OOB includes only trees that omitted the inspected training row; no-voter cases stay unavailable.";
    }
    if (boost) {
      const before = d.ensemble.predict(row, Math.max(0, st.round - 1)),
        correction = st.round
          ? treePredict(d.ensemble.trees[st.round - 1], row)
          : 0,
        best = d.ensemble.trace.reduce((a, b) =>
          b.validation < a.validation ? b : a,
        );
      receipt = [
        ["Inspected row", row.id + " · y " + fmt(row.y, 3)],
        ["Initial mean", fmt(d.ensemble.initial, 3)],
        ["Before selected round", fmt(before, 3)],
        ["Current learner output", fmt(correction, 3)],
        ["Scaled addition", fmt(st.rate * correction, 3)],
        ["After selected round", fmt(d.ensemble.predict(row, st.round), 3)],
        ["Best validation round in this run", best.round],
      ];
      notice =
        "Actual squared-loss boosting: each tree fits training residuals. Curves use the same 30 fitted rounds; selecting a checkpoint does not expose or use final-test rows.";
    }
    if (scene === "confusion")
      receipt = Object.entries(counts).map(([k, v]) => [k.toUpperCase(), v]);
    if (scene === "split")
      receipt = [
        ["Training rows", d.split.train.length],
        ["Validation rows", d.split.validation.length],
        ["Sealed final-test rows", d.split.test.length],
        ["Fitted values", "Every threshold and leaf value uses training only."],
      ];
    L.receipt(L.table(["Inspect", "Value"], receipt));
    L.note(notice);
    L.draw((s, P) => {
      const { w } = s.begin(310);
      if (boost && ["additive", "residuals"].includes(scene)) {
        boostingStory(s, P, d, st, row);
      } else if (scene === "split") {
        flow(
          s,
          P,
          [
            "Split independent units",
            "Train: search thresholds and fit leaves",
            "Validate: choose complexity",
            "Final test remains sealed",
          ],
          1,
        );
      } else if (scene === "curve") {
        const trace = boost
            ? d.ensemble.trace.map((r) => ({ ...r, x: r.round }))
            : d.curve,
          max = Math.max(
            ...trace.flatMap((r) => [r.train, r.validation]),
            0.05,
          ),
          a = s.axes(
            [boost ? 0 : 1, boost ? 30 : 5],
            [0, max * 1.1],
            boost ? "Boosting round" : "Maximum depth",
            classification ? "Error rate" : "MSE",
          );
        ["train", "validation"].forEach((k, i) =>
          plotLine(
            s,
            P,
            k,
            trace.map((r) => [a.x(r.x), a.y(r[k])]),
            palette[i],
            2.4,
          ),
        );
        s.line(
          "checkpoint",
          a.x(boost ? st.round : st.depth),
          a.t,
          a.x(boost ? st.round : st.depth),
          a.b,
          palette[2],
          1.5,
          "4 4",
        );
      } else if (scene === "tree" || scene === "pruning") {
        flow(
          s,
          P,
          path.map((n, i) =>
            n.left
              ? (i === 0 ? "Root: " : "") +
                n.key +
                " ≤ " +
                fmt(n.threshold, 2) +
                "? " +
                (q[n.key] <= n.threshold ? "Yes → left" : "No → right")
              : "Leaf: " + fmt(n.value, 3) + " (" + n.n + " train rows)",
          ),
          path.length - 1,
        );
      } else if (scene === "gain") {
        bars(s, P, [
          { label: "Parent", value: d.tree.impurity },
          { label: "Left", value: d.tree.left?.impurity || 0 },
          { label: "Right", value: d.tree.right?.impurity || 0 },
          { label: "Gain", value: d.tree.gain || 0 },
        ]);
      } else if (scene === "confusion") {
        bars(
          s,
          P,
          Object.entries(counts).map(([k, value], i) => ({
            label: k.toUpperCase(),
            value,
            color: palette[i],
          })),
        );
      } else if (forest) {
        const ts = d.ensemble.trees.slice(0, 6);
        bars(
          s,
          P,
          ts.map((t, i) => ({
            label:
              "Tree " +
              (i + 1) +
              (scene === "oob" && !t.inBag.has(row.id) ? " ✓" : ""),
            value: treePredict(t.tree, scene === "oob" ? row : q),
            color:
              scene === "oob" && t.inBag.has(row.id)
                ? "#b7b9ac"
                : palette[i % 6],
          })),
          { domain: 1 },
        );
        s.text(
          "votes-note",
          14,
          20,
          scene === "oob"
            ? "✓ omitted this row · gray votes excluded"
            : "First six tree fractions · all trees in receipt",
          { "font-size": 13 },
        );
      } else if (boost && scene === "additive") {
        bars(s, P, [
          { label: "Initial", value: d.ensemble.initial },
          ...d.ensemble.trees.slice(0, Math.min(4, st.round)).map((t, i) => ({
            label: "η × tree " + (i + 1),
            value: st.rate * treePredict(t, row),
          })),
        ]);
      } else if (classification) {
        const a = s.axes([-3, 3], [-3, 3], "Input x", "Input z");
        for (let i = 0; i < 24; i++)
          for (let j = 0; j < 20; j++) {
            const x = -3 + (6 * i) / 24,
              z = -3 + (6 * j) / 20;
            s.rect(
              "cell" + i + "-" + j,
              a.x(x),
              a.y(z + 0.3),
              (a.r - a.l) / 24 + 1,
              (a.b - a.t) / 20 + 1,
              predict({ x, z }) >= 0.5 ? palette[1] + "18" : palette[0] + "18",
            );
          }
        d.split.train.forEach((r) => {
          const p = P(r.id, a.x(r.x), a.y(r.z));
          s.mark(
            r.id,
            ...p,
            palette[r.y],
            r.id + " class " + r.y,
            r.id === row.id,
            r.id,
          );
        });
        const p = P("query", a.x(q.x), a.y(q.z));
        s.circle("query", ...p, 8, palette[3]);
      } else {
        const xs = linspace(-2.4, 2.4, 101),
          ys = xs.map((x) => predict({ x, z: st.second })),
          res = scene === "residuals",
          vals = d.split.train.map((r) =>
            res ? r.y - d.ensemble.predict(r, Math.max(0, st.round - 1)) : r.y,
          ),
          a = s.axes(
            [-2.4, 2.4],
            extent([...vals, ...(res ? [0] : ys)]),
            "Input x",
            res ? "Residual target" : "Outcome",
          );
        d.split.train.forEach((r, i) => {
          const p = P(r.id, a.x(r.x), a.y(vals[i]));
          s.mark(
            r.id,
            ...p,
            palette[0],
            r.id + " value " + fmt(vals[i], 3),
            r.id === row.id,
            r.id,
          );
        });
        if (!res)
          plotLine(
            s,
            P,
            "fit",
            xs.map((x, i) => [a.x(x), a.y(ys[i])]),
            palette[2],
            2.5,
          );
        else s.line("zero", a.l, a.y(0), a.r, a.y(0), "#aaa", 1, "4 4");
      }
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
