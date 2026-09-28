import { makeLab, fmt, palette, extent, linspace } from "./lab.js";
import {
  classificationData,
  regressionData,
  splitRows,
  treeFit,
  treePredict,
  treePath,
  forestFit,
  mse,
  mean,
  linearFit,
  variance,
} from "./science.js";
import { partitions, splitCandidates, pruneTree } from "./spatial-science.js";
import {
  caption,
  frame,
  line,
  arrow,
  dot,
  confusionDots,
  paper,
  grid,
  heat,
} from "./spatial.js";
const trim = (n, depth) =>
  depth === 0
    ? { ...n, left: null, right: null }
    : n.left
      ? { ...n, left: trim(n.left, depth - 1), right: trim(n.right, depth - 1) }
      : n;
const color = (v) => (v >= 0.5 ? palette[1] : palette[0]);
function map(
  s,
  P,
  key,
  tree,
  rows,
  box,
  classification,
  q,
  selected,
  { cuts = true, points = true, labels = box.h > 140 } = {},
) {
  const a = frame(
      s,
      key,
      box,
      [-3, 3],
      [-3, 3],
      labels ? ["Input x₁", "Input x₂"] : [],
      box.h > 140,
    ),
    space = partitions(tree),
    path = treePath(tree, q),
    leaf = path.at(-1);
  space.leaves.forEach(({ node: n, bounds: b }) => {
    const x = a.x(b[0]),
      y = a.y(b[3]),
      w = a.x(b[1]) - x,
      h = a.y(b[2]) - y,
      sel = n.id === leaf.id;
    s.rect(
      key + "region" + n.id,
      x,
      y,
      w,
      h,
      classification ? color(n.value) : palette[2],
      {
        opacity: classification
          ? 0.12 + 0.2 * Math.abs(n.value - 0.5) * 2
          : 0.1 + (0.3 * (n.value + 2)) / 8,
        rx: 0,
      },
    );
    if (sel)
      s.rect(key + "selected-region", x, y, w, h, "none", {
        stroke: palette[3],
        "stroke-width": 2,
        rx: 0,
      });
  });
  if (cuts)
    space.cuts.forEach(({ node: n, bounds: b, depth }) => {
      const v =
        n.key === "x"
          ? [
              [a.x(n.threshold), a.y(b[2])],
              [a.x(n.threshold), a.y(b[3])],
            ]
          : [
              [a.x(b[0]), a.y(n.threshold)],
              [a.x(b[1]), a.y(n.threshold)],
            ];
      line(
        s,
        P,
        key + "cut" + n.id,
        v,
        path.includes(n) ? palette[3] : "#829381",
        path.includes(n) ? 2.4 : 1.2,
      );
    });
  if (points)
    rows.forEach((r) => {
      const p = P(key + "point" + r.id, a.x(r.x), a.y(r.z));
      if (box.w > 200) {
        s.mark(
          key + "point" + r.id,
          ...p,
          classification ? color(r.y) : palette[0],
          `${r.id}: x₁ ${fmt(r.x)}, x₂ ${fmt(r.z)}, target ${fmt(r.y)}`,
          r.id === selected,
          r.id,
        );
        if (classification && r.y)
          s.path(
            key + "cross" + r.id,
            `M${p[0] - 2},${p[1] - 2}l4,4m-4,0l4,-4`,
            paper,
            1.3,
          );
      } else
        s.circle(
          key + "point" + r.id,
          ...p,
          2,
          classification ? color(r.y) : palette[0],
          { opacity: 0.75 },
        );
    });
  const qp = P(key + "query", a.x(q.x), a.y(q.z));
  s.circle(key + "query", ...qp, 6, palette[3], {
    stroke: paper,
    "stroke-width": 2,
  });
  return { a, space, leaf };
}
function branching(s, P, tree, q, top, height, key = "branch") {
  const leaves = partitions(tree).leaves,
    positions = new Map(),
    path = new Set(treePath(tree, q).map((n) => n.id)),
    leafGap = (s.w - 54) / leaves.length;
  let serial = 0,
    maxDepth = 0;
  function place(n, depth) {
    maxDepth = Math.max(maxDepth, depth);
    let x;
    if (n.left) {
      const l = place(n.left, depth + 1),
        r = place(n.right, depth + 1);
      x = (l + r) / 2;
    } else x = 27 + (serial++ + 0.5) * leafGap;
    positions.set(n.id, { x, depth, node: n });
    return x;
  }
  place(tree, 0);
  for (const { x, depth, node: n } of positions.values()) {
    const y = top + (depth / Math.max(1, maxDepth)) * height;
    if (n.left)
      for (const child of [n.left, n.right]) {
        const p = positions.get(child.id),
          cy = top + (p.depth / Math.max(1, maxDepth)) * height;
        line(
          s,
          P,
          key + "edge" + child.id,
          [
            [x, y],
            [p.x, cy],
          ],
          path.has(child.id) ? palette[3] : grid,
          path.has(child.id) ? 2.7 : 1.4,
        );
      }
    const p = P(key + "node" + n.id, x, y);
    s.circle(
      key + "node" + n.id,
      ...p,
      n.left ? 5 : Math.max(3, Math.min(10, leafGap * 0.22)),
      path.has(n.id) ? palette[3] : n.left ? palette[2] : palette[0],
      { stroke: paper, "stroke-width": 1.2 },
    );
  }
  s.text(
    key + "root",
    s.w / 2,
    top - 13,
    tree.left
      ? `${tree.key === "x" ? "x₁" : "x₂"} ≤ ${fmt(tree.threshold, 2)}?`
      : "One leaf: no split",
    { "text-anchor": "middle", "font-size": 15 },
  );
  const leaf = treePath(tree, q).at(-1),
    p = positions.get(leaf.id);
  s.text(
    key + "query-leaf",
    Math.max(70, Math.min(s.w - 70, p.x)),
    top + height + 24,
    `Leaf: ${fmt(leaf.value, 2)} · n=${leaf.n}`,
    { "text-anchor": "middle", "font-size": 14, fill: palette[3] },
  );
}
function distribution(s, P, key, rows, box, classification) {
  s.rect(key + "area", box.x, box.y, box.w, box.h, paper, { stroke: grid });
  if (classification) {
    const cols = Math.max(3, Math.floor((box.w - 14) / 12));
    rows.forEach((r, i) =>
      dot(
        s,
        P,
        key + r.id + "-" + i,
        box.x + 10 + (i % cols) * 12,
        box.y + 12 + Math.floor(i / cols) * 12,
        r.y,
      ),
    );
  } else {
    const yd = extent(
        rows.map((r) => r.y),
        0.08,
      ),
      mu = mean(rows.map((r) => r.y)),
      x = (v) => box.x + 12 + ((v - yd[0]) / (yd[1] - yd[0])) * (box.w - 24);
    rows.forEach((r, i) => {
      const y = box.y + 14 + (i % 5) * 15;
      line(
        s,
        P,
        key + "res" + i,
        [
          [x(r.y), y],
          [x(mu), y],
        ],
        palette[1] + "55",
        1,
      );
      s.circle(
        key + "dot" + i,
        ...P(key + "dot" + i, x(r.y), y),
        2.7,
        palette[0],
      );
    });
    s.line(
      key + "mean",
      x(mu),
      box.y + 5,
      x(mu),
      box.y + box.h - 5,
      palette[2],
      2,
    );
  }
}
export function create(host, slug) {
  const forest = slug === "random-forest",
    classification = forest || slug === "classification-trees";
  const initial = {
    depth: 3,
    minLeaf: 3,
    query: 0,
    second: 0,
    selected: classification ? "C1" : "R1",
    seed: 21,
    trees: 12,
    features: 1,
    inspectTree: 1,
    splitFeature: "x",
    candidate: 50,
    alpha: 0,
    reveal: 2,
    proportion: 0.5,
    guess: 1,
    perturb: 0,
  };
  const controls = [
    { key: "depth", label: "Maximum depth", min: 1, max: 5, step: 1 },
    {
      key: "minLeaf",
      label: "Minimum rows in a leaf",
      min: 1,
      max: 10,
      step: 1,
    },
    { key: "query", label: "Query x₁", min: -2.4, max: 2.4, step: 0.1 },
    { key: "second", label: "Query x₂", min: -2.4, max: 2.4, step: 0.1 },
    {
      key: "selected",
      label: "Inspect a training row",
      options: splitRows(
        classification ? classificationData(21) : regressionData(21),
      ).train.map((r) => [r.id, r.id]),
    },
    {
      key: "splitFeature",
      label: "Feature to cut",
      options: [
        ["x", "Input x₁"],
        ["z", "Input x₂"],
      ],
    },
    {
      key: "candidate",
      label: "Candidate midpoint (ordered %)",
      min: 0,
      max: 100,
      step: 1,
    },
    {
      key: "alpha",
      label: "Post-pruning penalty α",
      min: 0,
      max: classification ? 0.3 : 2,
      step: classification ? 0.005 : 0.025,
    },
    { key: "reveal", label: "Reveal split levels", min: 0, max: 5, step: 1 },
    {
      key: "proportion",
      label: "Toy node: fraction in class 1",
      min: 0,
      max: 1,
      step: 0.05,
    },
    { key: "guess", label: "Constant prediction", min: -1, max: 6, step: 0.05 },
    {
      key: "perturb",
      label: classification ? "Move one input x₁" : "Change one outcome",
      min: -2,
      max: 2,
      step: 0.1,
    },
    ...(forest
      ? [
          { key: "trees", label: "Number of trees", min: 3, max: 30, step: 1 },
          {
            key: "features",
            label: "Candidate features per split",
            min: 1,
            max: 2,
            step: 1,
          },
          {
            key: "inspectTree",
            label: "Inspect tree number",
            min: 1,
            max: 30,
            step: 1,
          },
        ]
      : []),
  ];
  const L = makeLab(host, slug, initial, controls);
  let signature = "",
    data;
  L.action("new-sample", "Draw a new dataset", () =>
    L.update({ seed: L.state.seed + 1 }),
  );
  L.surface.onAction = (id) => {
    const row = data.split.train.find((r) => r.id === id);
    if (row) L.update({ selected: id, query: row.x, second: row.z });
  };
  return L.init((animate = false) => {
    const st = L.state,
      index = L.index,
      scenes = forest
        ? [
            "diversity",
            "bootstrap",
            "average",
            "correlation",
            "oob",
            "failure",
            "tuning",
            "report",
            "oob",
          ]
        : classification
          ? [
              "raw",
              "split",
              "root",
              "gini",
              "search",
              "gain",
              "recursive",
              "boundary",
              "pruning",
              "curve",
              "path",
              "confusion",
              "output",
              "boundary",
              "instability",
            ]
          : [
              "raw",
              "split",
              "mean",
              "threshold",
              "gain",
              "search",
              "recursive",
              "path",
              "curve",
              "stopping",
              "pruning",
              "compare",
              "boundary",
              "errors",
              "instability",
              "output",
            ],
      scene = scenes[index];
    const key = JSON.stringify([
      st.seed,
      st.depth,
      st.minLeaf,
      st.trees,
      st.features,
      st.perturb,
    ]);
    if (signature !== key) {
      signature = key;
      const split = splitRows(
          classification
            ? classificationData(st.seed)
            : regressionData(st.seed),
        ),
        opts = { depth: st.depth, minLeaf: st.minLeaf, classification },
        tree = treeFit(split.train, opts),
        full = treeFit(split.train, { ...opts, depth: 5, minLeaf: 2 }),
        ensemble = forest
          ? forestFit(split.train, st.trees, st.depth, st.features, st.seed)
          : null;
      const perturbed = split.train.map((r, i) =>
          i === 0
            ? {
                ...r,
                [classification ? "x" : "y"]:
                  r[classification ? "x" : "y"] + st.perturb,
              }
            : r,
        ),
        changed = treeFit(perturbed, opts),
        changedForest = forest
          ? forestFit(perturbed, st.trees, st.depth, st.features, st.seed)
          : null;
      const loss = (rows, predict) =>
        classification
          ? mean(rows.map((r) => +(r.y !== +(predict(r) >= 0.5))))
          : mse(rows, predict);
      const curve = Array.from({ length: 5 }, (_, i) => {
        const t = treeFit(split.train, { ...opts, depth: i + 1 });
        return {
          x: i + 1,
          train: loss(split.train, (r) => treePredict(t, r)),
          validation: loss(split.validation, (r) => treePredict(t, r)),
        };
      });
      const forestCurve = forest
        ? Array.from({ length: st.trees }, (_, i) => ({
            x: i + 1,
            validation: loss(split.validation, (r) =>
              mean(
                ensemble.trees
                  .slice(0, i + 1)
                  .map((t) => treePredict(t.tree, r)),
              ),
            ),
          }))
        : [];
      data = {
        split,
        tree,
        full,
        ensemble,
        changed,
        changedForest,
        perturbed,
        curve,
        forestCurve,
        loss,
        line: linearFit(split.train, (r) => [1, r.x, r.z]),
      };
    }
    const d = data,
      q = { x: st.query, z: st.second },
      row = d.split.train.find((r) => r.id === st.selected),
      pruned = pruneTree(d.full, st.alpha),
      active =
        scene === "pruning"
          ? pruned.node
          : scene === "recursive"
            ? trim(d.tree, st.reveal)
            : d.tree,
      predict = forest
        ? scene === "failure"
          ? d.changedForest.predict
          : d.ensemble.predict
        : (r) => treePredict(active, r),
      path = treePath(active, q),
      leaf = path.at(-1),
      space = partitions(active),
      candidates = splitCandidates(
        d.split.train,
        st.splitFeature,
        classification,
        st.minLeaf,
      ),
      candidate =
        candidates[Math.round((st.candidate / 100) * (candidates.length - 1))],
      best = candidates.reduce(
        (a, b) => (b.score < a.score ? b : a),
        candidates[0],
      ),
      which = Math.min(st.inspectTree, st.trees) - 1,
      inspected = forest ? d.ensemble.trees[which] : null,
      oob = forest ? d.ensemble.oob.find((r) => r.id === row.id) : null;
    const counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
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
    const training = d.loss(d.split.train, predict),
      validation = d.loss(d.split.validation, predict);
    L.data = {
      ...d,
      path,
      partitions: space,
      pruned,
      candidate,
      candidates,
      oob,
      train: training,
      validation,
      counts,
    };
    let receipt = [
      ["Query", `x₁ ${fmt(q.x, 2)}, x₂ ${fmt(q.z, 2)}`],
      ...path.map((n, i) => [
        i ? "Branch " + i : "Root",
        n.left
          ? `${n.key === "x" ? "x₁" : "x₂"} ≤ ${fmt(n.threshold, 3)}: ${q[n.key] <= n.threshold ? "yes" : "no"}`
          : `${n.n} rows; prediction ${fmt(n.value, 4)}`,
      ]),
    ];
    if (["threshold", "search", "gain"].includes(scene) && candidate)
      receipt = [
        ["Candidate threshold", fmt(candidate.threshold, 4)],
        [
          "Left / right rows",
          `${candidate.left.length} / ${candidate.right.length}`,
        ],
        ["Parent impurity", fmt(candidate.parent, 5)],
        ["Weighted child impurity", fmt(candidate.score, 5)],
        ["Improvement", fmt(candidate.gain, 5)],
        ["Best midpoint on this feature", fmt(best.threshold, 4)],
      ];
    if (scene === "pruning")
      receipt = [
        ["Grown leaves", partitions(d.full).leaves.length],
        ["Retained leaves", pruned.leaves],
        ["Training risk", fmt(pruned.risk, 5)],
        [
          "Objective R(T) + α|T|",
          fmt(pruned.risk + st.alpha * pruned.leaves, 5),
        ],
        [
          "Rule",
          "Choose the minimum-cost subtree of one fixed depth-5 tree. Risk is sample-weighted Gini or variance. Validation does not select splits.",
        ],
      ];
    if (scene === "mean")
      receipt = [
        ["Your constant", fmt(st.guess, 3)],
        ["Training mean", fmt(mean(d.split.train.map((r) => r.y)), 3)],
        [
          "RSS at your constant",
          fmt(d.split.train.length * mse(d.split.train, () => st.guess), 3),
        ],
        [
          "Minimum RSS at mean",
          fmt(
            d.split.train.length *
              variance(
                d.split.train.map((r) => r.y),
                0,
              ),
            3,
          ),
        ],
      ];
    if (scene === "gini")
      receipt = [
        ["Toy proportion p", st.proportion],
        ["Gini = 2p(1−p)", fmt(2 * st.proportion * (1 - st.proportion), 3)],
        [
          "Meaning",
          "Probability of different class labels in two independent draws with replacement.",
        ],
      ];
    if (forest)
      receipt =
        scene === "oob" || scene === "bootstrap"
          ? [
              ["Selected training row", row.id],
              ["Inspected tree", which + 1],
              [
                "Times sampled",
                inspected.tree.ids.filter((id) => id === row.id).length,
              ],
              ["Eligible OOB trees", oob.voters + " / " + st.trees],
              [
                "OOB fraction",
                oob.score == null
                  ? "Unavailable: no eligible voters"
                  : fmt(oob.score, 4),
              ],
              [
                "Exclusion rule",
                "A tree that sampled this row contributes no OOB vote for it.",
              ],
            ]
          : [
              ["All-tree query mean", fmt(predict(q), 5)],
              [
                "Inspected tree fraction",
                fmt(treePredict(inspected.tree, q), 5),
              ],
              ["Candidate features per split", st.features],
              ["Trees", st.trees],
              [
                "Aggregation",
                "Average leaf class fractions from all trees, then apply 0.5.",
              ],
            ];
    if (scene === "split")
      receipt = [
        ["Training rows", d.split.train.length],
        ["Validation rows", d.split.validation.length],
        ["Sealed test rows", d.split.test.length],
        ["Data flow", "Thresholds and leaf values use only training rows."],
      ];
    L.metrics([
      ["Training " + (classification ? "error" : "MSE"), fmt(training, 3)],
      ["Validation " + (classification ? "error" : "MSE"), fmt(validation, 3)],
      [
        forest
          ? "Forest fraction"
          : classification
            ? "Query class-1 fraction"
            : "Query prediction",
        fmt(predict(q), 3),
      ],
    ]);
    if (scene === "mean")
      L.metrics([
        [
          "Your constant MSE",
          fmt(
            mse(d.split.train, () => st.guess),
            3,
          ),
        ],
        [
          "Best constant MSE",
          fmt(
            variance(
              d.split.train.map((r) => r.y),
              0,
            ),
            3,
          ),
        ],
        ["Training mean", fmt(mean(d.split.train.map((r) => r.y)), 3)],
      ]);
    if (["threshold", "gain", "search"].includes(scene) && candidate)
      L.metrics([
        ["Parent impurity", fmt(candidate.parent, 3)],
        ["Weighted child impurity", fmt(candidate.score, 3)],
        ["Split gain", fmt(candidate.gain, 3)],
      ]);
    if (scene === "gini")
      L.metrics([
        ["Toy fraction p", fmt(st.proportion, 2)],
        ["Gini", fmt(2 * st.proportion * (1 - st.proportion), 3)],
        ["Maximum Gini", "0.5"],
      ]);
    if (scene === "root")
      L.metrics([
        ["Root training rows", d.tree.n],
        ["Class-1 fraction", fmt(d.tree.value, 3)],
        ["Root Gini", fmt(d.tree.impurity, 3)],
      ]);
    if (scene === "pruning")
      L.metrics([
        ["Grown leaves", partitions(d.full).leaves.length],
        ["Retained leaves", pruned.leaves],
        ["Validation error", fmt(validation, 3)],
      ]);
    if (forest && ["bootstrap", "oob"].includes(scene))
      L.metrics([
        ["Selected row", row.id],
        ["Eligible voters", oob.voters],
        ["OOB fraction", oob.score == null ? "No voters" : fmt(oob.score, 3)],
      ]);
    L.receipt(L.table(["Inspect the actual model", "Value"], receipt));
    L.legend(
      classification
        ? [
            ["Class 0 · dots", palette[0]],
            ["Class 1 · crossed dots", palette[1]],
            ["Query and route", palette[3]],
          ]
        : [
            ["Observed outcomes", palette[0]],
            ["Leaf prediction", palette[2]],
            ["Query and route", palette[3]],
          ],
    );
    if (scene === "curve")
      L.legend([
        ["Training error", palette[0]],
        ["Validation error", palette[1]],
        ["Selected depth", palette[3]],
      ]);
    if (scene === "mean")
      L.legend([
        ["Observed outcomes", palette[0]],
        ["Your constant", palette[1]],
        ["Training mean", palette[2]],
      ]);
    if (forest && ["bootstrap", "oob"].includes(scene))
      L.legend([
        ["Sampled in this tree", palette[0]],
        ["Eligible OOB voter", palette[2]],
        ["Excluded voter", palette[1]],
      ]);
    if (forest && scene === "average")
      L.legend([
        ["Individual tree", palette[0]],
        ["Running mean", palette[2]],
        ["Decision threshold", palette[3]],
      ]);
    if (forest && scene === "tuning")
      L.legend([["Measured validation error", palette[1]]]);
    if (forest && ["failure", "report", "correlation"].includes(scene))
      L.legend([
        ["Class 0", palette[0]],
        ["Class 1", palette[1]],
        [
          scene === "correlation"
            ? "Shared mistakes"
            : "Query / validation mistakes",
          palette[3],
        ],
      ]);
    L.note(
      forest
        ? "Computed bootstrap forest. Small maps show individual fitted partitions; the aggregate uses every tree. OOB omits any tree that sampled the selected row. Repeatedly tuning on OOB or validation can overfit those estimates. Final-test rows are sealed."
        : "Every split, leaf and prediction is calculated on the displayed synthetic training sample. Equality goes left (≤); missing inputs are unsupported. Data-space plots use both inputs. A drawn line through predictions holds x₂ fixed. Final-test outcomes stay sealed.",
    );
    const visible = new Set(
      forest
        ? [
            "trees",
            "features",
            "depth",
            "query",
            "second",
            ...(["bootstrap", "oob"].includes(scene)
              ? ["selected", "inspectTree"]
              : []),
            ...(["diversity", "failure"].includes(scene) ? ["perturb"] : []),
          ]
        : ["raw"].includes(scene)
          ? ["selected"]
          : scene === "split"
            ? []
            : scene === "mean"
              ? ["guess"]
              : scene === "root"
                ? ["selected"]
                : scene === "gini"
                  ? ["proportion"]
                  : ["threshold", "gain", "search"].includes(scene)
                    ? ["splitFeature", "candidate", "minLeaf"]
                    : scene === "pruning"
                      ? ["alpha", "query", "second"]
                      : scene === "recursive"
                        ? ["reveal", "query", "second"]
                        : scene === "instability"
                          ? ["perturb", "depth"]
                          : ["depth", "minLeaf", "query", "second", "selected"],
    );
    controls.forEach(
      (c) =>
        (host.querySelector("#" + c.key).closest("label").hidden = !visible.has(
          c.key,
        )),
    );
    L.draw((s, P) => {
      s.begin(450);
      s.svg.dataset.visual = (forest ? "forest-" : "tree-") + scene;
      if (forest) {
        if (scene === "tuning") {
          caption(
            s,
            "title",
            "Add trees. Measure validation error on the same rows.",
          );
          const a = frame(
            s,
            "forest-curve",
            { x: 48, y: 90, w: s.w - 76, h: 270 },
            [1, st.trees],
            [0, Math.max(0.1, ...d.forestCurve.map((r) => r.validation)) * 1.2],
            ["Number of trees", "Validation error"],
          );
          line(
            s,
            P,
            "forest-validation",
            d.forestCurve.map((r) => [a.x(r.x), a.y(r.validation)]),
            palette[1],
            2.5,
          );
          caption(
            s,
            "foot",
            "This is a measured curve; it need not fall at every step.",
            420,
          );
        } else if (scene === "bootstrap" || scene === "oob") {
          caption(
            s,
            "title",
            scene === "bootstrap"
              ? "A bootstrap sample repeats some rows and omits others."
              : "Only trees that never saw this row may vote for it.",
          );
          const cols = Math.max(8, Math.floor((s.w - 36) / 29)),
            cell = Math.min(29, (s.w - 36) / cols);
          d.split.train.forEach((r, i) => {
            const count = inspected.tree.ids.filter((id) => id === r.id).length,
              x = 18 + (i % cols) * cell,
              y = 83 + Math.floor(i / cols) * 26;
            s.rect(
              "bag" + r.id,
              x,
              y,
              cell - 3,
              22,
              count ? palette[0] + "35" : "#f5f0e1",
              {
                stroke: r.id === row.id ? palette[3] : grid,
                "stroke-width": r.id === row.id ? 2.5 : 1,
              },
            );
            s.text(
              "bag-count" + r.id,
              x + (cell - 3) / 2,
              y + 16,
              count + "×",
              { "text-anchor": "middle", "font-size": 13 },
            );
          });
          caption(
            s,
            "bag-key",
            `Tree ${which + 1}: each square is one original row. 0× = omitted.`,
            262,
          );
          const ts = d.ensemble.trees,
            cols2 = Math.min(10, ts.length),
            sz = (s.w - 38) / cols2;
          ts.forEach((t, i) => {
            const eligible = !t.inBag.has(row.id),
              x = 20 + (i % cols2) * sz,
              y = 302 + Math.floor(i / cols2) * 32;
            s.circle(
              "voter" + i,
              x + sz / 2,
              y,
              10,
              eligible ? palette[2] + "80" : "#dbded3",
            );
            if (!eligible)
              s.line(
                "excluded" + i,
                x + sz / 2 - 7,
                y + 7,
                x + sz / 2 + 7,
                y - 7,
                palette[1],
                1.5,
              );
            s.text("voter-label" + i, x + sz / 2, y + 4, String(i + 1), {
              "text-anchor": "middle",
              "font-size": 11,
            });
          });
          caption(
            s,
            "foot",
            `${row.id}: ${oob.voters} eligible votes → ${oob.score == null ? "unavailable" : fmt(oob.score, 3)}`,
            427,
          );
        } else if (scene === "average") {
          caption(
            s,
            "title",
            "Watch the average settle as each tree contributes.",
          );
          const values = d.ensemble.trees.map((t) => treePredict(t.tree, q)),
            running = values.map((_, i) => mean(values.slice(0, i + 1)));
          const a = frame(
            s,
            "forest-averaging",
            { x: 45, y: 92, w: s.w - 76, h: 266 },
            [1, st.trees],
            [0, 1],
            ["Trees included", "Class-1 fraction"],
          );
          values.forEach((v, i) =>
            s.circle(
              "individual-vote" + i,
              ...P("individual-vote" + i, a.x(i + 1), a.y(v)),
              4,
              palette[0],
              { opacity: 0.65 },
            ),
          );
          line(
            s,
            P,
            "running-mean",
            running.map((v, i) => [a.x(i + 1), a.y(v)]),
            palette[2],
            3,
          );
          s.line(
            "decision-threshold",
            a.l,
            a.y(0.5),
            a.r,
            a.y(0.5),
            palette[3],
            1.3,
            "4 4",
          );
          caption(
            s,
            "foot",
            "Blue dots: individual trees · green: running mean",
            423,
          );
        } else if (scene === "correlation") {
          caption(
            s,
            "title",
            "If two trees make similar predictions, averaging helps less.",
          );
          const a = frame(
            s,
            "tree-agreement",
            { x: 47, y: 93, w: s.w - 80, h: 265 },
            [0, 1],
            [0, 1],
            ["Tree 1: fraction for class 1", "Tree 2: fraction for class 1"],
          );
          s.line("agreement-diagonal", a.l, a.b, a.r, a.t, grid, 1.5, "4 4");
          d.split.validation.forEach((r) => {
            const p1 = treePredict(d.ensemble.trees[0].tree, r),
              p2 = treePredict(d.ensemble.trees[1].tree, r),
              p = P("agreement" + r.id, a.x(p1), a.y(p2));
            dot(s, P, "agreement" + r.id, ...p, r.y);
            if (+(p1 >= 0.5) !== r.y && +(p2 >= 0.5) !== r.y)
              s.circle("shared-error" + r.id, ...p, 9, "none", {
                stroke: palette[3],
                "stroke-width": 2,
              });
          });
          caption(
            s,
            "foot",
            "Diagonal: agreement · gold rings: shared mistakes",
            424,
          );
        } else if (scene === "failure" || scene === "report") {
          caption(
            s,
            "title",
            scene === "failure"
              ? "An ensemble can still make systematic mistakes."
              : "Inspect the ensemble prediction in the original data space.",
          );
          const predictHere =
              scene === "failure"
                ? d.changedForest.predict
                : d.ensemble.predict,
            box = { x: 43, y: 91, w: s.w - 72, h: 258 };
          heat(s, "ensemble-heat", box, (x, z) => predictHere({ x, z }), 22);
          const a = frame(
            s,
            "ensemble-space",
            box,
            [-2.5, 2.5],
            [-2.5, 2.5],
            ["Input x₁", "Input x₂"],
          );
          d.split.validation.forEach((r) => {
            dot(s, P, "ensemble-row" + r.id, a.x(r.x), a.y(r.z), r.y);
            if (+(predictHere(r) >= 0.5) !== r.y)
              s.circle("ensemble-error" + r.id, a.x(r.x), a.y(r.z), 8, "none", {
                stroke: palette[3],
                "stroke-width": 2,
              });
          });
          s.circle(
            "ensemble-query",
            ...P("ensemble-query", a.x(q.x), a.y(q.z)),
            7,
            palette[3],
            { stroke: paper, "stroke-width": 2 },
          );
          caption(
            s,
            "foot",
            scene === "failure"
              ? "Gold rings: validation errors after moving one training input."
              : "Each dot is held-out; the field averages every tree.",
            417,
          );
        } else {
          caption(
            s,
            "title",
            scene === "diversity"
              ? "Different partitions. One averaged prediction."
              : scene === "correlation"
                ? "Similar boundaries make similar mistakes. Compare the trees."
                : scene === "failure"
                  ? "Agreement is not proof: compare validation errors."
                  : "Each small map is an actual tree in this forest.",
          );
          const forestTop =
            caption(
              s,
              "forest-experiment",
              st.perturb === 0
                ? "Move-row slider = 0: both samples are identical."
                : `Forest mean: ${fmt(predict(q), 3)} → ${fmt(d.changedForest.predict(q), 3)}`,
              78,
              palette[1],
            ) + 32;
          const tw = (s.w - 50) / 2,
            th = 103,
            trees =
              scene === "diversity"
                ? [
                    ...d.ensemble.trees.slice(0, 2),
                    ...d.changedForest.trees.slice(0, 2),
                  ]
                : d.ensemble.trees.slice(0, 4);
          trees.forEach((t, i) => {
            const x = 20 + (i % 2) * (tw + 12),
              y = forestTop + Math.floor(i / 2) * 145;
            map(
              s,
              P,
              "forest-map" + i,
              t.tree,
              d.split.train,
              { x, y, w: tw, h: th },
              true,
              q,
              st.selected,
              { points: false, labels: false },
            );
            s.text(
              "forest-name" + i,
              x,
              y - 10,
              (scene === "diversity"
                ? (i < 2 ? "Before " : "After ") + ((i % 2) + 1)
                : "Tree " + (i + 1)) +
                " · " +
                fmt(treePredict(t.tree, q), 2),
              { "font-size": 14 },
            );
          });
          const values = d.ensemble.trees.map((t) => treePredict(t.tree, q)),
            a = frame(
              s,
              "votes",
              { x: 42, y: forestTop + 323, w: s.w - 74, h: 29 },
              [0, 1],
              [0, 1],
              [],
              false,
            );
          values.forEach((v, i) =>
            s.circle(
              "vote" + i,
              ...P("vote" + i, a.x(v), forestTop + 330 + (i % 3) * 9),
              3.5,
              palette[i % 6],
              { opacity: 0.7 },
            ),
          );
          const v = predict(q);
          arrow(
            s,
            "average",
            [a.x(v), forestTop + 307],
            [a.x(v), forestTop + 324],
            palette[3],
            2,
          );
          s.text(
            "mean-vote",
            s.w / 2,
            forestTop + 385,
            `All ${st.trees} tree fractions → mean ${fmt(v, 3)}`,
            { "text-anchor": "middle", "font-size": 15 },
          );
          caption(
            s,
            "forest-shared-axes",
            "All maps: x₁ across, x₂ upwards. Gold dot = same query.",
            forestTop + 276,
          );
          caption(
            s,
            "forest-mean-key",
            "Small dots: each tree’s fraction. Arrow: their average.",
            forestTop + 415,
          );
        }
      } else if (scene === "split") {
        caption(s, "title", "Three separate samples. Only one fits the tree.");
        ["train", "validation", "test"].forEach((k, j) => {
          const y = 85 + j * 112,
            rows = d.split[k],
            cols = Math.max(9, Math.floor((s.w - 42) / 17));
          s.text(
            "split-name" + k,
            20,
            y - 11,
            [
              `Training: ${rows.length} outcomes used`,
              `Validation: ${rows.length} outcomes for checking`,
              `Test: ${rows.length} outcomes sealed`,
            ][j],
            { "font-size": 16 },
          );
          rows.forEach((r, i) => {
            const x = 25 + (i % cols) * 17,
              cy = y + 12 + Math.floor(i / cols) * 18;
            if (k === "test")
              s.rect("sealed" + i, x - 4, cy - 4, 8, 8, "#cdd2c4");
            else dot(s, P, "split" + r.id, x, cy, classification ? r.y : 0);
          });
        });
        caption(
          s,
          "foot",
          "No arrow from held-out outcomes into the fitted tree.",
          425,
        );
      } else if (scene === "gini" || scene === "root") {
        const p =
          scene === "gini"
            ? st.proportion
            : mean(d.split.train.map((r) => r.y));
        caption(
          s,
          "title",
          scene === "gini"
            ? "A mixed node is uncertain; pure nodes are predictable."
            : "Before any cut, every row shares the root prediction.",
        );
        const rows =
          scene === "gini"
            ? Array.from({ length: 40 }, (_, i) => ({
                id: "toy" + i,
                y: +(i < Math.round(p * 40)),
              }))
            : d.split.train;
        distribution(
          s,
          P,
          "root",
          rows,
          { x: 22, y: 86, w: s.w - 44, h: 112 },
          true,
        );
        const a = frame(
          s,
          "gini",
          { x: 45, y: 263, w: s.w - 73, h: 108 },
          [0, 1],
          [0, 0.5],
          ["Class-1 fraction p", "Gini impurity"],
        );
        line(
          s,
          P,
          "gini-curve",
          linspace(0, 1).map((p) => [a.x(p), a.y(2 * p * (1 - p))]),
          palette[2],
          2.5,
        );
        s.circle(
          "gini-now",
          ...P("gini-now", a.x(p), a.y(2 * p * (1 - p))),
          7,
          palette[3],
        );
        caption(
          s,
          "foot",
          `p = ${fmt(p, 2)} · Gini = ${fmt(2 * p * (1 - p), 3)}`,
          433,
        );
      } else if (["threshold", "gain", "search"].includes(scene) && candidate) {
        caption(
          s,
          "title",
          scene === "search"
            ? "Search legal midpoints; compare the total child error."
            : "A cut separates the same parent data into two children.",
        );
        if (classification) {
          const cutTree = {
            ...d.tree,
            key: st.splitFeature,
            threshold: candidate.threshold,
            left: {
              id: 101,
              n: candidate.left.length,
              value: mean(candidate.left.map((r) => r.y)),
            },
            right: {
              id: 102,
              n: candidate.right.length,
              value: mean(candidate.right.map((r) => r.y)),
            },
          };
          map(
            s,
            P,
            "cut",
            cutTree,
            d.split.train,
            { x: 40, y: 81, w: s.w - 66, h: 155 },
            true,
            q,
            st.selected,
          );
        } else {
          const a = frame(
            s,
            "cut-reg",
            { x: 43, y: 89, w: s.w - 69, h: 155 },
            extent(d.split.train.map((r) => r[st.splitFeature])),
            extent(d.split.train.map((r) => r.y)),
            ["", "Outcome y"],
          );
          const t = candidate.threshold;
          d.split.train.forEach((r) => {
            const m = mean(
              (r[st.splitFeature] <= t ? candidate.left : candidate.right).map(
                (r) => r.y,
              ),
            );
            s.line(
              "candidate-res" + r.id,
              a.x(r[st.splitFeature]),
              a.y(r.y),
              a.x(r[st.splitFeature]),
              a.y(m),
              palette[1] + "70",
              1,
            );
            s.circle(
              "candidate-point" + r.id,
              ...P("candidate-point" + r.id, a.x(r[st.splitFeature]), a.y(r.y)),
              3.6,
              palette[0],
            );
          });
          const x = a.x(t);
          s.line("threshold", x, a.t, x, a.b, palette[3], 2.5);
          s.line(
            "left-mean",
            a.l,
            a.y(mean(candidate.left.map((r) => r.y))),
            x,
            a.y(mean(candidate.left.map((r) => r.y))),
            palette[2],
            3,
          );
          s.line(
            "right-mean",
            x,
            a.y(mean(candidate.right.map((r) => r.y))),
            a.r,
            a.y(mean(candidate.right.map((r) => r.y))),
            palette[2],
            3,
          );
        }
        if (scene === "search") {
          const a = frame(
            s,
            "search",
            { x: 43, y: 320, w: s.w - 69, h: 72 },
            extent(candidates.map((c) => c.threshold)),
            extent(candidates.map((c) => c.score)),
            ["Candidate threshold", "Weighted child impurity"],
            false,
          );
          line(
            s,
            P,
            "candidate-costs",
            candidates.map((c) => [a.x(c.threshold), a.y(c.score)]),
            palette[1],
            2,
          );
          s.circle(
            "best-candidate",
            a.x(best.threshold),
            a.y(best.score),
            5,
            palette[2],
          );
          s.circle(
            "chosen-candidate",
            ...P(
              "chosen-candidate",
              a.x(candidate.threshold),
              a.y(candidate.score),
            ),
            6,
            palette[3],
          );
          caption(s, "foot", "Green: best midpoint · gold: yours", 465);
        } else {
          const w = (s.w - 55) / 2;
          distribution(
            s,
            P,
            "left",
            candidate.left,
            { x: 20, y: 303, w, h: 92 },
            classification,
          );
          distribution(
            s,
            P,
            "right",
            candidate.right,
            { x: 35 + w, y: 303, w, h: 92 },
            classification,
          );
          s.text(
            "left-n",
            20,
            290,
            "Left: " + candidate.left.length + " rows",
            { "font-size": 14 },
          );
          s.text(
            "right-n",
            35 + w,
            290,
            "Right: " + candidate.right.length + " rows",
            { "font-size": 14 },
          );
          caption(
            s,
            "foot",
            `Weighted impurity ${fmt(candidate.score, 3)} · gain ${fmt(candidate.gain, 3)}`,
            430,
          );
        }
      } else if (scene === "curve") {
        caption(
          s,
          "title",
          "Growing the tree trades fit against held-out error.",
        );
        const a = frame(
          s,
          "depth-curve",
          { x: 48, y: 87, w: s.w - 77, h: 280 },
          [1, 5],
          [
            0,
            Math.max(...d.curve.flatMap((r) => [r.train, r.validation])) * 1.15,
          ],
          ["Maximum depth", classification ? "Error rate" : "MSE"],
        );
        ["train", "validation"].forEach((k, j) =>
          line(
            s,
            P,
            "curve" + k,
            d.curve.map((r) => [a.x(r.x), a.y(r[k])]),
            palette[j],
            2.5,
          ),
        );
        s.line(
          "selected-depth",
          a.x(st.depth),
          a.t,
          a.x(st.depth),
          a.b,
          palette[3],
          2,
          "4 4",
        );
        caption(
          s,
          "foot",
          "Blue: training · red: validation · test stays sealed",
          425,
        );
      } else if (
        scene === "mean" ||
        (scene === "raw" && !classification) ||
        scene === "compare" ||
        scene === "errors"
      ) {
        caption(
          s,
          "title",
          scene === "mean"
            ? "The mean minimizes the sum of squared vertical errors."
            : scene === "compare"
              ? "Same observations: a smooth plane slice and a step function."
              : scene === "errors"
                ? "Every vertical gap contributes to the reported error."
                : "A dot is one observation; its height is a numerical outcome.",
        );
        const ys = d.split.train.map((r) => r.y),
          a = frame(
            s,
            "outcome",
            { x: 44, y: 106, w: s.w - 73, h: 242 },
            [-2.4, 2.4],
            extent([...ys, st.guess], 0.14),
            ["Input x₁", "Outcome y"],
          );
        d.split.train.forEach((r) => {
          const yhat = scene === "mean" ? st.guess : treePredict(active, r);
          if (scene === "mean" || scene === "errors")
            s.line(
              "error" + r.id,
              a.x(r.x),
              a.y(r.y),
              a.x(r.x),
              a.y(yhat),
              palette[1] + "77",
              1.2,
            );
          s.mark(
            "data" + r.id,
            ...P("data" + r.id, a.x(r.x), a.y(r.y)),
            palette[0],
            r.id + "; y=" + fmt(r.y),
            r.id === row.id,
            r.id,
          );
        });
        if (scene === "mean") {
          s.line(
            "constant",
            a.l,
            a.y(st.guess),
            a.r,
            a.y(st.guess),
            palette[1],
            2.4,
          );
          s.line(
            "best-constant",
            a.l,
            a.y(mean(ys)),
            a.r,
            a.y(mean(ys)),
            palette[2],
            2,
            "5 5",
          );
        }
        if (scene === "compare") {
          const xs = linspace(-2.4, 2.4, 161);
          line(
            s,
            P,
            "tree-step",
            xs.map((x) => [
              a.x(x),
              a.y(treePredict(active, { x, z: st.second })),
            ]),
            palette[2],
            2.7,
          );
          line(
            s,
            P,
            "linear-slice",
            xs.map((x) => [a.x(x), a.y(d.line.predict({ x, z: st.second }))]),
            palette[1],
            2.1,
          );
        }
        caption(
          s,
          "foot",
          scene === "compare"
            ? `Both lines hold x₂=${fmt(st.second)}; dots retain their own x₂.`
            : scene === "mean"
              ? `Green dashed: mean ${fmt(mean(ys), 2)} · red: your constant`
              : scene === "errors"
                ? "Residuals use each row’s own x₁ AND x₂."
                : "Inspect a dot to follow that observation through the model.",
          414,
        );
      } else if (scene === "confusion") {
        caption(
          s,
          "title",
          "Each validation error is an observation in a cell.",
        );
        confusionDots(s, P, d.split.validation, predict);
        caption(s, "foot", "Rows: actual 0, 1 · columns: predicted 0, 1", 426);
      } else if (scene === "instability") {
        caption(s, "title", "Move one training row. Compare the cuts.");
        const w = (s.w - 74) / 2;
        map(
          s,
          P,
          "before",
          d.tree,
          d.split.train,
          { x: 27, y: 110, w, h: 215 },
          classification,
          q,
          row.id,
          { points: false, labels: false },
        );
        map(
          s,
          P,
          "after",
          d.changed,
          d.perturbed,
          { x: 48 + w, y: 110, w, h: 215 },
          classification,
          q,
          row.id,
          { points: false, labels: false },
        );
        s.text("before-label", 27, 91, "Original sample", { "font-size": 14 });
        s.text("after-label", 48 + w, 91, "One row changed", {
          "font-size": 14,
        });
        caption(
          s,
          "shared-map-axes",
          "Both maps: x₁ runs across; x₂ runs upwards.",
          365,
        );
        caption(
          s,
          "foot",
          `Same query: ${fmt(treePredict(d.tree, q), 3)} → ${fmt(treePredict(d.changed, q), 3)}`,
          413,
        );
      } else {
        caption(
          s,
          "title",
          scene === "raw"
            ? "Both inputs locate an observation; shape marks its class."
            : scene === "recursive"
              ? "Each new cut belongs only to its parent’s region."
              : scene === "pruning"
                ? "Grow once, then remove branches as α increases."
                : scene === "stopping"
                  ? "A leaf stops splitting when a growth rule forbids it."
                  : "The gold region and gold branch lead to the same leaf.",
        );
        const raw = scene === "raw",
          t = raw ? trim(d.tree, 0) : active;
        map(
          s,
          P,
          "partition",
          t,
          d.split.train,
          { x: 39, y: 106, w: s.w - 67, h: raw ? 250 : 147 },
          classification,
          q,
          row.id,
          { cuts: !raw },
        );
        if (!raw) branching(s, P, active, q, 346, 74);
        else caption(s, "foot", "Dots: class 0 · crossed dots: class 1", 421);
      }
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
