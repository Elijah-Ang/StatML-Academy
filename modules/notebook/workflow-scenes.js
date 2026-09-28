// Concrete teaching scenes. Values come from the workflow controller; illustrative
// protocol / missing-follow-up examples are explicitly labelled as such.
import { palette, fmt } from "./ui.js";
import { caption, frame, arrow, paper, grid } from "./spatial.js";
import { mean } from "./science.js";

function token(s, P, key, x, y, value, color, hollow = false) {
  const p = P(key, x, y);
  s.circle(key, ...p, 14, hollow ? paper : color + "22", {
    stroke: color,
    "stroke-width": 1.5,
  });
  s.text(key + "-value", p[0], p[1] + 5, String(value), {
    "text-anchor": "middle",
    "font-size": 14,
    fill: color,
  });
}

function timing(s, P, st) {
  const end = caption(
      s,
      "story-title",
      "A feature must exist when the prediction is made.",
    ),
    y = end + 125;
  const xs = [30, s.w / 2, s.w - 30];
  arrow(s, "time-axis", [20, y], [s.w - 16, y], palette[5], 1.8);
  const words = ["Before", "Predict", "After"];
  xs.forEach((x, i) => {
    s.circle("time-dot" + i, x, y, 5, palette[i === 1 ? 3 : 5]);
    s.text("time-word" + i, x, y + 28, words[i], {
      "text-anchor": "middle",
      "font-size": 14,
    });
  });
  s.line("time-boundary", xs[1], y - 65, xs[1], y + 50, palette[3], 1.5, "4 4");
  const valid = st.feature === "before",
    x = valid ? xs[0] : xs[2];
  token(
    s,
    P,
    "available-feature",
    x,
    y - 58,
    valid ? "x" : "y",
    valid ? palette[0] : palette[1],
  );
  arrow(
    s,
    "use-feature",
    [x, y - 42],
    [xs[1] + (valid ? -12 : 12), y - 13],
    valid ? palette[0] : palette[1],
    2,
  );
  if (!valid) {
    s.line(
      "future-cross-a",
      xs[1] + 14,
      y - 48,
      xs[1] + 31,
      y - 31,
      palette[1],
      3,
    );
    s.line(
      "future-cross-b",
      xs[1] + 14,
      y - 31,
      xs[1] + 31,
      y - 48,
      palette[1],
      3,
    );
  }
  caption(
    s,
    "time-feature",
    valid
      ? "Measured input x is available."
      : "Later outcome y cannot travel back in time.",
    y + 88,
    valid ? palette[0] : palette[1],
  );
  caption(
    s,
    "time-foot",
    "A correct train/test split cannot repair a future feature.",
    y + 157,
  );
}

function centering(s, P, st, d) {
  const fitted = st.mode === "safe" ? d.safeMean : d.leakedMean,
    end = caption(
      s,
      "story-title",
      "The fitted mean changes every centered value.",
    );
  const top = end + 55;
  [
    [0, "Original values", (v) => v, [0, 105]],
    [1, "Subtract the saved mean", (v) => v - fitted, [-40, 105]],
  ].forEach(([j, label, transform, domain]) => {
    const y = top + j * 150;
    s.text("center-heading" + j, 24, y - 20, label, { "font-size": 15 });
    const a = {
      x: (v) => 28 + ((v - domain[0]) / (domain[1] - domain[0])) * (s.w - 55),
    };
    s.line("center-line" + j, 28, y + 30, s.w - 27, y + 30, palette[5], 1);
    for (let k = 0; k < 3; k++) {
      const v = domain[0] + ((domain[1] - domain[0]) * k) / 2;
      s.text("center-tick" + j + k, a.x(v), y + 49, fmt(v, 1), {
        "font-size": 12,
        "text-anchor": k === 0 ? "start" : k === 2 ? "end" : "middle",
      });
    }
    [2, 4, 100].forEach((value, i) => {
      const xp = a.x(transform(value)),
        yp = y + (i === 0 ? -6 : i === 1 ? 11 : 2);
      s.circle(
        "center-value" + j + i,
        ...P("center-value" + j + i, xp, yp),
        5,
        palette[i === 2 ? 1 : 0],
      );
    });
    if (j === 1)
      s.line(
        "center-zero",
        a.x(0),
        y - 9,
        a.x(0),
        y + 35,
        palette[3],
        1.5,
        "3 3",
      );
  });
  caption(
    s,
    "center-mean",
    "Saved mean = " +
      fmt(fitted, 3) +
      (st.mode === "safe"
        ? " from 2 and 4."
        : " after also reading holdout 100."),
    top + 285,
    st.mode === "safe" ? palette[0] : palette[1],
  );
  caption(
    s,
    "center-foot",
    "Gold marks zero. Red is the held-out value; it is transformed, never used to learn a safe mean.",
    top + 345,
  );
}

