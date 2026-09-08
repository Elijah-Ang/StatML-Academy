/* Bind the original lesson controls to the illustrated notebook. The React
   narrative remains the source of truth for its sliders and selectors. */
(() => {
  const $ = (s) => document.querySelector(s);
  class DeepBoard extends StudySketch.Board {
    constructor(host, scenes, state) {
      super(host, scenes, state);
      host.classList.add("deep-rich-board");
      const tools = document.createElement("div");
      tools.className = "deep-scene-tools";
      tools.setAttribute("role", "group");
      tools.setAttribute("aria-label", "Diagram options");
      host.querySelector(".sketch-heading").after(tools);
      const inspect = document.createElement("button");
      inspect.type = "button";
      inspect.className = "deep-inspect";
      inspect.textContent = "Enlarge";
      inspect.setAttribute("aria-label", "Enlarge the diagram");
      host.querySelector(".sketch-heading").append(inspect);
      inspect.onclick = () => this.enlarge();
      host.addEventListener("click", (e) => {
        const b = e.target.closest("[data-deep-tool]");
        if (b) this.choose(b.dataset.deepTool);
      });
    }
    choose(key) {
      this.stop();
      const [name, value] = key.split(":");
      if (name === "training") {
        this.state.weight = 0;
        this.state.learnStep = 0;
        this.state.lastUpdate = null;
        this.step = 0;
      } else this.state[name] = value;
      this.render();
    }
    render() {
      if (this.index < 0) return;
      const scene = this.scenes[this.index],
        count = scene.stepCount?.(this.state) || scene.steps;
      this.step %= count;
      super.render();
      const area = this.host.querySelector(".deep-scene-tools");
      if (area) {
        area.innerHTML = (
          scene.showTools?.(this.state) === false ? [] : scene.tools || []
        )
          .map((o) => {
            const [key, value] = o.key.split(":");
            return `<button type="button" data-deep-tool="${o.key}" aria-pressed="${this.state[key] === value}">${o.label}</button>`;
          })
          .join("");
        area.hidden = !area.children.length;
      }
      this.renderPopup();
    }
    renderPopup() {
      if (!this.popup?.open) return;
      const focus = document.activeElement,
        attr = ["data-action", "data-sketch", "data-deep-tool"].find((a) =>
          focus?.hasAttribute(a),
        ),
        value = attr && focus.getAttribute(attr);
      const clone = this.host.cloneNode(true);
      clone.querySelector(".deep-inspect")?.remove();
      clone.querySelectorAll(".hw-rough-frame").forEach((e) => e.remove());
      // The modal gets unique paint/clip IDs; both views remain valid SVG.
      let html = clone.innerHTML
        .replaceAll(/id="([^"]+)"/g, 'id="expanded-$1"')
        .replaceAll(/url\(#([^\)]+)\)/g, "url(#expanded-$1)");
      this.popup.querySelector(".deep-expanded-content").innerHTML = html;
      StudySketch.alignNotes(this.popup);
      if (attr)
        this.popup
          .querySelector(`[${attr}="${CSS.escape(value)}"]`)
          ?.focus({ preventScroll: true });
    }
    enlarge() {
      if (!this.popup) {
        this.popup = document.createElement("dialog");
        this.popup.className = "deep-zoom-dialog";
        this.popup.setAttribute("aria-label", "Enlarged interactive diagram");
        this.popup.innerHTML =
          '<div class="deep-zoom-header"><span>Inspect the notebook</span><button type="button" data-zoom="fit">Fit to screen</button><button type="button" data-zoom="close">Close ×</button></div><p class="deep-zoom-hint">Scroll sideways, or choose Fit to screen.</p><div class="deep-expanded-content study-sketch-board deep-rich-board"></div>';
        document.body.append(this.popup);
        this.popup.addEventListener("click", (e) => {
          const zoom = e.target.closest("[data-zoom]");
          if (zoom) {
            if (zoom.dataset.zoom === "close") this.popup.close();
            else {
              const fit = this.popup.classList.toggle("is-fit");
              zoom.textContent = fit ? "Actual size" : "Fit to screen";
            }
            return;
          }
          const tool = e.target.closest("[data-deep-tool]");
          if (tool) {
            this.choose(tool.dataset.deepTool);
            return;
          }
          const control = e.target.closest("[data-sketch]");
          if (control) {
            control.dataset.sketch === "play"
              ? this.play()
              : this.advance(control.dataset.sketch === "back" ? -1 : 1);
            this.renderPopup();
            return;
          }
          const action = e.target.closest("[data-action]");
          if (action) {
            this.scenes[this.index].action?.(
              action.dataset.action,
              this.state,
              this,
            );
            this.render();
          }
        });
        this.popup.addEventListener("keydown", (e) => {
          if (
            ["Enter", " "].includes(e.key) &&
            e.target.matches("[data-action]")
          ) {
            e.preventDefault();
            e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
        });
        this.popup.addEventListener("close", () => {
          this.stop();
          this.popup.querySelector(".deep-expanded-content").replaceChildren();
          document.body.style.overflow = this.previousOverflow;
          this.host
            .querySelector(".deep-inspect")
            .focus({ preventScroll: true });
        });
      }
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      this.popup.showModal();
      this.renderPopup();
    }
  }
  function boot() {
    const host = $(".visual-stage .canvas-wrap");
    if (!host) return false;
    const board = new DeepBoard(host, DeepSketchScenes, {
      learnStep: 0,
      weight: 0,
      taskView: "classify",
      leak: "no",
      filter: "vertical",
      regularizer: "augment",
      transfer: "freeze",
      deploy: "correct",
    });
    const state = board.state;
    let signature;
    const number = (selector, fallback) =>
      $(selector) ? Number($(selector).value) : fallback;
    function setInput(selector, value) {
      const el = $(selector);
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      ).set.call(el, String(value));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    state.onEpoch = (e) => {
      state.epoch = e;
      setInput(".epoch-control input", e);
    };
    function sync() {
      let index = 0;
      const line = window.statmlReadingLine(.45);
      document.querySelectorAll(".lesson-step").forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) index = i;
      });
      const next = {
        biased:
          $(".control-panel .toggle-button")?.getAttribute("aria-pressed") ===
          "true",
        tensorMode:
          $('.tensor-control button[aria-pressed="true"]')
            ?.textContent.trim()
            .toLowerCase() || "image",
        earWeight: number(".sliders label:nth-of-type(1) input", 1.2),
        furWeight: number(".sliders label:nth-of-type(2) input", 0.6),
        backgroundWeight: number(".sliders label:nth-of-type(3) input", 0.2),
        neuronBias: number(".sliders label:nth-of-type(4) input", -0.2),
        learningRate: number(".control-stack .range-row input", 0.5),
        epoch: number(".epoch-control input", 12),
        architecture:
          $('.architecture-tabs button[aria-pressed="true"] span')
            ?.textContent.trim()
            .toLowerCase() || "cnn",
        threshold: number(".threshold-control input", 0.5),
      };
      const key = JSON.stringify([index, next, state.learnStep]);
      if (key === signature) return;
      signature = key;
      board.set(index, next);
    }
    let raf = 0;
    const queue = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          sync();
        });
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    document.addEventListener("input", (e) => {
      if (!host.contains(e.target) && !board.popup?.contains(e.target)) queue();
    });
    document.addEventListener("click", (e) => {
      if (host.contains(e.target) || board.popup?.contains(e.target)) return;
      if (e.target.closest(".control-stack button")) {
        DeepSketchMath.applyUpdate(state);
        signature = undefined;
      }
      queue();
    });
    const observer = new MutationObserver(queue);
    for (const el of document.querySelectorAll(
      ".chapter-dots,.stage-header,.architecture-tabs,.tensor-control",
    ))
      observer.observe(el, {
        attributes: true,
        subtree: true,
        childList: true,
      });
    const hero = $(".hero-signal");
    if (hero) {
      const p = new StudySketch.Pen();
      DeepSketchArt.picture(p, 25, 70, 235, 160, {
        animal: "cat",
        place: "window",
      });
      p.arrow(276, 151, 333, 151);
      for (let i = 0; i < 3; i++) {
        p.box(353 + i * 20, 85 - i * 10, 145, 156, StudySketch.ink.blue, false);
      }
      p.text("learned", 381, 135, 25);
      p.text("features", 382, 171, 25);
      p.arrow(538, 153, 585, 153);
      p.text("cat", 555, 207, 26, StudySketch.ink.red);
      p.note("data → learned features → predictions", 34, 307);
      hero.innerHTML = p.svg(
        "A cat photograph becomes learned features and a class prediction",
      );
      StudySketch.alignNotes(hero);
    }
    const nesting = $(".nesting");
    if (nesting) {
      const p = new StudySketch.Pen();
      DeepSketchArt.scope(p);
      nesting.classList.add("deep-scope-sketch");
      nesting.innerHTML = p.svg(
        "Deep learning is a subset of machine learning, which is a subset of artificial intelligence.",
      );
      StudySketch.alignNotes(nesting);
    }
    sync();
    window.__deepSketch = { board, sync };
    return true;
  }
  if (!boot()) {
    const observer = new MutationObserver(() => {
      if (boot()) observer.disconnect();
    });
    observer.observe(document.getElementById("root") || document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
