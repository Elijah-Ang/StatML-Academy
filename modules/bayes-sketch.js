(() => {
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const state = {
    clues: ["free", "winner"],
    height: 169,
    stability: "smooth",
    priority: "precision",
    correlated: false,
  };
  const board = new StudySketch.Board(
      $("#bayesSketch"),
      BayesSketchScenes,
      state,
    ),
    sections = $$(".chapter"),
    rail = $("#bayesRail");
  function score() {
    const r = BayesPosterior(state),
      spam = r.p >= 0.5;
    $("#predictionLabel").textContent = spam ? "Spam" : "Not Spam";
    $("#predictionConfidence").textContent =
      ((spam ? r.p : 1 - r.p) * 100).toFixed(1) + "% posterior";
  }
  state.onScore = score;
  state.onFold = (n) => {
    $("#foldCaption").textContent =
      "Round " + n + " · Fold " + n + " validates";
    $$("[data-fold]").forEach((b) =>
      b.setAttribute("aria-pressed", String(+b.dataset.fold === n)),
    );
  };
  sections.forEach((el, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "statml-stage-button";
    b.setAttribute("aria-label", el.querySelector("h2").textContent);
    const t = document.createElement("span");
    t.textContent = el.querySelector("h2").textContent;
    b.append(t);
    b.onclick = () =>
      el.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    rail.append(b);
    el.querySelector(".stage-kicker span").textContent = String(i + 1).padStart(
      2,
      "0",
    );
  });
  let active = 0,
    raf = 0;
  function sync() {
    raf = 0;
    let n = 0;
    const line = window.statmlReadingLine(.45);
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= line) n = i;
    });
    if (n !== active) {
      active = n;
      board.set(n);
    }
    rail
      .querySelectorAll("button")
      .forEach((b, i) =>
        b.setAttribute("aria-current", i === active ? "step" : "false"),
      );
  }
  addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(sync);
    },
    { passive: true },
  );
  addEventListener("resize", sync);
  const types = {
    bernoulli: ["Bernoulli", "yes / no features"],
    multinomial: ["Multinomial", "word counts"],
    categorical: ["Categorical", "named categories"],
    gaussian: ["Gaussian", "continuous numbers"],
  };
  function choose(attr, key, fn) {
    $$("[" + attr + "]").forEach(
      (b) =>
        (b.onclick = () => {
          const v = b.getAttribute(attr);
          $$("[" + attr + "]").forEach((x) =>
            x.setAttribute("aria-pressed", String(x === b)),
          );
          state[key] = v;
          fn?.(v);
          board.render();
        }),
    );
  }
  choose("data-model", "model", (v) => {
    $("#typeSummary").innerHTML =
      '<span class="summary-label">Selected</span><strong>' +
      types[v][0] +
      "</strong><span>" +
      types[v][1] +
      "</span>";
  });
  choose("data-stability", "stability");
  choose("data-fold", "fold", (v) => {
    $("#foldCaption").textContent =
      "Round " + v + " · Fold " + v + " validates";
    state.fold = +v;
    board.step = state.fold - 1;
  });
  choose(
    "data-priority",
    "priority",
    (v) =>
      ($("#metricCaption").textContent =
        v === "precision"
          ? "Precision focus · keep false positives visible."
          : "Recall focus · keep missed spam visible."),
  );
  $("#assumptionToggle").onclick = (e) => {
    state.correlated = !state.correlated;
    e.currentTarget.setAttribute("aria-pressed", String(state.correlated));
    board.render();
  };
  $("#heightSlider").oninput = (e) => {
    state.height = +e.target.value;
    $("#heightReadout").textContent = e.target.value + " cm";
    board.render();
  };
  $("#resetEvidence").onclick = () => {
    state.clues = ["free", "winner"];
    score();
    board.render();
  };
  board.set(0);
  score();
  sync();
  window.__bayesSketch = { board, state, sync };
})();
