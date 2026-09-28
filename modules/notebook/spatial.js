// Shared geometry only: every position is supplied by the topic's computation.
import { palette, fmt, pathFrom } from "./ui.js";
export const ink = "#344a48",
  paper = "#fffdf5",
  grid = "#dce1d2";
export function caption(s, key, text, y = 23, color = ink) {
  const limit = Math.max(26, Math.floor((s.w - 28) / 7.2));
  const words = text.split(" "),
    lines = [""];
  for (const word of words) {
    if ((lines.at(-1) + word).length > limit) lines.push("");
    lines[lines.length - 1] += (lines.at(-1) ? " " : "") + word;
  }
  lines.forEach((line, i) =>
    s.text(key + i, 14, y + i * 22, line, { "font-size": 15, fill: color }),
  );
  const bottom = y + (lines.length - 1) * 22 + 10;
  if (bottom > s.h) {
    s.h = bottom;
    s.svg.setAttribute("viewBox", `0 0 ${s.w} ${s.h}`);
  }
  return y + lines.length * 22;
}
export function arrow(s, key, from, to, color = palette[1], width = 2) {
  s.line(key + "-shaft", ...from, ...to, color, width);
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]),
    r = 7;
  s.path(
    key + "-tip",
    `M${to[0] - r * Math.cos(a - 0.5)},${to[1] - r * Math.sin(a - 0.5)} L${to} L${to[0] - r * Math.cos(a + 0.5)},${to[1] - r * Math.sin(a + 0.5)}`,
    color,
    width,
  );
}
export function frame(s, key, box, xd, yd, labels = [], ticks = true) {
  const { x: l, y: t, w, h } = box,
    r = l + w,
    b = t + h;
  const x = (v) => l + ((v - xd[0]) / (xd[1] - xd[0])) * w,
    y = (v) => b - ((v - yd[0]) / (yd[1] - yd[0])) * h;
  if (ticks)
    for (let i = 0; i <= 2; i++) {
      const xv = xd[0] + ((xd[1] - xd[0]) * i) / 2,
        yv = yd[0] + ((yd[1] - yd[0]) * i) / 2;
      s.line(key + "-grid" + i, l, y(yv), r, y(yv), grid, 1);
      s.text(key + "-xt" + i, x(xv), b + 17, String(+xv.toFixed(2)), {
        "text-anchor": i === 0 ? "start" : i === 2 ? "end" : "middle",
        "font-size": 12,
      });
      s.text(key + "-yt" + i, l - 7, y(yv) + 4, String(+yv.toFixed(2)), {
        "text-anchor": "end",
        "font-size": 12,
      });
    }
  s.line(key + "-x", l, b, r, b, ink, 1);
  s.line(key + "-y", l, t, l, b, ink, 1);
  if (labels[0])
    s.text(key + "-xl", (l + r) / 2, b + 35, labels[0], {
      "text-anchor": "middle",
      "font-size": 14,
    });
  if (labels[1]) s.text(key + "-yl", l, t - 10, labels[1], { "font-size": 14 });
  return { x, y, l, r, t, b, w, h };
}
export function line(
  s,
  P,
  key,
  coords,
  color = palette[0],
  width = 2,
  dash = null,
) {
  s.path(
    key,
    pathFrom(coords.map(([x, y], i) => P(key + i, x, y))),
    color,
    width,
    "none",
    { "stroke-dasharray": dash },
  );
}
export function dot(s, P, key, x, y, cls, selected = false, action = null) {
  const p = P(key, x, y),
    color = palette[cls ? 1 : 0];
  if (action) s.mark(key, ...p, color, action, selected, action);
  else
    s.circle(key, ...p, selected ? 6 : 3.3, color, {
      stroke: paper,
      "stroke-width": selected ? 2 : 0.7,
    });
  // Shape, as well as color, distinguishes classes.
  if (cls)
    s.path(
      key + "-shape",
      `M${p[0] - 2},${p[1] - 2}l4,4m-4,0l4,-4`,
      paper,
      1.1,
    );
}
export function heat(s, key, box, fn, n = 20) {
  const dx = box.w / n,
    dy = box.h / n;
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const v = Math.max(
        0,
        Math.min(1, fn(-2.5 + (5 * (i + 0.5)) / n, 2.5 - (5 * (j + 0.5)) / n)),
      );
      s.rect(
        key + i + "-" + j,
        box.x + i * dx,
        box.y + j * dy,
        dx + 0.5,
        dy + 0.5,
        v >= 0.5 ? palette[1] : palette[0],
        { opacity: 0.09 + 0.27 * Math.abs(v - 0.5) * 2, rx: 0 },
      );
    }
}
export function mesh(
  s,
  P,
  key,
  fn,
  {
    lo = -2.4,
    hi = 2.4,
    yDomain = [-5, 8],
    angle = 35,
    top = 60,
    height = 270,
  } = {},
) {
  const rad = (angle * Math.PI) / 180,
    c = Math.cos(rad),
    sn = Math.sin(rad),
    span = hi - lo;
  const project = (x, z, v) => [
    s.w / 2 +
      (((x - (hi + lo) / 2) * c - (z - (hi + lo) / 2) * sn) / (span * 1.48)) *
        (s.w - 62),
    top +
      height * 0.72 +
      (((x - (hi + lo) / 2) * sn + (z - (hi + lo) / 2) * c) / span) *
        height *
        0.38 -
      ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * height * 0.45,
  ];
  const base = yDomain[0];
  for (let i = 0; i <= 8; i++) {
    const v = lo + (span * i) / 8;
    line(
      s,
      P,
      key + "-floorX" + i,
      [project(v, lo, base), project(v, hi, base)],
      grid,
      1,
    );
    line(
      s,
      P,
      key + "-floorZ" + i,
      [project(lo, v, base), project(hi, v, base)],
      grid,
      1,
    );
  }
  const steps = 20,
    xs = Array.from({ length: steps + 1 }, (_, i) => lo + (span * i) / steps);
  // A thin, transparent sheet retains the point cloud and residual depth cues.
  const corners = [
    [lo, lo],
    [hi, lo],
    [hi, hi],
    [lo, hi],
  ].map(([x, z]) => project(x, z, fn(x, z)));
  s.path(
    key + "-sheet",
    pathFrom(corners) + "Z",
    palette[2],
    1,
    palette[2] + "12",
  );
  for (let j = 0; j <= 10; j++) {
    const v = lo + (span * j) / 10;
    line(
      s,
      P,
      key + "-meshX" + j,
      xs.map((x) => project(x, v, fn(x, v))),
      palette[2],
      0.8,
    );
    line(
      s,
      P,
      key + "-meshZ" + j,
      xs.map((z) => project(v, z, fn(v, z))),
      palette[2],
      0.8,
    );
  }
  const origin = project(lo, lo, base),
    endx = project(hi, lo, base),
    endz = project(lo, hi, base),
    endy = project(lo, lo, yDomain[1]);
  arrow(s, key + "-ax", origin, endx, ink, 1.2);
  arrow(s, key + "-az", origin, endz, ink, 1.2);
  arrow(s, key + "-ay", origin, endy, ink, 1.2);
  s.text(key + "-labelX", endx[0], endx[1] + 19, "x₁", {
    "font-size": 16,
    "text-anchor": "middle",
  });
  s.text(key + "-labelZ", endz[0], endz[1] + 19, "x₂", {
    "font-size": 16,
    "text-anchor": "middle",
  });
  s.text(key + "-labelY", endy[0], endy[1] - 8, "y", {
    "font-size": 16,
    "text-anchor": "middle",
  });
  return project;
}
export function cells(
  s,
  key,
  values,
  x,
  y,
  size,
  { selected = -1, colors = true } = {},
) {
  values.forEach((row, r) =>
    row.forEach((v, c) => {
      const on = r * row.length + c === selected;
      s.rect(
        key + r + "-" + c,
        x + c * size,
        y + r * size,
        size - 2,
        size - 2,
        colors
          ? v > 0
            ? palette[0] + "60"
            : v < 0
              ? palette[1] + "60"
              : "#eaece0"
          : paper,
        { stroke: on ? palette[3] : grid, "stroke-width": on ? 3 : 1, rx: 2 },
      );
      s.text(
        key + "v" + r + "-" + c,
        x + (c + 0.5) * size,
        y + (r + 0.65) * size,
        fmt(Object.is(v, -0) ? 0 : v, Number.isInteger(v) ? 0 : 1),
        { "font-size": Math.min(13, size * 0.52), "text-anchor": "middle" },
      );
    }),
  );
}
export function confusionDots(s, P, rows, predict, { top = 99 } = {}) {
  const w = (s.w - 70) / 2,
    h = 115;
  const names = [
    "True negative",
    "False positive",
    "False negative",
    "True positive",
  ];
  for (let k = 0; k < 4; k++) {
    const x = 30 + (k % 2) * (w + 10),
      y = top + Math.floor(k / 2) * (h + 42);
    s.rect(
      "conf-cell" + k,
      x,
      y,
      w,
      h,
      k === 0 || k === 3 ? palette[2] + "12" : palette[1] + "12",
      { stroke: grid },
    );
    const members = rows.filter((r) => r.y * 2 + +(predict(r) >= 0.5) === k);
    s.text("conf-name" + k, x + 5, y - 9, names[k], { "font-size": 13 });
    members.forEach((r, i) =>
      dot(
        s,
        P,
        "case" + r.id,
        x + 14 + (i % 6) * ((w - 26) / 6),
        y + 19 + Math.floor(i / 6) * 21,
        r.y,
        false,
      ),
    );
    s.text("conf-count" + k, x + w - 8, y + h - 10, members.length + " rows", {
      "font-size": 13,
      "text-anchor": "end",
    });
  }
}