function splitTokens(s, P, st, d, missing = false) {
  const end = caption(
    s,
    "story-title",
    missing
      ? "Learn the fill value from allowed observations."
      : "Only training rows may teach the transformation.",
  );
  const top = end + 36,
    boundary = s.w * 0.62;
  s.rect("training-container", 14, top, boundary - 22, 93, palette[0] + "09", {
    stroke: palette[0] + "66",
  });
  s.rect(
    "holdout-container",
    boundary + 7,
    top,
    s.w - boundary - 21,
    93,
    palette[1] + "09",
    { stroke: palette[1] + "66" },
  );
  s.text("training-name", 23, top + 22, "Train", {
    "font-size": 15,
    fill: palette[0],
  });
  s.text("holdout-name", boundary + 14, top + 22, "Holdout", {
    "font-size": 14,
    fill: palette[1],
  });
  const rows = missing
      ? d.rows
      : [
          { id: "A", train: true, value: 2 },
          { id: "B", train: true, value: 4 },
          { id: "C", train: false, value: 100 },
        ],
    train = rows.filter((r) => r.train),
    held = rows.filter((r) => !r.train);
  rows.forEach((r, i) => {
    const group = r.train ? train : held,
      j = group.indexOf(r),
      l = r.train ? 26 : boundary + 17,
      rgt = r.train ? boundary - 18 : s.w - 22,
      x = missing
        ? l + ((j % 6) * (rgt - l)) / 5
        : l + ((j + 0.5) * (rgt - l)) / group.length,
      y = top + 49 + (missing ? Math.floor(j / 6) * 22 : 15);
    if (missing) {
      s.circle(
        "fit-row" + r.id,
        ...P("fit-row" + r.id, x, y),
        5,
        r.value == null ? paper : palette[r.train ? 0 : 1],
        {
          stroke: r.value == null ? palette[3] : palette[r.train ? 0 : 1],
          "stroke-width": 1.3,
        },
      );
    } else
      token(s, P, "fit-row" + r.id, x, y, r.value, palette[r.train ? 0 : 1]);
  });
  s.line(
    "fit-boundary",
    boundary,
    top - 7,
    boundary,
    top + 130,
    palette[1],
    1.3,
    "4 4",
  );
  const vx = s.w / 2,
    vy = top + 177,
    fit = missing ? d.fill : st.mode === "safe" ? d.safeMean : d.leakedMean;
  arrow(
    s,
    "train-learns",
    [boundary * 0.5, top + 99],
    [vx - 24, vy - 13],
    palette[0],
    2,
  );
  if (st.mode === "leaked")
    arrow(
      s,
      "holdout-leaks",
      [boundary + (s.w - boundary) / 2, top + 99],
      [vx + 24, vy - 13],
      palette[1],
      2.6,
    );
  s.rect("saved-transform", vx - 61, vy, 122, 64, palette[2] + "14", {
    stroke: palette[2],
    "stroke-width": 2,
    rx: 14,
  });
  s.text("saved-name", vx, vy + 23, "Saved mean", {
    "text-anchor": "middle",
    "font-size": 15,
  });
  s.text(
    "saved-number",
    vx,
    vy + 49,
    fit == null ? "Unavailable" : fmt(fit, 3),
    { "text-anchor": "middle", "font-size": 19, fill: palette[2] },
  );
  const stepLabels = [
    "Split first",
    "Fit on training rows",
    "Save the fitted value",
    "Apply the same transform",
    "Evaluate on untouched rows",
  ];
  caption(s, "local-step", st.step + 1 + ". " + stepLabels[st.step], vy + 105);
  if (st.step >= 3) {
    caption(
      s,
      "transform-result",
      missing
        ? "Missing entries receive the same saved mean."
        : "Held-out result: 100 − " + fmt(fit, 3) + " = " + fmt(100 - fit, 3),
      vy + 159,
    );
  } else
    caption(
      s,
      "fit-note",
      st.mode === "safe"
        ? "No arrow from held-out rows enters the fitted mean."
        : "The red arrow exposes the leak: holdout changes the fitted value.",
      vy + 159,
      st.mode === "safe" ? palette[0] : palette[1],
    );
}

