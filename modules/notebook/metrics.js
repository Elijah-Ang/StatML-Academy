import {frame} from "./spatial.js";
import {
  validationScores,
  confusion,
  rankingCurve,
  probabilityScores,
} from "./models.js";
import {
  Surface,
  Tween,
  bindings,
  fmt,
  pct,
  range,
  select,
  stats,
  setText,
  listenInput,
  palette,
  pathFrom,
  motionStatus,
  announce,
} from "./ui.js";
export function metrics(host) {
  host.innerHTML = `<div class="plot" id="metrics-plot"></div>${stats([
    ["metric-precision", "Precision"],
    ["metric-recall", "Recall"],
    ["metric-alerts", "Alerts / 1,000"],
  ])}<div class="lab-controls">${range("metric-threshold", "Decision threshold", 0, 1, 0.01, 0.5)}${select("metric-focus", "Highlight a denominator", [
    ["precision", "Precision · alerts"],
    ["recall", "Recall · positives"],
    ["accuracy", "Accuracy · everyone"],
    ["specificity", "Specificity · negatives"],
  ])}${select("metric-cell", "Inspect a matrix cell", [
    ["tp", "True positive"],
    ["fp", "False positive"],
    ["fn", "False negative"],
    ["tn", "True negative"],
  ])}</div><div class="inspection" id="metric-inspect"></div><div class="button-row"><button type="button" id="metric-next-case">Inspect next case →</button><button type="button" id="metric-reset-threshold">Threshold 0.50</button></div><details class="lab-options" id="metric-cost-options"><summary>Translate errors into costs</summary><div class="lab-controls">${range("fn-cost", "Cost per missed case", 0, 100, 1, 20)}${range("fp-cost", "Cost per false alarm", 0, 20, 1, 1)}</div><p class="lab-notice" id="metric-cost"></p></details>`;
  host.querySelector(".lab-controls").insertAdjacentHTML(
    "beforeend",
    select(
      "metric-bin",
      "Inspect calibration bin",
      Array.from({ length: 5 }, (_, i) => [
        i,
        `${i * 20}–${(i + 1) * 20}% scores`,
      ]),
    ),
  );
  const rows = validationScores(),
    ranking = rankingCurve(rows),
    probability = probabilityScores(rows);
  const surface = new Surface(
    document.getElementById("metrics-plot"),
    "Model evaluation notebook for the same 1000 fixed validation scores. Select matrix cells to inspect their predictions.",
  );
  const bind = bindings();
  let stage = 0;
  let state = {
    threshold: 0.5,
    view: "matrix",
    focus: "precision",
    cell: "tp",
    caseIndex: 0,
    fnCost: 20,
    fpCost: 1,
  };
  const current = () => confusion(rows, state.threshold);
  const filtered = () =>
    rows.filter(
      (r) =>
        (r.score >= state.threshold
          ? r.label
            ? "tp"
            : "fp"
          : r.label
            ? "fn"
            : "tn") === state.cell,
    );
  const cellNames = {
    tp: "True positive",
    fp: "False positive",
    fn: "False negative",
    tn: "True negative",
  };
  function draw(v, moving = false) {
    const c = current(),
      w = surface.begin(310).w;
    if (state.view === "matrix") {
      const left = 51,
        top = 55,
        gap = 8,
        cw = (w - left - 14 - gap) / 2,
        ch = 91;
      surface.text(
        "predicted-label",
        left + (w - left - 14) / 2,
        18,
        "Predicted decision",
        { "text-anchor": "middle", class: "axis-label" },
      );
      surface.text("alert-title", left + cw / 2, 43, "Alert +", {
        "text-anchor": "middle",
      });
      surface.text(
        "no-alert-title",
        left + cw + gap + cw / 2,
        43,
        "No alert −",
        { "text-anchor": "middle" },
      );
      surface.text("actual-positive", 7, 108, "True +", { "font-size": 13 });
      surface.text("actual-negative", 7, 211, "True −", { "font-size": 13 });
      const highlights = {
        precision: ["tp", "fp"],
        recall: ["tp", "fn"],
        accuracy: ["tp", "fp", "fn", "tn"],
        specificity: ["fp", "tn"],
      }[state.focus];
      const cells = [
        ["tp", 0, 0, palette[2]],
        ["fn", 1, 0, palette[1]],
        ["fp", 0, 1, palette[3]],
        ["tn", 1, 1, palette[0]],
      ];
      cells.forEach(([key, col, row, color]) => {
        const x = left + col * (cw + gap),
          y = top + row * (ch + gap),
          active = highlights.includes(key);
        const g = surface.node(`cell-${key}`, "g", {
          role: "button",
          tabindex: "0",
          "data-action": `cell:${key}`,
          "aria-label": `${cellNames[key]}: ${c[key]}. Select to inspect cases.`,
          "aria-pressed": state.cell === key,
        });
        surface.node(
          `cell-box-${key}`,
          "rect",
          {
            x,
            y,
            width: cw,
            height: ch,
            rx: 7,
            fill: active ? `${color}22` : "#f2f2eb",
            stroke: state.cell === key ? "#36463b" : active ? color : "#dadccf",
            "stroke-width": state.cell === key ? 2.5 : 1,
          },
          undefined,
          g,
        );
        surface.node(
          `cell-count-${key}`,
          "text",
          {
            x: x + cw / 2,
            y: y + 41,
            "text-anchor": "middle",
            style: "font-size:29px",
          },
          String(c[key]),
          g,
        );
        surface.node(
          `cell-name-${key}`,
          "text",
          {
            x: x + cw / 2,
            y: y + 69,
            "text-anchor": "middle",
            style: "font-size:14px",
          },
          key.toUpperCase(),
          g,
        );
      });
      surface.text(
        "denominator",
        left,
        280,
        `${state.focus[0].toUpperCase() + state.focus.slice(1)}: ${pct(c[state.focus])}`,
      );
      surface.text(
        "sample-size",
        left,
        304,
        "Actual positives: 100 · negatives: 900",
        { class: "axis-label" },
      );
    } else if (state.view === "roc") {
      surface.begin(465);
      [true, false].forEach((roc, i) => {
        const key=roc?"roc":"pr";
        const a=frame(surface,key,{x:48,y:38+i*229,w:surface.w-73,h:158},[0,1],[0,1],
          [roc?"False-positive rate":"Recall",roc?"ROC · recall":"Precision–recall · precision"]);
        if(roc)surface.line("roc-baseline",a.l,a.b,a.r,a.t,"#adb3a2",1.4,"5 5");
        else surface.line("pr-baseline",a.l,a.y(.1),a.r,a.y(.1),"#adb3a2",1.4,"5 5");
        const points=ranking.curve.filter(p=>roc||p.precision!=null).map(p=>[a.x(roc?p.fpr:p.recall),a.y(roc?p.recall:p.precision)]);
        surface.path(key+"-metric-curve",pathFrom(points),palette[0],2);
        if(roc||c.precision!=null){
          const x=a.x(roc?v.fpr:v.recall),y=a.y(roc?v.recall:v.precision);
          surface.circle(key+"-operating-halo",x,y,10,palette[1]+"22");
          surface.circle(key+"-operating-point",x,y,5,palette[1]);
        }
        if(!roc&&c.precision==null)surface.text("undefined-precision",a.l+5,a.t+22,"No alerts → precision undefined",{"font-size":13,fill:palette[1]});
      });
    } else {
      const a = surface.axes(
        [0, 1],
        [0, 1],
        "Mean predicted probability",
        "Observed positive fraction",
      );
      surface.line(
        "perfect-calibration",
        a.l,
        a.b,
        a.r,
        a.t,
        "#adb3a2",
        1.4,
        "5 5",
      );
      surface.path(
        "calibration-curve",
        pathFrom(
          probability.bins
            .filter((b) => b.n)
            .map((b) => [a.x(b.predicted), a.y(b.observed)]),
        ),
        palette[2],
        2,
      );
      probability.bins.forEach((b, i) => {
        if (!b.n) return;
        surface.mark(
          `bin-${i}`,
          a.x(b.predicted),
          a.y(b.observed),
          palette[2],
          `Bin ${i + 1}, ${b.n} cases. Mean prediction ${pct(b.predicted)}, observed positive fraction ${pct(b.observed)}.`,
          (state.bin ?? 0) === i,
          `bin:${i}`,
        );
        surface.text(
          `bin-count-${i}`,
          a.x(b.predicted),
          Math.max(a.t + 15, a.y(b.observed) - 13),
          `n=${b.n}`,
          { "text-anchor": "middle", class: "data-label" },
        );
      });
    }
    const cost = c.fn * state.fnCost + c.fp * state.fpCost;
    const precisionReceipt = c.alerts
      ? `${c.tp} / ${c.alerts} = ${pct(c.precision)}`
      : "0 / 0 → undefined (no alerts)";
    Object.entries({
      counts: `TP ${c.tp} · FN ${c.fn} · FP ${c.fp} · TN ${c.tn}`,
      "accuracy-receipt": `(${c.tp} + ${c.tn}) / 1000 = ${pct(c.accuracy)}`,
      "precision-receipt": precisionReceipt,
      "recall-receipt": `${c.tp} / 100 = ${pct(c.recall)}`,
      threshold: fmt(state.threshold, 2),
      alerts: c.alerts,
      "fn-cost": state.fnCost,
      "fp-cost": state.fpCost,
      cost: fmt(cost, 0),
      brier: fmt(probability.brier, 4),
      "log-loss": fmt(probability.logLoss, 4),
    }).forEach(([k, v]) => bind(k, v));
    setText("metric-precision", pct(c.precision));
    setText("metric-recall", pct(c.recall));
    setText("metric-alerts", c.alerts);
    setText("metric-threshold-value", fmt(state.threshold, 2));
    setText("fn-cost-value", state.fnCost);
    setText("fp-cost-value", state.fpCost);
    setText(
      "metric-cost",
      `${c.fn} misses × ${state.fnCost} + ${c.fp} false alarms × ${state.fpCost} = ${fmt(cost, 0)} cost units.`,
    );
    const candidates = filtered(),
      selected = candidates[state.caseIndex % candidates.length];
    document.getElementById("metric-next-case").disabled =
      candidates.length < 2;
    if (!state.inspectedBin)
      setText(
        "metric-inspect",
        selected
          ? `${cellNames[state.cell]} · ${selected.id}: score ${fmt(selected.score, 3)}, actual ${selected.label ? "positive" : "negative"}, decision ${selected.score >= state.threshold ? "alert" : "no alert"}.`
          : `${cellNames[state.cell]}: no cases at this threshold.`,
      );
    const calibration = state.view === "calibration",
      matrix = state.view === "matrix";
    document.getElementById("metric-threshold").closest("label").hidden =
      calibration;
    document.getElementById("metric-focus").closest("label").hidden = !matrix;
    document.getElementById("metric-cell").closest("label").hidden = !matrix;
    document.getElementById("metric-bin").closest("label").hidden =
      !calibration;
    document.getElementById("metric-next-case").hidden = !matrix;
    document
      .getElementById("metric-reset-threshold")
      .closest(".button-row").hidden = calibration;
    document.getElementById("metric-cost-options").hidden = calibration;
    document.getElementById(
      "metric-precision",
    ).previousElementSibling.textContent = calibration
      ? "Brier score"
      : "Precision";
    document.getElementById(
      "metric-recall",
    ).previousElementSibling.textContent = calibration ? "Log loss" : "Recall";
    document.getElementById(
      "metric-alerts",
    ).previousElementSibling.textContent = calibration
      ? "Scored cases"
      : "Alerts / 1,000";
    if (calibration) {
      const index = state.bin ?? 0,
        b = probability.bins[index];
      document.getElementById("metric-bin").value = index;
      setText("metric-precision", fmt(probability.brier, 4));
      setText("metric-recall", fmt(probability.logLoss, 4));
      setText("metric-alerts", rows.length);
      setText(
        "metric-inspect",
        `Bin ${index + 1}: ${b.n} cases. Mean probability ${pct(b.predicted)}; observed positives ${pct(b.observed)}.`,
      );
    } else if (!matrix)
      setText(
        "metric-inspect",
        `Threshold ${fmt(state.threshold, 2)}: recall ${pct(c.recall)}, false-positive rate ${pct(c.fpr)}, precision ${pct(c.precision)}.`,
      );
    const captions = {
      matrix:
        "Every cell counts the same fixed validation predictions. Select a cell or use the inspector; the shaded cells form the selected denominator.",
      roc: `ROC-AUC = ${fmt(ranking.auc, 3)}. The red dot uses the chosen threshold. Diagonal = chance ranking. Scores remain fixed.`,
      pr: "Red dot = current decision rule. Dashed line = 10% prevalence. Precision is undefined if no cases are flagged.",
      calibration:
        "Five fixed-width score bins. Labels show sample sizes. Dashed line = perfect agreement. Threshold changes do not alter probability calibration.",
    };
    setText("lab-caption", captions[state.view]);
    surface.end(
      `Threshold ${fmt(state.threshold, 2)}. TP ${c.tp}, FN ${c.fn}, FP ${c.fp}, TN ${c.tn}. Precision ${pct(c.precision)}, recall ${pct(c.recall)}. Fixed validation sample of 1000.`,
    );
    motionStatus(moving, "Moving to the selected operating point…");
  }
  const tween = new Tween(draw);
  const update = (animate = false) => {
    const c = current();
    tween.to(
      { fpr: c.fpr, recall: c.recall, precision: c.precision ?? 0 },
      animate,
    );
  };
  const inspectCell = (cell) => {
    state.cell = cell;
    state.caseIndex = 0;
    state.inspectedBin = false;
    document.getElementById("metric-cell").value = cell;
    update();
    announce(document.getElementById("metric-inspect").textContent);
  };
  surface.onAction = (action) => {
    const [kind, value] = action.split(":");
    if (kind === "cell") inspectCell(value);
    if (kind === "bin") {
      state.bin = +value;
      update();
      announce(document.getElementById("metric-inspect").textContent);
    }
  };
  listenInput("metric-bin", (value) => surface.onAction(`bin:${value}`));
  listenInput("metric-threshold", (v) => {
    state.threshold = +v;
    state.caseIndex = 0;
    state.inspectedBin = false;
    update();
  });
  listenInput("metric-focus", (v) => {
    state.focus = v;
    update();
  });
  listenInput("metric-cell", inspectCell);
  listenInput("fn-cost", (v) => {
    state.fnCost = +v;
    update();
  });
  listenInput("fp-cost", (v) => {
    state.fpCost = +v;
    update();
  });
  document.getElementById("metric-next-case").onclick = () => {
    state.caseIndex++;
    state.inspectedBin = false;
    update();
    announce(document.getElementById("metric-inspect").textContent);
  };
  document.getElementById("metric-reset-threshold").onclick = () => {
    state.threshold = 0.5;
    document.getElementById("metric-threshold").value = 0.5;
    state.inspectedBin = false;
    update(true);
  };
  function reset() {
    state = {
      threshold: 0.5,
      view: stage === 3 ? "roc" : stage === 7 ? "calibration" : "matrix",
      focus: "precision",
      cell: "tp",
      caseIndex: 0,
      fnCost: 20,
      fpCost: 1,
    };
    document.getElementById("metric-threshold").value = 0.5;
    document.getElementById("metric-focus").value = "precision";
    document.getElementById("metric-cell").value = "tp";
    document.getElementById("fn-cost").value = 20;
    document.getElementById("fp-cost").value = 1;
    update(true);
    announce(
      "Threshold and costs restored. The validation predictions remain fixed.",
    );
  }
  update();
  return {
    stage(i) {
      stage = i;
      state.view = i === 3 ? "roc" : i === 7 ? "calibration" : "matrix";
      state.inspectedBin = false;
      if (i === 4) document.getElementById("metric-cost-options").open = true;
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
      return { ...state, counts: current() };
    },
    get rows() {
      return structuredClone(rows);
    },
    get probability() {
      return probability;
    },
    get ranking() {
      return ranking;
    },
    tween,
  };
}
