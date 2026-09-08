/* One reading position below the pinned illustration on phones.
 * Desktop observers keep their original options and behaviour. */
(() => {
  const phone = () => innerWidth <= 900;
  const visual = () => document.querySelector(".statml-visual,.visual-stage");
  window.statmlReadingLine = (desktopFraction = 0.45) => {
    if (!phone()) return innerHeight * desktopFraction;
    const sheet = innerHeight > 500 ? visual() : null;
    const bottom = sheet
      ? Math.max(0, parseFloat(getComputedStyle(sheet).top) || 0) +
        sheet.getBoundingClientRect().height
      : 56;
    return Math.min(innerHeight - 28, bottom + 64);
  };
  /* The callbacks in the older lessons consume target/isIntersecting/ratio.
   * Select one section at the reading line rather than requiring a fraction
   * of a long section to fit in the small area below the illustration. */
  window.StatMLStageObserver = class {
    constructor(callback, options) {
      this.callback = callback;
      this.targets = new Set();
      this.native = new IntersectionObserver((entries) => {
        if (!phone()) callback(entries, this);
        else this.schedule();
      }, options);
      this.schedule = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = 0;
          this.update();
        });
      };
      this.resize = new ResizeObserver(this.schedule);
      addEventListener("scroll", this.schedule, { passive: true });
      addEventListener("resize", this.schedule, { passive: true });
    }
    observe(target) {
      this.targets.add(target);
      this.native.observe(target);
      this.resize.observe(target);
      this.schedule();
    }
    unobserve(target) {
      this.targets.delete(target);
      this.native.unobserve(target);
      this.resize.unobserve(target);
      this.schedule();
    }
    disconnect() {
      this.native.disconnect();
      this.resize.disconnect();
      this.targets.clear();
      cancelAnimationFrame(this.frame);
      removeEventListener("scroll", this.schedule);
      removeEventListener("resize", this.schedule);
    }
    takeRecords() {
      return this.native.takeRecords();
    }
    update() {
      if (!phone()) {
        this.current = null;
        return;
      }
      const targets = [...this.targets].filter((el) => el.isConnected);
      const line = window.statmlReadingLine();
      let chosen = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) chosen = target;
        else break;
      }
      if (!chosen || chosen === this.current) return;
      this.current = chosen;
      this.callback(
        [{ target: chosen, isIntersecting: true, intersectionRatio: 1 }],
        this,
      );
    }
  };
  addEventListener("DOMContentLoaded", () => {
    document.body.dataset.mobileModule = location.pathname
      .split("/")
      .pop()
      .replace(".html", "");
    const sheet = visual();
    if (!sheet) return;
    if (document.body.dataset.mobileModule === "hierarchical-clustering") {
      const hint = document.createElement("p");
      hint.className = "mobile-sheet-hint";
      hint.textContent = "Scroll the sketch for the matrix & merge controls ↓";
      sheet.prepend(hint);
      sheet.querySelector(".viz-toolbar-note").textContent =
        "Tap or hover a point to trace the same sample across both views.";
    }
    sheet.querySelectorAll("#viz-table .overflow-x-auto").forEach((table) => {
      const hint = document.createElement("p");
      hint.className = "mobile-table-hint";
      hint.textContent = "Swipe the table to see all columns →";
      table.before(hint);
      table.tabIndex = 0;
      table.setAttribute("role", "region");
      table.setAttribute(
        "aria-label",
        "ANOVA output, scroll horizontally for all columns",
      );
    });
    function measure() {
      const top = Math.max(0, parseFloat(getComputedStyle(sheet).top) || 0);
      document.documentElement.style.setProperty(
        "--mobile-visual-offset",
        `${sheet.getBoundingClientRect().height + top}px`,
      );
    }
    new ResizeObserver(measure).observe(sheet);
    // Legacy canvases listen for window resize, while fonts and mobile sheets
    // can change their available space without a viewport resize.
    let resizeFrame;
    const dimensions = new WeakMap();
    const canvases = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const size = `${Math.round(entry.contentRect.width)}:${Math.round(entry.contentRect.height)}`;
        if (dimensions.get(entry.target) !== size) {
          dimensions.set(entry.target, size);
          changed = true;
        }
      }
      if (changed) {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() =>
          dispatchEvent(new Event("resize")),
        );
      }
    });
    sheet
      .querySelectorAll("canvas")
      .forEach((canvas) => canvases.observe(canvas.parentElement));
    addEventListener("resize", measure, { passive: true });
    measure();
  });
})();