function nested(s, P) {
  let y =
    caption(
      s,
      "story-title",
      "An outer holdout stays outside every inner choice.",
    ) + 24;
  s.text("nested-name", 14, y, "Inner folds: same 12 training rows", {
    "font-size": 14,
  });
  y += 23;
  const cw = (s.w - 36) / 12;
  for (let f = 0; f < 4; f++) {
    for (let i = 0; i < 12; i++) {
      const validation = Math.floor(i / 3) === f,
        x = 18 + i * cw,
        yy = y + f * 48;
      s.rect(
        "inner-fold" + f + "-" + i,
        x,
        yy,
        cw - 2,
        24,
        validation ? palette[2] + "55" : palette[0] + "40",
        { stroke: validation ? palette[2] : palette[0] + "77", rx: 2 },
      );
      s.text(
        "inner-id" + f + "-" + i,
        x + (cw - 2) / 2,
        yy + 17,
        String(i + 1),
        { "text-anchor": "middle", "font-size": 11 },
      );
    }
  }
  y += 207;
  caption(s, "fold-key", "Green: inner validation. Blue: fit again here.", y);
  y += 68;
  s.text("outer-name", 14, y, "6 outer holdout rows: untouched", {
    "font-size": 14,
  });
  for (let i = 0; i < 6; i++)
    token(
      s,
      P,
      "outer-row" + i,
      27 + (i * (s.w - 54)) / 5,
      y + 34,
      i + 13,
      palette[1],
    );
  caption(
    s,
    "nested-foot",
    "Split illustration: no model score is computed here.",
    y + 89,
  );
}

function missingCloud(s, P, st, d) {
  const end = caption(
    s,
    "story-title",
    "Missingness changes which observations we can see.",
  );
  const top = end + 48,
    a = frame(
      s,
      "mask-space",
      { x: 39, y: top, w: s.w - 64, h: 158 },
      [15, 60],
      [-0.3, 1.3],
      ["Known simulated value", ""],
      false,
    );
  [0, 1].forEach((g) => {
    s.text("observed-group" + g, 14, a.y(g) - 23, "Group " + g, {
      "font-size": 14,
    });
  });
  d.rows.forEach((r, i) => {
    const x = a.x(r.truth),
      y = a.y(r.group) + ((Math.floor(i / 2) % 3) - 1) * 12,
      hidden = r.value == null;
    s.circle(
      "missing-truth" + r.id,
      ...P("missing-truth" + r.id, x, y),
      5,
      hidden ? paper : palette[r.train ? 0 : 1],
      {
        stroke: hidden ? palette[3] : palette[r.train ? 0 : 1],
        "stroke-width": hidden ? 2 : 1,
      },
    );
    if (hidden) {
      s.line("mask-cross" + r.id, x - 3, y - 3, x + 3, y + 3, palette[3], 1.3);
      s.line("mask-cross2" + r.id, x - 3, y + 3, x + 3, y - 3, palette[3], 1.3);
    }
  });
  let y = top + 225;
  y = caption(
    s,
    "mask-assumption",
    st.mechanism === "mcar"
      ? "MCAR: all values have the same chance of being hidden."
      : st.mechanism === "mar"
        ? "MAR: group 1 is more likely to be hidden."
        : "MNAR: larger hidden values are more likely to be missing.",
    y,
  );
  caption(
    s,
    "mask-foot",
    "Hollow × = hidden from the analyst. Its true position is known only because this is a simulation.",
    y + 30,
  );
}

function schoolPupils(s, P, st, d) {
  let y =
    caption(
      s,
      "story-title",
      "Randomize schools. Pupils inside a school move together.",
    ) + 23;
  const cols = Math.max(2, Math.floor((s.w - 28) / 68)),
    cw = (s.w - 28) / cols;
  d.schools.forEach((school, i) => {
    const x = 14 + (i % cols) * cw,
      yy = y + Math.floor(i / cols) * 87,
      color = palette[school.treatment ? 0 : 1],
      sel = school.id === Math.min(st.selected, d.schools.length);
    s.path(
      "roof" + school.id,
      `M${x + 3},${yy + 16}L${x + cw / 2},${yy + 5}L${x + cw - 7},${yy + 16}`,
      color,
      1.5,
    );
    s.rect(
      "school-building" + school.id,
      x + 3,
      yy + 16,
      cw - 10,
      58,
      color + "09",
      {
        stroke: sel ? palette[3] : color,
        "stroke-width": sel ? 2.5 : 1,
        rx: 1,
      },
    );
    s.text(
      "school-name" + school.id,
      x + cw / 2 - 2,
      yy + 31,
      "S" + school.id,
      { "font-size": 12, "text-anchor": "middle", fill: color },
    );
    const pupilCols = 10;
    for (let j = 0; j < st.size; j++)
      s.circle(
        "pupil" + school.id + "-" + j,
        ...P(
          "pupil" + school.id + "-" + j,
          x + 9 + ((j % pupilCols) * (cw - 23)) / pupilCols,
          yy + 40 + Math.floor(j / pupilCols) * 6,
        ),
        1.8,
        color,
      );
  });
  y += Math.ceil(d.schools.length / cols) * 87 + 15;
  caption(
    s,
    "school-foot",
    "Each dot is one pupil. Each roof is one independently randomized school.",
    y,
  );
}

