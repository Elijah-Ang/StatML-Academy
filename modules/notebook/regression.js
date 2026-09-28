import {
  initialRegression,
  leastSquares,
  lineSummary,
  clamp,
} from "./models.js";
import {
  Surface,
  Tween,
  bindings,
  fmt,
  range,
  select,
  stats,
  setText,
  listenInput,
  palette,
  motionStatus,
  announce,
} from "./ui.js";
export function regression(host) {
  host.innerHTML = `<div class="plot" id="regression-plot"></div><div class="legend"><span class="dot">Observed student</span><span id="trial-legend" style="--legend:${palette[1]}">Your line</span><span id="fit-legend">Least-squares fit</span></div>${stats(
    [
      ["trial-sse", "Your line · SSE"],
      ["fit-sse", "Best fit · SSE"],
      ["reg-residual", "Selected residual"],
    ],
  )}<div class="lab-controls">${range("slope", "Slope m", -5, 15, 0.1, 7)}${range("intercept", "Intercept b", 0, 80, 0.1, 40)}${select(
    "student",
    "Inspect student",
    "ABCDE".split("").map((id) => [id, id]),
  )}${range("query", "Predict at x", 0, 10, 0.1, 3.5)}</div><div class="button-row"><button type="button" class="primary" id="fit-line">Fit line</button><label><input id="squares" type="checkbox">Squared errors</label></div><p class="lab-notice" id="reg-notice"></p>`;
  const surface = new Surface(
    document.getElementById("regression-plot"),
    "Editable regression scatterplot. Select a student to inspect the vertical residual.",
  );
  const bind = bindings();
  let state = {
      points: initialRegression(),
      m: 7,
      b: 40,
      selected: "C",
      query: 3.5,
      squares: false,
    },
    stage = 0;
  const getFit = () => leastSquares(state.points);
  document.getElementById("student").value = "C";
  function draw(view, moving = false) {
    if (!("m" in view)) return;
    const { m, b } = view,
      fit = getFit(),
      current = lineSummary(state.points, m, b),
      row = current.rows.find((p) => p.id === state.selected);
    surface.begin(310);
    const ymin = Math.min(35, ...state.points.map((p) => p.y - 10)),
      ymax = Math.max(85, ...state.points.map((p) => p.y + 10));
    const xmax =
      stage === 7
        ? Math.max(6, state.query + 1)
        : Math.max(6, ...state.points.map((p) => p.x + 1));
    const a = surface.axes(
      [0, xmax],
      [ymin, ymax],
      "Study hours",
      "Exam score",
    );
    function line(key, slope, intercept, color, width, dash) {
      const candidates = [
        { x: 0, y: intercept },
        { x: xmax, y: slope * xmax + intercept },
      ];
      if (Math.abs(slope) > 1e-10)
        candidates.push(
          { x: (ymin - intercept) / slope, y: ymin },
          { x: (ymax - intercept) / slope, y: ymax },
        );
      const valid = candidates
        .filter(
          (p) =>
            p.x >= -1e-8 &&
            p.x <= xmax + 1e-8 &&
            p.y >= ymin - 1e-8 &&
            p.y <= ymax + 1e-8,
        )
        .sort((p, q) => p.x - q.x);
      if (valid.length >= 2)
        surface.line(
          key,
          a.x(valid[0].x),
          a.y(valid[0].y),
          a.x(valid.at(-1).x),
          a.y(valid.at(-1).y),
          color,
          width,
          dash,
        );
    }
    const showResidual = stage >= 2;
    if (stage >= 1) line("trial-line", m, b, palette[1], 2.8);
    if (stage >= 4 && fit.valid)
      line("fit-line", fit.m, fit.b, palette[0], 2.2, "6 5");
    if (stage === 6)
      surface.line(
        "mean-line",
        a.l,
        a.y(fit.my),
        a.r,
        a.y(fit.my),
        "#9a8747",
        1.5,
        "4 5",
      );
    current.rows.forEach((p) => {
      const px = a.x(p.x),
        py = a.y(p.y),
        pred = clamp(a.y(p.predicted), a.t, a.b);
      if (showResidual) {
        if (state.squares || stage === 3) {
          const rawPrediction = a.y(p.predicted);
          const side = Math.abs(py - rawPrediction);
          const top = Math.max(a.t, Math.min(py, rawPrediction));
          const bottom = Math.min(a.b, Math.max(py, rawPrediction));
          surface.rect(
            `square-${p.id}`,
            px,
            top,
            Math.min(side, a.r - px),
            bottom - top,
            `${palette[1]}15`,
            { stroke: `${palette[1]}55` },
          );
        }
        surface.line(
          `residual-${p.id}`,
          px,
          py,
          px,
          pred,
          palette[1],
          p.id === state.selected ? 2.8 : 1.3,
          "3 4",
        );
        surface.circle(`prediction-${p.id}`, px, pred, 3, palette[1]);
      }
      surface.mark(
        `point-${p.id}`,
        px,
        py,
        "#303b38",
        `Student ${p.id}: ${fmt(p.x)} hours, score ${fmt(p.y)}. Residual ${fmt(p.residual)}.`,
        p.id === state.selected,
        p.id,
      );
      surface.text(`point-label-${p.id}`, px + 11, py - 11, p.id, {
        class: "data-label",
      });
    });
    if (stage === 7) {
      const xp = a.x(state.query),
        yp = clamp(a.y(m * state.query + b), a.t, a.b);
      surface.line("query-guide", xp, a.b, xp, a.t, "#a09b71", 1.5, "3 5");
      surface.circle("query-dot", xp, yp, 6, palette[1]);
    }
    surface.end(
      `Five students. Your equation has slope ${fmt(m)} and intercept ${fmt(b)}. SSE ${fmt(current.sse)}. Selected ${row.id}, actual ${row.y}, predicted ${fmt(row.predicted)}, residual ${fmt(row.residual)}.`,
    );
    const equation = `ŷ = ${fmt(b)} ${m < 0 ? "−" : "+"} ${fmt(Math.abs(m))}x`;
    const fitEquation = fit.valid
      ? `ŷ = ${fmt(fit.b, 2)} ${fit.m < 0 ? "−" : "+"} ${fmt(Math.abs(fit.m), 2)}x`
      : "No unique line: x does not vary";
    const values = {
      equation,
      sse: fmt(current.sse),
      mae: fmt(current.mae),
      student: row.id,
      actual: fmt(row.y),
      predicted: fmt(row.predicted),
      residual: fmt(row.residual),
      means: `${fmt(fit.mx)}, ${fmt(fit.my)}`,
      xy: fmt(fit.xy),
      xx: fmt(fit.xx),
      "fit-slope": fmt(fit.m, 2),
      "fit-intercept": fmt(fit.b, 2),
      "best-sse": fmt(fit.sse),
      "fit-equation": fitEquation,
      sst: fmt(fit.sst),
      r2: fit.r2 == null ? "Undefined" : fmt(fit.r2, 3),
      rse: fmt(fit.rse, 3),
      "query-x": fmt(state.query),
      "query-trial": fmt(m * state.query + b),
      "query-fit": fit.valid
        ? fmt(fit.m * state.query + fit.b, 2)
        : "Not identifiable",
    };
    const min = Math.min(...state.points.map((p) => p.x)),
      max = Math.max(...state.points.map((p) => p.x));
    values.extrapolation = `${fmt(state.query)} hours is ${state.query < min || state.query > max ? "outside" : "inside"} the observed range ${fmt(min)}–${fmt(max)} hours.${state.query < min || state.query > max ? " This is extrapolation." : ""}`;
    Object.entries(values).forEach(([k, v]) => bind(k, v));
    setText("trial-sse", fmt(current.sse));
    setText("fit-sse", fmt(fit.sse));
    setText("reg-residual", fmt(row.residual));
    setText("slope-value", fmt(state.m));
    setText("intercept-value", fmt(state.b));
    setText("query-value", fmt(state.query));
    const notice = !fit.valid
      ? "All x values match: no unique slope. Change a study-hour value."
      : stage === 7
        ? values.extrapolation
        : stage === 6
          ? "The dashed mean line is the SST baseline. R² here describes training fit."
          : `Student ${row.id}: ${fmt(row.y)} − ${fmt(row.predicted)} = ${fmt(row.residual)}.`;
    setText("reg-notice", notice);
    document.getElementById("fit-line").disabled = !fit.valid;
    setText(
      "lab-caption",
      stage === 3
        ? "Error-tile area represents squared residual size; tiles are clipped at the plot edge. Select a student to inspect the exact value."
        : stage === 0
          ? "Edit the table or select a dot. These are the same five observations throughout the lesson."
          : "The dots, equation and calculation receipts use the same live data. Select a dot with a click, Enter, or the student selector.",
    );
    motionStatus(
      moving,
      "Moving the line; displayed errors follow its current position…",
    );
  }
  const tween = new Tween(draw);
  const update = (animate = false) =>
    tween.to({ m: state.m, b: state.b }, animate);
  const choose = (id) => {
    state.selected = id;
    document.getElementById("student").value = id;
    update();
    announce(`Selected student ${id}.`);
  };
  surface.onAction = choose;
  listenInput("student", choose);
  listenInput("slope", (v) => {
    state.m = +v;
    update();
  });
  listenInput("intercept", (v) => {
    state.b = +v;
    update();
  });
  listenInput("query", (v) => {
    state.query = +v;
    update();
  });
  listenInput("squares", () => {
    state.squares = document.getElementById("squares").checked;
    update();
  });
  document.getElementById("fit-line").onclick = () => {
    const fit = getFit();
    if (!fit.valid) return;
    state.m = fit.m;
    state.b = fit.b;
    syncControls();
    update(true);
    announce(
      `Fitted line. Slope ${fmt(fit.m, 2)}, intercept ${fmt(fit.b, 2)}, SSE ${fmt(fit.sse)}.`,
    );
  };
  document.querySelectorAll("[data-point]").forEach((input) =>
    input.addEventListener("input", () => {
      const value = input.valueAsNumber,
        valid =
          Number.isFinite(value) && value >= +input.min && value <= +input.max;
      input.setAttribute("aria-invalid", String(!valid));
      if (!valid) {
        input.setCustomValidity(
          `Enter a value from ${input.min} to ${input.max}.`,
        );
        return;
      }
      input.setCustomValidity("");
      state.points = state.points.map((p) =>
        p.id === input.dataset.point
          ? { ...p, [input.dataset.field]: value }
          : p,
      );
      state.selected = input.dataset.point;
      document.getElementById("student").value = state.selected;
      update();
    }),
  );
  function syncControls() {
    for (const key of ["slope", "intercept"]) {
      const n = document.getElementById(key),
        v = key === "slope" ? state.m : state.b;
      n.min = Math.min(key === "slope" ? -5 : 0, v);
      n.max = Math.max(key === "slope" ? 15 : 80, v);
      n.value = v;
    }
  }
  function reset() {
    state = {
      points: initialRegression(),
      m: 7,
      b: 40,
      selected: "C",
      query: 3.5,
      squares: false,
    };
    syncControls();
    document.getElementById("query").value = 3.5;
    document.getElementById("student").value = "C";
    document.getElementById("squares").checked = false;
    document.querySelectorAll("[data-point]").forEach((n) => {
      n.value = state.points.find((p) => p.id === n.dataset.point)[
        n.dataset.field
      ];
      n.removeAttribute("aria-invalid");
      n.setCustomValidity("");
    });
    update(true);
    announce("Restored the original five students and trial line.");
  }
  update();
  return {
    stage(i) {
      stage = i;
      document.getElementById("slope").closest("label").hidden = i === 0;
      document.getElementById("intercept").closest("label").hidden = i === 0;
      document.getElementById("query").closest("label").hidden = i !== 7;
      document.getElementById("squares").closest("label").hidden = i < 3;
      document.getElementById("fit-line").hidden = i === 0;
      document.getElementById("trial-legend").hidden = i === 0;
      document.getElementById("fit-legend").hidden = i < 4;
      host.querySelector(".lab-stats").hidden = i === 0;
      update();
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
    get fit() {
      return getFit();
    },
    tween,
  };
}
