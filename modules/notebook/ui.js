export const palette = [
  "#356f9d",
  "#b85a4f",
  "#52836b",
  "#9d7a32",
  "#826996",
  "#5c8990",
];
export const fmt = (n, digits = 1) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
export const pct = (n) => (n == null ? "Undefined" : `${fmt(n * 100, 1)}%`);
export function bindings(root = document) {
  const cache = new Map();
  return (key, value) => {
    if (!cache.has(key))
      cache.set(key, [...root.querySelectorAll(`[data-bind="${key}"]`)]);
    for (const n of cache.get(key))
      if (n.textContent !== String(value)) n.textContent = value;
  };
}
export const range = (id, label, min, max, step, value) =>
  `<label class="control" for="${id}"><span class="control-label">${label}<output id="${id}-value" for="${id}">${value}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
export const select = (id, label, options) =>
  `<label class="control" for="${id}"><span>${label}</span><select id="${id}">${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>`;
export const stats = (entries) =>
  `<div class="lab-stats">${entries.map(([id, title]) => `<div><small>${title}</small><strong id="${id}">—</strong></div>`).join("")}</div>`;
export function setText(id, text) {
  const n = document.getElementById(id);
  if (n && n.textContent !== String(text)) n.textContent = text;
}
export function listenInput(id, fn) {
  document
    .getElementById(id)
    .addEventListener("input", (e) => fn(e.target.value));
}

// An interruptible finite tween owns display coordinates only. Scientific state
// is committed by the caller; hidden tabs and reduced-motion finish immediately.
export class Tween {
  constructor(render) {
    this.render = render;
    this.current = {};
    this.target = {};
    this.raf = 0;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced.addEventListener("change", () => this.finish());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.finish();
    });
    this.frames = 0;
  }
  to(target, animate = true, duration = 300) {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    const start = { ...this.current };
    this.target = { ...target };
    if (
      !animate ||
      this.reduced.matches ||
      document.hidden ||
      !Object.keys(start).length
    )
      return this.finish();
    const keys = Object.keys(target);
    keys.forEach((k) => {
      if (!(k in start)) start[k] = target[k];
    });
    const began = performance.now();
    const tick = (now) => {
      this.frames++;
      const t = Math.min(1, (now - began) / duration),
        p = 1 - (1 - t) ** 3;
      this.current = Object.fromEntries(
        keys.map((k) => [k, start[k] + (target[k] - start[k]) * p]),
      );
      this.render(this.current, t < 1);
      if (t < 1) this.raf = requestAnimationFrame(tick);
      else this.raf = 0;
    };
    this.raf = requestAnimationFrame(tick);
  }
  finish() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.current = { ...this.target };
    if (Object.keys(this.current).length) this.render(this.current, false);
  }
}
const NS = "http://www.w3.org/2000/svg";
export class Surface {
  constructor(host, label) {
    this.host = host;
    this.nodes = new Map();
    this.svg = document.createElementNS(NS, "svg");
    this.svg.setAttribute("role", "group");
    this.svg.setAttribute("aria-label", label);
    host.append(this.svg);
    this.description = document.createElementNS(NS, "desc");
    this.svg.append(this.description);
    this.svg.addEventListener("click", (e) => this.activate(e));
    this.svg.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest("[data-action]")) {
          e.preventDefault();
          this.activate(e);
        }
      }
    });
  }
  activate(e) {
    let el = e.target.closest("[data-action]");
    // Generous touch targets overlap in dense clouds. Pick the nearest visible
    // mark, rather than letting DOM paint order choose a different observation.
    if (e.type === "click" && el?.hasAttribute("transform")) {
      const matrix = this.svg.getScreenCTM();
      if (matrix) {
        const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
          matrix.inverse(),
        );
        let nearest = Infinity;
        for (const candidate of this.svg.querySelectorAll(
          "g[data-action][transform]",
        )) {
          if (candidate.getAttribute("display") === "none") continue;
          const transform = candidate.transform.baseVal.consolidate()?.matrix;
          if (!transform) continue;
          const distance = Math.hypot(
            point.x - transform.e,
            point.y - transform.f,
          );
          if (distance < nearest && distance <= 22) {
            nearest = distance;
            el = candidate;
          }
        }
      }
    }
    if (el) this.onAction?.(el.dataset.action);
  }
  begin(height = 310) {
    this.w = Math.max(250, this.host.clientWidth || 550);
    this.h = height;
    this.svg.setAttribute("viewBox", `0 0 ${this.w} ${height}`);
    this.seen = new Set();
    return { w: this.w, h: this.h };
  }
  node(key, type, attrs = {}, text, parent = this.svg) {
    let el = this.nodes.get(key);
    if (!el) {
      el = document.createElementNS(NS, type);
      el.dataset.key = key;
      this.nodes.set(key, el);
      parent.append(el);
    }
    this.seen.add(key);
    el.removeAttribute("display");
    for (const [name, value] of Object.entries(attrs))
      if (value == null) el.removeAttribute(name);
      else if (el.getAttribute(name) !== String(value))
        el.setAttribute(name, String(value));
    if (text !== undefined && el.textContent !== String(text))
      el.textContent = text;
    return el;
  }
  line(key, x1, y1, x2, y2, color = "#cbd0c1", width = 1, dash = null) {
    return this.node(key, "line", {
      x1,
      y1,
      x2,
      y2,
      stroke: color,
      "stroke-width": width,
      "stroke-dasharray": dash,
      "stroke-linecap": "round",
    });
  }
  text(key, x, y, text, attrs = {}) {
    const style = `${attrs["font-size"] ? `font-size:${attrs["font-size"]}px;` : ""}${attrs.fill ? `fill:${attrs.fill};` : ""}`;
    return this.node(
      key,
      "text",
      { x, y, style: style || null, ...attrs },
      text,
    );
  }
  path(key, d, color, width = 2, fill = "none", attrs = {}) {
    return this.node(key, "path", {
      d,
      stroke: color,
      "stroke-width": width,
      fill,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      ...attrs,
    });
  }
  rect(key, x, y, width, height, fill, attrs = {}) {
    return this.node(key, "rect", {
      x,
      y,
      width: Math.max(0, width),
      height: Math.max(0, height),
      fill,
      rx: 4,
      ...attrs,
    });
  }
  circle(key, cx, cy, r, fill, attrs = {}) {
    return this.node(key, "circle", { cx, cy, r, fill, ...attrs });
  }
  mark(key, x, y, color, label, selected = false, action = key) {
    const g = this.node(key, "g", {
      transform: `translate(${x} ${y})`,
      role: "button",
      tabindex: "0",
      "data-action": action,
      "aria-label": label,
      "aria-pressed": selected,
    });
    this.node(
      `${key}-hit`,
      "circle",
      { r: 22, class: "point-halo" },
      undefined,
      g,
    );
    // Keep the 44px target invisible; a smaller visible ring must not cover
    // neighboring labels or imply that nearby observations are selected too.
    this.node(
      `${key}-selection`,
      "circle",
      {
        r: 11,
        fill: "none",
        stroke: palette[3],
        "stroke-width": 1.6,
        opacity: selected ? 1 : 0,
        "pointer-events": "none",
      },
      undefined,
      g,
    );
    this.node(
      `${key}-dot`,
      "circle",
      {
        r: selected ? 7 : 5,
        fill: color,
        stroke: "#fffef9",
        "stroke-width": 2,
      },
      undefined,
      g,
    );
    return g;
  }
  end(description) {
    if (description) this.description.textContent = description;
    for (const [key, el] of this.nodes)
      if (!this.seen.has(key)) el.setAttribute("display", "none");
  }
  axes(xDomain, yDomain, xLabel, yLabel, xTicks) {
    const p = { l: 47, r: this.w - 16, t: 28, b: this.h - 47 };
    const x = (v) =>
      p.l + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * (p.r - p.l);
    const y = (v) =>
      p.b - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * (p.b - p.t);
    for (let i = 0; i <= 4; i++) {
      const yv = yDomain[0] + ((yDomain[1] - yDomain[0]) * i) / 4;
      this.line(`grid-${i}`, p.l, y(yv), p.r, y(yv), "#e6e8dc", 1);
      this.text(
        `ytick-${i}`,
        p.l - 9,
        y(yv) + 5,
        Math.abs(yv) >= 1000
          ? `${fmt(yv / 1000, 1)}k`
          : String(Number(yv.toFixed(3))),
        { "text-anchor": "end", class: "axis-label" },
      );
    }
    const ticks =
      xTicks ||
      Array.from(
        { length: 5 },
        (_, i) => xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / 4,
      );
    ticks.forEach((value, i) =>
      this.text(
        `xtick-${i}`,
        x(value),
        p.b + 22,
        String(Number(value.toPrecision(3))),
        {
          "text-anchor":
            i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle",
          class: "axis-label",
        },
      ),
    );
    this.line("x-axis", p.l, p.b, p.r, p.b, "#8d988e", 1.4);
    this.line("y-axis", p.l, p.t, p.l, p.b, "#8d988e", 1.4);
    this.text("x-label", (p.l + p.r) / 2, this.h - 4, xLabel, {
      "text-anchor": "middle",
      class: "axis-label",
    });
    this.text("y-label", p.l, 16, yLabel, { class: "axis-label" });
    return { ...p, x, y };
  }
}
export const pathFrom = (points) =>
  points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ");
export function announce(text) {
  document.querySelector(".live-announcement").textContent = text;
}
export function motionStatus(
  moving,
  text = "Moving to the committed calculation…",
) {
  setText("motion-status", moving ? text : "");
}
