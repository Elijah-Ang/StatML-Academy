import {
  clusterData,
  featureSpace,
  initKmeans,
  stepKmeans,
  elbow,
  distance2,
} from "./models.js";
import {
  Surface,
  Tween,
  bindings,
  fmt,
  select,
  stats,
  setText,
  listenInput,
  palette,
  pathFrom,
  motionStatus,
  announce,
} from "./ui.js";
export function clustering(host) {
  host.innerHTML = `<div class="plot" id="cluster-plot"></div>${stats([
    ["cluster-phase", "Current phase"],
    ["cluster-wcss", "WCSS"],
    ["cluster-iteration", "Recenter rounds"],
  ])}<div class="button-row"><button id="cluster-back" type="button">← Back</button><button id="cluster-step" type="button" class="primary">Assign points →</button><button id="cluster-run" type="button">Run</button></div><div class="lab-controls">${select(
    "cluster-k",
    "Number of groups K",
    [2, 3, 4, 5, 6].map((k) => [k, k]),
  )}${select(
    "cluster-point",
    "Inspect customer",
    Array.from({ length: 36 }, (_, i) => [`P${i + 1}`, `P${i + 1}`]),
  )}${select("cluster-scale", "Distance uses", [
    ["scaled", "Standardized features"],
    ["raw", "Original units"],
  ])}</div><details class="lab-options"><summary>Dataset & starting point</summary><div class="lab-controls">${select(
    "cluster-scenario",
    "Stress test",
    [
      ["clouds", "Three clouds"],
      ["outlier", "Add one outlier"],
      ["moons", "Curved moons"],
    ],
  )}<div class="control"><span>Initialization seed <output id="cluster-seed">11</output></span><button type="button" id="cluster-reseed">Try another start</button></div></div></details><p class="inspection" id="cluster-mean-guide" hidden></p><div class="inspection" id="cluster-inspect"></div>`;
  const surface = new Surface(
    document.getElementById("cluster-plot"),
    "K-means scatterplot in original age and spending units, with selectable customers and numbered centers.",
  );
  const bind = bindings();
  let stage = 0,
    timer = 0,
    history = [],
    position = 0,
    curve,
    meanExample = null;
  let state = {
      k: 3,
      seed: 11,
      scaled: true,
      scenario: "clouds",
      selected: "P1",
      view: "clusters",
    },
    points,
    space;
  document.getElementById("cluster-k").value = 3;
  const current = () => history[position];
  const phaseName = (p) =>
    ({
      initialized: "Initialized",
      assigned: "Assigned",
      recentered: "Recentered",
      converged: "Converged",
    })[p];
  function draw(v, moving = false) {
    if (!points || !current()) return;
    const snapshot = current();
    surface.begin(310);
    if (state.view === "elbow") {
      const a = surface.axes(
        [1, 6],
        [0, Math.max(...curve.map((p) => p.wcss)) * 1.08],
        "Number of groups K",
        "Best WCSS · five starts",
        [1, 2, 3, 4, 5, 6],
      );
      surface.path(
        "elbow-curve",
        pathFrom(curve.map((p) => [a.x(p.k), a.y(p.wcss)])),
        palette[2],
        2.4,
      );
      curve.forEach((p) =>
        surface.mark(
          `elbow-${p.k}`,
          a.x(p.k),
          a.y(p.wcss),
          palette[2],
          `K ${p.k}, WCSS ${fmt(p.wcss, 2)}. Select to try this K.`,
          state.k === p.k,
          `k:${p.k}`,
        ),
      );
      surface.end(
        "Computed elbow curve, five starts for each K from one to six. WCSS uses the selected feature space.",
      );
    } else {
      const xDomain = [
        Math.min(15, ...points.map((p) => p.x - 5)),
        Math.max(70, ...points.map((p) => p.x + 5)),
      ];
      const yDomain = [
        Math.min(0, ...points.map((p) => p.y - 500)),
        Math.max(9500, ...points.map((p) => p.y + 1000)),
      ];
      const a = surface.axes(
        xDomain,
        yDomain,
        "Age · years",
        "Monthly spend · dollars",
      );
      const rawCentroids = snapshot.centroids.map((c, j) =>
        space.raw({ x: v[`x${j}`] ?? c.x, y: v[`y${j}`] ?? c.y }),
      );
      if (meanExample) {
        const {members, target, group} = meanExample;
        for (const p of members) {
          surface.line(`mean-thread-${p.id}`, a.x(p.x), a.y(p.y), a.x(target.x), a.y(target.y), `${palette[group]}55`, 1, "3 4");
          surface.circle(`mean-member-${p.id}`, a.x(p.x), a.y(p.y), 6, "none", {stroke:palette[group],"stroke-width":1.5});
        }
        surface.circle("group-mean-target", a.x(target.x), a.y(target.y), 12, "#fffef9", {stroke:palette[group],"stroke-width":2.5});
        surface.line("group-mean-h", a.x(target.x)-7, a.y(target.y), a.x(target.x)+7, a.y(target.y), palette[group], 2);
        surface.line("group-mean-v", a.x(target.x), a.y(target.y)-7, a.x(target.x), a.y(target.y)+7, palette[group], 2);
      }
      const selectedIndex = points.findIndex((p) => p.id === state.selected),
        selected = points[selectedIndex];
      if (stage > 0) {
        rawCentroids.forEach((c, j) => {
          const shouldConnect =
            stage === 2 || snapshot.assignments[selectedIndex] === j;
          if (shouldConnect)
            surface.line(
              `link-${j}`,
              a.x(selected.x),
              a.y(selected.y),
              a.x(c.x),
              a.y(c.y),
              `${palette[j]}88`,
              1.5,
              "4 5",
            );
        });
      }
      points.forEach((p, i) => {
        const group = stage === 0 ? -1 : snapshot.assignments[i],
          color = group < 0 ? "#717b73" : palette[group];
        surface
          .mark(
            `point-${p.id}`,
            a.x(p.x),
            a.y(p.y),
            color,
            `${p.id}, age ${fmt(p.x)}, spending ${fmt(p.y, 0)}. ${group < 0 ? "Unassigned" : `Group ${group + 1}`}.`,
            p.id === state.selected,
            `point:${p.id}`,
          )
          .setAttribute("tabindex", p.id === state.selected ? "0" : "-1");
      });
      if (stage > 0)
        rawCentroids.forEach((c, j) => {
          const x = a.x(c.x),
            y = a.y(c.y),
            d = Array.from({ length: 10 }, (_, i) => {
              const angle = -Math.PI / 2 + (i * Math.PI) / 5,
                r = i % 2 ? 5 : 11;
              return [x + Math.cos(angle) * r, y + Math.sin(angle) * r];
            });
          surface.path(
            `center-${j}`,
            pathFrom([...d, d[0]]),
            "#fffef9",
            1.4,
            palette[j],
          );
          surface.text(`center-label-${j}`, x + 12, y - 9, String(j + 1), {
            class: "data-label",
          });
        });
      surface.text(
        "selected-point-label",
        Math.min(a.r - 30, a.x(selected.x) + 12),
        Math.max(a.t + 12, a.y(selected.y) - 13),
        selected.id,
        { class: "data-label" },
      );
      surface.end(
        `${points.length} customers. ${phaseName(snapshot.phase)}, round ${snapshot.iteration}. ${state.scaled ? "Standardized" : "Raw-unit"} distances. WCSS ${fmt(snapshot.wcss, 2)}. Selected ${state.selected}.`,
      );
    }
    const pIndex = space.points.findIndex((p) => p.id === state.selected),
      p = space.points[pIndex],
      group = snapshot.assignments[pIndex];
    const distances = snapshot.centroids.map((c) => distance2(p, c));
    const vals = {
      k: state.k,
      seed: state.seed,
      "point-id": state.selected,
      phase: phaseName(snapshot.phase),
      iteration: snapshot.iteration,
      wcss: fmt(snapshot.wcss, 2),
      contribution: group >= 0 ? fmt(distances[group], 2) : "Not assigned",
      convergence: snapshot.converged
        ? "Assignments are stable"
        : "Not converged yet",
    };
    Object.entries(vals).forEach(([k, v]) => bind(k, v));
    document.querySelector('[data-bind-html="distances"]').innerHTML =
      `<table><thead><tr><th scope="col">Center</th><th scope="col">Distance²</th></tr></thead><tbody>${distances.map((d, j) => `<tr><th scope="row">${j + 1}${group === j ? " · assigned" : ""}</th><td>${fmt(d, 2)}</td></tr>`).join("")}</tbody></table>`;
    setText("cluster-phase", phaseName(snapshot.phase));
    setText("cluster-wcss", fmt(snapshot.wcss, 2));
    setText("cluster-iteration", snapshot.iteration);
    setText("cluster-seed", state.seed);
    document.getElementById("cluster-back").disabled = position === 0;
    document.getElementById("cluster-step").disabled =
      snapshot.converged && position === history.length - 1;
    setText(
      "cluster-step",
      snapshot.converged
        ? "Converged ✓"
        : snapshot.phase === "assigned"
          ? "Move centers →"
          : "Assign points →",
    );
    document.getElementById("cluster-run").disabled = snapshot.converged;
    setText("cluster-run", timer ? "Pause" : "Run");
    const raw = points[pIndex];
    document.getElementById("cluster-mean-guide").hidden = !meanExample;
    if (meanExample) setText("cluster-mean-guide",
      `${meanExample.preview ? "Next-step example: " : "Group calculation: "}${meanExample.members.length} outlined customers belong to group ${meanExample.group+1}. The hollow cross marks their mean: age ${fmt(meanExample.target.x)}, spending $${fmt(meanExample.target.y,0)}. ${meanExample.preview ? "Click Assign points to save the shown grouping, then Move centers. Your saved step has not advanced." : "At Move centers, this group’s star moves to that mean."}`);
    setText(
      "cluster-inspect",
      `${raw.id}: age ${fmt(raw.x)}, spend $${fmt(raw.y, 0)}. ${group < 0 ? "Not assigned yet." : `Group ${group + 1}; contribution ${fmt(distances[group], 2)}.`}${snapshot.empty ? ` ${snapshot.empty} empty center(s) retained.` : ""}`,
    );
    setText(
      "lab-caption",
      state.view === "elbow"
        ? "Computed from the current points and scaling. Five starts per K; a bend is evidence to discuss, not an automatic choice."
        : `Points stay in original units. Distances use ${state.scaled ? "z-scores" : "raw years and dollars"}. Stars are numbered centers. Scroll freely: your saved steps stay intact.`,
    );
    const isElbow = state.view === "elbow";
    document.getElementById("cluster-step").closest(".button-row").hidden =
      isElbow;
    document.getElementById("cluster-point").closest("label").hidden = isElbow;
    document.getElementById("cluster-reseed").closest(".control").hidden =
      isElbow;
    document.getElementById(
      "cluster-phase",
    ).previousElementSibling.textContent = isElbow
      ? "Compared K values"
      : "Current phase";
    document.getElementById("cluster-wcss").previousElementSibling.textContent =
      isElbow ? `Best WCSS · K=${state.k}` : "WCSS";
    document.getElementById(
      "cluster-iteration",
    ).previousElementSibling.textContent = isElbow
      ? "Starts per K"
      : "Recenter rounds";
    if (isElbow) {
      setText("cluster-phase", "1 to 6");
      setText("cluster-wcss", fmt(curve.find((p) => p.k === state.k).wcss, 2));
      setText("cluster-iteration", 5);
      setText(
        "cluster-inspect",
        `K=${state.k}: lowest WCSS found across five starts. Use the Lesson map to return to a grouping section and run its steps.`,
      );
    }
    motionStatus(moving);
  }
  const tween = new Tween(draw);
  const update = (animate = false) => {
    meanExample = null;
    if (stage === 3) {
      // Compute the worked preview once per action, never inside animation
      // frames. Scrolling reveals it without changing the saved algorithm.
      const snapshot = current();
      const assigned = snapshot.phase === "initialized"
        ? stepKmeans(space.points, snapshot) : snapshot;
      const pIndex = points.findIndex(p => p.id === state.selected);
      const group = assigned.assignments[pIndex];
      const members = points.filter((p, i) => assigned.assignments[i] === group);
      const moved = assigned.phase === "assigned" ? stepKmeans(space.points, assigned) : assigned;
      if (group >= 0 && members.length) meanExample = {
        group, members, target: space.raw(moved.centroids[group]),
        preview: snapshot.phase === "initialized",
      };
    }
    const target = {};
    current().centroids.forEach((c, j) => {
      target[`x${j}`] = c.x;
      target[`y${j}`] = c.y;
    });
    tween.to(target, animate, 400);
  };
  function pause() {
    if (timer) clearTimeout(timer);
    timer = 0;
    setText("cluster-run", "Run");
  }
  function rebuild() {
    pause();
    tween.finish();
    points = clusterData(23, state.scenario);
    space = featureSpace(points, state.scaled);
    history = [initKmeans(space.points, state.k, state.seed)];
    position = 0;
    curve = elbow(space.points);
    if (!points.some((p) => p.id === state.selected))
      state.selected = points[0].id;
    const selection = document.getElementById("cluster-point");
    selection.innerHTML = points
      .map((p) => `<option value="${p.id}">${p.id}</option>`)
      .join("");
    selection.value = state.selected;
    update();
  }
  function next() {
    if (position < history.length - 1) position++;
    else if (!current().converged) {
      history.push(stepKmeans(space.points, current()));
      position++;
    }
    update(current().phase === "recentered");
    announce(`${phaseName(current().phase)}. WCSS ${fmt(current().wcss, 2)}.`);
  }
  function runTick() {
    if (current().converged || history.length > 100) {
      pause();
      draw(tween.current);
      return;
    }
    next();
    timer = setTimeout(runTick, 650);
    setText("cluster-run", "Pause");
  }
  document.getElementById("cluster-step").onclick = () => {
    pause();
    next();
  };
  document.getElementById("cluster-back").onclick = () => {
    pause();
    if (position > 0) {
      position--;
      update(true);
    }
  };
  document.getElementById("cluster-run").onclick = () => {
    if (timer) pause();
    else runTick();
  };
  document.getElementById("cluster-reseed").onclick = () => {
    state.seed += 18;
    rebuild();
    announce(`New initial centers, seed ${state.seed}. Customers unchanged.`);
  };
  listenInput("cluster-k", (v) => {
    state.k = +v;
    rebuild();
  });
  listenInput("cluster-scale", (v) => {
    state.scaled = v === "scaled";
    rebuild();
  });
  listenInput("cluster-scenario", (v) => {
    state.scenario = v;
    rebuild();
  });
  listenInput("cluster-point", (v) => {
    state.selected = v;
    update();
  });
  surface.onAction = (action) => {
    const [kind, value] = action.split(":");
    if (kind === "point") {
      state.selected = value;
      document.getElementById("cluster-point").value = value;
      update();
    } else if (kind === "k") {
      state.k = +value;
      const s = document.getElementById("cluster-k");
      if (![...s.options].some((o) => o.value === value))
        s.add(new Option(value, value));
      s.value = value;
      rebuild();
      announce(
        `Selected K ${value}. Return to a grouping section using the Lesson map to inspect the fit.`,
      );
    }
  };
  function reset() {
    state = {
      k: 3,
      seed: 11,
      scaled: true,
      scenario: "clouds",
      selected: "P1",
      view: stage === 6 ? "elbow" : "clusters",
    };
    document.getElementById("cluster-k").value = 3;
    document.getElementById("cluster-scale").value = "scaled";
    document.getElementById("cluster-scenario").value = "clouds";
    rebuild();
    announce("Original customers and starting centers restored.");
  }
  rebuild();
  return {
    stage(i) {
      pause();
      stage = i;
      state.view = i === 6 ? "elbow" : "clusters";
      update();
    },
    resize() {
      draw(tween.current, !!tween.raf);
    },
    reset,
    pause() {
      pause();
      tween.finish();
    },
    get state() {
      return {
        ...state,
        points: structuredClone(points),
        snapshot: structuredClone(current()),
        position,
        history: structuredClone(history),
      };
    },
    tween,
  };
}
