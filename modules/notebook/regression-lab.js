import { penaltyScene, influenceScene } from './metric-scenes.js';
import {
  makeLab,
  fmt,
  palette,
  extent,
  linspace,
  plotLine,
  bars,
} from "./lab.js";
import {
  regressionData,
  splitRows,
  linearFit,
  polynomialBasis,
  mse,
  mean,
  variance,
  seeded,
  sum,
  normalCDF,
} from "./science.js";
import { componentDirections,componentStory,subsetStory,decompositionStory } from './regression-stories.js';
// Gaussian likelihood criteria require a maximum-likelihood candidate.
// Keep this OLS comparison independent of a penalty used in other sections.
export function gaussianOlsCriteria(rows, basis) {
  const fit = linearFit(rows, basis),
    rss = sum(rows.map((row) => (row.y - fit.predict(row)) ** 2)),
    n = rows.length,
    parameters = fit.coefficients.length + 1,
    likelihoodTerm = n * Math.log(rss / n);
  return {
    fit,
    rss,
    n,
    parameters,
    aic: likelihoodTerm + 2 * parameters,
    bic: likelihoodTerm + parameters * Math.log(n),
  };
}
export function create(host, slug) {
  const multiple = slug === "multiple-linear-regression",
    selection = slug === "model-selection",
    bias = slug === "bias-variance",
    diagnostic = slug === "regression-diagnostics";
  const initial = {
    degree: multiple ? 1 : 2,
    lambda: 0,
    penalty: "ridge",
    scenario: multiple ? "linear" : "curve",
    noise: 0.5,
    query: slug === "polynomial-regression" ? 1.5 : 0,
    slice: 0,
    selected: "R1",
    omit: "no",
    seed: 31,
    fold: 1,
    diagnostic: "residual",
  };
  const controls = [
    { key: "degree", label: "Polynomial degree", min: 1, max: 7, step: 1 },
    {
      key: "scenario",
      label: "Data-generating pattern",
      options: [
        ["curve", "Curved mean"],
        ["linear", "Linear mean with two inputs"],
        ["funnel", "Changing error spread"],
        ["outlier", "One unusual outcome"],
      ],
    },
    { key: "noise", label: "Noise SD", min: 0.1, max: 2, step: 0.1 },
    { key: "query", label: "Query x", min: -2.4, max: 2.4, step: 0.05 },
    {
      key: "slice",
      label: "Hold second input z at",
      min: -2,
      max: 2,
      step: 0.1,
    },
    {
      key: "selected",
      label: "Inspect training row",
      options: splitRows(regressionData()).train.map((r) => [r.id, r.id]),
    },
    ...(selection
      ? [
          {
            key: "penalty",
            label: "Penalty",
            options: [
              ["ridge", "Ridge"],
              ["lasso", "Lasso"],
            ],
          },
          {
            key: "lambda",
            label: "Penalty λ (raw basis units)",
            min: 0,
            max: 2,
            step: 0.02,
          },
        ]
      : []),
    ...(diagnostic
      ? [
          {
            key: "omit",
            label: "Sensitivity comparison",
            options: [
              ["no", "Keep every training row"],
              ["yes", "Temporarily omit selected row"],
            ],
          },
          {
            key: "diagnostic",
            label: "Residual view",
            options: [
              ["residual", "Residual vs fitted"],
              ["qq", "Normal Q–Q"],
              ["scale", "Scale-location"],
              ["leverage", "Leverage vs residual"],
            ],
          },
        ]
      : []),
    ...(bias || selection
      ? [
          {
            key: "fold",
            label: "Inspect development fold",
            min: 1,
            max: 5,
            step: 1,
          },
        ]
      : []),
  ];
  const L = makeLab(host, slug, initial, controls);
  let cacheKey = "",
    data;
  function compute() {
    const st = L.state,
      penalty=selection&&L.index===5?'ridge':selection&&L.index===6?'lasso':st.penalty,
      key = JSON.stringify([
        st.degree,
        st.lambda,
        penalty,
        st.scenario,
        st.noise,
        st.seed,
        st.omit,
        st.selected,
        st.fold,
      ]);
    if (key === cacheKey) return data;
    cacheKey = key;
    const all = regressionData(st.seed, st.scenario, st.noise),
      split = splitRows(all),
      train = split.train.filter(
        (r) => st.omit !== "yes" || r.id !== st.selected,
      ),
      basis = (r) => (multiple ? [1, r.x, r.z] : polynomialBasis(r, st.degree)),
      fit = linearFit(train, basis, st.lambda, penalty === "lasso"),
      baseline = mean(train.map((r) => r.y));
    const curve = Array.from({ length: 7 }, (_, i) => {
      const f = linearFit(
        train,
        (r) => (multiple ? [1, r.x, r.z] : polynomialBasis(r, i + 1)),
        st.lambda,
        penalty === "lasso",
      );
      return {
        degree: i + 1,
        train: mse(train, f.predict),
        validation: mse(split.validation, f.predict),
      };
    });
    const dev = [...split.train, ...split.validation].sort(
        (a, b) => +a.id.slice(1) - +b.id.slice(1),
      ),
      folds = Array.from({ length: 5 }, (_, i) => {
        const training = dev.filter((_, j) => j % 5 !== i),
          validation = dev.filter((_, j) => j % 5 === i),
          f = linearFit(training, basis, st.lambda, penalty === "lasso");
        return { train: training, validation, mse: mse(validation, f.predict) };
      });
    const rng = seeded(st.seed + 99),
      boot = Array.from(
        { length: train.length },
        () => train[Math.floor(rng() * train.length)],
      ),
      replicas = Array.from({ length: 20 }, (_, i) =>
        linearFit(
          splitRows(regressionData(200 + i, st.scenario, st.noise)).train,
          basis,
          st.lambda,
          penalty === "lasso",
        ),
      );
    return (data = {
      all,
      split,
      train,
      fit,
      penalty,
      baseline,
      curve,
      penaltyCurve: selection ? [...new Set([...Array.from({length:21},(_,i)=>i/10),st.lambda])].sort((a,b)=>a-b).map(lambda=>{const f=linearFit(train,basis,lambda,penalty==='lasso');return {lambda,train:mse(train,f.predict),validation:mse(split.validation,f.predict)};}) : null,
      influence: diagnostic ? {all:linearFit(split.train,basis),without:linearFit(split.train.filter(r=>r.id!==st.selected),basis)} : null,
      folds,
      boot,
      replicas,
      basis,
      criteria: selection ? gaussianOlsCriteria(train, basis) : null,
      components: selection ? componentDirections(train) : null,
      trainLoss: mse(train, fit.predict),
      valLoss: mse(split.validation, fit.predict),
    });
  }
  L.action("resample", "Draw a new dataset", () =>
    L.update({ seed: L.state.seed + 1 }),
  );
  L.surface.onAction = (id) => L.update({ selected: id });
  return L.init((animate = false) => {
    const d = compute(),
      st = L.state,
      scene = L.scene,
      row = d.split.train.find((r) => r.id === st.selected),
      query = { x: st.query, z: st.slice },
      prediction = d.fit.predict(query),
      selectedPrediction = d.fit.predict(row),
      residual = row.y - selectedPrediction;
    L.data = d;
    for(const control of controls){
      const hidden=scene==='subsets'?control.key!=='degree':scene==='components'?['degree','query','slice','fold','lambda','penalty'].includes(control.key):scene==='criteria'?['query','slice','selected','fold','lambda','penalty'].includes(control.key):scene==='decomposition'?['selected','fold'].includes(control.key):control.key==='fold'&&scene!=='folds';
      host.querySelector('#'+control.key).closest('label').hidden=hidden || (control.key==='slice'&&!multiple&&st.scenario!=='linear');
    }
    host.querySelector('#resample').hidden=scene==='subsets';
    L.metrics([
      ["Training MSE", fmt(d.trainLoss, 3)],
      ["Validation MSE", fmt(d.valLoss, 3)],
      ["Query prediction", fmt(prediction, 3)],
    ]);
    L.legend([
      ["Training", palette[0]],
      ["Validation", palette[1]],
      ["Fitted model", palette[2]],
    ]);
    let receipt = [
      ["Selected row", row.id],
      ["Inputs", "x " + fmt(row.x, 2) + ", z " + fmt(row.z, 2)],
      ["Actual / fitted", fmt(row.y, 3) + " / " + fmt(selectedPrediction, 3)],
      ["Residual", fmt(residual, 3)],
    ];
    let notice =
      "Computed synthetic example. 45 train, 15 validation; 15 final-test rows stay sealed. Curves show a slice at the selected z. Points retain their own z.";
    if (scene === "basis" || scene === "contributions")
      receipt = d
        .basis(query)
        .map((v, i) => [
          "Basis " + i,
          fmt(v, 3) +
            " × " +
            fmt(d.fit.coefficients?.[i], 3) +
            " = " +
            fmt(v * d.fit.coefficients?.[i], 3),
        ]);
    if (scene === "folds") {
      const f = d.folds[st.fold - 1];
      receipt = [
        ["Fold", st.fold + " of 5"],
        ["Training IDs", f.train.map((r) => r.id).join(", ")],
        ["Held-out IDs", f.validation.map((r) => r.id).join(", ")],
        ["Held-out MSE", fmt(f.mse, 3)],
      ];
      notice =
        "Five development folds are refitted from scratch. The final-test IDs are excluded from every fold.";
    }
    if (scene === "bootstrap")
      receipt = [
        ["Bootstrap rows", d.boot.map((r) => r.id).join(", ")],
        ["Distinct rows", new Set(d.boot.map((r) => r.id)).size],
        ["Draw count", d.boot.length],
      ];
    if (scene === "criteria") {
      const criteria = d.criteria;
      receipt = [
        ["Candidate", "Unpenalized degree-" + st.degree + " polynomial; " + criteria.n + " training rows"],
        ["OLS residual sum of squares", fmt(criteria.rss, 4)],
        ["AIC (common likelihood constant omitted)", fmt(criteria.aic, 2)],
        ["BIC (common likelihood constant omitted)", fmt(criteria.bic, 2)],
        ["Estimated parameters", criteria.parameters + ": regression coefficients including intercept, plus residual variance"],
        [
          "Conditions",
          "Gaussian equal-variance likelihood; compare the same response and rows. This separate OLS candidate does not use the penalty selected in other sections.",
        ],
      ];
      L.metrics([
        ["Unpenalized AIC", fmt(criteria.aic, 2)],
        ["Unpenalized BIC", fmt(criteria.bic, 2)],
        ["OLS training RSS", fmt(criteria.rss, 3)],
      ]);
      notice = "AIC and BIC use an unpenalized Gaussian maximum-likelihood candidate. Both count the estimated residual variance; the common n × [log(2π) + 1] term is omitted. Penalty choices from other sections do not change these criteria.";
    }
    if (selection)
      ["lambda", "penalty"].forEach((id) => {
        host.querySelector("#" + id).closest("label").hidden = ['criteria','components','subsets'].includes(scene) || (id==='penalty'&&[5,6].includes(L.index));
      });
    if(selection&&[5,6].includes(L.index))notice=`This section fits ${d.penalty==='ridge'?'Ridge (squared weights)':'Lasso (absolute weights)'} at λ=${fmt(st.lambda,2)}. At zero there is no penalty; increase λ to see shrinkage. The underlying rows and saved general-purpose penalty choice stay the same.`;
    if (scene === "subsets") {
      L.legend([["Included input column",palette[0]]]);
      L.metrics([['Optional input columns',st.degree],['Possible subsets',2**st.degree],['Scope','Combinations only']]);
      notice='Each row of boxes shows one choice of input columns. This illustration counts possible subsets; it does not fit or rank all subset models.';
      receipt = [
        ["Optional columns in this illustration",st.degree],
        ["Possible subsets",`2^${st.degree} = ${2**st.degree}`],
        [
          "This experiment",
          "Polynomial degrees 1–7 are nested candidates, not exhaustive subset search.",
        ],
      ];
    }
    if (scene === "components") {
      L.legend([["PCA: uses X spread",palette[0]],["PLS first direction: uses X and y",palette[3]]]);
      L.metrics([["Training rows",d.train.length],["PCA score variance",fmt(d.components.pcSummary.variance,3)],["PLS score–y covariance",d.components.plsSummary?fmt(d.components.plsSummary.covariance,3):"Undefined"]]);
      receipt = [
        ['Input columns','Centred raw x and x² from the training rows.'],
        ['PCA direction',d.components.pc.map(v=>fmt(v,4)).join(', ')],
        ['First PLS direction',d.components.pls?d.components.pls.map(v=>fmt(v,4)).join(', '):'Undefined: no input–output covariance'],
        ['Scope','Two direction rules, rather than a complete PCR or PLS prediction fit.'],
      ];
      notice='The blue direction keeps the most input spread. The gold direction maximizes score–output covariance for a unit-length direction. Both use the same centred training columns. This illustration does not compare final prediction performance.';
    }
    let breakdown=null;
    if (scene === "decomposition") {
      const preds = d.replicas.map((f) => f.predict(query)),
        truth =
          st.scenario === "linear"
            ? 1 + 1.5 * st.query + 0.8 * st.slice
            : st.scenario === "funnel"
              ? 1 + 1.5 * st.query
              : 1 + 0.6 * st.query + 0.85 * st.query ** 2;
      breakdown={x:st.query,predictions:preds,truth,average:mean(preds),bias2:(mean(preds)-truth)**2,variance:variance(preds,0),noise:st.noise**2*(st.scenario==="funnel"?(0.4+Math.abs(st.query))**2:1)};
      L.metrics([["Squared estimated bias",fmt(breakdown.bias2,4)],["Prediction variance",fmt(breakdown.variance,4)],["Noise variance",fmt(breakdown.noise,4)]]);
      L.legend([["Fitted prediction",palette[0]],["Average fitted prediction",palette[2]],["Known simulated mean",palette[3]]]);
      receipt = [
        [
          "Across 20 fixed synthetic training samples",
          "At x = " + fmt(st.query, 2),
        ],
        ["Squared estimated bias", fmt((mean(preds) - truth) ** 2, 4)],
        ["Prediction variance", fmt(variance(preds, 0), 4)],
        [
          "Noise variance",
          fmt(
            st.noise ** 2 *
              (st.scenario === "funnel" ? (0.4 + Math.abs(st.query)) ** 2 : 1),
            4,
          ),
        ],
      ];
      notice =
        "Monte Carlo illustration at a fixed x and z, using a known simulated mean. Twenty refits estimate bias and variance; no universal U-shape is imposed.";
    }
    if(selection&&L.index===7) {
      receipt=[['Fixed degree',st.degree],['Penalty',d.penalty],['Current λ',fmt(st.lambda,2)],['Training MSE',fmt(d.trainLoss,4)],['Validation MSE',fmt(d.valLoss,4)],['Comparison','Same training/validation rows across λ; no final-test rows.']];
      notice='This development holdout comparison varies penalty strength at a fixed degree. It is not a cross-validation selection or final evaluation.';
    }
    if(scene==='influence') {
      const a=d.influence.all.predict(query),b=d.influence.without.predict(query);
      receipt=[['Selected row',st.selected],['All-row query prediction',fmt(a,4)],['Without-row query prediction',fmt(b,4)],['Prediction change',fmt(b-a,4)],['Active fit',st.omit==='yes'?'Without selected row':'Every training row']];
      L.metrics([['All-row prediction',fmt(a,3)],['Without-row prediction',fmt(b,3)],['Change',fmt(b-a,3)]]);
      L.legend([['Every training row',palette[0]],['Without selected row: dashed',palette[1]],['Selected row / query',palette[3]]]);
      notice='Both fits use the same training source and degree. Temporarily omitting a row changes a fit; it does not delete the original observation.';
    }
    L.receipt(L.table(["Inspect", "Value"], receipt));
    L.note(notice);
    L.draw((s, P) => {
      const { w } = s.begin(310);
      if(selection&&L.index===7)penaltyScene(s,P,d,st);
      else if(scene==='influence')influenceScene(s,P,d,st);
      else if(scene==='decomposition')decompositionStory(s,breakdown);
      else if(scene==='subsets')subsetStory(s,st.degree);
      else if(scene==='components')componentStory(s,d.components,st.selected);
      else if(scene==='criteria') {
        const c=d.criteria,fitPart=c.aic-2*c.parameters;
        bars(s,P,[{label:'Fit term',value:fitPart},{label:'AIC penalty',value:2*c.parameters},{label:'AIC total',value:c.aic},{label:'BIC penalty',value:c.parameters*Math.log(c.n)},{label:'BIC total',value:c.bic}]);
      }
      else if (["coefficients", "contributions", "basis"].includes(scene)) {
        bars(
          s,
          P,
          d.fit.coefficients.map((v, i) => ({
            label: scene==='basis' ? (i===0 ? 'Constant 1' : `x^${i}`) : "β" + i,
            value:
              scene === "contributions"
                ? v * d.basis(query)[i]
                : scene === "basis"
                  ? d.basis(query)[i]
                  : v,
            color: palette[i % 6],
          })),
        );
      } else if (scene === "folds" || scene === "bootstrap") {
        const rows =
            scene === "bootstrap"
              ? d.boot
              : [
                  ...d.folds[st.fold - 1].train,
                  ...d.folds[st.fold - 1].validation,
                ],
          hold = new Set(d.folds[st.fold - 1].validation.map((r) => r.id)),
          cols = Math.max(5, Math.floor((w - 24) / 40));
        rows.forEach((r, i) => {
          const gap = Math.min(30, 250 / Math.ceil(rows.length / cols)),
            p = P(
              "tile" + i,
              16 + (i % cols) * ((w - 25) / cols),
              40 + Math.floor(i / cols) * gap,
            );
          s.rect(
            "tile" + i,
            p[0],
            p[1],
            (w - 35) / cols - 3,
            gap - 3,
            hold.has(r.id) && scene === "folds"
              ? palette[1] + "45"
              : palette[0] + "25",
          );
          s.text("tile-label" + i, p[0] + 4, p[1] + 16, r.id, {
            "font-size": 11,
          });
        });
        s.text(
          "tile-title",
          14,
          22,
          scene === "bootstrap"
            ? "Sampling with replacement"
            : "Blue trains · red validates",
          { "font-size": 15 },
        );
      } else if (scene === "scores") {
        const max =
            Math.max(...d.curve.flatMap((r) => [r.train, r.validation])) * 1.1,
          a = s.axes(
            [1, 7],
            [0, Math.max(0.1, max)],
            "Degree",
            "MSE",
            [1, 2, 3, 4, 5, 6, 7],
          );
        ["train", "validation"].forEach((k, j) =>
          plotLine(
            s,
            P,
            "curve" + k,
            d.curve.map((r) => [a.x(r.degree), a.y(r[k])]),
            palette[j],
          ),
        );
        s.line(
          "chosen",
          a.x(st.degree),
          a.t,
          a.x(st.degree),
          a.b,
          palette[2],
          2,
          "4 4",
        );
      } else if (["residuals", "influence", "diagnostic"].includes(scene)) {
        let points = (st.diagnostic === "leverage" && scene === "diagnostic" ? d.train : d.split.train).map((r) => ({
            ...r,
            fit: d.fit.predict(r),
            e: r.y - d.fit.predict(r),
          })),
          xLabel = "Fitted value",
          yLabel = "Residual";
        let xs = points.map((r) => r.fit),
          ys = points.map((r) => r.e);
        if (st.diagnostic === "qq" && scene === "diagnostic") {
          points.sort((a, b) => a.e - b.e);
          xs = points.map((_, i) => {
            let lo = -5,
              hi = 5;
            for (let j = 0; j < 45; j++) {
              const m = (lo + hi) / 2;
              if (normalCDF(m) < (i + 0.5) / points.length) lo = m;
              else hi = m;
            }
            return (lo + hi) / 2;
          });
          ys = points.map((r) => r.e);
          xLabel = "Normal quantile";
        } else if (st.diagnostic === "scale" && scene === "diagnostic") {
          ys = points.map((r) => Math.sqrt(Math.abs(r.e)));
          yLabel = "√ |residual|";
        } else if (st.diagnostic === "leverage" && scene === "diagnostic") {
          // h_ii equals the fitted value when y is an indicator for row i.
          xs = points.map((r, i) =>
            linearFit(
              d.train.map((v) => ({ ...v, y: v.id === r.id ? 1 : 0 })),
              d.basis,
            ).predict(r),
          );
          xLabel = "OLS leverage";
        }
        const a = s.axes(extent(xs), extent([...ys, 0]), xLabel, yLabel);
        s.line("zero", a.l, a.y(0), a.r, a.y(0), "#92988d", 1, "4 4");
        points.forEach((r, i) => {
          const p = P(r.id, a.x(xs[i]), a.y(ys[i]));
          s.mark(
            r.id,
            ...p,
            palette[0],
            r.id + " residual " + fmt(r.e, 3),
            r.id === st.selected,
            r.id,
          );
        });
      } else {
        const xx = linspace(-2.4, 2.4),
          yy = xx.map((x) => d.fit.predict({ x, z: st.slice })),
          domain = extent([
            ...d.split.train.map((r) => r.y),
            ...d.split.validation.map((r) => r.y),
            ...yy,
          ]),
          a = s.axes([-2.4, 2.4], domain, "Input x", "Outcome");
        if (["resamples", "decomposition"].includes(scene))
          d.replicas.slice(0, 10).forEach((f, j) =>
            plotLine(
              s,
              P,
              "replica" + j,
              xx.map((x) => [a.x(x), a.y(f.predict({ x, z: st.slice }))]),
              palette[0] + "35",
              1,
            ),
          );
        d.split.train.forEach((r) => {
          const p = P(r.id, a.x(r.x), a.y(r.y));
          s.mark(
            r.id,
            ...p,
            palette[0],
            r.id + " observed " + fmt(r.y, 2),
            r.id === st.selected,
            r.id,
          );
        });
        d.split.validation.forEach((r) =>
          s.circle(r.id, a.x(r.x), a.y(r.y), 3.5, palette[1]),
        );
        plotLine(
          s,
          P,
          "fitted",
          xx.map((x, i) => [a.x(x), a.y(yy[i])]),
          palette[2],
          2.5,
        );
        const q = P("query", a.x(st.query), a.y(prediction));
        s.circle("query", ...q, 7, palette[3], {
          stroke: "#fffef9",
          "stroke-width": 2,
        });
      }
      s.end(
        "Training and validation remain disjoint. " +
          receipt.map((r) => r.join(": ")).join(". "),
      );
    }, animate);
  });
}
