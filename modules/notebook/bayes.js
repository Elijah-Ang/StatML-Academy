import {
  bayesCounts,
  bayesPosterior,
  gaussian,
  gaussianPosterior,
} from "./models.js";
import {
  Surface,
  Tween,
  bindings,
  fmt,
  pct,
  select,
  range,
  stats,
  setText,
  listenInput,
  palette,
  pathFrom,
  motionStatus,
  announce,
} from "./ui.js";
export function bayes(host) {
  const evidenceSelect = (word) =>
    select(`clue-${word}`, word, [
      ["present", "Present"],
      ["absent", "Absent"],
      ["ignore", "Ignore"],
    ]);
  host.innerHTML = `<div class="plot" id="bayes-plot"></div>${stats([
    ["bayes-prior", "Prior · spam"],
    ["bayes-posterior", "Posterior · spam"],
    ["bayes-decision", "Decision"],
  ])}<div id="email-controls"><div class="evidence-controls">${["free", "winner", "meeting"].map(evidenceSelect).join("")}</div><details class="lab-options" id="bayes-options"><summary>Smoothing & assumption experiments</summary><div class="lab-controls">${range("alpha", "Smoothing α", 0, 3, 0.25, 1)}${evidenceSelect("unicorn")}</div><label class="control"><input type="checkbox" id="duplicate-free">Duplicate the “free” feature</label></details></div><div class="lab-controls" id="variant-controls" hidden>${select(
    "bayes-variant",
    "Feature representation",
    [
      ["bernoulli", "Bernoulli"],
      ["multinomial", "Multinomial"],
      ["categorical", "Categorical"],
      ["gaussian", "Gaussian"],
    ],
  )}</div><div id="gaussian-controls" hidden>${range("plant-height", "Plant height · cm", 145, 200, 1, 169)}</div><div id="fold-controls" hidden><span class="control">Choose the validation fold</span><div class="fold-buttons">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-fold="${i}" aria-pressed="${i === 1}">${i}</button>`).join("")}</div></div><div id="threshold-control" hidden>${range("bayes-threshold", "Flag when posterior ≥", 0, 1, 0.01, 0.5)}</div><div class="inspection" id="bayes-inspect"></div>`;
  const surface = new Surface(
    document.getElementById("bayes-plot"),
    "Naive Bayes evidence notebook. Every likelihood and posterior uses the stated training counts.",
  );
  const bind = bindings();
  let stage = 0;
  let state = {
    evidence: {
      free: "present",
      winner: "present",
      meeting: "ignore",
      unicorn: "ignore",
    },
    alpha: 1,
    duplicate: false,
    variant: "bernoulli",
    height: 169,
    fold: 1,
    threshold: 0.5,
  };
  const result = () =>
    bayesPosterior(state.evidence, state.alpha, state.duplicate);
  function bar(key, y, value, label, color) {
    const x = 16,
      w = surface.w - 32;
    surface.text(`${key}-label`, x, y, label);
    surface.rect(`${key}-bg`, x, y + 13, w, 24, "#ebece1");
    surface.rect(`${key}-fill`, x, y + 13, w * (value ?? 0), 24, color);
    surface.text(`${key}-value`, x + w, y, pct(value), {
      "text-anchor": "end",
    });
  }
  function draw(v, moving = false) {
    const r = result(),
      w = surface.begin(300).w,
      p = v.p ?? r.p ?? 0,
      plant = gaussianPosterior(state.height);
    const probabilityValid = r.p != null;
    if (stage === 1) {
      surface.text("input-title", 16, 28, w<350 ? "One email → word states" : "One email becomes measured word clues.");
      const labels = {present: "Present · 1", absent: "Absent · 0", ignore: "Ignored · ?"};
      ["free", "winner", "meeting"].forEach((word, i) => {
        const y = 74 + i * 65;
        surface.rect(`input-row-${i}`, 16, y-23, w-32, 50, `${palette[i]}12`, {stroke: `${palette[i]}55`});
        surface.text(`input-word-${i}`, 30, y+8, word, {fill:palette[i]});
        surface.text(`input-state-${i}`, w-28, y+8, labels[state.evidence[word]], {"text-anchor":"end", "font-size":w<350 ? 14 : 17});
      });
      surface.text("input-answer", 16, 289, "Spam label is the answer, not an input.", {"font-size":w<350 ? 14 : 16});
    } else if (stage === 2) {
      const width = w - 36;
      const rows = [
        [
          "Development data",
          "Choose settings with cross-validation",
          palette[0],
        ],
        [
          "Training fold → model",
          "Vocabulary + counts learned here",
          palette[2],
        ],
        ["Validation fold", "Compare the complete recipe", palette[3]],
        [
          "Final test · sealed",
          "Evaluate after every choice is fixed",
          palette[1],
        ],
      ];
      rows.forEach(([title, note, color], i) => {
        const y = 13 + i * 72;
        surface.rect(`split-box-${i}`, 18, y, width, 58, `${color}12`, {
          stroke: `${color}66`,
        });
        surface.text(`split-title-${i}`, 30, y + 23, title, { fill: color });
        surface.text(
          `split-note-${i}`,
          30,
          y + 45,
          w < 370
            ? note
                .replace("Choose settings with ", "")
                .replace(
                  "after every choice is fixed",
                  "once choices are fixed",
                )
            : note,
          { "font-size": w < 370 ? 14 : 16 },
        );
      });
    } else if (stage === 3) {
      const labels = {
        bernoulli: ["Bernoulli", "One clue → present or absent"],
        multinomial: ["Multinomial", "Occurrences of each word"],
        categorical: ["Categorical", "One named level per feature"],
        gaussian: ["Gaussian", "A density for each class"],
      };
      if (state.variant !== "gaussian") {
        surface.text("variant-name", 18, 32, labels[state.variant][0], {
          "font-size": 25,
          fill: palette[0],
        });
        surface.text("variant-note", 18, 61, labels[state.variant][1]);
      }
      if (state.variant === "gaussian") {
        const a = surface.axes(
          [140, 205],
          [0, 0.065],
          "Continuous measurement",
          "Density",
        );
        for (const [j, mu, sd] of [
          [0, 165, 7],
          [1, 180, 8],
        ])
          surface.path(
            `variant-density-${j}`,
            pathFrom(
              Array.from({ length: 100 }, (_, i) => {
                const x = 140 + i * 0.65;
                return [a.x(x), a.y(gaussian(x, mu, sd))];
              }),
            ),
            palette[j],
            2.5,
          );
      } else
        ["free", "winner", "meeting"].forEach((word, i) => {
          const x = 25 + (i * (w - 40)) / 3,
            c = palette[i],
            label =
              state.variant === "bernoulli"
                ? ["1", "1", "0"][i]
                : state.variant === "multinomial"
                  ? ["3", "2", "0"][i]
                  : ["red", "blue", "green"][i];
          surface.rect(`variant-box-${i}`, x, 115, (w - 65) / 3, 85, `${c}14`, {
            stroke: c,
          });
          surface.text(`variant-value-${i}`, x + (w - 65) / 6, 164, label, {
            "text-anchor": "middle",
            "font-size": 27,
          });
          surface.text(
            `variant-feature-${i}`,
            x + (w - 65) / 6,
            233,
            state.variant === "categorical" ? `level ${i + 1}` : word,
            { "text-anchor": "middle" },
          );
        });
    } else if (stage === 4) {
      surface.text(
        "counts-note",
        16,
        24,
        `P(word present | class), α = ${state.alpha}`,
      );
      ["free", "winner", "meeting"].forEach((word, i) => {
        const y = 58 + i * 80;
        surface.text(`word-${word}`, 16, y, word, { fill: palette[0] });
        ["spam", "ham"].forEach((c, j) => {
          const d = bayesCounts[c],
            value = (d[word] + state.alpha) / (d.n + 2 * state.alpha),
            bx = w < 360 ? 65 : 85,
            bw = w - bx - 64;
          surface.rect(
            `count-bg-${word}-${j}`,
            bx,
            y - 12 + j * 26,
            bw,
            17,
            "#eeeee4",
          );
          surface.rect(
            `count-fill-${word}-${j}`,
            bx,
            y - 12 + j * 26,
            bw * value,
            17,
            palette[j],
          );
          surface.text(
            `count-value-${word}-${j}`,
            w - 12,
            y + 1 + j * 26,
            fmt(value, 3),
            { "text-anchor": "end", class: "data-label" },
          );
        });
      });
      surface.text("count-legend", 16, 294, "Blue = spam · red = not spam", {
        class: "axis-label",
      });
    } else if (stage === 7) {
      const a = surface.axes(
        [145, 200],
        [0, 0.065],
        "Plant height · cm",
        "Density (per cm)",
      );
      [
        [165, 7],
        [180, 8],
      ].forEach(([mu, sd], j) =>
        surface.path(
          `density-${j}`,
          pathFrom(
            Array.from({ length: 111 }, (_, i) => {
              const x = 145 + i * 0.5;
              return [a.x(x), a.y(gaussian(x, mu, sd))];
            }),
          ),
          palette[j],
          2.4,
        ),
      );
      surface.line(
        "height-guide",
        a.x(state.height),
        a.b,
        a.x(state.height),
        a.t,
        "#7a806c",
        1.5,
        "4 4",
      );
      surface.circle(
        "density-a",
        a.x(state.height),
        a.y(plant.a),
        5,
        palette[0],
      );
      surface.circle(
        "density-b",
        a.x(state.height),
        a.y(plant.b),
        5,
        palette[1],
      );
    } else if (stage === 9) {
      const gap = 7,
        cw = (w - 32 - gap * 4) / 5;
      surface.text(
        "fold-title",
        16,
        30,
        `Round ${state.fold}: fold ${state.fold} validates`,
      );
      for (let i = 1; i <= 5; i++) {
        const x = 16 + (i - 1) * (cw + gap),
          valid = i === state.fold;
        surface.rect(`fold-${i}`, x, 65, cw, 95, valid ? "#ead393" : "#b8d3e1");
        surface.text(`fold-number-${i}`, x + cw / 2, 105, String(i), {
          "text-anchor": "middle",
          "font-size": 25,
        });
        surface.text(
          `fold-role-${i}`,
          x + cw / 2,
          137,
          valid ? "Check" : "Fit",
          { "text-anchor": "middle", "font-size": 14 },
        );
      }
      surface.line("fold-rule", 16, 196, w - 16, 196, "#d5d5c6");
      surface.text(
        "fold-refit",
        16,
        226,
        w < 350
          ? "Refit vocabulary + likelihoods."
          : "Refit vocabulary + likelihoods each round.",
      );
      surface.text(
        "fold-sealed",
        16,
        264,
        "Final test stays outside this loop.",
        { fill: palette[1] },
      );
    } else if (stage === 8) {
      const logs = r.logs;
      surface.text(
        "log-heading",
        16,
        27,
        "Products become sums of log likelihoods",
      );
      ["Spam", "Not spam"].forEach((label, j) => {
        const y = 69 + j * 76;
        surface.text(`log-class-${j}`, 16, y, label, { fill: palette[j] });
        surface.text(
          `log-value-${j}`,
          w - 16,
          y,
          Number.isFinite(logs[j]) ? fmt(logs[j], 3) : "−∞",
          { "text-anchor": "end", class: "data-label" },
        );
        surface.rect(`log-bg-${j}`, 16, y + 12, w - 32, 20, "#ebece1");
        surface.rect(
          `log-bar-${j}`,
          16,
          y + 12,
          (w - 32) * (probabilityValid ? (j ? 1 - p : p) : 0),
          20,
          palette[j],
        );
      });
      surface.text(
        "log-alpha",
        16,
        247,
        `α = ${state.alpha}: ${state.alpha ? "unseen events receive some mass" : "zeros remain possible"}`,
      );
      surface.text(
        "log-normalize",
        16,
        280,
        "Normalize stably to get the posterior.",
      );
    } else if (stage === 5 || stage === 6) {
      const factors = r.rows.length,
        values = [
          { name: "Spam", score: r.scores[0], color: palette[0], prior: 0.4 },
          {
            name: "Not spam",
            score: r.scores[1],
            color: palette[1],
            prior: 0.6,
          },
        ];
      values.forEach((c, j) => {
        const y = 27 + j * 113;
        surface.text(`chain-label-${j}`, 16, y, c.name, { fill: c.color });
        surface.text(`chain-score-${j}`, w - 16, y, stage === 5 ? fmt(c.score, 5) : pct(probabilityValid ? (j ? 1-p : p) : null), {
          "text-anchor": "end",
          class: "data-label",
        });
        const text = [
          fmt(c.prior, 2),
          ...r.rows.map((x) => fmt(x.probabilities[j], 3)),
        ];
        surface.text(
          `chain-factors-${j}`,
          16,
          y + 34,
          text.length > 4
            ? `${text.slice(0, 3).join(" × ")} × … (${factors} clues)`
            : text.join(" × "),
          { "font-size": w < 350 ? 14 : 17 },
        );
        surface.rect(`chain-bg-${j}`, 16, y + 51, w - 32, 19, "#ebece1");
        surface.rect(
          `chain-bar-${j}`,
          16,
          y + 51,
          (w - 32) * (stage === 5 ? c.score : probabilityValid ? (j ? 1 - p : p) : 0),
          19,
          c.color,
        );
      });
      surface.text(
        "chain-normalize",
        16,
        279,
        !probabilityValid
          ? "Both scores are zero: probability is undefined."
          : stage === 5
            ? state.duplicate && state.evidence.free !== "ignore"
              ? "A copied clue multiplies its factor twice."
              : "Class scores before dividing by their total."
            : `Probability = score ÷ total ${fmt(r.scores[0]+r.scores[1], 5)}.`,
        { "font-size": w < 350 ? 15 : 17 },
      );
    } else {
      const prior = stage === 0;
      bar(
        "spam",
        47,
        prior ? 0.4 : probabilityValid ? p : null,
        prior ? "Spam · 40 training emails" : "Spam · posterior",
        palette[0],
      );
      bar(
        "ham",
        156,
        prior ? 0.6 : probabilityValid ? 1 - p : null,
        prior ? "Not spam · 60 emails" : "Not spam · posterior",
        palette[1],
      );
      if (stage === 10) {
        const x = 16 + (w - 32) * state.threshold;
        surface.line("decision-marker", x, 70, x, 96, "#383b32", 2.5);
        surface.text(
          "decision-threshold",
          16,
          271,
          `Threshold ${fmt(state.threshold, 2)} → ${r.p == null ? "undefined" : r.p >= state.threshold ? "flag as spam" : "do not flag"}`,
        );
      } else
        surface.text(
          "bar-meaning",
          16,
          266,
          prior
            ? "Before measuring the current message."
            : `${r.rows.length} likelihood factors · α = ${state.alpha}`,
        );
    }
    surface.end(
      stage === 1
        ? "One email's measured word states. Present is 1, absent is 0, and ignored evidence does not enter the calculation. The spam target is not an input."
        : stage === 7
        ? `Illustrative plant groups. At ${state.height} cm, density A ${fmt(plant.a, 4)}, density B ${fmt(plant.b, 4)}, posterior A ${pct(plant.p)}.`
        : `Bernoulli email model. Spam score ${fmt(r.scores[0], 6)}, not-spam score ${fmt(r.scores[1], 6)}, posterior spam ${pct(r.p)}.`,
    );
    const decision =
      r.p == null
        ? "Undefined"
        : r.p >= state.threshold
          ? "Flag as spam"
          : "Do not flag";
    Object.entries({
      "spam-score": fmt(r.scores[0], 6),
      "ham-score": fmt(r.scores[1], 6),
      posterior: pct(r.p),
      alpha: state.alpha,
      fold: state.fold,
      threshold: fmt(state.threshold, 2),
      decision,
    }).forEach(([k, v]) => bind(k, v));
    setText("bayes-prior", stage === 7 ? "A: 50.0%" : "40.0%");
    setText("bayes-posterior", stage === 7 ? `A: ${pct(plant.p)}` : pct(r.p));
    setText(
      "bayes-decision",
      stage === 7 ? (plant.p >= 0.5 ? "Group A" : "Group B") : decision,
    );
    document.querySelector("#bayes-prior").previousElementSibling.textContent =
      stage === 7 ? "Prior · plant A" : "Prior · spam";
    document.querySelector(
      "#bayes-posterior",
    ).previousElementSibling.textContent =
      stage === 7 ? "Posterior · plant A" : "Posterior · spam";
    const showsPosterior = ![0, 1, 2, 3, 4, 5, 9].includes(stage);
    document.getElementById("bayes-posterior").parentElement.hidden = !showsPosterior;
    document.getElementById("bayes-decision").parentElement.hidden = !showsPosterior;
    host.querySelector(".lab-stats").hidden = [1, 2, 3, 9].includes(stage);
    setText("alpha-value", state.alpha);
    setText("plant-height-value", `${state.height} cm`);
    setText("bayes-threshold-value", fmt(state.threshold, 2));
    const notes = {
      0: "40 of 100 training emails are spam. This starting probability is called the prior.",
      1: "Present and absent are measured states. Ignored means this clue does not enter the calculation.",
      2: "The split is a workflow diagram, not a performance estimate.",
      3: "This selector compares feature representations. It does not change the Bernoulli email model.",
      4: "Raw counts: free 30/40 vs 6/60; winner 24/40 vs 3/60; meeting 2/40 vs 30/60.",
      7: `Density A ${fmt(plant.a, 4)}; B ${fmt(plant.b, 4)}. Equal priors; a separate illustrative plant example.`,
      9: `Round ${state.fold}: the held-out fold is used only for validation.`,
    };
    setText(
      "bayes-inspect",
      notes[stage] ||
        `${r.rows.length} observed clue factors. ${state.duplicate ? "The duplicate is an assumption stress test." : state.evidence.meeting === "ignore" ? "Meeting is ignored, not assumed absent." : "Absent clues contribute their complement likelihood."}`,
    );
    setText(
      "lab-caption",
      stage === 7
        ? "Blue: A (165, 7). Red: B (180, 8). Curve heights are densities, not point probabilities."
        : stage === 9
          ? "Every round refits all learned preprocessing. No performance numbers are invented for this diagram."
          : "Training: 40 spam, 60 ordinary emails. Present, absent and ignored evidence have different meanings. Probability bars move to the committed calculation shown in the receipt.",
    );
    motionStatus(moving, "Moving to the committed posterior…");
  }
  const tween = new Tween(draw);
  const update = (animate = true) => tween.to({ p: result().p ?? 0 }, animate);
  const syncControls = () => {
    Object.entries(state.evidence).forEach(
      ([k, v]) => (document.getElementById(`clue-${k}`).value = v),
    );
    document.getElementById("alpha").value = state.alpha;
    document.getElementById("duplicate-free").checked = state.duplicate;
    document.getElementById("plant-height").value = state.height;
    document.getElementById("bayes-variant").value = state.variant;
    document.getElementById("bayes-threshold").value = state.threshold;
    document
      .querySelectorAll("[data-fold]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(+b.dataset.fold === state.fold)),
      );
  };
  ["free", "winner", "meeting", "unicorn"].forEach((k) =>
    listenInput(`clue-${k}`, (v) => {
      state.evidence[k] = v;
      update();
      announce(`Posterior spam ${pct(result().p)}.`);
    }),
  );
  listenInput("alpha", (v) => {
    state.alpha = +v;
    update(false);
  });
  listenInput("duplicate-free", () => {
    state.duplicate = document.getElementById("duplicate-free").checked;
    update();
  });
  listenInput("plant-height", (v) => {
    state.height = +v;
    update(false);
  });
  listenInput("bayes-variant", (v) => {
    state.variant = v;
    update(false);
  });
  listenInput("bayes-threshold", (v) => {
    state.threshold = +v;
    update(false);
  });
  document.querySelectorAll("[data-fold]").forEach(
    (b) =>
      (b.onclick = () => {
        state.fold = +b.dataset.fold;
        syncControls();
        update(false);
      }),
  );
  function reset() {
    state = {
      evidence: {
        free: "present",
        winner: "present",
        meeting: "ignore",
        unicorn: "ignore",
      },
      alpha: 1,
      duplicate: false,
      variant: "bernoulli",
      height: 169,
      fold: 1,
      threshold: 0.5,
    };
    syncControls();
    update();
    announce("Training-count example and evidence restored.");
  }
  syncControls();
  update(false);
  return {
    stage(i) {
      stage = i;
      document.getElementById("email-controls").hidden = [0, 2, 3, 7, 9].includes(
        i,
      );
      document.getElementById("variant-controls").hidden = i !== 3;
      document.getElementById("gaussian-controls").hidden = i !== 7;
      document.getElementById("fold-controls").hidden = i !== 9;
      document.getElementById("threshold-control").hidden = i !== 10;
      host.querySelector(".evidence-controls").hidden = i === 4;
      document.getElementById("bayes-options").hidden = i < 4;
      document.getElementById("clue-unicorn").closest("label").hidden = i === 4;
      document.getElementById("duplicate-free").closest("label").hidden = i === 4;
      if (i === 4 || i === 5 || i === 8)
        document.getElementById("bayes-options").open = true;
      update(false);
    },
    resize() {
      draw(tween.current, !!tween.raf);
    },
    reset,
    pause() {
      tween.finish();
    },
    get state() {
      return structuredClone(state);
    },
    get result() {
      return result();
    },
    tween,
  };
}
