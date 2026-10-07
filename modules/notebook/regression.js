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
  host.innerHTML = `<div class="plot" id="regression-plot"></div><div class="legend"><span class="dot">Observed student</span><span id="trial-legend" style="--legend:${palette[1]}">Your line</span><span id="fit-legend">Least-squares fit</span><span id="mean-legend" style="--legend:#9a8747" hidden>Mean-only baseline</span></div>${stats(
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
      selected: "D",
      query: 3.5,
      squares: false,
    },
    stage = 0;
  let fitted, fittedKey;
  const getFit = () => {
    const key=JSON.stringify(state.points);
    if(key!==fittedKey){fitted=leastSquares(state.points);fittedKey=key;}
    return fitted;
  };
  document.getElementById("student").value = "D";
  function draw(view, moving = false) {
    if (!("m" in view)) return;
    const { m, b } = view,
      fit = getFit(),
      current = lineSummary(state.points, m, b),
      row = current.rows.find((p) => p.id === state.selected);
    surface.begin(310);
    const shownPredictions=stage>=1?current.rows.map(r=>r.predicted):[];
    if(stage===7)shownPredictions.push(m*state.query+b);
    const ymin = Math.min(35, ...state.points.map((p) => p.y - 10),...shownPredictions.map(y=>y-10)),
      ymax = Math.max(85, ...state.points.map((p) => p.y + 10),...shownPredictions.map(y=>y+10));
    const xmax=Math.max(6,...state.points.map(p=>p.x+1),...(stage===7?[state.query+1]:[]));
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
    if(showResidual&&(state.squares||stage===3)){
      const columns=Math.min(5,Math.max(2,Math.floor((surface.w-28)/120))),cell=(surface.w-28)/columns,maximum=Math.max(...current.rows.map(r=>Math.abs(r.residual))),scale=maximum?Math.min(65,cell-24)/maximum:0,top=400;
      surface.text('square-title',14,350,'Square each error, then add the values.',{'font-size':surface.w<350?13:17});
      current.rows.forEach((r,i)=>{
        const x=14+(i%columns)*cell,y=top+Math.floor(i/columns)*132,side=Math.abs(r.residual)*scale;
        surface.text('square-student'+r.id,x+cell/2,y,r.id,{'text-anchor':'middle','font-size':15});
        surface.rect('square-'+r.id,x+(cell-side)/2,y+15,side,side,palette[1]+'25',{stroke:palette[1],'stroke-width':1.3,rx:0});
        surface.text('square-value'+r.id,x+cell/2,y+104,`(${fmt(r.residual,1)})² ≈ ${fmt(r.residual*r.residual,1)}`,{'text-anchor':'middle','font-size':12});
      });
      const y=top+Math.ceil(current.rows.length/columns)*132+6;
      surface.text('square-scale',14,y,'Tiles share one scale within this view.',{'font-size':surface.w<350?13:15});
      surface.text('square-rounding',14,y+27,'≈ means about. Printed numbers are rounded.',{'font-size':surface.w<350?12:15});
      surface.text('square-sum',14,y+55,`Sum before rounding: SSE = ${fmt(current.sse,2)}.`,{'font-size':surface.w<350?12:15});
      surface.fitHeight(y+79);
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
    const scorecard = stage === 6;
    const metrics = scorecard
      ? [["trial-sse", "Fitted R²", fit.r2 == null ? "Undefined" : fmt(fit.r2, 3)],
         ["fit-sse", "Fitted error spread · RSE", fmt(fit.rse, 3)],
         ["reg-residual", "Mean-only squared error", fmt(fit.sst)]]
      : [["trial-sse", "Your line · SSE", fmt(current.sse)],
         ["fit-sse", "Best fit · SSE", fmt(fit.sse)],
         ["reg-residual", "Selected residual", fmt(row.residual)]];
    for (const [id, label, value] of metrics) {
      document.getElementById(id).previousElementSibling.textContent = label;
      setText(id, value);
    }
    setText("slope-value", fmt(state.m));
    setText("intercept-value", fmt(state.b));
    setText("query-value", fmt(state.query));
    const notice = !fit.valid
      ? "All x values match: no unique slope. Change a study-hour value."
      : stage === 7
        ? values.extrapolation
        : stage === 6
          ? "Gold dashed line: predict the same average for everyone. R² compares the blue fitted line with that baseline; RSE is its error spread in score points."
          : `Student ${row.id}: ${fmt(row.y)} − ${fmt(row.predicted)} = ${fmt(row.residual)}.`;
    setText("reg-notice", notice);
    document.getElementById("fit-line").disabled = !fit.valid;
    setText(
      "lab-caption",
      stage === 3
        ? "Every tile is complete and shares the same scale for this view. Labels are rounded for reading; SSE uses the original squared errors. Select a student to inspect its calculation."
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
      selected: "D",
      query: 3.5,
      squares: false,
    };
    syncControls();
    document.getElementById("query").value = 3.5;
    document.getElementById("student").value = "D";
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
      document.getElementById("squares").closest("label").hidden = i <= 3;
      document.getElementById("fit-line").hidden = i === 0;
      document.getElementById("trial-legend").hidden = i === 0;
      document.getElementById("fit-legend").hidden = i < 4;
      document.getElementById("mean-legend").hidden = i !== 6;
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
