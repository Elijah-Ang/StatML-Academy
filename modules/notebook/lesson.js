import { regression } from "./regression.js";
import { clustering } from "./clustering.js";
import { bayes } from "./bayes.js";
import { metrics } from "./metrics.js";
const slug = document.body.dataset.module;
const modules = {
  "simple-linear-regression": regression,
  kmeans: clustering,
  "naive-bayes": bayes,
  "evaluation-metrics": metrics,
};
const factory =
  modules[slug] ||
  (slug === "association-rules" &&
    (await import("./association-rules/topic.js")).create) ||
  (await import("./catalog.js").then(async ({ catalog }) => {
    const engine = catalog[slug]?.engine;
    if (!engine) throw new Error("Unknown notebook module: " + slug);
    const module = await import("./" + engine + ".js");
    return (host) => module.create(host, slug);
  }));
const controller = factory(document.getElementById("lab-content"));
document.body.classList.add("is-interactive");
const stages = [...document.querySelectorAll("article .stage")];
const picker = document.getElementById("stage-select"),
  progress = document.querySelector(".stage-progress");
const dialog = document.querySelector(".lab-dialog"),
  panel = document.getElementById("lab-panel"),
  home = document.querySelector(".lab-home");
let active = -1,
  frame = 0,
  returnFocus,
  readingY = 0,
  transition;
const reduced = matchMedia("(prefers-reduced-motion:reduce)");
function setStage(index) {
  if (!Number.isInteger(index) || index < 0 || index >= stages.length || active === index) return;
  const prior = active;
  active = index;
  picker.value = String(index);
  progress.textContent = `${index + 1} / ${stages.length}`;
  stages.forEach((el, i) => el.classList.toggle("is-active", i === index));
  const title = stages[index].dataset.title || stages[index]
    .querySelector(".stage-label")
    .textContent.slice(2)
    .trim();
  document.getElementById("lab-title").textContent = title;
  document.getElementById("lab-stage").textContent = String(index + 1).padStart(
    2,
    "0",
  );
  document.getElementById("mobile-summary").textContent =
    stages[index].querySelector("h2").textContent;
  controller.stage(index);
  transition?.cancel();
  const plot = panel.querySelector(".plot");
  if (
    prior >= 0 &&
    !reduced.matches &&
    !document.hidden &&
    plot?.getBoundingClientRect().width > 0
  )
    transition = plot.animate([{ opacity: 0.55 }, { opacity: 1 }], {
      duration: 180,
      easing: "ease-out",
    });
}
function sync() {
  frame = 0;
  if (dialog.open) return;
  const line =
    document.querySelector(".lesson-toolbar").getBoundingClientRect().bottom +
    (innerWidth <= 900
      ? document.querySelector(".mobile-lab-bar").offsetHeight
      : 0) +
    35;
  let index = 0;
  stages.forEach((s, i) => {
    if (s.getBoundingClientRect().top <= line) index = i;
  });
  if (
    scrollY > 0 &&
    innerHeight + scrollY >= document.documentElement.scrollHeight - 2
  )
    index = stages.length - 1;
  setStage(index);
}
function go(index) {
  if (!Number.isInteger(index) || index < 0 || index >= stages.length) return;
  const hash = `#stage-${index + 1}`;
  if (location.hash !== hash) history.pushState(null, "", hash);
  stages[index].scrollIntoView({
    block: "start",
    behavior: reduced.matches ? "instant" : "smooth",
  });
}
function openLab(trigger) {
  if (innerWidth > 900) {
    panel.scrollIntoView({
      block: "nearest",
      behavior: reduced.matches ? "instant" : "smooth",
    });
    panel.querySelector("#lab-content input, #lab-content select, #lab-content button")?.focus({ preventScroll: true });
    return;
  }
  returnFocus = trigger;
  readingY = scrollY;
  dialog.querySelector(".dialog-body").append(panel);
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = "hidden";
  controller.resize();
}
function restoreReading() {
  if (panel.parentElement === home) return;
  controller.pause?.();
  home.append(panel);
  document.body.style.overflow = "";
  window.scrollTo({ top: readingY, behavior: "instant" });
  returnFocus?.focus({ preventScroll: true });
  controller.resize();
}
function closeLab() {
  if (dialog.open) dialog.close();
  restoreReading();
}
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeLab();
});
dialog.addEventListener("close", restoreReading);
document.querySelector("[data-close-lab]").onclick = closeLab;
picker.addEventListener("change", () => go(+picker.value));
document.querySelector("[data-open-lab]").onclick = (e) =>
  openLab(e.currentTarget);
document.querySelectorAll("[data-explore-stage]").forEach(
  (b) =>
    (b.onclick = () => {
      setStage(+b.dataset.exploreStage);
      openLab(b);
    }),
);
document.querySelector("[data-reset]").onclick = () => controller.reset();
document.querySelectorAll("article .question .quiz-option").forEach(
  (b) =>
    (b.onclick = () => {
      const q = b.closest(".question");
      q.querySelectorAll(".quiz-option").forEach(
        (x) => (x.dataset.chosen = String(x === b)),
      );
      q.querySelector(".feedback").textContent =
        (b.dataset.correct === "true" ? "Yes. " : "Try again. ") +
        b.dataset.feedback;
    }),
);
addEventListener(
  "scroll",
  () => {
    if (!frame) frame = requestAnimationFrame(sync);
  },
  { passive: true },
);
addEventListener("resize", () => {
  if (innerWidth > 900 && dialog.open) closeLab();
  controller.resize();
  sync();
});
const resize = new ResizeObserver(() => controller.resize());
resize.observe(panel);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    controller.pause?.();
    transition?.finish();
  }
});
setStage(0);
sync();
window.__notebook = {
  slug,
  controller,
  go,
  setStage,
  get stage() {
    return active;
  },
  get stages() {
    return stages.length;
  },
};

reduced.addEventListener("change", () => transition?.finish());

addEventListener("popstate", () => requestAnimationFrame(sync));
document.fonts.ready.then(sync);
