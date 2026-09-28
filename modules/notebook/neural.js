import { renderNeural } from "./neural-scenes.js";
import { lossLandscape } from "./spatial-science.js";
import { makeLab, fmt, palette } from "./lab.js";
import {
  classificationData,
  splitRows,
  networkInitial,
  networkForward,
  networkStep,
  networkLoss,
  filters,
  convolve,
  attention,
  sum,
} from "./science.js";
export function create(host, slug) {
  const initialModel = networkInitial(7),
    initial = {
      x: 0.8,
      z: 0.4,
      label: 1,
      weight: initialModel.hidden[0].w[0],
      activation: "tanh",
      rate: 0.2,
      decay: 0,
      phase: 0,
      architecture: "cnn",
      filter: "vertical",
      window: 0,
      token: 1,
      dropout: "evaluation",
      transfer: "head",
      contract: "valid",
      task: "classification",
      pixel: 12,
      landscapeSpan: 1.5,
      cue: "changed",
    };
  const controls = [
    {
      key: "landscapeSpan",
      label: "Landscape radius (zoom)",
      min: 0.2,
      max: 4,
      step: 0.1,
    },
    { key: "pixel", label: "Inspect a pixel (0–24)", min: 0, max: 24, step: 1 },
    {
      key: "cue",
      label: "Counterexample background",
      options: [
        ["changed", "Change background"],
        ["same", "Keep background"],
      ],
    },
    { key: "x", label: "Input x₁", min: -2.5, max: 2.5, step: 0.05 },
    { key: "z", label: "Input x₂", min: -2.5, max: 2.5, step: 0.05 },
    {
      key: "label",
      label: "Inspected true class",
      options: [
        ["1", "Positive: 1"],
        ["0", "Negative: 0"],
      ],
    },
    {
      key: "weight",
      label: "Manual first weight (restarts run)",
      min: -2,
      max: 2,
      step: 0.01,
    },
    {
      key: "activation",
      label: "Hidden activation (restarts run)",
      options: [
        ["tanh", "Tanh"],
        ["relu", "ReLU"],
        ["sigmoid", "Sigmoid"],
      ],
    },
    { key: "rate", label: "Learning rate", min: 0.02, max: 1, step: 0.02 },
    { key: "decay", label: "Weight decay", min: 0, max: 0.3, step: 0.01 },
    {
      key: "architecture",
      label: "Architecture mechanism",
      options: [
        ["cnn", "CNN: trace a 3×3 filter"],
        ["rnn", "RNN: trace a scalar state"],
        ["attention", "Attention: trace one query"],
      ],
    },
    {
      key: "filter",
      label: "Convolution filter",
      options: [
        ["vertical", "Vertical edge"],
        ["horizontal", "Horizontal edge"],
      ],
    },
    {
      key: "window",
      label: "Convolution window (0–8)",
      min: 0,
      max: 8,
      step: 1,
    },
    {
      key: "token",
      label: "Query token / recurrent step",
      min: 0,
      max: 3,
      step: 1,
    },
    {
      key: "dropout",
      label: "Dropout demonstration",
      options: [
        ["evaluation", "Evaluation: all units"],
        ["training", "Training: fixed one-third mask"],
      ],
    },
    {
      key: "transfer",
      label: "Trainable transfer regions",
      options: [
        ["head", "New head only"],
        ["fine", "Head and last backbone block"],
      ],
    },
    {
      key: "contract",
      label: "Incoming input contract",
      options: [
        ["valid", "Correct numeric inputs"],
        ["swapped", "Swap input order"],
        ["missing", "Missing second input"],
      ],
    },
    ...(slug === "deep-learning"
      ? [
          {
            key: "task",
            label: "Output task",
            options: [
              ["classification", "Classification"],
              ["detection", "Detection"],
              ["segmentation", "Segmentation"],
            ],
          },
        ]
      : []),
  ];
  const L = makeLab(host, slug, initial, controls),
    split = splitRows(classificationData(74, "rings", 80));
  let model = structuredClone(initialModel),
    steps = 0,
    history = [],
    trace = [],
    last = null,
    signature = "",
    landscapeOrigin = initialModel.out.slice(0, 2),
    landscapeTrail = [];
  L.surface.onAction = (id) => {
    // Inspection may use visible training/validation rows, never the sealed test.
    const row = [...split.train, ...split.validation].find((r) => r.id === id);
    if (row) L.update({ x: row.x, z: row.z, label: String(row.y) });
  };
  const loss = () => ({
    step: steps,
    train: networkLoss(model, split.train, L.state.activation),
    validation: networkLoss(model, split.validation, L.state.activation),
  });
  const checkpoint = () =>
    history.push({
      model: structuredClone(model),
      steps,
      trace: structuredClone(trace),
      last: structuredClone(last),
      phase: L.state.phase,
      landscapeOrigin: [...landscapeOrigin],
      landscapeTrail: structuredClone(landscapeTrail),
    });
  function resetRun() {
    model = networkInitial(7);
    model.hidden[0].w[0] = L.state.weight;
    steps = 0;
    trace = [loss()];
    history = [];
    last = null;
    landscapeOrigin = model.out.slice(0, 2);
    landscapeTrail = [];
    L.state.phase = 0;
    signature = L.state.weight + "|" + L.state.activation;
  }
  function update() {
    const result = networkStep(model, split.train, {
      rate: L.state.rate,
      decay: L.state.decay,
      kind: L.state.activation,
    });
    last = {
      before: structuredClone(model),
      gradient: result.gradient,
      after: structuredClone(result.model),
    };
    model = result.model;
    landscapeOrigin = model.out.slice(0, 2);
    landscapeTrail = [];
    steps++;
    trace.push(loss());
  }
  L.onReset = resetRun;
  L.action("cycle-next", "Next: loss", () => {
    checkpoint();
    const phase = (L.state.phase + 1) % 4;
    if (phase === 3) update();
    L.update({ phase }, true);
  });
  L.action("cycle-back", "Rewind last action", () => {
    const old = history.pop();
    if (!old) return;
    model = old.model;
    steps = old.steps;
    trace = old.trace;
    last = old.last;
    landscapeOrigin = old.landscapeOrigin;
    landscapeTrail = old.landscapeTrail;
    L.update({ phase: old.phase }, true);
  });
  L.action("train-batch", "Train 20 more updates", () => {
    checkpoint();
    for (let i = 0; i < 20; i++) update();
    L.update({ phase: 3 }, true);
  });
  function restrictedUpdates(count) {
    checkpoint();
    if (!landscapeTrail.length) landscapeTrail.push(model.out.slice(0, 2));
    for (let i = 0; i < count; i++) {
      const result = networkStep(model, split.train, {
        rate: L.state.rate,
        decay: L.state.decay,
        kind: L.state.activation,
      });
      model.out[0] = result.model.out[0];
      model.out[1] = result.model.out[1];
      steps++;
      trace.push(loss());
      landscapeTrail.push(model.out.slice(0, 2));
    }
    last = null;
    L.update({ phase: 0 }, true);
  }
  const landscapeStep = L.action(
    "landscape-step",
    "Take one two-weight step",
    () => restrictedUpdates(1),
  );
  const landscapeBatch = L.action(
    "landscape-batch",
    "Take 20 two-weight steps",
    () => restrictedUpdates(20),
  );
  let landscapeKey = "",
    landscapeData;
  return L.init((animate = false) => {
    const st = L.state;
    if (signature !== st.weight + "|" + st.activation) resetRun();
    const scene = L.scene,
      q = { x: st.x, z: st.z, y: +st.label },
      mask =
        scene === "regularization" && st.dropout === "training"
          ? [0, 1.5, 1.5]
          : [1, 1, 1],
      f = networkForward(model, q, st.activation, mask),
      gradient = networkStep(model, split.train, {
        rate: 0,
        kind: st.activation,
      }).gradient,
      phase = ["Forward", "Loss", "Backward", "Update"][st.phase],
      phaseNext = ["loss", "gradients", "update", "forward"][st.phase],
      rowLoss = -(q.y
        ? Math.log(Math.max(f.p, 1e-12))
        : Math.log(Math.max(1 - f.p, 1e-12)));
    document.getElementById("cycle-next").textContent = "Next: " + phaseNext;
    document.getElementById("cycle-back").disabled = !history.length;
    const convR = Math.floor(st.window / 3),
      convC = st.window % 3,
      kernel = filters[st.filter],
      conv = convolve(kernel, convR, convC),
      att = attention(st.token),
      tokens = ["the", "cat", "sat", "here"],
      rnnInputs = [0.2, 1, -0.4, 0.8],
      rnn = [];
    let h = 0;
    rnnInputs.forEach((x, i) => {
      const before = h;
      h = Math.tanh(0.7 * h + 0.5 * x);
      rnn.push({ x, before, h, i });
    });
    const validation = split.validation.map((r) => ({
        ...r,
        p: networkForward(model, r, st.activation).p,
      })),
      counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
    validation.forEach(
      (r) =>
        counts[r.y ? (r.p >= 0.5 ? "tp" : "fn") : r.p >= 0.5 ? "fp" : "tn"]++,
    );
    const nextLandscapeKey = JSON.stringify([
      model,
      st.activation,
      st.decay,
      st.landscapeSpan,
      landscapeOrigin,
    ]);
    if (landscapeKey !== nextLandscapeKey) {
      landscapeKey = nextLandscapeKey;
      landscapeData = lossLandscape(
        model,
        split.train,
        st.activation,
        st.decay,
        st.landscapeSpan,
        21,
        landscapeOrigin,
      );
    }
    L.data = {
      landscape: landscapeData,
      landscapeTrail,
      model,
      steps,
      trace,
      last,
      gradient,
      forward: f,
      mask,
      split,
      counts,
      convolution: conv,
      attention: att,
      rnn,
      phase,
    };
    L.metrics([
      ["Updates completed", steps],
      ["Inspected P(class 1)", fmt(f.p, 4)],
      [
        "Validation log loss",
        fmt(networkLoss(model, split.validation, st.activation), 4),
      ],
    ]);
    L.legend([
      ["Inputs / values", palette[0]],
      ["Hidden computation", palette[2]],
      ["Loss / correction", palette[1]],
    ]);
    let receipt = [
      [
        "Neuron 1 input products",
        fmt(model.hidden[0].w[0] * q.x, 4) +
          " + " +
          fmt(model.hidden[0].w[1] * q.z, 4),
      ],
      ["Neuron 1 bias", fmt(model.hidden[0].b, 4)],
      ["Neuron 1 sum → activation", fmt(f.z[0], 4) + " → " + fmt(f.a[0], 4)],
      ["Output score → probability", fmt(f.score, 4) + " → " + fmt(f.p, 4)],
      ["Inspected row loss", fmt(rowLoss, 4)],
    ];
    let notice =
      "Computed 2→3→1 binary teaching network. 48 training rows receive gradients; 16 validation rows only measure loss; 16 final-test rows remain sealed. The input sliders inspect a query and do not add it to training. This is not a trained image recognizer.";
    if (["cycle", "backward", "update"].includes(scene)) {
      const showLast =
          st.phase === 3 && last && (scene === "cycle" || scene === "update"),
        g = showLast ? last.gradient : gradient,
        before = showLast ? last.before : model,
        after = showLast
          ? last.after
          : networkStep(model, split.train, {
              rate: st.rate,
              decay: st.decay,
              kind: st.activation,
            }).model;
      receipt = [
        ["Cycle phase", phase],
        ["Gradient ∂L/∂w₁₁", fmt(g.hidden[0].w[0], 6)],
        ["Before w₁₁", fmt(before.hidden[0].w[0], 6)],
        ["Learning rate", fmt(st.rate, 3)],
        ["After / proposed w₁₁", fmt(after.hidden[0].w[0], 6)],
        [
          "Update rule",
          "w − η(gradient + decay × w); all gradients use the same old parameter snapshot.",
        ],
      ];
    }
    if (scene === "training" || scene === "settings")
      receipt = [
        ["Completed training updates", steps],
        [
          "Training BCE",
          fmt(networkLoss(model, split.train, st.activation), 5),
        ],
        [
          "Validation BCE",
          fmt(networkLoss(model, split.validation, st.activation), 5),
        ],
        [
          "Best stored validation step",
          trace.reduce((a, b) => (b.validation < a.validation ? b : a)).step,
        ],
        [
          "Selection",
          "These are development curves; no final-test performance is used.",
        ],
      ];
    if (scene === "evaluation" || scene === "errors")
      receipt = [
        ...Object.entries(counts).map(([k, v]) => [
          "Validation " + k.toUpperCase(),
          v,
        ]),
        ["Inspected query label / probability", q.y + " / " + fmt(f.p, 4)],
        ["Query BCE", fmt(rowLoss, 4)],
        [
          "Final test",
          "Sealed: these are validation counts, not final-test evidence.",
        ],
      ];
    if (scene === "regularization")
      receipt = [
        ["Mask", mask.join(", ")],
        [
          "Convention",
          "Drop one of three units; scale retained activations by 1/(2/3) during training.",
        ],
        ["Evaluation", "Use all units with no mask scaling."],
        [
          "Scope",
          "Fixed-mask forward demonstration. The train button uses the full network plus the selected weight decay, not stochastic dropout.",
        ],
      ];
    if (scene === "architecture") {
      if (st.architecture === "cnn")
        receipt = [
          ["Input shape", "5 × 5, one channel"],
          ["Filter / stride / padding", "3 × 3 / 1 / valid"],
          ["Output shape", "3 × 3"],
          ["Selected window", "row " + convR + ", column " + convC],
          ["Sum of nine products", fmt(conv, 3)],
          [
            "Operation",
            "Cross-correlation, as commonly called convolution in CNN layers.",
          ],
        ];
      if (st.architecture === "attention")
        receipt = [
          ["Query token", tokens[st.token]],
          ["Scaled QK scores", att.scores.map((x) => fmt(x, 3)).join(", ")],
          ["Softmax weights", att.weights.map((x) => fmt(x, 3)).join(", ")],
          ["Sum of weights", fmt(sum(att.weights), 6)],
          [
            "Context = Σ weight × V",
            att.context.map((x) => fmt(x, 4)).join(", "),
          ],
          [
            "Scope",
            "One computed attention head with fixed illustrative Q, K and V vectors.",
          ],
        ];
      if (st.architecture === "rnn") {
        const r = rnn[st.token];
        receipt = [
          ["Step", st.token + 1],
          ["Previous state", fmt(r.before, 5)],
          ["Input", r.x],
          ["Update", "tanh(0.7 × previous + 0.5 × input)"],
          ["New state", fmt(r.h, 5)],
        ];
      }
    }
    if (scene === "transfer")
      receipt = [
        ["Backbone blocks 1–2", "Frozen"],
        ["Backbone block 3", st.transfer === "fine" ? "Trainable" : "Frozen"],
        ["New task head", "Trainable"],
        [
          "Scope",
          "Architecture schematic; no pretrained model or transfer accuracy is fabricated.",
        ],
      ];
    if (scene === "tensor")
      receipt = [
        ["One example", "5 × 5 × 1 = 25 numerical entries"],
        ["Batch of 8", "8 × 5 × 5 × 1 = 200 entries"],
        ["Convention", "Batch, height, width, channels"],
        [
          "Meaning",
          "Array organization, not distances between learned features.",
        ],
      ];
    if (scene === "task")
      receipt = [
        ["Task", st.task],
        [
          "Required output",
          st.task === "classification"
            ? "A class probability vector"
            : st.task === "detection"
              ? "Object boxes with labels and confidence"
              : "A class distribution at each pixel",
        ],
        [
          "Required supervision",
          st.task === "classification"
            ? "Image-level labels"
            : st.task === "detection"
              ? "Annotated boxes"
              : "Pixel-level labels",
        ],
        [
          "Scope",
          "Illustrative output contract; no image model inference is performed.",
        ],
      ];
    if (scene === "contract")
      receipt =
        st.contract === "missing"
          ? [
              ["Input rejected", "Second numerical input is missing."],
              ["Repair", "Supply x₁ and x₂ in the saved order and units."],
            ]
          : [
              [
                "Input order",
                st.contract === "swapped" ? "Incorrectly swapped" : "Correct",
              ],
              [
                "Resulting probability",
                fmt(
                  networkForward(
                    model,
                    st.contract === "swapped" ? { x: q.z, z: q.x } : q,
                    st.activation,
                  ).p,
                  5,
                ),
              ],
              [
                "Saved package",
                "Feature order, transforms, architecture, weights, decision threshold, versions.",
              ],
            ];
    if (scene === "architecture") {
      L.metrics(
        st.architecture === "cnn"
          ? [
              ["Window sum", fmt(conv, 0)],
              ["Output shape", "3 × 3"],
              ["Filter entries", 9],
            ]
          : st.architecture === "attention"
            ? [
                ["Query", tokens[st.token]],
                ["Weight sum", fmt(sum(att.weights), 3)],
                ["Context dimension", 2],
              ]
            : [
                ["Step", st.token + 1],
                ["Previous state", fmt(rnn[st.token].before, 3)],
                ["New state", fmt(rnn[st.token].h, 3)],
              ],
      );
      L.legend(
        st.architecture === "cnn"
          ? [
              ["Input values", palette[0]],
              ["Selected window", palette[1]],
              ["Output sum", palette[2]],
            ]
          : st.architecture === "attention"
            ? [["Attention weights: sum to one", palette[0]]]
            : [["Sequential hidden state", palette[2]]],
      );
    }
    if (scene === "tensor")
      L.metrics([
        ["Entries per example", 25],
        ["Batch size", 8],
        ["Entries per batch", 200],
      ]);
    if (scene === "transfer")
      L.metrics([
        ["New head", "Trainable"],
        ["Backbone", st.transfer === "fine" ? "Partly trainable" : "Frozen"],
        ["Illustration", "Schematic"],
      ]);
    if (scene === "task")
      L.metrics([
        ["Task", st.task],
        [
          "Output",
          st.task === "classification"
            ? "Class vector"
            : st.task === "detection"
              ? "Boxes"
              : "Pixel labels",
        ],
        ["Illustration", "Contract"],
      ]);
    if (scene === "contract")
      L.metrics([
        [
          "Input status",
          st.contract === "valid"
            ? "Valid"
            : st.contract === "missing"
              ? "Rejected"
              : "Order changed",
        ],
        ["Required inputs", 2],
        ["Saved threshold", "0.5"],
      ]);
    if (scene === "backward" || (scene === "cycle" && st.phase === 2))
      L.legend([
        ["Positive gradient", palette[1]],
        ["Negative gradient", palette[0]],
        ["Hidden activation", palette[2]],
      ]);
    if (scene === "backward" || scene === "update") {
      receipt = [
        [
          "Landscape coordinates",
          "Output weights v₁ and v₂; all other weights fixed.",
        ],
        ["Gradient ∂L/∂v₁", fmt(landscapeData.gradient[0], 6)],
        ["Gradient ∂L/∂v₂", fmt(landscapeData.gradient[1], 6)],
        ["Objective", "Mean training BCE + decay/2 × (v₁² + v₂²)."],
        [
          "Two-weight step",
          "Updates only these two weights. Full-network training also moves the other parameters.",
        ],
      ];
    }
    L.receipt(L.table(["Follow the computation", "Value"], receipt));
    if (scene === "hierarchy") {
      L.metrics([
        ["Selected filter sum", fmt(conv, 0)],
        ["After ReLU", Math.max(0, conv)],
        ["Output shape", "3 × 3"],
      ]);
      receipt = [
        ["Fixed teaching filter", st.filter],
        ["Selected pre-activation", conv],
        ["Selected ReLU response", Math.max(0, conv)],
        [
          "Scope",
          "Computed edge response then nonlinearity; learned deep features may differ.",
        ],
      ];
      L.receipt(L.table(["Follow the computation", "Value"], receipt));
    }
    if (scene === "shortcut") {
      L.metrics([
        ["Object", "Same apple"],
        ["Background", st.cue === "changed" ? "Changed" : "Same"],
        ["Toy shortcut", st.cue === "changed" ? "Fails" : "Passes"],
      ]);
      L.receipt(
        L.table(
          ["Counterexample", "What changes"],
          [
            ["Object identity", "Apple in both images"],
            ["Toy rule", "Blue background predicts apple"],
            [
              "Result",
              st.cue === "changed"
                ? "A wrong prediction after the background changes"
                : "Both examples agree with this shortcut",
            ],
          ],
        ),
      );
    }
    if (["backward", "update"].includes(scene))
      L.metrics([
        ["Updates completed", steps],
        ["Slice loss", fmt(landscapeData.value, 4)],
        ["Gradient magnitude", fmt(Math.hypot(...landscapeData.gradient), 4)],
      ]);
    if (["backward", "update"].includes(scene))
      L.legend([
        ["Measured loss surface", palette[2]],
        ["Current weights", palette[3]],
        ["Downhill step", palette[1]],
      ]);
    const classLegend = [
      ["Class 0 · dots", palette[0]],
      ["Class 1 · crosses", palette[1]],
      ["Inspected query", palette[3]],
    ];
    if (
      ["network", "inputs", "errors", "contract", "activation"].includes(
        scene,
      ) ||
      (scene === "cycle" && st.phase === 3)
    )
      L.legend(classLegend);
    if (["training", "settings"].includes(scene))
      L.legend([
        ["Training loss", palette[0]],
        ["Validation loss", palette[1]],
        ["Best stored validation", palette[3]],
      ]);
    if (scene === "evaluation" || scene === "pipeline")
      L.legend(classLegend.slice(0, 2));
    if (scene === "neuron")
      L.legend([
        ["x₁ product", palette[0]],
        ["x₂ product", palette[1]],
        ["Bias / activation", palette[2]],
        ["Current result", palette[3]],
      ]);
    if (
      ["forward", "regularization"].includes(scene) ||
      (scene === "cycle" && st.phase === 0)
    )
      L.legend([
        ...(st.activation === "tanh"
          ? [["Negative activation", palette[4]]]
          : []),
        ["Positive activation", palette[2]],
        ["Same input", palette[3]],
      ]);
    if (scene === "neuron" && slug === "neural-networks" && L.index === 4)
      L.legend([
        ["Unit 1", palette[0]],
        ["Unit 2", palette[2]],
        ["Unit 3", palette[4]],
        ["Shared input", palette[3]],
      ]);
    if (scene === "loss" || (scene === "cycle" && st.phase === 1))
      L.legend([
        ["Loss curve", palette[1]],
        ["Inspected prediction", palette[3]],
      ]);
    if (scene === "cycle" && st.phase === 2)
      L.legend([
        ["Measured loss surface", palette[2]],
        ["Current weights", palette[3]],
        ["Downhill direction", palette[1]],
      ]);
    if (scene === "tensor")
      L.legend([
        ["Numerical entries", palette[0]],
        ["Selected entry", palette[3]],
      ]);
    if (
      scene === "hierarchy" ||
      (scene === "architecture" && st.architecture === "cnn")
    )
      L.legend([
        ["Positive entry", palette[0]],
        ["Negative entry", palette[1]],
        ["Selected window / output", palette[3]],
      ]);
    if (scene === "architecture" && st.architecture === "attention")
      L.legend([["Selected query / context", palette[3]]]);
    if (["task", "shortcut", "transfer"].includes(scene)) L.legend([]);
    L.note(notice);
    // Keep the control set focused without destroying its DOM or entered values.
    const visible = new Set([
      ...([
        "pipeline",
        "hierarchy",
        "shortcut",
        "task",
        "tensor",
        "architecture",
        "transfer",
        "backward",
        "update",
        "training",
        "settings",
        "evaluation",
        "errors",
      ].includes(scene)
        ? []
        : ["x", "z", "label"]),
      ...(["neuron", "network", "forward", "activation", "settings"].includes(
        scene,
      )
        ? ["weight", "activation"]
        : []),
      ...(["cycle", "training", "settings", "update", "backward"].includes(
        scene,
      )
        ? ["rate", "decay"]
        : []),
      ...(scene === "architecture"
        ? [
            "architecture",
            ...(st.architecture === "cnn" ? ["filter", "window"] : ["token"]),
          ]
        : []),
      ...(scene === "regularization" ? ["dropout"] : []),
      ...(scene === "transfer" ? ["transfer"] : []),
      ...(scene === "contract" ? ["contract"] : []),
      ...(scene === "task" ? ["task"] : []),
      ...(scene === "tensor" ? ["pixel"] : []),
      ...(["backward", "update"].includes(scene) ? ["landscapeSpan"] : []),
      ...(scene === "shortcut" ? ["cue"] : []),
      ...(scene === "hierarchy" ? ["filter", "window"] : []),
    ]);
    if (scene === "neuron" && slug === "neural-networks" && L.index === 4) {
      visible.delete("z");
      visible.delete("label");
      visible.delete("activation");
    }
    controls.forEach((c) => {
      document.getElementById(c.key).closest("label").hidden = !visible.has(
        c.key,
      );
    });
    document.getElementById("lab-actions").hidden = ![
      "cycle",
      "training",
      "settings",
      "update",
      "backward",
      "network",
      "forward",
      "loss",
    ].includes(scene);
    landscapeStep.hidden = scene !== "update";
    landscapeBatch.hidden = landscapeStep.hidden;
    if (["backward", "update"].includes(scene)) {
      document.getElementById("cycle-next").hidden = true;
      document.getElementById("train-batch").hidden = true;
    } else {
      document.getElementById("cycle-next").hidden = false;
      document.getElementById("train-batch").hidden = false;
    }
    L.draw((s, P) => renderNeural(s, P, L, slug), animate);
  });
}
