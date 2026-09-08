/* Connect the existing mobile curriculum links; keep their order and hit areas. */
(() => {
  const root = document.querySelector(".mobile-universe");
  if (!root) return;
  const ns = "http://www.w3.org/2000/svg";
  const sky = document.createElement("div");
  sky.className = "mobile-sky";
  sky.setAttribute("aria-hidden", "true");
  sky.innerHTML = `<svg viewBox="0 0 360 128" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g class="mobile-sun" stroke="#ab7634" stroke-width="1.6"><path fill="#edd186" d="M66 31C100 28 111 78 81 91C46 105 23 72 40 47Q48 32 66 31Z"/><path d="M46 48Q61 30 83 45M39 63Q40 85 64 89M64 20l1-11M92 30l7-10M108 51l12-3M108 80l11 5M87 99l5 11M60 103l-2 11M36 91l-8 8M28 68H16M33 41l-9-6"/></g>
    <g stroke="#597c91" opacity=".8"><path d="M128 82l44-44 35 20 24-35M129 84l43-44 34 20"/><g fill="#597c91"><circle cx="128" cy="82" r="2.5"/><circle cx="172" cy="38" r="3"/><circle cx="207" cy="58" r="2.5"/><circle cx="231" cy="23" r="2"/></g></g>
    <g class="mobile-ufo" stroke="#756184" stroke-width="1.6"><path fill="#ded5e4" d="M273 60Q272 31 297 34Q313 39 313 59M256 62Q285 43 328 60Q330 75 287 77Q264 75 256 62Z"/><path d="M257 62Q287 68 327 60M277 79l-11 24m36-24 14 25"/><circle cx="274" cy="70" r="1"/><circle cx="288" cy="71" r="1"/><circle cx="303" cy="69" r="1"/></g>
    <g class="mobile-comet" stroke="#a47640" stroke-width="1.5"><path d="M137 111l40-12m-29 16 33-12m-16 14 18-10"/><circle cx="187" cy="103" r="4" fill="#e7cd88"/></g>
    <path stroke="#85826b" d="M340 29v8m-4-4h8M17 111v6m-3-3h6M247 109v6m-3-3h6"/>
  </svg>`;
  root.before(sky);
  const groups = [...root.querySelectorAll(".mobile-group")].map((group) => {
    const svg = document.createElementNS(ns, "svg");
    svg.classList.add("mobile-star-route");
    svg.setAttribute("aria-hidden", "true");
    group.prepend(svg);
    return { group, svg };
  });
  let frame;
  function draw() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() =>
      groups.forEach(({ group, svg }) => {
        const box = group.getBoundingClientRect();
        if (!box.width) return;
        const points = [...group.querySelectorAll(".symbol-wrap")].map(
          (node) => {
            const r = node.getBoundingClientRect();
            return [r.x - box.x + r.width / 2, r.y - box.y + r.height / 2];
          },
        );
        svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
        svg.innerHTML = points
          .map(([x, y], i) => {
            const previous = points[i - 1];
            return `${previous ? `<path d="M${previous[0]} ${previous[1]} Q${(previous[0] + x) / 2 + 4} ${(previous[1] + y) / 2 - 7} ${x} ${y}"/>` : ""}<circle cx="${x}" cy="${y}" r="5"/>`;
          })
          .join("");
      }),
    );
  }
  const observer = new ResizeObserver(draw);
  groups.forEach(({ group }) => observer.observe(group));
  document.fonts.ready.then(draw);
  draw();
})();
