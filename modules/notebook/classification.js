import { illustrativeCounts } from './decision-counts.js';
import { visualRevision } from './visual-revisions.js';
import { oneRStudy, oneRDetails, oneRScene } from './one-r-scenes.js';
import { imbalanceScene, knnDistanceScene } from './metric-scenes.js';
import { logisticRegions } from "./logistic-geometry.js";
import { knnCrossValidation,linearScoreContours,gridScoreContours,oddsStory,oneRuleStory,scalingStory,contributionsStory,probabilityShapesStory,appendLogisticDecisionField } from './classification-stories.js';
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
  splitRows,
  logisticFit,
  knnFit,
  discriminantFit,
  oneRuleFit,
  svmFit,
  sigmoid,
  mean,
  sum,
  logLoss,
  clamp,
} from "./science.js";
import { caption, frame, line, dot, paper, grid } from "./spatial.js";
const matrix = (rows, predict, threshold) => {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  rows.forEach(
    (r) =>
      c[
        r.y
          ? predict(r) >= threshold
            ? "tp"
            : "fn"
          : predict(r) >= threshold
            ? "fp"
            : "tn"
      ]++,
  );
  return c;
};
// A complete visual receipt, including the model's exact-match convention.
// Zero-weight selected neighbours stay visible so no member of K disappears.
export function knnVoteReceipt(fit, query, weighted = false) {
  const neighbors = fit.neighbors(query),
    exact = neighbors.filter((row) => row.distance < 1e-10),
    raw = neighbors.map((row) =>
      exact.length ? +(row.distance < 1e-10) : weighted ? 1 / row.distance : 1,
    ),
    total = sum(raw),
    rows = neighbors.map((row, i) => ({
      ...row,
      weight: raw[i] / total,
      contribution: row.y * raw[i] / total,
    }));
  return {
    rows,
    exactMatches: exact.length,
    classOne: sum(rows.map((row) => row.contribution)),
    classZero: sum(rows.map((row) => (1 - row.y) * row.weight)),
  };
}

// Cholesky maps the unit circle to points satisfying (x−μ)'Σ⁻¹(x−μ)=r².
export function covarianceContour(estimate, radius = 1, count = 65) {
  const l11 = Math.sqrt(estimate.xx),
    l21 = estimate.xz / l11,
    l22 = Math.sqrt(estimate.zz - l21 * l21);
  return Array.from({ length: count }, (_, i) => {
    const angle = 2 * Math.PI * i / (count - 1);
    return {
      x: estimate.mx + radius * l11 * Math.cos(angle),
      z: estimate.mz + radius * (l21 * Math.cos(angle) + l22 * Math.sin(angle)),
    };
  });
}
export function squaredMahalanobis(estimate, point) {
  const x = point.x - estimate.mx, z = point.z - estimate.mz;
  return (estimate.zz * x * x - 2 * estimate.xz * x * z + estimate.xx * z * z) / estimate.det;
}
function drawCovariance(s, P, data, query, separate, radius) {
  s.begin(740);
  s.svg.dataset.visual = separate ? "qda-covariance-shapes" : "lda-shared-covariance";
  const estimates = data.fit.estimates,
    contours = estimates.map((e) => covarianceContour(e, radius)),
    centered = contours.map((points, j) => points.map((p) => ({ x: p.x - estimates[j].mx, z: p.z - estimates[j].mz }))),
    all = [...data.split.train, query, ...contours.flat(), ...centered.flat()],
    limit = Math.max(2.5, ...all.flatMap((p) => [Math.abs(p.x), Math.abs(p.z)])) * 1.1,
    domain = [-limit, limit];
  let y = caption(s, "covariance-title", separate ? "Each class can have its own spread and tilt." : "Different centers. One shared spread and tilt.");
  y = caption(s, "covariance-guide", "Dots are training rows. Hollow circles are fitted centers.", y + 7);
  const a = frame(s, "class-space", { x: 44, y: y + 26, w: s.w - 74, h: 185 }, domain, domain, ["", "Input z"]);
  s.text("class-space-x-name", (a.l + a.r) / 2, a.b + 43, "Input x", { "text-anchor": "middle", "font-size": 14 });
  data.split.train.forEach((r) => dot(s, P, "covariance-point-" + r.id, a.x(r.x), a.y(r.z), r.y));
  estimates.forEach((e, j) => {
    line(s, P, "class-contour-" + j, contours[j].map((p) => [a.x(p.x), a.y(p.z)]), palette[j], 2.4, j ? "5 3" : null);
    line(s, P, "query-distance-" + j, [[a.x(e.mx), a.y(e.mz)], [a.x(query.x), a.y(query.z)]], palette[j], 1.2, "3 4");
    s.circle("class-center-" + j, ...P("class-center-" + j, a.x(e.mx), a.y(e.mz)), 5, paper, { stroke: palette[j], "stroke-width": 2.3 });
  });
  s.circle("covariance-query", ...P("covariance-query", a.x(query.x), a.y(query.z)), 6, palette[3], { stroke: paper, "stroke-width": 1.5 });
  y = caption(s, "covariance-radius", `Contour radius ${fmt(radius, 1)} in Mahalanobis distance.`, a.b + 75);
  y = caption(s, "covariance-centered-title", "Slide both centers to zero. Compare only their shapes.", y + 8);
  const b = frame(s, "centered-shapes", { x: 44, y: y + 26, w: s.w - 74, h: 185 }, domain, domain, ["", "Displacement in z"]);
  s.text("centered-shapes-x-name", (b.l + b.r) / 2, b.b + 43, "Displacement in x", { "text-anchor": "middle", "font-size": 14 });
  s.line("centered-zero-x", b.x(0), b.t, b.x(0), b.b, grid, 1.2, "3 3");
  s.line("centered-zero-z", b.l, b.y(0), b.r, b.y(0), grid, 1.2, "3 3");
  centered.forEach((points, j) => line(s, P, "centered-contour-" + j, points.map((p) => [b.x(p.x), b.y(p.z)]), palette[j], 2.7, j ? "5 3" : null));
  s.circle("shared-origin", b.x(0), b.y(0), 4, "#344a48");
  y = caption(s, "covariance-comparison", separate ? "More pooling pulls both shapes toward the same estimate." : "The blue solid and red dashed contours coincide.", b.b + 75);
  y = caption(s, "covariance-query-distance", `Gold query: distance ${fmt(Math.sqrt(squaredMahalanobis(estimates[0], query)), 2)} to class 0; ${fmt(Math.sqrt(squaredMahalanobis(estimates[1], query)), 2)} to class 1.`, y + 5);
  caption(s, "covariance-scope", "These are shape contours, not confidence intervals. Class scores also use priors and spread.", y + 5);
}