function designStory(s, P, scene, st, d) {
  if (scene === "assignment" || scene === "clusters")
    return schoolPupils(s, P, st, d);
  if (scene === "report") {
    const end = caption(
        s,
        "story-title",
        "Check the baseline balance produced by randomization.",
      ),
      top = end + 47;
    const a = frame(
      s,
      "balance",
      { x: 34, y: top, w: s.w - 65, h: 171 },
      [35, 75],
      [-0.4, 1.4],
      ["Baseline score", ""],
      false,
    );
    [false, true].forEach((t) => {
      const group = d.schools.filter((r) => r.treatment === t),
        m = mean(group.map((r) => r.baseline)),
        yy = a.y(+t),
        c = palette[t ? 0 : 1];
      s.text("balance-name" + t, 16, yy - 27, t ? "Treatment" : "Control", {
        "font-size": 14,
        fill: c,
      });
      s.line("balance-mean" + t, a.x(m), yy - 18, a.x(m), yy + 18, c, 2);
      group.forEach((r, j) =>
        s.circle(
          "balance-school" + r.id,
          ...P(
            "balance-school" + r.id,
            a.x(r.baseline),
            yy + ((j % 3) - 1) * 7,
          ),
          4,
          c,
        ),
      );
    });
    caption(
      s,
      "balance-result",
      "Treatment − control baseline mean = " + fmt(d.imbalance, 2),
      top + 237,
    );
    caption(
      s,
      "balance-foot",
      "These are pretreatment scores, not an estimated treatment effect.",
      top + 301,
    );
    return;
  }
  const threat = scene === "threats";
  let y =
    caption(
      s,
      "story-title",
      threat
        ? "Losing follow-up can change the group we observe."
        : scene === "estimand"
          ? "An effect compares two possible outcomes."
          : "Plan the comparison before outcomes are observed.",
    ) + 40;
  const centers = [s.w * 0.27, s.w * 0.73],
    names =
      scene === "estimand"
        ? ["Program", "Usual teaching"]
        : ["Treatment", "Control"];
  centers.forEach((x, j) => {
    s.text("design-group" + j, x, y, names[j], {
      "font-size": 14,
      "text-anchor": "middle",
      fill: palette[j],
    });
    for (let k = 0; k < 6; k++) {
      const px = x + ((k % 3) - 1) * 20,
        py = y + 35 + Math.floor(k / 3) * 34,
        lost = threat && (j === 0 ? k < 3 : k < 1);
      s.circle(
        "student-head" + j + k,
        ...P("student-head" + j + k, px, py),
        5,
        lost ? paper : palette[j],
        { stroke: palette[j], "stroke-width": 1.3 },
      );
      s.line(
        "student-body" + j + k,
        px,
        py + 7,
        px,
        py + 19,
        lost ? palette[j] + "44" : palette[j],
        2,
      );
      if (lost) {
        s.line(
          "lost-a" + j + k,
          px - 9,
          py - 9,
          px + 9,
          py + 21,
          palette[3],
          1.5,
        );
        s.line(
          "lost-b" + j + k,
          px + 9,
          py - 9,
          px - 9,
          py + 21,
          palette[3],
          1.5,
        );
      }
    }
    if (!threat) {
      arrow(s, "measure" + j, [x, y + 98], [x, y + 134], palette[j], 1.5);
      s.circle("outcome" + j, x, y + 162, 23, palette[j] + "12", {
        stroke: palette[j],
      });
      s.text("outcome-text" + j, x, y + 168, "?", {
        "font-size": 23,
        "text-anchor": "middle",
      });
    }
  });
  y += threat ? 151 : 221;
  y = caption(
    s,
    "design-meaning",
    threat
      ? "Crossed pupils have no measured follow-up. The observed sample is now selected."
      : scene === "estimand"
        ? "Two possible scenarios; one pupil can reveal only one. Randomization balances groups on average."
        : "Question marks are future outcomes. Save the outcome definition and analysis plan first.",
    y,
  );
  caption(
    s,
    "design-scope",
    "Illustration only; no treatment effect or attrition rate is estimated here.",
    y + 32,
  );
}

export function workflowScene(s, P, { scene, st, d, design, missing }) {
  s.svg.dataset.visual = design
    ? "school-comparison"
    : missing
      ? "missing-observations"
      : "data-boundary";
  if (design) return designStory(s, P, scene, st, d);
  if (missing && scene === "mechanism") return missingCloud(s, P, st, d);
  if (!missing && scene === "timing") return timing(s, P, st);
  if (!missing && scene === "means") return centering(s, P, st, d);
  if (!missing && scene === "nested") return nested(s, P);
  return splitTokens(s, P, st, d, missing);
}
