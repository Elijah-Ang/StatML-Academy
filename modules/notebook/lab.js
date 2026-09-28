import {
  Surface,
  Tween,
  range,
  select,
  stats,
  setText,
  fmt,
  palette,
  pathFrom,
  bindings,
  motionStatus,
} from "./ui.js";
import { catalog, sceneLabels } from "./catalog.js";
export { fmt, palette, pathFrom };
export const extent = (xs, pad = 0.12) => {
  const lo = Math.min(...xs),
    hi = Math.max(...xs),
    d = hi - lo || 1;
  return [lo - d * pad, hi + d * pad];
};
export const linspace = (lo, hi, n = 65) =>
  Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
export function makeLab(host, slug, initial, controls) {
  const config = catalog[slug];
  const markup = controls
    .map((c) =>
      c.options
        ? select(c.key, c.label, c.options)
        : range(
            c.key,
            c.label,
            c.min,
            c.max,
            c.step,
            c.value ?? initial[c.key],
          ),
    )
    .join("");
  host.innerHTML =
    '<p class="scene-kicker" id="scene-kicker"></p><div class="plot" id="extended-plot"></div><div class="legend" id="lab-legend"></div>' +
    stats([
      ["stat-a", "Calculation"],
      ["stat-b", "Comparison"],
      ["stat-c", "Inspect"],
    ]) +
    '<div class="lab-controls">' +
    markup +
    '</div><div class="button-row" id="lab-actions"></div><div class="lab-receipt" id="lab-receipt" aria-live="off"></div><p class="lab-notice" id="lab-notice"></p>';
  const surface = new Surface(
    host.querySelector(".plot"),
    "Interactive " + slug.replaceAll("-", " ") + " teaching example.",
  );
  let state = structuredClone(initial),
    stage = 0,
    painter,
    compute;
  const bind = bindings();
  const tween = new Tween((values, moving) => {
    if (!painter) return;
    painter(surface, (key, x, y) => [
      values[key + "x"] ?? x,
      values[key + "y"] ?? y,
    ]);
    motionStatus(moving);
  });
  const api = {
    surface,
    tween,
    config,
    get state() {
      return state;
    },
    get scene() {
      return state.view;
    },
    get index() {
      return stage;
    },
    controls,
    data: null,
    init(fn) {
      compute = fn;
      sync();
      fn(false);
      return api;
    },
    stage(i) {
      stage = i;
      state.view = config.scenes[i];
      sync();
      setText("scene-kicker", sceneLabels[state.view]);
      compute?.(true);
    },
    resize() {
      tween.finish();
      compute?.(false, true);
    },
    pause() {
      tween.finish();
    },
    reset() {
      state = structuredClone(initial);
      state.view = config.scenes[stage];
      sync();
      api.onReset?.();
      compute?.(true);
    },
    update(patch, animate = true) {
      Object.assign(state, patch);
      sync();
      compute?.(animate);
    },
    draw(fn, animate = true) {
      painter = fn;
      const target = {};
      fn(surface, (key, x, y) => {
        target[key + "x"] = x;
        target[key + "y"] = y;
        return [x, y];
      });
      tween.to(target, animate, 280);
    },
    metrics(entries) {
      entries.forEach(([label, value], i) => {
        const el = host.querySelector("#stat-" + ["a", "b", "c"][i]);
        el.previousElementSibling.textContent = label;
        el.textContent = value;
      });
    },
    receipt(html, plain) {
      host.querySelector("#lab-receipt").innerHTML = html;
      bind(
        "live-receipt",
        plain ||
          [...host.querySelectorAll("#lab-receipt tbody tr")]
            .slice(0, 3)
            .map((tr) =>
              [...tr.children].map((td) => td.textContent).join(": "),
            )
            .join(" · "),
      );
    },
    note(text) {
      setText("lab-notice", text);
    },
    legend(items) {
      host.querySelector("#lab-legend").innerHTML = items
        .map(
          ([text, color]) =>
            '<span style="--legend:' + color + '">' + text + "</span>",
        )
        .join("");
    },
    action(id, label, fn) {
      const b = document.createElement("button");
      b.type = "button";
      b.id = id;
      b.textContent = label;
      b.onclick = fn;
      host.querySelector("#lab-actions").append(b);
      return b;
    },
    disable(keys, value) {
      keys.forEach((k) => {
        const el = host.querySelector("#" + k);
        if (el) el.disabled = value;
      });
    },
    table(heads, rows) {
      return (
        '<div class="table-wrap"><table><thead><tr>' +
        heads.map((h) => '<th scope="col">' + h + "</th>").join("") +
        "</tr></thead><tbody>" +
        rows
          .map(
            (r) =>
              "<tr>" +
              r
                .map(
                  (v, j) =>
                    (j ? "<td>" : '<th scope="row">') +
                    v +
                    (j ? "</td>" : "</th>"),
                )
                .join("") +
              "</tr>",
          )
          .join("") +
        "</tbody></table></div>"
      );
    },
  };
  function sync() {
    state.view ||= config.scenes[stage];
    for (const c of controls) {
      const el = host.querySelector("#" + c.key);
      if (!el) continue;
      el.value = state[c.key];
      setText(
        c.key + "-value",
        typeof state[c.key] === "number"
          ? fmt(state[c.key], c.step < 1 ? 2 : 0)
          : state[c.key],
      );
    }
  }
  controls.forEach((c) =>
    host.querySelector("#" + c.key).addEventListener("input", (e) => {
      state[c.key] =
        c.options ? e.target.value : +e.target.value;
      sync();
      setText("scene-kicker", sceneLabels[state.view]);
      compute?.(true);
    }),
  );
  return api;
}
export function bars(s, P, rows, { domain } = {}) {
  const { w } = s.begin(310),
    max = domain ?? Math.max(1, ...rows.map((r) => Math.abs(r.value))),
    left = 94,
    right = w - 18;
  const signed = rows.some((r) => r.value < 0),
    zero = signed ? (left + right) / 2 : left,
    span = signed ? (right - left) / 2 : right - left;
  if (signed) s.line("bar-zero", zero, 26, zero, 288, "#a8afa0", 1, "3 4");
  rows.forEach((r, i) => {
    const y = 48 + i * Math.min(49, 215 / Math.max(1, rows.length - 1)),
      p = P("bar" + i, zero + (r.value / max) * span, y);
    s.text("bar-label" + i, 8, y + 5, r.label, { "font-size": 14 });
    s.rect(
      "bar" + i,
      Math.min(zero, p[0]),
      y - 13,
      Math.abs(p[0] - zero),
      25,
      (r.color || palette[i % palette.length]) + "45",
    );
    s.text("bar-value" + i, right, y + 5, fmt(r.value, 3), {
      "font-size": 13,
      "text-anchor": "end",
    });
  });
}
export function flow(s, P, steps, active = 0) {
  const { w } = s.begin(310),
    gap = 270 / steps.length;
  steps.forEach((step, i) => {
    const y = 20 + i * gap,
      p = P("flow" + i, 20, y),
      selected = i === active;
    if (i < steps.length - 1)
      s.line(
        "flow-line" + i,
        w / 2,
        y + gap - 6,
        w / 2,
        y + gap + 1,
        palette[0],
        2,
      );
    s.rect(
      "flow-card" + i,
      p[0],
      p[1],
      w - 40,
      gap - 9,
      selected ? "#e4eee5" : "#f1f0e6",
      { stroke: selected ? palette[2] : "#d9d9cb" },
    );
    s.text("flow-title" + i, 32, p[1] + Math.min(25, gap / 2 + 3), step, {
      "font-size": Math.min(17, ((w - 70) / Math.max(1, step.length)) * 1.8),
    });
  });
}
export function plotLine(s, P, key, points, color, width = 2, dash = null) {
  s.path(
    key,
    pathFrom(points.map(([x, y], i) => P(key + i, x, y))),
    color,
    width,
    "none",
    { "stroke-dasharray": dash },
  );
}
