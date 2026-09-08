/* Deterministic pen geometry. Live SVG owns both the marks and the values:
   no screenshots, canvas interception, or decorative raster overlays. */
(() => {
  const ink = {
    blue: "#285f91",
    green: "#487459",
    red: "#a6493d",
    purple: "#795885",
    gold: "#a77b28",
    pencil: "#77766b",
    paper: "#fffbef",
  };
  let penId = 0;
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  class Pen {
    constructor() {
      this.parts = [];
      this.serial = 0;
      this.id = ++penId;
    }
    add(s) {
      this.parts.push(s);
      return this;
    }
    path(d, color = ink.blue, width = 2, extra = "") {
      return this.add(
        `<path class="pen-line" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`,
      );
    }
    line(x, y, u, v, c = ink.pencil, w = 1.5) {
      const k = Math.sin(++this.serial * 4.7) * 1.8;
      return this.path(
        `M${x} ${y} Q${(x + u) / 2 + k} ${(y + v) / 2 - k} ${u} ${v}`,
        c,
        w,
      );
    }
    arrow(x, y, u, v, c = ink.blue) {
      this.line(x, y, u, v, c, 2.2);
      const a = Math.atan2(v - y, u - x);
      this.path(
        `M${u - 10 * Math.cos(a - 0.45)} ${v - 10 * Math.sin(a - 0.45)} L${u} ${v} L${u - 10 * Math.cos(a + 0.45)} ${v - 10 * Math.sin(a + 0.45)}`,
        c,
        2.2,
      );
      return this;
    }
    text(t, x, y, size = 22, c = ink.blue, anchor = "start") {
      return this.add(
        `<text x="${x}" y="${y}" font-size="${size}" fill="${c}" text-anchor="${anchor}">${esc(t)}</text>`,
      );
    }
    wrap(t, x, y, width = 35, c = ink.pencil, size = 20) {
      let line = "",
        row = 0;
      for (const w of t.split(" ")) {
        if ((line + w).length > width) {
          this.text(line, x, y + row++ * 26, size, c);
          line = "";
        }
        line += w + " ";
      }
      this.text(line.trim(), x, y + row * 26, size, c);
      return this;
    }
    note(t, x = 35, y = 378, c = ink.blue) {
      this.add('<g class="pen-note">');
      this.path(
        `M${x - 2} ${y - 7} L${x + Math.min(t.length * 8, 550)} ${y - 7}`,
        "#e2c464",
        14,
        'data-highlight="true" opacity=".45"',
      );
      this.text(t, x, y, 21, c);
      return this.add("</g>");
    }
    box(x, y, w, h, c = ink.blue, fill = true) {
      const d = `M${x + 1} ${y + 2} Q${x + w * 0.4} ${y - 2} ${x + w - 1} ${y + 1} L${x + w + 1} ${y + h - 1} Q${x + w * 0.6} ${y + h + 2} ${x} ${y + h} Z`;
      if (fill)
        this.add(
          `<path d="${d}" fill="url(#pen-${Object.keys(ink).find((k) => ink[k] === c) || "blue"})" />`,
        );
      this.path(d, c, 1.6);
      this.path(
        `M${x + 3} ${y - 1} L${x + w - 3} ${y + 3} M${x + w + 3} ${y + 5} L${x + w - 2} ${y + h - 3}`,
        c,
        0.6,
        'opacity=".4"',
      );
      return this;
    }
    circle(x, y, r = 20, c = ink.blue, label = "", active = false) {
      this.add(
        `<path d="M${x + r} ${y} C${x + r + 2} ${y + r * 1.3} ${x - r} ${y + r * 1.3} ${x - r} ${y} C${x - r - 2} ${y - r * 1.3} ${x + r} ${y - r * 1.3} ${x + r} ${y}" fill="${active ? "url(#pen-" + (Object.keys(ink).find((k) => ink[k] === c) || "blue") + ")" : ink.paper}" stroke="${c}" stroke-width="${active ? 2.8 : 1.6}"/>`,
      );
      if (label !== "") this.text(label, x, y + 7, 20, c, "middle");
      return this;
    }
    action(key, label, draw) {
      this.add(
        `<g class="pen-action" role="button" tabindex="0" data-action="${esc(key)}" aria-label="${esc(label)}">`,
      );
      draw();
      this.add("</g>");
    }
    bars(
      values,
      labels,
      {
        x = 70,
        y = 300,
        w = 480,
        h = 170,
        colors = [ink.blue, ink.green, ink.purple],
        max = 1,
      } = {},
    ) {
      this.line(x, y, x + w, y);
      const gap = w / values.length;
      values.forEach((v, i) => {
        const bh = Math.max(1, (h * v) / max);
        this.box(
          x + i * gap + 12,
          y - bh,
          gap - 32,
          bh,
          colors[i % colors.length],
        );
        this.text(
          v.toFixed(2),
          x + i * gap + gap / 2,
          y - bh - 12,
          22,
          colors[i % colors.length],
          "middle",
        );
        this.text(
          labels[i],
          x + i * gap + gap / 2,
          y + 28,
          20,
          ink.pencil,
          "middle",
        );
      });
    }
    svg(title) {
      let defs = "";
      for (const [k, c] of Object.entries(ink))
        defs += `<pattern id="pen-${k}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect width="9" height="9" fill="${ink.paper}"/><path d="M1 -2 Q3 3 1 11 M5 -1 L6 10" fill="none" stroke="${c}" stroke-width="1.15" opacity=".32"/></pattern>`;
      return `<svg viewBox="0 0 640 440" role="${this.parts.some((part) => part.includes("data-action")) ? "group" : "img"}" aria-label="${esc(title)}"><defs>${defs}</defs>${this.parts.join("")}</svg>`
        .replaceAll('id="pen-', `id="sketch${this.id}-pen-`)
        .replaceAll("url(#pen-", `url(#sketch${this.id}-pen-`);
    }
  }
  class Board {
    constructor(host, scenes, state = {}) {
      this.host = host;
      this.scenes = scenes;
      this.state = state;
      this.index = -1;
      this.step = 0;
      host.classList.add("study-sketch-board");
      host.innerHTML =
        '<header class="sketch-heading"><span class="sketch-number"></span><h3></h3></header><div class="sketch-art"></div><div class="sketch-controls"><button type="button" data-sketch="back" aria-label="Previous diagram step">←</button><button type="button" data-sketch="next">Trace next step →</button><button type="button" data-sketch="play" aria-pressed="false">Play</button><span class="sketch-step"></span></div><p class="sketch-caption" aria-live="polite"></p>';
      host.addEventListener("click", (e) => {
        const button = e.target.closest("[data-sketch]");
        if (button) {
          if (button.dataset.sketch === "play") this.play();
          else this.advance(button.dataset.sketch === "back" ? -1 : 1);
          return;
        }
        const a = e.target.closest("[data-action]");
        if (a) {
          this.scenes[this.index].action?.(a.dataset.action, this.state, this);
          this.render();
          this.host
            .querySelector(`[data-action="${CSS.escape(a.dataset.action)}"]`)
            ?.focus({ preventScroll: true });
        }
      });
      host.addEventListener("keydown", (e) => {
        if (
          ["Enter", " "].includes(e.key) &&
          e.target.matches("[data-action]")
        ) {
          e.preventDefault();
          e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.stop();
      });
    }
    set(index, state = {}) {
      Object.assign(this.state, state);
      if (index !== this.index) {
        this.stop();
        this.index = index;
        this.step = this.scenes[index].initialStep?.(this.state) || 0;
      }
      this.render();
    }
    advance(d) {
      const scene = this.scenes[this.index];
      const count = scene.stepCount?.(this.state) || scene.steps || 4;
      this.step = (this.step + d + count) % count;
      scene.advance?.(this.state, this.step);
      this.render();
    }
    stop() {
      clearInterval(this.timer);
      this.timer = null;
      const b = this.host.querySelector('[data-sketch="play"]');
      if (b) {
        b.textContent = "Play";
        b.setAttribute("aria-pressed", "false");
      }
      this.state.onPlayback?.(false);
    }
    play() {
      if (this.timer) {
        this.stop();
        return;
      }
      this.timer = setInterval(() => this.advance(1), 1200);
      const b = this.host.querySelector('[data-sketch="play"]');
      b.textContent = "Pause";
      b.setAttribute("aria-pressed", "true");
      this.state.onPlayback?.(true);
    }
    render() {
      const scene = this.scenes[this.index];
      if (!scene) return;
      const p = new Pen();
      scene.draw(p, this.state, this.step);
      this.host.dataset.scene = String(this.index + 1);
      this.host.querySelector("h3").textContent = scene.title;
      this.host.querySelector(".sketch-number").textContent = String(
        this.index + 1,
      ).padStart(2, "0");
      this.host.querySelector(".sketch-art").innerHTML = p.svg(scene.title);
      alignNotes(this.host);
      this.host.querySelector(".sketch-caption").textContent =
        typeof scene.caption === "function"
          ? scene.caption(this.state, this.step)
          : scene.caption;
      this.host.querySelector(".sketch-controls").hidden = scene.steps === 1;
      this.host.querySelector(".sketch-step").textContent =
        `${this.step + 1} / ${scene.stepCount?.(this.state) || scene.steps || 4}`;
    }
  }
  function chain(p, labels, step, y = 190) {
    const gap = 560 / labels.length;
    labels.forEach((l, i) => {
      const x = 40 + i * gap;
      p.circle(
        x + gap / 2,
        y,
        27,
        i === step ? ink.red : ink.blue,
        i + 1,
        i === step,
      );
      p.wrap(
        l,
        x + 3,
        y + 60,
        Math.max(10, Math.floor(gap / 10)),
        i === step ? ink.red : ink.pencil,
        20,
      );
      if (i < labels.length - 1)
        p.arrow(x + gap / 2 + 32, y, x + gap * 1.5 - 32, y);
    });
  }
  function network(p, counts = [3, 4, 3, 1], active = 0, drop = 0) {
    const layers = counts.map((n, l) =>
      Array.from({ length: n }, (_, j) => ({
        x: 65 + (l * 510) / (counts.length - 1),
        y: 90 + ((j + 0.5) * 230) / n,
      })),
    );
    layers.slice(0, -1).forEach((layer, l) =>
      layer.forEach((a, i) =>
        layers[l + 1].forEach((b, j) => {
          if ((j + 1) / layers[l + 1].length > drop)
            p.line(
              a.x,
              a.y,
              b.x,
              b.y,
              l === active ? ink.blue : "#b8b4a6",
              l === active ? 1.7 : 0.75,
            );
        }),
      ),
    );
    layers.forEach((layer, l) =>
      layer.forEach((n, j) =>
        p.circle(
          n.x,
          n.y,
          17,
          l === active ? ink.red : ink.blue,
          "",
          l === active && (j + 1) / layer.length > drop,
        ),
      ),
    );
    counts.forEach((_, i) =>
      p.text(
        i === 0 ? "inputs" : i === counts.length - 1 ? "output" : "hidden",
        layers[i][0].x,
        355,
        21,
        ink.pencil,
        "middle",
      ),
    );
    return layers;
  }
  function alignNotes(root) {
    root.querySelectorAll(".pen-note").forEach((group) => {
      const text = group.querySelector("text"),
        path = group.querySelector("path");
      const box = text.getBBox(),
        y = box.y + box.height * 0.55;
      path.setAttribute(
        "d",
        `M${box.x - 3} ${y} Q${box.x + box.width * 0.5} ${y + 1} ${box.x + box.width + 3} ${y - 0.4}`,
      );
      path.setAttribute("stroke-width", String(box.height * 0.72));
    });
  }
  document.fonts.ready.then(() => alignNotes(document));
  window.StudySketch = { Pen, Board, ink, chain, network, esc, alignNotes };
})();