function drawNeighborVotes(s, P, votes, weighted, threshold) {
  const columns = s.w < 390 ? 3 : 6,
    cardWidth = (s.w - 28) / columns,
    rows = Math.ceil(votes.rows.length / columns),
    start = 224,
    height = start + rows * 77 + 29;
  s.begin(height);
  s.svg.dataset.visual = "knn-complete-vote";
  s.text("vote-title", 14, 23, `All ${votes.rows.length} neighbors share one vote.`, {
    "font-size": 16,
  });
  s.text("vote-rule", 14, 47,
    votes.exactMatches
      ? "Exact matches vote; the others get zero weight."
      : weighted ? "Nearer neighbors receive more weight." : "Every neighbor receives the same weight.",
    { "font-size": s.w < 330 ? 12 : 14 },
  );
  const left = 16, width = s.w - 32, top = 89;
  let accumulated = 0;
  votes.rows.forEach((row) => {
    const x = left + accumulated * width,
      endpoint = P("vote-share-" + row.id, left + (accumulated + row.weight) * width, top);
    s.rect("vote-share-" + row.id, x, top, Math.max(0, endpoint[0] - x), 27,
      palette[row.y] + "90", { stroke: "#fffdf5", "stroke-width": 1, rx: 0 });
    accumulated += row.weight;
  });
  s.text("vote-strip-key", left, 76, "One segment = one neighbor's share", { "font-size": 13 });
  s.text("vote-zero", left, 140, `Class 0: ${fmt(votes.classZero * 100, 1)}%`, { "font-size": 14, fill: palette[0] });
  s.text("vote-one", left, 160, `Class 1: ${fmt(votes.classOne * 100, 1)}% vote share`, { "font-size": 14, fill: palette[1] });
  s.text("vote-decision", left, 182,
    `At ${fmt(threshold * 100, 0)}% threshold → class ${+(votes.classOne >= threshold)}`,
    { "font-size": 14 },
  );
  s.text("vote-card-key", left, 207, "Distance d → vote weight below", { "font-size": 13 });
  const maximum = Math.max(...votes.rows.map((row) => row.weight));
  votes.rows.forEach((row, i) => {
    const x = 14 + (i % columns) * cardWidth,
      y = start + Math.floor(i / columns) * 77,
      bw = cardWidth - 17,
      p = P("neighbor-weight-" + row.id, bw * row.weight / maximum, y + 33);
    s.circle("vote-class-dot-" + row.id, x + 4, y + 2, 4, palette[row.y]);
    if (row.y)
      s.path("vote-class-cross-" + row.id,
        `M${x + 2},${y}l4,4m-4,0l4,-4`, "#fffdf5", 1.2);
    s.text("vote-id-" + row.id, x + 13, y + 6, row.id, { "font-size": 14 });
    s.text("vote-distance-" + row.id, x, y + 24, "d " + fmt(row.distance, 2), { "font-size": 12 });
    s.rect("vote-track-" + row.id, x, y + 33, bw, 7, "#e5e8dc", { rx: 2 });
    s.rect("neighbor-weight-" + row.id, x, y + 33, Math.max(0, p[0]), 7,
      palette[row.y], { rx: 2 });
    s.text("vote-weight-" + row.id, x, y + 58, fmt(row.weight * 100, 1) + "%", { "font-size": 13 });
  });
  s.text("vote-foot", 14, height - 8, "Weights total 100%; color and × identify class.", { "font-size": s.w < 330 ? 12 : 13 });
}
export function create(host, slug) {
  const svm = slug === "support-vector-machine",
    knn = slug === "knn",
    qda = slug === "qda",
    lda = slug === "lda",
    one = slug === "one-r",
    imb = slug === "imbalanced-classification";
  const initial = {
    scenario: qda ? "unequal" : "clouds",
    threshold: svm ? 0 : 0.5,
    k: 5,
    scaling: "yes",
    weighted: "no",
    lambda: 0.02,
    shrink: 0,
    radius: 1,
    C: 1,
    kernel: "linear",
    gamma: 0.8,
    query: slug === 'logistic-regression' ? .8 : 0,
    second: slug === 'logistic-regression' ? .4 : 0,
    inputState: 'measured',
    oneFold: 1,
    lossInput: svm ? .4 : .5,
    selected: "C1",
    feature: "auto",
    prevalence: 1,
    seed: 42,
  };
  const controls = [
    ...(!imb
      ? [
          {
            key: "scenario",
            label: "Class pattern",
            options: [
              ["clouds", "Overlapping clouds"],
              ["unequal", "Unequal covariance"],
              ["rings", "Inner and outer rings"],
            ],
          },
          { key: "query", label: "Query x", min: -2.5, max: 2.5, step: 0.05 },
          { key: "second", label: "Query z", min: -2.5, max: 2.5, step: 0.05 },
        ]
      : [
          {
            key: "prevalence",
            label: "Positive prevalence (%)",
            min: 1,
            max: 40,
            step: 1,
          },
        ]),
    {
      key: "threshold",
      label: svm ? "Decision score threshold" : "Decision threshold",
      min: svm ? -1 : 0,
      max: 1,
      step: 0.01,
    },
    ...(knn
      ? [
          { key: "k", label: "Neighbors K", min: 1, max: 21, step: 2 },
          {
            key: "scaling",
            label: "Training SD scaling",
            options: [
              ["yes", "On"],
              ["no", "Off"],
            ],
          },
          {
            key: "weighted",
            label: "Vote weights",
            options: [
              ["no", "Uniform"],
              ["yes", "Inverse distance"],
            ],
          },
        ]
      : []),
    ...(qda
      ? [
          {
            key: "shrink",
            label: "Shrink toward pooled covariance",
            min: 0,
            max: 1,
            step: 0.05,
          },
        ]
      : []),
    ...(lda || qda ? [{ key: "radius", label: "Mahalanobis contour radius", min: 0.5, max: 2, step: 0.1 }] : []),
    ...(svm
      ? [
          {
            key: "C",
            label: "Violation penalty C",
            min: 0.1,
            max: 5,
            step: 0.1,
          },
          {
            key: "kernel",
            label: "Kernel",
            options: [
              ["linear", "Linear"],
              ["rbf", "RBF"],
            ],
          },
          {
            key: "gamma",
            label: "RBF gamma (scaled inputs)",
            min: 0.1,
            max: 3,
            step: 0.1,
          },
        ]
      : []),
    ...(one
      ? [
          {
            key: "feature",
            label: "Rule feature",
            options: [
              ["auto", "Choose on training error"],
              ["x", "Input x"],
              ["z", "Input z"],
            ],
          },
        ]
      : []),
    ...(!svm && !knn && !qda && !lda && !one && !imb
      ? [{ key: "lambda", label: "L2 penalty", min: 0, max: 1, step: 0.02 }]
      : []),
    ...(one?[{key:'oneFold',label:'Held-out fold',options:[[1,'Fold 1'],[2,'Fold 2'],[3,'Fold 3']]},{key:'inputState',label:'Selected rule input',options:[['measured','Measured value'],['missing','Missing value: use saved fallback']]}]:[]),
    ...(svm||slug==='logistic-regression'?[{key:'lossInput',label:svm?'Inspect signed margin y × score':'Inspect probability assigned to true class',min:svm?-2:.01,max:svm?2:.99,step:.01}]:[]),
  ];
  const L = makeLab(host, slug, initial, controls);
  let data,
    key = "",
    sealed = null,
    cvKey = '',
    cvScores = [];
  function compute() {
    const st = L.state,
      k = JSON.stringify([
        st.scenario,
        st.k,
        st.scaling,
        st.weighted,
        st.lambda,
        st.shrink,
        st.C,
        st.kernel,
        st.gamma,
        st.feature,
        st.seed,
      ]);
    if (data && key === k) return data;
    key = k;
    const split = splitRows(classificationData(st.seed, st.scenario)),
      train = split.train;
    let fit, score;
    if (knn)
      fit = knnFit(train, st.k, st.scaling === "yes", st.weighted === "yes");
    else if (lda || qda) fit = discriminantFit(train, qda, st.shrink);
    else if (one) fit = oneRuleFit(train, st.feature);
    else if (svm) {
      const mx = mean(train.map((r) => r.x)),
        mz = mean(train.map((r) => r.z)),
        sx = Math.sqrt(mean(train.map((r) => (r.x - mx) ** 2))) || 1,
        sz = Math.sqrt(mean(train.map((r) => (r.z - mz) ** 2))) || 1,
        transform = (r) => ({ ...r, x: (r.x - mx) / sx, z: (r.z - mz) / sz });
      fit = svmFit(train.map(transform), st.C, st.kernel, st.gamma);
      const raw = fit.score;
      fit.score = (r) => raw(transform(r));
      fit.predict = (r) => (fit.score(r) >= 0 ? 1 : 0);
      fit.scaler = { mx, mz, sx, sz };
      fit.transform = transform;
    } else fit = logisticFit(train, 350, 0.2, st.lambda);
    score = svm ? fit.score : fit.predict;
    const limit=Math.max(3,...train.flatMap(r=>[Math.abs(r.x)+.25,Math.abs(r.z)+.25]));
    const grid = Array.from({ length: 24 * 20 }, (_, i) => {
      const x = -limit + (2*limit * (i % 24)) / 23,
        z = -limit + (2*limit * Math.floor(i / 24)) / 19;
      return { x, z, score: score({ x, z }) };
    });
    const predictions = split.validation.map((r) => ({
      ...r,
      score: score(r),
    }));
    const thresholds = [
        Infinity,
        ...predictions.map((r) => r.score).sort((a, b) => b - a),
        -Infinity,
      ],
      roc = thresholds.map((t) => {
        const c = matrix(split.validation, score, t);
        return { x: c.fp / (c.fp + c.tn), y: c.tp / (c.tp + c.fn) };
      });
    return (data = { split, fit, score, grid, predictions, roc,limit });
  }
  function unlock() {
    sealed = null;
    key = "";
    L.disable(
      [...controls.map((c) => c.key), "new-data", "reveal-test"],
      false,
    );
    setTextSafe("final-result", "");
  }
  L.onReset = unlock;
  if (!imb)
    L.action("new-data", "Draw a new development example", () => {
      if (!sealed) L.update({ seed: L.state.seed + 1 });
    });
  const finalButton = L.action(
    "reveal-test",
    "Lock choices & reveal final test",
    () => {
      if (sealed) return;
      const d = compute();
      sealed = {
        threshold: L.state.threshold,
        configuration: structuredClone(L.state),
        ids: d.split.test.map((r) => r.id),
        counts: matrix(d.split.test, d.score, L.state.threshold),
      };
      L.disable(
        [...controls.map((c) => c.key), "new-data", "reveal-test"],
        true,
      );
      L.update({}, false);
    },
  );
  finalButton.hidden = slug !== "logistic-regression";
  L.surface.onAction = (id) => {
    const r = compute().split.train.find((r) => r.id === id);
    if (r && !sealed) L.update({ query: r.x, second: r.z, selected: id });
  };
  return L.init((animate = false) => {
    const st = L.state,
      d = compute(),
      scene = L.scene,
      q = { x: one&&[5,11].includes(L.index)&&st.inputState==='missing'&&d.fit.key==='x'?NaN:st.query,
            z: one&&[5,11].includes(L.index)&&st.inputState==='missing'&&d.fit.key==='z'?NaN:st.second },
      score = d.score(q),
      c = imb
        ? illustrativeCounts(st.prevalence,st.threshold)
        : matrix(d.split.validation, d.score, one ? .5 : st.threshold);
    const precision = c.tp + c.fp ? c.tp / (c.tp + c.fp) : null,
      recall = c.tp / (c.tp + c.fn);
    finalButton.hidden = slug !== "logistic-regression" || scene !== "final";
    const votes = knn ? knnVoteReceipt(d.fit, q, st.weighted === "yes") : null;
    const logistic=slug==='logistic-regression';
    host.querySelector('.lab-stats').hidden=logistic&&L.index===0;
    const parts=logistic?[d.fit.weights[0],d.fit.weights[1]*q.x,d.fit.weights[2]*q.z]:null;
    const rawScore=parts?parts.reduce((a,b)=>a+b,0):null;
    const lossDemo=scene==='loss'?{input:st.lossInput,value:svm?Math.max(0,1-st.lossInput):-Math.log(st.lossInput)}:null;
    const newExample=host.querySelector('#new-data');
    if(newExample)newExample.hidden=scene==='loss';
    if(logistic||svm) {
      for(const control of controls){
        const hide=scene==='loss'?control.key!=='lossInput':control.key==='lossInput'||(svm&&scene==='split'&&['C','kernel','gamma','threshold'].includes(control.key))||(svm&&control.key==='gamma'&&st.kernel!=='rbf'&&scene!=='kernel')||(logistic&&scene==='coefficients'&&['query','second','threshold'].includes(control.key));
        host.querySelector('#'+control.key).closest('label').hidden=hide;
      }
    }
    if(one){
      host.querySelector('#threshold').closest('label').hidden=true;
      host.querySelector('#oneFold').closest('label').hidden=L.index!==8;
      host.querySelector('#inputState').closest('label').hidden=![5,11].includes(L.index);
      for(const id of ['query','second','feature'])host.querySelector('#'+id).closest('label').hidden=scene==='votes'||(id!=='feature'&&[3,8,9].includes(L.index));
      if([5,11].includes(L.index)&&st.inputState==='missing')host.querySelector(d.fit.key==='x'?'#query':'#second').closest('label').hidden=true;
    }
    if(knn && scene==='tuning'){
      const nextKey=JSON.stringify([st.scenario,st.seed,st.scaling,st.weighted,st.threshold]);
      if(cvKey!==nextKey){
        cvKey=nextKey;
        cvScores=knnCrossValidation(d.split.train,st.scaling==='yes',st.weighted==='yes',st.threshold);
      }
    }
    if(knn)for(const id of ['query','second'])host.querySelector('#'+id).closest('label').hidden=scene==='tuning';
    const svmContours=svm && scene==='margin'
      ? st.kernel==='linear'
        ? linearScoreContours(d.score,d.limit).map(c=>({level:c.level,segments:c.points.length?[c.points]:[]}))
        : [-1,0,1].map(level=>({level,segments:gridScoreContours(d.grid,24,level)}))
      : [];
    const oneStudy=one?oneRStudy(d,st):null;
    L.data = { ...d, oneStudy, counts: c, sealed, votes, lossDemo, rawScore, parts, svmContours, cvScores:knn&&scene==='tuning'?cvScores:undefined };
    L.metrics([
      [
        "Validation / scenario accuracy",
        fmt(((c.tp + c.tn) / (c.tp + c.tn + c.fp + c.fn)) * 100, 1) + "%",
      ],
      ["Recall", fmt(recall * 100, 1) + "%"],
      [
        "Precision",
        precision == null ? "Undefined" : fmt(precision * 100, 1) + "%",
      ],
    ]);
    L.legend([
      ["Class 0", palette[0]],
      ["Class 1", palette[1]],
      ["Query", palette[3]],
    ]);
    if (slug === "logistic-regression" && ["sigmoid", "boundary"].includes(scene))
      L.legend([
        ["Blue: predict 0 · p < cutoff", palette[0]],
        ["Red: predict 1 · p ≥ cutoff", palette[1]],
        ["Dashed cutoff · " + fmt(st.threshold, 2), "#344a48"],
        ...(scene === "boundary" ? [["Query", palette[3]]] : []),
      ]);
    if(svm && scene==='margin')L.legend([['Known class 0',palette[0]],['Known class 1',palette[1]],["Model separator: score 0",palette[2]],["Margin contours: scores ±1",'#817562'],["Support points: gold rings",palette[3]],['Query: solid gold',palette[3]]]);
    if(knn&&scene==='votes')L.legend([['Class 0 votes',palette[0]],['Class 1 votes',palette[1]]]);
    if(scene==='split'&&!svm)L.legend([]);
    if(knn && scene==='tuning'){
      const selected=cvScores.find(row=>row.k===st.k);
      L.metrics([["Current K · LOO accuracy",selected?fmt(selected.accuracy*100,1)+'%':'Not compared'],["Separate validation accuracy",fmt((c.tp+c.tn)/(c.tp+c.tn+c.fp+c.fn)*100,1)+'%'],["Training-only LOO folds",d.split.train.length]]);
      L.legend([["Training-only LOO accuracy",palette[0]],["Current K",palette[3]]]);
    }
    if ((lda || qda) && scene === "covariance")
      L.legend([["Class 0 · solid contour", palette[0]], ["Class 1 · dashed contour", palette[1]], ["Inspected query", palette[3]]]);
    if (lda || qda) {
      host.querySelector("#radius").closest("label").hidden = scene !== "covariance";
      host.querySelector("#threshold").closest("label").hidden = scene === "covariance";
      if (scene === "covariance")
        L.metrics([
          ["Query distance · class 0", fmt(Math.sqrt(squaredMahalanobis(d.fit.estimates[0], q)), 3)],
          ["Query distance · class 1", fmt(Math.sqrt(squaredMahalanobis(d.fit.estimates[1], q)), 3)],
          ["Covariance model", qda ? fmt(st.shrink * 100, 0) + "% pooled" : "Shared shape"],
        ]);
    }
    if(lossDemo){
      L.metrics([[svm?'Signed margin':'True-class probability',fmt(lossDemo.input,3)],[svm?'Hinge loss':'One-case log loss',fmt(lossDemo.value,3)],['Scope','Loss illustration']]);
      L.legend([["Loss function",palette[2]],["Inspected value",palette[3]]]);
    }
    if(logistic&&scene==='sigmoid'&&L.index<5){
      L.legend([['Blue background: predict 0',palette[0]],['Red background: predict 1',palette[1]],['Dashed decision cutoff','#344a48'],['Sigmoid',palette[2]],...(L.index===1?[['Thin red: illustrative line',palette[1]]]:[]),['Current point',palette[3]]]);
      L.metrics([['Current raw score s',fmt(rawScore,3)],['Model probability',fmt(score,4)],['Valid probability range','0 to 1']]);
    }
    if(logistic&&scene==='contributions'){
      L.metrics([['Raw score s',fmt(rawScore,3)],['Sigmoid probability',fmt(score,4)],['Input clues',2]]);
      L.legend([['Intercept',palette[0]],['x contribution',palette[1]],['z contribution',palette[2]],['Raw score total',palette[3]],['Map blue: predict 0',palette[0]],['Map red: predict 1',palette[1]],['Map gold: query',palette[3]]]);
    }
    if(one&&scene==='votes'){
      const positive=d.split.train.filter(r=>r.y===1).length,baseline=d.fit.fallback;
      L.metrics([['Training class 0',d.split.train.length-positive],['Training class 1',positive],['Majority baseline',`Class ${baseline}`]]);
      L.legend([['Class 0',palette[0]],['Class 1',palette[1]]]);
    }
    if(one&&scene==='rules'){
      L.metrics([['Training mistakes',d.fit.errors],['Returned class',score],['Saved input',d.fit.key]]);
      L.legend([5,11].includes(L.index)&&st.inputState==='missing'?[['Saved fallback class '+d.fit.fallback,palette[d.fit.fallback]]]:[['Training class 0',palette[0]],['Training class 1',palette[1]],['Current input interval',palette[3]]]);
    }
    let receipt = [
      ["Query inputs", "x " + fmt(q.x, 2) + ", z " + fmt(q.z, 2)],
      [svm ? "Signed score" : "Model class-1 fraction", fmt(score, 4)],
      [
        "Decision at " + fmt(st.threshold, 2),
        score >= st.threshold ? "Class 1" : "Class 0",
      ],
      [
        "Validation counts",
        "TP " + c.tp + " · FP " + c.fp + " · FN " + c.fn + " · TN " + c.tn,
      ],
    ];
    let notice = imb
      ? "Scenario model, not measured model performance: 10,000 cases. At threshold 0.5, assumed sensitivity is 90% and false-positive rate 5%. Threshold response curves are explicit illustrative assumptions."
      : "Computed teaching dataset: 48 training, 16 validation, 16 sealed final-test rows. All fitted parameters and scales use training only. The surface shows model decisions, not ground truth.";
    if (slug === "logistic-regression" && ["sigmoid", "boundary"].includes(scene))
      notice += " Move the cutoff: red predicts class 1 at or above it; blue predicts class 0 below it. The fitted probabilities stay unchanged.";
    if (knn) {
      receipt = [
        [
          "Training scales",
          "SD x " + fmt(d.fit.sx, 3) + " · SD z " + fmt(d.fit.sz, 3),
        ],
        ...votes.rows.map((r) => [
            r.id + " · class " + r.y,
            "distance " + fmt(r.distance, 4) + " · weight " + fmt(r.weight * 100, 2) + "%",
          ]),
        ["Class-1 vote share", fmt(votes.classOne * 100, 2) + "% of total neighbor weight"],
        ["Class-0 vote share", fmt(votes.classZero * 100, 2) + "% of total neighbor weight"],
        ["Decision", "At threshold " + fmt(st.threshold, 2) + ": class " + +(score >= st.threshold)],
      ];
      if (votes.exactMatches)
        receipt.push(["Exact-match convention", votes.exactMatches + " exact matches share all the weight; remaining selected neighbors receive zero."]);
    }
    if (lda || qda)
      receipt = [
        ...d.fit.estimates.map((e, i) => [
          "Class " + i,
          "n " +
            e.n +
            " · mean (" +
            fmt(e.mx, 2) +
            ", " +
            fmt(e.mz, 2) +
            ") · prior " +
            fmt(e.prior, 2),
        ]),
        ...d.fit.estimates.map((e, i) => [
          "Σ for class " + i,
          "[[" +
            fmt(e.xx, 3) +
            ", " +
            fmt(e.xz, 3) +
            "], [" +
            fmt(e.xz, 3) +
            ", " +
            fmt(e.zz, 3) +
            "]]",
        ]),
        [
          "Query scores",
          d.fit
            .scores(q)
            .map((x) => fmt(x, 3))
            .join(" versus "),
        ],
        ...d.fit.estimates.map((e, j) => ["Query Mahalanobis distance · class " + j, fmt(Math.sqrt(squaredMahalanobis(e, q)), 4)]),
        ["Contour interpretation", "Radius " + fmt(st.radius, 1) + ": equal Mahalanobis distance from each fitted center. Not a confidence interval."],
      ];
    if (one)
      receipt = [
        ["Selected input", d.fit.key],
        ['New input value',Number.isFinite(q[d.fit.key])?fmt(q[d.fit.key],4):'Missing'],
        ['Returned saved class',score],
        ["Training cut points", d.fit.cuts.map((x) => fmt(x, 3)).join(", ")],
        ...d.fit.values.map((v, i) => [
          "Bin " + (i + 1),
          v.positive + " positive / " + v.n + " rows → class " + v.prediction,
        ]),
        ["Training mistakes", d.fit.errors],
      ];
    if (svm) {
      const margins = d.split.train.map((r) => (r.y ? 1 : -1) * d.score(r));
      receipt = [
        ["Support vectors", d.fit.support.length + " of 48"],
        [
          "Mean training hinge loss",
          fmt(mean(margins.map((m) => Math.max(0, 1 - m))), 4),
        ],
        [
          "Training scaler",
          "μ (" +
            fmt(d.fit.scaler.mx, 2) +
            ", " +
            fmt(d.fit.scaler.mz, 2) +
            ")",
        ],
        [
          "Numerical fit",
          "Bounded deterministic SMO · " + d.fit.iterations + " sweeps",
        ],
        ["Query signed score", fmt(score, 4)],
      ];
      notice +=
        " SVM score is uncalibrated. The bounded solver approximates the soft-margin optimum; support means nonzero dual weight.";
    }
    if (
      scene === "contributions" ||
      (scene === "coefficients" && slug === "logistic-regression")
    )
      receipt = d.fit.weights.map((v, i) => [
        "β" + i,
        fmt(v, 4) + (i ? " · odds multiplier " + fmt(Math.exp(v), 3) : ""),
      ]);
    if(logistic&&scene==='contributions')receipt=[['Intercept',fmt(parts[0],4)],['x × coefficient',`${fmt(q.x,3)} × ${fmt(d.fit.weights[1],3)} = ${fmt(parts[1],4)}`],['z × coefficient',`${fmt(q.z,3)} × ${fmt(d.fit.weights[2],3)} = ${fmt(parts[2],4)}`],['Raw score s',fmt(rawScore,4)],['Sigmoid probability',fmt(score,4)]];
    if (scene === "split")
      receipt = [
        ["Train IDs", d.split.train.map((r) => r.id).join(", ")],
        ["Validation IDs", d.split.validation.map((r) => r.id).join(", ")],
        ["Final test", "16 rows sealed; never used in this view."],
      ];
    if(svm&&scene==='split'){
      const scaled=d.fit.transform(q);
      receipt=[['Raw query',`x=${fmt(q.x,4)}, z=${fmt(q.z,4)}`],['Training means',`x=${fmt(d.fit.scaler.mx,4)}, z=${fmt(d.fit.scaler.mz,4)}`],['Training SDs',`x=${fmt(d.fit.scaler.sx,4)}, z=${fmt(d.fit.scaler.sz,4)}`],['Scaled query',`x=${fmt(scaled.x,4)}, z=${fmt(scaled.z,4)}`],['Saved rule','Subtract the training mean, then divide by the training SD. Reuse these same values for later rows.']];
      L.metrics([['Scaled query x',fmt(scaled.x,3)],['Scaled query z',fmt(scaled.z,3)],['Training rows for scales',d.split.train.length]]);
      L.legend([['Scaled input calculation',palette[0]]]);
      notice='This panel follows input preparation. Its means and SDs come from the training rows only; validation and final-test rows cannot set them.';
    }
    if (imb)
      receipt = [
        ["Actual positives / negatives", c.tp + c.fn + " / " + (c.fp + c.tn)],
        ["TP / FN", c.tp + " / " + c.fn],
        ["FP / TN", c.fp + " / " + c.tn],
        ["Alert workload", c.tp + c.fp],
        [
          "Precision",
          precision == null
            ? "Undefined (no alerts)"
            : fmt(precision * 100, 1) + "%",
        ],
      ];
    if (scene === "final" && slug === "logistic-regression")
      receipt = sealed
        ? [
            ["Locked threshold", fmt(sealed.threshold, 2)],
            ["Final-test IDs", sealed.ids.join(", ")],
            [
              "One-time result",
              "TP " +
                sealed.counts.tp +
                " · FP " +
                sealed.counts.fp +
                " · FN " +
                sealed.counts.fn +
                " · TN " +
                sealed.counts.tn,
            ],
            [
              "Status",
              "Controls locked. Reset starts a clearly new development exercise; this is a toy lesson, not fresh independent evidence.",
            ],
          ]
        : [
            [
              "Before revealing",
              "Choose the model and threshold using validation only.",
            ],
            ["Action", "Lock choices & reveal final test."],
            ["Current test status", "Sealed."],
          ];
    if(knn && scene==='tuning'){
      receipt=cvScores.map(row=>[`K=${row.k}`,`${row.correct}/${row.total} held-out predictions correct (${fmt(row.accuracy*100,1)}%)`]);
      notice='Computed leave-one-out comparison on the 48 training rows only. Every held-out row is excluded from its fitted scales and neighbours. Validation and sealed final-test rows do not enter these CV scores. No best K is selected automatically.';
    }
    if(lossDemo){
      receipt=[['Input to the loss rule',fmt(lossDemo.input,4)],['Loss',fmt(lossDemo.value,4)],['Scope',svm?'Hinge loss at a chosen signed margin.':'Log loss for probability assigned to the known true class.']];
      notice='This is a one-case loss-function experiment. The input control inspects the rule; it does not refit a classifier or report validation performance.';
    }
    if(logistic&&L.index<5&&scene!=='loss'){
      if(scene!=='contributions')receipt=[['Inputs',`x=${fmt(q.x,3)}, z=${fmt(q.z,3)}`],['Raw score s',fmt(rawScore,4)],['Model class-1 probability',fmt(score,4)]];
      if(L.index===0){
        receipt=[['New input coordinates',`x=${fmt(q.x,3)}, z=${fmt(q.z,3)}`],['Training examples',d.split.train.length],['Known answers','Classes 0 and 1']];
        notice='Dots are labelled training examples. The gold point is a new input to predict. The background turns fitted probabilities into decisions: blue below the cutoff, red at or above it. Moving the cutoff leaves the fitted probabilities unchanged.';
      }
      if(L.index===1)notice='The thin red line is y=.5+.25s as a shape illustration, not a fitted prediction. The gold dot uses this classifier’s raw score and sigmoid probability. The two-colour probability field follows the decision threshold; moving it does not change either curve.';
      if(['sigmoid','contributions'].includes(scene))receipt.push(['Decision cutoff',fmt(st.threshold,2)],['Class at this cutoff',+(score>=st.threshold)]);
    }
    if(one&&scene==='votes'){
      const positive=d.split.train.filter(r=>r.y===1).length;
      receipt=[['Training class counts',`${d.split.train.length-positive} class 0; ${positive} class 1`],['Saved majority label',d.fit.fallback],['Tie rule','An equal count chooses class 1 in this teaching model.']];
      notice='This baseline ignores every input. The counts come from the current training rows, rather than the separate printed weather example.';
    }
    if(one&&[5,11].includes(L.index)&&st.inputState==='missing'){
      receipt=[['Selected input',d.fit.key],['Input status','Missing, rather than zero'],['Saved fallback label',d.fit.fallback],['Returned prediction',score]];
      notice='The selected input is unknown. The model applies its saved training-majority fallback; it does not treat the value as the largest interval.';
    }
    if(one) {
      const detail=oneRDetails(oneStudy,st,q,L.index);
      L.metrics(detail.metrics);receipt=detail.receipt;
      notice=visualRevision(slug,L.index).guide;
    }
    if(imb) {
      L.legend([['Found positives (TP)',palette[2]],['Misses (FN)',palette[3]],['False alerts (FP)',palette[1]],['Correct negatives (TN)',palette[0]]]);
      receipt=[['Actual positives',`${c.tp} found + ${c.fn} missed = ${c.tp+c.fn}`],['Actual negatives',`${c.fp} false alerts + ${c.tn} correct negatives = ${c.fp+c.tn}`],['Alert pool',`${c.tp} + ${c.fp} = ${c.tp+c.fp}`],['Recall',`${c.tp}/${c.tp+c.fn}`],['Precision',c.tp+c.fp?`${c.tp}/${c.tp+c.fp}`:'Undefined: no alerts'],['Accuracy',`(${c.tp}+${c.tn})/10000`]];
      notice=visualRevision(slug,L.index).guide;
    }
    if(knn&&scene==='distances') {
      receipt=[['Distance coordinates',st.scaling==='yes'?'Training SD-scaled':'Raw'],['Training x SD',fmt(d.fit.sx,4)],['Training z SD',fmt(d.fit.sz,4)],...votes.rows.map((r,i)=>[`Rank ${i+1}: ${r.id}`,`class ${r.y}; distance ${fmt(r.distance,4)}; Δx ${fmt((r.x-q.x)/d.fit.sx,4)}; Δz ${fmt((r.z-q.z)/d.fit.sz,4)}`])];
      notice=visualRevision(slug,L.index).guide;
    }
    L.receipt(L.table(["Inspect", "Value"], receipt));
    L.note(notice);
    L.draw((s, P) => {
      s.begin(310);
      if(one && L.index!==7){
        oneRScene(s,P,oneStudy,q,st,L.index,c,d);
      } else if(imb){
        imbalanceScene(s,P,c,L.index,st.prevalence,st.threshold);
      } else if(knn&&scene==='distances'){
        knnDistanceScene(s,P,d,q,st.k,st.scaling==='yes');
      } else if(logistic&&L.index===1){
        probabilityShapesStory(s,rawScore,score,st.threshold,P);
      } else if(logistic&&scene==='contributions'){
        contributionsStory(s,parts,score);
        appendLogisticDecisionField(s,P,d,q,st.threshold);
      } else if(one&&scene==='rules'){
        oneRuleStory(s,d.fit,d.split.train,q,[5,11].includes(L.index)&&st.inputState==='missing');
      } else if(one&&scene==='votes'){
        const positive=d.split.train.filter(r=>r.y===1).length;
        bars(s,P,[{label:'Class 0',value:d.split.train.length-positive,color:palette[0]},{label:'Class 1',value:positive,color:palette[1]}]);
      } else if(svm&&scene==='split'){
        scalingStory(s,q,d.fit.scaler,d.split.train.length);
      } else if(knn && scene==='tuning'){
        const a=s.axes([1,21],[0,100],'Neighbours K','Leave-one-out accuracy %',[1,5,9,13,17,21]);
        plotLine(s,P,'knn-cv',cvScores.map(row=>[a.x(row.k),a.y(row.accuracy*100)]),palette[0],2.5);
        cvScores.forEach(row=>s.circle('knn-cv-point'+row.k,a.x(row.k),a.y(row.accuracy*100),row.k===st.k?6:3.5,row.k===st.k?palette[3]:palette[0]));
      } else if(slug==='logistic-regression' && scene==='coefficients'){
        oddsStory(s,d.fit.weights);
      } else if ((lda || qda) && scene === "covariance") {
        drawCovariance(s, P, d, q, qda, st.radius);
      } else if (scene === "confusion" || scene === "final" || imb) {
        const cc = sealed && scene === "final" ? sealed.counts : c,
          rows = [
            { label: "TP", value: cc.tp, color: palette[2] },
            { label: "FN", value: cc.fn, color: palette[3] },
            { label: "FP", value: cc.fp, color: palette[1] },
            { label: "TN", value: cc.tn, color: palette[0] },
          ];
        bars(s, P, rows);
        s.text(
          "matrix-title",
          15,
          20,
          sealed && scene === "final"
            ? "Final test · choices locked"
            : imb
              ? "10,000-case rate scenario"
              : "Held-out validation counts",
          { "font-size": 16 },
        );
      } else if (scene === "split") {
        flow(
          s,
          P,
          [
            "Split independent units first",
            "48 train: learn every fitted value",
            "16 validation: choose settings",
            "16 test: sealed until choices lock",
          ],
          1,
        );
      } else if (scene === "roc") {
        const a = s.axes(
          [0, 1],
          [0, 1],
          "False-positive rate",
          "True-positive rate",
        );
        s.line("chance", a.x(0), a.y(0), a.x(1), a.y(1), "#aaa", 1, "4 4");
        plotLine(
          s,
          P,
          "roc",
          d.roc.map((r) => [a.x(r.x), a.y(r.y)]),
          palette[2],
          2.5,
        );
        const p = P("operating", a.x(c.fp / (c.fp + c.tn)), a.y(recall));
        s.circle("operating", ...p, 7, palette[1]);
      } else if (
        scene === "sigmoid" ||
        scene === "loss" ||
        scene === "kernel"
      ) {
        const kernel = scene === "kernel",
          loss = scene === "loss",
          scoreLimit=logistic&&scene==='sigmoid'?Math.max(6,Math.abs(rawScore)+1):6,
          a = s.axes(
            kernel
              ? [0, 4]
              : loss
                ? [svm ? -2 : 0.01, svm ? 2 : 0.99]
                : [-scoreLimit, scoreLimit],
            kernel ? [0, 1] : loss ? [0, 5] : [0, 1],
            kernel
              ? "Scaled distance"
              : loss
                ? svm
                  ? "Signed margin"
                  : "Probability of true class"
                : "Linear score s",
            kernel ? "RBF similarity" : loss ? "Loss" : "Probability",
          );
        const xs = linspace(
          kernel ? 0 : loss ? (svm ? -2 : 0.01) : -scoreLimit,
          kernel ? 4 : loss ? (svm ? 2 : 0.99) : scoreLimit,
        );
        let thresholdY;
        if (scene === "sigmoid" && slug === "logistic-regression") {
          const threshold = P("decision-threshold", 0, st.threshold)[1];
          thresholdY = a.y(threshold);
          s.rect("probability-class-1", a.l, a.t, a.r - a.l, thresholdY - a.t, palette[1] + "24", { rx: 0 });
          s.rect("probability-class-0", a.l, thresholdY, a.r - a.l, a.b - thresholdY, palette[0] + "24", { rx: 0 });
        }
        plotLine(
          s,
          P,
          "function",
          xs.map((x) => [
            a.x(x),
            a.y(
              kernel
                ? Math.exp(-st.gamma * x * x)
                : loss
                  ? svm
                    ? Math.max(0, 1 - x)
                    : -Math.log(x)
                  : sigmoid(x),
            ),
          ]),
          palette[2],
          2.8,
        );
        if(lossDemo){
          s.circle('loss-inspection',a.x(lossDemo.input),a.y(lossDemo.value),6,palette[3]);
          s.line('loss-input-guide',a.x(lossDemo.input),a.b,a.x(lossDemo.input),a.y(lossDemo.value),palette[3],1.3,'3 4');
        }
        if(logistic&&scene==='sigmoid')s.circle('sigmoid-current',a.x(rawScore),a.y(score),6,palette[3]);
        if (thresholdY !== undefined)
          s.line("probability-threshold", a.l, thresholdY, a.r, thresholdY, "#344a48", 2, "6 4");
      } else if (scene === "rules") {
        bars(
          s,
          P,
          d.fit.values.map((r, i) => ({
            label: "Bin " + (i + 1),
            value: r.n ? r.positive / r.n : 0,
            color: palette[i],
          })),
          { domain: 1 },
        );
      } else if (scene === "votes" && knn) {
        drawNeighborVotes(s, P, votes, st.weighted === "yes", st.threshold);
      } else if (scene === "coefficients" || scene === "contributions") {
        bars(
          s,
          P,
          (
            d.fit.weights || [
              d.fit.estimates?.[0]?.mx || 0,
              d.fit.estimates?.[1]?.mx || 0,
            ]
          ).map((value, i) => ({
            label: d.fit.weights ? "β" + i : "Class " + i + " mean x",
            value,
          })),
        );
      } else {
        const a = s.axes([-d.limit, d.limit], [-d.limit, d.limit], "Input x", "Input z");
        if (lda && scene === "projection") {
          const c = d.fit.estimates[0],
            e = d.fit.estimates[1],
            dx = e.mx - c.mx,
            dz = e.mz - c.mz;
          let vx = (c.zz * dx - c.xz * dz) / c.det,
            vz = (c.xx * dz - c.xz * dx) / c.det;
          const norm = Math.hypot(vx, vz) || 1;
          vx /= norm;
          vz /= norm;
          s.line(
            "discriminant-axis",
            a.x(-2.7 * vx),
            a.y(-2.7 * vz),
            a.x(2.7 * vx),
            a.y(2.7 * vz),
            palette[2],
            2.3,
          );
          d.split.train.forEach((r) => {
            const score = r.x * vx + r.z * vz;
            s.line(
              "project-" + r.id,
              a.x(r.x),
              a.y(r.z),
              a.x(score * vx),
              a.y(score * vz),
              palette[r.y] + "55",
              1,
              "3 4",
            );
          });
        }
        const showSurface = ![
          "clouds",
          "means",
          "covariance",
          "projection",
          "distances",
        ].includes(scene);
        if (showSurface && slug === "logistic-regression") {
          const threshold = P("decision-threshold", 0, st.threshold)[1],
            weights = d.fit.weights.map((value, i) => P("decision-weight" + i, value, 0)[0]),
            regions = logisticRegions(weights, threshold,[-d.limit,d.limit]);
          for (const [key, points, color] of [
            ["decision-class-1", regions.positive, palette[1]],
            ["decision-class-0", regions.negative, palette[0]],
          ]) {
            if (points.length >= 3)
              s.path(key, points.map(([x, z], i) => `${i ? "L" : "M"}${a.x(x)},${a.y(z)}`).join(" ") + "Z", "none", 0, color + "24");
          }
          if (regions.boundary.length === 2) {
            const [from, to] = regions.boundary;
            s.line("decision-threshold-line", a.x(from[0]), a.y(from[1]), a.x(to[0]), a.y(to[1]), "#344a48", 2, "6 4");
          }
        } else if (showSurface && slug!=='logistic-regression')
          d.grid.forEach((r, i) => {
            const dx=(a.r-a.l)/23,dy=(a.b-a.t)/19,left=Math.max(a.l,a.x(r.x)-dx/2),right=Math.min(a.r,a.x(r.x)+dx/2),top=Math.max(a.t,a.y(r.z)-dy/2),bottom=Math.min(a.b,a.y(r.z)+dy/2);
            s.rect('cell'+i,left,top,right-left,bottom-top,r.score>=st.threshold?palette[1]+'16':palette[0]+'16',{rx:0});
          });
        const neighbors = knn
            ? new Set(d.fit.neighbors(q).map((r) => r.id))
            : new Set(),
          support = svm ? new Set(d.fit.support.map((r) => r.id)) : new Set();
        if (knn && ["neighbors", "distances"].includes(scene))
          d.fit
            .neighbors(q)
            .forEach((r) =>
              s.line(
                "neighbor" + r.id,
                a.x(q.x),
                a.y(q.z),
                a.x(r.x),
                a.y(r.z),
                palette[3] + "70",
                1,
              ),
            );
        if (svm && scene === "margin") {
          svmContours.forEach(({level,segments},j)=>segments.forEach((segment,i)=>s.line(`svm-contour-${j}-${i}`,a.x(segment[0][0]),a.y(segment[0][1]),a.x(segment[1][0]),a.y(segment[1][1]),level===0?palette[2]:'#817562',level===0?2.4:1.5,level===0?null:'4 4')));
        }
        d.split.train.forEach((r) => {
          const p = P(r.id, a.x(r.x), a.y(r.z));
          s.mark(
            r.id,
            ...p,
            palette[r.y],
            r.id + " class " + r.y,
            neighbors.has(r.id) || support.has(r.id),
            r.id,
          );
        });
        if (lda || qda)
          d.fit.estimates.forEach((e, i) => {
            const p = P("mean" + i, a.x(e.mx), a.y(e.mz));
            s.circle("mean" + i, ...p, 8, "#fffef9", {
              stroke: palette[i],
              "stroke-width": 3,
            });
            if (
              [
                "clouds",
                "covariance",
                "means",
                "projection",
                "distances",
              ].includes(scene)
            ) {
              const l11 = Math.sqrt(e.xx),
                l21 = e.xz / l11,
                l22 = Math.sqrt(Math.max(0, e.zz - l21 * l21)),
                ps = linspace(0, Math.PI * 2, 81).map((t) => [
                  a.x(e.mx + l11 * Math.cos(t)),
                  a.y(e.mz + l21 * Math.cos(t) + l22 * Math.sin(t)),
                ]);
              plotLine(s, P, "ellipse" + i, ps, palette[i], 2);
            }
          });
        const p = P("query", a.x(q.x), a.y(q.z));
        s.circle("query", ...p, 8, palette[3], {
          stroke: "#fffef9",
          "stroke-width": 2,
        });
      }
      if(one&&L.index===7)caption(s,'one-map-guide',`Map: predicted class from input ${d.fit.key}. Changing ${d.fit.key==='x'?'z':'x'} alone cannot change this rule’s answer. Known labels and predicted strips describe different things.`,s.h+24);
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
function setTextSafe(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
